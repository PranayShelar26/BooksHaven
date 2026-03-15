import json
from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.http import JsonResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Book, Loan


def _json_body(request):
    try:
        raw = request.body.decode("utf-8") or "{}"
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def api_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"ok": False, "message": "Authentication required."}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"ok": False, "message": "Authentication required."}, status=401)
        if not request.user.is_staff:
            return JsonResponse({"ok": False, "message": "Admin access required."}, status=403)
        return view_func(request, *args, **kwargs)
    return wrapper


# ----------------------------
# Auth APIs
# ----------------------------

@csrf_exempt
def auth_register(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)

    username = (body.get("username") or "").strip()
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""

    if not username or not password:
        return JsonResponse({"ok": False, "message": "username and password are required."}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"ok": False, "message": "Username already exists."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    return JsonResponse({
        "ok": True,
        "message": "Registered successfully.",
        "user": {"id": user.id, "username": user.username, "email": user.email},
    })


@csrf_exempt
def auth_login(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)

    username = (body.get("username") or "").strip()
    password = body.get("password") or ""

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"ok": False, "message": "Invalid credentials."}, status=401)

    login(request, user)  # session cookie
    return JsonResponse({
        "ok": True,
        "message": "Logged in.",
        "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_staff},
    })


@csrf_exempt
def auth_logout(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    logout(request)
    return JsonResponse({"ok": True, "message": "Logged out."})


def auth_me(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    if not request.user.is_authenticated:
        return JsonResponse({"ok": True, "authenticated": False, "user": None})

    return JsonResponse({
        "ok": True,
        "authenticated": True,
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_admin": request.user.is_staff,
        },
    })


# ----------------------------
# Books APIs (public)
# ----------------------------

def get_books(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    q = (request.GET.get("q") or "").strip()
    category = (request.GET.get("category") or "").strip()
    sort = (request.GET.get("sort") or "").strip()  # optional: title/created_at

    qs = Book.objects.all()

    if q:
        qs = qs.filter(title__icontains=q) | qs.filter(author__icontains=q) | qs.filter(isbn__icontains=q)

    if category:
        qs = qs.filter(category__iexact=category)

    if sort == "title":
        qs = qs.order_by("title")
    else:
        qs = qs.order_by("-created_at", "-id")  # default: newest first

    data = []
    for b in qs:
        data.append({
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "isbn": b.isbn,
            "category": b.category,
            "description": b.description,
            "total_copies": b.total_copies,
            "available_copies": b.available_copies,
            "status": b.status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })

    return JsonResponse(data, safe=False)


def get_book_detail(request, book_id: int):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    b = get_object_or_404(Book, pk=book_id)
    return JsonResponse({
        "id": b.id,
        "title": b.title,
        "author": b.author,
        "isbn": b.isbn,
        "category": b.category,
        "description": b.description,
        "total_copies": b.total_copies,
        "available_copies": b.available_copies,
        "status": b.status,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    })


# ----------------------------
# Loans APIs (per-user)
# ----------------------------

@csrf_exempt
@api_login_required
@transaction.atomic
def borrow_book(request, book_id: int):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    book = get_object_or_404(Book.objects.select_for_update(), pk=book_id)

    if book.available_copies <= 0:
        return JsonResponse({"ok": False, "message": "Book not available."}, status=400)

    today = timezone.localdate()
    due_date = today + timedelta(days=14)

    loan = Loan.objects.create(
        user=request.user,
        book=book,
        borrow_date=today,
        due_date=due_date,
        return_date=None,
    )

    book.available_copies -= 1
    book.save(update_fields=["available_copies"])

    return JsonResponse({
        "ok": True,
        "message": "Borrowed successfully.",
        "loan_id": loan.id,
        "book_id": book.id,
        "available_copies": book.available_copies,
        "due_date": loan.due_date.isoformat(),
    })


@api_login_required
def my_loans_current(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    loans = (
        Loan.objects.filter(user=request.user, return_date__isnull=True)
        .select_related("book")
        .order_by("-borrow_date", "-id")
    )

    data = []
    for l in loans:
        data.append({
            "id": l.id,
            "borrow_date": l.borrow_date.isoformat(),
            "due_date": l.due_date.isoformat(),
            "return_date": None,
            "book": {
                "id": l.book.id,
                "title": l.book.title,
                "author": l.book.author,
                "isbn": l.book.isbn,
                "category": l.book.category,
                "status": l.book.status,
            },
        })
    return JsonResponse(data, safe=False)


@api_login_required
def my_loans_history(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    loans = (
        Loan.objects.filter(user=request.user, return_date__isnull=False)
        .select_related("book")
        .order_by("-return_date", "-id")
    )

    data = []
    for l in loans:
        data.append({
            "id": l.id,
            "borrow_date": l.borrow_date.isoformat(),
            "due_date": l.due_date.isoformat(),
            "return_date": l.return_date.isoformat() if l.return_date else None,
            "book": {
                "id": l.book.id,
                "title": l.book.title,
                "author": l.book.author,
                "isbn": l.book.isbn,
                "category": l.book.category,
                "status": l.book.status,
            },
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
@api_login_required
@transaction.atomic
def return_loan(request, loan_id: int):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    loan = get_object_or_404(
        Loan.objects.select_for_update().select_related("book"),
        pk=loan_id,
        user=request.user,
    )

    if loan.return_date is not None:
        return JsonResponse({"ok": False, "message": "This loan is already returned."}, status=400)

    today = timezone.localdate()
    loan.return_date = today
    loan.save(update_fields=["return_date"])

    book = loan.book
    book.available_copies = min(book.total_copies, book.available_copies + 1)
    book.save(update_fields=["available_copies"])

    return JsonResponse({
        "ok": True,
        "message": "Returned successfully.",
        "loan_id": loan.id,
        "book_id": book.id,
        "available_copies": book.available_copies,
    })


# ----------------------------
# Admin APIs (Admin Panel)
# ----------------------------

@csrf_exempt
@admin_required
def admin_books(request):
    if request.method == "GET":
        q = (request.GET.get("q") or "").strip()
        category = (request.GET.get("category") or "").strip()

        qs = Book.objects.all().order_by("-id")
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(author__icontains=q) | qs.filter(isbn__icontains=q)
        if category:
            qs = qs.filter(category__iexact=category)

        data = []
        for b in qs:
            data.append({
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "isbn": b.isbn,
                "category": b.category,
                "description": b.description,
                "total_copies": b.total_copies,
                "available_copies": b.available_copies,
                "status": b.status,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            })
        return JsonResponse(data, safe=False)

    if request.method == "POST":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)

        title = (body.get("title") or "").strip()
        if not title:
            return JsonResponse({"ok": False, "message": "title is required."}, status=400)

        author = (body.get("author") or "").strip()
        isbn = (body.get("isbn") or "").strip()
        category = (body.get("category") or "").strip()
        description = (body.get("description") or "").strip()

        total_copies = int(body.get("total_copies") or 1)
        available_copies = int(body.get("available_copies") or total_copies)

        b = Book.objects.create(
            title=title,
            author=author,
            isbn=isbn,
            category=category,
            description=description,
            total_copies=max(total_copies, 0),
            available_copies=max(min(available_copies, total_copies), 0),
        )
        return JsonResponse({"ok": True, "message": "Book created.", "book_id": b.id})

    return HttpResponseNotAllowed(["GET", "POST"])


@csrf_exempt
@admin_required
def admin_book_detail(request, book_id: int):
    b = get_object_or_404(Book, pk=book_id)

    if request.method == "PUT":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)

        for field in ["title", "author", "isbn", "category", "description"]:
            if field in body:
                setattr(b, field, (body.get(field) or "").strip())

        if "total_copies" in body:
            b.total_copies = max(int(body.get("total_copies") or 0), 0)
        if "available_copies" in body:
            b.available_copies = max(int(body.get("available_copies") or 0), 0)

        if b.available_copies > b.total_copies:
            b.available_copies = b.total_copies

        b.save()
        return JsonResponse({"ok": True, "message": "Book updated."})

    if request.method == "DELETE":
        b.delete()
        return JsonResponse({"ok": True, "message": "Book deleted."})

    return HttpResponseNotAllowed(["PUT", "DELETE"])


@admin_required
def admin_users(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    q = (request.GET.get("q") or "").strip()
    status = (request.GET.get("status") or "").strip().lower()  # active/suspended/all

    qs = User.objects.all().order_by("-date_joined")
    if q:
        qs = qs.filter(username__icontains=q) | qs.filter(email__icontains=q)

    if status == "active":
        qs = qs.filter(is_active=True)
    elif status == "suspended":
        qs = qs.filter(is_active=False)

    data = []
    for u in qs:
        current_loans = Loan.objects.filter(user=u, return_date__isnull=True).count()
        total_loans = Loan.objects.filter(user=u).count()
        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "membership": u.date_joined.date().isoformat(),
            "books": {"current": current_loans, "total": total_loans},
            "status": "Active" if u.is_active else "Suspended",
            "is_admin": u.is_staff,
        })
    return JsonResponse(data, safe=False)


@csrf_exempt
@admin_required
def admin_create_user(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)

    username = (body.get("username") or "").strip()
    email = (body.get("email") or "").strip()
    password = body.get("password") or "12345678"
    is_admin = bool(body.get("is_admin") or False)

    if not username:
        return JsonResponse({"ok": False, "message": "username is required."}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"ok": False, "message": "Username already exists."}, status=400)

    u = User.objects.create_user(username=username, email=email, password=password)
    u.is_staff = is_admin
    u.is_active = True
    u.save()
    return JsonResponse({"ok": True, "message": "User created.", "user_id": u.id})


@csrf_exempt
@admin_required
def admin_user_status(request, user_id: int):
    if request.method != "PATCH":
        return HttpResponseNotAllowed(["PATCH"])

    body = _json_body(request)
    if body is None:
        return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)

    u = get_object_or_404(User, pk=user_id)

    status = (body.get("status") or "").strip().lower()  # active/suspended
    if status not in ["active", "suspended"]:
        return JsonResponse({"ok": False, "message": "status must be 'active' or 'suspended'."}, status=400)

    u.is_active = (status == "active")
    u.save(update_fields=["is_active"])
    return JsonResponse({"ok": True, "message": "User status updated.", "status": "Active" if u.is_active else "Suspended"})
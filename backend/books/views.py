import json
from datetime import timedelta
import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.http import JsonResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from .serializer import serialize_loan, serialize_book
from .models import Book, Loan
from django.db.models import Count
from django.db.models import Q
import cloudinary.uploader

# ============================================
# BooksHaven Backend Views
# --------------------------------------------
# This module provides JSON-based APIs for:
# - Authentication (session-based login/logout)
# - Public book browsing (list, detail, search, sort)
# - Loan operations (borrow, return, current loans, history)
# - Admin management (books CRUD, users CRUD, user status)
#
# Notes:
# - Auth uses Django session cookies (login()) rather than tokens.
# - Most endpoints return JsonResponse with {"ok": ...} and/or data lists.
# - Admin endpoints require is_staff=True.
# ============================================

def _json_body(request):
    """Parse JSON body; return dict or None if invalid."""
    try:
        raw = request.body.decode("utf-8") if request.body else "{}"
        return json.loads(raw or "{}")
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None


def api_login_required(view_func):
    """Require session-authenticated user; otherwise return 401."""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"ok": False, "message": "Authentication required."}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def admin_required(view_func):
    """Require admin (is_staff); otherwise return 401/403."""
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
    """POST /api/auth/register/ - Create a new user."""
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
    """POST /api/auth/login/ - Login and set session cookie."""
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
    """POST /api/auth/logout/ - Clear session."""
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    logout(request)
    return JsonResponse({"ok": True, "message": "Logged out."})

@csrf_exempt
def auth_me(request):
    """GET /api/auth/me/ - Check current session user."""
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
    """GET /api/books/ - List/search books."""
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
 
    q = (request.GET.get("q") or "").strip()
    category = (request.GET.get("category") or "").strip()
    sort = (request.GET.get("sort") or "").strip() 
 
    qs = Book.objects.all()
 
    if q:
        # Keyword search across title/author/isbn
        qs = qs.filter(Q(title__icontains=q) | Q(author__icontains=q) | Q(isbn__icontains=q))
 
    if category:
        qs = qs.filter(category__iexact=category)
 
    if sort == "title":
        qs = qs.order_by("title")
    else:
        qs = qs.order_by("-created_at", "-id")
 
    data = []
    for b in qs:
        data.append({
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "isbn": b.isbn,
            "category": b.category,
            "description": b.description,
            "publisher": b.publisher,
            "published_date": b.published_date.isoformat() if b.published_date else None,
            "pages": b.pages,
            "language": b.language,
            "cover": b.cover.url if b.cover else None,
            "total_copies": b.total_copies,
            "available_copies": b.available_copies,
            "status": b.status,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
 
    return JsonResponse(data, safe=False)
 
 
def get_book_detail(request, book_id: int):
    """GET /api/books/<book_id>/ - Book details."""
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
        "publisher": b.publisher,
        "published_date": b.published_date.isoformat() if b.published_date else None,
        "pages": b.pages,
        "language": b.language,
        "cover": b.cover.url if b.cover else None,
        "total_copies": b.total_copies,
        "available_copies": b.available_copies,
        "status": b.status,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    })

def get_featured_books(request):
    """GET /api/books/featured/ - Top borrowed books."""
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
 
    featured_books = (
        Book.objects
        .annotate(borrow_count=Count('loans'))
        .filter(borrow_count__gt=0, available_copies__gt=0)  # Filter by available_copies
        .order_by('-borrow_count')[:8]
    )
 
    data = [serialize_book(book) for book in featured_books]
    return JsonResponse(data, safe=False)
 
 
def get_new_books(request):
    """GET /api/books/new/ - Recently added books."""
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
 
    new_books = (
        Book.objects
        .filter(available_copies__gt=0)
        .order_by('-created_at')[:8]
    )
 
    data = [serialize_book(book) for book in new_books]
    return JsonResponse(data, safe=False)

# ----------------------------
# Loans APIs (per-user)
# ----------------------------

@csrf_exempt
@api_login_required
@transaction.atomic
def borrow_book(request, book_id: int):
    """POST /api/books/<book_id>/borrow/ - Borrow a book (atomic inventory update)."""
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    # Lock row + atomic transaction to avoid race conditions on available_copies.
    book = get_object_or_404(Book.objects.select_for_update(), pk=book_id)

    if book.available_copies <= 0:
        return JsonResponse({"ok": False, "message": "Book not available."}, status=400)

    today = timezone.localdate()
    due_date = today + timedelta(days=30)

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
    """GET /api/loans/my/ - Current loans (not returned)."""
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
 
    loans = (
        Loan.objects.filter(user=request.user, return_date__isnull=True)
        .select_related("book")
        .order_by("-borrow_date", "-id")
    )
 
    data = [serialize_loan(loan) for loan in loans]
    return JsonResponse(data, safe=False)
 
 
@api_login_required
def my_loans_history(request):
    """GET /api/loans/history/ - Loan history (returned)."""
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
 
    loans = (
        Loan.objects.filter(user=request.user, return_date__isnull=False)
        .select_related("book")
        .order_by("-return_date", "-id")
    )
 
    data = [serialize_loan(loan) for loan in loans]
    return JsonResponse(data, safe=False)
 

@csrf_exempt
@api_login_required
@transaction.atomic
def return_loan(request, loan_id: int):
    """POST /api/loans/<loan_id>/return/ - Return a loan (atomic inventory update)."""
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
    # Cap inventory at total_copies to avoid exceeding max copies.
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
# Admin APIs (staff only)
# ----------------------------
 
@csrf_exempt
@admin_required
def admin_books(request):
    """
    GET /api/admin/books/ - List books with filtering
    POST /api/admin/books/ - Create new books
    """
    if request.method == "GET":
        q = (request.GET.get("q") or "").strip()
        category = (request.GET.get("category") or "").strip()
 
        qs = Book.objects.all().order_by("-id")
        
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(author__icontains=q) | Q(isbn__icontains=q))
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
                "publisher": b.publisher,
                "published_date": b.published_date.isoformat() if b.published_date else None,
                "pages": b.pages,
                "language": b.language,
                "cover": b.cover.url if b.cover else None,
                "total_copies": b.total_copies,
                "available_copies": b.available_copies,
                "status": b.status,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            })
        return JsonResponse(data, safe=False)
 
    if request.method == "POST":
        # Admin create uses multipart/form-data to support optional cover image upload
        title = (request.POST.get("title") or "").strip()
        if not title:
            return JsonResponse({"ok": False, "message": "title is required."}, status=400)
 
        author = (request.POST.get("author") or "").strip()
        isbn = (request.POST.get("isbn") or "").strip()
        category = (request.POST.get("category") or "").strip()
        description = (request.POST.get("description") or "").strip()
        publisher = (request.POST.get("publisher") or "").strip()
        published_date = request.POST.get("published_date")
        pages = request.POST.get("pages")
        language = (request.POST.get("language") or "English").strip()
 
        total_copies = request.POST.get("total_copies")
        try:
            total_copies = int(total_copies) if total_copies else 1
        except (ValueError, TypeError):
            total_copies = 1
 
        available_copies = request.POST.get("available_copies")
        try:
            available_copies = int(available_copies) if available_copies else total_copies
        except (ValueError, TypeError):
            available_copies = total_copies
 
        cover_file = request.FILES.get("cover") if "cover" in request.FILES else None
 
        parsed_date = None
        if published_date:
            try:
                from datetime import datetime
                parsed_date = datetime.strptime(published_date, "%Y-%m-%d").date()
            except (ValueError, TypeError):
                pass
 
        parsed_pages = None
        if pages:
            try:
                parsed_pages = int(pages)
            except (ValueError, TypeError):
                pass
 
        try:
            b = Book.objects.create(
                title=title,
                author=author,
                isbn=isbn,
                category=category,
                description=description,
                publisher=publisher,
                published_date=parsed_date,
                pages=parsed_pages,
                language=language,
                cover=cover_file,
                total_copies=max(total_copies, 0),
                available_copies=max(min(available_copies, total_copies), 0),
            )
            return JsonResponse({
                "ok": True,
                "message": "Book created.",
                "book_id": b.id,
                "book": {
                    "id": b.id,
                    "title": b.title,
                    "author": b.author,
                    "isbn": b.isbn,
                    "category": b.category,
                    "description": b.description,
                    "publisher": b.publisher,
                    "published_date": b.published_date.isoformat() if b.published_date else None,
                    "pages": b.pages,
                    "language": b.language,
                    "cover": b.cover.url if b.cover else None,
                    "total_copies": b.total_copies,
                    "available_copies": b.available_copies,
                    "status": b.status,
                    "created_at": b.created_at.isoformat() if b.created_at else None,
                }
            })
        except Exception as e:
            return JsonResponse({
                "ok": False,
                "message": f"Error creating book: {str(e)}"
            }, status=500)
 
    return HttpResponseNotAllowed(["GET", "POST"])
 
 
@csrf_exempt
@admin_required
def admin_book_detail(request, book_id: int):
    """
    PUT /api/admin/books/<int:book_id>/ - Update book
    DELETE /api/admin/books/<int:book_id>/ - Delete book
    """
    b = get_object_or_404(Book, pk=book_id)
 
    if request.method == "PUT":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)
 
        for field in ["title", "author", "isbn", "category", "description", "publisher", "language"]:
            if field in body:
                setattr(b, field, (body.get(field) or "").strip())
 
        if "published_date" in body and body["published_date"]:
            try:
                from datetime import datetime
                b.published_date = datetime.strptime(body["published_date"], "%Y-%m-%d").date()
            except (ValueError, TypeError):
                pass
 
        if "pages" in body and body["pages"]:
            try:
                b.pages = int(body["pages"])
            except (ValueError, TypeError):
                pass
 
        if "total_copies" in body:
            b.total_copies = max(int(body.get("total_copies") or 0), 0)
        
        if "available_copies" in body:
            b.available_copies = max(int(body.get("available_copies") or 0), 0)
 
        if b.available_copies > b.total_copies:
            b.available_copies = b.total_copies
 
        b.save()
        
        return JsonResponse({
            "ok": True,
            "message": "Book updated.",
            "book": {
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "isbn": b.isbn,
                "category": b.category,
                "description": b.description,
                "publisher": b.publisher,
                "published_date": b.published_date.isoformat() if b.published_date else None,
                "pages": b.pages,
                "language": b.language,
                "cover": b.cover.url if b.cover else None,
                "total_copies": b.total_copies,
                "available_copies": b.available_copies,
                "status": b.status,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
        })
 
    if request.method == "DELETE":
        book_title = b.title

        # Delete image from Cloudinary
        if b.cover and hasattr(b.cover, "public_id"):
            import cloudinary.uploader
            cloudinary.uploader.destroy(b.cover.public_id)

        # Delete book from DB
        b.delete()

        return JsonResponse({
            "ok": True,
            "message": f"Book '{book_title}' deleted."
        })
        
    return HttpResponseNotAllowed(["PUT", "DELETE"])
 
 

@admin_required
def admin_users(request):
    """GET /api/admin/users/ - Admin list users (with loan counts)."""
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
    """POST /api/admin/users/create/ - Admin create user."""
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
def admin_user_detail(request, user_id: int):
    """
    PUT /api/admin/users/<int:user_id>/ - Update user
    DELETE /api/admin/users/<int:user_id>/ - Delete user
    PATCH /api/admin/users/<int:user_id>/ - Update user status
    """
    u = get_object_or_404(User, pk=user_id)
 
    if request.method == "PUT":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)
 
        # Update username
        if "username" in body and body["username"]:
            u.username = body["username"].strip()
 
        # Update email
        if "email" in body and body["email"]:
            u.email = body["email"].strip()
 
        # Update password (optional)
        if "password" in body and body["password"]:
            u.set_password(body["password"])
 
        # Update admin status
        if "is_admin" in body:
            u.is_staff = bool(body["is_admin"])
 
        u.save()
 
        current_loans = Loan.objects.filter(user=u, return_date__isnull=True).count()
        total_loans = Loan.objects.filter(user=u).count()
 
        return JsonResponse({
            "ok": True,
            "message": "User updated.",
            "user": {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "membership": u.date_joined.date().isoformat(),
                "is_admin": u.is_staff,
                "status": "Active" if u.is_active else "Suspended",
                "books": {
                    "current": current_loans,
                    "total": total_loans,
                }
            }
        })
 
    if request.method == "DELETE":
        username = u.username
        u.delete()
 
        return JsonResponse({
            "ok": True,
            "message": f"User '{username}' deleted."
        })
 
    if request.method == "PATCH":
        body = _json_body(request)
        if body is None:
            return JsonResponse({"ok": False, "message": "Invalid JSON."}, status=400)
 
        status = (body.get("status") or "").strip().lower()  # active/suspended
        if status not in ["active", "suspended"]:
            return JsonResponse(
                {"ok": False, "message": "status must be 'active' or 'suspended'."},
                status=400
            )
 
        u.is_active = (status == "active")
        u.save(update_fields=["is_active"])
        
        return JsonResponse({
            "ok": True,
            "message": "User status updated.",
            "status": "Active" if u.is_active else "Suspended"
        })
 
    return HttpResponseNotAllowed(["PUT", "DELETE", "PATCH"])
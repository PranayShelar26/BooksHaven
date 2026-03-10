from datetime import timedelta

from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.utils import timezone

from django.views.decorators.csrf import csrf_exempt

from .models import Book, Loan


def get_books(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    q = request.GET.get("q", "").strip()
    qs = Book.objects.all().order_by("id")
    if q:
        qs = qs.filter(title__icontains=q) | qs.filter(author__icontains=q) | qs.filter(isbn__icontains=q)

    data = []
    for b in qs:
        data.append(
            {
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "isbn": b.isbn,
                "description": b.description,
                "total_copies": b.total_copies,
                "available_copies": b.available_copies,
                "status": b.status,
            }
        )
    return JsonResponse(data, safe=False)


@csrf_exempt
@login_required
@transaction.atomic
def borrow_book(request, book_id: int):
    ...
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    book = get_object_or_404(Book.objects.select_for_update(), pk=book_id)

    if book.available_copies <= 0:
        return JsonResponse({"ok": False, "message": "Book not available."}, status=400)

    today = timezone.localdate()
    due_date = today + timedelta(days=14)  # 14-day loan rule

    loan = Loan.objects.create(
        user=request.user,
        book=book,
        borrow_date=today,
        due_date=due_date,
        return_date=None,
    )

    book.available_copies -= 1
    book.save(update_fields=["available_copies"])

    return JsonResponse(
        {
            "ok": True,
            "message": "Borrowed successfully.",
            "loan_id": loan.id,
            "book_id": book.id,
            "available_copies": book.available_copies,
            "due_date": loan.due_date.isoformat(),
        }
    )


@login_required
def my_loans(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    loans = (
        Loan.objects.filter(user=request.user, return_date__isnull=True)
        .select_related("book")
        .order_by("-borrow_date", "-id")
    )

    data = []
    for l in loans:
        data.append(
            {
                "id": l.id,
                "borrow_date": l.borrow_date.isoformat(),
                "due_date": l.due_date.isoformat(),
                "return_date": l.return_date.isoformat() if l.return_date else None,
                "book": {
                    "id": l.book.id,
                    "title": l.book.title,
                    "author": l.book.author,
                    "isbn": l.book.isbn,
                    "status": l.book.status,
                },
            }
        )

    return JsonResponse(data, safe=False)


@csrf_exempt
@login_required
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
    book.available_copies += 1
    if book.available_copies > book.total_copies:
        book.available_copies = book.total_copies
    book.save(update_fields=["available_copies"])

    return JsonResponse(
        {
            "ok": True,
            "message": "Returned successfully.",
            "loan_id": loan.id,
            "book_id": book.id,
            "available_copies": book.available_copies,
        }
    )
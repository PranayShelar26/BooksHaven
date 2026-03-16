from django.urls import path
from .views import get_books, borrow_book, my_loans, return_loan

urlpatterns = [
    path("books/", get_books, name="books_list"),
    path("books/<int:book_id>/borrow/", borrow_book, name="borrow_book"),
    path("loans/my/", my_loans, name="my_loans"),
    path("loans/<int:loan_id>/return/", return_loan, name="return_loan"),
]   
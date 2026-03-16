from django.urls import path
from .views import (
    # auth
    auth_register, auth_login, auth_logout, auth_me,
    # books
    get_books, get_book_detail,
    # loans
    borrow_book, return_loan, my_loans_current, my_loans_history,
    # admin
    admin_books, admin_book_detail,
    admin_users, admin_create_user, admin_user_status,
)

urlpatterns = [
    # path("books/", get_books, name="books_list"),
    # path("books/<int:book_id>/borrow/", borrow_book, name="borrow_book"),
    # path("loans/my/", my_loans, name="my_loans"),
    # path("loans/<int:loan_id>/return/", return_loan, name="return_loan"),

    # auth
    path("auth/register/", auth_register),
    path("auth/login/", auth_login),
    path("auth/logout/", auth_logout),
    path("auth/me/", auth_me),

    # books
    path("books/", get_books),
    path("books/<int:book_id>/", get_book_detail),

    # loans
    path("books/<int:book_id>/borrow/", borrow_book),
    path("loans/<int:loan_id>/return/", return_loan),
    path("loans/my/", my_loans_current),
    path("loans/history/", my_loans_history),

    # admin panel apis
    path("admin/books/", admin_books),
    path("admin/books/<int:book_id>/", admin_book_detail),

    path("admin/users/", admin_users),
    path("admin/users/create/", admin_create_user),
    path("admin/users/<int:user_id>/status/", admin_user_status),
]

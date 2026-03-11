from django.contrib import admin
from .models import Book, Loan


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "isbn", "available_copies", "total_copies", "status")
    search_fields = ("title", "author", "isbn")


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "book", "borrow_date", "due_date", "return_date")
    search_fields = ("user__username", "book__title", "book__isbn")

from .models import Book
# Register your models here.

admin.site.register(Book)

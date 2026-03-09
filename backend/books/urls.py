from django.urls import path
from .views import get_books

urlpatterns = [
    path('books/',get_books),
]
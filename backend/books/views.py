from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book
# Create your views here.
@api_view(['GET'])

def get_books(request):
    books = Book.objects.all().values()
    return Response(list(books))


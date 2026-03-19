from django.conf import settings
from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField
import cloudinary
class Book(models.Model):
    """Book entity stored in the library catalogue (with optional cover image and inventory counts)."""

    # Dropdown options used by the frontend/admin forms
    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Spanish', 'Spanish'),
        ('French', 'French'),
        ('German', 'German'),
        ('Chinese', 'Chinese'),
        ('Japanese', 'Japanese'),
        ('Hindi', 'Hindi'),
        ('Other', 'Other'),
    ]

    CATEGORY_CHOICES = [
        ('Fiction', 'Fiction'),
        ('Non-Fiction', 'Non-Fiction'),
        ('Science', 'Science'),
        ('History', 'History'),
        ('Biography', 'Biography'),
        ('Mystery', 'Mystery'),
        ('Romance', 'Romance'),
        ('Thriller', 'Thriller'),
        ('Fantasy', 'Fantasy'),
        ('Science Fiction', 'Science Fiction'),
        ('Children', 'Children'),
        ('Young Adult', 'Young Adult'),
        ('Poetry', 'Poetry'),
        ('Drama', 'Drama'),
        ('Self-Help', 'Self-Help'),
        ('Business', 'Business'),
        ('Technology', 'Technology'),
        ('Art & Design', 'Art & Design'),
        ('Cooking', 'Cooking'),
        ('Sports', 'Sports'),
        ('Travel', 'Travel'),
        ('Education', 'Education'),
        ('Philosophy', 'Philosophy'),
        ('Psychology', 'Psychology'),
        ('Religion', 'Religion'),
        ('Other', 'Other'),
    ]

    # Basic identification fields
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True)
    isbn = models.CharField(max_length=13, blank=True, unique=True)  # unique to avoid duplicate catalogue entries

    # Optional metadata (used for filtering/search and displaying details)
    category = models.CharField(
        max_length=100,
        choices=CATEGORY_CHOICES,
        blank=True,
        default='Other'
    )
    description = models.TextField(blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    published_date = models.DateField(null=True, blank=True)
    pages = models.PositiveIntegerField(null=True, blank=True)
    language = models.CharField(
        max_length=50,
        choices=LANGUAGE_CHOICES,
        default='English',
        blank=True
    )

    # Cover image (requires Pillow; stored under MEDIA_ROOT/book_covers/)
    cover = CloudinaryField('image', folder='book_covers/', null=True, blank=True)
    
    @property
    def cover_url(self):
        """
        Generate proper HTTPS Cloudinary URL from public_id.
        This replaces the buggy .url property.
        """
        if not self.cover:
            return None
        
        # Get the public_id (e.g., "book_covers/my-book-title")
        public_id = self.cover.public_id if hasattr(self.cover, 'public_id') else str(self.cover)
        
        # Use cloudinary_url to generate proper HTTPS URL
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            secure=True,  # Forces HTTPS
            type='upload'
        )
        return url
 
    @property
    def cover_thumbnail(self):
        """Generate thumbnail URL with transformations"""
        if not self.cover:
            return None
        
        public_id = self.cover.public_id if hasattr(self.cover, 'public_id') else str(self.cover)
        
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            secure=True,
            type='upload',
            width=200,
            height=300,
            crop='fill',
            quality='auto'
        )
        return url

    # Inventory tracking
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)

    # Created timestamp for sorting and "new books" feature
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def status(self) -> str:
        """Derived status shown in UI (not stored in DB)."""
        return "Available" if self.available_copies > 0 else "Borrowed"

    def __str__(self):
        return f"{self.title} - {self.author}".strip()

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Book'
        verbose_name_plural = 'Books'


class Loan(models.Model):
    """Loan record linking a user to a borrowed book (borrow date, due date, optional return date)."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="loans")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="loans")

    # Dates: return_date is null until the book is returned
    borrow_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Loan #{self.id}: {self.user} -> {self.book}"

    class Meta:
        ordering = ["-borrow_date"]  # newest loans first
        indexes = [
            models.Index(fields=["user", "return_date"]),   # fast "current vs returned" filtering per user
            models.Index(fields=["user", "-borrow_date"]),  # fast ordering per user
        ]
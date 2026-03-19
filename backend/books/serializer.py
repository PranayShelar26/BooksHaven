def serialize_loan(loan):
    """
    Serialize a Loan object to a dictionary with full book details.
    Uses the new cover_url property instead of .url
    """
    return {
        "id": loan.id,
        "borrow_date": loan.borrow_date.isoformat(),
        "due_date": loan.due_date.isoformat(),
        "return_date": loan.return_date.isoformat() if loan.return_date else None,
        "book": {
            "id": loan.book.id,
            "title": loan.book.title,
            "author": loan.book.author,
            "isbn": loan.book.isbn,
            "category": loan.book.category,
            "status": loan.book.status,
            "cover": loan.book.cover_url,  # ← Changed from .url
            "publisher": loan.book.publisher,
            "pages": loan.book.pages,
            "language": loan.book.language,
        },
    }


def serialize_book(book):
    """
    Serialize Book model to dictionary.
    Uses the new cover_url property instead of .url
    """
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "category": book.category,
        "description": book.description,
        "publisher": book.publisher,
        "published_date": book.published_date.isoformat() if book.published_date else None,
        "pages": book.pages,
        "language": book.language,
        "cover": book.cover_url,  # ← Changed from .url
        "total_copies": book.total_copies,
        "available_copies": book.available_copies,
        "status": book.status,
        "created_at": book.created_at.isoformat() if book.created_at else None,
    }
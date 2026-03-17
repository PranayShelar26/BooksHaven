def serialize_loan(loan):
    """
    Serialize a Loan object to a dictionary with full book details including cover.
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
            "cover": loan.book.cover.url if loan.book.cover else None,  # NEW
            "publisher": loan.book.publisher,                            # NEW
            "pages": loan.book.pages,                                    # NEW
            "language": loan.book.language,                              # NEW
        },
    }

def serialize_book(book):
    """Serialize Book model to dictionary"""
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
        "cover": book.cover.url if book.cover else None,
        "total_copies": book.total_copies,
        "available_copies": book.available_copies,
        "status": book.status,
        "created_at": book.created_at.isoformat() if book.created_at else None,
    }
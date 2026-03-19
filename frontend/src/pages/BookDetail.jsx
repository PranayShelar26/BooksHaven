import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getBook } from "../api/bookservice.js";
import book_img from "../assets/book_banner.png";
import Spinner from "../components/Spinner.jsx";
import BorrowBookModal from "../components/BorrowBookModal";
import ReturnBookModal from "../components/ReturnBookModal";
import { mediaUrl } from "../lib/mediaUrl";
import api from "../lib/apiClient";

/**
 * BookDetail - Detailed view of a single book with borrowing/return option
 */
const BookDetail = () => {
  const { id } = useParams();
  const bookId = Number(id);

  const [book, setBook] = useState(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const [myLoans, setMyLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch book on mount
  useEffect(() => {
    getBook(id).then((res) => setBook(res.data));
  }, [id]);

  // Fetch my current loans (so we know if this book is already borrowed)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingLoans(true);
      try {
        const res = await api.get("/loans/my/");
        if (mounted) setMyLoans(res.data || []);
      } catch (e) {
        if (mounted) setMyLoans([]);
      } finally {
        if (mounted) setLoadingLoans(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Find active loan for this book (return_date === null)
  const activeLoanForThisBook = useMemo(() => {
    return myLoans.find(
      (l) => l.book?.id === bookId && (l.return_date === null || l.return_date === undefined)
    );
  }, [myLoans, bookId]);

  const handleBorrowSuccess = async () => {
    try {
      const [bookRes, loansRes] = await Promise.all([getBook(id), api.get("/loans/my/")]);
      setBook(bookRes.data);
      setMyLoans(loansRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturnSuccess = async () => {
    try {
      const [bookRes, loansRes] = await Promise.all([getBook(id), api.get("/loans/my/")]);
      setBook(bookRes.data);
      setMyLoans(loansRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (!book) return <Spinner />;

  const alreadyBorrowed = !!activeLoanForThisBook;

  return (
    <>
      <BorrowBookModal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        book={book}
        onBorrowSuccess={handleBorrowSuccess}
        onUpdateBook={(patch) => setBook((prev) => (prev ? { ...prev, ...patch } : prev))}
      />

      <ReturnBookModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        loan={activeLoanForThisBook}
        onReturnSuccess={handleReturnSuccess}
      />

      <div className="mt-6 sm:mt-8 px-4 sm:px-6 md:px-8 mx-auto max-w-6xl my-5 space-y-6 sm:space-y-8 min-h-screen w-full">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (location.state?.from) navigate(location.state.from);
              else navigate(-1);
            }}
            aria-label="Go back"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg sm:rounded-xl font-semibold hover:cursor-pointer transition-all text-xs sm:text-sm"
          >
            ← Back
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {/* Book Cover */}
          <div className="rounded-lg sm:rounded-xl overflow-hidden h-80 sm:h-96 md:h-auto md:min-h-96 lg:min-h-125">
            <img
              src={book.cover ? mediaUrl(book.cover) : book_img}
              alt={book.title ? `Cover of ${book.title}` : "Book cover"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book Info */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {book.title}
            </h1>

            <h2 className="text-base sm:text-lg md:text-xl text-gray-700">
              <span className="text-black font-semibold">Author:</span> {book.author}
            </h2>

            {/* Availability */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span
                className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full ${
                  book.available_copies > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                aria-live="polite"
              >
                {book.available_copies > 0
                  ? `${book.available_copies} Copies Available`
                  : "Out of Stock"}
              </span>

              {book.total_copies && (
                <span className="text-xs sm:text-sm text-gray-600">
                  ({book.available_copies}/{book.total_copies})
                </span>
              )}
              {!loadingLoans && alreadyBorrowed && (
                <span className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  You have borrowed this
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold">Description</h3>
              <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                {book.description || "No description available"}
              </p>
            </div>

            {/* Book Details Box */}
            <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-gray-200 rounded-lg sm:rounded-xl">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold">Book Details</h1>

              <div className="flex justify-between text-xs sm:text-sm">
                <div className="font-medium">Pages</div>
                <div>{book.pages || "N/A"}</div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <div className="font-medium">Published Date</div>
                <div>{book.published_date || "N/A"}</div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <div className="font-medium">Publisher</div>
                <div className="text-right">{book.publisher || "N/A"}</div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <div className="font-medium">Category</div>
                <div>{book.category || "Uncategorized"}</div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <div className="font-medium">Language</div>
                <div>{book.language || "English"}</div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <div className="font-medium">Borrowing Duration</div>
                <div className="text-amber-600 font-semibold">30 Days</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
              {/* Switch Borrow/Return based on current loan */}
              {alreadyBorrowed ? (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  disabled={loadingLoans}
                  className="p-2 sm:p-3 w-full rounded-lg sm:rounded-xl font-bold text-white transition text-xs sm:text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
                >
                  {loadingLoans ? "Loading..." : "Return"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(true)}
                  disabled={loadingLoans || book.available_copies <= 0}
                  aria-disabled={loadingLoans || book.available_copies <= 0}
                  className={`p-2 sm:p-3 w-full rounded-lg sm:rounded-xl font-bold text-white transition text-xs sm:text-sm ${
                    book.available_copies > 0
                      ? "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  {loadingLoans ? "Loading..." : book.available_copies > 0 ? "Borrow" : "Not Available"}
                </button>
              )}

              <button
                type="button"
                className="p-2 sm:p-3 border border-gray-400 hover:bg-gray-200 w-full rounded-lg sm:rounded-xl font-bold transition text-xs sm:text-sm"
                aria-label="Add this book to wishlist"
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetail;
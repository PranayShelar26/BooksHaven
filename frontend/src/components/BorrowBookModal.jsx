import React, { useState, useEffect } from "react";
import api from "../lib/apiClient";
import ConfirmationDialog from "./ConfirmationDialog";
import { useBooks } from "../context/BookContext";

const BorrowBookModal = ({
  isOpen,
  onClose,
  book,
  onBorrowSuccess,
  onUpdateBook, 
}) => {
  const { updateBookCopies, refreshBooks } = useBooks();

  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [borrowData, setBorrowData] = useState(null);
  const [error, setError] = useState("");
  const [userBorrowings, setUserBorrowings] = useState([]);
  const [checkingBorrowings, setCheckingBorrowings] = useState(false);

  // Check if user already has this book borrowed
  useEffect(() => {
    if (isOpen && book?.id) {
      checkUserBorrowings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, book?.id]);

  const checkUserBorrowings = async () => {
    setCheckingBorrowings(true);
    try {
      const response = await api.get("/loans/my/");
      setUserBorrowings(response.data || []);
      console.log("User borrowings:", response.data);
    } catch (err) {
      console.error("Error fetching user borrowings:", err);
    } finally {
      setCheckingBorrowings(false);
    }
  };

  // Check if user already has this book (return_date is null means still borrowed)
  const userHasBook = userBorrowings.some(
    (loan) => loan.book?.id === book?.id && loan.return_date === null
  );

  const handleBorrow = async () => {
    if (!book || !book.id) {
      setError("Book information not available");
      return;
    }

    if (userHasBook) {
      setError(
        "You have already borrowed this book. Please return it before borrowing again."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/books/${book.id}/borrow/`, {});
      console.log("Borrow response:", response.data);

      if (response.data && response.data.ok) {
        // updata
        if (typeof response.data.available_copies === "number") {
          updateBookCopies(book.id, response.data.available_copies);
        }

        if (
          typeof onUpdateBook === "function" &&
          typeof response.data.available_copies === "number"
        ) {
          onUpdateBook({ available_copies: response.data.available_copies });
        }

        await refreshBooks();

        if (typeof onBorrowSuccess === "function") {
          onBorrowSuccess();
        }

        const dueDate = new Date(response.data.due_date);
        setBorrowData({
          bookTitle: book.title,
          author: book.author,
          dueDate: dueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          loanId: response.data.loan_id,
        });

        setShowConfirmation(true);
        setLoading(false);
      } else {
        setError(response.data?.message || "Failed to borrow book.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Borrow error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to borrow book. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title="Book Borrowed Successfully! "
        description={`You have successfully borrowed "${borrowData?.bookTitle}" by ${borrowData?.author}. Due date: ${borrowData?.dueDate}. You can borrow only 1 copy of each book for 30 days.`}
        confirmText="Done"
        isDangerous={false}
      />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg z-50">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Borrow Book</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-all"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {book && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <p className="text-gray-900 font-medium">{book.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author
                  </label>
                  <p className="text-gray-900 font-medium">{book.author}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <p className="text-gray-900 font-medium">
                    {book.category || "Uncategorized"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Copies
                  </label>
                  <p className="text-gray-900 font-medium">
                    {book.available_copies || 0}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Duration:</span> 30 days
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <span className="font-semibold">Limit:</span> 1 copy per user
                  </p>
                </div>

                {/* Already borrowed warning */}
                {userHasBook && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold"> Note:</span> You already
                      have this book borrowed. Please return it first before
                      borrowing again.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              onClick={handleBorrow}
              disabled={
                loading ||
                !book ||
                book.available_copies <= 0 ||
                userHasBook ||
                checkingBorrowings
              }
              className="inline-flex w-full justify-center rounded-md bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-semibold py-2 px-3 text-sm sm:w-auto transition-all disabled:cursor-not-allowed"
            >
              {checkingBorrowings
                ? "Checking..."
                : loading
                ? "Borrowing..."
                : "Confirm Borrow"}
            </button>
            <button
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-3 text-sm hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BorrowBookModal;
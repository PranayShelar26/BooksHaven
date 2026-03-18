import React, { useState } from "react";
import api from "../lib/apiClient";
import ConfirmationDialog from "./ConfirmationDialog";
import { useBooks } from "../context/BookContext";

const ReturnBookModal = ({
  isOpen,
  onClose,
  loan,
  onReturnSuccess,
  onUpdateLoan,
}) => {
  const { updateBookCopies, refreshBooks } = useBooks();

  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [returnData, setReturnData] = useState(null);
  const [error, setError] = useState("");

  const daysOverdue = () => {
    const diff = Math.ceil(
      (new Date() - new Date(loan?.due_date)) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const isLate = () => {
    return new Date() > new Date(loan?.due_date);
  };

  const handleReturn = async () => {
    if (!loan || !loan.id) {
      setError("Loan information not available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/loans/${loan.id}/return/`, {});
      console.log("Return response:", response.data);

      if (response.data && response.data.ok) {
        // update
        if (
          typeof response.data.available_copies === "number" &&
          loan?.book?.id
        ) {
          updateBookCopies(loan.book.id, response.data.available_copies);
        }

        if (typeof onUpdateLoan === "function") {
          onUpdateLoan({
            loanId: loan.id,
            bookId: loan.book?.id,
            returned: true,
            available_copies:
              typeof response.data.available_copies === "number"
                ? response.data.available_copies
                : undefined,
          });
        }

        await refreshBooks();

        if (typeof onReturnSuccess === "function") {
          onReturnSuccess();
        }

        setReturnData({
          bookTitle: loan.book?.title || "Unknown",
          author: loan.book?.author || "Unknown",
          returnedDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isLate: isLate(),
          daysOverdue: daysOverdue(),
          dueDate: new Date(loan.due_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });

        setShowConfirmation(true);
        setLoading(false);
      } else {
        setError(response.data?.message || "Failed to return book.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Return error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to return book. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen || !loan) return null;

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title={
          returnData?.isLate
            ? "Book Returned (Late) "
            : "Book Returned Successfully! "
        }
        description={
          returnData?.isLate
            ? `You have returned "${returnData?.bookTitle}" by ${returnData?.author}. This book was ${returnData?.daysOverdue} day(s) overdue. Due date was: ${returnData?.dueDate}`
            : `You have successfully returned "${returnData?.bookTitle}" by ${returnData?.author}. Returned on time!`
        }
        confirmText="Done"
        isDangerous={returnData?.isLate || false}
      />

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg z-50">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Return Book</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-all"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <p className="text-gray-900 font-medium">{loan.book?.title}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author
                </label>
                <p className="text-gray-900 font-medium">{loan.book?.author}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <p className="text-gray-900 font-medium">
                  {loan.book?.category || "Uncategorized"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Borrow Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(loan.borrow_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(loan.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div
                className={`p-3 rounded-lg border ${
                  isLate()
                    ? "bg-red-50 border-red-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    isLate() ? "text-red-800" : "text-green-800"
                  }`}
                >
                  {isLate()
                    ? ` This book is ${daysOverdue()} day(s) overdue!`
                    : " This book is still within the borrowing period."}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              onClick={handleReturn}
              disabled={loading}
              className={`inline-flex w-full justify-center rounded-md text-white font-semibold py-2 px-3 text-sm sm:w-auto transition-all disabled:cursor-not-allowed ${
                isLate()
                  ? "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
                  : "bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400"
              }`}
            >
              {loading ? "Returning..." : "Confirm Return"}
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

export default ReturnBookModal;
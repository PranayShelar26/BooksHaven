import React, { useEffect, useState } from 'react'
import book_img from "../assets/book_banner.png";
import { Link } from 'react-router-dom'
import axios from 'axios';
import Spinner from './Spinner';
import ReturnBookModal from './ReturnBookModal';

/**
 * BorrowedBookList - Display user's current or past borrowings
 */
const BorrowedBookList = ({ type }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Fetch loans on mount
  useEffect(() => {
    const url = type === "history"
      ? "http://localhost:8000/api/loans/history/"
      : "http://localhost:8000/api/loans/my/";

    axios.get(url, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error("Error fetching loans:", err))
      .finally(() => setLoading(false));
  }, [type]);

  const handleReturnClick = (loan) => {
    setSelectedLoan(loan);
    setShowReturnModal(true);
  };

  const handleReturnSuccess = () => {
    // Refresh loans list
    const url = type === "history"
      ? "http://localhost:8000/api/loans/history/"
      : "http://localhost:8000/api/loans/my/";

    axios.get(url, { withCredentials: true })
      .then((res) => setLoans(res.data))
      .catch((err) => console.error("Error refreshing loans:", err));
  };

  if (loading) return <Spinner />;

  if (loans.length === 0) return (
    <p className="text-sm sm:text-base text-gray-500">
      {type === "history" ? "No borrowing history found." : "You have no active borrowings."}
    </p>
  );

  // Calculate days left until due date
  const daysLeft = (due_date) => {
    const diff = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <>
      <ReturnBookModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        loan={selectedLoan}
        onReturnSuccess={handleReturnSuccess}
      />

      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 w-full">
        {loans.map((loan) => (
          <div 
            key={loan.id} 
            className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 ring ring-gray-500 rounded-lg sm:rounded-xl flex flex-row gap-3 sm:gap-4 md:gap-6 items-start justify-between"
          >
            {/* Left section - Book Info */}
            <div className="flex gap-3 sm:gap-4 md:gap-5 items-start flex-1">
              {/* Cover Image */}
              <div className="rounded-lg sm:rounded-xl overflow-hidden h-24 sm:h-32 md:h-40 w-16 sm:w-24 md:w-32 shrink-0">
                <img 
                  src={
                    loan.book?.cover 
                      ? (loan.book.cover.startsWith('http') 
                          ? loan.book.cover
                          : `http://localhost:8000${loan.book.cover}`)
                      : book_img
                  } 
                  alt={loan.book?.title || "book_img"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = book_img;
                  }}
                />
              </div>

              {/* Book Details */}
              <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
                <h1 className="font-semibold text-sm sm:text-base line-clamp-2">
                  {loan.book?.title}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  {loan.book?.author}
                </p>

                {loan.book?.publisher && (
                  <p className="text-gray-500 text-xs sm:text-sm truncate">
                    {loan.book.publisher}
                  </p>
                )}

                <p className="text-gray-500 text-xs sm:text-sm">
                  Borrowed: {new Date(loan.borrow_date).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className='mt-2 flex flex-col sm:flex-row gap-2 w-full'>
                  <Link
                    to={`/books/${loan.book?.id}`}
                    className='px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg sm:rounded-xl font-medium text-white transition-colors text-xs sm:text-sm text-center'
                  >
                    View Details
                  </Link>
                  {type === "current" && (
                    <button
                      onClick={() => handleReturnClick(loan)}
                      className='px-3 sm:px-4 py-2 transition ease-in-out font-medium border border-red-500 text-red-500 rounded-lg sm:rounded-xl hover:bg-red-500 hover:text-white text-xs sm:text-sm'
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right section - Date Info */}
            <div className="flex flex-col gap-1 sm:gap-3 text-right shrink-0">
              {type === "current" ? (
                <>
                  {/* Days Left Indicator */}
                  <div className={`px-2 sm:px-3 md:px-4 py-1 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap
                    ${daysLeft(loan.due_date) <= 3
                      ? "bg-red-200 text-red-700"
                      : daysLeft(loan.due_date) <= 7
                      ? "bg-yellow-200 text-yellow-700"
                      : "bg-orange-200 text-orange-700"
                    }`}>
                    {daysLeft(loan.due_date) <= 0
                      ? "Overdue!"
                      : `${daysLeft(loan.due_date)} days left`
                    }
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    Due: {new Date(loan.due_date).toLocaleDateString()}
                  </div>
                </>
              ) : (
                <>
                  {/* Return Status */}
                  <div className={`px-2 sm:px-3 md:px-4 py-1 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm
                    ${new Date(loan.return_date) > new Date(loan.due_date)
                      ? "bg-red-200 text-red-700"
                      : "bg-green-200 text-green-700"
                    }`}>
                    {new Date(loan.return_date) > new Date(loan.due_date) ? "Late" : "On Time"}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    Returned: {new Date(loan.return_date).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BorrowedBookList;
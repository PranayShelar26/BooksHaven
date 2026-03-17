import React, { useEffect, useState } from 'react'
import book_img from "../assets/book_banner.png";
import { Link } from 'react-router-dom'
import axios from 'axios';
import Spinner from './Spinner';
import ReturnBookModal from './ReturnBookModal';

const BorrowedBookList = ({ type }) => {  // ✅ type = "current" or "history"
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);

    useEffect(() => {
        // ✅ UPDATED: Use the new unified endpoint
        // The new backend now returns all loans with return_date filter
        const url = type === "history"
            ? "http://localhost:8000/api/loans/history/"  // ✅ NEW: Returns only returned loans
            : "http://localhost:8000/api/loans/my/"; // ✅ NEW: Returns only active loans

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
        // ✅ UPDATED: Refresh the loans list using the same endpoints
        const url = type === "history"
            ? "http://localhost:8000/api/loans/history/"
            : "http://localhost:8000/api/loans/my/";

        axios.get(url, { withCredentials: true })
            .then((res) => setLoans(res.data))
            .catch((err) => console.error("Error refreshing loans:", err));
    };

    if (loading) return <Spinner />;

    if (loans.length === 0) return (
        <p className="text-gray-500">
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

            <div className="flex flex-col gap-5">
                {loans.map((loan) => (
                    <div 
                        key={loan.id} 
                        className="px-8 py-4 ring flex flex-row justify-between ring-gray-500 rounded-xl items-center"
                    >
                        {/* Left section - Book info */}
                        <div className="flex gap-4 items-center">
                            {/* Book Cover - Now with real image from API */}
                            <div className="rounded-xl overflow-hidden h-40 w-30">
                                <img 
                                    src={
                                        // ✅ IMPROVED: Better cover image handling
                                        loan.book?.cover 
                                            ? (loan.book.cover.startsWith('http') 
                                                ? loan.book.cover  // Already full URL from API
                                                : `http://localhost:8000${loan.book.cover}`) // Relative URL
                                            : book_img  // Fallback to default image
                                    } 
                                    alt={loan.book?.title || "book_img"} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // ✅ NEW: Fallback if image fails to load
                                        e.target.src = book_img;
                                    }}
                                />
                            </div>

                            {/* Book Details */}
                            <div className="flex flex-col gap-2">
                                <h1 className="font-semibold text-xl">{loan.book?.title}</h1>
                                <p className="text-gray-600">{loan.book?.author}</p>
                                
                                {/* ✅ NEW: Show additional book info from API */}
                                {loan.book?.publisher && (
                                    <p className="text-gray-500 text-sm">
                                        {loan.book.publisher}
                                    </p>
                                )}
                                
                                <p className="text-gray-500">
                                    Borrowed: {new Date(loan.borrow_date).toLocaleDateString()}
                                </p>
                                
                                {/* Action Buttons */}
                                <div className='mt-2 flex gap-2'>
                                    <Link
                                        to={`/books/${loan.book?.id}`}
                                        className='px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl font-medium text-white transition-colors'
                                    >
                                        View Details
                                    </Link>
                                    {type === "current" && (
                                        <button
                                            onClick={() => handleReturnClick(loan)}
                                            className='px-4 py-2 transition ease-in-out font-medium border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white'
                                        >
                                            Return
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right section - Date info */}
                        <div className="flex flex-col gap-5 text-right self-start">
                            {type === "current" ? (
                                <>
                                    {/* ✅ IMPROVED: Days left indicator */}
                                    <div className={`text-start px-4 py-1 rounded-xl font-semibold
                                        ${daysLeft(loan.due_date) <= 3
                                            ? "bg-red-200 text-red-700"      // urgent
                                            : daysLeft(loan.due_date) <= 7
                                            ? "bg-yellow-200 text-yellow-700" // warning
                                            : "bg-orange-200 text-orange-700" // normal
                                        }`}>
                                        {daysLeft(loan.due_date) <= 0
                                            ? "Overdue!"
                                            : `${daysLeft(loan.due_date)} days left`
                                        }
                                    </div>
                                    <div className="text-gray-500">
                                        Due: {new Date(loan.due_date).toLocaleDateString()}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* ✅ IMPROVED: Return status indicator */}
                                    <div className={`text-start px-4 py-1 rounded-xl font-semibold
                                        ${new Date(loan.return_date) > new Date(loan.due_date)
                                            ? "bg-red-200 text-red-700"
                                            : "bg-green-200 text-green-700"
                                        }`}>
                                        {new Date(loan.return_date) > new Date(loan.due_date) ? "Late" : "On Time"}
                                    </div>
                                    <div className="text-gray-500">
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
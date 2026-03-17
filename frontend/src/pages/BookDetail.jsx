import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getBook } from "../api/bookservice.js";
import book_img from "../assets/book_banner.png";
import Spinner from "../components/Spinner.jsx";
import BorrowBookModal from "../components/BorrowBookModal";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    getBook(id).then((res) => {
      setBook(res.data);
      console.log(res.data);
    });
  }, [id]);

  const handleBorrowSuccess = () => {
    // Optionally navigate back or refresh
    console.log("Book borrowed successfully");
  };

  if (!book) {
    return <Spinner />;
  }

  return (
    <>
      <BorrowBookModal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        book={book}
        onBorrowSuccess={handleBorrowSuccess}
      />

      <div className="mt-8 mx-40 my-5 space-y-8 min-h-screen ">

        {/* Back Button */}
        <div>
          <button
            onClick={() => {
              if (location.state?.from) {
                navigate(location.state.from);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold hover:cursor-pointer transition-all"
          >
            ← Back
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-[40%_60%] lg:gap-10">
          {/* Book Image */}
          <div className="rounded-xl overflow-hidden lg:h-150">
            <img
              src={book.cover ? `http://localhost:8000${book.cover}` : book_img}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book Details */}
          <div className="flex flex-col lg:gap-5">
            <h1 className="text-3xl font-bold">{book.title}</h1>

            <h2 className="text-xl text-gray-700">
              <span className="text-black text-lg">Author:</span> {book.author}
            </h2>

            {/* Availability Status */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  book.available_copies > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {book.available_copies > 0
                  ? `${book.available_copies} Copies Available`
                  : "Out of Stock"}
              </span>
              {book.total_copies && (
                <span className="text-sm text-gray-600">
                  ({book.available_copies}/{book.total_copies})
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">
                {book.description || "No description available"}
              </p>
            </div>

            {/* Book Info Box */}
            <div className="flex flex-col gap-4 p-5 bg-gray-200 rounded-xl">
              <h1 className="text-xl font-semibold">Book Details</h1>

              <div className="flex justify-between">
                <div className="font-medium">Pages</div>
                <div>{book.pages || "N/A"}</div>
              </div>

              <div className="flex justify-between">
                <div className="font-medium">Published Date</div>
                <div>{book.published_date || "N/A"}</div>
              </div>

              <div className="flex justify-between">
                <div className="font-medium">Publisher</div>
                <div>{book.publisher || "N/A"}</div>
              </div>

              <div className="flex justify-between">
                <div className="font-medium">Category</div>
                <div>{book.category || "Uncategorized"}</div>
              </div>

              <div className="flex justify-between">
                <div className="font-medium">Language</div>
                <div>{book.language || "English"}</div>
              </div>

              <div className="flex justify-between">
                <div className="font-medium">Borrowing Duration</div>
                <div className="text-amber-600 font-semibold">30   Days</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => setShowBorrowModal(true)}
                disabled={book.available_copies <= 0}
                className={`p-3 w-full rounded-xl font-bold text-white transition ${
                  book.available_copies > 0
                    ? "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                {book.available_copies > 0 ? "Borrow" : "Not Available"}
              </button>

              <button className="p-3 border border-gray-400 hover:bg-gray-200 w-full rounded-xl font-bold transition">
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
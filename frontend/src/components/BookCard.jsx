import React from "react";
import book_img from "../assets/book_banner.png";
import { Link, useLocation } from "react-router-dom";
import Spinner from "./Spinner";
import { useBooks } from "../context/BookContext";
import { mediaUrl } from "../lib/mediaUrl";

const BookCard = () => {
  const { filteredBooks, loading } = useBooks();
  const location = useLocation();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 py-4 sm:py-5 w-full">
      {filteredBooks.map((book) => (
        <div
          key={book.id}
          className="h-full flex flex-col shadow-sm hover:shadow-lg bg-gray-100 rounded-lg sm:rounded-xl transition-all overflow-hidden group hover:scale-105"
        >
          {/* Image Container */}
          <div className="w-full h-32 sm:h-40 md:h-48 overflow-hidden bg-gray-300">
            <img
              src={book.cover ? mediaUrl(book.cover) : book_img}
              alt={book.title ? `Cover of ${book.title}` : "Book cover"}
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.src = book_img; }}
              className="w-full h-full object-cover transition-all group-hover:scale-110"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col grow px-2 sm:px-3 md:px-4 py-3 sm:py-4">
            {/* Title */}
            <div className="font-bold text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2">
              {book.title}
            </div>

            {/* Author */}
            <div className="font-light text-gray-600 text-xs sm:text-sm truncate">
              {book.author}
            </div>

            {/* Availability Badge */}
            <div className="mt-2 mb-auto">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                  book.available_copies > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {book.available_copies > 0
                  ? `${book.available_copies} Available`
                  : "Not Available"}
              </span>
            </div>

            {/* Button */}
            <Link
              to={`/books/${book.id}`}
              state={{ from: location.pathname }}
              className={`flex justify-center items-center transition-all p-2 rounded-lg font-semibold text-white text-xs sm:text-sm mt-3 ${
                book.available_copies > 0
                  ? "hover:bg-amber-600 bg-amber-500 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              aria-disabled={book.available_copies <= 0}
              onClick={(e) => {
                if (book.available_copies <= 0) {
                  e.preventDefault();
                }
              }}
            >
              {book.available_copies > 0 ? "Borrow" : "Not Available"}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookCard;

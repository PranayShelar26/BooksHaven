import React, { useEffect, useState } from "react";
import book_img from "../assets/book_banner.png";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Spinner from "./Spinner";
import { useBooks } from "../context/BookContext";

const BookCard = () => {
  const { filteredBooks, loading } = useBooks();
  const location = useLocation();

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="flex flex-wrap py-5 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="w-60 h-96 flex flex-col shadow-sm hover:shadow-lg bg-gray-100 rounded-xl transition-all overflow-hidden group"
          >
            {/* Image */}
            <div className="w-full h-48 overflow-hidden bg-gray-300">
              <img
                src={book.cover ? `http://localhost:8000${book.cover}` : book_img}
                alt={book.title}
                className="w-full h-full object-cover transition-all group-hover:scale-110"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col grow px-3 py-4">
              <div className="font-bold text-lg line-clamp-2">
                {book.title}
              </div>

              <div className="font-light text-gray-600">
                {book.author}
              </div>

              {/* Availability Badge */}
              <div className="mt-2 mb-auto">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
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
                className={`flex justify-center transition-all p-2 rounded-lg font-semibold text-white ${
                  book.available_copies > 0
                    ? "hover:bg-amber-600 bg-amber-500"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
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
    </>
  );
};

export default BookCard;
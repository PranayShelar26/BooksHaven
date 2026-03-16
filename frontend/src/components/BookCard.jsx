import React, { useEffect, useState } from "react";
import book_img from "../assets/book_banner.png";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Spinner from "./Spinner";

const BookCard = () => {
  const [books, setBooks] = useState([]);
  const location = useLocation();
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/books/")
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => alert(err));
  }, []);

  if(!books){
    return <Spinner/>
  }

  return (
    <>
      <div className="flex flex-wrap py-5 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="w-60 h-96 flex flex-col shadow-sm hover:shadow-lg bg-gray-100 rounded-xl transition-all overflow-hidden group"
          >
            {/* Image */}
            <div className="w-full h-48 overflow-hidden">
              <img
                src={book_img}
                alt="book"
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

              {/* Button */}
              <Link
                to={`/books/${book.id}`}
                state={{ from: location.pathname }}
                className="mt-auto flex justify-center hover:bg-amber-600 transition-all p-2 rounded-lg font-semibold bg-amber-500 text-white"
              >
                Borrow
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BookCard;
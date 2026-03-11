import React, { useEffect, useState } from "react";
import book_img from "../assets/book_banner.png";
import axios from "axios";

const BookCard = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/books/")
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => alert(err));
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="w-60 h-100 shadow-sm hover:shadow-lg bg-gray-100 rounded-xl transition-all ease-in-out  overflow-hidden space-y-5 group "
          >
            <div className="w-full h-64 overflow-hidden">
              <img
                src={book_img}
                alt=""
                className="w-full h-full object-cover transition-all ease-in-out group-hover:scale-110 "
              />
            </div>

            <div className="px-2 ">
              <div className="font-bold text-xl">{book.title}</div>
              <div className="font-light">{book.author}</div>

              <button className="flex mt-4 w-full justify-center hover:bg-amber-600 transition-all ease-in-out p-1 rounded-lg font-semibold bg-amber-500">
                Borrow
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BookCard;

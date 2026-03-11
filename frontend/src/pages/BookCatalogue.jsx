import React from "react";
import Navbar from "../components/Navbar";
import book_img from "../assets/book_banner.png";
import BookCard from "../components/BookCard";
import BookCatagoryList from "../components/BookCatagoryList";
const BookCatalogue = () => {
  return (
    <>
      <Navbar />
      <div className="mt-8 sm:px-2 mx-20 space-y-10">
        <div>
          <div className="space-y-2">
            <h1 className="font-bold text-3xl">Book Catalogue</h1>
            <h2>Browse collections of books</h2>
          </div>
        </div>
        <div className="max-w-8xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for books, authors, or ISBN..."
              className="w-full pl-8 pr-8 py-4 rounded-2xl bg-white shadow-lg shadow-gray-100/50 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all"
            />
          </div>
        </div>

        <div>
            <BookCatagoryList/>
        </div>
        {/* Featured Book Section */}

        {/* New Books Section */}
        <div>
          <div className="">
            <BookCard />
          </div>
        </div>
      </div>
    </>
  );
};

export default BookCatalogue;

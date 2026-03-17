import React from "react";
import Navbar from "../components/Navbar";
import book_img from "../assets/book_banner.png";
import BookCard from "../components/BookCard";
import BookCatagoryList from "../components/BookCatagoryList";
import SearchBar from "../components/SearchBar";
import { Outlet } from "react-router-dom";
const BookCatalogue = () => {
  return (
    <>
      <div className="mt-8 sm:px-2 mx-20 my-5 space-y-10">
        <Outlet/>
        <div>
          <div className="space-y-2">
            <h1 className="font-bold text-3xl">Book Catalogue</h1>
            <h2>Browse collections of books</h2>
          </div>
        </div>
        <div className="max-w-8xl mx-auto mb-6">
          <SearchBar/>
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

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
      <div className="mt-6 sm:mt-8 px-4 sm:px-6 md:px-8 mx-auto max-w-7xl my-5 space-y-6 sm:space-y-8 md:space-y-10 w-full">
        {/* Outlet for nested routes */}
        <Outlet />

        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
            Book Catalogue
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Browse collections of books
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="w-full">
          <SearchBar />
        </div>

        {/* Category Filter Section */}
        <div className="w-full overflow-x-auto">
          <BookCatagoryList />
        </div>

        {/* Books Grid Section */}
        <div className="w-full">
          <BookCard />
        </div>
      </div>
    </>
  );
};

export default BookCatalogue;
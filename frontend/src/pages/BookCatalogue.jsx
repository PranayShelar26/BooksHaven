import React from "react";
import Navbar from "../components/Navbar";
import book_img from "../assets/book_banner.png";
import BookCard from "../components/BookCard";
import BookCatagoryList from "../components/BookCatagoryList";
import SearchBar from "../components/SearchBar";
import { Outlet } from "react-router-dom";

/**
 * BookCatalogue - Main page for browsing books
 * Displays search, category filters, and book grid
 */
const BookCatalogue = () => {
  return (
    <>
      <div className="mt-8 sm:px-2 mx-20 my-5 space-y-10">
        {/* Render nested routes */}
        <Outlet/>
        
        {/* Page Header */}
        <div>
          <div className="space-y-2">
            <h1 className="font-bold text-3xl">Book Catalogue</h1>
            <h2>Browse collections of books</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-8xl mx-auto mb-6">
          <SearchBar/>
        </div>

        {/* Category Filter */}
        <div>
            <BookCatagoryList/>
        </div>

        {/* Books Display */}
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
import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import book_img from "../assets/book_banner.png";
import BookCard from "../components/BookCard";
import { Outlet } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useBooks } from "../context/BookContext";

/**
 * Dashboard - User home page with featured and new books
 */
const Dashboard = () => {
  const { setCategory, setSearch } = useBooks();

  // Reset filters when entering Dashboard
  useEffect(() => {
    setCategory("All");
    setSearch("");
  }, [setCategory, setSearch]);

  return (
    <>
      <div className="mt-6 sm:mt-8 px-4 sm:px-6 md:px-8 mx-auto max-w-7xl space-y-8 sm:space-y-10 my-5 w-full">
        {/* Search Bar */}
        <div className="w-full">
          <SearchBar />
        </div>

        {/* Nested routes */}
        <Outlet />

        {/* Featured Book Section */}
        <div className="w-full">
          <h2 className="font-bold text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 md:mb-8">
            Featured Book
          </h2>
          <BookCard />
        </div>

        {/* New Books Section */}
        <div className="w-full">
          <h2 className="font-bold text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 md:mb-8">
            New Books
          </h2>
          <BookCard />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
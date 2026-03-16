import React from "react";
import Navbar from "../components/Navbar";
import book_img from "../assets/book_banner.png";
import BookCard from "../components/BookCard";
import { Outlet } from "react-router-dom";

const Dashboard = () => {


  return (
    <>
      <div className="mt-8 sm:px-2 mx-20 space-y-10 my-5">
        <div className="max-w-8xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for books, authors, or ISBN..."
              className="w-full pl-8 pr-8 py-4 rounded-2xl bg-white shadow-lg shadow-gray-100/50 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all"
            />
          </div>
        </div>
        <Outlet/>
        {/* Featured Book Section */}
        <div>
          <div className="font-bold text-2xl mb-8">Featured Book</div>

            <div className="">
                <BookCard/>
            </div>
        </div>

        {/* New Books Section */}
        <div>
          <div className="font-bold text-2xl mb-8">New Books</div>
          <div className="">
                <BookCard/>
            </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;

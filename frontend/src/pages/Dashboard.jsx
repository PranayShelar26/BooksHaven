import React, {useState} from "react";
import Navbar from "../components/Navbar";
import book_img from "../assets/book_banner.png";
import BookCard from "../components/BookCard";
import { Outlet } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const Dashboard = () => {
  return (
    <>
      <div className="mt-8 sm:px-2 mx-20 space-y-10 my-5">
        <div className="max-w-8xl mx-auto mb-6">
          <SearchBar/>
        </div>
        <Outlet />
        {/* Featured Book Section */}
        <div>
          <div className="font-bold text-2xl mb-8">Featured Book</div>

          <div className="">
            <BookCard />
          </div>
        </div>

        {/* New Books Section */}
        <div>
          <div className="font-bold text-2xl mb-8">New Books</div>
          <div className="">
            <BookCard />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

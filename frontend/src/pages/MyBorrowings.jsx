import React, { useState } from "react";
import BorrowedBookList from "../components/BorrowedBookList";

const MyBorrowings = () => {
  const [tab, setTab] = useState("current");

  return (
    <>
      <div className="mt-6 sm:mt-8 px-4 sm:px-6 md:px-8 mx-auto max-w-7xl my-5 flex flex-col space-y-6 sm:space-y-8 w-full">

        {/* Header Section */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
            My Borrowings
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track your books
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setTab("current")}
            className={`px-3 sm:px-4 md:px-6 py-2 rounded-lg transition ease-in-out font-semibold text-xs sm:text-sm md:text-base ${
              tab === "current" 
                ? "bg-black text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            Current
          </button>

          <button
            onClick={() => setTab("history")}
            className={`px-3 sm:px-4 md:px-6 py-2 rounded-lg transition ease-in-out font-semibold text-xs sm:text-sm md:text-base ${
              tab === "history" 
                ? "bg-black text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            History
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-4 sm:gap-5 w-full">
          {tab === "current" && (
            <BorrowedBookList type="current" />
          )}

          {tab === "history" && (
            <BorrowedBookList type="history" />
          )}
        </div>

      </div>
    </>
  );
};

export default MyBorrowings;
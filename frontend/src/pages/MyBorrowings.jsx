import React, { useState } from "react";
import BorrowedBookList from "../components/BorrowedBookList";

const MyBorrowings = () => {
  const [tab, setTab] = useState("current");

  return (
    <>
      <div className="mt-8 flex flex-col space-y-8 mx-20 my-5">

        <div className="space-y-2">
          <h1 className="font-bold text-3xl">My Borrowings</h1>
          <h2>Manage and track your books</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("current")}
            className={`px-4 py-2 rounded-lg transition ease-in-out font-semibold  ${
              tab === "current" ? "bg-black text-white" : "bg-gray-200  hover:bg-gray-300 "
            }`}
          >
            Current
          </button>

          <button
            onClick={() => setTab("history")}
            className={`px-4 py-1 rounded-lg transition ease-in-out font-semibold ${
              tab === "history" ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            History
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {tab === "current" && (
            <>
              <BorrowedBookList />
              <BorrowedBookList />
            </>
          )}

          {tab === "history" && (
            <>
              <BorrowedBookList />
            </>
          )}
        </div>

      </div>
    </>
  );
};

export default MyBorrowings;
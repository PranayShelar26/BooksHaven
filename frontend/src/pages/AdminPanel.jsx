import React from "react";
import BookCatagoryList from "../components/BookCatagoryList";

const AdminPanel = () => {
  return (
    <>
      <div className="mt-8 flex flex-col space-y-8 mx-20 my-5">
        <div className="space-y-2">
          <div>
            <h1 className="font-bold text-3xl">Manage Books</h1>
          </div>
          <div>
            <p>Add,edit or delete books from library</p>
          </div>
        </div>

        <div>
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
        </div>

        <div className="flex flex-col rounded-2xl overflow-hidden">
            <div className="flex flex-row justify-around border-b py-2 bg-amber-300 font-semibold   ">
                <div>Books</div>
                <div>ISBN Number</div>
                <div>Category</div>
                <div>Copies</div>
                <div>Status</div> 
                <div>Actions</div>  
            </div>
            <div className="flex flex-row justify-around border-b py-2">
                <div>Books</div>
                <div>ISBN Number</div>
                <div>Category</div>
                <div>Copies</div>
                <div>Status</div> 
                <div>Actions</div>  
            </div>
            <div className="flex flex-row justify-around border-b py-2">
                <div>Books</div>
                <div>ISBN Number</div>
                <div>Category</div>
                <div>Copies</div>
                <div>Status</div> 
                <div>Actions</div>  
            </div>
            <div>

            </div>  
        </div>
      </div>
    </>
  );
};

export default AdminPanel;

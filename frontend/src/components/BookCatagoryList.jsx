  import React, { useState } from 'react'
  import { useBooks } from '../context/BookContext';

  const BookCatagoryList = () => {
      const { books, setCategory } = useBooks();
      const [activeCategory, setActiveCategory] = useState("All");

      const categories = ["All", ...new Set(books.map((book) => book.category))];

      const handleCategory = (category) => {
          setActiveCategory(category);
          setCategory(category);
      };

      return (
          <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                  <button
                      key={category}
                      onClick={() => handleCategory(category)}
                      className={`py-2 px-5 rounded-xl font-semibold cursor-pointer transition-all
                          ${activeCategory === category
                              ? "bg-amber-500 text-white"
                              : "bg-gray-200 hover:bg-amber-400 hover:text-white"
                          }`}
                  >
                      {category}
                  </button>
              ))}
          </div>
      );
  };

  export default BookCatagoryList;  
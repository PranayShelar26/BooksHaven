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
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategory(category)}
                        className={`py-2 px-3 sm:px-4 md:px-5 rounded-lg sm:rounded-xl font-semibold cursor-pointer transition-all whitespace-nowrap text-xs sm:text-sm md:text-base
                            ${activeCategory === category
                                ? "bg-amber-500 text-white"
                                : "bg-gray-200 hover:bg-amber-400 hover:text-white"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BookCatagoryList;
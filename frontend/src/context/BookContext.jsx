import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

/**
 * BookContext - Global state for books, search, and category filtering
 */
const BookContext = createContext();

/**
 * BookProvider - Provides books data and filtering state to all components
 */
export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  // Fetch all books on mount
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/books/")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter books by search query and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "All" || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <BookContext.Provider
      value={{
        books,
        setBooks,
        search,
        setSearch,
        category,
        setCategory,
        filteredBooks,
        loading,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

/**
 * useBooks - Hook to access BookContext values
 */
export const useBooks = () => useContext(BookContext);
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/books/")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "All" || book.category === category; // ✅

    return matchesSearch && matchesCategory; // ✅ both must match
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

export const useBooks = () => useContext(BookContext);

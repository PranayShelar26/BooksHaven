import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../lib/apiClient";

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

  const refreshBooks = useCallback(async () => {
    try {
      const res = await api.get("/books/");
      // Make sure it's an array
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("refreshBooks error:", err);
      setBooks([]); // ← Set to empty array on error
    }
  }, []);

  // update
  const updateBookCopies = useCallback((bookId, newAvailableCopies) => {
    if (!bookId || typeof newAvailableCopies !== "number") return;

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, available_copies: newAvailableCopies } : b,
      ),
    );
  }, []);

  // Fetch all books on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshBooks();
      setLoading(false);
    })();
  }, [refreshBooks]);

  // Filter books by search query and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      (book.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (book.author || "").toLowerCase().includes(search.toLowerCase()) ||
      (book.isbn || "").toLowerCase().includes(search.toLowerCase());

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
        updateBookCopies,
        refreshBooks,
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

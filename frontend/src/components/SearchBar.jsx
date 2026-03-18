import { useBooks } from "../context/BookContext";

const SearchBar = () => {
  const { search, setSearch } = useBooks();

  return (
    <div className="w-full">
      {/* Accessibility: label for screen readers */}
      <label htmlFor="book-search" className="sr-only">
        Search books
      </label>

      <input
        id="book-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search for books, authors, or ISBN..."
        aria-label="Search books by title, author, or ISBN"
        className="w-full pl-8 pr-8 py-4 rounded-2xl bg-white shadow-lg shadow-gray-100/50 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700 transition-all"
      />
    </div>
  );
};

export default SearchBar;
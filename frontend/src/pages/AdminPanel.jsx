import React, { useCallback, useEffect, useState } from "react";
import { useBooks } from "../context/BookContext";
import BookCatagoryList from "../components/BookCatagoryList";
import SearchBar from "../components/SearchBar";
import Spinner from "../components/Spinner";
import AddNewBookModal from "../components/AddNewBookModal";
import EditBookModal from "../components/EditBookModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import api from "../lib/apiClient";

/**
 * AdminPanel - Admin dashboard for managing books (CRUD operations)
 */
const AdminPanel = () => {
  const { search, category, loading } = useBooks();

  const [adminBooks, setAdminBooks] = useState([]);
  const [filteredAdminBooks, setFilteredAdminBooks] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    title: "",
    description: "",
    newBook: null,
    isDangerous: false,
  });
  const [deleteBookId, setDeleteBookId] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await api.get("/admin/books/");
      setAdminBooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching admin books:", err);
      alert("Error fetching books. Please try again.");
      setAdminBooks([]);
    }
  }, []);

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Filter books by search and category
  useEffect(() => {
    const q = (search || "").toLowerCase();
    const filtered = (adminBooks || []).filter((book) => {
      const title = (book.title || "").toLowerCase();
      const isbn = (book.isbn || "").toLowerCase();

      const matchesSearch = title.includes(q) || isbn.includes(q);
      const matchesCategory = category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });

    setFilteredAdminBooks(filtered);
  }, [search, category, adminBooks]);

  const handleAddBook = async (formData) => {
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("author", formData.author);
    submitData.append("isbn", formData.isbn);
    submitData.append("category", formData.category);
    submitData.append("description", formData.description);
    submitData.append("publisher", formData.publisher);
    submitData.append("published_date", formData.published_date);
    submitData.append("pages", formData.pages);
    submitData.append("language", formData.language);
    submitData.append("total_copies", formData.total_copies);

    if (formData.cover) {
      submitData.append("cover", formData.cover);
    }

    try {
      await api.post("/admin/books/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setConfirmationData({
        title: "Book Added Successfully! ✓",
        description: `"${formData.title}" by ${formData.author} has been added to the library.`,
        newBook: formData,
        isDangerous: false,
      });
      setShowConfirmation(true);
      setIsModalOpen(false);

      setTimeout(() => {
        fetchBooks();
      }, 500);
    } catch (err) {
      console.error("Error adding book:", err);
      alert("Error adding book. Please try again.");
    }
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleEditBook = async (formData) => {
    if (!selectedBook?.id) return;

    try {
      const res = await api.put(`/admin/books/${selectedBook.id}/`, formData);

      if (res.data?.ok) {
        setConfirmationData({
          title: "Book Updated Successfully! ✓",
          description: `"${formData.title}" has been updated.`,
          newBook: formData,
          isDangerous: false,
        });
        setShowConfirmation(true);
        setIsEditModalOpen(false);

        setTimeout(() => {
          fetchBooks();
        }, 500);
      } else {
        alert("Error: " + (res.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating book:", err);
      alert("Error updating book. Please try again.");
    }
  };

  const handleDeleteClick = (book) => {
    setDeleteBookId(book.id);
    setConfirmationData({
      title: "Delete Book?",
      description: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      newBook: null,
      isDangerous: true,
    });
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBookId) return;

    try {
      await api.delete(`/admin/books/${deleteBookId}/`);

      setShowConfirmation(false);
      setDeleteBookId(null);

      setTimeout(() => {
        alert("Book deleted successfully!");
        fetchBooks();
      }, 300);
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Error deleting book. Please try again.");
    }
  };

  if (loading || adminBooks.length === 0) {
    return <Spinner />;
  }

  return (
    <>
      <AddNewBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBook}
      />

      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        book={selectedBook}
        onSubmit={handleEditBook}
      />

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setDeleteBookId(null);
        }}
        onConfirm={deleteBookId ? handleConfirmDelete : () => setShowConfirmation(false)}
        title={confirmationData.title}
        description={confirmationData.description}
        confirmText={deleteBookId ? "Delete" : "Done"}
        cancelText={deleteBookId ? "Cancel" : undefined}
        isDangerous={confirmationData.isDangerous}
      />

      <div className="mt-6 sm:mt-8 flex flex-col space-y-6 sm:space-y-8 mx-auto px-4 sm:px-6 md:px-8 lg:mx-20 my-5 max-w-full">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="font-bold text-2xl sm:text-3xl">Manage Books</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Add, edit or delete books from library
          </p>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <SearchBar type="books" />
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
              aria-label="Add new book"
            >
              + Add New Book
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <BookCatagoryList />
            </div>
          </div>
        </div>

        {/* Table & Card View */}
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Book</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">ISBN</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Copies</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 lg:px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 lg:px-6 py-3 font-semibold text-sm">{book.title}</td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm">{book.isbn}</td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm">{book.category}</td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm">
                      {book.available_copies}/{book.total_copies}
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          book.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleEditClick(book)}
                          className="px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                          aria-label={`Edit book ${book.title}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(book)}
                          className="px-3 py-1 text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          aria-label={`Delete book ${book.title}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {filteredAdminBooks.map((book) => (
              <div
                key={book.id}
                className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-all space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{book.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{book.isbn}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      book.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {book.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium">{book.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Copies</p>
                    <p className="font-medium">
                      {book.available_copies}/{book.total_copies}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(book)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                    aria-label={`Edit book ${book.title}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(book)}
                    className="flex-1 px-3 py-2 text-xs font-semibold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    aria-label={`Delete book ${book.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
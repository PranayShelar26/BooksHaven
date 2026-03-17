import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import ConfirmationDialog from "../components/ConfirmationDialog";

const Navbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmation(true);
    setMobileMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/logout/",
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (res.data.ok) {
        setUser(null);
        setShowConfirmation(false);
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "px-3 sm:px-4 py-2 bg-amber-700 text-white font-medium rounded-2xl text-sm sm:text-base"
      : "px-3 sm:px-4 py-2 bg-white text-black font-medium hover:bg-black hover:text-white rounded-2xl transition-all text-sm sm:text-base";

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? "block text-center py-2 bg-amber-700 text-white font-medium text-base"
      : "block text-center py-2 border-b-1 text-black font-medium hover:bg-black hover:text-white transition-all text-base";

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to log in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={true}
      />

      {/* Main Navbar */}
      <div className="sticky top-0 z-50 bg-linear-to-r from-amber-500 to-orange-600 py-3 sm:py-4 px-0 transition ease-in-out">
        <div className="flex flex-row justify-between items-center px-4 sm:px-4">
          
          {/* Logo */}
          <div className="font-bold text-lg sm:text-xl text-white shrink-0">
            BooksHaven
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-row gap-2 lg:gap-4">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/book-catalogue" className={linkClass}>
              Catalogue
            </NavLink>
            <NavLink to="/my-borrowings" className={linkClass}>
              My Borrowings
            </NavLink>
          </div>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogoutClick}
            disabled={loading}
            className="hidden md:block px-0 lg:px-4 py-2 border-2 border-white cursor-pointer text-white font-medium hover:bg-white hover:border-white hover:text-black rounded-xl transition-all disabled:opacity-50 text-sm lg:text-base"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle mobile menu"
          >
            <span
              className={`w-6 h-0.5 bg-white transition-all ${
                mobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all ${
                mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4 pb-2 border-t border-orange-700 pt-4 px-4">
            <NavLink
              to="/dashboard"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/book-catalogue"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalogue
            </NavLink>
            <NavLink
              to="/my-borrowings"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Borrowings
            </NavLink>
            
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogoutClick}
              disabled={loading}
              className="w-full px-4 py-2 cursor-pointer text-white font-medium bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50 text-base rounded mt-2"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
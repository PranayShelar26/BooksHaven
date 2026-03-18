import React, { useCallback, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../lib/apiClient";
import ConfirmationDialog from "../components/ConfirmationDialog";

const AdminNavbar = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setMobileMenuOpen(false);
  }, []);

  const handleLogoutClick = useCallback(() => {
    setShowConfirmation(true);
    setMobileMenuOpen(false);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/logout/");

      if (res.data?.ok) {
        setUser(null);
        setShowConfirmation(false);
        setMobileMenuOpen(false);
        navigate("/admin-login");
      } else {
        setShowConfirmation(false);
      }
    } catch (err) {
      console.error("Logout failed:", err);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  const linkClass = ({ isActive }) =>
    isActive
      ? "px-3 sm:px-4 py-2 bg-amber-700 text-white font-medium rounded-2xl text-sm sm:text-base"
      : "px-3 sm:px-4 py-2 bg-white text-black font-medium hover:bg-black hover:text-white rounded-2xl transition-all text-sm sm:text-base";

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? "block text-center py-2 bg-amber-700 text-white font-medium text-base"
      : "block text-center py-2 border-b border-orange-400 text-black font-medium hover:bg-black hover:text-white transition-all text-base";

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={closeConfirmation}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out from the admin panel? You will need to log in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={true}
      />

      <div className="sticky top-0 z-50 bg-linear-to-r from-amber-500 to-orange-600 py-2 sm:py-3 px-0">
        {/* Main navbar content */}
        <div className="flex flex-row justify-between items-center px-4 sm:px-5">
          {/* Logo */}
          <div className="shrink-0">
            <div className="font-medium text-white text-sm sm:text-base">BooksHaven</div>
            <div className="text-white font-light text-xs sm:text-sm">AdminPanel</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-row gap-3 lg:gap-4">
            <NavLink to="/admin-dashboard" className={linkClass}>
              Manage Books
            </NavLink>
            <NavLink to="/manage-users" className={linkClass}>
              Manage Users
            </NavLink>
          </div>

          {/* Desktop Logout Button */}
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loading}
            className="hidden md:block px-4 py-2 border-2 border-white cursor-pointer text-white font-medium hover:bg-white hover:border-white hover:text-black rounded-xl transition-all disabled:opacity-50 text-sm lg:text-base"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-nav"
          >
            <span
              className={`w-6 h-0.5 bg-white transition-all ${
                mobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-white transition-all ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-white transition-all ${
                mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          id="admin-mobile-nav"
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-3 pb-2 border-t border-orange-700 pt-3 px-4 space-y-2">
            <NavLink
              to="/admin-dashboard"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Manage Books
            </NavLink>

            <NavLink
              to="/manage-users"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Manage Users
            </NavLink>

            {/* Mobile Logout Button */}
            <button
              type="button"
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

export default AdminNavbar;
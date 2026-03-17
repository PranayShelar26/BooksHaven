import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from "../context/UserContext";
import axios from 'axios';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Navbar = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLogoutClick = () => {
    setShowConfirmation(true);
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
        navigate("/admin-login");
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
      ? 'px-4 py-2 bg-amber-700 text-white font-medium rounded-2xl'
      : 'px-4 py-2 bg-white text-black font-medium hover:bg-black hover:text-white rounded-2xl'

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out from the admin panel? You will need to log in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={true}
      />

      <div className='sticky top-0 z-50 flex flex-row justify-between items-center bg-linear-to-r from-amber-500 to-orange-600 py-2 px-5'>
        <div>
          <div className='font-medium text-white'>BooksHaven</div>
          <div className='text-white font-light'>AdminPanel</div>
        </div>

        <div className='flex flex-row gap-4'>
          <NavLink to="/admin-dashboard" className={linkClass}>Manage Books</NavLink>
          <NavLink to="/manage-users" className={linkClass}>Manage Users</NavLink>
        </div>

        <div>
          <button
            onClick={handleLogoutClick}
            disabled={loading}
            className='px-4 py-2 border-2 cursor-pointer text-white font-medium hover:bg-white hover:border-white hover:text-black rounded-xl transition-all disabled:opacity-50'
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar
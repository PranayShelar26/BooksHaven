import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? 'px-4 py-2 bg-amber-700 text-white font-medium rounded-2xl'
      : 'px-4 py-2 bg-white text-black font-medium hover:bg-black hover:text-white rounded-2xl'

  return (
    <div className='sticky top-0 z-50 flex flex-row justify-between items-center bg-linear-to-r from-amber-500 to-orange-600 py-2 px-5'>
      <div className='font-medium text-white'>BooksHaven</div>

      <div className='flex flex-row gap-4'>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/book-catalogue" className={linkClass}>Catalogue</NavLink>
        <NavLink to="/my-borrowings" className={linkClass}>My Borrowings</NavLink>
      </div>

      <div>
        <NavLink
          to="/"
          className='px-4 py-2 border-2 text-white font-medium hover:bg-white hover:border-white hover:text-black rounded-xl'
        >
          Logout  
        </NavLink>
      </div>
    </div>
  )
}

export default Navbar
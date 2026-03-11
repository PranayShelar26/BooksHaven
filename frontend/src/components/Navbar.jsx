import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <>
     <div className='sticky top-0 z-50 flex flex-row justify-between align-middle items-center bg-linear-to-r from-amber-500 to-orange-600  py-2 px-5'>
        <div className='font-medium'>
            BooksHaven
        </div>
        <div className='flex flex-row gap-4 '>
            <Link to="/dashboard" className='px-4 py-2 bg-white font-medium hover:bg-black hover:text-white rounded-2xl'>Dashboard</Link>
            <Link to="/book-catalogue" className='px-4 py-2 bg-white font-medium hover:bg-black hover:text-white rounded-2xl'>Catalogue</Link>
            <Link to="/" className='px-4 py-2 bg-white font-medium hover:bg-black hover:text-white  rounded-2xl'>My borrowings</Link>
        </div>

        <div>
            <Link to="/" className='px-4 py-2 border-2  text-white font-medium hover:bg-white hover:border-white hover:text-black rounded-xl'>Logout</Link>
        </div>
     </div> 
    </>
  )
}

export default Navbar

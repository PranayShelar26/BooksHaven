import React, { useEffect, useState } from 'react'
import book_img from "../assets/book_banner.png";   
import { Link } from 'react-router-dom'
import axios from 'axios';
const BorrowedBookList = () => {
    const[books,setBooks]= useState([]);
    useEffect(()=>{
        axios.get("http://127.0.0.1:8000/api/loans/my/")
        .then((res)=>{
            setBooks(res.data)
        }).catch(err=>console.log(err))
    },[])
  return (
    <>  
     <div className="px-8 py-4 ring flex flex-row justify-between ring-gray-500 rounded-xl items-center">
          {/* Left section */}
          <div className="flex gap-4 items-center">
            <div className="rounded-xl overflow-hidden h-40 w-30">
              <img
                src={book_img}
                alt="book_img"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-semibold text-xl">Book Title</h1>
              <p>Author Name</p>
              <p>Borrowed Date</p>
              <div className='mt-2 flex gap-2'>
                <Link to='/' className='px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl font-medium text-white'>View Details</Link>
                <Link to='/' className='px-4 py-2 transition ease-in-out font-medium border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white'>Return</Link>
                </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex flex-col gap-5  text-right self-start">
            <div className='text-start px-4 py-1 bg-orange-200 rounded-xl'>14 days left</div>
            <div>End Date</div>
          </div>
        </div> 
    </>
  )
}

export default BorrowedBookList

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getBook } from "../api/bookservice.js";
import book_img from "../assets/book_banner.png";
import Spinner from "../components/Spinner.jsx";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "/dashboard";
  useEffect(() => {
    getBook(id).then((res) => {
      setBook(res.data);
      console.log(res.data);
    });
  }, [id]);

  if (!book) {
    return <Spinner/>;
  }

  return (
    <>
      <div className="mt-8 mx-40 my-5 space-y-8 min-h-screen ">

        {/* Back Button */}
        <div>
          <button
            onClick={() => {
              if (location.state?.from) {
                navigate(location.state.from);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300   rounded-xl font-semibold hover:cursor-pointer transition-all"
          >
            Back
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-[40%_60%] lg:gap-10">
          {/* Book Image */}
          <div className="rounded-xl overflow-hidden lg:h-150">
            <img
              src={book_img}
              alt="book"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book Details */}
          <div className="flex flex-col lg:gap-5">
            <h1 className="text-3xl font-bold">{book.title}</h1>

            <h2 className="text-xl text-gray-700"><span className="text-black text-lg">Author :</span> {book.author}</h2>
            <div>
              <h3 className="text-lg ">Description : </h3>
              <p className="mt-2 text-gray-700 leading-relaxed">{book.description}</p>
            </div>
            

            {/* Book Info Box */}
            <div className="flex flex-col gap-4 p-5 bg-gray-200 rounded-xl">
              <h1 className="text-xl font-semibold">Book Details</h1>

              <div className="flex justify-between">
                <div>Pages</div>
                <div>{book.pages || "N/A"}</div>
              </div>

              <div className="flex justify-between">
                <div>Published Date</div>
                <div>{book.published_date || "N/A"}</div>
              </div>

              <div className="flex justify-between">
                <div>Publisher</div>
                <div>{book.publisher || "N/A"}</div>
              </div>

              <div className="flex justify-between">
                <div>Language</div>
                <div>{book.language || "N/A"}</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button className="p-3 bg-amber-500 hover:bg-amber-600 w-full rounded-xl font-bold text-white transition">
                Borrow
              </button>

              <button className="p-3 border border-gray-400 hover:bg-gray-200 w-full rounded-xl font-bold transition">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetail;

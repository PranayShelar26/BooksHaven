import React, { useState } from 'react'

const BookCatagoryList = () => {
    const [activate, setActivate] = useState(false);
  return (
    <>
      <div className="flex flex-row gap-2">
          <div className="py-1 px-5 rounded-xl font-semibold bg-amber-400">All</div>
        </div>
    </>
  )
}

export default BookCatagoryList

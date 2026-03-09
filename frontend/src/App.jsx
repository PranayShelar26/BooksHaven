import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios"

function App() {
  const [books, setBooks] = useState([]);

  useEffect(()=>{
    axios.get("http://127.0.0.1:8000/api/books/")
    .then(res => setBooks(res.data))
  },[])

  return (
    <>
    <div>
      <h1>Books</h1>

      {books.map(book => {
        <p key={book.id}>{book.title}</p>
      })}
    </div>
    </>
  )
}

export default App

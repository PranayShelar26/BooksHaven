import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from "axios"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import { BrowserRouter, Routes,Route,Link } from "react-router-dom"
import Dashboard from './pages/Dashboard'
import BookCatalogue from './pages/BookCatalogue'
function App() {
  // const [books, setBooks] = useState([]);

  // useEffect(()=>{
  //   axios.get("http://127.0.0.1:8000/api/books/")
  //   .then(res => {setBooks(res.data) 
  //     console.log(res.data)
  //   })
  //   .catch(err => console.log(err));
  // },[])



  return (
    <>  
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/dashboard' element={<Dashboard/>}></Route>
      <Route path='/book-catalogue' element={<BookCatalogue/>}></Route>
    </Routes> 
      
      
    </BrowserRouter>
    </>
  )
}

export default App
  
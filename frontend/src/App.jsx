import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BookCatalogue from "./pages/BookCatalogue";
import MyBorrowings from "./pages/MyBorrowings";
import Navbar from "./components/Navbar";
import BookDetail from "./pages/BookDetail";
import AdminPanel from "./pages/AdminPanel";
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
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route path="/dashboard" element={<Dashboard />}>
            </Route>
            <Route path="/book-catalogue" element={<BookCatalogue />}>
            </Route>
            <Route path="/my-borrowings" element={<MyBorrowings />}>
            </Route>
            <Route path="/books/:id" element={<BookDetail/>}></Route>
            
            <Route path="/adminpanel" element={<AdminPanel/>}></Route>
          </Routes> 
        </LayoutWrapper>
      </BrowserRouter>
    </>
  );
}

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar/>}
      {children}
    </>
  );
};

export default App;

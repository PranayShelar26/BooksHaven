import { BrowserRouter, Routes, Route, useLocation  } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import BookCatalogue from "./pages/BookCatalogue";
import MyBorrowings from "./pages/MyBorrowings";
import BookDetail from "./pages/BookDetail";
import Navbar from "./components/Navbar";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";
import AdminPanel from "./pages/AdminPanel"
import AdminManageUsers from "./pages/AdminManageUsers";
import AdminNavbar from "./components/AdminNavbar";
function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <LayoutWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Login/>}></Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/book-catalogue" element={<BookCatalogue />} />
              <Route path="/my-borrowings" element={<MyBorrowings />} />
              <Route path="/books/:id" element={<BookDetail />} />
            </Route>
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route element={<AdminRoute />}>
                <Route path="/admin-dashboard" element={<AdminPanel/>} />
                <Route path="/manage-users" element={<AdminManageUsers/>} />
            </Route>
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </UserProvider>
  );
}

const LayoutWrapper = ({ children }) => {
  const location = useLocation(); // <-- use React Router hook
  const hideNavbarPages = ["/login", '/',"/signup",'/admin-login','/admin-dashboard','/manage-users'];
  const adminPages = ['/admin-dashboard','/manage-users']
  
  const showNavbar = !hideNavbarPages.includes(location.pathname)
  const showAdminNavbar = adminPages.includes(location.pathname)
  return (
    <> 
      {showAdminNavbar ? <AdminNavbar/> : showNavbar && <Navbar />}
      {children}
    </>
  );



  return(
    <>
    {}
    </>
  )


};

export default App;
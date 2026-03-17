import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/auth/me/", { withCredentials: true })
      .then((res) => {
        // 👈 add this line
        if (res.data.authenticated) setUser(res.data.user);
      })
      .catch((err) => {
        console.error(
          "Session check failed:",
          err.response?.status,
          err.response?.data,
        ); // 👈 add this line
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ users,setUsers,user, setUser, loading , search, setSearch}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

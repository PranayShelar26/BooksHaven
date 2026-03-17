import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
const AdminRoute = () => {
    const { user, loading } = useUser();
    const location = useLocation();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/admin-login" replace state={{ from: location }} />;
    if (!user.is_admin) return <Navigate to="/dashboard" replace />; // logged in but not admin

    return <Outlet />;
};

export default AdminRoute;
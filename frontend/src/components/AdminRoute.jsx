import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * AdminRoute - Protected route component for admin-only pages
 * Verifies user is authenticated and has admin privileges
 */
const AdminRoute = () => {
    const { user, loading } = useUser();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) return <p>Loading...</p>;
    
    // Redirect to admin login if not authenticated
    if (!user) return <Navigate to="/admin-login" replace state={{ from: location }} />;
    
    // Redirect to dashboard if logged in but not admin
    if (!user.is_admin) return <Navigate to="/dashboard" replace />;

    // Allow access to admin routes
    return <Outlet />;
};

export default AdminRoute;
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    /* =========================
       ⏳ Loading State
    ========================= */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    /* =========================
       🔐 Not Authenticated
    ========================= */
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    /* =========================
       🚫 Role Check
    ========================= */
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        const roleRedirectMap = {
            patient: "/patient",
            doctor: "/doctor",
            admin: "/admin",
        };

        return <Navigate to={roleRedirectMap[user?.role] || "/"} replace />;
    }


    return children;
};

export default ProtectedRoute;
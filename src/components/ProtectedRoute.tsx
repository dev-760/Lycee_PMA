import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/api/auth.types";

export default function ProtectedRoute({
    allowedRoles,
}: {
    allowedRoles?: UserRole[];
}) {
    const { isAuthenticated, hasRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}

import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./AuthContext";

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAdminAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--pth-bg)]">
                <div className="text-sm text-[var(--pth-muted)]">Loading admin...</div>
            </div>
        );
    }
    if (!user) return <Navigate to="/admin/login" replace />;
    return children;
};

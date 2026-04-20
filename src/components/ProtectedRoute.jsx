import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, reqRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, and the user doesn't have it
  // But Admin can access everything
  if (reqRole && currentUser.role !== "admin" && currentUser.role !== reqRole) {
    return <Navigate to="/" replace />; // Kick back to dash
  }

  return children;
}

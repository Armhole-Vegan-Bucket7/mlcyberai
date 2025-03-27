
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  try {
    const { user, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // Redirect to auth page if not authenticated
    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    // Render children if authenticated
    return <>{children}</>;
  } catch (error) {
    // If the auth context isn't available yet, redirect to auth
    console.error("Auth context not available:", error);
    return <Navigate to="/auth" replace />;
  }
};

export default ProtectedRoute;

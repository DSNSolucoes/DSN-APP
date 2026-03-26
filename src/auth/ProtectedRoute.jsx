import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <div style={{ padding: 24 }}>Carregando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

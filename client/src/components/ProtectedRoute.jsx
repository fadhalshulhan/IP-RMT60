// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) return null; // belum cek sesi
  if (!user?.id) return <Navigate to="/login" replace />;

  return <Outlet />;
}

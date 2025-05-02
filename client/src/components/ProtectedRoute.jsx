import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import { useState, useEffect } from "react";

export default function ProtectedRoute() {
  const { user, initialized, isLoggingOut, isUpdatingProfile } = useSelector(
    (state) => state.auth
  );
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    if (!initialized || isLoggingOut || isUpdatingProfile) return;

    const timer = setTimeout(() => {
      if (!user?.id) {
        setShouldNavigate(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, initialized, isLoggingOut, isUpdatingProfile]);

  if (!initialized) return null;
  if (shouldNavigate) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

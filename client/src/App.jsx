// src/App.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router";
import { restoreSession } from "./redux/slices/authSlice";
import Login from "./pages/Login";
import Plants from "./pages/Plants";
import Home from "./pages/Home";
import Recommendation from "./pages/Recommendation";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // tunggu sampai restoreSession selesai (fulfilled atau rejected)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat sesi...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/plants" element={<Plants />} />
            <Route path="/recommendation" element={<Recommendation />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

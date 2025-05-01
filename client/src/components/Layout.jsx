import { Outlet } from "react-router";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="bg-neutral-100 min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-16 flex-grow">
        <Outlet />
      </main>
      <footer className="bg-green-600 text-white py-4 text-center">
        <p className="text-sm">© 2025 Plant Planner. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}

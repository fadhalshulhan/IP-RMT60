import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { logout } from "../redux/slices/authSlice";
import logo from "../assets/logo.jpg";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    // Tunda navigasi untuk memastikan ProtectedRoute tidak mengarahkan ke /login
    setTimeout(() => {
      navigate("/", { replace: true });
      setIsMenuOpen(false);
    }, 100);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-green-600 p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            navigate("/");
            setIsMenuOpen(false);
          }}
        >
          <img
            src={logo}
            alt="Plant Planner Logo"
            className="h-8 w-8 rounded-full"
          />
          <span className="text-white text-xl font-bold">Plant Planner</span>
        </div>

        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="material-icons-round text-2xl">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>

        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row md:space-x-4 items-center absolute md:static top-16 left-0 w-full md:w-auto bg-green-600 md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out z-10`}
        >
          <NavLink
            to="/"
            className="text-white hover:text-green-200 transition-all duration-200 flex items-center gap-2 text-sm py-2 md:py-0"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="material-icons-round text-lg">home</span>
            Beranda
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/plants"
                className="text-white hover:text-green-200 transition-all duration-200 flex items-center gap-2 text-sm py-2 md:py-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons-round text-lg">
                  local_florist
                </span>
                Tanaman Saya
              </NavLink>
              <NavLink
                to="/recommendation"
                className="text-white hover:text-green-200 transition-all duration-200 flex items-center gap-2 text-sm py-2 md:py-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons-round text-lg">lightbulb</span>
                Rekomendasi
              </NavLink>
              <NavLink
                to="/profile"
                className="text-white hover:text-green-200 transition-all duration-200 flex items-center gap-2 text-sm py-2 md:py-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons-round text-lg">person</span>
                Profil
              </NavLink>
              <button
                onClick={handleLogout}
                className="cursor-pointer text-white hover:text-green-200 transition-all duration-200 flex items-center gap-2 text-sm py-2 md:py-0 text-left"
              >
                <span className="material-icons-round text-lg">logout</span>
                Keluar
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="text-white hover:text-green-200 transition-all duration-200 flex items-center gap-2 text-sm py-2 md:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="material-icons-round text-lg">login</span>
              Masuk
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

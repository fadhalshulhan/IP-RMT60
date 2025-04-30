import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="bg-plant-green p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Plant Planner
        </Link>
        <div>
          {user ? (
            <>
              <Link to="/plants" className="mr-4">
                My Plants
              </Link>
              <Link to="/recommendation" className="mr-4">
                Care Recommendation
              </Link>
              <button
                onClick={() => dispatch(logout())}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-500 px-4 py-2 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import { useDispatch, useSelector } from "react-redux";
import { loginWithGoogle } from "../redux/slices/authSlice";
import { useNavigate } from "react-router";
import { useEffect, useCallback } from "react";
import bgImage from "../assets/bg-login.jpg";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      navigate("/plants");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        { theme: "outline", size: "large", width: 280 }
      );
      window.google.accounts.id.prompt();
      return () => window.google.accounts.id.cancel();
    }
    console.log("CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  }, []);

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        await dispatch(loginWithGoogle(response.credential)).unwrap();
      } catch (err) {
        console.error("Kesalahan login:", err);
      }
    },
    [dispatch]
  );

  return (
    <main className="min-h-screen flex">
      <div className="hidden md:block w-1/2">
        <img
          src={bgImage}
          alt="Ilustrasi tanaman"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex items-center justify-center w-full md:w-1/2 bg-gradient-to-br from-green-200 to-green-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full transition-transform hover:scale-[1.02]">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Masuk ke Plant Planner
          </h1>

          {loading ? (
            <div className="flex justify-center items-center space-x-2">
              <svg
                className="animate-spin h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-gray-700">Sedang masuk…</span>
            </div>
          ) : (
            <div id="googleSignInButton" className="flex justify-center" />
          )}

          <p className="text-center text-gray-500 text-xs mt-6">
            Dengan masuk, Anda menyetujui&nbsp;
            <a href="/terms" className=" hover:text-green-700">
              Syarat & Ketentuan
            </a>
            &nbsp;dan&nbsp;
            <a href="/privacy" className=" hover:text-green-700">
              Kebijakan Privasi
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

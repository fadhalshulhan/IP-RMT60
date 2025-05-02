import { useDispatch, useSelector } from "react-redux";
import { login, loginWithGoogle } from "../redux/slices/authSlice";
import { useNavigate } from "react-router";
import { useEffect, useCallback, useState } from "react";
import bgImage from "../assets/bg-login.jpg";
import LoadingSpinnerLottie from "../components/LoadingSpinnerLottie";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, initialized } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialized && user?.id && !error) {
      navigate("/plants");
    }
  }, [user, error, initialized, navigate]);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const renderGoogleButton = () => {
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton"),
          { theme: "outline", size: "large", width: 280 }
        );
      };

      renderGoogleButton();
      window.google.accounts.id.prompt();

      if (!loading) {
        renderGoogleButton();
      }

      return () => window.google.accounts.id.cancel();
    }
    console.log("CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  }, [loading]);

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        await dispatch(loginWithGoogle(response.credential)).unwrap();
      } catch (err) {
        console.error("Kesalahan login dengan Google:", err);
      }
    },
    [dispatch]
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
    } catch (err) {
      console.error("Kesalahan login dengan email/password:", err);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Jika masih memuat sesi, tampilkan loading
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat sesi...</p>
      </div>
    );
  }

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

          {error && error !== "No token found" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center space-x-2 mb-4">
              <LoadingSpinnerLottie size={24} />
              <span className="text-gray-700">Sedang masuk…</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Masukkan email Anda"
                // required
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Masukkan password Anda"
                // required
              />
              <span
                onClick={toggleShowPassword}
                className="material-icons-round absolute right-4 top-8 text-gray-500 cursor-pointer"
              >
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Masuk
            </button>
          </form>

          <div className="flex items-center justify-center mb-4">
            <div className="border-t w-1/3"></div>
            <span className="mx-2 text-gray-500">atau</span>
            <div className="border-t w-1/3"></div>
          </div>

          <div id="googleSignInButton" className="flex justify-center mb-4" />

          <p className="text-center text-gray-500 text-sm">
            Belum punya akun?{" "}
            <a href="/register" className="text-green-600 hover:text-green-700">
              Daftar di sini
            </a>
          </p>

          <p className="text-center text-gray-500 text-xs mt-6">
            Dengan masuk, Anda menyetujui{" "}
            <a href="/terms" className="hover:text-green-700">
              Syarat & Ketentuan
            </a>{" "}
            dan{" "}
            <a href="/privacy" className="hover:text-green-700">
              Kebijakan Privasi
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

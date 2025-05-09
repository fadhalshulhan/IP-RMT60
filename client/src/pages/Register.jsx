import { useDispatch, useSelector } from "react-redux";
import { register, loginWithGoogle } from "../redux/slices/authSlice";
import { useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import LoadingSpinnerLottie from "../components/LoadingSpinnerLottie";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const fetchImageFromPixabay = async () => {
      try {
        const response = await fetch(
          `https://pixabay.com/api/?key=${
            import.meta.env.VITE_PIXABAY_API_KEY
          }&q=${import.meta.env.VITE_PIXABAY_QUERY}&image_type=photo&per_page=${
            import.meta.env.VITE_PIXABAY_PER_PAGE
          }`
        );
        const data = await response.json();
        const randomImage =
          data.hits[Math.floor(Math.random() * data.hits.length)];
        setBgImage(randomImage.largeImageURL);
      } catch (err) {
        console.error("Gagal mengambil gambar dari Pixabay:", err);
        setBgImage(import.meta.env.VITE_FALLBACK_IMAGE_URL);
      }
    };
    fetchImageFromPixabay();
  }, []);

  useEffect(() => {
    if (user?.id && !error) {
      navigate("/plants");
    }
  }, [user, error, navigate]);

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
        console.error("Kesalahan registrasi dengan Google:", err);
      }
    },
    [dispatch]
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Password dan konfirmasi password tidak cocok");
      return;
    }
    try {
      await dispatch(
        register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })
      ).unwrap();
    } catch (err) {
      console.error("Kesalahan registrasi:", err);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
            Daftar ke Plant Planner
          </h1>

          {error && error !== "No token found" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {passwordError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {passwordError}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center space-x-2 mb-4">
              <LoadingSpinnerLottie size={24} />
              <span className="text-gray-700">Sedang mendaftar…</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Nama
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Masukkan nama Anda"
                // required
              />
            </div>
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
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Konfirmasi Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Konfirmasi password Anda"
                // required
              />
              <span
                onClick={toggleShowConfirmPassword}
                className="material-icons-round absolute right-4 top-8 text-gray-500 cursor-pointer"
              >
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Daftar
            </button>
          </form>

          <div className="flex items-center justify-center mb-4">
            <div className="border-t w-1/3"></div>
            <span className="mx-2 text-gray-500">atau</span>
            <div className="border-t w-1/3"></div>
          </div>

          <div id="googleSignInButton" className="flex justify-center mb-4" />

          <p className="text-center text-gray-500 text-sm">
            Sudah punya akun?{" "}
            <a href="/login" className="text-green-600 hover:text-green-700">
              Masuk di sini
            </a>
          </p>

          <p className="text-center text-gray-500 text-xs mt-6">
            Dengan mendaftar, Anda menyetujui{" "}
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

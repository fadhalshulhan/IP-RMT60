import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import api from "../helpers/api";
import Button from "../components/Button";
import { useNavigate } from "react-router";
import {
  startUpdatingProfile,
  finishUpdatingProfile,
  updateProfile,
} from "../redux/slices/authSlice";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    picture: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/users/profile");
        setProfileData(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          picture: response.data.picture || "",
          password: "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Gagal mengambil data profil");
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(startUpdatingProfile()); // Profil sedang diperbarui

      const response = await api.put("/api/users/profile", formData);
      setProfileData(response.data);

      const isPasswordChanged =
        formData.password && formData.password.trim() !== "";
      let updatedToken = localStorage.getItem("token");

      if (isPasswordChanged) {
        const refreshResponse = await api.post("/api/auth/refresh-token");
        updatedToken = refreshResponse.data.token;
        localStorage.setItem("token", updatedToken);
        setSuccess("Profil dan password berhasil diperbarui.");
        setTimeout(() => setSuccess(""), 1000);
      } else {
        setSuccess("Profil berhasil diperbarui.");
        setTimeout(() => setSuccess(""), 1000);
      }

      // State user di Redux menggunakan aksi updateProfile
      dispatch(
        updateProfile({
          token: updatedToken,
          user: {
            id: response.data.userId,
            email: response.data.email,
            name: response.data.name,
            picture: response.data.picture,
          },
        })
      );

      setError("");
      setIsEditing(false);

      dispatch(finishUpdatingProfile()); // Pembaruan selesai
      navigate("/profile");
    } catch (err) {
      dispatch(finishUpdatingProfile()); // Selesai meskipun gagal
      setError(err.response?.data?.message || "Gagal memperbarui profil");
      setSuccess("");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat profil...</p>
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
            Profil Saya
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center mb-4 text-sm">
              {success}
            </div>
          )}

          {isEditing ? (
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
                  className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  required
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
                  className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  required
                  disabled
                />
              </div>
              <div>
                <label
                  htmlFor="picture"
                  className="block text-gray-700 text-sm font-medium mb-1"
                >
                  URL Foto Profil
                </label>
                {formData.picture && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={formData.picture}
                      alt="Profile Preview"
                      className="h-16 w-16 rounded-full border-2 border-green-400 object-cover"
                    />
                  </div>
                )}
                <input
                  type="text"
                  id="picture"
                  name="picture"
                  value={formData.picture}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none text-sm break-words"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-medium mb-1"
                >
                  {profileData.password
                    ? "Ubah Password"
                    : "Set Password (Untuk Login Google)"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  placeholder={
                    profileData.password
                      ? "Masukkan password baru (opsional)"
                      : "Set password untuk login manual"
                  }
                />
                <span
                  onClick={toggleShowPassword}
                  className="material-icons-round absolute right-4 top-8 text-gray-500 cursor-pointer"
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </div>
              <div className="flex justify-between space-x-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="w-full text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
                  variant="dark"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                >
                  Simpan
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                {profileData.picture ? (
                  <img
                    src={profileData.picture}
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-2 border-green-400 object-cover"
                  />
                ) : (
                  <span className="material-icons-round text-6xl border-2 border-green-400 bg-green-600 rounded-full p-2 text-white">
                    person
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Nama:</strong> {profileData.name}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {profileData.email}
                </p>
                <p className="text-gray-700 break-words">
                  <strong>URL Foto Profil:</strong>{" "}
                  {profileData.picture || "Tidak ada"}
                </p>
                <p className="text-gray-700">
                  <strong>Password:</strong>{" "}
                  {profileData.password
                    ? "Sudah diatur"
                    : "Belum diatur (Login via Google)"}
                </p>
                <p className="text-gray-700">
                  <strong>Tanggal Dibuat:</strong>{" "}
                  {new Date(profileData.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <strong>Tanggal Diperbarui:</strong>{" "}
                  {new Date(profileData.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
              >
                Edit Profil
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

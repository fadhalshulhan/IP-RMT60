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
      } else {
        setSuccess("Profil berhasil diperbarui.");
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Profil Saya
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center">
            {success}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
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
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
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
                required
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="picture"
                className="block text-sm font-medium text-gray-700"
              >
                URL Foto Profil
              </label>
              <input
                type="text"
                id="picture"
                name="picture"
                value={formData.picture}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
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
                className="w-full px-3 py-2 rounded focus:outline-none bg-neutral-100 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder={
                  profileData.password
                    ? "Masukkan password baru (opsional)"
                    : "Set password untuk login manual"
                }
              />
              <span
                onClick={toggleShowPassword}
                className="material-icons-round absolute right-4 top-7 text-gray-500 cursor-pointer"
              >
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
            <div className="flex justify-between space-x-2">
              <Button
                variant="dark"
                onClick={() => setIsEditing(false)}
                className="w-full"
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" className="w-full">
                Simpan
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {profileData.picture ? (
                <img
                  src={profileData.picture}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-2 border-green-400 bg-green-600"
                />
              ) : (
                <span className="material-icons-round text-6xl border-2 border-green-400 bg-green-600 rounded-full p-2">
                  person
                </span>
              )}
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Nama:</strong> {profileData.name}
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> {profileData.email}
              </p>
              <p className="text-gray-700">
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
              variant="primary"
              className="w-full"
            >
              Edit Profil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

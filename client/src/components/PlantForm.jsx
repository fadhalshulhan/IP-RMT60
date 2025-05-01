import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchWeather } from "../redux/slices/weatherSlice";
import Button from "./Button";

export default function PlantForm({ onSubmit }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    location: "",
    light: "",
    temperature: "",
  });
  const [error, setError] = useState(null);

  const formatDescription = (desc) =>
    desc
      ? desc
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : "Tidak Diketahui";

  const getLocationAndWeather = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolokasi tidak didukung oleh peramban Anda.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        dispatch(fetchWeather({ lat: latitude, lon: longitude }))
          .then((action) => {
            if (action.payload) {
              const { temperature, description, clouds, main, location } =
                action.payload;

              let lightCondition;
              if (main === "Clear" || clouds.all < 20) {
                lightCondition = `Tinggi / ${formatDescription(description)}`;
              } else if (
                description.includes("few clouds") ||
                description.includes("scattered clouds") ||
                (clouds.all >= 20 && clouds.all <= 70)
              ) {
                lightCondition = `Sedang / ${formatDescription(description)}`;
              } else {
                lightCondition = `Rendah / ${formatDescription(description)}`;
              }

              setFormData((prev) => ({
                ...prev,
                location,
                temperature: temperature.toString(),
                light: lightCondition,
              }));
              setError(null);
            } else {
              setError("Gagal mengambil data cuaca.");
            }
          })
          .catch(() => {
            setError("Gagal mengambil data cuaca.");
          });
      },
      () =>
        setError(
          "Maaf, kami belum bisa mengakses lokasi Anda. Silakan aktifkan izin lokasi."
        )
    );
  }, [dispatch]);

  useEffect(() => {
    getLocationAndWeather();
  }, [getLocationAndWeather]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.species.trim()) {
      setError("Nama dan spesies wajib diisi.");
      return;
    }
    onSubmit(formData);
    setFormData({
      name: "",
      species: "",
      location: formData.location,
      light: formData.light,
      temperature: formData.temperature,
    });
  };

  return (
    <div className="mb-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Tanaman */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Tanaman
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama tanaman (contoh: Mawar)"
                className="bg-neutral-100 p-2 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
            </div>

            {/* Spesies */}
            <div>
              <label
                htmlFor="species"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Jenis
              </label>
              <input
                type="text"
                id="species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="Masukkan spesies (misal: Monstera)"
                className="bg-neutral-100 p-2 rounded w-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
            </div>

            {/* Lokasi */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lokasi
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || "..."}
                readOnly
                className="bg-neutral-300 p-2 rounded w-full text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Cahaya */}
            <div>
              <label
                htmlFor="light"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Intensitas Cahaya
              </label>
              <input
                type="text"
                id="light"
                name="light"
                value={formData.light || "..."}
                readOnly
                className="bg-neutral-300  p-2 rounded w-full text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Suhu */}
            <div>
              <label
                htmlFor="temperature"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Suhu (°C)
              </label>
              <input
                type="text"
                id="temperature"
                name="temperature"
                value={
                  formData.temperature ? `${formData.temperature}°C` : "..."
                }
                readOnly
                className="bg-neutral-300  p-2 rounded w-full text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" variant="primary">
              Tambah Tanaman
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

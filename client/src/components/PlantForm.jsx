import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchWeather } from "../redux/slices/weatherSlice";
import Button from "./Button";
import { debounce } from "lodash";
import api from "../helpers/api";
import LoadingSpinnerLottie from "./LoadingSpinnerLottie";

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
  const [speciesError, setSpeciesError] = useState(null);
  const [speciesLoading, setSpeciesLoading] = useState(false); // State untuk loading spesies

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

  // Fungsi untuk memanggil API prediksi spesies
  const fetchSpeciesSuggestion = async (name) => {
    if (!name.trim()) {
      setFormData((prev) => ({ ...prev, species: "" }));
      setSpeciesError(null);
      return;
    }

    setSpeciesLoading(true);
    try {
      const response = await api.post("/api/plants/predict-species", { name });
      const predictedSpecies = response.data.species || "";
      setFormData((prev) => ({ ...prev, species: predictedSpecies }));
      setSpeciesError(null);
    } catch (err) {
      console.log("🚀 ~ fetchSpeciesSuggestion ~ err:", err);
      const errorMessage =
        err.response?.data?.message || "Gagal memprediksi spesies tanaman.";
      setSpeciesError(errorMessage);
      setTimeout(() => setSpeciesError(null), 5000);
      setFormData((prev) => ({ ...prev, species: "" }));
    } finally {
      setSpeciesLoading(false);
    }
  };

  const debouncedFetchSpecies = useCallback(
    debounce(fetchSpeciesSuggestion, 500),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSpeciesError(null);

    if (name === "name") {
      debouncedFetchSpecies(value);
    }
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
    setSpeciesError(null);
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
                placeholder="Masukkan nama tanaman"
                className="bg-neutral-100 px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>

            {/* Spesies */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="species"
                  className="block text-sm font-medium text-gray-700"
                >
                  Jenis Tanaman
                </label>
                <span className="text-xs text-gray-500 italic">
                  (diprediksi otomatis oleh AI)
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  placeholder="Masukkan spesies (misal: Monstera)"
                  className={`bg-neutral-100 px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-500 outline-none pr-10 ${
                    speciesError ? "border border-red-600" : ""
                  }`}
                  required
                />
                {speciesLoading && (
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinnerLottie size={48} />{" "}
                  </div>
                )}
              </div>
              {speciesError && (
                <div className="flex items-center mt-1">
                  <svg
                    className="h-4 w-4 text-red-600 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-600 text-xs">{speciesError}</p>
                </div>
              )}
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
                className="bg-neutral-300 px-3 py-2 rounded w-full text-gray-700 cursor-not-allowed"
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
                className="bg-neutral-300 px-3 py-2 rounded w-full text-gray-700 cursor-not-allowed"
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
                className="bg-neutral-300  px-3 py-2 rounded w-full text-gray-700 cursor-not-allowed"
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

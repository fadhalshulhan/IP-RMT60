import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../helpers/api";
import { fetchWeather } from "../redux/slices/weatherSlice";
import Button from "../components/Button";

function Recommendation() {
  const dispatch = useDispatch();
  const { weather } = useSelector((state) => state.weather);
  const [formData, setFormData] = useState({
    species: "",
    location: "",
    light: "",
    temperature: "",
  });
  const [recommendation, setRecommendation] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Mohon menunggu");

  const formatDescription = (desc) =>
    desc
      ? desc
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      : "Tidak Diketahui";

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolokasi tidak didukung oleh peramban Anda");
      setFormData((prev) => ({
        ...prev,
        location: "",
        temperature: "",
        light: "",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
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
                location: location,
                temperature: temperature.toString(),
                light: lightCondition,
              }));
            } else {
              setError("Gagal mengambil data cuaca");
              setFormData((prev) => ({
                ...prev,
                location: "",
                temperature: "",
                light: "",
              }));
            }
          })
          .catch(() => {
            setError("Gagal mengambil data cuaca");
            setFormData((prev) => ({
              ...prev,
              location: "",
              temperature: "",
              light: "",
            }));
          });
      },
      () => {
        setError(
          "Maaf, kami belum bisa mengakses lokasi Anda. Silakan aktifkan izin lokasi."
        );
        setFormData((prev) => ({
          ...prev,
          location: "",
          temperature: "",
          light: "",
        }));
      }
    );
  }, [dispatch]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingText("Mohon menunggu");
      return;
    }

    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setLoadingText("Mohon menunggu" + ".".repeat(dotCount));
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.species.trim()) {
      setError("Nama spesies wajib diisi");
      return;
    }

    if (formData.species.trim().length < 3) {
      setError("Nama spesies harus minimal 3 karakter");
      return;
    }

    if (!formData.location || !formData.temperature || !formData.light) {
      setError(
        "Informasi cuaca belum tersedia. Pastikan koneksi internet dan izin lokasi aktif."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/api/recommendation/care", formData);

      setRecommendation(response.data.recommendation);
      setSuccess("Rekomendasi berhasil diambil!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      setError("Gagal mengambil rekomendasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatRecommendation = (
    recommendation,
    plantName,
    species,
    location,
    light,
    temperature
  ) => {
    if (!recommendation)
      return (
        <p className="text-gray-500 text-sm italic">
          Belum ada panduan perawatan.
        </p>
      );

    const introText = `Panduan perawatan untuk ${
      plantName || "tanaman"
    } dengan spesies ${species}, ditempatkan di ${location}, dengan cahaya ${light} dan suhu ${temperature}°C:`;

    const cleanedRecommendation = recommendation
      .replace(
        /^Tentu, berikut adalah rekomendasi perawatan rinci untuk tanaman.*?:/,
        ""
      )
      .trim();

    const conclusionMatch = cleanedRecommendation.match(
      /Dengan perawatan yang tepat, tanaman.*?[\w\s]+\./
    );
    const conclusionTextRaw = conclusionMatch ? conclusionMatch[0] : null;

    const conclusionText = conclusionTextRaw
      ? conclusionTextRaw
          .replace(/tanaman mawar Anda/i, `tanaman ${plantName} Anda`)
          .replace(
            /menghasilkan bunga yang indah di dalam ruangan/i,
            "tumbuh sehat dan subur"
          )
      : `Dengan perawatan yang tepat, tanaman ${plantName} Anda akan tumbuh sehat dan subur.`;

    const finalRecommendation = conclusionTextRaw
      ? cleanedRecommendation.replace(conclusionTextRaw, "").trim()
      : cleanedRecommendation;

    const sections = finalRecommendation
      .split(/\d+\.\s/)
      .filter((section) => section.trim() !== "");

    if (sections.length >= 3) {
      sections[2] = sections[2] + (sections[3] ? "\n\n" + sections[3] : "");
      sections.splice(3, 1);
    }

    return (
      <div>
        {introText && (
          <p className="text-gray-700 font-medium text-lg mb-6">{introText}</p>
        )}
        {sections.map((section, index) => {
          const sectionTitle =
            index === 0
              ? "Penyiraman & Kelembapan Tanah"
              : index === 1
              ? "Pemupukan & Nutrisi Tanaman"
              : index === 2
              ? "Kelembapan Udara & Tips Tambahan"
              : null;

          if (!sectionTitle) return null;

          const cleanSection = section
            .replace(/\*\*/g, "")
            .replace(/\*\s/g, "");

          const parts = cleanSection
            .split(/\n+/)
            .filter((part) => part.trim() !== "");
          const formattedSubsections = [];
          let currentSubsection = null;

          parts.forEach((part) => {
            if (part.trim().endsWith(":")) {
              const heading = part.trim().slice(0, -1);
              if (
                heading === sectionTitle ||
                heading === "Penyiraman & Kelembapan Tanah" ||
                heading === "Pemupukan & Nutrisi Tanaman" ||
                heading === "Kelembapan Udara & Tips Tambahan"
              )
                return;

              currentSubsection = { heading, content: [] };
              formattedSubsections.push(currentSubsection);
            } else if (currentSubsection) {
              currentSubsection.content.push(part.trim());
            }
          });

          return (
            <div key={index} className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                {sectionTitle}
              </h4>
              {formattedSubsections.map(
                (subsection, subIndex) =>
                  subsection.content.length > 0 && (
                    <div key={subIndex} className="ml-4 mb-4">
                      <h5 className="text-md font-medium text-gray-700 mb-1">
                        {subsection.heading}
                      </h5>
                      {subsection.content.length > 1 ||
                      (subsection.content[0] &&
                        subsection.content[0].includes(":")) ? (
                        <ul className="list-disc ml-6 text-gray-600 leading-relaxed">
                          {subsection.content.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 leading-relaxed">
                          {subsection.content[0]}
                        </p>
                      )}
                    </div>
                  )
              )}
            </div>
          );
        })}
        {conclusionText && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="text-lg font-semibold text-green-800 mb-2">
              Kesimpulan
            </h4>
            <p className="text-green-700 leading-relaxed">{conclusionText}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Rekomendasi Perawatan
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="species"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Tanaman
              </label>
              <input
                type="text"
                id="species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                placeholder="Masukkan nama tanaman (contoh: Mawar)"
                className="bg-neutral-100 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-plant-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <div className="p-2 rounded bg-neutral-300 w-full">
                {formData.location || "..."}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intensitas Cahaya
              </label>
              <div className="p-2 rounded bg-neutral-300 w-full">
                {formData.light || "..."}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suhu
              </label>
              <div className="p-2 rounded bg-neutral-300 w-full">
                {formData.temperature ? `${formData.temperature}°C` : "..."}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? loadingText : "Dapatkan Rekomendasi"}
            </Button>
          </div>
        </form>
      </div>

      {recommendation && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 max-w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Rekomendasi</h3>
          {formatRecommendation(
            recommendation,
            formData.species,
            formData.species,
            formData.location,
            formData.light,
            formData.temperature
          )}
        </div>
      )}

      {weather && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Cuaca di {formData.location || "Tidak Diketahui"}
          </h3>
          <p className="text-gray-600">Suhu: {weather.temperature}°C</p>
          <p className="text-gray-600">Kelembapan: {weather.humidity}%</p>
          <p className="text-gray-600">
            Cuaca Saat Ini: {formatDescription(weather.description)}
          </p>
          <p className="text-gray-600">
            Langit Tertutup Awan: {weather.clouds.all}%
          </p>
        </div>
      )}
    </div>
  );
}

export default Recommendation;

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePlant,
  deletePlant,
  deletePlantPhoto,
  addPlantPhoto,
} from "../redux/slices/plantSlice";
import TimeAgo from "../helpers/TimeAgo";
import Shimmer from "./Shimmer";
import Button from "./Button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LoadingSpinnerLottie from "./LoadingSpinnerLottie";

function PlantCard({ plant }) {
  const dispatch = useDispatch();
  const { loading, deletingPhotoId, errors } = useSelector(
    (state) => state.plants
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDetailPhotoModal, setShowDetailPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openedFromDetailModal, setOpenedFromDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    name: plant.name,
    species: plant.species,
    location: plant.location,
    light: plant.light,
    temperature: plant.temperature,
    photo: null,
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const validTypes = ["image/jpeg", "image/png", "image/gif"];
  //   if (!validTypes.includes(file.type)) {
  //     alert("Please upload a valid image file (JPEG, PNG, or GIF)");
  //     return;
  //   }

  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     dispatch(addPlantPhoto({ plantId: plant.id, photo: reader.result }));
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleAddPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe dan ukuran
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Ukuran file terlalu besar. Silakan unggah gambar maksimal 10MB.");
      return;
    }

    // Upload ke Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "plant_photos_preset");
    formData.append("folder", "plant_photos");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Kirim URL ke server
      dispatch(
        addPlantPhoto({
          plantId: plant.id,
          photo: result.secure_url,
          uploadedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      alert("Gagal mengunggah gambar: " + error.message);
    }
  };

  const handleUpdate = () => {
    dispatch(updatePlant({ id: plant.id, plantData: formData }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tanaman ini?")) {
      dispatch(deletePlant(plant.id));
    }
  };

  const handleDeletePhoto = async (photoId, onSuccess) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
      try {
        await dispatch(deletePlantPhoto(photoId)).unwrap();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Gagal hapus foto:", err);
      }
    }
  };

  const handlePhotoClick = (photoUrl, fromDetailModal = false) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoModal(true);
    setOpenedFromDetailModal(fromDetailModal);
    if (fromDetailModal) {
      setShowDetailPhotoModal(false);
    }
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
    if (openedFromDetailModal) {
      setShowDetailPhotoModal(true);
      setOpenedFromDetailModal(false);
    }
  };

  const sortedPhotos = plant.PlantPhotos
    ? [...plant.PlantPhotos].sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )
    : [];

  const formatRecommendation = (recommendation) => {
    if (!recommendation)
      return (
        <p className="text-gray-500 text-sm italic">
          Belum ada panduan perawatan.
        </p>
      );

    const introText = `Panduan perawatan untuk ${plant.name} dengan spesies ${plant.species} di ${plant.location} dengan cahaya ${plant.light} dan suhu ${plant.temperature}°C:`;

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
          .replace(/tanaman mawar Anda/, `tanaman ${plant.species} Anda`)
          .replace(
            /menghasilkan bunga yang indah di dalam ruangan/,
            "tumbuh sehat dan subur"
          )
      : `Dengan perawatan yang tepat, ${plant.species} Anda akan tumbuh sehat dan subur.`;

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

  // Cari objek foto yang sedang di-preview
  const currentPhotoObj = selectedPhoto
    ? plant.PlantPhotos.find((p) => p.photoUrl === selectedPhoto)
    : null;

  if (loading && !plant) {
    return <Shimmer type="card" />;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Edit Mode */}
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama Tanaman"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <input
            type="text"
            name="species"
            value={formData.species}
            onChange={handleChange}
            placeholder="Jenis Tanaman"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Lokasi Penempatan"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <input
            type="text"
            name="light"
            value={formData.light}
            onChange={handleChange}
            placeholder="Kebutuhan Cahaya"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="Suhu Ideal (°C)"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          {/* <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-gray-300 rounded-lg p-2 w-full text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-green-500 file:text-white hover:file:bg-green-600 transition"
          /> */}
          <div className="flex space-x-3">
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                variant="primary"
                disabled={loading}
                className="flex-1 py-1 text-sm"
              >
                Simpan
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="dark"
                disabled={loading}
                className="flex-1 py-1 text-sm"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Plant Details */}
          <h3 className="text-2xl font-semibold text-gray-800">{plant.name}</h3>
          <div className="mt-3 space-y-2 text-gray-600 text-sm">
            <p>
              <span className="font-medium text-gray-700">Jenis:</span>{" "}
              {plant.species}
            </p>
            <p>
              <span className="font-medium text-gray-700">Lokasi:</span>{" "}
              {plant.location}
            </p>
            <p>
              <span className="font-medium text-gray-700">Cahaya:</span>{" "}
              {plant.light}
            </p>
            <p>
              <span className="font-medium text-gray-700">Suhu:</span>{" "}
              {plant.temperature}°C
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">
                Terakhir Diperbarui:
              </span>{" "}
              <TimeAgo updatedAt={plant.updatedAt} />
            </p>
          </div>

          {/* Photo History */}
          <div className="mt-5">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-800">
                Riwayat Foto
              </h4>
              <Button
                onClick={() => fileInputRef.current.click()}
                variant="text"
                disabled={loading}
                className="text-sm px-0 py-0"
              >
                Tambah Foto
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAddPhoto}
                className="hidden"
              />
            </div>

            {sortedPhotos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {sortedPhotos.slice(0, 2).map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photoUrl}
                        alt={`Foto ${plant.name}`}
                        className="w-full h-16 object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                        onClick={() => handlePhotoClick(photo.photoUrl, true)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        <TimeAgo updatedAt={photo.uploadedAt} />
                      </p>
                      <Button
                        variant="iconDelete"
                        disabled={deletingPhotoId === photo.id}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                      >
                        {deletingPhotoId === photo.id ? (
                          <LoadingSpinnerLottie />
                        ) : (
                          <span className="material-icons-round text-sm">
                            delete
                          </span>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {sortedPhotos.length > 2 && (
                  <div className="mt-3 text-center">
                    <Button
                      variant="text"
                      onClick={() => setShowDetailPhotoModal(true)}
                    >
                      Lihat Semua Foto
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm mt-3 italic">
                Belum ada foto yang diunggah.
              </p>
            )}
          </div>

          {/* Error Messages */}
          {errors.updatePlant && (
            <p className="text-red-600 text-sm mt-4 mb-3">
              {errors.updatePlant}
            </p>
          )}
          {errors.deletePlant && (
            <p className="text-red-600 text-sm mt-4 mb-3">
              {errors.deletePlant}
            </p>
          )}
          {errors.deletePlantPhoto && (
            <p className="text-red-600 text-sm mt-4 mb-3">
              {errors.deletePlantPhoto}
            </p>
          )}
          {errors.addPlantPhoto?.[plant.id] && (
            <p className="text-red-600 text-sm mt-4 mb-3">
              {errors.addPlantPhoto[plant.id]}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-5">
            <Button
              onClick={() => setShowModal(true)}
              variant="primary"
              disabled={loading}
              className="flex-1 py-1 text-sm"
            >
              Panduan
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              disabled={loading}
              className="flex-1 py-1 text-sm"
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              disabled={loading}
              className="flex-1 py-1 text-sm"
            >
              Hapus
            </Button>
          </div>
        </>
      )}

      {/* Modal untuk Rekomendasi Perawatan */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl transform transition-all duration-300 scale-100">
            <div className="sticky top-0 bg-white p-5 border-b border-gray-200 rounded-t-xl flex justify-between items-center z-10">
              <h3 className="text-xl font-semibold text-gray-800">
                Panduan Perawatan {plant.name}
              </h3>
              <Button onClick={() => setShowModal(false)} variant="iconClose">
                <span className="material-icons-round text-2xl">close</span>
              </Button>
            </div>
            <div className="p-5 overflow-y-auto">
              {formatRecommendation(plant.careRecommendation)}
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Zoom Photo History */}
      {showPhotoModal && selectedPhoto && (
        <div
          className="fixed inset-0 flex items-center justify-center z-60 transition-opacity duration-300 ease-in-out"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          onClick={handleClosePhotoModal}
        >
          <div
            className="relative w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dengan tombol Hapus Foto & Tutup */}
            <div className="sticky top-0 bg-white p-5 border-b border-gray-200 rounded-t-xl flex justify-between items-center z-10">
              <h3 className="text-xl font-semibold text-gray-800">
                Pratinjau Foto
              </h3>
              <div className="flex items-center gap-2">
                {/* Tombol Hapus Foto */}
                <Button
                  variant="iconDelete"
                  disabled={deletingPhotoId === currentPhotoObj?.id}
                  className="opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!currentPhotoObj) return;
                    handleDeletePhoto(
                      currentPhotoObj.id,
                      handleClosePhotoModal
                    );
                  }}
                >
                  {deletingPhotoId === currentPhotoObj?.id ? (
                    <LoadingSpinnerLottie />
                  ) : (
                    <span className="material-icons-round text-lg">delete</span>
                  )}
                </Button>

                {/* Tombol Tutup */}
                <Button
                  variant="iconClose"
                  onClick={handleClosePhotoModal}
                  className="opacity-100"
                >
                  <span className="material-icons-round text-lg">close</span>
                </Button>
              </div>
            </div>

            {/* Konten Foto */}
            <div className="flex-1 flex items-center justify-center p-5">
              <img
                src={selectedPhoto}
                alt={`Foto ${plant.name}`}
                className="max-w-full max-h-[calc(100vh-120px)] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Detail Photo History */}
      {showDetailPhotoModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 transition-opacity duration-300 ease-in-out"
          onClick={() => setShowDetailPhotoModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white p-5 border-b border-gray-200 rounded-t-xl flex justify-between items-center z-10">
              <h3 className="text-xl font-semibold text-gray-800">
                Semua Foto {plant.name}
              </h3>
              <Button
                variant="iconClose"
                onClick={() => setShowDetailPhotoModal(false)}
              >
                <span className="material-icons-round text-lg">close</span>
              </Button>
            </div>

            {/* Grid Foto dengan tombol hapus */}
            <div className="p-5 grid grid-cols-2 gap-4">
              {sortedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.photoUrl}
                    alt={`Foto ${plant.name}`}
                    className="w-full h-40 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => handlePhotoClick(photo.photoUrl, true)}
                  />
                  <Button
                    variant="iconDelete"
                    disabled={deletingPhotoId === photo.id}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                  >
                    {deletingPhotoId === photo.id ? (
                      <LoadingSpinnerLottie />
                    ) : (
                      <span className="material-icons-round text-sm">
                        delete
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-2">
                    <TimeAgo updatedAt={photo.uploadedAt} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantCard;

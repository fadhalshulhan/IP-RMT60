function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 text-gray-800 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Selamat Datang di Plant Planner 🌿
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Platform berkebun cerdas berbasis AI yang membantu Anda merawat
            tanaman dengan mudah, teratur, dan ramah lingkungan.
          </p>
        </div>

        {/* Fitur Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              🧠 Rekomendasi AI
            </h3>
            <p className="text-sm">
              Dapatkan saran perawatan tanaman berbasis AI sesuai dengan jenis,
              lokasi, pencahayaan, dan suhu.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              🪴 Manajemen Tanaman
            </h3>
            <p className="text-sm">
              Tambah, ubah, dan hapus tanaman Anda. Upload foto menggunakan
              Cloudinary untuk mendokumentasikan perkembangan tanaman.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              ⏰ Pengingat Perawatan
            </h3>
            <p className="text-sm">
              Terima pengingat perawatan tanaman melalui email agar tidak pernah
              terlambat menyiram atau memindahkan tanaman lagi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              🌤️ Cuaca Lokal
            </h3>
            <p className="text-sm">
              Dapatkan informasi cuaca real-time dari OpenWeatherMap untuk
              menyesuaikan perawatan tanaman Anda.
            </p>
          </div>
        </div>
        {/* Video Section */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg aspect-video mt-16">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/JkaxUblCGz0?autoplay=1&mute=1&loop=1&playlist=JkaxUblCGz0&controls=0&modestbranding=1&rel=0"
            title="Video Tanaman"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Home;

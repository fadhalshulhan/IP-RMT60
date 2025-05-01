# Plant Planner - Frontend

Plant Planner adalah platform berkebun cerdas berbasis AI yang membantu pengguna dalam merawat tanaman mereka melalui berbagai fitur, termasuk:

## ✨ Fitur Utama

- 🔐 **Autentikasi Google**
- 🪴 **CRUD Manajemen Tanaman** (tambah, ubah, hapus, lihat)
- 🧠 **Rekomendasi Perawatan Tanaman Berbasis AI** (OpenAI)
- 🌤️ **Informasi Cuaca Lokal** (OpenWeatherMap API)
- 🖼️ **Upload & Hapus Foto Tanaman** (Cloudinary)
- 📧 **Pengingat Perawatan via Email**

## 📁 Struktur Routes Frontend

| Path              | Komponen         | Keterangan                                        |
| ----------------- | ---------------- | ------------------------------------------------- |
| `/`               | `Home`           | Halaman beranda                                   |
| `/login`          | `Login`          | Halaman login menggunakan Google OAuth            |
| `/plants`         | `PlantList`      | Daftar tanaman pengguna                           |
| `/plants/:id`     | `PlantDetail`    | Detail dan edit tanaman                           |
| `/add`            | `PlantForm`      | Tambah tanaman baru                               |
| `/recommendation` | `Recommendation` | Rekomendasi perawatan dari AI                     |
| `/weather`        | `Weather`        | Info cuaca lokal (bisa berupa komponen pendukung) |

## 🛠️ Teknologi Digunakan

- React + Vite
- Tailwind CSS
- Redux Toolkit
- Axios
- JWT Authentication
- Cloudinary
- OpenAI API
- OpenWeatherMap API

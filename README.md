# Plant Planner

Plant Planner adalah platform berkebun cerdas berbasis AI yang membantu pengguna merawat tanaman mereka melalui antarmuka yang ramah pengguna dan fitur-fitur cerdas.

## ✨ Fitur Utama

- 🔐 **Autentikasi Google**: Login menggunakan Google OAuth untuk akses yang aman dan cepat.
- 🪴 **CRUD Manajemen Tanaman**: Tambah, ubah, hapus, dan lihat daftar tanaman pengguna.
- 🧠 **Rekomendasi Perawatan Tanaman Berbasis AI**: Dapatkan saran perawatan dari OpenAI berdasarkan spesies tanaman dan kondisi lingkungan.
- 🌤️ **Informasi Cuaca Lokal**: Integrasi dengan OpenWeatherMap API untuk menampilkan cuaca berdasarkan lokasi.
- 🖼️ **Upload & Hapus Foto Tanaman**: Unggah dan kelola foto tanaman menggunakan Cloudinary.
- 📧 **Pengingat Perawatan via Email**: Notifikasi otomatis untuk jadwal perawatan tanaman.
- 👤 **Manajemen Profil**: Lihat dan kelola informasi pengguna.

## 📁 Struktur Routes Frontend

Berdasarkan kode `App.jsx`, berikut adalah struktur routes frontend:

| Path              | Komponen         | Keterangan                             | Proteksi       |
| ----------------- | ---------------- | -------------------------------------- | -------------- |
| `/`               | `Home`           | Halaman beranda                        | Tidak          |
| `/login`          | `Login`          | Halaman login menggunakan Google OAuth | Tidak          |
| `/register`       | `Register`       | Halaman registrasi pengguna            | Tidak          |
| `/plants`         | `Plants`         | Daftar tanaman pengguna                | Ya (Protected) |
| `/recommendation` | `Recommendation` | Rekomendasi perawatan dari AI          | Ya (Protected) |
| `/profile`        | `Profile`        | Halaman profil pengguna                | Ya (Protected) |

### Catatan Routes

- Semua route di dalam `Layout` memiliki tampilan konsisten (misalnya, header, footer, atau sidebar).
- Route dengan `ProtectedRoute` memerlukan autentikasi (JWT token valid). Pengguna yang tidak login akan diarahkan ke `/login`.
- Route `/plants/:id` (untuk detail dan edit tanaman) dan `/add` (tambah tanaman) tidak terlihat di kode `App.jsx`, tetapi kemungkinan diimplementasikan di dalam komponen `Plants` atau sebagai sub-route.

## 🛠️ Teknologi Digunakan

- **React + Vite**: Framework frontend dan bundler untuk performa cepat.
- **Tailwind CSS**: Styling utility-first untuk desain responsif dan cepat.
- **Redux Toolkit**: Manajemen state global, termasuk autentikasi dan data pengguna.
- **Axios**: HTTP client untuk komunikasi dengan backend API.
- **JWT Authentication**: Autentikasi berbasis token untuk akses aman ke endpoint terproteksi.
- **Cloudinary**: Layanan untuk upload dan manajemen foto tanaman.
- **OpenAI API**: Menghasilkan rekomendasi perawatan tanaman berbasis AI.
- **OpenWeatherMap API**: Menyediakan data cuaca lokal.

## 🗂️ Struktur Kode Frontend

### Komponen Utama

- **App.jsx**: Komponen utama yang mengatur routing dan inisialisasi sesi autentikasi.
- **Layout.jsx**: Komponen wrapper untuk menyediakan struktur UI konsisten (misalnya, navbar, footer).
- **ProtectedRoute.jsx**: Komponen untuk melindungi route yang memerlukan autentikasi.
- **Pages**:
  - `Home`: Menampilkan beranda.
  - `Login`: Form login dengan Google OAuth.
  - `Register`: Form registrasi pengguna.
  - `Plants`: Daftar tanaman (kemungkinan termasuk sub-route untuk detail dan tambah tanaman).
  - `Recommendation`: Form dan hasil rekomendasi perawatan dari AI.
  - `Profile`: Informasi dan pengaturan pengguna.

### Redux State Management

- **authSlice**: Mengelola state autentikasi, termasuk:
  - `initialized`: Status inisialisasi sesi.
  - `user`: Data pengguna (userId, email, name, picture).
  - `token`: JWT token untuk autentikasi.
- **restoreSession**: Action untuk memeriksa dan memulihkan sesi pengguna saat aplikasi dimuat.

### Flow Autentikasi

1. Saat aplikasi dimuat, `useEffect` di `App.jsx` memanggil `restoreSession` untuk memeriksa token di local storage atau session.
2. Jika sesi belum diinisialisasi (`initialized: false`), tampilkan loading screen.
3. Jika token valid, pengguna dapat mengakses route terproteksi (`/plants`, `/recommendation`, `/profile`).
4. Jika tidak ada token atau token tidak valid, pengguna diarahkan ke `/login`.

## 📋 Detail Implementasi

### Autentikasi

- **Google OAuth**: Menggunakan Google Sign-In SDK untuk mendapatkan `googleToken`, yang dikirim ke backend (`POST /auth/google`) untuk mendapatkan JWT token.
- **Registrasi/Login Manual**: Form di `/register` dan `/login` mengirimkan data ke `POST /auth/register` dan `POST /auth/login`.
- **Sesi**: Token disimpan di Redux state dan local storage. `restoreSession` memeriksa token saat aplikasi dimuat.
- **Refresh Token**: Jika token kadaluarsa, panggil `POST /auth/refresh-token` untuk memperbarui token.

### Manajemen Tanaman

- **Daftar Tanaman**: Komponen `Plants` mengambil data dari `GET /plants` dan menampilkan daftar tanaman.
- **Tambah Tanaman**: Form di `/add` (atau sub-route di `Plants`) mengirimkan data ke `POST /plants`.
- **Edit Tanaman**: Detail tanaman di `/plants/:id` memungkinkan pembaruan via `PUT /plants/:id`.
- **Hapus Tanaman**: Tombol hapus memanggil `DELETE /plants/:id`.
- **Foto Tanaman**: Upload foto via `POST /plants/:plantId/photo` (form-data) dan hapus via `DELETE /plants/photo/:photoId`.

### Rekomendasi AI

- Komponen `Recommendation` mengirimkan data (species, location, light, temperature) ke `POST /recommendation/care` dan menampilkan hasil rekomendasi.

### Cuaca

- Komponen `Weather` (atau bagian dari komponen lain) memanggil `GET /weather?city={city}` untuk menampilkan informasi cuaca lokal.

## ⚙️ Setup dan Pengembangan

### Prasyarat

- Node.js (versi 16 atau lebih baru)
- Akun Cloudinary untuk upload foto
- API Key OpenAI untuk rekomendasi
- API Key OpenWeatherMap untuk cuaca
- Backend Plant Planner berjalan di `http://localhost:3000/api`

### Instalasi

1. Clone repository frontend.
2. Jalankan `npm install` untuk menginstal dependensi.
3. Buat file `.env` dengan variabel berikut:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_URL=http://localhost:3000/api
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
   ```
4. Jalankan `npm run dev` untuk memulai server pengembangan.

### Struktur Folder

```
src/
├── components/         # Komponen reusable (Layout, ProtectedRoute, dll.)
├── pages/             # Komponen halaman (Home, Login, Plants, dll.)
├── redux/             # Redux slices dan store
├── assets/            # Gambar, font, dll.
├── App.jsx            # Komponen utama dan routing
├── main.jsx           # Entry point
```

## 📝 Catatan Pengembangan

- **Responsivitas**: Gunakan Tailwind CSS untuk memastikan antarmuka responsif di desktop dan mobile.
- **Error Handling**: Tampilkan pesan error yang ramah pengguna (misalnya, "Token kadaluarsa, silakan login ulang") untuk setiap kegagalan API.
- **Loading States**: Tambahkan indikator loading untuk setiap panggilan API (misalnya, saat mengambil daftar tanaman atau rekomendasi).
- **Keamanan**: Jangan simpan token atau data sensitif di tempat yang tidak aman. Gunakan `localStorage` dengan hati-hati dan pertimbangkan `HttpOnly` cookies jika memungkinkan.
- **Optimasi**: Gunakan lazy loading untuk komponen besar (misalnya, `Recommendation`) dan optimalkan panggilan API dengan caching jika diperlukan.

## 🔗 Integrasi dengan Backend

- **Base URL**: `http://localhost:3000/api`
- **Autentikasi**: Kirim header `Authorization: Bearer <token>` untuk endpoint terproteksi.
- **Error Handling**: Tangani status HTTP seperti `401` (redirect ke login), `400` (tampilkan error spesifik), dan `500` (tampilkan error umum).
- **Form-data**: Untuk upload foto, gunakan `FormData` dengan Axios.

## 🚀 Fitur yang Dapat Ditambahkan

- **Pencarian Tanaman**: Filter atau cari tanaman berdasarkan nama atau spesies.
- **Notifikasi Real-time**: Gunakan WebSocket untuk pengingat perawatan.
- **Dashboard**: Ringkasan tanaman, cuaca, dan rekomendasi di beranda.
- **Lokalasi Otomatis**: Deteksi lokasi pengguna untuk cuaca menggunakan Geolocation API.

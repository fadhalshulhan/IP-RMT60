# API Documentation - Platform Plant Planner

## Base URL

`http://localhost:3000/api or https://plantplannerapi.fadhalshulhan.com`

## Authentication

- Mayoritas endpoint memerlukan JWT token di header:  
  `Authorization: Bearer <token>`
- Beberapa endpoint (misalnya, `/auth/register`, `/auth/login`, `/auth/google`, `/recommendation/care`, `/weather`) **tidak memerlukan autentikasi** untuk pengujian atau akses publik.
- Token JWT dikeluarkan dengan masa berlaku 1 jam (`expiresIn: '1h'`).

---

## Endpoints

### Auth

#### POST /auth/register

- **Deskripsi**: Mendaftarkan pengguna baru dengan email, password, dan nama.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "token": "jwt_token",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika email sudah terdaftar atau data tidak lengkap.
  - `500 Internal Server Error`: Jika terjadi kesalahan server.

#### POST /auth/login

- **Deskripsi**: Login pengguna dengan email dan password.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "jwt_token",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "picture": null
    }
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika email atau password tidak diberikan.
  - `401 Unauthorized`: Jika email atau password salah.

#### POST /auth/google

- **Deskripsi**: Autentikasi pengguna menggunakan Google token.
- **Request Body**:
  ```json
  {
    "googleToken": "google_id_token"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "jwt_token",
    "user": {
      "userId": "google_sub_id",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "url_to_google_picture"
    }
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika Google token tidak diberikan atau email sudah terdaftar dengan akun lain.
  - `401 Unauthorized`: Jika Google token kadaluarsa.
  - `500 Internal Server Error`: Jika terjadi kesalahan server.

#### GET /auth/session

- **Deskripsi**: Verifikasi token dan mengembalikan data pengguna.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "jwt_token",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "url_to_picture_or_null"
    }
  }
  ```
- **Error**:
  - `401 Unauthorized`: Jika token tidak valid atau tidak ada.

#### POST /auth/refresh-token

- **Deskripsi**: Memperbarui token JWT pengguna.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "new_jwt_token",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "url_to_picture_or_null"
    }
  }
  ```
- **Error**:
  - `401 Unauthorized`: Jika token tidak valid.
  - `404 Not Found`: Jika pengguna tidak ditemukan.
  - `500 Internal Server Error`: Jika terjadi kesalahan server.

---

### Plants

Semua endpoint di bawah ini **memerlukan autentikasi** kecuali disebutkan lain.

#### POST /plants

- **Deskripsi**: Menambahkan tanaman baru untuk pengguna.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Monstera",
    "species": "Monstera Deliciosa",
    "location": "Jakarta",
    "light": "Medium",
    "temperature": 30
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": 1,
    "name": "Monstera",
    "species": "Monstera Deliciosa",
    "location": "Jakarta",
    "light": "Medium",
    "temperature": 30
  }
  ```
- **Error**:
  - `401 Unauthorized`: Jika token tidak valid.
  - `400 Bad Request`: Jika data tidak lengkap.

#### GET /plants

- **Deskripsi**: Mengambil semua tanaman milik pengguna.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "name": "Monstera",
      "species": "Monstera Deliciosa",
      ...
    },
    ...
  ]
  ```
- **Error**:
  - `401 Unauthorized`: Jika token tidak valid.

#### PUT /plants/:id

- **Deskripsi**: Memperbarui tanaman berdasarkan ID.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Updated Monstera",
    "species": "Monstera Deliciosa"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "name": "Updated Monstera",
    ...
  }
  ```
- **Error**:
  - `401 Unauthorized`: Jika token tidak valid.
  - `404 Not Found`: Jika tanaman tidak ditemukan.

#### DELETE /plants/:id

- **Deskripsi**: Menghapus tanaman berdasarkan ID.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Plant deleted"
  }
  ```
- **Error**:
  - `401 Unauthorized`: Jika token tidak valid.
  - `404 Not Found`: Jika tanaman tidak ditemukan.

#### POST /plants/predict-species

- **Deskripsi**: Memprediksi spesies tanaman berdasarkan nama tanaman.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Monstera"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "species": "Monstera deliciosa"
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika nama tanaman tidak diberikan.
  - `502 Bad Gateway`: Jika terjadi kesalahan saat menghasilkan prediksi dari layanan AI.

#### POST /plants/:plantId/photo

- **Deskripsi**: Menambahkan foto untuk tanaman tertentu.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Request Body**:
  ```json
  {
    "photoUrl": "https://example.com/photo.jpg",
    "uploadedAt": "2025-05-09T12:00:00Z"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": 1,
    "name": "Monstera",
    "species": "Monstera deliciosa",
    "PlantPhotos": [
      {
        "id": 1,
        "photoUrl": "https://example.com/photo.jpg",
        "uploadedAt": "2025-05-09T12:00:00Z"
      }
    ]
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika `photoUrl` atau `uploadedAt` tidak valid.
  - `404 Not Found`: Jika tanaman tidak ditemukan atau pengguna tidak memiliki akses.

#### DELETE /plants/photo/:photoId

- **Deskripsi**: Menghapus foto tanaman berdasarkan ID foto.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "name": "Monstera",
    "species": "Monstera deliciosa",
    "PlantPhotos": []
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika URL foto tidak valid.
  - `404 Not Found`: Jika foto atau tanaman tidak ditemukan.
  - `403 Forbidden`: Jika pengguna tidak memiliki akses ke tanaman.

---

### Recommendation

#### POST /recommendation/care

- **Deskripsi**: Mendapatkan rekomendasi perawatan tanaman dari AI. **Tidak memerlukan autentikasi**.
- **Request Body**:
  ```json
  {
    "species": "Monstera Deliciosa",
    "location": "Jakarta",
    "light": "Medium",
    "temperature": 30
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "recommendation": "Water every 3 days, ensure indirect sunlight..."
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika data tidak lengkap.

---

### Weather

#### GET /weather?city=Jakarta

- **Deskripsi**: Mendapatkan informasi cuaca berdasarkan nama kota. **Tidak memerlukan autentikasi**.
- **Query Parameter**:
  - `city`: Nama kota (contoh: `Jakarta`)
- **Response** (`200 OK`):
  ```json
  {
    "temperature": 30,
    "humidity": 70,
    "description": "Clear"
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika parameter `city` tidak diberikan.
  - `404 Not Found`: Jika kota tidak ditemukan.

---

### Gmail OAuth

#### GET /auth/gmail

- **Deskripsi**: Mendapatkan URL autentikasi untuk Gmail API.
- **Response** (`200 OK`):
  ```json
  {
    "authUrl": "https://accounts.google.com/o/oauth2/auth?..."
  }
  ```
- **Error**:
  - `500 Internal Server Error`: Jika terjadi kesalahan saat menghasilkan URL autentikasi.

#### GET /auth/gmail/callback

- **Deskripsi**: Menangani callback dari Gmail OAuth untuk menyimpan token akses.
- **Query Parameter**:
  - `code`: Authorization code yang diberikan oleh Google.
- **Response** (`200 OK`):
  ```json
  {
    "message": "Authentication successful! Tokens have been saved."
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika authorization code tidak diberikan.
  - `500 Internal Server Error`: Jika terjadi kesalahan saat memproses token.

---

### Email Reminder

#### POST /plants/:plantId/reminder

- **Deskripsi**: Mengirimkan email pengingat perawatan tanaman kepada pengguna.
- **Header**:
  ```
  Authorization: Bearer <token>
  ```
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "plantName": "Monstera",
    "recommendation": "Water every 3 days, ensure indirect sunlight..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Reminder email sent successfully."
  }
  ```
- **Error**:
  - `400 Bad Request`: Jika data tidak lengkap.
  - `500 Internal Server Error`: Jika terjadi kesalahan saat mengirim email.

---

## Catatan Tambahan

- **Error Handling**:
  - Semua endpoint mengembalikan error dalam format JSON:
    ```json
    {
      "message": "Error message"
    }
    ```
  - Kode status HTTP digunakan sesuai standar (misalnya, `401` untuk unauthorized, `400` untuk bad request).
- **Google Authentication**:
  - Pastikan `GOOGLE_CLIENT_ID` sudah diatur di environment variable.
  - Token Google harus valid dan belum kadaluarsa.
- **JWT**:
  - Token JWT harus disertakan di header untuk endpoint yang memerlukan autentikasi.
  - Token memiliki masa berlaku 1 jam; gunakan `/auth/refresh-token` untuk memperbarui.
- **Environment Variables**:
  - `GOOGLE_CLIENT_ID`: Untuk autentikasi Google.
  - `JWT_SECRET`: Untuk penandatanganan JWT.

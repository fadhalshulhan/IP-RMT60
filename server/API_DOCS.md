# API Documentation - Platform Plant Planner

## Base URL

`http://localhost:3000/api`

## Authentication

- Mayoritas endpoint memerlukan JWT token di header:  
  `Authorization: Bearer <token>`
- Namun untuk pengujian manual, beberapa endpoint **tidak memakai autentikasi**

---

## Endpoints

### Auth

- **POST /auth/google**

  - Deskripsi: Autentikasi pengguna menggunakan Google token
  - Request Body:
    ```json
    { "token": "google_token" }
    ```
  - Response:
    ```json
    {
      "token": "jwt_token",
      "user": { "email": "user@example.com", "name": "User Name" }
    }
    ```

- **GET /auth/session**
  - Deskripsi: Verifikasi token dan ambil data user
  - Header:  
    `Authorization: Bearer <token>`
  - Response:
    ```json
    {
      "token": "jwt_token",
      "user": {
        "id": 1,
        "email": "user@example.com",
        ...
      }
    }
    ```

---

### Plants

Semua endpoint di bawah ini membutuhkan autentikasi.

- **POST /plants**

  - Deskripsi: Tambah tanaman baru
  - Request Body:
    ```json
    {
      "name": "Monstera",
      "species": "Monstera Deliciosa",
      "location": "Jakarta",
      "light": "Medium",
      "temperature": 30
    }
    ```
  - Response: `201 Created`
    ```json
    {
      "id": 1,
      "name": "Monstera",
      ...
    }
    ```

- **GET /plants**

  - Deskripsi: Ambil semua tanaman milik user
  - Response: `200 OK`
    ```json
    [
      { "id": 1, "name": "Monstera", ... },
      ...
    ]
    ```

- **PUT /plants/:id**

  - Deskripsi: Update tanaman berdasarkan ID
  - Request Body:
    ```json
    { "name": "Updated Monstera" }
    ```
  - Response: `200 OK`

- **DELETE /plants/:id**

  - Deskripsi: Hapus tanaman
  - Response:
    ```json
    { "message": "Plant deleted" }
    ```

- **POST /plants/:plantId/photo**

  - Deskripsi: Tambah foto tanaman
  - Request: Form-data atau JSON (bergantung implementasi controller)
  - Response: `200 OK`

- **DELETE /plants/photo/:photoId**
  - Deskripsi: Hapus foto tanaman berdasarkan ID foto
  - Response: `200 OK`

---

### Recommendation

- **POST /recommendation/care**
  - Deskripsi: Dapatkan rekomendasi perawatan tanaman dari AI
  - (Tidak memerlukan autentikasi)
  - Request Body:
    ```json
    {
      "species": "Monstera Deliciosa",
      "location": "Jakarta",
      "light": "Medium",
      "temperature": 30
    }
    ```
  - Response:
    ```json
    {
      "recommendation": "Water every 3 days..."
    }
    ```

---

### Weather

- **GET /weather?city=Jakarta**
  - Deskripsi: Mendapatkan cuaca berdasarkan nama kota
  - (Tidak memerlukan autentikasi)
  - Response:
    ```json
    {
      "temperature": 30,
      "humidity": 70,
      "description": "Clear"
    }
    ```

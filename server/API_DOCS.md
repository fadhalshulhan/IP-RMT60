# API Documentation - Platform Plant Planner

## Base URL

`http://localhost:3000/api`

## Authentication

- All endpoints (except `/auth/google`) require a JWT token in the header: `Authorization: Bearer <token>`

## Endpoints

### Auth

- **POST /auth/google**
  - Description: Authenticate user with Google token
  - Request Body: `{ "token": "google_token" }`
  - Response: `{ "token": "jwt_token", "user": { "email": "user@example.com", "name": "User Name" } }`

### Plants

- **POST /plants**
  - Description: Create a new plant
  - Request Body: `{ "name": "Monstera", "species": "Monstera Deliciosa", "location": "Jakarta", "light": "Medium", "temperature": 30 }`
  - Response: `201 { "id": 1, "name": "Monstera", ... }`
- **GET /plants**
  - Description: Get all plants for the authenticated user
  - Response: `200 [{ "id": 1, "name": "Monstera", ... }]`
- **PUT /plants/:id**
  - Description: Update a plant
  - Request Body: `{ "name": "Updated Monstera" }`
  - Response: `200 { "id": 1, "name": "Updated Monstera", ... }`
- **DELETE /plants/:id**
  - Description: Delete a plant
  - Response: `200 { "message": "Plant deleted" }`

### Recommendation

- **POST /recommendation/care**
  - Description: Get care recommendation for a plant
  - Request Body: `{ "species": "Monstera Deliciosa", "location": "Jakarta", "light": "Medium", "temperature": 30 }`
  - Response: `200 { "recommendation": "Water every 3 days..." }`

### Weather

- **GET /weather?city=Jakarta**
  - Description: Get weather information for a city
  - Response: `200 { "temperature": 30, "humidity": 70, "description": "Clear" }`

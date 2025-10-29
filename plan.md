# Authentication System Architecture

This document outlines the technical specification for the authentication system for the tiny-parrot-bloom application.

## 1. Backend Architecture (FastAPI)

### 1.1. User Model

A `User` model will be created to store user information. It will include the following fields:

- `id`: (Integer, Primary Key) - Unique identifier for the user.
- `name`: (String) - The user's full name.
- `email`: (String, Unique) - The user's email address, used for login.
- `hashed_password`: (String) - The user's hashed password.
- `created_at`: (DateTime) - Timestamp of user creation.
- `updated_at`: (DateTime) - Timestamp of the last update.

### 1.2. Database Schema

The `users` table will be created with the following SQL schema:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3. Authentication Endpoints

The following API endpoints will be created under the `/auth` prefix:

- **`POST /auth/register`**: Register a new user.
  - **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
  - **Response (Success)**:
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
    ```

- **`POST /auth/login`**: Log in an existing user.
  - **Request Body**:
    ```json
    {
      "email": "john.doe@example.com",
      "password": "securepassword123"
    }
    ```
  - **Response (Success)**:
    ```json
    {
      "access_token": "your_jwt_token",
      "token_type": "bearer"
    }
    ```

- **`POST /auth/logout`**: Log out the current user (optional, token invalidation can be handled client-side).

- **`GET /users/me`**: Get the current logged-in user's information.
  - **Headers**: `Authorization: Bearer your_jwt_token`
  - **Response (Success)**:
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
    ```

### 1.4. JWT Token Management

- JWT (JSON Web Tokens) will be used for stateless authentication.
- The access token will contain the user's ID and an expiration time.
- Tokens will be signed with a secret key stored in the environment variables.

## 2. Frontend Architecture (React + Vite)

### 2.1. Authentication Context

A React Context (`AuthContext`) will be created to manage the user's authentication state throughout the application. It will provide:

- `user`: The current user object or `null`.
- `token`: The JWT token.
- `login(token, user)`: Function to log in the user.
- `logout()`: Function to log out the user.
- `isAuthenticated`: A boolean indicating if the user is logged in.

### 2.2. Protected Routes

A `ProtectedRoute` component will be created to restrict access to certain routes to authenticated users only. If a user is not logged in, they will be redirected to the login page.

### 2.3. Login and Signup Forms

- **Login Page**: A form with email and password fields.
- **Signup Page**: A form with name, email, and password fields.

### 2.4. User State Management

The `AuthContext` will be the single source of truth for the user's authentication state.

## 3. Integration

### 3.1. Frontend-Backend Communication

- The frontend will use `fetch` or a library like `axios` to make API calls to the backend.
- The JWT token will be stored in `localStorage` or `sessionStorage` and sent in the `Authorization` header of every request to protected endpoints.

## 4. Security Considerations

### 4.1. Password Hashing

- Passwords will be hashed using `bcrypt` before being stored in the database.

### 4.2. Token Storage

- JWT tokens will be stored in `localStorage` for persistent sessions or `sessionStorage` for session-only sessions.

### 4.3. CORS

- The FastAPI backend will be configured with CORS (Cross-Origin Resource Sharing) middleware to allow requests from the frontend's domain.

## 5. Dashboard Welcome Message

The dashboard page will use the `AuthContext` to get the current user's name and display a "Welcome <Name>" message when the user is logged in.
# Tadaa Personal Concierge - Backend API

FastAPI backend for Tadaa Personal Concierge, your AI-powered life assistant.

## Sprint 0 (S0) - Environment Setup & Frontend Connection ✅

This sprint establishes the foundation for the entire backend system with:
- FastAPI application structure
- MongoDB Atlas connection
- Health check endpoint
- CORS configuration for frontend
- Environment-based configuration management

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: MongoDB Atlas (Motor async driver)
- **Python**: 3.13+
- **Configuration**: Pydantic Settings
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Argon2 (passlib)

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── config.py              # Settings management
├── database.py            # MongoDB connection
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── routers/
│   ├── __init__.py
│   └── health.py         # Health check endpoint
└── README.md             # This file
```

## Setup Instructions

### 1. Prerequisites

- Python 3.13 or higher
- MongoDB Atlas account and cluster
- pip (Python package manager)

### 2. Environment Setup

1. **Create virtual environment** (recommended):
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your actual values:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tadaa?retryWrites=true&w=majority
   JWT_SECRET=your-secure-secret-key-here
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   APP_ENV=development
   PORT=8000
   LOG_LEVEL=INFO
   ```

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI` in `.env`

## Running the Application

### Development Mode

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Production Mode

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing Sprint 0

### 1. Health Check Endpoint

Test the health check endpoint to verify MongoDB connection:

```bash
curl http://localhost:8000/healthz
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-23T15:30:00.000Z"
}
```

### 2. API Documentation

Visit http://localhost:8000/docs to see the interactive API documentation.

### 3. CORS Verification

The CORS middleware is configured to allow requests from:
- http://localhost:5173 (Vite default)
- http://localhost:3000 (React default)

You can test CORS by making a request from your frontend application.

### 4. Console Logs

When starting the server, you should see:
```
INFO:     Starting Tadaa Personal Concierge Backend...
INFO:     Connecting to MongoDB Atlas...
INFO:     Connected to MongoDB Atlas - Database: tadaa
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## API Endpoints

### Health Check
- **GET** `/healthz`
  - Description: Check API and database health
  - Response: `{ status, database, timestamp }`

### Root
- **GET** `/`
  - Description: API information
  - Response: `{ message, version, status }`

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | 7d | No |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | localhost:5173,localhost:3000 | No |
| `APP_ENV` | Application environment | development | No |
| `PORT` | Server port | 8000 | No |
| `LOG_LEVEL` | Logging level | INFO | No |

## Development Guidelines

### Code Style
- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for all modules, classes, and functions
- Use async/await for all database operations

### Adding New Endpoints
1. Create a new router file in `routers/`
2. Define your endpoints using FastAPI decorators
3. Import and include the router in `main.py`
4. Use Pydantic models for request/response validation

### Database Operations
- Always use async operations with Motor
- Use the `get_database()` function from `database.py`
- Handle connection errors gracefully

## Troubleshooting

### MongoDB Connection Issues
- Verify your `MONGODB_URI` is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

### Import Errors
- Ensure you're in the backend directory
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Next Steps

Sprint 0 is complete! The backend foundation is ready for:
- User authentication (Sprint 1)
- Bill management (Sprint 2)
- Appointment scheduling (Sprint 3)
- And more...

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
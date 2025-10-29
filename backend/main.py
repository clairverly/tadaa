"""
Tadaa Personal Concierge - FastAPI Backend
Main application entry point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from config import settings
from database import connect_to_mongo, close_mongo_connection, init_db_indexes
from routers import health, auth, ai, ai_extraction

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting Tadaa Personal Concierge Backend...")
    await connect_to_mongo()
    await init_db_indexes()
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Tadaa Personal Concierge Backend...")
    await close_mongo_connection()
    logger.info("Application shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title="Tadaa Personal Concierge API",
    description="Backend API for Tadaa Personal Concierge - Your AI-powered life assistant",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(ai_extraction.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Tadaa Personal Concierge API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.APP_ENV == "development"
    )
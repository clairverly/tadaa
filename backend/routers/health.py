"""
Health check endpoint
"""
from fastapi import APIRouter, status
from datetime import datetime, timezone
from pydantic import BaseModel

from database import ping_database

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    database: str
    timestamp: str


@router.get(
    "/healthz",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check the health status of the API and database connection"
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint that verifies:
    - API is running
    - MongoDB connection is alive
    
    Returns:
        HealthResponse: Health status with database connection state
    """
    # Ping MongoDB to verify connection
    db_connected = await ping_database()
    
    return HealthResponse(
        status="ok",
        database="connected" if db_connected else "disconnected",
        timestamp=datetime.now(timezone.utc).isoformat()
    )
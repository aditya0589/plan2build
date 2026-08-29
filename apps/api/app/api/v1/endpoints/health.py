from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    service: str

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for container orchestrators and clients."""
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        service="Plan2Build AI Backend API"
    )

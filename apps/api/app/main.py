from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.core.database import init_db
from app.core.logging import logger
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown routines."""
    logger.info("Initializing Plan2Build AI API Backend...")
    # Initialize DB tables
    await init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Plan2Build AI API Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also expose direct health at /api/health for standard health checks
@app.get("/api/health", tags=["Health"])
async def root_health():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
    }

# Mount static file storage for debugging previews
data_dir = Path(settings.STORAGE_DIR)
data_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/data", StaticFiles(directory=str(data_dir)), name="static_data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

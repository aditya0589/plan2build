from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and settings.ENVIRONMENT == "development",
    future=True,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db() -> None:
    """Initialize database tables and run automatic lightweight column migrations."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Check and migrate columns for SQLite in development
        if "sqlite" in settings.DATABASE_URL:
            try:
                # Add file_size_bytes if not present
                await conn.execute(text("ALTER TABLE projects ADD COLUMN file_size_bytes INTEGER"))
            except Exception:
                pass
            try:
                # Add mime_type if not present
                await conn.execute(text("ALTER TABLE projects ADD COLUMN mime_type VARCHAR(100)"))
            except Exception:
                pass

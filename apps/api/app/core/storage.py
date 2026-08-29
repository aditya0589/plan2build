import os
import shutil
import aiofiles
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO
from app.core.config import settings

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file_path: str, content: bytes) -> str:
        """Saves content to path and returns the accessible file path/URL."""
        pass

    @abstractmethod
    async def read_file(self, file_path: str) -> bytes:
        """Reads file bytes from storage."""
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """Deletes file from storage."""
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = settings.STORAGE_DIR):
        self.base_dir = Path(base_dir)
        self.uploads_dir = self.base_dir / "uploads"
        self.processed_dir = self.base_dir / "processed"
        self.outputs_dir = self.base_dir / "outputs"

        for directory in [self.uploads_dir, self.processed_dir, self.outputs_dir]:
            directory.mkdir(parents=True, exist_ok=True)

    async def save_file(self, relative_path: str, content: bytes) -> str:
        target_path = self.base_dir / relative_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(target_path, "wb") as f:
            await f.write(content)
        return str(target_path)

    async def read_file(self, file_path: str) -> bytes:
        target_path = Path(file_path)
        if not target_path.is_absolute():
            target_path = self.base_dir / target_path
        async with aiofiles.open(target_path, "rb") as f:
            return await f.read()

    async def delete_file(self, file_path: str) -> bool:
        target_path = Path(file_path)
        if not target_path.is_absolute():
            target_path = self.base_dir / target_path
        if target_path.exists():
            target_path.unlink()
            return True
        return False

# Default singleton storage instance
storage = LocalStorageProvider()

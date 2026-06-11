from typing import Protocol
import aiofiles
import os
import uuid

from fastapi import UploadFile

from app.core.config import settings


class StorageBackend(Protocol):
    """Abstract interface for file storage. Swap LocalStorageBackend for S3StorageBackend later."""

    async def save(self, file: UploadFile, user_id: str) -> tuple[str, str]:
        """Save file. Returns (file_path, file_name)."""
        ...

    async def delete(self, file_path: str) -> None:
        """Delete file at path."""
        ...


class LocalStorageBackend:
    """Saves files to local disk under UPLOAD_DIR/{user_id}/"""

    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir

    async def save(self, file: UploadFile, user_id: str) -> tuple[str, str]:
        user_dir = os.path.join(self.upload_dir, str(user_id))
        os.makedirs(user_dir, exist_ok=True)

        # Use a UUID filename to avoid collisions & path-traversal risks
        ext = os.path.splitext(file.filename or "resume.pdf")[1] or ".pdf"
        unique_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(user_dir, unique_name)

        async with aiofiles.open(file_path, "wb") as out:
            content = await file.read()
            await out.write(content)

        return file_path, file.filename or unique_name

    async def delete(self, file_path: str) -> None:
        if os.path.exists(file_path):
            os.remove(file_path)


# Default instance used by the application
local_storage = LocalStorageBackend()

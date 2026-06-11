import uuid
import pdfplumber

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.resume import Resume
from app.models.user import User
from app.services.storage import LocalStorageBackend


def _parse_pdf(file_path: str) -> str:
    """Extract plain text from a PDF file using pdfplumber."""
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


class ResumeService:

    def __init__(self, db: AsyncSession, storage: LocalStorageBackend | None = None):
        self.db = db
        self.storage = storage or LocalStorageBackend()

    async def upload(self, file: UploadFile, user: User, label: str | None = None) -> Resume:
        # Validate file type
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are accepted.",
            )

        # Validate file size
        content = await file.read()
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit.",
            )

        # Rewind for storage backend
        await file.seek(0)
        file_path, file_name = await self.storage.save(file, str(user.id))

        # Parse PDF text
        try:
            parsed_text = _parse_pdf(file_path)
        except Exception:
            await self.storage.delete(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not parse the PDF. Make sure it contains readable text.",
            )

        if not parsed_text:
            await self.storage.delete(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The PDF appears to contain no readable text (may be a scanned image).",
            )

        resume = Resume(
            user_id=user.id,
            file_name=file_name,
            file_path=file_path,
            parsed_text=parsed_text,
            label=label,
        )
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def list_for_user(self, user_id: uuid.UUID) -> list[Resume]:
        result = await self.db.execute(
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> Resume:
        result = await self.db.execute(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
        )
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
        return resume

    async def delete(self, resume_id: uuid.UUID, user_id: uuid.UUID) -> None:
        resume = await self.get_by_id(resume_id, user_id)
        await self.storage.delete(resume.file_path)
        await self.db.delete(resume)
        await self.db.commit()

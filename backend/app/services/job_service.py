import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.job_description import JobDescription
from app.schemas.job_description import JobDescriptionCreate


class JobService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: JobDescriptionCreate, user_id: uuid.UUID) -> JobDescription:
        jd = JobDescription(
            user_id=user_id,
            title=payload.title,
            company=payload.company,
            raw_text=payload.raw_text,
        )
        self.db.add(jd)
        await self.db.commit()
        await self.db.refresh(jd)
        return jd

    async def list_for_user(self, user_id: uuid.UUID) -> list[JobDescription]:
        result = await self.db.execute(
            select(JobDescription)
            .where(JobDescription.user_id == user_id)
            .order_by(JobDescription.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, jd_id: uuid.UUID, user_id: uuid.UUID) -> JobDescription:
        result = await self.db.execute(
            select(JobDescription).where(
                JobDescription.id == jd_id, JobDescription.user_id == user_id
            )
        )
        jd = result.scalar_one_or_none()
        if not jd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job description not found.",
            )
        return jd

    async def delete(self, jd_id: uuid.UUID, user_id: uuid.UUID) -> None:
        jd = await self.get_by_id(jd_id, user_id)
        await self.db.delete(jd)
        await self.db.commit()

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.services.gemini_service import GeminiService


class AnalysisService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.gemini = GeminiService()

    async def create(
        self,
        resume_id: uuid.UUID,
        job_description_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Analysis:
        # 1. Fetch resume (with ownership check)
        r = await self.db.execute(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
        )
        resume = r.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

        # 2. Fetch job description (with ownership check)
        j = await self.db.execute(
            select(JobDescription).where(
                JobDescription.id == job_description_id,
                JobDescription.user_id == user_id,
            )
        )
        jd = j.scalar_one_or_none()
        if not jd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found."
            )

        # 3. Call Gemini
        try:
            result, raw = await self.gemini.analyze(resume.parsed_text, jd.raw_text)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI service returned an unexpected response. Please try again. ({e})",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI service error: {str(e)}",
            )

        # 4. Persist result
        analysis = Analysis(
            user_id=user_id,
            resume_id=resume_id,
            job_description_id=job_description_id,
            match_score=result.match_score,
            strengths=result.strengths,
            weaknesses=result.weaknesses,
            missing_skills=result.missing_skills,
            improvement_suggestions=result.improvement_suggestions,
            ats_keywords=result.ats_keywords,
            ai_raw_response=raw,
        )
        self.db.add(analysis)
        await self.db.commit()
        await self.db.refresh(analysis)
        return analysis

    async def list_for_user(self, user_id: uuid.UUID) -> list[Analysis]:
        result = await self.db.execute(
            select(Analysis)
            .where(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, analysis_id: uuid.UUID, user_id: uuid.UUID) -> Analysis:
        result = await self.db.execute(
            select(Analysis).where(
                Analysis.id == analysis_id, Analysis.user_id == user_id
            )
        )
        analysis = result.scalar_one_or_none()
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found."
            )
        return analysis

    async def delete(self, analysis_id: uuid.UUID, user_id: uuid.UUID) -> None:
        analysis = await self.get_by_id(analysis_id, user_id)
        await self.db.delete(analysis)
        await self.db.commit()

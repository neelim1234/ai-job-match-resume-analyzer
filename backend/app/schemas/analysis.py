import uuid
from datetime import datetime

from pydantic import BaseModel


class AnalysisCreate(BaseModel):
    resume_id: uuid.UUID
    job_description_id: uuid.UUID


class AnalysisResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    match_score: float
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    improvement_suggestions: list[str]
    ats_keywords: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisListItem(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    match_score: float
    created_at: datetime

    model_config = {"from_attributes": True}

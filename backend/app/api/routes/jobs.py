import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.job_description import JobDescriptionCreate, JobDescriptionListItem, JobDescriptionResponse
from app.services.job_service import JobService

router = APIRouter(prefix="/jobs", tags=["Job Descriptions"])


@router.post("", response_model=JobDescriptionResponse, status_code=201)
async def create_job(
    payload: JobDescriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = JobService(db)
    return await service.create(payload, current_user.id)


@router.get("", response_model=list[JobDescriptionListItem])
async def list_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = JobService(db)
    return await service.list_for_user(current_user.id)


@router.get("/{jd_id}", response_model=JobDescriptionResponse)
async def get_job(
    jd_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = JobService(db)
    return await service.get_by_id(jd_id, current_user.id)


@router.delete("/{jd_id}", status_code=204)
async def delete_job(
    jd_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = JobService(db)
    await service.delete(jd_id, current_user.id)

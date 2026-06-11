import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.resume import ResumeListItem, ResumeResponse
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    label: str | None = Form(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResumeService(db)
    return await service.upload(file, current_user, label)


@router.get("", response_model=list[ResumeListItem])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResumeService(db)
    return await service.list_for_user(current_user.id)


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResumeService(db)
    return await service.get_by_id(resume_id, current_user.id)


@router.delete("/{resume_id}", status_code=204)
async def delete_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResumeService(db)
    await service.delete(resume_id, current_user.id)

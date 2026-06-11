import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.analysis import AnalysisCreate, AnalysisListItem, AnalysisResponse
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.post("", response_model=AnalysisResponse, status_code=201)
async def create_analysis(
    payload: AnalysisCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AnalysisService(db)
    return await service.create(payload.resume_id, payload.job_description_id, current_user.id)


@router.get("", response_model=list[AnalysisListItem])
async def list_analyses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AnalysisService(db)
    return await service.list_for_user(current_user.id)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AnalysisService(db)
    return await service.get_by_id(analysis_id, current_user.id)


@router.delete("/{analysis_id}", status_code=204)
async def delete_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AnalysisService(db)
    await service.delete(analysis_id, current_user.id)

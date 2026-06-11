import uuid
from datetime import datetime

from pydantic import BaseModel


class JobDescriptionCreate(BaseModel):
    title: str
    company: str | None = None
    raw_text: str


class JobDescriptionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    company: str | None
    raw_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class JobDescriptionListItem(BaseModel):
    """Lighter version for list views — omits raw_text."""
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    company: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

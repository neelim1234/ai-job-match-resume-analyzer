import uuid
from datetime import datetime

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    file_name: str
    label: str | None
    parsed_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeListItem(BaseModel):
    """Lighter version for list views — omits parsed_text."""
    id: uuid.UUID
    user_id: uuid.UUID
    file_name: str
    label: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

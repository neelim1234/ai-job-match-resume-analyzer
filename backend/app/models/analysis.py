import uuid
from datetime import datetime

from sqlalchemy import Float, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False
    )
    job_description_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False
    )
    match_score: Mapped[float] = mapped_column(Float, nullable=False)
    strengths: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    weaknesses: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    missing_skills: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    improvement_suggestions: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    ats_keywords: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    ai_raw_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        server_default=func.now(),
    )

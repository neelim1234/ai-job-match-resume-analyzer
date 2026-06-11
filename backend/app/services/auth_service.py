from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest


class AuthService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, payload: RegisterRequest) -> User:
        # Check email uniqueness
        result = await self.db.execute(select(User).where(User.email == payload.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def login(self, payload: LoginRequest) -> str:
        """Authenticate user and return a JWT access token."""
        result = await self.db.execute(select(User).where(User.email == payload.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

        return create_access_token(subject=str(user.id))

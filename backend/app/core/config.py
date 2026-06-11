from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Gemini
    GEMINI_API_KEY: str

    # File storage
    UPLOAD_DIR: str = "uploads/resumes"
    MAX_FILE_SIZE_MB: int = 10


settings = Settings()

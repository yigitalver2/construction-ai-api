"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Object Detection API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://localhost:5432/construction_ai"

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB

    # Public base URL of THIS backend (used to build photo URLs).
    # Locally: http://localhost:8000 | On HF Space: https://<user>-<space>.hf.space
    PUBLIC_BASE_URL: str = "http://localhost:8000"

    # Extra allowed CORS origin (the deployed frontend Vercel URL).
    FRONTEND_ORIGIN: str = ""

    # AI Services
    GEMINI_API_KEY: str = ""

    # AI Detector backend: "mock" (default) or "sam3"
    DETECTOR_BACKEND: str = "mock"
    DAMAGE_CONFIDENCE_THRESHOLD: float = 0.5

    # SAM3 settings (only used when DETECTOR_BACKEND=sam3)
    SAM3_REPO_PATH: str = "/app/SAM3"
    SAM3_CHECKPOINT: str = "/app/sam3_checkpoint"
    SAM3_MODEL_NAME: str = "facebook/sam3"
    SAM3_MIN_COVERAGE: float = 0.01

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

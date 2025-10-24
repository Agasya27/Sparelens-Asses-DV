from pydantic_settings import BaseSettings, SettingsConfigDict
import os


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEFAULT_SQLITE_PATH = os.path.join(PROJECT_ROOT, "app.db")
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"


class Settings(BaseSettings):
    # Read .env from current working directory and, if present, also backend/.env
    # This avoids confusion when starting the app from repo root vs backend folder.
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Use a stable absolute path for SQLite by default so CLI tools and server share the same DB regardless of CWD
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)
    # Use environment variable for secrets; fallback is for local dev only
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "../uploads")
    # Dev CORS toggle: when true, allow all origins (do NOT use in prod)
    DEV_CORS: bool = os.getenv("DEV_CORS", "false").lower() == "true"
    # Optional extra CORS origins (comma-separated)
    CORS_EXTRA_ORIGINS: str = os.getenv("CORS_EXTRA_ORIGINS", "")

    # Optional bootstrap admin on startup if no admin exists
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_OVERWRITE: bool = os.getenv("ADMIN_OVERWRITE", "false").lower() == "true"

    # AI settings removed


settings = Settings()

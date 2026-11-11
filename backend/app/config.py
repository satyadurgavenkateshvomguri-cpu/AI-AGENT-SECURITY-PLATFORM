import os
from pathlib import Path
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEMO_DATA_DIR = BASE_DIR / "demo_data"
REPORTS_DIR = BASE_DIR / "reports"

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "AI Agent Security Assessment Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/security_platform.db")

    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "demo")  # "openai", "anthropic", "gemini", or "demo"
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("LLM_MODEL", "demo-gpt-4")

    # Security Engine Settings
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-security-platform-key-2026")

settings = Settings()

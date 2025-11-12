from functools import lru_cache
from pydantic import AnyUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str | None = None
    groq_api_key: str | None = None
    groq_base_url: AnyUrl = "https://api.groq.com/openai/v1"  # Groq is OpenAI-compatible
    database_url: AnyUrl | None = None
    allow_origins: str = "*"
    policy_dir: str = "backend/policies"
    max_scan_bytes: int = 12_288

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

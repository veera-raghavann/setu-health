from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="PRISM_OCR_", extra="ignore")

    max_upload_mb: int = 20
    allowed_origins: str = "http://localhost:3000"
    request_timeout_seconds: int = 90
    enable_llm: bool = False
    log_level: str = "INFO"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

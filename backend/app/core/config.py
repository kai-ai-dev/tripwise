from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DEEPSEEK_API_KEY: str = ""
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
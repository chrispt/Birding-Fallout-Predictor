from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/fallout_predictor"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # API Settings
    api_v1_prefix: str = "/api/v1"
    debug: bool = True

    # Open-Meteo API (no key required)
    openmeteo_base_url: str = "https://api.open-meteo.com/v1"

    # eBird API
    ebird_api_key: str = ""
    ebird_base_url: str = "https://api.ebird.org/v2"

    # Cache TTL (seconds)
    weather_cache_ttl: int = 3600  # 1 hour
    prediction_cache_ttl: int = 1800  # 30 minutes

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

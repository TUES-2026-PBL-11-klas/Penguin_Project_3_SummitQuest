from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "dev-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENWEATHER_API_KEY: str = "b29ae2c35f90d91f45e86a755900d0f3"
    OSRM_BASE_URL: str = "http://router.project-osrm.org"
    MISTRAL_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

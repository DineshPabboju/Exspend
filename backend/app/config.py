from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "development-only-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./expenses.db"
    FRONTEND_URL: str = "http://localhost:5173"
    model_config = SettingsConfigDict(
        env_file=None,
        extra="ignore"
    )


settings = Settings()
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = "sk-your-placeholder"
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBED_MODEL: str = "text-embedding-3-small"

    JWT_SECRET: str = "supersecret-change-me"
    JWT_ALGO: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: str = "http://localhost:3000"
    UPLOAD_DIR: str = "/app/uploads"
    INDEX_DIR: str = "/app/storage/index"

    class Config:
        env_file = ".env"

settings = Settings()

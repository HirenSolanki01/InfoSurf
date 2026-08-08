import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "InfoSurf"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "infosurf_super_secret_key_development_only_123456789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./database.db")
    QDRANT_PATH: str = os.getenv("QDRANT_PATH", "vector_store")
    QDRANT_HOST: Optional[str] = os.getenv("QDRANT_HOST", None)
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    
    # LLM Options
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "local")  # options: local, ollama, gemini, openai
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    
    class Config:
        case_sensitive = True

settings = Settings()

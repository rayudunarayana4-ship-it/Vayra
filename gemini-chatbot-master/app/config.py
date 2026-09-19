import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - dependencies are installed in deployment
    def load_dotenv() -> None:
        return None

load_dotenv()


def configured_key(name: str) -> str | None:
    value = os.getenv(name)
    return value if value and not value.startswith("your-") else None


@dataclass(frozen=True)
class Settings:
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_database: str = os.getenv("MONGODB_DATABASE", "lumen_chatbot")
    groq_api_key: str | None = configured_key("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    admin_key: str | None = os.getenv("ADMIN_KEY")
    allowed_origins: tuple[str, ...] = tuple(filter(None, os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")))


settings = Settings()

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_file)


def normalize_database_url(database_url: str | None) -> str:
    """Normalize optional PostgreSQL URLs while preserving SQLite URLs."""
    url = (database_url or "sqlite:///./data/finnews.db").strip()

    if url.startswith("postgresql+psycopg2://"):
        return url
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


class Settings:
    BASE_DIR: Path = BASE_DIR
    FIRECRAWL_API_KEY: str = os.getenv("FIRECRAWL_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    MEMENTO_LLM_PROVIDER: str = os.getenv("MEMENTO_LLM_PROVIDER", "gemini")
    MEMENTO_EXTRACTION_MODEL: str = os.getenv("MEMENTO_EXTRACTION_MODEL", os.getenv("GEMINI_MODEL", "gemini-3.5-flash"))
    MEMENTO_TIEBREAKER_MODEL: str = os.getenv("MEMENTO_TIEBREAKER_MODEL", os.getenv("GEMINI_MODEL", "gemini-3.5-flash"))
    MEMENTO_EMBEDDING_PROVIDER: str = os.getenv("MEMENTO_EMBEDDING_PROVIDER", "gemini")
    MEMENTO_DB_PATH: str = os.getenv("MEMENTO_DB_PATH", str(BASE_DIR / "data" / "memento.db"))

    # Parse CORS origins
    _cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

    MAX_ARTICLES: int = int(os.getenv("MAX_ARTICLES", "3"))

    def __init__(self):
        self.DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", "sqlite:///./data/finnews.db"))

        # A clean deployment may not have a data directory yet.
        os.makedirs(self.BASE_DIR / "data", exist_ok=True)
        os.makedirs(Path(self.MEMENTO_DB_PATH).expanduser().parent, exist_ok=True)
        if self.DATABASE_URL.startswith("sqlite:///"):
            sqlite_file_path = self.DATABASE_URL.replace("sqlite:///", "", 1)
            if sqlite_file_path and sqlite_file_path != ":memory:":
                os.makedirs(Path(sqlite_file_path).expanduser().resolve().parent, exist_ok=True)

        # Ensure environment variables are synchronized for underlying libraries
        if self.GOOGLE_API_KEY and not os.environ.get("GOOGLE_API_KEY"):
            os.environ["GOOGLE_API_KEY"] = self.GOOGLE_API_KEY
        if self.GEMINI_MODEL:
            os.environ["MEMENTO_EXTRACTION_MODEL"] = self.GEMINI_MODEL
            os.environ["MEMENTO_TIEBREAKER_MODEL"] = self.GEMINI_MODEL
        if self.MEMENTO_DB_PATH:
            os.environ["MEMENTO_DB_PATH"] = self.MEMENTO_DB_PATH
        if self.MEMENTO_LLM_PROVIDER:
            os.environ["MEMENTO_LLM_PROVIDER"] = self.MEMENTO_LLM_PROVIDER
        if self.MEMENTO_EMBEDDING_PROVIDER:
            os.environ["MEMENTO_EMBEDDING_PROVIDER"] = self.MEMENTO_EMBEDDING_PROVIDER


settings = Settings()

import logging
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import normalize_database_url, settings

logger = logging.getLogger("db")

# Normalize immediately before engine construction so every caller uses psycopg2.
db_url = normalize_database_url(settings.DATABASE_URL)

engine = create_engine(
    db_url,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables, tolerating a cold-starting Postgres instance."""
    # Ensure all models are imported before creating tables
    import app.models  # noqa: F401

    max_attempts = 5
    for attempt in range(1, max_attempts + 1):
        try:
            logger.info("Initializing database tables (attempt %s/%s).", attempt, max_attempts)
            Base.metadata.create_all(bind=engine)
            return
        except SQLAlchemyError:
            logger.exception("Database initialization attempt %s/%s failed.", attempt, max_attempts)
            if attempt == max_attempts:
                raise
            time.sleep(3)

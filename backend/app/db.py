import logging
import os
import time
from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import normalize_database_url, settings

logger = logging.getLogger("db")

# Normalize immediately before engine construction so optional PostgreSQL URLs
# use psycopg2 while SQLite URLs remain unchanged.
db_url = normalize_database_url(settings.DATABASE_URL)
engine_options = {"pool_pre_ping": True}
if db_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(db_url, **engine_options)


if engine.dialect.name == "sqlite":
    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

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
    """Create all database tables, tolerating a cold-starting database."""
    # Ensure data directory exists
    os.makedirs(settings.BASE_DIR / "data", exist_ok=True)

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

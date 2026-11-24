import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db
from app.routers import health, watchlist, analyze, history, notes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("finnews_main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure data directory exists on startup
    import os
    os.makedirs(settings.BASE_DIR / "data", exist_ok=True)
    # Initialize database tables on startup
    logger.info("Initializing database tables...")
    init_db()
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title="FinNews AI: Financial News Intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
logger.info(f"Configuring CORS origins: {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized error responses: {"error": "message"}
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Extract readable error messages from validation details
    errors = exc.errors()
    msg = "; ".join(f"{'.'.join(str(loc) for loc in err.get('loc', []))}: {err.get('msg')}" for err in errors)
    return JSONResponse(
        status_code=422,
        content={"error": f"Validation error: {msg}"},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error occurred."},
    )


# Include all routers under prefix /api
api_router = FastAPI()
api_prefix = "/api"

app.include_router(health.router, prefix=api_prefix)
app.include_router(watchlist.router, prefix=api_prefix)
app.include_router(analyze.router, prefix=api_prefix)
app.include_router(history.router, prefix=api_prefix)
app.include_router(notes.router, prefix=api_prefix)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

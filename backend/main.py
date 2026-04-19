"""
Intelligence Fusion Dashboard — FastAPI Backend
=================================================
Production-ready API for ingesting, storing, and serving
intelligence data points with image upload support.
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.routes import data_router, image_router
from backend.utils.helpers import IMAGES_DIR, ensure_directories, get_logger

logger = get_logger("main")


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    ensure_directories()
    logger.info("Intelligence Fusion Dashboard API is starting up.")
    logger.info("Data and image directories verified.")
    yield
    logger.info("Shutting down Intelligence Fusion Dashboard API.")


# ── App Factory ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Intelligence Fusion Dashboard API",
    description=(
        "Backend API for the Intelligence Fusion Dashboard. "
        "Supports uploading intelligence data (CSV/JSON), image management, "
        "and marker retrieval for map-based visualization."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Logging Middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request with method, path, and timing."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s → %d (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a clean 500 response."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "detail": "An internal server error occurred."},
    )


# ── Static Files ───────────────────────────────────────────────────────────────
ensure_directories()  # Ensure dir exists before mounting
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(data_router, prefix="/api")
app.include_router(image_router, prefix="/api")


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    """Return service health status."""
    return {"status": "healthy", "service": "Intelligence Fusion Dashboard API", "version": "1.0.0"}

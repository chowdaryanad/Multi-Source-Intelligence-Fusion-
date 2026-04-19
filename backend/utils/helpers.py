"""Utility functions for file I/O, logging, and directory management."""

import json
import logging
import uuid
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
IMAGES_DIR = BASE_DIR / "images"
DATA_FILE = DATA_DIR / "data.json"


def ensure_directories() -> None:
    """Create required directories if they don't exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Initialize data.json with empty array if missing
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")


def get_logger(name: str) -> logging.Logger:
    """Return a configured logger instance."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


def generate_unique_filename(original_filename: str) -> str:
    """Generate a UUID-prefixed filename to prevent collisions."""
    suffix = Path(original_filename).suffix
    return f"{uuid.uuid4().hex}{suffix}"


def read_json_store() -> list[dict]:
    """Read and return the current data store contents."""
    try:
        raw = DATA_FILE.read_text(encoding="utf-8")
        data = json.loads(raw)
        if not isinstance(data, list):
            return []
        return data
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def write_json_store(data: list[dict]) -> None:
    """Write data to the JSON store atomically (overwrite)."""
    DATA_FILE.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

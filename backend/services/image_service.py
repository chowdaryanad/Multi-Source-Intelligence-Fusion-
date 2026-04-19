"""Service layer for image upload handling."""

import shutil
from pathlib import Path

from fastapi import UploadFile

from utils.helpers import IMAGES_DIR, generate_unique_filename, get_logger

logger = get_logger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class ImageService:
    """Handles image validation, storage, and path resolution."""

    @staticmethod
    def validate_extension(filename: str) -> None:
        """Raise ValueError if the file extension is not allowed."""
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(
                f"Invalid file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

    @staticmethod
    async def save_image(file: UploadFile) -> tuple[str, str]:
        """
        Save an uploaded image to the images directory.

        Returns:
            A tuple of (unique_filename, relative_path).
        """
        # Validate extension
        ImageService.validate_extension(file.filename or "unknown")

        # Validate file size (read content)
        content = await file.read()
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise ValueError(
                f"File size ({len(content)} bytes) exceeds the maximum of {MAX_FILE_SIZE_BYTES} bytes."
            )

        unique_name = generate_unique_filename(file.filename or "upload.jpg")
        dest = IMAGES_DIR / unique_name

        with open(dest, "wb") as f:
            f.write(content)

        relative_path = f"/images/{unique_name}"
        logger.info("Saved image: %s (%d bytes)", unique_name, len(content))
        return unique_name, relative_path

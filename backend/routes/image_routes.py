"""Routes for image upload handling."""

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from models.schemas import ErrorResponse, ImageUploadResponse
from services.image_service import ImageService
from utils.helpers import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Image Upload"])


@router.post(
    "/upload-image",
    response_model=ImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid image file"},
    },
    summary="Upload an image",
    description="Upload a JPG/JPEG image file. The image is saved with a unique "
                "filename and the accessible path is returned.",
)
async def upload_image(file: UploadFile = File(..., description="JPG/JPEG image file")):
    """Save an uploaded image and return its access path."""
    logger.info("Received image upload: %s (content_type=%s)", file.filename, file.content_type)

    try:
        filename, path = await ImageService.save_image(file)
    except ValueError as e:
        logger.warning("Image upload rejected: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return ImageUploadResponse(
        status="success",
        message="Image uploaded successfully.",
        filename=filename,
        path=path,
    )

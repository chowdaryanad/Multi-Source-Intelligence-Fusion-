"""Routes for intelligence data upload and retrieval."""

import json

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from models.schemas import ErrorResponse, IntelligencePointResponse, UploadResponse
from services.data_service import DataService
from utils.helpers import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Intelligence Data"])


@router.post(
    "/upload-data",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file format or content"},
        422: {"model": ErrorResponse, "description": "Validation errors in records"},
    },
    summary="Upload intelligence data",
    description="Upload a CSV or JSON file containing intelligence points. "
                "Each record must include: title, description, lat, lon, image.",
)
async def upload_data(file: UploadFile = File(..., description="CSV or JSON file")):
    """Ingest intelligence data from a CSV or JSON file."""
    filename = (file.filename or "").lower()
    logger.info("Received data upload: %s (content_type=%s)", file.filename, file.content_type)

    # Read file content
    try:
        raw = await file.read()
        content = raw.decode("utf-8")
    except UnicodeDecodeError:
        logger.error("Failed to decode file as UTF-8: %s", file.filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File could not be decoded as UTF-8 text.",
        )

    # Parse based on extension
    if filename.endswith(".csv"):
        records = DataService.parse_csv(content)
    elif filename.endswith(".json"):
        try:
            records = DataService.parse_json(content)
        except (json.JSONDecodeError, ValueError) as e:
            logger.error("JSON parse error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Upload a .csv or .json file.",
        )

    if not records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File contains no records.",
        )

    # Validate and persist
    count, errors = DataService.ingest(records)

    if count == 0 and errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "All records failed validation.", "errors": errors},
        )

    message = f"Successfully processed {count} record(s)."
    if errors:
        message += f" {len(errors)} record(s) skipped due to validation errors: {'; '.join(errors)}"

    logger.info("Upload complete: %d accepted, %d rejected", count, len(errors))
    return UploadResponse(status="success", message=message, records_processed=count)


@router.get(
    "/markers",
    response_model=IntelligencePointResponse,
    summary="Get all intelligence markers",
    description="Retrieve all stored intelligence data points for map rendering.",
)
async def get_markers():
    """Return all intelligence markers from the data store."""
    data = DataService.get_all_markers()
    logger.info("Serving %d marker(s).", len(data))
    return IntelligencePointResponse(status="success", count=len(data), data=data)

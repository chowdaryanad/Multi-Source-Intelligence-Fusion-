"""Pydantic models for request/response validation and serialization."""

from pydantic import BaseModel, Field, validator
from typing import Optional, List


class IntelligencePoint(BaseModel):
    """Schema for a single intelligence data point."""

    title: str = Field(..., min_length=1, max_length=256)
    description: str = Field(..., min_length=1, max_length=2048)
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    image: str = Field(..., min_length=1)

    @validator("title", "description", "image")
    def strip_whitespace(cls, v):
        return v.strip()

    class Config:
        schema_extra = {
            "example": {
                "title": "Suspicious Activity Report",
                "description": "Unidentified vessel spotted near port at 0300 hours.",
                "lat": 34.0522,
                "lon": -118.2437,
                "image": "vessel_001.jpg",
            }
        }


class IntelligencePointResponse(BaseModel):
    """Wrapper response for marker data."""

    status: str = "success"
    count: int
    data: List[IntelligencePoint]


class UploadResponse(BaseModel):
    """Response model for data upload operations."""

    status: str
    message: str
    records_processed: int


class ImageUploadResponse(BaseModel):
    """Response model for image upload operations."""

    status: str
    message: str
    filename: str
    path: str


class ErrorResponse(BaseModel):
    """Standardized error response."""

    status: str = "error"
    detail: str
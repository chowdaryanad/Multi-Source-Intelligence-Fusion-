"""Service layer for intelligence data ingestion and retrieval."""

import csv
import io
import json
from typing import Any

from pydantic import ValidationError

from backend.models.schemas import IntelligencePoint
from backend.utils.helpers import get_logger, read_json_store, write_json_store

logger = get_logger(__name__)


class DataService:
    """Handles parsing, validation, and persistence of intelligence data."""

    REQUIRED_FIELDS = {"title", "description", "lat", "lon", "image"}

    @staticmethod
    def parse_csv(content: str) -> list[dict[str, Any]]:
        """Parse CSV content into a list of dictionaries."""
        reader = csv.DictReader(io.StringIO(content))
        rows: list[dict[str, Any]] = []
        for row in reader:
            # Convert lat/lon to float where possible
            for coord in ("lat", "lon"):
                if coord in row:
                    try:
                        row[coord] = float(row[coord])
                    except (ValueError, TypeError):
                        pass  # Let validation catch it
            rows.append(row)
        return rows

    @staticmethod
    def parse_json(content: str) -> list[dict[str, Any]]:
        """Parse JSON content; accepts a single object or an array."""
        data = json.loads(content)
        if isinstance(data, dict):
            return [data]
        if isinstance(data, list):
            return data
        raise ValueError("JSON must be an object or an array of objects.")

    @classmethod
    def validate_records(cls, raw_records: list[dict[str, Any]]) -> tuple[list[dict], list[str]]:
        """
        Validate each record against IntelligencePoint schema.

        Returns:
            A tuple of (valid_records, error_messages).
        """
        valid: list[dict] = []
        errors: list[str] = []

        for idx, record in enumerate(raw_records):
            try:
                point = IntelligencePoint(**record)
                valid.append(point.model_dump())
            except ValidationError as e:
                error_detail = "; ".join(
                    f"{err['loc'][-1]}: {err['msg']}" for err in e.errors()
                )
                errors.append(f"Record {idx + 1}: {error_detail}")
                logger.warning("Validation failed for record %d: %s", idx + 1, error_detail)

        return valid, errors

    @classmethod
    def ingest(cls, raw_records: list[dict[str, Any]]) -> tuple[int, list[str]]:
        """
        Validate records and append valid ones to the data store.

        Returns:
            A tuple of (count_added, error_messages).
        """
        valid, errors = cls.validate_records(raw_records)

        if valid:
            existing = read_json_store()
            existing.extend(valid)
            write_json_store(existing)
            logger.info("Persisted %d new record(s). Total: %d", len(valid), len(existing))

        return len(valid), errors

    @staticmethod
    def get_all_markers() -> list[dict]:
        """Return all stored intelligence points."""
        data = read_json_store()
        logger.info("Retrieved %d marker(s) from store.", len(data))
        return data

"""
Analysis service - the glue between a detector and the database.

Keeps the detector pure (image path in, DetectionResult out) and centralizes
the "write results onto the Photo row" logic so the upload flow and the
re-analyze endpoint share exactly one code path.
"""
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.photo import Photo
from app.services.detector import get_detector


def analyze_photo(photo: Photo, db: Session) -> Photo:
    """
    Run the active detector on a photo and persist the results.

    Fills category / confidence / detected_objects / description / analyzed_at.
    On failure the photo is left unanalyzed (analyzed_at stays NULL) so it can
    be retried later via the /analyze endpoint.
    """
    detector = get_detector()
    result = detector.analyze(photo.file_path)

    photo.category = result.category
    photo.confidence = result.confidence
    photo.detected_objects = result.detected_objects_json()
    photo.description = result.description()
    photo.analyzed_at = datetime.utcnow()

    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def analyze_photo_by_id(photo_id: int) -> None:
    """
    Background-task entry point: opens its own DB session (the request session
    is already closed by the time a FastAPI BackgroundTask runs).
    """
    db = SessionLocal()
    try:
        photo = db.query(Photo).filter(Photo.id == photo_id).first()
        if photo is None:
            return
        try:
            analyze_photo(photo, db)
        except Exception as exc:  # noqa: BLE001 - never crash the background worker
            print(f"[analysis] Photo {photo_id} analysis failed: {exc}")
    finally:
        db.close()

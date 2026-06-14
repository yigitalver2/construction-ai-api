"""
Stats API Endpoints - Dashboard statistics
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.photo import Photo
from app.schemas.stats import StatsResponse

router = APIRouter(prefix="/stats", tags=["Statistics"])


def format_storage_size(bytes_size: int) -> str:
    """Convert bytes to human readable format."""
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.1f} KB"
    elif bytes_size < 1024 * 1024 * 1024:
        return f"{bytes_size / (1024 * 1024):.1f} MB"
    else:
        return f"{bytes_size / (1024 * 1024 * 1024):.1f} GB"


@router.get("", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics.
    Returns total images, analyzed images, categories count, and storage used.
    """
    # Total images
    total_images = db.query(func.count(Photo.id)).scalar() or 0
    
    # Analyzed images (those with a category assigned)
    analyzed_images = db.query(func.count(Photo.id)).filter(
        Photo.category.isnot(None)
    ).scalar() or 0
    
    # Unique categories
    categories_count = db.query(func.count(func.distinct(Photo.category))).filter(
        Photo.category.isnot(None)
    ).scalar() or 0
    
    # Total storage used
    total_storage = db.query(func.sum(Photo.file_size)).scalar() or 0
    storage_formatted = format_storage_size(total_storage)
    
    # Calculate completion rate
    completion_rate = analyzed_images / total_images if total_images > 0 else 0.0
    
    return StatsResponse(
        total_photos=total_images,
        analyzed_photos=analyzed_images,
        categories=categories_count,
        storage_used=storage_formatted,
        completion_rate=completion_rate,
        delta_total_photos_pct=12.5  # Placeholder for growth percentage
    )

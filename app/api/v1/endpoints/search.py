"""
Search API Endpoints - Image search functionality
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.core.database import get_db
from app.models.photo import Photo
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.photos import get_photo_url

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    """Search request schema."""
    query: str
    top_k: int = 50
    filters: Optional[dict] = None


class SearchResultItem(BaseModel):
    """Search result item."""
    id: int
    filename: str
    original_filename: str
    category: Optional[str] = None
    description: Optional[str] = None
    confidence: Optional[float] = None
    thumbnail: Optional[str] = None
    url: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


@router.post("", response_model=List[SearchResultItem])
async def search_images(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Search images by query text.
    Searches in filename, category, description, and tags.
    """
    query = request.query.lower().strip()
    filters = request.filters or {}
    
    # Base query - user's photos only
    db_query = db.query(Photo).filter(Photo.user_id == current_user.id)
    
    # Apply text search if query provided
    if query:
        search_pattern = f"%{query}%"
        db_query = db_query.filter(
            or_(
                Photo.filename.ilike(search_pattern),
                Photo.original_filename.ilike(search_pattern),
                Photo.category.ilike(search_pattern),
                Photo.description.ilike(search_pattern),
                Photo.tags.ilike(search_pattern),
                Photo.detected_objects.ilike(search_pattern)
            )
        )
    
    # Apply category filter
    category = filters.get("category")
    if category and category != "All":
        db_query = db_query.filter(Photo.category == category)
    
    # Apply date range filter
    date_from = filters.get("dateFrom")
    date_to = filters.get("dateTo")
    if date_from:
        db_query = db_query.filter(Photo.created_at >= date_from)
    if date_to:
        db_query = db_query.filter(Photo.created_at <= date_to)
    
    # Order by relevance (confidence) and date
    db_query = db_query.order_by(
        desc(Photo.confidence),
        desc(Photo.created_at)
    ).limit(request.top_k)
    
    results = db_query.all()
    
    # Transform to response format
    search_results = []
    for photo in results:
        search_results.append(SearchResultItem(
            id=photo.id,
            filename=photo.filename,
            original_filename=photo.original_filename,
            category=photo.category,
            description=photo.description,
            confidence=photo.confidence,
            thumbnail=get_photo_url(photo.filename),
            url=get_photo_url(photo.filename),
            created_at=photo.created_at.isoformat() if photo.created_at else ""
        ))
    
    return search_results


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get search suggestions based on partial query.
    Returns matching categories and recent searches.
    """
    suggestions = []
    
    if q:
        # Get matching categories
        categories = db.query(Photo.category).filter(
            Photo.user_id == current_user.id,
            Photo.category.isnot(None),
            Photo.category.ilike(f"%{q}%")
        ).distinct().limit(5).all()
        
        suggestions = [cat[0] for cat in categories if cat[0]]
    
    return {"suggestions": suggestions}

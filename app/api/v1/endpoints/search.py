"""
Search API Endpoints - Image search functionality
"""
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.core.database import get_db
from app.core.config import settings
from app.models.photo import Photo
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.photos import get_photo_url
from app.services.detector import DAMAGE_CLASSES

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    """Search request schema."""
    query: str
    top_k: int = 50
    filters: Optional[dict] = None


class NLSearchRequest(BaseModel):
    query: str
    top_k: int = 50


class ParsedFilters(BaseModel):
    categories: List[str] = []
    damage_labels: List[str] = []
    confidence_min: Optional[float] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    summary: str = ""


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
    mask_url: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class NLSearchResponse(BaseModel):
    results: List[SearchResultItem]
    parsed_filters: ParsedFilters
    total: int


def _parse_query_with_openai(query: str) -> ParsedFilters:
    """Use GPT-4o-mini to turn a natural-language query into structured filters."""
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    classes_str = ", ".join(DAMAGE_CLASSES)

    system = (
        "You are a filter parser for a construction damage inspection app. "
        "Return ONLY a valid JSON object — no markdown, no explanation."
    )
    user = f"""Today is {today}.
Available damage categories (exact spelling): {classes_str}

User query: "{query}"

Return JSON:
{{
  "categories": [],        // matching damage class names from the list (empty = all)
  "damage_labels": [],     // copy of categories
  "confidence_min": null,  // float 0-1; "high confidence" → 0.75, "above 80%" → 0.8
  "date_from": null,       // YYYY-MM-DD; "last week" = 7 days ago, "last month" = 30 days ago
  "date_to": null,         // YYYY-MM-DD
  "summary": ""            // ≤10-word English summary of what you understood
}}"""

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        response_format={"type": "json_object"},
        temperature=0,
    )
    data = json.loads(resp.choices[0].message.content)
    return ParsedFilters(**data)


def _build_result(photo: Photo) -> SearchResultItem:
    return SearchResultItem(
        id=photo.id,
        filename=photo.filename,
        original_filename=photo.original_filename or photo.filename,
        category=photo.category,
        description=photo.description,
        confidence=photo.confidence,
        thumbnail=get_photo_url(photo),
        url=get_photo_url(photo),
        mask_url=photo.mask_url,
        created_at=photo.created_at.isoformat() if photo.created_at else "",
    )


@router.post("/nl", response_model=NLSearchResponse)
async def nl_search(
    request: NLSearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Natural-language search: parse the query with Gemini, then run a structured DB query."""
    parsed = _parse_query_with_openai(request.query)

    db_query = db.query(Photo).filter(Photo.user_id == current_user.id)

    # Category filter
    if parsed.categories:
        db_query = db_query.filter(Photo.category.in_(parsed.categories))

    # Confidence filter
    if parsed.confidence_min is not None:
        db_query = db_query.filter(Photo.confidence >= parsed.confidence_min)

    # Date filters
    if parsed.date_from:
        db_query = db_query.filter(Photo.created_at >= parsed.date_from)
    if parsed.date_to:
        db_query = db_query.filter(Photo.created_at <= parsed.date_to)

    photos = db_query.order_by(desc(Photo.confidence), desc(Photo.created_at)).limit(request.top_k).all()

    return NLSearchResponse(
        results=[_build_result(p) for p in photos],
        parsed_filters=parsed,
        total=len(photos),
    )


@router.post("", response_model=List[SearchResultItem])
async def search_images(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Keyword search across filename, category, description, tags, detected_objects."""
    query = request.query.lower().strip()
    filters = request.filters or {}

    db_query = db.query(Photo).filter(Photo.user_id == current_user.id)

    if query:
        pattern = f"%{query}%"
        db_query = db_query.filter(
            or_(
                Photo.filename.ilike(pattern),
                Photo.original_filename.ilike(pattern),
                Photo.category.ilike(pattern),
                Photo.description.ilike(pattern),
                Photo.tags.ilike(pattern),
                Photo.detected_objects.ilike(pattern),
            )
        )

    category = filters.get("category")
    if category and category != "All":
        db_query = db_query.filter(Photo.category == category)

    date_from = filters.get("dateFrom")
    date_to = filters.get("dateTo")
    if date_from:
        db_query = db_query.filter(Photo.created_at >= date_from)
    if date_to:
        db_query = db_query.filter(Photo.created_at <= date_to)

    results = db_query.order_by(desc(Photo.confidence), desc(Photo.created_at)).limit(request.top_k).all()
    return [_build_result(p) for p in results]


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get search suggestions based on partial query."""
    suggestions = []
    if q:
        categories = (
            db.query(Photo.category)
            .filter(Photo.user_id == current_user.id, Photo.category.isnot(None), Photo.category.ilike(f"%{q}%"))
            .distinct()
            .limit(5)
            .all()
        )
        suggestions = [cat[0] for cat in categories if cat[0]]
    return {"suggestions": suggestions}

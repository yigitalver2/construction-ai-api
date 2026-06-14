"""
Stats & Analytics Schemas - Pydantic models for dashboard data
"""
from typing import List, Optional
from pydantic import BaseModel


class StatsResponse(BaseModel):
    """Schema for dashboard stats."""
    total_photos: int = 0
    analyzed_photos: int = 0
    categories: int = 0
    storage_used: str = "0 MB"
    completion_rate: float = 0.0
    delta_total_photos_pct: float = 0.0


class CategoryDistribution(BaseModel):
    """Schema for category distribution item."""
    name: str
    value: int
    color: str


class TimelineDataPoint(BaseModel):
    """Schema for timeline data point."""
    date: str
    uploads: int
    analyzed: int


class TopCategory(BaseModel):
    """Schema for top category item."""
    name: str
    count: int
    percentage: float


class AnalyticsResponse(BaseModel):
    """Schema for full analytics response."""
    distribution: List[CategoryDistribution]
    timeline: List[TimelineDataPoint]
    topCategories: List[TopCategory]


class SearchResult(BaseModel):
    """Schema for search result item."""
    id: int
    filename: str
    category: Optional[str] = None
    description: Optional[str] = None
    confidence: Optional[float] = None
    thumbnail: Optional[str] = None
    url: Optional[str] = None
    created_at: str


class SearchResponse(BaseModel):
    """Schema for search response."""
    results: List[SearchResult]
    total: int
    query: str

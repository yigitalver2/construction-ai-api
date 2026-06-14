"""
Analytics API Endpoints - Charts and statistics data
"""
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models.photo import Photo
from app.schemas.stats import (
    AnalyticsResponse, 
    CategoryDistribution, 
    TimelineDataPoint,
    TopCategory
)
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Color palette for charts
CHART_COLORS = [
    "#6366f1",  # Indigo
    "#8b5cf6",  # Violet
    "#ec4899",  # Pink
    "#f43f5e",  # Rose
    "#f97316",  # Orange
    "#eab308",  # Yellow
    "#22c55e",  # Green
    "#14b8a6",  # Teal
    "#06b6d4",  # Cyan
    "#3b82f6",  # Blue
]


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get full analytics data including distribution, timeline, and top categories.
    """
    distribution = await get_distribution_data(db, current_user.id)
    timeline = await get_timeline_data(db, current_user.id, "7d")
    top_categories = await get_top_categories_data(db, current_user.id)
    
    return AnalyticsResponse(
        distribution=distribution,
        timeline=timeline,
        topCategories=top_categories
    )


@router.get("/distribution", response_model=List[CategoryDistribution])
async def get_distribution(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get category distribution for pie/donut charts.
    """
    return await get_distribution_data(db, current_user.id)


@router.get("/timeline", response_model=List[TimelineDataPoint])
async def get_timeline(
    period: str = Query("7d", regex="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get upload timeline data for line charts.
    Period can be: 7d, 30d, or 90d
    """
    return await get_timeline_data(db, current_user.id, period)


async def get_distribution_data(db: Session, user_id: int) -> List[CategoryDistribution]:
    """Get category distribution data."""
    # Query category counts
    results = db.query(
        Photo.category,
        func.count(Photo.id).label('count')
    ).filter(
        Photo.user_id == user_id,
        Photo.category.isnot(None)
    ).group_by(Photo.category).order_by(desc('count')).limit(10).all()
    
    distribution = []
    for i, (category, count) in enumerate(results):
        distribution.append(CategoryDistribution(
            name=category or "Uncategorized",
            value=count,
            color=CHART_COLORS[i % len(CHART_COLORS)]
        ))
    
    # If no data, return sample
    if not distribution:
        distribution = [
            CategoryDistribution(name="No data yet", value=1, color=CHART_COLORS[0])
        ]
    
    return distribution


async def get_timeline_data(db: Session, user_id: int, period: str) -> List[TimelineDataPoint]:
    """Get timeline data for uploads."""
    # Determine date range
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 7)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Generate all dates in range
    timeline = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Count uploads for this day
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        uploads = db.query(func.count(Photo.id)).filter(
            Photo.user_id == user_id,
            Photo.created_at >= day_start,
            Photo.created_at < day_end
        ).scalar() or 0
        
        analyzed = db.query(func.count(Photo.id)).filter(
            Photo.user_id == user_id,
            Photo.created_at >= day_start,
            Photo.created_at < day_end,
            Photo.category.isnot(None)
        ).scalar() or 0
        
        timeline.append(TimelineDataPoint(
            date=date_str,
            uploads=uploads,
            analyzed=analyzed
        ))
    
    return timeline


async def get_top_categories_data(db: Session, user_id: int) -> List[TopCategory]:
    """Get top categories with percentages."""
    # Get total count
    total = db.query(func.count(Photo.id)).filter(
        Photo.user_id == user_id,
        Photo.category.isnot(None)
    ).scalar() or 0
    
    if total == 0:
        return []
    
    # Get top categories
    results = db.query(
        Photo.category,
        func.count(Photo.id).label('count')
    ).filter(
        Photo.user_id == user_id,
        Photo.category.isnot(None)
    ).group_by(Photo.category).order_by(desc('count')).limit(5).all()
    
    top_categories = []
    for category, count in results:
        percentage = (count / total) * 100 if total > 0 else 0
        top_categories.append(TopCategory(
            name=category or "Uncategorized",
            count=count,
            percentage=round(percentage, 1)
        ))
    
    return top_categories

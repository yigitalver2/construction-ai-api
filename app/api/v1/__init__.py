"""
API v1 Router - Combines all API endpoints
"""
from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.stats import router as stats_router
from app.api.v1.endpoints.photos import router as photos_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.search import router as search_router

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth_router)

# Include stats routes
api_router.include_router(stats_router)

# Include photos routes
api_router.include_router(photos_router)

# Include analytics routes
api_router.include_router(analytics_router)

# Include search routes
api_router.include_router(search_router)

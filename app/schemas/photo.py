"""
Photo Schemas - Pydantic models for photo requests/responses
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class PhotoBase(BaseModel):
    """Base photo schema."""
    filename: str
    category: Optional[str] = None
    description: Optional[str] = None


class PhotoCreate(PhotoBase):
    """Schema for creating a new photo."""
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    project_id: Optional[str] = None
    user_id: int


class PhotoResponse(PhotoBase):
    """Schema for photo response."""
    id: int
    original_filename: str
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    confidence: Optional[float] = None
    detected_objects: Optional[str] = None
    project_id: Optional[str] = None
    tags: Optional[str] = None
    user_id: int
    created_at: datetime
    analyzed_at: Optional[datetime] = None
    
    # Virtual fields for frontend compatibility
    thumbnail: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    image_id: Optional[int] = None
    uploaded_at: Optional[datetime] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class PhotoListResponse(BaseModel):
    """Schema for paginated photo list."""
    photos: List[PhotoResponse]
    total: int
    page: int
    per_page: int


class UploadResponse(BaseModel):
    """Schema for upload response."""
    success: bool
    uploaded: int
    photos: List[PhotoResponse] = []
    errors: List[str] = []

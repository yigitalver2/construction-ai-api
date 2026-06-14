"""
User Schemas - Pydantic models for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    google_id: str
    given_name: Optional[str] = None
    family_name: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response (returned to frontend)."""
    id: int
    google_id: str
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """Schema for user stored in database."""
    updated_at: datetime

    class Config:
        from_attributes = True

"""
Authentication Schemas - Pydantic models for auth requests/responses
"""
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse


class GoogleAuthRequest(BaseModel):
    """Request schema for Google OAuth authentication."""
    token: str  # Google ID token from frontend


class TokenResponse(BaseModel):
    """Response schema for successful authentication."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: str  # Subject (user ID)
    email: str
    exp: Optional[int] = None  # Expiration time

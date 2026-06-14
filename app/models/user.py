"""
User Model - Database schema for users
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base


class User(Base):
    """
    User model for storing user information.
    Supports Google OAuth authentication.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # Google OAuth fields
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    # Profile information
    name = Column(String(255), nullable=True)
    given_name = Column(String(255), nullable=True)
    family_name = Column(String(255), nullable=True)
    picture = Column(Text, nullable=True)  # Profile picture URL
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)  # Google accounts are pre-verified
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"

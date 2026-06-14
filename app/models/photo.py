"""
Photo Model - Database schema for photos/images
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Photo(Base):
    """
    Photo model for storing uploaded images and their analysis results.
    """
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    
    # File information
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=True)  # in bytes
    mime_type = Column(String(100), nullable=True)
    
    # Image metadata
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    
    # AI Analysis results
    category = Column(String(100), nullable=True)  # Main detected category
    detected_objects = Column(Text, nullable=True)  # JSON string of detected objects
    confidence = Column(Float, nullable=True)  # Overall confidence score
    description = Column(Text, nullable=True)  # AI-generated description
    
    # Organization
    project_id = Column(String(100), nullable=True)
    tags = Column(Text, nullable=True)  # JSON string of tags
    
    # Ownership
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Photo(id={self.id}, filename='{self.filename}', category='{self.category}')>"

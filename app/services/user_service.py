"""
User Service - Business logic for user operations
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    """Service class for user-related operations."""

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_google_id(db: Session, google_id: str) -> Optional[User]:
        """Get user by Google ID."""
        return db.query(User).filter(User.google_id == google_id).first()

    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        """Create a new user."""
        db_user = User(
            google_id=user_data.google_id,
            email=user_data.email,
            name=user_data.name,
            given_name=user_data.given_name,
            family_name=user_data.family_name,
            picture=user_data.picture,
            is_active=True,
            is_verified=True,
            last_login=datetime.utcnow()
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_last_login(db: Session, user: User) -> User:
        """Update user's last login timestamp."""
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_profile(db: Session, user: User, **kwargs) -> User:
        """Update user profile information."""
        for key, value in kwargs.items():
            if hasattr(user, key) and value is not None:
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_or_create_from_google(db: Session, google_user_info: dict) -> tuple[User, bool]:
        """
        Get existing user or create new one from Google user info.
        
        Args:
            db: Database session
            google_user_info: User info from Google API
            
        Returns:
            Tuple of (User, is_new_user)
        """
        google_id = google_user_info.get("sub")
        email = google_user_info.get("email")
        
        # First, try to find by Google ID
        user = UserService.get_by_google_id(db, google_id)
        if user:
            # Update last login and profile info
            user = UserService.update_profile(
                db, user,
                name=google_user_info.get("name"),
                given_name=google_user_info.get("given_name"),
                family_name=google_user_info.get("family_name"),
                picture=google_user_info.get("picture")
            )
            user = UserService.update_last_login(db, user)
            return user, False
        
        # Check if user exists with same email (edge case)
        user = UserService.get_by_email(db, email)
        if user:
            # Link Google account to existing user
            user.google_id = google_id
            user = UserService.update_profile(
                db, user,
                name=google_user_info.get("name"),
                picture=google_user_info.get("picture")
            )
            user = UserService.update_last_login(db, user)
            return user, False
        
        # Create new user
        user_data = UserCreate(
            google_id=google_id,
            email=email,
            name=google_user_info.get("name"),
            given_name=google_user_info.get("given_name"),
            family_name=google_user_info.get("family_name"),
            picture=google_user_info.get("picture")
        )
        user = UserService.create(db, user_data)
        return user, True


# Singleton instance
user_service = UserService()

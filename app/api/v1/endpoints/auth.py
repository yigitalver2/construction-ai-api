"""
Authentication API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_token
from app.schemas.auth import GoogleAuthRequest, TokenResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import user_service
from app.services.google_auth_service import google_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Security scheme for protected endpoints
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dependency to get the current authenticated user from JWT token.
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_service.get_by_id(db, int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    
    return user


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with Google OAuth token.
    
    This endpoint:
    1. Receives the Google ID token from frontend
    2. Verifies the token with Google's API
    3. Creates or retrieves the user from database
    4. Returns a JWT access token for the session
    """
    # Verify Google token
    google_user_info = await google_auth_service.verify_google_token(request.token)
    
    if google_user_info is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token. Please try signing in again.",
        )
    
    # Get or create user
    user, is_new = user_service.get_or_create_from_google(db, google_user_info)
    
    if is_new:
        print(f"New user registered: {user.email}")
    else:
        print(f"User logged in: {user.email}")
    
    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user)
):
    """
    Get the current authenticated user's information.
    """
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current authenticated user's profile information.
    
    Only name, given_name, and family_name can be updated.
    Email and Google ID are managed by Google and cannot be changed.
    """
    updated_user = user_service.update_profile(
        db,
        current_user,
        name=user_update.name,
        given_name=user_update.given_name,
        family_name=user_update.family_name
    )
    
    return UserResponse.model_validate(updated_user)


@router.post("/logout")
async def logout():
    """
    Logout the current user.
    
    Note: Since we use JWT tokens, the actual logout happens on the frontend
    by removing the token from storage. This endpoint is provided for
    consistency and potential future server-side token invalidation.
    """
    return {"message": "Successfully logged out"}

"""
Google OAuth Service - Handles Google token verification
"""
import httpx
from typing import Optional
from app.core.config import settings


class GoogleAuthService:
    """Service class for Google OAuth operations."""
    
    # Google's token info endpoint
    TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
    
    @staticmethod
    async def verify_google_token(id_token: str) -> Optional[dict]:
        """
        Verify a Google ID token and return user info.
        
        Args:
            id_token: The Google ID token from frontend
            
        Returns:
            Dict with user info or None if invalid
            
        User info contains:
            - sub: Google user ID
            - email: User's email
            - email_verified: Boolean
            - name: Full name
            - given_name: First name
            - family_name: Last name
            - picture: Profile picture URL
            - locale: User's locale
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    GoogleAuthService.TOKEN_INFO_URL,
                    params={"id_token": id_token}
                )
                
                if response.status_code != 200:
                    print(f"Google token verification failed: {response.text}")
                    return None
                
                token_info = response.json()
                
                # Verify the token is for our app
                # Google returns 'aud' (audience) which should match our client ID
                if settings.GOOGLE_CLIENT_ID:
                    aud = token_info.get("aud")
                    if aud != settings.GOOGLE_CLIENT_ID:
                        print(f"Token audience mismatch. Expected: {settings.GOOGLE_CLIENT_ID}, Got: {aud}")
                        # For development, we'll allow any valid Google token
                        if settings.ENVIRONMENT != "development":
                            return None
                
                # Verify email is verified
                if not token_info.get("email_verified", False):
                    print("Email not verified")
                    return None
                
                return {
                    "sub": token_info.get("sub"),
                    "email": token_info.get("email"),
                    "email_verified": token_info.get("email_verified"),
                    "name": token_info.get("name"),
                    "given_name": token_info.get("given_name"),
                    "family_name": token_info.get("family_name"),
                    "picture": token_info.get("picture"),
                    "locale": token_info.get("locale"),
                }
                
        except Exception as e:
            print(f"Error verifying Google token: {e}")
            return None


# Singleton instance
google_auth_service = GoogleAuthService()

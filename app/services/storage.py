"""
Cloudinary storage backend for uploaded photos.

Replaces local disk writes so images survive container restarts.
Returns the Cloudinary secure_url which the frontend uses directly.
"""
import cloudinary
import cloudinary.uploader

from app.core.config import settings

_configured = False


def _configure():
    global _configured
    if not _configured:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        _configured = True


def upload_image(file_bytes: bytes, filename: str) -> str:
    """Upload raw image bytes to Cloudinary and return the secure URL."""
    _configure()
    public_id = filename.rsplit(".", 1)[0]  # strip extension; Cloudinary adds it back
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=public_id,
        folder="construction-ai",
        overwrite=False,
        resource_type="image",
    )
    return result["secure_url"]


def delete_image(filename: str) -> None:
    """Delete an image from Cloudinary by its original filename (best-effort)."""
    _configure()
    public_id = f"construction-ai/{filename.rsplit('.', 1)[0]}"
    cloudinary.uploader.destroy(public_id, resource_type="image")

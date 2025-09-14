from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.user_models import APIKeyCreate, APIKeyResponse, APIKeyRevoke, User
from services.api_key_service import APIKeyService, get_api_key_service
from services.auth_service import get_current_user
from database import get_db

router = APIRouter()

@router.post("/", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    api_key_service: APIKeyService = Depends(get_api_key_service)
):
    """Create a new API key for the current user."""
    api_key, plain_key = api_key_service.generate_api_key(
        user_id=current_user.id,
        name=api_key_data.name,
        scopes=api_key_data.scopes,
        expires_in_days=api_key_data.expires_in_days
    )
    # Return the plain key only once, upon creation
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=plain_key[:8], # Only return the prefix for security
        scopes=api_key.scopes,
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        expires_at=api_key.expires_at,
        last_used=api_key.last_used
    )

@router.get("/", response_model=List[APIKeyResponse])
async def get_api_keys(
    current_user: User = Depends(get_current_user),
    api_key_service: APIKeyService = Depends(get_api_key_service)
):
    """Get all API keys for the current user."""
    api_keys = api_key_service.get_api_keys_for_user(current_user.id)
    return [
        APIKeyResponse(
            id=key.id,
            name=key.name,
            key_prefix=key.key_hash[:8], # Use hash prefix for existing keys
            scopes=key.scopes,
            is_active=key.is_active,
            created_at=key.created_at,
            expires_at=key.expires_at,
            last_used=key.last_used
        ) for key in api_keys
    ]

@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    api_key_id: str,
    current_user: User = Depends(get_current_user),
    api_key_service: APIKeyService = Depends(get_api_key_service)
):
    """Revoke an API key by its ID."""
    if not api_key_service.revoke_api_key(api_key_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found or not authorized")
    return {"message": "API Key revoked successfully"}

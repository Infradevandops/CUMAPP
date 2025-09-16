#!/usr/bin/env python3
"""
Authentication API endpoints for CumApp Platform
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from core.database import get_db
from models.user_models import User, UserCreate, UserResponse
from services.auth_service import (AuthenticationService,
                                   get_current_active_user, get_current_user)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()


# Pydantic models for API requests/responses
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int


class LogoutRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class EmailVerificationRequest(BaseModel):
    token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str


class APIKeyCreateRequest(BaseModel):
    name: str
    scopes: Optional[list] = None


class APIKeyResponse(BaseModel):
    api_key: str
    key_id: str
    name: str
    created_at: str


# Simple registration model
class SimpleRegisterRequest(BaseModel):
    email: EmailStr
    password: str


# Authentication endpoints
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: SimpleRegisterRequest, db: Session = Depends(get_db)
):
    """
    Register a new user account
    """
    try:
        from auth.security import hash_password
        from models.user_models import User

        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create new user
        new_user = User(
            email=user_data.email,
            username=user_data.email.split("@")[0],
            hashed_password=hash_password(user_data.password),
            is_active=True,
            is_verified=True,  # Skip email verification for demo
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User registered successfully",
            "user_id": new_user.id,
            "email": new_user.email,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login")
async def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return access tokens
    """
    try:
        from auth.security import create_access_token, verify_password
        from models.user_models import User

        # Find user
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Create access token
        access_token = create_access_token(data={"sub": user.email})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "username": user.username},
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_access_token(
    refresh_data: RefreshRequest, db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    try:
        auth_service = AuthenticationService(db)
        result = await auth_service.refresh_token(refresh_data.refresh_token)

        return RefreshResponse(
            access_token=result["access_token"],
            token_type=result["token_type"],
            expires_in=result["expires_in"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed",
        )


@router.post("/logout")
async def logout_user(logout_data: LogoutRequest, db: Session = Depends(get_db)):
    """
    Logout user by invalidating refresh token
    """
    try:
        auth_service = AuthenticationService(db)
        result = await auth_service.logout(logout_data.refresh_token)

        return {"message": "Logged out successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Logout failed"
        )


@router.post("/verify-email")
async def verify_email(
    verification_data: EmailVerificationRequest, db: Session = Depends(get_db)
):
    """
    Verify user email address
    """
    try:
        auth_service = AuthenticationService(db)
        result = await auth_service.verify_email(verification_data.token)

        return {"message": "Email verified successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed",
        )


# Protected endpoints (require authentication)
@router.get("/me")
async def get_current_user_info(db: Session = Depends(get_db)):
    """
    Get current authenticated user information
    """
    # For demo, return mock user data
    return {"id": 1, "email": "demo@cumapp.com", "username": "demo", "is_active": True}


@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Change user password
    """
    try:
        from auth.security import (hash_password, is_strong_password,
                                   verify_password)

        # Verify current password
        if not verify_password(
            password_data.current_password, current_user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Validate new password strength
        is_valid, error_msg = is_strong_password(password_data.new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg
            )

        # Update password
        current_user.hashed_password = hash_password(password_data.new_password)
        db.commit()

        logger.info(f"Password changed for user: {current_user.id}")

        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed",
        )


@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    api_key_data: APIKeyCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new API key for the authenticated user
    """
    try:
        auth_service = AuthenticationService(db)
        result = await auth_service.create_api_key(
            user_id=current_user.id, name=api_key_data.name, scopes=api_key_data.scopes
        )

        return APIKeyResponse(
            api_key=result["api_key"],
            key_id=result["key_id"],
            name=result["name"],
            created_at=result["created_at"].isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API key creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key creation failed",
        )


@router.get("/api-keys")
async def list_api_keys(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """
    List user's API keys (without the actual key values)
    """
    try:
        from models.user_models import APIKey

        api_keys = (
            db.query(APIKey)
            .filter(APIKey.user_id == current_user.id, APIKey.is_active == True)
            .all()
        )

        return {
            "api_keys": [
                {
                    "id": key.id,
                    "name": key.name,
                    "created_at": key.created_at.isoformat(),
                    "last_used": key.last_used.isoformat() if key.last_used else None,
                    "total_requests": key.total_requests,
                    "requests_today": key.requests_today,
                }
                for key in api_keys
            ]
        }

    except Exception as e:
        logger.error(f"API key listing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list API keys",
        )


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Revoke an API key
    """
    try:
        from models.user_models import APIKey

        api_key = (
            db.query(APIKey)
            .filter(APIKey.id == key_id, APIKey.user_id == current_user.id)
            .first()
        )

        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="API key not found"
            )

        api_key.is_active = False
        db.commit()

        logger.info(f"API key revoked: {key_id} for user: {current_user.id}")

        return {"message": "API key revoked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API key revocation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key revocation failed",
        )


# Health check for auth service
@router.get("/health")
async def auth_health_check():
    """
    Health check for authentication service
    """
    return {
        "status": "healthy",
        "service": "authentication",
        "version": "1.1.0",
        "features": [
            "user_registration",
            "jwt_authentication",
            "token_refresh",
            "api_key_management",
            "email_verification",
            "password_reset",
        ],
    }

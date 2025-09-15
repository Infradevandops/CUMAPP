#!/usr/bin/env python3
"""
User Management Models for CumApp Communication Platform
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, EmailStr
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    Table,
    Index,
)
from sqlalchemy.orm import relationship
import uuid

from core.database import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    PREMIUM = "premium"


class SubscriptionPlan(str, Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class User(Base):
    """User model for the communication platform"""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)

    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(String, default=UserRole.USER)

    # Subscription info
    subscription_plan = Column(String, default=SubscriptionPlan.FREE)
    subscription_expires = Column(DateTime)

    # Usage limits
    monthly_sms_limit = Column(Integer, default=100)
    monthly_sms_used = Column(Integer, default=0)
    monthly_voice_minutes_limit = Column(Integer, default=60)
    monthly_voice_minutes_used = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

    # API access (deprecated - use APIKey model instead)
    api_calls_today = Column(Integer, default=0)
    api_rate_limit = Column(Integer, default=1000)

    # Email verification
    email_verification_token = Column(String)
    email_verification_expires = Column(DateTime)

    # Password reset
    password_reset_token = Column(String)
    password_reset_expires = Column(DateTime)

    # Relationships
    owned_numbers = relationship("PhoneNumber", back_populates="owner")
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
    api_keys = relationship(
        "APIKey", back_populates="user", cascade="all, delete-orphan"
    )
    verification_requests = relationship("VerificationRequest", back_populates="user")
    user_numbers = relationship(
        "UserNumber", back_populates="user", cascade="all, delete-orphan"
    )
    subscriptions = relationship("UserSubscription", back_populates="user")


class Session(Base):
    """User sessions for JWT refresh token management"""

    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    refresh_token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, default=datetime.utcnow)
    user_agent = Column(String)
    ip_address = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="sessions")

    __table_args__ = (
        Index("idx_session_refresh_token", "refresh_token"),
        Index("idx_session_user_active", "user_id", "is_active"),
    )


class APIKey(Base):
    """API keys for programmatic access"""

    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    key_hash = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    scopes = Column(Text)  # JSON array of permissions
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Usage tracking
    total_requests = Column(Integer, default=0)
    requests_today = Column(Integer, default=0)
    last_request_date = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="api_keys")

    __table_args__ = (
        Index("idx_apikey_hash", "key_hash"),
        Index("idx_apikey_user_active", "user_id", "is_active"),
    )


# Pydantic models for API
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    subscription_plan: SubscriptionPlan
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class APIKeyCreate(BaseModel):
    name: str
    scopes: Optional[str] = None
    expires_in_days: Optional[int] = 365  # Default to 1 year


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str  # First 8 chars of the key
    scopes: Optional[str]
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime]
    last_used: Optional[datetime]

    class Config:
        from_attributes = True


class APIKeyRevoke(BaseModel):
    id: str

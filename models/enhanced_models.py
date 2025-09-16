#!/usr/bin/env python3
"""
Enhanced Models for TextVerified Migration
Additional models and enhancements for the TextVerified integration
"""
import uuid
import enum
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Integer,
    Numeric,
    Index,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, validator

from core.database import Base


# Enhanced Enums
class MessageCategory(enum.Enum):
    VERIFICATION_CODE = "verification_code"
    CONVERSATION = "conversation"
    NOTIFICATION = "notification"
    SYSTEM = "system"


class RoutingType(enum.Enum):
    DIRECT = "direct"
    LOCAL_NUMBER = "local_number"
    REGIONAL_HUB = "regional_hub"
    SMART_ROUTING = "smart_routing"


class CountryTier(enum.Enum):
    TIER_1 = "tier_1"  # Premium countries (US, UK, etc.)
    TIER_2 = "tier_2"  # Standard countries
    TIER_3 = "tier_3"  # Emerging markets


# Enhanced Models
class UserNumber(Base):
    """Enhanced user phone numbers with country code tracking and routing info"""

    __tablename__ = "user_numbers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)

    # Geographic information
    country_code = Column(String(3), nullable=False, index=True)
    country_name = Column(String(100), nullable=False)
    area_code = Column(String(10))
    region = Column(String(100))
    timezone = Column(String(50))

    # Provider and routing information
    provider = Column(String(50), nullable=False)  # twilio, textverified, etc.
    provider_number_id = Column(String(200))  # Provider's internal ID
    routing_type = Column(Enum(RoutingType), default=RoutingType.DIRECT)
    routing_metadata = Column(JSON)  # Routing configuration and preferences

    # Capabilities and features
    supports_sms = Column(Boolean, default=True)
    supports_voice = Column(Boolean, default=True)
    supports_mms = Column(Boolean, default=False)
    is_toll_free = Column(Boolean, default=False)
    is_short_code = Column(Boolean, default=False)

    # Pricing and costs
    monthly_cost = Column(Numeric(10, 4), default=0)
    sms_cost_outbound = Column(Numeric(10, 4), default=0.01)
    sms_cost_inbound = Column(Numeric(10, 4), default=0.01)
    voice_cost_per_minute = Column(Numeric(10, 4), default=0.02)
    setup_fee = Column(Numeric(10, 4), default=0)

    # Usage tracking
    total_sms_sent = Column(Integer, default=0)
    total_sms_received = Column(Integer, default=0)
    total_voice_minutes_outbound = Column(Integer, default=0)
    total_voice_minutes_inbound = Column(Integer, default=0)

    # Monthly usage (resets monthly)
    monthly_sms_sent = Column(Integer, default=0)
    monthly_sms_received = Column(Integer, default=0)
    monthly_voice_minutes = Column(Integer, default=0)
    monthly_cost_incurred = Column(Numeric(10, 4), default=0)
    last_usage_reset = Column(DateTime, default=datetime.utcnow)

    # Status and lifecycle
    status = Column(
        String(20), default="active"
    )  # active, suspended, expired, cancelled
    is_primary = Column(Boolean, default=False)  # User's primary number
    auto_renew = Column(Boolean, default=True)

    # Subscription details
    purchased_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    last_renewal_at = Column(DateTime)

    # Smart routing preferences
    preferred_for_countries = Column(JSON)  # Countries this number is preferred for
    routing_priority = Column(Integer, default=0)  # Higher = more preferred
    cost_optimization_enabled = Column(Boolean, default=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_numbers")
    sent_messages = relationship(
        "EnhancedMessage",
        foreign_keys="EnhancedMessage.from_number_id",
        back_populates="from_number_obj",
    )
    received_messages = relationship(
        "EnhancedMessage",
        foreign_keys="EnhancedMessage.to_number_id",
        back_populates="to_number_obj",
    )

    # Indexes
    __table_args__ = (
        Index("idx_user_number_user", "user_id"),
        Index("idx_user_number_country", "country_code"),
        Index("idx_user_number_status", "status"),
        Index("idx_user_number_provider", "provider"),
        Index("idx_user_number_primary", "user_id", "is_primary"),
        UniqueConstraint("user_id", "is_primary", name="uq_user_primary_number"),
        {"extend_existing": True},
    )


class EnhancedMessage(Base):
    """Enhanced message model with inbox categorization and routing info"""

    __tablename__ = "enhanced_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Message categorization for inbox
    category = Column(Enum(MessageCategory), nullable=False, index=True)
    subcategory = Column(String(50))  # e.g., "whatsapp", "google", "personal"

    # Message content and metadata
    content = Column(Text, nullable=False)
    subject = Column(String(200))  # For categorization/search

    # Phone number references
    from_number = Column(String(20), nullable=False)
    to_number = Column(String(20), nullable=False)
    from_number_id = Column(String, ForeignKey("user_numbers.id"))
    to_number_id = Column(String, ForeignKey("user_numbers.id"))

    # Direction and type
    direction = Column(String(10), nullable=False)  # inbound, outbound
    message_type = Column(String(20), default="sms")  # sms, mms, voice_transcript

    # Provider and routing information
    provider = Column(String(50), nullable=False)
    provider_message_id = Column(String(200))  # Twilio SID, TextVerified ID, etc.
    routing_type = Column(Enum(RoutingType), default=RoutingType.DIRECT)
    routing_info = Column(JSON)  # Routing decisions and metadata

    # Status and delivery
    status = Column(String(20), default="received")  # received, sent, delivered, failed
    delivery_status = Column(String(50))
    error_code = Column(String(20))
    error_message = Column(Text)

    # Inbox management
    is_read = Column(Boolean, default=False, index=True)
    is_starred = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)

    # Verification code extraction
    extracted_codes = Column(JSON)  # Array of extracted codes
    code_extraction_confidence = Column(Numeric(5, 4))  # Confidence score
    auto_extracted = Column(Boolean, default=False)

    # AI and automation
    ai_category_confidence = Column(Numeric(5, 4))  # AI categorization confidence
    ai_suggested_reply = Column(Text)  # AI-suggested response
    ai_sentiment = Column(String(20))  # positive, negative, neutral

    # Cost and billing
    cost = Column(Numeric(10, 4))
    currency = Column(String(3), default="USD")

    # Associated verification
    verification_id = Column(String, ForeignKey("verification_requests.id"))

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    read_at = Column(DateTime)

    # Relationships
    user = relationship("User")
    from_number_obj = relationship(
        "UserNumber", foreign_keys=[from_number_id], back_populates="enhanced_messages"
    )
    to_number_obj = relationship("UserNumber", foreign_keys=[to_number_id])
    verification = relationship("VerificationRequest")

    # Indexes
    __table_args__ = (
        Index("idx_enhanced_message_user", "user_id"),
        Index("idx_enhanced_message_category", "category"),
        Index("idx_enhanced_message_read", "is_read"),
        Index("idx_enhanced_message_created", "created_at"),
        Index("idx_enhanced_message_verification", "verification_id"),
        Index("idx_enhanced_message_provider_id", "provider_message_id"),
        Index("idx_enhanced_message_inbox", "user_id", "category", "is_read"),
        {"extend_existing": True},
    )


class CountryRouting(Base):
    """Country-specific routing configuration and pricing"""

    __tablename__ = "country_routing"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    country_code = Column(String(3), unique=True, nullable=False, index=True)
    country_name = Column(String(100), nullable=False)

    # Geographic and regulatory info
    continent = Column(String(50))
    region = Column(String(100))
    tier = Column(Enum(CountryTier), default=CountryTier.TIER_2)
    dial_code = Column(String(10), nullable=False)

    # Routing preferences
    preferred_routing_type = Column(
        Enum(RoutingType), default=RoutingType.SMART_ROUTING
    )
    supports_local_numbers = Column(Boolean, default=True)
    supports_toll_free = Column(Boolean, default=False)

    # Pricing information
    sms_cost_direct = Column(Numeric(10, 4), default=0.05)  # Direct routing cost
    sms_cost_local = Column(Numeric(10, 4), default=0.02)  # Local number cost
    voice_cost_per_minute = Column(Numeric(10, 4), default=0.10)
    local_number_monthly_cost = Column(Numeric(10, 4), default=2.00)

    # Performance metrics
    delivery_success_rate = Column(Numeric(5, 4), default=0.95)
    average_delivery_time = Column(Integer, default=5)  # Seconds

    # Regulatory and compliance
    requires_registration = Column(Boolean, default=False)
    supports_verification_services = Column(Boolean, default=True)
    restricted_content_types = Column(JSON)  # Array of restricted content types

    # Provider availability
    available_providers = Column(JSON)  # Array of available providers
    recommended_provider = Column(String(50))

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index("idx_country_routing_tier", "tier"),
        Index("idx_country_routing_active", "is_active"),
        Index("idx_country_routing_dial_code", "dial_code"),
        {"extend_existing": True},
    )


class RoutingDecision(Base):
    """Log of routing decisions for analytics and optimization"""

    __tablename__ = "routing_decisions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message_id = Column(String, ForeignKey("enhanced_messages.id"))

    # Routing context
    destination_country = Column(String(3), nullable=False)
    source_number_id = Column(String, ForeignKey("user_numbers.id"))

    # Decision details
    routing_type_chosen = Column(Enum(RoutingType), nullable=False)
    routing_type_alternatives = Column(JSON)  # Other options considered
    decision_reason = Column(String(200))  # Why this route was chosen

    # Cost analysis
    estimated_cost = Column(Numeric(10, 4))
    actual_cost = Column(Numeric(10, 4))
    cost_savings = Column(Numeric(10, 4))  # Compared to direct routing

    # Performance metrics
    delivery_time = Column(Integer)  # Actual delivery time in seconds
    delivery_success = Column(Boolean)

    # AI/ML features
    ml_confidence_score = Column(Numeric(5, 4))  # ML model confidence
    user_satisfaction_score = Column(Integer)  # 1-5 rating if provided

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    message = relationship("EnhancedMessage")
    source_number = relationship("UserNumber")

    # Indexes
    __table_args__ = (
        Index("idx_routing_decision_user", "user_id"),
        Index("idx_routing_decision_country", "destination_country"),
        Index("idx_routing_decision_type", "routing_type_chosen"),
        Index("idx_routing_decision_created", "created_at"),
        {"extend_existing": True},
    )


class InboxFolder(Base):
    """Custom inbox folders for message organization"""

    __tablename__ = "inbox_folders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Folder details
    name = Column(String(100), nullable=False)
    description = Column(Text)
    color = Column(String(7))  # Hex color code
    icon = Column(String(50))  # Icon identifier

    # Folder configuration
    is_system_folder = Column(Boolean, default=False)  # System vs user-created
    auto_categorize = Column(Boolean, default=False)
    categorization_rules = Column(JSON)  # Rules for auto-categorization

    # Display settings
    sort_order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User")

    # Indexes
    __table_args__ = (
        Index("idx_inbox_folder_user", "user_id"),
        Index("idx_inbox_folder_system", "is_system_folder"),
        UniqueConstraint("user_id", "name", name="uq_user_folder_name"),
        {"extend_existing": True},
    )


class MessageFolder(Base):
    """Association table for messages in folders"""

    __tablename__ = "message_folders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(String, ForeignKey("enhanced_messages.id"), nullable=False)
    folder_id = Column(String, ForeignKey("inbox_folders.id"), nullable=False)

    # Metadata
    added_at = Column(DateTime, default=datetime.utcnow)
    added_by_rule = Column(Boolean, default=False)  # Auto-categorized vs manual

    # Relationships
    message = relationship("EnhancedMessage")
    folder = relationship("InboxFolder")

    # Indexes
    __table_args__ = (
        Index("idx_message_folder_message", "message_id"),
        Index("idx_message_folder_folder", "folder_id"),
        UniqueConstraint("message_id", "folder_id", name="uq_message_folder"),
        {"extend_existing": True},
    )


# Pydantic Models for API
class UserNumberResponse(BaseModel):
    """Response model for user numbers"""

    id: str
    user_id: str
    phone_number: str
    country_code: str
    country_name: str
    area_code: Optional[str]
    region: Optional[str]
    provider: str
    routing_type: RoutingType
    supports_sms: bool
    supports_voice: bool
    supports_mms: bool
    is_toll_free: bool
    monthly_cost: Decimal
    sms_cost_outbound: Decimal
    voice_cost_per_minute: Decimal
    status: str
    is_primary: bool
    total_sms_sent: int
    total_sms_received: int
    monthly_sms_sent: int
    monthly_voice_minutes: int
    purchased_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class EnhancedMessageResponse(BaseModel):
    """Response model for enhanced messages"""

    id: str
    user_id: str
    category: MessageCategory
    subcategory: Optional[str]
    content: str
    subject: Optional[str]
    from_number: str
    to_number: str
    direction: str
    message_type: str
    provider: str
    routing_type: RoutingType
    status: str
    is_read: bool
    is_starred: bool
    is_archived: bool
    extracted_codes: Optional[List[str]]
    auto_extracted: bool
    ai_sentiment: Optional[str]
    cost: Optional[Decimal]
    verification_id: Optional[str]
    created_at: datetime
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class CountryRoutingResponse(BaseModel):
    """Response model for country routing information"""

    country_code: str
    country_name: str
    continent: str
    region: str
    tier: CountryTier
    dial_code: str
    preferred_routing_type: RoutingType
    supports_local_numbers: bool
    sms_cost_direct: Decimal
    sms_cost_local: Decimal
    voice_cost_per_minute: Decimal
    local_number_monthly_cost: Decimal
    delivery_success_rate: Decimal
    average_delivery_time: int
    available_providers: List[str]
    recommended_provider: str

    class Config:
        from_attributes = True


class InboxStatsResponse(BaseModel):
    """Response model for inbox statistics"""

    total_messages: int
    unread_messages: int
    verification_codes: int
    conversations: int
    notifications: int
    system_messages: int
    starred_messages: int
    archived_messages: int
    spam_messages: int
    messages_today: int
    messages_this_week: int
    messages_this_month: int


class MessageCreateRequest(BaseModel):
    """Request model for creating enhanced messages"""

    to_number: str = Field(..., description="Recipient phone number")
    content: str = Field(..., description="Message content")
    from_number_id: Optional[str] = Field(None, description="Sender number ID")
    category: MessageCategory = MessageCategory.CONVERSATION
    subcategory: Optional[str] = Field(None, description="Message subcategory")
    use_smart_routing: bool = True
    routing_type: Optional[RoutingType] = None

    @validator("to_number")
    def validate_phone_number(cls, v):
        if not v.startswith("+"):
            raise ValueError("Phone number must be in E.164 format")
        return v


class InboxFolderCreate(BaseModel):
    """Request model for creating inbox folders"""

    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    auto_categorize: bool = False
    categorization_rules: Optional[Dict[str, Any]] = None


class InboxFolderResponse(BaseModel):
    """Response model for inbox folders"""

    id: str
    user_id: str
    name: str
    description: Optional[str]
    color: Optional[str]
    icon: Optional[str]
    is_system_folder: bool
    auto_categorize: bool
    sort_order: int
    is_visible: bool
    message_count: int = 0
    unread_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class RoutingRecommendationRequest(BaseModel):
    """Request model for routing recommendations"""

    destination_country: str = Field(..., description="Destination country code")
    message_count: int = Field(1, ge=1, le=1000)
    message_type: str = Field("sms", description="Message type")
    priority: str = Field("normal", description="Message priority")

    @validator("destination_country")
    def validate_country_code(cls, v):
        if len(v) != 2:
            raise ValueError("Country code must be 2 characters")
        return v.upper()


class RoutingRecommendationResponse(BaseModel):
    """Response model for routing recommendations"""

    destination_country: str
    recommended_routing: RoutingType
    estimated_cost: Decimal
    estimated_savings: Decimal
    delivery_time_estimate: int
    success_rate_estimate: Decimal
    alternative_routes: List[Dict[str, Any]]
    reasoning: str

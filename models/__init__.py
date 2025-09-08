#!/usr/bin/env python3
"""
Models package initialization
"""
# Import Base first to ensure single registry
from models.user_models import Base

# Import all models using the same Base
from models.user_models import (
    User, Session as UserSession, APIKey, VerificationRequest, PhoneNumber,
    UserRole, SubscriptionPlan, UserCreate, UserResponse
)
from models.conversation_models import (
    Conversation, Message, conversation_participants,
    ConversationStatus, MessageType,
    ConversationCreate, ConversationUpdate, ConversationResponse,
    MessageCreate, MessageUpdate, MessageResponse,
    ConversationListResponse, MessageListResponse,
    ConversationFilters, MessageFilters
)

__all__ = [
    # Base
    "Base",
    
    # User models
    "User", "UserSession", "APIKey", "VerificationRequest", "PhoneNumber",
    "UserRole", "SubscriptionPlan",
    "UserCreate", "UserResponse",
    
    # Conversation models
    "Conversation", "Message", "conversation_participants",
    "ConversationStatus", "MessageType",
    "ConversationCreate", "ConversationUpdate", "ConversationResponse",
    "MessageCreate", "MessageUpdate", "MessageResponse",
    "ConversationListResponse", "MessageListResponse",
    "ConversationFilters", "MessageFilters"
]
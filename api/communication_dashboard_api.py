"""
Communication Dashboard API for SMS sending and conversation management
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth.auth_middleware import get_current_user
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/communication", tags=["communication_dashboard"])

class ConversationMessage(BaseModel):
    """Model for conversation messages"""
    id: str
    content: str
    timestamp: datetime
    sent: bool = Field(..., description="True if sent by user, False if received")
    from_number: Optional[str] = Field(None, description="Sender phone number")
    to_number: Optional[str] = Field(None, description="Recipient phone number")

class Conversation(BaseModel):
    """Model for conversations"""
    id: str
    recipient: str = Field(..., description="Recipient phone number")
    from_number: str = Field(..., description="User's phone number used for this conversation")
    last_message: str = Field(..., description="Last message content")
    timestamp: datetime = Field(..., description="Last message timestamp")
    unread_count: int = Field(0, description="Number of unread messages")
    message_count: int = Field(0, description="Total message count")

class SendMessageRequest(BaseModel):
    """Request model for sending messages"""
    to_number: str = Field(..., description="Recipient phone number")
    from_number: str = Field(..., description="Sender phone number (user's number)")
    content: str = Field(..., description="Message content")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")

class SendMessageResponse(BaseModel):
    """Response model for sending messages"""
    message_id: str
    conversation_id: str
    status: str
    cost: float = Field(..., description="Message cost in USD")
    timestamp: datetime

class AISuggestionRequest(BaseModel):
    """Request model for AI suggestions"""
    conversation_id: str
    last_messages: List[str] = Field(..., description="Recent messages for context")

class AISuggestionResponse(BaseModel):
    """Response model for AI suggestions"""
    suggestions: List[str]
    context_used: bool = Field(True, description="Whether conversation context was used")

class CommunicationStats(BaseModel):
    """Model for communication statistics"""
    messages_sent_today: int
    messages_received_today: int
    total_cost_today: float
    active_conversations: int
    total_conversations: int

@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100, description="Number of conversations to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """
    Get user's conversations
    
    Args:
        current_user: Current authenticated user
        limit: Maximum number of conversations to return
        offset: Offset for pagination
        
    Returns:
        List[Conversation]: User's conversations
    """
    try:
        # Mock conversations for demonstration
        mock_conversations = [
            Conversation(
                id="conv1",
                recipient="+1234567892",
                from_number="+1234567890",
                last_message="Hello, how are you doing today?",
                timestamp=datetime.now(),
                unread_count=2,
                message_count=5
            ),
            Conversation(
                id="conv2",
                recipient="+1234567893",
                from_number="+1234567891",
                last_message="Thanks for your help yesterday!",
                timestamp=datetime.now() - timedelta(hours=2),
                unread_count=0,
                message_count=8
            ),
            Conversation(
                id="conv3",
                recipient="+1234567894",
                from_number="+1234567890",
                last_message="Can we schedule a call for tomorrow?",
                timestamp=datetime.now() - timedelta(hours=6),
                unread_count=1,
                message_count=3
            )
        ]
        
        # Apply pagination
        paginated_conversations = mock_conversations[offset:offset + limit]
        
        return paginated_conversations
        
    except Exception as e:
        logger.error(f"Failed to get conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations")

@router.get("/conversations/{conversation_id}/messages", response_model=List[ConversationMessage])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100, description="Number of messages to return")
):
    """
    Get messages for a specific conversation
    
    Args:
        conversation_id: Conversation ID
        current_user: Current authenticated user
        limit: Maximum number of messages to return
        
    Returns:
        List[ConversationMessage]: Conversation messages
    """
    try:
        # Mock messages for demonstration
        mock_messages = [
            ConversationMessage(
                id="m1",
                content="Hello, how are you doing today?",
                timestamp=datetime.now() - timedelta(hours=2),
                sent=False,
                from_number="+1234567892",
                to_number="+1234567890"
            ),
            ConversationMessage(
                id="m2",
                content="Hi! I'm doing well, thanks for asking. How about you?",
                timestamp=datetime.now() - timedelta(hours=1, minutes=58),
                sent=True,
                from_number="+1234567890",
                to_number="+1234567892"
            ),
            ConversationMessage(
                id="m3",
                content="Great! I wanted to ask about the project we discussed.",
                timestamp=datetime.now() - timedelta(hours=1, minutes=55),
                sent=False,
                from_number="+1234567892",
                to_number="+1234567890"
            ),
            ConversationMessage(
                id="m4",
                content="Sure! I'd be happy to discuss it. What specific aspects are you interested in?",
                timestamp=datetime.now() - timedelta(hours=1, minutes=50),
                sent=True,
                from_number="+1234567890",
                to_number="+1234567892"
            )
        ]
        
        # Filter by conversation (in real implementation, this would be a database query)
        conversation_messages = mock_messages[:limit]
        
        return conversation_messages
        
    except Exception as e:
        logger.error(f"Failed to get conversation messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversation messages")

@router.post("/send-message", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Send an SMS message
    
    Args:
        request: Message sending request
        current_user: Current authenticated user
        
    Returns:
        SendMessageResponse: Message sending result
    """
    try:
        # In real implementation, this would:
        # 1. Validate user owns the from_number
        # 2. Check user credits/balance
        # 3. Send SMS via Twilio or other provider
        # 4. Store message in database
        # 5. Update conversation
        
        logger.info(f"Sending SMS from {request.from_number} to {request.to_number}")
        
        # Mock response
        message_id = f"msg_{datetime.now().timestamp()}"
        conversation_id = request.conversation_id or f"conv_{datetime.now().timestamp()}"
        
        return SendMessageResponse(
            message_id=message_id,
            conversation_id=conversation_id,
            status="sent",
            cost=0.01,  # $0.01 per SMS
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Failed to send message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")

@router.post("/ai-suggestions", response_model=AISuggestionResponse)
async def get_ai_suggestions(
    request: AISuggestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered response suggestions
    
    Args:
        request: AI suggestion request
        current_user: Current authenticated user
        
    Returns:
        AISuggestionResponse: AI suggestions
    """
    try:
        # In real implementation, this would:
        # 1. Load conversation context
        # 2. Call AI service (Groq, OpenAI, etc.)
        # 3. Generate contextual suggestions
        
        # Mock suggestions based on common responses
        mock_suggestions = [
            "That sounds great! When would be a good time?",
            "I'd be happy to help with that.",
            "Let me check and get back to you.",
            "Thanks for letting me know!",
            "Could you provide more details?",
            "I understand. Let's discuss this further."
        ]
        
        # In real implementation, filter suggestions based on context
        contextual_suggestions = mock_suggestions[:4]  # Return top 4 suggestions
        
        return AISuggestionResponse(
            suggestions=contextual_suggestions,
            context_used=True
        )
        
    except Exception as e:
        logger.error(f"Failed to get AI suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI suggestions")

@router.get("/stats", response_model=CommunicationStats)
async def get_communication_stats(
    current_user: User = Depends(get_current_user)
):
    """
    Get communication statistics for the current user
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        CommunicationStats: Communication statistics
    """
    try:
        # Mock stats for demonstration
        stats = CommunicationStats(
            messages_sent_today=12,
            messages_received_today=8,
            total_cost_today=0.12,
            active_conversations=3,
            total_conversations=5
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get communication stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve communication statistics")

@router.post("/conversations/{conversation_id}/mark-read")
async def mark_conversation_as_read(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Mark all messages in a conversation as read
    
    Args:
        conversation_id: Conversation ID
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    try:
        # In real implementation, this would update the database
        logger.info(f"Marking conversation {conversation_id} as read for user {current_user.id}")
        
        return {"message": "Conversation marked as read", "conversation_id": conversation_id}
        
    except Exception as e:
        logger.error(f"Failed to mark conversation as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark conversation as read")

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a conversation and all its messages
    
    Args:
        conversation_id: Conversation ID
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    try:
        # In real implementation, this would delete from the database
        logger.info(f"Deleting conversation {conversation_id} for user {current_user.id}")
        
        return {"message": "Conversation deleted successfully", "conversation_id": conversation_id}
        
    except Exception as e:
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")
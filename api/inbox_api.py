"""
Inbox API for managing all user messages and notifications
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from middleware.auth_middleware import get_current_user_from_middleware
from models.user_models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/inbox", tags=["inbox"])


class InboxMessage(BaseModel):
    """Model for inbox messages"""

    id: str
    type: str = Field(
        ..., description="Message type: verification_code, conversation, notification"
    )
    service: str = Field(..., description="Service name (WhatsApp, Google, SMS, etc.)")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(..., description="Message timestamp")
    read: bool = Field(False, description="Read status")
    from_number: Optional[str] = Field(None, description="Sender phone number")
    verification_id: Optional[str] = Field(
        None, description="Associated verification ID"
    )
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class InboxStats(BaseModel):
    """Model for inbox statistics"""

    total_messages: int
    verification_codes: int
    conversations: int
    notifications: int
    unread_messages: int


class InboxResponse(BaseModel):
    """Response model for inbox data"""

    messages: List[InboxMessage]
    stats: InboxStats
    has_more: bool = Field(False, description="Whether there are more messages")


@router.get("/messages", response_model=InboxResponse)
async def get_inbox_messages(
    current_user: User = Depends(get_current_user_from_middleware),
    limit: int = Query(50, ge=1, le=100, description="Number of messages to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    message_type: Optional[str] = Query(None, description="Filter by message type"),
    unread_only: bool = Query(False, description="Show only unread messages"),
):
    """
    Get inbox messages for the current user

    Args:
        current_user: Current authenticated user
        limit: Maximum number of messages to return
        offset: Offset for pagination
        message_type: Filter by message type (verification_code, conversation, notification)
        unread_only: Show only unread messages

    Returns:
        InboxResponse: Messages and statistics
    """
    try:
        # Mock data for demonstration - in real implementation, this would query the database
        mock_messages = [
            InboxMessage(
                id="m1",
                type="verification_code",
                service="WhatsApp",
                content="Your WhatsApp code is: 123456",
                timestamp=datetime.now(),
                read=False,
                from_number="+1234567890",
                verification_id="v1",
                metadata={"extracted_code": "123456", "service_id": "whatsapp"},
            ),
            InboxMessage(
                id="m2",
                type="verification_code",
                service="Google",
                content="Google verification code: 789012. Do not share this code.",
                timestamp=datetime.now() - timedelta(hours=1),
                read=True,
                from_number="+1234567891",
                verification_id="v2",
                metadata={"extracted_code": "789012", "service_id": "google"},
            ),
            InboxMessage(
                id="m3",
                type="conversation",
                service="SMS",
                content="Hello, how are you doing today?",
                timestamp=datetime.now() - timedelta(hours=2),
                read=False,
                from_number="+1234567892",
                metadata={"conversation_id": "conv1"},
            ),
            InboxMessage(
                id="m4",
                type="notification",
                service="System",
                content="Your subscription will expire in 3 days",
                timestamp=datetime.now() - timedelta(hours=6),
                read=False,
                metadata={"notification_type": "subscription_warning"},
            ),
            InboxMessage(
                id="m5",
                type="verification_code",
                service="Telegram",
                content="Telegram login code: 456789",
                timestamp=datetime.now() - timedelta(hours=12),
                read=True,
                from_number="+1234567893",
                verification_id="v3",
                metadata={"extracted_code": "456789", "service_id": "telegram"},
            ),
        ]

        # Apply filters
        filtered_messages = mock_messages

        if message_type:
            filtered_messages = [m for m in filtered_messages if m.type == message_type]

        if unread_only:
            filtered_messages = [m for m in filtered_messages if not m.read]

        # Sort by timestamp (newest first)
        filtered_messages.sort(key=lambda x: x.timestamp, reverse=True)

        # Apply pagination
        paginated_messages = filtered_messages[offset : offset + limit]
        has_more = len(filtered_messages) > offset + limit

        # Calculate stats
        stats = InboxStats(
            total_messages=len(mock_messages),
            verification_codes=len(
                [m for m in mock_messages if m.type == "verification_code"]
            ),
            conversations=len([m for m in mock_messages if m.type == "conversation"]),
            notifications=len([m for m in mock_messages if m.type == "notification"]),
            unread_messages=len([m for m in mock_messages if not m.read]),
        )

        return InboxResponse(
            messages=paginated_messages, stats=stats, has_more=has_more
        )

    except Exception as e:
        logger.error(f"Failed to get inbox messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve inbox messages")


@router.post("/messages/{message_id}/mark-read")
async def mark_message_as_read(
    message_id: str, current_user: User = Depends(get_current_user_from_middleware)
):
    """
    Mark a message as read

    Args:
        message_id: Message ID to mark as read
        current_user: Current authenticated user

    Returns:
        Success message
    """
    try:
        # In real implementation, this would update the database
        logger.info(f"Marking message {message_id} as read for user {current_user.id}")

        return {"message": "Message marked as read", "message_id": message_id}

    except Exception as e:
        logger.error(f"Failed to mark message as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark message as read")


@router.post("/messages/mark-all-read")
async def mark_all_messages_as_read(
    current_user: User = Depends(get_current_user_from_middleware),
    message_type: Optional[str] = Query(
        None, description="Mark only specific type as read"
    ),
):
    """
    Mark all messages as read

    Args:
        current_user: Current authenticated user
        message_type: Optional filter to mark only specific type as read

    Returns:
        Success message with count
    """
    try:
        # In real implementation, this would update the database
        logger.info(f"Marking all messages as read for user {current_user.id}")

        # Mock count for demonstration
        marked_count = 3 if not message_type else 2

        return {
            "message": f"Marked {marked_count} messages as read",
            "count": marked_count,
            "message_type": message_type,
        }

    except Exception as e:
        logger.error(f"Failed to mark all messages as read: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to mark all messages as read"
        )


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str, current_user: User = Depends(get_current_user_from_middleware)
):
    """
    Delete a message from inbox

    Args:
        message_id: Message ID to delete
        current_user: Current authenticated user

    Returns:
        Success message
    """
    try:
        # In real implementation, this would delete from the database
        logger.info(f"Deleting message {message_id} for user {current_user.id}")

        return {"message": "Message deleted successfully", "message_id": message_id}

    except Exception as e:
        logger.error(f"Failed to delete message: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete message")


@router.get("/stats", response_model=InboxStats)
async def get_inbox_stats(
    current_user: User = Depends(get_current_user_from_middleware),
):
    """
    Get inbox statistics for the current user

    Args:
        current_user: Current authenticated user

    Returns:
        InboxStats: Inbox statistics
    """
    try:
        # Mock stats for demonstration
        stats = InboxStats(
            total_messages=5,
            verification_codes=3,
            conversations=1,
            notifications=1,
            unread_messages=3,
        )

        return stats

    except Exception as e:
        logger.error(f"Failed to get inbox stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve inbox statistics"
        )

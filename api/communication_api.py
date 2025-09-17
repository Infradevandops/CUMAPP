#!/usr/bin/env python3
"""
Communication API Endpoints
Provides comprehensive SMS and voice communication with smart routing, history management,
call recording, forwarding, and user number management dashboard
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth.jwt_handler import verify_jwt_token
from core.database import get_db
from clients.enhanced_twilio_client import EnhancedTwilioClient
from models.user_models import User
from services.communication_service import (CommunicationService,
                                            create_communication_service)

# Initialize router and security
router = APIRouter(prefix="/api/communication", tags=["communication"])
security = HTTPBearer()


# Pydantic models for request/response
class SendSMSRequest(BaseModel):
    to_number: str = Field(..., description="Recipient phone number")
    message: str = Field(..., description="Message content")
    from_number: Optional[str] = Field(None, description="Sender phone number")
    use_smart_routing: bool = Field(
        True, description="Use smart routing for optimal number selection"
    )


class MakeCallRequest(BaseModel):
    to_number: str = Field(..., description="Recipient phone number")
    from_number: Optional[str] = Field(None, description="Caller phone number")
    twiml_url: Optional[str] = Field(
        None, description="TwiML URL for call instructions"
    )
    use_smart_routing: bool = Field(
        True, description="Use smart routing for optimal number selection"
    )


class RecordCallRequest(BaseModel):
    call_sid: str = Field(..., description="Twilio call SID to record")
    record_from_start: bool = Field(False, description="Record from call start")


class ForwardCallRequest(BaseModel):
    call_sid: str = Field(..., description="Twilio call SID to forward")
    forward_to: str = Field(..., description="Number to forward the call to")


class ConferenceCallRequest(BaseModel):
    conference_name: str = Field(..., description="Name of the conference")
    participants: List[str] = Field(
        ..., description="List of participant phone numbers"
    )
    max_participants: Optional[int] = Field(None, description="Maximum participants")


class ManageNumberRequest(BaseModel):
    action: str = Field(..., description="Action to perform: purchase, release, update")
    number_data: Dict[str, Any] = Field(..., description="Number data for the action")


# Dependency to get current user from JWT token
async def get_current_user(
    token: str = Depends(security), db: Session = Depends(get_db)
) -> User:
    """Extract and validate user from JWT token"""
    try:
        payload = verify_jwt_token(token.credentials)
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")


# Dependency to get communication service
def get_communication_service(db: Session = Depends(get_db)) -> CommunicationService:
    """Get communication service instance"""
    try:
        from main import enhanced_twilio_client

        return create_communication_service(
            db_session=db, twilio_client=enhanced_twilio_client
        )
    except Exception as e:
        raise HTTPException(
            status_code=503, detail="Communication service not available"
        )


# SMS Endpoints
@router.post("/sms/send")
async def send_sms_with_routing(
    request: SendSMSRequest,
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Send SMS with intelligent routing options
    """
    try:
        result = await comm_service.send_sms_with_routing(
            user_id=current_user.id,
            to_number=request.to_number,
            message=request.message,
            from_number=request.from_number,
            use_smart_routing=request.use_smart_routing,
        )

        return {"success": True, "message": "SMS sent successfully", "data": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")


@router.post("/sms/webhook")
async def receive_sms_webhook(
    request: Request,
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Handle incoming SMS webhook from Twilio
    """
    try:
        # Get webhook data from request
        form_data = await request.form()
        webhook_data = dict(form_data)

        # Process the webhook
        result = await comm_service.receive_sms_webhook(webhook_data)

        return {
            "success": True,
            "message": "SMS webhook processed successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process SMS webhook: {str(e)}"
        )


# Voice Call Endpoints
@router.post("/voice/call")
async def make_voice_call_with_routing(
    request: MakeCallRequest,
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Make voice call with intelligent routing
    """
    try:
        result = await comm_service.make_voice_call_with_routing(
            user_id=current_user.id,
            to_number=request.to_number,
            from_number=request.from_number,
            twiml_url=request.twiml_url,
            use_smart_routing=request.use_smart_routing,
        )

        return {
            "success": True,
            "message": "Voice call initiated successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to make voice call: {str(e)}"
        )


@router.post("/voice/webhook")
async def receive_voice_call_webhook(
    request: Request,
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Handle incoming voice call webhook from Twilio
    """
    try:
        # Get webhook data from request
        form_data = await request.form()
        webhook_data = dict(form_data)

        # Process the webhook
        result = await comm_service.receive_voice_call_webhook(webhook_data)

        return {
            "success": True,
            "message": "Voice call webhook processed successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process voice call webhook: {str(e)}"
        )


# Call Recording and Forwarding Endpoints
@router.post("/voice/record")
async def record_call(
    request: RecordCallRequest,
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Start recording a call
    """
    try:
        result = await comm_service.record_call(
            user_id=current_user.id,
            call_sid=request.call_sid,
            recording_options={"record_from_start": request.record_from_start},
        )

        return {
            "success": True,
            "message": "Call recording started successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to start call recording: {str(e)}"
        )


@router.post("/voice/forward")
async def forward_call(
    request: ForwardCallRequest,
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Forward a call to another number
    """
    try:
        result = await comm_service.forward_call(
            user_id=current_user.id,
            call_sid=request.call_sid,
            forward_to=request.forward_to,
        )

        return {
            "success": True,
            "message": "Call forwarded successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to forward call: {str(e)}")


@router.post("/voice/conference")
async def create_conference_call(
    request: ConferenceCallRequest,
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Create a conference call with multiple participants
    """
    try:
        result = await comm_service.create_conference_call(
            user_id=current_user.id,
            conference_name=request.conference_name,
            participants=request.participants,
            conference_options={"max_participants": request.max_participants},
        )

        return {
            "success": True,
            "message": "Conference call created successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create conference call: {str(e)}"
        )


# History Management Endpoints
@router.get("/history/conversations")
async def get_conversation_history(
    conversation_id: Optional[str] = Query(
        None, description="Specific conversation ID"
    ),
    external_number: Optional[str] = Query(
        None, description="External number to filter by"
    ),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of messages"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Get conversation history for the authenticated user
    """
    try:
        result = await comm_service.get_conversation_history(
            user_id=current_user.id,
            conversation_id=conversation_id,
            external_number=external_number,
            limit=limit,
            offset=offset,
        )

        return {"success": True, "data": result}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get conversation history: {str(e)}"
        )


@router.get("/history/calls")
async def get_call_history(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of calls"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Get call history for the authenticated user
    """
    try:
        result = await comm_service.get_call_history(
            user_id=current_user.id, limit=limit, offset=offset
        )

        return {"success": True, "data": result}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get call history: {str(e)}"
        )


# User Number Management Dashboard
@router.get("/dashboard")
async def get_user_number_dashboard(
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Get comprehensive user number management dashboard
    """
    try:
        dashboard = await comm_service.get_user_number_dashboard(
            user_id=current_user.id
        )

        return {"success": True, "data": dashboard}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get user dashboard: {str(e)}"
        )


@router.post("/numbers/manage")
async def manage_user_number(
    request: ManageNumberRequest,
    current_user: User = Depends(get_current_user),
    comm_service: CommunicationService = Depends(get_communication_service),
):
    """
    Manage user phone numbers (purchase, release, update)
    """
    try:
        if request.action not in ["purchase", "release", "update"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid action. Must be: purchase, release, or update",
            )

        result = await comm_service.manage_user_number(
            user_id=current_user.id,
            action=request.action,
            number_data=request.number_data,
        )

        return {
            "success": True,
            "message": f"Number {request.action} completed successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to manage number: {str(e)}"
        )


@router.get("/health")
async def communication_health_check():
    """
    Health check endpoint for communication service
    """
    try:
        # Test service creation
        from core.database import get_db

        db = next(get_db())

        comm_service = get_communication_service(db)

        return {
            "status": "healthy",
            "service": "communication_service",
            "components": {
                "twilio_client": comm_service.twilio_client is not None,
                "routing_engine": comm_service.routing_engine is not None,
                "notification_service": True,
                "database": True,
            },
            "features": [
                "SMS sending with smart routing",
                "Voice calling with intelligent routing",
                "Call recording and forwarding",
                "Conversation and call history management",
                "User number management dashboard",
                "Conference calling capabilities",
            ],
            "timestamp": "2024-01-01T00:00:00Z",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "communication_service",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z",
        }

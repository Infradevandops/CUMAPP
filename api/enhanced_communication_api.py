#!/usr/bin/env python3
"""
Enhanced Communication API Endpoints
Provides advanced SMS, voice, and number management capabilities using Enhanced Twilio Client
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from core.database import get_db
from auth.jwt_handler import verify_jwt_token
from models.user_models import User
from enhanced_twilio_client import EnhancedTwilioClient

# Initialize router and security
router = APIRouter(
    prefix="/api/enhanced-communication", tags=["enhanced-communication"]
)
security = HTTPBearer()


# Pydantic models for request/response
class SendSMSRequest(BaseModel):
    from_number: str = Field(..., description="Sender phone number")
    to_number: str = Field(..., description="Recipient phone number")
    message: str = Field(..., description="Message content")


class MakeCallRequest(BaseModel):
    from_number: str = Field(..., description="Caller phone number")
    to_number: str = Field(..., description="Recipient phone number")
    twiml_url: Optional[str] = Field(
        None, description="TwiML URL for call instructions"
    )


class NumberSearchRequest(BaseModel):
    country_code: str = Field(..., description="ISO country code (e.g., 'US', 'GB')")
    area_code: Optional[str] = Field(None, description="Area code for local numbers")
    limit: int = Field(20, ge=1, le=50, description="Maximum number of results")
    sms_enabled: bool = Field(True, description="Require SMS capability")
    voice_enabled: bool = Field(True, description="Require voice capability")


class PurchaseNumberRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number to purchase")
    friendly_name: Optional[str] = Field(
        None, description="Friendly name for the number"
    )
    voice_url: Optional[str] = Field(None, description="Webhook URL for voice calls")
    sms_url: Optional[str] = Field(None, description="Webhook URL for SMS")


class RecordCallRequest(BaseModel):
    call_sid: str = Field(..., description="Call SID to record")
    record_from_start: bool = Field(False, description="Record from call start")


class ForwardCallRequest(BaseModel):
    call_sid: str = Field(..., description="Call SID to forward")
    forward_to: str = Field(..., description="Number to forward to")


class ConferenceRequest(BaseModel):
    conference_name: str = Field(..., description="Name of the conference")
    max_participants: Optional[int] = Field(None, description="Maximum participants")


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


# Dependency to get enhanced Twilio client
def get_enhanced_twilio_client() -> EnhancedTwilioClient:
    """Get enhanced Twilio client instance"""
    from main import enhanced_twilio_client

    if not enhanced_twilio_client:
        raise HTTPException(
            status_code=503, detail="Enhanced Twilio service not available"
        )
    return enhanced_twilio_client


# SMS Endpoints
@router.post("/sms/send")
async def send_enhanced_sms(
    request: SendSMSRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Send SMS using enhanced Twilio client with advanced features
    """
    try:
        result = await twilio_client.send_sms(
            from_number=request.from_number,
            to_number=request.to_number,
            message=request.message,
        )

        return {"success": True, "message": "SMS sent successfully", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")


@router.post("/sms/webhook")
async def receive_sms_webhook(
    request: Request,
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Handle incoming SMS webhook from Twilio
    """
    try:
        # Get webhook data from request
        form_data = await request.form()
        webhook_data = dict(form_data)

        # Process the webhook
        processed_data = await twilio_client.receive_sms_webhook(webhook_data)

        # Here you would typically save to database, trigger notifications, etc.

        return {
            "success": True,
            "message": "SMS webhook processed successfully",
            "data": processed_data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process SMS webhook: {str(e)}"
        )


# Voice Call Endpoints
@router.post("/voice/call")
async def make_voice_call(
    request: MakeCallRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Make an outbound voice call with enhanced features
    """
    try:
        result = await twilio_client.make_call(
            from_number=request.from_number,
            to_number=request.to_number,
            twiml_url=request.twiml_url,
        )

        return {
            "success": True,
            "message": "Call initiated successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to make call: {str(e)}")


@router.post("/voice/webhook")
async def receive_call_webhook(
    request: Request,
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Handle incoming voice call webhook from Twilio
    """
    try:
        # Get webhook data from request
        form_data = await request.form()
        webhook_data = dict(form_data)

        # Process the webhook
        processed_data = await twilio_client.receive_call_webhook(webhook_data)

        # Here you would typically save to database, trigger notifications, etc.

        return {
            "success": True,
            "message": "Call webhook processed successfully",
            "data": processed_data,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process call webhook: {str(e)}"
        )


@router.post("/voice/record")
async def record_call(
    request: RecordCallRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Start recording a call
    """
    try:
        result = await twilio_client.record_call(
            call_sid=request.call_sid, record_from_start=request.record_from_start
        )

        return {
            "success": True,
            "message": "Call recording started successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to start call recording: {str(e)}"
        )


@router.post("/voice/forward")
async def forward_call(
    request: ForwardCallRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Forward a call to another number
    """
    try:
        result = await twilio_client.forward_call(
            call_sid=request.call_sid, forward_to=request.forward_to
        )

        return {
            "success": True,
            "message": "Call forwarded successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to forward call: {str(e)}")


@router.post("/voice/conference")
async def create_conference(
    request: ConferenceRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Create a conference call
    """
    try:
        result = await twilio_client.create_conference(
            conference_name=request.conference_name,
            max_participants=request.max_participants,
        )

        return {
            "success": True,
            "message": "Conference created successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create conference: {str(e)}"
        )


# Phone Number Management Endpoints
@router.post("/numbers/search")
async def search_available_numbers(
    request: NumberSearchRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Search for available phone numbers with advanced filtering
    """
    try:
        results = await twilio_client.search_available_numbers(
            country_code=request.country_code,
            area_code=request.area_code,
            limit=request.limit,
            sms_enabled=request.sms_enabled,
            voice_enabled=request.voice_enabled,
        )

        return {
            "success": True,
            "message": f"Found {len(results)} available numbers",
            "data": {
                "numbers": results,
                "count": len(results),
                "search_criteria": {
                    "country_code": request.country_code,
                    "area_code": request.area_code,
                    "limit": request.limit,
                },
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to search numbers: {str(e)}"
        )


@router.post("/numbers/purchase")
async def purchase_phone_number(
    request: PurchaseNumberRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Purchase a phone number with enhanced configuration
    """
    try:
        result = await twilio_client.purchase_number(
            phone_number=request.phone_number,
            friendly_name=request.friendly_name,
            voice_url=request.voice_url,
            sms_url=request.sms_url,
        )

        return {
            "success": True,
            "message": "Phone number purchased successfully",
            "data": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to purchase number: {str(e)}"
        )


@router.get("/numbers/owned")
async def list_owned_numbers(
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    List all owned phone numbers with detailed information
    """
    try:
        results = await twilio_client.list_owned_numbers()

        return {
            "success": True,
            "message": f"Retrieved {len(results)} owned numbers",
            "data": {"numbers": results, "count": len(results)},
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to list owned numbers: {str(e)}"
        )


@router.delete("/numbers/{number_sid}")
async def release_phone_number(
    number_sid: str = Path(..., description="Phone number SID to release"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Release (delete) a purchased phone number
    """
    try:
        success = await twilio_client.release_number(number_sid)

        if success:
            return {"success": True, "message": "Phone number released successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to release number")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to release number: {str(e)}"
        )


# Utility Endpoints
@router.get("/numbers/info/{phone_number}")
async def get_number_info(
    phone_number: str = Path(..., description="Phone number to analyze"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Get detailed information about a phone number
    """
    try:
        info = twilio_client.get_number_info(phone_number)

        return {
            "success": True,
            "message": "Number information retrieved successfully",
            "data": info,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get number info: {str(e)}"
        )


@router.get("/account/balance")
async def get_account_balance(
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_enhanced_twilio_client),
):
    """
    Get Twilio account balance and information
    """
    try:
        balance_info = await twilio_client.get_account_balance()

        return {
            "success": True,
            "message": "Account balance retrieved successfully",
            "data": balance_info,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get account balance: {str(e)}"
        )

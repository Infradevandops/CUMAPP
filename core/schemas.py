#!/usr/bin/env python3
"""
Pydantic schemas for the FastAPI application.
"""
from pydantic import BaseModel
from typing import List, Dict, Optional


class VerificationRequest(BaseModel):
    service_name: str
    capability: str = "sms"


class VerificationResponse(BaseModel):
    verification_id: str
    status: str
    message: str


class SMSRequest(BaseModel):
    to_number: str
    message: str
    from_number: Optional[str] = None


class AIRequest(BaseModel):
    conversation_history: List[Dict[str, str]]
    context: Optional[str] = None

#!/usr/bin/env python3
"""
Pydantic schemas for the FastAPI application.
"""
from typing import Dict, List, Optional

from pydantic import BaseModel


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

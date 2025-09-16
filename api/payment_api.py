#!/usr/bin/env python3
"""
Payment API endpoints for real payment processing
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.real_payment_service import real_payment_service

logger = logging.getLogger(__name__)

router = APIRouter()


class PaymentRequest(BaseModel):
    amount: float
    currency: str = "usd"
    payment_method: str = "card"


class CustomerRequest(BaseModel):
    email: str
    name: Optional[str] = None


@router.post("/create-payment-intent")
async def create_payment_intent(payment: PaymentRequest):
    """Create payment intent for adding credits"""
    try:
        result = await real_payment_service.create_payment_intent(
            amount=payment.amount, currency=payment.currency
        )
        return result
    except Exception as e:
        logger.error(f"Payment intent creation failed: {e}")
        raise HTTPException(status_code=500, detail="Payment processing failed")


@router.post("/confirm-payment/{payment_intent_id}")
async def confirm_payment(payment_intent_id: str):
    """Confirm payment completion"""
    try:
        result = await real_payment_service.confirm_payment(payment_intent_id)
        return result
    except Exception as e:
        logger.error(f"Payment confirmation failed: {e}")
        raise HTTPException(status_code=500, detail="Payment confirmation failed")


@router.post("/add-credits")
async def add_credits(payment: PaymentRequest):
    """Add credits to user account"""
    try:
        result = await real_payment_service.add_credits(
            user_id="demo_user",  # In real app, get from auth
            amount=payment.amount,
            payment_method=payment.payment_method,
        )
        return result
    except Exception as e:
        logger.error(f"Add credits failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to add credits")


@router.get("/history")
async def get_payment_history():
    """Get user payment history"""
    try:
        history = await real_payment_service.get_payment_history("demo_user")
        return {"transactions": history}
    except Exception as e:
        logger.error(f"Payment history fetch failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment history")

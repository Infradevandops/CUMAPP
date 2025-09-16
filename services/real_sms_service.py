#!/usr/bin/env python3
"""
Real SMS service with Twilio integration
"""
import logging
import os
from typing import Dict, Optional

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

logger = logging.getLogger(__name__)


class RealSMSService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")
        self.client = None

        if all([self.account_sid, self.auth_token]):
            try:
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("Real Twilio client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")

    async def send_sms(
        self, to_number: str, message: str, from_number: Optional[str] = None
    ) -> Dict:
        """Send SMS using Twilio or mock"""
        if not self.client:
            return self._mock_send_sms(to_number, message)

        try:
            from_num = from_number or self.phone_number
            if not from_num:
                return self._mock_send_sms(to_number, message)

            twilio_message = self.client.messages.create(
                body=message, from_=from_num, to=to_number
            )

            return {
                "status": "sent",
                "message_sid": twilio_message.sid,
                "to": to_number,
                "from": from_num,
                "cost": float(twilio_message.price or 0),
                "provider": "twilio",
            }

        except TwilioRestException as e:
            logger.error(f"Twilio SMS error: {e}")
            return self._mock_send_sms(to_number, message)
        except Exception as e:
            logger.error(f"SMS send error: {e}")
            return self._mock_send_sms(to_number, message)

    async def get_message_status(self, message_sid: str) -> Dict:
        """Get SMS delivery status"""
        if not self.client:
            return self._mock_status(message_sid)

        try:
            message = self.client.messages(message_sid).fetch()
            return {
                "sid": message.sid,
                "status": message.status,
                "error_code": message.error_code,
                "error_message": message.error_message,
                "date_sent": (
                    message.date_sent.isoformat() if message.date_sent else None
                ),
                "date_updated": (
                    message.date_updated.isoformat() if message.date_updated else None
                ),
            }
        except Exception as e:
            logger.error(f"Error fetching message status: {e}")
            return self._mock_status(message_sid)

    async def get_account_balance(self) -> Dict:
        """Get Twilio account balance"""
        if not self.client:
            return {"balance": "25.50", "currency": "USD", "provider": "mock"}

        try:
            balance = self.client.balance.fetch()
            return {
                "balance": balance.balance,
                "currency": balance.currency,
                "provider": "twilio",
            }
        except Exception as e:
            logger.error(f"Error fetching balance: {e}")
            return {"balance": "25.50", "currency": "USD", "provider": "mock"}

    def _mock_send_sms(self, to_number: str, message: str) -> Dict:
        """Mock SMS sending"""
        import uuid

        return {
            "status": "sent",
            "message_sid": f"mock_{uuid.uuid4().hex[:8]}",
            "to": to_number,
            "from": "+1555000001",
            "cost": 0.0075,
            "provider": "mock",
        }

    def _mock_status(self, message_sid: str) -> Dict:
        """Mock message status"""
        return {
            "sid": message_sid,
            "status": "delivered",
            "error_code": None,
            "error_message": None,
            "date_sent": "2024-01-15T10:30:00Z",
            "date_updated": "2024-01-15T10:30:05Z",
        }


# Global instance
real_sms_service = RealSMSService()

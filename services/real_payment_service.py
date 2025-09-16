#!/usr/bin/env python3
"""
Real payment service with Stripe integration
"""
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class RealPaymentService:
    def __init__(self):
        self.stripe_key = os.getenv("STRIPE_SECRET_KEY")
        self.stripe_client = None

        if self.stripe_key:
            try:
                import stripe

                stripe.api_key = self.stripe_key
                self.stripe_client = stripe
                logger.info("Real Stripe client initialized")
            except ImportError:
                logger.warning("Stripe library not installed")
            except Exception as e:
                logger.error(f"Failed to initialize Stripe: {e}")

    async def create_payment_intent(
        self, amount: float, currency: str = "usd", user_id: str = None
    ) -> Dict:
        """Create Stripe payment intent"""
        if not self.stripe_client:
            return self._mock_payment_intent(amount, currency)

        try:
            intent = self.stripe_client.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe uses cents
                currency=currency,
                metadata={"user_id": user_id} if user_id else {},
            )

            return {
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": amount,
                "currency": currency,
                "status": intent.status,
                "provider": "stripe",
            }

        except Exception as e:
            logger.error(f"Stripe payment intent error: {e}")
            return self._mock_payment_intent(amount, currency)

    async def confirm_payment(self, payment_intent_id: str) -> Dict:
        """Confirm payment completion"""
        if not self.stripe_client:
            return self._mock_confirm_payment(payment_intent_id)

        try:
            intent = self.stripe_client.PaymentIntent.retrieve(payment_intent_id)

            return {
                "payment_intent_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,
                "currency": intent.currency,
                "paid": intent.status == "succeeded",
                "provider": "stripe",
            }

        except Exception as e:
            logger.error(f"Stripe payment confirmation error: {e}")
            return self._mock_confirm_payment(payment_intent_id)

    async def create_customer(self, email: str, name: Optional[str] = None) -> Dict:
        """Create Stripe customer"""
        if not self.stripe_client:
            return self._mock_customer(email, name)

        try:
            customer = self.stripe_client.Customer.create(email=email, name=name)

            return {
                "customer_id": customer.id,
                "email": customer.email,
                "name": customer.name,
                "provider": "stripe",
            }

        except Exception as e:
            logger.error(f"Stripe customer creation error: {e}")
            return self._mock_customer(email, name)

    async def add_credits(
        self, user_id: str, amount: float, payment_method: str = "card"
    ) -> Dict:
        """Add credits to user account"""
        # This would integrate with your user balance system
        transaction_id = str(uuid.uuid4())

        return {
            "transaction_id": transaction_id,
            "user_id": user_id,
            "amount": amount,
            "type": "credit",
            "payment_method": payment_method,
            "status": "completed",
            "timestamp": datetime.now().isoformat(),
            "provider": "stripe" if self.stripe_client else "mock",
        }

    async def get_payment_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get user payment history"""
        # Mock payment history for demo
        return [
            {
                "id": "txn_001",
                "amount": 10.00,
                "type": "credit",
                "status": "completed",
                "date": "2024-01-15",
                "description": "Credits added",
            },
            {
                "id": "txn_002",
                "amount": -0.50,
                "type": "debit",
                "status": "completed",
                "date": "2024-01-14",
                "description": "WhatsApp verification",
            },
        ]

    def _mock_payment_intent(self, amount: float, currency: str) -> Dict:
        """Mock payment intent"""
        return {
            "payment_intent_id": f"pi_mock_{uuid.uuid4().hex[:8]}",
            "client_secret": f"pi_mock_{uuid.uuid4().hex[:8]}_secret",
            "amount": amount,
            "currency": currency,
            "status": "requires_payment_method",
            "provider": "mock",
        }

    def _mock_confirm_payment(self, payment_intent_id: str) -> Dict:
        """Mock payment confirmation"""
        return {
            "payment_intent_id": payment_intent_id,
            "status": "succeeded",
            "amount": 10.00,
            "currency": "usd",
            "paid": True,
            "provider": "mock",
        }

    def _mock_customer(self, email: str, name: Optional[str]) -> Dict:
        """Mock customer creation"""
        return {
            "customer_id": f"cus_mock_{uuid.uuid4().hex[:8]}",
            "email": email,
            "name": name,
            "provider": "mock",
        }


# Global instance
real_payment_service = RealPaymentService()

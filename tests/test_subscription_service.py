#!/usr/bin/env python3
"""
Unit tests for Subscription Service
"""
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta
from decimal import Decimal

from services.subscription_service import (
    SubscriptionService, SubscriptionPlan, BillingCycle, UsageType, create_subscription_service
)
from models.user_models import User


class TestSubscriptionService:
    """Test Subscription Service functionality"""
    
    @pytest.fixture
    def mock_db_session(self):
        """Create mock database session"""
        return Mock()
    
    @pytest.fixture
    def subscription_service(self, mock_db_session):
        """Create Subscription Service instance"""
        return SubscriptionService(db_session=mock_db_session)
    
    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock()
        user.id = "test_user_id"
        user.is_active = True
        user.subscription_plan = "basic"
        user.subscription_expires = datetime.utcnow() + timedelta(days=15)
        user.monthly_sms_used = 25
        user.monthly_voice_minutes_used = 10
        user.monthly_sms_limit = 100
        user.monthly_voice_minutes_limit = 60
        return user
    
    def test_initialization(self, subscription_service):
        """Test service initialization"""
        assert subscription_service is not None
        assert len(subscription_service.subscription_plans) > 0
        assert len(subscription_service.pricing_matrix) > 0
        assert len(subscription_service.usage_limits) > 0
        
        # Check that all required plans exist
        required_plans = ["free", "basic", "premium", "enterprise"]
        for plan in required_plans:
            assert plan in subscription_service.subscription_plans
    
    def test_subscription_plans_structure(self, subscription_service):
        """Test subscription plans data structure"""
        free_plan = subscription_service.subscription_plans["free"]
        
        assert free_plan["name"] == "Free Plan"
        assert isinstance(free_plan["monthly_price"], Decimal)
        assert isinstance(free_plan["features"], list)
        assert isinstance(free_plan["limits"], dict)
        assert isinstance(free_plan["overage_rates"], dict)
        
        # Check required fields in limits
        required_limit_fields = ["sms_monthly", "voice_minutes_monthly", "verifications_monthly", "phone_numbers"]
        for field in required_limit_fields:
            assert field in free_plan["limits"]
    
    def test_pricing_matrix_structure(self, subscription_service):
        """Test pricing matrix structure"""
        pricing = subscription_service.pricing_matrix
        
        assert "sms" in pricing
        assert "voice" in pricing
        assert "phone_numbers" in pricing
        assert "verifications" in pricing
        
        # Check SMS pricing
        assert "domestic" in pricing["sms"]
        assert "international" in pricing["sms"]
        assert isinstance(pricing["sms"]["domestic"], Decimal)
    
    @pytest.mark.asyncio
    async def test_get_subscription_plans(self, subscription_service):
        """Test getting subscription plans"""
        plans = await subscription_service.get_subscription_plans(include_pricing=True)
        
        assert "plans" in plans
        assert "total_plans" in plans
        assert "currency" in plans
        assert plans["total_plans"] == 4  # free, basic, premium, enterprise
        
        # Check free plan structure
        free_plan = plans["plans"]["free"]
        assert free_plan["plan_id"] == "free"
        assert free_plan["name"] == "Free Plan"
        assert "pricing" in free_plan
        assert "features" in free_plan
        assert "limits" in free_plan
    
    @pytest.mark.asyncio
    async def test_get_subscription_plans_no_pricing(self, subscription_service):
        """Test getting subscription plans without pricing"""
        plans = await subscription_service.get_subscription_plans(include_pricing=False)
        
        free_plan = plans["plans"]["free"]
        assert "pricing" not in free_plan
        assert "overage_rates" not in free_plan
        assert "features" in free_plan
        assert "limits" in free_plan
    
    @pytest.mark.asyncio
    async def test_get_user_subscription(self, subscription_service, mock_user):
        """Test getting user subscription details"""
        # Mock database queries
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Mock usage calculation
        subscription_service._calculate_current_usage = AsyncMock(return_value={
            "sms_sent": 25,
            "voice_minutes": 10,
            "verifications": 5,
            "phone_numbers": 2
        })
        
        # Mock cost calculation
        subscription_service._calculate_subscription_costs = AsyncMock(return_value={
            "base_subscription": 9.99,
            "overage_costs": {},
            "total_overage": 0.00,
            "total_cost": 9.99,
            "currency": "USD"
        })
        
        result = await subscription_service.get_user_subscription(user_id="test_user_id")
        
        assert result["user_id"] == "test_user_id"
        assert result["current_plan"]["plan_id"] == "basic"
        assert "billing" in result
        assert "usage" in result
        assert "costs" in result
        assert "limits" in result
    
    @pytest.mark.asyncio
    async def test_purchase_subscription_success(self, subscription_service, mock_user):
        """Test successful subscription purchase"""
        # Mock database queries
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Mock payment processing
        subscription_service._process_payment = AsyncMock(return_value={
            "success": True,
            "payment_id": "pay_123456",
            "amount": 9.99,
            "status": "completed"
        })
        
        # Mock database operations
        subscription_service.db.commit = Mock()
        
        result = await subscription_service.purchase_subscription(
            user_id="test_user_id",
            plan_id="basic",
            billing_cycle="monthly"
        )
        
        assert result["success"] == True
        assert result["subscription"]["plan_id"] == "basic"
        assert result["subscription"]["billing_cycle"] == "monthly"
        assert result["subscription"]["price"] == 9.99
        
        subscription_service._process_payment.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_purchase_subscription_invalid_plan(self, subscription_service, mock_user):
        """Test subscription purchase with invalid plan"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with pytest.raises(ValueError, match="Invalid subscription plan"):
            await subscription_service.purchase_subscription(
                user_id="test_user_id",
                plan_id="invalid_plan"
            )
    
    @pytest.mark.asyncio
    async def test_purchase_subscription_payment_failed(self, subscription_service, mock_user):
        """Test subscription purchase with payment failure"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Mock failed payment
        subscription_service._process_payment = AsyncMock(return_value={
            "success": False,
            "error": "Payment declined"
        })
        
        with pytest.raises(Exception, match="Payment failed"):
            await subscription_service.purchase_subscription(
                user_id="test_user_id",
                plan_id="basic"
            )
    
    @pytest.mark.asyncio
    async def test_renew_subscription_success(self, subscription_service, mock_user):
        """Test successful subscription renewal"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Mock successful payment
        subscription_service._process_payment = AsyncMock(return_value={
            "success": True,
            "payment_id": "pay_renewal_123",
            "amount": 9.99
        })
        
        subscription_service.db.commit = Mock()
        
        result = await subscription_service.renew_subscription(
            user_id="test_user_id",
            auto_renew=False
        )
        
        assert result["success"] == True
        assert result["plan"] == "basic"
        assert "next_billing_date" in result
        
        subscription_service._process_payment.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_renew_subscription_free_plan(self, subscription_service, mock_user):
        """Test renewal attempt for free plan user"""
        mock_user.subscription_plan = "free"
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        with pytest.raises(ValueError, match="Free plan users don't need renewal"):
            await subscription_service.renew_subscription(user_id="test_user_id")
    
    @pytest.mark.asyncio
    async def test_cancel_subscription_immediate(self, subscription_service, mock_user):
        """Test immediate subscription cancellation"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        subscription_service.db.commit = Mock()
        
        result = await subscription_service.cancel_subscription(
            user_id="test_user_id",
            immediate=True,
            reason="User request"
        )
        
        assert result["success"] == True
        assert result["cancelled_plan"] == "basic"
        assert result["immediate"] == True
        assert result["reason"] == "User request"
    
    @pytest.mark.asyncio
    async def test_cancel_subscription_end_of_period(self, subscription_service, mock_user):
        """Test subscription cancellation at end of billing period"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        subscription_service.db.commit = Mock()
        
        result = await subscription_service.cancel_subscription(
            user_id="test_user_id",
            immediate=False,
            reason="Cost concerns"
        )
        
        assert result["success"] == True
        assert result["immediate"] == False
        assert "cancellation_date" in result
    
    @pytest.mark.asyncio
    async def test_track_usage_sms(self, subscription_service, mock_user):
        """Test SMS usage tracking"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        subscription_service.db.commit = Mock()
        
        result = await subscription_service.track_usage(
            user_id="test_user_id",
            usage_type="sms_sent",
            amount=5
        )
        
        assert result["usage_type"] == "sms_sent"
        assert result["amount"] == 5
        assert result["current_usage"] == 30  # 25 + 5
        assert result["limit"] == 100
        assert result["plan"] == "basic"
        assert "limit_status" in result
    
    @pytest.mark.asyncio
    async def test_track_usage_over_limit(self, subscription_service, mock_user):
        """Test usage tracking when over limit"""
        # Set user close to limit
        mock_user.monthly_sms_used = 95
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        subscription_service.db.commit = Mock()
        
        result = await subscription_service.track_usage(
            user_id="test_user_id",
            usage_type="sms_sent",
            amount=10  # This will put user over limit
        )
        
        assert result["current_usage"] == 105
        assert result["limit"] == 100
        assert result["limit_status"]["over_limit"] == True
        assert result["overage_cost"] > 0  # Should have overage charges
    
    @pytest.mark.asyncio
    async def test_get_billing_history(self, subscription_service, mock_user):
        """Test getting billing history"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        result = await subscription_service.get_billing_history(
            user_id="test_user_id",
            limit=12
        )
        
        assert result["user_id"] == "test_user_id"
        assert "billing_history" in result
        assert "total_records" in result
        assert "total_amount" in result
        assert result["currency"] == "USD"
        
        # Should have some billing records
        assert len(result["billing_history"]) > 0
    
    @pytest.mark.asyncio
    async def test_get_usage_analytics(self, subscription_service, mock_user):
        """Test getting usage analytics"""
        subscription_service.db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Mock database queries for usage counts
        subscription_service.db.query.return_value.filter.return_value.count.return_value = 10
        
        result = await subscription_service.get_usage_analytics(
            user_id="test_user_id",
            period_days=30
        )
        
        assert result["user_id"] == "test_user_id"
        assert "period" in result
        assert "current_plan" in result
        assert "usage" in result
        assert "costs" in result
        assert "limits" in result
        assert "utilization" in result
        assert "recommendations" in result
        
        # Check period information
        assert result["period"]["days"] == 30
    
    def test_check_usage_limits_within_limit(self, subscription_service):
        """Test usage limit checking when within limits"""
        result = subscription_service._check_usage_limits(
            current_usage=50,
            limit=100,
            plan="basic"
        )
        
        assert result["within_limit"] == True
        assert result["over_limit"] == False
        assert result["usage_percentage"] == 50.0
        assert result["remaining"] == 50
    
    def test_check_usage_limits_over_limit(self, subscription_service):
        """Test usage limit checking when over limits"""
        result = subscription_service._check_usage_limits(
            current_usage=120,
            limit=100,
            plan="basic"
        )
        
        assert result["within_limit"] == False
        assert result["over_limit"] == True
        assert result["usage_percentage"] == 120.0
        assert result["remaining"] == 0
    
    def test_check_usage_limits_unlimited(self, subscription_service):
        """Test usage limit checking for unlimited plan"""
        result = subscription_service._check_usage_limits(
            current_usage=1000,
            limit=-1,  # Unlimited
            plan="enterprise"
        )
        
        assert result["within_limit"] == True
        assert result["over_limit"] == False
        assert result["usage_percentage"] == 0
        assert result["remaining"] == -1
    
    @pytest.mark.asyncio
    async def test_process_payment_success(self, subscription_service):
        """Test successful payment processing"""
        with patch('random.random', return_value=0.1):  # Ensure success (> 0.05)
            result = await subscription_service._process_payment(
                user_id="test_user_id",
                amount=Decimal("9.99"),
                description="Test payment"
            )
            
            assert result["success"] == True
            assert result["amount"] == 9.99
            assert result["currency"] == "USD"
            assert "payment_id" in result
    
    @pytest.mark.asyncio
    async def test_process_payment_failure(self, subscription_service):
        """Test failed payment processing"""
        with patch('random.random', return_value=0.01):  # Ensure failure (< 0.05)
            result = await subscription_service._process_payment(
                user_id="test_user_id",
                amount=Decimal("9.99"),
                description="Test payment"
            )
            
            assert result["success"] == False
            assert "error" in result
            assert "error_code" in result
    
    @pytest.mark.asyncio
    async def test_process_payment_free(self, subscription_service):
        """Test payment processing for free amount"""
        result = await subscription_service._process_payment(
            user_id="test_user_id",
            amount=Decimal("0.00"),
            description="Free plan"
        )
        
        assert result["success"] == True
        assert result["payment_id"] == "free"
        assert result["amount"] == 0
    
    def test_generate_usage_recommendations_high_usage(self, subscription_service):
        """Test usage recommendations for high usage"""
        utilization = {"sms": 85.0, "voice": 70.0, "verifications": 60.0}
        
        recommendations = subscription_service._generate_usage_recommendations(
            current_plan="basic",
            utilization=utilization,
            total_cost=Decimal("15.00")
        )
        
        assert len(recommendations) > 0
        # Should recommend upgrade due to high SMS usage
        upgrade_rec = next((rec for rec in recommendations if "upgrade" in rec.lower()), None)
        assert upgrade_rec is not None
    
    def test_generate_usage_recommendations_low_usage(self, subscription_service):
        """Test usage recommendations for low usage"""
        utilization = {"sms": 20.0, "voice": 15.0, "verifications": 10.0}
        
        recommendations = subscription_service._generate_usage_recommendations(
            current_plan="premium",
            utilization=utilization,
            total_cost=Decimal("5.00")
        )
        
        assert len(recommendations) > 0
        # Should recommend downgrade due to low usage
        downgrade_rec = next((rec for rec in recommendations if "downgrade" in rec.lower()), None)
        assert downgrade_rec is not None
    
    def test_get_subscription_status_active(self, subscription_service):
        """Test subscription status for active subscription"""
        mock_user = Mock()
        mock_user.subscription_plan = "basic"
        mock_user.subscription_expires = datetime.utcnow() + timedelta(days=15)
        
        status = subscription_service._get_subscription_status(mock_user)
        assert status == "active"
    
    def test_get_subscription_status_expiring_soon(self, subscription_service):
        """Test subscription status for expiring soon"""
        mock_user = Mock()
        mock_user.subscription_plan = "basic"
        mock_user.subscription_expires = datetime.utcnow() + timedelta(days=3)
        
        status = subscription_service._get_subscription_status(mock_user)
        assert status == "expiring_soon"
    
    def test_get_subscription_status_expired(self, subscription_service):
        """Test subscription status for expired subscription"""
        mock_user = Mock()
        mock_user.subscription_plan = "basic"
        mock_user.subscription_expires = datetime.utcnow() - timedelta(days=1)
        
        status = subscription_service._get_subscription_status(mock_user)
        assert status == "expired"
    
    def test_get_subscription_status_free(self, subscription_service):
        """Test subscription status for free plan"""
        mock_user = Mock()
        mock_user.subscription_plan = "free"
        mock_user.subscription_expires = None
        
        status = subscription_service._get_subscription_status(mock_user)
        assert status == "free"


class TestSubscriptionServiceFactory:
    """Test Subscription Service factory function"""
    
    def test_create_subscription_service_success(self):
        """Test successful service creation"""
        mock_db_session = Mock()
        
        with patch('services.subscription_service.SubscriptionService') as mock_service:
            result = create_subscription_service(db_session=mock_db_session)
            
            mock_service.assert_called_once_with(mock_db_session)
            assert result is not None
    
    def test_create_subscription_service_exception(self):
        """Test service creation with exception"""
        mock_db_session = Mock()
        
        with patch('services.subscription_service.SubscriptionService', 
                  side_effect=Exception("Test error")):
            with pytest.raises(Exception, match="Test error"):
                create_subscription_service(db_session=mock_db_session)


if __name__ == "__main__":
    pytest.main([__file__])
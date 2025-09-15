#!/usr/bin/env python3
"""
Unit tests for Integrated Verification Service
"""
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

from services.integrated_verification_service import (
    IntegratedVerificationService,
    create_integrated_verification_service,
)
from models.verification_models import VerificationRequest


class TestIntegratedVerificationService:
    """Test Integrated Verification Service functionality"""

    @pytest.fixture
    def mock_db_session(self):
        """Create mock database session"""
        return Mock()

    @pytest.fixture
    def mock_textverified_client(self):
        """Create mock TextVerified client"""
        return Mock()

    @pytest.fixture
    def mock_twilio_client(self):
        """Create mock Enhanced Twilio client"""
        return Mock()

    @pytest.fixture
    def integrated_service(
        self, mock_db_session, mock_textverified_client, mock_twilio_client
    ):
        """Create Integrated Verification Service instance"""
        with patch(
            "services.integrated_verification_service.VerificationService"
        ), patch("services.integrated_verification_service.SmartRoutingEngine"), patch(
            "services.integrated_verification_service.NotificationService"
        ), patch(
            "services.integrated_verification_service.CodeExtractionService"
        ):

            service = IntegratedVerificationService(
                db_session=mock_db_session,
                textverified_client=mock_textverified_client,
                twilio_client=mock_twilio_client,
            )
            return service

    def test_initialization(self, integrated_service):
        """Test service initialization"""
        assert integrated_service is not None
        assert len(integrated_service.supported_services) > 0
        assert len(integrated_service.service_patterns) > 0
        assert "whatsapp" in integrated_service.supported_services
        assert "google" in integrated_service.supported_services

    def test_supported_services_structure(self, integrated_service):
        """Test supported services data structure"""
        whatsapp_config = integrated_service.supported_services["whatsapp"]

        assert whatsapp_config["name"] == "WhatsApp"
        assert whatsapp_config["category"] == "messaging"
        assert whatsapp_config["typical_code_length"] == 6
        assert isinstance(whatsapp_config["code_patterns"], list)
        assert isinstance(whatsapp_config["average_delivery_time"], int)
        assert isinstance(whatsapp_config["success_rate"], float)
        assert whatsapp_config["cost_tier"] in ["standard", "premium"]

    def test_service_patterns_loading(self, integrated_service):
        """Test service patterns loading"""
        patterns = integrated_service.service_patterns

        assert "whatsapp" in patterns
        assert isinstance(patterns["whatsapp"], list)
        assert len(patterns["whatsapp"]) > 0

    @pytest.mark.asyncio
    async def test_create_service_verification_success(self, integrated_service):
        """Test successful service verification creation"""
        # Mock verification service responses
        mock_verification = Mock()
        mock_verification.id = "test_verification_id"
        mock_verification.service_name = "whatsapp"
        mock_verification.status = "pending"
        mock_verification.created_at = datetime.utcnow()
        mock_verification.expires_at = datetime.utcnow() + timedelta(minutes=30)

        integrated_service.verification_service.create_verification = AsyncMock(
            return_value=mock_verification
        )
        integrated_service.verification_service.get_verification_number = AsyncMock(
            return_value="+1234567890"
        )

        # Mock routing engine
        mock_routing_recommendation = Mock()
        mock_routing_recommendation.primary_option = Mock()
        mock_routing_recommendation.primary_option.__dict__ = {"test": "data"}

        if integrated_service.routing_engine:
            integrated_service.routing_engine.suggest_optimal_numbers = AsyncMock(
                return_value=mock_routing_recommendation
            )

        result = await integrated_service.create_service_verification(
            user_id="test_user_id", service_name="whatsapp", capability="sms"
        )

        assert result["verification_id"] == "test_verification_id"
        assert result["service_name"] == "whatsapp"
        assert result["service_display_name"] == "WhatsApp"
        assert result["service_category"] == "messaging"
        assert result["phone_number"] == "+1234567890"
        assert result["capability"] == "sms"
        assert result["status"] == "pending"
        assert "instructions" in result
        assert "monitoring" in result

    @pytest.mark.asyncio
    async def test_create_service_verification_unsupported_service(
        self, integrated_service
    ):
        """Test service verification creation with unsupported service"""
        with pytest.raises(ValueError, match="Service 'unsupported' is not supported"):
            await integrated_service.create_service_verification(
                user_id="test_user_id", service_name="unsupported"
            )

    @pytest.mark.asyncio
    async def test_get_verification_status(self, integrated_service):
        """Test getting verification status"""
        # Mock verification
        mock_verification = Mock()
        mock_verification.id = "test_verification_id"
        mock_verification.service_name = "whatsapp"
        mock_verification.phone_number = "+1234567890"
        mock_verification.status = "pending"
        mock_verification.verification_code = None
        mock_verification.created_at = datetime.utcnow()
        mock_verification.completed_at = None
        mock_verification.expires_at = datetime.utcnow() + timedelta(minutes=30)

        integrated_service.verification_service._get_user_verification = AsyncMock(
            return_value=mock_verification
        )
        integrated_service.verification_service.check_verification_messages = AsyncMock(
            return_value=["Test message"]
        )
        integrated_service.code_extractor.extract_verification_codes = Mock(
            return_value=["123456"]
        )

        result = await integrated_service.get_verification_status(
            user_id="test_user_id", verification_id="test_verification_id"
        )

        assert result["verification_id"] == "test_verification_id"
        assert result["service_name"] == "whatsapp"
        assert result["service_display_name"] == "WhatsApp"
        assert result["phone_number"] == "+1234567890"
        assert result["status"] == "pending"
        assert result["messages_received"] == 1
        assert result["extracted_codes"] == ["123456"]
        assert "progress" in result
        assert "service_info" in result

    @pytest.mark.asyncio
    async def test_cancel_verification(self, integrated_service):
        """Test verification cancellation"""
        # Mock verification service
        integrated_service.verification_service.cancel_verification = AsyncMock(
            return_value=True
        )

        mock_verification = Mock()
        mock_verification.service_name = "whatsapp"
        integrated_service.verification_service._get_user_verification = AsyncMock(
            return_value=mock_verification
        )

        # Mock notification service
        integrated_service.notification_service.send_verification_failed = AsyncMock(
            return_value=True
        )

        result = await integrated_service.cancel_verification(
            user_id="test_user_id",
            verification_id="test_verification_id",
            reason="user_cancelled",
        )

        assert result["verification_id"] == "test_verification_id"
        assert result["status"] == "cancelled"
        assert result["reason"] == "user_cancelled"
        assert result["cleanup_completed"] == True
        assert "cancelled_at" in result

    @pytest.mark.asyncio
    async def test_get_user_verification_history(self, integrated_service):
        """Test getting user verification history"""
        # Mock verification history
        mock_verification1 = Mock()
        mock_verification1.id = "verification_1"
        mock_verification1.service_name = "whatsapp"
        mock_verification1.phone_number = "+1234567890"
        mock_verification1.status = "completed"
        mock_verification1.verification_code = "123456"
        mock_verification1.created_at = datetime.utcnow()
        mock_verification1.completed_at = datetime.utcnow()
        mock_verification1.expires_at = datetime.utcnow() + timedelta(minutes=30)

        mock_verification2 = Mock()
        mock_verification2.id = "verification_2"
        mock_verification2.service_name = "google"
        mock_verification2.phone_number = "+1234567891"
        mock_verification2.status = "pending"
        mock_verification2.verification_code = None
        mock_verification2.created_at = datetime.utcnow()
        mock_verification2.completed_at = None
        mock_verification2.expires_at = datetime.utcnow() + timedelta(minutes=30)

        integrated_service.verification_service.get_verification_history = AsyncMock(
            return_value=[mock_verification1, mock_verification2]
        )

        result = await integrated_service.get_user_verification_history(
            user_id="test_user_id", include_analytics=True
        )

        assert result["user_id"] == "test_user_id"
        assert result["total_verifications"] == 2
        assert len(result["verifications"]) == 2
        assert "analytics" in result

        # Check first verification
        verification1 = result["verifications"][0]
        assert verification1["verification_id"] == "verification_1"
        assert verification1["service_name"] == "whatsapp"
        assert verification1["service_display_name"] == "WhatsApp"
        assert verification1["success"] == True

    @pytest.mark.asyncio
    async def test_get_supported_services(self, integrated_service):
        """Test getting supported services"""
        result = await integrated_service.get_supported_services()

        assert "total_services" in result
        assert "services" in result
        assert "categories" in result
        assert result["total_services"] > 0

        # Check WhatsApp service
        assert "whatsapp" in result["services"]
        whatsapp_info = result["services"]["whatsapp"]
        assert whatsapp_info["name"] == "WhatsApp"
        assert whatsapp_info["category"] == "messaging"

        # Check categories
        assert "messaging" in result["categories"]
        assert isinstance(result["categories"]["messaging"], list)

    @pytest.mark.asyncio
    async def test_get_supported_services_with_category_filter(
        self, integrated_service
    ):
        """Test getting supported services with category filter"""
        result = await integrated_service.get_supported_services(category="messaging")

        # All services should be messaging category
        for service_name, service_info in result["services"].items():
            assert service_info["category"] == "messaging"

        assert result["category_filter"] == "messaging"

    def test_generate_verification_instructions(self, integrated_service):
        """Test verification instructions generation"""
        instructions = integrated_service._generate_verification_instructions(
            service_name="whatsapp", phone_number="+1234567890"
        )

        assert instructions["service"] == "WhatsApp"
        assert instructions["phone_number"] == "+1234567890"
        assert isinstance(instructions["steps"], list)
        assert len(instructions["steps"]) > 0
        assert isinstance(instructions["tips"], list)
        assert "expected_format" in instructions
        assert "estimated_time" in instructions

        # Check that steps mention the service and phone number
        steps_text = " ".join(instructions["steps"])
        assert "WhatsApp" in steps_text
        assert "+1234567890" in steps_text

    def test_get_status_details_completed(self, integrated_service):
        """Test status details for completed verification"""
        mock_verification = Mock()
        mock_verification.status = "completed"

        details = integrated_service._get_status_details(
            verification=mock_verification, elapsed_time=45.0, expected_time=60.0
        )

        assert "completed successfully" in details["message"]
        assert "Use the verification code" in details["next_action"]

    def test_get_status_details_pending(self, integrated_service):
        """Test status details for pending verification"""
        mock_verification = Mock()
        mock_verification.status = "pending"

        details = integrated_service._get_status_details(
            verification=mock_verification, elapsed_time=30.0, expected_time=60.0
        )

        assert "Waiting for SMS code" in details["message"]
        assert "Please wait" in details["next_action"]

    def test_get_status_details_delayed(self, integrated_service):
        """Test status details for delayed verification"""
        mock_verification = Mock()
        mock_verification.status = "pending"

        details = integrated_service._get_status_details(
            verification=mock_verification,
            elapsed_time=150.0,  # More than 2x expected time
            expected_time=60.0,
        )

        assert "Taking longer than expected" in details["message"]
        assert "Consider cancelling" in details["next_action"]

    def test_calculate_duration_completed(self, integrated_service):
        """Test duration calculation for completed verification"""
        mock_verification = Mock()
        mock_verification.created_at = datetime(2024, 1, 1, 12, 0, 0)
        mock_verification.completed_at = datetime(
            2024, 1, 1, 12, 1, 30
        )  # 90 seconds later

        duration = integrated_service._calculate_duration(mock_verification)

        assert duration == 90.0

    def test_calculate_duration_not_completed(self, integrated_service):
        """Test duration calculation for non-completed verification"""
        mock_verification = Mock()
        mock_verification.created_at = datetime(2024, 1, 1, 12, 0, 0)
        mock_verification.completed_at = None

        duration = integrated_service._calculate_duration(mock_verification)

        assert duration is None

    @pytest.mark.asyncio
    async def test_generate_verification_analytics(self, integrated_service):
        """Test verification analytics generation"""
        # Mock verification data
        mock_verification1 = Mock()
        mock_verification1.service_name = "whatsapp"
        mock_verification1.status = "completed"
        mock_verification1.created_at = datetime.utcnow() - timedelta(days=5)
        mock_verification1.completed_at = (
            datetime.utcnow() - timedelta(days=5) + timedelta(seconds=45)
        )

        mock_verification2 = Mock()
        mock_verification2.service_name = "whatsapp"
        mock_verification2.status = "failed"
        mock_verification2.created_at = datetime.utcnow() - timedelta(days=3)
        mock_verification2.completed_at = None

        mock_verification3 = Mock()
        mock_verification3.service_name = "google"
        mock_verification3.status = "completed"
        mock_verification3.created_at = datetime.utcnow() - timedelta(days=1)
        mock_verification3.completed_at = (
            datetime.utcnow() - timedelta(days=1) + timedelta(seconds=30)
        )

        verifications = [mock_verification1, mock_verification2, mock_verification3]

        analytics = await integrated_service._generate_verification_analytics(
            user_id="test_user_id", verifications=verifications
        )

        assert "summary" in analytics
        assert analytics["summary"]["total_verifications"] == 3
        assert analytics["summary"]["completed_verifications"] == 2
        assert analytics["summary"]["success_rate"] == 66.67

        assert "service_usage" in analytics
        assert analytics["service_usage"]["whatsapp"] == 2
        assert analytics["service_usage"]["google"] == 1

        assert "service_success_rates" in analytics
        assert analytics["service_success_rates"]["whatsapp"] == 50.0  # 1 out of 2
        assert analytics["service_success_rates"]["google"] == 100.0  # 1 out of 1

        assert "recommendations" in analytics
        assert isinstance(analytics["recommendations"], list)

    def test_generate_user_recommendations(self, integrated_service):
        """Test user recommendations generation"""
        service_usage = {"whatsapp": 5, "google": 2}
        service_success_rates = {
            "whatsapp": {"total": 5, "rate": 60.0},  # Low success rate
            "google": {"total": 2, "rate": 100.0},
        }
        avg_completion_time = 150.0  # Slow

        recommendations = integrated_service._generate_user_recommendations(
            service_usage, service_success_rates, avg_completion_time
        )

        assert isinstance(recommendations, list)
        assert len(recommendations) > 0

        # Should recommend alternative for WhatsApp due to low success rate
        whatsapp_recommendation = next(
            (rec for rec in recommendations if "whatsapp" in rec.lower()), None
        )
        assert whatsapp_recommendation is not None

        # Should recommend premium for frequently used service
        premium_recommendation = next(
            (rec for rec in recommendations if "premium" in rec.lower()), None
        )
        assert premium_recommendation is not None

        # Should recommend off-peak hours due to slow completion time
        timing_recommendation = next(
            (rec for rec in recommendations if "off-peak" in rec.lower()), None
        )
        assert timing_recommendation is not None


class TestIntegratedVerificationServiceFactory:
    """Test Integrated Verification Service factory function"""

    def test_create_integrated_verification_service_success(self):
        """Test successful service creation"""
        mock_db_session = Mock()
        mock_textverified_client = Mock()
        mock_twilio_client = Mock()

        with patch(
            "services.integrated_verification_service.IntegratedVerificationService"
        ) as mock_service:
            result = create_integrated_verification_service(
                db_session=mock_db_session,
                textverified_client=mock_textverified_client,
                twilio_client=mock_twilio_client,
            )

            mock_service.assert_called_once_with(
                mock_db_session, mock_textverified_client, mock_twilio_client
            )
            assert result is not None

    def test_create_integrated_verification_service_exception(self):
        """Test service creation with exception"""
        mock_db_session = Mock()

        with patch(
            "services.integrated_verification_service.IntegratedVerificationService",
            side_effect=Exception("Test error"),
        ):
            with pytest.raises(Exception, match="Test error"):
                create_integrated_verification_service(db_session=mock_db_session)


if __name__ == "__main__":
    pytest.main([__file__])

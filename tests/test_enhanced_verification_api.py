#!/usr/bin/env python3
"""
Unit tests for Enhanced Verification API endpoints
Tests comprehensive verification management with integrated services
"""
import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from api.enhanced_verification_api import router, get_current_user
from main import app
from services.integrated_verification_service import IntegratedVerificationService
from models.user_models import User


# Global dependency override for authentication
async def async_mock_get_current_user(token=None, db=None):
    user = Mock(spec=User)
    user.id = "user_123"
    user.email = "test@example.com"
    user.is_active = True
    return user


app.dependency_overrides[get_current_user] = async_mock_get_current_user
#!/usr/bin/env python3
"""
Unit tests for Enhanced Verification API endpoints
Tests comprehensive verification management with integrated services
"""
import pytest
import json
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from api.enhanced_verification_api import router, get_current_user
from main import app
from services.integrated_verification_service import IntegratedVerificationService
from models.user_models import User

# Create test app


client = TestClient(app)


class TestEnhancedVerificationAPI:
    """Test suite for Enhanced Verification API endpoints"""

    @pytest.fixture
    def mock_verification_service(self):
        """Create mock integrated verification service"""
        service = Mock(spec=IntegratedVerificationService)
        service.create_service_verification = AsyncMock()
        service.get_user_verification_history = AsyncMock()
        service.get_verification_details = AsyncMock()
        service.get_verification_messages = AsyncMock()
        service.retry_verification = AsyncMock()
        service.cancel_verification = AsyncMock()
        service.get_service_info = Mock()
        return service

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock(spec=User)
        user.id = "user_123"
        user.email = "test@example.com"
        user.is_active = True
        return user

    @pytest.fixture
    def sample_verification(self):
        """Create sample verification object"""
        verification = Mock()
        verification.id = "ver_123"
        verification.user_id = "user_123"
        verification.service_name = "whatsapp"
        verification.phone_number = "+1234567890"
        verification.status = "pending"
        verification.verification_code = None
        verification.created_at = datetime.utcnow()
        verification.updated_at = datetime.utcnow()
        verification.country_code = "US"
        verification.cost_estimate = 0.05
        verification.routing_info = {"provider": "textverified", "country": "US"}
        verification.metadata = {"priority": "normal"}
        return verification

    def test_create_verification_success(
        self, mock_verification_service, mock_user, sample_verification
    ):
        """Test successful verification creation"""
        mock_verification_service.create_service_verification.return_value = {
            "id": "ver_123",
            "service_name": "whatsapp",
            "service_display_name": "WhatsApp",
            "status": "pending",
            "phone_number": "+1234567890",
            "estimated_delivery_time": 30,
            "success_probability": 0.95,
        }
        mock_verification_service.get_service_info.return_value = {
            "display_name": "WhatsApp",
            "average_delivery_time": 30,
            "success_rate": 0.95,
        }
        headers = {"Authorization": "Bearer testtoken"}
        # Use real authentication and service injection here
        response = client.post(
            "/api/verification/create",
            json={
                "service_name": "whatsapp",
                "capability": "sms",
                "country_preference": "US",
                "use_smart_routing": True,
                "priority": "normal",
            },
            headers=headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["service_name"] == "whatsapp"
        assert data["service_display_name"] == "WhatsApp"
        assert data["status"] == "pending"
        assert data["phone_number"] == "+1234567890"
        assert data["estimated_delivery_time"] == 30
        assert data["success_probability"] == 0.95

    def test_create_verification_invalid_service(self):
        """Test verification creation with invalid service name"""
        response = client.post(
            "/api/verification/create",
            json={"service_name": "", "capability": "sms"},  # Empty service name
        )

        assert response.status_code == 422  # Validation error

    def test_create_verification_invalid_priority(self):
        """Test verification creation with invalid priority"""
        response = client.post(
            "/api/verification/create",
            json={
                "service_name": "whatsapp",
                "capability": "sms",
                "priority": "invalid_priority",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_list_verifications_success(
        self, mock_verification_service, mock_user, sample_verification
    ):
        """Test successful verification listing"""
        mock_verification_service.get_user_verification_history.return_value = {
            "verifications": [sample_verification],
            "total_count": 1,
        }
        mock_verification_service.get_service_info.return_value = {
            "display_name": "WhatsApp",
            "average_delivery_time": 30,
            "success_rate": 0.95,
        }
        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get("/api/verification?page=1&page_size=20")
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 1
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert len(data["verifications"]) == 1
        assert data["verifications"][0]["id"] == "ver_123"

    def test_list_verifications_with_filters(
        self, mock_verification_service, mock_user, sample_verification
    ):
        """Test verification listing with filters"""
        mock_verification_service.get_user_verification_history.return_value = {
            "verifications": [sample_verification],
            "total_count": 1,
        }
        mock_verification_service.get_service_info.return_value = {
            "display_name": "WhatsApp",
            "average_delivery_time": 30,
            "success_rate": 0.95,
        }
        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get(
                "/api/verification?service_name=whatsapp&status=pending&country_code=US"
            )
        assert response.status_code == 200
        data = response.json()
        assert "service_name" in data["filters_applied"]
        assert "status" in data["filters_applied"]
        assert "country_code" in data["filters_applied"]

    def test_get_verification_success(
        self, mock_verification_service, mock_user, sample_verification
    ):
        """Test successful verification retrieval"""
        mock_verification_service.get_verification_details.return_value = (
            sample_verification
        )
        mock_verification_service.get_service_info.return_value = {
            "display_name": "WhatsApp",
            "average_delivery_time": 30,
            "success_rate": 0.95,
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/ver_123")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "ver_123"
        assert data["service_name"] == "whatsapp"
        assert data["status"] == "pending"

    def test_get_verification_not_found(self, mock_verification_service, mock_user):
        """Test verification retrieval when not found"""
        mock_verification_service.get_verification_details.side_effect = ValueError(
            "Verification not found"
        )

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/nonexistent")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_get_verification_messages_success(
        self, mock_verification_service, mock_user
    ):
        """Test successful verification messages retrieval"""
        mock_verification_service.get_verification_messages.return_value = {
            "messages": [
                {
                    "content": "Your WhatsApp code is 123456",
                    "timestamp": datetime.utcnow(),
                },
                {"content": "Code: 654321", "timestamp": datetime.utcnow()},
            ],
            "extracted_codes": ["123456", "654321"],
            "auto_completed": True,
            "last_checked": datetime.utcnow(),
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/ver_123/messages")

        assert response.status_code == 200
        data = response.json()
        assert data["verification_id"] == "ver_123"
        assert len(data["messages"]) == 2
        assert len(data["extracted_codes"]) == 2
        assert data["auto_completed"] is True
        assert "123456" in data["extracted_codes"]
        assert "654321" in data["extracted_codes"]

    def test_get_verification_messages_with_force_refresh(
        self, mock_verification_service, mock_user
    ):
        """Test verification messages retrieval with force refresh"""
        mock_verification_service.get_verification_messages.return_value = {
            "messages": [],
            "extracted_codes": [],
            "auto_completed": False,
            "last_checked": datetime.utcnow(),
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get(
                "/api/verification/ver_123/messages?force_refresh=true"
            )

        assert response.status_code == 200
        # Verify that force_refresh was passed to the service
        mock_verification_service.get_verification_messages.assert_called_with(
            user_id=mock_user.id, verification_id="ver_123", force_refresh=True
        )

    def test_retry_verification_success(
        self, mock_verification_service, mock_user, sample_verification
    ):
        """Test successful verification retry"""
        # Update sample verification for retry
        sample_verification.status = "retrying"
        sample_verification.updated_at = datetime.utcnow()

        mock_verification_service.retry_verification.return_value = sample_verification
        mock_verification_service.get_service_info.return_value = {
            "display_name": "WhatsApp",
            "average_delivery_time": 30,
            "success_rate": 0.95,
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.post(
                "/api/verification/ver_123/retry",
                json={"use_different_number": True, "country_preference": "CA"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "ver_123"
        assert data["status"] == "retrying"

    def test_retry_verification_invalid_request(
        self, mock_verification_service, mock_user
    ):
        """Test verification retry with invalid request"""
        mock_verification_service.retry_verification.side_effect = ValueError(
            "Cannot retry completed verification"
        )

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.post(
                "/api/verification/ver_123/retry", json={"use_different_number": False}
            )

        assert response.status_code == 400
        assert "Cannot retry" in response.json()["detail"]

    def test_cancel_verification_success(self, mock_verification_service, mock_user):
        """Test successful verification cancellation"""
        mock_verification_service.cancel_verification.return_value = True

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.delete("/api/verification/ver_123")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Verification cancelled successfully"
        assert data["verification_id"] == "ver_123"
        assert "cancelled_at" in data

    def test_cancel_verification_failure(self, mock_verification_service, mock_user):
        """Test verification cancellation failure"""
        mock_verification_service.cancel_verification.return_value = False

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.delete("/api/verification/ver_123")

        assert response.status_code == 500
        assert "Failed to cancel" in response.json()["detail"]

    def test_create_bulk_verifications_success(
        self, mock_verification_service, mock_user, sample_verification
    ):
        """Test successful bulk verification creation"""
        # Create multiple verification objects
        verification1 = sample_verification
        verification2 = Mock()
        verification2.id = "ver_124"
        verification2.user_id = "user_123"
        verification2.service_name = "google"
        verification2.phone_number = "+1234567891"
        verification2.status = "pending"
        verification2.verification_code = None
        verification2.created_at = datetime.utcnow()
        verification2.updated_at = datetime.utcnow()
        verification2.country_code = "US"
        verification2.cost_estimate = 0.05
        verification2.routing_info = {"provider": "textverified", "country": "US"}
        verification2.metadata = {"priority": "normal"}

        mock_verification_service.create_bulk_verifications.return_value = [
            verification1,
            verification2,
        ]
        mock_verification_service.get_service_info.side_effect = [
            {
                "display_name": "WhatsApp",
                "average_delivery_time": 30,
                "success_rate": 0.95,
            },
            {
                "display_name": "Google",
                "average_delivery_time": 15,
                "success_rate": 0.98,
            },
        ]

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.post(
                "/api/verification/bulk",
                json={
                    "services": ["whatsapp", "google"],
                    "capability": "sms",
                    "country_preference": "US",
                    "use_smart_routing": True,
                    "stagger_delay": 5,
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["service_name"] == "whatsapp"
        assert data[1]["service_name"] == "google"

    def test_create_bulk_verifications_invalid_stagger(self):
        """Test bulk verification creation with invalid stagger delay"""
        response = client.post(
            "/api/verification/bulk",
            json={
                "services": ["whatsapp", "google"],
                "capability": "sms",
                "stagger_delay": 120,  # Exceeds maximum of 60
            },
        )

        assert response.status_code == 422  # Validation error

    def test_get_supported_services_success(self, mock_verification_service):
        """Test successful supported services retrieval"""
        mock_verification_service.get_supported_services.return_value = [
            {
                "name": "whatsapp",
                "display_name": "WhatsApp",
                "category": "messaging",
                "typical_code_length": 6,
                "average_delivery_time": 30,
                "success_rate": 0.95,
                "cost_tier": "standard",
                "supported_countries": ["US", "CA", "GB"],
                "features": ["sms", "voice"],
            },
            {
                "name": "google",
                "display_name": "Google",
                "category": "tech",
                "typical_code_length": 6,
                "average_delivery_time": 15,
                "success_rate": 0.98,
                "cost_tier": "standard",
                "supported_countries": ["US", "CA", "GB", "DE"],
                "features": ["sms"],
            },
        ]

        with patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get("/api/verification/services/supported")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["service_name"] == "whatsapp"
        assert data[0]["display_name"] == "WhatsApp"
        assert data[0]["category"] == "messaging"
        assert data[1]["service_name"] == "google"
        assert data[1]["display_name"] == "Google"
        assert data[1]["category"] == "tech"

    def test_get_supported_services_with_category_filter(
        self, mock_verification_service
    ):
        """Test supported services retrieval with category filter"""
        mock_verification_service.get_supported_services.return_value = [
            {
                "name": "whatsapp",
                "display_name": "WhatsApp",
                "category": "messaging",
                "typical_code_length": 6,
                "average_delivery_time": 30,
                "success_rate": 0.95,
                "cost_tier": "standard",
                "supported_countries": ["US", "CA"],
                "features": ["sms"],
            }
        ]

        with patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get(
                "/api/verification/services/supported?category=messaging"
            )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["category"] == "messaging"

        # Verify that category filter was passed to the service
        mock_verification_service.get_supported_services.assert_called_with(
            category="messaging"
        )

    def test_get_verification_statistics_success(
        self, mock_verification_service, mock_user
    ):
        """Test successful verification statistics retrieval"""
        mock_verification_service.get_verification_analytics.return_value = {
            "period_days": 30,
            "total_verifications": 50,
            "completed_verifications": 45,
            "success_rate": 0.9,
            "average_completion_time": 45.5,
            "status_breakdown": {"completed": 45, "pending": 3, "failed": 2},
            "service_breakdown": {"whatsapp": 25, "google": 15, "telegram": 10},
            "country_breakdown": {"US": 30, "CA": 15, "GB": 5},
            "cost_summary": {"total_cost": 2.50, "average_cost": 0.05},
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/stats/summary?period_days=30")

        assert response.status_code == 200
        data = response.json()
        assert data["period_days"] == 30
        assert data["total_verifications"] == 50
        assert data["completed_verifications"] == 45
        assert data["success_rate"] == 0.9
        assert data["average_completion_time"] == 45.5
        assert "status_breakdown" in data
        assert "service_breakdown" in data
        assert "country_breakdown" in data
        assert "cost_summary" in data

    def test_get_verification_statistics_with_service_filter(
        self, mock_verification_service, mock_user
    ):
        """Test verification statistics with service filter"""
        mock_verification_service.get_verification_analytics.return_value = {
            "period_days": 30,
            "total_verifications": 25,
            "completed_verifications": 24,
            "success_rate": 0.96,
            "status_breakdown": {"completed": 24, "failed": 1},
            "service_breakdown": {"whatsapp": 25},
            "country_breakdown": {"US": 20, "CA": 5},
            "cost_summary": {"total_cost": 1.25, "average_cost": 0.05},
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get(
                "/api/verification/stats/summary?period_days=30&service_name=whatsapp"
            )

        assert response.status_code == 200
        data = response.json()
        assert data["total_verifications"] == 25

        # Verify that service filter was passed
        mock_verification_service.get_verification_analytics.assert_called_with(
            user_id=mock_user.id, period_days=30, service_filter="whatsapp"
        )

    def test_export_verification_data_json(self, mock_verification_service, mock_user):
        """Test verification data export in JSON format"""
        mock_verification_service.export_verification_data.return_value = {
            "format": "json",
            "data": [
                {
                    "id": "ver_123",
                    "service_name": "whatsapp",
                    "status": "completed",
                    "created_at": "2024-01-01T12:00:00Z",
                }
            ],
            "exported_at": datetime.utcnow().isoformat(),
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/export/data?format_type=json")

        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "json"
        assert len(data["data"]) == 1
        assert data["data"][0]["id"] == "ver_123"

    def test_export_verification_data_csv(self, mock_verification_service, mock_user):
        """Test verification data export in CSV format"""
        csv_content = "id,service_name,status,created_at\nver_123,whatsapp,completed,2024-01-01T12:00:00Z"
        mock_verification_service.export_verification_data.return_value = {
            "format": "csv",
            "content": csv_content,
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/export/data?format_type=csv")

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "attachment" in response.headers["content-disposition"]
        assert csv_content in response.text

    def test_export_verification_data_with_filters(
        self, mock_verification_service, mock_user
    ):
        """Test verification data export with filters"""
        mock_verification_service.export_verification_data.return_value = {
            "format": "json",
            "data": [],
            "filters_applied": {"service_name": "whatsapp", "status": "completed"},
        }

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get(
                "/api/verification/export/data?service_name=whatsapp&status=completed"
            )

        assert response.status_code == 200

        # Verify filters were passed to service
        expected_filters = {"service_name": "whatsapp", "status": "completed"}
        mock_verification_service.export_verification_data.assert_called_with(
            user_id=mock_user.id, format_type="json", filters=expected_filters
        )

    def test_health_check_healthy(self, mock_verification_service):
        """Test health check when service is healthy"""
        mock_verification_service.check_service_health.return_value = {
            "overall_healthy": True,
            "components": {
                "textverified": "healthy",
                "twilio": "healthy",
                "database": "healthy",
            },
            "active_verifications": 15,
        }

        with patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get("/api/verification/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "components" in data
        assert data["active_verifications"] == 15

    def test_health_check_degraded(self, mock_verification_service):
        """Test health check when service is degraded"""
        mock_verification_service.check_service_health.return_value = {
            "overall_healthy": False,
            "components": {
                "textverified": "healthy",
                "twilio": "degraded",
                "database": "healthy",
            },
            "active_verifications": 5,
        }

        with patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get("/api/verification/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["components"]["twilio"] == "degraded"

    def test_health_check_error(self, mock_verification_service):
        """Test health check when service throws error"""
        mock_verification_service.check_service_health.side_effect = Exception(
            "Service unavailable"
        )

        with patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):
            response = client.get("/api/verification/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "error" in data

    def test_authentication_required(self):
        """Test that authentication is required for protected endpoints"""
        # Test without authentication token
        response = client.post(
            "/api/verification/create",
            json={"service_name": "whatsapp", "capability": "sms"},
        )

        assert response.status_code == 403  # Forbidden without auth

    def test_invalid_verification_id_format(self, mock_verification_service, mock_user):
        """Test handling of invalid verification ID format"""
        mock_verification_service.get_verification_details.side_effect = ValueError(
            "Invalid verification ID format"
        )

        with patch(
            "api.enhanced_verification_api.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_verification_api.get_verification_service",
            return_value=mock_verification_service,
        ):

            response = client.get("/api/verification/invalid_id_format")

        assert response.status_code == 404


class TestEnhancedVerificationAPIIntegration:
    """Integration tests for Enhanced Verification API"""

    def test_full_verification_workflow(self):
        """Test complete verification workflow"""
        # This would test the full workflow in a real environment
        # For now, we'll test the API structure

        # Test that all endpoints are properly registered
        routes = [route.path for route in app.routes if hasattr(route, "path")]

        expected_routes = [
            "/api/verification/create",
            "/api/verification",
            "/api/verification/{verification_id}",
            "/api/verification/{verification_id}/messages",
            "/api/verification/{verification_id}/retry",
            "/api/verification/bulk",
            "/api/verification/services/supported",
            "/api/verification/stats/summary",
            "/api/verification/export/data",
            "/api/verification/health",
        ]

        for expected_route in expected_routes:
            # Check if route exists (allowing for parameter variations)
            route_exists = any(
                expected_route.replace("{verification_id}", "test") in route
                or expected_route in route
                for route in routes
            )
            assert (
                route_exists
            ), f"Route {expected_route} not found in registered routes"


if __name__ == "__main__":
    # Run integration test
    test_integration = TestEnhancedVerificationAPIIntegration()
    test_integration.test_full_verification_workflow()
    print("Enhanced Verification API integration test completed successfully!")

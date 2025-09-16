#!/usr/bin/env python3
"""
Unit tests for Number Management API endpoints
Tests comprehensive phone number search, purchase, management, and cost optimization
"""
import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.number_management_api import router
from enhanced_twilio_client import EnhancedTwilioClient
from models.user_models import User
from services.smart_routing_engine import SmartRoutingEngine

# Create test app
app = FastAPI()
app.include_router(router)
client = TestClient(app)


class TestNumberManagementAPI:
    """Test suite for Number Management API endpoints"""

    @pytest.fixture
    def mock_twilio_client(self):
        """Create mock Enhanced Twilio client"""
        client = Mock(spec=EnhancedTwilioClient)
        return client

    @pytest.fixture
    def mock_routing_engine(self):
        """Create mock Smart Routing Engine"""
        engine = Mock(spec=SmartRoutingEngine)
        return engine

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock(spec=User)
        user.id = "user_123"
        user.email = "test@example.com"
        user.is_active = True
        return user

    @pytest.fixture
    def sample_available_numbers(self):
        """Create sample available numbers"""
        return [
            {
                "phone_number": "+1234567890",
                "friendly_name": "US Local Number",
                "country_code": "US",
                "area_code": "234",
                "number_type": "local",
                "capabilities": ["sms", "voice"],
                "monthly_cost": 1.00,
                "setup_cost": 0.00,
                "locality": "New York",
                "region": "NY",
                "iso_country": "US",
                "beta": False,
            },
            {
                "phone_number": "+1234567891",
                "friendly_name": "US Local Number",
                "country_code": "US",
                "area_code": "234",
                "number_type": "local",
                "capabilities": ["sms", "voice"],
                "monthly_cost": 1.00,
                "setup_cost": 0.00,
                "locality": "New York",
                "region": "NY",
                "iso_country": "US",
                "beta": False,
            },
        ]

    @pytest.fixture
    def sample_purchased_number(self):
        """Create sample purchased number"""
        return {
            "phone_number": "+1234567890",
            "friendly_name": "My Business Number",
            "country_code": "US",
            "capabilities": ["sms", "voice"],
            "status": "active",
            "monthly_cost": 1.00,
            "usage_plan": "standard",
            "auto_renew": True,
            "purchased_at": datetime.utcnow(),
            "next_billing_date": datetime.utcnow() + timedelta(days=30),
            "webhook_url": "https://example.com/webhook",
        }

    def test_search_available_numbers_success(
        self, mock_twilio_client, mock_user, sample_available_numbers
    ):
        """Test successful number search"""
        mock_twilio_client.search_available_numbers.return_value = (
            sample_available_numbers
        )

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.post(
                "/api/numbers/search",
                json={
                    "country_code": "US",
                    "area_code": "234",
                    "number_type": "local",
                    "capabilities": ["sms", "voice"],
                    "limit": 10,
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["phone_number"] == "+1234567890"
        assert data[0]["country_code"] == "US"
        assert data[0]["area_code"] == "234"
        assert data[0]["monthly_cost"] == 1.00
        assert data[0]["capabilities"] == ["sms", "voice"]

    def test_search_available_numbers_invalid_country(self):
        """Test number search with invalid country code"""
        response = client.post(
            "/api/numbers/search",
            json={
                "country_code": "INVALID",  # Invalid country code
                "number_type": "local",
                "capabilities": ["sms"],
            },
        )

        assert response.status_code == 422  # Validation error

    def test_search_available_numbers_invalid_number_type(self):
        """Test number search with invalid number type"""
        response = client.post(
            "/api/numbers/search",
            json={
                "country_code": "US",
                "number_type": "invalid_type",
                "capabilities": ["sms"],
            },
        )

        assert response.status_code == 422  # Validation error

    def test_search_available_numbers_invalid_capabilities(self):
        """Test number search with invalid capabilities"""
        response = client.post(
            "/api/numbers/search",
            json={
                "country_code": "US",
                "number_type": "local",
                "capabilities": ["invalid_capability"],
            },
        )

        assert response.status_code == 422  # Validation error

    def test_purchase_phone_number_success(
        self, mock_twilio_client, mock_user, sample_purchased_number
    ):
        """Test successful phone number purchase"""
        mock_twilio_client.purchase_phone_number.return_value = sample_purchased_number

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.post(
                "/api/numbers/purchase",
                json={
                    "phone_number": "+1234567890",
                    "friendly_name": "My Business Number",
                    "auto_renew": True,
                    "usage_plan": "standard",
                    "webhook_url": "https://example.com/webhook",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["phone_number"] == "+1234567890"
        assert data["friendly_name"] == "My Business Number"
        assert data["status"] == "active"
        assert data["monthly_cost"] == 1.00
        assert data["usage_plan"] == "standard"
        assert data["auto_renew"] is True

    def test_purchase_phone_number_invalid_format(self):
        """Test phone number purchase with invalid number format"""
        response = client.post(
            "/api/numbers/purchase",
            json={
                "phone_number": "invalid_number",  # Invalid format
                "friendly_name": "Test Number",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_purchase_phone_number_invalid_usage_plan(self):
        """Test phone number purchase with invalid usage plan"""
        response = client.post(
            "/api/numbers/purchase",
            json={
                "phone_number": "+1234567890",
                "friendly_name": "Test Number",
                "usage_plan": "invalid_plan",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_get_owned_numbers_success(
        self, mock_twilio_client, mock_user, sample_purchased_number
    ):
        """Test successful owned numbers retrieval"""
        mock_twilio_client.get_user_numbers.return_value = [sample_purchased_number]

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.get("/api/numbers/owned")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["phone_number"] == "+1234567890"
        assert data[0]["friendly_name"] == "My Business Number"
        assert data[0]["status"] == "active"

    def test_get_owned_numbers_with_filters(self, mock_twilio_client, mock_user):
        """Test owned numbers retrieval with filters"""
        mock_twilio_client.get_user_numbers.return_value = []

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.get(
                "/api/numbers/owned?status_filter=active&country_filter=US"
            )

        assert response.status_code == 200

        # Verify filters were passed to the service
        mock_twilio_client.get_user_numbers.assert_called_with(
            user_id=mock_user.id, status_filter="active", country_filter="US"
        )

    def test_update_phone_number_success(
        self, mock_twilio_client, mock_user, sample_purchased_number
    ):
        """Test successful phone number update"""
        updated_number = sample_purchased_number.copy()
        updated_number["friendly_name"] = "Updated Business Number"
        updated_number["usage_plan"] = "premium"

        mock_twilio_client.update_phone_number.return_value = updated_number

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.put(
                "/api/numbers/+1234567890",
                json={
                    "friendly_name": "Updated Business Number",
                    "usage_plan": "premium",
                    "auto_renew": False,
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["friendly_name"] == "Updated Business Number"
        assert data["usage_plan"] == "premium"

    def test_update_phone_number_invalid_usage_plan(self):
        """Test phone number update with invalid usage plan"""
        response = client.put(
            "/api/numbers/+1234567890", json={"usage_plan": "invalid_plan"}
        )

        assert response.status_code == 422  # Validation error

    def test_update_phone_number_invalid_status(self):
        """Test phone number update with invalid status"""
        response = client.put(
            "/api/numbers/+1234567890", json={"status": "invalid_status"}
        )

        assert response.status_code == 422  # Validation error

    def test_release_phone_number_success(self, mock_twilio_client, mock_user):
        """Test successful phone number release"""
        mock_twilio_client.release_phone_number.return_value = {
            "success": True,
            "refund_amount": 0.50,
        }

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.delete("/api/numbers/+1234567890")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Phone number released successfully"
        assert data["phone_number"] == "+1234567890"
        assert data["refund_amount"] == 0.50
        assert "released_at" in data

    def test_release_phone_number_with_force(self, mock_twilio_client, mock_user):
        """Test phone number release with force flag"""
        mock_twilio_client.release_phone_number.return_value = {"success": True}

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.delete("/api/numbers/+1234567890?force=true")

        assert response.status_code == 200

        # Verify force flag was passed
        mock_twilio_client.release_phone_number.assert_called_with(
            user_id=mock_user.id, phone_number="+1234567890", force=True
        )

    def test_get_number_usage_success(self, mock_twilio_client, mock_user):
        """Test successful number usage retrieval"""
        usage_stats = {
            "period_start": datetime.utcnow() - timedelta(days=30),
            "period_end": datetime.utcnow(),
            "messages_sent": 150,
            "messages_received": 75,
            "calls_made": 25,
            "calls_received": 12,
            "total_cost": 15.75,
            "cost_breakdown": {"sms": 11.25, "voice": 4.50},
            "usage_by_country": {"US": 120, "CA": 30},
        }

        mock_twilio_client.get_number_usage_stats.return_value = usage_stats

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.get("/api/numbers/+1234567890/usage?period_days=30")

        assert response.status_code == 200
        data = response.json()
        assert data["phone_number"] == "+1234567890"
        assert data["messages_sent"] == 150
        assert data["messages_received"] == 75
        assert data["calls_made"] == 25
        assert data["calls_received"] == 12
        assert data["total_cost"] == 15.75
        assert "cost_breakdown" in data
        assert "usage_by_country" in data

    def test_get_number_usage_not_found(self, mock_twilio_client, mock_user):
        """Test number usage retrieval when number not found"""
        mock_twilio_client.get_number_usage_stats.side_effect = ValueError(
            "Number not found"
        )

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.get("/api/numbers/+1234567890/usage")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_calculate_cost_estimate_success(self, mock_routing_engine):
        """Test successful cost calculation"""
        cost_estimate = {
            "message_cost": 0.0075,
            "call_cost_per_minute": 0.02,
            "total_estimated_cost": 1.2075,
            "currency": "USD",
            "cost_breakdown": {"messages": 0.0075, "calls": 1.20},
            "recommendations": [
                "Consider purchasing a local number for better rates",
                "Use SMS for non-urgent communications",
            ],
        }

        mock_routing_engine.calculate_communication_costs.return_value = cost_estimate

        with patch(
            "api.number_management_api.get_routing_engine",
            return_value=mock_routing_engine,
        ):
            response = client.post(
                "/api/numbers/cost-estimate",
                json={
                    "from_country": "US",
                    "to_country": "CA",
                    "message_count": 1,
                    "call_minutes": 60,
                    "number_type": "local",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["from_country"] == "US"
        assert data["to_country"] == "CA"
        assert data["message_cost"] == 0.0075
        assert data["call_cost_per_minute"] == 0.02
        assert data["total_estimated_cost"] == 1.2075
        assert data["currency"] == "USD"
        assert len(data["recommendations"]) == 2

    def test_calculate_cost_estimate_invalid_country(self):
        """Test cost calculation with invalid country codes"""
        response = client.post(
            "/api/numbers/cost-estimate",
            json={"from_country": "INVALID", "to_country": "CA", "message_count": 1},
        )

        assert response.status_code == 422  # Validation error

    def test_get_optimization_recommendations_success(
        self, mock_routing_engine, mock_user
    ):
        """Test successful optimization recommendations"""
        recommendations = {
            "current_setup": {
                "numbers": ["+1234567890"],
                "monthly_cost": 10.00,
                "coverage": ["US"],
            },
            "recommended_setup": {
                "numbers": ["+1234567890", "+14165551234"],
                "monthly_cost": 12.00,
                "coverage": ["US", "CA"],
            },
            "potential_savings": 5.00,
            "coverage_improvement": 0.25,
            "delivery_improvement": 0.15,
            "implementation_steps": [
                "Purchase Canadian local number",
                "Update routing rules",
                "Test delivery rates",
            ],
            "cost_comparison": {
                "current": 10.00,
                "recommended": 12.00,
                "savings": 5.00,
            },
        }

        mock_routing_engine.optimize_number_portfolio.return_value = recommendations

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_routing_engine",
            return_value=mock_routing_engine,
        ):

            response = client.post(
                "/api/numbers/optimize",
                json={
                    "target_countries": ["US", "CA"],
                    "monthly_message_volume": 1000,
                    "monthly_call_minutes": 300,
                    "budget_limit": 50.00,
                    "optimization_goal": "cost",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["potential_savings"] == 5.00
        assert data["coverage_improvement"] == 0.25
        assert data["delivery_improvement"] == 0.15
        assert len(data["implementation_steps"]) == 3
        assert "current_setup" in data
        assert "recommended_setup" in data

    def test_get_optimization_recommendations_invalid_goal(self):
        """Test optimization recommendations with invalid goal"""
        response = client.post(
            "/api/numbers/optimize",
            json={
                "target_countries": ["US", "CA"],
                "monthly_message_volume": 1000,
                "optimization_goal": "invalid_goal",
            },
        )

        assert response.status_code == 422  # Validation error

    def test_get_optimization_recommendations_empty_countries(self):
        """Test optimization recommendations with empty target countries"""
        response = client.post(
            "/api/numbers/optimize",
            json={"target_countries": [], "monthly_message_volume": 1000},  # Empty list
        )

        assert response.status_code == 422  # Validation error

    def test_get_number_analytics_success(self, mock_twilio_client, mock_user):
        """Test successful number analytics retrieval"""
        analytics = {
            "total_numbers": 5,
            "active_numbers": 4,
            "total_monthly_cost": 25.00,
            "usage_efficiency": 0.75,
            "top_performing_numbers": [
                {
                    "phone_number": "+1234567890",
                    "efficiency_score": 0.95,
                    "monthly_cost": 5.00,
                }
            ],
            "underutilized_numbers": [
                {
                    "phone_number": "+1987654321",
                    "efficiency_score": 0.25,
                    "monthly_cost": 3.00,
                }
            ],
            "cost_trends": {"last_6_months": [20.0, 22.0, 24.0, 25.0, 25.0, 25.0]},
            "recommendations": [
                "Consider releasing underutilized numbers",
                "Optimize routing for better efficiency",
            ],
        }

        mock_twilio_client.get_number_portfolio_analytics.return_value = analytics

        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):

            response = client.get("/api/numbers/analytics?period_days=30")

        assert response.status_code == 200
        data = response.json()
        assert data["total_numbers"] == 5
        assert data["active_numbers"] == 4
        assert data["total_monthly_cost"] == 25.00
        assert data["usage_efficiency"] == 0.75
        assert len(data["top_performing_numbers"]) == 1
        assert len(data["underutilized_numbers"]) == 1
        assert len(data["recommendations"]) == 2

    def test_get_supported_countries_success(self, mock_twilio_client):
        """Test successful supported countries retrieval"""
        supported_countries = [
            {
                "country_code": "US",
                "country_name": "United States",
                "capabilities": ["sms", "voice"],
                "number_types": ["local", "toll_free"],
                "pricing": {"local": 1.00, "toll_free": 2.00},
            },
            {
                "country_code": "CA",
                "country_name": "Canada",
                "capabilities": ["sms", "voice"],
                "number_types": ["local"],
                "pricing": {"local": 1.50},
            },
        ]

        mock_twilio_client.get_supported_countries.return_value = supported_countries

        with patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):
            response = client.get("/api/numbers/countries/supported")

        assert response.status_code == 200
        data = response.json()
        assert len(data["countries"]) == 2
        assert data["total_count"] == 2
        assert "last_updated" in data
        assert data["countries"][0]["country_code"] == "US"
        assert data["countries"][1]["country_code"] == "CA"

    def test_health_check_healthy(self, mock_twilio_client):
        """Test health check when service is healthy"""
        mock_twilio_client.check_api_health.return_value = {
            "api_accessible": True,
            "status": "healthy",
            "available_countries": 50,
        }

        with patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):
            response = client.get("/api/numbers/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["twilio_status"] == "healthy"
        assert data["available_countries"] == 50
        assert "timestamp" in data

    def test_health_check_degraded(self, mock_twilio_client):
        """Test health check when service is degraded"""
        mock_twilio_client.check_api_health.return_value = {
            "api_accessible": False,
            "status": "degraded",
            "available_countries": 0,
        }

        with patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):
            response = client.get("/api/numbers/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["twilio_status"] == "degraded"

    def test_health_check_error(self, mock_twilio_client):
        """Test health check when service throws error"""
        mock_twilio_client.check_api_health.side_effect = Exception("API unavailable")

        with patch(
            "api.number_management_api.get_twilio_client",
            return_value=mock_twilio_client,
        ):
            response = client.get("/api/numbers/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "error" in data

    def test_authentication_required(self):
        """Test that authentication is required for protected endpoints"""
        # Test without authentication token
        response = client.post(
            "/api/numbers/search",
            json={
                "country_code": "US",
                "number_type": "local",
                "capabilities": ["sms"],
            },
        )

        assert response.status_code == 403  # Forbidden without auth

    def test_service_unavailable_error(self, mock_user):
        """Test handling when Twilio service is unavailable"""
        with patch(
            "api.number_management_api.get_current_user", return_value=mock_user
        ), patch(
            "api.number_management_api.get_twilio_client",
            side_effect=Exception("Service unavailable"),
        ):

            response = client.post(
                "/api/numbers/search",
                json={
                    "country_code": "US",
                    "number_type": "local",
                    "capabilities": ["sms"],
                },
            )

        assert response.status_code == 503  # Service unavailable


class TestNumberManagementAPIIntegration:
    """Integration tests for Number Management API"""

    def test_full_number_management_workflow(self):
        """Test complete number management workflow"""
        # This would test the full workflow in a real environment
        # For now, we'll test the API structure

        # Test that all endpoints are properly registered
        routes = [route.path for route in app.routes if hasattr(route, "path")]

        expected_routes = [
            "/api/numbers/search",
            "/api/numbers/purchase",
            "/api/numbers/owned",
            "/api/numbers/{phone_number}",
            "/api/numbers/{phone_number}/usage",
            "/api/numbers/cost-estimate",
            "/api/numbers/optimize",
            "/api/numbers/analytics",
            "/api/numbers/countries/supported",
            "/api/numbers/health",
        ]

        for expected_route in expected_routes:
            # Check if route exists (allowing for parameter variations)
            route_exists = any(
                expected_route.replace("{phone_number}", "test") in route
                or expected_route in route
                for route in routes
            )
            assert (
                route_exists
            ), f"Route {expected_route} not found in registered routes"

    def test_number_lifecycle_workflow(self):
        """Test the complete number lifecycle workflow"""
        # This would test:
        # 1. Search for available numbers
        # 2. Purchase a number
        # 3. Update number settings
        # 4. Monitor usage
        # 5. Get analytics
        # 6. Optimize portfolio
        # 7. Release number

        # For now, just verify the endpoints exist and have correct methods
        search_route = None
        purchase_route = None
        update_route = None
        usage_route = None

        for route in app.routes:
            if hasattr(route, "path"):
                if route.path == "/api/numbers/search":
                    search_route = route
                elif route.path == "/api/numbers/purchase":
                    purchase_route = route
                elif route.path == "/api/numbers/{phone_number}":
                    update_route = route
                elif route.path == "/api/numbers/{phone_number}/usage":
                    usage_route = route

        assert search_route is not None, "Search endpoint not found"
        assert purchase_route is not None, "Purchase endpoint not found"
        assert update_route is not None, "Update endpoint not found"
        assert usage_route is not None, "Usage endpoint not found"


if __name__ == "__main__":
    # Run integration test
    test_integration = TestNumberManagementAPIIntegration()
    test_integration.test_full_number_management_workflow()
    test_integration.test_number_lifecycle_workflow()
    print("Number Management API integration test completed successfully!")

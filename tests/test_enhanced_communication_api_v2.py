#!/usr/bin/env python3
"""
Unit tests for Enhanced Communication API v2
Tests advanced communication features with AI integration, routing optimization, and multi-channel support
"""
import json
from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.enhanced_communication_api_v2 import router
from models.user_models import User
from services.communication_service import CommunicationService

# Create test app
app = FastAPI()
app.include_router(router)
client = TestClient(app)


class TestEnhancedCommunicationAPIv2:
    """Test suite for Enhanced Communication API v2 endpoints"""

    @pytest.fixture
    def mock_communication_service(self):
        """Create mock communication service"""
        service = Mock(spec=CommunicationService)
        service.send_sms_with_routing = AsyncMock()
        service.make_voice_call_with_routing = AsyncMock()
        service.get_conversation_history = AsyncMock()
        service.get_user_number_dashboard = AsyncMock()
        return service

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock(spec=User)
        user.id = "user_123"
        user.email = "test@example.com"
        user.is_active = True
        return user

    def test_create_enhanced_conversation_success(
        self, mock_communication_service, mock_user
    ):
        """Test successful enhanced conversation creation"""
        mock_communication_service.create_enhanced_conversation.return_value = {
            "conversation_id": "conv_123",
            "participants": ["user_123", "user_456"],
            "initial_message": "Welcome to enhanced chat!",
            "ai_suggestions_enabled": True,
        }

        with patch(
            "api.enhanced_communication_api_v2.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_communication_api_v2.get_communication_service",
            return_value=mock_communication_service,
        ):

            response = client.post(
                "/api/communication/v2/conversations/enhanced",
                json={
                    "participant_ids": ["user_456"],
                    "initial_message": "Hello, let's chat!",
                    "ai_features": ["auto_reply", "sentiment_analysis"],
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "conv_123"
        assert data["ai_suggestions_enabled"] is True
        assert "initial_message" in data

    def test_send_enhanced_message_with_ai(self, mock_communication_service, mock_user):
        """Test sending enhanced message with AI processing"""
        mock_communication_service.send_enhanced_message.return_value = {
            "message_id": "msg_123",
            "ai_analysis": {
                "intent": "greeting",
                "sentiment": "positive",
                "suggested_replies": ["Hi there!", "Hello! How can I help?"],
            },
            "delivery_status": "queued",
        }

        with patch(
            "api.enhanced_communication_api_v2.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_communication_api_v2.get_communication_service",
            return_value=mock_communication_service,
        ):

            response = client.post(
                "/api/communication/v2/messages/enhanced",
                json={
                    "conversation_id": "conv_123",
                    "content": "Hello, how are you?",
                    "enable_ai": True,
                    "auto_translate": True,
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["message_id"] == "msg_123"
        assert data["ai_analysis"]["intent"] == "greeting"
        assert len(data["ai_analysis"]["suggested_replies"]) == 2

    def test_get_conversation_with_ai_insights(
        self, mock_communication_service, mock_user
    ):
        """Test getting conversation with AI-generated insights"""
        mock_communication_service.get_conversation_with_ai_insights.return_value = {
            "conversation_id": "conv_123",
            "participants": ["user_123", "user_456"],
            "messages": [],  # Empty for this test
            "ai_insights": {
                "conversation_summary": "Friendly discussion about features",
                "key_topics": ["pricing", "features", "support"],
                "sentiment_trend": "positive",
                "engagement_score": 0.85,
                "suggested_actions": ["Follow up on pricing questions"],
            },
        }

        with patch(
            "api.enhanced_communication_api_v2.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_communication_api_v2.get_communication_service",
            return_value=mock_communication_service,
        ):

            response = client.get(
                "/api/communication/v2/conversations/conv_123/ai-insights"
            )

        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "conv_123"
        assert "ai_insights" in data
        assert data["ai_insights"]["engagement_score"] == 0.85
        assert len(data["ai_insights"]["key_topics"]) == 3

    def test_get_communication_analytics(self, mock_communication_service, mock_user):
        """Test getting communication analytics with AI insights"""
        mock_communication_service.get_communication_analytics.return_value = {
            "period": {"start": "2024-01-01", "end": "2024-01-31"},
            "message_volume": {"total": 150, "inbound": 75, "outbound": 75},
            "channel_breakdown": {"sms": 100, "voice": 30, "chat": 20},
            "ai_insights": {
                "top_intents": {"greeting": 40, "support": 30, "sales": 20},
                "sentiment_distribution": {
                    "positive": 70,
                    "neutral": 25,
                    "negative": 5,
                },
                "response_efficiency": 0.92,
                "automation_savings": 45.50,
            },
            "recommendations": [
                "Increase AI auto-reply usage for common queries",
                "Optimize routing for international destinations",
            ],
        }

        with patch(
            "api.enhanced_communication_api_v2.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_communication_api_v2.get_communication_service",
            return_value=mock_communication_service,
        ):

            response = client.get("/api/communication/v2/analytics?period_days=30")

        assert response.status_code == 200
        data = response.json()
        assert data["message_volume"]["total"] == 150
        assert "ai_insights" in data
        assert data["ai_insights"]["response_efficiency"] == 0.92
        assert len(data["recommendations"]) == 2

    def test_send_multi_channel_message(self, mock_communication_service, mock_user):
        """Test sending multi-channel message (SMS + Chat)"""
        mock_communication_service.send_multi_channel_message.return_value = {
            "conversation_id": "conv_123",
            "channels_used": ["sms", "chat"],
            "message_id": "msg_123",
            "delivery_status": "sent_to_all",
            "ai_optimization": {
                "channel_priority": "sms_primary",
                "expected_delivery_time": 15,
                "cost_savings": 0.02,
            },
        }

        with patch(
            "api.enhanced_communication_api_v2.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_communication_api_v2.get_communication_service",
            return_value=mock_communication_service,
        ):

            response = client.post(
                "/api/communication/v2/messages/multi-channel",
                json={
                    "conversation_id": "conv_123",
                    "content": "Multi-channel message",
                    "channels": ["sms", "chat"],
                    "priority_channel": "sms",
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert data["channels_used"] == ["sms", "chat"]
        assert data["delivery_status"] == "sent_to_all"
        assert data["ai_optimization"]["channel_priority"] == "sms_primary"

    def test_get_ai_communication_insights(self, mock_communication_service, mock_user):
        """Test getting AI-powered communication insights"""
        mock_communication_service.get_ai_communication_insights.return_value = {
            "insights": {
                "response_patterns": {
                    "greeting": {"frequency": 50, "auto_reply_rate": 0.85},
                    "support": {"frequency": 30, "auto_reply_rate": 0.75},
                },
                "bottlenecks": ["High volume during peak hours"],
                "improvements": [
                    "Implement AI routing for support queries",
                    "Add more auto-reply templates",
                ],
                "performance_metrics": {
                    "average_response_time": 2.5,
                    "customer_satisfaction": 4.2,
                },
            },
        }

        with patch(
            "api.enhanced_communication_api_v2.get_current_user", return_value=mock_user
        ), patch(
            "api.enhanced_communication_api_v2.get_communication_service",
            return_value=mock_communication_service,
        ):

            response = client.get("/api/communication/v2/ai-insights")

        assert response.status_code == 200
        data = response.json()
        assert "insights" in data
        assert "response_patterns" in data["insights"]
        assert len(data["insights"]["improvements"]) == 2
        assert data["insights"]["performance_metrics"]["average_response_time"] == 2.5

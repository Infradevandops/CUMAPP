#!/usr/bin/env python3
"""
Unit tests for Communication Service
"""
import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch

import pytest

from models.conversation_models import Conversation, Message
from models.phone_number_models import PhoneNumber
from models.user_models import User
from services.communication_service import (CallStatus, CommunicationService,
                                            MessageType,
                                            create_communication_service)


class TestCommunicationService:
    """Test Communication Service functionality"""

    @pytest.fixture
    def mock_db_session(self):
        """Create mock database session"""
        return Mock()

    @pytest.fixture
    def mock_twilio_client(self):
        """Create mock Enhanced Twilio client"""
        return Mock()

    @pytest.fixture
    def communication_service(self, mock_db_session, mock_twilio_client):
        """Create Communication Service instance"""
        with patch("services.communication_service.SmartRoutingEngine"), patch(
            "services.communication_service.NotificationService"
        ):

            service = CommunicationService(
                db_session=mock_db_session, twilio_client=mock_twilio_client
            )
            return service

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock()
        user.id = "test_user_id"
        user.is_active = True
        return user

    @pytest.fixture
    def mock_phone_number(self):
        """Create mock phone number"""
        number = Mock()
        number.id = "test_number_id"
        number.phone_number = "+1234567890"
        number.country_code = "US"
        number.owner_id = "test_user_id"
        number.is_active = True
        number.purchased_at = datetime.utcnow()
        number.expires_at = datetime.utcnow() + timedelta(days=30)
        return number

    def test_initialization(self, communication_service):
        """Test service initialization"""
        assert communication_service is not None
        assert communication_service.db is not None
        assert communication_service.twilio_client is not None

    @pytest.mark.asyncio
    async def test_send_sms_with_routing_success(
        self, communication_service, mock_user
    ):
        """Test successful SMS sending with routing"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock phone numbers
        mock_phone_number = Mock()
        mock_phone_number.phone_number = "+1234567890"
        communication_service.db.query.return_value.filter.return_value.all.return_value = [
            mock_phone_number
        ]

        # Mock Twilio SMS result
        twilio_result = {"sid": "SM123456", "status": "sent", "price": "-0.0075"}
        communication_service.twilio_client.send_sms = AsyncMock(
            return_value=twilio_result
        )

        # Mock conversation creation
        mock_conversation = Mock()
        mock_conversation.id = "conversation_id"
        communication_service._get_or_create_conversation = AsyncMock(
            return_value=mock_conversation
        )

        # Mock database operations
        communication_service.db.add = Mock()
        communication_service.db.commit = Mock()
        communication_service.db.refresh = Mock()

        result = await communication_service.send_sms_with_routing(
            user_id="test_user_id",
            to_number="+0987654321",
            message="Test message",
            from_number="+1234567890",
        )

        assert result["to_number"] == "+0987654321"
        assert result["from_number"] == "+1234567890"
        assert result["message"] == "Test message"
        assert result["status"] == "sent"
        assert result["external_id"] == "SM123456"

        communication_service.twilio_client.send_sms.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_sms_with_smart_routing(self, communication_service, mock_user):
        """Test SMS sending with smart routing enabled"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock routing engine
        mock_routing_recommendation = Mock()
        mock_routing_recommendation.primary_option = Mock()
        mock_routing_recommendation.primary_option.phone_number = "+1555000001"

        communication_service.routing_engine = Mock()
        communication_service.routing_engine.suggest_optimal_numbers = AsyncMock(
            return_value=mock_routing_recommendation
        )

        # Mock phone numbers
        mock_phone_number = Mock()
        mock_phone_number.phone_number = "+1234567890"
        communication_service._get_user_phone_numbers = AsyncMock(
            return_value=[mock_phone_number]
        )

        # Mock Twilio SMS result
        twilio_result = {"sid": "SM123456", "status": "sent"}
        communication_service.twilio_client.send_sms = AsyncMock(
            return_value=twilio_result
        )

        # Mock conversation and database operations
        mock_conversation = Mock()
        mock_conversation.id = "conversation_id"
        communication_service._get_or_create_conversation = AsyncMock(
            return_value=mock_conversation
        )
        communication_service.db.add = Mock()
        communication_service.db.commit = Mock()
        communication_service.db.refresh = Mock()

        result = await communication_service.send_sms_with_routing(
            user_id="test_user_id",
            to_number="+0987654321",
            message="Test message",
            use_smart_routing=True,
        )

        assert result["from_number"] == "+1555000001"  # Should use routed number
        assert result["routing_used"] == True

        communication_service.routing_engine.suggest_optimal_numbers.assert_called_once()

    @pytest.mark.asyncio
    async def test_receive_sms_webhook(self, communication_service):
        """Test SMS webhook processing"""
        # Mock Twilio webhook processing
        processed_data = {
            "from_number": "+0987654321",
            "to_number": "+1234567890",
            "message": "Hello world",
            "sid": "SM123456",
        }
        communication_service.twilio_client.receive_sms_webhook = AsyncMock(
            return_value=processed_data
        )

        # Mock phone number lookup
        mock_phone_number = Mock()
        mock_phone_number.owner_id = "test_user_id"
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_phone_number
        )

        # Mock conversation creation
        mock_conversation = Mock()
        mock_conversation.id = "conversation_id"
        communication_service._get_or_create_conversation = AsyncMock(
            return_value=mock_conversation
        )

        # Mock database operations
        communication_service.db.add = Mock()
        communication_service.db.commit = Mock()
        communication_service.db.refresh = Mock()

        # Mock notification service
        communication_service.notification_service.send_verification_completed = (
            AsyncMock()
        )

        webhook_data = {
            "From": "+0987654321",
            "To": "+1234567890",
            "Body": "Hello world",
        }

        result = await communication_service.receive_sms_webhook(webhook_data)

        assert result["from_number"] == "+0987654321"
        assert result["to_number"] == "+1234567890"
        assert result["message"] == "Hello world"
        assert result["user_id"] == "test_user_id"

        communication_service.notification_service.send_verification_completed.assert_called_once()

    @pytest.mark.asyncio
    async def test_make_voice_call_with_routing(self, communication_service, mock_user):
        """Test voice call with routing"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock phone numbers
        mock_phone_number = Mock()
        mock_phone_number.phone_number = "+1234567890"
        communication_service._get_user_phone_numbers = AsyncMock(
            return_value=[mock_phone_number]
        )

        # Mock Twilio call result
        twilio_result = {"sid": "CA123456", "status": "initiated"}
        communication_service.twilio_client.make_call = AsyncMock(
            return_value=twilio_result
        )

        # Mock conversation creation
        mock_conversation = Mock()
        mock_conversation.id = "conversation_id"
        communication_service._get_or_create_conversation = AsyncMock(
            return_value=mock_conversation
        )

        # Mock database operations
        communication_service.db.add = Mock()
        communication_service.db.commit = Mock()
        communication_service.db.refresh = Mock()

        result = await communication_service.make_voice_call_with_routing(
            user_id="test_user_id", to_number="+0987654321", from_number="+1234567890"
        )

        assert result["to_number"] == "+0987654321"
        assert result["from_number"] == "+1234567890"
        assert result["call_sid"] == "CA123456"
        assert result["status"] == "initiated"

        communication_service.twilio_client.make_call.assert_called_once()

    @pytest.mark.asyncio
    async def test_record_call(self, communication_service, mock_user):
        """Test call recording"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock call message lookup
        mock_call_message = Mock()
        mock_call_message.id = "call_message_id"
        mock_call_message.content = "Voice call to +0987654321"
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_call_message
        )

        # Mock Twilio recording result
        recording_result = {
            "recording_sid": "RE123456",
            "status": "recording",
            "date_created": "2024-01-01T00:00:00Z",
        }
        communication_service.twilio_client.record_call = AsyncMock(
            return_value=recording_result
        )

        # Mock database operations
        communication_service.db.commit = Mock()

        result = await communication_service.record_call(
            user_id="test_user_id", call_sid="CA123456"
        )

        assert result["call_id"] == "call_message_id"
        assert result["call_sid"] == "CA123456"
        assert result["recording_sid"] == "RE123456"
        assert result["status"] == "recording"

        communication_service.twilio_client.record_call.assert_called_once()

    @pytest.mark.asyncio
    async def test_forward_call(self, communication_service, mock_user):
        """Test call forwarding"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock call message lookup
        mock_call_message = Mock()
        mock_call_message.id = "call_message_id"
        mock_call_message.content = "Voice call to +0987654321"
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_call_message
        )

        # Mock Twilio forwarding result
        forward_result = {"status": "forwarded", "date_updated": "2024-01-01T00:00:00Z"}
        communication_service.twilio_client.forward_call = AsyncMock(
            return_value=forward_result
        )

        # Mock database operations
        communication_service.db.commit = Mock()

        result = await communication_service.forward_call(
            user_id="test_user_id", call_sid="CA123456", forward_to="+1555000001"
        )

        assert result["call_id"] == "call_message_id"
        assert result["call_sid"] == "CA123456"
        assert result["forwarded_to"] == "+1555000001"
        assert result["status"] == "forwarded"

        communication_service.twilio_client.forward_call.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_conference_call(self, communication_service, mock_user):
        """Test conference call creation"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock Twilio conference result
        conference_result = {"conference_sid": "CF123456", "status": "initiated"}
        communication_service.twilio_client.create_conference = AsyncMock(
            return_value=conference_result
        )

        # Mock database operations
        communication_service.db.add = Mock()
        communication_service.db.commit = Mock()
        communication_service.db.refresh = Mock()

        participants = ["+1234567890", "+0987654321", "+1555000001"]

        result = await communication_service.create_conference_call(
            user_id="test_user_id",
            conference_name="Test Conference",
            participants=participants,
        )

        assert result["conference_name"] == "Test Conference"
        assert result["conference_sid"] == "CF123456"
        assert result["participants"] == participants
        assert result["status"] == "initiated"

        communication_service.twilio_client.create_conference.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_conversation_history(self, communication_service, mock_user):
        """Test conversation history retrieval"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock messages
        mock_message1 = Mock()
        mock_message1.id = "message_1"
        mock_message1.conversation_id = "conversation_1"
        mock_message1.content = "Hello"
        mock_message1.message_type = MessageType.SMS.value
        mock_message1.from_number = "+1234567890"
        mock_message1.to_number = "+0987654321"
        mock_message1.sender_id = "test_user_id"
        mock_message1.delivery_status = "sent"
        mock_message1.created_at = datetime.utcnow()
        mock_message1.delivered_at = None

        mock_message2 = Mock()
        mock_message2.id = "message_2"
        mock_message2.conversation_id = "conversation_1"
        mock_message2.content = "Hi there"
        mock_message2.message_type = MessageType.SMS.value
        mock_message2.from_number = "+0987654321"
        mock_message2.to_number = "+1234567890"
        mock_message2.sender_id = None
        mock_message2.delivery_status = "received"
        mock_message2.created_at = datetime.utcnow()
        mock_message2.delivered_at = None

        # Mock query chain
        mock_query = Mock()
        mock_query.join.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [mock_message1, mock_message2]

        communication_service.db.query.return_value = mock_query

        result = await communication_service.get_conversation_history(
            user_id="test_user_id", conversation_id="conversation_1"
        )

        assert result["user_id"] == "test_user_id"
        assert len(result["messages"]) == 2
        assert result["messages"][0]["message_id"] == "message_1"
        assert result["messages"][0]["is_outbound"] == True
        assert result["messages"][1]["message_id"] == "message_2"
        assert result["messages"][1]["is_outbound"] == False

    @pytest.mark.asyncio
    async def test_get_user_number_dashboard(
        self, communication_service, mock_user, mock_phone_number
    ):
        """Test user number dashboard"""
        # Mock database queries
        communication_service.db.query.return_value.filter.return_value.first.return_value = (
            mock_user
        )

        # Mock phone numbers
        communication_service._get_user_phone_numbers = AsyncMock(
            return_value=[mock_phone_number]
        )

        # Mock message counts
        communication_service.db.query.return_value.filter.return_value.count.return_value = (
            5
        )

        # Mock routing engine
        communication_service.routing_engine = Mock()
        communication_service.routing_engine.get_routing_analytics = AsyncMock(
            return_value={"optimization_opportunities": []}
        )

        result = await communication_service.get_user_number_dashboard(
            user_id="test_user_id"
        )

        assert result["user_id"] == "test_user_id"
        assert "summary" in result
        assert "numbers" in result
        assert result["summary"]["total_numbers"] == 1
        assert len(result["numbers"]) == 1

        number_info = result["numbers"][0]
        assert number_info["phone_number"] == "+1234567890"
        assert number_info["country_code"] == "US"
        assert "usage" in number_info
        assert "costs" in number_info


class TestCommunicationServiceFactory:
    """Test Communication Service factory function"""

    def test_create_communication_service_success(self):
        """Test successful service creation"""
        mock_db_session = Mock()
        mock_twilio_client = Mock()

        with patch(
            "services.communication_service.CommunicationService"
        ) as mock_service:
            result = create_communication_service(
                db_session=mock_db_session, twilio_client=mock_twilio_client
            )

            mock_service.assert_called_once_with(mock_db_session, mock_twilio_client)
            assert result is not None

    def test_create_communication_service_exception(self):
        """Test service creation with exception"""
        mock_db_session = Mock()

        with patch(
            "services.communication_service.CommunicationService",
            side_effect=Exception("Test error"),
        ):
            with pytest.raises(Exception, match="Test error"):
                create_communication_service(db_session=mock_db_session)


if __name__ == "__main__":
    pytest.main([__file__])

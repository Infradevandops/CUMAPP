#!/usr/bin/env python3
"""
Unit tests for Enhanced Twilio Client
"""
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch

import pytest

from enhanced_twilio_client import (EnhancedTwilioClient,
                                    create_enhanced_twilio_client)


class TestEnhancedTwilioClient:
    """Test Enhanced Twilio Client functionality"""

    @pytest.fixture
    def mock_twilio_client(self):
        """Create a mock Twilio client"""
        with patch("enhanced_twilio_client.Client") as mock_client:
            yield mock_client

    @pytest.fixture
    def enhanced_client(self, mock_twilio_client):
        """Create Enhanced Twilio client with mocked dependencies"""
        return EnhancedTwilioClient("test_sid", "test_token")

    @pytest.mark.asyncio
    async def test_send_sms_success(self, enhanced_client, mock_twilio_client):
        """Test successful SMS sending"""
        # Mock Twilio message response
        mock_message = Mock()
        mock_message.sid = "SM123456"
        mock_message.status = "sent"
        mock_message.date_created = datetime.now()
        mock_message.price = "-0.0075"
        mock_message.price_unit = "USD"
        mock_message.error_code = None
        mock_message.error_message = None

        enhanced_client.client.messages.create.return_value = mock_message

        result = await enhanced_client.send_sms(
            from_number="+1234567890", to_number="+0987654321", message="Test message"
        )

        assert result["sid"] == "SM123456"
        assert result["status"] == "sent"
        assert result["from_number"] == "+1234567890"
        assert result["to_number"] == "+0987654321"
        assert result["message"] == "Test message"
        assert result["direction"] == "outbound"

        enhanced_client.client.messages.create.assert_called_once_with(
            body="Test message", from_="+1234567890", to="+0987654321"
        )

    @pytest.mark.asyncio
    async def test_send_sms_invalid_number(self, enhanced_client):
        """Test SMS sending with invalid phone number"""
        with pytest.raises(Exception, match="Phone number parsing error"):
            await enhanced_client.send_sms(
                from_number="invalid", to_number="+0987654321", message="Test message"
            )

    @pytest.mark.asyncio
    async def test_receive_sms_webhook(self, enhanced_client):
        """Test SMS webhook processing"""
        webhook_data = {
            "MessageSid": "SM123456",
            "From": "+1234567890",
            "To": "+0987654321",
            "Body": "Hello world",
            "MessageStatus": "received",
            "NumMedia": "1",
            "MediaUrl0": "https://example.com/image.jpg",
        }

        result = await enhanced_client.receive_sms_webhook(webhook_data)

        assert result["sid"] == "SM123456"
        assert result["from_number"] == "+1234567890"
        assert result["to_number"] == "+0987654321"
        assert result["message"] == "Hello world"
        assert result["status"] == "received"
        assert result["direction"] == "inbound"
        assert result["media_count"] == 1
        assert len(result["media_urls"]) == 1
        assert result["media_urls"][0] == "https://example.com/image.jpg"

    @pytest.mark.asyncio
    async def test_make_call_success(self, enhanced_client, mock_twilio_client):
        """Test successful voice call"""
        # Mock Twilio call response
        mock_call = Mock()
        mock_call.sid = "CA123456"
        mock_call.status = "initiated"
        mock_call.date_created = datetime.now()
        mock_call.duration = None
        mock_call.price = None
        mock_call.price_unit = None

        enhanced_client.client.calls.create.return_value = mock_call

        result = await enhanced_client.make_call(
            from_number="+1234567890",
            to_number="+0987654321",
            twiml_url="http://example.com/twiml",
        )

        assert result["sid"] == "CA123456"
        assert result["status"] == "initiated"
        assert result["from_number"] == "+1234567890"
        assert result["to_number"] == "+0987654321"
        assert result["direction"] == "outbound"

        enhanced_client.client.calls.create.assert_called_once_with(
            to="+0987654321", from_="+1234567890", url="http://example.com/twiml"
        )

    @pytest.mark.asyncio
    async def test_make_call_default_twiml(self, enhanced_client, mock_twilio_client):
        """Test voice call with default TwiML URL"""
        mock_call = Mock()
        mock_call.sid = "CA123456"
        mock_call.status = "initiated"
        mock_call.date_created = datetime.now()
        mock_call.duration = None
        mock_call.price = None
        mock_call.price_unit = None

        enhanced_client.client.calls.create.return_value = mock_call

        result = await enhanced_client.make_call(
            from_number="+1234567890", to_number="+0987654321"
        )

        enhanced_client.client.calls.create.assert_called_once_with(
            to="+0987654321",
            from_="+1234567890",
            url="http://demo.twilio.com/docs/voice.xml",
        )

    @pytest.mark.asyncio
    async def test_receive_call_webhook(self, enhanced_client):
        """Test call webhook processing"""
        webhook_data = {
            "CallSid": "CA123456",
            "From": "+1234567890",
            "To": "+0987654321",
            "CallStatus": "ringing",
            "Direction": "inbound",
            "CallerName": "John Doe",
            "CallerCity": "New York",
            "CallerState": "NY",
            "CallerCountry": "US",
        }

        result = await enhanced_client.receive_call_webhook(webhook_data)

        assert result["sid"] == "CA123456"
        assert result["from_number"] == "+1234567890"
        assert result["to_number"] == "+0987654321"
        assert result["status"] == "ringing"
        assert result["direction"] == "inbound"
        assert result["caller_name"] == "John Doe"
        assert result["caller_city"] == "New York"
        assert result["caller_state"] == "NY"
        assert result["caller_country"] == "US"

    @pytest.mark.asyncio
    async def test_search_available_numbers(self, enhanced_client, mock_twilio_client):
        """Test searching for available phone numbers"""
        # Mock available numbers response
        mock_number = Mock()
        mock_number.phone_number = "+1234567890"
        mock_number.friendly_name = "+1 (234) 567-890"
        mock_number.locality = "New York"
        mock_number.region = "NY"
        mock_number.postal_code = "10001"
        mock_number.iso_country = "US"
        mock_number.capabilities = {"voice": True, "SMS": True, "MMS": False}
        mock_number.beta = False
        mock_number.lata = "132"
        mock_number.rate_center = "NWYRCYZN01"

        enhanced_client.client.available_phone_numbers.return_value.local.list.return_value = [
            mock_number
        ]

        results = await enhanced_client.search_available_numbers("US", area_code="234")

        assert len(results) == 1
        assert results[0]["phone_number"] == "+1234567890"
        assert results[0]["country_code"] == "US"
        assert results[0]["locality"] == "New York"
        assert results[0]["region"] == "NY"
        assert results[0]["capabilities"]["voice"] == True
        assert results[0]["capabilities"]["sms"] == True
        assert results[0]["capabilities"]["mms"] == False

    @pytest.mark.asyncio
    async def test_purchase_number(self, enhanced_client, mock_twilio_client):
        """Test purchasing a phone number"""
        # Mock purchase response
        mock_purchased_number = Mock()
        mock_purchased_number.sid = "PN123456"
        mock_purchased_number.phone_number = "+1234567890"
        mock_purchased_number.friendly_name = "+1 (234) 567-890"
        mock_purchased_number.iso_country = "US"
        mock_purchased_number.date_created = datetime.now()
        mock_purchased_number.capabilities = {"voice": True, "sms": True, "mms": False}
        mock_purchased_number.voice_url = None
        mock_purchased_number.sms_url = None

        enhanced_client.client.incoming_phone_numbers.create.return_value = (
            mock_purchased_number
        )

        result = await enhanced_client.purchase_number("+1234567890")

        assert result["sid"] == "PN123456"
        assert result["phone_number"] == "+1234567890"
        assert result["country_code"] == "US"
        assert result["status"] == "purchased"
        assert result["capabilities"]["voice"] == True
        assert result["capabilities"]["sms"] == True

        enhanced_client.client.incoming_phone_numbers.create.assert_called_once_with(
            phone_number="+1234567890"
        )

    @pytest.mark.asyncio
    async def test_release_number(self, enhanced_client, mock_twilio_client):
        """Test releasing a phone number"""
        enhanced_client.client.incoming_phone_numbers.return_value.delete.return_value = (
            True
        )

        result = await enhanced_client.release_number("PN123456")

        assert result == True
        enhanced_client.client.incoming_phone_numbers.assert_called_once_with(
            "PN123456"
        )

    @pytest.mark.asyncio
    async def test_list_owned_numbers(self, enhanced_client, mock_twilio_client):
        """Test listing owned phone numbers"""
        # Mock owned numbers response
        mock_number = Mock()
        mock_number.sid = "PN123456"
        mock_number.phone_number = "+1234567890"
        mock_number.friendly_name = "+1 (234) 567-890"
        mock_number.iso_country = "US"
        mock_number.date_created = datetime.now()
        mock_number.capabilities = {"voice": True, "sms": True, "mms": False}
        mock_number.voice_url = "http://example.com/voice"
        mock_number.sms_url = "http://example.com/sms"
        mock_number.status_callback = None

        enhanced_client.client.incoming_phone_numbers.list.return_value = [mock_number]

        results = await enhanced_client.list_owned_numbers()

        assert len(results) == 1
        assert results[0]["sid"] == "PN123456"
        assert results[0]["phone_number"] == "+1234567890"
        assert results[0]["country_code"] == "US"
        assert results[0]["voice_url"] == "http://example.com/voice"
        assert results[0]["sms_url"] == "http://example.com/sms"

    def test_get_number_info(self, enhanced_client):
        """Test getting phone number information"""
        info = enhanced_client.get_number_info("+1234567890")

        assert info["phone_number"] == "+1234567890"
        assert info["country_code"] == 1
        assert info["national_number"] == 2345678900
        assert info["is_valid"] == True
        assert info["is_possible"] == True

    def test_get_number_info_invalid(self, enhanced_client):
        """Test getting info for invalid phone number"""
        info = enhanced_client.get_number_info("invalid")

        assert "error" in info

    @pytest.mark.asyncio
    async def test_get_account_balance(self, enhanced_client, mock_twilio_client):
        """Test getting account balance"""
        # Mock account response
        mock_account = Mock()
        mock_account.sid = "AC123456"
        mock_account.friendly_name = "Test Account"
        mock_account.status = "active"
        mock_account.type = "Full"
        mock_account.date_created = datetime.now()
        mock_account.date_updated = datetime.now()

        enhanced_client.client.api.accounts.return_value.fetch.return_value = (
            mock_account
        )

        result = await enhanced_client.get_account_balance()

        assert result["account_sid"] == "AC123456"
        assert result["friendly_name"] == "Test Account"
        assert result["status"] == "active"
        assert result["type"] == "Full"


class TestEnhancedTwilioClientFactory:
    """Test Enhanced Twilio Client factory function"""

    def test_create_enhanced_twilio_client_success(self):
        """Test successful client creation"""
        with patch("enhanced_twilio_client.EnhancedTwilioClient") as mock_client:
            result = create_enhanced_twilio_client("test_sid", "test_token")

            mock_client.assert_called_once_with("test_sid", "test_token")
            assert result is not None

    def test_create_enhanced_twilio_client_missing_credentials(self):
        """Test client creation with missing credentials"""
        result = create_enhanced_twilio_client(None, "test_token")
        assert result is None

        result = create_enhanced_twilio_client("test_sid", None)
        assert result is None

        result = create_enhanced_twilio_client(None, None)
        assert result is None

    def test_create_enhanced_twilio_client_exception(self):
        """Test client creation with exception"""
        with patch(
            "enhanced_twilio_client.EnhancedTwilioClient",
            side_effect=Exception("Test error"),
        ):
            result = create_enhanced_twilio_client("test_sid", "test_token")
            assert result is None


if __name__ == "__main__":
    pytest.main([__file__])

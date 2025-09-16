#!/usr/bin/env python3
"""
Unit tests for Smart Routing Engine
"""
import asyncio
import math
from unittest.mock import AsyncMock, Mock, patch

import pytest

from services.smart_routing_engine import (CountryInfo, NumberOption,
                                           RoutingRecommendation,
                                           SmartRoutingEngine,
                                           create_smart_routing_engine)


class TestSmartRoutingEngine:
    """Test Smart Routing Engine functionality"""

    @pytest.fixture
    def routing_engine(self):
        """Create Smart Routing Engine instance"""
        return SmartRoutingEngine()

    @pytest.fixture
    def mock_twilio_client(self):
        """Create mock Enhanced Twilio client"""
        return Mock()

    def test_initialization(self, routing_engine):
        """Test routing engine initialization"""
        assert routing_engine is not None
        assert len(routing_engine.country_data) > 0
        assert len(routing_engine.cost_matrix) > 0
        assert "US" in routing_engine.country_data
        assert "GB" in routing_engine.country_data

    def test_country_data_structure(self, routing_engine):
        """Test country data structure and content"""
        us_info = routing_engine.country_data["US"]

        assert isinstance(us_info, CountryInfo)
        assert us_info.code == "US"
        assert us_info.name == "United States"
        assert us_info.continent == "North America"
        assert us_info.calling_code == "+1"
        assert us_info.currency == "USD"
        assert isinstance(us_info.latitude, float)
        assert isinstance(us_info.longitude, float)

    def test_calculate_distance_same_country(self, routing_engine):
        """Test distance calculation for same country"""
        distance = routing_engine.calculate_distance("US", "US")
        assert distance == 0.0

    def test_calculate_distance_different_countries(self, routing_engine):
        """Test distance calculation between different countries"""
        distance = routing_engine.calculate_distance("US", "CA")

        # US and Canada should be relatively close
        assert 0 < distance < 5000  # Less than 5000 km
        assert isinstance(distance, float)

    def test_calculate_distance_invalid_country(self, routing_engine):
        """Test distance calculation with invalid country"""
        distance = routing_engine.calculate_distance("US", "INVALID")
        assert distance == float("inf")

        distance = routing_engine.calculate_distance("INVALID", "US")
        assert distance == float("inf")

    def test_calculate_distance_haversine_formula(self, routing_engine):
        """Test that distance calculation uses proper Haversine formula"""
        # Test known distance: New York to London is approximately 5585 km
        distance = routing_engine.calculate_distance("US", "GB")

        # Should be within reasonable range (allowing for country center approximation)
        assert 4000 < distance < 8000

    def test_get_country_from_number_us(self, routing_engine):
        """Test country detection for US number"""
        country = routing_engine.get_country_from_number("+1234567890")
        assert country == "US"

    def test_get_country_from_number_uk(self, routing_engine):
        """Test country detection for UK number"""
        country = routing_engine.get_country_from_number("+447700000000")
        assert country == "GB"

    def test_get_country_from_number_invalid(self, routing_engine):
        """Test country detection for invalid number"""
        country = routing_engine.get_country_from_number("invalid")
        assert country is None

    def test_get_closest_countries(self, routing_engine):
        """Test getting closest countries"""
        closest = routing_engine.get_closest_countries("US", limit=3)

        assert len(closest) == 3
        assert all(isinstance(item, tuple) for item in closest)
        assert all(len(item) == 2 for item in closest)

        # Results should be sorted by distance
        distances = [item[1] for item in closest]
        assert distances == sorted(distances)

        # Canada should be close to US
        countries = [item[0] for item in closest]
        assert "CA" in countries

    def test_get_closest_countries_invalid(self, routing_engine):
        """Test getting closest countries for invalid country"""
        closest = routing_engine.get_closest_countries("INVALID")
        assert closest == []

    def test_calculate_delivery_score_domestic(self, routing_engine):
        """Test delivery score for domestic communication"""
        score = routing_engine.calculate_delivery_score("US", "US")
        assert score == 1.0

    def test_calculate_delivery_score_international(self, routing_engine):
        """Test delivery score for international communication"""
        score = routing_engine.calculate_delivery_score("US", "GB")

        assert 0.0 <= score <= 1.0
        assert score < 1.0  # Should be less than domestic

    def test_calculate_delivery_score_same_continent(self, routing_engine):
        """Test delivery score bonus for same continent"""
        us_ca_score = routing_engine.calculate_delivery_score("US", "CA")
        us_gb_score = routing_engine.calculate_delivery_score("US", "GB")

        # US-CA (same continent) should have higher score than US-GB (different continent)
        assert us_ca_score > us_gb_score

    def test_calculate_cost_comparison_domestic(self, routing_engine):
        """Test cost calculation for domestic communication"""
        costs = routing_engine.calculate_cost_comparison(
            "US", "US", message_count=10, call_minutes=5
        )

        assert "sms_cost" in costs
        assert "voice_cost" in costs
        assert "total_cost" in costs
        assert "per_sms" in costs
        assert "per_minute" in costs

        assert costs["sms_cost"] == costs["per_sms"] * 10
        assert costs["voice_cost"] == costs["per_minute"] * 5
        assert costs["total_cost"] == costs["sms_cost"] + costs["voice_cost"]

    def test_calculate_cost_comparison_international(self, routing_engine):
        """Test cost calculation for international communication"""
        domestic_costs = routing_engine.calculate_cost_comparison(
            "US", "US", message_count=1
        )
        international_costs = routing_engine.calculate_cost_comparison(
            "US", "GB", message_count=1
        )

        # International should be more expensive than domestic
        assert international_costs["per_sms"] > domestic_costs["per_sms"]
        assert international_costs["per_minute"] > domestic_costs["per_minute"]

    def test_calculate_cost_comparison_invalid_country(self, routing_engine):
        """Test cost calculation with invalid country"""
        costs = routing_engine.calculate_cost_comparison("INVALID", "US")

        assert costs["sms_cost"] == 0.0
        assert costs["voice_cost"] == 0.0
        assert costs["total_cost"] == 0.0

    @pytest.mark.asyncio
    async def test_evaluate_number_option(self, routing_engine):
        """Test evaluating a number option"""
        option = await routing_engine._evaluate_number_option(
            phone_number="+1234567890",
            from_country="US",
            to_country="GB",
            message_count=5,
            call_minutes=2,
            is_owned=True,
        )

        assert option is not None
        assert isinstance(option, NumberOption)
        assert option.phone_number == "+1234567890"
        assert option.country_code == "US"
        assert option.monthly_cost == 0.0  # Owned number
        assert option.sms_cost > 0
        assert option.voice_cost > 0
        assert 0 <= option.delivery_score <= 1.0
        assert 0 <= option.total_score <= 1.0
        assert option.distance_km > 0

    @pytest.mark.asyncio
    async def test_evaluate_number_option_not_owned(self, routing_engine):
        """Test evaluating a number option that's not owned"""
        option = await routing_engine._evaluate_number_option(
            phone_number="+447700000000",
            from_country="GB",
            to_country="US",
            message_count=1,
            call_minutes=0,
            is_owned=False,
        )

        assert option is not None
        assert option.monthly_cost > 0  # Not owned, should have monthly cost

    @pytest.mark.asyncio
    async def test_create_hypothetical_option(self, routing_engine):
        """Test creating hypothetical number option"""
        option = await routing_engine._create_hypothetical_option(
            from_country="GB", to_country="US", message_count=1, call_minutes=0
        )

        assert option is not None
        assert option.country_code == "GB"
        assert option.phone_number.startswith("+44")
        assert option.monthly_cost > 0  # Hypothetical numbers are not owned

    @pytest.mark.asyncio
    async def test_suggest_optimal_numbers_basic(self, routing_engine):
        """Test basic optimal number suggestion"""
        recommendation = await routing_engine.suggest_optimal_numbers(
            destination_number="+447700000000",  # UK number
            user_numbers=["+1234567890"],  # US number
            message_count=1,
        )

        assert isinstance(recommendation, RoutingRecommendation)
        assert recommendation.destination_number == "+447700000000"
        assert recommendation.destination_country == "GB"
        assert recommendation.primary_option is not None
        assert isinstance(recommendation.alternative_options, list)
        assert len(recommendation.recommendation_reason) > 0
        assert recommendation.cost_savings >= 0
        assert recommendation.delivery_improvement >= 0

    @pytest.mark.asyncio
    async def test_suggest_optimal_numbers_domestic_preference(self, routing_engine):
        """Test that domestic numbers are preferred"""
        recommendation = await routing_engine.suggest_optimal_numbers(
            destination_number="+447700000000",  # UK number
            user_numbers=["+447700000001"],  # UK number (domestic)
            message_count=1,
        )

        # Primary option should be the domestic number or a UK number
        assert (
            recommendation.primary_option.country_code == "GB"
            or recommendation.primary_option.phone_number == "+447700000001"
        )

    @pytest.mark.asyncio
    async def test_suggest_optimal_numbers_invalid_destination(self, routing_engine):
        """Test optimal number suggestion with invalid destination"""
        with pytest.raises(ValueError, match="Could not determine country"):
            await routing_engine.suggest_optimal_numbers(
                destination_number="invalid", user_numbers=["+1234567890"]
            )

    @pytest.mark.asyncio
    async def test_get_routing_analytics_basic(self, routing_engine):
        """Test basic routing analytics"""
        analytics = await routing_engine.get_routing_analytics(
            user_numbers=["+1234567890", "+447700000000"],
            recent_destinations=["+33600000000", "+33600000001", "+33600000002"],
        )

        assert "user_numbers" in analytics
        assert "countries_covered" in analytics
        assert "recent_destinations" in analytics
        assert "destination_countries" in analytics
        assert "optimization_opportunities" in analytics

        assert analytics["user_numbers"] == 2
        assert analytics["recent_destinations"] == 3
        assert "US" in analytics["countries_covered"]
        assert "GB" in analytics["countries_covered"]
        assert "FR" in analytics["destination_countries"]

    @pytest.mark.asyncio
    async def test_get_routing_analytics_optimization_suggestions(self, routing_engine):
        """Test routing analytics optimization suggestions"""
        # Simulate frequent calls to France (3+ times)
        french_numbers = [
            "+33600000001",
            "+33600000002",
            "+33600000003",
            "+33600000004",
        ]

        analytics = await routing_engine.get_routing_analytics(
            user_numbers=["+1234567890"],  # Only US number
            recent_destinations=french_numbers,
        )

        # Should suggest getting a French number
        opportunities = analytics["optimization_opportunities"]
        assert len(opportunities) > 0

        french_suggestion = next(
            (opp for opp in opportunities if opp["country"] == "FR"), None
        )
        assert french_suggestion is not None
        assert french_suggestion["type"] == "local_number_suggestion"
        assert french_suggestion["frequency"] == 4
        assert french_suggestion["potential_savings"] > 0

    def test_generate_recommendation_reason_domestic(self, routing_engine):
        """Test recommendation reason generation for domestic number"""
        option = NumberOption(
            phone_number="+447700000000",
            country_code="GB",
            country_name="United Kingdom",
            area_code=None,
            monthly_cost=0.0,
            sms_cost=0.01,
            voice_cost=0.02,
            distance_km=0.0,
            delivery_score=1.0,
            total_score=0.9,
            capabilities={"sms": True, "voice": True},
            provider="twilio",
        )

        reason = routing_engine._generate_recommendation_reason(
            option, "GB", cost_savings=0.05, delivery_improvement=0.2
        )

        assert "domestic number provides best delivery rates" in reason
        assert "uses existing owned number" in reason

    def test_generate_recommendation_reason_cost_savings(self, routing_engine):
        """Test recommendation reason generation with cost savings"""
        option = NumberOption(
            phone_number="+33600000000",
            country_code="FR",
            country_name="France",
            area_code=None,
            monthly_cost=1.0,
            sms_cost=0.02,
            voice_cost=0.05,
            distance_km=1000.0,
            delivery_score=0.8,
            total_score=0.7,
            capabilities={"sms": True, "voice": True},
            provider="twilio",
        )

        reason = routing_engine._generate_recommendation_reason(
            option, "GB", cost_savings=0.05, delivery_improvement=0.1
        )

        assert "saves $0.050" in reason
        assert "improves delivery score" in reason


class TestSmartRoutingEngineFactory:
    """Test Smart Routing Engine factory function"""

    def test_create_smart_routing_engine_success(self):
        """Test successful routing engine creation"""
        engine = create_smart_routing_engine()

        assert engine is not None
        assert isinstance(engine, SmartRoutingEngine)

    def test_create_smart_routing_engine_with_twilio_client(self):
        """Test routing engine creation with Twilio client"""
        mock_client = Mock()
        engine = create_smart_routing_engine(mock_client)

        assert engine is not None
        assert engine.twilio_client == mock_client

    def test_create_smart_routing_engine_exception(self):
        """Test routing engine creation with exception"""
        with patch(
            "services.smart_routing_engine.SmartRoutingEngine",
            side_effect=Exception("Test error"),
        ):
            with pytest.raises(Exception, match="Test error"):
                create_smart_routing_engine()


class TestCountryInfo:
    """Test CountryInfo dataclass"""

    def test_country_info_creation(self):
        """Test CountryInfo creation"""
        info = CountryInfo(
            code="US",
            name="United States",
            continent="North America",
            latitude=39.8283,
            longitude=-98.5795,
            calling_code="+1",
            currency="USD",
            timezone_offset=-5.0,
        )

        assert info.code == "US"
        assert info.name == "United States"
        assert info.continent == "North America"
        assert info.latitude == 39.8283
        assert info.longitude == -98.5795
        assert info.calling_code == "+1"
        assert info.currency == "USD"
        assert info.timezone_offset == -5.0


class TestNumberOption:
    """Test NumberOption dataclass"""

    def test_number_option_creation(self):
        """Test NumberOption creation"""
        option = NumberOption(
            phone_number="+1234567890",
            country_code="US",
            country_name="United States",
            area_code="234",
            monthly_cost=1.0,
            sms_cost=0.0075,
            voice_cost=0.02,
            distance_km=0.0,
            delivery_score=1.0,
            total_score=0.95,
            capabilities={"sms": True, "voice": True, "mms": True},
            provider="twilio",
        )

        assert option.phone_number == "+1234567890"
        assert option.country_code == "US"
        assert option.country_name == "United States"
        assert option.area_code == "234"
        assert option.monthly_cost == 1.0
        assert option.sms_cost == 0.0075
        assert option.voice_cost == 0.02
        assert option.distance_km == 0.0
        assert option.delivery_score == 1.0
        assert option.total_score == 0.95
        assert option.capabilities["sms"] == True
        assert option.provider == "twilio"


class TestRoutingRecommendation:
    """Test RoutingRecommendation dataclass"""

    def test_routing_recommendation_creation(self):
        """Test RoutingRecommendation creation"""
        primary_option = NumberOption(
            phone_number="+1234567890",
            country_code="US",
            country_name="United States",
            area_code=None,
            monthly_cost=0.0,
            sms_cost=0.0075,
            voice_cost=0.02,
            distance_km=0.0,
            delivery_score=1.0,
            total_score=0.95,
            capabilities={"sms": True, "voice": True},
            provider="twilio",
        )

        recommendation = RoutingRecommendation(
            destination_number="+447700000000",
            destination_country="GB",
            primary_option=primary_option,
            alternative_options=[],
            cost_savings=0.05,
            delivery_improvement=0.2,
            recommendation_reason="Test reason",
        )

        assert recommendation.destination_number == "+447700000000"
        assert recommendation.destination_country == "GB"
        assert recommendation.primary_option == primary_option
        assert recommendation.alternative_options == []
        assert recommendation.cost_savings == 0.05
        assert recommendation.delivery_improvement == 0.2
        assert recommendation.recommendation_reason == "Test reason"


if __name__ == "__main__":
    pytest.main([__file__])

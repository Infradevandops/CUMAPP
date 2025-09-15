#!/usr/bin/env python3
"""
Smart Routing API Endpoints
Provides intelligent number selection, cost optimization, and routing recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from core.database import get_db
from auth.jwt_handler import verify_jwt_token
from models.user_models import User
from services.smart_routing_engine import (
    SmartRoutingEngine,
    create_smart_routing_engine,
)
from enhanced_twilio_client import EnhancedTwilioClient

# Initialize router and security
router = APIRouter(prefix="/api/smart-routing", tags=["smart-routing"])
security = HTTPBearer()


# Pydantic models for request/response
class RoutingRequest(BaseModel):
    destination_number: str = Field(..., description="Target phone number")
    user_numbers: Optional[List[str]] = Field(
        default=[], description="User's existing numbers"
    )
    message_count: int = Field(
        default=1, ge=1, description="Expected number of SMS messages"
    )
    call_minutes: int = Field(
        default=0, ge=0, description="Expected call duration in minutes"
    )


class NumberOptionResponse(BaseModel):
    phone_number: str
    country_code: str
    country_name: str
    area_code: Optional[str]
    monthly_cost: float
    sms_cost: float
    voice_cost: float
    distance_km: float
    delivery_score: float
    total_score: float
    capabilities: Dict[str, bool]
    provider: str


class RoutingRecommendationResponse(BaseModel):
    destination_number: str
    destination_country: str
    primary_option: NumberOptionResponse
    alternative_options: List[NumberOptionResponse]
    cost_savings: float
    delivery_improvement: float
    recommendation_reason: str


class CostComparisonRequest(BaseModel):
    from_country: str = Field(..., description="Sender country code")
    to_country: str = Field(..., description="Recipient country code")
    message_count: int = Field(default=1, ge=1, description="Number of SMS messages")
    call_minutes: int = Field(default=0, ge=0, description="Call duration in minutes")


class CostComparisonResponse(BaseModel):
    from_country: str
    to_country: str
    sms_cost: float
    voice_cost: float
    total_cost: float
    per_sms: float
    per_minute: float


class DistanceRequest(BaseModel):
    country1: str = Field(..., description="First country code")
    country2: str = Field(..., description="Second country code")


class DistanceResponse(BaseModel):
    country1: str
    country2: str
    distance_km: float
    delivery_score: float


class AnalyticsRequest(BaseModel):
    user_numbers: List[str] = Field(..., description="User's phone numbers")
    recent_destinations: List[str] = Field(
        ..., description="Recent destination numbers"
    )


class OptimizationOpportunity(BaseModel):
    type: str
    country: str
    country_name: str
    frequency: int
    potential_savings: float
    reason: str


class RoutingAnalyticsResponse(BaseModel):
    user_numbers: int
    countries_covered: List[str]
    recent_destinations: int
    destination_countries: List[str]
    optimization_opportunities: List[OptimizationOpportunity]
    cost_analysis: Dict[str, Any]
    coverage_gaps: List[str]


# Dependency to get current user from JWT token
async def get_current_user(
    token: str = Depends(security), db: Session = Depends(get_db)
) -> User:
    """Extract and validate user from JWT token"""
    try:
        payload = verify_jwt_token(token.credentials)
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")


# Dependency to get smart routing engine
def get_routing_engine() -> SmartRoutingEngine:
    """Get smart routing engine instance"""
    try:
        from main import enhanced_twilio_client

        return create_smart_routing_engine(enhanced_twilio_client)
    except Exception as e:
        raise HTTPException(
            status_code=503, detail="Smart routing service not available"
        )


@router.post("/recommend", response_model=RoutingRecommendationResponse)
async def get_routing_recommendation(
    request: RoutingRequest,
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Get intelligent routing recommendation for optimal number selection
    """
    try:
        recommendation = await routing_engine.suggest_optimal_numbers(
            destination_number=request.destination_number,
            user_numbers=request.user_numbers,
            message_count=request.message_count,
            call_minutes=request.call_minutes,
        )

        # Convert to response format
        def convert_option(option):
            return NumberOptionResponse(
                phone_number=option.phone_number,
                country_code=option.country_code,
                country_name=option.country_name,
                area_code=option.area_code,
                monthly_cost=option.monthly_cost,
                sms_cost=option.sms_cost,
                voice_cost=option.voice_cost,
                distance_km=option.distance_km,
                delivery_score=option.delivery_score,
                total_score=option.total_score,
                capabilities=option.capabilities,
                provider=option.provider,
            )

        response = RoutingRecommendationResponse(
            destination_number=recommendation.destination_number,
            destination_country=recommendation.destination_country,
            primary_option=convert_option(recommendation.primary_option),
            alternative_options=[
                convert_option(opt) for opt in recommendation.alternative_options
            ],
            cost_savings=recommendation.cost_savings,
            delivery_improvement=recommendation.delivery_improvement,
            recommendation_reason=recommendation.recommendation_reason,
        )

        return response

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate recommendation: {str(e)}"
        )


@router.post("/cost-comparison", response_model=CostComparisonResponse)
async def calculate_cost_comparison(
    request: CostComparisonRequest,
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Calculate cost comparison between countries for SMS and voice
    """
    try:
        cost_info = routing_engine.calculate_cost_comparison(
            from_country=request.from_country,
            to_country=request.to_country,
            message_count=request.message_count,
            call_minutes=request.call_minutes,
        )

        response = CostComparisonResponse(
            from_country=request.from_country,
            to_country=request.to_country,
            sms_cost=cost_info["sms_cost"],
            voice_cost=cost_info["voice_cost"],
            total_cost=cost_info["total_cost"],
            per_sms=cost_info["per_sms"],
            per_minute=cost_info["per_minute"],
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate costs: {str(e)}"
        )


@router.post("/distance", response_model=DistanceResponse)
async def calculate_distance(
    request: DistanceRequest,
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Calculate distance and delivery score between two countries
    """
    try:
        distance = routing_engine.calculate_distance(request.country1, request.country2)
        delivery_score = routing_engine.calculate_delivery_score(
            request.country1, request.country2
        )

        response = DistanceResponse(
            country1=request.country1,
            country2=request.country2,
            distance_km=distance,
            delivery_score=delivery_score,
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate distance: {str(e)}"
        )


@router.get("/country/{phone_number}")
async def detect_country(
    phone_number: str = Path(..., description="Phone number to analyze"),
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Detect country from phone number
    """
    try:
        country_code = routing_engine.get_country_from_number(phone_number)

        if not country_code:
            raise HTTPException(
                status_code=400, detail="Could not determine country from phone number"
            )

        country_info = routing_engine.country_data.get(country_code)

        return {
            "phone_number": phone_number,
            "country_code": country_code,
            "country_name": country_info.name if country_info else "Unknown",
            "calling_code": country_info.calling_code if country_info else None,
            "continent": country_info.continent if country_info else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to detect country: {str(e)}"
        )


@router.get("/closest/{country_code}")
async def get_closest_countries(
    country_code: str = Path(
        ..., description="Country code to find closest countries for"
    ),
    limit: int = Query(
        5, ge=1, le=20, description="Maximum number of countries to return"
    ),
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Get countries closest to the specified country
    """
    try:
        closest_countries = routing_engine.get_closest_countries(country_code, limit)

        results = []
        for country, distance in closest_countries:
            country_info = routing_engine.country_data.get(country)
            results.append(
                {
                    "country_code": country,
                    "country_name": country_info.name if country_info else "Unknown",
                    "distance_km": distance,
                    "continent": country_info.continent if country_info else None,
                    "calling_code": country_info.calling_code if country_info else None,
                }
            )

        return {
            "target_country": country_code,
            "closest_countries": results,
            "count": len(results),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get closest countries: {str(e)}"
        )


@router.post("/analytics", response_model=RoutingAnalyticsResponse)
async def get_routing_analytics(
    request: AnalyticsRequest,
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Generate routing analytics and optimization suggestions
    """
    try:
        analytics = await routing_engine.get_routing_analytics(
            user_numbers=request.user_numbers,
            recent_destinations=request.recent_destinations,
        )

        # Convert optimization opportunities to response format
        opportunities = [
            OptimizationOpportunity(
                type=opp["type"],
                country=opp["country"],
                country_name=opp["country_name"],
                frequency=opp["frequency"],
                potential_savings=opp["potential_savings"],
                reason=opp["reason"],
            )
            for opp in analytics["optimization_opportunities"]
        ]

        response = RoutingAnalyticsResponse(
            user_numbers=analytics["user_numbers"],
            countries_covered=analytics["countries_covered"],
            recent_destinations=analytics["recent_destinations"],
            destination_countries=analytics["destination_countries"],
            optimization_opportunities=opportunities,
            cost_analysis=analytics["cost_analysis"],
            coverage_gaps=analytics["coverage_gaps"],
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate analytics: {str(e)}"
        )


@router.get("/countries")
async def list_supported_countries(
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    List all supported countries with their information
    """
    try:
        countries = []
        for code, info in routing_engine.country_data.items():
            countries.append(
                {
                    "country_code": code,
                    "country_name": info.name,
                    "continent": info.continent,
                    "calling_code": info.calling_code,
                    "currency": info.currency,
                    "timezone_offset": info.timezone_offset,
                }
            )

        # Sort by country name
        countries.sort(key=lambda x: x["country_name"])

        return {"countries": countries, "count": len(countries)}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to list countries: {str(e)}"
        )


@router.get("/health")
async def routing_health_check():
    """
    Health check endpoint for smart routing service
    """
    try:
        routing_engine = get_routing_engine()

        # Test basic functionality
        test_distance = routing_engine.calculate_distance("US", "CA")
        test_country = routing_engine.get_country_from_number("+1234567890")

        return {
            "status": "healthy",
            "service": "smart_routing_engine",
            "countries_loaded": len(routing_engine.country_data),
            "test_distance_us_ca": test_distance,
            "test_country_detection": test_country,
            "timestamp": "2024-01-01T00:00:00Z",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "smart_routing_engine",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z",
        }

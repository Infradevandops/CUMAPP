#!/usr/bin/env python3
"""
Number Management API Endpoints for CumApp Communication Platform
Provides comprehensive phone number search, purchase, management, and cost optimization
"""
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Path
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
import asyncio

from core.database import get_db
from auth.jwt_handler import verify_jwt_token
from models.user_models import User
from services.smart_routing_engine import SmartRoutingEngine
from enhanced_twilio_client import EnhancedTwilioClient, create_enhanced_twilio_client

logger = logging.getLogger(__name__)

# Initialize router and security
router = APIRouter(prefix="/api/numbers", tags=["Number Management"])
security = HTTPBearer()

# Request/Response Models


class NumberSearchRequest(BaseModel):
    """Request model for number search"""

    country_code: str = Field(..., description="Country code (e.g., US, CA, GB)")
    area_code: Optional[str] = Field(None, description="Area code preference")
    number_type: str = Field(
        "local", description="Number type (local, toll_free, mobile)"
    )
    capabilities: List[str] = Field(
        ["sms", "voice"], description="Required capabilities"
    )
    limit: int = Field(10, ge=1, le=50, description="Maximum numbers to return")
    contains: Optional[str] = Field(
        None, description="Number must contain these digits"
    )
    exclude_patterns: Optional[List[str]] = Field(
        None, description="Patterns to exclude"
    )

    @validator("country_code")
    def validate_country_code(cls, v):
        if not v or len(v) != 2:
            raise ValueError("Country code must be 2 characters (e.g., US, CA)")
        return v.upper()

    @validator("number_type")
    def validate_number_type(cls, v):
        valid_types = ["local", "toll_free", "mobile"]
        if v not in valid_types:
            raise ValueError(f"Number type must be one of: {valid_types}")
        return v

    @validator("capabilities")
    def validate_capabilities(cls, v):
        valid_capabilities = ["sms", "voice", "mms", "fax"]
        for cap in v:
            if cap not in valid_capabilities:
                raise ValueError(
                    f"Invalid capability: {cap}. Must be one of: {valid_capabilities}"
                )
        return v


class NumberPurchaseRequest(BaseModel):
    """Request model for number purchase"""

    phone_number: str = Field(..., description="Phone number to purchase")
    friendly_name: Optional[str] = Field(
        None, description="Friendly name for the number"
    )
    auto_renew: bool = Field(True, description="Enable automatic renewal")
    usage_plan: str = Field(
        "standard", description="Usage plan (basic, standard, premium)"
    )
    webhook_url: Optional[str] = Field(
        None, description="Webhook URL for incoming messages/calls"
    )

    @validator("phone_number")
    def validate_phone_number(cls, v):
        if not v or not v.startswith("+"):
            raise ValueError("Phone number must be in E.164 format (+1234567890)")
        return v

    @validator("usage_plan")
    def validate_usage_plan(cls, v):
        valid_plans = ["basic", "standard", "premium"]
        if v not in valid_plans:
            raise ValueError(f"Usage plan must be one of: {valid_plans}")
        return v


class NumberUpdateRequest(BaseModel):
    """Request model for number updates"""

    friendly_name: Optional[str] = Field(None, description="Update friendly name")
    auto_renew: Optional[bool] = Field(None, description="Update auto-renewal setting")
    usage_plan: Optional[str] = Field(None, description="Update usage plan")
    webhook_url: Optional[str] = Field(None, description="Update webhook URL")
    status: Optional[str] = Field(None, description="Update number status")

    @validator("usage_plan")
    def validate_usage_plan(cls, v):
        if v is not None:
            valid_plans = ["basic", "standard", "premium"]
            if v not in valid_plans:
                raise ValueError(f"Usage plan must be one of: {valid_plans}")
        return v

    @validator("status")
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ["active", "inactive", "suspended"]
            if v not in valid_statuses:
                raise ValueError(f"Status must be one of: {valid_statuses}")
        return v


class CostCalculationRequest(BaseModel):
    """Request model for cost calculation"""

    from_country: str = Field(..., description="Origin country code")
    to_country: str = Field(..., description="Destination country code")
    message_count: int = Field(1, ge=1, description="Number of messages")
    call_minutes: int = Field(0, ge=0, description="Call duration in minutes")
    number_type: str = Field("local", description="Number type for calculation")

    @validator("from_country", "to_country")
    def validate_country_codes(cls, v):
        if not v or len(v) != 2:
            raise ValueError("Country code must be 2 characters")
        return v.upper()


class NumberOptimizationRequest(BaseModel):
    """Request model for number optimization"""

    target_countries: List[str] = Field(
        ..., description="Target countries for optimization"
    )
    monthly_message_volume: int = Field(
        100, ge=1, description="Expected monthly message volume"
    )
    monthly_call_minutes: int = Field(
        60, ge=0, description="Expected monthly call minutes"
    )
    budget_limit: Optional[float] = Field(None, description="Monthly budget limit")
    optimization_goal: str = Field(
        "cost", description="Optimization goal (cost, delivery, coverage)"
    )

    @validator("target_countries")
    def validate_target_countries(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one target country is required")
        return [country.upper() for country in v]

    @validator("optimization_goal")
    def validate_optimization_goal(cls, v):
        valid_goals = ["cost", "delivery", "coverage"]
        if v not in valid_goals:
            raise ValueError(f"Optimization goal must be one of: {valid_goals}")
        return v


# Response Models


class AvailableNumberResponse(BaseModel):
    """Response model for available numbers"""

    phone_number: str
    friendly_name: str
    country_code: str
    area_code: Optional[str]
    number_type: str
    capabilities: List[str]
    monthly_cost: float
    setup_cost: float
    locality: Optional[str]
    region: Optional[str]
    iso_country: str
    beta: bool


class PurchasedNumberResponse(BaseModel):
    """Response model for purchased numbers"""

    phone_number: str
    friendly_name: str
    country_code: str
    capabilities: List[str]
    status: str
    monthly_cost: float
    usage_plan: str
    auto_renew: bool
    purchased_at: datetime
    next_billing_date: datetime
    webhook_url: Optional[str]


class NumberUsageResponse(BaseModel):
    """Response model for number usage statistics"""

    phone_number: str
    period_start: datetime
    period_end: datetime
    messages_sent: int
    messages_received: int
    calls_made: int
    calls_received: int
    total_cost: float
    cost_breakdown: Dict[str, float]
    usage_by_country: Dict[str, int]


class CostEstimateResponse(BaseModel):
    """Response model for cost estimates"""

    from_country: str
    to_country: str
    message_cost: float
    call_cost_per_minute: float
    total_estimated_cost: float
    currency: str
    cost_breakdown: Dict[str, float]
    recommendations: List[str]


class OptimizationRecommendationResponse(BaseModel):
    """Response model for optimization recommendations"""

    current_setup: Dict[str, Any]
    recommended_setup: Dict[str, Any]
    potential_savings: float
    coverage_improvement: float
    delivery_improvement: float
    implementation_steps: List[str]
    cost_comparison: Dict[str, float]


class NumberAnalyticsResponse(BaseModel):
    """Response model for number analytics"""

    total_numbers: int
    active_numbers: int
    total_monthly_cost: float
    usage_efficiency: float
    top_performing_numbers: List[Dict[str, Any]]
    underutilized_numbers: List[Dict[str, Any]]
    cost_trends: Dict[str, List[float]]
    recommendations: List[str]


# Dependencies


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
        logger.warning(f"Authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")


def get_twilio_client() -> EnhancedTwilioClient:
    """Get Enhanced Twilio client instance"""
    try:
        return create_enhanced_twilio_client()
    except Exception as e:
        logger.error(f"Failed to create Twilio client: {e}")
        raise HTTPException(status_code=503, detail="Twilio service unavailable")


def get_routing_engine(
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
) -> SmartRoutingEngine:
    """Get Smart Routing Engine instance"""
    try:
        return SmartRoutingEngine(twilio_client)
    except Exception as e:
        logger.error(f"Failed to create routing engine: {e}")
        raise HTTPException(status_code=503, detail="Routing service unavailable")


# API Endpoints


@router.post("/search", response_model=List[AvailableNumberResponse])
async def search_available_numbers(
    request: NumberSearchRequest,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Search for available phone numbers with filtering options

    Args:
        request: Number search request
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        List[AvailableNumberResponse]: Available numbers
    """
    try:
        # Search for available numbers
        available_numbers = await twilio_client.search_available_numbers(
            country_code=request.country_code,
            area_code=request.area_code,
            number_type=request.number_type,
            capabilities=request.capabilities,
            limit=request.limit,
            contains=request.contains,
            exclude_patterns=request.exclude_patterns,
        )

        # Convert to response format
        return [
            AvailableNumberResponse(
                phone_number=num["phone_number"],
                friendly_name=num["friendly_name"],
                country_code=num["country_code"],
                area_code=num.get("area_code"),
                number_type=num["number_type"],
                capabilities=num["capabilities"],
                monthly_cost=num["monthly_cost"],
                setup_cost=num.get("setup_cost", 0.0),
                locality=num.get("locality"),
                region=num.get("region"),
                iso_country=num["iso_country"],
                beta=num.get("beta", False),
            )
            for num in available_numbers
        ]

    except ValueError as e:
        logger.warning(f"Invalid search request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to search numbers: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to search available numbers"
        )


@router.post("/purchase", response_model=PurchasedNumberResponse)
async def purchase_phone_number(
    request: NumberPurchaseRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Purchase a phone number for the user

    Args:
        request: Number purchase request
        background_tasks: Background tasks for async processing
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        PurchasedNumberResponse: Purchased number details
    """
    try:
        # Purchase the number
        purchased_number = await twilio_client.purchase_phone_number(
            user_id=current_user.id,
            phone_number=request.phone_number,
            friendly_name=request.friendly_name,
            auto_renew=request.auto_renew,
            usage_plan=request.usage_plan,
            webhook_url=request.webhook_url,
        )

        # Add background task for setup
        background_tasks.add_task(
            setup_purchased_number,
            purchased_number["phone_number"],
            current_user.id,
            request.webhook_url,
        )

        return PurchasedNumberResponse(
            phone_number=purchased_number["phone_number"],
            friendly_name=purchased_number["friendly_name"],
            country_code=purchased_number["country_code"],
            capabilities=purchased_number["capabilities"],
            status=purchased_number["status"],
            monthly_cost=purchased_number["monthly_cost"],
            usage_plan=purchased_number["usage_plan"],
            auto_renew=purchased_number["auto_renew"],
            purchased_at=purchased_number["purchased_at"],
            next_billing_date=purchased_number["next_billing_date"],
            webhook_url=purchased_number.get("webhook_url"),
        )

    except ValueError as e:
        logger.warning(f"Invalid purchase request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to purchase number: {e}")
        raise HTTPException(status_code=500, detail="Failed to purchase phone number")


@router.get("/owned", response_model=List[PurchasedNumberResponse])
async def get_owned_numbers(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    country_filter: Optional[str] = Query(None, description="Filter by country"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Get list of user's owned phone numbers

    Args:
        status_filter: Filter by number status
        country_filter: Filter by country code
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        List[PurchasedNumberResponse]: Owned numbers
    """
    try:
        # Get user's numbers
        owned_numbers = await twilio_client.get_user_numbers(
            user_id=current_user.id,
            status_filter=status_filter,
            country_filter=country_filter,
        )

        return [
            PurchasedNumberResponse(
                phone_number=num["phone_number"],
                friendly_name=num["friendly_name"],
                country_code=num["country_code"],
                capabilities=num["capabilities"],
                status=num["status"],
                monthly_cost=num["monthly_cost"],
                usage_plan=num["usage_plan"],
                auto_renew=num["auto_renew"],
                purchased_at=num["purchased_at"],
                next_billing_date=num["next_billing_date"],
                webhook_url=num.get("webhook_url"),
            )
            for num in owned_numbers
        ]

    except Exception as e:
        logger.error(f"Failed to get owned numbers: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve owned numbers")


@router.put("/{phone_number}", response_model=PurchasedNumberResponse)
async def update_phone_number(
    request: NumberUpdateRequest,
    phone_number: str = Path(..., description="Phone number to update"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Update phone number settings

    Args:
        phone_number: Phone number to update
        request: Update request
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        PurchasedNumberResponse: Updated number details
    """
    try:
        # Update the number
        updated_number = await twilio_client.update_phone_number(
            user_id=current_user.id,
            phone_number=phone_number,
            friendly_name=request.friendly_name,
            auto_renew=request.auto_renew,
            usage_plan=request.usage_plan,
            webhook_url=request.webhook_url,
            status=request.status,
        )

        return PurchasedNumberResponse(
            phone_number=updated_number["phone_number"],
            friendly_name=updated_number["friendly_name"],
            country_code=updated_number["country_code"],
            capabilities=updated_number["capabilities"],
            status=updated_number["status"],
            monthly_cost=updated_number["monthly_cost"],
            usage_plan=updated_number["usage_plan"],
            auto_renew=updated_number["auto_renew"],
            purchased_at=updated_number["purchased_at"],
            next_billing_date=updated_number["next_billing_date"],
            webhook_url=updated_number.get("webhook_url"),
        )

    except ValueError as e:
        logger.warning(f"Invalid update request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update number: {e}")
        raise HTTPException(status_code=500, detail="Failed to update phone number")


@router.delete("/{phone_number}")
async def release_phone_number(
    phone_number: str = Path(..., description="Phone number to release"),
    force: bool = Query(False, description="Force release even if active"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Release (delete) a phone number

    Args:
        phone_number: Phone number to release
        force: Force release even if active
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        Dict: Release confirmation
    """
    try:
        # Release the number
        result = await twilio_client.release_phone_number(
            user_id=current_user.id, phone_number=phone_number, force=force
        )

        return {
            "message": "Phone number released successfully",
            "phone_number": phone_number,
            "released_at": datetime.utcnow(),
            "refund_amount": result.get("refund_amount", 0.0),
        }

    except ValueError as e:
        logger.warning(f"Cannot release number: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to release number: {e}")
        raise HTTPException(status_code=500, detail="Failed to release phone number")


@router.get("/{phone_number}/usage", response_model=NumberUsageResponse)
async def get_number_usage(
    phone_number: str = Path(..., description="Phone number"),
    period_days: int = Query(30, ge=1, le=365, description="Usage period in days"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Get usage statistics for a phone number

    Args:
        phone_number: Phone number
        period_days: Usage period in days
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        NumberUsageResponse: Usage statistics
    """
    try:
        # Get usage statistics
        usage_stats = await twilio_client.get_number_usage_stats(
            user_id=current_user.id, phone_number=phone_number, period_days=period_days
        )

        return NumberUsageResponse(
            phone_number=phone_number,
            period_start=usage_stats["period_start"],
            period_end=usage_stats["period_end"],
            messages_sent=usage_stats["messages_sent"],
            messages_received=usage_stats["messages_received"],
            calls_made=usage_stats["calls_made"],
            calls_received=usage_stats["calls_received"],
            total_cost=usage_stats["total_cost"],
            cost_breakdown=usage_stats["cost_breakdown"],
            usage_by_country=usage_stats["usage_by_country"],
        )

    except ValueError as e:
        logger.warning(f"Number not found: {e}")
        raise HTTPException(status_code=404, detail="Phone number not found")
    except Exception as e:
        logger.error(f"Failed to get usage stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve usage statistics"
        )


@router.post("/cost-estimate", response_model=CostEstimateResponse)
async def calculate_cost_estimate(
    request: CostCalculationRequest,
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Calculate cost estimates for communication between countries

    Args:
        request: Cost calculation request
        routing_engine: Smart routing engine

    Returns:
        CostEstimateResponse: Cost estimates and recommendations
    """
    try:
        # Calculate costs
        cost_estimate = await routing_engine.calculate_communication_costs(
            from_country=request.from_country,
            to_country=request.to_country,
            message_count=request.message_count,
            call_minutes=request.call_minutes,
            number_type=request.number_type,
        )

        return CostEstimateResponse(
            from_country=request.from_country,
            to_country=request.to_country,
            message_cost=cost_estimate["message_cost"],
            call_cost_per_minute=cost_estimate["call_cost_per_minute"],
            total_estimated_cost=cost_estimate["total_estimated_cost"],
            currency=cost_estimate["currency"],
            cost_breakdown=cost_estimate["cost_breakdown"],
            recommendations=cost_estimate["recommendations"],
        )

    except Exception as e:
        logger.error(f"Failed to calculate costs: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate cost estimate")


@router.post("/optimize", response_model=OptimizationRecommendationResponse)
async def get_optimization_recommendations(
    request: NumberOptimizationRequest,
    current_user: User = Depends(get_current_user),
    routing_engine: SmartRoutingEngine = Depends(get_routing_engine),
):
    """
    Get optimization recommendations for number portfolio

    Args:
        request: Optimization request
        current_user: Authenticated user
        routing_engine: Smart routing engine

    Returns:
        OptimizationRecommendationResponse: Optimization recommendations
    """
    try:
        # Get optimization recommendations
        recommendations = await routing_engine.optimize_number_portfolio(
            user_id=current_user.id,
            target_countries=request.target_countries,
            monthly_message_volume=request.monthly_message_volume,
            monthly_call_minutes=request.monthly_call_minutes,
            budget_limit=request.budget_limit,
            optimization_goal=request.optimization_goal,
        )

        return OptimizationRecommendationResponse(
            current_setup=recommendations["current_setup"],
            recommended_setup=recommendations["recommended_setup"],
            potential_savings=recommendations["potential_savings"],
            coverage_improvement=recommendations["coverage_improvement"],
            delivery_improvement=recommendations["delivery_improvement"],
            implementation_steps=recommendations["implementation_steps"],
            cost_comparison=recommendations["cost_comparison"],
        )

    except Exception as e:
        logger.error(f"Failed to get optimization recommendations: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate optimization recommendations"
        )


@router.get("/analytics", response_model=NumberAnalyticsResponse)
async def get_number_analytics(
    period_days: int = Query(30, ge=1, le=365, description="Analytics period in days"),
    current_user: User = Depends(get_current_user),
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Get comprehensive analytics for user's number portfolio

    Args:
        period_days: Analytics period in days
        current_user: Authenticated user
        twilio_client: Enhanced Twilio client

    Returns:
        NumberAnalyticsResponse: Comprehensive analytics
    """
    try:
        # Get analytics data
        analytics = await twilio_client.get_number_portfolio_analytics(
            user_id=current_user.id, period_days=period_days
        )

        return NumberAnalyticsResponse(
            total_numbers=analytics["total_numbers"],
            active_numbers=analytics["active_numbers"],
            total_monthly_cost=analytics["total_monthly_cost"],
            usage_efficiency=analytics["usage_efficiency"],
            top_performing_numbers=analytics["top_performing_numbers"],
            underutilized_numbers=analytics["underutilized_numbers"],
            cost_trends=analytics["cost_trends"],
            recommendations=analytics["recommendations"],
        )

    except Exception as e:
        logger.error(f"Failed to get analytics: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve number analytics"
        )


@router.get("/countries/supported")
async def get_supported_countries(
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Get list of supported countries for number purchase

    Args:
        twilio_client: Enhanced Twilio client

    Returns:
        Dict: Supported countries with capabilities and pricing
    """
    try:
        supported_countries = await twilio_client.get_supported_countries()

        return {
            "countries": supported_countries,
            "total_count": len(supported_countries),
            "last_updated": datetime.utcnow(),
        }

    except Exception as e:
        logger.error(f"Failed to get supported countries: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve supported countries"
        )


@router.get("/health")
async def health_check(
    twilio_client: EnhancedTwilioClient = Depends(get_twilio_client),
):
    """
    Check the health status of the number management service

    Args:
        twilio_client: Enhanced Twilio client

    Returns:
        Dict: Service health status
    """
    try:
        # Check Twilio API connectivity
        health_status = await twilio_client.check_api_health()

        return {
            "status": "healthy" if health_status["api_accessible"] else "degraded",
            "timestamp": datetime.utcnow(),
            "twilio_status": health_status["status"],
            "available_countries": health_status.get("available_countries", 0),
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "timestamp": datetime.utcnow(), "error": str(e)}


# Background Tasks


async def setup_purchased_number(
    phone_number: str, user_id: str, webhook_url: Optional[str]
):
    """
    Background task to set up a newly purchased number

    Args:
        phone_number: Purchased phone number
        user_id: User identifier
        webhook_url: Webhook URL for the number
    """
    try:
        logger.info(f"Setting up purchased number {phone_number} for user {user_id}")

        # In production, this would:
        # 1. Configure webhooks
        # 2. Set up routing rules
        # 3. Initialize usage tracking
        # 4. Send confirmation notifications
        # 5. Update billing systems

        await asyncio.sleep(1)  # Placeholder for actual setup logic

        logger.info(f"Number setup completed for {phone_number}")

    except Exception as e:
        logger.error(f"Number setup failed for {phone_number}: {e}")


# Export router
__all__ = ["router"]

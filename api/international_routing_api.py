"""
International Routing API for SMS cost optimization and smart routing
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from middleware.auth_middleware import (
    get_current_user_from_middleware as get_current_user,
)
from models.user_models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/routing", tags=["international_routing"])


class Country(BaseModel):
    """Model for country information"""

    code: str = Field(..., description="ISO country code")
    name: str = Field(..., description="Country name")
    flag: str = Field(..., description="Flag emoji")
    dial_code: str = Field(..., description="International dial code")
    base_cost: float = Field(..., description="Base SMS cost in USD")
    popular: bool = Field(False, description="Whether this is a popular destination")


class RoutingOption(BaseModel):
    """Model for routing options"""

    id: str
    type: str = Field(..., description="Route type: direct, local, regional")
    name: str = Field(..., description="Route name")
    description: str = Field(..., description="Route description")
    cost_per_sms: float = Field(..., description="Cost per SMS in USD")
    delivery_time: str = Field(..., description="Expected delivery time")
    reliability: int = Field(..., description="Reliability percentage")
    recommended: bool = Field(False, description="Whether this route is recommended")
    from_number: Optional[str] = Field(None, description="Source number or type")
    savings_percentage: int = Field(0, description="Savings compared to direct route")


class CostComparison(BaseModel):
    """Model for cost comparison"""

    direct_cost: float
    recommended_cost: float
    savings_amount: float
    savings_percentage: int
    monthly_savings: float = Field(
        ..., description="Estimated monthly savings for 100 SMS"
    )


class RoutingRecommendation(BaseModel):
    """Model for routing recommendations"""

    destination_country: Country
    recommended_route: RoutingOption
    alternative_routes: List[RoutingOption]
    cost_comparison: CostComparison
    estimated_delivery: str


class NumberPurchaseRequest(BaseModel):
    """Request model for number purchase"""

    country_code: str
    route_id: str
    recipient_number: str
    message_content: str
    message_count: int = Field(1, ge=1, le=100)


class NumberPurchaseResponse(BaseModel):
    """Response model for number purchase"""

    purchase_id: str
    purchased_number: str
    total_cost: float
    number_cost: float
    sms_cost: float
    estimated_delivery: str
    status: str


@router.get("/countries", response_model=List[Country])
async def get_supported_countries(
    current_user: User = Depends(get_current_user),
    popular_only: bool = Query(False, description="Return only popular countries"),
):
    """
    Get list of supported countries for international routing

    Args:
        current_user: Current authenticated user
        popular_only: Whether to return only popular destinations

    Returns:
        List[Country]: Supported countries
    """
    try:
        # Mock country data
        countries = [
            Country(
                code="US",
                name="United States",
                flag="🇺🇸",
                dial_code="+1",
                base_cost=0.01,
                popular=True,
            ),
            Country(
                code="GB",
                name="United Kingdom",
                flag="🇬🇧",
                dial_code="+44",
                base_cost=0.02,
                popular=True,
            ),
            Country(
                code="CA",
                name="Canada",
                flag="🇨🇦",
                dial_code="+1",
                base_cost=0.01,
                popular=True,
            ),
            Country(
                code="AU",
                name="Australia",
                flag="🇦🇺",
                dial_code="+61",
                base_cost=0.03,
                popular=True,
            ),
            Country(
                code="DE",
                name="Germany",
                flag="🇩🇪",
                dial_code="+49",
                base_cost=0.02,
                popular=True,
            ),
            Country(
                code="FR",
                name="France",
                flag="🇫🇷",
                dial_code="+33",
                base_cost=0.02,
                popular=True,
            ),
            Country(
                code="JP",
                name="Japan",
                flag="🇯🇵",
                dial_code="+81",
                base_cost=0.04,
                popular=False,
            ),
            Country(
                code="BR",
                name="Brazil",
                flag="🇧🇷",
                dial_code="+55",
                base_cost=0.03,
                popular=False,
            ),
            Country(
                code="IN",
                name="India",
                flag="🇮🇳",
                dial_code="+91",
                base_cost=0.02,
                popular=True,
            ),
            Country(
                code="CN",
                name="China",
                flag="🇨🇳",
                dial_code="+86",
                base_cost=0.05,
                popular=False,
            ),
            Country(
                code="MX",
                name="Mexico",
                flag="🇲🇽",
                dial_code="+52",
                base_cost=0.02,
                popular=False,
            ),
            Country(
                code="ES",
                name="Spain",
                flag="🇪🇸",
                dial_code="+34",
                base_cost=0.02,
                popular=False,
            ),
            Country(
                code="IT",
                name="Italy",
                flag="🇮🇹",
                dial_code="+39",
                base_cost=0.025,
                popular=False,
            ),
            Country(
                code="NL",
                name="Netherlands",
                flag="🇳🇱",
                dial_code="+31",
                base_cost=0.02,
                popular=False,
            ),
            Country(
                code="SE",
                name="Sweden",
                flag="🇸🇪",
                dial_code="+46",
                base_cost=0.025,
                popular=False,
            ),
        ]

        if popular_only:
            countries = [c for c in countries if c.popular]

        return countries

    except Exception as e:
        logger.error(f"Failed to get countries: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve supported countries"
        )


@router.get("/recommendations/{country_code}", response_model=RoutingRecommendation)
async def get_routing_recommendations(
    country_code: str,
    current_user: User = Depends(get_current_user),
    message_count: int = Query(
        1, ge=1, le=1000, description="Number of messages to send"
    ),
):
    """
    Get routing recommendations for a specific country

    Args:
        country_code: ISO country code
        current_user: Current authenticated user
        message_count: Number of messages to estimate costs for

    Returns:
        RoutingRecommendation: Routing recommendations
    """
    try:
        # Get country info
        countries_response = await get_supported_countries(current_user, False)
        country = next((c for c in countries_response if c.code == country_code), None)

        if not country:
            raise HTTPException(status_code=404, detail="Country not supported")

        # Generate routing options
        direct_cost = 0.05  # Standard international rate
        local_cost = country.base_cost
        regional_cost = country.base_cost + 0.01

        routing_options = [
            RoutingOption(
                id="direct",
                type="direct",
                name="Direct Route",
                description="Send directly from your existing US number",
                cost_per_sms=direct_cost,
                delivery_time="2-5 seconds",
                reliability=95,
                recommended=False,
                from_number="+1234567890",
                savings_percentage=0,
            ),
            RoutingOption(
                id="local",
                type="local",
                name="Local Number Route",
                description=f"Purchase a local {country.name} number for better delivery",
                cost_per_sms=local_cost,
                delivery_time="1-3 seconds",
                reliability=99,
                recommended=True,
                from_number=f"{country.dial_code}XXXXXXX",
                savings_percentage=int(
                    ((direct_cost - local_cost) / direct_cost) * 100
                ),
            ),
            RoutingOption(
                id="regional",
                type="regional",
                name="Regional Hub Route",
                description="Route through nearby regional hub for cost optimization",
                cost_per_sms=regional_cost,
                delivery_time="3-7 seconds",
                reliability=92,
                recommended=False,
                from_number="Regional Hub",
                savings_percentage=int(
                    ((direct_cost - regional_cost) / direct_cost) * 100
                ),
            ),
        ]

        # Find recommended route
        recommended_route = next(r for r in routing_options if r.recommended)
        alternative_routes = [r for r in routing_options if not r.recommended]

        # Calculate cost comparison
        cost_comparison = CostComparison(
            direct_cost=direct_cost,
            recommended_cost=local_cost,
            savings_amount=direct_cost - local_cost,
            savings_percentage=int(((direct_cost - local_cost) / direct_cost) * 100),
            monthly_savings=(direct_cost - local_cost) * 100,  # Assuming 100 SMS/month
        )

        return RoutingRecommendation(
            destination_country=country,
            recommended_route=recommended_route,
            alternative_routes=alternative_routes,
            cost_comparison=cost_comparison,
            estimated_delivery="1-3 seconds",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get routing recommendations: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to get routing recommendations"
        )


@router.post("/purchase", response_model=NumberPurchaseResponse)
async def purchase_number_and_send(
    request: NumberPurchaseRequest, current_user: User = Depends(get_current_user)
):
    """
    Purchase a number and send SMS via optimized route

    Args:
        request: Purchase request details
        current_user: Current authenticated user

    Returns:
        NumberPurchaseResponse: Purchase result
    """
    try:
        # Get routing recommendations
        recommendations = await get_routing_recommendations(
            request.country_code, current_user
        )
        selected_route = next(
            (
                r
                for r in [recommendations.recommended_route]
                + recommendations.alternative_routes
                if r.id == request.route_id
            ),
            None,
        )

        if not selected_route:
            raise HTTPException(status_code=404, detail="Route not found")

        # Calculate costs
        number_cost = (
            2.00 if selected_route.type == "local" else 0.00
        )  # $2 for local number
        sms_cost = selected_route.cost_per_sms * request.message_count
        total_cost = number_cost + sms_cost

        # Generate purchase ID and number
        purchase_id = f"purchase_{datetime.now().timestamp()}"
        purchased_number = f"{recommendations.destination_country.dial_code}{str(int(datetime.now().timestamp()))[-7:]}"

        # In real implementation, this would:
        # 1. Check user balance/credits
        # 2. Purchase number from provider
        # 3. Send SMS via selected route
        # 4. Store transaction in database

        logger.info(f"Number purchase: {purchase_id} for user {current_user.id}")

        return NumberPurchaseResponse(
            purchase_id=purchase_id,
            purchased_number=purchased_number,
            total_cost=total_cost,
            number_cost=number_cost,
            sms_cost=sms_cost,
            estimated_delivery=selected_route.delivery_time,
            status="completed",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to purchase number: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to purchase number and send SMS"
        )


@router.get("/cost-estimate")
async def get_cost_estimate(
    country_code: str,
    message_count: int = Query(1, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
):
    """
    Get cost estimate for sending to a specific country

    Args:
        country_code: ISO country code
        message_count: Number of messages
        current_user: Current authenticated user

    Returns:
        Cost estimates for different routing options
    """
    try:
        recommendations = await get_routing_recommendations(
            country_code, current_user, message_count
        )

        estimates = []
        for route in [
            recommendations.recommended_route
        ] + recommendations.alternative_routes:
            number_cost = 2.00 if route.type == "local" else 0.00
            sms_cost = route.cost_per_sms * message_count
            total_cost = number_cost + sms_cost

            estimates.append(
                {
                    "route_id": route.id,
                    "route_name": route.name,
                    "number_cost": number_cost,
                    "sms_cost": sms_cost,
                    "total_cost": total_cost,
                    "recommended": route.recommended,
                    "savings_percentage": route.savings_percentage,
                }
            )

        return {
            "country": recommendations.destination_country.dict(),
            "message_count": message_count,
            "estimates": estimates,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Failed to get cost estimate: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate cost estimate")


@router.get("/stats")
async def get_routing_stats(current_user: User = Depends(get_current_user)):
    """
    Get routing statistics and metrics

    Args:
        current_user: Current authenticated user

    Returns:
        Routing statistics
    """
    try:
        # Mock statistics
        stats = {
            "supported_countries": 195,
            "average_savings": 35,
            "route_options_per_country": "3-5",
            "average_delivery_time": "2-5 seconds",
            "user_total_savings": 45.67,
            "messages_sent_international": 234,
            "most_used_countries": [
                {"country": "United Kingdom", "flag": "🇬🇧", "count": 45},
                {"country": "Germany", "flag": "🇩🇪", "count": 32},
                {"country": "France", "flag": "🇫🇷", "count": 28},
            ],
        }

        return stats

    except Exception as e:
        logger.error(f"Failed to get routing stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve routing statistics"
        )

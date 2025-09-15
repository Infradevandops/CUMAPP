#!/usr/bin/env python3
"""
Subscription Management API Endpoints
Provides subscription plans, billing, purchase/renewal workflows, usage tracking, and analytics
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from core.database import get_db
from auth.jwt_handler import verify_jwt_token
from models.user_models import User
from services.subscription_service import (
    SubscriptionService,
    create_subscription_service,
)

# Initialize router and security
router = APIRouter(prefix="/api/subscription", tags=["subscription"])
security = HTTPBearer()


# Pydantic models for request/response
class PurchaseSubscriptionRequest(BaseModel):
    plan_id: str = Field(..., description="Subscription plan ID")
    billing_cycle: str = Field(
        default="monthly", description="Billing cycle: monthly, quarterly, yearly"
    )
    payment_method: Optional[Dict[str, Any]] = Field(
        None, description="Payment method information"
    )


class TrackUsageRequest(BaseModel):
    usage_type: str = Field(
        ..., description="Type of usage: sms_sent, voice_minutes, verifications"
    )
    amount: int = Field(default=1, ge=1, description="Amount of usage to track")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class CancelSubscriptionRequest(BaseModel):
    immediate: bool = Field(
        default=False, description="Cancel immediately or at end of billing period"
    )
    reason: Optional[str] = Field(None, description="Reason for cancellation")


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


# Dependency to get subscription service
def get_subscription_service(db: Session = Depends(get_db)) -> SubscriptionService:
    """Get subscription service instance"""
    try:
        return create_subscription_service(db_session=db)
    except Exception as e:
        raise HTTPException(
            status_code=503, detail="Subscription service not available"
        )


# Subscription Plan Endpoints
@router.get("/plans")
async def get_subscription_plans(
    include_pricing: bool = Query(True, description="Include pricing information"),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Get all available subscription plans with pricing and features
    """
    try:
        plans = await subscription_service.get_subscription_plans(
            include_pricing=include_pricing
        )

        return {"success": True, "data": plans}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get subscription plans: {str(e)}"
        )


@router.get("/current")
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Get current user's subscription details with usage and billing information
    """
    try:
        subscription = await subscription_service.get_user_subscription(
            user_id=current_user.id
        )

        return {"success": True, "data": subscription}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get current subscription: {str(e)}"
        )


# Purchase and Management Endpoints
@router.post("/purchase")
async def purchase_subscription(
    request: PurchaseSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Purchase or upgrade to a subscription plan
    """
    try:
        result = await subscription_service.purchase_subscription(
            user_id=current_user.id,
            plan_id=request.plan_id,
            billing_cycle=request.billing_cycle,
            payment_method=request.payment_method,
        )

        return {
            "success": True,
            "message": "Subscription purchased successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to purchase subscription: {str(e)}"
        )


@router.post("/renew")
async def renew_subscription(
    auto_renew: bool = Query(False, description="Whether this is an automatic renewal"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Renew user's current subscription
    """
    try:
        result = await subscription_service.renew_subscription(
            user_id=current_user.id, auto_renew=auto_renew
        )

        return {
            "success": result["success"],
            "message": result["message"],
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to renew subscription: {str(e)}"
        )


@router.post("/cancel")
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Cancel user's subscription
    """
    try:
        result = await subscription_service.cancel_subscription(
            user_id=current_user.id, immediate=request.immediate, reason=request.reason
        )

        return {
            "success": True,
            "message": "Subscription cancelled successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to cancel subscription: {str(e)}"
        )


# Usage Tracking Endpoints
@router.post("/usage/track")
async def track_usage(
    request: TrackUsageRequest,
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Track usage for billing and limit enforcement
    """
    try:
        if request.usage_type not in ["sms_sent", "voice_minutes", "verifications"]:
            raise HTTPException(status_code=400, detail="Invalid usage type")

        result = await subscription_service.track_usage(
            user_id=current_user.id,
            usage_type=request.usage_type,
            amount=request.amount,
            metadata=request.metadata,
        )

        return {
            "success": True,
            "message": "Usage tracked successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track usage: {str(e)}")


@router.get("/usage/analytics")
async def get_usage_analytics(
    period_days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Get detailed usage analytics for the user
    """
    try:
        analytics = await subscription_service.get_usage_analytics(
            user_id=current_user.id, period_days=period_days
        )

        return {"success": True, "data": analytics}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get usage analytics: {str(e)}"
        )


# Billing Endpoints
@router.get("/billing/history")
async def get_billing_history(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of records"),
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Get user's billing history with invoices and payments
    """
    try:
        history = await subscription_service.get_billing_history(
            user_id=current_user.id, limit=limit
        )

        return {"success": True, "data": history}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get billing history: {str(e)}"
        )


@router.get("/billing/current")
async def get_current_billing_info(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Get current billing period information with usage and costs
    """
    try:
        # Get current subscription with billing info
        subscription = await subscription_service.get_user_subscription(
            user_id=current_user.id
        )

        # Extract billing-specific information
        billing_info = {
            "user_id": current_user.id,
            "current_plan": subscription["current_plan"],
            "billing_cycle": subscription["billing"]["cycle"],
            "next_billing_date": subscription["billing"]["next_billing_date"],
            "status": subscription["billing"]["status"],
            "current_usage": subscription["usage"],
            "costs": subscription["costs"],
            "limits": subscription["limits"],
        }

        return {"success": True, "data": billing_info}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get current billing info: {str(e)}"
        )


# Plan Comparison and Recommendations
@router.get("/plans/compare")
async def compare_subscription_plans(
    plan_ids: List[str] = Query(..., description="List of plan IDs to compare"),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Compare multiple subscription plans side by side
    """
    try:
        all_plans = await subscription_service.get_subscription_plans(
            include_pricing=True
        )

        if not all(plan_id in all_plans["plans"] for plan_id in plan_ids):
            raise HTTPException(status_code=400, detail="One or more invalid plan IDs")

        comparison = {
            "plans": {plan_id: all_plans["plans"][plan_id] for plan_id in plan_ids},
            "comparison_matrix": {},
        }

        # Create comparison matrix
        features_set = set()
        for plan_id in plan_ids:
            features_set.update(all_plans["plans"][plan_id]["features"])

        for feature in features_set:
            comparison["comparison_matrix"][feature] = {}
            for plan_id in plan_ids:
                plan_features = all_plans["plans"][plan_id]["features"]
                comparison["comparison_matrix"][feature][plan_id] = (
                    feature in plan_features
                )

        return {"success": True, "data": comparison}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to compare plans: {str(e)}"
        )


@router.get("/recommendations")
async def get_plan_recommendations(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """
    Get personalized plan recommendations based on usage patterns
    """
    try:
        # Get usage analytics
        analytics = await subscription_service.get_usage_analytics(
            user_id=current_user.id, period_days=30
        )

        # Get all plans
        all_plans = await subscription_service.get_subscription_plans(
            include_pricing=True
        )

        # Generate recommendations based on usage
        recommendations = []
        current_plan = analytics["current_plan"]["plan_id"]
        utilization = analytics["utilization"]

        # Check if user should upgrade
        if any(percentage > 80 for percentage in utilization.values()):
            for plan_id, plan_info in all_plans["plans"].items():
                if plan_id != current_plan:
                    # Check if this plan has higher limits
                    current_limits = all_plans["plans"][current_plan]["limits"]
                    new_limits = plan_info["limits"]

                    if (
                        new_limits["sms_monthly"] > current_limits["sms_monthly"]
                        or new_limits["sms_monthly"] == -1
                    ):
                        recommendations.append(
                            {
                                "type": "upgrade",
                                "plan_id": plan_id,
                                "plan_name": plan_info["name"],
                                "reason": "Higher usage limits to accommodate your growing needs",
                                "monthly_price": plan_info["pricing"]["monthly"],
                            }
                        )
                        break

        # Check if user should downgrade
        elif (
            all(percentage < 30 for percentage in utilization.values())
            and current_plan != "free"
        ):
            for plan_id in ["free", "basic"]:
                if plan_id != current_plan and plan_id in all_plans["plans"]:
                    plan_info = all_plans["plans"][plan_id]
                    recommendations.append(
                        {
                            "type": "downgrade",
                            "plan_id": plan_id,
                            "plan_name": plan_info["name"],
                            "reason": "Lower usage suggests you could save money with a smaller plan",
                            "monthly_price": plan_info["pricing"]["monthly"],
                        }
                    )
                    break

        if not recommendations:
            recommendations.append(
                {
                    "type": "stay",
                    "plan_id": current_plan,
                    "plan_name": analytics["current_plan"]["name"],
                    "reason": "Your current plan appears to be a good fit for your usage",
                    "monthly_price": all_plans["plans"][current_plan]["pricing"][
                        "monthly"
                    ],
                }
            )

        return {
            "success": True,
            "data": {
                "current_plan": analytics["current_plan"],
                "usage_summary": analytics["usage"],
                "utilization": utilization,
                "recommendations": recommendations,
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get recommendations: {str(e)}"
        )


@router.get("/health")
async def subscription_health_check():
    """
    Health check endpoint for subscription service
    """
    try:
        # Test service creation
        from core.database import get_db

        db = next(get_db())

        subscription_service = get_subscription_service(db)

        # Test basic functionality
        plans = await subscription_service.get_subscription_plans()

        return {
            "status": "healthy",
            "service": "subscription_service",
            "available_plans": plans["total_plans"],
            "features": [
                "Subscription plans and pricing logic",
                "Purchase and renewal workflows",
                "Usage tracking and billing integration",
                "Overage calculation and limit enforcement",
                "Billing history and analytics",
                "Usage recommendations",
            ],
            "timestamp": "2024-01-01T00:00:00Z",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "subscription_service",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z",
        }

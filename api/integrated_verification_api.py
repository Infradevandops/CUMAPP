#!/usr/bin/env python3
"""
Integrated Verification API Endpoints
Provides comprehensive verification workflow with smart routing and enhanced tracking
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth.jwt_handler import verify_jwt_token
from core.database import get_db
from clients.enhanced_twilio_client import EnhancedTwilioClient
from models.user_models import User
from services.integrated_verification_service import (
    IntegratedVerificationService, create_integrated_verification_service)
from textverified_client import TextVerifiedClient

# Initialize router and security
router = APIRouter(
    prefix="/api/integrated-verification", tags=["integrated-verification"]
)
security = HTTPBearer()


# Pydantic models for request/response
class CreateVerificationRequest(BaseModel):
    service_name: str = Field(..., description="Name of the service to verify")
    capability: str = Field(default="sms", description="Verification capability")
    preferred_country: Optional[str] = Field(
        None, description="Preferred country for routing"
    )


class BatchVerificationRequest(BaseModel):
    services: List[str] = Field(..., description="List of service names to verify")


class VerificationWorkflowResponse(BaseModel):
    verification_id: str
    service_name: str
    service_display_name: str
    service_category: str
    phone_number: str
    capability: str
    status: str
    created_at: str
    expires_at: Optional[str]
    expected_delivery_time: int
    success_rate: float
    cost_tier: str
    code_length: int
    routing_recommendation: Optional[Dict[str, Any]]
    instructions: Dict[str, Any]
    monitoring: Dict[str, bool]


class VerificationStatusResponse(BaseModel):
    verification_id: str
    service_name: str
    service_display_name: str
    phone_number: str
    status: str
    verification_code: Optional[str]
    messages_received: int
    extracted_codes: List[str]
    created_at: str
    completed_at: Optional[str]
    expires_at: Optional[str]
    progress: Dict[str, Any]
    messages: List[str]
    service_info: Dict[str, Any]


class CancelVerificationRequest(BaseModel):
    reason: str = Field(default="user_cancelled", description="Reason for cancellation")


class VerificationHistoryResponse(BaseModel):
    user_id: str
    total_verifications: int
    verifications: List[Dict[str, Any]]
    analytics: Optional[Dict[str, Any]] = None


class SupportedServicesResponse(BaseModel):
    total_services: int
    services: Dict[str, Dict[str, Any]]
    categories: Dict[str, List[Dict[str, Any]]]
    category_filter: Optional[str]


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


# Dependency to get integrated verification service
def get_integrated_verification_service(
    db: Session = Depends(get_db),
) -> IntegratedVerificationService:
    """Get integrated verification service instance"""
    try:
        from main import enhanced_twilio_client, textverified_client

        return create_integrated_verification_service(
            db_session=db,
            textverified_client=textverified_client,
            twilio_client=enhanced_twilio_client,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503, detail="Integrated verification service not available"
        )


@router.post("/create", response_model=VerificationWorkflowResponse)
async def create_service_verification(
    request: CreateVerificationRequest,
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Create a comprehensive service verification with smart routing and enhanced tracking
    """
    try:
        workflow_info = await verification_service.create_service_verification(
            user_id=current_user.id,
            service_name=request.service_name,
            capability=request.capability,
            preferred_country=request.preferred_country,
        )

        return VerificationWorkflowResponse(**workflow_info)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create verification: {str(e)}"
        )


@router.get("/{verification_id}/status", response_model=VerificationStatusResponse)
async def get_verification_status(
    verification_id: str = Path(..., description="Verification ID"),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Get comprehensive verification status with enhanced tracking and progress information
    """
    try:
        status_info = await verification_service.get_verification_status(
            user_id=current_user.id, verification_id=verification_id
        )

        return VerificationStatusResponse(**status_info)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get verification status: {str(e)}"
        )


@router.post("/{verification_id}/cancel")
async def cancel_verification(
    verification_id: str = Path(..., description="Verification ID"),
    request: CancelVerificationRequest = CancelVerificationRequest(),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Cancel verification with cleanup and tracking
    """
    try:
        result = await verification_service.cancel_verification(
            user_id=current_user.id,
            verification_id=verification_id,
            reason=request.reason,
        )

        return {
            "success": True,
            "message": "Verification cancelled successfully",
            "data": result,
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to cancel verification: {str(e)}"
        )


@router.get("/history", response_model=VerificationHistoryResponse)
async def get_verification_history(
    include_analytics: bool = Query(False, description="Include analytics data"),
    service_name: Optional[str] = Query(None, description="Filter by service name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results"),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Get comprehensive verification history with optional analytics
    """
    try:
        # Build filters
        filters = {}
        if service_name:
            filters["service_name"] = service_name
        if status:
            filters["status"] = status

        history = await verification_service.get_user_verification_history(
            user_id=current_user.id,
            filters=filters,
            include_analytics=include_analytics,
        )

        # Apply limit to verifications
        if len(history["verifications"]) > limit:
            history["verifications"] = history["verifications"][:limit]

        return VerificationHistoryResponse(**history)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get verification history: {str(e)}"
        )


@router.get("/services", response_model=SupportedServicesResponse)
async def get_supported_services(
    category: Optional[str] = Query(None, description="Filter by service category"),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Get list of supported services with their configurations and success rates
    """
    try:
        services_info = await verification_service.get_supported_services(
            category=category
        )

        return SupportedServicesResponse(**services_info)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get supported services: {str(e)}"
        )


@router.get("/services/categories")
async def get_service_categories(
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Get list of service categories with counts
    """
    try:
        services_info = await verification_service.get_supported_services()

        # Count services per category
        category_counts = {}
        for service_name, service_info in services_info["services"].items():
            category = service_info["category"]
            category_counts[category] = category_counts.get(category, 0) + 1

        return {
            "categories": list(category_counts.keys()),
            "category_counts": category_counts,
            "total_categories": len(category_counts),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get service categories: {str(e)}"
        )


@router.get("/analytics/summary")
async def get_verification_analytics_summary(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Get verification analytics summary for the user
    """
    try:
        # Get history with analytics
        history = await verification_service.get_user_verification_history(
            user_id=current_user.id, include_analytics=True
        )

        analytics = history.get("analytics", {})

        # Add time-based filtering if needed
        from datetime import datetime, timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        filtered_verifications = [
            v
            for v in history["verifications"]
            if datetime.fromisoformat(v["created_at"].replace("Z", "+00:00"))
            >= cutoff_date
        ]

        # Recalculate analytics for filtered data
        if filtered_verifications:
            total = len(filtered_verifications)
            completed = len([v for v in filtered_verifications if v["success"]])
            success_rate = (completed / total * 100) if total > 0 else 0

            analytics["filtered_summary"] = {
                "period_days": days,
                "total_verifications": total,
                "completed_verifications": completed,
                "success_rate": round(success_rate, 2),
            }

        return {"success": True, "analytics": analytics, "period_days": days}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get analytics summary: {str(e)}"
        )


@router.get("/health")
async def verification_health_check():
    """
    Health check endpoint for integrated verification service
    """
    try:
        # Test service creation
        from core.database import get_db

        db = next(get_db())

        verification_service = get_integrated_verification_service(db)

        # Test basic functionality
        services_info = await verification_service.get_supported_services()

        return {
            "status": "healthy",
            "service": "integrated_verification_service",
            "supported_services": services_info["total_services"],
            "categories": len(services_info["categories"]),
            "components": {
                "verification_service": True,
                "routing_engine": verification_service.routing_engine is not None,
                "textverified_client": verification_service.textverified_client
                is not None,
                "twilio_client": verification_service.twilio_client is not None,
                "notification_service": True,
            },
            "timestamp": "2024-01-01T00:00:00Z",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "integrated_verification_service",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z",
        }


@router.get("/services/{service_name}/info")
async def get_service_info(
    service_name: str = Path(..., description="Service name to get info for"),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Get detailed information about a specific service
    """
    try:
        services_info = await verification_service.get_supported_services()

        if service_name not in services_info["services"]:
            raise HTTPException(
                status_code=404, detail=f"Service '{service_name}' not supported"
            )

        service_info = services_info["services"][service_name]

        # Add additional details
        detailed_info = {
            **service_info,
            "service_name": service_name,
            "instructions_preview": verification_service._generate_verification_instructions(
                service_name, "+1234567890"  # Sample number for preview
            ),
            "supported": True,
            "estimated_cost": (
                "Standard rate"
                if service_info["cost_tier"] == "standard"
                else "Premium rate"
            ),
        }

        return {"success": True, "service_info": detailed_info}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get service info: {str(e)}"
        )


@router.post("/batch-create")
async def create_batch_verifications(
    request: BatchVerificationRequest,
    capability: str = Query(default="sms", description="Verification capability"),
    preferred_country: Optional[str] = Query(
        None, description="Preferred country for routing"
    ),
    current_user: User = Depends(get_current_user),
    verification_service: IntegratedVerificationService = Depends(
        get_integrated_verification_service
    ),
):
    """
    Create multiple verifications at once (batch operation)
    """
    try:
        if len(request.services) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 services per batch")

        results = []
        errors = []

        for service_name in request.services:
            try:
                workflow_info = await verification_service.create_service_verification(
                    user_id=current_user.id,
                    service_name=service_name,
                    capability=capability,
                    preferred_country=preferred_country,
                )
                results.append(
                    {
                        "service_name": service_name,
                        "success": True,
                        "verification_id": workflow_info["verification_id"],
                        "phone_number": workflow_info["phone_number"],
                    }
                )
            except Exception as e:
                errors.append(
                    {"service_name": service_name, "success": False, "error": str(e)}
                )

        return {
            "success": len(errors) == 0,
            "total_requested": len(request.services),
            "successful": len(results),
            "failed": len(errors),
            "results": results,
            "errors": errors,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create batch verifications: {str(e)}"
        )

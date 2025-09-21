"""
Performance monitoring API endpoints.
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from services.performance_service import performance_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/metrics", summary="Get performance metrics")
async def get_performance_metrics():
    """Get current performance metrics and health status."""
    try:
        summary = performance_service.get_performance_summary()
        budget_violations = performance_service.check_performance_budgets()

        return {
            "status": "healthy" if not any(budget_violations.values()) else "degraded",
            "metrics": summary,
            "budget_violations": budget_violations,
            "timestamp": performance_service.metrics.get("timestamp", 0)
        }
    except Exception as e:
        logger.error(f"Error retrieving performance metrics: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving performance metrics")


@router.get("/core-web-vitals", summary="Get Core Web Vitals")
async def get_core_web_vitals():
    """Get Core Web Vitals metrics."""
    try:
        summary = performance_service.get_performance_summary()
        return {
            "core_web_vitals": summary.get("core_web_vitals", {}),
            "timestamp": performance_service.metrics.get("timestamp", 0)
        }
    except Exception as e:
        logger.error(f"Error retrieving Core Web Vitals: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving Core Web Vitals")


@router.get("/health", summary="Performance health check")
async def performance_health_check():
    """Check if performance metrics are within acceptable ranges."""
    try:
        budget_violations = performance_service.check_performance_budgets()

        if any(budget_violations.values()):
            return {
                "status": "degraded",
                "violations": budget_violations,
                "message": "Some performance metrics are outside acceptable ranges"
            }

        return {
            "status": "healthy",
            "violations": budget_violations,
            "message": "All performance metrics are within acceptable ranges"
        }
    except Exception as e:
        logger.error(f"Error in performance health check: {e}")
        raise HTTPException(status_code=500, detail="Error checking performance health")


@router.post("/track-custom", summary="Track custom performance metric")
async def track_custom_metric(metric_data: Dict[str, Any]):
    """Track a custom performance metric."""
    try:
        name = metric_data.get("name")
        value = metric_data.get("value")
        tags = metric_data.get("tags", {})

        if not name or value is None:
            raise HTTPException(status_code=400, detail="Missing required fields: name and value")

        from core.sentry_config import capture_custom_metric
        capture_custom_metric(name, value, tags)

        logger.info(f"Custom metric tracked: {name} = {value}")
        return {"status": "success", "message": "Custom metric tracked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking custom metric: {e}")
        raise HTTPException(status_code=500, detail="Error tracking custom metric")
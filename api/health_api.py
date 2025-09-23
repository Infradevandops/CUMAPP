"""
Health check API endpoints for production monitoring.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
import logging
from core.health_checks import health_checker
from core.production_config import get_deployment_info

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def basic_health_check() -> Dict[str, str]:
    """Basic health check endpoint for load balancers."""
    return {"status": "ok", "message": "Service is running"}


@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Comprehensive health check with all system components."""
    try:
        result = await health_checker.comprehensive_health_check()
        
        # Log unhealthy status
        if result["status"] != "healthy":
            logger.warning(f"Health check status: {result['status']}")
        
        return result
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Health check failed: {str(e)}"
        )


@router.get("/database")
async def database_health() -> Dict[str, Any]:
    """Check database connectivity and performance."""
    try:
        result = await health_checker.check_database()
        
        if result["status"] != "healthy":
            raise HTTPException(status_code=503, detail=result)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database health check failed: {str(e)}"
        )


@router.get("/redis")
async def redis_health() -> Dict[str, Any]:
    """Check Redis connectivity and performance."""
    try:
        result = await health_checker.check_redis()
        
        if result["status"] != "healthy":
            raise HTTPException(status_code=503, detail=result)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Redis health check failed: {str(e)}"
        )


@router.get("/external-services")
async def external_services_health() -> Dict[str, Any]:
    """Check external service dependencies."""
    try:
        result = await health_checker.check_external_services()
        return {"services": result}
        
    except Exception as e:
        logger.error(f"External services health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"External services health check failed: {str(e)}"
        )


@router.get("/system")
async def system_health() -> Dict[str, Any]:
    """Check system resource usage."""
    try:
        result = health_checker.check_system_resources()
        
        if result["status"] == "critical":
            raise HTTPException(status_code=503, detail=result)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"System health check failed: {str(e)}"
        )


@router.get("/uptime")
async def uptime_info() -> Dict[str, Any]:
    """Get application uptime information."""
    try:
        return health_checker.get_uptime()
    except Exception as e:
        logger.error(f"Uptime check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Uptime check failed: {str(e)}"
        )


@router.get("/history")
async def health_history(limit: int = 20) -> Dict[str, Any]:
    """Get recent health check history."""
    try:
        if limit > 100:
            limit = 100  # Prevent excessive data
        
        history = health_checker.get_health_history(limit)
        summary = health_checker.get_health_summary()
        
        return {
            "history": history,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Health history check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Health history check failed: {str(e)}"
        )


@router.get("/deployment")
async def deployment_info() -> Dict[str, Any]:
    """Get deployment and version information."""
    try:
        return get_deployment_info()
    except Exception as e:
        logger.error(f"Deployment info check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Deployment info check failed: {str(e)}"
        )


@router.get("/readiness")
async def readiness_probe() -> Dict[str, str]:
    """Kubernetes readiness probe endpoint."""
    try:
        # Check critical services only
        db_check = await health_checker.check_database()
        redis_check = await health_checker.check_redis()
        
        if db_check["status"] != "healthy" or redis_check["status"] != "healthy":
            raise HTTPException(
                status_code=503,
                detail="Service not ready - critical dependencies unavailable"
            )
        
        return {"status": "ready"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness probe failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Readiness probe failed: {str(e)}"
        )


@router.get("/liveness")
async def liveness_probe() -> Dict[str, str]:
    """Kubernetes liveness probe endpoint."""
    try:
        # Basic application health check
        uptime = health_checker.get_uptime()
        
        # If uptime is very low, might indicate restart loop
        if uptime["uptime_seconds"] < 10:
            logger.warning("Application uptime is very low, possible restart loop")
        
        return {"status": "alive", "uptime": uptime["uptime_human"]}
        
    except Exception as e:
        logger.error(f"Liveness probe failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Liveness probe failed: {str(e)}"
        )
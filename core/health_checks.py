"""
Health check endpoints and monitoring for production deployment.
"""
import time
import psutil
import asyncio
from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class HealthChecker:
    """Comprehensive health checking system."""
    
    def __init__(self):
        self.start_time = time.time()
        self.check_history = []
        self.max_history = 100
    
    async def check_database(self) -> Dict[str, Any]:
        """Check database connectivity and performance."""
        try:
            from core.database import check_database_connection
            from sqlalchemy import text
            from core.database import get_db_session
            
            start_time = time.time()
            
            # Basic connection check
            if not check_database_connection():
                return {
                    "status": "unhealthy",
                    "message": "Database connection failed",
                    "response_time": None
                }
            
            # Performance check
            async with get_db_session() as session:
                await session.execute(text("SELECT 1"))
            
            response_time = (time.time() - start_time) * 1000
            
            return {
                "status": "healthy",
                "message": "Database connection successful",
                "response_time": f"{response_time:.2f}ms"
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "message": f"Database error: {str(e)}",
                "response_time": None
            }
    
    async def check_redis(self) -> Dict[str, Any]:
        """Check Redis connectivity and performance."""
        try:
            import redis
            from core.production_config import config
            
            start_time = time.time()
            
            redis_client = redis.from_url(config.redis_config["url"])
            redis_client.ping()
            
            # Test set/get operation
            test_key = "health_check_test"
            redis_client.set(test_key, "test_value", ex=10)
            value = redis_client.get(test_key)
            redis_client.delete(test_key)
            
            response_time = (time.time() - start_time) * 1000
            
            return {
                "status": "healthy",
                "message": "Redis connection successful",
                "response_time": f"{response_time:.2f}ms"
            }
            
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return {
                "status": "unhealthy",
                "message": f"Redis error: {str(e)}",
                "response_time": None
            }
    
    async def check_external_services(self) -> Dict[str, Any]:
        """Check external service dependencies."""
        services = {}
        
        # Check Twilio (if configured)
        try:
            import os
            if os.getenv("TWILIO_ACCOUNT_SID"):
                from twilio.rest import Client
                
                start_time = time.time()
                client = Client(
                    os.getenv("TWILIO_ACCOUNT_SID"),
                    os.getenv("TWILIO_AUTH_TOKEN")
                )
                
                # Test account fetch (lightweight operation)
                account = client.api.accounts(client.account_sid).fetch()
                response_time = (time.time() - start_time) * 1000
                
                services["twilio"] = {
                    "status": "healthy",
                    "message": f"Account status: {account.status}",
                    "response_time": f"{response_time:.2f}ms"
                }
            else:
                services["twilio"] = {
                    "status": "not_configured",
                    "message": "Twilio credentials not configured"
                }
                
        except Exception as e:
            services["twilio"] = {
                "status": "unhealthy",
                "message": f"Twilio error: {str(e)}"
            }
        
        # Check Sentry (if configured)
        try:
            import sentry_sdk
            from core.production_config import config
            
            if config.sentry_config["dsn"]:
                # Test Sentry by capturing a test message
                start_time = time.time()
                sentry_sdk.capture_message("Health check test", level="info")
                response_time = (time.time() - start_time) * 1000
                
                services["sentry"] = {
                    "status": "healthy",
                    "message": "Sentry integration active",
                    "response_time": f"{response_time:.2f}ms"
                }
            else:
                services["sentry"] = {
                    "status": "not_configured",
                    "message": "Sentry DSN not configured"
                }
                
        except Exception as e:
            services["sentry"] = {
                "status": "unhealthy",
                "message": f"Sentry error: {str(e)}"
            }
        
        return services
    
    def check_system_resources(self) -> Dict[str, Any]:
        """Check system resource usage."""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            
            # Load average (Unix systems)
            try:
                load_avg = psutil.getloadavg()
            except AttributeError:
                load_avg = None
            
            # Determine overall status
            status = "healthy"
            warnings = []
            
            if cpu_percent > 80:
                status = "warning"
                warnings.append(f"High CPU usage: {cpu_percent}%")
            
            if memory_percent > 85:
                status = "warning"
                warnings.append(f"High memory usage: {memory_percent}%")
            
            if disk_percent > 90:
                status = "critical"
                warnings.append(f"High disk usage: {disk_percent}%")
            
            return {
                "status": status,
                "cpu_percent": cpu_percent,
                "memory_percent": memory_percent,
                "disk_percent": disk_percent,
                "load_average": load_avg,
                "warnings": warnings
            }
            
        except Exception as e:
            logger.error(f"System resource check failed: {e}")
            return {
                "status": "unhealthy",
                "message": f"System check error: {str(e)}"
            }
    
    def get_uptime(self) -> Dict[str, Any]:
        """Get application uptime information."""
        uptime_seconds = time.time() - self.start_time
        uptime_delta = timedelta(seconds=int(uptime_seconds))
        
        return {
            "uptime_seconds": int(uptime_seconds),
            "uptime_human": str(uptime_delta),
            "start_time": datetime.fromtimestamp(self.start_time).isoformat()
        }
    
    async def comprehensive_health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check."""
        check_start = time.time()
        
        # Run all checks concurrently
        database_check = await self.check_database()
        redis_check = await self.check_redis()
        external_services = await self.check_external_services()
        system_resources = self.check_system_resources()
        uptime_info = self.get_uptime()
        
        # Determine overall status
        checks = [database_check, redis_check, system_resources]
        external_checks = [service for service in external_services.values() 
                          if service.get("status") not in ["not_configured"]]
        
        all_checks = checks + external_checks
        
        if any(check.get("status") == "unhealthy" for check in all_checks):
            overall_status = "unhealthy"
        elif any(check.get("status") in ["warning", "critical"] for check in all_checks):
            overall_status = "warning"
        else:
            overall_status = "healthy"
        
        check_duration = (time.time() - check_start) * 1000
        
        result = {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "check_duration": f"{check_duration:.2f}ms",
            "uptime": uptime_info,
            "checks": {
                "database": database_check,
                "redis": redis_check,
                "system": system_resources,
                "external_services": external_services
            }
        }
        
        # Store in history
        self.check_history.append({
            "timestamp": result["timestamp"],
            "status": overall_status,
            "duration": check_duration
        })
        
        # Limit history size
        if len(self.check_history) > self.max_history:
            self.check_history = self.check_history[-self.max_history:]
        
        return result
    
    def get_health_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent health check history."""
        return self.check_history[-limit:]
    
    def get_health_summary(self) -> Dict[str, Any]:
        """Get health check summary statistics."""
        if not self.check_history:
            return {"message": "No health check history available"}
        
        recent_checks = self.check_history[-20:]  # Last 20 checks
        
        total_checks = len(recent_checks)
        healthy_checks = sum(1 for check in recent_checks if check["status"] == "healthy")
        warning_checks = sum(1 for check in recent_checks if check["status"] == "warning")
        unhealthy_checks = sum(1 for check in recent_checks if check["status"] == "unhealthy")
        
        avg_duration = sum(check["duration"] for check in recent_checks) / total_checks
        
        return {
            "total_checks": total_checks,
            "healthy_percentage": (healthy_checks / total_checks) * 100,
            "warning_percentage": (warning_checks / total_checks) * 100,
            "unhealthy_percentage": (unhealthy_checks / total_checks) * 100,
            "average_check_duration": f"{avg_duration:.2f}ms",
            "last_check": recent_checks[-1] if recent_checks else None
        }


# Global health checker instance
health_checker = HealthChecker()
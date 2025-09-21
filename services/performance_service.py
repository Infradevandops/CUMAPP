"""
Performance monitoring service for tracking Core Web Vitals and custom metrics.
"""
import time
import logging
from typing import Dict, Any, Optional
import sentry_sdk
from core.sentry_config import capture_custom_metric

logger = logging.getLogger(__name__)


class PerformanceService:
    """Service for tracking application performance metrics."""

    def __init__(self):
        self.metrics = {}

    def track_core_web_vital(self, name: str, value: float, tags: Optional[Dict[str, Any]] = None):
        """Track Core Web Vitals metrics (LCP, FID, CLS, etc.)."""
        try:
            # Capture in Sentry
            capture_custom_metric(f"core_web_vital.{name}", value, tags)

            # Log for monitoring
            logger.info(f"Core Web Vital - {name}: {value}")

            # Store for local analysis
            if name not in self.metrics:
                self.metrics[name] = []
            self.metrics[name].append({
                "value": value,
                "timestamp": time.time(),
                "tags": tags or {}
            })

        except Exception as e:
            logger.error(f"Error tracking Core Web Vital {name}: {e}")

    def track_api_performance(self, endpoint: str, duration: float, status_code: int, method: str = "GET"):
        """Track API endpoint performance."""
        try:
            tags = {
                "endpoint": endpoint,
                "status_code": status_code,
                "method": method
            }

            capture_custom_metric("api.duration", duration, tags)
            logger.info(f"API Performance - {method} {endpoint}: {duration:.3f}s (Status: {status_code})")

        except Exception as e:
            logger.error(f"Error tracking API performance: {e}")

    def track_chat_performance(self, operation: str, duration: float, message_count: int = 1):
        """Track chat-specific performance metrics."""
        try:
            tags = {
                "operation": operation,
                "message_count": message_count
            }

            capture_custom_metric("chat.performance", duration, tags)
            logger.info(f"Chat Performance - {operation}: {duration:.3f}s ({message_count} messages)")

        except Exception as e:
            logger.error(f"Error tracking chat performance: {e}")

    def track_database_performance(self, operation: str, duration: float, table: Optional[str] = None):
        """Track database operation performance."""
        try:
            tags = {
                "operation": operation,
                "table": table or "unknown"
            }

            capture_custom_metric("database.duration", duration, tags)
            logger.info(f"Database Performance - {operation}: {duration:.3f}s")

        except Exception as e:
            logger.error(f"Error tracking database performance: {e}")

    def track_external_service(self, service_name: str, duration: float, success: bool = True):
        """Track external service call performance."""
        try:
            tags = {
                "service": service_name,
                "success": success
            }

            capture_custom_metric("external_service.duration", duration, tags)

            if not success:
                sentry_sdk.capture_message(
                    f"External service {service_name} failed",
                    level="warning",
                    tags=tags
                )

            logger.info(f"External Service - {service_name}: {duration:.3f}s (Success: {success})")

        except Exception as e:
            logger.error(f"Error tracking external service performance: {e}")

    def get_performance_summary(self) -> Dict[str, Any]:
        """Get a summary of recent performance metrics."""
        try:
            summary = {
                "core_web_vitals": {},
                "api_performance": {},
                "chat_performance": {},
                "database_performance": {},
                "external_services": {}
            }

            # Calculate averages for recent metrics
            for metric_name, values in self.metrics.items():
                if values:
                    recent_values = values[-10:]  # Last 10 measurements
                    avg_value = sum(v["value"] for v in recent_values) / len(recent_values)
                    summary["core_web_vitals"][metric_name] = {
                        "average": avg_value,
                        "count": len(recent_values),
                        "latest": recent_values[-1]["value"]
                    }

            return summary

        except Exception as e:
            logger.error(f"Error generating performance summary: {e}")
            return {}

    def check_performance_budgets(self) -> Dict[str, bool]:
        """Check if performance metrics are within acceptable budgets."""
        budgets = {
            "api_response_time": 1.0,  # 1 second
            "database_query_time": 0.5,  # 500ms
            "chat_response_time": 2.0,  # 2 seconds
            "core_web_vitals_lcp": 2.5,  # 2.5 seconds
            "core_web_vitals_fid": 100,  # 100ms
            "core_web_vitals_cls": 0.1,  # 0.1
        }

        violations = {}

        try:
            # Check API performance
            api_metrics = [m for m in self.metrics.get("api.duration", []) if m["value"] > budgets["api_response_time"]]
            violations["api_response_time"] = len(api_metrics) > 0

            # Check Core Web Vitals
            for vital in ["lcp", "fid", "cls"]:
                key = f"core_web_vital.{vital}"
                if key in self.metrics:
                    recent = self.metrics[key][-1]["value"] if self.metrics[key] else 0
                    budget_key = f"core_web_vitals_{vital}"
                    violations[budget_key] = recent > budgets.get(budget_key, float('inf'))

            return violations

        except Exception as e:
            logger.error(f"Error checking performance budgets: {e}")
            return {}


# Global performance service instance
performance_service = PerformanceService()
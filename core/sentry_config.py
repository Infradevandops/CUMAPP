"""
Sentry configuration for error tracking and performance monitoring.
"""
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration


def init_sentry():
    """Initialize Sentry SDK with FastAPI integration."""
    sentry_dsn = os.getenv("SENTRY_DSN")
    environment = os.getenv("ENVIRONMENT", "development")

    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,
            traces_sample_rate=1.0,  # Sample 100% of transactions for performance monitoring
            integrations=[
                FastApiIntegration(
                    transaction_style="endpoint",
                    failed_request_status_codes={400, 401, 403, 404, 422, 500},
                ),
                SqlalchemyIntegration(),
                RedisIntegration(),
            ],
            # Set up performance monitoring
            enable_tracing=True,
            # Capture health check transactions but with lower sample rate
            before_send_transaction=lambda transaction, hint:
                None if transaction.get("name", "").startswith("/health") else transaction,
            # Ignore certain errors
            ignore_errors=[
                "404",  # Page not found errors
                "401",  # Unauthorized errors
            ],
        )
    else:
        print("SENTRY_DSN not found. Sentry error tracking disabled.")


def get_sentry_user_context(request):
    """Extract user context from request for Sentry."""
    user = getattr(request.state, "user", None)
    if user:
        return {
            "id": user.get("id"),
            "email": user.get("email"),
            "username": user.get("username"),
        }
    return None


def capture_custom_metric(name, value, tags=None):
    """Capture custom performance metrics."""
    if sentry_sdk.Hub.current.scope:
        sentry_sdk.Hub.current.scope.set_tag("custom_metric", name)
        sentry_sdk.Hub.current.scope.set_measurement(name, value)
        if tags:
            for key, tag_value in tags.items():
                sentry_sdk.Hub.current.scope.set_tag(key, tag_value)
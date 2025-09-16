#!/usr/bin/env python3
"""
Middleware configuration for the FastAPI application.
"""
import logging

from fastapi import FastAPI

logger = logging.getLogger(__name__)


def setup_middleware(app: FastAPI):
    """Configure and add middleware to the FastAPI app."""
    try:
        from middleware.auth_middleware import (JWTAuthMiddleware,
                                                RateLimitMiddleware)

        # Add rate limiting middleware
        app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

        # Add JWT authentication middleware with excluded paths
        excluded_paths = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/info",
            "/static",
            "/",
            "/chat",
            "/register",
            "/login",
        ]
        app.add_middleware(JWTAuthMiddleware, exclude_paths=excluded_paths)

        logger.info("JWT Authentication middleware added successfully")
    except ImportError as e:
        logger.warning(f"Could not import JWT middleware: {e}")
    except Exception as e:
        logger.warning(f"Error adding JWT middleware: {e}")

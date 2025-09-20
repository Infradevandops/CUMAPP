#!/usr/bin/env python3
"""
Middleware configuration for the FastAPI application.
"""
import logging
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' ws: wss:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        
        # Security headers
        security_headers = {
            "Content-Security-Policy": csp_policy,
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
        
        for header, value in security_headers.items():
            response.headers[header] = value
            
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validate and sanitize incoming requests"""
    
    async def dispatch(self, request: Request, call_next):
        # Check for suspicious patterns in URL
        suspicious_patterns = [
            "../", "..\\", "<script", "javascript:", "vbscript:",
            "onload=", "onerror=", "eval(", "expression("
        ]
        
        url_path = str(request.url.path).lower()
        for pattern in suspicious_patterns:
            if pattern in url_path:
                logger.warning(f"Suspicious request blocked: {request.url}")
                return Response("Bad Request", status_code=400)
        
        # Validate request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            logger.warning(f"Request too large: {content_length} bytes")
            return Response("Request Entity Too Large", status_code=413)
            
        return await call_next(request)


def setup_middleware(app: FastAPI):
    """Configure and add middleware to the FastAPI app."""
    
    # Add security headers middleware (first)
    app.add_middleware(SecurityHeadersMiddleware)
    logger.info("Security headers middleware added successfully")
    
    # Add request validation middleware
    app.add_middleware(RequestValidationMiddleware)
    logger.info("Request validation middleware added successfully")
    
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

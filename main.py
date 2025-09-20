#!/usr/bin/env python3
"""
Main application file for the CumApp platform.
"""
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.gzip import GZipMiddleware

# Load environment variables
load_dotenv()

from api.admin_api import router as admin_router
from api.ai_assistant_api import router as ai_assistant_router
from api.api_key_api import router as api_key_router
# Import API routers
from api.auth_api import router as auth_router
from api.communication_api import router as communication_router
from api.communication_dashboard_api import \
    router as communication_dashboard_router
from api.enhanced_communication_api import router as enhanced_comm_router
from api.enhanced_verification_api import \
    router as enhanced_verification_router
# from api.frontend import router as frontend_router  # Not used currently
from api.inbox_api import router as inbox_router
from api.integrated_verification_api import \
    router as integrated_verification_router
from api.international_routing_api import \
    router as international_routing_router
from api.payment_api import router as payment_router
from api.phone_number_api import router as phone_router
from api.smart_routing_api import router as smart_routing_router
from api.subscription_api import router as subscription_router
from api.verification_api import router as verification_router
from clients.unified_client import get_unified_client
# Import core components
from core.database import check_database_connection, create_tables
from core.middleware import setup_middleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and check connections on startup"""
    logger.info("Initializing database...")

    if not check_database_connection():
        logger.error("Database connection failed!")
        raise RuntimeError("Database connection failed")

    try:
        create_tables()
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

    yield

    logger.info("Shutting down application...")


# --- FastAPI App Initialization ---
app = FastAPI(
    title="CumApp - Communication Platform",
    description="Comprehensive SMS and voice communication platform with AI assistance",
    version="1.1.0",
    lifespan=lifespan,
)

# Setup middleware
setup_middleware(app)

# Add compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom StaticFiles class with cache headers
class CachedStaticFiles(StaticFiles):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        
        # Add cache headers for static assets
        if path.endswith(('.css', '.js')):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"  # 1 year for versioned assets
            response.headers["ETag"] = f'"{hash(path)}"'
        elif path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp')):
            response.headers["Cache-Control"] = "public, max-age=2592000"  # 30 days for images
            response.headers["ETag"] = f'"{hash(path)}"'
        elif path.endswith('.html'):
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
            response.headers["ETag"] = f'"{hash(path)}"'
        
        # Add compression hint
        response.headers["Vary"] = "Accept-Encoding"
        
        return response

# Mount static files only if the build directory exists
if os.path.exists("frontend/build"):
    app.mount("/static", CachedStaticFiles(directory="frontend/build/static"), name="static")
    app.mount("/", CachedStaticFiles(directory="frontend/build", html=True), name="frontend")
else:
    logger.warning("Frontend build directory not found. Skipping static file mounting.")

# Include API routers

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(
    verification_router, prefix="/api/verification", tags=["verification"]
)
app.include_router(phone_router, prefix="/api/numbers", tags=["phone_numbers"])
app.include_router(payment_router, prefix="/api/payments", tags=["payments"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(api_key_router, prefix="/api/api-keys", tags=["api_keys"])
app.include_router(enhanced_comm_router, tags=["enhanced_communication"])
app.include_router(smart_routing_router, tags=["smart_routing"])
app.include_router(integrated_verification_router, tags=["integrated_verification"])
app.include_router(communication_router, tags=["communication"])
app.include_router(subscription_router, tags=["subscription"])
app.include_router(ai_assistant_router, tags=["ai_assistant"])
app.include_router(enhanced_verification_router, tags=["enhanced_verification"])
app.include_router(inbox_router, tags=["inbox"])
app.include_router(communication_dashboard_router, tags=["communication_dashboard"])
app.include_router(international_routing_router, tags=["international_routing"])


# --- Health Check Endpoint ---
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        unified_client = get_unified_client()
        return {
            "status": "healthy",
            "app_name": "CumApp",
            "version": "1.1.0",
            "database": check_database_connection(),
            "services": {
                "twilio": unified_client.twilio_client is not None,
                "textverified": unified_client.textverified_client is not None,
                "groq": unified_client.groq_client is not None,
            },
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "app_name": "CumApp",
            "version": "1.1.0",
            "error": str(e),
        }


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting CumApp application...")
    uvicorn.run(
        "main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True
    )

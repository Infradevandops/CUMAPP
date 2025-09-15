#!/usr/bin/env python3
"""
Main application file for the CumApp platform.
"""
import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()

# Import core components
from core.database import check_database_connection, create_tables
from core.middleware import setup_middleware
from core.clients import twilio_client, textverified_client, groq_client

# Import API routers
from api.auth_api import router as auth_router
from api.verification_api import router as verification_router
from api.phone_number_api import router as phone_router
from api.payment_api import router as payment_router
from api.admin_api import router as admin_router
from api.api_key_api import router as api_key_router
from api.enhanced_communication_api import router as enhanced_comm_router
from api.smart_routing_api import router as smart_routing_router
from api.integrated_verification_api import router as integrated_verification_router
from api.communication_api import router as communication_router
from api.subscription_api import router as subscription_router
from api.ai_assistant_api import router as ai_assistant_router
from api.enhanced_verification_api import router as enhanced_verification_router
from api.inbox_api import router as inbox_router
from api.communication_dashboard_api import router as communication_dashboard_router
from api.international_routing_api import router as international_routing_router
from api.frontend import router as frontend_router

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

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(frontend_router, tags=["frontend"])
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
    return {
        "status": "healthy",
        "app_name": "CumApp",
        "version": "1.1.0",
        "services": {
            "twilio": twilio_client is not None,
            "textverified": textverified_client is not None,
            "groq": groq_client is not None,
        },
    }


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting CumApp application...")
    uvicorn.run(
        "main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True
    )

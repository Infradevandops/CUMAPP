#!/usr/bin/env python3
"""
Main application file for the CumApp platform.
"""
import logging
import os
import asyncio
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

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
from api.performance_api import router as performance_router
from api.phone_number_api import router as phone_router
from api.smart_routing_api import router as smart_routing_router
from api.subscription_api import router as subscription_router
from api.verification_api import router as verification_router
from api.health_api import router as health_router
from clients.unified_client import get_unified_client
# Import core components
from core.database import check_database_connection, create_tables
from core.middleware import setup_middleware
from core.sentry_config import init_sentry, get_sentry_user_context

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")


async def lifespan(app: FastAPI):
    """Initialize database and check connections on startup"""
    logger.info("Initializing Sentry...")
    init_sentry()

    logger.info("Initializing database...")

    # Run blocking IO in a separate thread
    db_ok = await asyncio.to_thread(check_database_connection)
    if not db_ok:
        logger.error("Database connection failed!")
        raise RuntimeError("Database connection failed")

    try:
        # Run blocking IO in a separate thread
        await asyncio.to_thread(create_tables)
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
app.include_router(performance_router, prefix="/api/performance", tags=["performance"])
app.include_router(health_router, tags=["health"])


# --- Health Check Endpoint (Define before catch-all) ---
@app.get("/test-sentry")
async def test_sentry_error():
    """Test endpoint to trigger Sentry error tracking"""
    import sentry_sdk
    
    # Capture a test message
    sentry_sdk.capture_message("Test message from CumApp", level="info")
    
    # Trigger a test error
    try:
        1 / 0  # This will cause a ZeroDivisionError
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail="Test error for Sentry")

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        unified_client = get_unified_client()
        
        # Check frontend build status
        frontend_status = "available" if react_build_exists else "missing"
        
        return {
            "status": "healthy",
            "app_name": "CumApp",
            "version": "1.1.0",
            "database": check_database_connection(),
            "frontend": {
                "build_status": frontend_status,
                "build_exists": react_build_exists,
                "static_files": os.path.exists("frontend/build/static") if react_build_exists else False
            },
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


# --- Static File Serving for React App ---
# Check if React build exists
react_build_exists = os.path.exists("frontend/build/index.html")

# Log build status for debugging
if react_build_exists:
    logger.info("✅ React build found - serving React application")
    # Verify static files exist
    static_dir = "frontend/build/static"
    if os.path.exists(static_dir):
        js_files = len([f for f in os.listdir(f"{static_dir}/js") if f.endswith('.js')])
        css_files = len([f for f in os.listdir(f"{static_dir}/css") if f.endswith('.css')])
        logger.info(f"📁 Static files: {js_files} JS files, {css_files} CSS files")
    else:
        logger.warning("⚠️ Static directory missing")
else:
    logger.warning("❌ React build not found - using development fallback")
    logger.info("💡 To fix: cd frontend && npm run build")

if react_build_exists:
    # Serve static assets (CSS, JS, images)
    app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")
    
    # Root route - serve React app
    @app.get("/")
    async def serve_react_root():
        """Serve React app at root."""
        with open("frontend/build/index.html", "r") as f:
            return HTMLResponse(f.read())
    
    # Catch-all route for React Router (SPA routing) - MUST be last
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes."""
        # Skip API routes, docs, and health check
        if (full_path.startswith("api/") or 
            full_path.startswith("docs") or 
            full_path.startswith("redoc") or
            full_path.startswith("openapi.json") or
            full_path == "health"):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve React app for all other routes
        with open("frontend/build/index.html", "r") as f:
            return HTMLResponse(f.read())
            
else:
    # Development fallback when React build doesn't exist
    @app.get("/")
    async def development_root():
        """Development root when React build is not available."""
        return HTMLResponse("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CumApp - Development Mode</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100">
            <div class="container mx-auto mt-20 px-4">
                <div class="max-w-4xl mx-auto text-center">
                    <div class="bg-white rounded-lg shadow-lg p-8">
                        <h1 class="text-4xl font-bold text-gray-800 mb-4">CumApp - Development Mode</h1>
                        <p class="text-xl text-gray-600 mb-8">Backend is running, but React frontend needs to be built or started</p>
                        
                        <div class="bg-blue-50 p-6 rounded-lg mb-6">
                            <h3 class="text-lg font-semibold mb-3">Quick Start Options:</h3>
                            <div class="space-y-2 text-left">
                                <p><strong>Option 1 (Development):</strong> <code class="bg-gray-200 px-2 py-1 rounded">cd frontend && npm start</code></p>
                                <p><strong>Option 2 (Production):</strong> <code class="bg-gray-200 px-2 py-1 rounded">cd frontend && npm run build</code></p>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/docs" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                📖 API Documentation
                            </a>
                            <a href="/health" class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                                ❤️ Health Check
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """, status_code=200)





if __name__ == "__main__":
    import uvicorn

    logger.info("Starting CumApp application...")
    uvicorn.run(
        "main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True
    )
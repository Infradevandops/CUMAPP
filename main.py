import os
import random
import asyncio
from typing import Dict, Optional, List
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Import database components
from database import check_database_connection, create_tables

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

# Import our custom clients
from textverified_client import TextVerifiedClient
from groq_client import GroqAIClient
from mock_twilio_client import create_twilio_client, MockTwilioClient
from enhanced_twilio_client import EnhancedTwilioClient, create_enhanced_twilio_client

# Import API routes
from api.auth_api import router as auth_router
from api.verification_api import router as verification_router
from services.real_verification_service import real_verification_service
from services.real_sms_service import real_sms_service
from services.real_payment_service import real_payment_service
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

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API Configuration ---
# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# TextVerified Configuration
TEXTVERIFIED_API_KEY = os.getenv("TEXTVERIFIED_API_KEY")
TEXTVERIFIED_EMAIL = os.getenv("TEXTVERIFIED_EMAIL")

# Groq Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Check if credentials are set
if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
    logger.warning("Twilio credentials not fully configured. SMS service may not be available.")

if not all([TEXTVERIFIED_API_KEY, TEXTVERIFIED_EMAIL]):
    logger.warning("TextVerified credentials not configured. Verification service may not be available.")

if not GROQ_API_KEY:
    logger.warning("Groq API key not configured. AI assistance may not be available.")

# Initialize clients
twilio_client = None
enhanced_twilio_client = None
textverified_client = None
groq_client = None

# Use mock Twilio client if real credentials aren't available
USE_MOCK_TWILIO = os.getenv("USE_MOCK_TWILIO", "true").lower() == "true"

if USE_MOCK_TWILIO or not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
    twilio_client = create_twilio_client(use_mock=True)
    enhanced_twilio_client = None
    TWILIO_PHONE_NUMBER = TWILIO_PHONE_NUMBER or "+1555000001"  # Default mock number
    logger.info("Mock Twilio client initialized successfully")
else:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    enhanced_twilio_client = EnhancedTwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    logger.info("Real Twilio client and Enhanced Twilio client initialized successfully")

if all([TEXTVERIFIED_API_KEY, TEXTVERIFIED_EMAIL]):
    textverified_client = TextVerifiedClient(TEXTVERIFIED_API_KEY, TEXTVERIFIED_EMAIL)
    logger.info("TextVerified client initialized successfully")

if GROQ_API_KEY:
    groq_client = GroqAIClient(GROQ_API_KEY, GROQ_MODEL)
    logger.info("Groq AI client initialized successfully")

# Initialize database using lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and check connections on startup"""
    logger.info("Initializing database...")
    
    # Check database connection
    if not check_database_connection():
        logger.error("Database connection failed!")
        raise RuntimeError("Database connection failed")
    
    # Create tables if they don't exist
    try:
        create_tables()
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down application...")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="CumApp - Communication Platform",
    description="Comprehensive SMS and voice communication platform with AI assistance",
    version="1.1.0",
    lifespan=lifespan
)

# Add JWT Authentication Middleware
try:
    from middleware.auth_middleware import JWTAuthMiddleware, RateLimitMiddleware
    
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
        "/login"
    ]
    app.add_middleware(JWTAuthMiddleware, exclude_paths=excluded_paths)
    
    logger.info("JWT Authentication middleware added successfully")
except ImportError as e:
    logger.warning(f"Could not import JWT middleware: {e}")
except Exception as e:
    logger.warning(f"Error adding JWT middleware: {e}")

# Mount static files (for CSS, JS, images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(verification_router, prefix="/api/verification", tags=["verification"])
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

# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

# --- In-memory storage for TextVerified data ---
textverified_store: Dict[str, Dict] = {}

# --- Pydantic Models ---
class VerificationRequest(BaseModel):
    service_name: str
    capability: str = "sms"

class VerificationResponse(BaseModel):
    verification_id: str
    status: str
    message: str

class SMSRequest(BaseModel):
    to_number: str
    message: str
    from_number: Optional[str] = None

class AIRequest(BaseModel):
    conversation_history: List[Dict[str, str]]
    context: Optional[str] = None

# --- Health Check Endpoint ---
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "app_name": "CumApp",
        "version": "1.0.0",
        "services": {
            "twilio": twilio_client is not None,
            "textverified": textverified_client is not None,
            "groq": groq_client is not None
        }
    }

# --- Application Info ---
@app.get("/api/info")
async def get_app_info():
    """Get application information."""
    return {
        "app_name": "CumApp",
        "version": "1.0.0",
        "description": "Comprehensive communication platform",
        "features": [
            "SMS verification with TextVerified",
            "International SMS support",
            "AI-powered conversation assistance",
            "Health monitoring",
            "RESTful API"
        ],
        "endpoints": {
            "health": "/health",
            "verification": "/api/verification/*",
            "sms": "/api/sms/*",
            "ai": "/api/ai/*",
            "account": "/api/account/*",
            "services": "/api/services/*"
        }
    }

# --- SMS API Endpoints ---
@app.post("/api/sms/send")
async def send_sms(request: SMSRequest):
    """Send SMS using real or mock service."""
    try:
        result = await real_sms_service.send_sms(
            to_number=request.to_number,
            message=request.message,
            from_number=request.from_number
        )
        
        logger.info(f"SMS sent to {request.to_number} via {result['provider']}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")

@app.get("/api/sms/balance")
async def get_sms_balance():
    """Get SMS service balance."""
    try:
        balance = await real_sms_service.get_account_balance()
        return balance
    except Exception as e:
        logger.error(f"Failed to get balance: {e}")
        return {"balance": "0.00", "currency": "USD", "provider": "error"}

# --- Main Application Routes ---
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serves the landing page."""
    return templates.TemplateResponse("landing.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
async def chat_interface(request: Request):
    """Serves the chat interface."""
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Serves the registration page."""
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Serves the login page."""
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    """Serves the user dashboard."""
    return templates.TemplateResponse("user_dashboard.html", {"request": request})

@app.get("/services", response_class=HTMLResponse)
async def services_page(request: Request):
    """Serves the service selection page."""
    return templates.TemplateResponse("services.html", {"request": request})

@app.get("/verifications", response_class=HTMLResponse)
async def verifications_page(request: Request):
    """Serves the verification history page."""
    return templates.TemplateResponse("verifications.html", {"request": request})

@app.get("/numbers", response_class=HTMLResponse)
async def numbers_page(request: Request):
    """Serves the phone numbers marketplace."""
    return templates.TemplateResponse("numbers.html", {"request": request})

@app.get("/billing", response_class=HTMLResponse)
async def billing_page(request: Request):
    """Serves the billing and credits page."""
    return templates.TemplateResponse("billing.html", {"request": request})

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """Serves the admin dashboard."""
    return templates.TemplateResponse("admin.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting CumApp application...")
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
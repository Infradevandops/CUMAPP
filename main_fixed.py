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
textverified_client = None
groq_client = None

# Use mock Twilio client if real credentials aren't available
USE_MOCK_TWILIO = os.getenv("USE_MOCK_TWILIO", "true").lower() == "true"

if USE_MOCK_TWILIO or not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
    twilio_client = create_twilio_client(use_mock=True)
    TWILIO_PHONE_NUMBER = TWILIO_PHONE_NUMBER or "+1555000001"  # Default mock number
    logger.info("Mock Twilio client initialized successfully")
else:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    logger.info("Real Twilio client initialized successfully")

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
        "/chat"
    ]
    app.add_middleware(JWTAuthMiddleware, exclude_paths=excluded_paths)
    
    logger.info("JWT Authentication middleware added successfully")
except ImportError as e:
    logger.warning(f"Could not import JWT middleware: {e}")
except Exception as e:
    logger.warning(f"Error adding JWT middleware: {e}")

# Include API routes
try:
    from api.auth_api import router as auth_router
    app.include_router(auth_router)
    logger.info("Authentication API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import authentication API: {e}")
except Exception as e:
    logger.warning(f"Error including authentication API: {e}")

try:
    from api.messaging_api import router as messaging_router
    app.include_router(messaging_router)
    logger.info("Messaging API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import messaging API: {e}")
except Exception as e:
    logger.warning(f"Error including messaging API: {e}")

try:
    from api.session_api import router as session_router
    app.include_router(session_router)
    logger.info("Session management API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import session API: {e}")
except Exception as e:
    logger.warning(f"Error including session API: {e}")

try:
    from api.conversation_api import router as conversation_router
    app.include_router(conversation_router)
    logger.info("Conversation API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import conversation API: {e}")
except Exception as e:
    logger.warning(f"Error including conversation API: {e}")

try:
    from api.websocket_api import router as websocket_router
    app.include_router(websocket_router)
    logger.info("WebSocket API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import WebSocket API: {e}")
except Exception as e:
    logger.warning(f"Error including WebSocket API: {e}")

try:
    from api.enhanced_chat_api import router as enhanced_chat_router
    app.include_router(enhanced_chat_router)
    logger.info("Enhanced Chat API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import Enhanced Chat API: {e}")
except Exception as e:
    logger.warning(f"Error including Enhanced Chat API: {e}")

try:
    from api.phone_number_api import router as phone_number_router
    app.include_router(phone_number_router)
    logger.info("Phone Number API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import Phone Number API: {e}")
except Exception as e:
    logger.warning(f"Error including Phone Number API: {e}")

try:
    from api.verification_api import router as verification_router
    app.include_router(verification_router)
    logger.info("Verification API routes included successfully")
except ImportError as e:
    logger.warning(f"Could not import Verification API: {e}")
except Exception as e:
    logger.warning(f"Error including Verification API: {e}")

# Mount static files (for CSS, JS, images, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

# --- In-memory storage for TextVerified data ---
# In a production app, use a more persistent store like Redis or a database.
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
    """Send SMS using Twilio."""
    if not twilio_client:
        raise HTTPException(status_code=503, detail="Twilio SMS service is not configured")
    
    try:
        from_number = request.from_number or TWILIO_PHONE_NUMBER
        message = twilio_client.messages.create(
            body=request.message,
            from_=from_number,
            to=request.to_number
        )
        
        logger.info(f"SMS sent to {request.to_number}. Message SID: {message.sid}")
        return {
            "status": "sent",
            "message_sid": message.sid,
            "to": request.to_number,
            "from": from_number,
            "message": "SMS sent successfully"
        }
    except TwilioRestException as e:
        logger.error(f"Failed to send SMS: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")

# --- Main Application Routes ---
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serves the platform dashboard."""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
async def chat_interface(request: Request):
    """Serves the chat interface."""
    return templates.TemplateResponse("chat.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting CumApp application...")
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
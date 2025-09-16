#!/usr/bin/env python3
"""
Client initialization for external services.
"""
import logging
import os

from twilio.rest import Client

from enhanced_twilio_client import EnhancedTwilioClient
from groq_client import GroqAIClient
from textverified_client import TextVerifiedClient

logger = logging.getLogger(__name__)

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

twilio_client = None
enhanced_twilio_client = None
textverified_client = None
groq_client = None

if all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        enhanced_twilio_client = EnhancedTwilioClient(
            TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
        )
        logger.info(
            "Real Twilio client and Enhanced Twilio client initialized successfully"
        )
    except Exception as e:
        logger.error(f"Failed to initialize Twilio clients: {e}")
else:
    logger.warning(
        "Twilio credentials not fully configured. SMS service may not be available."
    )

if all([TEXTVERIFIED_API_KEY, TEXTVERIFIED_EMAIL]):
    try:
        textverified_client = TextVerifiedClient(
            TEXTVERIFIED_API_KEY, TEXTVERIFIED_EMAIL
        )
        logger.info("TextVerified client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize TextVerified client: {e}")
else:
    logger.warning(
        "TextVerified credentials not configured. Verification service may not be available."
    )

if GROQ_API_KEY:
    try:
        groq_client = GroqAIClient(GROQ_API_KEY, GROQ_MODEL)
        logger.info("Groq AI client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Groq AI client: {e}")
else:
    logger.warning("Groq API key not configured. AI assistance may not be available.")

#!/usr/bin/env python3
"""
Client initialization for external services.
Uses the unified client for all external service integrations.
"""
import logging

from clients.unified_client import get_unified_client

logger = logging.getLogger(__name__)

# Get the unified client instance
unified_client = get_unified_client()

# Legacy compatibility - expose individual clients for backward compatibility
twilio_client = unified_client.twilio_client
textverified_client = unified_client.textverified_client
groq_client = unified_client.groq_client

# Enhanced client compatibility
enhanced_twilio_client = unified_client.twilio_client

logger.info("Core clients initialized using unified client system")

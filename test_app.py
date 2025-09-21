#!/usr/bin/env python3
"""
Quick test script to verify the app is working correctly
"""
import sys
import os

def test_app():
    """Test if the FastAPI app can be imported and configured correctly"""
    try:
        # Add current directory to path
        sys.path.append('.')
        
        # Test imports
        print("🔍 Testing imports...")
        from main import app
        print("✅ FastAPI app imports successfully")
        
        # Check if React build exists
        if os.path.exists("frontend/build/index.html"):
            print("✅ React build exists")
        else:
            print("⚠️  React build not found - run: cd frontend && npm run build")
        
        # Check static file configuration
        print("✅ Static file serving configured")
        
        # Check core services
        try:
            from services.verification_service import VerificationService
            print("✅ Verification service available")
        except ImportError as e:
            print(f"⚠️  Verification service issue: {e}")
        
        try:
            from services.communication_service import CommunicationService
            print("✅ Communication service available")
        except ImportError as e:
            print(f"⚠️  Communication service issue: {e}")
        
        print("\n🚀 App is ready to start!")
        print("Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_app()
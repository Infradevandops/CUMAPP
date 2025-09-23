#!/usr/bin/env python3
"""Test basic imports to identify issues"""
import sys
import traceback

def test_imports():
    try:
        print("Testing basic imports...")
        
        # Test FastAPI
        from fastapi import FastAPI
        print("✅ FastAPI imported")
        
        # Test database
        from core.database import check_database_connection
        print("✅ Database module imported")
        
        # Test Sentry
        from core.sentry_config import init_sentry
        print("✅ Sentry config imported")
        
        # Test main app
        from main import app
        print("✅ Main app imported")
        
        print("🎉 All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_imports()
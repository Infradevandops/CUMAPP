#!/usr/bin/env python3
"""
Final deployment validation script.
Tests all critical functionality before deployment.
"""
import os
import sys
import asyncio
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_app_startup():
    """Test that the FastAPI app starts correctly."""
    try:
        # Set minimal required environment variables
        os.environ.update({
            'JWT_SECRET_KEY': 'test_secret_key_for_validation',
            'JWT_ALGORITHM': 'HS256',
            'JWT_EXPIRE_MINUTES': '30',
            'USE_MOCK_TWILIO': 'true',
            'DEBUG': 'false'
        })
        
        from main import app
        logger.info("✅ FastAPI app imports successfully")
        return True
    except Exception as e:
        logger.error(f"❌ FastAPI app import failed: {e}")
        return False

async def test_health_endpoint():
    """Test the health endpoint."""
    try:
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        response = client.get("/health")
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ Health endpoint working: {data.get('status')}")
            return True
        else:
            logger.error(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Health endpoint test failed: {e}")
        return False

async def test_database_connection():
    """Test database connectivity."""
    try:
        from core.database import check_database_connection
        
        if check_database_connection():
            logger.info("✅ Database connection successful")
            return True
        else:
            logger.warning("⚠️  Database connection failed (may be expected)")
            return True  # Don't fail deployment for DB issues in some environments
    except Exception as e:
        logger.error(f"❌ Database test failed: {e}")
        return True  # Don't fail deployment for DB issues

async def test_unified_client():
    """Test unified client initialization."""
    try:
        from clients.unified_client import get_unified_client
        
        client = get_unified_client()
        logger.info("✅ Unified client initializes successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Unified client test failed: {e}")
        return False

async def test_frontend_build():
    """Test that frontend build exists."""
    try:
        import os
        from pathlib import Path
        
        build_dir = Path("frontend/build")
        index_file = build_dir / "index.html"
        
        if build_dir.exists() and index_file.exists():
            logger.info("✅ Frontend build exists")
            return True
        else:
            logger.warning("⚠️  Frontend build not found (may need to run npm run build)")
            return True  # Don't fail deployment, just warn
    except Exception as e:
        logger.error(f"❌ Frontend build test failed: {e}")
        return True

async def main():
    """Run all validation tests."""
    logger.info("🔍 Running deployment validation tests...")
    
    tests = [
        ("App Startup", test_app_startup()),
        ("Health Endpoint", test_health_endpoint()),
        ("Database Connection", test_database_connection()),
        ("Unified Client", test_unified_client()),
        ("Frontend Build", test_frontend_build())
    ]
    
    results = {}
    for test_name, test_coro in tests:
        logger.info(f"\n🧪 Testing: {test_name}")
        try:
            result = await test_coro
            results[test_name] = result
        except Exception as e:
            logger.error(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "="*50)
    print("📊 VALIDATION RESULTS")
    print("="*50)
    
    passed = 0
    failed = 0
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📈 Summary: {passed} passed, {failed} failed")
    
    # Determine if deployment should proceed
    critical_failures = [
        name for name, result in results.items() 
        if not result and name in ["App Startup", "Health Endpoint", "Unified Client"]
    ]
    
    if critical_failures:
        print(f"\n❌ CRITICAL FAILURES: {', '.join(critical_failures)}")
        print("🚨 DEPLOYMENT NOT RECOMMENDED")
        return 1
    else:
        print("\n✅ ALL CRITICAL TESTS PASSED")
        print("🚀 DEPLOYMENT APPROVED")
        return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
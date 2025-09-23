#!/usr/bin/env python3
"""
Test Sentry setup and configuration.
"""
import os
import sys
import logging
import time
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_sentry_configuration():
    """Test Sentry configuration and integration."""
    logger.info("🔧 Testing Sentry Configuration...")
    
    # Check environment variables
    sentry_dsn = os.getenv("SENTRY_DSN")
    if not sentry_dsn:
        logger.error("❌ SENTRY_DSN environment variable not set")
        logger.info("💡 Set your Sentry DSN:")
        logger.info("   export SENTRY_DSN='https://2ce37686e54217bc6539cce15a0b3a3b@o4510054773555200.ingest.de.sentry.io/4510054775717968'")
        return False
    
    logger.info(f"✅ SENTRY_DSN found: {sentry_dsn[:50]}...")
    
    # Test Sentry import and initialization
    try:
        import sentry_sdk
        from core.sentry_config import init_sentry
        
        logger.info("✅ Sentry SDK imported successfully")
        
        # Initialize Sentry
        init_result = init_sentry()
        if init_result is False:
            logger.error("❌ Sentry initialization failed")
            return False
        
        logger.info("✅ Sentry initialized successfully")
        
    except ImportError as e:
        logger.error(f"❌ Failed to import Sentry SDK: {e}")
        logger.info("💡 Install Sentry SDK: pip install sentry-sdk")
        return False
    except Exception as e:
        logger.error(f"❌ Sentry initialization error: {e}")
        return False
    
    # Test error capture
    try:
        logger.info("📤 Testing error capture...")
        
        # Capture test message
        sentry_sdk.capture_message("Test message from Sentry setup verification", level="info")
        
        # Capture test exception
        try:
            raise ValueError("Test exception for Sentry verification")
        except ValueError as e:
            sentry_sdk.capture_exception(e)
        
        # Test custom metrics
        sentry_sdk.set_measurement("test_metric", 42.0)
        sentry_sdk.set_tag("test_tag", "sentry_verification")
        
        logger.info("✅ Test events sent to Sentry")
        
    except Exception as e:
        logger.error(f"❌ Failed to send test events: {e}")
        return False
    
    # Test performance monitoring
    try:
        logger.info("📊 Testing performance monitoring...")
        
        with sentry_sdk.start_transaction(name="test_transaction", op="test"):
            time.sleep(0.1)  # Simulate some work
            
            with sentry_sdk.start_span(description="test_span"):
                time.sleep(0.05)  # Simulate nested work
        
        logger.info("✅ Performance monitoring test completed")
        
    except Exception as e:
        logger.error(f"❌ Performance monitoring test failed: {e}")
        return False
    
    return True


def test_sentry_integrations():
    """Test Sentry integrations with FastAPI, SQLAlchemy, etc."""
    logger.info("🔌 Testing Sentry Integrations...")
    
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        from sentry_sdk.integrations.redis import RedisIntegration
        
        # Check if integrations are available
        integrations = [
            ("FastAPI", FastApiIntegration),
            ("SQLAlchemy", SqlalchemyIntegration),
            ("Redis", RedisIntegration),
        ]
        
        for name, integration_class in integrations:
            try:
                integration = integration_class()
                logger.info(f"✅ {name} integration available")
            except Exception as e:
                logger.warning(f"⚠️  {name} integration issue: {e}")
        
        logger.info("✅ Sentry integrations test completed")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Failed to import Sentry integrations: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Sentry integrations test failed: {e}")
        return False


def verify_sentry_dashboard():
    """Provide instructions for verifying Sentry dashboard."""
    logger.info("📊 Sentry Dashboard Verification...")
    logger.info("🌐 Visit your Sentry dashboard to verify events:")
    logger.info("   https://sentry.io/organizations/your-org/projects/python-fastapi/")
    logger.info("")
    logger.info("✅ You should see:")
    logger.info("   • Test message: 'Test message from Sentry setup verification'")
    logger.info("   • Test exception: 'ValueError: Test exception for Sentry verification'")
    logger.info("   • Performance transaction: 'test_transaction'")
    logger.info("   • Custom metrics and tags")
    logger.info("")
    logger.info("🔧 If you don't see events:")
    logger.info("   1. Check your SENTRY_DSN is correct")
    logger.info("   2. Verify your Sentry project settings")
    logger.info("   3. Check network connectivity")
    logger.info("   4. Review Sentry rate limits")


def main():
    """Main test function."""
    logger.info("🚀 Starting Sentry Setup Verification")
    logger.info("=" * 50)
    
    # Load environment variables
    env_file = project_root / ".env"
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)
        logger.info("✅ Environment variables loaded from .env")
    else:
        logger.warning("⚠️  No .env file found, using system environment variables")
    
    # Run tests
    tests = [
        ("Sentry Configuration", test_sentry_configuration),
        ("Sentry Integrations", test_sentry_integrations),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        logger.info(f"\n🧪 Running: {test_name}")
        
        if test_func():
            logger.info(f"✅ {test_name}: PASSED")
            passed += 1
        else:
            logger.error(f"❌ {test_name}: FAILED")
    
    # Print summary
    logger.info("\n" + "=" * 50)
    logger.info("📊 SENTRY SETUP TEST SUMMARY")
    logger.info("=" * 50)
    logger.info(f"Tests passed: {passed}/{total} ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        logger.info("🎉 All Sentry tests passed!")
        verify_sentry_dashboard()
        
        # Wait a moment for events to be sent
        logger.info("\n⏳ Waiting 5 seconds for events to be sent to Sentry...")
        time.sleep(5)
        
        logger.info("✅ Sentry setup verification completed!")
        logger.info("🚀 Your Sentry integration is ready for production!")
        
    else:
        logger.error("⚠️  Some Sentry tests failed. Please check the configuration.")
        logger.info("\n🔧 Troubleshooting steps:")
        logger.info("1. Verify your SENTRY_DSN is correct")
        logger.info("2. Check internet connectivity")
        logger.info("3. Ensure sentry-sdk is installed: pip install sentry-sdk")
        logger.info("4. Review the error messages above")


if __name__ == "__main__":
    main()
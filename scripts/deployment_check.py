#!/usr/bin/env python3
"""
Deployment readiness check script
"""
import os
import sys

def check_deployment_readiness():
    """Check if application is ready for deployment"""
    print("🔍 Checking deployment readiness...")
    
    # Check Python imports
    try:
        from main import app
        print("✅ Main application imports successfully")
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Check environment variables
    required_env = ['JWT_SECRET_KEY']
    missing_env = []
    
    for env_var in required_env:
        if not os.getenv(env_var):
            missing_env.append(env_var)
    
    if missing_env:
        print(f"⚠️  Missing environment variables: {missing_env}")
        print("ℹ️  Using defaults for CI testing")
    else:
        print("✅ Required environment variables present")
    
    # Check core modules
    try:
        import core.database
        import core.middleware
        import core.security
        print("✅ Core modules import successfully")
    except Exception as e:
        print(f"❌ Core module error: {e}")
        return False
    
    print("✅ Deployment readiness check passed!")
    return True

if __name__ == "__main__":
    success = check_deployment_readiness()
    sys.exit(0 if success else 1)
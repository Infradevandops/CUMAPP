#!/usr/bin/env python3
"""
Deployment readiness check script.
Validates environment variables and dependencies before deployment.
"""
import os
import sys
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_required_env_vars() -> Dict[str, Any]:
    """Check if required environment variables are set."""
    required_vars = [
        'JWT_SECRET_KEY',
        'JWT_ALGORITHM', 
        'JWT_EXPIRE_MINUTES'
    ]
    
    optional_vars = [
        'TEXTVERIFIED_API_KEY',
        'TEXTVERIFIED_EMAIL',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'GROQ_API_KEY',
        'DATABASE_URL',
        'REDIS_URL'
    ]
    
    results = {
        'required': {},
        'optional': {},
        'missing_required': [],
        'missing_optional': []
    }
    
    # Check required variables
    for var in required_vars:
        value = os.getenv(var)
        if value:
            results['required'][var] = '✅ Set'
        else:
            results['required'][var] = '❌ Missing'
            results['missing_required'].append(var)
    
    # Check optional variables
    for var in optional_vars:
        value = os.getenv(var)
        if value and not value.startswith('your_'):
            results['optional'][var] = '✅ Set'
        else:
            results['optional'][var] = '⚠️  Not configured (using defaults/mocks)'
            results['missing_optional'].append(var)
    
    return results

def check_imports() -> Dict[str, str]:
    """Check if critical imports work."""
    import_results = {}
    
    try:
        from main import app
        import_results['main_app'] = '✅ Success'
    except Exception as e:
        import_results['main_app'] = f'❌ Failed: {e}'
    
    try:
        from core.database import check_database_connection
        import_results['database'] = '✅ Success'
    except Exception as e:
        import_results['database'] = f'❌ Failed: {e}'
    
    try:
        from clients.unified_client import get_unified_client
        import_results['unified_client'] = '✅ Success'
    except Exception as e:
        import_results['unified_client'] = f'❌ Failed: {e}'
    
    return import_results

def check_database_connection() -> str:
    """Check database connectivity."""
    try:
        from core.database import check_database_connection
        if check_database_connection():
            return '✅ Database connection successful'
        else:
            return '⚠️  Database connection failed (may be expected in some environments)'
    except Exception as e:
        return f'❌ Database check error: {e}'

def main():
    """Run deployment readiness checks."""
    logger.info("🚀 Running deployment readiness checks...")
    
    # Check environment variables
    logger.info("\n📋 Checking environment variables...")
    env_results = check_required_env_vars()
    
    print("\n🔑 Required Environment Variables:")
    for var, status in env_results['required'].items():
        print(f"  {var}: {status}")
    
    print("\n🔧 Optional Environment Variables:")
    for var, status in env_results['optional'].items():
        print(f"  {var}: {status}")
    
    # Check imports
    logger.info("\n📦 Checking critical imports...")
    import_results = check_imports()
    
    print("\n📦 Import Status:")
    for module, status in import_results.items():
        print(f"  {module}: {status}")
    
    # Check database
    logger.info("\n🗄️  Checking database connection...")
    db_status = check_database_connection()
    print(f"\n🗄️  Database: {db_status}")
    
    # Summary
    print("\n" + "="*50)
    print("📊 DEPLOYMENT READINESS SUMMARY")
    print("="*50)
    
    # Critical issues
    critical_issues = []
    if env_results['missing_required']:
        critical_issues.append(f"Missing required env vars: {', '.join(env_results['missing_required'])}")
    
    failed_imports = [k for k, v in import_results.items() if v.startswith('❌')]
    if failed_imports:
        critical_issues.append(f"Failed imports: {', '.join(failed_imports)}")
    
    if critical_issues:
        print("❌ CRITICAL ISSUES FOUND:")
        for issue in critical_issues:
            print(f"  - {issue}")
        print("\n🚨 Deployment NOT recommended until issues are resolved.")
        return 1
    else:
        print("✅ NO CRITICAL ISSUES FOUND")
        
        if env_results['missing_optional']:
            print(f"\n⚠️  Optional services not configured: {len(env_results['missing_optional'])}")
            print("   App will run with mock services (recommended for testing)")
        
        print("\n🚀 DEPLOYMENT READY!")
        return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
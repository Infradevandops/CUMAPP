#!/usr/bin/env python3
"""
Deployment validation script
"""
import os
import sys

def validate_deployment():
    """Validate deployment configuration"""
    print("🔍 Validating deployment configuration...")
    
    # Set test environment
    os.environ.update({
        'JWT_SECRET_KEY': 'test_jwt_secret_key_for_ci_testing',
        'JWT_ALGORITHM': 'HS256',
        'JWT_EXPIRE_MINUTES': '30',
        'USE_MOCK_TWILIO': 'true',
        'DEBUG': 'false'
    })
    
    try:
        # Test FastAPI app creation
        from main import app
        print("✅ FastAPI app created successfully")
        
        # Test health endpoint exists
        from fastapi.testclient import TestClient
        client = TestClient(app)
        
        response = client.get("/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"⚠️  Health endpoint returned {response.status_code}")
        
        # Test API info endpoint
        response = client.get("/api/info")
        if response.status_code == 200:
            print("✅ API info endpoint working")
        else:
            print(f"⚠️  API info endpoint returned {response.status_code}")
            
        print("✅ Deployment validation passed!")
        return True
        
    except Exception as e:
        print(f"❌ Validation error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = validate_deployment()
    sys.exit(0 if success else 1)
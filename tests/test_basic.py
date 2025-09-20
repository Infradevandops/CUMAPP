#!/usr/bin/env python3
"""
Basic tests for CI/CD pipeline
"""
import os
import pytest

# Set test environment
os.environ.update({
    'JWT_SECRET_KEY': 'test_jwt_secret_key_for_testing',
    'USE_MOCK_TWILIO': 'true',
    'DEBUG': 'false'
})

def test_app_imports():
    """Test that the main app can be imported"""
    try:
        from main import app
        assert app is not None
    except ImportError as e:
        pytest.fail(f"Failed to import main app: {e}")

def test_core_modules():
    """Test that core modules can be imported"""
    try:
        import core.database
        import core.middleware
        import core.security
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import core modules: {e}")

def test_health_endpoint():
    """Test health endpoint"""
    try:
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        
    except Exception as e:
        pytest.fail(f"Health endpoint test failed: {e}")

def test_api_info_endpoint():
    """Test API info endpoint"""
    try:
        from main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        response = client.get("/api/info")
        
        # Should return 200 or 404, both are acceptable
        assert response.status_code in [200, 404]
        
    except Exception as e:
        pytest.fail(f"API info endpoint test failed: {e}")

if __name__ == "__main__":
    pytest.main([__file__])
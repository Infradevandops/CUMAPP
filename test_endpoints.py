#!/usr/bin/env python3
"""
Quick test to verify endpoints are working
"""
import requests
import time

def test_endpoints():
    """Test the main endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing CumApp endpoints...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"⚠️  Health endpoint returned {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test root endpoint (React app)
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            if "CumApp" in response.text:
                print("✅ Root endpoint serving React app")
            else:
                print("⚠️  Root endpoint working but content unexpected")
        else:
            print(f"⚠️  Root endpoint returned {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
    
    # Test API docs
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API docs working")
        else:
            print(f"⚠️  API docs returned {response.status_code}")
    except Exception as e:
        print(f"❌ API docs failed: {e}")
    
    print("\n🎉 Test completed!")
    print(f"🌐 Visit your app at: {base_url}")
    print(f"📖 API docs at: {base_url}/docs")

if __name__ == "__main__":
    test_endpoints()
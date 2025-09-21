import sys
sys.path.append('.')

try:
    print("Testing FastAPI import...")
    from main import app
    print("✅ SUCCESS: FastAPI app imported")
    
    print("Testing React build...")
    import os
    if os.path.exists("frontend/build/index.html"):
        print("✅ SUCCESS: React build found")
    else:
        print("⚠️  WARNING: React build not found")
    
    print("🚀 App is ready!")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
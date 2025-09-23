#!/usr/bin/env python3
"""
Quick start script - minimal server
"""
import subprocess
import sys
import time
import requests

def find_free_port():
    """Find a free port"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

def start_server():
    """Start server on free port"""
    # Kill any existing processes
    subprocess.run(["pkill", "-f", "uvicorn"], capture_output=True)
    time.sleep(2)
    
    # Find free port
    port = find_free_port()
    print(f"🚀 Starting server on port {port}...")
    
    # Start server
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port)]
    process = subprocess.Popen(cmd)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    for i in range(10):
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=2)
            if response.status_code == 200:
                print(f"✅ Server running at http://localhost:{port}")
                print(f"📖 API Docs: http://localhost:{port}/docs")
                print(f"🔑 Login: admin@cumapp.com / admin123")
                return port
        except:
            time.sleep(2)
    
    print("❌ Server failed to start")
    return None

if __name__ == "__main__":
    port = start_server()
    if port:
        print(f"\n🎯 Test login:")
        print(f"curl -X POST http://localhost:{port}/api/auth/login \\")
        print(f'  -H "Content-Type: application/json" \\')
        print(f'  -d \'{{"email": "admin@cumapp.com", "password": "admin123"}}\'')
        
        # Keep running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Shutting down...")
            subprocess.run(["pkill", "-f", "uvicorn"], capture_output=True)
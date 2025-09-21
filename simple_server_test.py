#!/usr/bin/env python3
"""
Simple server test to see what's happening
"""
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import os

# Create a minimal test app
app = FastAPI()

@app.get("/")
async def root():
    return HTMLResponse("""
    <html>
        <head><title>Test Server</title></head>
        <body>
            <h1>🚀 Test Server is Working!</h1>
            <p>If you see this, the server is running correctly.</p>
            <p>React build exists: {}</p>
        </body>
    </html>
    """.format("Yes" if os.path.exists("frontend/build/index.html") else "No"))

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Test server is healthy"}

if __name__ == "__main__":
    import uvicorn
    print("🧪 Starting test server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
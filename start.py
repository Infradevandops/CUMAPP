#!/usr/bin/env python3
"""
Unified startup script for CumApp - handles both frontend and backend
"""
import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

class CumAppStarter:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.frontend_path = self.project_root / "frontend"
        self.processes = []
        self.running = True
        
    def log(self, message, prefix="🚀"):
        print(f"{prefix} {message}")
    
    def check_dependencies(self):
        """Check if required dependencies are available"""
        self.log("Checking dependencies...", "🔍")
        
        # Check Python dependencies
        try:
            import fastapi
            import uvicorn
            self.log("✅ Python dependencies found")
        except ImportError as e:
            self.log(f"❌ Missing Python dependencies: {e}", "❌")
            self.log("Run: pip install -r requirements.txt", "💡")
            return False
        
        # Check if frontend exists
        if self.frontend_path.exists():
            # Check if node_modules exists
            if not (self.frontend_path / "node_modules").exists():
                self.log("Installing frontend dependencies...", "📦")
                try:
                    subprocess.run(["npm", "install"], cwd=self.frontend_path, check=True)
                    self.log("✅ Frontend dependencies installed")
                except (subprocess.CalledProcessError, FileNotFoundError):
                    self.log("❌ Failed to install frontend dependencies", "❌")
                    self.log("Make sure Node.js and npm are installed", "💡")
                    return False
        
        return True
    
    def start_backend(self):
        """Start the FastAPI backend"""
        self.log("Starting backend server...", "🔧")
        
        try:
            # Use uvicorn for development
            cmd = [
                sys.executable, "-m", "uvicorn", "main:app",
                "--host", "0.0.0.0",
                "--port", "8000",
                "--reload"
            ]
            
            backend_process = subprocess.Popen(
                cmd,
                cwd=self.project_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True
            )
            
            self.processes.append(("Backend", backend_process))
            
            # Monitor backend startup
            def monitor_backend():
                for line in backend_process.stdout:
                    if self.running:
                        print(f"🔧 Backend: {line.strip()}")
                    if "Uvicorn running on" in line:
                        self.log("✅ Backend server started successfully")
            
            threading.Thread(target=monitor_backend, daemon=True).start()
            
            return True
            
        except Exception as e:
            self.log(f"❌ Failed to start backend: {e}", "❌")
            return False
    
    def start_frontend(self):
        """Start the React frontend"""
        if not self.frontend_path.exists():
            self.log("No frontend directory found, skipping...", "⚠️")
            return True
            
        self.log("Starting frontend development server...", "⚛️")
        
        try:
            # Check if build exists, if not start dev server
            build_path = self.frontend_path / "build"
            
            if build_path.exists():
                self.log("Frontend build found, backend will serve it", "📦")
                return True
            
            # Start React dev server
            cmd = ["npm", "start"]
            
            frontend_process = subprocess.Popen(
                cmd,
                cwd=self.frontend_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                env={**os.environ, "BROWSER": "none"}  # Don't auto-open browser
            )
            
            self.processes.append(("Frontend", frontend_process))
            
            # Monitor frontend startup
            def monitor_frontend():
                for line in frontend_process.stdout:
                    if self.running:
                        print(f"⚛️  Frontend: {line.strip()}")
                    if "webpack compiled" in line or "Local:" in line:
                        self.log("✅ Frontend server started successfully")
            
            threading.Thread(target=monitor_frontend, daemon=True).start()
            
            return True
            
        except Exception as e:
            self.log(f"❌ Failed to start frontend: {e}", "❌")
            return False
    
    def wait_for_health(self):
        """Wait for backend to be healthy"""
        self.log("Waiting for backend to be ready...", "⏳")
        
        import requests
        
        max_retries = 30
        for i in range(max_retries):
            try:
                response = requests.get("http://localhost:8000/health", timeout=2)
                if response.status_code == 200:
                    self.log("✅ Backend is healthy and ready!")
                    return True
            except requests.RequestException:
                pass
            
            if i < max_retries - 1:
                time.sleep(2)
        
        self.log("❌ Backend health check failed", "❌")
        return False
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(signum, frame):
            self.log("Shutting down gracefully...", "🛑")
            self.running = False
            self.cleanup()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def cleanup(self):
        """Clean up all processes"""
        self.log("Cleaning up processes...", "🧹")
        
        for name, process in self.processes:
            if process.poll() is None:
                self.log(f"Stopping {name}...", "🛑")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
    
    def show_info(self):
        """Show application information"""
        self.log("=" * 50, "")
        self.log("🎉 CumApp Started Successfully!", "")
        self.log("=" * 50, "")
        self.log("Backend API: http://localhost:8000", "🔧")
        self.log("API Docs: http://localhost:8000/docs", "📖")
        self.log("Health Check: http://localhost:8000/health", "❤️")
        
        if self.frontend_path.exists():
            build_path = self.frontend_path / "build"
            if build_path.exists():
                self.log("Frontend: http://localhost:8000 (served by backend)", "⚛️")
            else:
                self.log("Frontend: http://localhost:3000 (dev server)", "⚛️")
        
        self.log("=" * 50, "")
        self.log("Press Ctrl+C to stop all services", "💡")
        self.log("=" * 50, "")
    
    def start(self):
        """Start the complete application"""
        self.log("Starting CumApp...", "🚀")
        
        # Setup signal handlers
        self.setup_signal_handlers()
        
        # Check dependencies
        if not self.check_dependencies():
            return False
        
        # Start backend
        if not self.start_backend():
            return False
        
        # Wait a moment for backend to start
        time.sleep(3)
        
        # Start frontend
        if not self.start_frontend():
            return False
        
        # Wait for backend health
        if not self.wait_for_health():
            return False
        
        # Show info
        self.show_info()
        
        # Keep running
        try:
            while self.running:
                time.sleep(1)
                
                # Check if any process died
                for name, process in self.processes:
                    if process.poll() is not None:
                        self.log(f"❌ {name} process died unexpectedly", "❌")
                        self.cleanup()
                        return False
                        
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()
        
        return True


def main():
    """Main function"""
    starter = CumAppStarter()
    
    try:
        success = starter.start()
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        starter.cleanup()
        sys.exit(1)


if __name__ == "__main__":
    main()
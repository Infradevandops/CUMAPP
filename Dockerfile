# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies including Node.js for frontend build
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        curl \
        build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Build frontend if it exists and no build directory present
RUN if [ -d "frontend" ] && [ ! -f "frontend/build/index.html" ]; then \
        echo "Building frontend..." && \
        cd frontend && \
        npm install --legacy-peer-deps --ignore-scripts && \
        npm run build && \
        echo "Frontend build completed"; \
    elif [ -f "frontend/build/index.html" ]; then \
        echo "Frontend build already exists"; \
    else \
        echo "No frontend directory found"; \
    fi

# Create directories for static files and templates if they don't exist
RUN mkdir -p static templates logs

# Verify frontend build
RUN if [ -f "frontend/build/index.html" ]; then \
        echo "✅ Frontend build verified: $(ls -la frontend/build/index.html)"; \
    else \
        echo "❌ Frontend build missing - will use development fallback"; \
    fi

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' --shell /bin/bash appuser \
    && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
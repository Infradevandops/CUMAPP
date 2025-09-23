# 🚀 Production Deployment Steps

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Generate strong SECRET_KEY: `openssl rand -base64 32`
- [ ] Set up production database (PostgreSQL)
- [ ] Configure Sentry DSN (already set)
- [ ] Set up Twilio credentials (if using SMS)
- [ ] Configure email settings

### 2. Code Preparation
- [ ] All tests passing
- [ ] Frontend built successfully
- [ ] Environment variables configured
- [ ] Security settings enabled

## 🚂 Railway Deployment (Recommended)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Step 2: Initialize Project
```bash
railway init
railway link
```

### Step 3: Add Database
```bash
railway add postgresql
```

### Step 4: Set Environment Variables
```bash
# Generate secure secret key
SECRET_KEY=$(openssl rand -base64 32)
railway variables:set SECRET_KEY="$SECRET_KEY"

# Set other variables
railway variables:set ENVIRONMENT="production"
railway variables:set SENTRY_DSN="https://2ce37686e54217bc6539cce15a0b3a3b@o4510054773555200.ingest.de.sentry.io/4510054775717968"
railway variables:set DEBUG="false"

# Database will be auto-configured by Railway
```

### Step 5: Deploy
```bash
railway up
```

### Step 6: Verify Deployment
```bash
# Get your app URL
railway status

# Test health endpoint
curl https://your-app-url.railway.app/health
```

## 🎨 Alternative: Render Deployment

### Step 1: Connect Repository
1. Go to render.com
2. Connect your GitHub repository
3. Select "Web Service"

### Step 2: Configure Service
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
- **Health Check Path**: `/health`

### Step 3: Add Database
1. Create PostgreSQL database
2. Connect to your service

### Step 4: Set Environment Variables
- `ENVIRONMENT=production`
- `SECRET_KEY` (auto-generate)
- `DATABASE_URL` (from database)
- `SENTRY_DSN=https://2ce37686e54217bc6539cce15a0b3a3b@o4510054773555200.ingest.de.sentry.io/4510054775717968`

## 📊 Post-Deployment Verification

### Health Checks
```bash
curl https://your-domain.com/health
curl https://your-domain.com/health/detailed
curl https://your-domain.com/health/database
```

### Sentry Verification
1. Check Sentry dashboard for deployment event
2. Verify error tracking is working
3. Test performance monitoring

### Performance Testing
```bash
# Test basic endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/health
```

## 🔧 Troubleshooting

### Common Issues
1. **Port binding**: Ensure using `$PORT` environment variable
2. **Database connection**: Check DATABASE_URL format
3. **Static files**: Verify frontend build exists
4. **Environment variables**: Double-check all required vars are set

### Debug Commands
```bash
# Railway logs
railway logs

# Check environment variables
railway variables

# Connect to database
railway connect postgresql
```

## 🎯 Success Criteria
- [ ] Application accessible via HTTPS
- [ ] Health checks passing
- [ ] Database connected
- [ ] Sentry monitoring active
- [ ] Frontend loading correctly
- [ ] API endpoints responding
- [ ] SSL certificate valid
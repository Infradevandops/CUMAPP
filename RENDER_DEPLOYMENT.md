# 🚀 Render Deployment Guide

## 📋 **Environment Variables for Render**

Copy these **exact values** to your Render service:

### **Required (Minimum Setup):**
```
JWT_SECRET_KEY = CumApp2024SecureJWTKeyForProductionUse32Chars
PORT = 10000
DEBUG = false
```

### **Optional (Full Features):**
```
TEXTVERIFIED_API_KEY = your_textverified_api_key_here
TEXTVERIFIED_EMAIL = your_email@domain.com
TWILIO_ACCOUNT_SID = your_twilio_account_sid_here
TWILIO_AUTH_TOKEN = your_twilio_auth_token_here
TWILIO_PHONE_NUMBER = +1234567890
GROQ_API_KEY = your_groq_api_key_here
```

## 🔧 **Render Setup Steps:**

1. **Create Web Service**
   - Connect GitHub repo: `https://github.com/Infradevandops/CUMAPP`
   - Branch: `main`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host=0.0.0.0 --port=10000`

2. **Add Environment Variables**
   - Go to Environment tab
   - Add each variable from above
   - Save changes

3. **Deploy**
   - Click "Deploy Latest Commit"
   - Wait for build to complete

## 🌐 **Your App URLs:**
- **Live App**: `https://your-service-name.onrender.com`
- **API Docs**: `https://your-service-name.onrender.com/docs`
- **Health Check**: `https://your-service-name.onrender.com/health`

## ✅ **Verification:**
```bash
# Test deployment
curl https://your-service-name.onrender.com/health
```

**Result: App is live with mock SMS services!** 🎉
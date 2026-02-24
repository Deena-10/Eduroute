# Backend Debugging Guide - POST /api/ai/generate-career-roadmap

## 🔍 **Issue Analysis**

The backend is running on port 5000 but has a JavaScript error:
```
Cannot access 'userDomain' before initialization
```

## ✅ **Fixed Issues**

1. **Temporal Dead Zone Error**: Fixed by using `domain` from `req.body` in error handling
2. **Route Registration**: ✅ Confirmed `/api/ai` routes are properly registered
3. **CORS Configuration**: ✅ Allows requests from `http://localhost:3000`
4. **AI Service Connection**: Enhanced with detailed logging

## 🚀 **Step-by-Step Debugging**

### 1. **Restart Backend Services**
```bash
# Stop current backend (Ctrl+C)
# Restart Express backend
cd c:\finalyearproject\career-roadmap-app\backend
npm start

# In separate terminal, start Flask AI service
cd c:\finalyearproject\career-roadmap-app\backend\service
python application.py
```

### 2. **Verify Backend Health**
```bash
# Test Express backend
curl http://localhost:5000

# Test AI route health check
curl http://localhost:5000/api/ai/health

# Test Flask AI service
curl http://localhost:5001
```

### 3. **Check Backend Logs**
Look for these log messages:
- ✅ `Server running on http://localhost:5000`
- ✅ `PostgreSQL Connected`
- ✅ `Firebase Admin SDK initialized successfully`
- 🔍 `[ROADMAP] User selected domain: java full stack`
- 🔍 `[ROADMAP] AI Service URL: http://localhost:5001`
- 🔍 `[ROADMAP] Calling AI service endpoint: /generate_career_roadmap_direct`

### 4. **Test the Specific Endpoint**
```bash
curl -X POST http://localhost:5000/api/ai/generate-career-roadmap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "domain": "javascript",
    "proficiency_level": "Beginner",
    "professional_goal": "job-ready",
    "current_status": "College student"
  }'
```

## 🛠️ **Common Issues & Solutions**

### **Issue 1: AI Service Not Running**
**Symptoms**: `ECONNREFUSED` errors
**Solution**: Start Flask AI service
```bash
cd backend/service
python application.py
```

### **Issue 2: Invalid JWT Token**
**Symptoms**: 401 Unauthorized errors
**Solution**: Get valid token from login endpoint first

### **Issue 3: Port Conflicts**
**Symptoms**: `EADDRINUSE` errors
**Solution**: Kill processes using ports 5000/5001
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :5001
```

### **Issue 4: CORS Issues**
**Symptoms**: No 'Access-Control-Allow-Origin' header
**Solution**: Frontend must be on http://localhost:3000

## 📊 **Expected Log Output**

Working correctly should show:
```
[ROADMAP] User selected domain: java full stack
[ROADMAP] AI Service URL: http://localhost:5001
[ROADMAP] Calling AI service endpoint: /generate_career_roadmap_direct
[ROADMAP] AI service response status: 200
[ROADMAP] Roadmap received, domain: Java Full Stack
[ROADMAP] Roadmap phases count: 4
[VALIDATION SUCCESS] Roadmap passed all strict checks.
[ROADMAP] Stored roadmap for user 123 with domain: Java Full Stack
```

## 🔧 **Configuration Check**

### **Backend .env Requirements**
```
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:5001
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
```

### **Frontend Axios Configuration**
```javascript
baseURL: 'http://localhost:5000/api'
headers: { 'Content-Type': 'application/json' }
```

## 🚨 **If Still Failing**

1. **Check Flask AI Service Logs**: Look for Python errors
2. **Verify Database Connection**: Check PostgreSQL status
3. **Test Simpler Endpoint**: Try `/api/ai/health` first
4. **Check Network**: Ensure no firewall blocking ports

## 🎯 **Success Indicators**

- ✅ Backend responds with 200 status
- ✅ Frontend receives roadmap data
- ✅ No JavaScript errors in console
- ✅ Roadmap appears in Questionnaire flow

Follow these steps systematically to identify and resolve the exact issue!

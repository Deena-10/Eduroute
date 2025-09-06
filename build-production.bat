@echo off
echo 🚀 Building for production...

REM Build Backend
echo 📦 Building backend...
cd backend
call npm install --production
echo ✅ Backend dependencies installed

REM Build Frontend
echo 📦 Building frontend...
cd ..\frontend
call npm install
call npm run build
echo ✅ Frontend built successfully

REM Create production directory
echo 📁 Creating production directory...
cd ..
if exist production-build rmdir /s /q production-build
mkdir production-build
xcopy backend production-build\backend\ /e /i /h /y
xcopy frontend\build production-build\frontend-dist\ /e /i /h /y
copy package.json production-build\
copy README.md production-build\

REM Remove development files
echo 🧹 Cleaning up development files...
rmdir /s /q production-build\backend\node_modules
if exist production-build\backend\.env del production-build\backend\.env
if exist production-build\backend\serviceAccountKey*.json del production-build\backend\serviceAccountKey*.json
if exist production-build\backend\firebase_id.json del production-build\backend\firebase_id.json
if exist production-build\backend\create-*.js del production-build\backend\create-*.js
if exist production-build\backend\update-*.js del production-build\backend\update-*.js
if exist production-build\backend\setup-*.js del production-build\backend\setup-*.js

echo ✅ Production build completed!
echo 📁 Production files are in: production-build\
echo.
echo 🔒 Security Checklist:
echo   ✅ Debug tools removed
echo   ✅ Sensitive files excluded
echo   ✅ Development dependencies removed
echo   ✅ Production build created
echo.
echo ⚠️  Remember to:
echo   - Set up environment variables in your deployment platform
echo   - Configure production database
echo   - Update Firebase authorized domains
echo   - Enable HTTPS
pause

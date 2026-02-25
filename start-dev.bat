@echo off
SET PROJECT_ROOT=%~dp0
echo Cleaning up previous sessions...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul

echo.
echo 1/3: Starting Node.js Backend on Port 5000...
start "BACKEND_SRV" cmd /k "cd /d %PROJECT_ROOT%backend && npm start"

echo 2/3: Starting Flask AI on Port 5001...
:: Using %PROJECT_ROOT% ensures we don't get 'Path not found'
start "AI_SRV" cmd /k "cd /d %PROJECT_ROOT%ai_service && python application.py"

timeout /t 5 /nobreak >nul

echo 3/3: Starting React Frontend on Port 3000...
start "FRONTEND_UI" cmd /k "cd /d %PROJECT_ROOT%frontend && npm start"

echo.
echo Check the 'BACKEND_SRV' window. If you see 'Prisma Client' errors, 
echo run 'npx prisma generate' inside the backend folder.
pause
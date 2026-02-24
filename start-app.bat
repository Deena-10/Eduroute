@echo off
echo Starting Career Roadmap App...
echo.

start "Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 /nobreak >nul

start "AI Service" cmd /k "cd /d %~dp0backend\service && python application.py"
timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo All services starting...
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   AI:       http://localhost:5001
echo.
echo Run stop-app.bat to stop all services.
echo.
pause

@echo off
echo Starting Career Roadmap App Development Environment...
echo.

echo Starting Node.js Backend...
start "Backend" cmd /k "cd backend && npm start"

echo Starting Flask AI Service...
start "AI Service" cmd /k "cd backend/service && python application.py"

echo Starting React Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo All services are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo AI Service: http://localhost:5001
echo.
pause

@echo off
echo Stopping Career Roadmap App...
echo.

taskkill /F /IM node.exe 2>nul && echo Stopped Node.js (backend, frontend) || echo No Node.js processes found
taskkill /F /IM python.exe 2>nul && echo Stopped Python (AI service) || echo No Python processes found

echo.
echo All services stopped.
echo.
pause

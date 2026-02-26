@echo off
SET PROJECT_ROOT=%~dp0
title EduRoute - Mobile testing

REM ========== SET YOUR LAPTOP'S IP HERE ==========
REM When phone uses your laptop's hotspot, or both are on same WiFi, find IP with: ipconfig
REM Look for "IPv4 Address" under your active adapter (e.g. Wireless LAN or Ethernet).
set LAPTOP_IP=10.19.244.143
REM ===============================================

echo.
echo ========================================
echo   Mobile testing - open on phone:
echo   http://%LAPTOP_IP%:3000
echo ========================================
echo.
pause

set FRONTEND_URL=http://%LAPTOP_IP%:3000
set REACT_APP_API_URL=http://%LAPTOP_IP%:5000/api

echo Cleaning up previous sessions...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul

echo 1/3: Starting Backend...
start "BACKEND_SRV" cmd /k "cd /d %PROJECT_ROOT%backend && set FRONTEND_URL=%FRONTEND_URL% && npm start"

echo 2/3: Starting AI service...
start "AI_SRV" cmd /k "cd /d %PROJECT_ROOT%ai_service && python application.py"

timeout /t 5 /nobreak >nul

echo 3/3: Starting React (HOST=0.0.0.0)...
start "FRONTEND_UI" cmd /k "cd /d %PROJECT_ROOT%frontend && set HOST=0.0.0.0 && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

echo.
echo On your phone, open:  http://%LAPTOP_IP%:3000
echo.
pause

@echo off
echo Starting AI Service with PostgreSQL...
cd /d "%~dp0"
call ..\..\ai_service\venv\Scripts\activate
echo.
echo [INFO] Make sure PostgreSQL is running and database 'career_roadmap' exists
echo [INFO] Update your .env file with correct database credentials
echo.
python application.py
pause

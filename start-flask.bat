@echo off
echo Starting Flask AI Service...
echo.

cd /d "%~dp0\ai_service\venv\Scripts"
call activate.bat

cd /d "%~dp0\backend\service"
echo Current directory: %CD%
echo.

echo Installing/updating Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask server on http://localhost:5001
echo Press Ctrl+C to stop the server
echo.

python application.py

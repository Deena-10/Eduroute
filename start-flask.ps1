Write-Host "Starting Flask AI Service..." -ForegroundColor Green
Write-Host ""

# Navigate to the project root
Set-Location $PSScriptRoot

# Activate the virtual environment
Write-Host "Activating Python virtual environment..." -ForegroundColor Yellow
& ".\ai_service\venv\Scripts\Activate.ps1"

# Navigate to the service directory
Set-Location ".\backend\service"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Install/update dependencies
Write-Host "Installing/updating Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "Starting Flask server on http://localhost:5001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Flask application
python application.py

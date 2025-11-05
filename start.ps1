# Start both Backend and Frontend

Write-Host "🚀 Starting AI Resume Matcher..." -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

# Check if .env files exist
if (!(Test-Path "backend/.env")) {
    Write-Host "❌ backend/.env not found. Run ./setup.ps1 first!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "frontend/.env.local")) {
    Write-Host "❌ frontend/.env.local not found. Run ./setup.ps1 first!" -ForegroundColor Red
    exit 1
}

Write-Host "Starting Backend on port 5000..." -ForegroundColor Yellow
Write-Host "Starting Frontend on port 3000...`n" -ForegroundColor Yellow

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; npm run dev"

# Wait a bit before starting frontend
Start-Sleep -Seconds 2

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; npm run dev"

Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "`n📱 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   API:      http://localhost:5000/api" -ForegroundColor White
Write-Host "`n⚠️  Close the terminal windows to stop the servers.`n" -ForegroundColor Yellow

# Quick Setup Script for AI Resume Matcher

Write-Host "🚀 AI Resume Matcher - Quick Setup" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
}

# Check MongoDB
Write-Host "`nChecking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB not detected. Make sure it's running before starting backend!" -ForegroundColor Yellow
    Write-Host "   Start MongoDB with: mongod" -ForegroundColor Gray
}

# Backend setup
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Cyan
Set-Location backend

if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit backend/.env with your API keys!" -ForegroundColor Yellow
}

if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend installation failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Frontend setup
Write-Host "`n📦 Setting up Frontend..." -ForegroundColor Cyan
Set-Location ../frontend

if (!(Test-Path ".env.local")) {
    Write-Host "Creating .env.local file from .env.local.example..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "⚠️  Please edit frontend/.env.local with your Clerk keys!" -ForegroundColor Yellow
}

if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend installation failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

Set-Location ..

Write-Host "`n✨ Setup Complete!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your API keys (Clerk, Gemini, MongoDB)" -ForegroundColor White
Write-Host "2. Edit frontend/.env.local with your Clerk keys" -ForegroundColor White
Write-Host "3. Make sure MongoDB is running" -ForegroundColor White
Write-Host "4. Run: ./start.ps1 (to start both servers)" -ForegroundColor White
Write-Host "`nFor detailed setup guide, see README.md" -ForegroundColor Gray

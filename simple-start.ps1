# Simple Expo Start - Jaisa Pehle Hota Tha
Write-Host "🚀 Starting Expo (Simple Mode)..." -ForegroundColor Cyan
Write-Host "📡 Backend: http://192.168.0.105:5144" -ForegroundColor Yellow
Write-Host ""

# Clear Expo cache first
Write-Host "🧹 Clearing cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
}

# Clear Metro bundler cache
if (Test-Path "$env:TEMP/metro-*") {
    Remove-Item -Recurse -Force "$env:TEMP/metro-*" -ErrorAction SilentlyContinue
}

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Starting Expo..." -ForegroundColor Yellow
Write-Host ""

# Simple expo start - jaisa pehle hota tha
expo start


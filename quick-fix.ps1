# Quick Fix - Expo Start Ko Wapas Simple Banana
Write-Host "🔧 Quick Fix - Restoring Simple Expo Start..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Expo Cache
Write-Host "🧹 Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
    Write-Host "✅ Expo cache cleared!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No .expo cache found" -ForegroundColor Gray
}

# Step 2: Clear Metro Bundler Cache
Write-Host "🧹 Clearing Metro bundler cache..." -ForegroundColor Yellow
Get-ChildItem "$env:TEMP" -Filter "metro-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Metro cache cleared!" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Cache cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Expo (Simple Mode)..." -ForegroundColor Cyan
Write-Host "📡 Backend: http://192.168.0.105:5144" -ForegroundColor Yellow
Write-Host ""

# Step 3: Start Expo (Simple - jaisa pehle hota tha)
npx expo start


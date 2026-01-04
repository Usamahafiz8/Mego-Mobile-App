# Fix Expo CLI Bug and Start
Write-Host "🔧 Fixing Expo Start Error..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Update Expo CLI
Write-Host "📦 Updating Expo CLI to latest version..." -ForegroundColor Yellow
npm install -g @expo/cli@latest

Write-Host ""
Write-Host "✅ Expo CLI updated!" -ForegroundColor Green
Write-Host ""

# Step 2: Start Expo with tunnel mode (bypasses validation issues)
Write-Host "🚀 Starting Expo..." -ForegroundColor Cyan
Write-Host "📡 Backend: http://192.168.0.105:5144" -ForegroundColor Yellow
Write-Host ""

# Use tunnel mode which often bypasses validation issues
npx expo start --tunnel --clear


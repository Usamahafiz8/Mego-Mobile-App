# Fix Expo Updates Error
Write-Host "🔧 Fixing Expo Updates Error..." -ForegroundColor Cyan
Write-Host ""

# Clear Expo cache
Write-Host "🧹 Clearing Expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
}

# Clear Metro cache
Write-Host "🧹 Clearing Metro cache..." -ForegroundColor Yellow
Get-ChildItem "$env:TEMP" -Filter "metro-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host ""

# Set environment variable to disable updates
Write-Host "⚙️ Disabling updates..." -ForegroundColor Yellow
$env:EXPO_NO_UPDATES = "1"

Write-Host "✅ Updates disabled!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Expo..." -ForegroundColor Cyan
Write-Host ""

# Start Expo
npx expo start


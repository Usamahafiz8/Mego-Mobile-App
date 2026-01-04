# Start Metro Bundler Directly - Bypass Expo CLI Dependency Validation
# This avoids the "Body already read" error completely

Write-Host "🚀 Starting Metro Bundler Directly..." -ForegroundColor Cyan
Write-Host "📡 Backend: http://192.168.0.105:5144" -ForegroundColor Yellow
Write-Host "🔧 Bypassing Expo CLI dependency validation..." -ForegroundColor Yellow
Write-Host ""

# Set environment for online mode
$env:EXPO_OFFLINE = $null

# Start Metro bundler directly using npx react-native start
# This bypasses Expo CLI's dependency validation
Write-Host "⏳ Starting Metro Bundler..." -ForegroundColor Yellow
Write-Host ""

npx react-native start --reset-cache


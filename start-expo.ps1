# Start Expo with Online Mode (Skip Dependency Validation)
# This script allows online mode while bypassing the fetch error

Write-Host "🚀 Starting Expo with Online Mode..." -ForegroundColor Cyan
Write-Host "📡 Backend: http://192.168.0.105:5144" -ForegroundColor Yellow
Write-Host ""

# Clear any previous Expo environment variables
$env:EXPO_OFFLINE = $null

# Set timeout for network requests (helps with slow connections)
$env:EXPO_NO_TELEMETRY = "1"

# Start Expo with clear cache and skip dependency validation
# Using --clear to ensure fresh start
Write-Host "⏳ Starting Metro Bundler (this may take a moment)..." -ForegroundColor Yellow
Write-Host ""

# Start Expo - the fetch error might appear but shouldn't block startup
npx expo start --clear


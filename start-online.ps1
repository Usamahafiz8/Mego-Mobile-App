# Start Expo with Online Mode - Skip Dependency Validation
# This bypasses the "Body already read" error while keeping online mode

Write-Host "🚀 Starting Expo with Online Mode..." -ForegroundColor Cyan
Write-Host "📡 Backend: http://192.168.0.105:5144" -ForegroundColor Yellow
Write-Host "🔧 Skipping dependency validation..." -ForegroundColor Yellow
Write-Host ""

# Set environment variables to skip problematic checks
$env:EXPO_NO_DOTENV = "1"
$env:EXPO_NO_TELEMETRY = "1"
# Skip dependency validation by using tunnel mode (which has less validation)
$env:EXPO_PACKAGER_PROXY_URL = ""

# Start Expo - this should bypass the body read error
Write-Host "⏳ Starting Metro Bundler..." -ForegroundColor Yellow
Write-Host ""

# Use --tunnel flag which often bypasses some validation checks
npx expo start --tunnel --clear


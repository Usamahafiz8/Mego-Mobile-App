# Build Both Android + iOS
Write-Host "🚀 Building Both Android & iOS..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in MegoApp directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run from MegoApp directory" -ForegroundColor Red
    exit 1
}

Write-Host "Choose platform:" -ForegroundColor Yellow
Write-Host "1. Android only" -ForegroundColor White
Write-Host "2. iOS only" -ForegroundColor White
Write-Host "3. Both (Android + iOS)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1/2/3)"

$env:EAS_SKIP_AUTO_FINGERPRINT = '1'

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🤖 Building Android APK..." -ForegroundColor Cyan
        eas build --platform android --profile preview --non-interactive
    }
    "2" {
        Write-Host ""
        Write-Host "🍎 Building iOS IPA..." -ForegroundColor Cyan
        eas build --platform ios --profile preview --non-interactive
    }
    "3" {
        Write-Host ""
        Write-Host "🚀 Building Both Platforms..." -ForegroundColor Cyan
        Write-Host "This will take longer (Android + iOS both)" -ForegroundColor Yellow
        Write-Host ""
        eas build --platform all --profile preview --non-interactive
    }
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Build started!" -ForegroundColor Green
Write-Host "Check progress at: https://expo.dev/accounts/saniasajid/projects/MegoApp/builds" -ForegroundColor Cyan


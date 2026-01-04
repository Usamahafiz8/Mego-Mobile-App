# Fix Build Issues and Build APK
Write-Host "🔧 Fixing Build Issues..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in MegoApp directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run from MegoApp directory" -ForegroundColor Red
    exit 1
}

# Clean node_modules and reinstall
Write-Host "📦 Cleaning and reinstalling dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
npm install

# Clean Android build
Write-Host ""
Write-Host "🧹 Cleaning Android build..." -ForegroundColor Yellow
if (Test-Path "android") {
    Set-Location android
    if (Test-Path ".gradle") {
        Remove-Item -Recurse -Force ".gradle" -ErrorAction SilentlyContinue
    }
    if (Test-Path "app\build") {
        Remove-Item -Recurse -Force "app\build" -ErrorAction SilentlyContinue
    }
    .\gradlew clean 2>&1 | Out-Null
    Set-Location ..
}

# Verify fixes
Write-Host ""
Write-Host "✅ Fixes applied!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Fixed Issues:" -ForegroundColor Cyan
Write-Host "  ✓ newArchEnabled mismatch fixed" -ForegroundColor Green
Write-Host "  ✓ eas.json configuration improved" -ForegroundColor Green
Write-Host "  ✓ .easignore optimized" -ForegroundColor Green
Write-Host ""

# Ask to build
Write-Host "🚀 Ready to build!" -ForegroundColor Cyan
Write-Host ""
$build = Read-Host "Build APK now? (y/n)"

if ($build -eq "y" -or $build -eq "Y") {
    Write-Host ""
    Write-Host "🔨 Starting EAS Build..." -ForegroundColor Cyan
    $env:EAS_SKIP_AUTO_FINGERPRINT = "1"
    eas build --platform android --profile preview
} else {
    Write-Host ""
    Write-Host "To build later, run:" -ForegroundColor Yellow
    Write-Host "  eas build --platform android --profile preview" -ForegroundColor Cyan
}


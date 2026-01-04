# Quick Fix & Build - Sabse Fast Method
Write-Host "⚡ Quick Fix & Build Starting..." -ForegroundColor Cyan
Write-Host ""

# Prebuild clean karo
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "android") {
    Remove-Item -Recurse -Force "android" -ErrorAction SilentlyContinue
}

# Prebuild karo
Write-Host "🔧 Running prebuild..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

# Build karo
Write-Host ""
Write-Host "🚀 Building APK..." -ForegroundColor Cyan
$env:EAS_SKIP_AUTO_FINGERPRINT = '1'
eas build --platform android --profile preview --non-interactive


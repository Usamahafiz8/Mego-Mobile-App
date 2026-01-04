# MegoApp APK Build Script (PowerShell)
# Windows ke liye automated build script

Write-Host "🚀 MegoApp APK Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from MegoApp directory" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Choose build method:" -ForegroundColor Cyan
Write-Host "1. EAS Build (Cloud - Recommended)" -ForegroundColor White
Write-Host "2. Local Build (Requires Android Studio)" -ForegroundColor White
Write-Host "3. Development Build (Quick test)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "☁️  Starting EAS Build..." -ForegroundColor Cyan
        Write-Host "This will build APK on Expo cloud" -ForegroundColor Yellow
        Write-Host ""
        
        # Check if EAS CLI is installed
        try {
            $easVersion = eas --version
            Write-Host "✅ EAS CLI found: $easVersion" -ForegroundColor Green
        } catch {
            Write-Host "📥 Installing EAS CLI..." -ForegroundColor Yellow
            npm install -g eas-cli
        }
        
        # Check if logged in
        Write-Host "🔐 Checking Expo login..." -ForegroundColor Yellow
        $loginCheck = expo whoami 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Not logged in. Please login:" -ForegroundColor Yellow
            expo login
        }
        
        Write-Host ""
        Write-Host "🚀 Starting build..." -ForegroundColor Cyan
        eas build --platform android --profile preview
        
        Write-Host ""
        Write-Host "✅ Build started! Check Expo dashboard for progress:" -ForegroundColor Green
        Write-Host "https://expo.dev" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "🏗️  Starting Local Build..." -ForegroundColor Cyan
        Write-Host "This requires Android Studio and Android SDK" -ForegroundColor Yellow
        Write-Host ""
        
        # Check Android SDK
        $androidHome = $env:ANDROID_HOME
        if (-not $androidHome) {
            Write-Host "⚠️  ANDROID_HOME not set!" -ForegroundColor Yellow
            Write-Host "Please set ANDROID_HOME environment variable" -ForegroundColor Yellow
            Write-Host "Example: C:\Users\YourName\AppData\Local\Android\Sdk" -ForegroundColor Gray
            exit 1
        }
        
        Write-Host "✅ Android SDK found: $androidHome" -ForegroundColor Green
        
        # Prebuild
        Write-Host ""
        Write-Host "🔧 Running prebuild..." -ForegroundColor Yellow
        npx expo prebuild --platform android --clean
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Prebuild failed!" -ForegroundColor Red
            exit 1
        }
        
        # Build APK
        Write-Host ""
        Write-Host "🔨 Building APK..." -ForegroundColor Yellow
        Set-Location android
        .\gradlew assembleRelease
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        
        Set-Location ..
        
        $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
        if (Test-Path $apkPath) {
            Write-Host ""
            Write-Host "✅ APK built successfully!" -ForegroundColor Green
            Write-Host "📱 APK location: $apkPath" -ForegroundColor Cyan
            $apkSize = (Get-Item $apkPath).Length / 1MB
            Write-Host "📦 APK size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        } else {
            Write-Host "❌ APK not found at expected location!" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "⚡ Starting Development Build..." -ForegroundColor Cyan
        Write-Host "This creates a quick test APK" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "🔨 Building..." -ForegroundColor Yellow
        npx expo run:android --variant release
        
        Write-Host ""
        Write-Host "✅ Build complete!" -ForegroundColor Green
    }
    
    default {
        Write-Host "❌ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Done!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Important Notes:" -ForegroundColor Yellow
Write-Host "- Update API URL in src/config/api.js before production" -ForegroundColor White
Write-Host "- Update API URL in src/hub/userHub.js before production" -ForegroundColor White
Write-Host "- For production, use signed APK with keystore" -ForegroundColor White
Write-Host ""


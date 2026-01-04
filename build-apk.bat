@echo off
REM MegoApp APK Build Script (Batch File)
REM Windows ke liye simple build script

echo.
echo ================================
echo   MegoApp APK Build Script
echo ================================
echo.

REM Check if we're in MegoApp directory
if not exist "package.json" (
    echo Error: package.json not found!
    echo Please run this script from MegoApp directory
    pause
    exit /b 1
)

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found! Please install Node.js
    pause
    exit /b 1
)

echo Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm not found!
    pause
    exit /b 1
)

echo.
echo Choose build method:
echo 1. EAS Build (Cloud - Recommended)
echo 2. Local Build (Requires Android Studio)
echo 3. Development Build (Quick test)
echo.
set /p choice="Enter choice (1/2/3): "

if "%choice%"=="1" goto eas_build
if "%choice%"=="2" goto local_build
if "%choice%"=="3" goto dev_build

echo Invalid choice!
pause
exit /b 1

:eas_build
echo.
echo Starting EAS Build...
echo This will build APK on Expo cloud
echo.
eas build --platform android --profile preview
goto end

:local_build
echo.
echo Starting Local Build...
echo This requires Android Studio and Android SDK
echo.
echo Running prebuild...
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo Prebuild failed!
    pause
    exit /b 1
)
echo.
echo Building APK...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo APK built successfully!
echo APK location: android\app\build\outputs\apk\release\app-release.apk
goto end

:dev_build
echo.
echo Starting Development Build...
echo.
call npx expo run:android --variant release
goto end

:end
echo.
echo ================================
echo   Done!
echo ================================
echo.
echo Important Notes:
echo - Update API URL in src/config/api.js before production
echo - Update API URL in src/hub/userHub.js before production
echo - For production, use signed APK with keystore
echo.
pause


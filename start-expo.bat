@echo off
REM Start Expo with Online Mode for Local Backend
echo Starting Expo with Online Mode...
echo Backend: http://192.168.0.105:5144
echo.

REM Set environment variables
set EXPO_NO_DOTENV=1
set EXPO_OFFLINE=0

REM Start Expo
npx expo start --clear


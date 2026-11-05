@echo off
title NeuroBloom - Expo Go Tunnel (Campus Wi-Fi Mode)
color 0D

echo ======================================================================
echo    NEUROBLOOM - EXPO GO TUNNEL MODE (FOR CAMPUS / COLLEGE WI-FI)
echo ======================================================================
echo.
echo  This mode uses Expo's encrypted Cloudflare tunnel.
echo  It works over college/campus Wi-Fi, mobile hotspots, and 4G/5G!
echo.

:: Check Next.js Web Server on Port 3000
curl.exe -s -o NUL -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Next.js server is already running and ready!
) else (
    echo [*] Starting Next.js server in separate window...
    start "NeuroBloom Web Server" cmd /k "npm run dev"
    timeout /t 3 /nobreak >nul
)
echo.

:: Clean up stale process on port 8081
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)

cd "%~dp0expo-app"
npx expo start --tunnel

@echo off
title NeuroBloom - Expo Go Runner
color 0B

echo ======================================================================
echo             NEUROBLOOM - RUN IN EXPO GO (MOBILE APP)
echo ======================================================================
echo.

:: 1. Detect IPv4 Address
set "CURRENT_IP=172.26.28.70"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  set "CURRENT_IP=%%a"
  goto :ip_found
)
:ip_found
set CURRENT_IP=%CURRENT_IP: =%

echo [*] Detected Host IPv4: %CURRENT_IP%
echo [*] Web Server Target:  http://%CURRENT_IP%:3000
echo.

:: 2. Check Next.js Web Server on Port 3000
echo [*] Checking Next.js web server on port 3000...
curl.exe -s -o NUL -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Next.js server is already running and ready!
) else (
    echo [*] Starting Next.js server in separate window...
    start "NeuroBloom Web Server" cmd /k "npm run dev"
    timeout /t 3 /nobreak >nul
)
echo.

:: 3. Setup USB Tunnel if device is connected
echo [*] Checking for USB connected phone...
set "ADB=%~dp0platform-tools\adb.exe"
if exist "%ADB%" (
    "%ADB%" devices > "%TEMP%\adb_devices.txt" 2>nul
    findstr /v "List of devices attached" "%TEMP%\adb_devices.txt" | findstr "device" >nul 2>&1
    if not errorlevel 1 (
        echo [OK] Phone detected over USB! Setting up USB bridge...
        "%ADB%" reverse tcp:3000 tcp:3000 >nul 2>&1
        "%ADB%" reverse tcp:8081 tcp:8081 >nul 2>&1
        echo [OK] USB bridge active (localhost:3000 and localhost:8081 ready).
    ) else (
        echo [-] No USB device detected. Using wireless Wi-Fi mode.
    )
)
echo.

:: 4. Clean up any stale process on port 8081 before starting Metro
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%p >nul 2>&1
)

:: 5. Launch Expo Go Metro Bundler
echo ======================================================================
echo  STARTING EXPO GO METRO BUNDLER...
echo.
echo  Scan the QR code below using the EXPO GO app on your phone!
echo  (Press 'r' in this window to reload the app anytime)
echo ======================================================================
echo.

cd "%~dp0expo-app"
npx expo start --lan

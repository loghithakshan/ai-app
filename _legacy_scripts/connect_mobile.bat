@echo off
title NeuroBloom - Mobile App Instant Connector
color 0A

echo ======================================================================
echo           NEUROBLOOM - MOBILE APP INSTANT CONNECTOR
echo ======================================================================
echo.

set "ADB=%~dp0platform-tools\adb.exe"

:: 1. Check if server is already responding
echo [*] Checking NeuroBloom server on port 3000...
curl.exe -s -o NUL -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul 2>&1
if not errorlevel 1 (
    echo [OK] NeuroBloom server is already running and healthy on port 3000!
) else (
    :: If not responding, check if any dead process is holding the port
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 "') do taskkill /F /PID %%p >nul 2>&1
    echo [*] Starting NeuroBloom server...
    start "NeuroBloom Server" cmd /k "npx next start -H 0.0.0.0 -p 3000"
    timeout /t 3 /nobreak >nul
)
echo.

:: 2. Check ADB / USB Connection
echo [*] Checking USB connection to phone...
"%ADB%" devices > "%TEMP%\adb_devices.txt"
type "%TEMP%\adb_devices.txt"
findstr /v "List of devices attached" "%TEMP%\adb_devices.txt" | findstr "device" >nul 2>&1

if not errorlevel 1 (
    echo.
    echo [OK] Phone detected over USB!
    echo [*] Setting up high-speed USB tunnel (adb reverse)...
    "%ADB%" reverse tcp:3000 tcp:3000
    "%ADB%" reverse tcp:8081 tcp:8081
    echo [OK] Tunnel active!
    echo.
    echo [*] Launching NeuroBloom directly on your mobile screen...
    "%ADB%" shell am start -a android.intent.action.VIEW -d "http://localhost:3000" >nul 2>&1
    echo.
    echo ======================================================================
    echo  SUCCESS! Look at your phone screen now!
    echo.
    echo  The NeuroBloom app should now be open at http://localhost:3000
    echo.
    echo  TO INSTALL AS APP ON YOUR HOME SCREEN:
    echo  1. In Chrome on your phone, tap the 3 dots (top right)
    echo  2. Tap "Install app" (or "Add to Home screen")
    echo  3. Tap "Install"
    echo ======================================================================
) else (
    echo.
    echo [!] No phone detected over USB (or USB Debugging is not allowed yet).
    echo.
    echo ----------------------------------------------------------------------
    echo  HOW TO CONNECT IN 10 SECONDS:
    echo ----------------------------------------------------------------------
    echo  1. Unplug and reconnect your USB cable.
    echo  2. On phone: Ensure Developer Options -> 'USB Debugging' is ON.
    echo  3. On phone: When prompted 'Allow USB debugging?', tap 'Always allow'.
    echo  4. Change USB mode from 'Charging only' to 'File transfer'.
    echo  5. Run this file again!
    echo ======================================================================
)

echo.
pause

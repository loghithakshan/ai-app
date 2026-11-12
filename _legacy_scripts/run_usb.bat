@echo off
title NeuroBloom - Mobile App Connector
color 0A

:: Add adb to PATH
set "PATH=%~dp0platform-tools;%PATH%"

echo ======================================================================
echo          NEUROBLOOM - RUN APP ON MOBILE (USB OR WI-FI)
echo ======================================================================
echo.

:: Detect current local IPs
set "DETECTED_IP=172.25.97.45"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  set "DETECTED_IP=%%a"
  goto :ip_done
)
:ip_done
set DETECTED_IP=%DETECTED_IP: =%

echo Detected PC IP:  %DETECTED_IP%
echo Web Server:      http://%DETECTED_IP%:3000
echo.

:: Clean up old stuck node processes on 3000/8081
echo [1/3] Preparing ports...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1

:: Check for connected device
echo [2/3] Checking USB connection...
adb devices
echo.

:: Try to reverse ports over USB cable
adb reverse tcp:8081 tcp:8081 >nul 2>&1
adb reverse tcp:3000 tcp:3000 >nul 2>&1

:: Start Web Server in separate window
echo [3/3] Starting Web Server...
start "NeuroBloom Web Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo  HOW TO OPEN ON YOUR MOBILE PHONE:
echo ======================================================================
echo.
echo  OPTION 1: WIRELESS (Open Chrome on your phone)
echo    Go to: http://%DETECTED_IP%:3000
echo    Tap 3 dots (⋮) in Chrome -^> tap "Install app"
echo.
echo  OPTION 2: USB CABLE (If phone is plugged in with USB Debugging)
echo    Go to: http://localhost:3000
echo.
echo  OPTION 3: EXPO GO
echo    Scan the QR code below in the Expo Go app
echo ======================================================================
echo.

cd expo-app
npx expo start

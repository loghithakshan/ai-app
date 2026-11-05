@echo off
title NeuroBloom - Expo Go and Web Runner
color 0B

:: Auto-detect current local IPv4 address
set "CURRENT_IP=172.23.23.55"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  set "CURRENT_IP=%%a"
  goto :ip_found
)
:ip_found
set CURRENT_IP=%CURRENT_IP: =%

echo ======================================================================
echo    NEUROBLOOM - RUN IN EXPO GO WITH FULL FIDELITY AND AUTO-ALIGNMENT
echo ======================================================================
echo.
echo Detected Wi-Fi IPv4: %CURRENT_IP%
echo Next.js Web Server:   http://%CURRENT_IP%:3000
echo.
echo Choose an option:
echo   [1] Start Next.js Web Dev Server (0.0.0.0:3000)
echo   [2] Start Expo Go Metro Bundler (npx expo start)
echo   [3] Start BOTH over Wi-Fi (Recommended for Wi-Fi)
echo   [4] Start BOTH over USB Cable (No Wi-Fi needed)
echo.
set /p choice="Enter choice (1, 2, 3, or 4): "

if "%choice%"=="1" goto run_web
if "%choice%"=="2" goto run_expo
if "%choice%"=="3" goto run_both
if "%choice%"=="4" goto run_usb

:run_web
echo Clearing any stale processes on port 3000...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%p >nul 2>&1
)
echo Starting Next.js web server...
npm run dev
goto end

:run_expo
echo Clearing any stale processes on port 8081...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%p >nul 2>&1
)
echo Starting Expo Go...
cd expo-app
npx expo start
goto end

:run_both
echo Clearing any stale processes on ports 3000 and 8081...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%p >nul 2>&1
)
echo Starting Next.js web server in new window...
start "NeuroBloom Web Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo Starting Expo Go bundler...
cd expo-app
npx expo start
goto end

:run_usb
call "%~dp0run_usb.bat"
goto end

:end
pause

@echo off
title NeuroBloom - Master Launcher
color 0B

:menu
cls
echo ======================================================================
echo                     NEUROBLOOM MASTER LAUNCHER
echo ======================================================================
echo.
echo   [1] Start Web App (Desktop / Laptop)
echo       Runs on http://localhost:3000 (Pure Next.js Web App)
echo.
echo   [2] Start Mobile App in Expo Go (Normal Wi-Fi / Hotspot / USB)
echo       Runs Metro bundler on port 8081 for the Expo Go mobile app
echo.
echo   [3] Start Mobile App in Tunnel Mode (For Campus / College Wi-Fi)
echo       Uses Cloudflare tunnel to bypass college network blocks
echo.
echo   [4] Build Installable Android APK (.apk)
echo       Cloud build via Expo EAS (No Android Studio/Gradle required!)
echo.
echo   [5] Start BOTH Web and Mobile App together
echo.
echo   [0] Exit
echo.
echo ======================================================================
set /p choice="Enter your choice (0-5): "

if "%choice%"=="1" goto run_web
if "%choice%"=="2" goto run_mobile
if "%choice%"=="3" goto run_mobile_tunnel
if "%choice%"=="4" goto build_apk
if "%choice%"=="5" goto run_both
if "%choice%"=="0" exit /b 0
goto menu

:run_web
cls
echo ======================================================================
echo  STARTING WEB APP (DESKTOP / LAPTOP)
echo ======================================================================
echo.
echo Web server will run at: http://localhost:3000
echo.
cd /d "%~dp0"
npm run dev
pause
goto menu

:run_mobile
cls
echo ======================================================================
echo  STARTING MOBILE APP (EXPO GO)
echo ======================================================================
echo.
:: Check if Web server is running, if not start it in background
curl.exe -s -o NUL -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul 2>&1
if errorlevel 1 (
    echo [*] Starting Web Server in separate window...
    start "NeuroBloom Web Server" cmd /k "cd /d \"%~dp0\" && npm run dev"
    timeout /t 3 /nobreak >nul
)
:: Setup USB reverse if device is connected
set "ADB=%~dp0platform-tools\adb.exe"
if exist "%ADB%" (
    "%ADB%" reverse tcp:3000 tcp:3000 >nul 2>&1
    "%ADB%" reverse tcp:8081 tcp:8081 >nul 2>&1
)
cd /d "%~dp0expo-app"
npx expo start
pause
goto menu

:run_mobile_tunnel
cls
echo ======================================================================
echo  STARTING MOBILE APP (TUNNEL MODE FOR CAMPUS WI-FI)
echo ======================================================================
echo.
curl.exe -s -o NUL -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul 2>&1
if errorlevel 1 (
    echo [*] Starting Web Server in separate window...
    start "NeuroBloom Web Server" cmd /k "cd /d \"%~dp0\" && npm run dev"
    timeout /t 3 /nobreak >nul
)
cd /d "%~dp0expo-app"
npx expo start --tunnel
pause
goto menu

:build_apk
cls
echo ======================================================================
echo  BUILDING ANDROID APK (CLOUD EAS BUILD)
echo ======================================================================
echo.
echo Expo will build your .apk in the cloud for free.
echo No Android Studio or local Gradle needed!
echo.
cd /d "%~dp0expo-app"
npx eas-cli build -p android --profile preview
pause
goto menu

:run_both
cls
echo ======================================================================
echo  STARTING BOTH WEB AND MOBILE
echo ======================================================================
echo.
start "NeuroBloom Web Server" cmd /k "cd /d \"%~dp0\" && npm run dev"
timeout /t 3 /nobreak >nul
set "ADB=%~dp0platform-tools\adb.exe"
if exist "%ADB%" (
    "%ADB%" reverse tcp:3000 tcp:3000 >nul 2>&1
    "%ADB%" reverse tcp:8081 tcp:8081 >nul 2>&1
)
cd /d "%~dp0expo-app"
npx expo start
pause
goto menu


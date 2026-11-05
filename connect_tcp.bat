@echo off
title NeuroBloom - ADB Wireless TCP/IP Connector
color 0B

echo ======================================================================
echo           NEUROBLOOM - CONNECT VIA WIRELESS ADB (TCP/IP)
echo ======================================================================
echo.

set "ADB=%~dp0platform-tools\adb.exe"

:: Check if ADB daemon is ready
echo [*] Checking connected devices...
"%ADB%" devices > "%TEMP%\adb_devices.txt" 2>nul
findstr /v "List of devices attached" "%TEMP%\adb_devices.txt" | findstr "device" >nul 2>&1

if not errorlevel 1 (
    echo [OK] Phone detected via USB!
    echo [*] Switching phone ADB daemon to TCP/IP mode on port 5555...
    "%ADB%" tcpip 5555
    timeout /t 2 /nobreak >nul
    
    :: Try to get phone's Wi-Fi IP automatically
    for /f "tokens=*" %%i in ('"%ADB%" shell "ip route | grep wlan0 | grep -v default | cut -d' ' -f9" 2^>nul') do set PHONE_IP=%%i
    if "%PHONE_IP%"=="" (
        for /f "tokens=*" %%i in ('"%ADB%" shell "getprop dhcp.wlan0.ipaddress" 2^>nul') do set PHONE_IP=%%i
    )
    
    echo.
    echo ======================================================================
    echo  SUCCESS: Phone is now in TCP/IP Mode!
    if not "%PHONE_IP%"=="" (
        echo  Detected Phone Wi-Fi IP: %PHONE_IP%
        echo  [*] Connecting wirelessly via TCP...
        "%ADB%" connect %PHONE_IP%:5555
    ) else (
        echo  Check your Phone IP in: Settings -^> About Phone -^> Status -^> IP address
    )
    echo.
    echo  YOU CAN NOW UNPLUG THE USB CABLE!
    echo ======================================================================
    echo.
    goto setup_reverse
)

:: If not connected via USB, ask for IP address
echo [!] No phone currently detected via USB.
echo.
echo If you have already enabled TCP/IP mode or Android Wireless Debugging,
echo enter your phone's IP address below.
echo (Found in: Phone Settings -^> About Phone -^> Status -^> IP Address)
echo.
set /p TARGET_IP="Enter Phone IP address (e.g. 192.168.1.5 or 172.26.28.xx): "

if "%TARGET_IP%"=="" (
    echo [!] No IP provided. Exiting.
    pause
    exit /b 1
)

echo.
echo [*] Connecting to %TARGET_IP%:5555 via TCP...
"%ADB%" connect %TARGET_IP%:5555

:setup_reverse
echo.
echo [*] Verifying wireless connection...
"%ADB%" devices
timeout /t 2 /nobreak >nul

echo [*] Activating wireless port forward tunnels...
"%ADB%" reverse tcp:3000 tcp:3000
"%ADB%" reverse tcp:8081 tcp:8081

echo.
echo ======================================================================
echo  WIRELESS TCP/IP CONNECTION COMPLETE!
echo.
echo  1. Next.js server accessible on phone at: http://localhost:3000
echo  2. Expo Go bundler accessible on phone at:  http://localhost:8081
echo ======================================================================
echo.
pause

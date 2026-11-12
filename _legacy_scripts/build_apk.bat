@echo off
title NeuroBloom - Build Android APK (Expo EAS Cloud)
color 0A

echo ======================================================================
echo          NEUROBLOOM - BUILD ANDROID APK (EXPO EAS CLOUD)
echo ======================================================================
echo.
echo  This will build a standalone installable .apk in the Expo cloud.
echo  No Android Studio or local Java/Gradle required!
echo.
echo  Step 1: If you don't have an Expo account, it will ask you to login
echo          or create a free account at https://expo.dev
echo.
echo  Step 2: Expo cloud will compile your Android APK.
echo.
echo  Step 3: You will receive a direct QR code and download link for the .apk
echo ======================================================================
echo.

cd /d "%~dp0expo-app"
npx eas-cli build -p android --profile preview
pause


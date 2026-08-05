@echo off
echo =======================================================
echo Building WACRM Android APK (Optimized for Windows)
echo =======================================================

echo.
cd /d "%~dp0\apps\mobile\android"
call gradlew clean assembleRelease -PreactNativeArchitectures=arm64-v8a
cd /d "%~dp0"

echo.
echo =======================================================
echo Build complete! Installing to connected device...
echo =======================================================
adb install -r apps\mobile\android\app\build\outputs\apk\release\app-release.apk

echo.
echo Done!
pause

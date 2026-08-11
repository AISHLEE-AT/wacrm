@echo off
echo =======================================================
echo Building WACRM Android APK (Optimized for Windows)
echo =======================================================

echo.
cd /d "%~dp0\apps\mobile\android"
call gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo =======================================================
    echo BUILD FAILED! Aborting installation.
    echo =======================================================
    exit /b %ERRORLEVEL%
)
cd /d "%~dp0"

echo.
echo =======================================================
echo Build complete! Installing to connected device...
echo =======================================================
adb install -r "%~dp0\apps\mobile\android\app\build\outputs\apk\release\app-release.apk"

echo.
echo Done!

@echo off
echo =======================================================
echo Building WACRM Android APK (Optimized for Windows)
echo =======================================================

echo.
echo [1/4] Unmounting any existing X: drive...
subst X: /D >nul 2>&1

echo.
echo [2/4] Mounting X: drive to bypass Windows MAX_PATH limit...
subst X: "%~dp0."
cd /d X:\apps\mobile\android

echo.
echo [3/4] Building APK for 64-bit phones (bypassing Ninja bugs)...
call gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a

echo.
echo [4/4] Returning to original directory and cleaning up...
cd /d "%~dp0"
subst X: /D >nul 2>&1

echo.
echo =======================================================
echo Build complete! Installing to connected device...
echo =======================================================
adb install -r apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk

echo.
echo Done!
pause

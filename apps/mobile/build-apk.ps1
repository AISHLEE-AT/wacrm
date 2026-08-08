<#
.SYNOPSIS
Builds the React Native app for Android locally and correctly hooks up the Metro bundler.

.DESCRIPTION
This script cleans the project, forces the Metro bundler to run on port 8081,
kills any dangling node processes that might block the port, sets up ADB reverse port forwarding,
and builds the debug APK. 

This fixes the "Unable to load script" and silent blank screen crashes caused by a disconnected Metro server.
#>

Write-Host "====================================="
Write-Host " Building SuprO Mobile App (Debug)"
Write-Host "====================================="

Write-Host "`n[1/5] Killing any dangling Metro bundlers on port 8081..."
(Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue).OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

Write-Host "`n[2/5] Setting up ADB Reverse Port Forwarding for Metro..."
adb reverse tcp:8081 tcp:8081

Write-Host "`n[3/5] Starting Metro Bundler in the background..."
$env:CI="true"
Start-Process -NoNewWindow -FilePath "npx.cmd" -ArgumentList "expo", "start", "-c"

Write-Host "`n[4/5] Building the Debug APK..."
Set-Location android
.\gradlew assembleDebug
Set-Location ..

Write-Host "`n[5/5] Installing and Launching the App on the Device..."
adb install -r -d android\app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.poovisri.mobile/.MainActivity

Write-Host "`n====================================="
Write-Host " Done! The app should now launch successfully."
Write-Host "====================================="

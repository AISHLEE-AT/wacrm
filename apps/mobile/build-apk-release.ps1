<#
.SYNOPSIS
Builds the React Native app for Android locally in Release mode.

.DESCRIPTION
Builds a Release APK. In Release mode, the JavaScript bundle is compiled directly into the APK,
so it does not rely on a Metro bundler connection. This resolves the "Unable to load script" error.
#>

Write-Host "====================================="
Write-Host " Building SuprO Mobile App (Release)"
Write-Host "====================================="

Write-Host "`n[1/2] Building the Release APK..."
Set-Location android
.\gradlew :app:assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gradle build failed! Aborting installation."
    Set-Location ..
    exit $LASTEXITCODE
}
Set-Location ..

Write-Host "`n[2/2] Installing and Launching the App on the Device..."
adb install -r -d android\app\build\outputs\apk\release\app-release.apk
adb shell am start -n com.poovisri.mobile/.MainActivity

Write-Host "`n====================================="
Write-Host " Done! The release app should now launch successfully."
Write-Host "====================================="

$src = "C:\Users\fastg\.gemini\antigravity\brain\6d04832a-1da9-49ff-b584-83a2e39bd966\.user_uploaded\media__1784973140760.png"

if (-not (Test-Path $src)) {
    Write-Host "Source image not found at $src"
    exit 1
}

$targets = @(
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\logo.jpg",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\thamizhan-logo.jpg",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\brand-leaf-logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\favicon.ico",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo-title.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\brand-leaf-logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\icon.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\favicon.ico",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\brand_logo.png"
)

foreach ($target in $targets) {
    $dir = [System.IO.Path]::GetDirectoryName($target)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Copy-Item -Path $src -Destination $target -Force
    Write-Host "Copied directly to $target"
}

Write-Host "EXACT ATTACHED IMAGE COPIED TO ALL LOGO PATHS SUCCESSFULLY!"

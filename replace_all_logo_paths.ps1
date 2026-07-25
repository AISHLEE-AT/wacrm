# Replace all old logo references in aishlee-web
$files = Get-ChildItem -Path "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\src", "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\src" -Recurse -Include *.jsx, *.js, *.tsx, *.ts, *.html

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "/logo\.jpg|/logo\.png|/thamizhan-logo\.jpg|/app_logo\.png") {
        $newContent = $content -replace "/logo\.jpg", "/brand-leaf-logo.png?v=3" `
                               -replace "/logo\.png", "/brand-leaf-logo.png?v=3" `
                               -replace "/thamizhan-logo\.jpg", "/brand-leaf-logo.png?v=3" `
                               -replace "/app_logo\.png", "/brand-leaf-logo.png?v=3"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated logo path in $($file.Name)"
    }
}
Write-Host "All source files updated to /brand-leaf-logo.png?v=3!"

Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\fastg\.gemini\antigravity\brain\6d04832a-1da9-49ff-b584-83a2e39bd966\circular_ai_leaf_logo_1784979144653.jpg"

if (-not (Test-Path $srcPath)) {
    Write-Host "Source circular logo not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Processing Circular AI Leaf Logo (W: $($srcImg.Width), H: $($srcImg.Height))"

# Resize to crisp 256x256 fast-loading resolution
$targetSize = 256
$bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.DrawImage($srcImg, 0, 0, $targetSize, $targetSize)
$g.Dispose()
$srcImg.Dispose()

# Configure JPEG Encoder Quality = 85 (Ultra fast loading)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)

# All logo destination targets
$targets = @(
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\brand-leaf-logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo-title.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\icon.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\favicon.ico",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\brand-leaf-logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\logo.jpg",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\thamizhan-logo.jpg",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\favicon.ico"
)

foreach ($target in $targets) {
    $dir = [System.IO.Path]::GetDirectoryName($target)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    if (Test-Path $target) {
        Remove-Item $target -Force
    }
    if ($target.EndsWith(".jpg")) {
        $bmp.Save($target, $jpegCodec, $encoderParams)
    } else {
        $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $fileInfo = Get-Item $target
    Write-Host "Saved $($target) ($([Math]::Round($fileInfo.Length / 1KB, 1)) KB)"
}

$bmp.Dispose()
Write-Host "CIRCULAR AI LEAF LOGO EMBLEM APPLIED TO ALL 14 TARGET ASSET PATHS!"

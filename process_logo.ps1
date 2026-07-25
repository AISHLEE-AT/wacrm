Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\fastg\.gemini\antigravity\brain\6d04832a-1da9-49ff-b584-83a2e39bd966\.user_uploaded\media__1784976428415.png"
if (-not (Test-Path $srcPath)) {
    $srcPath = "C:\Users\fastg\.gemini\antigravity\brain\6d04832a-1da9-49ff-b584-83a2e39bd966\.user_uploaded\media__1784973140760.png"
}

if (-not (Test-Path $srcPath)) {
    Write-Host "Source image not found!"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Processing Immersive Logo from $srcPath (W: $($srcImg.Width), H: $($srcImg.Height))"

# Target resolution: 512x512
$targetSize = 512
$bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Dark Cosmic Background fill
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 3, 5, 8))
$g.FillRectangle($bgBrush, 0, 0, $targetSize, $targetSize)

# Draw full height image keeping aspect ratio intact
$scale = [Math]::Min(512.0 / $srcImg.Width, 512.0 / $srcImg.Height)
$destW = [int]($srcImg.Width * $scale)
$destH = [int]($srcImg.Height * $scale)
$destX = [int]((512 - $destW) / 2)
$destY = [int]((512 - $destH) / 2)

$g.DrawImage($srcImg, $destX, $destY, $destW, $destH)

# Draw outer golden border glow
$goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 158, 11), 6)
$g.DrawRectangle($goldPen, 3, 3, 506, 506)

$g.Dispose()
$srcImg.Dispose()

# Configure JPEG Encoder Quality = 88
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 88L)

# Destination targets
$targets = @(
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo-title.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\aishlee-web\public\logo.jpg"
)

foreach ($target in $targets) {
    $dir = [System.IO.Path]::GetDirectoryName($target)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
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
Write-Host "Full Immersive Logo with Background Pattern processed successfully!"

Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\fastg\.gemini\antigravity\brain\6d04832a-1da9-49ff-b584-83a2e39bd966\.user_uploaded\media__1784973140760.png"
if (-not (Test-Path $srcPath)) {
    Write-Host "Source image not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

# 256x256 crisp square size
$targetSize = 256
$bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 5, 7, 10))
$g.FillRectangle($bgBrush, 0, 0, $targetSize, $targetSize)

# Outer Golden Glow Ring
$goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 215, 0), 4)
$g.DrawArc($goldPen, 8, 8, 240, 240, 0, 360)

# Draw Leaf centered
$scale = [Math]::Min(220.0 / $srcImg.Width, 220.0 / $srcImg.Height)
$destW = [int]($srcImg.Width * $scale)
$destH = [int]($srcImg.Height * $scale)
$destX = [int]((256 - $destW) / 2)
$destY = [int]((256 - $destH) / 2)

$g.DrawImage($srcImg, $destX, $destY, $destW, $destH)

# Dispose graphics
$g.Dispose()
$srcImg.Dispose()

# Configure JPEG Encoder Quality = 85
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)

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
Write-Host "Ultra-compressed high-res leaf assets generated successfully!"

Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\fastg\.gemini\antigravity\brain\6d04832a-1da9-49ff-b584-83a2e39bd966\.user_uploaded\media__1784973140760.png"

if (-not (Test-Path $srcPath)) {
    Write-Host "Source leaf image not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Loaded Source Leaf Image: $($srcImg.Width) x $($srcImg.Height)"

# 1:1 square crop centered on the glowing leaf
$cropSize = [Math]::Min($srcImg.Width, $srcImg.Height)
$cropX = [int](($srcImg.Width - $cropSize) / 2)
$cropY = [int](($srcImg.Height - $cropSize) / 3)
if ($cropY -lt 0) { $cropY = 0 }
if (($cropY + $cropSize) -gt $srcImg.Height) { $cropY = $srcImg.Height - $cropSize }

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)

# Target resolution: 512x512
$targetSize = 512
$bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Dark background
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 6, 9, 14))
$g.FillRectangle($bgBrush, 0, 0, $targetSize, $targetSize)

# Draw cropped leaf
$g.DrawImage($srcImg, (New-Object System.Drawing.Rectangle(0, 0, $targetSize, $targetSize)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

# Draw elegant golden border frame
$goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 158, 11), 6)
$g.DrawRectangle($goldPen, 3, 3, 506, 506)

$g.Dispose()
$srcImg.Dispose()

# Configure JPEG Encoder Quality = 88
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 88L)

# All logo destination targets
$targets = @(
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\fago_app\assets\images\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\app_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\brand_logo.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\logo-title.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\icon.png",
    "C:\Users\fastg\.gemini\antigravity\scratch\wacrm\apps\web\public\favicon.ico",
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
Write-Host "PERFECT GLOWING LEAF LOGO CREATED AND REPLACED AT ALL 12 TARGET PATHS!"

# Tao anh chia se mang xa hoi (Open Graph) 1200x630.
# Van ban tieng Viet duoc doc tu og-copy.json de tranh loi ma hoa cua Windows PowerShell 5.1.
# Cach dung: powershell -ExecutionPolicy Bypass -File scripts/generate-og.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$copyPath = Join-Path $PSScriptRoot 'og-copy.json'
$outputPath = Join-Path $root 'public\images\og-cover.png'

$copy = Get-Content -LiteralPath $copyPath -Encoding UTF8 -Raw | ConvertFrom-Json

$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Nen gradient xanh dem.
$backgroundRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $backgroundRect,
    [System.Drawing.Color]::FromArgb(255, 16, 27, 38),
    [System.Drawing.Color]::FromArgb(255, 38, 58, 68),
    45.0
)
$graphics.FillRectangle($backgroundBrush, $backgroundRect)

# Luoi mo tao cam giac ban do.
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(22, 217, 176, 92), 1)
for ($x = 80; $x -lt $width; $x += 80) {
    $graphics.DrawLine($gridPen, $x, 0, $x, $height)
}
for ($y = 70; $y -lt $height; $y += 80) {
    $graphics.DrawLine($gridPen, 0, $y, $width, $y)
}

# Mat trong dong tron ben phai.
$gold = [System.Drawing.Color]::FromArgb(255, 217, 176, 92)
$goldSoft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 217, 176, 92))
$graphics.FillEllipse($goldSoft, 830, -90, 520, 520)
$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 217, 176, 92), 2)
$graphics.DrawEllipse($ringPen, 830, -90, 520, 520)
$graphics.DrawEllipse($ringPen, 884, -36, 412, 412)
$graphics.DrawEllipse($ringPen, 948, 28, 284, 284)

$starPoints = New-Object 'System.Drawing.PointF[]' 16
$centerX = 1090.0
$centerY = 170.0
$outer = 128.0
$inner = 52.0
for ($i = 0; $i -lt 16; $i++) {
    $radius = if ($i % 2 -eq 0) { $outer } else { $inner }
    $angle = (-90 + ($i * 22.5)) * [Math]::PI / 180
    $starPoints[$i] = New-Object System.Drawing.PointF(
        [float]($centerX + $radius * [Math]::Cos($angle)),
        [float]($centerY + $radius * [Math]::Sin($angle))
    )
}
$starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 242, 207, 139))
$graphics.FillPolygon($starBrush, $starPoints)

# Duong ke doc.
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 217, 176, 92), 2)
$graphics.DrawLine($linePen, 88, 122, 160, 122)

# Tieu de.
$eyebrowFont = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Bold)
$eyebrowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 190, 110))
$graphics.DrawString($copy.eyebrow, $eyebrowFont, $eyebrowBrush, 176, 106)

$titleFont = New-Object System.Drawing.Font('Cambria', 76, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 243, 232))
$graphics.DrawString($copy.line1, $titleFont, $titleBrush, 80, 152)
$graphics.DrawString($copy.line2, $titleFont, $titleBrush, 80, 254)

# Gach chan.
$accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 196, 84, 70), 4)
$graphics.DrawLine($accentPen, 86, 380, 296, 380)

# Mo ta.
$subtitleFont = New-Object System.Drawing.Font('Segoe UI', 25)
$subtitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 232, 226, 212))
$graphics.DrawString($copy.subtitle, $subtitleFont, $subtitleBrush, 82, 408)

$metaFont = New-Object System.Drawing.Font('Segoe UI', 17)
$metaBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 217, 176, 92))
$graphics.DrawString($copy.meta, $metaFont, $metaBrush, 84, 472)

# Chan trang.
$footerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(55, 217, 176, 92), 1)
$graphics.DrawLine($footerPen, 84, 540, 1116, 540)
$noteFont = New-Object System.Drawing.Font('Segoe UI', 14)
$noteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 210, 205, 194))
$graphics.DrawString($copy.note, $noteFont, $noteBrush, 84, 558)

$graphics.Dispose()
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

Write-Output "Da tao $outputPath"

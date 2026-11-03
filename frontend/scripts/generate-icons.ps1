# Tao bieu tuong PNG 192 va 512 cho manifest.
# Cach dung: powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $root 'public\images'
$sizes = @(192, 512)

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $background = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 27, 38))
    $graphics.FillRectangle($background, 0, 0, $size, $size)

    $gold = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 217, 176, 92), [Math]::Max(2, $size / 48))
    $graphics.DrawEllipse($gold, $size * 0.16, $size * 0.16, $size * 0.68, $size * 0.68)
    $graphics.DrawEllipse($gold, $size * 0.25, $size * 0.25, $size * 0.5, $size * 0.5)

    $points = New-Object 'System.Drawing.PointF[]' 16
    $center = $size / 2.0
    $outer = $size * 0.31
    $inner = $size * 0.13
    for ($i = 0; $i -lt 16; $i++) {
        $radius = if ($i % 2 -eq 0) { $outer } else { $inner }
        $angle = (-90 + ($i * 22.5)) * [Math]::PI / 180
        $points[$i] = New-Object System.Drawing.PointF(
            [float]($center + $radius * [Math]::Cos($angle)),
            [float]($center + $radius * [Math]::Sin($angle))
        )
    }

    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 217, 176, 92))
    $graphics.FillPolygon($starBrush, $points)

    $centerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 157, 47, 47))
    $graphics.FillEllipse($centerBrush, $center - ($size * 0.035), $center - ($size * 0.035), $size * 0.07, $size * 0.07)

    $graphics.Dispose()
    $path = Join-Path $outputDirectory "icon-$size.png"
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Output "Da tao $path"
}

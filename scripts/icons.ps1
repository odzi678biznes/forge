# Ikony FORGE (PWA i Tauri) z tej samej geometrii co public/favicon.svg.
# Uruchom z katalogu projektu:  powershell -File scripts/icons.ps1
# Potem ikony aplikacji desktopowej:  npx tauri icon scripts/.icon-1024.png
#
# Znak: niebieskie "F" (kolor postepu) i bursztynowa iskra (kolor wyzwania)
# na tle aplikacji. Same prostokaty - bez zaleznosci od fontow.

Add-Type -AssemblyName System.Drawing

$bg = [System.Drawing.ColorTranslator]::FromHtml('#0c1119')
$blue = [System.Drawing.ColorTranslator]::FromHtml('#38bdf8')
$amber = [System.Drawing.ColorTranslator]::FromHtml('#f5a524')

function Write-Icon([int]$size, [bool]$rounded, [string]$path) {
  $k = $size / 512.0
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)

  $bgBrush = New-Object System.Drawing.SolidBrush $bg
  if ($rounded) {
    # Promien 112/512 - jak rx w favicon.svg.
    $r = 112 * $k
    $d = 2 * $r
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.AddArc(0, 0, $d, $d, 180, 90)
    $p.AddArc($size - $d, 0, $d, $d, 270, 90)
    $p.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $p.AddArc(0, $size - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    $g.FillPath($bgBrush, $p)
  } else {
    # Pelne tlo: ikona "maskable" i apple-touch-icon - system sam przycina rogi.
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)
  }

  $b = New-Object System.Drawing.SolidBrush $blue
  $g.FillRectangle($b, [single](168 * $k), [single](128 * $k), [single](64 * $k), [single](256 * $k))
  $g.FillRectangle($b, [single](168 * $k), [single](128 * $k), [single](176 * $k), [single](64 * $k))
  $g.FillRectangle($b, [single](168 * $k), [single](232 * $k), [single](144 * $k), [single](56 * $k))
  $a = New-Object System.Drawing.SolidBrush $amber
  $g.FillRectangle($a, [single](280 * $k), [single](320 * $k), [single](64 * $k), [single](64 * $k))

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$out = Join-Path (Get-Location) 'public/icons'
New-Item -ItemType Directory -Force $out | Out-Null
Write-Icon 192 $true (Join-Path $out 'icon-192.png')
Write-Icon 512 $true (Join-Path $out 'icon-512.png')
Write-Icon 512 $false (Join-Path $out 'maskable-512.png')
Write-Icon 180 $false (Join-Path $out 'apple-touch-icon.png')
Write-Icon 1024 $true (Join-Path (Get-Location) 'scripts/.icon-1024.png')
Write-Output 'ok'

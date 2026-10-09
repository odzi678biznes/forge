param(
  [switch]$NoBrowser,
  [switch]$CheckOnly,
  [ValidateRange(1024, 65535)][int]$Port = 4186
)

# Jeden staly adres zachowuje zapisane postepy przegladarki.
# Serwer sam odczytuje klucz z magazynu Windows; ten skrypt go nie odczytuje.
$ErrorActionPreference = 'Stop'
$taskUrl = "http://localhost:$Port/"

function Get-ForgeStatus {
  try {
    $taskStatus = Invoke-RestMethod -Uri "${taskUrl}api/nauczyciel/setup" -TimeoutSec 20
    if ($taskStatus.localSetupAvailable -eq $true) { return $taskStatus }
  } catch { }
  return $null
}

try {
  $taskStatus = Get-ForgeStatus
  if (-not $taskStatus) {
    if ($CheckOnly) { throw 'FORGE nie jest uruchomione.' }
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
      throw "Port $Port jest zajety przez inna aplikacje. Nie zmieniam adresu Twojego zapisu nauki."
    }
    $taskNode = (Get-Command node.exe -ErrorAction Stop).Source
    $taskVite = Join-Path $PSScriptRoot 'node_modules\vite\bin\vite.js'
    if (-not (Test-Path -LiteralPath $taskVite)) { throw 'Brak zainstalowanych zaleznosci FORGE.' }
    $taskLogDir = Join-Path $PSScriptRoot ".forge\local-server\$Port"
    $null = New-Item -ItemType Directory -Path $taskLogDir -Force
    $taskProcess = Start-Process -FilePath $taskNode -ArgumentList @("`"$taskVite`"", '--port', $Port, '--strictPort', '--host', 'localhost') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskLogDir 'stdout.log') -RedirectStandardError (Join-Path $taskLogDir 'stderr.log')
    $taskDeadline = [DateTime]::UtcNow.AddSeconds(45)
    do {
      Start-Sleep -Milliseconds 500
      $taskProcess.Refresh()
      if ($taskProcess.HasExited) { throw 'Serwer FORGE nie wystartowal. Szczegoly sa w .forge/local-server.' }
      $taskStatus = Get-ForgeStatus
    } while (-not $taskStatus -and [DateTime]::UtcNow -lt $taskDeadline)
    if (-not $taskStatus) { throw 'Nie udalo sie potwierdzic uruchomienia FORGE.' }
  }
  Write-Host "FORGE dziala: $taskUrl"
  if ($taskStatus.persisted -and $taskStatus.providerVerified) { Write-Host 'Nauczyciel gotowy. Zapisany klucz zostal wczytany.' }
  elseif ($taskStatus.configured) { Write-Host 'Zapisany klucz wczytany. Polaczenie nauczyciela bedzie ponowione po odzyskaniu sieci.' }
  else { Write-Host 'Nauczyciel chwilowo niedostepny. Mozesz kontynuowac nauke i rachunki.' }
  if (-not $NoBrowser -and -not $CheckOnly) { Start-Process $taskUrl }
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}

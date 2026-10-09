# Klucz pozostaje tylko w środowisku procesu; nie trafia do plików ani frontendowego bundla.
Set-Location -LiteralPath $PSScriptRoot
$taskPreviousKey = $env:AZURE_SPEECH_KEY
$taskPreviousRegion = $env:AZURE_SPEECH_REGION
$taskSecureKey = Read-Host 'Klucz zasobu Azure Speech (wpis ukryty)' -AsSecureString
$taskRegion = (Read-Host 'Region zasobu Azure Speech, np. westeurope').Trim()
if ($taskSecureKey.Length -eq 0 -or $taskRegion -notmatch '^[a-z0-9]+$') {
    Write-Host 'Brak klucza lub nieprawidlowy region.'
    exit 1
}
$taskKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecureKey)
try {
    $env:AZURE_SPEECH_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskKeyPointer)
    $env:AZURE_SPEECH_REGION = $taskRegion
    Write-Host 'Lektor skonfigurowany. Otworz http://localhost:1420. Zatrzymanie: Ctrl+C lub zamknij okno.'
    npm run dev
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskKeyPointer)
    $taskSecureKey.Dispose()
    $env:AZURE_SPEECH_KEY = $taskPreviousKey
    $env:AZURE_SPEECH_REGION = $taskPreviousRegion
}

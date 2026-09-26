# Uruchamia FORGE (prototyp) z nauczycielem AI.
# Klucz API jest pobierany ze schowka, nie jest nigdzie zapisywany,
# a schowek jest czyszczony. Klucz znika po zamknieciu tego okna.
Set-Location $PSScriptRoot
while ($true) {
  Write-Host ""
  Write-Host "1. Skopiuj klucz API (sk-ant-...) ze strony console.anthropic.com (Ctrl+C)."
  Write-Host "2. Wroc do tego okna i nacisnij Enter."
  [void](Read-Host "Nacisnij Enter, gdy klucz jest skopiowany")
  $klucz = ((Get-Clipboard) -join '').Trim()
  if ($klucz.StartsWith('sk-ant-') -and $klucz.Length -gt 40) { break }
  Write-Host "W schowku nie ma klucza API (powinien zaczynac sie od sk-ant-). Skopiuj go jeszcze raz."
}
Set-Clipboard -Value ' '
$env:ANTHROPIC_API_KEY = $klucz
Write-Host "Klucz przyjety ($($klucz.Length) znakow), schowek wyczyszczony."
Write-Host "Start... za chwile otworzy sie przegladarka. Zatrzymanie: zamknij to okno."
Start-Process "http://localhost:1420"
npm run dev

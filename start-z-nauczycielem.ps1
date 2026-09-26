# Uruchamia FORGE (prototyp) z nauczycielem AI.
# Klucz API wpisujesz przy starcie - nie jest nigdzie zapisywany
# i znika po zamknieciu tego okna.
Set-Location $PSScriptRoot
$bezpieczny = Read-Host "Wklej klucz API (sk-ant-...) i nacisnij Enter" -AsSecureString
$env:ANTHROPIC_API_KEY = [System.Net.NetworkCredential]::new('', $bezpieczny).Password
if (-not $env:ANTHROPIC_API_KEY.StartsWith('sk-ant-')) {
  Write-Host "Uwaga: to nie wyglada na klucz API (powinien zaczynac sie od sk-ant-)."
}
Write-Host "Start... za chwile otworzy sie przegladarka. Zatrzymanie: Ctrl+C albo zamknij to okno."
Start-Process "http://localhost:1420"
npm run dev

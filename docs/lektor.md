# Naturalny lektor lekcji

Lekcje mają dwa źródła głosu: naturalnego lektora online i głosy urządzenia.
„W pigułce” pokazuje do czterech zdań z tej samej lekcji; lektor czyta wtedy
tylko ten skrót. Przełączanie widoku albo wyjście z wykładu zatrzymuje audio.

Naturalny lektor korzysta z polskich głosów neuronowych Microsoft Azure Speech:
Zofia (`pl-PL-ZofiaNeural`) i Marek (`pl-PL-MarekNeural`). Każdy fragment jest
rzeczywistym nagraniem MP3. Odtwarzacz pozwala zatrzymać i wznowić je dokładnie
w tym samym czasie, przewinąć nagranie oraz przejść do innego fragmentu.
Tempo zmienia się lokalnie, bez ponownej syntezy. Powtórki pobranych nagrań
korzystają z ograniczonej pamięci podręcznej aplikacji (do 40 fragmentów / 24 MB).

## Podłączenie usługi

1. Utwórz zasób Speech w Azure. Usługa wymaga własnego konta; obowiązuje
   limit i cennik wybranego planu. Nie jest częścią abonamentu ChatGPT.
2. Na serwerze ustaw `AZURE_SPEECH_KEY` i `AZURE_SPEECH_REGION`
   (region zasobu, np. `westeurope`). Nigdy nie używaj `VITE_` przed kluczem.
3. Lokalnie uruchom `START Z LEKTOREM.bat`: skrypt poprosi o klucz w ukrytym
   polu i region, a potem uruchomi FORGE. Nie zapisuje klucza do pliku.
4. Na Vercel udostępnij funkcję `api/lektor.ts` i ustaw również istniejący
   `FORGE_TEACHER_ACCESS_CODE` (minimum 24 znaki). Obowiązuje ta sama lista
   `FORGE_ALLOWED_ORIGINS` co dla nauczyciela. Zmiana środowiska wymaga
   ponownego wdrożenia serwera.
5. Frontend automatycznie używa serwera wskazanego przez
   `VITE_NAUCZYCIEL_API_URL`, zastępując końcowe `/nauczyciel` przez `/lektor`.
   Osobny adres można ustawić przez publiczne `VITE_LEKTOR_API_URL`.
   Wersja statyczna i Tauri potrzebują zdalnego serwera. Tauri domyślnie
   używa `https://forge-teacher.vercel.app/api/lektor`; przy własnym serwerze
   dopisz jego konkretny origin do `connect-src` w `src-tauri/tauri.conf.json`.
   Własna lista `FORGE_ALLOWED_ORIGINS` musi też zawierać origin aplikacji
   Tauri (`http://tauri.localhost` na Windows, `tauri://localhost` na macOS/Linux).
6. Jeśli lektor prosi o kod dostępu, wpisz istniejący kod FORGE.
   Klucza Azure nie wpisuje się w aplikacji ani w czacie.

Bez konfiguracji pojawia się wyraźna informacja, że naturalny lektor nie jest
podłączony; można wybrać „Głos urządzenia”. Ten tryb ma wybór polskiego głosu,
tempa, pauzę i przewijanie po tekście. Głosy lokalne działają offline.

## Sprawdzenie

`npm run build`, `npm test` oraz
`npx playwright test e2e/lesson-player.spec.ts e2e/natural-lesson-player.spec.ts`.
Testy z atrapą usługi sprawdzają zabezpieczenia, sterowanie audio i interfejs,
ale nie potwierdzają jakości rzeczywistego głosu ani aktywnego konta Azure.

Dokumentacja dostawcy: [REST Text to Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)
i [polskie głosy](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=text-to-speech).

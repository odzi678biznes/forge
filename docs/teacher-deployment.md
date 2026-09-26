# Nauczyciel na telefonie

Strona pozostaje na GitHub Pages. Prywatny nauczyciel działa przez funkcje Vercel
`api/nauczyciel.ts` i `api/nauczyciel/status.ts` w projekcie `forge-teacher`.

## Konfiguracja serwera (Production)

- `ANTHROPIC_API_KEY`: klucz konta Anthropic, wyłącznie w ustawieniach serwera.
- `FORGE_TEACHER_ACCESS_CODE`: losowy kod dostępu, minimum 24 znaki; nigdy w repozytorium.
- `FORGE_ALLOWED_ORIGINS`: opcjonalnie lista originów oddzielonych przecinkami;
  domyślnie `https://odzi678biznes.github.io`.
- `FORGE_NAUCZYCIEL_MODEL`: opcjonalna zmiana modelu (domyślnie `claude-sonnet-5`).

W GitHub Actions ustaw publiczną zmienną repozytorium `VITE_NAUCZYCIEL_API_URL`
na stabilny adres funkcji Vercel zakończony `/api/nauczyciel` i opublikuj stronę.
Ta zmienna zawiera wyłącznie adres, nie klucz API ani kod dostępu.

Na telefonie nauczyciel prosi o kod dostępu. Jest przechowywany w sesji przeglądarki;
po zakończeniu sesji może być wymagany ponownie. Klucza Anthropic nie wpisuje się w aplikacji.

Zmiana zmiennych Vercel wymaga nowego wdrożenia. Dla tego środowiska Windows CLI wymaga
`NODE_USE_SYSTEM_CA=1`, aby korzystać z systemowego magazynu zaufanych certyfikatów.

## Weryfikacja

`npm run typecheck` oraz `npx vitest run src/nauka/teacher-http.test.ts src/nauka/nauczyciel-klient.test.ts`.
Testy obejmują prywatny dostęp, CORS, rozmiar zapytania, walidację kontekstu i ponowne połączenie.
Testy z atrapą API nie potwierdzają aktywnego klucza ani salda konta Anthropic.

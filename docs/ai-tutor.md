# Forge AI Tutor i konfiguracja korepetycji

Moduł AI Tutor prowadzi praktyczną naukę matematyki na kartce. Claude dobiera zadanie,
analizuje fotografię kolejnych kroków i wskazuje konkretną lukę. Miniwykład oraz
samodzielne zadanie sprawdzające zamykają pętlę naprawczą. Profil, błędy i wcześniejsze
egzaminy wpływają na dalszy plan nauki. Moduł otworzysz przyciskiem **Rozpocznij
korepetycje** na ekranie Dziś, przez **AI Tutor** w nawigacji albo adresem `/#tutor`.

Korepetycje wymagają backendu z dostępem do Claude i trwałym magazynem danych.
Bez konfiguracji aplikacja wyświetla przyczynę niedostępności. Produkcyjny tutor
nie zastępuje Claude przykładowymi odpowiedziami.

## Uruchomienie lokalne

1. Użyj Node 22.13 lub nowszego; lokalny magazyn korzysta z wbudowanego SQLite.
2. Skopiuj `.env.example` do `.env.local`. Ustaw `ANTHROPIC_API_KEY` i osobny
   `FORGE_TEACHER_ACCESS_CODE` mający przynajmniej 24 znaki. Klucz Anthropic
   wpisujesz wyłącznie na serwerze. Można też korzystać z istniejącego
   `ANTHROPIC_AUTH_TOKEN` odczytywanego przez SDK.
3. Uruchom `npm run dev -- --host 0.0.0.0`. Otwórz `http://localhost:1420/#tutor`.
   Dev i preview Vite udostępniają prawdziwy endpoint `/api/tutor`.
4. Wpisz w aplikacji **prywatny kod Forge**, połącz profil i rozpocznij sesję.
   Istniejące poziomy umiejętności z kursu zostaną przeniesione przy tworzeniu
   profilu. Tutor osobno zbiera dowody rozumowania ze zdjęć.

`FORGE_TUTOR_MODEL` pozwala zmienić model Claude. Domyślnie moduł używa ustawienia
istniejącego nauczyciela Forge. Wybrany model musi obsługiwać obrazy i JSON Schema.
API korzysta z [Messages i analizy obrazów](https://platform.claude.com/docs/en/build-with-claude/vision)
oraz [structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

## Połączenie telefonu

1. Na komputerze otwórz **Telefon jako aparat**.
2. Podaj adres Forge dostępny z telefonu oraz adres jego API. W domowej sieci
   zastąp `localhost` adresem IP komputera, np. `http://192.168.1.20:1420/`
   i `http://192.168.1.20:1420/api/tutor`. Telefon musi mieć dostęp do tego serwera.
3. Dodaj origin strony telefonu do `FORGE_ALLOWED_ORIGINS`, gdy używasz oddzielnego
   serwera API. Uruchom ponownie backend po zmianie konfiguracji.
4. Utwórz link i otwórz go na telefonie. Link jest prywatnym dostępem do skanera.
   Telefon pokazuje bieżące zadanie, aparat, obrót, podgląd i wysyłanie.

Parowanie jest jednorazowe dla danego telefonu i przeglądarki. Dostęp skanera
wygasa po 90 dniach; nowe parowanie albo przycisk **Odłącz telefon** od razu
cofają wcześniejszy dostęp. Token znajduje się we fragmencie adresu, który aplikacja
usuwa po zapisaniu połączenia. Skaner nie otrzymuje klucza rozwiązań, modelu ucznia
ani historii innych sesji.

Komputer odświeża stan co 2 sekundy, a karta w tle co 8 sekund. Każde zdjęcie jest
przypisane do konkretnej sesji i zadania. Przy zmianie zadania serwer odrzuca nowe
zdjęcie starej pracy. Ponowienie zdjęcia już zapisanego potwierdza odbiór bez
tworzenia kolejnej próby, także po zakończeniu sesji.

Przed wysłaniem aplikacja zapisuje zdjęcie w lokalnej kolejce IndexedDB. Kolejka
przetrwa odświeżenie i utratę odpowiedzi serwera. Zdjęcia do 20 MB są zmniejszane
do 1600 pikseli na dłuższym boku i przesyłane jako JPEG; backend ogranicza wielkość
żądania i sprawdza format. Obsługiwane wejścia to JPEG, PNG i WebP. Wersja dostępna
publicznie powinna używać HTTPS; instalacja PWA wymaga bezpiecznego połączenia.

## Hosting i aplikacja desktopowa

Na Vercel endpoint `api/tutor.ts` wymaga `ANTHROPIC_API_KEY`, prywatnego kodu Forge
oraz `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN`. Zapis używa atomowej
aktualizacji przez Redis, aby równoczesne operacje telefonu i komputera nie
nadpisywały danych. Backend odmawia uruchomienia na Vercel bez trwałego magazynu.
Ustaw zmienne w konfiguracji hostingu i ponownie wdróż aplikację.

Statyczny hosting, np. GitHub Pages, udostępnia frontend. API musi działać osobno.
Publiczny `VITE_TUTOR_API_URL` wskazuje tylko adres API. Moduł potrafi również
wyprowadzić `/api/tutor` z istniejącego `VITE_NAUCZYCIEL_API_URL`.

Tauri w wersji instalowanej wymaga dostępnego serwera; instalator nie uruchamia
wbudowanego backendu Node. Domyślny serwer to `https://forge-teacher.vercel.app`.
Przy własnym serwerze dodaj jego konkretny origin do `connect-src` w
`src-tauri/tauri.conf.json` przed budowaniem instalatora. Lista
`FORGE_ALLOWED_ORIGINS` backendu powinna zawierać origin Tauri:
`http://tauri.localhost` na Windows albo `tauri://localhost` na macOS i Linux.

## Model ucznia i tryby nauki

Model przechowuje poziom kompetencji, dowody rozumowania, pewność oceny, średni
czas i wykorzystaną pomoc, stosowanie wzorów, powtarzane przyczyny błędów oraz
terminy powtórek. Pewność analizy Claude i pewność ucznia są osobnymi informacjami.
Mapa wiedzy pokazuje 95 umiejętności matematycznych, ich zależności, potrzebę
powtórki oraz szacowaną trwałość wiedzy. Wskaźniki pewności i trwałości są
heurystykami, a nie skalibrowanymi prognozami wyniku egzaminu.

Nieczytelne, ucięte lub niepewnie odczytane zdjęcie nie obniża poziomu ucznia.
Tutor prosi o ponowną fotografię. Sam poprawny wynik bez prawidłowego rozumowania
nie jest dowodem opanowania materiału. Kolejne poprawki tego samego zadania nie
zwiększają liczby niezależnych dowodów. Trudność rośnie stopniowo po serii
samodzielnych rozwiązań, a błędy prowadzą do ćwiczenia podstaw.

| Tryb | Działanie |
|---|---|
| Nauka | Rozgrzewka, dopasowane ćwiczenia, rozmowa i miniwykład po wykryciu luki |
| Ćwiczenia | Zadania dopasowane do profilu z pomocą na żądanie |
| Kartkówka | Do 5 zadań, 15 minut, analiza po zakończeniu |
| Egzamin / Matura | Autorski arkusz PP lub PR, 30 zadań, 180 minut, punkty i plan naprawczy |
| Popraw moje błędy | Priorytet dla powtarzanych przyczyn i blokujących podstaw |
| Powtórka | Znane umiejętności, zaległe powtórki i ponowne rozwiązanie zadania z historii |

Egzaminy i kartkówki blokują czat, podpowiedzi, pauzę i analizę podczas pracy.
Termin jest sprawdzany na serwerze. Oceniana jest ostatnia fotografia zadania
przesłana przed zakończeniem. Niepewne prace pozostają osobno oznaczone do
wyjaśnienia; po zakończeniu można sfotografować je czytelniej. Arkusze Forge
są treningowe i nie odwzorowują oficjalnego formatu ani klucza CKE. Porównanie
wyników obejmuje arkusze tego samego poziomu.

## Dane i architektura

Lokalny backend zapisuje sesje, rozmowy, zdjęcia i profil w `.forge/tutor.sqlite`;
adres można zmienić przez `FORGE_TUTOR_DB`. Przy kopii działającej bazy uwzględnij
pliki WAL albo zatrzymaj serwer przed kopiowaniem. Na hostingu dane znajdują się
w skonfigurowanym Redis. Urządzenie przechowuje prywatny token dostępu do profilu.
**Odłącz urządzenie** usuwa to połączenie lokalnie, a nie dane z backendu.

Tradycyjny kurs nadal korzysta z dotychczasowego magazynu Forge. Oceny tutora
aktualizują lokalne poziomy umiejętności; obecny eksport kursu JSON nie obejmuje
zdjęć i historii nowego backendu. Zachowaj kopię jego bazy oraz dostęp urządzenia.
AI wymaga sieci; istniejący kurs i lokalna kolejka zdjęć zachowują swoje dane
podczas przerwy w połączeniu.

| Warstwa | Pliki |
|---|---|
| Sesje i API | `server/tutor/engine.ts`, `http.ts`, `auth.ts`, `store.ts`, `api/tutor.ts` |
| Claude i osobne prompty | `server/tutor/provider.ts`, `prompts.ts` |
| Student Model i Error Memory | `src/features/tutor/student-model.ts` |
| Knowledge Graph i trudność | `knowledge.ts`, `difficulty.ts` |
| Generator i walidator | `server/tutor/catalogue.ts`, `src/features/tutor/exercise-validator.ts` |
| Egzaminy i postęp | `exam-engine.ts`, istniejące `src/learning-engine/mastery.ts` i `review.ts` |
| Synchronizacja i zdjęcia | `client.ts`, `useTutor.ts`, `outbox.ts`, `image-upload.ts`, `PhotoUpload.tsx` |
| Czat, lekcje i historia | `TutorChat.tsx`, `TutorView.tsx`, `Feedback.tsx`, `History.tsx`, `KnowledgeMap.tsx` |

Generator ponownie wykorzystuje bank matematyki Forge. Rodziny parametryczne
ułamków, równań liniowych, procentów i równań kwadratowych sprawdza kod. Inne nowe
zadania przechodzą osobne wywołanie Claude w roli walidatora; taka kontrola nie
stanowi formalnego dowodu poprawności. Pozostałe przedmioty zachowują istniejący
kurs. Model ma identyfikator przedmiotu, ale adapter praktycznych korepetycji
jest obecnie matematyczny.

## Testy i sprawdzenie prawdziwego Claude

```powershell
npm test
npm run typecheck
npm run typecheck:tutor
npm run build
npm run test:tutor:e2e
npm run test:e2e
```

Testy jednostkowe i integracyjne obejmują model ucznia, walidację matematyki,
miniwykład z niezależnym sprawdzeniem, restart SQLite, równoczesne aktualizacje,
uprawnienia urządzeń, granicę czasu egzaminu, nieczytelność i częściowy kadr,
timeout dostawcy, idempotencję wysyłania oraz odzyskiwanie wygasłej operacji.
Testy Playwright uruchamiają rzeczywisty backend HTTP i SQLite z osobnymi
kontekstami komputera i telefonu. Sprawdzają zmniejszenie i obrót obrazu,
utratę potwierdzenia, odświeżenie, feedback, zapis modelu, kolejne zadanie i historię.

W testach automatycznych jedynie zewnętrzny dostawca AI jest zastąpiony
kontrolowanym dostawcą testowym. Produkcyjna ścieżka zawsze wywołuje Claude.
Bez aktywnego klucza nie zweryfikowano rozpoznawania rzeczywistego pisma odręcznego
ani odpowiedzi konkretnego konta Anthropic. Adapter Redis ma sprawdzony kontrakt
HTTP i atomowego zapisu; wymaga jeszcze sprawdzenia z rzeczywistą bazą hostingu.

Po podłączeniu usług przejdź sesję na komputerze i fizycznym telefonie. Sprawdź
czytelne zdjęcie, błędny krok, słabe światło, uciętą kartkę, odświeżenie obu
urządzeń i analizę zakończonego arkusza. To sprawdzenie potwierdzi jakość odczytu
w Twoich warunkach oraz konfigurację używanego modelu i magazynu.

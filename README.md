# FORGE — kurs maturalny 2027

Aplikacja do samodzielnej nauki do matury 2027: **matematyka** (podstawa
i rozszerzenie, cel: 100% na rozszerzeniu), **informatyka** (Python i SQL)
oraz **biznes i zarządzanie**. Działa na komputerze (aplikacja Tauri) i na
telefonie (aplikacja webowa z pracą offline). Dane zostają na urządzeniu —
nie ma konta ani serwera. Założenia projektu: `docs/blueprint-v2.md`.

Plan kursu: cały materiał do **31 stycznia 2027**, potem arkusze i szlifowanie.

---

## Status treści — przeczytaj przed nauką

Całą treść (lekcje, zadania, podpowiedzi, fiszki) napisano na potrzeby tej
aplikacji. **Nikt jej jeszcze nie zweryfikował jako nauczyciel ani względem
wymagań CKE** — każde zadanie ma w kodzie `verified: false`. Co jest
sprawdzane automatycznie:

- **matematyka** — odpowiedzi liczbowe mają funkcję `verify`, która liczy wynik
  niezależnie od wpisanej odpowiedzi; testy spójności pilnują, żeby podpowiedzi
  nie zdradzały wyniku, a typowe błędy nie pokrywały się z odpowiedzią,
- **informatyka** — każde zadanie z kodem ma wzorcowe rozwiązanie, które musi
  przejść wszystkie testy (także ukryte), a kod startowy musi je oblać;
  oczekiwane wyniki zadań SQL są generowane z wzorcowych zapytań na trzech
  bazach testowych (`scripts/sql-expected.ts`, test pilnuje aktualności),
- **biznes i zarządzanie** — materiał ułożony według informatora CKE; pierwsza
  matura z tego przedmiotu jest w maju 2027, więc **nie ma jeszcze arkuszy
  ani zasad oceniania z prawdziwego egzaminu**. Zadania rachunkowe (np.
  wynagrodzenia) podają stawki w treści, więc nie zależą od aktualnych przepisów.

**Arkusze CKE** nie są kopiowane do aplikacji (prawa autorskie). FORGE zna ich
strukturę — numery zadań, punkty, wymagania — i otwiera oficjalne PDF-y
z `cke.gov.pl`. Przypisanie zadań arkusza do umiejętności kursu jest
automatyczne (matematyka: kody wymagań, informatyka: słowa kluczowe), więc
bywa przybliżone.

---

## Co jest w środku

| | Matematyka | Informatyka | Biznes i zarządzanie |
|---|---|---|---|
| Działy | 16 | 10 | 8 |
| Umiejętności | 95 (62 PP, 33 PR) | 34 | 34 |
| Zadania | 761 | 238, w tym 118 w Pythonie i 19 w SQL | 227 |
| Lekcje | 95 | 34 | 34 |
| Fiszki | 223 | 68 | 68 |
| Arkusze CKE | 13 (8 PP, 5 PR, 2022–2026) | 5 (2023–2026) | — (pierwszy egzamin 2027) |

`npx vite-node scripts/course-stats.ts` wypisuje aktualne liczby z podziałem na działy.

### Ekrany

- **Dziś** — jeden następny krok, plan dnia (lekcje, powtórki, fiszki), skrót
  pozostałych przedmiotów i uczciwa informacja, czy tempo wystarcza do terminu.
- **Kurs** — działy i lekcje w kolejności; po lekcji ćwiczenia od łatwych do
  maturalnych, z drabiną podpowiedzi i nazwaną przyczyną błędu.
- **Fiszki** — powtórki w odstępach, nowe karty tylko z przerobionych tematów.
- **Kalendarz** — materiał rozłożony równo do 31.01.2027, niedziele wolne od
  nowego materiału. Trzy przedmioty dzielą **jeden budżet dnia** (tryb
  Minimum / Standard / Mocny).
- **Postęp**, **Mapa umiejętności**, **Raport tygodnia**, **Laboratorium
  błędów** (błędy zgrupowane po przyczynie, z naprawą).
- **Arkusze CKE** — arkusz w PDF, wpisywanie punktów, analiza: które
  umiejętności kosztowały najwięcej punktów i co powtórzyć.
- **Zadania z kodem** — edytor, testy widoczne i ukryte, Python uruchamiany
  lokalnie (Pyodide), zapytania SQL na bazach SQLite z podglądem tabel.
- **Nauczyciel AI** (opcjonalny, tylko na komputerze) — podpowiedzi i ocena
  odpowiedzi opisowych z jawnym kontekstem. Klucz API trzymany wyłącznie
  w pamięci aplikacji, znika po zamknięciu.
- **Czytanie na głos** — treść zadania razem ze wzorami (głosy systemu).
- **Twoje dane** — eksport JSON/CSV, import, synchronizacja z drugim
  urządzeniem, kopie bezpieczeństwa, usuwanie, praca offline na telefonie.

---

## Uruchomienie

```bash
npm install
npm run tauri:dev
```

| Polecenie | Działanie |
|---|---|
| `npm run tauri:dev` | aplikacja desktopowa (Tauri + SQLite) |
| `npm run tauri:build` | instalator Windows (NSIS) w `src-tauri/target/release/bundle/nsis` |
| `npm run dev` | sam interfejs w przeglądarce (IndexedDB), port 1420 |
| `npm run build` | wersja webowa w `dist/` (także na telefon) |
| `npm test` | testy (Vitest), w tym wzorcowe rozwiązania w Pythonie i SQL |
| `npm run typecheck` | kontrola typów |

Wymagania: Node 20+, Rust stable, Visual Studio Build Tools z workloadem C++
(tylko dla aplikacji desktopowej).

---

## Wersja na telefon

To ta sama aplikacja zbudowana jako strona z pracą offline (PWA). Żeby
zainstalować ją na telefonie, musi być dostępna pod adresem **https** —
przeglądarki nie pozwalają inaczej na pracę offline ani instalację.

**Publikacja (jednorazowo).** Najprościej przez GitHub Pages: repozytorium na
GitHubie, w nim Settings → Pages → Source: *GitHub Actions*. Workflow
`.github/workflows/pages.yml` przy każdym wypchnięciu na `main` uruchamia
testy, buduje aplikację pod adres `https://<użytkownik>.github.io/<repozytorium>/`
i ją publikuje. Na darmowym planie GitHub Pages wymaga publicznego
repozytorium. Każdy inny hosting plików statycznych też wystarczy:
`npm run build` i wysłanie folderu `dist` (w podkatalogu:
`FORGE_BASE=/sciezka/ npm run build`).

**Na telefonie.**

1. Otwórz adres aplikacji.
2. Zainstaluj: Android (Chrome) — menu ⋮ → *Zainstaluj aplikację*;
   iPhone (Safari) — *Udostępnij* → *Do ekranu początkowego*.
3. W *Twoje dane → Telefon i praca offline* pobierz Pythona (ok. 13 MB,
   najlepiej przez Wi-Fi) i włącz trwałe przechowywanie danych.

**Postęp między urządzeniami.** Nie ma chmury: na jednym urządzeniu *Pobierz
kopię JSON*, prześlij plik na drugie (mail do siebie, dysk) i tam *Połącz*.
Łączenie niczego nie usuwa — dodaje odpowiedzi, lekcje i arkusze, a przy
umiejętnościach i fiszkach zostawia nowszy stan. Potem w drugą stronę.

**Nowa wersja** pobiera się sama, ale włącza dopiero po kliknięciu
*Odśwież* na pasku u góry — nie przerywa nauki.

**Różnice względem komputera.** Dane są w przeglądarce (IndexedDB), a nie
w pliku SQLite. Nauczyciel AI jest niedostępny: w przeglądarce klucz API
musiałby być w JavaScripcie. Safari na iPhonie potrafi usunąć dane strony po
tygodniu bez wizyty, jeśli nie jest dodana do ekranu początkowego — dlatego
instalacja i kopia JSON od czasu do czasu.

**Próba w sieci domowej bez publikacji:** `npm run build`, potem
`npm run preview -- --host` i adres `http://<ip-komputera>:4173` na telefonie.
Działa, ale bez pracy offline i instalacji (to nie jest https).

---

## Decyzje projektowe warte zapamiętania

### Trwałość stoi za portem, nie za konkretną bazą

`src/data/storage-port.ts` definiuje interfejs. Dwie implementacje:

| Adapter | Kiedy |
|---|---|
| `SqliteStorage` | aplikacja desktopowa — baza w katalogu danych aplikacji, migracje po stronie Rusta |
| `IndexedDbStorage` | przeglądarka i telefon, `npm run dev`, testy |

`create-storage.ts` wybiera jedną z nich przy starcie. Silnik nauki nie wie,
która działa.

### Awans kompetencji ma warunki, nie progi punktowe

`src/learning-engine/mastery.ts`. Każdy poziom 0–5 wymaga dowodu określonego
rodzaju, nie liczby prób:

| Przejście | Warunek |
|---|---|
| 0 → 1 | poprawnie, choćby po pełnym rozwiązaniu |
| 1 → 2 | wystarczyła mała wskazówka (szczeble 1–3) |
| 2 → 3 | dwa typowe zadania z rzędu bez pomocy |
| 3 → 4 | zadanie transferowe bez pomocy |
| 4 → 5 | poprawnie bez pomocy po ≥ 7 dniach |

Cofnięcie: wyłącznie po błędzie **bez pomocy** na zadaniu w zakresie danego
poziomu, o jeden poziom, z podłogą na poziomie 1.

### Priorytet jest jawną heurystyką, nie modelem

`src/learning-engine/priority.ts` implementuje wagi z sekcji 6 blueprintu.
Każdy składnik jest znormalizowany do 0..1 i rozkładalny na czynniki — stąd
działający przycisk „Dlaczego to pytanie?”.

### Kolejka powtórek: 1 / 7 / 21 / 45 dni

Świadomie **nie** SM-2 ani FSRS: drabina stałych odstępów jest w całości
wytłumaczalna uczniowi. Odstępy to hipoteza do sprawdzenia na danych.

### Jeden budżet dnia dla trzech przedmiotów

`src/learning-engine/schedule.ts`. Każdy przedmiot rozkłada swój materiał
równo do terminu, ale tryb dnia dzielą proporcjonalnie do tego, ile im
zostało. Status „zdążysz” i podpowiedź trybu liczą się dla sumy. Przy pełnym
kursie od końca września to ok. 56 min nowego materiału dziennie (plus
powtórki): mieści się w trybie *Mocny*, w *Standard* koniec wypada w marcu —
i aplikacja mówi to wprost.

### Kod ucznia w piaskownicy

Python działa w Pyodide w osobnym workerze. Po załadowaniu interpretera worker
odbiera sobie sieć, magazyny i kanały komunikacji (`lockdown.ts`), a dopiero
potem przyjmuje kod. Oczekiwane wyniki nigdy nie trafiają do workera —
ocenia główny wątek. SQL korzysta z modułu `sqlite3` tego samego
interpretera, bez dodatkowej zależności.

### Synchronizacja bez chmury

`src/learning-engine/sync-merge.ts` — czyste łączenie dwóch kopii: suma po
identyfikatorach, przy konfliktach nowszy stan. Przed zapisem zawsze kopia
bezpieczeństwa; łączenie tego samego pliku drugi raz nic nie zmienia.

### Czego kod pilnuje, żeby nie złamać sekcji 14 (bez dark patterns)

- Kolejna misja nigdy nie startuje automatycznie — jest tylko przycisk.
- Po 2 misjach neutralny punkt zatrzymania, po 4 rekomendacja przerwy.
- Powrót po ≥ 3 dniach przerwy nie każe nadrabiać zaległości; opuszczone dni
  nie przechodzą na jutro — plan liczy się od nowa.
- Brak liczników serii, brak koloru „porażki”, test blokuje zawstydzające słownictwo.
- Koszt podpowiedzi podany **przed** jej wzięciem.
- Aktualizacja wersji na telefon czeka na zgodę, pobranie Pythona na kliknięcie.

### Bezpieczeństwo powłoki

`src-tauri/capabilities/default.json` nadaje tylko: okno, cztery operacje SQL
na jednej bazie, komendy nauczyciela AI i otwieranie adresów
`https://cke.gov.pl/*`. Brak dostępu do systemu plików i powłoki. CSP nie
dopuszcza `unsafe-eval` — jedynie `wasm-unsafe-eval`, którego wymaga Python.
Czcionki KaTeX i interpreter są lokalne, więc aplikacja działa offline.
Zapytania do bazy są parametryzowane.

---

## Ograniczenia i czego jeszcze nie ma

- Treść nie przeszła weryfikacji nauczyciela (patrz wyżej).
- Brak automatycznej synchronizacji — celowo, bo wymagałaby serwera i konta.
- Nauczyciel AI tylko w aplikacji desktopowej.
- Diagnoza przekrojowa tylko z matematyki.
- Przebiegi w przeglądarce (lekcja, zadanie z Pythonem i SQL, arkusz, telefon
  390 px, praca offline) sprawdzane ręcznie; w repozytorium są tylko testy
  jednostkowe i integracyjne (Vitest), bez zestawu E2E.

---

## Struktura

```text
src/
  app/              kompozycja: stan, ekrany, powłoka, plan dnia
  components/       LaTeX, rysunki, ikony, pierścienie postępu
  data/             typy, port trwałości, adaptery SQLite i IndexedDB
  design-system/    tokeny
  features/         course, questions, code, flashcards, exams, data,
                    error-lab, mastery-map, weekly-review, ai, ...
  learning-engine/  mastery, review, priority, schedule, grading,
                    code/sql-grading, sync-merge, speech, ...
  platform/         otwieranie linków, PWA
content/
  math/ cs/ biz/    kurs: lekcje, zadania, fiszki + testy spójności
  exams/            katalog arkuszy CKE (struktura i linki)
  authoring.ts      język opisu zadań, validate.ts - walidator
scripts/            generatory katalogów CKE, wyników SQL, ikon, statystyki
src-tauri/          powłoka natywna, migracje SQL, capabilities, AI
docs/               blueprint
```

Logika decyzyjna siedzi w `learning-engine`: funkcje czyste, bez Reacta
i bez trwałości, pokryte testami. `app/` tylko łączy silnik z bazą i widokiem.

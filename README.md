# FORGE — Matura Training System

Lokalna aplikacja treningowa do matury. Implementacja według `docs/blueprint-v2.md`.

**Stan: Etap 0, 1 i 2 ukończone.**

---

## Uruchomienie

```bash
npm install
npm run tauri:dev
```

| Polecenie | Działanie |
|---|---|
| `npm run tauri:dev` | aplikacja desktopowa (Tauri + SQLite) |
| `npm run tauri:build` | instalator Windows (NSIS) |
| `npm run dev` | sam interfejs w przeglądarce (IndexedDB) |
| `npm test` | testy jednostkowe (Vitest) |
| `npm run typecheck` | kontrola typów |

Wymagania: Node 20+, Rust stable, VS Build Tools z workloadem C++.

---

## Co działa

**Etap 0 — fundament.** Powłoka Tauri 2, SQLite z migracjami po stronie Rusta,
minimalne capabilities, CSP bez `unsafe-eval`, instalator NSIS.

**Etap 1 — pętla nauki.** Centrum dowodzenia z jedną rekomendowaną misją →
arena pełnoekranowa z LaTeX-em → drabina podpowiedzi → feedback nazywający
przyczynę błędu → podsumowanie ze zmianami kompetencji.

**Etap 2 — mapa i dziennik błędów.** Graf zależności kompetencji z klikalnymi
węzłami, laboratorium błędów grupujące po przyczynie, misje celowane.

Zweryfikowane ręcznie: pełny przebieg misji klawiaturą, restart z odzyskaniem
danych, brak przewijania poziomego przy powiększeniu 200%, „Napraw teraz"
startujące od zadania fundamentalnego.

---

## Decyzje projektowe warte zapamiętania

### Trwałość stoi za portem, nie za konkretną bazą

`src/data/storage-port.ts` definiuje interfejs. Dwie implementacje:

| Adapter | Kiedy |
|---|---|
| `SqliteStorage` | powłoka Tauri — baza w katalogu danych aplikacji |
| `IndexedDbStorage` | `npm run dev` i testy — praca nad UI bez budowania Rusta |

`create-storage.ts` wybiera jedną z nich w czasie startu. Silnik nauki nie wie,
która działa. Import SQLite jest dynamiczny, więc build webowy nie wymaga IPC.

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
poziomu, o jeden poziom, z podłogą na poziomie 1. Nieudany transfer nie zbija
poziomu 3 — transfer ma prawo się nie udać, dopóki fundament działa.

### Priorytet jest jawną heurystyką, nie modelem

`src/learning-engine/priority.ts` implementuje wagi wprost z sekcji 6
(0,35 / 0,25 / 0,20 / 0,10 / 0,10). Każdy składnik jest znormalizowany do 0..1
i rozkładalny na czynniki — stąd działający przycisk „Dlaczego to pytanie?".
Wymóg z sekcji 17 jest spełniony po stronie kodu, nie deklaracji.

### Kolejka powtórek: 1 / 7 / 21 / 45 dni

Świadomie **nie** SM-2 ani FSRS. Blueprint nazywa silnik heurystyką wersji 1,
a drabina stałych odstępów jest w całości wytłumaczalna użytkownikowi.
Podstawa dowodowa dla rozłożonej praktyki jest umiarkowana — traktujemy te
odstępy jako hipotezę do weryfikacji na danych, nie jako pewnik.

### Błędy grupują się po przyczynie, nie po zadaniu

`src/learning-engine/error-lab.ts`. Ten sam zgubiony znak w dwóch różnych
zadaniach to jeden wpis do naprawy. Zamknięcie wpisu wymaga **trzech**
poprawnych prób z rzędu na tej samej kompetencji; pomyłka w środku zeruje
serię, a ponowne wystąpienie błędu otwiera wpis na nowo.

### Czego kod pilnuje, żeby nie złamać sekcji 14

- Kolejna misja nigdy nie startuje automatycznie — jest tylko przycisk.
- Po 2 misjach neutralny punkt zatrzymania, po 4 rekomendacja przerwy.
- Protokół powrotu po ≥ 3 dniach przerwy nie każe nadrabiać zaległości.
- Test `mission.test.ts` blokuje słownictwo zawstydzające w komunikatach.
- Brak koloru „porażki" w palecie — błąd jest informacją, nie alarmem.
- Koszt podpowiedzi podany **przed** jej wzięciem, bez ukrytych kar.

### Bezpieczeństwo powłoki

`src-tauri/capabilities/default.json` nadaje dokładnie tyle, ile trzeba: okno
i cztery operacje SQL na jednej bazie. Brak dostępu do systemu plików, sieci
i powłoki. CSP nie dopuszcza `unsafe-eval`; czcionki KaTeX są bundlowane
lokalnie, więc aplikacja działa offline. Wszystkie zapytania są
parametryzowane — test sprawdza, że odpowiedź ucznia trafia do bazy jako
wartość wiązana.

---

## Status treści — przeczytaj przed użyciem do nauki

`content/math/funkcja-kwadratowa.ts` zawiera 11 zadań autorskich z trzech
kompetencji. **Wszystkie mają `verified: false`.** Matematyka jest sprawdzona
rachunkowo i pokryta testami spójności, ale materiał **nie został
zweryfikowany względem informatora CKE**. To wycinek do domknięcia pętli
produktowej, nie materiał egzaminacyjny.

Testy treści pilnują m.in., żeby:

- żaden zadeklarowany typowy błąd nie pokrywał się z poprawną odpowiedzią,
- podpowiedzi poziomów 1–4 nie zdradzały gotowego wyniku,
- każda kompetencja miała zadanie fundamentalne, typowe i transferowe —
  bez tego poziom 4 byłby nieosiągalny, a naprawa błędu nie miałaby co podać.

---

## Czego jeszcze nie ma

- Etap 3: diagnoza matematyczna i plan na jej podstawie.
- Etap 4: moduł informatyki (edytor kodu, uruchamianie testów).
- Etap 5: kalendarz, tryby dnia, raport tygodniowy, próby czasowe.
- Etap 6: warstwa AI i głos.
- Arkusze i tryb egzaminacyjny.
- Testy Playwright (sekcja 16 ich wymaga; są tylko testy jednostkowe).
- Eksport/import do pliku z poziomu interfejsu — logika i walidacja są
  gotowe i przetestowane, brakuje przycisku.

---

## Struktura

```text
src/
  app/              kompozycja: stan, ekrany, powłoka
  components/       renderer LaTeX
  data/             typy, port trwałości, adaptery SQLite i IndexedDB
  design-system/    tokens
  features/         missions, questions, mastery-map, error-lab
  learning-engine/  mastery, review, priority, selector, grading,
                    mission, error-lab
content/math/       zadania + testy spójności treści
src-tauri/          powłoka natywna, migracje SQL, capabilities
docs/               blueprint
```

Cała logika decyzyjna siedzi w `learning-engine` i w `features/*/layout.ts`:
funkcje czyste, bez Reacta i bez trwałości, pokryte testami. `app/` tylko
łączy silnik z bazą i widokiem.

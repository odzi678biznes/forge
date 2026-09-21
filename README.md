# FORGE — Matura Training System

Lokalna aplikacja treningowa do matury. Implementacja według `docs/blueprint-v2.md`.

**Stan: Etap 1 (pionowy wycinek) ukończony. Etap 0 ukończony częściowo — brakuje powłoki Tauri.**

---

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja startuje na `http://localhost:1420`.

| Polecenie | Działanie |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm test` | testy jednostkowe (Vitest) |
| `npm run typecheck` | kontrola typów |
| `npm run build` | build produkcyjny |

---

## Co działa

Pełna pętla z sekcji 18 blueprintu, bez atrap:

1. Centrum dowodzenia z jedną rekomendowaną misją i jej uzasadnieniem.
2. Arena zadania — pełny ekran, obsługa klawiaturą, LaTeX przez KaTeX.
3. Zapis odpowiedzi, deklarowanej pewności i poziomu użytej pomocy.
4. Natychmiastowy feedback z nazwaniem przyczyny błędu.
5. Podsumowanie misji ze zmianami kompetencji.
6. Węzeł mapy kompetencji animowany wyłącznie przy realnym awansie.
7. Trwały zapis — dane przeżywają restart aplikacji.

Zweryfikowane ręcznie: pełny przebieg misji, restart z odzyskaniem danych,
brak przewijania poziomego przy powiększeniu 200%.

---

## Decyzje projektowe warte zapamiętania

### Trwałość stoi za portem, nie za SQLite

`src/data/storage-port.ts` definiuje interfejs, `indexeddb-storage.ts` go
realizuje. Blueprint (sek. 9) wskazuje SQLite przez wtyczkę Tauri — ta
implementacja dopisze się obok jako drugi adapter. Reguły nauki nie wiedzą,
która trwałość działa, więc podmiana nie dotknie silnika.

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

### Czego kod pilnuje, żeby nie złamać sekcji 14

- Kolejna misja nigdy nie startuje automatycznie — jest tylko przycisk.
- Po 2 misjach neutralny punkt zatrzymania, po 4 rekomendacja przerwy.
- Protokół powrotu po ≥ 3 dniach przerwy nie każe nadrabiać zaległości.
- Test `mission.test.ts` blokuje słownictwo zawstydzające w komunikatach.
- Brak koloru „porażki" w palecie — błąd jest informacją, nie alarmem.
- Koszt podpowiedzi podany **przed** jej wzięciem, bez ukrytych kar.

---

## Status treści — przeczytaj przed użyciem do nauki

`content/math/funkcja-kwadratowa.ts` zawiera 11 zadań autorskich z trzech
kompetencji. **Wszystkie mają `verified: false`.** Matematyka jest sprawdzona
rachunkowo i pokryta testami spójności, ale materiał **nie został
zweryfikowany względem informatora CKE**. To wycinek do domknięcia pętli
produktowej, nie materiał egzaminacyjny.

Testy treści (`funkcja-kwadratowa.test.ts`) pilnują m.in., żeby:

- żaden zadeklarowany typowy błąd nie pokrywał się z poprawną odpowiedzią,
- podpowiedzi poziomów 1–4 nie zdradzały gotowego wyniku,
- każda kompetencja miała zadanie fundamentalne, typowe i transferowe —
  bez tego poziom 4 byłby nieosiągalny, a naprawa błędu nie miałaby co podać.

---

## Czego jeszcze nie ma

- **Powłoka Tauri** — wymaga workloadu C++ (patrz niżej). Bez niej nie ma
  instalatora Windows ani SQLite, więc Etap 0 jest niedomknięty.
- Pełna mapa kompetencji jako widok (jest pojedynczy węzeł).
- Laboratorium błędów, arkusze, raport tygodniowy, plan dnia.
- Moduł informatyki, warstwa AI, głos.
- Testy Playwright (sekcja 16 ich wymaga; są tylko testy jednostkowe).

## Dokończenie toolchainu Tauri

Rust jest zainstalowany. Brakuje kompilatora C++ — bez niego Rust nie
zlinkuje binarki Windows. Instalacja wymaga potwierdzenia UAC:

```bash
winget install --id Microsoft.VisualStudio.2022.BuildTools --override "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

Po instalacji: `rustc --version` powinno działać w nowym terminalu, a wtedy
dopisujemy `src-tauri/` i adapter SQLite.

---

## Struktura

```text
src/
  app/              kompozycja: stan, ekrany, powłoka
  components/       renderer LaTeX
  data/             typy domeny, port trwałości, adapter IndexedDB
  design-system/    tokens
  features/         missions, questions, mastery-map
  learning-engine/  mastery, review, priority, selector, grading, mission
content/math/       zadania + testy spójności treści
docs/               blueprint
```

Cała logika decyzyjna siedzi w `learning-engine` i jest czysta oraz pokryta
testami. `app/` tylko łączy silnik z trwałością i widokiem.

# Nowy tryb nauki matematyki — demo (funkcja kwadratowa)

Jedna lekcja zamiast zestawu quizów: pełne zadanie maturalne rozwiązywane
krok po kroku, a pomiędzy krokami krótkie aktywności dobierane przez silnik
sesji. Kod: `src/nauka/sesja/`.

## Jak otworzyć

- „Dziś” → przedmiot Matematyka → karta **Kontynuuj matematykę · nowy tryb (demo)**,
- albo bezpośredni link `…/#sesja`.

## Przebieg lekcji (kolejność wybiera silnik, nie lista)

1. Start: opanowanie tematu i umiejętności 0–100, błędy „na co uważać”.
2. **Deep Solve**: zadanie z parametrem (10 kroków: zrozumienie → dane → metoda →
   Δ → interpretacja → Viète → x₁² + x₂² → nierówność → część wspólna → sprawdzenie).
   Zadanie napisał FORGE w stylu maturalnym — **nie pochodzi z arkusza CKE**
   i tak jest oznaczone. Wyniki liczy niezależnie `sesja.test.ts`.
3. Wstawki (najwyżej jedna między krokami): mikro-zadanie przed krokiem, gdy
   umiejętność jest słaba; mikro-zadanie po błędzie; dwie fiszki swipe w połowie.
4. Klocki „Ułóż rozwiązanie” (pomijane, gdy delta jest już pewna).
5. Podsumowanie: co idzie dobrze, co sprawia problem, nazwane błędy, zmiana opanowania.
6. ⚡ Szybka powtórka: 5 pytań z najsłabszych miejsc (swipe prawda/fałsz, wybór, liczba, wykres).
7. Koniec: następny szczebel drabiny trudności.

## Dane i bezpieczeństwo postępu

- Nowy stan to preferencja `learning_progress_v2` (ten sam magazyn, kopia JSON,
  synchronizacja). Nic z dotychczasowego postępu nie jest nadpisywane;
  przed pierwszym zapisem v2 aplikacja robi kopię bezpieczeństwa profilu.
- Startowe opanowanie czytane z dotychczasowych poziomów 0–5 (tylko odczyt).
- Fiszki swipe to istniejące karty kursu; „wiedziałem/nie wiedziałem” trafia
  do istniejącego systemu pudełek (`rateCard`: good/again).

## AI

Ten sam nauczyciel co w feedzie (`server/nauczyciel.ts`, Vercel `api/nauczyciel`),
rozszerzony o: kontekst sesji, prośby `podpowiedz | prosciej | podobny | co-zle`,
stopniowanie podpowiedzi i structured output (`rodzaj`, `ujawniaWynik`,
`pytanieKontrolne`, `misconception` tylko z katalogu `bledy.ts`).
Poprawność ocenia zawsze aplikacja (`ocena.ts`, `wyrazenia.ts`), nie AI.
Podpowiedzi 1–4 są lokalne (zero tokenów); AI odpowiada tylko na prośbę ucznia,
a ta sama prośba w tym samym miejscu jest brana z pamięci podręcznej.

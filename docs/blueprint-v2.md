# Blueprint V2 — miejsce na dokument źródłowy

**Ten plik jest pusty celowo. Wklej tu swój dokument „Blueprint V2 — osobisty
system operacyjny nauki".**

Nie skopiowałem go tutaj automatycznie, żeby w repozytorium nie wylądowała
moja parafraza Twojego dokumentu — przy rozbieżności to ona zaczęłaby
udawać źródło prawdy.

## Dlaczego to ma znaczenie

Kod i testy w tym repozytorium odwołują się do numerów sekcji blueprintu,
na przykład:

- `src/learning-engine/priority.ts` — „Blueprint sek. 6" (wagi funkcji priorytetu)
- `src/learning-engine/mastery.ts` — „Blueprint sek. 4.1" (poziomy 0–5)
- `src/features/questions/Arena.tsx` — „Blueprint sek. 7.2" (arena pełnoekranowa)
- `src/features/missions/MissionSummary.tsx` — „sek. 3 i 14" (punkty zatrzymania)
- `src/design-system/tokens.css` — „sek. 2" (kierunek wizualny)

Dopóki tego pliku nie ma, te odwołania są ślepe. Po wklejeniu dokumentu
stają się nawigacją: od decyzji w kodzie do jej uzasadnienia w specyfikacji.

## Zasada na przyszłość

Blueprint jest źródłem wymagań, a nie dziennikiem zmian. Gdy decyzja
w kodzie odejdzie od blueprintu, zmieniamy blueprint świadomie i osobno —
komentarz w kodzie nie jest miejscem na cichą zmianę specyfikacji.

# Prototyp: nauka przez prawdziwe zadania CKE

Gałąź `prototyp-nauka` (kopia FORGE). Zmienione: strona „Dziś” i sześć lekcji
(dwie pierwsze z każdego przedmiotu). Pozostałe lekcje działają jak dotąd
(zakładka „Kurs”).

## Uruchomienie

```bash
npm install
npm run dev              # http://localhost:1420 — nauczyciel w trybie demonstracyjnym
```

Prawdziwy nauczyciel AI — klucz zostaje w procesie serwera (Node), nie trafia
do przeglądarki:

```powershell
$env:ANTHROPIC_API_KEY = "…"; npm run dev
```

Model: `claude-sonnet-5` (zmiana: `FORGE_NAUCZYCIEL_MODEL`). Na GitHub Pages i w
aplikacji Tauri nie ma serwera — tam działa tryb demonstracyjny, wyraźnie
oznaczony.

## Zadania CKE użyte w prototypie

Wszystkie odpowiedzi sprawdzone z oficjalnym kluczem (wrzesień 2026).
Wzory i liczby są dosłowne; opisy słowne (biznes) streszczone, pełny tekst —
pod linkiem.

| Lekcja | Rola | Źródło | Rok | Poziom | Nr | Oficjalna odpowiedź |
|---|---|---|---|---|---|---|
| Ułamki i kolejność działań | seria | zadanie z arkusza CKE — [arkusz diagnostyczny, wrzesień 2022](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/materialy_dodatkowe/diagnostyczne/matematyka/MMAP-P0-100-2209.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/materialy_dodatkowe/diagnostyczne/matematyka/MMAP-P0-100-200-300-400-660-700-Q00-2209-zasady.pdf)) | 2022 | PP | 1 | B ($\frac{4}{25}$) |
| Ułamki i kolejność działań | powtórka | zadanie z arkusza CKE — [matura maj 2026](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2605-arkusz.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-2605-zasady.pdf)) | 2026 | PP | 1 | C (3) |
| Potęgi o wykładniku całkowitym | seria | zadanie z arkusza CKE — [matura maj 2024](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2405-arkusz.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-2405-zasady.pdf)) | 2024 | PP | 2 | B ($2^{16}$) |
| Potęgi o wykładniku całkowitym | powtórka | zadanie z arkusza CKE — [matura maj 2025](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2505-arkusz.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/zasady_oceniania/MMAP-P0-100-2505-zasady.pdf)) | 2025 | PP | 2 | B (31) |
| Potęgi o wykładniku całkowitym | powtórka | zadanie z arkusza CKE — matura maj 2026 (jw.) | 2026 | PP | 5 | P, P |
| Zmienne, typy i działania | seria | zadanie z arkusza CKE — [matura maj 2024, informatyka, „Cyfry”](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Informatyka/MINP-R0-100-A-2405-arkusz.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Informatyka/MINP-R0-100-2405-zasady.pdf)) | 2024 | PR | 2.1 | 542102 → c = 121101, 2 wykonania |
| Zmienne, typy i działania | powtórka | zadanie z arkusza CKE — [matura maj 2025, informatyka](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/Informatyka/MINP-R0-100-A-2505-arkusz.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/zasady_oceniania/MINP-R0-100-2505-zasady.pdf)) | 2025 | PR | 1.1 | 43657688 → 34566788 (4 wywołania) |
| Warunki i wyrażenia logiczne | seria | zadanie z informatora CKE — [Informator z informatyki od 2022/2023](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Informatory/2024/Informator_EM2024_informatyka.pdf), zad. 3 „Przedziały”, plik `dane3.txt` z [Pliki.zip](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Informatory/2024/Pliki.zip) | 2022 | PR | 3.1 | 3 4 (s. 24) |
| Warunki i wyrażenia logiczne | powtórka | zadanie z arkusza CKE — matura maj 2024, informatyka (jw.) | 2024 | PR | 2.1 | 87654321012345678 → 8 wykonań |
| Przedsiębiorczość i innowacje | seria | zadanie z arkusza CKE — [arkusz pokazowy, kwiecień 2026, biznes i zarządzanie](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-arkusz.pdf) ([zasady](https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-zasady.pdf)) | 2026 | PR | 1.1 | cecha + przykład działania (np. odwaga — wyjazd mimo trudności) |
| Przedsiębiorczość i innowacje | powtórka | zadanie z arkusza CKE — arkusz pokazowy 2026 (jw.) | 2026 | PR | 1.2 | np. zarządzanie finansami + dlaczego ważne |
| Komunikacja, wpływ, czas i decyzje | seria | zadanie z arkusza CKE — arkusz pokazowy 2026 (jw.) | 2026 | PR | 5.1–5.2 | oba człony zasady; dwa wyjątki z tekstu |
| Komunikacja, wpływ, czas i decyzje | powtórka | zadanie z arkusza CKE — arkusz pokazowy 2026 (jw.) | 2026 | PR | 2 | synergia: więcej niż suma działań osobno |

### Luki (brak autentycznego zadania CKE)

- Rodzaje i źródła innowacji, patriotyzm gospodarczy — brak w arkuszu
  pokazowym 2026 i w informatorze BiZ. Karta o innowacjach jest oznaczona
  „Ćwiczenie pomocnicze FORGE — to nie jest zadanie CKE”.
- Techniki wpływu i manipulacji, zarządzanie czasem (Eisenhower) — brak;
  karta pomocnicza oznaczona. Etapy decyzji — tylko pośrednio (zad. 1).
- Zadanie 2.1 (informatyka) wymaga też pętli — lekcja o zmiennych śledzi ją
  krok po kroku.

## Jak zadania są podzielone na karty

Każda seria: **zrozum polecenie → wybierz dane → wskaż zasadę → wykonaj
fragment → sprawdź wynik → całe zadanie**. Na każdej karcie etykieta mówi,
który to krok którego zadania (np. „Wykonaj fragment · krok 3 z 9 zadania 1
(zadanie z arkusza CKE, 2022)”). Źródło, link do oryginału, klucz i pełne
rozwiązanie są schowane pod „Źródło i pełne rozwiązanie”.

Rodzaje kart: wybór, decyzja w sytuacji, uporządkowanie etapów, wpis
liczbowy (klawisze `/ ^ − ,`), wskazanie błędu w cudzym rozwiązaniu,
przewidzenie wyniku kodu, odpowiedź otwarta (biznes), całe zadanie. Karty
„z pamięci” wymagają przypomnienia bez podpowiedzi.

Sprawdzanie zawsze regułami (`src/nauka/sprawdz.ts`) i kluczem CKE; AI
nie ocenia. Odpowiedzi otwarte: reguła pokazuje, które kryteria z klucza
widać w tekście, a o wyniku decyduje samoocena wobec przykładów z klucza.

## Adaptacja i powtórki (`src/nauka/silnik.ts`)

- Błąd → wyjaśnienie konkretnej przyczyny (typowe błędy mają własne
  komunikaty) → łatwiejszy krok **tego samego zadania** → powrót do kroku.
  Druga nieudana próba: wyjaśnienie i dalej, bez zaliczenia.
- 3 poprawne za pierwszym razem z rzędu → pomijamy kroki-rusztowania; kolejne
  3 → od razu całe zadanie.
- Pominięcie (przycisk lub przesunięcie w górę bez odpowiedzi) nie zalicza
  kroku. Pasek postępu liczy tylko zaliczone kroki.
- Co 6 odpowiedzi i po całym zadaniu — dyskretny punkt zakończenia.
- Koniec serii → powtórka planowana algorytmem FSRS (`ts-fsrs`), na INNYM
  zadaniu CKE tej umiejętności. „Utrwalone” = 2 udane powtórki po przerwie
  ≥ 20 h. Liczba przewiniętych kart nie ma znaczenia.
- Stan zapisuje się automatycznie po każdej odpowiedzi (preferencja
  `nauka.v1` — ta sama baza co reszta aplikacji, trafia też do kopii JSON).

## Nauczyciel AI — co naprawdę działa

- Endpoint `server/nauczyciel.ts` (dev/preview Vite): SDK Anthropic,
  `claude-sonnet-5`, adaptive thinking, zapasowy model przy odmowie
  (`fallbacks: "default"`). Kontekst: zadanie CKE, źródło, oficjalna
  odpowiedź i zasady oceniania, bieżący krok, odpowiedź ucznia i ocena
  regułami, wcześniejsze trudności w lekcji.
- Przyciski: „Pomóż mi zrobić następny krok”, „Nie rozumiem”, „Skąd to się
  bierze?”, „Wytłumacz inaczej”, „Pokaż pełne rozwiązanie” + własne pytanie.
- Sprawdzone na atrapie API (poprawne zapytanie i odpowiedź). **Z prawdziwym
  modelem nie było testu** — brak klucza w tym środowisku.
- Bez klucza: tryb demonstracyjny (nie AI) — składa odpowiedź z podpowiedzi,
  wyjaśnień i oficjalnego rozwiązania przy karcie.

## Ocena bibliotek

| Biblioteka | Licencja | Decyzja |
|---|---|---|
| ts-fsrs | MIT, bez zależności | **użyta** — planowanie powtórek |
| mathlive | MIT, ~5,7 MB | nie — krótkie odpowiedzi wystarczy wpisać z klawiszami `/ ^ −`; do rozważenia przy pełnych obliczeniach |
| embla-carousel | MIT | nie — własny gest (≈40 linii) łatwiej blokować podczas pisania; brak autoprzewijania |
| pyodide | MPL-2.0 | już w projekcie — dodany tryb „cały program + plik danych” |
| vercel/ai | Apache-2.0, ~7,7 MB | nie — jeden dostawca i jeden endpoint; oficjalne SDK Anthropic po stronie serwera |

## Testy

- `src/nauka/*.test.ts` — reguły sprawdzania, silnik, zgodność odpowiedzi
  A–D z kluczem CKE, wzorcowe programy dają oficjalne wyniki na oryginalnym
  `dane3.txt`, „co wypisze program” zgodne z prawdziwym Pythonem.
- `e2e/nauka.spec.ts` — błąd → łatwiejszy krok, pominięcie bez postępu,
  zapis po ponownym uruchomieniu, tryb demonstracyjny nauczyciela.

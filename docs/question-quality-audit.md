# Audyt pytań FORGE — 8 października 2026

## Zakres i metoda

Automatyczny spis obejmuje wszystkie eksportowane pytania trzech katalogów, wszystkie karty sześciu lekcji, fiszki, lokalne źródła CKE i pytania demonstracyjnej sesji. Katalogi dzielą niektóre zadania: wpis źródłowy CKE i wykorzystująca go karta to dwie powierzchnie, a nie dwa niezależne zadania. Wszystkie ID znajdują się poniżej. Metadane arkuszy bez lokalnej treści są wyszczególnione osobno.

Przeczytano semantycznie wszystkie 76 kart `LEKCJE`, cały plik wariantów, 29 wpisów demonstracyjnej sesji oraz 12 lokalnych zapisów CKE (treść i rozwiązanie; bez ponownej weryfikacji zgodności ze źródłowym PDF). Osobny agent przeczytał wszystkie 359 fiszek front/back. Drugim modelem zrecenzowano wszystkie 1226 pytań korpusu; komplet ID i rozstrzygnięć zapisano w [question-quality-review.json](question-quality-review.json). Nie jest to deklaracja ręcznego rozwiązania wszystkich 1226 pytań ani dowód ich bezbłędności.

Recenzja modelowa zakończyła się 76 sygnałami. Każdy sprawdzono ponownie w kodzie i rozstrzygnięto: w 23 pytaniach poprawiono problem lub brakujący ważny krok; 53 sygnały były fałszywym alarmem albo poprawnym uproszczeniem w kontekście zadania. Pozostałych 1150 pytań model nie oznaczył. Nie ma nierozpatrzonych sygnałów modelu. W ramach niezależnego odczytu poprawiono też cztery pytania korpusu i 20 kart pomocniczych lekcji: razem **27 pytań korpusu, 20 kart lekcji oraz 26 fiszek** (9 korekt i 17 doprecyzowań warunków). Wszystkie ID i dotychczasowe wyniki zachowano.

Przegląd modelowy przekazywał treść, klucz, warianty, rozwiązanie i kroki oraz poziom trudności. Serializacja JSON pomija funkcje JavaScript rysujące krzywe; sygnały o niekompletnych wykresach sprawdzono dodatkowo w oryginalnych definicjach. Koszt samego audytu wyniósł **1,509018 USD**, włącznie z dwoma zakończonymi wywołaniami bez użytecznego pełnego JSON. Nie obejmuje to wcześniejszych ani późniejszych testów nauczyciela. Metadane 455 zadań bez lokalnej treści mają tylko spis — nie pozorną recenzję nieprzeczytanego tekstu.

Potwierdzone poprawki obejmują m.in. niejednoznaczne „dwa razy bliżej” (`e-abs-7`), brak „największego przedziału” (`d-mon-4`), stałą literę odpowiedzi po tasowaniu (`bw-c-5`), pozorne opcje wykresów (`ar-a-1`) i niedopowiedziane kroki w zadaniach z parametrem. Nie przyjęto błędnej sugestii modelu dla `s-ser-8`: zachowano prawidłowe równanie $2x^2-4x+1=0$ i uzupełniono uzasadnienie.

Wszystkie 26 ustaleń o fiszkach mają status `applied: true` w [flashcard-quality-findings.json](flashcard-quality-findings.json); pełny przegląd 359 ID zawiera [flashcard-quality-audit.md](flashcard-quality-audit.md). Poprawki dotyczą m.in. niezerowego sprzężenia, sumy ciągu przy q=1, pionowych prostych, dziedziny logarytmów, `NOT IN` z NULL oraz wyniku typu float dla `10.0 // 2`. Doprecyzowanie RRSO oparto na [poradniku UOKiK](https://uokik.gov.pl/download/13506), a wyjątki od odstąpienia na [wyjaśnieniach UOKiK](https://prawakonsumenta.uokik.gov.pl/prawo-odstapienia-od-umowy/wylaczenia-prawa-do-odstapienia/). Nie certyfikowano aktualności wszystkich stawek prawnych w korpusie.

Pomiar długości dotyczy widocznego tekstu: wzory są renderowane przez KaTeX do MathML, usuwane są znaczniki i ukryta adnotacja TeX, a znaki pierwiastka i kreski ułamkowej liczone są po jednym. Liczymy punkty kodowe po normalizacji odstępów. Nie jest to pomiar szerokości w pikselach: ułamek i indeks zajmują inną przestrzeń niż zwykła linia tekstu. Nie liczymy `\\frac` jako pięciu widocznych liter. Dla źródłowej opcji `około n` oraz `około √n` pomiar zachowuje różnicę. Duplikaty opcji porównujemy po zapisie źródłowym, bo sam tekst wzoru nie zachowuje całej geometrii.

`longest` oznacza jedyną najdłuższą poprawną odpowiedź; `longest-tie` remis z inną opcją. Skuteczność strategii „wybieraj najdłuższą” przy remisie liczy prawdopodobieństwo `1 / liczba najdłuższych opcji`. Ta miara nie uwzględnia wiedzy ucznia. Sama najdłuższa odpowiedź nie oznacza wadliwego pytania. `absolute-distractor` zaznacza słowa typu „zawsze”, „nigdy”, „zakazane” tylko w błędnej opcji; wymaga interpretacji. `answer-in-stem` to dosłowny tekst poprawnej opcji długości co najmniej 12 znaków w pytaniu/kontekście; może być poprawnym pytaniem porównawczym. `duplicate-steps` wykrywa identyczne zdania, nie semantyczne powtarzanie obliczeń.

Wiersz `feed` obejmuje również zapisane historyczne warianty wpisu, wyszukiwanie błędu i oficjalne odpowiedzi CKE. Nie wolno przedstawiać go jako statystyki wyłącznie aktywnych quizów nowego interfejsu. Nowy główny tor matematyki używa wpisu i rachunków, nie listy `WARIANTY`.

## Potwierdzone problemy i poprawki

| ID / zakres | Ustalenie | Działanie |
|---|---|---|
| c1-polecenie, b1-polecenie, b2-polecenie | Poprawna opcja wyjaśniała komplet polecenia; błędne były krótkimi urywkami, czasem niedopasowanymi gramatycznie. | Równoległe struktury odpowiedzi; polecenia należą do opcjonalnego przygotowania. |
| c1-blad, c1-sprawdz | Kontekst podawał różnicę `/` i `//` lub gałąź dla cyfry nieparzystej przed sprawdzaniem tej wiedzy. | Usunięto gotową regułę z kontekstu; wyjaśnienie pozostaje po odpowiedzi, a sprawdzenie używa trzech sensownych zliczeń. |
| c2-dane-l | Zdanie „zawiera tylko liczbę 1” poprzedzało pytanie o liczbę elementów. | Pozostawiono przedział i definicję długości, bez gotowego wyniku. |
| c2-sprawdz | Dystraktory o przyspieszaniu i błędzie Pythona były pozorne. | Opcje dotyczą skutków warunku, nie żartobliwych alternatyw. |
| b1-dane, b1-zasada, b1-decyzja, b1-pomoc | Poprawna odpowiedź zawierała dodatkowe objaśnienie, którego nie miały inne opcje. | Skrócono do decyzji, nazw cech/innowacji i równoległych par korzyści. |
| b1-p1 | „Programowanie” i języki obce były niepowiązane z sytuacją; czas pracy byłby sensowną, lecz potencjalnie także poprawną alternatywą. | Polecenie precyzuje budżet wydatków/dochodów; opcje odnoszą się do finansów, czasu i konfliktów. Karta jawnie pomocnicza do zadania CKE. |
| b2-dane, b2-decyzja | Kontekst bezpośrednio podawał regułę potrzebną do wyboru. | Reguła z pierwszej karty jest podpowiedzią; w drugiej usunięto powtórzenie reguły. |
| b2-zasada, b2-zasada-l, b2-zasada2 | „Zakazane”, „zawsze” oraz brak czasu szefa pozwalały odrzucać opcje bez znajomości komunikacji. | Opcje opisują porównywalne skutki i nieporozumienia; pytanie o ryzyko jednoznacznie odróżnia je od korzyści. |
| b2-p1 | Poprawna rozbudowana definicja synergii kontra luźne hasła. | Trzy równoległe porównania wyniku zespołu i wyników indywidualnych. |
| bk-e-2 | „To nie jest innowacja” było słabym dystraktorem obok trzech rodzajów innowacji. | Cztery nazwy kategorii; spójne wyjaśnienie błędu. |
| bk-e-4, bk-s-1 | Poprawna definicja/komunikat wyróżniały się dodatkową treścią i długością. | Zachowano sens, ujednolicono strukturę lub skrócono poprawny komunikat bez wyrzucania uczuć i skutku. |
| bk-s-7 | Dodatkowa reguła prawna „14 dni” była niepotrzebna do tego zadania i nie uwzględniała szczegółowych warunków. | Usunięto poboczny termin prawny z rozwiązania pytania o manipulację. |
| m1-kwadrat → m1-sprawdz → m1-zadanie | Ten sam wynik końcowy wymagany kilka razy w jednej sesji. | Główny tor zawiera jedno zadanie z rachunkami etapowymi; pomocnicze karty zachowane poza nim. |
| m2-f3 → m2-sprawdz → m2-zadanie | Wielokrotne podanie tego samego wykładnika końcowego. | Jak wyżej, bez usuwania wyników i historycznych ID. |
| b2-polecenie / b2-zasada / b2-zasada2 → b2-zadanie | Obowiązkowe przygotowanie dotyczyło wyjaśniania zasady (5.1), a finał prosi o wyjątki (5.2). | Praktyka zaczyna się od właściwego zadania 5.2, teorię można otworzyć osobno. |

Nie zmieniano oficjalnych opcji, kluczy ani treści `ZADANIA_CKE`. Nie podmieniano ukończonych wyników. Nie próbowano wyrównać wszystkich długości sztucznym dopisywaniem słów.

## Profile praktyki

`getPracticeLesson` tworzy nowy obiekt i nową tablicę `seria`; oryginalne `LEKCJE.seria`, wszystkie `karty` i powtórki pozostają dostępne. `getTheoryCards` udostępnia koncepty/polecenia/dane spoza praktyki, `getExtraPracticeCards` dodatkowe śledzenie i sprawdzenie. ID nigdy nie zmieniają znaczenia zapisanych wyników.

| Umiejętność | Poprzednia liczba obowiązkowych kart | Główny tor praktyki | Uzasadnienie |
|---|---:|---|---|
| num-order | 9 | m1-zadanie | Jedno zadanie z czterema sensownymi operacjami w brudnopisie; bez ponownego wpisywania odpowiedzi. |
| num-powers | 10 | m2-zadanie | Jedno zadanie z grupowaniem przekształceń zamiast dziesięciu kliknięć quizu. |
| cs-py-basics | 9 | c1-kod1, c1-slad, c1-zadanie | Odczyt cyfry, ślad części algorytmu, pełny przypadek. Każda interakcja bada inny zakres pracy. |
| cs-py-conditions | 9 | c2-dane, c2-kod3, c2-zadanie | Interpretacja danych, śledzenie dwóch różnych minimów, zastosowanie do pliku. |
| biz-entrepreneurship | 7 | b1-zadanie | Własna argumentacja do sytuacji; pojęcia i dodatkowa innowacja poza torem obowiązkowym. |
| biz-soft-skills | 8 | b2-zadanie | Własna odpowiedź o dwóch wyjątkach; zasada komunikacji i organizacja czasu w osobnym przygotowaniu. |

Przy korektach danych nadal trzeba uwzględnić historyczną wersję lekcji: migrację po ID obsługuje `practice-course.ts`, a nie ten moduł audytu.

## Świadomie zachowane i wymagające uwagi

- `m1-kolejnosc-l` ma sygnał `answer-in-stem`, bo pytanie jawnie porównuje dwie operacje. To nie jest gotowa informacja, która ma pierwszeństwo; sygnał nie jest błędem.
- `c1-kolejnosc` nadal podaje opis kolejności przed układaniem. To ćwiczenie odczytania algorytmu, nie dowód samodzielnego projektowania. Jest poza głównym torem. Nie należy zaliczać go jako samodzielnego rozwiązania całego zadania.
- Nie każda pierwsza linia karty błędu jest „danymi”. Tylko `m1-blad` zaczyna się samym zapisem wyrażenia. `m2-blad` zaczyna się rzeczywistym przekształceniem; pierwsze linie `c1-blad`, `c2-blad`, `b1-blad`, `b2-blad` są instrukcją, warunkiem lub elementem ocenianej odpowiedzi.
- Wykrycie małej liczby dosłownych duplikatów nie dowodzi braku semantycznych powtórzeń. Do ich oceny potrzebne są cel pytania, kolejność prezentacji i wynik ucznia.
- Flagę długości interpretowano w kontekście treści, nie jako automatyczny nakaz skrócenia. Termin „niedostępność” może być naturalnie dłuższy od „lubienie”; skracanie nazwy pojęcia tylko dla statystyki zaszkodziłoby nauce.
- W demo `mk-blad-viete` usunięto pozorną opcję wskazującą wiersz danych i doprecyzowano pytanie o pierwszy błąd. `sp-ramiona-w-dol` jawnie zakłada dwa różne miejsca zerowe. Są to dwie dodatkowe poprawki demo, poza liczbą 27 pytań korpusu i 20 kart lekcji. Demo ma jawne kroki pomocnicze; nie jest dodatkową serią obowiązkowych kart nowych profili lekcji.

## Odtwarzanie sprawdzeń

`npx vitest run src/nauka/lesson-quality.test.ts` sprawdza profile, zachowanie wszystkich kart/powtórek, jednoznaczność wariantów historycznych, kompletność kluczy wyboru i powtarzalność pomiaru.

Wynik po poprawkach: 157/157 testów korpusów (w tym rzeczywisty Python i SQLite) oraz jakości, następnie 5/5 testów jakości po dodaniu kontroli kompletności jawnych manifestów. Osobno 39 testów zakresu sesji zaliczono po dwóch doprecyzowaniach demo. Zbiorczą weryfikację całej aplikacji opisuje raport integracji.

W PowerShell ustawienie `$env:FORGE_QUALITY_MARKDOWN='1'` przed powyższym testem aktualizuje wyłącznie generowany katalog poniżej. Opcjonalne `$env:FORGE_QUALITY_REPORT='C:/ścieżka/raport.json'` zapisuje dane pomiaru i wejściowe rekordy. Żadne z tych poleceń nie wywołuje modeli ani API.

`npx vite-node scripts/audit-question-quality.ts --estimate` oblicza rozmiary planowanych partii recenzji bez pobierania klucza i bez kontaktu z API. Stan danych z tego audytu: 1226 pytań, 32 partie po maksymalnie 40, 829995 bajtów łącznie, największa 53444 bajty. Plan przy maksymalnie 2500 tokenach wyjścia na partię: około 1,340502 USD według przybliżenia znaków/3; konserwatywnie 2,591062 USD przy tokenowym górnym ograniczeniu liczbą bajtów UTF-8 plus 2048 na narzut. Budżet jest współdzielony i nie odnawia się przez ponowne uruchomienie.

<!-- generated-catalog -->

## Pomiar całego katalogu

| Katalog | Wszystkie pozycje | Z opcjami | Poprawna jedyna najdłuższa | Poprawna w remisie najdłuższych | Strategia najdłuższej, % |
|---|---:|---:|---:|---:|---:|
| corpus-math | 761 | 102 | 9 | 41 | 23.9 |
| flashcard | 359 | 0 | 0 | 0 | — |
| corpus-cs | 238 | 50 | 15 | 12 | 38.7 |
| corpus-biz | 227 | 155 | 64 | 8 | 43.2 |
| feed | 76 | 67 | 5 | 20 | 18 |
| cke-source | 12 | 4 | 0 | 2 | 14.6 |
| deep-task | 1 | 0 | 0 | 0 | — |
| deep-step | 10 | 6 | 1 | 1 | 20.8 |
| blocks | 1 | 0 | 0 | 0 | — |
| micro | 6 | 6 | 1 | 2 | 29.2 |
| speed | 11 | 9 | 2 | 3 | 37 |

Łącznie 1702 wpisów z treścią oraz 455 odnośników do zadań arkuszowych bez lokalnej treści.

## Pełny katalog ID i sygnałów

Długości kolejnych opcji w kolejności danych wykonawczych (po deterministycznym tasowaniu corpus); puste pole oznacza brak opcji. Flagi są sygnałami do recenzji, nie werdyktem błędności.

| Katalog | ID | Długości opcji | Sygnały |
|---|---|---|---|
| corpus-math | n-order-1 |  |  |
| corpus-math | n-order-2 |  |  |
| corpus-math | n-order-3 | 4, 4, 4, 3 |  |
| corpus-math | n-order-4 |  |  |
| corpus-math | n-order-5 |  |  |
| corpus-math | n-order-6 | 1, 4, 3, 3 |  |
| corpus-math | n-order-7 |  |  |
| corpus-math | n-order-8 |  |  |
| corpus-math | n-pow-1 |  |  |
| corpus-math | n-pow-2 |  |  |
| corpus-math | n-pow-3 | 1, 4, 1, 3 |  |
| corpus-math | n-pow-4 |  |  |
| corpus-math | n-pow-5 |  |  |
| corpus-math | n-pow-6 | 1, 1, 3, 3 |  |
| corpus-math | n-pow-7 |  |  |
| corpus-math | n-pow-8 |  |  |
| corpus-math | n-root-1 |  |  |
| corpus-math | n-root-2 |  |  |
| corpus-math | n-root-3 | 3, 4, 4, 3 |  |
| corpus-math | n-root-4 |  |  |
| corpus-math | n-root-5 |  |  |
| corpus-math | n-root-6 | 1, 1, 2, 2 | longest-tie |
| corpus-math | n-root-7 |  |  |
| corpus-math | n-root-8 |  |  |
| corpus-math | n-pct-1 |  |  |
| corpus-math | n-pct-2 |  |  |
| corpus-math | n-pct-3 | 7, 7, 6, 7 | longest-tie |
| corpus-math | n-pct-4 |  |  |
| corpus-math | n-pct-5 |  |  |
| corpus-math | n-pct-6 | 25, 26, 27, 26 |  |
| corpus-math | n-pct-7 |  |  |
| corpus-math | n-pct-8 |  |  |
| corpus-math | n-abs-1 |  |  |
| corpus-math | n-abs-2 |  |  |
| corpus-math | n-abs-3 | 14, 6, 6, 6 |  |
| corpus-math | n-abs-4 |  |  |
| corpus-math | n-abs-5 | 14, 14, 6, 14 | longest-tie |
| corpus-math | n-abs-6 |  |  |
| corpus-math | n-abs-7 |  |  |
| corpus-math | n-abs-8 |  |  |
| corpus-math | n-apx-1 |  |  |
| corpus-math | n-apx-2 |  |  |
| corpus-math | n-apx-3 | 6, 7, 7, 8 |  |
| corpus-math | n-apx-4 |  |  |
| corpus-math | n-apx-5 |  |  |
| corpus-math | n-apx-6 | 3, 4, 2, 4 |  |
| corpus-math | n-apx-7 |  |  |
| corpus-math | n-apx-8 |  |  |
| corpus-math | a-exp-1 |  |  |
| corpus-math | a-exp-2 |  |  |
| corpus-math | a-exp-3 | 9, 9, 8, 5 | longest-tie |
| corpus-math | a-exp-4 |  |  |
| corpus-math | a-exp-5 | 1, 2, 5, 5 | longest-tie |
| corpus-math | a-exp-6 |  |  |
| corpus-math | a-exp-7 |  |  |
| corpus-math | a-exp-8 |  |  |
| corpus-math | a-fac-1 |  |  |
| corpus-math | a-fac-2 |  |  |
| corpus-math | a-fac-3 | 6, 10, 10, 6 | longest-tie |
| corpus-math | a-fac-4 |  |  |
| corpus-math | a-fac-5 |  |  |
| corpus-math | a-fac-6 | 15, 11, 11, 15 | longest-tie |
| corpus-math | a-fac-7 |  |  |
| corpus-math | a-fac-8 |  |  |
| corpus-math | a-rat-1 |  |  |
| corpus-math | a-rat-2 |  |  |
| corpus-math | a-rat-3 | 8, 5, 6, 5 | longest |
| corpus-math | a-rat-4 |  |  |
| corpus-math | a-rat-5 | 4, 4, 4, 4 | longest-tie |
| corpus-math | a-rat-6 |  |  |
| corpus-math | a-rat-7 |  |  |
| corpus-math | a-rat-8 |  |  |
| corpus-math | a-cub-1 |  |  |
| corpus-math | a-cub-2 |  |  |
| corpus-math | a-cub-3 | 14, 6, 14, 14 | longest-tie |
| corpus-math | a-cub-4 |  |  |
| corpus-math | a-cub-5 |  |  |
| corpus-math | a-cub-6 | 7, 4, 9, 7 |  |
| corpus-math | a-cub-7 |  |  |
| corpus-math | a-cub-8 |  |  |
| corpus-math | a-irr-1 |  |  |
| corpus-math | a-irr-2 |  |  |
| corpus-math | a-irr-3 | 6, 4, 6, 6 | longest-tie |
| corpus-math | a-irr-4 |  |  |
| corpus-math | a-irr-5 |  |  |
| corpus-math | a-irr-6 |  |  |
| corpus-math | a-irr-7 |  |  |
| corpus-math | a-irr-8 |  |  |
| corpus-math | e-lin-1 |  |  |
| corpus-math | e-lin-2 |  |  |
| corpus-math | e-lin-3 | 1, 1, 1, 3 |  |
| corpus-math | e-lin-4 |  |  |
| corpus-math | e-lin-5 | 30, 32, 24, 16 | longest |
| corpus-math | e-lin-6 |  |  |
| corpus-math | e-lin-7 |  |  |
| corpus-math | e-lin-8 |  |  |
| corpus-math | e-ineq-1 |  |  |
| corpus-math | e-ineq-2 |  |  |
| corpus-math | e-ineq-3 | 6, 6, 6, 6 | longest-tie |
| corpus-math | e-ineq-4 |  |  |
| corpus-math | e-ineq-5 |  |  |
| corpus-math | e-ineq-6 | 7, 6, 7, 7 | longest-tie |
| corpus-math | e-ineq-7 |  |  |
| corpus-math | e-ineq-8 |  |  |
| corpus-math | e-sys-1 |  |  |
| corpus-math | e-sys-2 |  |  |
| corpus-math | e-sys-3 | 8, 8, 8, 8 | longest-tie |
| corpus-math | e-sys-4 |  |  |
| corpus-math | e-sys-5 |  |  |
| corpus-math | e-sys-6 | 23, 32, 16, 30 |  |
| corpus-math | e-sys-7 |  |  |
| corpus-math | e-sys-8 |  |  |
| corpus-math | e-rat-1 |  |  |
| corpus-math | e-rat-2 |  |  |
| corpus-math | e-rat-3 | 27, 33, 14, 32 | longest |
| corpus-math | e-rat-4 |  |  |
| corpus-math | e-rat-5 |  |  |
| corpus-math | e-rat-6 |  |  |
| corpus-math | e-rat-7 |  |  |
| corpus-math | e-rat-8 |  |  |
| corpus-math | e-abs-1 |  |  |
| corpus-math | e-abs-2 |  |  |
| corpus-math | e-abs-3 | 27, 24, 16, 32 |  |
| corpus-math | e-abs-4 |  |  |
| corpus-math | e-abs-5 |  |  |
| corpus-math | e-abs-6 |  |  |
| corpus-math | e-abs-7 |  |  |
| corpus-math | e-abs-8 |  |  |
| corpus-math | e-par-1 |  |  |
| corpus-math | e-par-2 |  |  |
| corpus-math | e-par-3 | 30, 16, 30, 32 | longest |
| corpus-math | e-par-4 |  |  |
| corpus-math | e-par-5 |  |  |
| corpus-math | e-par-6 |  |  |
| corpus-math | e-par-7 |  |  |
| corpus-math | e-par-8 |  |  |
| corpus-math | f-bas-1 |  |  |
| corpus-math | f-bas-2 |  |  |
| corpus-math | f-bas-3 | 7, 5, 6, 5 |  |
| corpus-math | f-bas-4 |  |  |
| corpus-math | f-bas-5 |  |  |
| corpus-math | f-bas-6 | 13, 13, 7, 5 | longest-tie |
| corpus-math | f-bas-7 |  |  |
| corpus-math | f-bas-8 |  |  |
| corpus-math | f-gr-1 |  |  |
| corpus-math | f-gr-2 |  |  |
| corpus-math | f-gr-3 | 5, 7, 6, 5 |  |
| corpus-math | f-gr-4 |  |  |
| corpus-math | f-gr-5 |  |  |
| corpus-math | f-gr-6 | 6, 6, 6, 6 | longest-tie |
| corpus-math | f-gr-7 |  |  |
| corpus-math | f-gr-8 |  |  |
| corpus-math | f-sh-1 |  |  |
| corpus-math | f-sh-2 |  |  |
| corpus-math | f-sh-3 | 6, 6, 5, 7 | longest |
| corpus-math | f-sh-4 |  |  |
| corpus-math | f-sh-5 | 13, 13, 13, 13 | longest-tie |
| corpus-math | f-sh-6 |  |  |
| corpus-math | f-sh-7 |  |  |
| corpus-math | f-sh-8 |  |  |
| corpus-math | f-tr-1 |  |  |
| corpus-math | f-tr-2 |  |  |
| corpus-math | f-tr-3 | 5, 11, 29, 5 |  |
| corpus-math | f-tr-4 |  |  |
| corpus-math | f-tr-5 | 7, 8, 7, 8 | longest-tie |
| corpus-math | f-tr-6 |  |  |
| corpus-math | f-tr-7 |  |  |
| corpus-math | f-tr-8 |  |  |
| corpus-math | f-co-1 |  |  |
| corpus-math | f-co-2 |  |  |
| corpus-math | f-co-3 | 5, 5, 7, 6 |  |
| corpus-math | f-co-4 |  |  |
| corpus-math | f-co-5 |  |  |
| corpus-math | f-co-6 |  |  |
| corpus-math | f-co-7 |  |  |
| corpus-math | f-co-8 |  |  |
| corpus-math | l-for-1 |  |  |
| corpus-math | l-for-2 |  |  |
| corpus-math | l-for-3 | 21, 5, 7, 8 |  |
| corpus-math | l-for-4 | 9, 9, 9, 9 | longest-tie |
| corpus-math | l-for-5 |  |  |
| corpus-math | l-for-6 |  |  |
| corpus-math | l-for-7 |  |  |
| corpus-math | l-for-8 |  |  |
| corpus-math | l-two-1 |  |  |
| corpus-math | l-two-2 |  |  |
| corpus-math | l-two-3 | 6, 6, 8, 6 |  |
| corpus-math | l-two-4 |  |  |
| corpus-math | l-two-5 |  |  |
| corpus-math | l-two-6 | 5, 6, 6, 4 |  |
| corpus-math | l-two-7 |  |  |
| corpus-math | l-two-8 |  |  |
| corpus-math | l-par-1 |  |  |
| corpus-math | l-par-2 |  |  |
| corpus-math | l-par-3 | 8, 7, 8, 8 | longest-tie |
| corpus-math | l-par-4 |  |  |
| corpus-math | l-par-5 |  |  |
| corpus-math | l-par-6 |  |  |
| corpus-math | l-par-7 |  |  |
| corpus-math | l-par-8 |  |  |
| corpus-math | l-mod-1 |  |  |
| corpus-math | l-mod-2 |  |  |
| corpus-math | l-mod-3 | 10, 12, 12, 14 |  |
| corpus-math | l-mod-4 |  |  |
| corpus-math | l-mod-5 |  |  |
| corpus-math | l-mod-6 |  |  |
| corpus-math | l-mod-7 |  |  |
| corpus-math | l-mod-8 |  |  |
| corpus-math | l-prm-1 |  |  |
| corpus-math | l-prm-2 |  |  |
| corpus-math | l-prm-3 | 3, 3, 3, 4 |  |
| corpus-math | l-prm-4 |  |  |
| corpus-math | l-prm-5 |  |  |
| corpus-math | l-prm-6 |  |  |
| corpus-math | l-prm-7 |  |  |
| corpus-math | l-prm-8 |  |  |
| corpus-math | q-disc-1 |  |  |
| corpus-math | q-disc-2 |  |  |
| corpus-math | q-disc-3 |  |  |
| corpus-math | q-disc-4 |  |  |
| corpus-math | q-vertex-1 |  |  |
| corpus-math | q-vertex-2 |  |  |
| corpus-math | q-vertex-3 |  |  |
| corpus-math | q-vertex-4 |  |  |
| corpus-math | q-vieta-1 |  |  |
| corpus-math | q-vieta-2 |  |  |
| corpus-math | q-vieta-3 |  |  |
| corpus-math | k-frm-1 |  |  |
| corpus-math | k-frm-2 |  |  |
| corpus-math | k-frm-3 | 22, 21, 20, 20 |  |
| corpus-math | k-frm-4 |  |  |
| corpus-math | k-frm-5 | 11, 10, 11, 11 | longest-tie |
| corpus-math | k-frm-6 |  |  |
| corpus-math | k-frm-7 |  |  |
| corpus-math | k-frm-8 |  |  |
| corpus-math | k-dis-5 |  |  |
| corpus-math | k-dis-6 | 29, 27, 15, 14 |  |
| corpus-math | k-dis-7 |  |  |
| corpus-math | k-ver-5 | 1, 2, 2, 2 | longest-tie |
| corpus-math | k-ver-6 |  |  |
| corpus-math | k-inq-1 |  |  |
| corpus-math | k-inq-2 |  |  |
| corpus-math | k-inq-3 | 6, 5, 5, 13 | longest |
| corpus-math | k-inq-4 |  |  |
| corpus-math | k-inq-5 | 30, 45, 16, 34 |  |
| corpus-math | k-inq-6 |  |  |
| corpus-math | k-inq-7 |  |  |
| corpus-math | k-inq-8 |  |  |
| corpus-math | k-opt-1 |  |  |
| corpus-math | k-opt-2 |  |  |
| corpus-math | k-opt-3 | 12, 1, 2, 1 |  |
| corpus-math | k-opt-4 |  |  |
| corpus-math | k-opt-5 |  |  |
| corpus-math | k-opt-6 |  |  |
| corpus-math | k-opt-7 |  |  |
| corpus-math | k-opt-8 |  |  |
| corpus-math | k-vie-4 |  |  |
| corpus-math | k-vie-5 | 1, 4, 2, 1 |  |
| corpus-math | k-vie-6 |  |  |
| corpus-math | k-prm-1 |  |  |
| corpus-math | k-prm-2 |  |  |
| corpus-math | k-prm-3 | 8, 16, 8, 10 |  |
| corpus-math | k-prm-4 |  |  |
| corpus-math | k-prm-5 |  |  |
| corpus-math | k-prm-6 |  |  |
| corpus-math | k-prm-7 |  |  |
| corpus-math | k-prm-8 |  |  |
| corpus-math | w-bas-1 |  |  |
| corpus-math | w-bas-2 |  |  |
| corpus-math | w-bas-3 | 2, 2, 1, 1 |  |
| corpus-math | w-bas-4 |  |  |
| corpus-math | w-bas-5 |  |  |
| corpus-math | w-bas-6 |  |  |
| corpus-math | w-bas-7 |  |  |
| corpus-math | w-bas-8 |  |  |
| corpus-math | w-div-1 |  |  |
| corpus-math | w-div-2 |  |  |
| corpus-math | w-div-3 | 5, 5, 5, 5 | longest-tie |
| corpus-math | w-div-4 |  |  |
| corpus-math | w-div-5 |  |  |
| corpus-math | w-div-6 |  |  |
| corpus-math | w-div-7 |  |  |
| corpus-math | w-div-8 |  |  |
| corpus-math | w-root-1 |  |  |
| corpus-math | w-root-2 |  |  |
| corpus-math | w-root-3 | 2, 1, 2, 1 | longest-tie |
| corpus-math | w-root-4 |  |  |
| corpus-math | w-root-5 |  |  |
| corpus-math | w-root-6 | 11, 11, 11, 10 | longest-tie |
| corpus-math | w-root-7 |  |  |
| corpus-math | w-root-8 |  |  |
| corpus-math | w-eq-1 |  |  |
| corpus-math | w-eq-2 |  |  |
| corpus-math | w-eq-3 | 14, 15, 18, 17 |  |
| corpus-math | w-eq-4 |  |  |
| corpus-math | w-eq-5 |  |  |
| corpus-math | w-eq-6 |  |  |
| corpus-math | w-eq-7 |  |  |
| corpus-math | w-eq-8 |  |  |
| corpus-math | w-inq-1 |  |  |
| corpus-math | w-inq-2 |  |  |
| corpus-math | w-inq-3 | 13, 6, 13, 13 | longest-tie |
| corpus-math | w-inq-4 |  |  |
| corpus-math | w-inq-5 |  |  |
| corpus-math | w-inq-6 | 11, 7, 6, 6 |  |
| corpus-math | w-inq-7 |  |  |
| corpus-math | w-inq-8 |  |  |
| corpus-math | w-inv-1 |  |  |
| corpus-math | w-inv-2 |  |  |
| corpus-math | w-inv-3 |  |  |
| corpus-math | w-inv-4 | 32, 39, 23, 33 |  |
| corpus-math | w-inv-5 |  |  |
| corpus-math | w-inv-6 |  |  |
| corpus-math | w-inv-7 |  |  |
| corpus-math | w-inv-8 |  |  |
| corpus-math | w-sh-1 |  |  |
| corpus-math | w-sh-2 |  |  |
| corpus-math | w-sh-3 | 1, 5, 5, 6 |  |
| corpus-math | w-sh-4 |  |  |
| corpus-math | w-sh-5 |  |  |
| corpus-math | w-sh-6 |  |  |
| corpus-math | w-sh-7 |  |  |
| corpus-math | w-sh-8 |  |  |
| corpus-math | w-ineq-1 |  |  |
| corpus-math | w-ineq-2 |  |  |
| corpus-math | w-ineq-3 | 6, 5, 6, 6 | longest-tie |
| corpus-math | w-ineq-4 |  |  |
| corpus-math | w-ineq-5 |  |  |
| corpus-math | w-ineq-6 |  |  |
| corpus-math | w-ineq-7 |  |  |
| corpus-math | w-ineq-8 |  |  |
| corpus-math | q-log-b-1 |  |  |
| corpus-math | q-log-b-2 |  |  |
| corpus-math | q-log-b-3 |  |  |
| corpus-math | q-log-b-4 |  |  |
| corpus-math | q-log-p-1 |  |  |
| corpus-math | q-log-p-2 |  |  |
| corpus-math | q-log-p-3 |  |  |
| corpus-math | q-log-p-4 |  |  |
| corpus-math | q-exp-1 |  |  |
| corpus-math | q-exp-2 |  |  |
| corpus-math | q-exp-3 |  |  |
| corpus-math | q-exp-4 |  |  |
| corpus-math | x-fn-1 |  |  |
| corpus-math | x-fn-2 |  |  |
| corpus-math | x-fn-3 | 5, 38, 7, 8 |  |
| corpus-math | x-fn-4 |  |  |
| corpus-math | x-fn-5 |  |  |
| corpus-math | x-fn-6 | 4, 6, 5, 3 |  |
| corpus-math | x-fn-7 |  |  |
| corpus-math | x-fn-8 |  |  |
| corpus-math | x-eq-1 |  |  |
| corpus-math | x-eq-2 |  |  |
| corpus-math | x-eq-3 |  |  |
| corpus-math | x-eq-4 |  |  |
| corpus-math | x-mod-1 |  |  |
| corpus-math | x-mod-2 |  |  |
| corpus-math | x-mod-3 | 3, 2, 3, 3 | longest-tie |
| corpus-math | x-mod-4 |  |  |
| corpus-math | x-mod-5 |  |  |
| corpus-math | x-mod-6 |  |  |
| corpus-math | x-mod-7 |  |  |
| corpus-math | x-mod-8 |  |  |
| corpus-math | x-lb-1 |  |  |
| corpus-math | x-lb-2 |  |  |
| corpus-math | x-lb-3 |  |  |
| corpus-math | x-lb-4 |  |  |
| corpus-math | x-lp-1 |  |  |
| corpus-math | x-lp-2 |  |  |
| corpus-math | x-lp-3 |  |  |
| corpus-math | x-lp-4 |  |  |
| corpus-math | x-lf-1 |  |  |
| corpus-math | x-lf-2 | 6, 6, 6, 7 |  |
| corpus-math | x-lf-3 |  |  |
| corpus-math | x-lf-4 |  |  |
| corpus-math | x-lf-5 |  |  |
| corpus-math | x-lf-6 | 1, 2, 1, 1 |  |
| corpus-math | x-lf-7 |  |  |
| corpus-math | x-lf-8 |  |  |
| corpus-math | x-le-1 |  |  |
| corpus-math | x-le-2 |  |  |
| corpus-math | x-le-3 |  |  |
| corpus-math | x-le-4 | 7, 7, 6, 6 | longest-tie |
| corpus-math | x-le-5 |  |  |
| corpus-math | x-le-6 |  |  |
| corpus-math | x-le-7 |  |  |
| corpus-math | x-le-8 |  |  |
| corpus-math | q-seq-a-1 |  |  |
| corpus-math | q-seq-a-2 |  |  |
| corpus-math | q-seq-a-3 |  |  |
| corpus-math | q-seq-a-4 |  |  |
| corpus-math | q-seq-g-1 |  |  |
| corpus-math | q-seq-g-2 |  |  |
| corpus-math | q-seq-g-3 |  |  |
| corpus-math | q-seq-g-4 |  |  |
| corpus-math | q-seq-l-1 |  |  |
| corpus-math | q-seq-l-2 |  |  |
| corpus-math | q-seq-l-3 |  |  |
| corpus-math | q-seq-l-4 |  |  |
| corpus-math | s-bas-1 |  |  |
| corpus-math | s-bas-2 |  |  |
| corpus-math | s-bas-3 |  |  |
| corpus-math | s-bas-4 | 7, 8, 7, 8 |  |
| corpus-math | s-bas-5 |  |  |
| corpus-math | s-bas-6 |  |  |
| corpus-math | s-bas-7 |  |  |
| corpus-math | s-bas-8 |  |  |
| corpus-math | s-ar-1 |  |  |
| corpus-math | s-ar-2 |  |  |
| corpus-math | s-ar-3 |  |  |
| corpus-math | s-ar-4 |  |  |
| corpus-math | s-ge-1 |  |  |
| corpus-math | s-ge-2 |  |  |
| corpus-math | s-ge-3 |  |  |
| corpus-math | s-ge-4 |  |  |
| corpus-math | s-mix-1 |  |  |
| corpus-math | s-mix-2 |  |  |
| corpus-math | s-mix-3 | 24, 25, 24, 25 | longest-tie |
| corpus-math | s-mix-4 |  |  |
| corpus-math | s-mix-5 |  |  |
| corpus-math | s-mix-6 |  |  |
| corpus-math | s-mix-7 |  |  |
| corpus-math | s-mix-8 |  |  |
| corpus-math | s-lim-1 |  |  |
| corpus-math | s-lim-2 |  |  |
| corpus-math | s-lim-3 |  |  |
| corpus-math | s-lim-4 |  |  |
| corpus-math | s-ser-1 |  |  |
| corpus-math | s-ser-2 | 9, 11, 7, 7 | longest |
| corpus-math | s-ser-3 |  |  |
| corpus-math | s-ser-4 |  |  |
| corpus-math | s-ser-5 |  |  |
| corpus-math | s-ser-6 |  |  |
| corpus-math | s-ser-7 |  |  |
| corpus-math | s-ser-8 |  |  |
| corpus-math | q-trig-v-1 |  |  |
| corpus-math | q-trig-v-2 |  |  |
| corpus-math | q-trig-v-3 |  |  |
| corpus-math | q-trig-v-4 |  |  |
| corpus-math | q-trig-i-1 |  |  |
| corpus-math | q-trig-i-2 |  |  |
| corpus-math | q-trig-i-3 |  |  |
| corpus-math | q-trig-i-4 |  |  |
| corpus-math | q-trig-e-1 |  |  |
| corpus-math | q-trig-e-2 |  |  |
| corpus-math | q-trig-e-3 |  |  |
| corpus-math | q-trig-e-4 |  |  |
| corpus-math | t-val-1 |  |  |
| corpus-math | t-val-2 |  |  |
| corpus-math | t-val-3 |  |  |
| corpus-math | t-val-4 |  |  |
| corpus-math | t-id-1 | 1, 1, 2, 7 |  |
| corpus-math | t-id-2 |  |  |
| corpus-math | t-id-3 |  |  |
| corpus-math | t-id-4 |  |  |
| corpus-math | t-obt-1 |  |  |
| corpus-math | t-obt-2 |  |  |
| corpus-math | t-obt-3 | 7, 8, 8, 7 | longest-tie |
| corpus-math | t-obt-4 |  |  |
| corpus-math | t-obt-5 |  |  |
| corpus-math | t-obt-6 |  |  |
| corpus-math | t-obt-7 |  |  |
| corpus-math | t-obt-8 |  |  |
| corpus-math | t-area-1 |  |  |
| corpus-math | t-area-2 |  |  |
| corpus-math | t-area-3 |  |  |
| corpus-math | t-area-4 |  |  |
| corpus-math | t-area-5 |  |  |
| corpus-math | t-area-6 |  |  |
| corpus-math | t-area-7 |  |  |
| corpus-math | t-area-8 |  |  |
| corpus-math | t-law-1 |  |  |
| corpus-math | t-law-2 |  |  |
| corpus-math | t-law-3 | 25, 10, 11, 13 |  |
| corpus-math | t-law-4 |  |  |
| corpus-math | t-law-5 |  |  |
| corpus-math | t-law-6 |  |  |
| corpus-math | t-law-7 |  |  |
| corpus-math | t-law-8 |  |  |
| corpus-math | t-rad-1 |  |  |
| corpus-math | t-rad-2 |  |  |
| corpus-math | t-rad-3 | 2, 1, 3, 2 |  |
| corpus-math | t-rad-4 |  |  |
| corpus-math | t-rad-5 |  |  |
| corpus-math | t-rad-6 |  |  |
| corpus-math | t-rad-7 |  |  |
| corpus-math | t-rad-8 |  |  |
| corpus-math | t-frm-1 |  |  |
| corpus-math | t-frm-2 |  |  |
| corpus-math | t-frm-3 | 3, 4, 1, 1 | longest |
| corpus-math | t-frm-4 |  |  |
| corpus-math | t-frm-5 |  |  |
| corpus-math | t-frm-6 |  |  |
| corpus-math | t-frm-7 |  |  |
| corpus-math | t-frm-8 |  |  |
| corpus-math | t-eq-1 |  |  |
| corpus-math | t-eq-2 |  |  |
| corpus-math | t-eq-3 |  |  |
| corpus-math | t-eq-4 |  |  |
| corpus-math | p-ang-1 |  |  |
| corpus-math | p-ang-2 |  |  |
| corpus-math | p-ang-3 |  |  |
| corpus-math | p-ang-4 |  |  |
| corpus-math | p-ang-5 |  |  |
| corpus-math | p-ang-6 |  |  |
| corpus-math | p-ang-7 |  |  |
| corpus-math | p-ang-8 |  |  |
| corpus-math | p-tri-1 |  |  |
| corpus-math | p-tri-2 |  |  |
| corpus-math | p-tri-3 |  |  |
| corpus-math | p-tri-4 |  |  |
| corpus-math | p-tri-5 |  |  |
| corpus-math | p-tri-6 |  |  |
| corpus-math | p-tri-7 |  |  |
| corpus-math | p-tri-8 |  |  |
| corpus-math | p-sim-1 |  |  |
| corpus-math | p-sim-2 |  |  |
| corpus-math | p-sim-3 | 5, 7, 5, 6 |  |
| corpus-math | p-sim-4 |  |  |
| corpus-math | p-sim-5 |  |  |
| corpus-math | p-sim-6 |  |  |
| corpus-math | p-sim-7 |  |  |
| corpus-math | p-sim-8 |  |  |
| corpus-math | p-quad-1 |  |  |
| corpus-math | p-quad-2 |  |  |
| corpus-math | p-quad-3 |  |  |
| corpus-math | p-quad-4 | 8, 13, 10, 16 |  |
| corpus-math | p-quad-5 |  |  |
| corpus-math | p-quad-6 |  |  |
| corpus-math | p-quad-7 |  |  |
| corpus-math | p-quad-8 |  |  |
| corpus-math | p-circ-1 |  |  |
| corpus-math | p-circ-2 |  |  |
| corpus-math | p-circ-3 |  |  |
| corpus-math | p-circ-4 |  |  |
| corpus-math | p-circ-5 |  |  |
| corpus-math | p-circ-6 |  |  |
| corpus-math | p-circ-7 |  |  |
| corpus-math | p-circ-8 |  |  |
| corpus-math | p-ins-1 |  |  |
| corpus-math | p-ins-2 |  |  |
| corpus-math | p-ins-3 | 8, 15, 6, 11 |  |
| corpus-math | p-ins-4 |  |  |
| corpus-math | p-ins-5 |  |  |
| corpus-math | p-ins-6 |  |  |
| corpus-math | p-ins-7 |  |  |
| corpus-math | p-ins-8 |  |  |
| corpus-math | q-geo-d-1 |  |  |
| corpus-math | q-geo-d-2 |  |  |
| corpus-math | q-geo-d-3 |  |  |
| corpus-math | q-geo-d-4 |  |  |
| corpus-math | q-geo-l-1 |  |  |
| corpus-math | q-geo-l-2 |  |  |
| corpus-math | q-geo-l-3 |  |  |
| corpus-math | q-geo-l-4 |  |  |
| corpus-math | q-geo-c-1 |  |  |
| corpus-math | q-geo-c-2 |  |  |
| corpus-math | q-geo-c-3 |  |  |
| corpus-math | q-geo-c-4 |  |  |
| corpus-math | g-dist-1 |  |  |
| corpus-math | g-dist-2 |  |  |
| corpus-math | g-dist-3 |  |  |
| corpus-math | g-dist-4 |  |  |
| corpus-math | g-line-1 |  |  |
| corpus-math | g-line-2 |  |  |
| corpus-math | g-line-3 |  |  |
| corpus-math | g-line-4 |  |  |
| corpus-math | g-fig-1 |  |  |
| corpus-math | g-fig-2 |  |  |
| corpus-math | g-fig-3 |  |  |
| corpus-math | g-fig-4 | 5, 5, 5, 5 | longest-tie |
| corpus-math | g-fig-5 |  |  |
| corpus-math | g-fig-6 |  |  |
| corpus-math | g-fig-7 |  |  |
| corpus-math | g-fig-8 |  |  |
| corpus-math | g-circ-1 |  |  |
| corpus-math | g-circ-2 |  |  |
| corpus-math | g-circ-3 |  |  |
| corpus-math | g-circ-4 |  |  |
| corpus-math | g-pl-1 |  |  |
| corpus-math | g-pl-2 |  |  |
| corpus-math | g-pl-3 |  |  |
| corpus-math | g-pl-4 | 31, 26, 10, 37 |  |
| corpus-math | g-pl-5 |  |  |
| corpus-math | g-pl-6 |  |  |
| corpus-math | g-pl-7 |  |  |
| corpus-math | g-pl-8 |  |  |
| corpus-math | st-pr-1 |  |  |
| corpus-math | st-pr-2 |  |  |
| corpus-math | st-pr-3 |  |  |
| corpus-math | st-pr-4 |  |  |
| corpus-math | st-pr-5 |  |  |
| corpus-math | st-pr-6 | 2, 1, 2, 2 | longest-tie |
| corpus-math | st-pr-7 |  |  |
| corpus-math | st-pr-8 |  |  |
| corpus-math | st-py-1 |  |  |
| corpus-math | st-py-2 |  |  |
| corpus-math | st-py-3 | 2, 1, 2, 1 | longest-tie |
| corpus-math | st-py-4 |  |  |
| corpus-math | st-py-5 |  |  |
| corpus-math | st-py-6 |  |  |
| corpus-math | st-py-7 |  |  |
| corpus-math | st-py-8 |  |  |
| corpus-math | st-an-1 |  |  |
| corpus-math | st-an-2 |  |  |
| corpus-math | st-an-3 |  |  |
| corpus-math | st-an-4 |  |  |
| corpus-math | st-an-5 | 4, 4, 4, 4 | longest-tie |
| corpus-math | st-an-6 |  |  |
| corpus-math | st-an-7 |  |  |
| corpus-math | st-an-8 |  |  |
| corpus-math | st-so-1 |  |  |
| corpus-math | st-so-2 |  |  |
| corpus-math | st-so-3 |  |  |
| corpus-math | st-so-4 |  |  |
| corpus-math | st-so-5 |  |  |
| corpus-math | st-so-6 |  |  |
| corpus-math | st-so-7 |  |  |
| corpus-math | st-so-8 |  |  |
| corpus-math | st-adv-1 |  |  |
| corpus-math | st-adv-2 | 9, 19, 19, 7 | longest-tie |
| corpus-math | st-adv-3 |  |  |
| corpus-math | st-adv-4 |  |  |
| corpus-math | st-adv-5 |  |  |
| corpus-math | st-adv-6 |  |  |
| corpus-math | st-adv-7 |  |  |
| corpus-math | st-adv-8 |  |  |
| corpus-math | q-prob-k-1 |  |  |
| corpus-math | q-prob-k-2 |  |  |
| corpus-math | q-prob-k-3 |  |  |
| corpus-math | q-prob-k-4 |  |  |
| corpus-math | q-prob-c-1 |  |  |
| corpus-math | q-prob-c-2 |  |  |
| corpus-math | q-prob-c-3 |  |  |
| corpus-math | q-prob-c-4 |  |  |
| corpus-math | q-prob-z-1 |  |  |
| corpus-math | q-prob-z-2 |  |  |
| corpus-math | q-prob-z-3 |  |  |
| corpus-math | q-prob-z-4 |  |  |
| corpus-math | pr-cnt-1 |  |  |
| corpus-math | pr-cnt-2 |  |  |
| corpus-math | pr-cnt-3 |  |  |
| corpus-math | pr-cnt-4 |  |  |
| corpus-math | pr-cl-1 |  |  |
| corpus-math | pr-cl-2 |  |  |
| corpus-math | pr-cl-3 |  |  |
| corpus-math | pr-cl-4 |  |  |
| corpus-math | pr-cp-1 |  |  |
| corpus-math | pr-cp-2 |  |  |
| corpus-math | pr-cp-3 |  |  |
| corpus-math | pr-cp-4 |  |  |
| corpus-math | pr-cd-1 |  |  |
| corpus-math | pr-cd-2 |  |  |
| corpus-math | pr-cd-3 | 3, 4, 3, 3 |  |
| corpus-math | pr-cd-4 |  |  |
| corpus-math | pr-cd-5 |  |  |
| corpus-math | pr-cd-6 |  |  |
| corpus-math | pr-cd-7 |  |  |
| corpus-math | pr-cd-8 |  |  |
| corpus-math | pr-bn-1 |  |  |
| corpus-math | pr-bn-2 |  |  |
| corpus-math | pr-bn-3 | 5, 5, 4, 4 | longest-tie |
| corpus-math | pr-bn-4 |  |  |
| corpus-math | pr-bn-5 |  |  |
| corpus-math | pr-bn-6 |  |  |
| corpus-math | pr-bn-7 |  |  |
| corpus-math | pr-bn-8 |  |  |
| corpus-math | pr-st-1 |  |  |
| corpus-math | pr-st-2 |  |  |
| corpus-math | pr-st-3 |  |  |
| corpus-math | pr-st-4 | 1, 1, 1, 1 | longest-tie |
| corpus-math | pr-st-5 |  |  |
| corpus-math | pr-st-6 |  |  |
| corpus-math | pr-st-7 |  |  |
| corpus-math | pr-st-8 |  |  |
| corpus-math | q-der-b-1 |  |  |
| corpus-math | q-der-b-2 |  |  |
| corpus-math | q-der-b-3 |  |  |
| corpus-math | q-der-b-4 |  |  |
| corpus-math | q-der-t-1 |  |  |
| corpus-math | q-der-t-2 |  |  |
| corpus-math | q-der-t-3 |  |  |
| corpus-math | q-der-t-4 |  |  |
| corpus-math | q-der-e-1 |  |  |
| corpus-math | q-der-e-2 |  |  |
| corpus-math | q-der-e-3 |  |  |
| corpus-math | q-der-e-4 |  |  |
| corpus-math | d-lim-1 |  |  |
| corpus-math | d-lim-2 |  |  |
| corpus-math | d-lim-3 | 2, 1, 1, 4 |  |
| corpus-math | d-lim-4 |  |  |
| corpus-math | d-lim-5 |  |  |
| corpus-math | d-lim-6 |  |  |
| corpus-math | d-lim-7 |  |  |
| corpus-math | d-lim-8 |  |  |
| corpus-math | d-bas-1 |  |  |
| corpus-math | d-bas-2 |  |  |
| corpus-math | d-bas-3 |  |  |
| corpus-math | d-bas-4 |  |  |
| corpus-math | d-rul-1 |  |  |
| corpus-math | d-rul-2 |  |  |
| corpus-math | d-rul-3 | 3, 6, 9, 8 | longest |
| corpus-math | d-rul-4 |  |  |
| corpus-math | d-rul-5 |  |  |
| corpus-math | d-rul-6 |  |  |
| corpus-math | d-rul-7 |  |  |
| corpus-math | d-rul-8 |  |  |
| corpus-math | d-tan-1 |  |  |
| corpus-math | d-tan-2 |  |  |
| corpus-math | d-tan-3 |  |  |
| corpus-math | d-tan-4 |  |  |
| corpus-math | d-mon-1 |  |  |
| corpus-math | d-mon-2 | 32, 31, 23, 28 |  |
| corpus-math | d-mon-3 |  |  |
| corpus-math | d-mon-4 |  |  |
| corpus-math | d-mon-5 |  |  |
| corpus-math | d-mon-6 |  |  |
| corpus-math | d-mon-7 |  |  |
| corpus-math | d-mon-8 |  |  |
| corpus-math | d-ext-1 |  |  |
| corpus-math | d-ext-2 |  |  |
| corpus-math | d-ext-3 |  |  |
| corpus-math | d-ext-4 |  |  |
| corpus-math | d-opt-1 |  |  |
| corpus-math | d-opt-2 |  |  |
| corpus-math | d-opt-3 |  |  |
| corpus-math | d-opt-4 |  |  |
| corpus-math | d-opt-5 |  |  |
| corpus-math | d-opt-6 |  |  |
| corpus-math | d-opt-7 |  |  |
| corpus-math | d-opt-8 |  |  |
| corpus-math | u-prf-1 |  |  |
| corpus-math | u-prf-2 | 1, 1, 1, 1 | longest-tie |
| corpus-math | u-prf-3 |  |  |
| corpus-math | u-prf-4 |  |  |
| corpus-math | u-prf-5 | 11, 7, 7, 11 | longest-tie |
| corpus-math | u-prf-6 |  |  |
| corpus-math | u-prf-7 |  |  |
| corpus-math | u-prf-8 |  |  |
| corpus-math | u-gprf-1 | 11, 28, 13, 26 |  |
| corpus-math | u-gprf-2 |  |  |
| corpus-math | u-gprf-3 | 76, 68, 94, 69 |  |
| corpus-math | u-gprf-4 |  |  |
| corpus-math | u-gprf-5 | 9, 9, 9, 9 | longest-tie |
| corpus-math | u-gprf-6 |  |  |
| corpus-math | u-gprf-7 | 15, 33, 14, 15 |  |
| corpus-math | u-gprf-8 |  |  |
| corpus-math | u-vec-1 |  |  |
| corpus-math | u-vec-2 |  |  |
| corpus-math | u-vec-3 |  |  |
| corpus-math | u-vec-4 | 14, 13, 13, 13 |  |
| corpus-math | u-vec-5 |  |  |
| corpus-math | u-vec-6 |  |  |
| corpus-math | u-vec-7 |  |  |
| corpus-math | u-vec-8 |  |  |
| corpus-math | u-gap-darboux | 38, 8, 38, 24 | longest-tie |
| corpus-math | u-gap-defder |  |  |
| corpus-math | u-gap-binom |  |  |
| corpus-math | u-gap-similar |  |  |
| corpus-math | u-gap-circleimg |  |  |
| corpus-math | u-gap-twocircles |  |  |
| flashcard | c-num-order-1 |  |  |
| flashcard | c-num-order-2 |  |  |
| flashcard | c-num-order-3 |  |  |
| flashcard | c-num-order-4 |  |  |
| flashcard | c-num-pow-1 |  |  |
| flashcard | c-num-pow-2 |  |  |
| flashcard | c-num-pow-3 |  |  |
| flashcard | c-num-pow-4 |  |  |
| flashcard | c-num-root-1 |  |  |
| flashcard | c-num-root-2 |  |  |
| flashcard | c-num-root-3 |  |  |
| flashcard | c-num-root-4 |  |  |
| flashcard | c-num-pct-1 |  |  |
| flashcard | c-num-pct-2 |  |  |
| flashcard | c-num-pct-3 |  |  |
| flashcard | c-num-pct-4 |  |  |
| flashcard | c-num-abs-1 |  |  |
| flashcard | c-num-abs-2 |  |  |
| flashcard | c-num-abs-3 |  |  |
| flashcard | c-num-abs-4 |  |  |
| flashcard | c-num-apx-1 |  |  |
| flashcard | c-num-apx-2 |  |  |
| flashcard | c-num-apx-3 |  |  |
| flashcard | c-alg-exp-1 |  |  |
| flashcard | c-alg-exp-2 |  |  |
| flashcard | c-alg-exp-3 |  |  |
| flashcard | c-alg-exp-4 |  |  |
| flashcard | c-alg-fac-1 |  |  |
| flashcard | c-alg-fac-2 |  |  |
| flashcard | c-alg-fac-3 |  |  |
| flashcard | c-alg-rat-1 |  |  |
| flashcard | c-alg-rat-2 |  |  |
| flashcard | c-alg-rat-3 |  |  |
| flashcard | c-alg-cub-1 |  |  |
| flashcard | c-alg-cub-2 |  |  |
| flashcard | c-alg-cub-3 |  |  |
| flashcard | c-alg-cub-4 |  |  |
| flashcard | c-alg-irr-1 |  |  |
| flashcard | c-alg-irr-2 |  |  |
| flashcard | c-alg-irr-3 |  |  |
| flashcard | c-eq-lin-1 |  |  |
| flashcard | c-eq-lin-2 |  |  |
| flashcard | c-eq-lin-3 |  |  |
| flashcard | c-eq-ineq-1 |  |  |
| flashcard | c-eq-ineq-2 |  |  |
| flashcard | c-eq-ineq-3 |  |  |
| flashcard | c-eq-sys-1 |  |  |
| flashcard | c-eq-sys-2 |  |  |
| flashcard | c-eq-sys-3 |  |  |
| flashcard | c-eq-rat-1 |  |  |
| flashcard | c-eq-rat-2 |  |  |
| flashcard | c-eq-rat-3 |  |  |
| flashcard | c-eq-abs-1 |  |  |
| flashcard | c-eq-abs-2 |  |  |
| flashcard | c-eq-abs-3 |  |  |
| flashcard | c-eq-par-1 |  |  |
| flashcard | c-eq-par-2 |  |  |
| flashcard | c-fn-bas-1 |  |  |
| flashcard | c-fn-bas-2 |  |  |
| flashcard | c-fn-bas-3 |  |  |
| flashcard | c-fn-gr-1 |  |  |
| flashcard | c-fn-gr-2 |  |  |
| flashcard | c-fn-gr-3 |  |  |
| flashcard | c-fn-sh-1 |  |  |
| flashcard | c-fn-sh-2 |  |  |
| flashcard | c-fn-tr-1 |  |  |
| flashcard | c-fn-tr-2 |  |  |
| flashcard | c-fn-co-1 |  |  |
| flashcard | c-fn-co-2 |  |  |
| flashcard | c-lin-for-1 |  |  |
| flashcard | c-lin-for-2 |  |  |
| flashcard | c-lin-for-3 |  |  |
| flashcard | c-lin-two-1 |  |  |
| flashcard | c-lin-two-2 |  |  |
| flashcard | c-lin-par-1 |  |  |
| flashcard | c-lin-par-2 |  |  |
| flashcard | c-lin-par-3 |  |  |
| flashcard | c-lin-mod-1 |  |  |
| flashcard | c-lin-mod-2 |  |  |
| flashcard | c-lin-prm-1 |  |  |
| flashcard | c-lin-prm-2 |  |  |
| flashcard | c-quad-frm-1 |  |  |
| flashcard | c-quad-frm-2 |  |  |
| flashcard | c-quad-frm-3 |  |  |
| flashcard | c-quad-dis-1 |  |  |
| flashcard | c-quad-dis-2 |  |  |
| flashcard | c-quad-dis-3 |  |  |
| flashcard | c-quad-ver-1 |  |  |
| flashcard | c-quad-ver-2 |  |  |
| flashcard | c-quad-inq-1 |  |  |
| flashcard | c-quad-inq-2 |  |  |
| flashcard | c-quad-opt-1 |  |  |
| flashcard | c-quad-opt-2 |  |  |
| flashcard | c-quad-vie-1 |  |  |
| flashcard | c-quad-vie-2 |  |  |
| flashcard | c-quad-vie-3 |  |  |
| flashcard | c-quad-prm-1 |  |  |
| flashcard | c-quad-prm-2 |  |  |
| flashcard | c-poly-bas-1 |  |  |
| flashcard | c-poly-bas-2 |  |  |
| flashcard | c-poly-div-1 |  |  |
| flashcard | c-poly-div-2 |  |  |
| flashcard | c-poly-div-3 |  |  |
| flashcard | c-poly-root-1 |  |  |
| flashcard | c-poly-root-2 |  |  |
| flashcard | c-poly-eq-1 |  |  |
| flashcard | c-poly-eq-2 |  |  |
| flashcard | c-poly-inq-1 |  |  |
| flashcard | c-poly-inq-2 |  |  |
| flashcard | c-rat-inv-1 |  |  |
| flashcard | c-rat-inv-2 |  |  |
| flashcard | c-rat-sh-1 |  |  |
| flashcard | c-rat-sh-2 |  |  |
| flashcard | c-rat-in-1 |  |  |
| flashcard | c-rat-in-2 |  |  |
| flashcard | c-exp-fn-1 |  |  |
| flashcard | c-exp-fn-2 |  |  |
| flashcard | c-exp-fn-3 |  |  |
| flashcard | c-exp-eq-1 |  |  |
| flashcard | c-exp-eq-2 |  |  |
| flashcard | c-exp-mod-1 |  |  |
| flashcard | c-exp-mod-2 |  |  |
| flashcard | c-log-b-1 |  |  |
| flashcard | c-log-b-2 |  |  |
| flashcard | c-log-p-1 |  |  |
| flashcard | c-log-p-2 |  |  |
| flashcard | c-log-p-3 |  |  |
| flashcard | c-log-f-1 |  |  |
| flashcard | c-log-f-2 |  |  |
| flashcard | c-log-e-1 |  |  |
| flashcard | c-log-e-2 |  |  |
| flashcard | c-seq-bas-1 |  |  |
| flashcard | c-seq-bas-2 |  |  |
| flashcard | c-seq-ar-1 |  |  |
| flashcard | c-seq-ar-2 |  |  |
| flashcard | c-seq-ge-1 |  |  |
| flashcard | c-seq-ge-2 |  |  |
| flashcard | c-seq-mix-1 |  |  |
| flashcard | c-seq-mix-2 |  |  |
| flashcard | c-seq-lim-1 |  |  |
| flashcard | c-seq-lim-2 |  |  |
| flashcard | c-seq-ser-1 |  |  |
| flashcard | c-seq-ser-2 |  |  |
| flashcard | c-trig-v-1 |  |  |
| flashcard | c-trig-v-2 |  |  |
| flashcard | c-trig-i-1 |  |  |
| flashcard | c-trig-i-2 |  |  |
| flashcard | c-trig-o-1 |  |  |
| flashcard | c-trig-o-2 |  |  |
| flashcard | c-trig-a-1 |  |  |
| flashcard | c-trig-a-2 |  |  |
| flashcard | c-trig-l-1 |  |  |
| flashcard | c-trig-l-2 |  |  |
| flashcard | c-trig-r-1 |  |  |
| flashcard | c-trig-r-2 |  |  |
| flashcard | c-trig-f-1 |  |  |
| flashcard | c-trig-f-2 |  |  |
| flashcard | c-trig-e-1 |  |  |
| flashcard | c-trig-e-2 |  |  |
| flashcard | c-plan-ang-1 |  |  |
| flashcard | c-plan-ang-2 |  |  |
| flashcard | c-plan-tri-1 |  |  |
| flashcard | c-plan-tri-2 |  |  |
| flashcard | c-plan-sim-1 |  |  |
| flashcard | c-plan-sim-2 |  |  |
| flashcard | c-plan-quad-1 |  |  |
| flashcard | c-plan-quad-2 |  |  |
| flashcard | c-plan-circ-1 |  |  |
| flashcard | c-plan-circ-2 |  |  |
| flashcard | c-plan-ins-1 |  |  |
| flashcard | c-plan-ins-2 |  |  |
| flashcard | c-geo-d-1 |  |  |
| flashcard | c-geo-d-2 |  |  |
| flashcard | c-geo-l-1 |  |  |
| flashcard | c-geo-l-2 |  |  |
| flashcard | c-geo-f-1 |  |  |
| flashcard | c-geo-f-2 |  |  |
| flashcard | c-geo-c-1 |  |  |
| flashcard | c-geo-c-2 |  |  |
| flashcard | c-geo-p-1 |  |  |
| flashcard | c-geo-p-2 |  |  |
| flashcard | c-st-pr-1 |  |  |
| flashcard | c-st-pr-2 |  |  |
| flashcard | c-st-py-1 |  |  |
| flashcard | c-st-py-2 |  |  |
| flashcard | c-st-an-1 |  |  |
| flashcard | c-st-an-2 |  |  |
| flashcard | c-st-so-1 |  |  |
| flashcard | c-st-so-2 |  |  |
| flashcard | c-st-adv-1 |  |  |
| flashcard | c-st-adv-2 |  |  |
| flashcard | c-prb-cnt-1 |  |  |
| flashcard | c-prb-cnt-2 |  |  |
| flashcard | c-prb-cl-1 |  |  |
| flashcard | c-prb-cl-2 |  |  |
| flashcard | c-prb-cp-1 |  |  |
| flashcard | c-prb-cp-2 |  |  |
| flashcard | c-prb-cd-1 |  |  |
| flashcard | c-prb-cd-2 |  |  |
| flashcard | c-prb-bn-1 |  |  |
| flashcard | c-prb-bn-2 |  |  |
| flashcard | c-prb-st-1 |  |  |
| flashcard | c-prb-st-2 |  |  |
| flashcard | c-der-lim-1 |  |  |
| flashcard | c-der-lim-2 |  |  |
| flashcard | c-der-bas-1 |  |  |
| flashcard | c-der-bas-2 |  |  |
| flashcard | c-der-rul-1 |  |  |
| flashcard | c-der-rul-2 |  |  |
| flashcard | c-der-tan-1 |  |  |
| flashcard | c-der-tan-2 |  |  |
| flashcard | c-der-mon-1 |  |  |
| flashcard | c-der-mon-2 |  |  |
| flashcard | c-der-ext-1 |  |  |
| flashcard | c-der-ext-2 |  |  |
| flashcard | c-der-opt-1 |  |  |
| flashcard | c-der-opt-2 |  |  |
| flashcard | c-u-prf-1 |  |  |
| flashcard | c-u-prf-2 |  |  |
| flashcard | c-u-gprf-1 |  |  |
| flashcard | c-u-gprf-2 |  |  |
| flashcard | c-u-vec-1 |  |  |
| flashcard | c-u-vec-2 |  |  |
| corpus-cs | py-b-1 |  |  |
| corpus-cs | py-b-2 | 5, 3, 3, 4 | longest |
| corpus-cs | py-b-3 |  |  |
| corpus-cs | py-b-4 |  |  |
| corpus-cs | py-b-5 |  |  |
| corpus-cs | py-b-6 |  |  |
| corpus-cs | py-b-7 |  |  |
| corpus-cs | py-c-1 |  |  |
| corpus-cs | py-c-2 |  |  |
| corpus-cs | py-c-3 |  |  |
| corpus-cs | py-c-4 | 16, 15, 9, 16 | longest-tie |
| corpus-cs | py-c-5 |  |  |
| corpus-cs | py-c-6 |  |  |
| corpus-cs | py-l-1 |  |  |
| corpus-cs | py-l-2 |  |  |
| corpus-cs | py-l-3 |  |  |
| corpus-cs | py-l-4 |  |  |
| corpus-cs | py-l-5 |  |  |
| corpus-cs | py-l-6 |  |  |
| corpus-cs | py-l-7 |  |  |
| corpus-cs | py-f-1 |  |  |
| corpus-cs | py-f-2 |  |  |
| corpus-cs | py-f-3 | 2, 1, 4, 27 |  |
| corpus-cs | py-f-4 |  |  |
| corpus-cs | py-f-5 |  |  |
| corpus-cs | py-f-6 |  |  |
| corpus-cs | dt-a-1 |  |  |
| corpus-cs | dt-a-2 | 14, 10, 15, 11 |  |
| corpus-cs | dt-a-3 |  |  |
| corpus-cs | dt-a-4 |  |  |
| corpus-cs | dt-a-5 |  |  |
| corpus-cs | dt-a-6 |  |  |
| corpus-cs | dt-a-7 |  |  |
| corpus-cs | dt-s-1 |  |  |
| corpus-cs | dt-s-2 | 14, 15, 10, 11 |  |
| corpus-cs | dt-s-3 |  |  |
| corpus-cs | dt-s-4 |  |  |
| corpus-cs | dt-s-5 |  |  |
| corpus-cs | dt-s-6 |  |  |
| corpus-cs | dt-s-7 |  |  |
| corpus-cs | dt-d-1 |  |  |
| corpus-cs | dt-d-2 | 15, 8, 41, 9 |  |
| corpus-cs | dt-d-3 |  |  |
| corpus-cs | dt-d-4 |  |  |
| corpus-cs | dt-d-5 |  |  |
| corpus-cs | dt-d-6 |  |  |
| corpus-cs | dt-d-7 |  |  |
| corpus-cs | dt-f-1 |  |  |
| corpus-cs | dt-f-2 | 10, 18, 16, 10 |  |
| corpus-cs | dt-f-3 |  |  |
| corpus-cs | dt-f-4 |  |  |
| corpus-cs | dt-f-5 |  |  |
| corpus-cs | dt-f-6 |  |  |
| corpus-cs | dt-f-7 |  |  |
| corpus-cs | nm-p-1 |  |  |
| corpus-cs | nm-p-2 | 33, 26, 45, 36 | absolute-distractor |
| corpus-cs | nm-p-3 |  |  |
| corpus-cs | nm-p-4 |  |  |
| corpus-cs | nm-p-5 |  |  |
| corpus-cs | nm-p-6 |  |  |
| corpus-cs | nm-p-7 |  |  |
| corpus-cs | nm-g-1 |  |  |
| corpus-cs | nm-g-2 | 18, 18, 5, 13 | longest-tie |
| corpus-cs | nm-g-3 |  |  |
| corpus-cs | nm-g-4 |  |  |
| corpus-cs | nm-g-5 |  |  |
| corpus-cs | nm-g-6 |  |  |
| corpus-cs | nm-g-7 |  |  |
| corpus-cs | nm-b-1 |  |  |
| corpus-cs | nm-b-2 | 2, 2, 2, 2 | longest-tie |
| corpus-cs | nm-b-3 |  |  |
| corpus-cs | nm-b-4 |  |  |
| corpus-cs | nm-b-5 |  |  |
| corpus-cs | nm-b-6 |  |  |
| corpus-cs | nm-b-7 |  |  |
| corpus-cs | nm-h-1 |  |  |
| corpus-cs | nm-h-2 | 2, 2, 1, 1 |  |
| corpus-cs | nm-h-3 |  |  |
| corpus-cs | nm-h-4 |  |  |
| corpus-cs | nm-h-5 |  |  |
| corpus-cs | nm-h-6 |  |  |
| corpus-cs | nm-h-7 |  |  |
| corpus-cs | nm-x-1 | 24, 49, 27, 54 |  |
| corpus-cs | nm-x-2 |  |  |
| corpus-cs | nm-x-3 |  |  |
| corpus-cs | nm-x-4 |  |  |
| corpus-cs | nm-x-5 |  |  |
| corpus-cs | nm-x-6 | 6, 52, 17, 11 | absolute-distractor |
| corpus-cs | nm-x-7 |  |  |
| corpus-cs | so-s-1 |  |  |
| corpus-cs | so-s-2 | 36, 32, 38, 22 |  |
| corpus-cs | so-s-3 |  |  |
| corpus-cs | so-s-4 |  |  |
| corpus-cs | so-s-5 |  |  |
| corpus-cs | so-s-6 |  |  |
| corpus-cs | so-s-7 |  |  |
| corpus-cs | so-m-1 |  |  |
| corpus-cs | so-m-2 | 1, 5, 6, 2 | longest |
| corpus-cs | so-m-3 |  |  |
| corpus-cs | so-m-4 |  |  |
| corpus-cs | so-m-5 |  |  |
| corpus-cs | so-m-6 | 13, 10, 29, 7 |  |
| corpus-cs | so-m-7 |  |  |
| corpus-cs | so-b-1 | 20, 34, 23, 35 |  |
| corpus-cs | so-b-2 |  |  |
| corpus-cs | so-b-3 |  |  |
| corpus-cs | so-b-4 |  |  |
| corpus-cs | so-b-5 |  |  |
| corpus-cs | so-b-6 |  |  |
| corpus-cs | so-b-7 |  |  |
| corpus-cs | tc-r-1 |  |  |
| corpus-cs | tc-r-2 | 57, 49, 16, 16 | longest |
| corpus-cs | tc-r-3 |  |  |
| corpus-cs | tc-r-4 |  |  |
| corpus-cs | tc-r-5 |  |  |
| corpus-cs | tc-r-6 |  |  |
| corpus-cs | tc-r-7 |  |  |
| corpus-cs | tc-g-1 |  |  |
| corpus-cs | tc-g-2 | 22, 22, 22, 22 | longest-tie |
| corpus-cs | tc-g-3 |  |  |
| corpus-cs | tc-g-4 |  |  |
| corpus-cs | tc-g-5 |  |  |
| corpus-cs | tc-g-6 |  |  |
| corpus-cs | tc-g-7 |  |  |
| corpus-cs | tc-d-1 |  |  |
| corpus-cs | tc-d-2 | 38, 46, 40, 37 |  |
| corpus-cs | tc-d-3 |  |  |
| corpus-cs | tc-d-4 |  |  |
| corpus-cs | tc-d-5 |  |  |
| corpus-cs | tc-d-6 |  |  |
| corpus-cs | tc-d-7 |  |  |
| corpus-cs | tc-s-1 |  |  |
| corpus-cs | tc-s-2 | 29, 37, 25, 21 |  |
| corpus-cs | tc-s-3 |  |  |
| corpus-cs | tc-s-4 |  |  |
| corpus-cs | tc-s-5 |  |  |
| corpus-cs | tc-s-6 |  |  |
| corpus-cs | tc-s-7 |  |  |
| corpus-cs | st-s-1 |  |  |
| corpus-cs | st-s-2 | 23, 23, 19, 19 | longest-tie |
| corpus-cs | st-s-3 |  |  |
| corpus-cs | st-s-4 |  |  |
| corpus-cs | st-s-5 |  |  |
| corpus-cs | st-s-6 |  |  |
| corpus-cs | st-s-7 |  |  |
| corpus-cs | st-g-1 |  |  |
| corpus-cs | st-g-2 | 2, 1, 2, 2 | longest-tie |
| corpus-cs | st-g-3 |  |  |
| corpus-cs | st-g-4 |  |  |
| corpus-cs | st-g-5 |  |  |
| corpus-cs | st-g-6 |  |  |
| corpus-cs | st-g-7 |  |  |
| corpus-cs | re-a-1 |  |  |
| corpus-cs | re-a-2 | 7, 9, 12, 8 | longest |
| corpus-cs | re-a-3 |  |  |
| corpus-cs | re-a-4 | 36, 28, 35, 33 | longest |
| corpus-cs | re-a-5 |  |  |
| corpus-cs | re-a-6 |  |  |
| corpus-cs | re-a-7 |  |  |
| corpus-cs | re-r-1 |  |  |
| corpus-cs | re-r-2 | 8, 8, 8, 8 | longest-tie |
| corpus-cs | re-r-3 |  |  |
| corpus-cs | re-r-4 |  |  |
| corpus-cs | re-r-5 |  |  |
| corpus-cs | re-r-6 |  |  |
| corpus-cs | re-r-7 | 3, 5, 3, 3 | longest |
| corpus-cs | re-r-8 |  |  |
| corpus-cs | re-l-1 |  |  |
| corpus-cs | re-l-2 | 6, 12, 7, 12 | longest-tie |
| corpus-cs | re-l-3 |  |  |
| corpus-cs | re-l-4 |  |  |
| corpus-cs | re-l-5 | 19, 6, 18, 11 |  |
| corpus-cs | re-l-6 |  |  |
| corpus-cs | re-l-7 |  |  |
| corpus-cs | db-s-1 | 4, 5, 8, 6 |  |
| corpus-cs | db-s-2 |  |  |
| corpus-cs | db-s-3 |  |  |
| corpus-cs | db-s-4 |  |  |
| corpus-cs | db-s-5 |  |  |
| corpus-cs | db-s-6 |  |  |
| corpus-cs | db-s-7 |  |  |
| corpus-cs | db-a-1 |  |  |
| corpus-cs | db-a-2 |  |  |
| corpus-cs | db-a-3 | 7, 10, 8, 8 |  |
| corpus-cs | db-a-4 |  |  |
| corpus-cs | db-a-5 |  |  |
| corpus-cs | db-a-6 |  |  |
| corpus-cs | db-a-7 |  |  |
| corpus-cs | db-j-1 | 40, 33, 41, 40 |  |
| corpus-cs | db-j-2 |  |  |
| corpus-cs | db-j-3 |  |  |
| corpus-cs | db-j-4 |  |  |
| corpus-cs | db-j-5 |  |  |
| corpus-cs | db-j-6 |  |  |
| corpus-cs | db-j-7 |  |  |
| corpus-cs | db-m-1 | 34, 57, 40, 46 | longest |
| corpus-cs | db-m-2 | 16, 23, 14, 14 |  |
| corpus-cs | db-m-3 |  |  |
| corpus-cs | db-m-4 |  |  |
| corpus-cs | db-m-5 |  |  |
| corpus-cs | db-m-6 | 59, 55, 68, 55 | longest |
| corpus-cs | db-m-7 |  |  |
| corpus-cs | db-m-8 |  |  |
| corpus-cs | ar-f-1 | 6, 6, 6, 6 | longest-tie |
| corpus-cs | ar-f-2 | 6, 6, 6, 6 | longest-tie |
| corpus-cs | ar-f-3 |  |  |
| corpus-cs | ar-f-4 | 24, 40, 40, 31 | longest-tie |
| corpus-cs | ar-f-5 |  |  |
| corpus-cs | ar-f-6 | 6, 6, 6, 6 | longest-tie |
| corpus-cs | ar-f-7 |  |  |
| corpus-cs | ar-a-1 | 7, 9, 10, 6 |  |
| corpus-cs | ar-a-2 | 50, 59, 43, 51 | longest |
| corpus-cs | ar-a-3 |  |  |
| corpus-cs | ar-a-4 |  |  |
| corpus-cs | ar-a-5 |  |  |
| corpus-cs | ar-a-6 |  |  |
| corpus-cs | ar-a-7 |  |  |
| corpus-cs | ne-n-1 | 20, 6, 17, 15 |  |
| corpus-cs | ne-n-2 | 50, 41, 35, 29 | longest |
| corpus-cs | ne-n-3 |  |  |
| corpus-cs | ne-n-4 |  |  |
| corpus-cs | ne-n-5 |  |  |
| corpus-cs | ne-n-6 | 51, 55, 60, 61 | longest |
| corpus-cs | ne-n-7 |  |  |
| corpus-cs | ne-c-1 | 4, 3, 3, 3 | longest |
| corpus-cs | ne-c-2 |  |  |
| corpus-cs | ne-c-3 | 46, 54, 57, 33 |  |
| corpus-cs | ne-c-4 |  |  |
| corpus-cs | ne-c-5 |  |  |
| corpus-cs | ne-c-6 |  |  |
| corpus-cs | ne-c-7 |  |  |
| corpus-cs | ne-s-1 | 68, 11, 35, 51 | longest |
| corpus-cs | ne-s-2 | 22, 23, 21, 24 |  |
| corpus-cs | ne-s-3 | 50, 46, 53, 57 | longest |
| corpus-cs | ne-s-4 |  |  |
| corpus-cs | ne-s-5 |  |  |
| corpus-cs | ne-s-6 | 66, 55, 88, 54 | longest |
| corpus-cs | ne-s-7 |  |  |
| flashcard | c-py-b-1 |  |  |
| flashcard | c-py-b-2 |  |  |
| flashcard | c-py-c-1 |  |  |
| flashcard | c-py-c-2 |  |  |
| flashcard | c-py-l-1 |  |  |
| flashcard | c-py-l-2 |  |  |
| flashcard | c-py-f-1 |  |  |
| flashcard | c-py-f-2 |  |  |
| flashcard | c-dt-a-1 |  |  |
| flashcard | c-dt-a-2 |  |  |
| flashcard | c-dt-s-1 |  |  |
| flashcard | c-dt-s-2 |  |  |
| flashcard | c-dt-d-1 |  |  |
| flashcard | c-dt-d-2 |  |  |
| flashcard | c-dt-f-1 |  |  |
| flashcard | c-dt-f-2 |  |  |
| flashcard | c-nm-p-1 |  |  |
| flashcard | c-nm-p-2 |  |  |
| flashcard | c-nm-g-1 |  |  |
| flashcard | c-nm-g-2 |  |  |
| flashcard | c-nm-b-1 |  |  |
| flashcard | c-nm-b-2 |  |  |
| flashcard | c-nm-h-1 |  |  |
| flashcard | c-nm-h-2 |  |  |
| flashcard | c-nm-x-1 |  |  |
| flashcard | c-nm-x-2 |  |  |
| flashcard | c-so-s-1 |  |  |
| flashcard | c-so-s-2 |  |  |
| flashcard | c-so-m-1 |  |  |
| flashcard | c-so-m-2 |  |  |
| flashcard | c-so-b-1 |  |  |
| flashcard | c-so-b-2 |  |  |
| flashcard | c-tc-r-1 |  |  |
| flashcard | c-tc-r-2 |  |  |
| flashcard | c-tc-g-1 |  |  |
| flashcard | c-tc-g-2 |  |  |
| flashcard | c-tc-d-1 |  |  |
| flashcard | c-tc-d-2 |  |  |
| flashcard | c-tc-s-1 |  |  |
| flashcard | c-tc-s-2 |  |  |
| flashcard | c-st-s-1 |  |  |
| flashcard | c-st-s-2 |  |  |
| flashcard | c-st-g-1 |  |  |
| flashcard | c-st-g-2 |  |  |
| flashcard | c-re-a-1 |  |  |
| flashcard | c-re-a-2 |  |  |
| flashcard | c-re-r-1 |  |  |
| flashcard | c-re-r-2 |  |  |
| flashcard | c-re-l-1 |  |  |
| flashcard | c-re-l-2 |  |  |
| flashcard | c-db-s-1 |  |  |
| flashcard | c-db-s-2 |  |  |
| flashcard | c-db-a-1 |  |  |
| flashcard | c-db-a-2 |  |  |
| flashcard | c-db-j-1 |  |  |
| flashcard | c-db-j-2 |  |  |
| flashcard | c-db-m-1 |  |  |
| flashcard | c-db-m-2 |  |  |
| flashcard | c-ar-f-1 |  |  |
| flashcard | c-ar-f-2 |  |  |
| flashcard | c-ar-a-1 |  |  |
| flashcard | c-ar-a-2 |  |  |
| flashcard | c-ne-n-1 |  |  |
| flashcard | c-ne-n-2 |  |  |
| flashcard | c-ne-c-1 |  |  |
| flashcard | c-ne-c-2 |  |  |
| flashcard | c-ne-s-1 |  |  |
| flashcard | c-ne-s-2 |  |  |
| corpus-biz | bk-e-1 | 67, 59, 63, 65 | absolute-distractor |
| corpus-biz | bk-e-2 | 10, 9, 12, 13 |  |
| corpus-biz | bk-e-3 |  |  |
| corpus-biz | bk-e-4 | 57, 60, 64, 60 |  |
| corpus-biz | bk-e-5 | 38, 37, 37, 34 |  |
| corpus-biz | bk-e-6 | 56, 72, 52, 58 | longest |
| corpus-biz | bk-s-1 | 72, 63, 66, 62 |  |
| corpus-biz | bk-s-2 | 14, 10, 11, 8 | longest |
| corpus-biz | bk-s-3 | 28, 31, 34, 32 |  |
| corpus-biz | bk-s-4 |  |  |
| corpus-biz | bk-s-5 | 104, 104, 104, 96 | longest-tie |
| corpus-biz | bk-s-6 |  |  |
| corpus-biz | bk-s-7 | 71, 66, 61, 63 |  |
| corpus-biz | bm-r-1 | 32, 45, 67, 70 | longest |
| corpus-biz | bm-r-2 | 17, 7, 5, 6 |  |
| corpus-biz | bm-r-3 |  |  |
| corpus-biz | bm-r-4 |  |  |
| corpus-biz | bm-r-5 | 67, 76, 70, 68 | longest |
| corpus-biz | bm-r-6 | 69, 61, 52, 51 | longest |
| corpus-biz | bm-r-7 |  |  |
| corpus-biz | bm-p-1 | 41, 51, 52, 51 |  |
| corpus-biz | bm-p-2 | 27, 22, 35, 45 |  |
| corpus-biz | bm-p-3 | 30, 20, 30, 19 |  |
| corpus-biz | bm-p-4 |  |  |
| corpus-biz | bm-p-5 |  |  |
| corpus-biz | bm-p-6 | 45, 50, 59, 60 |  |
| corpus-biz | bm-p-7 | 50, 39, 47, 49 |  |
| corpus-biz | bm-c-1 | 8, 18, 8, 28 |  |
| corpus-biz | bm-c-2 | 34, 21, 39, 25 | longest |
| corpus-biz | bm-c-3 |  |  |
| corpus-biz | bm-c-4 |  |  |
| corpus-biz | bm-c-5 | 58, 54, 52, 49 | longest |
| corpus-biz | bm-c-6 |  |  |
| corpus-biz | bm-c-7 | 39, 46, 47, 33 | longest |
| corpus-biz | bm-s-1 | 21, 7, 27, 8 |  |
| corpus-biz | bm-s-2 |  |  |
| corpus-biz | bm-s-3 | 22, 28, 9, 8 |  |
| corpus-biz | bm-s-4 | 53, 44, 52, 46 |  |
| corpus-biz | bm-s-5 | 25, 28, 42, 22 |  |
| corpus-biz | bm-s-6 | 46, 52, 42, 51 |  |
| corpus-biz | bm-s-7 | 71, 70, 70, 65 | absolute-distractor |
| corpus-biz | bg-k-1 | 61, 36, 78, 45 | longest |
| corpus-biz | bg-k-2 |  |  |
| corpus-biz | bg-k-3 | 54, 63, 51, 41 | longest, absolute-distractor |
| corpus-biz | bg-k-4 | 20, 9, 10, 7 |  |
| corpus-biz | bg-k-5 |  |  |
| corpus-biz | bg-k-6 |  |  |
| corpus-biz | bg-k-7 |  |  |
| corpus-biz | bg-b-1 | 53, 46, 47, 47 |  |
| corpus-biz | bg-b-2 | 14, 29, 32, 24 | longest |
| corpus-biz | bg-b-3 |  |  |
| corpus-biz | bg-b-4 |  |  |
| corpus-biz | bg-b-5 | 25, 24, 20, 23 |  |
| corpus-biz | bg-b-6 | 57, 72, 55, 57 | longest |
| corpus-biz | bg-b-7 |  |  |
| corpus-biz | bg-f-1 | 25, 27, 24, 17 |  |
| corpus-biz | bg-f-2 | 36, 33, 36, 36 | longest-tie |
| corpus-biz | bg-f-3 | 38, 43, 47, 48 |  |
| corpus-biz | bg-f-4 |  |  |
| corpus-biz | bg-f-5 |  |  |
| corpus-biz | bg-f-6 | 48, 51, 48, 44 |  |
| corpus-biz | bg-f-7 | 62, 49, 50, 50 | longest |
| corpus-biz | bg-f-8 |  |  |
| corpus-biz | bg-g-1 | 28, 39, 40, 30 |  |
| corpus-biz | bg-g-2 |  |  |
| corpus-biz | bg-g-3 | 34, 34, 45, 41 | longest |
| corpus-biz | bg-g-4 |  |  |
| corpus-biz | bg-g-5 | 55, 57, 49, 60 |  |
| corpus-biz | bg-g-6 | 41, 44, 45, 38 |  |
| corpus-biz | bg-g-7 | 44, 53, 44, 49 | longest |
| corpus-biz | bg-g-8 | 38, 46, 45, 53 | longest |
| corpus-biz | bf-m-1 | 30, 19, 37, 17 |  |
| corpus-biz | bf-m-2 | 27, 29, 27, 20 |  |
| corpus-biz | bf-m-3 |  |  |
| corpus-biz | bf-m-4 | 49, 32, 31, 37 | longest |
| corpus-biz | bf-m-5 | 16, 24, 28, 42 |  |
| corpus-biz | bf-m-6 | 34, 51, 44, 67 | longest |
| corpus-biz | bf-m-7 | 34, 48, 61, 66 | longest |
| corpus-biz | bf-h-1 |  |  |
| corpus-biz | bf-h-2 | 41, 46, 51, 36 |  |
| corpus-biz | bf-h-3 | 59, 33, 45, 29 | longest |
| corpus-biz | bf-h-4 |  |  |
| corpus-biz | bf-h-5 | 52, 50, 45, 53 | absolute-distractor |
| corpus-biz | bf-h-6 | 74, 54, 68, 57 | longest |
| corpus-biz | bf-b-1 | 24, 23, 22, 4 |  |
| corpus-biz | bf-b-2 |  |  |
| corpus-biz | bf-b-3 |  |  |
| corpus-biz | bf-b-4 | 65, 53, 64, 56 | longest |
| corpus-biz | bf-b-5 | 39, 47, 23, 28 | longest |
| corpus-biz | bf-b-6 |  |  |
| corpus-biz | bf-b-7 | 46, 66, 40, 48 |  |
| corpus-biz | bf-c-1 | 38, 63, 48, 52 | longest, absolute-distractor |
| corpus-biz | bf-c-2 |  |  |
| corpus-biz | bf-c-3 |  |  |
| corpus-biz | bf-c-4 |  |  |
| corpus-biz | bf-c-5 | 69, 69, 69, 69 | longest-tie |
| corpus-biz | bf-c-6 |  |  |
| corpus-biz | bf-i-1 | 58, 58, 50, 59 |  |
| corpus-biz | bf-i-2 |  |  |
| corpus-biz | bf-i-3 | 44, 81, 54, 84 | absolute-distractor |
| corpus-biz | bf-i-4 | 40, 37, 46, 43 | longest |
| corpus-biz | bf-i-5 | 51, 46, 42, 63 |  |
| corpus-biz | bf-i-6 | 45, 47, 33, 51 |  |
| corpus-biz | bf-i-7 | 48, 30, 41, 33 | longest |
| corpus-biz | bf-u-1 | 21, 24, 14, 10 |  |
| corpus-biz | bf-u-2 | 34, 9, 25, 24 |  |
| corpus-biz | bf-u-3 |  |  |
| corpus-biz | bf-u-4 |  |  |
| corpus-biz | bf-u-5 | 41, 41, 49, 46 | longest |
| corpus-biz | bf-u-6 | 52, 52, 56, 47 | longest |
| corpus-biz | bf-k-1 |  |  |
| corpus-biz | bf-k-2 | 18, 20, 25, 29 |  |
| corpus-biz | bf-k-3 | 44, 58, 42, 52 | longest |
| corpus-biz | bf-k-4 |  |  |
| corpus-biz | bf-k-5 | 21, 11, 24, 23 |  |
| corpus-biz | bf-k-6 | 18, 18, 26, 35 | longest |
| corpus-biz | bw-m-1 | 42, 50, 56, 43 | longest |
| corpus-biz | bw-m-2 |  |  |
| corpus-biz | bw-m-3 |  |  |
| corpus-biz | bw-m-4 |  |  |
| corpus-biz | bw-m-5 | 9, 14, 8, 12 |  |
| corpus-biz | bw-m-6 | 27, 54, 27, 54 | longest-tie |
| corpus-biz | bw-m-7 |  |  |
| corpus-biz | bw-c-1 | 60, 56, 56, 55 |  |
| corpus-biz | bw-c-2 | 2, 13, 16, 16 | longest-tie |
| corpus-biz | bw-c-3 | 28, 51, 51, 25 | longest-tie |
| corpus-biz | bw-c-4 |  |  |
| corpus-biz | bw-c-5 | 41, 77, 80, 42 | longest, absolute-distractor |
| corpus-biz | bw-c-6 | 63, 62, 71, 64 |  |
| corpus-biz | bw-f-1 | 14, 24, 14, 13 |  |
| corpus-biz | bw-f-2 | 14, 34, 21, 40 |  |
| corpus-biz | bw-f-3 |  |  |
| corpus-biz | bw-f-4 |  |  |
| corpus-biz | bw-f-5 | 58, 59, 61, 56 |  |
| corpus-biz | bw-f-6 | 59, 65, 38, 58 | longest |
| corpus-biz | bw-f-7 | 56, 48, 49, 53 |  |
| corpus-biz | bw-w-1 |  |  |
| corpus-biz | bw-w-2 |  |  |
| corpus-biz | bw-w-3 |  |  |
| corpus-biz | bw-w-4 |  |  |
| corpus-biz | bw-w-5 |  |  |
| corpus-biz | bw-w-6 |  |  |
| corpus-biz | bw-w-7 | 29, 24, 42, 3 |  |
| corpus-biz | bw-e-1 | 56, 54, 60, 58 |  |
| corpus-biz | bw-e-2 | 44, 36, 42, 56 | longest |
| corpus-biz | bw-e-3 | 53, 45, 61, 57 |  |
| corpus-biz | bw-e-4 |  |  |
| corpus-biz | bw-e-5 | 47, 49, 47, 50 | absolute-distractor |
| corpus-biz | bw-e-6 | 56, 62, 48, 57 | longest |
| corpus-biz | bp-t-1 | 51, 59, 13, 30 | absolute-distractor |
| corpus-biz | bp-t-2 | 5, 6, 6, 8 |  |
| corpus-biz | bp-t-3 | 39, 12, 14, 14 | longest |
| corpus-biz | bp-t-4 |  |  |
| corpus-biz | bp-t-5 | 34, 79, 54, 64 | longest |
| corpus-biz | bp-t-6 | 55, 61, 48, 50 |  |
| corpus-biz | bp-m-1 | 57, 51, 63, 54 | longest |
| corpus-biz | bp-m-2 | 25, 19, 17, 18 |  |
| corpus-biz | bp-m-3 | 21, 19, 18, 17 |  |
| corpus-biz | bp-m-4 | 57, 53, 54, 58 | longest |
| corpus-biz | bp-m-5 |  |  |
| corpus-biz | bp-m-6 | 34, 42, 39, 38 |  |
| corpus-biz | bp-m-7 | 46, 43, 27, 31 |  |
| corpus-biz | bp-s-1 | 25, 19, 21, 20 |  |
| corpus-biz | bp-s-2 | 10, 12, 6, 12 |  |
| corpus-biz | bp-s-3 | 54, 52, 50, 59 | longest |
| corpus-biz | bp-s-4 | 13, 41, 13, 6 |  |
| corpus-biz | bp-s-5 | 44, 69, 42, 52 | longest |
| corpus-biz | bp-s-6 | 45, 54, 45, 42 | longest |
| corpus-biz | bp-r-1 | 15, 26, 19, 22 |  |
| corpus-biz | bp-r-2 |  |  |
| corpus-biz | bp-r-3 |  |  |
| corpus-biz | bp-r-4 |  |  |
| corpus-biz | bp-r-5 |  |  |
| corpus-biz | bp-r-6 |  |  |
| corpus-biz | bp-r-7 |  |  |
| corpus-biz | bp-f-1 | 25, 24, 14, 24 |  |
| corpus-biz | bp-f-2 | 14, 15, 7, 13 | longest |
| corpus-biz | bp-f-3 | 54, 39, 48, 49 | longest |
| corpus-biz | bp-f-4 |  |  |
| corpus-biz | bp-f-5 | 20, 15, 17, 18 | longest |
| corpus-biz | bp-f-6 | 69, 79, 60, 59 | longest |
| corpus-biz | bz-f-1 | 41, 54, 40, 53 | longest |
| corpus-biz | bz-f-2 | 11, 13, 13, 8 |  |
| corpus-biz | bz-f-3 |  |  |
| corpus-biz | bz-f-4 | 9, 13, 14, 8 |  |
| corpus-biz | bz-f-5 | 72, 60, 37, 40 | longest |
| corpus-biz | bz-f-6 |  |  |
| corpus-biz | bz-f-7 | 58, 40, 48, 45 | longest |
| corpus-biz | bz-h-1 | 10, 31, 10, 17 |  |
| corpus-biz | bz-h-2 | 38, 48, 34, 34 | longest |
| corpus-biz | bz-h-3 | 36, 45, 39, 39 | longest |
| corpus-biz | bz-h-4 | 45, 47, 54, 64 | longest, absolute-distractor |
| corpus-biz | bz-h-5 | 16, 23, 23, 23 | longest-tie |
| corpus-biz | bz-h-6 | 43, 40, 48, 46 |  |
| corpus-biz | bz-o-1 | 31, 35, 46, 33 | longest |
| corpus-biz | bz-o-2 |  |  |
| corpus-biz | bz-o-3 | 26, 28, 26, 29 |  |
| corpus-biz | bz-o-4 | 11, 7, 7, 12 |  |
| corpus-biz | bz-o-5 |  |  |
| corpus-biz | bz-o-6 | 38, 51, 60, 81 | longest |
| corpus-biz | bz-o-7 | 52, 50, 64, 55 |  |
| corpus-biz | bz-c-1 | 68, 37, 44, 61 | longest |
| corpus-biz | bz-c-2 |  |  |
| corpus-biz | bz-c-3 | 34, 49, 32, 41 |  |
| corpus-biz | bz-c-4 | 45, 41, 40, 37 | longest |
| corpus-biz | bz-c-5 | 37, 58, 52, 60 |  |
| corpus-biz | bz-c-6 | 50, 60, 52, 42 | longest |
| corpus-biz | bj-b-1 | 47, 44, 49, 52 |  |
| corpus-biz | bj-b-2 | 47, 47, 47, 47 | longest-tie |
| corpus-biz | bj-b-3 | 43, 54, 40, 15 |  |
| corpus-biz | bj-b-4 | 37, 58, 38, 55 |  |
| corpus-biz | bj-b-5 |  |  |
| corpus-biz | bj-b-6 | 41, 48, 33, 47 | longest |
| corpus-biz | bj-b-7 | 53, 49, 53, 47 | absolute-distractor |
| corpus-biz | bj-p-1 | 52, 46, 41, 50 | longest |
| corpus-biz | bj-p-2 |  |  |
| corpus-biz | bj-p-3 |  |  |
| corpus-biz | bj-p-4 |  |  |
| corpus-biz | bj-p-5 | 41, 42, 39, 41 |  |
| corpus-biz | bj-p-6 | 41, 55, 47, 49 |  |
| corpus-biz | bj-p-7 | 40, 39, 53, 37 | longest |
| corpus-biz | bj-t-1 | 47, 50, 54, 27 | longest, absolute-distractor |
| corpus-biz | bj-t-2 | 38, 45, 32, 40 | longest |
| corpus-biz | bj-t-3 | 49, 55, 50, 50 | longest |
| corpus-biz | bj-t-4 |  |  |
| corpus-biz | bj-t-5 | 31, 44, 30, 27 | absolute-distractor |
| corpus-biz | bj-t-6 | 48, 58, 65, 52 | longest, absolute-distractor |
| flashcard | c-bk-e-1 |  |  |
| flashcard | c-bk-e-2 |  |  |
| flashcard | c-bk-s-1 |  |  |
| flashcard | c-bk-s-2 |  |  |
| flashcard | c-bm-r-1 |  |  |
| flashcard | c-bm-r-2 |  |  |
| flashcard | c-bm-p-1 |  |  |
| flashcard | c-bm-p-2 |  |  |
| flashcard | c-bm-c-1 |  |  |
| flashcard | c-bm-c-2 |  |  |
| flashcard | c-bm-s-1 |  |  |
| flashcard | c-bm-s-2 |  |  |
| flashcard | c-bg-k-1 |  |  |
| flashcard | c-bg-k-2 |  |  |
| flashcard | c-bg-b-1 |  |  |
| flashcard | c-bg-b-2 |  |  |
| flashcard | c-bg-f-1 |  |  |
| flashcard | c-bg-f-2 |  |  |
| flashcard | c-bg-g-1 |  |  |
| flashcard | c-bg-g-2 |  |  |
| flashcard | c-bf-m-1 |  |  |
| flashcard | c-bf-m-2 |  |  |
| flashcard | c-bf-h-1 |  |  |
| flashcard | c-bf-h-2 |  |  |
| flashcard | c-bf-b-1 |  |  |
| flashcard | c-bf-b-2 |  |  |
| flashcard | c-bf-c-1 |  |  |
| flashcard | c-bf-c-2 |  |  |
| flashcard | c-bf-i-1 |  |  |
| flashcard | c-bf-i-2 |  |  |
| flashcard | c-bf-u-1 |  |  |
| flashcard | c-bf-u-2 |  |  |
| flashcard | c-bf-k-1 |  |  |
| flashcard | c-bf-k-2 |  |  |
| flashcard | c-bw-m-1 |  |  |
| flashcard | c-bw-m-2 |  |  |
| flashcard | c-bw-c-1 |  |  |
| flashcard | c-bw-c-2 |  |  |
| flashcard | c-bw-f-1 |  |  |
| flashcard | c-bw-f-2 |  |  |
| flashcard | c-bw-w-1 |  |  |
| flashcard | c-bw-w-2 |  |  |
| flashcard | c-bw-e-1 |  |  |
| flashcard | c-bw-e-2 |  |  |
| flashcard | c-bp-t-1 |  |  |
| flashcard | c-bp-t-2 |  |  |
| flashcard | c-bp-m-1 |  |  |
| flashcard | c-bp-m-2 |  |  |
| flashcard | c-bp-s-1 |  |  |
| flashcard | c-bp-s-2 |  |  |
| flashcard | c-bp-r-1 |  |  |
| flashcard | c-bp-r-2 |  |  |
| flashcard | c-bp-f-1 |  |  |
| flashcard | c-bp-f-2 |  |  |
| flashcard | c-bz-f-1 |  |  |
| flashcard | c-bz-f-2 |  |  |
| flashcard | c-bz-h-1 |  |  |
| flashcard | c-bz-h-2 |  |  |
| flashcard | c-bz-o-1 |  |  |
| flashcard | c-bz-o-2 |  |  |
| flashcard | c-bz-c-1 |  |  |
| flashcard | c-bz-c-2 |  |  |
| flashcard | c-bj-b-1 |  |  |
| flashcard | c-bj-b-2 |  |  |
| flashcard | c-bj-p-1 |  |  |
| flashcard | c-bj-p-2 |  |  |
| flashcard | c-bj-t-1 |  |  |
| flashcard | c-bj-t-2 |  |  |
| feed | m1-polecenie | 21, 19, 37 |  |
| feed | m1-kolejnosc |  |  |
| feed | m1-kolejnosc-l | 14, 13, 32 | answer-in-stem |
| feed | m1-potega | 3, 2, 4, 1 |  |
| feed | m1-potega-l | 17, 20, 5 |  |
| feed | m1-blad | 7, 6, 8 |  |
| feed | m1-nawias | 3, 1, 1, 3 | longest-tie |
| feed | m1-odwrotnosc | 3, 4, 3, 4 |  |
| feed | m1-kwadrat | 4, 4, 5, 3 |  |
| feed | m1-sprawdz | 10, 12, 8 |  |
| feed | m1-zadanie | 4, 4, 5, 4 |  |
| feed | m1-p1 | 9, 21, 15 |  |
| feed | m1-p2 | 3, 4, 3, 1 |  |
| feed | m1-p3 | 1, 1, 1, 1 | longest-tie |
| feed | m2-polecenie | 35, 28, 41 |  |
| feed | m2-dane | 1, 1, 1, 1 | longest-tie |
| feed | m2-dane2 | 1, 1, 1, 1 | longest-tie |
| feed | m2-ujemna | 3, 2, 3, 4 |  |
| feed | m2-ujemna-l | 2, 1, 1, 2 | longest-tie |
| feed | m2-blad | 14, 6, 3 |  |
| feed | m2-f1 | 3, 1, 2, 3 | longest-tie |
| feed | m2-f2 | 2, 2, 2, 2 | longest-tie |
| feed | m2-f3 | 2, 5, 2, 3 |  |
| feed | m2-sprawdz | 11, 16, 10 |  |
| feed | m2-zadanie | 3, 3, 3, 2 | longest-tie |
| feed | m2-p1 | 1, 1, 2, 3 |  |
| feed | m2-p2 | 2, 2, 3, 3 |  |
| feed | m2-p3 |  |  |
| feed | c1-polecenie | 36, 43, 39 |  |
| feed | c1-zasada | 16, 15, 19 |  |
| feed | c1-kod1 | 7, 9, 9, 7 |  |
| feed | c1-kod1-l | 1, 1, 5 |  |
| feed | c1-blad | 10, 10, 10 | longest-tie |
| feed | c1-kolejnosc |  |  |
| feed | c1-kod2 | 5, 5, 5, 5 | longest-tie |
| feed | c1-kod2-l | 7, 9, 7, 7 |  |
| feed | c1-slad | 3, 1, 3, 1 | longest-tie |
| feed | c1-slad-l | 1, 1, 1, 2 |  |
| feed | c1-sprawdz | 25, 22, 34 |  |
| feed | c1-zadanie |  |  |
| feed | c1-p1 | 13, 14, 12, 14 |  |
| feed | c1-p2 | 6, 6, 5, 6 | longest-tie |
| feed | c2-polecenie | 5, 5, 5 | longest-tie |
| feed | c2-dane | 1, 1, 1, 1 | longest-tie |
| feed | c2-dane-l | 1, 1, 1 | longest-tie |
| feed | c2-kod1 | 10, 9, 11, 10 |  |
| feed | c2-warunek | 21, 21, 20 | longest-tie |
| feed | c2-kod2 | 4, 5 |  |
| feed | c2-blad | 15, 11, 11 |  |
| feed | c2-kod3 | 3, 3, 3, 3 | longest-tie |
| feed | c2-kod3-l | 3, 3, 3, 12 |  |
| feed | c2-sprawdz | 45, 39, 43 | longest |
| feed | c2-zadanie |  |  |
| feed | c2-p1 | 11, 8 | longest |
| feed | c2-p2 | 1, 1, 2, 1 |  |
| feed | b1-polecenie | 35, 35, 41 |  |
| feed | b1-dane | 41, 52, 28 |  |
| feed | b1-dane-l | 19, 24, 14 |  |
| feed | b1-zasada | 6, 11, 8 |  |
| feed | b1-decyzja | 32, 29, 36 |  |
| feed | b1-blad | 15, 45 | longest |
| feed | b1-zadanie |  |  |
| feed | b1-pomoc | 9, 10, 12 |  |
| feed | b1-p1 | 21, 25, 24 |  |
| feed | b1-p2 |  |  |
| feed | b2-polecenie | 46, 43, 42 | longest |
| feed | b2-dane | 29, 29, 33 |  |
| feed | b2-zasada | 59, 59, 59 | longest-tie |
| feed | b2-zasada-l | 52, 52, 51 | longest-tie |
| feed | b2-zasada2 | 47, 42, 46 | longest |
| feed | b2-decyzja | 44, 44, 45 |  |
| feed | b2-blad | 80, 51 |  |
| feed | b2-zadanie |  |  |
| feed | b2-pomoc | 26, 30, 30 |  |
| feed | b2-p1 | 52, 52, 52 | longest-tie |
| feed | b2-p2 |  |  |
| cke-source | mat-2209-pp-1 | 4, 4, 5, 4 |  |
| cke-source | mat-2605-pp-1 | 1, 1, 1, 1 | longest-tie |
| cke-source | mat-2405-pp-2 | 3, 3, 3, 2 | longest-tie |
| cke-source | mat-2505-pp-2 | 2, 2, 3, 3 |  |
| cke-source | mat-2605-pp-5 |  |  |
| cke-source | inf-2405-2.1 |  |  |
| cke-source | inf-2505-1.1 |  |  |
| cke-source | inf-inf-3.1 |  |  |
| cke-source | biz-2604-1 |  |  |
| cke-source | biz-2604-1.2 |  |  |
| cke-source | biz-2604-5 |  |  |
| cke-source | biz-2604-2 |  |  |
| deep-task | deep-quad-param-1 |  |  |
| deep-step | dp1 | 3, 3, 3, 3 | longest-tie |
| deep-step | dp2 | 6, 3, 4, 3 | longest |
| deep-step | dp3 | 36, 51, 26, 26 |  |
| deep-step | dp4 |  |  |
| deep-step | dp5 | 16, 8, 8, 18 |  |
| deep-step | dp6 |  |  |
| deep-step | dp7 |  |  |
| deep-step | dp8 | 8, 16, 8, 8 |  |
| deep-step | dp9 | 9, 13, 8, 16 |  |
| deep-step | dp10 |  |  |
| blocks | klocki-delta-1 |  |  |
| micro | mk-wzor-delta | 8, 7, 10, 7 |  |
| micro | mk-nastepny-viete | 36, 14, 33 | longest |
| micro | mk-uzupelnij-kwadraty | 5, 4, 8, 7 |  |
| micro | mk-blad-viete | 10, 8, 8 |  |
| micro | mk-wykres-kanoniczna | 1, 1, 1, 1 | longest-tie |
| micro | mk-legalne | 7, 7, 6 | longest-tie |
| speed | sp-delta-zero | 6, 5 |  |
| speed | sp-delta-licz |  |  |
| speed | sp-zera-iloczyn | 6, 6, 5 | longest-tie |
| speed | sp-kwadraty | 6, 5 | longest |
| speed | sp-wykres-ujemna-delta | 1, 1, 1 | longest-tie |
| speed | sp-nastepny-nierownosc | 7, 11, 7 |  |
| speed | sp-ramiona-w-dol | 6, 5 | longest |
| speed | sp-suma-viete |  |  |
| speed | sp-wierzcholek | 5, 4, 5 | longest-tie |
| speed | sp-log | 6, 5 |  |
| speed | sp-potega | 6, 5 |  |

## Katalog metadanych arkuszy CKE

Poniższe rekordy zawierają numer, punkty i wymagania, a nie pełną treść pytania. Zostały zinwentaryzowane, ale nie poddane pozornej ocenie języka ani dystraktorów.

- **mat-2605-pr**: mat-2605-pr/1, mat-2605-pr/2, mat-2605-pr/3, mat-2605-pr/4, mat-2605-pr/5, mat-2605-pr/6, mat-2605-pr/7, mat-2605-pr/8, mat-2605-pr/9, mat-2605-pr/10, mat-2605-pr/11, mat-2605-pr/12.1, mat-2605-pr/12.2
- **mat-2605-pp**: mat-2605-pp/1, mat-2605-pp/2, mat-2605-pp/3, mat-2605-pp/4, mat-2605-pp/5, mat-2605-pp/6, mat-2605-pp/7, mat-2605-pp/8, mat-2605-pp/9, mat-2605-pp/10, mat-2605-pp/11, mat-2605-pp/12.1, mat-2605-pp/12.2, mat-2605-pp/13.1, mat-2605-pp/13.2, mat-2605-pp/14, mat-2605-pp/15, mat-2605-pp/16, mat-2605-pp/17, mat-2605-pp/18, mat-2605-pp/19, mat-2605-pp/20, mat-2605-pp/21, mat-2605-pp/22, mat-2605-pp/23, mat-2605-pp/24.1, mat-2605-pp/24.2, mat-2605-pp/25, mat-2605-pp/26, mat-2605-pp/27, mat-2605-pp/28, mat-2605-pp/29, mat-2605-pp/30, mat-2605-pp/31, mat-2605-pp/32, mat-2605-pp/33.1, mat-2605-pp/33.2
- **mat-2601-pp**: mat-2601-pp/1, mat-2601-pp/2, mat-2601-pp/3, mat-2601-pp/4, mat-2601-pp/5, mat-2601-pp/6, mat-2601-pp/7, mat-2601-pp/8, mat-2601-pp/9, mat-2601-pp/10, mat-2601-pp/11.1, mat-2601-pp/11.2, mat-2601-pp/11.3, mat-2601-pp/12, mat-2601-pp/13, mat-2601-pp/14, mat-2601-pp/15, mat-2601-pp/16, mat-2601-pp/17, mat-2601-pp/18, mat-2601-pp/19, mat-2601-pp/20, mat-2601-pp/21, mat-2601-pp/22, mat-2601-pp/23, mat-2601-pp/24, mat-2601-pp/25, mat-2601-pp/26, mat-2601-pp/27, mat-2601-pp/28, mat-2601-pp/29, mat-2601-pp/30, mat-2601-pp/31, mat-2601-pp/32.1, mat-2601-pp/32.2
- **mat-2505-pr**: mat-2505-pr/1, mat-2505-pr/2, mat-2505-pr/3, mat-2505-pr/4, mat-2505-pr/5, mat-2505-pr/6, mat-2505-pr/7, mat-2505-pr/8, mat-2505-pr/9, mat-2505-pr/10, mat-2505-pr/11, mat-2505-pr/12.1, mat-2505-pr/12.2
- **mat-2505-pp**: mat-2505-pp/1, mat-2505-pp/2, mat-2505-pp/3, mat-2505-pp/4, mat-2505-pp/5, mat-2505-pp/6, mat-2505-pp/7, mat-2505-pp/8, mat-2505-pp/9, mat-2505-pp/10, mat-2505-pp/11, mat-2505-pp/12.1, mat-2505-pp/12.2, mat-2505-pp/12.3, mat-2505-pp/13, mat-2505-pp/14.1, mat-2505-pp/14.2, mat-2505-pp/15, mat-2505-pp/16, mat-2505-pp/17, mat-2505-pp/18.1, mat-2505-pp/18.2, mat-2505-pp/19, mat-2505-pp/20, mat-2505-pp/21, mat-2505-pp/22, mat-2505-pp/23, mat-2505-pp/24, mat-2505-pp/25, mat-2505-pp/26, mat-2505-pp/27, mat-2505-pp/28, mat-2505-pp/29, mat-2505-pp/30, mat-2505-pp/31
- **mat-2412-pr**: mat-2412-pr/1, mat-2412-pr/2, mat-2412-pr/3, mat-2412-pr/4, mat-2412-pr/5, mat-2412-pr/6, mat-2412-pr/7, mat-2412-pr/8, mat-2412-pr/9, mat-2412-pr/10, mat-2412-pr/11, mat-2412-pr/12, mat-2412-pr/13.1, mat-2412-pr/13.2
- **mat-2412-pp**: mat-2412-pp/1, mat-2412-pp/2, mat-2412-pp/3, mat-2412-pp/4, mat-2412-pp/5, mat-2412-pp/6, mat-2412-pp/7, mat-2412-pp/8, mat-2412-pp/9, mat-2412-pp/10, mat-2412-pp/11, mat-2412-pp/12.1, mat-2412-pp/12.2, mat-2412-pp/12.3, mat-2412-pp/13, mat-2412-pp/14, mat-2412-pp/15, mat-2412-pp/16, mat-2412-pp/17.1, mat-2412-pp/17.2, mat-2412-pp/18, mat-2412-pp/19, mat-2412-pp/20, mat-2412-pp/21, mat-2412-pp/22, mat-2412-pp/23, mat-2412-pp/24, mat-2412-pp/25, mat-2412-pp/26, mat-2412-pp/27, mat-2412-pp/28, mat-2412-pp/29, mat-2412-pp/30
- **mat-2405-pr**: mat-2405-pr/1, mat-2405-pr/2, mat-2405-pr/3, mat-2405-pr/4, mat-2405-pr/5, mat-2405-pr/6, mat-2405-pr/7, mat-2405-pr/8, mat-2405-pr/9, mat-2405-pr/10, mat-2405-pr/11, mat-2405-pr/12, mat-2405-pr/13.1, mat-2405-pr/13.2
- **mat-2405-pp**: mat-2405-pp/1, mat-2405-pp/2, mat-2405-pp/3, mat-2405-pp/4, mat-2405-pp/5, mat-2405-pp/6, mat-2405-pp/7, mat-2405-pp/8, mat-2405-pp/9, mat-2405-pp/10, mat-2405-pp/11, mat-2405-pp/12, mat-2405-pp/13, mat-2405-pp/14.1, mat-2405-pp/14.2, mat-2405-pp/14.3, mat-2405-pp/14.4, mat-2405-pp/15, mat-2405-pp/16, mat-2405-pp/17, mat-2405-pp/18, mat-2405-pp/19, mat-2405-pp/20, mat-2405-pp/21, mat-2405-pp/22, mat-2405-pp/23, mat-2405-pp/24, mat-2405-pp/25.1, mat-2405-pp/25.2, mat-2405-pp/26, mat-2405-pp/27, mat-2405-pp/28, mat-2405-pp/29, mat-2405-pp/30, mat-2405-pp/31
- **mat-2312-pp**: mat-2312-pp/1, mat-2312-pp/2, mat-2312-pp/3, mat-2312-pp/4, mat-2312-pp/5, mat-2312-pp/6, mat-2312-pp/7, mat-2312-pp/8, mat-2312-pp/9, mat-2312-pp/10, mat-2312-pp/11.1, mat-2312-pp/11.2, mat-2312-pp/11.3, mat-2312-pp/11.4, mat-2312-pp/12, mat-2312-pp/13, mat-2312-pp/14, mat-2312-pp/15, mat-2312-pp/16, mat-2312-pp/17, mat-2312-pp/18, mat-2312-pp/19, mat-2312-pp/20, mat-2312-pp/21, mat-2312-pp/22, mat-2312-pp/23, mat-2312-pp/24, mat-2312-pp/25, mat-2312-pp/26, mat-2312-pp/27, mat-2312-pp/28, mat-2312-pp/29.1, mat-2312-pp/29.2, mat-2312-pp/30
- **mat-2305-pr**: mat-2305-pr/1, mat-2305-pr/2, mat-2305-pr/3, mat-2305-pr/4, mat-2305-pr/5, mat-2305-pr/6, mat-2305-pr/7, mat-2305-pr/8, mat-2305-pr/9, mat-2305-pr/10, mat-2305-pr/11, mat-2305-pr/12.1, mat-2305-pr/12.2, mat-2305-pr/13
- **mat-2305-pp**: mat-2305-pp/1, mat-2305-pp/2, mat-2305-pp/3, mat-2305-pp/4, mat-2305-pp/5, mat-2305-pp/6, mat-2305-pp/7, mat-2305-pp/8, mat-2305-pp/9, mat-2305-pp/10, mat-2305-pp/11, mat-2305-pp/12.1, mat-2305-pp/12.2, mat-2305-pp/12.3, mat-2305-pp/13, mat-2305-pp/14, mat-2305-pp/15, mat-2305-pp/16, mat-2305-pp/17, mat-2305-pp/18, mat-2305-pp/19, mat-2305-pp/20, mat-2305-pp/21, mat-2305-pp/22, mat-2305-pp/23, mat-2305-pp/24, mat-2305-pp/25, mat-2305-pp/26, mat-2305-pp/27, mat-2305-pp/28, mat-2305-pp/29, mat-2305-pp/30, mat-2305-pp/31.1, mat-2305-pp/31.2
- **mat-2209-pp**: mat-2209-pp/1, mat-2209-pp/2, mat-2209-pp/3, mat-2209-pp/4, mat-2209-pp/5, mat-2209-pp/6, mat-2209-pp/7, mat-2209-pp/8, mat-2209-pp/9, mat-2209-pp/10.1, mat-2209-pp/10.2, mat-2209-pp/11, mat-2209-pp/12.1, mat-2209-pp/12.2, mat-2209-pp/13.1, mat-2209-pp/13.2, mat-2209-pp/14.1, mat-2209-pp/14.2, mat-2209-pp/15, mat-2209-pp/16.1, mat-2209-pp/16.2, mat-2209-pp/16.3, mat-2209-pp/17, mat-2209-pp/18, mat-2209-pp/19, mat-2209-pp/20, mat-2209-pp/21, mat-2209-pp/22, mat-2209-pp/23, mat-2209-pp/24.1, mat-2209-pp/24.2, mat-2209-pp/24.3, mat-2209-pp/25, mat-2209-pp/26
- **inf-2605-PR**: inf-2605-PR/1.1, inf-2605-PR/1.2, inf-2605-PR/1.3, inf-2605-PR/2.1, inf-2605-PR/2.2, inf-2605-PR/3.1, inf-2605-PR/3.2, inf-2605-PR/3.3, inf-2605-PR/4.1, inf-2605-PR/4.2, inf-2605-PR/4.3, inf-2605-PR/4.4, inf-2605-PR/5, inf-2605-PR/6, inf-2605-PR/7.1, inf-2605-PR/7.2, inf-2605-PR/7.3, inf-2605-PR/7.4, inf-2605-PR/8.1, inf-2605-PR/8.2, inf-2605-PR/8.3, inf-2605-PR/8.4, inf-2605-PR/8.5
- **inf-2505-PR**: inf-2505-PR/1.1, inf-2505-PR/1.2, inf-2505-PR/1.3, inf-2505-PR/2.1, inf-2505-PR/2.2, inf-2505-PR/2.3, inf-2505-PR/2.4, inf-2505-PR/3.1, inf-2505-PR/3.2, inf-2505-PR/4, inf-2505-PR/5, inf-2505-PR/6.1, inf-2505-PR/6.2, inf-2505-PR/6.3, inf-2505-PR/6.4, inf-2505-PR/6.5, inf-2505-PR/7.1, inf-2505-PR/7.2, inf-2505-PR/7.3, inf-2505-PR/7.4, inf-2505-PR/7.5
- **inf-2412-PR**: inf-2412-PR/1.1, inf-2412-PR/1.2, inf-2412-PR/2.1, inf-2412-PR/2.2, inf-2412-PR/3.1, inf-2412-PR/3.2, inf-2412-PR/3.3, inf-2412-PR/4.1, inf-2412-PR/4.2, inf-2412-PR/4.3, inf-2412-PR/5, inf-2412-PR/6, inf-2412-PR/7.1, inf-2412-PR/7.2, inf-2412-PR/7.3, inf-2412-PR/7.4, inf-2412-PR/8.1, inf-2412-PR/8.2, inf-2412-PR/8.3, inf-2412-PR/8.4, inf-2412-PR/8.5
- **inf-2405-PR**: inf-2405-PR/1.1, inf-2405-PR/1.2, inf-2405-PR/1.3, inf-2405-PR/2.1, inf-2405-PR/2.2, inf-2405-PR/3.1, inf-2405-PR/3.2, inf-2405-PR/3.3, inf-2405-PR/4.1, inf-2405-PR/4.2, inf-2405-PR/4.3, inf-2405-PR/4.4, inf-2405-PR/5, inf-2405-PR/6, inf-2405-PR/7.1, inf-2405-PR/7.2, inf-2405-PR/7.3, inf-2405-PR/7.4, inf-2405-PR/8.1, inf-2405-PR/8.2, inf-2405-PR/8.3, inf-2405-PR/8.4
- **inf-2305-PR**: inf-2305-PR/1.1, inf-2305-PR/1.2, inf-2305-PR/1.3, inf-2305-PR/2.1, inf-2305-PR/2.2, inf-2305-PR/2.3, inf-2305-PR/2.4, inf-2305-PR/2.5, inf-2305-PR/3.1, inf-2305-PR/3.2, inf-2305-PR/3.3, inf-2305-PR/3.4, inf-2305-PR/4, inf-2305-PR/5, inf-2305-PR/6.1, inf-2305-PR/6.2, inf-2305-PR/6.3, inf-2305-PR/6.4, inf-2305-PR/7.1, inf-2305-PR/7.2, inf-2305-PR/7.3, inf-2305-PR/7.4, inf-2305-PR/7.5

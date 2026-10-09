# Rachunki i wznawianie nauki

Przy zadaniach matematycznych Arena dostępne są brudnopis, kalkulator
i plan etapów. Zwykłe lekcje mają ten sam notatnik pod przyciskiem „Rachunki”,
a podział na kroki wynika z bieżącej karty kursu. Nie zmieniamy ukończonych lekcji, prób ani poziomów wiedzy.
Dotychczasowy selektor nadal dobiera trudność na podstawie dowodów opanowania.

- Brudnopis przyjmuje tekst i zapis algebraiczny. Kalkulator obsługuje działania,
  ułamki, procenty, nawiasy, potęgi, pierwiastki i pamięć pojedynczych zmiennych.
  Nie jest solverem równań. Funkcje trygonometryczne przyjmują radiany.
  Szkolny `log` oznacza podstawę 10, `ln` logarytm naturalny. Inną podstawę
  zapisuje się przez iloraz, np. `log(8)/log(2)`; niejednoznaczny przecinek
  w argumencie `log` wywołuje objaśnienie zamiast cichej zmiany znaczenia.
- Rachunki i notatki nie podnoszą poziomu pomocy. Odsłonięcie tematycznego planu
  oznacza pomoc strategiczną (poziom 1); nauczyciel — poziom 3, pełne rozwiązanie — 6.
- Plan jest dobrany do kompetencji. Trzy zadania zgłoszone na zrzutach mają także
  lokalne sprawdzanie wyników pośrednich. Pozostałe etapy są zapisem rozumowania
  ucznia; przycisk ich ukończenia nie udaje oceny poprawności.
- „Zamień słowa na znaki” lokalnie rozpoznaje proste polskie operatory i pokazuje
  podgląd. „Zapisz matematycznie” w panelu nauczyciela obsługuje swobodną wypowiedź
  przez AI, jeśli połączenie jest skonfigurowane. Nie wykonuje automatycznie wyniku.
- Aktywna misja zapisuje pytanie, odpowiedź, pewność, pomoc i ocenę w preferences.
  Oceniona próba po restarcie nie jest naliczana ponownie. Można zapisać i wyjść.
- Zwykła lekcja wznawia konkretną kartę, feedback, podpowiedź, częściową
  odpowiedź i kolejność elementów, a także kod Python. Przycisk na ekranie
  „Dziś” prowadzi do zapisanego przedmiotu, tematu i trybu. Zapis prezentacji
  jest przywracany tylko wtedy, gdy odpowiada zapisanym wynikom nauki.
- Brudnopis i obliczenia są osobne dla misji/zadania, z kopią w preferences
  (eksport JSON) oraz szybkim zapisem lokalnym. Notatki można pobrać jako TXT.
  Import i usuwanie danych czyszczą odpowiadające im lokalne kopie.
- Odczyt wykładu pamięta pozycję i odsłonięte przykłady na tym urządzeniu.
- Nauczyciel dostaje treść aktualnego zadania, zapis ucznia, historię rachunków
  i opisy typowych błędów. Notatki są oznaczone jako niesprawdzone. Wyjaśnia
  następny krok; wynik jest schowany, dopóki uczeń świadomie go nie odsłoni.
- Rozmowa pozostaje na tym urządzeniu po zamknięciu panelu i ponownym otwarciu.
  Odpowiedź odebrana w tle trafia do tej samej rozmowy bez powtórnego zapytania.
  Pomoc nalicza się po wyświetleniu odpowiedzi, a nie po kliknięciu wysyłania.
  Przepisanie własnej wypowiedzi na symbole nie jest pomocą w rozwiązaniu.
- Pomoc pozwala zaliczyć etap, ale nie dowodzi samodzielności ani nie przyspiesza
  automatycznie kursu. Kolejna samodzielna powtórka może podnieść opanowanie.
  Wcześniej uzyskane wyniki pozostają zachowane.

## Operacje i uproszczony ekran lekcji

Dwa główne zadania matematyczne CKE mają ciąg rzeczywistych przekształceń:
cztery operacje dla wyrażenia z ułamkiem i trzy dla iloczynu potęg.
Uczeń wybiera metodę; poprawny wybór natychmiast aktualizuje cały wzór i zapisuje
wykonany rachunek. Błędny wybór daje informację zwrotną bez zmiany wyrażenia.
Teoria jest opcjonalna. Ten tryb jest ćwiczeniem z prowadzeniem; samodzielność
sprawdzana jest później na odrębnym zadaniu, bez sztucznego podnoszenia wyniku.

Sześć istniejących lekcji korzysta z krótszych profili praktyki. Historyczne ID,
próby, ukończenia i harmonogramy powtórek pozostają zachowane. Migracja mapuje
przerwaną lekcję po ID karty; poprawnie obliczone wcześniej etapy nie wymagają
ponownego przechodzenia. Pozostałe zadania katalogu używają planów właściwych
dla kompetencji; nie mają automatycznie tej samej interakcji co te dwa zadania.

Na pasku widać procent i tylko aktualną fazę. Źródło jest pod ikoną arkusza.
Usunięto powtarzane objaśnienia, komunikaty o poprawnym zapisie i listę przyszłych
faz. Błędy zapisu i połączenia pozostają widoczne. Pobranie notatek, klawiatura
i instrukcja składni mają małe przyciski z dostępnymi nazwami. Klawiatura
matematyczna w rachunkach jest domyślnie zwinięta. Komputer pokazuje kalkulator
obok zadania, telefon w osobnym panelu; nie uruchamiamy dwóch edytorów tego
samego brudnopisu jednocześnie.

Opcja „Nauczyciel sprawdza moje kroki” wysyła zatwierdzony rachunek po Oblicz
lub Enter. Pisanie nie wysyła zapytań. Odpowiedź jest związana z konkretnym
rachunkiem i zachowywana po zamknięciu; ponowne otwarcie nie powtarza zapytania.
Nieoczekiwanie ujawniony dalszy wynik pozostaje schowany do świadomego wyboru.
Arytmetykę wykonuje lokalny kalkulator, a nauczyciel ocenia jej sens w zadaniu.

## Klucz Claude i zakres połączenia

Lokalny serwer Windows odczytuje klucz z PasswordVault (`FORGE.ClaudeTeacher`).
Formularz zapisuje go po stronie serwera; klucz nie trafia do repozytorium,
localStorage, eksportów nauki ani parametrów procesów. Po zapisie formularz
jest schowany i klucz jest ładowany automatycznie przy uruchomieniu serwera.
Potwierdzono odczyt w drugim, nowym procesie Vite bez ponownego wpisywania.

To połączenie dotyczy lokalnego serwera na tym komputerze. Statyczna publikacja
na telefonie potrzebuje skonfigurowanego, chronionego serwera nauczyciela.
Kod nie obiecuje działania klucza unieważnionego przez dostawcę ani dostępu
do modelu bez sieci. Kalkulator i zapisane podpowiedzi działają offline.

## Podstawa projektu

[CESE: Cognitive load theory in practice](https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators-/cognitive-load-theory-in-practice)
opisuje pracę z przykładami i stopniowe przechodzenie do samodzielnego rozwiązywania.
Zastosowanie w FORGE: zapisywane wyniki pośrednie, pojedynczy aktywny etap i
możliwość wyłączenia prowadzenia przy zachowaniu tego samego zadania.

Porównano repozytoria [Math.js](https://github.com/josdejong/mathjs) oraz
[MathLive](https://github.com/arnog/mathlive). Math.js dostarcza parser rachunków;
FORGE dodatkowo ogranicza typy węzłów, operatory, funkcje i długość wejścia zgodnie
z [zaleceniami bezpieczeństwa parsera](https://mathjs.org/docs/expressions/security.html).
Ładowanie następuje na żądanie, a gotowa wersja PWA przechowuje moduł offline.
Pozostawiono istniejącą klawiaturę aplikacji i zwykły tekst w brudnopisie, aby nie
wymagać znajomości LaTeX-u ani zastępować sprawdzonego pola odpowiedzi kolejnym edytorem.

## Weryfikacja

`calculator.test.ts` sprawdza arytmetykę, kolejność potęgowania, polskie operatory,
dziedzinę oraz odrzucanie wywołań i składni spoza dozwolonego zakresu.
`task-plan.test.ts` obejmuje cały katalog kompetencji i ochronę przed ujawnianiem
klucza odpowiedzi. `workspace.spec.ts` odtwarza trzy zadania ze zrzutów na telefonie
i komputerze, pracę offline, błąd znaku i powroty do rachunków.
`session-resume.spec.ts` sprawdza powrót do oceny bez ponownego naliczenia próby.
`feed-resume.spec.ts` oraz `course-workspace.spec.ts` obejmują zwykłe lekcje,
rachunki, zachowanie częściowej odpowiedzi i rozróżnienie transkrypcji od pomocy.

Regresje używają kontrolowanych odpowiedzi nauczyciela. Osobno wykonano testy
prawdziwego Claude Sonnet 5: `scripts/validate-teacher-live.ts` sprawdza błędny
znak w kwadracie, pojęcie miejsca zerowego, opłatę początkową, jednostki,
niejednoznaczne wypowiedzi, zapis algebraiczny, logarytmy, ciągi, dziedzinę
i nierówności wymierne. Pytania obejmują też odpowiedzi ucznia w kolejnych
turach i jawne żądanie pełnego rozwiązania. Przegląd doprowadził m.in. do
poprawy klasyfikacji błędu we wzorze na deltę, blokady importowania równania
do kalkulatora liczbowego i prawidłowego potwierdzania poprawnej odpowiedzi.

Wszystkie płatne walidacje współdzielą pojedynczy limit 3 USD w ignorowanym
dzienniku `.forge/teacher-validation-2026-10-08/budget.json`. Rezerwacja kosztu
następuje przed wywołaniem i pozostaje zablokowana przy nieznanym wyniku.
Rzeczywisty koszt jest rozliczany z tokenów zwróconych przez dostawcę.
Powtórne uruchomienie tego samego przypadku wykorzystuje zapisany wynik.
Opcjonalny test przeglądarkowy „prawdziwy Claude” używa tego samego budżetu.
Zestaw przypadków sprawdza konkretne zachowania; nie stanowi gwarancji
bezbłędności wszystkich przyszłych odpowiedzi modelu.

Weryfikacja wcześniejszej wersji z 8 października 2026: 857/857 testów jednostkowych, build
produkcyjny i dodatkowy typecheck tutora poprawne. Zestaw regresji przeglądarki:
39 zaliczonych, 3 celowo pominięte (dwa płatne warianty oraz duplikat testu
instalacji offline na telefonie). Następnie osobno włączony wariant z prawdziwym
Claude na telefonie: 1/1 zaliczony. W sumie 40 zaliczonych scenariuszy E2E.
Rzeczywista walidacja: 27 zapytań, 0,248328 USD, brak nierozliczonych rezerwacji.
Testy korzystały z odrębnych profili, bez resetowania danych użytkownika.


## Końcowa weryfikacja po uwagach o etapach i przeładowaniu ekranu

8 października 2026, końcowy stan: 890/890 testów jednostkowych w 68 plikach,
produkcyjny build i dodatkowy typecheck tutora poprawne. Łącznie zweryfikowano
64 odrębne scenariusze E2E na komputerze i telefonie (licząc udane rundy po
naprawach, nie sumując powtórnych uruchomień). Zakres: feed-resume, nauka,
jasnosc-kart, usability-details, demo-ui, demo-contrast, native-back,
teacher-connection, teacher-companion, workspace, course-workspace,
session-resume oraz claude-key-setup. Dwa duplikaty układu i dwa warianty
płatnego testu UI celowo pominięto w regresji.

Testy wykryły i doprowadziły do naprawy cofania z podsumowania serii, utraty
fokusu po wybranej operacji oraz gubienia kliknięcia kalkulatora przy zwijaniu
klawiatury. Klucz użytkownika i jego wyniki nie były resetowane; profile E2E
były odrębne. Nauczyciel na localhost:4186 zgłasza dostępność i zweryfikowane
połączenie z Claude Sonnet 5 po automatycznym restarcie konfiguracji.

Pięć nowych rzeczywistych prób nadzoru rachunków obejmowało ujemną potęgę,
błędną metodę w zadaniu o taksówce i wyznaczenie współczynnika funkcji.
Po doprecyzowaniu promptu poprawny rachunek dostaje samo potwierdzenie,
bez nieoznaczonej wskazówki następnego kroku. Łączny koszt całej dotychczasowej
walidacji i audytu katalogu: 1,807824 / 3 USD, bez nierozliczonych rezerwacji.
Dziennik zawiera 66 rozliczonych odpowiedzi i osobny wpis za 0 USD o odrzuceniu
lokalnego portu przed wysłaniem HTTP (oryginalna rezerwacja i dowód zachowane).
Nie zwalniano rezerwacji za nieznany wynik wywołania dostawcy.

Pełny zakres recenzji 1226 pytań i 359 fiszek, klasyfikacje sygnałów i poprawki:
[raport jakości](question-quality-audit.md) oraz
[przegląd fiszek](flashcard-quality-audit.md).


## Uproszczenie panelu rachunków po kolejnych uwagach

Panel lekcji pokazuje jedno pole przyjmujące liczby i opis słowny oraz przycisk
Oblicz. Rozpoznany przez AI zapis jest prezentowany jako jeden wzór do zatwierdzenia;
nie powtarzamy pełnej wypowiedzi nauczyciela i tego samego wzoru w trzech blokach.
Wynik pojawia się raz. Notacja naukowa ma czytelny zapis z potęgą dziesięciu;
zaokrąglony podgląd jest oznaczony znakiem przybliżenia, a dalsze rachunki używają
oryginalnej precyzji. Historia, nadzór nauczyciela, eksport i instrukcja składni
są dostępne po rozwinięciu. Dotychczasowe rachunki i notatki są zachowane.

Weryfikacja tej zmiany: 43 testy jednostkowe kalkulatora, planów i nadzoru;
6 scenariuszy E2E na komputerze i telefonie; poprawny build. Scenariusz słowny
sprawdza pojedyncze zapytanie AI, zatwierdzenie zapisu, jeden wynik, zachowanie
pełnej precyzji przy dalszym liczeniu oraz brak powtórzenia po odświeżeniu.
API było zastąpione kontrolowanymi odpowiedziami, bez dodatkowego kosztu.


## Prosty ekran pytań i małych kroków

Po kolejnych uwagach użytkownika ekran lekcji ma jedno krótkie pytanie, aktualny
wzór i maksymalnie cztery krótkie odpowiedzi A–D. Poprawny wybór od razu
aktualizuje zadanie; błędny pozostawia bieżący krok i krótki komunikat.
Teoria/historia są zwinięte. Nauczyciel i kalkulator otwierają się na żądanie,
także na komputerze; usunięto domyślny panel obok zadania i powtarzane objaśnienia.
Nauczyciel otrzymuje bieżący mały prompt i aktualne obliczenia.

Arena udostępnia 3–4 wybory dla wszystkich 658 pytań liczbowych matematyki oraz
zachowuje 102 oryginalne zestawy wyboru. Reguły wykluczają alternatywy poprawne
według istniejącego grade/tolerancji. Dystraktory dziesiętne i prawdopodobieństwa
uwzględniają precyzję oraz właściwy zakres. Lokalnie sprawdzane przekształcenia
liczbowe tworzą małe kroki dla 198 z 761 pytań. Pozostałe nie dostają pozornych
kroków symbolicznego dowodu; zachowują krótkie odpowiedzi i nauczyciela.

Dla pierwiastka z 48 uczeń wybiera rozkład 16·3, iloczyn pierwiastków i 4√3.
Końcowy poprawny krok zapisuje jedną normalną próbę, bez ponownego pytania o
identyczny wynik. Trening kroków jest oznaczony jako pomoc; nie udaje niezależnego
rozwiązania. Przerwana pozycja, wybór, status i jawnie odsłonięte podpowiedzi
pozostają zapisane. visibleHintLevel jest osobne od ogólnego hintLevel, więc samo
prowadzenie krokami nie odsłania automatycznie rozwiązania.

Końcowa weryfikacja: 898/898 testów jednostkowych w 69 plikach, build i typecheck
tutora poprawne. 64 odrębne scenariusze przeglądarkowe zweryfikowane na komputerze
i telefonie: 38 Feed, 10 ogólnych regresji Arena i 16 workspace/mikrokroki.
Dwa mobilne duplikaty szerokości/kontrastu celowo pominięte. Testy odkryły i
potwierdziły naprawę pułapki fokusu w kalkulatorze oraz zapisu widocznej podpowiedzi.
Nowe testy używały atrap API; nie zwiększano płatnego budżetu walidacji.


## Adaptacja i ciągłość całej matematyki — 9 października 2026

Znam odpowiedź jest świadomym przejściem do finału, bez zaliczenia i bez pomocy
za sam widok. Wybór jest zapisany w Arenie i w lekcjach. Po błędnej odpowiedzi
można przećwiczyć etapy bez nadpisywania pierwszej oceny ani tworzenia nowej próby.

Wspólny rejestr matematyki łączy sprawdzane lokalnie rodziny równań/nierówności,
autorowane wzory/przekształcenia oraz obliczenia liczbowe. Nierówność |x−2|<5
ma dwie decyzje. Delta ma zachowane b² i 4ac oraz ich różnicę; po opanowaniu
prostych części ich quizy mogą zostać pominięte. Zera funkcji, reguły i złożone
rachunki pozostają chronione. Pierwiastki wykorzystują gotowy √Δ, licznik i
dzielenie, bez ponownego quizu tego samego zbioru.

Adaptacja korzysta z rzeczywistych samodzielnych prób i trzech poprawnych
pierwszych odpowiedzi danego prostego typu w co najmniej dwóch zadaniach.
Jawna wskazówka/AI nie kwalifikują takiej odpowiedzi. Błąd przywraca prowadzenie.
Nie mierzymy IQ ani nie traktujemy przerwy w autobusie jako braku zdolności.
Duże potęgi i działania na liczbach dziesiętnych nie są uznawane za rutynę
na podstawie samej małej liczby operatorów. Ujemny wykładnik ma osobny tag.

Ostatni rzeczywiście wykonany wynik jest widoczny przy końcowym pytaniu i
pozostaje po wznowieniu. Nauczyciel otrzymuje aktualną treść kroku, wzór oraz
jego rzeczywiste A–D; nie musi zgadywać liter według odpowiedzi całego zadania.
Dane konieczne do zrozumienia nazwanego wzoru pozostają widoczne.

Weryfikacja końcowa: 966/966 testów jednostkowych w 73 plikach, poprawny build
oraz typecheck tutora. 54 odrębne scenariusze E2E na obu urządzeniach: 22 workspace,
10 rodzin i 22 regresje lekcji/misji. Przypadki końcowe powtórzono po poprawkach.
Współdzielony budżet Claude nie został zwiększony ani odnowiony po zmianie daty;
testy tej zmiany korzystały z atrap API.

Granice generatorów są jawne: wszystkie 761 pytania przechodzą przez ten sam
rejestr i zasady widoku. 658 zadań liczbowych ma 3–4 odpowiedzi, 102 zachowują
swoje zestawy A–D. Sprawdzane automatycznie plany obejmują około 410 pytań;
nie tworzymy pozornych etapów tam, gdzie parser nie potrafi potwierdzić treści.
Pozostałe zadania zachowują odpowiedzi, kalkulator i nauczyciela. Manifest
warstwy autorowanej obejmuje 269 pytań i nie jest statystyką całego rejestru.

## Szczegóły gotowości do nauki — 9 października 2026

Stary skrót uruchamiania ponownie prosił o klucz i otwierał port 1420,
podczas gdy bieżący zapis ucznia należy do localhost:4186. Skrót korzysta teraz
z magazynu Windows i stałego adresu 4186. Serwer działa w tle; ponowne
uruchomienie skrótu korzysta z istniejącego serwera. Zajęty przez inną aplikację
port powoduje czytelny błąd, bez zmiany adresu ani zatrzymywania obcych procesów.
Potwierdzono start świeżego procesu, odczyt zapisanych poświadczeń, dostępność
nauczyciela i ponowne otwarcie bez żądania klucza. Weryfikacja używa Models API,
bez generowania płatnej odpowiedzi.

Poprawiono brakujący rachunek w kroku z parametrem: sam warunek m≠0
w poleceniu nie ukrywa już wyrażenia 2²−4m. Fokus klawiatury przechodzi do
następnego kroku także w powtórce otwartej w dialogu, bez przejmowania go
z osobnego kalkulatora lub nauczyciela. Kontynuowanie i wstawianie wyniku
kalkulatora używa pełnej zapisanej wartości; skrócony zapis na ekranie nie
staje się wejściem następnego działania. Uszkodzony opcjonalny wiersz importu
nie kasuje pozostałych rachunków, notatek i wykonanych etapów.

Sprawdzenia tej rundy: 38/38 testów jednostkowych kalkulatora i brudnopisu,
46/46 scenariuszy przeglądarkowych na komputerze i telefonie (42 rachunki,
wznawianie i misje oraz 4 nowe regresje kroków), poprawny build i kontrola
typów backendu. Profile testowe były osobne; dane ucznia pozostały zachowane.
Nie zwiększono dotychczasowego kosztu Claude 1,807824 / 3 USD.

## Aktualizacja zainstalowanej aplikacji telefonu — 9 października 2026

Publikacja pozostaje pod https://odzi678biznes.github.io/forge/. Tożsamość PWA,
zakres /forge/ i baza IndexedDB forge (wersja 5) pozostają bez zmian. Aktualizacja
nie usuwa prób, opanowanych umiejętności, lekcji, terminów powtórek ani notatek.
Zapis przerwanej lekcji toleruje wyłącznie potwierdzoną migrację skróconego kursu;
rzeczywista zmiana odpowiedzi nadal unieważnia nieaktualny widok.

Sprawdzono 981 testów jednostkowych, 128 scenariuszy głównej aplikacji i 8 tutora
na komputerze i telefonie (4 scenariusze celowo pomijane zgodnie z warunkami
testów). Kontrola typów i build przeszły. Osobny profil telefonu uruchomił
poprzednią opublikowaną wersję 4066453, zapisał odpowiedź, zastosował aktualizację
przez istniejący przycisk „Odśwież” i porównał zachowane zapisy. Nowa wersja
uruchomiła się następnie offline. Dane prawdziwego ucznia nie były zmieniane.
Testy migracji obejmują pełne bazy wersji 4 i 5, również po ponownym otwarciu.

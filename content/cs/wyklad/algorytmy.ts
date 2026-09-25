import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: sortowanie, techniki algorytmiczne, struktury danych, reprezentacja. */
export const WYKLAD_ALGORYTMY: Record<string, LessonExplanation> = {
  'cs-search-sort': {
    idea: [
      'Sortowanie bąbelkowe przypomina bąbelki w wodzie: porównujesz sąsiadów i zamieniasz ich, gdy stoją w złej kolejności. W jednym przebiegu największy element „wypływa” na koniec listy — przesuwa się krok po kroku, dopóki nie trafi na swoje miejsce.',
      'Sortowanie przez wstawianie działa jak układanie kart w dłoni: bierzesz kolejną kartę i wsuwasz ją we właściwe miejsce między już ułożone, przesuwając większe o jedno miejsce w prawo.',
      r`Przy dużych danych oba algorytmy są wolne: każdy element może być porównany prawie z każdym, więc porównań jest około $\frac{n^2}{2}$. Liczba zamian w sortowaniu bąbelkowym to liczba inwersji — par elementów stojących w złej kolejności. Na maturze częściej niż pisać te algorytmy trzeba umieć przewidzieć ich działanie.`,
    ],
    method: [
      'Bąbelkowe: w przebiegu numer i porównuj t[j] z t[j + 1] dla j od 0 do n − 2 − i i zamieniaj, gdy t[j] > t[j + 1].',
      'Wstawianie: każdy element od drugiego zapamiętaj, przesuń większe poprzedniki o jedno miejsce w prawo i wstaw go w zwolnione miejsce.',
      'Porównania i zamiany licz na małym przykładzie, przebieg po przebiegu.',
      'W praktyce sortuj przez `sorted(t, key=...)` — algorytmy piszesz, gdy wymaga tego zadanie.',
    ],
    check: {
      question: 'Jak wygląda lista [3, 1, 2] po pierwszym przebiegu sortowania bąbelkowego?',
      answer: '[1, 2, 3]: zamiana 3 z 1, potem 3 z 2 — największy element trafił na koniec.',
    },
  },
  'cs-sort-advanced': {
    idea: [
      'Sortowanie przez scalanie korzysta z prostego faktu: dwie posortowane listy łatwo połączyć w jedną — patrzysz na ich początki i zabierasz mniejszy element, jak przy łączeniu dwóch posortowanych stosów kart. Dlatego dzielisz listę na pół, każdą połowę sortujesz tą samą metodą i scalasz.',
      r`Podział na pół daje $\log_2 n$ poziomów, a na każdym poziomie scalanie przegląda wszystkie $n$ elementów. Stąd złożoność $n \log n$ — dla miliona elementów to około 20 milionów kroków zamiast biliona przy $n^2$.`,
      r`Sortowanie szybkie dzieli inaczej: wybiera element osiowy i rozdziela resztę na mniejsze i większe od niego. Zwykle działa bardzo szybko, ale gdy oś jest pechowo wybrana (np. pierwszy element już posortowanej listy), podziały są nierówne i czas rośnie do $n^2$.`,
    ],
    method: [
      'Scalanie: podziel listę na dwie połowy, posortuj je rekurencyjnie i scal, zabierając zawsze mniejszy z dwóch początków.',
      'Warunek stopu: lista pusta albo jednoelementowa jest już posortowana.',
      'Sortowanie szybkie: wybierz oś, podziel elementy na mniejsze, równe i większe, posortuj części i połącz je.',
      'Złożoność szacuj przez liczbę poziomów podziału i pracę wykonaną na jednym poziomie.',
    ],
    check: {
      question: 'Ile poziomów podziału ma sortowanie przez scalanie dla 8 elementów?',
      answer: r`Trzy: 8 → 4 → 2 → 1, bo $\log_2 8 = 3$.`,
    },
  },
  'cs-binary-search': {
    idea: [
      'Wyszukiwanie binarne to gra „zgadnij liczbę od 1 do 100”: pytasz o środek, słyszysz „więcej” albo „mniej” i odrzucasz połowę możliwości. Po siedmiu pytaniach znasz odpowiedź, bo 7 połowień sprowadza 100 możliwości do jednej.',
      'Działa tylko na posortowanej liście — bo tylko wtedy porównanie ze środkiem mówi, w której połowie jest szukana wartość. Każdy krok dzieli przedział na pół, więc milion elementów to najwyżej około 20 kroków.',
      'Najczęstsze kłopoty to granice przedziału: czy środek zostaje w przedziale, czy go odrzucasz. Dlatego zawsze warto sprawdzić przypadek dwóch elementów — tam pętla najłatwiej się zapętla.',
    ],
    method: [
      'Upewnij się, że lista jest posortowana.',
      'Ustaw granice l = 0 i p = n − 1 i powtarzaj, dopóki l ≤ p.',
      'Porównaj środek s z szukaną wartością i odrzuć połowę, w której jej być nie może (l = s + 1 albo p = s − 1).',
      'Sprawdź ręcznie listę z dwoma elementami i wartość, której w liście nie ma.',
    ],
    check: {
      question: 'Ile najwyżej porównań potrzeba w posortowanej liście miliona elementów?',
      answer: r`Około 20, bo $2^{20} \approx 1\,000\,000$.`,
    },
  },
  'cs-recursion': {
    idea: [
      r`Rekurencja to rozwiązywanie problemu przez ten sam problem w mniejszej wersji. Silnia: $n! = n \cdot (n - 1)!$ — żeby policzyć $5!$, wystarczy znać $4!$, żeby znać $4!$ — $3!$… aż do $1! = 1$, które znasz od razu. Ten najmniejszy przypadek to warunek stopu.`,
      'Rekurencję możesz sobie wyobrazić jak matrioszkę: otwierasz lalkę, w środku jest mniejsza, w niej jeszcze mniejsza — aż do najmniejszej, pełnej. Bez tej najmniejszej otwieranie trwałoby bez końca, a program zakończy się błędem.',
      'Rekurencja bywa zdradliwa: naiwne liczenie liczb Fibonacciego wywołuje te same wartości wiele razy w różnych gałęziach, a liczba wywołań rośnie wykładniczo. Wtedy lepiej liczyć od najmniejszych wartości w górę albo zapamiętywać wyniki.',
    ],
    method: [
      'Ustal najmniejszy przypadek i jego odpowiedź — warunek stopu.',
      'Opisz, jak z rozwiązania mniejszego przypadku zbudować większe.',
      'Sprawdź, że każde wywołanie jest dla MNIEJSZEGO argumentu.',
      'Gdy te same wartości liczą się wiele razy, przejdź na wersję iteracyjną albo zapamiętuj wyniki.',
    ],
    check: {
      question: 'Jaki jest warunek stopu w rekurencyjnym liczeniu sumy 1 + 2 + … + n?',
      answer: 'Dla n = 0 suma jest znana od razu (0); dalej suma(n) = n + suma(n − 1).',
    },
  },
  'cs-greedy': {
    idea: [
      'Algorytm zachłanny w każdym kroku bierze to, co teraz wygląda najlepiej, i nigdy nie zmienia zdania. Wydając resztę, bierzesz najpierw największy nominał, który się mieści — prosto i szybko.',
      'Kłopot w tym, że najlepszy ruch teraz nie zawsze prowadzi do najlepszego wyniku na końcu. Przy nominałach 1, 3 i 4 kwotę 6 zachłannie wydasz jako 4 + 1 + 1 (trzy monety), a da się jako 3 + 3 (dwie). Zachłanność jest więc hipotezą, którą trzeba sprawdzić.',
      'Dla niektórych problemów zachłanność zawsze daje optimum — np. przy wyborze jak największej liczby rozłącznych zajęć, gdy bierzesz zawsze to, które kończy się najwcześniej: zostawia najwięcej czasu na resztę. Algorytm Dijkstry też jest zachłanny i działa, bo wagi dróg nie są ujemne.',
    ],
    method: [
      'Ustal kryterium wyboru „najlepszego w tej chwili”.',
      'Posortuj dane według tego kryterium.',
      'Wybieraj po kolei, pomijając elementy, które kolidują z już wybranymi.',
      'Poszukaj małego kontrprzykładu; jeśli istnieje, potrzebne jest programowanie dynamiczne.',
    ],
    check: {
      question: 'Czy zachłanne wydawanie reszty nominałami 1, 3 i 4 jest optymalne dla kwoty 6?',
      answer: 'Nie: zachłannie wychodzi 4 + 1 + 1 (3 monety), a optimum to 3 + 3 (2 monety).',
    },
  },
  'cs-dp': {
    idea: [
      'Programowanie dynamiczne to rekurencja z pamięcią. Zamiast liczyć te same podproblemy wiele razy, liczysz każdy raz, zapisujesz wynik w tablicy i przy następnej potrzebie tylko go odczytujesz — jak ściąga z gotowymi wynikami.',
      'Kluczowe pytanie: z jakich mniejszych wyników składa się większy? Na schody o n stopniach wchodzisz ostatnim krokiem o 1 albo o 2, więc sposobów jest tyle, ile na n − 1 stopni plus ile na n − 2. Jeden wzór na komórkę tablicy i wartości początkowe wystarczą.',
      'Tablicę wypełniasz od najmniejszych przypadków w górę, więc gdy liczysz komórkę, wszystkie potrzebne mniejsze są już gotowe. Odpowiedź leży w komórce dla pełnego problemu.',
    ],
    method: [
      'Określ, co oznacza komórka tablicy (np. d[i] — liczba sposobów dla i stopni).',
      'Znajdź wzór na komórkę z mniejszych komórek.',
      'Ustal wartości początkowe.',
      'Wypełnij tablicę we właściwej kolejności i odczytaj odpowiedź.',
    ],
    check: {
      question: 'Na ile sposobów wejdziesz na 4 stopnie, stawiając kroki o 1 lub 2?',
      answer: 'd = 1, 1, 2, 3, 5 dla 0–4 stopni — 5 sposobów.',
    },
  },
  'cs-subseq': {
    idea: [
      'Zadania o fragmentach listy rozwiązujesz jednym przejściem z dwiema zmiennymi: „bieżący” (fragment kończący się na tym elemencie) i „najlepszy” (najlepszy dotąd). Przy każdym elemencie decydujesz, czy przedłużasz bieżący fragment, czy zaczynasz nowy.',
      'W najdłuższym fragmencie niemalejącym: jeśli element jest nie mniejszy od poprzedniego, bieżąca długość rośnie o 1, w przeciwnym razie wraca do 1. Najlepszą długość aktualizujesz na bieżąco.',
      'Algorytm Kadanego robi to samo z sumą: fragment o największej sumie kończący się na x to albo sam x, albo x dołączony do najlepszego fragmentu kończącego się tuż przed nim — zależnie od tego, co daje więcej. Ujemna „przeszłość” tylko by przeszkadzała.',
    ],
    method: [
      'Zdefiniuj „bieżący” — najlepszy fragment kończący się na aktualnym elemencie.',
      'Dla każdego elementu zdecyduj: przedłużyć bieżący fragment albo zacząć nowy.',
      'Po każdym elemencie porównaj bieżący wynik z najlepszym dotąd.',
      'Startuj od pierwszego elementu, a nie od zera — to ważne, gdy wszystkie liczby są ujemne.',
    ],
    check: {
      question: 'Jaka jest największa suma spójnego fragmentu listy [2, −5, 3, 4]?',
      answer: '7 — fragment [3, 4]; dołączenie [2, −5] tylko zmniejszyłoby sumę.',
    },
  },
  'cs-stack-queue': {
    idea: [
      'Stos działa jak stos talerzy: kładziesz na górę i zdejmujesz z góry, więc pierwszy zdjęty jest ten położony ostatnio (LIFO). Kolejka działa jak kolejka do kasy: kto przyszedł pierwszy, ten pierwszy wychodzi (FIFO).',
      'Stos pasuje wszędzie tam, gdzie trzeba wracać w odwrotnej kolejności: przycisk „Wstecz” w przeglądarce, sprawdzanie nawiasów (każdy nawias zamykający musi pasować do OSTATNIEGO otwartego) i obliczanie wyrażeń w ONP.',
      'W ONP działanie stoi po argumentach, więc nie są potrzebne nawiasy ani kolejność działań. Liczby odkładasz na stos, a operator zdejmuje dwie ostatnie, liczy i odkłada wynik: `2 3 + 4 *` to najpierw 2 + 3 = 5, potem 5 · 4 = 20.',
    ],
    method: [
      'Zdecyduj, czy potrzebujesz zasady „ostatni pierwszy” (stos), czy „pierwszy pierwszy” (kolejka).',
      'Stos w Pythonie: `append` i `pop()`; kolejka: `collections.deque` z `append` i `popleft()`.',
      'ONP: liczby na stos; operator zdejmuje dwie liczby (pierwsza zdjęta to PRAWY argument), liczy i odkłada wynik.',
      'Na końcu na stosie powinna zostać dokładnie jedna liczba — wynik.',
    ],
    check: {
      question: 'Ile wynosi wyrażenie ONP `6 2 / 1 +`?',
      answer: '6 / 2 = 3, potem 3 + 1 = 4.',
    },
  },
  'cs-graphs': {
    idea: [
      'Graf to kropki połączone kreskami: miasta i drogi, osoby i znajomości, pola planszy i przejścia między nimi. Wiele zadań staje się prostych, gdy tylko narysujesz je jako graf.',
      'Przeszukiwanie wszerz (BFS) działa jak fala na wodzie po wrzuceniu kamienia: najpierw dociera do sąsiadów punktu startu, potem do ich sąsiadów… Dzięki temu każdy wierzchołek poznaje swoją najkrótszą odległość od startu, liczoną w krawędziach.',
      'Każda krawędź ma dwa końce, więc wlicza się do stopnia dwóch wierzchołków. Stąd suma stopni jest zawsze dwa razy większa od liczby krawędzi — prosty rachunek, który rozwiązuje wiele pytań.',
    ],
    method: [
      'Zapisz graf jako listę sąsiedztwa: dla każdego wierzchołka listę jego sąsiadów.',
      'BFS: wstaw start do kolejki i oznacz go jako odwiedzony; zdejmuj kolejne wierzchołki i dokładaj ich nieodwiedzonych sąsiadów, od razu ich oznaczając.',
      'Odległość sąsiada to odległość bieżącego wierzchołka plus 1.',
      'Spójne składowe: uruchamiaj BFS z każdego jeszcze nieodwiedzonego wierzchołka i licz te uruchomienia.',
    ],
    check: {
      question: 'Graf ma 4 wierzchołki, a każdy ma stopień 3. Ile ma krawędzi?',
      answer: 'Suma stopni to 12, więc krawędzi jest 12 : 2 = 6.',
    },
  },
  'cs-analysis': {
    idea: [
      'Żeby zrozumieć cudzy algorytm, nie zgaduj — przeprowadź go ręcznie na małych danych. Zapisuj w tabelce wartości zmiennych po każdym obrocie pętli. Po dwóch–trzech wierszach tabelki zwykle widać, co program robi.',
      r`Złożoność mówi, jak szybko rośnie liczba operacji, gdy rosną dane. Pojedyncza pętla po $n$ elementach to około $n$ operacji, pętla w pętli — około $n^2$, a pętla, która w każdym kroku dzieli $n$ na pół — około $\log_2 n$.`,
      r`To przekłada się na czas: algorytm $n^2$ przy trzy razy większych danych działa dziewięć razy dłużej, liniowy — trzy razy dłużej, a logarytmiczny prawie tyle samo. Przy dużych plikach z matury wybór algorytmu decyduje, czy program skończy się w sekundę, czy w godzinę.`,
    ],
    method: [
      'Wybierz małe dane i przejdź algorytm ręcznie, zapisując zmienne w tabelce.',
      'Sformułuj hipotezę, co algorytm oblicza, i sprawdź ją na innych danych.',
      'Licz wykonania instrukcji: pojedyncza pętla — n razy, zagnieżdżone — iloczyn albo suma zakresów.',
      'Szacuj czas: porównaj, ile razy rosną dane i jak rośnie przy tym liczba operacji.',
    ],
    check: {
      question: 'Ile razy wykona się instrukcja wewnątrz dwóch zagnieżdżonych pętli `for i in range(5)` i `for j in range(5)`?',
      answer: '5 · 5 = 25 razy.',
    },
  },
  'cs-representation': {
    idea: [
      r`Na $n$ bitach mieści się $2^n$ różnych układów zer i jedynek — jak $n$ przełączników, z których każdy ma dwie pozycje. Na 8 bitach to 256 wartości: bez znaku od 0 do 255.`,
      r`Kod U2 dzieli te 256 wartości na ujemne i nieujemne w sprytny sposób: najstarszy bit „waży” $-128$ zamiast $+128$. Dzięki temu dodawanie działa tak samo dla liczb dodatnich i ujemnych, a procesor nie potrzebuje osobnego układu do odejmowania.`,
      'Ułamki zapisuje się podobnie jak w notacji wykładniczej, tylko w systemie dwójkowym. Bitów jest skończenie wiele, a 0,1 w dwójkowym ma nieskończenie wiele cyfr (jak 1/3 w dziesiętnym) — musi więc zostać zaokrąglone i stąd biorą się drobne błędy obliczeń.',
    ],
    method: [
      r`Zakres: bez znaku od $0$ do $2^n - 1$, w U2 od $-2^{n-1}$ do $2^{n-1} - 1$.`,
      'Liczba ujemna w U2: zapisz jej wartość bezwzględną dwójkowo, odwróć bity i dodaj 1.',
      'Odczyt U2: zsumuj wagi jedynek, pamiętając, że najstarszy bit ma wagę ujemną.',
      'Ułamek jest dokładny w dwójkowym tylko wtedy, gdy jego mianownik (po skróceniu) jest potęgą dwójki.',
    ],
    check: {
      question: 'Jaki jest zakres liczb w 8-bitowym kodzie U2?',
      answer: r`Od $-128$ do $127$ — liczb nieujemnych jest o jedną mniej niż ujemnych, bo jest wśród nich zero.`,
    },
  },
  'cs-logic': {
    idea: [
      'Operacje logiczne to „bramki”: AND przepuszcza sygnał tylko wtedy, gdy oba wejścia są włączone, OR — gdy co najmniej jedno, NOT odwraca stan, a XOR daje 1, gdy wejścia są różne. Z takich bramek zbudowany jest każdy procesor.',
      'Operatory bitowe (`&`, `|`, `^`, `~`) wykonują te działania na wszystkich bitach liczby naraz, pozycja po pozycji. 12 & 10 to 1100 & 1010 = 1000, czyli 8 — zostają jedynki tylko tam, gdzie obie liczby je mają.',
      'XOR ma wyjątkową własność: dwukrotne użycie tego samego klucza przywraca wartość, bo (x ^ k) ^ k = x. Tak działa najprostsze szyfrowanie — ten sam klucz szyfruje i odszyfrowuje.',
    ],
    method: [
      'Zapisz liczby dwójkowo i wyrównaj je do tej samej długości.',
      'Wykonuj działanie pozycja po pozycji według tabelki prawdy.',
      'Maski: `n & 1` — ostatni bit, `(n >> i) & 1` — bit numer i, `1 << i` — liczba z jedynką na pozycji i.',
      'Upraszczaj warunki prawami De Morgana: `not (a and b)` to `(not a) or (not b)`.',
    ],
    check: {
      question: 'Ile to jest 6 | 3 (OR bitowe)?',
      answer: '110 | 011 = 111, czyli 7.',
    },
  },
};

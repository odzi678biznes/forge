import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: Python od podstaw oraz listy, napisy, słowniki i pliki. */
export const WYKLAD_PROGRAMOWANIE: Record<string, LessonExplanation> = {
  'cs-py-basics': {
    idea: [
      'Zmienną wyobraź sobie jako pudełko z etykietą. Instrukcja `x = 5` wkłada do pudełka „x” liczbę 5, a `x = x + 1` znaczy: weź to, co jest w pudełku, dodaj 1 i włóż z powrotem. To nie jest równanie z matematyki — to polecenie.',
      'Każda wartość ma typ: liczba całkowita (`int`), liczba z przecinkiem (`float`), napis (`str`), prawda lub fałsz (`bool`). Typ decyduje, co można z wartością zrobić: `"2" + "3"` skleja napisy w `"23"`, a `2 + 3` daje `5`.',
      'Dzielenie całkowite `//` i reszta `%` działają jak dzielenie z resztą z podstawówki: 17 cukierków dla 5 osób to po `17 // 5 = 3` i zostają `17 % 5 = 2`. Te dwa działania rozbierają liczby na cyfry, przeliczają sekundy na minuty i sprawdzają podzielność.',
    ],
    method: [
      'Nazywaj zmienne tak, żeby mówiły, co przechowują (`suma`, `licznik`), a nie `a1`, `a2`.',
      'Zastanów się, jakiego typu jest każda wartość; tekst z liczbą zamień na liczbę przez `int()`.',
      'Do cyfr i podzielności używaj `%` i `//`, do potęg `**`.',
      'Przy złożonych wyrażeniach dopisz nawiasy, zamiast polegać na kolejności działań.',
    ],
    check: {
      question: 'Ile wynoszą `23 // 5` i `23 % 5`?',
      answer: '`4` i `3`, bo 23 = 5 · 4 + 3.',
    },
  },
  'cs-py-conditions': {
    idea: [
      'Instrukcja `if` to rozwidlenie drogi: komputer sprawdza warunek i idzie jedną ścieżką, gdy jest prawdziwy, a drugą (`else`), gdy jest fałszywy. Warunek to wyrażenie, które daje `True` albo `False`.',
      'Łańcuch `if` – `elif` – `else` jest sprawdzany z góry na dół i wykonuje się TYLKO pierwsza pasująca gałąź. Dlatego przypadki szczególne muszą stać wyżej niż ogólne — jak w sicie, w którym najpierw odsiewasz najdrobniejsze ziarna.',
      'Operatory `and`, `or` i `not` składają proste warunki w złożone, jak spójniki w zdaniu: „pełnoletni i ma bilet”, „weekend albo święto”. Gdy mieszasz `and` i `or`, nawiasy mówią, co łączy się z czym.',
    ],
    method: [
      'Wypisz wszystkie przypadki, które program ma rozróżnić.',
      'Ułóż je od najbardziej szczegółowego do najogólniejszego.',
      'Zapisz warunki porównaniami (`==`, `!=`, `<`, …) i połącz je `and`, `or`, `not`, dodając nawiasy.',
      'Sprawdź przypadki graniczne: równość, zero, liczby ujemne.',
    ],
    check: {
      question: 'Jak zapisać warunek „`n` jest parzyste i dodatnie”?',
      answer: '`n % 2 == 0 and n > 0`.',
    },
  },
  'cs-py-loops': {
    idea: [
      'Pętla to sposób, żeby nie pisać tego samego tysiąc razy. `for` mówi: „dla każdego elementu tej listy (albo tego zakresu) zrób to samo”. `while` mówi: „powtarzaj, dopóki warunek jest prawdziwy” — przydaje się, gdy nie wiesz z góry, ile będzie powtórzeń.',
      'Najważniejszy wzorzec to akumulator: zmienna, która zbiera wynik. Przed pętlą ustawiasz ją na wartość neutralną (0 dla sumy, 1 dla iloczynu), a w każdym obrocie dokładasz kolejny kawałek — jak do skarbonki, do której co dzień wrzucasz monetę.',
      '`range(a, b)` kończy się na `b - 1`, bo liczy „od a, b − a kroków”. Dzięki temu `range(len(t))` daje dokładnie wszystkie indeksy listy — od 0 do ostatniego.',
    ],
    method: [
      'Zdecyduj: znasz liczbę powtórzeń albo przechodzisz po elementach — `for`; powtarzasz aż do spełnienia warunku — `while`.',
      'Przed pętlą ustaw akumulator na wartość neutralną.',
      'W pętli aktualizuj akumulator; w `while` zmieniaj zmienną z warunku, żeby pętla się skończyła.',
      'Sprawdź ręcznie pierwszy i ostatni obrót pętli (granice `range`).',
    ],
    check: {
      question: 'Jakie liczby daje `range(2, 10, 3)`?',
      answer: '2, 5 i 8 — od 2 z krokiem 3, kończąc przed 10.',
    },
  },
  'cs-py-functions': {
    idea: [
      'Funkcja to maszynka z nazwą: wrzucasz dane (argumenty), ona liczy i oddaje wynik przez `return`. Raz napisaną możesz uruchamiać wiele razy z różnymi danymi — jak przepis, z którego gotujesz dla dwóch albo dla dziesięciu osób.',
      '`return` różni się od `print` tak jak podanie komuś kartki od przeczytania jej na głos. `print` pokazuje wynik człowiekowi, ale program go nie dostaje. `return` oddaje wynik programowi, który może go dalej użyć — dlatego testy sprawdzają to, co funkcja zwraca.',
      'Zmienne utworzone w funkcji żyją tylko w niej, a funkcja pracuje na tym, co dostała w argumentach. Dzięki temu każdą funkcję da się zrozumieć i sprawdzić osobno.',
    ],
    method: [
      'Nazwij funkcję i parametry tak, jak w treści zadania.',
      'Zapisz obliczenie na parametrach, a nie na zmiennych spoza funkcji.',
      'Zakończ `return` z wynikiem i sprawdź, że każda ścieżka `if` coś zwraca.',
      'Przetestuj funkcję na przykładzie z treści i na przypadku brzegowym.',
    ],
    check: {
      question: 'Co zwróci funkcja, w której zamiast `return wynik` jest `print(wynik)`?',
      answer: '`None` — wynik pojawi się na ekranie, ale funkcja niczego nie odda, więc test zobaczy `None`.',
    },
  },
  'cs-arrays': {
    idea: [
      'Lista to rząd ponumerowanych szafek. Numeracja zaczyna się od 0, więc w liście pięciu elementów ostatni ma numer 4. Ujemny numer liczy od końca: `t[-1]` to ostatni element.',
      'Większość zadań to jedno przejście po liście z „notesem” w ręku: zapisujesz najlepszy dotąd wynik (minimum, maksimum, najdłuższy ciąg) i przy każdym elemencie sprawdzasz, czy go poprawić. Na końcu notes zawiera odpowiedź.',
      'Przy porównywaniu sąsiadów potrzebujesz indeksów, a nie samych wartości: element `t[i]` porównujesz z `t[i + 1]`, więc `i` może dojść najwyżej do przedostatniego indeksu, `len(t) - 2`.',
    ],
    method: [
      'Zdecyduj, czy potrzebujesz samych wartości (`for x in t`), czy indeksów (`for i in range(len(t))`).',
      'Zainicjuj „notes” pierwszym elementem listy (dla minimum i maksimum) albo wartością neutralną (dla sum i liczników).',
      'Przy każdym elemencie zaktualizuj notes.',
      'Uważaj na granice: dla sąsiadów użyj `range(len(t) - 1)`.',
    ],
    check: {
      question: 'Co zwróci `t[1:3]` dla `t = [10, 20, 30, 40]`?',
      answer: '`[20, 30]` — elementy o indeksach 1 i 2, bez 3.',
    },
  },
  'cs-strings': {
    idea: [
      'Napis to lista znaków, której nie da się zmienić w miejscu: każda „zmiana” tworzy nowy napis. Indeksowanie i wycinki działają tak samo jak w listach: `s[0]` to pierwszy znak, `s[-1]` ostatni.',
      'Każdy znak ma w komputerze numer (kod): `ord("a")` to 97, `ord("b")` to 98… Dzięki temu litery da się przesuwać rachunkiem. Szyfr Cezara zamienia literę na numer od 0 do 25, dodaje przesunięcie modulo 26 i zamienia z powrotem na literę.',
      'Napisy porównuje się jak w słowniku: znak po znaku, aż do pierwszej różnicy. Porównywane są kody, a wielkie litery mają mniejsze kody niż małe, dlatego `"Zebra" < "ala"`.',
    ],
    method: [
      'Przechodź po znakach pętlą `for c in s` albo po indeksach, gdy potrzebujesz pozycji.',
      'Nowy napis buduj przez doklejanie znaków (albo z listy znaków przez `"".join(...)`).',
      'Przesunięcia liter licz na numerach od 0 do 25 z modulo 26.',
      'Szukanie wzorca: porównuj wycinek `s[i:i + len(w)]` z wzorcem dla każdej możliwej pozycji `i`.',
    ],
    check: {
      question: 'Jaką literę da „y” w szyfrze Cezara z przesunięciem 3?',
      answer: '„b”: y → z → a → b (numer 24 + 3 = 27, a 27 mod 26 = 1).',
    },
  },
  'cs-dicts': {
    idea: [
      'Słownik to spis haseł: pod kluczem (np. słowem) przechowujesz wartość (np. liczbę wystąpień). Pytanie „ile razy wystąpiło słowo kot” to jedno spojrzenie do spisu, a nie przeglądanie całej listy.',
      'Zliczanie to klasyczny wzorzec: `d[x] = d.get(x, 0) + 1` — weź dotychczasową liczbę (albo 0, jeśli klucza jeszcze nie ma) i dodaj jeden.',
      'Zbiór to słownik bez wartości — pamięta tylko, co już było. Sprawdzenie `x in zbior` jest natychmiastowe nawet dla miliona elementów, a `x in lista` przegląda listę od początku. Przy dużych danych to różnica między sekundą a godziną.',
    ],
    method: [
      'Zdecyduj, co ma być kluczem (to, o co pytasz), a co wartością (to, co liczysz).',
      'Zliczaj przez `d[k] = d.get(k, 0) + 1`.',
      'Gdy wystarczy wiedzieć „czy już było”, użyj zbioru.',
      'Wynik wybierz, przechodząc po `d.items()` — np. klucz o największej wartości.',
    ],
    check: {
      question: 'Jak zliczyć litery w słowie „anna” słownikiem?',
      answer: 'Dla każdej litery `c` wykonaj `d[c] = d.get(c, 0) + 1` — wynik to `{"a": 2, "n": 2}`.',
    },
  },
  'cs-files': {
    idea: [
      'Plik z danymi to zwykły tekst: wiersze liczb albo słów. Komputer czyta go jako napisy — nawet „12” to na początku dwa znaki, a nie liczba. Pierwszy krok to więc zamiana tekstu na dane, z którymi da się liczyć.',
      '`split()` tnie wiersz na kawałki w miejscach spacji, a `int()` zamienia każdy kawałek na liczbę. Wzorzec „wczytaj wiersz — potnij — zamień — przetwórz” powtarza się w prawie każdym zadaniu praktycznym.',
      'Porównanie napisów zamiast liczb to podstępny błąd: `"10" < "9"`, bo porównuje się pierwsze znaki, a „1” jest przed „9”. Program działa, ale daje zły wynik — dlatego liczby zamieniasz na `int` od razu po wczytaniu.',
    ],
    method: [
      'Otwórz plik (`with open(...) as f`) i przejdź po wierszach — w FORGE po wierszach napisu `dane`.',
      'Każdy wiersz potnij `split()`.',
      'Zamień kawałki na liczby przez `int()` albo `float()`.',
      'Przetwórz dane, a wynik zapisz do pliku albo zwróć.',
    ],
    check: {
      question: 'Wiersz pliku to `"5 12"`. Jak dostać z niego dwie liczby?',
      answer: '`a, b = map(int, wiersz.split())` — `split` daje napisy `"5"` i `"12"`, a `int` zamienia je na liczby.',
    },
  },
};

/** Wykład: algorytmy na liczbach. */
export const WYKLAD_LICZBY_ALGORYTMY: Record<string, LessonExplanation> = {
  'cs-numbers': {
    idea: [
      'Liczba pierwsza dzieli się tylko przez 1 i przez siebie. Najprostszy test to sprawdzenie możliwych dzielników — ale nie trzeba iść do samego n. Dzielniki występują w parach: 36 = 2 · 18 = 3 · 12 = 4 · 9 = 6 · 6. W każdej parze mniejsza liczba nie przekracza √n, więc jeśli do √n nie ma dzielnika, to nie ma go wcale.',
      'Sito Eratostenesa odwraca pytanie: zamiast sprawdzać każdą liczbę osobno, od razu wykreśla wszystkie złożone. Najmniejsza nieskreślona liczba jest pierwsza, więc skreślasz jej wielokrotności — i powtarzasz. To, co zostanie, to liczby pierwsze.',
      'Rozkład na czynniki to dzielenie przez kolejne liczby, dopóki się da: 360 → 180 → 90 → 45 (trzy razy przez 2), 45 → 15 → 5 (dwa razy przez 3), zostaje 5. Każda liczba ma dokładnie jeden taki rozkład.',
    ],
    method: [
      'Test pierwszości: odrzuć n < 2, potem sprawdzaj dzielniki d od 2, dopóki d · d ≤ n.',
      'Wiele liczb naraz: zbuduj sito do największej potrzebnej wartości.',
      'Rozkład: dziel przez d, dopóki reszta jest zerem, potem zwiększ d; to, co zostanie większe od 1, jest ostatnim czynnikiem.',
      'Przetestuj przypadki 0, 1, 2 i kwadrat liczby pierwszej, np. 49.',
    ],
    check: {
      question: 'Do jakiej liczby trzeba sprawdzać dzielniki, żeby orzec o pierwszości 101?',
      answer: 'Do 10, bo 10 · 10 = 100 ≤ 101 < 11 · 11. Żadna z liczb 2–10 nie dzieli 101, więc 101 jest pierwsza.',
    },
  },
  'cs-gcd': {
    idea: [
      'Algorytm Euklidesa opiera się na spostrzeżeniu: każdy wspólny dzielnik a i b dzieli też ich różnicę, a więc i resztę z dzielenia a przez b. Dlatego NWD(a, b) = NWD(b, a mod b) — para liczb maleje, a szukany NWD się nie zmienia.',
      'Reszta jest zawsze mniejsza od dzielnika, więc liczby szybko maleją, aż reszta wyniesie zero. Wtedy ostatni niezerowy dzielnik to NWD: 48, 18 → 18, 12 → 12, 6 → 6, 0 — NWD = 6.',
      'NWW dostajesz z NWD bez szukania wielokrotności: iloczyn a · b zawiera wspólną część dwa razy, więc dzielisz go przez NWD raz. Tak samo skraca się ułamki i szuka wspólnego mianownika.',
    ],
    method: [
      'Dopóki b ≠ 0, zamieniaj parę (a, b) na (b, a % b).',
      'Gdy b = 0, wynikiem jest a.',
      'NWW(a, b) = a // NWD(a, b) * b — najpierw dzielenie, potem mnożenie.',
      'Ułamek skracaj, dzieląc licznik i mianownik przez ich NWD.',
    ],
    check: {
      question: 'Oblicz NWD(21, 14) i NWW(21, 14).',
      answer: 'NWD: 21, 14 → 14, 7 → 7, 0, więc 7. NWW = 21 // 7 * 14 = 42.',
    },
  },
  'cs-bases': {
    idea: [
      'W systemie dziesiętnym cyfra znaczy tyle, ile wynosi razy potęga dziesiątki zależna od miejsca: 352 = 3 · 100 + 5 · 10 + 2. W systemie o podstawie p jest tak samo, tylko potęgi są potęgami p. Liczba 1011 w dwójkowym to 1 · 8 + 0 · 4 + 1 · 2 + 1 = 11.',
      'Zamiana z dziesiętnego to odwrotność: dzieląc przez p, odcinasz ostatnią cyfrę (to reszta), a iloraz niesie resztę liczby. Powtarzasz, aż iloraz będzie zerem. Reszty czytane od ostatniej do pierwszej to cyfry wyniku.',
      'Szesnastkowy przydaje się, bo jego jedna cyfra to dokładnie cztery bity (16 = 2 · 2 · 2 · 2). Długi ciąg zer i jedynek zamienia się więc na krótki zapis, grupując bity po cztery od prawej.',
    ],
    method: [
      'Na dziesiętny: pomnóż każdą cyfrę przez potęgę podstawy odpowiadającą pozycji i zsumuj.',
      'Z dziesiętnego: dziel przez podstawę, zapisuj reszty i czytaj je od końca.',
      'Między dwójkowym a szesnastkowym: grupuj bity po cztery od prawej.',
      'Sprawdź wynik zamianą w drugą stronę.',
    ],
    check: {
      question: r`Ile to jest $1101_2$ w systemie dziesiętnym?`,
      answer: '8 + 4 + 0 + 1 = 13.',
    },
  },
  'cs-fastpow': {
    idea: [
      r`Naiwne $a^n$ to $n - 1$ mnożeń. Szybkie potęgowanie korzysta z tego, że $a^{16} = \left(\left(\left(a^2\right)^2\right)^2\right)^2$ — wystarczą cztery podniesienia do kwadratu. Przy wykładniku nieparzystym wyciągasz jedno $a$: $a^{13} = a \cdot a^{12}$, a $a^{12} = \left(a^6\right)^2$.`,
      r`Wykładnik maleje o połowę w każdym kroku, więc kroków jest około $\log_2 n$ — dla miliarda to około 30 zamiast miliarda. To klasyczny przykład metody „dziel i zwyciężaj”.`,
      r`Schemat Hornera robi coś podobnego z wielomianem: zamiast liczyć każdą potęgę $x$ osobno, wyłącza $x$ przed nawias raz za razem: $2x^3 - 3x^2 + 5 = ((2x - 3)x + 0)x + 5$. Wielomian stopnia $n$ liczysz $n$ mnożeniami.`,
    ],
    method: [
      r`Potęgowanie: dla $n = 0$ wynik to 1; dla parzystego $n$ policz RAZ $a^{n/2}$ i podnieś do kwadratu; dla nieparzystego pomnóż $a$ przez $a^{n-1}$.`,
      r`Przy potęgach modulo $m$ bierz resztę po każdym mnożeniu.`,
      r`Horner: zacznij od najwyższego współczynnika; w każdym kroku pomnóż wynik przez $x$ i dodaj następny współczynnik (zero za brakującą potęgę).`,
      'Sprawdź na małym przykładzie, licząc zwykłym sposobem.',
    ],
    check: {
      question: r`Ile mnożeń wykona szybkie potęgowanie dla $a^8$?`,
      answer: r`Trzy: $a^2$, potem $a^4 = \left(a^2\right)^2$, potem $a^8 = \left(a^4\right)^2$.`,
    },
  },
  'cs-approx': {
    idea: [
      r`Nie każdą liczbę da się policzyć dokładnie — $\sqrt2$ ma nieskończenie wiele cyfr. Metody przybliżone poprawiają wynik krok po kroku, aż błąd będzie mniejszy niż potrzeba.`,
      r`Metoda Herona szuka boku kwadratu o polu $a$. Startujesz od prostokąta $x \times \frac{a}{x}$ o tym polu i w każdym kroku bierzesz średnią boków: $x_{\text{nowe}} = \frac{x + \frac{a}{x}}{2}$. Prostokąt robi się coraz bardziej kwadratowy, a jego bok zbliża się do $\sqrt{a}$.`,
      'Połowienie przedziału (bisekcja) szuka miejsca zerowego jak w grze „zgadnij liczbę”: sprawdzasz środek, a funkcja zmienia znak w jednej z połówek — w niej szukasz dalej. Każdy krok skraca przedział dwa razy.',
    ],
    method: [
      'Ustal dokładność ε, jaką musi mieć wynik.',
      r`Heron: powtarzaj $x = \frac{x + \frac{a}{x}}{2}$, aż kolejne przybliżenia różnią się o mniej niż ε.`,
      'Bisekcja: sprawdź znak w środku przedziału i zostaw połówkę ze zmianą znaku; powtarzaj, aż przedział będzie krótszy niż ε.',
      'Liczby zmiennoprzecinkowe porównuj z tolerancją `abs(a - b) < eps`, a zaokrąglaj dopiero na końcu.',
    ],
    check: {
      question: r`Wykonaj jeden krok metody Herona dla $\sqrt{16}$, startując z $x = 8$.`,
      answer: r`$\frac{8 + \frac{16}{8}}{2} = \frac{8 + 2}{2} = 5$ — bliżej prawdziwej wartości 4 niż start.`,
    },
  },
};

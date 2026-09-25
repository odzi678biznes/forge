import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: funkcje i funkcja liniowa. */
export const WYKLAD_FUNKCJE: Record<string, LessonExplanation> = {
  'fn-basics': {
    idea: [
      r`Funkcję wyobraź sobie jako automat z napojami: wrzucasz numer (argument $x$), wypada dokładnie jeden napój (wartość $f(x)$). Ten sam numer zawsze daje ten sam napój — to jedyny warunek, żeby automat był funkcją.`,
      r`Dziedzina to numery, które automat przyjmuje. Niektórych wrzucić nie wolno, bo przepis by się „zaciął”: dzielenie przez zero nie ma sensu, a pierwiastek kwadratowy z liczby ujemnej nie istnieje wśród liczb rzeczywistych.`,
      r`Miejsce zerowe to numer, po którego wrzuceniu automat oddaje $0$. Na wykresie to miejsce, w którym krzywa przecina oś $x$ — dlatego jest to wartość $x$, a nie $y$.`,
    ],
    method: [
      r`Wartość funkcji: wstaw liczbę w miejsce każdego $x$ (w nawiasie, jeśli jest ujemna) i policz.`,
      'Dziedzina: wypisz warunki — mianownik różny od zera, wyrażenie pod pierwiastkiem kwadratowym nieujemne — i rozwiąż je.',
      r`Miejsca zerowe: rozwiąż równanie $f(x) = 0$ i zostaw tylko rozwiązania z dziedziny.`,
      r`Przecięcie z osią $y$: policz $f(0)$.`,
    ],
    check: {
      question: r`Jaka jest dziedzina funkcji $f(x) = \sqrt{x - 2}$?`,
      answer: r`$x - 2 \ge 0$, czyli $x \in \langle 2, +\infty)$ — pod pierwiastkiem kwadratowym nie może być liczba ujemna.`,
    },
  },
  'fn-graph': {
    idea: [
      r`Wykres to mapa funkcji: każdy punkt $(x, y)$ mówi, że argumentowi $x$ odpowiada wartość $y$. Pozioma oś to „wejście”, pionowa — „wyjście” automatu.`,
      r`Dlatego wszystko, co dotyczy argumentów — dziedzina, miejsca zerowe, przedziały, w których funkcja rośnie — odczytujesz na osi $x$. Wszystko, co dotyczy wartości — zbiór wartości, największa i najmniejsza wartość — na osi $y$.`,
      r`„Rośnie” czytasz jak wędrówkę po górach od lewej do prawej: idziesz pod górę — funkcja rośnie, schodzisz — maleje. Odpowiedź to fragment drogi na mapie, czyli przedział na osi $x$.`,
    ],
    method: [
      r`Dziedzina: od najbardziej lewego do najbardziej prawego punktu wykresu (oś $x$).`,
      r`Zbiór wartości: od najniższego do najwyższego punktu (oś $y$).`,
      r`Monotoniczność: znajdź „szczyty” i „doliny”, podaj przedziały między nimi na osi $x$.`,
      r`Znak funkcji: nad osią $x$ — dodatnia, pod osią — ujemna; granice to miejsca zerowe.`,
      'Sprawdź, czy końce przedziałów należą do wykresu (kropka pełna czy pusta).',
    ],
    check: {
      question: r`Najwyższy punkt wykresu to $(2, 7)$. Co jest największą wartością funkcji, a co argumentem, dla którego jest przyjmowana?`,
      answer: r`Największa wartość to $7$ (oś $y$), przyjmowana dla argumentu $x = 2$ (oś $x$).`,
    },
  },
  'fn-shift': {
    idea: [
      r`Dodanie liczby do całej funkcji, $f(x) + 2$, podnosi każdy punkt wykresu o $2$ — to intuicyjne: każda wartość jest o $2$ większa.`,
      r`Zmiana w środku, $f(x - 3)$, jest mniej intuicyjna. Pomyśl o opóźnieniu: $f(x - 3)$ w chwili $x = 5$ robi to, co $f$ robiła w chwili $2$. Funkcja „spóźnia się” o $3$, więc cały wykres przesuwa się w PRAWO. Minus w nawiasie oznacza ruch w stronę plusów.`,
      r`Oba przesunięcia razem to przesunięcie o wektor $[a, b]$: każdy punkt $(x, y)$ idzie do $(x + a, y + b)$, a wzór to $f(x - a) + b$. Kształt wykresu się nie zmienia — wystarczy przesunąć jeden charakterystyczny punkt, np. wierzchołek.`,
    ],
    method: [
      r`Odczytaj przesunięcie poziome z nawiasu: $f(x - a)$ — o $a$ w prawo, $f(x + a)$ — o $a$ w lewo.`,
      r`Odczytaj przesunięcie pionowe z liczby dodanej na zewnątrz: $+b$ w górę, $-b$ w dół.`,
      'Przesuń charakterystyczny punkt (wierzchołek, punkt przecięcia) o ten wektor.',
      'Narysuj ten sam kształt wokół nowego punktu.',
    ],
    check: {
      question: r`Wykres $y = x^2$ przesunięto o $3$ w prawo i o $1$ w górę. Gdzie jest wierzchołek i jaki jest wzór?`,
      answer: r`Wierzchołek $(0, 0)$ przechodzi w $(3, 1)$, a wzór to $y = (x - 3)^2 + 1$.`,
    },
  },
  'fn-transform': {
    idea: [
      r`Minus na zewnątrz, $-f(x)$, zmienia znak każdej wartości — wykres odbija się w osi $x$ jak w lustrze leżącym na podłodze. Minus w środku, $f(-x)$, zamienia strony — odbicie w osi $y$, jak w lustrze stojącym.`,
      r`$|f(x)|$ działa na WARTOŚCI: wszystko, co było pod osią $x$, zostaje odbite w górę, bo moduł nie przepuszcza liczb ujemnych. Część nad osią się nie zmienia.`,
      r`$f(|x|)$ działa na ARGUMENTY: dla ujemnego $x$ automat dostaje $|x|$, czyli liczbę dodatnią. Lewa połowa wykresu jest więc kopią prawej — wykres staje się symetryczny względem osi $y$.`,
    ],
    method: [
      'Ustal, czy operacja jest na zewnątrz (zmienia wartości) czy w środku (zmienia argumenty).',
      r`$-f(x)$: odbij wykres w osi $x$; $f(-x)$: odbij w osi $y$.`,
      r`$|f(x)|$: części pod osią $x$ odbij w górę, resztę zostaw.`,
      r`$f(|x|)$: usuń lewą połowę, a prawą skopiuj lustrzanie na lewo.`,
      'Liczba rozwiązań równania to liczba punktów wspólnych nowego wykresu z poziomą prostą.',
    ],
    check: {
      question: r`Dla $f(x) = x - 5$ oblicz $|f(2)|$ i $f(|-2|)$.`,
      answer: r`$|f(2)| = |2 - 5| = 3$, a $f(|-2|) = f(2) = -3$. Moduł działa w innym miejscu, więc wyniki są różne.`,
    },
  },
  'fn-compose': {
    idea: [
      r`Złożenie to dwa automaty ustawione jeden za drugim: wynik pierwszego wpada do drugiego. W zapisie $f(g(x))$ pierwszy pracuje $g$ — ten w środku — a jego wynik trafia do $f$.`,
      r`Kolejność ma znaczenie, tak jak w życiu: „założyć skarpetki, potem buty” daje co innego niż odwrotnie. Dla $f(x) = x^2$ i $g(x) = x + 1$: $f(g(2)) = 9$, ale $g(f(2)) = 5$.`,
      r`Wzór złożenia dostajesz, wkładając CAŁY wzór funkcji wewnętrznej w miejsce każdego $x$ w funkcji zewnętrznej — tak jak liczbę, tylko że tu wstawiasz wyrażenie.`,
    ],
    method: [
      r`Ustal, która funkcja jest wewnętrzna (działa pierwsza), a która zewnętrzna.`,
      'Dla liczby: policz najpierw wartość funkcji wewnętrznej, potem zewnętrznej.',
      r`Dla wzoru: w miejsce każdego $x$ we wzorze zewnętrznej wpisz w nawiasie wzór wewnętrznej i uprość.`,
      r`Dziedzina: $x$ musi pasować do funkcji wewnętrznej, a jej wynik — do zewnętrznej.`,
    ],
    check: {
      question: r`Dla $f(x) = 3x$ i $g(x) = x^2$ podaj wzór $f(g(x))$ i $g(f(x))$.`,
      answer: r`$f(g(x)) = 3x^2$, a $g(f(x)) = (3x)^2 = 9x^2$ — to dwie różne funkcje.`,
    },
  },
  'lin-formula': {
    idea: [
      r`Funkcja liniowa opisuje zmianę w stałym tempie. Taksówka: $8$ zł za wejście i $3$ zł za każdy kilometr. Koszt to $3x + 8$ — i każdy kolejny kilometr kosztuje tyle samo.`,
      r`Liczba $b$ ($8$ zł) to stan na starcie, dla $x = 0$ — na wykresie punkt na osi $y$. Liczba $a$ ($3$ zł) to tempo: o ile rośnie wartość przy kroku o $1$ w prawo. Ujemne $a$ oznacza stały spadek.`,
      r`Ponieważ tempo się nie zmienia, wykres jest prostą: każdy krok w prawo to ten sam krok w górę lub w dół. Dlatego do narysowania wystarczą dwa punkty.`,
    ],
    method: [
      r`Odczytaj $b$ — punkt przecięcia z osią $y$: $(0, b)$.`,
      r`Odczytaj $a$ — znak mówi o monotoniczności: $a > 0$ rośnie, $a < 0$ maleje, $a = 0$ stała.`,
      r`Miejsce zerowe: $x = -\frac{b}{a}$ (dla $a \ne 0$).`,
      r`Wykres: zaznacz $(0, b)$, zrób krok $1$ w prawo i $a$ w górę, poprowadź prostą.`,
    ],
    check: {
      question: r`Czy funkcja $f(x) = -2x + 4$ rośnie, czy maleje? Gdzie przecina osie?`,
      answer: r`Maleje, bo $a = -2 < 0$. Oś $y$ w punkcie $(0, 4)$, oś $x$ w $(2, 0)$, bo $-2x + 4 = 0$ daje $x = 2$.`,
    },
  },
  'lin-two-points': {
    idea: [
      r`Nachylenie prostej to stromizna drogi: o ile metrów wznosisz się na każdy metr w poziomie. Między dwoma punktami liczysz to jako „ile w górę” podzielone przez „ile w prawo”.`,
      r`Dla punktów $(1, 2)$ i $(4, 8)$: w prawo o $3$, w górę o $6$, więc na każdy krok w prawo przypadają $2$ w górę — nachylenie $a = 2$. Jeśli droga schodzi w dół, „ile w górę” jest ujemne i nachylenie wychodzi ujemne.`,
      r`Gdy znasz nachylenie, brakuje tylko wysokości startu $b$. Każdy punkt prostej spełnia $y = ax + b$, więc wstawiasz jeden z nich i wyliczasz $b$.`,
    ],
    method: [
      r`Policz nachylenie: $a = \frac{y_2 - y_1}{x_2 - x_1}$ — w liczniku i mianowniku odejmuj w tej samej kolejności.`,
      r`Wstaw jeden punkt do $y = ax + b$ i wylicz $b$.`,
      r`Zapisz wzór $y = ax + b$.`,
      'Sprawdź, czy drugi punkt spełnia wzór.',
    ],
    check: {
      question: r`Jakie nachylenie ma prosta przez punkty $(0, 5)$ i $(2, 1)$?`,
      answer: r`$a = \frac{1 - 5}{2 - 0} = -2$ — prosta opada o $2$ na każdy krok w prawo.`,
    },
  },
  'lin-parallel': {
    idea: [
      'Proste równoległe to dwa tory kolejowe: biegną w tym samym kierunku, więc mają identyczną stromiznę. Różnią się tylko wysokością, na której przecinają oś y.',
      r`Prostopadłość jest mniej oczywista. Obróć prostą o $90^\circ$: krok „$1$ w prawo, $2$ w górę” zamienia się w „$2$ w lewo, $1$ w górę”, czyli nachylenie $-\frac{1}{2}$. Nachylenie się odwraca i zmienia znak — stąd warunek $a_1 \cdot a_2 = -1$.`,
      r`W zadaniu „prosta przez punkt, równoległa (prostopadła) do danej” kierunek dostajesz od danej prostej, a położenie — od punktu.`,
    ],
    method: [
      r`Odczytaj nachylenie danej prostej $a_1$.`,
      r`Równoległa: $a = a_1$; prostopadła: $a = -\frac{1}{a_1}$.`,
      r`Wstaw współrzędne punktu do $y = ax + b$ i wylicz $b$.`,
      'Zapisz wzór i sprawdź iloczyn nachyleń przy prostopadłości.',
    ],
    check: {
      question: r`Jakie nachylenie ma prosta prostopadła do $y = \frac{2}{3}x - 1$?`,
      answer: r`$-\frac{3}{2}$ — odwracasz ułamek i zmieniasz znak; sprawdzenie: $\frac{2}{3} \cdot \left(-\frac{3}{2}\right) = -1$.`,
    },
  },
  'lin-model': {
    idea: [
      'Zadania z treścią o stałym tempie zawsze mają tę samą budowę: coś jest na starcie i coś zmienia się tak samo w każdej jednostce czasu, drogi albo ilości. Start to b, tempo to a.',
      r`Słowa-klucze: „opłata stała”, „abonament”, „na początku” — to $b$. „Za każdą minutę”, „na godzinę”, „za kilometr” — to $a$. Spadek (zbiornik się opróżnia) daje ujemne $a$.`,
      'Porównanie dwóch ofert to dwie proste. Tam, gdzie się przecinają, oferty kosztują tyle samo; po jednej stronie tego punktu tańsza jest jedna, po drugiej — druga.',
    ],
    method: [
      r`Zapisz słownie, co oznacza $x$ i w jakich jednostkach.`,
      r`Wyznacz $b$ (stan na starcie) i $a$ (zmiana na jednostkę) i zapisz wzór.`,
      'Przetłumacz pytanie na równanie albo nierówność i rozwiąż.',
      'Sprawdź, czy wynik ma sens (np. nie jest ujemną liczbą minut) i odpowiedz pełnym zdaniem z jednostką.',
    ],
    check: {
      question: r`Świeca ma $20$ cm i skraca się o $2$ cm na godzinę. Jaki wzór opisuje jej długość po $x$ godzinach i kiedy się wypali?`,
      answer: r`$d(x) = -2x + 20$; $d(x) = 0$ dla $x = 10$ — świeca wypali się po $10$ godzinach.`,
    },
  },
  'lin-param': {
    idea: [
      r`Parametr to liczba, której jeszcze nie znasz, ale która w danej funkcji się nie zmienia. $f(x) = (m - 2)x + 3$ to nie jedna funkcja, tylko cała rodzina — dla każdego $m$ inna prosta.`,
      r`Pytanie „dla jakich $m$ funkcja jest malejąca” to pytanie o współczynniki: funkcja liniowa maleje, gdy $a < 0$. Tłumaczysz więc własność na warunek $m - 2 < 0$ i rozwiązujesz go jak zwykłą nierówność z niewiadomą $m$.`,
      r`Szczególny przypadek to $a = 0$ — wtedy funkcja jest stała: nie rośnie, nie maleje i albo nie ma miejsc zerowych, albo ma ich nieskończenie wiele. Często trzeba go rozpatrzyć osobno.`,
    ],
    method: [
      r`Odczytaj współczynniki $a$ i $b$ jako wyrażenia z parametrem.`,
      r`Zamień żądaną własność na warunek: monotoniczność — znak $a$; miejsce zerowe — $x_0 = -\frac{b}{a}$; punkt na wykresie — podstawienie.`,
      r`Rozwiąż warunek jako równanie lub nierówność z niewiadomą $m$.`,
      r`Rozpatrz osobno przypadek $a = 0$, jeśli ma znaczenie, i zapisz odpowiedź.`,
    ],
    check: {
      question: r`Dla jakich $m$ funkcja $f(x) = (2m + 4)x - 1$ jest rosnąca?`,
      answer: r`Gdy $2m + 4 > 0$, czyli $m > -2$.`,
    },
  },
};

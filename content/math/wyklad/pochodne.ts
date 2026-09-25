import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: rachunek różniczkowy. */
export const WYKLAD_POCHODNE: Record<string, LessonExplanation> = {
  'deriv-limit': {
    idea: [
      r`Granica funkcji w punkcie opisuje, do czego zbliżają się wartości, gdy $x$ podchodzi coraz bliżej danej liczby — a nie to, co dzieje się w samym punkcie. Funkcja $\frac{x^2 - 9}{x - 3}$ w $x = 3$ nie istnieje, ale obok trójki zachowuje się jak $x + 3$, więc jej wartości zbliżają się do $6$.`,
      r`Wstawienie liczby dające „$\frac00$” nie jest wynikiem — to sygnał, że licznik i mianownik mają wspólny czynnik, który się zeruje. Po jego skróceniu wstawiasz jeszcze raz i dostajesz granicę.`,
      'Ciągłość to brak przerw i skoków: wykres da się narysować bez odrywania ołówka. Formalnie: granica w punkcie istnieje i jest równa wartości funkcji. Przy funkcji sklejonej z dwóch wzorów oba kawałki muszą się spotkać w punkcie sklejenia.',
    ],
    method: [
      'Wstaw liczbę do wzoru; jeśli wychodzi liczba — to jest granica.',
      r`Przy $\frac00$ rozłóż licznik i mianownik na czynniki (albo pomnóż przez sprzężenie) i skróć.`,
      'Wstaw ponownie do uproszczonego wyrażenia.',
      'Ciągłość funkcji sklejanej: przyrównaj wartości obu wzorów w punkcie sklejenia.',
    ],
    check: {
      question: r`Oblicz $\lim_{x \to 2} \frac{x^2 - 4}{x - 2}$.`,
      answer: r`$\frac{(x - 2)(x + 2)}{x - 2} = x + 2$, więc granica wynosi $4$.`,
    },
  },
  'deriv-basic': {
    idea: [
      r`Pochodna mierzy, jak szybko zmienia się funkcja w danym miejscu. Jeśli $s(t)$ to przebyta droga, pochodna $s'(t)$ to prędkość w chwili $t$ — to, co pokazuje licznik w samochodzie. Na wykresie to nachylenie: stromo w górę — duża dodatnia pochodna, płasko — zero.`,
      r`Nachylenie „w punkcie” to nachylenie cięciwy łączącej dwa punkty wykresu, gdy drugi punkt podchodzi dowolnie blisko pierwszego. Dla $x^2$ ten iloraz to $\frac{(x + h)^2 - x^2}{h} = 2x + h$, a gdy $h$ maleje do zera, zostaje $2x$. Tak powstaje wzór $(x^n)' = nx^{n-1}$.`,
      r`Stała się nie zmienia, więc jej pochodna to $0$. Stały współczynnik przepisujesz, a pochodna sumy to suma pochodnych — dlatego wielomiany różniczkujesz wyraz po wyrazie.`,
    ],
    method: [
      r`Zapisz funkcję jako sumę potęg, np. $\sqrt x = x^{\frac12}$, $\frac1x = x^{-1}$.`,
      r`Różniczkuj wyraz po wyrazie: $(ax^n)' = anx^{n-1}$, stała daje $0$.`,
      r`Uprość wzór $f'(x)$.`,
      r`Dopiero teraz wstaw liczbę, jeśli pytanie dotyczy $f'(x_0)$.`,
    ],
    check: {
      question: r`Ile wynosi pochodna funkcji $f(x) = 5x^2 - 3x + 7$?`,
      answer: r`$f'(x) = 10x - 3$ — stała $7$ znika.`,
    },
  },
  'deriv-rules': {
    idea: [
      r`Iloczynu nie różniczkuje się po kawałku. Pomyśl o prostokącie o bokach $f$ i $g$, które rosną: przyrost pola to pasek wzdłuż jednego boku ($f' \cdot g$) plus pasek wzdłuż drugiego ($f \cdot g'$). Stąd $(fg)' = f'g + fg'$.`,
      'Wzór na iloraz wynika z tego samego pomysłu, a minus w liczniku bierze się stąd, że wzrost mianownika zmniejsza ułamek. Kolejność w liczniku ma znaczenie: pochodna góry razy dół minus góra razy pochodna dołu.',
      'Funkcja złożona to łańcuch: zmiana x zmienia funkcję wewnętrzną, a ta zmienia zewnętrzną. Tempa się mnożą — jak w rowerze, gdzie obroty pedałów zamieniają się w obroty koła. Stąd reguła łańcuchowa: pochodna zewnętrznej (liczona w funkcji wewnętrznej) razy pochodna wewnętrznej.',
    ],
    method: [
      'Rozpoznaj budowę: iloczyn, iloraz czy złożenie.',
      r`Iloczyn: $f'g + fg'$; iloraz: $\frac{f'g - fg'}{g^2}$.`,
      'Złożenie: różniczkuj od zewnątrz, zostawiając środek bez zmian, i pomnóż przez pochodną środka.',
      'Uprość wynik i dopiero wtedy wstawiaj liczby.',
    ],
    check: {
      question: r`Oblicz pochodną funkcji $f(x) = (3x + 1)^2$ regułą łańcuchową.`,
      answer: r`$2(3x + 1) \cdot 3 = 6(3x + 1)$.`,
    },
  },
  'deriv-tangent': {
    idea: [
      r`Styczna to prosta, która w danym punkcie ma dokładnie to samo nachylenie co wykres — przy bardzo dużym powiększeniu wykres wokół tego punktu zlewa się ze styczną. Jej współczynnik kierunkowy to więc $f'(x_0)$.`,
      r`Prostą wyznaczają nachylenie i jeden punkt. Nachylenie daje pochodna, a punkt — sam wykres: $(x_0, f(x_0))$. Stąd równanie $y = f'(x_0)(x - x_0) + f(x_0)$.`,
      r`Pytania „odwrotne” (gdzie styczna jest pozioma albo równoległa do danej prostej) zamieniają się w równanie z pochodną: styczna pozioma to $f'(x_0) = 0$, równoległa do $y = ax + b$ to $f'(x_0) = a$.`,
    ],
    method: [
      r`Policz $f(x_0)$ — drugą współrzędną punktu styczności.`,
      r`Policz $f'(x)$ i wstaw $x_0$ — to nachylenie stycznej.`,
      r`Zapisz $y = f'(x_0)(x - x_0) + f(x_0)$ i uprość.`,
      r`Gdy znasz nachylenie, a szukasz punktu, rozwiąż $f'(x_0) = a$.`,
    ],
    check: {
      question: r`Jaki współczynnik kierunkowy ma styczna do wykresu $f(x) = x^2$ w punkcie o odciętej $x_0 = 3$?`,
      answer: r`$f'(x) = 2x$, więc $f'(3) = 6$.`,
    },
  },
  'deriv-monotonic': {
    idea: [
      r`Znak pochodnej mówi, w którą stronę idzie wykres: pochodna dodatnia — wykres się wspina, ujemna — schodzi. Pytanie, gdzie funkcja rośnie, sprowadza się więc do pytania, gdzie $f'(x) > 0$.`,
      'Pochodna wielomianu jest wielomianem niższego stopnia — często kwadratowym. Jej znak odczytujesz z wykresu (parabola) albo wężykiem, tak jak w zwykłej nierówności.',
      'Miejsca zerowe pochodnej to potencjalne szczyty i doliny — punkty, w których wykres przestaje rosnąć i zaczyna maleć (albo odwrotnie). Wyznaczają granice przedziałów monotoniczności.',
    ],
    method: [
      'Wyznacz dziedzinę funkcji.',
      r`Policz $f'(x)$ i zapisz ją w postaci iloczynowej.`,
      r`Zbadaj znak $f'$ (wężyk, parabola).`,
      r`$f' > 0$ — funkcja rośnie, $f' < 0$ — maleje; przedziałów rozdzielonych dziurą w dziedzinie nie łącz.`,
    ],
    check: {
      question: r`W jakim przedziale rośnie funkcja $f(x) = x^2 - 6x$?`,
      answer: r`$f'(x) = 2x - 6 > 0$ dla $x > 3$, więc funkcja rośnie w $\langle 3, +\infty)$.`,
    },
  },
  'deriv-extrema': {
    idea: [
      'Na szczycie góry droga przestaje iść w górę i zaczyna schodzić — w tym jednym miejscu jest płasko. Dlatego w ekstremum lokalnym pochodna jest zerem. To jednak za mało: na „schodku”, gdzie droga na chwilę się wypłaszcza, a potem dalej pnie się w górę, pochodna też jest zerem, a szczytu nie ma.',
      r`Rozstrzyga zmiana znaku pochodnej: z plusa na minus (najpierw w górę, potem w dół) — maksimum; z minusa na plus — minimum; bez zmiany — brak ekstremum, jak dla $x^3$ w zerze.`,
      'Wartość największa na przedziale domkniętym to coś innego niż maksimum lokalne. Szukasz jej wśród kandydatów: ekstremów wewnątrz przedziału i wartości na obu końcach — bo najwyższy punkt może leżeć na brzegu.',
    ],
    method: [
      r`Policz $f'(x)$ i rozwiąż $f'(x) = 0$.`,
      r`Zbadaj znak $f'$ wokół każdego miejsca zerowego: zmiana z $+$ na $-$ to maksimum, z $-$ na $+$ — minimum.`,
      r`Wartości ekstremów: wstaw argumenty do $f$, a nie do $f'$.`,
      'Na przedziale domkniętym porównaj wartości w ekstremach i na końcach.',
    ],
    check: {
      question: r`Czy funkcja $f(x) = x^3$ ma ekstremum w $x = 0$?`,
      answer: r`Nie: $f'(x) = 3x^2$ jest zerem w $0$, ale po obu stronach jest dodatnia — pochodna nie zmienia znaku.`,
    },
  },
  'deriv-optimization': {
    idea: [
      'Zadanie optymalizacyjne pyta o najlepszy wybór: największą objętość, najmniejszy koszt, najkrótszą drogę. Rachunek różniczkowy mówi, gdzie funkcja osiąga ekstremum — trzeba tylko przetłumaczyć treść na funkcję jednej zmiennej.',
      'Najtrudniejszy jest pierwszy krok. W treści zwykle są dwie zmienne (np. promień i wysokość puszki) i warunek, który je łączy (stała objętość). Z warunku wyliczasz jedną zmienną przez drugą — i funkcja celu zależy już tylko od jednej.',
      'Dziedzina wynika z sensu zadania: długości są dodatnie, wycięty kwadrat nie może być większy niż połowa kartki. Jeśli w tej dziedzinie jest tylko jedno ekstremum lokalne i jest to maksimum, to jest to wartość największa — ale trzeba to uzasadnić znakiem pochodnej.',
    ],
    method: [
      r`Wybierz zmienną $x$ i zapisz pozostałe wielkości przez nią (z warunku w treści).`,
      r`Zapisz funkcję celu $f(x)$ i jej dziedzinę wynikającą z treści.`,
      r`Policz $f'(x)$ i znajdź jej miejsca zerowe w dziedzinie.`,
      'Uzasadnij znakiem pochodnej, że to maksimum (albo minimum) i że jest to wartość największa (najmniejsza).',
      'Odpowiedz na pytanie: podaj wymiary albo wartość, o którą pytano.',
    ],
    check: {
      question: r`W zadaniu o puszce objętość to $\pi r^2 h = 16\pi$. Jak zapisać wysokość $h$ przez promień $r$?`,
      answer: r`$h = \frac{16}{r^2}$ — wtedy pole powierzchni zależy już tylko od $r$.`,
    },
  },
};

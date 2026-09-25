import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: funkcja wykładnicza i logarytmy. */
export const WYKLAD_WYKLADNICZA: Record<string, LessonExplanation> = {
  'exp-function': {
    idea: [
      r`W funkcji wykładniczej zmienna siedzi w wykładniku, więc każdy krok w prawo to mnożenie przez tę samą liczbę $a$. Dla $2^x$: $1, 2, 4, 8, 16$ — każda następna wartość dwa razy większa. Tak rosną bakterie, plotki i oszczędności na lokacie.`,
      r`Wykres zawsze przechodzi przez $(0, 1)$, bo każda dodatnia liczba do potęgi zerowej daje $1$. W lewo wartości się dzielą: $2^{-1} = \frac12$, $2^{-2} = \frac14$… Coraz bliżej zera, ale nigdy zero. Dlatego wykres leży nad osią $x$, a oś $x$ jest asymptotą.`,
      r`Podstawa decyduje o kierunku: $a > 1$ — mnożenie przez liczbę większą od $1$, funkcja rośnie; $0 < a < 1$ — mnożenie przez ułamek, funkcja maleje. Wykres $\left(\frac12\right)^x$ to lustrzane odbicie $2^x$ względem osi $y$.`,
    ],
    method: [
      r`Sprawdź podstawę: $a > 1$ — rośnie, $0 < a < 1$ — maleje.`,
      r`Zaznacz punkt $(0, 1)$ i jeszcze dwa: dla $x = 1$ wartość $a$, dla $x = -1$ wartość $\frac{1}{a}$.`,
      r`Narysuj krzywą zbliżającą się do asymptoty $y = 0$ (albo $y = q$ po przesunięciu).`,
      r`Przy przesunięciu $a^{x - p} + q$ przesuń punkt $(0, 1)$ i asymptotę o wektor $[p, q]$.`,
    ],
    check: {
      question: r`Ile wynosi $f(-3)$ dla $f(x) = 2^x$? Czy funkcja wykładnicza może przyjąć wartość ujemną?`,
      answer: r`$2^{-3} = \frac18$. Nie — funkcja wykładnicza jest zawsze dodatnia.`,
    },
  },
  'exp-equations': {
    idea: [
      r`Funkcja wykładnicza o podstawie różnej od $1$ jest różnowartościowa: różne wykładniki dają różne wyniki. Jeśli więc $2^{u} = 2^{w}$, to $u = w$. Całe rozwiązywanie polega na doprowadzeniu obu stron do tej samej podstawy.`,
      r`Podstawę zmieniasz prawami potęg: $8 = 2^3$, $\frac14 = 2^{-2}$, $\sqrt2 = 2^{\frac12}$, $4^x = 2^{2x}$. Warto pamiętać kolejne potęgi $2$, $3$ i $5$.`,
      r`Gdy w równaniu są różne potęgi tej samej wielkości, np. $4^x$ i $2^x$, podstawienie $t = 2^x$ zamienia je w równanie kwadratowe. Ponieważ $2^x$ jest zawsze dodatnie, ujemne $t$ odrzucasz.`,
    ],
    method: [
      'Zapisz obie strony jako potęgi tej samej podstawy.',
      'Przyrównaj wykładniki i rozwiąż powstałe równanie.',
      r`Jeśli widzisz $a^{2x}$ i $a^x$, podstaw $t = a^x$ z warunkiem $t > 0$.`,
      'Sprawdź wynik w równaniu wyjściowym.',
    ],
    check: {
      question: r`Rozwiąż $9^x = 27$.`,
      answer: r`$3^{2x} = 3^3$, więc $2x = 3$ i $x = \frac32$.`,
    },
  },
  'exp-model': {
    idea: [
      r`Wzrost wykładniczy to wzrost „procent od procentu”. Lokata na $10\%$: po roku masz $110\%$ kwoty, po dwóch — $110\%$ z tego, czyli $1{,}1^2 = 1{,}21$ kwoty. Odsetki z pierwszego roku same zarabiają w drugim.`,
      r`Dlatego po $n$ okresach wartość to $K_0 \cdot (1 + r)^n$, gdzie $r$ to procent na okres zapisany ułamkiem. Przy spadku (rozpad, wydalanie leku) czynnik jest mniejszy od $1$: $(1 - r)^n$.`,
      r`„Połowa co 4 godziny” to też model wykładniczy: po każdych czterech godzinach mnożysz przez $\frac12$. Nie odejmujesz stałej ilości — odejmujesz stały ułamek tego, co zostało.`,
    ],
    method: [
      r`Ustal wartość początkową $K_0$, procent na okres $r$ i liczbę okresów $n$.`,
      'Przy kapitalizacji częstszej niż raz w roku podziel oprocentowanie roczne przez liczbę okresów w roku, a liczbę lat pomnóż przez tę liczbę.',
      r`Policz $K_0 \cdot (1 \pm r)^n$.`,
      'Zaokrąglaj dopiero na końcu, tak jak każe polecenie.',
    ],
    check: {
      question: r`Ile będzie na lokacie po $2$ latach z $2000$ zł przy $10\%$ rocznie i kapitalizacji rocznej?`,
      answer: r`$2000 \cdot 1{,}1^2 = 2000 \cdot 1{,}21 = 2420$ zł.`,
    },
  },
  'log-basic': {
    idea: [
      r`Logarytm to pytanie „do jakiej potęgi?”. Wiesz, że $2^5 = 32$. Logarytm odwraca to pytanie: jaką potęgę trzeba nałożyć na $2$, żeby dostać $32$? Odpowiedź $5$ zapisujesz jako $\log_2 32 = 5$.`,
      r`Tak jak odejmowanie cofa dodawanie, logarytm cofa potęgowanie — odzyskuje wykładnik. Każde zdanie o logarytmie da się przepisać na zdanie o potędze: $\log_a b = c$ znaczy dokładnie $a^c = b$.`,
      r`Stąd ograniczenia. Potęga dodatniej podstawy jest zawsze dodatnia, więc logarytm liczby ujemnej ani zera nie istnieje. Podstawa musi być dodatnia i różna od $1$ — bo $1$ do dowolnej potęgi daje $1$ i pytanie traci sens.`,
    ],
    method: [
      r`Przepisz $\log_a b = ?$ na pytanie $a^{?} = b$.`,
      r`Zapisz $a$ i $b$ jako potęgi tej samej liczby, np. $4 = 2^2$, $8 = 2^3$.`,
      'Porównaj wykładniki i odczytaj wynik.',
      'Sprawdź: podnieś podstawę do otrzymanej potęgi.',
    ],
    check: {
      question: r`Ile wynosi $\log_5 125$, a ile $\log_5 \frac15$?`,
      answer: r`$3$, bo $5^3 = 125$; oraz $-1$, bo $5^{-1} = \frac15$.`,
    },
  },
  'log-properties': {
    idea: [
      r`Logarytmy to wykładniki, więc zachowują się jak wykładniki. Przy mnożeniu potęg o tej samej podstawie wykładniki się dodają — dlatego logarytm iloczynu to suma logarytmów: $\log_a(xy) = \log_a x + \log_a y$.`,
      r`Tak samo dzielenie potęg to odejmowanie wykładników (logarytm ilorazu to różnica logarytmów), a potęga potęgi to mnożenie wykładników ($\log_a x^k = k\log_a x$). Nie ma tu nic nowego — to prawa potęg zapisane od strony wykładnika.`,
      'Dzięki temu logarytmy zamieniają mnożenie na dodawanie. Zanim powstały kalkulatory, inżynierowie mnożyli wielkie liczby, dodając ich logarytmy odczytane z tablic.',
    ],
    method: [
      'Sprawdź, czy logarytmy mają tę samą podstawę; jeśli nie — zmień podstawę wzorem.',
      'Sumę logarytmów zamień na logarytm iloczynu, różnicę — na logarytm ilorazu.',
      'Współczynnik przed logarytmem przenieś do wykładnika (albo odwrotnie).',
      'Policz logarytm z otrzymanej, zwykle „ładnej” liczby.',
    ],
    check: {
      question: r`Oblicz $\log_2 12 - \log_2 3$.`,
      answer: r`$\log_2 \frac{12}{3} = \log_2 4 = 2$.`,
    },
  },
  'log-function': {
    idea: [
      r`Funkcja logarytmiczna robi odwrotnie niż wykładnicza: $2^x$ zamienia wykładnik na wynik, a $\log_2 x$ — wynik z powrotem na wykładnik. Dlatego punkt $(3, 8)$ na wykresie $2^x$ odpowiada punktowi $(8, 3)$ na wykresie $\log_2 x$ — współrzędne zamieniają się miejscami.`,
      r`Zamiana współrzędnych to odbicie względem prostej $y = x$. Z tego odbicia wynika wszystko: punkt $(0, 1)$ przechodzi w $(1, 0)$, asymptota pozioma $y = 0$ — w pionową $x = 0$, a zbiór wartości $(0, +\infty)$ — w dziedzinę.`,
      r`Logarytm rośnie bez końca, ale bardzo powoli: $\log x$ (podstawa $10$) osiąga $6$ dopiero dla miliona. Dlatego skale logarytmiczne, jak decybele, mieszczą ogromne zakresy.`,
    ],
    method: [
      r`Dziedzina: argument logarytmu musi być dodatni — rozwiąż nierówność $g(x) > 0$.`,
      r`Monotoniczność: podstawa $a > 1$ — rośnie, $0 < a < 1$ — maleje.`,
      r`Punkty do szkicu: $(1, 0)$, $(a, 1)$, $\left(\frac{1}{a}, -1\right)$ oraz asymptota $x = 0$ (albo przesunięta).`,
      r`Nieznaną podstawę wyznacz z punktu wykresu: $\log_a x_0 = y_0$ znaczy $a^{y_0} = x_0$.`,
    ],
    check: {
      question: r`Jaka jest dziedzina funkcji $f(x) = \log_3 (x + 2)$?`,
      answer: r`$x + 2 > 0$, czyli $x \in (-2, +\infty)$.`,
    },
  },
  'log-equations': {
    idea: [
      r`Równania logarytmiczne rozwiązujesz tą samą zasadą co wykładnicze: funkcja logarytmiczna jest różnowartościowa, więc $\log_a u = \log_a w$ oznacza $u = w$. Trzeba tylko sprowadzić obie strony do jednego logarytmu o tej samej podstawie.`,
      r`Pułapka: przekształcenia mogą poszerzyć dziedzinę. $\log_2 (x - 1) + \log_2 (x + 1)$ wymaga $x > 1$, a $\log_2 (x^2 - 1)$ — tylko $|x| > 1$. Dlatego dziedzinę wyznaczasz z równania WYJŚCIOWEGO i sprawdzasz wyniki na końcu.`,
      r`Przy nierównościach dochodzi kierunek: funkcja rosnąca (podstawa większa od $1$) zachowuje znak nierówności, a malejąca (podstawa między $0$ a $1$) go odwraca — tak jak mnożenie przez liczbę ujemną.`,
    ],
    method: [
      'Wyznacz dziedzinę z równania wyjściowego: argumenty logarytmów dodatnie.',
      r`Sprowadź obie strony do postaci $\log_a(\ldots)$ albo $a^{(\ldots)}$ o tej samej podstawie.`,
      r`Porównaj argumenty (albo wykładniki); przy nierówności z podstawą z przedziału $(0, 1)$ odwróć znak.`,
      'Rozwiąż i odrzuć wyniki spoza dziedziny.',
    ],
    check: {
      question: r`Rozwiąż $\log_3 (2x - 1) = 2$.`,
      answer: r`Dziedzina: $x > \frac12$. $2x - 1 = 3^2 = 9$, więc $x = 5$ — należy do dziedziny.`,
    },
  },
};

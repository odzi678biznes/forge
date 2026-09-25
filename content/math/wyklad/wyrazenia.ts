import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: wyrażenia algebraiczne. */
export const WYKLAD_WYRAZENIA: Record<string, LessonExplanation> = {
  'alg-expand': {
    idea: [
      r`Wzór $(a + b)^2 = a^2 + 2ab + b^2$ najłatwiej zobaczyć na obrazku. Kwadrat o boku $a + b$ dzielisz na cztery części: kwadrat $a \times a$, kwadrat $b \times b$ i dwa prostokąty $a \times b$. Pole całości to suma części — a dwa prostokąty to właśnie $2ab$, o którym najczęściej się zapomina.`,
      r`Różnica kwadratów $(a - b)(a + b) = a^2 - b^2$ to przypadek, w którym środkowe wyrazy się znoszą: $+ab$ i $-ab$ dają zero. Dlatego sprzężenie usuwa pierwiastki: $(\sqrt3 - 1)(\sqrt3 + 1) = 3 - 1 = 2$.`,
      r`Litery $a$ i $b$ to „pudełka” — możesz do nich włożyć cokolwiek, np. $2x$ albo $\sqrt5$. Wzór działa tak samo, trzeba tylko całe pudełko podnieść do kwadratu.`,
    ],
    method: [
      'Rozpoznaj wzór: kwadrat sumy, kwadrat różnicy czy różnica kwadratów.',
      r`Ustal, co jest $a$, a co $b$ — razem ze współczynnikami i znakami.`,
      r`Podstaw do wzoru; potęga obejmuje cały wyraz, np. $(3x)^2 = 9x^2$.`,
      r`Uprość i sprawdź wynik na jednej liczbie, np. $x = 1$.`,
    ],
    check: {
      question: r`Rozwiń $(3x + 2)^2$.`,
      answer: r`$9x^2 + 12x + 4$: $(3x)^2 = 9x^2$, podwojony iloczyn $2 \cdot 3x \cdot 2 = 12x$, a $2^2 = 4$.`,
    },
  },
  'alg-factor': {
    idea: [
      r`Rozkład na czynniki to mnożenie „od tyłu”. Wiesz, że $3x(2x + 3) = 6x^2 + 9x$; rozkład pyta odwrotnie: z jakiego iloczynu powstała ta suma?`,
      r`Po co iloczyn? Bo iloczyn jest zerem tylko wtedy, gdy któryś czynnik jest zerem. Równanie $x(x - 5) = 0$ rozwiązujesz w pamięci: $x = 0$ albo $x = 5$. Z zapisu $x^2 - 5x = 0$ tego od razu nie widać.`,
      r`Rozkładanie przypomina rozkład liczby na czynniki pierwsze: $12 = 2 \cdot 2 \cdot 3$. Szukasz „cegiełek”, z których zbudowane jest wyrażenie — najpierw wspólnych dla wszystkich wyrazów, potem tych ze wzorów skróconego mnożenia.`,
    ],
    method: [
      r`Wyłącz przed nawias wspólny czynnik: liczbę i najniższą potęgę $x$.`,
      'Sprawdź, czy w nawiasie jest wzór skróconego mnożenia, np. różnica kwadratów.',
      'Przy czterech wyrazach spróbuj grupowania po dwa.',
      'Sprawdź wynik, wymnażając z powrotem.',
    ],
    check: {
      question: r`Rozłóż na czynniki $2x^2 - 8$.`,
      answer: r`$2(x^2 - 4) = 2(x - 2)(x + 2)$ — najpierw wspólna dwójka, potem różnica kwadratów.`,
    },
  },
  'alg-rational': {
    idea: [
      'Wyrażenie wymierne to ułamek z literami i działa jak zwykły ułamek. Jedyna nowość: przez zero się nie dzieli, więc zanim zaczniesz liczyć, sprawdzasz, jakich liczb nie wolno podstawić.',
      r`Skracać można tylko to, co jest pomnożone. W $\frac{6}{9} = \frac{2 \cdot 3}{3 \cdot 3}$ trójka jest czynnikiem licznika i mianownika, więc się skraca. W $\frac{x + 2}{x}$ iks w liczniku jest dodany, a nie pomnożony — tego skrócić nie wolno. Dlatego najpierw rozkładasz licznik i mianownik na czynniki.`,
      r`Zakazana liczba nie znika po skróceniu. $\frac{(x - 3)(x + 3)}{x + 3}$ i $x - 3$ dają te same wyniki dla wszystkich liczb poza $x = -3$ — tam pierwsze wyrażenie nie ma sensu. Dlatego dziedzinę zapisujesz przed skracaniem.`,
    ],
    method: [
      'Wyznacz dziedzinę: przyrównaj mianownik do zera i wyrzuć te liczby.',
      'Rozłóż licznik i mianownik na czynniki.',
      'Skróć wspólne czynniki — nigdy składniki.',
      'Przy dodawaniu sprowadź do wspólnego mianownika, dodaj liczniki i uprość.',
      'Zapisz wynik razem z dziedziną.',
    ],
    check: {
      question: r`Dla jakich $x$ wyrażenie $\frac{x}{x^2 - 1}$ ma sens?`,
      answer: r`Dla $x \ne 1$ i $x \ne -1$, bo $x^2 - 1 = (x - 1)(x + 1)$ zeruje się właśnie w tych punktach.`,
    },
  },
  'alg-cubes': {
    idea: [
      r`Sześcian sumy $(a + b)^3$ to $(a + b)^2 \cdot (a + b)$ — możesz go wyprowadzić, mnożąc wzór na kwadrat sumy jeszcze raz przez $(a + b)$. Współczynniki $1, 3, 3, 1$ pochodzą z trójkąta Pascala: każda liczba to suma dwóch stojących nad nią.`,
      r`Różnica sześcianów $a^3 - b^3$ zawsze dzieli się przez $(a - b)$, bo dla $a = b$ jest równa zeru. Drugi czynnik $a^2 + ab + b^2$ dostajesz z dzielenia. Tak samo suma sześcianów dzieli się przez $(a + b)$.`,
      r`W przeciwieństwie do sumy kwadratów suma sześcianów się rozkłada, bo $a^3 + b^3$ zeruje się dla $a = -b$. Drugi nawias, np. $x^2 - 2x + 4$, ma ujemny wyróżnik i dalej się nie rozkłada.`,
    ],
    method: [
      'Rozpoznaj: sześcian sumy lub różnicy (nawias do trzeciej) czy suma lub różnica sześcianów (dwa wyrazy).',
      r`Zapisz wyrazy jako sześciany: $27x^3 = (3x)^3$, $8 = 2^3$.`,
      r`Podstaw do wzoru, pilnując znaków: w $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$ drugi nawias ma same plusy.`,
      r`Sprawdź na liczbie, np. $x = 1$.`,
    ],
    check: {
      question: r`Rozłóż na czynniki $x^3 - 1$.`,
      answer: r`$(x - 1)(x^2 + x + 1)$ — różnica sześcianów z $a = x$ i $b = 1$.`,
    },
  },
  'alg-irrational': {
    idea: [
      r`Liczba z pierwiastkiem w mianowniku jest poprawna, ale nieporęczna — trudno ją porównać albo dodać do innej. Pozbywasz się go, mnożąc ułamek przez jedynkę zapisaną sprytnie, np. $\frac{\sqrt5 + 1}{\sqrt5 + 1}$. Wartość się nie zmienia, a mianownik staje się liczbą wymierną.`,
      r`Dlaczego akurat sprzężenie? Bo $(\sqrt5 - 1)(\sqrt5 + 1) = 5 - 1 = 4$ — to różnica kwadratów, a kwadrat pierwiastka nie ma już pierwiastka.`,
      r`Druga zasada: $\sqrt{a^2} = |a|$. Pierwiastek z kwadratu cofa kwadrat tylko co do wielkości, a znak zawsze wychodzi nieujemny. Dlatego przed zdjęciem modułu sprawdzasz, czy wyrażenie w środku jest dodatnie, czy ujemne.`,
    ],
    method: [
      'Pojedynczy pierwiastek w mianowniku: pomnóż licznik i mianownik przez ten pierwiastek.',
      'Suma albo różnica z pierwiastkiem: pomnóż przez sprzężenie, czyli ten sam nawias z przeciwnym znakiem.',
      'W mianowniku zastosuj różnicę kwadratów i uprość.',
      r`Przy $\sqrt{(\ldots)^2}$ zapisz moduł i ustal znak wyrażenia, zanim go zdejmiesz.`,
    ],
    check: {
      question: r`Ile wynosi $\sqrt{(2 - \sqrt5)^2}$?`,
      answer: r`$|2 - \sqrt5| = \sqrt5 - 2$, bo $\sqrt5 \approx 2{,}24 > 2$, więc $2 - \sqrt5 < 0$.`,
    },
  },
};

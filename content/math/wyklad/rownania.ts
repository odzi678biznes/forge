import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: równania i nierówności. */
export const WYKLAD_ROWNANIA: Record<string, LessonExplanation> = {
  'eq-linear': {
    idea: [
      r`Równanie to pytanie: jaka liczba ukrywa się pod literą $x$? $3x + 2 = 11$ czytasz: „trzy razy pewna liczba, plus dwa, daje jedenaście”. Rozwiązywanie to odkrycie, co zrobiono z niewiadomą, i cofnięcie tych kroków w odwrotnej kolejności.`,
      r`Na $x$ najpierw zadziałało mnożenie przez $3$, potem dodanie $2$. Cofasz od końca: odejmujesz $2$ (zostaje $3x = 9$), potem dzielisz przez $3$ ($x = 3$). Każdy krok robisz po obu stronach — jak na wadze, z której zdejmujesz ten sam ciężar z obu szalek.`,
      r`Jeśli $x$ zniknie z obu stron, zostaje zdanie o samych liczbach: prawdziwe ($0 = 0$ — pasuje każda liczba) albo fałszywe ($0 = 5$ — nie pasuje żadna).`,
    ],
    method: [
      'Pozbądź się nawiasów (wymnóż) i ułamków (pomnóż obie strony przez wspólny mianownik — każdy wyraz).',
      r`Wyrazy z $x$ przenieś na jedną stronę, liczby na drugą; przy przenoszeniu zmieniasz znak.`,
      r`Podziel obie strony przez współczynnik przy $x$.`,
      'Sprawdź: podstaw wynik do równania wyjściowego.',
    ],
    check: {
      question: r`Rozwiąż $5x - 3 = 2x + 9$.`,
      answer: r`$3x = 12$, więc $x = 4$. Sprawdzenie: $5 \cdot 4 - 3 = 17$ i $2 \cdot 4 + 9 = 17$.`,
    },
  },
  'ineq-linear': {
    idea: [
      r`Nierówność $x > 3$ nie ma jednego rozwiązania, tylko nieskończenie wiele: $4$, $3{,}5$, $100$… Dlatego wynik zapisujesz jako przedział — kawałek osi liczbowej.`,
      r`Dlaczego mnożenie przez liczbę ujemną odwraca znak? Weź prawdziwą nierówność $2 < 5$ i pomnóż obie strony przez $-1$: dostajesz $-2$ i $-5$. Na osi $-2$ leży na prawo od $-5$, więc teraz $-2 > -5$. Mnożenie przez minus odbija liczby w lustrze wokół zera — i kolejność się odwraca.`,
      'Poza tym jednym wyjątkiem ruchy są takie jak w równaniu: dodawanie, odejmowanie oraz mnożenie i dzielenie przez liczbę dodatnią nie zmieniają znaku nierówności.',
    ],
    method: [
      'Uprość obie strony jak w równaniu (nawiasy, ułamki).',
      r`Przenieś wyrazy z $x$ na jedną stronę, liczby na drugą.`,
      r`Podziel przez współczynnik przy $x$; jeśli jest ujemny, odwróć znak nierówności.`,
      r`Zapisz przedział: nawias ostry przy $\le$ i $\ge$, okrągły przy $<$, $>$ i przy nieskończoności.`,
      'Sprawdź jedną liczbę z przedziału i jedną spoza niego.',
    ],
    check: {
      question: r`Rozwiąż $-3x + 1 < 7$.`,
      answer: r`$-3x < 6$; dzielisz przez $-3$ i odwracasz znak: $x > -2$, czyli $x \in (-2, +\infty)$.`,
    },
  },
  'eq-system': {
    idea: [
      r`Jedno równanie z dwiema niewiadomymi, np. $x + y = 10$, ma mnóstwo rozwiązań: $1$ i $9$, $2$ i $8$, $4{,}5$ i $5{,}5$… Drugie równanie to dodatkowa wskazówka, która wybiera z nich jedną parę.`,
      'Obie metody robią to samo: zamieniają dwa równania z dwiema niewiadomymi na jedno równanie z jedną niewiadomą. Podstawianie wkłada jedną niewiadomą wyrażoną przez drugą, a przeciwne współczynniki sprawiają, że po dodaniu równań jedna niewiadoma znika.',
      'Każde równanie liniowe z dwiema niewiadomymi to prosta na płaszczyźnie. Rozwiązanie układu to punkt wspólny dwóch prostych — dlatego może być jeden, żaden (proste równoległe) albo nieskończenie wiele (ta sama prosta).',
    ],
    method: [
      'Uporządkuj równania: niewiadome po lewej, liczby po prawej.',
      r`Wybierz metodę: podstawianie, gdy któraś niewiadoma ma współczynnik $1$ lub $-1$; w innym wypadku przeciwne współczynniki.`,
      'Wylicz jedną niewiadomą, wstaw ją do prostszego równania i wylicz drugą.',
      'Sprawdź parę w obu równaniach.',
    ],
    check: {
      question: r`Rozwiąż układ $x + y = 7$, $x - y = 3$.`,
      answer: r`Dodajesz równania stronami: $2x = 10$, więc $x = 5$, a z pierwszego równania $y = 2$.`,
    },
  },
  'eq-rational': {
    idea: [
      r`Równanie wymierne ma $x$ w mianowniku. Rachunek jest znajomy — mnożysz przez mianownik i zostaje zwykłe równanie. Ale tym mnożeniem możesz „przemycić” liczbę, która w wyjściowym równaniu oznaczała dzielenie przez zero.`,
      r`Ułamek jest zerem tylko wtedy, gdy zerem jest licznik (a mianownik nie). $\frac{x - 3}{x + 1} = 0$ daje $x = 3$ — nic więcej nie trzeba liczyć.`,
      'Dziedzina działa jak lista zakazanych liczb: zapisujesz ją na początku, a na końcu sprawdzasz, czy któreś rozwiązanie nie jest na tej liście.',
    ],
    method: [
      'Wyznacz dziedzinę: wyklucz liczby zerujące mianowniki.',
      r`Jeśli po jednej stronie jest $0$, przyrównaj licznik do zera; w proporcji mnóż „na krzyż”; w pozostałych przypadkach pomnóż obie strony przez wspólny mianownik.`,
      'Rozwiąż otrzymane równanie.',
      'Odrzuć rozwiązania spoza dziedziny.',
    ],
    check: {
      question: r`Rozwiąż $\frac{x^2 - 1}{x - 1} = 0$.`,
      answer: r`Dziedzina: $x \ne 1$. Licznik zeruje się dla $x = 1$ i $x = -1$, ale $1$ jest zakazane — zostaje $x = -1$.`,
    },
  },
  'eq-abs': {
    idea: [
      r`Moduł zmienia charakter w punkcie, w którym wyrażenie w środku zmienia znak. $|x - 1|$ dla $x \ge 1$ to po prostu $x - 1$, a dla $x < 1$ to $-(x - 1) = 1 - x$. Jeśli wiesz, po której stronie punktu jesteś, moduł znika.`,
      'Stąd metoda przedziałów: punkty krytyczne dzielą oś na kawałki, a w każdym kawałku każdy moduł ma stały znak. W każdym przedziale rozwiązujesz więc zwykłe równanie liniowe.',
      'Pułapka: rachunek w przedziale może dać liczbę spoza tego przedziału. Taka liczba nie jest rozwiązaniem — tam moduły mają inne znaki, niż założyłeś.',
    ],
    method: [
      'Znajdź punkty krytyczne: przyrównaj do zera wyrażenie pod każdym modułem.',
      'Podziel oś na przedziały i w każdym ustal znak wyrażeń pod modułami.',
      'Zdejmij moduły: dodatnie bez zmian, ujemne z minusem przed nawiasem.',
      'Rozwiąż równanie w każdym przedziale i zostaw tylko wyniki należące do tego przedziału.',
      'Zbierz rozwiązania ze wszystkich przedziałów.',
    ],
    check: {
      question: r`Ile rozwiązań ma równanie $|x - 2| = 3$?`,
      answer: r`Dwa: z $x - 2 = 3$ wychodzi $x = 5$, a z $x - 2 = -3$ wychodzi $x = -1$.`,
    },
  },
  'eq-system-param': {
    idea: [
      'Układ dwóch równań liniowych to dwie proste. Parametr zmienia ich nachylenie albo położenie, a pytanie o liczbę rozwiązań to pytanie, czy proste się przetną.',
      r`Proste się przecinają, gdy mają różne nachylenie. Nachylenie zależy tylko od współczynników przy $x$ i $y$, dlatego najpierw porównujesz lewe strony równań. Wyznacznik $W = a_1b_2 - a_2b_1$ jest zerem dokładnie wtedy, gdy lewe strony są proporcjonalne, czyli proste są równoległe.`,
      'Równoległe proste mogą być różne (brak punktów wspólnych) albo się pokrywać (nieskończenie wiele punktów wspólnych). Rozstrzygają wyrazy wolne: jeśli całe równania są proporcjonalne, to ta sama prosta.',
    ],
    method: [
      r`Zapisz układ w postaci $a_1x + b_1y = c_1$, $a_2x + b_2y = c_2$.`,
      r`Policz wyznacznik $W = a_1b_2 - a_2b_1$ w zależności od parametru.`,
      r`$W \ne 0$: dokładnie jedno rozwiązanie.`,
      r`$W = 0$: wstaw ten parametr do układu i sprawdź, czy równania są proporcjonalne także z wyrazami wolnymi (nieskończenie wiele rozwiązań), czy nie (brak rozwiązań).`,
    ],
    check: {
      question: r`Dla jakiego $m$ układ $x + y = 1$, $2x + my = 5$ nie ma dokładnie jednego rozwiązania? Ile ma wtedy rozwiązań?`,
      answer: r`$W = 1 \cdot m - 2 \cdot 1 = m - 2$, więc $m = 2$. Wtedy $2x + 2y = 5$ nie jest dwukrotnością $x + y = 1$ (to dałoby $2x + 2y = 2$) — układ nie ma rozwiązań.`,
    },
  },
};

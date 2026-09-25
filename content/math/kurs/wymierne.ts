import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział: Funkcje wymierne.
 *
 * Proporcjonalność odwrotna (podstawa), przesunięta hiperbola z asymptotami
 * oraz równania i nierówności wymierne (rozszerzenie).
 */

const r = String.raw;

export const RAT_TOPIC: Topic = {
  id: 'math-rational',
  subjectId: 'math',
  name: 'Funkcje wymierne',
  summary: 'Proporcjonalność odwrotna, hiperbola i jej przesunięcia, asymptoty, równania i nierówności wymierne.',
};

export const RAT_SKILLS: Skill[] = [
  {
    id: 'rat-inverse',
    topicId: 'math-rational',
    name: 'Proporcjonalność odwrotna i hiperbola',
    level: 'PP',
    ckeRequirement: 'Funkcje — proporcjonalność odwrotna, wykres funkcji f(x) = a/x',
    prerequisites: ['fn-graph', 'alg-rational'],
    examValue: 0.5,
  },
  {
    id: 'rat-shifted',
    topicId: 'math-rational',
    name: 'Przesunięta hiperbola i asymptoty',
    level: 'PR',
    ckeRequirement: 'Funkcje wymierne — funkcja homograficzna, asymptoty, dziedzina i zbiór wartości',
    prerequisites: ['rat-inverse', 'fn-shift'],
    examValue: 0.55,
  },
  {
    id: 'rat-inequalities',
    topicId: 'math-rational',
    name: 'Równania i nierówności wymierne',
    level: 'PR',
    ckeRequirement: 'Równania i nierówności wymierne — dziedzina, sprowadzenie do iloczynu, parametr',
    prerequisites: ['rat-shifted', 'eq-rational', 'poly-inequalities'],
    examValue: 0.65,
  },
];

const hyp = (x: number) => 4 / x;
const shifted = (x: number) => 2 / (x - 1) + 1;

// ===========================================================================
// Lekcje
// ===========================================================================

export const RAT_LESSONS: Lesson[] = [
  {
    skillId: 'rat-inverse',
    minutes: 10,
    intro:
      'Dwie wielkości są odwrotnie proporcjonalne, gdy ich iloczyn jest stały: dwa razy więcej robotników — dwa razy krócej. Wykresem takiej zależności jest hiperbola.',
    blocks: [
      f(r`y = \frac{a}{x} \iff x \cdot y = a \qquad (a \ne 0,\ x \ne 0)`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres funkcji 4/x: dwie gałęzie hiperboli, w pierwszej i trzeciej ćwiartce, zbliżające się do osi układu.',
          x: [-6, 6],
          y: [-7, 7],
          curves: [{ fn: hyp, label: 'y = 4/x' }],
          points: [{ at: [2, 2] }, { at: [-2, -2] }],
        },
        caption: 'Dla a > 0 gałęzie leżą w I i III ćwiartce, dla a < 0 — w II i IV.',
      },
      p(r`Współczynnik $a$ odczytasz z dowolnego punktu wykresu: $a = x \cdot y$. Funkcja nie ma miejsc zerowych, a osie układu są asymptotami — wykres zbliża się do nich, ale ich nie przecina.`),
      warn(r`$\frac{a}{x}$ dla $a > 0$ maleje w $(-\infty, 0)$ i osobno w $(0, +\infty)$, ale NIE jest malejąca w całej dziedzinie: $f(-1) < f(1)$.`),
    ],
    examples: [
      example(
        r`Wykres $f(x) = \frac{a}{x}$ przechodzi przez $(2, -3)$. Wyznacz $a$ i oblicz $f(-6)$.`,
        [r`$a = 2 \cdot (-3) = -6$.`, r`$f(-6) = \frac{-6}{-6} = 1$.`],
        r`$a = -6$, $f(-6) = 1$`,
      ),
      example(
        r`$4$ robotników wykonuje pracę w $6$ dni. Ile dni zajmie ona $8$ robotnikom?`,
        [r`Iloczyn stały: $4 \cdot 6 = 24$ dniówki.`, r`$\frac{24}{8} = 3$ dni.`],
        r`$3$ dni`,
      ),
    ],
    pitfalls: ['Proporcjonalność odwrotna policzona jak prosta.', 'Hiperbola uznana za malejącą w całej dziedzinie.', r`$a$ policzone jako $\frac{y}{x}$ zamiast $x \cdot y$.`],
  },
  {
    skillId: 'rat-shifted',
    minutes: 12,
    intro:
      'Przesuwając hiperbolę, przesuwasz też jej asymptoty. Wzór w postaci kanonicznej od razu pokazuje, gdzie są: to one „trzymają” kształt wykresu.',
    blocks: [
      f(r`f(x) = \frac{a}{x - p} + q \qquad \text{asymptoty: } x = p,\ \ y = q`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres funkcji 2/(x − 1) + 1 z asymptotami: pionową x = 1 i poziomą y = 1 (linie przerywane).',
          x: [-4, 6],
          y: [-4, 6],
          curves: [{ fn: shifted }],
          guides: [{ x: 1 }, { y: 1 }],
          points: [{ at: [3, 2] }, { at: [2, 3] }],
        },
        caption: 'f(x) = 2/(x − 1) + 1: dziedzina ℝ∖{1}, zbiór wartości ℝ∖{1}.',
      },
      p(r`Dziedzina to $\mathbb{R} \setminus \{p\}$, zbiór wartości $\mathbb{R} \setminus \{q\}$. Wzór typu $\frac{2x + 1}{x - 1}$ sprowadzasz do postaci kanonicznej, dzieląc licznik przez mianownik: $\frac{2(x - 1) + 3}{x - 1} = 2 + \frac{3}{x - 1}$.`),
      warn(r`W $\frac{3}{x + 2}$ asymptota pionowa to $x = -2$, nie $x = 2$ — tak samo jak przy każdym przesunięciu w poziomie.`),
    ],
    examples: [
      example(
        r`Wyznacz asymptoty wykresu $f(x) = \frac{2x + 1}{x - 1}$.`,
        [r`$f(x) = 2 + \frac{3}{x - 1}$.`, r`Asymptoty: $x = 1$ i $y = 2$.`],
        r`$x = 1$, $y = 2$`,
      ),
      example(
        r`Wykres $f(x) = \frac{a}{x - 1} + 2$ przechodzi przez $(3, 4)$. Wyznacz $a$.`,
        [r`$4 = \frac{a}{2} + 2$.`, r`$a = 4$.`],
        r`$a = 4$`,
      ),
    ],
    pitfalls: ['Zły znak asymptoty pionowej.', 'Zbiór wartości wzięty jako ℝ.', 'Postać kanoniczna bez dzielenia licznika przez mianownik.'],
  },
  {
    skillId: 'rat-inequalities',
    minutes: 15,
    intro:
      'Nierówności wymiernej nie wolno mnożyć przez mianownik — nie znasz jego znaku. Zamiast tego przenosisz wszystko na jedną stronę, sprowadzasz do wspólnego mianownika i badasz znak ilorazu tak jak iloczynu.',
    blocks: [
      f(r`\frac{W(x)}{V(x)} > 0 \iff W(x) \cdot V(x) > 0 \qquad (V(x) \ne 0)`),
      p(r`Przepis: 1) dziedzina, 2) wszystko na lewą stronę, 3) wspólny mianownik, 4) wężyk dla iloczynu licznika i mianownika, 5) wyrzuć miejsca zerowe mianownika.`),
      tip(r`Przy $\ge$ miejsca zerowe licznika należą do rozwiązania, a miejsca zerowe mianownika — nigdy.`),
      warn(r`Mnożąc nierówność $\frac{2}{x - 1} < 1$ przez $(x - 1)$, gubisz przypadek $x - 1 < 0$, w którym znak się odwraca.`),
    ],
    examples: [
      example(
        r`Rozwiąż $\frac{2}{x - 1} < 1$.`,
        [r`$\frac{2 - (x - 1)}{x - 1} < 0 \iff \frac{3 - x}{x - 1} < 0$.`, r`$(3 - x)(x - 1) < 0$: $x < 1$ lub $x > 3$.`],
        r`$x \in (-\infty, 1) \cup (3, +\infty)$`,
      ),
      example(
        r`Jadąc tam z prędkością $60$ km/h, a z powrotem $40$ km/h, jaką masz średnią prędkość?`,
        [r`Droga $s$ w obie strony: czas $\frac{s}{60} + \frac{s}{40} = \frac{s}{24}$.`, r`$v_{\text{śr}} =\frac{2s}{s/24} = 48$ km/h.`],
        r`$48$ km/h`,
      ),
    ],
    pitfalls: ['Mnożenie nierówności przez mianownik o nieznanym znaku.', 'Miejsce zerowe mianownika włączone do rozwiązania.', 'Średnia prędkość jako średnia arytmetyczna prędkości.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const RAT_QUESTIONS: Question[] = [
  // rat-inverse ---------------------------------------------------------------
  numeric({
    id: 'w-inv-1',
    skill: 'rat-inverse',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla $f(x) = \frac{6}{x}$ oblicz $f(3)$.`,
    answer: 2,
    verify: () => 6 / 3,
    hints: ['Co trzeba wstawić w miejsce x?', r`$x = 3$.`, r`$\frac{6}{3}$.`, 'Podziel.'],
    steps: [r`$f(3) = \frac63$.`, r`$= 2$.`],
    errors: [['18', 'Pomnożone zamiast podzielone.', 'Funkcja to iloraz 6 przez x.']],
  }),
  numeric({
    id: 'w-inv-2',
    skill: 'rat-inverse',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`$4$ robotników wykonuje pracę w $6$ dni. W ile dni wykona ją $8$ robotników pracujących w tym samym tempie?`,
    answer: 3,
    verify: () => (4 * 6) / 8,
    hints: ['Czy więcej robotników to więcej, czy mniej dni?', 'Mniej — wielkości są odwrotnie proporcjonalne.', r`Iloczyn jest stały: $4 \cdot 6$.`, 'Podziel przez nową liczbę robotników.'],
    steps: [r`$4 \cdot 6 = 24$.`, r`$\frac{24}{8} = 3$ dni.`],
    errors: [['12', 'Proporcjonalność prosta zamiast odwrotnej.', 'Dwa razy więcej robotników — dwa razy mniej dni.']],
  }),
  numeric({
    id: 'w-inv-3',
    skill: 'rat-inverse',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wykres funkcji $f(x) = \frac{a}{x}$ przechodzi przez punkt $(2, -3)$. Wyznacz $a$.`,
    answer: -6,
    verify: () => 2 * -3,
    hints: ['Jaki związek łączy x, y i a na hiperboli?', r`$x \cdot y = a$.`, r`$a = 2 \cdot (-3)$.`, 'Pomnóż.'],
    steps: [r`$-3 = \frac{a}{2}$.`, r`$a = -6$.`],
    errors: [['-1.5', 'Podzielone zamiast pomnożone.', r`$a = x \cdot y$.`]],
  }),
  choice({
    id: 'w-inv-4',
    skill: 'rat-inverse',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = \frac{4}{x}$`,
    choices: [
      r`jest malejąca w przedziale $(0, +\infty)$`,
      r`jest rosnąca w przedziale $(0, +\infty)$`,
      'jest malejąca w całej swojej dziedzinie',
      'ma jedno miejsce zerowe',
    ],
    answer: 'A',
    hints: ['Jak wygląda wykres dla dodatniego a?', 'Gałęzie w I i III ćwiartce, każda opada.', r`Porównaj $f(1)$ i $f(2)$, a potem $f(-1)$ i $f(1)$.`, r`$f(-1) = -4 < f(1) = 4$.`],
    steps: ['W (0, +∞) wartości maleją: f(1) = 4, f(2) = 2.', 'W całej dziedzinie nie jest malejąca: f(−1) < f(1).'],
    errors: [
      ['B', 'Odwrócona monotoniczność.', 'Dla a > 0 gałęzie opadają.'],
      ['C', 'Monotoniczność w dwóch przedziałach przeniesiona na całą dziedzinę.', r`$f(-1) < f(1)$, choć $-1 < 1$ — nie maleje w całej dziedzinie.`],
      ['D', r`$\frac4x$ nigdy nie jest zerem.`, 'Hiperbola nie przecina osi Ox.'],
    ],
  }),
  numeric({
    id: 'w-inv-5',
    skill: 'rat-inverse',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Funkcja $f(x) = \frac{a}{x}$ spełnia $f(4) = 2$. Oblicz $f(-8)$.`,
    answer: -1,
    verify: () => (4 * 2) / -8,
    hints: ['Najpierw wyznacz a — jak?', r`$a = 4 \cdot 2$.`, r`$f(-8) = \frac{a}{-8}$.`, 'Uważaj na znak.'],
    steps: [r`$a = 8$.`, r`$f(-8) = -1$.`],
    errors: [['1', 'Zgubiony znak minus.', 'Dodatnie przez ujemne daje ujemne.']],
  }),
  numeric({
    id: 'w-inv-6',
    skill: 'rat-inverse',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ile punktów o obu współrzędnych całkowitych leży na wykresie funkcji $y = \frac{12}{x}$?`,
    answer: 12,
    verify: () => {
      let c = 0;
      for (let x = -12; x <= 12; x += 1) if (x !== 0 && 12 % x === 0) c += 1;
      return c;
    },
    hints: ['Kiedy y jest liczbą całkowitą?', 'Gdy x dzieli 12.', r`Dzielniki dodatnie: $1, 2, 3, 4, 6, 12$.`, 'Nie zapomnij o ujemnych.'],
    steps: [r`Dzielniki: $\pm 1, \pm 2, \pm 3, \pm 4, \pm 6, \pm 12$.`, 'Dwanaście punktów.'],
    errors: [['6', 'Pominięte ujemne dzielniki.', 'Gałąź w III ćwiartce też ma punkty kratowe.']],
  }),
  numeric({
    id: 'w-inv-7',
    skill: 'rat-inverse',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Trasę $120$ km pokonujesz ze stałą prędkością. O ile minut krócej potrwa jazda, jeśli zamiast $60$ km/h pojedziesz $80$ km/h?`,
    answer: 30,
    verify: () => (120 / 60 - 120 / 80) * 60,
    tolerance: 1e-9,
    hints: ['Jak czas zależy od prędkości przy stałej drodze?', r`$t = \frac{s}{v}$ — odwrotnie proporcjonalnie.`, r`$t_1 = \frac{120}{60}$, $t_2 = \frac{120}{80}$ (w godzinach).`, 'Odejmij i zamień na minuty.'],
    steps: [r`$2 - 1{,}5 = 0{,}5$ h.`, r`$= 30$ minut.`],
    errors: [['0.5', 'Wynik w godzinach, a pytanie jest o minuty.', 'Zamień godziny na minuty.']],
  }),
  numeric({
    id: 'w-inv-8',
    skill: 'rat-inverse',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Hiperbola $y = \frac{k}{x}$ i prosta $y = -x + 5$ przecinają się w punktach o odciętych $1$ i $4$. Wyznacz $k$.`,
    answer: 4,
    verify: () => 1 * (-1 + 5),
    hints: ['Jakie równanie opisuje punkty wspólne?', r`$\frac{k}{x} = -x + 5$.`, r`$x^2 - 5x + k = 0$ — jego pierwiastkami są odcięte punktów wspólnych.`, 'Wzór Viète’a na iloczyn pierwiastków.'],
    steps: [r`$x_1 x_2 = k$.`, r`$k = 1 \cdot 4 = 4$.`],
    errors: [['5', 'Wzięta suma pierwiastków.', r`Iloczyn pierwiastków to $\frac{c}{a} = k$.`]],
  }),

  // rat-shifted ---------------------------------------------------------------
  numeric({
    id: 'w-sh-1',
    skill: 'rat-shifted',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Wykres $f(x) = \frac{3}{x - 2} + 1$ ma asymptotę pionową $x = c$. Podaj $c$.`,
    answer: 2,
    verify: () => 2,
    hints: ['Gdzie funkcja nie jest określona?', 'Tam, gdzie mianownik się zeruje.', r`$x - 2 = 0$.`, 'Rozwiąż.'],
    steps: [r`$x - 2 = 0 \iff x = 2$.`, r`Asymptota $x = 2$.`],
    errors: [['-2', 'Zły znak przesunięcia.', r`$x - 2 = 0$ daje $x = 2$.`]],
  }),
  numeric({
    id: 'w-sh-2',
    skill: 'rat-shifted',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dziedziną funkcji $f(x) = \frac{5}{x + 4} - 2$ jest $\mathbb{R} \setminus \{c\}$. Podaj $c$.`,
    answer: -4,
    verify: () => -4,
    hints: ['Która liczba zeruje mianownik?', r`$x + 4 = 0$.`, 'Rozwiąż równanie.', 'Tej liczby nie ma w dziedzinie.'],
    steps: [r`$x + 4 = 0 \iff x = -4$.`, r`Dziedzina: $\mathbb{R} \setminus \{-4\}$.`],
    errors: [['4', 'Zły znak.', r`$x + 4 = 0 \iff x = -4$.`]],
  }),
  choice({
    id: 'w-sh-3',
    skill: 'rat-shifted',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Zbiorem wartości funkcji $f(x) = \frac{2}{x - 1} + 3$ jest`,
    choices: [r`$\mathbb{R} \setminus \{3\}$`, r`$\mathbb{R} \setminus \{1\}$`, r`$(3, +\infty)$`, r`$\mathbb{R}$`],
    answer: 'A',
    hints: ['Jakiej wartości nie przyjmuje sama hiperbola 2/(x − 1)?', 'Zera.', r`Dodanie $3$ przesuwa wykres w górę.`, r`Pominięta wartość: $0 + 3$.`],
    steps: [r`$\frac{2}{x - 1} \ne 0$, więc $f(x) \ne 3$.`, r`Zbiór wartości: $\mathbb{R} \setminus \{3\}$.`],
    errors: [
      ['B', 'Pomylony zbiór wartości z dziedziną.', 'Dziedzina wyklucza 1, zbiór wartości — 3.'],
      ['C', 'Pominięta gałąź pod asymptotą.', 'Hiperbola ma gałęzie po obu stronach asymptoty poziomej.'],
      ['D', 'Pominięta asymptota pozioma.', 'Wartość q nie jest przyjmowana.'],
    ],
  }),
  numeric({
    id: 'w-sh-4',
    skill: 'rat-shifted',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wykres $f(x) = \frac{2x + 1}{x - 1}$ ma asymptotę poziomą $y = c$. Podaj $c$.`,
    answer: 2,
    verify: () => 2,
    hints: ['Jak sprowadzić wzór do postaci kanonicznej?', r`Zapisz licznik jako $2(x - 1) + 3$.`, r`$f(x) = 2 + \frac{3}{x - 1}$.`, 'Odczytaj q.'],
    steps: [r`$f(x) = \frac{3}{x - 1} + 2$.`, r`Asymptota pozioma: $y = 2$.`],
    errors: [['1', 'Wzięta asymptota pionowa.', 'Pozioma to stała dodana do ułamka.']],
  }),
  numeric({
    id: 'w-sh-5',
    skill: 'rat-shifted',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj miejsce zerowe funkcji $f(x) = \frac{2}{x + 1} - 1$.`,
    answer: 1,
    variants: ['x=1'],
    verify: () => 2 - 1,
    hints: ['Jakie równanie trzeba rozwiązać?', r`$\frac{2}{x + 1} = 1$.`, r`$x + 1 = 2$.`, 'Rozwiąż.'],
    steps: [r`$x + 1 = 2$.`, r`$x = 1$.`],
    errors: [['-1', 'Podany punkt spoza dziedziny (zero mianownika).', r`Miejsce zerowe to rozwiązanie $f(x) = 0$.`]],
  }),
  numeric({
    id: 'w-sh-6',
    skill: 'rat-shifted',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wykres funkcji $f(x) = \frac{a}{x - p} + q$ ma asymptoty $x = 1$ i $y = 2$ oraz przechodzi przez punkt $(3, 4)$. Wyznacz $a$.`,
    answer: 4,
    verify: () => (4 - 2) * (3 - 1),
    hints: ['Co wiesz o p i q z asymptot?', r`$p = 1$, $q = 2$.`, r`$4 = \frac{a}{3 - 1} + 2$.`, 'Wyznacz a.'],
    steps: [r`$\frac{a}{2} = 2$.`, r`$a = 4$.`],
    errors: [['2', r`Podane $\frac{a}{2}$ zamiast $a$.`, 'Pomnóż obie strony przez 2.']],
  }),
  numeric({
    id: 'w-sh-7',
    skill: 'rat-shifted',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Na rysunku jest wykres funkcji $f(x) = \frac{a}{x - 1} + 1$ z asymptotami. Wyznacz $a$.`,
    figure: {
      kind: 'plot',
      alt: 'Wykres hiperboli z asymptotami x = 1 i y = 1 (linie przerywane). Wykres przechodzi przez punkty (2, 3) i (3, 2).',
      x: [-4, 6],
      y: [-4, 6],
      curves: [{ fn: shifted }],
      guides: [{ x: 1 }, { y: 1 }],
      points: [{ at: [3, 2] }, { at: [2, 3] }],
    },
    answer: 2,
    verify: () => (2 - 1) * (3 - 1),
    hints: ['Który punkt z wykresu wygodnie wstawić?', 'Na przykład ten, którego pierwsza współrzędna to 3.', 'Wstaw obie jego współrzędne do wzoru funkcji.', r`$\frac{a}{3 - 1} + 1 = y$ — wyznacz $a$.`],
    steps: [r`$\frac{a}{2} = 1$.`, r`$a = 2$.`],
    errors: [['4', 'Nie odjęto przesunięcia q = 1.', r`$\frac{a}{2} = 2 - 1$.`]],
  }),
  numeric({
    id: 'w-sh-8',
    skill: 'rat-shifted',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Funkcja $f(x) = \frac{ax + 3}{x + b}$ ma asymptoty $x = -1$ i $y = 2$. Oblicz $f(0)$.`,
    answer: 3,
    verify: () => (2 * 0 + 3) / (0 + 1),
    hints: ['Co wyznacza asymptotę pionową?', r`Zero mianownika: $-b = -1$, więc $b = 1$.`, r`Asymptota pozioma to iloraz współczynników przy $x$: $\frac{a}{1}$.`, r`$a = 2$ — wstaw $x = 0$.`],
    steps: [r`$f(x) = \frac{2x + 3}{x + 1}$.`, r`$f(0) = 3$.`],
    errors: [['-3', r`Zły znak $b$: mianownik $x - 1$.`, r`Asymptota $x = -1$ oznacza mianownik $x + 1$.`]],
  }),

  // rat-inequalities ----------------------------------------------------------
  numeric({
    id: 'w-ineq-1',
    skill: 'rat-inequalities',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla jakiej liczby $x$ wyrażenie $\frac{5}{x - 2}$ nie ma sensu?`,
    answer: 2,
    variants: ['x=2'],
    verify: () => 2,
    hints: ['Przez co nie wolno dzielić?', 'Przez zero.', r`Kiedy $x - 2 = 0$?`, 'Rozwiąż.'],
    steps: [r`$x - 2 = 0$.`, r`$x = 2$.`],
    errors: [['-2', 'Zły znak.', r`$x - 2 = 0 \iff x = 2$.`]],
  }),
  numeric({
    id: 'w-ineq-2',
    skill: 'rat-inequalities',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile liczb całkowitych spełnia nierówność $\frac{x - 3}{x + 1} < 0$?`,
    answer: 3,
    verify: () => {
      let c = 0;
      for (let x = -50; x <= 50; x += 1) if (x !== -1 && (x - 3) / (x + 1) < 0) c += 1;
      return c;
    },
    hints: ['Czym zastąpić znak ilorazu?', r`Znakiem iloczynu $(x - 3)(x + 1)$.`, r`$(x - 3)(x + 1) < 0 \iff x \in (-1, 3)$.`, 'Policz liczby całkowite w przedziale otwartym.'],
    steps: [r`$x \in (-1, 3)$.`, r`$0, 1, 2$ — trzy liczby.`],
    errors: [['5', 'Włączone końce przedziału.', 'Nierówność ostra, a −1 nie należy do dziedziny.']],
  }),
  choice({
    id: 'w-ineq-3',
    skill: 'rat-inequalities',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Zbiorem rozwiązań nierówności $\frac{1}{x} > 0$ jest`,
    choices: [r`$(0, +\infty)$`, r`$\mathbb{R} \setminus \{0\}$`, r`$(-\infty, 0)$`, r`$\langle 0, +\infty)$`],
    answer: 'A',
    hints: ['Kiedy ułamek o dodatnim liczniku jest dodatni?', 'Gdy mianownik jest dodatni.', r`$x > 0$.`, 'Czy zero może należeć do rozwiązania?'],
    steps: [r`$\frac1x > 0 \iff x > 0$.`, r`$x \in (0, +\infty)$.`],
    errors: [
      ['B', 'Pominięty znak ujemnych x.', r`Dla $x < 0$ ułamek jest ujemny.`],
      ['C', 'Odwrócona nierówność.', 'Dodatni licznik przez ujemny mianownik daje liczbę ujemną.'],
      ['D', 'Włączone zero spoza dziedziny.', 'Przez zero nie dzielimy.'],
    ],
  }),
  numeric({
    id: 'w-ineq-4',
    skill: 'rat-inequalities',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj najmniejszą liczbę naturalną dodatnią spełniającą nierówność $\frac{x + 2}{x - 1} \ge 0$.`,
    answer: 2,
    verify: () => {
      for (let x = 1; x < 100; x += 1) if (x !== 1 && (x + 2) / (x - 1) >= 0) return x;
      return NaN;
    },
    hints: ['Jaki jest zbiór rozwiązań?', r`Iloczyn $(x + 2)(x - 1) \ge 0$, ale $x \ne 1$.`, r`$x \in (-\infty, -2 \rangle \cup (1, +\infty)$.`, 'Czy 1 należy do rozwiązania?'],
    steps: [r`$x = 1$ — mianownik zero, odpada.`, r`Najmniejsza naturalna dodatnia: $2$.`],
    errors: [['1', 'Włączone miejsce zerowe mianownika.', 'Mianownik nie może być zerem, nawet przy ≥.']],
  }),
  numeric({
    id: 'w-ineq-5',
    skill: 'rat-inequalities',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ile liczb całkowitych z przedziału $\langle -2, 5 \rangle$ spełnia nierówność $\frac{2}{x - 1} < 1$?`,
    answer: 5,
    verify: () => {
      let c = 0;
      for (let x = -2; x <= 5; x += 1) if (x !== 1 && 2 / (x - 1) < 1) c += 1;
      return c;
    },
    hints: ['Czy można pomnożyć przez x − 1?', r`Nie — przenieś $1$ na lewą stronę: $\frac{2 - (x - 1)}{x - 1} < 0$.`, r`$\frac{3 - x}{x - 1} < 0$ — zbadaj znak iloczynu.`, r`$x < 1$ lub $x > 3$.`],
    steps: [r`$x \in (-\infty, 1) \cup (3, +\infty)$.`, r`Z przedziału: $-2, -1, 0, 4, 5$ — pięć liczb.`],
    errors: [['3', 'Nierówność pomnożona przez x − 1 bez zmiany znaku — zgubione x < 1.', 'Dla x < 1 mianownik jest ujemny i znak się odwraca.']],
  }),
  numeric({
    id: 'w-ineq-6',
    skill: 'rat-inequalities',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $\frac{1}{x} + \frac{1}{x + 2} = \frac{3}{4}$. Podaj większe rozwiązanie.`,
    answer: 2,
    variants: ['x=2'],
    verify: () => (2 + Math.sqrt(4 + 96)) / 6,
    hints: ['Jaka jest dziedzina?', r`$x \ne 0$, $x \ne -2$.`, r`Pomnóż przez $4x(x + 2)$: $4(x + 2) + 4x = 3x(x + 2)$.`, r`$3x^2 - 2x - 8 = 0$.`],
    steps: [r`$x = \frac{2 \pm 10}{6}$: $x = 2$ lub $x = -\frac43$.`, r`Większe: $2$.`],
    errors: [['-4/3', 'Wybrane mniejsze rozwiązanie.', 'Pytanie dotyczy większego.']],
  }),
  numeric({
    id: 'w-ineq-7',
    skill: 'rat-inequalities',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Jedziesz do miasta z prędkością $60$ km/h, a wracasz tą samą drogą z prędkością $40$ km/h. Jaka jest średnia prędkość całej podróży (w km/h)?`,
    answer: 48,
    verify: () => 2 / (1 / 60 + 1 / 40),
    tolerance: 1e-9,
    hints: ['Jak liczy się średnią prędkość?', 'Cała droga podzielona przez cały czas.', r`Dla drogi $s$ w jedną stronę: czas $\frac{s}{60} + \frac{s}{40}$.`, r`$v = \frac{2s}{\frac{s}{60} + \frac{s}{40}}$ — $s$ się skróci.`],
    steps: [r`$\frac{s}{60} + \frac{s}{40} = \frac{s}{24}$.`, r`$v = 2s \cdot \frac{24}{s} = 48$ km/h.`],
    errors: [['50', 'Średnia arytmetyczna prędkości.', 'Wolniej jedziesz dłużej — ta prędkość waży więcej.']],
  }),
  numeric({
    id: 'w-ineq-8',
    skill: 'rat-inequalities',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile liczb całkowitych z przedziału $\langle -5, 5 \rangle$ spełnia nierówność $\frac{x}{x - 2} \le x$?`,
    answer: 5,
    verify: () => {
      let c = 0;
      for (let x = -5; x <= 5; x += 1) if (x !== 2 && x / (x - 2) <= x) c += 1;
      return c;
    },
    hints: ['Co zrobić z x po prawej stronie?', r`Przenieś na lewo: $\frac{x - x(x - 2)}{x - 2} \le 0$.`, r`$\frac{-x(x - 3)}{x - 2} \le 0 \iff \frac{x(x - 3)}{x - 2} \ge 0$.`, r`Wężyk dla $x(x - 3)(x - 2)$, bez $x = 2$.`],
    steps: [r`$x \in \langle 0, 2) \cup \langle 3, +\infty)$.`, r`Z przedziału: $0, 1, 3, 4, 5$ — pięć liczb.`],
    errors: [['4', 'Pominięte miejsce zerowe licznika przy nierówności nieostrej.', 'Przy ≤ i ≥ zera licznika należą do rozwiązania.']],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const RAT_CARDS: Flashcard[] = [
  card('c-rat-inv-1', 'rat-inverse', 'definicja', 'Proporcjonalność odwrotna?', r`$x \cdot y = a$ (stały iloczyn); wykres $y = \frac{a}{x}$ — hiperbola.`),
  card('c-rat-inv-2', 'rat-inverse', 'pulapka', r`Czy $\frac4x$ jest malejąca w całej dziedzinie?`, 'Nie — tylko w każdym z przedziałów (−∞, 0) i (0, +∞) osobno.'),

  card('c-rat-sh-1', 'rat-shifted', 'wzor', r`Asymptoty $f(x) = \frac{a}{x - p} + q$?`, r`$x = p$ i $y = q$.`),
  card('c-rat-sh-2', 'rat-shifted', 'metoda', r`Jak sprowadzić $\frac{2x + 1}{x - 1}$ do postaci kanonicznej?`, r`Licznik $= 2(x - 1) + 3$, więc $f(x) = 2 + \frac{3}{x - 1}$.`),

  card('c-rat-in-1', 'rat-inequalities', 'metoda', 'Nierówność wymierna — przepis?', 'Dziedzina → wszystko na lewo → wspólny mianownik → znak iloczynu licznik · mianownik → bez zer mianownika.'),
  card('c-rat-in-2', 'rat-inequalities', 'pulapka', 'Czy można pomnożyć nierówność przez mianownik?', 'Nie, gdy nie znasz jego znaku — ujemny odwraca nierówność.'),
];

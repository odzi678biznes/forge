import type { Flashcard, Lesson, PlotFigure, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 4: Funkcje - pojęcia wspólne dla wszystkich funkcji.
 *
 * Podstawa: wzór, dziedzina, miejsca zerowe, odczytywanie własności
 * z wykresu, przesunięcia. Rozszerzenie: symetrie i wartość bezwzględna,
 * złożenie funkcji. Wykresy są opisane danymi i rysowane lokalnie.
 */

const r = String.raw;

export const FUNCTIONS_TOPIC: Topic = {
  id: 'math-functions',
  subjectId: 'math',
  name: 'Funkcje',
  summary:
    'Dziedzina, miejsca zerowe, czytanie wykresu, przesunięcia i odbicia — język, którym mówi się o każdej funkcji.',
};

export const FUNCTIONS_SKILLS: Skill[] = [
  {
    id: 'fn-basics',
    topicId: 'math-functions',
    name: 'Wartość, dziedzina i miejsca zerowe',
    level: 'PP',
    ckeRequirement: 'Funkcje — wartość funkcji, dziedzina, miejsca zerowe na podstawie wzoru',
    prerequisites: ['eq-linear', 'num-roots'],
    examValue: 0.75,
  },
  {
    id: 'fn-graph',
    topicId: 'math-functions',
    name: 'Odczytywanie własności z wykresu',
    level: 'PP',
    ckeRequirement: 'Funkcje — dziedzina, zbiór wartości, monotoniczność, znak funkcji odczytane z wykresu',
    prerequisites: ['fn-basics'],
    examValue: 0.8,
  },
  {
    id: 'fn-shift',
    topicId: 'math-functions',
    name: 'Przesunięcia wykresu',
    level: 'PP',
    ckeRequirement: 'Funkcje — wykresy funkcji y = f(x − a) + b',
    prerequisites: ['fn-graph'],
    examValue: 0.6,
  },
  {
    id: 'fn-transform',
    topicId: 'math-functions',
    name: 'Symetrie i wartość bezwzględna funkcji',
    level: 'PR',
    ckeRequirement: 'Funkcje — wykresy y = −f(x), y = f(−x), y = |f(x)|, y = f(|x|)',
    prerequisites: ['fn-shift', 'num-abs'],
    examValue: 0.55,
  },
  {
    id: 'fn-compose',
    topicId: 'math-functions',
    name: 'Złożenie funkcji',
    level: 'PR',
    ckeRequirement: 'Funkcje — złożenie funkcji, dziedzina złożenia',
    prerequisites: ['fn-basics'],
    examValue: 0.45,
  },
];

// ===========================================================================
// Wykresy
// ===========================================================================

function polylineAt(points: Array<[number, number]>, x: number): number {
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return NaN;
}

/** Ile razy łamana przecina poziom `level` (bez odcinków leżących na nim). */
function crossings(points: Array<[number, number]>, level: number): number {
  let n = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i]![1] - level;
    const b = points[i + 1]![1] - level;
    if (a === 0 && b === 0) continue;
    if (a * b < 0 || (b === 0 && i < points.length - 2) || (a === 0 && i === 0)) n += 1;
  }
  return n;
}

const LESSON_LINE: Array<[number, number]> = [
  [-4, -2],
  [-1, 3],
  [2, -1],
  [5, 2],
];
const LINE_A: Array<[number, number]> = [
  [-2, 1],
  [1, 4],
  [3, 0],
  [5, -2],
];
const LINE_B: Array<[number, number]> = [
  [-4, 3],
  [-1, -1],
  [2, 2],
  [4, 2],
  [6, -1],
];
const LINE_D: Array<[number, number]> = [
  [-5, -3],
  [-2, 1],
  [0, 1],
  [3, -2],
  [5, 0],
];
const TEMPERATURE: Array<[number, number]> = [
  [0, -3],
  [4, -1],
  [8, 3],
  [14, 6],
  [18, 2],
  [22, -2],
  [24, -3],
];

const line = (points: Array<[number, number]>, x: [number, number], y: [number, number], alt: string): PlotFigure => ({
  kind: 'plot',
  alt,
  x,
  y,
  polylines: [{ points }],
  points: [
    { at: points[0]! },
    { at: points[points.length - 1]! },
  ],
});

const FIG_LESSON = line(
  LESSON_LINE,
  [-5, 6],
  [-3, 4],
  'Łamana przez punkty (−4, −2), (−1, 3), (2, −1) i (5, 2).',
);
const FIG_A = line(LINE_A, [-3, 6], [-3, 5], 'Wykres funkcji f: łamana przez punkty (−2, 1), (1, 4), (3, 0) i (5, −2).');
const FIG_B = line(
  LINE_B,
  [-5, 7],
  [-2, 4],
  'Wykres funkcji f: łamana przez punkty (−4, 3), (−1, −1), (2, 2), (4, 2) i (6, −1).',
);
const FIG_D = line(
  LINE_D,
  [-6, 6],
  [-4, 3],
  'Wykres funkcji f: łamana przez punkty (−5, −3), (−2, 1), (0, 1), (3, −2) i (5, 0).',
);

const parabolaDown = (x: number) => -(x + 1) * (x - 3);

// ===========================================================================
// Lekcje
// ===========================================================================

export const FUNCTIONS_LESSONS: Lesson[] = [
  {
    skillId: 'fn-basics',
    minutes: 12,
    intro:
      r`Funkcja to maszyna: wrzucasz liczbę $x$, dostajesz dokładnie jedną liczbę $f(x)$. Cała reszta — wykresy, miejsca zerowe, monotoniczność — to pytania o to, jak ta maszyna działa.`,
    blocks: [
      p(
        r`Zapis $f(x) = 2x - 6$ to przepis: weź liczbę, pomnóż przez $2$, odejmij $6$. Wartość funkcji dla $x = 5$ to $f(5) = 2 \cdot 5 - 6 = 4$ — po prostu wstawiasz.`,
      ),
      p(
        'Dziedzina to liczby, które wolno wrzucić do maszyny. W zadaniach maturalnych zakazane są dwie sytuacje: dzielenie przez zero i pierwiastek kwadratowy z liczby ujemnej.',
      ),
      f(r`f(x) = \frac{1}{x - 3}: \ x \ne 3 \qquad g(x) = \sqrt{x - 2}: \ x \ge 2`),
      p(
        r`Miejsce zerowe to argument, dla którego funkcja daje zero. Szukasz go, rozwiązując równanie $f(x) = 0$. Dla $f(x) = 2x - 6$: $2x - 6 = 0$, więc $x = 3$.`,
      ),
      warn(
        r`Miejsce zerowe to wartość $x$, nie $y$. „Miejscem zerowym jest $3$” znaczy, że wykres przecina oś $x$ w punkcie $(3, 0)$.`,
      ),
      tip(r`Wykres przecina oś $y$ w punkcie $(0, f(0))$ — wystarczy wstawić zero.`),
    ],
    examples: [
      example(
        r`Dla $f(x) = x^2 - 3x$ oblicz $f(-2)$.`,
        [
          r`Wstawiam $-2$ w miejsce każdego $x$ — w nawiasach: $f(-2) = (-2)^2 - 3 \cdot (-2)$.`,
          [r`$(-2)^2 = 4$, a $-3 \cdot (-2) = 6$.`, 'Nawias przy liczbie ujemnej chroni przed błędem znaku.'],
          r`$f(-2) = 4 + 6 = 10$.`,
        ],
        r`$10$`,
      ),
      example(
        r`Wyznacz dziedzinę $f(x) = \frac{\sqrt{x + 1}}{x - 4}$.`,
        [
          r`Pierwiastek: $x + 1 \ge 0$, czyli $x \ge -1$.`,
          r`Mianownik: $x - 4 \ne 0$, czyli $x \ne 4$.`,
          r`Oba warunki naraz: $x \in \langle -1, 4) \cup (4, +\infty)$.`,
        ],
        r`$\langle -1, 4) \cup (4, +\infty)$`,
      ),
    ],
    pitfalls: [
      r`Wstawianie liczby ujemnej bez nawiasu: $-2^2 \ne (-2)^2$.`,
      r`Mylenie miejsca zerowego z punktem przecięcia z osią $y$.`,
      'Pominięty jeden z warunków dziedziny, gdy są dwa naraz.',
    ],
  },
  {
    skillId: 'fn-graph',
    minutes: 12,
    intro:
      'Na maturze wykres często jest dany, a pytania dotyczą tego, co z niego widać: gdzie funkcja rośnie, jaki ma zbiór wartości, gdzie jest dodatnia. To umiejętność czytania — trzeba wiedzieć, na którą oś patrzeć.',
    blocks: [
      p(r`Zasada numer jeden: dziedzinę i miejsca zerowe odczytujesz z osi $x$, wartości i zbiór wartości — z osi $y$.`),
      { kind: 'figure', figure: FIG_LESSON, caption: 'Przykładowa funkcja określona na przedziale od −4 do 5' },
      p(
        r`Dla funkcji z rysunku: dziedzina to $\langle -4, 5 \rangle$ (od najbardziej lewego do najbardziej prawego punktu), zbiór wartości to $\langle -2, 3 \rangle$ (od najniższego do najwyższego).`,
      ),
      p(
        r`Funkcja rośnie tam, gdzie wykres idzie w górę, patrząc od lewej do prawej: na $\langle -4, -1 \rangle$ i na $\langle 2, 5 \rangle$. Maleje na $\langle -1, 2 \rangle$.`,
      ),
      tip(r`$f(x) > 0$ to te $x$, dla których wykres jest NAD osią $x$. $f(x) < 0$ — pod osią.`),
      warn(
        r`Przedziały monotoniczności podajesz na osi $x$, nie $y$. „Funkcja rośnie od $-2$ do $3$” to częsty błąd — to są wartości, a nie argumenty.`,
      ),
    ],
    examples: [
      example(
        'Na podstawie rysunku z lekcji podaj największą wartość funkcji i argument, dla którego jest przyjmowana.',
        [r`Najwyższy punkt wykresu to $(-1, 3)$.`, r`Największa wartość: $3$, przyjmowana dla $x = -1$.`],
        r`$3$ dla $x = -1$`,
      ),
      example(
        'Ile miejsc zerowych ma funkcja z rysunku z lekcji?',
        [
          r`Szukam punktów, w których wykres przecina oś $x$.`,
          r`Między $x = -4$ a $x = -1$ wykres idzie z $-2$ do $3$ — przecina oś raz.`,
          r`Między $-1$ a $2$ schodzi z $3$ do $-1$ — drugi raz. Między $2$ a $5$ wchodzi z $-1$ do $2$ — trzeci raz.`,
        ],
        r`$3$`,
      ),
    ],
    pitfalls: [
      r`Przedziały monotoniczności odczytywane z osi $y$.`,
      'Zbiór wartości od lewego do prawego końca zamiast od najniższego do najwyższego punktu.',
      r`Pominięty koniec wykresu przy szukaniu największej lub najmniejszej wartości.`,
    ],
  },
  {
    skillId: 'fn-shift',
    minutes: 10,
    intro:
      r`Znając jeden wykres, znasz całą rodzinę: $f(x) + 2$ to ten sam kształt przesunięty w górę, $f(x - 3)$ — w prawo. To oszczędza liczenie przy funkcji kwadratowej i wykładniczej.`,
    blocks: [
      f(r`y = f(x) + b`, 'przesunięcie o b w górę (dla ujemnego b — w dół)'),
      f(r`y = f(x - a)`, 'przesunięcie o a w prawo (dla ujemnego a — w lewo)'),
      warn(
        r`Przesunięcie poziome działa „na odwrót”: $f(x - 3)$ to ruch w PRAWO o $3$, a $f(x + 3)$ — w LEWO. Minus w nawiasie oznacza ruch w stronę plusów.`,
      ),
      p(
        r`Dlaczego na odwrót? Punkt, który w $f$ był w $x = 0$, w $f(x - 3)$ pojawia się tam, gdzie $x - 3 = 0$, czyli w $x = 3$.`,
      ),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Parabola y = x² (linia ciągła) i ta sama parabola przesunięta o 3 w prawo i o 1 w górę (linia przerywana).',
          x: [-3, 6],
          y: [-1, 8],
          curves: [
            { fn: (x) => x * x, label: 'f' },
            { fn: (x) => (x - 3) ** 2 + 1, label: 'g', dashed: true },
          ],
          points: [
            { at: [0, 0] },
            { at: [3, 1] },
          ],
        },
        caption: 'g(x) = f(x − 3) + 1: przesunięcie o 3 w prawo i o 1 w górę',
      },
      tip(r`Przesunięcie o wektor $[a, b]$: $y = f(x - a) + b$. Każdy punkt $(x, y)$ wykresu przechodzi w $(x + a, y + b)$.`),
    ],
    examples: [
      example(
        r`Wykres $f(x) = x^2$ przesunięto o $2$ w lewo i o $5$ w dół. Podaj wzór nowej funkcji.`,
        [r`W lewo o $2$: $x$ zamieniam na $x + 2$.`, r`W dół o $5$: odejmuję $5$ od całości.`, r`$g(x) = (x + 2)^2 - 5$.`],
        r`$g(x) = (x + 2)^2 - 5$`,
      ),
      example(
        r`Punkt $A = (1, 4)$ należy do wykresu $f$. Jaki punkt należy do wykresu $g(x) = f(x - 2) + 3$?`,
        [r`To przesunięcie o wektor $[2, 3]$.`, r`$(1 + 2,\ 4 + 3) = (3, 7)$.`],
        r`$(3, 7)$`,
      ),
    ],
    pitfalls: [
      r`$f(x - 3)$ to przesunięcie w prawo, nie w lewo.`,
      r`Przesunięcie pionowe dodaje się do całej funkcji, nie do $x$.`,
      r`W wektorze $[a, b]$ pierwsza współrzędna to ruch poziomy.`,
    ],
  },
  {
    skillId: 'fn-transform',
    minutes: 12,
    intro:
      r`Na rozszerzeniu dochodzą odbicia: wykres $-f(x)$ to lustro w osi $x$, a $f(-x)$ — w osi $y$. Do tego $|f(x)|$ i $f(|x|)$ — dwie różne operacje, które maturzyści często mylą.`,
    blocks: [
      f(r`y = -f(x)`, 'symetria względem osi x'),
      f(r`y = f(-x)`, 'symetria względem osi y'),
      p(r`$y = |f(x)|$: części wykresu pod osią $x$ odbijasz w górę, reszta zostaje. Wynik nigdy nie jest ujemny.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Parabola y = x² − 4 (linia ciągła) i wykres y = |x² − 4| (linia przerywana): część pod osią x odbita w górę.',
          x: [-4, 4],
          y: [-5, 6],
          curves: [
            { fn: (x) => x * x - 4, label: 'f' },
            { fn: (x) => Math.abs(x * x - 4), dashed: true },
          ],
        },
        caption: '|f(x)|: to, co było pod osią x, odbija się w górę',
      },
      p(
        r`$y = f(|x|)$: zostawiasz część wykresu dla $x \ge 0$, a lewą połowę zastępujesz jej lustrzanym odbiciem. Wykres jest symetryczny względem osi $y$.`,
      ),
      warn(
        r`$|f(x)|$ zmienia WARTOŚCI (odbija w pionie część pod osią), a $f(|x|)$ zmienia ARGUMENTY (kopiuje prawą połowę na lewo).`,
      ),
    ],
    examples: [
      example(
        r`Dla $f(x) = x - 2$ oblicz $|f(-3)|$ oraz $f(|-3|)$.`,
        [
          r`$f(-3) = -5$, więc $|f(-3)| = 5$.`,
          r`$|-3| = 3$, więc $f(|-3|) = f(3) = 1$.`,
          'Dwie różne liczby — bo to dwie różne operacje.',
        ],
        r`$5$ i $1$`,
      ),
      example(
        r`Ile rozwiązań ma równanie $|x^2 - 4| = 3$?`,
        [r`$x^2 - 4 = 3$ lub $x^2 - 4 = -3$.`, r`$x^2 = 7$ lub $x^2 = 1$.`, r`$x = \pm\sqrt{7}$ lub $x = \pm 1$ — cztery rozwiązania.`],
        r`$4$`,
      ),
    ],
    pitfalls: [
      r`Mylenie $|f(x)|$ z $f(|x|)$.`,
      r`$f(-x)$ to odbicie w osi $y$, a $-f(x)$ — w osi $x$.`,
      r`Wykres $|f(x)|$ nie ma żadnej części pod osią $x$.`,
    ],
  },
  {
    skillId: 'fn-compose',
    minutes: 10,
    intro:
      r`Złożenie funkcji to dwie maszyny ustawione jedna za drugą: wynik pierwszej wpada do drugiej. Zapis $f(g(x))$ czyta się od środka: najpierw $g$, potem $f$.`,
    blocks: [
      f(r`(f \circ g)(x) = f(g(x))`, 'najpierw g, potem f'),
      p(
        r`Przykład: $f(x) = x^2$, $g(x) = x + 1$. $f(g(2)) = f(3) = 9$, a $g(f(2)) = g(4) = 5$. Kolejność ma znaczenie.`,
      ),
      p(r`Wzór złożenia: w miejsce każdego $x$ we wzorze $f$ wstawiasz cały wzór $g$. $f(g(x)) = (x + 1)^2$.`),
      warn(r`$f(g(x))$ to nie iloczyn $f(x) \cdot g(x)$. To wstawienie jednej funkcji do drugiej.`),
      tip(r`Dziedzina złożenia: $x$ musi należeć do dziedziny $g$, a $g(x)$ — do dziedziny $f$.`),
    ],
    examples: [
      example(
        r`Dla $f(x) = 2x - 1$ i $g(x) = x^2$ oblicz $f(g(3))$ oraz $g(f(3))$.`,
        [r`$g(3) = 9$, więc $f(g(3)) = f(9) = 17$.`, r`$f(3) = 5$, więc $g(f(3)) = g(5) = 25$.`],
        r`$17$ i $25$`,
      ),
      example(
        r`Wyznacz wzór $f(g(x))$ dla $f(x) = \sqrt{x}$, $g(x) = x - 4$ oraz jego dziedzinę.`,
        [r`$f(g(x)) = \sqrt{x - 4}$.`, r`Dziedzina: $x - 4 \ge 0$, czyli $x \ge 4$.`],
        r`$\sqrt{x - 4}$ dla $x \ge 4$`,
      ),
    ],
    pitfalls: [
      r`Zła kolejność: $f(g(x))$ liczy się od środka — najpierw $g$.`,
      'Złożenie to nie iloczyn funkcji.',
      'Pominięty warunek dziedziny funkcji zewnętrznej.',
    ],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const FUNCTIONS_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // fn-basics
  // -------------------------------------------------------------------------
  numeric({
    id: 'f-bas-1',
    skill: 'fn-basics',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla $f(x) = 3x + 1$ oblicz $f(4)$.`,
    answer: 13,
    verify: () => 3 * 4 + 1,
    hints: [r`Co trzeba wstawić w miejsce $x$?`, r`Wstaw $4$: $f(4) = 3 \cdot 4 + 1$.`, 'Najpierw mnożenie, potem dodawanie.', r`$12 + 1$.`],
    steps: [r`$f(4) = 3 \cdot 4 + 1$.`, r`$= 12 + 1 = 13$.`],
    errors: [['12', r`Pominięte $+1$ ze wzoru.`, 'Wstawiasz liczbę i wykonujesz cały przepis funkcji.']],
  }),
  numeric({
    id: 'f-bas-2',
    skill: 'fn-basics',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Wyznacz miejsce zerowe funkcji $f(x) = 2x - 6$.`,
    answer: 3,
    verify: () => 6 / 2,
    hints: ['Jakie równanie trzeba rozwiązać?', r`$f(x) = 0$, czyli $2x - 6 = 0$.`, r`$2x = 6$.`, r`Podziel przez $2$.`],
    steps: [r`$2x - 6 = 0$.`, r`$x = 3$.`],
    errors: [
      ['-6', r`Podany punkt przecięcia z osią $y$, czyli $f(0)$.`, r`Miejsce zerowe to $x$, dla którego $f(x) = 0$.`],
      ['-3', r`Zły znak przy przenoszeniu $-6$.`, r`$2x - 6 = 0 \iff 2x = 6$.`],
    ],
  }),
  choice({
    id: 'f-bas-3',
    skill: 'fn-basics',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Dziedziną funkcji $f(x) = \frac{2}{x + 5}$ jest zbiór`,
    choices: [r`$\mathbb{R} \setminus \{-5\}$`, r`$\mathbb{R} \setminus \{5\}$`, r`$\mathbb{R} \setminus \{2\}$`, r`$(-5, +\infty)$`],
    answer: 'A',
    hints: ['Jaka operacja w tym wzorze może być niewykonalna?', 'Dzielenie przez zero.', r`$x + 5 = 0$ dla $x = -5$.`, r`Wykluczasz tylko tę jedną liczbę.`],
    steps: [r`Mianownik: $x + 5 \ne 0 \iff x \ne -5$.`, r`$D = \mathbb{R} \setminus \{-5\}$.`],
    errors: [
      ['B', r`Zły znak: $x + 5 = 0$ dla $x = -5$.`, r`$x + 5 = 0 \iff x = -5$.`],
      ['C', 'Wykluczona liczba z licznika.', 'Ograniczenie dotyczy tylko mianownika.'],
      ['D', 'Warunek jak dla pierwiastka zamiast dla ułamka.', r`Przy ułamku wykluczasz jeden punkt, a nie całą półprostą.`],
    ],
  }),
  numeric({
    id: 'f-bas-4',
    skill: 'fn-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla $f(x) = x^2 - 3x$ oblicz $f(-2)$.`,
    answer: 10,
    verify: () => (-2) ** 2 - 3 * -2,
    hints: [r`Jak bezpiecznie wstawić liczbę ujemną?`, r`W nawiasie: $(-2)^2 - 3 \cdot (-2)$.`, r`$(-2)^2 = 4$.`, r`$-3 \cdot (-2) = +6$.`],
    steps: [r`$f(-2) = (-2)^2 - 3 \cdot (-2)$.`, r`$= 4 + 6 = 10$.`],
    errors: [
      ['2', r`Policzone $-2^2 = -4$ zamiast $(-2)^2 = 4$.`, 'Liczbę ujemną wstawiasz w nawiasie.'],
      ['-2', r`Zły znak: $-3 \cdot (-2)$ to $+6$.`, 'Iloczyn dwóch liczb ujemnych jest dodatni.'],
    ],
  }),
  numeric({
    id: 'f-bas-5',
    skill: 'fn-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych należy do dziedziny funkcji $f(x) = \sqrt{x + 2} + \sqrt{3 - x}$?`,
    answer: 6,
    verify: () => {
      let n = 0;
      for (let x = -20; x <= 20; x += 1) if (x + 2 >= 0 && 3 - x >= 0) n += 1;
      return n;
    },
    hints: [
      'Ile warunków daje ten wzór?',
      r`Dwa pierwiastki: $x + 2 \ge 0$ oraz $3 - x \ge 0$.`,
      r`$x \ge -2$ i $x \le 3$.`,
      r`Liczby całkowite od $-2$ do $3$ — razem z końcami.`,
    ],
    steps: [r`$x \in \langle -2, 3 \rangle$.`, r`Liczby całkowite: $-2, -1, 0, 1, 2, 3$ — sześć.`],
    errors: [['4', r`Pominięte końce: pierwiastek z zera istnieje.`, r`Warunek to $\ge 0$, a nie $> 0$.`]],
  }),
  choice({
    id: 'f-bas-6',
    skill: 'fn-basics',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dziedziną funkcji $f(x) = \frac{\sqrt{x + 1}}{x - 4}$ jest zbiór`,
    choices: [
      r`$\langle -1, 4) \cup (4, +\infty)$`,
      r`$\langle -1, +\infty)$`,
      r`$(-1, 4) \cup (4, +\infty)$`,
      r`$\mathbb{R} \setminus \{4\}$`,
    ],
    answer: 'A',
    hints: ['Ile warunków trzeba spełnić jednocześnie?', r`Pierwiastek: $x + 1 \ge 0$. Mianownik: $x - 4 \ne 0$.`, r`$x \ge -1$ i $x \ne 4$.`, r`Z półprostej $\langle -1, +\infty)$ wyrzuć liczbę $4$.`],
    steps: [r`$x \ge -1$ oraz $x \ne 4$.`, r`$D = \langle -1, 4) \cup (4, +\infty)$.`],
    errors: [
      ['B', 'Pominięty warunek mianownika.', r`Dla $x = 4$ mianownik jest zerem.`],
      ['C', r`Wykluczone $-1$, choć $\sqrt{0} = 0$ istnieje.`, r`Warunek pierwiastka to $\ge 0$.`],
      ['D', 'Pominięty warunek pierwiastka.', r`Pierwiastek kwadratowy wymaga $x + 1 \ge 0$.`],
    ],
  }),
  numeric({
    id: 'f-bas-7',
    skill: 'fn-basics',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Opłata za taksówkę to $f(k) = 8 + 3{,}5k$ zł, gdzie $k$ to liczba kilometrów. Za ile kilometrów zapłacono $43$ zł?`,
    answer: 10,
    verify: () => (43 - 8) / 3.5,
    hints: ['Jakie równanie opisuje tę sytuację?', r`$8 + 3{,}5k = 43$.`, r`$3{,}5k = 35$.`, r`Podziel $35$ przez $3{,}5$.`],
    steps: [r`$8 + 3{,}5k = 43 \Rightarrow 3{,}5k = 35$.`, r`$k = 10$ km.`],
    errors: [['12.29', 'Pominięta opłata początkowa.', r`Najpierw odejmij stałą opłatę $8$ zł.`]],
  }),
  numeric({
    id: 'f-bas-8',
    skill: 'fn-basics',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Funkcja jest określona wzorem $f(x) = \frac{ax + 2}{x - 1}$ dla $x \ne 1$. Wiadomo, że $f(3) = 4$. Oblicz $f(-1)$.`,
    answer: 0,
    verify: () => {
      const a = (4 * (3 - 1) - 2) / 3;
      return (a * -1 + 2) / (-1 - 1);
    },
    hints: [
      r`Jak wykorzystać informację $f(3) = 4$?`,
      r`$\frac{3a + 2}{3 - 1} = 4$ — to równanie z niewiadomą $a$.`,
      r`$3a + 2 = 8$.`,
      r`Znając $a$, wstaw $x = -1$ do wzoru.`,
    ],
    steps: [r`$\frac{3a + 2}{2} = 4 \Rightarrow a = 2$.`, r`$f(-1) = \frac{2 \cdot (-1) + 2}{-2} = \frac{0}{-2} = 0$.`],
    errors: [['-2', r`Zgubiony minus: $2 \cdot (-1)$ policzone jako $+2$.`, r`$a \cdot (-1) = -a$.`]],
  }),

  // -------------------------------------------------------------------------
  // fn-graph
  // -------------------------------------------------------------------------
  numeric({
    id: 'f-gr-1',
    skill: 'fn-graph',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Na rysunku jest wykres funkcji $f$. Odczytaj $f(1)$.`,
    figure: FIG_A,
    answer: 4,
    verify: () => polylineAt(LINE_A, 1),
    hints: ['Na której osi szukasz liczby 1?', r`Znajdź $x = 1$ na osi poziomej.`, 'Idź pionowo do wykresu, potem poziomo do osi y.', r`Wykres ma tam wierzchołek.`],
    steps: [r`Dla $x = 1$ wykres jest w punkcie $(1, 4)$.`, r`$f(1) = 4$.`],
    errors: [['-2', 'Pomylone osie: odczytane x, dla którego wartość wynosi 1.', 'f(1) to wartość (oś y) dla argumentu 1 (oś x).']],
  }),
  numeric({
    id: 'f-gr-2',
    skill: 'fn-graph',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Na rysunku jest wykres funkcji $f$. Podaj miejsce zerowe tej funkcji.`,
    figure: FIG_A,
    answer: 3,
    verify: () => 3,
    hints: ['Gdzie na rysunku funkcja przyjmuje wartość zero?', r`Tam, gdzie wykres przecina oś $x$.`, 'Odczytaj pierwszą współrzędną tego punktu.', r`Punkt ma postać $(x_0, 0)$.`],
    steps: [r`Wykres przecina oś $x$ w punkcie $(3, 0)$.`, r`Miejsce zerowe: $x = 3$.`],
    errors: [['0', 'Podana wartość funkcji w miejscu zerowym zamiast argumentu.', 'Miejsce zerowe to liczba na osi x.']],
  }),
  choice({
    id: 'f-gr-3',
    skill: 'fn-graph',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Na rysunku jest wykres funkcji $f$. Funkcja $f$ jest rosnąca w przedziale`,
    figure: FIG_B,
    choices: [r`$\langle -1, 2 \rangle$`, r`$\langle 2, 4 \rangle$`, r`$\langle -4, -1 \rangle$`, r`$\langle 2, 6 \rangle$`],
    answer: 'A',
    hints: ['Jak na wykresie wygląda funkcja rosnąca?', 'Wykres idzie w górę, gdy patrzysz od lewej do prawej.', 'Znajdź odcinek, który się wznosi.', r`Odczytaj jego końce na osi $x$.`],
    steps: [r`Wykres wznosi się od punktu $(-1, -1)$ do $(2, 2)$.`, r`$f$ rośnie w $\langle -1, 2 \rangle$.`],
    errors: [
      ['B', r`Na $\langle 2, 4 \rangle$ funkcja jest stała, a nie rosnąca.`, 'Funkcja stała nie jest rosnąca.'],
      ['C', 'Tu wykres opada — funkcja maleje.', 'Rosnąca: w górę od lewej do prawej.'],
      ['D', 'Do przedziału wzięte odcinki stały i malejący.', 'W przedziale monotoniczności cały wykres musi iść w górę.'],
    ],
  }),
  numeric({
    id: 'f-gr-4',
    skill: 'fn-graph',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku jest wykres funkcji $f$. Podaj największą wartość tej funkcji.`,
    figure: FIG_B,
    answer: 3,
    verify: () => Math.max(...LINE_B.map((p) => p[1])),
    hints: ['Który punkt wykresu leży najwyżej?', 'Sprawdź też końce wykresu, nie tylko wierzchołki w środku.', 'Jak wysoko leży lewy koniec wykresu?', r`Porównaj go z najwyższym punktem w środku wykresu.`],
    steps: [r`Najwyżej leży lewy koniec wykresu: $(-4, 3)$.`, r`Największa wartość to $3$.`],
    errors: [
      ['2', 'Pominięty lewy koniec wykresu.', 'Największa wartość może być na końcu dziedziny.'],
      ['-4', 'Podany argument zamiast wartości.', 'Wartość funkcji odczytujesz z osi y.'],
    ],
  }),
  numeric({
    id: 'f-gr-5',
    skill: 'fn-graph',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku jest wykres funkcji $f$. Ile liczb całkowitych $x$ spełnia nierówność $f(x) > 0$?`,
    figure: {
      kind: 'plot',
      alt: 'Parabola skierowana ramionami w dół, określona na przedziale od −2 do 4, przecinająca oś x w punktach −1 i 3.',
      x: [-3, 5],
      y: [-6, 5],
      curves: [{ fn: parabolaDown, from: -2, to: 4 }],
      points: [{ at: [-1, 0] }, { at: [3, 0] }],
    },
    answer: 3,
    verify: () => {
      let n = 0;
      for (let x = -2; x <= 4; x += 1) if (parabolaDown(x) > 0) n += 1;
      return n;
    },
    hints: [r`Gdzie leży wykres, gdy $f(x) > 0$?`, r`Nad osią $x$.`, 'Odczytaj, między którymi miejscami zerowymi wykres leży nad osią.', 'Czy końce, gdzie f(x) = 0, spełniają nierówność ostrą?'],
    steps: [r`$f(x) > 0$ dla $x \in (-1, 3)$.`, r`Liczby całkowite: $0, 1, 2$ — trzy.`],
    errors: [['5', r`Wliczone miejsca zerowe, a $f(x) = 0$ nie spełnia $f(x) > 0$.`, 'Nierówność ostra wyklucza punkty, w których funkcja jest zerem.']],
  }),
  choice({
    id: 'f-gr-6',
    skill: 'fn-graph',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Na rysunku jest wykres funkcji $f$. Zbiorem wartości tej funkcji jest`,
    figure: FIG_D,
    choices: [r`$\langle -3, 1 \rangle$`, r`$\langle -5, 5 \rangle$`, r`$\langle -3, 0 \rangle$`, r`$\langle -2, 1 \rangle$`],
    answer: 'A',
    hints: ['Na której osi odczytujesz zbiór wartości?', r`Na osi $y$ — od najniższego do najwyższego punktu.`, r`Najniżej: lewy koniec $(-5, -3)$.`, r`Najwyżej: odcinek na wysokości $1$.`],
    steps: [r`Najmniejsza wartość: $-3$, największa: $1$.`, r`Zbiór wartości: $\langle -3, 1 \rangle$.`],
    errors: [
      ['B', 'Podana dziedzina zamiast zbioru wartości.', 'Zbiór wartości czytasz z osi y.'],
      ['C', 'Wzięte wartości na końcach wykresu zamiast najniższej i najwyższej.', 'Liczy się najniższy i najwyższy punkt, gdziekolwiek jest.'],
      ['D', 'Pominięty lewy koniec wykresu.', 'Końce wykresu też należą do funkcji.'],
    ],
  }),
  numeric({
    id: 'f-gr-7',
    skill: 'fn-graph',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Wykres przedstawia temperaturę (w °C) w ciągu doby — oś $x$ to godzina. Przez ile godzin temperatura była dodatnia?`,
    figure: {
      kind: 'plot',
      alt: 'Łamana temperatury: o 0:00 −3°, o 4:00 −1°, o 8:00 3°, o 14:00 6°, o 18:00 2°, o 22:00 −2°, o 24:00 −3°.',
      x: [0, 24],
      y: [-4, 7],
      polylines: [{ points: TEMPERATURE }],
    },
    answer: 15,
    verify: () => {
      let t = 0;
      for (let x = 0; x < 24; x += 0.001) if (polylineAt(TEMPERATURE, x) > 0) t += 0.001;
      return Math.round(t);
    },
    hints: ['Kiedy wykres przechodzi przez oś x?', r`Między godz. $4$ a $8$ temperatura rośnie z $-1$ do $3$ — o $1$ stopień na godzinę.`, r`Zero wypada o godz. $5$. Drugie przejście jest między $18$ a $22$.`, r`Od $2$ do $-2$ w $4$ godziny — zero w połowie drogi.`],
    steps: [r`Temperatura dodatnia od godz. $5$ do godz. $20$.`, r`$20 - 5 = 15$ godzin.`],
    errors: [['18', 'Liczone od punktów zmiany kierunku, a nie od przecięć z osią.', 'Temperatura jest dodatnia tylko nad osią x.']],
  }),
  numeric({
    id: 'f-gr-8',
    skill: 'fn-graph',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Na rysunku jest wykres funkcji $f$. Ile rozwiązań ma równanie $f(x) = 1$?`,
    figure: FIG_B,
    answer: 3,
    verify: () => crossings(LINE_B, 1),
    hints: [r`Jak graficznie rozwiązać $f(x) = 1$?`, r`Narysuj poziomą prostą $y = 1$.`, 'Policz punkty wspólne prostej z wykresem.', 'Przejdź po kolei po każdym odcinku łamanej.'],
    steps: [r`Prosta $y = 1$ przecina odcinek malejący od $3$ do $-1$, rosnący od $-1$ do $2$ i ostatni od $2$ do $-1$.`, r`Odcinek na wysokości $2$ jej nie przecina. Razem: $3$ rozwiązania.`],
    errors: [['2', 'Pominięte przecięcie na jednym z odcinków.', 'Sprawdź każdy odcinek wykresu osobno.']],
  }),

  // -------------------------------------------------------------------------
  // fn-shift
  // -------------------------------------------------------------------------
  numeric({
    id: 'f-sh-1',
    skill: 'fn-shift',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Wykres $f(x) = x^2$ przesunięto o $4$ w górę. Oblicz wartość otrzymanej funkcji dla $x = 3$.`,
    answer: 13,
    verify: () => 3 ** 2 + 4,
    hints: ['Jak zmienia się wzór przy przesunięciu w górę?', r`Do całej funkcji dodajesz $4$: $g(x) = x^2 + 4$.`, r`Wstaw $x = 3$.`, r`$9 + 4$.`],
    steps: [r`$g(x) = x^2 + 4$.`, r`$g(3) = 9 + 4 = 13$.`],
    errors: [['49', r`Przesunięcie w górę dodane do $x$: $(3 + 4)^2$.`, r`W górę: $f(x) + b$ — dodajesz do wartości, nie do argumentu.`]],
  }),
  numeric({
    id: 'f-sh-2',
    skill: 'fn-shift',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Punkt $(2, 5)$ należy do wykresu funkcji $f$. Wykres przesunięto o wektor $[3, -1]$. Podaj drugą współrzędną obrazu tego punktu.`,
    answer: 4,
    verify: () => 5 - 1,
    hints: ['Która składowa wektora dotyczy ruchu w pionie?', r`Druga: $-1$, czyli o $1$ w dół.`, r`Nowa druga współrzędna: $5 + (-1)$.`, r`$5 - 1$.`],
    steps: [r`$(2, 5) \to (2 + 3,\ 5 - 1) = (5, 4)$.`, r`Druga współrzędna: $4$.`],
    errors: [
      ['6', r`$-1$ dodane jako $+1$.`, 'Ujemna składowa oznacza ruch w dół.'],
      ['2', 'Pomylone składowe wektora: odjęte 3.', 'Pierwsza składowa zmienia x, druga — y.'],
    ],
  }),
  choice({
    id: 'f-sh-3',
    skill: 'fn-shift',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wykres funkcji $g(x) = (x - 3)^2$ powstaje z wykresu $f(x) = x^2$ przez przesunięcie o $3$ jednostki`,
    choices: ['w prawo', 'w lewo', 'w górę', 'w dół'],
    answer: 'A',
    hints: [r`Gdzie jest wierzchołek $g$ — dla jakiego $x$ nawias jest zerem?`, r`$x - 3 = 0$ dla $x = 3$.`, r`Wierzchołek przesunął się z $0$ do $3$.`, 'W którą stronę jest 3 od zera?'],
    steps: [r`Wierzchołek $g$ jest w $x = 3$.`, 'To przesunięcie o 3 w prawo.'],
    errors: [
      ['B', r`Minus w nawiasie potraktowany jak ruch w lewo.`, r`$f(x - a)$ to przesunięcie w PRAWO o $a$.`],
      ['C', 'Zmiana w nawiasie z x wzięta za ruch pionowy.', 'Zmiana w nawiasie przesuwa wykres w poziomie.'],
      ['D', 'Zmiana w nawiasie wzięta za ruch pionowy.', 'Ruch pionowy to liczba dodana do całej funkcji.'],
    ],
  }),
  numeric({
    id: 'f-sh-4',
    skill: 'fn-shift',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wykres $f(x) = 2^x$ przesunięto o $1$ w prawo i o $3$ w dół. Oblicz wartość otrzymanej funkcji dla $x = 4$.`,
    answer: 5,
    verify: () => 2 ** (4 - 1) - 3,
    hints: ['Jak wygląda wzór po obu przesunięciach?', r`$g(x) = 2^{x - 1} - 3$.`, r`$g(4) = 2^{4-1} - 3$.`, r`$2^3 - 3$.`],
    steps: [r`$g(x) = 2^{x-1} - 3$.`, r`$g(4) = 8 - 3 = 5$.`],
    errors: [['29', r`W prawo zapisane jako $x + 1$: policzone $2^5 - 3$.`, r`W prawo o $1$: $x$ zamieniasz na $x - 1$.`]],
  }),
  choice({
    id: 'f-sh-5',
    skill: 'fn-shift',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Linią przerywaną narysowano wykres funkcji $g$, który powstał z wykresu $f(x) = x^2$ (linia ciągła). Wzór funkcji $g$ to`,
    figure: {
      kind: 'plot',
      alt: 'Parabola y = x² z wierzchołkiem w (0, 0) i przerywana parabola tego samego kształtu z wierzchołkiem w (−2, −1).',
      x: [-5, 3],
      y: [-2, 8],
      curves: [
        { fn: (x) => x * x, label: 'f' },
        { fn: (x) => (x + 2) ** 2 - 1, label: 'g', dashed: true },
      ],
      points: [{ at: [0, 0] }, { at: [-2, -1] }],
    },
    choices: [r`$g(x) = (x + 2)^2 - 1$`, r`$g(x) = (x - 2)^2 - 1$`, r`$g(x) = (x + 2)^2 + 1$`, r`$g(x) = (x - 1)^2 + 2$`],
    answer: 'A',
    hints: ['Gdzie jest wierzchołek przerywanej paraboli?', r`W punkcie $(-2, -1)$.`, r`Przesunięcie o wektor $[-2, -1]$.`, r`$y = f(x - a) + b$ z $a = -2$, $b = -1$.`],
    steps: [r`Wierzchołek przeszedł z $(0, 0)$ do $(-2, -1)$.`, r`$g(x) = (x + 2)^2 - 1$.`],
    errors: [
      ['B', 'Odwrócony kierunek przesunięcia poziomego.', r`W lewo o $2$: $x + 2$ w nawiasie.`],
      ['C', 'Odwrócony kierunek przesunięcia pionowego.', r`W dół o $1$: odejmujesz $1$.`],
      ['D', 'Pomylone przesunięcia: poziome z pionowym.', 'Pierwsza współrzędna wierzchołka daje przesunięcie poziome.'],
    ],
  }),
  numeric({
    id: 'f-sh-6',
    skill: 'fn-shift',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Funkcja $f$ ma miejsca zerowe $-2$ i $5$. Podaj sumę miejsc zerowych funkcji $g(x) = f(x + 3)$.`,
    answer: -3,
    verify: () => (-2 - 3) + (5 - 3),
    hints: [r`W którą stronę przesuwa wykres zapis $f(x + 3)$?`, r`W lewo o $3$.`, 'Każde miejsce zerowe też przesuwa się o 3 w lewo.', r`$-2 - 3$ oraz $5 - 3$.`],
    steps: [r`Miejsca zerowe $g$: $-5$ i $2$.`, r`Suma: $-3$.`],
    errors: [['9', 'Przesunięcie w prawo zamiast w lewo.', r`$f(x + a)$ przesuwa wykres w LEWO o $a$.`]],
  }),
  numeric({
    id: 'f-sh-7',
    skill: 'fn-shift',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Parabolę $y = x^2$ przesunięto tak, że jej wierzchołek znalazł się w punkcie $(3, -4)$. Oblicz sumę miejsc zerowych nowej funkcji.`,
    answer: 6,
    verify: () => (3 - 2) + (3 + 2),
    hints: ['Jaki jest wzór nowej funkcji?', r`$g(x) = (x - 3)^2 - 4$.`, r`$(x - 3)^2 = 4$.`, r`$x - 3 = 2$ lub $x - 3 = -2$.`],
    steps: [r`$(x - 3)^2 = 4 \Rightarrow x = 1$ lub $x = 5$.`, r`Suma: $6$.`],
    errors: [['-6', 'Odwrócony kierunek przesunięcia poziomego.', r`Wierzchołek w $x = 3$ daje nawias $(x - 3)$.`]],
  }),
  numeric({
    id: 'f-sh-8',
    skill: 'fn-shift',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wykres funkcji $f(x) = \frac{1}{x}$ przesunięto o wektor $[2, 3]$. Otrzymana funkcja ma asymptotę pionową $x = a$ i poziomą $y = b$. Oblicz $a + b$.`,
    figure: {
      kind: 'plot',
      alt: 'Hiperbola y = 1/x i hiperbola przesunięta (przerywana) z asymptotami x = 2 i y = 3.',
      x: [-4, 6],
      y: [-3, 7],
      curves: [
        { fn: (x) => 1 / x, label: 'f' },
        { fn: (x) => 1 / (x - 2) + 3, dashed: true },
      ],
      guides: [{ x: 2 }, { y: 3 }],
    },
    answer: 5,
    verify: () => 2 + 3,
    hints: [r`Jakie asymptoty ma $f(x) = \frac{1}{x}$?`, r`$x = 0$ i $y = 0$ — osie układu.`, r`Przesunięcie o $[2, 3]$ przesuwa też asymptoty.`, r`$x = 0 + 2$ oraz $y = 0 + 3$.`],
    steps: [r`Asymptoty przechodzą w $x = 2$ i $y = 3$.`, r`$a + b = 5$.`],
    errors: [['-1', 'Przesunięcie poziome w złą stronę.', r`Wektor $[2, 3]$: 2 w prawo, 3 w górę.`]],
  }),

  // -------------------------------------------------------------------------
  // fn-transform (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'f-tr-1',
    skill: 'fn-transform',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla $f(x) = 2x + 1$ oblicz $-f(3)$.`,
    answer: -7,
    verify: () => -(2 * 3 + 1),
    hints: [r`Ile wynosi $f(3)$?`, r`$f(3) = 7$.`, r`$-f(3)$ to liczba przeciwna do $f(3)$.`, r`Zmień znak.`],
    steps: [r`$f(3) = 7$.`, r`$-f(3) = -7$.`],
    errors: [
      ['7', r`Pominięty minus przed $f$.`, r`$-f(x)$ zmienia znak wartości.`],
      ['-5', r`Policzone $f(-3)$ zamiast $-f(3)$.`, r`$-f(3)$ i $f(-3)$ to dwie różne rzeczy.`],
    ],
  }),
  numeric({
    id: 'f-tr-2',
    skill: 'fn-transform',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dla $f(x) = x - 5$ oblicz $|f(2)| + f(|-2|)$.`,
    answer: 0,
    verify: () => Math.abs(2 - 5) + (Math.abs(-2) - 5),
    hints: [r`Ile wynosi $f(2)$, a ile $|-2|$?`, r`$f(2) = -3$, więc $|f(2)| = 3$.`, r`$|-2| = 2$, więc $f(|-2|) = f(2)$.`, r`$3 + (-3)$.`],
    steps: [r`$|f(2)| = |-3| = 3$.`, r`$f(|-2|) = f(2) = -3$. Suma: $0$.`],
    errors: [['10', r`$f(|-2|)$ pomylone z $|f(-2)| = 7$.`, r`W $f(|x|)$ moduł działa na argument, w $|f(x)|$ — na wartość.`]],
  }),
  choice({
    id: 'f-tr-3',
    skill: 'fn-transform',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wykres funkcji $y = f(-x)$ jest symetryczny do wykresu $y = f(x)$ względem`,
    choices: [r`osi $y$`, r`osi $x$`, 'początku układu współrzędnych', r`prostej $y = x$`],
    answer: 'A',
    hints: [r`Co dzieje się z punktem $(2, 5)$ wykresu $f$?`, r`Na wykresie $f(-x)$ wartość $5$ pojawia się dla $x = -2$.`, r`$(2, 5) \to (-2, 5)$.`, 'Które lustro zamienia x na −x, a y zostawia?'],
    steps: [r`Punkt $(a, b)$ przechodzi w $(-a, b)$.`, r`To odbicie względem osi $y$.`],
    errors: [
      ['B', r`Pomylone $f(-x)$ z $-f(x)$.`, r`Odbicie w osi $x$ zmienia znak wartości: $-f(x)$.`],
      ['C', r`To odbicie odpowiada $-f(-x)$.`, 'Symetria środkowa zmienia znak obu współrzędnych.'],
      ['D', r`Symetria względem $y = x$ zamienia współrzędne miejscami.`, r`$f(-x)$ zmienia tylko znak argumentu.`],
    ],
  }),
  numeric({
    id: 'f-tr-4',
    skill: 'fn-transform',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile rozwiązań ma równanie $|x^2 - 4| = 3$?`,
    answer: 4,
    verify: () => {
      const sols = new Set([Math.sqrt(7), -Math.sqrt(7), 1, -1].filter((x) => Math.abs(Math.abs(x * x - 4) - 3) < 1e-9));
      return sols.size;
    },
    hints: ['Na jakie dwa równania rozkłada się to równanie?', r`$x^2 - 4 = 3$ lub $x^2 - 4 = -3$.`, r`$x^2 = 7$ lub $x^2 = 1$.`, 'Każde z tych równań ma dwa rozwiązania.'],
    steps: [r`$x^2 = 7 \Rightarrow x = \pm\sqrt{7}$; $x^2 = 1 \Rightarrow x = \pm 1$.`, 'Razem cztery rozwiązania.'],
    errors: [['2', r`Rozpatrzony tylko przypadek $x^2 - 4 = 3$.`, r`$|w| = 3$ oznacza $w = 3$ lub $w = -3$.`]],
  }),
  choice({
    id: 'f-tr-5',
    skill: 'fn-transform',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Linią ciągłą narysowano wykres $f(x) = x^2 - 4$, a przerywaną — wykres funkcji otrzymanej z $f$. Jest to wykres funkcji`,
    figure: {
      kind: 'plot',
      alt: 'Parabola y = x² − 4 (ciągła) oraz przerywany wykres, który pokrywa się z parabolą poza przedziałem od −2 do 2, a między −2 a 2 jest jej odbiciem nad osią x.',
      x: [-4, 4],
      y: [-5, 6],
      curves: [
        { fn: (x) => x * x - 4, label: 'f' },
        { fn: (x) => Math.abs(x * x - 4), dashed: true },
      ],
    },
    choices: [r`$y = |f(x)|$`, r`$y = f(|x|)$`, r`$y = -f(x)$`, r`$y = f(-x)$`],
    answer: 'A',
    hints: ['Która część wykresu się zmieniła?', r`Tylko fragment, który był pod osią $x$.`, 'Został odbity w górę.', r`Która operacja odbija w górę części pod osią?`],
    steps: ['Część pod osią x została odbita w górę, reszta się nie zmieniła.', r`To wykres $y = |f(x)|$.`],
    errors: [
      ['B', r`Dla tej parzystej funkcji $f(|x|) = f(x)$ — wykres by się nie zmienił.`, r`$f(|x|)$ kopiuje prawą połowę na lewo; tu obie połowy już są takie same.`],
      ['C', r`$-f(x)$ odbiłoby w osi $x$ cały wykres, nie tylko część.`, r`Przy $-f(x)$ ramiona paraboli poszłyby w dół.`],
      ['D', r`Dla tej funkcji $f(-x) = f(x)$ — wykres by się nie zmienił.`, r`$f(-x)$ to odbicie w osi $y$.`],
    ],
  }),
  numeric({
    id: 'f-tr-6',
    skill: 'fn-transform',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Funkcja $f(x) = x^2 - 6x + 5$ ma miejsca zerowe $1$ i $5$. Ile rozwiązań ma równanie $f(|x|) = 0$?`,
    answer: 4,
    verify: () => [-5, -1, 1, 5].filter((x) => Math.abs(x) ** 2 - 6 * Math.abs(x) + 5 === 0).length,
    hints: [r`Co oznacza $f(|x|) = 0$?`, r`$|x|$ musi być miejscem zerowym $f$.`, r`$|x| = 1$ lub $|x| = 5$.`, 'Każde takie równanie ma dwa rozwiązania.'],
    steps: [r`$|x| \in \{1, 5\}$.`, r`$x \in \{-5, -1, 1, 5\}$ — cztery rozwiązania.`],
    errors: [['2', r`$f(|x|)$ potraktowane jak $f(x)$.`, r`Z $|x| = 1$ wychodzą dwa rozwiązania: $1$ i $-1$.`]],
  }),
  numeric({
    id: 'f-tr-7',
    skill: 'fn-transform',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Dla ilu liczb całkowitych $m$ z przedziału $\langle 0, 10 \rangle$ równanie $|x^2 - 4| = m$ ma dokładnie dwa rozwiązania?`,
    answer: 7,
    verify: () => {
      let count = 0;
      for (let m = 0; m <= 10; m += 1) {
        const sols = new Set<number>();
        for (const t of [4 + m, 4 - m]) {
          if (t > 0) {
            sols.add(Math.sqrt(t));
            sols.add(-Math.sqrt(t));
          } else if (t === 0) sols.add(0);
        }
        if (sols.size === 2) count += 1;
      }
      return count;
    },
    hints: [
      r`Jak wygląda wykres $y = |x^2 - 4|$?`,
      r`Kształt „W”: zera w $\pm 2$, lokalne maksimum $4$ w $x = 0$.`,
      r`Pozioma prosta $y = m$: dla $m$ między $0$ a $4$ przecina W cztery razy.`,
      r`Dwa przecięcia: $m = 0$ oraz $m > 4$.`,
    ],
    steps: [
      r`$m = 0$: dwa rozwiązania. $0 < m < 4$: cztery. $m = 4$: trzy. $m > 4$: dwa.`,
      r`Pasuje $m = 0$ i $m = 5, 6, \ldots, 10$ — razem $7$.`,
    ],
    errors: [['6', r`Pominięte $m = 0$ (rozwiązania $\pm 2$).`, 'Sprawdź też skrajną wartość parametru.']],
  }),
  numeric({
    id: 'f-tr-8',
    skill: 'fn-transform',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wykres funkcji $f(x) = |x - 1| - 2$ i oś $x$ ograniczają trójkąt. Oblicz jego pole.`,
    figure: {
      kind: 'plot',
      alt: 'Wykres w kształcie litery V z wierzchołkiem w (1, −2), przecinający oś x w punktach −1 i 3.',
      x: [-3, 5],
      y: [-3, 3],
      curves: [{ fn: (x) => Math.abs(x - 1) - 2, label: 'f' }],
      points: [{ at: [1, -2] }, { at: [-1, 0] }, { at: [3, 0] }],
    },
    answer: 4,
    verify: () => (4 * 2) / 2,
    hints: [
      r`Gdzie wykres przecina oś $x$?`,
      r`Rozwiąż $|x - 1| = 2$ — dostaniesz końce podstawy trójkąta.`,
      'Najniższy punkt wykresu to wierzchołek trójkąta — jego odległość od osi x to wysokość.',
      r`Podstawa od $-1$ do $3$, wysokość $2$; pole to $\frac{a \cdot h}{2}$.`,
    ],
    steps: [r`Podstawa: od $-1$ do $3$, długość $4$. Wysokość: $2$.`, r`$P = \frac{4 \cdot 2}{2} = 4$.`],
    errors: [['8', r`Pole liczone bez dzielenia przez $2$.`, r`Pole trójkąta to $\frac{a \cdot h}{2}$.`]],
  }),

  // -------------------------------------------------------------------------
  // fn-compose (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'f-co-1',
    skill: 'fn-compose',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla $f(x) = x + 5$ i $g(x) = 3x$ oblicz $f(g(2))$.`,
    answer: 11,
    verify: () => 3 * 2 + 5,
    hints: ['Którą funkcję liczysz najpierw?', r`Najpierw $g(2)$ — funkcję wewnętrzną.`, r`$g(2) = 6$.`, r`$f(6) = 6 + 5$.`],
    steps: [r`$g(2) = 6$.`, r`$f(6) = 11$.`],
    errors: [
      ['21', r`Policzone $g(f(2))$ zamiast $f(g(2))$.`, 'Złożenie liczy się od środka.'],
      ['42', r`Policzony iloczyn $f(2) \cdot g(2)$.`, 'Złożenie to wstawienie, nie mnożenie.'],
    ],
  }),
  numeric({
    id: 'f-co-2',
    skill: 'fn-compose',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dla $f(x) = x^2$ i $g(x) = x - 3$ oblicz $g(f(-2))$.`,
    answer: 1,
    verify: () => (-2) ** 2 - 3,
    hints: ['Która funkcja jest wewnętrzna?', r`$f$ — liczysz ją pierwszą: $f(-2) = (-2)^2$.`, r`$f(-2) = 4$.`, r`$g(4) = 4 - 3$.`],
    steps: [r`$f(-2) = 4$.`, r`$g(4) = 1$.`],
    errors: [['25', r`Policzone $f(g(-2)) = (-5)^2$.`, r`W $g(f(x))$ najpierw liczysz $f$.`]],
  }),
  choice({
    id: 'f-co-3',
    skill: 'fn-compose',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Dla $f(x) = 2x + 1$ i $g(x) = x^2$ wzór funkcji $f(g(x))$ to`,
    choices: [r`$2x^2 + 1$`, r`$(2x + 1)^2$`, r`$2x^3 + x^2$`, r`$4x^2 + 1$`],
    answer: 'A',
    hints: [r`Co wstawiasz w miejsce $x$ we wzorze $f$?`, r`Cały wzór $g$, czyli $x^2$.`, r`$f(x^2) = 2 \cdot x^2 + 1$.`, 'Sprawdź dla x = 1: g(1) = 1, f(1) = 3.'],
    steps: [r`$f(g(x)) = f(x^2)$.`, r`$= 2x^2 + 1$.`],
    errors: [
      ['B', r`To jest $g(f(x))$ — odwrócona kolejność.`, r`$f(g(x))$: $g$ wstawiasz do $f$.`],
      ['C', r`To iloczyn $f(x) \cdot g(x)$.`, 'Złożenie to wstawienie, nie mnożenie.'],
      ['D', r`Do kwadratu podniesione $2x$ zamiast samego $x$.`, r`W $f(x^2)$ mnożysz $x^2$ przez $2$.`],
    ],
  }),
  numeric({
    id: 'f-co-4',
    skill: 'fn-compose',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla $f(x) = \frac{1}{x}$ i $g(x) = x - 2$ oblicz $f(g(4)) + g(f(4))$.`,
    answer: -1.25,
    variants: ['-5/4'],
    verify: () => 1 / (4 - 2) + (1 / 4 - 2),
    hints: ['Policz każde złożenie osobno. Od czego zaczynasz w f(g(4))?', r`$g(4) = 2$, więc $f(g(4)) = \frac{1}{2}$.`, r`$f(4) = \frac{1}{4}$, więc $g(f(4)) = \frac{1}{4} - 2$.`, r`$0{,}5 + (-1{,}75)$.`],
    steps: [r`$f(g(4)) = 0{,}5$, $g(f(4)) = -1{,}75$.`, r`Suma: $-1{,}25$.`],
    errors: [['2.25', r`Zgubiony znak: $\frac14 - 2$ policzone jako $1{,}75$.`, r`$0{,}25 - 2 = -1{,}75$.`]],
  }),
  numeric({
    id: 'f-co-5',
    skill: 'fn-compose',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Funkcja $h(x) = f(g(x))$, gdzie $g(x) = x + 1$ oraz $h(x) = x^2 + 2x + 1$. Oblicz $f(5)$.`,
    answer: 25,
    verify: () => 5 ** 2,
    hints: [r`Jak zapisać $h(x)$ przy pomocy $x + 1$?`, r`$x^2 + 2x + 1 = (x + 1)^2$.`, r`Czyli $f(x + 1) = (x + 1)^2$ — funkcja $f$ podnosi do kwadratu.`, r`$f(5) = 5^2$.`],
    steps: [r`$h(x) = (x + 1)^2 = f(x + 1)$, więc $f(t) = t^2$.`, r`$f(5) = 25$.`],
    errors: [['36', r`Policzone $h(5)$ zamiast $f(5)$.`, r`$h(5) = f(g(5)) = f(6)$ — to nie to samo co $f(5)$.`]],
  }),
  numeric({
    id: 'f-co-6',
    skill: 'fn-compose',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ile liczb całkowitych należy do dziedziny funkcji $h(x) = f(g(x))$, gdzie $f(x) = \sqrt{x}$ i $g(x) = 9 - x^2$?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let x = -20; x <= 20; x += 1) if (9 - x * x >= 0) n += 1;
      return n;
    },
    hints: [r`Jaki warunek stawia funkcja zewnętrzna $f$?`, r`Pod pierwiastkiem: $9 - x^2 \ge 0$.`, r`$x^2 \le 9$, czyli $-3 \le x \le 3$.`, 'Policz liczby całkowite w tym przedziale.'],
    steps: [r`$9 - x^2 \ge 0 \iff x \in \langle -3, 3 \rangle$.`, r`Liczby całkowite: od $-3$ do $3$ — siedem.`],
    errors: [['4', r`Uwzględnione tylko $x \ge 0$.`, r`$x^2 \le 9$ spełniają też liczby ujemne.`]],
  }),
  numeric({
    id: 'f-co-7',
    skill: 'fn-compose',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Cena w euro zamieniana jest na złote wzorem $z(e) = 4{,}3e$, a do ceny w złotych doliczany jest podatek: $b(z) = 1{,}23z$. Oblicz $b(z(100))$.`,
    answer: 528.9,
    tolerance: 0.001,
    verify: () => 1.23 * (4.3 * 100),
    hints: ['Od której funkcji zaczynasz?', r`Od wewnętrznej: $z(100) = 430$.`, r`$b(430) = 1{,}23 \cdot 430$.`, r`$430 + 0{,}23 \cdot 430$.`],
    steps: [r`$z(100) = 430$ zł.`, r`$b(430) = 528{,}9$ zł.`],
    errors: [['430', 'Pominięta druga funkcja (podatek).', 'Złożenie wymaga zastosowania obu funkcji po kolei.']],
  }),
  numeric({
    id: 'f-co-8',
    skill: 'fn-compose',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla $f(x) = 2x - 3$ wyznacz liczbę $a$, dla której $f(f(a)) = a$.`,
    answer: 3,
    verify: () => 9 / 3,
    hints: [r`Jak wygląda wzór $f(f(x))$?`, r`$f(f(x)) = 2(2x - 3) - 3$.`, r`$4x - 9$.`, r`$4a - 9 = a$.`],
    steps: [r`$f(f(a)) = 4a - 9$.`, r`$4a - 9 = a \Rightarrow a = 3$.`],
    errors: [['1.5', r`Rozwiązane $f(a) = 0$ zamiast $f(f(a)) = a$.`, 'Najpierw wyznacz wzór złożenia, potem przyrównaj do a.']],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const FUNCTIONS_CARDS: Flashcard[] = [
  card('c-fn-bas-1', 'fn-basics', 'definicja', 'Miejsce zerowe funkcji?', r`Argument $x$, dla którego $f(x) = 0$ — tam wykres przecina oś $x$.`),
  card('c-fn-bas-2', 'fn-basics', 'metoda', 'Dwa warunki dziedziny w zadaniach maturalnych?', r`Mianownik $\ne 0$ oraz wyrażenie pod pierwiastkiem kwadratowym $\ge 0$.`),
  card('c-fn-bas-3', 'fn-basics', 'pulapka', r`Jak wstawić $x = -2$ do $x^2$?`, r`W nawiasie: $(-2)^2 = 4$, a nie $-2^2 = -4$.`),

  card('c-fn-gr-1', 'fn-graph', 'metoda', 'Z której osi czytasz dziedzinę, a z której zbiór wartości?', r`Dziedzina i monotoniczność — oś $x$. Wartości i zbiór wartości — oś $y$.`),
  card('c-fn-gr-2', 'fn-graph', 'definicja', r`$f(x) > 0$ na wykresie?`, r`Te $x$, dla których wykres leży nad osią $x$.`),
  card('c-fn-gr-3', 'fn-graph', 'metoda', r`Jak graficznie rozwiązać $f(x) = c$?`, r`Narysuj prostą $y = c$ i policz punkty wspólne z wykresem.`),

  card('c-fn-sh-1', 'fn-shift', 'wzor', r`$y = f(x - a) + b$ to przesunięcie o?`, r`Wektor $[a, b]$: o $a$ w prawo i o $b$ w górę.`),
  card('c-fn-sh-2', 'fn-shift', 'pulapka', r`$f(x + 3)$ — w którą stronę?`, 'W LEWO o 3. Plus w nawiasie to ruch w stronę minusów.'),

  card('c-fn-tr-1', 'fn-transform', 'wzor', r`$-f(x)$ i $f(-x)$?`, r`$-f(x)$: odbicie w osi $x$. $f(-x)$: odbicie w osi $y$.`),
  card('c-fn-tr-2', 'fn-transform', 'pulapka', r`$|f(x)|$ a $f(|x|)$?`, r`$|f(x)|$ odbija w górę części pod osią. $f(|x|)$ kopiuje prawą połowę wykresu na lewo.`),

  card('c-fn-co-1', 'fn-compose', 'definicja', r`$(f \circ g)(x) = \;?$`, r`$f(g(x))$ — najpierw $g$, potem $f$.`),
  card('c-fn-co-2', 'fn-compose', 'pulapka', r`Czy $f(g(x)) = f(x) \cdot g(x)$?`, 'Nie — złożenie to wstawienie jednej funkcji do drugiej.'),
];

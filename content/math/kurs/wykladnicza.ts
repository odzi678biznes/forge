import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, text, tip, warn } from '../../authoring';
import { LOG_QUESTIONS, LOG_TOPIC } from '../logarytmy';

/**
 * Dział 8: Funkcja wykładnicza i logarytmy.
 *
 * Włącza do kursu trzy umiejętności z pierwszego wycinka treści (definicja
 * logarytmu, działania na logarytmach, równania wykładnicze) - z ich
 * identyfikatorami i zadaniami, żeby zapisany postęp nie przepadł - i dopisuje
 * funkcję wykładniczą, modele wzrostu, funkcję logarytmiczną oraz równania
 * i nierówności logarytmiczne.
 */

const r = String.raw;

export const EXP_TOPIC: Topic = {
  ...LOG_TOPIC,
  summary:
    'Funkcja wykładnicza, procent składany i zanik, logarytm i jego własności, funkcja logarytmiczna, równania i nierówności.',
};

export const EXP_SKILLS: Skill[] = [
  {
    id: 'exp-function',
    topicId: 'math-logarithms',
    name: 'Funkcja wykładnicza: wykres i własności',
    level: 'PP',
    ckeRequirement: 'Funkcja wykładnicza — wykres, monotoniczność, wartości',
    prerequisites: ['num-powers', 'fn-graph'],
    examValue: 0.55,
  },
  {
    id: 'exp-equations',
    topicId: 'math-logarithms',
    name: 'Równania wykładnicze',
    level: 'PP',
    ckeRequirement: 'Funkcja wykładnicza — równania sprowadzalne do wspólnej podstawy',
    prerequisites: ['exp-function'],
    examValue: 0.7,
  },
  {
    id: 'exp-model',
    topicId: 'math-logarithms',
    name: 'Wzrost i zanik wykładniczy, procent składany',
    level: 'PP',
    ckeRequirement: 'Funkcja wykładnicza — opis zjawisk: procent składany, wzrost i zanik',
    prerequisites: ['exp-function', 'num-percent'],
    examValue: 0.6,
  },
  {
    id: 'log-basic',
    topicId: 'math-logarithms',
    name: 'Definicja logarytmu',
    level: 'PP',
    ckeRequirement: 'Logarytmy — definicja i obliczanie',
    prerequisites: ['num-powers', 'exp-equations'],
    examValue: 0.7,
  },
  {
    id: 'log-properties',
    topicId: 'math-logarithms',
    name: 'Działania na logarytmach',
    level: 'PP',
    ckeRequirement: 'Logarytmy — logarytm iloczynu, ilorazu, potęgi; zamiana podstawy',
    prerequisites: ['log-basic'],
    examValue: 0.75,
  },
  {
    id: 'log-function',
    topicId: 'math-logarithms',
    name: 'Funkcja logarytmiczna',
    level: 'PR',
    ckeRequirement: 'Funkcja logarytmiczna — dziedzina, wykres, przesunięcia',
    prerequisites: ['log-properties', 'fn-shift'],
    examValue: 0.5,
  },
  {
    id: 'log-equations',
    topicId: 'math-logarithms',
    name: 'Równania i nierówności wykładnicze i logarytmiczne',
    level: 'PR',
    ckeRequirement: 'Równania i nierówności wykładnicze i logarytmiczne — dziedzina, monotoniczność, podstawienie',
    prerequisites: ['log-function', 'exp-equations', 'quad-discriminant'],
    examValue: 0.65,
  },
];

const pow2 = (x: number) => 2 ** x;
const half = (x: number) => 0.5 ** x;
const log2 = (x: number) => Math.log2(x);

// ===========================================================================
// Lekcje
// ===========================================================================

export const EXP_LESSONS: Lesson[] = [
  {
    skillId: 'exp-function',
    minutes: 10,
    intro:
      r`Funkcja wykładnicza to $f(x) = a^x$ — zmienna siedzi w wykładniku. Opisuje wszystko, co rośnie albo maleje „o ten sam procent”: lokaty, bakterie, rozpad promieniotwórczy.`,
    blocks: [
      f(r`f(x) = a^x, \qquad a > 0,\ a \ne 1`),
      p(r`Dla $a > 1$ funkcja rośnie, dla $0 < a < 1$ maleje. Zawsze przechodzi przez punkt $(0, 1)$, bo $a^0 = 1$, i zawsze jest dodatnia — wykres nigdy nie dotyka osi $x$.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykresy funkcji 2 do potęgi x (rosnąca) i jedna druga do potęgi x (malejąca). Obie przechodzą przez punkt (0, 1) i leżą nad osią x.',
          x: [-3, 3],
          y: [-1, 9],
          curves: [
            { fn: pow2, label: 'y = 2^x' },
            { fn: half, label: 'y = (1/2)^x', dashed: true },
          ],
          points: [{ at: [0, 1] }],
        },
        caption: 'Linia ciągła: 2^x rośnie. Przerywana: (1/2)^x maleje. Obie przez (0, 1).',
      },
      tip(r`Zbiór wartości $a^x$ to $(0, +\infty)$. Po przesunięciu $a^x + q$ — zbiór wartości $(q, +\infty)$, a asymptotą jest prosta $y = q$.`),
      warn(r`$2^{-3}$ to nie $-8$. Ujemny wykładnik daje odwrotność: $2^{-3} = \frac{1}{8}$.`),
    ],
    examples: [
      example(
        r`Dla $f(x) = 3^x$ oblicz $f(-2)$.`,
        [r`$3^{-2} = \frac{1}{3^2}$.`, r`$= \frac{1}{9}$.`],
        r`$\frac{1}{9}$`,
      ),
      example(
        r`Wykres $f(x) = a^x$ przechodzi przez punkt $(2, 25)$. Oblicz $a$.`,
        [r`$a^2 = 25$.`, [r`$a = 5$`, r`bo podstawa funkcji wykładniczej jest dodatnia, więc $-5$ odpada.`]],
        r`$a = 5$`,
      ),
    ],
    pitfalls: [r`$a^{-n}$ to odwrotność, nie liczba ujemna.`, r`Ujemna podstawa — $a$ musi być dodatnie.`, 'Mylenie funkcji wykładniczej z potęgową: 2^x to nie x^2.'],
  },
  {
    skillId: 'exp-equations',
    minutes: 12,
    intro:
      'Równanie wykładnicze rozwiązujesz, sprowadzając obie strony do tej samej podstawy. Wtedy potęgi są równe dokładnie wtedy, gdy równe są wykładniki.',
    blocks: [
      f(r`a^{u} = a^{v} \iff u = v \qquad (a > 0,\ a \ne 1)`),
      p(r`Podstawowe przekształcenia: $\frac{1}{8} = 2^{-3}$, $\sqrt{2} = 2^{\frac12}$, $4^x = (2^2)^x = 2^{2x}$.`),
      tip(r`Gdy w równaniu jest $4^x$ i $2^x$, podstaw $t = 2^x > 0$: wtedy $4^x = t^2$ i dostajesz równanie kwadratowe.`),
      warn(r`Nowa zmienna $t = 2^x$ jest zawsze dodatnia. Ujemne $t$ odrzucasz — nie ma takiego $x$.`),
    ],
    examples: [
      example(
        r`Rozwiąż $3^{x+1} = 81$.`,
        [r`$81 = 3^4$.`, r`$x + 1 = 4$, więc $x = 3$.`],
        r`$x = 3$`,
      ),
      example(
        r`Rozwiąż $4^x = 8$.`,
        [r`$4^x = 2^{2x}$, a $8 = 2^3$.`, r`$2x = 3$, więc $x = \frac{3}{2}$.`],
        r`$x = \frac32$`,
      ),
    ],
    pitfalls: ['Porównywanie wykładników przy różnych podstawach.', r`Zapisanie $\frac18$ jako $2^3$ zamiast $2^{-3}$.`, r`Ujemne $t$ przy podstawieniu $t = 2^x$.`],
  },
  {
    skillId: 'exp-model',
    minutes: 10,
    intro:
      'Gdy coś zmienia się co okres o ten sam procent, jego wartość po n okresach opisuje funkcja wykładnicza. Tak liczy się lokaty, kredyty, wzrost populacji i zanik leku we krwi.',
    blocks: [
      f(r`K_n = K_0 \left(1 + \frac{p}{100}\right)^{n}`, 'procent składany: p% na okres, n okresów'),
      p(r`Spadek o $p\%$ to mnożenie przez $\left(1 - \frac{p}{100}\right)$. Po dwóch spadkach o $10\%$ zostaje $0{,}9^2 = 0{,}81$, czyli $81\%$ — a nie $80\%$.`),
      tip(r`Kapitalizacja co kwartał przy oprocentowaniu rocznym $p\%$: stopa na okres to $\frac{p}{4}\%$, a okresów w roku jest $4$.`),
      warn('Procent składany to nie procent prosty: odsetki doliczają się do kapitału i same zarabiają odsetki.'),
    ],
    examples: [
      example(
        r`Lokata $1000$ zł na $5\%$ rocznie, kapitalizacja roczna. Ile będzie po $2$ latach?`,
        [r`$K_2 = 1000 \cdot 1{,}05^2$.`, r`$= 1000 \cdot 1{,}1025 = 1102{,}50$ zł.`],
        r`$1102{,}50$ zł`,
      ),
      example(
        r`Lek zanika we krwi o połowę co $4$ godziny. Ile zostanie z $80$ mg po $12$ godzinach?`,
        [r`$12$ godzin to $3$ okresy półtrwania.`, r`$80 \cdot \left(\frac12\right)^3 = 10$ mg.`],
        r`$10$ mg`,
      ),
    ],
    pitfalls: ['Liczenie procentu prostego zamiast składanego.', 'Zła liczba okresów przy kapitalizacji częstszej niż roczna.', 'Dwa spadki po 10% to nie spadek o 20%.'],
  },
  {
    skillId: 'log-basic',
    minutes: 10,
    intro:
      r`Logarytm odpowiada na pytanie: do której potęgi trzeba podnieść podstawę, żeby dostać daną liczbę? $\log_2 8 = 3$, bo $2^3 = 8$. To odwrotność potęgowania, tak jak odejmowanie jest odwrotnością dodawania.`,
    blocks: [
      f(r`\log_a b = c \iff a^c = b \qquad (a > 0,\ a \ne 1,\ b > 0)`),
      p(r`Zawsze: $\log_a 1 = 0$ i $\log_a a = 1$. Zapis $\log b$ bez podstawy oznacza podstawę $10$: $\log 1000 = 3$.`),
      tip(r`Gdy nie widzisz wyniku, zapisz obie liczby jako potęgi tej samej podstawy: $\log_4 8$ — $4 = 2^2$, $8 = 2^3$, więc $4^{\frac32} = 8$ i wynik to $\frac32$.`),
      warn(r`Logarytm liczby ujemnej ani zera nie istnieje: $\log_2(-4)$ nie ma sensu, bo $2^c$ jest zawsze dodatnie.`),
    ],
    examples: [
      example(
        r`Oblicz $\log_3 \frac{1}{9}$.`,
        [r`Szukam $c$: $3^c = \frac19$.`, r`$\frac19 = 3^{-2}$, więc $c = -2$.`],
        r`$-2$`,
      ),
      example(
        r`Oblicz $\log_{\sqrt{2}} 4$.`,
        [r`$\sqrt2 = 2^{\frac12}$, $4 = 2^2$.`, r`$\left(2^{\frac12}\right)^c = 2^2 \Rightarrow \frac{c}{2} = 2$, więc $c = 4$.`],
        r`$4$`,
      ),
    ],
    pitfalls: ['Logarytm policzony jak dzielenie.', 'Zgubiony minus dla liczb mniejszych od 1.', 'Logarytm z liczby ujemnej.'],
  },
  {
    skillId: 'log-properties',
    minutes: 14,
    intro:
      'Własności logarytmów wynikają wprost z praw działań na potęgach. Pozwalają zamienić mnożenie w dodawanie — dlatego przed kalkulatorami inżynierowie liczyli na tablicach logarytmów.',
    blocks: [
      f(r`\log_a (xy) = \log_a x + \log_a y \qquad \log_a \frac{x}{y} = \log_a x - \log_a y`),
      f(r`\log_a x^k = k \log_a x`),
      f(r`\log_a b = \frac{\log_c b}{\log_c a}`, 'zamiana podstawy (jest w tablicach CKE)'),
      p(r`Wzorów używasz w obie strony: $\log_6 2 + \log_6 3 = \log_6 6 = 1$ — dwie „brzydkie” liczby sklejają się w ładną.`),
      warn(r`$\log_a (x + y)$ NIE jest równe $\log_a x + \log_a y$. Wzór dotyczy iloczynu, nie sumy.`),
    ],
    examples: [
      example(
        r`Oblicz $\log_3 54 - \log_3 2$.`,
        [r`$\log_3 \frac{54}{2} = \log_3 27$.`, r`$= 3$.`],
        r`$3$`,
      ),
      example(
        r`Wiedząc, że $\log_2 3 = a$, wyraź $\log_2 18$ przez $a$.`,
        [r`$18 = 2 \cdot 3^2$.`, r`$\log_2 18 = \log_2 2 + 2 \log_2 3 = 1 + 2a$.`],
        r`$1 + 2a$`,
      ),
    ],
    pitfalls: ['Logarytm sumy rozbity na sumę logarytmów.', r`$\log x^2$ policzone jako $(\log x)^2$.`, 'Dzielenie logarytmów pomylone z logarytmem ilorazu.'],
  },
  {
    skillId: 'log-function',
    minutes: 10,
    intro:
      r`Funkcja $f(x) = \log_a x$ to odwrotność funkcji wykładniczej: jej wykres to wykres $a^x$ odbity względem prostej $y = x$. Rośnie powoli, ale bez końca.`,
    blocks: [
      p(r`Dziedzina $\log_a x$ to $(0, +\infty)$, zbiór wartości — wszystkie liczby rzeczywiste. Wykres przechodzi przez $(1, 0)$, a oś $y$ jest asymptotą pionową.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres funkcji logarytm o podstawie 2 z x: rośnie, przechodzi przez punkty (1, 0), (2, 1) i (4, 2), zbliża się do osi y dla x bliskich zera.',
          x: [-1, 8],
          y: [-3, 4],
          curves: [{ fn: log2, from: 0.13, to: 8, label: 'y = log₂x' }],
          points: [{ at: [1, 0] }, { at: [2, 1] }, { at: [4, 2] }],
        },
        caption: 'log₂x: dziedzina x > 0, miejsce zerowe x = 1.',
      },
      tip(r`Dziedzinę $\log_a (g(x))$ wyznaczasz z warunku $g(x) > 0$. Dla $\log_2 (x - 3)$: $x > 3$.`),
      warn(r`Przesunięcie $\log_2 (x - 3)$ to przesunięcie o $3$ w PRAWO, tak jak w każdej funkcji.`),
    ],
    examples: [
      example(
        r`Wyznacz dziedzinę $f(x) = \log (4 - x^2)$.`,
        [r`$4 - x^2 > 0 \iff x^2 < 4$.`, r`$x \in (-2, 2)$.`],
        r`$(-2, 2)$`,
      ),
      example(
        r`Wykres $f(x) = \log_a x$ przechodzi przez punkt $(9, 2)$. Oblicz $a$.`,
        [r`$\log_a 9 = 2 \iff a^2 = 9$.`, r`$a = 3$ (podstawa dodatnia).`],
        r`$a = 3$`,
      ),
    ],
    pitfalls: [r`Dziedzina z warunkiem $\ge 0$ zamiast $> 0$.`, 'Przesunięcie w złą stronę.', 'Zapomniana asymptota pionowa.'],
  },
  {
    skillId: 'log-equations',
    minutes: 15,
    intro:
      'Równania i nierówności logarytmiczne rozwiązujesz w trzech krokach: dziedzina, sprowadzenie obu stron do logarytmu o tej samej podstawie, porównanie argumentów. Przy nierównościach decyduje jeszcze to, czy podstawa jest większa od 1.',
    blocks: [
      f(r`\log_a u = \log_a v \iff u = v \qquad (u, v > 0)`),
      p(r`Zawsze zaczynaj od dziedziny i na końcu sprawdź, czy rozwiązania do niej należą. Na maturze rozszerzonej brak dziedziny kosztuje punkt nawet przy dobrym wyniku.`),
      f(r`a > 1:\ \log_a u < \log_a v \iff u < v \qquad 0 < a < 1:\ \text{znak się odwraca}`),
      tip(r`Równanie typu $4^x - 3 \cdot 2^x - 4 = 0$: podstaw $t = 2^x > 0$, rozwiąż kwadratowe, odrzuć ujemne $t$.`),
      warn(r`Dla podstawy z przedziału $(0, 1)$ funkcja maleje — przy przejściu do argumentów odwracasz znak nierówności. To samo dotyczy $\left(\frac12\right)^x$.`),
    ],
    examples: [
      example(
        r`Rozwiąż $\log_2 (x - 1) + \log_2 (x + 1) = 3$.`,
        [
          r`Dziedzina: $x > 1$.`,
          r`$\log_2 \big((x - 1)(x + 1)\big) = 3 \Rightarrow x^2 - 1 = 8$.`,
          r`$x = \pm 3$, ale $-3$ nie należy do dziedziny.`,
        ],
        r`$x = 3$`,
      ),
      example(
        r`Rozwiąż $\left(\frac12\right)^x > 4$.`,
        [r`$4 = \left(\frac12\right)^{-2}$.`, r`Podstawa mniejsza od $1$ — odwracam znak: $x < -2$.`],
        r`$x \in (-\infty, -2)$`,
      ),
    ],
    pitfalls: ['Brak dziedziny — rozwiązanie spoza niej zostaje w odpowiedzi.', 'Nieodwrócony znak przy podstawie mniejszej od 1.', r`Ujemne $t$ po podstawieniu $t = a^x$.`],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const NEW_QUESTIONS: Question[] = [
  // exp-function --------------------------------------------------------------
  numeric({
    id: 'x-fn-1',
    skill: 'exp-function',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla $f(x) = 2^x$ oblicz $f(5)$.`,
    answer: 32,
    verify: () => 2 ** 5,
    hints: ['Co oznacza zapis 2 do potęgi 5?', 'Pięć dwójek pomnożonych przez siebie.', r`$2 \cdot 2 \cdot 2 \cdot 2 \cdot 2$.`, 'Mnóż po kolei: 2, 4, 8, …'],
    steps: [r`$f(5) = 2^5$.`, r`$= 32$.`],
    errors: [['10', r`Policzone $2 \cdot 5$ zamiast $2^5$.`, 'Potęga to wielokrotne mnożenie przez podstawę.']],
  }),
  numeric({
    id: 'x-fn-2',
    skill: 'exp-function',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dla $f(x) = 3^x$ oblicz $f(-2)$.`,
    answer: '1/9',
    verify: () => 3 ** -2,
    hints: ['Co robi ujemny wykładnik?', r`$a^{-n} = \frac{1}{a^n}$.`, r`$3^{-2} = \frac{1}{3^2}$.`, 'Policz mianownik.'],
    steps: [r`$3^{-2} = \frac{1}{9}$.`, r`$f(-2) = \frac19$.`],
    errors: [
      ['-9', 'Ujemny wykładnik potraktowany jak minus przed wynikiem.', r`$a^{-n}$ to odwrotność, nie liczba ujemna.`],
      ['-6', r`Policzone $3 \cdot (-2)$.`, 'Potęga to nie mnożenie przez wykładnik.'],
    ],
  }),
  choice({
    id: 'x-fn-3',
    skill: 'exp-function',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = \left(\frac{2}{3}\right)^x$ jest`,
    choices: ['malejąca', 'rosnąca', 'stała', 'rosnąca dla x < 0 i malejąca dla x > 0'],
    answer: 'A',
    hints: ['Od czego zależy monotoniczność funkcji wykładniczej?', 'Od tego, czy podstawa jest większa, czy mniejsza od 1.', r`Czy $\frac23$ jest większe od $1$?`, r`$0 < \frac23 < 1$.`],
    steps: [r`Podstawa $\frac23 \in (0, 1)$.`, 'Funkcja wykładnicza o takiej podstawie maleje.'],
    errors: [
      ['B', 'Każda funkcja wykładnicza uznana za rosnącą.', 'Dla podstawy z (0, 1) funkcja maleje.'],
      ['C', 'Stała jest tylko dla podstawy 1, a ta jest wykluczona.', r`$\frac23 \ne 1$.`],
      ['D', 'Wymyślona zmiana monotoniczności.', 'Funkcja wykładnicza jest monotoniczna na całej dziedzinie.'],
    ],
  }),
  numeric({
    id: 'x-fn-4',
    skill: 'exp-function',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wykres funkcji $f(x) = a^x$ przechodzi przez punkt $(2, 49)$. Oblicz $a$.`,
    answer: 7,
    verify: () => Math.sqrt(49),
    hints: ['Co znaczy, że punkt należy do wykresu?', r`$f(2) = 49$, czyli $a^2 = 49$.`, r`Podstawa funkcji wykładniczej jest dodatnia.`, 'Weź dodatni pierwiastek.'],
    steps: [r`$a^2 = 49$.`, r`$a = 7$ (bo $a > 0$).`],
    errors: [['-7', 'Wzięty ujemny pierwiastek.', 'Podstawa funkcji wykładniczej musi być dodatnia.']],
  }),
  numeric({
    id: 'x-fn-5',
    skill: 'exp-function',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Funkcja $f(x) = 2^x - 5$ ma zbiór wartości $(q, +\infty)$. Podaj $q$.`,
    answer: -5,
    verify: () => 0 - 5,
    hints: [r`Jaki zbiór wartości ma samo $2^x$?`, r`$(0, +\infty)$.`, r`Odjęcie $5$ przesuwa wykres w dół.`, 'Przesuń dolną granicę.'],
    steps: [r`$2^x > 0$, więc $2^x - 5 > -5$.`, r`Zbiór wartości $(-5, +\infty)$.`],
    errors: [['0', 'Pominięte przesunięcie w dół.', 'Dodanie liczby do wzoru przesuwa zbiór wartości.']],
  }),
  choice({
    id: 'x-fn-6',
    skill: 'exp-function',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku jest wykres funkcji $f(x) = a^x$. Wynika z niego, że`,
    figure: {
      kind: 'plot',
      alt: 'Malejący wykres funkcji wykładniczej przechodzący przez punkty (0, 1) i (−1, 3).',
      x: [-2, 3],
      y: [-1, 9],
      curves: [{ fn: (x: number) => (1 / 3) ** x, from: -2, to: 3 }],
      points: [{ at: [0, 1] }, { at: [-1, 3] }],
    },
    choices: [r`$a = \frac13$`, r`$a = 3$`, r`$a = -3$`, r`$a = -\frac13$`],
    answer: 'A',
    verify: () => 1 / 3,
    hints: ['Który punkt z wykresu da równanie na a?', r`$f(-1) = 3$, czyli $a^{-1} = 3$.`, r`$a^{-1} = \frac1a$.`, r`$\frac{1}{a} = 3$.`],
    steps: [r`$a^{-1} = 3 \Rightarrow a = \frac13$.`, 'Zgadza się z tym, że wykres maleje.'],
    errors: [
      ['B', 'Pominięty minus w wykładniku punktu (−1, 3).', r`Dla $a = 3$ wykres by rósł, a ten maleje.`],
      ['C', 'Ujemna podstawa.', 'Podstawa funkcji wykładniczej jest dodatnia.'],
      ['D', 'Ujemna podstawa.', 'Podstawa funkcji wykładniczej jest dodatnia.'],
    ],
  }),
  numeric({
    id: 'x-fn-7',
    skill: 'exp-function',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Funkcja $f(x) = 2^{x - 1} + q$ przyjmuje w punkcie $x = 3$ wartość $1$. Podaj równanie asymptoty poziomej jej wykresu w postaci $y = c$ — wpisz $c$.`,
    answer: -3,
    verify: () => 1 - 2 ** (3 - 1),
    hints: ['Z której informacji wyznaczysz q?', r`$f(3) = 2^{2} + q = 1$.`, r`Asymptotą $2^{x-1} + q$ jest prosta $y = q$.`, r`Wyznacz $q$ z równania $4 + q = 1$.`],
    steps: [r`$4 + q = 1 \Rightarrow q = -3$.`, r`Asymptota: $y = -3$.`],
    errors: [['0', 'Wzięta asymptota funkcji bez przesunięcia.', r`Przesunięcie o $q$ przesuwa też asymptotę.`]],
  }),
  numeric({
    id: 'x-fn-8',
    skill: 'exp-function',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile rozwiązań ma równanie $2^x = 3 - x$? (Wskazówka: pomyśl o wykresach obu stron).`,
    answer: 1,
    verify: () => {
      // 2^x rośnie, 3 - x maleje, więc przecinają się co najwyżej raz; w x = 1 obie strony dają 2.
      let n = 0;
      for (let x = -10; x < 10; x += 0.001) {
        const a = 2 ** x - (3 - x);
        const b = 2 ** (x + 0.001) - (3 - (x + 0.001));
        if (a === 0 || a * b < 0) n += 1;
      }
      return n;
    },
    hints: ['Jaki kształt mają wykresy obu stron?', r`$2^x$ rośnie, $3 - x$ maleje.`, 'Ile razy mogą się przeciąć wykres rosnący i malejący?', r`Sprawdź, czy dla $x = 1$ obie strony są równe.`],
    steps: [r`Funkcja rosnąca i malejąca przecinają się najwyżej raz.`, r`Dla $x = 1$: $2 = 2$ — jest dokładnie jedno rozwiązanie.`],
    errors: [['2', 'Zgadnięte dwa przecięcia, jak u paraboli z prostą.', 'Wykres rosnący i malejący mają najwyżej jeden punkt wspólny.']],
  }),

  // exp-equations (dopisane do czterech pierwotnych) --------------------------
  numeric({
    id: 'x-eq-1',
    skill: 'exp-equations',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż równanie $5^x = 125$.`,
    answer: 3,
    variants: ['x=3'],
    verify: () => Math.log(125) / Math.log(5),
    hints: ['Jaką potęgą piątki jest 125?', r`$5 \cdot 5 = 25$, $25 \cdot 5 = 125$.`, r`$5^x = 5^{?}$.`, 'Porównaj wykładniki.'],
    steps: [r`$125 = 5^3$.`, r`$x = 3$.`],
    errors: [['25', 'Wynik dzielenia 125 : 5 zamiast wykładnika.', 'Szukasz wykładnika potęgi.']],
  }),
  numeric({
    id: 'x-eq-2',
    skill: 'exp-equations',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $9^{x} = 27$.`,
    answer: 1.5,
    variants: ['3/2', 'x=1.5'],
    verify: () => 3 / 2,
    hints: ['Jaka wspólna podstawa pasuje do 9 i 27?', r`$9 = 3^2$, $27 = 3^3$.`, r`$3^{2x} = 3^3$.`, r`$2x = 3$.`],
    steps: [r`$3^{2x} = 3^3$.`, r`$x = \frac32$.`],
    errors: [['3', r`Porównane $x$ z $3$ bez uwzględnienia $9 = 3^2$.`, r`$9^x = 3^{2x}$.`]],
  }),
  numeric({
    id: 'x-eq-3',
    skill: 'exp-equations',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $2^{x+3} - 2^{x} = 56$.`,
    answer: 3,
    variants: ['x=3'],
    verify: () => Math.log2(56 / (8 - 1)),
    hints: ['Co można wyłączyć przed nawias?', r`$2^{x+3} = 8 \cdot 2^x$.`, r`$2^x (8 - 1) = 56$.`, r`$2^x = 8$.`],
    steps: [r`$7 \cdot 2^x = 56 \Rightarrow 2^x = 8$.`, r`$x = 3$.`],
    errors: [['8', r`Podane $2^x$ zamiast $x$.`, r`Z $2^x = 8$ trzeba jeszcze wyznaczyć wykładnik.`]],
  }),
  numeric({
    id: 'x-eq-4',
    skill: 'exp-equations',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Rozwiąż równanie $4^x - 3 \cdot 2^x - 4 = 0$.`,
    answer: 2,
    variants: ['x=2'],
    verify: () => {
      // t = 2^x: t^2 - 3t - 4 = 0 -> t = 4 lub t = -1
      const t = (3 + Math.sqrt(9 + 16)) / 2;
      return Math.log2(t);
    },
    hints: ['Jakie podstawienie zamieni to w równanie kwadratowe?', r`$t = 2^x > 0$, wtedy $4^x = t^2$.`, r`$t^2 - 3t - 4 = 0$: $t = 4$ lub $t = -1$.`, r`Które $t$ może być równe $2^x$?`],
    steps: [r`$t = 4$ lub $t = -1$; $t = -1$ odpada, bo $2^x > 0$.`, r`$2^x = 4 \Rightarrow x = 2$.`],
    errors: [['4', r`Podane $t$ zamiast $x$.`, r`Po znalezieniu $t$ wróć do $2^x = t$.`]],
  }),

  // exp-model -----------------------------------------------------------------
  numeric({
    id: 'x-mod-1',
    skill: 'exp-model',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Liczba bakterii podwaja się co godzinę. Na początku było ich $100$. Ile będzie po $3$ godzinach?`,
    answer: 800,
    verify: () => 100 * 2 ** 3,
    hints: ['Co dzieje się z liczbą bakterii co godzinę?', 'Mnoży się przez 2.', r`$100 \cdot 2 \cdot 2 \cdot 2$.`, r`$100 \cdot 2^3$.`],
    steps: [r`$100 \cdot 2^3$.`, r`$= 800$.`],
    errors: [['600', r`Policzone $100 \cdot 2 \cdot 3$.`, 'Podwajanie co godzinę to potęga, nie mnożenie przez liczbę godzin.']],
  }),
  numeric({
    id: 'x-mod-2',
    skill: 'exp-model',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Wpłacasz $2000$ zł na lokatę $5\%$ w skali roku z roczną kapitalizacją. Ile złotych będzie na lokacie po $2$ latach?`,
    answer: 2205,
    verify: () => 2000 * 1.05 ** 2,
    tolerance: 0.001,
    hints: ['Przez jaką liczbę mnoży się kapitał co roku?', r`Przez $1{,}05$.`, r`$2000 \cdot 1{,}05^2$.`, r`$1{,}05^2 = 1{,}1025$.`],
    steps: [r`$2000 \cdot 1{,}1025$.`, r`$= 2205$ zł.`],
    errors: [['2200', 'Procent prosty — odsetki od odsetek pominięte.', 'Przy procencie składanym odsetki doliczają się do kapitału.']],
  }),
  choice({
    id: 'x-mod-3',
    skill: 'exp-model',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Cenę obniżono o $10\%$, a potem nową cenę jeszcze raz o $10\%$. Łącznie cena spadła o`,
    choices: [r`$19\%$`, r`$20\%$`, r`$21\%$`, r`$1\%$`],
    answer: 'A',
    verify: () => (1 - 0.9 ** 2) * 100,
    hints: ['Przez jaką liczbę mnożysz cenę przy każdej obniżce?', r`Przez $0{,}9$.`, r`Po dwóch obniżkach: $0{,}9^2 = 0{,}81$.`, r`Ile to procent mniej niż $1$?`],
    steps: [r`$0{,}9^2 = 0{,}81$ ceny.`, r`Spadek o $19\%$.`],
    errors: [
      ['B', 'Procenty dodane.', 'Druga obniżka liczy się od już obniżonej ceny.'],
      ['C', 'Pomylony kierunek poprawki.', r`$0{,}81$ to $19\%$ mniej, nie $21\%$.`],
      ['D', r`Policzone $0{,}1^2$.`, r`Mnożysz przez to, co zostaje: $0{,}9$.`],
    ],
  }),
  numeric({
    id: 'x-mod-4',
    skill: 'exp-model',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Lek zanika we krwi tak, że co $6$ godzin jego ilość maleje o połowę. Ile miligramów z dawki $120$ mg zostanie po dobie?`,
    answer: 7.5,
    variants: ['15/2'],
    verify: () => 120 * 0.5 ** (24 / 6),
    hints: ['Ile okresów półtrwania mieści się w dobie?', r`$24 : 6 = 4$.`, r`$120 \cdot \left(\frac12\right)^4$.`, r`$\left(\frac12\right)^4 = \frac{1}{16}$.`],
    steps: [r`$4$ okresy: $120 \cdot \frac{1}{16}$.`, r`$= 7{,}5$ mg.`],
    errors: [['30', 'Policzone tylko dwa okresy półtrwania.', r`W dobie mieszczą się $4$ okresy po $6$ godzin.`]],
  }),
  numeric({
    id: 'x-mod-5',
    skill: 'exp-model',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Lokata $1000$ zł, oprocentowanie $8\%$ w skali roku, kapitalizacja co kwartał. Ile złotych będzie po pół roku?`,
    answer: 1040.4,
    verify: () => 1000 * 1.02 ** 2,
    tolerance: 0.001,
    hints: ['Jaka jest stopa procentowa na jeden kwartał?', r`$8\% : 4 = 2\%$.`, 'Ile kwartałów to pół roku?', r`$1000 \cdot 1{,}02^2$.`],
    steps: [r`Dwa kwartały po $2\%$: $1000 \cdot 1{,}02^2$.`, r`$= 1040{,}40$ zł.`],
    errors: [['1040', 'Procent prosty albo zaokrąglenie przed końcem.', 'Kapitalizacja składana: 1,02 do kwadratu = 1,0404.']],
  }),
  numeric({
    id: 'x-mod-6',
    skill: 'exp-model',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Populacja miasta rośnie o $2\%$ rocznie. Po ilu pełnych latach po raz pierwszy przekroczy $110\%$ obecnej liczby?`,
    answer: 5,
    verify: () => {
      let n = 0;
      while (1.02 ** n <= 1.1) n += 1;
      return n;
    },
    hints: ['Jaką nierówność trzeba spełnić?', r`$1{,}02^n > 1{,}1$.`, r`Licz kolejne potęgi: $1{,}02^2 = 1{,}0404$, …`, r`Sprawdź $n = 4$ i $n = 5$.`],
    steps: [r`$1{,}02^4 \approx 1{,}0824$, $1{,}02^5 \approx 1{,}1041$.`, r`Pierwszy raz po $5$ latach.`],
    errors: [['4', r`Uznano $1{,}02^4 \approx 1{,}08$ za przekroczenie progu.`, r`$1{,}08 < 1{,}1$ — trzeba jeszcze roku.`]],
  }),
  numeric({
    id: 'x-mod-7',
    skill: 'exp-model',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Samochód traci co roku $20\%$ swojej wartości. Kupiono go za $50\,000$ zł. Ile złotych będzie wart po $3$ latach?`,
    answer: 25600,
    verify: () => 50000 * 0.8 ** 3,
    tolerance: 0.001,
    hints: ['Przez jaką liczbę mnożysz wartość co rok?', r`Przez $0{,}8$.`, r`$50\,000 \cdot 0{,}8^3$.`, r`$0{,}8^3 = 0{,}512$.`],
    steps: [r`$50\,000 \cdot 0{,}512$.`, r`$= 25\,600$ zł.`],
    errors: [['20000', r`Spadek liczony od ceny początkowej ($3 \cdot 20\%$).`, 'Co rok traci 20% aktualnej, a nie początkowej wartości.']],
  }),
  numeric({
    id: 'x-mod-8',
    skill: 'exp-model',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Po $2$ latach na lokacie z roczną kapitalizacją z $5000$ zł zrobiło się $5408$ zł. Jakie było oprocentowanie roczne w procentach?`,
    answer: 4,
    verify: () => (Math.sqrt(5408 / 5000) - 1) * 100,
    tolerance: 1e-9,
    hints: ['Jak zapisać to w postaci równania?', r`$5000 \cdot q^2 = 5408$, gdzie $q = 1 + \frac{p}{100}$.`, r`$q^2 = 1{,}0816$.`, r`$q = 1{,}04$.`],
    steps: [r`$q^2 = \frac{5408}{5000} = 1{,}0816$, więc $q = 1{,}04$.`, r`$p = 4\%$.`],
    errors: [['4.08', r`Przyrost $8{,}16\%$ podzielony przez $2$ lata.`, 'Przy procencie składanym bierzesz pierwiastek, nie dzielisz.']],
  }),

  // log-basic (dopisane) ------------------------------------------------------
  numeric({
    id: 'x-lb-1',
    skill: 'log-basic',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\log 1000$.`,
    answer: 3,
    verify: () => Math.log10(1000),
    hints: ['Jaka jest podstawa logarytmu, gdy jej nie zapisano?', r`Podstawa $10$.`, r`$10^{?} = 1000$.`, 'Policz zera.'],
    steps: [r`$10^3 = 1000$.`, r`$\log 1000 = 3$.`],
    errors: [['100', 'Logarytm potraktowany jak dzielenie przez 10.', 'Logarytm to wykładnik.']],
  }),
  numeric({
    id: 'x-lb-2',
    skill: 'log-basic',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Oblicz $\log_7 1 + \log_5 5$.`,
    answer: 1,
    verify: () => Math.log(1) / Math.log(7) + Math.log(5) / Math.log(5),
    hints: ['Ile wynosi logarytm z jedynki przy dowolnej podstawie?', r`$a^0 = 1$, więc $\log_a 1 = 0$.`, r`$a^1 = a$, więc $\log_a a = 1$.`, 'Dodaj.'],
    steps: [r`$\log_7 1 = 0$, $\log_5 5 = 1$.`, r`Suma: $1$.`],
    errors: [['2', r`Przyjęte $\log_7 1 = 1$.`, r`$\log_a 1 = 0$, bo $a^0 = 1$.`]],
  }),
  numeric({
    id: 'x-lb-3',
    skill: 'log-basic',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz $\log_4 8$.`,
    answer: 1.5,
    variants: ['3/2'],
    verify: () => Math.log(8) / Math.log(4),
    hints: ['Jaką wspólną podstawę mają 4 i 8?', r`$4 = 2^2$, $8 = 2^3$.`, r`$(2^2)^c = 2^3$.`, r`$2c = 3$.`],
    steps: [r`$2^{2c} = 2^3 \Rightarrow c = \frac32$.`, r`$\log_4 8 = \frac32$.`],
    errors: [['2', r`Policzone $8 : 4$.`, 'Logarytm to wykładnik, nie iloraz.']],
  }),
  numeric({
    id: 'x-lb-4',
    skill: 'log-basic',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Oblicz $\log_{\sqrt{3}} 27$.`,
    answer: 6,
    verify: () => Math.log(27) / Math.log(Math.sqrt(3)),
    tolerance: 1e-9,
    hints: [r`Jak zapisać $\sqrt3$ jako potęgę trójki?`, r`$\sqrt3 = 3^{\frac12}$, $27 = 3^3$.`, r`$\left(3^{\frac12}\right)^c = 3^3$.`, r`$\frac{c}{2} = 3$.`],
    steps: [r`$3^{\frac{c}{2}} = 3^3$.`, r`$c = 6$.`],
    errors: [['1.5', r`Podzielone $3 : 2$ zamiast pomnożone.`, r`$\frac{c}{2} = 3 \Rightarrow c = 6$.`]],
  }),

  // log-properties (dopisane) -------------------------------------------------
  numeric({
    id: 'x-lp-1',
    skill: 'log-properties',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\log 4 + \log 25$.`,
    answer: 2,
    verify: () => Math.log10(4) + Math.log10(25),
    tolerance: 1e-9,
    hints: ['Który wzór pozwala zamienić sumę logarytmów w jeden logarytm?', 'Suma logarytmów to logarytm iloczynu.', r`$\log (4 \cdot 25)$.`, r`$\log 100$.`],
    steps: [r`$\log 4 + \log 25 = \log 100$.`, r`$= 2$.`],
    errors: [['29', 'Dodane argumenty zamiast pomnożone.', 'Suma logarytmów to logarytm iloczynu.']],
  }),
  numeric({
    id: 'x-lp-2',
    skill: 'log-properties',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $3\log_2 4 - \log_2 16$.`,
    answer: 2,
    verify: () => 3 * 2 - 4,
    hints: ['Czy łatwiej policzyć każdy logarytm osobno?', r`$\log_2 4 = 2$, $\log_2 16 = 4$.`, r`$3 \cdot 2 - 4$.`, 'Policz.'],
    steps: [r`$3 \cdot 2 - 4$.`, r`$= 2$.`],
    errors: [['-1', r`Współczynnik $3$ zgubiony: $2 - 4$ z błędnym znakiem.`, r`$3\log_2 4 = 3 \cdot 2$.`]],
  }),
  numeric({
    id: 'x-lp-3',
    skill: 'log-properties',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz $\log_3 18 + \log_3 \frac{3}{2}$.`,
    answer: 3,
    verify: () => Math.log(18 * 1.5) / Math.log(3),
    tolerance: 1e-9,
    hints: ['Czy któryś z logarytmów da się policzyć osobno?', 'Nie — połącz je w jeden.', r`$\log_3 \left(18 \cdot \frac32\right)$.`, r`$\log_3 27$.`],
    steps: [r`$18 \cdot \frac32 = 27$.`, r`$\log_3 27 = 3$.`],
    errors: [['2', r`Podzielone zamiast pomnożone: $\log_3 12$ zaokrąglone.`, 'Suma logarytmów to logarytm iloczynu.']],
  }),
  text({
    id: 'x-lp-4',
    skill: 'log-properties',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wiadomo, że $\log_2 3 = a$. Wyraź $\log_2 18$ przez $a$. Wpisz wyrażenie, np. 2a+1.`,
    answer: '2a+1',
    variants: ['1+2a', '2*a+1', '1+2*a'],
    hints: ['Jak rozłożyć 18 na czynniki związane z 2 i 3?', r`$18 = 2 \cdot 3^2$.`, r`$\log_2 (2 \cdot 3^2) = \log_2 2 + 2\log_2 3$.`, r`$\log_2 2 = 1$.`],
    steps: [r`$\log_2 18 = \log_2 2 + \log_2 3^2$.`, r`$= 1 + 2a$.`],
    errors: [
      ['2a', r`Pominięte $\log_2 2 = 1$.`, r`$18 = 2 \cdot 9$ — czynnik $2$ też daje logarytm.`],
      ['a^2+1', r`$\log_2 3^2$ policzone jako $(\log_2 3)^2$.`, r`$\log_a x^k = k\log_a x$.`],
    ],
  }),

  // log-function --------------------------------------------------------------
  numeric({
    id: 'x-lf-1',
    skill: 'log-function',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla $f(x) = \log_2 x$ oblicz $f(16)$.`,
    answer: 4,
    verify: () => Math.log2(16),
    hints: ['Do której potęgi trzeba podnieść 2, żeby dostać 16?', r`$2^? = 16$.`, 'Mnóż dwójkę przez siebie, aż dojdziesz do 16, i licz mnożenia.', 'Wykładnik to wynik.'],
    steps: [r`$2^4 = 16$.`, r`$f(16) = 4$.`],
    errors: [['8', 'Logarytm policzony jak dzielenie przez 2.', 'Logarytm to wykładnik.']],
  }),
  choice({
    id: 'x-lf-2',
    skill: 'log-function',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dziedziną funkcji $f(x) = \log_3 (x - 4)$ jest`,
    choices: [r`$(4, +\infty)$`, r`$\langle 4, +\infty)$`, r`$(-4, +\infty)$`, r`$(0, +\infty)$`],
    answer: 'A',
    hints: ['Jaki warunek musi spełniać argument logarytmu?', 'Musi być dodatni.', r`$x - 4 > 0$.`, 'Rozwiąż nierówność.'],
    steps: [r`$x - 4 > 0$.`, r`$x > 4$.`],
    errors: [
      ['B', 'Warunek nieostry — logarytm z zera nie istnieje.', 'Argument logarytmu musi być dodatni, nie nieujemny.'],
      ['C', 'Zły znak przy przesunięciu.', r`$x - 4 > 0 \iff x > 4$.`],
      ['D', r`Dziedzina samego $\log_3 x$ bez przesunięcia.`, r`Warunek dotyczy całego argumentu $x - 4$.`],
    ],
  }),
  numeric({
    id: 'x-lf-3',
    skill: 'log-function',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wykres $f(x) = \log_a x$ przechodzi przez punkt $(8, 3)$. Oblicz $a$.`,
    answer: 2,
    verify: () => Math.cbrt(8),
    hints: ['Co znaczy, że punkt należy do wykresu?', r`$\log_a 8 = 3$.`, r`Z definicji: $a^3 = 8$.`, 'Weź pierwiastek trzeciego stopnia.'],
    steps: [r`$a^3 = 8$.`, r`$a = 2$.`],
    errors: [['512', r`Policzone $8^3$ zamiast $\sqrt[3]{8}$.`, r`$\log_a 8 = 3 \iff a^3 = 8$.`]],
  }),
  numeric({
    id: 'x-lf-4',
    skill: 'log-function',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj miejsce zerowe funkcji $f(x) = \log_2 (x + 3)$.`,
    answer: -2,
    variants: ['x=-2'],
    verify: () => 1 - 3,
    hints: ['Kiedy logarytm jest równy zero?', 'Gdy jego argument jest równy 1.', r`$x + 3 = 1$.`, 'Rozwiąż.'],
    steps: [r`$\log_2 (x + 3) = 0 \iff x + 3 = 1$.`, r`$x = -2$.`],
    errors: [['-3', r`Przyrównany argument do $0$ zamiast do $1$.`, r`$\log_a 1 = 0$, a logarytm z zera nie istnieje.`]],
  }),
  numeric({
    id: 'x-lf-5',
    skill: 'log-function',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ile liczb całkowitych należy do dziedziny funkcji $f(x) = \log (9 - x^2)$?`,
    answer: 5,
    verify: () => {
      let n = 0;
      for (let x = -20; x <= 20; x += 1) if (9 - x * x > 0) n += 1;
      return n;
    },
    hints: ['Jaki warunek daje dziedzina logarytmu?', r`$9 - x^2 > 0$.`, r`$x^2 < 9 \iff x \in (-3, 3)$.`, 'Policz liczby całkowite w przedziale otwartym.'],
    steps: [r`$x \in (-3, 3)$.`, r`$-2, -1, 0, 1, 2$ — pięć liczb.`],
    errors: [['7', 'Włączone końce przedziału.', 'Argument logarytmu musi być dodatni — w ±3 jest zerem.']],
  }),
  choice({
    id: 'x-lf-6',
    skill: 'log-function',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Na rysunku jest wykres funkcji $f(x) = \log_2 (x - p)$. Wynika z niego, że $p$ jest równe`,
    figure: {
      kind: 'plot',
      alt: 'Rosnący wykres logarytmiczny z asymptotą pionową x = 1 (linia przerywana), przechodzący przez punkty (2, 0) i (3, 1).',
      x: [-1, 7],
      y: [-3, 3],
      curves: [{ fn: (x: number) => Math.log2(x - 1), from: 1.13, to: 7 }],
      points: [{ at: [2, 0] }, { at: [3, 1] }],
      guides: [{ x: 1 }],
    },
    choices: [r`$1$`, r`$-1$`, r`$2$`, r`$0$`],
    answer: 'A',
    verify: () => 2 - 1,
    hints: ['Gdzie jest miejsce zerowe na rysunku?', r`W $x = 2$.`, r`$\log_2 (2 - p) = 0 \iff 2 - p = 1$.`, r`Sprawdź asymptotę: $x = p$.`],
    steps: [r`$2 - p = 1 \Rightarrow p = 1$.`, r`Zgadza się z asymptotą $x = 1$.`],
    errors: [
      ['B', 'Zły kierunek przesunięcia.', r`$\log_2 (x - 1)$ to przesunięcie w prawo o $1$.`],
      ['C', 'Wzięte miejsce zerowe zamiast przesunięcia.', r`Miejsce zerowe $\log_2 (x - p)$ to $p + 1$.`],
      ['D', 'Pominięte przesunięcie.', r`Wykres $\log_2 x$ miałby asymptotę $x = 0$ i zero w $x = 1$.`],
    ],
  }),
  numeric({
    id: 'x-lf-7',
    skill: 'log-function',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Skala Richtera: trzęsienie o magnitudzie $M$ ma amplitudę drgań proporcjonalną do $10^M$. Ile razy większą amplitudę ma trzęsienie o magnitudzie $6$ niż o magnitudzie $4$?`,
    answer: 100,
    verify: () => 10 ** 6 / 10 ** 4,
    hints: ['Jak zapisać stosunek amplitud?', r`$\frac{10^6}{10^4}$.`, r`Dzielenie potęg o tej samej podstawie: odejmij wykładniki.`, r`$10^{2}$.`],
    steps: [r`$\frac{10^6}{10^4} = 10^2$.`, r`$100$ razy.`],
    errors: [['2', 'Porównana różnica magnitud zamiast stosunku amplitud.', 'Skala logarytmiczna: +1 magnitudy to 10 razy większa amplituda.']],
  }),
  numeric({
    id: 'x-lf-8',
    skill: 'log-function',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Funkcja $f(x) = \log_2 (x + a) + b$ ma asymptotę pionową $x = -3$ i przechodzi przez punkt $(1, 5)$. Oblicz $b$.`,
    answer: 3,
    verify: () => 5 - Math.log2(1 + 3),
    hints: ['Gdzie jest asymptota pionowa funkcji log₂(x + a)?', r`W $x = -a$ — porównaj z podaną asymptotą.`, r`$f(1) = \log_2 4 + b = 5$.`, r`$\log_2 4 = 2$.`],
    steps: [r`$a = 3$; $\log_2 4 + b = 5$.`, r`$b = 3$.`],
    errors: [['5', r`Pominięty składnik $\log_2 4$.`, r`$f(1) = \log_2 (1 + 3) + b$.`]],
  }),

  // log-equations -------------------------------------------------------------
  numeric({
    id: 'x-le-1',
    skill: 'log-equations',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż równanie $\log_3 x = 2$.`,
    answer: 9,
    variants: ['x=9'],
    verify: () => 3 ** 2,
    hints: ['Jak zamienić zapis logarytmiczny na potęgowy?', r`$\log_a x = c \iff x = a^c$.`, r`$x = 3^2$.`, 'Policz.'],
    steps: [r`$x = 3^2$.`, r`$x = 9$.`],
    errors: [['6', r`Policzone $3 \cdot 2$.`, r`$\log_3 x = 2 \iff x = 3^2$.`]],
  }),
  numeric({
    id: 'x-le-2',
    skill: 'log-equations',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiąż równanie $\log_2 (x - 1) = 3$.`,
    answer: 9,
    variants: ['x=9'],
    verify: () => 2 ** 3 + 1,
    hints: ['Jaka jest dziedzina?', r`$x > 1$.`, r`$x - 1 = 2^3$.`, r`$x - 1 = 8$.`],
    steps: [r`Dziedzina $x > 1$; $x - 1 = 8$.`, r`$x = 9$ — należy do dziedziny.`],
    errors: [['7', r`Zły znak: $x = 8 - 1$.`, r`$x - 1 = 8 \Rightarrow x = 9$.`]],
  }),
  numeric({
    id: 'x-le-3',
    skill: 'log-equations',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $\log_2 (x - 1) + \log_2 (x + 1) = 3$.`,
    answer: 3,
    variants: ['x=3'],
    verify: () => Math.sqrt(9),
    hints: ['Od czego zaczynasz przy równaniu logarytmicznym?', r`Dziedzina: $x > 1$.`, r`$\log_2 \big((x-1)(x+1)\big) = 3 \Rightarrow x^2 - 1 = 8$.`, r`$x = \pm 3$ — sprawdź dziedzinę.`],
    steps: [r`$x^2 = 9$, $x = \pm 3$.`, r`$-3$ nie należy do dziedziny: $x = 3$.`],
    errors: [['-3', 'Brak sprawdzenia dziedziny.', 'Rozwiązanie musi spełniać warunki istnienia logarytmów.']],
  }),
  choice({
    id: 'x-le-4',
    skill: 'log-equations',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Zbiorem rozwiązań nierówności $\left(\frac12\right)^x > 4$ jest`,
    choices: [r`$(-\infty, -2)$`, r`$(-2, +\infty)$`, r`$(2, +\infty)$`, r`$(-\infty, 2)$`],
    answer: 'A',
    hints: ['Jak zapisać 4 jako potęgę 1/2?', r`$4 = \left(\frac12\right)^{-2}$.`, 'Czy funkcja o podstawie 1/2 rośnie, czy maleje?', 'Maleje — przy porównaniu wykładników odwróć znak.'],
    steps: [r`$\left(\frac12\right)^x > \left(\frac12\right)^{-2}$.`, r`Podstawa $< 1$: $x < -2$.`],
    errors: [
      ['B', 'Nieodwrócony znak nierówności.', 'Dla podstawy z (0, 1) funkcja maleje — znak się odwraca.'],
      ['C', r`Zapisane $4 = \left(\frac12\right)^2$ i nieodwrócony znak.`, r`$\left(\frac12\right)^2 = \frac14$, a nie $4$.`],
      ['D', r`Zapisane $4 = \left(\frac12\right)^2$.`, r`$4 = 2^2 = \left(\frac12\right)^{-2}$.`],
    ],
  }),
  numeric({
    id: 'x-le-5',
    skill: 'log-equations',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $\log_3 (x + 1) = \log_3 (2x - 5)$.`,
    answer: 6,
    variants: ['x=6'],
    verify: () => 5 + 1,
    hints: ['Jaka jest dziedzina?', r`$x > -1$ i $x > \frac52$, więc $x > \frac52$.`, 'Równe logarytmy o tej samej podstawie — równe argumenty.', r`$x + 1 = 2x - 5$.`],
    steps: [r`$x + 1 = 2x - 5 \Rightarrow x = 6$.`, r`$6 > \frac52$ — należy do dziedziny.`],
    errors: [['-4', r`Błąd znaku przy przenoszeniu: $x = -6 + 2$.`, r`$x + 1 = 2x - 5 \iff 6 = x$.`]],
  }),
  numeric({
    id: 'x-le-6',
    skill: 'log-equations',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ile liczb całkowitych spełnia nierówność $\log_2 (x - 2) < 3$?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if (x - 2 > 0 && Math.log2(x - 2) < 3) n += 1;
      return n;
    },
    hints: ['Jaka jest dziedzina?', r`$x > 2$.`, r`$\log_2 (x - 2) < \log_2 8$; podstawa $> 1$, więc znak zostaje.`, r`$2 < x < 10$.`],
    steps: [r`$x - 2 < 8$ i $x > 2$: $x \in (2, 10)$.`, r`$3, 4, \ldots, 9$ — siedem liczb.`],
    errors: [['9', 'Pominięta dziedzina — policzone także x ≤ 2.', r`Argument logarytmu musi być dodatni: $x > 2$.`]],
  }),
  numeric({
    id: 'x-le-7',
    skill: 'log-equations',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Rozwiąż równanie $\log_2^2 x - 3\log_2 x + 2 = 0$. Podaj sumę rozwiązań.`,
    answer: 6,
    verify: () => 2 ** 1 + 2 ** 2,
    hints: ['Jakie podstawienie upraszcza to równanie?', r`$t = \log_2 x$: $t^2 - 3t + 2 = 0$.`, r`$t = 1$ lub $t = 2$.`, r`Wróć do $x$: $x = 2^t$.`],
    steps: [r`$t = 1 \Rightarrow x = 2$; $t = 2 \Rightarrow x = 4$.`, r`Suma: $6$.`],
    errors: [['3', r`Dodane wartości $t$ zamiast $x$.`, r`Po podstawieniu wróć do $x = 2^t$.`]],
  }),
  numeric({
    id: 'x-le-8',
    skill: 'log-equations',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile liczb całkowitych spełnia nierówność $\log_{\frac12} (x - 1) \ge -2$?`,
    answer: 4,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if (x - 1 > 0 && Math.log(x - 1) / Math.log(0.5) >= -2) n += 1;
      return n;
    },
    hints: ['Jaka jest dziedzina?', r`$x > 1$.`, r`Zapisz $-2$ jako logarytm o podstawie $\frac12$; podstawa $< 1$, więc znak się odwraca.`, r`$x - 1 \le 4$.`],
    steps: [r`$1 < x \le 5$.`, r`$2, 3, 4, 5$ — cztery liczby.`],
    errors: [['5', 'Pominięta dziedzina albo włączone x = 1.', r`Argument logarytmu musi być dodatni: $x > 1$.`]],
  }),
];

export const EXP_QUESTIONS: Question[] = [...LOG_QUESTIONS, ...NEW_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const EXP_CARDS: Flashcard[] = [
  card('c-exp-fn-1', 'exp-function', 'definicja', r`Kiedy $a^x$ rośnie, a kiedy maleje?`, r`Rośnie dla $a > 1$, maleje dla $0 < a < 1$.`),
  card('c-exp-fn-2', 'exp-function', 'wzor', r`$a^{-n} = \;?$`, r`$\frac{1}{a^n}$`),
  card('c-exp-fn-3', 'exp-function', 'definicja', r`Przez jaki punkt przechodzi każdy wykres $a^x$?`, r`$(0, 1)$`),

  card('c-exp-eq-1', 'exp-equations', 'metoda', 'Jak rozwiązać równanie wykładnicze?', 'Sprowadź obie strony do tej samej podstawy i porównaj wykładniki.'),
  card('c-exp-eq-2', 'exp-equations', 'pulapka', r`Podstawienie $t = 2^x$ — jakie $t$ odrzucasz?`, r`Niedodatnie: $2^x > 0$.`),

  card('c-exp-mod-1', 'exp-model', 'wzor', 'Procent składany?', r`$K_n = K_0\left(1 + \frac{p}{100}\right)^n$`),
  card('c-exp-mod-2', 'exp-model', 'pulapka', 'Dwie obniżki po 10% to obniżka o…?', r`$19\%$, bo $0{,}9^2 = 0{,}81$.`),

  card('c-log-b-1', 'log-basic', 'definicja', r`$\log_a b = c$ oznacza…`, r`$a^c = b$ ($a > 0$, $a \ne 1$, $b > 0$).`),
  card('c-log-b-2', 'log-basic', 'wzor', r`$\log_a 1$ i $\log_a a$?`, r`$0$ i $1$.`),

  card('c-log-p-1', 'log-properties', 'wzor', 'Logarytm iloczynu i ilorazu?', r`$\log_a xy = \log_a x + \log_a y$, $\log_a \frac{x}{y} = \log_a x - \log_a y$`),
  card('c-log-p-2', 'log-properties', 'wzor', 'Logarytm potęgi i zamiana podstawy?', r`$\log_a x^k = k\log_a x$, $\log_a b = \frac{\log_c b}{\log_c a}$`),
  card('c-log-p-3', 'log-properties', 'pulapka', r`$\log (x + y) = \log x + \log y$?`, 'NIE. Wzór dotyczy iloczynu, nie sumy.'),

  card('c-log-f-1', 'log-function', 'definicja', r`Dziedzina i miejsce zerowe $\log_a x$?`, r`$(0, +\infty)$; zero w $x = 1$.`),
  card('c-log-f-2', 'log-function', 'metoda', r`Dziedzina $\log_a g(x)$?`, r`$g(x) > 0$ — ostro.`),

  card('c-log-e-1', 'log-equations', 'metoda', 'Pierwszy i ostatni krok równania logarytmicznego?', 'Wyznacz dziedzinę; na końcu sprawdź, czy rozwiązania do niej należą.'),
  card('c-log-e-2', 'log-equations', 'pulapka', 'Nierówność z podstawą z (0, 1)?', 'Przy przejściu do argumentów/wykładników odwracasz znak.'),
];

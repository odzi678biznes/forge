import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';
import { QUADRATIC_QUESTIONS, QUADRATIC_TOPIC } from '../funkcja-kwadratowa';

/**
 * Dział 6: Funkcja kwadratowa.
 *
 * Włącza do kursu trzy umiejętności z pierwszego wycinka treści (wyróżnik,
 * wierzchołek, wzory Viète'a) - z ich identyfikatorami i zadaniami, żeby
 * zapisany postęp nie przepadł - i dopisuje do nich lekcje, zadania oraz
 * cztery nowe umiejętności.
 */

const r = String.raw;

export const QUAD_TOPIC: Topic = {
  ...QUADRATIC_TOPIC,
  summary:
    'Postaci funkcji kwadratowej, równania i nierówności, wierzchołek, optymalizacja, wzory Viète’a i parametr.',
};

export const QUAD_SKILLS: Skill[] = [
  {
    id: 'quad-forms',
    topicId: 'math-quadratic',
    name: 'Postaci funkcji kwadratowej i wykres',
    level: 'PP',
    ckeRequirement: 'Funkcja kwadratowa — postać ogólna, kanoniczna i iloczynowa, szkic wykresu',
    prerequisites: ['fn-shift', 'alg-expand'],
    examValue: 0.75,
  },
  {
    id: 'quad-discriminant',
    topicId: 'math-quadratic',
    name: 'Równanie kwadratowe i wyróżnik',
    level: 'PP',
    ckeRequirement: 'Funkcja kwadratowa — rozwiązywanie równań kwadratowych, liczba rozwiązań',
    prerequisites: ['quad-forms', 'alg-factor'],
    examValue: 0.85,
  },
  {
    id: 'quad-vertex',
    topicId: 'math-quadratic',
    name: 'Wierzchołek i wartość największa lub najmniejsza',
    level: 'PP',
    ckeRequirement: 'Funkcja kwadratowa — współrzędne wierzchołka, wartość najmniejsza i największa',
    prerequisites: ['quad-discriminant'],
    examValue: 0.85,
  },
  {
    id: 'quad-ineq',
    topicId: 'math-quadratic',
    name: 'Nierówności kwadratowe',
    level: 'PP',
    ckeRequirement: 'Funkcja kwadratowa — rozwiązywanie nierówności kwadratowych',
    prerequisites: ['quad-discriminant', 'ineq-linear'],
    examValue: 0.8,
  },
  {
    id: 'quad-optim',
    topicId: 'math-quadratic',
    name: 'Optymalizacja z funkcją kwadratową',
    level: 'PP',
    ckeRequirement: 'Funkcja kwadratowa — wartość największa i najmniejsza w przedziale, zadania optymalizacyjne',
    prerequisites: ['quad-vertex'],
    examValue: 0.75,
  },
  {
    id: 'quad-vieta',
    topicId: 'math-quadratic',
    name: 'Wzory Viète’a',
    level: 'PR',
    ckeRequirement: 'Funkcja kwadratowa — wzory Viète’a, wyrażenia symetryczne pierwiastków',
    prerequisites: ['quad-discriminant'],
    examValue: 0.7,
  },
  {
    id: 'quad-param',
    topicId: 'math-quadratic',
    name: 'Równania kwadratowe z parametrem',
    level: 'PR',
    ckeRequirement: 'Funkcja kwadratowa — liczba i znaki pierwiastków w zależności od parametru',
    prerequisites: ['quad-vieta', 'quad-ineq'],
    examValue: 0.75,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const QUAD_LESSONS: Lesson[] = [
  {
    skillId: 'quad-forms',
    minutes: 12,
    intro:
      'Funkcja kwadratowa ma trzy stroje: postać ogólną, kanoniczną i iloczynową. Każda od razu pokazuje coś innego — umiejętność przebierania funkcji z jednej postaci w drugą oszczędza na maturze połowę rachunków.',
    blocks: [
      f(r`f(x) = ax^2 + bx + c`, 'postać ogólna: c to punkt przecięcia z osią y'),
      f(r`f(x) = a(x - p)^2 + q`, 'postać kanoniczna: wierzchołek W = (p, q)'),
      f(r`f(x) = a(x - x_1)(x - x_2)`, 'postać iloczynowa: miejsca zerowe x₁ i x₂'),
      p(
        r`Współczynnik $a$ jest ten sam we wszystkich postaciach i decyduje o kształcie: $a > 0$ — ramiona w górę, $a < 0$ — w dół. Im większe $|a|$, tym węższa parabola.`,
      ),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Parabola y = x² − 2x − 3 z wierzchołkiem (1, −4), miejscami zerowymi −1 i 3 oraz przecięciem z osią y w (0, −3).',
          x: [-3, 5],
          y: [-5, 5],
          curves: [{ fn: (x) => x * x - 2 * x - 3 }],
          points: [
            { at: [1, -4], label: 'W' },
            { at: [-1, 0] },
            { at: [3, 0] },
            { at: [0, -3] },
          ],
        },
        caption: 'x² − 2x − 3 = (x − 1)² − 4 = (x + 1)(x − 3)',
      },
      tip(r`Postać kanoniczna to parabola $y = ax^2$ przesunięta o wektor $[p, q]$ — dokładnie to, co było w dziale o przesunięciach.`),
      warn(r`W postaci $a(x - p)^2 + q$ znak przy $p$ jest odwrotny: $(x + 2)^2$ oznacza $p = -2$.`),
    ],
    examples: [
      example(
        r`Dla $f(x) = 2(x - 3)^2 - 8$ podaj wierzchołek i kierunek ramion.`,
        [r`Postać kanoniczna: $p = 3$, $q = -8$, więc $W = (3, -8)$.`, r`$a = 2 > 0$ — ramiona w górę, $-8$ to najmniejsza wartość.`],
        r`$W = (3, -8)$, ramiona w górę`,
      ),
      example(
        r`Zapisz $f(x) = x^2 - 2x - 3$ w postaci iloczynowej.`,
        [
          r`Szukam liczb o sumie $2$ i iloczynie $-3$: to $3$ i $-1$.`,
          r`$f(x) = (x - 3)(x + 1)$ — miejsca zerowe $3$ i $-1$.`,
        ],
        r`$(x - 3)(x + 1)$`,
      ),
    ],
    pitfalls: [
      r`$(x + 2)^2$ oznacza $p = -2$, nie $2$.`,
      r`Kierunek ramion zależy tylko od znaku $a$.`,
      r`W postaci iloczynowej nie zapominaj o $a$ przed nawiasami.`,
    ],
  },
  {
    skillId: 'quad-discriminant',
    minutes: 12,
    intro:
      r`Równanie kwadratowe $ax^2 + bx + c = 0$ rozwiązuje się jednym wzorem. Wyróżnik $\Delta$ mówi z góry, ile rozwiązań się pojawi — zanim zaczniesz liczyć pierwiastki.`,
    blocks: [
      f(r`\Delta = b^2 - 4ac`),
      f(r`x_1 = \frac{-b - \sqrt{\Delta}}{2a} \qquad x_2 = \frac{-b + \sqrt{\Delta}}{2a}`, 'gdy wyróżnik jest dodatni'),
      p(
        r`$\Delta > 0$ — dwa rozwiązania (parabola przecina oś $x$ dwa razy). $\Delta = 0$ — jedno: $x_0 = -\frac{b}{2a}$ (parabola dotyka osi wierzchołkiem). $\Delta < 0$ — brak rozwiązań rzeczywistych.`,
      ),
      tip(
        r`Zanim policzysz $\Delta$, sprawdź skróty: bez wyrazu wolnego ($ax^2 + bx = 0$) wyłącz $x$; bez wyrazu z $x$ ($ax^2 + c = 0$) przenieś $c$ i spierwiastkuj.`,
      ),
      warn(r`Przy ujemnym $b$ uważaj na znaki: $-b$ we wzorze na pierwiastki to liczba dodatnia, a $b^2$ jest zawsze nieujemne.`),
    ],
    examples: [
      example(
        r`Rozwiąż $2x^2 - 3x - 2 = 0$.`,
        [r`$\Delta = 9 + 16 = 25$, $\sqrt{\Delta} = 5$.`, r`$x_1 = \frac{3 - 5}{4} = -\frac{1}{2}$, $x_2 = \frac{3 + 5}{4} = 2$.`],
        r`$x \in \left\{-\frac{1}{2}, 2\right\}$`,
      ),
      example(
        r`Ile rozwiązań ma $x^2 - 4x + 7 = 0$?`,
        [r`$\Delta = 16 - 28 = -12 < 0$.`, 'Brak rozwiązań rzeczywistych.'],
        r`$0$`,
      ),
    ],
    pitfalls: [
      r`$-b$ przy ujemnym $b$ to liczba dodatnia.`,
      r`Kreska ułamkowa we wzorze obejmuje cały licznik $-b \pm \sqrt{\Delta}$.`,
      r`Liczenie $\Delta$ dla $ax^2 + bx = 0$ zamiast wyłączenia $x$ przed nawias.`,
    ],
  },
  {
    skillId: 'quad-vertex',
    minutes: 10,
    intro:
      'Wierzchołek paraboli to jej „szczyt” albo „dołek”. Jego druga współrzędna to największa albo najmniejsza wartość funkcji — a o takie wartości zadania maturalne pytają bardzo często.',
    blocks: [
      f(r`p = -\frac{b}{2a} \qquad q = f(p) = -\frac{\Delta}{4a}`),
      p(r`Najprościej: policz $p$, a potem wstaw je do wzoru funkcji — to jest $q$. Wzór $-\frac{\Delta}{4a}$ daje ten sam wynik.`),
      p(r`Dla $a > 0$ wartość $q$ jest najmniejsza (ramiona w górę), dla $a < 0$ — największa.`),
      tip(r`Gdy znasz miejsca zerowe, $p$ leży dokładnie w połowie między nimi: $p = \frac{x_1 + x_2}{2}$.`),
      warn(r`Wartość największa to $q$ (druga współrzędna), a nie $p$ (argument, dla którego jest przyjmowana).`),
    ],
    examples: [
      example(
        r`Znajdź najmniejszą wartość $f(x) = x^2 - 6x + 5$.`,
        [r`$p = \frac{6}{2} = 3$.`, r`$q = f(3) = 9 - 18 + 5 = -4$.`, r`$a > 0$, więc $-4$ to wartość najmniejsza.`],
        r`$-4$`,
      ),
      example(
        r`Miejsca zerowe funkcji kwadratowej to $-1$ i $5$. Podaj $p$.`,
        ['Oś symetrii paraboli leży w połowie między miejscami zerowymi.', r`$p = \frac{-1 + 5}{2} = 2$.`],
        r`$p = 2$`,
      ),
    ],
    pitfalls: [r`Podanie $p$ zamiast $q$.`, r`Zły znak w $p = -\frac{b}{2a}$.`, r`Mylenie wartości największej z najmniejszą — decyduje znak $a$.`],
  },
  {
    skillId: 'quad-ineq',
    minutes: 12,
    intro:
      'Nierówność kwadratową rozwiązuje się rysunkiem, nie rachunkiem: miejsca zerowe i kierunek ramion wystarczą, żeby odczytać, gdzie parabola jest nad osią, a gdzie pod nią.',
    blocks: [
      p(
        r`Metoda w trzech krokach: 1) znajdź miejsca zerowe, 2) naszkicuj parabolę (ramiona w górę dla $a > 0$), 3) odczytaj, gdzie wykres jest nad osią ($> 0$), a gdzie pod nią ($< 0$).`,
      ),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Parabola y = x² − 2x − 3 przecinająca oś x w −1 i 3: pod osią między −1 a 3, nad osią poza tym przedziałem.',
          x: [-3, 5],
          y: [-5, 6],
          curves: [{ fn: (x) => x * x - 2 * x - 3 }],
          points: [{ at: [-1, 0] }, { at: [3, 0] }],
        },
        caption: 'x² − 2x − 3 < 0 między −1 a 3, a > 0 poza tym przedziałem',
      },
      f(r`a > 0: \quad f(x) < 0 \iff x \in (x_1, x_2), \qquad f(x) > 0 \iff x \in (-\infty, x_1) \cup (x_2, +\infty)`),
      tip(r`Gdy $\Delta < 0$ i $a > 0$, parabola leży cała nad osią: $f(x) > 0$ dla każdego $x$, a $f(x) < 0$ nie ma rozwiązań.`),
      warn(r`Dla $a < 0$ wszystko się odwraca: parabola jest nad osią MIĘDZY miejscami zerowymi. Zawsze najpierw spójrz na znak $a$.`),
    ],
    examples: [
      example(
        r`Rozwiąż $x^2 - 2x - 3 \le 0$.`,
        [
          r`Miejsca zerowe: $\Delta = 16$, $x_1 = -1$, $x_2 = 3$.`,
          r`$a = 1 > 0$ — ramiona w górę, parabola pod osią między zerami.`,
          r`$x \in \langle -1, 3 \rangle$ — końce należą, bo nierówność jest nieostra.`,
        ],
        r`$x \in \langle -1, 3 \rangle$`,
      ),
      example(
        r`Rozwiąż $-x^2 + 4 > 0$.`,
        [r`$-x^2 + 4 = 0 \iff x = \pm 2$.`, r`$a = -1 < 0$ — ramiona w dół, parabola nad osią między zerami.`, r`$x \in (-2, 2)$.`],
        r`$x \in (-2, 2)$`,
      ),
    ],
    pitfalls: [r`Odczyt przedziału bez patrzenia na znak $a$.`, r`Końce przedziału: przy $\le, \ge$ należą, przy $<, >$ nie.`, r`Przy $\Delta < 0$ odpowiedzią jest zbiór pusty albo wszystkie liczby — zależnie od znaku.`],
  },
  {
    skillId: 'quad-optim',
    minutes: 12,
    intro:
      'Zadanie optymalizacyjne pyta o „najwięcej” albo „najmniej”: największe pole przy danym obwodzie, najmniejszy koszt, najwyższy lot. Jeśli wielkość da się zapisać jako funkcję kwadratową, odpowiedź leży w wierzchołku — albo na końcu przedziału.',
    blocks: [
      p(
        r`Plan: 1) nazwij zmienną $x$ i zapisz jej sensowną dziedzinę, 2) zapisz szukaną wielkość jako funkcję $x$, 3) znajdź wierzchołek, 4) sprawdź, czy $p$ należy do dziedziny.`,
      ),
      p(r`Najmniejsza i największa wartość na przedziale $\langle m, n \rangle$: porównujesz $f(m)$, $f(n)$ oraz $f(p)$ — to ostatnie tylko wtedy, gdy $p$ leży w przedziale.`),
      tip('Prostokąt o danym obwodzie ma największe pole, gdy jest kwadratem — to klasyczny wynik, który wychodzi z wierzchołka paraboli.'),
      warn(r`Jeśli wierzchołek leży poza przedziałem, obie skrajne wartości są na końcach. Nie podawaj $q$, zanim sprawdzisz, czy $p$ w ogóle należy do przedziału.`),
    ],
    examples: [
      example(
        r`Z $40$ m siatki ogradzasz prostokątny wybieg. Jakie największe pole możesz uzyskać?`,
        [
          r`Boki $x$ i $20 - x$ (połowa obwodu to $20$), $x \in (0, 20)$.`,
          r`$P(x) = x(20 - x) = -x^2 + 20x$.`,
          r`$p = 10$, $P(10) = 100$ — kwadrat $10 \times 10$.`,
        ],
        r`$100\ \mathrm{m}^2$`,
      ),
      example(
        r`Podaj najmniejszą i największą wartość $f(x) = x^2 - 4x$ na $\langle 0, 5 \rangle$.`,
        [r`$p = 2 \in \langle 0, 5 \rangle$, $f(2) = -4$.`, r`Końce: $f(0) = 0$, $f(5) = 5$.`, r`Najmniejsza: $-4$, największa: $5$.`],
        r`$-4$ i $5$`,
      ),
    ],
    pitfalls: ['Wierzchołek poza przedziałem — wtedy liczą się końce.', 'Brak dziedziny zmiennej (długość musi być dodatnia).', r`Podanie $x$ zamiast szukanej wartości (pola, kosztu).`],
  },
  {
    skillId: 'quad-vieta',
    minutes: 10,
    intro:
      'Wzory Viète’a dają sumę i iloczyn pierwiastków bez liczenia samych pierwiastków. Na rozszerzeniu to podstawowe narzędzie w zadaniach z parametrem.',
    blocks: [
      f(r`x_1 + x_2 = -\frac{b}{a} \qquad x_1 \cdot x_2 = \frac{c}{a}`),
      p(r`Działają zawsze, gdy równanie ma pierwiastki, czyli gdy $\Delta \ge 0$. Przy $\Delta = 0$ pierwiastek liczysz podwójnie: $x_1 = x_2$.`),
      p(
        r`Wyrażenia symetryczne przepisujesz na sumę i iloczyn: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$, a $\frac{1}{x_1} + \frac{1}{x_2} = \frac{x_1 + x_2}{x_1x_2}$.`,
      ),
      warn(r`Zanim użyjesz wzorów w zadaniu z parametrem, sprawdź warunek $\Delta \ge 0$ — bez pierwiastków wzory dają liczby bez znaczenia.`),
      tip('Znaki pierwiastków: iloczyn dodatni — ten sam znak; do tego suma dodatnia — oba dodatnie. Iloczyn ujemny — znaki różne.'),
    ],
    examples: [
      example(
        r`Dla $x^2 - 5x + 3 = 0$ oblicz $x_1^2 + x_2^2$.`,
        [r`$\Delta = 13 > 0$ — pierwiastki istnieją.`, r`$x_1 + x_2 = 5$, $x_1x_2 = 3$.`, r`$x_1^2 + x_2^2 = 25 - 6 = 19$.`],
        r`$19$`,
      ),
      example(
        r`Czy pierwiastki równania $x^2 + 3x - 10 = 0$ mają jednakowe znaki?`,
        [r`$\Delta = 49 > 0$.`, r`$x_1x_2 = -10 < 0$ — znaki są różne.`],
        'nie',
      ),
    ],
    pitfalls: [r`Znak w sumie: $-\frac{b}{a}$, nie $\frac{b}{a}$.`, r`Pominięty warunek $\Delta \ge 0$.`, r`$x_1^2 + x_2^2 \ne (x_1 + x_2)^2$.`],
  },
  {
    skillId: 'quad-param',
    minutes: 14,
    intro:
      r`Parametr w równaniu kwadratowym to jedno z najczęstszych zadań za 4–5 punktów na rozszerzeniu. Działa zawsze ten sam szablon: warunki na $a$, na $\Delta$ i — jeśli trzeba — na znaki pierwiastków ze wzorów Viète’a.`,
    blocks: [
      p(r`Krok 0: czy współczynnik przy $x^2$ może być zerem? Jeśli tak, dla tej wartości parametru równanie jest liniowe — rozpatrz je osobno.`),
      f(r`\text{dwa różne pierwiastki: } a \ne 0 \wedge \Delta > 0`),
      f(r`\text{dwa różne pierwiastki dodatnie:} \qquad \Delta > 0,\ x_1 + x_2 > 0,\ x_1x_2 > 0`),
      tip('Zapisz wszystkie warunki w jednej klamrze i na końcu weź część wspólną rozwiązań. Pominięty warunek to najczęstsza utrata punktów.'),
      warn('Przy „dokładnie jednym rozwiązaniu” pamiętaj o przypadku a = 0 — równanie liniowe też może mieć jedno rozwiązanie.'),
    ],
    examples: [
      example(
        r`Dla jakich $m$ równanie $x^2 - 4x + m = 0$ ma dwa różne pierwiastki?`,
        [r`$a = 1 \ne 0$ dla każdego $m$.`, r`$\Delta = 16 - 4m > 0 \iff m < 4$.`],
        r`$m < 4$`,
      ),
      example(
        r`Dla jakich $m$ równanie $x^2 - 2mx + m + 2 = 0$ ma dwa różne pierwiastki dodatnie?`,
        [
          r`$\Delta = 4m^2 - 4m - 8 > 0 \iff m^2 - m - 2 > 0 \iff m < -1 \vee m > 2$.`,
          r`$x_1 + x_2 = 2m > 0 \iff m > 0$.`,
          r`$x_1x_2 = m + 2 > 0 \iff m > -2$.`,
          r`Część wspólna: $m > 2$.`,
        ],
        r`$m > 2$`,
      ),
    ],
    pitfalls: [r`Pominięty przypadek $a = 0$.`, r`Pominięty warunek $\Delta$ przy pytaniu o znaki pierwiastków.`, 'Brak części wspólnej wszystkich warunków.'],
  },
];

// ===========================================================================
// Zadania - nowe umiejętności i uzupełnienia starych
// ===========================================================================

const NEW_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // quad-forms
  // -------------------------------------------------------------------------
  numeric({
    id: 'k-frm-1',
    skill: 'quad-forms',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`W którym punkcie parabola $y = x^2 - 5x + 6$ przecina oś $y$? Podaj drugą współrzędną tego punktu.`,
    answer: 6,
    verify: () => 0 ** 2 - 5 * 0 + 6,
    hints: [r`Jaki $x$ mają punkty leżące na osi $y$?`, r`$x = 0$.`, r`Oblicz $f(0)$.`, r`Zostaje sam wyraz wolny $c$.`],
    steps: [r`$f(0) = 0 - 0 + 6$.`, r`Punkt $(0, 6)$.`],
    errors: [['-5', r`Wzięty współczynnik $b$ zamiast $c$.`, r`Przecięcie z osią $y$ to $(0, c)$.`]],
  }),
  numeric({
    id: 'k-frm-2',
    skill: 'quad-forms',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj pierwszą współrzędną wierzchołka paraboli $y = 3(x + 2)^2 - 7$.`,
    answer: -2,
    verify: () => -2,
    hints: ['W jakiej postaci jest ten wzór?', r`W kanonicznej: $a(x - p)^2 + q$.`, r`Zapisz nawias w postaci $x - p$ — jaka liczba stoi po minusie?`, r`Odczytaj $p$ z nawiasu.`],
    steps: [r`$(x + 2)^2 = (x - (-2))^2$.`, r`$p = -2$.`],
    errors: [['2', r`Zły znak: $(x + 2)^2$ oznacza $p = -2$.`, r`W postaci kanonicznej jest $x - p$.`]],
  }),
  choice({
    id: 'k-frm-3',
    skill: 'quad-forms',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = -2(x - 1)^2 + 5$ ma`,
    choices: [r`największą wartość $5$`, r`najmniejszą wartość $5$`, r`największą wartość $1$`, r`najmniejszą wartość $-2$`],
    answer: 'A',
    hints: ['W którą stronę są skierowane ramiona?', r`$a = -2 < 0$ — w dół, więc wierzchołek to szczyt.`, r`Wierzchołek: $(1, 5)$.`, r`Wartością jest druga współrzędna.`],
    steps: [r`$a < 0$, wierzchołek $(1, 5)$.`, r`Największa wartość to $5$.`],
    errors: [
      ['B', r`Pominięty znak $a$ — przy $a < 0$ wierzchołek jest szczytem.`, r`$a < 0$: ramiona w dół, $q$ jest największe.`],
      ['C', r`Podane $p$ zamiast $q$.`, 'Wartość funkcji to druga współrzędna wierzchołka.'],
      ['D', r`Współczynnik $a$ wzięty za wartość funkcji.`, r`$a$ mówi o kształcie paraboli, nie o jej wartościach.`],
    ],
  }),
  numeric({
    id: 'k-frm-4',
    skill: 'quad-forms',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Funkcja kwadratowa ma postać iloczynową $f(x) = -3(x - 2)(x + 4)$. Podaj sumę jej miejsc zerowych.`,
    answer: -2,
    verify: () => 2 + -4,
    hints: ['Z której postaci najłatwiej odczytać miejsca zerowe?', r`Z iloczynowej: każdy nawias zeruje się w innym punkcie.`, r`$x - 2 = 0$ oraz $x + 4 = 0$.`, r`$x = 2$ i $x = -4$.`],
    steps: [r`Miejsca zerowe: $2$ i $-4$.`, r`Suma: $-2$.`],
    errors: [['2', r`Zły znak przy nawiasie $(x + 4)$ — to miejsce zerowe $-4$.`, r`$x + 4 = 0 \iff x = -4$.`]],
  }),
  choice({
    id: 'k-frm-5',
    skill: 'quad-forms',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku jest wykres funkcji kwadratowej. Jej wzór to`,
    figure: {
      kind: 'plot',
      alt: 'Parabola skierowana ramionami w dół z wierzchołkiem w punkcie (2, 3).',
      x: [-1, 5],
      y: [-4, 4],
      curves: [{ fn: (x) => -((x - 2) ** 2) + 3 }],
      points: [{ at: [2, 3], label: 'W' }],
    },
    choices: [r`$y = -(x - 2)^2 + 3$`, r`$y = (x - 2)^2 + 3$`, r`$y = -(x + 2)^2 + 3$`, r`$y = -(x - 3)^2 + 2$`],
    answer: 'A',
    hints: ['Gdzie jest wierzchołek i w którą stronę idą ramiona?', r`Wierzchołek $(2, 3)$, ramiona w dół.`, r`Postać kanoniczna: $a(x - p)^2 + q$ z $a < 0$.`, r`$p = 2$, $q = 3$.`],
    steps: [r`$W = (2, 3)$, $a < 0$.`, r`$y = -(x - 2)^2 + 3$.`],
    errors: [
      ['B', 'Zły kierunek ramion — na rysunku idą w dół.', r`Ramiona w dół oznaczają $a < 0$.`],
      ['C', r`Zły znak $p$.`, r`Wierzchołek w $x = 2$ daje nawias $(x - 2)$.`],
      ['D', r`Zamienione $p$ i $q$.`, r`$p$ to pierwsza współrzędna wierzchołka, $q$ — druga.`],
    ],
  }),
  numeric({
    id: 'k-frm-6',
    skill: 'quad-forms',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Zapisz $f(x) = x^2 - 6x + 11$ w postaci kanonicznej $(x - p)^2 + q$. Podaj $q$.`,
    answer: 2,
    verify: () => 11 - 9,
    hints: [r`Jaki kwadrat różnicy zaczyna się od $x^2 - 6x$?`, r`$(x - 3)^2 = x^2 - 6x + 9$.`, r`$x^2 - 6x + 11 = (x - 3)^2 + \ldots$ — ile brakuje do $11$?`, r`$11 - 9$.`],
    steps: [r`$x^2 - 6x + 11 = (x - 3)^2 - 9 + 11$.`, r`$= (x - 3)^2 + 2$, więc $q = 2$.`],
    errors: [
      ['11', r`Wzięty wyraz wolny $c$ zamiast $q$.`, r`$q = f(p)$, a nie $c$.`],
      ['20', r`Dodane $9$ zamiast odjęte.`, r`$(x - 3)^2$ ma już w sobie $+9$ — trzeba je odjąć.`],
    ],
  }),
  numeric({
    id: 'k-frm-7',
    skill: 'quad-forms',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Parabola ma wierzchołek $W = (1, -8)$ i przechodzi przez punkt $(3, 0)$. Wyznacz współczynnik $a$.`,
    answer: 2,
    verify: () => 8 / (3 - 1) ** 2,
    hints: ['Którą postać warto zapisać, znając wierzchołek?', r`Kanoniczną: $y = a(x - 1)^2 - 8$.`, r`Wstaw punkt $(3, 0)$: $0 = a(3 - 1)^2 - 8$.`, r`$4a = 8$.`],
    steps: [r`$0 = a \cdot 4 - 8$.`, r`$a = 2$.`],
    errors: [['4', r`Nawias nie podniesiony do kwadratu: $2a = 8$.`, r`$(3 - 1)^2 = 4$.`]],
  }),
  numeric({
    id: 'k-frm-8',
    skill: 'quad-forms',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Parabola $y = x^2 + bx + c$ ma wierzchołek w punkcie $(3, -1)$. Oblicz $b + c$.`,
    answer: 2,
    verify: () => -6 + 8,
    hints: ['Jaki jest wzór w postaci kanonicznej?', r`$y = (x - 3)^2 - 1$.`, r`Rozwiń: $x^2 - 6x + 9 - 1$.`, r`$b = -6$, $c = 8$.`],
    steps: [r`$(x - 3)^2 - 1 = x^2 - 6x + 8$.`, r`$b + c = -6 + 8 = 2$.`],
    errors: [['14', r`Zły znak $p$: rozwinięte $(x + 3)^2 - 1$.`, r`Wierzchołek w $x = 3$ daje $(x - 3)^2$.`]],
  }),

  // -------------------------------------------------------------------------
  // quad-discriminant - uzupełnienia
  // -------------------------------------------------------------------------
  numeric({
    id: 'k-dis-5',
    skill: 'quad-discriminant',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiąż równanie $x^2 - 5x + 6 = 0$. Podaj większe rozwiązanie.`,
    answer: 3,
    verify: () => (5 + Math.sqrt(25 - 24)) / 2,
    hints: ['Jaki jest wyróżnik tego równania?', r`$\Delta = 25 - 24 = 1$.`, r`$x = \frac{5 \pm 1}{2}$.`, r`Wybierz wersję z plusem.`],
    steps: [r`$\Delta = 1$, $x_1 = \frac{5 - 1}{2} = 2$, $x_2 = \frac{5 + 1}{2}$.`, r`Większe: $3$.`],
    errors: [['2', 'Podane mniejsze rozwiązanie.', 'Pytanie jest o większe.']],
  }),
  choice({
    id: 'k-dis-6',
    skill: 'quad-discriminant',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Równanie $x^2 + 6x + 9 = 0$ ma`,
    choices: ['dokładnie jedno rozwiązanie', 'dwa rozwiązania', 'zero rozwiązań', 'nieskończenie wiele rozwiązań'],
    answer: 'A',
    hints: ['Ile wynosi wyróżnik?', r`$\Delta = 36 - 36$.`, r`$\Delta = 0$ — co to oznacza?`, r`Albo wzór: $x^2 + 6x + 9 = (x + 3)^2$.`],
    steps: [r`$\Delta = 36 - 36 = 0$.`, r`Jedno rozwiązanie: $x = -3$.`],
    errors: [
      ['B', r`Przy $\Delta = 0$ pierwiastki się pokrywają — rozwiązanie jest jedno.`, r`$\Delta = 0$: parabola dotyka osi w jednym punkcie.`],
      ['C', r`Pomylone $\Delta = 0$ z $\Delta < 0$.`, 'Brak rozwiązań jest dopiero przy ujemnym wyróżniku.'],
      ['D', 'Równanie kwadratowe ma najwyżej dwa rozwiązania.', 'Nieskończenie wiele rozwiązań daje tylko tożsamość.'],
    ],
  }),
  numeric({
    id: 'k-dis-7',
    skill: 'quad-discriminant',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Prostokąt ma pole $40\ \mathrm{cm}^2$, a jeden z boków jest o $3$ cm dłuższy od drugiego. Oblicz długość krótszego boku (w cm).`,
    answer: 5,
    verify: () => (-3 + Math.sqrt(9 + 160)) / 2,
    hints: ['Jak zapisać pole przy pomocy krótszego boku x?', r`$x(x + 3) = 40$.`, r`$x^2 + 3x - 40 = 0$, $\Delta = 169$.`, r`$x = \frac{-3 \pm 13}{2}$ — długość musi być dodatnia.`],
    steps: [r`$x^2 + 3x - 40 = 0$, $\Delta = 169$.`, r`$x = \frac{-3 + 13}{2} = 5$ (ujemne rozwiązanie odrzucamy).`],
    errors: [['8', 'Podany dłuższy bok.', 'Pytanie jest o krótszy.']],
  }),

  // -------------------------------------------------------------------------
  // quad-vertex - uzupełnienia
  // -------------------------------------------------------------------------
  choice({
    id: 'k-ver-5',
    skill: 'quad-vertex',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Najmniejsza wartość funkcji $f(x) = x^2 + 4x + 1$ jest równa`,
    choices: [r`$-3$`, r`$-2$`, r`$1$`, r`$13$`],
    answer: 'A',
    verify: () => (-2) ** 2 + 4 * -2 + 1,
    hints: ['Gdzie jest wierzchołek tej paraboli?', r`$p = -\frac{4}{2} = -2$.`, r`$q = f(-2)$.`, r`$4 - 8 + 1$.`],
    steps: [r`$p = -2$.`, r`$q = f(-2) = 4 - 8 + 1 = -3$.`],
    errors: [
      ['B', r`Podane $p$ zamiast $q$.`, 'Wartość to druga współrzędna wierzchołka.'],
      ['C', r`Wzięty wyraz wolny $c$.`, r`$c = f(0)$, a wierzchołek jest w $x = -2$.`],
      ['D', r`Zły znak $p$: policzone $f(2)$.`, r`$p = -\frac{b}{2a}$ — z minusem.`],
    ],
  }),
  numeric({
    id: 'k-ver-6',
    skill: 'quad-vertex',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Suma dwóch liczb wynosi $10$. Jaka jest największa możliwa wartość ich iloczynu?`,
    answer: 25,
    verify: () => 5 * 5,
    hints: ['Jak zapisać iloczyn przy pomocy jednej liczby x?', r`$x(10 - x) = -x^2 + 10x$.`, r`Wierzchołek: $p = 5$.`, r`Oblicz iloczyn dla $x = 5$.`],
    steps: [r`$f(x) = -x^2 + 10x$, $p = 5$.`, r`$f(5) = 25$.`],
    errors: [['24', r`Sprawdzone tylko różne liczby całkowite ($4 \cdot 6$).`, r`Liczby nie muszą być różne — $5 + 5 = 10$.`]],
  }),

  // -------------------------------------------------------------------------
  // quad-ineq
  // -------------------------------------------------------------------------
  numeric({
    id: 'k-inq-1',
    skill: 'quad-ineq',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Ile liczb całkowitych spełnia nierówność $x^2 - 9 < 0$?`,
    answer: 5,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if (x * x - 9 < 0) n += 1;
      return n;
    },
    hints: ['Gdzie są miejsca zerowe?', r`$x^2 = 9$ dla $x = \pm 3$.`, r`Ramiona w górę — parabola pod osią między zerami.`, r`$x \in (-3, 3)$ — końce nie należą.`],
    steps: [r`$x \in (-3, 3)$.`, r`Liczby całkowite: $-2, -1, 0, 1, 2$ — pięć.`],
    errors: [['7', 'Włączone końce, a nierówność jest ostra.', r`Przy $<$ miejsca zerowe nie spełniają nierówności.`]],
  }),
  numeric({
    id: 'k-inq-2',
    skill: 'quad-ineq',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile liczb całkowitych spełnia nierówność $x^2 - 2x - 3 \le 0$?`,
    answer: 5,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if (x * x - 2 * x - 3 <= 0) n += 1;
      return n;
    },
    hints: ['Jakie są miejsca zerowe?', r`$\Delta = 16$, $x_1 = -1$, $x_2 = 3$.`, r`$a > 0$ — parabola pod osią między zerami.`, r`$\langle -1, 3 \rangle$ razem z końcami.`],
    steps: [r`$x \in \langle -1, 3 \rangle$.`, r`Liczby: $-1, 0, 1, 2, 3$ — pięć.`],
    errors: [['3', r`Pominięte końce, choć nierówność jest nieostra.`, r`Przy $\le$ miejsca zerowe spełniają nierówność.`]],
  }),
  choice({
    id: 'k-inq-3',
    skill: 'quad-ineq',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Zbiorem rozwiązań nierówności $x^2 - 4x > 0$ jest`,
    choices: [r`$(-\infty, 0) \cup (4, +\infty)$`, r`$(0, 4)$`, r`$(4, +\infty)$`, r`$\langle 0, 4 \rangle$`],
    answer: 'A',
    hints: ['Jak rozłożyć lewą stronę na czynniki?', r`$x(x - 4) > 0$ — miejsca zerowe $0$ i $4$.`, r`$a > 0$ — gdzie parabola jest nad osią?`, 'Poza przedziałem między miejscami zerowymi.'],
    steps: [r`$x(x - 4) > 0$, zera: $0$ i $4$, $a > 0$.`, r`$x \in (-\infty, 0) \cup (4, +\infty)$.`],
    errors: [
      ['B', 'Odczytany zbiór dla nierówności odwrotnej (< 0).', r`Nad osią ($> 0$) parabola jest poza przedziałem zer.`],
      ['C', r`Nierówność podzielona przez $x$ — zgubiona część dla $x < 0$.`, 'Nie dziel przez wyrażenie, którego znaku nie znasz.'],
      ['D', 'Odwrócona nierówność i włączone końce.', r`$> 0$: nad osią, bez końców.`],
    ],
  }),
  numeric({
    id: 'k-inq-4',
    skill: 'quad-ineq',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj najmniejszą liczbę całkowitą spełniającą nierówność $x^2 + 2x - 8 < 0$.`,
    answer: -3,
    verify: () => {
      for (let x = -50; x <= 50; x += 1) if (x * x + 2 * x - 8 < 0) return x;
      return NaN;
    },
    hints: ['Jakie są miejsca zerowe?', r`$\Delta = 36$, $x_1 = -4$, $x_2 = 2$.`, r`Rozwiązanie: $(-4, 2)$ — bez końców.`, r`Najmniejsza liczba całkowita większa od $-4$.`],
    steps: [r`$x \in (-4, 2)$.`, r`Najmniejsza całkowita: $-3$.`],
    errors: [['-4', r`Włączony koniec przedziału, a nierówność jest ostra.`, r`$f(-4) = 0$, a potrzeba $< 0$.`]],
  }),
  choice({
    id: 'k-inq-5',
    skill: 'quad-ineq',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Nierówność $x^2 + x + 5 < 0$`,
    choices: ['nie ma rozwiązań', 'jest spełniona przez każdą liczbę rzeczywistą', 'ma dokładnie jedno rozwiązanie', r`ma rozwiązania w przedziale $(-5, 1)$`],
    answer: 'A',
    hints: ['Ile wynosi wyróżnik?', r`$\Delta = 1 - 20 < 0$ — brak miejsc zerowych.`, r`$a > 0$ — gdzie leży cała parabola?`, 'Cała nad osią.'],
    steps: [r`$\Delta < 0$ i $a > 0$ — parabola leży nad osią.`, r`Wartości zawsze dodatnie, więc $< 0$ nie zachodzi nigdy.`],
    errors: [
      ['B', r`To odpowiedź dla nierówności $> 0$.`, 'Parabola nad osią: wszystkie wartości dodatnie.'],
      ['C', r`Jedno rozwiązanie byłoby dla $\Delta = 0$ i nieostrej nierówności.`, r`Tu $\Delta < 0$.`],
      ['D', r`Miejsca zerowe „policzone” mimo ujemnego wyróżnika.`, r`Przy $\Delta < 0$ nie ma miejsc zerowych.`],
    ],
  }),
  numeric({
    id: 'k-inq-6',
    skill: 'quad-ineq',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ile liczb całkowitych spełnia nierówność $-x^2 + 3x + 10 \ge 0$?`,
    answer: 8,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if (-x * x + 3 * x + 10 >= 0) n += 1;
      return n;
    },
    hints: ['Jakie są miejsca zerowe?', r`$-x^2 + 3x + 10 = 0 \iff x^2 - 3x - 10 = 0$, czyli $x = -2$ lub $x = 5$.`, r`$a < 0$ — parabola nad osią MIĘDZY zerami.`, r`$\langle -2, 5 \rangle$ razem z końcami.`],
    steps: [r`$x \in \langle -2, 5 \rangle$.`, r`Liczby od $-2$ do $5$ — osiem.`],
    errors: [['6', 'Pominięte końce przedziału.', r`Przy $\ge$ miejsca zerowe należą do rozwiązania.`]],
  }),
  numeric({
    id: 'k-inq-7',
    skill: 'quad-ineq',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Wysokość piłki rzuconej pionowo w górę po $t$ sekundach wynosi $h(t) = 20t - 5t^2$ metrów. Przez ile sekund piłka była na wysokości co najmniej $15$ m?`,
    answer: 2,
    verify: () => 3 - 1,
    hints: ['Jaką nierówność trzeba rozwiązać?', r`$20t - 5t^2 \ge 15$.`, r`Podziel przez $-5$ (odwróć znak): $t^2 - 4t + 3 \le 0$.`, r`Miejsca zerowe: $1$ i $3$.`],
    steps: [r`$t^2 - 4t + 3 \le 0 \iff t \in \langle 1, 3 \rangle$.`, r`Czas: $3 - 1 = 2$ sekundy.`],
    errors: [['3', 'Podany koniec przedziału zamiast długości czasu.', 'Czas trwania to różnica końców przedziału.']],
  }),
  numeric({
    id: 'k-inq-8',
    skill: 'quad-ineq',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla ilu liczb całkowitych $x$ spełnione są jednocześnie nierówności $x^2 - 5x \le 0$ oraz $x^2 - 9 > 0$?`,
    answer: 2,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if (x * x - 5 * x <= 0 && x * x - 9 > 0) n += 1;
      return n;
    },
    hints: ['Rozwiąż każdą nierówność osobno — co wychodzi z pierwszej?', r`$x(x - 5) \le 0 \iff x \in \langle 0, 5 \rangle$.`, r`$x^2 > 9 \iff x < -3$ lub $x > 3$.`, 'Weź część wspólną obu zbiorów.'],
    steps: [r`Część wspólna: $x \in (3, 5\rangle$.`, r`Liczby całkowite: $4$ i $5$.`],
    errors: [['6', 'Uwzględniona tylko pierwsza nierówność.', 'Oba warunki muszą zachodzić jednocześnie.']],
  }),

  // -------------------------------------------------------------------------
  // quad-optim
  // -------------------------------------------------------------------------
  numeric({
    id: 'k-opt-1',
    skill: 'quad-optim',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz największą wartość funkcji $P(x) = x(10 - x)$.`,
    answer: 25,
    verify: () => 5 * (10 - 5),
    hints: ['Gdzie są miejsca zerowe tej funkcji?', r`$0$ i $10$ — wierzchołek w połowie drogi.`, r`$p = 5$.`, r`Oblicz $P(5)$.`],
    steps: [r`$p = \frac{0 + 10}{2} = 5$.`, r`$P(5) = 5 \cdot 5 = 25$.`],
    errors: [['5', 'Podany argument zamiast wartości.', 'Pytanie jest o największą wartość, a nie o to, gdzie jest przyjmowana.']],
  }),
  numeric({
    id: 'k-opt-2',
    skill: 'quad-optim',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj najmniejszą wartość funkcji $f(x) = x^2 - 4x$ w przedziale $\langle 0, 5 \rangle$.`,
    answer: -4,
    verify: () => Math.min(...[0, 2, 5].map((x) => x * x - 4 * x)),
    hints: ['Czy wierzchołek należy do przedziału?', r`$p = 2 \in \langle 0, 5 \rangle$.`, r`Porównaj $f(0)$, $f(2)$ i $f(5)$.`, r`$f(2) = 4 - 8$.`],
    steps: [r`$f(0) = 0$, $f(2) = -4$, $f(5) = 5$.`, r`Najmniejsza: $-4$.`],
    errors: [
      ['0', 'Porównane tylko końce przedziału.', 'Gdy wierzchołek leży w przedziale, trzeba go uwzględnić.'],
      ['2', r`Podane $p$ zamiast wartości.`, r`Wartość to $f(p)$.`],
    ],
  }),
  choice({
    id: 'k-opt-3',
    skill: 'quad-optim',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Największa wartość funkcji $f(x) = x^2 - 4x$ w przedziale $\langle 0, 5 \rangle$ jest równa`,
    choices: [r`$5$`, r`$-4$`, r`$0$`, 'nie istnieje'],
    answer: 'A',
    verify: () => Math.max(...[0, 2, 5].map((x) => x * x - 4 * x)),
    hints: ['Gdzie parabola z ramionami w górę osiąga największą wartość na odcinku?', 'Na jednym z końców przedziału.', r`$f(0) = 0$, $f(5) = 25 - 20$.`, 'Porównaj.'],
    steps: [r`$f(0) = 0$, $f(5) = 5$, $f(2) = -4$.`, r`Największa: $5$.`],
    errors: [
      ['B', 'Podana najmniejsza wartość.', 'Wierzchołek paraboli z ramionami w górę to minimum.'],
      ['C', 'Sprawdzony tylko lewy koniec.', 'Porównaj wartości na obu końcach.'],
      ['D', 'Na przedziale domkniętym funkcja zawsze ma wartość największą.', 'Nieograniczona jest tylko na całej osi.'],
    ],
  }),
  numeric({
    id: 'k-opt-4',
    skill: 'quad-optim',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Z $40$ m siatki ogradzasz prostokątny wybieg. Oblicz największe możliwe pole wybiegu (w m²).`,
    answer: 100,
    verify: () => 10 * (20 - 10),
    hints: ['Jak zależą od siebie boki przy obwodzie 40 m?', r`$x + y = 20$, więc $y = 20 - x$.`, r`$P(x) = x(20 - x)$ — wierzchołek w $x = 10$.`, r`$P(10) = 10 \cdot 10$.`],
    steps: [r`$P(x) = x(20 - x)$, $p = 10$.`, r`$P_{\max} = 100\ \mathrm{m}^2$.`],
    errors: [['400', r`Suma boków wzięta jako $40$ zamiast połowy obwodu.`, r`Obwód $2(x + y) = 40$, więc $x + y = 20$.`]],
  }),
  numeric({
    id: 'k-opt-5',
    skill: 'quad-optim',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj najmniejszą wartość funkcji $f(x) = x^2 - 6x + 10$ w przedziale $\langle 4, 7 \rangle$.`,
    answer: 2,
    verify: () => Math.min(4 * 4 - 24 + 10, 49 - 42 + 10),
    hints: ['Gdzie jest wierzchołek i czy należy do przedziału?', r`$p = 3$ — poza przedziałem $\langle 4, 7 \rangle$.`, 'Na przedziale funkcja jest rosnąca — minimum na lewym końcu.', r`$f(4) = 16 - 24 + 10$.`],
    steps: [r`$p = 3 \notin \langle 4, 7 \rangle$, funkcja rośnie na tym przedziale.`, r`$f_{\min} = f(4) = 2$.`],
    errors: [['1', r`Podane $q$ wierzchołka, który leży poza przedziałem.`, 'Wierzchołek spoza przedziału się nie liczy.']],
  }),
  numeric({
    id: 'k-opt-6',
    skill: 'quad-optim',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wybieg przy ścianie budynku: z $60$ m siatki ogradzasz prostokąt z trzech stron, a czwartą stroną jest ściana. Oblicz największe możliwe pole (w m²).`,
    answer: 450,
    verify: () => 15 * (60 - 2 * 15),
    hints: ['Jak rozkłada się siatka na trzy boki?', r`Dwa boki $x$ prostopadłe do ściany i jeden $60 - 2x$.`, r`$P(x) = x(60 - 2x)$, wierzchołek w $x = 15$.`, r`$P(15) = 15 \cdot 30$.`],
    steps: [r`$P(x) = -2x^2 + 60x$, $p = 15$.`, r`$P(15) = 15 \cdot 30 = 450\ \mathrm{m}^2$.`],
    errors: [['225', 'Przyjęty kwadrat, jak przy ogrodzeniu z czterech stron.', 'Przy ścianie siatka tworzy tylko trzy boki — kwadrat nie jest optymalny.']],
  }),
  numeric({
    id: 'k-opt-7',
    skill: 'quad-optim',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Kino sprzedaje $300$ biletów po $20$ zł. Każda obniżka ceny o $1$ zł zwiększa sprzedaż o $30$ biletów. Jaki jest największy możliwy przychód (w zł)?`,
    answer: 6750,
    verify: () => {
      let best = 0;
      for (let k = 0; k <= 20; k += 0.5) best = Math.max(best, (20 - k) * (300 + 30 * k));
      return best;
    },
    hints: ['Jak zapisać przychód po obniżce o k zł?', r`$R(k) = (20 - k)(300 + 30k)$.`, r`Miejsca zerowe: $k = 20$ i $k = -10$ — wierzchołek w połowie.`, r`$k = 5$: $15 \cdot 450$.`],
    steps: [r`$R(k) = (20 - k)(300 + 30k)$, $p = \frac{20 + (-10)}{2} = 5$.`, r`$R(5) = 15 \cdot 450 = 6750$ zł.`],
    errors: [['6000', 'Przychód bez obniżki — nie sprawdzono, czy obniżka się opłaca.', 'Największa wartość jest w wierzchołku, a nie w punkcie startowym.']],
  }),
  numeric({
    id: 'k-opt-8',
    skill: 'quad-optim',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Suma długości przyprostokątnych trójkąta prostokątnego wynosi $10$. Oblicz najmniejszą możliwą wartość kwadratu długości przeciwprostokątnej.`,
    answer: 50,
    verify: () => 5 ** 2 + 5 ** 2,
    hints: ['Jak wyrazić kwadrat przeciwprostokątnej przez jedną przyprostokątną x?', r`$c^2 = x^2 + (10 - x)^2$.`, r`$c^2 = 2x^2 - 20x + 100$ — wierzchołek w $x = 5$.`, r`Oblicz $c^2$ dla $x = 5$.`],
    steps: [r`$c^2 = 2x^2 - 20x + 100$, $p = 5$.`, r`$c^2_{\min} = 25 + 25 = 50$.`],
    errors: [['25', 'Policzony kwadrat tylko jednej przyprostokątnej.', r`$c^2 = a^2 + b^2$ — suma obu kwadratów.`]],
  }),

  // -------------------------------------------------------------------------
  // quad-vieta - uzupełnienia
  // -------------------------------------------------------------------------
  numeric({
    id: 'k-vie-4',
    skill: 'quad-vieta',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Równanie $x^2 - 9x + 14 = 0$ ma dwa pierwiastki. Podaj ich iloczyn.`,
    answer: 14,
    verify: () => 2 * 7,
    hints: ['Który wzór Viète’a daje iloczyn?', r`$x_1 x_2 = \frac{c}{a}$.`, r`$a = 1$, $c = 14$.`, r`$\frac{14}{1}$.`],
    steps: [r`$x_1 x_2 = \frac{c}{a} = \frac{14}{1}$.`, r`Iloczyn: $14$.`],
    errors: [
      ['9', 'Podana suma zamiast iloczynu.', r`Suma to $-\frac{b}{a}$, iloczyn — $\frac{c}{a}$.`],
      ['-14', r`Dodany minus, którego we wzorze na iloczyn nie ma.`, r`$x_1x_2 = \frac{c}{a}$ — bez minusa.`],
    ],
  }),
  choice({
    id: 'k-vie-5',
    skill: 'quad-vieta',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Suma pierwiastków równania $2x^2 - 6x - 1 = 0$ jest równa`,
    choices: [r`$3$`, r`$-3$`, r`$6$`, r`$-\frac{1}{2}$`],
    answer: 'A',
    verify: () => 6 / 2,
    hints: ['Czy równanie ma pierwiastki?', r`$\Delta = 36 + 8 > 0$ — tak.`, r`$x_1 + x_2 = -\frac{b}{a}$.`, r`$-\frac{-6}{2}$.`],
    steps: [r`$\Delta > 0$.`, r`$x_1 + x_2 = -\frac{-6}{2} = 3$.`],
    errors: [
      ['B', r`Zgubiony minus we wzorze $-\frac{b}{a}$.`, r`Suma to $-\frac{b}{a}$, a $b = -6$.`],
      ['C', r`Pominięte dzielenie przez $a = 2$.`, r`Wzór to $-\frac{b}{a}$.`],
      ['D', 'Podany iloczyn zamiast sumy.', r`Iloczyn to $\frac{c}{a}$.`],
    ],
  }),
  numeric({
    id: 'k-vie-6',
    skill: 'quad-vieta',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Liczby $x_1$ i $x_2$ są pierwiastkami równania $x^2 - 4x + 1 = 0$. Oblicz $\frac{1}{x_1} + \frac{1}{x_2}$.`,
    answer: 4,
    verify: () => {
      const d = Math.sqrt(16 - 4);
      const a = (4 - d) / 2;
      const b = (4 + d) / 2;
      return 1 / a + 1 / b;
    },
    hints: ['Jak przepisać sumę odwrotności na sumę i iloczyn?', r`$\frac{1}{x_1} + \frac{1}{x_2} = \frac{x_1 + x_2}{x_1 x_2}$.`, r`$x_1 + x_2 = 4$, $x_1 x_2 = 1$.`, r`$\frac{4}{1}$.`],
    steps: [r`$\frac{x_1 + x_2}{x_1 x_2} = \frac{4}{1}$.`, r`Wynik: $4$.`],
    errors: [['0.25', 'Odwrócony iloraz.', r`Wspólny mianownik to $x_1x_2$ — iloczyn jest na dole.`]],
  }),

  // -------------------------------------------------------------------------
  // quad-param
  // -------------------------------------------------------------------------
  numeric({
    id: 'k-prm-1',
    skill: 'quad-param',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla jakiego $m$ równanie $x^2 - 6x + m = 0$ ma dokładnie jeden pierwiastek?`,
    answer: 9,
    verify: () => 36 / 4,
    hints: ['Jaki warunek daje jeden pierwiastek?', r`$\Delta = 0$.`, r`$\Delta = 36 - 4m$.`, r`$36 - 4m = 0$.`],
    steps: [r`$36 - 4m = 0$.`, r`$m = 9$.`],
    errors: [
      ['36', r`Przyrównane $m$ do $b^2$ bez dzielenia przez $4$.`, r`$\Delta = b^2 - 4ac = 36 - 4m$.`],
      ['-9', r`Zły znak przy rozwiązaniu.`, r`$4m = 36$.`],
    ],
  }),
  numeric({
    id: 'k-prm-2',
    skill: 'quad-param',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj największą liczbę całkowitą $m$, dla której równanie $x^2 - 4x + m = 0$ ma dwa różne pierwiastki.`,
    answer: 3,
    verify: () => {
      for (let m = 20; m > -20; m -= 1) if (16 - 4 * m > 0) return m;
      return NaN;
    },
    hints: ['Jaki warunek daje dwa różne pierwiastki?', r`$\Delta > 0$.`, r`$16 - 4m > 0 \iff m < 4$.`, r`Największa liczba całkowita mniejsza od $4$.`],
    steps: [r`$m < 4$.`, r`Największa całkowita: $3$.`],
    errors: [['4', r`Dla $m = 4$ jest $\Delta = 0$ — pierwiastek jest jeden.`, r`Dwa różne pierwiastki wymagają $\Delta > 0$.`]],
  }),
  choice({
    id: 'k-prm-3',
    skill: 'quad-param',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Równanie $x^2 + mx + 4 = 0$ nie ma rozwiązań rzeczywistych wtedy i tylko wtedy, gdy`,
    choices: [r`$m \in (-4, 4)$`, r`$m \in (-\infty, -4) \cup (4, +\infty)$`, r`$m \in (-16, 16)$`, r`$m \in \langle -4, 4 \rangle$`],
    answer: 'A',
    hints: ['Jaki warunek daje brak rozwiązań?', r`$\Delta < 0$: $m^2 - 16 < 0$.`, r`$m^2 < 16$.`, r`$|m| < 4$.`],
    steps: [r`$m^2 - 16 < 0 \iff m^2 < 16$.`, r`$m \in (-4, 4)$.`],
    errors: [
      ['B', r`To warunek na dwa rozwiązania ($\Delta > 0$).`, r`Brak rozwiązań: $\Delta < 0$.`],
      ['C', r`Z $m^2 < 16$ przyjęte $|m| < 16$.`, r`$m^2 < 16 \iff |m| < 4$.`],
      ['D', r`Dla $m = \pm 4$ jest $\Delta = 0$ — jedno rozwiązanie.`, 'Końce przedziału nie należą.'],
    ],
  }),
  numeric({
    id: 'k-prm-4',
    skill: 'quad-param',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych $m$ sprawia, że równanie $x^2 + mx + 4 = 0$ nie ma rozwiązań rzeczywistych?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let m = -50; m <= 50; m += 1) if (m * m - 16 < 0) n += 1;
      return n;
    },
    hints: ['Jaki warunek na m daje brak rozwiązań?', r`$m^2 - 16 < 0$, czyli $m \in (-4, 4)$.`, 'Końce nie należą.', r`Policz liczby od $-3$ do $3$.`],
    steps: [r`$m \in (-4, 4)$.`, r`Liczby całkowite: $-3, \ldots, 3$ — siedem.`],
    errors: [['9', r`Włączone $m = \pm 4$, dla których $\Delta = 0$.`, 'Przy Δ = 0 równanie ma jedno rozwiązanie.']],
  }),
  numeric({
    id: 'k-prm-5',
    skill: 'quad-param',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Równanie $(m - 2)x^2 + 4x + 1 = 0$ ma dokładnie jedno rozwiązanie. Podaj sumę wszystkich takich wartości $m$.`,
    answer: 8,
    verify: () => 2 + 6,
    hints: ['Czy współczynnik przy x² może być zerem?', r`Dla $m = 2$ równanie jest liniowe: $4x + 1 = 0$ — jedno rozwiązanie.`, r`Dla $m \ne 2$: $\Delta = 16 - 4(m - 2) = 0$.`, r`$24 - 4m = 0$.`],
    steps: [r`$m = 2$ (równanie liniowe) oraz $m = 6$ ($\Delta = 0$).`, r`Suma: $8$.`],
    errors: [['6', r`Pominięty przypadek $m = 2$, gdy równanie jest liniowe.`, r`Zawsze sprawdź, czy współczynnik przy $x^2$ może się zerować.`]],
  }),
  numeric({
    id: 'k-prm-6',
    skill: 'quad-param',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Równanie $x^2 - 2mx + m + 2 = 0$ ma dwa różne pierwiastki dodatnie. Podaj najmniejszą liczbę całkowitą $m$ spełniającą ten warunek.`,
    answer: 3,
    verify: () => {
      for (let m = -20; m <= 20; m += 1) {
        const d = 4 * m * m - 4 * (m + 2);
        if (d <= 0) continue;
        const x1 = (2 * m - Math.sqrt(d)) / 2;
        const x2 = (2 * m + Math.sqrt(d)) / 2;
        if (x1 > 0 && x2 > 0) return m;
      }
      return NaN;
    },
    hints: ['Jakie trzy warunki trzeba zapisać?', r`$\Delta > 0$, $x_1 + x_2 > 0$, $x_1 x_2 > 0$.`, r`$\Delta > 0 \iff m < -1 \vee m > 2$; suma $2m > 0$; iloczyn $m + 2 > 0$.`, r`Część wspólna: $m > 2$.`],
    steps: [r`Warunki dają $m > 2$.`, r`Najmniejsza całkowita: $3$.`],
    errors: [['2', r`Dla $m = 2$ jest $\Delta = 0$ — pierwiastki nie są różne.`, r`Dwa różne pierwiastki wymagają $\Delta > 0$.`]],
  }),
  numeric({
    id: 'k-prm-7',
    skill: 'quad-param',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Suma kwadratów pierwiastków równania $x^2 - (m + 1)x + m = 0$ wynosi $10$. Podaj dodatnią wartość $m$.`,
    answer: 3,
    verify: () => {
      const m = 3;
      const s = m + 1;
      const pr = m;
      return s * s - 2 * pr === 10 ? m : NaN;
    },
    hints: ['Jak zapisać sumę kwadratów przez sumę i iloczyn?', r`$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$.`, r`$(m + 1)^2 - 2m = m^2 + 1$.`, r`$m^2 + 1 = 10$.`],
    steps: [r`$m^2 + 1 = 10 \Rightarrow m = \pm 3$; $\Delta = (m - 1)^2 \ge 0$.`, r`Dodatnia wartość: $m = 3$.`],
    errors: [['9', r`Z $m^2 = 9$ przyjęte $m = 9$.`, r`$m^2 = 9 \iff m = \pm 3$.`]],
  }),
  numeric({
    id: 'k-prm-8',
    skill: 'quad-param',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla ilu liczb całkowitych $m$ z przedziału $\langle -10, 10 \rangle$ równanie $mx^2 + 2x + 1 = 0$ ma dwa różne pierwiastki ujemne?`,
    answer: 0,
    verify: () => {
      let n = 0;
      for (let m = -10; m <= 10; m += 1) {
        if (m === 0) continue;
        const d = 4 - 4 * m;
        if (d <= 0) continue;
        const x1 = (-2 - Math.sqrt(d)) / (2 * m);
        const x2 = (-2 + Math.sqrt(d)) / (2 * m);
        if (x1 < 0 && x2 < 0) n += 1;
      }
      return n;
    },
    hints: ['Jakie warunki trzeba zapisać dla dwóch różnych pierwiastków ujemnych?', r`$m \ne 0$, $\Delta > 0$, $x_1 + x_2 < 0$, $x_1x_2 > 0$.`, r`$\Delta = 4 - 4m > 0 \iff m < 1$; iloczyn $\frac{1}{m} > 0 \iff m > 0$.`, 'Czy jakaś liczba całkowita spełnia jednocześnie m > 0 i m < 1?'],
    steps: [r`Warunki dają $0 < m < 1$.`, 'W tym przedziale nie ma liczb całkowitych — odpowiedź 0.'],
    errors: [['10', r`Uwzględniony tylko warunek $\Delta > 0$.`, 'Przy pytaniu o znaki pierwiastków potrzebne są też warunki na sumę i iloczyn.']],
  }),
];

export const QUAD_QUESTIONS: Question[] = [...QUADRATIC_QUESTIONS, ...NEW_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const QUAD_CARDS: Flashcard[] = [
  card('c-quad-frm-1', 'quad-forms', 'wzor', 'Postać kanoniczna funkcji kwadratowej?', r`$f(x) = a(x - p)^2 + q$, wierzchołek $W = (p, q)$.`),
  card('c-quad-frm-2', 'quad-forms', 'wzor', 'Postać iloczynowa?', r`$f(x) = a(x - x_1)(x - x_2)$ — miejsca zerowe widać od razu.`),
  card('c-quad-frm-3', 'quad-forms', 'pulapka', r`$(x + 2)^2$ w postaci kanonicznej — ile wynosi $p$?`, r`$p = -2$.`),

  card('c-quad-dis-1', 'quad-discriminant', 'wzor', 'Wyróżnik i pierwiastki?', r`$\Delta = b^2 - 4ac$, $x_{1,2} = \frac{-b \mp \sqrt{\Delta}}{2a}$.`),
  card('c-quad-dis-2', 'quad-discriminant', 'definicja', 'Liczba rozwiązań a znak Δ?', r`$\Delta > 0$ — dwa, $\Delta = 0$ — jedno, $\Delta < 0$ — brak.`),
  card('c-quad-dis-3', 'quad-discriminant', 'metoda', r`$ax^2 + bx = 0$ — jak najszybciej?`, r`Wyłącz $x$: $x(ax + b) = 0$. Bez wyróżnika.`),

  card('c-quad-ver-1', 'quad-vertex', 'wzor', 'Współrzędne wierzchołka?', r`$p = -\frac{b}{2a}$, $q = f(p) = -\frac{\Delta}{4a}$.`),
  card('c-quad-ver-2', 'quad-vertex', 'metoda', 'Wierzchołek, gdy znasz miejsca zerowe?', r`$p = \frac{x_1 + x_2}{2}$ — w połowie między nimi.`),

  card('c-quad-inq-1', 'quad-ineq', 'metoda', 'Nierówność kwadratowa w trzech krokach?', 'Miejsca zerowe → szkic paraboli (znak a) → odczyt, gdzie wykres jest nad albo pod osią.'),
  card('c-quad-inq-2', 'quad-ineq', 'pulapka', r`Dla $a < 0$ parabola jest nad osią…`, 'MIĘDZY miejscami zerowymi — odwrotnie niż dla a > 0.'),

  card('c-quad-opt-1', 'quad-optim', 'metoda', 'Największa i najmniejsza wartość na przedziale?', r`Porównaj wartości na końcach i w wierzchołku — ten ostatni tylko, gdy $p$ należy do przedziału.`),
  card('c-quad-opt-2', 'quad-optim', 'definicja', 'Prostokąt o danym obwodzie i największym polu?', 'Kwadrat.'),

  card('c-quad-vie-1', 'quad-vieta', 'wzor', 'Wzory Viète’a?', r`$x_1 + x_2 = -\frac{b}{a}$, $x_1 x_2 = \frac{c}{a}$.`),
  card('c-quad-vie-2', 'quad-vieta', 'wzor', r`$x_1^2 + x_2^2 = \;?$`, r`$(x_1 + x_2)^2 - 2x_1x_2$`),
  card('c-quad-vie-3', 'quad-vieta', 'pulapka', 'Kiedy wolno użyć wzorów Viète’a?', r`Gdy pierwiastki istnieją: $\Delta \ge 0$.`),

  card('c-quad-prm-1', 'quad-param', 'metoda', 'Dwa różne pierwiastki dodatnie?', r`$a \ne 0$, $\Delta > 0$, $x_1 + x_2 > 0$, $x_1x_2 > 0$ — i część wspólna.`),
  card('c-quad-prm-2', 'quad-param', 'pulapka', '„Dokładnie jedno rozwiązanie” z parametrem przy x²?', r`Sprawdź też $a = 0$ — równanie liniowe może mieć jedno rozwiązanie.`),
];

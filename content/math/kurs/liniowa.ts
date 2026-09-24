import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 5: Funkcja liniowa.
 *
 * Podstawa: współczynniki i wykres, prosta przez dwa punkty, proste
 * równoległe i prostopadłe, zadania z treścią. Rozszerzenie: parametr.
 */

const r = String.raw;

export const LINEAR_TOPIC: Topic = {
  id: 'math-linear',
  subjectId: 'math',
  name: 'Funkcja liniowa',
  summary:
    'Prosta y = ax + b: nachylenie, przecięcia z osiami, proste równoległe i prostopadłe, modele „stała opłata + stawka”.',
};

export const LINEAR_SKILLS: Skill[] = [
  {
    id: 'lin-formula',
    topicId: 'math-linear',
    name: 'Wzór i wykres funkcji liniowej',
    level: 'PP',
    ckeRequirement: 'Funkcja liniowa — współczynnik kierunkowy, wyraz wolny, monotoniczność, miejsce zerowe',
    prerequisites: ['fn-basics'],
    examValue: 0.75,
  },
  {
    id: 'lin-two-points',
    topicId: 'math-linear',
    name: 'Prosta przez dwa punkty',
    level: 'PP',
    ckeRequirement: 'Funkcja liniowa — wzór funkcji liniowej, której wykres przechodzi przez dwa dane punkty',
    prerequisites: ['lin-formula'],
    examValue: 0.75,
  },
  {
    id: 'lin-parallel',
    topicId: 'math-linear',
    name: 'Proste równoległe i prostopadłe',
    level: 'PP',
    ckeRequirement: 'Funkcja liniowa — warunek równoległości i prostopadłości prostych',
    prerequisites: ['lin-two-points'],
    examValue: 0.7,
  },
  {
    id: 'lin-model',
    topicId: 'math-linear',
    name: 'Funkcja liniowa w zadaniach z treścią',
    level: 'PP',
    ckeRequirement: 'Funkcja liniowa — modelowanie sytuacji opisanych w zadaniach',
    prerequisites: ['lin-formula', 'ineq-linear'],
    examValue: 0.7,
  },
  {
    id: 'lin-param',
    topicId: 'math-linear',
    name: 'Funkcja liniowa z parametrem',
    level: 'PR',
    ckeRequirement: 'Funkcja liniowa — własności funkcji w zależności od parametru',
    prerequisites: ['lin-formula', 'ineq-linear'],
    examValue: 0.5,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const LINEAR_LESSONS: Lesson[] = [
  {
    skillId: 'lin-formula',
    minutes: 10,
    intro:
      r`Funkcja liniowa $f(x) = ax + b$ to najprostszy model zmiany: coś rośnie albo maleje w stałym tempie. Jej wykres to prosta, a dwie liczby $a$ i $b$ mówią o niej wszystko.`,
    blocks: [
      p(r`$b$ to wyraz wolny — wartość dla $x = 0$, czyli miejsce, w którym prosta przecina oś $y$: punkt $(0, b)$.`),
      p(
        r`$a$ to współczynnik kierunkowy — o ile zmienia się $y$, gdy $x$ rośnie o $1$. Dla $a = 2$ każdy krok w prawo to dwa w górę, dla $a = -\frac{1}{2}$ — pół w dół.`,
      ),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Dwie proste: rosnąca y = 2x − 1 przecinająca oś y w −1 oraz malejąca y = −0,5x + 2 przecinająca oś y w 2.',
          x: [-3, 4],
          y: [-4, 5],
          curves: [
            { fn: (x) => 2 * x - 1, label: 'f' },
            { fn: (x) => -0.5 * x + 2, label: 'g', dashed: true },
          ],
          points: [
            { at: [0, -1] },
            { at: [0, 2] },
          ],
        },
        caption: 'f(x) = 2x − 1 rośnie, g(x) = −0,5x + 2 maleje',
      },
      f(r`a > 0 \Rightarrow \text{rosnąca} \qquad a < 0 \Rightarrow \text{malejąca} \qquad a = 0 \Rightarrow \text{stała}`),
      p(r`Miejsce zerowe (dla $a \ne 0$): $ax + b = 0$, więc $x = -\frac{b}{a}$.`),
      tip(
        r`Szkic wykresu: zaznacz $(0, b)$, potem zrób krok $1$ w prawo i $a$ w górę (albo w dół, gdy $a < 0$). Przez te dwa punkty przechodzi prosta.`,
      ),
      warn(r`O monotoniczności decyduje tylko znak $a$. Wyraz $b$ przesuwa prostą w górę lub w dół, ale nie zmienia jej nachylenia.`),
    ],
    examples: [
      example(
        r`Dla $f(x) = -3x + 6$ podaj punkt przecięcia z osią $y$, miejsce zerowe i monotoniczność.`,
        [r`$b = 6$ — przecięcie z osią $y$ w $(0, 6)$.`, r`$-3x + 6 = 0 \Rightarrow x = 2$ — miejsce zerowe.`, r`$a = -3 < 0$ — funkcja malejąca.`],
        r`$(0, 6)$; $x = 2$; malejąca`,
      ),
      example(
        r`Dla jakiego $x$ funkcja $f(x) = \frac{1}{2}x - 4$ przyjmuje wartość $1$?`,
        [r`$\frac{1}{2}x - 4 = 1$.`, r`$\frac{1}{2}x = 5$, więc $x = 10$.`],
        r`$x = 10$`,
      ),
    ],
    pitfalls: [
      r`Mylenie $a$ i $b$: $b$ to przecięcie z osią $y$, $a$ — nachylenie.`,
      r`Miejsce zerowe to $-\frac{b}{a}$, a nie $\frac{b}{a}$.`,
      r`Monotoniczność zależy od $a$, nie od $b$.`,
    ],
  },
  {
    skillId: 'lin-two-points',
    minutes: 10,
    intro: 'Dwa punkty wyznaczają prostą — to jedno z najczęstszych zadań maturalnych. Wystarczy jeden wzór na nachylenie i jedno podstawienie.',
    blocks: [
      f(r`a = \frac{y_2 - y_1}{x_2 - x_1}`, 'nachylenie prostej przez dwa punkty'),
      p(r`Nachylenie to „przyrost w pionie przez przyrost w poziomie”. Dla punktów $(1, 2)$ i $(4, 8)$: $a = \frac{8 - 2}{4 - 1} = \frac{6}{3} = 2$.`),
      p(r`Potem wyraz wolny: wstawiasz jeden z punktów do $y = ax + b$. $2 = 2 \cdot 1 + b$, więc $b = 0$. Prosta: $y = 2x$.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Prosta y = 2x przechodząca przez punkty A = (1, 2) i B = (4, 8).',
          x: [-1, 6],
          y: [-1, 10],
          curves: [{ fn: (x) => 2 * x }],
          points: [
            { at: [1, 2], label: 'A' },
            { at: [4, 8], label: 'B' },
          ],
        },
        caption: 'Od A do B: 3 kroki w prawo i 6 w górę — nachylenie 6 : 3 = 2',
      },
      tip(r`Sprawdzenie: drugi punkt też musi spełniać wzór. $2 \cdot 4 = 8$ — zgadza się.`),
      warn(
        r`W liczniku i w mianowniku odejmujesz w tej samej kolejności: $y_2 - y_1$ i $x_2 - x_1$. Pomieszanie kolejności zmienia znak nachylenia.`,
      ),
    ],
    examples: [
      example(
        r`Wyznacz wzór prostej przez $A = (-2, 5)$ i $B = (2, -3)$.`,
        [
          r`$a = \frac{-3 - 5}{2 - (-2)} = \frac{-8}{4} = -2$.`,
          r`Wstawiam $B$: $-3 = -2 \cdot 2 + b$, więc $b = 1$.`,
          r`$y = -2x + 1$. Sprawdzenie dla $A$: $-2 \cdot (-2) + 1 = 5$.`,
        ],
        r`$y = -2x + 1$`,
      ),
      example(
        r`Czy punkty $(0, 1)$, $(2, 5)$ i $(5, 11)$ leżą na jednej prostej?`,
        [
          r`Prosta przez dwa pierwsze: $a = \frac{5 - 1}{2 - 0} = 2$, $b = 1$.`,
          r`Trzeci punkt: $2 \cdot 5 + 1 = 11$ — spełnia wzór.`,
        ],
        'tak, leżą na prostej y = 2x + 1',
      ),
    ],
    pitfalls: [
      'Różna kolejność odejmowania w liczniku i mianowniku.',
      r`Zgubiony minus przy odejmowaniu liczby ujemnej: $2 - (-2) = 4$.`,
      'Brak sprawdzenia drugiego punktu.',
    ],
  },
  {
    skillId: 'lin-parallel',
    minutes: 10,
    intro:
      'Proste równoległe biegną w tym samym kierunku — mają jednakowe nachylenie. Prostopadłe przecinają się pod kątem prostym — ich nachylenia są „odwrotne z przeciwnym znakiem”.',
    blocks: [
      f(r`y = a_1x + b_1 \ \parallel\ y = a_2x + b_2 \iff a_1 = a_2`, 'proste równoległe'),
      f(r`y = a_1x + b_1 \ \perp\ y = a_2x + b_2 \iff a_1 \cdot a_2 = -1`, 'proste prostopadłe'),
      p(r`Nachylenie prostopadłe: odwracasz ułamek i zmieniasz znak. Do $a = 2$ prostopadłe jest $-\frac{1}{2}$, do $a = -\frac{3}{4}$ — $\frac{4}{3}$.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Prosta y = 2x i prostopadła do niej prosta y = −0,5x + 2,5 przecinające się w punkcie (1, 2).',
          x: [-3, 5],
          y: [-3, 6],
          curves: [
            { fn: (x) => 2 * x, label: 'f' },
            { fn: (x) => -0.5 * x + 2.5, label: 'g', dashed: true },
          ],
          points: [{ at: [1, 2] }],
        },
        caption: 'Nachylenia 2 i −½ dają iloczyn −1 — proste są prostopadłe',
      },
      tip('Zadanie „prosta przez punkt P, równoległa (prostopadła) do danej”: najpierw nachylenie z warunku, potem b z punktu P.'),
      warn(r`Prostopadłe to nie „ten sam $a$ z minusem”. Do $a = 2$ prostopadłe jest $-\frac{1}{2}$, a nie $-2$.`),
    ],
    examples: [
      example(
        r`Wyznacz prostą przez $P = (2, 1)$ prostopadłą do $y = 2x - 5$.`,
        [r`Nachylenie prostopadłe: $a = -\frac{1}{2}$.`, r`$1 = -\frac{1}{2} \cdot 2 + b$, więc $b = 2$.`, r`$y = -\frac{1}{2}x + 2$.`],
        r`$y = -\frac{1}{2}x + 2$`,
      ),
      example(
        r`Dla jakiego $m$ proste $y = (m - 1)x + 4$ i $y = 3x$ są równoległe?`,
        [r`Równoległe: $m - 1 = 3$.`, r`$m = 4$.`],
        r`$m = 4$`,
      ),
    ],
    pitfalls: [
      r`Prostopadłe nachylenie to $-\frac{1}{a}$, nie $-a$.`,
      r`Po ustaleniu nachylenia zapomniane $b$ z punktu.`,
      r`Proste równoległe mogą mieć różne $b$ — to wciąż dwie różne proste.`,
    ],
  },
  {
    skillId: 'lin-model',
    minutes: 10,
    intro:
      r`Zadania „z życia” — rachunki, taryfy, drogi, zapasy — prawie zawsze kryją funkcję liniową. Sztuka polega na tym, żeby rozpoznać, co jest stałą opłatą ($b$), a co tempem zmiany ($a$).`,
    blocks: [
      p(r`$b$ to wartość na starcie (dla $x = 0$): opłata stała, stan początkowy. $a$ to zmiana na jednostkę: cena za kilometr, spadek na godzinę.`),
      f(r`\text{koszt} = \text{opłata stała} + \text{stawka} \cdot \text{liczba jednostek}`),
      tip(
        r`Przed rachunkiem zapisz słownie, co oznacza $x$ i w jakich jednostkach. Połowa błędów w zadaniach tekstowych to pomylone jednostki: minuty z godzinami, złote z groszami.`,
      ),
      p('Porównanie dwóch ofert to dwie proste. Punkt przecięcia mówi, od kiedy jedna staje się tańsza od drugiej.'),
      warn('Wynik ujemny w zadaniu z treścią zwykle oznacza, że model przestaje działać — długość świecy nie bywa ujemna. Sprawdzaj, czy wynik ma sens.'),
    ],
    examples: [
      example(
        r`Oferta A: $20$ zł abonamentu i $0{,}5$ zł za minutę. Oferta B: $0{,}9$ zł za minutę. Od ilu minut A jest tańsza?`,
        [
          r`$A(x) = 20 + 0{,}5x$, $B(x) = 0{,}9x$.`,
          r`$20 + 0{,}5x < 0{,}9x \Rightarrow 20 < 0{,}4x \Rightarrow x > 50$.`,
          r`Od $51$ minut oferta A jest tańsza.`,
        ],
        r`od $51$ minut`,
      ),
      example(
        r`Zbiornik ma $600$ l wody i traci $15$ l na minutę. Po ilu minutach zostanie $150$ l?`,
        [r`$V(t) = 600 - 15t$.`, r`$600 - 15t = 150 \Rightarrow 15t = 450 \Rightarrow t = 30$.`],
        r`po $30$ minutach`,
      ),
    ],
    pitfalls: ['Pomylenie opłaty stałej ze stawką za jednostkę.', 'Różne jednostki w jednym wzorze.', 'Wartość graniczna przy pytaniu „od ilu”: przy równości oferty kosztują tyle samo.'],
  },
  {
    skillId: 'lin-param',
    minutes: 10,
    intro:
      r`Parametr to liczba nieznana, ale stała — na przykład $m$ we wzorze $f(x) = (m - 2)x + 3$. Pytanie brzmi zwykle: dla jakich $m$ funkcja ma daną własność?`,
    blocks: [
      p(r`Metoda: własność funkcji zamieniasz na warunek dla współczynników, a potem rozwiązujesz ten warunek jako równanie lub nierówność z niewiadomą $m$.`),
      f(r`f(x) = (m-2)x + 3 \text{ rosnąca} \iff m - 2 > 0 \iff m > 2`),
      p(r`Miejsce zerowe w przedziale: wyznaczasz $x_0 = -\frac{b}{a}$ jako wyrażenie z $m$ i żądasz, żeby należało do przedziału.`),
      tip(r`Nie zapominaj o przypadku $a = 0$ — funkcji stałej. Często trzeba go rozpatrzyć osobno.`),
      warn(r`Mnożąc nierówność przez wyrażenie z $m$, musisz znać jego znak. Jeśli go nie znasz — rozpatrz przypadki.`),
    ],
    examples: [
      example(r`Dla jakich $m$ funkcja $f(x) = (3 - m)x + 1$ jest malejąca?`, [r`Malejąca $\iff 3 - m < 0$.`, r`$m > 3$.`], r`$m > 3$`),
      example(
        r`Dla jakich $m$ miejsce zerowe funkcji $f(x) = 2x + m - 4$ jest dodatnie?`,
        [r`$2x + m - 4 = 0 \Rightarrow x = \frac{4 - m}{2}$.`, r`$\frac{4 - m}{2} > 0 \iff 4 - m > 0 \iff m < 4$.`],
        r`$m < 4$`,
      ),
    ],
    pitfalls: [r`Pominięty przypadek $a = 0$.`, 'Nieodwrócony znak przy dzieleniu przez liczbę ujemną.', r`Warunek zapisany dla $x_0$, ale nierozwiązany względem $m$.`],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const LINEAR_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // lin-formula
  // -------------------------------------------------------------------------
  numeric({
    id: 'l-for-1',
    skill: 'lin-formula',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Podaj współczynnik kierunkowy funkcji $f(x) = -4x + 7$.`,
    answer: -4,
    verify: () => -4,
    hints: [r`Który współczynnik stoi przy $x$?`, r`We wzorze $y = ax + b$ współczynnik kierunkowy to $a$.`, 'Pamiętaj o znaku.', r`Przy $x$ stoi $-4$.`],
    steps: [r`$f(x) = ax + b$ z $a = -4$, $b = 7$.`, r`Współczynnik kierunkowy: $-4$.`],
    errors: [
      ['7', 'Podany wyraz wolny zamiast współczynnika kierunkowego.', r`Współczynnik kierunkowy stoi przy $x$.`],
      ['4', 'Zgubiony znak współczynnika.', 'Znak jest częścią współczynnika.'],
    ],
  }),
  numeric({
    id: 'l-for-2',
    skill: 'lin-formula',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Wyznacz miejsce zerowe funkcji $f(x) = -3x + 6$.`,
    answer: 2,
    verify: () => -6 / -3,
    hints: ['Jakie równanie trzeba rozwiązać?', r`$-3x + 6 = 0$.`, r`$-3x = -6$.`, r`Podziel przez $-3$.`],
    steps: [r`$-3x + 6 = 0 \Rightarrow -3x = -6$.`, r`$x = 2$.`],
    errors: [
      ['-2', r`Zły znak: wzięte $\frac{b}{a}$ zamiast $-\frac{b}{a}$.`, r`Miejsce zerowe to $x = -\frac{b}{a}$.`],
      ['6', r`Podany punkt przecięcia z osią $y$.`, r`Przecięcie z osią $y$ to $(0, b)$, a miejsce zerowe to $x$, dla którego $f(x) = 0$.`],
    ],
  }),
  choice({
    id: 'l-for-3',
    skill: 'lin-formula',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = (2 - \sqrt{5})x + 3$ jest`,
    choices: ['malejąca', 'rosnąca', 'stała', r`rosnąca tylko dla $x > 0$`],
    answer: 'A',
    hints: ['Co decyduje o monotoniczności funkcji liniowej?', r`Znak współczynnika $a = 2 - \sqrt{5}$.`, r`$\sqrt{5} \approx 2{,}24$ — większe czy mniejsze od $2$?`, r`$2 - 2{,}24 < 0$.`],
    steps: [r`$\sqrt{5} > 2$, więc $a = 2 - \sqrt{5} < 0$.`, 'Funkcja jest malejąca.'],
    errors: [
      ['B', r`Pomylony znak $a$ albo ocena po wyrazie wolnym $b = 3$.`, r`O monotoniczności decyduje znak $a$; tu $2 - \sqrt5 < 0$.`],
      ['C', 'Funkcja stała ma a = 0, a tu a ≠ 0.', r`$2 - \sqrt{5} \ne 0$.`],
      ['D', 'Funkcja liniowa jest monotoniczna na całej dziedzinie.', 'Monotoniczność funkcji liniowej nie zależy od x.'],
    ],
  }),
  choice({
    id: 'l-for-4',
    skill: 'lin-formula',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku jest wykres funkcji $f(x) = ax + b$. Wtedy`,
    figure: {
      kind: 'plot',
      alt: 'Malejąca prosta przecinająca oś y powyżej zera, w punkcie (0, 2), i oś x w punkcie (2, 0).',
      x: [-3, 4],
      y: [-2, 5],
      curves: [{ fn: (x) => -x + 2, label: 'f' }],
      points: [{ at: [0, 2] }, { at: [2, 0] }],
    },
    choices: [r`$a < 0$ i $b > 0$`, r`$a > 0$ i $b > 0$`, r`$a < 0$ i $b < 0$`, r`$a > 0$ i $b < 0$`],
    answer: 'A',
    hints: ['Co mówi kierunek prostej, a co punkt przecięcia z osią y?', 'Prosta opada — co to znaczy dla a?', r`Przecina oś $y$ powyżej zera — co to znaczy dla $b$?`, r`$a < 0$, $b > 0$.`],
    steps: [r`Prosta maleje, więc $a < 0$.`, r`Przecina oś $y$ w $(0, 2)$, więc $b = 2 > 0$.`],
    errors: [
      ['B', 'Pomylony kierunek: prosta opada, więc a < 0.', 'Malejąca prosta ma ujemne nachylenie.'],
      ['C', r`Źle odczytany znak $b$ — przecięcie z osią $y$ jest nad zerem.`, r`$b$ to wartość dla $x = 0$.`],
      ['D', 'Pomylone oba znaki.', 'Kierunek daje znak a, przecięcie z osią y — znak b.'],
    ],
  }),
  numeric({
    id: 'l-for-5',
    skill: 'lin-formula',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla jakiego $x$ funkcja $f(x) = \frac{1}{2}x - 4$ przyjmuje wartość $1$?`,
    answer: 10,
    verify: () => (1 + 4) * 2,
    hints: ['Jakie równanie opisuje ten warunek?', r`$\frac{1}{2}x - 4 = 1$.`, r`$\frac{1}{2}x = 5$.`, 'Pomnóż obie strony przez 2.'],
    steps: [r`$\frac{1}{2}x - 4 = 1 \Rightarrow \frac{1}{2}x = 5$.`, r`$x = 10$.`],
    errors: [['2.5', r`Podzielone przez $2$ zamiast pomnożone.`, r`Z $\frac{x}{2} = 5$ wynika $x = 10$.`]],
  }),
  numeric({
    id: 'l-for-6',
    skill: 'lin-formula',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wykres funkcji $f(x) = ax + 3$ przechodzi przez punkt $(2, -5)$. Wyznacz miejsce zerowe tej funkcji.`,
    answer: 0.75,
    variants: ['3/4'],
    verify: () => {
      const a = (-5 - 3) / 2;
      return -3 / a;
    },
    hints: [r`Jak z punktu $(2, -5)$ wyznaczyć $a$?`, r`$-5 = 2a + 3$.`, r`$a = -4$, więc $f(x) = -4x + 3$.`, r`$-4x + 3 = 0$.`],
    steps: [r`$-5 = 2a + 3 \Rightarrow a = -4$.`, r`$-4x + 3 = 0 \Rightarrow x = \frac{3}{4}$.`],
    errors: [[['-0.75', '-3/4'], r`Zły znak przy wyznaczaniu miejsca zerowego.`, r`$-4x = -3 \Rightarrow x = \frac{3}{4}$.`]],
  }),
  numeric({
    id: 'l-for-7',
    skill: 'lin-formula',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Świeca o długości $20$ cm skraca się o $1{,}5$ cm na godzinę. Po ilu godzinach jej długość spadnie do $8$ cm?`,
    answer: 8,
    verify: () => (20 - 8) / 1.5,
    hints: ['Jaki wzór opisuje długość świecy po t godzinach?', r`$d(t) = 20 - 1{,}5t$.`, r`$20 - 1{,}5t = 8$.`, r`$1{,}5t = 12$.`],
    steps: [r`$20 - 1{,}5t = 8 \Rightarrow 1{,}5t = 12$.`, r`$t = 8$ godzin.`],
    errors: [[['5.33', '16/3'], r`Tempo porównane z długością końcową zamiast z ubytkiem $20 - 8$.`, 'Ile ma ubyć: 20 − 8 = 12 cm.']],
  }),
  numeric({
    id: 'l-for-8',
    skill: 'lin-formula',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Funkcja liniowa $f$ spełnia warunki $f(1) = 5$ i $f(3) = 1$. Oblicz $f(10)$.`,
    answer: -13,
    verify: () => {
      const a = (1 - 5) / (3 - 1);
      const b = 5 - a;
      return a * 10 + b;
    },
    hints: [r`O ile zmienia się wartość, gdy $x$ rośnie z $1$ do $3$?`, r`Spada o $4$ na $2$ kroki — nachylenie $a = -2$.`, r`$f(1) = -2 + b = 5$, więc $b = 7$.`, r`$f(10) = -2 \cdot 10 + 7$.`],
    steps: [r`$a = \frac{1 - 5}{3 - 1} = -2$, $b = 7$.`, r`$f(10) = -20 + 7 = -13$.`],
    errors: [['13', r`Zły znak nachylenia.`, r`Wartość spada z $5$ do $1$ — nachylenie jest ujemne.`]],
  }),

  // -------------------------------------------------------------------------
  // lin-two-points
  // -------------------------------------------------------------------------
  numeric({
    id: 'l-two-1',
    skill: 'lin-two-points',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz współczynnik kierunkowy prostej przechodzącej przez punkty $(1, 2)$ i $(4, 8)$.`,
    answer: 2,
    verify: () => (8 - 2) / (4 - 1),
    hints: ['Jaki wzór daje nachylenie prostej przez dwa punkty?', r`$a = \frac{y_2 - y_1}{x_2 - x_1}$.`, r`$\frac{8 - 2}{4 - 1}$.`, r`$\frac{6}{3}$.`],
    steps: [r`$a = \frac{8 - 2}{4 - 1} = \frac{6}{3} = 2$.`, 'Nachylenie: 2.'],
    errors: [[['0.5', '1/2'], r`Odwrócony iloraz: $\frac{\Delta x}{\Delta y}$.`, r`Nachylenie to przyrost $y$ przez przyrost $x$.`]],
  }),
  numeric({
    id: 'l-two-2',
    skill: 'lin-two-points',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz współczynnik kierunkowy prostej przechodzącej przez punkty $(-2, 5)$ i $(2, -3)$.`,
    answer: -2,
    verify: () => (-3 - 5) / (2 - -2),
    hints: ['Jak bezpiecznie odjąć liczbę ujemną?', r`$a = \frac{-3 - 5}{2 - (-2)}$.`, r`$2 - (-2) = 4$.`, r`$\frac{-8}{4}$.`],
    steps: [r`$a = \frac{-3 - 5}{2 - (-2)} = \frac{-8}{4}$.`, r`$a = -2$.`],
    errors: [['2', 'Różna kolejność odejmowania w liczniku i mianowniku.', r`$\frac{y_2 - y_1}{x_2 - x_1}$ — ta sama kolejność na górze i na dole.`]],
  }),
  choice({
    id: 'l-two-3',
    skill: 'lin-two-points',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Prosta przechodząca przez punkty $A = (0, 3)$ i $B = (2, 7)$ ma równanie`,
    choices: [r`$y = 2x + 3$`, r`$y = 3x + 2$`, r`$y = \frac{1}{2}x + 3$`, r`$y = 2x + 7$`],
    answer: 'A',
    hints: ['Który z punktów od razu daje wyraz wolny?', r`$A = (0, 3)$ leży na osi $y$, więc $b = 3$.`, r`$a = \frac{7 - 3}{2 - 0}$.`, r`$a = 2$.`],
    steps: [r`$b = 3$ (punkt $A$), $a = \frac{4}{2} = 2$.`, r`$y = 2x + 3$.`],
    errors: [
      ['B', 'Zamienione miejscami a i b.', r`$b$ to wartość dla $x = 0$ — tu $3$.`],
      ['C', 'Odwrócony iloraz przy liczeniu nachylenia.', r`$a = \frac{\Delta y}{\Delta x} = \frac{4}{2}$.`],
      ['D', r`Za $b$ wzięta druga współrzędna punktu $B$.`, r`$b$ odczytujesz z punktu o $x = 0$.`],
    ],
  }),
  numeric({
    id: 'l-two-4',
    skill: 'lin-two-points',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Prosta przechodzi przez punkty $(-1, 4)$ i $(3, -4)$. W jakim punkcie przecina oś $y$? Podaj drugą współrzędną.`,
    answer: 2,
    verify: () => {
      const a = (-4 - 4) / (3 - -1);
      return 4 - a * -1;
    },
    hints: ['Najpierw nachylenie — jak je obliczysz?', r`$a = \frac{-4 - 4}{3 - (-1)} = -2$.`, r`Wstaw punkt $(-1, 4)$: $4 = -2 \cdot (-1) + b$.`, r`$4 = 2 + b$.`],
    steps: [r`$a = -2$; $4 = 2 + b$, więc $b = 2$.`, r`Przecięcie z osią $y$: $(0, 2)$.`],
    errors: [['6', r`Zły znak: $-2 \cdot (-1)$ policzone jako $-2$.`, 'Iloczyn dwóch liczb ujemnych jest dodatni.']],
  }),
  numeric({
    id: 'l-two-5',
    skill: 'lin-two-points',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Punkty $(0, 1)$, $(2, 5)$ i $(5, m)$ leżą na jednej prostej. Oblicz $m$.`,
    answer: 11,
    verify: () => 2 * 5 + 1,
    hints: ['Jaki jest wzór prostej przez dwa pierwsze punkty?', r`$b = 1$, $a = \frac{5 - 1}{2 - 0} = 2$.`, r`$y = 2x + 1$.`, r`Wstaw $x = 5$.`],
    steps: [r`Prosta: $y = 2x + 1$.`, r`$m = 2 \cdot 5 + 1 = 11$.`],
    errors: [['10', r`Pominięty wyraz wolny $b = 1$.`, r`Punkt musi spełniać pełny wzór $y = 2x + 1$.`]],
  }),
  choice({
    id: 'l-two-6',
    skill: 'lin-two-points',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Na rysunku jest prosta przechodząca przez punkty $A$ i $B$. Jej równanie to`,
    figure: {
      kind: 'plot',
      alt: 'Prosta przechodząca przez punkty A = (−1, −2) i B = (2, 4) oraz przez początek układu.',
      x: [-3, 4],
      y: [-4, 6],
      curves: [{ fn: (x) => 2 * x }],
      points: [
        { at: [-1, -2], label: 'A' },
        { at: [2, 4], label: 'B' },
      ],
    },
    choices: [r`$y = 2x$`, r`$y = \frac{1}{2}x$`, r`$y = -2x$`, r`$y = 2x + 4$`],
    answer: 'A',
    hints: ['Jakie współrzędne mają punkty A i B?', r`$A = (-1, -2)$, $B = (2, 4)$.`, r`$a = \frac{4 - (-2)}{2 - (-1)} = \frac{6}{3}$.`, 'Prosta przechodzi przez (0, 0) — ile wynosi b?'],
    steps: [r`$a = \frac{6}{3} = 2$.`, r`Przechodzi przez $(0, 0)$, więc $b = 0$: $y = 2x$.`],
    errors: [
      ['B', 'Odwrócony iloraz.', r`Nachylenie to $\frac{\Delta y}{\Delta x}$.`],
      ['C', 'Zły znak nachylenia — prosta rośnie.', 'Prosta idąca w górę od lewej do prawej ma dodatnie nachylenie.'],
      ['D', r`Za $b$ wzięta współrzędna punktu $B$.`, r`$b$ to wartość dla $x = 0$; prosta przechodzi przez początek układu.`],
    ],
  }),
  numeric({
    id: 'l-two-7',
    skill: 'lin-two-points',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Za kurs taksówką na $5$ km zapłacono $25$ zł, a za kurs na $12$ km — $46$ zł. Koszt jest funkcją liniową liczby kilometrów. Ile wynosi opłata początkowa (za $0$ km)?`,
    answer: 10,
    verify: () => {
      const a = (46 - 25) / (12 - 5);
      return 25 - 5 * a;
    },
    hints: ['Jakie dwa punkty (km, zł) masz?', r`$(5, 25)$ i $(12, 46)$.`, r`Stawka: $a = \frac{46 - 25}{12 - 5} = 3$ zł/km.`, r`$25 = 3 \cdot 5 + b$.`],
    steps: [r`$a = \frac{21}{7} = 3$.`, r`$25 = 15 + b \Rightarrow b = 10$ zł.`],
    errors: [['5', 'Założone, że koszt jest wprost proporcjonalny (25 : 5).', 'W modelu liniowym jest jeszcze opłata stała.']],
  }),
  numeric({
    id: 'l-two-8',
    skill: 'lin-two-points',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Punkty $A = (1, 1)$, $B = (4, 7)$ i $C = (k, 3k)$ leżą na jednej prostej. Oblicz $k$.`,
    answer: -1,
    verify: () => {
      const a = (7 - 1) / (4 - 1);
      const b = 1 - a;
      return b / (3 - a);
    },
    hints: [
      'Jaki jest wzór prostej AB?',
      r`Nachylenie: $a = \frac{7 - 1}{4 - 1} = 2$; wyraz wolny wyznacz z punktu $A$.`,
      r`Punkt $C$ spełnia równanie prostej: wstaw $x = k$ i $y = 3k$.`,
      r`Prosta $AB$: $y = 2x - 1$, więc $3k = 2k - 1$.`,
    ],
    steps: [r`Prosta $AB$: $y = 2x - 1$.`, r`$3k = 2k - 1 \Rightarrow k = -1$.`],
    errors: [['1', r`Zły znak przy przenoszeniu.`, r`$3k - 2k = -1$.`]],
  }),

  // -------------------------------------------------------------------------
  // lin-parallel
  // -------------------------------------------------------------------------
  numeric({
    id: 'l-par-1',
    skill: 'lin-parallel',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Podaj współczynnik kierunkowy prostej równoległej do prostej $y = -3x + 1$.`,
    answer: -3,
    verify: () => -3,
    hints: ['Co mają wspólnego proste równoległe?', 'Takie samo nachylenie.', r`Nachylenie danej prostej to $-3$.`, 'Równoległa ma to samo.'],
    steps: [r`Proste równoległe mają równe współczynniki kierunkowe.`, r`$a = -3$.`],
    errors: [[['1/3'], 'Policzone nachylenie prostopadłe.', 'Równoległe: to samo a.']],
  }),
  numeric({
    id: 'l-par-2',
    skill: 'lin-parallel',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj współczynnik kierunkowy prostej prostopadłej do prostej $y = 4x - 2$.`,
    answer: -0.25,
    variants: ['-1/4'],
    verify: () => -1 / 4,
    hints: ['Jaki warunek spełniają nachylenia prostych prostopadłych?', r`$a_1 \cdot a_2 = -1$.`, r`$4 \cdot a_2 = -1$.`, r`Odwróć i zmień znak.`],
    steps: [r`$4 \cdot a = -1$.`, r`$a = -\frac{1}{4}$.`],
    errors: [
      ['-4', r`Zmieniony tylko znak, bez odwrócenia.`, r`Prostopadłe nachylenie to $-\frac{1}{a}$.`],
      [['0.25', '1/4'], 'Odwrócone, ale bez zmiany znaku.', r`Iloczyn nachyleń prostopadłych to $-1$.`],
    ],
  }),
  choice({
    id: 'l-par-3',
    skill: 'lin-parallel',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Prostą równoległą do $y = \frac{1}{2}x - 3$ i przechodzącą przez punkt $(0, 5)$ jest prosta`,
    choices: [r`$y = \frac{1}{2}x + 5$`, r`$y = -2x + 5$`, r`$y = \frac{1}{2}x - 3$`, r`$y = 5x + \frac{1}{2}$`],
    answer: 'A',
    hints: ['Jakie nachylenie ma prosta równoległa?', r`To samo: $\frac{1}{2}$.`, r`Punkt $(0, 5)$ leży na osi $y$ — co to daje?`, r`$b = 5$.`],
    steps: [r`$a = \frac{1}{2}$ (równoległość), $b = 5$ (punkt na osi $y$).`, r`$y = \frac{1}{2}x + 5$.`],
    errors: [
      ['B', 'Użyte nachylenie prostopadłe.', 'Równoległe proste mają to samo nachylenie.'],
      ['C', r`To ta sama prosta — nie przechodzi przez $(0, 5)$.`, r`Trzeba jeszcze dopasować $b$ do punktu.`],
      ['D', 'Zamienione miejscami a i b.', r`$a$ stoi przy $x$, $b$ jest wyrazem wolnym.`],
    ],
  }),
  numeric({
    id: 'l-par-4',
    skill: 'lin-parallel',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Prosta przechodzi przez punkt $P = (2, 1)$ i jest prostopadła do prostej $y = 2x - 5$. Podaj jej wyraz wolny.`,
    answer: 2,
    verify: () => 1 - -0.5 * 2,
    hints: ['Jakie nachylenie ma prosta prostopadła?', r`$-\frac{1}{2}$.`, r`$1 = -\frac{1}{2} \cdot 2 + b$.`, r`$1 = -1 + b$.`],
    steps: [r`$a = -\frac{1}{2}$.`, r`$1 = -1 + b \Rightarrow b = 2$.`],
    errors: [['5', r`Użyte nachylenie $-2$ zamiast $-\frac{1}{2}$.`, r`Prostopadłe nachylenie to $-\frac{1}{a}$.`]],
  }),
  numeric({
    id: 'l-par-5',
    skill: 'lin-parallel',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla jakiego $m$ proste $y = (m - 1)x + 4$ oraz $y = 3x$ są równoległe?`,
    answer: 4,
    verify: () => 3 + 1,
    hints: ['Jaki warunek dają proste równoległe?', r`$m - 1 = 3$.`, r`Dodaj $1$ do obu stron.`, r`$m = 3 + 1$.`],
    steps: [r`$m - 1 = 3$.`, r`$m = 4$.`],
    errors: [['2', r`Jedynka odjęta zamiast dodana.`, 'Przeniesienie liczby na drugą stronę zmienia jej znak.']],
  }),
  numeric({
    id: 'l-par-6',
    skill: 'lin-parallel',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dla jakiego $m$ proste $y = (2m + 1)x - 3$ oraz $y = -\frac{1}{3}x + 2$ są prostopadłe?`,
    answer: 1,
    verify: () => (3 - 1) / 2,
    hints: ['Jaki warunek dają proste prostopadłe?', r`$(2m + 1) \cdot \left(-\frac{1}{3}\right) = -1$.`, r`$2m + 1 = 3$.`, r`$2m = 2$.`],
    steps: [r`$(2m + 1) \cdot \left(-\frac{1}{3}\right) = -1 \Rightarrow 2m + 1 = 3$.`, r`$m = 1$.`],
    errors: [[['-2/3'], 'Użyty warunek równoległości zamiast prostopadłości.', r`Prostopadłe: iloczyn nachyleń równy $-1$.`]],
  }),
  numeric({
    id: 'l-par-7',
    skill: 'lin-parallel',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Jeden bok prostokąta leży na prostej $y = 2x + 1$, a sąsiedni bok leży na prostej przechodzącej przez punkt $(4, 1)$. Wyznacz wyraz wolny tej drugiej prostej.`,
    answer: 3,
    verify: () => 1 - -0.5 * 4,
    hints: ['Jak są położone sąsiednie boki prostokąta?', 'Są prostopadłe.', r`Nachylenie: $-\frac{1}{2}$. Wstaw punkt $(4, 1)$.`, r`$1 = -2 + b$.`],
    steps: [r`Nachylenie prostopadłe: $-\frac{1}{2}$.`, r`$1 = -\frac{1}{2} \cdot 4 + b \Rightarrow b = 3$.`],
    errors: [['-7', 'Sąsiedni bok potraktowany jak równoległy.', 'Sąsiednie boki prostokąta są prostopadłe.']],
  }),
  numeric({
    id: 'l-par-8',
    skill: 'lin-parallel',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Trójkąt ma wierzchołki $A = (0, 0)$, $B = (4, 2)$ i $C = (1, 4)$. Wysokość opuszczona z $C$ leży na prostej prostopadłej do $AB$. Wyznacz wyraz wolny tej prostej.`,
    answer: 6,
    verify: () => {
      const aAB = (2 - 0) / (4 - 0);
      const aH = -1 / aAB;
      return 4 - aH * 1;
    },
    hints: ['Jakie nachylenie ma bok AB?', r`$\frac{2 - 0}{4 - 0} = \frac{1}{2}$.`, r`Wysokość jest prostopadła: nachylenie $-2$.`, r`$4 = -2 \cdot 1 + b$.`],
    steps: [r`$a_{AB} = \frac{1}{2}$, więc wysokość ma nachylenie $-2$.`, r`$4 = -2 + b \Rightarrow b = 6$.`],
    errors: [['3.5', 'Użyte nachylenie AB zamiast prostopadłego.', 'Wysokość jest prostopadła do podstawy.']],
  }),

  // -------------------------------------------------------------------------
  // lin-model
  // -------------------------------------------------------------------------
  numeric({
    id: 'l-mod-1',
    skill: 'lin-model',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Wypożyczenie roweru kosztuje $10$ zł opłaty stałej i $4$ zł za każdą godzinę. Ile kosztuje wypożyczenie na $5$ godzin?`,
    answer: 30,
    verify: () => 10 + 4 * 5,
    hints: ['Co jest tu opłatą stałą, a co stawką?', r`Stała: $10$ zł, stawka: $4$ zł/h.`, r`$10 + 4 \cdot 5$.`, 'Najpierw mnożenie.'],
    steps: [r`$K = 10 + 4 \cdot 5$.`, r`$= 30$ zł.`],
    errors: [
      ['70', 'Zamienione opłata stała i stawka.', 'Stawka mnoży się przez liczbę godzin, opłata stała — nie.'],
      ['20', 'Pominięta opłata stała.', 'Opłatę stałą doliczasz zawsze.'],
    ],
  }),
  numeric({
    id: 'l-mod-2',
    skill: 'lin-model',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Zbiornik ma $600$ l wody i traci $15$ l na minutę. Po ilu minutach zostanie w nim $150$ l?`,
    answer: 30,
    verify: () => (600 - 150) / 15,
    hints: ['Jaki wzór opisuje ilość wody po t minutach?', r`$V(t) = 600 - 15t$.`, r`$600 - 15t = 150$.`, r`$15t = 450$.`],
    steps: [r`$600 - 15t = 150$.`, r`$t = 30$ minut.`],
    errors: [['10', r`Podzielone $150$ przez $15$ — liczone ile zostało, a nie ile ubyło.`, r`Ubyć musi $600 - 150 = 450$ l.`]],
  }),
  choice({
    id: 'l-mod-3',
    skill: 'lin-model',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Za prąd płaci się $12$ zł miesięcznie i $0{,}8$ zł za każdą kWh. Wzór na miesięczny koszt przy zużyciu $x$ kWh to`,
    choices: [r`$K(x) = 0{,}8x + 12$`, r`$K(x) = 12x + 0{,}8$`, r`$K(x) = 12{,}8x$`, r`$K(x) = 0{,}8(x + 12)$`],
    answer: 'A',
    hints: ['Co zmienia się razem ze zużyciem, a co jest stałe?', r`$0{,}8$ zł za kWh mnożysz przez $x$.`, r`$12$ zł to opłata stała — wyraz wolny.`, r`$K(x) = 0{,}8x + 12$.`],
    steps: [r`Stawka $0{,}8$ przy $x$, opłata stała $12$.`, r`$K(x) = 0{,}8x + 12$.`],
    errors: [
      ['B', 'Zamienione opłata stała i stawka.', r`Przez $x$ mnożysz stawkę za kWh.`],
      ['C', 'Opłata stała pomnożona przez zużycie.', 'Opłata stała nie zależy od x.'],
      ['D', r`Stawka pomnożona także przez opłatę stałą.`, r`$0{,}8(x + 12) = 0{,}8x + 9{,}6$ — to nie jest $12$ zł opłaty.`],
    ],
  }),
  numeric({
    id: 'l-mod-4',
    skill: 'lin-model',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oferta A: $20$ zł abonamentu i $0{,}5$ zł za minutę. Oferta B: $0{,}9$ zł za minutę. Od ilu pełnych minut oferta A jest tańsza?`,
    answer: 51,
    verify: () => {
      for (let x = 0; x < 1000; x += 1) if (20 + 0.5 * x < 0.9 * x) return x;
      return NaN;
    },
    hints: ['Jak zapisać koszt x minut w obu ofertach?', r`$A(x) = 20 + 0{,}5x$, $B(x) = 0{,}9x$.`, r`$20 + 0{,}5x < 0{,}9x$.`, r`$x > 50$ — a pytanie jest o pełne minuty.`],
    steps: [r`$20 < 0{,}4x \Rightarrow x > 50$.`, r`Od $51$ minut.`],
    errors: [['50', r`Przy $50$ minutach oferty kosztują tyle samo.`, 'Tańsza znaczy: koszt ostro mniejszy.']],
  }),
  numeric({
    id: 'l-mod-5',
    skill: 'lin-model',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Pociąg jedzie ze stałą prędkością. O 10:00 był $50$ km od stacji początkowej, a o 12:00 — $210$ km. Ile kilometrów od stacji był o 13:30?`,
    answer: 330,
    verify: () => 210 + 1.5 * ((210 - 50) / 2),
    hints: ['Z jaką prędkością jedzie pociąg?', r`$\frac{210 - 50}{2} = 80$ km/h.`, r`Od 12:00 do 13:30 mija $1{,}5$ godziny.`, r`$210 + 1{,}5 \cdot 80$.`],
    steps: [r`$v = 80$ km/h.`, r`$210 + 1{,}5 \cdot 80 = 330$ km.`],
    errors: [['290', r`Przyjęta $1$ godzina zamiast $1{,}5$ godziny.`, r`Od 12:00 do 13:30 jest półtorej godziny.`]],
  }),
  numeric({
    id: 'l-mod-6',
    skill: 'lin-model',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Koszt wyprodukowania $x$ sztuk to $K(x) = 2000 + 15x$ zł, a przychód ze sprzedaży — $R(x) = 40x$ zł. Od ilu sztuk produkcja przynosi zysk?`,
    answer: 81,
    verify: () => {
      for (let x = 0; x < 10000; x += 1) if (40 * x > 2000 + 15 * x) return x;
      return NaN;
    },
    hints: ['Kiedy jest zysk?', r`Gdy przychód przewyższa koszt: $40x > 2000 + 15x$.`, r`$25x > 2000$.`, r`$x > 80$.`],
    steps: [r`$25x > 2000 \Rightarrow x > 80$.`, r`Od $81$ sztuk.`],
    errors: [
      ['80', r`Przy $80$ sztukach zysk wynosi zero.`, 'Zysk to przychód ostro większy od kosztu.'],
      ['50', r`Pominięty koszt $15$ zł za sztukę.`, 'Każda sztuka też kosztuje — odejmij to od ceny.'],
    ],
  }),
  numeric({
    id: 'l-mod-7',
    skill: 'lin-model',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Temperatura wody w czajniku rośnie liniowo. Po $1$ minucie wynosiła $34$°C, a po $3$ minutach $78$°C. Po ilu minutach od włączenia woda osiągnie $100$°C?`,
    answer: 4,
    verify: () => {
      const a = (78 - 34) / (3 - 1);
      const b = 34 - a;
      return (100 - b) / a;
    },
    hints: ['O ile stopni rośnie temperatura w ciągu minuty?', r`$\frac{78 - 34}{3 - 1} = 22$ stopnie na minutę.`, r`Temperatura na starcie: $34 - 22 = 12$°C.`, r`$12 + 22t = 100$.`],
    steps: [r`$T(t) = 12 + 22t$.`, r`$22t = 88 \Rightarrow t = 4$ minuty.`],
    errors: [[['4.55', '4.5'], r`Pominięta temperatura początkowa: policzone $100 : 22$.`, 'Woda nie startuje od zera stopni.']],
  }),
  numeric({
    id: 'l-mod-8',
    skill: 'lin-model',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Pierwszy samochód wyjechał o 8:00 z prędkością $60$ km/h. Drugi wyjechał z tego samego miejsca, w tę samą stronę, o 9:00 z prędkością $90$ km/h. O której godzinie drugi dogoni pierwszego? Podaj pełną godzinę.`,
    answer: 11,
    verify: () => 8 + (90 * 1) / (90 - 60),
    hints: ['Jak zapisać drogę każdego auta po t godzinach od 8:00?', r`Pierwszy: $60t$. Drugi jedzie $t - 1$ godzin: $90(t - 1)$.`, r`$60t = 90(t - 1)$.`, r`$30t = 90$.`],
    steps: [r`$60t = 90t - 90 \Rightarrow t = 3$.`, r`$8{:}00 + 3$ h $= 11{:}00$.`],
    errors: [['3', 'Podany czas jazdy zamiast godziny.', 'Pytanie jest o godzinę na zegarze.']],
  }),

  // -------------------------------------------------------------------------
  // lin-param (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'l-prm-1',
    skill: 'lin-param',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla jakiego $m$ funkcja $f(x) = (m - 2)x + 3$ jest stała?`,
    answer: 2,
    verify: () => 2,
    hints: ['Kiedy funkcja liniowa jest stała?', r`Gdy współczynnik przy $x$ jest zerem.`, r`$m - 2 = 0$.`, r`Dodaj $2$.`],
    steps: [r`$m - 2 = 0$.`, r`$m = 2$.`],
    errors: [['-2', r`Zły znak przy rozwiązaniu $m - 2 = 0$.`, r`$m - 2 = 0 \iff m = 2$.`]],
  }),
  numeric({
    id: 'l-prm-2',
    skill: 'lin-param',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj najmniejszą liczbę całkowitą $m$, dla której funkcja $f(x) = (m - 5)x + 1$ jest rosnąca.`,
    answer: 6,
    verify: () => {
      for (let m = -20; m < 20; m += 1) if (m - 5 > 0) return m;
      return NaN;
    },
    hints: ['Kiedy funkcja liniowa jest rosnąca?', r`Gdy $m - 5 > 0$.`, r`$m > 5$.`, 'Najmniejsza liczba całkowita większa od 5.'],
    steps: [r`$m - 5 > 0 \iff m > 5$.`, r`Najmniejsza całkowita: $6$.`],
    errors: [['5', r`Dla $m = 5$ funkcja jest stała, nie rosnąca.`, r`Rosnąca wymaga $a > 0$, a nie $a \ge 0$.`]],
  }),
  choice({
    id: 'l-prm-3',
    skill: 'lin-param',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = (3 - m)x + 1$ jest malejąca wtedy i tylko wtedy, gdy`,
    choices: [r`$m > 3$`, r`$m < 3$`, r`$m = 3$`, r`$m > -3$`],
    answer: 'A',
    hints: ['Jaki warunek musi spełniać współczynnik przy x?', r`$3 - m < 0$.`, r`$-m < -3$ — przy dzieleniu przez $-1$ znak się odwraca.`, r`$m > 3$.`],
    steps: [r`$3 - m < 0$.`, r`$m > 3$.`],
    errors: [
      ['B', 'To warunek na funkcję rosnącą.', r`Malejąca: $a < 0$.`],
      ['C', 'To warunek na funkcję stałą.', r`$a = 0$ daje funkcję stałą.`],
      ['D', 'Zły znak liczby 3.', r`$3 - m < 0 \iff m > 3$.`],
    ],
  }),
  numeric({
    id: 'l-prm-4',
    skill: 'lin-param',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych $m$ z przedziału $\langle -5, 5 \rangle$ sprawia, że miejsce zerowe funkcji $f(x) = 2x + m - 4$ jest dodatnie?`,
    answer: 9,
    verify: () => {
      let n = 0;
      for (let m = -5; m <= 5; m += 1) if ((4 - m) / 2 > 0) n += 1;
      return n;
    },
    hints: ['Jak wyrazić miejsce zerowe przez m?', r`$2x + m - 4 = 0 \Rightarrow x = \frac{4 - m}{2}$.`, r`$\frac{4 - m}{2} > 0 \iff m < 4$.`, r`Liczby całkowite od $-5$ do $3$.`],
    steps: [r`$m < 4$.`, r`W przedziale: $-5, -4, \ldots, 3$ — dziewięć liczb.`],
    errors: [['10', r`Włączone $m = 4$ — wtedy miejsce zerowe to $0$, nie liczba dodatnia.`, 'Zero nie jest liczbą dodatnią.']],
  }),
  numeric({
    id: 'l-prm-5',
    skill: 'lin-param',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla jakiego $m$ wykres funkcji $f(x) = mx + 2m - 6$ przechodzi przez początek układu współrzędnych?`,
    answer: 3,
    verify: () => 6 / 2,
    hints: ['Jaki warunek oznacza przejście przez (0, 0)?', r`$f(0) = 0$.`, r`$2m - 6 = 0$.`, r`$m = 3$.`],
    steps: [r`$f(0) = 2m - 6 = 0$.`, r`$m = 3$.`],
    errors: [['-3', r`Zły znak przy rozwiązaniu $2m - 6 = 0$.`, r`$2m = 6$.`]],
  }),
  numeric({
    id: 'l-prm-6',
    skill: 'lin-param',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dla jakiego $m$ wykres funkcji $f(x) = (m + 1)x + m$ przechodzi przez punkt $(2, 11)$?`,
    answer: 3,
    verify: () => (11 - 2) / 3,
    hints: ['Co oznacza, że punkt należy do wykresu?', r`$f(2) = 11$: $(m + 1) \cdot 2 + m = 11$.`, 'Uprość lewą stronę: zbierz razem wyrazy z m.', r`$3m + 2 = 11$, czyli $3m = 9$.`],
    steps: [r`$2m + 2 + m = 11 \Rightarrow 3m = 9$.`, r`$m = 3$.`],
    errors: [[['11/3'], r`Nawias $(m + 1) \cdot 2$ policzony jako $2m$.`, r`$(m + 1) \cdot 2 = 2m + 2$.`]],
  }),
  numeric({
    id: 'l-prm-7',
    skill: 'lin-param',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Funkcja $f(x) = (m - 3)x + 2$ ma miejsce zerowe w przedziale $(1, 4)$. Wyznacz jedyną liczbę całkowitą $m$ spełniającą ten warunek.`,
    answer: 2,
    verify: () => {
      for (let m = -20; m <= 20; m += 1) {
        if (m === 3) continue;
        const x0 = -2 / (m - 3);
        if (x0 > 1 && x0 < 4) return m;
      }
      return NaN;
    },
    hints: ['Jak wyrazić miejsce zerowe przez m?', r`$x_0 = \frac{-2}{m - 3}$.`, r`Żeby $x_0 > 0$, mianownik $m - 3$ musi być ujemny.`, r`Sprawdź po kolei $m = 2, 1, 0, \ldots$`],
    steps: [r`$x_0 = \frac{-2}{m - 3} \in (1, 4)$ wymaga $m - 3 \in (-2, -\frac{1}{2})$.`, r`$m \in (1;\ 2{,}5)$ — jedyna całkowita to $m = 2$ ($x_0 = 2$).`],
    errors: [['4', r`Pominięty znak: dla $m = 4$ miejsce zerowe to $-2$.`, 'Sprawdź wynik, wstawiając go do wzoru na miejsce zerowe.']],
  }),
  numeric({
    id: 'l-prm-8',
    skill: 'lin-param',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla ilu liczb całkowitych $m$ z przedziału $\langle -10, 10 \rangle$ funkcja $f(x) = (m^2 - 4)x + m$ jest rosnąca?`,
    answer: 16,
    verify: () => {
      let n = 0;
      for (let m = -10; m <= 10; m += 1) if (m * m - 4 > 0) n += 1;
      return n;
    },
    hints: ['Kiedy funkcja liniowa jest rosnąca?', r`$m^2 - 4 > 0$.`, r`$m^2 > 4 \iff |m| > 2$.`, r`Policz $m$ od $3$ do $10$ i od $-10$ do $-3$.`],
    steps: [r`$|m| > 2$.`, r`$8$ liczb dodatnich ($3..10$) i $8$ ujemnych ($-10..-3$) — razem $16$.`],
    errors: [['18', r`Włączone $m = \pm 2$ — wtedy funkcja jest stała.`, r`Rosnąca wymaga $a > 0$, nie $a \ge 0$.`]],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const LINEAR_CARDS: Flashcard[] = [
  card('c-lin-for-1', 'lin-formula', 'definicja', r`Co oznaczają $a$ i $b$ w $y = ax + b$?`, r`$a$ — nachylenie (zmiana $y$ na jeden krok $x$), $b$ — przecięcie z osią $y$ w $(0, b)$.`),
  card('c-lin-for-2', 'lin-formula', 'wzor', 'Miejsce zerowe funkcji liniowej?', r`$x = -\frac{b}{a}$ (dla $a \ne 0$).`),
  card('c-lin-for-3', 'lin-formula', 'pulapka', 'Co decyduje o monotoniczności funkcji liniowej?', r`Tylko znak $a$: dodatni — rosnąca, ujemny — malejąca, zero — stała.`),

  card('c-lin-two-1', 'lin-two-points', 'wzor', 'Nachylenie prostej przez dwa punkty?', r`$a = \frac{y_2 - y_1}{x_2 - x_1}$`),
  card('c-lin-two-2', 'lin-two-points', 'metoda', 'Jak wyznaczyć prostą przez dwa punkty?', r`Najpierw $a$ ze wzoru na nachylenie, potem $b$ z jednego punktu, na koniec sprawdzenie drugim punktem.`),

  card('c-lin-par-1', 'lin-parallel', 'wzor', 'Warunek równoległości prostych?', r`$a_1 = a_2$`),
  card('c-lin-par-2', 'lin-parallel', 'wzor', 'Warunek prostopadłości prostych?', r`$a_1 \cdot a_2 = -1$, czyli $a_2 = -\frac{1}{a_1}$.`),
  card('c-lin-par-3', 'lin-parallel', 'pulapka', r`Nachylenie prostopadłe do $a = 2$?`, r`$-\frac{1}{2}$, a nie $-2$.`),

  card('c-lin-mod-1', 'lin-model', 'metoda', 'Jak rozpoznać a i b w zadaniu z treścią?', r`$b$ — wartość na starcie (opłata stała), $a$ — zmiana na jednostkę (stawka).`),
  card('c-lin-mod-2', 'lin-model', 'pulapka', '„Od ilu” w porównaniu ofert?', 'Przy równości oferty kosztują tyle samo — odpowiedzią jest pierwsza liczba, dla której nierówność jest ostra.'),

  card('c-lin-prm-1', 'lin-param', 'metoda', 'Zadanie z parametrem w funkcji liniowej?', r`Własność → warunek na współczynniki → równanie lub nierówność z niewiadomą $m$. Osobno przypadek $a = 0$.`),
  card('c-lin-prm-2', 'lin-param', 'pulapka', 'Rosnąca: a > 0 czy a ≥ 0?', r`$a > 0$ — dla $a = 0$ funkcja jest stała.`),
];

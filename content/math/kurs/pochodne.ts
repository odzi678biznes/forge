import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';
import { DERIV_QUESTIONS, DERIV_TOPIC } from '../pochodne';

/**
 * Dział: Rachunek różniczkowy (rozszerzenie).
 *
 * Włącza do kursu trzy umiejętności z pierwszego wycinka treści (pochodna
 * wielomianu, styczna, ekstrema) - z ich identyfikatorami i zadaniami -
 * i dopisuje granicę funkcji, reguły różniczkowania, monotoniczność oraz
 * zadania optymalizacyjne, które na maturze rozszerzonej są warte najwięcej.
 */

const r = String.raw;

export const DERIV_COURSE_TOPIC: Topic = {
  ...DERIV_TOPIC,
  summary:
    'Granica i ciągłość funkcji, pochodna i reguły różniczkowania, styczna, monotoniczność, ekstrema i zadania optymalizacyjne.',
};

export const DERIV_COURSE_SKILLS: Skill[] = [
  {
    id: 'deriv-limit',
    topicId: 'math-derivatives',
    name: 'Granica i ciągłość funkcji',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — granica funkcji w punkcie i w nieskończoności, ciągłość',
    prerequisites: ['seq-limit', 'rat-shifted'],
    examValue: 0.5,
  },
  {
    id: 'deriv-basic',
    topicId: 'math-derivatives',
    name: 'Pochodna funkcji potęgowej i wielomianu',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — pochodna funkcji, w tym wielomianu',
    prerequisites: ['deriv-limit', 'poly-basics'],
    examValue: 0.7,
  },
  {
    id: 'deriv-rules',
    topicId: 'math-derivatives',
    name: 'Pochodna iloczynu, ilorazu i funkcji złożonej',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — pochodna iloczynu, ilorazu i funkcji złożonej',
    prerequisites: ['deriv-basic', 'rat-shifted'],
    examValue: 0.65,
  },
  {
    id: 'deriv-tangent',
    topicId: 'math-derivatives',
    name: 'Styczna do wykresu',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — interpretacja geometryczna pochodnej, równanie stycznej',
    prerequisites: ['deriv-basic', 'geo-line'],
    examValue: 0.7,
  },
  {
    id: 'deriv-monotonic',
    topicId: 'math-derivatives',
    name: 'Monotoniczność funkcji',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — badanie monotoniczności funkcji za pomocą pochodnej',
    prerequisites: ['deriv-rules', 'poly-inequalities'],
    examValue: 0.65,
  },
  {
    id: 'deriv-extrema',
    topicId: 'math-derivatives',
    name: 'Ekstrema i wartości skrajne',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — ekstrema lokalne, wartość największa i najmniejsza w przedziale',
    prerequisites: ['deriv-monotonic'],
    examValue: 0.75,
  },
  {
    id: 'deriv-optimization',
    topicId: 'math-derivatives',
    name: 'Zadania optymalizacyjne',
    level: 'PR',
    ckeRequirement: 'Rachunek różniczkowy — zadania optymalizacyjne',
    prerequisites: ['deriv-extrema', 'quad-optim'],
    examValue: 0.9,
  },
];

const cubic = (x: number) => x ** 3 - 3 * x;
const square = (x: number) => x * x;
const box = (x: number) => x * (12 - 2 * x) ** 2;

// ===========================================================================
// Lekcje
// ===========================================================================

export const DERIV_LESSONS: Lesson[] = [
  {
    skillId: 'deriv-limit',
    minutes: 12,
    intro:
      r`Granica funkcji w punkcie mówi, do czego zbliżają się wartości $f(x)$, gdy $x$ zbliża się do danej liczby — nawet jeśli w samym punkcie funkcja nie jest określona. To fundament pochodnej.`,
    blocks: [
      p(r`Gdy wstawienie daje liczbę — to jest granica. Gdy daje $\frac{0}{0}$, rozłóż licznik i mianownik na czynniki i skróć wspólny czynnik: $\frac{x^2 - 9}{x - 3} = x + 3 \to 6$ przy $x \to 3$.`),
      f(r`\lim_{x \to \pm\infty} \frac{a_n x^n + \ldots}{b_n x^n + \ldots} = \frac{a_n}{b_n}`, 'równe stopnie licznika i mianownika'),
      p(r`Funkcja jest ciągła w punkcie $x_0$, gdy granica w tym punkcie istnieje i jest równa $f(x_0)$. Przy funkcji „sklejanej” z dwóch wzorów sprawdzasz, czy oba kawałki spotykają się w tym samym punkcie.`),
      tip(r`Pierwiastki: pomnóż przez sprzężenie. $\frac{\sqrt x - 2}{x - 4} = \frac{1}{\sqrt x + 2} \to \frac14$ przy $x \to 4$.`),
      warn(r`$\frac00$ to nie zero ani jedynka — to sygnał, że trzeba przekształcić wyrażenie.`),
    ],
    examples: [
      example(
        r`Oblicz $\lim_{x \to 1} \frac{x^2 + x - 2}{x - 1}$.`,
        [r`Wstawienie daje $\frac00$. Rozkładam: $x^2 + x - 2 = (x - 1)(x + 2)$.`, r`Po skróceniu: $x + 2 \to 3$.`],
        r`$3$`,
      ),
      example(
        r`Dla jakiego $a$ funkcja równa $x^2 + a$ dla $x < 1$ i $2x + 3$ dla $x \ge 1$ jest ciągła?`,
        [r`Lewy kawałek w $x = 1$: $1 + a$; prawy: $5$.`, r`$1 + a = 5 \Rightarrow a = 4$.`],
        r`$a = 4$`,
      ),
    ],
    pitfalls: [r`$\frac00$ uznane za wynik.`, 'Skracanie wyrazów zamiast czynników.', 'Ciągłość sprawdzona tylko z jednej strony.'],
  },
  {
    skillId: 'deriv-basic',
    minutes: 14,
    intro:
      'Pochodna mówi, jak szybko zmienia się funkcja — to nachylenie wykresu w danym punkcie. W praktyce liczysz ją ze wzorów, bez granic: najważniejszy jest wzór na pochodną potęgi.',
    blocks: [
      f(r`(x^n)' = n x^{n - 1} \qquad (c)' = 0 \qquad (af + bg)' = af' + bg'`),
      f(r`\left(\frac1x\right)' = -\frac{1}{x^2} \qquad (\sqrt x)' = \frac{1}{2\sqrt x}`),
      p(r`Przykład: $(2x^3 - 3x^2 + 5)' = 6x^2 - 6x$. Stała znika, a współczynnik mnoży się przez wykładnik, który maleje o jeden.`),
      tip(r`Fizycznie: jeśli $s(t)$ to położenie, to $s'(t)$ jest prędkością chwilową.`),
      warn(r`$f'(3)$ to wartość pochodnej w punkcie 3 — najpierw liczysz wzór $f'(x)$, potem wstawiasz. Nie różniczkuj liczby $f(3)$.`),
    ],
    examples: [
      example(
        r`Oblicz $f'(2)$ dla $f(x) = x^3 - 4x$.`,
        [r`$f'(x) = 3x^2 - 4$.`, r`$f'(2) = 12 - 4 = 8$.`],
        r`$8$`,
      ),
      example(
        r`Oblicz $f'(4)$ dla $f(x) = \sqrt x$.`,
        [r`$f'(x) = \frac{1}{2\sqrt x}$.`, r`$f'(4) = \frac{1}{4}$.`],
        r`$\frac14$`,
      ),
    ],
    pitfalls: ['Wykładnik nieobniżony po zróżniczkowaniu.', 'Stała różniczkowana jako 1.', r`Pochodna $\frac1x$ bez znaku minus.`],
  },
  {
    skillId: 'deriv-rules',
    minutes: 15,
    intro:
      'Iloczynu i ilorazu funkcji nie różniczkuje się „po kawałku”. Są na to osobne wzory, a przy funkcji złożonej — reguła łańcuchowa: pochodna zewnętrznej razy pochodna wewnętrznej.',
    blocks: [
      f(r`(fg)' = f'g + fg' \qquad \left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}`),
      f(r`\big(f(g(x))\big)' = f'(g(x)) \cdot g'(x)`, 'funkcja złożona'),
      p(r`Przykład łańcucha: $\left(\sqrt{x^2 + 9}\right)' = \frac{1}{2\sqrt{x^2 + 9}} \cdot 2x = \frac{x}{\sqrt{x^2 + 9}}$.`),
      tip('Przy ilorazie licz licznik pochodnej ostrożnie: „pochodna góry razy dół minus góra razy pochodna dołu”. Kolejność ma znaczenie przez minus.'),
      warn(r`$(fg)' \ne f'g'$. Pochodna iloczynu to nie iloczyn pochodnych.`),
    ],
    examples: [
      example(
        r`Oblicz $f'(1)$ dla $f(x) = \frac{x}{x + 1}$.`,
        [r`$f'(x) = \frac{1 \cdot (x + 1) - x \cdot 1}{(x + 1)^2} = \frac{1}{(x + 1)^2}$.`, r`$f'(1) = \frac14$.`],
        r`$\frac14$`,
      ),
      example(
        r`Oblicz $f'(1)$ dla $f(x) = (x^2 + 1)^3$.`,
        [r`$f'(x) = 3(x^2 + 1)^2 \cdot 2x$.`, r`$f'(1) = 3 \cdot 4 \cdot 2 = 24$.`],
        r`$24$`,
      ),
    ],
    pitfalls: ['Pochodna iloczynu jako iloczyn pochodnych.', 'Odwrócona kolejność w liczniku wzoru na iloraz.', 'Brak pochodnej funkcji wewnętrznej w łańcuchu.'],
  },
  {
    skillId: 'deriv-tangent',
    minutes: 12,
    intro:
      r`Pochodna w punkcie to współczynnik kierunkowy stycznej. Styczna przechodzi przez punkt $(x_0, f(x_0))$ i ma nachylenie $f'(x_0)$ — to wszystko, czego potrzeba do jej równania.`,
    blocks: [
      f(r`y = f'(x_0)(x - x_0) + f(x_0)`, 'równanie stycznej w punkcie x₀'),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Parabola y = x² i styczna do niej w punkcie (1, 1): prosta y = 2x − 1, dotykająca paraboli w jednym punkcie.',
          x: [-2, 3],
          y: [-2, 6],
          curves: [{ fn: square, label: 'y = x²' }, { fn: (x: number) => 2 * x - 1, dashed: true, label: 'y = 2x − 1' }],
          points: [{ at: [1, 1] }],
        },
        caption: 'Styczna w (1, 1) ma nachylenie f′(1) = 2.',
      },
      p(r`Styczna równoległa do danej prostej ma ten sam współczynnik kierunkowy: szukasz $x_0$ z równania $f'(x_0) = a$. Styczna pozioma — z równania $f'(x_0) = 0$.`),
      warn(r`Do równania stycznej potrzebna jest też wartość $f(x_0)$, a nie tylko pochodna. Zapomniane $f(x_0)$ to styczna przez początek układu.`),
    ],
    examples: [
      example(
        r`Wyznacz styczną do $f(x) = x^3$ w punkcie $(1, 1)$.`,
        [r`$f'(x) = 3x^2$, $f'(1) = 3$.`, r`$y = 3(x - 1) + 1 = 3x - 2$.`],
        r`$y = 3x - 2$`,
      ),
      example(
        r`W którym punkcie styczna do $f(x) = x^2 - 4x + 1$ jest równoległa do prostej $y = 2x - 5$?`,
        [r`$f'(x) = 2x - 4 = 2 \Rightarrow x = 3$.`, r`$f(3) = -2$: punkt $(3, -2)$, styczna $y = 2x - 8$.`],
        r`$(3, -2)$`,
      ),
    ],
    pitfalls: [r`Brak $f(x_0)$ w równaniu stycznej.`, r`Wstawione $x_0$ do $f$ zamiast do $f'$ przy nachyleniu.`, 'Styczna równoległa pomylona z prostopadłą.'],
  },
  {
    skillId: 'deriv-monotonic',
    minutes: 12,
    intro:
      'Znak pochodnej mówi, w którą stronę idzie wykres: dodatnia — w górę, ujemna — w dół. Badanie monotoniczności to więc nierówność z pochodną, zwykle wielomianowa.',
    blocks: [
      f(r`f'(x) > 0 \text{ w przedziale} \Rightarrow f \text{ rośnie} \qquad f'(x) < 0 \Rightarrow f \text{ maleje}`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres funkcji x³ − 3x: rośnie do x = −1 (maksimum lokalne 2), maleje do x = 1 (minimum lokalne −2), potem znowu rośnie.',
          x: [-2.5, 2.5],
          y: [-4, 4],
          curves: [{ fn: cubic, from: -2.3, to: 2.3 }],
          points: [{ at: [-1, 2] }, { at: [1, -2] }],
        },
        caption: 'f(x) = x³ − 3x, f′(x) = 3(x − 1)(x + 1): rośnie, maleje, rośnie.',
      },
      p(r`Przepis: 1) dziedzina, 2) $f'(x)$ w postaci iloczynowej, 3) znak $f'$ z wężyka, 4) przedziały monotoniczności. Końce przedziałów możesz dołączyć — funkcja jest w nich ciągła.`),
      warn(r`Gdy dziedzina ma „dziurę” (np. $x \ne 0$), przedziałów po jej obu stronach nie łączysz sumą: $\frac1x$ maleje w $(-\infty, 0)$ i w $(0, +\infty)$ osobno.`),
    ],
    examples: [
      example(
        r`Wyznacz przedziały monotoniczności $f(x) = x^3 - 3x^2$.`,
        [r`$f'(x) = 3x^2 - 6x = 3x(x - 2)$.`, r`$f' > 0$ dla $x < 0$ i $x > 2$; $f' < 0$ na $(0, 2)$.`],
        r`rośnie w $(-\infty, 0\rangle$ i $\langle 2, +\infty)$, maleje w $\langle 0, 2\rangle$`,
      ),
      example(
        r`Dla jakich $m$ funkcja $f(x) = x^3 + 3x^2 + mx$ jest rosnąca w całej dziedzinie?`,
        [r`$f'(x) = 3x^2 + 6x + m \ge 0$ dla każdego $x$.`, r`$\Delta = 36 - 12m \le 0 \Rightarrow m \ge 3$.`],
        r`$m \ge 3$`,
      ),
    ],
    pitfalls: ['Suma przedziałów tam, gdzie funkcja nie jest monotoniczna na całej sumie.', 'Znak pochodnej odczytany z wartości funkcji.', 'Pominięta dziedzina.'],
  },
  {
    skillId: 'deriv-extrema',
    minutes: 12,
    intro:
      'Ekstremum lokalne jest tam, gdzie pochodna zmienia znak: z plusa na minus — maksimum, z minusa na plus — minimum. Wartość największą w przedziale domkniętym szukasz wśród ekstremów i końców przedziału.',
    blocks: [
      p(r`Warunek konieczny: $f'(x_0) = 0$. Warunek wystarczający: zmiana znaku $f'$ w $x_0$. Funkcja $x^3$ ma $f'(0) = 0$, ale nie ma ekstremum — pochodna nie zmienia znaku.`),
      f(r`\max_{\langle a, b\rangle} f = \max\{f(a),\ f(b),\ f(x_0) : f'(x_0) = 0\}`),
      tip('W przedziale domkniętym zawsze porównaj wartości na końcach — największa wartość bywa na brzegu, a nie w ekstremum.'),
      warn('Pytanie o „wartość” ekstremum to f(x₀), a o „argument” — x₀. Czytaj polecenie uważnie.'),
    ],
    examples: [
      example(
        r`Wyznacz największą wartość $f(x) = x^3 - 3x$ w przedziale $\langle -2, 3 \rangle$.`,
        [r`$f'(x) = 3x^2 - 3 = 0 \Rightarrow x = \pm 1$.`, r`$f(-2) = -2$, $f(-1) = 2$, $f(1) = -2$, $f(3) = 18$ — największa $18$.`],
        r`$18$`,
      ),
      example(
        r`Dla jakiego $a$ funkcja $f(x) = x^3 + ax^2 - 9x$ ma ekstremum w $x = 1$?`,
        [r`$f'(1) = 3 + 2a - 9 = 0 \Rightarrow a = 3$.`, r`$f'(x) = 3(x + 3)(x - 1)$ zmienia znak w $1$ — ekstremum jest.`],
        r`$a = 3$`,
      ),
    ],
    pitfalls: ['Pominięte końce przedziału przy wartości największej.', r`$f'(x_0) = 0$ bez sprawdzenia zmiany znaku.`, 'Argument podany zamiast wartości.'],
  },
  {
    skillId: 'deriv-optimization',
    minutes: 18,
    intro:
      'Zadanie optymalizacyjne to najwięcej punktów na maturze rozszerzonej. Schemat jest zawsze ten sam: jedna zmienna, funkcja celu, dziedzina z treści, pochodna, ekstremum, uzasadnienie i odpowiedź.',
    blocks: [
      p(r`1) Wybierz zmienną i zapisz pozostałe wielkości przez nią (z warunku w treści). 2) Zapisz funkcję, którą optymalizujesz. 3) Wyznacz dziedzinę z sensu zadania. 4) Pochodna, jej miejsca zerowe, znak. 5) Uzasadnij, że to maksimum/minimum w dziedzinie. 6) Odpowiedz na pytanie — nie zawsze o $x$.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres objętości pudełka V(x) = x(12 − 2x)² dla x od 0 do 6: rośnie do x = 2, gdzie osiąga maksimum 128, potem maleje do zera.',
          x: [0, 6.5],
          y: [0, 150],
          curves: [{ fn: box, from: 0, to: 6 }],
          points: [{ at: [2, 128] }],
          guides: [{ y: 128 }],
        },
        caption: 'Pudełko z kartki 12 × 12: największa objętość 128 dla x = 2.',
      },
      tip('Dziedzina z treści to często przedział otwarty (długość dodatnia, nie większa niż bok kartki). Jedyne ekstremum lokalne w takim przedziale, będące maksimum, jest wartością największą.'),
      warn('Na maturze za brak uzasadnienia, że znalezione ekstremum to maksimum (znak pochodnej), traci się punkt — nawet przy dobrym wyniku.'),
    ],
    examples: [
      example(
        r`Z kwadratowej kartki $12 \times 12$ wycinamy w rogach kwadraty o boku $x$ i składamy pudełko. Dla jakiego $x$ objętość jest największa?`,
        [
          r`$V(x) = x(12 - 2x)^2$, $x \in (0, 6)$.`,
          r`$V'(x) = (12 - 2x)(12 - 6x) = 0 \Rightarrow x = 2$ (bo $x = 6$ poza dziedziną).`,
          r`$V' > 0$ na $(0, 2)$, $V' < 0$ na $(2, 6)$ — maksimum. $V(2) = 128$.`,
        ],
        r`$x = 2$, $V = 128$`,
      ),
      example(
        r`Puszka (walec) ma objętość $16\pi$. Przy jakim promieniu pole powierzchni całkowitej jest najmniejsze?`,
        [r`$h = \frac{16}{r^2}$, $P(r) = 2\pi r^2 + \frac{32\pi}{r}$, $r > 0$.`, r`$P'(r) = 4\pi r - \frac{32\pi}{r^2} = 0 \Rightarrow r^3 = 8$, $r = 2$ — minimum (znak $P'$ z minusa na plus).`],
        r`$r = 2$`,
      ),
    ],
    pitfalls: ['Brak dziedziny funkcji celu.', 'Brak uzasadnienia, że ekstremum jest maksimum/minimum.', 'Odpowiedź o x, gdy pytanie jest o wartość (i odwrotnie).'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const NEW_QUESTIONS: Question[] = [
  // deriv-limit ---------------------------------------------------------------
  numeric({
    id: 'd-lim-1',
    skill: 'deriv-limit',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\lim\limits_{x \to 2} (3x + 1)$.`,
    answer: 7,
    verify: () => 3 * 2 + 1,
    hints: ['Czy wstawienie x = 2 daje sensowną liczbę?', 'Tak — funkcja liniowa jest ciągła.', r`$3 \cdot 2 + 1$.`, 'Policz.'],
    steps: [r`Wstawiam $x = 2$.`, r`$7$.`],
    errors: [['6', 'Pominięte +1.', 'Wstawiasz x do całego wyrażenia.']],
  }),
  numeric({
    id: 'd-lim-2',
    skill: 'deriv-limit',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $\lim\limits_{x \to 3} \frac{x^2 - 9}{x - 3}$.`,
    answer: 6,
    verify: () => (3.000001 ** 2 - 9) / (3.000001 - 3),
    tolerance: 1e-4,
    hints: ['Co daje bezpośrednie wstawienie x = 3?', r`$\frac00$ — trzeba przekształcić.`, r`$x^2 - 9 = (x - 3)(x + 3)$.`, r`Skróć i wstaw $x = 3$.`],
    steps: [r`$\frac{(x - 3)(x + 3)}{x - 3} = x + 3$.`, r`$\to 6$.`],
    errors: [['0', r`Wynik $\frac00$ uznany za zero.`, r`$\frac00$ oznacza, że trzeba skrócić wspólny czynnik.`]],
  }),
  choice({
    id: 'd-lim-3',
    skill: 'deriv-limit',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Granica $\lim\limits_{x \to +\infty} \frac{2x^2 + 1}{x^2 - 3}$ jest równa`,
    choices: [r`$2$`, r`$0$`, r`$+\infty$`, r`$-\frac13$`],
    answer: 'A',
    verify: () => (2 * 1e8 ** 2 + 1) / (1e8 ** 2 - 3),
    hints: ['Jakie są stopnie licznika i mianownika?', 'Równe — oba drugiego stopnia.', 'Granica to iloraz współczynników przy najwyższych potęgach.', r`$\frac21$.`],
    steps: [r`Dzielę przez $x^2$: $\frac{2 + \frac{1}{x^2}}{1 - \frac{3}{x^2}}$.`, r`$\to 2$.`],
    errors: [
      ['B', 'Uznano, że wszystko dąży do zera.', 'Przy równych stopniach granica to iloraz współczynników.'],
      ['C', 'Uznano, że licznik rośnie szybciej.', 'Stopnie są równe.'],
      ['D', r`Wstawione $x = 0$ zamiast $x \to +\infty$.`, 'Granica w nieskończoności — patrz na najwyższe potęgi.'],
    ],
  }),
  numeric({
    id: 'd-lim-4',
    skill: 'deriv-limit',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\lim\limits_{x \to 1} \frac{x^2 + x - 2}{x - 1}$.`,
    answer: 3,
    verify: () => (1.000001 ** 2 + 1.000001 - 2) / 0.000001,
    tolerance: 1e-4,
    hints: ['Co daje wstawienie x = 1?', r`$\frac00$.`, r`Rozłóż licznik: $x^2 + x - 2 = (x - 1)(\ldots)$.`, 'Skróć i wstaw.'],
    steps: [r`$(x - 1)(x + 2)$ — skracam.`, r`$x + 2 \to 3$.`],
    errors: [['0', r`Wynik $\frac00$ uznany za zero.`, 'Najpierw skróć wspólny czynnik.']],
  }),
  numeric({
    id: 'd-lim-5',
    skill: 'deriv-limit',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\lim\limits_{x \to +\infty} \frac{3x - 5}{6x + 1}$.`,
    answer: 0.5,
    variants: ['1/2'],
    verify: () => (3 * 1e9 - 5) / (6 * 1e9 + 1),
    tolerance: 1e-6,
    hints: ['Jakie są stopnie licznika i mianownika?', 'Oba pierwszego stopnia.', r`Iloraz współczynników przy $x$.`, r`$\frac36$.`],
    steps: [r`$\frac{3 - \frac5x}{6 + \frac1x} \to \frac36$.`, r`$= \frac12$.`],
    errors: [['-5', r`Wstawione $x = 0$ do licznika.`, 'W nieskończoności liczą się najwyższe potęgi.']],
  }),
  numeric({
    id: 'd-lim-6',
    skill: 'deriv-limit',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Funkcja $f$ jest równa $x^2 + a$ dla $x < 1$ oraz $2x + 3$ dla $x \ge 1$. Dla jakiego $a$ jest ciągła?`,
    answer: 4,
    verify: () => 2 * 1 + 3 - 1,
    hints: ['Gdzie może być problem z ciągłością?', r`W punkcie sklejenia $x = 1$.`, r`Lewy kawałek dąży do $1 + a$, prawy daje $f(1) = 5$.`, 'Przyrównaj.'],
    steps: [r`$1 + a = 5$.`, r`$a = 4$.`],
    errors: [['5', r`Podana wartość $f(1)$ zamiast $a$.`, r`Z równania $1 + a = 5$ wyznacz $a$.`]],
  }),
  numeric({
    id: 'd-lim-7',
    skill: 'deriv-limit',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Oblicz $\lim\limits_{x \to 4} \frac{\sqrt{x} - 2}{x - 4}$.`,
    answer: 0.25,
    variants: ['1/4'],
    verify: () => (Math.sqrt(4.000001) - 2) / 0.000001,
    tolerance: 1e-4,
    hints: ['Co daje bezpośrednie wstawienie?', r`$\frac00$.`, r`Zauważ: $x - 4 = (\sqrt x - 2)(\sqrt x + 2)$.`, r`Skróć i wstaw $x = 4$.`],
    steps: [r`$\frac{1}{\sqrt x + 2}$.`, r`$\to \frac14$.`],
    errors: [['0', r`Wynik $\frac00$ uznany za zero.`, r`Rozłóż $x - 4$ jako różnicę kwadratów pierwiastków.`]],
  }),
  numeric({
    id: 'd-lim-8',
    skill: 'deriv-limit',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla pewnego $a$ granica $\lim\limits_{x \to 1} \frac{x^2 + ax + 2}{x - 1}$ istnieje i jest skończona. Oblicz wartość tej granicy.`,
    answer: -1,
    verify: () => {
      const a = -3;
      const x = 1.000001;
      return (x * x + a * x + 2) / (x - 1);
    },
    tolerance: 1e-4,
    hints: ['Co musi się stać z licznikiem w x = 1, żeby granica była skończona?', 'Musi się zerować (inaczej iloraz ucieka do nieskończoności).', r`$1 + a + 2 = 0$.`, r`Z $a = -3$: rozłóż licznik i skróć.`],
    steps: [r`$x^2 - 3x + 2 = (x - 1)(x - 2)$.`, r`Granica: $1 - 2 = -1$.`],
    errors: [['-3', r`Podane $a$ zamiast granicy.`, 'Pytanie dotyczy wartości granicy.']],
  }),

  // deriv-basic (dopisane) ----------------------------------------------------
  numeric({
    id: 'd-bas-1',
    skill: 'deriv-basic',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dana jest funkcja $f(x) = 5x - 7$. Oblicz $f'(10)$.`,
    answer: 5,
    verify: () => 5,
    hints: ['Jak wygląda pochodna funkcji liniowej?', 'To jej współczynnik kierunkowy — stała.', r`$f'(x) = 5$.`, 'Wartość nie zależy od x.'],
    steps: [r`$f'(x) = 5$.`, r`$f'(10) = 5$.`],
    errors: [['43', r`Policzone $f(10)$ zamiast $f'(10)$.`, 'Pochodna funkcji liniowej to stała a.']],
  }),
  numeric({
    id: 'd-bas-2',
    skill: 'deriv-basic',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dana jest funkcja $f(x) = x^4 - 2x$. Oblicz $f'(1)$.`,
    answer: 2,
    verify: () => 4 * 1 ** 3 - 2,
    hints: ['Jak różniczkujesz potęgę?', r`$(x^n)' = nx^{n - 1}$.`, r`$f'(x) = 4x^3 - 2$.`, r`Wstaw $x = 1$.`],
    steps: [r`$f'(1) = 4 - 2$.`, r`$= 2$.`],
    errors: [['-1', r`Policzone $f(1)$ zamiast $f'(1)$.`, 'Najpierw wzór pochodnej, potem wstawienie.']],
  }),
  numeric({
    id: 'd-bas-3',
    skill: 'deriv-basic',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dana jest funkcja $f(x) = \frac{1}{x}$. Oblicz $f'(2)$.`,
    answer: -0.25,
    variants: ['-1/4'],
    verify: () => -1 / 2 ** 2,
    hints: ['Jak zapisać 1/x jako potęgę?', r`$x^{-1}$.`, r`$(x^{-1})' = -x^{-2} = -\frac{1}{x^2}$.`, r`Wstaw $x = 2$.`],
    steps: [r`$f'(x) = -\frac{1}{x^2}$.`, r`$f'(2) = -\frac14$.`],
    errors: [['0.25', 'Zgubiony minus.', r`$(x^{-1})' = -1 \cdot x^{-2}$.`]],
  }),
  numeric({
    id: 'd-bas-4',
    skill: 'deriv-basic',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ciało porusza się po prostej, a jego położenie w chwili $t$ opisuje wzór $s(t) = t^3 - 6t^2 + 9t$. W której chwili $t > 0$ prędkość po raz pierwszy jest równa zeru?`,
    answer: 1,
    verify: () => {
      // v(t) = 3t^2 - 12t + 9 = 3(t - 1)(t - 3)
      return Math.min(1, 3);
    },
    hints: ['Czym jest prędkość w języku pochodnych?', r`$v(t) = s'(t)$.`, r`$v(t) = 3t^2 - 12t + 9$.`, r`Rozwiąż $v(t) = 0$ i wybierz pierwszą chwilę.`],
    steps: [r`$3(t - 1)(t - 3) = 0$.`, r`Pierwsza chwila: $t = 1$.`],
    errors: [['3', 'Wybrana druga chwila.', 'Pytanie dotyczy pierwszego momentu.']],
  }),

  // deriv-rules ---------------------------------------------------------------
  numeric({
    id: 'd-rul-1',
    skill: 'deriv-rules',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dana jest funkcja $f(x) = x(x + 1)$. Oblicz $f'(1)$.`,
    answer: 3,
    verify: () => 2 * 1 + 1,
    hints: ['Jak najprościej zróżniczkować ten iloczyn?', r`Wymnóż: $f(x) = x^2 + x$.`, r`$f'(x) = 2x + 1$.`, r`Wstaw $x = 1$.`],
    steps: [r`$f'(x) = 2x + 1$.`, r`$f'(1) = 3$.`],
    errors: [['1', 'Pochodna iloczynu jako iloczyn pochodnych (1 · 1).', r`$(fg)' = f'g + fg'$.`]],
  }),
  numeric({
    id: 'd-rul-2',
    skill: 'deriv-rules',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dana jest funkcja $f(x) = (2x + 1)(x - 3)$. Oblicz $f'(2)$.`,
    answer: 3,
    verify: () => 2 * (2 - 3) + (2 * 2 + 1) * 1,
    hints: ['Który wzór stosujesz do iloczynu?', r`$(fg)' = f'g + fg'$.`, r`$f'(x) = 2(x - 3) + (2x + 1)$.`, r`Wstaw $x = 2$.`],
    steps: [r`$f'(2) = 2 \cdot (-1) + 5$.`, r`$= 3$.`],
    errors: [['2', 'Pomnożone pochodne czynników: 2 · 1.', 'Pochodna iloczynu to nie iloczyn pochodnych.']],
  }),
  choice({
    id: 'd-rul-3',
    skill: 'deriv-rules',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Pochodna funkcji $f(x) = \frac{1}{x + 1}$ to`,
    choices: [r`$-\frac{1}{(x + 1)^2}$`, r`$\frac{1}{(x + 1)^2}$`, r`$-\frac{1}{x + 1}$`, r`$\frac{1}{x}$`],
    answer: 'A',
    hints: ['Jaki wzór stosujesz do ilorazu?', r`$\left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}$.`, r`$f = 1$, $f' = 0$, $g = x + 1$, $g' = 1$.`, r`$\frac{0 - 1}{(x + 1)^2}$.`],
    steps: [r`$\frac{0 \cdot (x + 1) - 1 \cdot 1}{(x + 1)^2}$.`, r`$= -\frac{1}{(x + 1)^2}$.`],
    errors: [
      ['B', 'Zgubiony minus.', 'Licznik: f′g − fg′ = 0 − 1.'],
      ['C', 'Mianownik nie podniesiony do kwadratu.', r`We wzorze na iloraz jest $g^2$.`],
      ['D', 'Zróżniczkowany sam mianownik.', 'Iloraz różniczkuje się ze wzoru.'],
    ],
  }),
  numeric({
    id: 'd-rul-4',
    skill: 'deriv-rules',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dana jest funkcja $f(x) = \frac{x}{x + 1}$. Oblicz $f'(1)$.`,
    answer: 0.25,
    variants: ['1/4'],
    verify: () => ((1 + 1) - 1) / (1 + 1) ** 2,
    hints: ['Który wzór stosujesz?', 'Wzór na pochodną ilorazu.', r`$f'(x) = \frac{1 \cdot (x + 1) - x \cdot 1}{(x + 1)^2}$.`, 'Uprość licznik i wstaw x = 1.'],
    steps: [r`$f'(x) = \frac{1}{(x + 1)^2}$.`, r`$f'(1) = \frac14$.`],
    errors: [['0.5', 'Mianownik nie podniesiony do kwadratu.', r`We wzorze jest $g^2$.`]],
  }),
  numeric({
    id: 'd-rul-5',
    skill: 'deriv-rules',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dana jest funkcja $f(x) = (x^2 + 1)^3$. Oblicz $f'(1)$.`,
    answer: 24,
    verify: () => 3 * (1 + 1) ** 2 * 2,
    hints: ['Jaka to funkcja — złożona czy iloczyn?', 'Złożona: potęga z wielomianu.', r`$f'(x) = 3(x^2 + 1)^2 \cdot (x^2 + 1)'$.`, r`$(x^2 + 1)' = 2x$.`],
    steps: [r`$f'(1) = 3 \cdot 4 \cdot 2$.`, r`$= 24$.`],
    errors: [['12', 'Brak pochodnej funkcji wewnętrznej.', 'Reguła łańcuchowa: razy pochodna środka.']],
  }),
  numeric({
    id: 'd-rul-6',
    skill: 'deriv-rules',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dana jest funkcja $f(x) = \sqrt{x^2 + 9}$. Oblicz $f'(4)$.`,
    answer: 0.8,
    variants: ['4/5'],
    verify: () => 4 / Math.sqrt(16 + 9),
    tolerance: 1e-9,
    hints: ['Jaka jest funkcja zewnętrzna, a jaka wewnętrzna?', r`Zewnętrzna $\sqrt{u}$, wewnętrzna $u = x^2 + 9$.`, r`$f'(x) = \frac{1}{2\sqrt{x^2 + 9}} \cdot 2x$.`, r`Wstaw $x = 4$: $\sqrt{25}$.`],
    steps: [r`$f'(x) = \frac{x}{\sqrt{x^2 + 9}}$.`, r`$f'(4) = \frac45$.`],
    errors: [['0.1', r`Brak pochodnej wnętrza $2x$.`, 'Reguła łańcuchowa: pomnóż przez pochodną wnętrza.']],
  }),
  numeric({
    id: 'd-rul-7',
    skill: 'deriv-rules',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Dana jest funkcja $f(x) = \frac{x^2 - 3}{x - 2}$. Podaj sumę miejsc zerowych jej pochodnej.`,
    answer: 4,
    verify: () => {
      // licznik pochodnej: 2x(x - 2) - (x^2 - 3) = x^2 - 4x + 3
      return 1 + 3;
    },
    hints: ['Jak wygląda licznik pochodnej ilorazu?', r`$2x(x - 2) - (x^2 - 3)$.`, 'Uprość licznik do trójmianu kwadratowego i znajdź jego pierwiastki.', 'Pierwiastki licznika (różne od 2) to miejsca zerowe pochodnej — możesz użyć wzoru Viète’a na sumę.'],
    steps: [r`$x^2 - 4x + 3 = (x - 1)(x - 3)$.`, r`Suma: $1 + 3 = 4$.`],
    errors: [['3', 'Podany tylko większy pierwiastek.', 'Pytanie dotyczy sumy miejsc zerowych.']],
  }),
  numeric({
    id: 'd-rul-8',
    skill: 'deriv-rules',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dana jest funkcja $f(x) = x\sqrt{4 - x}$ dla $x < 4$. Podaj miejsce zerowe jej pochodnej (z dokładnością do $0{,}001$).`,
    answer: '8/3',
    variants: ['2.667'],
    tolerance: 0.001,
    verify: () => 8 / 3,
    hints: ['Jakie wzory trzeba połączyć?', r`Iloczyn $x \cdot \sqrt{4 - x}$ i łańcuch dla pierwiastka.`, r`$f'(x) = \sqrt{4 - x} - \frac{x}{2\sqrt{4 - x}}$.`, r`Wspólny mianownik: $\frac{2(4 - x) - x}{2\sqrt{4 - x}}$.`],
    steps: [r`$8 - 3x = 0$.`, r`$x = \frac83$.`],
    errors: [['4', 'Podany koniec dziedziny.', 'W x = 4 pochodna nie istnieje — szukasz zera licznika.']],
  }),

  // deriv-tangent (dopisane) --------------------------------------------------
  numeric({
    id: 'd-tan-1',
    skill: 'deriv-tangent',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Podaj współczynnik kierunkowy stycznej do wykresu $f(x) = 3x^2$ w punkcie o odciętej $x = 1$.`,
    answer: 6,
    verify: () => 6 * 1,
    hints: ['Czym jest współczynnik kierunkowy stycznej?', r`Wartością pochodnej: $f'(x_0)$.`, r`Zróżniczkuj $3x^2$ wzorem na pochodną potęgi.`, r`Wstaw $x = 1$.`],
    steps: [r`$f'(1) = 6$.`, r`Współczynnik: $6$.`],
    errors: [['3', r`Policzone $f(1)$ zamiast $f'(1)$.`, 'Nachylenie stycznej to pochodna.']],
  }),
  numeric({
    id: 'd-tan-2',
    skill: 'deriv-tangent',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Pod jakim kątem (w stopniach) styczna do wykresu $f(x) = \frac{x^2}{2}$ w punkcie o odciętej $x = 1$ jest nachylona do osi $x$?`,
    answer: 45,
    verify: () => (Math.atan(1) * 180) / Math.PI,
    tolerance: 1e-9,
    hints: ['Jaki jest współczynnik kierunkowy stycznej?', r`$f'(x) = x$, więc $f'(1) = 1$.`, r`$\mathrm{tg}\,\alpha = 1$.`, 'Który kąt ma tangens równy 1?'],
    steps: [r`$\mathrm{tg}\,\alpha = 1$.`, r`$\alpha = 45^\circ$.`],
    errors: [['1', 'Podany współczynnik kierunkowy zamiast kąta.', r`Kąt wyznaczasz z $\mathrm{tg}\,\alpha = f'(x_0)$.`]],
  }),
  numeric({
    id: 'd-tan-3',
    skill: 'deriv-tangent',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Styczna do wykresu $f(x) = x^3$ w punkcie $(1, 1)$ ma równanie $y = ax + b$. Wyznacz $b$.`,
    answer: -2,
    verify: () => 1 - 3 * 1,
    hints: ['Jakie jest nachylenie stycznej?', r`$f'(1) = 3$.`, r`$y = 3(x - 1) + 1$.`, 'Uprość do postaci kierunkowej.'],
    steps: [r`$y = 3x - 2$.`, r`$b = -2$.`],
    errors: [['1', r`Pominięte przesunięcie: $y = 3x + 1$... albo wstawione samo $f(1)$.`, r`$b = f(x_0) - f'(x_0) \cdot x_0$.`]],
  }),
  numeric({
    id: 'd-tan-4',
    skill: 'deriv-tangent',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Styczna do wykresu $f(x) = x^2 - 4x + 1$ jest równoległa do prostej $y = 2x - 5$ i ma równanie $y = 2x + b$. Wyznacz $b$.`,
    answer: -8,
    verify: () => {
      const x0 = (2 + 4) / 2;
      return x0 * x0 - 4 * x0 + 1 - 2 * x0;
    },
    hints: ['Jaki warunek daje równoległość?', r`$f'(x_0) = 2$.`, r`$2x_0 - 4 = 2 \Rightarrow x_0 = 3$, a $f(3) = -2$.`, r`Wstaw punkt $(3, -2)$ do $y = 2x + b$.`],
    steps: [r`$-2 = 6 + b$.`, r`$b = -8$.`],
    errors: [['-2', r`Podane $f(3)$ zamiast $b$.`, 'Punkt styczności wstaw do równania prostej.']],
  }),

  // deriv-monotonic -----------------------------------------------------------
  numeric({
    id: 'd-mon-1',
    skill: 'deriv-monotonic',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Funkcja $f(x) = x^2 - 6x$ jest rosnąca w przedziale $\langle c, +\infty)$. Podaj $c$.`,
    answer: 3,
    verify: () => 6 / 2,
    hints: ['Kiedy pochodna jest nieujemna?', r`$f'(x) = 2x - 6$.`, r`$2x - 6 \ge 0$.`, 'Rozwiąż.'],
    steps: [r`$x \ge 3$.`, r`$c = 3$.`],
    errors: [['-3', 'Zły znak.', r`$2x - 6 \ge 0 \iff x \ge 3$.`]],
  }),
  choice({
    id: 'd-mon-2',
    skill: 'deriv-monotonic',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = x^3 + x$`,
    choices: ['jest rosnąca w całej dziedzinie', 'jest malejąca w całej dziedzinie', 'ma dwa ekstrema lokalne', 'jest rosnąca tylko dla x > 0'],
    answer: 'A',
    hints: ['Jaka jest pochodna?', r`$f'(x) = 3x^2 + 1$.`, 'Jaki znak ma to wyrażenie?', r`$3x^2 + 1 \ge 1 > 0$ dla każdego $x$.`],
    steps: [r`$f'(x) > 0$ zawsze.`, 'Funkcja rośnie w całej dziedzinie.'],
    errors: [
      ['B', 'Odwrócony znak pochodnej.', r`$3x^2 + 1 > 0$.`],
      ['C', r`Pochodna nie ma miejsc zerowych.`, r`$3x^2 + 1 = 0$ nie ma rozwiązań.`],
      ['D', r`Dla $x < 0$ pochodna też jest dodatnia.`, r`$3x^2 \ge 0$ dla każdego $x$.`],
    ],
  }),
  numeric({
    id: 'd-mon-3',
    skill: 'deriv-monotonic',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Funkcja $f(x) = -x^2 + 4x + 1$ jest rosnąca w przedziale $(-\infty, c\rangle$. Podaj $c$.`,
    answer: 2,
    verify: () => 4 / 2,
    hints: ['Jaka jest pochodna?', r`$f'(x) = -2x + 4$.`, r`$-2x + 4 \ge 0$.`, 'Uważaj przy dzieleniu przez liczbę ujemną.'],
    steps: [r`$x \le 2$.`, r`$c = 2$.`],
    errors: [['-2', 'Zły znak przy dzieleniu.', r`$-2x \ge -4 \iff x \le 2$.`]],
  }),
  numeric({
    id: 'd-mon-4',
    skill: 'deriv-monotonic',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Funkcja $f(x) = x^3 - 3x^2$ jest malejąca w przedziale $\langle a, b \rangle$. Podaj $b$.`,
    answer: 2,
    verify: () => 6 / 3,
    hints: ['Jaka jest pochodna w postaci iloczynowej?', r`$f'(x) = 3x^2 - 6x = 3x(x - 2)$.`, r`Kiedy $3x(x - 2) \le 0$?`, 'Między pierwiastkami.'],
    steps: [r`$f' \le 0$ na $\langle 0, 2 \rangle$.`, r`$b = 2$.`],
    errors: [['3', r`Wzięte miejsce zerowe funkcji $f$ zamiast pochodnej.`, 'Monotoniczność zależy od znaku pochodnej.']],
  }),
  numeric({
    id: 'd-mon-5',
    skill: 'deriv-monotonic',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na ile maksymalnych przedziałów monotoniczności dzieli się dziedzinę funkcji $f(x) = x^3 - 12x$?`,
    answer: 3,
    verify: () => 3,
    hints: ['Gdzie pochodna zmienia znak?', r`$f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$.`, r`Znaki: $+$, $-$, $+$.`, 'Policz przedziały.'],
    steps: [r`Rośnie w $(-\infty, -2\rangle$, maleje w $\langle -2, 2\rangle$, rośnie w $\langle 2, +\infty)$.`, 'Trzy przedziały.'],
    errors: [['2', 'Policzone miejsca zerowe pochodnej zamiast przedziałów.', 'Dwa punkty dzielą prostą na trzy przedziały.']],
  }),
  numeric({
    id: 'd-mon-6',
    skill: 'deriv-monotonic',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Podaj najmniejszą wartość $m$, dla której funkcja $f(x) = x^3 + 3x^2 + mx$ jest rosnąca w całej dziedzinie.`,
    answer: 3,
    verify: () => 36 / 12,
    hints: ['Jaki warunek na pochodną daje monotoniczność w całej dziedzinie?', r`$f'(x) = 3x^2 + 6x + m \ge 0$ dla każdego $x$.`, r`Trójmian nieujemny wszędzie: $\Delta \le 0$.`, r`$36 - 12m \le 0$.`],
    steps: [r`$m \ge 3$.`, r`Najmniejsze $m = 3$.`],
    errors: [['12', r`Pomylony wyróżnik: $b^2 - 4ac$ ze złym $a$.`, r`$\Delta = 6^2 - 4 \cdot 3 \cdot m$.`]],
  }),
  numeric({
    id: 'd-mon-7',
    skill: 'deriv-monotonic',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Funkcja $f(x) = x + \frac{4}{x}$ rozważana dla $x > 0$ jest malejąca w przedziale $(0, c\rangle$. Podaj $c$.`,
    answer: 2,
    verify: () => Math.sqrt(4),
    hints: ['Jaka jest pochodna?', r`$f'(x) = 1 - \frac{4}{x^2}$.`, r`$1 - \frac{4}{x^2} \le 0 \iff x^2 \le 4$.`, r`Uwzględnij $x > 0$.`],
    steps: [r`$0 < x \le 2$.`, r`$c = 2$.`],
    errors: [['4', r`Podane $x^2$ zamiast $x$.`, r`Z $x^2 \le 4$ i $x > 0$: $x \le 2$.`]],
  }),
  numeric({
    id: 'd-mon-8',
    skill: 'deriv-monotonic',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile rozwiązań rzeczywistych ma równanie $x^3 - 3x + 1 = 0$?`,
    answer: 3,
    verify: () => {
      let c = 0;
      const f = (x: number) => x ** 3 - 3 * x + 1;
      for (let x = -5; x < 5; x += 0.001) if (f(x) * f(x + 0.001) < 0) c += 1;
      return c;
    },
    hints: ['Jak zbadać, ile razy wykres przecina oś x?', r`Zbadaj monotoniczność: $f'(x) = 3x^2 - 3$.`, r`Ekstrema w $x = \pm 1$: $f(-1) = 3$, $f(1) = -1$.`, 'Wykres rośnie do wartości dodatniej, spada poniżej zera i znowu rośnie.'],
    steps: [r`Maksimum dodatnie, minimum ujemne — wykres przecina oś trzy razy.`, 'Trzy rozwiązania.'],
    errors: [['1', 'Nie zbadano ekstremów.', 'Maksimum powyżej osi i minimum poniżej osi oznaczają trzy przecięcia.']],
  }),

  // deriv-extrema (dopisane) --------------------------------------------------
  numeric({
    id: 'd-ext-1',
    skill: 'deriv-extrema',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Podaj wartość minimalną funkcji $f(x) = x^2 - 2x$.`,
    answer: -1,
    verify: () => 1 - 2,
    hints: ['Gdzie zeruje się pochodna?', r`$f'(x) = 2x - 2 = 0 \iff x = 1$.`, 'Pytanie jest o wartość — wstaw x do f.', r`$f(1) = 1 - 2$.`],
    steps: [r`$x = 1$.`, r`$f(1) = -1$.`],
    errors: [['1', 'Podany argument zamiast wartości.', 'Wartość minimalna to f(x₀), nie x₀.']],
  }),
  numeric({
    id: 'd-ext-2',
    skill: 'deriv-extrema',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj wartość maksimum lokalnego funkcji $f(x) = x^3 - 3x$.`,
    answer: 2,
    verify: () => (-1) ** 3 - 3 * -1,
    hints: ['Gdzie zeruje się pochodna?', r`$f'(x) = 3x^2 - 3 = 0 \iff x = \pm 1$.`, r`Gdzie pochodna zmienia znak z plusa na minus?`, r`W $x = -1$ — wstaw do $f$.`],
    steps: [r`Maksimum w $x = -1$.`, r`$f(-1) = -1 + 3 = 2$.`],
    errors: [['-2', 'Wzięte minimum lokalne.', 'Maksimum: zmiana znaku pochodnej z + na −.']],
  }),
  numeric({
    id: 'd-ext-3',
    skill: 'deriv-extrema',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wyznacz największą wartość funkcji $f(x) = x^3 - 3x$ w przedziale $\langle -2, 3 \rangle$.`,
    answer: 18,
    verify: () => Math.max(...[-2, -1, 1, 3].map((x) => x ** 3 - 3 * x)),
    hints: ['Jakie punkty trzeba porównać?', 'Ekstrema wewnątrz przedziału i jego końce.', r`$f(-2)$, $f(-1)$, $f(1)$, $f(3)$.`, 'Wybierz największą wartość.'],
    steps: [r`$f(-2) = -2$, $f(-1) = 2$, $f(1) = -2$, $f(3) = 18$.`, r`Największa: $18$.`],
    errors: [['2', 'Wzięte maksimum lokalne bez sprawdzenia końców.', 'Wartość największa może być na końcu przedziału.']],
  }),
  numeric({
    id: 'd-ext-4',
    skill: 'deriv-extrema',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla jakiej wartości $a$ funkcja $f(x) = x^3 + ax^2 - 9x$ ma ekstremum w punkcie $x = 1$?`,
    answer: 3,
    verify: () => (9 - 3) / 2,
    hints: ['Jaki warunek konieczny musi zachodzić w ekstremum?', r`$f'(1) = 0$.`, r`$f'(x) = 3x^2 + 2ax - 9$, więc $3 + 2a - 9 = 0$.`, 'Wyznacz a i sprawdź zmianę znaku pochodnej.'],
    steps: [r`$a = 3$: $f'(x) = 3(x + 3)(x - 1)$.`, r`Znak zmienia się w $x = 1$ — ekstremum jest.`],
    errors: [['-3', 'Zły znak przy rozwiązywaniu równania.', r`$2a = 6$.`]],
  }),

  // deriv-optimization --------------------------------------------------------
  numeric({
    id: 'd-opt-1',
    skill: 'deriv-optimization',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Prostokąt ma obwód $40$. Jakie największe pole może mieć?`,
    answer: 100,
    verify: () => {
      let best = 0;
      for (let x = 0; x <= 20; x += 0.01) best = Math.max(best, x * (20 - x));
      return Math.round(best * 1000) / 1000;
    },
    tolerance: 1e-6,
    hints: ['Jak zapisać drugi bok przez pierwszy?', r`$a + b = 20$, więc $b = 20 - a$.`, r`$P(a) = a(20 - a)$ — kiedy największe?`, r`$P'(a) = 20 - 2a = 0$.`],
    steps: [r`$a = 10$, $b = 10$ — kwadrat.`, r`$P = 100$.`],
    errors: [['400', 'Obwód 40 wzięty jako suma dwóch boków.', r`Obwód to $2(a + b)$.`]],
  }),
  numeric({
    id: 'd-opt-2',
    skill: 'deriv-optimization',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dla jakiej liczby $x > 0$ wyrażenie $x + \frac{9}{x}$ przyjmuje najmniejszą wartość?`,
    answer: 3,
    verify: () => Math.sqrt(9),
    hints: ['Jaka jest pochodna tej funkcji?', r`$1 - \frac{9}{x^2}$.`, r`$1 - \frac{9}{x^2} = 0 \iff x^2 = 9$.`, r`Uwzględnij $x > 0$ i sprawdź zmianę znaku.`],
    steps: [r`$x = 3$ — pochodna zmienia znak z minusa na plus.`, 'Minimum w x = 3.'],
    errors: [['6', 'Podana najmniejsza wartość zamiast argumentu.', 'Pytanie jest o x.']],
  }),
  numeric({
    id: 'd-opt-3',
    skill: 'deriv-optimization',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Z kwadratowej kartki $12 \times 12$ wycinamy w rogach kwadraty o boku $x$ i składamy otwarte pudełko. Dla jakiego $x$ objętość pudełka jest największa?`,
    answer: 2,
    verify: () => {
      let best = 0;
      let arg = 0;
      for (let x = 0.001; x < 6; x += 0.001) {
        const v = x * (12 - 2 * x) ** 2;
        if (v > best) [best, arg] = [v, x];
      }
      return Math.round(arg * 100) / 100;
    },
    tolerance: 0.01,
    hints: ['Jak zapisać objętość przez x?', 'Wysokość to x, a bok podstawy to 12 minus dwa wycięcia — objętość to wysokość razy kwadrat boku.', r`Policz $V'(x)$ i rozłóż na czynniki (wyłącz wspólny nawias).`, 'Które miejsce zerowe leży w dziedzinie (0, 6)?'],
    steps: [r`$x = 2$ ($x = 6$ poza dziedziną); $V'$ zmienia znak z + na −.`, r`$x = 2$.`],
    errors: [['6', 'Wzięte miejsce zerowe spoza dziedziny.', 'Dla x = 6 pudełko ma podstawę zerową.']],
  }),
  numeric({
    id: 'd-opt-4',
    skill: 'deriv-optimization',
    kind: 'typical',
    difficulty: 4,
    prompt: r`W sytuacji z poprzedniego zadania (kartka $12 \times 12$, wycięte kwadraty o boku $x$) oblicz największą możliwą objętość pudełka.`,
    answer: 128,
    verify: () => 2 * (12 - 4) ** 2,
    hints: ['Dla jakiego x objętość jest największa?', r`$x = 2$.`, r`$V(2) = 2 \cdot (12 - 4)^2$.`, 'Policz.'],
    steps: [r`$V(2) = 2 \cdot 64$.`, r`$= 128$.`],
    errors: [['144', r`Policzone $x \cdot 12^2$ bez odjęcia wycięć... albo inny błąd w $(12 - 2x)$.`, 'Bok podstawy to 12 − 2x.']],
  }),
  numeric({
    id: 'd-opt-5',
    skill: 'deriv-optimization',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Prostokątną zagrodę przy długim murze ogradzamy płotem z trzech stron (czwartą stroną jest mur). Mamy $40$ m płotu. Jakie największe pole (w $\mathrm{m}^2$) może mieć zagroda?`,
    answer: 200,
    verify: () => {
      let best = 0;
      for (let x = 0; x <= 20; x += 0.01) best = Math.max(best, x * (40 - 2 * x));
      return Math.round(best * 1000) / 1000;
    },
    tolerance: 1e-6,
    hints: ['Jak zapisać boki przez x (bok prostopadły do muru)?', r`Dwa boki $x$ i jeden $40 - 2x$.`, r`$P(x) = x(40 - 2x)$, $x \in (0, 20)$.`, r`$P'(x) = 40 - 4x = 0$.`],
    steps: [r`$x = 10$: boki $10$, $10$ i $20$.`, r`$P = 200\ \mathrm{m}^2$.`],
    errors: [['100', 'Rozwiązanie jak dla płotu z czterech stron.', 'Mur zastępuje czwarty bok.']],
  }),
  numeric({
    id: 'd-opt-6',
    skill: 'deriv-optimization',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Punkt $P$ leży na paraboli $y = x^2$. Oblicz kwadrat najmniejszej możliwej odległości $P$ od punktu $A = (0, 2)$.`,
    answer: 1.75,
    variants: ['7/4'],
    verify: () => {
      let best = Infinity;
      for (let x = -3; x <= 3; x += 0.0001) best = Math.min(best, x * x + (x * x - 2) ** 2);
      return Math.round(best * 1e6) / 1e6;
    },
    tolerance: 1e-5,
    hints: ['Jak zapisać kwadrat odległości przez x?', r`$d^2(x) = x^2 + (x^2 - 2)^2 = x^4 - 3x^2 + 4$.`, r`Pochodna: $4x^3 - 6x = 2x(2x^2 - 3)$.`, r`Minimum dla $x^2 = \frac32$ — wstaw do $d^2$.`],
    steps: [r`$d^2 = \frac94 - \frac92 + 4$.`, r`$= \frac74$.`],
    errors: [['4', r`Wzięty punkt $x = 0$ (maksimum lokalne $d^2$).`, r`W $x = 0$ pochodna zmienia znak z + na − — to maksimum.`]],
  }),
  numeric({
    id: 'd-opt-7',
    skill: 'deriv-optimization',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Puszka w kształcie walca ma objętość $16\pi$. Najmniejsze możliwe pole jej powierzchni całkowitej ma postać $k\pi$. Podaj $k$.`,
    answer: 24,
    verify: () => {
      let best = Infinity;
      for (let r0 = 0.5; r0 <= 5; r0 += 0.0001) best = Math.min(best, 2 * r0 * r0 + 32 / r0);
      return Math.round(best * 1e4) / 1e4;
    },
    tolerance: 1e-3,
    hints: ['Jak zapisać wysokość przez promień?', r`$\pi r^2 h = 16\pi \Rightarrow h = \frac{16}{r^2}$.`, r`$P(r) = 2\pi r^2 + 2\pi r h = 2\pi r^2 + \frac{32\pi}{r}$.`, r`$P'(r) = 4\pi r - \frac{32\pi}{r^2} = 0 \iff r^3 = 8$.`],
    steps: [r`$r = 2$, $h = 4$.`, r`$P = 8\pi + 16\pi = 24\pi$.`],
    errors: [['2', 'Podany promień zamiast pola.', 'Pytanie dotyczy pola powierzchni.']],
  }),
  numeric({
    id: 'd-opt-8',
    skill: 'deriv-optimization',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W półkole o promieniu $1$ wpisano prostokąt, którego jeden bok leży na średnicy. Jakie największe pole może mieć ten prostokąt?`,
    answer: 1,
    verify: () => {
      let best = 0;
      for (let x = 0; x <= 1; x += 0.0001) best = Math.max(best, 2 * x * Math.sqrt(1 - x * x));
      return Math.round(best * 1e6) / 1e6;
    },
    tolerance: 1e-5,
    hints: ['Jak opisać wierzchołki prostokąta leżące na łuku?', r`$(\pm x, \sqrt{1 - x^2})$ dla $x \in (0, 1)$.`, r`$P(x) = 2x\sqrt{1 - x^2}$ — wygodniej maksymalizować $P^2 = 4x^2(1 - x^2)$.`, r`Podstaw $t = x^2$: $4t(1 - t)$ jest największe dla $t = \frac12$.`],
    steps: [r`$x^2 = \frac12$: $P = 2 \cdot \frac{1}{\sqrt2} \cdot \frac{1}{\sqrt2}$.`, r`$P = 1$.`],
    errors: [['0.5', r`Policzone pole połowy prostokąta ($x\sqrt{1 - x^2}$).`, 'Podstawa prostokąta ma długość 2x.']],
  }),
];

export const DERIV_COURSE_QUESTIONS: Question[] = [...DERIV_QUESTIONS, ...NEW_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const DERIV_CARDS: Flashcard[] = [
  card('c-der-lim-1', 'deriv-limit', 'metoda', r`Granica daje $\frac00$ — co robisz?`, 'Rozkładasz licznik i mianownik na czynniki (albo mnożysz przez sprzężenie) i skracasz.'),
  card('c-der-lim-2', 'deriv-limit', 'definicja', 'Ciągłość w punkcie?', r`$\lim_{x \to x_0} f(x) = f(x_0)$.`),

  card('c-der-bas-1', 'deriv-basic', 'wzor', r`$(x^n)'$?`, r`$n x^{n - 1}$`),
  card('c-der-bas-2', 'deriv-basic', 'wzor', r`$\left(\frac1x\right)'$ i $(\sqrt x)'$?`, r`$-\frac{1}{x^2}$ i $\frac{1}{2\sqrt x}$`),

  card('c-der-rul-1', 'deriv-rules', 'wzor', 'Pochodna iloczynu i ilorazu?', r`$(fg)' = f'g + fg'$; $\left(\frac fg\right)' = \frac{f'g - fg'}{g^2}$`),
  card('c-der-rul-2', 'deriv-rules', 'wzor', 'Pochodna funkcji złożonej?', r`$\big(f(g(x))\big)' = f'(g(x)) \cdot g'(x)$`),

  card('c-der-tan-1', 'deriv-tangent', 'wzor', 'Równanie stycznej w x₀?', r`$y = f'(x_0)(x - x_0) + f(x_0)$`),
  card('c-der-tan-2', 'deriv-tangent', 'metoda', 'Styczna równoległa do y = ax + b?', r`Rozwiąż $f'(x_0) = a$.`),

  card('c-der-mon-1', 'deriv-monotonic', 'definicja', 'Znak pochodnej a monotoniczność?', 'f′ > 0 — rośnie, f′ < 0 — maleje.'),
  card('c-der-mon-2', 'deriv-monotonic', 'pulapka', 'Czy łączyć przedziały monotoniczności sumą?', 'Nie, jeśli funkcja nie jest monotoniczna na całej sumie (np. 1/x).'),

  card('c-der-ext-1', 'deriv-extrema', 'definicja', 'Warunek ekstremum?', r`$f'(x_0) = 0$ i zmiana znaku $f'$ w $x_0$.`),
  card('c-der-ext-2', 'deriv-extrema', 'pulapka', 'Wartość największa w przedziale domkniętym?', 'Porównaj ekstrema z wartościami na końcach przedziału.'),

  card('c-der-opt-1', 'deriv-optimization', 'metoda', 'Schemat zadania optymalizacyjnego?', 'Zmienna → funkcja celu → dziedzina → pochodna → znak (uzasadnienie) → odpowiedź na pytanie.'),
  card('c-der-opt-2', 'deriv-optimization', 'pulapka', 'Za co najczęściej traci się punkt w optymalizacji?', 'Brak dziedziny i brak uzasadnienia, że ekstremum jest maksimum/minimum.'),
];

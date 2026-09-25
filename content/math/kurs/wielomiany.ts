import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 7: Wielomiany (rozszerzenie).
 *
 * Stopień i działania, twierdzenie Bézouta i schemat Hornera, pierwiastki
 * i krotność, równania oraz nierówności wielomianowe.
 */

const r = String.raw;

export const POLY_TOPIC: Topic = {
  id: 'math-polynomials',
  subjectId: 'math',
  name: 'Wielomiany',
  summary: 'Twierdzenie Bézouta, schemat Hornera, pierwiastki i ich krotność, równania i nierówności wyższych stopni.',
};

export const POLY_SKILLS: Skill[] = [
  {
    id: 'poly-basics',
    topicId: 'math-polynomials',
    name: 'Wielomiany: stopień, wartość, równość',
    // II.2 (zakres podstawowy): dodawanie, odejmowanie i mnożenie wielomianów.
    level: 'PP',
    ckeRequirement: 'Wielomiany — stopień, działania, równość wielomianów',
    prerequisites: ['alg-expand', 'fn-basics'],
    examValue: 0.5,
  },
  {
    id: 'poly-division',
    topicId: 'math-polynomials',
    name: 'Dzielenie wielomianów i twierdzenie Bézouta',
    level: 'PR',
    ckeRequirement: 'Wielomiany — dzielenie z resztą, twierdzenie o reszcie, twierdzenie Bézouta',
    prerequisites: ['poly-basics'],
    examValue: 0.7,
  },
  {
    id: 'poly-roots',
    topicId: 'math-polynomials',
    name: 'Pierwiastki wielomianu i ich krotność',
    level: 'PR',
    ckeRequirement: 'Wielomiany — pierwiastki wymierne, krotność pierwiastka, rozkład na czynniki',
    prerequisites: ['poly-division', 'alg-factor'],
    examValue: 0.7,
  },
  {
    id: 'poly-equations',
    topicId: 'math-polynomials',
    name: 'Równania wielomianowe',
    level: 'PR',
    ckeRequirement: 'Wielomiany — rozwiązywanie równań wielomianowych',
    prerequisites: ['poly-roots', 'quad-discriminant'],
    examValue: 0.8,
  },
  {
    id: 'poly-inequalities',
    topicId: 'math-polynomials',
    name: 'Nierówności wielomianowe',
    level: 'PR',
    ckeRequirement: 'Wielomiany — rozwiązywanie nierówności wielomianowych',
    prerequisites: ['poly-equations', 'quad-ineq'],
    examValue: 0.75,
  },
];

const cubicDouble = (x: number) => (x - 2) ** 2 * (x + 1);
const snake = (x: number) => ((x + 2) * (x - 1) * (x - 3)) / 3;

// ===========================================================================
// Lekcje
// ===========================================================================

export const POLY_LESSONS: Lesson[] = [
  {
    skillId: 'poly-basics',
    minutes: 10,
    intro:
      r`Wielomian to suma wyrazów postaci $a x^n$ — uogólnienie funkcji liniowej i kwadratowej na wyższe potęgi. Na rozszerzeniu wielomiany pojawiają się w równaniach, nierównościach i zadaniach z parametrem.`,
    blocks: [
      p(r`$W(x) = 2x^3 - 5x + 1$ to wielomian stopnia $3$ — stopień to najwyższa potęga z niezerowym współczynnikiem. Wyraz wolny to $W(0) = 1$.`),
      p(r`Wartość wielomianu liczysz jak wartość funkcji: $W(2) = 2 \cdot 8 - 10 + 1 = 7$.`),
      f(r`W(1) = \text{suma współczynników} \qquad W(0) = \text{wyraz wolny}`),
      p('Dwa wielomiany są równe, gdy mają ten sam stopień i równe współczynniki przy tych samych potęgach. Stąd metoda porównywania współczynników.'),
      tip(r`Stopień iloczynu to suma stopni: $(x^2 + 1)(x^3 - x)$ ma stopień $5$. Stopień sumy jest co najwyżej równy większemu ze stopni.`),
      warn(r`Dodajesz tylko wyrazy podobne — z tą samą potęgą $x$. $x^3 + x^2$ nie daje $x^5$.`),
    ],
    examples: [
      example(
        r`Dla $W(x) = x^3 - 2x^2 + 3$ oblicz $W(-1)$.`,
        [r`$W(-1) = (-1)^3 - 2 \cdot (-1)^2 + 3$.`, r`$= -1 - 2 + 3 = 0$ — więc $-1$ jest pierwiastkiem.`],
        r`$0$`,
      ),
      example(
        r`Dla jakich $a$ i $b$ wielomiany $x^2 + ax + 6$ i $(x + 2)(x + b)$ są równe?`,
        [r`$(x + 2)(x + b) = x^2 + (b + 2)x + 2b$.`, r`Porównuję: $2b = 6$, więc $b = 3$; $a = b + 2 = 5$.`],
        r`$a = 5$, $b = 3$`,
      ),
    ],
    pitfalls: [
      r`$-2 \cdot (-1)^2 = -2$, nie $+2$ — najpierw potęga, potem mnożenie.`,
      'Stopień iloczynu to suma stopni, nie iloczyn.',
      'Porównywanie współczynników stojących przy różnych potęgach.',
    ],
  },
  {
    skillId: 'poly-division',
    minutes: 14,
    intro:
      r`Dzielenie wielomianów działa jak dzielenie liczb z resztą. Najważniejsze narzędzie to twierdzenie o reszcie: reszta z dzielenia przez $(x - a)$ to po prostu $W(a)$ — bez dzielenia.`,
    blocks: [
      f(r`W(x) = (x - a) \cdot Q(x) + R, \qquad R = W(a)`, 'twierdzenie o reszcie'),
      p(r`Twierdzenie Bézouta: $a$ jest pierwiastkiem $W$ wtedy i tylko wtedy, gdy $W$ dzieli się przez $(x - a)$ bez reszty, czyli gdy $W(a) = 0$.`),
      p(
        r`Schemat Hornera to szybkie dzielenie przez $(x - a)$: piszesz współczynniki w rzędzie, spisujesz pierwszy, a każdy kolejny to „poprzedni wynik razy $a$ plus następny współczynnik”. Ostatnia liczba to reszta.`,
      ),
      f(r`\frac{x^3 - 6x^2 + 11x - 6}{x - 1}: \quad 1,\ \ -5,\ \ 6 \ \ \big|\ \ 0`, 'Horner dla a = 1: iloraz x² − 5x + 6, reszta 0'),
      warn(r`Dzieląc przez $(x + 2)$, stosujesz $a = -2$. Znak w nawiasie jest odwrotny do $a$.`),
      tip(r`Reszta z dzielenia przez wielomian stopnia $2$ ma stopień co najwyżej $1$: $R(x) = px + q$. Wyznaczasz ją z dwóch wartości $W$.`),
    ],
    examples: [
      example(
        r`Oblicz resztę z dzielenia $W(x) = x^4 - 3x^2 + x - 2$ przez $(x - 2)$.`,
        [r`Z twierdzenia o reszcie: $R = W(2)$.`, r`$W(2) = 16 - 12 + 2 - 2 = 4$.`],
        r`$4$`,
      ),
      example(
        r`Podziel $x^3 - 6x^2 + 11x - 6$ przez $(x - 1)$ schematem Hornera.`,
        [
          r`Współczynniki: $1, -6, 11, -6$; $a = 1$.`,
          r`Spisuję $1$; $1 \cdot 1 - 6 = -5$; $-5 \cdot 1 + 11 = 6$; $6 \cdot 1 - 6 = 0$.`,
          r`Iloraz $x^2 - 5x + 6$, reszta $0$.`,
        ],
        r`$x^2 - 5x + 6$, reszta $0$`,
      ),
    ],
    pitfalls: [
      r`Dzielenie przez $(x + a)$ to $W(-a)$, nie $W(a)$.`,
      'W schemacie Hornera trzeba wpisać zero za każdą brakującą potęgę.',
      'Reszta z dzielenia przez wielomian stopnia 2 może zależeć od x.',
    ],
  },
  {
    skillId: 'poly-roots',
    minutes: 12,
    intro:
      r`Pierwiastki wielomianu to miejsca zerowe — punkty, w których wykres przecina oś $x$ albo jej dotyka. Twierdzenie o pierwiastkach wymiernych mówi, gdzie ich szukać, zamiast zgadywać.`,
    blocks: [
      p(
        r`Jeśli wielomian ma współczynniki całkowite, to każdy jego pierwiastek całkowity dzieli wyraz wolny. Dla $x^3 - 6x^2 + 11x - 6$ kandydaci to $\pm 1, \pm 2, \pm 3, \pm 6$.`,
      ),
      f(r`\text{pierwiastek wymierny } \tfrac{p}{q}: \qquad p \text{ dzieli } a_0, \quad q \text{ dzieli } a_n`),
      p(
        r`Krotność pierwiastka to liczba wystąpień czynnika $(x - a)$ w rozkładzie. W $(x - 2)^2(x + 1)$ liczba $2$ jest pierwiastkiem podwójnym: wykres dotyka osi i odbija się, zamiast ją przeciąć.`,
      ),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres wielomianu (x − 2)²(x + 1): przecina oś x w −1, a w punkcie 2 dotyka osi i odbija się.',
          x: [-2, 4],
          y: [-7, 6],
          curves: [{ fn: cubicDouble, from: -1.5, to: 3.2 }],
          points: [{ at: [-1, 0] }, { at: [2, 0] }],
        },
        caption: 'Pierwiastek pojedynczy −1: wykres przecina oś. Podwójny 2: dotyka i odbija się.',
      },
      tip(r`Po znalezieniu jednego pierwiastka podziel wielomian przez $(x - a)$ Hornerem — zostaje wielomian niższego stopnia, zwykle kwadratowy.`),
      warn('Nie każdy wielomian ma pierwiastek wymierny. Gdy żaden kandydat nie działa, szukaj rozkładu grupowaniem albo podstawieniem.'),
    ],
    examples: [
      example(
        r`Znajdź pierwiastki $x^3 - 6x^2 + 11x - 6$.`,
        [
          r`Kandydaci: dzielniki $6$. $W(1) = 1 - 6 + 11 - 6 = 0$.`,
          r`Horner przez $(x - 1)$: iloraz $x^2 - 5x + 6 = (x - 2)(x - 3)$.`,
          r`Pierwiastki: $1, 2, 3$.`,
        ],
        r`$1, 2, 3$`,
      ),
      example(
        r`Jaką krotność ma pierwiastek $1$ wielomianu $(x - 1)^3(x + 2)$?`,
        [r`Czynnik $(x - 1)$ występuje w potędze $3$.`, r`Krotność $3$ — nieparzysta, więc wykres przecina oś w $x = 1$.`],
        r`$3$`,
      ),
    ],
    pitfalls: ['Szukanie tylko dodatnich kandydatów — ujemne dzielniki też się liczą.', 'Mylenie krotności z liczbą pierwiastków.', 'Brak dzielenia wielomianu po znalezieniu pierwiastka.'],
  },
  {
    skillId: 'poly-equations',
    minutes: 12,
    intro:
      'Równanie wielomianowe rozwiązujesz, zamieniając wielomian w iloczyn. Iloczyn jest zerem, gdy zerem jest któryś czynnik — a każdy czynnik to już proste równanie.',
    blocks: [
      p(
        r`Narzędzia rozkładu, w kolejności sprawdzania: wyłączenie wspólnego czynnika, wzory skróconego mnożenia, grupowanie, pierwiastek wymierny z Hornerem, podstawienie $t = x^2$.`,
      ),
      f(r`x^4 - 5x^2 + 4 = 0 \ \xrightarrow{\ t = x^2\ }\ t^2 - 5t + 4 = 0`, 'równanie dwukwadratowe'),
      tip(r`Po podstawieniu $t = x^2$ pamiętaj, że $t \ge 0$. Ujemne rozwiązanie w $t$ nie daje żadnego $x$.`),
      warn(r`Nigdy nie dziel obu stron przez wyrażenie z $x$ — gubisz rozwiązania. Wyłącz je przed nawias.`),
    ],
    examples: [
      example(
        r`Rozwiąż $x^3 - 3x^2 - 4x + 12 = 0$.`,
        [r`Grupuję: $x^2(x - 3) - 4(x - 3) = (x - 3)(x^2 - 4)$.`, r`$(x - 3)(x - 2)(x + 2) = 0$.`, r`$x \in \{-2, 2, 3\}$.`],
        r`$x \in \{-2, 2, 3\}$`,
      ),
      example(
        r`Rozwiąż $x^4 + 3x^2 - 4 = 0$.`,
        [r`$t = x^2 \ge 0$: $t^2 + 3t - 4 = 0$, więc $t = 1$ lub $t = -4$.`, r`$t = -4$ odrzucam, bo $x^2$ nie jest ujemne.`, r`$x^2 = 1$, więc $x = \pm 1$.`],
        r`$x \in \{-1, 1\}$`,
      ),
    ],
    pitfalls: [r`Dzielenie równania przez $x$ zamiast wyłączenia $x$ przed nawias.`, r`Ujemne $t$ przy podstawieniu $t = x^2$.`, 'Niedokończony rozkład czynnika kwadratowego.'],
  },
  {
    skillId: 'poly-inequalities',
    minutes: 12,
    intro:
      'Nierówność wielomianową rozwiązuje się metodą „wężyka”: po rozłożeniu na czynniki zaznaczasz pierwiastki na osi i rysujesz krzywą, która zmienia stronę osi w pierwiastkach nieparzystej krotności.',
    blocks: [
      p(
        '1) Przenieś wszystko na jedną stronę i rozłóż na czynniki. 2) Zaznacz pierwiastki na osi. 3) Zacznij z prawej — nad osią, gdy współczynnik przy najwyższej potędze jest dodatni. 4) Przy pierwiastku nieparzystej krotności przechodź na drugą stronę, przy parzystej — odbij się.',
      ),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wykres wielomianu (x + 2)(x − 1)(x − 3): pod osią dla x < −2, nad osią między −2 a 1, pod osią między 1 a 3, nad osią dla x > 3.',
          x: [-3, 4],
          y: [-9, 6],
          curves: [{ fn: snake }],
          points: [{ at: [-2, 0] }, { at: [1, 0] }, { at: [3, 0] }],
        },
        caption: '(x + 2)(x − 1)(x − 3) > 0 dla x ∈ (−2, 1) ∪ (3, +∞)',
      },
      tip('Dodatni współczynnik przy najwyższej potędze: wężyk zaczyna się z prawej NAD osią. Ujemny — pod osią.'),
      warn(r`Pierwiastek podwójny nie zmienia znaku. W $(x - 1)^2(x + 3) \ge 0$ liczba $1$ należy do rozwiązania, choć wężyk tylko dotyka osi.`),
    ],
    examples: [
      example(
        r`Rozwiąż $(x + 2)(x - 1)(x - 3) > 0$.`,
        [
          r`Pierwiastki: $-2, 1, 3$, wszystkie pojedyncze.`,
          r`Z prawej nad osią: dodatnie dla $x > 3$, ujemne na $(1, 3)$, dodatnie na $(-2, 1)$, ujemne dla $x < -2$.`,
          r`$x \in (-2, 1) \cup (3, +\infty)$.`,
        ],
        r`$x \in (-2, 1) \cup (3, +\infty)$`,
      ),
      example(
        r`Rozwiąż $x^2(x - 2) \le 0$.`,
        [
          r`Pierwiastki: $0$ (podwójny) i $2$ (pojedynczy).`,
          r`Dla $x > 2$ dodatnie; przy $2$ zmiana znaku; przy $0$ odbicie — ujemne po obu stronach zera.`,
          r`$x \in (-\infty, 2 \rangle$.`,
        ],
        r`$x \in (-\infty, 2\rangle$`,
      ),
    ],
    pitfalls: ['Przejście na drugą stronę osi przy pierwiastku parzystej krotności.', 'Start wężyka z lewej strony zamiast z prawej.', r`Zgubione pojedyncze punkty (pierwiastki parzyste) przy $\le$ i $\ge$.`],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const POLY_QUESTIONS: Question[] = [
  // poly-basics ---------------------------------------------------------------
  numeric({
    id: 'w-bas-1',
    skill: 'poly-basics',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Podaj stopień wielomianu $W(x) = 4x^5 - x^7 + 2x + 3$.`,
    answer: 7,
    verify: () => Math.max(5, 7, 1, 0),
    hints: ['Co wyznacza stopień wielomianu?', 'Najwyższa potęga z niezerowym współczynnikiem.', 'Porównaj wszystkie potęgi — kolejność zapisu nie ma znaczenia.', r`Który wykładnik jest największy: $5$, $7$ czy $1$?`],
    steps: [r`Potęgi: $5, 7, 1, 0$.`, r`Najwyższa: $7$.`],
    errors: [['5', 'Wzięta pierwsza zapisana potęga zamiast najwyższej.', 'Stopień to największy wykładnik, niezależnie od kolejności wyrazów.']],
  }),
  numeric({
    id: 'w-bas-2',
    skill: 'poly-basics',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dla $W(x) = x^3 - 2x^2 + 3$ oblicz $W(-1)$.`,
    answer: 0,
    verify: () => (-1) ** 3 - 2 * (-1) ** 2 + 3,
    hints: ['Jak bezpiecznie wstawić liczbę ujemną?', r`$(-1)^3 - 2 \cdot (-1)^2 + 3$.`, r`$(-1)^3 = -1$, $(-1)^2 = 1$.`, r`$-1 - 2 + 3$.`],
    steps: [r`$W(-1) = -1 - 2 + 3$.`, r`$= 0$.`],
    errors: [['4', r`Policzone $-2 \cdot (-1)^2$ jako $+2$.`, r`$(-1)^2 = 1$, więc $-2 \cdot 1 = -2$.`]],
  }),
  choice({
    id: 'w-bas-3',
    skill: 'poly-basics',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Suma współczynników wielomianu $W(x) = (2x - 1)^5$ jest równa`,
    choices: [r`$1$`, r`$32$`, r`$-1$`, r`$0$`],
    answer: 'A',
    verify: () => (2 * 1 - 1) ** 5,
    hints: ['Czy trzeba rozwijać potęgę, żeby znać sumę współczynników?', r`Suma współczynników to $W(1)$.`, r`$W(1) = (2 - 1)^5$.`, r`$1^5$.`],
    steps: [r`Suma współczynników $= W(1)$.`, r`$W(1) = 1^5 = 1$.`],
    errors: [
      ['B', r`Pominięte $-1$: policzone $2^5$.`, r`Suma współczynników to $W(1) = (2 \cdot 1 - 1)^5$.`],
      ['C', r`Policzony wyraz wolny $W(0) = (-1)^5$.`, r`Wyraz wolny to $W(0)$, suma współczynników — $W(1)$.`],
      ['D', 'Pomylona suma współczynników z miejscem zerowym.', r`Suma współczynników to wartość $W(1)$.`],
    ],
  }),
  numeric({
    id: 'w-bas-4',
    skill: 'poly-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj stopień wielomianu $W(x) = (x^3 + 2)(x^4 - x) + x^2$.`,
    answer: 7,
    verify: () => 3 + 4,
    hints: ['Jaki jest stopień iloczynu dwóch wielomianów?', 'Suma ich stopni.', r`$3 + 4$.`, r`Dodanie $x^2$ nie zmienia najwyższej potęgi.`],
    steps: [r`Iloczyn ma stopień $3 + 4 = 7$.`, r`$+x^2$ nie zmienia stopnia: $7$.`],
    errors: [['12', 'Stopnie czynników pomnożone zamiast dodane.', r`$x^3 \cdot x^4 = x^7$ — wykładniki się dodaje.`]],
  }),
  numeric({
    id: 'w-bas-5',
    skill: 'poly-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wielomiany $W(x) = x^2 + ax + 6$ i $V(x) = (x + 2)(x + b)$ są równe. Oblicz $a$.`,
    answer: 5,
    verify: () => 6 / 2 + 2,
    hints: [r`Jak wygląda $V(x)$ po wymnożeniu?`, r`$x^2 + (b + 2)x + 2b$.`, r`Wyraz wolny: $2b = 6$.`, r`$a = b + 2$.`],
    steps: [r`$2b = 6 \Rightarrow b = 3$.`, r`$a = b + 2 = 5$.`],
    errors: [['3', r`Podane $b$ zamiast $a$.`, 'Pytanie jest o współczynnik a.']],
  }),
  numeric({
    id: 'w-bas-6',
    skill: 'poly-basics',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wielomian $W(x) = x^3 + ax^2 - 4x + 4$ spełnia warunek $W(2) = 0$. Oblicz $a$.`,
    answer: -1,
    verify: () => -(8 - 8 + 4) / 4,
    hints: [r`Co oznacza $W(2) = 0$?`, r`$8 + 4a - 8 + 4 = 0$.`, r`$4a + 4 = 0$.`, r`Rozwiąż względem $a$.`],
    steps: [r`$W(2) = 4a + 4 = 0$.`, r`$a = -1$.`],
    errors: [['1', r`Zły znak przy rozwiązaniu $4a + 4 = 0$.`, r`$4a = -4$.`]],
  }),
  numeric({
    id: 'w-bas-7',
    skill: 'poly-basics',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Z kwadratu o boku $10$ cm wycięto w rogach kwadraty o boku $x$ i zagięto boki, tworząc pudełko. Jego objętość to $V(x) = x(10 - 2x)^2$. Oblicz $V(2)$.`,
    answer: 72,
    verify: () => 2 * (10 - 4) ** 2,
    hints: ['Co trzeba wstawić do wzoru?', r`$V(2) = 2 \cdot (10 - 2 \cdot 2)^2$.`, r`$10 - 4 = 6$.`, r`$2 \cdot 36$.`],
    steps: [r`$V(2) = 2 \cdot 6^2$.`, r`$= 72\ \mathrm{cm}^3$.`],
    errors: [['128', r`Policzone $(10 - x)^2$ zamiast $(10 - 2x)^2$.`, 'Wycięcie zmniejsza bok z obu stron — o 2x.']],
  }),
  numeric({
    id: 'w-bas-8',
    skill: 'poly-basics',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wielomian $W$ stopnia $3$ ma współczynnik przy $x^3$ równy $2$ oraz pierwiastki $1$, $-2$ i $3$. Oblicz $W(0)$.`,
    answer: 12,
    verify: () => 2 * (0 - 1) * (0 + 2) * (0 - 3),
    hints: ['Jak zapisać wielomian, znając jego pierwiastki?', r`$W(x) = 2(x - 1)(x + 2)(x - 3)$.`, r`Wstaw $x = 0$.`, r`$2 \cdot (-1) \cdot 2 \cdot (-3)$.`],
    steps: [r`$W(x) = 2(x - 1)(x + 2)(x - 3)$.`, r`$W(0) = 2 \cdot (-1) \cdot 2 \cdot (-3) = 12$.`],
    errors: [
      ['6', r`Pominięty współczynnik $2$ przed nawiasami.`, r`Postać iloczynowa zaczyna się od współczynnika przy najwyższej potędze.`],
      ['-12', 'Zły znak iloczynu.', 'Dwa czynniki ujemne dają iloczyn dodatni.'],
    ],
  }),

  // poly-division -------------------------------------------------------------
  numeric({
    id: 'w-div-1',
    skill: 'poly-division',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz resztę z dzielenia wielomianu $W(x) = x^3 + 2x - 5$ przez $(x - 1)$.`,
    answer: -2,
    verify: () => 1 + 2 - 5,
    hints: ['Czy trzeba wykonywać dzielenie, żeby poznać resztę?', r`Twierdzenie o reszcie: reszta to $W(1)$.`, r`$W(1) = 1 + 2 - 5$.`, 'Policz.'],
    steps: [r`$R = W(1)$.`, r`$W(1) = 1 + 2 - 5 = -2$.`],
    errors: [['-8', r`Policzone $W(-1)$ zamiast $W(1)$.`, r`Dzielenie przez $(x - a)$ daje resztę $W(a)$.`]],
  }),
  numeric({
    id: 'w-div-2',
    skill: 'poly-division',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz resztę z dzielenia $W(x) = x^4 - 3x^2 + x - 2$ przez $(x + 1)$.`,
    answer: -5,
    verify: () => 1 - 3 - 1 - 2,
    hints: [r`Jaką liczbę $a$ daje dzielnik $(x + 1)$?`, r`$x + 1 = x - (-1)$, więc $a = -1$.`, r`$W(-1) = 1 - 3 - 1 - 2$.`, 'Policz.'],
    steps: [r`$R = W(-1)$.`, r`$1 - 3 - 1 - 2 = -5$.`],
    errors: [['-3', r`Policzone $W(1)$ zamiast $W(-1)$.`, r`Dzielnik $(x + 1)$ odpowiada $a = -1$.`]],
  }),
  choice({
    id: 'w-div-3',
    skill: 'poly-division',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wielomian $W(x) = x^3 - 2x^2 - x + 2$ jest podzielny przez`,
    choices: [r`$(x - 2)$`, r`$(x + 2)$`, r`$(x - 3)$`, r`$(x + 3)$`],
    answer: 'A',
    hints: ['Jak sprawdzić podzielność przez (x − a) bez dzielenia?', r`Twierdzenie Bézouta: sprawdź, czy $W(a) = 0$.`, r`$W(2) = 8 - 8 - 2 + 2$.`, 'Sprawdź pozostałe kandydatury tak samo.'],
    steps: [r`$W(2) = 0$ — podzielny przez $(x - 2)$.`, r`$W(-2) = -12$, $W(3) = 8$, $W(-3) = -40$.`],
    errors: [
      ['B', r`Pomylony znak: $(x + 2)$ wymaga $W(-2) = 0$.`, r`$W(-2) = -12 \ne 0$.`],
      ['C', r`$W(3) = 8 \ne 0$.`, 'Podzielność sprawdzasz, licząc W(a).'],
      ['D', r`$W(-3) = -40 \ne 0$.`, 'Podzielność sprawdzasz, licząc W(a).'],
    ],
  }),
  numeric({
    id: 'w-div-4',
    skill: 'poly-division',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Iloraz z dzielenia $x^3 - 6x^2 + 11x - 6$ przez $(x - 1)$ ma postać $x^2 + bx + c$. Oblicz $b + c$.`,
    answer: 1,
    verify: () => -5 + 6,
    hints: ['Którą metodą najszybciej podzielić przez (x − 1)?', r`Schemat Hornera dla $a = 1$ i współczynników $1, -6, 11, -6$.`, r`Kolejne liczby: $1$, $1 \cdot 1 - 6$, …`, r`Iloraz: $x^2 - 5x + 6$.`],
    steps: [r`Horner: $1,\ -5,\ 6 \mid 0$.`, r`$b + c = -5 + 6 = 1$.`],
    errors: [['-1', r`Zgubiony znak w jednym ze współczynników ilorazu.`, r`Iloraz to $x^2 - 5x + 6$.`]],
  }),
  numeric({
    id: 'w-div-5',
    skill: 'poly-division',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla jakiego $m$ wielomian $W(x) = x^3 + mx^2 - 5x + 6$ jest podzielny przez $(x - 2)$?`,
    answer: -1,
    verify: () => -(8 - 10 + 6) / 4,
    hints: ['Jaki warunek daje twierdzenie Bézouta?', r`$W(2) = 0$.`, r`$8 + 4m - 10 + 6 = 0$.`, r`$4m + 4 = 0$.`],
    steps: [r`$W(2) = 4m + 4 = 0$.`, r`$m = -1$.`],
    errors: [['1', r`Zły znak przy rozwiązaniu $4m + 4 = 0$.`, r`$4m = -4$.`]],
  }),
  numeric({
    id: 'w-div-6',
    skill: 'poly-division',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz resztę z dzielenia $W(x) = x^{10} + x^5 + 1$ przez $(x + 1)$.`,
    answer: 1,
    verify: () => (-1) ** 10 + (-1) ** 5 + 1,
    hints: ['Czy trzeba dzielić wielomian stopnia 10?', r`Nie — reszta to $W(-1)$.`, r`Parzysta potęga $-1$ daje $1$, nieparzysta daje $-1$.`, r`$1 + (-1) + 1$.`],
    steps: [r`$R = W(-1) = 1 - 1 + 1$.`, r`$= 1$.`],
    errors: [['3', r`Policzone $W(1)$ zamiast $W(-1)$.`, r`Dzielnik $(x + 1)$ odpowiada $a = -1$.`]],
  }),
  numeric({
    id: 'w-div-7',
    skill: 'poly-division',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Wielomian $W$ przy dzieleniu przez $(x - 1)$ daje resztę $3$, a przy dzieleniu przez $(x - 2)$ — resztę $5$. Reszta z dzielenia $W$ przez $(x - 1)(x - 2)$ ma postać $R(x) = px + q$. Oblicz $p$.`,
    answer: 2,
    verify: () => 5 - 3,
    hints: ['Co wiesz o W(1) i W(2)?', r`$W(1) = 3$, $W(2) = 5$, a w tych punktach $W$ i $R$ mają te same wartości.`, r`$p + q = 3$ i $2p + q = 5$.`, 'Odejmij równania stronami.'],
    steps: [r`$R(1) = p + q = 3$, $R(2) = 2p + q = 5$.`, r`$p = 2$ (i $q = 1$).`],
    errors: [['1', r`Podane $q$ zamiast $p$.`, r`Pytanie jest o współczynnik przy $x$.`]],
  }),
  numeric({
    id: 'w-div-8',
    skill: 'poly-division',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wielomian $W(x) = x^3 + ax^2 + bx - 6$ jest podzielny przez $(x - 1)$ i przez $(x + 2)$. Oblicz $a + b$.`,
    answer: 5,
    verify: () => {
      // W(1) = 0: a + b = 5; W(-2) = 0: 4a - 2b = 14
      const a = (5 * 2 + 14) / 6;
      const b = 5 - a;
      return a + b;
    },
    hints: ['Jakie równania dają dwie podzielności?', r`$W(1) = 0$ oraz $W(-2) = 0$.`, r`$W(1) = 1 + a + b - 6$.`, 'Czy do obliczenia a + b potrzebne jest drugie równanie?'],
    steps: [r`$W(1) = 1 + a + b - 6 = 0$.`, r`Stąd od razu $a + b = 5$ (a z drugiego warunku: $a = 4$, $b = 1$).`],
    errors: [['-5', r`Zły znak przy przenoszeniu: $a + b - 5 = 0$.`, r`$a + b = 6 - 1$.`]],
  }),

  // poly-roots ----------------------------------------------------------------
  numeric({
    id: 'w-root-1',
    skill: 'poly-roots',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Ile różnych pierwiastków ma wielomian $W(x) = (x - 3)(x + 1)(x - 3)$?`,
    answer: 2,
    verify: () => new Set([3, -1, 3]).size,
    hints: ['Jakie liczby zerują poszczególne czynniki?', r`$3$, $-1$ i znowu $3$.`, 'Czy powtórzona liczba to nowy pierwiastek?', r`$3$ jest pierwiastkiem podwójnym.`],
    steps: [r`Pierwiastki: $3$ (podwójny) i $-1$.`, 'Różnych: 2.'],
    errors: [['3', r`Pierwiastek $3$ policzony dwa razy.`, 'Krotność nie zwiększa liczby różnych pierwiastków.']],
  }),
  numeric({
    id: 'w-root-2',
    skill: 'poly-roots',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj krotność pierwiastka $-2$ wielomianu $W(x) = (x + 2)^3(x - 5)$.`,
    answer: 3,
    verify: () => 3,
    hints: ['Który czynnik zeruje się dla x = −2?', r`$(x + 2)$.`, 'W jakiej potędze występuje ten czynnik?', 'Wykładnik to krotność.'],
    steps: [r`Czynnik $(x + 2)$ występuje w potędze $3$.`, 'Krotność: 3.'],
    errors: [['1', 'Pominięta potęga czynnika.', r`Krotność to wykładnik przy $(x - a)$.`]],
  }),
  choice({
    id: 'w-root-3',
    skill: 'poly-roots',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Która z liczb może być pierwiastkiem całkowitym wielomianu $W(x) = x^3 + 2x^2 - 5x + 4$?`,
    choices: [r`$-4$`, r`$3$`, r`$-5$`, r`$8$`],
    answer: 'A',
    hints: ['Gdzie szukać kandydatów na pierwiastki całkowite?', 'Wśród dzielników wyrazu wolnego.', r`Wyraz wolny to $4$: dzielniki $\pm 1, \pm 2, \pm 4$.`, 'Która z liczb jest w tym zbiorze?'],
    steps: [r`Kandydaci: $\pm 1, \pm 2, \pm 4$.`, r`Z odpowiedzi tylko $-4$ jest dzielnikiem $4$.`],
    errors: [
      ['B', r`$3$ nie dzieli wyrazu wolnego $4$.`, 'Pierwiastek całkowity dzieli wyraz wolny.'],
      ['C', 'Wzięty współczynnik przy x zamiast dzielnika wyrazu wolnego.', 'Kandydaci to dzielniki wyrazu wolnego.'],
      ['D', r`$8$ nie dzieli $4$.`, 'Pierwiastek całkowity dzieli wyraz wolny.'],
    ],
  }),
  numeric({
    id: 'w-root-4',
    skill: 'poly-roots',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wielomian $W(x) = x^3 - 6x^2 + 11x - 6$ ma trzy pierwiastki. Podaj największy z nich.`,
    answer: 3,
    verify: () => Math.max(...[1, 2, 3, 6, -1, -2, -3, -6].filter((x) => x ** 3 - 6 * x ** 2 + 11 * x - 6 === 0)),
    hints: ['Gdzie szukać pierwiastków całkowitych?', 'Wśród dzielników liczby 6.', r`$W(1) = 0$ — podziel przez $(x - 1)$.`, r`Iloraz $x^2 - 5x + 6$ — rozłóż go.`],
    steps: [r`$W(x) = (x - 1)(x - 2)(x - 3)$.`, r`Największy pierwiastek: $3$.`],
    errors: [['6', 'Podany wyraz wolny zamiast pierwiastka.', 'Wyraz wolny wskazuje kandydatów — każdego trzeba sprawdzić.']],
  }),
  numeric({
    id: 'w-root-5',
    skill: 'poly-roots',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj sumę pierwiastków wielomianu $W(x) = x^3 - 3x^2 - 4x + 12$.`,
    answer: 3,
    verify: () => 3 + 2 - 2,
    hints: ['Jak pogrupować cztery wyrazy?', r`$x^2(x - 3) - 4(x - 3)$.`, r`$(x - 3)(x^2 - 4)$.`, r`Pierwiastki: $3$, $2$, $-2$.`],
    steps: [r`$(x - 3)(x - 2)(x + 2)$.`, r`Suma: $3 + 2 - 2 = 3$.`],
    errors: [['7', r`Pominięty minus przy pierwiastku $-2$.`, r`$x + 2 = 0 \iff x = -2$.`]],
  }),
  choice({
    id: 'w-root-6',
    skill: 'poly-roots',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Na rysunku jest wykres wielomianu $W$ stopnia $3$ ze współczynnikiem $1$ przy $x^3$. Wzór $W$ to`,
    figure: {
      kind: 'plot',
      alt: 'Wykres wielomianu stopnia 3: przecina oś x w punkcie −1, a w punkcie 2 dotyka osi i odbija się.',
      x: [-2, 4],
      y: [-7, 6],
      curves: [{ fn: cubicDouble, from: -1.5, to: 3.2 }],
      points: [{ at: [-1, 0] }, { at: [2, 0] }],
    },
    choices: [r`$(x - 2)^2(x + 1)$`, r`$(x + 2)^2(x - 1)$`, r`$(x - 2)(x + 1)^2$`, r`$(x - 2)(x + 1)$`],
    answer: 'A',
    hints: ['Gdzie wykres przecina oś, a gdzie tylko jej dotyka?', r`Przecina w $-1$, dotyka w $2$.`, 'Dotknięcie z odbiciem oznacza pierwiastek podwójny.', r`$2$ podwójny, $-1$ pojedynczy.`],
    steps: [r`Pierwiastki: $-1$ (pojedynczy), $2$ (podwójny).`, r`$W(x) = (x - 2)^2(x + 1)$.`],
    errors: [
      ['B', 'Pomylone znaki pierwiastków.', r`Pierwiastek $2$ daje czynnik $(x - 2)$.`],
      ['C', 'Krotność przypisana nie temu pierwiastkowi.', r`Wykres odbija się w $x = 2$ — tam jest pierwiastek podwójny.`],
      ['D', 'To wielomian stopnia 2 — nie odbija się od osi.', 'Stopień 3 wymaga trzech czynników liniowych (z krotnościami).'],
    ],
  }),
  numeric({
    id: 'w-root-7',
    skill: 'poly-roots',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Wielomian $W(x) = 2x^3 - 3x^2 - 3x + 2$ ma pierwiastek $x = 2$. Oblicz iloczyn pozostałych dwóch pierwiastków.`,
    answer: -0.5,
    variants: ['-1/2'],
    verify: () => 0.5 * -1,
    hints: [r`Co zrobić po znalezieniu pierwiastka $2$?`, r`Podziel przez $(x - 2)$ Hornerem: współczynniki $2, -3, -3, 2$.`, r`Iloraz: $2x^2 + x - 1$.`, 'Iloczyn pierwiastków trójmianu: c/a.'],
    steps: [r`Horner: $2,\ 1,\ -1 \mid 0$, iloraz $2x^2 + x - 1$.`, r`Iloczyn pierwiastków: $\frac{-1}{2}$.`],
    errors: [['-1', r`Pominięte dzielenie przez współczynnik $a = 2$.`, r`Iloczyn pierwiastków to $\frac{c}{a}$.`]],
  }),
  numeric({
    id: 'w-root-8',
    skill: 'poly-roots',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla jakiego $m$ liczba $2$ jest pierwiastkiem dwukrotnym wielomianu $W(x) = x^3 - 5x^2 + 8x + m$?`,
    answer: -4,
    verify: () => -(8 - 20 + 16),
    hints: ['Jaki warunek musi być spełniony, żeby 2 było w ogóle pierwiastkiem?', r`$W(2) = 0$: $8 - 20 + 16 + m = 0$.`, r`Wyznacz stąd $m$, a potem sprawdź krotność: podziel wielomian przez $(x - 2)$.`, r`Iloraz $x^2 - 3x + 2 = (x - 1)(x - 2)$ — dwójka pojawia się drugi raz.`],
    steps: [r`$W(2) = 4 + m = 0 \Rightarrow m = -4$.`, r`$W(x) = (x - 2)^2(x - 1)$ — pierwiastek $2$ jest dwukrotny.`],
    errors: [['4', r`Zły znak przy rozwiązaniu $4 + m = 0$.`, r`$m = -4$.`]],
  }),

  // poly-equations ------------------------------------------------------------
  numeric({
    id: 'w-eq-1',
    skill: 'poly-equations',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż równanie $x(x - 3)(x + 5) = 0$. Podaj sumę rozwiązań.`,
    answer: -2,
    verify: () => 0 + 3 - 5,
    hints: ['Kiedy iloczyn jest równy zero?', 'Gdy zerem jest któryś czynnik.', r`$x = 0$, $x = 3$, $x = -5$.`, 'Dodaj.'],
    steps: [r`Rozwiązania: $0, 3, -5$.`, r`Suma: $-2$.`],
    errors: [['2', r`Zły znak przy $x + 5 = 0$.`, r`$x + 5 = 0 \iff x = -5$.`]],
  }),
  numeric({
    id: 'w-eq-2',
    skill: 'poly-equations',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile rozwiązań ma równanie $x^3 - 9x = 0$?`,
    answer: 3,
    verify: () => [0, 3, -3].filter((x) => x ** 3 - 9 * x === 0).length,
    hints: ['Co można wyłączyć przed nawias?', r`$x(x^2 - 9) = 0$.`, r`$x^2 - 9 = (x - 3)(x + 3)$.`, r`Rozwiązania: $0$, $3$, $-3$.`],
    steps: [r`$x(x - 3)(x + 3) = 0$.`, 'Trzy rozwiązania.'],
    errors: [['2', r`Równanie podzielone przez $x$ — zgubione $x = 0$.`, r`Nie dziel przez $x$ — wyłącz je przed nawias.`]],
  }),
  choice({
    id: 'w-eq-3',
    skill: 'poly-equations',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Równanie $x^4 + 3x^2 - 4 = 0$ ma`,
    choices: ['dwa rozwiązania', 'cztery rozwiązania', 'jedno rozwiązanie', 'zero rozwiązań'],
    answer: 'A',
    hints: ['Jakie podstawienie upraszcza to równanie?', r`$t = x^2$: $t^2 + 3t - 4 = 0$.`, r`$t = 1$ lub $t = -4$.`, r`Czy $x^2 = -4$ ma rozwiązania?`],
    steps: [r`$t = 1$ lub $t = -4$; $t = -4$ odpada.`, r`$x^2 = 1$: $x = \pm 1$ — dwa rozwiązania.`],
    errors: [
      ['B', 'Nie odrzucono $t = -4$.', '$t = x^2 \\ge 0$ — ujemne $t$ nie daje rozwiązań.'],
      ['C', 'Z $x^2 = 1$ wzięte tylko $x = 1$.', '$x^2 = 1 \\iff x = \\pm 1$.'],
      ['D', 'Uznano, że ujemny pierwiastek w t przekreśla wszystko.', '$t = 1$ daje dwa rozwiązania.'],
    ],
  }),
  numeric({
    id: 'w-eq-4',
    skill: 'poly-equations',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $x^3 - 3x^2 - 4x + 12 = 0$. Podaj iloczyn rozwiązań.`,
    answer: -12,
    verify: () => 3 * 2 * -2,
    hints: ['Jak pogrupować wyrazy?', r`$x^2(x - 3) - 4(x - 3) = 0$.`, r`$(x - 3)(x - 2)(x + 2) = 0$.`, 'Pomnóż rozwiązania.'],
    steps: [r`Rozwiązania: $3, 2, -2$.`, r`Iloczyn: $-12$.`],
    errors: [['12', 'Zgubiony minus przy pierwiastku −2.', r`$x + 2 = 0 \iff x = -2$.`]],
  }),
  numeric({
    id: 'w-eq-5',
    skill: 'poly-equations',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile rozwiązań rzeczywistych ma równanie $x^3 + 8 = 0$?`,
    answer: 1,
    verify: () => {
      // (x + 2)(x^2 - 2x + 4), wyroznik trojmianu: 4 - 16 < 0
      return 1 + (4 - 16 >= 0 ? 2 : 0);
    },
    hints: ['Który wzór skróconego mnożenia tu pasuje?', r`Suma sześcianów: $(x + 2)(x^2 - 2x + 4)$.`, r`Wyróżnik trójmianu: $4 - 16 < 0$.`, 'Ile rozwiązań daje sam czynnik liniowy?'],
    steps: [r`$(x + 2)(x^2 - 2x + 4) = 0$.`, r`Trójmian nie ma pierwiastków — jedno rozwiązanie: $x = -2$.`],
    errors: [['3', r`Uznano, że czynnik $x^2 - 2x + 4$ też ma pierwiastki.`, r`Jego wyróżnik jest ujemny.`]],
  }),
  numeric({
    id: 'w-eq-6',
    skill: 'poly-equations',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $2x^3 - 3x^2 - 3x + 2 = 0$. Podaj najmniejsze rozwiązanie.`,
    answer: -1,
    verify: () => Math.min(2, 0.5, -1),
    hints: ['Których kandydatów warto sprawdzić?', r`$W(2) = 16 - 12 - 6 + 2 = 0$.`, r`Podziel przez $(x - 2)$: iloraz $2x^2 + x - 1$.`, r`$2x^2 + x - 1 = (2x - 1)(x + 1)$.`],
    steps: [r`Rozwiązania: $2$, $\frac{1}{2}$, $-1$.`, r`Najmniejsze: $-1$.`],
    errors: [['0.5', 'Podane nie najmniejsze rozwiązanie.', r`Porównaj wszystkie trzy: $-1 < \frac12 < 2$.`]],
  }),
  numeric({
    id: 'w-eq-7',
    skill: 'poly-equations',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Objętość pudełka to $V(x) = x(10 - 2x)^2$, gdzie $x \in (0, 5)$. Dla ilu wartości $x$ z tego przedziału objętość wynosi $72$?`,
    answer: 2,
    verify: () => {
      // x^3 - 10x^2 + 25x - 18 = 0: x = 2 oraz x = 4 +- sqrt(7)
      return [2, 4 - Math.sqrt(7), 4 + Math.sqrt(7)].filter((x) => x > 0 && x < 5).length;
    },
    hints: ['Jakie równanie trzeba rozwiązać?', r`$x(10 - 2x)^2 = 72 \iff x^3 - 10x^2 + 25x - 18 = 0$.`, r`$x = 2$ jest pierwiastkiem — podziel przez $(x - 2)$.`, r`$x^2 - 8x + 9 = 0$ daje $x = 4 \pm \sqrt{7}$ — które należą do $(0, 5)$?`],
    steps: [r`Rozwiązania: $2$ oraz $4 \pm \sqrt{7}$.`, r`$4 + \sqrt{7} > 5$ odpada; zostają $2$ i $4 - \sqrt{7}$.`],
    errors: [['3', 'Nie sprawdzono dziedziny — jedno rozwiązanie leży poza przedziałem.', 'Wycięty kwadrat nie może mieć boku większego niż połowa boku kartki.']],
  }),
  numeric({
    id: 'w-eq-8',
    skill: 'poly-equations',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Rozwiąż równanie $x^4 - 2x^3 - x^2 + 2x = 0$. Podaj sumę kwadratów wszystkich rozwiązań.`,
    answer: 6,
    verify: () => [0, 2, 1, -1].reduce((s, x) => s + x * x, 0),
    hints: ['Co można wyłączyć przed nawias?', r`$x(x^3 - 2x^2 - x + 2) = 0$.`, r`Pogrupuj w nawiasie: $x^2(x - 2) - (x - 2)$.`, r`$x(x - 2)(x - 1)(x + 1) = 0$.`],
    steps: [r`Rozwiązania: $0, 2, 1, -1$.`, r`$0 + 4 + 1 + 1 = 6$.`],
    errors: [['5', r`Pominięty pierwiastek $-1$ z różnicy kwadratów.`, r`$x^2 - 1 = (x - 1)(x + 1)$ — dwa pierwiastki.`]],
  }),

  // poly-inequalities ---------------------------------------------------------
  numeric({
    id: 'w-inq-1',
    skill: 'poly-inequalities',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Ile liczb całkowitych spełnia nierówność $(x + 2)(x - 3) < 0$?`,
    answer: 4,
    verify: () => {
      let n = 0;
      for (let x = -50; x <= 50; x += 1) if ((x + 2) * (x - 3) < 0) n += 1;
      return n;
    },
    hints: ['Gdzie są pierwiastki?', r`$-2$ i $3$.`, 'Z prawej nad osią — gdzie jest pod osią?', r`Między $-2$ a $3$, bez końców.`],
    steps: [r`$x \in (-2, 3)$.`, r`Liczby: $-1, 0, 1, 2$ — cztery.`],
    errors: [['6', 'Włączone końce przedziału.', r`Przy $<$ pierwiastki nie spełniają nierówności.`]],
  }),
  numeric({
    id: 'w-inq-2',
    skill: 'poly-inequalities',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Podaj najmniejszą liczbę całkowitą dodatnią spełniającą nierówność $(x + 2)(x - 1)(x - 3) > 0$.`,
    answer: 4,
    verify: () => {
      for (let x = 1; x < 100; x += 1) if ((x + 2) * (x - 1) * (x - 3) > 0) return x;
      return NaN;
    },
    hints: ['Jaki jest zbiór rozwiązań?', r`$(-2, 1) \cup (3, +\infty)$.`, 'Które liczby dodatnie należą do tego zbioru?', r`W $(-2, 1)$ nie ma dodatnich całkowitych — zostaje $(3, +\infty)$.`],
    steps: [r`$x \in (-2, 1) \cup (3, +\infty)$.`, r`Najmniejsza dodatnia całkowita: $4$.`],
    errors: [['1', r`Wzięty koniec przedziału — dla $x = 1$ wyrażenie jest zerem.`, 'Nierówność ostra wyklucza pierwiastki.']],
  }),
  choice({
    id: 'w-inq-3',
    skill: 'poly-inequalities',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Zbiorem rozwiązań nierówności $(x + 2)(x - 1)(x - 3) > 0$ jest`,
    choices: [r`$(-2, 1) \cup (3, +\infty)$`, r`$(-\infty, -2) \cup (1, 3)$`, r`$(3, +\infty)$`, r`$\langle -2, 1 \rangle \cup \langle 3, +\infty)$`],
    answer: 'A',
    hints: ['Gdzie zaczyna się wężyk?', r`Z prawej nad osią — współczynnik przy $x^3$ jest dodatni.`, 'Przy każdym pojedynczym pierwiastku zmienia stronę.', r`Nad osią: $(-2, 1)$ i $(3, +\infty)$.`],
    steps: ['Wężyk: nad osią dla x > 3, pod na (1, 3), nad na (−2, 1), pod dla x < −2.', r`$x \in (-2, 1) \cup (3, +\infty)$.`],
    errors: [
      ['B', r`Odczytane przedziały dla $< 0$.`, 'Nad osią to wartości dodatnie.'],
      ['C', 'Pominięty przedział (−2, 1).', 'Wężyk wraca nad oś między −2 a 1.'],
      ['D', r`Włączone końce, choć nierówność jest ostra.`, r`Przy $>$ pierwiastki nie należą do rozwiązania.`],
    ],
  }),
  numeric({
    id: 'w-inq-4',
    skill: 'poly-inequalities',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych z przedziału $\langle -5, 5 \rangle$ spełnia nierówność $x^2(x - 4) < 0$?`,
    answer: 8,
    verify: () => {
      let n = 0;
      for (let x = -5; x <= 5; x += 1) if (x * x * (x - 4) < 0) n += 1;
      return n;
    },
    hints: ['Jakie są pierwiastki i ich krotności?', r`$0$ podwójny, $4$ pojedynczy.`, r`Wyrażenie ujemne dla $x < 4$, ale w $x = 0$ równe zero.`, r`Liczby od $-5$ do $3$ bez zera.`],
    steps: [r`$x < 4$ i $x \ne 0$.`, r`$-5, \ldots, -1, 1, 2, 3$ — osiem liczb.`],
    errors: [['9', r`Wliczone $x = 0$, gdzie wyrażenie równa się zero.`, 'Nierówność ostra wyklucza pierwiastek podwójny.']],
  }),
  numeric({
    id: 'w-inq-5',
    skill: 'poly-inequalities',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych z przedziału $\langle -3, 3 \rangle$ spełnia nierówność $x^3 - 4x \ge 0$?`,
    answer: 5,
    verify: () => {
      let n = 0;
      for (let x = -3; x <= 3; x += 1) if (x ** 3 - 4 * x >= 0) n += 1;
      return n;
    },
    hints: ['Jak rozłożyć lewą stronę?', r`$x(x - 2)(x + 2) \ge 0$.`, r`Wężyk: $\langle -2, 0 \rangle \cup \langle 2, +\infty)$.`, 'Które liczby z ⟨−3, 3⟩ należą do tego zbioru?'],
    steps: [r`$x \in \langle -2, 0 \rangle \cup \langle 2, +\infty)$.`, r`$-2, -1, 0, 2, 3$ — pięć liczb.`],
    errors: [['3', 'Pominięte pierwiastki, choć nierówność jest nieostra.', r`Przy $\ge$ pierwiastki należą do rozwiązania.`]],
  }),
  choice({
    id: 'w-inq-6',
    skill: 'poly-inequalities',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Zbiorem rozwiązań nierówności $(x - 1)^2(x + 3) \ge 0$ jest`,
    choices: [r`$\langle -3, +\infty)$`, r`$\langle -3, 1 \rangle$`, r`$\langle 1, +\infty)$`, r`$(-\infty, -3 \rangle \cup \{1\}$`],
    answer: 'A',
    hints: ['Jaki znak ma czynnik (x − 1)²?', 'Nigdy ujemny.', r`O znaku decyduje więc $(x + 3)$.`, r`$x + 3 \ge 0$ — a przy $x = 1$ całość jest zerem.`],
    steps: [r`$(x - 1)^2 \ge 0$ zawsze, więc wystarczy $x + 3 \ge 0$ (albo $x = 1$).`, r`$x \in \langle -3, +\infty)$.`],
    errors: [
      ['B', 'Zmiana znaku przy pierwiastku podwójnym.', 'Przy pierwiastku parzystej krotności wężyk się odbija.'],
      ['C', r`Pominięty przedział $\langle -3, 1)$.`, r`Dla $-3 < x < 1$ oba czynniki są nieujemne.`],
      ['D', 'Odwrócona nierówność.', 'Iloczyn jest nieujemny tam, gdzie x + 3 ≥ 0.'],
    ],
  }),
  numeric({
    id: 'w-inq-7',
    skill: 'poly-inequalities',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Dla ilu liczb całkowitych dodatnich $n$ zachodzi nierówność $n^3 - 10n^2 + 21n < 0$?`,
    answer: 3,
    verify: () => {
      let c = 0;
      for (let n = 1; n <= 100; n += 1) if (n ** 3 - 10 * n ** 2 + 21 * n < 0) c += 1;
      return c;
    },
    hints: ['Jak rozłożyć lewą stronę?', r`$n(n - 3)(n - 7) < 0$.`, r`Dla dodatnich $n$: kiedy $(n - 3)(n - 7) < 0$?`, r`$3 < n < 7$.`],
    steps: [r`$n(n - 3)(n - 7) < 0$, dla $n > 0$: $3 < n < 7$.`, r`$n \in \{4, 5, 6\}$ — trzy liczby.`],
    errors: [['5', r`Włączone $n = 3$ i $n = 7$, dla których wyrażenie jest zerem.`, 'Nierówność ostra wyklucza pierwiastki.']],
  }),
  numeric({
    id: 'w-inq-8',
    skill: 'poly-inequalities',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Rozwiąż nierówność $x^4 - 5x^2 + 4 \le 0$. Podaj sumę wszystkich liczb całkowitych, które ją spełniają.`,
    answer: 0,
    verify: () => {
      let s = 0;
      for (let x = -50; x <= 50; x += 1) if (x ** 4 - 5 * x ** 2 + 4 <= 0) s += x;
      return s;
    },
    hints: ['Jak rozłożyć lewą stronę?', r`$(x^2 - 1)(x^2 - 4) \le 0$.`, r`$1 \le x^2 \le 4$.`, r`$x \in \langle -2, -1 \rangle \cup \langle 1, 2 \rangle$.`],
    steps: [r`Liczby całkowite: $-2, -1, 1, 2$.`, r`Suma: $0$.`],
    errors: [['3', 'Uwzględnione tylko dodatnie rozwiązania.', r`$x^2 \le 4$ spełniają też liczby ujemne.`]],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const POLY_CARDS: Flashcard[] = [
  card('c-poly-bas-1', 'poly-basics', 'wzor', r`Suma współczynników wielomianu $W$?`, r`$W(1)$`),
  card('c-poly-bas-2', 'poly-basics', 'definicja', 'Stopień iloczynu wielomianów?', 'Suma ich stopni.'),

  card('c-poly-div-1', 'poly-division', 'wzor', r`Reszta z dzielenia $W(x)$ przez $(x - a)$?`, r`$W(a)$ — twierdzenie o reszcie.`),
  card('c-poly-div-2', 'poly-division', 'definicja', 'Twierdzenie Bézouta?', r`$a$ jest pierwiastkiem $W \iff W$ dzieli się przez $(x - a)$ bez reszty.`),
  card('c-poly-div-3', 'poly-division', 'pulapka', r`Dzielenie przez $(x + 3)$ — jakie $a$?`, r`$a = -3$.`),

  card('c-poly-root-1', 'poly-roots', 'metoda', 'Gdzie szukać pierwiastków całkowitych?', 'Wśród dzielników wyrazu wolnego (współczynniki całkowite).'),
  card('c-poly-root-2', 'poly-roots', 'definicja', 'Pierwiastek podwójny na wykresie?', 'Wykres dotyka osi i odbija się — nie zmienia znaku.'),

  card('c-poly-eq-1', 'poly-equations', 'metoda', 'Kolejność prób rozkładu wielomianu?', r`Wspólny czynnik → wzory → grupowanie → pierwiastek wymierny + Horner → podstawienie $t = x^2$.`),
  card('c-poly-eq-2', 'poly-equations', 'pulapka', r`Podstawienie $t = x^2$ — o czym pamiętać?`, r`$t \ge 0$: ujemne $t$ odrzucasz.`),

  card('c-poly-inq-1', 'poly-inequalities', 'metoda', 'Metoda wężyka?', 'Pierwiastki na osi; start z prawej (nad osią dla dodatniego współczynnika przy najwyższej potędze); zmiana strony przy krotności nieparzystej.'),
  card('c-poly-inq-2', 'poly-inequalities', 'pulapka', r`Czy pierwiastek podwójny należy do rozwiązania $\ge 0$?`, 'Tak — wyrażenie jest tam równe zero.'),
];

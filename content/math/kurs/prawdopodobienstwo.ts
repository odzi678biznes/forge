import type { Flashcard, GeometryFigure, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';
import { PROB_QUESTIONS, PROB_TOPIC } from '../prawdopodobienstwo';

/**
 * Dział 14: Kombinatoryka, prawdopodobieństwo i statystyka.
 *
 * Włącza do kursu trzy umiejętności z pierwszego wycinka treści (kombinatoryka,
 * model klasyczny, zdarzenia złożone) - z ich identyfikatorami i zadaniami -
 * i dopisuje prawdopodobieństwo warunkowe i całkowite, schemat Bernoulliego
 * oraz statystykę opisową.
 */

const r = String.raw;

export const PROB_COURSE_TOPIC: Topic = {
  ...PROB_TOPIC,
  name: 'Kombinatoryka, prawdopodobieństwo i statystyka',
  summary:
    'Reguła mnożenia, permutacje i kombinacje, model klasyczny, zdarzenia złożone, prawdopodobieństwo warunkowe, schemat Bernoulliego, średnia, mediana, dominanta.',
};

export const PROB_COURSE_SKILLS: Skill[] = [
  {
    id: 'prob-counting',
    topicId: 'math-probability',
    name: 'Kombinatoryka: reguła mnożenia, permutacje, kombinacje',
    level: 'PP',
    ckeRequirement: 'Kombinatoryka — reguła mnożenia i dodawania, permutacje, kombinacje',
    prerequisites: ['num-powers'],
    examValue: 0.7,
  },
  {
    id: 'prob-classic',
    topicId: 'math-probability',
    name: 'Prawdopodobieństwo klasyczne',
    level: 'PP',
    ckeRequirement: 'Prawdopodobieństwo — model klasyczny',
    prerequisites: ['prob-counting'],
    examValue: 0.8,
  },
  {
    id: 'prob-compound',
    topicId: 'math-probability',
    name: 'Zdarzenia złożone i przeciwne',
    level: 'PP',
    ckeRequirement: 'Prawdopodobieństwo — zdarzenie przeciwne, suma zdarzeń, losowanie bez zwracania',
    prerequisites: ['prob-classic'],
    examValue: 0.75,
  },
  {
    id: 'prob-conditional',
    topicId: 'math-probability',
    name: 'Prawdopodobieństwo warunkowe i całkowite',
    level: 'PR',
    ckeRequirement: 'Prawdopodobieństwo — prawdopodobieństwo warunkowe, twierdzenie o prawdopodobieństwie całkowitym, niezależność',
    prerequisites: ['prob-compound'],
    examValue: 0.7,
  },
  {
    id: 'prob-bernoulli',
    topicId: 'math-probability',
    name: 'Symbol Newtona i schemat Bernoulliego',
    level: 'PR',
    ckeRequirement: 'Prawdopodobieństwo — symbol Newtona, schemat Bernoulliego',
    prerequisites: ['prob-compound', 'prob-counting'],
    examValue: 0.6,
  },
  {
    id: 'stat-descriptive',
    topicId: 'math-probability',
    name: 'Statystyka: średnia, mediana, dominanta',
    level: 'PP',
    ckeRequirement: 'Statystyka — średnia arytmetyczna i ważona, mediana i dominanta (XII.2)',
    prerequisites: ['num-roots'],
    examValue: 0.55,
  },
];

// ===========================================================================
// Rysunki
// ===========================================================================

/** Drzewko: wybór urny rzutem monetą, potem losowanie kuli. */
const urnTree: GeometryFigure = {
  kind: 'geometry',
  alt: 'Drzewko: od startu dwie gałęzie po 1/2 do urny I i urny II. Z urny I: biała (b) z prawdopodobieństwem 3/5, czarna (c) 2/5. Z urny II: biała (b′) 1/5, czarna (c′) 4/5.',
  points: {
    Start: [0, 2], I: [2.5, 3.2], II: [2.5, 0.8],
    b: [5, 3.8], c: [5, 2.6], "b'": [5, 1.4], "c'": [5, 0.2],
  },
  segments: [
    { from: 'Start', to: 'I', label: '1/2' },
    { from: 'Start', to: 'II', label: '1/2' },
    { from: 'I', to: 'b', label: '3/5' },
    { from: 'I', to: 'c', label: '2/5' },
    { from: 'II', to: "b'", label: '1/5' },
    { from: 'II', to: "c'", label: '4/5' },
  ],
};

// ===========================================================================
// Lekcje
// ===========================================================================

export const PROB_LESSONS: Lesson[] = [
  {
    skillId: 'prob-counting',
    minutes: 14,
    intro:
      'Kombinatoryka to sztuka liczenia bez wypisywania. Prawie wszystko wynika z jednej reguły: jeśli pierwszą decyzję podejmujesz na a sposobów, a drugą na b, to obie razem — na a · b sposobów.',
    blocks: [
      f(r`n! = 1 \cdot 2 \cdot \ldots \cdot n \qquad \binom{n}{k} = \frac{n!}{k!\,(n - k)!}`),
      p(r`Permutacje ($n!$) — ustawienia wszystkich elementów w kolejności. Kombinacje ($\binom{n}{k}$) — wybory $k$ elementów, gdy kolejność NIE ma znaczenia. Gdy kolejność ma znaczenie i elementy się nie powtarzają, liczysz $n(n - 1)\ldots(n - k + 1)$.`),
      tip('Zadaj sobie dwa pytania: czy kolejność ma znaczenie? czy elementy mogą się powtarzać? Odpowiedzi wskazują wzór.'),
      warn('Przy liczbach pierwsza cyfra nie może być zerem. Zacznij liczenie od pozycji z największą liczbą ograniczeń.'),
    ],
    examples: [
      example(
        r`Ile jest liczb trzycyfrowych o różnych cyfrach, utworzonych z cyfr $1, 2, 3, 4, 5$?`,
        [r`Kolejność ma znaczenie, cyfry się nie powtarzają.`, r`$5 \cdot 4 \cdot 3 = 60$.`],
        r`$60$`,
      ),
      example(
        r`Na ile sposobów można wybrać $3$-osobową delegację z $5$ osób?`,
        [r`Kolejność nie ma znaczenia — kombinacje.`, r`$\binom{5}{3} = \frac{5 \cdot 4}{2} = 10$.`],
        r`$10$`,
      ),
    ],
    pitfalls: ['Kombinacje tam, gdzie kolejność ma znaczenie (i odwrotnie).', 'Zero na pierwszym miejscu liczby.', 'Dodawanie zamiast mnożenia przy kolejnych wyborach.'],
  },
  {
    skillId: 'prob-classic',
    minutes: 12,
    intro:
      'W modelu klasycznym wszystkie wyniki są jednakowo prawdopodobne. Prawdopodobieństwo to wtedy po prostu ułamek: ile wyników sprzyja zdarzeniu, przez ile jest wszystkich.',
    blocks: [
      f(r`P(A) = \frac{|A|}{|\Omega|}`, 'Ω — zbiór wszystkich wyników'),
      p(r`Przy dwóch kostkach $|\Omega| = 36$ — kostki traktujesz jako rozróżnialne, nawet jeśli wyglądają tak samo. Wynik $(1, 6)$ i $(6, 1)$ to dwa różne wyniki.`),
      tip('Tabelka 6 × 6 dla dwóch kostek to najpewniejszy sposób liczenia sprzyjających wyników.'),
      warn(r`Prawdopodobieństwo zawsze leży w $\langle 0, 1 \rangle$. Wynik $\frac{7}{5}$ oznacza pomyłkę w liczeniu.`),
    ],
    examples: [
      example(
        r`Rzucamy dwiema kostkami. Jakie jest prawdopodobieństwo, że suma oczek wyniesie $7$?`,
        [r`Sprzyjające: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ — sześć.`, r`$P = \frac{6}{36} = \frac16$.`],
        r`$\frac16$`,
      ),
      example(
        r`Z liczb od $1$ do $100$ losujemy jedną. Jakie jest prawdopodobieństwo, że jest podzielna przez $3$ lub przez $5$?`,
        [r`Przez $3$: $33$; przez $5$: $20$; przez obie (przez $15$): $6$.`, r`$P = \frac{33 + 20 - 6}{100} = 0{,}47$.`],
        r`$0{,}47$`,
      ),
    ],
    pitfalls: ['Kostki potraktowane jako nierozróżnialne (21 wyników zamiast 36).', 'Część wspólna policzona dwa razy.', 'Wynik większy od 1.'],
  },
  {
    skillId: 'prob-compound',
    minutes: 12,
    intro:
      'Często łatwiej policzyć, kiedy coś NIE zachodzi. Zdarzenie przeciwne i wzór na sumę zdarzeń to dwa narzędzia, które skracają rachunki o połowę.',
    blocks: [
      f(r`P(A') = 1 - P(A) \qquad P(A \cup B) = P(A) + P(B) - P(A \cap B)`),
      p(r`„Co najmniej jeden” — licz przez zdarzenie przeciwne: „ani jednego”. Przy losowaniu bez zwracania po każdym losowaniu zmienia się liczba elementów w urnie.`),
      tip(r`Drzewko: prawdopodobieństwa wzdłuż gałęzi mnożysz, a wyniki różnych gałęzi — dodajesz.`),
      warn('Losowanie bez zwracania: w drugim losowaniu mianownik jest o 1 mniejszy.'),
    ],
    examples: [
      example(
        r`Rzucamy kostką dwa razy. Jakie jest prawdopodobieństwo, że co najmniej raz wypadnie szóstka?`,
        [r`Przeciwne: ani razu szóstki — $\frac56 \cdot \frac56 = \frac{25}{36}$.`, r`$P = 1 - \frac{25}{36} = \frac{11}{36}$.`],
        r`$\frac{11}{36}$`,
      ),
      example(
        r`W urnie $3$ kule białe i $2$ czarne. Losujemy dwie bez zwracania. Jakie jest prawdopodobieństwo, że obie są białe?`,
        [r`$\frac35 \cdot \frac24$.`, r`$= \frac{6}{20} = 0{,}3$.`],
        r`$0{,}3$`,
      ),
    ],
    pitfalls: ['„Co najmniej jeden” liczone bezpośrednio z pominięciem przypadków.', 'Część wspólna nieodjęta w sumie zdarzeń.', 'Losowanie bez zwracania liczone jak ze zwracaniem.'],
  },
  {
    skillId: 'prob-conditional',
    minutes: 14,
    intro:
      'Prawdopodobieństwo warunkowe odpowiada na pytanie: jak zmienia się szansa, gdy już coś wiemy? Informacja „wynik jest parzysty” zawęża świat możliwych wyników — i od tego nowego świata liczysz.',
    blocks: [
      f(r`P(A \mid B) = \frac{P(A \cap B)}{P(B)} \qquad A, B \text{ niezależne} \iff P(A \cap B) = P(A) \cdot P(B)`),
      { kind: 'figure', figure: urnTree, caption: 'Prawdopodobieństwo całkowite: suma iloczynów wzdłuż gałęzi, które kończą się białą kulą.' },
      f(r`P(A) = P(A \mid B_1)P(B_1) + P(A \mid B_2)P(B_2)`, 'twierdzenie o prawdopodobieństwie całkowitym'),
      tip(r`Pytanie „skoro wylosowano białą, jakie jest prawdopodobieństwo, że z urny I?” to $P(B_1 \mid A)$ — gałąź przez urnę I podzielona przez całe $P(A)$.`),
      warn(r`$P(A \mid B) \ne P(B \mid A)$. Kolejność w zapisie ma znaczenie: po kresce stoi to, co już wiemy.`),
    ],
    examples: [
      example(
        r`Rzucamy kostką. Wiadomo, że wypadła liczba parzysta. Jakie jest prawdopodobieństwo, że to szóstka?`,
        [r`Nowy świat: $\{2, 4, 6\}$ — trzy wyniki.`, r`$P = \frac13$.`],
        r`$\frac13$`,
      ),
      example(
        r`Urna wybrana rzutem monetą: I ($3$ białe, $2$ czarne) lub II ($1$ biała, $4$ czarne). Jakie jest prawdopodobieństwo wylosowania białej?`,
        [r`$\frac12 \cdot \frac35 + \frac12 \cdot \frac15$.`, r`$= \frac{3}{10} + \frac{1}{10} = \frac25$.`],
        r`$\frac25$`,
      ),
    ],
    pitfalls: [r`$P(A \mid B)$ pomylone z $P(A \cap B)$.`, 'Pominięte prawdopodobieństwa wyboru gałęzi w drzewku.', 'Niezależność założona bez sprawdzenia.'],
  },
  {
    skillId: 'prob-bernoulli',
    minutes: 12,
    intro:
      'Schemat Bernoulliego to powtarzanie tej samej próby z dwoma wynikami — sukces albo porażka — niezależnie od siebie. Rzuty monetą, strzały do tarczy, kontrola jakości.',
    blocks: [
      f(r`P(S_n = k) = \binom{n}{k} p^k (1 - p)^{n - k}`, 'k sukcesów w n próbach, p — prawdopodobieństwo sukcesu'),
      p(r`Symbol $\binom{n}{k}$ liczy, na ile sposobów można rozmieścić $k$ sukcesów wśród $n$ prób. Dwa trafienia w czterech strzałach mogą paść w $\binom42 = 6$ różnych kolejnościach.`),
      tip(r`„Co najmniej jeden sukces” znów przez przeciwne: $1 - (1 - p)^n$.`),
      warn(r`Nie pomijaj $\binom{n}{k}$. Sam iloczyn $p^k(1 - p)^{n-k}$ to prawdopodobieństwo jednej konkretnej kolejności.`),
    ],
    examples: [
      example(
        r`Rzucamy monetą $4$ razy. Jakie jest prawdopodobieństwo dokładnie dwóch orłów?`,
        [r`$\binom42 \left(\frac12\right)^2 \left(\frac12\right)^2$.`, r`$= 6 \cdot \frac{1}{16} = \frac38$.`],
        r`$\frac38$`,
      ),
      example(
        r`Ile razy trzeba rzucić monetą, żeby prawdopodobieństwo co najmniej jednego orła przekroczyło $0{,}99$?`,
        [r`$1 - \left(\frac12\right)^n > 0{,}99 \iff \left(\frac12\right)^n < 0{,}01$.`, r`$\frac{1}{64} > 0{,}01$, $\frac{1}{128} < 0{,}01$ — potrzeba $7$ rzutów.`],
        r`$7$`,
      ),
    ],
    pitfalls: [r`Pominięty symbol Newtona $\binom{n}{k}$.`, r`Pomylone $p$ z $1 - p$.`, 'Próby, które nie są niezależne, potraktowane jak schemat Bernoulliego.'],
  },
  {
    skillId: 'stat-descriptive',
    minutes: 12,
    intro:
      'Statystyka opisuje dane kilkoma liczbami: gdzie jest „środek” danych (średnia, mediana) i co pojawia się najczęściej (dominanta). Na maturze dane bywają podane w tabeli liczebności — trzeba umieć z niej liczyć.',
    blocks: [
      f(r`\bar{x} = \frac{x_1 + \ldots + x_n}{n} \qquad \bar{x}_w = \frac{w_1x_1 + \ldots + w_nx_n}{w_1 + \ldots + w_n}`),
      p('Mediana to środkowa wartość po UPORZĄDKOWANIU danych. Przy parzystej liczbie danych — średnia dwóch środkowych. Dominanta to wartość występująca najczęściej.'),
      p(r`Tabela liczebności: wartość $x_i$ pojawia się $n_i$ razy. Średnia to $\frac{n_1x_1 + n_2x_2 + \ldots}{n_1 + n_2 + \ldots}$ — średnia ważona, w której wagami są liczebności. Medianę znajdziesz, licząc, na którym miejscu leży środkowa obserwacja.`),
      tip('Mediana jest odporna na skrajne wartości: jedna ogromna pensja podnosi średnią, ale nie medianę.'),
      warn('Nie licz mediany z nieuporządkowanych danych. Najpierw ustaw je rosnąco.'),
    ],
    examples: [
      example(
        r`W klasie $20$ uczniów: $4$ ma ocenę $2$, $6$ — ocenę $3$, $7$ — ocenę $4$, $3$ — ocenę $5$. Wyznacz medianę ocen.`,
        [r`Środkowe są obserwacje $10.$ i $11.$ (po uporządkowaniu).`, r`Miejsca $1$–$4$: ocena $2$, miejsca $5$–$10$: ocena $3$, miejsca $11$–$17$: ocena $4$ — mediana $\frac{3 + 4}{2} = 3{,}5$.`],
        r`$3{,}5$`,
      ),
      example(
        r`Oceny: $5$ (waga $3$), $4$ (waga $2$), $3$ (waga $1$). Oblicz średnią ważoną.`,
        [r`$\frac{15 + 8 + 3}{6} = \frac{26}{6}$.`, r`$\approx 4{,}33$.`],
        r`$\frac{13}{3}$`,
      ),
    ],
    pitfalls: ['Mediana z nieuporządkowanych danych.', 'Mediana wzięta jako środkowa wartość z tabeli zamiast środkowej obserwacji.', 'Średnia ważona dzielona przez liczbę ocen zamiast sumy wag.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const NEW_QUESTIONS: Question[] = [
  // prob-counting (dopisane) --------------------------------------------------
  numeric({
    id: 'pr-cnt-1',
    skill: 'prob-counting',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Masz $3$ koszulki i $4$ pary spodni. Ile różnych zestawów koszulka + spodnie możesz ułożyć?`,
    answer: 12,
    verify: () => 3 * 4,
    hints: ['Na ile sposobów wybierzesz koszulkę, a na ile spodnie?', r`Koszulkę na $3$, spodnie na $4$.`, 'Reguła mnożenia: każdą koszulkę łączysz z każdymi spodniami.', r`$3 \cdot 4$.`],
    steps: [r`$3 \cdot 4$.`, r`$= 12$.`],
    errors: [['7', 'Liczby dodane zamiast pomnożone.', 'Dwa kolejne wybory — reguła mnożenia.']],
  }),
  numeric({
    id: 'pr-cnt-2',
    skill: 'prob-counting',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile jest liczb dwucyfrowych, których obie cyfry są nieparzyste?`,
    answer: 25,
    verify: () => {
      let c = 0;
      for (let n = 10; n < 100; n += 1) if ((Math.floor(n / 10) % 2) * (n % 2) === 1) c += 1;
      return c;
    },
    hints: ['Ile jest cyfr nieparzystych?', r`Pięć: $1, 3, 5, 7, 9$.`, 'Czy cyfry mogą się powtarzać?', r`Tak — $5$ możliwości na każdej pozycji.`],
    steps: [r`$5 \cdot 5$.`, r`$= 25$.`],
    errors: [['20', 'Założone różne cyfry.', 'Treść nie zabrania powtórzeń — 11, 33 też się liczą.']],
  }),
  numeric({
    id: 'pr-cnt-3',
    skill: 'prob-counting',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Na ile sposobów można posadzić $5$ osób w jednym rzędzie, jeśli Ania i Bartek chcą siedzieć obok siebie?`,
    answer: 48,
    verify: () => {
      const perm = (a: number[]): number[][] =>
        a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((q) => [x, ...q]));
      return perm([0, 1, 2, 3, 4]).filter((q) => Math.abs(q.indexOf(0) - q.indexOf(1)) === 1).length;
    },
    hints: ['Jak potraktować parę, która musi siedzieć razem?', 'Jako jeden „blok”.', r`Blok i trzy pozostałe osoby: $4!$ ustawień.`, 'W bloku Ania i Bartek mogą się zamienić miejscami.'],
    steps: [r`$4! \cdot 2$.`, r`$= 48$.`],
    errors: [['24', 'Pominięta zamiana miejsc w bloku.', 'AB i BA to różne ustawienia.']],
  }),
  numeric({
    id: 'pr-cnt-4',
    skill: 'prob-counting',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile jest liczb pięciocyfrowych, których suma cyfr jest równa $3$?`,
    answer: 15,
    verify: () => {
      let c = 0;
      for (let n = 10000; n < 100000; n += 1) {
        let s = 0;
        let m = n;
        while (m > 0) {
          s += m % 10;
          m = Math.floor(m / 10);
        }
        if (s === 3) c += 1;
      }
      return c;
    },
    hints: ['Jakie układy cyfr dają sumę 3?', r`$3$; $2 + 1$; $1 + 1 + 1$ — reszta to zera.`, 'Pierwsza cyfra nie może być zerem — rozważ, co stoi na pierwszym miejscu.', r`Pierwsza cyfra $3$, $2$ albo $1$ — policz rozmieszczenia reszty na czterech pozostałych miejscach.`],
    steps: [r`Pierwsza $3$: $1$; pierwsza $2$: $4$ (gdzie jedynka); pierwsza $1$: $4$ (gdzie dwójka) $+ \binom42 = 6$ (gdzie dwie jedynki).`, r`$1 + 4 + 4 + 6 = 15$.`],
    errors: [['35', 'Dopuszczone zero na pierwszym miejscu.', 'Liczba pięciocyfrowa nie zaczyna się od zera.']],
  }),

  // prob-classic (dopisane) ---------------------------------------------------
  numeric({
    id: 'pr-cl-1',
    skill: 'prob-classic',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Z liczb $1, 2, \ldots, 20$ losujemy jedną. Jakie jest prawdopodobieństwo, że jest podzielna przez $5$?`,
    answer: 0.2,
    variants: ['1/5', '4/20'],
    verify: () => [5, 10, 15, 20].length / 20,
    hints: ['Ile jest wszystkich wyników?', r`$20$.`, 'Wypisz liczby podzielne przez 5.', r`$5, 10, 15, 20$.`],
    steps: [r`$|A| = 4$, $|\Omega| = 20$.`, r`$P = \frac{4}{20} = \frac15$.`],
    errors: [['4', 'Podana liczba sprzyjających wyników zamiast prawdopodobieństwa.', 'Prawdopodobieństwo to ułamek |A| / |Ω|.']],
  }),
  numeric({
    id: 'pr-cl-2',
    skill: 'prob-classic',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rzucamy dwiema kostkami. Jakie jest prawdopodobieństwo, że suma oczek wyniesie $11$?`,
    answer: '1/18',
    variants: ['2/36', '0.0556'],
    tolerance: 0.0005,
    verify: () => 2 / 36,
    hints: ['Ile jest wszystkich wyników przy dwóch kostkach?', r`$36$.`, 'Jakie pary dają sumę 11?', r`$(5, 6)$ i $(6, 5)$.`],
    steps: [r`$|A| = 2$.`, r`$P = \frac{2}{36} = \frac{1}{18}$.`],
    errors: [['1/36', r`Policzona tylko para $(5, 6)$.`, r`$(5, 6)$ i $(6, 5)$ to dwa różne wyniki.`]],
  }),
  numeric({
    id: 'pr-cl-3',
    skill: 'prob-classic',
    kind: 'typical',
    difficulty: 4,
    prompt: r`W grupie jest $6$ kobiet i $4$ mężczyzn. Losujemy dwie osoby. Jakie jest prawdopodobieństwo, że obie są kobietami?`,
    answer: '1/3',
    variants: ['15/45', '0.333', '0.3333'],
    tolerance: 0.001,
    verify: () => (6 * 5) / 2 / ((10 * 9) / 2),
    hints: ['Na ile sposobów można wybrać dwie osoby z dziesięciu?', r`$\binom{10}{2} = 45$.`, r`A dwie kobiety z sześciu: $\binom62$.`, 'Podziel.'],
    steps: [r`$\binom62 = 15$.`, r`$P = \frac{15}{45} = \frac13$.`],
    errors: [['0.36', r`Losowanie ze zwracaniem: $0{,}6^2$.`, 'Wybieramy dwie różne osoby — bez zwracania.']],
  }),
  numeric({
    id: 'pr-cl-4',
    skill: 'prob-classic',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Losujemy jedną liczbę ze zbioru $\{1, 2, \ldots, 100\}$. Jakie jest prawdopodobieństwo, że jest podzielna przez $3$ lub przez $5$?`,
    answer: 0.47,
    variants: ['47/100'],
    verify: () => {
      let c = 0;
      for (let n = 1; n <= 100; n += 1) if (n % 3 === 0 || n % 5 === 0) c += 1;
      return c / 100;
    },
    hints: ['Ile liczb jest podzielnych przez 3, a ile przez 5?', r`$33$ i $20$.`, 'Które liczby policzyłeś dwa razy?', r`Podzielne przez $15$ — jest ich $6$.`],
    steps: [r`$|A| = 33 + 20 - 6 = 47$.`, r`$P = 0{,}47$.`],
    errors: [['0.53', 'Część wspólna nieodjęta.', r`$|A \cup B| = |A| + |B| - |A \cap B|$.`]],
  }),

  // prob-compound (dopisane) --------------------------------------------------
  numeric({
    id: 'pr-cp-1',
    skill: 'prob-compound',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`$P(A) = 0{,}3$. Oblicz prawdopodobieństwo zdarzenia przeciwnego $A'$.`,
    answer: 0.7,
    verify: () => 1 - 0.3,
    tolerance: 1e-9,
    hints: ['Ile wynosi suma prawdopodobieństw zdarzenia i przeciwnego?', r`$1$.`, r`$P(A') = 1 - P(A)$.`, 'Odejmij.'],
    steps: [r`$1 - 0{,}3$.`, r`$= 0{,}7$.`],
    errors: [['0.3', 'Podane P(A) zamiast P(A′).', r`$P(A') = 1 - P(A)$.`]],
  }),
  numeric({
    id: 'pr-cp-2',
    skill: 'prob-compound',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`$P(A) = 0{,}5$, $P(B) = 0{,}4$, $P(A \cap B) = 0{,}2$. Oblicz $P(A \cup B)$.`,
    answer: 0.7,
    verify: () => 0.5 + 0.4 - 0.2,
    tolerance: 1e-9,
    hints: ['Jaki wzór opisuje prawdopodobieństwo sumy zdarzeń?', r`$P(A \cup B) = P(A) + P(B) - P(A \cap B)$.`, r`$0{,}5 + 0{,}4 - 0{,}2$.`, 'Policz.'],
    steps: [r`$0{,}9 - 0{,}2$.`, r`$= 0{,}7$.`],
    errors: [['0.9', 'Część wspólna nieodjęta.', 'Wyniki wspólne policzyłbyś dwa razy.']],
  }),
  numeric({
    id: 'pr-cp-3',
    skill: 'prob-compound',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rzucamy monetą trzy razy. Jakie jest prawdopodobieństwo, że wypadnie co najmniej jeden orzeł?`,
    answer: 0.875,
    variants: ['7/8'],
    verify: () => 1 - 0.5 ** 3,
    hints: ['Jakie zdarzenie jest przeciwne do „co najmniej jeden orzeł”?', '„Same reszki”.', r`$P(\text{same reszki}) = \left(\frac12\right)^3$.`, 'Odejmij od jedynki.'],
    steps: [r`$1 - \frac18$.`, r`$= \frac78$.`],
    errors: [['0.375', 'Policzone „dokładnie jeden orzeł”.', '„Co najmniej jeden” to jeden, dwa albo trzy.']],
  }),
  numeric({
    id: 'pr-cp-4',
    skill: 'prob-compound',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W urnie są $4$ kule białe i $6$ czarnych. Losujemy $3$ kule bez zwracania. Jakie jest prawdopodobieństwo, że wśród nich jest co najmniej jedna biała?`,
    answer: '5/6',
    variants: ['0.833', '0.8333', '100/120'],
    tolerance: 0.001,
    verify: () => 1 - (6 * 5 * 4) / (10 * 9 * 8),
    hints: ['Jakie zdarzenie jest przeciwne?', '„Wszystkie trzy czarne”.', r`$P(\text{trzy czarne}) = \frac{\binom63}{\binom{10}{3}}$.`, r`$\binom63 = 20$, $\binom{10}{3} = 120$.`],
    steps: [r`$P(\text{trzy czarne}) = \frac{20}{120} = \frac16$.`, r`$P = 1 - \frac16 = \frac56$.`],
    errors: [['1/6', 'Podane prawdopodobieństwo zdarzenia przeciwnego.', 'Na końcu odejmij od jedynki.']],
  }),

  // prob-conditional ----------------------------------------------------------
  numeric({
    id: 'pr-cd-1',
    skill: 'prob-conditional',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`$P(A \cap B) = 0{,}2$ oraz $P(B) = 0{,}5$. Oblicz $P(A \mid B)$.`,
    answer: 0.4,
    variants: ['2/5'],
    verify: () => 0.2 / 0.5,
    tolerance: 1e-9,
    hints: ['Jaki jest wzór na prawdopodobieństwo warunkowe?', r`$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$.`, r`$\frac{0{,}2}{0{,}5}$.`, 'Podziel.'],
    steps: [r`$\frac{0{,}2}{0{,}5}$.`, r`$= 0{,}4$.`],
    errors: [['0.1', 'Pomnożone zamiast podzielone.', 'Prawdopodobieństwo warunkowe to iloraz.']],
  }),
  numeric({
    id: 'pr-cd-2',
    skill: 'prob-conditional',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rzucamy kostką. Wiadomo, że wypadła liczba parzysta. Jakie jest prawdopodobieństwo, że wypadła szóstka?`,
    answer: '1/3',
    variants: ['0.333', '0.3333'],
    tolerance: 0.001,
    verify: () => 1 / 3,
    hints: ['Jakie wyniki są możliwe, skoro wiadomo, że wypadła liczba parzysta?', r`$2, 4, 6$.`, 'Ile z nich to szóstka?', 'Jeden z trzech.'],
    steps: [r`Nowy zbiór wyników: $\{2, 4, 6\}$.`, r`$P = \frac13$.`],
    errors: [['1/6', 'Pominięta informacja o parzystości.', 'Warunek zawęża zbiór możliwych wyników.']],
  }),
  choice({
    id: 'pr-cd-3',
    skill: 'prob-conditional',
    kind: 'typical',
    difficulty: 2,
    prompt: r`$P(A) = 0{,}5$ i $P(B) = 0{,}4$. Zdarzenia $A$ i $B$ są niezależne wtedy i tylko wtedy, gdy $P(A \cap B)$ jest równe`,
    choices: [r`$0{,}2$`, r`$0{,}9$`, r`$0{,}1$`, r`$0{,}45$`],
    answer: 'A',
    verify: () => 0.5 * 0.4,
    hints: ['Jaka jest definicja niezależności zdarzeń?', r`$P(A \cap B) = P(A) \cdot P(B)$.`, r`$0{,}5 \cdot 0{,}4$.`, 'Pomnóż.'],
    steps: [r`$0{,}5 \cdot 0{,}4 = 0{,}2$.`, 'Niezależne dokładnie wtedy, gdy P(A ∩ B) = 0,2.'],
    errors: [
      ['B', 'Prawdopodobieństwa dodane.', 'Niezależność to iloczyn, nie suma.'],
      ['C', 'Policzona różnica.', 'Niezależność: P(A ∩ B) = P(A) · P(B).'],
      ['D', 'Policzona średnia.', 'Niezależność: P(A ∩ B) = P(A) · P(B).'],
    ],
  }),
  numeric({
    id: 'pr-cd-4',
    skill: 'prob-conditional',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rzucamy dwiema kostkami. Wiadomo, że na pierwszej wypadła liczba parzysta. Jakie jest prawdopodobieństwo, że suma oczek wynosi $8$?`,
    answer: '1/6',
    variants: ['3/18', '0.1667'],
    tolerance: 0.001,
    verify: () => {
      let b = 0;
      let ab = 0;
      for (let i = 1; i <= 6; i += 1)
        for (let j = 1; j <= 6; j += 1)
          if (i % 2 === 0) {
            b += 1;
            if (i + j === 8) ab += 1;
          }
      return ab / b;
    },
    hints: ['Ile wyników spełnia warunek?', r`Pierwsza parzysta: $3 \cdot 6 = 18$.`, 'Które z nich dają sumę 8?', r`$(2, 6)$, $(4, 4)$, $(6, 2)$.`],
    steps: [r`$P = \frac{3}{18}$.`, r`$= \frac16$.`],
    errors: [['5/36', 'Pominięty warunek — policzone P(suma 8) wśród wszystkich 36 wyników.', 'Po warunku zostaje 18 wyników.']],
  }),
  numeric({
    id: 'pr-cd-5',
    skill: 'prob-conditional',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rodzina ma dwoje dzieci. Wiadomo, że co najmniej jedno z nich jest chłopcem. Jakie jest prawdopodobieństwo, że oboje są chłopcami? (Przyjmij, że każda płeć jest jednakowo prawdopodobna.)`,
    answer: '1/3',
    variants: ['0.333', '0.3333'],
    tolerance: 0.001,
    verify: () => 1 / 3,
    hints: ['Jakie są wszystkie możliwości dla dwojga dzieci?', 'CC, CD, DC, DD.', 'Które spełniają warunek „co najmniej jeden chłopiec”?', 'CC, CD, DC — trzy.'],
    steps: [r`Warunek: $\{CC, CD, DC\}$.`, r`$P(CC) = \frac13$.`],
    errors: [['1/2', 'CD i DC potraktowane jako jeden wynik.', 'Starsze i młodsze dziecko to różne pozycje.']],
  }),
  numeric({
    id: 'pr-cd-6',
    skill: 'prob-conditional',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rzucamy monetą: orzeł — losujemy kulę z urny I ($3$ białe, $2$ czarne), reszka — z urny II ($1$ biała, $4$ czarne). Jakie jest prawdopodobieństwo wylosowania kuli białej?`,
    figure: urnTree,
    answer: 0.4,
    variants: ['2/5'],
    verify: () => 0.5 * (3 / 5) + 0.5 * (1 / 5),
    tolerance: 1e-9,
    hints: ['Którymi gałęziami drzewka dochodzisz do białej kuli?', 'Przez urnę I i przez urnę II.', r`Wzdłuż gałęzi mnożysz: $\frac12 \cdot \frac35$ oraz $\frac12 \cdot \frac15$.`, 'Wyniki gałęzi dodajesz.'],
    steps: [r`$\frac{3}{10} + \frac{1}{10}$.`, r`$= \frac25$.`],
    errors: [['0.8', r`Pominięte prawdopodobieństwa wyboru urny $\frac12$.`, 'Każdą gałąź mnożysz od samego startu drzewka.']],
  }),
  numeric({
    id: 'pr-cd-7',
    skill: 'prob-conditional',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Maszyna A wytwarza $60\%$ produktów, a maszyna B — $40\%$. Wśród produktów A wadliwych jest $2\%$, wśród produktów B — $5\%$. Jakie jest prawdopodobieństwo, że losowy produkt jest wadliwy?`,
    answer: 0.032,
    verify: () => 0.6 * 0.02 + 0.4 * 0.05,
    tolerance: 1e-9,
    hints: ['Z jakich dwóch dróg może pochodzić wadliwy produkt?', 'Z maszyny A albo z maszyny B.', r`$0{,}6 \cdot 0{,}02 + 0{,}4 \cdot 0{,}05$.`, 'Policz każdy iloczyn i dodaj.'],
    steps: [r`$0{,}012 + 0{,}020$.`, r`$= 0{,}032$.`],
    errors: [['0.07', 'Dodane procenty wadliwych bez wag produkcji.', 'Każdą gałąź mnożysz przez udział maszyny.']],
  }),
  numeric({
    id: 'pr-cd-8',
    skill: 'prob-conditional',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W sytuacji z poprzedniego zadania (A: $60\%$ produkcji, $2\%$ wadliwych; B: $40\%$, $5\%$ wadliwych) wylosowany produkt okazał się wadliwy. Jakie jest prawdopodobieństwo, że wyprodukowała go maszyna A?`,
    answer: 0.375,
    variants: ['3/8'],
    verify: () => (0.6 * 0.02) / (0.6 * 0.02 + 0.4 * 0.05),
    tolerance: 1e-9,
    hints: ['Jakie prawdopodobieństwo warunkowe jest tu szukane?', r`$P(A \mid W)$ — wiemy już, że produkt jest wadliwy.`, r`$P(A \mid W) = \frac{P(A \cap W)}{P(W)}$.`, r`Licznik: $0{,}6 \cdot 0{,}02$; mianownik — z poprzedniego zadania.`],
    steps: [r`$\frac{0{,}012}{0{,}032}$.`, r`$= 0{,}375$.`],
    errors: [['0.6', 'Podany udział maszyny A w produkcji.', 'Informacja o wadzie zmienia to prawdopodobieństwo.']],
  }),

  // prob-bernoulli ------------------------------------------------------------
  numeric({
    id: 'pr-bn-1',
    skill: 'prob-bernoulli',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\binom{6}{2}$.`,
    answer: 15,
    verify: () => (6 * 5) / 2,
    hints: ['Jak rozpisać symbol Newtona?', r`$\binom{n}{k} = \frac{n!}{k!(n - k)!}$.`, r`$\frac{6 \cdot 5}{1 \cdot 2}$ — reszta się skraca.`, 'Policz.'],
    steps: [r`$\frac{30}{2}$.`, r`$= 15$.`],
    errors: [['30', r`Pominięte dzielenie przez $2!$.`, 'Kolejność wybranych elementów nie ma znaczenia — dzielisz przez k!.']],
  }),
  numeric({
    id: 'pr-bn-2',
    skill: 'prob-bernoulli',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $\binom{7}{3}$.`,
    answer: 35,
    verify: () => (7 * 6 * 5) / 6,
    hints: ['Ile czynników zostaje w liczniku po skróceniu?', 'Trzy: 7 · 6 · 5.', r`Mianownik: $3! = 6$.`, r`$\frac{210}{6}$.`],
    steps: [r`$\frac{7 \cdot 6 \cdot 5}{6}$.`, r`$= 35$.`],
    errors: [['210', r`Pominięte dzielenie przez $3!$.`, r`$\binom{n}{k}$ dzieli przez $k!$.`]],
  }),
  choice({
    id: 'pr-bn-3',
    skill: 'prob-bernoulli',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Która liczba jest równa $\binom{10}{3}$?`,
    choices: [r`$\binom{10}{7}$`, r`$\binom{10}{4}$`, r`$\binom{7}{3}$`, r`$10 \cdot 3$`],
    answer: 'A',
    hints: ['Jaka symetria zachodzi dla symbolu Newtona?', r`$\binom{n}{k} = \binom{n}{n - k}$.`, r`$10 - 3 = 7$.`, 'Wybrać 3 to to samo, co wybrać 7, które zostaną.'],
    steps: [r`$\binom{10}{3} = \binom{10}{7} = 120$.`, 'Pozostałe mają inne wartości.'],
    errors: [
      ['B', r`$\binom{10}{4} = 210$.`, r`Symetria: $k \leftrightarrow n - k$.`],
      ['C', r`$\binom73 = 35$.`, 'Zmiana n zmienia wynik.'],
      ['D', 'Symbol Newtona to nie iloczyn n · k.', r`$\binom{10}{3} = 120$.`],
    ],
  }),
  numeric({
    id: 'pr-bn-4',
    skill: 'prob-bernoulli',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rzucamy monetą $4$ razy. Jakie jest prawdopodobieństwo wyrzucenia dokładnie dwóch orłów?`,
    answer: 0.375,
    variants: ['3/8', '6/16'],
    verify: () => (6 * 0.5 ** 4),
    hints: ['Ile jest prób i jakie jest p?', r`$n = 4$, $p = \frac12$, $k = 2$.`, r`$\binom42 \left(\frac12\right)^2\left(\frac12\right)^2$.`, r`$\binom42 = 6$.`],
    steps: [r`$6 \cdot \frac{1}{16}$.`, r`$= \frac38$.`],
    errors: [['0.0625', r`Pominięty $\binom42$.`, 'Dwa orły mogą wypaść w sześciu różnych kolejnościach.']],
  }),
  numeric({
    id: 'pr-bn-5',
    skill: 'prob-bernoulli',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rzucamy kostką $3$ razy. Jakie jest prawdopodobieństwo, że szóstka wypadnie dokładnie raz?`,
    answer: '25/72',
    variants: ['75/216', '0.347', '0.3472'],
    tolerance: 0.001,
    verify: () => 3 * (1 / 6) * (5 / 6) ** 2,
    hints: ['Jakie jest prawdopodobieństwo sukcesu?', r`$p = \frac16$, $n = 3$, $k = 1$.`, r`$\binom31 \cdot \frac16 \cdot \left(\frac56\right)^2$.`, 'Policz.'],
    steps: [r`$3 \cdot \frac16 \cdot \frac{25}{36} = \frac{75}{216}$.`, r`$= \frac{25}{72}$.`],
    errors: [['25/216', r`Pominięty czynnik $\binom31 = 3$.`, 'Szóstka może wypaść w pierwszym, drugim albo trzecim rzucie.']],
  }),
  numeric({
    id: 'pr-bn-6',
    skill: 'prob-bernoulli',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Strzelec trafia do celu z prawdopodobieństwem $0{,}8$. Oddaje $5$ niezależnych strzałów. Jakie jest prawdopodobieństwo, że trafi co najmniej $4$ razy? (Podaj wynik dokładny w postaci dziesiętnej.)`,
    answer: 0.73728,
    tolerance: 1e-6,
    verify: () => 5 * 0.8 ** 4 * 0.2 + 0.8 ** 5,
    hints: ['Jakie przypadki obejmuje „co najmniej 4”?', 'Dokładnie 4 albo dokładnie 5 trafień.', r`$\binom54 \cdot 0{,}8^4 \cdot 0{,}2 + 0{,}8^5$.`, r`$0{,}8^4 = 0{,}4096$.`],
    steps: [r`$5 \cdot 0{,}4096 \cdot 0{,}2 = 0{,}4096$; $0{,}8^5 = 0{,}32768$.`, r`Suma: $0{,}73728$.`],
    errors: [['0.4096', 'Policzone tylko „dokładnie 4”.', '„Co najmniej 4” obejmuje też 5 trafień.']],
  }),
  numeric({
    id: 'pr-bn-7',
    skill: 'prob-bernoulli',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Ile rzutów monetą trzeba wykonać, żeby prawdopodobieństwo wyrzucenia co najmniej jednego orła było większe od $0{,}99$? Podaj najmniejszą taką liczbę.`,
    answer: 7,
    verify: () => {
      let n = 1;
      while (1 - 0.5 ** n <= 0.99) n += 1;
      return n;
    },
    hints: ['Jak zapisać prawdopodobieństwo „co najmniej jednego orła” w n rzutach?', r`$1 - \left(\frac12\right)^n$.`, r`$\left(\frac12\right)^n < 0{,}01$.`, r`Porównaj kolejne potęgi dwójki ze $100$.`],
    steps: [r`$2^6 = 64 < 100$, $2^7 = 128 > 100$.`, r`Najmniej $7$ rzutów.`],
    errors: [['6', r`Przyjęte $\frac{1}{64} < 0{,}01$.`, r`$\frac{1}{64} \approx 0{,}0156 > 0{,}01$.`]],
  }),
  numeric({
    id: 'pr-bn-8',
    skill: 'prob-bernoulli',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Każdy z $10$ uczniów niezależnie zdaje egzamin z prawdopodobieństwem $0{,}9$. Jakie jest prawdopodobieństwo, że zdadzą wszyscy albo wszyscy oprócz jednego? (Podaj wynik z dokładnością do $0{,}001$.)`,
    answer: 0.736,
    tolerance: 0.001,
    verify: () => 0.9 ** 10 + 10 * 0.9 ** 9 * 0.1,
    hints: ['Jakie dwa przypadki trzeba zsumować?', 'Dokładnie 10 sukcesów i dokładnie 9 sukcesów.', r`$0{,}9^{10} + \binom{10}{9} \cdot 0{,}9^9 \cdot 0{,}1$.`, r`$0{,}9^9 \approx 0{,}3874$, $0{,}9^{10} \approx 0{,}3487$.`],
    steps: [r`$0{,}3487 + 10 \cdot 0{,}3874 \cdot 0{,}1 = 0{,}3487 + 0{,}3874$.`, r`$\approx 0{,}736$.`],
    errors: [['0.387', r`Policzone tylko „dokładnie 9”.`, 'Trzeba dodać przypadek, w którym zdają wszyscy.']],
  }),

  // stat-descriptive ----------------------------------------------------------
  numeric({
    id: 'pr-st-1',
    skill: 'stat-descriptive',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz średnią arytmetyczną liczb $2, 4, 6, 8$.`,
    answer: 5,
    verify: () => (2 + 4 + 6 + 8) / 4,
    hints: ['Jak liczysz średnią arytmetyczną?', 'Suma liczb podzielona przez ich liczbę.', r`$\frac{2 + 4 + 6 + 8}{4}$.`, 'Policz.'],
    steps: [r`$\frac{20}{4}$.`, r`$= 5$.`],
    errors: [['20', 'Podana suma zamiast średniej.', 'Sumę dzielisz przez liczbę danych.']],
  }),
  numeric({
    id: 'pr-st-2',
    skill: 'stat-descriptive',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Wyznacz medianę danych $3, 7, 1, 9, 5$.`,
    answer: 5,
    verify: () => [3, 7, 1, 9, 5].sort((a, b) => a - b)[2] ?? NaN,
    hints: ['Co trzeba zrobić z danymi przed wyznaczeniem mediany?', 'Uporządkować rosnąco.', r`$1, 3, 5, 7, 9$.`, 'Weź środkową.'],
    steps: [r`Uporządkowane: $1, 3, 5, 7, 9$.`, r`Mediana: $5$.`],
    errors: [['1', 'Środkowa z nieuporządkowanej listy.', 'Najpierw ustaw dane rosnąco.']],
  }),
  numeric({
    id: 'pr-st-3',
    skill: 'stat-descriptive',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wyznacz medianę danych $2, 8, 4, 6$.`,
    answer: 5,
    verify: () => (4 + 6) / 2,
    hints: ['Ile jest danych — parzyście czy nieparzyście?', 'Cztery — parzyście.', r`Uporządkowane: $2, 4, 6, 8$; środkowe to $4$ i $6$.`, 'Weź ich średnią.'],
    steps: [r`$\frac{4 + 6}{2}$.`, r`$= 5$.`],
    errors: [['4', 'Wzięta tylko jedna ze środkowych wartości.', 'Przy parzystej liczbie danych mediana to średnia dwóch środkowych.']],
  }),
  choice({
    id: 'pr-st-4',
    skill: 'stat-descriptive',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Dominanta danych $3, 5, 5, 2, 7, 5, 2$ jest równa`,
    choices: [r`$5$`, r`$2$`, r`$4$`, r`$7$`],
    answer: 'A',
    verify: () => 5,
    hints: ['Czym jest dominanta?', 'Wartością, która występuje najczęściej.', 'Policz wystąpienia każdej liczby.', r`$5$ — trzy razy, $2$ — dwa razy.`],
    steps: [r`$5$ występuje trzy razy.`, 'Dominanta: 5.'],
    errors: [
      ['B', r`$2$ występuje dwa razy — rzadziej niż $5$.`, 'Dominanta to wartość najczęstsza.'],
      ['C', 'Pomylona dominanta ze średnią.', 'Dominanta to wartość najczęstsza.'],
      ['D', 'Wybrana największa wartość.', 'Dominanta to wartość najczęstsza.'],
    ],
  }),
  numeric({
    id: 'pr-st-5',
    skill: 'stat-descriptive',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Uczeń ma oceny: $5$ z wagą $3$, $4$ z wagą $2$ i $3$ z wagą $1$. Oblicz średnią ważoną (z dokładnością do $0{,}01$).`,
    answer: '13/3',
    variants: ['4.33'],
    tolerance: 0.005,
    verify: () => (5 * 3 + 4 * 2 + 3 * 1) / (3 + 2 + 1),
    hints: ['Jaki jest wzór na średnią ważoną?', 'Suma iloczynów ocen i wag podzielona przez sumę wag.', r`$\frac{5 \cdot 3 + 4 \cdot 2 + 3 \cdot 1}{3 + 2 + 1}$.`, 'Policz licznik i mianownik.'],
    steps: [r`$\frac{26}{6}$.`, r`$\approx 4{,}33$.`],
    errors: [['4', 'Policzona zwykła średnia bez wag.', 'Każda ocena liczy się tyle razy, ile wynosi jej waga.']],
  }),
  numeric({
    id: 'pr-st-6',
    skill: 'stat-descriptive',
    kind: 'typical',
    difficulty: 4,
    prompt: r`W ankiecie $20$ uczniów podało liczbę rodzeństwa: $0$ — $5$ osób, $1$ — $8$ osób, $2$ — $5$ osób, $3$ — $2$ osoby. O ile średnia liczba rodzeństwa jest większa od mediany?`,
    answer: 0.2,
    variants: ['1/5'],
    tolerance: 1e-9,
    verify: () => {
      const data = [...Array(5).fill(0), ...Array(8).fill(1), ...Array(5).fill(2), ...Array(2).fill(3)] as number[];
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const median = ((data[9] ?? 0) + (data[10] ?? 0)) / 2;
      return mean - median;
    },
    hints: ['Jak policzyć średnią z tabeli liczebności?', 'Każdą wartość mnożysz przez liczbę osób, sumujesz i dzielisz przez wszystkich.', r`Mediana: obserwacje nr $10$ i $11$ — w której grupie wypadają?`, 'Policz obie wielkości i odejmij.'],
    steps: [r`Średnia: $\frac{0 + 8 + 10 + 6}{20} = 1{,}2$; mediana: miejsca $6$–$13$ to wartość $1$, więc mediana $1$.`, r`Różnica: $0{,}2$.`],
    errors: [['1.2', 'Podana średnia zamiast różnicy.', 'Pytanie dotyczy różnicy średniej i mediany.']],
  }),
  numeric({
    id: 'pr-st-7',
    skill: 'stat-descriptive',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Średnia wieku $25$ uczniów klasy wynosi $17{,}2$ roku. Po doliczeniu wieku wychowawcy średnia wzrosła do $18$ lat. Ile lat ma wychowawca?`,
    answer: 38,
    verify: () => 26 * 18 - 25 * 17.2,
    tolerance: 1e-9,
    hints: ['Jaka jest suma wieku uczniów?', r`$25 \cdot 17{,}2$.`, r`Suma wieku wszystkich $26$ osób: $26 \cdot 18$.`, 'Odejmij sumy.'],
    steps: [r`$468 - 430$.`, r`$= 38$ lat.`],
    errors: [['18', 'Podana nowa średnia.', 'Wiek wychowawcy to różnica sum, nie średnia.']],
  }),
  numeric({
    id: 'pr-st-8',
    skill: 'stat-descriptive',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dane to $2, 4, 7, x$, gdzie $x > 7$. Średnia arytmetyczna tych danych jest równa ich medianie. Wyznacz $x$.`,
    answer: 9,
    variants: ['x=9'],
    verify: () => 4 * ((4 + 7) / 2) - (2 + 4 + 7),
    hints: ['Jaka jest mediana, skoro x > 7?', r`Dane uporządkowane: $2, 4, 7, x$ — mediana to średnia $4$ i $7$.`, r`Średnia: $\frac{13 + x}{4}$.`, 'Przyrównaj średnią do mediany.'],
    steps: [r`$\frac{13 + x}{4} = \frac{11}{2}$.`, r`$13 + x = 22 \Rightarrow x = 9$.`],
    errors: [['5.5', 'Podana mediana zamiast x.', 'Z równości średniej i mediany wyznacz x.']],
  }),
];

export const PROB_COURSE_QUESTIONS: Question[] = [...PROB_QUESTIONS, ...NEW_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const PROB_CARDS: Flashcard[] = [
  card('c-prb-cnt-1', 'prob-counting', 'wzor', 'Symbol Newtona?', r`$\binom{n}{k} = \frac{n!}{k!(n - k)!}$`),
  card('c-prb-cnt-2', 'prob-counting', 'metoda', 'Permutacje, kombinacje — jak wybrać?', 'Czy kolejność ma znaczenie? Tak — mnożenie kolejnych wyborów. Nie — kombinacje.'),

  card('c-prb-cl-1', 'prob-classic', 'wzor', 'Prawdopodobieństwo klasyczne?', r`$P(A) = \frac{|A|}{|\Omega|}$`),
  card('c-prb-cl-2', 'prob-classic', 'pulapka', 'Ile wyników przy dwóch kostkach?', r`$36$ — kostki są rozróżnialne.`),

  card('c-prb-cp-1', 'prob-compound', 'wzor', 'Zdarzenie przeciwne i suma zdarzeń?', r`$P(A') = 1 - P(A)$; $P(A \cup B) = P(A) + P(B) - P(A \cap B)$`),
  card('c-prb-cp-2', 'prob-compound', 'metoda', '„Co najmniej jeden” — jak liczyć?', 'Przez zdarzenie przeciwne: 1 − P(ani jednego).'),

  card('c-prb-cd-1', 'prob-conditional', 'wzor', 'Prawdopodobieństwo warunkowe?', r`$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$`),
  card('c-prb-cd-2', 'prob-conditional', 'wzor', 'Prawdopodobieństwo całkowite?', r`$P(A) = \sum P(A \mid B_i) P(B_i)$ — suma iloczynów wzdłuż gałęzi.`),

  card('c-prb-bn-1', 'prob-bernoulli', 'wzor', 'Schemat Bernoulliego: k sukcesów w n próbach?', r`$\binom{n}{k} p^k (1 - p)^{n - k}$`),
  card('c-prb-bn-2', 'prob-bernoulli', 'pulapka', r`Czy można pominąć $\binom{n}{k}$?`, 'Nie — bez niego liczysz tylko jedną kolejność sukcesów.'),

  card('c-prb-st-1', 'stat-descriptive', 'definicja', 'Mediana?', 'Środkowa wartość UPORZĄDKOWANYCH danych; przy parzystej liczbie — średnia dwóch środkowych.'),
  card('c-prb-st-2', 'stat-descriptive', 'metoda', 'Mediana z tabeli liczebności?', 'Ustal numer środkowej obserwacji (albo dwóch) i sprawdź, w której wartości wypada, sumując liczebności po kolei.'),
];

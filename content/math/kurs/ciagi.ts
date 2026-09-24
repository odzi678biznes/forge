import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';
import { SEQUENCE_QUESTIONS, SEQUENCE_TOPIC } from '../ciagi';

/**
 * Dział 9: Ciągi.
 *
 * Włącza do kursu trzy umiejętności z pierwszego wycinka treści (ciąg
 * arytmetyczny, geometryczny, granica) - z ich identyfikatorami i zadaniami -
 * i dopisuje podstawy ciągów, zadania łączące oba rodzaje ciągów oraz szereg
 * geometryczny.
 */

const r = String.raw;

export const SEQ_TOPIC: Topic = {
  ...SEQUENCE_TOPIC,
  summary:
    'Wzór ogólny i rekurencyjny, monotoniczność, ciąg arytmetyczny i geometryczny, zastosowania, granica i szereg geometryczny.',
};

export const SEQ_SKILLS: Skill[] = [
  {
    id: 'seq-basics',
    topicId: 'math-sequences',
    name: 'Ciąg liczbowy: wzór, wyrazy, monotoniczność',
    level: 'PP',
    ckeRequirement: 'Ciągi — wyrazy ciągu danego wzorem ogólnym i rekurencyjnym, monotoniczność',
    prerequisites: ['fn-basics', 'ineq-linear'],
    examValue: 0.5,
  },
  {
    id: 'seq-arithmetic',
    topicId: 'math-sequences',
    name: 'Ciąg arytmetyczny',
    level: 'PP',
    ckeRequirement: 'Ciągi — wzór ogólny i suma ciągu arytmetycznego',
    prerequisites: ['seq-basics'],
    examValue: 0.75,
  },
  {
    id: 'seq-geometric',
    topicId: 'math-sequences',
    name: 'Ciąg geometryczny',
    level: 'PP',
    ckeRequirement: 'Ciągi — wzór ogólny i suma ciągu geometrycznego',
    prerequisites: ['seq-arithmetic', 'num-powers'],
    examValue: 0.75,
  },
  {
    id: 'seq-mixed',
    topicId: 'math-sequences',
    name: 'Ciągi w zadaniach: własności i zastosowania',
    level: 'PP',
    ckeRequirement: 'Ciągi — własności ciągów arytmetycznych i geometrycznych, zadania w kontekście praktycznym',
    prerequisites: ['seq-geometric', 'quad-discriminant'],
    examValue: 0.7,
  },
  {
    id: 'seq-limit',
    topicId: 'math-sequences',
    name: 'Granica ciągu',
    level: 'PR',
    ckeRequirement: 'Ciągi — granica ciągu liczbowego',
    prerequisites: ['seq-basics', 'alg-rational'],
    examValue: 0.6,
  },
  {
    id: 'seq-series',
    topicId: 'math-sequences',
    name: 'Szereg geometryczny',
    level: 'PR',
    ckeRequirement: 'Ciągi — suma szeregu geometrycznego, warunek zbieżności, zastosowania',
    prerequisites: ['seq-geometric', 'seq-limit'],
    examValue: 0.6,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const SEQ_LESSONS: Lesson[] = [
  {
    skillId: 'seq-basics',
    minutes: 10,
    intro:
      r`Ciąg to ponumerowana lista liczb: pierwszy wyraz, drugi, trzeci… Formalnie to funkcja, której argumentami są liczby naturalne $1, 2, 3, \ldots$ — dlatego wszystko, co wiesz o funkcjach, działa też tutaj.`,
    blocks: [
      p(r`Wzór ogólny podaje $n$-ty wyraz od razu: dla $a_n = 3n - 2$ mamy $a_1 = 1$, $a_2 = 4$, $a_{10} = 28$.`),
      p(r`Wzór rekurencyjny podaje pierwszy wyraz i przepis na następny: $a_1 = 2$, $a_{n+1} = 3a_n - 1$ daje $2, 5, 14, 41, \ldots$ — każdy wyraz liczysz z poprzedniego.`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Wyrazy ciągu a_n = 3n − 2 jako osobne punkty: (1, 1), (2, 4), (3, 7), (4, 10), (5, 13). Punkty nie są połączone linią.',
          x: [0, 6],
          y: [-1, 15],
          points: [{ at: [1, 1] }, { at: [2, 4] }, { at: [3, 7] }, { at: [4, 10] }, { at: [5, 13] }],
        },
        caption: 'Wykres ciągu to osobne punkty — między wyrazami nie ma nic.',
      },
      f(r`a_{n+1} - a_n > 0 \Rightarrow \text{rosnący} \qquad a_{n+1} - a_n < 0 \Rightarrow \text{malejący}`),
      tip(r`Pytanie „który wyraz jest równy 25?” to równanie $a_n = 25$. Rozwiązanie musi być liczbą naturalną — inaczej żaden wyraz nie jest równy 25.`),
    ],
    examples: [
      example(
        r`Który wyraz ciągu $a_n = 2n + 5$ jest równy $25$?`,
        [r`$2n + 5 = 25 \Rightarrow n = 10$.`, r`$n = 10$ jest naturalne, więc to dziesiąty wyraz.`],
        r`$a_{10}$`,
      ),
      example(
        r`Zbadaj monotoniczność ciągu $a_n = 5 - 2n$.`,
        [r`$a_{n+1} - a_n = 5 - 2(n + 1) - (5 - 2n)$.`, r`$= -2 < 0$ — ciąg jest malejący.`],
        'malejący',
      ),
    ],
    pitfalls: [r`Wynik $n$ niecałkowity albo ujemny uznany za numer wyrazu.`, r`$a_{n+1}$ policzone jako $a_n + 1$.`, 'Pomylenie wartości wyrazu z jego numerem.'],
  },
  {
    skillId: 'seq-arithmetic',
    minutes: 12,
    intro:
      r`Ciąg arytmetyczny to ciąg, w którym każdy kolejny wyraz powstaje przez dodanie tej samej liczby $r$ — różnicy. Schody o równych stopniach.`,
    blocks: [
      f(r`a_n = a_1 + (n - 1)r \qquad S_n = \frac{a_1 + a_n}{2} \cdot n`),
      p(r`Suma to średnia pierwszego i ostatniego wyrazu razy liczba wyrazów. Tak młody Gauss dodał $1 + 2 + \ldots + 100$: sto wyrazów o średniej $50{,}5$.`),
      f(r`b = \frac{a + c}{2}`, 'a, b, c — kolejne wyrazy: środkowy to średnia sąsiadów'),
      tip(r`Wyrazy symetryczne mają równe sumy: $a_2 + a_8 = a_3 + a_7 = 2a_5$. Często oszczędza to całe równanie.`),
      warn(r`W wzorze na $a_n$ jest $(n - 1)r$, nie $nr$: od pierwszego do piątego wyrazu są cztery kroki.`),
    ],
    examples: [
      example(
        r`$a_3 = 11$, $a_7 = 27$. Oblicz $r$ i $a_1$.`,
        [r`Między $a_3$ a $a_7$ są $4$ kroki: $4r = 16$, $r = 4$.`, r`$a_1 = a_3 - 2r = 3$.`],
        r`$r = 4$, $a_1 = 3$`,
      ),
      example(
        r`Oblicz sumę dziesięciu początkowych wyrazów, gdy $a_1 = 2$, $r = 5$.`,
        [r`$a_{10} = 2 + 9 \cdot 5 = 47$.`, r`$S_{10} = \frac{2 + 47}{2} \cdot 10 = 245$.`],
        r`$245$`,
      ),
    ],
    pitfalls: [r`$nr$ zamiast $(n - 1)r$.`, 'Suma bez dzielenia przez 2.', 'Zła liczba kroków między dwoma wyrazami.'],
  },
  {
    skillId: 'seq-geometric',
    minutes: 12,
    intro:
      r`W ciągu geometrycznym każdy kolejny wyraz powstaje przez pomnożenie przez tę samą liczbę $q$ — iloraz. To dyskretna wersja funkcji wykładniczej.`,
    blocks: [
      f(r`a_n = a_1 \cdot q^{\,n - 1} \qquad S_n = a_1 \cdot \frac{1 - q^n}{1 - q}\ \ (q \ne 1)`),
      f(r`b^2 = a \cdot c`, 'a, b, c — kolejne wyrazy ciągu geometrycznego'),
      p(r`Ujemny iloraz daje ciąg naprzemienny: $3, -6, 12, -24, \ldots$ Dla $q = 1$ ciąg jest stały i $S_n = n \cdot a_1$.`),
      warn(r`Z $b^2 = ac$ dostajesz dwa znaki $b$. Jeśli zadanie mówi o wyrazach dodatnich, ujemny odrzucasz — jeśli nie mówi, oba mogą być dobre.`),
    ],
    examples: [
      example(
        r`$a_1 = 2$, $q = 3$. Podaj $a_4$.`,
        [r`$a_4 = 2 \cdot 3^3$.`, r`$= 54$.`],
        r`$54$`,
      ),
      example(
        r`Wyrazy dodatnie, $a_2 = 6$, $a_4 = 24$. Podaj $q$.`,
        [r`$a_4 = a_2 \cdot q^2 \Rightarrow q^2 = 4$.`, r`Wyrazy dodatnie, więc $q = 2$.`],
        r`$q = 2$`,
      ),
    ],
    pitfalls: [r`Wykładnik $n$ zamiast $n - 1$.`, r`Zgubione ujemne $q$ przy $q^2 = \ldots$`, 'Warunek ciągu geometrycznego pomylony z arytmetycznym.'],
  },
  {
    skillId: 'seq-mixed',
    minutes: 12,
    intro:
      'Na maturze ciągi rzadko występują same. Typowe zadanie: trzy liczby tworzą ciąg arytmetyczny, a po zmianie — geometryczny. Albo raty kredytu, oszczędzanie, odbijająca się piłka. Kluczem jest zamiana słów na równania z warunkami ciągów.',
    blocks: [
      p(r`Trzy kolejne wyrazy arytmetyczne zapisuj symetrycznie: $b - r$, $b$, $b + r$. Suma to wtedy $3b$ — jedna niewiadoma znika od razu.`),
      f(r`\text{arytmetyczny: } 2b = a + c \qquad \text{geometryczny: } b^2 = ac`),
      tip('Wzrost o stałą kwotę to ciąg arytmetyczny. Wzrost o stały procent to ciąg geometryczny.'),
      warn('Liczba rat albo tygodni musi być naturalna. Ujemne rozwiązanie równania kwadratowego odrzucasz z uzasadnieniem.'),
    ],
    examples: [
      example(
        r`Liczby $x - 1$, $x + 1$, $2x + 5$ tworzą ciąg arytmetyczny. Wyznacz $x$.`,
        [r`$2(x + 1) = (x - 1) + (2x + 5)$.`, r`$2x + 2 = 3x + 4 \Rightarrow x = -2$.`, 'Sprawdzenie: −3, −1, 1 — różnica 2.'],
        r`$x = -2$`,
      ),
      example(
        r`Oszczędzasz: w pierwszym tygodniu $10$ zł, w każdym kolejnym o $5$ zł więcej. Ile odłożysz przez $8$ tygodni?`,
        [r`Ciąg arytmetyczny: $a_1 = 10$, $r = 5$, $a_8 = 45$.`, r`$S_8 = \frac{10 + 45}{2} \cdot 8 = 220$ zł.`],
        r`$220$ zł`,
      ),
    ],
    pitfalls: ['Stały procent potraktowany jak stała kwota.', 'Ujemna liczba rat pozostawiona w odpowiedzi.', 'Brak sprawdzenia, czy znalezione liczby naprawdę tworzą ciąg.'],
  },
  {
    skillId: 'seq-limit',
    minutes: 12,
    intro:
      r`Granica ciągu to liczba, do której wyrazy zbliżają się dowolnie blisko, gdy $n$ rośnie. $\frac{1}{n}$: $1, \frac12, \frac13, \ldots$ — coraz bliżej zera, więc granica wynosi $0$.`,
    blocks: [
      f(r`\lim_{n \to \infty} \frac{1}{n} = 0 \qquad \lim_{n \to \infty} q^n = 0 \ \text{dla } |q| < 1`),
      p(r`Przy ilorazie wielomianów dziel licznik i mianownik przez najwyższą potęgę $n$ z mianownika. Wtedy każdy wyraz typu $\frac{c}{n}$ znika.`),
      f(r`\lim \frac{2n^2 - n}{5n^2 + 3} = \lim \frac{2 - \frac1n}{5 + \frac{3}{n^2}} = \frac{2}{5}`),
      tip('Stopień licznika mniejszy od stopnia mianownika — granica 0. Równe stopnie — iloraz współczynników przy najwyższych potęgach.'),
      warn(r`Różnica typu $\sqrt{n^2 + 4n} - n$ to „nieskończoność minus nieskończoność” — nie zero. Pomnóż i podziel przez sumę $\sqrt{n^2 + 4n} + n$.`),
    ],
    examples: [
      example(
        r`Oblicz $\lim \frac{3n + 1}{n + 2}$.`,
        [r`Dzielę przez $n$: $\frac{3 + \frac1n}{1 + \frac2n}$.`, r`$\to \frac{3}{1} = 3$.`],
        r`$3$`,
      ),
      example(
        r`Oblicz $\lim \left(\sqrt{n^2 + 4n} - n\right)$.`,
        [
          r`Mnożę przez sprzężenie: $\frac{4n}{\sqrt{n^2 + 4n} + n}$.`,
          r`Dzielę przez $n$: $\frac{4}{\sqrt{1 + \frac4n} + 1} \to \frac{4}{2} = 2$.`,
        ],
        r`$2$`,
      ),
    ],
    pitfalls: ['Iloraz współczynników przy różnych potęgach.', 'Nieskończoność minus nieskończoność uznane za zero.', 'Dzielenie tylko licznika przez n.'],
  },
  {
    skillId: 'seq-series',
    minutes: 12,
    intro:
      r`Czy nieskończenie wiele liczb może mieć skończoną sumę? Tak — jeśli maleją wystarczająco szybko. $1 + \frac12 + \frac14 + \ldots$ nigdy nie przekroczy $2$, a do dwójki zbliża się dowolnie blisko.`,
    blocks: [
      f(r`S = \frac{a_1}{1 - q}, \qquad \text{gdy } |q| < 1`, 'suma szeregu geometrycznego'),
      p(r`Dla $|q| \ge 1$ szereg nie ma sumy (jest rozbieżny): wyrazy nie maleją do zera.`),
      {
        kind: 'figure',
        figure: {
          kind: 'geometry',
          alt: 'Kwadrat o boku 4, w nim kwadrat o wierzchołkach w środkach boków, a w nim kolejny taki kwadrat. Pola maleją dwukrotnie.',
          points: {
            A: [0, 0], B: [4, 0], C: [4, 4], D: [0, 4],
            E: [2, 0], F: [4, 2], G: [2, 4], H: [0, 2],
            I: [3, 1], J: [3, 3], K: [1, 3], L: [1, 1],
          },
          polygons: [{ vertices: ['A', 'B', 'C', 'D'] }, { vertices: ['E', 'F', 'G', 'H'] }, { vertices: ['I', 'J', 'K', 'L'] }],
          hidePointLabels: true,
        },
        caption: 'Pola kolejnych kwadratów: 16, 8, 4, … — szereg o ilorazie ½.',
      },
      tip(r`Ułamek okresowy to szereg: $0{,}(27) = \frac{27}{100} + \frac{27}{10000} + \ldots = \frac{27}{99}$.`),
      warn(r`W równaniach z szeregiem zawsze dopisz warunek $|q| < 1$ i sprawdź go na końcu — tak jak dziedzinę.`),
    ],
    examples: [
      example(
        r`Oblicz $8 + 4 + 2 + \ldots$`,
        [r`$a_1 = 8$, $q = \frac12$, $|q| < 1$.`, r`$S = \frac{8}{1 - \frac12} = 16$.`],
        r`$16$`,
      ),
      example(
        r`Suma szeregu $1 + x + x^2 + \ldots$ wynosi $3$. Oblicz $x$.`,
        [r`$\frac{1}{1 - x} = 3$, warunek $|x| < 1$.`, r`$1 - x = \frac13 \Rightarrow x = \frac23$ — spełnia warunek.`],
        r`$x = \frac23$`,
      ),
    ],
    pitfalls: [r`Wzór na sumę użyty dla $|q| \ge 1$.`, 'Brak sprawdzenia warunku zbieżności w równaniu.', r`Zły pierwszy wyraz (np. $x$ zamiast $1$).`],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const NEW_QUESTIONS: Question[] = [
  // seq-basics ----------------------------------------------------------------
  numeric({
    id: 's-bas-1',
    skill: 'seq-basics',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Ciąg jest określony wzorem $a_n = 3n - 2$. Oblicz $a_5$.`,
    answer: 13,
    verify: () => 3 * 5 - 2,
    hints: [r`Co trzeba wstawić w miejsce $n$?`, r`$n = 5$.`, r`$a_5 = 3 \cdot 5 - 2$.`, 'Policz.'],
    steps: [r`$a_5 = 15 - 2$.`, r`$= 13$.`],
    errors: [['15', 'Pominięte odjęcie 2.', 'Wstawiasz n do całego wzoru.']],
  }),
  numeric({
    id: 's-bas-2',
    skill: 'seq-basics',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Który wyraz ciągu $a_n = 2n + 5$ jest równy $25$? Podaj jego numer $n$.`,
    answer: 10,
    verify: () => (25 - 5) / 2,
    hints: ['Jakie równanie trzeba rozwiązać?', r`$a_n = 25$, czyli $2n + 5 = 25$.`, r`$2n = 20$.`, 'Podziel przez 2.'],
    steps: [r`$2n + 5 = 25 \Rightarrow n = 10$.`, 'To dziesiąty wyraz.'],
    errors: [['55', r`Policzone $a_{25}$ zamiast rozwiązania $a_n = 25$.`, 'Szukasz numeru n, dla którego wyraz ma wartość 25.']],
  }),
  numeric({
    id: 's-bas-3',
    skill: 'seq-basics',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Ciąg jest określony rekurencyjnie: $a_1 = 2$, $a_{n+1} = 3a_n - 1$. Oblicz $a_3$.`,
    answer: 14,
    verify: () => {
      let a = 2;
      for (let n = 1; n < 3; n += 1) a = 3 * a - 1;
      return a;
    },
    hints: ['Z czego liczysz kolejny wyraz?', r`Z poprzedniego: najpierw $a_2$, potem $a_3$.`, r`$a_2 = 3 \cdot 2 - 1$.`, r`$a_3 = 3 \cdot a_2 - 1$.`],
    steps: [r`$a_2 = 5$.`, r`$a_3 = 3 \cdot 5 - 1 = 14$.`],
    errors: [['5', r`Podane $a_2$ zamiast $a_3$.`, 'Trzeci wyraz wymaga dwóch kroków rekurencji.']],
  }),
  choice({
    id: 's-bas-4',
    skill: 'seq-basics',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Który z ciągów jest rosnący?',
    choices: [r`$a_n = 2n - 7$`, r`$a_n = -3n + 1$`, r`$a_n = (-1)^n$`, r`$a_n = 5 - n^2$`],
    answer: 'A',
    hints: ['Jak sprawdzić, czy ciąg rośnie?', r`Zbadaj znak $a_{n+1} - a_n$.`, r`Dla $2n - 7$: różnica wynosi $2$.`, 'Sprawdź pozostałe tak samo.'],
    steps: [r`$a_{n+1} - a_n = 2 > 0$ dla $2n - 7$.`, 'Pozostałe maleją albo skaczą.'],
    errors: [
      ['B', 'Pomylony znak współczynnika.', r`$-3n$ maleje — różnica wynosi $-3$.`],
      ['C', 'Ciąg naprzemienny uznany za rosnący.', r`$(-1)^n$ skacze: $-1, 1, -1, \ldots$`],
      ['D', r`Pomylone $n^2$ z czynnikiem rosnącym.`, r`$5 - n^2$: $4, 1, -4, \ldots$ — maleje.`],
    ],
  }),
  numeric({
    id: 's-bas-5',
    skill: 'seq-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile wyrazów ciągu $a_n = n^2 - 10n$ jest ujemnych?`,
    answer: 9,
    verify: () => {
      let c = 0;
      for (let n = 1; n <= 100; n += 1) if (n * n - 10 * n < 0) c += 1;
      return c;
    },
    hints: ['Jaką nierówność trzeba rozwiązać?', r`$n^2 - 10n < 0 \iff n(n - 10) < 0$.`, r`$0 < n < 10$ — ale $n$ musi być naturalne.`, 'Policz liczby naturalne w tym przedziale.'],
    steps: [r`$n \in \{1, 2, \ldots, 9\}$.`, 'Dziewięć wyrazów.'],
    errors: [['10', r`Wliczone $n = 10$, dla którego wyraz jest zerem.`, 'Zero nie jest liczbą ujemną.']],
  }),
  numeric({
    id: 's-bas-6',
    skill: 'seq-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ciąg jest określony wzorem $a_n = \frac{n + 3}{n}$. Który wyraz jest równy $\frac{5}{4}$? Podaj $n$.`,
    answer: 12,
    verify: () => 12 / (5 - 4),
    hints: ['Jakie równanie trzeba rozwiązać?', r`$\frac{n + 3}{n} = \frac54$.`, r`Na krzyż: $4(n + 3) = 5n$.`, 'Rozwiąż równanie liniowe.'],
    steps: [r`$4n + 12 = 5n$.`, r`$n = 12$.`],
    errors: [['3', r`Porównane tylko liczniki: $n + 3 = 5$ daje $2$, a potem błąd.`, 'Ułamki porównuje się na krzyż.']],
  }),
  numeric({
    id: 's-bas-7',
    skill: 'seq-basics',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Wyznacz najmniejszy wyraz ciągu $a_n = n^2 - 8n + 7$ (podaj jego wartość).`,
    answer: -9,
    verify: () => Math.min(...Array.from({ length: 50 }, (_, i) => (i + 1) ** 2 - 8 * (i + 1) + 7)),
    hints: ['Jaki kształt ma wykres funkcji o takim wzorze?', 'Parabola z ramionami do góry — najmniejsza wartość w wierzchołku.', r`$n_w = \frac{8}{2}$ — czy to liczba naturalna?`, r`Wstaw $n = 4$.`],
    steps: [r`Wierzchołek w $n = 4$ — naturalne.`, r`$a_4 = 16 - 32 + 7 = -9$.`],
    errors: [['4', 'Podany numer wyrazu zamiast jego wartości.', 'Pytanie dotyczy wartości najmniejszego wyrazu.']],
  }),
  numeric({
    id: 's-bas-8',
    skill: 'seq-basics',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile wyrazów ciągu $a_n = \frac{2n - 1}{n + 1}$ jest mniejszych od $\frac{3}{2}$?`,
    answer: 4,
    verify: () => {
      let c = 0;
      for (let n = 1; n <= 1000; n += 1) if ((2 * n - 1) / (n + 1) < 1.5) c += 1;
      return c;
    },
    hints: ['Jaką nierówność trzeba rozwiązać?', r`$\frac{2n - 1}{n + 1} < \frac32$, a $n + 1 > 0$.`, r`Pomnóż obie strony przez $2(n + 1)$ i uprość do nierówności liniowej.`, r`$n < 5$ — policz naturalne.`],
    steps: [r`$n < 5$: $n \in \{1, 2, 3, 4\}$.`, 'Cztery wyrazy.'],
    errors: [['5', r`Wliczone $n = 5$, dla którego wyraz jest równy $\frac32$.`, 'Nierówność ostra — równość się nie liczy.']],
  }),

  // seq-arithmetic (dopisane) -------------------------------------------------
  numeric({
    id: 's-ar-1',
    skill: 'seq-arithmetic',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ciąg arytmetyczny zaczyna się od wyrazów $7, 4, \ldots$ Oblicz $a_{10}$.`,
    answer: -20,
    verify: () => 7 + 9 * (4 - 7),
    hints: ['Ile wynosi różnica ciągu?', r`$r = 4 - 7 = -3$.`, r`$a_{10} = a_1 + 9r$.`, r`$7 + 9 \cdot (-3)$.`],
    steps: [r`$r = -3$.`, r`$a_{10} = 7 - 27 = -20$.`],
    errors: [['-23', r`Użyte $10r$ zamiast $9r$.`, r`$a_n = a_1 + (n - 1)r$.`]],
  }),
  numeric({
    id: 's-ar-2',
    skill: 'seq-arithmetic',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz sumę $1 + 2 + 3 + \ldots + 100$.`,
    answer: 5050,
    verify: () => Array.from({ length: 100 }, (_, i) => i + 1).reduce((a, b) => a + b, 0),
    hints: ['Jaki to ciąg i ile ma wyrazów?', r`Arytmetyczny, $a_1 = 1$, $a_{100} = 100$, sto wyrazów.`, r`$S_n = \frac{a_1 + a_n}{2} \cdot n$.`, r`$\frac{101}{2} \cdot 100$.`],
    steps: [r`$S_{100} = \frac{1 + 100}{2} \cdot 100$.`, r`$= 5050$.`],
    errors: [['10100', 'Pominięte dzielenie przez 2.', 'Suma to średnia pierwszego i ostatniego wyrazu razy liczba wyrazów.']],
  }),
  numeric({
    id: 's-ar-3',
    skill: 'seq-arithmetic',
    kind: 'typical',
    difficulty: 4,
    prompt: r`W ciągu arytmetycznym $a_2 + a_8 = 20$. Oblicz $a_5$.`,
    answer: 10,
    verify: () => 20 / 2,
    hints: [r`Jak $a_2$ i $a_8$ leżą względem $a_5$?`, r`Symetrycznie — o trzy kroki w każdą stronę.`, r`$a_2 + a_8 = (a_5 - 3r) + (a_5 + 3r)$.`, r`$2a_5 = 20$.`],
    steps: [r`$a_2 + a_8 = 2a_5$.`, r`$a_5 = 10$.`],
    errors: [['20', 'Pominięte dzielenie przez 2.', r`Suma dwóch symetrycznych wyrazów to $2a_5$.`]],
  }),
  numeric({
    id: 's-ar-4',
    skill: 'seq-arithmetic',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Oblicz sumę wszystkich liczb dwucyfrowych podzielnych przez $7$.`,
    answer: 728,
    verify: () => {
      let s = 0;
      for (let k = 10; k <= 99; k += 1) if (k % 7 === 0) s += k;
      return s;
    },
    hints: ['Jaka jest najmniejsza i największa taka liczba?', r`$14$ i $98$.`, r`Ile ich jest? $a_n = 14 + (n - 1) \cdot 7 = 98$.`, r`$n = 13$ — użyj wzoru na sumę.`],
    steps: [r`$14, 21, \ldots, 98$ — trzynaście wyrazów.`, r`$S = \frac{14 + 98}{2} \cdot 13 = 728$.`],
    errors: [['735', r`Wliczona liczba $7$, która nie jest dwucyfrowa.`, 'Pierwsza dwucyfrowa wielokrotność 7 to 14.']],
  }),

  // seq-geometric (dopisane) --------------------------------------------------
  numeric({
    id: 's-ge-1',
    skill: 'seq-geometric',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`W ciągu geometrycznym $a_1 = 3$, $q = -2$. Oblicz $a_4$.`,
    answer: -24,
    verify: () => 3 * (-2) ** 3,
    hints: ['Jaki jest wzór na n-ty wyraz?', r`$a_n = a_1 q^{n-1}$.`, r`$a_4 = 3 \cdot (-2)^3$.`, r`Nieparzysta potęga liczby ujemnej jest ujemna.`],
    steps: [r`$(-2)^3 = -8$.`, r`$a_4 = -24$.`],
    errors: [['24', 'Zgubiony znak ujemnej potęgi.', r`$(-2)^3 = -8$.`]],
  }),
  numeric({
    id: 's-ge-2',
    skill: 'seq-geometric',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Liczby $2, 6, x$ tworzą ciąg geometryczny. Oblicz $x$.`,
    answer: 18,
    verify: () => 6 * (6 / 2),
    hints: ['Jaki jest iloraz ciągu?', r`$q = \frac{6}{2}$.`, r`$x = 6 \cdot q$.`, 'Policz.'],
    steps: [r`$q = 3$.`, r`$x = 18$.`],
    errors: [['10', 'Ciąg potraktowany jak arytmetyczny.', 'W ciągu geometrycznym mnożysz przez iloraz, nie dodajesz różnicy.']],
  }),
  numeric({
    id: 's-ge-3',
    skill: 'seq-geometric',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Liczby $x$, $x + 2$, $x + 6$ (w tej kolejności) tworzą ciąg geometryczny. Wyznacz $x$.`,
    answer: 2,
    variants: ['x=2'],
    verify: () => 4 / (6 - 4),
    hints: ['Jaki warunek spełniają trzy kolejne wyrazy geometryczne?', r`Kwadrat środkowego = iloczyn skrajnych.`, r`$(x + 2)^2 = x(x + 6)$.`, r`$x^2 + 4x + 4 = x^2 + 6x$.`],
    steps: [r`$4 = 2x$, więc $x = 2$.`, 'Sprawdzenie: 2, 4, 8 — iloraz 2.'],
    errors: [['4', r`Podany drugi wyraz ciągu zamiast $x$.`, r`Pytanie jest o $x$ — pierwszy wyraz.`]],
  }),
  numeric({
    id: 's-ge-4',
    skill: 'seq-geometric',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Trzy liczby tworzą ciąg geometryczny. Ich suma jest równa $21$, a iloczyn $64$. Podaj największą z nich.`,
    answer: 16,
    verify: () => {
      // a2^3 = 64 -> a2 = 4; 4/q + 4q = 17 -> 4q^2 - 17q + 4 = 0
      const q = (17 + Math.sqrt(17 * 17 - 64)) / 8;
      return Math.max(4 / q, 4, 4 * q);
    },
    hints: [r`Jak zapisać trzy wyrazy przez środkowy $b$ i iloraz $q$?`, r`$\frac{b}{q}, b, bq$ — iloczyn to $b^3$.`, r`$b^3 = 64$, a z sumy: $\frac{b}{q} + bq = 21 - b$.`, r`Dostajesz $4q^2 - 17q + 4 = 0$.`],
    steps: [r`$b = 4$; $q = 4$ lub $q = \frac14$.`, r`Liczby: $1, 4, 16$ (albo odwrotnie) — największa $16$.`],
    errors: [['4', 'Podany środkowy wyraz zamiast największego.', 'Środkowy wyraz to dopiero pierwszy krok.']],
  }),

  // seq-mixed -----------------------------------------------------------------
  numeric({
    id: 's-mix-1',
    skill: 'seq-mixed',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oszczędzasz: w pierwszym tygodniu $10$ zł, w każdym kolejnym o $5$ zł więcej. Ile złotych odłożysz w $10.$ tygodniu?`,
    answer: 55,
    verify: () => 10 + 9 * 5,
    hints: ['Jaki to ciąg?', r`Arytmetyczny: $a_1 = 10$, $r = 5$.`, r`$a_{10} = 10 + 9 \cdot 5$.`, 'Policz.'],
    steps: [r`$a_{10} = 10 + 45$.`, r`$= 55$ zł.`],
    errors: [['60', r`Dodane $10 \cdot 5$ zamiast $9 \cdot 5$.`, 'Od 1. do 10. tygodnia jest dziewięć podwyżek.']],
  }),
  numeric({
    id: 's-mix-2',
    skill: 'seq-mixed',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Liczby $2, x, 18$ tworzą ciąg geometryczny o wyrazach dodatnich. Oblicz $x$.`,
    answer: 6,
    verify: () => Math.sqrt(2 * 18),
    hints: ['Jaki warunek spełnia środkowy wyraz ciągu geometrycznego?', r`$x^2 = 2 \cdot 18$.`, r`$x^2 = 36$.`, 'Wyrazy są dodatnie.'],
    steps: [r`$x^2 = 36$.`, r`$x = 6$.`],
    errors: [['10', 'Wzięta średnia arytmetyczna.', r`W ciągu geometrycznym $x^2 = ac$.`]],
  }),
  choice({
    id: 's-mix-3',
    skill: 'seq-mixed',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Ciąg określony wzorem $a_n = 3 \cdot 2^n$ jest`,
    choices: [r`geometryczny o ilorazie $2$`, r`arytmetyczny o różnicy $2$`, r`geometryczny o ilorazie $3$`, r`arytmetyczny o różnicy $3$`],
    answer: 'A',
    hints: ['Jak sprawdzić, czy ciąg jest geometryczny?', r`Oblicz $\frac{a_{n+1}}{a_n}$.`, r`$\frac{3 \cdot 2^{n+1}}{3 \cdot 2^n}$.`, 'Skróć.'],
    steps: [r`$\frac{a_{n+1}}{a_n} = 2$ — stały iloraz.`, 'Ciąg geometryczny o ilorazie 2.'],
    errors: [
      ['B', 'Pomylony ciąg geometryczny z arytmetycznym.', 'Różnice kolejnych wyrazów nie są stałe: 6, 12, 24…'],
      ['C', 'Współczynnik przed potęgą wzięty za iloraz.', 'Iloraz to podstawa potęgi zależnej od n.'],
      ['D', 'Współczynnik wzięty za różnicę.', 'Stały jest iloraz, nie różnica.'],
    ],
  }),
  numeric({
    id: 's-mix-4',
    skill: 'seq-mixed',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Spłacasz $1200$ zł w ratach: pierwsza wynosi $100$ zł, każda kolejna jest o $40$ zł większa. Ile rat zapłacisz?`,
    answer: 6,
    verify: () => {
      let s = 0;
      let n = 0;
      while (s < 1200) {
        s += 100 + 40 * n;
        n += 1;
      }
      return s === 1200 ? n : NaN;
    },
    hints: ['Jaki ciąg tworzą raty?', r`Arytmetyczny: $a_1 = 100$, $r = 40$.`, r`$S_n = \frac{200 + 40(n - 1)}{2} \cdot n = 1200$.`, r`$n^2 + 4n - 60 = 0$.`],
    steps: [r`$(n + 10)(n - 6) = 0$.`, r`$n = 6$ ($n = -10$ odpada — liczba rat jest dodatnia).`],
    errors: [['-10', 'Nie odrzucono ujemnego rozwiązania.', 'Liczba rat musi być naturalna.']],
  }),
  numeric({
    id: 's-mix-5',
    skill: 'seq-mixed',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Liczby $x - 1$, $x + 1$, $2x + 5$ tworzą (w tej kolejności) ciąg arytmetyczny. Wyznacz $x$.`,
    answer: -2,
    variants: ['x=-2'],
    verify: () => 2 - 4,
    hints: ['Jaki warunek spełnia środkowy wyraz ciągu arytmetycznego?', r`$2b = a + c$.`, r`$2(x + 1) = (x - 1) + (2x + 5)$.`, r`$2x + 2 = 3x + 4$.`],
    steps: [r`$x = -2$.`, 'Sprawdzenie: −3, −1, 1 — różnica 2.'],
    errors: [['2', 'Zły znak przy przenoszeniu.', r`$2x + 2 = 3x + 4 \iff x = -2$.`]],
  }),
  numeric({
    id: 's-mix-6',
    skill: 'seq-mixed',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ciąg arytmetyczny ma $a_1 = 4$ i różnicę $r \ne 0$. Wyrazy $a_1, a_2, a_5$ tworzą (w tej kolejności) ciąg geometryczny. Oblicz $r$.`,
    answer: 8,
    verify: () => {
      // (4 + r)^2 = 4(4 + 4r) -> r^2 = 8r
      return 16 / 2;
    },
    hints: [r`Jak zapisać $a_2$ i $a_5$ przez $r$?`, r`$a_2 = 4 + r$, $a_5 = 4 + 4r$.`, r`Warunek geometryczny: $(4 + r)^2 = 4(4 + 4r)$.`, r`$r^2 = 8r$ i $r \ne 0$.`],
    steps: [r`$16 + 8r + r^2 = 16 + 16r \Rightarrow r(r - 8) = 0$.`, r`$r = 8$. Sprawdzenie: $4, 12, 36$ — iloraz $3$.`],
    errors: [['0', r`Nie odrzucono $r = 0$, wykluczonego w treści.`, r`Zadanie zakłada $r \ne 0$.`]],
  }),
  numeric({
    id: 's-mix-7',
    skill: 'seq-mixed',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Piłka po każdym odbiciu wznosi się na $\frac23$ poprzedniej wysokości. Spuszczono ją z $9$ m. Na jaką wysokość (w metrach) wzniesie się po trzecim odbiciu?`,
    answer: '8/3',
    variants: ['2.67', '2.667'],
    tolerance: 0.005,
    verify: () => 9 * (2 / 3) ** 3,
    hints: ['Jaki ciąg tworzą wysokości?', r`Geometryczny: po każdym odbiciu mnożysz przez $\frac23$.`, r`Po trzech odbiciach: $9 \cdot \left(\frac23\right)^3$.`, r`$\left(\frac23\right)^3 = \frac{8}{27}$.`],
    steps: [r`$9 \cdot \frac{8}{27}$.`, r`$= \frac83 \approx 2{,}67$ m.`],
    errors: [['4', r`Policzone tylko dwa odbicia: $9 \cdot \frac49$.`, 'Po trzecim odbiciu mnożysz trzy razy.']],
  }),
  numeric({
    id: 's-mix-8',
    skill: 'seq-mixed',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Liczby $a, b, c$ o sumie $15$ tworzą ciąg arytmetyczny, a liczby $a$, $b + 1$, $c + 5$ — ciąg geometryczny. Podaj najmniejszą możliwą wartość $a$.`,
    answer: 3,
    verify: () => {
      // b = 5, a = 5 - r, c = 5 + r: 36 = (5 - r)(10 + r) -> r^2 + 5r - 14 = 0
      const d = Math.sqrt(25 + 56);
      return Math.min(5 - (-5 + d) / 2, 5 - (-5 - d) / 2);
    },
    hints: ['Jak zapisać trzy wyrazy arytmetyczne, żeby suma była prosta?', r`$b - r, b, b + r$: suma to trzy razy $b$, więc $b = 5$.`, r`Warunek geometryczny: $6^2 = (5 - r)(10 + r)$.`, r`$r^2 + 5r - 14 = 0$.`],
    steps: [r`$r = 2$ lub $r = -7$, więc $a = 5 - r \in \{3, 12\}$.`, r`Sprawdzenie: $3, 6, 12$ oraz $12, 6, 3$ — oba geometryczne. Najmniejsze $a = 3$.`],
    errors: [['12', 'Wybrane większe z dwóch rozwiązań.', 'Pytanie dotyczy najmniejszej możliwej wartości.']],
  }),

  // seq-limit (dopisane) ------------------------------------------------------
  numeric({
    id: 's-lim-1',
    skill: 'seq-limit',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz granicę ciągu $a_n = 5 + \frac{1}{n}$.`,
    answer: 5,
    verify: () => 5 + 1 / 1e9,
    tolerance: 1e-6,
    hints: [r`Do czego dąży $\frac1n$, gdy $n$ rośnie?`, r`$\frac{1}{n} \to 0$.`, 'Granica sumy to suma granic.', 'Dodaj.'],
    steps: [r`$\frac1n \to 0$.`, r`$a_n \to 5$.`],
    errors: [['6', r`Przyjęte $\frac1n \to 1$.`, r`$\frac{1}{n}$ maleje do zera.`]],
  }),
  numeric({
    id: 's-lim-2',
    skill: 'seq-limit',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz $\lim\limits_{n \to \infty} \left(\sqrt{n^2 + 4n} - n\right)$.`,
    answer: 2,
    verify: () => {
      const n = 1e7;
      return (4 * n) / (Math.sqrt(n * n + 4 * n) + n);
    },
    tolerance: 1e-6,
    hints: ['Czy „nieskończoność minus nieskończoność” to zero?', r`Nie — pomnóż i podziel przez $\sqrt{n^2 + 4n} + n$.`, r`Licznik: $n^2 + 4n - n^2 = 4n$.`, r`Podziel licznik i mianownik przez $n$.`],
    steps: [r`$\frac{4n}{\sqrt{n^2 + 4n} + n} = \frac{4}{\sqrt{1 + \frac4n} + 1}$.`, r`$\to \frac{4}{1 + 1} = 2$.`],
    errors: [['0', 'Nieskończoność minus nieskończoność uznane za zero.', 'Taką różnicę przekształcasz przez sprzężenie.']],
  }),
  numeric({
    id: 's-lim-3',
    skill: 'seq-limit',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz $\lim\limits_{n \to \infty} \frac{3^n + 2^n}{3^{n+1}}$.`,
    answer: '1/3',
    variants: ['0.333', '0.3333'],
    tolerance: 0.001,
    verify: () => 1 / 3 + (2 / 3) ** 200 / 3,
    hints: ['Przez co podzielić licznik i mianownik?', r`Przez $3^n$ — najszybciej rosnącą potęgę.`, r`$\frac{1 + \left(\frac23\right)^n}{3}$.`, r`Do czego dąży $\left(\frac23\right)^n$?`],
    steps: [r`$\left(\frac23\right)^n \to 0$.`, r`Granica: $\frac13$.`],
    errors: [['1', r`Pominięty czynnik $3$ w mianowniku: $3^{n+1} = 3 \cdot 3^n$.`, r`$3^{n+1} = 3 \cdot 3^n$.`]],
  }),
  numeric({
    id: 's-lim-4',
    skill: 'seq-limit',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Granica ciągu $a_n = \frac{a n^2 + 3n}{2n^2 - 1}$ jest równa $a^2 - 3$. Podaj sumę wszystkich możliwych wartości $a$.`,
    answer: 0.5,
    variants: ['1/2'],
    verify: () => {
      // a/2 = a^2 - 3 -> 2a^2 - a - 6 = 0
      const d = Math.sqrt(1 + 48);
      return (1 + d) / 4 + (1 - d) / 4;
    },
    hints: ['Ile wynosi granica ciągu w zależności od a?', r`Równe stopnie — iloraz współczynników przy $n^2$: $\frac{a}{2}$.`, r`$\frac{a}{2} = a^2 - 3 \iff 2a^2 - a - 6 = 0$.`, r`Rozwiąż równanie kwadratowe (albo użyj wzoru Viète’a).`],
    steps: [r`$(2a + 3)(a - 2) = 0$: $a = 2$ lub $a = -\frac32$.`, r`Suma: $\frac12$.`],
    errors: [['2', 'Uwzględnione tylko dodatnie rozwiązanie.', 'Oba pierwiastki spełniają warunek zadania.']],
  }),

  // seq-series ----------------------------------------------------------------
  numeric({
    id: 's-ser-1',
    skill: 'seq-series',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz sumę szeregu $1 + \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \ldots$`,
    answer: 2,
    verify: () => 1 / (1 - 1 / 2),
    hints: ['Jaki jest pierwszy wyraz i iloraz?', r`$a_1 = 1$, $q = \frac12$.`, r`$S = \frac{a_1}{1 - q}$.`, r`$\frac{1}{1 - \frac12}$.`],
    steps: [r`$S = \frac{1}{\frac12}$.`, r`$= 2$.`],
    errors: [['1', r`Wzięte samo $a_1$.`, 'Suma szeregu to granica sum częściowych.']],
  }),
  choice({
    id: 's-ser-2',
    skill: 'seq-series',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Który szereg geometryczny ma skończoną sumę?',
    choices: [
      r`$5 + \frac53 + \frac59 + \ldots$`,
      r`$1 + 2 + 4 + \ldots$`,
      r`$1 - 1 + 1 - 1 + \ldots$`,
      r`$3 + 3 + 3 + \ldots$`,
    ],
    answer: 'A',
    hints: ['Od czego zależy, czy szereg ma sumę?', r`Od ilorazu: potrzebne $|q| < 1$.`, 'Oblicz iloraz każdego szeregu.', r`$\frac13$, $2$, $-1$, $1$.`],
    steps: [r`Tylko pierwszy ma $|q| = \frac13 < 1$.`, r`Jego suma: $\frac{5}{1 - \frac13} = 7{,}5$.`],
    errors: [
      ['B', r`$q = 2$ — wyrazy rosną.`, r`Szereg ma sumę tylko dla $|q| < 1$.`],
      ['C', r`$q = -1$ — sumy częściowe skaczą między 1 a 0.`, r`Warunek $|q| < 1$ jest ostry.`],
      ['D', r`$q = 1$ — suma rośnie bez końca.`, r`Warunek $|q| < 1$ jest ostry.`],
    ],
  }),
  numeric({
    id: 's-ser-3',
    skill: 'seq-series',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Szereg geometryczny o pierwszym wyrazie $12$ ma sumę $18$. Oblicz jego iloraz $q$.`,
    answer: '1/3',
    variants: ['0.333', '0.3333'],
    tolerance: 0.001,
    verify: () => 1 - 12 / 18,
    hints: ['Jaki wzór łączy pierwszy wyraz, iloraz i sumę?', r`$\frac{12}{1 - q} = 18$.`, r`$1 - q = \frac{12}{18} = \frac23$.`, r`Sprawdź warunek $|q| < 1$.`],
    steps: [r`$q = 1 - \frac23 = \frac13$.`, r`$|q| < 1$ — w porządku.`],
    errors: [['2/3', r`Podane $1 - q$ zamiast $q$.`, r`Z $1 - q = \frac23$ trzeba jeszcze wyznaczyć $q$.`]],
  }),
  numeric({
    id: 's-ser-4',
    skill: 'seq-series',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ułamek okresowy $0{,}(27)$ zapisz jako ułamek nieskracalny $\frac{p}{q}$. Podaj $p + q$.`,
    answer: 14,
    verify: () => {
      // 27/99 = 3/11
      const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
      const d = g(27, 99);
      return 27 / d + 99 / d;
    },
    hints: ['Jak zapisać ten ułamek jako szereg?', r`$\frac{27}{100} + \frac{27}{100^2} + \ldots$`, r`$S = \frac{\frac{27}{100}}{1 - \frac{1}{100}} = \frac{27}{99}$.`, 'Skróć ułamek.'],
    steps: [r`$\frac{27}{99} = \frac{3}{11}$.`, r`$p + q = 3 + 11 = 14$.`],
    errors: [['126', 'Ułamek nieskrócony: 27 + 99.', 'Ułamek ma być nieskracalny.']],
  }),
  numeric({
    id: 's-ser-5',
    skill: 'seq-series',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Suma szeregu $1 + x + x^2 + x^3 + \ldots$ jest równa $3$. Oblicz $x$.`,
    answer: '2/3',
    variants: ['0.667', '0.6667'],
    tolerance: 0.001,
    verify: () => 1 - 1 / 3,
    hints: ['Jaki jest pierwszy wyraz i iloraz?', r`$a_1 = 1$, $q = x$, warunek $|x| < 1$.`, r`$\frac{1}{1 - x} = 3$.`, r`$1 - x = \frac13$.`],
    steps: [r`$x = \frac23$.`, r`$|x| < 1$ — spełnione.`],
    errors: [['1/3', r`Podane $1 - x$ zamiast $x$.`, r`Z $1 - x = \frac13$ wyznacz $x$.`]],
  }),
  numeric({
    id: 's-ser-6',
    skill: 'seq-series',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`W kwadrat o boku $4$ wpisano kwadrat o wierzchołkach w środkach jego boków, w ten — kolejny w ten sam sposób, i tak bez końca. Oblicz sumę pól wszystkich kwadratów.`,
    answer: 32,
    verify: () => 16 / (1 - 1 / 2),
    figure: {
      kind: 'geometry',
      alt: 'Kwadrat o boku 4, w nim kwadrat o wierzchołkach w środkach boków, a w nim kolejny taki kwadrat.',
      points: {
        A: [0, 0], B: [4, 0], C: [4, 4], D: [0, 4],
        E: [2, 0], F: [4, 2], G: [2, 4], H: [0, 2],
        I: [3, 1], J: [3, 3], K: [1, 3], L: [1, 1],
      },
      polygons: [{ vertices: ['A', 'B', 'C', 'D'] }, { vertices: ['E', 'F', 'G', 'H'] }, { vertices: ['I', 'J', 'K', 'L'] }],
      hidePointLabels: true,
    },
    hints: ['Jak zmienia się pole przy przejściu do kolejnego kwadratu?', r`Drugi kwadrat ma bok $2\sqrt2$, pole $8$ — połowę pierwszego.`, r`Pola: $16, 8, 4, \ldots$ — iloraz $\frac12$.`, r`$S = \frac{16}{1 - \frac12}$.`],
    steps: [r`Szereg pól: $a_1 = 16$, $q = \frac12$.`, r`$S = 32$.`],
    errors: [['16', 'Podane tylko pole pierwszego kwadratu.', 'Sumujesz pola wszystkich kwadratów.']],
  }),
  numeric({
    id: 's-ser-7',
    skill: 'seq-series',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Piłkę upuszczono z wysokości $10$ m. Po każdym odbiciu wznosi się na połowę poprzedniej wysokości. Jaką łączną drogę (w metrach) przebędzie, zanim się zatrzyma?`,
    answer: 30,
    verify: () => 10 + 2 * (5 / (1 - 1 / 2)),
    hints: ['Z jakich odcinków składa się droga piłki?', r`Najpierw spada $10$ m, potem każde odbicie to wzlot i spadek o tej samej wysokości.`, r`Wysokości odbić: $5, 2{,}5, \ldots$ — każdą liczysz dwa razy.`, r`$10 + 2 \cdot \frac{5}{1 - \frac12}$.`],
    steps: [r`Suma odbić: $\frac{5}{\frac12} = 10$, liczona podwójnie: $20$.`, r`Łącznie $10 + 20 = 30$ m.`],
    errors: [['20', 'Pominięte, że każde odbicie to droga w górę i w dół — albo pominięty pierwszy spadek.', 'Droga: pierwszy spadek + 2 × suma wysokości odbić.']],
  }),
  numeric({
    id: 's-ser-8',
    skill: 'seq-series',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Rozwiąż równanie $1 + (x - 1) + (x - 1)^2 + (x - 1)^3 + \ldots = 2x$. Podaj sumę rozwiązań.`,
    answer: 2,
    verify: () => {
      // q = x - 1, 0 < x < 2; 1/(2 - x) = 2x -> 2x^2 - 4x + 1 = 0
      const d = Math.sqrt(16 - 8);
      return [(4 + d) / 4, (4 - d) / 4].filter((x) => x > 0 && x < 2).reduce((a, b) => a + b, 0);
    },
    hints: ['Jaki jest iloraz szeregu i kiedy szereg ma sumę?', r`$q = x - 1$, warunek $|x - 1| < 1 \iff 0 < x < 2$.`, r`$\frac{1}{1 - (x - 1)} = 2x \iff 1 = 2x(2 - x)$.`, r`$2x^2 - 4x + 1 = 0$ — sprawdź oba pierwiastki z warunkiem.`],
    steps: [r`$x = 1 \pm \frac{\sqrt2}{2}$ — oba w przedziale $(0, 2)$.`, r`Suma: $2$.`],
    errors: [['1', 'Odrzucony pierwiastek, który spełnia warunek zbieżności.', r`Oba pierwiastki leżą w $(0, 2)$.`]],
  }),
];

export const SEQ_QUESTIONS: Question[] = [...SEQUENCE_QUESTIONS, ...NEW_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const SEQ_CARDS: Flashcard[] = [
  card('c-seq-bas-1', 'seq-basics', 'metoda', 'Jak zbadać monotoniczność ciągu?', r`Zbadaj znak $a_{n+1} - a_n$.`),
  card('c-seq-bas-2', 'seq-basics', 'pulapka', r`„Który wyraz jest równy 25?” — co z rozwiązaniem $n = 7{,}5$?`, 'Żaden wyraz nie jest równy 25 — numer wyrazu musi być naturalny.'),

  card('c-seq-ar-1', 'seq-arithmetic', 'wzor', 'Ciąg arytmetyczny: n-ty wyraz i suma?', r`$a_n = a_1 + (n - 1)r$, $S_n = \frac{a_1 + a_n}{2} \cdot n$`),
  card('c-seq-ar-2', 'seq-arithmetic', 'wzor', 'Warunek: a, b, c kolejne wyrazy arytmetyczne?', r`$2b = a + c$`),

  card('c-seq-ge-1', 'seq-geometric', 'wzor', 'Ciąg geometryczny: n-ty wyraz i suma?', r`$a_n = a_1 q^{n-1}$, $S_n = a_1 \frac{1 - q^n}{1 - q}$`),
  card('c-seq-ge-2', 'seq-geometric', 'wzor', 'Warunek: a, b, c kolejne wyrazy geometryczne?', r`$b^2 = ac$`),

  card('c-seq-mix-1', 'seq-mixed', 'metoda', 'Trzy wyrazy arytmetyczne o znanej sumie — jak je zapisać?', r`$b - r, b, b + r$ — suma $3b$.`),
  card('c-seq-mix-2', 'seq-mixed', 'definicja', 'Stała kwota vs stały procent?', 'Stała kwota — ciąg arytmetyczny. Stały procent — geometryczny.'),

  card('c-seq-lim-1', 'seq-limit', 'metoda', 'Granica ilorazu wielomianów?', 'Stopień licznika < mianownika: 0. Równe: iloraz współczynników przy najwyższych potęgach.'),
  card('c-seq-lim-2', 'seq-limit', 'pulapka', r`$\sqrt{n^2 + 4n} - n \to \;?$`, 'Nie 0! Sprzężenie: granica wynosi 2.'),

  card('c-seq-ser-1', 'seq-series', 'wzor', 'Suma szeregu geometrycznego?', r`$S = \frac{a_1}{1 - q}$, gdy $|q| < 1$`),
  card('c-seq-ser-2', 'seq-series', 'pulapka', 'Równanie z szeregiem — o czym nie zapomnieć?', r`Warunek zbieżności $|q| < 1$ jak dziedzina — sprawdź na końcu.`),
];

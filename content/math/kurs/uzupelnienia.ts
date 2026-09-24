import type { Flashcard, GeometryFigure, Lesson, Question, Skill } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Uzupełnienia kursu do podstawy programowej z 2024 r. (egzamin od 2025).
 *
 * Porównanie kursu z wymaganiami szczegółowymi pokazało braki: wektory (IX.R3),
 * proste dowody podzielności (I.2), dowody geometryczne (VIII.11), a także
 * pojedyncze wymagania, na które wystarczy kilka zadań w istniejących
 * umiejętnościach: własność Darboux i definicja pochodnej (XIII.R2-R3),
 * dwumian Newtona (II.R5), bryły podobne (X.6), obrazy okręgów w symetriach
 * (IX.5), punkty wspólne dwóch okręgów (IX.R2).
 *
 * Nowe umiejętności należą do istniejących działów i w kolejności kursu
 * stają na ich końcu.
 */

const r = String.raw;

export const EXTRA_SKILLS: Skill[] = [
  {
    id: 'num-proofs',
    topicId: 'math-numbers',
    name: 'Dowody: podzielność i reszty',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — proste dowody dotyczące podzielności liczb całkowitych i reszt z dzielenia (I.2)',
    prerequisites: ['alg-expand', 'alg-factor'],
    examValue: 0.55,
  },
  {
    id: 'plan-proofs',
    topicId: 'math-planimetry',
    name: 'Dowody geometryczne',
    level: 'PP',
    ckeRequirement: 'Planimetria — dowody geometryczne, punkty szczególne w trójkącie (VIII.10, VIII.11)',
    prerequisites: ['plan-similarity', 'plan-circle'],
    examValue: 0.6,
  },
  {
    id: 'geo-vectors',
    topicId: 'math-analytic-geometry',
    name: 'Wektory',
    level: 'PR',
    ckeRequirement: 'Geometria analityczna — wektor, jego współrzędne i długość, dodawanie i mnożenie przez liczbę (IX.R3)',
    prerequisites: ['geo-distance', 'geo-line'],
    examValue: 0.55,
  },
];

// ===========================================================================
// Rysunki
// ===========================================================================

const altitudeFigure: GeometryFigure = {
  kind: 'geometry',
  alt: 'Trójkąt prostokątny ABC z kątem prostym przy C. Wysokość CD opuszczona na przeciwprostokątną AB dzieli trójkąt na dwa mniejsze trójkąty prostokątne.',
  points: { A: [0, 0], B: [13, 0], C: [4, 6], D: [4, 0] },
  polygons: [{ vertices: ['A', 'B', 'C'] }],
  segments: [{ from: 'C', to: 'D', dashed: true, label: 'h' }],
  angles: [
    { at: 'C', from: 'A', to: 'B', right: true },
    { at: 'D', from: 'B', to: 'C', right: true },
  ],
};

// ===========================================================================
// Lekcje
// ===========================================================================

export const EXTRA_LESSONS: Lesson[] = [
  {
    skillId: 'num-proofs',
    minutes: 14,
    intro:
      'Dowód podzielności to nie sprawdzenie kilku przykładów — to pokazanie, że własność zachodzi dla KAŻDEJ liczby. Narzędzia są dwa: zapis liczby w postaci ogólnej i przekształcenie wyrażenia do iloczynu z szukanym czynnikiem.',
    blocks: [
      f(r`n = 2k \ \text{lub}\ n = 2k + 1 \qquad n = 3k,\ 3k + 1,\ 3k + 2`, 'postać ogólna liczby względem reszty z dzielenia'),
      p(r`Schemat: 1) zapisz liczby w postaci ogólnej, 2) przekształć wyrażenie, 3) wyłącz przed nawias szukany dzielnik albo pokaż resztę, 4) napisz wniosek słowami. Na przykład $(n + 1)^2 - (n - 1)^2 = 4n$ — to wielokrotność $4$ dla każdego $n$.`),
      p(r`Iloczyn $k$ kolejnych liczb całkowitych dzieli się przez $k!$: wśród dwóch kolejnych jest liczba parzysta, wśród trzech — podzielna przez $3$. Dlatego $n^3 - n = (n - 1)n(n + 1)$ dzieli się przez $6$.`),
      tip(r`Reszta z iloczynu = reszta z iloczynu reszt. Jeśli $a$ daje resztę $2$, a $b$ resztę $5$ z dzielenia przez $7$, to $ab$ daje resztę z $2 \cdot 5 = 10$, czyli $3$.`),
      warn('Sprawdzenie dla n = 1, 2, 3 nie jest dowodem. Egzaminator szuka argumentu działającego dla każdej liczby.'),
    ],
    examples: [
      example(
        r`Wykaż, że liczba dająca z dzielenia przez $4$ resztę $3$ nie jest kwadratem liczby całkowitej.`,
        [
          [r`Kwadrat liczby parzystej: $(2k)^2 = 4k^2$ — reszta $0$.`, 'rozważamy wszystkie liczby całkowite: parzyste i nieparzyste'],
          r`Kwadrat liczby nieparzystej: $(2k + 1)^2 = 4(k^2 + k) + 1$ — reszta $1$.`,
          r`Kwadraty dają więc reszty tylko $0$ lub $1$ — nigdy $3$.`,
        ],
        'Teza udowodniona.',
      ),
      example(
        r`Wykaż, że $n^3 - n$ dzieli się przez $6$ dla każdej liczby całkowitej $n$.`,
        [r`$n^3 - n = (n - 1)n(n + 1)$ — iloczyn trzech kolejnych liczb.`, r`Wśród nich jest liczba parzysta i liczba podzielna przez $3$, więc iloczyn dzieli się przez $2 \cdot 3 = 6$.`],
        'Teza udowodniona.',
      ),
    ],
    pitfalls: ['Przykłady zamiast dowodu.', 'Pominięty jeden przypadek (np. liczby nieparzyste).', 'Brak końcowego wniosku słowami.'],
  },
  {
    skillId: 'plan-proofs',
    minutes: 15,
    intro:
      'Dowód geometryczny to łańcuch kroków, z których każdy ma uzasadnienie: własność figury, twierdzenie albo cecha przystawania lub podobieństwa. Na maturze liczy się właśnie to uzasadnienie — sam poprawny rysunek nie wystarczy.',
    blocks: [
      p('Najczęstsze narzędzia: kąty (przy prostych równoległych, wpisane i środkowe, suma kątów w trójkącie), przystawanie trójkątów (bbb, bkb, kbk), podobieństwo (kkk), twierdzenia Talesa i Pitagorasa.'),
      { kind: 'figure', figure: altitudeFigure, caption: 'Wysokość z kąta prostego dzieli trójkąt na dwa trójkąty podobne do niego i do siebie.' },
      f(r`h^2 = |AD| \cdot |DB|`, 'z podobieństwa trójkątów ACD i CBD'),
      p('Punkty szczególne trójkąta: środek okręgu wpisanego (przecięcie dwusiecznych), środek okręgu opisanego (przecięcie symetralnych), ortocentrum (przecięcie wysokości), środek ciężkości (przecięcie środkowych — dzieli każdą w stosunku 2 : 1 od wierzchołka).'),
      tip('Zapisuj dowód w dwóch kolumnach: stwierdzenie — uzasadnienie. Każda równość kątów albo odcinków musi mieć swój powód.'),
      warn('Nie zakładaj tego, co masz udowodnić (np. że trójkąt jest równoramienny, bo tak wygląda na rysunku).'),
    ],
    examples: [
      example(
        r`W trójkącie prostokątnym $ABC$ (kąt $C$ prosty) $CD$ jest wysokością. Wykaż, że $|CD|^2 = |AD| \cdot |DB|$.`,
        [
          [r`$\angle ACD = 90^\circ - \angle A = \angle B$.`, 'suma kątów w trójkątach ACD i ABC'],
          [r`Trójkąty $ACD$ i $CBD$ są podobne (kkk).`, 'oba prostokątne, a kąty ACD i CBD są równe'],
          r`Stąd $\frac{|CD|}{|AD|} = \frac{|DB|}{|CD|}$, czyli $|CD|^2 = |AD| \cdot |DB|$.`,
        ],
        'Teza udowodniona.',
      ),
      example(
        r`Wykaż, że przekątne równoległoboku dzielą się na połowy.`,
        [
          [r`W równoległoboku $ABCD$ z punktem przecięcia przekątnych $O$: $|AB| = |CD|$.`, 'przeciwległe boki równoległoboku'],
          [r`$\angle OAB = \angle OCD$ i $\angle OBA = \angle ODC$.`, 'kąty naprzemianległe przy AB ∥ CD'],
          r`Trójkąty $ABO$ i $CDO$ są przystające (kbk), więc $|AO| = |OC|$ i $|BO| = |OD|$.`,
        ],
        'Teza udowodniona.',
      ),
    ],
    pitfalls: ['Równość kątów bez uzasadnienia.', 'Cecha przystawania z kątem nieleżącym przy boku (bbk nie jest cechą).', 'Teza przyjęta jako założenie.'],
  },
  {
    skillId: 'geo-vectors',
    minutes: 12,
    intro:
      'Wektor to przesunięcie: ma kierunek, zwrot i długość. W układzie współrzędnych opisuje go para liczb — o ile przesuwasz się w poziomie i w pionie. Wektory upraszczają zadania o podziale odcinka, równoległobokach i środkach ciężkości.',
    blocks: [
      f(r`\overrightarrow{AB} = [x_B - x_A,\ y_B - y_A] \qquad |\vec{v}| = \sqrt{v_x^2 + v_y^2}`),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Układ współrzędnych z punktami A = (1, 1) i B = (4, 5). Odcinek AB przedstawia wektor [3, 4]: 3 w prawo i 4 w górę; łamana pokazuje oba przesunięcia.',
          x: [-1, 6],
          y: [-1, 6],
          polylines: [{ points: [[1, 1], [4, 5]] }, { points: [[1, 1], [4, 1], [4, 5]] }],
          points: [{ at: [1, 1], label: 'A' }, { at: [4, 5], label: 'B' }],
        },
        caption: 'Wektor AB = [3, 4]: 3 w prawo, 4 w górę. Długość: √(9 + 16) = 5.',
      },
      f(r`\vec{u} + \vec{v} = [u_x + v_x,\ u_y + v_y] \qquad k\vec{v} = [kv_x,\ kv_y]`),
      p(r`Wektory są równoległe, gdy jeden jest wielokrotnością drugiego: $[2, 4] = 2 \cdot [1, 2]$. Warunek w liczbach: $u_x v_y - u_y v_x = 0$.`),
      tip(r`Punkt $M$ dzielący odcinek tak, że $\overrightarrow{AM} = t \cdot \overrightarrow{AB}$, ma współrzędne $M = A + t(B - A)$. Dla $t = \frac12$ to środek odcinka.`),
      warn(r`$\overrightarrow{AB}$ to „koniec minus początek”. Odwrotna kolejność daje wektor przeciwny.`),
    ],
    examples: [
      example(
        r`$A = (1, 1)$, $B = (7, 4)$. Punkt $P$ leży na odcinku $AB$ i $\overrightarrow{AP} = \frac23 \overrightarrow{AB}$. Wyznacz $P$.`,
        [r`$\overrightarrow{AB} = [6, 3]$, więc $\frac23 \overrightarrow{AB} = [4, 2]$.`, r`$P = (1 + 4,\ 1 + 2) = (5, 3)$.`],
        r`$P = (5, 3)$`,
      ),
      example(
        r`Dla jakiego $m > 0$ wektory $[m, 2]$ i $[3, m + 1]$ są równoległe?`,
        [r`$m(m + 1) - 2 \cdot 3 = 0 \Rightarrow m^2 + m - 6 = 0$.`, r`$m = 2$ lub $m = -3$; dodatnie: $m = 2$.`],
        r`$m = 2$`,
      ),
    ],
    pitfalls: ['Wektor liczony jako „początek minus koniec”.', 'Długość wektora bez pierwiastka.', 'Warunek równoległości zapisany jako równość współrzędnych.'],
  },
];

// ===========================================================================
// Zadania - nowe umiejętności
// ===========================================================================

const PROOF_QUESTIONS: Question[] = [
  // num-proofs ----------------------------------------------------------------
  numeric({
    id: 'u-prf-1',
    skill: 'num-proofs',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Jaką resztę daje liczba $4k + 3$ (gdzie $k$ jest liczbą całkowitą) z dzielenia przez $4$?`,
    answer: 3,
    verify: () => (4 * 17 + 3) % 4,
    hints: ['Która część wyrażenia dzieli się przez 4 bez reszty?', r`$4k$.`, 'Co zostaje po odjęciu wielokrotności 4?', 'To jest reszta.'],
    steps: [r`$4k$ dzieli się przez $4$.`, r`Reszta: $3$.`],
    errors: [['0', 'Uznano, że cała liczba dzieli się przez 4.', 'Tylko składnik 4k dzieli się przez 4.']],
  }),
  choice({
    id: 'u-prf-2',
    skill: 'num-proofs',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Iloczyn dwóch kolejnych liczb całkowitych jest zawsze podzielny przez',
    choices: [r`$2$`, r`$3$`, r`$4$`, r`$5$`],
    answer: 'A',
    verify: () => 2,
    hints: ['Co wiesz o parzystości dwóch kolejnych liczb?', 'Jedna z nich jest parzysta.', 'Iloczyn z liczbą parzystą jest parzysty.', r`Sprawdź np. $1 \cdot 2$ i $2 \cdot 3$ — czy oba dzielą się przez 3?`],
    steps: ['Wśród dwóch kolejnych liczb jedna jest parzysta.', 'Iloczyn zawsze dzieli się przez 2 (a np. 1 · 2 nie dzieli się przez 3).'],
    errors: [
      ['B', 'Własność trzech kolejnych liczb przeniesiona na dwie.', r`$1 \cdot 2 = 2$ nie dzieli się przez 3.`],
      ['C', r`Nie zawsze: $1 \cdot 2 = 2$.`, 'Gwarantowana jest tylko jedna liczba parzysta.'],
      ['D', r`Nie zawsze: $1 \cdot 2 = 2$.`, 'Sprawdź kontrprzykład.'],
    ],
  }),
  numeric({
    id: 'u-prf-3',
    skill: 'num-proofs',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Jaka jest największa możliwa reszta z dzielenia kwadratu liczby całkowitej przez $3$?`,
    answer: 1,
    verify: () => Math.max(...Array.from({ length: 30 }, (_, n) => (n * n) % 3)),
    hints: ['Jakie reszty z dzielenia przez 3 może mieć sama liczba?', 'Rozważ trzy przypadki: liczba dzieli się przez 3, daje resztę jeden albo daje resztę dwa.', r`Zapisz każdy przypadek w postaci ogólnej, podnieś do kwadratu i wyłącz wielokrotność $3$.`, r`$(3k + 2)^2 = 3(3k^2 + 4k + 1) + 1$.`],
    steps: [r`Kwadraty dają reszty $0$, $1$, $1$.`, r`Największa możliwa: $1$.`],
    errors: [['2', 'Reszta liczby pomylona z resztą jej kwadratu.', r`$(3k + 2)^2$ daje resztę 1, bo $4 = 3 + 1$.`]],
  }),
  numeric({
    id: 'u-prf-4',
    skill: 'num-proofs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wyrażenie $(n + 1)^2 - (n - 1)^2$ jest dla każdej liczby naturalnej $n$ podzielne przez pewną stałą liczbę. Podaj największą taką liczbę.`,
    answer: 4,
    verify: () => {
      const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
      let d = 0;
      for (let n = 1; n <= 50; n += 1) d = g(d, (n + 1) ** 2 - (n - 1) ** 2);
      return d;
    },
    hints: ['Jak uprościć różnicę kwadratów?', r`$(a + b)(a - b)$ albo rozwiń oba kwadraty.`, r`Wynik to stała razy $n$.`, r`Dla $n = 1$ wyrażenie ma najmniejszą wartość — sprawdź ją.`],
    steps: [r`$(n + 1)^2 - (n - 1)^2 = 4n$.`, r`Dla $n = 1$ wartość $4$ — więc największy wspólny dzielnik to $4$.`],
    errors: [['2', 'Wskazana tylko parzystość.', r`Wyrażenie równa się $4n$ — dzieli się przez $4$.`]],
  }),
  choice({
    id: 'u-prf-5',
    skill: 'num-proofs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`W dowodzie, że $n^3 - n$ dzieli się przez $6$, kluczowy jest rozkład`,
    choices: [r`$(n - 1)n(n + 1)$`, r`$n(n^2 + 1)$`, r`$(n - 1)^2(n + 1)$`, r`$n(n - 1)^2$`],
    answer: 'A',
    hints: ['Co można wyłączyć przed nawias?', r`$n(n^2 - 1)$.`, r`$n^2 - 1$ to różnica kwadratów.`, 'Jaki jest sens otrzymanego iloczynu?'],
    steps: [r`$n^3 - n = n(n^2 - 1) = (n - 1)n(n + 1)$.`, 'Trzy kolejne liczby: jest wśród nich liczba parzysta i podzielna przez 3.'],
    errors: [
      ['B', r`Zły znak: $n^2 - 1$, nie $n^2 + 1$.`, r`$n^3 - n = n(n^2 - 1)$.`],
      ['C', 'Błędny rozkład różnicy kwadratów.', r`$n^2 - 1 = (n - 1)(n + 1)$.`],
      ['D', 'Błędny rozkład.', r`$n^3 - n = n(n - 1)(n + 1)$.`],
    ],
  }),
  numeric({
    id: 'u-prf-6',
    skill: 'num-proofs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Liczba $n$ daje z dzielenia przez $5$ resztę $3$. Jaką resztę z dzielenia przez $5$ daje $n^2$?`,
    answer: 4,
    verify: () => (8 * 8) % 5,
    hints: ['Jak zapisać n w postaci ogólnej?', r`$n = 5k + 3$.`, r`$n^2 = 25k^2 + 30k + 9$ — wyłącz wielokrotność $5$.`, r`Zostaje reszta z liczby $9$.`],
    steps: [r`$n^2 = 5(5k^2 + 6k + 1) + 4$.`, r`Reszta: $4$.`],
    errors: [['9', 'Nie wyznaczono reszty z 9.', 'Reszta z dzielenia przez 5 jest mniejsza od 5.']],
  }),
  numeric({
    id: 'u-prf-7',
    skill: 'num-proofs',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Liczba $a$ daje z dzielenia przez $7$ resztę $2$, a liczba $b$ — resztę $5$. Jaką resztę z dzielenia przez $7$ daje $a^2 + b^2$?`,
    answer: 1,
    verify: () => (2 ** 2 + 5 ** 2) % 7,
    hints: ['Jak reszty zachowują się przy potęgowaniu i dodawaniu?', 'Reszta wyniku to reszta z działania na resztach.', r`$2^2 + 5^2 = 29$.`, r`Reszta z dzielenia $29$ przez $7$.`],
    steps: [r`$a^2 + b^2$ daje tę samą resztę co $29$.`, r`$29 = 4 \cdot 7 + 1$ — reszta $1$.`],
    errors: [['29', 'Nie wyznaczono reszty z 29.', 'Reszta z dzielenia przez 7 jest mniejsza od 7.']],
  }),
  numeric({
    id: 'u-prf-8',
    skill: 'num-proofs',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wyrażenie $n^4 - n^2$ jest podzielne przez pewną liczbę dla każdej liczby naturalnej $n \ge 2$. Podaj największą taką liczbę.`,
    answer: 12,
    verify: () => {
      const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b));
      let d = 0;
      for (let n = 2; n <= 60; n += 1) d = g(d, n ** 4 - n ** 2);
      return d;
    },
    hints: ['Jak rozłożyć wyrażenie na czynniki?', r`$n^2(n - 1)(n + 1)$.`, r`$(n - 1)n(n + 1)$ dzieli się przez $6$; a co daje dodatkowy czynnik $n$?`, r`Sprawdź najmniejszą wartość: $n = 2$.`],
    steps: [r`$n^4 - n^2 = n \cdot (n - 1)n(n + 1)$ — dzieli się przez $6$ i przez $4$ (z parzystości), więc przez $12$.`, r`Dla $n = 2$ wartość to $12$ — większej stałej nie ma.`],
    errors: [['6', 'Pominięty dodatkowy czynnik 2.', r`$n^2(n^2 - 1)$ zawsze dzieli się przez 4: albo $n$ parzyste, albo oba $n \pm 1$ parzyste.`]],
  }),

  // plan-proofs ---------------------------------------------------------------
  choice({
    id: 'u-gprf-1',
    skill: 'plan-proofs',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Odcinek $DE$ łączy punkty na bokach $AB$ i $AC$ trójkąta $ABC$ i jest równoległy do $BC$. Trójkąty $ADE$ i $ABC$ są podobne na mocy cechy`,
    choices: ['kąt–kąt (kkk)', 'bok–bok–bok', 'bok–kąt–bok z równymi bokami', 'nie da się tego stwierdzić'],
    answer: 'A',
    hints: ['Jakie kąty mają wspólne te trójkąty?', r`Kąt przy $A$ jest wspólny.`, r`$DE \parallel BC$ — kąty odpowiadające przy $D$ i $B$ są równe.`, 'Dwa równe kąty wystarczą.'],
    steps: [r`$\angle A$ wspólny, $\angle ADE = \angle ABC$ (odpowiadające).`, 'Cecha kkk.'],
    errors: [
      ['B', 'Nie znamy długości boków.', 'Z równoległości mamy równe kąty.'],
      ['C', 'Przystawanie (równe boki) pomylone z podobieństwem.', 'Trójkąty mają różne rozmiary.'],
      ['D', 'Równoległość daje równe kąty odpowiadające.', 'To wystarcza do podobieństwa.'],
    ],
  }),
  numeric({
    id: 'u-gprf-2',
    skill: 'plan-proofs',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Czworokąt $ABCD$ jest wpisany w okrąg, $|\angle ABC| = 110^\circ$. Oblicz $|\angle ADC|$ w stopniach.`,
    answer: 70,
    verify: () => 180 - 110,
    hints: ['Jaka własność łączy przeciwległe kąty czworokąta wpisanego w okrąg?', 'Sumują się do 180°.', r`$B$ i $D$ są przeciwległe.`, r`$180^\circ - 110^\circ$.`],
    steps: [r`$\angle B + \angle D = 180^\circ$.`, r`$\angle D = 70^\circ$.`],
    errors: [['110', 'Przeciwległe kąty uznane za równe.', 'W czworokącie wpisanym sumują się do 180°.']],
  }),
  choice({
    id: 'u-gprf-3',
    skill: 'plan-proofs',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Który argument pozwala udowodnić, że kąt wpisany oparty na średnicy $AB$ jest prosty ($C$ leży na okręgu o środku $O$)?`,
    choices: [
      r`Trójkąty $AOC$ i $BOC$ są równoramienne ($|OA| = |OB| = |OC|$), więc $2\alpha + 2\beta = 180^\circ$`,
      'Kąty wierzchołkowe są równe',
      'Twierdzenie Talesa o odcinkach proporcjonalnych',
      'Twierdzenie cosinusów',
    ],
    answer: 'A',
    hints: ['Jakie odcinki na rysunku mają równe długości?', r`Promienie: $OA$, $OB$, $OC$.`, 'Co wynika z równoramienności trójkątów AOC i BOC?', 'Kąty przy podstawach są równe — policz sumę kątów trójkąta ABC.'],
    steps: [r`$\angle OAC = \angle OCA = \alpha$, $\angle OBC = \angle OCB = \beta$.`, r`Suma kątów $ABC$: $2\alpha + 2\beta = 180^\circ$, więc $\angle ACB = \alpha + \beta = 90^\circ$.`],
    errors: [
      ['B', 'Na rysunku nie ma kątów wierzchołkowych do wykorzystania.', 'Kluczem są równe promienie.'],
      ['C', 'Twierdzenie o odcinkach proporcjonalnych nie dotyczy tej sytuacji.', 'Kluczem są trójkąty równoramienne.'],
      ['D', 'Twierdzenie cosinusów wymagałoby długości boków.', 'Wystarczą równe promienie i suma kątów.'],
    ],
  }),
  numeric({
    id: 'u-gprf-4',
    skill: 'plan-proofs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`W trójkącie $ABC$: $|AC| = |BC|$, $|\angle ACB| = 40^\circ$. Punkt $D$ leży na boku $BC$ i $|AD| = |AB|$. Oblicz $|\angle DAB|$ w stopniach.`,
    answer: 40,
    verify: () => {
      const base = (180 - 40) / 2;
      return 180 - 2 * base;
    },
    hints: ['Jakie kąty mają przy podstawie trójkąty równoramienne?', r`W $ABC$: $\angle A = \angle B = \frac{180^\circ - 40^\circ}{2}$.`, r`Trójkąt $ABD$ też jest równoramienny ($|AD| = |AB|$) — który kąt jest przy jego podstawie $BD$?`, r`$\angle ABD = \angle ADB$.`],
    steps: [r`$\angle B = 70^\circ$, więc $\angle ADB = 70^\circ$.`, r`$\angle DAB = 180^\circ - 140^\circ = 40^\circ$.`],
    errors: [['70', 'Podany kąt przy podstawie zamiast kąta przy A w trójkącie ABD.', 'Szukany jest kąt między AD i AB.']],
  }),
  choice({
    id: 'u-gprf-5',
    skill: 'plan-proofs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Żeby udowodnić, że przekątne równoległoboku $ABCD$ dzielą się na połowy ($O$ — punkt przecięcia), wystarczy wykazać przystawanie trójkątów`,
    choices: [r`$ABO$ i $CDO$`, r`$ABO$ i $BCO$`, r`$ABC$ i $ACD$`, r`$ABD$ i $BCD$`],
    answer: 'A',
    hints: ['W których trójkątach odcinki AO, OC, BO, OD są odpowiadającymi bokami?', r`W trójkątach leżących naprzeciw siebie przy $O$.`, r`$|AB| = |CD|$ i kąty naprzemianległe przy $AB \parallel CD$.`, 'Cecha kbk.'],
    steps: [r`$ABO \equiv CDO$ (kbk).`, r`Stąd $|AO| = |CO|$ i $|BO| = |DO|$.`],
    errors: [
      ['B', 'Te trójkąty zwykle nie są przystające.', 'Nie mają odpowiadających sobie równych boków.'],
      ['C', 'Przystawanie tych trójkątów nie mówi nic o punkcie O.', 'Potrzebne trójkąty z wierzchołkiem O.'],
      ['D', 'Przystawanie tych trójkątów nie mówi nic o punkcie O.', 'Potrzebne trójkąty z wierzchołkiem O.'],
    ],
  }),
  numeric({
    id: 'u-gprf-6',
    skill: 'plan-proofs',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Środkowa trójkąta ma długość $12$. Jak daleko od wierzchołka, z którego wychodzi, leży środek ciężkości trójkąta?`,
    answer: 8,
    verify: () => (2 / 3) * 12,
    hints: ['W jakim stosunku środek ciężkości dzieli środkową?', 'W stosunku 2 : 1, licząc od wierzchołka.', 'Podziel środkową na trzy równe części.', 'Dwie części leżą między wierzchołkiem a środkiem ciężkości.'],
    steps: [r`$\frac23 \cdot 12$.`, r`$= 8$.`],
    errors: [['6', 'Środek ciężkości wzięty w połowie środkowej.', 'Dzieli ją w stosunku 2 : 1, nie 1 : 1.']],
  }),
  choice({
    id: 'u-gprf-7',
    skill: 'plan-proofs',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`W trójkącie prostokątnym $ABC$ (kąt $C$ prosty) poprowadzono wysokość $CD$. Które trójkąty są podobne?`,
    figure: altitudeFigure,
    choices: [r`$ACD$, $CBD$ i $ABC$ — wszystkie trzy`, r`tylko $ACD$ i $CBD$`, 'żadne', r`tylko $ABC$ i $ACD$`],
    answer: 'A',
    hints: ['Jakie kąty ma każdy z tych trójkątów?', 'Każdy ma kąt prosty.', r`$ACD$ i $ABC$ mają wspólny kąt $A$; $CBD$ i $ABC$ — wspólny kąt $B$.`, 'Dwa równe kąty — podobieństwo (kkk).'],
    steps: [r`$ACD \sim ABC$ (kąt $A$ i kąt prosty), $CBD \sim ABC$ (kąt $B$ i kąt prosty).`, 'Więc wszystkie trzy są podobne.'],
    errors: [
      ['B', r`Pominięte podobieństwo do całego trójkąta $ABC$.`, r`Każdy z małych trójkątów ma z $ABC$ wspólny kąt ostry.`],
      ['C', 'Pominięte równe kąty.', 'Wszystkie trzy trójkąty są prostokątne i mają wspólne kąty ostre.'],
      ['D', r`Pominięty trójkąt $CBD$.`, r`$CBD$ ma z $ABC$ wspólny kąt $B$.`],
    ],
  }),
  numeric({
    id: 'u-gprf-8',
    skill: 'plan-proofs',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W trójkącie prostokątnym $ABC$ (kąt $C$ prosty) wysokość $CD$ dzieli przeciwprostokątną na odcinki $|AD| = 4$ i $|DB| = 9$. Oblicz $|CD|$.`,
    figure: altitudeFigure,
    answer: 6,
    verify: () => Math.sqrt(4 * 9),
    hints: ['Które trójkąty są podobne?', r`$ACD$ i $CBD$.`, r`Z podobieństwa: $\frac{|CD|}{|AD|} = \frac{|DB|}{|CD|}$.`, r`$|CD|^2 = |AD| \cdot |DB|$.`],
    steps: [r`$|CD|^2 = 36$.`, r`$|CD| = 6$.`],
    errors: [['6.5', 'Wzięta średnia arytmetyczna odcinków.', 'Wysokość to średnia geometryczna: pierwiastek z iloczynu.']],
  }),

  // geo-vectors ---------------------------------------------------------------
  numeric({
    id: 'u-vec-1',
    skill: 'geo-vectors',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dane są punkty $A = (1, 2)$ i $B = (4, 6)$. Podaj pierwszą współrzędną wektora $\overrightarrow{AB}$.`,
    answer: 3,
    verify: () => 4 - 1,
    hints: ['Jak liczysz współrzędne wektora z dwóch punktów?', 'Koniec minus początek.', r`$x_B - x_A$.`, 'Odejmij.'],
    steps: [r`$4 - 1$.`, r`$= 3$.`],
    errors: [['-3', 'Początek minus koniec.', 'Wektor AB: współrzędne B minus współrzędne A.']],
  }),
  numeric({
    id: 'u-vec-2',
    skill: 'geo-vectors',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz długość wektora $\vec{v} = [3, -4]$.`,
    answer: 5,
    verify: () => Math.hypot(3, -4),
    hints: ['Jaki wzór opisuje długość wektora?', r`$|\vec{v}| = \sqrt{v_x^2 + v_y^2}$.`, r`$\sqrt{9 + 16}$.`, 'Wyciągnij pierwiastek.'],
    steps: [r`$\sqrt{25}$.`, r`$= 5$.`],
    errors: [['7', 'Dodane wartości bezwzględne współrzędnych.', 'Długość liczy się z twierdzenia Pitagorasa.']],
  }),
  numeric({
    id: 'u-vec-3',
    skill: 'geo-vectors',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Dane są wektory $\vec{u} = [2, -1]$ i $\vec{v} = [1, 3]$. Podaj sumę współrzędnych wektora $\vec{u} + 2\vec{v}$.`,
    answer: 9,
    verify: () => 2 + 2 * 1 + (-1 + 2 * 3),
    hints: ['Jak mnożysz wektor przez liczbę?', r`Każdą współrzędną: $2\vec{v} = [2, 6]$.`, r`Dodaj współrzędne: $[2 + 2,\ -1 + 6]$.`, 'Zsumuj obie współrzędne wyniku.'],
    steps: [r`$\vec{u} + 2\vec{v} = [4, 5]$.`, r`Suma: $9$.`],
    errors: [['5', r`Policzone $\vec{u} + \vec{v}$ bez mnożenia przez 2.`, r`Najpierw $2\vec{v}$, potem dodawanie.`]],
  }),
  choice({
    id: 'u-vec-4',
    skill: 'geo-vectors',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Które wektory są równoległe?',
    choices: [r`$[2, 4]$ i $[1, 2]$`, r`$[2, 4]$ i $[4, 2]$`, r`$[1, -2]$ i $[2, 1]$`, r`$[3, 1]$ i $[1, 3]$`],
    answer: 'A',
    hints: ['Kiedy wektory są równoległe?', 'Gdy jeden jest wielokrotnością drugiego.', r`Czy $[2, 4] = k \cdot [1, 2]$ dla jakiegoś $k$?`, r`$k = 2$.`],
    steps: [r`$[2, 4] = 2 \cdot [1, 2]$.`, 'Pozostałe pary nie są swoimi wielokrotnościami.'],
    errors: [
      ['B', 'Zamienione współrzędne to nie wielokrotność.', r`$[4, 2] \ne k \cdot [2, 4]$.`],
      ['C', r`Te wektory są prostopadłe: $1 \cdot 2 + (-2) \cdot 1 = 0$.`, 'Równoległość to proporcjonalność współrzędnych.'],
      ['D', 'Zamienione współrzędne to nie wielokrotność.', r`$[1, 3] \ne k \cdot [3, 1]$.`],
    ],
  }),
  numeric({
    id: 'u-vec-5',
    skill: 'geo-vectors',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dane są punkty $A = (1, 1)$ i $B = (7, 4)$. Punkt $P$ spełnia $\overrightarrow{AP} = \frac23 \overrightarrow{AB}$. Podaj pierwszą współrzędną punktu $P$.`,
    answer: 5,
    verify: () => 1 + (2 / 3) * 6,
    tolerance: 1e-9,
    hints: ['Jakie współrzędne ma wektor AB?', r`$\overrightarrow{AB} = [6, 3]$.`, r`$\frac23 \overrightarrow{AB} = [4, 2]$.`, r`$P = A + \frac23 \overrightarrow{AB}$.`],
    steps: [r`$P = (1 + 4,\ 1 + 2)$.`, r`$x_P = 5$.`],
    errors: [['4', 'Wzięta pierwsza współrzędna środka odcinka.', r`$\frac23$ drogi, a nie połowa.`]],
  }),
  numeric({
    id: 'u-vec-6',
    skill: 'geo-vectors',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dla jakiej liczby dodatniej $m$ wektory $[m, 2]$ i $[3, m + 1]$ są równoległe?`,
    answer: 2,
    verify: () => (-1 + Math.sqrt(1 + 24)) / 2,
    hints: ['Jaki warunek opisuje równoległość w liczbach?', r`$u_x v_y - u_y v_x = 0$.`, r`$m(m + 1) - 2 \cdot 3 = 0$.`, 'Rozwiąż równanie kwadratowe i wybierz dodatnie rozwiązanie.'],
    steps: [r`$m^2 + m - 6 = 0$: $m = 2$ lub $m = -3$.`, r`Dodatnie: $m = 2$.`],
    errors: [['-3', 'Wybrane ujemne rozwiązanie.', 'Treść wymaga m > 0.']],
  }),
  numeric({
    id: 'u-vec-7',
    skill: 'geo-vectors',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Łódź płynie względem wody z prędkością $[3, 4]$ (km/h), a prąd rzeki ma prędkość $[1, -1]$. Z jaką szybkością (w km/h) łódź porusza się względem brzegu?`,
    answer: 5,
    verify: () => Math.hypot(3 + 1, 4 - 1),
    hints: ['Jak złożyć dwie prędkości?', 'Dodać wektory.', r`$[3 + 1,\ 4 - 1] = [4, 3]$.`, 'Szybkość to długość wektora.'],
    steps: [r`$\vec{v} = [4, 3]$.`, r`$|\vec{v}| = 5$ km/h.`],
    errors: [['7', 'Zsumowane współrzędne zamiast długości.', 'Szybkość to długość wektora prędkości.']],
  }),
  numeric({
    id: 'u-vec-8',
    skill: 'geo-vectors',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Punkty $A = (1, 1)$ i $B = (5, 9)$. Punkt $M$ spełnia $\overrightarrow{AM} = 3\overrightarrow{MB}$. Podaj sumę współrzędnych punktu $M$.`,
    answer: 11,
    verify: () => (1 + 3 * 5) / 4 + (1 + 3 * 9) / 4,
    hints: ['Jak zapisać warunek wektorowy przez współrzędne?', r`$M - A = 3(B - M)$.`, r`$4M = A + 3B$.`, 'Wyznacz współrzędne M i dodaj je.'],
    steps: [r`$M = \left(\frac{1 + 15}{4}, \frac{1 + 27}{4}\right) = (4, 7)$.`, r`Suma: $11$.`],
    errors: [['8', 'Wzięty środek odcinka AB.', r`$M$ dzieli odcinek w stosunku $3 : 1$, nie $1 : 1$.`]],
  }),
];

// ===========================================================================
// Zadania - pojedyncze wymagania w istniejących umiejętnościach
// ===========================================================================

const GAP_QUESTIONS: Question[] = [
  // XIII.R2 - własność Darboux (granica i ciągłość)
  choice({
    id: 'u-gap-darboux',
    skill: 'deriv-limit',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Funkcja $f(x) = x^3 + x - 3$ jest ciągła, a $f(1) = -1$ i $f(2) = 7$. Na tej podstawie można stwierdzić, że`,
    choices: [
      r`$f$ ma miejsce zerowe w przedziale $(1, 2)$`,
      r`$f$ nie ma miejsc zerowych`,
      r`$f$ ma miejsce zerowe w przedziale $(2, 3)$`,
      r`$f(1{,}5) = 3$`,
    ],
    answer: 'A',
    hints: ['Co mówi własność Darboux o funkcji ciągłej?', 'Na przedziale przyjmuje wszystkie wartości pośrednie.', r`$f(1) < 0 < f(2)$.`, 'Zero jest wartością pośrednią.'],
    steps: [r`$f$ ciągła, $f(1) < 0$, $f(2) > 0$.`, r`Z własności Darboux istnieje $x_0 \in (1, 2)$, że $f(x_0) = 0$.`],
    errors: [
      ['B', 'Zmiana znaku na przedziale oznacza miejsce zerowe.', 'Własność Darboux.'],
      ['C', 'Dane dotyczą przedziału (1, 2).', 'Zmiana znaku jest między 1 a 2.'],
      ['D', 'Własność Darboux nie daje konkretnej wartości w punkcie.', 'Mówi tylko o istnieniu wartości pośrednich.'],
    ],
  }),
  // XIII.R3 - definicja pochodnej
  numeric({
    id: 'u-gap-defder',
    skill: 'deriv-basic',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Oblicz granicę $\lim\limits_{h \to 0} \frac{(2 + h)^2 - 4}{h}$.`,
    answer: 4,
    verify: () => ((2 + 1e-7) ** 2 - 4) / 1e-7,
    tolerance: 1e-5,
    hints: ['Czym jest ta granica w języku pochodnych?', r`To iloraz różnicowy funkcji $x^2$ w punkcie $2$.`, r`Rozwiń licznik: $(2 + h)^2 - 4 = 4h + h^2$.`, r`Skróć przez $h$ i przejdź do granicy.`],
    steps: [r`$\frac{4h + h^2}{h} = 4 + h$.`, r`$\to 4$ — to $f'(2)$ dla $f(x) = x^2$.`],
    errors: [['0', r`Wynik $\frac00$ uznany za zero.`, 'Najpierw skróć przez h.']],
  }),
  // II.R5 - dwumian Newtona
  numeric({
    id: 'u-gap-binom',
    skill: 'alg-cubes',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Podaj współczynnik przy $x^2$ w rozwinięciu wyrażenia $(x + 2)^5$.`,
    answer: 80,
    verify: () => 10 * 2 ** 3,
    hints: ['Jaki wzór rozwija potęgę dwumianu?', r`$(a + b)^n = \sum \binom{n}{k} a^{n-k} b^k$.`, r`Wyraz z $x^2$: $\binom{5}{3} x^2 \cdot 2^3$.`, r`$\binom53 = 10$.`],
    steps: [r`$\binom53 \cdot 2^3 = 10 \cdot 8$.`, r`$= 80$.`],
    errors: [['40', r`Użyte $2^2$ zamiast $2^3$.`, r`Przy $x^2$ w $(x + 2)^5$ dwójka stoi w potędze $5 - 2 = 3$.`]],
  }),
  // X.6 - bryły podobne
  numeric({
    id: 'u-gap-similar',
    skill: 'stereo-solids',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dwa stożki są podobne w skali $2$ (większy do mniejszego). Mniejszy ma objętość $5$. Oblicz objętość większego.`,
    answer: 40,
    verify: () => 5 * 2 ** 3,
    hints: ['Jak zmienia się objętość bryły przy skali k?', r`Mnoży się przez $k^3$.`, r`$k^3 = 8$.`, r`$5 \cdot 8$.`],
    steps: [r`$V' = 5 \cdot 2^3$.`, r`$= 40$.`],
    errors: [['20', r`Użyta skala pól $k^2$.`, r`Objętość to trzy wymiary: skala $k^3$.`]],
  }),
  // IX.5 - obraz okręgu w symetrii
  numeric({
    id: 'u-gap-circleimg',
    skill: 'geo-figures',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Okrąg $(x - 2)^2 + (y + 3)^2 = 4$ odbito symetrycznie względem osi $Ox$. Obraz ma środek $(a, b)$. Podaj $b$.`,
    answer: 3,
    verify: () => -(-3),
    hints: ['Jaki środek ma wyjściowy okrąg?', r`$(2, -3)$.`, 'Co symetria względem osi Ox robi z punktem?', r`Zmienia znak drugiej współrzędnej: $(x, y) \to (x, -y)$.`],
    steps: [r`Środek $(2, -3) \to (2, 3)$, promień się nie zmienia.`, r`$b = 3$.`],
    errors: [['-3', 'Pominięta zmiana znaku.', 'Symetria względem Ox zmienia znak y.']],
  }),
  // IX.R2 - punkty wspólne dwóch okręgów
  numeric({
    id: 'u-gap-twocircles',
    skill: 'geo-point-line',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Okręgi $x^2 + y^2 = 25$ oraz $(x - 6)^2 + y^2 = 25$ przecinają się w dwóch punktach. Podaj dodatnią drugą współrzędną jednego z nich.`,
    answer: 4,
    verify: () => Math.sqrt(25 - 3 ** 2),
    hints: ['Jak pozbyć się kwadratów przy odejmowaniu równań?', r`Odejmij równania stronami: $x^2 - (x - 6)^2 = 0$.`, r`$12x - 36 = 0$ — wyznacz $x$.`, r`Wstaw $x$ do pierwszego równania.`],
    steps: [r`$x = 3$, $y^2 = 25 - 9 = 16$.`, r`$y = 4$ (albo $-4$).`],
    errors: [['3', r`Podane $x$ zamiast $y$.`, 'Pytanie dotyczy drugiej współrzędnej.']],
  }),
];

export const EXTRA_QUESTIONS: Question[] = [...PROOF_QUESTIONS, ...GAP_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const EXTRA_CARDS: Flashcard[] = [
  card('c-u-prf-1', 'num-proofs', 'metoda', 'Schemat dowodu podzielności?', 'Postać ogólna liczby → przekształcenie → wyłączenie dzielnika (albo reszta) → wniosek słowami.'),
  card('c-u-prf-2', 'num-proofs', 'definicja', 'Iloczyn trzech kolejnych liczb całkowitych dzieli się przez…?', r`$6$ (jest wśród nich liczba parzysta i podzielna przez $3$).`),

  card('c-u-gprf-1', 'plan-proofs', 'metoda', 'Jak zapisać dowód geometryczny?', 'Stwierdzenie — uzasadnienie (własność, twierdzenie, cecha). Każdy krok z powodem.'),
  card('c-u-gprf-2', 'plan-proofs', 'wzor', 'Środek ciężkości trójkąta?', 'Przecięcie środkowych; dzieli każdą w stosunku 2 : 1 od wierzchołka.'),

  card('c-u-vec-1', 'geo-vectors', 'wzor', 'Wektor AB i jego długość?', r`$[x_B - x_A,\ y_B - y_A]$; $\sqrt{v_x^2 + v_y^2}$`),
  card('c-u-vec-2', 'geo-vectors', 'wzor', 'Warunek równoległości wektorów?', r`$u_x v_y - u_y v_x = 0$ (jeden jest wielokrotnością drugiego).`),
];

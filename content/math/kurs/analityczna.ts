import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';
import { GEO_QUESTIONS, GEO_TOPIC } from '../geometria-analityczna';

/**
 * Dział 12: Geometria analityczna.
 *
 * Włącza do kursu trzy umiejętności z pierwszego wycinka treści (odległość
 * i środek odcinka, prosta, okrąg) - z ich identyfikatorami i zadaniami -
 * i dopisuje figury w układzie współrzędnych oraz odległość punktu od prostej
 * z wzajemnym położeniem prostych i okręgów.
 */

const r = String.raw;

export const GEO_COURSE_TOPIC: Topic = {
  ...GEO_TOPIC,
  summary:
    'Odległość i środek odcinka, równanie prostej, figury w układzie współrzędnych, równanie okręgu, odległość punktu od prostej i styczność.',
};

export const GEO_COURSE_SKILLS: Skill[] = [
  {
    id: 'geo-distance',
    topicId: 'math-analytic-geometry',
    name: 'Odległość punktów i środek odcinka',
    level: 'PP',
    ckeRequirement: 'Geometria analityczna — długość odcinka i współrzędne jego środka',
    prerequisites: ['plan-triangles'],
    examValue: 0.65,
  },
  {
    id: 'geo-line',
    topicId: 'math-analytic-geometry',
    name: 'Prosta w układzie współrzędnych',
    level: 'PP',
    ckeRequirement: 'Geometria analityczna — równanie prostej, proste równoległe i prostopadłe, punkt przecięcia',
    prerequisites: ['lin-parallel', 'geo-distance'],
    examValue: 0.8,
  },
  {
    id: 'geo-figures',
    topicId: 'math-analytic-geometry',
    name: 'Figury w układzie współrzędnych',
    level: 'PP',
    ckeRequirement: 'Geometria analityczna — wielokąty w układzie współrzędnych, pola, symetrie',
    prerequisites: ['geo-line', 'plan-quadrilaterals'],
    examValue: 0.6,
  },
  {
    id: 'geo-circle',
    topicId: 'math-analytic-geometry',
    name: 'Równanie okręgu',
    level: 'PP',
    ckeRequirement: 'Geometria analityczna — równanie okręgu w postaci kanonicznej i ogólnej',
    prerequisites: ['geo-distance', 'alg-expand'],
    examValue: 0.7,
  },
  {
    id: 'geo-point-line',
    topicId: 'math-analytic-geometry',
    name: 'Odległość punktu od prostej, styczność',
    level: 'PR',
    ckeRequirement: 'Geometria analityczna — odległość punktu od prostej, wzajemne położenie prostej i okręgu oraz dwóch okręgów',
    prerequisites: ['geo-circle', 'geo-figures'],
    examValue: 0.65,
  },
];

/** Górna i dolna połówka okręgu - do rysunków w lekcjach. */
const upper = (a: number, b: number, rad: number) => (x: number) => b + Math.sqrt(Math.max(0, rad * rad - (x - a) ** 2));
const lower = (a: number, b: number, rad: number) => (x: number) => b - Math.sqrt(Math.max(0, rad * rad - (x - a) ** 2));

// ===========================================================================
// Lekcje
// ===========================================================================

export const GEO_LESSONS: Lesson[] = [
  {
    skillId: 'geo-distance',
    minutes: 10,
    intro:
      'Geometria analityczna zamienia rysunek na liczby. Punkt to para współrzędnych, a odległość dwóch punktów liczysz z twierdzenia Pitagorasa — różnice współrzędnych to przyprostokątne.',
    blocks: [
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Punkty A = (1, 1) i B = (5, 4) połączone odcinkiem. Pozioma przyprostokątna ma długość 4, pionowa 3, odcinek AB ma długość 5. Zaznaczony środek odcinka S = (3; 2,5).',
          x: [-1, 7],
          y: [-1, 6],
          polylines: [
            { points: [[1, 1], [5, 4]], label: '|AB| = 5' },
            { points: [[1, 1], [5, 1], [5, 4]] },
          ],
          points: [{ at: [1, 1], label: 'A' }, { at: [5, 4], label: 'B' }, { at: [3, 2.5], label: 'S' }],
        },
        caption: 'Różnice współrzędnych (4 i 3) to przyprostokątne — odcinek AB to przeciwprostokątna.',
      },
      f(r`|AB| = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2} \qquad S = \left(\frac{x_A + x_B}{2}, \frac{y_A + y_B}{2}\right)`),
      tip(r`Znasz środek $S$ i jeden koniec $A$? Drugi koniec to $B = (2x_S - x_A,\ 2y_S - y_A)$ — „od $A$ do $S$ i jeszcze raz tyle samo”.`),
      warn(r`Kwadrat różnicy jest zawsze nieujemny: $(-3)^2 = 9$. Zgubiony minus przed kwadratem nie zmienia wyniku, ale zgubiony minus w różnicy — już tak: $2 - (-1) = 3$.`),
    ],
    examples: [
      example(
        r`Oblicz $|AB|$ dla $A = (2, -1)$, $B = (6, 2)$.`,
        [r`Różnice: $6 - 2 = 4$, $2 - (-1) = 3$.`, r`$|AB| = \sqrt{16 + 9} = 5$.`],
        r`$5$`,
      ),
      example(
        r`$S = (3, 4)$ jest środkiem odcinka $AB$, $A = (1, 2)$. Wyznacz $B$.`,
        [r`$x_B = 2 \cdot 3 - 1 = 5$.`, r`$y_B = 2 \cdot 4 - 2 = 6$.`],
        r`$B = (5, 6)$`,
      ),
    ],
    pitfalls: ['Zły znak przy odejmowaniu współrzędnej ujemnej.', 'Brak pierwiastka na końcu wzoru na odległość.', 'Środek policzony jako połowa różnicy zamiast połowy sumy.'],
  },
  {
    skillId: 'geo-line',
    minutes: 12,
    intro:
      'Prosta w układzie współrzędnych to funkcja liniowa y = ax + b. W zadaniach z geometrii najczęściej szukasz prostej przez dany punkt — równoległej albo prostopadłej do innej.',
    blocks: [
      f(r`a = \frac{y_B - y_A}{x_B - x_A} \qquad y - y_0 = a(x - x_0)`, 'współczynnik z dwóch punktów; prosta przez punkt (x₀, y₀)'),
      f(r`\parallel:\ a_1 = a_2 \qquad \perp:\ a_1 \cdot a_2 = -1`),
      p(r`Przepis na prostą prostopadłą przez punkt $P$: odwróć współczynnik i zmień znak ($2 \to -\frac12$), wstaw współrzędne $P$ do $y = ax + b$ i wylicz $b$.`),
      tip('Punkt przecięcia dwóch prostych to rozwiązanie układu ich równań.'),
      warn(r`Prosta pionowa $x = c$ nie ma postaci $y = ax + b$. Jest prostopadła do każdej prostej poziomej $y = d$.`),
    ],
    examples: [
      example(
        r`Wyznacz prostą prostopadłą do $y = \frac12 x + 3$ przechodzącą przez $P = (2, 1)$.`,
        [r`$a = -2$.`, r`$1 = -2 \cdot 2 + b \Rightarrow b = 5$: $y = -2x + 5$.`],
        r`$y = -2x + 5$`,
      ),
      example(
        r`Wyznacz symetralną odcinka o końcach $A = (1, 1)$, $B = (5, 3)$.`,
        [r`Środek $(3, 2)$, $a_{AB} = \frac{2}{4} = \frac12$.`, r`Symetralna ma $a = -2$: $2 = -6 + b$, więc $y = -2x + 8$.`],
        r`$y = -2x + 8$`,
      ),
    ],
    pitfalls: ['Tylko zmiana znaku albo tylko odwrócenie współczynnika przy prostopadłej.', 'Współczynnik kierunkowy liczony „x przez y”.', r`Wstawione $x$ w miejsce $y$ przy wyznaczaniu $b$.`],
  },
  {
    skillId: 'geo-figures',
    minutes: 12,
    intro:
      'Wielokąt w układzie współrzędnych rozwiązujesz narzędziami z poprzednich lekcji: długości boków ze wzoru na odległość, równoległość i prostopadłość ze współczynników, pole ze wzoru albo z prostokąta otaczającego.',
    blocks: [
      f(r`P_{\triangle ABC} = \frac12 \left| (x_B - x_A)(y_C - y_A) - (y_B - y_A)(x_C - x_A) \right|`, 'wzór z tablic CKE'),
      p(r`Równoległobok $ABCD$: przekątne dzielą się na pół, więc $A + C = B + D$ (po współrzędnych). Stąd $D = A + C - B$.`),
      f(r`\text{względem } Ox:\ (x, -y) \qquad \text{względem } Oy:\ (-x, y) \qquad \text{względem } O:\ (-x, -y)`, 'obraz punktu (x, y) w symetrii'),
      tip('Trójkąt z bokiem na osi albo równoległym do osi: pole to ½ · podstawa · wysokość — bez wzoru.'),
      warn('W równoległoboku ABCD wierzchołki idą po kolei. D = A + C − B, a nie B + C − A.'),
    ],
    examples: [
      example(
        r`Równoległobok $ABCD$: $A = (1, 1)$, $B = (5, 2)$, $C = (6, 5)$. Wyznacz $D$.`,
        [r`$D = A + C - B$.`, r`$D = (1 + 6 - 5,\ 1 + 5 - 2) = (2, 4)$.`],
        r`$D = (2, 4)$`,
      ),
      example(
        r`Oblicz pole trójkąta $A = (1, 1)$, $B = (4, 2)$, $C = (2, 5)$.`,
        [r`$(4 - 1)(5 - 1) - (2 - 1)(2 - 1) = 12 - 1 = 11$.`, r`$P = \frac{11}{2} = 5{,}5$.`],
        r`$5{,}5$`,
      ),
    ],
    pitfalls: ['Brak wartości bezwzględnej albo połowy we wzorze na pole.', 'Zła kolejność wierzchołków równoległoboku.', 'Symetria względem Ox zmienia y, nie x.'],
  },
  {
    skillId: 'geo-circle',
    minutes: 12,
    intro:
      'Okrąg to wszystkie punkty odległe o r od środka. Wzór na odległość, podniesiony do kwadratu, to właśnie równanie okręgu.',
    blocks: [
      f(r`(x - a)^2 + (y - b)^2 = r^2`, 'środek S = (a, b), promień r'),
      {
        kind: 'figure',
        figure: {
          kind: 'plot',
          alt: 'Okrąg o środku (2, −1) i promieniu 3 w układzie współrzędnych.',
          x: [-3, 7],
          y: [-5, 3],
          curves: [
            { fn: upper(2, -1, 3), from: -1, to: 5 },
            { fn: lower(2, -1, 3), from: -1, to: 5 },
          ],
          points: [{ at: [2, -1], label: 'S' }],
        },
        caption: '(x − 2)² + (y + 1)² = 9: środek (2, −1), promień 3.',
      },
      p(r`Postać ogólną $x^2 + y^2 - 4x + 2y - 4 = 0$ sprowadzasz do kanonicznej, uzupełniając do kwadratów: $x^2 - 4x = (x - 2)^2 - 4$, $y^2 + 2y = (y + 1)^2 - 1$.`),
      warn(r`W $(x + 3)^2$ współrzędna środka to $-3$, nie $3$. A po prawej stronie stoi $r^2$ — promień to jego pierwiastek.`),
    ],
    examples: [
      example(
        r`Wyznacz środek i promień okręgu $x^2 + y^2 - 4x + 6y - 12 = 0$.`,
        [r`$(x - 2)^2 - 4 + (y + 3)^2 - 9 - 12 = 0$.`, r`$(x - 2)^2 + (y + 3)^2 = 25$: $S = (2, -3)$, $r = 5$.`],
        r`$S = (2, -3)$, $r = 5$`,
      ),
      example(
        r`Napisz równanie okręgu o środku $S = (1, 2)$ przechodzącego przez $P = (4, 6)$.`,
        [r`$r = |SP| = \sqrt{9 + 16} = 5$.`, r`$(x - 1)^2 + (y - 2)^2 = 25$.`],
        r`$(x - 1)^2 + (y - 2)^2 = 25$`,
      ),
    ],
    pitfalls: [r`Znak współrzędnej środka odczytany wprost z nawiasu.`, r`$r^2$ podane jako promień.`, 'Zgubione stałe przy uzupełnianiu do kwadratu.'],
  },
  {
    skillId: 'geo-point-line',
    minutes: 14,
    intro:
      'Na rozszerzeniu pojawia się wzór na odległość punktu od prostej. Z nim łatwo sprawdzić, czy prosta jest styczna do okręgu: wystarczy porównać tę odległość ze środka z promieniem.',
    blocks: [
      f(r`d = \frac{|Ax_0 + By_0 + C|}{\sqrt{A^2 + B^2}}`, 'odległość punktu (x₀, y₀) od prostej Ax + By + C = 0'),
      f(r`d > r:\ \text{rozłączne} \qquad d = r:\ \text{styczne} \qquad d < r:\ \text{sieczna}`, 'd — odległość środka okręgu od prostej'),
      p(r`Dwa okręgi: porównaj odległość środków $|S_1S_2|$ z sumą i różnicą promieni. $|S_1S_2| = r_1 + r_2$ — styczne zewnętrznie, $|S_1S_2| = |r_1 - r_2|$ — wewnętrznie.`),
      tip(r`Prostą $y = ax + b$ zapisz najpierw w postaci ogólnej: $ax - y + b = 0$, czyli $A = a$, $B = -1$, $C = b$.`),
      warn('Wartość bezwzględna w liczniku jest obowiązkowa — odległość nie bywa ujemna.'),
    ],
    examples: [
      example(
        r`Oblicz odległość punktu $P = (2, 1)$ od prostej $4x - 3y + 5 = 0$.`,
        [r`$d = \frac{|8 - 3 + 5|}{\sqrt{16 + 9}}$.`, r`$= \frac{10}{5} = 2$.`],
        r`$2$`,
      ),
      example(
        r`Dla jakich $m$ prosta $y = x + m$ jest styczna do okręgu $x^2 + y^2 = 8$?`,
        [r`Postać ogólna $x - y + m = 0$; odległość od $(0, 0)$: $\frac{|m|}{\sqrt2}$.`, r`$\frac{|m|}{\sqrt2} = 2\sqrt2 \Rightarrow |m| = 4$, więc $m = \pm 4$.`],
        r`$m \in \{-4, 4\}$`,
      ),
    ],
    pitfalls: ['Brak wartości bezwzględnej w liczniku.', r`Porównanie odległości z $r^2$ zamiast z $r$.`, 'Zły znak B przy przejściu z postaci kierunkowej do ogólnej.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const NEW_QUESTIONS: Question[] = [
  // geo-distance (dopisane) ---------------------------------------------------
  numeric({
    id: 'g-dist-1',
    skill: 'geo-distance',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Podaj drugą współrzędną środka odcinka o końcach $A = (2, 4)$ i $B = (6, 10)$.`,
    answer: 7,
    verify: () => (4 + 10) / 2,
    hints: ['Jak liczysz współrzędne środka odcinka?', 'Średnia współrzędnych końców.', r`$\frac{4 + 10}{2}$.`, 'Policz.'],
    steps: [r`$\frac{14}{2}$.`, r`$= 7$.`],
    errors: [['3', 'Połowa różnicy zamiast połowy sumy.', 'Środek to średnia: (y_A + y_B)/2.']],
  }),
  numeric({
    id: 'g-dist-2',
    skill: 'geo-distance',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz długość odcinka o końcach $A = (-1, 3)$ i $B = (5, -5)$.`,
    answer: 10,
    verify: () => Math.hypot(5 - -1, -5 - 3),
    hints: ['Jakie są różnice współrzędnych?', r`$5 - (-1) = 6$ oraz $-5 - 3 = -8$.`, r`$|AB| = \sqrt{36 + 64}$.`, 'Wyciągnij pierwiastek.'],
    steps: [r`$\sqrt{100}$.`, r`$= 10$.`],
    errors: [['14', 'Dodane różnice bez Pitagorasa.', 'Odległość to pierwiastek z sumy kwadratów różnic.']],
  }),
  numeric({
    id: 'g-dist-3',
    skill: 'geo-distance',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Punkt $P = (x, 3)$ leży w odległości $5$ od punktu $A = (1, -1)$. Podaj większą z możliwych wartości $x$.`,
    answer: 4,
    verify: () => 1 + Math.sqrt(25 - 16),
    hints: ['Jakie równanie daje wzór na odległość?', r`$(x - 1)^2 + (3 + 1)^2 = 25$.`, r`$(x - 1)^2 = 9$.`, 'Dwa rozwiązania — wybierz większe.'],
    steps: [r`$x - 1 = \pm 3$: $x = 4$ lub $x = -2$.`, r`Większe: $4$.`],
    errors: [['-2', 'Wybrane mniejsze rozwiązanie.', 'Pytanie dotyczy większej wartości.']],
  }),
  numeric({
    id: 'g-dist-4',
    skill: 'geo-distance',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Na osi $Ox$ leży punkt $P$ równo odległy od $A = (1, 4)$ i $B = (5, 2)$. Podaj pierwszą współrzędną $P$.`,
    answer: 1.5,
    variants: ['3/2'],
    verify: () => (25 + 4 - 1 - 16) / (2 * (5 - 1)),
    hints: ['Jak zapisać punkt na osi Ox?', r`$P = (x, 0)$.`, r`$|PA|^2 = |PB|^2$: $(x - 1)^2 + 16 = (x - 5)^2 + 4$.`, 'Rozwiń — kwadraty x się skrócą.'],
    steps: [r`$-2x + 17 = -10x + 29 \Rightarrow 8x = 12$.`, r`$x = \frac32$.`],
    errors: [['3', 'Wzięta pierwsza współrzędna środka odcinka AB.', 'Środek AB zwykle nie leży na osi Ox — trzeba rozwiązać równanie.']],
  }),

  // geo-line (dopisane) -------------------------------------------------------
  numeric({
    id: 'g-line-1',
    skill: 'geo-line',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Prosta $y = -2x + 7$ przecina oś $Oy$ w punkcie $(0, c)$. Podaj $c$.`,
    answer: 7,
    verify: () => -2 * 0 + 7,
    hints: ['Jaką pierwszą współrzędną mają punkty osi Oy?', 'Zero.', r`Wstaw $x = 0$.`, 'Zostaje wyraz wolny.'],
    steps: [r`$y = -2 \cdot 0 + 7$.`, r`$c = 7$.`],
    errors: [['3.5', 'Policzone miejsce zerowe (przecięcie z osią Ox).', 'Oś Oy to x = 0.']],
  }),
  numeric({
    id: 'g-line-2',
    skill: 'geo-line',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Prosta $y = 3x + b$ jest równoległa do $y = 3x - 1$ i przechodzi przez $P = (2, 5)$. Wyznacz $b$.`,
    answer: -1,
    verify: () => 5 - 3 * 2,
    hints: ['Co wiesz o współczynniku kierunkowym prostej równoległej?', 'Jest taki sam: 3.', r`Wstaw $P$: $5 = 3 \cdot 2 + b$.`, 'Wyznacz b.'],
    steps: [r`$5 = 6 + b$.`, r`$b = -1$.`],
    errors: [['11', 'Zły znak przy przenoszeniu.', r`$b = 5 - 6$.`]],
  }),
  numeric({
    id: 'g-line-3',
    skill: 'geo-line',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Prosta $y = ax + b$ jest prostopadła do $y = \frac12 x + 3$ i przechodzi przez $P = (2, 1)$. Wyznacz $b$.`,
    answer: 5,
    verify: () => 1 - -2 * 2,
    hints: ['Jaki współczynnik ma prosta prostopadła?', r`$a \cdot \frac12 = -1$.`, r`$a = -2$; wstaw $P$: $1 = -2 \cdot 2 + b$.`, 'Wyznacz b.'],
    steps: [r`$1 = -4 + b$.`, r`$b = 5$.`],
    errors: [['-3', r`Użyte $a = 2$ — bez zmiany znaku.`, 'Prostopadła: odwrotność ze zmienionym znakiem.']],
  }),
  numeric({
    id: 'g-line-4',
    skill: 'geo-line',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Symetralna odcinka o końcach $A = (1, 1)$ i $B = (5, 3)$ ma równanie $y = ax + b$. Wyznacz $b$.`,
    answer: 8,
    verify: () => {
      const [mx, my] = [3, 2];
      const aPerp = -1 / ((3 - 1) / (5 - 1));
      return my - aPerp * mx;
    },
    hints: ['Jakie dwie własności ma symetralna?', 'Przechodzi przez środek odcinka i jest do niego prostopadła.', r`Środek $(3, 2)$, $a_{AB} = \frac{3 - 1}{5 - 1}$.`, r`Symetralna ma $a = -2$ — wstaw środek.`],
    steps: [r`$2 = -2 \cdot 3 + b$.`, r`$b = 8$.`],
    errors: [['0.5', r`Użyty współczynnik prostej $AB$ zamiast prostopadłego.`, 'Symetralna jest prostopadła do odcinka.']],
  }),

  // geo-figures ---------------------------------------------------------------
  numeric({
    id: 'g-fig-1',
    skill: 'geo-figures',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Punkt $A'$ jest symetryczny do $A = (3, -5)$ względem osi $Ox$. Podaj drugą współrzędną $A'$.`,
    answer: 5,
    verify: () => -(-5),
    hints: ['Co zmienia symetria względem osi Ox?', 'Znak drugiej współrzędnej.', r`$(x, y) \to (x, -y)$.`, r`$-(-5)$.`],
    steps: [r`$A' = (3, 5)$.`, 'Druga współrzędna: 5.'],
    errors: [['-5', 'Pominięta zmiana znaku.', 'Symetria względem Ox zmienia znak y.']],
  }),
  numeric({
    id: 'g-fig-2',
    skill: 'geo-figures',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Punkt $A'$ jest symetryczny do $A = (4, 6)$ względem punktu $S = (1, 2)$. Podaj sumę współrzędnych $A'$.`,
    answer: -4,
    verify: () => 2 * 1 - 4 + (2 * 2 - 6),
    hints: ['Czym jest punkt S dla odcinka AA′?', 'Jego środkiem.', r`$A' = (2 \cdot 1 - 4,\ 2 \cdot 2 - 6)$.`, 'Dodaj współrzędne.'],
    steps: [r`$A' = (-2, -2)$.`, r`Suma: $-4$.`],
    errors: [['-7', r`Policzone $S - A$ zamiast $2S - A$.`, r`S jest środkiem: $A' = 2S - A$.`]],
  }),
  numeric({
    id: 'g-fig-3',
    skill: 'geo-figures',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Oblicz pole trójkąta o wierzchołkach $A = (0, 0)$, $B = (6, 0)$, $C = (2, 5)$.`,
    answer: 15,
    verify: () => 0.5 * Math.abs((6 - 0) * (5 - 0) - (0 - 0) * (2 - 0)),
    hints: ['Czy któryś bok leży na osi?', r`$AB$ leży na osi $Ox$ — to podstawa długości $6$.`, r`Wysokość to odległość $C$ od osi $Ox$: $5$.`, r`$\frac12 \cdot 6 \cdot 5$.`],
    steps: [r`$P = \frac12 \cdot 6 \cdot 5$.`, r`$= 15$.`],
    errors: [['30', 'Pominięte ½.', 'Pole trójkąta to połowa podstawy razy wysokość.']],
  }),
  choice({
    id: 'g-fig-4',
    skill: 'geo-figures',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Który punkt leży na prostej $y = 2x - 3$?`,
    choices: [r`$(2, 1)$`, r`$(1, 1)$`, r`$(0, 3)$`, r`$(3, 2)$`],
    answer: 'A',
    hints: ['Jak sprawdzić, czy punkt leży na prostej?', 'Wstaw jego współrzędne do równania.', r`Dla $(2, 1)$: $2 \cdot 2 - 3$.`, 'Porównaj z drugą współrzędną.'],
    steps: [r`$2 \cdot 2 - 3 = 1$ — zgadza się.`, 'Pozostałe punkty nie spełniają równania.'],
    errors: [
      ['B', r`$2 \cdot 1 - 3 = -1 \ne 1$.`, 'Wstaw x i porównaj wynik z y.'],
      ['C', r`Zły znak wyrazu wolnego: $(0, -3)$ leży na prostej, $(0, 3)$ nie.`, 'Dla x = 0 prosta daje y = −3.'],
      ['D', r`Zamienione współrzędne: $(2, 3)$ też by nie pasował, $(3, 3)$ — tak.`, 'Pierwsza współrzędna to x.'],
    ],
  }),
  numeric({
    id: 'g-fig-5',
    skill: 'geo-figures',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Czworokąt $ABCD$ jest równoległobokiem, $A = (1, 1)$, $B = (5, 2)$, $C = (6, 5)$. Podaj sumę współrzędnych wierzchołka $D$.`,
    answer: 6,
    verify: () => 1 + 6 - 5 + (1 + 5 - 2),
    hints: ['Co wiesz o przekątnych równoległoboku?', 'Dzielą się na pół — mają wspólny środek.', r`$A + C = B + D$, więc $D = A + C - B$.`, r`$D = (1 + 6 - 5,\ 1 + 5 - 2)$.`],
    steps: [r`$D = (2, 4)$.`, r`Suma: $6$.`],
    errors: [['16', r`Policzone $B + C - A$ — zła kolejność wierzchołków.`, 'D leży naprzeciw B: D = A + C − B.']],
  }),
  numeric({
    id: 'g-fig-6',
    skill: 'geo-figures',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz pole trójkąta o wierzchołkach $A = (1, 1)$, $B = (4, 2)$, $C = (2, 5)$.`,
    answer: 5.5,
    variants: ['11/2'],
    verify: () => 0.5 * Math.abs((4 - 1) * (5 - 1) - (2 - 1) * (2 - 1)),
    hints: ['Czy któryś bok jest równoległy do osi?', 'Nie — użyj wzoru z tablic.', r`$\frac12 |(x_B - x_A)(y_C - y_A) - (y_B - y_A)(x_C - x_A)|$.`, r`$\frac12 |3 \cdot 4 - 1 \cdot 1|$.`],
    steps: [r`$\frac12 \cdot 11$.`, r`$= 5{,}5$.`],
    errors: [['11', 'Pominięte ½ we wzorze.', 'Wzór zawiera połowę wartości bezwzględnej.']],
  }),
  numeric({
    id: 'g-fig-7',
    skill: 'geo-figures',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Punkty $A = (1, 1)$ i $C = (5, 5)$ są przeciwległymi wierzchołkami kwadratu $ABCD$. Oblicz pole kwadratu.`,
    answer: 16,
    verify: () => Math.hypot(4, 4) ** 2 / 2,
    tolerance: 1e-9,
    hints: ['Czym jest odcinek AC w kwadracie?', 'Przekątną.', r`$|AC|^2 = 4^2 + 4^2$.`, r`Pole kwadratu z przekątnej: $\frac{d^2}{2}$.`],
    steps: [r`$d^2 = 32$.`, r`$P = \frac{32}{2} = 16$.`],
    errors: [['32', 'Kwadrat przekątnej wzięty jako pole.', r`Pole kwadratu to $\frac{d^2}{2}$ (romb o równych przekątnych).`]],
  }),
  numeric({
    id: 'g-fig-8',
    skill: 'geo-figures',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Trójkąt ma wierzchołki $A = (0, 0)$, $B = (8, 0)$, $C = (2, 6)$. Oblicz pole trójkąta, którego wierzchołkami są środki boków trójkąta $ABC$.`,
    answer: 6,
    verify: () => {
      // Środki boków AB, BC, CA.
      const [ax, ay, bx, by, cx, cy] = [4, 0, 5, 3, 1, 3];
      return 0.5 * Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
    },
    hints: ['Jak ma się trójkąt środków boków do całego trójkąta?', 'Jest do niego podobny w skali ½.', r`Pole $ABC$: $\frac12 \cdot 8 \cdot 6$.`, r`Skala pól: $\left(\frac12\right)^2$.`],
    steps: [r`$P_{ABC} = 24$.`, r`$P = \frac14 \cdot 24 = 6$.`],
    errors: [['12', 'Pole przeliczone skalą długości ½ zamiast ¼.', 'Skala pól to kwadrat skali długości.']],
  }),

  // geo-circle (dopisane) -----------------------------------------------------
  numeric({
    id: 'g-circ-1',
    skill: 'geo-circle',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Okrąg ma równanie $(x + 1)^2 + (y - 4)^2 = 9$. Podaj pierwszą współrzędną jego środka.`,
    answer: -1,
    verify: () => -1,
    hints: ['Jak wygląda ogólna postać kanoniczna okręgu?', r`$(x - a)^2 + (y - b)^2 = r^2$.`, r`Zapisz $x + 1$ w postaci $x - a$.`, 'Odczytaj a.'],
    steps: [r`$a = -1$.`, r`Środek $(-1, 4)$.`],
    errors: [['1', 'Znak odczytany wprost z nawiasu.', r`We wzorze jest $x - a$: $x + 1$ oznacza $a = -1$.`]],
  }),
  numeric({
    id: 'g-circ-2',
    skill: 'geo-circle',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Okrąg o środku w początku układu przechodzi przez punkt $P = (6, 8)$. Podaj jego promień.`,
    answer: 10,
    verify: () => Math.hypot(6, 8),
    hints: ['Czym jest promień w tej sytuacji?', 'Odległością środka od punktu P.', r`$r = \sqrt{36 + 64}$.`, 'Wyciągnij pierwiastek.'],
    steps: [r`$r^2 = 100$.`, r`$r = 10$.`],
    errors: [['14', 'Dodane współrzędne.', 'Promień to odległość — wzór z Pitagorasa.']],
  }),
  numeric({
    id: 'g-circ-3',
    skill: 'geo-circle',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Podaj promień okręgu $x^2 + y^2 - 4x + 6y - 12 = 0$.`,
    answer: 5,
    verify: () => Math.sqrt(4 + 9 + 12),
    hints: ['Jak sprowadzić równanie do postaci kanonicznej?', 'Uzupełnij wyrazy z x i z y do pełnych kwadratów.', r`$(x - 2)^2 - 4 + (y + 3)^2 - 9 - 12 = 0$.`, r`Przenieś stałe na prawą stronę — to $r^2$.`],
    steps: [r`$(x - 2)^2 + (y + 3)^2 = 25$.`, r`$r = 5$.`],
    errors: [['12', 'Wyraz wolny wzięty jako promień (albo r²).', 'Najpierw uzupełnij do kwadratów.']],
  }),
  numeric({
    id: 'g-circ-4',
    skill: 'geo-circle',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Okrąg przechodzi przez punkty $A = (1, 0)$ i $B = (5, 0)$, a jego środek leży na prostej $y = x$. Oblicz $r^2$.`,
    answer: 13,
    verify: () => (3 - 1) ** 2 + (3 - 0) ** 2,
    hints: ['Na jakiej prostej leży środek okręgu przechodzącego przez A i B?', r`Na symetralnej $AB$: $x = 3$.`, r`Środek leży też na $y = x$: $S = (3, 3)$.`, r`$r^2 = |SA|^2$.`],
    steps: [r`$r^2 = (3 - 1)^2 + 3^2$.`, r`$= 13$.`],
    errors: [['9', 'Wzięta odległość środka od osi Ox.', 'Promień to odległość środka od punktu okręgu, np. A.']],
  }),

  // geo-point-line ------------------------------------------------------------
  numeric({
    id: 'g-pl-1',
    skill: 'geo-point-line',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz odległość punktu $P = (1, 2)$ od prostej $y = 5$.`,
    answer: 3,
    verify: () => Math.abs(5 - 2),
    hints: ['Jak leży prosta y = 5?', 'Poziomo.', 'Odległość od prostej poziomej to różnica drugich współrzędnych.', r`$|5 - 2|$.`],
    steps: [r`$d = |5 - 2|$.`, r`$= 3$.`],
    errors: [['7', 'Dodane zamiast odjęte.', 'Odległość to wartość bezwzględna różnicy.']],
  }),
  numeric({
    id: 'g-pl-2',
    skill: 'geo-point-line',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz odległość początku układu współrzędnych od prostej $3x + 4y - 10 = 0$.`,
    answer: 2,
    verify: () => Math.abs(-10) / Math.hypot(3, 4),
    hints: ['Jaki wzór opisuje odległość punktu od prostej?', r`$d = \frac{|Ax_0 + By_0 + C|}{\sqrt{A^2 + B^2}}$.`, r`$d = \frac{|0 + 0 - 10|}{\sqrt{9 + 16}}$.`, 'Policz mianownik.'],
    steps: [r`$d = \frac{10}{5}$.`, r`$= 2$.`],
    errors: [['10', 'Pominięty mianownik.', r`Licznik dzielisz przez $\sqrt{A^2 + B^2}$.`]],
  }),
  numeric({
    id: 'g-pl-3',
    skill: 'geo-point-line',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz odległość punktu $P = (2, 1)$ od prostej $4x - 3y + 5 = 0$.`,
    answer: 2,
    verify: () => Math.abs(4 * 2 - 3 * 1 + 5) / Math.hypot(4, 3),
    hints: ['Jakie są A, B, C tej prostej?', r`$A = 4$, $B = -3$, $C = 5$.`, r`$\frac{|8 - 3 + 5|}{\sqrt{16 + 9}}$.`, 'Policz.'],
    steps: [r`$\frac{10}{5}$.`, r`$= 2$.`],
    errors: [['3.2', r`Zgubiony znak $B$: $\frac{|8 + 3 + 5|}{5}$.`, r`$B = -3$, więc $By_0 = -3$.`]],
  }),
  choice({
    id: 'g-pl-4',
    skill: 'geo-point-line',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Okrąg $(x - 1)^2 + (y - 2)^2 = 4$ i prosta $y = 5$`,
    choices: ['nie mają punktów wspólnych', 'są styczne', 'przecinają się w dwóch punktach', 'prosta przechodzi przez środek okręgu'],
    answer: 'A',
    hints: ['Co porównujesz, żeby ustalić położenie prostej i okręgu?', 'Odległość środka od prostej z promieniem.', r`Środek $(1, 2)$, prosta $y = 5$: odległość $3$; promień $2$.`, r`$3 > 2$.`],
    steps: [r`$d = 3$, $r = 2$.`, r`$d > r$ — rozłączne.`],
    errors: [
      ['B', r`Porównanie $d$ z $r^2 = 4$ zamiast z $r$.`, 'Styczność: d = r, a r = 2.'],
      ['C', 'Odwrócona nierówność.', r`Sieczna wymaga $d < r$.`],
      ['D', r`Środek $(1, 2)$ nie leży na prostej $y = 5$.`, 'Sprawdź współrzędną y środka.'],
    ],
  }),
  numeric({
    id: 'g-pl-5',
    skill: 'geo-point-line',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Okrąg o środku $S = (1, 1)$ jest styczny do prostej $3x + 4y + 3 = 0$. Oblicz jego promień.`,
    answer: 2,
    verify: () => Math.abs(3 + 4 + 3) / 5,
    hints: ['Czemu jest równy promień okręgu stycznego do prostej?', 'Odległości środka od tej prostej.', r`$r = \frac{|3 + 4 + 3|}{\sqrt{9 + 16}}$.`, 'Policz.'],
    steps: [r`$r = \frac{10}{5}$.`, r`$= 2$.`],
    errors: [['10', 'Pominięty mianownik we wzorze.', r`Dzielisz przez $\sqrt{A^2 + B^2} = 5$.`]],
  }),
  numeric({
    id: 'g-pl-6',
    skill: 'geo-point-line',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Okrąg $o_1$ ma środek $(0, 0)$ i promień $3$, a okrąg $o_2$ — środek $(8, 6)$. Dla jakiego promienia $o_2$ okręgi są styczne zewnętrznie?`,
    answer: 7,
    verify: () => Math.hypot(8, 6) - 3,
    hints: ['Jaki warunek opisuje styczność zewnętrzną?', r`$|S_1S_2| = r_1 + r_2$.`, r`$|S_1S_2| = \sqrt{64 + 36}$.`, r`$r_2 = |S_1S_2| - 3$.`],
    steps: [r`$|S_1S_2| = 10$.`, r`$r_2 = 10 - 3 = 7$.`],
    errors: [['13', 'Promień dodany zamiast odjęty.', r`$r_2 = |S_1S_2| - r_1$.`]],
  }),
  numeric({
    id: 'g-pl-7',
    skill: 'geo-point-line',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Prosta $y = 3$ przecina okrąg $x^2 + y^2 = 25$ w dwóch punktach. Oblicz długość cięciwy między nimi.`,
    answer: 8,
    verify: () => 2 * Math.sqrt(25 - 9),
    hints: ['Jak znaleźć punkty wspólne prostej i okręgu?', r`Wstaw $y = 3$ do równania okręgu.`, r`$x^2 = 25 - 9$.`, 'Cięciwa łączy dwa punkty o przeciwnych x.'],
    steps: [r`$x = \pm 4$.`, r`Długość: $4 - (-4) = 8$.`],
    errors: [['4', 'Podana tylko połowa cięciwy.', 'Cięciwa biegnie od x = −4 do x = 4.']],
  }),
  numeric({
    id: 'g-pl-8',
    skill: 'geo-point-line',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Prosta $y = x + m$ jest styczna do okręgu $x^2 + y^2 = 8$. Podaj dodatnią wartość $m$.`,
    answer: 4,
    verify: () => Math.sqrt(8) * Math.SQRT2,
    tolerance: 1e-9,
    hints: ['Jak zapisać prostą w postaci ogólnej?', r`$x - y + m = 0$.`, r`Odległość środka $(0, 0)$ od prostej: $\frac{|m|}{\sqrt2}$ — ma być równa promieniowi $\sqrt8$.`, r`$|m| = \sqrt8 \cdot \sqrt2$.`],
    steps: [r`$|m| = \sqrt{16}$.`, r`$m = 4$ (albo $-4$).`],
    errors: [['8', r`Odległość porównana z $r^2$ i pominięty mianownik.`, r`Promień to $\sqrt8$, a odległość ma mianownik $\sqrt2$.`]],
  }),
];

export const GEO_COURSE_QUESTIONS: Question[] = [...GEO_QUESTIONS, ...NEW_QUESTIONS];

// ===========================================================================
// Fiszki
// ===========================================================================

export const GEO_CARDS: Flashcard[] = [
  card('c-geo-d-1', 'geo-distance', 'wzor', 'Długość odcinka AB?', r`$\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$`),
  card('c-geo-d-2', 'geo-distance', 'wzor', 'Środek odcinka AB?', r`$\left(\frac{x_A + x_B}{2}, \frac{y_A + y_B}{2}\right)$`),

  card('c-geo-l-1', 'geo-line', 'wzor', 'Współczynnik kierunkowy z dwóch punktów?', r`$a = \frac{y_B - y_A}{x_B - x_A}$`),
  card('c-geo-l-2', 'geo-line', 'metoda', 'Symetralna odcinka AB?', 'Przez środek AB, prostopadła do AB.'),

  card('c-geo-f-1', 'geo-figures', 'metoda', 'Czwarty wierzchołek równoległoboku ABCD?', r`$D = A + C - B$`),
  card('c-geo-f-2', 'geo-figures', 'wzor', 'Symetria punktu (x, y) względem Ox, Oy, O?', r`$(x, -y)$, $(-x, y)$, $(-x, -y)$`),

  card('c-geo-c-1', 'geo-circle', 'wzor', 'Równanie okręgu o środku (a, b) i promieniu r?', r`$(x - a)^2 + (y - b)^2 = r^2$`),
  card('c-geo-c-2', 'geo-circle', 'pulapka', r`$(x + 3)^2 + y^2 = 16$ — środek i promień?`, r`$(-3, 0)$ i $4$ (nie $16$).`),

  card('c-geo-p-1', 'geo-point-line', 'wzor', 'Odległość punktu od prostej Ax + By + C = 0?', r`$\frac{|Ax_0 + By_0 + C|}{\sqrt{A^2 + B^2}}$`),
  card('c-geo-p-2', 'geo-point-line', 'metoda', 'Kiedy prosta jest styczna do okręgu?', 'Gdy odległość środka od prostej równa się promieniowi.'),
];

import type { Flashcard, GeometryFigure, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 13: Stereometria.
 *
 * Graniastosłupy, ostrosłupy, kąty w bryłach, bryły obrotowe i (na
 * rozszerzeniu) przekroje oraz bryły wpisane. Bryły rysujemy w rzucie
 * ukośnym: krawędzie niewidoczne są przerywane, jak w zeszycie.
 */

const r = String.raw;

export const STEREO_TOPIC: Topic = {
  id: 'math-stereometry',
  subjectId: 'math',
  name: 'Stereometria',
  summary: 'Graniastosłupy i ostrosłupy, przekątne i wysokości, kąty w bryłach, walec, stożek i kula, przekroje.',
};

export const STEREO_SKILLS: Skill[] = [
  {
    id: 'stereo-prisms',
    topicId: 'math-stereometry',
    name: 'Graniastosłupy: objętość, pole, przekątne',
    level: 'PP',
    ckeRequirement: 'Stereometria — graniastosłupy proste i prawidłowe, objętość, pole powierzchni, przekątne',
    prerequisites: ['plan-triangles', 'plan-quadrilaterals'],
    examValue: 0.65,
  },
  {
    id: 'stereo-pyramids',
    topicId: 'math-stereometry',
    name: 'Ostrosłupy: objętość, wysokości, krawędzie',
    level: 'PP',
    ckeRequirement: 'Stereometria — ostrosłupy prawidłowe, objętość, pole powierzchni, wysokość ściany bocznej',
    prerequisites: ['stereo-prisms'],
    examValue: 0.65,
  },
  {
    id: 'stereo-angles',
    topicId: 'math-stereometry',
    name: 'Kąty w bryłach',
    level: 'PP',
    ckeRequirement: 'Stereometria — kąt nachylenia odcinka i ściany do płaszczyzny podstawy',
    prerequisites: ['stereo-pyramids', 'trig-values'],
    examValue: 0.6,
  },
  {
    id: 'stereo-solids',
    topicId: 'math-stereometry',
    name: 'Walec, stożek, kula',
    level: 'PP',
    ckeRequirement: 'Stereometria — bryły obrotowe: objętość i pole powierzchni walca, stożka i kuli',
    prerequisites: ['stereo-pyramids', 'plan-circle'],
    examValue: 0.6,
  },
  {
    id: 'stereo-advanced',
    topicId: 'math-stereometry',
    name: 'Przekroje i bryły wpisane',
    level: 'PR',
    ckeRequirement: 'Stereometria — przekroje wielościanów, kąty między ścianami, bryły wpisane i opisane',
    prerequisites: ['stereo-angles', 'stereo-solids', 'plan-inscribed'],
    examValue: 0.55,
  },
];

// ===========================================================================
// Rysunki (rzut ukośny)
// ===========================================================================

const BOX_POINTS = (h: number): Record<string, [number, number]> => ({
  A: [0, 0], B: [4, 0], C: [5.5, 1.5], D: [1.5, 1.5],
  E: [0, h], F: [4, h], G: [5.5, 1.5 + h], H: [1.5, 1.5 + h],
});

const BOX_EDGES: GeometryFigure['segments'] = [
  { from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'E', to: 'F' }, { from: 'F', to: 'G' },
  { from: 'G', to: 'H' }, { from: 'H', to: 'E' }, { from: 'A', to: 'E' }, { from: 'B', to: 'F' },
  { from: 'C', to: 'G' },
  { from: 'A', to: 'D', dashed: true }, { from: 'D', to: 'C', dashed: true }, { from: 'D', to: 'H', dashed: true },
];

/** Prostopadłościan z przekątną bryły AG i przekątną podstawy AC. */
const cuboid: GeometryFigure = {
  kind: 'geometry',
  alt: 'Prostopadłościan ABCDEFGH w rzucie ukośnym. Zaznaczona przekątna podstawy AC (przerywana) i przekątna bryły AG; między nimi kąt α.',
  points: BOX_POINTS(3),
  segments: [
    ...(BOX_EDGES ?? []),
    { from: 'A', to: 'C', dashed: true },
    { from: 'A', to: 'G', label: 'd' },
  ],
  angles: [{ at: 'A', from: 'C', to: 'G', label: 'α' }],
};

/** Ostrosłup prawidłowy czworokątny z wysokością, wysokością ściany i kątami. */
const pyramid: GeometryFigure = {
  kind: 'geometry',
  alt: 'Ostrosłup prawidłowy czworokątny ABCDS. Wysokość SO (przerywana) pada w środek podstawy O. M to środek krawędzi BC, SM to wysokość ściany bocznej. Kąt α między krawędzią SA a podstawą, kąt β między ścianą SBC a podstawą.',
  points: {
    A: [0, 0], B: [4, 0], C: [5.5, 1.5], D: [1.5, 1.5],
    O: [2.75, 0.75], S: [2.75, 4.5], M: [4.75, 0.75],
  },
  segments: [
    { from: 'A', to: 'B' }, { from: 'B', to: 'C' },
    { from: 'C', to: 'D', dashed: true }, { from: 'D', to: 'A', dashed: true },
    { from: 'S', to: 'A' }, { from: 'S', to: 'B' }, { from: 'S', to: 'C' }, { from: 'S', to: 'D', dashed: true },
    { from: 'S', to: 'O', dashed: true, label: 'H' }, { from: 'A', to: 'O', dashed: true },
    { from: 'O', to: 'M', dashed: true }, { from: 'S', to: 'M', label: 'h' },
  ],
  angles: [
    { at: 'A', from: 'O', to: 'S', label: 'α' },
    { at: 'M', from: 'O', to: 'S', label: 'β' },
  ],
};

/** Przekrój osiowy stożka. */
const coneSection: GeometryFigure = {
  kind: 'geometry',
  alt: 'Przekrój osiowy stożka: trójkąt równoramienny ASB. Wysokość SO opada na środek podstawy O, OB to promień r, SB to tworząca l.',
  points: { A: [-3, 0], B: [3, 0], S: [0, 4], O: [0, 0] },
  polygons: [{ vertices: ['A', 'B', 'S'] }],
  segments: [
    { from: 'S', to: 'O', dashed: true, label: 'h' },
    { from: 'O', to: 'B', label: 'r' },
    { from: 'S', to: 'B', label: 'l' },
  ],
  angles: [{ at: 'O', from: 'B', to: 'S', right: true }],
};

/** Sześcian z przekrojem przez trzy wierzchołki sąsiednie z A. */
const cubeSection: GeometryFigure = {
  kind: 'geometry',
  alt: 'Sześcian ABCDEFGH. Płaszczyzna przechodzi przez wierzchołki B, D i E — sąsiednie z wierzchołkiem A — i tnie sześcian wzdłuż trójkąta BDE.',
  points: BOX_POINTS(4),
  segments: BOX_EDGES,
  polygons: [{ vertices: ['B', 'D', 'E'] }],
};

// ===========================================================================
// Lekcje
// ===========================================================================

export const STEREO_LESSONS: Lesson[] = [
  {
    skillId: 'stereo-prisms',
    minutes: 12,
    intro:
      'Graniastosłup to bryła o dwóch równoległych, przystających podstawach połączonych prostokątami. Prawie każde zadanie sprowadza się do trójkąta prostokątnego ukrytego w środku bryły.',
    blocks: [
      f(r`V = P_p \cdot H \qquad P_c = 2P_p + P_b`),
      { kind: 'figure', figure: cuboid, caption: 'Przekątna bryły d, przekątna podstawy AC i krawędź boczna tworzą trójkąt prostokątny.' },
      f(r`d = \sqrt{a^2 + b^2 + c^2} \qquad d_{\text{sześcianu}} = a\sqrt3`),
      p(r`Graniastosłup prawidłowy ma w podstawie wielokąt foremny: trójkąt równoboczny, kwadrat albo sześciokąt foremny.`),
      warn(r`Pole powierzchni całkowitej zawiera DWIE podstawy. Zapomniana druga podstawa to klasyczny błąd za punkt.`),
    ],
    examples: [
      example(
        r`Prostopadłościan ma wymiary $3 \times 4 \times 12$. Oblicz długość jego przekątnej.`,
        [r`$d^2 = 9 + 16 + 144 = 169$.`, r`$d = 13$.`],
        r`$13$`,
      ),
      example(
        r`Graniastosłup prawidłowy czworokątny: krawędź podstawy $4$, wysokość $5$. Oblicz pole powierzchni całkowitej.`,
        [r`$P_p = 16$, $P_b = 4 \cdot 4 \cdot 5 = 80$.`, r`$P_c = 2 \cdot 16 + 80 = 112$.`],
        r`$112$`,
      ),
    ],
    pitfalls: ['Jedna podstawa zamiast dwóch w polu całkowitym.', 'Przekątna ściany pomylona z przekątną bryły.', 'Pole podstawy trójkąta równobocznego bez czynnika √3/4.'],
  },
  {
    skillId: 'stereo-pyramids',
    minutes: 14,
    intro:
      'Ostrosłup ma jedną podstawę i wierzchołek nad nią. Objętość to jedna trzecia objętości graniastosłupa o tej samej podstawie i wysokości — trzy ostrosłupy „mieszczą się” w jednym graniastosłupie.',
    blocks: [
      f(r`V = \frac13 P_p \cdot H`),
      { kind: 'figure', figure: pyramid, caption: 'W ostrosłupie prawidłowym wysokość H pada w środek podstawy O.' },
      p(r`W ostrosłupie prawidłowym czworokątnym są dwa ważne trójkąty prostokątne: $SOM$ (wysokość $H$, połowa krawędzi podstawy, wysokość ściany $h$) i $SOA$ (wysokość $H$, połowa przekątnej podstawy, krawędź boczna).`),
      tip(r`Połowa krawędzi podstawy — do wysokości ściany bocznej. Połowa przekątnej podstawy — do krawędzi bocznej.`),
      warn(r`Nie myl wysokości ostrosłupa $H$ z wysokością ściany bocznej $h$. Do objętości zawsze bierzesz $H$.`),
    ],
    examples: [
      example(
        r`Ostrosłup prawidłowy czworokątny: krawędź podstawy $6$, wysokość $4$. Oblicz wysokość ściany bocznej i pole powierzchni bocznej.`,
        [r`Trójkąt $SOM$: $h^2 = 4^2 + 3^2 = 25$, $h = 5$.`, r`$P_b = 4 \cdot \frac12 \cdot 6 \cdot 5 = 60$.`],
        r`$h = 5$, $P_b = 60$`,
      ),
      example(
        r`Ten sam ostrosłup — oblicz objętość.`,
        [r`$P_p = 36$.`, r`$V = \frac13 \cdot 36 \cdot 4 = 48$.`],
        r`$48$`,
      ),
    ],
    pitfalls: ['Brak ⅓ we wzorze na objętość.', 'Wysokość ściany bocznej wzięta jako wysokość ostrosłupa.', 'Połowa krawędzi zamiast połowy przekątnej (i odwrotnie).'],
  },
  {
    skillId: 'stereo-angles',
    minutes: 14,
    intro:
      'Kąt nachylenia odcinka do płaszczyzny to kąt między tym odcinkiem a jego rzutem na płaszczyznę. Kąt ściany — kąt między dwoma odcinkami prostopadłymi do wspólnej krawędzi. Znajdź właściwy trójkąt prostokątny, a resztę załatwi trygonometria.',
    blocks: [
      p(r`Przekątna bryły a podstawa: kąt między $AG$ a przekątną podstawy $AC$. Krawędź boczna ostrosłupa a podstawa: kąt między $SA$ a $AO$ (połową przekątnej). Ściana boczna a podstawa: kąt między $SM$ a $OM$ (obie prostopadłe do krawędzi $BC$).`),
      { kind: 'figure', figure: pyramid, caption: 'α — kąt krawędzi bocznej z podstawą; β — kąt ściany bocznej z podstawą.' },
      f(r`\mathrm{tg}\,\alpha = \frac{H}{\frac{d}{2}} \qquad \mathrm{tg}\,\beta = \frac{H}{\frac{a}{2}}`, 'ostrosłup prawidłowy czworokątny: d — przekątna, a — krawędź podstawy'),
      warn('Kąt ściany z podstawą NIE jest kątem przy krawędzi podstawy w trójkącie ściany. Jego ramiona muszą być prostopadłe do krawędzi.'),
    ],
    examples: [
      example(
        r`Prostopadłościan ma podstawę $3 \times 4$ i wysokość $5$. Pod jakim kątem przekątna bryły jest nachylona do podstawy?`,
        [r`Przekątna podstawy: $5$.`, r`$\mathrm{tg}\,\alpha = \frac{5}{5} = 1 \Rightarrow \alpha = 45^\circ$.`],
        r`$45^\circ$`,
      ),
      example(
        r`Ostrosłup prawidłowy czworokątny o krawędzi podstawy $6$; ściana boczna tworzy z podstawą kąt $60^\circ$. Oblicz wysokość.`,
        [r`$\mathrm{tg}\,60^\circ = \frac{H}{3}$.`, r`$H = 3\sqrt3$.`],
        r`$3\sqrt3$`,
      ),
    ],
    pitfalls: ['Kąt ściany wzięty przy krawędzi podstawy w trójkącie ściany.', 'Połowa krawędzi zamiast połowy przekątnej przy kącie krawędzi bocznej.', 'Sinus zamiast tangensa (i odwrotnie).'],
  },
  {
    skillId: 'stereo-solids',
    minutes: 12,
    intro:
      'Walec, stożek i kula powstają przez obrót prostokąta, trójkąta prostokątnego i półkola. Zadania z nimi rozwiązuje się na przekroju osiowym — płaskim rysunku przez oś obrotu.',
    blocks: [
      f(r`V_{\text{walca}} = \pi r^2 h \qquad V_{\text{stożka}} = \frac13 \pi r^2 h \qquad V_{\text{kuli}} = \frac43 \pi r^3`),
      f(r`P_b^{\text{walca}} = 2\pi r h \qquad P_b^{\text{stożka}} = \pi r l \qquad P_{\text{kuli}} = 4\pi r^2`),
      { kind: 'figure', figure: coneSection, caption: 'Przekrój osiowy stożka: r² + h² = l².' },
      tip(r`Wyniki na maturze zwykle zostawiasz z $\pi$: $36\pi$, a nie $113{,}1$.`),
      warn('Średnica to nie promień. „Puszka o średnicy 8” ma promień 4.'),
    ],
    examples: [
      example(
        r`Stożek ma promień $3$ i wysokość $4$. Oblicz objętość i pole powierzchni bocznej.`,
        [r`$V = \frac13 \pi \cdot 9 \cdot 4 = 12\pi$.`, r`$l = 5$, $P_b = \pi \cdot 3 \cdot 5 = 15\pi$.`],
        r`$V = 12\pi$, $P_b = 15\pi$`,
      ),
      example(
        r`Kulę o promieniu $6$ przetopiono na stożek o promieniu podstawy $6$. Jaka jest jego wysokość?`,
        [r`$\frac13 \pi \cdot 36 \cdot h = \frac43 \pi \cdot 216$.`, r`$12h = 288 \Rightarrow h = 24$.`],
        r`$24$`,
      ),
    ],
    pitfalls: ['Średnica wstawiona jako promień.', 'Brak ⅓ w objętości stożka albo 4/3 w objętości kuli.', 'Pole boczne stożka z wysokością zamiast tworzącej.'],
  },
  {
    skillId: 'stereo-advanced',
    minutes: 14,
    intro:
      'Na rozszerzeniu pojawiają się przekroje brył płaszczyzną i bryły wpisane jedna w drugą. Klucz jest zawsze ten sam: znaleźć płaski rysunek, na którym widać wszystkie potrzebne odcinki.',
    blocks: [
      { kind: 'figure', figure: cubeSection, caption: 'Przekrój sześcianu przez wierzchołki B, D, E: trójkąt równoboczny o boku a√2.' },
      p(r`Przekrój przez przekątne dwóch przeciwległych ścian sześcianu to prostokąt $a \times a\sqrt2$. Przekrój przez trzy wierzchołki sąsiednie z jednym wierzchołkiem to trójkąt równoboczny o boku $a\sqrt2$.`),
      p(r`Kula wpisana w stożek: na przekroju osiowym to okrąg wpisany w trójkąt równoramienny — promień liczysz z $r = \frac{P}{p}$.`),
      tip('Kąt między ścianami mierzysz w płaszczyźnie prostopadłej do ich wspólnej krawędzi — tak samo jak kąt ściany bocznej z podstawą.'),
      warn('Przekrój musi leżeć w jednej płaszczyźnie. Sprawdź, czy wszystkie punkty, przez które prowadzisz płaszczyznę, naprawdę w niej leżą.'),
    ],
    examples: [
      example(
        r`Oblicz pole przekroju sześcianu o krawędzi $2$ płaszczyzną przechodzącą przez trzy wierzchołki sąsiednie z jednym wierzchołkiem.`,
        [r`Bok trójkąta: przekątna ściany $2\sqrt2$.`, r`$P = \frac{(2\sqrt2)^2\sqrt3}{4} = 2\sqrt3$.`],
        r`$2\sqrt3$`,
      ),
      example(
        r`W stożek o promieniu $6$ i wysokości $8$ wpisano kulę. Oblicz jej promień.`,
        [r`Przekrój osiowy: trójkąt o podstawie $12$, ramionach $10$, polu $48$.`, r`$r = \frac{48}{16} = 3$.`],
        r`$3$`,
      ),
    ],
    pitfalls: ['Przekrój narysowany przez punkty, które nie leżą w jednej płaszczyźnie.', 'Promień kuli wpisanej wzięty jako połowa wysokości stożka.', 'Kąt między ścianami mierzony nie w płaszczyźnie prostopadłej do krawędzi.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const STEREO_QUESTIONS: Question[] = [
  // stereo-prisms -------------------------------------------------------------
  numeric({
    id: 'st-pr-1',
    skill: 'stereo-prisms',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz objętość prostopadłościanu o wymiarach $3 \times 4 \times 5$.`,
    answer: 60,
    verify: () => 3 * 4 * 5,
    hints: ['Jak liczysz objętość prostopadłościanu?', 'Mnożysz trzy wymiary.', r`$3 \cdot 4 \cdot 5$.`, 'Pomnóż.'],
    steps: [r`$V = 3 \cdot 4 \cdot 5$.`, r`$= 60$.`],
    errors: [['94', 'Policzone pole powierzchni zamiast objętości.', 'Objętość to iloczyn wymiarów.']],
  }),
  numeric({
    id: 'st-pr-2',
    skill: 'stereo-prisms',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Przekątna sześcianu ma długość $6\sqrt3$. Oblicz długość krawędzi sześcianu.`,
    answer: 6,
    verify: () => (6 * Math.sqrt(3)) / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['Jaki wzór łączy przekątną sześcianu z krawędzią?', r`$d = a\sqrt3$.`, r`$a\sqrt3 = 6\sqrt3$.`, 'Podziel obie strony przez √3.'],
    steps: [r`$a\sqrt3 = 6\sqrt3$.`, r`$a = 6$.`],
    errors: [['2', r`Przekątna podzielona przez $3$ zamiast przez $\sqrt3$.`, r`$d = a\sqrt3$ — dzielisz przez pierwiastek.`]],
  }),
  numeric({
    id: 'st-pr-3',
    skill: 'stereo-prisms',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Oblicz pole powierzchni całkowitej sześcianu o krawędzi $3$.`,
    answer: 54,
    verify: () => 6 * 3 ** 2,
    hints: ['Ile ścian ma sześcian i jakie?', 'Sześć jednakowych kwadratów.', r`Pole jednej ściany: $3^2$.`, 'Pomnóż przez liczbę ścian.'],
    steps: [r`$6 \cdot 9$.`, r`$= 54$.`],
    errors: [['27', 'Policzona objętość.', 'Pole powierzchni to suma pól ścian.']],
  }),
  numeric({
    id: 'st-pr-4',
    skill: 'stereo-prisms',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Prostopadłościan ma wymiary $3 \times 4 \times 12$. Oblicz długość jego przekątnej.`,
    answer: 13,
    verify: () => Math.sqrt(9 + 16 + 144),
    hints: ['Jaki wzór opisuje przekątną prostopadłościanu?', r`$d = \sqrt{a^2 + b^2 + c^2}$.`, r`$d = \sqrt{9 + 16 + 144}$.`, 'Wyciągnij pierwiastek.'],
    steps: [r`$d^2 = 169$.`, r`$d = 13$.`],
    errors: [['19', 'Dodane wymiary.', 'Przekątna to pierwiastek z sumy kwadratów wymiarów.']],
  }),
  numeric({
    id: 'st-pr-5',
    skill: 'stereo-prisms',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Graniastosłup prawidłowy czworokątny ma krawędź podstawy $4$ i wysokość $5$. Oblicz jego pole powierzchni całkowitej.`,
    answer: 112,
    verify: () => 2 * 16 + 4 * 4 * 5,
    hints: ['Z czego składa się powierzchnia całkowita?', 'Z dwóch podstaw i czterech ścian bocznych.', r`$P_p = 16$, ściana boczna $4 \cdot 5$.`, r`$2 \cdot 16 + 4 \cdot 20$.`],
    steps: [r`$32 + 80$.`, r`$= 112$.`],
    errors: [['96', 'Policzona tylko jedna podstawa.', 'Graniastosłup ma dwie podstawy.']],
  }),
  choice({
    id: 'st-pr-6',
    skill: 'stereo-prisms',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ile krawędzi ma graniastosłup sześciokątny?',
    choices: [r`$18$`, r`$12$`, r`$24$`, r`$8$`],
    answer: 'A',
    verify: () => 3 * 6,
    hints: ['Z jakich części składają się krawędzie graniastosłupa?', 'Krawędzie dolnej podstawy, górnej podstawy i krawędzie boczne.', 'Każda z tych grup ma tyle krawędzi, ile boków ma podstawa.', r`$3 \cdot 6$.`],
    steps: [r`$6 + 6 + 6$.`, r`$= 18$.`],
    errors: [
      ['B', 'Policzone tylko krawędzie dwóch podstaw.', 'Dochodzą jeszcze krawędzie boczne.'],
      ['C', r`Policzone $4 \cdot 6$.`, 'Są trzy grupy krawędzi, nie cztery.'],
      ['D', 'Policzona liczba ścian.', 'Ścian jest 8, krawędzi — 18.'],
    ],
  }),
  numeric({
    id: 'st-pr-7',
    skill: 'stereo-prisms',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Graniastosłup prawidłowy trójkątny ma krawędź podstawy $6$ i wysokość $10$. Jego objętość ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 90,
    verify: () => ((36 * Math.sqrt(3)) / 4) * 10 / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['Jaki kształt ma podstawa?', 'Trójkąt równoboczny.', r`$P_p = \frac{6^2\sqrt3}{4}$.`, r`$V = P_p \cdot 10$.`],
    steps: [r`$P_p = 9\sqrt3$.`, r`$V = 90\sqrt3$, $k = 90$.`],
    errors: [['180', r`Pole podstawy policzone jako $\frac{a^2\sqrt3}{2}$.`, r`Pole trójkąta równobocznego: $\frac{a^2\sqrt3}{4}$.`]],
  }),
  numeric({
    id: 'st-pr-8',
    skill: 'stereo-prisms',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Suma długości wszystkich krawędzi prostopadłościanu wynosi $48$, a jego przekątna ma długość $10$. Oblicz pole powierzchni całkowitej.`,
    answer: 44,
    verify: () => (48 / 4) ** 2 - 10 ** 2,
    hints: ['Ile krawędzi każdej długości ma prostopadłościan?', r`Po cztery: $4(a + b + c) = 48$, więc $a + b + c = 12$.`, r`$a^2 + b^2 + c^2 = 100$.`, r`$(a + b + c)^2 = a^2 + b^2 + c^2 + 2(ab + bc + ca)$.`],
    steps: [r`$144 = 100 + 2(ab + bc + ca)$.`, r`$P_c = 2(ab + bc + ca) = 44$.`],
    errors: [['22', r`Podane $ab + bc + ca$ zamiast $2(ab + bc + ca)$.`, 'Każda ściana występuje dwa razy.']],
  }),

  // stereo-pyramids -----------------------------------------------------------
  numeric({
    id: 'st-py-1',
    skill: 'stereo-pyramids',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Ostrosłup ma podstawę o polu $12$ i wysokość $5$. Oblicz jego objętość.`,
    answer: 20,
    verify: () => (12 * 5) / 3,
    hints: ['Jaki jest wzór na objętość ostrosłupa?', r`$V = \frac13 P_p H$.`, r`$\frac13 \cdot 12 \cdot 5$.`, 'Policz.'],
    steps: [r`$\frac{60}{3}$.`, r`$= 20$.`],
    errors: [['60', 'Pominięte ⅓.', 'Objętość ostrosłupa to jedna trzecia iloczynu pola podstawy i wysokości.']],
  }),
  numeric({
    id: 'st-py-2',
    skill: 'stereo-pyramids',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $4$. Oblicz jego objętość.`,
    answer: 48,
    verify: () => (36 * 4) / 3,
    hints: ['Jaka jest podstawa ostrosłupa prawidłowego czworokątnego?', 'Kwadrat.', r`$P_p = 36$.`, r`$V = \frac13 \cdot 36 \cdot 4$.`],
    steps: [r`$V = 12 \cdot 4$.`, r`$= 48$.`],
    errors: [['144', 'Pominięte ⅓.', r`$V = \frac13 P_p H$.`]],
  }),
  choice({
    id: 'st-py-3',
    skill: 'stereo-pyramids',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Ile krawędzi ma ostrosłup pięciokątny?',
    choices: [r`$10$`, r`$5$`, r`$15$`, r`$6$`],
    answer: 'A',
    verify: () => 2 * 5,
    hints: ['Jakie krawędzie ma ostrosłup?', 'Krawędzie podstawy i krawędzie boczne.', 'Ile jest każdych?', r`$5 + 5$.`],
    steps: [r`$5$ krawędzi podstawy $+ 5$ bocznych.`, r`$= 10$.`],
    errors: [
      ['B', 'Policzone tylko krawędzie podstawy.', 'Dochodzą krawędzie boczne.'],
      ['C', 'Liczenie jak w graniastosłupie.', 'Ostrosłup ma jedną podstawę.'],
      ['D', 'Policzona liczba wierzchołków.', 'Wierzchołków jest 6, krawędzi 10.'],
    ],
  }),
  numeric({
    id: 'st-py-4',
    skill: 'stereo-pyramids',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $4$. Oblicz wysokość ściany bocznej.`,
    answer: 5,
    verify: () => Math.hypot(4, 3),
    hints: ['Jaki trójkąt prostokątny zawiera wysokość ściany bocznej?', 'Wysokość ostrosłupa, odcinek od środka podstawy do środka krawędzi i wysokość ściany.', r`Odcinek od środka do krawędzi: połowa krawędzi, $3$.`, r`$h^2 = 4^2 + 3^2$.`],
    steps: [r`$h^2 = 25$.`, r`$h = 5$.`],
    errors: [['7', 'Dodane długości.', 'Pitagoras: kwadraty, potem pierwiastek.']],
  }),
  numeric({
    id: 'st-py-5',
    skill: 'stereo-pyramids',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$, a wysokość jego ściany bocznej wynosi $5$. Oblicz pole powierzchni bocznej.`,
    answer: 60,
    verify: () => 4 * 0.5 * 6 * 5,
    hints: ['Z ilu jakich ścian składa się powierzchnia boczna?', 'Z czterech jednakowych trójkątów.', r`Pole jednej ściany: $\frac12 \cdot 6 \cdot 5$.`, 'Pomnóż przez 4.'],
    steps: [r`$4 \cdot 15$.`, r`$= 60$.`],
    errors: [['120', 'Pominięte ½ w polu trójkąta.', 'Ściana boczna to trójkąt.']],
  }),
  numeric({
    id: 'st-py-6',
    skill: 'stereo-pyramids',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Ostrosłup prawidłowy czworokątny ma krawędź podstawy $8$ i wysokość $7$. Oblicz długość krawędzi bocznej.`,
    answer: 9,
    verify: () => Math.sqrt((8 * Math.SQRT2 / 2) ** 2 + 49),
    tolerance: 1e-9,
    hints: ['Jaki trójkąt prostokątny zawiera krawędź boczną?', 'Wysokość, połowa przekątnej podstawy i krawędź boczna.', r`Połowa przekątnej kwadratu o boku $8$: $4\sqrt2$.`, r`$b^2 = (4\sqrt2)^2 + 7^2$.`],
    steps: [r`$b^2 = 32 + 49 = 81$.`, r`$b = 9$.`],
    errors: [['15', 'Dodane długości.', 'Pitagoras w trójkącie SOA.']],
  }),
  numeric({
    id: 'st-py-7',
    skill: 'stereo-pyramids',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Czworościan foremny ma krawędź $6$. Jego wysokość ma postać $k\sqrt6$. Podaj $k$.`,
    answer: 2,
    verify: () => Math.sqrt(36 - (6 / Math.sqrt(3)) ** 2) / Math.sqrt(6),
    tolerance: 1e-9,
    hints: ['Gdzie pada wysokość czworościanu foremnego?', 'W środek trójkąta równobocznego podstawy.', r`Odległość wierzchołka podstawy od środka: $R = \frac{a\sqrt3}{3}$ — wstaw $a = 6$.`, r`$H^2 = 6^2 - R^2$, a $R^2 = 12$.`],
    steps: [r`$H^2 = 36 - 12 = 24$.`, r`$H = 2\sqrt6$, $k = 2$.`],
    errors: [['3', 'Wysokość pomylona z połową krawędzi.', 'Wysokość to przyprostokątna w trójkącie z krawędzią boczną.']],
  }),
  numeric({
    id: 'st-py-8',
    skill: 'stereo-pyramids',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ostrosłup prawidłowy czworokątny ma pole podstawy $36$ i pole powierzchni całkowitej $96$. Oblicz jego objętość.`,
    answer: 48,
    verify: () => {
      const a = 6;
      const face = (96 - 36) / 4;
      const h = (2 * face) / a;
      const H = Math.sqrt(h * h - (a / 2) ** 2);
      return (36 * H) / 3;
    },
    tolerance: 1e-9,
    hints: ['Ile wynosi pole jednej ściany bocznej?', r`$(96 - 36) : 4$.`, r`Ściana to trójkąt o podstawie $6$ — stąd wysokość ściany.`, r`Wysokość ostrosłupa z trójkąta $SOM$: $H^2 = h^2 - 3^2$.`],
    steps: [r`Ściana: $15 = \frac12 \cdot 6 \cdot h \Rightarrow h = 5$; $H = 4$.`, r`$V = \frac13 \cdot 36 \cdot 4 = 48$.`],
    errors: [['144', 'Pominięte ⅓.', r`$V = \frac13 P_p H$.`]],
  }),

  // stereo-angles -------------------------------------------------------------
  numeric({
    id: 'st-an-1',
    skill: 'stereo-angles',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Jaki kąt (w stopniach) tworzy przekątna ściany sześcianu z krawędzią tej ściany wychodzącą z tego samego wierzchołka?`,
    answer: 45,
    verify: () => (Math.atan(1) * 180) / Math.PI,
    tolerance: 1e-9,
    hints: ['Jaką figurą jest ściana sześcianu?', 'Kwadratem.', 'Przekątna kwadratu dzieli kąt prosty na pół.', r`$90^\circ : 2$.`],
    steps: [r`Przekątna kwadratu jest dwusieczną kąta prostego.`, r`$45^\circ$.`],
    errors: [['90', 'Wzięty kąt między krawędziami.', 'Przekątna dzieli kąt prosty na dwa równe.']],
  }),
  numeric({
    id: 'st-an-2',
    skill: 'stereo-angles',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Prostopadłościan ma podstawę o wymiarach $3 \times 4$ i wysokość $5$. Pod jakim kątem (w stopniach) jego przekątna jest nachylona do płaszczyzny podstawy?`,
    answer: 45,
    verify: () => (Math.atan(5 / Math.hypot(3, 4)) * 180) / Math.PI,
    tolerance: 1e-9,
    hints: ['Co jest rzutem przekątnej bryły na podstawę?', 'Przekątna podstawy.', r`Przekątna podstawy: $\sqrt{9 + 16}$.`, r`$\mathrm{tg}\,\alpha = \frac{\text{wysokość}}{\text{przekątna podstawy}}$.`],
    steps: [r`Przekątna podstawy $5$, $\mathrm{tg}\,\alpha = \frac55 = 1$.`, r`$\alpha = 45^\circ$.`],
    errors: [['90', 'Wzięty kąt krawędzi bocznej z podstawą.', 'Kąt nachylenia liczysz między przekątną bryły a jej rzutem.']],
  }),
  numeric({
    id: 'st-an-3',
    skill: 'stereo-angles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`W ostrosłupie prawidłowym czworokątnym krawędź boczna tworzy z podstawą kąt $60^\circ$, a połowa przekątnej podstawy ma długość $3$. Wysokość ostrosłupa ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 3,
    verify: () => (3 * Math.tan(Math.PI / 3)) / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['W jakim trójkącie leży ten kąt?', 'W trójkącie SOA: wysokość, połowa przekątnej, krawędź boczna.', r`$\mathrm{tg}\,60^\circ = \frac{H}{\text{połowa przekątnej}}$.`, r`$\mathrm{tg}\,60^\circ = \sqrt3$.`],
    steps: [r`$H = 3 \cdot \sqrt3$.`, r`$k = 3$.`],
    errors: [['6', 'Policzona krawędź boczna zamiast wysokości.', 'Wysokość leży naprzeciw kąta 60°.']],
  }),
  numeric({
    id: 'st-an-4',
    skill: 'stereo-angles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Tworząca stożka ma długość $10$, a kąt rozwarcia stożka (kąt między tworzącymi w przekroju osiowym) ma $60^\circ$. Oblicz promień podstawy.`,
    answer: 5,
    verify: () => 10 * Math.sin(Math.PI / 6),
    tolerance: 1e-9,
    hints: ['Jaki jest kształt przekroju osiowego?', r`Trójkąt równoramienny o kącie $60^\circ$ przy wierzchołku — czyli równoboczny.`, 'Podstawa przekroju to średnica.', 'Promień to połowa średnicy.'],
    steps: [r`Przekrój jest równoboczny: średnica $= 10$.`, r`$r = 5$.`],
    errors: [['10', 'Podana średnica zamiast promienia.', 'Podstawa przekroju osiowego to średnica.']],
  }),
  choice({
    id: 'st-an-5',
    skill: 'stereo-angles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku ostrosłupa prawidłowego czworokątnego (M — środek krawędzi BC, O — środek podstawy) kątem nachylenia ściany bocznej SBC do podstawy jest kąt`,
    figure: pyramid,
    choices: [r`$\angle SMO$`, r`$\angle SAO$`, r`$\angle SBC$`, r`$\angle ASC$`],
    answer: 'A',
    hints: ['Jakie ramiona musi mieć kąt między ścianą a podstawą?', 'Oba prostopadłe do wspólnej krawędzi BC.', r`$SM \perp BC$ (wysokość ściany) i $OM \perp BC$.`, 'Wierzchołek kąta leży w M.'],
    steps: [r`$SM$ i $OM$ są prostopadłe do $BC$.`, r`Kąt ściany z podstawą: $\angle SMO$.`],
    errors: [
      ['B', 'To kąt krawędzi bocznej z podstawą.', 'Kąt ściany mierzysz w punkcie M.'],
      ['C', 'Kąt w trójkącie ściany przy krawędzi podstawy.', 'Jego ramiona nie są prostopadłe do BC.'],
      ['D', 'Kąt w przekroju przekątnym.', 'Nie ma związku ze ścianą SBC.'],
    ],
  }),
  numeric({
    id: 'st-an-6',
    skill: 'stereo-angles',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Przekątna sześcianu tworzy z płaszczyzną podstawy kąt $\alpha$. Oblicz $\cos^2\alpha$.`,
    answer: '2/3',
    variants: ['0.667', '0.6667'],
    tolerance: 0.001,
    verify: () => Math.cos(Math.atan(1 / Math.SQRT2)) ** 2,
    hints: ['Jakie odcinki tworzą trójkąt z tym kątem?', r`Krawędź $a$, przekątna podstawy $a\sqrt2$, przekątna sześcianu $a\sqrt3$.`, r`$\cos\alpha = \frac{a\sqrt2}{a\sqrt3}$.`, 'Podnieś do kwadratu.'],
    steps: [r`$\cos\alpha = \frac{\sqrt2}{\sqrt3}$.`, r`$\cos^2\alpha = \frac23$.`],
    errors: [['1/3', r`Policzone $\sin^2\alpha$.`, 'Cosinus: przyprostokątna przy kącie (przekątna podstawy) przez przeciwprostokątną.']],
  }),
  numeric({
    id: 'st-an-7',
    skill: 'stereo-angles',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$, a jego ściana boczna tworzy z podstawą kąt $60^\circ$. Objętość ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 36,
    verify: () => ((36 * 3 * Math.tan(Math.PI / 3)) / 3) / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['Z którego trójkąta policzysz wysokość?', r`Z trójkąta $SOM$: $|OM| = 3$.`, r`$\mathrm{tg}\,60^\circ = \frac{H}{3}$, więc $H = 3\sqrt3$.`, r`$V = \frac13 \cdot 36 \cdot H$.`],
    steps: [r`$V = 12 \cdot 3\sqrt3$.`, r`$= 36\sqrt3$, $k = 36$.`],
    errors: [['108', 'Pominięte ⅓.', r`$V = \frac13 P_p H$.`]],
  }),
  numeric({
    id: 'st-an-8',
    skill: 'stereo-angles',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Prostopadłościan ma podstawę kwadratową. Jego przekątna ma długość $12$ i tworzy z płaszczyzną podstawy kąt $30^\circ$. Oblicz objętość prostopadłościanu.`,
    answer: 324,
    verify: () => {
      const H = 12 * Math.sin(Math.PI / 6);
      const d = 12 * Math.cos(Math.PI / 6);
      return (d * d) / 2 * H;
    },
    tolerance: 1e-6,
    hints: ['Jakie odcinki wyznaczysz z przekątnej i kąta?', r`Wysokość $H = 12\sin 30^\circ$, przekątna podstawy $12\cos 30^\circ$.`, r`$H = 6$, przekątna podstawy $6\sqrt3$.`, r`Pole kwadratu z przekątnej: $\frac{d^2}{2}$.`],
    steps: [r`$P_p = \frac{108}{2} = 54$.`, r`$V = 54 \cdot 6 = 324$.`],
    errors: [['648', r`Pole podstawy policzone jako $d^2$ zamiast $\frac{d^2}{2}$.`, r`Kwadrat o przekątnej $d$ ma pole $\frac{d^2}{2}$.`]],
  }),

  // stereo-solids -------------------------------------------------------------
  numeric({
    id: 'st-so-1',
    skill: 'stereo-solids',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Walec ma promień podstawy $3$ i wysokość $5$. Jego objętość ma postać $k\pi$. Podaj $k$.`,
    answer: 45,
    verify: () => 9 * 5,
    hints: ['Jaki jest wzór na objętość walca?', r`$V = \pi r^2 h$.`, r`$\pi \cdot 9 \cdot 5$.`, r`Współczynnik przy $\pi$.`],
    steps: [r`$V = 45\pi$.`, r`$k = 45$.`],
    errors: [['30', r`Policzone pole boczne $2\pi rh$.`, r`Objętość: $\pi r^2 h$.`]],
  }),
  numeric({
    id: 'st-so-2',
    skill: 'stereo-solids',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Kula ma promień $3$. Jej objętość ma postać $k\pi$. Podaj $k$.`,
    answer: 36,
    verify: () => (4 / 3) * 27,
    tolerance: 1e-9,
    hints: ['Jaki jest wzór na objętość kuli?', r`$V = \frac43 \pi r^3$.`, r`$\frac43 \cdot 27$.`, 'Policz.'],
    steps: [r`$\frac43 \cdot 27 = 36$.`, r`$V = 36\pi$.`],
    errors: [['108', 'Pominięte dzielenie przez 3.', r`$V = \frac43 \pi r^3$.`]],
  }),
  numeric({
    id: 'st-so-3',
    skill: 'stereo-solids',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Stożek ma promień podstawy $3$ i wysokość $4$. Oblicz długość jego tworzącej.`,
    answer: 5,
    verify: () => Math.hypot(3, 4),
    figure: coneSection,
    hints: ['Jaki trójkąt tworzą promień, wysokość i tworząca?', 'Prostokątny — tworząca jest przeciwprostokątną.', r`$l^2 = 3^2 + 4^2$.`, 'Wyciągnij pierwiastek.'],
    steps: [r`$l^2 = 25$.`, r`$l = 5$.`],
    errors: [['7', 'Dodane długości.', 'Pitagoras w przekroju osiowym.']],
  }),
  numeric({
    id: 'st-so-4',
    skill: 'stereo-solids',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Stożek ma promień $3$ i tworzącą $5$. Pole jego powierzchni bocznej ma postać $k\pi$. Podaj $k$.`,
    answer: 15,
    verify: () => 3 * 5,
    hints: ['Jaki jest wzór na pole powierzchni bocznej stożka?', r`$P_b = \pi r l$.`, r`$\pi \cdot 3 \cdot 5$.`, r`Współczynnik przy $\pi$.`],
    steps: [r`$P_b = 15\pi$.`, r`$k = 15$.`],
    errors: [['30', r`Użyty wzór walca $2\pi r l$.`, r`Stożek: $P_b = \pi r l$.`]],
  }),
  numeric({
    id: 'st-so-5',
    skill: 'stereo-solids',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Kula ma promień $5$. Pole jej powierzchni ma postać $k\pi$. Podaj $k$.`,
    answer: 100,
    verify: () => 4 * 25,
    hints: ['Jaki jest wzór na pole powierzchni kuli?', r`$P = 4\pi r^2$.`, r`$4 \cdot 25$.`, 'Policz.'],
    steps: [r`$P = 100\pi$.`, r`$k = 100$.`],
    errors: [['25', r`Policzone pole koła $\pi r^2$.`, r`Powierzchnia kuli: $4\pi r^2$.`]],
  }),
  numeric({
    id: 'st-so-6',
    skill: 'stereo-solids',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Stożek ma promień $3$ i wysokość $4$. Jego objętość ma postać $k\pi$. Podaj $k$.`,
    answer: 12,
    verify: () => (9 * 4) / 3,
    hints: ['Jaki jest wzór na objętość stożka?', r`$V = \frac13 \pi r^2 h$.`, r`$\frac13 \cdot 9 \cdot 4$.`, 'Policz.'],
    steps: [r`$V = \frac{36}{3}\pi$.`, r`$= 12\pi$.`],
    errors: [['36', 'Pominięte ⅓.', 'Stożek to jedna trzecia walca o tej samej podstawie i wysokości.']],
  }),
  numeric({
    id: 'st-so-7',
    skill: 'stereo-solids',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Puszka ma kształt walca o średnicy $8$ cm i wysokości $10$ cm. Jej pojemność w $\mathrm{cm}^3$ ma postać $k\pi$. Podaj $k$.`,
    answer: 160,
    verify: () => 4 ** 2 * 10,
    hints: ['Jaki jest promień puszki?', 'Połowa średnicy: 4 cm.', r`$V = \pi r^2 h$.`, r`$\pi \cdot 16 \cdot 10$.`],
    steps: [r`$V = 160\pi\ \mathrm{cm}^3$.`, r`$k = 160$.`],
    errors: [['640', 'Średnica wstawiona jako promień.', 'Promień to połowa średnicy.']],
  }),
  numeric({
    id: 'st-so-8',
    skill: 'stereo-solids',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Metalową kulę o promieniu $6$ przetopiono na stożek o promieniu podstawy $6$. Oblicz wysokość stożka.`,
    answer: 24,
    verify: () => ((4 / 3) * 216) / ((1 / 3) * 36),
    tolerance: 1e-9,
    hints: ['Co się nie zmienia przy przetapianiu?', 'Objętość.', r`$\frac13 \pi \cdot 36 \cdot h = \frac43 \pi \cdot 216$.`, r`Pomnóż obie strony przez $3$ i podziel przez $\pi$.`],
    steps: [r`$36h = 864$.`, r`$h = 24$.`],
    errors: [['8', 'Pominięte ⅓ w objętości stożka.', r`$V_{\text{stożka}} = \frac13 \pi r^2 h$.`]],
  }),

  // stereo-advanced -----------------------------------------------------------
  numeric({
    id: 'st-adv-1',
    skill: 'stereo-advanced',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Sześcian o krawędzi $4$ przecięto płaszczyzną zawierającą przekątne dwóch przeciwległych ścian. Pole przekroju ma postać $k\sqrt2$. Podaj $k$.`,
    answer: 16,
    verify: () => (4 * 4 * Math.SQRT2) / Math.SQRT2,
    tolerance: 1e-9,
    hints: ['Jaki kształt ma ten przekrój?', 'Prostokąt.', r`Jego boki: krawędź $4$ i przekątna ściany $4\sqrt2$.`, 'Pomnóż boki.'],
    steps: [r`$P = 4 \cdot 4\sqrt2$.`, r`$= 16\sqrt2$, $k = 16$.`],
    errors: [['8', 'Pole policzone jak dla trójkąta.', 'Przekrój przekątny sześcianu to prostokąt.']],
  }),
  choice({
    id: 'st-adv-2',
    skill: 'stereo-advanced',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Przekrój sześcianu płaszczyzną przechodzącą przez trzy wierzchołki sąsiednie z jednym wierzchołkiem to',
    figure: cubeSection,
    choices: ['trójkąt równoboczny', 'prostokąt', 'kwadrat', 'trójkąt prostokątny'],
    answer: 'A',
    hints: ['Jakie odcinki są bokami tego przekroju?', 'Przekątne trzech ścian sześcianu.', 'Czy przekątne ścian sześcianu mają równe długości?', r`Tak — każda ma $a\sqrt2$.`],
    steps: ['Boki przekroju to trzy przekątne ścian.', 'Są równe — trójkąt równoboczny.'],
    errors: [
      ['B', 'Przekrój ma trzy wierzchołki, nie cztery.', 'Płaszczyzna przechodzi przez trzy punkty.'],
      ['C', 'Przekrój ma trzy wierzchołki.', 'Płaszczyzna przechodzi przez trzy punkty.'],
      ['D', 'Boki są równe — kąty mają po 60°.', 'Trzy przekątne ścian mają tę samą długość.'],
    ],
  }),
  numeric({
    id: 'st-adv-3',
    skill: 'stereo-advanced',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Sześcian ma krawędź $2$. Pole przekroju przez trzy wierzchołki sąsiednie z jednym wierzchołkiem ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 2,
    verify: () => ((2 * Math.SQRT2) ** 2 * Math.sqrt(3)) / 4 / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['Jaki bok ma ten trójkąt równoboczny?', r`Przekątna ściany: $2\sqrt2$.`, r`$P = \frac{a^2\sqrt3}{4}$ dla $a = 2\sqrt2$.`, r`$(2\sqrt2)^2 = 8$.`],
    steps: [r`$P = \frac{8\sqrt3}{4}$.`, r`$= 2\sqrt3$, $k = 2$.`],
    errors: [['4', r`Pole liczone jako $\frac{a^2\sqrt3}{2}$.`, r`Trójkąt równoboczny: $\frac{a^2\sqrt3}{4}$.`]],
  }),
  numeric({
    id: 'st-adv-4',
    skill: 'stereo-advanced',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Jaki kąt (w stopniach) tworzą przekątne dwóch sąsiednich ścian sześcianu wychodzące z tego samego wierzchołka?`,
    answer: 60,
    verify: () => {
      // wektory (1,1,0) i (1,0,1)
      const cos = 1 / (Math.SQRT2 * Math.SQRT2);
      return (Math.acos(cos) * 180) / Math.PI;
    },
    tolerance: 1e-9,
    hints: ['Jaki trójkąt tworzą te dwie przekątne z przekątną trzeciej ściany?', 'Trzy przekątne ścian — trójkąt o równych bokach.', 'Jakie kąty ma trójkąt równoboczny?', r`Każdy po $60^\circ$.`],
    steps: ['Trójkąt z trzech przekątnych ścian jest równoboczny.', r`Kąt: $60^\circ$.`],
    errors: [['90', 'Przyjęto, że przekątne sąsiednich ścian są prostopadłe jak krawędzie.', 'Przekątne ścian tworzą trójkąt równoboczny.']],
  }),
  numeric({
    id: 'st-adv-5',
    skill: 'stereo-advanced',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wszystkie krawędzie ostrosłupa prawidłowego czworokątnego mają długość $4$. Jego wysokość ma postać $k\sqrt2$. Podaj $k$.`,
    answer: 2,
    verify: () => Math.sqrt(16 - (2 * Math.SQRT2) ** 2) / Math.SQRT2,
    tolerance: 1e-9,
    hints: ['Z którego trójkąta policzysz wysokość, znając krawędź boczną?', 'Z trójkąta SOA: krawędź boczna, połowa przekątnej podstawy, wysokość.', r`Połowa przekątnej: $2\sqrt2$.`, r`$H^2 = 16 - (2\sqrt2)^2$.`],
    steps: [r`$H^2 = 8$.`, r`$H = 2\sqrt2$, $k = 2$.`],
    errors: [['12', r`Użyta połowa krawędzi podstawy: $H^2 = 16 - 4$.`, 'Krawędź boczna łączy S z wierzchołkiem — potrzebna połowa przekątnej.']],
  }),
  numeric({
    id: 'st-adv-6',
    skill: 'stereo-advanced',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wszystkie krawędzie ostrosłupa prawidłowego czworokątnego mają długość $4$. Ściana boczna tworzy z podstawą kąt $\beta$. Oblicz $\cos^2\beta$.`,
    answer: '1/3',
    variants: ['0.333', '0.3333'],
    tolerance: 0.001,
    verify: () => (2 / (2 * Math.sqrt(3))) ** 2,
    hints: ['W jakim trójkącie leży kąt β?', r`W trójkącie $SOM$: $|OM| = 2$, $|SM|$ — wysokość ściany.`, r`Ściana to trójkąt równoboczny o boku $4$: $|SM| = 2\sqrt3$.`, r`$\cos\beta = \frac{|OM|}{|SM|}$.`],
    steps: [r`$\cos\beta = \frac{2}{2\sqrt3} = \frac{1}{\sqrt3}$.`, r`$\cos^2\beta = \frac13$.`],
    errors: [['1/2', 'Wzięty kąt 60° z trójkąta ściany.', 'Kąt ściany z podstawą leży w trójkącie SOM, nie w ścianie.']],
  }),
  numeric({
    id: 'st-adv-7',
    skill: 'stereo-advanced',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W stożek o promieniu podstawy $6$ i wysokości $8$ wpisano kulę (styczną do podstawy i do powierzchni bocznej). Oblicz promień kuli.`,
    answer: 3,
    verify: () => (0.5 * 12 * 8) / ((10 + 10 + 12) / 2),
    hints: ['Co widać na przekroju osiowym?', 'Okrąg wpisany w trójkąt równoramienny o podstawie 12 i wysokości 8.', r`Ramiona: $\sqrt{36 + 64} = 10$; pole: $\frac12 \cdot 12 \cdot 8$.`, r`$r = \frac{P}{p}$, gdzie $p$ — połowa obwodu.`],
    steps: [r`$P = 48$, $p = 16$.`, r`$r = 3$.`],
    errors: [['4', 'Promień wzięty jako połowa wysokości stożka.', 'Środek kuli nie leży w połowie wysokości.']],
  }),
  numeric({
    id: 'st-adv-8',
    skill: 'stereo-advanced',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Od sześcianu o krawędzi $6$ odcięto naroże płaszczyzną przechodzącą przez środki trzech krawędzi wychodzących z jednego wierzchołka. Oblicz objętość odciętej części.`,
    answer: 4.5,
    variants: ['9/2'],
    verify: () => (3 * 3 * 3) / 6,
    hints: ['Jaką bryłą jest odcięte naroże?', 'Ostrosłupem o trzech krawędziach prostopadłych długości 3.', r`Podstawa: trójkąt prostokątny o przyprostokątnych $3$ i $3$; wysokość $3$.`, r`$V = \frac13 \cdot \frac92 \cdot 3$.`],
    steps: [r`$V = \frac13 \cdot 4{,}5 \cdot 3$.`, r`$= 4{,}5$.`],
    errors: [['13.5', 'Pominięte ⅓ we wzorze na objętość ostrosłupa.', 'Odcięte naroże to ostrosłup, nie graniastosłup.']],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const STEREO_CARDS: Flashcard[] = [
  card('c-st-pr-1', 'stereo-prisms', 'wzor', 'Objętość i pole graniastosłupa?', r`$V = P_p H$, $P_c = 2P_p + P_b$`),
  card('c-st-pr-2', 'stereo-prisms', 'wzor', 'Przekątna prostopadłościanu i sześcianu?', r`$\sqrt{a^2 + b^2 + c^2}$; $a\sqrt3$`),

  card('c-st-py-1', 'stereo-pyramids', 'wzor', 'Objętość ostrosłupa?', r`$V = \frac13 P_p H$`),
  card('c-st-py-2', 'stereo-pyramids', 'metoda', 'Ostrosłup prawidłowy czworokątny: które odcinki do h, a które do krawędzi bocznej?', 'Wysokość ściany: H i połowa krawędzi podstawy. Krawędź boczna: H i połowa przekątnej.'),

  card('c-st-an-1', 'stereo-angles', 'definicja', 'Kąt nachylenia odcinka do płaszczyzny?', 'Kąt między odcinkiem a jego rzutem na tę płaszczyznę.'),
  card('c-st-an-2', 'stereo-angles', 'pulapka', 'Kąt ściany bocznej z podstawą — gdzie jest wierzchołek?', 'W środku krawędzi podstawy (M): ramiona SM i OM, oba prostopadłe do krawędzi.'),

  card('c-st-so-1', 'stereo-solids', 'wzor', 'Objętość walca, stożka, kuli?', r`$\pi r^2 h$; $\frac13 \pi r^2 h$; $\frac43 \pi r^3$`),
  card('c-st-so-2', 'stereo-solids', 'wzor', 'Pole boczne stożka i pole kuli?', r`$\pi r l$; $4\pi r^2$`),

  card('c-st-adv-1', 'stereo-advanced', 'definicja', 'Przekrój sześcianu przez trzy wierzchołki sąsiednie z jednym?', r`Trójkąt równoboczny o boku $a\sqrt2$.`),
  card('c-st-adv-2', 'stereo-advanced', 'metoda', 'Kula wpisana w stożek — jak liczyć promień?', 'Okrąg wpisany w przekrój osiowy: r = P/p.'),
];

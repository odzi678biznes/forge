import type { Flashcard, GeometryFigure, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 11: Planimetria.
 *
 * Kąty, trójkąty (Pitagoras i trójkąty szczególne), podobieństwo i Tales,
 * czworokąty, koło i okrąg, okręgi wpisane i opisane. Wyniki z pierwiastkiem
 * zadajemy w postaci „k√3 — podaj k”, żeby odpowiedź była dokładna, tak jak
 * na maturze, a nie przybliżeniem z kalkulatora.
 */

const r = String.raw;

export const PLAN_TOPIC: Topic = {
  id: 'math-planimetry',
  subjectId: 'math',
  name: 'Planimetria',
  summary: 'Kąty, trójkąty i Pitagoras, podobieństwo i Tales, czworokąty, koło i okrąg, okręgi wpisane i opisane.',
};

export const PLAN_SKILLS: Skill[] = [
  {
    id: 'plan-angles',
    topicId: 'math-planimetry',
    name: 'Kąty: w trójkącie, przy prostych równoległych, w wielokątach',
    level: 'PP',
    ckeRequirement: 'Planimetria — kąty przyległe, wierzchołkowe, przy prostych równoległych; suma kątów wielokąta',
    prerequisites: ['eq-linear'],
    examValue: 0.5,
  },
  {
    id: 'plan-triangles',
    topicId: 'math-planimetry',
    name: 'Trójkąty: Pitagoras i trójkąty szczególne',
    level: 'PP',
    ckeRequirement: 'Planimetria — twierdzenie Pitagorasa, trójkąty o kątach 30°, 60°, 90° i 45°, 45°, 90°, pole trójkąta',
    prerequisites: ['plan-angles', 'num-roots'],
    examValue: 0.75,
  },
  {
    id: 'plan-similarity',
    topicId: 'math-planimetry',
    name: 'Podobieństwo i twierdzenie Talesa',
    level: 'PP',
    ckeRequirement: 'Planimetria — cechy podobieństwa trójkątów, twierdzenie Talesa, stosunek pól figur podobnych',
    prerequisites: ['plan-triangles'],
    examValue: 0.65,
  },
  {
    id: 'plan-quadrilaterals',
    topicId: 'math-planimetry',
    name: 'Czworokąty: własności i pola',
    level: 'PP',
    ckeRequirement: 'Planimetria — własności i pola równoległoboku, rombu, prostokąta, trapezu',
    prerequisites: ['plan-triangles'],
    examValue: 0.65,
  },
  {
    id: 'plan-circle',
    topicId: 'math-planimetry',
    name: 'Koło i okrąg: kąty, łuki, styczne',
    level: 'PP',
    ckeRequirement: 'Planimetria — kąt środkowy i wpisany, długość łuku, pole wycinka, styczna do okręgu',
    prerequisites: ['plan-angles', 'plan-triangles'],
    examValue: 0.65,
  },
  {
    id: 'plan-inscribed',
    topicId: 'math-planimetry',
    name: 'Okręgi wpisane i opisane',
    level: 'PP',
    ckeRequirement: 'Planimetria — okrąg wpisany i opisany na trójkącie i czworokącie',
    prerequisites: ['plan-circle', 'plan-quadrilaterals'],
    examValue: 0.6,
  },
];

// ===========================================================================
// Rysunki
// ===========================================================================

/** Dwie proste równoległe przecięte trzecią pod kątem 60°. */
const parallelLines = (labelAtF: 'corresponding' | 'coInterior'): GeometryFigure => ({
  kind: 'geometry',
  alt:
    labelAtF === 'corresponding'
      ? 'Dwie poziome proste równoległe przecięte ukośną prostą. Przy dolnym i górnym przecięciu zaznaczono kąty odpowiadające, oba oznaczone α.'
      : 'Dwie poziome proste równoległe przecięte ukośną prostą. Przy dolnym przecięciu kąt 60° między prostą poziomą (w prawo) a ukośną; przy górnym kąt x między prostą poziomą (w prawo) a ukośną w dół.',
  points: {
    A: [0, 0], B: [6, 0], C: [0, 3], D: [6, 3],
    E: [2, 0], F: [3.732, 3], P: [1.423, -1], Q: [4.309, 4],
  },
  segments: [{ from: 'A', to: 'B' }, { from: 'C', to: 'D' }, { from: 'P', to: 'Q' }],
  angles:
    labelAtF === 'corresponding'
      ? [
          { at: 'E', from: 'B', to: 'F', label: 'α' },
          { at: 'F', from: 'D', to: 'Q', label: 'α' },
        ]
      : [
          { at: 'E', from: 'B', to: 'F', label: '60°' },
          { at: 'F', from: 'D', to: 'E', label: 'x' },
        ],
  hidePointLabels: true,
});

/** Trójkąt z odcinkiem DE równoległym do BC (twierdzenie Talesa). */
const talesFigure = (labels: { ad: string; db: string; ae: string; ec: string }): GeometryFigure => ({
  kind: 'geometry',
  alt: `Trójkąt ABC z odcinkiem DE równoległym do BC; D leży na AB, E na AC. AD = ${labels.ad}, DB = ${labels.db}, AE = ${labels.ae}, EC = ${labels.ec}.`,
  points: { A: [2, 5], B: [0, 0], C: [6, 0], D: [0.667, 1.667], E: [4.667, 1.667] },
  polygons: [{ vertices: ['A', 'B', 'C'] }],
  segments: [
    { from: 'D', to: 'E' },
    { from: 'A', to: 'D', label: labels.ad },
    { from: 'D', to: 'B', label: labels.db },
    { from: 'A', to: 'E', label: labels.ae },
    { from: 'E', to: 'C', label: labels.ec },
  ],
});

/** Kąt środkowy AOB i wpisany ACB oparte na tym samym łuku. */
const circleAngles = (central: string, inscribed: string): GeometryFigure => ({
  kind: 'geometry',
  alt: `Okrąg o środku O, punkty A i B na dole okręgu, C na górze. Kąt środkowy AOB oznaczony ${central}, kąt wpisany ACB oznaczony ${inscribed}; oba oparte na łuku AB.`,
  points: { O: [0, 0], A: [-2.598, -1.5], B: [2.598, -1.5], C: [0, 3] },
  circles: [{ center: 'O', radius: 3 }],
  segments: [{ from: 'O', to: 'A' }, { from: 'O', to: 'B' }, { from: 'C', to: 'A' }, { from: 'C', to: 'B' }],
  angles: [
    { at: 'O', from: 'A', to: 'B', label: central },
    { at: 'C', from: 'A', to: 'B', label: inscribed },
  ],
});

// ===========================================================================
// Lekcje
// ===========================================================================

export const PLAN_LESSONS: Lesson[] = [
  {
    skillId: 'plan-angles',
    minutes: 10,
    intro:
      'Większość zadań z geometrii zaczyna się od kątów. Kilka reguł — suma kątów w trójkącie, kąty przy prostych równoległych — wystarcza, żeby „odblokować” cały rysunek.',
    blocks: [
      f(r`\alpha + \beta + \gamma = 180^\circ \qquad \text{suma kątów } n\text{-kąta} = (n - 2) \cdot 180^\circ`),
      p(r`Kąty przyległe sumują się do $180^\circ$, wierzchołkowe są równe. Kąt zewnętrzny trójkąta jest równy sumie dwóch kątów wewnętrznych do niego nieprzyległych.`),
      { kind: 'figure', figure: parallelLines('corresponding'), caption: 'Prosta przecinająca dwie równoległe tworzy równe kąty odpowiadające (i naprzemianległe).' },
      tip(r`Kąty „po tej samej stronie” poprzecznej, między równoległymi (jednostronne), sumują się do $180^\circ$.`),
      warn('Równość kątów odpowiadających zachodzi tylko dla prostych równoległych. Nie zakładaj równoległości, której nie ma w treści.'),
    ],
    examples: [
      example(
        r`Kąt wewnętrzny wielokąta foremnego ma $140^\circ$. Ile boków ma ten wielokąt?`,
        [r`$\frac{(n - 2) \cdot 180^\circ}{n} = 140^\circ$.`, r`$180n - 360 = 140n \Rightarrow n = 9$.`],
        r`$9$`,
      ),
      example(
        r`W trójkącie dwa kąty mają $45^\circ$ i $65^\circ$. Oblicz kąt zewnętrzny przy trzecim wierzchołku.`,
        [r`Kąt zewnętrzny = suma dwóch nieprzyległych kątów wewnętrznych.`, r`$45^\circ + 65^\circ = 110^\circ$.`],
        r`$110^\circ$`,
      ),
    ],
    pitfalls: ['Kąt przyległy pomylony z dopełniającym (do 90°).', r`Suma kątów wielokąta liczona jako $n \cdot 180^\circ$.`, 'Kąty jednostronne uznane za równe.'],
  },
  {
    skillId: 'plan-triangles',
    minutes: 14,
    intro:
      'Twierdzenie Pitagorasa i dwa trójkąty szczególne — „połówka kwadratu” i „połówka trójkąta równobocznego” — rozwiązują ogromną część zadań z geometrii, także w stereometrii i geometrii analitycznej.',
    blocks: [
      f(r`a^2 + b^2 = c^2`, 'c — przeciwprostokątna'),
      {
        kind: 'figure',
        figure: {
          kind: 'geometry',
          alt: 'Trójkąt prostokątny o kątach 30°, 60°, 90°. Przyprostokątna naprzeciw kąta 30° ma długość a, druga przyprostokątna a√3, przeciwprostokątna 2a.',
          points: { A: [0, 0], B: [3.464, 0], C: [0, 2] },
          polygons: [{ vertices: ['A', 'B', 'C'] }],
          segments: [
            { from: 'A', to: 'C', label: 'a' },
            { from: 'A', to: 'B', label: 'a√3' },
            { from: 'B', to: 'C', label: '2a' },
          ],
          angles: [
            { at: 'B', from: 'A', to: 'C', label: '30°' },
            { at: 'C', from: 'A', to: 'B', label: '60°' },
            { at: 'A', from: 'B', to: 'C', right: true },
          ],
          hidePointLabels: true,
        },
        caption: 'Trójkąt 30°–60°–90°: boki a, a√3, 2a.',
      },
      f(r`\text{45°–45°–90°: } a,\ a,\ a\sqrt2 \qquad h_{\triangle\text{równob.}} = \frac{a\sqrt3}{2} \qquad P_{\triangle\text{równob.}} = \frac{a^2\sqrt3}{4}`),
      tip('Warto znać „trójki pitagorejskie”: 3–4–5, 5–12–13, 8–15–17 i ich wielokrotności (6–8–10). Oszczędzają liczenia.'),
      warn('Przeciwprostokątna leży naprzeciw kąta prostego i jest najdłuższa. Pitagoras z przyprostokątną po prawej stronie daje zły wynik.'),
    ],
    examples: [
      example(
        r`Trójkąt równoramienny ma ramiona $13$ i podstawę $10$. Oblicz jego pole.`,
        [r`Wysokość dzieli podstawę na pół: $h^2 + 5^2 = 13^2$, więc $h = 12$.`, r`$P = \frac12 \cdot 10 \cdot 12 = 60$.`],
        r`$60$`,
      ),
      example(
        r`Oblicz wysokość trójkąta równobocznego o boku $6$.`,
        [r`$h = \frac{a\sqrt3}{2}$.`, r`$h = \frac{6\sqrt3}{2} = 3\sqrt3$.`],
        r`$3\sqrt3$`,
      ),
    ],
    pitfalls: ['Pitagoras z przeciwprostokątną po złej stronie.', 'Boki trójkąta 30–60–90 przypisane do złych kątów.', 'Brak połowy podstawy przy wysokości trójkąta równoramiennego.'],
  },
  {
    skillId: 'plan-similarity',
    minutes: 12,
    intro:
      'Figury podobne mają ten sam kształt, a różny rozmiar — jak zdjęcie i jego powiększenie. Wszystkie długości zmieniają się w tej samej skali k, a pola — w skali k².',
    blocks: [
      f(r`\frac{a'}{a} = \frac{b'}{b} = \frac{c'}{c} = k \qquad \frac{P'}{P} = k^2`),
      p('Trójkąty są podobne, gdy mają równe kąty (wystarczą dwa), albo gdy boki są proporcjonalne. W zadaniach najczęściej podobieństwo daje prosta równoległa do boku albo wspólny kąt.'),
      { kind: 'figure', figure: talesFigure({ ad: 'a', db: 'b', ae: 'c', ec: 'd' }), caption: 'DE ∥ BC, więc a : b = c : d, a trójkąt ADE jest podobny do ABC.' },
      f(r`\frac{|AD|}{|DB|} = \frac{|AE|}{|EC|}`, 'twierdzenie Talesa'),
      warn(r`Skala pól to $k^2$, nie $k$. Trójkąt dwa razy większy (w długościach) ma cztery razy większe pole.`),
    ],
    examples: [
      example(
        r`Człowiek o wzroście $1{,}8$ m rzuca cień $2{,}4$ m. Drzewo rzuca w tym samym czasie cień $12$ m. Jak wysokie jest drzewo?`,
        [r`Promienie słońca są równoległe — trójkąty są podobne: $\frac{h}{12} = \frac{1{,}8}{2{,}4}$.`, r`$h = 12 \cdot 0{,}75 = 9$ m.`],
        r`$9$ m`,
      ),
      example(
        r`Trójkąty są podobne w skali $3$. Mniejszy ma pole $5$. Oblicz pole większego.`,
        [r`Skala pól $k^2 = 9$.`, r`$P' = 45$.`],
        r`$45$`,
      ),
    ],
    pitfalls: ['Skala pól równa skali długości.', 'Proporcja z odcinkami, które sobie nie odpowiadają.', 'Tales zastosowany bez równoległości.'],
  },
  {
    skillId: 'plan-quadrilaterals',
    minutes: 12,
    intro:
      'Czworokąty na maturze prawie zawsze rozbija się na trójkąty: wysokość trapezu tworzy trójkąt prostokątny, przekątne rombu — cztery takie same trójkąty. Wzory na pola wynikają właśnie z tego.',
    blocks: [
      {
        kind: 'figure',
        figure: {
          kind: 'geometry',
          alt: 'Trapez ABCD z dłuższą podstawą a na dole i krótszą b na górze. Z wierzchołka D opuszczona wysokość h na podstawę AB.',
          points: { A: [0, 0], B: [8, 0], C: [6, 3], D: [2, 3], H: [2, 0] },
          polygons: [{ vertices: ['A', 'B', 'C', 'D'] }],
          segments: [
            { from: 'A', to: 'B', label: 'a' },
            { from: 'D', to: 'C', label: 'b' },
            { from: 'D', to: 'H', label: 'h', dashed: true },
          ],
          angles: [{ at: 'H', from: 'B', to: 'D', right: true }],
        },
        caption: 'Pole trapezu: średnia podstaw razy wysokość.',
      },
      f(r`P_{\text{trapezu}} = \frac{a + b}{2} \cdot h \qquad P_{\text{rombu}} = \frac{d_1 d_2}{2} \qquad P_{\text{równoległoboku}} = a h`),
      p('Romb ma przekątne prostopadłe, które dzielą się na pół. Prostokąt ma przekątne równe. Równoległobok — przekątne dzielą się na pół.'),
      tip(r`W trapezie równoramiennym wysokość odcina z dłuższej podstawy odcinek $\frac{a - b}{2}$ — to przyprostokątna trójkąta z ramieniem.`),
      warn('Wzór z połową iloczynu przekątnych działa dla rombu (i każdego czworokąta o prostopadłych przekątnych), nie dla prostokąta.'),
    ],
    examples: [
      example(
        r`Trapez równoramienny ma podstawy $10$ i $4$ oraz ramię $5$. Oblicz pole.`,
        [r`Odcinek przy podstawie: $\frac{10 - 4}{2} = 3$; $h = \sqrt{25 - 9} = 4$.`, r`$P = \frac{10 + 4}{2} \cdot 4 = 28$.`],
        r`$28$`,
      ),
      example(
        r`Romb ma przekątne $6$ i $8$. Oblicz jego bok.`,
        [r`Połówki przekątnych: $3$ i $4$ — przyprostokątne.`, r`Bok: $\sqrt{9 + 16} = 5$.`],
        r`$5$`,
      ),
    ],
    pitfalls: ['Pole rombu bez dzielenia przez 2.', 'Cała różnica podstaw zamiast połowy w trapezie równoramiennym.', 'Przypisanie prostokątowi prostopadłych przekątnych.'],
  },
  {
    skillId: 'plan-circle',
    minutes: 14,
    intro:
      'Najważniejsza zależność w kole: kąt wpisany jest dwa razy mniejszy od kąta środkowego opartego na tym samym łuku. Z niej wynika, że kąt wpisany oparty na średnicy jest prosty.',
    blocks: [
      { kind: 'figure', figure: circleAngles('2α', 'α'), caption: 'Kąt środkowy AOB jest dwa razy większy od wpisanego ACB.' },
      f(r`L = 2\pi r \qquad P = \pi r^2 \qquad l_{\text{łuku}} = \frac{\alpha}{360^\circ} \cdot 2\pi r \qquad P_{\text{wycinka}} = \frac{\alpha}{360^\circ} \cdot \pi r^2`),
      p('Styczna jest prostopadła do promienia poprowadzonego do punktu styczności. Z punktu poza okręgiem wychodzą dwie styczne — odcinki do punktów styczności mają równe długości.'),
      tip('Kąty wpisane oparte na tym samym łuku są równe — niezależnie od tego, gdzie na okręgu leży wierzchołek.'),
      warn('Kąt środkowy i wpisany muszą opierać się na TYM SAMYM łuku. Sprawdź, po której stronie cięciwy leży wierzchołek kąta wpisanego.'),
    ],
    examples: [
      example(
        r`Z punktu $P$ odległego o $13$ od środka okręgu o promieniu $5$ poprowadzono styczną. Oblicz długość odcinka stycznej.`,
        [r`Promień do punktu styczności jest prostopadły do stycznej — trójkąt prostokątny.`, r`$d = \sqrt{13^2 - 5^2} = 12$.`],
        r`$12$`,
      ),
      example(
        r`Oblicz pole wycinka koła o promieniu $6$ i kącie $60^\circ$.`,
        [r`$P = \frac{60}{360} \cdot \pi \cdot 36$.`, r`$= 6\pi$.`],
        r`$6\pi$`,
      ),
    ],
    pitfalls: ['Kąt wpisany równy środkowemu.', 'Odcinek stycznej liczony jako różnica odległości i promienia.', r`Pole koła $2\pi r$ zamiast $\pi r^2$.`],
  },
  {
    skillId: 'plan-inscribed',
    minutes: 12,
    intro:
      'Okrąg wpisany dotyka wszystkich boków figury, okrąg opisany przechodzi przez wszystkie wierzchołki. Kilka wzorów i dwa warunki dla czworokątów wystarczają do większości zadań.',
    blocks: [
      {
        kind: 'figure',
        figure: {
          kind: 'geometry',
          alt: 'Trójkąt prostokątny o bokach 3, 4, 5 z okręgiem wpisanym o środku I i promieniu 1 oraz okręgiem opisanym o środku S w środku przeciwprostokątnej.',
          points: { A: [0, 0], B: [4, 0], C: [0, 3], I: [1, 1], S: [2, 1.5] },
          polygons: [{ vertices: ['A', 'B', 'C'] }],
          circles: [{ center: 'I', radius: 1 }, { center: 'S', radius: 2.5 }],
          angles: [{ at: 'A', from: 'B', to: 'C', right: true }],
        },
        caption: 'W trójkącie prostokątnym środek okręgu opisanego leży w środku przeciwprostokątnej.',
      },
      f(r`r = \frac{P}{p}, \quad p = \frac{a + b + c}{2} \qquad R = \frac{c}{2}`, 'dowolny trójkąt; R — trójkąt prostokątny, c — przeciwprostokątna'),
      f(r`r = \frac13 h \qquad R = \frac23 h`, 'trójkąt równoboczny, h — wysokość'),
      f(r`\alpha + \gamma = \beta + \delta = 180^\circ`, 'czworokąt wpisany w okrąg'),
      f(r`a + c = b + d`, 'czworokąt opisany na okręgu'),
      tip('W trapez równoramienny opisany na okręgu: suma podstaw = suma ramion, więc ramię to średnia podstaw.'),
      warn('W romb zawsze da się wpisać okrąg, ale opisać — tylko na kwadracie. W prostokąt odwrotnie.'),
    ],
    examples: [
      example(
        r`Trójkąt o bokach $6$, $8$, $10$. Oblicz promień okręgu wpisanego.`,
        [r`To trójkąt prostokątny: $P = 24$, $p = 12$.`, r`$r = \frac{24}{12} = 2$.`],
        r`$2$`,
      ),
      example(
        r`Trapez równoramienny o podstawach $8$ i $2$ jest opisany na okręgu. Oblicz jego pole.`,
        [r`Ramię: $\frac{8 + 2}{2} = 5$; odcinek przy podstawie $3$, więc $h = 4$.`, r`$P = \frac{8 + 2}{2} \cdot 4 = 20$.`],
        r`$20$`,
      ),
    ],
    pitfalls: ['Obwód zamiast połowy obwodu we wzorze r = P/p.', r`$R$ i $r$ trójkąta równobocznego zamienione.`, 'Warunek wpisania i opisania czworokąta pomylone.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const PLAN_QUESTIONS: Question[] = [
  // plan-angles ---------------------------------------------------------------
  numeric({
    id: 'p-ang-1',
    skill: 'plan-angles',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dwa kąty trójkąta mają $50^\circ$ i $60^\circ$. Oblicz trzeci kąt (w stopniach).`,
    answer: 70,
    verify: () => 180 - 50 - 60,
    hints: ['Ile wynosi suma kątów w trójkącie?', r`$180^\circ$.`, r`$180^\circ - 50^\circ - 60^\circ$.`, 'Odejmij.'],
    steps: [r`$180 - 110$.`, r`$= 70^\circ$.`],
    errors: [['110', 'Podana suma dwóch danych kątów.', 'Trzeci kąt to 180° minus suma dwóch pozostałych.']],
  }),
  numeric({
    id: 'p-ang-2',
    skill: 'plan-angles',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz kąt przyległy do kąta o mierze $35^\circ$ (w stopniach).`,
    answer: 145,
    verify: () => 180 - 35,
    hints: ['Do ilu stopni sumują się kąty przyległe?', r`Do $180^\circ$.`, r`$180^\circ - 35^\circ$.`, 'Odejmij.'],
    steps: [r`$180 - 35$.`, r`$= 145^\circ$.`],
    errors: [['55', 'Policzony kąt dopełniający do 90°.', 'Kąty przyległe sumują się do 180°.']],
  }),
  numeric({
    id: 'p-ang-3',
    skill: 'plan-angles',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Oblicz sumę kątów wewnętrznych sześciokąta (w stopniach).`,
    answer: 720,
    verify: () => (6 - 2) * 180,
    hints: ['Na ile trójkątów można podzielić sześciokąt przekątnymi z jednego wierzchołka?', 'Na cztery.', r`$(n - 2) \cdot 180^\circ$.`, r`$4 \cdot 180^\circ$.`],
    steps: [r`$(6 - 2) \cdot 180^\circ$.`, r`$= 720^\circ$.`],
    errors: [['1080', r`Policzone $6 \cdot 180^\circ$.`, r`Suma kątów $n$-kąta to $(n - 2) \cdot 180^\circ$.`]],
  }),
  numeric({
    id: 'p-ang-4',
    skill: 'plan-angles',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Na rysunku dwie poziome proste są równoległe. Oblicz miarę kąta $x$ (w stopniach).`,
    figure: parallelLines('coInterior'),
    answer: 120,
    verify: () => 180 - 60,
    hints: ['Jak nazywają się kąty 60° i x względem siebie?', 'Leżą po tej samej stronie poprzecznej, między równoległymi — to kąty jednostronne.', r`Kąty jednostronne sumują się do $180^\circ$.`, r`$x = 180^\circ - 60^\circ$.`],
    steps: [r`$x + 60^\circ = 180^\circ$.`, r`$x = 120^\circ$.`],
    errors: [['60', 'Kąty jednostronne uznane za równe.', 'Równe są kąty odpowiadające i naprzemianległe; jednostronne sumują się do 180°.']],
  }),
  numeric({
    id: 'p-ang-5',
    skill: 'plan-angles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`W trójkącie równoramiennym kąt przy podstawie ma $40^\circ$. Oblicz kąt między ramionami (w stopniach).`,
    answer: 100,
    verify: () => 180 - 2 * 40,
    hints: ['Ile kątów przy podstawie ma trójkąt równoramienny?', 'Dwa równe.', r`$180^\circ - 2 \cdot 40^\circ$.`, 'Policz.'],
    steps: [r`$180 - 80$.`, r`$= 100^\circ$.`],
    errors: [['140', r`Odjęty tylko jeden kąt przy podstawie.`, 'Oba kąty przy podstawie są równe.']],
  }),
  numeric({
    id: 'p-ang-6',
    skill: 'plan-angles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dwa kąty trójkąta mają $45^\circ$ i $65^\circ$. Oblicz kąt zewnętrzny przy trzecim wierzchołku (w stopniach).`,
    answer: 110,
    verify: () => 180 - (180 - 45 - 65),
    hints: ['Jak kąt zewnętrzny ma się do kątów wewnętrznych?', 'Jest równy sumie dwóch kątów wewnętrznych do niego nieprzyległych.', r`$45^\circ + 65^\circ$.`, 'Dodaj.'],
    steps: [r`Kąt zewnętrzny $= 45^\circ + 65^\circ$.`, r`$= 110^\circ$.`],
    errors: [['70', 'Podany kąt wewnętrzny zamiast zewnętrznego.', 'Kąt zewnętrzny jest przyległy do wewnętrznego.']],
  }),
  numeric({
    id: 'p-ang-7',
    skill: 'plan-angles',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Kąt wewnętrzny wielokąta foremnego ma $140^\circ$. Ile boków ma ten wielokąt?`,
    answer: 9,
    verify: () => 360 / (180 - 140),
    hints: ['Jaki wzór opisuje kąt wewnętrzny wielokąta foremnego?', r`$\frac{(n - 2) \cdot 180^\circ}{n}$.`, r`$\frac{(n - 2) \cdot 180}{n} = 140$.`, r`$180n - 360 = 140n$.`],
    steps: [r`$40n = 360$.`, r`$n = 9$.`],
    errors: [['7', r`Rachunek z kątem zewnętrznym równym $50^\circ$ zamiast $40^\circ$.`, r`Kąt zewnętrzny $= 180^\circ - 140^\circ = 40^\circ$.`]],
  }),
  numeric({
    id: 'p-ang-8',
    skill: 'plan-angles',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dwusieczne kątów $A$ i $B$ trójkąta $ABC$ przecinają się w punkcie $S$, a $|\angle ASB| = 125^\circ$. Oblicz $|\angle ACB|$ (w stopniach).`,
    answer: 70,
    verify: () => 180 - 2 * (180 - 125),
    hints: ['Jakie kąty ma trójkąt ABS?', r`$\frac{A}{2}$, $\frac{B}{2}$ i $125^\circ$.`, r`$\frac{A + B}{2} = 180^\circ - 125^\circ$.`, r`Wyznacz $A + B$, a potem $C$.`],
    steps: [r`$\frac{A + B}{2} = 55^\circ \Rightarrow A + B = 110^\circ$.`, r`$C = 180^\circ - 110^\circ = 70^\circ$.`],
    errors: [['55', r`Podana połowa sumy kątów $A$ i $B$.`, r`Z trójkąta $ABS$ wychodzi $\frac{A + B}{2}$ — trzeba jeszcze policzyć $C$.`]],
  }),

  // plan-triangles ------------------------------------------------------------
  numeric({
    id: 'p-tri-1',
    skill: 'plan-triangles',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Przyprostokątne trójkąta prostokątnego mają długości $5$ i $12$. Oblicz długość przeciwprostokątnej.`,
    answer: 13,
    verify: () => Math.hypot(5, 12),
    hints: ['Które twierdzenie łączy boki trójkąta prostokątnego?', 'Twierdzenie Pitagorasa.', r`$c^2 = 25 + 144$.`, 'Wyciągnij pierwiastek.'],
    steps: [r`$c^2 = 169$.`, r`$c = 13$.`],
    errors: [['17', 'Boki dodane zamiast kwadratów.', r`$c^2 = a^2 + b^2$.`]],
  }),
  numeric({
    id: 'p-tri-2',
    skill: 'plan-triangles',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Wysokość trójkąta równobocznego o boku $6$ ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 3,
    verify: () => (6 * Math.sqrt(3)) / 2 / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['Jaki wzór opisuje wysokość trójkąta równobocznego?', r`$h = \frac{a\sqrt3}{2}$.`, r`$h = \frac{6\sqrt3}{2}$.`, 'Skróć ułamek.'],
    steps: [r`$h = 3\sqrt3$.`, r`$k = 3$.`],
    errors: [['27', r`Podane $h^2$ zamiast współczynnika przy $\sqrt3$.`, r`$h = \sqrt{27} = 3\sqrt3$.`]],
  }),
  numeric({
    id: 'p-tri-3',
    skill: 'plan-triangles',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Przeciwprostokątna trójkąta prostokątnego równoramiennego ma długość $10$. Długość przyprostokątnej ma postać $k\sqrt2$. Podaj $k$.`,
    answer: 5,
    verify: () => 10 / Math.sqrt(2) / Math.sqrt(2),
    tolerance: 1e-9,
    hints: ['Jakie kąty ma trójkąt prostokątny równoramienny?', r`$45^\circ, 45^\circ, 90^\circ$ — boki $a, a, a\sqrt2$.`, r`$a\sqrt2 = 10$.`, r`$a = \frac{10}{\sqrt2}$ — usuń niewymierność.`],
    steps: [r`$a = \frac{10}{\sqrt2} = \frac{10\sqrt2}{2}$.`, r`$a = 5\sqrt2$, $k = 5$.`],
    errors: [['10', 'Przyprostokątna pomylona z przeciwprostokątną.', 'W trójkącie 45–45–90 przeciwprostokątna to a√2.']],
  }),
  numeric({
    id: 'p-tri-4',
    skill: 'plan-triangles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`W trójkącie prostokątnym przyprostokątna leżąca przy kącie $60^\circ$ ma długość $5$. Oblicz długość przeciwprostokątnej.`,
    answer: 10,
    verify: () => 5 / Math.cos((60 * Math.PI) / 180),
    tolerance: 1e-9,
    hints: ['Naprzeciw którego kąta leży ta przyprostokątna?', r`Naprzeciw $30^\circ$ — to najkrótszy bok, $a$.`, r`W trójkącie 30–60–90 przeciwprostokątna to $2a$.`, 'Podwój.'],
    steps: [r`Bok przy $60^\circ$ leży naprzeciw $30^\circ$: $a = 5$.`, r`$c = 2a = 10$.`],
    errors: [['2.5', 'Bok podzielony przez 2 zamiast pomnożony.', 'Przeciwprostokątna jest dwa razy dłuższa od boku naprzeciw 30°.']],
  }),
  numeric({
    id: 'p-tri-5',
    skill: 'plan-triangles',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Pole trójkąta równobocznego o boku $4$ ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 4,
    verify: () => (16 * Math.sqrt(3)) / 4 / Math.sqrt(3),
    tolerance: 1e-9,
    hints: ['Jaki wzór opisuje pole trójkąta równobocznego?', r`$P = \frac{a^2\sqrt3}{4}$.`, r`$P = \frac{16\sqrt3}{4}$.`, 'Skróć.'],
    steps: [r`$P = \frac{16\sqrt3}{4}$.`, r`$= 4\sqrt3$, więc $k = 4$.`],
    errors: [['16', 'Pominięte dzielenie przez 4.', r`$P = \frac{a^2\sqrt3}{4}$.`]],
  }),
  numeric({
    id: 'p-tri-6',
    skill: 'plan-triangles',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Trójkąt równoramienny ma ramiona długości $13$ i podstawę długości $10$. Oblicz jego pole.`,
    answer: 60,
    verify: () => 0.5 * 10 * Math.sqrt(13 ** 2 - 5 ** 2),
    tolerance: 1e-9,
    hints: ['Czego brakuje do wzoru na pole?', 'Wysokości opuszczonej na podstawę.', r`Wysokość dzieli podstawę na pół: $h^2 + 5^2 = 13^2$.`, r`Pole: $\frac12 \cdot 10 \cdot h$.`],
    steps: [r`$h = \sqrt{169 - 25} = 12$.`, r`$P = \frac12 \cdot 10 \cdot 12 = 60$.`],
    errors: [['120', 'Pominięte ½ we wzorze na pole.', r`$P = \frac12 a h$.`]],
  }),
  numeric({
    id: 'p-tri-7',
    skill: 'plan-triangles',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Drabina długości $5$ m opiera się o ścianę, a jej dolny koniec stoi $3$ m od ściany. Dolny koniec odsunięto o kolejny $1$ m. O ile metrów zsunął się górny koniec?`,
    answer: 1,
    verify: () => Math.sqrt(25 - 9) - Math.sqrt(25 - 16),
    tolerance: 1e-9,
    hints: ['Na jakiej wysokości był górny koniec na początku?', r`$\sqrt{25 - 9}$.`, r`Po odsunięciu dolny koniec jest $4$ m od ściany: wysokość $\sqrt{25 - 16}$.`, 'Odejmij wysokości.'],
    steps: [r`Na początku $4$ m, potem $3$ m.`, r`Zsunął się o $1$ m.`],
    errors: [['3', 'Podana nowa wysokość zamiast różnicy.', 'Pytanie dotyczy zmiany wysokości.']],
  }),
  numeric({
    id: 'p-tri-8',
    skill: 'plan-triangles',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Trójkąt ma boki długości $13$, $14$ i $15$. Oblicz długość wysokości opuszczonej na bok długości $14$.`,
    answer: 12,
    verify: () => {
      // spodek wysokości dzieli bok 14 na x i 14 - x
      const x = (13 ** 2 - 15 ** 2 + 14 ** 2) / (2 * 14);
      return Math.sqrt(13 ** 2 - x ** 2);
    },
    tolerance: 1e-9,
    hints: ['Na jakie części wysokość dzieli bok 14?', r`Na $x$ i $14 - x$ — powstają dwa trójkąty prostokątne.`, r`$h^2 = 13^2 - x^2 = 15^2 - (14 - x)^2$.`, r`Odejmij równania: $x = 5$.`],
    steps: [r`$169 - x^2 = 225 - 196 + 28x - x^2 \Rightarrow x = 5$.`, r`$h = \sqrt{169 - 25} = 12$.`],
    errors: [['84', 'Podane pole zamiast wysokości.', 'Pole to ½ · 14 · h — pytanie jest o h.']],
  }),

  // plan-similarity -----------------------------------------------------------
  numeric({
    id: 'p-sim-1',
    skill: 'plan-similarity',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Trójkąty są podobne w skali $3$ (większy do mniejszego). Bok mniejszego ma długość $4$. Oblicz długość odpowiadającego boku większego.`,
    answer: 12,
    verify: () => 3 * 4,
    hints: ['Co oznacza skala podobieństwa?', 'Każdy bok większego jest k razy dłuższy.', r`$4 \cdot 3$.`, 'Pomnóż.'],
    steps: [r`$4 \cdot 3$.`, r`$= 12$.`],
    errors: [['7', 'Skala dodana zamiast pomnożona.', 'Skala to mnożnik długości.']],
  }),
  numeric({
    id: 'p-sim-2',
    skill: 'plan-similarity',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Trójkąt o polu $5$ powiększono w skali $3$. Oblicz pole powiększonego trójkąta.`,
    answer: 45,
    verify: () => 5 * 3 ** 2,
    hints: ['Jak zmienia się pole figury przy skali k?', r`Pole mnoży się przez $k^2$.`, r`$k^2 = 9$.`, r`$5 \cdot 9$.`],
    steps: [r`$P' = 5 \cdot 9$.`, r`$= 45$.`],
    errors: [['15', 'Pole pomnożone przez skalę zamiast przez jej kwadrat.', r`Skala pól to $k^2$.`]],
  }),
  choice({
    id: 'p-sim-3',
    skill: 'plan-similarity',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Który trójkąt jest podobny do trójkąta o bokach $3$, $4$, $5$?`,
    choices: [r`$6, 8, 10$`, r`$4, 5, 6$`, r`$3, 4, 6$`, r`$5, 12, 13$`],
    answer: 'A',
    hints: ['Jaki warunek muszą spełniać boki trójkątów podobnych?', 'Muszą być proporcjonalne — z tą samą skalą.', r`Podziel boki przez $3, 4, 5$.`, r`$\frac63 = \frac84 = \frac{10}{5}$.`],
    steps: [r`$6, 8, 10$ — skala $2$ dla każdego boku.`, 'Pozostałe nie mają stałej skali.'],
    errors: [
      ['B', 'Do każdego boku dodano 1.', 'Podobieństwo to mnożenie, nie dodawanie.'],
      ['C', 'Zmieniony tylko jeden bok.', 'Wszystkie boki muszą się zmienić w tej samej skali.'],
      ['D', 'Wybrany inny trójkąt prostokątny.', 'Bycie prostokątnym nie wystarcza — kąty ostre też muszą być równe.'],
    ],
  }),
  numeric({
    id: 'p-sim-4',
    skill: 'plan-similarity',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Na rysunku odcinek $DE$ jest równoległy do $BC$, $|AD| = 4$, $|DB| = 2$, $|AE| = 6$. Oblicz $|EC| = x$.`,
    figure: talesFigure({ ad: '4', db: '2', ae: '6', ec: 'x' }),
    answer: 3,
    verify: () => (6 * 2) / 4,
    hints: ['Które twierdzenie łączy odcinki na ramionach kąta przeciętych równoległymi?', 'Twierdzenie Talesa.', r`$\frac{4}{2} = \frac{6}{x}$.`, 'Rozwiąż proporcję.'],
    steps: [r`$4x = 12$.`, r`$x = 3$.`],
    errors: [['9', r`Policzony cały bok $AC$ zamiast odcinka $EC$.`, r`$AC = AE + EC$ — pytanie jest o $EC$.`]],
  }),
  numeric({
    id: 'p-sim-5',
    skill: 'plan-similarity',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Człowiek o wzroście $1{,}8$ m rzuca cień długości $2{,}4$ m. W tym samym czasie drzewo rzuca cień długości $12$ m. Oblicz wysokość drzewa (w metrach).`,
    answer: 9,
    verify: () => (12 * 1.8) / 2.4,
    tolerance: 1e-9,
    hints: ['Dlaczego trójkąty człowiek–cień i drzewo–cień są podobne?', 'Promienie słońca padają pod tym samym kątem.', r`$\frac{h}{12} = \frac{1{,}8}{2{,}4}$.`, 'Wyznacz h.'],
    steps: [r`$h = 12 \cdot 0{,}75$.`, r`$= 9$ m.`],
    errors: [['16', 'Odwrócona proporcja.', 'Wysokość do cienia — ten sam stosunek dla obu.']],
  }),
  numeric({
    id: 'p-sim-6',
    skill: 'plan-similarity',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Podstawy trapezu mają długości $6$ i $9$. Przekątna ma długość $10$. Na jakie części dzieli ją punkt przecięcia przekątnych? Podaj dłuższą.`,
    answer: 6,
    verify: () => (10 * 9) / (6 + 9),
    hints: ['Jakie trójkąty tworzą przekątne z podstawami?', 'Dwa trójkąty podobne (kąty naprzemianległe przy równoległych podstawach).', r`Skala podobieństwa to $\frac{9}{6}$ — w tym stosunku dzielą się przekątne.`, r`Części $\frac{6}{15} \cdot 10$ i $\frac{9}{15} \cdot 10$.`],
    steps: [r`Części $4$ i $6$.`, r`Dłuższa: $6$.`],
    errors: [['4', 'Podana krótsza część.', 'Pytanie dotyczy dłuższej części.']],
  }),
  numeric({
    id: 'p-sim-7',
    skill: 'plan-similarity',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Na mapie w skali $1 : 25\,000$ działka ma pole $8\ \mathrm{cm}^2$. Ile hektarów ma w rzeczywistości? ($1$ ha $= 10\,000\ \mathrm{m}^2$.)`,
    answer: 50,
    verify: () => (8 * 25000 ** 2) / 1e4 / 1e4,
    tolerance: 1e-9,
    hints: ['W jakiej skali zmieniają się pola, gdy długości zmieniają się w skali 25 000?', r`W skali $25\,000^2$.`, r`$1\ \mathrm{cm}$ na mapie to $250$ m, więc $1\ \mathrm{cm}^2$ to $250 \cdot 250\ \mathrm{m}^2$.`, r`$8 \cdot 62\,500\ \mathrm{m}^2$ — zamień na hektary.`],
    steps: [r`$8 \cdot 62\,500 = 500\,000\ \mathrm{m}^2$.`, r`$= 50$ ha.`],
    errors: [['0.002', 'Pole przeliczone skalą długości zamiast jej kwadratem.', 'Skala pól to kwadrat skali długości.']],
  }),
  numeric({
    id: 'p-sim-8',
    skill: 'plan-similarity',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Prosta równoległa do boku $BC$ trójkąta $ABC$ przecina bok $AB$ w punkcie $D$ i dzieli trójkąt na trójkąt i trapez, których pola są w stosunku $4 : 5$. Oblicz $\frac{|AD|}{|DB|}$.`,
    answer: 2,
    verify: () => {
      const k = Math.sqrt(4 / 9);
      return k / (1 - k);
    },
    tolerance: 1e-9,
    hints: ['Jaką częścią pola całego trójkąta jest mały trójkąt?', r`$\frac{4}{4 + 5} = \frac49$.`, r`Skala podobieństwa: $k = \sqrt{\frac49}$.`, r`$|AD| = k \cdot |AB|$, a $|DB| = |AB| - |AD|$.`],
    steps: [r`$k = \frac23$, więc $|AD| = \frac23|AB|$, $|DB| = \frac13|AB|$.`, r`$\frac{|AD|}{|DB|} = 2$.`],
    errors: [['0.8', 'Stosunek pól wzięty jako stosunek odcinków.', 'Skala długości to pierwiastek ze skali pól — i liczona do całego trójkąta.']],
  }),

  // plan-quadrilaterals -------------------------------------------------------
  numeric({
    id: 'p-quad-1',
    skill: 'plan-quadrilaterals',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Trapez ma podstawy długości $8$ i $4$ oraz wysokość $5$. Oblicz jego pole.`,
    answer: 30,
    verify: () => ((8 + 4) / 2) * 5,
    hints: ['Jaki jest wzór na pole trapezu?', r`$P = \frac{a + b}{2} \cdot h$.`, r`$\frac{8 + 4}{2} \cdot 5$.`, 'Policz.'],
    steps: [r`$6 \cdot 5$.`, r`$= 30$.`],
    errors: [['60', 'Pominięte dzielenie przez 2.', 'Pole trapezu to średnia podstaw razy wysokość.']],
  }),
  numeric({
    id: 'p-quad-2',
    skill: 'plan-quadrilaterals',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Przekątne rombu mają długości $6$ i $8$. Oblicz pole rombu.`,
    answer: 24,
    verify: () => (6 * 8) / 2,
    hints: ['Jaki wzór na pole rombu wykorzystuje przekątne?', r`$P = \frac{d_1 d_2}{2}$.`, r`$\frac{6 \cdot 8}{2}$.`, 'Policz.'],
    steps: [r`$\frac{48}{2}$.`, r`$= 24$.`],
    errors: [['48', 'Pominięte dzielenie przez 2.', r`$P = \frac{d_1 d_2}{2}$.`]],
  }),
  numeric({
    id: 'p-quad-3',
    skill: 'plan-quadrilaterals',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Przekątne rombu mają długości $6$ i $8$. Oblicz długość boku rombu.`,
    answer: 5,
    verify: () => Math.hypot(3, 4),
    hints: ['Jak przekątne rombu dzielą się nawzajem?', 'Na połowy, pod kątem prostym.', r`Połówki: $3$ i $4$ — przyprostokątne trójkąta z bokiem rombu.`, 'Pitagoras.'],
    steps: [r`$a^2 = 9 + 16$.`, r`$a = 5$.`],
    errors: [['10', 'Pitagoras z całymi przekątnymi.', 'Przekątne rombu dzielą się na połowy.']],
  }),
  choice({
    id: 'p-quad-4',
    skill: 'plan-quadrilaterals',
    kind: 'typical',
    difficulty: 2,
    prompt: 'W którym czworokącie przekątne zawsze są prostopadłe?',
    choices: ['w rombie', 'w prostokącie', 'w równoległoboku', 'w trapezie'],
    answer: 'A',
    hints: ['Jakie trójkąty tworzą przekątne rombu?', 'Cztery przystające trójkąty prostokątne.', 'Czy w prostokącie przekątne się tak dzielą?', 'W prostokącie przekątne są równe, ale zwykle nie prostopadłe.'],
    steps: ['Romb: przekątne prostopadłe i dzielą się na pół.', 'Prostokąt, równoległobok, trapez — zwykle nie.'],
    errors: [
      ['B', 'Pomylona równość przekątnych z prostopadłością.', 'Przekątne prostokąta są równe; prostopadłe tylko w kwadracie.'],
      ['C', 'W równoległoboku przekątne dzielą się na pół, ale nie muszą być prostopadłe.', 'Prostopadłość to cecha rombu.'],
      ['D', 'Trapez nie ma takiej własności.', 'Prostopadłość to cecha rombu.'],
    ],
  }),
  numeric({
    id: 'p-quad-5',
    skill: 'plan-quadrilaterals',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Trapez równoramienny ma podstawy długości $10$ i $4$ oraz ramię długości $5$. Oblicz jego pole.`,
    answer: 28,
    verify: () => ((10 + 4) / 2) * Math.sqrt(25 - ((10 - 4) / 2) ** 2),
    tolerance: 1e-9,
    hints: ['Czego brakuje do wzoru na pole?', 'Wysokości.', r`Wysokość odcina z dłuższej podstawy odcinek $\frac{10 - 4}{2}$.`, r`$h^2 + 3^2 = 5^2$.`],
    steps: [r`$h = 4$.`, r`$P = \frac{10 + 4}{2} \cdot 4 = 28$.`],
    errors: [['35', 'Ramię wzięte jako wysokość.', 'Ramię jest ukośne — wysokość liczysz z Pitagorasa.']],
  }),
  numeric({
    id: 'p-quad-6',
    skill: 'plan-quadrilaterals',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Prostokąt ma obwód $28$ i przekątną długości $10$. Oblicz jego pole.`,
    answer: 48,
    verify: () => ((28 / 2) ** 2 - 10 ** 2) / 2,
    hints: ['Jakie dwa równania łączą boki a i b?', r`$a + b = 14$ oraz $a^2 + b^2 = 100$.`, r`$(a + b)^2 = a^2 + b^2 + 2ab$.`, r`$196 = 100 + 2ab$.`],
    steps: [r`$2ab = 96$.`, r`$P = ab = 48$.`],
    errors: [['96', r`Podane $2ab$ zamiast $ab$.`, r`$2ab = 96$, więc pole to połowa.`]],
  }),
  numeric({
    id: 'p-quad-7',
    skill: 'plan-quadrilaterals',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Działka ma kształt trapezu prostokątnego o podstawach $30$ m i $21$ m oraz ramieniu prostopadłym do podstaw długości $12$ m. Ile metrów płotu potrzeba, żeby ogrodzić całą działkę?`,
    answer: 78,
    verify: () => 30 + 21 + 12 + Math.hypot(12, 30 - 21),
    tolerance: 1e-9,
    hints: ['Którego boku brakuje?', 'Ramienia ukośnego.', r`Tworzy trójkąt prostokątny z przyprostokątnymi $12$ i $30 - 21$.`, 'Pitagoras, potem dodaj wszystkie boki.'],
    steps: [r`Ramię ukośne: $\sqrt{144 + 81} = 15$.`, r`Obwód: $30 + 21 + 12 + 15 = 78$ m.`],
    errors: [['63', 'Pominięte ramię ukośne.', 'Płot idzie wokół całej działki — wszystkie cztery boki.']],
  }),
  numeric({
    id: 'p-quad-8',
    skill: 'plan-quadrilaterals',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Prostokątna działka ma pole $1200\ \mathrm{m}^2$, a jej długość jest o $10$ m większa od szerokości. Oblicz długość przekątnej działki (w metrach).`,
    answer: 50,
    verify: () => {
      const w = (-10 + Math.sqrt(100 + 4800)) / 2;
      return Math.hypot(w, w + 10);
    },
    tolerance: 1e-9,
    hints: ['Jak zapisać pole przez szerokość x?', r`$x(x + 10) = 1200$.`, r`$x^2 + 10x - 1200 = 0$ — odrzuć ujemne rozwiązanie.`, 'Z wymiarów policz przekątną z Pitagorasa.'],
    steps: [r`$x = 30$, wymiary $30 \times 40$.`, r`Przekątna: $\sqrt{900 + 1600} = 50$ m.`],
    errors: [['40', 'Podana długość działki zamiast przekątnej.', 'Przekątna łączy przeciwległe wierzchołki.']],
  }),

  // plan-circle ---------------------------------------------------------------
  numeric({
    id: 'p-circ-1',
    skill: 'plan-circle',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Kąt środkowy ma $80^\circ$. Oblicz kąt wpisany oparty na tym samym łuku (w stopniach).`,
    answer: 40,
    verify: () => 80 / 2,
    hints: ['Jaka jest zależność między kątem środkowym a wpisanym?', 'Kąt wpisany jest dwa razy mniejszy.', r`$80^\circ : 2$.`, 'Podziel.'],
    steps: [r`$\frac{80^\circ}{2}$.`, r`$= 40^\circ$.`],
    errors: [['160', 'Kąt pomnożony zamiast podzielony.', 'Wpisany jest połową środkowego, nie odwrotnie.']],
  }),
  numeric({
    id: 'p-circ-2',
    skill: 'plan-circle',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Długość okręgu o promieniu $5$ ma postać $k\pi$. Podaj $k$.`,
    answer: 10,
    verify: () => (2 * Math.PI * 5) / Math.PI,
    tolerance: 1e-9,
    hints: ['Jaki jest wzór na długość okręgu?', r`$L = 2\pi r$.`, r`$L = 2\pi \cdot 5$.`, r`Współczynnik przy $\pi$.`],
    steps: [r`$L = 10\pi$.`, r`$k = 10$.`],
    errors: [['25', r`Policzone pole koła $\pi r^2$.`, r`Długość okręgu to $2\pi r$.`]],
  }),
  numeric({
    id: 'p-circ-3',
    skill: 'plan-circle',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Trójkąt $ABC$ jest wpisany w okrąg, a bok $AB$ jest średnicą. Kąt $BAC$ ma $35^\circ$. Oblicz kąt $ABC$ (w stopniach).`,
    answer: 55,
    verify: () => 180 - 90 - 35,
    hints: ['Jaki kąt ma trójkąt przy wierzchołku C?', 'Kąt wpisany oparty na średnicy jest prosty.', r`Kąty trójkąta: $35^\circ$, $90^\circ$ i szukany.`, r`$180^\circ - 90^\circ - 35^\circ$.`],
    steps: [r`$|\angle ACB| = 90^\circ$.`, r`$|\angle ABC| = 55^\circ$.`],
    errors: [['145', 'Pominięty kąt prosty przy C.', 'Kąt wpisany oparty na średnicy ma 90°.']],
  }),
  numeric({
    id: 'p-circ-4',
    skill: 'plan-circle',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Pole wycinka koła o promieniu $6$ i kącie środkowym $60^\circ$ ma postać $k\pi$. Podaj $k$.`,
    answer: 6,
    verify: () => (60 / 360) * 36,
    tolerance: 1e-9,
    hints: ['Jaką częścią koła jest ten wycinek?', r`$\frac{60^\circ}{360^\circ} = \frac16$.`, r`Pole koła: $36\pi$.`, r`$\frac16 \cdot 36\pi$.`],
    steps: [r`$\frac16 \cdot 36\pi$.`, r`$= 6\pi$, $k = 6$.`],
    errors: [['36', 'Podane pole całego koła.', 'Wycinek to tylko część koła — proporcjonalna do kąta.']],
  }),
  numeric({
    id: 'p-circ-5',
    skill: 'plan-circle',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Punkt $P$ leży w odległości $13$ od środka okręgu o promieniu $5$. Oblicz długość odcinka stycznej poprowadzonej z $P$ do okręgu.`,
    answer: 12,
    verify: () => Math.sqrt(13 ** 2 - 5 ** 2),
    hints: ['Jaki kąt tworzy styczna z promieniem w punkcie styczności?', 'Prosty.', r`Trójkąt prostokątny: przeciwprostokątna $13$, przyprostokątna $5$.`, 'Pitagoras.'],
    steps: [r`$d^2 = 169 - 25$.`, r`$d = 12$.`],
    errors: [['8', 'Odjęte długości zamiast kwadratów.', 'Promień i styczna tworzą kąt prosty — działa Pitagoras.']],
  }),
  numeric({
    id: 'p-circ-6',
    skill: 'plan-circle',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Na rysunku $O$ jest środkiem okręgu, $|\angle AOB| = 3x - 60^\circ$, a $|\angle ACB| = x$. Oblicz $x$ (w stopniach).`,
    figure: circleAngles('3x − 60°', 'x'),
    answer: 60,
    verify: () => 60 / (3 - 2),
    hints: ['Jaka zależność łączy te dwa kąty?', 'Oba opierają się na łuku AB: środkowy jest dwa razy większy.', r`$3x - 60 = 2x$.`, 'Rozwiąż równanie.'],
    steps: [r`$3x - 60 = 2x$.`, r`$x = 60^\circ$.`],
    errors: [['20', r`Przyjęta równość $3x - 60 = x$.`, 'Kąt środkowy jest dwa razy większy od wpisanego.']],
  }),
  numeric({
    id: 'p-circ-7',
    skill: 'plan-circle',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Koło rowerowe ma średnicę $70$ cm. Ile pełnych obrotów wykona na odcinku $1$ km?`,
    answer: 454,
    verify: () => Math.floor(100000 / (70 * Math.PI)),
    hints: ['Jaką drogę pokonuje koło w czasie jednego obrotu?', r`Długość okręgu: $70\pi$ cm.`, r`$1$ km $= 100\,000$ cm.`, r`$\frac{100\,000}{70\pi}$ — ile to pełnych obrotów?`],
    steps: [r`$\frac{100\,000}{70\pi} \approx 454{,}7$.`, 'Pełnych obrotów: 454.'],
    errors: [
      ['455', 'Zaokrąglenie w górę.', 'Pytanie jest o PEŁNE obroty — odrzucasz niepełny.'],
      ['909', 'Użyty promień zamiast średnicy we wzorze πd.', r`Obwód koła to $\pi d = 70\pi$ cm.`],
    ],
  }),
  numeric({
    id: 'p-circ-8',
    skill: 'plan-circle',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dwa okręgi o promieniach $4$ i $9$ są styczne zewnętrznie. Oblicz długość odcinka ich wspólnej stycznej zewnętrznej (między punktami styczności).`,
    answer: 12,
    verify: () => Math.sqrt((4 + 9) ** 2 - (9 - 4) ** 2),
    hints: ['Jaka jest odległość środków okręgów stycznych zewnętrznie?', r`$4 + 9 = 13$.`, 'Promienie do punktów styczności są prostopadłe do stycznej — powstaje trapez prostokątny.', r`Odetnij prostokąt: trójkąt o przeciwprostokątnej $13$ i przyprostokątnej $9 - 4$.`],
    steps: [r`$d^2 = 13^2 - 5^2 = 144$.`, r`$d = 12$.`],
    errors: [['13', 'Podana odległość środków.', 'Odcinek stycznej to przyprostokątna, nie przeciwprostokątna.']],
  }),

  // plan-inscribed ------------------------------------------------------------
  numeric({
    id: 'p-ins-1',
    skill: 'plan-inscribed',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Przeciwprostokątna trójkąta prostokątnego ma długość $10$. Oblicz promień okręgu opisanego na tym trójkącie.`,
    answer: 5,
    verify: () => 10 / 2,
    hints: ['Gdzie leży środek okręgu opisanego na trójkącie prostokątnym?', 'W środku przeciwprostokątnej.', 'Przeciwprostokątna jest średnicą.', 'Promień to połowa średnicy.'],
    steps: [r`$2R = 10$.`, r`$R = 5$.`],
    errors: [['10', 'Podana średnica zamiast promienia.', 'Przeciwprostokątna to średnica — promień jest połową.']],
  }),
  numeric({
    id: 'p-ins-2',
    skill: 'plan-inscribed',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Wysokość trójkąta równobocznego ma długość $9$. Oblicz promień okręgu wpisanego w ten trójkąt.`,
    answer: 3,
    verify: () => 9 / 3,
    hints: ['Gdzie leży środek okręgu wpisanego w trójkąt równoboczny?', 'W punkcie przecięcia wysokości, które dzielą się w stosunku 2 : 1.', 'Promień okręgu wpisanego to jedna trzecia wysokości.', 'Podziel.'],
    steps: [r`$r = \frac{9}{3}$.`, r`$= 3$.`],
    errors: [['6', r`Policzony promień okręgu opisanego $R = \frac23 h$.`, r`Okrąg wpisany: $r = \frac13 h$.`]],
  }),
  choice({
    id: 'p-ins-3',
    skill: 'plan-inscribed',
    kind: 'typical',
    difficulty: 2,
    prompt: 'W który czworokąt zawsze można wpisać okrąg?',
    choices: ['w romb', 'w prostokąt', 'w trapez', 'w równoległobok'],
    answer: 'A',
    hints: ['Jaki warunek musi spełniać czworokąt, żeby dało się w niego wpisać okrąg?', 'Sumy przeciwległych boków muszą być równe.', 'Sprawdź warunek dla rombu — wszystkie boki równe.', r`$a + a = a + a$.`],
    steps: ['W rombie sumy przeciwległych boków są zawsze równe.', 'W prostokącie tylko gdy jest kwadratem.'],
    errors: [
      ['B', 'Pomylony okrąg wpisany z opisanym.', 'Na prostokącie zawsze można OPISAĆ okrąg; wpisać — tylko w kwadrat.'],
      ['C', 'Nie każdy trapez spełnia warunek a + c = b + d.', 'Warunek musi zachodzić zawsze.'],
      ['D', 'W równoległoboku a + c = b + d tylko, gdy jest rombem.', 'Warunek: równe sumy przeciwległych boków.'],
    ],
  }),
  numeric({
    id: 'p-ins-4',
    skill: 'plan-inscribed',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Czworokąt $ABCD$ jest wpisany w okrąg, $|\angle A| = 70^\circ$. Oblicz $|\angle C|$ (w stopniach).`,
    answer: 110,
    verify: () => 180 - 70,
    hints: ['Jaki warunek spełniają kąty czworokąta wpisanego w okrąg?', 'Przeciwległe kąty sumują się do 180°.', r`$A$ i $C$ są przeciwległe.`, r`$180^\circ - 70^\circ$.`],
    steps: [r`$A + C = 180^\circ$.`, r`$C = 110^\circ$.`],
    errors: [['70', 'Przeciwległe kąty uznane za równe.', 'W czworokącie wpisanym przeciwległe kąty sumują się do 180°.']],
  }),
  numeric({
    id: 'p-ins-5',
    skill: 'plan-inscribed',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz promień okręgu wpisanego w trójkąt o bokach $6$, $8$, $10$.`,
    answer: 2,
    verify: () => (0.5 * 6 * 8) / ((6 + 8 + 10) / 2),
    hints: ['Jaki wzór łączy promień okręgu wpisanego z polem?', r`$r = \frac{P}{p}$, gdzie $p$ to połowa obwodu.`, 'Trójkąt jest prostokątny — pole to połowa iloczynu przyprostokątnych.', r`$p = 12$.`],
    steps: [r`$P = 24$, $p = 12$.`, r`$r = 2$.`],
    errors: [['1', 'Pole podzielone przez cały obwód.', r`We wzorze $r = \frac{P}{p}$ jest POŁOWA obwodu.`]],
  }),
  numeric({
    id: 'p-ins-6',
    skill: 'plan-inscribed',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Czworokąt $ABCD$ jest opisany na okręgu, $|AB| = 7$, $|BC| = 9$, $|CD| = 8$. Oblicz $|DA|$.`,
    answer: 6,
    verify: () => 7 + 8 - 9,
    hints: ['Jaki warunek spełniają boki czworokąta opisanego na okręgu?', 'Sumy przeciwległych boków są równe.', r`$|AB| + |CD| = |BC| + |DA|$.`, r`$7 + 8 = 9 + |DA|$.`],
    steps: [r`$15 = 9 + |DA|$.`, r`$|DA| = 6$.`],
    errors: [['10', r`Sparowane sąsiednie boki: $|AB| + |BC| = |CD| + |DA|$.`, 'Sumuje się boki PRZECIWLEGŁE.']],
  }),
  numeric({
    id: 'p-ins-7',
    skill: 'plan-inscribed',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Trapez równoramienny o podstawach $8$ i $2$ jest opisany na okręgu. Oblicz pole trapezu.`,
    answer: 20,
    verify: () => {
      const arm = (8 + 2) / 2;
      const h = Math.sqrt(arm ** 2 - ((8 - 2) / 2) ** 2);
      return ((8 + 2) / 2) * h;
    },
    tolerance: 1e-9,
    hints: ['Co wynika z tego, że trapez jest opisany na okręgu?', 'Suma podstaw = suma ramion.', r`Ramiona są równe: $2c = 8 + 2$.`, r`Wysokość: odcinek przy podstawie $\frac{8 - 2}{2}$ i Pitagoras.`],
    steps: [r`Ramię $5$, $h = \sqrt{25 - 9} = 4$.`, r`$P = 5 \cdot 4 = 20$.`],
    errors: [['25', 'Ramię wzięte jako wysokość.', 'Wysokość liczysz z Pitagorasa.']],
  }),
  numeric({
    id: 'p-ins-8',
    skill: 'plan-inscribed',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W trójkącie równobocznym promień okręgu opisanego jest o $2$ dłuższy od promienia okręgu wpisanego. Długość boku ma postać $k\sqrt3$. Podaj $k$.`,
    answer: 4,
    verify: () => {
      // R = 2r, R - r = 2 -> r = 2, h = 3r = 6, a = 2h / sqrt3
      const h = 3 * 2;
      return (2 * h) / Math.sqrt(3) / Math.sqrt(3);
    },
    tolerance: 1e-9,
    hints: ['Jaka jest zależność między R i r w trójkącie równobocznym?', r`$R = \frac23 h$, $r = \frac13 h$, więc $R = 2r$.`, r`$2r - r = 2$ — wyznacz $r$, a potem $h$.`, r`$h = \frac{a\sqrt3}{2}$ — wyznacz $a$.`],
    steps: [r`$r = 2$, $h = 6$.`, r`$a = \frac{2h}{\sqrt3} = \frac{12}{\sqrt3} = 4\sqrt3$, $k = 4$.`],
    errors: [['6', 'Podana wysokość zamiast boku.', r`Bok wyznaczasz z $h = \frac{a\sqrt3}{2}$.`]],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const PLAN_CARDS: Flashcard[] = [
  card('c-plan-ang-1', 'plan-angles', 'wzor', 'Suma kątów n-kąta?', r`$(n - 2) \cdot 180^\circ$`),
  card('c-plan-ang-2', 'plan-angles', 'definicja', 'Kąty przy prostych równoległych?', 'Odpowiadające i naprzemianległe — równe; jednostronne — sumują się do 180°.'),

  card('c-plan-tri-1', 'plan-triangles', 'wzor', 'Trójkąt 30°–60°–90°?', r`Boki $a$, $a\sqrt3$, $2a$ ($a$ naprzeciw $30^\circ$).`),
  card('c-plan-tri-2', 'plan-triangles', 'wzor', 'Trójkąt równoboczny: wysokość i pole?', r`$h = \frac{a\sqrt3}{2}$, $P = \frac{a^2\sqrt3}{4}$`),

  card('c-plan-sim-1', 'plan-similarity', 'wzor', 'Skala podobieństwa k — jak zmienia się pole?', r`Pole mnoży się przez $k^2$.`),
  card('c-plan-sim-2', 'plan-similarity', 'definicja', 'Twierdzenie Talesa?', 'Proste równoległe odcinają na ramionach kąta odcinki proporcjonalne.'),

  card('c-plan-quad-1', 'plan-quadrilaterals', 'wzor', 'Pole trapezu i rombu?', r`$\frac{a + b}{2}h$; $\frac{d_1 d_2}{2}$`),
  card('c-plan-quad-2', 'plan-quadrilaterals', 'metoda', 'Wysokość trapezu równoramiennego?', r`Odcinek przy podstawie $\frac{a - b}{2}$, ramię — Pitagoras.`),

  card('c-plan-circ-1', 'plan-circle', 'definicja', 'Kąt wpisany a środkowy (ten sam łuk)?', 'Wpisany jest dwa razy mniejszy; oparty na średnicy — prosty.'),
  card('c-plan-circ-2', 'plan-circle', 'wzor', 'Długość łuku i pole wycinka?', r`$\frac{\alpha}{360^\circ} \cdot 2\pi r$; $\frac{\alpha}{360^\circ} \cdot \pi r^2$`),

  card('c-plan-ins-1', 'plan-inscribed', 'wzor', 'Promień okręgu wpisanego w trójkąt?', r`$r = \frac{P}{p}$, $p$ — połowa obwodu.`),
  card('c-plan-ins-2', 'plan-inscribed', 'definicja', 'Warunki: czworokąt wpisany / opisany?', 'Wpisany w okrąg: przeciwległe kąty sumują się do 180°. Opisany na okręgu: a + c = b + d.'),
];

import type { Question, Skill, Topic } from '@/data/types';

/** Trygonometria. Materiał autorski, niezweryfikowany wobec CKE. */

export const TRIG_TOPIC: Topic = {
  id: 'math-trigonometry',
  subjectId: 'math',
  name: 'Trygonometria',
};

export const TRIG_SKILLS: Skill[] = [
  {
    id: 'trig-values',
    topicId: 'math-trigonometry',
    name: 'Wartości funkcji trygonometrycznych',
    ckeRequirement: 'Trygonometria — funkcje kąta ostrego',
    prerequisites: [],
    examValue: 0.7,
  },
  {
    id: 'trig-identities',
    topicId: 'math-trigonometry',
    name: 'Tożsamości trygonometryczne',
    ckeRequirement: 'Trygonometria — związki między funkcjami',
    prerequisites: ['trig-values'],
    examValue: 0.75,
  },
  {
    id: 'trig-equations',
    topicId: 'math-trigonometry',
    name: 'Równania trygonometryczne',
    ckeRequirement: 'Trygonometria — proste równania',
    prerequisites: ['trig-identities'],
    examValue: 0.7,
  },
];

export const TRIG_QUESTIONS: Question[] = [
  // --- trig-values ------------------------------------------------------
  {
    id: 'q-trig-v-1',
    skillId: 'trig-values',
    kind: 'foundation',
    prompt: 'Podaj wartość $\\sin 30^\\circ$.',
    format: 'numeric',
    answer: '0.5',
    acceptedVariants: ['1/2'],
    solution: '$\\sin 30^\\circ = \\tfrac{1}{2}$ — wartość z tablicy kątów podstawowych.',
    hints: [
      { level: 1, text: 'Czy pamiętasz wartości funkcji dla kątów podstawowych?' },
      { level: 2, text: 'Dla tego kąta sinus jest najmniejszy spośród kątów podstawowych.' },
      { level: 3, text: 'W trójkącie o kątach $30^\\circ, 60^\\circ, 90^\\circ$ bok naprzeciw najmniejszego kąta jest połową przeciwprostokątnej.' },
      { level: 5, text: 'Iloraz tych dwóch boków daje wynik w postaci prostego ułamka.' },
    ],
    commonErrors: [
      {
        id: 'trig-sin-cos-zamiana',
        matches: ['0.866'],
        cause: 'Podana wartość cosinusa zamiast sinusa dla tego kąta.',
        rule: '$\\sin 30^\\circ = \\tfrac{1}{2}$, natomiast $\\cos 30^\\circ = \\tfrac{\\sqrt{3}}{2}$.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-v-2',
    skillId: 'trig-values',
    kind: 'typical',
    prompt:
      'W trójkącie prostokątnym przyprostokątna leżąca naprzeciw kąta $\\alpha$ ma długość $3$, a przeciwprostokątna $5$. Podaj $\\sin\\alpha$.',
    format: 'numeric',
    answer: '0.6',
    acceptedVariants: ['3/5'],
    solution: '$\\sin\\alpha = \\dfrac{\\text{przyprostokątna naprzeciw}}{\\text{przeciwprostokątna}} = \\dfrac{3}{5} = 0{,}6$.',
    hints: [
      { level: 1, text: 'Który bok występuje w liczniku definicji sinusa, a który w mianowniku?' },
      { level: 2, text: 'Sinus to stosunek boku leżącego naprzeciw kąta do przeciwprostokątnej.' },
      { level: 3, text: 'Mianownikiem zawsze jest przeciwprostokątna — najdłuższy bok.' },
      { level: 5, text: 'Podziel bok naprzeciw kąta przez przeciwprostokątną.' },
    ],
    commonErrors: [
      {
        id: 'trig-odwrocony-ulamek',
        matches: ['1.667', '5/3'],
        cause: 'Odwrócony ułamek — przeciwprostokątna w liczniku.',
        rule: 'Sinus kąta ostrego nigdy nie przekracza jedynki.',
      },
      {
        id: 'trig-przylegla-zamiast-naprzeciw',
        matches: ['0.8', '4/5'],
        cause: 'Użyta druga przyprostokątna — policzony cosinus zamiast sinusa.',
        rule: 'Sinus korzysta z boku naprzeciw kąta, cosinus z boku przyległego.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-v-3',
    skillId: 'trig-values',
    kind: 'typical',
    prompt: 'Podaj wartość $\\cos 60^\\circ + \\sin 90^\\circ$.',
    format: 'numeric',
    answer: '1.5',
    acceptedVariants: ['3/2'],
    solution: '$\\cos 60^\\circ = \\tfrac{1}{2}$ oraz $\\sin 90^\\circ = 1$, więc suma wynosi $1{,}5$.',
    hints: [
      { level: 1, text: 'Czy potrafisz podać wartość każdego składnika z osobna?' },
      { level: 2, text: 'Jeden z tych kątów jest prosty — sinus przyjmuje wtedy wartość największą.' },
      { level: 3, text: '$\\cos 60^\\circ$ równa się $\\sin 30^\\circ$.' },
      { level: 5, text: 'Dodaj połowę do jedynki.' },
    ],
    commonErrors: [
      {
        id: 'trig-sin-90-zero',
        matches: ['0.5'],
        cause: 'Przyjęte $\\sin 90^\\circ = 0$ zamiast $1$.',
        rule: 'Dla kąta prostego sinus wynosi $1$, a cosinus $0$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-v-4',
    skillId: 'trig-values',
    kind: 'transfer',
    prompt:
      'Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\dfrac{3}{5}$. Oblicz $\\cos\\alpha$.',
    format: 'numeric',
    answer: '0.8',
    acceptedVariants: ['4/5'],
    solution:
      'Z jedynki trygonometrycznej $\\cos^2\\alpha = 1 - \\left(\\tfrac{3}{5}\\right)^2 = \\tfrac{16}{25}$. Kąt jest ostry, więc $\\cos\\alpha = \\tfrac{4}{5} = 0{,}8$.',
    hints: [
      { level: 1, text: 'Jaki związek łączy sinus i cosinus tego samego kąta?' },
      { level: 2, text: 'Skorzystaj z jedynki trygonometrycznej.' },
      { level: 3, text: '$\\sin^2\\alpha + \\cos^2\\alpha = 1$.' },
      { level: 5, text: 'Odejmij kwadrat sinusa od jedynki, a potem spierwiastkuj — kąt ostry daje wynik dodatni.' },
    ],
    commonErrors: [
      {
        id: 'trig-powtorzony-sinus',
        matches: ['0.6', '3/5'],
        cause: 'Przepisana wartość sinusa zamiast wyznaczenia cosinusa.',
        rule: 'Sinus i cosinus kąta ostrego są równe tylko dla $45^\\circ$.',
      },
      {
        id: 'trig-bez-pierwiastka',
        matches: ['0.64', '16/25'],
        cause: 'Podany kwadrat cosinusa — pominięte pierwiastkowanie.',
        rule: 'Jedynka trygonometryczna daje $\\cos^2\\alpha$, więc trzeba jeszcze spierwiastkować.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- trig-identities --------------------------------------------------
  {
    id: 'q-trig-i-1',
    skillId: 'trig-identities',
    kind: 'foundation',
    prompt: 'Oblicz $\\sin^2 40^\\circ + \\cos^2 40^\\circ$.',
    format: 'numeric',
    answer: '1',
    acceptedVariants: [],
    solution: 'Z jedynki trygonometrycznej wyrażenie to jest równe $1$ dla każdego kąta.',
    hints: [
      { level: 1, text: 'Czy musisz znać wartość tego konkretnego kąta?' },
      { level: 2, text: 'To wyrażenie ma tę samą wartość dla dowolnego kąta.' },
      { level: 3, text: 'Jedynka trygonometryczna: $\\sin^2\\alpha + \\cos^2\\alpha$ jest stałe.' },
      { level: 5, text: 'Nazwa tej tożsamości podpowiada wynik.' },
    ],
    commonErrors: [
      {
        id: 'trig-dodanie-katow',
        matches: ['80'],
        cause: 'Dodane miary kątów zamiast obliczenia wartości wyrażenia.',
        rule: 'Sumujemy kwadraty funkcji, a nie argumenty.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-i-2',
    skillId: 'trig-identities',
    kind: 'typical',
    prompt:
      'Kąt $\\alpha$ jest ostry i $\\cos\\alpha = \\dfrac{1}{3}$. Oblicz $\\sin^2\\alpha$.',
    format: 'numeric',
    answer: '0.8889',
    acceptedVariants: ['8/9'],
    tolerance: 0.001,
    solution:
      '$\\sin^2\\alpha = 1 - \\cos^2\\alpha = 1 - \\tfrac{1}{9} = \\tfrac{8}{9} \\approx 0{,}889$.',
    hints: [
      { level: 1, text: 'Czy potrzebujesz tu samego sinusa, czy jego kwadratu?' },
      { level: 2, text: 'Pytanie dotyczy kwadratu, więc pierwiastkowanie nie jest potrzebne.' },
      { level: 3, text: 'Z jedynki trygonometrycznej $\\sin^2\\alpha = 1 - \\cos^2\\alpha$.' },
      { level: 5, text: 'Podnieś cosinus do kwadratu i odejmij wynik od jedynki.' },
    ],
    commonErrors: [
      {
        id: 'trig-nieodjety-kwadrat',
        matches: ['0.1111', '1/9'],
        cause: 'Podany kwadrat cosinusa zamiast kwadratu sinusa — brak odjęcia od jedynki.',
        rule: '$\\sin^2\\alpha = 1 - \\cos^2\\alpha$, a nie $\\cos^2\\alpha$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-i-3',
    skillId: 'trig-identities',
    kind: 'typical',
    prompt:
      'Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\dfrac{4}{5}$. Oblicz $\\mathrm{tg}\\,\\alpha$.',
    format: 'numeric',
    answer: '1.3333',
    acceptedVariants: ['4/3'],
    tolerance: 0.001,
    solution:
      'Z jedynki trygonometrycznej $\\cos\\alpha = \\tfrac{3}{5}$, więc $\\mathrm{tg}\\,\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = \\dfrac{4}{3}$.',
    hints: [
      { level: 1, text: 'Czym jest tangens wyrażony przez sinus i cosinus?' },
      { level: 2, text: 'Najpierw wyznacz brakujący cosinus.' },
      { level: 3, text: '$\\mathrm{tg}\\,\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha}$.' },
      { level: 5, text: 'Podziel sinus przez wyznaczony cosinus.' },
    ],
    commonErrors: [
      {
        id: 'trig-odwrocony-tangens',
        matches: ['0.75', '3/4'],
        cause: 'Policzony cotangens — cosinus podzielony przez sinus.',
        rule: 'Tangens ma sinus w liczniku, cosinus w mianowniku.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-i-4',
    skillId: 'trig-identities',
    kind: 'transfer',
    prompt:
      'Oblicz wartość wyrażenia $(\\sin\\alpha + \\cos\\alpha)^2 - 2\\sin\\alpha\\cos\\alpha$ dla dowolnego kąta $\\alpha$.',
    format: 'numeric',
    answer: '1',
    acceptedVariants: [],
    solution:
      'Rozwijamy kwadrat sumy: $\\sin^2\\alpha + 2\\sin\\alpha\\cos\\alpha + \\cos^2\\alpha - 2\\sin\\alpha\\cos\\alpha = \\sin^2\\alpha + \\cos^2\\alpha = 1$.',
    hints: [
      { level: 1, text: 'Co się stanie, jeśli najpierw rozwiniesz kwadrat sumy?' },
      { level: 2, text: 'Po rozwinięciu jeden ze składników się zredukuje.' },
      { level: 3, text: '$(a+b)^2 = a^2 + 2ab + b^2$.' },
      { level: 5, text: 'To, co zostanie, jest jedynką trygonometryczną.' },
    ],
    commonErrors: [
      {
        id: 'trig-nadmierna-redukcja',
        matches: ['0'],
        cause: 'Zredukowane całe wyrażenie — pominięte kwadraty sinusa i cosinusa.',
        rule: 'Odejmowany jest wyłącznie podwojony iloczyn, kwadraty zostają.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- trig-equations ---------------------------------------------------
  {
    id: 'q-trig-e-1',
    skillId: 'trig-equations',
    kind: 'foundation',
    prompt:
      'Rozwiąż równanie $\\sin x = \\dfrac{1}{2}$ w przedziale $\\langle 0^\\circ, 90^\\circ\\rangle$. Podaj $x$ w stopniach.',
    format: 'numeric',
    answer: '30',
    acceptedVariants: [],
    solution: 'W podanym przedziale jedynym rozwiązaniem jest $x = 30^\\circ$.',
    hints: [
      { level: 1, text: 'Dla którego kąta podstawowego sinus przyjmuje tę wartość?' },
      { level: 2, text: 'Szukaj wśród kątów podstawowych.' },
      { level: 3, text: 'Sinus rośnie na tym przedziale, więc rozwiązanie jest dokładnie jedno.' },
      { level: 5, text: 'Wartość $\\tfrac{1}{2}$ odpowiada najmniejszemu z kątów podstawowych.' },
    ],
    commonErrors: [
      {
        id: 'trig-eq-sin-cos',
        matches: ['60'],
        cause: 'Podany kąt, dla którego tę wartość przyjmuje cosinus, a nie sinus.',
        rule: '$\\sin 30^\\circ = \\tfrac{1}{2}$, natomiast $\\cos 60^\\circ = \\tfrac{1}{2}$.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-e-2',
    skillId: 'trig-equations',
    kind: 'typical',
    prompt:
      'Rozwiąż równanie $2\\cos x = 1$ w przedziale $\\langle 0^\\circ, 90^\\circ\\rangle$. Podaj $x$ w stopniach.',
    format: 'numeric',
    answer: '60',
    acceptedVariants: [],
    solution: 'Dzielimy obie strony przez $2$: $\\cos x = \\tfrac{1}{2}$, skąd $x = 60^\\circ$.',
    hints: [
      { level: 1, text: 'Co zrobić z liczbą stojącą przed funkcją?' },
      { level: 2, text: 'Najpierw wyznacz samą wartość cosinusa.' },
      { level: 3, text: 'Podziel obie strony przez współczynnik przy funkcji.' },
      { level: 5, text: 'Po podzieleniu szukasz kąta o cosinusie równym połowie.' },
    ],
    commonErrors: [
      {
        id: 'trig-eq-cos-sin',
        matches: ['30'],
        cause: 'Użyta tablica sinusa zamiast cosinusa.',
        rule: '$\\cos 60^\\circ = \\tfrac{1}{2}$, a $\\cos 30^\\circ = \\tfrac{\\sqrt{3}}{2}$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-e-3',
    skillId: 'trig-equations',
    kind: 'typical',
    prompt:
      'Rozwiąż równanie $\\mathrm{tg}\\,x = 1$ w przedziale $\\langle 0^\\circ, 90^\\circ)$. Podaj $x$ w stopniach.',
    format: 'numeric',
    answer: '45',
    acceptedVariants: [],
    solution:
      'Tangens równa się jedynce, gdy sinus i cosinus są równe, czyli dla $x = 45^\\circ$.',
    hints: [
      { level: 1, text: 'Kiedy iloraz sinusa i cosinusa równa się jedynce?' },
      { level: 2, text: 'Wtedy, gdy obie funkcje mają tę samą wartość.' },
      { level: 3, text: 'Sinus i cosinus są równe dla dokładnie jednego kąta ostrego.' },
      { level: 5, text: 'To kąt leżący w połowie między zerem a kątem prostym.' },
    ],
    commonErrors: [
      {
        id: 'trig-eq-tg-wartosc',
        matches: ['1'],
        cause: 'Przepisana wartość tangensa zamiast miary kąta.',
        rule: 'Pytanie dotyczy $x$, a nie wartości funkcji.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-trig-e-4',
    skillId: 'trig-equations',
    kind: 'transfer',
    prompt:
      'Rozwiąż równanie $\\sin 2x = 1$ w przedziale $\\langle 0^\\circ, 90^\\circ\\rangle$. Podaj $x$ w stopniach.',
    format: 'numeric',
    answer: '45',
    acceptedVariants: [],
    solution:
      'Sinus przyjmuje wartość $1$ dla kąta prostego, więc $2x = 90^\\circ$, skąd $x = 45^\\circ$.',
    hints: [
      { level: 1, text: 'Argumentem funkcji nie jest $x$. Co z tego wynika?' },
      { level: 2, text: 'Najpierw wyznacz cały argument, a dopiero potem $x$.' },
      { level: 3, text: 'Sinus osiąga wartość największą dla kąta prostego.' },
      { level: 5, text: 'Z równania $2x = 90^\\circ$ wyznacz $x$.' },
    ],
    commonErrors: [
      {
        id: 'trig-eq-pominiety-mnoznik',
        matches: ['90'],
        cause: 'Podany argument $2x$ zamiast samego $x$ — pominięte dzielenie przez dwa.',
        rule: 'Z $\\sin 2x = 1$ wynika $2x = 90^\\circ$, więc $x$ jest dwa razy mniejsze.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

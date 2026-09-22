import type { Question, Skill, Topic } from '@/data/types';

/** Rachunek różniczkowy. Materiał autorski, niezweryfikowany wobec CKE. */

export const DERIV_TOPIC: Topic = {
  id: 'math-derivatives',
  subjectId: 'math',
  name: 'Rachunek różniczkowy',
};

export const DERIV_SKILLS: Skill[] = [
  {
    id: 'deriv-basic',
    topicId: 'math-derivatives',
    name: 'Pochodna wielomianu',
    ckeRequirement: 'Rachunek różniczkowy — pochodna funkcji',
    prerequisites: [],
    examValue: 0.85,
  },
  {
    id: 'deriv-tangent',
    topicId: 'math-derivatives',
    name: 'Styczna do wykresu',
    ckeRequirement: 'Rachunek różniczkowy — interpretacja geometryczna pochodnej',
    prerequisites: ['deriv-basic'],
    examValue: 0.8,
  },
  {
    id: 'deriv-extrema',
    topicId: 'math-derivatives',
    name: 'Ekstrema funkcji',
    ckeRequirement: 'Rachunek różniczkowy — badanie przebiegu funkcji',
    prerequisites: ['deriv-tangent'],
    examValue: 0.9,
  },
];

export const DERIV_QUESTIONS: Question[] = [
  // --- deriv-basic ------------------------------------------------------
  {
    id: 'q-der-b-1',
    skillId: 'deriv-basic',
    kind: 'foundation',
    prompt: 'Dana jest funkcja $f(x) = x^3$. Oblicz $f\'(2)$.',
    format: 'numeric',
    answer: '12',
    acceptedVariants: [],
    solution: '$f\'(x) = 3x^2$, więc $f\'(2) = 3\\cdot 4 = 12$.',
    hints: [
      { level: 1, text: 'Czy pytanie dotyczy wartości funkcji, czy wartości jej pochodnej?' },
      { level: 2, text: 'Najpierw wyznacz wzór pochodnej, dopiero potem podstawiaj liczbę.' },
      { level: 3, text: 'Reguła: $(x^{n})\' = n x^{\\,n-1}$.' },
      { level: 5, text: 'Pochodna to $3x^2$. Podstaw do niej podaną wartość.' },
    ],
    commonErrors: [
      {
        id: 'der-wartosc-funkcji',
        matches: ['8'],
        cause: 'Policzona wartość funkcji $f(2)$ zamiast wartości pochodnej.',
        rule: 'Zapis $f\'(2)$ oznacza pochodną obliczoną w punkcie, a nie samą funkcję.',
      },
      {
        id: 'der-bez-podstawienia',
        matches: ['3'],
        cause: 'Podany sam współczynnik pochodnej — pominięte podstawienie wartości.',
        rule: 'Po wyznaczeniu $f\'(x)$ trzeba jeszcze podstawić podany punkt.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-b-2',
    skillId: 'deriv-basic',
    kind: 'typical',
    prompt: 'Dana jest funkcja $f(x) = 2x^3 - 3x^2 + 5$. Oblicz $f\'(1)$.',
    format: 'numeric',
    answer: '0',
    acceptedVariants: [],
    solution: '$f\'(x) = 6x^2 - 6x$, więc $f\'(1) = 6 - 6 = 0$.',
    hints: [
      { level: 1, text: 'Co dzieje się z wyrazem wolnym przy różniczkowaniu?' },
      { level: 2, text: 'Pochodna stałej jest zerem, więc wyraz wolny znika.' },
      { level: 3, text: 'Różniczkuj każdy składnik osobno według reguły $(x^{n})\' = n x^{\\,n-1}$.' },
      { level: 5, text: 'Pochodna to $6x^2 - 6x$. Podstaw podaną wartość.' },
    ],
    commonErrors: [
      {
        id: 'der-wartosc-zamiast-pochodnej',
        matches: ['4'],
        cause: 'Policzona wartość $f(1)$ zamiast $f\'(1)$.',
        rule: 'Kreska przy $f$ oznacza pochodną.',
      },
      {
        id: 'der-stala-nieusunieta',
        matches: ['5'],
        cause: 'Wyraz wolny przepisany do pochodnej.',
        rule: 'Pochodna liczby stałej wynosi zero.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-b-3',
    skillId: 'deriv-basic',
    kind: 'typical',
    prompt: 'Dana jest funkcja $f(x) = x^2 - 4x + 7$. Oblicz $f\'(3)$.',
    format: 'numeric',
    answer: '2',
    acceptedVariants: [],
    solution: '$f\'(x) = 2x - 4$, więc $f\'(3) = 6 - 4 = 2$.',
    hints: [
      { level: 1, text: 'Jak różniczkuje się składnik liniowy $-4x$?' },
      { level: 2, text: 'Pochodna składnika liniowego to jego współczynnik.' },
      { level: 3, text: 'Reguły: $(x^2)\' = 2x$ oraz $(cx)\' = c$.' },
      { level: 5, text: 'Pochodna to $2x - 4$. Podstaw podaną wartość.' },
    ],
    commonErrors: [
      {
        id: 'der-wartosc-w-punkcie',
        matches: ['4'],
        cause: 'Policzona wartość $f(3)$ zamiast wartości pochodnej.',
        rule: 'Pytanie dotyczy $f\'(3)$, czyli pochodnej w punkcie.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-b-4',
    skillId: 'deriv-basic',
    kind: 'transfer',
    prompt:
      'Dla jakiego argumentu pochodna funkcji $f(x) = x^2 - 6x + 1$ przyjmuje wartość zero?',
    format: 'numeric',
    answer: '3',
    acceptedVariants: ['x=3'],
    solution: '$f\'(x) = 2x - 6$. Z równania $2x - 6 = 0$ otrzymujemy $x = 3$.',
    hints: [
      { level: 1, text: 'Nie szukasz wartości pochodnej, tylko argumentu. Co to zmienia?' },
      { level: 2, text: 'Wyznacz pochodną, przyrównaj ją do zera i rozwiąż równanie.' },
      { level: 3, text: 'Pochodna tej funkcji jest funkcją liniową.' },
      { level: 5, text: 'Rozwiąż równanie $2x - 6 = 0$.' },
    ],
    commonErrors: [
      {
        id: 'der-wspolczynnik-zamiast-pierwiastka',
        matches: ['6'],
        cause: 'Przepisany współczynnik z pochodnej zamiast rozwiązania równania.',
        rule: 'Z $2x - 6 = 0$ wynika $x = 3$, a nie $x = 6$.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- deriv-tangent ----------------------------------------------------
  {
    id: 'q-der-t-1',
    skillId: 'deriv-tangent',
    kind: 'foundation',
    prompt:
      'Podaj współczynnik kierunkowy stycznej do wykresu funkcji $f(x) = x^2$ w punkcie o odciętej $x = 3$.',
    format: 'numeric',
    answer: '6',
    acceptedVariants: [],
    solution:
      'Współczynnik kierunkowy stycznej równa się pochodnej w tym punkcie: $f\'(x) = 2x$, więc $f\'(3) = 6$.',
    hints: [
      { level: 1, text: 'Co geometrycznie oznacza wartość pochodnej w punkcie?' },
      { level: 2, text: 'Pochodna w punkcie to nachylenie stycznej w tym punkcie.' },
      { level: 3, text: 'Szukany współczynnik to $f\'(x_0)$.' },
      { level: 5, text: 'Pochodna to $2x$. Podstaw podaną odciętą.' },
    ],
    commonErrors: [
      {
        id: 'der-t-wartosc-funkcji',
        matches: ['9'],
        cause: 'Policzona wartość funkcji w punkcie zamiast wartości pochodnej.',
        rule: 'Nachylenie stycznej opisuje $f\'(x_0)$, a nie $f(x_0)$.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-t-2',
    skillId: 'deriv-tangent',
    kind: 'typical',
    prompt:
      'Podaj współczynnik kierunkowy stycznej do wykresu funkcji $f(x) = x^3 - 2x$ w punkcie o odciętej $x = 1$.',
    format: 'numeric',
    answer: '1',
    acceptedVariants: [],
    solution: '$f\'(x) = 3x^2 - 2$, więc $f\'(1) = 3 - 2 = 1$.',
    hints: [
      { level: 1, text: 'Co liczysz najpierw: pochodną czy wartość w punkcie?' },
      { level: 2, text: 'Pochodna składnika $-2x$ jest stała.' },
      { level: 3, text: 'Szukany współczynnik to $f\'(x_0)$, a nie $f(x_0)$.' },
      { level: 5, text: 'Pochodna to $3x^2 - 2$. Podstaw podaną odciętą.' },
    ],
    commonErrors: [
      {
        id: 'der-t2-wartosc-funkcji',
        matches: ['-1'],
        cause: 'Policzona wartość $f(1)$ zamiast wartości pochodnej.',
        rule: 'Styczna ma nachylenie równe $f\'(x_0)$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-t-3',
    skillId: 'deriv-tangent',
    kind: 'typical',
    prompt:
      'W którym punkcie styczna do wykresu funkcji $f(x) = x^2 - 4x$ jest pozioma? Podaj odciętą tego punktu.',
    format: 'numeric',
    answer: '2',
    acceptedVariants: ['x=2'],
    solution:
      'Styczna pozioma ma współczynnik kierunkowy równy zero, więc $f\'(x) = 2x - 4 = 0$, skąd $x = 2$.',
    hints: [
      { level: 1, text: 'Jaki współczynnik kierunkowy ma prosta pozioma?' },
      { level: 2, text: 'Prosta pozioma ma nachylenie równe zero.' },
      { level: 3, text: 'Przyrównaj pochodną do zera i rozwiąż równanie.' },
      { level: 5, text: 'Rozwiąż równanie $2x - 4 = 0$.' },
    ],
    commonErrors: [
      {
        id: 'der-t3-wspolczynnik',
        matches: ['4'],
        cause: 'Przepisany współczynnik z funkcji zamiast rozwiązania równania $f\'(x) = 0$.',
        rule: 'Z $2x - 4 = 0$ wynika $x = 2$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-t-4',
    skillId: 'deriv-tangent',
    kind: 'transfer',
    prompt:
      'Styczna do wykresu funkcji $f(x) = x^2$ w punkcie o odciętej $x = 2$ przecina oś $OY$. Podaj rzędną punktu przecięcia.',
    format: 'numeric',
    answer: '-4',
    acceptedVariants: [],
    solution:
      'Punkt styczności to $(2, 4)$, a nachylenie $f\'(2) = 4$. Styczna: $y = 4 + 4(x - 2) = 4x - 4$. Dla $x = 0$ otrzymujemy $y = -4$.',
    hints: [
      { level: 1, text: 'Ile informacji potrzebujesz, żeby zapisać równanie stycznej?' },
      { level: 2, text: 'Potrzebujesz punktu styczności i nachylenia — oba wyliczysz z funkcji i jej pochodnej.' },
      { level: 3, text: 'Równanie stycznej: $y = f(x_0) + f\'(x_0)(x - x_0)$.' },
      { level: 5, text: 'Po uproszczeniu styczna ma postać $y = 4x - 4$. Podstaw $x = 0$.' },
    ],
    commonErrors: [
      {
        id: 'der-t4-punkt-stycznosci',
        matches: ['4'],
        cause: 'Podana rzędna punktu styczności zamiast punktu przecięcia z osią $OY$.',
        rule: 'Przecięcie z osią $OY$ otrzymujemy, podstawiając $x = 0$ do równania stycznej.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- deriv-extrema ----------------------------------------------------
  {
    id: 'q-der-e-1',
    skillId: 'deriv-extrema',
    kind: 'foundation',
    prompt:
      'Dla jakiego argumentu funkcja $f(x) = x^2 - 8x + 3$ przyjmuje wartość najmniejszą?',
    format: 'numeric',
    answer: '4',
    acceptedVariants: ['x=4'],
    solution: '$f\'(x) = 2x - 8$. Z $2x - 8 = 0$ otrzymujemy $x = 4$; ramiona paraboli są skierowane w górę, więc to minimum.',
    hints: [
      { level: 1, text: 'Gdzie funkcja może osiągać wartość najmniejszą?' },
      { level: 2, text: 'W punkcie, w którym pochodna zmienia znak, czyli zeruje się.' },
      { level: 3, text: 'Przyrównaj pochodną do zera.' },
      { level: 5, text: 'Rozwiąż równanie $2x - 8 = 0$.' },
    ],
    commonErrors: [
      {
        id: 'der-e1-wspolczynnik',
        matches: ['8'],
        cause: 'Przepisany współczynnik zamiast rozwiązania równania.',
        rule: 'Z $2x - 8 = 0$ wynika $x = 4$.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-e-2',
    skillId: 'deriv-extrema',
    kind: 'typical',
    prompt:
      'Dana jest funkcja $f(x) = x^3 - 3x$. Podaj większy z argumentów, dla których pochodna się zeruje.',
    format: 'numeric',
    answer: '1',
    acceptedVariants: ['x=1'],
    solution:
      '$f\'(x) = 3x^2 - 3$. Z $3x^2 - 3 = 0$ wynika $x^2 = 1$, czyli $x = -1$ lub $x = 1$. Większy to $1$.',
    hints: [
      { level: 1, text: 'Ile rozwiązań ma równanie $f\'(x) = 0$ dla funkcji trzeciego stopnia?' },
      { level: 2, text: 'Pochodna jest funkcją kwadratową, więc rozwiązań może być dwa.' },
      { level: 3, text: 'Z równania $x^2 = c$ otrzymujesz dwa przeciwne rozwiązania.' },
      { level: 5, text: 'Rozwiązania są liczbami przeciwnymi. Wybierz dodatnie.' },
    ],
    commonErrors: [
      {
        id: 'der-e2-mniejszy',
        matches: ['-1'],
        cause: 'Podany mniejszy z dwóch argumentów.',
        rule: 'Pytanie dotyczy większego z rozwiązań.',
      },
      {
        id: 'der-e2-wspolczynnik',
        matches: ['3'],
        cause: 'Przepisany współczynnik z pochodnej zamiast rozwiązania równania.',
        rule: 'Z $3x^2 - 3 = 0$ wynika $x^2 = 1$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-e-3',
    skillId: 'deriv-extrema',
    kind: 'typical',
    prompt:
      'Dana jest funkcja $f(x) = x^2 - 6x + 5$. Podaj jej wartość najmniejszą.',
    format: 'numeric',
    answer: '-4',
    acceptedVariants: [],
    solution:
      '$f\'(x) = 2x - 6$ zeruje się dla $x = 3$. Wartość najmniejsza to $f(3) = 9 - 18 + 5 = -4$.',
    hints: [
      { level: 1, text: 'Pytanie dotyczy wartości czy argumentu?' },
      { level: 2, text: 'Najpierw znajdź argument, w którym pochodna się zeruje, a potem policz wartość funkcji.' },
      { level: 3, text: 'Wartość najmniejsza to $f(x_0)$, gdzie $f\'(x_0) = 0$.' },
      { level: 5, text: 'Argument wynosi $3$. Podstaw go do wzoru funkcji.' },
    ],
    commonErrors: [
      {
        id: 'der-e3-argument',
        matches: ['3'],
        cause: 'Podany argument zamiast wartości funkcji w tym argumencie.',
        rule: 'Wartość najmniejsza to $f(x_0)$, a nie samo $x_0$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-der-e-4',
    skillId: 'deriv-extrema',
    kind: 'transfer',
    prompt:
      'Suma dwóch liczb dodatnich wynosi $10$. Jaka jest największa możliwa wartość ich iloczynu?',
    format: 'numeric',
    answer: '25',
    acceptedVariants: [],
    solution:
      'Oznaczmy liczby $x$ i $10-x$. Iloczyn $P(x) = x(10-x) = 10x - x^2$. Pochodna $P\'(x) = 10 - 2x$ zeruje się dla $x = 5$, a wtedy $P(5) = 5\\cdot 5 = 25$.',
    hints: [
      { level: 1, text: 'Jak zapisać obie liczby, używając tylko jednej niewiadomej?' },
      { level: 2, text: 'Jeśli jedna wynosi $x$, druga jest dopełnieniem do sumy.' },
      { level: 3, text: 'Zapisz iloczyn jako funkcję jednej zmiennej i zbadaj ją pochodną.' },
      { level: 5, text: 'Pochodna $10 - 2x$ zeruje się w połowie przedziału. Policz tam iloczyn.' },
    ],
    commonErrors: [
      {
        id: 'der-e4-argument',
        matches: ['5'],
        cause: 'Podana jedna z liczb zamiast ich iloczynu.',
        rule: 'Pytanie dotyczy wartości iloczynu, a nie argumentu, dla którego jest on największy.',
      },
      {
        id: 'der-e4-suma',
        matches: ['10'],
        cause: 'Przepisana suma liczb zamiast policzenia iloczynu.',
        rule: 'Suma jest dana w treści; szukana jest wartość iloczynu.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

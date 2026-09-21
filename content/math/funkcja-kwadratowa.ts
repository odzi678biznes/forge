import type { Question, Skill, Subject, Topic } from '@/data/types';

/**
 * Tresc: funkcja kwadratowa (matura rozszerzona).
 *
 * Uwaga o zakresie (Blueprint sek. 8): to jest wycinek autorski sluzacy do
 * domkniecia pionowego wycinka z sek. 18, a NIE odwzorowanie pelnej podstawy
 * programowej. Pola `ckeRequirement` wskazuja dzial, ale kazde pytanie ma
 * `verified: false` dopoki nie przejdzie weryfikacji merytorycznej wzgledem
 * informatora CKE. Silnik nie powinien traktowac ich jak materialu
 * egzaminacyjnego, dopoki ta flaga nie zostanie podniesiona.
 *
 * Matura rozszerzona z matematyki ma wylacznie zadania otwarte - dlatego
 * zadne z ponizszych nie jest zadaniem wyboru. Odpowiedzia jest konkretna
 * wartosc, ktora da sie ocenic automatycznie bez udawania, ze system rozumie
 * tok rozumowania.
 */

export const MATH: Subject = { id: 'math', name: 'Matematyka (rozszerzona)' };

export const QUADRATIC_TOPIC: Topic = {
  id: 'math-quadratic',
  subjectId: 'math',
  name: 'Funkcja kwadratowa',
};

export const QUADRATIC_SKILLS: Skill[] = [
  {
    id: 'quad-discriminant',
    topicId: 'math-quadratic',
    name: 'Wyroznik i liczba rozwiazan',
    ckeRequirement: 'Funkcja kwadratowa - rownania i liczba pierwiastkow',
    prerequisites: [],
    examValue: 0.8,
  },
  {
    id: 'quad-vertex',
    topicId: 'math-quadratic',
    name: 'Wierzcholek i wartosc ekstremalna',
    ckeRequirement: 'Funkcja kwadratowa - postac kanoniczna',
    prerequisites: ['quad-discriminant'],
    examValue: 0.85,
  },
  {
    id: 'quad-vieta',
    topicId: 'math-quadratic',
    name: 'Wzory Viete’a',
    ckeRequirement: 'Funkcja kwadratowa - zwiazki miedzy pierwiastkami',
    prerequisites: ['quad-discriminant'],
    examValue: 0.7,
  },
];

export const QUADRATIC_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // quad-discriminant
  // -------------------------------------------------------------------------
  {
    id: 'q-disc-1',
    skillId: 'quad-discriminant',
    kind: 'foundation',
    prompt: 'Oblicz wyróżnik równania $x^2 - 6x + 5 = 0$.',
    format: 'numeric',
    answer: '16',
    acceptedVariants: [],
    solution:
      '$a=1$, $b=-6$, $c=5$, więc $\\Delta = b^2 - 4ac = 36 - 4\\cdot 1\\cdot 5 = 36 - 20 = 16$.',
    hints: [
      { level: 1, text: 'Która liczba jest tu współczynnikiem $a$, która $b$, a która $c$?' },
      { level: 2, text: 'Podstaw do wzoru $\\Delta = b^2 - 4ac$. Zwróć uwagę, że $b = -6$.' },
      { level: 3, text: 'Kwadrat liczby ujemnej jest dodatni: $(-6)^2 = 36$.' },
      { level: 5, text: '$\\Delta = 36 - 4\\cdot 1\\cdot 5$. Zostało wykonać odejmowanie.' },
    ],
    commonErrors: [
      {
        id: 'disc-brak-czworki',
        matches: ['31'],
        cause: 'Pominięta czwórka we wzorze - policzone $b^2 - ac$ zamiast $b^2 - 4ac$.',
        rule: 'Wyróżnik to $\\Delta = b^2 - 4ac$.',
      },
      {
        id: 'disc-znak-b',
        matches: ['-16', '-36'],
        cause: 'Kwadrat ujemnego $b$ potraktowany jako liczba ujemna.',
        rule: 'Kwadrat dowolnej liczby rzeczywistej jest nieujemny.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-disc-2',
    skillId: 'quad-discriminant',
    kind: 'typical',
    prompt: 'Oblicz wyróżnik równania $2x^2 - 3x - 5 = 0$.',
    format: 'numeric',
    answer: '49',
    acceptedVariants: [],
    solution:
      '$a=2$, $b=-3$, $c=-5$, więc $\\Delta = 9 - 4\\cdot 2\\cdot(-5) = 9 + 40 = 49$.',
    hints: [
      { level: 1, text: 'Jaki znak ma współczynnik $c$ w tym równaniu?' },
      { level: 2, text: '$c = -5$, a nie $5$. Odejmowanie liczby ujemnej daje dodawanie.' },
      { level: 3, text: '$\\Delta = b^2 - 4ac$, przy czym $-4\\cdot 2\\cdot(-5) = +40$.' },
      { level: 5, text: '$\\Delta = 9 + 40$. Zostało dodać.' },
    ],
    commonErrors: [
      {
        id: 'disc-znak-c',
        matches: ['-31'],
        cause: 'Znak ujemnego $c$ zgubiony - policzone $9 - 40$ zamiast $9 + 40$.',
        rule: 'We wzorze $b^2 - 4ac$ ujemne $c$ zmienia odejmowanie w dodawanie.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-disc-3',
    skillId: 'quad-discriminant',
    kind: 'typical',
    prompt:
      'Dla jakiej wartości $m$ równanie $x^2 + 4x + m = 0$ ma dokładnie jedno rozwiązanie?',
    format: 'numeric',
    answer: '4',
    acceptedVariants: ['m=4'],
    solution:
      'Jedno rozwiązanie oznacza $\\Delta = 0$, czyli $16 - 4m = 0$, skąd $m = 4$.',
    hints: [
      { level: 1, text: 'Co musi zachodzić z wyróżnikiem, żeby rozwiązanie było dokładnie jedno?' },
      { level: 2, text: 'Warunek to $\\Delta = 0$. Zapisz $\\Delta$ z parametrem $m$.' },
      { level: 3, text: '$\\Delta = 4^2 - 4\\cdot 1\\cdot m = 16 - 4m$.' },
      { level: 5, text: 'Rozwiąż równanie $16 - 4m = 0$.' },
    ],
    commonErrors: [
      {
        id: 'disc-znak-m',
        matches: ['-4'],
        cause: 'Błąd znaku przy przenoszeniu wyrazu na drugą stronę równania.',
        rule: 'Z $16 - 4m = 0$ wynika $4m = 16$, więc $m = 4$.',
      },
      {
        id: 'disc-delta-dodatnia',
        matches: ['0'],
        cause: 'Przyjęty warunek $\\Delta > 0$ albo podstawione $m = 0$ zamiast rozwiązania równania.',
        rule: '$\\Delta > 0$ to dwa rozwiązania, $\\Delta = 0$ to dokładnie jedno.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-disc-4',
    skillId: 'quad-discriminant',
    kind: 'transfer',
    prompt:
      'Równanie $(m-1)x^2 + 2x + 1 = 0$ ma dokładnie jedno rozwiązanie. Podaj najmniejszą taką wartość $m$.',
    format: 'numeric',
    answer: '1',
    acceptedVariants: ['m=1'],
    solution:
      'Trzeba rozważyć dwa przypadki. Gdy $m - 1 = 0$, czyli $m = 1$, równanie staje się liniowe: $2x + 1 = 0$, ma dokładnie jedno rozwiązanie $x = -\\tfrac{1}{2}$. Gdy $m \\neq 1$, równanie jest kwadratowe i potrzeba $\\Delta = 0$: $4 - 4(m-1) = 0$, skąd $m = 2$. Wartości to $1$ i $2$, najmniejsza to $1$.',
    hints: [
      { level: 1, text: 'Czy na pewno to równanie zawsze jest kwadratowe?' },
      {
        level: 2,
        text: 'Współczynnik przy $x^2$ zawiera parametr. Sprawdź osobno, co się dzieje, gdy jest on zerem.',
      },
      {
        level: 3,
        text: 'Równanie jest kwadratowe tylko przy $a \\neq 0$. Dla $a = 0$ jest liniowe i też może mieć jedno rozwiązanie.',
      },
      {
        level: 5,
        text: 'Przypadek liniowy: $m = 1$. Przypadek kwadratowy: $\\Delta = 4 - 4(m-1) = 0$, czyli $m = 2$. Wybierz mniejszą.',
      },
    ],
    commonErrors: [
      {
        id: 'disc-brak-przypadku-liniowego',
        matches: ['2'],
        cause:
          'Pominięty przypadek $m = 1$, w którym równanie przestaje być kwadratowe i staje się liniowe.',
        rule: 'Gdy współczynnik przy $x^2$ zawiera parametr, zawsze rozważ osobno jego zerowanie.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // -------------------------------------------------------------------------
  // quad-vertex
  // -------------------------------------------------------------------------
  {
    id: 'q-vertex-1',
    skillId: 'quad-vertex',
    kind: 'foundation',
    prompt:
      'Podaj pierwszą współrzędną wierzchołka paraboli $y = x^2 - 8x + 3$.',
    format: 'numeric',
    answer: '4',
    acceptedVariants: ['p=4'],
    solution: '$p = -\\dfrac{b}{2a} = -\\dfrac{-8}{2} = 4$.',
    hints: [
      { level: 1, text: 'Jaki wzór opisuje pierwszą współrzędną wierzchołka?' },
      { level: 2, text: '$p = -\\dfrac{b}{2a}$, przy czym tutaj $b = -8$.' },
      { level: 3, text: 'Minus przed ułamkiem i ujemne $b$ znoszą się nawzajem.' },
      { level: 5, text: '$p = -\\dfrac{-8}{2\\cdot 1}$. Zostało uwzględnić znaki.' },
    ],
    commonErrors: [
      {
        id: 'vertex-znak-p',
        matches: ['-4'],
        cause: 'Pominięty minus we wzorze $p = -\\frac{b}{2a}$ przy ujemnym $b$.',
        rule: 'Przy $b < 0$ wartość $p$ wychodzi dodatnia.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-vertex-2',
    skillId: 'quad-vertex',
    kind: 'typical',
    prompt:
      'Podaj drugą współrzędną wierzchołka paraboli $y = x^2 - 6x + 5$.',
    format: 'numeric',
    answer: '-4',
    acceptedVariants: ['q=-4'],
    solution:
      '$p = \\dfrac{6}{2} = 3$, a stąd $q = f(3) = 9 - 18 + 5 = -4$. Równoważnie $q = -\\dfrac{\\Delta}{4a} = -\\dfrac{16}{4} = -4$.',
    hints: [
      { level: 1, text: 'Czym w ogóle jest druga współrzędna wierzchołka?' },
      { level: 2, text: 'To wartość funkcji w punkcie $p$. Policz najpierw $p$.' },
      { level: 3, text: '$q = f(p)$ albo równoważnie $q = -\\dfrac{\\Delta}{4a}$.' },
      { level: 5, text: '$p = 3$, więc policz $f(3) = 3^2 - 6\\cdot 3 + 5$.' },
    ],
    commonErrors: [
      {
        id: 'vertex-p-zamiast-q',
        matches: ['3'],
        cause: 'Podana pierwsza współrzędna wierzchołka zamiast drugiej.',
        rule: 'Wierzchołek to para $(p, q)$; pytanie dotyczyło $q$.',
      },
      {
        id: 'vertex-znak-q',
        matches: ['4'],
        cause: 'Zgubiony znak - $q = -\\frac{\\Delta}{4a}$, a $\\Delta = 16$ jest dodatnie.',
        rule: 'Dla paraboli o ramionach w górę i dodatniej delcie $q$ jest ujemne.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-vertex-3',
    skillId: 'quad-vertex',
    kind: 'typical',
    prompt:
      'Funkcja $f(x) = -2x^2 + 8x - 3$. Podaj jej największą wartość.',
    format: 'numeric',
    answer: '5',
    acceptedVariants: [],
    solution:
      'Ramiona skierowane w dół ($a = -2 < 0$), więc maksimum jest w wierzchołku. $p = -\\dfrac{8}{2\\cdot(-2)} = 2$, a $f(2) = -8 + 16 - 3 = 5$.',
    hints: [
      { level: 1, text: 'W którą stronę skierowane są ramiona tej paraboli?' },
      { level: 2, text: '$a < 0$, więc funkcja ma wartość największą, i jest nią $q$.' },
      { level: 3, text: 'Policz $p = -\\dfrac{b}{2a}$, a potem $f(p)$.' },
      { level: 5, text: '$p = 2$, zostało policzyć $f(2) = -2\\cdot 4 + 8\\cdot 2 - 3$.' },
    ],
    commonErrors: [
      {
        id: 'vertex-argument-zamiast-wartosci',
        matches: ['2'],
        cause: 'Podany argument, dla którego funkcja przyjmuje maksimum, zamiast samej wartości.',
        rule: 'Wartość największa to $q = f(p)$, nie $p$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-vertex-4',
    skillId: 'quad-vertex',
    kind: 'transfer',
    prompt:
      'Funkcja kwadratowa ma miejsca zerowe $-3$ oraz $7$. Podaj pierwszą współrzędną jej wierzchołka.',
    format: 'numeric',
    answer: '2',
    acceptedVariants: ['p=2'],
    solution:
      'Parabola jest symetryczna względem prostej przechodzącej przez wierzchołek, więc $p$ leży dokładnie w połowie między miejscami zerowymi: $p = \\dfrac{-3 + 7}{2} = 2$.',
    hints: [
      { level: 1, text: 'Nie znasz wzoru funkcji. Co jeszcze wiesz o położeniu wierzchołka?' },
      { level: 2, text: 'Wykres funkcji kwadratowej jest symetryczny względem osi przechodzącej przez wierzchołek.' },
      { level: 3, text: 'Oś symetrii przechodzi w połowie odległości między miejscami zerowymi.' },
      { level: 5, text: 'Policz średnią arytmetyczną liczb $-3$ i $7$.' },
    ],
    commonErrors: [
      {
        id: 'vertex-suma-zamiast-sredniej',
        matches: ['4'],
        cause: 'Policzona suma miejsc zerowych zamiast ich średniej.',
        rule: '$p$ to środek odcinka między miejscami zerowymi, czyli $\\frac{x_1 + x_2}{2}$.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // -------------------------------------------------------------------------
  // quad-vieta
  // -------------------------------------------------------------------------
  {
    id: 'q-vieta-1',
    skillId: 'quad-vieta',
    kind: 'foundation',
    prompt:
      'Równanie $x^2 - 7x + 12 = 0$ ma dwa pierwiastki. Podaj ich sumę.',
    format: 'numeric',
    answer: '7',
    acceptedVariants: [],
    solution:
      'Ze wzorów Viete’a $x_1 + x_2 = -\\dfrac{b}{a} = -\\dfrac{-7}{1} = 7$. (Sprawdzenie: pierwiastki to $3$ i $4$.)',
    hints: [
      { level: 1, text: 'Czy musisz wyznaczać oba pierwiastki, żeby podać ich sumę?' },
      { level: 2, text: 'Wzory Viete’a wiążą sumę pierwiastków ze współczynnikami.' },
      { level: 3, text: '$x_1 + x_2 = -\\dfrac{b}{a}$, przy czym $b = -7$.' },
      { level: 5, text: '$-\\dfrac{-7}{1}$. Zostało uwzględnić znaki.' },
    ],
    commonErrors: [
      {
        id: 'vieta-znak-sumy',
        matches: ['-7'],
        cause: 'Pominięty minus we wzorze $x_1 + x_2 = -\\frac{b}{a}$.',
        rule: 'Suma pierwiastków to $-\\frac{b}{a}$, a nie $\\frac{b}{a}$.',
      },
      {
        id: 'vieta-iloczyn-zamiast-sumy',
        matches: ['12'],
        cause: 'Podany iloczyn pierwiastków zamiast sumy.',
        rule: 'Suma to $-\\frac{b}{a}$, iloczyn to $\\frac{c}{a}$.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-vieta-2',
    skillId: 'quad-vieta',
    kind: 'typical',
    prompt:
      'Równanie $x^2 + 3x - 10 = 0$ ma dwa pierwiastki. Podaj ich iloczyn.',
    format: 'numeric',
    answer: '-10',
    acceptedVariants: [],
    solution:
      'Ze wzorów Viete’a $x_1 \\cdot x_2 = \\dfrac{c}{a} = \\dfrac{-10}{1} = -10$. (Sprawdzenie: pierwiastki to $2$ i $-5$.)',
    hints: [
      { level: 1, text: 'Który ze wzorów Viete’a dotyczy iloczynu?' },
      { level: 2, text: '$x_1 \\cdot x_2 = \\dfrac{c}{a}$ - bez minusa.' },
      { level: 3, text: 'Odczytaj z równania współczynniki $a$ i $c$ - razem z ich znakami.' },
      { level: 5, text: 'Podziel $-10$ przez $1$.' },
    ],
    commonErrors: [
      {
        id: 'vieta-znak-iloczynu',
        matches: ['10'],
        cause: 'Dopisany minus do wzoru na iloczyn - on występuje tylko we wzorze na sumę.',
        rule: 'Iloczyn to $\\frac{c}{a}$, bez zmiany znaku.',
      },
      {
        id: 'vieta-suma-zamiast-iloczynu',
        matches: ['-3'],
        cause: 'Podana suma pierwiastków zamiast iloczynu.',
        rule: 'Suma to $-\\frac{b}{a}$, iloczyn to $\\frac{c}{a}$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-vieta-3',
    skillId: 'quad-vieta',
    kind: 'transfer',
    prompt:
      'Liczby $x_1$ i $x_2$ są pierwiastkami równania $x^2 - 5x + 3 = 0$. Oblicz $x_1^2 + x_2^2$.',
    format: 'numeric',
    answer: '19',
    acceptedVariants: [],
    solution:
      'Ze wzorów Viete’a $x_1 + x_2 = 5$ oraz $x_1 x_2 = 3$. Korzystamy z tożsamości $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2 = 25 - 6 = 19$.',
    hints: [
      { level: 1, text: 'Pierwiastki są niewymierne. Czy da się obejść bez ich liczenia?' },
      {
        level: 2,
        text: 'Wyraż $x_1^2 + x_2^2$ przez sumę i iloczyn pierwiastków.',
      },
      { level: 3, text: 'Tożsamość: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$.' },
      { level: 5, text: 'Suma wynosi $5$, iloczyn $3$. Podstaw: $5^2 - 2\\cdot 3$.' },
    ],
    commonErrors: [
      {
        id: 'vieta-kwadrat-sumy',
        matches: ['25'],
        cause: 'Przyjęte, że $x_1^2 + x_2^2 = (x_1 + x_2)^2$ - pominięty składnik $-2x_1x_2$.',
        rule: '$(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$, więc trzeba odjąć $2x_1x_2$.',
      },
      {
        id: 'vieta-znak-korekty',
        matches: ['31'],
        cause: 'Składnik $2x_1x_2$ dodany zamiast odjęty.',
        rule: 'Przekształcenie daje $-2x_1x_2$, nie $+2x_1x_2$.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

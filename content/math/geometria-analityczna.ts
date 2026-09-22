import type { Question, Skill, Topic } from '@/data/types';

/** Geometria analityczna. Materiał autorski, niezweryfikowany wobec CKE. */

export const GEO_TOPIC: Topic = {
  id: 'math-analytic-geometry',
  subjectId: 'math',
  name: 'Geometria analityczna',
};

export const GEO_SKILLS: Skill[] = [
  {
    id: 'geo-distance',
    topicId: 'math-analytic-geometry',
    name: 'Odległość i środek odcinka',
    ckeRequirement: 'Geometria analityczna — punkty i odcinki',
    prerequisites: [],
    examValue: 0.65,
  },
  {
    id: 'geo-line',
    topicId: 'math-analytic-geometry',
    name: 'Prosta w układzie współrzędnych',
    ckeRequirement: 'Geometria analityczna — równanie prostej',
    prerequisites: ['geo-distance'],
    examValue: 0.8,
  },
  {
    id: 'geo-circle',
    topicId: 'math-analytic-geometry',
    name: 'Równanie okręgu',
    ckeRequirement: 'Geometria analityczna — okrąg',
    prerequisites: ['geo-distance'],
    examValue: 0.7,
  },
];

export const GEO_QUESTIONS: Question[] = [
  // --- geo-distance -----------------------------------------------------
  {
    id: 'q-geo-d-1',
    skillId: 'geo-distance',
    kind: 'foundation',
    prompt: 'Oblicz odległość punktów $A = (0, 0)$ oraz $B = (3, 4)$.',
    format: 'numeric',
    answer: '5',
    acceptedVariants: [],
    solution: '$|AB| = \\sqrt{(3-0)^2 + (4-0)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
    hints: [
      { level: 1, text: 'Jakim twierdzeniem policzysz długość odcinka z jego współrzędnych?' },
      { level: 2, text: 'Różnice współrzędnych są przyprostokątnymi trójkąta prostokątnego.' },
      { level: 3, text: '$|AB| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.' },
      { level: 5, text: 'Dodaj kwadraty różnic i spierwiastkuj wynik.' },
    ],
    commonErrors: [
      {
        id: 'geo-suma-bez-pierwiastka',
        matches: ['7'],
        cause: 'Dodane same różnice współrzędnych zamiast zastosowania twierdzenia Pitagorasa.',
        rule: 'Odległość to pierwiastek z sumy kwadratów różnic, nie suma różnic.',
      },
      {
        id: 'geo-bez-pierwiastka',
        matches: ['25'],
        cause: 'Podany kwadrat odległości — pominięte pierwiastkowanie.',
        rule: 'Wzór kończy się pierwiastkiem.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-d-2',
    skillId: 'geo-distance',
    kind: 'typical',
    prompt:
      'Podaj pierwszą współrzędną środka odcinka o końcach $A = (-3, 2)$ oraz $B = (7, 6)$.',
    format: 'numeric',
    answer: '2',
    acceptedVariants: [],
    solution: 'Środek ma współrzędne będące średnimi: $x_S = \\dfrac{-3 + 7}{2} = 2$.',
    hints: [
      { level: 1, text: 'Czym jest środek odcinka względem jego końców?' },
      { level: 2, text: 'Każda współrzędna środka to średnia odpowiednich współrzędnych końców.' },
      { level: 3, text: '$x_S = \\dfrac{x_A + x_B}{2}$.' },
      { level: 5, text: 'Dodaj pierwsze współrzędne końców i podziel przez dwa.' },
    ],
    commonErrors: [
      {
        id: 'geo-roznica-zamiast-sredniej',
        matches: ['5'],
        cause: 'Policzona połowa różnicy współrzędnych zamiast ich średniej.',
        rule: 'Środek odcinka to średnia arytmetyczna, czyli suma podzielona przez dwa.',
      },
      {
        id: 'geo-suma-bez-dzielenia',
        matches: ['4'],
        cause: 'Podana suma współrzędnych — pominięte dzielenie przez dwa.',
        rule: 'Średnia wymaga podzielenia sumy przez liczbę składników.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-d-3',
    skillId: 'geo-distance',
    kind: 'typical',
    prompt: 'Oblicz odległość punktów $A = (2, -1)$ oraz $B = (6, 2)$.',
    format: 'numeric',
    answer: '5',
    acceptedVariants: [],
    solution:
      '$|AB| = \\sqrt{(6-2)^2 + (2-(-1))^2} = \\sqrt{16 + 9} = 5$.',
    hints: [
      { level: 1, text: 'Co się dzieje ze znakiem, gdy odejmujesz liczbę ujemną?' },
      { level: 2, text: 'Odejmowanie liczby ujemnej daje dodawanie.' },
      { level: 3, text: '$y_B - y_A = 2 - (-1)$.' },
      { level: 5, text: 'Różnice wynoszą $4$ i $3$. Zastosuj twierdzenie Pitagorasa.' },
    ],
    commonErrors: [
      {
        id: 'geo-znak-roznicy',
        matches: ['4.123'],
        cause: 'Zgubiony znak przy ujemnej współrzędnej — policzona różnica $1$ zamiast $3$.',
        rule: '$2 - (-1) = 3$, nie $1$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-d-4',
    skillId: 'geo-distance',
    kind: 'transfer',
    prompt:
      'Punkt $S = (3, 4)$ jest środkiem odcinka $AB$, gdzie $A = (1, 2)$. Podaj pierwszą współrzędną punktu $B$.',
    format: 'numeric',
    answer: '5',
    acceptedVariants: [],
    solution:
      'Z $x_S = \\dfrac{x_A + x_B}{2}$ wynika $x_B = 2x_S - x_A = 6 - 1 = 5$.',
    hints: [
      { level: 1, text: 'Znasz środek i jeden koniec. Który wzór łączy te trzy punkty?' },
      { level: 2, text: 'Wyjdź od wzoru na środek i wyznacz z niego brakujący koniec.' },
      { level: 3, text: 'Z $x_S = \\dfrac{x_A + x_B}{2}$ otrzymujesz $x_B = 2x_S - x_A$.' },
      { level: 5, text: 'Podwój pierwszą współrzędną środka i odejmij współrzędną znanego końca.' },
    ],
    commonErrors: [
      {
        id: 'geo-srodek-odwrotnie',
        matches: ['2'],
        cause: 'Policzona różnica środka i końca zamiast wyznaczenia drugiego końca.',
        rule: 'Środek leży w połowie, więc od $A$ do $B$ jest dwa razy dalej niż od $A$ do $S$.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- geo-line ---------------------------------------------------------
  {
    id: 'q-geo-l-1',
    skillId: 'geo-line',
    kind: 'foundation',
    prompt:
      'Podaj współczynnik kierunkowy prostej przechodzącej przez punkty $A = (1, 2)$ oraz $B = (3, 8)$.',
    format: 'numeric',
    answer: '3',
    acceptedVariants: [],
    solution: '$a = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{8 - 2}{3 - 1} = \\dfrac{6}{2} = 3$.',
    hints: [
      { level: 1, text: 'Która różnica trafia do licznika: pionowa czy pozioma?' },
      { level: 2, text: 'Współczynnik kierunkowy mówi, o ile rośnie $y$ przy wzroście $x$ o jeden.' },
      { level: 3, text: '$a = \\dfrac{y_B - y_A}{x_B - x_A}$.' },
      { level: 5, text: 'Podziel różnicę rzędnych przez różnicę odciętych.' },
    ],
    commonErrors: [
      {
        id: 'geo-odwrocony-wspolczynnik',
        matches: ['0.3333', '1/3'],
        cause: 'Odwrócony ułamek — różnica odciętych w liczniku.',
        rule: 'Licznikiem jest różnica rzędnych, mianownikiem różnica odciętych.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-l-2',
    skillId: 'geo-line',
    kind: 'typical',
    prompt:
      'Prosta ma równanie $y = 2x - 5$. Podaj współczynnik kierunkowy prostej do niej prostopadłej.',
    format: 'numeric',
    answer: '-0.5',
    acceptedVariants: ['-1/2'],
    solution:
      'Dla prostych prostopadłych $a_1 a_2 = -1$, więc $a_2 = -\\dfrac{1}{2} = -0{,}5$.',
    hints: [
      { level: 1, text: 'Jaki warunek spełniają współczynniki kierunkowe prostych prostopadłych?' },
      { level: 2, text: 'Ich iloczyn jest stały i ujemny.' },
      { level: 3, text: 'Zachodzi $a_1 \\cdot a_2 = -1$.' },
      { level: 5, text: 'Odwróć współczynnik danej prostej i zmień jego znak.' },
    ],
    commonErrors: [
      {
        id: 'geo-prostopadla-bez-znaku',
        matches: ['0.5', '1/2'],
        cause: 'Odwrócony współczynnik bez zmiany znaku — to warunek prostej równoległej do odwrotności, nie prostopadłej.',
        rule: 'Iloczyn współczynników prostopadłych wynosi $-1$, więc znak musi się zmienić.',
      },
      {
        id: 'geo-prostopadla-ta-sama',
        matches: ['2'],
        cause: 'Przepisany współczynnik danej prostej — to warunek równoległości.',
        rule: 'Proste równoległe mają równe współczynniki, prostopadłe — iloczyn równy $-1$.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-l-3',
    skillId: 'geo-line',
    kind: 'typical',
    prompt:
      'Prosta o równaniu $y = 3x + b$ przechodzi przez punkt $P = (2, 1)$. Wyznacz $b$.',
    format: 'numeric',
    answer: '-5',
    acceptedVariants: ['b=-5'],
    solution: 'Podstawiamy współrzędne punktu: $1 = 3\\cdot 2 + b$, czyli $1 = 6 + b$, skąd $b = -5$.',
    hints: [
      { level: 1, text: 'Co znaczy, że prosta przechodzi przez dany punkt?' },
      { level: 2, text: 'Współrzędne punktu spełniają równanie prostej.' },
      { level: 3, text: 'Podstaw $x$ i $y$ punktu do równania i rozwiąż je względem $b$.' },
      { level: 5, text: 'Z równania $1 = 6 + b$ wyznacz $b$ — wynik jest ujemny.' },
    ],
    commonErrors: [
      {
        id: 'geo-b-znak',
        matches: ['5'],
        cause: 'Błąd znaku przy przenoszeniu wyrazu na drugą stronę.',
        rule: 'Z $1 = 6 + b$ wynika $b = 1 - 6$.',
      },
      {
        id: 'geo-b-suma',
        matches: ['7'],
        cause: 'Wartości dodane zamiast odjęte.',
        rule: 'Aby wyznaczyć $b$, odejmujemy $3x$ od obu stron.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-l-4',
    skillId: 'geo-line',
    kind: 'transfer',
    prompt:
      'Dane są punkty $A = (1, 1)$ oraz $B = (5, 3)$. Podaj współczynnik kierunkowy prostej prostopadłej do prostej $AB$.',
    format: 'numeric',
    answer: '-2',
    acceptedVariants: [],
    solution:
      'Najpierw $a_{AB} = \\dfrac{3 - 1}{5 - 1} = \\dfrac{2}{4} = \\tfrac{1}{2}$. Prostopadła ma współczynnik $-\\dfrac{1}{a_{AB}} = -2$.',
    hints: [
      { level: 1, text: 'To zadanie łączy dwie rzeczy. Co musisz policzyć najpierw?' },
      { level: 2, text: 'Wyznacz współczynnik prostej $AB$, zanim zajmiesz się prostopadłością.' },
      { level: 3, text: 'Dla prostopadłych $a_1 a_2 = -1$, więc $a_2 = -\\dfrac{1}{a_1}$.' },
      { level: 5, text: 'Współczynnik prostej $AB$ wynosi $\\tfrac{1}{2}$. Odwróć go i zmień znak.' },
    ],
    commonErrors: [
      {
        id: 'geo-transfer-bez-prostopadlej',
        matches: ['0.5', '1/2'],
        cause: 'Podany współczynnik prostej $AB$ zamiast prostej do niej prostopadłej.',
        rule: 'Pytanie dotyczy prostej prostopadłej, więc trzeba wykonać jeszcze jeden krok.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- geo-circle -------------------------------------------------------
  {
    id: 'q-geo-c-1',
    skillId: 'geo-circle',
    kind: 'foundation',
    prompt: 'Okrąg ma równanie $(x-2)^2 + (y+3)^2 = 25$. Podaj jego promień.',
    format: 'numeric',
    answer: '5',
    acceptedVariants: ['r=5'],
    solution: 'Prawa strona równania to $r^2$, więc $r = \\sqrt{25} = 5$.',
    hints: [
      { level: 1, text: 'Czym jest liczba po prawej stronie równania okręgu?' },
      { level: 2, text: 'To kwadrat promienia, a nie sam promień.' },
      { level: 3, text: 'Postać kanoniczna: $(x-a)^2 + (y-b)^2 = r^2$.' },
      { level: 5, text: 'Spierwiastkuj prawą stronę.' },
    ],
    commonErrors: [
      {
        id: 'geo-promien-kwadrat',
        matches: ['25'],
        cause: 'Podany kwadrat promienia — pominięte pierwiastkowanie.',
        rule: 'Po prawej stronie stoi $r^2$, więc promień to pierwiastek z tej liczby.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-c-2',
    skillId: 'geo-circle',
    kind: 'typical',
    prompt: 'Okrąg ma równanie $(x-2)^2 + (y+3)^2 = 25$. Podaj drugą współrzędną jego środka.',
    format: 'numeric',
    answer: '-3',
    acceptedVariants: [],
    solution:
      'W postaci $(x-a)^2 + (y-b)^2 = r^2$ środek to $(a, b)$. Tutaj $(y+3)^2 = (y-(-3))^2$, więc $b = -3$.',
    hints: [
      { level: 1, text: 'Jaki znak stoi w postaci kanonicznej przed współrzędną środka?' },
      { level: 2, text: 'W postaci kanonicznej jest minus, a w równaniu widzisz plus.' },
      { level: 3, text: '$(y+k)^2$ zapisujemy jako $(y-(-k))^2$.' },
      { level: 5, text: 'Współrzędna środka jest liczbą przeciwną do tej widocznej w nawiasie.' },
    ],
    commonErrors: [
      {
        id: 'geo-srodek-znak',
        matches: ['3'],
        cause: 'Przepisana liczba z nawiasu bez zmiany znaku.',
        rule: 'Z $(y+b)^2$ wynika, że współrzędna środka wynosi $-b$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-c-3',
    skillId: 'geo-circle',
    kind: 'typical',
    prompt:
      'Okrąg ma środek $S = (1, 2)$ i promień $3$. Podaj liczbę stojącą po prawej stronie jego równania w postaci kanonicznej.',
    format: 'numeric',
    answer: '9',
    acceptedVariants: [],
    solution: 'Po prawej stronie stoi $r^2 = 3^2 = 9$.',
    hints: [
      { level: 1, text: 'Czy po prawej stronie stoi promień, czy jego kwadrat?' },
      { level: 2, text: 'Postać kanoniczna kończy się na $r^2$.' },
      { level: 3, text: 'Podnieś promień do kwadratu.' },
      { level: 5, text: 'Współrzędne środka nie wpływają na prawą stronę równania.' },
    ],
    commonErrors: [
      {
        id: 'geo-prawa-strona-promien',
        matches: ['3'],
        cause: 'Wpisany promień zamiast jego kwadratu.',
        rule: 'Prawa strona równania okręgu to $r^2$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-geo-c-4',
    skillId: 'geo-circle',
    kind: 'transfer',
    prompt:
      'Okrąg ma równanie $x^2 + y^2 - 6x + 8 = 0$. Podaj pierwszą współrzędną jego środka.',
    format: 'numeric',
    answer: '3',
    acceptedVariants: [],
    solution:
      'Uzupełniamy do kwadratu: $x^2 - 6x = (x-3)^2 - 9$. Równanie przyjmuje postać $(x-3)^2 + y^2 = 1$, więc środek to $(3, 0)$.',
    hints: [
      { level: 1, text: 'To równanie nie jest w postaci kanonicznej. Jak je do niej sprowadzić?' },
      { level: 2, text: 'Uzupełnij wyrażenie z $x$ do pełnego kwadratu.' },
      { level: 3, text: '$x^2 + px = \\left(x + \\tfrac{p}{2}\\right)^2 - \\tfrac{p^2}{4}$.' },
      { level: 5, text: 'Połowa współczynnika przy $x$ wynosi $-3$, więc powstaje $(x-3)^2$.' },
    ],
    commonErrors: [
      {
        id: 'geo-srodek-wspolczynnik',
        matches: ['-6'],
        cause: 'Przepisany współczynnik przy $x$ zamiast jego połowy ze zmienionym znakiem.',
        rule: 'Po uzupełnieniu do kwadratu współrzędna środka to $-\\tfrac{p}{2}$.',
      },
      {
        id: 'geo-srodek-polowa-znak',
        matches: ['-3'],
        cause: 'Połowa współczynnika wzięta bez zmiany znaku.',
        rule: 'Z $x^2 - 6x$ powstaje $(x-3)^2$, więc środek ma współrzędną dodatnią.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

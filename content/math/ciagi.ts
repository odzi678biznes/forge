import type { Question, Skill, Topic } from '@/data/types';

/** Ciągi — arytmetyczny, geometryczny, granica. Materiał autorski, niezweryfikowany wobec CKE. */

export const SEQUENCE_TOPIC: Topic = {
  id: 'math-sequences',
  subjectId: 'math',
  name: 'Ciągi',
};

export const SEQUENCE_SKILLS: Skill[] = [
  {
    id: 'seq-arithmetic',
    topicId: 'math-sequences',
    name: 'Ciąg arytmetyczny',
    ckeRequirement: 'Ciągi — wzór ogólny i suma ciągu arytmetycznego',
    prerequisites: [],
    examValue: 0.75,
  },
  {
    id: 'seq-geometric',
    topicId: 'math-sequences',
    name: 'Ciąg geometryczny',
    ckeRequirement: 'Ciągi — wzór ogólny i suma ciągu geometrycznego',
    prerequisites: ['seq-arithmetic'],
    examValue: 0.75,
  },
  {
    id: 'seq-limit',
    topicId: 'math-sequences',
    name: 'Granica ciągu',
    ckeRequirement: 'Ciągi — granica ciągu liczbowego',
    prerequisites: ['seq-geometric'],
    examValue: 0.6,
  },
];

export const SEQUENCE_QUESTIONS: Question[] = [
  // --- seq-arithmetic ---------------------------------------------------
  {
    id: 'q-seq-a-1',
    skillId: 'seq-arithmetic',
    kind: 'foundation',
    prompt: 'W ciągu arytmetycznym $a_1 = 3$ oraz $r = 4$. Podaj $a_5$.',
    format: 'numeric',
    answer: '19',
    acceptedVariants: [],
    solution: '$a_n = a_1 + (n-1)r$, więc $a_5 = 3 + 4\\cdot 4 = 19$.',
    hints: [
      { level: 1, text: 'Ile razy dodajesz różnicę, przechodząc od pierwszego wyrazu do piątego?' },
      { level: 2, text: 'Od $a_1$ do $a_5$ wykonujesz cztery kroki, nie pięć.' },
      { level: 3, text: 'Wzór ogólny: $a_n = a_1 + (n-1)r$.' },
      { level: 5, text: 'Podstaw: $a_5 = 3 + (5-1)\\cdot 4$.' },
    ],
    commonErrors: [
      {
        id: 'seq-a-off-by-one',
        matches: ['23'],
        cause: 'Różnica dodana pięć razy zamiast czterech — użyte $n$ zamiast $n-1$.',
        rule: 'We wzorze $a_n = a_1 + (n-1)r$ mnożnikiem jest $n-1$.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-a-2',
    skillId: 'seq-arithmetic',
    kind: 'typical',
    prompt:
      'W ciągu arytmetycznym $a_1 = 2$ oraz $r = 5$. Oblicz sumę dziesięciu początkowych wyrazów.',
    format: 'numeric',
    answer: '245',
    acceptedVariants: [],
    solution:
      '$S_n = \\dfrac{n}{2}\\big(2a_1 + (n-1)r\\big) = \\dfrac{10}{2}(4 + 9\\cdot 5) = 5\\cdot 49 = 245$.',
    hints: [
      { level: 1, text: 'Czy potrzebujesz wypisywać wszystkie wyrazy, żeby policzyć ich sumę?' },
      { level: 2, text: 'Istnieje wzór na sumę początkowych wyrazów ciągu arytmetycznego.' },
      { level: 3, text: '$S_n = \\dfrac{n}{2}\\big(2a_1 + (n-1)r\\big)$.' },
      { level: 5, text: 'Policz najpierw nawias: $2\\cdot 2 + 9\\cdot 5$.' },
    ],
    commonErrors: [
      {
        id: 'seq-sum-off-by-one',
        matches: ['270'],
        cause: 'W nawiasie użyte $n$ zamiast $n-1$ — policzone $2a_1 + 10r$.',
        rule: 'Ostatni wyraz sumy to $a_n = a_1 + (n-1)r$, stąd $n-1$ we wzorze na sumę.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-a-3',
    skillId: 'seq-arithmetic',
    kind: 'typical',
    prompt: 'W ciągu arytmetycznym $a_3 = 11$ oraz $a_7 = 27$. Oblicz różnicę $r$.',
    format: 'numeric',
    answer: '4',
    acceptedVariants: ['r=4'],
    solution:
      '$a_7 - a_3 = (7-3)r = 4r$, więc $4r = 27 - 11 = 16$, skąd $r = 4$.',
    hints: [
      { level: 1, text: 'Ile kroków dzieli wyraz trzeci od siódmego?' },
      { level: 2, text: 'Między $a_3$ a $a_7$ różnica jest dodawana cztery razy.' },
      { level: 3, text: 'Zachodzi $a_7 - a_3 = (7-3)\\cdot r$.' },
      { level: 5, text: 'Z równania $4r = 16$ wyznacz $r$.' },
    ],
    commonErrors: [
      {
        id: 'seq-r-bez-dzielenia',
        matches: ['16'],
        cause: 'Podana różnica wyrazów zamiast różnicy ciągu — brak dzielenia przez liczbę kroków.',
        rule: '$a_7 - a_3$ to cztery różnice, nie jedna.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-a-4',
    skillId: 'seq-arithmetic',
    kind: 'transfer',
    prompt:
      'Liczby $x$, $x+4$, $3x$ są trzema kolejnymi wyrazami ciągu arytmetycznego. Wyznacz $x$.',
    format: 'numeric',
    answer: '4',
    acceptedVariants: ['x=4'],
    solution:
      'W ciągu arytmetycznym różnice kolejnych wyrazów są równe: $(x+4) - x = 3x - (x+4)$, czyli $4 = 2x - 4$, skąd $x = 4$. (Sprawdzenie: $4,\\ 8,\\ 12$.)',
    hints: [
      { level: 1, text: 'Co musi być wspólne dla dwóch sąsiednich par wyrazów?' },
      { level: 2, text: 'Różnica drugiego i pierwszego wyrazu równa się różnicy trzeciego i drugiego.' },
      { level: 3, text: 'Zapisz równanie $(x+4) - x = 3x - (x+4)$.' },
      { level: 5, text: 'Lewa strona upraszcza się do stałej. Rozwiąż $4 = 2x - 4$.' },
    ],
    commonErrors: [
      {
        id: 'seq-znak-roznicy',
        matches: ['0'],
        cause: 'Błąd znaku przy rozwijaniu nawiasu $3x - (x+4)$ — otrzymane $2x + 4$ zamiast $2x - 4$.',
        rule: 'Minus przed nawiasem zmienia znak każdego składnika w środku.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- seq-geometric ----------------------------------------------------
  {
    id: 'q-seq-g-1',
    skillId: 'seq-geometric',
    kind: 'foundation',
    prompt: 'W ciągu geometrycznym $a_1 = 2$ oraz $q = 3$. Podaj $a_4$.',
    format: 'numeric',
    answer: '54',
    acceptedVariants: [],
    solution: '$a_n = a_1 q^{\\,n-1}$, więc $a_4 = 2\\cdot 3^3 = 2\\cdot 27 = 54$.',
    hints: [
      { level: 1, text: 'Ile razy mnożysz przez iloraz, idąc od pierwszego wyrazu do czwartego?' },
      { level: 2, text: 'Trzy razy, nie cztery.' },
      { level: 3, text: 'Wzór ogólny: $a_n = a_1 q^{\\,n-1}$.' },
      { level: 5, text: 'Policz $3^3$, a potem pomnóż przez $a_1$.' },
    ],
    commonErrors: [
      {
        id: 'seq-g-off-by-one',
        matches: ['162'],
        cause: 'Wykładnik $n$ zamiast $n-1$ — policzone $2\\cdot 3^4$.',
        rule: 'We wzorze $a_n = a_1 q^{\\,n-1}$ wykładnikiem jest $n-1$.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-g-2',
    skillId: 'seq-geometric',
    kind: 'typical',
    prompt:
      'W ciągu geometrycznym $a_1 = 5$ oraz $q = 2$. Oblicz sumę sześciu początkowych wyrazów.',
    format: 'numeric',
    answer: '315',
    acceptedVariants: [],
    solution:
      '$S_n = a_1\\dfrac{q^n - 1}{q - 1} = 5\\cdot\\dfrac{64 - 1}{1} = 5\\cdot 63 = 315$.',
    hints: [
      { level: 1, text: 'Który wzór opisuje sumę początkowych wyrazów ciągu geometrycznego?' },
      { level: 2, text: '$S_n = a_1\\dfrac{q^n - 1}{q - 1}$, przy $q \\neq 1$.' },
      { level: 3, text: 'Tutaj $q^n = 2^6$, a mianownik wynosi $1$.' },
      { level: 5, text: 'Policz $2^6 - 1$, a wynik pomnóż przez $5$.' },
    ],
    commonErrors: [
      {
        id: 'seq-g-sum-bez-jedynki',
        matches: ['320'],
        cause: 'Pominięte odjęcie jedynki w liczniku — policzone $5\\cdot 2^6$.',
        rule: 'Licznik wzoru na sumę to $q^n - 1$, nie $q^n$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-g-3',
    skillId: 'seq-geometric',
    kind: 'typical',
    prompt:
      'W ciągu geometrycznym o wyrazach dodatnich $a_2 = 6$ oraz $a_4 = 24$. Podaj iloraz $q$.',
    format: 'numeric',
    answer: '2',
    acceptedVariants: ['q=2'],
    solution:
      '$\\dfrac{a_4}{a_2} = q^2 = \\dfrac{24}{6} = 4$. Ponieważ wyrazy są dodatnie, $q = 2$.',
    hints: [
      { level: 1, text: 'Co otrzymasz, dzieląc $a_4$ przez $a_2$?' },
      { level: 2, text: 'Iloraz tych wyrazów to $q$ podniesione do pewnej potęgi.' },
      { level: 3, text: 'Zachodzi $\\dfrac{a_4}{a_2} = q^{\\,4-2} = q^2$.' },
      { level: 5, text: 'Z $q^2 = 4$ i dodatnich wyrazów wynika jedna wartość.' },
    ],
    commonErrors: [
      {
        id: 'seq-g-q-kwadrat',
        matches: ['4'],
        cause: 'Podane $q^2$ zamiast $q$ — brak pierwiastkowania.',
        rule: 'Dzielenie $a_4$ przez $a_2$ daje $q^2$, nie $q$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-g-4',
    skillId: 'seq-geometric',
    kind: 'transfer',
    prompt:
      'Oblicz sumę szeregu geometrycznego nieskończonego o pierwszym wyrazie $a_1 = 8$ i ilorazie $q = \\tfrac{1}{2}$.',
    format: 'numeric',
    answer: '16',
    acceptedVariants: [],
    solution:
      'Ponieważ $|q| < 1$, szereg jest zbieżny i $S = \\dfrac{a_1}{1-q} = \\dfrac{8}{1 - \\tfrac{1}{2}} = \\dfrac{8}{\\tfrac{1}{2}} = 16$.',
    hints: [
      { level: 1, text: 'Czy ten szereg w ogóle ma skończoną sumę? Od czego to zależy?' },
      { level: 2, text: 'Szereg geometryczny jest zbieżny dokładnie wtedy, gdy $|q| < 1$.' },
      { level: 3, text: 'Dla szeregu zbieżnego $S = \\dfrac{a_1}{1-q}$.' },
      { level: 5, text: 'Mianownik wynosi $1 - \\tfrac{1}{2}$. Dzielenie przez ułamek to mnożenie przez odwrotność.' },
    ],
    commonErrors: [
      {
        id: 'seq-szereg-mnozenie',
        matches: ['4'],
        cause: 'Pomnożone przez $q$ zamiast podzielenia przez $1-q$.',
        rule: 'Suma szeregu zbieżnego to $\\frac{a_1}{1-q}$.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- seq-limit --------------------------------------------------------
  {
    id: 'q-seq-l-1',
    skillId: 'seq-limit',
    kind: 'foundation',
    prompt: 'Oblicz granicę ciągu $a_n = \\dfrac{3n + 1}{n + 2}$.',
    format: 'numeric',
    answer: '3',
    acceptedVariants: [],
    solution:
      'Dzielimy licznik i mianownik przez $n$: $\\dfrac{3 + \\tfrac{1}{n}}{1 + \\tfrac{2}{n}} \\to \\dfrac{3}{1} = 3$.',
    hints: [
      { level: 1, text: 'Który składnik licznika i mianownika rośnie najszybciej?' },
      { level: 2, text: 'Podziel licznik i mianownik przez najwyższą potęgę $n$.' },
      { level: 3, text: 'Wyrażenia postaci $\\tfrac{c}{n}$ dążą do zera.' },
      { level: 5, text: 'Zostaje iloraz współczynników przy $n$.' },
    ],
    commonErrors: [
      {
        id: 'seq-lim-wyrazy-wolne',
        matches: ['0.5', '1/2'],
        cause: 'Porównane wyrazy wolne zamiast współczynników przy najwyższej potędze.',
        rule: 'O granicy decydują współczynniki przy najwyższej potędze $n$.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-l-2',
    skillId: 'seq-limit',
    kind: 'typical',
    prompt: 'Oblicz granicę ciągu $a_n = \\dfrac{2n^2 - n}{5n^2 + 3}$.',
    format: 'numeric',
    answer: '0.4',
    acceptedVariants: ['2/5'],
    solution:
      'Dzielimy przez $n^2$: $\\dfrac{2 - \\tfrac{1}{n}}{5 + \\tfrac{3}{n^2}} \\to \\dfrac{2}{5} = 0{,}4$.',
    hints: [
      { level: 1, text: 'Jaka jest najwyższa potęga $n$ w tym ułamku?' },
      { level: 2, text: 'Podziel licznik i mianownik przez $n^2$.' },
      { level: 3, text: 'Składniki $\\tfrac{1}{n}$ i $\\tfrac{3}{n^2}$ dążą do zera.' },
      { level: 5, text: 'Zostaje iloraz współczynników przy $n^2$.' },
    ],
    commonErrors: [
      {
        id: 'seq-lim-tylko-licznik',
        matches: ['2'],
        cause: 'Uwzględniony współczynnik licznika, pominięty mianownik.',
        rule: 'Granica to iloraz współczynników przy najwyższej potędze, nie sam licznik.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-l-3',
    skillId: 'seq-limit',
    kind: 'typical',
    prompt: 'Oblicz granicę ciągu $a_n = \\dfrac{4n + 7}{n^2 + 1}$.',
    format: 'numeric',
    answer: '0',
    acceptedVariants: [],
    solution:
      'Stopień mianownika jest wyższy niż licznika, więc granica wynosi $0$. Formalnie po podzieleniu przez $n^2$: $\\dfrac{\\tfrac{4}{n} + \\tfrac{7}{n^2}}{1 + \\tfrac{1}{n^2}} \\to 0$.',
    hints: [
      { level: 1, text: 'Który z tych wielomianów rośnie szybciej — licznik czy mianownik?' },
      { level: 2, text: 'Mianownik rośnie szybciej niż licznik.' },
      { level: 3, text: 'Gdy stopień mianownika jest wyższy, granica wynosi zero.' },
      { level: 5, text: 'Podziel licznik i mianownik przez $n^2$ i zobacz, do czego dążą składniki.' },
    ],
    commonErrors: [
      {
        id: 'seq-lim-wspolczynniki-roznych-stopni',
        matches: ['4'],
        cause: 'Porównane współczynniki przy różnych potęgach — $4n$ potraktowane jak $4n^2$.',
        rule: 'Współczynniki wolno porównywać tylko przy tej samej potędze $n$.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-seq-l-4',
    skillId: 'seq-limit',
    kind: 'transfer',
    prompt:
      'Ciąg $a_n = \\dfrac{(2n+1)^2}{3n^2 + n}$. Oblicz jego granicę.',
    format: 'numeric',
    answer: '1.3333',
    acceptedVariants: ['4/3'],
    tolerance: 0.001,
    solution:
      'Rozwijamy licznik: $(2n+1)^2 = 4n^2 + 4n + 1$. Zatem granica to iloraz współczynników przy $n^2$, czyli $\\dfrac{4}{3}$.',
    hints: [
      { level: 1, text: 'Czy potrafisz porównać stopnie bez rozwinięcia licznika?' },
      { level: 2, text: 'Rozwiń kwadrat sumy, żeby zobaczyć współczynnik przy najwyższej potędze.' },
      { level: 3, text: '$(a+b)^2 = a^2 + 2ab + b^2$.' },
      { level: 5, text: 'Licznik ma przy $n^2$ współczynnik $4$, mianownik $3$.' },
    ],
    commonErrors: [
      {
        id: 'seq-lim-bez-rozwiniecia',
        matches: ['0.6667', '2/3'],
        cause: 'Kwadrat potraktowany jako mnożnik liniowy — wzięte $2$ zamiast $4$ jako współczynnik przy $n^2$.',
        rule: 'W $(2n+1)^2$ współczynnik przy $n^2$ wynosi $2^2 = 4$.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

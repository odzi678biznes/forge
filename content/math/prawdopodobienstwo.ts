import type { Question, Skill, Topic } from '@/data/types';

/** Kombinatoryka i prawdopodobieństwo. Materiał autorski, niezweryfikowany wobec CKE. */

export const PROB_TOPIC: Topic = {
  id: 'math-probability',
  subjectId: 'math',
  name: 'Kombinatoryka i prawdopodobieństwo',
};

export const PROB_SKILLS: Skill[] = [
  {
    id: 'prob-counting',
    topicId: 'math-probability',
    name: 'Kombinatoryka',
    ckeRequirement: 'Kombinatoryka — reguła mnożenia, permutacje, kombinacje',
    prerequisites: [],
    examValue: 0.7,
  },
  {
    id: 'prob-classic',
    topicId: 'math-probability',
    name: 'Prawdopodobieństwo klasyczne',
    ckeRequirement: 'Prawdopodobieństwo — model klasyczny',
    prerequisites: ['prob-counting'],
    examValue: 0.8,
  },
  {
    id: 'prob-compound',
    topicId: 'math-probability',
    name: 'Zdarzenia złożone',
    ckeRequirement: 'Prawdopodobieństwo — zdarzenia złożone i losowanie bez zwracania',
    prerequisites: ['prob-classic'],
    examValue: 0.75,
  },
];

export const PROB_QUESTIONS: Question[] = [
  // --- prob-counting ----------------------------------------------------
  {
    id: 'q-prob-k-1',
    skillId: 'prob-counting',
    kind: 'foundation',
    prompt: 'Na ile sposobów można ustawić w rzędzie cztery różne książki?',
    format: 'numeric',
    answer: '24',
    acceptedVariants: [],
    solution:
      'To liczba permutacji czterech elementów: $4! = 4\\cdot 3\\cdot 2\\cdot 1 = 24$.',
    hints: [
      { level: 1, text: 'Ile masz możliwości wyboru książki na pierwsze miejsce, a ile na drugie?' },
      { level: 2, text: 'Po ustawieniu każdej książki liczba pozostałych maleje o jeden.' },
      { level: 3, text: 'Liczba ustawień $n$ różnych elementów to $n!$.' },
      { level: 5, text: 'Pomnóż przez siebie kolejne liczby naturalne od liczby książek w dół.' },
    ],
    commonErrors: [
      {
        id: 'prob-potega-zamiast-silni',
        matches: ['16'],
        cause: 'Policzone $4^4$ albo $4^2$ — przyjęte, że liczba możliwości nie maleje.',
        rule: 'Przy ustawianiu bez powtórzeń liczba dostępnych elementów maleje z każdym miejscem.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-k-2',
    skillId: 'prob-counting',
    kind: 'typical',
    prompt: 'Ile jest trzyelementowych podzbiorów zbioru pięcioelementowego?',
    format: 'numeric',
    answer: '10',
    acceptedVariants: [],
    solution:
      '$\\binom{5}{3} = \\dfrac{5!}{3!\\,2!} = \\dfrac{5\\cdot 4}{2} = 10$.',
    hints: [
      { level: 1, text: 'Czy w podzbiorze ma znaczenie kolejność elementów?' },
      { level: 2, text: 'Kolejność nie ma znaczenia, więc to kombinacje, a nie wariacje.' },
      { level: 3, text: '$\\binom{n}{k} = \\dfrac{n!}{k!\\,(n-k)!}$.' },
      { level: 5, text: 'Policz $\\binom{5}{3}$, pamiętając o podzieleniu przez silnię wybranych elementów.' },
    ],
    commonErrors: [
      {
        id: 'prob-wariacje-zamiast-kombinacji',
        matches: ['60'],
        cause: 'Policzone wariacje bez powtórzeń — uwzględniona kolejność, której w podzbiorze nie ma.',
        rule: 'W kombinacjach dzielimy dodatkowo przez $k!$, bo kolejność nie ma znaczenia.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-k-3',
    skillId: 'prob-counting',
    kind: 'typical',
    prompt:
      'Ile jest liczb trzycyfrowych o wszystkich cyfrach różnych, utworzonych wyłącznie z cyfr $1, 2, 3, 4, 5$?',
    format: 'numeric',
    answer: '60',
    acceptedVariants: [],
    solution:
      'Na pierwsze miejsce mamy $5$ możliwości, na drugie $4$, na trzecie $3$: $5\\cdot 4\\cdot 3 = 60$.',
    hints: [
      { level: 1, text: 'Czy cyfry mogą się powtarzać? Jak to wpływa na liczbę możliwości?' },
      { level: 2, text: 'Każda użyta cyfra znika z puli dostępnych dla kolejnych miejsc.' },
      { level: 3, text: 'Stosujemy regułę mnożenia dla malejącej liczby możliwości.' },
      { level: 5, text: 'Pomnóż liczbę możliwości dla trzech kolejnych pozycji.' },
    ],
    commonErrors: [
      {
        id: 'prob-z-powtorzeniami',
        matches: ['125'],
        cause: 'Dopuszczone powtórzenia cyfr — policzone $5^3$.',
        rule: 'Warunek „wszystkie cyfry różne" wyklucza powtórzenia.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-k-4',
    skillId: 'prob-counting',
    kind: 'transfer',
    prompt: 'Ile jest liczb czterocyfrowych o wszystkich cyfrach różnych?',
    format: 'numeric',
    answer: '4536',
    acceptedVariants: [],
    solution:
      'Pierwsza cyfra nie może być zerem, więc mamy $9$ możliwości. Na drugie miejsce zostaje $9$ cyfr (zero wraca do puli), na trzecie $8$, na czwarte $7$: $9\\cdot 9\\cdot 8\\cdot 7 = 4536$.',
    hints: [
      { level: 1, text: 'Czy każda cyfra może stać na pierwszym miejscu liczby czterocyfrowej?' },
      { level: 2, text: 'Zero nie może rozpoczynać liczby, ale na dalszych miejscach jest dozwolone.' },
      { level: 3, text: 'Policz osobno możliwości dla pierwszej pozycji i dla pozostałych.' },
      { level: 5, text: 'Na pierwsze miejsce jest $9$ możliwości, na drugie znowu $9$, potem $8$ i $7$.' },
    ],
    commonErrors: [
      {
        id: 'prob-zero-na-poczatku',
        matches: ['5040'],
        cause: 'Dopuszczone zero na pierwszym miejscu — policzone $10\\cdot 9\\cdot 8\\cdot 7$.',
        rule: 'Liczba czterocyfrowa nie może zaczynać się od zera.',
      },
      {
        id: 'prob-z-powtorzeniami-4',
        matches: ['9000'],
        cause: 'Pominięty warunek różnych cyfr — policzone wszystkie liczby czterocyfrowe.',
        rule: 'Warunek różnych cyfr zmniejsza pulę przy każdej kolejnej pozycji.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- prob-classic -----------------------------------------------------
  {
    id: 'q-prob-c-1',
    skillId: 'prob-classic',
    kind: 'foundation',
    prompt:
      'Rzucamy symetryczną sześcienną kostką. Jakie jest prawdopodobieństwo wyrzucenia liczby parzystej oczek?',
    format: 'numeric',
    answer: '0.5',
    acceptedVariants: ['1/2', '3/6'],
    solution:
      'Zdarzeń sprzyjających jest trzy ($2, 4, 6$), wszystkich sześć, więc $P = \\tfrac{3}{6} = \\tfrac{1}{2}$.',
    hints: [
      { level: 1, text: 'Ile wyników sprzyja zdarzeniu, a ile jest wszystkich możliwych?' },
      { level: 2, text: 'Wypisz wszystkie parzyste liczby oczek.' },
      { level: 3, text: 'W modelu klasycznym $P(A) = \\dfrac{|A|}{|\\Omega|}$.' },
      { level: 5, text: 'Podziel liczbę wyników parzystych przez liczbę wszystkich ścianek.' },
    ],
    commonErrors: [
      {
        id: 'prob-jedna-scianka',
        matches: ['0.1667', '1/6'],
        cause: 'Policzone prawdopodobieństwo jednego konkretnego wyniku zamiast całego zdarzenia.',
        rule: 'Zdarzenie „liczba parzysta" obejmuje trzy wyniki, nie jeden.',
      },
    ],
    difficulty: 1,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-c-2',
    skillId: 'prob-classic',
    kind: 'typical',
    prompt:
      'Rzucamy dwiema rozróżnialnymi kostkami sześciennymi. Ile jest wszystkich możliwych wyników?',
    format: 'numeric',
    answer: '36',
    acceptedVariants: [],
    solution:
      'Każda kostka daje sześć wyników niezależnie od drugiej, więc $6\\cdot 6 = 36$.',
    hints: [
      { level: 1, text: 'Czy wynik na drugiej kostce zależy od wyniku na pierwszej?' },
      { level: 2, text: 'Wyniki są niezależne, więc stosujemy regułę mnożenia.' },
      { level: 3, text: 'Liczba par to iloczyn liczby możliwości dla każdej kostki.' },
      { level: 5, text: 'Pomnóż liczbę ścianek przez samą siebie.' },
    ],
    commonErrors: [
      {
        id: 'prob-dodawanie-zamiast-mnozenia',
        matches: ['12'],
        cause: 'Liczby możliwości dodane zamiast pomnożone.',
        rule: 'Dla niezależnych etapów liczby możliwości mnożymy.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-c-3',
    skillId: 'prob-classic',
    kind: 'typical',
    prompt:
      'Rzucamy dwiema kostkami sześciennymi. Jakie jest prawdopodobieństwo, że suma oczek wyniesie $7$?',
    format: 'numeric',
    answer: '0.1667',
    acceptedVariants: ['1/6', '6/36'],
    tolerance: 0.001,
    solution:
      'Sumę $7$ dają pary $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ — sześć z trzydziestu sześciu, czyli $\\tfrac{6}{36} = \\tfrac{1}{6}$.',
    hints: [
      { level: 1, text: 'Ile uporządkowanych par daje tę sumę?' },
      { level: 2, text: 'Pary $(a,b)$ i $(b,a)$ liczymy osobno, bo kostki są rozróżnialne.' },
      { level: 3, text: 'Wypisz wszystkie pary sumujące się do wskazanej liczby.' },
      { level: 5, text: 'Takich par jest sześć. Podziel je przez liczbę wszystkich wyników.' },
    ],
    commonErrors: [
      {
        id: 'prob-jedna-para',
        matches: ['0.0278', '1/36'],
        cause: 'Policzona jedna para zamiast wszystkich dających tę sumę.',
        rule: 'Sumę można otrzymać na kilka sposobów — trzeba policzyć je wszystkie.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-c-4',
    skillId: 'prob-classic',
    kind: 'transfer',
    prompt:
      'Z talii $52$ kart losujemy jedną. Jakie jest prawdopodobieństwo, że wylosowana karta jest asem lub kierem?',
    format: 'numeric',
    answer: '0.3077',
    acceptedVariants: ['16/52', '4/13'],
    tolerance: 0.001,
    solution:
      'Asów jest $4$, kierów $13$, ale as kier należy do obu grup. Zdarzeń sprzyjających jest $4 + 13 - 1 = 16$, więc $P = \\tfrac{16}{52} = \\tfrac{4}{13} \\approx 0{,}308$.',
    hints: [
      { level: 1, text: 'Czy któraś karta należy jednocześnie do obu wymienionych grup?' },
      { level: 2, text: 'As kier jest liczony dwa razy, jeśli po prostu dodasz obie liczby.' },
      { level: 3, text: 'Wzór włączeń: $|A \\cup B| = |A| + |B| - |A \\cap B|$.' },
      { level: 5, text: 'Odejmij część wspólną, a wynik podziel przez liczbę wszystkich kart.' },
    ],
    commonErrors: [
      {
        id: 'prob-bez-czesci-wspolnej',
        matches: ['0.3269', '17/52'],
        cause: 'Pominięta część wspólna — as kier policzony dwukrotnie.',
        rule: 'Przy sumie zdarzeń nierozłącznych odejmujemy ich część wspólną.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- prob-compound ----------------------------------------------------
  {
    id: 'q-prob-z-1',
    skillId: 'prob-compound',
    kind: 'foundation',
    prompt:
      'W urnie są trzy kule białe i dwie czarne. Losujemy jedną kulę. Jakie jest prawdopodobieństwo wylosowania kuli białej?',
    format: 'numeric',
    answer: '0.6',
    acceptedVariants: ['3/5'],
    solution: 'Kul jest pięć, białych trzy, więc $P = \\tfrac{3}{5} = 0{,}6$.',
    hints: [
      { level: 1, text: 'Ile kul jest w urnie łącznie?' },
      { level: 2, text: 'Mianownikiem jest liczba wszystkich kul, nie tylko jednego koloru.' },
      { level: 3, text: '$P = \\dfrac{\\text{liczba kul sprzyjających}}{\\text{liczba wszystkich kul}}$.' },
      { level: 5, text: 'Podziel liczbę kul białych przez sumę wszystkich kul.' },
    ],
    commonErrors: [
      {
        id: 'prob-zly-mianownik',
        matches: ['1.5', '3/2'],
        cause: 'W mianowniku użyta liczba kul drugiego koloru zamiast wszystkich kul.',
        rule: 'Prawdopodobieństwo nigdy nie przekracza jedynki.',
      },
      {
        id: 'prob-dopelnienie',
        matches: ['0.4', '2/5'],
        cause: 'Policzone prawdopodobieństwo zdarzenia przeciwnego.',
        rule: 'Pytanie dotyczy kuli białej, a nie czarnej.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-z-2',
    skillId: 'prob-compound',
    kind: 'typical',
    prompt:
      'W urnie są trzy kule białe i dwie czarne. Losujemy kolejno dwie kule bez zwracania. Jakie jest prawdopodobieństwo, że obie są białe?',
    format: 'numeric',
    answer: '0.3',
    acceptedVariants: ['3/10'],
    solution:
      'Pierwsze losowanie: $\\tfrac{3}{5}$. Po wyjęciu białej kuli zostają dwie białe z czterech: $\\tfrac{2}{4}$. Iloczyn wynosi $\\tfrac{3}{5}\\cdot\\tfrac{2}{4} = \\tfrac{3}{10} = 0{,}3$.',
    hints: [
      { level: 1, text: 'Co zmienia się w urnie po pierwszym losowaniu?' },
      { level: 2, text: 'Bez zwracania maleje zarówno liczba kul białych, jak i liczba wszystkich kul.' },
      { level: 3, text: 'Prawdopodobieństwa kolejnych losowań mnożymy.' },
      { level: 5, text: 'Drugi czynnik to dwie kule białe spośród czterech pozostałych.' },
    ],
    commonErrors: [
      {
        id: 'prob-ze-zwracaniem',
        matches: ['0.36', '9/25'],
        cause: 'Potraktowane jak losowanie ze zwracaniem — użyte $\\tfrac{3}{5}$ dwa razy.',
        rule: 'Bez zwracania skład urny zmienia się przed drugim losowaniem.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-z-3',
    skillId: 'prob-compound',
    kind: 'typical',
    prompt:
      'Rzucamy symetryczną monetą trzy razy. Jakie jest prawdopodobieństwo wyrzucenia dokładnie dwóch orłów?',
    format: 'numeric',
    answer: '0.375',
    acceptedVariants: ['3/8'],
    solution:
      'Wszystkich wyników jest $2^3 = 8$. Dokładnie dwa orły dają układy OOR, ORO, ROO — trzy z ośmiu, czyli $\\tfrac{3}{8} = 0{,}375$.',
    hints: [
      { level: 1, text: 'Ile jest w ogóle możliwych wyników trzech rzutów?' },
      { level: 2, text: 'Wypisz układy, w których orzeł pojawia się dokładnie dwa razy.' },
      { level: 3, text: 'Liczba takich układów to $\\binom{3}{2}$.' },
      { level: 5, text: 'Podziel liczbę sprzyjających układów przez liczbę wszystkich wyników.' },
    ],
    commonErrors: [
      {
        id: 'prob-jeden-uklad',
        matches: ['0.125', '1/8'],
        cause: 'Policzony jeden konkretny układ zamiast wszystkich o dwóch orłach.',
        rule: 'Dwa orły można otrzymać na kilka sposobów, zależnie od kolejności.',
      },
    ],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-prob-z-4',
    skillId: 'prob-compound',
    kind: 'transfer',
    prompt:
      'Rzucamy kostką sześcienną dwa razy. Jakie jest prawdopodobieństwo, że co najmniej raz wypadnie szóstka?',
    format: 'numeric',
    answer: '0.3056',
    acceptedVariants: ['11/36'],
    tolerance: 0.001,
    solution:
      'Łatwiej policzyć zdarzenie przeciwne: żadna szóstka w obu rzutach ma prawdopodobieństwo $\\left(\\tfrac{5}{6}\\right)^2 = \\tfrac{25}{36}$. Zatem $P = 1 - \\tfrac{25}{36} = \\tfrac{11}{36} \\approx 0{,}306$.',
    hints: [
      { level: 1, text: 'Czy łatwiej policzyć to zdarzenie wprost, czy jego zaprzeczenie?' },
      { level: 2, text: 'Zaprzeczeniem „co najmniej raz" jest „ani razu".' },
      { level: 3, text: '$P(A) = 1 - P(A\')$.' },
      { level: 5, text: 'Policz prawdopodobieństwo braku szóstki w obu rzutach i odejmij je od jedynki.' },
    ],
    commonErrors: [
      {
        id: 'prob-dodawanie-prawdopodobienstw',
        matches: ['0.3333', '1/3', '2/6'],
        cause: 'Prawdopodobieństwa obu rzutów dodane — przypadek dwóch szóstek policzony dwukrotnie.',
        rule: 'Zdarzenia „szóstka w pierwszym" i „szóstka w drugim" nie są rozłączne.',
      },
    ],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

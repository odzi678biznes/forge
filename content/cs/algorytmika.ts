import type { Question, Skill, Subject, Topic } from '@/data/types';

/**
 * Informatyka — algorytmika i programowanie. Blueprint sek. 15, Etap 4.
 *
 * ŚWIADOME OGRANICZENIE: językiem zadań programistycznych jest JavaScript,
 * bo tylko on uruchamia się offline bez instalowania toolchainu na maszynie
 * ucznia. Matura z informatyki dopuszcza C++, Pythona i Javę — uruchamianie
 * tamtych będzie osobnym adapterem portu `CodeRunner`. Zadania są dobrane
 * tak, żeby oceniany był ALGORYTM, a nie biblioteka standardowa języka.
 *
 * Materiał autorski, niezweryfikowany wobec informatora CKE.
 */

export const CS: Subject = { id: 'cs', name: 'Informatyka (rozszerzona)' };

export const ALGO_TOPIC: Topic = {
  id: 'cs-algorithms',
  subjectId: 'cs',
  name: 'Algorytmika i programowanie',
};

export const ALGO_SKILLS: Skill[] = [
  {
    id: 'cs-arrays',
    topicId: 'cs-algorithms',
    name: 'Operacje na tablicach',
    ckeRequirement: 'Algorytmika — przetwarzanie ciągów danych',
    prerequisites: [],
    examValue: 0.8,
  },
  {
    id: 'cs-search-sort',
    topicId: 'cs-algorithms',
    name: 'Wyszukiwanie i sortowanie',
    ckeRequirement: 'Algorytmika — algorytmy wyszukiwania i porządkowania',
    prerequisites: ['cs-arrays'],
    examValue: 0.9,
  },
  {
    id: 'cs-numbers',
    topicId: 'cs-algorithms',
    name: 'Algorytmy liczbowe',
    ckeRequirement: 'Algorytmika — algorytmy na liczbach i systemy pozycyjne',
    prerequisites: ['cs-arrays'],
    examValue: 0.85,
  },
];

export const ALGO_QUESTIONS: Question[] = [
  // --- cs-arrays --------------------------------------------------------
  {
    id: 'q-cs-arr-1',
    skillId: 'cs-arrays',
    kind: 'foundation',
    prompt:
      'Napisz funkcję, która dla tablicy liczb zwróci sumę jej elementów dodatnich. Dla tablicy pustej wynikiem jest $0$.',
    format: 'code',
    answer: 'suma elementow dodatnich',
    acceptedVariants: [],
    code: {
      functionName: 'sumaDodatnich',
      signature: 'sumaDodatnich(t: number[]): number',
      starterCode: 'function sumaDodatnich(t) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'tablica pusta', input: [[]], expected: 0 },
        { name: 'same dodatnie', input: [[1, 2, 3]], expected: 6 },
        { name: 'mieszane', input: [[1, -2, 3]], expected: 4 },
        { name: 'same ujemne', input: [[-1, -2]], expected: 0, hidden: true },
        { name: 'zero nie jest dodatnie', input: [[0, 0, 5]], expected: 5, hidden: true },
      ],
    },
    solution:
      'Przechodzimy tablicę raz, dodając element tylko wtedy, gdy jest większy od zera. Złożoność liniowa, jeden przebieg wystarczy.',
    hints: [
      { level: 1, text: 'Czy potrzebujesz przejść tablicę więcej niż raz?' },
      { level: 2, text: 'Wystarczy jeden przebieg i jedna zmienna na wynik.' },
      { level: 3, text: 'Zacznij od wyniku równego zeru i dodawaj warunkowo.' },
      { level: 5, text: 'Warunek to „element większy od zera" — zero nie jest dodatnie.' },
    ],
    commonErrors: [],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-arr-2',
    skillId: 'cs-arrays',
    kind: 'typical',
    prompt:
      'Napisz funkcję zwracającą największy element tablicy. Dla tablicy pustej zwróć $null$.',
    format: 'code',
    answer: 'maksimum tablicy',
    acceptedVariants: [],
    code: {
      functionName: 'maksimum',
      signature: 'maksimum(t: number[]): number | null',
      starterCode: 'function maksimum(t) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'kilka liczb', input: [[3, 1, 2]], expected: 3 },
        { name: 'same ujemne', input: [[-5, -2, -9]], expected: -2 },
        { name: 'tablica pusta', input: [[]], expected: null, hidden: true },
        { name: 'jeden element', input: [[7]], expected: 7, hidden: true },
      ],
    },
    solution:
      'Inicjujemy wynik pierwszym elementem (nie zerem!) i porównujemy z kolejnymi. Pustą tablicę obsługujemy osobno, zwracając null.',
    hints: [
      { level: 1, text: 'Czym zainicjujesz zmienną na maksimum?' },
      {
        level: 2,
        text: 'Inicjowanie zerem psuje wynik dla tablicy samych liczb ujemnych.',
      },
      { level: 3, text: 'Bezpiecznie jest zacząć od pierwszego elementu tablicy.' },
      { level: 5, text: 'Zanim sięgniesz po pierwszy element, sprawdź, czy tablica nie jest pusta.' },
    ],
    commonErrors: [],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-arr-3',
    skillId: 'cs-arrays',
    kind: 'typical',
    prompt:
      'Ile porównań wykonuje algorytm wyznaczania maksimum przez jeden przebieg tablicy $10$-elementowej?',
    format: 'numeric',
    answer: '9',
    acceptedVariants: [],
    solution:
      'Pierwszy element przyjmujemy jako początkowe maksimum, a z każdym z pozostałych porównujemy raz: $10 - 1 = 9$ porównań.',
    hints: [
      { level: 1, text: 'Czy pierwszy element z czymkolwiek porównujesz?' },
      { level: 2, text: 'Pierwszy element jest punktem odniesienia, nie porównaniem.' },
      { level: 3, text: 'Porównań jest tyle, ile pozostałych elementów.' },
      { level: 5, text: 'Odejmij jeden od długości tablicy.' },
    ],
    commonErrors: [
      {
        id: 'cs-porownania-o-jeden-za-duzo',
        matches: ['10'],
        cause: 'Policzony także pierwszy element, który nie jest z niczym porównywany.',
        rule: 'Przy jednym przebiegu porównań jest o jedno mniej niż elementów.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-arr-4',
    skillId: 'cs-arrays',
    kind: 'transfer',
    prompt:
      'Napisz funkcję zwracającą drugą co do wielkości RÓŻNĄ wartość w tablicy. Jeśli taka nie istnieje, zwróć $null$.',
    format: 'code',
    answer: 'drugie najwieksze',
    acceptedVariants: [],
    code: {
      functionName: 'drugieNajwieksze',
      signature: 'drugieNajwieksze(t: number[]): number | null',
      starterCode: 'function drugieNajwieksze(t) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'trzy rozne', input: [[1, 2, 3]], expected: 2 },
        { name: 'powtorzone maksimum', input: [[5, 5, 3]], expected: 3 },
        { name: 'jeden element', input: [[7]], expected: null, hidden: true },
        { name: 'same identyczne', input: [[2, 2, 2]], expected: null, hidden: true },
        { name: 'ujemne', input: [[-1, -3, -2]], expected: -2, hidden: true },
      ],
    },
    solution:
      'Trzymamy dwie zmienne: największą i drugą największą. Aktualizujemy je tylko wtedy, gdy nowa wartość jest RÓŻNA od dotychczasowego maksimum — inaczej powtórzone maksimum zostanie uznane za drugi wynik.',
    hints: [
      { level: 1, text: 'Co powinno się stać, gdy największa wartość powtarza się w tablicy?' },
      {
        level: 2,
        text: 'Powtórzone maksimum nie jest drugą co do wielkości wartością.',
      },
      { level: 3, text: 'Prowadź dwie zmienne i aktualizuj je tylko dla wartości różnych.' },
      {
        level: 5,
        text: 'Gdy po przejściu tablicy druga zmienna nigdy nie została ustawiona, wynikiem jest null.',
      },
    ],
    commonErrors: [],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- cs-search-sort ---------------------------------------------------
  {
    id: 'q-cs-ss-1',
    skillId: 'cs-search-sort',
    kind: 'foundation',
    prompt:
      'Ile porównań w najgorszym przypadku wykonuje wyszukiwanie binarne w posortowanej tablicy $1024$-elementowej?',
    format: 'numeric',
    answer: '10',
    acceptedVariants: [],
    solution:
      'Każde porównanie połowi zakres, więc liczba kroków to $\\log_2 1024 = 10$.',
    hints: [
      { level: 1, text: 'O ile zmniejsza się zakres po każdym porównaniu?' },
      { level: 2, text: 'Zakres jest połowiony, więc liczba kroków rośnie logarytmicznie.' },
      { level: 3, text: 'Szukasz wykładnika, do którego trzeba podnieść dwójkę.' },
      { level: 5, text: 'Wypisz kolejne potęgi dwójki i znajdź tę równą długości tablicy.' },
    ],
    commonErrors: [
      {
        id: 'cs-binarne-liniowo',
        matches: ['1024', '1023'],
        cause: 'Policzone jak dla wyszukiwania liniowego — pominięte połowienie zakresu.',
        rule: 'Wyszukiwanie binarne ma złożoność logarytmiczną, nie liniową.',
      },
      {
        id: 'cs-binarne-polowa',
        matches: ['512'],
        cause: 'Zakres połowiony tylko raz zamiast wielokrotnie.',
        rule: 'Połowienie powtarza się aż do jednego elementu.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-ss-2',
    skillId: 'cs-search-sort',
    kind: 'typical',
    prompt:
      'Napisz wyszukiwanie binarne: funkcja dostaje posortowaną niemalejąco tablicę i szukaną wartość, a zwraca jej indeks albo $-1$.',
    format: 'code',
    answer: 'wyszukiwanie binarne',
    acceptedVariants: [],
    code: {
      functionName: 'wyszukajBinarnie',
      signature: 'wyszukajBinarnie(t: number[], x: number): number',
      starterCode:
        'function wyszukajBinarnie(t, x) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'element w srodku', input: [[1, 3, 5, 7], 5], expected: 2 },
        { name: 'element pierwszy', input: [[1, 3, 5, 7], 1], expected: 0 },
        { name: 'brak elementu', input: [[1, 3, 5, 7], 2], expected: -1 },
        { name: 'tablica pusta', input: [[], 1], expected: -1, hidden: true },
        { name: 'jeden element trafiony', input: [[2], 2], expected: 0, hidden: true },
        { name: 'element ostatni', input: [[1, 3, 5, 7], 7], expected: 3, hidden: true },
      ],
    },
    solution:
      'Trzymamy dwa wskaźniki: lewy i prawy. W pętli liczymy środek, porównujemy i zawężamy zakres. Pętla działa, dopóki lewy nie przekroczy prawego — warunek ze znakiem ostrym pomija przypadek jednoelementowy.',
    hints: [
      { level: 1, text: 'Jaki warunek zakończenia pętli obsługuje zakres jednoelementowy?' },
      {
        level: 2,
        text: 'Pętla musi działać także wtedy, gdy lewy i prawy wskaźnik są równe.',
      },
      { level: 3, text: 'Warunek to „lewy mniejszy lub równy prawemu".' },
      {
        level: 5,
        text: 'Po porównaniu przesuwaj wskaźnik o jeden za środek, inaczej pętla się zapętli.',
      },
    ],
    commonErrors: [],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-ss-3',
    skillId: 'cs-search-sort',
    kind: 'typical',
    prompt:
      'Napisz funkcję sprawdzającą, czy tablica jest posortowana niemalejąco. Tablica pusta jest posortowana.',
    format: 'code',
    answer: 'czy posortowana',
    acceptedVariants: [],
    code: {
      functionName: 'czyPosortowana',
      signature: 'czyPosortowana(t: number[]): boolean',
      starterCode: 'function czyPosortowana(t) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'rosnaca', input: [[1, 2, 3]], expected: true },
        { name: 'z powtorzeniem', input: [[1, 2, 2, 3]], expected: true },
        { name: 'malejaca', input: [[3, 1]], expected: false },
        { name: 'tablica pusta', input: [[]], expected: true, hidden: true },
        { name: 'jeden element', input: [[5]], expected: true, hidden: true },
      ],
    },
    solution:
      'Porównujemy każdą parę sąsiadów. Wystarczy jeden przebieg; przy pierwszej parze w złej kolejności zwracamy fałsz. Niemalejąco znaczy, że równe sąsiednie wartości są dozwolone.',
    hints: [
      { level: 1, text: 'Czy dwie równe sąsiednie wartości łamią porządek niemalejący?' },
      { level: 2, text: 'Nie łamią — zabroniony jest dopiero spadek.' },
      { level: 3, text: 'Porównuj sąsiadów i szukaj pary, w której następny jest mniejszy.' },
      {
        level: 5,
        text: 'Pętla musi zatrzymać się o jeden przed końcem, bo sięgasz po element następny.',
      },
    ],
    commonErrors: [],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-ss-4',
    skillId: 'cs-search-sort',
    kind: 'transfer',
    prompt:
      'Napisz funkcję scalającą dwie posortowane niemalejąco tablice w jedną posortowaną, bez użycia gotowego sortowania.',
    format: 'code',
    answer: 'scalanie posortowanych',
    acceptedVariants: [],
    code: {
      functionName: 'scalPosortowane',
      signature: 'scalPosortowane(a: number[], b: number[]): number[]',
      starterCode: 'function scalPosortowane(a, b) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'naprzemiennie', input: [[1, 3], [2, 4]], expected: [1, 2, 3, 4] },
        { name: 'jedna pusta', input: [[], [1, 2]], expected: [1, 2] },
        { name: 'obie puste', input: [[], []], expected: [] },
        { name: 'powtorzenia', input: [[1, 1], [1]], expected: [1, 1, 1], hidden: true },
        {
          name: 'rozne dlugosci',
          input: [[1, 2, 3], [10]],
          expected: [1, 2, 3, 10],
          hidden: true,
        },
      ],
    },
    solution:
      'Idziemy dwoma wskaźnikami równocześnie i za każdym razem bierzemy mniejszy z dostępnych elementów. Gdy jedna tablica się skończy, dopisujemy resztę drugiej — o tym kroku najłatwiej zapomnieć.',
    hints: [
      { level: 1, text: 'Co zrobić, gdy jedna z tablic skończy się wcześniej?' },
      { level: 2, text: 'Resztę dłuższej tablicy trzeba dopisać w całości.' },
      { level: 3, text: 'Prowadź dwa wskaźniki i w każdym kroku wybieraj mniejszy element.' },
      {
        level: 5,
        text: 'Po głównej pętli dodaj dwie pętle dopisujące pozostałości obu tablic.',
      },
    ],
    commonErrors: [],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },

  // --- cs-numbers -------------------------------------------------------
  {
    id: 'q-cs-num-1',
    skillId: 'cs-numbers',
    kind: 'foundation',
    prompt:
      'Zaimplementuj algorytm Euklidesa: funkcja zwraca największy wspólny dzielnik dwóch liczb nieujemnych.',
    format: 'code',
    answer: 'algorytm Euklidesa',
    acceptedVariants: [],
    code: {
      functionName: 'nwd',
      signature: 'nwd(a: number, b: number): number',
      starterCode: 'function nwd(a, b) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'typowy przypadek', input: [12, 18], expected: 6 },
        { name: 'liczby wzglednie pierwsze', input: [7, 13], expected: 1 },
        { name: 'jedna dzieli druga', input: [10, 5], expected: 5 },
        { name: 'zero jako argument', input: [0, 5], expected: 5, hidden: true },
        { name: 'oba rowne', input: [8, 8], expected: 8, hidden: true },
      ],
    },
    solution:
      'Dopóki druga liczba jest różna od zera, zastępujemy parę $(a, b)$ parą $(b, a \\bmod b)$. Gdy druga liczba osiągnie zero, wynikiem jest pierwsza.',
    hints: [
      { level: 1, text: 'Jaki warunek kończy algorytm Euklidesa?' },
      { level: 2, text: 'Zatrzymujesz się, gdy reszta z dzielenia wyniesie zero.' },
      { level: 3, text: 'W każdym kroku para $(a, b)$ staje się parą $(b, a \\bmod b)$.' },
      { level: 5, text: 'Po zakończeniu pętli wynikiem jest ta liczba, która nie jest zerem.' },
    ],
    commonErrors: [],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-num-2',
    skillId: 'cs-numbers',
    kind: 'typical',
    prompt: 'Zapisz liczbę $13$ w systemie dwójkowym.',
    format: 'exact-text',
    answer: '1101',
    acceptedVariants: ['(1101)2', '1101(2)'],
    solution: '$13 = 8 + 4 + 1 = 1\\cdot 2^3 + 1\\cdot 2^2 + 0\\cdot 2^1 + 1\\cdot 2^0$, czyli $1101_{(2)}$.',
    hints: [
      { level: 1, text: 'Które potęgi dwójki sumują się do tej liczby?' },
      { level: 2, text: 'Rozłóż liczbę na sumę różnych potęg dwójki.' },
      { level: 3, text: 'Każda użyta potęga daje jedynkę na swojej pozycji, pozostałe zero.' },
      { level: 5, text: 'Pozycje liczymy od prawej, zaczynając od $2^0$.' },
    ],
    commonErrors: [
      {
        id: 'cs-binarny-odwrocony',
        matches: ['1011'],
        cause: 'Cyfry zapisane w odwrotnej kolejności — od najmniej znaczącej.',
        rule: 'W zapisie pozycyjnym najbardziej znacząca cyfra stoi po lewej.',
      },
      {
        id: 'cs-binarny-pominiete-zero',
        matches: ['111'],
        cause: 'Pominięta pozycja o wartości zero.',
        rule: 'Każda pozycja między najstarszą a najmłodszą musi mieć swoją cyfrę.',
      },
    ],
    difficulty: 2,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-num-3',
    skillId: 'cs-numbers',
    kind: 'typical',
    prompt:
      'Napisz funkcję sprawdzającą, czy liczba całkowita jest pierwsza. Liczby mniejsze od $2$ nie są pierwsze.',
    format: 'code',
    answer: 'test pierwszosci',
    acceptedVariants: [],
    code: {
      functionName: 'czyPierwsza',
      signature: 'czyPierwsza(n: number): boolean',
      starterCode: 'function czyPierwsza(n) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'najmniejsza pierwsza', input: [2], expected: true },
        { name: 'zlozona', input: [9], expected: false },
        { name: 'jeden', input: [1], expected: false },
        { name: 'zero i ujemne', input: [0], expected: false, hidden: true },
        { name: 'wieksza pierwsza', input: [97], expected: true, hidden: true },
        { name: 'kwadrat pierwszej', input: [49], expected: false, hidden: true },
      ],
    },
    solution:
      'Odrzucamy liczby mniejsze od dwóch, a potem sprawdzamy dzielniki od $2$ do $\\sqrt{n}$. Sprawdzanie do $n$ też daje poprawny wynik, ale jest niepotrzebnie wolne.',
    hints: [
      { level: 1, text: 'Do jakiej wartości trzeba sprawdzać dzielniki?' },
      { level: 2, text: 'Większy dzielnik zawsze ma parę mniejszą od pierwiastka z liczby.' },
      { level: 3, text: 'Wystarczy sprawdzać dzielniki do pierwiastka kwadratowego z $n$.' },
      { level: 5, text: 'Nie zapomnij osobno odrzucić liczb mniejszych od dwóch.' },
    ],
    commonErrors: [],
    difficulty: 3,
    source: 'FORGE / autorskie',
    verified: false,
  },
  {
    id: 'q-cs-num-4',
    skillId: 'cs-numbers',
    kind: 'transfer',
    prompt:
      'Napisz funkcję zamieniającą nieujemną liczbę całkowitą na jej zapis dwójkowy jako tekst. Dla zera wynikiem jest $"0"$.',
    format: 'code',
    answer: 'konwersja na dwojkowy',
    acceptedVariants: [],
    code: {
      functionName: 'naDwojkowy',
      signature: 'naDwojkowy(n: number): string',
      starterCode: 'function naDwojkowy(n) {\n  // Twoje rozwiązanie\n}\n',
      tests: [
        { name: 'piec', input: [5], expected: '101' },
        { name: 'trzynascie', input: [13], expected: '1101' },
        { name: 'zero', input: [0], expected: '0', hidden: true },
        { name: 'jeden', input: [1], expected: '1', hidden: true },
        { name: 'potega dwojki', input: [8], expected: '1000', hidden: true },
      ],
    },
    solution:
      'Dzielimy liczbę przez dwa, zbierając reszty, a na końcu odwracamy kolejność. Zero wymaga osobnego przypadku, bo pętla „dopóki liczba większa od zera" nie wykona się ani razu.',
    hints: [
      { level: 1, text: 'Co zwróci twoja pętla, gdy dostanie zero?' },
      {
        level: 2,
        text: 'Pętla „dopóki liczba większa od zera" nie wykona się dla zera ani razu.',
      },
      { level: 3, text: 'Zbieraj reszty z dzielenia przez dwa, a na końcu odwróć kolejność.' },
      { level: 5, text: 'Przypadek zera obsłuż osobno, zanim wejdziesz w pętlę.' },
    ],
    commonErrors: [],
    difficulty: 4,
    source: 'FORGE / autorskie',
    verified: false,
  },
];

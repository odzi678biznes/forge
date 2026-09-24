import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 5: techniki algorytmiczne.
 *
 * Podstawa programowa 2024: I.R1 (podejście zachłanne, rekurencja),
 * I.R3 (metoda wstępująca i zstępująca), I.2d (ciąg Fibonacciego
 * iteracyjnie), I+II.1j (fraktale rekurencyjnie), I+II.2c (podciągi
 * o różnych własnościach), I+II.3b (rekurencja), I+II.3d (zachłanne:
 * wydawanie reszty, najkrótsza droga), I+II.3e (programowanie dynamiczne:
 * najdłuższy wspólny podciąg).
 */

export const TECH_TOPIC: Topic = {
  id: 'cs-techniques',
  subjectId: 'cs',
  name: 'Techniki algorytmiczne',
  summary: 'Rekurencja i fraktale, metoda zachłanna, programowanie dynamiczne i szukanie podciągów o zadanych własnościach.',
};

const DYWAN_3 = [
  '###########################',
  '#.##.##.##.##.##.##.##.##.#',
  '###########################',
  '###...######...######...###',
  '#.#...#.##.#...#.##.#...#.#',
  '###...######...######...###',
  '###########################',
  '#.##.##.##.##.##.##.##.##.#',
  '###########################',
  '#########.........#########',
  '#.##.##.#.........#.##.##.#',
  '#########.........#########',
  '###...###.........###...###',
  '#.#...#.#.........#.#...#.#',
  '###...###.........###...###',
  '#########.........#########',
  '#.##.##.#.........#.##.##.#',
  '#########.........#########',
  '###########################',
  '#.##.##.##.##.##.##.##.##.#',
  '###########################',
  '###...######...######...###',
  '#.#...#.##.#...#.##.#...#.#',
  '###...######...######...###',
  '###########################',
  '#.##.##.##.##.##.##.##.##.#',
  '###########################',
];

export const TECH_SKILLS: Skill[] = [
  {
    id: 'cs-recursion',
    topicId: 'cs-techniques',
    name: 'Rekurencja i fraktale',
    level: 'PR',
    ckeRequirement: 'Rekurencja (ciągi, potęgowanie, fraktale), metoda zstępująca, Fibonacci iteracyjnie (I+II.3b, I+II.1j, I.R3, I.2d)',
    prerequisites: ['cs-gcd', 'cs-sort-advanced'],
    examValue: 0.8,
  },
  {
    id: 'cs-greedy',
    topicId: 'cs-techniques',
    name: 'Metoda zachłanna',
    level: 'PR',
    ckeRequirement: 'Podejście zachłanne: wydawanie reszty, wybór zadań, najkrótsza droga (I.R1, I+II.3d)',
    prerequisites: ['cs-search-sort'],
    examValue: 0.7,
  },
  {
    id: 'cs-dp',
    topicId: 'cs-techniques',
    name: 'Programowanie dynamiczne',
    level: 'PR',
    ckeRequirement: 'Programowanie dynamiczne, najdłuższy wspólny podciąg, metoda wstępująca (I+II.3e, I.R3)',
    prerequisites: ['cs-recursion', 'cs-greedy'],
    examValue: 0.75,
  },
  {
    id: 'cs-subseq',
    topicId: 'cs-techniques',
    name: 'Podciągi o zadanych własnościach',
    level: 'PR',
    ckeRequirement: 'Najdłuższy spójny podciąg niemalejący, spójny podciąg o największej sumie i podobne (I+II.2c)',
    prerequisites: ['cs-arrays', 'cs-dp'],
    examValue: 0.9,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const TECH_LESSONS: Lesson[] = [
  {
    skillId: 'cs-recursion',
    minutes: 15,
    intro:
      'Funkcja rekurencyjna rozwiązuje problem, wywołując samą siebie dla mniejszego przypadku — aż dojdzie do przypadku tak małego, że odpowiedź jest oczywista (warunek stopu). To metoda zstępująca: od całego problemu w dół do najprostszego.',
    blocks: [
      listing('def silnia(n):\n    if n == 0:              # warunek stopu\n        return 1\n    return n * silnia(n - 1)   # mniejszy przypadek'),
      p('Rekurencja bywa kosztowna: naiwne `fib(n) = fib(n - 1) + fib(n - 2)` liczy te same wartości wiele razy i wykonuje wykładniczo wiele wywołań. Wersja iteracyjna (metoda wstępująca: od $F_0$, $F_1$ w górę) potrzebuje n kroków.'),
      listing('def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a'),
      p('Fraktal to figura zbudowana z pomniejszonych kopii samej siebie — naturalny przykład rekurencji. Dywan Sierpińskiego rzędu n to 3 × 3 kopie dywanu rzędu n − 1 z pustym środkiem.'),
      tip('Zanim napiszesz funkcję rekurencyjną, odpowiedz na dwa pytania: jaki jest najmniejszy przypadek i jak z rozwiązania mniejszego zbudować większe.'),
      warn('Brak warunku stopu albo wywołanie dla NIE mniejszego argumentu kończy się błędem `RecursionError` — Python przerywa po około tysiącu zagłębień.'),
    ],
    examples: [
      example(
        'Ile wywołań wykona naiwne rekurencyjne fib(4)?',
        [['fib(4) woła fib(3) i fib(2); fib(3) woła fib(2) i fib(1); każde fib(2) woła fib(1) i fib(0).', 'rysuj drzewo wywołań'], 'Liczba węzłów drzewa: 1 + 5 + 3.'],
        '9',
      ),
      example(
        'Ile ruchów potrzeba w wieżach Hanoi dla 3 krążków?',
        ['Przenieś 2 krążki na bok (3 ruchy), największy na cel (1), 2 krążki na cel (3).', 'Ogólnie $2^n - 1$.'],
        '7',
      ),
    ],
    pitfalls: ['Brak warunku stopu.', 'Naiwna rekurencja tam, gdzie potrzebna iteracja albo zapamiętywanie.', 'Zapomniany `return` przed wywołaniem rekurencyjnym.'],
  },
  {
    skillId: 'cs-greedy',
    minutes: 13,
    intro:
      'Algorytm zachłanny w każdym kroku bierze to, co w tej chwili wygląda najlepiej, i nigdy się nie cofa. Jest prosty i szybki — ale daje optimum tylko dla niektórych problemów. Umiejętność polega na rozpoznaniu, kiedy.',
    blocks: [
      listing('def reszta(kwota, nominaly):     # nominały malejąco\n    monety = 0\n    for m in nominaly:\n        monety += kwota // m\n        kwota %= m\n    return monety'),
      p('Dla polskich nominałów wydawanie zachłanne jest optymalne. Dla nominałów {1, 3, 4} i kwoty 6 już nie: zachłannie 4 + 1 + 1 (3 monety), a optimum to 3 + 3 (2 monety). Wtedy potrzebne jest programowanie dynamiczne.'),
      p('Wybór zajęć: z przedziałów czasu wybierz jak najwięcej rozłącznych. Zachłanna reguła „bierz zajęcie, które kończy się najwcześniej” jest optymalna — zostawia najwięcej miejsca na resztę.'),
      p('Algorytm Dijkstry szuka najkrótszych dróg od jednego wierzchołka w grafie z nieujemnymi wagami: zachłannie zatwierdza wierzchołek o najmniejszej znanej odległości i poprawia odległości jego sąsiadów.'),
      tip('Test na zachłanność: znajdź mały kontrprzykład. Jeśli po kilku próbach żadnego nie ma, a istnieje prosty argument „wymiany”, strategia jest pewnie dobra.'),
      warn('Zachłanne wydawanie reszty zakłada, że nominały są posortowane malejąco — inaczej wyniki są bez sensu.'),
    ],
    examples: [
      example(
        'Wydaj zachłannie 289 zł nominałami 200, 100, 50, 20, 10, 5, 2, 1.',
        ['200 → zostaje 89; 50 → 39; 20 → 19; 10 → 9; 5 → 4; 2 → 2; 2 → 0.', 'Policz użyte nominały.'],
        '7 monet i banknotów',
      ),
      example(
        'Zajęcia [1, 4], [3, 5], [0, 6], [5, 7], [8, 11]. Ile rozłącznych można wybrać?',
        [['Sortujesz po końcu i bierzesz, co pasuje.', 'najwcześniej kończące się zostawia najwięcej czasu'], '[1, 4], [5, 7], [8, 11].'],
        '3',
      ),
    ],
    pitfalls: ['Założenie, że zachłanność zawsze daje optimum.', 'Sortowanie zajęć po początku zamiast po końcu.', 'Nominały w złej kolejności.'],
  },
  {
    skillId: 'cs-dp',
    minutes: 16,
    intro:
      'Programowanie dynamiczne rozwiązuje problem przez rozwiązanie wszystkich mniejszych podproblemów RAZ i zapisanie wyników w tablicy. Działa, gdy optymalne rozwiązanie składa się z optymalnych rozwiązań podproblemów, a te się powtarzają.',
    blocks: [
      listing('def schody(n):          # na ile sposobów wejść po n stopniach, krokami 1 lub 2\n    d = [0] * (n + 1)\n    d[0] = 1\n    for i in range(1, n + 1):\n        d[i] = d[i - 1] + (d[i - 2] if i >= 2 else 0)\n    return d[n]', 'Metoda wstępująca: tablica od najmniejszych przypadków w górę.'),
      p('Najdłuższy wspólny podciąg (NWP) dwóch napisów: `d[i][j]` to długość NWP pierwszych i znaków a i pierwszych j znaków b. Jeśli `a[i-1] == b[j-1]`, to `d[i][j] = d[i-1][j-1] + 1`, w przeciwnym razie `max(d[i-1][j], d[i][j-1])`.'),
      listing('def nwp(a, b):\n    d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    for i in range(1, len(a) + 1):\n        for j in range(1, len(b) + 1):\n            if a[i - 1] == b[j - 1]:\n                d[i][j] = d[i - 1][j - 1] + 1\n            else:\n                d[i][j] = max(d[i - 1][j], d[i][j - 1])\n    return d[len(a)][len(b)]'),
      tip('Przepis na każde zadanie DP: (1) co oznacza komórka tablicy, (2) wzór na komórkę z mniejszych, (3) wartości początkowe, (4) kolejność wypełniania, (5) gdzie jest odpowiedź.'),
      warn('Tablicę dwuwymiarową twórz przez `[[0] * m for _ in range(n)]`. Zapis `[[0] * m] * n` tworzy n odwołań do TEJ SAMEJ listy.'),
    ],
    examples: [
      example(
        'Na ile sposobów można wejść na 5 stopni, stawiając kroki o 1 lub 2?',
        [['d[i] = d[i − 1] + d[i − 2]: ostatni krok to 1 albo 2 stopnie.', 'to ciąg Fibonacciego'], 'd = 1, 1, 2, 3, 5, 8.'],
        '8',
      ),
      example(
        'Jaka jest długość NWP napisów ABCBDAB i BDCABA?',
        ['Wypełniasz tablicę 8 × 7 według wzoru.', 'Przykładowy wspólny podciąg: BCBA.'],
        '4',
      ),
    ],
    pitfalls: ['`[[0] * m] * n` — wszystkie wiersze to ta sama lista.', 'Złe wartości początkowe (np. d[0] = 0 w liczeniu sposobów).', 'Odpowiedź odczytana z niewłaściwej komórki.'],
  },
  {
    skillId: 'cs-subseq',
    minutes: 14,
    intro:
      'Zadania o podciągach pojawiają się na maturze prawie co roku: najdłuższy fragment rosnący, fragment o największej sumie, najdłuższy fragment o jakiejś własności. Klucz: jedno przejście po danych z pamiętaniem „bieżącego” fragmentu i najlepszego dotąd.',
    blocks: [
      listing('def najdluzszy_niemalejacy(t):\n    if not t:\n        return 0\n    dl = najdl = 1\n    for i in range(1, len(t)):\n        if t[i] >= t[i - 1]:\n            dl += 1           # fragment trwa\n        else:\n            dl = 1            # zaczyna się nowy\n        najdl = max(najdl, dl)\n    return najdl'),
      p('Spójny fragment o największej sumie (algorytm Kadanego): suma bieżąca to najlepsza suma fragmentu kończącego się na obecnym elemencie. Albo przedłużasz poprzedni fragment, albo zaczynasz od nowa — wybierasz to, co większe.'),
      listing('def max_suma(t):\n    najlepsza = biezaca = t[0]\n    for x in t[1:]:\n        biezaca = max(x, biezaca + x)\n        najlepsza = max(najlepsza, biezaca)\n    return najlepsza'),
      tip('„Spójny” (fragment) to kolejne elementy bez przerw. „Podciąg” bez tego słowa może przeskakiwać elementy — to zupełnie inny, trudniejszy problem.'),
      warn('Gdy wszystkie liczby są ujemne, największa suma to największy element — a nie 0. Dlatego Kadane startuje od `t[0]`, a nie od zera.'),
    ],
    examples: [
      example(
        'Najdłuższy spójny fragment niemalejący w [1, 2, 2, 3, 1, 4, 5, 6, 0]?',
        ['Fragmenty: 1, 2, 2, 3 (długość 4), potem 1, 4, 5, 6 (długość 4), potem 0.', 'Najdłuższy ma 4 elementy.'],
        '4',
      ),
      example(
        'Największa suma spójnego fragmentu [−2, 1, −3, 4, −1, 2, 1, −5, 4]?',
        [['Fragment 4, −1, 2, 1.', 'suma bieżąca po −3 spada poniżej 4, więc od 4 zaczyna się nowy fragment'], 'Suma: 6.'],
        '6',
      ),
    ],
    pitfalls: ['Pomylenie fragmentu spójnego z podciągiem.', 'Start sumy od 0 przy samych ujemnych liczbach.', 'Zapomniana aktualizacja najlepszego wyniku po ostatnim elemencie.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const TECH_QUESTIONS: Question[] = [
  // cs-recursion --------------------------------------------------------------
  numeric({
    id: 'tc-r-1',
    skill: 'cs-recursion',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'def f(n):\n    if n == 0:\n        return 0\n    return n + f(n - 1)\n\nprint(f(5))',
    answer: 15,
    verify: () => 5 + 4 + 3 + 2 + 1,
    hints: ['Co zwraca f(0)?', 'Zero — to warunek stopu.', 'f(n) to n plus wynik dla n − 1.', 'Rozwiń: f(5) = 5 + f(4) = 5 + 4 + f(3) = …'],
    steps: ['f(5) = 5 + 4 + 3 + 2 + 1 + f(0).', 'Wynik: 15.'],
    errors: [['10', 'Pominięte n = 5.', 'Pierwszy składnik to samo n.']],
  }),
  choice({
    id: 'tc-r-2',
    skill: 'cs-recursion',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Funkcja `def g(n): return n * g(n - 1)` nie ma warunku stopu. Co się stanie po wywołaniu `g(3)`?',
    choices: [
      'program przerwie błąd przekroczenia głębokości rekurencji',
      'funkcja zwróci 6',
      'funkcja zwróci 0',
      'program będzie działał w nieskończoność bez błędu',
    ],
    answer: 'A',
    hints: ['Kiedy ta funkcja przestaje wywoływać samą siebie?', 'Nigdy — dla każdego n woła g(n − 1).', 'Każde wywołanie zajmuje miejsce na stosie.', 'Python ma limit zagłębienia (około 1000).'],
    steps: ['Wywołania idą w dół bez końca: g(3), g(2), g(1), g(0), g(−1), …', 'Po przekroczeniu limitu Python zgłasza `RecursionError`.'],
    errors: [
      ['B', 'Założony niejawny warunek stopu przy 1.', 'Bez `if` funkcja nie zatrzyma się sama.'],
      ['C', 'Wywołanie g(0) nie zwraca 0 — też woła dalej.', 'Nie ma żadnego `return` bez rekurencji.'],
      ['D', 'Pominięty limit stosu.', 'Każde wywołanie zużywa pamięć — Python przerywa błędem.'],
    ],
  }),
  pyTask({
    id: 'tc-r-3',
    skill: 'cs-recursion',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `fib(n)`, która ITERACYJNIE zwraca n-ty wyraz ciągu Fibonacciego ($F_0 = 0$, $F_1 = 1$). Ukryte testy mają n = 70 — naiwna rekurencja nie zdąży.',
    functionName: 'fib',
    params: ['n'],
    types: 'int ≥ 0 -> int',
    tests: [
      { name: 'zero', input: [0], expected: 0 },
      { name: 'jeden', input: [1], expected: 1 },
      { name: 'dziesięć', input: [10], expected: 55 },
      { name: 'pięćdziesiąt', input: [50], expected: 12586269025, hidden: true },
      { name: 'siedemdziesiąt', input: [70], expected: 190392490709135, hidden: true },
    ],
    model: `
      def fib(n):
          a, b = 0, 1
          for _ in range(n):
              a, b = b, a + b
          return a
    `,
    hints: ['Ile poprzednich wyrazów potrzeba do policzenia następnego?', 'Dwóch.', 'Trzymaj dwie zmienne a, b i przesuwaj je: `a, b = b, a + b`.', 'Po n krokach a to $F_n$.'],
    steps: ['Start: a = F₀ = 0, b = F₁ = 1.', 'n razy `a, b = b, a + b`; wynik to a.'],
  }),
  numeric({
    id: 'tc-r-4',
    skill: 'cs-recursion',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ile razy łącznie zostanie wywołana funkcja `fib` przy obliczaniu `fib(5)` (licząc pierwsze wywołanie)?',
    listing: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)',
    answer: 15,
    verify: () => {
      const calls = (n: number): number => (n < 2 ? 1 : 1 + calls(n - 1) + calls(n - 2));
      return calls(5);
    },
    hints: ['Ile wywołań wykonuje fib(0) i fib(1)?', 'Po jednym — kończą się od razu.', 'Dla n ≥ 2: wywołania(n) = 1 + wywołania(n − 1) + wywołania(n − 2).', 'Policz kolejno dla n = 2, 3, 4, 5.'],
    steps: ['Wywołania: n = 0, 1 → 1; n = 2 → 3; n = 3 → 5; n = 4 → 9.', 'n = 5 → 1 + 9 + 5 = 15.'],
    errors: [['5', 'Podany wynik fib(5), a nie liczba wywołań.', 'Pytanie dotyczy liczby wywołań funkcji.']],
  }),
  pyTask({
    id: 'tc-r-5',
    skill: 'cs-recursion',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Wieże Hanoi: n krążków trzeba przenieść z pręta A na C, używając B, nigdy nie kładąc większego na mniejszy. Napisz rekurencyjną funkcję `hanoi(n)`, która zwraca listę ruchów w postaci napisów „A->C” w kolejności klasycznego algorytmu: przenieś n − 1 krążków na pręt pomocniczy, największy na cel, n − 1 krążków na cel.',
    functionName: 'hanoi',
    params: ['n'],
    types: 'int ≥ 1 -> list[str]',
    tests: [
      { name: 'jeden krążek', input: [1], expected: ['A->C'] },
      { name: 'dwa krążki', input: [2], expected: ['A->B', 'A->C', 'B->C'] },
      { name: 'trzy krążki', input: [3], expected: ['A->C', 'A->B', 'C->B', 'A->C', 'B->A', 'B->C', 'A->C'] },
      {
        name: 'cztery krążki',
        input: [4],
        expected: ['A->B', 'A->C', 'B->C', 'A->B', 'C->A', 'C->B', 'A->B', 'A->C', 'B->C', 'B->A', 'C->A', 'B->C', 'A->B', 'A->C', 'B->C'],
        hidden: true,
      },
    ],
    model: `
      def przenies(n, z, na, przez, ruchy):
          if n == 0:
              return
          przenies(n - 1, z, przez, na, ruchy)
          ruchy.append(z + "->" + na)
          przenies(n - 1, przez, na, z, ruchy)

      def hanoi(n):
          ruchy = []
          przenies(n, "A", "C", "B", ruchy)
          return ruchy
    `,
    hints: ['Jakie parametry opisują pojedyncze zadanie przeniesienia?', 'Liczba krążków, pręt źródłowy, docelowy i pomocniczy.', 'Funkcja pomocnicza `przenies(n, z, na, przez, ruchy)` dopisuje ruchy do listy.', 'Dla n = 0 nic nie robi; inaczej: n − 1 na pomocniczy, ruch, n − 1 na cel.'],
    steps: ['przenies(n − 1, z → przez), ruch „z->na”, przenies(n − 1, przez → na).', 'Warunek stopu: n = 0; główna funkcja woła przenies(n, A, C, B).'],
  }),
  pyTask({
    id: 'tc-r-6',
    skill: 'cs-recursion',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `permutacje(s)`, która zwraca rosnąco posortowaną listę wszystkich RÓŻNYCH permutacji znaków napisu s. Dla pustego napisu wynik to `[""]`.',
    functionName: 'permutacje',
    params: ['s'],
    types: 'str -> list[str]',
    tests: [
      { name: 'dwa znaki', input: ['ab'], expected: ['ab', 'ba'] },
      { name: 'trzy znaki', input: ['abc'], expected: ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'] },
      { name: 'powtórzenie', input: ['aab'], expected: ['aab', 'aba', 'baa'] },
      { name: 'pusty', input: [''], expected: [''], hidden: true },
      {
        name: 'cztery znaki',
        input: ['abcd'],
        expected: ['abcd', 'abdc', 'acbd', 'acdb', 'adbc', 'adcb', 'bacd', 'badc', 'bcad', 'bcda', 'bdac', 'bdca', 'cabd', 'cadb', 'cbad', 'cbda', 'cdab', 'cdba', 'dabc', 'dacb', 'dbac', 'dbca', 'dcab', 'dcba'],
        hidden: true,
      },
    ],
    model: `
      def permutacje(s):
          if len(s) <= 1:
              return [s]
          wynik = set()
          for i in range(len(s)):
              for reszta in permutacje(s[:i] + s[i + 1:]):
                  wynik.add(s[i] + reszta)
          return sorted(wynik)
    `,
    hints: ['Jak zbudować permutacje napisu z permutacji krótszych napisów?', 'Wybierz pierwszy znak, a resztę permutuj rekurencyjnie.', 'Dla każdej pozycji i: znak `s[i]` + każda permutacja `s[:i] + s[i + 1:]`.', 'Powtórzenia usuń zbiorem i na końcu posortuj.'],
    steps: ['Warunek stopu: napis długości ≤ 1 ma jedną permutację.', 'Każdy znak po kolei idzie na początek, reszta permutowana rekurencyjnie; zbiór usuwa duplikaty.'],
  }),
  pyTask({
    id: 'tc-r-7',
    skill: 'cs-recursion',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Dywan Sierpińskiego rzędu 0 to jeden znak „#”. Dywan rzędu n to kwadrat 3 × 3 z dywanów rzędu n − 1, w którym środkowa kopia jest zastąpiona kropkami „.”. Napisz funkcję `dywan(n)`, która zwraca dywan jako listę wierszy (napisów).',
    functionName: 'dywan',
    params: ['n'],
    types: 'int ≥ 0 -> list[str]',
    tests: [
      { name: 'rząd 0', input: [0], expected: ['#'] },
      { name: 'rząd 1', input: [1], expected: ['###', '#.#', '###'] },
      {
        name: 'rząd 2',
        input: [2],
        expected: ['#########', '#.##.##.#', '#########', '###...###', '#.#...#.#', '###...###', '#########', '#.##.##.#', '#########'],
      },
      { name: 'rząd 3', input: [3], expected: DYWAN_3, hidden: true },
    ],
    model: `
      def dywan(n):
          if n == 0:
              return ["#"]
          m = dywan(n - 1)
          pusty = ["." * len(w) for w in m]
          wynik = []
          for rzad in [[m, m, m], [m, pusty, m], [m, m, m]]:
              for i in range(len(m)):
                  wynik.append(rzad[0][i] + rzad[1][i] + rzad[2][i])
          return wynik
    `,
    hints: ['Z czego składa się dywan rzędu n?', 'Z 9 bloków: 8 kopii dywanu rzędu n − 1 i pustego środka.', 'Wiersz wyniku to sklejenie odpowiednich wierszy trzech bloków obok siebie.', 'Pusty blok: tyle samo wierszy, każdy z samych kropek.'],
    steps: ['Rekurencyjnie budujesz dywan rzędu n − 1 i pusty blok tej samej wielkości.', 'Trzy pasy bloków: pełny-pełny-pełny, pełny-pusty-pełny, pełny-pełny-pełny; wiersze sklejasz.'],
  }),

  // cs-greedy -----------------------------------------------------------------
  numeric({
    id: 'tc-g-1',
    skill: 'cs-greedy',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program (zachłanne wydawanie 289 zł)?',
    listing: 'kwota = 289\nsztuk = 0\nfor m in [200, 100, 50, 20, 10, 5, 2, 1]:\n    sztuk += kwota // m\n    kwota %= m\nprint(sztuk)',
    answer: 7,
    verify: () => {
      let k = 289;
      let s = 0;
      for (const m of [200, 100, 50, 20, 10, 5, 2, 1]) {
        s += Math.floor(k / m);
        k %= m;
      }
      return s;
    },
    hints: ['Ile razy mieści się 200 w 289 i ile zostaje?', 'Raz, zostaje 89.', 'Dalej tak samo z kolejnymi nominałami.', 'Zlicz wszystkie użyte sztuki.'],
    steps: ['200 (zostaje 89), 50 (39), 20 (19), 10 (9), 5 (4), 2 + 2 (0).', 'Razem 7 sztuk.'],
    errors: [['6', 'Pominięta druga dwójka.', '4 zł to dwie monety 2 zł.']],
  }),
  choice({
    id: 'tc-g-2',
    skill: 'cs-greedy',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Nominały to 1, 3 i 4. Ile monet użyje algorytm zachłanny dla kwoty 6, a ile wynosi najmniejsza możliwa liczba monet?',
    choices: ['zachłanny 3, optimum 2', 'zachłanny 2, optimum 2', 'zachłanny 3, optimum 3', 'zachłanny 2, optimum 3'],
    answer: 'A',
    hints: ['Jaki nominał zachłanny weźmie jako pierwszy?', 'Największy mieszczący się: 4.', 'Zostaje 2 — da się je wydać tylko jedynkami.', 'A czy 6 da się złożyć z dwóch monet?'],
    steps: ['Zachłannie: 4 + 1 + 1 — trzy monety.', 'Optimum: 3 + 3 — dwie monety.'],
    errors: [
      ['B', 'Uznano, że zachłanny wybierze 3 + 3.', 'Zachłanny zaczyna od największego nominału, czyli 4.'],
      ['C', 'Przeoczone 3 + 3.', 'Dwie monety po 3 dają 6.'],
      ['D', 'Odwrócone wartości.', 'Optimum nigdy nie jest gorsze od wyniku zachłannego.'],
    ],
  }),
  pyTask({
    id: 'tc-g-3',
    skill: 'cs-greedy',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `reszta(kwota, nominaly)`, która zwraca liczbę monet przy zachłannym wydawaniu kwoty. Nominały są podane w kolejności malejącej i zawsze zawierają 1.',
    functionName: 'reszta',
    params: ['kwota', 'nominaly'],
    types: 'int ≥ 0, list[int] malejąco -> int',
    tests: [
      { name: 'złotówki', input: [289, [200, 100, 50, 20, 10, 5, 2, 1]], expected: 7 },
      { name: 'zero', input: [0, [5, 2, 1]], expected: 0 },
      { name: 'same jedynki', input: [4, [1]], expected: 4 },
      { name: 'inne nominały', input: [6, [4, 3, 1]], expected: 3, hidden: true },
      { name: 'duża kwota', input: [1000, [500, 200, 100, 50, 20, 10, 5, 2, 1]], expected: 2, hidden: true },
    ],
    model: `
      def reszta(kwota, nominaly):
          monety = 0
          for m in nominaly:
              monety += kwota // m
              kwota %= m
          return monety
    `,
    hints: ['Ile monet nominału m zmieści się w kwocie?', '`kwota // m`.', 'Po wydaniu ich zostaje `kwota % m`.', 'Przejdź po nominałach od największego, sumując liczbę monet.'],
    steps: ['Dla każdego nominału bierzesz `kwota // m` monet.', 'Kwota zmniejsza się do `kwota % m`.'],
  }),
  pyTask({
    id: 'tc-g-4',
    skill: 'cs-greedy',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Zajęcia to przedziały [początek, koniec]. Dwa zajęcia można wybrać razem, jeśli jedno kończy się nie później, niż zaczyna drugie. Napisz funkcję `zajecia(przedzialy)`, która zwraca największą liczbę zajęć do wybrania.',
    functionName: 'zajecia',
    params: ['przedzialy'],
    types: 'list[[int, int]] -> int',
    tests: [
      {
        name: 'klasyczny',
        input: [[[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]]],
        expected: 4,
      },
      { name: 'stykające się', input: [[[1, 2], [2, 3], [3, 4]]], expected: 3 },
      { name: 'brak', input: [[]], expected: 0 },
      { name: 'długie zajęcie', input: [[[1, 10], [2, 3], [4, 5]]], expected: 2, hidden: true },
      { name: 'nieposortowane', input: [[[5, 6], [1, 2], [3, 4]]], expected: 3, hidden: true },
    ],
    model: `
      def zajecia(przedzialy):
          wybrane = 0
          koniec = None
          for p, k in sorted(przedzialy, key=lambda z: z[1]):
              if koniec is None or p >= koniec:
                  wybrane += 1
                  koniec = k
          return wybrane
    `,
    hints: ['Które zajęcie opłaca się wybrać jako pierwsze?', 'To, które kończy się najwcześniej.', 'Posortuj po końcu: `sorted(p, key=lambda z: z[1])`.', 'Bierz kolejne zajęcie, jeśli zaczyna się nie wcześniej niż koniec ostatnio wybranego.'],
    steps: ['Sortujesz zajęcia według końca.', 'Zachłannie bierzesz każde, które nie koliduje z ostatnio wybranym.'],
  }),
  pyTask({
    id: 'tc-g-5',
    skill: 'cs-greedy',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Plecak ułamkowy: przedmioty można dzielić. Napisz funkcję `plecak_ulamkowy(wagi, wartosci, W)`, która zwraca największą wartość, jaką da się zmieścić w plecaku o pojemności W, zaokrągloną do 2 miejsc.',
    functionName: 'plecak_ulamkowy',
    params: ['wagi', 'wartosci', 'W'],
    types: 'list[int > 0], list[int], int ≥ 0 -> float',
    tests: [
      { name: 'klasyczny', input: [[10, 20, 30], [60, 100, 120], 50], expected: 240 },
      { name: 'wszystko się mieści', input: [[5], [10], 10], expected: 10 },
      { name: 'połowa przedmiotu', input: [[10], [20], 5], expected: 10 },
      { name: 'ułamek', input: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9.67, hidden: true },
      { name: 'pusty plecak', input: [[4, 4], [4, 8], 0], expected: 0, hidden: true },
    ],
    model: `
      def plecak_ulamkowy(wagi, wartosci, W):
          przedmioty = sorted(zip(wagi, wartosci), key=lambda p: p[1] / p[0], reverse=True)
          razem = 0
          for w, v in przedmioty:
              if W <= 0:
                  break
              wez = min(w, W)
              razem += v * wez / w
              W -= wez
          return round(razem, 2)
    `,
    hints: ['Który przedmiot jest „najcenniejszy” przy dzieleniu?', 'Ten o największej wartości na jednostkę wagi.', 'Sortuj malejąco po `wartosc / waga` i pakuj po kolei.', 'Ostatni przedmiot weź w takiej części, jaka się zmieści.'],
    steps: ['Sortujesz przedmioty malejąco po wartości na kilogram.', 'Pakujesz całe, a ostatni — ułamkowo, aż plecak się zapełni.'],
  }),
  pyTask({
    id: 'tc-g-6',
    skill: 'cs-greedy',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Samochód z pełnym bakiem przejeżdża R km. Na trasie długości D km stacje stoją w podanych (rosnąco) odległościach od startu. Napisz funkcję `tankowania(stacje, D, R)`, która zwraca najmniejszą liczbę tankowań (każde do pełna) potrzebną do dojechania albo -1.',
    functionName: 'tankowania',
    params: ['stacje', 'D', 'R'],
    types: 'list[int] rosnąco, int, int -> int',
    tests: [
      { name: 'dwa tankowania', input: [[2, 4, 6, 8], 10, 4], expected: 2 },
      { name: 'bez tankowania', input: [[], 5, 10], expected: 0 },
      { name: 'nie da się', input: [[3], 10, 4], expected: -1 },
      { name: 'wybór dalszej stacji', input: [[1, 2, 5, 9], 12, 5], expected: 2, hidden: true },
      { name: 'zasięg wystarcza', input: [[2, 5, 7], 7, 7], expected: 0, hidden: true },
    ],
    model: `
      def tankowania(stacje, D, R):
          pozycja = 0
          zasieg = R
          ile = 0
          i = 0
          while zasieg < D:
              najdalsza = None
              while i < len(stacje) and stacje[i] <= zasieg:
                  najdalsza = stacje[i]
                  i += 1
              if najdalsza is None or najdalsza <= pozycja:
                  return -1
              pozycja = najdalsza
              zasieg = pozycja + R
              ile += 1
          return ile
    `,
    hints: ['Na której stacji najlepiej zatankować, gdy paliwo się kończy?', 'Na najdalszej, do której jeszcze dojedziesz.', 'Pamiętaj bieżący zasięg; tankujesz dopiero, gdy nie sięga celu.', 'Jeśli w zasięgu nie ma żadnej nowej stacji — zwróć −1.'],
    steps: ['Dopóki zasięg < D, wybierasz najdalszą stację w zasięgu i tankujesz tam.', 'Brak nowej stacji w zasięgu oznacza, że nie da się dojechać.'],
  }),
  pyTask({
    id: 'tc-g-7',
    skill: 'cs-greedy',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Graf nieskierowany ma wierzchołki 0 … n − 1 i krawędzie `[u, v, waga]` z wagami nieujemnymi. Napisz funkcję `dijkstra(n, krawedzie, s)`, która zwraca listę najkrótszych odległości od s do każdego wierzchołka (-1 dla nieosiągalnych). Możesz użyć modułu `heapq`.',
    functionName: 'dijkstra',
    params: ['n', 'krawedzie', 's'],
    types: 'int, list[[int, int, int]], int -> list[int]',
    tests: [
      { name: 'objazd tańszy', input: [5, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]], 0], expected: [0, 3, 1, 4, 7] },
      { name: 'nieosiągalny', input: [3, [[0, 1, 5]], 0], expected: [0, 5, -1] },
      { name: 'jeden wierzchołek', input: [1, [], 0], expected: [0] },
      { name: 'start na końcu', input: [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 10]], 3], expected: [3, 2, 1, 0], hidden: true },
      {
        name: 'klasyczny',
        input: [6, [[0, 1, 7], [0, 2, 9], [0, 5, 14], [1, 2, 10], [1, 3, 15], [2, 3, 11], [2, 5, 2], [3, 4, 6], [4, 5, 9]], 0],
        expected: [0, 7, 9, 20, 20, 11],
        hidden: true,
      },
    ],
    model: `
      import heapq

      def dijkstra(n, krawedzie, s):
          sasiedzi = [[] for _ in range(n)]
          for u, v, w in krawedzie:
              sasiedzi[u].append((v, w))
              sasiedzi[v].append((u, w))
          odl = [None] * n
          kolejka = [(0, s)]
          while kolejka:
              d, u = heapq.heappop(kolejka)
              if odl[u] is not None:
                  continue
              odl[u] = d
              for v, w in sasiedzi[u]:
                  if odl[v] is None:
                      heapq.heappush(kolejka, (d + w, v))
          return [-1 if x is None else x for x in odl]
    `,
    hints: ['Który wierzchołek można zatwierdzić jako następny?', 'Ten o najmniejszej znanej odległości — lepszej drogi do niego już nie będzie.', 'Kolejka priorytetowa `heapq` z parami (odległość, wierzchołek).', 'Po zatwierdzeniu wierzchołka dodaj do kolejki jego sąsiadów z odległością d + waga.'],
    steps: ['Lista sąsiedztwa z krawędzi w obie strony; kolejka startuje od (0, s).', 'Zdejmujesz najbliższy niezatwierdzony wierzchołek, zatwierdzasz go i wrzucasz sąsiadów; niezatwierdzone → −1.'],
  }),

  // cs-dp ---------------------------------------------------------------------
  numeric({
    id: 'tc-d-1',
    skill: 'cs-dp',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'd = [0] * 6\nd[0] = 1\nd[1] = 1\nfor i in range(2, 6):\n    d[i] = d[i - 1] + d[i - 2]\nprint(d[5])',
    answer: 8,
    verify: () => {
      const d = [1, 1];
      for (let i = 2; i < 6; i += 1) d.push(d[i - 1]! + d[i - 2]!);
      return d[5]!;
    },
    hints: ['Jak liczona jest każda kolejna komórka?', 'Jako suma dwóch poprzednich.', 'Wypisz kolejno d[0], d[1], d[2], …', 'Ciąg zaczyna się od 1, 1.'],
    steps: ['d = 1, 1, 2, 3, 5, 8.', 'd[5] = 8.'],
    errors: [['5', 'Odczytany element o jeden za wcześnie.', 'd[5] to szósty element tablicy.']],
  }),
  choice({
    id: 'tc-d-2',
    skill: 'cs-dp',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Dlaczego obliczenie `fib(40)` z zapamiętywaniem wyników (tablicą) jest dużo szybsze niż naiwna rekurencja?',
    choices: [
      'każdą wartość fib(k) liczy się tylko raz',
      'bo tablica działa szybciej niż funkcje',
      'bo zapamiętywanie zmniejsza liczby do obliczeń',
      'bo program przestaje używać dodawania',
    ],
    answer: 'A',
    hints: ['Co naiwna rekurencja robi wiele razy?', 'Liczy od nowa te same wartości, np. fib(2) — tysiące razy.', 'Co zmienia zapisanie wyniku po pierwszym obliczeniu?', 'Kolejne potrzeby tej wartości to odczyt z tablicy.'],
    steps: ['Naiwnie: wykładniczo wiele wywołań powtarzających te same podproblemy.', 'Z tablicą: każdy z 41 podproblemów liczony raz.'],
    errors: [
      ['B', 'Sama tablica nie przyspiesza obliczeń.', 'Oszczędność bierze się z niepowtarzania obliczeń.'],
      ['C', 'Liczby pozostają te same.', 'Zmniejsza się liczba obliczeń, nie wartości.'],
      ['D', 'Dodawanie nadal jest potrzebne.', 'Każdą wartość liczy się raz — też przez dodawanie.'],
    ],
  }),
  pyTask({
    id: 'tc-d-3',
    skill: 'cs-dp',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Na schody o n stopniach wchodzisz krokami o 1 albo 2 stopnie. Napisz funkcję `schody(n)`, która zwraca liczbę różnych sposobów wejścia (dla n = 0 jest jeden sposób — stać). Ukryte testy mają n = 70.',
    functionName: 'schody',
    params: ['n'],
    types: 'int ≥ 0 -> int',
    tests: [
      { name: 'zero', input: [0], expected: 1 },
      { name: 'jeden', input: [1], expected: 1 },
      { name: 'pięć', input: [5], expected: 8 },
      { name: 'dwa', input: [2], expected: 2, hidden: true },
      { name: 'siedemdziesiąt', input: [70], expected: 308061521170129, hidden: true },
    ],
    model: `
      def schody(n):
          d = [0] * (n + 1)
          d[0] = 1
          for i in range(1, n + 1):
              d[i] = d[i - 1] + (d[i - 2] if i >= 2 else 0)
          return d[n]
    `,
    hints: ['Jaki mógł być ostatni krok na stopień i?', 'Z i − 1 (krok o 1) albo z i − 2 (krok o 2).', 'Sposoby(i) = sposoby(i − 1) + sposoby(i − 2).', 'Wypełnij tablicę od d[0] = 1 w górę.'],
    steps: ['d[i] = d[i − 1] + d[i − 2], d[0] = 1.', 'Wypełniasz tablicę rosnąco i zwracasz d[n].'],
  }),
  pyTask({
    id: 'tc-d-4',
    skill: 'cs-dp',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Plansza to lista napisów: „.” to pole wolne, „#” — przeszkoda. Z lewego górnego rogu idziesz do prawego dolnego, wyłącznie w prawo lub w dół, tylko po wolnych polach. Napisz funkcję `sciezki(plansza)`, która zwraca liczbę takich dróg.',
    functionName: 'sciezki',
    params: ['plansza'],
    types: 'list[str] -> int',
    tests: [
      { name: 'pusta 3×3', input: [['...', '...', '...']], expected: 6 },
      { name: 'przeszkoda', input: [['.#.', '...', '...']], expected: 3 },
      { name: 'start zablokowany', input: [['#']], expected: 0 },
      { name: 'labirynt', input: [['....#', '..#..', '#....', '...#.']], expected: 4, hidden: true },
      { name: 'duża pusta', input: [['..........', '..........', '..........', '..........', '..........', '..........', '..........', '..........', '..........', '..........']], expected: 48620, hidden: true },
    ],
    model: `
      def sciezki(plansza):
          w, k = len(plansza), len(plansza[0])
          d = [[0] * k for _ in range(w)]
          for i in range(w):
              for j in range(k):
                  if plansza[i][j] == "#":
                      continue
                  if i == 0 and j == 0:
                      d[i][j] = 1
                  else:
                      d[i][j] = (d[i - 1][j] if i > 0 else 0) + (d[i][j - 1] if j > 0 else 0)
          return d[w - 1][k - 1]
    `,
    hints: ['Z jakich pól można wejść na pole (i, j)?', 'Z góry (i − 1, j) albo z lewej (i, j − 1).', 'Liczba dróg do pola = suma dróg do tych dwóch pól; przeszkoda ma 0.', 'Wypełniaj tablicę wierszami, od lewego górnego rogu z wartością 1.'],
    steps: ['d[i][j] = d[i − 1][j] + d[i][j − 1] dla wolnych pól, 0 dla przeszkód.', 'Start d[0][0] = 1 (jeśli wolny); wynik w prawym dolnym rogu.'],
  }),
  pyTask({
    id: 'tc-d-5',
    skill: 'cs-dp',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Napisz funkcję `nwp(a, b)`, która zwraca długość najdłuższego wspólnego podciągu napisów a i b (znaki w tej samej kolejności, niekoniecznie obok siebie).',
    functionName: 'nwp',
    params: ['a', 'b'],
    types: 'str, str -> int',
    tests: [
      { name: 'klasyczny', input: ['ABCBDAB', 'BDCABA'], expected: 4 },
      { name: 'identyczne', input: ['abc', 'abc'], expected: 3 },
      { name: 'rozłączne', input: ['abc', 'def'], expected: 0 },
      { name: 'pusty', input: ['', 'abc'], expected: 0, hidden: true },
      { name: 'słowa', input: ['informatyka', 'matematyka'], expected: 6, hidden: true },
    ],
    model: `
      def nwp(a, b):
          d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
          for i in range(1, len(a) + 1):
              for j in range(1, len(b) + 1):
                  if a[i - 1] == b[j - 1]:
                      d[i][j] = d[i - 1][j - 1] + 1
                  else:
                      d[i][j] = max(d[i - 1][j], d[i][j - 1])
          return d[len(a)][len(b)]
    `,
    hints: ['Co oznacza komórka d[i][j]?', 'Długość NWP pierwszych i znaków a i pierwszych j znaków b.', 'Równe znaki a[i − 1] i b[j − 1]: d[i − 1][j − 1] + 1; inaczej max z komórki wyżej i z lewej.', 'Tablica ma wymiary (len(a) + 1) × (len(b) + 1), wynik w prawym dolnym rogu.'],
    steps: ['d[i][j] dla prefiksów; zerowy wiersz i kolumna to zera.', 'Wzór: równe znaki → po przekątnej + 1, różne → max(góra, lewo).'],
  }),
  pyTask({
    id: 'tc-d-6',
    skill: 'cs-dp',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `min_monet(kwota, nominaly)`, która zwraca NAJMNIEJSZĄ liczbę monet potrzebną do wydania kwoty (każdego nominału dowolnie wiele), albo -1, gdy się nie da. Tu zachłanność zawodzi — użyj programowania dynamicznego.',
    functionName: 'min_monet',
    params: ['kwota', 'nominaly'],
    types: 'int ≥ 0, list[int > 0] -> int',
    tests: [
      { name: 'zachłanny zawodzi', input: [6, [1, 3, 4]], expected: 2 },
      { name: 'zwykły', input: [11, [1, 2, 5]], expected: 3 },
      { name: 'niemożliwe', input: [3, [2]], expected: -1 },
      { name: 'zero', input: [0, [1]], expected: 0, hidden: true },
      { name: 'trzy razy 21', input: [63, [1, 5, 10, 21, 25]], expected: 3, hidden: true },
    ],
    model: `
      def min_monet(kwota, nominaly):
          NIESK = float("inf")
          d = [0] + [NIESK] * kwota
          for x in range(1, kwota + 1):
              for m in nominaly:
                  if m <= x and d[x - m] + 1 < d[x]:
                      d[x] = d[x - m] + 1
          return -1 if d[kwota] == NIESK else d[kwota]
    `,
    hints: ['Jaka mogła być ostatnia moneta przy kwocie x?', 'Dowolny nominał m ≤ x — reszta to kwota x − m.', 'd[x] = min(d[x − m] + 1) po wszystkich nominałach.', 'd[0] = 0, a nieosiągalne kwoty oznacz nieskończonością.'],
    steps: ['d[x] = najmniejsza liczba monet dla kwoty x; d[0] = 0.', 'd[x] = min po m ≤ x z d[x − m] + 1; nieskończoność na końcu → −1.'],
  }),
  pyTask({
    id: 'tc-d-7',
    skill: 'cs-dp',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Problem plecakowy (0/1): każdy przedmiot bierzesz w całości albo wcale. Napisz funkcję `plecak(wagi, wartosci, W)`, która zwraca największą łączną wartość przedmiotów o łącznej wadze nie większej niż W.',
    functionName: 'plecak',
    params: ['wagi', 'wartosci', 'W'],
    types: 'list[int > 0], list[int], int ≥ 0 -> int',
    tests: [
      { name: 'mały', input: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
      { name: 'klasyczny', input: [[10, 20, 30], [60, 100, 120], 50], expected: 220 },
      { name: 'nic się nie mieści', input: [[5], [10], 4], expected: 0 },
      { name: 'dokładne dopasowanie', input: [[2, 3, 4, 5], [3, 4, 5, 6], 5], expected: 7, hidden: true },
      { name: 'lekkie przedmioty', input: [[1, 1, 1], [10, 20, 30], 2], expected: 50, hidden: true },
    ],
    model: `
      def plecak(wagi, wartosci, W):
          d = [0] * (W + 1)
          for w, v in zip(wagi, wartosci):
              for c in range(W, w - 1, -1):
                  d[c] = max(d[c], d[c - w] + v)
          return d[W]
    `,
    hints: ['Co oznacza d[c] po rozpatrzeniu kilku pierwszych przedmiotów?', 'Najlepszą wartość przy pojemności c.', 'Dla przedmiotu (w, v): d[c] = max(d[c], d[c − w] + v).', 'Pojemności przeglądaj od W w dół — wtedy przedmiot nie zostanie wzięty dwa razy.'],
    steps: ['Tablica d po pojemnościach 0 … W, na start zera.', 'Każdy przedmiot aktualizuje d od W w dół: max(bez niego, z nim).'],
  }),

  // cs-subseq -----------------------------------------------------------------
  numeric({
    id: 'tc-s-1',
    skill: 'cs-subseq',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 't = [1, 2, 2, 3, 1, 4, 5, 6, 0]\ndl = najdl = 1\nfor i in range(1, len(t)):\n    if t[i] >= t[i - 1]:\n        dl += 1\n    else:\n        dl = 1\n    najdl = max(najdl, dl)\nprint(najdl)',
    answer: 4,
    verify: () => {
      const t = [1, 2, 2, 3, 1, 4, 5, 6, 0];
      let dl = 1;
      let najdl = 1;
      for (let i = 1; i < t.length; i += 1) {
        dl = t[i]! >= t[i - 1]! ? dl + 1 : 1;
        najdl = Math.max(najdl, dl);
      }
      return najdl;
    },
    hints: ['Co liczy zmienna dl?', 'Długość bieżącego fragmentu niemalejącego.', 'Kiedy dl wraca do 1?', 'Gdy następny element jest mniejszy od poprzedniego.'],
    steps: ['Fragmenty niemalejące: [1, 2, 2, 3], [1, 4, 5, 6], [0].', 'Najdłuższy ma długość 4.'],
    errors: [['8', 'Zsumowane długości fragmentów.', 'najdl to maksimum, nie suma.']],
  }),
  choice({
    id: 'tc-s-2',
    skill: 'cs-subseq',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'W algorytmie Kadanego suma bieżąca to najlepsza suma fragmentu kończącego się na obecnym elemencie x. Jak ją zaktualizować?',
    choices: ['`biezaca = max(x, biezaca + x)`', '`biezaca = biezaca + x`', '`biezaca = max(biezaca, x)`', '`biezaca = 0 if x < 0 else biezaca + x`'],
    answer: 'A',
    hints: ['Jakie są dwie możliwości dla fragmentu kończącego się na x?', 'Przedłużyć fragment poprzedni albo zacząć nowy od x.', 'Przedłużenie daje biezaca + x, nowy fragment — samo x.', 'Wybierasz większą z tych wartości.'],
    steps: ['Fragment kończący się na x to x albo poprzedni fragment + x.', 'Stąd `max(x, biezaca + x)`.'],
    errors: [
      ['B', 'Fragment nigdy nie zaczyna się od nowa.', 'Gdy suma poprzednia jest ujemna, lepiej zacząć od x.'],
      ['C', 'To nie jest suma fragmentu.', 'biezaca musi uwzględniać x.'],
      ['D', 'Zerowanie przy ujemnym x gubi fragmenty przechodzące przez ujemne liczby.', 'Decyduje znak sumy poprzedniej, nie samego x.'],
    ],
  }),
  pyTask({
    id: 'tc-s-3',
    skill: 'cs-subseq',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `najdluzszy_niemalejacy(t)`, która zwraca długość najdłuższego spójnego fragmentu listy, w którym każdy element jest nie mniejszy od poprzedniego.',
    functionName: 'najdluzszy_niemalejacy',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'przykład', input: [[1, 2, 2, 3, 1, 4, 5, 6, 0]], expected: 4 },
      { name: 'malejąca', input: [[5, 4, 3]], expected: 1 },
      { name: 'pusta', input: [[]], expected: 0 },
      { name: 'cała', input: [[1, 1, 2, 3, 5]], expected: 5, hidden: true },
      { name: 'na końcu', input: [[3, 1, 2, 3, 4]], expected: 4, hidden: true },
    ],
    model: `
      def najdluzszy_niemalejacy(t):
          if not t:
              return 0
          dl = najdl = 1
          for i in range(1, len(t)):
              if t[i] >= t[i - 1]:
                  dl += 1
              else:
                  dl = 1
              najdl = max(najdl, dl)
          return najdl
    `,
    hints: ['Co trzeba pamiętać podczas jednego przejścia?', 'Długość bieżącego fragmentu i najlepszą dotąd.', 'Gdy t[i] ≥ t[i − 1], fragment rośnie; inaczej zaczyna się od nowa z długością 1.', 'Pusta lista to osobny przypadek.'],
    steps: ['Bieżąca długość rośnie przy t[i] ≥ t[i − 1], inaczej wraca do 1.', 'Po każdym kroku aktualizujesz maksimum.'],
  }),
  pyTask({
    id: 'tc-s-4',
    skill: 'cs-subseq',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `max_suma(t)`, która zwraca największą sumę niepustego spójnego fragmentu niepustej listy (algorytm Kadanego).',
    functionName: 'max_suma',
    params: ['t'],
    types: 'niepusta list[int] -> int',
    tests: [
      { name: 'klasyczny', input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { name: 'same ujemne', input: [[-3, -1, -2]], expected: -1 },
      { name: 'jeden', input: [[5]], expected: 5 },
      { name: 'dziura w środku', input: [[5, -9, 6, -2, 3]], expected: 7, hidden: true },
      { name: 'cała lista', input: [[2, -1, 2, -1, 2]], expected: 4, hidden: true },
    ],
    model: `
      def max_suma(t):
          najlepsza = biezaca = t[0]
          for x in t[1:]:
              biezaca = max(x, biezaca + x)
              najlepsza = max(najlepsza, biezaca)
          return najlepsza
    `,
    hints: ['Od jakiej wartości zacząć, żeby lista samych ujemnych dała dobry wynik?', 'Od pierwszego elementu, a nie od 0.', 'Suma bieżąca: `max(x, biezaca + x)`.', 'Po każdym elemencie aktualizuj najlepszą sumę.'],
    steps: ['Obie sumy startują od t[0].', 'Dla każdego x: bieżąca = max(x, bieżąca + x), najlepsza = max(najlepsza, bieżąca).'],
  }),
  pyTask({
    id: 'tc-s-5',
    skill: 'cs-subseq',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Fragment arytmetyczny to spójny fragment, w którym różnica między kolejnymi elementami jest stała. Napisz funkcję `najdluzszy_arytmetyczny(t)`, która zwraca długość najdłuższego takiego fragmentu (każde dwa sąsiednie elementy są fragmentem arytmetycznym).',
    functionName: 'najdluzszy_arytmetyczny',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'przykład', input: [[1, 3, 5, 7, 2, 4]], expected: 4 },
      { name: 'jeden', input: [[5]], expected: 1 },
      { name: 'pusta', input: [[]], expected: 0 },
      { name: 'wspólny element', input: [[1, 1, 1, 2, 3, 4, 5]], expected: 5, hidden: true },
      { name: 'malejący', input: [[10, 7, 4, 1, -2, 0]], expected: 5, hidden: true },
    ],
    model: `
      def najdluzszy_arytmetyczny(t):
          if len(t) < 2:
              return len(t)
          najdl = dl = 2
          for i in range(2, len(t)):
              if t[i] - t[i - 1] == t[i - 1] - t[i - 2]:
                  dl += 1
              else:
                  dl = 2
              najdl = max(najdl, dl)
          return najdl
    `,
    hints: ['Jak sprawdzić, że fragment trwa po dojściu do t[i]?', 'Porównaj różnicę t[i] − t[i − 1] z poprzednią różnicą.', 'Gdy różnica się zmienia, nowy fragment zaczyna się od DWÓCH ostatnich elementów (długość 2).', 'Listy krótsze niż 2 elementy obsłuż osobno.'],
    steps: ['Równe kolejne różnice przedłużają fragment; zmiana różnicy zaczyna nowy o długości 2.', 'Maksimum długości po wszystkich krokach; listy krótsze niż 2 — ich długość.'],
  }),
  pyTask({
    id: 'tc-s-6',
    skill: 'cs-subseq',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Lista zawiera liczby dodatnie. Napisz funkcję `najkrotszy_fragment(t, s)`, która zwraca długość najkrótszego spójnego fragmentu o sumie co najmniej s, albo 0, gdy takiego nie ma. Rozwiązanie liniowe: dwa wskaźniki (okno przesuwne).',
    functionName: 'najkrotszy_fragment',
    params: ['t', 's'],
    types: 'list[int > 0], int -> int',
    tests: [
      { name: 'przykład', input: [[2, 3, 1, 2, 4, 3], 7], expected: 2 },
      { name: 'brak', input: [[1, 1, 1], 5], expected: 0 },
      { name: 'jeden element', input: [[5, 1, 3], 5], expected: 1 },
      { name: 'środek', input: [[1, 2, 3, 4, 5], 11], expected: 3, hidden: true },
      { name: 'równy s', input: [[1, 4, 4], 4], expected: 1, hidden: true },
    ],
    model: `
      def najkrotszy_fragment(t, s):
          najkrotszy = 0
          suma = 0
          lewy = 0
          for prawy in range(len(t)):
              suma += t[prawy]
              while suma >= s:
                  dl = prawy - lewy + 1
                  if najkrotszy == 0 or dl < najkrotszy:
                      najkrotszy = dl
                  suma -= t[lewy]
                  lewy += 1
          return najkrotszy
    `,
    hints: ['Co się dzieje z sumą okna, gdy przesuwasz jego prawy koniec?', 'Rośnie — liczby są dodatnie.', 'Gdy suma ≥ s, zapisz długość i przesuwaj lewy koniec, żeby okno skrócić.', 'Każdy wskaźnik przechodzi listę raz — rozwiązanie liniowe.'],
    steps: ['Prawy koniec dokłada elementy do sumy okna.', 'Dopóki suma ≥ s, zapisujesz długość i zwijasz lewy koniec.'],
  }),
  pyTask({
    id: 'tc-s-7',
    skill: 'cs-subseq',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `najdluzszy_rosnacy(t)`, która zwraca długość najdłuższego ŚCIŚLE rosnącego podciągu listy — elementy nie muszą stać obok siebie, ale muszą zachować kolejność.',
    functionName: 'najdluzszy_rosnacy',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'klasyczny', input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { name: 'z zerami', input: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { name: 'równe', input: [[7, 7, 7]], expected: 1 },
      { name: 'pusta', input: [[]], expected: 0, hidden: true },
      { name: 'z przeskokami', input: [[3, 10, 2, 1, 20]], expected: 3, hidden: true },
      { name: 'rosnąca', input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], expected: 10, hidden: true },
    ],
    model: `
      def najdluzszy_rosnacy(t):
          d = [1] * len(t)
          for i in range(len(t)):
              for j in range(i):
                  if t[j] < t[i] and d[j] + 1 > d[i]:
                      d[i] = d[j] + 1
          return max(d) if d else 0
    `,
    hints: ['Co oznacza d[i]?', 'Długość najdłuższego rosnącego podciągu kończącego się na t[i].', 'd[i] = 1 + max d[j] po j < i z t[j] < t[i] (albo 1).', 'Wynik to największe d[i]; pusta lista → 0.'],
    steps: ['d[i] — najdłuższy rosnący podciąg kończący się na i; start 1.', 'Dla j < i z t[j] < t[i]: d[i] = max(d[i], d[j] + 1); wynik to max(d).'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const TECH_CARDS: Flashcard[] = [
  card('c-tc-r-1', 'cs-recursion', 'definicja', 'Dwa składniki każdej funkcji rekurencyjnej?', 'Warunek stopu i wywołanie dla mniejszego przypadku.'),
  card('c-tc-r-2', 'cs-recursion', 'pulapka', 'Dlaczego naiwne rekurencyjne fib(n) jest wolne?', 'Liczy te same wartości wiele razy — wykładniczo wiele wywołań.'),

  card('c-tc-g-1', 'cs-greedy', 'pulapka', 'Kontrprzykład na zachłanne wydawanie reszty?', 'Nominały {1, 3, 4}, kwota 6: zachłannie 3 monety, optimum 2.'),
  card('c-tc-g-2', 'cs-greedy', 'metoda', 'Zachłanny wybór zajęć — po czym sortować?', 'Po czasie zakończenia.'),

  card('c-tc-d-1', 'cs-dp', 'metoda', 'Pięć pytań do zadania DP?', 'Znaczenie komórki, wzór, wartości początkowe, kolejność, gdzie odpowiedź.'),
  card('c-tc-d-2', 'cs-dp', 'wzor', 'Wzór NWP dla różnych znaków?', 'd[i][j] = max(d[i − 1][j], d[i][j − 1])'),

  card('c-tc-s-1', 'cs-subseq', 'wzor', 'Krok algorytmu Kadanego?', '`biezaca = max(x, biezaca + x)`'),
  card('c-tc-s-2', 'cs-subseq', 'definicja', 'Fragment spójny a podciąg?', 'Fragment: kolejne elementy bez przerw; podciąg może przeskakiwać.'),
];

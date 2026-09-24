import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 4: sortowanie i wyszukiwanie.
 *
 * Podstawa programowa 2024: I.2c (sortowanie przez wstawianie i bąbelkowe),
 * I+II.1b (wyszukiwanie binarne), I+II.1e (sortowanie przez scalanie),
 * I+II.3a (połowienie), I+II.3c (dziel i zwyciężaj: scalanie, sortowanie
 * szybkie), I.R2 i I.R5 (porównywanie algorytmów, efektywność).
 */

export const SORT_TOPIC: Topic = {
  id: 'cs-sorting',
  subjectId: 'cs',
  name: 'Sortowanie i wyszukiwanie',
  summary: 'Sortowanie bąbelkowe, przez wstawianie, przez scalanie i szybkie; wyszukiwanie binarne i jego zastosowania — z liczeniem kosztu.',
};

export const SORT_SKILLS: Skill[] = [
  {
    id: 'cs-search-sort',
    topicId: 'cs-sorting',
    name: 'Sortowanie bąbelkowe i przez wstawianie',
    level: 'PR',
    ckeRequirement: 'Porządkowanie ciągu przez wstawianie i metodą bąbelkową, porównywanie algorytmów (I.2c, I.R2)',
    prerequisites: ['cs-arrays'],
    examValue: 0.85,
  },
  {
    id: 'cs-sort-advanced',
    topicId: 'cs-sorting',
    name: 'Sortowanie przez scalanie i szybkie',
    level: 'PR',
    ckeRequirement: 'Sortowanie przez scalanie, metoda dziel i zwyciężaj, sortowanie szybkie (I+II.1e, I+II.3c)',
    prerequisites: ['cs-search-sort', 'cs-gcd'],
    examValue: 0.75,
  },
  {
    id: 'cs-binary-search',
    topicId: 'cs-sorting',
    name: 'Wyszukiwanie binarne',
    level: 'PR',
    ckeRequirement: 'Wyszukiwanie w zbiorze uporządkowanym metodą binarną, połowienie (I+II.1b, I+II.3a)',
    prerequisites: ['cs-search-sort', 'cs-approx'],
    examValue: 0.85,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const SORT_LESSONS: Lesson[] = [
  {
    skillId: 'cs-search-sort',
    minutes: 14,
    intro:
      'Dwa najprostsze sortowania. Bąbelkowe porównuje sąsiadów i zamienia ich, gdy stoją źle — po każdym przebiegu największy element „wypływa” na koniec. Przez wstawianie bierze kolejne elementy i wsuwa je na właściwe miejsce w już posortowanej części, jak karty w dłoni.',
    blocks: [
      listing('def babelkowe(t):\n    t = t[:]                       # kopia - nie psujemy danych\n    n = len(t)\n    for i in range(n - 1):\n        for j in range(n - 1 - i):\n            if t[j] > t[j + 1]:\n                t[j], t[j + 1] = t[j + 1], t[j]\n    return t\n\ndef wstawianie(t):\n    t = t[:]\n    for i in range(1, len(t)):\n        x = t[i]\n        j = i - 1\n        while j >= 0 and t[j] > x:\n            t[j + 1] = t[j]            # przesuń większy w prawo\n            j -= 1\n        t[j + 1] = x\n    return t'),
      p('Oba algorytmy wykonują w najgorszym razie około $\\frac{n^2}{2}$ porównań. Sortowanie przez wstawianie ma jednak zaletę: dla listy prawie posortowanej działa niemal liniowo, bo pętla `while` od razu się zatrzymuje.'),
      p('Liczba zamian w sortowaniu bąbelkowym to liczba inwersji — par elementów stojących w złej kolejności względem siebie.'),
      tip('W Pythonie na co dzień sortuje się przez `sorted(t)` albo `t.sort()`, a kryterium podaje przez `key`: `sorted(slowa, key=len)`. Krotka jako klucz sortuje po kilku kryteriach: `key=lambda s: (len(s), s)`.'),
      warn('Zakres wewnętrznej pętli bąbelkowego to `n - 1 - i`: porównujesz `t[j]` z `t[j + 1]`, więc j musi zatrzymać się przed ostatnim indeksem.'),
    ],
    examples: [
      example(
        'Ile zamian wykona pierwszy przebieg sortowania bąbelkowego listy [5, 1, 4, 2]?',
        ['5 > 1 → zamiana: [1, 5, 4, 2]; 5 > 4 → zamiana: [1, 4, 5, 2]; 5 > 2 → zamiana: [1, 4, 2, 5].', 'Największy element wypłynął na koniec.'],
        '3',
      ),
      example(
        'Ile porównań wykona sortowanie bąbelkowe (bez przerywania) dla 10 elementów?',
        [['Przebiegi porównują 9, 8, …, 1 par.', 'każdy przebieg jest o jeden krótszy'], '9 + 8 + … + 1 = 45.'],
        '45',
      ),
    ],
    pitfalls: ['Wyjście poza listę w wewnętrznej pętli.', 'Sortowanie listy przekazanej jako argument zamiast kopii.', 'Pomylenie liczby porównań z liczbą zamian.'],
  },
  {
    skillId: 'cs-sort-advanced',
    minutes: 16,
    intro:
      'Dziel i zwyciężaj: podziel problem na mniejsze części, rozwiąż je (rekurencyjnie) i połącz wyniki. Sortowanie przez scalanie dzieli listę na pół, sortuje połowy i scala je w czasie liniowym — razem $n \\log_2 n$ operacji zamiast $n^2$.',
    blocks: [
      listing('def scal(a, b):                   # a i b są posortowane\n    wynik = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            wynik.append(a[i]); i += 1\n        else:\n            wynik.append(b[j]); j += 1\n    return wynik + a[i:] + b[j:]\n\ndef sortuj(t):\n    if len(t) <= 1:\n        return t\n    s = len(t) // 2\n    return scal(sortuj(t[:s]), sortuj(t[s:]))'),
      p('Sortowanie szybkie (quicksort) wybiera element osiowy (pivot), rozdziela pozostałe na mniejsze i większe od niego i sortuje obie części rekurencyjnie. Średnio też $n \\log n$, ale przy złym wyborze osi — np. pierwszy element listy już posortowanej — spada do $n^2$.'),
      listing('def szybkie(t):\n    if len(t) <= 1:\n        return t\n    os = t[0]\n    mniejsze = [x for x in t[1:] if x < os]\n    wieksze = [x for x in t[1:] if x >= os]\n    return szybkie(mniejsze) + [os] + szybkie(wieksze)'),
      tip('Dla miliona elementów: $n^2 = 10^{12}$ operacji (godziny), a $n \\log_2 n \\approx 2 \\cdot 10^7$ (ułamek sekundy). Na maturze pytanie o złożoność często sprowadza się do tej różnicy.'),
      warn('Przy scalaniu warunek `a[i] <= b[j]` (a nie `<`) zachowuje kolejność równych elementów — sortowanie jest stabilne.'),
    ],
    examples: [
      example(
        'Scal listy [1, 4, 9] i [2, 3, 10].',
        ['Porównujesz czoła: 1 < 2 → 1; 4 > 2 → 2; 4 > 3 → 3; 4 < 10 → 4; 9 < 10 → 9.', 'Zostaje 10 z drugiej listy.'],
        '[1, 2, 3, 4, 9, 10]',
      ),
      example(
        'Ile poziomów podziału ma sortowanie przez scalanie dla 16 elementów?',
        [['16 → 8 → 4 → 2 → 1.', 'każdy poziom dzieli długość przez 2'], 'To $\\log_2 16$.'],
        '4',
      ),
    ],
    pitfalls: ['Zapomniane doklejenie reszty listy po pętli scalania.', 'Brak warunku stopu `len(t) <= 1`.', 'Oś quicksorta liczona dwa razy (w części mniejszych i większych).'],
  },
  {
    skillId: 'cs-binary-search',
    minutes: 15,
    intro:
      'W posortowanej liście nie trzeba sprawdzać wszystkiego: patrzysz na środek i od razu wiesz, w której połowie szukać dalej. Milion elementów to najwyżej 20 kroków.',
    blocks: [
      listing('def szukaj(t, x):          # t posortowana rosnąco\n    l, p = 0, len(t) - 1\n    while l <= p:\n        s = (l + p) // 2\n        if t[s] == x:\n            return s\n        if t[s] < x:\n            l = s + 1            # szukaj w prawej połowie\n        else:\n            p = s - 1            # szukaj w lewej połowie\n    return -1'),
      p('Odmiana „pierwsze miejsce, gdzie t[i] ≥ x” (dolna granica) nie przerywa przy trafieniu, tylko zawęża przedział do pierwszej pozycji spełniającej warunek. Daje pierwsze wystąpienie x i miejsce, w które x wstawić.'),
      listing('def dolna_granica(t, x):\n    l, p = 0, len(t)\n    while l < p:\n        s = (l + p) // 2\n        if t[s] < x:\n            l = s + 1\n        else:\n            p = s\n    return l', 'Moduł `bisect` robi to samo: `bisect.bisect_left(t, x)`.'),
      tip('Wyszukiwanie binarne działa też „po odpowiedzi”: jeśli umiesz sprawdzić, czy wartość v wystarcza, a większe wartości też wystarczają — szukasz binarnie najmniejszego dobrego v.'),
      warn('Najczęstszy błąd to pętla bez końca: `l = s` zamiast `l = s + 1`, gdy przedział ma dwa elementy. Zawsze sprawdź przypadek dwóch elementów.'),
    ],
    examples: [
      example(
        'Ile kroków potrzeba, by znaleźć 23 w [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]?',
        ['Środek indeks 4: 16 < 23 → prawa połowa; środek indeks 7: 56 > 23 → lewa.', 'Środek indeks 5: trafienie.'],
        '3',
      ),
      example(
        'Ile najwięcej kroków potrzeba dla listy 1000 elementów?',
        [['Każdy krok co najmniej połowi przedział.', 'szukasz najmniejszego k z $2^k > 1000$'], '$2^{10} = 1024$.'],
        '10',
      ),
    ],
    pitfalls: ['Wyszukiwanie binarne na nieposortowanej liście.', 'Pętla bez końca przy `l = s`.', 'Zwrócenie dowolnego zamiast pierwszego wystąpienia.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const SORT_QUESTIONS: Question[] = [
  // cs-search-sort ------------------------------------------------------------
  numeric({
    id: 'so-s-1',
    skill: 'cs-search-sort',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Ile zamian wykona ten fragment (pierwszy przebieg sortowania bąbelkowego)?',
    listing: 't = [5, 1, 4, 2]\nzamiany = 0\nfor j in range(len(t) - 1):\n    if t[j] > t[j + 1]:\n        t[j], t[j + 1] = t[j + 1], t[j]\n        zamiany += 1\nprint(zamiany)',
    answer: 3,
    verify: () => {
      const t = [5, 1, 4, 2];
      let z = 0;
      for (let j = 0; j < t.length - 1; j += 1) {
        if (t[j]! > t[j + 1]!) {
          [t[j], t[j + 1]] = [t[j + 1]!, t[j]!];
          z += 1;
        }
      }
      return z;
    },
    hints: ['Które pary porównuje pętla?', 'Kolejno sąsiadów: pierwszy z drugim, drugi z trzecim i tak dalej do końca.', 'Pamiętaj, że po zamianie lista się zmienia.', 'Śledź listę: [5, 1, 4, 2] → [1, 5, 4, 2] → …'],
    steps: ['[5, 1, 4, 2] → [1, 5, 4, 2] → [1, 4, 5, 2] → [1, 4, 2, 5].', 'Trzy zamiany.'],
    errors: [['2', 'Porównanie na oryginalnej liście.', 'Po każdej zamianie porównujesz już zmienioną listę.']],
  }),
  choice({
    id: 'so-s-2',
    skill: 'cs-search-sort',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Co na pewno jest prawdą po pierwszym przebiegu sortowania bąbelkowego (rosnąco)?',
    choices: ['największy element stoi na końcu', 'najmniejszy element stoi na początku', 'lista jest posortowana', 'pierwsza połowa listy jest posortowana'],
    answer: 'A',
    hints: ['Co dzieje się z największym elementem, gdy pętla do niego dotrze?', 'Wygrywa każde kolejne porównanie.', 'Jest zamieniany z każdym następnym sąsiadem.', 'Gdzie kończy przebieg?'],
    steps: ['Największy element wygrywa każde porównanie i przesuwa się w prawo.', 'Po przebiegu stoi na końcu; o reszcie nic pewnego nie wiadomo.'],
    errors: [
      ['B', 'Najmniejszy przesuwa się w lewo tylko o jedną pozycję na przebieg.', 'Na koniec „wypływa” największy.'],
      ['C', 'Jeden przebieg zwykle nie wystarcza.', 'Potrzeba do n − 1 przebiegów.'],
      ['D', 'Przebieg nie porządkuje połowy listy.', 'Pewne jest tylko położenie największego elementu.'],
    ],
  }),
  pyTask({
    id: 'so-s-3',
    skill: 'cs-search-sort',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `babelkowe(t)`, która zwraca nową listę posortowaną rosnąco metodą bąbelkową (bez `sorted` i `sort`).',
    functionName: 'babelkowe',
    params: ['t'],
    types: 'list[int] -> list[int]',
    tests: [
      { name: 'przykład', input: [[5, 1, 4, 2]], expected: [1, 2, 4, 5] },
      { name: 'posortowana', input: [[1, 2, 3]], expected: [1, 2, 3] },
      { name: 'pusta', input: [[]], expected: [] },
      { name: 'powtórzenia', input: [[3, 1, 3, 1]], expected: [1, 1, 3, 3], hidden: true },
      { name: 'malejąca z ujemnymi', input: [[9, 4, 0, -2, -7]], expected: [-7, -2, 0, 4, 9], hidden: true },
    ],
    model: `
      def babelkowe(t):
          t = t[:]
          n = len(t)
          for i in range(n - 1):
              for j in range(n - 1 - i):
                  if t[j] > t[j + 1]:
                      t[j], t[j + 1] = t[j + 1], t[j]
          return t
    `,
    hints: ['Ile przebiegów potrzeba dla n elementów?', 'n − 1: po każdym kolejny największy trafia na swoje miejsce.', 'W przebiegu i porównuj sąsiadów `t[j]`, `t[j + 1]` dla j < n − 1 − i.', 'Zamiana w Pythonie: `t[j], t[j + 1] = t[j + 1], t[j]`.'],
    steps: ['Kopia listy, potem n − 1 przebiegów.', 'W każdym przebiegu zamieniasz sąsiadów w złej kolejności.'],
  }),
  pyTask({
    id: 'so-s-4',
    skill: 'cs-search-sort',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `wstawianie(t)`, która zwraca nową listę posortowaną rosnąco metodą przez wstawianie.',
    functionName: 'wstawianie',
    params: ['t'],
    types: 'list[int] -> list[int]',
    tests: [
      { name: 'przykład', input: [[4, 3, 1, 2]], expected: [1, 2, 3, 4] },
      { name: 'jeden', input: [[7]], expected: [7] },
      { name: 'posortowana', input: [[1, 5, 9]], expected: [1, 5, 9] },
      { name: 'powtórzenia', input: [[2, 2, 1, 2]], expected: [1, 2, 2, 2], hidden: true },
      { name: 'dłuższa', input: [[10, -1, 8, 3, 3, 0, 6]], expected: [-1, 0, 3, 3, 6, 8, 10], hidden: true },
    ],
    model: `
      def wstawianie(t):
          t = t[:]
          for i in range(1, len(t)):
              x = t[i]
              j = i - 1
              while j >= 0 and t[j] > x:
                  t[j + 1] = t[j]
                  j -= 1
              t[j + 1] = x
          return t
    `,
    hints: ['Co wiadomo o części listy przed indeksem i?', 'Jest już posortowana.', 'Zapamiętaj x = t[i] i przesuwaj w prawo większe od x elementy z lewej części.', 'Wstaw x w zwolnione miejsce `t[j + 1]`.'],
    steps: ['Dla każdego i od 1 zapamiętujesz x = t[i].', 'Przesuwasz większe elementy w prawo i wstawiasz x w lukę.'],
  }),
  pyTask({
    id: 'so-s-5',
    skill: 'cs-search-sort',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `ile_zamian(t)`, która zwraca, ile zamian sąsiadów wykona sortowanie bąbelkowe listy t (czyli ile jest par i < j z t[i] > t[j]).',
    functionName: 'ile_zamian',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'przykład', input: [[3, 1, 2]], expected: 2 },
      { name: 'posortowana', input: [[1, 2, 3, 4]], expected: 0 },
      { name: 'odwrócona', input: [[4, 3, 2, 1]], expected: 6 },
      { name: 'mieszana', input: [[2, 4, 1, 3, 5]], expected: 3, hidden: true },
      { name: 'równe', input: [[1, 1, 1]], expected: 0, hidden: true },
    ],
    model: `
      def ile_zamian(t):
          licznik = 0
          for i in range(len(t)):
              for j in range(i + 1, len(t)):
                  if t[i] > t[j]:
                      licznik += 1
          return licznik
    `,
    hints: ['Kiedy sortowanie bąbelkowe zamienia dwa elementy?', 'Gdy stoją obok siebie w złej kolejności — każda zamiana naprawia jedną złą parę.', 'Policz wszystkie pary i < j, w których t[i] > t[j].', 'Dwie zagnieżdżone pętle po i i po j > i.'],
    steps: ['Każda zamiana sąsiadów usuwa dokładnie jedną inwersję.', 'Liczba zamian = liczba par i < j z t[i] > t[j].'],
  }),
  numeric({
    id: 'so-s-6',
    skill: 'cs-search-sort',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Sortowanie przez wstawianie dostaje listę [1000, 999, …, 2, 1]. Ile razy wykona przesunięcie elementu w prawo (`t[j + 1] = t[j]`)?',
    answer: 499500,
    verify: () => (1000 * 999) / 2,
    hints: ['Ile elementów trzeba przesunąć, wstawiając i-ty element?', 'Wszystkie poprzednie — każdy jest od niego większy.', 'Dla i = 1, 2, …, 999 przesunięć jest 1, 2, …, 999.', 'Suma $1 + 2 + … + 999$.'],
    steps: ['Element o indeksie i jest mniejszy od wszystkich i poprzednich — i przesunięć.', 'Suma: $\\frac{999 \\cdot 1000}{2} = 499500$.'],
    errors: [['1000000', 'Oszacowanie $n^2$ zamiast dokładnej sumy.', 'Przesunięć jest $\\frac{n(n-1)}{2}$.']],
  }),
  pyTask({
    id: 'so-s-7',
    skill: 'cs-search-sort',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `wg_sumy_cyfr(t)`, która zwraca liczby naturalne z listy posortowane rosnąco według sumy cyfr, a przy równej sumie cyfr — rosnąco według wartości. Możesz użyć `sorted` z parametrem `key`.',
    functionName: 'wg_sumy_cyfr',
    params: ['t'],
    types: 'list[int ≥ 0] -> list[int]',
    tests: [
      { name: 'przykład', input: [[19, 5, 23, 100]], expected: [100, 5, 23, 19] },
      { name: 'remisy', input: [[30, 12, 3, 21]], expected: [3, 12, 21, 30] },
      { name: 'pusta', input: [[]], expected: [] },
      { name: 'zero', input: [[10, 0, 1]], expected: [0, 1, 10], hidden: true },
      { name: 'większe', input: [[999, 1000, 55, 91]], expected: [1000, 55, 91, 999], hidden: true },
    ],
    model: `
      def suma_cyfr(n):
          s = 0
          while n > 0:
              s += n % 10
              n //= 10
          return s

      def wg_sumy_cyfr(t):
          return sorted(t, key=lambda x: (suma_cyfr(x), x))
    `,
    hints: ['Jak przekazać do `sorted` własne kryterium?', 'Parametrem `key` — funkcją zwracającą klucz dla elementu.', 'Klucz może być krotką: najpierw suma cyfr, potem sama liczba.', '`sorted(t, key=lambda x: (suma_cyfr(x), x))`.'],
    steps: ['Funkcja pomocnicza liczy sumę cyfr.', 'Sortujesz z kluczem (suma cyfr, wartość) — krotki porównują się po kolei.'],
  }),

  // cs-sort-advanced ----------------------------------------------------------
  numeric({
    id: 'so-m-1',
    skill: 'cs-sort-advanced',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'def scal(a, b):\n    wynik = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            wynik.append(a[i]); i += 1\n        else:\n            wynik.append(b[j]); j += 1\n    return wynik + a[i:] + b[j:]\n\nprint(scal([1, 4, 9], [2, 3, 10])[3])',
    answer: 4,
    verify: () => [1, 2, 3, 4, 9, 10][3]!,
    hints: ['Co zwraca funkcja scal dla dwóch posortowanych list?', 'Jedną posortowaną listę z wszystkimi elementami.', 'Wypisz scaloną listę, porównując kolejno czoła obu list.', 'Indeks 3 to czwarty element scalonej listy.'],
    steps: ['scal([1, 4, 9], [2, 3, 10]) = [1, 2, 3, 4, 9, 10].', 'Element o indeksie 3 to 4.'],
    errors: [['3', 'Indeks liczony od jedynki.', 'Indeks 3 to czwarty element.']],
  }),
  choice({
    id: 'so-m-2',
    skill: 'cs-sort-advanced',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jaka jest złożoność czasowa sortowania przez scalanie listy n elementów?',
    choices: ['$n \\log n$', '$n^2$', '$n$', '$\\log n$'],
    answer: 'A',
    hints: ['Ile jest poziomów podziału listy na połowy?', 'Około $\\log_2 n$.', 'Ile pracy wymaga scalanie na jednym poziomie?', 'Liniowo — każdy element raz.'],
    steps: ['$\\log_2 n$ poziomów, na każdym scalanie kosztuje n.', 'Razem $n \\log n$.'],
    errors: [
      ['B', 'Złożoność sortowania bąbelkowego.', 'Scalanie dzieli listę na połowy.'],
      ['C', 'Pominięta liczba poziomów podziału.', 'Poziomów jest $\\log_2 n$.'],
      ['D', 'Pominięty koszt scalania.', 'Na każdym poziomie trzeba przejść wszystkie elementy.'],
    ],
  }),
  pyTask({
    id: 'so-m-3',
    skill: 'cs-sort-advanced',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `scal(a, b)`, która scala dwie listy posortowane rosnąco w jedną posortowaną listę, przechodząc każdą listę tylko raz (bez `sorted`).',
    functionName: 'scal',
    params: ['a', 'b'],
    types: 'list[int], list[int] -> list[int]',
    tests: [
      { name: 'przykład', input: [[1, 4, 9], [2, 3, 10]], expected: [1, 2, 3, 4, 9, 10] },
      { name: 'pusta pierwsza', input: [[], [1, 2]], expected: [1, 2] },
      { name: 'rozłączne', input: [[1, 2], [5, 6, 7]], expected: [1, 2, 5, 6, 7] },
      { name: 'równe elementy', input: [[1, 3, 3], [3, 4]], expected: [1, 3, 3, 3, 4], hidden: true },
      { name: 'obie puste', input: [[], []], expected: [], hidden: true },
    ],
    model: `
      def scal(a, b):
          wynik = []
          i = j = 0
          while i < len(a) and j < len(b):
              if a[i] <= b[j]:
                  wynik.append(a[i])
                  i += 1
              else:
                  wynik.append(b[j])
                  j += 1
          return wynik + a[i:] + b[j:]
    `,
    hints: ['Który element trafia do wyniku jako następny?', 'Mniejszy z dwóch „czołowych”: a[i] i b[j].', 'Dwa indeksy i, j przesuwasz po każdym przepisaniu.', 'Gdy jedna lista się skończy, doklej resztę drugiej.'],
    steps: ['Porównujesz a[i] z b[j] i przepisujesz mniejszy.', 'Po pętli doklejasz pozostałość: `a[i:] + b[j:]`.'],
  }),
  pyTask({
    id: 'so-m-4',
    skill: 'cs-sort-advanced',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `sortuj(t)` — sortowanie przez scalanie: podziel listę na połowy, posortuj je rekurencyjnie i scal.',
    functionName: 'sortuj',
    params: ['t'],
    types: 'list[int] -> list[int]',
    tests: [
      { name: 'przykład', input: [[38, 27, 43, 3, 9, 82, 10]], expected: [3, 9, 10, 27, 38, 43, 82] },
      { name: 'pusta', input: [[]], expected: [] },
      { name: 'dwa', input: [[2, 1]], expected: [1, 2] },
      { name: 'powtórzenia', input: [[5, 1, 5, 1, 5]], expected: [1, 1, 5, 5, 5], hidden: true },
      { name: 'ujemne', input: [[0, -3, 7, -3, 2, -8]], expected: [-8, -3, -3, 0, 2, 7], hidden: true },
    ],
    model: `
      def scal(a, b):
          wynik = []
          i = j = 0
          while i < len(a) and j < len(b):
              if a[i] <= b[j]:
                  wynik.append(a[i])
                  i += 1
              else:
                  wynik.append(b[j])
                  j += 1
          return wynik + a[i:] + b[j:]

      def sortuj(t):
          if len(t) <= 1:
              return t
          s = len(t) // 2
          return scal(sortuj(t[:s]), sortuj(t[s:]))
    `,
    hints: ['Kiedy lista jest już posortowana bez żadnej pracy?', 'Gdy ma 0 albo 1 element — to warunek stopu.', 'Podziel: `t[:s]` i `t[s:]`, gdzie s = len(t) // 2.', 'Posortowane połowy scal funkcją pomocniczą.'],
    steps: ['Warunek stopu: lista długości ≤ 1.', 'Rekurencyjnie sortujesz połowy i scalasz je w czasie liniowym.'],
  }),
  pyTask({
    id: 'so-m-5',
    skill: 'cs-sort-advanced',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Napisz funkcję `szybkie(t)` — sortowanie szybkie: pierwszy element jest osią, pozostałe dzielisz na mniejsze od osi i nie mniejsze, sortujesz obie części rekurencyjnie i sklejasz.',
    functionName: 'szybkie',
    params: ['t'],
    types: 'list[int] -> list[int]',
    tests: [
      { name: 'przykład', input: [[3, 6, 1, 8, 2, 9]], expected: [1, 2, 3, 6, 8, 9] },
      { name: 'pusta', input: [[]], expected: [] },
      { name: 'równe osi', input: [[4, 4, 4]], expected: [4, 4, 4] },
      { name: 'powtórzenia', input: [[2, 3, 2, 1, 3]], expected: [1, 2, 2, 3, 3], hidden: true },
      { name: 'odwrócona', input: [[6, 5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5, 6], hidden: true },
    ],
    model: `
      def szybkie(t):
          if len(t) <= 1:
              return t
          os = t[0]
          mniejsze = [x for x in t[1:] if x < os]
          wieksze = [x for x in t[1:] if x >= os]
          return szybkie(mniejsze) + [os] + szybkie(wieksze)
    `,
    hints: ['Które elementy biorą udział w podziale?', 'Wszystkie oprócz samej osi: `t[1:]`.', 'Elementy równe osi muszą trafić do jednej z części — np. do „nie mniejszych”.', 'Wynik: posortowane mniejsze + [oś] + posortowane pozostałe.'],
    steps: ['Oś to t[0]; resztę dzielisz na x < oś i x ≥ oś.', 'Sklejasz: szybkie(mniejsze) + [oś] + szybkie(większe).'],
  }),
  choice({
    id: 'so-m-6',
    skill: 'cs-sort-advanced',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Sortowanie szybkie z pierwszym elementem jako osią dostaje listę już posortowaną rosnąco, o długości n. Ile mniej więcej porównań wykona?',
    choices: ['około $\\frac{n^2}{2}$', 'około $n \\log_2 n$', 'około n', 'zero — lista jest posortowana'],
    answer: 'A',
    hints: ['Jak wygląda podział, gdy oś jest najmniejszym elementem?', 'Część „mniejszych” jest pusta, a „większych” ma n − 1 elementów.', 'Każde wywołanie zmniejsza problem tylko o jeden element.', 'Porównań jest (n − 1) + (n − 2) + … + 1.'],
    steps: ['Oś jest zawsze najmniejsza — podział jest skrajnie nierówny.', 'Łącznie $\\frac{n(n-1)}{2}$ porównań — przypadek pesymistyczny.'],
    errors: [
      ['B', 'Złożoność średnia, nie ta sytuacja.', 'Przy posortowanych danych podział jest skrajnie nierówny.'],
      ['C', 'Pominięte zagnieżdżenie wywołań.', 'Każde z n wywołań porównuje resztę listy.'],
      ['D', 'Algorytm nie sprawdza, czy lista jest posortowana.', 'Podział wykonuje się zawsze.'],
    ],
  }),
  pyTask({
    id: 'so-m-7',
    skill: 'cs-sort-advanced',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `inwersje(t)`, która zlicza pary i < j z t[i] > t[j] w czasie $n \\log n$ — przy okazji sortowania przez scalanie. Wskazówka: gdy przy scalaniu element z prawej połowy wyprzedza element a[i] lewej, tworzy inwersję z każdym z pozostałych elementów lewej połowy.',
    functionName: 'inwersje',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'przykład', input: [[3, 1, 2]], expected: 2 },
      { name: 'odwrócona', input: [[5, 4, 3, 2, 1]], expected: 10 },
      { name: 'posortowana', input: [[1, 2, 3]], expected: 0 },
      { name: 'równe', input: [[2, 2, 1, 1]], expected: 4, hidden: true },
      { name: 'dłuższa', input: [[8, 4, 2, 1, 9, 7, 3, 6, 5]], expected: 19, hidden: true },
    ],
    model: `
      def sortuj_licz(t):
          if len(t) <= 1:
              return t, 0
          s = len(t) // 2
          a, x = sortuj_licz(t[:s])
          b, y = sortuj_licz(t[s:])
          wynik = []
          i = j = 0
          licz = x + y
          while i < len(a) and j < len(b):
              if a[i] <= b[j]:
                  wynik.append(a[i])
                  i += 1
              else:
                  wynik.append(b[j])
                  licz += len(a) - i
                  j += 1
          return wynik + a[i:] + b[j:], licz

      def inwersje(t):
          return sortuj_licz(t)[1]
    `,
    hints: ['Z jakich trzech części składa się liczba inwersji listy?', 'Inwersje w lewej połowie, w prawej połowie i „między” połowami.', 'Inwersje w połowach liczy rekurencja; te między — scalanie.', 'Gdy b[j] < a[i], dodaj `len(a) - i` — tyle elementów lewej połowy jest większych od b[j].'],
    steps: ['Funkcja rekurencyjna zwraca posortowaną listę i liczbę inwersji.', 'Przy scalaniu każde wyprzedzenie przez b[j] dodaje `len(a) - i` inwersji.'],
  }),

  // cs-binary-search ----------------------------------------------------------
  choice({
    id: 'so-b-1',
    skill: 'cs-binary-search',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Jaki warunek musi spełniać lista, żeby można było w niej szukać binarnie?',
    choices: ['musi być posortowana', 'nie może mieć powtórzeń', 'jej długość musi być potęgą dwójki', 'musi zawierać tylko liczby dodatnie'],
    answer: 'A',
    hints: ['Na jakiej podstawie odrzuca się połowę listy?', 'Na podstawie porównania szukanej wartości ze środkiem.', 'Kiedy z takiego porównania wynika, po której stronie leży szukana wartość?', 'Tylko gdy elementy są uporządkowane.'],
    steps: ['Odrzucenie połowy jest poprawne tylko przy uporządkowanych danych.', 'Powtórzenia, długość i znak liczb nie mają znaczenia.'],
    errors: [
      ['B', 'Powtórzenia nie przeszkadzają.', 'Wymagane jest uporządkowanie.'],
      ['C', 'Długość może być dowolna.', 'Środek liczy się dzieleniem całkowitym.'],
      ['D', 'Znak liczb nie ma znaczenia.', 'Wymagane jest uporządkowanie.'],
    ],
  }),
  numeric({
    id: 'so-b-2',
    skill: 'cs-binary-search',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Co wypisze ten program (liczba sprawdzonych środków)?',
    listing: 't = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\nx = 23\nl, p = 0, len(t) - 1\nkroki = 0\nwhile l <= p:\n    s = (l + p) // 2\n    kroki += 1\n    if t[s] == x:\n        break\n    if t[s] < x:\n        l = s + 1\n    else:\n        p = s - 1\nprint(kroki)',
    answer: 3,
    verify: () => {
      const t = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
      let l = 0;
      let p = t.length - 1;
      let k = 0;
      while (l <= p) {
        const s = Math.floor((l + p) / 2);
        k += 1;
        if (t[s] === 23) break;
        if (t[s]! < 23) l = s + 1;
        else p = s - 1;
      }
      return k;
    },
    hints: ['Jaki jest pierwszy środek?', '(0 + 9) // 2 = 4, czyli t[4] = 16.', '16 < 23 → l = 5; następny środek (5 + 9) // 2 = 7.', 't[7] = 56 > 23 → p = 6; środek (5 + 6) // 2 = 5.'],
    steps: ['Środki: indeks 4 (16), indeks 7 (56), indeks 5 (23).', 'Trafienie w trzecim kroku.'],
    errors: [['6', 'Pomylony indeks z liczbą kroków.', 'Program liczy sprawdzone środki, nie pozycję.']],
  }),
  pyTask({
    id: 'so-b-3',
    skill: 'cs-binary-search',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Napisz funkcję `szukaj(t, x)`, która wyszukiwaniem binarnym zwraca indeks x w liście posortowanej rosnąco bez powtórzeń albo -1, gdy x nie występuje.',
    functionName: 'szukaj',
    params: ['t', 'x'],
    types: 'posortowana list[int], int -> int',
    tests: [
      { name: 'jest', input: [[2, 5, 8, 12, 16, 23], 12], expected: 3 },
      { name: 'brak', input: [[2, 5, 8], 6], expected: -1 },
      { name: 'pierwszy', input: [[1, 3, 5], 1], expected: 0 },
      { name: 'ostatni', input: [[1, 3, 5, 7, 9, 11], 11], expected: 5, hidden: true },
      { name: 'pusta', input: [[], 4], expected: -1, hidden: true },
      { name: 'mniejszy od wszystkich', input: [[10, 20, 30], 5], expected: -1, hidden: true },
    ],
    model: `
      def szukaj(t, x):
          l, p = 0, len(t) - 1
          while l <= p:
              s = (l + p) // 2
              if t[s] == x:
                  return s
              if t[s] < x:
                  l = s + 1
              else:
                  p = s - 1
          return -1
    `,
    hints: ['Jakie dwie zmienne opisują przedział, w którym jeszcze szukasz?', 'Lewy i prawy koniec: l = 0, p = len(t) − 1.', 'Porównaj x ze środkiem; mniejszy środek → l = s + 1, większy → p = s − 1.', 'Gdy l > p, elementu nie ma.'],
    steps: ['Przedział [l, p]; środek s = (l + p) // 2.', 'Trafienie zwraca s; inaczej odrzucasz połowę; pusty przedział → −1.'],
  }),
  pyTask({
    id: 'so-b-4',
    skill: 'cs-binary-search',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Lista posortowana rosnąco może mieć powtórzenia. Napisz funkcję `pierwsze(t, x)`, która w czasie logarytmicznym zwraca indeks PIERWSZEGO wystąpienia x albo -1.',
    functionName: 'pierwsze',
    params: ['t', 'x'],
    types: 'posortowana list[int], int -> int',
    tests: [
      { name: 'powtórzenia', input: [[1, 2, 2, 2, 3], 2], expected: 1 },
      { name: 'brak', input: [[1, 3, 5], 2], expected: -1 },
      { name: 'wszystkie równe', input: [[7, 7, 7, 7], 7], expected: 0 },
      { name: 'na końcu', input: [[1, 2, 3, 4, 4], 4], expected: 3, hidden: true },
      { name: 'większy od wszystkich', input: [[1, 2], 9], expected: -1, hidden: true },
    ],
    model: `
      def pierwsze(t, x):
          l, p = 0, len(t)
          while l < p:
              s = (l + p) // 2
              if t[s] < x:
                  l = s + 1
              else:
                  p = s
          if l < len(t) and t[l] == x:
              return l
          return -1
    `,
    hints: ['Czy przy trafieniu t[s] == x można od razu zakończyć?', 'Nie — wcześniej mogą być kolejne x.', 'Szukaj pierwszej pozycji z t[s] ≥ x: przy t[s] < x → l = s + 1, inaczej p = s.', 'Na końcu sprawdź, czy na pozycji l naprawdę stoi x.'],
    steps: ['Dolna granica: pierwsza pozycja z t[i] ≥ x.', 'Jeśli stoi tam x — to pierwsze wystąpienie; inaczej −1.'],
  }),
  numeric({
    id: 'so-b-5',
    skill: 'cs-binary-search',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ile najwięcej sprawdzeń środka wykona wyszukiwanie binarne w posortowanej liście 1 000 000 elementów?',
    answer: 20,
    verify: () => Math.ceil(Math.log2(1_000_001)),
    hints: ['O ile zmniejsza się przedział po każdym sprawdzeniu?', 'Co najmniej o połowę.', 'Szukasz najmniejszego k, dla którego $2^k > 1\\,000\\,000$.', '$2^{10} \\approx 1000$, więc $2^{20} \\approx$ milion.'],
    steps: ['Po k krokach zostaje co najwyżej $\\frac{n}{2^k}$ elementów.', '$2^{19} = 524\\,288 < 10^6 < 2^{20} = 1\\,048\\,576$ — 20 kroków.'],
    errors: [['1000000', 'Liczba kroków wyszukiwania liniowego.', 'Połowienie daje logarytm z n.']],
  }),
  pyTask({
    id: 'so-b-6',
    skill: 'cs-binary-search',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `w_przedziale(t, a, b)`, która dla listy posortowanej rosnąco zwraca, ile jej elementów leży w przedziale [a, b] — dwoma wyszukiwaniami binarnymi (możesz użyć modułu `bisect`).',
    functionName: 'w_przedziale',
    params: ['t', 'a', 'b'],
    types: 'posortowana list[int], int, int -> int',
    tests: [
      { name: 'przykład', input: [[1, 3, 3, 5, 7, 9], 3, 7], expected: 4 },
      { name: 'pusty wynik', input: [[1, 2, 10], 3, 9], expected: 0 },
      { name: 'wszystkie', input: [[4, 5, 6], 0, 100], expected: 3 },
      { name: 'końce równe', input: [[2, 2, 2, 3], 2, 2], expected: 3, hidden: true },
      { name: 'a > b', input: [[1, 2, 3], 3, 1], expected: 0, hidden: true },
    ],
    model: `
      import bisect

      def w_przedziale(t, a, b):
          if a > b:
              return 0
          return bisect.bisect_right(t, b) - bisect.bisect_left(t, a)
    `,
    hints: ['Jak jednym wyszukiwaniem policzyć elementy mniejsze od a?', 'Pozycja pierwszego elementu ≥ a — `bisect_left(t, a)`.', 'Elementy ≤ b to `bisect_right(t, b)`.', 'Różnica tych pozycji to liczba elementów w [a, b]; osobno przypadek a > b.'],
    steps: ['`bisect_left(t, a)` — elementów mniejszych od a; `bisect_right(t, b)` — elementów ≤ b.', 'Wynik to różnica (dla a > b zero).'],
  }),
  pyTask({
    id: 'so-b-7',
    skill: 'cs-binary-search',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Paczki o wagach z listy trzeba przewieźć W PODANEJ KOLEJNOŚCI k samochodami: każdy bierze spójny fragment listy. Napisz funkcję `ladownosc(paczki, k)`, która zwraca najmniejszą ładowność L, przy której się to uda. Wskazówka: wyszukiwanie binarne po L i zachłanne sprawdzenie, ilu samochodów potrzeba.',
    functionName: 'ladownosc',
    params: ['paczki', 'k'],
    types: 'list[int > 0], int ≥ 1 -> int',
    tests: [
      { name: 'dziesięć paczek', input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
      { name: 'trzy samochody', input: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
      { name: 'dużo samochodów', input: [[1, 2, 3, 1, 1], 4], expected: 3 },
      { name: 'jedna paczka', input: [[10], 1], expected: 10, hidden: true },
      { name: 'dwa samochody', input: [[7, 2, 5, 10, 8], 2], expected: 18, hidden: true },
      { name: 'równe', input: [[5, 5, 5, 5], 2], expected: 10, hidden: true },
    ],
    model: `
      def ile_aut(paczki, L):
          auta = 1
          ladunek = 0
          for w in paczki:
              if ladunek + w > L:
                  auta += 1
                  ladunek = 0
              ladunek += w
          return auta

      def ladownosc(paczki, k):
          lo, hi = max(paczki), sum(paczki)
          while lo < hi:
              s = (lo + hi) // 2
              if ile_aut(paczki, s) <= k:
                  hi = s
              else:
                  lo = s + 1
          return lo
    `,
    hints: ['Jak sprawdzić, czy dana ładowność L wystarczy?', 'Zachłannie: ładuj paczki po kolei, a gdy kolejna się nie mieści — bierz następny samochód.', 'Jeśli L wystarcza, każda większa też — można szukać binarnie.', 'Zakres szukania: od największej paczki do sumy wszystkich.'],
    steps: ['Funkcja pomocnicza zachłannie liczy samochody potrzebne przy ładowności L.', 'Binarnie szukasz najmniejszego L z [max, suma], dla którego samochodów jest ≤ k.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const SORT_CARDS: Flashcard[] = [
  card('c-so-s-1', 'cs-search-sort', 'definicja', 'Co trafia na koniec po przebiegu sortowania bąbelkowego?', 'Największy z nieposortowanych elementów.'),
  card('c-so-s-2', 'cs-search-sort', 'wzor', 'Ile porównań wykonuje sortowanie bąbelkowe n elementów?', '$\\frac{n(n-1)}{2}$'),

  card('c-so-m-1', 'cs-sort-advanced', 'wzor', 'Złożoność sortowania przez scalanie?', '$n \\log n$ — zawsze, także w najgorszym razie.'),
  card('c-so-m-2', 'cs-sort-advanced', 'pulapka', 'Kiedy quicksort z pierwszym elementem jako osią jest wolny?', 'Dla danych już posortowanych — $n^2$.'),

  card('c-so-b-1', 'cs-binary-search', 'wzor', 'Ile kroków wyszukiwania binarnego dla n elementów?', 'Około $\\log_2 n$ — dla miliona 20.'),
  card('c-so-b-2', 'cs-binary-search', 'metoda', 'Jak znaleźć pierwsze wystąpienie x?', 'Szukaj pierwszej pozycji z t[i] ≥ x (`bisect_left`) i sprawdź, czy stoi tam x.'),
];

import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 7: analiza algorytmów i reprezentacja danych.
 *
 * Podstawa programowa 2024: I.R2 (analiza gotowych implementacji),
 * I.R5 (efektywność), I.R6 (logarytm), I.R7 (reprezentacja znaków, liczb,
 * wartości logicznych), I.R8 (działania arytmetyczne i operacje logiczne),
 * I.R9 (błędy zaokrąglenia i przybliżenia).
 */

export const REPR_TOPIC: Topic = {
  id: 'cs-representation-topic',
  subjectId: 'cs',
  name: 'Analiza algorytmów i reprezentacja danych',
  summary: 'Czytanie cudzego kodu i szacowanie kosztu; zapis liczb w U2 i zmiennoprzecinkowo, kodowanie znaków, logika i operacje bitowe.',
};

export const REPR_SKILLS: Skill[] = [
  {
    id: 'cs-analysis',
    topicId: 'cs-representation-topic',
    name: 'Analiza algorytmów i złożoność',
    level: 'PR',
    ckeRequirement: 'Analiza algorytmów na podstawie gotowych implementacji, ocena efektywności, logarytm (I.R2, I.R5, I.R6)',
    prerequisites: ['cs-binary-search', 'cs-dp'],
    examValue: 0.95,
  },
  {
    id: 'cs-representation',
    topicId: 'cs-representation-topic',
    name: 'Reprezentacja liczb i znaków',
    level: 'PR',
    ckeRequirement: 'Reprezentacja znaków, liczb całkowitych (U2) i rzeczywistych, źródła błędów obliczeń (I.R7, I.R9)',
    prerequisites: ['cs-bases'],
    examValue: 0.7,
  },
  {
    id: 'cs-logic',
    topicId: 'cs-representation-topic',
    name: 'Logika i operacje bitowe',
    level: 'PR',
    ckeRequirement: 'Wartości logiczne, operacje logiczne i bitowe wykonywane przez komputer (I.R7, I.R8)',
    prerequisites: ['cs-representation'],
    examValue: 0.6,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const REPR_LESSONS: Lesson[] = [
  {
    skillId: 'cs-analysis',
    minutes: 16,
    intro:
      'Pierwsze zadanie matury z informatyki to prawie zawsze analiza gotowego algorytmu: „co wypisze dla tych danych”, „co oblicza ta funkcja”, „ile razy wykona się ta instrukcja”. Tu nie piszesz kodu — czytasz go uważnie jak detektyw.',
    blocks: [
      p('Metoda: weź małe dane i zapisz w tabelce wartości zmiennych po każdym obrocie pętli. Po dwóch–trzech obrotach zwykle widać, co algorytm robi. Potem sprawdź hipotezę na innych danych.'),
      listing('def f(n):\n    w = 0\n    while n > 0:\n        w = w * 10 + n % 10\n        n //= 10\n    return w          # odwraca cyfry: f(1230) = 321', 'Tabelka dla n = 123: (w, n) = (0, 123) → (3, 12) → (32, 1) → (321, 0).'),
      p('Złożoność opisuje, jak rośnie liczba operacji wraz z rozmiarem danych n. Pojedyncza pętla to n, dwie zagnieżdżone — $n^2$, pętla dzieląca n na pół — $\\log_2 n$.'),
      f('\\log_2 1024 = 10 \\qquad \\log_2 10^6 \\approx 20 \\qquad 2^{10} \\approx 10^3', 'Logarytm to liczba połowień — warto znać te wartości na pamięć.'),
      tip('Szacowanie czasu: algorytm $n^2$ przy 3 razy większych danych działa 9 razy dłużej, algorytm liniowy — 3 razy dłużej, a $\\log n$ prawie tyle samo.'),
      warn('Pętla `for j in range(i)` wewnątrz `for i in range(n)` wykonuje się 0 + 1 + … + (n − 1) = $\\frac{n(n-1)}{2}$ razy, a nie $n^2$ — w zadaniach „ile razy” liczy się dokładna wartość.'),
    ],
    examples: [
      example(
        'Ile razy wykona się `licznik += 1` w `for i in range(10): for j in range(i): licznik += 1`?',
        [['Dla i = 0, 1, …, 9 pętla wewnętrzna wykonuje i obrotów.', 'suma ciągu arytmetycznego'], '0 + 1 + … + 9 = 45.'],
        '45',
      ),
      example(
        'Algorytm $n^2$ dla n = 1000 działa 2 s. Ile dla n = 3000?',
        ['Dane 3 razy większe → czas $3^2 = 9$ razy dłuższy.', '9 · 2 s.'],
        '18 s',
      ),
    ],
    pitfalls: ['Zgadywanie wyniku zamiast wypełnienia tabelki.', 'Pomylenie $n^2$ z dokładną liczbą $\\frac{n(n-1)}{2}$.', 'Nieuwzględnienie, że pętla może nie wykonać się ani razu.'],
  },
  {
    skillId: 'cs-representation',
    minutes: 16,
    intro:
      'W pamięci komputera wszystko jest ciągiem bitów: liczby całkowite, ułamki, litery. Sposób zapisu decyduje o zakresie wartości i o błędach, które mogą się pojawić.',
    blocks: [
      p('Na n bitach można zapisać $2^n$ różnych wartości. Liczby bez znaku: od 0 do $2^n - 1$. Kod uzupełnień do dwóch (U2): najstarszy bit ma wagę ujemną $-2^{n-1}$, więc zakres to od $-2^{n-1}$ do $2^{n-1} - 1$ (dla 8 bitów: od −128 do 127).'),
      f('11111010_{U2} = -128 + 64 + 32 + 16 + 8 + 2 = -6'),
      p('Liczbę ujemną −x zapisujesz w U2, odwracając bity zapisu x i dodając 1 — albo prościej: zapisujesz $2^n - x$ dwójkowo.'),
      p('Liczby rzeczywiste zapisuje się zmiennoprzecinkowo: znak, cecha (wykładnik) i mantysa, jak $1{,}01_2 \\cdot 2^3$. Mantysa ma skończoną liczbę bitów, więc ułamki o nieskończonym rozwinięciu dwójkowym (0,1, 0,2) są zaokrąglane.'),
      p('Znaki koduje się numerami: ASCII (7 bitów, np. „A” = 65, „a” = 97) i Unicode zapisywany zwykle w UTF-8, gdzie znaki ASCII zajmują 1 bajt, a polskie litery — 2 bajty.'),
      tip('Ułamek ma skończone rozwinięcie dwójkowe tylko wtedy, gdy w mianowniku (po skróceniu) jest sama potęga dwójki: 0,625 = 5/8 tak, 0,1 = 1/10 nie.'),
      warn('Przekroczenie zakresu (nadmiar) w U2 „zawija” wynik: 127 + 1 na 8 bitach daje −128. Python ma liczby całkowite bez limitu, ale inne języki i procesory — nie.'),
    ],
    examples: [
      example(
        'Zapisz −6 w 8-bitowym U2.',
        [['6 = 00000110; odwracasz bity: 11111001; dodajesz 1.', 'albo: 256 − 6 = 250 zapisane dwójkowo'], 'Wynik: 11111010.'],
        '11111010',
      ),
      example(
        'Ile bajtów zajmuje słowo „zażółć” w UTF-8?',
        ['Litery z, a — po 1 bajcie; ż, ó, ł, ć — po 2 bajty.', '2 · 1 + 4 · 2.'],
        '10',
      ),
    ],
    pitfalls: ['Zakres U2 do +128 zamiast +127.', 'Liczenie polskich liter jako 1 bajt w UTF-8.', 'Założenie, że każdy ułamek dziesiętny da się zapisać dokładnie.'],
  },
  {
    skillId: 'cs-logic',
    minutes: 13,
    intro:
      'Procesor wykonuje na bitach cztery podstawowe operacje logiczne: koniunkcję (AND), alternatywę (OR), negację (NOT) i alternatywę wykluczającą (XOR). Z bramek realizujących te operacje zbudowany jest każdy komputer.',
    blocks: [
      listing('print(12 & 10)   # AND: 1100 & 1010 = 1000 = 8\nprint(12 | 10)   # OR:  1100 | 1010 = 1110 = 14\nprint(12 ^ 10)   # XOR: 1100 ^ 1010 = 0110 = 6\nprint(5 << 3)    # przesunięcie w lewo = mnożenie przez 2³ = 40\nprint(40 >> 2)   # przesunięcie w prawo = dzielenie przez 2² = 10'),
      p('XOR daje 1, gdy bity są RÓŻNE. Ma ważną własność: `(x ^ k) ^ k == x` — ten sam klucz szyfruje i odszyfrowuje. Prawa De Morgana: `not (a and b)` to `(not a) or (not b)`, a `not (a or b)` to `(not a) and (not b)`.'),
      p('Maski bitowe: `n & 1` daje ostatni bit (parzystość), `(n >> i) & 1` — i-ty bit, `1 << i` — liczbę z jedynką tylko na pozycji i. Liczba n > 0 jest potęgą dwójki, gdy `n & (n - 1) == 0`.'),
      tip('Podzbiory zbioru n elementów można przeglądać jako liczby od 0 do $2^n - 1$: bit i mówi, czy element i należy do podzbioru.'),
      warn('W Pythonie `and`/`or`/`not` działają na wartościach logicznych, a `&`/`|`/`~` na bitach liczb. `~5` to −6, a nie 2 — negacja bitowa działa w U2 na wszystkich bitach.'),
    ],
    examples: [
      example(
        'Ile to jest 12 & 10?',
        [['1100 i 1010: jedynka tylko tam, gdzie obie liczby mają jedynkę.', 'AND bit po bicie'], 'Wynik 1000₂.'],
        '8',
      ),
      example(
        'Kiedy `p ^ q` (XOR) jest prawdziwe?',
        ['Gdy dokładnie jedno z p, q jest prawdziwe.', 'Dla (1, 1) i (0, 0) daje fałsz.'],
        'gdy p ≠ q',
      ),
    ],
    pitfalls: ['Pomylenie `&` z `and`.', 'Priorytet: `n & 1 == 0` to `n & (1 == 0)` — potrzebny nawias.', 'Negacja bitowa `~` zamiast `not`.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const REPR_QUESTIONS: Question[] = [
  // cs-analysis ---------------------------------------------------------------
  numeric({
    id: 're-a-1',
    skill: 'cs-analysis',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'licznik = 0\nfor i in range(10):\n    for j in range(i):\n        licznik += 1\nprint(licznik)',
    answer: 45,
    verify: () => (10 * 9) / 2,
    hints: ['Ile razy wykonuje się pętla wewnętrzna dla danego i?', 'Dokładnie i razy.', 'i przebiega wartości od 0 do 9.', 'Zsumuj 0 + 1 + … + 9.'],
    steps: ['Pętla wewnętrzna wykonuje się i razy dla i = 0 … 9.', 'Suma 0 + 1 + … + 9 = 45.'],
    errors: [['100', 'Policzone $n^2$.', 'Pętla wewnętrzna zależy od i: range(i).']],
  }),
  choice({
    id: 're-a-2',
    skill: 'cs-analysis',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Ile razy (w przybliżeniu) wykona się pętla `while n > 1: n //= 2` dla dużego n?',
    choices: ['około $\\log_2 n$', 'około $\\frac{n}{2}$', 'około n', 'około $\\sqrt{n}$'],
    answer: 'A',
    hints: ['Co dzieje się z n w każdym obrocie?', 'Maleje o połowę.', 'Ile razy można dzielić n przez 2, zanim dojdzie do 1?', 'To definicja logarytmu przy podstawie 2.'],
    steps: ['Każdy obrót połowi n.', 'Po k obrotach n ≈ n₀ / 2^k; dochodzi do 1 po około $\\log_2 n$ krokach.'],
    errors: [
      ['B', 'Uznano, że n maleje o 2.', 'n jest DZIELONE przez 2, a nie zmniejszane o 2.'],
      ['C', 'Pętla liniowa zmniejsza n o 1.', 'Dzielenie przez 2 daje logarytm.'],
      ['D', 'Pierwiastek pojawia się przy teście pierwszości.', 'Połowienie daje logarytm.'],
    ],
  }),
  numeric({
    id: 're-a-3',
    skill: 'cs-analysis',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Co wypisze ten program?',
    listing: 'def f(n):\n    w = 0\n    while n > 0:\n        w = w * 10 + n % 10\n        n //= 10\n    return w\n\nprint(f(1230) + f(45))',
    answer: 375,
    verify: () => 321 + 54,
    hints: ['Co robi funkcja f? Sprawdź ją na małej liczbie.', 'Dla n = 12: w = 2, potem 21.', 'f odwraca kolejność cyfr; zera z przodu znikają.', 'Odwróć 1230 i 45, potem dodaj.'],
    steps: ['f(1230) = 0321 = 321, f(45) = 54.', 'Suma: 375.'],
    errors: [['3255', 'Zero z końca 1230 potraktowane jako cyfra w wyniku.', 'Po odwróceniu 0 stoi z przodu i nie ma wartości.']],
  }),
  choice({
    id: 're-a-4',
    skill: 'cs-analysis',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Co oblicza funkcja g dla liczby naturalnej n?',
    listing: 'def g(n):\n    k = 0\n    while n > 0:\n        k += n % 2\n        n //= 2\n    return k',
    choices: ['liczbę jedynek w zapisie dwójkowym n', 'liczbę cyfr n w zapisie dwójkowym', 'resztę z dzielenia n przez 2', 'największą potęgę dwójki dzielącą n'],
    answer: 'A',
    hints: ['Co oznacza `n % 2` w kolejnych obrotach pętli?', 'Kolejne cyfry zapisu dwójkowego, od najmłodszej.', 'k sumuje te cyfry.', 'Suma cyfr dwójkowych to liczba jedynek.'],
    steps: ['Pętla przechodzi po cyfrach dwójkowych n (reszty z dzielenia przez 2).', 'k to ich suma — liczba jedynek.'],
    errors: [
      ['B', 'Liczba cyfr to liczba obrotów pętli, a nie suma reszt.', 'k dodaje reszty, nie jedynki za każdy obrót.'],
      ['C', 'Reszta z dzielenia to tylko pierwszy krok.', 'Pętla przechodzi przez wszystkie cyfry.'],
      ['D', 'To inna wielkość.', 'Sprawdź na n = 6 (110₂): g(6) = 2.'],
    ],
  }),
  numeric({
    id: 're-a-5',
    skill: 'cs-analysis',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Algorytm o złożoności $n^2$ przetwarza dane o rozmiarze n = 1000 w 2 sekundy. Ile sekund zajmie mu przetworzenie danych o rozmiarze n = 3000?',
    answer: 18,
    verify: () => 2 * 3 ** 2,
    hints: ['Ile razy wzrosło n?', 'Trzykrotnie.', 'Jak zmienia się $n^2$, gdy n rośnie trzykrotnie?', 'Rośnie $3^2$ razy.'],
    steps: ['n rośnie 3 razy, więc $n^2$ rośnie 9 razy.', 'Czas: 9 · 2 s = 18 s.'],
    errors: [['6', 'Przyjęta złożoność liniowa.', 'Przy $n^2$ czas rośnie z kwadratem rozmiaru.']],
  }),
  numeric({
    id: 're-a-6',
    skill: 'cs-analysis',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Co wypisze ten program?',
    listing: 'x = 0\ni = 1\nwhile i < 1000:\n    for j in range(i):\n        x += 1\n    i *= 2\nprint(x)',
    answer: 1023,
    verify: () => {
      let x = 0;
      for (let i = 1; i < 1000; i *= 2) x += i;
      return x;
    },
    hints: ['Jakie wartości przyjmuje i?', 'Kolejne potęgi dwójki mniejsze od 1000.', 'Dla każdej z nich pętla wewnętrzna dodaje i do x.', 'Suma 1 + 2 + 4 + … + 512.'],
    steps: ['i = 1, 2, 4, …, 512; x rośnie o i w każdym obrocie.', 'Suma potęg dwójki: $2^{10} - 1 = 1023$.'],
    errors: [['1000', 'Założono, że x dochodzi do 1000.', 'Sumuje się potęgi dwójki do 512.']],
  }),
  pyTask({
    id: 're-a-7',
    skill: 'cs-analysis',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Prosty algorytm liczy pary i < j, dla których t[i] + t[j] dzieli się przez k, sprawdzając wszystkie pary ($n^2$). Napisz funkcję `pary_podzielne(t, k)` działającą w czasie liniowym: zlicz, ile liczb daje każdą resztę z dzielenia przez k.',
    functionName: 'pary_podzielne',
    params: ['t', 'k'],
    types: 'list[int ≥ 0], int ≥ 1 -> int',
    tests: [
      { name: 'przykład', input: [[1, 2, 3, 4, 5], 3], expected: 4 },
      { name: 'równe', input: [[2, 2, 2], 2], expected: 3 },
      { name: 'brak par', input: [[1, 2], 5], expected: 0 },
      { name: 'dużo zer', input: [[0, 3, 6, 9, 1, 2], 3], expected: 7, hidden: true },
      { name: 'k parzyste', input: [[5, 10, 15, 20, 25], 5], expected: 10, hidden: true },
    ],
    model: `
      def pary_podzielne(t, k):
          reszty = [0] * k
          for x in t:
              reszty[x % k] += 1
          pary = reszty[0] * (reszty[0] - 1) // 2
          for r in range(1, k // 2 + 1):
              if r == k - r:
                  pary += reszty[r] * (reszty[r] - 1) // 2
              else:
                  pary += reszty[r] * reszty[k - r]
          return pary
    `,
    hints: ['Kiedy suma dwóch liczb dzieli się przez k, jeśli znasz ich reszty?', 'Gdy reszty sumują się do 0 albo do k.', 'Zlicz liczby o każdej reszcie; pary reszt r i k − r mnożysz.', 'Reszta 0 (i reszta k/2 przy parzystym k) łączy się sama ze sobą: $\\frac{c(c-1)}{2}$ par.'],
    steps: ['Tablica liczności reszt modulo k.', 'Pary: reszty r i k − r mnożysz; reszty 0 i k/2 — liczba par c(c − 1)/2.'],
  }),

  // cs-representation ---------------------------------------------------------
  numeric({
    id: 're-r-1',
    skill: 'cs-representation',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Ile różnych wartości można zapisać na 8 bitach?',
    answer: 256,
    verify: () => 2 ** 8,
    hints: ['Ile wartości może mieć jeden bit?', 'Dwie: 0 i 1.', 'Każdy kolejny bit podwaja liczbę możliwości.', 'Policz $2^8$.'],
    steps: ['Każdy z 8 bitów ma 2 możliwości.', '$2^8 = 256$.'],
    errors: [['255', 'Podana największa liczba bez znaku.', 'Wartości od 0 do 255 to 256 różnych.']],
  }),
  choice({
    id: 're-r-2',
    skill: 'cs-representation',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jak wygląda liczba −1 w 8-bitowym kodzie U2?',
    choices: ['11111111', '10000001', '10000000', '01111111'],
    answer: 'A',
    hints: ['Jaką wagę ma najstarszy bit w U2?', 'Ujemną: −128.', 'Jak z −128 i dodatnich wag 64, 32, …, 1 uzyskać −1?', '−128 + 127 = −1.'],
    steps: ['−1 = −128 + 64 + 32 + 16 + 8 + 4 + 2 + 1.', 'Wszystkie bity są jedynkami.'],
    errors: [
      ['B', 'To zapis znak-moduł, nie U2.', 'W U2 −128 + 1 = −127.'],
      ['C', 'To −128.', 'Sam najstarszy bit ma wagę −128.'],
      ['D', 'To +127.', 'Najstarszy bit 0 oznacza liczbę nieujemną.'],
    ],
  }),
  numeric({
    id: 're-r-3',
    skill: 'cs-representation',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jaka jest najmniejsza liczba, którą da się zapisać w 8-bitowym kodzie U2?',
    answer: -128,
    verify: () => -(2 ** 7),
    hints: ['Jaką wagę ma najstarszy bit?', '$-2^7$.', 'Żeby liczba była najmniejsza, pozostałe bity (o dodatnich wagach) powinny być zerami.', 'Zapis 10000000.'],
    steps: ['Najstarszy bit ma wagę −128, pozostałe są dodatnie.', 'Minimum: 10000000 = −128.'],
    errors: [['-127', 'Symetryczny zakres jak w zapisie znak-moduł.', 'U2 ma o jedną liczbę ujemną więcej niż dodatnich.']],
  }),
  pyTask({
    id: 're-r-4',
    skill: 'cs-representation',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `na_u2(x, bity)`, która zwraca zapis liczby całkowitej x w kodzie U2 na podanej liczbie bitów (jako napis zer i jedynek). Liczba na pewno mieści się w zakresie.',
    functionName: 'na_u2',
    params: ['x', 'bity'],
    types: 'int, int -> str',
    tests: [
      { name: 'dodatnia', input: [5, 8], expected: '00000101' },
      { name: 'minus jeden', input: [-1, 8], expected: '11111111' },
      { name: 'minimum', input: [-128, 8], expected: '10000000' },
      { name: 'cztery bity', input: [-5, 4], expected: '1011', hidden: true },
      { name: 'zero', input: [0, 4], expected: '0000', hidden: true },
      { name: 'minus sześć', input: [-6, 8], expected: '11111010', hidden: true },
    ],
    model: `
      def na_u2(x, bity):
          if x < 0:
              x += 2 ** bity
          wynik = ""
          for _ in range(bity):
              wynik = str(x % 2) + wynik
              x //= 2
          return wynik
    `,
    hints: ['Jaką liczbę bez znaku zapisuje ten sam ciąg bitów co ujemne x w U2?', '$2^{bity} + x$.', 'Dla x < 0 dodaj $2^{bity}$, potem zamień na dwójkowy.', 'Uzupełnij zapis zerami z przodu do pełnej liczby bitów.'],
    steps: ['Ujemne x zamieniasz na $2^{bity} + x$.', 'Wynik zapisujesz dwójkowo na dokładnie `bity` pozycjach.'],
  }),
  pyTask({
    id: 're-r-5',
    skill: 'cs-representation',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `z_u2(s)`, która odczytuje liczbę zapisaną w kodzie U2 jako napis zer i jedynek (długość napisu = liczba bitów).',
    functionName: 'z_u2',
    params: ['s'],
    types: 'str -> int',
    tests: [
      { name: 'minus jeden', input: ['11111111'], expected: -1 },
      { name: 'dodatnia', input: ['0111'], expected: 7 },
      { name: 'minimum czterobitowe', input: ['1000'], expected: -8 },
      { name: 'minimum ośmiobitowe', input: ['10000000'], expected: -128, hidden: true },
      { name: 'minus pięć', input: ['1011'], expected: -5, hidden: true },
      { name: 'zero', input: ['0'], expected: 0, hidden: true },
    ],
    model: `
      def z_u2(s):
          n = len(s)
          wynik = 0
          for c in s:
              wynik = wynik * 2 + int(c)
          if s[0] == "1":
              wynik -= 2 ** n
          return wynik
    `,
    hints: ['Czym różni się odczyt U2 od zwykłego odczytu dwójkowego?', 'Tylko wagą najstarszego bitu: $-2^{n-1}$ zamiast $+2^{n-1}$.', 'Odczytaj napis jak liczbę bez znaku.', 'Jeśli najstarszy bit to 1, odejmij $2^n$.'],
    steps: ['Wartość bez znaku liczysz schematem Hornera.', 'Przy najstarszym bicie 1 odejmujesz $2^n$ (waga $-2^{n-1}$ zamiast $+2^{n-1}$).'],
  }),
  numeric({
    id: 're-r-6',
    skill: 'cs-representation',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Ile bajtów zajmuje napis „zażółć” zakodowany w UTF-8?',
    answer: 10,
    verify: () => new TextEncoder().encode('zażółć').length,
    hints: ['Ile bajtów zajmuje w UTF-8 litera z alfabetu łacińskiego bez ogonka?', 'Jeden.', 'A polskie litery ze znakami diakrytycznymi?', 'Po dwa bajty.'],
    steps: ['z, a — po 1 bajcie; ż, ó, ł, ć — po 2 bajty.', '2 + 8 = 10 bajtów.'],
    errors: [['6', 'Każdy znak liczony jako 1 bajt.', 'Polskie litery zajmują w UTF-8 dwa bajty.']],
  }),
  choice({
    id: 're-r-7',
    skill: 'cs-representation',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Który ułamek ma skończone rozwinięcie dwójkowe (da się go zapisać dokładnie w typie float)?',
    choices: ['0,625', '0,1', '0,2', '0,3'],
    answer: 'A',
    hints: ['Kiedy ułamek ma skończone rozwinięcie w systemie dwójkowym?', 'Gdy jego mianownik po skróceniu jest potęgą dwójki.', 'Zapisz każdą liczbę jako ułamek zwykły.', '0,625 = 5/8.'],
    steps: ['0,625 = 5/8 = 0,101₂ — mianownik 8 = 2³.', '0,1 = 1/10, 0,2 = 1/5, 0,3 = 3/10 — mianowniki z czynnikiem 5.'],
    errors: [
      ['B', 'Skończony zapis dziesiętny nie oznacza skończonego dwójkowego.', 'Mianownik 10 zawiera czynnik 5.'],
      ['C', '1/5 ma nieskończone rozwinięcie dwójkowe.', 'Mianownik musi być potęgą dwójki.'],
      ['D', '3/10 ma mianownik z czynnikiem 5.', 'Mianownik musi być potęgą dwójki.'],
    ],
  }),
  pyTask({
    id: 're-r-8',
    skill: 'cs-representation',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `ulamek_dwojkowy(l, m, n)`, która zwraca pierwsze n cyfr rozwinięcia dwójkowego ułamka l/m (0 ≤ l < m) w postaci napisu „0.” + n cyfr. Licz na liczbach całkowitych: mnóż przez 2 i odczytuj część całkowitą.',
    functionName: 'ulamek_dwojkowy',
    params: ['l', 'm', 'n'],
    types: 'int, int, int -> str',
    tests: [
      { name: 'pięć ósmych', input: [5, 8, 3], expected: '0.101' },
      { name: 'jedna dziesiąta', input: [1, 10, 8], expected: '0.00011001' },
      { name: 'jedna trzecia', input: [1, 3, 6], expected: '0.010101' },
      { name: 'zero', input: [0, 1, 4], expected: '0.0000', hidden: true },
      { name: 'siedem ósmych', input: [7, 8, 5], expected: '0.11100', hidden: true },
    ],
    model: `
      def ulamek_dwojkowy(l, m, n):
          wynik = "0."
          for _ in range(n):
              l *= 2
              wynik += str(l // m)
              l %= m
          return wynik
    `,
    hints: ['Jak znaleźć pierwszą cyfrę po przecinku w systemie dwójkowym?', 'Pomnóż ułamek przez 2 — część całkowita to ta cyfra.', 'Na liczbach całkowitych: l ← 2l, cyfra = l // m, l ← l % m.', 'Powtórz n razy, doklejając cyfry.'],
    steps: ['Mnożysz licznik przez 2; cyfra to 2l // m, reszta l % m zostaje na następny krok.', 'n powtórzeń daje n cyfr po „0.”.'],
  }),

  // cs-logic ------------------------------------------------------------------
  numeric({
    id: 're-l-1',
    skill: 'cs-logic',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze `print(12 & 10)`?',
    answer: 8,
    verify: () => 12 & 10,
    hints: ['Jak wyglądają 12 i 10 w systemie dwójkowym?', '1100 i 1010.', 'AND daje 1 tylko tam, gdzie obie liczby mają 1.', 'Wspólna jedynka jest tylko na pozycji o wadze 8.'],
    steps: ['1100 & 1010 = 1000.', '1000₂ = 8.'],
    errors: [['14', 'Użyte OR zamiast AND.', '& daje jedynkę tylko przy dwóch jedynkach.']],
  }),
  choice({
    id: 're-l-2',
    skill: 'cs-logic',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Które wyrażenie jest prawdziwe DOKŁADNIE wtedy, gdy prawdziwe jest dokładnie jedno ze zdań p, q?',
    choices: ['`p != q` (XOR)', '`p and q`', '`p or q`', '`not (p or q)`'],
    answer: 'A',
    hints: ['Jaką wartość powinno dać szukane wyrażenie, gdy p i q są oba prawdziwe?', 'Fałsz — prawdziwe są wtedy dwa zdania, a nie jedno.', 'Dla p = True, q = False musi dać True.', 'To alternatywa wykluczająca.'],
    steps: ['XOR jest prawdziwe, gdy p i q mają różne wartości.', '`or` daje też True dla p = q = True, `and` wymaga obu.'],
    errors: [
      ['B', 'Koniunkcja wymaga obu zdań.', 'Dla dokładnie jednego zdania daje False.'],
      ['C', 'Alternatywa jest prawdziwa też dla obu zdań.', 'Dla p = q = True daje True.'],
      ['D', 'To zaprzeczenie alternatywy — prawdziwe, gdy oba fałszywe.', 'Szukamy dokładnie jednego prawdziwego.'],
    ],
  }),
  numeric({
    id: 're-l-3',
    skill: 'cs-logic',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Co wypisze `print(5 << 3)`?',
    answer: 40,
    verify: () => 5 << 3,
    hints: ['Co robi przesunięcie bitów o jedną pozycję w lewo?', 'Mnoży liczbę przez 2.', 'Przesunięcie o 3 pozycje to mnożenie przez $2^3$.', 'Policz 5 · 8.'],
    steps: ['101₂ przesunięte o 3 w lewo to 101000₂.', '= 5 · 8 = 40.'],
    errors: [['15', 'Mnożenie przez 3 zamiast przez 2³.', 'Każda pozycja przesunięcia to czynnik 2.']],
  }),
  pyTask({
    id: 're-l-4',
    skill: 'cs-logic',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `potega_dwojki(n)`, która sprawdza, czy liczba całkowita n jest potęgą dwójki (1, 2, 4, 8, …). Użyj jednej operacji bitowej zamiast pętli.',
    functionName: 'potega_dwojki',
    params: ['n'],
    types: 'int -> bool',
    tests: [
      { name: 'jedynka', input: [1], expected: true },
      { name: 'sześćdziesiąt cztery', input: [64], expected: true },
      { name: 'sześć', input: [6], expected: false },
      { name: 'zero', input: [0], expected: false, hidden: true },
      { name: 'ujemna', input: [-8], expected: false, hidden: true },
      { name: 'duża', input: [1073741824], expected: true, hidden: true },
    ],
    model: `
      def potega_dwojki(n):
          return n > 0 and n & (n - 1) == 0
    `,
    hints: ['Jak wygląda potęga dwójki w zapisie dwójkowym?', 'Jedna jedynka i same zera: 1000…', 'Co daje n − 1 dla takiej liczby? 0111…', 'n & (n − 1) == 0 tylko dla potęg dwójki; wyklucz n ≤ 0.'],
    steps: ['Potęga dwójki ma dokładnie jedną jedynkę; n − 1 ma jedynki dokładnie tam, gdzie n ma zera.', 'Warunek: n > 0 i n & (n − 1) == 0.'],
  }),
  choice({
    id: 're-l-5',
    skill: 'cs-logic',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Które wyrażenie jest równoważne `not (a and b)`?',
    choices: ['`(not a) or (not b)`', '`(not a) and (not b)`', '`not a and b`', '`a or b`'],
    answer: 'A',
    hints: ['Kiedy `a and b` jest fałszywe?', 'Gdy co najmniej jedno z a, b jest fałszywe.', 'Zapisz „co najmniej jedno fałszywe” za pomocą not i or.', 'To prawo De Morgana.'],
    steps: ['`not (a and b)` jest prawdziwe, gdy a albo b jest fałszywe.', 'Prawo De Morgana: `(not a) or (not b)`.'],
    errors: [
      ['B', 'Zamienione or na and.', 'Negacja koniunkcji to alternatywa negacji.'],
      ['C', 'not dotyczy tylko a.', 'Negacja musi objąć oba zdania.'],
      ['D', 'Brak negacji.', 'Dla a = b = True wyrażenie ma być fałszywe.'],
    ],
  }),
  pyTask({
    id: 're-l-6',
    skill: 'cs-logic',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Szyfr XOR: każdy znak zamieniasz na jego kod (`ord`) XOR klucz. Napisz funkcję `xor_szyfr(tekst, klucz)`, która zwraca listę zaszyfrowanych kodów. (Ten sam klucz zastosowany drugi raz odszyfrowuje.)',
    functionName: 'xor_szyfr',
    params: ['tekst', 'klucz'],
    types: 'str, int (0–255) -> list[int]',
    tests: [
      { name: 'klucz 1', input: ['AB', 1], expected: [64, 67] },
      { name: 'pusty', input: ['', 5], expected: [] },
      { name: 'klucz 0', input: ['a', 0], expected: [97] },
      { name: 'klucz 255', input: ['Kot', 255], expected: [180, 144, 139], hidden: true },
    ],
    model: `
      def xor_szyfr(tekst, klucz):
          return [ord(c) ^ klucz for c in tekst]
    `,
    hints: ['Jak zamienić znak na jego kod?', 'Funkcją `ord`.', 'XOR w Pythonie to operator `^`.', 'Zbuduj listę `ord(c) ^ klucz` dla każdego znaku.'],
    steps: ['Kod znaku: `ord(c)`.', 'Szyfrogram: lista `ord(c) ^ klucz`.'],
  }),
  pyTask({
    id: 're-l-7',
    skill: 'cs-logic',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `podzbiory_suma(t, s)`, która zwraca, ile podzbiorów listy t (co najwyżej 15 elementów; elementy na różnych pozycjach są rozróżnialne) ma sumę równą s. Przeglądaj podzbiory jako maski bitowe od 0 do $2^n - 1$.',
    functionName: 'podzbiory_suma',
    params: ['t', 's'],
    types: 'list[int], int -> int',
    tests: [
      { name: 'przykład', input: [[1, 2, 3], 3], expected: 2 },
      { name: 'powtórzenia', input: [[1, 1, 1], 2], expected: 3 },
      { name: 'pusty zbiór', input: [[], 0], expected: 1 },
      { name: 'parzyste', input: [[2, 4, 6, 8, 10], 10], expected: 3, hidden: true },
      { name: 'piątki', input: [[5, 5, 5, 5], 10], expected: 6, hidden: true },
    ],
    model: `
      def podzbiory_suma(t, s):
          n = len(t)
          ile = 0
          for maska in range(1 << n):
              suma = 0
              for i in range(n):
                  if (maska >> i) & 1:
                      suma += t[i]
              if suma == s:
                  ile += 1
          return ile
    `,
    hints: ['Ile podzbiorów ma zbiór n-elementowy?', '$2^n$ — tyle, ile liczb od 0 do $2^n - 1$.', 'Bit i maski mówi, czy element t[i] należy do podzbioru: `(maska >> i) & 1`.', 'Dla każdej maski policz sumę i porównaj z s.'],
    steps: ['Maski od 0 do $2^n - 1$ odpowiadają wszystkim podzbiorom.', 'Suma elementów z ustawionymi bitami; liczysz maski z sumą s.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const REPR_CARDS: Flashcard[] = [
  card('c-re-a-1', 'cs-analysis', 'metoda', 'Jak analizować nieznany algorytm?', 'Tabelka wartości zmiennych po każdym obrocie dla małych danych, potem hipoteza i sprawdzenie.'),
  card('c-re-a-2', 'cs-analysis', 'wzor', 'Ile to $\\log_2$ z miliona?', 'Około 20 ($2^{20} \\approx 10^6$).'),

  card('c-re-r-1', 'cs-representation', 'wzor', 'Zakres liczb w U2 na n bitach?', 'Od $-2^{n-1}$ do $2^{n-1} - 1$.'),
  card('c-re-r-2', 'cs-representation', 'definicja', 'Ile bajtów ma polska litera w UTF-8?', 'Dwa (znaki ASCII — jeden).'),

  card('c-re-l-1', 'cs-logic', 'wzor', 'Prawa De Morgana?', '`not (a and b)` = `not a or not b`; `not (a or b)` = `not a and not b`.'),
  card('c-re-l-2', 'cs-logic', 'metoda', 'Test potęgi dwójki bitowo?', '`n > 0 and n & (n - 1) == 0`'),
];

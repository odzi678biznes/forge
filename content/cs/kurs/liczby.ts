import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, listing, numeric, p, pyTask, text, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 3: algorytmy na liczbach.
 *
 * Podstawa programowa 2024: I.2a (pierwszość, systemy pozycyjne, NWD i NWW
 * w działaniach na ułamkach), I+II.1a (Euklides iteracyjnie i rekurencyjnie),
 * I+II.1c (sito Eratostenesa), I+II.1f (połowienie — miejsca zerowe),
 * I+II.1g (przybliżony pierwiastek), I+II.1h (schemat Hornera), I+II.1i
 * (szybkie potęgowanie), I+II.2a (rozkład na czynniki), I+II.2b (działania
 * w innych systemach), I.R6 (logarytm), I.R9 (błędy zaokrągleń).
 */

export const NUM_TOPIC: Topic = {
  id: 'cs-numbers-topic',
  subjectId: 'cs',
  name: 'Algorytmy na liczbach',
  summary: 'Liczby pierwsze i sito, algorytm Euklidesa, systemy pozycyjne, szybkie potęgowanie, schemat Hornera i metody przybliżone.',
};

export const NUM_SKILLS: Skill[] = [
  {
    id: 'cs-numbers',
    topicId: 'cs-numbers-topic',
    name: 'Liczby pierwsze: test, sito, rozkład',
    level: 'PR',
    ckeRequirement: 'Badanie pierwszości, sito Eratostenesa, rozkład na czynniki pierwsze (I.2a, I+II.1c, I+II.2a)',
    prerequisites: ['cs-arrays'],
    examValue: 0.9,
  },
  {
    id: 'cs-gcd',
    topicId: 'cs-numbers-topic',
    name: 'NWD i NWW: algorytm Euklidesa, ułamki',
    level: 'PR',
    ckeRequirement: 'Algorytm Euklidesa iteracyjnie i rekurencyjnie, działania na ułamkach z NWD i NWW (I.2a, I+II.1a)',
    prerequisites: ['cs-numbers'],
    examValue: 0.8,
  },
  {
    id: 'cs-bases',
    topicId: 'cs-numbers-topic',
    name: 'Systemy pozycyjne',
    level: 'PR',
    ckeRequirement: 'Zamiana między systemami pozycyjnymi, działania w systemach innych niż dziesiętny (I.2a, I+II.2b)',
    prerequisites: ['cs-numbers'],
    examValue: 0.9,
  },
  {
    id: 'cs-fastpow',
    topicId: 'cs-numbers-topic',
    name: 'Szybkie potęgowanie i schemat Hornera',
    level: 'PR',
    ckeRequirement: 'Szybkie potęgowanie iteracyjnie i rekurencyjnie, schemat Hornera, ocena efektywności (I+II.1h, I+II.1i, I.R5)',
    prerequisites: ['cs-bases'],
    examValue: 0.7,
  },
  {
    id: 'cs-approx',
    topicId: 'cs-numbers-topic',
    name: 'Przybliżenia: pierwiastek, połowienie, błędy',
    level: 'PR',
    ckeRequirement: 'Przybliżony pierwiastek, miejsca zerowe metodą połowienia, logarytm, błędy zaokrągleń (I+II.1f, I+II.1g, I.R6, I.R9)',
    prerequisites: ['cs-fastpow'],
    examValue: 0.65,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const NUM_LESSONS: Lesson[] = [
  {
    skillId: 'cs-numbers',
    minutes: 15,
    intro:
      'Liczba pierwsza ma dokładnie dwa dzielniki: 1 i siebie. Sprawdzanie pierwszości to najczęstszy „klocek” w zadaniach maturalnych — warto umieć zrobić to szybko i bez błędu dla 0, 1 i 2.',
    blocks: [
      listing('def czy_pierwsza(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True'),
      p('Wystarczy sprawdzać dzielniki do $\\sqrt{n}$: jeśli $n = a \\cdot b$ i $a \\le b$, to $a \\le \\sqrt{n}$. Dla miliona to tysiąc prób zamiast miliona.'),
      p('Sito Eratostenesa znajduje WSZYSTKIE liczby pierwsze do n naraz: bierze najmniejszą nieskreśloną liczbę, zostawia ją i skreśla jej wielokrotności.'),
      listing('def sito(n):\n    pierwsza = [True] * (n + 1)\n    pierwsza[0:2] = [False, False]\n    for i in range(2, int(n ** 0.5) + 1):\n        if pierwsza[i]:\n            for j in range(i * i, n + 1, i):\n                pierwsza[j] = False\n    return [i for i in range(n + 1) if pierwsza[i]]', 'Skreślanie od i·i — mniejsze wielokrotności skreśliły już mniejsze liczby.'),
      tip('Rozkład na czynniki: dziel n przez d, dopóki się da, potem zwiększ d. To, co zostanie większe od 1 po pętli do √n, jest ostatnim czynnikiem pierwszym.'),
      warn('0 i 1 nie są liczbami pierwszymi, 2 jest jedyną parzystą pierwszą. Te trzy przypadki warto zawsze sprawdzić testem.'),
    ],
    examples: [
      example(
        'Rozłóż 360 na czynniki pierwsze.',
        ['360 : 2 = 180, : 2 = 90, : 2 = 45.', '45 : 3 = 15, : 3 = 5; zostaje 5.'],
        '2 · 2 · 2 · 3 · 3 · 5',
      ),
      example(
        'Ile liczb trzeba sprawdzić jako dzielniki, żeby orzec, że 97 jest pierwsza?',
        [['Dzielniki od 2 do 9, bo 10 · 10 > 97.', 'wystarczy sprawdzać do pierwiastka'], 'Żadna z nich nie dzieli 97.'],
        '8 (od 2 do 9)',
      ),
    ],
    pitfalls: ['Uznanie 1 za liczbę pierwszą.', 'Pętla `d < n` zamiast `d * d <= n` — za wolno dla dużych danych.', 'Zgubiony ostatni czynnik większy od √n.'],
  },
  {
    skillId: 'cs-gcd',
    minutes: 12,
    intro:
      'Algorytm Euklidesa to najstarszy algorytm, który wciąż się stosuje. Opiera się na jednym fakcie: NWD(a, b) = NWD(b, a mod b). Reszta szybko maleje, więc algorytm kończy się po kilku krokach nawet dla ogromnych liczb.',
    blocks: [
      listing('def nwd(a, b):          # wersja iteracyjna\n    while b != 0:\n        a, b = b, a % b\n    return a\n\ndef nwd_rek(a, b):      # wersja rekurencyjna\n    if b == 0:\n        return a\n    return nwd_rek(b, a % b)'),
      f('\\mathrm{NWW}(a, b) = \\frac{a \\cdot b}{\\mathrm{NWD}(a, b)}', 'Najmniejsza wspólna wielokrotność z NWD.'),
      p('Ułamek skracamy, dzieląc licznik i mianownik przez ich NWD. Suma ułamków: wspólny mianownik to NWW mianowników, a wynik znów skracamy.'),
      tip('W Pythonie `a // b * c` liczy się od lewej. Przy NWW dziel przed mnożeniem: `a // nwd(a, b) * b` — mniejsze liczby po drodze.'),
      warn('Rekurencja potrzebuje warunku stopu (`b == 0`) — bez niego funkcja wywołuje się bez końca.'),
    ],
    examples: [
      example(
        'Oblicz NWD(48, 18) algorytmem Euklidesa.',
        ['(48, 18) → (18, 12) → (12, 6) → (6, 0).', 'Gdy druga liczba to 0, pierwsza jest wynikiem.'],
        '6',
      ),
      example(
        'Skróć ułamek $\\frac{84}{126}$.',
        ['NWD(84, 126) = 42.', '84 : 42 = 2, 126 : 42 = 3.'],
        '$\\frac{2}{3}$',
      ),
    ],
    pitfalls: ['Brak warunku stopu w wersji rekurencyjnej.', 'NWW jako a · b — bez dzielenia przez NWD.', 'Ujemny mianownik po skróceniu ułamka.'],
  },
  {
    skillId: 'cs-bases',
    minutes: 15,
    intro:
      'W systemie o podstawie p każda cyfra mnoży się przez potęgę p zależną od pozycji. Komputer liczy w dwójkowym, programiści zapisują bajty w szesnastkowym — a na maturze zamiana systemów jest niemal co roku.',
    blocks: [
      f('1011_2 = 1 \\cdot 2^3 + 0 \\cdot 2^2 + 1 \\cdot 2^1 + 1 = 11', 'Z systemu p na dziesiętny: sumujesz cyfry razy potęgi p.'),
      p('Z dziesiętnego na system p dzielisz liczbę przez p i zapisujesz reszty — czytane od końca dają cyfry. W szesnastkowym cyfry 10–15 to litery A–F.'),
      listing('CYFRY = "0123456789ABCDEF"\n\ndef na_system(n, p):\n    if n == 0:\n        return "0"\n    wynik = ""\n    while n > 0:\n        wynik = CYFRY[n % p] + wynik\n        n //= p\n    return wynik\n\ndef z_systemu(s, p):\n    wynik = 0\n    for c in s:\n        wynik = wynik * p + CYFRY.index(c)\n    return wynik'),
      tip('Jedna cyfra szesnastkowa to dokładnie cztery bity: `F` = `1111`, `A` = `1010`. Zamiana 2 ↔ 16 to grupowanie bitów po cztery od prawej.'),
      warn('Reszty dopisuje się NA POCZĄTEK wyniku (albo odwraca na końcu). Najczęstszy błąd to liczba zapisana od tyłu.'),
    ],
    examples: [
      example(
        'Zamień 100 na system trójkowy.',
        ['100 = 3 · 33 + 1; 33 = 3 · 11 + 0; 11 = 3 · 3 + 2; 3 = 3 · 1 + 0; 1 = 3 · 0 + 1.', 'Reszty od końca: 1, 0, 2, 0, 1.'],
        '$10201_3$',
      ),
      example(
        'Dodaj pisemnie $1011_2 + 110_2$.',
        [['Od prawej: 1 + 0 = 1; 1 + 1 = 10 — piszesz 0, 1 dalej.', 'jak w dziesiętnym, tylko przeniesienie przy 2'], 'Dalej: 0 + 1 + 1 = 10; 1 + 1 = 10.'],
        '$10001_2$',
      ),
    ],
    pitfalls: ['Reszty zapisane w złej kolejności.', 'Cyfry 10–15 zapisane jako „10”, „11” zamiast A, B.', 'Zapomniane przeniesienie przy dodawaniu dwójkowym.'],
  },
  {
    skillId: 'cs-fastpow',
    minutes: 13,
    intro:
      'Dwa klasyczne sposoby na mniej mnożeń. Szybkie potęgowanie liczy $a^n$ w około $\\log_2 n$ krokach zamiast n. Schemat Hornera liczy wartość wielomianu stopnia n przy użyciu tylko n mnożeń.',
    blocks: [
      f('a^n = \\begin{cases} (a^{n/2})^2 & n \\text{ parzyste} \\\\ a \\cdot a^{n-1} & n \\text{ nieparzyste} \\end{cases}'),
      listing('def potega(a, n):          # iteracyjnie, po bitach wykładnika\n    wynik = 1\n    while n > 0:\n        if n % 2 == 1:\n            wynik *= a\n        a *= a\n        n //= 2\n    return wynik\n\ndef potega_rek(a, n):      # rekurencyjnie\n    if n == 0:\n        return 1\n    if n % 2 == 1:\n        return a * potega_rek(a, n - 1)\n    polowa = potega_rek(a, n // 2)\n    return polowa * polowa'),
      p('Schemat Hornera: $2x^3 - 3x^2 + 5 = ((2x - 3)x + 0)x + 5$. Idąc od najwyższego współczynnika, mnożysz dotychczasowy wynik przez x i dodajesz kolejny współczynnik.'),
      listing('def horner(w, x):   # w = współczynniki od najwyższej potęgi\n    wynik = 0\n    for a in w:\n        wynik = wynik * x + a\n    return wynik'),
      tip('Przy potęgach modulo m bierz resztę po KAŻDYM mnożeniu — liczby nie urosną, a wynik będzie ten sam.'),
      warn('Wersja rekurencyjna musi liczyć `potega_rek(a, n // 2)` RAZ i zapamiętać wynik. Dwa wywołania `potega_rek(a, n // 2) * potega_rek(a, n // 2)` niszczą całą oszczędność.'),
    ],
    examples: [
      example(
        'Ile mnożeń potrzeba do $a^{16}$ metodą szybkiego potęgowania?',
        [['$a^2, a^4, a^8, a^{16}$ — każde to kwadrat poprzedniego.', '16 = 2⁴'], 'Cztery podniesienia do kwadratu.'],
        '4',
      ),
      example(
        'Oblicz schematem Hornera $2x^3 - 3x^2 + 5$ dla x = 2.',
        ['Współczynniki: 2, −3, 0, 5.', '2 → 2·2 − 3 = 1 → 1·2 + 0 = 2 → 2·2 + 5 = 9.'],
        '9',
      ),
    ],
    pitfalls: ['Dwukrotne wywołanie rekurencji dla połowy wykładnika.', 'Pominięty współczynnik 0 w schemacie Hornera.', 'Brak modulo w trakcie — ogromne liczby i wolny program.'],
  },
  {
    skillId: 'cs-approx',
    minutes: 14,
    intro:
      'Nie każdy wynik da się policzyć dokładnie. Metoda Herona przybliża pierwiastek, połowienie znajduje miejsce zerowe funkcji — a liczby zmiennoprzecinkowe same wprowadzają małe błędy, o których trzeba pamiętać.',
    blocks: [
      f('x_{k+1} = \\frac{1}{2}\\left(x_k + \\frac{n}{x_k}\\right)', 'Metoda Herona: każdy krok średnio podwaja liczbę poprawnych cyfr.'),
      listing('def zero(f, a, b, eps):      # f(a) i f(b) mają różne znaki\n    while b - a > eps:\n        s = (a + b) / 2\n        if f(a) * f(s) <= 0:\n            b = s          # zero w lewej połowie\n        else:\n            a = s          # zero w prawej połowie\n    return (a + b) / 2', 'Połowienie przedziału (bisekcja).'),
      p('Każdy krok połowienia dzieli długość przedziału przez 2. Żeby z długości 1 zejść poniżej ε, trzeba $\\lceil \\log_2 \\frac{1}{\\varepsilon} \\rceil$ kroków — dla ε = 0,001 to 10 kroków.'),
      warn('`0.1 + 0.2 == 0.3` daje False: 0,1 nie ma skończonego zapisu dwójkowego. Liczby zmiennoprzecinkowe porównuj z tolerancją: `abs(a - b) < 1e-9`.'),
      tip('Na maturze wynik przybliżony zwykle trzeba podać z określoną dokładnością — zaokrąglij dopiero na końcu, a nie w trakcie obliczeń.'),
    ],
    examples: [
      example(
        'Wykonaj dwa kroki metody Herona dla $\\sqrt{9}$, startując z x = 9.',
        ['$x_1 = \\frac{1}{2}(9 + 1) = 5$.', '$x_2 = \\frac{1}{2}(5 + 1{,}8) = 3{,}4$.'],
        '3,4',
      ),
      example(
        'Ile kroków połowienia zmniejszy przedział [0, 1] poniżej 0,001?',
        [['Po k krokach długość to $2^{-k}$.', 'szukasz najmniejszego k z $2^k > 1000$'], '$2^{10} = 1024$.'],
        '10',
      ),
    ],
    pitfalls: ['Porównywanie liczb zmiennoprzecinkowych przez `==`.', 'Zły wybór połowy przedziału — zero „ucieka”.', 'Zaokrąglanie w trakcie zamiast na końcu.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const NUM_QUESTIONS: Question[] = [
  // cs-numbers ----------------------------------------------------------------
  numeric({
    id: 'nm-p-1',
    skill: 'cs-numbers',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'n = 91\nd = 2\nwhile n % d != 0:\n    d += 1\nprint(d)',
    answer: 7,
    verify: () => {
      let d = 2;
      while (91 % d !== 0) d += 1;
      return d;
    },
    hints: ['Kiedy pętla się zatrzymuje?', 'Gdy d dzieli 91 bez reszty.', 'Sprawdzaj kolejno 2, 3, 4, …', 'Najmniejszy dzielnik większy od 1.'],
    steps: ['91 nie dzieli się przez 2, 3, 4, 5, 6.', '91 = 7 · 13, więc pętla staje na 7.'],
    errors: [['13', 'Podany większy dzielnik.', 'Pętla zatrzymuje się na pierwszym, najmniejszym dzielniku.']],
  }),
  choice({
    id: 'nm-p-2',
    skill: 'cs-numbers',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Dlaczego przy sprawdzaniu pierwszości n wystarczy testować dzielniki d, dla których $d \\cdot d \\le n$?',
    choices: [
      'jeśli $n = a \\cdot b$ i $a \\le b$, to $a \\le \\sqrt{n}$',
      'bo liczby pierwsze są mniejsze od $\\sqrt{n}$',
      'bo dzielniki większe od $\\sqrt{n}$ są zawsze parzyste',
      'bo $\\sqrt{n}$ jest zawsze liczbą pierwszą',
    ],
    answer: 'A',
    hints: ['Co wiadomo o parze dzielników $a \\cdot b = n$?', 'Jeden z nich jest mniejszy lub równy drugiemu.', 'Gdyby oba były większe od $\\sqrt{n}$, iloczyn przekroczyłby n.', 'Mniejszy dzielnik z pary zawsze da się znaleźć do $\\sqrt{n}$.'],
    steps: ['Dzielniki występują w parach $a \\cdot b = n$.', 'Mniejszy z pary nie przekracza $\\sqrt{n}$, więc wystarczy go szukać do tej granicy.'],
    errors: [
      ['B', 'Pomylone dzielniki z liczbami pierwszymi.', 'Chodzi o parę dzielników, nie o wszystkie liczby pierwsze.'],
      ['C', 'Parzystość nie ma tu znaczenia.', 'Kluczowe jest to, że dzielniki tworzą pary.'],
      ['D', 'Pierwiastek zwykle nie jest nawet całkowity.', 'Granica wynika z par dzielników.'],
    ],
  }),
  pyTask({
    id: 'nm-p-3',
    skill: 'cs-numbers',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `czy_pierwsza(n)`, która sprawdza, czy liczba jest pierwsza. Sprawdzaj dzielniki tylko do pierwiastka z n — ukryte testy zawierają dużą liczbę.',
    functionName: 'czy_pierwsza',
    params: ['n'],
    types: 'int ≥ 0 -> bool',
    tests: [
      { name: 'jedynka', input: [1], expected: false },
      { name: 'dwójka', input: [2], expected: true },
      { name: 'pierwsza', input: [97], expected: true },
      { name: 'złożona', input: [91], expected: false },
      { name: 'zero', input: [0], expected: false, hidden: true },
      { name: 'kwadrat liczby pierwszej', input: [49], expected: false, hidden: true },
      { name: 'duża pierwsza', input: [1000003], expected: true, hidden: true },
    ],
    model: `
      def czy_pierwsza(n):
          if n < 2:
              return False
          d = 2
          while d * d <= n:
              if n % d == 0:
                  return False
              d += 1
          return True
    `,
    hints: ['Które liczby od razu nie są pierwsze?', '0 i 1.', 'Sprawdzaj dzielniki d, dopóki `d * d <= n`.', 'Jeśli któryś dzieli n — nie jest pierwsza; po pętli — jest.'],
    steps: ['n < 2 → False.', 'Dzielniki od 2, dopóki d² ≤ n; znaleziony dzielnik → False, inaczej True.'],
  }),
  pyTask({
    id: 'nm-p-4',
    skill: 'cs-numbers',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `sito(n)`, która metodą sita Eratostenesa zwraca rosnącą listę wszystkich liczb pierwszych nie większych od n.',
    functionName: 'sito',
    params: ['n'],
    types: 'int ≥ 0 -> list[int]',
    tests: [
      { name: 'do 10', input: [10], expected: [2, 3, 5, 7] },
      { name: 'jedynka', input: [1], expected: [] },
      { name: 'dwójka', input: [2], expected: [2] },
      { name: 'do 30', input: [30], expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], hidden: true },
      { name: 'do 50', input: [50], expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], hidden: true },
    ],
    model: `
      def sito(n):
          if n < 2:
              return []
          pierwsza = [True] * (n + 1)
          pierwsza[0] = pierwsza[1] = False
          i = 2
          while i * i <= n:
              if pierwsza[i]:
                  for j in range(i * i, n + 1, i):
                      pierwsza[j] = False
              i += 1
          return [k for k in range(n + 1) if pierwsza[k]]
    `,
    hints: ['Jak zapamiętać, które liczby są skreślone?', 'Lista wartości logicznych długości n + 1.', 'Dla każdej nieskreślonej liczby i skreślaj jej wielokrotności od i · i co i.', 'Na końcu zbierz indeksy, które zostały nieskreślone.'],
    steps: ['Tablica `pierwsza` z False dla 0 i 1.', 'Każda nieskreślona i skreśla wielokrotności od i²; wynik to nieskreślone indeksy.'],
  }),
  pyTask({
    id: 'nm-p-5',
    skill: 'cs-numbers',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `rozklad(n)`, która zwraca rosnącą listę czynników pierwszych liczby n (z powtórzeniami). Dla 1 zwróć pustą listę.',
    functionName: 'rozklad',
    params: ['n'],
    types: 'int ≥ 1 -> list[int]',
    tests: [
      { name: '360', input: [360], expected: [2, 2, 2, 3, 3, 5] },
      { name: 'pierwsza', input: [13], expected: [13] },
      { name: 'jedynka', input: [1], expected: [] },
      { name: 'duży czynnik', input: [19946], expected: [2, 9973], hidden: true },
      { name: 'potęga dwójki', input: [1024], expected: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], hidden: true },
    ],
    model: `
      def rozklad(n):
          czynniki = []
          d = 2
          while d * d <= n:
              while n % d == 0:
                  czynniki.append(d)
                  n //= d
              d += 1
          if n > 1:
              czynniki.append(n)
          return czynniki
    `,
    hints: ['Co robić, gdy d dzieli n?', 'Dopisać d i podzielić n — powtarzać, dopóki się da.', 'Zwiększaj d, dopóki `d * d <= n`.', 'Jeśli po pętli n > 1, to n jest ostatnim czynnikiem.'],
    steps: ['Dla kolejnych d dzielisz n, dopóki się da, dopisując d.', 'Reszta większa od 1 po pętli to czynnik pierwszy większy od √n.'],
  }),
  pyTask({
    id: 'nm-p-6',
    skill: 'cs-numbers',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Liczby bliźniacze to para liczb pierwszych różniących się o 2, np. (11, 13). Napisz funkcję `blizniacze(n)`, która zwraca liczbę takich par (p, p + 2), w których p + 2 ≤ n.',
    functionName: 'blizniacze',
    params: ['n'],
    types: 'int ≥ 0 -> int',
    tests: [
      { name: 'do 10', input: [10], expected: 2 },
      { name: 'do 20', input: [20], expected: 4 },
      { name: 'za mało', input: [4], expected: 0 },
      { name: 'do 100', input: [100], expected: 8, hidden: true },
      { name: 'do 1000', input: [1000], expected: 35, hidden: true },
    ],
    model: `
      def blizniacze(n):
          if n < 2:
              return 0
          pierwsza = [True] * (n + 1)
          pierwsza[0] = pierwsza[1] = False
          i = 2
          while i * i <= n:
              if pierwsza[i]:
                  for j in range(i * i, n + 1, i):
                      pierwsza[j] = False
              i += 1
          return sum(1 for p in range(2, n - 1) if pierwsza[p] and pierwsza[p + 2])
    `,
    hints: ['Jak szybko sprawdzać pierwszość wielu liczb do n?', 'Sito Eratostenesa — raz dla całego zakresu.', 'Potem dla każdego p sprawdź, czy p i p + 2 są pierwsze.', 'Pilnuj zakresu: p + 2 nie może przekroczyć n.'],
    steps: ['Sito wyznacza pierwszość wszystkich liczb do n.', 'Liczysz p, dla których p i p + 2 są pierwsze, a p + 2 ≤ n.'],
  }),
  pyTask({
    id: 'nm-p-7',
    skill: 'cs-numbers',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Hipoteza Goldbacha: każda liczba parzysta większa od 2 jest sumą dwóch liczb pierwszych. Napisz funkcję `goldbach(n)`, która dla parzystego n > 2 zwraca `[p, q]`, gdzie p + q = n, obie są pierwsze, p ≤ q, a p jest najmniejsze możliwe.',
    functionName: 'goldbach',
    params: ['n'],
    types: 'parzyste int > 2 -> list[int]',
    tests: [
      { name: 'cztery', input: [4], expected: [2, 2] },
      { name: '28', input: [28], expected: [5, 23] },
      { name: '100', input: [100], expected: [3, 97] },
      { name: '98', input: [98], expected: [19, 79], hidden: true },
      { name: '1000', input: [1000], expected: [3, 997], hidden: true },
    ],
    model: `
      def czy_pierwsza(n):
          if n < 2:
              return False
          d = 2
          while d * d <= n:
              if n % d == 0:
                  return False
              d += 1
          return True

      def goldbach(n):
          for p in range(2, n // 2 + 1):
              if czy_pierwsza(p) and czy_pierwsza(n - p):
                  return [p, n - p]
          return []
    `,
    hints: ['W jakiej kolejności sprawdzać kandydatów na p?', 'Od 2 w górę — pierwsze trafienie jest najmniejsze.', 'Dla p sprawdź pierwszość p i n − p.', 'Wystarczy p do n // 2, bo p ≤ q.'],
    steps: ['Funkcja pomocnicza sprawdza pierwszość.', 'Pierwsze p od 2 do n/2, dla którego p i n − p są pierwsze, daje odpowiedź.'],
  }),

  // cs-gcd --------------------------------------------------------------------
  numeric({
    id: 'nm-g-1',
    skill: 'cs-gcd',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'a, b = 48, 18\nwhile b != 0:\n    a, b = b, a % b\nprint(a)',
    answer: 6,
    verify: () => {
      let a = 48;
      let b = 18;
      while (b !== 0) [a, b] = [b, a % b];
      return a;
    },
    hints: ['Jaki algorytm realizuje ta pętla?', 'Algorytm Euklidesa z resztą z dzielenia.', 'Śledź pary (a, b): (48, 18) → (18, 12) → …', 'Gdy b = 0, wypisane zostaje a.'],
    steps: ['(48, 18) → (18, 12) → (12, 6) → (6, 0).', 'Wypisze 6 = NWD(48, 18).'],
    errors: [['144', 'Policzona NWW zamiast NWD.', 'Algorytm Euklidesa daje największy wspólny dzielnik.']],
  }),
  choice({
    id: 'nm-g-2',
    skill: 'cs-gcd',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Które wyrażenie poprawnie liczy NWW(a, b) dla liczb dodatnich?',
    choices: ['`a * b // nwd(a, b)`', '`a * b`', '`nwd(a, b) * 2`', '`a // nwd(a, b) + b`'],
    answer: 'A',
    hints: ['Jaki związek łączy NWD i NWW?', 'NWD · NWW = a · b.', 'Przekształć ten wzór, żeby wyznaczyć NWW.', 'Dziel iloczyn przez NWD.'],
    steps: ['NWD(a, b) · NWW(a, b) = a · b.', 'Stąd NWW = a · b // NWD(a, b).'],
    errors: [
      ['B', 'Iloczyn jest wspólną wielokrotnością, ale nie najmniejszą.', 'Trzeba podzielić przez NWD.'],
      ['C', 'Brak związku z definicją NWW.', 'NWW = a · b / NWD.'],
      ['D', 'Dodawanie zamiast mnożenia.', 'NWW = a // NWD · b.'],
    ],
  }),
  pyTask({
    id: 'nm-g-3',
    skill: 'cs-gcd',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `nwd(a, b)` — algorytm Euklidesa w wersji iteracyjnej (z resztą z dzielenia).',
    functionName: 'nwd',
    params: ['a', 'b'],
    types: 'int ≥ 0, int ≥ 0 (nie oba zera) -> int',
    tests: [
      { name: 'przykład', input: [48, 18], expected: 6 },
      { name: 'względnie pierwsze', input: [17, 5], expected: 1 },
      { name: 'drugie zero', input: [7, 0], expected: 7 },
      { name: 'pierwsze zero', input: [0, 9], expected: 9, hidden: true },
      { name: 'większe liczby', input: [1071, 462], expected: 21, hidden: true },
    ],
    model: `
      def nwd(a, b):
          while b != 0:
              a, b = b, a % b
          return a
    `,
    hints: ['Na jaką parę zamienić (a, b) w każdym kroku?', 'Na (b, a % b).', 'Powtarzaj, dopóki b ≠ 0.', 'Wynikiem jest a.'],
    steps: ['Pętla `while b != 0` zamienia (a, b) na (b, a % b).', 'Gdy b = 0, a jest największym wspólnym dzielnikiem.'],
  }),
  pyTask({
    id: 'nm-g-4',
    skill: 'cs-gcd',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `nwd_rek(a, b)` — algorytm Euklidesa w wersji REKURENCYJNEJ (funkcja wywołuje samą siebie, bez pętli).',
    functionName: 'nwd_rek',
    params: ['a', 'b'],
    types: 'int ≥ 0, int ≥ 0 (nie oba zera) -> int',
    tests: [
      { name: 'przykład', input: [84, 126], expected: 42 },
      { name: 'równe', input: [15, 15], expected: 15 },
      { name: 'drugie zero', input: [5, 0], expected: 5 },
      { name: 'Fibonacci', input: [89, 55], expected: 1, hidden: true },
      { name: 'duże', input: [123456, 7890], expected: 6, hidden: true },
    ],
    model: `
      def nwd_rek(a, b):
          if b == 0:
              return a
          return nwd_rek(b, a % b)
    `,
    hints: ['Kiedy rekurencja ma się zatrzymać?', 'Gdy b = 0 — wtedy wynik to a.', 'W przeciwnym razie zwróć wynik wywołania dla (b, a % b).', 'Nie zapomnij słowa `return` przed wywołaniem rekurencyjnym.'],
    steps: ['Warunek stopu: b = 0 → a.', 'Krok: `return nwd_rek(b, a % b)`.'],
  }),
  pyTask({
    id: 'nm-g-5',
    skill: 'cs-gcd',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `skroc(l, m)`, która zwraca ułamek l/m w postaci nieskracalnej jako `[licznik, mianownik]` z dodatnim mianownikiem. Zero zapisz jako `[0, 1]`.',
    functionName: 'skroc',
    params: ['l', 'm'],
    types: 'int, int ≠ 0 -> list[int]',
    tests: [
      { name: 'zwykły', input: [6, 8], expected: [3, 4] },
      { name: 'ujemny licznik', input: [-4, 6], expected: [-2, 3] },
      { name: 'ujemny mianownik', input: [5, -10], expected: [-1, 2] },
      { name: 'zero', input: [0, 7], expected: [0, 1], hidden: true },
      { name: 'całkowity', input: [100, 25], expected: [4, 1], hidden: true },
      { name: 'oba ujemne', input: [-3, -9], expected: [1, 3], hidden: true },
    ],
    model: `
      def nwd(a, b):
          while b != 0:
              a, b = b, a % b
          return a

      def skroc(l, m):
          if m < 0:
              l, m = -l, -m
          d = nwd(abs(l), m)
          return [l // d, m // d]
    `,
    hints: ['Co zrobić ze znakiem, gdy mianownik jest ujemny?', 'Zmienić znak licznika i mianownika.', 'NWD licz z wartości bezwzględnych: `abs(l)`.', 'Dla l = 0 NWD(0, m) = m, więc wyjdzie [0, 1].'],
    steps: ['Ujemny mianownik: zmieniasz znak obu liczb.', 'Dzielisz przez NWD(|l|, m); zero daje automatycznie [0, 1].'],
  }),
  pyTask({
    id: 'nm-g-6',
    skill: 'cs-gcd',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `nww_listy(t)`, która zwraca najmniejszą wspólną wielokrotność wszystkich liczb z niepustej listy liczb dodatnich.',
    functionName: 'nww_listy',
    params: ['t'],
    types: 'niepusta list[int > 0] -> int',
    tests: [
      { name: 'dwie', input: [[4, 6]], expected: 12 },
      { name: 'od 1 do 5', input: [[1, 2, 3, 4, 5]], expected: 60 },
      { name: 'jedna', input: [[7]], expected: 7 },
      { name: 'pierwsze', input: [[2, 3, 5, 7, 11, 13]], expected: 30030, hidden: true },
      { name: 'wspólne czynniki', input: [[12, 18, 30]], expected: 180, hidden: true },
    ],
    model: `
      def nwd(a, b):
          while b != 0:
              a, b = b, a % b
          return a

      def nww_listy(t):
          wynik = t[0]
          for x in t[1:]:
              wynik = wynik // nwd(wynik, x) * x
          return wynik
    `,
    hints: ['Jak policzyć NWW trzech liczb, znając NWW dwóch?', 'NWW(a, b, c) = NWW(NWW(a, b), c).', 'Idź po liście, trzymając NWW dotychczasowych elementów.', 'NWW(a, b) = a // NWD(a, b) * b.'],
    steps: ['Wynik zaczyna od pierwszego elementu.', 'Każdy kolejny x: `wynik = wynik // nwd(wynik, x) * x`.'],
  }),
  pyTask({
    id: 'nm-g-7',
    skill: 'cs-gcd',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Ułamek egipski to suma różnych ułamków z licznikiem 1. Metoda zachłanna: od ułamku $\\frac{l}{m}$ (0 < l < m) odejmij największy ułamek $\\frac{1}{k}$ nie większy od niego, czyli $k = \\lceil \\frac{m}{l} \\rceil$, i powtarzaj dla reszty. Napisz funkcję `egipski(l, m)`, która zwraca listę kolejnych mianowników k. Licz na liczbach całkowitych.',
    functionName: 'egipski',
    params: ['l', 'm'],
    types: 'int, int (0 < l < m) -> list[int]',
    tests: [
      { name: '4/13', input: [4, 13], expected: [4, 18, 468] },
      { name: '2/3', input: [2, 3], expected: [2, 6] },
      { name: 'już egipski', input: [1, 5], expected: [5] },
      { name: '7/15', input: [7, 15], expected: [3, 8, 120], hidden: true },
      { name: '6/7', input: [6, 7], expected: [2, 3, 42], hidden: true },
    ],
    model: `
      def nwd(a, b):
          while b != 0:
              a, b = b, a % b
          return a

      def egipski(l, m):
          wynik = []
          while l > 0:
              k = (m + l - 1) // l
              wynik.append(k)
              l, m = l * k - m, m * k
              d = nwd(l, m)
              l, m = l // d, m // d
          return wynik
    `,
    hints: ['Jak policzyć sufit z dzielenia na liczbach całkowitych?', '$\\lceil \\frac{m}{l} \\rceil$ = `(m + l - 1) // l`.', 'Reszta po odjęciu: $\\frac{l}{m} - \\frac{1}{k} = \\frac{lk - m}{mk}$.', 'Skracaj resztę przez NWD i powtarzaj, aż licznik będzie 0.'],
    steps: ['k = ⌈m/l⌉ liczone całkowicie; reszta to (lk − m)/(mk), skracana przez NWD.', 'Pętla trwa, dopóki licznik reszty jest dodatni.'],
  }),

  // cs-bases ------------------------------------------------------------------
  numeric({
    id: 'nm-b-1',
    skill: 'cs-bases',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Zamień liczbę $1011_2$ na system dziesiętny.',
    answer: 11,
    verify: () => parseInt('1011', 2),
    hints: ['Jakie wagi mają kolejne cyfry liczby dwójkowej?', 'Od prawej: 1, 2, 4, 8, …', 'Zsumuj wagi pozycji, na których stoi jedynka.', 'Jedynki stoją na pozycjach o wagach 8, 2 i 1.'],
    steps: ['$1011_2 = 8 + 0 + 2 + 1$.', 'Wynik: 11.'],
    errors: [['13', 'Cyfry odczytane od złej strony.', 'Najmłodsza cyfra (waga 1) stoi po prawej.']],
  }),
  choice({
    id: 'nm-b-2',
    skill: 'cs-bases',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jak zapisać liczbę 255 w systemie szesnastkowym?',
    choices: ['FF', 'EF', 'FE', 'F0'],
    answer: 'A',
    hints: ['Ile to jest 255 : 16?', '255 = 16 · 15 + 15.', 'Cyfra szesnastkowa o wartości 15 to F.', 'Obie cyfry to 15.'],
    steps: ['255 = 15 · 16 + 15.', 'Obie cyfry to F: FF.'],
    errors: [
      ['B', 'Błąd w starszej cyfrze.', 'E = 14, a 14 · 16 + 15 = 239.'],
      ['C', 'Błąd w młodszej cyfrze.', 'FE = 254.'],
      ['D', 'Pominięta reszta z dzielenia.', 'F0 = 240.'],
    ],
  }),
  pyTask({
    id: 'nm-b-3',
    skill: 'cs-bases',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Napisz funkcję `z_systemu(s, p)`, która zamienia zapis s liczby w systemie o podstawie p (2 ≤ p ≤ 16, cyfry 0–9 i wielkie litery A–F) na liczbę. Nie używaj `int(s, p)`.',
    functionName: 'z_systemu',
    params: ['s', 'p'],
    types: 'str, int -> int',
    tests: [
      { name: 'dwójkowy', input: ['1011', 2], expected: 11 },
      { name: 'szesnastkowy', input: ['FF', 16], expected: 255 },
      { name: 'zero', input: ['0', 5], expected: 0 },
      { name: 'ósemkowy', input: ['777', 8], expected: 511, hidden: true },
      { name: 'trójkowy', input: ['10201', 3], expected: 100, hidden: true },
    ],
    model: `
      CYFRY = "0123456789ABCDEF"

      def z_systemu(s, p):
          wynik = 0
          for c in s:
              wynik = wynik * p + CYFRY.index(c)
          return wynik
    `,
    hints: ['Jak zamienić znak cyfry na jej wartość, także dla liter?', 'Napis „0123456789ABCDEF” i metoda `index`.', 'Idąc od lewej, mnóż dotychczasowy wynik przez p i dodawaj cyfrę.', 'To schemat Hornera dla cyfr liczby.'],
    steps: ['Wartość cyfry: `CYFRY.index(c)`.', 'Od lewej: `wynik = wynik * p + cyfra`.'],
  }),
  pyTask({
    id: 'nm-b-4',
    skill: 'cs-bases',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `na_system(n, p)`, która zwraca zapis liczby n ≥ 0 w systemie o podstawie p (2 ≤ p ≤ 16), z cyframi A–F dla wartości 10–15.',
    functionName: 'na_system',
    params: ['n', 'p'],
    types: 'int ≥ 0, int -> str',
    tests: [
      { name: 'dwójkowy', input: [11, 2], expected: '1011' },
      { name: 'szesnastkowy', input: [255, 16], expected: 'FF' },
      { name: 'zero', input: [0, 2], expected: '0' },
      { name: 'ósemkowy', input: [8, 8], expected: '10' },
      { name: 'trójkowy', input: [100, 3], expected: '10201', hidden: true },
      { name: 'litery', input: [48879, 16], expected: 'BEEF', hidden: true },
    ],
    model: `
      CYFRY = "0123456789ABCDEF"

      def na_system(n, p):
          if n == 0:
              return "0"
          wynik = ""
          while n > 0:
              wynik = CYFRY[n % p] + wynik
              n //= p
          return wynik
    `,
    hints: ['Jaką cyfrę daje reszta z dzielenia n przez p?', 'Najmłodszą — ostatnią w zapisie.', 'Dopisuj cyfrę `CYFRY[n % p]` na początek wyniku i dziel n przez p.', 'Zero to przypadek szczególny — pętla by się nie wykonała.'],
    steps: ['Reszty z dzielenia przez p to cyfry od najmłodszej.', 'Dopisujesz je na początek napisu; n = 0 osobno.'],
  }),
  text({
    id: 'nm-b-5',
    skill: 'cs-bases',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Oblicz $101101_2 + 111_2$. Wynik zapisz w systemie dwójkowym.',
    answer: '110100',
    verify: () => (0b101101 + 0b111).toString(2),
    hints: ['Jak dodaje się pisemnie w systemie dwójkowym?', 'Tak jak w dziesiętnym, ale 1 + 1 = 10 — piszesz 0 i przenosisz 1.', 'Wyrównaj liczby do prawej i dodawaj od najmłodszej pozycji.', 'Możesz sprawdzić wynik w dziesiętnym: 45 + 7.'],
    steps: ['Dodajesz kolumnami z przeniesieniami: 101101 + 000111.', '45 + 7 = 52 = 110100₂.'],
    errors: [['101100', 'Zgubione przeniesienie.', 'W dwójkowym 1 + 1 = 10: zero i przeniesienie jedynki.']],
  }),
  pyTask({
    id: 'nm-b-6',
    skill: 'cs-bases',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `dodaj_binarnie(a, b)`, która dodaje dwie liczby zapisane dwójkowo jako napisy i zwraca wynik też jako napis dwójkowy — dodawaniem pisemnym, kolumna po kolumnie, bez zamiany całych liczb na int.',
    functionName: 'dodaj_binarnie',
    params: ['a', 'b'],
    types: 'str, str -> str',
    tests: [
      { name: 'przykład', input: ['1011', '110'], expected: '10001' },
      { name: 'zera', input: ['0', '0'], expected: '0' },
      { name: 'przeniesienie', input: ['1', '1'], expected: '10' },
      { name: 'same jedynki', input: ['1111', '1'], expected: '10000', hidden: true },
      { name: 'różne długości', input: ['101101', '111'], expected: '110100', hidden: true },
    ],
    model: `
      def dodaj_binarnie(a, b):
          i, j = len(a) - 1, len(b) - 1
          przeniesienie = 0
          wynik = ""
          while i >= 0 or j >= 0 or przeniesienie:
              s = przeniesienie
              if i >= 0:
                  s += int(a[i])
                  i -= 1
              if j >= 0:
                  s += int(b[j])
                  j -= 1
              wynik = str(s % 2) + wynik
              przeniesienie = s // 2
          return wynik.lstrip("0") or "0"
    `,
    hints: ['Od której strony dodaje się pisemnie?', 'Od prawej — od ostatnich znaków obu napisów.', 'Suma w kolumnie to cyfry plus przeniesienie; cyfra wyniku to `s % 2`, przeniesienie `s // 2`.', 'Pętla trwa, dopóki zostały cyfry albo przeniesienie.'],
    steps: ['Dwa indeksy idą od końca napisów; w kolumnie sumujesz cyfry i przeniesienie.', 'Cyfra wyniku to s % 2, przeniesienie s // 2; po pętli zostaje pełny wynik.'],
  }),
  pyTask({
    id: 'nm-b-7',
    skill: 'cs-bases',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `palindromy_systemow(n)`, która zwraca rosnącą listę podstaw p od 2 do 10, w których zapis liczby n ≥ 1 jest palindromem. Na przykład 5 = $101_2$ = $11_4$, a w podstawach 6–10 jest jedną cyfrą.',
    functionName: 'palindromy_systemow',
    params: ['n'],
    types: 'int ≥ 1 -> list[int]',
    tests: [
      { name: 'pięć', input: [5], expected: [2, 4, 6, 7, 8, 9, 10] },
      { name: 'dziewięć', input: [9], expected: [2, 8, 10] },
      { name: 'jeden', input: [1], expected: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { name: '121', input: [121], expected: [3, 7, 8, 10], hidden: true },
      { name: '10', input: [10], expected: [3, 4, 9], hidden: true },
    ],
    model: `
      def cyfry(n, p):
          wynik = []
          while n > 0:
              wynik.append(n % p)
              n //= p
          return wynik

      def palindromy_systemow(n):
          wynik = []
          for p in range(2, 11):
              c = cyfry(n, p)
              if c == c[::-1]:
                  wynik.append(p)
          return wynik
    `,
    hints: ['Czy do sprawdzenia palindromu potrzebny jest napis?', 'Nie — wystarczy lista cyfr, nawet zapisana od końca.', 'Dla każdej podstawy p zbierz reszty z dzielenia n przez p.', 'Lista jest palindromem, gdy równa się swojemu odwróceniu.'],
    steps: ['Dla p od 2 do 10 wyznaczasz listę cyfr n w systemie p.', 'Dopisujesz p, gdy lista czyta się tak samo w obie strony.'],
  }),

  // cs-fastpow ----------------------------------------------------------------
  numeric({
    id: 'nm-h-1',
    skill: 'cs-fastpow',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program (schemat Hornera dla $2x^3 - 3x^2 + 5$)?',
    listing: 'w = [2, -3, 0, 5]\nx = 2\nwynik = 0\nfor a in w:\n    wynik = wynik * x + a\nprint(wynik)',
    answer: 9,
    verify: () => 2 * 8 - 3 * 4 + 5,
    hints: ['Jak zmienia się wynik w kolejnych obrotach pętli?', 'Mnożysz przez x i dodajesz kolejny współczynnik.', 'Kolejne wartości: 2, 1, …', 'Sprawdź: 2 · 8 − 3 · 4 + 5.'],
    steps: ['Wynik: 0 → 2 → 1 → 2 → 9.', 'Zgadza się z 16 − 12 + 5 = 9.'],
    errors: [['4', 'Pominięty ostatni obrót pętli.', 'Pętla przechodzi przez wszystkie cztery współczynniki.']],
  }),
  choice({
    id: 'nm-h-2',
    skill: 'cs-fastpow',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Ile mnożeń wykona szybkie potęgowanie przy obliczaniu $a^{16}$ (kolejne podnoszenie do kwadratu)?',
    choices: ['4', '15', '16', '8'],
    answer: 'A',
    hints: ['Jaką potęgę dostajesz po każdym podniesieniu do kwadratu?', '$a^2$, potem $a^4$, …', 'Ile kwadratów prowadzi od a do $a^{16}$?', '$16 = 2^4$.'],
    steps: ['$a \\to a^2 \\to a^4 \\to a^8 \\to a^{16}$.', 'Cztery mnożenia.'],
    errors: [
      ['B', 'Liczba mnożeń metody naiwnej.', 'Szybkie potęgowanie podnosi do kwadratu.'],
      ['C', 'Pomylony wykładnik z liczbą mnożeń.', 'Liczba kwadratów to $\\log_2 16$.'],
      ['D', 'Połowa wykładnika.', 'Każde mnożenie podwaja wykładnik, a nie dodaje 2.'],
    ],
  }),
  pyTask({
    id: 'nm-h-3',
    skill: 'cs-fastpow',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `horner(w, x)`, która oblicza wartość wielomianu o współczynnikach w (od najwyższej potęgi) w punkcie x schematem Hornera.',
    functionName: 'horner',
    params: ['w', 'x'],
    types: 'list[int], int -> int',
    tests: [
      { name: 'przykład z lekcji', input: [[2, -3, 0, 5], 2], expected: 9 },
      { name: 'stała', input: [[7], 100], expected: 7 },
      { name: 'x = 0', input: [[1, 2, 3], 0], expected: 3 },
      { name: 'ujemny x', input: [[1, 0, -1], -3], expected: 8, hidden: true },
      { name: 'cyfry dwójkowe', input: [[1, 0, 1, 1], 2], expected: 11, hidden: true },
    ],
    model: `
      def horner(w, x):
          wynik = 0
          for a in w:
              wynik = wynik * x + a
          return wynik
    `,
    hints: ['Od jakiej wartości zacząć?', 'Od 0 — pierwszy obrót da najwyższy współczynnik.', 'W pętli po współczynnikach: `wynik = wynik * x + a`.', 'Zwróć wynik po pętli.'],
    steps: ['Wynik startuje od 0.', 'Każdy współczynnik: mnożysz przez x i dodajesz go.'],
  }),
  pyTask({
    id: 'nm-h-4',
    skill: 'cs-fastpow',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `potega(a, n)`, która oblicza $a^n$ metodą szybkiego potęgowania (po bitach wykładnika), bez operatora `**` i funkcji `pow`.',
    functionName: 'potega',
    params: ['a', 'n'],
    types: 'int, int ≥ 0 -> int',
    tests: [
      { name: '2 do 10', input: [2, 10], expected: 1024 },
      { name: 'wykładnik 0', input: [3, 0], expected: 1 },
      { name: 'nieparzysty', input: [5, 3], expected: 125 },
      { name: '2 do 50', input: [2, 50], expected: 1125899906842624, hidden: true },
      { name: '7 do 18', input: [7, 18], expected: 1628413597910449, hidden: true },
    ],
    model: `
      def potega(a, n):
          wynik = 1
          while n > 0:
              if n % 2 == 1:
                  wynik *= a
              a *= a
              n //= 2
          return wynik
    `,
    hints: ['Co zrobić, gdy najmłodszy bit wykładnika to 1?', 'Pomnożyć wynik przez bieżące a.', 'W każdym obrocie podnieś a do kwadratu i podziel n przez 2.', 'Pętla trwa, dopóki n > 0.'],
    steps: ['Nieparzyste n: wynik *= a.', 'Zawsze: a *= a, n //= 2 — kolejny bit wykładnika.'],
  }),
  pyTask({
    id: 'nm-h-5',
    skill: 'cs-fastpow',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Napisz funkcję `potega_mod(a, n, m)`, która oblicza $a^n \\bmod m$. Wykładnik może mieć nawet 16 cyfr — zwykła pętla n razy nie zdąży przed limitem czasu.',
    functionName: 'potega_mod',
    params: ['a', 'n', 'm'],
    types: 'int ≥ 0, int ≥ 0, int ≥ 2 -> int',
    tests: [
      { name: 'mały', input: [2, 10, 1000], expected: 24 },
      { name: 'wykładnik 0', input: [3, 0, 7], expected: 1 },
      { name: 'przykład', input: [5, 3, 13], expected: 8 },
      { name: 'ogromny wykładnik', input: [2, 1000000000000000, 1000000007], expected: 264444359, hidden: true },
      { name: 'duże liczby', input: [3, 123456789, 1000000007], expected: 693955290, hidden: true },
    ],
    model: `
      def potega_mod(a, n, m):
          wynik = 1 % m
          a %= m
          while n > 0:
              if n % 2 == 1:
                  wynik = wynik * a % m
              a = a * a % m
              n //= 2
          return wynik
    `,
    hints: ['Ile kroków wykona szybkie potęgowanie dla wykładnika rzędu $10^{15}$?', 'Około 50 — tyle, ile bitów ma wykładnik.', 'Po każdym mnożeniu bierz resztę z dzielenia przez m.', 'Szkielet jak w szybkim potęgowaniu, tylko z `% m`.'],
    steps: ['Szybkie potęgowanie po bitach: ok. 50 kroków zamiast $10^{15}$.', 'Reszta modulo m po każdym mnożeniu trzyma liczby małe.'],
  }),
  pyTask({
    id: 'nm-h-6',
    skill: 'cs-fastpow',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Szybkie potęgowanie „od najstarszego bitu” zaczyna od a, a za każdy kolejny bit wykładnika podnosi wynik do kwadratu (1 mnożenie) i — gdy bit to 1 — mnoży jeszcze przez a (1 mnożenie). Napisz funkcję `ile_mnozen(n)`, która zwraca liczbę mnożeń dla wykładnika n ≥ 1.',
    functionName: 'ile_mnozen',
    params: ['n'],
    types: 'int ≥ 1 -> int',
    tests: [
      { name: 'n = 1', input: [1], expected: 0 },
      { name: 'n = 16', input: [16], expected: 4 },
      { name: 'n = 15', input: [15], expected: 6 },
      { name: 'n = 10', input: [10], expected: 4, hidden: true },
      { name: 'n = 1000', input: [1000], expected: 14, hidden: true },
    ],
    model: `
      def ile_mnozen(n):
          bity = bin(n)[2:]
          return (len(bity) - 1) + (bity.count("1") - 1)
    `,
    hints: ['Jak wygląda zapis dwójkowy wykładnika?', 'Na przykład 15 = 1111₂, 16 = 10000₂.', 'Każdy bit poza najstarszym to jedno podniesienie do kwadratu.', 'Każda jedynka poza najstarszą to dodatkowe mnożenie przez a.'],
    steps: ['Kwadratów jest tyle, ile bitów po najstarszym: długość zapisu − 1.', 'Dodatkowych mnożeń tyle, ile jedynek poza najstarszą.'],
  }),
  pyTask({
    id: 'nm-h-7',
    skill: 'cs-fastpow',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Liczby Fibonacciego spełniają $\\begin{bmatrix} F_{n+1} & F_n \\\\ F_n & F_{n-1} \\end{bmatrix} = \\begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\end{bmatrix}^n$. Napisz funkcję `fib_mod(n, m)`, która zwraca $F_n \\bmod m$ ($F_0 = 0$, $F_1 = 1$) dla n nawet rzędu $10^{15}$ — szybkim potęgowaniem macierzy 2×2.',
    functionName: 'fib_mod',
    params: ['n', 'm'],
    types: 'int ≥ 0, int ≥ 2 -> int',
    tests: [
      { name: 'F10', input: [10, 1000], expected: 55 },
      { name: 'F1', input: [1, 10], expected: 1 },
      { name: 'F0', input: [0, 10], expected: 0 },
      { name: 'F90', input: [90, 1000000007], expected: 210345902, hidden: true },
      { name: 'ogromne n', input: [1000000000000000, 1000000007], expected: 648325137, hidden: true },
    ],
    model: `
      def mnoz(A, B, m):
          return [
              [(A[0][0] * B[0][0] + A[0][1] * B[1][0]) % m, (A[0][0] * B[0][1] + A[0][1] * B[1][1]) % m],
              [(A[1][0] * B[0][0] + A[1][1] * B[1][0]) % m, (A[1][0] * B[0][1] + A[1][1] * B[1][1]) % m],
          ]

      def fib_mod(n, m):
          wynik = [[1, 0], [0, 1]]
          M = [[1, 1], [1, 0]]
          while n > 0:
              if n % 2 == 1:
                  wynik = mnoz(wynik, M, m)
              M = mnoz(M, M, m)
              n //= 2
          return wynik[0][1]
    `,
    hints: ['Czym różni się potęgowanie macierzy od potęgowania liczby?', 'Niczym w schemacie — zmienia się tylko mnożenie.', 'Napisz funkcję mnożącą macierze 2×2 modulo m; jedynką jest macierz jednostkowa.', 'Wynik $F_n$ to element w pierwszym wierszu, drugiej kolumnie.'],
    steps: ['Funkcja `mnoz` mnoży macierze 2×2 z resztą modulo m.', 'Szybkie potęgowanie macierzy [[1, 1], [1, 0]]; $F_n$ odczytujesz z pozycji [0][1].'],
  }),

  // cs-approx -----------------------------------------------------------------
  choice({
    id: 'nm-x-1',
    skill: 'cs-approx',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze `print(0.1 + 0.2 == 0.3)` i dlaczego?',
    choices: [
      'False, bo 0,1 nie ma dokładnego zapisu dwójkowego',
      'True, bo 0,1 + 0,2 = 0,3',
      'False, bo Python zaokrągla ułamki do liczb całkowitych',
      'program zakończy się błędem',
    ],
    answer: 'A',
    hints: ['Jak komputer przechowuje liczby z przecinkiem?', 'W systemie dwójkowym, na skończonej liczbie bitów.', 'Czy 0,1 ma skończone rozwinięcie dwójkowe?', 'Nie — zapisane jest z maleńkim błędem.'],
    steps: ['0,1 i 0,2 są zapisane z drobnym błędem zaokrąglenia.', 'Suma to 0.30000000000000004, więc porównanie daje False.'],
    errors: [
      ['B', 'Pominięty błąd reprezentacji.', 'Liczby zmiennoprzecinkowe mają ograniczoną dokładność.'],
      ['C', 'Python nie zaokrągla do całkowitych.', 'Źródłem jest zapis dwójkowy 0,1.'],
      ['D', 'Porównanie liczb nie jest błędem.', 'Wynik porównania to po prostu False.'],
    ],
  }),
  numeric({
    id: 'nm-x-2',
    skill: 'cs-approx',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Co wypisze ten program (metoda Herona)?',
    listing: 'n = 9\nx = n\nfor _ in range(3):\n    x = (x + n / x) / 2\nprint(round(x, 2))',
    answer: 3.02,
    verify: () => {
      let x = 9;
      for (let i = 0; i < 3; i += 1) x = (x + 9 / x) / 2;
      return Math.round(x * 100) / 100;
    },
    hints: ['Ile razy wykona się wzór Herona?', 'Trzy razy.', 'Kolejne przybliżenia: 9 → 5 → 3,4 → …', 'Trzecie przybliżenie zaokrąglij do dwóch miejsc.'],
    steps: ['x: 9 → 5 → 3,4 → (3,4 + 2,647) / 2 ≈ 3,0235.', 'Po zaokrągleniu: 3.02.'],
    errors: [['3', 'Podany dokładny pierwiastek.', 'Po trzech krokach przybliżenie to jeszcze 3,0235.']],
  }),
  pyTask({
    id: 'nm-x-3',
    skill: 'cs-approx',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `heron(n)`, która przybliża $\\sqrt{n}$ metodą Herona, startując od x = n i kończąc, gdy $|x^2 - n| < 10^{-9}$. Zwróć wynik zaokrąglony do 4 miejsc po przecinku.',
    functionName: 'heron',
    params: ['n'],
    types: 'liczba > 0 -> float',
    tests: [
      { name: 'dwa', input: [2], expected: 1.4142 },
      { name: 'kwadrat', input: [9], expected: 3 },
      { name: 'ułamek', input: [0.25], expected: 0.5 },
      { name: 'milion', input: [1000000], expected: 1000, hidden: true },
      { name: 'dziesięć', input: [10], expected: 3.1623, hidden: true },
    ],
    model: `
      def heron(n):
          x = n
          while abs(x * x - n) >= 1e-9:
              x = (x + n / x) / 2
          return round(x, 4)
    `,
    hints: ['Jaki wzór daje kolejne przybliżenie?', '$x \\leftarrow \\frac{1}{2}(x + \\frac{n}{x})$.', 'Pętla `while` z warunkiem na błąd: `abs(x * x - n) >= 1e-9`.', 'Zaokrąglij dopiero wynik końcowy.'],
    steps: ['Start x = n, powtarzasz wzór Herona.', 'Gdy $|x^2 - n| < 10^{-9}$, zwracasz `round(x, 4)`.'],
  }),
  numeric({
    id: 'nm-x-4',
    skill: 'cs-approx',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Metoda połowienia startuje z przedziału o długości 1 i w każdym kroku dzieli go na pół. Ile kroków potrzeba, żeby długość przedziału była mniejsza niż 0,001?',
    answer: 10,
    verify: () => Math.ceil(Math.log2(1000)),
    hints: ['Jaka jest długość przedziału po k krokach?', '$\\frac{1}{2^k}$.', 'Szukasz najmniejszego k, dla którego $2^k > 1000$.', '$2^{10} = 1024$.'],
    steps: ['Po k krokach długość to $2^{-k}$; potrzeba $2^k > 1000$.', '$2^9 = 512$ to za mało, $2^{10} = 1024$ wystarcza.'],
    errors: [['1000', 'Kroki liczone liniowo.', 'Każdy krok dzieli długość przez 2 — liczba kroków to logarytm.']],
  }),
  pyTask({
    id: 'nm-x-5',
    skill: 'cs-approx',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `zero(w, a, b)`, która metodą połowienia znajduje miejsce zerowe wielomianu o współczynnikach w (od najwyższej potęgi) w przedziale [a, b]. Wiadomo, że wartości na końcach mają różne znaki (albo któraś jest zerem) i w przedziale jest jedno zero. Połowij, aż b − a < $10^{-7}$, i zwróć środek zaokrąglony do 3 miejsc.',
    functionName: 'zero',
    params: ['w', 'a', 'b'],
    types: 'list[int], liczba, liczba -> float',
    tests: [
      { name: 'pierwiastek z 2', input: [[1, 0, -2], 0, 2], expected: 1.414 },
      { name: 'złota liczba', input: [[1, -1, -1], 1, 2], expected: 1.618 },
      { name: 'sześcian', input: [[1, 0, 0, -8], 0, 5], expected: 2 },
      { name: 'trzy zera, jedno w przedziale', input: [[1, -6, 11, -6], 2.5, 4], expected: 3, hidden: true },
      { name: 'liniowa', input: [[2, -3], 0, 10], expected: 1.5, hidden: true },
    ],
    model: `
      def wartosc(w, x):
          wynik = 0
          for c in w:
              wynik = wynik * x + c
          return wynik

      def zero(w, a, b):
          while b - a >= 1e-7:
              s = (a + b) / 2
              if wartosc(w, a) * wartosc(w, s) <= 0:
                  b = s
              else:
                  a = s
          return round((a + b) / 2, 3)
    `,
    hints: ['Jak policzyć wartość wielomianu w punkcie?', 'Schematem Hornera — funkcja pomocnicza.', 'W środku s sprawdź znak f(a) · f(s): niedodatni → zero jest w [a, s].', 'Inaczej zero jest w [s, b]; powtarzaj, aż przedział będzie krótszy od $10^{-7}$.'],
    steps: ['Funkcja pomocnicza liczy wartość wielomianu schematem Hornera.', 'Połowienie: zostawiasz połowę, na której końcach wartości mają różne znaki.'],
  }),
  choice({
    id: 'nm-x-6',
    skill: 'cs-approx',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Program dodaje 0,1 dziesięć razy do zmiennej `s = 0` i sprawdza, czy wynik to 1. Które sprawdzenie jest poprawne?',
    choices: ['`abs(s - 1) < 1e-9`', '`s == 1`', '`round(s) == 1.0` — zawsze poprawne dla każdych danych', '`int(s) == 1`'],
    answer: 'A',
    hints: ['Czy suma dziesięciu 0,1 to dokładnie 1 w arytmetyce komputera?', 'Nie: wychodzi 0.9999999999999999.', 'Liczby zmiennoprzecinkowe porównuje się z tolerancją.', 'Które sprawdzenie dopuszcza maleńki błąd, ale nie duży?'],
    steps: ['Suma wynosi 0.9999999999999999 — `==` zawiedzie.', 'Porównanie z tolerancją `abs(s - 1) < 1e-9` jest poprawne.'],
    errors: [
      ['B', 'Pominięty błąd zaokrągleń.', 'Suma zmiennoprzecinkowa nie jest dokładna.'],
      ['C', 'Zaokrąglanie do całkowitych przepuści też duże błędy.', 'np. s = 1,3 też dałoby True.'],
      ['D', '`int` obcina część ułamkową.', 'int(0.9999999999999999) = 0.'],
    ],
  }),
  pyTask({
    id: 'nm-x-7',
    skill: 'cs-approx',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `isqrt(n)`, która zwraca $\\lfloor \\sqrt{n} \\rfloor$ dla liczby całkowitej n ≥ 0 metodą połowienia na liczbach CAŁKOWITYCH (bez `math.sqrt` i potęgi 0.5 — dla bardzo dużych n zaokrąglenia float są niebezpieczne).',
    functionName: 'isqrt',
    params: ['n'],
    types: 'int ≥ 0 -> int',
    tests: [
      { name: 'dziesięć', input: [10], expected: 3 },
      { name: 'kwadrat', input: [16], expected: 4 },
      { name: 'zero', input: [0], expected: 0 },
      { name: 'duża', input: [999999999999999], expected: 31622776, hidden: true },
      { name: 'inna duża', input: [123456789012345], expected: 11111111, hidden: true },
    ],
    model: `
      def isqrt(n):
          lo, hi = 0, n + 1
          while hi - lo > 1:
              s = (lo + hi) // 2
              if s * s <= n:
                  lo = s
              else:
                  hi = s
          return lo
    `,
    hints: ['Jakie dwie wartości ograniczają szukany wynik?', 'Dolna lo z lo² ≤ n i górna hi z hi² > n — na start 0 i n + 1.', 'Sprawdź środek s: jeśli s² ≤ n, przesuń lo, inaczej hi.', 'Gdy hi − lo = 1, wynik to lo.'],
    steps: ['Niezmiennik: lo² ≤ n < hi²; start lo = 0, hi = n + 1.', 'Połowienie przedziału na liczbach całkowitych kończy się na lo = ⌊√n⌋.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const NUM_CARDS: Flashcard[] = [
  card('c-nm-p-1', 'cs-numbers', 'metoda', 'Do jakiej granicy sprawdzać dzielniki przy teście pierwszości?', 'Dopóki `d * d <= n` — do pierwiastka z n.'),
  card('c-nm-p-2', 'cs-numbers', 'metoda', 'Od której liczby sito skreśla wielokrotności i?', 'Od i · i, co i.'),

  card('c-nm-g-1', 'cs-gcd', 'wzor', 'Krok algorytmu Euklidesa?', '(a, b) → (b, a % b), aż b = 0; wynik to a.'),
  card('c-nm-g-2', 'cs-gcd', 'wzor', 'NWW z NWD?', 'NWW(a, b) = a // NWD(a, b) · b'),

  card('c-nm-b-1', 'cs-bases', 'metoda', 'Zamiana z dziesiętnego na system p?', 'Dziel przez p, reszty czytaj od końca.'),
  card('c-nm-b-2', 'cs-bases', 'definicja', 'Ile bitów to jedna cyfra szesnastkowa?', 'Cztery: F = 1111, A = 1010.'),

  card('c-nm-h-1', 'cs-fastpow', 'wzor', 'Schemat Hornera w pętli?', '`wynik = wynik * x + a` dla współczynników od najwyższego.'),
  card('c-nm-h-2', 'cs-fastpow', 'metoda', 'Ile mnożeń daje szybkie potęgowanie?', 'Rzędu $\\log_2 n$ — tyle, ile bitów wykładnika.'),

  card('c-nm-x-1', 'cs-approx', 'wzor', 'Wzór Herona na $\\sqrt{n}$?', '$x \\leftarrow \\frac{1}{2}(x + \\frac{n}{x})$'),
  card('c-nm-x-2', 'cs-approx', 'pulapka', 'Jak porównywać liczby zmiennoprzecinkowe?', 'Z tolerancją: `abs(a - b) < 1e-9`, nie `==`.'),
];

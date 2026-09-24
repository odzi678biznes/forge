import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 6: struktury danych.
 *
 * Podstawa programowa 2024: II.R1 (struktury dynamiczne i biblioteki),
 * I+II.2d (odwrotna notacja polska), I+II.3g (stos, kolejka, lista),
 * I+II.3h (grafy jako model sytuacji problemowych).
 */

export const STRUCT_TOPIC: Topic = {
  id: 'cs-structures',
  subjectId: 'cs',
  name: 'Struktury danych',
  summary: 'Stos, kolejka i odwrotna notacja polska; grafy: reprezentacja, przeszukiwanie wszerz, spójność i najkrótsze drogi w labiryncie.',
};

export const STRUCT_SKILLS: Skill[] = [
  {
    id: 'cs-stack-queue',
    topicId: 'cs-structures',
    name: 'Stos, kolejka i ONP',
    level: 'PR',
    ckeRequirement: 'Struktury dynamiczne: stos, kolejka, lista; odwrotna notacja polska (I+II.3g, I+II.2d, II.R1)',
    prerequisites: ['cs-recursion'],
    examValue: 0.65,
  },
  {
    id: 'cs-graphs',
    topicId: 'cs-structures',
    name: 'Grafy i przeszukiwanie',
    level: 'PR',
    ckeRequirement: 'Grafy jako model sytuacji problemowych: reprezentacja, przeszukiwanie, spójność (I+II.3h)',
    prerequisites: ['cs-stack-queue', 'cs-greedy'],
    examValue: 0.6,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const STRUCT_LESSONS: Lesson[] = [
  {
    skillId: 'cs-stack-queue',
    minutes: 15,
    intro:
      'Stos działa jak stos talerzy: zdejmujesz ten, który położono ostatni (LIFO). Kolejka jak kolejka do kasy: obsługiwany jest ten, kto przyszedł pierwszy (FIFO). Te dwie proste zasady rozwiązują zaskakująco wiele problemów.',
    blocks: [
      listing('stos = []\nstos.append(1)        # połóż na wierzch\nstos.append(2)\nprint(stos.pop())     # 2 - zdejmij z wierzchu\n\nfrom collections import deque\nkolejka = deque()\nkolejka.append("Ala")  # dołącz na koniec\nkolejka.append("Ola")\nprint(kolejka.popleft())  # Ala - obsłuż pierwszego'),
      p('Odwrotna notacja polska (ONP) zapisuje działanie PO argumentach: `2 3 +` zamiast `2 + 3`. Nie potrzebuje nawiasów: `(2 + 3) * 4` to `2 3 + 4 *`. Obliczanie jest proste: liczby kładziesz na stos, a operator zdejmuje dwie ostatnie i odkłada wynik.'),
      listing('def onp(wyrazenie):\n    stos = []\n    for t in wyrazenie.split():\n        if t in "+-*":\n            b = stos.pop()       # uwaga: najpierw prawy argument\n            a = stos.pop()\n            stos.append(a + b if t == "+" else a - b if t == "-" else a * b)\n        else:\n            stos.append(int(t))\n    return stos[0]'),
      p('Zamiana na ONP (algorytm stacji rozrządowej): liczby od razu idą na wyjście, operatory czekają na stosie. Operator zdejmuje ze stosu na wyjście te, które mają priorytet nie niższy od niego; „(” czeka, a „)” zdejmuje wszystko do „(”.'),
      tip('Lista (lista dowiązaniowa) to trzecia struktura dynamiczna z podstawy: każdy element pamięta następny. W Pythonie wbudowana `list` to tablica, a `deque` — struktura szybka na obu końcach.'),
      warn('Przy odejmowaniu i dzieleniu w ONP kolejność ma znaczenie: pierwszy zdjęty ze stosu jest PRAWYM argumentem. `5 2 -` to 5 − 2, a nie 2 − 5.'),
    ],
    examples: [
      example(
        'Oblicz wyrażenie ONP: 5 1 2 + 4 * + 3 −.',
        [['Stos: 5; 5 1; 5 1 2; „+” → 5 3; 5 3 4; „*” → 5 12; „+” → 17.', 'operator zdejmuje dwie ostatnie liczby'], '17 3 „−” → 14.'],
        '14',
      ),
      example(
        'Zapisz w ONP: 2 * (3 + 4).',
        ['Najpierw nawias: 3 4 +.', 'Potem mnożenie przez 2: 2 3 4 + *.'],
        '2 3 4 + *',
      ),
    ],
    pitfalls: ['Odwrócona kolejność argumentów przy „−”.', '`list.pop(0)` jako kolejka — wolne dla dużych danych.', 'Operator o równym priorytecie nie zdjęty ze stosu (zła łączność).'],
  },
  {
    skillId: 'cs-graphs',
    minutes: 16,
    intro:
      'Graf to wierzchołki połączone krawędziami: miasta i drogi, znajomi w serwisie, pola planszy. Wiele zadań staje się prostych, gdy tylko zobaczysz w nich graf.',
    blocks: [
      listing('n = 4\nkrawedzie = [[0, 1], [0, 2], [1, 2], [2, 3]]\nsasiedzi = [[] for _ in range(n)]\nfor u, v in krawedzie:\n    sasiedzi[u].append(v)\n    sasiedzi[v].append(u)     # graf nieskierowany\nprint(sasiedzi)   # [[1, 2], [0, 2], [0, 1, 3], [2]]', 'Lista sąsiedztwa — najczęstsza reprezentacja.'),
      p('Przeszukiwanie wszerz (BFS) odwiedza wierzchołki warstwami: najpierw sąsiadów startu, potem ich sąsiadów… Dzięki kolejce każdy wierzchołek dostaje odległość — liczbę krawędzi najkrótszej drogi.'),
      listing('from collections import deque\n\ndef bfs(sasiedzi, s):\n    odl = [-1] * len(sasiedzi)\n    odl[s] = 0\n    kolejka = deque([s])\n    while kolejka:\n        u = kolejka.popleft()\n        for v in sasiedzi[u]:\n            if odl[v] == -1:\n                odl[v] = odl[u] + 1\n                kolejka.append(v)\n    return odl'),
      p('Suma stopni wszystkich wierzchołków grafu nieskierowanego to dwukrotność liczby krawędzi — każda krawędź ma dwa końce.'),
      tip('Plansza z przeszkodami to też graf: pole to wierzchołek, a sąsiednie wolne pola łączą krawędzie. Najkrótsza droga w labiryncie = BFS.'),
      warn('Oznaczaj wierzchołek jako odwiedzony W MOMENCIE dodania do kolejki, a nie przy zdjęciu — inaczej trafi do kolejki wiele razy.'),
    ],
    examples: [
      example(
        'Graf ma 5 wierzchołków i 7 krawędzi. Jaka jest suma stopni?',
        [['Każda krawędź dodaje 1 do stopnia każdego z dwóch końców.', 'lemat o uściskach dłoni'], '2 · 7.'],
        '14',
      ),
      example(
        'Ile spójnych składowych ma graf o wierzchołkach 0–5 i krawędziach 0–1, 1–2, 3–4?',
        ['Składowe: {0, 1, 2}, {3, 4}, {5}.', 'Wierzchołek bez krawędzi to osobna składowa.'],
        '3',
      ),
    ],
    pitfalls: ['Krawędź dodana tylko w jedną stronę w grafie nieskierowanym.', 'Oznaczanie odwiedzin przy zdjęciu z kolejki.', 'Pominięcie izolowanych wierzchołków przy liczeniu składowych.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const STRUCT_QUESTIONS: Question[] = [
  // cs-stack-queue ------------------------------------------------------------
  numeric({
    id: 'st-s-1',
    skill: 'cs-stack-queue',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 's = []\ns.append(1)\ns.append(2)\ns.pop()\ns.append(3)\ns.append(4)\nprint(s.pop() + len(s))',
    answer: 6,
    verify: () => 4 + 2,
    hints: ['Który element zdejmuje `pop()`?', 'Ostatnio dodany — z wierzchu stosu.', 'Śledź stos: [1], [1, 2], [1], [1, 3], [1, 3, 4].', 'Po zdjęciu 4 na stosie zostają dwa elementy.'],
    steps: ['Przed ostatnią linią stos to [1, 3, 4].', '`pop()` daje 4, zostają 2 elementy: 4 + 2 = 6.'],
    errors: [['7', 'Długość liczona przed zdjęciem.', '`pop()` wykonuje się przed `len(s)`.']],
  }),
  choice({
    id: 'st-s-2',
    skill: 'cs-stack-queue',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Do kolejki trafiają kolejno A, B, C, a na stos — kolejno A, B, C. Który element zostanie zdjęty jako pierwszy z kolejki, a który ze stosu?',
    choices: ['z kolejki A, ze stosu C', 'z kolejki C, ze stosu A', 'w obu przypadkach A', 'w obu przypadkach C'],
    answer: 'A',
    hints: ['Jaką zasadę ma kolejka?', 'FIFO — pierwszy przyszedł, pierwszy wychodzi.', 'A stos?', 'LIFO — ostatni włożony wychodzi pierwszy.'],
    steps: ['Kolejka (FIFO) oddaje najpierw A.', 'Stos (LIFO) oddaje najpierw C.'],
    errors: [
      ['B', 'Zamienione zasady kolejki i stosu.', 'Kolejka to FIFO, stos to LIFO.'],
      ['C', 'Stos potraktowany jak kolejka.', 'Stos oddaje ostatnio włożony element.'],
      ['D', 'Kolejka potraktowana jak stos.', 'Kolejka oddaje pierwszy element.'],
    ],
  }),
  pyTask({
    id: 'st-s-3',
    skill: 'cs-stack-queue',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `nawiasy(s)`, która sprawdza stosem, czy nawiasy okrągłe `()`, kwadratowe `[]` i klamrowe `{}` w napisie są poprawnie sparowane i zagnieżdżone. Inne znaki pomijaj.',
    functionName: 'nawiasy',
    params: ['s'],
    types: 'str -> bool',
    tests: [
      { name: 'poprawne', input: ['([]{})'], expected: true },
      { name: 'przeplecione', input: ['([)]'], expected: false },
      { name: 'z tekstem', input: ['f(x[1]) + {2}'], expected: true },
      { name: 'niezamknięty', input: ['(('], expected: false, hidden: true },
      { name: 'nadmiarowe zamknięcie', input: ['())'], expected: false, hidden: true },
      { name: 'pusty', input: [''], expected: true, hidden: true },
    ],
    model: `
      def nawiasy(s):
          para = {")": "(", "]": "[", "}": "{"}
          stos = []
          for c in s:
              if c in "([{":
                  stos.append(c)
              elif c in para:
                  if not stos or stos.pop() != para[c]:
                      return False
          return not stos
    `,
    hints: ['Co robić z nawiasem otwierającym?', 'Położyć go na stos.', 'Nawias zamykający musi pasować do tego z wierzchu stosu.', 'Na końcu stos musi być pusty.'],
    steps: ['Otwierające na stos; zamykający zdejmuje wierzch i musi do niego pasować.', 'Pusty stos przy zamykaniu albo niepusty na końcu → False.'],
  }),
  pyTask({
    id: 'st-s-4',
    skill: 'cs-stack-queue',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `onp(wyrazenie)`, która oblicza wyrażenie w odwrotnej notacji polskiej. Elementy są oddzielone spacjami; operatory to +, − (znak „-”) i *, liczby są całkowite nieujemne.',
    functionName: 'onp',
    params: ['wyrazenie'],
    types: 'str -> int',
    tests: [
      { name: 'proste', input: ['2 3 + 4 *'], expected: 20 },
      { name: 'dłuższe', input: ['5 1 2 + 4 * + 3 -'], expected: 14 },
      { name: 'sama liczba', input: ['7'], expected: 7 },
      { name: 'odejmowanie', input: ['3 4 - 5 *'], expected: -5, hidden: true },
      { name: 'priorytet', input: ['2 3 4 * +'], expected: 14, hidden: true },
    ],
    model: `
      def onp(wyrazenie):
          stos = []
          for t in wyrazenie.split():
              if t in ("+", "-", "*"):
                  b = stos.pop()
                  a = stos.pop()
                  if t == "+":
                      stos.append(a + b)
                  elif t == "-":
                      stos.append(a - b)
                  else:
                      stos.append(a * b)
              else:
                  stos.append(int(t))
          return stos[0]
    `,
    hints: ['Co robisz z liczbą, a co z operatorem?', 'Liczbę kładziesz na stos; operator zdejmuje dwie liczby.', 'Pierwsza zdjęta to prawy argument b, druga — lewy a.', 'Wynik a op b wraca na stos; na końcu na stosie jest odpowiedź.'],
    steps: ['Liczby na stos.', 'Operator: b = pop, a = pop, wynik a op b na stos; odpowiedź to jedyny element na końcu.'],
  }),
  pyTask({
    id: 'st-s-5',
    skill: 'cs-stack-queue',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Problem Józefa Flawiusza: n osób stoi w kółku (numery 1 … n). Odliczając od osoby nr 1, co k-ta osoba odpada. Napisz funkcję `jozef(n, k)`, która zwraca numer osoby, która zostanie. Wygodna jest kolejka `deque`.',
    functionName: 'jozef',
    params: ['n', 'k'],
    types: 'int ≥ 1, int ≥ 1 -> int',
    tests: [
      { name: 'siedem osób', input: [7, 3], expected: 4 },
      { name: 'jedna osoba', input: [1, 1], expected: 1 },
      { name: 'co druga', input: [5, 2], expected: 3 },
      { name: 'każda po kolei', input: [10, 1], expected: 10, hidden: true },
      { name: 'historyczny', input: [41, 3], expected: 31, hidden: true },
    ],
    model: `
      from collections import deque

      def jozef(n, k):
          kolejka = deque(range(1, n + 1))
          while len(kolejka) > 1:
              kolejka.rotate(-(k - 1))
              kolejka.popleft()
          return kolejka[0]
    `,
    hints: ['Jak przesuwać odliczanie po kółku za pomocą kolejki?', 'Przenoś osobę z początku na koniec — k − 1 razy.', 'Wtedy k-ta osoba jest na początku: usuń ją `popleft()`.', 'Powtarzaj, dopóki zostanie jedna osoba.'],
    steps: ['k − 1 osób przechodzi z początku kolejki na koniec, k-ta odpada.', 'Pętla trwa, aż w kolejce zostanie jedna osoba.'],
  }),
  pyTask({
    id: 'st-s-6',
    skill: 'cs-stack-queue',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `na_onp(wyrazenie)`, która zamienia wyrażenie w zapisie zwykłym (cyfry 0–9, operatory + − * /, nawiasy, bez spacji) na ONP z elementami oddzielonymi spacjami. Operatory o równym priorytecie wykonują się od lewej.',
    functionName: 'na_onp',
    params: ['wyrazenie'],
    types: 'str -> str',
    tests: [
      { name: 'priorytet', input: ['2+3*4'], expected: '2 3 4 * +' },
      { name: 'nawias', input: ['(2+3)*4'], expected: '2 3 + 4 *' },
      { name: 'jedna cyfra', input: ['5'], expected: '5' },
      { name: 'od lewej', input: ['1-2-3'], expected: '1 2 - 3 -', hidden: true },
      { name: 'złożone', input: ['2*(3+4)-5/1'], expected: '2 3 4 + * 5 1 / -', hidden: true },
    ],
    model: `
      def na_onp(wyrazenie):
          priorytet = {"+": 1, "-": 1, "*": 2, "/": 2}
          wyjscie = []
          stos = []
          for c in wyrazenie:
              if c.isdigit():
                  wyjscie.append(c)
              elif c == "(":
                  stos.append(c)
              elif c == ")":
                  while stos[-1] != "(":
                      wyjscie.append(stos.pop())
                  stos.pop()
              else:
                  while stos and stos[-1] != "(" and priorytet[stos[-1]] >= priorytet[c]:
                      wyjscie.append(stos.pop())
                  stos.append(c)
          while stos:
              wyjscie.append(stos.pop())
          return " ".join(wyjscie)
    `,
    hints: ['Co od razu trafia na wyjście?', 'Cyfry.', 'Operator zdejmuje ze stosu na wyjście operatory o priorytecie nie niższym od siebie, potem sam trafia na stos.', '„)” zdejmuje wszystko do „(”; na końcu opróżnij stos.'],
    steps: ['Cyfry na wyjście; „(” na stos; „)” zdejmuje do „(”.', 'Operator zdejmuje operatory o priorytecie ≥ swojemu, potem idzie na stos; na końcu stos na wyjście.'],
  }),
  pyTask({
    id: 'st-s-7',
    skill: 'cs-stack-queue',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Dla każdego elementu listy znajdź najbliższy element na prawo od niego, który jest od niego ŚCIŚLE większy (albo -1). Napisz funkcję `nastepny_wiekszy(t)` działającą w czasie liniowym — stos trzyma indeksy elementów, które jeszcze czekają na odpowiedź.',
    functionName: 'nastepny_wiekszy',
    params: ['t'],
    types: 'list[int] -> list[int]',
    tests: [
      { name: 'przykład', input: [[4, 5, 2, 25]], expected: [5, 25, 25, -1] },
      { name: 'dołek', input: [[13, 7, 6, 12]], expected: [-1, 12, 12, -1] },
      { name: 'pusta', input: [[]], expected: [] },
      { name: 'rosnąca', input: [[1, 2, 3]], expected: [2, 3, -1], hidden: true },
      { name: 'równe', input: [[3, 3, 1]], expected: [-1, -1, -1], hidden: true },
    ],
    model: `
      def nastepny_wiekszy(t):
          wynik = [-1] * len(t)
          stos = []
          for i, x in enumerate(t):
              while stos and t[stos[-1]] < x:
                  wynik[stos.pop()] = x
              stos.append(i)
          return wynik
    `,
    hints: ['Co wiadomo o elementach, które czekają na stosie?', 'Tworzą ciąg nierosnący — żaden nie znalazł jeszcze większego.', 'Nowy element x jest odpowiedzią dla wszystkich mniejszych od niego z wierzchu stosu.', 'Zdejmij je, wpisując x, a potem połóż indeks x na stos.'],
    steps: ['Stos trzyma indeksy bez odpowiedzi; na start wynik to same −1.', 'Każdy x rozwiązuje mniejsze elementy z wierzchu stosu; każdy indeks trafia na stos i schodzi z niego raz.'],
  }),

  // cs-graphs -----------------------------------------------------------------
  numeric({
    id: 'st-g-1',
    skill: 'cs-graphs',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program (największy stopień wierzchołka)?',
    listing: 'krawedzie = [[0, 1], [0, 2], [1, 2], [2, 3]]\nstopien = [0] * 4\nfor u, v in krawedzie:\n    stopien[u] += 1\n    stopien[v] += 1\nprint(max(stopien))',
    answer: 3,
    verify: () => {
      const krawedzie: Array<[number, number]> = [[0, 1], [0, 2], [1, 2], [2, 3]];
      const st = [0, 1, 2, 3].map((w) => krawedzie.filter(([u, v]) => u === w || v === w).length);
      return Math.max(...st);
    },
    hints: ['Co oznacza stopień wierzchołka?', 'Liczbę krawędzi, które go dotykają.', 'Policz, w ilu parach występuje każdy wierzchołek.', 'Wierzchołek 2 występuje w trzech krawędziach.'],
    steps: ['Stopnie: 0 → 2, 1 → 2, 2 → 3, 3 → 1.', 'Największy: 3.'],
    errors: [['4', 'Podana liczba krawędzi.', 'Pytanie dotyczy stopnia jednego wierzchołka.']],
  }),
  choice({
    id: 'st-g-2',
    skill: 'cs-graphs',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Graf nieskierowany ma 5 wierzchołków i 7 krawędzi. Ile wynosi suma stopni wszystkich wierzchołków?',
    choices: ['14', '7', '12', '35'],
    answer: 'A',
    hints: ['Do stopni ilu wierzchołków dolicza się jedna krawędź?', 'Dwóch — swoich końców.', 'Każda krawędź zwiększa sumę stopni o 2.', 'Pomnóż liczbę krawędzi przez 2.'],
    steps: ['Każda krawędź dodaje 1 do stopnia każdego z dwóch końców.', 'Suma stopni = 2 · 7 = 14.'],
    errors: [
      ['B', 'Każda krawędź liczona raz.', 'Krawędź ma dwa końce.'],
      ['C', 'Liczba wierzchołków pomylona z krawędziami.', 'Suma stopni zależy tylko od liczby krawędzi.'],
      ['D', 'Pomnożone wierzchołki przez krawędzie.', 'Suma stopni = 2 · liczba krawędzi.'],
    ],
  }),
  pyTask({
    id: 'st-g-3',
    skill: 'cs-graphs',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `sasiedztwo(n, krawedzie)`, która dla grafu nieskierowanego o wierzchołkach 0 … n − 1 zwraca listy sąsiedztwa: element i to rosnąca lista sąsiadów wierzchołka i.',
    functionName: 'sasiedztwo',
    params: ['n', 'krawedzie'],
    types: 'int, list[[int, int]] -> list[list[int]]',
    tests: [
      { name: 'przykład', input: [4, [[0, 1], [0, 2], [1, 2], [2, 3]]], expected: [[1, 2], [0, 2], [0, 1, 3], [2]] },
      { name: 'bez krawędzi', input: [3, []], expected: [[], [], []] },
      { name: 'odwrócona kolejność', input: [3, [[2, 0], [1, 0]]], expected: [[1, 2], [0], [0]] },
      { name: 'gwiazda', input: [5, [[0, 4], [0, 3], [0, 2], [0, 1]]], expected: [[1, 2, 3, 4], [0], [0], [0], [0]], hidden: true },
    ],
    model: `
      def sasiedztwo(n, krawedzie):
          s = [[] for _ in range(n)]
          for u, v in krawedzie:
              s[u].append(v)
              s[v].append(u)
          return [sorted(x) for x in s]
    `,
    hints: ['Jak utworzyć n osobnych pustych list?', '`[[] for _ in range(n)]` — nie `[[]] * n`.', 'Każdą krawędź dopisz w obie strony.', 'Na końcu posortuj każdą listę.'],
    steps: ['n pustych list; krawędź u–v dopisuje v do u i u do v.', 'Każdą listę sortujesz rosnąco.'],
  }),
  pyTask({
    id: 'st-g-4',
    skill: 'cs-graphs',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `odleglosci(n, krawedzie, s)`, która przeszukiwaniem wszerz zwraca liczbę krawędzi najkrótszej drogi od s do każdego wierzchołka grafu nieskierowanego (-1 dla nieosiągalnych).',
    functionName: 'odleglosci',
    params: ['n', 'krawedzie', 's'],
    types: 'int, list[[int, int]], int -> list[int]',
    tests: [
      { name: 'przykład', input: [4, [[0, 1], [0, 2], [1, 2], [2, 3]], 0], expected: [0, 1, 1, 2] },
      { name: 'nieosiągalny', input: [3, [[0, 1]], 0], expected: [0, 1, -1] },
      { name: 'ścieżka', input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]], 2], expected: [2, 1, 0, 1, 2] },
      { name: 'cykl', input: [6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], 0], expected: [0, 1, 2, 3, 2, 1], hidden: true },
      { name: 'samotny', input: [1, [], 0], expected: [0], hidden: true },
    ],
    model: `
      from collections import deque

      def odleglosci(n, krawedzie, s):
          sasiedzi = [[] for _ in range(n)]
          for u, v in krawedzie:
              sasiedzi[u].append(v)
              sasiedzi[v].append(u)
          odl = [-1] * n
          odl[s] = 0
          kolejka = deque([s])
          while kolejka:
              u = kolejka.popleft()
              for v in sasiedzi[u]:
                  if odl[v] == -1:
                      odl[v] = odl[u] + 1
                      kolejka.append(v)
          return odl
    `,
    hints: ['Jaka struktura daje przeszukiwanie warstwami?', 'Kolejka FIFO — `deque`.', 'Odległość sąsiada to odległość bieżącego + 1, jeśli sąsiad nie był jeszcze odwiedzony.', 'Nieodwiedzone oznacz −1 i nadaj odległość w chwili dodania do kolejki.'],
    steps: ['Lista sąsiedztwa, tablica odległości z −1, start z odległością 0.', 'BFS: nieodwiedzony sąsiad dostaje odległość + 1 i trafia do kolejki.'],
  }),
  pyTask({
    id: 'st-g-5',
    skill: 'cs-graphs',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `skladowe(n, krawedzie)`, która zwraca liczbę spójnych składowych grafu nieskierowanego o wierzchołkach 0 … n − 1.',
    functionName: 'skladowe',
    params: ['n', 'krawedzie'],
    types: 'int, list[[int, int]] -> int',
    tests: [
      { name: 'trzy składowe', input: [6, [[0, 1], [1, 2], [3, 4]]], expected: 3 },
      { name: 'spójny', input: [3, [[0, 1], [1, 2]]], expected: 1 },
      { name: 'bez krawędzi', input: [4, []], expected: 4 },
      { name: 'cykle', input: [7, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]]], expected: 3, hidden: true },
      { name: 'jeden wierzchołek', input: [1, []], expected: 1, hidden: true },
    ],
    model: `
      def skladowe(n, krawedzie):
          sasiedzi = [[] for _ in range(n)]
          for u, v in krawedzie:
              sasiedzi[u].append(v)
              sasiedzi[v].append(u)
          odwiedzony = [False] * n
          ile = 0
          for start in range(n):
              if odwiedzony[start]:
                  continue
              ile += 1
              odwiedzony[start] = True
              stos = [start]
              while stos:
                  u = stos.pop()
                  for v in sasiedzi[u]:
                      if not odwiedzony[v]:
                          odwiedzony[v] = True
                          stos.append(v)
          return ile
    `,
    hints: ['Co zrobić, gdy trafisz na nieodwiedzony wierzchołek?', 'Zacząć od niego nową składową i odwiedzić wszystko, co z niego osiągalne.', 'Przeszukiwanie może użyć stosu (w głąb) albo kolejki (wszerz).', 'Liczba startów nowego przeszukiwania to liczba składowych.'],
    steps: ['Przechodzisz po wierzchołkach; nieodwiedzony rozpoczyna nową składową.', 'Przeszukiwanie z niego oznacza całą składową; liczysz starty.'],
  }),
  pyTask({
    id: 'st-g-6',
    skill: 'cs-graphs',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Labirynt to lista napisów: „S” — start, „K” — koniec, „.” — pole wolne, „#” — ściana. Ruch w górę, dół, lewo lub prawo. Napisz funkcję `labirynt(plansza)`, która zwraca najmniejszą liczbę ruchów z S do K albo -1.',
    functionName: 'labirynt',
    params: ['plansza'],
    types: 'list[str] -> int',
    tests: [
      { name: 'mały', input: [['S.#', '..#', '#.K']], expected: 4 },
      { name: 'zamknięty', input: [['S#K']], expected: -1 },
      { name: 'obok', input: [['SK']], expected: 1 },
      { name: 'zakręt', input: [['S....', '###.#', 'K....']], expected: 8, hidden: true },
      { name: 'długi', input: [['S.........', '########.#', 'K.........']], expected: 18, hidden: true },
    ],
    model: `
      from collections import deque

      def labirynt(plansza):
          w, k = len(plansza), len(plansza[0])
          for i in range(w):
              for j in range(k):
                  if plansza[i][j] == "S":
                      start = (i, j)
          odl = {start: 0}
          kolejka = deque([start])
          while kolejka:
              i, j = kolejka.popleft()
              if plansza[i][j] == "K":
                  return odl[(i, j)]
              for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                  a, b = i + di, j + dj
                  if 0 <= a < w and 0 <= b < k and plansza[a][b] != "#" and (a, b) not in odl:
                      odl[(a, b)] = odl[(i, j)] + 1
                      kolejka.append((a, b))
          return -1
    `,
    hints: ['Czym w grafie jest pole planszy?', 'Wierzchołkiem; sąsiednie pola bez ściany łączy krawędź.', 'Najkrótsza droga w grafie bez wag to BFS od pola S.', 'Pilnuj granic planszy i ścian; gdy zdejmiesz K — zwróć odległość.'],
    steps: ['Znajdujesz S; BFS po polach z czterema kierunkami ruchu.', 'Pierwsze zdjęcie K z kolejki daje najkrótszą drogę; pusta kolejka → −1.'],
  }),
  pyTask({
    id: 'st-g-7',
    skill: 'cs-graphs',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Graf jest dwudzielny, jeśli wierzchołki da się pokolorować dwoma kolorami tak, by każda krawędź łączyła różne kolory. Napisz funkcję `dwudzielny(n, krawedzie)`. Graf może być niespójny.',
    functionName: 'dwudzielny',
    params: ['n', 'krawedzie'],
    types: 'int, list[[int, int]] -> bool',
    tests: [
      { name: 'kwadrat', input: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: true },
      { name: 'trójkąt', input: [3, [[0, 1], [1, 2], [2, 0]]], expected: false },
      { name: 'bez krawędzi', input: [3, []], expected: true },
      { name: 'nieparzysty cykl w drugiej składowej', input: [7, [[0, 1], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2]]], expected: false, hidden: true },
      { name: 'ścieżka', input: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: true, hidden: true },
    ],
    model: `
      from collections import deque

      def dwudzielny(n, krawedzie):
          sasiedzi = [[] for _ in range(n)]
          for u, v in krawedzie:
              sasiedzi[u].append(v)
              sasiedzi[v].append(u)
          kolor = [-1] * n
          for start in range(n):
              if kolor[start] != -1:
                  continue
              kolor[start] = 0
              kolejka = deque([start])
              while kolejka:
                  u = kolejka.popleft()
                  for v in sasiedzi[u]:
                      if kolor[v] == -1:
                          kolor[v] = 1 - kolor[u]
                          kolejka.append(v)
                      elif kolor[v] == kolor[u]:
                          return False
          return True
    `,
    hints: ['Jaki kolor musi mieć sąsiad wierzchołka o kolorze 0?', 'Kolor 1 — i odwrotnie.', 'Koloruj BFS-em: nieodwiedzony sąsiad dostaje kolor przeciwny.', 'Sąsiad w TYM SAMYM kolorze oznacza, że graf nie jest dwudzielny; pamiętaj o każdej składowej.'],
    steps: ['BFS z każdego niepokolorowanego wierzchołka; sąsiedzi dostają kolor przeciwny.', 'Krawędź między wierzchołkami tego samego koloru → False; inaczej True.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const STRUCT_CARDS: Flashcard[] = [
  card('c-st-s-1', 'cs-stack-queue', 'definicja', 'LIFO i FIFO — która to stos, a która kolejka?', 'Stos: LIFO (ostatni wchodzi, pierwszy wychodzi). Kolejka: FIFO.'),
  card('c-st-s-2', 'cs-stack-queue', 'metoda', 'Jak obliczyć wyrażenie ONP?', 'Liczby na stos; operator zdejmuje b, potem a i odkłada a op b.'),

  card('c-st-g-1', 'cs-graphs', 'wzor', 'Suma stopni grafu nieskierowanego?', 'Dwukrotność liczby krawędzi.'),
  card('c-st-g-2', 'cs-graphs', 'metoda', 'Najkrótsza droga w grafie bez wag?', 'BFS — kolejka, odległość sąsiada = odległość + 1.'),
];

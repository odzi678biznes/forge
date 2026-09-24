import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 2: listy, napisy, słowniki i dane z plików.
 *
 * Podstawa programowa 2024: II.R1 (struktury danych i biblioteki), I.2b
 * (algorytmy na tekstach: porównywanie, wyszukiwanie wzorca metodą naiwną,
 * szyfr Cezara), I+II.1d (jednoczesne wyszukiwanie min i max).
 *
 * Na maturze dane przychodzą w pliku tekstowym (np. `liczby.txt`). W
 * aplikacji funkcja dostaje zawartość pliku jako napis `dane` — to ten sam
 * kod parsowania, bez otwierania pliku.
 */

export const DATA_TOPIC: Topic = {
  id: 'cs-data',
  subjectId: 'cs',
  name: 'Listy, napisy, słowniki i pliki',
  summary: 'Przetwarzanie ciągów danych: listy, operacje na tekstach, zliczanie słownikiem i wczytywanie danych z pliku — jak w zadaniach maturalnych.',
};

export const DATA_SKILLS: Skill[] = [
  {
    id: 'cs-arrays',
    topicId: 'cs-data',
    name: 'Listy: przechodzenie, min i max, indeksy',
    level: 'PR',
    ckeRequirement: 'Struktury danych w programach; jednoczesne wyszukiwanie najmniejszego i największego elementu (II.R1, I+II.1d)',
    prerequisites: ['cs-py-functions'],
    examValue: 0.9,
  },
  {
    id: 'cs-strings',
    topicId: 'cs-data',
    name: 'Napisy: porównywanie, wzorce, szyfr Cezara',
    level: 'PR',
    ckeRequirement: 'Algorytmy na tekstach: porównywanie, wyszukiwanie wzorca metodą naiwną, szyfr Cezara (I.2b)',
    prerequisites: ['cs-arrays'],
    examValue: 0.85,
  },
  {
    id: 'cs-dicts',
    topicId: 'cs-data',
    name: 'Słowniki i zbiory: zliczanie',
    level: 'PR',
    ckeRequirement: 'Dobór struktur danych do algorytmu, korzystanie z bibliotek (II.R1, I+II.R4)',
    prerequisites: ['cs-arrays'],
    examValue: 0.75,
  },
  {
    id: 'cs-files',
    topicId: 'cs-data',
    name: 'Dane z pliku: wczytywanie i parsowanie',
    level: 'PR',
    ckeRequirement: 'Programy przetwarzające dane z plików tekstowych — część praktyczna egzaminu (II.R1, II.R2)',
    prerequisites: ['cs-strings'],
    examValue: 0.95,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const DATA_LESSONS: Lesson[] = [
  {
    skillId: 'cs-arrays',
    minutes: 14,
    intro:
      'Lista to ponumerowany ciąg wartości. Numeracja zaczyna się od zera, a ujemny indeks liczy od końca. Prawie każde zadanie maturalne z programowania to przejście pętlą po liście i zapamiętywanie czegoś po drodze.',
    blocks: [
      listing('t = [4, 8, 15, 16, 23, 42]\nprint(t[0], t[-1])   # 4 42\nprint(len(t))        # 6\nprint(t[1:4])        # [8, 15, 16] - od 1 do 3 włącznie\nt.append(7)          # dopisz na końcu\n\nfor i in range(len(t)):   # gdy potrzebny jest indeks\n    print(i, t[i])'),
      p('Wycinek `t[a:b]` zawiera elementy o indeksach od `a` do `b - 1` — tak samo jak `range(a, b)`. Pętla `for x in t` daje same wartości, a `for i in range(len(t))` — indeksy, gdy trzeba porównać sąsiadów `t[i]` i `t[i + 1]`.'),
      listing(
        'def min_max(t):\n    mn = mx = t[0]\n    for x in t[1:]:\n        if x < mn:\n            mn = x\n        elif x > mx:\n            mx = x\n    return [mn, mx]',
        'Minimum i maksimum w jednym przejściu — wymaganie I+II.1d.',
      ),
      tip('Pierwszy kandydat na minimum to pierwszy element listy, a nie 0 — zero „wygra” z każdą listą samych liczb dodatnich albo ujemnych.'),
      warn('`t[len(t)]` to błąd `IndexError`: ostatni element ma indeks `len(t) - 1`. W pętli po sąsiadach idź do `len(t) - 1`.'),
    ],
    examples: [
      example(
        'Ile par sąsiednich elementów listy `[1, 3, 2, 5, 4]` tworzy wzrost (następny większy od poprzedniego)?',
        [['Porównujesz `t[i]` z `t[i + 1]` dla i od 0 do 3.', 'ostatni element nie ma następnika'], 'Wzrosty: 1→3 i 2→5.'],
        '2',
      ),
      example(
        'Co zwróci `min_max([7, 2, 9, 2])`?',
        ['Start: mn = mx = 7.', '2 < 7 → mn = 2; 9 > 7 → mx = 9; drugie 2 nic nie zmienia.'],
        '[2, 9]',
      ),
    ],
    pitfalls: ['Start minimum od 0 zamiast od pierwszego elementu.', 'Wyjście poza listę przy porównywaniu sąsiadów.', 'Zapomniany koniec wycinka: `t[1:4]` nie zawiera `t[4]`.'],
  },
  {
    skillId: 'cs-strings',
    minutes: 14,
    intro:
      'Napis to ciąg znaków — indeksuje się go i wycina jak listę. Różnica: napisu nie można zmienić w miejscu, każda „zmiana” tworzy nowy napis.',
    blocks: [
      listing('s = "informatyka"\nprint(len(s), s[0], s[-1])   # 11 i a\nprint(s[2:6])                # "form"\nprint(s[::-1])               # napis od tyłu\nprint(s.upper(), s.count("a"))\nprint("mat" in s)            # True\nprint(ord("a"), chr(98))     # 97 b'),
      p('Napisy porównuje się leksykograficznie, jak w słowniku: `"ala" < "alan" < "b"`. Uwaga: wielkie litery mają mniejsze kody niż małe, więc `"Zebra" < "ala"`.'),
      p('Szyfr Cezara przesuwa każdą literę o `k` pozycji w alfabecie, zawijając z „z” na „a”. Kod litery to `ord(c) - ord("a")` (od 0 do 25), przesunięcie liczymy modulo 26.'),
      listing('def cezar(tekst, k):\n    wynik = ""\n    for c in tekst:\n        if "a" <= c <= "z":\n            c = chr((ord(c) - ord("a") + k) % 26 + ord("a"))\n        wynik += c\n    return wynik'),
      tip('Wyszukiwanie wzorca metodą naiwną: dla każdej pozycji `i` sprawdź, czy `tekst[i:i + len(w)] == w`. Pozycji jest `len(tekst) - len(w) + 1`.'),
      warn('Modulo 26 załatwia zawijanie i przesunięcia większe od 26 — bez niego `chr` da znaki spoza alfabetu.'),
    ],
    examples: [
      example(
        'Zaszyfruj słowo „xyz” szyfrem Cezara z k = 3.',
        [['x → a, y → b, z → c.', 'po „z” wracamy na początek alfabetu'], 'Numery: 23, 24, 25 → (23+3)%26 = 0, 1, 2.'],
        'abc',
      ),
      example(
        'Na których pozycjach wzorzec „aba” występuje w „abababa”?',
        ['Sprawdzasz pozycje 0…4: pasują 0, 2 i 4.', 'Wystąpienia mogą na siebie nachodzić.'],
        '[0, 2, 4]',
      ),
    ],
    pitfalls: ['Próba zmiany znaku `s[0] = "x"` — napisy są niezmienne.', 'Brak `% 26` w szyfrze Cezara.', 'Pominięcie ostatniej pozycji przy szukaniu wzorca.'],
  },
  {
    skillId: 'cs-dicts',
    minutes: 12,
    intro:
      'Słownik przechowuje pary klucz → wartość i odpowiada na pytanie „ile razy?” albo „co przypisano do…?” bez przeszukiwania całej listy. Zbiór (set) pamięta same klucze — idealny do sprawdzania „czy już było?”.',
    blocks: [
      listing('licznik = {}\nfor slowo in ["kot", "pies", "kot"]:\n    licznik[slowo] = licznik.get(slowo, 0) + 1\nprint(licznik)          # {\'kot\': 2, \'pies\': 1}\n\nwidziane = set()\nwidziane.add(5)\nprint(5 in widziane)    # True - sprawdzenie w czasie stałym'),
      p('`d.get(k, 0)` zwraca wartość dla klucza albo 0, gdy klucza nie ma — dzięki temu zliczanie nie wymaga osobnego `if`. Po słowniku przechodzi się `for k, v in d.items()`.'),
      tip('Sprawdzenie `x in lista` przegląda całą listę, a `x in zbior` działa natychmiast. Przy dużych danych z matury ta różnica decyduje, czy program skończy się w sekundę, czy w godzinę.'),
      warn('Odwołanie do nieistniejącego klucza `d["xyz"]` kończy program błędem `KeyError` — użyj `get` albo sprawdź `in`.'),
    ],
    examples: [
      example(
        'Które słowo występuje najczęściej w „ala ma kota a kot ma ale”?',
        ['Zliczasz słownikiem: „ma” — 2 razy, pozostałe po 1.', 'Wybierasz klucz z największą wartością.'],
        'ma',
      ),
      example(
        'Czy w liście `[3, 8, 1, 5]` są dwie liczby o sumie 9?',
        [['Idąc po liście, pytasz, czy `9 - x` było już widziane.', 'zbiór odpowiada od razu'], 'Przy 1 → szukasz 8, a 8 już było.'],
        'tak: 8 + 1',
      ),
    ],
    pitfalls: ['`KeyError` przy pierwszym wystąpieniu klucza.', 'Szukanie w liście zamiast w zbiorze przy dużych danych.', 'Zwracanie zbioru, gdy zadanie oczekuje listy.'],
  },
  {
    skillId: 'cs-files',
    minutes: 14,
    intro:
      'W części praktycznej matury dane są w pliku tekstowym: w każdym wierszu liczba, słowo albo kilka wartości oddzielonych spacjami. Pierwszy krok każdego zadania to poprawne wczytanie — potem to już zwykła lista.',
    blocks: [
      listing(
        'with open("liczby.txt") as plik:\n    for linia in plik:\n        a, b = linia.split()    # "12 7\\n" -> ["12", "7"]\n        a, b = int(a), int(b)\n        ...',
        'Na egzaminie: czytanie pliku wiersz po wierszu.',
      ),
      listing(
        'def ile_wiekszych(dane):\n    licznik = 0\n    for linia in dane.splitlines():\n        a, b = map(int, linia.split())\n        if a > b:\n            licznik += 1\n    return licznik',
        'W FORGE: ta sama logika, tylko zawartość pliku przychodzi jako napis `dane`.',
      ),
      p('`split()` bez argumentu dzieli po dowolnych białych znakach i sam usuwa znak końca wiersza. Wynik to lista NAPISÓW — liczby trzeba zamienić przez `int()` albo `float()`.'),
      tip('Odpowiedzi do zadań maturalnych zapisuje się do pliku `wyniki.txt`: `with open("wyniki.txt", "w") as f: print(wynik, file=f)`.'),
      warn('Porównanie `"10" > "9"` daje False — to porównanie napisów, znak po znaku. Zawsze zamieniaj liczby z pliku na int przed porównaniem.'),
    ],
    examples: [
      example(
        'Plik zawiera wiersze „3 4”, „10 2”, „7 7”. W ilu wierszach pierwsza liczba jest większa?',
        ['Dzielisz każdy wiersz i zamieniasz na int.', 'Tylko 10 > 2.'],
        '1',
      ),
      example(
        'Dlaczego `max(["9", "10", "8"])` daje "9"?',
        [['Porównywane są napisy, znak po znaku.', '„9” > „1”, więc „9” > „10”'], 'Po zamianie na liczby wynik to 10.'],
        'bo to napisy, nie liczby',
      ),
    ],
    pitfalls: ['Porównywanie liczb z pliku jako napisów.', 'Ręczne obcinanie „\\n” zamiast `split()` / `strip()`.', 'Pusta ostatnia linia pliku liczona jako dana.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const DATA_QUESTIONS: Question[] = [
  // cs-arrays -----------------------------------------------------------------
  numeric({
    id: 'dt-a-1',
    skill: 'cs-arrays',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 't = [3, -1, 4, -1, 5]\ns = 0\nfor x in t:\n    if x > 0:\n        s += x\nprint(s)',
    answer: 12,
    verify: () => 3 + 4 + 5,
    hints: ['Które elementy listy przechodzą warunek `x > 0`?', 'Tylko liczby dodatnie trafiają do sumy.', 'Dodatnie są 3, 4 i 5.', 'Zsumuj je.'],
    steps: ['Warunek przechodzą 3, 4 i 5.', 'Suma: 12.'],
    errors: [['10', 'Doliczone liczby ujemne.', 'Warunek `x > 0` pomija ujemne.']],
  }),
  choice({
    id: 'dt-a-2',
    skill: 'cs-arrays',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Lista to `t = [4, 8, 15, 16, 23, 42]`. Co zwraca `t[1:4]`?',
    choices: ['`[8, 15, 16]`', '`[4, 8, 15, 16]`', '`[8, 15, 16, 23]`', '`[4, 8, 15]`'],
    answer: 'A',
    hints: ['Od jakiego numeru zaczyna się indeksowanie listy?', 'Od zera: `t[0]` = 4, `t[1]` = 8.', 'Wycinek `t[a:b]` kończy się na indeksie b − 1.', 'Weź elementy o indeksach 1, 2, 3.'],
    steps: ['Indeksy 1, 2, 3 to 8, 15, 16.', 'Element o indeksie 4 nie wchodzi do wycinka.'],
    errors: [
      ['B', 'Indeksowanie od jedynki.', 'Pierwszy element ma indeks 0.'],
      ['C', 'Koniec wycinka potraktowany włącznie.', '`t[a:b]` nie zawiera `t[b]`.'],
      ['D', 'Indeksowanie od jedynki i koniec wyłącznie.', 'Pierwszy element ma indeks 0.'],
    ],
  }),
  pyTask({
    id: 'dt-a-3',
    skill: 'cs-arrays',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Napisz funkcję `wzrosty(t)`, która zwraca, ile razy w liście następny element jest większy od poprzedniego.',
    functionName: 'wzrosty',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'przykład', input: [[1, 3, 2, 5, 4]], expected: 2 },
      { name: 'rosnąca', input: [[1, 2, 3, 4]], expected: 3 },
      { name: 'jeden element', input: [[7]], expected: 0 },
      { name: 'pusta lista', input: [[]], expected: 0, hidden: true },
      { name: 'równe sąsiednie', input: [[5, 5, 5, 6]], expected: 1, hidden: true },
    ],
    model: `
      def wzrosty(t):
          licznik = 0
          for i in range(len(t) - 1):
              if t[i + 1] > t[i]:
                  licznik += 1
          return licznik
    `,
    hints: ['Które pary elementów trzeba porównać?', 'Sąsiednie: `t[i]` i `t[i + 1]`.', 'Indeks i idzie do `len(t) - 2` — pętla `range(len(t) - 1)`.', 'Dla pustej listy `range(-1)` jest puste — wynik 0.'],
    steps: ['Pętla po i od 0 do len(t) − 2 porównuje `t[i + 1] > t[i]`.', 'Licznik zwiększa się przy każdym wzroście.'],
  }),
  pyTask({
    id: 'dt-a-4',
    skill: 'cs-arrays',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `min_max(t)`, która w jednym przejściu po niepustej liście zwraca `[najmniejszy, największy]` — bez funkcji `min` i `max`.',
    functionName: 'min_max',
    params: ['t'],
    types: 'niepusta list[int] -> list[int]',
    tests: [
      { name: 'jeden element', input: [[5]], expected: [5, 5] },
      { name: 'mieszane', input: [[3, 1, 4, 1, 5, 9, 2, 6]], expected: [1, 9] },
      { name: 'ujemne', input: [[-2, -8, -1]], expected: [-8, -1] },
      { name: 'malejąca', input: [[9, 7, 5, 3]], expected: [3, 9], hidden: true },
      { name: 'same dodatnie duże', input: [[100, 250, 175]], expected: [100, 250], hidden: true },
    ],
    model: `
      def min_max(t):
          mn = mx = t[0]
          for x in t[1:]:
              if x < mn:
                  mn = x
              if x > mx:
                  mx = x
          return [mn, mx]
    `,
    hints: ['Od jakiej wartości zacząć minimum i maksimum?', 'Od pierwszego elementu listy, a nie od zera.', 'Dla każdego kolejnego x: jeśli mniejszy od mn — podmień mn; jeśli większy od mx — podmień mx.', 'Zwróć `[mn, mx]`.'],
    steps: ['mn i mx startują od `t[0]`.', 'Jedno przejście aktualizuje oba — tak brzmi wymaganie I+II.1d.'],
  }),
  pyTask({
    id: 'dt-a-5',
    skill: 'cs-arrays',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `drugie_najwieksze(t)`, która zwraca drugą co do wielkości RÓŻNĄ wartość w liście, a gdy takiej nie ma — `None`. Dla `[5, 9, 9, 7]` wynik to 7.',
    functionName: 'drugie_najwieksze',
    params: ['t'],
    types: 'list[int] -> int | None',
    tests: [
      { name: 'przykład', input: [[5, 9, 9, 7]], expected: 7 },
      { name: 'dwa elementy', input: [[1, 2]], expected: 1 },
      { name: 'same równe', input: [[4, 4, 4]], expected: null },
      { name: 'pusta', input: [[]], expected: null, hidden: true },
      { name: 'ujemne', input: [[-5, -1, -3]], expected: -3, hidden: true },
      { name: 'największe na końcu', input: [[3, 8, 2, 10]], expected: 8, hidden: true },
    ],
    model: `
      def drugie_najwieksze(t):
          pierwsze = drugie = None
          for x in t:
              if pierwsze is None or x > pierwsze:
                  drugie = pierwsze
                  pierwsze = x
              elif x != pierwsze and (drugie is None or x > drugie):
                  drugie = x
          return drugie
    `,
    hints: ['Ile wartości trzeba pamiętać podczas jednego przejścia?', 'Dwie: największą i drugą największą.', 'Gdy x jest nowym maksimum, dotychczasowe maksimum spada na drugie miejsce.', 'Wartość równą maksimum pomiń — liczą się różne wartości.'],
    steps: ['Pamiętasz `pierwsze` i `drugie`, oba zaczynają od None.', 'Nowe maksimum przesuwa stare na drugie miejsce; wartość różną od maksimum porównujesz z drugą.'],
  }),
  pyTask({
    id: 'dt-a-6',
    skill: 'cs-arrays',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `obroc(t, k)`, która zwraca NOWĄ listę przesuniętą cyklicznie o k pozycji w prawo: `obroc([1, 2, 3, 4], 1)` to `[4, 1, 2, 3]`. k może być większe niż długość listy.',
    functionName: 'obroc',
    params: ['t', 'k'],
    types: 'list[int], int ≥ 0 -> list[int]',
    tests: [
      { name: 'o jeden', input: [[1, 2, 3, 4], 1], expected: [4, 1, 2, 3] },
      { name: 'o zero', input: [[1, 2, 3], 0], expected: [1, 2, 3] },
      { name: 'o długość', input: [[1, 2, 3], 3], expected: [1, 2, 3] },
      { name: 'więcej niż długość', input: [[1, 2, 3, 4, 5], 7], expected: [4, 5, 1, 2, 3], hidden: true },
      { name: 'pusta', input: [[], 5], expected: [], hidden: true },
    ],
    model: `
      def obroc(t, k):
          if not t:
              return []
          k = k % len(t)
          return t[len(t) - k:] + t[:len(t) - k]
    `,
    hints: ['Co się dzieje, gdy k równa się długości listy?', 'Lista wraca do początkowego stanu — liczy się tylko k modulo długość.', 'Wynik to koniec listy (ostatnie k elementów) doklejony przed początek.', 'Uwaga na pustą listę: modulo zero to błąd.'],
    steps: ['Redukujesz k do `k % len(t)` (pusta lista osobno).', 'Sklejasz wycinki: ostatnie k elementów + pozostałe.'],
  }),
  pyTask({
    id: 'dt-a-7',
    skill: 'cs-arrays',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Punkt równowagi listy to indeks i, dla którego suma elementów przed nim równa się sumie elementów za nim. Napisz funkcję `rownowaga(t)`, która zwraca najmniejszy taki indeks albo -1. Rozwiązanie ma działać w jednym przejściu (bez liczenia sum od nowa dla każdego i).',
    functionName: 'rownowaga',
    params: ['t'],
    types: 'list[int] -> int',
    tests: [
      { name: 'środek', input: [[1, 2, 3, 2, 1]], expected: 2 },
      { name: 'brak', input: [[1, 2, 3]], expected: -1 },
      { name: 'jeden element', input: [[5]], expected: 0 },
      { name: 'na początku', input: [[0, 3, -3]], expected: 0, hidden: true },
      { name: 'z ujemnymi', input: [[-7, 1, 5, 2, -4, 3, 0]], expected: 3, hidden: true },
      { name: 'pusta', input: [[]], expected: -1, hidden: true },
    ],
    model: `
      def rownowaga(t):
          razem = sum(t)
          lewa = 0
          for i in range(len(t)):
              prawa = razem - lewa - t[i]
              if lewa == prawa:
                  return i
              lewa += t[i]
          return -1
    `,
    hints: ['Jak policzyć sumę elementów za indeksem i, znając sumę całej listy?', 'Suma prawa = całość − suma lewa − t[i].', 'Sumę lewą aktualizujesz, przechodząc dalej: `lewa += t[i]`.', 'Pierwszy indeks, dla którego lewa == prawa, od razu zwróć.'],
    steps: ['Liczysz sumę całej listy raz.', 'Idąc po indeksach, trzymasz sumę lewej części; prawą wyliczasz z różnicy.'],
  }),

  // cs-strings ----------------------------------------------------------------
  numeric({
    id: 'dt-s-1',
    skill: 'cs-strings',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 's = "informatyka"\nprint(len(s) + s.count("a"))',
    answer: 13,
    verify: () => 'informatyka'.length + 'informatyka'.split('a').length - 1,
    hints: ['Ile znaków ma słowo „informatyka”?', 'Policz litery po kolei.', 'Ile razy występuje w nim litera „a”?', 'Dodaj długość i liczbę wystąpień.'],
    steps: ['`len(s)` = 11, litera „a” występuje 2 razy.', 'Wynik: 13.'],
    errors: [['12', 'Policzone jedno „a”.', 'W „informatyka” litera a jest na pozycjach 6 i 10.']],
  }),
  choice({
    id: 'dt-s-2',
    skill: 'cs-strings',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Które porównanie napisów w Pythonie daje `True`?',
    choices: ['`"ala" < "alan"`', '`"b" < "abc"`', '`"ala" < "Zebra"`', '`"10" > "9"`'],
    answer: 'A',
    hints: ['Jak Python porównuje napisy?', 'Znak po znaku, jak w słowniku.', 'Gdy jeden napis jest początkiem drugiego, krótszy jest mniejszy.', 'Wielkie litery mają mniejsze kody niż małe; cyfry porównuje się jako znaki.'],
    steps: ['„ala” jest początkiem „alan”, więc jest mniejsze.', 'Pozostałe: „b” > „a”, „a” > „Z”, „1” < „9”.'],
    errors: [
      ['B', 'Porównano długości napisów.', 'Liczy się pierwszy różny znak: „b” > „a”.'],
      ['C', 'Pominięto, że wielkie litery mają mniejsze kody.', '`ord("Z")` = 90 < `ord("a")` = 97.'],
      ['D', 'Porównano liczby zamiast napisów.', 'Napisy porównuje się znak po znaku: „1” < „9”.'],
    ],
  }),
  pyTask({
    id: 'dt-s-3',
    skill: 'cs-strings',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `palindrom(s)`, która sprawdza, czy napis czyta się tak samo od przodu i od tyłu. Wielkość liter nie ma znaczenia.',
    functionName: 'palindrom',
    params: ['s'],
    types: 'str -> bool',
    tests: [
      { name: 'kajak', input: ['kajak'], expected: true },
      { name: 'nie palindrom', input: ['python'], expected: false },
      { name: 'wielka litera', input: ['Kajak'], expected: true },
      { name: 'pusty napis', input: [''], expected: true, hidden: true },
      { name: 'parzysta długość', input: ['abba'], expected: true, hidden: true },
      { name: 'prawie', input: ['abca'], expected: false, hidden: true },
    ],
    model: `
      def palindrom(s):
          s = s.lower()
          return s == s[::-1]
    `,
    hints: ['Jak odwrócić napis w Pythonie?', 'Wycinek z krokiem −1: `s[::-1]`.', 'Najpierw ujednolić wielkość liter: `s.lower()`.', 'Zwróć porównanie napisu z jego odwróceniem.'],
    steps: ['Zamieniasz napis na małe litery.', 'Porównujesz go z `s[::-1]`.'],
  }),
  pyTask({
    id: 'dt-s-4',
    skill: 'cs-strings',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `cezar(tekst, k)`, która szyfruje tekst szyfrem Cezara: każda mała litera a–z przesuwa się o k pozycji w alfabecie (z zawijaniem), pozostałe znaki zostają bez zmian. k może być większe od 26.',
    functionName: 'cezar',
    params: ['tekst', 'k'],
    types: 'str, int ≥ 0 -> str',
    tests: [
      { name: 'proste', input: ['abc', 1], expected: 'bcd' },
      { name: 'zawijanie', input: ['xyz', 3], expected: 'abc' },
      { name: 'ze spacją', input: ['ala ma kota', 2], expected: 'cnc oc mqvc' },
      { name: 'k większe od 26', input: ['abc', 27], expected: 'bcd', hidden: true },
      { name: 'przesunięcie zero', input: ['matura', 0], expected: 'matura', hidden: true },
      { name: 'cyfry bez zmian', input: ['a1z', 1], expected: 'b1a', hidden: true },
    ],
    model: `
      def cezar(tekst, k):
          wynik = ""
          for c in tekst:
              if "a" <= c <= "z":
                  c = chr((ord(c) - ord("a") + k) % 26 + ord("a"))
              wynik += c
          return wynik
    `,
    hints: ['Jak zamienić literę na jej numer w alfabecie?', '`ord(c) - ord("a")` daje liczbę od 0 do 25.', 'Po dodaniu k weź resztę z dzielenia przez 26 i zamień z powrotem przez `chr`.', 'Znaki spoza a–z przepisz bez zmian.'],
    steps: ['Numer litery: `ord(c) - ord("a")`; nowy numer: `(numer + k) % 26`.', 'Litera wynikowa: `chr(nowy + ord("a"))`; inne znaki bez zmian.'],
  }),
  pyTask({
    id: 'dt-s-5',
    skill: 'cs-strings',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `wystapienia(tekst, wzorzec)`, która metodą naiwną zwraca listę pozycji, na których zaczyna się wzorzec (wystąpienia mogą na siebie nachodzić). Nie używaj metody `find`.',
    functionName: 'wystapienia',
    params: ['tekst', 'wzorzec'],
    types: 'str, niepusty str -> list[int]',
    tests: [
      { name: 'nachodzące', input: ['abababa', 'aba'], expected: [0, 2, 4] },
      { name: 'brak', input: ['matura', 'xyz'], expected: [] },
      { name: 'na końcu', input: ['informatyka', 'ka'], expected: [9] },
      { name: 'wzorzec dłuższy', input: ['ab', 'abc'], expected: [], hidden: true },
      { name: 'cały tekst', input: ['kot', 'kot'], expected: [0], hidden: true },
      { name: 'powtórzona litera', input: ['aaaa', 'aa'], expected: [0, 1, 2], hidden: true },
    ],
    model: `
      def wystapienia(tekst, wzorzec):
          m = len(wzorzec)
          pozycje = []
          for i in range(len(tekst) - m + 1):
              if tekst[i:i + m] == wzorzec:
                  pozycje.append(i)
          return pozycje
    `,
    hints: ['Na ilu pozycjach wzorzec może się zaczynać?', 'Od 0 do `len(tekst) - len(wzorzec)` włącznie.', 'Na każdej pozycji porównaj wycinek `tekst[i:i + m]` ze wzorcem.', 'Pasujące pozycje dopisuj do listy.'],
    steps: ['Pozycji startowych jest `len(tekst) - m + 1`.', 'Wycinek długości m porównujesz ze wzorcem, pasujące i zapisujesz.'],
  }),
  pyTask({
    id: 'dt-s-6',
    skill: 'cs-strings',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Kompresja RLE zapisuje każdą serię jednakowych znaków jako znak i długość serii: „aaabcc” → „a3b1c2”. Napisz funkcję `rle(s)`.',
    functionName: 'rle',
    params: ['s'],
    types: 'str -> str',
    tests: [
      { name: 'przykład', input: ['aaabcc'], expected: 'a3b1c2' },
      { name: 'bez powtórzeń', input: ['abc'], expected: 'a1b1c1' },
      { name: 'jedna seria', input: ['zzzz'], expected: 'z4' },
      { name: 'pusty', input: [''], expected: '', hidden: true },
      { name: 'powrót tej samej litery', input: ['aabaa'], expected: 'a2b1a2', hidden: true },
      { name: 'długa seria', input: ['xxxxxxxxxxxxy'], expected: 'x12y1', hidden: true },
    ],
    model: `
      def rle(s):
          if s == "":
              return ""
          wynik = ""
          znak = s[0]
          ile = 1
          for c in s[1:]:
              if c == znak:
                  ile += 1
              else:
                  wynik += znak + str(ile)
                  znak = c
                  ile = 1
          return wynik + znak + str(ile)
    `,
    hints: ['Co trzeba pamiętać, przechodząc po napisie?', 'Bieżący znak serii i długość serii.', 'Gdy znak się zmienia, dopisz zakończoną serię i zacznij nową.', 'Nie zapomnij dopisać ostatniej serii po pętli.'],
    steps: ['Pamiętasz bieżący znak i licznik; zmiana znaku zamyka serię.', 'Po pętli dopisujesz ostatnią serię; pusty napis osobno.'],
  }),
  pyTask({
    id: 'dt-s-7',
    skill: 'cs-strings',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napis b jest obrotem napisu a, jeśli powstaje przez przeniesienie kilku początkowych znaków a na koniec (np. „tyka” i „katy”). Napisz funkcję `obrot(a, b)` — da się to zrobić jednym sprawdzeniem, bez pętli.',
    functionName: 'obrot',
    params: ['a', 'b'],
    types: 'str, str -> bool',
    tests: [
      { name: 'obrót', input: ['tyka', 'katy'], expected: true },
      { name: 'te same litery, nie obrót', input: ['abcd', 'acbd'], expected: false },
      { name: 'identyczne', input: ['kot', 'kot'], expected: true },
      { name: 'różne długości', input: ['ab', 'aba'], expected: false, hidden: true },
      { name: 'puste', input: ['', ''], expected: true, hidden: true },
      { name: 'podnapis, ale nie obrót', input: ['abab', 'ba'], expected: false, hidden: true },
    ],
    model: `
      def obrot(a, b):
          return len(a) == len(b) and b in a + a
    `,
    hints: ['Jak wyglądają wszystkie obroty napisu a obok siebie?', 'Każdy obrót a jest fragmentem napisu `a + a`.', 'Sprawdź, czy b występuje w `a + a`.', 'Dodatkowo długości muszą być równe — inaczej krótki fragment też by pasował.'],
    steps: ['Wszystkie obroty a są podnapisami `a + a`.', 'Warunek: równe długości i `b in a + a`.'],
  }),

  // cs-dicts ------------------------------------------------------------------
  numeric({
    id: 'dt-d-1',
    skill: 'cs-dicts',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'd = {"a": 1, "b": 2}\nd["a"] += 5\nd["c"] = 3\nprint(len(d) + d["a"])',
    answer: 9,
    verify: () => 3 + 6,
    hints: ['Co robi przypisanie do klucza, którego nie było?', 'Dodaje nową parę do słownika.', 'Ile kluczy jest po wszystkich zmianach i jaka jest wartość `d["a"]`?', 'Dodaj te dwie liczby.'],
    steps: ['Klucze: a, b, c — `len(d)` = 3; `d["a"]` = 6.', 'Wynik: 9.'],
    errors: [['8', 'Nie doliczono nowego klucza c.', 'Przypisanie do nowego klucza dodaje parę.']],
  }),
  choice({
    id: 'dt-d-2',
    skill: 'cs-dicts',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Program przetwarza milion liczb i dla każdej sprawdza, czy pojawiła się już wcześniej. W czym najlepiej przechowywać liczby już widziane?',
    choices: ['w zbiorze (set)', 'w liście', 'w napisie', 'w liście posortowanej po każdym dopisaniu'],
    answer: 'A',
    hints: ['Ile trwa sprawdzenie `x in lista`?', 'Lista jest przeglądana element po elemencie.', 'Zbiór odpowiada na pytanie „czy jest?” w czasie stałym.', 'Przy milionie sprawdzeń lista oznacza biliony porównań.'],
    steps: ['Sprawdzenie w zbiorze działa w czasie stałym.', 'Lista wymaga przeglądania — łącznie rzędu n² operacji.'],
    errors: [
      ['B', 'Pominięty koszt przeglądania listy.', '`x in lista` sprawdza elementy po kolei.'],
      ['C', 'Napis nie nadaje się do przechowywania liczb.', 'Szukanie w napisie też wymaga przeglądania.'],
      ['D', 'Sortowanie po każdym dopisaniu jest kosztowne.', 'Zbiór daje szybkie sprawdzenie bez sortowania.'],
    ],
  }),
  pyTask({
    id: 'dt-d-3',
    skill: 'cs-dicts',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Napisz funkcję `zlicz(slowa)`, która zwraca słownik: słowo → liczba jego wystąpień w liście.',
    functionName: 'zlicz',
    params: ['slowa'],
    types: 'list[str] -> dict[str, int]',
    tests: [
      { name: 'powtórzenia', input: [['kot', 'pies', 'kot']], expected: { kot: 2, pies: 1 } },
      { name: 'jedno słowo', input: [['matura']], expected: { matura: 1 } },
      { name: 'pusta lista', input: [[]], expected: {} },
      { name: 'wiele powtórzeń', input: [['a', 'b', 'a', 'c', 'a', 'b']], expected: { a: 3, b: 2, c: 1 }, hidden: true },
    ],
    model: `
      def zlicz(slowa):
          licznik = {}
          for s in slowa:
              licznik[s] = licznik.get(s, 0) + 1
          return licznik
    `,
    hints: ['Co trzeba zrobić przy pierwszym wystąpieniu słowa?', 'Ustawić jego licznik na 1 — klucza jeszcze nie ma.', '`d.get(s, 0)` zwraca 0 dla brakującego klucza.', 'Wystarczy `d[s] = d.get(s, 0) + 1`.'],
    steps: ['Pusty słownik na start.', 'Dla każdego słowa: `licznik[s] = licznik.get(s, 0) + 1`.'],
  }),
  pyTask({
    id: 'dt-d-4',
    skill: 'cs-dicts',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `pierwszy_powtorzony(t)`, która zwraca pierwszy element, który pojawia się w liście po raz drugi (licząc według momentu powtórzenia), albo `None`. Dla `[3, 1, 4, 1, 3]` wynik to 1.',
    functionName: 'pierwszy_powtorzony',
    params: ['t'],
    types: 'list[int] -> int | None',
    tests: [
      { name: 'przykład', input: [[3, 1, 4, 1, 3]], expected: 1 },
      { name: 'brak powtórzeń', input: [[1, 2, 3]], expected: null },
      { name: 'od razu', input: [[7, 7, 2, 2]], expected: 7 },
      { name: 'pusta', input: [[]], expected: null, hidden: true },
      { name: 'powtórzenie na końcu', input: [[5, 6, 7, 8, 5]], expected: 5, hidden: true },
    ],
    model: `
      def pierwszy_powtorzony(t):
          widziane = set()
          for x in t:
              if x in widziane:
                  return x
              widziane.add(x)
          return None
    `,
    hints: ['Co trzeba pamiętać, idąc po liście?', 'Wszystkie elementy już widziane.', 'Zbiór pozwala szybko sprawdzić `x in widziane`.', 'Pierwszy x, który już był w zbiorze, od razu zwróć.'],
    steps: ['Zbiór `widziane` zaczyna pusty.', 'Pierwszy element obecny już w zbiorze jest odpowiedzią; inaczej go dodajesz.'],
  }),
  pyTask({
    id: 'dt-d-5',
    skill: 'cs-dicts',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Napisz funkcję `najczestszy(t)`, która zwraca najczęściej występujący element niepustej listy liczb. Przy remisie zwróć najmniejszy z najczęstszych.',
    functionName: 'najczestszy',
    params: ['t'],
    types: 'niepusta list[int] -> int',
    tests: [
      { name: 'wyraźny zwycięzca', input: [[1, 3, 3, 2, 3]], expected: 3 },
      { name: 'remis', input: [[5, 2, 5, 2]], expected: 2 },
      { name: 'jeden element', input: [[9]], expected: 9 },
      { name: 'remis trzech', input: [[4, 1, 7]], expected: 1, hidden: true },
      { name: 'ujemne', input: [[-1, -1, 0, 0, -3]], expected: -1, hidden: true },
    ],
    model: `
      def najczestszy(t):
          licznik = {}
          for x in t:
              licznik[x] = licznik.get(x, 0) + 1
          najlepszy = None
          for x, ile in licznik.items():
              if najlepszy is None or ile > licznik[najlepszy] or (ile == licznik[najlepszy] and x < najlepszy):
                  najlepszy = x
          return najlepszy
    `,
    hints: ['Jak policzyć wystąpienia każdego elementu?', 'Słownik: element → licznik.', 'Potem przejdź po parach `items()` i zapamiętaj najlepszego kandydata.', 'Lepszy to: większy licznik, albo równy licznik i mniejsza wartość.'],
    steps: ['Zliczasz słownikiem.', 'Wybierasz element z największym licznikiem, przy remisie mniejszy.'],
  }),
  pyTask({
    id: 'dt-d-6',
    skill: 'cs-dicts',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `dwie_sumy(t, cel)`, która sprawdza, czy w liście są dwa elementy na RÓŻNYCH pozycjach o sumie równej cel. Rozwiązanie ma przejść listę jeden raz (bez pętli w pętli).',
    functionName: 'dwie_sumy',
    params: ['t', 'cel'],
    types: 'list[int], int -> bool',
    tests: [
      { name: 'jest para', input: [[3, 8, 1, 5], 9], expected: true },
      { name: 'brak pary', input: [[1, 2, 4], 10], expected: false },
      { name: 'ten sam element dwa razy nie liczy się', input: [[5, 1], 10], expected: false },
      { name: 'dwie piątki', input: [[5, 1, 5], 10], expected: true, hidden: true },
      { name: 'ujemne', input: [[-3, 7, 2], 4], expected: true, hidden: true },
      { name: 'pusta', input: [[], 0], expected: false, hidden: true },
    ],
    model: `
      def dwie_sumy(t, cel):
          widziane = set()
          for x in t:
              if cel - x in widziane:
                  return True
              widziane.add(x)
          return False
    `,
    hints: ['Jakiej liczby szukasz, gdy stoisz na elemencie x?', 'Dopełnienia: `cel - x`.', 'Czy dopełnienie było wcześniej? Sprawdź w zbiorze widzianych.', 'Dodaj x do zbioru dopiero po sprawdzeniu — wtedy element nie sparuje się sam ze sobą.'],
    steps: ['Dla każdego x sprawdzasz, czy `cel - x` jest w zbiorze wcześniejszych elementów.', 'Dopiero potem dodajesz x — para zawsze pochodzi z dwóch pozycji.'],
  }),
  pyTask({
    id: 'dt-d-7',
    skill: 'cs-dicts',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `bez_powtorzen(s)`, która zwraca długość najdłuższego spójnego fragmentu napisu bez powtarzających się znaków. Dla „abcabcbb” to 3 („abc”). Wskazówka: słownik z ostatnią pozycją każdego znaku i przesuwany początek okna.',
    functionName: 'bez_powtorzen',
    params: ['s'],
    types: 'str -> int',
    tests: [
      { name: 'przykład', input: ['abcabcbb'], expected: 3 },
      { name: 'jedna litera', input: ['bbbb'], expected: 1 },
      { name: 'pusty', input: [''], expected: 0 },
      { name: 'w środku', input: ['pwwkew'], expected: 3, hidden: true },
      { name: 'cały napis', input: ['matury'], expected: 6, hidden: true },
      { name: 'powrót starego znaku', input: ['abba'], expected: 2, hidden: true },
    ],
    model: `
      def bez_powtorzen(s):
          ostatnio = {}
          poczatek = 0
          najlepszy = 0
          for i, c in enumerate(s):
              if c in ostatnio and ostatnio[c] >= poczatek:
                  poczatek = ostatnio[c] + 1
              ostatnio[c] = i
              najlepszy = max(najlepszy, i - poczatek + 1)
          return najlepszy
    `,
    hints: ['Co zrobić, gdy znak c pojawia się drugi raz w bieżącym fragmencie?', 'Początek fragmentu przesuwa się tuż za poprzednie wystąpienie c.', 'Słownik pamięta ostatnią pozycję każdego znaku; liczy się tylko, jeśli jest ≥ początku okna.', 'Po każdym znaku aktualizuj najlepszą długość `i - poczatek + 1`.'],
    steps: ['Okno [początek, i] nie zawiera powtórzeń; słownik trzyma ostatnie pozycje znaków.', 'Powtórzenie wewnątrz okna przesuwa początek za poprzednie wystąpienie; długość okna aktualizuje wynik.'],
  }),

  // cs-files ------------------------------------------------------------------
  numeric({
    id: 'dt-f-1',
    skill: 'cs-files',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Zawartość pliku to trzy wiersze: „3 4”, „10 2”, „7 7”. Co wypisze program?',
    listing: 'dane = "3 4\\n10 2\\n7 7\\n"\nlicznik = 0\nfor linia in dane.splitlines():\n    a, b = map(int, linia.split())\n    if a >= b:\n        licznik += 1\nprint(licznik)',
    answer: 2,
    verify: () => [[3, 4], [10, 2], [7, 7]].filter(([a, b]) => a! >= b!).length,
    hints: ['Na jakie części dzieli się każdy wiersz?', 'Na dwie liczby, zamienione na int.', 'Warunek to `a >= b` — liczy się też równość.', 'Sprawdź każdy z trzech wierszy.'],
    steps: ['Wiersze: 3 ≥ 4 nie, 10 ≥ 2 tak, 7 ≥ 7 tak.', 'Licznik: 2.'],
    errors: [['1', 'Pominięta równość.', 'Warunek `>=` obejmuje też 7 = 7.']],
  }),
  choice({
    id: 'dt-f-2',
    skill: 'cs-files',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Co zwraca wyrażenie `"12 7 5\\n".split()`?',
    choices: ['`[\'12\', \'7\', \'5\']`', '`[12, 7, 5]`', '`[\'12 7 5\']`', '`[\'12\', \'7\', \'5\\n\']`'],
    answer: 'A',
    hints: ['Jakiego typu są elementy wyniku `split`?', 'To zawsze napisy — `split` nie zamienia na liczby.', 'Bez argumentu `split` dzieli po spacjach i znakach końca wiersza.', 'Znak „\\n” znika razem z odstępami.'],
    steps: ['`split()` dzieli po białych znakach i pomija znak końca wiersza.', 'Elementy to napisy — do liczb potrzebny `int`.'],
    errors: [
      ['B', 'Uznano, że split zamienia na liczby.', 'Wynik split to lista napisów.'],
      ['C', 'Pominięty podział po spacjach.', 'split() bez argumentu dzieli po białych znakach.'],
      ['D', 'Uznano, że znak końca wiersza zostaje.', 'split() bez argumentu usuwa też „\\n”.'],
    ],
  }),
  pyTask({
    id: 'dt-f-3',
    skill: 'cs-files',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'W każdym wierszu pliku jest jedna liczba całkowita. Napisz funkcję `suma_z_pliku(dane)`, która dostaje zawartość pliku jako napis i zwraca sumę liczb.',
    functionName: 'suma_z_pliku',
    params: ['dane'],
    types: 'str (zawartość pliku) -> int',
    tests: [
      { name: 'trzy liczby', input: ['5\n10\n-3\n'], expected: 12 },
      { name: 'bez końcowego entera', input: ['1\n2'], expected: 3 },
      { name: 'jedna liczba', input: ['42\n'], expected: 42 },
      { name: 'pusty plik', input: [''], expected: 0, hidden: true },
      { name: 'duże liczby', input: ['1000000\n2000000\n3000000\n'], expected: 6000000, hidden: true },
    ],
    model: `
      def suma_z_pliku(dane):
          suma = 0
          for linia in dane.splitlines():
              if linia.strip():
                  suma += int(linia)
          return suma
    `,
    hints: ['Jak podzielić zawartość pliku na wiersze?', '`dane.splitlines()` daje listę wierszy.', 'Każdy wiersz zamień na liczbę przez `int` i dodaj do sumy.', 'Pusty wiersz pomiń — `int("")` to błąd.'],
    steps: ['`splitlines()` dzieli napis na wiersze.', 'Niepuste wiersze zamieniasz na int i sumujesz.'],
  }),
  pyTask({
    id: 'dt-f-4',
    skill: 'cs-files',
    kind: 'typical',
    difficulty: 3,
    prompt: 'W każdym wierszu pliku są dwie liczby całkowite oddzielone spacją. Napisz funkcję `obie_parzyste(dane)`, która zwraca liczbę wierszy, w których obie liczby są parzyste.',
    functionName: 'obie_parzyste',
    params: ['dane'],
    types: 'str (zawartość pliku) -> int',
    tests: [
      { name: 'przykład', input: ['2 4\n3 8\n10 0\n'], expected: 2 },
      { name: 'żadna', input: ['1 1\n3 5\n'], expected: 0 },
      { name: 'ujemne', input: ['-2 -6\n'], expected: 1 },
      { name: 'wielocyfrowe', input: ['12 7\n100 200\n98 64\n'], expected: 2, hidden: true },
      { name: 'pusty plik', input: [''], expected: 0, hidden: true },
    ],
    model: `
      def obie_parzyste(dane):
          licznik = 0
          for linia in dane.splitlines():
              a, b = map(int, linia.split())
              if a % 2 == 0 and b % 2 == 0:
                  licznik += 1
          return licznik
    `,
    hints: ['Jak wyciągnąć dwie liczby z wiersza?', '`a, b = map(int, linia.split())`.', 'Parzystość: `a % 2 == 0`.', 'Oba warunki łączysz przez `and`.'],
    steps: ['Każdy wiersz dzielisz i zamieniasz na dwie liczby.', 'Liczysz wiersze, w których obie dają resztę 0 z dzielenia przez 2.'],
  }),
  pyTask({
    id: 'dt-f-5',
    skill: 'cs-files',
    kind: 'typical',
    difficulty: 3,
    prompt: 'W każdym wierszu pliku jest jedno słowo. Napisz funkcję `najdluzsze(dane)`, która zwraca najdłuższe słowo, a przy remisie — to, które wystąpiło pierwsze.',
    functionName: 'najdluzsze',
    params: ['dane'],
    types: 'str (zawartość pliku) -> str',
    tests: [
      { name: 'przykład', input: ['kot\nhipopotam\nzebra\n'], expected: 'hipopotam' },
      { name: 'remis', input: ['abc\nxyz\nab\n'], expected: 'abc' },
      { name: 'jedno słowo', input: ['matura\n'], expected: 'matura' },
      { name: 'najdłuższe na końcu', input: ['a\nbb\nccc\n'], expected: 'ccc', hidden: true },
      { name: 'spacje na końcu wiersza', input: ['ala  \nmarta\n'], expected: 'marta', hidden: true },
    ],
    model: `
      def najdluzsze(dane):
          najlepsze = ""
          for linia in dane.splitlines():
              slowo = linia.strip()
              if len(slowo) > len(najlepsze):
                  najlepsze = slowo
          return najlepsze
    `,
    hints: ['Co porównujesz między słowami?', 'Długości: `len(slowo)`.', 'Podmieniaj kandydata tylko przy ściśle większej długości — wtedy remis zostawia pierwsze słowo.', 'Użyj `strip()`, żeby spacje na końcu wiersza nie zawyżały długości.'],
    steps: ['Każdy wiersz oczyszczasz przez `strip()`.', 'Kandydata podmieniasz tylko na dłuższe słowo — przy remisie zostaje pierwsze.'],
  }),
  pyTask({
    id: 'dt-f-6',
    skill: 'cs-files',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Każdy wiersz pliku ma postać „Nazwisko p1 p2 p3” (punkty z trzech zadań). Napisz funkcję `zwyciezca(dane)`, która zwraca nazwisko osoby z największą sumą punktów; przy remisie — pierwszą w pliku.',
    functionName: 'zwyciezca',
    params: ['dane'],
    types: 'str (zawartość pliku) -> str',
    tests: [
      { name: 'przykład', input: ['Nowak 10 5 7\nKowalska 8 9 9\nWiśniewski 1 2 3\n'], expected: 'Kowalska' },
      { name: 'remis', input: ['Adamczyk 5 5 5\nBąk 6 4 5\n'], expected: 'Adamczyk' },
      { name: 'jedna osoba', input: ['Zając 0 0 0\n'], expected: 'Zając' },
      { name: 'zwycięzca na końcu', input: ['A 1 1 1\nB 2 2 2\nC 3 3 3\n'], expected: 'C', hidden: true },
      { name: 'duże liczby', input: ['Lis 100 0 0\nWilk 34 33 32\n'], expected: 'Lis', hidden: true },
    ],
    model: `
      def zwyciezca(dane):
          najlepszy = None
          najwiecej = -1
          for linia in dane.splitlines():
              czesci = linia.split()
              suma = sum(int(x) for x in czesci[1:])
              if suma > najwiecej:
                  najwiecej = suma
                  najlepszy = czesci[0]
          return najlepszy
    `,
    hints: ['Jak rozdzielić nazwisko od punktów?', 'Po `split()` nazwisko to `czesci[0]`, punkty to `czesci[1:]`.', 'Punkty zamień na int i zsumuj.', 'Zapamiętuj osobę tylko przy ściśle większej sumie.'],
    steps: ['Wiersz dzielisz na nazwisko i trzy liczby; sumujesz punkty.', 'Najlepszego podmieniasz tylko przy większej sumie — remis zostawia pierwszego.'],
  }),
  pyTask({
    id: 'dt-f-7',
    skill: 'cs-files',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Każdy wiersz pliku ma postać „RRRR-MM-DD opad” (opad w mm, liczba z kropką). Napisz funkcję `najmokrzejszy(dane)`, która zwraca numer miesiąca (napis „MM”) z największą łączną sumą opadów; przy remisie — wcześniejszy miesiąc.',
    functionName: 'najmokrzejszy',
    params: ['dane'],
    types: 'str (zawartość pliku) -> str',
    tests: [
      { name: 'przykład', input: ['2024-03-01 2.5\n2024-03-15 4.0\n2024-04-02 5.5\n'], expected: '03' },
      { name: 'jeden dzień', input: ['2024-11-30 0.1\n'], expected: '11' },
      { name: 'remis', input: ['2024-05-01 3.0\n2024-02-01 3.0\n'], expected: '02' },
      { name: 'wiele dni', input: ['2024-01-01 1.0\n2024-02-01 0.5\n2024-02-02 0.6\n2024-01-03 0.05\n'], expected: '02', hidden: true },
      { name: 'grudzień', input: ['2023-12-24 10\n2024-06-01 9.9\n'], expected: '12', hidden: true },
    ],
    model: `
      def najmokrzejszy(dane):
          sumy = {}
          for linia in dane.splitlines():
              data, opad = linia.split()
              miesiac = data[5:7]
              sumy[miesiac] = sumy.get(miesiac, 0) + float(opad)
          najlepszy = None
          for m in sorted(sumy):
              if najlepszy is None or sumy[m] > sumy[najlepszy]:
                  najlepszy = m
          return najlepszy
    `,
    hints: ['Gdzie w dacie „RRRR-MM-DD” jest numer miesiąca?', 'Znaki o indeksach 5 i 6: `data[5:7]`.', 'Sumuj opady w słowniku: miesiąc → suma (`float`, bo opad ma kropkę).', 'Przeglądaj miesiące w kolejności `sorted` i podmieniaj tylko przy ściśle większej sumie.'],
    steps: ['Słownik sumuje opady po miesiącach wyciętych z daty.', 'Przeglądając miesiące rosnąco, wybierasz największą sumę — remis zostawia wcześniejszy.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const DATA_CARDS: Flashcard[] = [
  card('c-dt-a-1', 'cs-arrays', 'definicja', 'Co zawiera wycinek `t[a:b]`?', 'Elementy o indeksach od a do b − 1.'),
  card('c-dt-a-2', 'cs-arrays', 'pulapka', 'Od czego zacząć szukanie minimum?', 'Od pierwszego elementu listy — nie od 0.'),

  card('c-dt-s-1', 'cs-strings', 'wzor', 'Szyfr Cezara dla małej litery c?', '`chr((ord(c) - ord("a") + k) % 26 + ord("a"))`'),
  card('c-dt-s-2', 'cs-strings', 'metoda', 'Jak odwrócić napis s?', '`s[::-1]`'),

  card('c-dt-d-1', 'cs-dicts', 'metoda', 'Zliczanie słownikiem w jednej linii?', '`d[x] = d.get(x, 0) + 1`'),
  card('c-dt-d-2', 'cs-dicts', 'pulapka', '`x in lista` czy `x in zbior`?', 'Zbiór — sprawdza w czasie stałym, lista przegląda wszystko.'),

  card('c-dt-f-1', 'cs-files', 'metoda', 'Jak wczytać dwie liczby z wiersza?', '`a, b = map(int, linia.split())`'),
  card('c-dt-f-2', 'cs-files', 'pulapka', 'Dlaczego `"10" > "9"` daje False?', 'Napisy porównuje się znak po znaku — zamień na int.'),
];

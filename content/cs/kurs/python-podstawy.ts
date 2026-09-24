import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 1: Python od podstaw.
 *
 * Matura z informatyki pozwala pisać w Pythonie, C++ lub Javie - kurs uczy
 * Pythona, bo najszybciej prowadzi od pomysłu do działającego programu.
 * Zakres: podstawa programowa 2024, dział II.1 (instrukcje, wyrażenia,
 * warunki, pętle, funkcje) i I.3 (sprawdzanie poprawności na danych).
 */

export const PY_TOPIC: Topic = {
  id: 'cs-python',
  subjectId: 'cs',
  name: 'Python od podstaw',
  summary: 'Zmienne i typy, działania, warunki, pętle for i while, funkcje — fundament wszystkich zadań programistycznych.',
};

export const PY_SKILLS: Skill[] = [
  {
    id: 'cs-py-basics',
    topicId: 'cs-python',
    name: 'Zmienne, typy i działania',
    level: 'PR',
    ckeRequirement: 'Programowanie — wyrażenia arytmetyczne, typy danych, dzielenie całkowite i reszta (II.1)',
    prerequisites: [],
    examValue: 0.6,
  },
  {
    id: 'cs-py-conditions',
    topicId: 'cs-python',
    name: 'Warunki i wyrażenia logiczne',
    level: 'PR',
    ckeRequirement: 'Programowanie — instrukcje warunkowe, wyrażenia logiczne (II.1)',
    prerequisites: ['cs-py-basics'],
    examValue: 0.6,
  },
  {
    id: 'cs-py-loops',
    topicId: 'cs-python',
    name: 'Pętle for i while',
    level: 'PR',
    ckeRequirement: 'Programowanie — instrukcje iteracyjne (II.1)',
    prerequisites: ['cs-py-conditions'],
    examValue: 0.7,
  },
  {
    id: 'cs-py-functions',
    topicId: 'cs-python',
    name: 'Funkcje: parametry i wynik',
    level: 'PR',
    ckeRequirement: 'Programowanie — funkcje z parametrami, testowanie dla różnych danych (II.1, I.3)',
    prerequisites: ['cs-py-loops'],
    examValue: 0.7,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const PY_LESSONS: Lesson[] = [
  {
    skillId: 'cs-py-basics',
    minutes: 12,
    intro:
      'Program to przepis, który komputer wykonuje linijka po linijce. Zaczynamy od najprostszych składników: zmiennych, które przechowują wartości, i działań, które z nich liczą nowe.',
    blocks: [
      listing(
        'wiek = 18            # int - liczba całkowita\nsrednia = 4.75       # float - liczba z przecinkiem\nimie = "Ola"         # str - napis\npelnoletni = True    # bool - prawda albo fałsz\n\nprint(imie, wiek)    # wypisze: Ola 18',
        'Zmienna dostaje wartość przez „=”. Typ wynika z wartości.',
      ),
      p('Na maturze najczęściej przydają się trzy działania na liczbach całkowitych: `//` (dzielenie całkowite), `%` (reszta z dzielenia) i `**` (potęgowanie). Zwykłe `/` zawsze daje liczbę typu float, nawet gdy dzieli się bez reszty.'),
      listing('print(17 // 5)   # 3  - ile razy 5 mieści się w 17\nprint(17 % 5)    # 2  - co zostaje\nprint(17 / 5)    # 3.4\nprint(2 ** 10)   # 1024\nprint(10 / 2)    # 5.0 - float, choć wynik jest całkowity'),
      tip('`n % 10` to ostatnia cyfra liczby, a `n // 10` to liczba bez ostatniej cyfry. Na tych dwóch działaniach opiera się połowa zadań z cyframi.'),
      warn('Kolejność działań: najpierw `**`, potem `*`, `/`, `//`, `%` (od lewej), na końcu `+` i `-`. Gdy nie masz pewności — dopisz nawiasy.'),
    ],
    examples: [
      example(
        'Ile to godzin, minut i sekund: 3725 sekund?',
        [
          ['`3725 // 3600` = 1 godzina, zostaje `3725 % 3600` = 125 s.', 'godzina ma 3600 sekund'],
          '`125 // 60` = 2 minuty, zostaje `125 % 60` = 5 s.',
        ],
        '1 h 2 min 5 s',
      ),
      example(
        'Co wypisze `print(7 // 2 + 7 % 2)`?',
        ['`7 // 2` = 3, `7 % 2` = 1.', 'Suma: 4.'],
        '4',
      ),
    ],
    pitfalls: ['Zwykłe `/` zamiast `//` — wynik typu float zamiast liczby całkowitej.', 'Zła kolejność działań przy `**` i `%`.', 'Pomylenie `=` (przypisanie) z `==` (porównanie).'],
  },
  {
    skillId: 'cs-py-conditions',
    minutes: 12,
    intro:
      'Instrukcja warunkowa pozwala programowi wybrać drogę: jeśli warunek jest prawdziwy, rób jedno, w przeciwnym razie — drugie. W Pythonie bloki wyznacza wcięcie, a nie nawiasy.',
    blocks: [
      listing(
        'def ocena_procentowa(p):\n    if p >= 90:\n        return "bardzo dobrze"\n    elif p >= 50:\n        return "zdane"\n    else:\n        return "niezdane"',
        'elif sprawdza się tylko wtedy, gdy wcześniejsze warunki były fałszywe.',
      ),
      p('Warunki łączymy słowami `and` (oba prawdziwe), `or` (co najmniej jeden) i `not` (zaprzeczenie). Porównania to `==`, `!=`, `<`, `<=`, `>`, `>=` — a w Pythonie można je łączyć: `0 <= x < 10`.'),
      tip('Rok przestępny: podzielny przez 4 i niepodzielny przez 100, ALBO podzielny przez 400. Po polsku to jedno zdanie, w Pythonie — jedno wyrażenie z `and` i `or`.'),
      warn('Kolejność gałęzi ma znaczenie: warunek szczegółowy (podzielne przez 15) musi stać PRZED ogólnym (podzielne przez 3), inaczej nigdy się nie wykona.'),
    ],
    examples: [
      example(
        'Czy 1900 był rokiem przestępnym?',
        ['1900 dzieli się przez 4 i przez 100, więc pierwsza część warunku jest fałszywa.', 'Nie dzieli się przez 400 — druga część też fałszywa.'],
        'nie',
      ),
      example(
        'Kiedy boki a, b, c tworzą trójkąt?',
        [['Każdy bok musi być krótszy od sumy dwóch pozostałych.', 'nierówność trójkąta'], 'W Pythonie: `a < b + c and b < a + c and c < a + b`.'],
        'gdy spełniona jest nierówność trójkąta',
      ),
    ],
    pitfalls: ['`if x = 5:` zamiast `if x == 5:`.', 'Ogólny warunek przed szczegółowym w łańcuchu elif.', 'Zły poziom wcięcia — instrukcja poza blokiem if.'],
  },
  {
    skillId: 'cs-py-loops',
    minutes: 14,
    intro:
      'Pętla powtarza fragment kodu. `for` przechodzi po kolejnych elementach (liczbach, znakach, elementach listy), a `while` powtarza, dopóki warunek jest prawdziwy — gdy nie wiesz z góry, ile razy.',
    blocks: [
      listing('for i in range(1, 6):   # 1, 2, 3, 4, 5 - bez szóstki!\n    print(i)\n\nn = 1234\nsuma = 0\nwhile n > 0:\n    suma += n % 10    # dodaj ostatnią cyfrę\n    n //= 10          # obetnij ostatnią cyfrę\nprint(suma)           # 10'),
      p('`range(a, b)` daje liczby od `a` do `b - 1`. `range(n)` to 0, 1, …, n − 1. Trzeci argument to krok: `range(10, 0, -2)` daje 10, 8, 6, 4, 2.'),
      tip('Wzorzec „akumulatora”: przed pętlą ustaw wynik na wartość neutralną (0 dla sumy, 1 dla iloczynu), w pętli go aktualizuj, po pętli zwróć.'),
      warn('Pętla `while` musi zmieniać coś w warunku, inaczej nie skończy się nigdy. W aplikacji taki program zostanie przerwany po kilku sekundach.'),
    ],
    examples: [
      example(
        'Co wypisze: `s = 0; for i in range(1, 5): s += i; print(s)`?',
        ['`range(1, 5)` to 1, 2, 3, 4.', 'Suma: 1 + 2 + 3 + 4 = 10.'],
        '10',
      ),
      example(
        'Po ilu latach lokata na 10% rocznie podwoi kapitał?',
        ['Pętla `while k < 2 * k0:` mnoży kapitał przez 1,1 i liczy lata.', 'Po 7 latach: 1,95 kapitału, po 8: 2,14 — pętla kończy się na 8.'],
        '8 lat',
      ),
    ],
    pitfalls: ['`range(1, n)` bez n — o jeden obrót za mało.', 'Brak zmiany zmiennej w warunku while — pętla bez końca.', 'Akumulator ustawiony wewnątrz pętli zamiast przed nią.'],
  },
  {
    skillId: 'cs-py-functions',
    minutes: 12,
    intro:
      'Funkcja to nazwany kawałek programu: dostaje dane (parametry), liczy i ODDAJE wynik przez `return`. Każde zadanie programistyczne w FORGE to napisanie funkcji — tak samo łatwo potem ją sprawdzić na wielu danych.',
    blocks: [
      listing('def pole_kola(r):\n    return 3.14159 * r ** 2\n\nwynik = pole_kola(2)\nprint(round(wynik, 2))   # 12.57'),
      p('`return` kończy funkcję i przekazuje wartość do miejsca wywołania. Funkcja bez `return` zwraca `None` — to najczęstszy powód, dla którego „kod działa, a test nie przechodzi”: wynik był wypisany przez `print`, ale nie zwrócony.'),
      tip('Z biblioteki `math` weźmiesz `sqrt`, `floor`, `ceil`, `gcd`: na początku pliku `import math`, potem `math.sqrt(2)`.'),
      warn('`print` pokazuje wartość człowiekowi, `return` oddaje ją programowi. W zadaniach z testami liczy się `return`.'),
    ],
    examples: [
      example(
        'Co wypisze program: `def f(x): return 2 * x + 1` i `print(f(f(3)))`?',
        ['Najpierw wewnętrzne wywołanie: `f(3)` = 7.', 'Potem `f(7)` = 15.'],
        '15',
      ),
      example(
        'Jak sprawdzić, czy liczba jest doskonała (równa sumie dzielników mniejszych od siebie)?',
        ['Funkcja pomocnicza liczy sumę dzielników: pętla od 1 do n − 1 i `if n % d == 0`.', 'Funkcja główna zwraca `suma_dzielnikow(n) == n`.'],
        '6 i 28 są doskonałe',
      ),
    ],
    pitfalls: ['`print` zamiast `return` — funkcja zwraca None.', 'Wywołanie funkcji bez nawiasów (`f` zamiast `f(3)`).', 'Użycie zmiennej spoza funkcji zamiast parametru.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const PY_QUESTIONS: Question[] = [
  // cs-py-basics --------------------------------------------------------------
  numeric({
    id: 'py-b-1',
    skill: 'cs-py-basics',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'a = 7\nb = 2\nprint(a // b + a % b)',
    answer: 4,
    verify: () => Math.floor(7 / 2) + (7 % 2),
    hints: ['Co robią operatory `//` i `%`?', '`//` to dzielenie całkowite, `%` — reszta z dzielenia.', 'Policz osobno `7 // 2` i `7 % 2`.', 'Dodaj oba wyniki.'],
    steps: ['`7 // 2` = 3, `7 % 2` = 1.', 'Suma: 4.'],
    errors: [['3.5', 'Użyte zwykłe dzielenie.', '`//` daje część całkowitą ilorazu.']],
  }),
  choice({
    id: 'py-b-2',
    skill: 'cs-py-basics',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Jaki typ ma wynik wyrażenia `10 / 2`?',
    choices: ['float', 'int', 'str', 'bool'],
    answer: 'A',
    hints: ['Czym różni się `/` od `//`?', '`/` zawsze daje liczbę zmiennoprzecinkową.', 'Wynik to 5.0, a nie 5.', 'Liczba z częścią ułamkową to float.'],
    steps: ['`10 / 2` = 5.0.', 'Typ: float.'],
    errors: [
      ['B', 'Uznano, że dzielenie bez reszty daje int.', 'W Pythonie `/` zawsze zwraca float; int daje `//`.'],
      ['C', 'Pomylony typ liczbowy z napisem.', 'Wynik działania na liczbach jest liczbą.'],
      ['D', 'Pomylone działanie z porównaniem.', 'bool daje porównanie, np. `10 == 2`.'],
    ],
  }),
  pyTask({
    id: 'py-b-3',
    skill: 'cs-py-basics',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Napisz funkcję `czas(s)`, która zamienia liczbę sekund na listę `[godziny, minuty, sekundy]`. Na przykład 3725 sekund to `[1, 2, 5]`.',
    functionName: 'czas',
    params: ['s'],
    types: 'int -> list[int]',
    tests: [
      { name: 'zero', input: [0], expected: [0, 0, 0] },
      { name: 'same sekundy', input: [59], expected: [0, 0, 59] },
      { name: 'pełna godzina', input: [3600], expected: [1, 0, 0] },
      { name: 'przykład z treści', input: [3725], expected: [1, 2, 5] },
      { name: 'koniec doby', input: [86399], expected: [23, 59, 59], hidden: true },
      { name: 'minuta i sekunda', input: [61], expected: [0, 1, 1], hidden: true },
    ],
    model: `
      def czas(s):
          godziny = s // 3600
          reszta = s % 3600
          return [godziny, reszta // 60, reszta % 60]
    `,
    hints: ['Ile sekund ma godzina, a ile minuta?', 'Godziny: `s // 3600`. Co zostaje po odjęciu pełnych godzin?', 'Resztę `s % 3600` podziel tak samo na minuty i sekundy.', 'Zwróć listę trzech liczb: `return [g, m, sek]`.'],
    steps: ['Godziny to `s // 3600`, a pozostałe sekundy to `s % 3600`.', 'Z pozostałych: minuty `// 60`, sekundy `% 60`.'],
  }),
  numeric({
    id: 'py-b-4',
    skill: 'cs-py-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Co wypisze ten program?',
    listing: 'x = 10\nx += 3\nx *= 2\nx -= 6\nprint(x // 4)',
    answer: 5,
    verify: () => Math.floor(((10 + 3) * 2 - 6) / 4),
    hints: ['Co oznacza zapis `x += 3`?', 'To skrót od `x = x + 3`.', 'Śledź wartość x po każdej linii: 10, 13, …', 'Na końcu dzielenie całkowite przez 4.'],
    steps: ['x: 10 → 13 → 26 → 20.', '`20 // 4` = 5.'],
    errors: [['20', 'Wypisana wartość x zamiast `x // 4`.', 'Ostatnia linia wypisuje wynik dzielenia.']],
  }),
  pyTask({
    id: 'py-b-5',
    skill: 'cs-py-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `srednia(a, b, c)`, która zwraca średnią arytmetyczną trzech liczb zaokrągloną do dwóch miejsc po przecinku (funkcja `round`).',
    functionName: 'srednia',
    params: ['a', 'b', 'c'],
    types: 'trzy liczby -> float',
    tests: [
      { name: 'równe liczby', input: [2, 2, 2], expected: 2 },
      { name: 'wynik z ułamkiem', input: [1, 2, 2], expected: 1.67 },
      { name: 'ujemne', input: [-3, 0, 3], expected: 0 },
      { name: 'duże liczby', input: [100, 200, 301], expected: 200.33, hidden: true },
      { name: 'ułamki na wejściu', input: [2.5, 3.5, 4], expected: 3.33, hidden: true },
    ],
    model: `
      def srednia(a, b, c):
          return round((a + b + c) / 3, 2)
    `,
    hints: ['Jak liczy się średnią arytmetyczną?', 'Suma podzielona przez liczbę składników.', '`round(liczba, 2)` zaokrągla do dwóch miejsc.', 'Uważaj na nawiasy: najpierw suma, potem dzielenie.'],
    steps: ['Suma trzech liczb podzielona przez 3.', 'Wynik przez `round(..., 2)`.'],
  }),
  pyTask({
    id: 'py-b-6',
    skill: 'cs-py-basics',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Samochód spala `spalanie` litrów paliwa na 100 km, a litr kosztuje `cena` zł. Napisz funkcję `koszt(km, spalanie, cena)`, która zwraca koszt paliwa na trasę zaokrąglony do groszy.',
    functionName: 'koszt',
    params: ['km', 'spalanie', 'cena'],
    types: 'trzy liczby -> float',
    tests: [
      { name: 'sto kilometrów', input: [100, 6, 6.5], expected: 39 },
      { name: 'dłuższa trasa', input: [250, 7.2, 6.49], expected: 116.82 },
      { name: 'zero kilometrów', input: [0, 6, 6.5], expected: 0 },
      { name: 'krótka trasa', input: [37, 5.5, 6.99], expected: 14.22, hidden: true },
      { name: 'ciężarówka', input: [800, 30, 6.2], expected: 1488, hidden: true },
    ],
    model: `
      def koszt(km, spalanie, cena):
          litry = km * spalanie / 100
          return round(litry * cena, 2)
    `,
    hints: ['Ile litrów paliwa zużyje samochód na trasie?', '`km * spalanie / 100` litrów.', 'Koszt to litry razy cena litra.', 'Na koniec `round(..., 2)`.'],
    steps: ['Litry: `km * spalanie / 100`.', 'Koszt: litry razy cena, zaokrąglony do dwóch miejsc.'],
  }),
  numeric({
    id: 'py-b-7',
    skill: 'cs-py-basics',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Co wypisze ten program? Uważaj na kolejność działań.',
    listing: 'print(2 ** 10 // 3 % 7)',
    answer: 5,
    verify: () => Math.floor(1024 / 3) % 7,
    hints: ['Które działanie Python wykonuje najpierw?', 'Potęgowanie ma najwyższy priorytet.', '`//` i `%` mają ten sam priorytet — wykonują się od lewej.', 'Najpierw `1024 // 3`, potem reszta z dzielenia przez 7.'],
    steps: ['`2 ** 10` = 1024, `1024 // 3` = 341.', '`341 % 7` = 341 − 336 = 5.'],
    errors: [['341', 'Najpierw policzone `3 % 7`.', '`//` i `%` mają równy priorytet — liczy się od lewej.']],
  }),

  // cs-py-conditions ----------------------------------------------------------
  numeric({
    id: 'py-c-1',
    skill: 'cs-py-conditions',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'x = 15\nif x % 3 == 0 and x % 5 == 0:\n    print(1)\nelif x % 3 == 0:\n    print(2)\nelse:\n    print(3)',
    answer: 1,
    verify: () => (15 % 3 === 0 && 15 % 5 === 0 ? 1 : 15 % 3 === 0 ? 2 : 3),
    hints: ['Który warunek sprawdza się jako pierwszy?', 'Czy 15 dzieli się przez 3? A przez 5?', 'Jeśli pierwszy warunek jest prawdziwy, elif i else są pomijane.', 'Wypisana zostaje liczba z pierwszej prawdziwej gałęzi.'],
    steps: ['15 dzieli się i przez 3, i przez 5 — pierwszy warunek jest prawdziwy.', 'Wypisze 1, pozostałe gałęzie są pomijane.'],
    errors: [['2', 'Uznano, że elif też się wykona.', 'Wykonuje się tylko pierwsza prawdziwa gałąź.']],
  }),
  pyTask({
    id: 'py-c-2',
    skill: 'cs-py-conditions',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `znak(n)`, która zwraca 1 dla liczby dodatniej, -1 dla ujemnej i 0 dla zera.',
    functionName: 'znak',
    params: ['n'],
    types: 'liczba -> int',
    tests: [
      { name: 'dodatnia', input: [7], expected: 1 },
      { name: 'ujemna', input: [-3], expected: -1 },
      { name: 'zero', input: [0], expected: 0 },
      { name: 'ułamek dodatni', input: [0.001], expected: 1, hidden: true },
      { name: 'duża ujemna', input: [-1000000], expected: -1, hidden: true },
    ],
    model: `
      def znak(n):
          if n > 0:
              return 1
          elif n < 0:
              return -1
          else:
              return 0
    `,
    hints: ['Ile jest możliwych przypadków?', 'Trzy: dodatnia, ujemna i zero.', 'Użyj `if`, `elif` i `else`.', 'W każdej gałęzi `return` z odpowiednią liczbą.'],
    steps: ['Sprawdzasz `n > 0`, potem `n < 0`.', 'W pozostałym przypadku n jest zerem.'],
  }),
  pyTask({
    id: 'py-c-3',
    skill: 'cs-py-conditions',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Rok jest przestępny, gdy dzieli się przez 4 i nie dzieli się przez 100, albo gdy dzieli się przez 400. Napisz funkcję `przestepny(rok)` zwracającą `True` albo `False`.',
    functionName: 'przestepny',
    params: ['rok'],
    types: 'int -> bool',
    tests: [
      { name: 'zwykły przestępny', input: [2024], expected: true },
      { name: 'zwykły nieprzestępny', input: [2023], expected: false },
      { name: 'wiek, nie przestępny', input: [1900], expected: false },
      { name: 'podzielny przez 400', input: [2000], expected: true },
      { name: 'rok 2100', input: [2100], expected: false, hidden: true },
      { name: 'rok 1600', input: [1600], expected: true, hidden: true },
    ],
    model: `
      def przestepny(rok):
          return (rok % 4 == 0 and rok % 100 != 0) or rok % 400 == 0
    `,
    hints: ['Jak w Pythonie sprawdzić, że liczba dzieli się przez 4?', '`rok % 4 == 0`.', 'Połącz warunki: `(… and …) or …`.', 'Możesz od razu zwrócić wartość wyrażenia logicznego.'],
    steps: ['Pierwsza część: `rok % 4 == 0 and rok % 100 != 0`.', 'Druga: `rok % 400 == 0`; łączysz je przez `or`.'],
  }),
  choice({
    id: 'py-c-4',
    skill: 'cs-py-conditions',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Zmienna `x` ma wartość 5. Które wyrażenie jest prawdziwe?',
    choices: ['`3 < x and x < 10`', '`x > 3 and x > 10`', '`not x > 3`', '`x < 3 or x > 10`'],
    answer: 'A',
    hints: ['Jak działa `and`?', 'Wynik jest prawdziwy tylko, gdy oba warunki są prawdziwe.', 'Sprawdź każdy warunek dla x = 5 osobno.', '`3 < 5` i `5 < 10` — oba prawdziwe.'],
    steps: ['`3 < 5` prawda, `5 < 10` prawda — koniunkcja prawdziwa.', 'W pozostałych co najmniej jeden warunek (albo całość) jest fałszywy.'],
    errors: [
      ['B', '`5 > 10` jest fałszywe.', '`and` wymaga, by oba warunki były prawdziwe.'],
      ['C', '`x > 3` jest prawdziwe, więc `not` daje fałsz.', '`not` odwraca wartość logiczną.'],
      ['D', 'Oba warunki są fałszywe dla x = 5.', '`or` wymaga co najmniej jednego prawdziwego warunku.'],
    ],
  }),
  pyTask({
    id: 'py-c-5',
    skill: 'cs-py-conditions',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Napisz funkcję `trojkat(a, b, c)`, która zwraca `"nie istnieje"`, `"równoboczny"`, `"równoramienny"` albo `"różnoboczny"` — w zależności od długości boków.',
    functionName: 'trojkat',
    params: ['a', 'b', 'c'],
    types: 'trzy liczby dodatnie -> str',
    tests: [
      { name: 'równoboczny', input: [3, 3, 3], expected: 'równoboczny' },
      { name: 'równoramienny', input: [5, 5, 8], expected: 'równoramienny' },
      { name: 'różnoboczny', input: [3, 4, 5], expected: 'różnoboczny' },
      { name: 'nie istnieje', input: [1, 2, 3], expected: 'nie istnieje' },
      { name: 'równe ramiona na końcu', input: [8, 5, 5], expected: 'równoramienny', hidden: true },
      { name: 'za długi bok', input: [10, 2, 3], expected: 'nie istnieje', hidden: true },
    ],
    model: `
      def trojkat(a, b, c):
          if a >= b + c or b >= a + c or c >= a + b:
              return "nie istnieje"
          if a == b == c:
              return "równoboczny"
          if a == b or b == c or a == c:
              return "równoramienny"
          return "różnoboczny"
    `,
    hints: ['Co trzeba sprawdzić najpierw — rodzaj trójkąta czy to, czy on istnieje?', 'Najpierw nierówność trójkąta: każdy bok krótszy od sumy pozostałych.', 'Potem równoboczny (trzy równe), dopiero później równoramienny (jakieś dwa równe).', 'Kolejność warunków: od najbardziej szczegółowego.'],
    steps: ['Jeśli któryś bok ≥ suma pozostałych — trójkąt nie istnieje.', 'Trzy równe boki → równoboczny; dwa równe → równoramienny; inaczej różnoboczny.'],
  }),
  pyTask({
    id: 'py-c-6',
    skill: 'cs-py-conditions',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Napisz funkcję `katy(a, b, c)`, która dla boków trójkąta zwraca `"ostrokątny"`, `"prostokątny"` albo `"rozwartokątny"`, a gdy trójkąt nie istnieje — `"nie istnieje"`. Wskazówka: porównaj kwadrat najdłuższego boku z sumą kwadratów pozostałych.',
    functionName: 'katy',
    params: ['a', 'b', 'c'],
    types: 'trzy liczby całkowite dodatnie -> str',
    tests: [
      { name: 'prostokątny', input: [3, 4, 5], expected: 'prostokątny' },
      { name: 'ostrokątny', input: [4, 5, 6], expected: 'ostrokątny' },
      { name: 'rozwartokątny', input: [4, 5, 7], expected: 'rozwartokątny' },
      { name: 'nie istnieje', input: [1, 1, 5], expected: 'nie istnieje' },
      { name: 'najdłuższy bok na początku', input: [13, 5, 12], expected: 'prostokątny', hidden: true },
      { name: 'równoboczny jest ostrokątny', input: [7, 7, 7], expected: 'ostrokątny', hidden: true },
    ],
    model: `
      def katy(a, b, c):
          x, y, z = sorted([a, b, c])
          if z >= x + y:
              return "nie istnieje"
          if z * z == x * x + y * y:
              return "prostokątny"
          if z * z > x * x + y * y:
              return "rozwartokątny"
          return "ostrokątny"
    `,
    hints: ['Który bok leży naprzeciw największego kąta?', 'Najdłuższy — a nie musi być podany jako ostatni.', '`sorted([a, b, c])` ustawia boki od najkrótszego.', 'Porównaj z² z x² + y²: równe — prosty, większe — rozwarty.'],
    steps: ['Sortujesz boki, żeby z był najdłuższy, i sprawdzasz nierówność trójkąta.', 'Twierdzenie cosinusów: z² > x² + y² oznacza kąt rozwarty, równość — prosty.'],
  }),

  // cs-py-loops ---------------------------------------------------------------
  numeric({
    id: 'py-l-1',
    skill: 'cs-py-loops',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 's = 0\nfor i in range(1, 5):\n    s += i\nprint(s)',
    answer: 10,
    verify: () => 1 + 2 + 3 + 4,
    hints: ['Jakie liczby daje `range(1, 5)`?', 'Od 1 do 4 — bez piątki.', 'Pętla dodaje każdą z nich do s.', 'Zsumuj te liczby.'],
    steps: ['`range(1, 5)` to 1, 2, 3, 4.', 'Suma: 10.'],
    errors: [['15', 'Wliczona piątka.', '`range(a, b)` kończy się na b − 1.']],
  }),
  pyTask({
    id: 'py-l-2',
    skill: 'cs-py-loops',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `suma_do(n)`, która pętlą oblicza sumę 1 + 2 + … + n. Dla n = 0 wynik to 0.',
    functionName: 'suma_do',
    params: ['n'],
    types: 'int -> int',
    tests: [
      { name: 'zero', input: [0], expected: 0 },
      { name: 'jeden', input: [1], expected: 1 },
      { name: 'pięć', input: [5], expected: 15 },
      { name: 'sto', input: [100], expected: 5050, hidden: true },
      { name: 'dwa', input: [2], expected: 3, hidden: true },
    ],
    model: `
      def suma_do(n):
          suma = 0
          for i in range(1, n + 1):
              suma += i
          return suma
    `,
    hints: ['Od jakiej wartości zaczyna się suma?', 'Od zera — przed pętlą.', 'Pętla `for i in range(1, n + 1)` przejdzie przez 1, …, n.', 'Po pętli zwróć sumę.'],
    steps: ['Akumulator `suma = 0` przed pętlą.', 'Pętla po `range(1, n + 1)` dodaje kolejne liczby.'],
  }),
  numeric({
    id: 'py-l-3',
    skill: 'cs-py-loops',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Co wypisze ten program?',
    listing: 'i = 1\nwhile i < 100:\n    i *= 3\nprint(i)',
    answer: 243,
    verify: () => {
      let i = 1;
      while (i < 100) i *= 3;
      return i;
    },
    hints: ['Kiedy pętla przestaje się wykonywać?', 'Gdy i nie jest już mniejsze od 100.', 'Kolejne wartości i: 1, 3, 9, …', 'Wypisana jest pierwsza wartość, która nie spełnia warunku.'],
    steps: ['i: 1, 3, 9, 27, 81 — wszystkie mniejsze od 100.', 'Następne mnożenie daje 243 i pętla się kończy.'],
    errors: [['81', 'Wypisana ostatnia wartość spełniająca warunek.', 'Warunek sprawdza się przed obrotem — pętla kończy się dopiero po przekroczeniu 100.']],
  }),
  pyTask({
    id: 'py-l-4',
    skill: 'cs-py-loops',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `suma_cyfr(n)`, która zwraca sumę cyfr liczby naturalnej n. Użyj pętli `while` i działań `%` oraz `//`.',
    functionName: 'suma_cyfr',
    params: ['n'],
    types: 'int -> int',
    tests: [
      { name: 'jedna cyfra', input: [7], expected: 7 },
      { name: 'kilka cyfr', input: [1234], expected: 10 },
      { name: 'zera w środku', input: [1005], expected: 6 },
      { name: 'zero', input: [0], expected: 0, hidden: true },
      { name: 'duża liczba', input: [987654321], expected: 45, hidden: true },
    ],
    model: `
      def suma_cyfr(n):
          suma = 0
          while n > 0:
              suma += n % 10
              n //= 10
          return suma
    `,
    hints: ['Jak odczytać ostatnią cyfrę liczby?', '`n % 10`.', 'Jak ją obciąć? `n //= 10`.', 'Powtarzaj, dopóki n > 0, dodając ostatnią cyfrę do sumy.'],
    steps: ['Ostatnia cyfra to `n % 10`, obcięcie — `n //= 10`.', 'Pętla `while n > 0` sumuje cyfry.'],
  }),
  pyTask({
    id: 'py-l-5',
    skill: 'cs-py-loops',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `silnia(n)`, która oblicza n! = 1 · 2 · … · n za pomocą pętli. Przyjmij 0! = 1.',
    functionName: 'silnia',
    params: ['n'],
    types: 'int -> int',
    tests: [
      { name: 'zero', input: [0], expected: 1 },
      { name: 'jeden', input: [1], expected: 1 },
      { name: 'pięć', input: [5], expected: 120 },
      { name: 'dziesięć', input: [10], expected: 3628800, hidden: true },
      { name: 'dwanaście', input: [12], expected: 479001600, hidden: true },
    ],
    model: `
      def silnia(n):
          wynik = 1
          for i in range(2, n + 1):
              wynik *= i
          return wynik
    `,
    hints: ['Od jakiej wartości zaczyna się iloczyn?', 'Od 1 — zero wyzerowałoby wszystko.', 'Mnóż przez kolejne liczby od 2 do n.', 'Dla n = 0 pętla się nie wykona i zostanie 1.'],
    steps: ['Akumulator iloczynu zaczyna się od 1.', 'Pętla mnoży przez 2, 3, …, n.'],
  }),
  pyTask({
    id: 'py-l-6',
    skill: 'cs-py-loops',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Lokata daje `procent` % rocznie, odsetki dopisywane są na koniec roku. Napisz funkcję `lata(kapital, procent)`, która zwraca liczbę pełnych lat, po których kapitał po raz pierwszy co najmniej się podwoi.',
    functionName: 'lata',
    params: ['kapital', 'procent'],
    types: 'kapitał > 0, procent > 0 -> int',
    tests: [
      { name: '10 procent', input: [1000, 10], expected: 8 },
      { name: '100 procent', input: [1000, 100], expected: 1 },
      { name: '5 procent', input: [500, 5], expected: 15 },
      { name: '1 procent', input: [100, 1], expected: 70, hidden: true },
      { name: '25 procent', input: [2000, 25], expected: 4, hidden: true },
    ],
    model: `
      def lata(kapital, procent):
          cel = 2 * kapital
          lat = 0
          while kapital < cel:
              kapital = kapital * (1 + procent / 100)
              lat += 1
          return lat
    `,
    hints: ['Ile razy trzeba powtórzyć dopisanie odsetek — wiesz to z góry?', 'Nie — to zadanie dla pętli `while`.', 'Warunek: kapitał mniejszy od podwojonego początkowego.', 'W każdym obrocie pomnóż kapitał przez (1 + procent/100) i dolicz rok.'],
    steps: ['Zapamiętujesz cel = 2 · kapitał.', 'Dopóki kapitał < cel, mnożysz go przez 1 + p/100 i liczysz lata.'],
  }),
  pyTask({
    id: 'py-l-7',
    skill: 'cs-py-loops',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Ciąg Collatza: jeśli n jest parzyste, następny wyraz to n/2, jeśli nieparzyste — 3n + 1. Napisz funkcję `collatz(n)`, która zwraca liczbę kroków potrzebnych, by z n dojść do 1.',
    functionName: 'collatz',
    params: ['n'],
    types: 'int ≥ 1 -> int',
    tests: [
      { name: 'już jedynka', input: [1], expected: 0 },
      { name: 'sześć', input: [6], expected: 8 },
      { name: 'siedem', input: [7], expected: 16 },
      { name: 'dwadzieścia siedem', input: [27], expected: 111, hidden: true },
      { name: 'potęga dwójki', input: [1024], expected: 10, hidden: true },
    ],
    model: `
      def collatz(n):
          kroki = 0
          while n != 1:
              if n % 2 == 0:
                  n //= 2
              else:
                  n = 3 * n + 1
              kroki += 1
          return kroki
    `,
    hints: ['Czy wiesz z góry, ile będzie kroków?', 'Nie — pętla `while n != 1`.', 'W środku `if` wybiera jedną z dwóch reguł.', 'Użyj `//`, żeby n zostało liczbą całkowitą, i licz kroki.'],
    steps: ['Pętla trwa, dopóki n ≠ 1.', 'Parzyste: `n //= 2`, nieparzyste: `n = 3 * n + 1`; po każdym kroku licznik +1.'],
  }),

  // cs-py-functions -----------------------------------------------------------
  numeric({
    id: 'py-f-1',
    skill: 'cs-py-functions',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co wypisze ten program?',
    listing: 'def f(x):\n    return 2 * x + 1\n\nprint(f(f(3)))',
    answer: 15,
    verify: () => 2 * (2 * 3 + 1) + 1,
    hints: ['Które wywołanie wykonuje się najpierw?', 'Wewnętrzne: `f(3)`.', 'Jego wynik staje się argumentem zewnętrznego f.', 'Policz f(3), a potem f z tego wyniku.'],
    steps: ['`f(3)` = 7.', '`f(7)` = 15.'],
    errors: [['7', 'Policzone tylko wewnętrzne wywołanie.', 'Wynik f(3) trafia jeszcze raz do f.']],
  }),
  pyTask({
    id: 'py-f-2',
    skill: 'cs-py-functions',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Napisz funkcję `najwieksza(a, b, c)`, która zwraca największą z trzech liczb — bez używania wbudowanej funkcji `max`.',
    functionName: 'najwieksza',
    params: ['a', 'b', 'c'],
    types: 'trzy liczby -> liczba',
    tests: [
      { name: 'największa pierwsza', input: [9, 2, 5], expected: 9 },
      { name: 'największa w środku', input: [1, 8, 3], expected: 8 },
      { name: 'największa ostatnia', input: [1, 2, 3], expected: 3 },
      { name: 'równe', input: [4, 4, 4], expected: 4, hidden: true },
      { name: 'ujemne', input: [-5, -2, -9], expected: -2, hidden: true },
    ],
    model: `
      def najwieksza(a, b, c):
          m = a
          if b > m:
              m = b
          if c > m:
              m = c
          return m
    `,
    hints: ['Jak znaleźć największą, porównując po kolei?', 'Załóż, że największa jest a.', 'Jeśli b jest większe od dotychczasowej — zapamiętaj b; to samo z c.', 'Zwróć zapamiętaną wartość.'],
    steps: ['Kandydat na maksimum: a.', 'Porównujesz z b i c, podmieniając kandydata, gdy trafisz większą liczbę.'],
  }),
  choice({
    id: 'py-f-3',
    skill: 'cs-py-functions',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Co wypisze program?',
    listing: 'def podwoj(x):\n    x = x * 2\n\nprint(podwoj(5))',
    choices: ['None', '10', '5', 'program zakończy się błędem'],
    answer: 'A',
    hints: ['Co zwraca funkcja, która nie ma instrukcji `return`?', 'Specjalną wartość oznaczającą „nic”.', 'Zmiana x wewnątrz funkcji nie jest zwracana.', 'print wypisze tę specjalną wartość.'],
    steps: ['Funkcja nie ma `return` — zwraca None.', 'print(None) wypisuje None.'],
    errors: [
      ['B', 'Uznano, że zmieniona zmienna jest zwracana.', 'Wynik trzeba oddać przez return.'],
      ['C', 'Pomylony argument z wynikiem.', 'Funkcja bez return zwraca None.'],
      ['D', 'Brak return nie jest błędem.', 'Funkcja bez return po prostu zwraca None.'],
    ],
  }),
  pyTask({
    id: 'py-f-4',
    skill: 'cs-py-functions',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `odleglosc(x1, y1, x2, y2)`, która zwraca odległość punktów (x1, y1) i (x2, y2) zaokrągloną do dwóch miejsc po przecinku. Pierwiastek: `math.sqrt` (pamiętaj o `import math`).',
    functionName: 'odleglosc',
    params: ['x1', 'y1', 'x2', 'y2'],
    types: 'cztery liczby -> float',
    tests: [
      { name: 'trójka pitagorejska', input: [0, 0, 3, 4], expected: 5 },
      { name: 'ten sam punkt', input: [2, 2, 2, 2], expected: 0 },
      { name: 'pierwiastek z dwóch', input: [0, 0, 1, 1], expected: 1.41 },
      { name: 'ujemne współrzędne', input: [-1, 3, 5, -5], expected: 10, hidden: true },
      { name: 'ułamki', input: [0.5, 0, 0, 1.5], expected: 1.58, hidden: true },
    ],
    model: `
      import math

      def odleglosc(x1, y1, x2, y2):
          return round(math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), 2)
    `,
    hints: ['Jaki wzór opisuje odległość dwóch punktów?', 'Pierwiastek z sumy kwadratów różnic współrzędnych.', '`math.sqrt(...)` — po `import math` na początku.', 'Wynik przez `round(..., 2)`.'],
    steps: ['Różnice współrzędnych podnosisz do kwadratu i sumujesz.', 'Pierwiastek z sumy, zaokrąglony do dwóch miejsc.'],
  }),
  pyTask({
    id: 'py-f-5',
    skill: 'cs-py-functions',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Liczba doskonała jest równa sumie swoich dzielników mniejszych od niej (6 = 1 + 2 + 3). Napisz funkcję `doskonala(n)`, która zwraca `True` albo `False`. Warto najpierw napisać funkcję pomocniczą liczącą sumę dzielników.',
    functionName: 'doskonala',
    params: ['n'],
    types: 'int ≥ 1 -> bool',
    tests: [
      { name: 'sześć', input: [6], expected: true },
      { name: 'dwanaście', input: [12], expected: false },
      { name: 'dwadzieścia osiem', input: [28], expected: true },
      { name: 'jedynka', input: [1], expected: false, hidden: true },
      { name: '496', input: [496], expected: true, hidden: true },
      { name: 'liczba pierwsza', input: [13], expected: false, hidden: true },
    ],
    model: `
      def suma_dzielnikow(n):
          suma = 0
          for d in range(1, n):
              if n % d == 0:
                  suma += d
          return suma

      def doskonala(n):
          return suma_dzielnikow(n) == n
    `,
    hints: ['Jakie liczby są dzielnikami n mniejszymi od n?', 'Te d z przedziału 1 … n − 1, dla których `n % d == 0`.', 'Napisz funkcję pomocniczą zwracającą sumę takich d.', 'Główna funkcja zwraca porównanie tej sumy z n.'],
    steps: ['Funkcja pomocnicza sumuje dzielniki d < n.', 'Liczba jest doskonała, gdy ta suma równa się n.'],
  }),
  pyTask({
    id: 'py-f-6',
    skill: 'cs-py-functions',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Stała miesięczna rata kredytu to $R = \\frac{K \\cdot r}{1 - (1 + r)^{-n}}$, gdzie $K$ to kwota, $n$ — liczba rat, a $r = \\frac{p}{1200}$ ($p$ — oprocentowanie roczne w procentach). Dla $p = 0$ rata to $\\frac{K}{n}$. Napisz funkcję `rata(kwota, p, n)` zwracającą ratę zaokrągloną do groszy.',
    functionName: 'rata',
    params: ['kwota', 'p', 'n'],
    types: 'kwota, oprocentowanie w %, liczba rat -> float',
    tests: [
      { name: 'bez odsetek', input: [12000, 0, 12], expected: 1000 },
      { name: '12 procent przez rok', input: [10000, 12, 12], expected: 888.49 },
      { name: 'hipoteka', input: [100000, 6, 360], expected: 599.55 },
      { name: 'krótki kredyt', input: [5000, 24, 6], expected: 892.63, hidden: true },
      { name: 'jedna rata', input: [1000, 12, 1], expected: 1010, hidden: true },
    ],
    model: `
      def rata(kwota, p, n):
          if p == 0:
              return round(kwota / n, 2)
          r = p / 1200
          return round(kwota * r / (1 - (1 + r) ** (-n)), 2)
    `,
    hints: ['Który przypadek trzeba obsłużyć osobno?', 'p = 0: wzór dzieliłby przez zero.', 'Dla p > 0 policz r = p / 1200 i wstaw do wzoru.', 'Potęga z ujemnym wykładnikiem: `(1 + r) ** (-n)`.'],
    steps: ['Dla p = 0 rata to po prostu kwota / n.', 'W pozostałych przypadkach wzór annuitetowy z r = p/1200, wynik zaokrąglony do groszy.'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const PY_CARDS: Flashcard[] = [
  card('c-py-b-1', 'cs-py-basics', 'definicja', 'Co dają `17 // 5` i `17 % 5`?', '3 (dzielenie całkowite) i 2 (reszta).'),
  card('c-py-b-2', 'cs-py-basics', 'pulapka', 'Jaki typ ma `10 / 2`?', 'float (5.0) — całkowity wynik daje `//`.'),

  card('c-py-c-1', 'cs-py-conditions', 'wzor', 'Warunek roku przestępnego?', '`(r % 4 == 0 and r % 100 != 0) or r % 400 == 0`'),
  card('c-py-c-2', 'cs-py-conditions', 'pulapka', 'Kolejność gałęzi if/elif?', 'Od najbardziej szczegółowej — wykonuje się tylko pierwsza prawdziwa.'),

  card('c-py-l-1', 'cs-py-loops', 'definicja', 'Jakie liczby daje `range(2, 6)`?', '2, 3, 4, 5 — bez szóstki.'),
  card('c-py-l-2', 'cs-py-loops', 'metoda', 'Jak przejść po cyfrach liczby n?', '`while n > 0:` cyfra = `n % 10`, potem `n //= 10`.'),

  card('c-py-f-1', 'cs-py-functions', 'pulapka', 'print czy return w funkcji?', '`return` oddaje wynik programowi; bez niego funkcja zwraca None.'),
  card('c-py-f-2', 'cs-py-functions', 'metoda', 'Skąd wziąć pierwiastek w Pythonie?', '`import math` i `math.sqrt(x)`.'),
];

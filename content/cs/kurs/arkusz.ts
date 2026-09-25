import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, listing, numeric, p, pyTask, tip, warn } from '../../authoring';

/**
 * Informatyka, dział 9: arkusz kalkulacyjny i analiza danych.
 *
 * Podstawa programowa 2024: II.3c (funkcje arkusza, filtrowanie, wykresy,
 * tabele przestawne), II.R3b (zaawansowane funkcje arkusza).
 *
 * Arkusza nie da się uruchomić w aplikacji, więc dział ma dwie części:
 * formuły i adresowanie (zadania zamknięte i liczbowe na małych tabelach)
 * oraz analizę danych i symulacje — w Pythonie, bo na maturze wolno
 * rozwiązać zadanie „arkuszowe” dowolnym narzędziem, a program bywa
 * szybszy i pewniejszy niż kilkaset przeciągniętych formuł.
 */

export const SHEET_TOPIC: Topic = {
  id: 'cs-spreadsheet',
  subjectId: 'cs',
  name: 'Arkusz kalkulacyjny i analiza danych',
  summary: 'Adresowanie względne i bezwzględne, funkcje JEŻELI, LICZ.JEŻELI, SUMA.JEŻELI, WYSZUKAJ.PIONOWO; zestawienia, średnie kroczące i symulacje.',
};

export const SHEET_SKILLS: Skill[] = [
  {
    id: 'cs-sheet-formulas',
    topicId: 'cs-spreadsheet',
    name: 'Formuły, adresowanie i funkcje arkusza',
    level: 'PR',
    ckeRequirement: 'Funkcje arkusza dobrane do rodzaju danych, adresowanie komórek, funkcje zaawansowane (II.3c, II.R3b)',
    prerequisites: ['cs-py-conditions'],
    examValue: 0.85,
  },
  {
    id: 'cs-sheet-analysis',
    topicId: 'cs-spreadsheet',
    name: 'Analiza danych i symulacje',
    level: 'PR',
    ckeRequirement: 'Analiza danych: zestawienia (tabele przestawne), wykresy, symulacje krok po kroku (II.3c, II.R3b)',
    prerequisites: ['cs-sheet-formulas', 'cs-dicts', 'cs-files'],
    examValue: 0.9,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const SHEET_LESSONS: Lesson[] = [
  {
    skillId: 'cs-sheet-formulas',
    minutes: 15,
    intro:
      'Siła arkusza to formuła napisana raz i skopiowana na setki wierszy. Żeby kopiowanie działało, trzeba rozumieć adresy: które części formuły mają się przesuwać razem z nią, a które stać w miejscu.',
    blocks: [
      p('Adres względny `A2` przesuwa się przy kopiowaniu: formuła `=A2*2` skopiowana wiersz niżej staje się `=A3*2`. Znak `$` blokuje to, co stoi za nim: `$B$1` zawsze wskazuje B1, `$A2` blokuje kolumnę, a `A$1` — wiersz.'),
      listing('A        B        C\n1  cena    VAT      0,23\n2  100     =A2*$C$1     <- skopiowane w dół:\n3  250     =A3*$C$1        wiersz ceny się zmienia,\n4  40      =A4*$C$1        stawka VAT stoi w miejscu', 'Stała w jednej komórce i adres bezwzględny do niej.'),
      p('Najczęstsze funkcje (polski Excel / angielski): `JEŻELI` (IF), `ORAZ`/`LUB` (AND/OR), `LICZ.JEŻELI` (COUNTIF), `SUMA.JEŻELI` (SUMIF), `WYSZUKAJ.PIONOWO` (VLOOKUP), `LEWY`/`FRAGMENT.TEKSTU` (LEFT/MID), `DZIEŃ.TYG` (WEEKDAY). W polskiej wersji argumenty oddziela się średnikiem.'),
      listing('=JEŻELI(B2>=30; "zdał"; "nie zdał")\n=LICZ.JEŻELI(B2:B31; ">=30")                 ile osób zdało\n=SUMA.JEŻELI(A2:A100; "Północ"; C2:C100)     suma C tam, gdzie A = Północ\n=WYSZUKAJ.PIONOWO("Kowal"; A2:C50; 3; FAŁSZ) 3. kolumna wiersza z „Kowal”'),
      tip('W `WYSZUKAJ.PIONOWO` ostatni argument `FAŁSZ` oznacza dokładne dopasowanie. Bez niego arkusz zakłada posortowaną kolumnę i może zwrócić wiersz „najbliższy”, a nie właściwy.'),
      warn('W `SUMA.JEŻELI` najpierw podajesz zakres z KRYTERIUM, potem kryterium, a na końcu zakres do SUMOWANIA. Zamiana kolejności daje zwykle 0.'),
    ],
    examples: [
      example(
        'Formułę `=A2*$B$1` z komórki C2 skopiowano do C5. Jak wygląda w C5?',
        [['Przesunięcie o 3 wiersze w dół: A2 → A5.', 'adres względny się przesuwa'], '`$B$1` jest zablokowany i zostaje.'],
        '`=A5*$B$1`',
      ),
      example(
        'Co zwróci `=LICZ.JEŻELI(A1:A6; ">3")` dla wartości 2, 5, 3, 7, 4, 3?',
        ['Warunek „większe od 3” spełniają 5, 7 i 4.', 'Trójki nie są większe od 3.'],
        'trzy komórki',
      ),
    ],
    pitfalls: ['Brak `$` przy stałej — po skopiowaniu formuła wskazuje puste komórki.', 'Zła kolejność argumentów SUMA.JEŻELI.', 'WYSZUKAJ.PIONOWO bez FAŁSZ na nieposortowanych danych.'],
  },
  {
    skillId: 'cs-sheet-analysis',
    minutes: 15,
    intro:
      'Zadania z arkusza na maturze to zwykle analiza danych (zestawienia, średnie, wykresy) albo symulacja: coś zmienia się dzień po dniu według reguł, a pytanie brzmi „kiedy po raz pierwszy…” albo „ile razy…”. W arkuszu każdy dzień to wiersz; w programie — obrót pętli.',
    blocks: [
      p('Tabela przestawna grupuje wiersze według kategorii i podsumowuje je (suma, liczba, średnia). To dokładnie słownik w Pythonie albo GROUP BY w SQL.'),
      listing('def zestawienie(wiersze):             # wiersze: [kategoria, kwota]\n    sumy = {}\n    for kategoria, kwota in wiersze:\n        sumy[kategoria] = sumy.get(kategoria, 0) + kwota\n    return sumy', 'Tabela przestawna w pięciu linijkach.'),
      p('Symulacja: zapisz stan (np. ilość wody), a potem dla każdego dnia wykonaj reguły DOKŁADNIE w kolejności z treści zadania — najpierw dostawa, potem zużycie, albo odwrotnie. Kolejność zmienia wynik.'),
      p('Dobór wykresu: udział części w całości — kołowy; zmiana w czasie — liniowy; porównanie kategorii — kolumnowy; zależność dwóch wielkości — punktowy (XY).'),
      tip('Daty w Pythonie: `from datetime import date`; `date.fromisoformat("2026-09-24").weekday()` daje 0 dla poniedziałku, …, 6 dla niedzieli. Różnica dat to liczba dni: `(d2 - d1).days`.'),
      warn('Najczęstszy błąd w symulacji to pomyłka o jeden dzień: sprawdź na małym przykładzie, czy dzień 1 to pierwszy obrót pętli, i czy warunek sprawdzasz przed zmianą stanu, czy po niej.'),
    ],
    examples: [
      example(
        'Średnia krocząca z 3 dni dla temperatur 3, 5, 7, 9?',
        [['Okna: (3, 5, 7) i (5, 7, 9).', 'każde okno to trzy kolejne dni'], 'Średnie: 5 i 7.'],
        '[5, 7]',
      ),
      example(
        'Jaki wykres pokaże, jak zmieniała się liczba wypożyczeń w kolejnych miesiącach?',
        ['Oś pozioma to czas (miesiące).', 'Zmiana w czasie → wykres liniowy.'],
        'liniowy',
      ),
    ],
    pitfalls: ['Zła kolejność reguł w jednym dniu symulacji.', 'Pomyłka o jeden dzień przy „pierwszym dniu, w którym…”.', 'Wykres kołowy dla danych zmieniających się w czasie.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const SHEET_QUESTIONS: Question[] = [
  // cs-sheet-formulas ---------------------------------------------------------
  choice({
    id: 'ar-f-1',
    skill: 'cs-sheet-formulas',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'W komórce C1 jest formuła `=A1+B1`. Jak będzie wyglądać po skopiowaniu do komórki C2?',
    choices: ['`=A2+B2`', '`=A1+B1`', '`=B2+C2`', '`=A2+B1`'],
    answer: 'A',
    hints: ['Jak zmieniają się adresy względne przy kopiowaniu o jeden wiersz w dół?', 'Numer wiersza w każdym adresie rośnie o 1.', 'Kolumny się nie zmieniają — formuła została w kolumnie C.', 'Oba adresy są względne.'],
    steps: ['Kopiowanie o jeden wiersz w dół zwiększa numery wierszy o 1.', '`=A1+B1` → `=A2+B2`.'],
    errors: [
      ['B', 'Adresy potraktowane jak bezwzględne.', 'Bez `$` adres przesuwa się razem z formułą.'],
      ['C', 'Przesunięte kolumny zamiast wierszy.', 'Kopiowanie w dół zmienia numery wierszy.'],
      ['D', 'Przesunięty tylko jeden adres.', 'Oba adresy są względne.'],
    ],
  }),
  choice({
    id: 'ar-f-2',
    skill: 'cs-sheet-formulas',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Formułę `=A2*$B$1` z komórki C2 skopiowano do komórki C5. Jak wygląda formuła w C5?',
    choices: ['`=A5*$B$1`', '`=A5*$B$4`', '`=A2*$B$1`', '`=D5*$B$1`'],
    answer: 'A',
    hints: ['Która część formuły jest zablokowana znakami `$`?', '`$B$1` — i kolumna, i wiersz.', 'O ile wierszy przesunęła się formuła?', 'Z wiersza 2 do 5 — adres względny A2 przesuwa się tak samo.'],
    steps: ['Adres względny A2 przesuwa się o 3 wiersze: A5.', '`$B$1` zostaje bez zmian.'],
    errors: [
      ['B', 'Przesunięty adres bezwzględny.', '`$` przed numerem wiersza blokuje wiersz.'],
      ['C', 'Nieprzesunięty adres względny.', 'A2 bez `$` przesuwa się razem z formułą.'],
      ['D', 'Przesunięta kolumna.', 'Formuła została w kolumnie C — kolumny się nie zmieniają.'],
    ],
  }),
  numeric({
    id: 'ar-f-3',
    skill: 'cs-sheet-formulas',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jaką wartość zwróci formuła w komórce B1?',
    listing: '   A\n1  2\n2  5\n3  3\n4  7\n5  4\n6  3\n\nB1: =LICZ.JEŻELI(A1:A6; ">3")',
    answer: 3,
    verify: () => [2, 5, 3, 7, 4, 3].filter((x) => x > 3).length,
    hints: ['Co liczy funkcja LICZ.JEŻELI?', 'Komórki zakresu spełniające warunek.', 'Warunek w cudzysłowie to „większe od” progu — nierówność ostra.', 'Czy wartość równa progowi spełnia warunek?'],
    steps: ['Większe od 3 są: 5, 7 i 4.', 'Wynik: 3 komórki.'],
    errors: [['5', 'Warunek potraktowany jak „≥ 3”.', '„>3” nie obejmuje samych trójek.']],
  }),
  choice({
    id: 'ar-f-4',
    skill: 'cs-sheet-formulas',
    kind: 'typical',
    difficulty: 3,
    prompt: 'W kolumnie B jest region sprzedaży, a w kolumnie C — kwota (wiersze 2–100). Która formuła policzy łączną sprzedaż w regionie „Północ”?',
    choices: [
      '`=SUMA.JEŻELI(B2:B100; "Północ"; C2:C100)`',
      '`=SUMA.JEŻELI(C2:C100; "Północ"; B2:B100)`',
      '`=LICZ.JEŻELI(B2:B100; "Północ")`',
      '`=SUMA(C2:C100; "Północ")`',
    ],
    answer: 'A',
    hints: ['W jakiej kolejności SUMA.JEŻELI przyjmuje argumenty?', 'Zakres z kryterium, kryterium, zakres do sumowania.', 'Gdzie jest kryterium „Północ”?', 'W kolumnie B — a sumujesz kolumnę C.'],
    steps: ['Kryterium sprawdzasz w B, sumujesz C.', 'Poprawnie: `=SUMA.JEŻELI(B2:B100; "Północ"; C2:C100)`.'],
    errors: [
      ['B', 'Zamienione zakresy.', 'Pierwszy argument to zakres z kryterium (regiony).'],
      ['C', 'LICZ.JEŻELI liczy wiersze, a nie sumuje kwot.', 'Do sumowania z warunkiem służy SUMA.JEŻELI.'],
      ['D', 'SUMA nie przyjmuje warunku.', 'Warunek obsługuje SUMA.JEŻELI.'],
    ],
  }),
  numeric({
    id: 'ar-f-5',
    skill: 'cs-sheet-formulas',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Jaką wartość zwróci formuła w komórce E1?',
    listing: '   A          B       C\n1  Nazwisko   Imię    Punkty\n2  Nowak      Anna    78\n3  Kowalski   Piotr   55\n4  Kowal      Jan     64\n5  Wiśnia     Ola     91\n\nE1: =WYSZUKAJ.PIONOWO("Kowal"; A2:C5; 3; FAŁSZ)',
    answer: 64,
    verify: () => {
      const tabela: Array<[string, string, number]> = [
        ['Nowak', 'Anna', 78],
        ['Kowalski', 'Piotr', 55],
        ['Kowal', 'Jan', 64],
        ['Wiśnia', 'Ola', 91],
      ];
      return tabela.find((w) => w[0] === 'Kowal')![2];
    },
    hints: ['W której kolumnie WYSZUKAJ.PIONOWO szuka nazwiska?', 'W pierwszej kolumnie zakresu, czyli w A.', 'FAŁSZ oznacza dokładne dopasowanie — „Kowalski” to nie „Kowal”.', 'Z znalezionego wiersza bierzesz 3. kolumnę zakresu.'],
    steps: ['Dokładne dopasowanie „Kowal” to wiersz 4.', 'Trzecia kolumna zakresu (C) w tym wierszu: 64.'],
    errors: [['55', 'Dopasowany „Kowalski”.', 'FAŁSZ wymaga dokładnie takiej samej wartości.']],
  }),
  choice({
    id: 'ar-f-6',
    skill: 'cs-sheet-formulas',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'W komórce B2 jest formuła `=$A2*B$1` (tabliczka mnożenia). Jak będzie wyglądać po skopiowaniu do komórki D4?',
    choices: ['`=$A4*D$1`', '`=$A2*B$1`', '`=$C4*D$3`', '`=$A4*B$1`'],
    answer: 'A',
    hints: ['Co blokuje `$` w adresie `$A2`, a co w `B$1`?', '`$A2` blokuje kolumnę A, `B$1` blokuje wiersz 1.', 'Przesunięcie z B2 do D4: dwie kolumny w prawo i dwa wiersze w dół.', 'Zmienia się tylko niezablokowana część każdego adresu.'],
    steps: ['`$A2`: kolumna stała, wiersz 2 → 4: `$A4`.', '`B$1`: wiersz stały, kolumna B → D: `D$1`.'],
    errors: [
      ['B', 'Adresy mieszane potraktowane jak bezwzględne.', 'Blokowana jest tylko część ze znakiem `$`.'],
      ['C', 'Przesunięte także części zablokowane.', '`$` przed literą lub numerem blokuje tę część.'],
      ['D', 'Nieprzesunięta kolumna w `B$1`.', '`B$1` blokuje tylko wiersz — kolumna się przesuwa.'],
    ],
  }),
  numeric({
    id: 'ar-f-7',
    skill: 'cs-sheet-formulas',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Formułę z C2 skopiowano do C3:C6, a w C7 wpisano `=SUMA(C2:C6)`. Jaką wartość pokaże C7?',
    listing: '   A    B    C\n2  3    4    =JEŻELI(ORAZ(A2>0; B2>0); A2*B2; 0)\n3  -2   5\n4  0    7\n5  6    2\n6  5    -1\n\nC7: =SUMA(C2:C6)',
    answer: 24,
    verify: () =>
      [
        [3, 4],
        [-2, 5],
        [0, 7],
        [6, 2],
        [5, -1],
      ].reduce((s, [a, b]) => s + (a! > 0 && b! > 0 ? a! * b! : 0), 0),
    hints: ['Kiedy formuła w kolumnie C zwraca iloczyn?', 'Gdy obie liczby są dodatnie — ORAZ wymaga obu warunków.', 'Czy zero jest liczbą dodatnią?', 'Nie — w pozostałych wierszach formuła daje 0.'],
    steps: ['Obie liczby dodatnie są tylko w wierszach 2 (3 · 4) i 5 (6 · 2).', 'Suma: 12 + 12 = 24.'],
    errors: [['9', 'ORAZ potraktowane jak LUB — doliczone iloczyny z liczbą ujemną.', 'ORAZ wymaga spełnienia obu warunków naraz.']],
  }),

  // cs-sheet-analysis ---------------------------------------------------------
  choice({
    id: 'ar-a-1',
    skill: 'cs-sheet-analysis',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Który wykres najlepiej pokaże, jak zmieniała się średnia temperatura w kolejnych miesiącach roku?',
    choices: ['liniowy', 'kołowy', 'punktowy bez linii, z losową kolejnością miesięcy', 'żaden — to dane tylko do tabeli'],
    answer: 'A',
    hints: ['Co leży na osi poziomej?', 'Czas: kolejne miesiące.', 'Jaki wykres pokazuje zmianę w czasie?', 'Taki, w którym punkty połączone są w kolejności.'],
    steps: ['Dane zmieniają się w czasie.', 'Zmianę w czasie najlepiej pokazuje wykres liniowy.'],
    errors: [
      ['B', 'Kołowy pokazuje udział części w całości.', 'Tu chodzi o zmianę w czasie.'],
      ['C', 'Losowa kolejność niszczy informację o czasie.', 'Miesiące muszą iść po kolei.'],
      ['D', 'Wykres ułatwia dostrzeżenie trendu.', 'Dane w czasie dobrze pokazuje wykres liniowy.'],
    ],
  }),
  choice({
    id: 'ar-a-2',
    skill: 'cs-sheet-analysis',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Do czego służy tabela przestawna?',
    choices: ['do grupowania danych według kategorii i liczenia podsumowań', 'do zamiany wierszy z kolumnami bez żadnych obliczeń', 'do sortowania i filtrowania wierszy jednej kolumny', 'do ochrony wybranych komórek arkusza hasłem'],
    answer: 'A',
    hints: ['Jakie pytanie zadajesz, tworząc tabelę przestawną?', 'Na przykład: „ile sprzedano w każdym regionie?”.', 'Co trzeba zrobić z wierszami, żeby na nie odpowiedzieć?', 'Zgrupować je i podsumować każdą grupę.'],
    steps: ['Tabela przestawna grupuje wiersze według wybranych kategorii.', 'Dla każdej grupy liczy podsumowanie — jak GROUP BY w SQL.'],
    errors: [
      ['B', 'To transpozycja, nie tabela przestawna.', 'Tabela przestawna grupuje i podsumowuje.'],
      ['C', 'Sortowanie i filtrowanie nie tworzą podsumowań.', 'Tabela przestawna grupuje i podsumowuje.'],
      ['D', 'To funkcja ochrony arkusza.', 'Tabela przestawna służy do analizy danych.'],
    ],
  }),
  pyTask({
    id: 'ar-a-3',
    skill: 'cs-sheet-analysis',
    kind: 'typical',
    difficulty: 2,
    prompt: 'Każdy wiersz danych to para `[kategoria, kwota]`. Napisz funkcję `zestawienie(wiersze)`, która — jak tabela przestawna — zwraca słownik: kategoria → suma kwot.',
    functionName: 'zestawienie',
    params: ['wiersze'],
    types: 'list[[str, liczba]] -> dict[str, liczba]',
    tests: [
      { name: 'przykład', input: [[['Północ', 100], ['Południe', 50], ['Północ', 25]]], expected: { Północ: 125, Południe: 50 } },
      { name: 'jedna kategoria', input: [[['A', 1], ['A', 2], ['A', 3]]], expected: { A: 6 } },
      { name: 'brak danych', input: [[]], expected: {} },
      { name: 'ułamki', input: [[['x', 0.5], ['y', 1.25], ['x', 0.25]]], expected: { x: 0.75, y: 1.25 }, hidden: true },
    ],
    model: `
      def zestawienie(wiersze):
          sumy = {}
          for kategoria, kwota in wiersze:
              sumy[kategoria] = sumy.get(kategoria, 0) + kwota
          return sumy
    `,
    hints: ['Jaka struktura danych odpowiada tabeli przestawnej?', 'Słownik: klucz to kategoria, wartość — suma.', 'Dla każdego wiersza dodaj kwotę do sumy jego kategorii.', '`sumy.get(k, 0)` obsłuży pierwsze wystąpienie kategorii.'],
    steps: ['Pusty słownik na start.', 'Każdy wiersz: `sumy[k] = sumy.get(k, 0) + kwota`.'],
  }),
  pyTask({
    id: 'ar-a-4',
    skill: 'cs-sheet-analysis',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Napisz funkcję `srednia_kroczaca(t, k)`, która zwraca listę średnich z każdych k kolejnych wartości (pierwsza średnia z t[0..k−1], druga z t[1..k] itd.), zaokrąglonych do 2 miejsc. Tak w arkuszu liczy się trend z danych dziennych.',
    functionName: 'srednia_kroczaca',
    params: ['t', 'k'],
    types: 'list[liczba], int ≥ 1 -> list[float]',
    tests: [
      { name: 'przykład', input: [[3, 5, 7, 9], 3], expected: [5, 7] },
      { name: 'okno 2', input: [[1, 2, 3, 4, 5], 2], expected: [1.5, 2.5, 3.5, 4.5] },
      { name: 'temperatury', input: [[10, 11, 15, 20, 18, 12], 3], expected: [12, 15.33, 17.67, 16.67] },
      { name: 'jedno okno', input: [[1, 1, 2], 3], expected: [1.33], hidden: true },
      { name: 'za mało danych', input: [[4, 5], 3], expected: [], hidden: true },
    ],
    model: `
      def srednia_kroczaca(t, k):
          wynik = []
          for i in range(len(t) - k + 1):
              wynik.append(round(sum(t[i:i + k]) / k, 2))
          return wynik
    `,
    hints: ['Ile jest okien długości k w liście długości n?', 'n − k + 1 (albo zero, gdy danych jest za mało).', 'Okno zaczynające się w i to wycinek `t[i:i + k]`.', 'Średnia okna: suma / k, zaokrąglona `round(…, 2)`.'],
    steps: ['Okna zaczynają się na pozycjach 0 … n − k.', 'Dla każdego okna: `round(sum(t[i:i + k]) / k, 2)`.'],
  }),
  pyTask({
    id: 'ar-a-5',
    skill: 'cs-sheet-analysis',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Zbiornik mieści `pojemnosc` litrów, na początku ma `start` litrów. Każdego dnia najpierw dopływa woda z opadów (`opady[i]` litrów, nadmiar ponad pojemność się wylewa), a potem ogród zużywa `zuzycie` litrów. Napisz funkcję `zbiornik(pojemnosc, start, zuzycie, opady)`, która zwraca numer pierwszego dnia (od 1), w którym wody zabrakło na podlanie ogrodu, albo 0, gdy nie zabrakło ani razu.',
    functionName: 'zbiornik',
    params: ['pojemnosc', 'start', 'zuzycie', 'opady'],
    types: 'int, int, int, list[int] -> int',
    tests: [
      { name: 'przykład', input: [1000, 500, 120, [0, 0, 300, 0, 0, 0, 0]], expected: 7 },
      { name: 'wystarcza', input: [1000, 1000, 100, [0, 0, 0]], expected: 0 },
      { name: 'od razu brak', input: [500, 100, 150, [0]], expected: 1 },
      { name: 'przelew', input: [800, 700, 200, [500, 0, 0, 0, 0, 100, 0]], expected: 5, hidden: true },
      { name: 'pusty na start', input: [300, 0, 50, [100, 0, 0, 40, 0]], expected: 3, hidden: true },
    ],
    model: `
      def zbiornik(pojemnosc, start, zuzycie, opady):
          woda = start
          for dzien, opad in enumerate(opady, start=1):
              woda = min(pojemnosc, woda + opad)
              if woda < zuzycie:
                  return dzien
              woda -= zuzycie
          return 0
    `,
    hints: ['W jakiej kolejności dzieją się zdarzenia jednego dnia?', 'Najpierw opady (z obcięciem do pojemności), potem podlewanie.', 'Nadmiar: `woda = min(pojemnosc, woda + opad)`.', 'Jeśli przed podlaniem wody jest mniej niż zużycie — zwróć numer dnia.'],
    steps: ['Dzień po dniu: dodajesz opad z limitem pojemności.', 'Gdy woda < zużycie, zwracasz numer dnia; inaczej odejmujesz zużycie. Koniec danych → 0.'],
  }),
  pyTask({
    id: 'ar-a-6',
    skill: 'cs-sheet-analysis',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Napisz funkcję `dni_tygodnia(daty)`, która dla listy dat w postaci „RRRR-MM-DD” zwraca listę 7 liczb: ile dat wypada w poniedziałek, wtorek, …, niedzielę. Skorzystaj z modułu `datetime`.',
    functionName: 'dni_tygodnia',
    params: ['daty'],
    types: 'list[str] -> list[int]',
    tests: [
      { name: 'kolejne dni', input: [['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28']], expected: [1, 0, 0, 1, 1, 1, 1] },
      { name: 'czwartki i wtorek', input: [['2026-01-01', '2026-01-08', '2027-05-04']], expected: [0, 1, 0, 2, 0, 0, 0] },
      { name: 'brak dat', input: [[]], expected: [0, 0, 0, 0, 0, 0, 0] },
      { name: 'rok przestępny i przełom wieków', input: [['2024-02-29', '2000-01-01', '1999-12-31', '2026-09-24']], expected: [0, 0, 0, 2, 1, 1, 0], hidden: true },
    ],
    model: `
      from datetime import date

      def dni_tygodnia(daty):
          licznik = [0] * 7
          for d in daty:
              licznik[date.fromisoformat(d).weekday()] += 1
          return licznik
    `,
    hints: ['Jak zamienić napis „RRRR-MM-DD” na datę?', '`date.fromisoformat(napis)` z modułu `datetime`.', 'Metoda `weekday()` daje 0 dla poniedziałku, 6 dla niedzieli.', 'Zwiększaj licznik o indeksie równym dniu tygodnia.'],
    steps: ['Każdy napis zamieniasz na datę przez `date.fromisoformat`.', '`weekday()` wskazuje pozycję w liście liczników (poniedziałek = 0).'],
  }),
  pyTask({
    id: 'ar-a-7',
    skill: 'cs-sheet-analysis',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Sklep ma na początku `stan` sztuk towaru. Dostawa `dostawa` sztuk przychodzi rano w dniach 1 + `co_ile`, 1 + 2·`co_ile`, … (w dniu 1 dostawy nie ma). Potem klienci chcą kupić `sprzedaz[i]` sztuk; jeśli towaru jest za mało, sprzedaje się tyle, ile jest, a dzień liczy się jako dzień z brakiem. Napisz funkcję `magazyn(stan, dostawa, co_ile, sprzedaz)`, która zwraca `[liczba dni z brakiem, stan na koniec]`.',
    functionName: 'magazyn',
    params: ['stan', 'dostawa', 'co_ile', 'sprzedaz'],
    types: 'int, int, int ≥ 1, list[int] -> list[int]',
    tests: [
      { name: 'tygodniowe dostawy', input: [20, 30, 7, [5, 5, 5, 5, 5, 5, 5, 5, 5]], expected: [3, 20] },
      { name: 'co drugi dzień', input: [10, 10, 2, [6, 6, 6, 6]], expected: [2, 0] },
      { name: 'codziennie', input: [0, 5, 1, [3, 3, 3]], expected: [1, 4] },
      { name: 'bez dostaw w okresie', input: [100, 0, 5, [10, 20, 30]], expected: [0, 40], hidden: true },
      { name: 'zmienny popyt', input: [12, 15, 3, [4, 4, 4, 4, 9, 9, 9, 2]], expected: [1, 4], hidden: true },
    ],
    model: `
      def magazyn(stan, dostawa, co_ile, sprzedaz):
          braki = 0
          for dzien, chca in enumerate(sprzedaz, start=1):
              if dzien > 1 and (dzien - 1) % co_ile == 0:
                  stan += dostawa
              sprzedano = min(stan, chca)
              if sprzedano < chca:
                  braki += 1
              stan -= sprzedano
          return [braki, stan]
    `,
    hints: ['W które dni przychodzi dostawa?', 'W dniach 1 + co_ile, 1 + 2·co_ile, … — czyli gdy (dzień − 1) dzieli się przez co_ile, poza dniem 1.', 'Najpierw dostawa, potem sprzedaż: sprzedajesz min(stan, popyt).', 'Dzień z brakiem to dzień, w którym sprzedano mniej, niż chcieli klienci.'],
    steps: ['Dzień po dniu: rano ewentualna dostawa, potem sprzedaż min(stan, popyt).', 'Liczysz dni, w których popyt przekroczył stan; na końcu zwracasz [braki, stan].'],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const SHEET_CARDS: Flashcard[] = [
  card('c-ar-f-1', 'cs-sheet-formulas', 'definicja', 'Co blokuje `$` w `$A2`, a co w `A$2`?', '`$A2` — kolumnę, `A$2` — wiersz.'),
  card('c-ar-f-2', 'cs-sheet-formulas', 'wzor', 'Kolejność argumentów SUMA.JEŻELI?', 'zakres z kryterium; kryterium; zakres do sumowania'),

  card('c-ar-a-1', 'cs-sheet-analysis', 'metoda', 'Tabela przestawna w Pythonie?', 'Słownik: `sumy[k] = sumy.get(k, 0) + x`.'),
  card('c-ar-a-2', 'cs-sheet-analysis', 'pulapka', 'Najczęstszy błąd w symulacji?', 'Kolejność reguł w jednym dniu i pomyłka o jeden dzień.'),
];

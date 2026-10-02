/**
 * Warianty odpowiedzi dla kart, które dawniej wymagały wpisania wyniku.
 *
 * Na telefonie uczeń nie ma zeszytu: zamiast liczyć w głowie i wpisywać,
 * wybiera właściwy krok spośród kilku. Złe warianty to TYPOWE błędy —
 * każdy z krótką przyczyną, żeby wybór uczył, a nie był zgadywanką.
 *
 * Wartości są „surowe” (np. `1/2`, `-32`, wynik programu) — poprawność
 * sprawdzają te same reguły co dawniej (`sprawdzWpis`, `sprawdzWynikKodu`).
 */

export interface Wariant {
  wartosc: string;
  /** Przyczyna błędu, gdy uczeń wybierze ten (zły) wariant. */
  dlaczego?: string;
}

const w = (wartosc: string, dlaczego?: string): Wariant => (dlaczego ? { wartosc, dlaczego } : { wartosc });

export const WARIANTY: Record<string, Wariant[]> = {
  // ---------------------------------------------------------------- matematyka
  'm1-potega': [
    w('1/2'),
    w('-2', 'To $2 \\cdot (-1)$. Ujemny wykładnik oznacza odwrotność, nie mnożenie.'),
    w('-1/2', 'Minus w wykładniku nie zmienia znaku liczby — daje odwrotność.'),
    w('2', 'Potęga $-1$ nie zostawia liczby bez zmian — odwraca ją.'),
  ],
  'm1-nawias': [
    w('5/2'),
    w('2', 'To $(1 + 3) \\cdot \\frac12$ — a mnożenie ma pierwszeństwo przed dodawaniem.'),
    w('4', 'Zgubione $\\cdot \\frac12$: najpierw $3 \\cdot \\frac12 = \\frac32$.'),
    w('7/2', 'Sprawdź mnożenie: $3 \\cdot \\frac12 = \\frac32$, nie $\\frac52$.'),
  ],
  'm1-odwrotnosc': [
    w('2/5'),
    w('-5/2', 'Minus w wykładniku nie daje liczby ujemnej — odwraca ułamek.'),
    w('5/2', 'Potęga $-1$ odwraca ułamek: licznik zamienia się z mianownikiem.'),
    w('-2/5', 'Odwrotność jest dobra, ale znak nie zmienia się na minus.'),
  ],
  'm1-kwadrat': [
    w('4/25'),
    w('25/4', 'To $\\left(\\frac52\\right)^{2}$ — minus w wykładniku oznacza jeszcze odwrócenie ułamka.'),
    w('-25/4', 'Minus w wykładniku nie daje liczby ujemnej.'),
    w('2/5', 'Ułamek jest odwrócony, ale brakuje podniesienia do kwadratu.'),
  ],
  'm1-p2': [
    w('5/2'),
    w('25/4', 'To liczba pod pierwiastkiem — trzeba jeszcze wyciągnąć pierwiastek.'),
    w('5/4', 'Pod pierwiastkiem $\\frac{25}{8} \\cdot 2 = \\frac{25}{4}$, a $\\sqrt{25} = 5$, $\\sqrt4 = 2$.'),
    w('5', 'Zgubiony mianownik: $\\sqrt{\\frac{25}{4}} = \\frac{5}{2}$.'),
  ],
  'm2-dane': [w('3'), w('4', '$2^4 = 16$, a nie 8.'), w('8', 'Pytamy o wykładnik, nie o wynik.'), w('2', '$2^2 = 4$.')],
  'm2-dane2': [w('4'), w('8', '$16 = 2 \\cdot 8$, ale to nie potęga.'), w('3', '$2^3 = 8$.'), w('2', '$2^2 = 4$.')],
  'm2-ujemna-l': [w('-1'), w('1', '$2^1 = 2$, a nie $\\frac12$.'), w('2', 'Pytamy o wykładnik, nie o mianownik.'), w('-2', '$2^{-2} = \\frac14$.')],
  'm2-f1': [
    w('-32'),
    w('4', 'Dodałeś $-4 + 8$. Przy potędze potęgi wykładniki MNOŻYMY.'),
    w('32', 'Zgubiony minus: $-4 \\cdot 8 = -32$.'),
    w('-12', 'Odjąłeś zamiast pomnożyć.'),
  ],
  'm2-f2': [w('48'), w('19', 'Dodałeś $3 + 16$ — przy potędze potęgi mnożymy.'), w('13', 'Odjąłeś zamiast pomnożyć.'), w('24', 'Sprawdź mnożenie: $3 \\cdot 16 = 48$.')],
  'm2-f3': [
    w('16'),
    w('-1536', 'Przy mnożeniu potęg o tej samej podstawie wykładniki DODAJEMY, nie mnożymy.'),
    w('80', 'Zgubiony minus: $-32 + 48 = 16$.'),
    w('-16', 'Sprawdź znak: $48$ jest większe niż $32$.'),
  ],
  'm2-p1': [w('5'), w('1', 'Iloraz potęg: odejmujemy wykładniki — $5^{13-12} = 5^1$.'), w('25', 'To $5^2$ — a różnica wykładników to 1.'), w('5^25', 'Przy dzieleniu wykładniki odejmujemy, nie dodajemy.')],

  // ---------------------------------------------------------------- informatyka
  'c1-slad': [w('101'), w('3', 'Zgubiony mnożnik b: kolejne cyfry są mnożone przez 1, 10, 100…'), w('111', 'Cyfra 0 daje $10 \\cdot (0 // 2) = 0$.'), w('1', 'Po trzech obrotach dochodzi jeszcze 100 za cyfrę 1.')],
  'c1-slad-l': [w('1'), w('2', '`a div 2` dla a = 2 to 1, więc dochodzi $1 \\cdot 1$.'), w('0', 'Cyfra 2 jest parzysta — wchodzi gałąź z `b * (a div 2)`.'), w('10', 'W pierwszym obrocie b = 1, nie 10.')],
  'c2-dane': [w('7'), w('6', '$b - a = 6$ — trzeba dodać 1, bo liczymy oba końce.'), w('3', 'Odejmujemy a: $4 - (-2) + 1 = 7$.'), w('8', 'Sprawdź: $4 - (-2) = 6$, plus 1.')],
  'c2-dane-l': [w('1'), w('0', 'Przedział [1, 1] zawiera jedną liczbę — dlatego wzór ma „+ 1”.'), w('2', '$1 - 1 + 1 = 1$.')],
  'c2-p2': [w('8'), w('9', 'Policz jeszcze raz cyfry nieparzyste: 7, 5, 3, 1, 1, 3, 5, 7.'), w('17', 'To liczba wszystkich cyfr — a instrukcja działa tylko dla nieparzystych.'), w('4', 'Cyfry nieparzyste występują po obu stronach zera.')],

  // „Co wypisze program?”
  'c1-kod1': [w('2\n54210'), w('0\n54210.2', '`%` daje resztę (ostatnią cyfrę), a `//` — część całkowitą.'), w('2\n54210.2', '`//` to dzielenie całkowite — bez części po kropce.'), w('54210\n2', 'Kolejność wypisywania jest taka jak w kodzie.')],
  'c1-kod2': [w('21101'), w('41101', '`a // 2` dla a = 4 to 2, więc dochodzi $10000 \\cdot 2$.'), w('11101', 'Dochodzi $b \\cdot (a // 2) = 20000$, nie 10000.'), w('20000', 'Do starego c (1101) dodajemy, a nie je zastępujemy.')],
  'c1-kod2-l': [w('2\n20000'), w('2.0\n20000', '`//` daje liczbę całkowitą.'), w('0\n20000', '`4 // 2` to 2.'), w('2\n10002', '`*` to mnożenie.')],
  'c1-p1': [w('88 8 8 436576'), w('88 8 8 4365768', '`n // 100` obcina DWIE ostatnie cyfry.'), w('8 8 8 436576', '`n % 100` daje dwie ostatnie cyfry: 88.'), w('88 88 8 436576', '`r // 10` to cyfra dziesiątek: 8.')],
  'c1-p2': [w('10 1 0'), w('10 0 1', '`r // 10` to cyfra dziesiątek (1), `r % 10` — jedności (0).'), w('0 1 0', '`n % 100` daje dwie ostatnie cyfry: 10.'), w('1 0 10', 'Kolejność w print: r, a, b.')],
  'c2-kod1': [w('True\nFalse'), w('True\nTrue', '5 jest większe od 4 — leży poza przedziałem.'), w('False\nFalse', '0 leży między −2 a 4.'), w('False\nTrue', 'Sprawdź oba warunki po kolei.')],
  'c2-kod2': [w('True'), w('False', '−3 ≤ −2 i 4 ≤ 6 — oba warunki są prawdziwe.')],
  'c2-kod3': [w('1 3'), w('1 1', 'Warunek `min1 < dlug` nie wpuszcza drugiej takiej samej liczby.'), w('3 4', 'Najmniejsza długość z przykładu to 1 (przedział E).'), w('1 4', 'Długość 3 (przedział F) jest mniejsza niż 4.')],
  'c2-kod3-l': [w('4 7'), w('7 4', 'Najmniejsza trafia do min1.'), w('4 4', 'Stara najmniejsza (7) przechodzi do min2.'), w('4 1000000000', 'Po 4 do min2 trafia poprzednia najmniejsza, czyli 7.')],
  'c2-p1': [w('nieparzysta'), w('parzysta', '7 % 2 = 1, więc warunek `== 0` jest fałszywy.')],
};

/** Wartość do wyświetlenia: ułamki i potęgi jako wzór, wynik kodu bez zmian. */
export function pokazWartosc(v: string): string {
  if (v.includes('\n') || /[A-Za-z]{3,}/.test(v)) return v;
  const ulamek = /^(-?)(\d+)\/(\d+)$/.exec(v);
  if (ulamek) return `$${ulamek[1] ? '-' : ''}\\dfrac{${ulamek[2]}}{${ulamek[3]}}$`;
  const potega = /^(-?\d+)\^(-?\d+)$/.exec(v);
  if (potega) return `$${potega[1]}^{${potega[2]}}$`;
  if (/^-?\d+$/.test(v)) return `$${v}$`;
  return v;
}

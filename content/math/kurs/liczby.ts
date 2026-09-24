import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 1: Liczby rzeczywiste (poziom podstawowy).
 *
 * Rachunkowy fundament całej matury - kurs zaczyna się tutaj, bo każde
 * późniejsze zadanie kończy się rachunkiem na ułamkach, potęgach albo
 * procentach. Treść autorska, pisana pod wymagania CKE; `verified: false`
 * do czasu sprawdzenia przez nauczyciela.
 */

const r = String.raw;

export const NUMBERS_TOPIC: Topic = {
  id: 'math-numbers',
  subjectId: 'math',
  name: 'Liczby rzeczywiste',
  summary:
    'Ułamki, potęgi, pierwiastki, procenty, wartość bezwzględna i przybliżenia — rachunkowy fundament całej matury.',
};

export const NUMBERS_SKILLS: Skill[] = [
  {
    id: 'num-order',
    topicId: 'math-numbers',
    name: 'Ułamki i kolejność działań',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — działania na ułamkach, kolejność wykonywania działań',
    prerequisites: [],
    examValue: 0.6,
  },
  {
    id: 'num-powers',
    topicId: 'math-numbers',
    name: 'Potęgi o wykładniku całkowitym',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — prawa działań na potęgach o wykładniku całkowitym',
    prerequisites: ['num-order'],
    examValue: 0.7,
  },
  {
    id: 'num-roots',
    topicId: 'math-numbers',
    name: 'Pierwiastki i wykładnik wymierny',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — pierwiastki, potęgi o wykładniku wymiernym',
    prerequisites: ['num-powers'],
    examValue: 0.75,
  },
  {
    id: 'num-percent',
    topicId: 'math-numbers',
    name: 'Procenty i punkty procentowe',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — obliczenia procentowe, punkty procentowe',
    prerequisites: ['num-order'],
    examValue: 0.8,
  },
  {
    id: 'num-abs',
    topicId: 'math-numbers',
    name: 'Wartość bezwzględna i przedziały',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — wartość bezwzględna, przedziały na osi liczbowej',
    prerequisites: ['num-order'],
    examValue: 0.6,
  },
  {
    id: 'num-approx',
    topicId: 'math-numbers',
    name: 'Przybliżenia, błąd i notacja wykładnicza',
    level: 'PP',
    ckeRequirement: 'Liczby rzeczywiste — przybliżenia, błąd bezwzględny i względny, notacja wykładnicza',
    prerequisites: ['num-percent', 'num-powers'],
    examValue: 0.5,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const NUMBERS_LESSONS: Lesson[] = [
  {
    skillId: 'num-order',
    minutes: 10,
    intro:
      'Każde zadanie maturalne kończy się rachunkiem. Jeśli ułamki i kolejność działań sprawiają kłopot, tracisz punkty nawet wtedy, gdy pomysł na zadanie był dobry. To jest fundament pod wszystko, co dalej.',
    blocks: [
      p(
        'Kolejność działań działa jak kolejka z pierwszeństwem: najpierw nawiasy, potem potęgi i pierwiastki, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie.',
      ),
      tip(
        r`Mnożenie i dzielenie są równorzędne — liczysz je po kolei od lewej. Tak samo dodawanie i odejmowanie. $12 : 3 \cdot 2 = 4 \cdot 2 = 8$, a nie $12 : 6 = 2$.`,
      ),
      p(
        'Ułamki dodajesz dopiero wtedy, gdy mają ten sam mianownik — jak kawałki pizzy tej samej wielkości. Dlatego najpierw sprowadzasz je do wspólnego mianownika.',
      ),
      f(r`\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}`, 'dodawanie ułamków'),
      p(
        'Mnożenie jest prostsze: licznik razy licznik, mianownik razy mianownik. Dzielenie to mnożenie przez odwrotność — ułamek, przez który dzielisz, obracasz do góry nogami.',
      ),
      f(r`\frac{a}{b} \cdot \frac{c}{d} = \frac{ac}{bd} \qquad \frac{a}{b} : \frac{c}{d} = \frac{a}{b} \cdot \frac{d}{c}`),
      warn(
        r`Liczba mieszana $2\frac{1}{3}$ to $2 + \frac{1}{3} = \frac{7}{3}$, a nie $2 \cdot \frac{1}{3}$. Przed mnożeniem zamień ją na ułamek niewłaściwy.`,
      ),
    ],
    examples: [
      example(
        r`Oblicz $\frac{2}{3} + \frac{1}{4}$.`,
        [
          r`Wspólny mianownik to $12$ — najmniejsza liczba podzielna przez $3$ i przez $4$.`,
          [
            r`$\frac{2}{3} = \frac{8}{12}$, a $\frac{1}{4} = \frac{3}{12}$.`,
            'Licznik i mianownik mnożymy przez tę samą liczbę — wartość ułamka się nie zmienia.',
          ],
          r`$\frac{8}{12} + \frac{3}{12} = \frac{11}{12}$.`,
        ],
        r`$\frac{11}{12}$`,
      ),
      example(
        r`Oblicz $3 - 2 \cdot \left(\frac{1}{2}\right)^2 : \frac{1}{4}$.`,
        [
          r`Najpierw potęga: $\left(\frac{1}{2}\right)^2 = \frac{1}{4}$.`,
          [
            r`Mnożenie i dzielenie od lewej: $2 \cdot \frac{1}{4} = \frac{1}{2}$, potem $\frac{1}{2} : \frac{1}{4} = \frac{1}{2} \cdot 4 = 2$.`,
            'Dzielenie przez ułamek to mnożenie przez jego odwrotność.',
          ],
          r`Na końcu odejmowanie: $3 - 2 = 1$.`,
        ],
        r`$1$`,
      ),
    ],
    pitfalls: [
      r`Dodawanie osobno liczników i mianowników: $\frac{1}{2} + \frac{1}{3} \ne \frac{2}{5}$.`,
      r`Liczenie od lewej bez pierwszeństwa: w $2 + 3 \cdot 4$ najpierw jest mnożenie.`,
      r`Zgubiony minus przed nawiasem: $5 - (2 - 7) = 5 - 2 + 7$.`,
    ],
  },
  {
    skillId: 'num-powers',
    minutes: 10,
    intro:
      'Potęgi są wszędzie: we wzorach na pole i objętość, w procencie składanym, w funkcji wykładniczej i w logarytmach. Kilka praw działań na potęgach wystarczy, żeby liczyć je bez kalkulatora.',
    blocks: [
      p(
        r`$a^n$ to skrót: $a$ pomnożone przez siebie $n$ razy. $2^3 = 2 \cdot 2 \cdot 2 = 8$. Liczba $a$ to podstawa, a $n$ to wykładnik.`,
      ),
      f(
        r`a^m \cdot a^n = a^{m+n} \qquad a^m : a^n = a^{m-n}`,
        'ta sama podstawa: przy mnożeniu wykładniki dodajesz, przy dzieleniu odejmujesz',
      ),
      f(r`(a^m)^n = a^{m \cdot n} \qquad (a \cdot b)^n = a^n \cdot b^n`, 'potęga potęgi i potęga iloczynu'),
      p(
        r`Skąd wykładnik zero i ujemny? Z dzielenia: $\frac{2^3}{2^3} = 2^{0}$, a to jest $1$. A $\frac{2^1}{2^3} = 2^{-2}$, czyli $\frac{2}{8} = \frac{1}{4}$.`,
      ),
      f(r`a^0 = 1 \qquad a^{-n} = \frac{1}{a^n} \qquad (a \ne 0)`),
      warn(
        r`$(-2)^2 = 4$, ale $-2^2 = -4$. Minus bez nawiasu nie jest częścią podstawy — potęgujesz tylko $2$.`,
      ),
    ],
    examples: [
      example(
        r`Oblicz $\frac{2^5 \cdot 2^{-2}}{2^2}$.`,
        [
          r`W liczniku ta sama podstawa: $2^5 \cdot 2^{-2} = 2^{5 + (-2)} = 2^3$.`,
          r`Dzielenie: $\frac{2^3}{2^2} = 2^{3-2} = 2^1 = 2$.`,
        ],
        r`$2$`,
      ),
      example(
        r`Oblicz $\left(\frac{2}{3}\right)^{-2}$.`,
        [
          [
            r`Wykładnik ujemny odwraca ułamek: $\left(\frac{2}{3}\right)^{-2} = \left(\frac{3}{2}\right)^2$.`,
            r`Bo $a^{-n} = \frac{1}{a^n}$, a jeden przez ułamek to ułamek odwrócony.`,
          ],
          r`$\left(\frac{3}{2}\right)^2 = \frac{9}{4}$.`,
        ],
        r`$\frac{9}{4}$`,
      ),
    ],
    pitfalls: [
      r`$2^3 \cdot 2^4 = 2^7$, a nie $2^{12}$ — przy mnożeniu wykładniki się dodaje.`,
      r`$a^{-2}$ to nie liczba ujemna: $2^{-2} = \frac{1}{4} > 0$.`,
      r`Prawa działają tylko przy tej samej podstawie: $2^3 \cdot 3^2$ liczysz osobno.`,
    ],
  },
  {
    skillId: 'num-roots',
    minutes: 12,
    intro:
      'Pierwiastki pojawiają się w geometrii (przekątna kwadratu, wysokość trójkąta), w równaniach kwadratowych i w funkcjach. Tu nauczysz się je upraszczać i zamieniać na potęgi — wtedy działają dla nich te same prawa co wcześniej.',
    blocks: [
      p(
        r`$\sqrt{a}$ to taka nieujemna liczba, która podniesiona do kwadratu daje $a$. $\sqrt{49} = 7$, bo $7^2 = 49$. Pierwiastek sześcienny $\sqrt[3]{a}$ podniesiony do sześcianu daje $a$: $\sqrt[3]{8} = 2$.`,
      ),
      f(
        r`\sqrt{a \cdot b} = \sqrt{a} \cdot \sqrt{b} \qquad \sqrt{\frac{a}{b}} = \frac{\sqrt{a}}{\sqrt{b}}`,
        'dla liczb nieujemnych (w dzieleniu mianownik różny od zera)',
      ),
      p(
        r`Upraszczanie to wyciąganie przed pierwiastek największego kwadratu: $\sqrt{50} = \sqrt{25 \cdot 2} = 5\sqrt{2}$. Szukasz w liczbie czynnika $4, 9, 16, 25, 36, 49, 64, 81, 100\ldots$`,
      ),
      p('Pierwiastek to potęga o wykładniku ułamkowym. Mianownik ułamka mówi, jaki to pierwiastek:'),
      f(r`a^{\frac{1}{n}} = \sqrt[n]{a} \qquad a^{\frac{m}{n}} = \sqrt[n]{a^m}`),
      p(
        r`Usuwanie niewymierności z mianownika: mnożysz licznik i mianownik przez ten sam pierwiastek. $\frac{6}{\sqrt{3}} = \frac{6\sqrt{3}}{3} = 2\sqrt{3}$.`,
      ),
      warn(
        r`$\sqrt{a + b} \ne \sqrt{a} + \sqrt{b}$. Sprawdź: $\sqrt{9 + 16} = \sqrt{25} = 5$, a $\sqrt{9} + \sqrt{16} = 7$.`,
      ),
    ],
    examples: [
      example(
        r`Uprość $\sqrt{72}$.`,
        [
          r`Szukam największego kwadratu, który dzieli $72$: to $36$, bo $72 = 36 \cdot 2$.`,
          r`$\sqrt{72} = \sqrt{36} \cdot \sqrt{2} = 6\sqrt{2}$.`,
        ],
        r`$6\sqrt{2}$`,
      ),
      example(
        r`Oblicz $27^{\frac{2}{3}}$.`,
        [
          [
            r`Mianownik $3$ to pierwiastek sześcienny: $\sqrt[3]{27} = 3$.`,
            'Najpierw pierwiastek, potem potęga — liczby zostają małe.',
          ],
          r`Licznik $2$ to kwadrat: $3^2 = 9$.`,
        ],
        r`$9$`,
      ),
    ],
    pitfalls: [
      r`$\sqrt{a+b}$ to nie $\sqrt{a} + \sqrt{b}$.`,
      r`$\sqrt{x^2} = |x|$, a nie $x$ — pierwiastek kwadratowy nigdy nie jest ujemny.`,
      r`W $a^{\frac{2}{3}}$ mianownik to stopień pierwiastka, a licznik — potęga, nie odwrotnie.`,
    ],
  },
  {
    skillId: 'num-percent',
    minutes: 12,
    intro:
      'Procenty to najczęstszy temat „z życia” na maturze podstawowej: podwyżki, obniżki, lokaty, wyniki wyborów. Najważniejsza umiejętność: wiedzieć, OD CZEGO liczysz procent.',
    blocks: [
      p(
        r`Procent to setna część: $1\% = \frac{1}{100} = 0{,}01$. Żeby policzyć $p\%$ liczby $a$, mnożysz: $\frac{p}{100} \cdot a$. $15\%$ z $80$ to $0{,}15 \cdot 80 = 12$.`,
      ),
      p(
        r`Podwyżka o $p\%$ to mnożenie przez $\left(1 + \frac{p}{100}\right)$, obniżka — przez $\left(1 - \frac{p}{100}\right)$. Cena $200$ zł po podwyżce o $10\%$: $200 \cdot 1{,}1 = 220$ zł.`,
      ),
      f(
        r`a \cdot \left(1 + \frac{p}{100}\right) \qquad a \cdot \left(1 - \frac{p}{100}\right)`,
        'cena po podwyżce i po obniżce o p procent',
      ),
      tip(
        r`Dwie zmiany procentowe liczysz jedna po drugiej, mnożąc: podwyżka o $10\%$, a potem obniżka o $10\%$ to $1{,}1 \cdot 0{,}9 = 0{,}99$ — cena SPADŁA o $1\%$, a nie wróciła do punktu wyjścia.`,
      ),
      p(
        r`Jaki procent stanowi $a$ z $b$? Dzielisz i mnożysz przez $100\%$: $\frac{a}{b} \cdot 100\%$. $12$ z $48$ to $\frac{12}{48} \cdot 100\% = 25\%$.`,
      ),
      p(
        r`Punkty procentowe to różnica dwóch procentów. Poparcie wzrosło z $20\%$ do $25\%$: to wzrost o $5$ punktów procentowych, ale o $25\%$ — bo $5$ to ćwierć z $20$.`,
      ),
      warn(
        r`Cena po obniżce o $20\%$ to $80\%$ ceny pierwotnej. Żeby wrócić do ceny pierwotnej, dzielisz przez $0{,}8$ — nie dodajesz $20\%$ nowej ceny.`,
      ),
    ],
    examples: [
      example(
        r`Kurtka po obniżce o $30\%$ kosztuje $210$ zł. Ile kosztowała przed obniżką?`,
        [
          r`Po obniżce o $30\%$ zostaje $70\%$ ceny: $0{,}7 \cdot x = 210$.`,
          [r`$x = \frac{210}{0{,}7} = 300$.`, 'Dzielimy, bo szukamy liczby, której 70% znamy.'],
          r`Sprawdzenie: $30\%$ z $300$ to $90$, a $300 - 90 = 210$.`,
        ],
        r`$300$ zł`,
      ),
      example(
        r`Cenę podniesiono o $20\%$, a potem obniżono o $20\%$. O ile procent zmieniła się cena?`,
        [
          r`Po podwyżce: $x \cdot 1{,}2$.`,
          r`Po obniżce: $x \cdot 1{,}2 \cdot 0{,}8 = 0{,}96x$.`,
          r`$0{,}96x$ to $96\%$ ceny początkowej, więc cena spadła o $4\%$.`,
        ],
        r`spadła o $4\%$`,
      ),
    ],
    pitfalls: [
      'Liczenie drugiej zmiany procentowej od ceny pierwotnej zamiast od ceny po pierwszej zmianie.',
      'Mylenie procentów z punktami procentowymi.',
      'Szukanie ceny sprzed obniżki przez dodanie procentu do ceny po obniżce.',
    ],
  },
  {
    skillId: 'num-abs',
    minutes: 12,
    intro:
      'Wartość bezwzględna to odległość od zera na osi liczbowej. Ta jedna myśl rozwiązuje większość zadań z modułem — także nierówności, których rozwiązania zapisuje się przedziałami.',
    blocks: [
      p(
        r`$|x|$ mówi, jak daleko od zera leży $x$ — bez względu na kierunek. $|5| = 5$ i $|-5| = 5$, bo obie liczby są $5$ kroków od zera.`,
      ),
      f(r`|x| = \begin{cases} x, & x \ge 0 \\ -x, & x < 0 \end{cases}`),
      p(
        r`$|x - a|$ to odległość między $x$ a $a$. Równanie $|x - 3| = 2$ pyta: które liczby leżą $2$ kroki od $3$? Odpowiedź: $1$ i $5$.`,
      ),
      p(
        r`Przedział to kawałek osi. $\langle 1, 5 \rangle$ — końce należą (kropka zamalowana), $(1, 5)$ — końce nie należą (kropka pusta).`,
      ),
      f(r`|x - a| \le r \iff x \in \langle a - r,\ a + r \rangle`, 'liczby odległe od a najwyżej o r'),
      f(
        r`|x - a| > r \iff x \in (-\infty,\ a - r) \cup (a + r,\ +\infty)`,
        'liczby odległe od a o więcej niż r',
      ),
      warn(
        r`$|x + 2| = |x - (-2)|$ — to odległość od $-2$, a nie od $2$. Zamień plus na „minus minus”, zanim odczytasz środek.`,
      ),
    ],
    examples: [
      example(
        r`Rozwiąż $|x - 4| \le 3$.`,
        [
          r`To liczby, które są od $4$ w odległości najwyżej $3$.`,
          r`Od $4$ w lewo o $3$: $1$. W prawo o $3$: $7$.`,
          [
            r`$x \in \langle 1, 7 \rangle$.`,
            r`Nawiasy ostre (domknięte), bo przy $\le$ końce też spełniają nierówność.`,
          ],
        ],
        r`$x \in \langle 1, 7 \rangle$`,
      ),
      example(
        r`Rozwiąż $|x + 1| > 2$.`,
        [
          r`$|x + 1| = |x - (-1)|$ — odległość od $-1$.`,
          r`Liczby odległe od $-1$ o więcej niż $2$ leżą na lewo od $-3$ albo na prawo od $1$.`,
          r`$x \in (-\infty, -3) \cup (1, +\infty)$.`,
        ],
        r`$x \in (-\infty, -3) \cup (1, +\infty)$`,
      ),
    ],
    pitfalls: [
      r`$|x+2|$ to odległość od $-2$, nie od $2$.`,
      r`Przy $\le$ i $\ge$ końce należą do przedziału (nawias ostry), przy $<$ i $>$ — nie.`,
      r`$|a - b| = |b - a|$ — odległość nie zależy od kolejności.`,
    ],
  },
  {
    skillId: 'num-approx',
    minutes: 10,
    intro:
      'Na maturze często trzeba podać wynik z dokładnością do części dziesiątych albo policzyć, jak bardzo przybliżenie różni się od prawdy. Notacja wykładnicza pozwala zapisać bardzo duże i bardzo małe liczby bez gubienia zer.',
    blocks: [
      p(
        r`Zaokrąglanie do części dziesiątych: patrzysz tylko na cyfrę setnych. $0$–$4$: zostawiasz, $5$–$9$: podnosisz. $3{,}14 \approx 3{,}1$, a $2{,}75 \approx 2{,}8$.`,
      ),
      p(
        r`Błąd bezwzględny mówi, o ile się pomyliłeś: $|x - x_0|$, gdzie $x$ to wartość dokładna, a $x_0$ przybliżenie. Błąd względny mówi, jak duża to pomyłka w stosunku do całości:`,
      ),
      f(r`\Delta = |x - x_0| \qquad \delta = \frac{|x - x_0|}{|x|} \cdot 100\%`),
      tip(
        r`Pomyłka o $1$ zł przy cenie $10$ zł (błąd względny $10\%$) to co innego niż pomyłka o $1$ zł przy cenie $1000$ zł ($0{,}1\%$). Dlatego liczy się błąd względny.`,
      ),
      p(
        r`Notacja wykładnicza: $a \cdot 10^k$, gdzie $1 \le a < 10$. $45\,000 = 4{,}5 \cdot 10^4$, a $0{,}003 = 3 \cdot 10^{-3}$. Wykładnik mówi, o ile miejsc przesuwasz przecinek.`,
      ),
      warn(
        r`W notacji wykładniczej pierwszy czynnik jest od $1$ do mniej niż $10$: $45 \cdot 10^3$ to poprawna liczba, ale nie jest zapisana w notacji wykładniczej.`,
      ),
    ],
    examples: [
      example(
        r`Liczbę $\frac{1}{3}$ przybliżono do $0{,}33$. Oblicz błąd względny w procentach.`,
        [
          r`Błąd bezwzględny: $\left|\frac{1}{3} - \frac{33}{100}\right| = \left|\frac{100}{300} - \frac{99}{300}\right| = \frac{1}{300}$.`,
          [
            r`Błąd względny: $\frac{1}{300} : \frac{1}{3} = \frac{1}{300} \cdot 3 = \frac{1}{100}$.`,
            'Dzielimy przez wartość DOKŁADNĄ, nie przez przybliżenie.',
          ],
          r`$\frac{1}{100} = 1\%$.`,
        ],
        r`$1\%$`,
      ),
      example(
        r`Zapisz $0{,}00072 \cdot 10^{8}$ w notacji wykładniczej.`,
        [
          r`$0{,}00072 = 7{,}2 \cdot 10^{-4}$ — przecinek przesunięty o $4$ miejsca w prawo.`,
          r`$7{,}2 \cdot 10^{-4} \cdot 10^{8} = 7{,}2 \cdot 10^{4}$.`,
        ],
        r`$7{,}2 \cdot 10^{4}$`,
      ),
    ],
    pitfalls: [
      'Błąd względny dzielisz przez wartość dokładną, nie przez przybliżenie.',
      r`Zaokrąglanie łańcuchowe ($2{,}449 \to 2{,}45 \to 2{,}5$) jest błędem: patrzysz tylko na pierwszą odrzucaną cyfrę.`,
      r`W notacji wykładniczej pierwszy czynnik należy do $\langle 1, 10)$.`,
    ],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const NUMBERS_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // num-order
  // -------------------------------------------------------------------------
  numeric({
    id: 'n-order-1',
    skill: 'num-order',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\frac{1}{2} + \frac{1}{3}$. Wynik możesz podać jako ułamek, np. 3/7.`,
    answer: '5/6',
    tolerance: 0.001,
    verify: () => 1 / 2 + 1 / 3,
    hints: [
      'Czy te ułamki mają ten sam mianownik?',
      r`Sprowadź oba ułamki do mianownika $6$.`,
      r`$\frac{1}{2} = \frac{3}{6}$, a $\frac{1}{3} = \frac{2}{6}$.`,
      r`$\frac{3}{6} + \frac{2}{6}$ — dodaj liczniki, mianownik zostaje.`,
    ],
    steps: [
      r`Wspólny mianownik to $6$.`,
      r`$\frac{1}{2} = \frac{3}{6}$, $\frac{1}{3} = \frac{2}{6}$.`,
      r`$\frac{3}{6} + \frac{2}{6} = \frac{5}{6}$.`,
    ],
    errors: [
      [['2/5', '0.4'], 'Dodane osobno liczniki i mianowniki.', 'Ułamki dodaje się po sprowadzeniu do wspólnego mianownika.'],
      [['1/6'], 'Ułamki pomnożone zamiast dodane.', r`Znak $+$ to dodawanie: wspólny mianownik, potem suma liczników.`],
    ],
  }),
  numeric({
    id: 'n-order-2',
    skill: 'num-order',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $2 + 3 \cdot 4 - 6 : 2$.`,
    answer: 11,
    verify: () => 2 + 3 * 4 - 6 / 2,
    hints: [
      'Które działania wykonujesz przed dodawaniem i odejmowaniem?',
      r`Najpierw $3 \cdot 4$ i $6 : 2$.`,
      r`$3 \cdot 4 = 12$ oraz $6 : 2 = 3$.`,
      r`Zostało $2 + 12 - 3$.`,
    ],
    steps: [
      r`Mnożenie i dzielenie mają pierwszeństwo: $3 \cdot 4 = 12$, $6 : 2 = 3$.`,
      r`$2 + 12 - 3 = 11$.`,
    ],
    errors: [
      ['7', 'Działania wykonane po kolei od lewej, bez pierwszeństwa mnożenia i dzielenia.', 'Mnożenie i dzielenie wykonuje się przed dodawaniem i odejmowaniem.'],
    ],
  }),
  choice({
    id: 'n-order-3',
    skill: 'num-order',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wartość wyrażenia $\frac{3}{4} \cdot \frac{2}{9}$ jest równa`,
    choices: [r`$\frac{1}{6}$`, r`$\frac{5}{13}$`, r`$\frac{27}{8}$`, r`$\frac{6}{13}$`],
    answer: 'A',
    verify: () => (3 / 4) * (2 / 9),
    hints: [
      'Co robisz z licznikami, a co z mianownikami przy mnożeniu ułamków?',
      'Licznik razy licznik, mianownik razy mianownik.',
      r`$\frac{3 \cdot 2}{4 \cdot 9}$ — zanim policzysz, możesz skrócić.`,
      r`$\frac{6}{36}$ — skróć przez $6$.`,
    ],
    steps: [r`$\frac{3}{4} \cdot \frac{2}{9} = \frac{6}{36}$.`, r`$\frac{6}{36} = \frac{1}{6}$.`],
    errors: [
      ['B', 'Dodane liczniki i mianowniki zamiast pomnożone.', 'Przy mnożeniu ułamków mnożysz licznik przez licznik i mianownik przez mianownik.'],
      ['C', 'Wykonane dzielenie zamiast mnożenia.', r`Znak $\cdot$ oznacza mnożenie; dzielenie to $:$.`],
      ['D', 'Liczniki pomnożone, a mianowniki dodane.', 'W mnożeniu ułamków obie części traktujesz tak samo — mnożysz.'],
    ],
  }),
  numeric({
    id: 'n-order-4',
    skill: 'num-order',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\left(\frac{2}{3} - \frac{1}{2}\right) : \frac{1}{6}$.`,
    answer: 1,
    verify: () => (2 / 3 - 1 / 2) / (1 / 6),
    hints: [
      'Co jest w nawiasie i od czego zaczynasz?',
      r`Nawias: sprowadź $\frac{2}{3}$ i $\frac{1}{2}$ do mianownika $6$.`,
      'Dzielenie przez ułamek to mnożenie przez jego odwrotność.',
      r`W nawiasie wychodzi $\frac{1}{6}$. Zostało $\frac{1}{6} : \frac{1}{6}$.`,
    ],
    steps: [
      r`$\frac{2}{3} - \frac{1}{2} = \frac{4}{6} - \frac{3}{6} = \frac{1}{6}$.`,
      r`$\frac{1}{6} : \frac{1}{6} = \frac{1}{6} \cdot 6 = 1$.`,
    ],
    errors: [
      [['1/36'], 'Dzielenie wykonane jak mnożenie.', 'Dzielenie przez ułamek to mnożenie przez jego odwrotność.'],
    ],
  }),
  numeric({
    id: 'n-order-5',
    skill: 'num-order',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $2\frac{1}{2} \cdot \frac{4}{5}$.`,
    answer: 2,
    verify: () => (2 + 1 / 2) * (4 / 5),
    hints: [
      r`Czym jest liczba mieszana $2\frac{1}{2}$ — sumą czy iloczynem?`,
      r`$2\frac{1}{2} = 2 + \frac{1}{2}$. Zamień ją na ułamek niewłaściwy.`,
      r`$2\frac{1}{2} = \frac{5}{2}$.`,
      r`$\frac{5}{2} \cdot \frac{4}{5}$ — skróć przed mnożeniem.`,
    ],
    steps: [r`$2\frac{1}{2} = \frac{5}{2}$.`, r`$\frac{5}{2} \cdot \frac{4}{5} = \frac{20}{10} = 2$.`],
    errors: [
      [['4/5', '0.8'], r`Liczba mieszana odczytana jako iloczyn $2 \cdot \frac{1}{2}$.`, r`$2\frac{1}{2} = 2 + \frac{1}{2}$ — to suma części całkowitej i ułamkowej.`],
      [['2.4', '12/5'], 'Pomnożona tylko część ułamkowa liczby mieszanej.', 'Przed mnożeniem zamień liczbę mieszaną na ułamek niewłaściwy.'],
    ],
  }),
  choice({
    id: 'n-order-6',
    skill: 'num-order',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Liczba $\dfrac{0{,}5 + \frac{1}{4}}{1 - \frac{1}{4}}$ jest równa`,
    choices: [r`$1$`, r`$1{,}5$`, r`$0{,}5$`, r`$\frac{9}{16}$`],
    answer: 'A',
    verify: () => (0.5 + 1 / 4) / (1 - 1 / 4),
    hints: [
      'Co trzeba policzyć najpierw: licznik, mianownik, czy od razu podzielić?',
      r`Kreska ułamkowa działa jak nawias: osobno licznik, osobno mianownik.`,
      r`$0{,}5 = \frac{1}{2}$, więc licznik to $\frac{1}{2} + \frac{1}{4}$.`,
      r`Licznik i mianownik wychodzą równe $\frac{3}{4}$.`,
    ],
    steps: [
      r`Licznik: $\frac{1}{2} + \frac{1}{4} = \frac{3}{4}$.`,
      r`Mianownik: $1 - \frac{1}{4} = \frac{3}{4}$.`,
      r`$\frac{3}{4} : \frac{3}{4} = 1$.`,
    ],
    errors: [
      ['B', r`Ułamek $\frac{1}{4}$ zamieniony na $0{,}4$ zamiast $0{,}25$.`, r`$\frac{1}{4} = 1 : 4 = 0{,}25$.`],
      ['C', 'Podzielony tylko fragment — kreska ułamkowa potraktowana jak zwykły znak dzielenia bez nawiasów.', 'Kreska ułamkowa obejmuje cały licznik i cały mianownik.'],
      ['D', 'Licznik pomnożony przez mianownik zamiast przez niego podzielony.', 'Kreska ułamkowa oznacza dzielenie.'],
    ],
  }),
  numeric({
    id: 'n-order-7',
    skill: 'num-order',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Kasia wydała $\frac{1}{3}$ kieszonkowego na książkę, a $\frac{1}{4}$ tego, co jej zostało — na kino. Jaka część kieszonkowego jej została? Podaj ułamek.`,
    answer: '1/2',
    variants: ['0.5'],
    tolerance: 0.001,
    verify: () => {
      const left = 1 - 1 / 3;
      return left - left / 4;
    },
    hints: [
      'Od jakiej kwoty liczysz ćwiartkę wydaną na kino — od całego kieszonkowego?',
      r`Po książce zostało $\frac{2}{3}$ kieszonkowego.`,
      r`Kino kosztowało $\frac{1}{4}$ z $\frac{2}{3}$, czyli $\frac{1}{4} \cdot \frac{2}{3}$.`,
      r`$\frac{2}{3} - \frac{1}{6}$ — sprowadź do wspólnego mianownika.`,
    ],
    steps: [
      r`Po książce zostało $1 - \frac{1}{3} = \frac{2}{3}$.`,
      r`Kino: $\frac{1}{4} \cdot \frac{2}{3} = \frac{1}{6}$.`,
      r`Zostało $\frac{2}{3} - \frac{1}{6} = \frac{4}{6} - \frac{1}{6} = \frac{3}{6} = \frac{1}{2}$.`,
    ],
    errors: [
      [['5/12'], 'Ćwiartka policzona od całego kieszonkowego, a nie od tego, co zostało.', r`„$\frac{1}{4}$ tego, co zostało” to $\frac{1}{4}$ z reszty, nie z całości.`],
    ],
  }),
  numeric({
    id: 'n-order-8',
    skill: 'num-order',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Oblicz $\dfrac{\frac{1}{2} - \frac{1}{3}}{\frac{1}{3} - \frac{1}{4}}$.`,
    answer: 2,
    verify: () => (1 / 2 - 1 / 3) / (1 / 3 - 1 / 4),
    hints: [
      'Ile wynosi osobno licznik, a ile mianownik tego piętrowego ułamka?',
      r`Licznik: wspólny mianownik $6$. Mianownik: wspólny mianownik $12$.`,
      r`Licznik to $\frac{1}{6}$, mianownik to $\frac{1}{12}$.`,
      r`$\frac{1}{6} : \frac{1}{12} = \frac{1}{6} \cdot 12$.`,
    ],
    steps: [
      r`Licznik: $\frac{3}{6} - \frac{2}{6} = \frac{1}{6}$.`,
      r`Mianownik: $\frac{4}{12} - \frac{3}{12} = \frac{1}{12}$.`,
      r`$\frac{1}{6} : \frac{1}{12} = \frac{1}{6} \cdot 12 = 2$.`,
    ],
    errors: [
      [['1/2', '0.5'], 'Iloraz odwrócony — mianownik podzielony przez licznik.', 'Kreska ułamkowa: to, co na górze, dzielisz przez to, co na dole.'],
    ],
  }),

  // -------------------------------------------------------------------------
  // num-powers
  // -------------------------------------------------------------------------
  numeric({
    id: 'n-pow-1',
    skill: 'num-powers',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $2^3 \cdot 2^2$.`,
    answer: 32,
    verify: () => 2 ** 3 * 2 ** 2,
    hints: [
      'Czy obie potęgi mają tę samą podstawę?',
      'Przy mnożeniu potęg o tej samej podstawie wykładniki się dodaje.',
      r`$2^3 \cdot 2^2 = 2^{3+2}$.`,
      r`Zostało obliczyć $2^5$.`,
    ],
    steps: [r`$2^3 \cdot 2^2 = 2^{3+2} = 2^5$.`, r`$2^5 = 32$.`],
    errors: [
      ['64', 'Wykładniki pomnożone zamiast dodane.', r`$a^m \cdot a^n = a^{m+n}$.`],
      ['1024', 'Pomnożone podstawy: wyszło $4^5$.', 'Przy mnożeniu potęg o tej samej podstawie podstawa się nie zmienia.'],
    ],
  }),
  numeric({
    id: 'n-pow-2',
    skill: 'num-powers',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $5^{-2}$. Wynik możesz podać jako ułamek, np. 1/7.`,
    answer: '1/25',
    variants: ['0.04'],
    verify: () => 5 ** -2,
    hints: [
      'Co oznacza ujemny wykładnik — liczbę ujemną czy coś innego?',
      r`$a^{-n} = \frac{1}{a^n}$.`,
      r`$5^{-2} = \frac{1}{5^2}$.`,
      r`$5^2 = 25$.`,
    ],
    steps: [r`$5^{-2} = \frac{1}{5^2}$.`, r`$\frac{1}{5^2} = \frac{1}{25}$.`],
    errors: [
      ['-25', 'Ujemny wykładnik potraktowany jak minus przed wynikiem.', r`$a^{-n} = \frac{1}{a^n}$ — wykładnik ujemny odwraca, wynik jest dodatni.`],
      ['-10', 'Podstawa pomnożona przez wykładnik.', r`Potęga to wielokrotne mnożenie przez siebie, nie iloczyn $a \cdot n$.`],
    ],
  }),
  choice({
    id: 'n-pow-3',
    skill: 'num-powers',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Liczba $\frac{3^{7}}{3^{5}}$ jest równa`,
    choices: [r`$9$`, r`$3^{\frac{7}{5}}$`, r`$1$`, r`$3^{12}$`],
    answer: 'A',
    verify: () => 3 ** 7 / 3 ** 5,
    hints: [
      'Co dzieje się z wykładnikami przy dzieleniu potęg o tej samej podstawie?',
      'Wykładniki odejmujesz.',
      r`$\frac{3^7}{3^5} = 3^{7-5}$.`,
      r`$3^2$ — policz.`,
    ],
    steps: [r`$\frac{3^7}{3^5} = 3^{7-5} = 3^2$.`, r`$3^2 = 9$.`],
    errors: [
      ['B', 'Wykładniki podzielone zamiast odjęte.', r`$a^m : a^n = a^{m-n}$.`],
      ['C', r`Podzielone podstawy ($3 : 3 = 1$) zamiast wykładników.`, 'Przy dzieleniu potęg o tej samej podstawie podstawa zostaje, zmieniają się wykładniki.'],
      ['D', 'Wykładniki dodane — tak jak przy mnożeniu.', 'Przy dzieleniu wykładniki się odejmuje.'],
    ],
  }),
  numeric({
    id: 'n-pow-4',
    skill: 'num-powers',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\left(\frac{1}{2}\right)^{-3}$.`,
    answer: 8,
    verify: () => (1 / 2) ** -3,
    hints: [
      'Co robi z ułamkiem wykładnik ujemny?',
      'Wykładnik ujemny odwraca ułamek.',
      r`$\left(\frac{1}{2}\right)^{-3} = 2^3$.`,
      r`Policz $2 \cdot 2 \cdot 2$.`,
    ],
    steps: [r`$\left(\frac{1}{2}\right)^{-3} = \left(\frac{2}{1}\right)^3 = 2^3$.`, r`$2^3 = 8$.`],
    errors: [
      ['-8', 'Minus z wykładnika przeniesiony na wynik.', 'Wykładnik ujemny odwraca podstawę, nie zmienia znaku.'],
      ['1/8', 'Pominięty minus w wykładniku.', r`$a^{-n} = \frac{1}{a^n}$ — odwrotność ułamka $\frac{1}{2}$ to $2$.`],
    ],
  }),
  numeric({
    id: 'n-pow-5',
    skill: 'num-powers',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\frac{(2^3)^2 \cdot 2^{-4}}{2^0}$.`,
    answer: 4,
    verify: () => ((2 ** 3) ** 2 * 2 ** -4) / 2 ** 0,
    hints: [
      r`Ile wynosi $(2^3)^2$ jako jedna potęga dwójki?`,
      r`Potęga potęgi: wykładniki mnożysz, $(2^3)^2 = 2^6$.`,
      r`$2^0 = 1$, więc mianownik nic nie zmienia.`,
      r`$2^6 \cdot 2^{-4} = 2^{6-4}$.`,
    ],
    steps: [
      r`$(2^3)^2 = 2^6$, a $2^0 = 1$.`,
      r`$2^6 \cdot 2^{-4} = 2^{2} = 4$.`,
    ],
    errors: [
      ['2', r`Potęga potęgi policzona przez dodanie wykładników: $(2^3)^2 = 2^5$.`, r`$(a^m)^n = a^{m \cdot n}$.`],
      ['32', r`Wykładnik podniesiony do kwadratu: $(2^3)^2 = 2^9$.`, r`$(a^m)^n = a^{m \cdot n}$, czyli $2^{3 \cdot 2}$.`],
    ],
  }),
  choice({
    id: 'n-pow-6',
    skill: 'num-powers',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wartość wyrażenia $\frac{4^{5} \cdot 2^{-3}}{8^{2}}$ jest równa`,
    choices: [r`$\frac{1}{4}$`, r`$2$`, r`$4$`, r`$128$`],
    answer: 'B',
    verify: () => (4 ** 5 * 2 ** -3) / 8 ** 2,
    hints: [
      'Jak zapisać $4$ i $8$ jako potęgi dwójki?',
      r`$4 = 2^2$, $8 = 2^3$.`,
      r`$4^5 = (2^2)^5 = 2^{10}$ i $8^2 = (2^3)^2 = 2^6$.`,
      r`$\frac{2^{10} \cdot 2^{-3}}{2^6} = 2^{10 - 3 - 6}$.`,
    ],
    steps: [
      r`$4^5 = 2^{10}$, $8^2 = 2^6$.`,
      r`$\frac{2^{10} \cdot 2^{-3}}{2^6} = 2^{10 - 3 - 6} = 2^1 = 2$.`,
    ],
    errors: [
      ['A', r`Potęga potęgi policzona przez dodanie wykładników: $4^5 = 2^{7}$.`, r`$(a^m)^n = a^{m \cdot n}$.`],
      ['C', r`Potęga potęgi policzona przez dodanie wykładników: $8^2 = 2^{5}$.`, r`$(a^m)^n = a^{m \cdot n}$.`],
      ['D', r`Zgubiony minus: $2^{-3}$ policzone jak $2^3$.`, 'Wykładnik ujemny przy mnożeniu odejmuje się od sumy wykładników.'],
    ],
  }),
  numeric({
    id: 'n-pow-7',
    skill: 'num-powers',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Liczba bakterii w próbce podwaja się co godzinę. Rano było ich $3 \cdot 2^{5}$. Ile bakterii będzie po $3$ godzinach? Podaj liczbę.`,
    answer: 768,
    verify: () => 3 * 2 ** 5 * 2 ** 3,
    hints: [
      'Przez ile mnożysz liczbę bakterii w ciągu jednej godziny — a w ciągu trzech?',
      r`Trzy podwojenia to mnożenie przez $2 \cdot 2 \cdot 2 = 2^3$.`,
      r`$3 \cdot 2^5 \cdot 2^3 = 3 \cdot 2^{8}$.`,
      r`$2^8 = 256$, zostało pomnożyć przez $3$.`,
    ],
    steps: [
      r`Po $3$ godzinach: $3 \cdot 2^5 \cdot 2^3 = 3 \cdot 2^8$.`,
      r`$3 \cdot 256 = 768$.`,
    ],
    errors: [
      ['576', r`Trzy podwojenia policzone jako mnożenie przez $6$.`, r`Podwojenie trzy razy to mnożenie przez $2^3 = 8$, nie przez $2 \cdot 3$.`],
      ['1536', 'Policzone cztery podwojenia zamiast trzech.', 'Każda godzina to jedno podwojenie.'],
    ],
  }),
  numeric({
    id: 'n-pow-8',
    skill: 'num-powers',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Oblicz $\frac{2^{10} + 2^{9}}{2^{8}}$.`,
    answer: 6,
    verify: () => (2 ** 10 + 2 ** 9) / 2 ** 8,
    hints: [
      'Czy potęgi o tej samej podstawie można dodać, dodając wykładniki?',
      r`Nie — dodawania nie da się tak skrócić. Wyłącz przed nawias wspólny czynnik $2^9$.`,
      r`$2^{10} + 2^9 = 2^9 \cdot (2 + 1)$.`,
      r`$\frac{2^9 \cdot 3}{2^8} = 2 \cdot 3$.`,
    ],
    steps: [
      r`$2^{10} + 2^9 = 2^9 \cdot 2 + 2^9 = 2^9 \cdot 3$.`,
      r`$\frac{2^9 \cdot 3}{2^8} = 2 \cdot 3 = 6$.`,
    ],
    errors: [
      ['2048', r`Suma potęg zamieniona na iloczyn: $2^{10} + 2^9 = 2^{19}$.`, r`$a^m + a^n$ nie da się zapisać jako $a^{m+n}$ — to prawo dotyczy mnożenia.`],
    ],
  }),

  // -------------------------------------------------------------------------
  // num-roots
  // -------------------------------------------------------------------------
  numeric({
    id: 'n-root-1',
    skill: 'num-roots',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\sqrt{16} + \sqrt{9}$.`,
    answer: 7,
    verify: () => Math.sqrt(16) + Math.sqrt(9),
    hints: [
      'Jaka liczba podniesiona do kwadratu daje $16$, a jaka $9$?',
      r`$\sqrt{16} = 4$, bo $4^2 = 16$.`,
      r`$\sqrt{9} = 3$.`,
      r`Zostało dodać $4 + 3$.`,
    ],
    steps: [r`$\sqrt{16} = 4$, $\sqrt{9} = 3$.`, r`$4 + 3 = 7$.`],
    errors: [
      ['5', r`Policzony pierwiastek z sumy: $\sqrt{16 + 9}$.`, r`$\sqrt{a} + \sqrt{b} \ne \sqrt{a + b}$.`],
    ],
  }),
  numeric({
    id: 'n-root-2',
    skill: 'num-roots',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $\sqrt{2} \cdot \sqrt{18}$.`,
    answer: 6,
    verify: () => Math.sqrt(2) * Math.sqrt(18),
    hints: [
      'Jak pomnożyć dwa pierwiastki kwadratowe?',
      r`$\sqrt{a} \cdot \sqrt{b} = \sqrt{a \cdot b}$.`,
      r`$\sqrt{2 \cdot 18} = \sqrt{36}$.`,
      r`Jaka liczba do kwadratu daje $36$?`,
    ],
    steps: [r`$\sqrt{2} \cdot \sqrt{18} = \sqrt{36}$.`, r`$\sqrt{36} = 6$.`],
    errors: [['36', r`Pominięty pierwiastek: $\sqrt{36}$ to nie $36$.`, r`$\sqrt{36} = 6$, bo $6^2 = 36$.`]],
  }),
  choice({
    id: 'n-root-3',
    skill: 'num-roots',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Liczba $\sqrt{48}$ jest równa`,
    choices: [r`$4\sqrt{3}$`, r`$16\sqrt{3}$`, r`$3\sqrt{4}$`, r`$24\sqrt{2}$`],
    answer: 'A',
    hints: [
      r`Jaki największy kwadrat liczby naturalnej dzieli $48$?`,
      r`$48 = 16 \cdot 3$, a $16$ to kwadrat.`,
      r`$\sqrt{48} = \sqrt{16} \cdot \sqrt{3}$.`,
      r`$\sqrt{16} = 4$.`,
    ],
    steps: [r`$48 = 16 \cdot 3$.`, r`$\sqrt{48} = \sqrt{16} \cdot \sqrt{3} = 4\sqrt{3}$.`],
    errors: [
      ['B', r`Przed pierwiastek trafiło $16$ zamiast $\sqrt{16}$.`, r`Przed pierwiastek wychodzi pierwiastek z czynnika: $\sqrt{16 \cdot 3} = \sqrt{16}\sqrt{3}$.`],
      ['C', 'Pomylone czynniki: pod pierwiastkiem został kwadrat, a przed nim reszta.', r`Pod pierwiastkiem zostaje czynnik, który NIE jest kwadratem.`],
      ['D', r`Rozkład $48 = 24 \cdot 2$ — ale $24$ nie jest kwadratem, więc nie można go wyciągnąć.`, 'Przed pierwiastek wyciąga się tylko czynnik będący kwadratem.'],
    ],
  }),
  numeric({
    id: 'n-root-4',
    skill: 'num-roots',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $8^{\frac{2}{3}}$.`,
    answer: 4,
    verify: () => 8 ** (2 / 3),
    hints: [
      r`Co oznacza mianownik $3$ w wykładniku $\frac{2}{3}$?`,
      r`Mianownik to stopień pierwiastka: najpierw $\sqrt[3]{8}$.`,
      r`$\sqrt[3]{8} = 2$.`,
      r`Licznik $2$ to kwadrat: $2^2$.`,
    ],
    steps: [r`$8^{\frac{2}{3}} = \left(\sqrt[3]{8}\right)^2$.`, r`$\sqrt[3]{8} = 2$, a $2^2 = 4$.`],
    errors: [
      [['16/3'], 'Wykładnik ułamkowy pomnożony przez podstawę.', r`$a^{\frac{m}{n}} = \sqrt[n]{a^m}$ — to pierwiastek i potęga, nie mnożenie.`],
    ],
  }),
  numeric({
    id: 'n-root-5',
    skill: 'num-roots',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Liczbę $\frac{12}{\sqrt{3}}$ zapisano w postaci $a\sqrt{3}$. Podaj $a$.`,
    answer: 4,
    verify: () => 12 / Math.sqrt(3) / Math.sqrt(3),
    hints: [
      'Przez co pomnożyć licznik i mianownik, żeby pozbyć się pierwiastka z mianownika?',
      r`Pomnóż licznik i mianownik przez $\sqrt{3}$.`,
      r`$\frac{12\sqrt{3}}{3}$.`,
      r`Skróć $12$ z $3$.`,
    ],
    steps: [
      r`$\frac{12}{\sqrt{3}} = \frac{12\sqrt{3}}{\sqrt{3} \cdot \sqrt{3}} = \frac{12\sqrt{3}}{3}$.`,
      r`$\frac{12\sqrt{3}}{3} = 4\sqrt{3}$, więc $a = 4$.`,
    ],
    errors: [
      ['12', r`Licznik pomnożony przez $\sqrt{3}$, a mianownik już nie.`, 'Licznik i mianownik mnożysz przez to samo — inaczej zmienia się wartość ułamka.'],
      ['36', r`Pierwiastek z mianownika „przeniesiony” do licznika jako mnożenie przez $3$.`, r`$\sqrt{3} \cdot \sqrt{3} = 3$, więc mianownik staje się $3$, a licznik $12\sqrt{3}$.`],
    ],
  }),
  choice({
    id: 'n-root-6',
    skill: 'num-roots',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Liczba $\left(\sqrt[3]{16} \cdot \sqrt[3]{4}\right)^{2}$ jest równa`,
    choices: [r`$8$`, r`$16$`, r`$64$`, r`$4$`],
    answer: 'B',
    verify: () => (Math.cbrt(16) * Math.cbrt(4)) ** 2,
    hints: [
      'Jak połączyć dwa pierwiastki tego samego stopnia w jeden?',
      r`$\sqrt[3]{16} \cdot \sqrt[3]{4} = \sqrt[3]{64}$.`,
      r`$\sqrt[3]{64} = 4$, bo $4^3 = 64$.`,
      r`Zostało podnieść $4$ do kwadratu.`,
    ],
    steps: [r`$\sqrt[3]{16} \cdot \sqrt[3]{4} = \sqrt[3]{64} = 4$.`, r`$4^2 = 16$.`],
    errors: [
      ['A', r`Wynik $4$ pomnożony przez $2$ zamiast podniesiony do kwadratu.`, r`Wykładnik $2$ oznacza kwadrat: $4^2 = 4 \cdot 4$.`],
      ['C', 'Pominięty pierwiastek sześcienny — iloczyn pod pierwiastkiem to jeszcze nie wynik.', r`$\sqrt[3]{64} = 4$, a nie $64$.`],
      ['D', 'Pominięte podniesienie do kwadratu.', 'Na końcu cały nawias jest do kwadratu.'],
    ],
  }),
  numeric({
    id: 'n-root-7',
    skill: 'num-roots',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Przekątna kwadratu o boku $a$ ma długość $a\sqrt{2}$. Przekątna pewnego kwadratu ma długość $\sqrt{50}$. Oblicz długość boku tego kwadratu.`,
    answer: 5,
    verify: () => Math.sqrt(50) / Math.sqrt(2),
    hints: [
      r`Jakie równanie opisuje tę sytuację?`,
      r`$a\sqrt{2} = \sqrt{50}$.`,
      r`$a = \frac{\sqrt{50}}{\sqrt{2}} = \sqrt{\frac{50}{2}}$.`,
      r`$\sqrt{25}$ — policz.`,
    ],
    steps: [r`$a\sqrt{2} = \sqrt{50}$, więc $a = \frac{\sqrt{50}}{\sqrt{2}}$.`, r`$a = \sqrt{25} = 5$.`],
    errors: [
      ['25', 'Pominięty pierwiastek na końcu.', r`$\sqrt{\frac{50}{2}} = \sqrt{25} = 5$.`],
      [['3.54', '3.5'], r`Przekątna podzielona przez $2$ zamiast przez $\sqrt{2}$.`, r`Z $a\sqrt{2} = d$ wynika $a = \frac{d}{\sqrt{2}}$.`],
    ],
  }),
  numeric({
    id: 'n-root-8',
    skill: 'num-roots',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Oblicz $\frac{\sqrt{12} + \sqrt{27}}{\sqrt{3}}$.`,
    answer: 5,
    verify: () => (Math.sqrt(12) + Math.sqrt(27)) / Math.sqrt(3),
    hints: [
      r`Czy $\sqrt{12}$ i $\sqrt{27}$ da się zapisać przy pomocy $\sqrt{3}$?`,
      r`$12 = 4 \cdot 3$, $27 = 9 \cdot 3$.`,
      r`$\sqrt{12} = 2\sqrt{3}$, $\sqrt{27} = 3\sqrt{3}$.`,
      r`$\frac{2\sqrt{3} + 3\sqrt{3}}{\sqrt{3}} = \frac{5\sqrt{3}}{\sqrt{3}}$.`,
    ],
    steps: [
      r`$\sqrt{12} = 2\sqrt{3}$, $\sqrt{27} = 3\sqrt{3}$.`,
      r`Licznik: $2\sqrt{3} + 3\sqrt{3} = 5\sqrt{3}$.`,
      r`$\frac{5\sqrt{3}}{\sqrt{3}} = 5$.`,
    ],
    errors: [
      ['13', r`Pominięte pierwiastki: policzone $\frac{12 + 27}{3}$.`, 'Pierwiastki trzeba uprościć albo zachować — nie można ich zgubić.'],
    ],
  }),

  // -------------------------------------------------------------------------
  // num-percent
  // -------------------------------------------------------------------------
  numeric({
    id: 'n-pct-1',
    skill: 'num-percent',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $15\%$ liczby $240$.`,
    answer: 36,
    verify: () => 0.15 * 240,
    hints: [
      r`Jak zapisać $15\%$ jako ułamek dziesiętny?`,
      r`$15\% = 0{,}15$.`,
      r`$15\%$ z $240$ to $0{,}15 \cdot 240$.`,
      r`Możesz liczyć: $10\%$ z $240$ to $24$, a $5\%$ to połowa tego.`,
    ],
    steps: [r`$15\% = 0{,}15$.`, r`$0{,}15 \cdot 240 = 36$.`],
    errors: [
      ['16', r`Liczba podzielona przez $15$ zamiast pomnożona przez $0{,}15$.`, r`$p\%$ liczby $a$ to $\frac{p}{100} \cdot a$.`],
      ['3600', r`Zapomniane dzielenie przez $100$.`, r`$15\% = \frac{15}{100}$, a nie $15$.`],
    ],
  }),
  numeric({
    id: 'n-pct-2',
    skill: 'num-percent',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Jakim procentem liczby $80$ jest liczba $20$? Podaj liczbę procentów.`,
    answer: 25,
    verify: () => (20 / 80) * 100,
    hints: [
      'Którą liczbę dzielisz przez którą — część przez całość, czy odwrotnie?',
      r`Część to $20$, całość to $80$: $\frac{20}{80}$.`,
      r`$\frac{20}{80} = \frac{1}{4}$.`,
      r`Zamień $\frac{1}{4}$ na procenty: pomnóż przez $100\%$.`,
    ],
    steps: [r`$\frac{20}{80} = \frac{1}{4}$.`, r`$\frac{1}{4} \cdot 100\% = 25\%$.`],
    errors: [
      ['400', r`Iloraz odwrócony: $\frac{80}{20}$ zamiast $\frac{20}{80}$.`, r`Jaki procent stanowi $a$ z $b$: $\frac{a}{b} \cdot 100\%$ — część przez całość.`],
    ],
  }),
  choice({
    id: 'n-pct-3',
    skill: 'num-percent',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Rower kosztował $1200$ zł. Po obniżce o $15\%$ kosztuje`,
    choices: [r`$180$ zł`, r`$1020$ zł`, r`$1185$ zł`, r`$1380$ zł`],
    answer: 'B',
    verify: () => 1200 * 0.85,
    hints: [
      r`Jaki procent pierwotnej ceny zostaje po obniżce o $15\%$?`,
      r`Zostaje $85\%$ ceny.`,
      r`$0{,}85 \cdot 1200$.`,
      r`$1200 - 180$ — to samo inną drogą.`,
    ],
    steps: [r`Po obniżce zostaje $85\%$ ceny.`, r`$0{,}85 \cdot 1200 = 1020$ zł.`],
    errors: [
      ['A', 'Policzona sama obniżka zamiast ceny po obniżce.', r`Cena po obniżce to cena minus obniżka: $1200 - 180$.`],
      ['C', r`Odjęte $15$ zł zamiast $15\%$.`, r`$15\%$ z $1200$ zł to $180$ zł, nie $15$ zł.`],
      ['D', r`Doliczone $15\%$ zamiast odjęte.`, r`Obniżka o $p\%$ to mnożenie przez $1 - \frac{p}{100}$.`],
    ],
  }),
  numeric({
    id: 'n-pct-4',
    skill: 'num-percent',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Po obniżce o $25\%$ telefon kosztuje $900$ zł. Ile złotych kosztował przed obniżką?`,
    answer: 1200,
    verify: () => 900 / 0.75,
    hints: [
      r`Jaki procent ceny PIERWOTNEJ stanowi $900$ zł?`,
      r`$900$ zł to $75\%$ ceny pierwotnej: $0{,}75 \cdot x = 900$.`,
      r`$x = \frac{900}{0{,}75}$.`,
      r`$\frac{900}{0{,}75} = \frac{900 \cdot 4}{3}$.`,
    ],
    steps: [r`$0{,}75x = 900$.`, r`$x = \frac{900}{0{,}75} = 1200$ zł.`],
    errors: [
      ['1125', r`Doliczone $25\%$ ceny po obniżce zamiast podzielenia przez $0{,}75$.`, r`Obniżka liczy się od ceny pierwotnej, więc wracając dzielisz przez $0{,}75$.`],
      ['675', 'Obniżka policzona drugi raz zamiast odwrócona.', r`Szukasz $x$, którego $75\%$ to $900$: $x = \frac{900}{0{,}75}$.`],
    ],
  }),
  numeric({
    id: 'n-pct-5',
    skill: 'num-percent',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Poparcie dla partii wzrosło z $20\%$ do $30\%$. O ile PROCENT wzrosło poparcie?`,
    answer: 50,
    verify: () => ((30 - 20) / 20) * 100,
    hints: [
      'Czym różni się wzrost o punkty procentowe od wzrostu o procent?',
      r`Wzrost o $10$ punktów procentowych trzeba porównać z wartością początkową.`,
      r`$\frac{30 - 20}{20} \cdot 100\%$.`,
      r`$\frac{10}{20} = \frac{1}{2}$.`,
    ],
    steps: [r`Wzrost: $30 - 20 = 10$ punktów procentowych.`, r`$\frac{10}{20} \cdot 100\% = 50\%$.`],
    errors: [
      ['10', 'Podana zmiana w punktach procentowych, a pytanie jest o procenty.', r`Zmiana procentowa to $\frac{\text{zmiana}}{\text{wartość początkowa}} \cdot 100\%$.`],
    ],
  }),
  choice({
    id: 'n-pct-6',
    skill: 'num-percent',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Cenę towaru podniesiono o $10\%$, a następnie nową cenę obniżono o $10\%$. Po tych zmianach cena jest`,
    choices: ['taka sama jak na początku', r`niższa o $1\%$ od początkowej`, r`wyższa o $1\%$ od początkowej`, r`niższa o $10\%$ od początkowej`],
    answer: 'B',
    hints: [
      'Od jakiej ceny liczona jest obniżka — od początkowej, czy od tej po podwyżce?',
      'Obniżka liczy się od WYŻSZEJ ceny, więc jest większa niż podwyżka.',
      r`Cena końcowa: $x \cdot 1{,}1 \cdot 0{,}9$.`,
      r`$1{,}1 \cdot 0{,}9 = 0{,}99$.`,
    ],
    steps: [r`Cena końcowa: $x \cdot 1{,}1 \cdot 0{,}9 = 0{,}99x$.`, r`$0{,}99x$ to $99\%$ ceny początkowej — cena spadła o $1\%$.`],
    errors: [
      ['A', r`Założenie, że $+10\%$ i $-10\%$ się znoszą.`, 'Druga zmiana liczy się od ceny po pierwszej zmianie, a nie od ceny początkowej.'],
      ['C', r`Pomylony kierunek: $0{,}99 < 1$.`, r`Iloczyn $1{,}1 \cdot 0{,}9$ jest mniejszy od $1$ — cena spadła.`],
      ['D', 'Pominięta podwyżka — policzona tylko obniżka.', 'Obie zmiany działają po kolei: najpierw mnożysz przez 1,1, potem przez 0,9.'],
    ],
  }),
  numeric({
    id: 'n-pct-7',
    skill: 'num-percent',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Lokata jest oprocentowana na $5\%$ w skali roku, a odsetki są dopisywane raz w roku. Wpłacono $2000$ zł. Ile złotych będzie na lokacie po $2$ latach? Pomiń podatek.`,
    answer: 2205,
    verify: () => 2000 * 1.05 ** 2,
    hints: [
      'Od jakiej kwoty liczone są odsetki w drugim roku?',
      r`Po roku: $2000 \cdot 1{,}05$. W drugim roku odsetki liczą się od tej kwoty.`,
      r`Po dwóch latach: $2000 \cdot 1{,}05 \cdot 1{,}05 = 2000 \cdot 1{,}05^2$.`,
      r`Po roku jest $2100$ zł; zostało doliczyć $5\%$ z $2100$.`,
    ],
    steps: [r`Po roku: $2000 \cdot 1{,}05 = 2100$ zł.`, r`Po dwóch latach: $2100 \cdot 1{,}05 = 2205$ zł.`],
    errors: [
      ['2200', 'Odsetki za drugi rok policzone od kwoty początkowej.', 'Przy kapitalizacji odsetki doliczone po roku same zarabiają w następnym roku.'],
    ],
  }),
  numeric({
    id: 'n-pct-8',
    skill: 'num-percent',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`W klasie jest $30$ uczniów, z czego $40\%$ to chłopcy. Do klasy doszło $2$ chłopców. Jaki procent uczniów stanowią teraz chłopcy? Podaj liczbę procentów.`,
    answer: 43.75,
    tolerance: 0.01,
    verify: () => (14 / 32) * 100,
    hints: [
      'Ilu chłopców i ilu uczniów jest w klasie po zmianie?',
      r`Na początku chłopców było $0{,}4 \cdot 30 = 12$.`,
      r`Teraz chłopców jest $14$, a wszystkich uczniów $32$.`,
      r`$\frac{14}{32} \cdot 100\%$.`,
    ],
    steps: [
      r`Chłopców: $0{,}4 \cdot 30 = 12$, po zmianie $14$.`,
      r`Uczniów po zmianie: $32$.`,
      r`$\frac{14}{32} \cdot 100\% = 43{,}75\%$.`,
    ],
    errors: [
      [['46.67', '46.7'], 'Liczba chłopców zwiększona, ale liczba wszystkich uczniów nie.', 'Nowi chłopcy zwiększają też liczbę wszystkich uczniów.'],
      ['42', r`Dodane $2$ punkty procentowe zamiast przeliczenia.`, 'Dwie osoby to nie dwa procent — trzeba policzyć nowy stosunek.'],
    ],
  }),

  // -------------------------------------------------------------------------
  // num-abs
  // -------------------------------------------------------------------------
  numeric({
    id: 'n-abs-1',
    skill: 'num-abs',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $|-7| + |3 - 5|$.`,
    answer: 9,
    verify: () => Math.abs(-7) + Math.abs(3 - 5),
    hints: [
      r`Jak daleko od zera leży $-7$?`,
      r`$|-7| = 7$. Najpierw policz $3 - 5$, potem wartość bezwzględną.`,
      r`$3 - 5 = -2$, a $|-2| = 2$.`,
      r`Zostało $7 + 2$.`,
    ],
    steps: [r`$|-7| = 7$.`, r`$|3 - 5| = |-2| = 2$.`, r`$7 + 2 = 9$.`],
    errors: [
      ['-5', r`$|-7|$ potraktowane jak $-7$.`, 'Wartość bezwzględna jest zawsze nieujemna.'],
      ['5', r`$|3 - 5|$ policzone jako $-2$.`, r`$|-2| = 2$ — odległość nie jest ujemna.`],
    ],
  }),
  numeric({
    id: 'n-abs-2',
    skill: 'num-abs',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile liczb całkowitych spełnia nierówność $|x| \le 3$?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let x = -100; x <= 100; x += 1) if (Math.abs(x) <= 3) n += 1;
      return n;
    },
    hints: [
      r`Które liczby leżą od zera w odległości najwyżej $3$?`,
      r`To przedział $\langle -3, 3 \rangle$ — razem z końcami.`,
      r`Wypisz: $-3, -2, -1, 0, \ldots$`,
      r`Policz liczby od $-3$ do $3$ — nie zapomnij o zerze.`,
    ],
    steps: [r`$|x| \le 3 \iff x \in \langle -3, 3 \rangle$.`, r`Liczby całkowite: $-3, -2, -1, 0, 1, 2, 3$ — jest ich $7$.`],
    errors: [
      ['3', 'Tylko liczby dodatnie — a nierówność spełniają też ujemne.', r`$|x| \le 3$ to odległość od zera w obie strony.`],
      ['5', r`Pominięte końce przedziału, a przy $\le$ one należą.`, r`Przy $\le$ końce spełniają nierówność: $|3| = 3 \le 3$.`],
      ['6', 'Pominięte zero.', r`$|0| = 0 \le 3$ — zero też spełnia nierówność.`],
    ],
  }),
  choice({
    id: 'n-abs-3',
    skill: 'num-abs',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Zbiorem rozwiązań nierówności $|x - 2| < 5$ jest`,
    choices: [
      r`$(-3, 7)$`,
      r`$\langle -3, 7 \rangle$`,
      r`$(-7, 3)$`,
      r`$(-\infty, -3) \cup (7, +\infty)$`,
    ],
    answer: 'A',
    hints: [
      r`Od jakiej liczby mierzysz odległość w $|x - 2|$?`,
      r`Szukasz liczb odległych od $2$ o mniej niż $5$.`,
      r`$2 - 5 = -3$ i $2 + 5 = 7$.`,
      r`Nierówność ostra — końce nie należą.`,
    ],
    steps: [r`Liczby odległe od $2$ o mniej niż $5$ leżą między $-3$ a $7$.`, r`Nierówność ostra, więc $x \in (-3, 7)$.`],
    errors: [
      ['B', r`Końce włączone, choć nierówność jest ostra ($<$).`, r`Przy $<$ końce nie należą — nawiasy okrągłe.`],
      ['C', r`Środek odczytany jako $-2$ zamiast $2$.`, r`$|x - 2|$ to odległość od $2$.`],
      ['D', r`Odwrócona nierówność — to rozwiązanie $|x - 2| > 5$.`, r`$< r$: liczby BLISKO środka, jeden przedział.`],
    ],
  }),
  numeric({
    id: 'n-abs-4',
    skill: 'num-abs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Równanie $|x + 3| = 5$ ma dwa rozwiązania. Podaj ich sumę.`,
    answer: -6,
    verify: () => 2 + -8,
    hints: [
      r`Od jakiej liczby mierzy odległość $|x + 3|$?`,
      r`$|x + 3| = |x - (-3)|$ — odległość od $-3$.`,
      r`Liczby odległe o $5$ od $-3$: w prawo i w lewo.`,
      r`To $-3 + 5$ oraz $-3 - 5$.`,
    ],
    steps: [r`$|x + 3| = 5$ — liczby odległe o $5$ od $-3$.`, r`$x = 2$ lub $x = -8$.`, r`Suma: $2 + (-8) = -6$.`],
    errors: [
      ['6', r`Środek odczytany jako $3$ zamiast $-3$ (wyszło $8$ i $-2$).`, r`$|x + 3| = |x - (-3)|$ — środkiem jest $-3$.`],
      ['2', 'Znalezione tylko jedno rozwiązanie.', 'Odległość 5 od środka można odmierzyć w obie strony — są dwa rozwiązania.'],
    ],
  }),
  choice({
    id: 'n-abs-5',
    skill: 'num-abs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Zbiór liczb, których odległość od $1$ jest większa lub równa $4$, to`,
    choices: [
      r`$(-\infty, -3\rangle \cup \langle 5, +\infty)$`,
      r`$\langle -3, 5 \rangle$`,
      r`$(-\infty, -3) \cup (5, +\infty)$`,
      r`$(-\infty, -5\rangle \cup \langle 3, +\infty)$`,
    ],
    answer: 'A',
    hints: [
      'Czy te liczby leżą blisko $1$, czy daleko od niej?',
      r`Daleko: na lewo od $1 - 4$ albo na prawo od $1 + 4$.`,
      r`Granice: $-3$ i $5$.`,
      r`„Większa lub równa” — końce należą.`,
    ],
    steps: [r`$|x - 1| \ge 4$.`, r`$x \le -3$ lub $x \ge 5$, czyli $x \in (-\infty, -3\rangle \cup \langle 5, +\infty)$.`],
    errors: [
      ['B', 'Odwrócona nierówność — to liczby BLISKO 1.', r`„Większa lub równa 4” oznacza liczby daleko od środka: dwa przedziały.`],
      ['C', r`Pominięte końce, choć odległość może być równa $4$.`, r`Przy $\ge$ końce należą — nawias ostry.`],
      ['D', r`Środek odczytany jako $-1$.`, r`Odległość od $1$ to $|x - 1|$.`],
    ],
  }),
  numeric({
    id: 'n-abs-6',
    skill: 'num-abs',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Podaj sumę wszystkich liczb całkowitych $x$ spełniających nierówność $|2x - 3| < 7$.`,
    answer: 9,
    verify: () => {
      let s = 0;
      for (let x = -100; x <= 100; x += 1) if (Math.abs(2 * x - 3) < 7) s += x;
      return s;
    },
    hints: [
      r`Jak zapisać $|2x - 3| < 7$ bez wartości bezwzględnej?`,
      r`$-7 < 2x - 3 < 7$.`,
      r`Dodaj $3$ i podziel przez $2$: $-2 < x < 5$.`,
      r`Liczby całkowite między $-2$ a $5$ (bez końców): $-1, 0, 1, 2, 3, 4$.`,
    ],
    steps: [
      r`$-7 < 2x - 3 < 7 \iff -4 < 2x < 10 \iff -2 < x < 5$.`,
      r`Liczby całkowite: $-1, 0, 1, 2, 3, 4$.`,
      r`Suma: $-1 + 0 + 1 + 2 + 3 + 4 = 9$.`,
    ],
    errors: [
      ['12', r`Włączone końce $-2$ i $5$, a nierówność jest ostra.`, r`Przy $<$ końce nie należą do rozwiązania.`],
      ['39', r`Zapomniane dzielenie przez $2$ (wyszło $-4 < x < 10$).`, r`Z $-4 < 2x < 10$ trzeba jeszcze podzielić przez $2$.`],
    ],
  }),
  numeric({
    id: 'n-abs-7',
    skill: 'num-abs',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Termometr mierzy z błędem nie większym niż $0{,}5^{\circ}\mathrm{C}$. Pokazał $36{,}8^{\circ}\mathrm{C}$. Jaka jest najwyższa możliwa rzeczywista temperatura (w stopniach)?`,
    answer: 37.3,
    verify: () => 36.8 + 0.5,
    hints: [
      r`Jak zapisać „błąd nie większy niż $0{,}5$” przy pomocy wartości bezwzględnej?`,
      r`$|t - 36{,}8| \le 0{,}5$.`,
      r`$t \in \langle 36{,}8 - 0{,}5;\ 36{,}8 + 0{,}5 \rangle$.`,
      r`Szukasz prawego końca przedziału.`,
    ],
    steps: [r`$|t - 36{,}8| \le 0{,}5$.`, r`$t \in \langle 36{,}3;\ 37{,}3 \rangle$ — najwyższa możliwa to $37{,}3^{\circ}$.`],
    errors: [['36.3', 'Podana najniższa zamiast najwyższej możliwej temperatury.', 'Przedział ma dwa końce — pytanie dotyczy prawego.']],
  }),
  numeric({
    id: 'n-abs-8',
    skill: 'num-abs',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla ilu liczb całkowitych $x$ spełniona jest nierówność $|x - 1| + |x + 1| \le 4$?`,
    answer: 5,
    verify: () => {
      let n = 0;
      for (let x = -100; x <= 100; x += 1) if (Math.abs(x - 1) + Math.abs(x + 1) <= 4) n += 1;
      return n;
    },
    hints: [
      r`Co na osi oznacza suma $|x - 1| + |x + 1|$?`,
      r`To suma odległości $x$ od $1$ i od $-1$.`,
      r`Między $-1$ a $1$ ta suma wynosi $2$. Na zewnątrz rośnie o $2$ z każdym krokiem.`,
      r`Suma równa $4$ wypada w $x = 2$ i $x = -2$.`,
    ],
    steps: [
      r`$|x - 1| + |x + 1|$ to suma odległości od $1$ i od $-1$.`,
      r`Suma $\le 4$ dla $x \in \langle -2, 2 \rangle$.`,
      r`Liczby całkowite: $-2, -1, 0, 1, 2$ — jest ich $5$.`,
    ],
    errors: [
      ['3', r`Rozważony tylko fragment osi między $-1$ a $1$.`, 'Poza odcinkiem między punktami suma odległości też może być mała — trzeba sprawdzić całą oś.'],
    ],
  }),

  // -------------------------------------------------------------------------
  // num-approx
  // -------------------------------------------------------------------------
  numeric({
    id: 'n-apx-1',
    skill: 'num-approx',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Zaokrąglij liczbę $7{,}846$ do części dziesiątych.`,
    answer: 7.8,
    verify: () => Math.round(7.846 * 10) / 10,
    hints: [
      'Która cyfra decyduje o zaokrągleniu do części dziesiątych?',
      'Decyduje pierwsza odrzucana cyfra — cyfra setnych.',
      r`Cyfra setnych w $7{,}846$ to $4$.`,
      r`$4$ to mniej niż $5$ — cyfra dziesiątych zostaje bez zmian.`,
    ],
    steps: [r`Cyfra setnych to $4$, czyli mniej niż $5$.`, r`$7{,}846 \approx 7{,}8$.`],
    errors: [
      ['7.9', r`Zaokrąglanie łańcuchowe: $7{,}846 \to 7{,}85 \to 7{,}9$.`, 'Decyduje tylko pierwsza odrzucana cyfra.'],
      ['7.85', 'Zaokrąglone do części setnych zamiast dziesiątych.', 'Części dziesiąte to jedna cyfra po przecinku.'],
    ],
  }),
  numeric({
    id: 'n-apx-2',
    skill: 'num-approx',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Liczbę $2{,}5$ przybliżono liczbą $2$. Oblicz błąd bezwzględny tego przybliżenia.`,
    answer: 0.5,
    verify: () => Math.abs(2.5 - 2),
    hints: [
      'Jaki wzór ma błąd bezwzględny?',
      r`$\Delta = |x - x_0|$, gdzie $x$ to wartość dokładna.`,
      r`$|2{,}5 - 2|$.`,
      r`Różnica wynosi pół.`,
    ],
    steps: [r`$\Delta = |2{,}5 - 2|$.`, r`$\Delta = 0{,}5$.`],
    errors: [
      ['-0.5', 'Pominięta wartość bezwzględna.', 'Błąd bezwzględny nie jest ujemny.'],
      ['20', 'Policzony błąd względny w procentach zamiast bezwzględnego.', r`Błąd bezwzględny to różnica, bez dzielenia.`],
    ],
  }),
  choice({
    id: 'n-apx-3',
    skill: 'num-approx',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Liczba $36\,000\,000$ zapisana w notacji wykładniczej to`,
    choices: [r`$3{,}6 \cdot 10^{7}$`, r`$36 \cdot 10^{6}$`, r`$3{,}6 \cdot 10^{6}$`, r`$3{,}6 \cdot 10^{-7}$`],
    answer: 'A',
    hints: [
      r`Jaki musi być pierwszy czynnik w notacji wykładniczej?`,
      r`Pierwszy czynnik jest od $1$ do mniej niż $10$: tu $3{,}6$.`,
      r`O ile miejsc przesuwasz przecinek z $36\,000\,000$ do $3{,}6$?`,
      'Policz cyfry za pierwszą cyfrą.',
    ],
    steps: [r`$36\,000\,000 = 3{,}6 \cdot 10\,000\,000$.`, r`$10\,000\,000 = 10^7$, więc $3{,}6 \cdot 10^7$.`],
    errors: [
      ['B', r`Pierwszy czynnik $36$ nie należy do $\langle 1, 10)$.`, r`W notacji wykładniczej $1 \le a < 10$.`],
      ['C', 'Policzone same zera zamiast przesunięć przecinka.', 'Wykładnik to liczba miejsc, o które przesuwasz przecinek.'],
      ['D', 'Ujemny wykładnik przy dużej liczbie.', r`Ujemny wykładnik oznacza liczbę mniejszą od $1$.`],
    ],
  }),
  numeric({
    id: 'n-apx-4',
    skill: 'num-approx',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Liczbę $50$ przybliżono liczbą $48$. Oblicz błąd względny w procentach.`,
    answer: 4,
    verify: () => (Math.abs(50 - 48) / 50) * 100,
    hints: [
      r`Przez którą liczbę dzielisz błąd bezwzględny — dokładną czy przybliżoną?`,
      r`Błąd bezwzględny: $|50 - 48| = 2$. Dzielisz przez wartość dokładną $50$.`,
      r`$\frac{2}{50} \cdot 100\%$.`,
      r`$\frac{2}{50} = \frac{4}{100}$.`,
    ],
    steps: [r`$\Delta = |50 - 48| = 2$.`, r`$\delta = \frac{2}{50} \cdot 100\% = 4\%$.`],
    errors: [
      [['4.17', '4.2'], 'Błąd podzielony przez przybliżenie zamiast przez wartość dokładną.', r`$\delta = \frac{|x - x_0|}{|x|}$ — w mianowniku wartość dokładna.`],
      ['2', 'Podany błąd bezwzględny zamiast względnego.', 'Błąd względny to błąd bezwzględny podzielony przez wartość dokładną.'],
    ],
  }),
  numeric({
    id: 'n-apx-5',
    skill: 'num-approx',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\frac{6 \cdot 10^{5}}{3 \cdot 10^{-2}}$ i podaj wynik jako zwykłą liczbę.`,
    answer: 20000000,
    verify: () => (6 * 10 ** 5) / (3 * 10 ** -2),
    hints: [
      'Co zrobić osobno z liczbami, a co osobno z potęgami dziesiątki?',
      r`$\frac{6}{3} = 2$, a $\frac{10^5}{10^{-2}} = 10^{5 - (-2)}$.`,
      r`$5 - (-2) = 7$.`,
      r`$2 \cdot 10^7$ — zapisz jako liczbę.`,
    ],
    steps: [r`$\frac{6}{3} = 2$, $\frac{10^5}{10^{-2}} = 10^{7}$.`, r`$2 \cdot 10^7 = 20\,000\,000$.`],
    errors: [
      ['2000', r`Odjęty wykładnik ujemny jak dodatni: $10^{5-2}$.`, r`$a^m : a^n = a^{m-n}$, a $5 - (-2) = 7$.`],
    ],
  }),
  choice({
    id: 'n-apx-6',
    skill: 'num-approx',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Przybliżenie liczby dodatniej $x$ wynosi $12$, a błąd względny tego przybliżenia jest równy $20\%$. Liczba $x$ może być równa`,
    choices: [r`$14{,}4$`, r`$15$`, r`$9{,}6$`, r`$12{,}2$`],
    answer: 'B',
    verify: () => 12 / 0.8,
    hints: [
      'Względem czego liczony jest błąd względny — przybliżenia czy wartości dokładnej?',
      r`$\frac{|x - 12|}{x} = 0{,}2$.`,
      r`Gdy $x > 12$: $x - 12 = 0{,}2x$.`,
      r`$0{,}8x = 12$.`,
    ],
    steps: [r`$\frac{|x - 12|}{x} = 0{,}2$.`, r`Dla $x > 12$: $x - 12 = 0{,}2x$, czyli $0{,}8x = 12$ i $x = 15$.`],
    errors: [
      ['A', r`Błąd policzony względem przybliżenia: $12 \cdot 1{,}2$.`, 'Błąd względny liczy się względem wartości dokładnej $x$.'],
      ['C', r`Błąd policzony względem przybliżenia: $12 \cdot 0{,}8$.`, 'Błąd względny liczy się względem wartości dokładnej $x$.'],
      ['D', r`$20\%$ potraktowane jako liczba $0{,}2$ dodana do przybliżenia.`, r`$20\%$ to część wartości $x$, a nie stała różnica.`],
    ],
  }),
  numeric({
    id: 'n-apx-7',
    skill: 'num-approx',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Masa Ziemi to około $6 \cdot 10^{24}$ kg, a masa Księżyca około $7{,}35 \cdot 10^{22}$ kg. Ile razy masa Ziemi jest większa od masy Księżyca? Wynik zaokrąglij do jedności.`,
    answer: 82,
    verify: () => Math.round((6 * 10 ** 24) / (7.35 * 10 ** 22)),
    hints: [
      'Jakie działanie odpowiada na pytanie „ile razy większa”?',
      r`Dzielenie: $\frac{6 \cdot 10^{24}}{7{,}35 \cdot 10^{22}}$.`,
      r`$\frac{10^{24}}{10^{22}} = 10^2$, więc liczysz $\frac{6}{7{,}35} \cdot 100$.`,
      r`$\frac{600}{7{,}35} \approx 81{,}6$ — zaokrąglij.`,
    ],
    steps: [
      r`$\frac{6 \cdot 10^{24}}{7{,}35 \cdot 10^{22}} = \frac{6}{7{,}35} \cdot 10^{2}$.`,
      r`$\frac{600}{7{,}35} \approx 81{,}63 \approx 82$.`,
    ],
    errors: [
      ['8', r`Źle odjęte wykładniki: $10^{24} : 10^{22}$ to $10^2$, a nie $10$.`, r`$a^m : a^n = a^{m-n}$.`],
      ['81', 'Wynik obcięty zamiast zaokrąglony.', r`$81{,}63$ zaokrągla się w górę, bo pierwsza odrzucana cyfra to $6$.`],
    ],
  }),
  numeric({
    id: 'n-apx-8',
    skill: 'num-approx',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Bok kwadratu zmierzono jako $10$ cm, a jego dokładna długość to $10{,}2$ cm. Oblicz błąd względny obliczonego POLA kwadratu w procentach. Wynik zaokrąglij do części setnych.`,
    answer: 3.88,
    tolerance: 0.005,
    verify: () => Math.round(((10.2 ** 2 - 10 ** 2) / 10.2 ** 2) * 10000) / 100,
    hints: [
      'Jakie jest dokładne pole, a jakie pole z pomiaru?',
      r`Dokładne pole: $10{,}2^2 = 104{,}04$. Z pomiaru: $100$.`,
      r`$\delta = \frac{104{,}04 - 100}{104{,}04} \cdot 100\%$.`,
      r`$\frac{4{,}04}{104{,}04} \approx 0{,}0388$.`,
    ],
    steps: [
      r`Pole dokładne: $104{,}04$, pole przybliżone: $100$.`,
      r`$\delta = \frac{4{,}04}{104{,}04} \cdot 100\% \approx 3{,}88\%$.`,
    ],
    errors: [
      [['1.96', '1.96%'], 'Policzony błąd względny boku, a pytanie jest o pole.', 'Błąd pola trzeba liczyć z pól, nie z boków.'],
      [['4.04'], 'Podany błąd bezwzględny pola zamiast względnego.', 'Błąd względny to błąd bezwzględny podzielony przez wartość dokładną.'],
      [['4.04%', '4'], 'Błąd pola podzielony przez pole przybliżone zamiast dokładnego.', r`W mianowniku jest wartość dokładna: $104{,}04$.`],
    ],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const NUMBERS_CARDS: Flashcard[] = [
  card('c-num-order-1', 'num-order', 'metoda', 'Kolejność działań?', 'Nawiasy → potęgi i pierwiastki → mnożenie i dzielenie (od lewej) → dodawanie i odejmowanie (od lewej).'),
  card('c-num-order-2', 'num-order', 'wzor', r`Jak dodać $\frac{a}{b} + \frac{c}{d}$?`, r`$\frac{ad + bc}{bd}$ — najpierw wspólny mianownik.`),
  card('c-num-order-3', 'num-order', 'wzor', r`Jak podzielić przez ułamek $\frac{c}{d}$?`, r`Pomnożyć przez odwrotność: $\frac{a}{b} : \frac{c}{d} = \frac{a}{b} \cdot \frac{d}{c}$.`),
  card('c-num-order-4', 'num-order', 'pulapka', r`Ile to $2\frac{1}{3}$?`, r`$2 + \frac{1}{3} = \frac{7}{3}$ — liczba mieszana to suma, nie iloczyn.`),

  card('c-num-pow-1', 'num-powers', 'wzor', r`$a^m \cdot a^n = \;?$`, r`$a^{m+n}$ — przy mnożeniu wykładniki się dodaje.`),
  card('c-num-pow-2', 'num-powers', 'wzor', r`$(a^m)^n = \;?$`, r`$a^{m \cdot n}$ — potęga potęgi: wykładniki się mnoży.`),
  card('c-num-pow-3', 'num-powers', 'wzor', r`$a^{-n} = \;?$`, r`$\frac{1}{a^n}$ (dla $a \ne 0$) — wykładnik ujemny odwraca, nie zmienia znaku.`),
  card('c-num-pow-4', 'num-powers', 'pulapka', r`Ile to $-2^2$, a ile $(-2)^2$?`, r`$-2^2 = -4$, $(-2)^2 = 4$ — bez nawiasu minus nie jest częścią podstawy.`),

  card('c-num-root-1', 'num-roots', 'wzor', r`$\sqrt{a \cdot b} = \;?$`, r`$\sqrt{a} \cdot \sqrt{b}$ (dla $a, b \ge 0$).`),
  card('c-num-root-2', 'num-roots', 'wzor', r`$a^{\frac{m}{n}} = \;?$`, r`$\sqrt[n]{a^m}$ — mianownik to stopień pierwiastka, licznik to potęga.`),
  card('c-num-root-3', 'num-roots', 'metoda', r`Jak uprościć $\sqrt{72}$?`, r`Znajdź największy kwadrat dzielący liczbę: $72 = 36 \cdot 2$, więc $\sqrt{72} = 6\sqrt{2}$.`),
  card('c-num-root-4', 'num-roots', 'pulapka', r`Czy $\sqrt{a + b} = \sqrt{a} + \sqrt{b}$?`, r`Nie. $\sqrt{9 + 16} = 5$, a $\sqrt{9} + \sqrt{16} = 7$.`),

  card('c-num-pct-1', 'num-percent', 'wzor', r`Cena $a$ po podwyżce o $p\%$?`, r`$a \cdot \left(1 + \frac{p}{100}\right)$`),
  card('c-num-pct-2', 'num-percent', 'metoda', r`Jak znaleźć cenę sprzed obniżki o $p\%$?`, r`Podzielić cenę po obniżce przez $1 - \frac{p}{100}$. Po obniżce o $20\%$ — dzielisz przez $0{,}8$.`),
  card('c-num-pct-3', 'num-percent', 'definicja', 'Punkt procentowy?', r`Różnica dwóch wartości wyrażonych w procentach. Z $20\%$ na $25\%$: $+5$ punktów procentowych, ale $+25\%$.`),
  card('c-num-pct-4', 'num-percent', 'pulapka', r`$+10\%$, potem $-10\%$ — czy cena wraca?`, r`Nie: $1{,}1 \cdot 0{,}9 = 0{,}99$, cena spada o $1\%$.`),

  card('c-num-abs-1', 'num-abs', 'definicja', r`$|x|$ — co oznacza na osi?`, r`Odległość liczby $x$ od zera.`),
  card('c-num-abs-2', 'num-abs', 'wzor', r`$|x - a| \le r \iff \;?$`, r`$x \in \langle a - r,\ a + r \rangle$`),
  card('c-num-abs-3', 'num-abs', 'wzor', r`$|x - a| > r \iff \;?$`, r`$x \in (-\infty,\ a - r) \cup (a + r,\ +\infty)$`),
  card('c-num-abs-4', 'num-abs', 'pulapka', r`$|x + 2|$ to odległość od której liczby?`, r`Od $-2$, bo $|x + 2| = |x - (-2)|$.`),

  card('c-num-apx-1', 'num-approx', 'wzor', 'Błąd względny?', r`$\delta = \frac{|x - x_0|}{|x|} \cdot 100\%$ — dzielisz przez wartość dokładną $x$.`),
  card('c-num-apx-2', 'num-approx', 'definicja', 'Notacja wykładnicza?', r`$a \cdot 10^k$, gdzie $1 \le a < 10$, $k$ całkowite. Np. $45\,000 = 4{,}5 \cdot 10^4$.`),
  card('c-num-apx-3', 'num-approx', 'pulapka', r`$2{,}449$ do części dziesiątych?`, r`$2{,}4$ — decyduje tylko cyfra setnych, bez zaokrąglania łańcuchowego.`),
];

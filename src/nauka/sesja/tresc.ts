import type { MathTask, MikroZadanie, PytanieSpeed, ZadanieKlocki } from './typy';

/**
 * Treść demo nowego sposobu nauki: funkcja kwadratowa.
 *
 * Zadanie Deep Solve jest napisane przez FORGE „w stylu maturalnym” (poziom
 * rozszerzony) — NIE pochodzi z arkusza CKE i tak jest oznaczone w aplikacji.
 * Każdy wynik jest policzony niezależnie w `tresc.test.ts`.
 */

const r = String.raw;

export const ZADANIE_PARAMETR: MathTask = {
  id: 'deep-quad-param-1',
  topic: 'Funkcja kwadratowa',
  subtopic: 'Równanie kwadratowe z parametrem',
  skill: 'quad-param',
  difficulty: 4,
  examLevel: 'PR',
  source: {
    typ: 'forge',
    opis: 'Zadanie w stylu maturalnym (poziom rozszerzony) przygotowane przez FORGE — nie pochodzi z arkusza CKE.',
  },
  points: 5,
  question: r`Wyznacz wszystkie wartości parametru $m$, dla których równanie $x^2 - (m+2)x + m + 5 = 0$ ma dwa różne rozwiązania rzeczywiste $x_1, x_2$ spełniające warunek $x_1^2 + x_2^2 \le 18$.`,
  givens: [r`$x^2 - (m+2)x + m + 5 = 0$`, 'dwa różne rozwiązania rzeczywiste', r`$x_1^2 + x_2^2 \le 18$`],
  expectedConcepts: ['wyróżnik Δ', 'wzory Viète’a', 'nierówność kwadratowa', 'część wspólna warunków'],
  finalAnswer: r`$m \in \langle -6, -4)$`,
  hints: [
    'Zadanie ma dwa warunki: istnienie dwóch różnych pierwiastków i nierówność dla nich.',
    'Pierwiastków nie liczymy wprost — wystarczą ich suma i iloczyn.',
  ],
  commonMistakes: [
    { misconception: 'discriminant-nonstrict', opis: 'Δ ≥ 0 zamiast Δ > 0 przy „dwóch różnych” rozwiązaniach.' },
    { misconception: 'sum-of-squares-identity', opis: 'x₁² + x₂² zapisane jako (x₁ + x₂)².' },
    { misconception: 'forgot-domain-condition', opis: 'Odpowiedź bez warunku Δ > 0 — m = 4 dopisane do wyniku.' },
  ],
  steps: [
    {
      id: 'dp1',
      stage: 'zrozumienie',
      skill: 'quad-discriminant',
      scaffold: true,
      objective: 'Zamieniamy słowa z treści na warunek matematyczny.',
      prompt: r`Co oznacza „dwa różne rozwiązania rzeczywiste” w języku wyróżnika?`,
      answer: {
        typ: 'wybor',
        opcje: [r`$\Delta > 0$`, r`$\Delta \ge 0$`, r`$\Delta = 0$`, r`$a \ne 0$`],
        poprawna: 0,
        bledne: {
          1: { misconception: 'discriminant-nonstrict', komunikat: r`Przy $\Delta = 0$ jest tylko jedno (podwójne) rozwiązanie — a mają być dwa RÓŻNE.` },
          2: { misconception: 'discriminant-nonstrict', komunikat: r`$\Delta = 0$ daje dokładnie jedno rozwiązanie.` },
          3: { komunikat: r`$a = 1 \ne 0$ i tak — to mówi, że równanie jest kwadratowe, ale nic o liczbie rozwiązań.` },
        },
      },
      explanation: r`Liczbę rozwiązań mówi znak $\Delta$: dodatni — dwa różne, zero — jedno, ujemny — brak.`,
      hintLevel1: 'Ile rozwiązań ma równanie kwadratowe przy różnych znakach Δ?',
      hintLevel2: 'Liczba rozwiązań zależy od znaku wyróżnika: dodatni, zero, ujemny.',
      hintLevel3: r`Przy $\Delta = 0$ jest jedno rozwiązanie — czy to „dwa różne”?`,
      example: r`$x^2 - 6x + 9 = 0$: $\Delta = 36 - 36 = 0$, jedyne rozwiązanie $x = 3$.`,
      work: r`Warunek 1: $\Delta > 0$`,
      misconceptionTags: ['discriminant-nonstrict'],
    },
    {
      id: 'dp2',
      stage: 'dane',
      skill: 'quad-forms',
      scaffold: true,
      objective: 'Zanim cokolwiek policzymy, odczytujemy współczynniki — razem ze znakami.',
      prompt: r`Równanie: $x^2 - (m+2)x + m + 5 = 0$. Ile wynosi współczynnik $b$?`,
      answer: {
        typ: 'wybor',
        opcje: [r`$-(m+2)$`, r`$m+2$`, r`$-m+2$`, r`$m+5$`],
        poprawna: 0,
        bledne: {
          1: { misconception: 'coefficient-sign-error', komunikat: 'Zgubiony minus: b to cały współczynnik przy x, razem ze znakiem przed nawiasem.' },
          2: { misconception: 'coefficient-sign-error', komunikat: r`Minus przed nawiasem zmienia znak OBU składników: $-(m+2) = -m - 2$.` },
          3: { komunikat: 'To wyraz wolny c — przy nim nie ma x.' },
        },
      },
      explanation: r`$a = 1$, $b = -(m+2)$, $c = m + 5$. Znak przed nawiasem należy do $b$.`,
      hintLevel1: 'Który składnik stoi przy samym x?',
      hintLevel2: 'Współczynnik bierzemy RAZEM ze znakiem, który stoi przed nim.',
      hintLevel3: r`Przy $x$ stoi $-(m+2)$ — cały ten nawias ze znakiem minus.`,
      example: r`W $x^2 - (k-1)x + 3 = 0$: $b = -(k-1) = 1 - k$.`,
      work: r`$a = 1,\; b = -(m+2),\; c = m + 5$`,
      misconceptionTags: ['coefficient-sign-error'],
    },
    {
      id: 'dp3',
      stage: 'metoda',
      skill: 'quad-vieta',
      objective: 'Wybieramy drogę, zanim zaczniemy liczyć.',
      prompt: r`Jak najlepiej zapisać warunek $x_1^2 + x_2^2 \le 18$, skoro nie znamy $x_1$ ani $x_2$?`,
      answer: {
        typ: 'wybor',
        opcje: [
          r`Wzorami Viète’a — przez $x_1 + x_2$ i $x_1 x_2$`,
          r`Wyliczyć $x_1, x_2$ ze wzoru z $\sqrt{\Delta}$ i podnieść do kwadratu`,
          r`Sprawdzić kilka wartości $m$`,
          r`Rozwiązać nierówność $x^2 \le 18$`,
        ],
        poprawna: 0,
        bledne: {
          1: { komunikat: r`Da się, ale $\sqrt{\Delta}$ z parametrem bardzo komplikuje rachunek. Wzory Viète’a omijają pierwiastki.` },
          2: { komunikat: 'Kilka wartości nie da WSZYSTKICH m — potrzebny jest warunek ogólny.' },
          3: { komunikat: 'Warunek dotyczy pierwiastków x₁ i x₂, a nie dowolnego x.' },
        },
      },
      explanation: r`$x_1^2 + x_2^2$ da się zapisać przez sumę i iloczyn pierwiastków — a te znamy od razu z wzorów Viète’a, bez liczenia $\sqrt{\Delta}$.`,
      hintLevel1: 'Czego nie chcemy liczyć, gdy w równaniu jest parametr?',
      hintLevel2: 'Pierwiastków z Δ z parametrem. Są wzory, które dają sumę i iloczyn pierwiastków bez ich liczenia.',
      hintLevel3: r`Wzory Viète’a: $x_1 + x_2 = -\frac{b}{a}$, $x_1x_2 = \frac{c}{a}$.`,
      example: r`Gdy $x_1 + x_2 = 5$ i $x_1x_2 = 6$, to $x_1^2 + x_2^2 = 25 - 12 = 13$ — bez liczenia $x_1, x_2$.`,
      work: 'Plan: Δ > 0 → x₁² + x₂² wzorami Viète’a → część wspólna warunków.',
      misconceptionTags: ['vieta-without-delta'],
    },
    {
      id: 'dp4',
      stage: 'obliczenia',
      skill: 'quad-discriminant',
      objective: 'Liczymy wyróżnik — będzie potrzebny do warunku 1.',
      prompt: r`Oblicz $\Delta = b^2 - 4ac$ i uprość.`,
      answer: {
        typ: 'wyrazenie',
        zmienna: 'm',
        oczekiwane: 'm^2-16',
        etykieta: 'Δ =',
        typowe: [
          { wyrazenie: '(m+2)^2+4(m+5)', misconception: 'discriminant-sign-error', komunikat: r`W $\Delta$ jest MINUS $4ac$: $(m+2)^2 - 4(m+5)$.` },
          { wyrazenie: 'm^2+4-4(m+5)', misconception: 'square-of-sum-error', komunikat: r`$(m+2)^2 = m^2 + 4m + 4$ — brakuje wyrazu $4m$.` },
          { wyrazenie: 'm^2+4m+4-4m+20', misconception: 'discriminant-sign-error', komunikat: r`$-4(m+5) = -4m - 20$: minus mnoży oba składniki.` },
          { wyrazenie: '(m-2)^2-4(m+5)', misconception: 'coefficient-sign-error', komunikat: r`$b^2 = (-(m+2))^2 = (m+2)^2$, nie $(m-2)^2$.` },
        ],
      },
      explanation: r`$\Delta = (m+2)^2 - 4 \cdot 1 \cdot (m+5) = m^2 + 4m + 4 - 4m - 20 = m^2 - 16$.`,
      hintLevel1: r`Podstaw $a$, $b$, $c$ z kroku 2 do $b^2 - 4ac$.`,
      hintLevel2: r`$b^2 = (-(m+2))^2 = (m+2)^2$ — kwadrat „zjada” minus.`,
      hintLevel3: r`Rozpisz $(m+2)^2 = m^2 + 4m + 4$ i odejmij $4(m+5) = 4m + 20$.`,
      example: r`$x^2 - (m+1)x + m = 0$: $\Delta = (m+1)^2 - 4m = m^2 - 2m + 1$.`,
      work: r`$\Delta = (m+2)^2 - 4(m+5) = m^2 - 16$`,
      misconceptionTags: ['discriminant-sign-error', 'square-of-sum-error'],
    },
    {
      id: 'dp5',
      stage: 'interpretacja',
      skill: 'quad-ineq',
      objective: 'Zamieniamy warunek Δ > 0 na przedział dla m.',
      prompt: r`Rozwiąż $m^2 - 16 > 0$.`,
      answer: {
        typ: 'wybor',
        opcje: [
          r`$m \in (-\infty, -4) \cup (4, +\infty)$`,
          r`$m \in (-4, 4)$`,
          r`$m \in (4, +\infty)$`,
          r`$m \in (-\infty, -16) \cup (16, +\infty)$`,
        ],
        poprawna: 0,
        bledne: {
          1: { misconception: 'quadratic-ineq-direction', komunikat: r`Tu $m^2 - 16 < 0$: parabola z ramionami w górę jest POD osią między miejscami zerowymi.` },
          2: { misconception: 'sqrt-forgot-negative', komunikat: r`$m = -5$ też pasuje: $25 - 16 > 0$. Zgubione $m < -4$.` },
          3: { komunikat: r`Miejsca zerowe $m^2 - 16$ to $\pm 4$, bo $4^2 = 16$.` },
        },
      },
      explanation: r`$m^2 - 16 = (m-4)(m+4)$, ramiona w górę, więc dodatnie na zewnątrz pierwiastków $\pm 4$.`,
      hintLevel1: r`Gdzie $m^2 - 16$ jest równe zero?`,
      hintLevel2: r`$m^2 - 16 = (m-4)(m+4)$ — miejsca zerowe $\pm 4$, ramiona w górę.`,
      hintLevel3: 'Parabola z ramionami w górę jest NAD osią na zewnątrz miejsc zerowych.',
      example: r`$t^2 - 9 > 0 \iff t < -3$ lub $t > 3$.`,
      work: r`$m^2 - 16 > 0 \iff m \in (-\infty, -4) \cup (4, +\infty)$`,
      misconceptionTags: ['quadratic-ineq-direction', 'sqrt-forgot-negative'],
    },
    {
      id: 'dp6',
      stage: 'przeksztalcenie',
      skill: 'quad-vieta',
      objective: 'Przechodzimy od x₁, x₂ do wielkości, które znamy: suma i iloczyn.',
      prompt: r`Zapisz sumę pierwiastków: $x_1 + x_2 = -\frac{b}{a}$.`,
      answer: {
        typ: 'wyrazenie',
        zmienna: 'm',
        oczekiwane: 'm+2',
        etykieta: 'x₁ + x₂ =',
        typowe: [
          { wyrazenie: '-(m+2)', misconception: 'vieta-sign-error', komunikat: r`To jest $b$. Suma to $-\frac{b}{a} = -(-(m+2)) = m + 2$.` },
          { wyrazenie: 'm+5', komunikat: r`To iloczyn $x_1x_2 = \frac{c}{a}$. Suma to $-\frac{b}{a}$.` },
        ],
      },
      explanation: r`$x_1 + x_2 = -\frac{-(m+2)}{1} = m + 2$. Iloczyn tak samo: $x_1x_2 = \frac{c}{a} = m + 5$.`,
      hintLevel1: r`Jakie jest $b$? Masz je z kroku 2.`,
      hintLevel2: r`$-\frac{b}{a}$ to minus razy $b$, podzielone przez $a = 1$.`,
      hintLevel3: r`$-\big(-(m+2)\big)$ — dwa minusy dają plus.`,
      example: r`$x^2 - 7x + 10 = 0$: $x_1 + x_2 = 7$, $x_1x_2 = 10$ (pierwiastki $2$ i $5$).`,
      work: r`$x_1 + x_2 = m + 2,\; x_1x_2 = m + 5$`,
      misconceptionTags: ['vieta-sign-error'],
    },
    {
      id: 'dp7',
      stage: 'obliczenia',
      skill: 'quad-vieta',
      objective: 'Zapisujemy warunek z treści przez parametr m.',
      prompt: r`Wyraź $x_1^2 + x_2^2$ przez $m$, wiedząc, że $x_1 + x_2 = m + 2$ i $x_1x_2 = m + 5$.`,
      answer: {
        typ: 'wyrazenie',
        zmienna: 'm',
        oczekiwane: 'm^2+2m-6',
        etykieta: 'x₁² + x₂² =',
        typowe: [
          { wyrazenie: '(m+2)^2-(m+5)', misconception: 'sum-of-squares-identity', komunikat: r`Brakuje dwójki: $(x_1 + x_2)^2 - 2x_1x_2$.` },
          { wyrazenie: '(m+2)^2', misconception: 'sum-of-squares-identity', komunikat: r`$(x_1 + x_2)^2$ to nie $x_1^2 + x_2^2$ — zawiera jeszcze $2x_1x_2$.` },
          { wyrazenie: '(m+2)^2+2(m+5)', misconception: 'sum-of-squares-identity', komunikat: r`$2x_1x_2$ odejmujemy, nie dodajemy.` },
          { wyrazenie: 'm^2+4-2(m+5)', misconception: 'square-of-sum-error', komunikat: r`$(m+2)^2 = m^2 + 4m + 4$ — brakuje $4m$.` },
        ],
      },
      explanation: r`$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2 = (m+2)^2 - 2(m+5) = m^2 + 2m - 6$.`,
      hintLevel1: r`Jak połączyć $x_1^2 + x_2^2$ z $(x_1 + x_2)^2$?`,
      hintLevel2: r`$(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$.`,
      hintLevel3: r`Więc $x_1^2 + x_2^2 = (m+2)^2 - 2(m+5)$ — uprość.`,
      example: r`$x_1 + x_2 = 5$, $x_1x_2 = 6$: $x_1^2 + x_2^2 = 25 - 12 = 13$ (sprawdź: $2^2 + 3^2$).`,
      work: r`$x_1^2 + x_2^2 = (m+2)^2 - 2(m+5) = m^2 + 2m - 6$`,
      misconceptionTags: ['sum-of-squares-identity', 'square-of-sum-error'],
    },
    {
      id: 'dp8',
      stage: 'obliczenia',
      skill: 'quad-ineq',
      objective: 'Warunek 2 to zwykła nierówność kwadratowa z niewiadomą m.',
      prompt: r`Rozwiąż $m^2 + 2m - 6 \le 18$.`,
      answer: {
        typ: 'wybor',
        opcje: [
          r`$m \in \langle -6, 4 \rangle$`,
          r`$m \in (-\infty, -6\rangle \cup \langle 4, +\infty)$`,
          r`$m \in (-6, 4)$`,
          r`$m \in \langle -4, 6 \rangle$`,
        ],
        poprawna: 0,
        bledne: {
          1: { misconception: 'quadratic-ineq-direction', komunikat: r`To zbiór, gdzie $m^2 + 2m - 24 \ge 0$. Szukamy „$\le 0$” — między pierwiastkami.` },
          2: { misconception: 'interval-endpoint-error', komunikat: r`Nierówność jest nieostra ($\le$) — końce $-6$ i $4$ należą do zbioru.` },
          3: { misconception: 'factored-form-sign', komunikat: r`$m^2 + 2m - 24 = (m+6)(m-4)$, czyli pierwiastki $-6$ i $4$ — tu znaki są odwrócone.` },
        },
      },
      explanation: r`$m^2 + 2m - 24 \le 0$, $\Delta = 100$, pierwiastki $-6$ i $4$; ramiona w górę → $\langle -6, 4\rangle$.`,
      hintLevel1: 'Przenieś 18 na lewą stronę.',
      hintLevel2: r`$m^2 + 2m - 24 \le 0$ — znajdź miejsca zerowe.`,
      hintLevel3: r`$m^2 + 2m - 24 = (m+6)(m-4)$; ramiona w górę → pod osią MIĘDZY pierwiastkami.`,
      example: r`$t^2 - t - 2 \le 0$: $(t-2)(t+1) \le 0 \iff t \in \langle -1, 2\rangle$.`,
      work: r`$m^2 + 2m - 24 \le 0 \iff m \in \langle -6, 4 \rangle$`,
      misconceptionTags: ['quadratic-ineq-direction', 'interval-endpoint-error'],
    },
    {
      id: 'dp9',
      stage: 'warunki',
      skill: 'quad-param',
      objective: 'Odpowiedź musi spełniać WSZYSTKIE warunki naraz.',
      prompt: r`Połącz warunki: $m \in (-\infty, -4) \cup (4, +\infty)$ oraz $m \in \langle -6, 4 \rangle$. Jaki jest wynik?`,
      answer: {
        typ: 'wybor',
        opcje: [
          r`$m \in \langle -6, -4)$`,
          r`$m \in \langle -6, -4) \cup \{4\}$`,
          r`$m \in \langle -6, 4 \rangle$`,
          r`$m \in (-\infty, -4) \cup (4, +\infty)$`,
        ],
        poprawna: 0,
        bledne: {
          1: { misconception: 'forgot-domain-condition', komunikat: r`Dla $m = 4$ jest $\Delta = 0$ — jedno rozwiązanie. Warunek 1 wyklucza $4$.` },
          2: { misconception: 'forgot-domain-condition', komunikat: r`To tylko warunek 2 — zgubiony $\Delta > 0$.` },
          3: { misconception: 'forgot-domain-condition', komunikat: r`To tylko $\Delta > 0$ — zgubiony warunek $x_1^2 + x_2^2 \le 18$.` },
        },
      },
      explanation: r`Część wspólna: od $-6$ (domknięte, bo $\le$) do $-4$ (otwarte, bo $\Delta > 0$). Punkt $4$ odpada, bo tam $\Delta = 0$.`,
      hintLevel1: 'Wynik musi spełniać OBA warunki naraz.',
      hintLevel2: 'Zaznacz oba zbiory na jednej osi i weź część wspólną.',
      hintLevel3: r`Uważaj na $m = 4$: czy spełnia $\Delta > 0$?`,
      example: r`$x > 2$ i $x \le 5$ → $(2, 5\rangle$ — koniec $2$ zostaje otwarty, bo tak mówi pierwszy warunek.`,
      work: r`$m \in \langle -6, -4)$`,
      misconceptionTags: ['forgot-domain-condition'],
    },
    {
      id: 'dp10',
      stage: 'sprawdzenie',
      skill: 'quad-discriminant',
      scaffold: true,
      objective: 'Szybki test wyniku na jednej wartości z przedziału.',
      prompt: r`Sprawdzenie dla $m = -5$: równanie ma postać $x^2 + 3x = 0$. Ile wynosi $x_1^2 + x_2^2$?`,
      answer: {
        typ: 'liczba',
        wartosc: 9,
        etykieta: 'x₁² + x₂² =',
        typowe: [
          { wartosc: -9, komunikat: r`Kwadraty są nieujemne: $(-3)^2 = 9$.` },
          { wartosc: -3, komunikat: r`To suma pierwiastków $x_1 + x_2$. Podnieś każdy do kwadratu.` },
        ],
      },
      explanation: r`$x(x + 3) = 0$, więc $x_1 = 0$, $x_2 = -3$: $0 + 9 = 9 \le 18$ ✓, a $\Delta = 9 > 0$ ✓. Wynik się zgadza.`,
      hintLevel1: r`Rozwiąż $x^2 + 3x = 0$ — wyłącz $x$ przed nawias.`,
      hintLevel2: r`$x(x + 3) = 0$, więc $x = 0$ lub $x = -3$.`,
      hintLevel3: r`$0^2 + (-3)^2 = \;?$`,
      example: r`$x^2 - 2x = 0$: $x_1 = 0$, $x_2 = 2$, $x_1^2 + x_2^2 = 4$.`,
      work: r`Sprawdzenie $m = -5$: $x_1 = 0,\; x_2 = -3,\; 0 + 9 = 9 \le 18$ ✓`,
      misconceptionTags: [],
    },
  ],
};

export const ZADANIA_DEEP: MathTask[] = [ZADANIE_PARAMETR];

export const KLOCKI: ZadanieKlocki[] = [
  {
    id: 'klocki-delta-1',
    skill: 'quad-discriminant',
    tytul: 'Ułóż rozwiązanie',
    problem: r`Rozwiąż równanie $2x^2 + 3x - 2 = 0$.`,
    kroki: [
      r`$a = 2,\; b = 3,\; c = -2$`,
      r`$\Delta = b^2 - 4ac$`,
      r`$\Delta = 9 + 16$`,
      r`$\Delta = 25,\; \sqrt{\Delta} = 5$`,
      r`$x_1 = \frac{-3 - 5}{4} = -2$`,
      r`$x_2 = \frac{-3 + 5}{4} = \frac{1}{2}$`,
    ],
    dystraktory: [
      { tekst: r`$\Delta = 9 - 16$`, etap: 2, misconception: 'discriminant-sign-error', komunikat: r`$-4 \cdot 2 \cdot (-2) = +16$ — przy $c < 0$ odejmujesz liczbę ujemną.` },
      { tekst: r`$\Delta = b^2 + 4ac$`, etap: 1, misconception: 'discriminant-sign-error', komunikat: r`Wzór ma minus: $b^2 - 4ac$.` },
      { tekst: r`$x_1 = \frac{3 - 5}{4}$`, etap: 4, misconception: 'minus-b-sign', komunikat: r`W liczniku jest $-b = -3$, nie $3$.` },
      { tekst: r`$x_1 = \frac{-3 - 5}{2}$`, etap: 4, misconception: 'denominator-2a', komunikat: r`Mianownik to $2a = 4$, nie $2$.` },
    ],
    widoczne: 4,
  },
];

export const MIKRO: MikroZadanie[] = [
  {
    id: 'mk-wzor-delta',
    skill: 'quad-discriminant',
    rodzaj: 'wzor',
    przedKrokiem: 'dp4',
    pytanie: 'Którego wzoru potrzebujesz w następnym kroku?',
    kontekst: 'Następny krok: sprawdzić, kiedy równanie ma dwa różne rozwiązania.',
    odpowiedz: {
      typ: 'wybor',
      opcje: [r`$\Delta = b^2 - 4ac$`, r`$p = -\frac{b}{2a}$`, r`$x_1 + x_2 = -\frac{b}{a}$`, r`$P = \frac{1}{2}ah$`],
      poprawna: 0,
      bledne: {
        1: { komunikat: 'To pierwsza współrzędna wierzchołka — nie mówi o liczbie rozwiązań.' },
        2: { misconception: 'vieta-without-delta', komunikat: 'Viète przyda się później — najpierw trzeba wiedzieć, czy pierwiastki istnieją.' },
        3: { komunikat: 'To pole trójkąta — inny dział.' },
      },
    },
    wyjasnienie: 'O liczbie rozwiązań decyduje znak Δ.',
    podpowiedz: 'Co mówi, ile rozwiązań ma równanie kwadratowe?',
  },
  {
    id: 'mk-nastepny-viete',
    skill: 'quad-vieta',
    rodzaj: 'nastepny-krok',
    przedKrokiem: 'dp6',
    pytanie: 'Jaki powinien być następny krok?',
    kontekst: r`Masz już warunek 1: $m \in (-\infty, -4) \cup (4, +\infty)$. Zostaje $x_1^2 + x_2^2 \le 18$.`,
    odpowiedz: {
      typ: 'wybor',
      opcje: [
        r`Zapisać $x_1 + x_2$ i $x_1x_2$ wzorami Viète’a`,
        r`Rozwiązać $\Delta \le 18$`,
        r`Podać odpowiedź: $m \in (-\infty, -4) \cup (4, +\infty)$`,
      ],
      poprawna: 0,
      bledne: {
        1: { komunikat: r`Warunek dotyczy $x_1^2 + x_2^2$, nie $\Delta$.` },
        2: { misconception: 'forgot-domain-condition', komunikat: 'To dopiero warunek 1 — drugi jeszcze nie jest uwzględniony.' },
      },
    },
    wyjasnienie: 'x₁² + x₂² zapiszemy przez sumę i iloczyn pierwiastków.',
    podpowiedz: 'Który warunek z treści jeszcze nie został użyty?',
  },
  {
    id: 'mk-uzupelnij-kwadraty',
    skill: 'quad-vieta',
    rodzaj: 'uzupelnij',
    pytanie: r`Uzupełnij brakujący fragment: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - \;\square$`,
    odpowiedz: {
      typ: 'wybor',
      opcje: [r`$2x_1x_2$`, r`$x_1x_2$`, r`$2(x_1 + x_2)$`, r`$(x_1x_2)^2$`],
      poprawna: 0,
      bledne: {
        1: { misconception: 'sum-of-squares-identity', komunikat: r`$(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$ — wyraz środkowy ma dwójkę.` },
        2: { misconception: 'sum-of-squares-identity', komunikat: r`Wyraz środkowy to iloczyn $2x_1x_2$, nie suma.` },
        3: { misconception: 'sum-of-squares-identity', komunikat: r`Rozpisz $(x_1 + x_2)^2$ — nie pojawia się tam $(x_1x_2)^2$.` },
      },
    },
    wyjasnienie: r`$(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$, więc odejmujemy $2x_1x_2$.`,
    podpowiedz: r`Rozpisz $(x_1 + x_2)^2$.`,
  },
  {
    id: 'mk-blad-viete',
    skill: 'quad-vieta',
    rodzaj: 'gdzie-blad',
    pytanie: 'W którym przekształceniu po raz pierwszy pojawia się błąd?',
    kontekst: r`1) $x_1 + x_2 = 5,\; x_1x_2 = 4$ · 2) $x_1^2 + x_2^2 = (x_1 + x_2)^2 - x_1x_2$ · 3) $= 25 - 4 = 21$`,
    odpowiedz: {
      typ: 'wybor',
      opcje: ['Brak błędu', 'Wiersz 2', 'Wiersz 3'],
      poprawna: 1,
      bledne: {
        0: { komunikat: 'Sprawdź wzór na kwadrat sumy: wyraz mieszany ma współczynnik 2.' },
        2: { komunikat: 'Rachunek 25 − 4 jest poprawny, ale korzysta ze złego wzoru z wiersza wyżej.' },
      },
    },
    wyjasnienie: r`Powinno być $- 2x_1x_2$; wynik to $25 - 8 = 17$.`,
    podpowiedz: r`Sprawdź tożsamość dla $x_1 = 1$, $x_2 = 4$.`,
  },
  {
    id: 'mk-wykres-kanoniczna',
    skill: 'quad-forms',
    rodzaj: 'wykres',
    pytanie: r`Który wykres przedstawia $f(x) = -(x-1)^2 + 4$?`,
    wykresy: [
      { a: 1, b: -2, c: -3 },
      { a: -1, b: 2, c: 3 },
      { a: -1, b: -2, c: 3 },
      { a: -1, b: 2, c: -1 },
    ],
    odpowiedz: {
      typ: 'wybor',
      opcje: ['A', 'B', 'C', 'D'],
      poprawna: 1,
      bledne: {
        0: { misconception: 'parabola-direction', komunikat: r`$a = -1 < 0$ — ramiona w dół.` },
        2: { misconception: 'vertex-sign-error', komunikat: r`$(x - 1)^2$ to $p = 1$, wierzchołek po prawej stronie osi $y$.` },
        3: { komunikat: r`Wierzchołek ma być w $(1, 4)$, a tu jest w $(1, 0)$.` },
      },
    },
    wyjasnienie: r`Wierzchołek $(1, 4)$, ramiona w dół.`,
    podpowiedz: 'Odczytaj wierzchołek z postaci kanonicznej i znak a.',
  },
  {
    id: 'mk-legalne',
    skill: 'quad-ineq',
    rodzaj: 'legalne-przeksztalcenie',
    pytanie: r`Które przekształcenie nierówności $-2m^2 + 32 < 0$ jest poprawne?`,
    odpowiedz: {
      typ: 'wybor',
      opcje: [r`$m^2 - 16 > 0$`, r`$m^2 - 16 < 0$`, r`$m^2 < -16$`],
      poprawna: 0,
      bledne: {
        1: { misconception: 'ineq-divide-negative', komunikat: r`Dzielisz przez $-2$ — zwrot nierówności musi się zmienić.` },
        2: { misconception: 'ineq-divide-negative', komunikat: r`Po przeniesieniu: $-2m^2 < -32$, a po podzieleniu przez $-2$: $m^2 > 16$.` },
      },
    },
    wyjasnienie: r`Dzielimy obie strony przez $-2$ i odwracamy znak: $m^2 - 16 > 0$.`,
    podpowiedz: 'Co dzieje się ze znakiem nierówności przy dzieleniu przez liczbę ujemną?',
  },
];

export const SPEED: PytanieSpeed[] = [
  {
    id: 'sp-delta-zero',
    skill: 'quad-discriminant',
    forma: 'pf',
    pytanie: r`Gdy $\Delta = 0$, równanie kwadratowe ma dwa różne rozwiązania.`,
    prawda: false,
    misconception: 'discriminant-nonstrict',
    wyjasnienie: r`Przy $\Delta = 0$ jest jedno rozwiązanie (podwójne).`,
  },
  {
    id: 'sp-delta-licz',
    skill: 'quad-discriminant',
    forma: 'liczba',
    pytanie: r`Oblicz $\Delta$ dla $x^2 - 4x + 1 = 0$.`,
    odpowiedz: {
      typ: 'liczba',
      wartosc: 12,
      typowe: [{ wartosc: 20, misconception: 'discriminant-sign-error', komunikat: r`$16 - 4 = 12$ — w $\Delta$ jest minus $4ac$.` }],
    },
    wyjasnienie: r`$\Delta = 16 - 4 = 12$.`,
    misconception: 'discriminant-sign-error',
  },
  {
    id: 'sp-zera-iloczyn',
    skill: 'quad-forms',
    forma: 'wybor',
    pytanie: r`Miejsca zerowe $f(x) = (x - 3)(x + 5)$ to:`,
    odpowiedz: {
      typ: 'wybor',
      opcje: [r`$3$ i $-5$`, r`$-3$ i $5$`, r`$3$ i $5$`],
      poprawna: 0,
      bledne: {
        1: { misconception: 'factored-form-sign', komunikat: r`$(x - 3) = 0$ dla $x = 3$.` },
        2: { misconception: 'factored-form-sign', komunikat: r`$(x + 5) = 0$ dla $x = -5$.` },
      },
    },
    wyjasnienie: 'Każdy nawias zeruje się w innym punkcie: 3 i −5.',
    misconception: 'factored-form-sign',
  },
  {
    id: 'sp-kwadraty',
    skill: 'quad-vieta',
    forma: 'pf',
    pytanie: r`$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$`,
    prawda: true,
    misconception: 'sum-of-squares-identity',
    wyjasnienie: r`Tak: $(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$.`,
  },
  {
    id: 'sp-wykres-ujemna-delta',
    skill: 'quad-discriminant',
    forma: 'wykres',
    pytanie: r`Który wykres ma $\Delta < 0$?`,
    wykresy: [
      { a: 1, b: 0, c: -2 },
      { a: 1, b: -2, c: 1 },
      { a: 1, b: 0, c: 2 },
    ],
    odpowiedz: {
      typ: 'wybor',
      opcje: ['A', 'B', 'C'],
      poprawna: 2,
      bledne: {
        0: { komunikat: r`Ten wykres przecina oś $x$ dwa razy — $\Delta > 0$.` },
        1: { misconception: 'discriminant-nonstrict', komunikat: r`Styka się z osią w jednym punkcie — $\Delta = 0$.` },
      },
    },
    wyjasnienie: r`$\Delta < 0$ — brak miejsc zerowych: wykres nie dotyka osi $x$.`,
  },
  {
    id: 'sp-nastepny-nierownosc',
    skill: 'quad-ineq',
    forma: 'nastepny-krok',
    pytanie: r`$x^2 - 6x + 5 < 0$, pierwiastki $1$ i $5$. Odpowiedź to:`,
    odpowiedz: {
      typ: 'wybor',
      opcje: [r`$x \in (1, 5)$`, r`$x < 1$ lub $x > 5$`, r`$x \in \langle 1, 5 \rangle$`],
      poprawna: 0,
      bledne: {
        1: { misconception: 'quadratic-ineq-direction', komunikat: 'Ramiona w górę — wartości ujemne są MIĘDZY pierwiastkami.' },
        2: { misconception: 'interval-endpoint-error', komunikat: 'Nierówność ostra — końce nie należą.' },
      },
    },
    wyjasnienie: 'a > 0, parabola pod osią między pierwiastkami: (1, 5).',
    misconception: 'quadratic-ineq-direction',
  },
  {
    id: 'sp-ramiona-w-dol',
    skill: 'quad-ineq',
    forma: 'pf',
    pytanie: r`Dla $a < 0$ i dwóch różnych miejsc zerowych parabola leży NAD osią $x$ między tymi miejscami zerowymi.`,
    prawda: true,
    misconception: 'quadratic-ineq-direction',
    wyjasnienie: 'Ramiona w dół — „górka” jest między miejscami zerowymi.',
  },
  {
    id: 'sp-suma-viete',
    skill: 'quad-vieta',
    forma: 'liczba',
    pytanie: r`Suma pierwiastków $2x^2 - 6x + 1 = 0$ (wzory Viète’a):`,
    odpowiedz: {
      typ: 'liczba',
      wartosc: 3,
      typowe: [
        { wartosc: -3, misconception: 'vieta-sign-error', komunikat: r`$x_1 + x_2 = -\frac{b}{a} = -\frac{-6}{2} = 3$.` },
        { wartosc: 6, komunikat: r`Dzielimy przez $a = 2$.` },
      ],
    },
    wyjasnienie: r`$-\frac{b}{a} = \frac{6}{2} = 3$.`,
    misconception: 'vieta-sign-error',
  },
  {
    id: 'sp-wierzcholek',
    skill: 'quad-vertex',
    forma: 'wzor',
    pytanie: r`Pierwsza współrzędna wierzchołka paraboli $y = ax^2 + bx + c$:`,
    odpowiedz: {
      typ: 'wybor',
      opcje: [r`$-\frac{b}{2a}$`, r`$\frac{b}{2a}$`, r`$-\frac{\Delta}{4a}$`],
      poprawna: 0,
      bledne: {
        1: { misconception: 'minus-b-sign', komunikat: r`We wzorze jest minus: $p = -\frac{b}{2a}$.` },
        2: { komunikat: r`To druga współrzędna $q$.` },
      },
    },
    wyjasnienie: r`$p = -\frac{b}{2a}$, $q = -\frac{\Delta}{4a}$.`,
  },
  {
    id: 'sp-log',
    skill: 'log-properties',
    forma: 'pf',
    pytanie: r`$\log_2 8 + \log_2 4 = \log_2 12$`,
    prawda: false,
    misconception: 'log-product-rule',
    wyjasnienie: r`Suma logarytmów to logarytm ILOCZYNU: $\log_2 32 = 5$.`,
  },
  {
    id: 'sp-potega',
    skill: 'num-powers',
    forma: 'pf',
    pytanie: r`$(2^3)^2 = 2^5$`,
    prawda: false,
    misconception: 'power-exponent-add-mult',
    wyjasnienie: r`Potęga potęgi — wykładniki mnożymy: $2^6$.`,
  },
];

/**
 * Fiszki demo — ISTNIEJĄCE karty z korpusu kursu (te same id), więc swipe
 * zapisuje się w dotychczasowym systemie pudełek, a nie w nowym.
 */
export const FISZKI_DEMO = [
  'c-quad-dis-1',
  'c-quad-dis-2',
  'c-quad-vie-1',
  'c-quad-vie-2',
  'c-quad-vie-3',
  'c-quad-ver-1',
  'c-quad-inq-2',
  'c-quad-prm-1',
  'c-log-p-1',
  'c-num-pow-2',
  'c-prb-cp-2',
  'c-trig-i-1',
];

/** Krótkie nazwy umiejętności do podsumowań (pełne są w korpusie). */
export const KROTKIE_NAZWY: Record<string, string> = {
  'quad-forms': 'wykres i postacie funkcji',
  'quad-discriminant': 'delta i miejsca zerowe',
  'quad-vertex': 'wierzchołek paraboli',
  'quad-ineq': 'nierówności kwadratowe',
  'quad-vieta': 'wzory Viète’a',
  'quad-param': 'warunki z parametrem',
  'quad-optim': 'optymalizacja',
};

/** Umiejętności tematu „Funkcja kwadratowa” — średnia daje poziom tematu. */
export const UMIEJETNOSCI_TEMATU = ['quad-forms', 'quad-discriminant', 'quad-vertex', 'quad-ineq', 'quad-vieta', 'quad-param'];

export const mikro = (id: string) => MIKRO.find((m) => m.id === id);
export const klocki = (id: string) => KLOCKI.find((k) => k.id === id);
export const speed = (id: string) => SPEED.find((s) => s.id === id);
export const zadanieDeep = (id: string) => ZADANIA_DEEP.find((z) => z.id === id);

import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 3: Równania i nierówności.
 *
 * Podstawa: równania i nierówności liniowe, układy równań, proste równania
 * wymierne. Rozszerzenie: wartość bezwzględna metodą przedziałów i układy
 * z parametrem. Zadania rozszerzenia nie wymagają jeszcze funkcji
 * kwadratowej, która w kolejności kursu przychodzi później.
 */

const r = String.raw;

export const EQUATIONS_TOPIC: Topic = {
  id: 'math-equations',
  subjectId: 'math',
  name: 'Równania i nierówności',
  summary:
    'Równania i nierówności liniowe, układy równań, równania z niewiadomą w mianowniku i z wartością bezwzględną.',
};

export const EQUATIONS_SKILLS: Skill[] = [
  {
    id: 'eq-linear',
    topicId: 'math-equations',
    name: 'Równania liniowe',
    level: 'PP',
    ckeRequirement: 'Równania i nierówności — równania liniowe z jedną niewiadomą, zadania tekstowe',
    prerequisites: ['num-order'],
    examValue: 0.7,
  },
  {
    id: 'ineq-linear',
    topicId: 'math-equations',
    name: 'Nierówności liniowe',
    level: 'PP',
    ckeRequirement: 'Równania i nierówności — nierówności liniowe, zbiór rozwiązań jako przedział',
    prerequisites: ['eq-linear', 'num-abs'],
    examValue: 0.65,
  },
  {
    id: 'eq-system',
    topicId: 'math-equations',
    name: 'Układy równań liniowych',
    level: 'PP',
    ckeRequirement: 'Układy równań — układy dwóch równań liniowych, zadania tekstowe',
    prerequisites: ['eq-linear'],
    examValue: 0.7,
  },
  {
    id: 'eq-rational',
    topicId: 'math-equations',
    name: 'Równania wymierne',
    level: 'PP',
    ckeRequirement: 'Równania i nierówności — równania wymierne, dziedzina równania',
    prerequisites: ['eq-linear', 'alg-rational'],
    examValue: 0.6,
  },
  {
    id: 'eq-abs',
    topicId: 'math-equations',
    name: 'Równania z wartością bezwzględną',
    level: 'PR',
    ckeRequirement: 'Równania i nierówności — równania i nierówności z wartością bezwzględną (metoda przedziałów)',
    prerequisites: ['num-abs', 'eq-linear'],
    examValue: 0.65,
  },
  {
    id: 'eq-system-param',
    topicId: 'math-equations',
    name: 'Układy równań z parametrem',
    level: 'PR',
    ckeRequirement: 'Układy równań — liczba rozwiązań układu w zależności od parametru',
    prerequisites: ['eq-system'],
    examValue: 0.5,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const EQUATIONS_LESSONS: Lesson[] = [
  {
    skillId: 'eq-linear',
    minutes: 10,
    intro:
      'Równanie to waga w równowadze: to, co po lewej, waży tyle samo co to, co po prawej. Rozwiązujesz je, robiąc to samo z obiema stronami, aż niewiadoma zostanie sama.',
    blocks: [
      p(
        'Dozwolone ruchy: dodać lub odjąć to samo po obu stronach, pomnożyć lub podzielić obie strony przez tę samą liczbę różną od zera. Każdy taki ruch zachowuje równowagę.',
      ),
      p(
        r`Plan na każde równanie liniowe: 1) pozbądź się nawiasów i ułamków, 2) wyrazy z $x$ przenieś na jedną stronę, liczby na drugą, 3) podziel przez współczynnik przy $x$.`,
      ),
      tip(
        r`Ułamki usuwasz, mnożąc obie strony przez wspólny mianownik: $\frac{x}{2} + \frac{x}{3} = 5$ mnożysz przez $6$ i dostajesz $3x + 2x = 30$.`,
      ),
      warn(
        r`Mnożąc przez mianownik, mnożysz KAŻDY wyraz — także ten bez ułamka. W $\frac{x}{2} + 1 = 4$ po pomnożeniu przez $2$: $x + 2 = 8$, a nie $x + 1 = 8$.`,
      ),
      p(
        r`Równanie może nie mieć rozwiązań ($0 = 5$ — sprzeczne) albo mieć ich nieskończenie wiele ($0 = 0$ — tożsamościowe). Obie sytuacje poznajesz po tym, że $x$ znika z obu stron.`,
      ),
    ],
    examples: [
      example(
        r`Rozwiąż $3(x - 2) = x + 4$.`,
        [
          r`Nawias: $3x - 6 = x + 4$.`,
          r`Wyrazy z $x$ na lewo, liczby na prawo: $3x - x = 4 + 6$.`,
          r`$2x = 10$, więc $x = 5$.`,
        ],
        r`$x = 5$`,
      ),
      example(
        r`Rozwiąż $\frac{x - 1}{3} = \frac{x}{2} - 1$.`,
        [
          [r`Mnożę obie strony przez $6$: $2(x - 1) = 3x - 6$.`, r`$6$ to najmniejsza wspólna wielokrotność $3$ i $2$ — ułamki znikają.`],
          r`$2x - 2 = 3x - 6$.`,
          r`$-x = -4$, więc $x = 4$.`,
        ],
        r`$x = 4$`,
      ),
    ],
    pitfalls: [
      'Mnożenie przez mianownik tylko ułamków, a nie wszystkich wyrazów.',
      'Zgubiony znak przy przenoszeniu wyrazu na drugą stronę.',
      r`Minus przed nawiasem: $-(x - 3) = -x + 3$.`,
    ],
  },
  {
    skillId: 'ineq-linear',
    minutes: 10,
    intro:
      'Nierówność pyta nie o jedną liczbę, tylko o cały zbiór liczb. Rozwiązuje się ją prawie jak równanie — z jedną pułapką, o której trzeba pamiętać za każdym razem.',
    blocks: [
      p(
        r`Ruchy są te same co w równaniu: dodajesz, odejmujesz, mnożysz, dzielisz obie strony. Wynik zapisujesz jako przedział: $x > 3$ to $x \in (3, +\infty)$.`,
      ),
      warn(
        r`Mnożenie lub dzielenie przez liczbę UJEMNĄ odwraca znak nierówności: $-2x > 6 \Rightarrow x < -3$. Sprawdzenie: $x = -4$ daje $-2 \cdot (-4) = 8 > 6$.`,
      ),
      tip(
        'Po rozwiązaniu sprawdź jedną liczbę z przedziału i jedną spoza niego. To kilka sekund, a wyłapuje odwrócony znak.',
      ),
      f(r`x \ge a \iff x \in \langle a, +\infty) \qquad x < a \iff x \in (-\infty, a)`),
      p(
        r`Nawias ostry, gdy koniec należy do zbioru (przy $\ge$ i $\le$), okrągły, gdy nie należy (przy $>$ i $<$). Przy nieskończoności nawias jest zawsze okrągły.`,
      ),
    ],
    examples: [
      example(
        r`Rozwiąż $3 - 2x \le 7$.`,
        [
          r`$-2x \le 4$.`,
          [r`Dzielę przez $-2$ i odwracam znak: $x \ge -2$.`, 'Dzielenie przez liczbę ujemną zmienia kierunek nierówności.'],
          r`$x \in \langle -2, +\infty)$.`,
        ],
        r`$x \in \langle -2, +\infty)$`,
      ),
      example(
        r`Ile liczb całkowitych dodatnich spełnia $\frac{x}{3} - 1 < 2$?`,
        [
          r`$\frac{x}{3} < 3$, więc $x < 9$.`,
          r`Liczby całkowite dodatnie mniejsze od $9$: $1, 2, \ldots, 8$.`,
          r`Jest ich $8$.`,
        ],
        r`$8$`,
      ),
    ],
    pitfalls: [
      'Nieodwrócony znak po dzieleniu przez liczbę ujemną.',
      'Zły nawias przy końcu przedziału.',
      'Liczby całkowite dodatnie nie obejmują zera.',
    ],
  },
  {
    skillId: 'eq-system',
    minutes: 12,
    intro:
      'Gdy w zadaniu są dwie niewiadome, potrzebujesz dwóch równań. Układ równań to dwa warunki naraz — szukasz pary liczb, która spełnia oba.',
    blocks: [
      p(
        r`Metoda podstawiania: z jednego równania wyznaczasz jedną niewiadomą i wstawiasz do drugiego. Wygodna, gdy któraś niewiadoma ma współczynnik $1$.`,
      ),
      p(
        'Metoda przeciwnych współczynników: mnożysz równania tak, żeby przy jednej niewiadomej stały liczby przeciwne, i dodajesz równania stronami. Ta niewiadoma znika.',
      ),
      f(r`\begin{cases} x + y = 7 \\ x - y = 1 \end{cases} \Rightarrow 2x = 8`, 'dodanie równań stronami usuwa y'),
      tip('Po znalezieniu jednej niewiadomej wstaw ją do PROSTSZEGO równania. Na koniec sprawdź parę w obu równaniach.'),
      p(
        r`Układ może mieć jedno rozwiązanie, nie mieć żadnego (np. $x + y = 1$ i $x + y = 3$) albo mieć nieskończenie wiele (drugie równanie to pierwsze pomnożone przez liczbę). Geometrycznie: dwie proste przecinają się, są równoległe albo się pokrywają.`,
      ),
    ],
    examples: [
      example(
        r`Rozwiąż układ $\begin{cases} 2x + y = 11 \\ x - y = 1 \end{cases}$.`,
        [
          r`Dodaję równania stronami: $3x = 12$, więc $x = 4$.`,
          r`Z drugiego równania: $4 - y = 1$, więc $y = 3$.`,
          r`Sprawdzenie: $2 \cdot 4 + 3 = 11$ oraz $4 - 3 = 1$.`,
        ],
        r`$x = 4,\ y = 3$`,
      ),
      example(
        r`Dwa bilety normalne i trzy ulgowe kosztują $52$ zł, a normalny jest o $6$ zł droższy od ulgowego. Ile kosztuje bilet ulgowy?`,
        [
          r`$n = u + 6$ oraz $2n + 3u = 52$.`,
          r`Podstawiam: $2(u + 6) + 3u = 52$, czyli $5u + 12 = 52$.`,
          r`$u = 8$ zł (a normalny $14$ zł).`,
        ],
        r`$8$ zł`,
      ),
    ],
    pitfalls: [
      'Znaleziona tylko jedna niewiadoma — odpowiedź to para liczb.',
      'Zgubiony znak przy odejmowaniu równań stronami.',
      'Brak sprawdzenia pary w obu równaniach.',
    ],
  },
  {
    skillId: 'eq-rational',
    minutes: 10,
    intro:
      'Równanie wymierne ma niewiadomą w mianowniku. Rozwiązuje się je jak zwykłe — z jedną zasadą bezpieczeństwa: najpierw dziedzina, na końcu sprawdzenie, czy wynik jej nie łamie.',
    blocks: [
      p(
        'Krok 1: dziedzina — wykluczasz liczby zerujące mianownik. Krok 2: mnożysz obie strony przez mianownik albo korzystasz z tego, że ułamek jest zerem, gdy licznik jest zerem. Krok 3: odrzucasz rozwiązania spoza dziedziny.',
      ),
      f(r`\frac{W(x)}{V(x)} = 0 \iff W(x) = 0 \ \text{ i } \ V(x) \ne 0`),
      tip(r`Proporcję $\frac{a}{b} = \frac{c}{d}$ rozwiązujesz „na krzyż”: $ad = bc$ — ale dopiero po wypisaniu dziedziny.`),
      warn(
        r`Rozwiązanie, które zeruje mianownik, trzeba odrzucić — nawet jeśli wyszło z rachunku. W $\frac{x^2 - 4}{x - 2} = 0$ jedynym rozwiązaniem jest $x = -2$.`,
      ),
    ],
    examples: [
      example(
        r`Rozwiąż $\frac{x^2 - 9}{x + 3} = 0$.`,
        [
          r`Dziedzina: $x \ne -3$.`,
          r`Licznik: $x^2 - 9 = 0$, więc $x = 3$ lub $x = -3$.`,
          [r`$x = -3$ nie należy do dziedziny — odrzucam.`, 'Dziedzina to nie formalność: tu połowa rozwiązań odpada.'],
        ],
        r`$x = 3$`,
      ),
      example(
        r`Rozwiąż $\frac{2x - 1}{x + 2} = 3$.`,
        [r`Dziedzina: $x \ne -2$.`, r`Mnożę przez $x + 2$: $2x - 1 = 3x + 6$.`, r`$x = -7$ — należy do dziedziny.`],
        r`$x = -7$`,
      ),
    ],
    pitfalls: [
      'Brak odrzucenia rozwiązania spoza dziedziny.',
      'Pomnożenie przez mianownik tylko jednej strony równania.',
      'Skracanie, zanim wyznaczy się dziedzinę.',
    ],
  },
  {
    skillId: 'eq-abs',
    minutes: 14,
    intro:
      'Na rozszerzeniu moduły pojawiają się w równaniach z kilkoma wartościami bezwzględnymi naraz. Metoda przedziałów zamienia każde takie równanie w kilka zwykłych równań liniowych.',
    blocks: [
      p(
        'Metoda: 1) znajdź miejsca, w których wyrażenia pod modułami zmieniają znak (punkty krytyczne), 2) podziel oś na przedziały, 3) w każdym przedziale zdejmij moduły z właściwym znakiem, 4) rozwiąż i zostaw tylko rozwiązania z danego przedziału.',
      ),
      f(r`|x - a| = \begin{cases} x - a, & x \ge a \\ -(x - a), & x < a \end{cases}`),
      tip(
        'Najczęstsza strata punktów: rozwiązanie, które nie należy do przedziału, w którym je wyznaczono. Zawsze porównaj wynik z przedziałem.',
      ),
      p(
        r`Proste przypadki bez przedziałów: $|w(x)| = a$ dla $a > 0$ to $w(x) = a$ lub $w(x) = -a$; nierówność $|w(x)| < a$ to $-a < w(x) < a$.`,
      ),
      warn(r`$|x| = -3$ nie ma rozwiązań — moduł nie bywa ujemny. Nie rozwiązuj tego jak $x = \pm 3$.`),
    ],
    examples: [
      example(
        r`Rozwiąż $|x - 1| + |x + 2| = 5$.`,
        [
          r`Punkty krytyczne: $x = 1$ i $x = -2$.`,
          r`Dla $x < -2$: $-(x-1) - (x+2) = 5$, czyli $-2x - 1 = 5$, $x = -3$ — należy do przedziału.`,
          r`Dla $-2 \le x < 1$: $-(x-1) + (x + 2) = 5$, czyli $3 = 5$ — sprzeczność.`,
          r`Dla $x \ge 1$: $(x - 1) + (x + 2) = 5$, czyli $2x + 1 = 5$, $x = 2$ — należy do przedziału.`,
        ],
        r`$x \in \{-3, 2\}$`,
      ),
      example(
        r`Rozwiąż $|2x - 3| \le 5$.`,
        [r`$-5 \le 2x - 3 \le 5$.`, r`$-2 \le 2x \le 8$, czyli $-1 \le x \le 4$.`],
        r`$x \in \langle -1, 4 \rangle$`,
      ),
    ],
    pitfalls: [
      'Rozwiązanie spoza przedziału, w którym je wyznaczono.',
      'Zapomniany minus przed całym wyrażeniem przy zdejmowaniu modułu.',
      r`$|x| = -3$ potraktowane jak $x = \pm 3$.`,
    ],
  },
  {
    skillId: 'eq-system-param',
    minutes: 12,
    intro:
      'Na rozszerzeniu pytają, dla jakiego parametru układ ma jedno rozwiązanie, żadnego albo nieskończenie wiele. To pytanie o dwie proste: czy się przecinają, są równoległe, czy się pokrywają.',
    blocks: [
      p(
        r`Układ $\begin{cases} a_1x + b_1y = c_1 \\ a_2x + b_2y = c_2 \end{cases}$ opisuje dwie proste. Jedno rozwiązanie — proste się przecinają. Brak rozwiązań — są równoległe i różne. Nieskończenie wiele — pokrywają się.`,
      ),
      f(r`W = a_1b_2 - a_2b_1`, 'wyznacznik: układ ma dokładnie jedno rozwiązanie, gdy W jest różne od zera'),
      p(
        'Gdy W = 0, proste są równoległe. Wtedy sprawdzasz wyrazy wolne: jeśli równania są proporcjonalne w całości — nieskończenie wiele rozwiązań; jeśli tylko lewe strony — brak rozwiązań.',
      ),
      tip(
        r`Szybki test: $\frac{a_1}{a_2} = \frac{b_1}{b_2}$ oznacza proste równoległe, a jeśli dodatkowo $= \frac{c_1}{c_2}$ — to ta sama prosta.`,
      ),
      warn('Dla W = 0 nie wolno od razu pisać „brak rozwiązań” — trzeba sprawdzić, czy to nie jest ta sama prosta.'),
    ],
    examples: [
      example(
        r`Dla jakiego $m$ układ $\begin{cases} mx + 2y = 4 \\ 2x + y = 3 \end{cases}$ nie ma rozwiązań?`,
        [
          r`$W = m \cdot 1 - 2 \cdot 2 = m - 4$. Jedno rozwiązanie jest dla $m \ne 4$.`,
          r`Dla $m = 4$: $4x + 2y = 4$, czyli $2x + y = 2$, a drugie równanie to $2x + y = 3$.`,
          'Lewe strony równe, prawe różne — sprzeczność.',
        ],
        r`$m = 4$`,
      ),
      example(
        r`Dla jakiego $m$ układ $\begin{cases} x + my = 2 \\ 2x + 4y = 4 \end{cases}$ ma nieskończenie wiele rozwiązań?`,
        [
          r`$W = 1 \cdot 4 - 2m = 4 - 2m$, zero dla $m = 2$.`,
          r`Dla $m = 2$: $x + 2y = 2$ oraz $2x + 4y = 4$ — drugie to pierwsze pomnożone przez $2$.`,
          'Ta sama prosta — nieskończenie wiele rozwiązań.',
        ],
        r`$m = 2$`,
      ),
    ],
    pitfalls: [
      'Utożsamienie W = 0 z brakiem rozwiązań.',
      r`Zła kolejność iloczynów w wyznaczniku: $a_1b_2 - a_2b_1$.`,
      'Brak sprawdzenia wyrazów wolnych, gdy W = 0.',
    ],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const EQUATIONS_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // eq-linear
  // -------------------------------------------------------------------------
  numeric({
    id: 'e-lin-1',
    skill: 'eq-linear',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż równanie $5x - 7 = 18$.`,
    answer: 5,
    verify: () => (18 + 7) / 5,
    hints: [
      r`Jak pozbyć się $-7$ z lewej strony?`,
      r`Dodaj $7$ do obu stron.`,
      r`$5x = 25$.`,
      r`Podziel obie strony przez $5$.`,
    ],
    steps: [r`$5x = 18 + 7 = 25$.`, r`$x = 5$.`],
    errors: [['2.2', r`$7$ odjęte zamiast dodane przy przenoszeniu.`, 'Przeniesienie wyrazu na drugą stronę zmienia jego znak.']],
  }),
  numeric({
    id: 'e-lin-2',
    skill: 'eq-linear',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiąż równanie $2(x + 3) = 4x - 2$.`,
    answer: 4,
    verify: () => (6 + 2) / (4 - 2),
    hints: [
      'Od czego zacząć — od nawiasu czy od przenoszenia?',
      r`Wymnóż nawias: $2x + 6 = 4x - 2$.`,
      r`Wyrazy z $x$ na prawo, liczby na lewo: $6 + 2 = 4x - 2x$.`,
      r`$8 = 2x$.`,
    ],
    steps: [r`$2x + 6 = 4x - 2$.`, r`$8 = 2x$, więc $x = 4$.`],
    errors: [['2.5', r`Nawias pomnożony tylko przy pierwszym wyrazie: $2x + 3$.`, r`$2(x + 3) = 2x + 6$ — mnożysz każdy wyraz w nawiasie.`]],
  }),
  choice({
    id: 'e-lin-3',
    skill: 'eq-linear',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Rozwiązaniem równania $\frac{x}{2} + 1 = 4$ jest liczba`,
    choices: [r`$6$`, r`$3$`, r`$7$`, r`$\frac{3}{2}$`],
    answer: 'A',
    verify: () => (4 - 1) * 2,
    hints: [
      'Jak pozbyć się ułamka?',
      r`Pomnóż KAŻDY wyraz obu stron przez $2$.`,
      r`$x + 2 = 8$.`,
      r`Odejmij $2$ od obu stron.`,
    ],
    steps: [r`$x + 2 = 8$ (po pomnożeniu przez $2$).`, r`$x = 6$.`],
    errors: [
      ['B', r`Wyznaczone $\frac{x}{2} = 3$, ale nie pomnożone przez $2$.`, r`Z $\frac{x}{2} = 3$ wynika $x = 6$.`],
      ['C', r`Przy mnożeniu przez $2$ pominięta jedynka: $x + 1 = 8$.`, 'Mnożąc obie strony, mnożysz każdy wyraz.'],
      ['D', r`Podzielone przez $2$ zamiast pomnożone.`, r`Odwrotnością dzielenia przez $2$ jest mnożenie przez $2$.`],
    ],
  }),
  numeric({
    id: 'e-lin-4',
    skill: 'eq-linear',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $\frac{x - 1}{3} - \frac{x + 1}{4} = 1$.`,
    answer: 19,
    verify: () => {
      // 4(x-1) - 3(x+1) = 12  =>  x - 7 = 12
      return 12 + 7;
    },
    hints: [
      'Przez jaką liczbę pomnożyć obie strony, żeby ułamki zniknęły?',
      r`Przez $12$: $4(x - 1) - 3(x + 1) = 12$.`,
      r`Uwaga na minus: $-3(x + 1) = -3x - 3$.`,
      r`$4x - 4 - 3x - 3 = 12$.`,
    ],
    steps: [r`$4(x-1) - 3(x+1) = 12$.`, r`$4x - 4 - 3x - 3 = 12$, czyli $x - 7 = 12$.`, r`$x = 19$.`],
    errors: [['13', 'Minus przed ułamkiem nie objął całego licznika.', r`$-\frac{x+1}{4}$ po pomnożeniu daje $-3(x+1) = -3x - 3$.`]],
  }),
  choice({
    id: 'e-lin-5',
    skill: 'eq-linear',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Równanie $3(x - 1) = 3x - 3$`,
    choices: [
      'ma dokładnie jedno rozwiązanie',
      'nie ma rozwiązań',
      'ma nieskończenie wiele rozwiązań',
      r`ma tylko rozwiązanie $x = 0$`,
    ],
    answer: 'C',
    hints: [
      'Co dzieje się z niewiadomą po wymnożeniu nawiasu?',
      r`$3x - 3 = 3x - 3$.`,
      r`Po przeniesieniu: $0 = 0$.`,
      'Równość prawdziwa niezależnie od x — co to znaczy?',
    ],
    steps: [r`$3x - 3 = 3x - 3 \iff 0 = 0$.`, 'Każda liczba spełnia równanie — nieskończenie wiele rozwiązań.'],
    errors: [
      ['A', r`Nie zauważono, że $x$ znika z obu stron.`, r`Gdy $x$ znika i zostaje prawda, pasuje każda liczba.`],
      ['B', 'Pomylone równanie tożsamościowe ze sprzecznym.', r`Sprzeczne daje fałsz (np. $0 = 5$), tożsamościowe — prawdę ($0 = 0$).`],
      ['D', r`Sprawdzona jedna liczba ($x = 0$) i uznana za jedyną.`, 'Sprawdzenie jednej liczby nie mówi, czy są inne rozwiązania.'],
    ],
  }),
  numeric({
    id: 'e-lin-6',
    skill: 'eq-linear',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $\frac{2x + 1}{3} - \frac{x - 2}{6} = x$. Wynik możesz podać jako ułamek.`,
    answer: '4/3',
    tolerance: 0.001,
    verify: () => 4 / 3,
    hints: [
      'Jaki jest wspólny mianownik?',
      r`Pomnóż obie strony przez $6$: $2(2x + 1) - (x - 2) = 6x$.`,
      r`$-(x - 2) = -x + 2$.`,
      r`$4x + 2 - x + 2 = 6x$, czyli $3x + 4 = 6x$.`,
    ],
    steps: [r`$2(2x+1) - (x-2) = 6x$.`, r`$3x + 4 = 6x$, więc $3x = 4$ i $x = \frac{4}{3}$.`],
    errors: [['0', r`Minus przed ułamkiem: policzone $-(x-2) = -x - 2$.`, r`$-(x - 2) = -x + 2$.`]],
  }),
  numeric({
    id: 'e-lin-7',
    skill: 'eq-linear',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Za $3$ zeszyty i $2$ długopisy zapłacono $19$ zł. Długopis jest o $2$ zł droższy od zeszytu. Ile kosztuje zeszyt (w zł)?`,
    answer: 3,
    verify: () => (19 - 4) / 5,
    hints: [
      'Jak zapisać cenę długopisu przy pomocy ceny zeszytu z?',
      r`Długopis kosztuje $z + 2$.`,
      r`$3z + 2(z + 2) = 19$.`,
      r`$5z + 4 = 19$.`,
    ],
    steps: [r`$3z + 2(z + 2) = 19$.`, r`$5z + 4 = 19 \Rightarrow z = 3$ zł.`],
    errors: [['3.4', r`Dopłata $2$ zł doliczona raz, choć długopisy są dwa.`, r`$2(z + 2) = 2z + 4$.`]],
  }),
  numeric({
    id: 'e-lin-8',
    skill: 'eq-linear',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ojciec ma $42$ lata, a syn $12$. Za ile lat ojciec będzie dwa razy starszy od syna?`,
    answer: 18,
    verify: () => 42 - 2 * 12,
    hints: [
      r`Ile lat będzie miał każdy z nich za $t$ lat?`,
      r`Ojciec: $42 + t$, syn: $12 + t$.`,
      r`$42 + t = 2(12 + t)$.`,
      r`$42 + t = 24 + 2t$.`,
    ],
    steps: [r`$42 + t = 2(12 + t)$.`, r`$42 + t = 24 + 2t \Rightarrow t = 18$.`],
    errors: [['9', 'Pominięte, że syn też się starzeje.', r`Za $t$ lat obaj są o $t$ lat starsi.`]],
  }),

  // -------------------------------------------------------------------------
  // ineq-linear
  // -------------------------------------------------------------------------
  numeric({
    id: 'e-ineq-1',
    skill: 'ineq-linear',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż nierówność $x + 5 > 12$. Podaj najmniejszą liczbę całkowitą, która ją spełnia.`,
    answer: 8,
    verify: () => {
      for (let x = -100; x < 100; x += 1) if (x + 5 > 12) return x;
      return NaN;
    },
    hints: [
      r`Co zostanie po odjęciu $5$ od obu stron?`,
      r`$x > 7$.`,
      r`Nierówność jest ostra — czy $7$ ją spełnia?`,
      r`Następna liczba całkowita po $7$.`,
    ],
    steps: [r`$x > 7$.`, r`Najmniejsza liczba całkowita większa od $7$ to $8$.`],
    errors: [['7', r`Nierówność ostra: $7$ nie spełnia $x > 7$.`, r`Przy $>$ koniec przedziału nie należy do rozwiązania.`]],
  }),
  numeric({
    id: 'e-ineq-2',
    skill: 'ineq-linear',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile liczb całkowitych z przedziału $\langle -10, 10 \rangle$ spełnia nierówność $-3x \ge 12$?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let x = -10; x <= 10; x += 1) if (-3 * x >= 12) n += 1;
      return n;
    },
    hints: [
      r`Co się dzieje ze znakiem nierówności po podzieleniu przez $-3$?`,
      r`Znak się odwraca: $x \le -4$.`,
      r`Liczby całkowite od $-10$ do $-4$.`,
      r`Policz: $-10, -9, \ldots, -4$.`,
    ],
    steps: [r`$-3x \ge 12 \iff x \le -4$.`, r`Z przedziału: $-10, -9, \ldots, -4$ — siedem liczb.`],
    errors: [['15', r`Nieodwrócony znak po dzieleniu przez $-3$ (wyszło $x \ge -4$).`, 'Dzielenie przez liczbę ujemną odwraca znak nierówności.']],
  }),
  choice({
    id: 'e-ineq-3',
    skill: 'ineq-linear',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Zbiorem rozwiązań nierówności $2x - 1 < 5$ jest`,
    choices: [r`$(-\infty, 3)$`, r`$(-\infty, 3\rangle$`, r`$(3, +\infty)$`, r`$(-\infty, 2)$`],
    answer: 'A',
    hints: [
      'Jaki pierwszy ruch zrobiłbyś w równaniu $2x - 1 = 5$?',
      r`$2x < 6$.`,
      r`$x < 3$ — dzielisz przez liczbę dodatnią, znak zostaje.`,
      'Nierówność ostra: nawias okrągły.',
    ],
    steps: [r`$2x < 6 \iff x < 3$.`, r`$x \in (-\infty, 3)$.`],
    errors: [
      ['B', r`Nawias ostry przy nierówności ostrej.`, r`Przy $<$ koniec nie należy do zbioru.`],
      ['C', 'Znak odwrócony bez powodu.', 'Znak odwraca tylko mnożenie lub dzielenie przez liczbę ujemną.'],
      ['D', r`$1$ odjęte zamiast dodane: $2x < 4$.`, 'Przeniesienie wyrazu na drugą stronę zmienia jego znak.'],
    ],
  }),
  numeric({
    id: 'e-ineq-4',
    skill: 'ineq-linear',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych dodatnich spełnia nierówność $\frac{x}{3} - 1 < 2$?`,
    answer: 8,
    verify: () => {
      let n = 0;
      for (let x = 1; x < 100; x += 1) if (x / 3 - 1 < 2) n += 1;
      return n;
    },
    hints: [
      'Jak rozwiązać nierówność, zanim zaczniesz liczyć liczby?',
      r`$\frac{x}{3} < 3$.`,
      r`$x < 9$.`,
      r`Liczby całkowite dodatnie mniejsze od $9$ — od $1$ w górę.`,
    ],
    steps: [r`$\frac{x}{3} < 3 \iff x < 9$.`, r`Liczby $1, 2, \ldots, 8$ — jest ich $8$.`],
    errors: [['9', 'Wliczone zero, a zero nie jest liczbą dodatnią.', 'Liczby dodatnie są większe od zera.']],
  }),
  numeric({
    id: 'e-ineq-5',
    skill: 'ineq-linear',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Podaj najmniejszą liczbę całkowitą spełniającą nierówność $\frac{1 - 2x}{3} < x$.`,
    answer: 1,
    verify: () => {
      for (let x = -100; x < 100; x += 1) if ((1 - 2 * x) / 3 < x) return x;
      return NaN;
    },
    hints: [
      'Jak pozbyć się mianownika?',
      r`Pomnóż obie strony przez $3$: $1 - 2x < 3x$.`,
      r`$1 < 5x$, czyli $x > \frac{1}{5}$.`,
      r`Najmniejsza liczba całkowita większa od $0{,}2$.`,
    ],
    steps: [r`$1 - 2x < 3x \iff 1 < 5x \iff x > 0{,}2$.`, r`Najmniejsza liczba całkowita większa od $0{,}2$ to $1$.`],
    errors: [['0', r`Zaokrąglone w dół: $0$ nie jest większe od $0{,}2$.`, r`Szukasz liczby spełniającej $x > 0{,}2$ — zero jej nie spełnia.`]],
  }),
  choice({
    id: 'e-ineq-6',
    skill: 'ineq-linear',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Zbiorem rozwiązań nierówności $\frac{x - 1}{2} - \frac{x + 1}{3} \ge 1$ jest`,
    choices: [r`$\langle 11, +\infty)$`, r`$(11, +\infty)$`, r`$\langle 7, +\infty)$`, r`$(-\infty, 11\rangle$`],
    answer: 'A',
    hints: [
      'Przez jaką liczbę pomnożyć obie strony?',
      r`Przez $6$: $3(x - 1) - 2(x + 1) \ge 6$.`,
      r`$-2(x + 1) = -2x - 2$.`,
      r`$3x - 3 - 2x - 2 \ge 6$.`,
    ],
    steps: [r`$3(x-1) - 2(x+1) \ge 6 \iff x - 5 \ge 6$.`, r`$x \ge 11$, czyli $x \in \langle 11, +\infty)$.`],
    errors: [
      ['B', r`Nawias okrągły przy nierówności nieostrej ($\ge$).`, r`Przy $\ge$ koniec należy do zbioru — nawias ostry.`],
      ['C', r`Minus przed ułamkiem: policzone $-2(x+1) = -2x + 2$.`, r`$-2(x + 1) = -2x - 2$.`],
      ['D', 'Znak odwrócony bez dzielenia przez liczbę ujemną.', 'Mnożenie przez dodatnią liczbę 6 nie zmienia kierunku nierówności.'],
    ],
  }),
  numeric({
    id: 'e-ineq-7',
    skill: 'ineq-linear',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Abonament kosztuje $30$ zł miesięcznie, a minuta rozmowy w abonamencie $0{,}10$ zł. Bez abonamentu minuta kosztuje $0{,}40$ zł. Od ilu pełnych minut w miesiącu abonament jest tańszy?`,
    answer: 101,
    verify: () => {
      for (let m = 0; m < 10000; m += 1) if (30 + 0.1 * m < 0.4 * m) return m;
      return NaN;
    },
    hints: [
      r`Jaki jest koszt $m$ minut w każdym wariancie?`,
      r`Abonament: $30 + 0{,}1m$, bez abonamentu: $0{,}4m$.`,
      r`$30 + 0{,}1m < 0{,}4m$, czyli $30 < 0{,}3m$.`,
      r`$m > 100$ — ale pytanie jest o pełne minuty.`,
    ],
    steps: [r`$30 + 0{,}1m < 0{,}4m \iff m > 100$.`, r`Najmniejsza pełna liczba minut większa od $100$ to $101$.`],
    errors: [
      ['100', r`Przy $100$ minutach koszty są równe, a nie mniejsze.`, r`Nierówność ostra: $m > 100$.`],
      ['75', 'Pominięty koszt minut w abonamencie.', r`W abonamencie płacisz $30$ zł i jeszcze $0{,}10$ zł za minutę.`],
    ],
  }),
  numeric({
    id: 'e-ineq-8',
    skill: 'ineq-linear',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla jakich $m$ nierówność $(m - 2)x > m - 2$ jest spełniona przez wszystkie liczby $x > 1$? Podaj najmniejszą liczbę całkowitą $m$.`,
    answer: 3,
    verify: () => {
      for (let m = -20; m <= 20; m += 1) {
        const all = [1.001, 2, 10, 1000].every((x) => (m - 2) * x > m - 2);
        if (all) return m;
      }
      return NaN;
    },
    hints: [
      r`Co się dzieje z nierównością, gdy $m - 2$ jest dodatnie, ujemne albo równe zero?`,
      r`Dla $m - 2 > 0$ dzielisz bez zmiany znaku: $x > 1$.`,
      r`Dla $m - 2 < 0$ znak się odwraca: $x < 1$ — to nie pasuje. A dla $m = 2$?`,
      r`Dla $m = 2$: $0 > 0$ — fałsz. Zostaje $m > 2$.`,
    ],
    steps: [
      r`$m > 2$: $x > 1$ — pasuje. $m < 2$: $x < 1$ — nie pasuje. $m = 2$: $0 > 0$ — fałsz.`,
      r`Warunek: $m > 2$, najmniejsza liczba całkowita to $3$.`,
    ],
    errors: [['2', r`Dla $m = 2$ nierówność ma postać $0 > 0$ i nie jest spełniona.`, 'Współczynnik równy zero trzeba rozpatrzyć osobno.']],
  }),

  // -------------------------------------------------------------------------
  // eq-system
  // -------------------------------------------------------------------------
  numeric({
    id: 'e-sys-1',
    skill: 'eq-system',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż układ $\begin{cases} x + y = 10 \\ x - y = 4 \end{cases}$. Podaj $x$.`,
    answer: 7,
    verify: () => (10 + 4) / 2,
    hints: [
      'Co się stanie, gdy dodasz równania stronami?',
      r`$y$ i $-y$ się skrócą: $2x = 14$.`,
      r`Podziel przez $2$.`,
      r`$x = 14 : 2$.`,
    ],
    steps: [r`Dodaję stronami: $2x = 14$.`, r`$x = 7$ (a $y = 3$).`],
    errors: [['3', r`Podane $y$ zamiast $x$.`, 'Czytaj polecenie do końca — pytanie jest o x.']],
  }),
  numeric({
    id: 'e-sys-2',
    skill: 'eq-system',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiąż układ $\begin{cases} y = 2x \\ x + y = 12 \end{cases}$. Podaj $y$.`,
    answer: 8,
    verify: () => 2 * (12 / 3),
    hints: [
      r`Czy któraś niewiadoma jest już wyznaczona?`,
      r`Wstaw $y = 2x$ do drugiego równania.`,
      r`$x + 2x = 12$, czyli $3x = 12$.`,
      r`$x = 4$, a $y = 2x$.`,
    ],
    steps: [r`$x + 2x = 12 \Rightarrow x = 4$.`, r`$y = 2 \cdot 4 = 8$.`],
    errors: [
      ['4', r`Podane $x$ zamiast $y$.`, 'Pytanie jest o y — po wyznaczeniu x trzeba jeszcze policzyć y.'],
      ['6', r`Przyjęte $y = \frac{12}{2}$ bez rozwiązania układu.`, 'Obie równości muszą być spełnione jednocześnie.'],
    ],
  }),
  choice({
    id: 'e-sys-3',
    skill: 'eq-system',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Rozwiązaniem układu $\begin{cases} 3x - y = 5 \\ x + y = 7 \end{cases}$ jest para`,
    choices: [r`$x = 3,\ y = 4$`, r`$x = 4,\ y = 3$`, r`$x = 2,\ y = 5$`, r`$x = 2,\ y = 1$`],
    answer: 'A',
    hints: [
      'Która niewiadoma zniknie po dodaniu równań?',
      r`$4x = 12$.`,
      r`$x = 3$, a potem $y = 7 - x$.`,
      'Sprawdź parę w obu równaniach.',
    ],
    steps: [r`Dodaję stronami: $4x = 12$, $x = 3$.`, r`$y = 7 - 3 = 4$.`],
    errors: [
      ['B', 'Zamienione miejscami x i y.', 'Sprawdź: 3·4 − 3 = 9, a nie 5.'],
      ['C', 'Para spełnia tylko drugie równanie.', 'Rozwiązanie układu musi spełniać oba równania.'],
      ['D', 'Para spełnia tylko pierwsze równanie.', 'Rozwiązanie układu musi spełniać oba równania.'],
    ],
  }),
  numeric({
    id: 'e-sys-4',
    skill: 'eq-system',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż układ $\begin{cases} 2x + 3y = 12 \\ 3x - 2y = 5 \end{cases}$. Podaj sumę $x + y$.`,
    answer: 5,
    verify: () => {
      const det = 2 * -2 - 3 * 3;
      const x = (12 * -2 - 3 * 5) / det;
      const y = (2 * 5 - 3 * 12) / det;
      return x + y;
    },
    hints: [
      'Jak dobrać mnożniki, żeby przy y stały liczby przeciwne?',
      r`Pierwsze razy $2$, drugie razy $3$: $4x + 6y = 24$ i $9x - 6y = 15$.`,
      r`Po dodaniu: $13x = 39$.`,
      r`$x = 3$ — wstaw do pierwszego równania.`,
    ],
    steps: [r`$13x = 39 \Rightarrow x = 3$.`, r`$6 + 3y = 12 \Rightarrow y = 2$.`, r`$x + y = 5$.`],
    errors: [['3', r`Podane tylko $x$.`, r`Pytanie jest o $x + y$.`]],
  }),
  numeric({
    id: 'e-sys-5',
    skill: 'eq-system',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Suma dwóch liczb wynosi $50$, a ich różnica $14$. Oblicz większą z nich.`,
    answer: 32,
    verify: () => (50 + 14) / 2,
    hints: [
      'Jak zapisać oba warunki jako układ?',
      r`$a + b = 50$ i $a - b = 14$.`,
      r`Dodaj stronami: $2a = 64$.`,
      r`$a = 64 : 2$.`,
    ],
    steps: [r`$2a = 64 \Rightarrow a = 32$.`, r`$b = 18$ — większa to $32$.`],
    errors: [['18', 'Podana mniejsza liczba.', 'Pytanie jest o większą z nich.']],
  }),
  choice({
    id: 'e-sys-6',
    skill: 'eq-system',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Układ równań $\begin{cases} x + 2y = 3 \\ 2x + 4y = 5 \end{cases}$`,
    choices: [
      'ma dokładnie jedno rozwiązanie',
      'nie ma rozwiązań',
      'ma nieskończenie wiele rozwiązań',
      r`ma rozwiązanie $x = 3,\ y = 0$`,
    ],
    answer: 'B',
    hints: [
      'Porównaj lewe strony obu równań — co zauważasz?',
      r`Lewa strona drugiego to lewa strona pierwszego razy $2$.`,
      r`Gdyby oba były prawdziwe, $2x + 4y$ musiałoby równać się $6$ i $5$ naraz.`,
      'To sprzeczność.',
    ],
    steps: [r`Z pierwszego: $2x + 4y = 6$.`, r`Drugie mówi $2x + 4y = 5$ — sprzeczność, brak rozwiązań.`],
    errors: [
      ['A', 'Nie zauważono proporcjonalności lewych stron.', 'Proste równoległe nie mają punktu wspólnego.'],
      ['C', 'Proporcjonalne są lewe strony, ale prawe już nie.', 'Nieskończenie wiele rozwiązań jest tylko wtedy, gdy całe równania są proporcjonalne.'],
      ['D', 'Sprawdzone tylko pierwsze równanie.', 'Para musi spełniać oba równania: 2·3 + 0 = 6, a nie 5.'],
    ],
  }),
  numeric({
    id: 'e-sys-7',
    skill: 'eq-system',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`W skarbonce jest $20$ monet: dwuzłotówki i pięciozłotówki, razem $70$ zł. Ile jest pięciozłotówek?`,
    answer: 10,
    verify: () => (70 - 2 * 20) / (5 - 2),
    hints: [
      'Jakie dwa równania opisują liczbę monet i ich wartość?',
      r`$d + p = 20$ oraz $2d + 5p = 70$.`,
      r`Wstaw $d = 20 - p$: $2(20 - p) + 5p = 70$.`,
      r`$40 + 3p = 70$.`,
    ],
    steps: [r`$2(20 - p) + 5p = 70$.`, r`$40 + 3p = 70 \Rightarrow p = 10$.`],
    errors: [['12.5', 'Liczba dwuzłotówek nie pomnożona przez ich wartość.', r`Wartość dwuzłotówek to $2d$, nie $d$.`]],
  }),
  numeric({
    id: 'e-sys-8',
    skill: 'eq-system',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dwa pociągi wyjechały jednocześnie naprzeciw siebie z miast odległych o $300$ km. Pierwszy jedzie o $20$ km/h szybciej niż drugi. Spotkały się po $2$ godzinach. Oblicz prędkość wolniejszego pociągu (w km/h).`,
    answer: 65,
    verify: () => (300 / 2 - 20) / 2,
    hints: [
      'Jaką drogę pokonał każdy pociąg do chwili spotkania?',
      r`Wolniejszy: $2v$, szybszy: $2(v + 20)$.`,
      r`Razem przejechały całą odległość: $2v + 2(v + 20) = 300$.`,
      r`$4v + 40 = 300$.`,
    ],
    steps: [r`$2v + 2(v + 20) = 300$.`, r`$4v + 40 = 300 \Rightarrow v = 65$ km/h.`],
    errors: [
      ['85', 'Podana prędkość szybszego pociągu.', 'Pytanie jest o wolniejszy.'],
      ['70', 'Różnica prędkości nie pomnożona przez czas jazdy.', r`Przez $2$ godziny szybszy zyskuje $2 \cdot 20 = 40$ km.`],
    ],
  }),

  // -------------------------------------------------------------------------
  // eq-rational
  // -------------------------------------------------------------------------
  numeric({
    id: 'e-rat-1',
    skill: 'eq-rational',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiąż równanie $\frac{x - 5}{x + 1} = 0$.`,
    answer: 5,
    verify: () => 5,
    hints: [
      'Kiedy ułamek jest równy zero?',
      'Gdy licznik jest zerem, a mianownik nie.',
      r`$x - 5 = 0$ i $x \ne -1$.`,
      r`Rozwiąż $x - 5 = 0$.`,
    ],
    steps: [r`Dziedzina: $x \ne -1$.`, r`$x - 5 = 0 \Rightarrow x = 5$.`],
    errors: [['-1', 'Wyznaczone zero mianownika zamiast licznika.', 'Ułamek jest zerem, gdy licznik jest zerem.']],
  }),
  numeric({
    id: 'e-rat-2',
    skill: 'eq-rational',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiąż równanie $\frac{6}{x} = 2$.`,
    answer: 3,
    verify: () => 6 / 2,
    hints: [
      'Czego nie może być równe x?',
      r`$x \ne 0$. Pomnóż obie strony przez $x$.`,
      r`$6 = 2x$.`,
      r`Podziel przez $2$.`,
    ],
    steps: [r`$6 = 2x$.`, r`$x = 3$ — należy do dziedziny.`],
    errors: [['12', 'Pomnożone zamiast podzielone.', r`Z $6 = 2x$ wynika $x = 6 : 2$.`]],
  }),
  choice({
    id: 'e-rat-3',
    skill: 'eq-rational',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Równanie $\frac{x^2 - 4}{x - 2} = 0$ ma`,
    choices: [
      r`dokładnie jedno rozwiązanie: $x = -2$`,
      r`dwa rozwiązania: $x = -2$ i $x = 2$`,
      r`dokładnie jedno rozwiązanie: $x = 2$`,
      'zero rozwiązań',
    ],
    answer: 'A',
    hints: [
      'Jaka liczba jest wykluczona z dziedziny?',
      r`$x \ne 2$.`,
      r`Licznik: $x^2 - 4 = 0$ dla $x = \pm 2$.`,
      r`Które z tych rozwiązań należy do dziedziny?`,
    ],
    steps: [r`Dziedzina: $x \ne 2$. Licznik zeruje się dla $x = \pm 2$.`, r`Zostaje tylko $x = -2$.`],
    errors: [
      ['B', r`Nie odrzucono $x = 2$, które zeruje mianownik.`, 'Rozwiązania spoza dziedziny trzeba odrzucić.'],
      ['C', 'Odrzucone nie to rozwiązanie, które trzeba.', r`Wykluczona jest liczba zerująca mianownik: $x = 2$.`],
      ['D', 'Uznano, że odrzucenie jednego rozwiązania usuwa oba.', r`$x = -2$ zeruje licznik i nie zeruje mianownika — jest rozwiązaniem.`],
    ],
  }),
  numeric({
    id: 'e-rat-4',
    skill: 'eq-rational',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $\frac{2x - 1}{x + 2} = 3$.`,
    answer: -7,
    verify: () => {
      // 2x - 1 = 3x + 6
      return -1 - 6;
    },
    hints: [
      'Jaka liczba jest poza dziedziną?',
      r`$x \ne -2$. Pomnóż obie strony przez $x + 2$.`,
      r`$2x - 1 = 3(x + 2) = 3x + 6$.`,
      r`Przenieś wyrazy z $x$ na jedną stronę.`,
    ],
    steps: [r`$2x - 1 = 3x + 6$.`, r`$-x = 7 \Rightarrow x = -7$ — należy do dziedziny.`],
    errors: [['-3', r`Mianownik pomnożony przez $3$ tylko częściowo: $3x + 2$.`, r`$3(x + 2) = 3x + 6$.`]],
  }),
  numeric({
    id: 'e-rat-5',
    skill: 'eq-rational',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $\frac{x + 1}{x - 1} = \frac{x + 3}{x}$.`,
    answer: 3,
    verify: () => {
      // x(x+1) = (x+3)(x-1)  =>  x^2 + x = x^2 + 2x - 3  =>  x = 3
      return 3;
    },
    hints: [
      'Jakie liczby trzeba wykluczyć?',
      r`$x \ne 1$ i $x \ne 0$. Pomnóż „na krzyż”.`,
      r`$x(x + 1) = (x + 3)(x - 1)$.`,
      r`$x^2 + x = x^2 + 2x - 3$ — wyrazy $x^2$ się skracają.`,
    ],
    steps: [r`$x^2 + x = x^2 + 2x - 3$.`, r`$-x = -3 \Rightarrow x = 3$ — należy do dziedziny.`],
    errors: [['-3', r`Zły znak przy przenoszeniu: $x - 2x = -3$ daje $x = 3$, nie $-3$.`, r`$-x = -3 \iff x = 3$.`]],
  }),
  numeric({
    id: 'e-rat-6',
    skill: 'eq-rational',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $\frac{x^2 - 5x + 6}{x - 2} = 0$. Podaj sumę wszystkich rozwiązań.`,
    answer: 3,
    verify: () => [2, 3].filter((x) => x !== 2).reduce((a, b) => a + b, 0),
    hints: [
      'Jakiej liczby nie ma w dziedzinie?',
      r`$x \ne 2$. Licznik rozłóż na czynniki.`,
      r`Szukaj dwóch liczb o sumie $5$ i iloczynie $6$.`,
      r`$x^2 - 5x + 6 = (x - 2)(x - 3)$ — które z zer licznika zostaje?`,
    ],
    steps: [r`$(x-2)(x-3) = 0$ dla $x \in \{2, 3\}$.`, r`$x = 2$ poza dziedziną — zostaje $x = 3$.`],
    errors: [['5', r`Nie odrzucono $x = 2$ spoza dziedziny.`, 'Rozwiązanie zerujące mianownik odrzucasz.']],
  }),
  numeric({
    id: 'e-rat-7',
    skill: 'eq-rational',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Kran A napełnia zbiornik w $x$ godzin, a kran B w $2x$ godzin. Oba razem napełniają go w $4$ godziny, więc $\frac{1}{x} + \frac{1}{2x} = \frac{1}{4}$. Oblicz $x$.`,
    answer: 6,
    verify: () => 1.5 * 4,
    hints: [
      'Jak dodać ułamki po lewej stronie?',
      r`Wspólny mianownik: $2x$. $\frac{2}{2x} + \frac{1}{2x} = \frac{3}{2x}$.`,
      r`$\frac{3}{2x} = \frac{1}{4}$ — pomnóż na krzyż.`,
      r`$2x = 12$.`,
    ],
    steps: [r`$\frac{3}{2x} = \frac{1}{4}$.`, r`$2x = 12 \Rightarrow x = 6$ godzin.`],
    errors: [[['4/3'], r`Dodane mianowniki: $\frac{1}{x} + \frac{1}{2x} \ne \frac{1}{3x}$.`, 'Ułamki dodaje się przez wspólny mianownik.']],
  }),
  numeric({
    id: 'e-rat-8',
    skill: 'eq-rational',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla jakiej wartości $a$ równanie $\frac{x + a}{x - 1} = 2$ nie ma rozwiązania?`,
    answer: -1,
    verify: () => {
      // x + a = 2x - 2  =>  x = a + 2; brak rozwiązania, gdy x = 1
      return 1 - 2;
    },
    hints: [
      r`Rozwiąż równanie tak, jakby $a$ było liczbą. Ile wychodzi $x$?`,
      r`$x + a = 2x - 2$, więc $x = a + 2$.`,
      r`Kiedy to rozwiązanie jest niedozwolone?`,
      r`Gdy wypada poza dziedziną: $a + 2 = 1$.`,
    ],
    steps: [r`$x = a + 2$, a dziedzina wymaga $x \ne 1$.`, r`$a + 2 = 1 \Rightarrow a = -1$ — wtedy rozwiązania nie ma.`],
    errors: [['1', r`Zły znak: $a + 2 = 1$ daje $a = -1$.`, 'Przeniesienie liczby na drugą stronę zmienia jej znak.']],
  }),

  // -------------------------------------------------------------------------
  // eq-abs (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'e-abs-1',
    skill: 'eq-abs',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Ile rozwiązań ma równanie $|x - 2| = 5$?`,
    answer: 2,
    verify: () => [-3, 7].filter((x) => Math.abs(x - 2) === 5).length,
    hints: [
      r`Co oznacza $|x - 2|$ na osi liczbowej?`,
      r`Odległość $x$ od liczby $2$.`,
      'W ile stron od 2 można odmierzyć odległość 5?',
      r`$2 + 5$ i $2 - 5$.`,
    ],
    steps: [r`$x - 2 = 5$ lub $x - 2 = -5$.`, r`$x = 7$ lub $x = -3$ — dwa rozwiązania.`],
    errors: [['1', 'Rozpatrzony tylko przypadek bez minusa.', 'Odległość można odmierzyć w obie strony.']],
  }),
  numeric({
    id: 'e-abs-2',
    skill: 'eq-abs',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiąż równanie $|2x + 1| = 7$. Podaj iloczyn jego rozwiązań.`,
    answer: -12,
    verify: () => 3 * -4,
    hints: [
      'Na jakie dwa zwykłe równania rozkłada się to równanie?',
      r`$2x + 1 = 7$ lub $2x + 1 = -7$.`,
      r`$x = 3$ lub $x = -4$.`,
      r`Pomnóż oba rozwiązania.`,
    ],
    steps: [r`$2x + 1 = \pm 7$, więc $x = 3$ lub $x = -4$.`, r`Iloczyn: $3 \cdot (-4) = -12$.`],
    errors: [['12', 'Zgubiony minus w iloczynie.', 'Iloczyn liczby dodatniej i ujemnej jest ujemny.']],
  }),
  choice({
    id: 'e-abs-3',
    skill: 'eq-abs',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Równanie $|x + 4| = -2$`,
    choices: ['nie ma rozwiązań', r`ma dwa rozwiązania: $-6$ i $-2$`, r`ma jedno rozwiązanie: $-2$`, 'ma nieskończenie wiele rozwiązań'],
    answer: 'A',
    hints: [
      'Jakie wartości może przyjmować wartość bezwzględna?',
      'Moduł jest zawsze nieujemny.',
      r`Czy odległość może wynosić $-2$?`,
      'Takiej liczby x nie ma.',
    ],
    steps: [r`$|x + 4| \ge 0$ dla każdego $x$.`, 'Nie może być równe −2 — brak rozwiązań.'],
    errors: [
      ['B', r`Równanie rozwiązane jak $|x + 4| = 2$.`, 'Moduł nie bywa ujemny — przy ujemnej prawej stronie nie ma rozwiązań.'],
      ['C', 'Moduł zdjęty tylko z jednym znakiem.', 'Moduł nie bywa ujemny — przy ujemnej prawej stronie nie ma rozwiązań.'],
      ['D', 'Pomylona sprzeczność z tożsamością.', 'Nie istnieje x, dla którego odległość jest ujemna.'],
    ],
  }),
  numeric({
    id: 'e-abs-4',
    skill: 'eq-abs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $|x - 1| + |x + 2| = 5$. Podaj sumę jego rozwiązań.`,
    answer: -1,
    verify: () => {
      const sols: number[] = [];
      for (let x = -100; x <= 100; x += 1) if (Math.abs(x - 1) + Math.abs(x + 2) === 5) sols.push(x);
      return sols.reduce((a, b) => a + b, 0);
    },
    hints: [
      'W jakich punktach wyrażenia pod modułami zmieniają znak?',
      r`$x = 1$ i $x = -2$ — to dzieli oś na trzy przedziały.`,
      r`Dla $x \ge 1$ wychodzi $x = 2$. Co dają pozostałe przedziały?`,
      r`Dla $x < -2$: $-2x - 1 = 5$.`,
    ],
    steps: [
      r`$x < -2$: $x = -3$. $-2 \le x < 1$: sprzeczność. $x \ge 1$: $x = 2$.`,
      r`Suma: $-3 + 2 = -1$.`,
    ],
    errors: [['2', r`Pominięte rozwiązanie z przedziału $x < -2$.`, 'Trzeba rozpatrzyć wszystkie przedziały.']],
  }),
  numeric({
    id: 'e-abs-5',
    skill: 'eq-abs',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Ile liczb całkowitych spełnia nierówność $|x - 3| + |x + 1| \le 6$?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let x = -100; x <= 100; x += 1) if (Math.abs(x - 3) + Math.abs(x + 1) <= 6) n += 1;
      return n;
    },
    hints: [
      r`Co na osi oznacza suma $|x - 3| + |x + 1|$?`,
      r`Sumę odległości od $3$ i od $-1$. Między nimi wynosi ona $4$.`,
      r`Dla $x \ge 3$: $2x - 2 \le 6$. Dla $x \le -1$: $-2x + 2 \le 6$.`,
      r`$x \le 4$ oraz $x \ge -2$.`,
    ],
    steps: [r`Rozwiązanie: $x \in \langle -2, 4 \rangle$.`, r`Liczby całkowite: $-2, -1, \ldots, 4$ — siedem.`],
    errors: [['5', 'Uwzględniony tylko odcinek między punktami krytycznymi.', 'Poza odcinkiem suma odległości też może spełniać nierówność.']],
  }),
  numeric({
    id: 'e-abs-6',
    skill: 'eq-abs',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Rozwiąż równanie $|x - 2| = 2x - 1$.`,
    answer: 1,
    verify: () => {
      for (let x = -100; x <= 100; x += 0.5) if (Math.abs(x - 2) === 2 * x - 1) return x;
      return NaN;
    },
    hints: [
      r`Gdzie wyrażenie $x - 2$ zmienia znak?`,
      r`Dla $x \ge 2$: $x - 2 = 2x - 1$. Dla $x < 2$: $-(x - 2) = 2x - 1$.`,
      r`W pierwszym przypadku wychodzi liczba — czy należy do przedziału $x \ge 2$?`,
      r`Drugi przypadek: $-x + 2 = 2x - 1$.`,
    ],
    steps: [
      r`$x \ge 2$: $x = -1$ — poza przedziałem, odrzucam.`,
      r`$x < 2$: $3 = 3x$, $x = 1$ — w przedziale.`,
    ],
    errors: [['-1', r`Nie sprawdzono, że $-1$ nie należy do przedziału $x \ge 2$.`, 'Rozwiązanie musi należeć do przedziału, w którym je wyznaczono.']],
  }),
  numeric({
    id: 'e-abs-7',
    skill: 'eq-abs',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Punkt $x$ leży na osi między $-2$ a $4$ i jest dwa razy bliżej punktu $4$ niż punktu $-2$. Oblicz $x$.`,
    answer: 2,
    verify: () => (8 - 2) / 3,
    hints: [
      'Jak zapisać „dwa razy bliżej” przy pomocy odległości?',
      r`Odległość od punktu $4$ ma być połową odległości od punktu $-2$.`,
      r`Między punktami odległość od $4$ to $4 - x$, a od $-2$ to $x - (-2)$.`,
      r`$8 - 2x = x + 2$.`,
    ],
    steps: [r`$4 - x = \frac{x + 2}{2}$.`, r`$8 - 2x = x + 2 \Rightarrow x = 2$.`],
    errors: [['0', r`Odwrócony warunek: punkt dwa razy bliżej $-2$.`, r`„Bliżej 4” — mniejsza jest odległość od 4.`]],
  }),
  numeric({
    id: 'e-abs-8',
    skill: 'eq-abs',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile jest liczb całkowitych $m$ z przedziału $\langle 0, 10 \rangle$, dla których równanie $|x - 1| + |x - 5| = m$ ma co najmniej jedno rozwiązanie?`,
    answer: 7,
    verify: () => {
      let n = 0;
      for (let m = 0; m <= 10; m += 1) {
        let has = false;
        for (let x = -50; x <= 50; x += 0.5) if (Math.abs(x - 1) + Math.abs(x - 5) === m) has = true;
        if (has) n += 1;
      }
      return n;
    },
    hints: [
      r`Jaką najmniejszą wartość może mieć suma odległości od $1$ i od $5$?`,
      r`Dla $x$ między $1$ a $5$ suma wynosi dokładnie $4$ — mniej się nie da.`,
      r`Poza odcinkiem suma rośnie bez ograniczeń.`,
      r`Rozwiązanie istnieje dla $m \ge 4$.`,
    ],
    steps: [r`Najmniejsza wartość lewej strony to $4$.`, r`Równanie ma rozwiązanie dla $m \in \{4, 5, \ldots, 10\}$ — siedem wartości.`],
    errors: [
      ['6', r`Pominięte $m = 4$ — wtedy rozwiązaniem jest cały odcinek $\langle 1, 5 \rangle$.`, 'Najmniejsza wartość też jest osiągana.'],
      ['11', 'Nie zauważono, że suma odległości jest co najmniej 4.', 'Suma odległości od dwóch punktów nie może być mniejsza niż odległość między nimi.'],
    ],
  }),

  // -------------------------------------------------------------------------
  // eq-system-param (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'e-par-1',
    skill: 'eq-system-param',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz wyznacznik $W = a_1b_2 - a_2b_1$ układu $\begin{cases} 3x + 2y = 1 \\ x + 4y = 5 \end{cases}$.`,
    answer: 10,
    verify: () => 3 * 4 - 1 * 2,
    hints: [
      r`Co jest tu $a_1, b_1, a_2, b_2$?`,
      r`$a_1 = 3$, $b_1 = 2$, $a_2 = 1$, $b_2 = 4$.`,
      r`$W = 3 \cdot 4 - 1 \cdot 2$.`,
      r`$12 - 2$.`,
    ],
    steps: [r`$W = 3 \cdot 4 - 1 \cdot 2 = 12 - 2 = 10$.`, 'W jest różne od zera — układ ma dokładnie jedno rozwiązanie.'],
    errors: [
      ['14', 'Iloczyny dodane zamiast odjęte.', r`$W = a_1b_2 - a_2b_1$.`],
      ['-10', 'Zła kolejność iloczynów.', r`$W = a_1b_2 - a_2b_1$, a nie odwrotnie.`],
    ],
  }),
  numeric({
    id: 'e-par-2',
    skill: 'eq-system-param',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Dla jakiej wartości $m$ proste $y = mx + 1$ i $y = 3x - 2$ są równoległe?`,
    answer: 3,
    verify: () => 3,
    hints: [
      'Co decyduje o nachyleniu prostej w postaci y = ax + b?',
      r`Współczynnik kierunkowy $a$.`,
      'Proste równoległe mają jednakowe nachylenie.',
      r`Porównaj $m$ z współczynnikiem drugiej prostej.`,
    ],
    steps: [r`Równoległość: równe współczynniki kierunkowe.`, r`$m = 3$.`],
    errors: [[['-1/3'], 'Pomylona równoległość z prostopadłością.', 'Proste równoległe mają ten sam współczynnik kierunkowy.']],
  }),
  choice({
    id: 'e-par-3',
    skill: 'eq-system-param',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Układ $\begin{cases} 2x - y = 3 \\ 4x - 2y = 6 \end{cases}$`,
    choices: ['ma nieskończenie wiele rozwiązań', 'nie ma rozwiązań', 'ma dokładnie jedno rozwiązanie', r`ma tylko rozwiązanie $x = 0,\ y = -3$`],
    answer: 'A',
    hints: [
      'Czy drugie równanie da się otrzymać z pierwszego?',
      r`Pomnóż pierwsze równanie przez $2$.`,
      r`$4x - 2y = 6$ — dokładnie drugie równanie.`,
      'To ta sama prosta.',
    ],
    steps: [r`Drugie równanie to pierwsze razy $2$ — obie strony.`, 'Ta sama prosta: nieskończenie wiele rozwiązań.'],
    errors: [
      ['B', 'W = 0 utożsamione z brakiem rozwiązań.', 'Trzeba sprawdzić wyrazy wolne — tu też są proporcjonalne.'],
      ['C', 'Nie zauważono proporcjonalności równań.', 'Proste pokrywające się mają nieskończenie wiele punktów wspólnych.'],
      ['D', 'Znaleziono jedną parę i uznano ją za jedyną.', 'Każdy punkt prostej 2x − y = 3 jest rozwiązaniem.'],
    ],
  }),
  numeric({
    id: 'e-par-4',
    skill: 'eq-system-param',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla jakiej wartości $m$ układ $\begin{cases} mx + 2y = 4 \\ 2x + y = 3 \end{cases}$ nie ma rozwiązań?`,
    answer: 4,
    verify: () => {
      // W = m - 4 = 0; dla m = 4: 4x + 2y = 4 vs 2x + y = 3 (sprzeczne)
      const m = 4;
      return m * 1 - 2 * 2 === 0 && 4 / 2 !== 3 ? m : NaN;
    },
    hints: [
      'Kiedy układ nie ma dokładnie jednego rozwiązania?',
      r`Gdy $W = m \cdot 1 - 2 \cdot 2 = 0$.`,
      r`$m = 4$. Sprawdź wyrazy wolne dla tego $m$.`,
      r`$4x + 2y = 4$ to $2x + y = 2$, a drugie mówi $2x + y = 3$.`,
    ],
    steps: [r`$W = m - 4 = 0 \Rightarrow m = 4$.`, r`Dla $m = 4$ równania są sprzeczne — brak rozwiązań.`],
    errors: [['-4', r`Zły znak przy rozwiązaniu $m - 4 = 0$.`, r`$m - 4 = 0 \iff m = 4$.`]],
  }),
  numeric({
    id: 'e-par-5',
    skill: 'eq-system-param',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Dla jakiej wartości $m$ układ $\begin{cases} x + my = 2 \\ 2x + 4y = 4 \end{cases}$ ma nieskończenie wiele rozwiązań?`,
    answer: 2,
    verify: () => {
      const m = 2;
      return 1 * 4 - 2 * m === 0 && 2 * 2 === 4 ? m : NaN;
    },
    hints: [
      r`Kiedy $W = 0$?`,
      r`$W = 4 - 2m = 0$.`,
      r`$m = 2$ — sprawdź, czy równania są wtedy proporcjonalne w całości.`,
      r`$x + 2y = 2$ razy $2$ to $2x + 4y = 4$.`,
    ],
    steps: [r`$4 - 2m = 0 \Rightarrow m = 2$.`, 'Dla m = 2 równania opisują tę samą prostą — nieskończenie wiele rozwiązań.'],
    errors: [['4', r`Porównany współczynnik $b_2 = 4$ z $m$ zamiast wyznaczenia $W = 0$.`, r`Warunek to $W = a_1b_2 - a_2b_1 = 0$.`]],
  }),
  numeric({
    id: 'e-par-6',
    skill: 'eq-system-param',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Dla jakiej wartości $m$ układ $\begin{cases} 2x + 3y = m \\ 4x + 6y = 8 \end{cases}$ ma nieskończenie wiele rozwiązań?`,
    answer: 4,
    verify: () => 8 / 2,
    hints: [
      'Jak ma się lewa strona drugiego równania do lewej strony pierwszego?',
      r`Jest dwa razy większa: $4x + 6y = 2(2x + 3y)$.`,
      r`Żeby równania były tą samą prostą, prawa strona też musi być dwa razy większa.`,
      r`$2m = 8$.`,
    ],
    steps: [r`Drugie równanie: $2x + 3y = 4$.`, r`Ta sama prosta, gdy $m = 4$.`],
    errors: [['8', r`Nie podzielono drugiego równania przez $2$.`, 'Porównuj równania po sprowadzeniu do tych samych współczynników przy x i y.']],
  }),
  numeric({
    id: 'e-par-7',
    skill: 'eq-system-param',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Proste $2x + my = 1$ oraz $mx + 8y = 3$ są równoległe i różne. Podaj dodatnią wartość $m$.`,
    answer: 4,
    verify: () => Math.sqrt(16),
    hints: [
      'Jaki warunek na wyznacznik daje proste równoległe?',
      r`$W = 2 \cdot 8 - m \cdot m = 0$.`,
      r`$m^2 = 16$.`,
      r`Dodatnia liczba, której kwadrat to $16$.`,
    ],
    steps: [r`$16 - m^2 = 0 \Rightarrow m = \pm 4$.`, r`Dodatnia wartość: $m = 4$ (proste $2x + 4y = 1$ i $4x + 8y = 3$ są różne).`],
    errors: [['16', r`Z $m^2 = 16$ przyjęte $m = 16$.`, r`$m^2 = 16 \iff m = \pm 4$.`]],
  }),
  numeric({
    id: 'e-par-8',
    skill: 'eq-system-param',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Dla ilu liczb całkowitych $m$ z przedziału $\langle -10, 10 \rangle$ układ $\begin{cases} mx + y = 1 \\ x + y = m \end{cases}$ ma dokładnie jedno rozwiązanie?`,
    answer: 20,
    verify: () => {
      let n = 0;
      for (let m = -10; m <= 10; m += 1) if (m * 1 - 1 * 1 !== 0) n += 1;
      return n;
    },
    hints: [
      'Kiedy układ ma dokładnie jedno rozwiązanie?',
      r`Gdy $W = m \cdot 1 - 1 \cdot 1 \ne 0$.`,
      r`$W = m - 1$, więc wykluczasz $m = 1$.`,
      r`Ile liczb całkowitych jest w $\langle -10, 10 \rangle$?`,
    ],
    steps: [r`$W = m - 1 \ne 0 \iff m \ne 1$.`, r`W przedziale jest $21$ liczb całkowitych, bez $m = 1$ zostaje $20$.`],
    errors: [['21', r`Nie wykluczono $m = 1$.`, r`Dla $m = 1$ wyznacznik jest zerem.`]],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const EQUATIONS_CARDS: Flashcard[] = [
  card('c-eq-lin-1', 'eq-linear', 'metoda', 'Plan rozwiązania równania liniowego?', r`Nawiasy i ułamki precz → wyrazy z $x$ na jedną stronę → podziel przez współczynnik.`),
  card('c-eq-lin-2', 'eq-linear', 'pulapka', r`$\frac{x}{2} + 1 = 4$ razy $2$ to?`, r`$x + 2 = 8$ — mnożysz KAŻDY wyraz, także jedynkę.`),
  card('c-eq-lin-3', 'eq-linear', 'definicja', 'Równanie sprzeczne a tożsamościowe?', r`Sprzeczne: $x$ znika i zostaje fałsz ($0 = 5$). Tożsamościowe: zostaje prawda ($0 = 0$).`),

  card('c-eq-ineq-1', 'ineq-linear', 'pulapka', 'Kiedy odwracasz znak nierówności?', 'Przy mnożeniu lub dzieleniu obu stron przez liczbę UJEMNĄ.'),
  card('c-eq-ineq-2', 'ineq-linear', 'definicja', r`Nawias przy $\ge$ i przy $>$?`, r`$\ge$ — ostry (koniec należy), $>$ — okrągły. Przy nieskończoności zawsze okrągły.`),
  card('c-eq-ineq-3', 'ineq-linear', 'metoda', 'Jak sprawdzić rozwiązanie nierówności?', 'Wstaw jedną liczbę z przedziału i jedną spoza niego.'),

  card('c-eq-sys-1', 'eq-system', 'metoda', 'Metoda przeciwnych współczynników?', 'Pomnóż równania tak, by przy jednej niewiadomej stały liczby przeciwne, i dodaj stronami.'),
  card('c-eq-sys-2', 'eq-system', 'definicja', 'Ile rozwiązań może mieć układ dwóch równań liniowych?', 'Jedno (proste się przecinają), zero (równoległe) albo nieskończenie wiele (te same).'),
  card('c-eq-sys-3', 'eq-system', 'pulapka', 'Co jest odpowiedzią do układu równań?', 'Para liczb — i trzeba ją sprawdzić w obu równaniach.'),

  card('c-eq-rat-1', 'eq-rational', 'wzor', r`$\frac{W(x)}{V(x)} = 0 \iff \;?$`, r`$W(x) = 0$ i $V(x) \ne 0$.`),
  card('c-eq-rat-2', 'eq-rational', 'metoda', 'Kolejność przy równaniu wymiernym?', 'Dziedzina → rozwiązanie → odrzucenie rozwiązań spoza dziedziny.'),
  card('c-eq-rat-3', 'eq-rational', 'pulapka', r`Rozwiązania $\frac{x^2 - 4}{x - 2} = 0$?`, r`Tylko $x = -2$ — liczba $2$ zeruje mianownik.`),

  card('c-eq-abs-1', 'eq-abs', 'metoda', 'Metoda przedziałów dla modułów?', 'Punkty krytyczne → przedziały → zdejmij moduły ze znakiem → rozwiąż → zostaw tylko rozwiązania z przedziału.'),
  card('c-eq-abs-2', 'eq-abs', 'wzor', r`$|w(x)| < a$ dla $a > 0$ to?`, r`$-a < w(x) < a$`),
  card('c-eq-abs-3', 'eq-abs', 'pulapka', r`Ile rozwiązań ma $|x| = -3$?`, 'Zero — moduł nie bywa ujemny.'),

  card('c-eq-par-1', 'eq-system-param', 'wzor', 'Wyznacznik układu dwóch równań?', r`$W = a_1b_2 - a_2b_1$. Dokładnie jedno rozwiązanie $\iff W \ne 0$.`),
  card('c-eq-par-2', 'eq-system-param', 'pulapka', 'W = 0 — brak rozwiązań?', 'Niekoniecznie. Sprawdź wyrazy wolne: proporcjonalne → nieskończenie wiele, nieproporcjonalne → brak.'),
];

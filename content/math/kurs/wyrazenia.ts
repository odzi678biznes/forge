import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, tip, warn } from '../../authoring';

/**
 * Dział 2: Wyrażenia algebraiczne.
 *
 * Podstawa: wzory skróconego mnożenia, rozkład na czynniki, wyrażenia
 * wymierne. Rozszerzenie: sześciany i niewymierność w mianowniku. Bez tego
 * działu nie da się rozwiązać ani równania kwadratowego, ani wielomianowego.
 */

const r = String.raw;

export const ALGEBRA_TOPIC: Topic = {
  id: 'math-algebra',
  subjectId: 'math',
  name: 'Wyrażenia algebraiczne',
  summary:
    'Wzory skróconego mnożenia, rozkład na czynniki i ułamki algebraiczne — narzędzia, którymi rozwiązuje się równania.',
};

export const ALGEBRA_SKILLS: Skill[] = [
  {
    id: 'alg-expand',
    topicId: 'math-algebra',
    name: 'Wzory skróconego mnożenia',
    level: 'PP',
    ckeRequirement: 'Wyrażenia algebraiczne — kwadrat sumy i różnicy, różnica kwadratów',
    prerequisites: ['num-powers'],
    examValue: 0.75,
  },
  {
    id: 'alg-factor',
    topicId: 'math-algebra',
    name: 'Rozkład na czynniki',
    level: 'PP',
    ckeRequirement: 'Wyrażenia algebraiczne — wyłączanie wspólnego czynnika, rozkład wielomianu na czynniki',
    prerequisites: ['alg-expand'],
    examValue: 0.8,
  },
  {
    id: 'alg-rational',
    topicId: 'math-algebra',
    name: 'Wyrażenia wymierne',
    level: 'PP',
    ckeRequirement: 'Wyrażenia wymierne — dziedzina, skracanie, dodawanie i mnożenie',
    prerequisites: ['alg-factor', 'num-order'],
    examValue: 0.6,
  },
  {
    id: 'alg-cubes',
    topicId: 'math-algebra',
    name: 'Sześciany: wzory skróconego mnożenia',
    level: 'PR',
    ckeRequirement: 'Wyrażenia algebraiczne — sześcian sumy i różnicy, suma i różnica sześcianów',
    prerequisites: ['alg-expand'],
    examValue: 0.6,
  },
  {
    id: 'alg-irrational',
    topicId: 'math-algebra',
    name: 'Niewymierność w mianowniku i moduł',
    level: 'PR',
    ckeRequirement: 'Wyrażenia algebraiczne — usuwanie niewymierności z mianownika, pierwiastek z kwadratu',
    prerequisites: ['num-roots', 'alg-expand'],
    examValue: 0.65,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const ALGEBRA_LESSONS: Lesson[] = [
  {
    skillId: 'alg-expand',
    minutes: 12,
    intro:
      'Wzory skróconego mnożenia to trzy skróty, które oszczędzają czas na każdym arkuszu: przy równaniach kwadratowych, upraszczaniu wyrażeń i usuwaniu pierwiastków z mianownika. Zamiast mnożyć nawias przez nawias, zapisujesz wynik od razu.',
    blocks: [
      p(
        r`Kwadrat sumy to nawias pomnożony przez siebie: $(a+b)^2 = (a+b)(a+b)$. Jeśli wymnożysz każdy wyraz z każdym, dostaniesz $a^2 + ab + ba + b^2$ — a dwa środkowe wyrazy są takie same, więc razem dają $2ab$.`,
      ),
      f(r`(a+b)^2 = a^2 + 2ab + b^2`, 'kwadrat sumy'),
      f(r`(a-b)^2 = a^2 - 2ab + b^2`, 'kwadrat różnicy'),
      f(r`(a-b)(a+b) = a^2 - b^2`, 'różnica kwadratów'),
      tip(
        r`Najczęstszy błąd na maturze: $(a+b)^2 = a^2 + b^2$. Brakuje podwojonego iloczynu $2ab$. Sprawdzenie na liczbach: $(1+2)^2 = 9$, a $1^2 + 2^2 = 5$.`,
      ),
      p(
        r`Za $a$ i $b$ możesz wstawić cokolwiek: $(2x - 3)^2 = (2x)^2 - 2 \cdot 2x \cdot 3 + 3^2 = 4x^2 - 12x + 9$. Zwróć uwagę na nawias w $(2x)^2$ — do kwadratu idzie też dwójka.`,
      ),
      warn(r`$(2x)^2 = 4x^2$, a nie $2x^2$. Potęga dotyczy całego wyrazu, łącznie ze współczynnikiem.`),
    ],
    examples: [
      example(
        r`Rozwiń $(x+5)^2$.`,
        [
          r`Tu $a = x$, $b = 5$.`,
          r`$a^2 = x^2$, $2ab = 2 \cdot x \cdot 5 = 10x$, $b^2 = 25$.`,
          r`$(x+5)^2 = x^2 + 10x + 25$.`,
        ],
        r`$x^2 + 10x + 25$`,
      ),
      example(
        r`Oblicz $(\sqrt{3} - 1)(\sqrt{3} + 1)$.`,
        [
          [
            r`To różnica kwadratów: $a = \sqrt{3}$, $b = 1$.`,
            'Te same dwie liczby, raz z minusem, raz z plusem — to znak rozpoznawczy tego wzoru.',
          ],
          r`$a^2 - b^2 = 3 - 1 = 2$.`,
        ],
        r`$2$`,
      ),
    ],
    pitfalls: [
      r`$(a+b)^2 \ne a^2 + b^2$ — brakuje $2ab$.`,
      r`$(2x)^2 = 4x^2$ — potęguje się też współczynnik.`,
      r`W kwadracie różnicy środkowy wyraz ma minus, ale $b^2$ zawsze plus.`,
    ],
  },
  {
    skillId: 'alg-factor',
    minutes: 12,
    intro:
      'Rozkład na czynniki to zamiana sumy w iloczyn. Po co? Bo iloczyn jest równy zero tylko wtedy, gdy któryś czynnik jest zerem — tak rozwiązuje się większość równań wyższych stopni. Upraszczanie ułamków też wymaga iloczynów.',
    blocks: [
      p(
        r`Pierwszy ruch zawsze ten sam: szukasz tego, co wspólne dla wszystkich wyrazów, i wyłączasz to przed nawias. $6x^2 + 9x = 3x(2x + 3)$ — bo $3x$ dzieli oba wyrazy.`,
      ),
      tip('Sprawdzenie jest proste: wymnóż z powrotem. Jeśli wychodzi to, od czego zaczynałeś, rozkład jest dobry.'),
      p('Drugi ruch: wzory skróconego mnożenia czytane od końca. Widzisz różnicę dwóch kwadratów — zamieniasz ją na iloczyn.'),
      f(r`a^2 - b^2 = (a - b)(a + b) \qquad a^2 \pm 2ab + b^2 = (a \pm b)^2`),
      p(
        r`Trzeci ruch: grupowanie, gdy wyrazów jest cztery. $x^3 - 2x^2 + 3x - 6 = x^2(x - 2) + 3(x - 2) = (x - 2)(x^2 + 3)$.`,
      ),
      warn(r`Suma kwadratów $a^2 + b^2$ NIE rozkłada się na czynniki liniowe. $x^2 + 4 \ne (x+2)(x-2)$.`),
    ],
    examples: [
      example(
        r`Rozłóż na czynniki $x^3 - 9x$.`,
        [
          r`Wspólny czynnik to $x$: $x^3 - 9x = x(x^2 - 9)$.`,
          [
            r`$x^2 - 9$ to różnica kwadratów: $x^2 - 3^2 = (x-3)(x+3)$.`,
            'Po wyłączeniu zawsze sprawdź, czy w nawiasie nie ukrył się kolejny wzór.',
          ],
          r`$x^3 - 9x = x(x - 3)(x + 3)$.`,
        ],
        r`$x(x-3)(x+3)$`,
      ),
      example(
        r`Rozwiąż równanie $x^2 - 5x = 0$.`,
        [
          r`Wyłączam $x$: $x(x - 5) = 0$.`,
          [
            r`Iloczyn jest zerem, gdy któryś czynnik jest zerem: $x = 0$ lub $x - 5 = 0$.`,
            r`Nie dziel obu stron przez $x$ — zgubisz rozwiązanie $x = 0$.`,
          ],
          r`$x = 0$ lub $x = 5$.`,
        ],
        r`$x \in \{0, 5\}$`,
      ),
    ],
    pitfalls: [
      r`Dzielenie równania przez $x$ gubi rozwiązanie $x = 0$.`,
      r`Suma kwadratów się nie rozkłada: $x^2 + 9 \ne (x+3)(x-3)$.`,
      r`Niepełny rozkład: $x^3 - 9x = x(x^2 - 9)$ to jeszcze nie koniec.`,
    ],
  },
  {
    skillId: 'alg-rational',
    minutes: 12,
    intro:
      'Wyrażenie wymierne to ułamek, w którym są litery. Działa jak zwykły ułamek, z jedną nowością: mianownik nie może być zerem, więc najpierw ustalasz, jakich liczb nie wolno podstawić.',
    blocks: [
      p(
        r`Dziedzina to zbiór liczb, dla których wyrażenie ma sens. W $\frac{x+1}{x-3}$ nie wolno wstawić $x = 3$, bo mianownik byłby zerem. Dziedzina: $\mathbb{R} \setminus \{3\}$.`,
      ),
      tip(
        'Dziedzinę wyznaczasz ZAWSZE na początku, zanim cokolwiek skrócisz. Po skróceniu zakazana liczba znika z zapisu, ale dalej jest zakazana.',
      ),
      p(
        r`Skracanie: rozkładasz licznik i mianownik na czynniki i skreślasz wspólny CZYNNIK. $\frac{x^2 - 9}{x + 3} = \frac{(x-3)(x+3)}{x+3} = x - 3$ dla $x \ne -3$.`,
      ),
      warn(r`Skracać wolno tylko czynniki, nie składniki. $\frac{x + 2}{x} \ne 2$ — $x$ w liczniku jest składnikiem sumy.`),
      p(
        r`Dodawanie jak przy zwykłych ułamkach — przez wspólny mianownik: $\frac{1}{x} + \frac{1}{x+1} = \frac{(x+1) + x}{x(x+1)} = \frac{2x+1}{x(x+1)}$.`,
      ),
      f(r`\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd} \qquad b, d \ne 0`),
    ],
    examples: [
      example(
        r`Wyznacz dziedzinę i uprość $\frac{x^2 - 4}{x^2 + 2x}$.`,
        [
          r`Mianownik: $x^2 + 2x = x(x+2)$. Zeruje się dla $x = 0$ i $x = -2$, więc dziedzina to $\mathbb{R} \setminus \{-2, 0\}$.`,
          r`Licznik: $x^2 - 4 = (x-2)(x+2)$.`,
          [
            r`$\frac{(x-2)(x+2)}{x(x+2)} = \frac{x-2}{x}$.`,
            r`Skracamy wspólny czynnik $(x+2)$ — wolno, bo w dziedzinie $x \ne -2$.`,
          ],
        ],
        r`$\frac{x-2}{x}$ dla $x \in \mathbb{R} \setminus \{-2, 0\}$`,
      ),
      example(
        r`Oblicz $\frac{2}{x} - \frac{1}{x-1}$.`,
        [r`Wspólny mianownik: $x(x-1)$.`, r`$\frac{2(x-1) - x}{x(x-1)} = \frac{x - 2}{x(x-1)}$.`],
        r`$\frac{x-2}{x(x-1)}$`,
      ),
    ],
    pitfalls: [
      r`Skracanie składników zamiast czynników: $\frac{x+2}{x} \ne 2$.`,
      'Dziedzina liczona dopiero po skróceniu gubi zakazane liczby.',
      r`Minus przed ułamkiem zmienia znak całego licznika: $-\frac{x-1}{2} = \frac{-x+1}{2}$.`,
    ],
  },
  {
    skillId: 'alg-cubes',
    minutes: 10,
    intro:
      r`Na rozszerzeniu dochodzą wzory na sześciany. Przydają się przy wielomianach, przy rozkładzie typu $x^3 - 8$ i przy usuwaniu pierwiastka sześciennego z mianownika.`,
    blocks: [
      f(r`(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3`, 'sześcian sumy'),
      f(r`(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3`, 'sześcian różnicy'),
      f(
        r`a^3 - b^3 = (a-b)(a^2+ab+b^2) \qquad a^3 + b^3 = (a+b)(a^2-ab+b^2)`,
        'różnica i suma sześcianów',
      ),
      tip(
        r`Współczynniki $1, 3, 3, 1$ to wiersz trójkąta Pascala. W sześcianie różnicy znaki idą na przemian: $+, -, +, -$.`,
      ),
      p(
        r`Suma sześcianów da się rozłożyć (w przeciwieństwie do sumy kwadratów!): $x^3 + 8 = (x+2)(x^2 - 2x + 4)$. Drugi nawias ma ujemny wyróżnik — dalej się nie rozkłada.`,
      ),
      warn(r`W nawiasie $a^2 + ab + b^2$ środkowy wyraz to $ab$, a nie $2ab$. To nie jest kwadrat sumy.`),
    ],
    examples: [
      example(
        r`Rozwiń $(x - 2)^3$.`,
        [
          r`$a = x$, $b = 2$: $a^3 - 3a^2b + 3ab^2 - b^3$.`,
          r`$x^3 - 3 \cdot x^2 \cdot 2 + 3 \cdot x \cdot 4 - 8$.`,
          r`$x^3 - 6x^2 + 12x - 8$.`,
        ],
        r`$x^3 - 6x^2 + 12x - 8$`,
      ),
      example(
        r`Rozłóż na czynniki $27x^3 - 1$.`,
        [
          r`$27x^3 = (3x)^3$ i $1 = 1^3$ — różnica sześcianów z $a = 3x$, $b = 1$.`,
          r`$(3x - 1)\left((3x)^2 + 3x \cdot 1 + 1^2\right)$.`,
          r`$(3x - 1)(9x^2 + 3x + 1)$.`,
        ],
        r`$(3x-1)(9x^2+3x+1)$`,
      ),
    ],
    pitfalls: [
      r`$(a+b)^3 \ne a^3 + b^3$ — brakuje wyrazów $3a^2b$ i $3ab^2$.`,
      r`W $a^2 + ab + b^2$ jest $ab$, nie $2ab$.`,
      r`Znaki w $a^3 + b^3 = (a+b)(a^2 - ab + b^2)$: w drugim nawiasie jest minus.`,
    ],
  },
  {
    skillId: 'alg-irrational',
    minutes: 12,
    intro:
      r`Na rozszerzeniu wyniki często wychodzą z pierwiastkiem w mianowniku albo z kwadratem różnicy pod pierwiastkiem. Dwa narzędzia załatwiają sprawę: sprzężenie i zasada $\sqrt{a^2} = |a|$.`,
    blocks: [
      p(
        'Gdy w mianowniku jest suma lub różnica z pierwiastkiem, mnożysz licznik i mianownik przez sprzężenie — to samo wyrażenie z przeciwnym znakiem. W mianowniku pojawia się różnica kwadratów i pierwiastek znika.',
      ),
      f(r`\frac{1}{\sqrt{a} - b} = \frac{\sqrt{a} + b}{(\sqrt{a} - b)(\sqrt{a} + b)} = \frac{\sqrt{a} + b}{a - b^2}`),
      p(
        r`Pierwiastek z kwadratu to wartość bezwzględna: $\sqrt{a^2} = |a|$. Nie $a$ — bo pierwiastek kwadratowy nigdy nie jest ujemny. $\sqrt{(-5)^2} = \sqrt{25} = 5 = |-5|$.`,
      ),
      f(r`\sqrt{a^2} = |a|`),
      warn(
        r`$\sqrt{(\sqrt{3} - 2)^2} = |\sqrt{3} - 2| = 2 - \sqrt{3}$, bo $\sqrt{3} < 2$. Zanim zdejmiesz moduł, sprawdź znak wyrażenia.`,
      ),
    ],
    examples: [
      example(
        r`Usuń niewymierność z mianownika: $\frac{2}{\sqrt{5} - 1}$.`,
        [
          r`Sprzężenie mianownika to $\sqrt{5} + 1$.`,
          r`$\frac{2(\sqrt{5} + 1)}{(\sqrt{5})^2 - 1^2} = \frac{2(\sqrt{5}+1)}{4}$.`,
          r`$= \frac{\sqrt{5} + 1}{2}$.`,
        ],
        r`$\frac{\sqrt{5} + 1}{2}$`,
      ),
      example(
        r`Oblicz $\sqrt{(1 - \sqrt{2})^2} + \sqrt{2}$.`,
        [
          r`$\sqrt{(1 - \sqrt{2})^2} = |1 - \sqrt{2}|$.`,
          [
            r`$1 - \sqrt{2} < 0$, bo $\sqrt{2} \approx 1{,}41$. Zatem $|1 - \sqrt{2}| = \sqrt{2} - 1$.`,
            'Moduł liczby ujemnej to liczba przeciwna.',
          ],
          r`$\sqrt{2} - 1 + \sqrt{2} = 2\sqrt{2} - 1$.`,
        ],
        r`$2\sqrt{2} - 1$`,
      ),
    ],
    pitfalls: [
      r`$\sqrt{a^2} = a$ tylko dla $a \ge 0$ — w ogólności $|a|$.`,
      'Sprzężenie mnożysz i w liczniku, i w mianowniku.',
      r`$(\sqrt{5})^2 = 5$, nie $25$.`,
    ],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const ALGEBRA_QUESTIONS: Question[] = [
  // -------------------------------------------------------------------------
  // alg-expand
  // -------------------------------------------------------------------------
  numeric({
    id: 'a-exp-1',
    skill: 'alg-expand',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Rozwiń $(x + 3)^2$ i podaj współczynnik przy $x$.`,
    answer: 6,
    verify: () => 2 * 3,
    hints: [
      'Który wzór skróconego mnożenia tu pasuje?',
      r`$(a+b)^2 = a^2 + 2ab + b^2$, tu $a = x$, $b = 3$.`,
      r`Wyraz z $x$ to $2ab$.`,
      r`$2 \cdot x \cdot 3$ — ile to razy $x$?`,
    ],
    steps: [r`$(x+3)^2 = x^2 + 2 \cdot x \cdot 3 + 9$.`, r`$= x^2 + 6x + 9$, więc współczynnik przy $x$ to $6$.`],
    errors: [
      ['3', r`Pominięte podwojenie: $2ab = 2 \cdot x \cdot 3$.`, r`W kwadracie sumy środkowy wyraz to $2ab$.`],
      ['0', r`Pominięty wyraz środkowy — przyjęte $(a+b)^2 = a^2 + b^2$.`, r`$(a+b)^2 = a^2 + 2ab + b^2$.`],
    ],
  }),
  numeric({
    id: 'a-exp-2',
    skill: 'alg-expand',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $97 \cdot 103$, korzystając ze wzoru na różnicę kwadratów.`,
    answer: 9991,
    verify: () => 97 * 103,
    hints: [
      r`Jak zapisać $97$ i $103$ przy pomocy tej samej okrągłej liczby?`,
      r`$97 = 100 - 3$, a $103 = 100 + 3$.`,
      r`$(a-b)(a+b) = a^2 - b^2$.`,
      r`$100^2 - 3^2$.`,
    ],
    steps: [r`$97 \cdot 103 = (100 - 3)(100 + 3)$.`, r`$= 100^2 - 3^2 = 10\,000 - 9 = 9991$.`],
    errors: [['10009', r`Kwadrat $b^2$ dodany zamiast odjęty.`, r`$(a-b)(a+b) = a^2 - b^2$ — z minusem.`]],
  }),
  choice({
    id: 'a-exp-3',
    skill: 'alg-expand',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wyrażenie $(2x - 3)^2$ jest równe`,
    choices: [r`$4x^2 - 12x + 9$`, r`$4x^2 + 9$`, r`$2x^2 - 12x + 9$`, r`$4x^2 - 6x + 9$`],
    answer: 'A',
    hints: [
      r`Co jest tu wyrazem $a$, a co $b$ we wzorze na kwadrat różnicy?`,
      r`$a = 2x$, $b = 3$.`,
      r`$a^2 = (2x)^2$, $2ab = 2 \cdot 2x \cdot 3$, $b^2 = 9$.`,
      r`$(2x)^2 = 4x^2$ i $2 \cdot 2x \cdot 3 = 12x$.`,
    ],
    steps: [r`$(2x-3)^2 = (2x)^2 - 2 \cdot 2x \cdot 3 + 3^2$.`, r`$= 4x^2 - 12x + 9$.`],
    errors: [
      ['B', r`Pominięty wyraz środkowy $-2ab$.`, r`$(a-b)^2 = a^2 - 2ab + b^2$.`],
      ['C', r`$(2x)^2$ policzone jako $2x^2$.`, 'Do kwadratu podnosi się cały wyraz, także współczynnik.'],
      ['D', r`W $2ab$ zgubiona dwójka: policzone tylko $ab = 6x$.`, r`Środkowy wyraz to $2ab = 2 \cdot 2x \cdot 3$.`],
    ],
  }),
  numeric({
    id: 'a-exp-4',
    skill: 'alg-expand',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $(\sqrt{5} + 2)^2 - 4\sqrt{5}$.`,
    answer: 9,
    verify: () => (Math.sqrt(5) + 2) ** 2 - 4 * Math.sqrt(5),
    hints: [
      'Który wzór pozwoli rozwinąć nawias bez mnożenia wyraz po wyrazie?',
      r`$(a+b)^2$ z $a = \sqrt{5}$ i $b = 2$.`,
      r`$(\sqrt{5})^2 = 5$, a $2ab = 4\sqrt{5}$.`,
      r`$5 + 4\sqrt{5} + 4 - 4\sqrt{5}$ — co się skraca?`,
    ],
    steps: [r`$(\sqrt{5} + 2)^2 = 5 + 4\sqrt{5} + 4$.`, r`$9 + 4\sqrt{5} - 4\sqrt{5} = 9$.`],
    errors: [['29', r`$(\sqrt{5})^2$ policzone jako $25$.`, r`$(\sqrt{a})^2 = a$, więc $(\sqrt{5})^2 = 5$.`]],
  }),
  choice({
    id: 'a-exp-5',
    skill: 'alg-expand',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Liczba $(1 - \sqrt{2})^2$ jest równa`,
    choices: [r`$3 - 2\sqrt{2}$`, r`$-1$`, r`$3$`, r`$3 + 2\sqrt{2}$`],
    answer: 'A',
    hints: [
      'Czy to kwadrat różnicy, czy różnica kwadratów?',
      r`Kwadrat różnicy: $a = 1$, $b = \sqrt{2}$.`,
      r`$a^2 = 1$, $2ab = 2\sqrt{2}$, $b^2 = 2$.`,
      r`$1 - 2\sqrt{2} + 2$.`,
    ],
    steps: [r`$(1 - \sqrt{2})^2 = 1 - 2\sqrt{2} + 2$.`, r`$= 3 - 2\sqrt{2}$.`],
    errors: [
      ['B', r`Użyty wzór na różnicę kwadratów zamiast na kwadrat różnicy.`, r`$(a-b)^2 = a^2 - 2ab + b^2$, a $a^2 - b^2$ to zupełnie inne wyrażenie.`],
      ['C', r`Pominięty wyraz $-2ab$.`, r`$(a-b)^2 = a^2 - 2ab + b^2$.`],
      ['D', r`Zły znak wyrazu środkowego.`, r`W kwadracie różnicy wyraz $2ab$ ma minus.`],
    ],
  }),
  numeric({
    id: 'a-exp-6',
    skill: 'alg-expand',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wiadomo, że $a + b = 7$ i $ab = 10$. Oblicz $a^2 + b^2$.`,
    answer: 29,
    verify: () => 2 ** 2 + 5 ** 2,
    hints: [
      r`Jak wyrazić $a^2 + b^2$ przez $a + b$ i $ab$?`,
      r`$(a+b)^2 = a^2 + 2ab + b^2$.`,
      r`Stąd $a^2 + b^2 = (a+b)^2 - 2ab$.`,
      r`$7^2 - 2 \cdot 10$.`,
    ],
    steps: [r`$a^2 + b^2 = (a+b)^2 - 2ab$.`, r`$= 49 - 20 = 29$.`],
    errors: [
      ['49', r`Pominięte odjęcie $2ab$.`, r`$(a+b)^2$ zawiera oprócz $a^2 + b^2$ jeszcze $2ab$.`],
      ['39', r`Odjęte $ab$ zamiast $2ab$.`, r`$a^2 + b^2 = (a+b)^2 - 2ab$ — z dwójką.`],
    ],
  }),
  numeric({
    id: 'a-exp-7',
    skill: 'alg-expand',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Każdy bok kwadratu o boku $x$ wydłużono o $3$ cm. Pole wzrosło o $51\ \mathrm{cm}^2$. Oblicz $x$ (w cm).`,
    answer: 7,
    verify: () => (51 - 9) / 6,
    hints: [
      'Jakie było pole przed powiększeniem, a jakie po?',
      r`Przed: $x^2$, po: $(x+3)^2$.`,
      r`$(x+3)^2 - x^2 = 51$ — rozwiń nawias.`,
      r`$x^2 + 6x + 9 - x^2 = 51$, czyli $6x + 9 = 51$.`,
    ],
    steps: [r`$(x+3)^2 - x^2 = 6x + 9$.`, r`$6x + 9 = 51 \Rightarrow 6x = 42 \Rightarrow x = 7$.`],
    errors: [['14', r`Pominięta dwójka w $2ab$: przyjęte $(x+3)^2 = x^2 + 3x + 9$.`, r`$(x+3)^2 = x^2 + 6x + 9$.`]],
  }),
  numeric({
    id: 'a-exp-8',
    skill: 'alg-expand',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Liczba $x$ spełnia równość $x - \frac{1}{x} = 3$. Oblicz $x^2 + \frac{1}{x^2}$.`,
    answer: 11,
    verify: () => {
      const x = (3 + Math.sqrt(13)) / 2;
      return x ** 2 + 1 / x ** 2;
    },
    hints: [
      'Co otrzymasz, podnosząc obie strony równości do kwadratu?',
      r`$\left(x - \frac{1}{x}\right)^2 = x^2 - 2 \cdot x \cdot \frac{1}{x} + \frac{1}{x^2}$.`,
      r`$x \cdot \frac{1}{x} = 1$, więc środkowy wyraz to liczba.`,
      r`$x^2 - 2 + \frac{1}{x^2} = 9$ — przenieś liczbę na drugą stronę.`,
    ],
    steps: [
      r`$\left(x - \frac{1}{x}\right)^2 = x^2 - 2 + \frac{1}{x^2}$.`,
      r`$x^2 - 2 + \frac{1}{x^2} = 9$, więc $x^2 + \frac{1}{x^2} = 11$.`,
    ],
    errors: [
      ['9', r`Pominięty środkowy wyraz $-2$.`, r`$\left(x - \frac1x\right)^2 = x^2 - 2 + \frac{1}{x^2}$.`],
      ['7', r`Przy przenoszeniu $-2$ na drugą stronę nie zmieniono znaku.`, 'Przeniesienie wyrazu na drugą stronę zmienia jego znak.'],
    ],
  }),

  // -------------------------------------------------------------------------
  // alg-factor
  // -------------------------------------------------------------------------
  numeric({
    id: 'a-fac-1',
    skill: 'alg-factor',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Wyłączono przed nawias największy wspólny czynnik: $12x + 18 = a(2x + 3)$. Podaj $a$.`,
    answer: 6,
    verify: () => 12 / 2,
    hints: [
      r`Jaka największa liczba dzieli jednocześnie $12$ i $18$?`,
      r`Sprawdź po kolei: czy obie liczby dzielą się przez $2$? A przez $3$? A przez większe?`,
      r`W nawiasie zostało $2x + 3$, więc $a \cdot 2x = 12x$.`,
      r`$12 : 2$.`,
    ],
    steps: [r`$\mathrm{NWD}(12, 18) = 6$.`, r`$12x + 18 = 6(2x + 3)$, więc $a = 6$.`],
    errors: [
      [['2', '3'], 'Wyłączony wspólny czynnik, ale nie największy.', r`Wtedy w nawiasie nie byłoby $2x + 3$ — sprawdź, wymnażając z powrotem.`],
    ],
  }),
  numeric({
    id: 'a-fac-2',
    skill: 'alg-factor',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Ile rozwiązań ma równanie $x^2 - 7x = 0$?`,
    answer: 2,
    verify: () => [0, 7].filter((x) => x * x - 7 * x === 0).length,
    hints: [
      'Co jest wspólne dla obu wyrazów?',
      r`Wyłącz $x$ przed nawias: $x(x - 7) = 0$.`,
      'Kiedy iloczyn dwóch czynników jest równy zero?',
      r`$x = 0$ lub $x - 7 = 0$.`,
    ],
    steps: [r`$x(x - 7) = 0$.`, r`$x = 0$ lub $x = 7$ — dwa rozwiązania.`],
    errors: [['1', r`Równanie podzielone przez $x$ — zgubione rozwiązanie $x = 0$.`, r`Nie dziel przez wyrażenie, które może być zerem. Wyłącz je przed nawias.`]],
  }),
  choice({
    id: 'a-fac-3',
    skill: 'alg-factor',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wyrażenie $x^2 - 16$ jest równe`,
    choices: [r`$(x-4)(x+4)$`, r`$(x-4)^2$`, r`$(x-8)(x+8)$`, r`$(x+4)^2$`],
    answer: 'A',
    hints: [
      'Jakie dwie liczby są tu podniesione do kwadratu?',
      r`$16 = 4^2$, więc to różnica kwadratów $x^2 - 4^2$.`,
      r`$a^2 - b^2 = (a-b)(a+b)$.`,
      r`$a = x$, $b = 4$.`,
    ],
    steps: [r`$x^2 - 16 = x^2 - 4^2$.`, r`$= (x - 4)(x + 4)$.`],
    errors: [
      ['B', 'Kwadrat różnicy zamiast różnicy kwadratów.', r`$(x-4)^2 = x^2 - 8x + 16$ — ma wyraz z $x$.`],
      ['C', r`$16$ potraktowane jak $2 \cdot 8$, a trzeba kwadratu: $16 = 4^2$.`, r`W $a^2 - b^2$ liczba $b$ to pierwiastek z odejmowanej liczby.`],
      ['D', 'Kwadrat sumy zamiast różnicy kwadratów.', r`$(x+4)^2 = x^2 + 8x + 16$.`],
    ],
  }),
  numeric({
    id: 'a-fac-4',
    skill: 'alg-factor',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiąż równanie $x^3 - 4x = 0$. Podaj sumę kwadratów wszystkich jego rozwiązań.`,
    answer: 8,
    verify: () => [0, 2, -2].reduce((s, x) => s + x * x, 0),
    hints: [
      'Co można wyłączyć przed nawias?',
      r`$x^3 - 4x = x(x^2 - 4)$.`,
      r`$x^2 - 4$ to różnica kwadratów: $(x-2)(x+2)$.`,
      r`Rozwiązania: $0$, $2$ i $-2$.`,
    ],
    steps: [r`$x(x-2)(x+2) = 0$, więc $x \in \{-2, 0, 2\}$.`, r`$0^2 + 2^2 + (-2)^2 = 8$.`],
    errors: [['4', r`Pominięte rozwiązanie $x = -2$.`, r`$x^2 = 4$ ma dwa rozwiązania: $2$ i $-2$.`]],
  }),
  numeric({
    id: 'a-fac-5',
    skill: 'alg-factor',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz wartość wyrażenia $a^2 - 2ab + b^2$ dla $a = 2{,}75$ i $b = 1{,}75$, korzystając ze wzoru.`,
    answer: 1,
    verify: () => (2.75 - 1.75) ** 2,
    hints: [
      'Który wzór skróconego mnożenia widać w tym wyrażeniu?',
      r`$a^2 - 2ab + b^2 = (a - b)^2$.`,
      r`Policz najpierw $a - b$.`,
      r`$a - b = 2{,}75 - 1{,}75$.`,
    ],
    steps: [r`$a^2 - 2ab + b^2 = (a-b)^2$.`, r`$(2{,}75 - 1{,}75)^2 = 1^2 = 1$.`],
    errors: [[['20.25'], 'Pomylony wzór: policzony kwadrat sumy zamiast kwadratu różnicy.', r`$a^2 - 2ab + b^2 = (a-b)^2$ — minus w środku to różnica.`]],
  }),
  choice({
    id: 'a-fac-6',
    skill: 'alg-factor',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Wyrażenie $x^3 + 2x^2 - x - 2$ po rozłożeniu na czynniki ma postać`,
    choices: [r`$(x+2)(x-1)(x+1)$`, r`$(x+2)(x^2+1)$`, r`$(x-2)(x-1)(x+1)$`, r`$x(x+2)(x-1)$`],
    answer: 'A',
    hints: [
      'Jak pogrupować cztery wyrazy w pary?',
      r`$x^3 + 2x^2 = x^2(x+2)$ oraz $-x - 2 = -(x + 2)$.`,
      r`$x^2(x+2) - (x+2) = (x+2)(x^2 - 1)$.`,
      r`$x^2 - 1$ to jeszcze różnica kwadratów.`,
    ],
    steps: [r`$x^2(x+2) - 1 \cdot (x+2) = (x+2)(x^2-1)$.`, r`$= (x+2)(x-1)(x+1)$.`],
    errors: [
      ['B', r`Zgubiony minus: $-(x+2)$ daje w nawiasie $x^2 - 1$, a nie $x^2 + 1$.`, 'Wyłączając minus przed nawias, zmieniasz znaki wszystkich wyrazów w środku.'],
      ['C', r`Zły znak w czynniku $(x+2)$.`, r`$x^3 + 2x^2 = x^2(x + 2)$ — z plusem.`],
      ['D', r`Wyłączone $x$ ze wszystkich wyrazów, choć $-2$ go nie zawiera.`, 'Przed nawias wyłącza się tylko czynnik wspólny dla KAŻDEGO wyrazu.'],
    ],
  }),
  numeric({
    id: 'a-fac-7',
    skill: 'alg-factor',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Liczby dodatnie $a$ i $b$ spełniają warunki $a - b = 3$ oraz $a^2 - b^2 = 39$. Oblicz $a + b$.`,
    answer: 13,
    verify: () => 8 + 5,
    hints: [
      r`Jak rozłożyć $a^2 - b^2$ na czynniki?`,
      r`$a^2 - b^2 = (a - b)(a + b)$.`,
      r`Wstaw $a - b = 3$: $3 \cdot (a + b) = 39$.`,
      r`$a + b = 39 : 3$.`,
    ],
    steps: [r`$(a-b)(a+b) = 39$.`, r`$3(a+b) = 39 \Rightarrow a + b = 13$.`],
    errors: [[['36', '42'], 'Odjęte lub dodane zamiast podzielone.', r`$a^2 - b^2 = (a-b)(a+b)$ — to iloczyn, więc dzielisz przez $a - b$.`]],
  }),
  numeric({
    id: 'a-fac-8',
    skill: 'alg-factor',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Ile rozwiązań rzeczywistych ma równanie $x^4 - 5x^2 + 4 = 0$?`,
    answer: 4,
    verify: () => [-2, -1, 1, 2].filter((x) => x ** 4 - 5 * x ** 2 + 4 === 0).length,
    hints: [
      r`Czy da się to zapisać jako iloczyn dwóch nawiasów z $x^2$?`,
      r`Szukaj rozkładu $(x^2 - a)(x^2 - b)$, gdzie $a + b = 5$ i $ab = 4$.`,
      r`$x^4 - 5x^2 + 4 = (x^2 - 1)(x^2 - 4)$.`,
      r`Każde z równań $x^2 = 1$ i $x^2 = 4$ ma dwa rozwiązania.`,
    ],
    steps: [r`$(x^2-1)(x^2-4) = 0$.`, r`$x^2 = 1$ lub $x^2 = 4$, czyli $x \in \{-2, -1, 1, 2\}$ — cztery rozwiązania.`],
    errors: [['2', r`Policzone rozwiązania dla $x^2$ zamiast dla $x$.`, r`$x^2 = 1$ daje $x = 1$ lub $x = -1$ — każde takie równanie ma dwa rozwiązania.`]],
  }),

  // -------------------------------------------------------------------------
  // alg-rational
  // -------------------------------------------------------------------------
  numeric({
    id: 'a-rat-1',
    skill: 'alg-rational',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Dla jakiej liczby $x$ wyrażenie $\frac{5}{x - 4}$ nie ma sensu?`,
    answer: 4,
    verify: () => 4,
    hints: [
      'Kiedy ułamek traci sens?',
      'Gdy mianownik jest równy zero.',
      r`Rozwiąż $x - 4 = 0$.`,
      r`Dodaj $4$ do obu stron.`,
    ],
    steps: [r`Mianownik: $x - 4 = 0$.`, r`$x = 4$ — dla tej liczby wyrażenie nie ma sensu.`],
    errors: [
      ['-4', 'Zły znak przy rozwiązywaniu $x - 4 = 0$.', r`$x - 4 = 0 \iff x = 4$.`],
      ['0', 'Zero w mianowniku to warunek na cały mianownik, nie na samo $x$.', r`Szukasz $x$, dla którego $x - 4 = 0$.`],
    ],
  }),
  numeric({
    id: 'a-rat-2',
    skill: 'alg-rational',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz wartość wyrażenia $\frac{x^2 - 1}{x - 1}$ dla $x = 99$.`,
    answer: 100,
    verify: () => (99 ** 2 - 1) / (99 - 1),
    hints: [
      'Czy licznik da się rozłożyć na czynniki?',
      r`$x^2 - 1 = (x-1)(x+1)$.`,
      r`Po skróceniu zostaje $x + 1$.`,
      r`Wstaw $x = 99$ do $x + 1$.`,
    ],
    steps: [r`$\frac{(x-1)(x+1)}{x-1} = x + 1$ dla $x \ne 1$.`, r`Dla $x = 99$: $99 + 1 = 100$.`],
    errors: [['98', r`Po skróceniu zostało $x - 1$ zamiast $x + 1$.`, r`$x^2 - 1 = (x - 1)(x + 1)$ — po skróceniu zostaje drugi czynnik.`]],
  }),
  choice({
    id: 'a-rat-3',
    skill: 'alg-rational',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Dziedziną wyrażenia $\frac{x+2}{x^2 - 9}$ jest zbiór`,
    choices: [r`$\mathbb{R} \setminus \{-3, 3\}$`, r`$\mathbb{R} \setminus \{3\}$`, r`$\mathbb{R} \setminus \{-2\}$`, r`$\mathbb{R} \setminus \{9\}$`],
    answer: 'A',
    hints: [
      'Która część ułamka decyduje o dziedzinie?',
      r`Mianownik nie może być zerem: $x^2 - 9 \ne 0$.`,
      r`$x^2 = 9$ — ile ma rozwiązań?`,
      r`$x = 3$ albo $x = -3$.`,
    ],
    steps: [r`$x^2 - 9 = 0 \iff x = 3$ lub $x = -3$.`, r`Dziedzina: $\mathbb{R} \setminus \{-3, 3\}$.`],
    errors: [
      ['B', 'Pominięte ujemne rozwiązanie.', r`$x^2 = 9$ ma dwa rozwiązania: $3$ i $-3$.`],
      ['C', 'Wykluczone zero licznika zamiast zer mianownika.', 'Licznik może być zerem — nie może mianownik.'],
      ['D', r`$x^2 - 9 = 0$ rozwiązane jako $x = 9$.`, r`$x^2 = 9$ oznacza $x = \pm 3$.`],
    ],
  }),
  numeric({
    id: 'a-rat-4',
    skill: 'alg-rational',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Uprość wyrażenie $\frac{x^2 + 6x + 9}{x + 3}$ i oblicz jego wartość dla $x = 7$.`,
    answer: 10,
    verify: () => (7 ** 2 + 6 * 7 + 9) / (7 + 3),
    hints: [
      'Jaki wzór skróconego mnożenia widać w liczniku?',
      r`$x^2 + 6x + 9 = (x+3)^2$.`,
      r`$\frac{(x+3)^2}{x+3} = x + 3$ dla $x \ne -3$.`,
      r`Wstaw $x = 7$ do $x + 3$.`,
    ],
    steps: [r`$\frac{(x+3)^2}{x+3} = x + 3$.`, r`Dla $x = 7$: $7 + 3 = 10$.`],
    errors: [['100', r`Policzony licznik $(x+3)^2$ bez dzielenia przez mianownik.`, 'Skrócenie usuwa jeden czynnik $(x+3)$ z licznika.']],
  }),
  choice({
    id: 'a-rat-5',
    skill: 'alg-rational',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Wyrażenie $\frac{1}{x} + \frac{1}{2x}$ dla $x \ne 0$ jest równe`,
    choices: [r`$\frac{3}{2x}$`, r`$\frac{2}{3x}$`, r`$\frac{1}{3x}$`, r`$\frac{2}{2x}$`],
    answer: 'A',
    hints: [
      'Jaki jest wspólny mianownik tych dwóch ułamków?',
      r`Wspólny mianownik to $2x$.`,
      r`$\frac{1}{x} = \frac{2}{2x}$.`,
      r`$\frac{2}{2x} + \frac{1}{2x}$.`,
    ],
    steps: [r`$\frac{1}{x} = \frac{2}{2x}$.`, r`$\frac{2}{2x} + \frac{1}{2x} = \frac{3}{2x}$.`],
    errors: [
      ['B', r`Dodane liczniki i mianowniki: $\frac{1+1}{x+2x}$.`, 'Ułamki dodaje się przez wspólny mianownik.'],
      ['C', 'Dodane same mianowniki.', 'Mianownik po dodaniu to wspólny mianownik, a nie suma mianowników.'],
      ['D', r`Pierwszy ułamek sprowadzony do mianownika $2x$ bez pomnożenia licznika.`, 'Licznik i mianownik mnożysz przez tę samą liczbę.'],
    ],
  }),
  numeric({
    id: 'a-rat-6',
    skill: 'alg-rational',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz wartość wyrażenia $\frac{x}{x-2} - \frac{4}{x^2 - 2x}$ dla $x = 10$.`,
    answer: 1.2,
    variants: ['6/5'],
    verify: () => 10 / (10 - 2) - 4 / (10 ** 2 - 2 * 10),
    hints: [
      r`Jak rozłożyć drugi mianownik, $x^2 - 2x$?`,
      r`$x^2 - 2x = x(x - 2)$ — to wspólny mianownik.`,
      r`$\frac{x \cdot x - 4}{x(x-2)} = \frac{x^2 - 4}{x(x-2)}$.`,
      r`$x^2 - 4 = (x-2)(x+2)$ — skróć i wstaw $x = 10$.`,
    ],
    steps: [
      r`$\frac{x^2 - 4}{x(x-2)} = \frac{(x-2)(x+2)}{x(x-2)} = \frac{x+2}{x}$.`,
      r`Dla $x = 10$: $\frac{12}{10} = 1{,}2$.`,
    ],
    errors: [['1.3', r`Minus przed drugim ułamkiem nie objął licznika: wyszło $x^2 + 4$.`, 'Odejmując ułamek, odejmujesz cały jego licznik.']],
  }),
  numeric({
    id: 'a-rat-7',
    skill: 'alg-rational',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Pierwszy pracownik sam wykonałby pracę w $6$ godzin, drugi w $3$ godziny. W ciągu godziny razem wykonują $\frac{1}{6} + \frac{1}{3}$ całej pracy. Ile godzin zajmie im wspólna praca?`,
    answer: 2,
    verify: () => 1 / (1 / 6 + 1 / 3),
    hints: [
      'Jaką część pracy wykonują razem w ciągu godziny?',
      r`Sprowadź oba ułamki do mianownika $6$ i dodaj.`,
      'Razem w godzinę robią połowę pracy.',
      'Skoro w godzinę połowa — ile godzin na całość?',
    ],
    steps: [r`$\frac{1}{6} + \frac{1}{3} = \frac{1}{6} + \frac{2}{6} = \frac{1}{2}$ pracy na godzinę.`, r`Całość: $1 : \frac{1}{2} = 2$ godziny.`],
    errors: [
      ['4.5', 'Policzona średnia czasów zamiast sumy wydajności.', 'Łączy się wydajności (części pracy na godzinę), a nie czasy.'],
      ['9', 'Dodane czasy pracy.', 'Pracując razem, kończą szybciej niż każdy z osobna — czas nie może rosnąć.'],
    ],
  }),
  numeric({
    id: 'a-rat-8',
    skill: 'alg-rational',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Wyrażenie $\frac{x^2 + 3x + 2}{x + 1}$ po uproszczeniu jest równe $x + 2$. Ile liczb całkowitych $x$ z przedziału $\langle -5, 5 \rangle$ należy do dziedziny tego wyrażenia i daje wartość dodatnią?`,
    answer: 6,
    verify: () => {
      let n = 0;
      for (let x = -5; x <= 5; x += 1) if (x !== -1 && (x * x + 3 * x + 2) / (x + 1) > 0) n += 1;
      return n;
    },
    hints: [
      'Jakiej liczby nie ma w dziedzinie wyrażenia PRZED skróceniem?',
      r`Mianownik $x + 1 \ne 0$, więc $x \ne -1$.`,
      r`Wartość $x + 2 > 0$ dla $x > -2$.`,
      r`Liczby całkowite większe od $-2$ i najwyżej $5$ — ale bez $-1$.`,
    ],
    steps: [
      r`Dziedzina: $x \ne -1$. Wartość $x + 2 > 0 \iff x > -2$.`,
      r`Z przedziału: $-1, 0, 1, 2, 3, 4, 5$, ale $-1$ nie należy do dziedziny.`,
      r`Zostaje $0, 1, 2, 3, 4, 5$ — sześć liczb.`,
    ],
    errors: [['7', r`Po skróceniu zapomniane, że $x = -1$ jest poza dziedziną.`, 'Dziedzinę wyznacza się przed skróceniem — zakazana liczba zostaje zakazana.']],
  }),

  // -------------------------------------------------------------------------
  // alg-cubes (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'a-cub-1',
    skill: 'alg-cubes',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz różnicę $(2+1)^3 - (2^3 + 1^3)$.`,
    answer: 18,
    verify: () => (2 + 1) ** 3 - (2 ** 3 + 1 ** 3),
    hints: [
      r`Ile wynosi $(2+1)^3$, a ile $2^3 + 1^3$?`,
      r`$(2+1)^3 = 3^3$.`,
      r`$2^3 + 1^3 = 8 + 1$.`,
      r`$27 - 9$.`,
    ],
    steps: [r`$(2+1)^3 = 27$, $2^3 + 1^3 = 9$.`, r`$27 - 9 = 18$ — to są właśnie wyrazy $3a^2b + 3ab^2 = 12 + 6$.`],
    errors: [['0', r`Założenie, że $(a+b)^3 = a^3 + b^3$.`, r`$(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$.`]],
  }),
  numeric({
    id: 'a-cub-2',
    skill: 'alg-cubes',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Rozwiń $(x + 1)^3$ i podaj współczynnik przy $x^2$.`,
    answer: 3,
    verify: () => 3 * 1 ** 2 * 1,
    hints: [
      'Jak rozpisać sześcian na coś, co już umiesz wymnożyć?',
      r`$(x+1)^3 = (x+1)^2 \cdot (x+1)$.`,
      r`$(x^2 + 2x + 1)(x + 1)$ — zbierz wszystkie wyrazy z $x^2$.`,
      r`$x^2 \cdot 1 + 2x \cdot x = x^2 + 2x^2$.`,
    ],
    steps: [r`$(x+1)^3 = x^3 + 3x^2 + 3x + 1$.`, r`Współczynnik przy $x^2$: $3$.`],
    errors: [
      ['2', 'Pomylony wzór z kwadratem sumy.', r`Sześcian ma współczynniki $1, 3, 3, 1$.`],
      ['0', 'Pominięte wyrazy środkowe.', r`$(a+b)^3 \ne a^3 + b^3$.`],
    ],
  }),
  choice({
    id: 'a-cub-3',
    skill: 'alg-cubes',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Wyrażenie $x^3 - 8$ jest równe`,
    choices: [r`$(x-2)(x^2+2x+4)$`, r`$(x-2)(x^2+4x+4)$`, r`$(x-2)^3$`, r`$(x-2)(x^2-2x+4)$`],
    answer: 'A',
    hints: [
      r`Czy $8$ jest sześcianem jakiejś liczby?`,
      r`$8 = 2^3$, więc to różnica sześcianów z $a = x$, $b = 2$.`,
      r`$a^3 - b^3 = (a-b)(a^2 + ab + b^2)$.`,
      r`$(x - 2)(x^2 + 2x + 4)$ — sprawdź, wymnażając.`,
    ],
    steps: [r`$x^3 - 2^3 = (x - 2)(x^2 + x \cdot 2 + 2^2)$.`, r`$= (x-2)(x^2 + 2x + 4)$.`],
    errors: [
      ['B', r`W drugim nawiasie $2ab$ zamiast $ab$.`, r`$a^3 - b^3 = (a-b)(a^2 + ab + b^2)$ — samo $ab$.`],
      ['C', 'Sześcian różnicy pomylony z różnicą sześcianów.', r`$(x-2)^3 = x^3 - 6x^2 + 12x - 8$.`],
      ['D', 'Zły znak w drugim nawiasie.', r`W różnicy sześcianów drugi nawias ma same plusy: $a^2 + ab + b^2$.`],
    ],
  }),
  numeric({
    id: 'a-cub-4',
    skill: 'alg-cubes',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $a^3 + b^3$, jeśli $a + b = 4$ i $ab = 3$.`,
    answer: 28,
    verify: () => 1 ** 3 + 3 ** 3,
    hints: [
      r`Jak wyrazić $a^3 + b^3$ przez $a + b$ i $ab$?`,
      r`$(a+b)^3 = a^3 + b^3 + 3ab(a+b)$.`,
      r`Stąd $a^3 + b^3 = (a+b)^3 - 3ab(a+b)$.`,
      r`$4^3 - 3 \cdot 3 \cdot 4$.`,
    ],
    steps: [r`$a^3 + b^3 = (a+b)^3 - 3ab(a+b)$.`, r`$= 64 - 36 = 28$.`],
    errors: [
      ['64', r`Policzone $(a+b)^3$ zamiast $a^3 + b^3$.`, r`$(a+b)^3$ zawiera jeszcze $3ab(a+b)$.`],
      ['52', r`Odjęte $3ab$ zamiast $3ab(a+b)$.`, r`$3a^2b + 3ab^2 = 3ab(a+b)$.`],
    ],
  }),
  numeric({
    id: 'a-cub-5',
    skill: 'alg-cubes',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Rozwiń $(2x - 1)^3$ i podaj współczynnik przy $x$.`,
    answer: 6,
    verify: () => 3 * 2 * 1 ** 2,
    hints: [
      'Co jest tu wyrazem $a$, a co $b$?',
      r`$a = 2x$, $b = 1$; wyraz z $x$ w pierwszej potędze to $3ab^2$.`,
      r`$3 \cdot 2x \cdot 1^2$ — i jaki ma znak w sześcianie różnicy?`,
      r`W $(a-b)^3$ wyraz $3ab^2$ ma plus.`,
    ],
    steps: [r`$(2x-1)^3 = 8x^3 - 12x^2 + 6x - 1$.`, r`Współczynnik przy $x$: $6$.`],
    errors: [
      ['-6', r`Zły znak: w sześcianie różnicy wyraz $3ab^2$ ma plus.`, r`$(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3$.`],
      ['3', r`Pominięty współczynnik $2$ z wyrazu $2x$.`, r`$a = 2x$, więc $3ab^2 = 3 \cdot 2x \cdot 1$.`],
    ],
  }),
  choice({
    id: 'a-cub-6',
    skill: 'alg-cubes',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Liczba $\frac{1}{\sqrt[3]{2} - 1}$ jest równa`,
    choices: [
      r`$\sqrt[3]{4} + \sqrt[3]{2} + 1$`,
      r`$\sqrt[3]{2} + 1$`,
      r`$\sqrt[3]{4} - \sqrt[3]{2} + 1$`,
      r`$\frac{\sqrt[3]{2} + 1}{\sqrt[3]{4} - 1}$`,
    ],
    answer: 'A',
    hints: [
      'Czy sprzężenie $\\sqrt[3]{2} + 1$ usunie pierwiastek sześcienny?',
      r`Nie — potrzebny wzór $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$.`,
      r`Pomnóż licznik i mianownik przez $(\sqrt[3]{2})^2 + \sqrt[3]{2} + 1$.`,
      r`W mianowniku wyjdzie $(\sqrt[3]{2})^3 - 1^3 = 1$.`,
    ],
    steps: [
      r`$\frac{\sqrt[3]{4} + \sqrt[3]{2} + 1}{(\sqrt[3]{2} - 1)(\sqrt[3]{4} + \sqrt[3]{2} + 1)}$.`,
      r`Mianownik: $2 - 1 = 1$, więc wynik to $\sqrt[3]{4} + \sqrt[3]{2} + 1$.`,
    ],
    errors: [
      ['B', 'Sprzężenie jak dla pierwiastka kwadratowego — ono nie usuwa pierwiastka sześciennego.', r`Dla $\sqrt[3]{a}$ potrzebny jest wzór na różnicę sześcianów.`],
      ['C', 'Zły znak w drugim czynniku.', r`$a^3 - b^3 = (a-b)(a^2 + ab + b^2)$ — same plusy.`],
      ['D', 'Użyta różnica kwadratów — mianownik dalej jest niewymierny.', r`$(\sqrt[3]{2})^2 - 1 = \sqrt[3]{4} - 1$, a to wciąż pierwiastek.`],
    ],
  }),
  numeric({
    id: 'a-cub-7',
    skill: 'alg-cubes',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Krawędź sześcianu wydłużono o $1$. Objętość wzrosła o $61$. Oblicz długość krawędzi przed zmianą.`,
    answer: 4,
    verify: () => {
      for (let a = 1; a < 100; a += 1) if ((a + 1) ** 3 - a ** 3 === 61) return a;
      return NaN;
    },
    hints: [
      'O ile zmieniła się objętość, zapisana wzorem?',
      r`$(a+1)^3 - a^3 = 3a^2 + 3a + 1$.`,
      r`$3a^2 + 3a + 1 = 61$, czyli $a^2 + a - 20 = 0$.`,
      r`$a^2 + a - 20 = (a + 5)(a - 4)$.`,
    ],
    steps: [
      r`$(a+1)^3 - a^3 = 3a^2 + 3a + 1 = 61$.`,
      r`$a^2 + a - 20 = 0 \Rightarrow a = 4$ (bo $a > 0$).`,
    ],
    errors: [['20', r`Pominięty wyraz $3a^2$.`, r`$(a+1)^3 = a^3 + 3a^2 + 3a + 1$.`]],
  }),
  numeric({
    id: 'a-cub-8',
    skill: 'alg-cubes',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Liczby $x$ i $y$ spełniają warunki $x - y = 2$ oraz $xy = 3$. Oblicz $x^3 - y^3$.`,
    answer: 26,
    verify: () => 3 ** 3 - 1 ** 3,
    hints: [
      r`Jak wyrazić $x^3 - y^3$ przez $x - y$ i $xy$?`,
      r`$x^3 - y^3 = (x - y)(x^2 + xy + y^2)$.`,
      r`$x^2 + y^2 = (x-y)^2 + 2xy$, więc $x^2 + xy + y^2 = (x-y)^2 + 3xy$.`,
      r`$2 \cdot (4 + 9)$.`,
    ],
    steps: [
      r`$x^2 + xy + y^2 = (x - y)^2 + 3xy = 4 + 9 = 13$.`,
      r`$x^3 - y^3 = 2 \cdot 13 = 26$.`,
    ],
    errors: [
      ['8', r`Policzone $(x-y)^3$ zamiast $x^3 - y^3$.`, r`$x^3 - y^3 = (x-y)^3 + 3xy(x-y)$.`],
      ['-10', r`Zły znak przy $3xy(x-y)$.`, r`$(x-y)^3 = x^3 - y^3 - 3xy(x-y)$, więc $x^3 - y^3 = (x-y)^3 + 3xy(x-y)$.`],
    ],
  }),

  // -------------------------------------------------------------------------
  // alg-irrational (rozszerzenie)
  // -------------------------------------------------------------------------
  numeric({
    id: 'a-irr-1',
    skill: 'alg-irrational',
    kind: 'foundation',
    difficulty: 1,
    prompt: r`Oblicz $\sqrt{(-7)^2}$.`,
    answer: 7,
    verify: () => Math.sqrt((-7) ** 2),
    hints: [
      r`Ile wynosi $(-7)^2$?`,
      r`$(-7)^2 = 49$.`,
      r`$\sqrt{49}$ — pierwiastek kwadratowy nigdy nie jest ujemny.`,
      r`$\sqrt{a^2} = |a|$.`,
    ],
    steps: [r`$\sqrt{(-7)^2} = \sqrt{49}$.`, r`$= 7 = |-7|$.`],
    errors: [['-7', r`Przyjęte $\sqrt{a^2} = a$.`, r`$\sqrt{a^2} = |a|$ — wynik jest nieujemny.`]],
  }),
  numeric({
    id: 'a-irr-2',
    skill: 'alg-irrational',
    kind: 'foundation',
    difficulty: 2,
    prompt: r`Oblicz $(\sqrt{6} - 2)(\sqrt{6} + 2)$.`,
    answer: 2,
    verify: () => (Math.sqrt(6) - 2) * (Math.sqrt(6) + 2),
    hints: [
      'Który wzór skróconego mnożenia tu pasuje?',
      r`Różnica kwadratów: $a^2 - b^2$ z $a = \sqrt{6}$, $b = 2$.`,
      r`$(\sqrt{6})^2 = 6$.`,
      r`$6 - 4$.`,
    ],
    steps: [r`$(\sqrt{6})^2 - 2^2$.`, r`$= 6 - 4 = 2$.`],
    errors: [
      ['32', r`$(\sqrt{6})^2$ policzone jako $36$.`, r`$(\sqrt{a})^2 = a$.`],
      ['10', 'Dodane kwadraty zamiast odjęte.', r`$(a-b)(a+b) = a^2 - b^2$.`],
    ],
  }),
  choice({
    id: 'a-irr-3',
    skill: 'alg-irrational',
    kind: 'typical',
    difficulty: 2,
    prompt: r`Liczba $\frac{1}{\sqrt{3} + 1}$ jest równa`,
    choices: [r`$\frac{\sqrt{3} - 1}{2}$`, r`$\sqrt{3} - 1$`, r`$\frac{\sqrt{3} + 1}{2}$`, r`$\frac{\sqrt{3} - 1}{4}$`],
    answer: 'A',
    hints: [
      'Przez co pomnożyć licznik i mianownik, żeby pozbyć się pierwiastka z mianownika?',
      r`Przez sprzężenie: $\sqrt{3} - 1$.`,
      r`Mianownik: $(\sqrt{3})^2 - 1^2$.`,
      r`$3 - 1 = 2$.`,
    ],
    steps: [r`$\frac{\sqrt{3} - 1}{(\sqrt{3} + 1)(\sqrt{3} - 1)} = \frac{\sqrt{3} - 1}{3 - 1}$.`, r`$= \frac{\sqrt{3} - 1}{2}$.`],
    errors: [
      ['B', r`Pominięty mianownik $3 - 1 = 2$.`, 'Po pomnożeniu przez sprzężenie mianownik staje się liczbą — ale nie znika.'],
      ['C', 'Pomnożone przez to samo wyrażenie zamiast przez sprzężenie.', 'Sprzężenie ma przeciwny znak między wyrazami.'],
      ['D', r`W mianowniku policzona suma kwadratów $3 + 1$.`, r`$(a+b)(a-b) = a^2 - b^2$.`],
    ],
  }),
  numeric({
    id: 'a-irr-4',
    skill: 'alg-irrational',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\frac{4}{\sqrt{5} - 1} - \sqrt{5}$.`,
    answer: 1,
    verify: () => 4 / (Math.sqrt(5) - 1) - Math.sqrt(5),
    hints: [
      'Co zrobić z pierwiastkiem w mianowniku pierwszego ułamka?',
      r`Pomnóż licznik i mianownik przez $\sqrt{5} + 1$.`,
      r`Mianownik: $5 - 1 = 4$ — skróci się z licznikiem.`,
      r`$\frac{4(\sqrt{5} + 1)}{4} = \sqrt{5} + 1$.`,
    ],
    steps: [r`$\frac{4}{\sqrt{5} - 1} = \frac{4(\sqrt{5}+1)}{4} = \sqrt{5} + 1$.`, r`$\sqrt{5} + 1 - \sqrt{5} = 1$.`],
    errors: [['-1', r`Pomnożone przez $\sqrt{5} - 1$ zamiast przez sprzężenie $\sqrt{5} + 1$.`, 'Sprzężenie ma przeciwny znak niż mianownik.']],
  }),
  numeric({
    id: 'a-irr-5',
    skill: 'alg-irrational',
    kind: 'typical',
    difficulty: 3,
    prompt: r`Oblicz $\sqrt{x^2} + x$ dla $x = -4$.`,
    answer: 0,
    verify: () => Math.sqrt((-4) ** 2) + -4,
    hints: [
      r`Ile wynosi $\sqrt{x^2}$ dla ujemnego $x$?`,
      r`$\sqrt{x^2} = |x|$.`,
      r`$|-4| = 4$.`,
      r`$4 + (-4)$.`,
    ],
    steps: [r`$\sqrt{(-4)^2} = |-4| = 4$.`, r`$4 + (-4) = 0$.`],
    errors: [['-8', r`Przyjęte $\sqrt{x^2} = x$.`, r`$\sqrt{x^2} = |x|$ — dla $x < 0$ to $-x$.`]],
  }),
  numeric({
    id: 'a-irr-6',
    skill: 'alg-irrational',
    kind: 'typical',
    difficulty: 4,
    prompt: r`Oblicz $\frac{\sqrt{7} + \sqrt{3}}{\sqrt{7} - \sqrt{3}} + \frac{\sqrt{7} - \sqrt{3}}{\sqrt{7} + \sqrt{3}}$.`,
    answer: 5,
    verify: () => {
      const a = Math.sqrt(7);
      const b = Math.sqrt(3);
      return (a + b) / (a - b) + (a - b) / (a + b);
    },
    hints: [
      'Jaki jest wspólny mianownik tych ułamków?',
      r`$(\sqrt{7} - \sqrt{3})(\sqrt{7} + \sqrt{3}) = 7 - 3$.`,
      r`Licznik: $(\sqrt{7} + \sqrt{3})^2 + (\sqrt{7} - \sqrt{3})^2$ — rozwiń oba kwadraty.`,
      r`Wyrazy $\pm 2\sqrt{21}$ się skrócą: licznik to $10 + 10$.`,
    ],
    steps: [
      r`Licznik: $(10 + 2\sqrt{21}) + (10 - 2\sqrt{21}) = 20$.`,
      r`Mianownik: $7 - 3 = 4$. Wynik: $\frac{20}{4} = 5$.`,
    ],
    errors: [['20', r`Pominięty wspólny mianownik $(\sqrt{7})^2 - (\sqrt{3})^2 = 4$.`, 'Po sprowadzeniu do wspólnego mianownika trzeba jeszcze przez niego podzielić.']],
  }),
  numeric({
    id: 'a-irr-7',
    skill: 'alg-irrational',
    kind: 'transfer',
    difficulty: 4,
    prompt: r`Prostokąt ma boki długości $\sqrt{5} + 1$ oraz $\sqrt{5} - 1$. Oblicz jego pole.`,
    answer: 4,
    verify: () => (Math.sqrt(5) + 1) * (Math.sqrt(5) - 1),
    hints: [
      'Jak obliczyć pole prostokąta?',
      r`Pole to iloczyn boków: $(\sqrt{5} + 1)(\sqrt{5} - 1)$.`,
      'To różnica kwadratów.',
      r`$(\sqrt{5})^2 - 1^2$.`,
    ],
    steps: [r`$P = (\sqrt{5}+1)(\sqrt{5}-1)$.`, r`$= 5 - 1 = 4$.`],
    errors: [
      ['6', 'Dodane kwadraty zamiast odjęte.', r`$(a+b)(a-b) = a^2 - b^2$.`],
      ['24', r`$(\sqrt{5})^2$ policzone jako $25$.`, r`$(\sqrt{5})^2 = 5$.`],
    ],
  }),
  numeric({
    id: 'a-irr-8',
    skill: 'alg-irrational',
    kind: 'transfer',
    difficulty: 5,
    prompt: r`Oblicz $\sqrt{7 - 4\sqrt{3}} + \sqrt{3}$.`,
    answer: 2,
    tolerance: 1e-9,
    verify: () => Math.sqrt(7 - 4 * Math.sqrt(3)) + Math.sqrt(3),
    hints: [
      r`Czy $7 - 4\sqrt{3}$ da się zapisać jako kwadrat różnicy?`,
      r`Szukaj takiej liczby $a$, że kwadrat wyrażenia $a - \sqrt{3}$ daje $7 - 4\sqrt{3}$.`,
      r`Pamiętaj: $\sqrt{t^2} = |t|$ — sprawdź znak, zanim zdejmiesz moduł.`,
      r`$7 - 4\sqrt{3} = (2 - \sqrt{3})^2$, a $2 - \sqrt{3} > 0$.`,
    ],
    steps: [
      r`$7 - 4\sqrt{3} = 4 - 4\sqrt{3} + 3 = (2 - \sqrt{3})^2$.`,
      r`$\sqrt{(2-\sqrt{3})^2} = |2 - \sqrt{3}| = 2 - \sqrt{3}$.`,
      r`$2 - \sqrt{3} + \sqrt{3} = 2$.`,
    ],
    errors: [[['1.46', '1.5'], r`Moduł zdjęty bez sprawdzenia znaku: wzięte $\sqrt{3} - 2$.`, r`$\sqrt{t^2} = |t|$, a $2 - \sqrt{3} > 0$.`]],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const ALGEBRA_CARDS: Flashcard[] = [
  card('c-alg-exp-1', 'alg-expand', 'wzor', r`$(a+b)^2 = \;?$`, r`$a^2 + 2ab + b^2$`),
  card('c-alg-exp-2', 'alg-expand', 'wzor', r`$(a-b)^2 = \;?$`, r`$a^2 - 2ab + b^2$`),
  card('c-alg-exp-3', 'alg-expand', 'wzor', r`$(a-b)(a+b) = \;?$`, r`$a^2 - b^2$`),
  card('c-alg-exp-4', 'alg-expand', 'pulapka', r`Czy $(a+b)^2 = a^2 + b^2$?`, r`Nie — brakuje $2ab$. Sprawdź: $(1+2)^2 = 9$, a $1 + 4 = 5$.`),

  card('c-alg-fac-1', 'alg-factor', 'metoda', 'Pierwszy krok rozkładu na czynniki?', 'Wyłącz przed nawias największy wspólny czynnik, potem sprawdź wzory skróconego mnożenia i grupowanie.'),
  card('c-alg-fac-2', 'alg-factor', 'metoda', r`Jak rozwiązać $x^2 - 5x = 0$?`, r`$x(x - 5) = 0$, więc $x = 0$ lub $x = 5$. Nie dziel przez $x$!`),
  card('c-alg-fac-3', 'alg-factor', 'pulapka', r`Czy $x^2 + 4$ rozkłada się na czynniki liniowe?`, 'Nie. Suma kwadratów nie ma takiego rozkładu — działa to tylko dla różnicy.'),

  card('c-alg-rat-1', 'alg-rational', 'definicja', 'Dziedzina wyrażenia wymiernego?', 'Wszystkie liczby, dla których mianownik jest różny od zera.'),
  card('c-alg-rat-2', 'alg-rational', 'metoda', 'Jak skracać wyrażenie wymierne?', 'Rozłóż licznik i mianownik na czynniki i skreśl wspólny czynnik. Dziedzinę wyznacz przed skróceniem.'),
  card('c-alg-rat-3', 'alg-rational', 'pulapka', r`Czy $\frac{x+2}{x} = 2$?`, 'Nie — skraca się czynniki, a nie składniki sumy.'),

  card('c-alg-cub-1', 'alg-cubes', 'wzor', r`$(a+b)^3 = \;?$`, r`$a^3 + 3a^2b + 3ab^2 + b^3$`),
  card('c-alg-cub-2', 'alg-cubes', 'wzor', r`$(a-b)^3 = \;?$`, r`$a^3 - 3a^2b + 3ab^2 - b^3$`),
  card('c-alg-cub-3', 'alg-cubes', 'wzor', r`$a^3 - b^3 = \;?$`, r`$(a-b)(a^2 + ab + b^2)$`),
  card('c-alg-cub-4', 'alg-cubes', 'wzor', r`$a^3 + b^3 = \;?$`, r`$(a+b)(a^2 - ab + b^2)$`),

  card('c-alg-irr-1', 'alg-irrational', 'wzor', r`$\sqrt{a^2} = \;?$`, r`$|a|$`),
  card('c-alg-irr-2', 'alg-irrational', 'metoda', r`Jak usunąć niewymierność z $\frac{1}{\sqrt{a} - b}$?`, r`Pomnóż licznik i mianownik przez sprzężenie $\sqrt{a} + b$; w mianowniku wyjdzie $a - b^2$.`),
  card('c-alg-irr-3', 'alg-irrational', 'pulapka', r`Ile to $\sqrt{(\sqrt{3} - 2)^2}$?`, r`$2 - \sqrt{3}$, bo $\sqrt{3} - 2 < 0$.`),
];

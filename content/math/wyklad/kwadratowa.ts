import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: funkcja kwadratowa. */
export const WYKLAD_KWADRATOWA: Record<string, LessonExplanation> = {
  'quad-forms': {
    idea: [
      'Funkcja kwadratowa ma zawsze ten sam kształt — parabolę, jak tor rzuconej piłki. Trzy postacie wzoru to trzy opisy tej samej paraboli, a każdy pokazuje coś innego bez liczenia.',
      r`Postać kanoniczna $a(x - p)^2 + q$ pokazuje wierzchołek $(p, q)$ — to parabola $y = ax^2$ przesunięta o wektor $[p, q]$. Postać iloczynowa $a(x - x_1)(x - x_2)$ pokazuje miejsca zerowe, bo iloczyn jest zerem, gdy któryś nawias jest zerem. Postać ogólna $ax^2 + bx + c$ pokazuje punkt przecięcia z osią $y$: $(0, c)$.`,
      r`We wszystkich postaciach $a$ jest to samo i mówi o kształcie: $a > 0$ — ramiona w górę (uśmiech), $a < 0$ — w dół (smutna mina). Dlatego przejście między postaciami nigdy nie zmienia $a$.`,
    ],
    method: [
      r`Z postaci ogólnej odczytaj $a$, $b$, $c$.`,
      r`Wierzchołek: $p = -\frac{b}{2a}$, $q = f(p)$ — i masz postać kanoniczną.`,
      r`Miejsca zerowe: policz $\Delta$ i pierwiastki — i masz postać iloczynową (gdy $\Delta \ge 0$).`,
      r`Szkic: wierzchołek, kierunek ramion, miejsca zerowe i punkt $(0, c)$.`,
    ],
    check: {
      question: r`Jaki wierzchołek ma parabola $y = -(x + 1)^2 + 4$ i w którą stronę skierowane są jej ramiona?`,
      answer: r`$W = (-1, 4)$ — znak przy $p$ jest odwrotny niż w nawiasie; ramiona w dół, bo $a = -1 < 0$.`,
    },
  },
  'quad-discriminant': {
    idea: [
      r`Równanie $ax^2 + bx + c = 0$ pyta, gdzie parabola przecina oś $x$. Parabola może przeciąć oś w dwóch miejscach, dotknąć jej wierzchołkiem albo w ogóle jej nie spotkać — stąd trzy możliwe odpowiedzi: dwa, jedno albo zero rozwiązań.`,
      r`Wzór na pierwiastki bierze się z dopełnienia do kwadratu: równanie da się przekształcić do postaci $\left(x + \frac{b}{2a}\right)^2 = \frac{\Delta}{4a^2}$. Po lewej jest kwadrat, więc nigdy nie jest ujemny. Jeśli $\Delta < 0$, prawa strona jest ujemna i równość jest niemożliwa. Jeśli $\Delta > 0$, pierwiastek z prawej strony może być dodatni albo ujemny — stąd „$\pm$” we wzorze.`,
      r`Dlatego $\Delta$ działa jak czujnik: jego znak mówi, ile będzie rozwiązań, zanim policzysz jakikolwiek pierwiastek.`,
    ],
    method: [
      r`Uporządkuj równanie do postaci $ax^2 + bx + c = 0$ i wypisz $a$, $b$, $c$ razem ze znakami.`,
      r`Sprawdź skróty: brak $c$ — wyłącz $x$; brak $b$ — przenieś $c$ i spierwiastkuj.`,
      r`Policz $\Delta = b^2 - 4ac$.`,
      r`$\Delta > 0$: $x_{1,2} = \frac{-b \mp \sqrt{\Delta}}{2a}$; $\Delta = 0$: $x_0 = -\frac{b}{2a}$; $\Delta < 0$: brak rozwiązań.`,
      'Sprawdź jeden pierwiastek, podstawiając go do równania.',
    ],
    check: {
      question: r`Ile rozwiązań ma równanie $x^2 + 2x + 5 = 0$?`,
      answer: r`$\Delta = 4 - 20 = -16 < 0$ — żadnego; parabola leży cała nad osią $x$.`,
    },
  },
  'quad-vertex': {
    idea: [
      'Parabola jest symetryczna — lewe i prawe ramię to lustrzane odbicia względem pionowej prostej przez wierzchołek. Dlatego wierzchołek leży dokładnie w połowie między miejscami zerowymi.',
      r`Miejsca zerowe to $\frac{-b - \sqrt{\Delta}}{2a}$ i $\frac{-b + \sqrt{\Delta}}{2a}$, a ich średnia to $-\frac{b}{2a}$ — pierwiastki z $\Delta$ się znoszą. Stąd wzór $p = -\frac{b}{2a}$, który działa nawet wtedy, gdy miejsc zerowych nie ma.`,
      r`Wierzchołek to najniższy punkt paraboli z ramionami w górę albo najwyższy przy ramionach w dół. Jego druga współrzędna $q$ jest więc najmniejszą albo największą wartością funkcji.`,
    ],
    method: [
      r`Policz $p = -\frac{b}{2a}$ (albo średnią miejsc zerowych).`,
      r`Policz $q = f(p)$, wstawiając $p$ do wzoru.`,
      r`Ramiona w górę ($a > 0$): $q$ to wartość najmniejsza; w dół ($a < 0$): największa.`,
      r`Odpowiedz na pytanie: „wartość” to $q$, „argument” to $p$.`,
    ],
    check: {
      question: r`Jaka jest największa wartość funkcji $f(x) = -x^2 + 4x$?`,
      answer: r`$p = -\frac{4}{2 \cdot (-1)} = 2$, $q = f(2) = -4 + 8 = 4$. Ramiona w dół, więc $4$ to wartość największa.`,
    },
  },
  'quad-ineq': {
    idea: [
      r`Nierówność $f(x) > 0$ pyta: dla jakich $x$ parabola jest NAD osią $x$? Nie trzeba zgadywać — wystarczy wiedzieć, gdzie przecina oś i w którą stronę ma ramiona.`,
      'Ramiona w górę: parabola jest pod osią tylko między miejscami zerowymi (tam jest jej „dolina”), a nad osią — na zewnątrz. Ramiona w dół: odwrotnie. Szkic zajmuje kilka sekund i chroni przed pomyleniem stron.',
      r`Gdy $\Delta < 0$, parabola w ogóle nie dotyka osi — leży cała nad nią albo cała pod nią. Nierówność ma wtedy za rozwiązanie wszystkie liczby albo żadnej.`,
    ],
    method: [
      r`Przenieś wszystko na jedną stronę: $f(x) > 0$ (albo $<$, $\ge$, $\le$).`,
      'Znajdź miejsca zerowe.',
      r`Naszkicuj parabolę: miejsca zerowe na osi, ramiona zgodnie ze znakiem $a$.`,
      r`Odczytaj przedziały nad osią ($> 0$) albo pod osią ($< 0$); przy $\ge$ i $\le$ dołącz miejsca zerowe.`,
    ],
    check: {
      question: r`Rozwiąż $x^2 - 9 < 0$.`,
      answer: r`Miejsca zerowe $-3$ i $3$, ramiona w górę, więc pod osią jest część między nimi: $x \in (-3, 3)$.`,
    },
  },
  'quad-optim': {
    idea: [
      'Wiele wielkości z życia zachowuje się jak parabola: pole prostokąta przy stałym obwodzie najpierw rośnie, potem maleje. Wyjątkowy prostokąt o największym polu odpowiada wierzchołkowi paraboli.',
      r`Przy obwodzie $40$ m boki to $x$ i $20 - x$, a pole $P(x) = x(20 - x)$. Parabola ma ramiona w dół i miejsca zerowe $0$ i $20$, więc wierzchołek jest w połowie: $x = 10$. Kwadrat $10 \times 10$ daje największe pole $100\ \mathrm{m}^2$.`,
      'W zadaniach dziedzina jest ograniczona — długość nie bywa ujemna. Jeśli wierzchołek wypada poza dziedzinę, najlepsza wartość leży na jej końcu.',
    ],
    method: [
      r`Nazwij zmienną $x$ i zapisz jej dziedzinę wynikającą z treści.`,
      r`Zapisz szukaną wielkość jako funkcję kwadratową $x$.`,
      r`Znajdź wierzchołek $p$ i sprawdź, czy należy do dziedziny.`,
      r`Jeśli dziedzina to przedział domknięty, porównaj $f(p)$ z wartościami na końcach.`,
      'Odpowiedz na pytanie z treści: czy chodzi o wymiary, czy o samą wartość.',
    ],
    check: {
      question: r`Suma dwóch liczb wynosi $12$. Jaki jest największy możliwy iloczyn tych liczb?`,
      answer: r`$P(x) = x(12 - x)$ ma wierzchołek w $x = 6$, więc największy iloczyn to $6 \cdot 6 = 36$.`,
    },
  },
  'quad-vieta': {
    idea: [
      r`Jeśli równanie ma pierwiastki $x_1$ i $x_2$, trójmian można zapisać jako $a(x - x_1)(x - x_2)$. Po wymnożeniu wychodzi $ax^2 - a(x_1 + x_2)x + ax_1x_2$ — i porównując z $ax^2 + bx + c$, dostajesz od razu $x_1 + x_2 = -\frac{b}{a}$ oraz $x_1x_2 = \frac{c}{a}$.`,
      r`To tak, jakby znać sumę i iloczyn dwóch liczb, nie znając samych liczb. Wystarcza to do policzenia wielu wyrażeń, np. $x_1^2 + x_2^2$ albo $\frac{1}{x_1} + \frac{1}{x_2}$ — trzeba je tylko zapisać przez sumę i iloczyn.`,
      r`Wzory mówią też o znakach: iloczyn dodatni — pierwiastki mają ten sam znak; iloczyn ujemny — różne. Warunek zawsze ten sam: pierwiastki muszą istnieć, czyli $\Delta \ge 0$.`,
    ],
    method: [
      r`Sprawdź, czy pierwiastki istnieją: $\Delta \ge 0$.`,
      r`Wypisz $x_1 + x_2 = -\frac{b}{a}$ i $x_1x_2 = \frac{c}{a}$.`,
      'Przekształć szukane wyrażenie tak, by zawierało tylko sumę i iloczyn pierwiastków.',
      'Wstaw liczby i policz.',
    ],
    check: {
      question: r`Równanie $x^2 - 7x + 10 = 0$. Ile wynosi suma i iloczyn jego pierwiastków?`,
      answer: r`Suma $7$, iloczyn $10$ — i rzeczywiście pierwiastki to $2$ i $5$.`,
    },
  },
  'quad-param': {
    idea: [
      r`Parametr w równaniu kwadratowym to pokrętło: kręcąc nim, przesuwasz parabolę. Pytanie „dla jakich $m$ są dwa różne pierwiastki” znaczy: przy jakich ustawieniach pokrętła parabola przecina oś $x$ w dwóch punktach.`,
      r`Każdą słowną własność tłumaczysz na warunek liczbowy: „dwa różne pierwiastki” — $a \ne 0$ i $\Delta > 0$; „pierwiastki dodatnie” — dodatkowo suma i iloczyn dodatnie (wzory Viète’a); „pierwiastki różnych znaków” — iloczyn ujemny.`,
      r`Wszystkie warunki muszą zachodzić naraz, więc na końcu bierzesz część wspólną ich rozwiązań — najlepiej na osi liczbowej. Osobno sprawdzasz, co się dzieje, gdy współczynnik przy $x^2$ jest zerem, bo wtedy równanie nie jest kwadratowe.`,
    ],
    method: [
      r`Sprawdź, czy $a$ może być zerem, i rozpatrz ten przypadek osobno.`,
      r`Zapisz warunek na $\Delta$ ($> 0$, $= 0$ albo $\ge 0$) zgodnie z treścią.`,
      'Dopisz warunki na znaki pierwiastków ze wzorów Viète’a, jeśli treść o nie pyta.',
      'Rozwiąż każdy warunek i weź część wspólną.',
      'Zapisz odpowiedź jako zbiór wartości parametru.',
    ],
    check: {
      question: r`Dla jakich $m$ równanie $x^2 + 2x + m = 0$ ma dwa różne pierwiastki?`,
      answer: r`$\Delta = 4 - 4m > 0$, czyli $m < 1$.`,
    },
  },
};

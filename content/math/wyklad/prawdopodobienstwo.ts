import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: kombinatoryka, prawdopodobieństwo i statystyka. */
export const WYKLAD_PRAWDOPODOBIENSTWO: Record<string, LessonExplanation> = {
  'prob-counting': {
    idea: [
      r`Reguła mnożenia jest sercem kombinatoryki. Masz $3$ koszulki i $4$ pary spodni — do każdej koszulki pasuje każda para spodni, więc strojów jest $3 \cdot 4 = 12$. Ciąg decyzji liczysz, mnożąc liczby możliwości w kolejnych krokach.`,
      r`Permutacje to ustawienia w kolejce: na pierwsze miejsce masz $n$ kandydatów, na drugie $n - 1$… Stąd $n!$. Gdy kolejność NIE ma znaczenia (wybierasz delegację, a nie kolejkę), każdy wybór policzyłbyś $k!$ razy, więc dzielisz — tak powstaje $\binom{n}{k}$.`,
      'Najczęstszy problem to ograniczenia, np. liczba nie może zaczynać się od zera. Zaczynasz wtedy od pozycji z największą liczbą ograniczeń, bo ona najbardziej zawęża wybór.',
    ],
    method: [
      'Zapytaj: czy kolejność ma znaczenie? Czy elementy mogą się powtarzać?',
      'Rozpisz zadanie na kolejne decyzje (pozycje) i policz możliwości w każdej.',
      'Zacznij od pozycji z największymi ograniczeniami i pomnóż liczby możliwości.',
      r`Wybór bez kolejności: $\binom{n}{k}$; ustawienie wszystkich elementów: $n!$.`,
    ],
    check: {
      question: r`Na ile sposobów można ustawić $4$ osoby w kolejce, a na ile wybrać z nich $2$ osoby do dyżuru?`,
      answer: r`$4! = 24$ ustawienia i $\binom42 = 6$ wyborów.`,
    },
  },
  'prob-classic': {
    idea: [
      r`Prawdopodobieństwo klasyczne to ułamek „ile sprzyja przez ile jest wszystkich” — ale tylko wtedy, gdy wszystkie wyniki są jednakowo prawdopodobne. Kostka jest uczciwa, więc każda ścianka ma szansę $\frac16$.`,
      r`Najczęstszy błąd to źle zbudowane $\Omega$. Przy dwóch kostkach suma $2$ wypada tylko jednym sposobem, a suma $7$ — sześcioma. Dlatego wynikami są pary $(a, b)$, a nie same sumy: dopiero pary są jednakowo prawdopodobne.`,
      r`Prawdopodobieństwo zawsze leży między $0$ (zdarzenie niemożliwe) a $1$ (pewne). Wynik spoza tego przedziału to sygnał, że gdzieś w liczeniu jest błąd.`,
    ],
    method: [
      r`Opisz $\Omega$ — zbiór jednakowo prawdopodobnych wyników — i policz $|\Omega|$.`,
      r`Opisz zdarzenie $A$ i policz wyniki sprzyjające (tabelka, reguła mnożenia, wypisanie).`,
      r`Policz $P(A) = \frac{|A|}{|\Omega|}$ i skróć ułamek.`,
      r`Sprawdź, czy wynik leży w przedziale $\langle 0, 1 \rangle$.`,
    ],
    check: {
      question: 'Rzucasz monetą dwa razy. Jakie jest prawdopodobieństwo, że wypadną dwa orły?',
      answer: r`$\Omega = \{OO, OR, RO, RR\}$, sprzyja jeden wynik: $\frac14$.`,
    },
  },
  'prob-compound': {
    idea: [
      r`„Co najmniej jeden” jest trudne do liczenia wprost — trzeba by zsumować przypadki: jeden, dwa, trzy… Przeciwieństwo, „ani jednego”, to zwykle jeden prosty przypadek. Dlatego $P(A) = 1 - P(A')$ skraca rachunek.`,
      'Drzewko rozpisuje doświadczenie krok po kroku. Wzdłuż jednej gałęzi zdarzenia zachodzą po kolei („i”), więc prawdopodobieństwa mnożysz. Różne gałęzie to różne możliwości („lub”), więc ich wyniki dodajesz.',
      'Przy losowaniu bez zwracania urna się zmienia: po wyjęciu kuli jest ich o jedną mniej, więc w drugim kroku zmienia się mianownik, a często i licznik.',
    ],
    method: [
      'Sprawdź, czy łatwiej policzyć zdarzenie przeciwne (słowa „co najmniej”, „przynajmniej”).',
      'Narysuj drzewko z prawdopodobieństwami na gałęziach.',
      'Mnóż wzdłuż gałęzi, dodawaj wyniki gałęzi sprzyjających.',
      'Przy losowaniu bez zwracania zmniejszaj liczebność urny w kolejnych krokach.',
    ],
    check: {
      question: 'Jakie jest prawdopodobieństwo, że w trzech rzutach monetą wypadnie co najmniej jeden orzeł?',
      answer: r`$1 - \left(\frac12\right)^3 = \frac78$ — zdarzenie przeciwne to „same reszki”.`,
    },
  },
  'prob-conditional': {
    idea: [
      r`Prawdopodobieństwo warunkowe to szansa po otrzymaniu informacji. Rzucasz kostką, ktoś zerka i mówi „parzysta”. Świat możliwych wyników kurczy się z sześciu do trzech: $2, 4, 6$. Szansa na szóstkę to teraz $\frac13$ — liczona w nowym, mniejszym świecie.`,
      r`Stąd wzór $P(A \mid B) = \frac{P(A \cap B)}{P(B)}$: w mianowniku jest nowy „cały świat” (to, co wiemy), a w liczniku — ta jego część, w której zachodzi $A$.`,
      'Prawdopodobieństwo całkowite liczy szansę zdarzenia, które może zajść różnymi drogami — sumujesz gałęzie drzewka. Wzór Bayesa odwraca pytanie: skoro zdarzenie zaszło, którą drogą najpewniej? To jedna gałąź podzielona przez sumę wszystkich gałęzi sprzyjających.',
    ],
    method: [
      r`Ustal, co już wiadomo (warunek $B$) i o co pytamy ($A$).`,
      r`Policz $P(B)$ — przy kilku drogach sumą gałęzi drzewka.`,
      r`Policz $P(A \cap B)$ — gałąź, w której zachodzą oba zdarzenia.`,
      r`Podziel: $P(A \mid B) = \frac{P(A \cap B)}{P(B)}$.`,
    ],
    check: {
      question: r`Losujesz kartę z talii $52$ kart. Wiesz, że to kier. Jakie jest prawdopodobieństwo, że to as?`,
      answer: r`Nowy „świat” to $13$ kierów, a wśród nich jest jeden as: $\frac{1}{13}$.`,
    },
  },
  'prob-bernoulli': {
    idea: [
      r`Schemat Bernoulliego to powtarzanie tej samej próby: za każdym razem szansa sukcesu wynosi $p$, a próby na siebie nie wpływają. Rzucasz monetą dziesięć razy — moneta nie pamięta poprzednich rzutów.`,
      r`Dokładnie $k$ sukcesów w $n$ próbach może wypaść w różnych kolejnościach. Każda konkretna kolejność ma prawdopodobieństwo $p^k(1 - p)^{n-k}$, a kolejności jest tyle, na ile sposobów da się wybrać $k$ miejsc na sukcesy spośród $n$, czyli $\binom{n}{k}$. Stąd cały wzór.`,
      'Pominięcie symbolu Newtona oznacza policzenie tylko jednej kolejności, np. „najpierw same sukcesy, potem porażki” — a to tylko jeden z wielu scenariuszy.',
    ],
    method: [
      r`Sprawdź warunki: $n$ niezależnych prób, dwa wyniki, stałe $p$.`,
      r`Ustal z treści $n$, $k$ i $p$.`,
      r`Policz $P = \binom{n}{k}p^k(1 - p)^{n-k}$.`,
      r`„Co najmniej jeden” licz przez przeciwne: $1 - (1 - p)^n$; „co najwyżej” — sumą kilku przypadków.`,
    ],
    check: {
      question: r`Na ile sposobów może wypaść dokładnie $2$ orły w $5$ rzutach monetą?`,
      answer: r`$\binom52 = 10$ — tyle jest wyborów dwóch rzutów, w których wypadnie orzeł.`,
    },
  },
  'stat-descriptive': {
    idea: [
      'Średnia to „wyrównanie”: ile miałby każdy, gdyby wszyscy mieli tyle samo. Suma wartości dzielona przez ich liczbę. Średnia ważona robi to samo, ale wartości częstsze albo ważniejsze liczy odpowiednio więcej razy.',
      'Mediana to wartość środkowa po ustawieniu danych od najmniejszej do największej — połowa danych jest nie większa, połowa nie mniejsza. Jest odporna na wartości skrajne: jeden milioner we wsi podnosi średnią zarobków, ale mediany prawie nie rusza.',
      'Dominanta to wartość najczęstsza. Zestaw danych może mieć jedną dominantę, kilka albo żadnej wyraźnej.',
    ],
    method: [
      'Uporządkuj dane rosnąco (albo odczytaj je z tabeli liczebności).',
      'Średnia: suma iloczynów „wartość razy liczebność” podzielona przez liczbę danych.',
      'Mediana: wartość na środkowej pozycji; przy parzystej liczbie danych — średnia dwóch środkowych.',
      'Dominanta: wartość o największej liczebności.',
    ],
    check: {
      question: r`Jaka jest mediana danych $7, 1, 5, 3$?`,
      answer: r`Po uporządkowaniu $1, 3, 5, 7$ mediana to średnia dwóch środkowych: $\frac{3 + 5}{2} = 4$.`,
    },
  },
};

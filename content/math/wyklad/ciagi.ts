import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: ciągi. */
export const WYKLAD_CIAGI: Record<string, LessonExplanation> = {
  'seq-basics': {
    idea: [
      r`Ciąg to ponumerowana kolejka liczb: każda ma numer miejsca $n$ i wartość $a_n$. To zwykła funkcja, tylko jej argumentami są numery $1, 2, 3, \ldots$ — dlatego wykres ciągu to osobne kropki, a nie ciągła linia.`,
      r`Są dwa sposoby opisu. Wzór ogólny działa jak spis: od razu podaje wyraz o dowolnym numerze, np. $a_{100}$. Wzór rekurencyjny działa jak instrukcja „z poprzedniego zrób następny” — żeby dostać setny wyraz, trzeba przejść przez wszystkie wcześniejsze.`,
      r`Ciąg jest rosnący, gdy każdy następny wyraz jest większy od poprzedniego. Najpewniej sprawdzisz to, licząc różnicę $a_{n+1} - a_n$: jeśli dla każdego $n$ jest dodatnia, ciąg rośnie; jeśli ujemna — maleje.`,
    ],
    method: [
      r`Wyraz o danym numerze: wstaw $n$ do wzoru ogólnego (albo licz kolejne wyrazy z rekurencji).`,
      r`„Który wyraz jest równy $k$?”: rozwiąż $a_n = k$ i sprawdź, czy $n$ jest liczbą naturalną.`,
      r`Monotoniczność: policz $a_{n+1} - a_n$ i zbadaj jej znak dla wszystkich $n$.`,
      'Liczba wyrazów spełniających warunek: rozwiąż nierówność i policz liczby naturalne w wyniku.',
    ],
    check: {
      question: r`Czy liczba $30$ jest wyrazem ciągu $a_n = 4n + 1$?`,
      answer: r`$4n + 1 = 30$ daje $n = 7{,}25$ — to nie liczba naturalna, więc nie.`,
    },
  },
  'seq-arithmetic': {
    idea: [
      r`Ciąg arytmetyczny to schody o równych stopniach: każdy krok ma tę samą wysokość $r$. Żeby dojść z pierwszego stopnia na piąty, robisz cztery kroki — stąd $a_5 = a_1 + 4r$, a ogólnie $a_n = a_1 + (n - 1)r$.`,
      r`Suma ma sztuczkę Gaussa: połącz w parę pierwszy wyraz z ostatnim, drugi z przedostatnim… Każda para ma tę samą sumę $a_1 + a_n$, a par jest $\frac{n}{2}$. Stąd $S_n = \frac{a_1 + a_n}{2} \cdot n$ — średnia wyrazów razy ich liczba.`,
      r`Każdy środkowy wyraz jest średnią sąsiadów: $a_n = \frac{a_{n-1} + a_{n+1}}{2}$. Dlatego trzy liczby tworzą ciąg arytmetyczny dokładnie wtedy, gdy środkowa jest średnią skrajnych.`,
    ],
    method: [
      r`Wypisz, co znasz ($a_1$, $r$, któryś wyraz, suma) i co masz znaleźć.`,
      r`Każdy wyraz zapisz przez $a_1$ i $r$: $a_n = a_1 + (n - 1)r$.`,
      r`Ułóż równania i wylicz $a_1$ i $r$.`,
      r`Sumę licz ze wzoru $S_n = \frac{a_1 + a_n}{2} \cdot n$ albo $S_n = \frac{2a_1 + (n - 1)r}{2} \cdot n$.`,
    ],
    check: {
      question: r`W ciągu arytmetycznym $a_1 = 4$ i $r = 3$. Ile wynosi $a_{11}$?`,
      answer: r`$a_{11} = 4 + 10 \cdot 3 = 34$ — od pierwszego do jedenastego wyrazu jest $10$ kroków.`,
    },
  },
  'seq-geometric': {
    idea: [
      r`Ciąg geometryczny to mnożenie zamiast dodawania: każdy wyraz to poprzedni razy $q$, jak przy dzieleniu się komórek: $1, 2, 4, 8, \ldots$ Od pierwszego do $n$-tego wyrazu jest $n - 1$ mnożeń, więc $a_n = a_1 \cdot q^{n-1}$.`,
      r`Wzór na sumę bierze się ze sztuczki. Jeśli $S = a_1 + a_1q + \ldots + a_1q^{n-1}$, to $qS$ ma te same wyrazy przesunięte o jeden miejsce. Po odjęciu prawie wszystko się skraca: $S - qS = a_1 - a_1q^n$, stąd $S_n = a_1 \cdot \frac{1 - q^n}{1 - q}$.`,
      r`Środkowy z trzech kolejnych wyrazów spełnia $b^2 = ac$. To odpowiednik warunku dla ciągu arytmetycznego — zamiast dodawania jest mnożenie.`,
    ],
    method: [
      r`Każdy wyraz zapisz przez $a_1$ i $q$: $a_n = a_1 q^{n-1}$.`,
      r`Z dwóch znanych wyrazów wylicz $q$, dzieląc je, np. $\frac{a_5}{a_2} = q^3$.`,
      r`Uważaj na znaki: z $q^2 = 4$ wynika $q = 2$ lub $q = -2$ — sprawdź warunki zadania.`,
      r`Sumę licz ze wzoru $S_n = a_1 \cdot \frac{1 - q^n}{1 - q}$ (dla $q \ne 1$).`,
    ],
    check: {
      question: r`W ciągu geometrycznym $a_1 = 3$ i $q = 2$. Ile wynosi $a_5$?`,
      answer: r`$3 \cdot 2^4 = 48$ — od pierwszego do piątego wyrazu są cztery mnożenia przez $2$.`,
    },
  },
  'seq-mixed': {
    idea: [
      'Zadania z ciągami „w przebraniu” trzeba najpierw rozpoznać. Stała kwota za każdym razem (co tydzień dokładasz 5 zł więcej) to ciąg arytmetyczny. Stały procent (lokata, spadek wartości o 10% rocznie) to ciąg geometryczny.',
      r`W zadaniach „trzy liczby tworzą ciąg” kluczowy jest warunek na środkowy wyraz: arytmetyczny — $2b = a + c$, geometryczny — $b^2 = ac$. Zapisujesz warunek, rozwiązujesz równanie i gotowe.`,
      r`Zapis symetryczny oszczędza rachunki: trzy wyrazy arytmetyczne to $b - r$, $b$, $b + r$, a ich suma to $3b$. Z informacji o sumie od razu masz środkowy wyraz.`,
    ],
    method: [
      'Rozpoznaj rodzaj ciągu: stała różnica — arytmetyczny; stały iloraz albo procent — geometryczny.',
      r`Zapisz dane i szukane w języku ciągu: $a_1$, $r$ lub $q$, $n$, $S_n$.`,
      'Dla trzech kolejnych wyrazów użyj warunku na środkowy wyraz.',
      r`Rozwiąż równanie i sprawdź, czy wynik ma sens (np. $n$ jest liczbą naturalną).`,
    ],
    check: {
      question: r`Liczby $2$, $x$, $18$ tworzą ciąg geometryczny o wyrazach dodatnich. Ile wynosi $x$?`,
      answer: r`$x^2 = 2 \cdot 18 = 36$, więc $x = 6$ (wartość ujemną odrzucasz).`,
    },
  },
  'seq-limit': {
    idea: [
      r`Granica ciągu to liczba, do której wyrazy podchodzą dowolnie blisko i już się od niej nie oddalają. Ciąg $\frac{n}{n + 1}$: $\frac12, \frac23, \frac34, \ldots, \frac{99}{100}, \ldots$ nigdy nie osiąga $1$, ale różnica od $1$ spada poniżej każdej liczby, jaką wymyślisz. Granica to $1$.`,
      r`W ilorazach wielomianów decydują najwyższe potęgi. Dla ogromnego $n$ w wyrażeniu $\frac{2n^2 + 3n}{5n^2 + 1}$ składniki $3n$ i $1$ są jak grosze przy milionach — liczy się $\frac{2n^2}{5n^2} = \frac25$. Dzielenie przez najwyższą potęgę z mianownika to formalny sposób na wyrzucenie groszy.`,
      r`Uwaga na wyrażenia typu „bardzo dużo minus bardzo dużo”, jak $\sqrt{n^2 + 4n} - n$. Obie części rosną bez końca, a różnica może dążyć do dowolnej liczby. Mnożenie przez sprzężenie zamienia różnicę na iloraz, który już umiesz liczyć.`,
    ],
    method: [
      'Rozpoznaj typ: iloraz wielomianów, różnica z pierwiastkiem, ciąg geometryczny.',
      r`Iloraz: podziel licznik i mianownik przez najwyższą potęgę $n$ z mianownika.`,
      'Różnica z pierwiastkiem: pomnóż i podziel przez sprzężenie.',
      r`Zastąp wyrazy typu $\frac{c}{n}$ i $q^n$ (dla $|q| < 1$) zerem i policz wynik.`,
    ],
    check: {
      question: r`Ile wynosi granica ciągu $a_n = \frac{5n - 2}{2n + 7}$?`,
      answer: r`$\frac52$ — licznik i mianownik mają ten sam stopień, więc granica to iloraz współczynników przy $n$.`,
    },
  },
  'seq-series': {
    idea: [
      r`Idziesz do drzwi: najpierw pokonujesz połowę odległości, potem połowę tego, co zostało, potem znowu połowę… Kroków jest nieskończenie wiele, ale nigdy nie przejdziesz dalej niż do drzwi. Tak nieskończenie wiele liczb może mieć skończoną sumę: $\frac12 + \frac14 + \frac18 + \ldots = 1$.`,
      r`Wzór $S = \frac{a_1}{1 - q}$ wynika z sumy $n$ wyrazów $S_n = a_1 \cdot \frac{1 - q^n}{1 - q}$. Gdy $|q| < 1$, potęga $q^n$ maleje do zera i zostaje $\frac{a_1}{1 - q}$.`,
      r`Gdy $|q| \ge 1$, wyrazy nie maleją do zera, a sumy rosną bez końca albo skaczą — szereg nie ma sumy. Dlatego warunek $|q| < 1$ jest częścią każdego zadania z szeregiem.`,
    ],
    method: [
      r`Odczytaj $a_1$ i $q = \frac{a_2}{a_1}$.`,
      r`Sprawdź warunek zbieżności $|q| < 1$.`,
      r`Policz $S = \frac{a_1}{1 - q}$.`,
      r`W zadaniu z niewiadomą w ilorazie rozwiąż równanie i odrzuć rozwiązania, dla których $|q| \ge 1$.`,
    ],
    check: {
      question: r`Ile wynosi suma szeregu $6 + 2 + \frac23 + \ldots$?`,
      answer: r`$q = \frac13$, więc $S = \frac{6}{1 - \frac13} = 9$.`,
    },
  },
};

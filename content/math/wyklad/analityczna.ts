import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: geometria analityczna. */
export const WYKLAD_ANALITYCZNA: Record<string, LessonExplanation> = {
  'geo-distance': {
    idea: [
      r`Odległość dwóch punktów w układzie współrzędnych to przeciwprostokątna trójkąta prostokątnego. Różnica współrzędnych $x$ to jedna przyprostokątna (ile w poziomie), różnica $y$ — druga (ile w pionie). Resztę daje Pitagoras.`,
      'Środek odcinka to punkt w połowie drogi w obu kierunkach naraz, więc jego współrzędne to średnie współrzędnych końców — tak jak średnia dwóch liczb leży dokładnie w połowie między nimi.',
      'Wzór działa niezależnie od tego, który punkt nazwiesz pierwszym: różnice podnosisz do kwadratu, więc znak nie ma znaczenia.',
    ],
    method: [
      'Wypisz współrzędne obu punktów.',
      r`Odległość: $|AB| = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.`,
      r`Środek: $S = \left(\frac{x_A + x_B}{2}, \frac{y_A + y_B}{2}\right)$.`,
      r`Brakujący koniec odcinka: $B = (2x_S - x_A,\ 2y_S - y_A)$.`,
    ],
    check: {
      question: r`Jaki jest środek odcinka o końcach $(2, 8)$ i $(6, -2)$?`,
      answer: r`$\left(\frac{2 + 6}{2}, \frac{8 + (-2)}{2}\right) = (4, 3)$.`,
    },
  },
  'geo-line': {
    idea: [
      r`Prosta w układzie współrzędnych to wykres funkcji liniowej $y = ax + b$ — $a$ opisuje nachylenie, a $b$ miejsce przecięcia z osią $y$. Wszystko, co umiesz o funkcji liniowej, działa tu bez zmian.`,
      r`W geometrii ważne są relacje: proste równoległe mają to samo $a$, prostopadłe — odwrotne z przeciwnym znakiem. Punkt wspólny dwóch prostych to para liczb spełniająca oba równania, czyli rozwiązanie układu.`,
      'Symetralna odcinka to prosta prostopadła do niego, przechodząca przez jego środek — zbiór punktów jednakowo odległych od obu końców. Łączy więc dwie umiejętności: środek odcinka i prostą prostopadłą.',
    ],
    method: [
      'Ustal nachylenie z warunku: dwa punkty, równoległość albo prostopadłość.',
      r`Wstaw współrzędne znanego punktu do $y = ax + b$ i wylicz $b$.`,
      'Punkt przecięcia prostych: rozwiąż układ ich równań.',
      'Symetralna: środek odcinka i nachylenie prostopadłe do odcinka.',
    ],
    check: {
      question: r`Jaki współczynnik kierunkowy ma symetralna odcinka o końcach $(0, 0)$ i $(4, 2)$?`,
      answer: r`Odcinek ma nachylenie $\frac{2}{4} = \frac12$, więc symetralna — $-2$.`,
    },
  },
  'geo-figures': {
    idea: [
      r`Wielokąt w układzie współrzędnych to zestaw punktów, a każdą jego własność sprawdzisz rachunkiem: długość boku — odległością punktów, kąt prosty — iloczynem nachyleń równym $-1$, równoległość — równymi nachyleniami.`,
      r`Przekątne równoległoboku dzielą się na pół, więc środek $AC$ to ten sam punkt co środek $BD$. Stąd prosty wzór na brakujący wierzchołek: $D = A + C - B$, współrzędna po współrzędnej.`,
      'Pole trójkąta najłatwiej policzyć, gdy jeden bok jest poziomy albo pionowy — wtedy wysokość to różnica współrzędnych. W innym przypadku możesz wpisać trójkąt w prostokąt i odjąć trzy trójkąty prostokątne po bokach.',
    ],
    method: [
      'Narysuj szkic z zaznaczonymi punktami — kolejność wierzchołków ma znaczenie.',
      'Policz potrzebne długości i nachylenia boków.',
      r`Brakujący wierzchołek równoległoboku $ABCD$: $D = A + C - B$.`,
      'Pole: podstawa i wysokość, gdy bok leży równolegle do osi; w innym przypadku prostokąt minus trójkąty.',
    ],
    check: {
      question: r`Trójkąt ma wierzchołki $(0, 0)$, $(6, 0)$ i $(2, 4)$. Ile wynosi jego pole?`,
      answer: r`Podstawa na osi $x$ ma długość $6$, a wysokość $4$, więc $P = \frac12 \cdot 6 \cdot 4 = 12$.`,
    },
  },
  'geo-circle': {
    idea: [
      r`Okrąg to wszystkie punkty odległe o $r$ od środka $S = (a, b)$. Zapisz odległość punktu $(x, y)$ od środka, podnieś do kwadratu — i masz równanie okręgu: $(x - a)^2 + (y - b)^2 = r^2$.`,
      'Z postaci kanonicznej odczytujesz wszystko od razu. Postać ogólną, z rozwiniętymi nawiasami, sprowadzasz z powrotem przez dopełnienie do kwadratu — tak samo jak przy wierzchołku paraboli.',
      'Nie każde równanie tej postaci opisuje okrąg: jeśli po prawej stronie wyjdzie liczba ujemna, żaden punkt go nie spełnia, bo suma kwadratów nie bywa ujemna.',
    ],
    method: [
      r`Postać kanoniczna: odczytaj środek $(a, b)$ — ze znakami przeciwnymi niż w nawiasach — i $r = \sqrt{\text{prawa strona}}$.`,
      r`Postać ogólna: pogrupuj wyrazy z $x$ i z $y$ i dopełnij każdą grupę do kwadratu.`,
      'Przenieś liczby na prawą stronę i sprawdź, czy wynik jest dodatni.',
      'Okrąg przez dany punkt: promień to odległość środka od tego punktu.',
    ],
    check: {
      question: r`Jaki środek i promień ma okrąg $(x + 1)^2 + (y - 3)^2 = 16$?`,
      answer: r`$S = (-1, 3)$, $r = 4$.`,
    },
  },
  'geo-point-line': {
    idea: [
      r`Odległość punktu od prostej to długość najkrótszego odcinka łączącego je — prostopadłego do prostej. Wzór $d = \frac{|Ax_0 + By_0 + C|}{\sqrt{A^2 + B^2}}$ daje ją bez szukania spodka tego odcinka.`,
      'Licznik mówi, jak bardzo punkt „nie pasuje” do równania prostej — dla punktu leżącego na prostej jest zerem. Mianownik przelicza ten wynik na prawdziwą długość, niezależnie od tego, czy równanie prostej pomnożysz przez jakąś liczbę.',
      'Styczność prostej i okręgu to równość: odległość środka od prostej jest równa promieniowi. Mniejsza — prosta przecina okrąg, większa — omija go.',
    ],
    method: [
      r`Zapisz prostą w postaci ogólnej $Ax + By + C = 0$.`,
      'Wstaw punkt do wzoru na odległość, pamiętając o module w liczniku.',
      'Styczność: przyrównaj odległość środka okręgu od prostej do promienia i rozwiąż.',
      'Dwa okręgi: porównaj odległość środków z sumą i różnicą promieni.',
    ],
    check: {
      question: r`Jaka jest odległość punktu $(0, 0)$ od prostej $3x + 4y - 10 = 0$?`,
      answer: r`$\frac{|0 + 0 - 10|}{\sqrt{9 + 16}} = \frac{10}{5} = 2$.`,
    },
  },
  'geo-vectors': {
    idea: [
      r`Wektor to strzałka opisująca przesunięcie: $[3, -2]$ znaczy „$3$ w prawo i $2$ w dół”. Nie ma ustalonego miejsca — ta sama strzałka może zaczynać się w dowolnym punkcie.`,
      r`Wektor $\overrightarrow{AB}$ liczysz jako „koniec minus początek”, bo odpowiada na pytanie: o ile trzeba przesunąć punkt $A$, żeby trafić do $B$? Dodawanie wektorów to wykonanie przesunięć jedno po drugim.`,
      r`Mnożenie wektora przez liczbę zmienia jego długość, ale nie kierunek (liczba ujemna odwraca zwrot). Dlatego wektory są równoległe, gdy jeden jest wielokrotnością drugiego, a punkt w $\frac23$ odcinka $AB$ to $A$ przesunięte o $\frac23 \overrightarrow{AB}$.`,
    ],
    method: [
      r`Współrzędne wektora: $\overrightarrow{AB} = [x_B - x_A, y_B - y_A]$.`,
      r`Długość: $\sqrt{u_x^2 + u_y^2}$.`,
      r`Równoległość: sprawdź, czy $u_x v_y - u_y v_x = 0$.`,
      r`Punkt na odcinku: $M = A + t \cdot \overrightarrow{AB}$.`,
    ],
    check: {
      question: r`Jaki wektor prowadzi z punktu $A = (2, 5)$ do punktu $B = (7, 1)$?`,
      answer: r`$[7 - 2, 1 - 5] = [5, -4]$.`,
    },
  },
};

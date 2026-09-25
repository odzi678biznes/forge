import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: funkcje wymierne. */
export const WYKLAD_WYMIERNE: Record<string, LessonExplanation> = {
  'rat-inverse': {
    idea: [
      'Dwie wielkości są odwrotnie proporcjonalne, gdy ich iloczyn się nie zmienia. Tort dzielony między osoby: dwie osoby — po połowie, cztery — po ćwiartce. Liczba osób razy kawałek na osobę daje zawsze jeden tort.',
      r`Stąd wzór $y = \frac{a}{x}$, gdzie $a = x \cdot y$ jest stałe. Im większe $x$, tym mniejsze $y$ — ale $y$ nigdy nie spada do zera, a dla $x$ bliskiego zera rośnie bez końca. Dlatego osie są asymptotami: wykres zbliża się do nich, ale ich nie dotyka.`,
      r`Hiperbola ma dwie osobne gałęzie, bo $x = 0$ jest zakazane. Między nimi jest przerwa, więc nie mówimy, że funkcja maleje w całej dziedzinie — tylko w każdym przedziale osobno.`,
    ],
    method: [
      'Rozpoznaj proporcjonalność odwrotną: iloczyn dwóch wielkości jest stały.',
      r`Wyznacz $a$ z dowolnej znanej pary: $a = x \cdot y$.`,
      r`Zapisz wzór $y = \frac{a}{x}$ i licz brakujące wartości.`,
      r`Monotoniczność podawaj osobno dla $(-\infty, 0)$ i dla $(0, +\infty)$.`,
    ],
    check: {
      question: r`Jadąc z prędkością $60$ km/h, pokonujesz trasę w $2$ godziny. Ile potrwa jazda z prędkością $40$ km/h?`,
      answer: r`Iloczyn prędkości i czasu to stała długość trasy: $120$ km. $120 : 40 = 3$ godziny.`,
    },
  },
  'rat-shifted': {
    idea: [
      r`Wzór $f(x) = \frac{a}{x - p} + q$ to zwykła hiperbola $\frac{a}{x}$ przesunięta o wektor $[p, q]$ — tak jak każda funkcja w dziale o przesunięciach. Razem z wykresem przesuwają się asymptoty: z osi układu stają się prostymi $x = p$ i $y = q$.`,
      r`Asymptota pionowa $x = p$ to miejsce, gdzie mianownik jest zerem — funkcja tam nie istnieje, a wartości uciekają do nieskończoności. Asymptota pozioma $y = q$ to wartość, do której funkcja się zbliża dla bardzo dużych $x$, bo wtedy ułamek $\frac{a}{x - p}$ jest prawie zerem.`,
      r`Wzór w postaci $\frac{bx + c}{x - p}$ przepisujesz na postać kanoniczną, wydzielając z licznika wielokrotność mianownika — jak przy zamianie ułamka niewłaściwego na liczbę mieszaną.`,
    ],
    method: [
      r`Sprowadź wzór do postaci $\frac{a}{x - p} + q$ (w razie potrzeby wydziel z licznika wielokrotność mianownika).`,
      r`Odczytaj asymptoty: pionowa $x = p$, pozioma $y = q$.`,
      r`Dziedzina $\mathbb{R} \setminus \{p\}$, zbiór wartości $\mathbb{R} \setminus \{q\}$.`,
      r`Szkic: asymptoty traktuj jak nowe osie i narysuj względem nich hiperbolę $\frac{a}{x}$.`,
    ],
    check: {
      question: r`Jakie asymptoty ma wykres $f(x) = \frac{3}{x + 4} - 1$?`,
      answer: r`Pionowa $x = -4$ (bo $x + 4 = x - (-4)$), pozioma $y = -1$.`,
    },
  },
  'rat-inequalities': {
    idea: [
      r`Przy nierówności z $x$ w mianowniku kusi, żeby pomnożyć przez mianownik. Ale mianownik może być dodatni albo ujemny, a mnożenie przez liczbę ujemną odwraca znak nierówności. Nie wiedząc, który przypadek zachodzi, łatwo zgubić połowę rozwiązania.`,
      r`Bezpieczna droga: przenieść wszystko na jedną stronę i zapisać jako jeden ułamek. Ułamek jest dodatni, gdy licznik i mianownik mają ten sam znak — dokładnie wtedy, gdy ich iloczyn jest dodatni. Dlatego znak $\frac{L}{M}$ badasz jak znak iloczynu $L \cdot M$ — wężykiem.`,
      'Jedna różnica względem iloczynu: miejsca zerowe mianownika nigdy nie należą do rozwiązania, bo tam wyrażenie nie istnieje.',
    ],
    method: [
      'Wyznacz dziedzinę: mianowniki różne od zera.',
      r`Przenieś wszystko na jedną stronę (po drugiej $0$) i sprowadź do wspólnego mianownika.`,
      r`Zamień $\frac{L}{M} > 0$ na $L \cdot M > 0$ (tak samo przy innych znakach).`,
      'Rozwiąż wężykiem.',
      'Wyrzuć z wyniku miejsca zerowe mianownika.',
    ],
    check: {
      question: r`Rozwiąż $\frac{x - 2}{x + 1} \ge 0$.`,
      answer: r`Wężyk dla $(x - 2)(x + 1)$: nieujemne dla $x \le -1$ lub $x \ge 2$, ale $-1$ zeruje mianownik. Wynik: $x \in (-\infty, -1) \cup \langle 2, +\infty)$.`,
    },
  },
};

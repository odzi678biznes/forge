import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: liczby rzeczywiste. */
export const WYKLAD_LICZBY: Record<string, LessonExplanation> = {
  'num-order': {
    idea: [
      r`Kolejność działań to umowa, dzięki której każdy człowiek z tego samego zapisu dostaje ten sam wynik. Gdyby jedni liczyli od lewej, a inni najpierw mnożyli, $2 + 3 \cdot 4$ raz byłoby $20$, a raz $14$. Umowa mówi: mnożenie „wiąże mocniej” niż dodawanie, więc wynik to $14$.`,
      r`Ułamek $\frac{3}{4}$ to trzy kawałki tortu pokrojonego na cztery równe części. Dodawać można tylko kawałki tej samej wielkości — ćwiartki do ćwiartek. Dlatego $\frac{1}{2} + \frac{1}{3}$ zamieniasz najpierw na szóste części: $\frac{3}{6} + \frac{2}{6} = \frac{5}{6}$. Kroisz tort drobniej, ale tortu jest tyle samo.`,
      r`Dzielenie przez ułamek pyta: ile razy on się mieści? $3 : \frac{1}{2}$ — ile połówek mieści się w trzech całych? Sześć. Stąd reguła „mnożę przez odwrotność”: $3 \cdot 2 = 6$.`,
    ],
    method: [
      'Policz nawiasy — zaczynając od najbardziej wewnętrznego.',
      'Policz potęgi i pierwiastki.',
      'Mnożenie i dzielenie wykonuj po kolei od lewej do prawej.',
      'Na końcu dodawanie i odejmowanie, też od lewej.',
      'Ułamki dodawaj po sprowadzeniu do wspólnego mianownika, a wynik skróć.',
    ],
    check: {
      question: r`Ile wynosi $2 + 3 \cdot 4 - 6 : 2$?`,
      answer: r`$2 + 12 - 3 = 11$. Najpierw mnożenie i dzielenie, potem dodawanie i odejmowanie.`,
    },
  },
  'num-powers': {
    idea: [
      r`Potęga to skrót zapisu, tak jak mnożenie jest skrótem dodawania. $5 \cdot 3$ to trzy piątki dodane do siebie, a $5^3$ to trzy piątki pomnożone: $5 \cdot 5 \cdot 5 = 125$.`,
      r`Prawa działań wynikają z liczenia czynników. $2^3 \cdot 2^2$ to $(2 \cdot 2 \cdot 2) \cdot (2 \cdot 2)$ — razem pięć dwójek, czyli $2^5$. Dlatego przy mnożeniu wykładniki się dodaje. Przy dzieleniu wspólne czynniki się skracają, więc wykładniki się odejmuje.`,
      r`Wykładnik ujemny nie robi liczby ujemnej. Spójrz na ciąg $2^3 = 8$, $2^2 = 4$, $2^1 = 2$, $2^0 = 1$ — każdy krok w dół to dzielenie przez $2$. Idąc dalej: $2^{-1} = \frac{1}{2}$, $2^{-2} = \frac{1}{4}$. Minus w wykładniku znaczy „odwróć”.`,
    ],
    method: [
      r`Sprowadź potęgi do tej samej podstawy, jeśli się da, np. $4 = 2^2$, $8 = 2^3$.`,
      'Zastosuj prawa: przy mnożeniu dodaj wykładniki, przy dzieleniu odejmij, przy potędze potęgi pomnóż.',
      r`Wykładnik ujemny zamień na odwrotność: $a^{-n} = \frac{1}{a^n}$.`,
      'Sprawdź znak: czy minus stoi w nawiasie razem z podstawą?',
    ],
    check: {
      question: r`Ile wynosi $\frac{4^3}{2^5}$?`,
      answer: r`$4^3 = (2^2)^3 = 2^6$, więc $\frac{2^6}{2^5} = 2^1 = 2$.`,
    },
  },
  'num-roots': {
    idea: [
      r`Pierwiastek „odkręca” potęgę. Skoro $7^2 = 49$, to $\sqrt{49} = 7$ — pierwiastek odpowiada na pytanie: jaką nieujemną liczbę trzeba podnieść do kwadratu, żeby dostać $49$?`,
      r`Stąd wykładnik ułamkowy. Jeśli $a^{\frac12}$ podniesiesz do kwadratu, prawo potęgi potęgi daje $a^{\frac12 \cdot 2} = a^1 = a$. Czyli $a^{\frac12}$ zachowuje się dokładnie jak $\sqrt{a}$ — i dzięki temu pierwiastki podlegają tym samym prawom co potęgi.`,
      r`Wyciąganie przed pierwiastek to szukanie w środku „pełnych kwadratów”: $\sqrt{72} = \sqrt{36 \cdot 2}$, a z $36$ pierwiastek jest dokładny — wychodzi $6$, a $2$ zostaje pod pierwiastkiem: $6\sqrt{2}$.`,
    ],
    method: [
      r`Rozłóż liczbę pod pierwiastkiem na kwadrat ($4, 9, 16, 25, 36, \ldots$) i resztę.`,
      'Wyciągnij pierwiastek z kwadratu przed znak pierwiastka.',
      r`Gdy działania są trudne, zamień pierwiastki na potęgi: $\sqrt[n]{a^m} = a^{\frac{m}{n}}$, i licz prawami potęg.`,
      'Pierwiastek w mianowniku usuń, mnożąc licznik i mianownik przez ten sam pierwiastek.',
    ],
    check: {
      question: r`Ile wynosi $8^{\frac{2}{3}}$?`,
      answer: r`$\sqrt[3]{8} = 2$, a $2^2 = 4$. Mianownik wykładnika to stopień pierwiastka, licznik — potęga.`,
    },
  },
  'num-percent': {
    idea: [
      r`Procent to ułamek o mianowniku $100$ — nazwa pochodzi od łacińskiego „na sto”. $30\%$ znaczy „$30$ z każdej setki”, czyli $0{,}3$ całości.`,
      r`Najważniejsze pytanie w każdym zadaniu z procentami brzmi: z czego jest ten procent? Obniżka o $20\%$ liczy się od ceny PRZED obniżką. Dlatego po obniżce o $20\%$ i podwyżce o $20\%$ nie wracasz do ceny wyjściowej — podwyżka liczy się już od mniejszej kwoty.`,
      r`Zmianę o $p\%$ najwygodniej traktować jak mnożenie. Po podwyżce o $15\%$ cena to $115\%$ starej, czyli stara razy $1{,}15$. Kilka zmian po sobie to kilka mnożeń.`,
    ],
    method: [
      'Ustal, co jest całością, czyli od czego liczysz procent.',
      r`Zamień procent na ułamek dziesiętny: $p\% = \frac{p}{100}$.`,
      r`Zmianę o $p\%$ zapisz jako mnożenie przez $\left(1 \pm \frac{p}{100}\right)$; kolejne zmiany mnóż.`,
      'Gdy znasz wartość po zmianie, a szukasz wyjściowej, podziel przez ten sam czynnik.',
      'Odróżnij punkty procentowe (różnica dwóch procentów) od procentów (zmiana względna).',
    ],
    check: {
      question: r`Cena po podwyżce o $25\%$ wynosi $150$ zł. Ile wynosiła przed podwyżką?`,
      answer: r`$150 : 1{,}25 = 120$ zł. Podwyżka liczy się od ceny wyjściowej, więc dzielisz przez $1{,}25$ — nie odejmujesz $25\%$ ze $150$.`,
    },
  },
  'num-abs': {
    idea: [
      r`Wartość bezwzględną najłatwiej rozumieć jako odległość. Na osi liczbowej $-5$ i $5$ leżą tak samo daleko od zera, tylko po przeciwnych stronach. Odległość nie bywa ujemna, dlatego zawsze $|x| \ge 0$.`,
      r`$|x - a|$ to odległość punktu $x$ od punktu $a$. Nierówność $|x - 2| < 3$ czytasz: „$x$ leży bliżej niż $3$ od liczby $2$”. Zaznaczasz $2$ na osi, odmierzasz $3$ w lewo i w prawo i od razu widzisz przedział $(-1, 5)$.`,
      r`Przedział to wszystkie liczby między dwoma końcami. Nawias ostry $\langle$ oznacza, że koniec należy do zbioru, a okrągły $($ — że nie należy. Nieskończoność nie jest liczbą, więc przy niej nawias jest zawsze okrągły.`,
    ],
    method: [
      r`Zapisz wyrażenie w postaci $|x - a|$ (np. $|x + 1| = |x - (-1)|$) i odczytaj środek $a$.`,
      r`Zaznacz $a$ na osi i odmierz odległość $r$ w obie strony.`,
      r`Przy „$\le r$” albo „$< r$” bierzesz punkty w środku, przy „$\ge r$” albo „$> r$” — na zewnątrz.`,
      'Zdecyduj o nawiasach: znak równości w nierówności oznacza, że końce należą do zbioru.',
    ],
    check: {
      question: r`Jakie liczby spełniają nierówność $|x + 3| \le 1$?`,
      answer: r`To liczby odległe od $-3$ o co najwyżej $1$: $x \in \langle -4, -2 \rangle$.`,
    },
  },
  'num-approx': {
    idea: [
      'Każdy pomiar i każde zaokrąglenie trochę mija się z prawdą — pytanie tylko, jak bardzo. Błąd bezwzględny mówi, o ile się pomyliłeś, a błąd względny — czy to dużo, czy mało w stosunku do całości.',
      'Pomyłka o 1 cm przy mierzeniu długopisu to spory błąd, a przy mierzeniu boiska nie ma znaczenia. Dlatego błąd dzielisz przez wartość DOKŁADNĄ — dostajesz, jaką częścią całości jest pomyłka.',
      r`Notacja wykładnicza to sposób na liczby z mnóstwem zer. Zamiast $300\,000\,000$ piszesz $3 \cdot 10^8$ — wykładnik mówi, o ile miejsc przesunąć przecinek. Dodatni wykładnik: liczba duża, ujemny: liczba mała.`,
    ],
    method: [
      r`Ustal, która liczba jest dokładna ($x$), a która jest przybliżeniem ($x_0$).`,
      r`Policz błąd bezwzględny $|x - x_0|$.`,
      r`Błąd względny: podziel przez $|x|$ i pomnóż przez $100\%$.`,
      'W notacji wykładniczej przesuń przecinek tak, by przed nim została jedna cyfra różna od zera; liczba przesunięć to wykładnik.',
    ],
    check: {
      question: r`Zapisz $0{,}00056$ w notacji wykładniczej.`,
      answer: r`$5{,}6 \cdot 10^{-4}$ — przecinek przesuwamy o $4$ miejsca w prawo, więc wykładnik jest ujemny.`,
    },
  },
  'num-proofs': {
    idea: [
      'Przykłady mogą przekonać, ale niczego nie dowodzą: nawet milion sprawdzonych liczb nie wyklucza, że następna zachowa się inaczej. Dowód to rachunek na literze, która zastępuje DOWOLNĄ liczbę — wtedy wynik dotyczy wszystkich liczb naraz.',
      r`Pierwszy pomysł: każdą liczbę całkowitą da się zapisać przez resztę z dzielenia. Parzysta to $2k$, nieparzysta to $2k + 1$. Jeśli po przekształceniach wyrażenie ma postać $6 \cdot (\text{liczba całkowita})$, to na pewno dzieli się przez $6$.`,
      r`Drugi pomysł: wśród dwóch kolejnych liczb całkowitych zawsze jest parzysta, a wśród trzech kolejnych — wielokrotność $3$. Dlatego rozkład na iloczyn kolejnych liczb, jak $(n - 1)n(n + 1)$, często załatwia cały dowód.`,
    ],
    method: [
      r`Zapisz liczby w postaci ogólnej ($2k$, $2k + 1$, $3k + 2$…) albo użyj tej, którą podaje zadanie.`,
      'Przekształć wyrażenie: wymnóż, uprość, spróbuj rozłożyć na czynniki.',
      r`Doprowadź do postaci $d \cdot (\ldots)$ z liczbą całkowitą w nawiasie albo do iloczynu kolejnych liczb.`,
      'Zakończ wnioskiem słowami: „zatem liczba … jest podzielna przez …”.',
    ],
    check: {
      question: r`Dlaczego suma trzech kolejnych liczb całkowitych dzieli się przez $3$?`,
      answer: r`$(n - 1) + n + (n + 1) = 3n$ — to iloczyn $3$ i liczby całkowitej $n$, więc dzieli się przez $3$ dla każdego $n$.`,
    },
  },
};

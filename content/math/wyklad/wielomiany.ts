import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: wielomiany. */
export const WYKLAD_WIELOMIANY: Record<string, LessonExplanation> = {
  'poly-basics': {
    idea: [
      r`Wielomian to budowla z klocków $a x^n$: liczba razy potęga $x$. Funkcja liniowa i kwadratowa to wielomiany stopnia $1$ i $2$ — wielomian po prostu dopuszcza wyższe potęgi.`,
      'Stopień, czyli najwyższa potęga, mówi najwięcej o zachowaniu: jak wykres zachowuje się daleko od zera i ile najwyżej może mieć miejsc zerowych — co najwyżej tyle, ile wynosi stopień.',
      r`Dwa wielomiany są równe tylko wtedy, gdy mają takie same współczynniki przy każdej potędze. Dlatego zadanie „dla jakich $a$ i $b$ wielomiany są równe” rozwiązujesz, porównując współczynniki potęga po potędze.`,
    ],
    method: [
      'Uporządkuj wielomian według malejących potęg i połącz wyrazy podobne.',
      r`Stopień: najwyższa potęga z niezerowym współczynnikiem; wyraz wolny: $W(0)$.`,
      r`Wartość: wstaw liczbę w miejsce każdego $x$.`,
      'Równość wielomianów: wymnóż, uporządkuj i porównaj współczynniki przy tych samych potęgach.',
    ],
    check: {
      question: r`Jaki stopień ma wielomian $(x^3 + 1)(2x^2 - x)$?`,
      answer: r`$3 + 2 = 5$ — przy mnożeniu stopnie się dodają.`,
    },
  },
  'poly-division': {
    idea: [
      r`Dzielenie wielomianów działa jak dzielenie liczb z resztą: $17 = 5 \cdot 3 + 2$. Tak samo $W(x) = (x - a) \cdot Q(x) + R$, a przy dzieleniu przez $(x - a)$ reszta jest liczbą.`,
      r`Wstaw $x = a$ do tej równości: czynnik $(x - a)$ się zeruje i zostaje $W(a) = R$. To całe twierdzenie o reszcie — resztę dostajesz bez dzielenia, jednym podstawieniem.`,
      r`Jeśli reszta jest zerem, $(x - a)$ jest czynnikiem wielomianu, a $a$ — jego pierwiastkiem (twierdzenie Bézouta). Schemat Hornera to szybki sposób, żeby ten czynnik „wyjąć” i dostać wielomian o stopień niższy.`,
    ],
    method: [
      r`Ustal $a$ z dzielnika $(x - a)$ — przy $(x + 2)$ jest to $a = -2$.`,
      r`Reszta: policz $W(a)$.`,
      'Iloraz: zapisz współczynniki (zera za brakujące potęgi) i zastosuj schemat Hornera.',
      r`Sprawdź: ostatnia liczba w schemacie to reszta i musi się równać $W(a)$.`,
    ],
    check: {
      question: r`Jaka jest reszta z dzielenia $x^3 + 2x - 1$ przez $(x - 1)$?`,
      answer: r`$W(1) = 1 + 2 - 1 = 2$.`,
    },
  },
  'poly-roots': {
    idea: [
      r`Pierwiastki wielomianu to miejsca, w których wykres spotyka oś $x$. Zgadywanie ich na ślepo byłoby loterią — ale przy współczynnikach całkowitych jest podpowiedź: pierwiastek całkowity musi dzielić wyraz wolny.`,
      r`Skąd to wiadomo? Jeśli całkowite $a$ jest pierwiastkiem $x^3 + bx^2 + cx + d$, to $a^3 + ba^2 + ca = -d$. Lewa strona to $a$ razy liczba całkowita, więc $d$ musi być wielokrotnością $a$. Lista kandydatów robi się krótka.`,
      r`Krotność mówi, ile razy dany czynnik występuje w rozkładzie. Przy pierwiastku jednokrotnym wykres przecina oś, a przy podwójnym tylko jej dotyka i zawraca — jak parabola $y = x^2$ w zerze.`,
    ],
    method: [
      'Wypisz dzielniki wyrazu wolnego z plusem i minusem — to kandydaci.',
      r`Sprawdzaj kandydatów, licząc $W(a)$, aż trafisz na zero.`,
      r`Podziel wielomian przez $(x - a)$ schematem Hornera.`,
      'Szukaj pierwiastków ilorazu — często to już równanie kwadratowe.',
      'Zapisz rozkład i odczytaj krotności z wykładników.',
    ],
    check: {
      question: r`Które liczby mogą być pierwiastkami całkowitymi wielomianu $x^3 - 2x^2 - 5x + 6$?`,
      answer: r`Dzielniki $6$: $\pm 1, \pm 2, \pm 3, \pm 6$. Rzeczywiście pierwiastkami są $1$, $-2$ i $3$.`,
    },
  },
  'poly-equations': {
    idea: [
      'Równanie wielomianowe wysokiego stopnia wygląda groźnie, ale strategia jest jedna: zamienić wielomian w iloczyn prostych czynników. Iloczyn jest zerem, gdy któryś czynnik jest zerem — i duże równanie rozpada się na kilka małych.',
      r`Dlaczego nie wolno dzielić przez $x$? Bo gubi się rozwiązania. W $x^3 = 4x$ po podzieleniu przez $x$ zostaje $x^2 = 4$ — i znika rozwiązanie $x = 0$. Wyłączenie $x$ przed nawias, $x(x^2 - 4) = 0$, zachowuje wszystkie trzy rozwiązania.`,
      r`Równania dwukwadratowe, jak $x^4 - 5x^2 + 4 = 0$, zamieniasz podstawieniem $t = x^2$ na zwykłe kwadratowe. Pamiętaj tylko, że $t = x^2$ nie może być ujemne.`,
    ],
    method: [
      r`Przenieś wszystko na jedną stronę — po drugiej ma zostać $0$.`,
      r`Rozkładaj: wspólny czynnik, wzory skróconego mnożenia, grupowanie, pierwiastek wymierny z Hornerem, podstawienie $t = x^2$.`,
      'Przyrównaj każdy czynnik do zera i rozwiąż.',
      r`Zbierz rozwiązania; przy podstawieniu odrzuć ujemne $t$.`,
    ],
    check: {
      question: r`Rozwiąż $x^3 - 9x = 0$.`,
      answer: r`$x(x - 3)(x + 3) = 0$, więc $x \in \{-3, 0, 3\}$.`,
    },
  },
  'poly-inequalities': {
    idea: [
      'Wielomian zmienia znak tylko w swoich pierwiastkach — między nimi wykres nie może przeskoczyć z góry na dół, nie przecinając osi. Dlatego wystarczy znać pierwiastki i znak w jednym miejscu, żeby znać znak wszędzie.',
      'Daleko po prawej stronie decyduje najwyższa potęga: jeśli współczynnik przy niej jest dodatni, wielomian jest tam dodatni. Stąd „wężyk” zaczyna z prawej nad osią i przy każdym pierwiastku przechodzi na drugą stronę.',
      r`Wyjątek: pierwiastek parzystej krotności, np. z czynnika $(x - 1)^2$. Kwadrat nigdy nie jest ujemny, więc ten czynnik nie zmienia znaku — wężyk tylko dotyka osi i wraca.`,
    ],
    method: [
      'Przenieś wszystko na jedną stronę i rozłóż wielomian na czynniki.',
      'Zaznacz pierwiastki na osi razem z ich krotnościami.',
      'Zacznij z prawej: nad osią, jeśli współczynnik przy najwyższej potędze jest dodatni, pod osią — jeśli ujemny.',
      'Przy pierwiastku nieparzystej krotności przejdź na drugą stronę, przy parzystej — odbij się.',
      r`Odczytaj przedziały i zdecyduj o końcach: przy $\ge$ i $\le$ pierwiastki należą do rozwiązania.`,
    ],
    check: {
      question: r`Jaki znak ma $(x - 2)(x + 1)$ dla $x = 0$ i czy zgadza się to z wężykiem?`,
      answer: r`$(0 - 2)(0 + 1) = -2 < 0$. Wężyk zaczyna z prawej nad osią, po przejściu przez $2$ schodzi pod oś, więc między $-1$ a $2$ jest ujemny — zgadza się.`,
    },
  },
};

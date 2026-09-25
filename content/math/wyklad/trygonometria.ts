import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: trygonometria. */
export const WYKLAD_TRYGONOMETRIA: Record<string, LessonExplanation> = {
  'trig-values': {
    idea: [
      r`Wszystkie trójkąty prostokątne z kątem $30^\circ$ są podobne — to powiększenia jednego trójkąta. W powiększeniu wszystkie boki rosną tyle samo razy, więc ich STOSUNKI się nie zmieniają. Stosunek boków zależy tylko od kąta — i dostaje nazwę: sinus, cosinus, tangens.`,
      'Sinus to przeciwległa przez przeciwprostokątną, cosinus — przyległa przez przeciwprostokątną, tangens — przeciwległa przez przyległą. Dzięki nim z jednego boku i kąta wyliczysz pozostałe boki, np. wysokość drzewa z długości jego cienia i kąta padania słońca.',
      r`Wartości dla $30^\circ$, $45^\circ$ i $60^\circ$ wynikają z połowy trójkąta równobocznego i połowy kwadratu. W trójkącie równobocznym o boku $2$ wysokość ma $\sqrt3$, a połowa podstawy $1$ — stąd $\sin 30^\circ = \frac12$ i $\cos 30^\circ = \frac{\sqrt3}{2}$.`,
    ],
    method: [
      'Zaznacz kąt i nazwij boki względem niego: przeciwległa, przyległa, przeciwprostokątna.',
      'Wybierz funkcję, która łączy bok znany z szukanym.',
      r`Ułóż równanie, np. $\sin\alpha = \frac{\text{przeciwległa}}{\text{przeciwprostokątna}}$, i rozwiąż je.`,
      r`Sprawdź sens: sinus i cosinus kąta ostrego leżą między $0$ a $1$.`,
    ],
    check: {
      question: r`W trójkącie prostokątnym przeciwprostokątna ma długość $10$, a jeden z kątów ostrych $30^\circ$. Ile ma przyprostokątna leżąca naprzeciw tego kąta?`,
      answer: r`$10 \cdot \sin 30^\circ = 10 \cdot \frac12 = 5$.`,
    },
  },
  'trig-identities': {
    idea: [
      r`W trójkącie prostokątnym o przeciwprostokątnej $1$ przyprostokątne mają długości $\sin\alpha$ i $\cos\alpha$. Twierdzenie Pitagorasa daje od razu $\sin^2\alpha + \cos^2\alpha = 1$ — to jest jedynka trygonometryczna.`,
      r`Drugi wzór, $\mathrm{tg}\,\alpha = \frac{\sin\alpha}{\cos\alpha}$, to podzielenie definicji: przeciwległa przez przeciwprostokątną podzielona przez przyległą przez przeciwprostokątną — przeciwprostokątna się skraca.`,
      r`Dzięki tym dwóm wzorom jedna wartość wystarcza, żeby znać wszystkie trzy. Często najprościej narysować trójkąt: $\sin\alpha = \frac35$ to przyprostokątna $3$ i przeciwprostokątna $5$, więc druga przyprostokątna ma $4$.`,
    ],
    method: [
      r`Z danej wartości wylicz drugą funkcję z jedynki: $\cos\alpha = \sqrt{1 - \sin^2\alpha}$ (dla kąta ostrego ze znakiem plus).`,
      r`Tangens policz jako $\frac{\sin\alpha}{\cos\alpha}$.`,
      'Albo narysuj trójkąt o bokach wynikających z danej wartości i dolicz trzeci bok z Pitagorasa.',
      r`W wyrażeniach typu $\frac{\sin\alpha + \cos\alpha}{\sin\alpha - \cos\alpha}$ podziel licznik i mianownik przez $\cos\alpha$, żeby wszystko zapisać przez tangens.`,
    ],
    check: {
      question: r`Kąt $\alpha$ jest ostry i $\cos\alpha = \frac{5}{13}$. Ile wynosi $\sin\alpha$?`,
      answer: r`$\sqrt{1 - \frac{25}{169}} = \sqrt{\frac{144}{169}} = \frac{12}{13}$.`,
    },
  },
  'trig-obtuse': {
    idea: [
      r`Kąta rozwartego nie da się wstawić do trójkąta prostokątnego, więc sinus i cosinus definiuje się przez punkt na okręgu o promieniu $1$. Ramię kąta wychodzi ze środka i przecina okrąg w punkcie $(x, y)$ — wtedy $\cos\alpha = x$ i $\sin\alpha = y$.`,
      r`Dla kąta ostrego ta definicja daje to samo co trójkąt. Dla rozwartego punkt leży na lewo od osi $y$, więc $x$ (cosinus) jest ujemny, a $y$ (sinus) nadal dodatni. Tangens, czyli $\frac{y}{x}$, też wychodzi ujemny.`,
      r`Kąty $\alpha$ i $180^\circ - \alpha$ dają punkty symetryczne względem osi $y$: ta sama wysokość, przeciwne $x$. Stąd $\sin(180^\circ - \alpha) = \sin\alpha$ i $\cos(180^\circ - \alpha) = -\cos\alpha$. Tangens kąta nachylenia prostej to jej współczynnik kierunkowy.`,
    ],
    method: [
      r`Kąt rozwarty zapisz jako $180^\circ - \beta$ z ostrym $\beta$.`,
      r`Sinus: $\sin(180^\circ - \beta) = \sin\beta$; cosinus i tangens — ze zmienionym znakiem.`,
      r`Kąt nachylenia prostej $y = ax + b$: $\mathrm{tg}\,\alpha = a$; ujemne $a$ oznacza kąt rozwarty.`,
      r`Przy $\sin\alpha = k$ dla $\alpha \in (0^\circ, 180^\circ)$ sprawdź oba kąty: $\beta$ i $180^\circ - \beta$.`,
    ],
    check: {
      question: r`Ile wynosi $\sin 150^\circ$, a ile $\cos 150^\circ$?`,
      answer: r`$\sin 150^\circ = \sin 30^\circ = \frac12$, a $\cos 150^\circ = -\cos 30^\circ = -\frac{\sqrt3}{2}$.`,
    },
  },
  'trig-area': {
    idea: [
      r`Pole trójkąta to połowa podstawy razy wysokość — ale wysokości często nie ma w treści. Jeśli znasz dwa boki i kąt między nimi, wysokość da się wyczytać z sinusa: opuszczona na bok $a$ jest przyprostokątną naprzeciw kąta $\gamma$ w trójkącie o przeciwprostokątnej $b$, więc $h = b\sin\gamma$.`,
      r`Stąd $P = \frac12 ab\sin\gamma$. Dla kąta prostego $\sin 90^\circ = 1$ i dostajesz znane $\frac12 ab$; im bardziej kąt odbiega od prostego, tym trójkąt jest bardziej „spłaszczony” i ma mniejsze pole.`,
      r`Ten sam pomysł działa dla równoległoboku: to dwa jednakowe trójkąty, więc $P = ab\sin\alpha$.`,
    ],
    method: [
      'Znajdź dwa boki i kąt leżący MIĘDZY nimi.',
      r`Wstaw do $P = \frac12 ab\sin\gamma$ (w równoległoboku i rombie $P = ab\sin\alpha$).`,
      r`Kąt rozwarty zamień: $\sin(180^\circ - \alpha) = \sin\alpha$.`,
      r`Gdy znasz pole, a szukasz kąta, wylicz $\sin\gamma$ i ustal z treści, czy kąt jest ostry, czy rozwarty.`,
    ],
    check: {
      question: r`Ile wynosi pole równoległoboku o bokach $4$ i $5$ i kącie ostrym $30^\circ$?`,
      answer: r`$4 \cdot 5 \cdot \sin 30^\circ = 20 \cdot \frac12 = 10$.`,
    },
  },
  'trig-laws': {
    idea: [
      r`Twierdzenie cosinusów to Pitagoras z poprawką: $c^2 = a^2 + b^2 - 2ab\cos\gamma$. Dla kąta prostego poprawka znika, bo $\cos 90^\circ = 0$. Dla kąta rozwartego cosinus jest ujemny, więc poprawka dodaje — naprzeciw kąta rozwartego leży dłuższy bok niż przy kącie prostym.`,
      r`Twierdzenie sinusów mówi, że w każdym trójkącie stosunek boku do sinusa kąta naprzeciw niego jest taki sam i równy średnicy okręgu opisanego: $\frac{a}{\sin\alpha} = 2R$. Większy kąt, dłuższy bok naprzeciw niego.`,
      'Wybór narzędzia zależy od danych: dwa boki i kąt między nimi albo trzy boki — cosinusy; bok i kąt naprzeciw niego plus jeszcze jeden element — sinusy.',
    ],
    method: [
      'Zaznacz na rysunku dane i szukane: które boki, które kąty.',
      'Dwa boki i kąt między nimi (albo trzy boki): twierdzenie cosinusów.',
      'Para „bok i kąt naprzeciw niego” plus jeden element: twierdzenie sinusów.',
      'Podstaw, uważając na znak cosinusa kąta rozwartego, i policz.',
    ],
    check: {
      question: r`Czy trójkąt o bokach $5$, $6$ i $8$ jest ostrokątny?`,
      answer: r`Nie: $8^2 = 64 > 5^2 + 6^2 = 61$, więc kąt naprzeciw boku $8$ jest rozwarty.`,
    },
  },
  'trig-radians': {
    idea: [
      r`Radian mierzy kąt długością łuku: kąt $1$ radiana wycina z okręgu o promieniu $1$ łuk długości $1$. Cały okrąg ma obwód $2\pi$, więc kąt pełny to $2\pi$ radianów, a $180^\circ$ to $\pi$.`,
      r`Gdy kąty mogą być dowolnie duże (także ujemne), punkt na okręgu jednostkowym krąży w kółko. Po pełnym obrocie wraca w to samo miejsce, więc sinus i cosinus powtarzają się co $2\pi$ — są okresowe. Dlatego ich wykresy wyglądają jak fale.`,
      r`Tangens powtarza się już co $\pi$: punkty po przeciwnych stronach okręgu mają obie współrzędne przeciwne, a ich iloraz $\frac{y}{x}$ jest taki sam.`,
    ],
    method: [
      r`Stopnie na radiany: pomnóż przez $\frac{\pi}{180^\circ}$; radiany na stopnie — odwrotnie.`,
      r`Duży kąt sprowadź do $\langle 0, 2\pi)$, odejmując pełne obroty $2\pi$.`,
      'Ustal ćwiartkę i znak funkcji, a wartość odczytaj z kąta ostrego odniesienia.',
      r`Okres $\sin(kx)$ i $\cos(kx)$ to $\frac{2\pi}{|k|}$, a $\mathrm{tg}(kx)$ — $\frac{\pi}{|k|}$.`,
    ],
    check: {
      question: r`Ile stopni ma kąt $\frac{5\pi}{6}$?`,
      answer: r`$\frac{5\pi}{6} \cdot \frac{180^\circ}{\pi} = 150^\circ$.`,
    },
  },
  'trig-formulas': {
    idea: [
      r`Sinus nie jest „liniowy”: $\sin(30^\circ + 30^\circ) = \sin 60^\circ \approx 0{,}87$, a $\sin 30^\circ + \sin 30^\circ = 1$. Dlatego potrzebne są wzory, które mówią, jak naprawdę liczyć funkcje sumy kątów.`,
      r`Wzory na podwojony kąt to szczególny przypadek wzorów na sumę: wstawiasz $\beta = \alpha$. Z $\sin(\alpha + \beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta$ wychodzi $\sin 2\alpha = 2\sin\alpha\cos\alpha$. Trzy postacie $\cos 2\alpha$ różnią się tylko użyciem jedynki trygonometrycznej.`,
      r`W zadaniach częściej rozpoznajesz wzór „od prawej”: iloczyn $\sin x \cos x$ to połowa $\sin 2x$, a różnica $\cos^2 x - \sin^2 x$ to $\cos 2x$. Zamiana skomplikowanego wyrażenia na jedną funkcję zwykle rozwiązuje zadanie.`,
    ],
    method: [
      'Rozpoznaj wzór: suma lub różnica kątów, podwojony kąt, a może wzór czytany od prawej.',
      'Rozpisz albo zwiń wyrażenie według wzoru z tablic.',
      r`Dla $\cos 2\alpha$ wybierz postać z funkcją, którą znasz: $2\cos^2\alpha - 1$ albo $1 - 2\sin^2\alpha$.`,
      r`Policz wartości dla kątów z tabelki: $30^\circ$, $45^\circ$, $60^\circ$.`,
    ],
    check: {
      question: r`Oblicz $\sin 75^\circ$, zapisując $75^\circ = 45^\circ + 30^\circ$.`,
      answer: r`$\sin 45^\circ\cos 30^\circ + \cos 45^\circ\sin 30^\circ = \frac{\sqrt2}{2} \cdot \frac{\sqrt3}{2} + \frac{\sqrt2}{2} \cdot \frac12 = \frac{\sqrt6 + \sqrt2}{4}$.`,
    },
  },
  'trig-equations': {
    idea: [
      r`Równanie $\sin x = \frac12$ ma w jednym pełnym obrocie dwa rozwiązania: $30^\circ$ i $150^\circ$ — dwa punkty okręgu na tej samej wysokości. A ponieważ sinus powtarza się co $360^\circ$, rozwiązań jest nieskończenie wiele: do każdego można dodać pełne obroty.`,
      'Dlatego strategia ma dwa etapy: najpierw znajdujesz rozwiązania w jednym okresie (z okręgu jednostkowego albo z wykresu), potem dopisujesz okres albo wybierasz te, które leżą w przedziale z treści.',
      r`Równania bardziej złożone sprowadzasz do prostych: wyłączasz wspólny czynnik (iloczyn równy zeru), podstawiasz $t = \sin x$ (równanie kwadratowe z warunkiem $t \in \langle -1, 1 \rangle$) albo używasz wzorów, żeby mieć jedną funkcję jednego kąta.`,
    ],
    method: [
      r`Sprowadź równanie do prostej postaci $\sin x = a$, $\cos x = a$ lub $\mathrm{tg}\,x = a$ (wzory, wyłączanie, podstawienie).`,
      'Znajdź kąt odniesienia z tabelki i wszystkie rozwiązania w jednym okresie.',
      r`Dopisz okres ($+ k \cdot 360^\circ$ albo $+ 2k\pi$) lub wybierz rozwiązania z przedziału z treści.`,
      r`Przy podstawieniu $t = \sin x$ odrzuć wartości $t$ spoza $\langle -1, 1 \rangle$.`,
    ],
    check: {
      question: r`Ile rozwiązań ma równanie $\sin x = 2$?`,
      answer: r`Żadnego — sinus przyjmuje tylko wartości z przedziału $\langle -1, 1 \rangle$.`,
    },
  },
};

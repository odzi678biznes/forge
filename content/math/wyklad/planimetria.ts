import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: planimetria. */
export const WYKLAD_PLANIMETRIA: Record<string, LessonExplanation> = {
  'plan-angles': {
    idea: [
      r`Suma kątów w trójkącie to $180^\circ$. Możesz to zobaczyć, odrywając trzy rogi papierowego trójkąta i przykładając je do siebie — ułożą się w kąt półpełny, czyli prostą linię. Dowód prowadzi przez prostą równoległą do boku, poprowadzoną przez przeciwległy wierzchołek.`,
      'Prosta przecinająca dwie równoległe tworzy przy nich dwa jednakowe „skrzyżowania”. Dlatego kąty w tym samym miejscu skrzyżowania (odpowiadające) są równe, naprzemianległe też — i to one najczęściej przenoszą informację z jednej części rysunku do drugiej.',
      r`Wielokąt o $n$ bokach da się pociąć przekątnymi z jednego wierzchołka na $n - 2$ trójkąty. Stąd suma jego kątów to $(n - 2) \cdot 180^\circ$, a w wielokącie foremnym każdy kąt to ta suma podzielona przez $n$.`,
    ],
    method: [
      'Zaznacz na rysunku wszystkie znane kąty.',
      r`Szukaj par: kąty przyległe (razem $180^\circ$), wierzchołkowe (równe), przy równoległych (odpowiadające i naprzemianległe równe).`,
      r`W każdym trójkącie dopełnij do $180^\circ$; kąt zewnętrzny to suma dwóch niesąsiednich kątów wewnętrznych.`,
      r`W wielokącie użyj sumy $(n - 2) \cdot 180^\circ$.`,
    ],
    check: {
      question: 'Ile wynosi suma kątów wewnętrznych sześciokąta?',
      answer: r`$(6 - 2) \cdot 180^\circ = 720^\circ$ — da się go podzielić na $4$ trójkąty.`,
    },
  },
  'plan-triangles': {
    idea: [
      r`Twierdzenie Pitagorasa mówi, że kwadrat zbudowany na przeciwprostokątnej ma takie samo pole jak dwa kwadraty zbudowane na przyprostokątnych razem: $a^2 + b^2 = c^2$. Działa tylko w trójkącie prostokątnym — i działa w obie strony: jeśli boki spełniają tę równość, trójkąt jest prostokątny.`,
      r`Dwa trójkąty szczególne to połowy znanych figur. Przekątna kwadratu o boku $a$ tnie go na dwa trójkąty o kątach $45^\circ$, $45^\circ$, $90^\circ$, a sama ma długość $a\sqrt2$. Wysokość trójkąta równobocznego o boku $a$ tnie go na dwa trójkąty o kątach $30^\circ$, $60^\circ$, $90^\circ$, a sama ma długość $\frac{a\sqrt3}{2}$.`,
      'W wielu zadaniach trójkąt prostokątny jest schowany: wysokość w trójkącie równoramiennym, przekątna prostokąta, promień do punktu styczności. Pierwszy ruch to go znaleźć i dorysować.',
    ],
    method: [
      'Znajdź albo dorysuj trójkąt prostokątny: wysokość, przekątną, promień.',
      'Ustal, który bok jest przeciwprostokątną — leży naprzeciw kąta prostego.',
      r`Zastosuj $a^2 + b^2 = c^2$ albo proporcje trójkątów szczególnych.`,
      'Sprawdź sens wyniku: przeciwprostokątna musi być najdłuższa.',
    ],
    check: {
      question: r`Jaką długość ma przekątna kwadratu o boku $5$?`,
      answer: r`$5\sqrt2$ — z Pitagorasa $d^2 = 25 + 25 = 50$.`,
    },
  },
  'plan-similarity': {
    idea: [
      r`Figury podobne to ten sam kształt w różnej skali — jak zdjęcie i jego powiększenie. W powiększeniu $k$ razy każda długość rośnie $k$ razy: boki, wysokości, obwód, promienie.`,
      r`Pole rośnie szybciej, bo ma dwa wymiary: kwadrat $2$ razy dłuższy ma $4$ razy większe pole — mieszczą się w nim $2 \cdot 2$ małe kwadraty. Dlatego pola figur podobnych mają się jak $k^2$, a objętości brył — jak $k^3$.`,
      r`Trójkąty rozpoznajesz jako podobne po kątach: wystarczą dwa równe kąty, bo trzeci i tak dopełnia się do $180^\circ$. Prosta równoległa do boku zawsze odcina trójkąt podobny do całego — na tym opiera się twierdzenie Talesa i zadania z cieniem.`,
    ],
    method: [
      'Znajdź dwa trójkąty podobne: wspólny kąt, kąty przy równoległych, kąty proste.',
      'Wypisz pary odpowiadających boków — leżących naprzeciw równych kątów.',
      r`Wyznacz skalę $k$ z jednej znanej pary i ułóż proporcję dla szukanego boku.`,
      r`Pola przeliczaj przez $k^2$, objętości przez $k^3$.`,
    ],
    check: {
      question: r`Trójkąty podobne mają obwody $10$ i $30$. Ile razy większe pole ma większy trójkąt?`,
      answer: r`Skala $k = 3$, więc pole jest $3^2 = 9$ razy większe.`,
    },
  },
  'plan-quadrilaterals': {
    idea: [
      r`Każdy czworokąt przekątną dzieli się na dwa trójkąty, więc wszystko, co umiesz o trójkątach, działa i tu. Wzór na pole trapezu $\frac{(a + b)h}{2}$ to dwa trójkąty o wysokości $h$ i podstawach $a$ oraz $b$.`,
      'Czworokąty tworzą rodzinę: kwadrat jest jednocześnie prostokątem i rombem, a każdy z nich jest równoległobokiem. Im wyżej w rodzinie, tym więcej własności — kwadrat ma wszystkie własności przekątnych naraz.',
      r`Romb o przekątnych $e$ i $f$ składa się z czterech jednakowych trójkątów prostokątnych o przyprostokątnych $\frac{e}{2}$ i $\frac{f}{2}$. Stąd pole $\frac{ef}{2}$, a bok — z Pitagorasa.`,
    ],
    method: [
      'Rozpoznaj rodzaj czworokąta i wypisz jego własności: boki, kąty, przekątne.',
      'Podziel go na trójkąty: wysokość w trapezie, przekątne w rombie.',
      'Policz brakujące długości z Pitagorasa albo trygonometrii.',
      'Zastosuj właściwy wzór na pole.',
    ],
    check: {
      question: r`Romb ma przekątne $10$ i $24$. Jaką długość ma jego bok?`,
      answer: r`Połowy przekątnych to $5$ i $12$, więc bok $= \sqrt{25 + 144} = 13$.`,
    },
  },
  'plan-circle': {
    idea: [
      'Kąt środkowy ma wierzchołek w środku okręgu, a wpisany — na okręgu. Oparte na tym samym łuku, wpisany jest zawsze połową środkowego. Dlaczego? Promienie tworzą trójkąty równoramienne, a kąt zewnętrzny trójkąta to suma dwóch równych kątów wewnętrznych.',
      r`Stąd wniosek, który rozwiązuje mnóstwo zadań: kąt wpisany oparty na średnicy jest prosty, bo odpowiadający mu kąt środkowy ma $180^\circ$.`,
      'Styczna dotyka okręgu w jednym punkcie i jest prostopadła do promienia w tym punkcie. Promień, odcinek stycznej i odcinek do środka tworzą więc trójkąt prostokątny — i znów działa Pitagoras.',
    ],
    method: [
      'Zaznacz środek okręgu i dorysuj promienie do ważnych punktów.',
      'Kąty: wpisany to połowa środkowego opartego na tym samym łuku; kąty wpisane oparte na tym samym łuku są równe.',
      'Styczna: dorysuj promień do punktu styczności — powstaje kąt prosty.',
      r`Łuk i wycinek: taka część obwodu albo pola koła, jaką częścią $360^\circ$ jest kąt środkowy.`,
    ],
    check: {
      question: r`Kąt środkowy ma $100^\circ$. Ile ma kąt wpisany oparty na tym samym łuku?`,
      answer: r`$50^\circ$ — połowę kąta środkowego.`,
    },
  },
  'plan-inscribed': {
    idea: [
      'Środek okręgu wpisanego jest jednakowo oddalony od wszystkich boków — dlatego leży na przecięciu dwusiecznych kątów. Środek okręgu opisanego jest jednakowo oddalony od wszystkich wierzchołków — leży na przecięciu symetralnych boków.',
      r`Wzór $P = r \cdot p$ ($p$ to połowa obwodu) bierze się z podziału trójkąta na trzy mniejsze, każdy z wierzchołkiem w środku okręgu wpisanego i wysokością $r$. Ich pola to $\frac12 ar$, $\frac12 br$ i $\frac12 cr$ — razem $r \cdot \frac{a + b + c}{2}$.`,
      r`Czworokąt ma okrąg wpisany, gdy sumy przeciwległych boków są równe, a opisany — gdy przeciwległe kąty sumują się do $180^\circ$. W trójkącie prostokątnym środek okręgu opisanego leży w połowie przeciwprostokątnej.`,
    ],
    method: [
      'Ustal, czy chodzi o okrąg wpisany (styka się z bokami), czy opisany (przechodzi przez wierzchołki).',
      r`Trójkąt: $r = \frac{P}{p}$, $R = \frac{abc}{4P}$; w prostokątnym $R$ to połowa przeciwprostokątnej, a $r = \frac{a + b - c}{2}$.`,
      'Czworokąt: sprawdź warunek na boki (okrąg wpisany) albo na kąty (okrąg opisany).',
      'Dorysuj promienie do punktów styczności i wierzchołków i szukaj trójkątów prostokątnych.',
    ],
    check: {
      question: r`Jaki promień ma okrąg opisany na trójkącie prostokątnym o przyprostokątnych $6$ i $8$?`,
      answer: r`Przeciwprostokątna ma $10$, a środek okręgu opisanego leży w jej połowie, więc $R = 5$.`,
    },
  },
  'plan-proofs': {
    idea: [
      'Dowód geometryczny to łańcuch: od tego, co wiesz z treści, do tego, co masz wykazać. Każde ogniwo musi mieć uzasadnienie — własność figury, twierdzenie albo cechę przystawania czy podobieństwa. „Tak widać na rysunku” nie jest uzasadnieniem.',
      'Najczęściej prowadzi się go przez trójkąty: pokazujesz, że dwa trójkąty są przystające (wtedy odpowiednie boki i kąty są równe) albo podobne (wtedy boki są proporcjonalne). Pierwszy ruch to znaleźć na rysunku właściwą parę trójkątów.',
      'Pomaga praca od końca: zapytaj, co musiałoby być prawdą, żeby teza zachodziła. Jeśli trzeba wykazać równość odcinków, szukasz trójkątów, w których są one odpowiadającymi bokami.',
    ],
    method: [
      'Zapisz założenia i tezę; oznacz na rysunku wszystko, co wiesz.',
      'Znajdź trójkąty, w których leżą odcinki albo kąty z tezy.',
      'Wykaż ich przystawanie (bbb, bkb, kbk) albo podobieństwo (kkk), uzasadniając każdą równość.',
      'Z przystawania albo podobieństwa wyprowadź wniosek i zapisz go słowami jako tezę.',
    ],
    check: {
      question: 'Jaką cechą wykażesz podobieństwo dwóch trójkątów, które mają dwa równe kąty?',
      answer: r`Cechą kąt–kąt–kąt (kkk): trzecie kąty też są równe, bo w każdym trójkącie kąty sumują się do $180^\circ$.`,
    },
  },
};

import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: stereometria. */
export const WYKLAD_STEREOMETRIA: Record<string, LessonExplanation> = {
  'stereo-prisms': {
    idea: [
      r`Graniastosłup to płaska figura „z grubością”: podstawa przesunięta w górę o wysokość $H$. Dlatego objętość to pole podstawy razy wysokość — jak stos jednakowych kartek, z których każda ma kształt podstawy.`,
      'Powierzchnię możesz rozłożyć na płasko w siatkę: dwie podstawy i prostokąty ścian bocznych. Ściany boczne razem tworzą jeden długi prostokąt o bokach „obwód podstawy” i „wysokość”.',
      r`Przekątna bryły jest przeciwprostokątną trójkąta prostokątnego, którego przyprostokątne to przekątna podstawy i wysokość. W prostopadłościanie daje to wzór $d = \sqrt{a^2 + b^2 + c^2}$ — Pitagoras użyty dwa razy.`,
    ],
    method: [
      'Narysuj bryłę i wypisz wymiary podstawy oraz wysokość.',
      r`Objętość: $V = P_p \cdot H$.`,
      r`Pole całkowite: $P_c = 2P_p + \text{obwód podstawy} \cdot H$ (dla graniastosłupa prostego).`,
      'Przekątne: znajdź trójkąt prostokątny z przekątną podstawy i wysokością.',
    ],
    check: {
      question: r`Jaką objętość ma sześcian o krawędzi $3$ i jaką długość ma jego przekątna?`,
      answer: r`$V = 27$, a przekątna ma długość $3\sqrt3$, bo $d^2 = 9 + 9 + 9 = 27$.`,
    },
  },
  'stereo-pyramids': {
    idea: [
      r`Ostrosłup to podstawa zbiegająca się do jednego punktu — wierzchołka. Jego objętość to jedna trzecia objętości graniastosłupa o tej samej podstawie i wysokości: sześcian da się pociąć na trzy jednakowe ostrosłupy o wspólnym wierzchołku w jednym narożniku.`,
      r`Ostrosłup prawidłowy ma w podstawie wielokąt foremny, a wierzchołek dokładnie nad jego środkiem. Dzięki tej symetrii w środku bryły kryją się trójkąty prostokątne z wysokością $H$ — i to one rozwiązują prawie każde zadanie.`,
      r`Trzeba odróżnić dwie wysokości: wysokość ostrosłupa $H$ (pionowo, od wierzchołka do podstawy) i wysokość ściany bocznej $h$ (skośnie, po ścianie do środka krawędzi podstawy). Do objętości zawsze bierzesz $H$, do pola ścian — $h$.`,
    ],
    method: [
      r`Narysuj wysokość $H$ i zaznacz środek podstawy $O$.`,
      r`Wybierz trójkąt prostokątny: $H$ i połowa krawędzi podstawy dają wysokość ściany $h$; $H$ i połowa przekątnej podstawy dają krawędź boczną.`,
      r`Objętość: $V = \frac13 P_p \cdot H$.`,
      r`Pole powierzchni bocznej: suma pól trójkątów ścian, każda $\frac12 \cdot a \cdot h$.`,
    ],
    check: {
      question: r`Ostrosłup ma pole podstawy $36$ i wysokość $5$. Ile wynosi jego objętość?`,
      answer: r`$\frac13 \cdot 36 \cdot 5 = 60$.`,
    },
  },
  'stereo-angles': {
    idea: [
      'Kąt między odcinkiem a płaszczyzną mierzysz jak nachylenie drabiny do podłogi: między drabiną a jej „cieniem” na podłodze, gdy słońce świeci pionowo z góry. Ten cień to rzut odcinka na płaszczyznę.',
      'Kąt między ścianą a podstawą mierzysz jak nachylenie dachu: w płaszczyźnie prostopadłej do krawędzi, w której ściana styka się z podstawą. Dlatego w ostrosłupie prawidłowym bierzesz odcinek od środka podstawy do środka krawędzi i wysokość ściany — oba są prostopadłe do tej krawędzi.',
      'W każdym przypadku szukany kąt leży w trójkącie prostokątnym, którego jednym bokiem jest wysokość bryły. Znalezienie tego trójkąta to połowa zadania — resztę załatwia trygonometria.',
    ],
    method: [
      'Ustal, o jaki kąt chodzi: odcinek z płaszczyzną czy ściana z płaszczyzną.',
      'Odcinek: wyznacz jego rzut na płaszczyznę (spodek wysokości); kąt leży między odcinkiem a rzutem.',
      'Ściana: poprowadź w ścianie i w podstawie odcinki prostopadłe do wspólnej krawędzi; kąt leży między nimi.',
      'Znajdź trójkąt prostokątny z tym kątem i użyj sinusa, cosinusa albo tangensa.',
    ],
    check: {
      question: r`W ostrosłupie prawidłowym czworokątnym $H = 4$, a krawędź podstawy ma długość $6$. Ile wynosi tangens kąta nachylenia ściany bocznej do podstawy?`,
      answer: r`Odcinek od środka podstawy do środka krawędzi ma długość $3$, więc $\mathrm{tg}\,\alpha = \frac43$.`,
    },
  },
  'stereo-solids': {
    idea: [
      'Walec, stożek i kula to bryły obrotowe: powstają przez obrót prostokąta, trójkąta prostokątnego i półkola wokół osi. Dlatego każde zadanie da się sprowadzić do płaskiego przekroju przez oś — prostokąta, trójkąta albo koła.',
      r`Walec to graniastosłup z kołem w podstawie, więc $V = \pi r^2 H$. Stożek to ostrosłup z kołem w podstawie, więc $V = \frac13 \pi r^2 H$ — ta sama jedna trzecia.`,
      r`Tworząca stożka $l$ to przeciwprostokątna trójkąta o przyprostokątnych $r$ i $H$. Powierzchnia boczna stożka po rozcięciu to wycinek koła o promieniu $l$, stąd $P_b = \pi r l$.`,
    ],
    method: [
      'Narysuj przekrój osiowy i zaznacz promień, wysokość i tworzącą.',
      r`Brakujący wymiar policz z Pitagorasa (w stożku $l^2 = r^2 + H^2$).`,
      r`Zastosuj wzory: walec $V = \pi r^2 H$, stożek $V = \frac13\pi r^2 H$, kula $V = \frac43\pi r^3$ i $P = 4\pi r^2$.`,
      'Przy przetapianiu jednej bryły w drugą przyrównaj objętości.',
    ],
    check: {
      question: r`Stożek ma promień $6$ i wysokość $8$. Jaką długość ma jego tworząca?`,
      answer: r`$\sqrt{36 + 64} = 10$.`,
    },
  },
  'stereo-advanced': {
    idea: [
      'Przekrój bryły płaszczyzną to cięcie nożem: płaszczyzna przecina ściany wzdłuż odcinków, które razem tworzą wielokąt. Szukasz punktów, w których płaszczyzna przecina krawędzie, i łączysz je odcinkami leżącymi na ścianach.',
      'Bryły wpisane i opisane rozwiązuje się na przekroju, na którym widać obie naraz. Kula wpisana w stożek to na przekroju osiowym okrąg wpisany w trójkąt równoramienny — i znowu działają wzory z planimetrii.',
      'Przekrój sześcianu płaszczyzną przez trzy wierzchołki sąsiednie z jednym wierzchołkiem to trójkąt równoboczny, bo jego boki są przekątnymi trzech jednakowych ścian. Dostrzeganie takich symetrii oszczędza rachunki.',
    ],
    method: [
      'Zaznacz punkty, przez które przechodzi płaszczyzna, i upewnij się, że leżą w jednej płaszczyźnie.',
      'Znajdź punkty przecięcia płaszczyzny z krawędziami i połącz je odcinkami na ścianach.',
      'Rozpoznaj kształt przekroju i policz jego boki (Pitagoras, przekątne ścian).',
      'Bryły wpisane: przejdź do przekroju osiowego i użyj wzorów planimetrii.',
    ],
    check: {
      question: r`Sześcian ma krawędź $2$. Jaką długość mają boki trójkąta w przekroju przez trzy wierzchołki sąsiednie z jednym wierzchołkiem?`,
      answer: r`To przekątne ścian: każdy bok ma długość $2\sqrt2$.`,
    },
  },
};

import type { LessonExplanation } from '@/data/types';

/** Wykład: zarządzanie przedsiębiorstwem i zarządzanie projektami. */
export const WYKLAD_ZARZADZANIE: Record<string, LessonExplanation> = {
  'biz-management-functions': {
    idea: [
      'Każdy kierownik — od lidera zmiany w sklepie po prezesa — robi te same cztery rzeczy w kółko. Planuje (co chcemy osiągnąć i jak), organizuje (kto co robi i czym), przewodzi i motywuje (żeby ludzie chcieli to robić) oraz kontroluje (czy wyszło zgodnie z planem). Kontrola zamyka cykl i daje materiał do kolejnego planu.',
      'Struktura organizacyjna odpowiada na pytanie „kto komu podlega”. W liniowej każdy ma jednego szefa — prosto i jasno, dobrze dla małych firm. W funkcjonalnej polecenia wydają specjaliści od różnych dziedzin, a w macierzowej pracownik ma dwóch przełożonych (działowego i projektowego) — jest elastycznie, ale łatwo o konflikt.',
      'Styl kierowania dobiera się do ludzi i sytuacji. Autokrata decyduje sam — szybko, przydatne w kryzysie, ale na dłuższą metę demotywuje. Demokrata konsultuje decyzje z zespołem. Styl liberalny daje dużą swobodę — dobrze działa w zespole doświadczonych ekspertów, źle wśród nowicjuszy.',
    ],
    method: [
      'W opisie działania kierownika znajdź czasownik: planuje, organizuje, motywuje czy kontroluje.',
      'Strukturę rozpoznaj po liczbie przełożonych i drodze poleceń.',
      'Styl kierowania rozpoznaj po tym, kto podejmuje decyzję: szef sam, szef z zespołem czy zespół.',
      'Liczebność firmy: zsumuj osoby na każdym szczeblu, łącznie z samym szefem.',
    ],
    check: {
      question: 'Kierownik dzieli zadania między pracowników i przydziela im sprzęt. Jaką funkcję zarządzania pełni?',
      answer: 'Organizowanie — ustala podział pracy i zasobów.',
    },
  },
  'biz-hr': {
    idea: [
      'Zarządzanie zasobami ludzkimi towarzyszy pracownikowi przez całą drogę w firmie: opis stanowiska, rekrutacja, wdrożenie, motywowanie, ocena, rozwój, a w końcu odejście. Rekrutacja wewnętrzna (awans kogoś z firmy) jest tańsza i motywuje innych, zewnętrzna wnosi świeże spojrzenie i nowe umiejętności.',
      'Pieniądze są ważne, ale nie wystarczają. Według Herzberga płaca i warunki pracy usuwają niezadowolenie, a prawdziwe zaangażowanie budują ciekawe zadania, uznanie i szansa rozwoju. Według Maslowa najpierw trzeba zaspokoić potrzeby podstawowe (bezpieczeństwo, stabilna płaca), zanim zadziałają wyższe (uznanie, samorealizacja).',
      'Ocena pracownicza nie służy karaniu, tylko rozmowie o tym, co działa i co poprawić. W ocenie 360 stopni opinię wydają przełożony, współpracownicy, podwładni, a czasem klienci — dzięki temu obraz jest pełniejszy niż z samej opinii szefa.',
    ],
    method: [
      'Rekrutacja: kandydat spoza firmy — zewnętrzna; awans lub przeniesienie — wewnętrzna.',
      'Motywator zaklasyfikuj: płacowy (pensja, premia), pozapłacowy materialny (samochód, pakiet medyczny) albo niematerialny (pochwała, rozwój, elastyczny czas).',
      'Przy teorii Maslowa ustal, która potrzeba nie jest zaspokojona.',
      'Ocenę 360 stopni rozpoznasz po wielu źródłach opinii.',
    ],
    check: {
      question: 'Do jakiej grupy motywatorów należy pochwała przełożonego na zebraniu zespołu?',
      answer: 'Do pozapłacowych niematerialnych.',
    },
  },
  'biz-operations-marketing': {
    idea: [
      'Zarządzanie operacyjne dba, żeby produkt powstał sprawnie, tanio i bezpiecznie. Lean usuwa marnotrawstwo (czekanie, zbędne zapasy, poprawki), kaizen to ciągłe drobne usprawnienia zgłaszane przez samych pracowników, a just in time oznacza dostawy dokładnie wtedy, gdy są potrzebne. BHP to nie formalność — wypadek kosztuje zdrowie ludzi i pieniądze firmy.',
      'Marketing mix 4P to cztery decyzje: produkt (co sprzedajemy), cena, dystrybucja (gdzie i jak klient kupi) i promocja (jak się o nim dowie). Strategia penetracji wchodzi na rynek z niską ceną, żeby szybko zdobyć klientów; strategia zbierania śmietanki — z wysoką ceną dla entuzjastów, którą potem obniża.',
      'Cenę liczy się warstwami: koszt, do niego narzut (zysk sprzedawcy), a na końcu VAT. Narzut liczy się od kosztu, a marżę procentową — od ceny, dlatego narzut 25% daje marżę tylko 20% ceny. Produkt przechodzi cykl życia: wprowadzenie, wzrost, dojrzałość (najwyższa sprzedaż), spadek.',
    ],
    method: [
      'Cena netto = koszt · (1 + narzut).',
      'Cena brutto = cena netto · (1 + VAT).',
      'Marża procentowa = (cena netto − koszt) : cena netto · 100%.',
      'Działanie marketingowe przypisz do jednego z 4P; fazę cyklu życia rozpoznaj po sprzedaży i konkurencji.',
    ],
    check: {
      question: 'Koszt wytworzenia to 60 zł, narzut 50%, VAT 23%. Ile wynosi cena brutto?',
      answer: '60 · 1,5 = 90 zł netto; 90 · 1,23 = 110,70 zł brutto.',
    },
  },
  'biz-csr': {
    idea: [
      'Etyka biznesu pyta, jak firma zarabia: uczciwie czy kosztem innych. Nieetyczne są korupcja, wprowadzanie klientów w błąd, zmowy cenowe, łamanie praw pracowników i zatruwanie środowiska. Prosty test: czy byłbyś spokojny, gdyby twoja decyzja trafiła na pierwszą stronę gazety?',
      'Społeczna odpowiedzialność biznesu (CSR) to dobrowolne branie pod uwagę interesów wszystkich interesariuszy — pracowników, klientów, dostawców, mieszkańców, środowiska — a nie tylko właścicieli. To stały sposób działania firmy, a nie pojedyncza akcja.',
      'Dlatego jednorazowy datek na schronisko przy jednoczesnym łamaniu praw pracowników to działanie wizerunkowe, a nie CSR. Podobnie greenwashing: zielona etykieta i hasło „eko” bez żadnej zmiany w produkcji to wprowadzanie klientów w błąd.',
    ],
    method: [
      'Wypisz interesariuszy, na których wpływa decyzja firmy.',
      'Sprawdź, czy któryś z nich traci przez nieuczciwość: oszustwo, zmowę, łamanie praw, szkodę dla środowiska.',
      'Odróżnij trwałą praktykę (CSR) od jednorazowej akcji wizerunkowej.',
      'Zastosuj test gazety.',
    ],
    check: {
      question: 'Firma przekazała datek na schronisko, ale od miesięcy nie płaci pracownikom za nadgodziny. Czy to przykład CSR?',
      answer: 'Nie — to działanie wizerunkowe. CSR wymaga odpowiedzialności wobec wszystkich interesariuszy, także własnych pracowników.',
    },
  },
  'biz-project-basics': {
    idea: [
      'Projekt to jednorazowe przedsięwzięcie z celem, początkiem i końcem oraz ograniczonym budżetem — jak studniówka, wdrożenie aplikacji albo budowa mostu. Proces to działanie powtarzalne bez końca, jak comiesięczne wystawianie faktur. Pytanie rozstrzygające: czy to się kiedyś kończy jednorazowym efektem?',
      'Każdy projekt przechodzi przez cykl życia: inicjowanie (po co?), planowanie (co, kiedy, za ile?), realizację, kontrolę i zamknięcie z wnioskami na przyszłość. Kamienie milowe to ważne zdarzenia w tym cyklu — punkty w czasie, np. „podpisanie umowy z salą” — a nie zadania trwające tygodniami.',
      'Podejście kaskadowe planuje wszystko na początku i idzie etap po etapie — dobre, gdy wymagania są znane i stabilne, jak przy budowie. Podejście zwinne (agile) dzieli pracę na krótkie cykle i po każdym pokazuje efekt klientowi — dobre, gdy klient sam jeszcze nie wie, czego dokładnie chce.',
    ],
    method: [
      'Sprawdź cechy projektu: jednorazowość, cel, termin, budżet, niepewność.',
      'Przypisz działanie do fazy cyklu życia.',
      'Rozpoznaj interesariuszy: sponsor (finansuje), kierownik projektu, zespół, odbiorcy i inni, na których projekt wpływa.',
      'Dobierz podejście: stabilne wymagania — kaskadowe, zmienne — zwinne.',
    ],
    check: {
      question: '„Podpisanie umowy z salą na studniówkę” — to zadanie czy kamień milowy?',
      answer: 'Kamień milowy — to zdarzenie w konkretnym punkcie czasu, które zamyka ważny etap.',
    },
  },
  'biz-project-planning': {
    idea: [
      'Plan projektu zaczyna się od rozbicia całości na coraz mniejsze kawałki (WBS), aż każdy da się oszacować i przypisać konkretnej osobie. Potem zadania układa się w czasie na harmonogramie — najczęściej na wykresie Gantta, gdzie każde zadanie to pasek na osi czasu.',
      'Część zadań musi czekać na inne, a część może iść równolegle. Najdłuższy łańcuch zależnych zadań to ścieżka krytyczna — wyznacza najkrótszy możliwy czas całego projektu. Każdy dzień opóźnienia na niej to dzień opóźnienia całości; zadania spoza ścieżki mają zapas.',
      'Zakres, czas i koszt tworzą trójkąt ograniczeń: nie da się zmienić jednego boku, nie ruszając pozostałych. Dorzucenie nowych funkcji bez przesunięcia terminu albo zwiększenia budżetu to prosta droga do porażki — dlatego zmiany w projekcie wprowadza się świadomie, za zgodą sponsora.',
    ],
    method: [
      'Wypisz zadania, ich czas trwania i zależności (co musi być skończone wcześniej).',
      'Dla każdego zadania policz najwcześniejszy koniec: start = najpóźniejszy koniec poprzedników.',
      'Czas projektu = najpóźniejszy koniec; ścieżka krytyczna to łańcuch zadań bez zapasu.',
      'Przekroczenie budżetu w procentach = (koszt rzeczywisty − budżet) : budżet · 100%.',
    ],
    check: {
      question: 'Zadania: A (2 dni), B (4 dni, po A), C (3 dni, po A), D (1 dzień, po B i C). Ile trwa projekt i które zadania są na ścieżce krytycznej?',
      answer: '7 dni: A, B, D (2 + 4 + 1). Zadanie C ma 1 dzień zapasu.',
    },
  },
  'biz-teamwork-creativity': {
    idea: [
      'Zespół to nie tylko grupa ludzi w jednym pokoju, ale wspólny cel, podział ról i zaufanie. Psują go niejasne cele, słaba komunikacja, dominacja jednej osoby i „próżniactwo społeczne” — gdy część osób liczy, że inni zrobią robotę za nich. Pomagają jasne role, jawny podział zadań i regularne, krótkie spotkania.',
      'Kreatywność da się ćwiczyć technikami. W burzy mózgów najpierw liczy się ilość pomysłów i obowiązuje zakaz krytyki — ocena przychodzi dopiero później, bo słaby pomysł bywa punktem wyjścia do dobrego. Sześć kapeluszy de Bono każe patrzeć na problem kolejno z sześciu stron: faktów, emocji, ryzyk, korzyści, nowych pomysłów i organizacji myślenia.',
      'Design thinking zaczyna się od ludzi, a nie od gotowego rozwiązania: empatia (zrozumienie użytkowników), zdefiniowanie problemu, generowanie pomysłów, prototyp i test z użytkownikami. Po teście często wraca się do wcześniejszych etapów — to pętla, a nie prosta droga.',
    ],
    method: [
      'Barierę pracy zespołowej nazwij i dobierz na nią sposób: role, komunikacja, podział zadań.',
      'Technikę kreatywności rozpoznaj po zasadach: ilość i brak krytyki (burza mózgów), gałęzie wokół tematu (mapa myśli), zmiana perspektyw (kapelusze).',
      'Etap design thinking rozpoznaj po czynności: rozmowy z użytkownikami (empatia), sformułowanie problemu, pomysły, prototyp, test.',
    ],
    check: {
      question: 'Zespół zaczyna prace nad aplikacją od zbudowania prototypu. Co pominął według design thinking?',
      answer: 'Empatię i zdefiniowanie problemu — najpierw trzeba zrozumieć użytkowników i ich potrzeby.',
    },
  },
};

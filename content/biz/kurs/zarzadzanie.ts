import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, text, tip, warn } from '../../authoring';

/**
 * Biznes i zarządzanie, dział 6: zarządzanie przedsiębiorstwem.
 *
 * Podstawa programowa 2024: ZP VI.1, VI.9; ZR V.13–V.15, V.17–V.19, V.22.
 */

export const MGMT_TOPIC: Topic = {
  id: 'biz-mgmt-topic',
  subjectId: 'biz',
  name: 'Zarządzanie przedsiębiorstwem',
  summary: 'Funkcje zarządzania i struktury organizacyjne, przywództwo, zarządzanie zasobami ludzkimi i motywowanie, procesy i marketing mix, etyka biznesu i CSR.',
};

export const MGMT_SKILLS: Skill[] = [
  {
    id: 'biz-management-functions',
    topicId: 'biz-mgmt-topic',
    name: 'Funkcje zarządzania, struktura i przywództwo',
    level: 'PR',
    ckeRequirement: 'Cele i funkcje zarządzania, struktura organizacyjna i przepływ informacji, cechy i funkcje przywódcy (ZP VI.1; ZR V.13, V.17)',
    prerequisites: ['biz-business-model'],
    examValue: 0.8,
  },
  {
    id: 'biz-hr',
    topicId: 'biz-mgmt-topic',
    name: 'Zarządzanie zasobami ludzkimi i motywowanie',
    level: 'PR',
    ckeRequirement: 'Opis stanowiska, rekrutacja i selekcja, zasady wynagradzania, motywowanie i ocena pracowników (ZR V.14, V.15)',
    prerequisites: ['biz-management-functions', 'biz-career'],
    examValue: 0.75,
  },
  {
    id: 'biz-operations-marketing',
    topicId: 'biz-mgmt-topic',
    name: 'Procesy, BHP i marketing',
    level: 'PR',
    ckeRequirement: 'Zarządzanie operacyjne i procesy z uwzględnieniem BHP, instrumenty marketingowe (ZR V.18, V.19)',
    prerequisites: ['biz-management-functions', 'biz-profitability'],
    examValue: 0.85,
  },
  {
    id: 'biz-csr',
    topicId: 'biz-mgmt-topic',
    name: 'Etyka biznesu i społeczna odpowiedzialność',
    level: 'PR',
    ckeRequirement: 'Zachowania etyczne i nieetyczne w biznesie, korupcja, społeczna odpowiedzialność biznesu (ZP VI.9; ZR V.22)',
    prerequisites: ['biz-management-functions'],
    examValue: 0.65,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const MGMT_LESSONS: Lesson[] = [
  {
    skillId: 'biz-management-functions',
    minutes: 15,
    intro:
      'Zarządzanie to osiąganie celów firmy rękami i głowami innych ludzi. Każdy kierownik — od lidera zmiany w sklepie po prezesa — wykonuje te same cztery funkcje, tylko w innej skali.',
    blocks: [
      p('Funkcje zarządzania: planowanie (cele i sposoby ich osiągnięcia), organizowanie (podział zadań, zasoby, struktura), przewodzenie i motywowanie (wpływanie na ludzi), kontrolowanie (porównanie wyników z planem i korekta).'),
      p('Struktury organizacyjne: liniowa (każdy ma jednego przełożonego — prosta, dobra dla małych firm), funkcjonalna (specjaliści wydają polecenia w swoich dziedzinach), liniowo-sztabowa (kierownicy liniowi + doradcy w sztabie, np. prawnik), dywizjonalna (samodzielne działy według produktów lub regionów), macierzowa (pracownik ma przełożonego działu i kierownika projektu). Rozpiętość kierowania to liczba osób bezpośrednio podległych jednemu kierownikowi.'),
      p('Style kierowania: autokratyczny (szef decyduje sam — szybko, ale demotywuje), demokratyczny (konsultacje z zespołem), liberalny (duża swoboda zespołu — dobry dla ekspertów). Przywódca (lider) wyznacza kierunek, inspiruje i buduje zaufanie — skuteczność zależy od dopasowania stylu do sytuacji i zespołu.'),
      tip('Kontrolowanie zamyka cykl zarządzania: bez porównania wyników z planem nie wiadomo, czy plan działa.'),
      warn('Macierzowa struktura daje elastyczność, ale grozi konfliktem: pracownik ma dwóch szefów.'),
    ],
    examples: [
      example(
        'Kierowniczka porównuje miesięczną sprzedaż z planem i zleca działania naprawcze. Jaką funkcję pełni?',
        [['Porównanie wyników z celem i korekta.', 'ostatni etap cyklu'], 'To kontrolowanie.'],
        'kontrolowanie',
      ),
      example(
        'Firma ma prezesa, 4 kierowników, a każdy kierownik ma 6 podwładnych. Ilu ma pracowników łącznie?',
        ['1 + 4 + 4 · 6.', '= 29 osób.'],
        '29',
      ),
    ],
    pitfalls: ['Mylenie organizowania z planowaniem.', 'Uznanie jednego stylu kierowania za zawsze najlepszy.', 'Pomijanie kierowników przy liczeniu pracowników struktury.'],
  },
  {
    skillId: 'biz-hr',
    minutes: 14,
    intro:
      'Ludzie to najważniejszy zasób wielu firm. Zarządzanie zasobami ludzkimi obejmuje całą drogę pracownika: od opisu stanowiska i rekrutacji, przez motywowanie i ocenę, po rozwój i odejście.',
    blocks: [
      p('Opis stanowiska: cel, zadania, uprawnienia, wymagania (kwalifikacje i kompetencje). Rekrutacja wewnętrzna (spośród pracowników — tańsza, motywuje, zna firmę) i zewnętrzna (nowe pomysły, szerszy wybór). Selekcja: analiza dokumentów, testy, rozmowy, assessment center.'),
      p('Motywowanie: płacowe (wynagrodzenie, premie) i pozapłacowe — materialne (samochód, pakiet medyczny) i niematerialne (pochwała, rozwój, elastyczny czas pracy). Teoria Maslowa: potrzeby od fizjologicznych, przez bezpieczeństwo, przynależność, uznanie, po samorealizację. Teoria Herzberga: czynniki higieny (płaca, warunki) usuwają niezadowolenie, a motywatory (uznanie, odpowiedzialność, rozwój) budują zaangażowanie.'),
      p('Ocena pracownicza porównuje wyniki i zachowania z oczekiwaniami. Ocena 360 stopni zbiera opinie przełożonego, współpracowników, podwładnych i klientów. Ocena powinna prowadzić do rozwoju, a nie tylko do kar.'),
      tip('Podwyżka usuwa niezadowolenie, ale na dłuższą metę zaangażowanie budują ciekawe zadania, uznanie i szansa rozwoju (Herzberg).'),
      warn('Ocena 360 stopni to nie „ocena od szefa” — liczy się wiele źródeł opinii.'),
    ],
    examples: [
      example(
        'Firma obsadza stanowisko kierownika zmiany, awansując doświadczoną pracownicę. Jaki to rodzaj rekrutacji?',
        [['Kandydatka już pracuje w firmie.', 'źródło kandydatów wewnątrz'], 'To rekrutacja wewnętrzna.'],
        'wewnętrzna',
      ),
      example(
        'Do której grupy motywatorów należy możliwość prowadzenia ważnego projektu?',
        ['Daje odpowiedzialność i rozwój.', 'To pozapłacowy motywator niematerialny.'],
        'pozapłacowy, niematerialny',
      ),
    ],
    pitfalls: ['Mylenie rekrutacji (przyciąganie kandydatów) z selekcją (wybór).', 'Motywowanie wyłącznie pieniędzmi.', 'Ocena bez rozmowy o rozwoju.'],
  },
  {
    skillId: 'biz-operations-marketing',
    minutes: 16,
    intro:
      'Zarządzanie operacyjne dba o to, żeby produkt powstał sprawnie, tanio i bezpiecznie. Marketing — żeby klient chciał go kupić. Oba opierają się na tych samych liczbach: kosztach, cenie i jakości.',
    blocks: [
      p('Zasady dobrej organizacji procesów: eliminowanie marnotrawstwa (lean), ciągłe drobne usprawnienia (kaizen), dostawy „na czas” bez dużych zapasów (just in time), standaryzacja. Przepisy BHP (bezpieczeństwo i higiena pracy) wymagają m.in. szkoleń, oceny ryzyka zawodowego i środków ochrony — pracodawca odpowiada za bezpieczne warunki pracy.'),
      p('Marketing mix 4P: produkt (cechy, marka, opakowanie), cena (strategie: penetracji — niska na start, zbierania śmietanki — wysoka na start), dystrybucja (miejsce — kanały sprzedaży), promocja (reklama, promocja sprzedaży, public relations, sprzedaż osobista, marketing w mediach społecznościowych). Cykl życia produktu: wprowadzenie, wzrost, dojrzałość, schyłek.'),
      f('\\text{cena netto} = \\text{koszt} \\cdot (1 + \\text{narzut}) \\qquad \\text{cena brutto} = \\text{cena netto} \\cdot (1 + \\text{VAT})'),
      tip('Narzut liczy się od kosztu, a marżę procentową — od ceny: narzut 25% daje marżę 20% ceny.'),
      warn('W fazie dojrzałości sprzedaż jest najwyższa, ale rośnie konkurencja — to moment na odświeżenie produktu, a nie na spoczęcie na laurach.'),
    ],
    examples: [
      example(
        'Koszt wytworzenia wynosi 80 zł, narzut 25%, VAT 23%. Ile wynosi cena brutto?',
        [['Cena netto: 80 · 1,25 = 100 zł.', 'narzut od kosztu'], 'Brutto: 100 · 1,23 = 123 zł.'],
        '123 zł',
      ),
      example(
        'Nowa konsola wchodzi na rynek z wysoką ceną dla entuzjastów, która potem spada. Jak nazywa się ta strategia?',
        ['Wysoka cena na starcie, potem obniżki.', 'To strategia zbierania śmietanki.'],
        'zbierania śmietanki',
      ),
    ],
    pitfalls: ['Mylenie narzutu z marżą.', 'Liczenie VAT od kosztu zamiast od ceny netto.', 'Utożsamianie promocji z całym marketingiem.'],
  },
  {
    skillId: 'biz-csr',
    minutes: 11,
    intro:
      'Firma może zarabiać uczciwie albo kosztem innych. Etyka biznesu pyta, jak postępować wobec klientów, pracowników, konkurentów i otoczenia. Społeczna odpowiedzialność biznesu (CSR) to świadome uwzględnianie wpływu firmy na ludzi i środowisko.',
    blocks: [
      p('Nieetyczne praktyki: korupcja (łapówka za zamówienie), wprowadzanie klientów w błąd, zmowy cenowe, łamanie praw pracowników, zanieczyszczanie środowiska, greenwashing (udawanie ekologiczności). Korupcja jest przestępstwem — karana jest zarówno osoba przyjmująca, jak i dająca łapówkę.'),
      p('CSR obejmuje m.in.: uczciwe relacje z pracownikami i dostawcami, dbałość o środowisko (ograniczanie emisji, odpadów), zaangażowanie w lokalną społeczność, przejrzystość. Interesariusze firmy to wszyscy, na których wpływa jej działalność: właściciele, pracownicy, klienci, dostawcy, społeczność lokalna, państwo.'),
      tip('Test gazety: czy byłbyś spokojny, gdyby Twoja decyzja trafiła na pierwszą stronę gazety?'),
      warn('Jednorazowa akcja charytatywna przy jednoczesnym łamaniu praw pracowników to nie CSR, tylko działanie wizerunkowe.'),
    ],
    examples: [
      example(
        'Firma reklamuje butelki jako „ekologiczne”, bo mają zieloną etykietę, choć nie zmieniła niczego w produkcji. Jak nazywa się ta praktyka?',
        [['Udawanie działań proekologicznych.', 'marketing bez pokrycia'], 'To greenwashing.'],
        'greenwashing',
      ),
      example(
        'Kto należy do interesariuszy fabryki w małym mieście?',
        ['Wszyscy, na których wpływa jej działalność.', 'Pracownicy, mieszkańcy, dostawcy, klienci, władze lokalne.'],
        'm.in. pracownicy i mieszkańcy',
      ),
    ],
    pitfalls: ['Utożsamianie CSR z samą filantropią.', 'Przekonanie, że dający łapówkę nie odpowiada karnie.', 'Pomijanie społeczności lokalnej wśród interesariuszy.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const MGMT_QUESTIONS: Question[] = [
  // biz-management-functions --------------------------------------------------
  choice({
    id: 'bz-f-1',
    skill: 'biz-management-functions',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które zestawienie zawiera cztery podstawowe funkcje zarządzania?',
    choices: ['planowanie, organizowanie, przewodzenie (motywowanie), kontrolowanie', 'produkcja, sprzedaż, księgowość, reklama', 'rekrutacja, selekcja, ocena, zwolnienie', 'zakup, magazynowanie, transport, sprzedaż'],
    answer: 'A',
    hints: ['Co kierownik robi najpierw, zanim zacznie działać?', 'Planuje.', 'Co musi zrobić na końcu?', 'Sprawdzić wyniki — pośrodku są organizowanie i przewodzenie.'],
    steps: ['Funkcje zarządzania: planowanie, organizowanie, przewodzenie, kontrolowanie.', 'Pozostałe zestawy to działy firmy lub etapy procesów.'],
    errors: [
      ['B', 'To obszary działalności firmy.', 'Funkcje zarządzania to planowanie, organizowanie, przewodzenie, kontrolowanie.'],
      ['C', 'To etapy zarządzania kadrami.', 'Funkcje zarządzania to planowanie, organizowanie, przewodzenie, kontrolowanie.'],
      ['D', 'To etapy logistyki.', 'Funkcje zarządzania to planowanie, organizowanie, przewodzenie, kontrolowanie.'],
    ],
  }),
  choice({
    id: 'bz-f-2',
    skill: 'biz-management-functions',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'W której strukturze organizacyjnej pracownik ma jednocześnie przełożonego w swoim dziale i kierownika projektu?',
    choices: ['macierzowej', 'liniowej', 'funkcjonalnej', 'dywizjonalnej'],
    answer: 'A',
    hints: ['Ilu przełożonych ma pracownik w strukturze liniowej?', 'Jednego.', 'Która struktura łączy działy z projektami?', 'Jej schemat przypomina tabelę — wiersze i kolumny.'],
    steps: ['Struktura macierzowa łączy podział na działy i projekty.', 'Pracownik podlega kierownikowi działu i kierownikowi projektu.'],
    errors: [
      ['B', 'W liniowej jest jeden przełożony.', 'Dwóch przełożonych to struktura macierzowa.'],
      ['C', 'W funkcjonalnej polecenia wydają specjaliści, nie projekty.', 'To struktura macierzowa.'],
      ['D', 'Dywizje dzielą firmę według produktów lub regionów.', 'To struktura macierzowa.'],
    ],
  }),
  numeric({
    id: 'bz-f-3',
    skill: 'biz-management-functions',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Firma ma prezesa, któremu podlega 4 kierowników działów, a każdemu kierownikowi podlega 6 pracowników. Ile osób liczy cała struktura (łącznie z prezesem)?',
    answer: 29,
    verify: () => 1 + 4 + 4 * 6,
    hints: ['Z ilu poziomów składa się struktura?', 'Z trzech: prezes, kierownicy, pracownicy.', 'Ilu jest pracowników na najniższym poziomie?', 'Każdy z kierowników ma swoich podwładnych — dodaj wszystkie poziomy.'],
    steps: ['Pracownicy: 4 · 6 = 24.', 'Łącznie: 1 + 4 + 24 = 29 osób.'],
    errors: [['24', 'Policzeni tylko pracownicy najniższego szczebla.', 'Dodaj prezesa i kierowników.']],
  }),
  choice({
    id: 'bz-f-4',
    skill: 'biz-management-functions',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Kierowniczka zespołu ekspertów-programistów wyznacza cel, a sposób pracy pozostawia zespołowi i wkracza tylko na prośbę. Jaki styl kierowania stosuje?',
    choices: ['liberalny', 'autokratyczny', 'biurokratyczny', 'nakazowy'],
    answer: 'A',
    hints: ['Ile swobody ma zespół?', 'Bardzo dużo — sam decyduje, jak pracować.', 'Który styl daje najwięcej swobody?', 'Styl, w którym szef ogranicza się do wyznaczenia celu.'],
    steps: ['Duża swoboda zespołu i minimalna ingerencja to styl liberalny.', 'Dobrze sprawdza się przy doświadczonych ekspertach.'],
    errors: [
      ['B', 'Autokrata decyduje sam o wszystkim.', 'Tu zespół ma swobodę — styl liberalny.'],
      ['C', 'Biurokracja opiera się na przepisach i procedurach.', 'Tu zespół ma swobodę — styl liberalny.'],
      ['D', 'Styl nakazowy to autokratyczny.', 'Tu zespół ma swobodę — styl liberalny.'],
    ],
  }),
  choice({
    id: 'bz-f-5',
    skill: 'biz-management-functions',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Szef działu ma 18 podwładnych i nie nadąża z przekazywaniem informacji i kontrolą. Które rozwiązanie najlepiej zmniejszy rozpiętość kierowania?',
    choices: ['wprowadzenie trzech liderów zespołów po 6 osób, którzy podlegają szefowi', 'zatrudnienie kolejnych 5 pracowników bezpośrednio pod szefem', 'zniesienie wszystkich spotkań zespołu', 'przekazanie wszystkich decyzji prezesowi'],
    answer: 'A',
    hints: ['Czym jest rozpiętość kierowania?', 'Liczbą osób podlegających bezpośrednio jednemu kierownikowi.', 'Jak zmniejszyć tę liczbę, nie zwalniając ludzi?', 'Wprowadzić dodatkowy szczebel kierowania.'],
    steps: ['Liderzy zespołów tworzą nowy szczebel.', 'Szefowi podlegają bezpośrednio 3 osoby zamiast 18.'],
    errors: [
      ['B', 'Zwiększa rozpiętość kierowania.', 'Trzeba ją zmniejszyć.'],
      ['C', 'Pogarsza przepływ informacji.', 'Rozpiętość się nie zmienia.'],
      ['D', 'Przeciąża prezesa.', 'Lepiej dodać szczebel liderów.'],
    ],
  }),
  text({
    id: 'bz-f-6',
    skill: 'biz-management-functions',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij jednym słowem: funkcja zarządzania polegająca na porównaniu osiągniętych wyników z planem i podjęciu działań korygujących to ________.',
    answer: 'kontrolowanie',
    variants: ['kontrola'],
    hints: ['Która funkcja zamyka cykl zarządzania?', 'Ta, która sprawdza wyniki.', 'Od jakiego słowa pochodzi jej nazwa?', 'Od „kontroli”.'],
    steps: ['Porównanie wyników z planem i korekta to kontrolowanie.', 'Zamyka cykl i zasila kolejne planowanie.'],
    errors: [['planowanie', 'Planowanie wyznacza cele, nie sprawdza wyników.', 'Sprawdzanie wyników to kontrolowanie.']],
  }),
  choice({
    id: 'bz-f-7',
    skill: 'biz-management-functions',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'W zakładzie doszło do awarii zagrażającej bezpieczeństwu. Który styl kierowania jest w tej chwili najwłaściwszy?',
    choices: ['autokratyczny — szybkie, jednoznaczne polecenia kierownika', 'liberalny — każdy sam decyduje, co robić', 'demokratyczny — głosowanie nad każdym krokiem', 'żaden — należy poczekać, aż sytuacja się uspokoi'],
    answer: 'A',
    hints: ['Czego wymaga sytuacja kryzysowa?', 'Szybkich i jasnych decyzji.', 'Który styl pozwala decydować najszybciej?', 'Ten, w którym decyduje jedna osoba.'],
    steps: ['W kryzysie liczy się czas i jednoznaczność poleceń.', 'Styl autokratyczny jest wtedy najskuteczniejszy — dobór stylu zależy od sytuacji.'],
    errors: [
      ['B', 'Swoboda w kryzysie grozi chaosem.', 'Potrzebne są szybkie polecenia.'],
      ['C', 'Konsultacje zajmują czas.', 'Potrzebne są szybkie polecenia.'],
      ['D', 'Bezczynność zwiększa zagrożenie.', 'Potrzebne są szybkie polecenia.'],
    ],
  }),

  // biz-hr --------------------------------------------------------------------
  choice({
    id: 'bz-h-1',
    skill: 'biz-hr',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Firma obsadza stanowisko kierownika sklepu, awansując jedną z doświadczonych kasjerek. Jaki to rodzaj rekrutacji?',
    choices: ['wewnętrzna', 'zewnętrzna', 'przez agencję pracy tymczasowej', 'przez urząd pracy'],
    answer: 'A',
    hints: ['Skąd pochodzi kandydatka?', 'Już pracuje w firmie.', 'Jak nazywa się rekrutacja spośród obecnych pracowników?', 'Przeciwieństwo zewnętrznej.'],
    steps: ['Kandydatka pochodzi z firmy — rekrutacja wewnętrzna.', 'Zewnętrzna szuka kandydatów poza firmą.'],
    errors: [
      ['B', 'Kandydatka nie pochodzi spoza firmy.', 'To rekrutacja wewnętrzna.'],
      ['C', 'Nie było pośrednictwa agencji.', 'To rekrutacja wewnętrzna.'],
      ['D', 'Nie było pośrednictwa urzędu.', 'To rekrutacja wewnętrzna.'],
    ],
  }),
  choice({
    id: 'bz-h-2',
    skill: 'biz-hr',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Który motywator jest POZAPŁACOWY i NIEMATERIALNY?',
    choices: ['publiczne uznanie osiągnięć i możliwość prowadzenia ważnego projektu', 'premia kwartalna', 'samochód służbowy do użytku prywatnego', 'dofinansowanie karnetu na siłownię'],
    answer: 'A',
    hints: ['Które z nich nie wiążą się z pieniędzmi ani rzeczami?', 'Te, które dotyczą uznania i rozwoju.', 'Premia to motywator płacowy.', 'Samochód i karnet to pozapłacowe, ale materialne.'],
    steps: ['Uznanie i odpowiedzialność to motywatory pozapłacowe niematerialne.', 'Premia — płacowy; samochód i karnet — pozapłacowe materialne.'],
    errors: [
      ['B', 'Premia to motywator płacowy.', 'Niematerialne to np. uznanie i rozwój.'],
      ['C', 'Samochód to korzyść materialna.', 'Niematerialne to np. uznanie i rozwój.'],
      ['D', 'Karnet to korzyść materialna.', 'Niematerialne to np. uznanie i rozwój.'],
    ],
  }),
  choice({
    id: 'bz-h-3',
    skill: 'biz-hr',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Według teorii Herzberga które czynniki przede wszystkim BUDUJĄ zaangażowanie (a nie tylko usuwają niezadowolenie)?',
    choices: ['uznanie, odpowiedzialność i możliwość rozwoju', 'wysokość pensji i warunki pracy', 'czystość biura i parking', 'regulamin pracy'],
    answer: 'A',
    hints: ['Na jakie dwie grupy Herzberg dzieli czynniki?', 'Czynniki higieny i motywatory.', 'Które czynniki tylko zapobiegają niezadowoleniu?', 'Płaca i warunki — higiena; zaangażowanie budują motywatory.'],
    steps: ['Czynniki higieny (płaca, warunki) usuwają niezadowolenie.', 'Motywatory (uznanie, odpowiedzialność, rozwój) budują zaangażowanie.'],
    errors: [
      ['B', 'To czynniki higieny.', 'Zaangażowanie budują motywatory.'],
      ['C', 'To czynniki higieny.', 'Zaangażowanie budują motywatory.'],
      ['D', 'Regulamin to czynnik organizacyjny (higieny).', 'Zaangażowanie budują motywatory.'],
    ],
  }),
  choice({
    id: 'bz-h-4',
    skill: 'biz-hr',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Na czym polega ocena pracownika metodą 360 stopni?',
    choices: ['opinie o pracowniku zbiera się od przełożonego, współpracowników, podwładnych i klientów', 'pracownika ocenia wyłącznie przełożony raz w roku', 'pracownik ocenia sam siebie w 360 pytaniach', 'ocenę wystawia komputer na podstawie godzin pracy'],
    answer: 'A',
    hints: ['Co oznacza „360 stopni” w geometrii?', 'Pełne koło — wszystkie kierunki.', 'Z ilu stron może pochodzić opinia o pracowniku?', 'Od góry, z boku, z dołu i z zewnątrz.'],
    steps: ['Ocena 360 stopni zbiera opinie z różnych perspektyw.', 'Przełożony, współpracownicy, podwładni i klienci dają pełniejszy obraz.'],
    errors: [
      ['B', 'To klasyczna ocena przez przełożonego.', '360 stopni to wiele źródeł opinii.'],
      ['C', 'Liczba 360 nie dotyczy pytań.', '360 stopni to wiele źródeł opinii.'],
      ['D', 'Godziny pracy to nie ocena kompetencji.', '360 stopni to wiele źródeł opinii.'],
    ],
  }),
  choice({
    id: 'bz-h-5',
    skill: 'biz-hr',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Zgodnie z hierarchią potrzeb Maslowa, która potrzeba pracownika zwykle musi być zaspokojona, zanim zacznie go motywować możliwość samorealizacji?',
    choices: ['potrzeba bezpieczeństwa, np. stabilnego zatrudnienia', 'potrzeba samorealizacji', 'potrzeba prestiżu w mediach', 'potrzeba podróżowania'],
    answer: 'A',
    hints: ['Jak zbudowana jest piramida Maslowa?', 'Od potrzeb podstawowych do wyższych.', 'Gdzie w piramidzie jest samorealizacja?', 'Na szczycie — wcześniej muszą być zaspokojone potrzeby niższe, np. bezpieczeństwa.'],
    steps: ['Piramida: fizjologiczne, bezpieczeństwa, przynależności, uznania, samorealizacji.', 'Potrzeby niższe, np. bezpieczeństwa, są zwykle warunkiem działania wyższych.'],
    errors: [
      ['B', 'To właśnie potrzeba ze szczytu piramidy.', 'Pytanie dotyczy potrzeby niższej.'],
      ['C', 'To nie element piramidy Maslowa.', 'Niższy poziom to np. bezpieczeństwo.'],
      ['D', 'To nie element piramidy Maslowa.', 'Niższy poziom to np. bezpieczeństwo.'],
    ],
  }),
  choice({
    id: 'bz-h-6',
    skill: 'biz-hr',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Firma IT ma wysoką rotację programistów, choć płaci powyżej średniej rynkowej. W rozmowach odejściowych powtarza się: „brak rozwoju i nudne zadania”. Co najlepiej zmniejszy rotację?',
    choices: ['ścieżki rozwoju, rotacja projektów i budżet na szkolenia', 'kolejna podwyżka o 5% dla wszystkich', 'zakaz zmiany pracy w umowie', 'ograniczenie pracy zdalnej'],
    answer: 'A',
    hints: ['Czy problemem jest płaca?', 'Nie — płace są powyżej średniej.', 'Na co skarżą się odchodzący?', 'Na brak rozwoju — to motywatory, nie czynniki higieny.'],
    steps: ['Płaca (czynnik higieny) jest już zadowalająca.', 'Przyczyną odejść jest brak motywatorów — rozwoju i ciekawej pracy.'],
    errors: [
      ['B', 'Płaca nie jest przyczyną odejść.', 'Trzeba odpowiedzieć na brak rozwoju.'],
      ['C', 'Taki zapis byłby niezgodny z prawem pracy.', 'Trzeba odpowiedzieć na brak rozwoju.'],
      ['D', 'To może zwiększyć niezadowolenie.', 'Trzeba odpowiedzieć na brak rozwoju.'],
    ],
  }),

  // biz-operations-marketing --------------------------------------------------
  choice({
    id: 'bz-o-1',
    skill: 'biz-operations-marketing',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które elementy tworzą marketing mix 4P?',
    choices: ['produkt, cena, dystrybucja (miejsce), promocja', 'plan, proces, personel, profit', 'popyt, podaż, prognoza, produkcja', 'patent, podatek, pensja, premia'],
    answer: 'A',
    hints: ['Od jakich angielskich słów pochodzą cztery „P”?', 'Product, Price, Place, Promotion.', 'Jak brzmią po polsku?', 'Produkt, cena, miejsce (dystrybucja), promocja.'],
    steps: ['4P: produkt, cena, dystrybucja (miejsce), promocja.', 'To podstawowe instrumenty marketingowe.'],
    errors: [
      ['B', 'To nie są instrumenty marketingu mix.', 'Poprawnie: produkt, cena, dystrybucja, promocja.'],
      ['C', 'To pojęcia rynkowe.', 'Poprawnie: produkt, cena, dystrybucja, promocja.'],
      ['D', 'To pojęcia prawne i płacowe.', 'Poprawnie: produkt, cena, dystrybucja, promocja.'],
    ],
  }),
  numeric({
    id: 'bz-o-2',
    skill: 'biz-operations-marketing',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Koszt wytworzenia produktu wynosi 80 zł. Firma dolicza narzut 25%, a do ceny netto — VAT 23%. Oblicz cenę brutto (w zł).',
    answer: 123,
    verify: () => 80 * 1.25 * 1.23,
    hints: ['Od czego liczy się narzut?', 'Od kosztu wytworzenia.', 'Od czego liczy się VAT?', 'Od ceny netto (koszt + narzut).'],
    steps: ['Cena netto: 80 · 1,25 = 100 zł.', 'Cena brutto: 100 · 1,23 = 123 zł.'],
    errors: [['118,4', 'Procenty dodane: 25% + 23% = 48% od kosztu.', 'Narzut i VAT nalicza się po kolei.']],
  }),
  choice({
    id: 'bz-o-3',
    skill: 'biz-operations-marketing',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Nowy producent napojów wchodzi na rynek z bardzo niską ceną, żeby szybko zdobyć klientów i udział w rynku. Jaką strategię cenową stosuje?',
    choices: ['strategię penetracji rynku', 'strategię zbierania śmietanki', 'strategię cen prestiżowych', 'strategię cen stałych od lat'],
    answer: 'A',
    hints: ['Jaki jest cel niskiej ceny na starcie?', 'Szybkie zdobycie wielu klientów.', 'Która strategia „przenika” rynek?', 'Zbieranie śmietanki to wysoka cena na starcie.'],
    steps: ['Niska cena na wejściu, by zdobyć udział w rynku, to strategia penetracji.', 'Zbieranie śmietanki zaczyna od wysokiej ceny.'],
    errors: [
      ['B', 'Zbieranie śmietanki to wysoka cena na start.', 'Niska cena na start to penetracja.'],
      ['C', 'Ceny prestiżowe są wysokie.', 'Niska cena na start to penetracja.'],
      ['D', 'Nie opisano stałości cen.', 'Niska cena na start to penetracja.'],
    ],
  }),
  choice({
    id: 'bz-o-4',
    skill: 'biz-operations-marketing',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Sprzedaż produktu jest najwyższa w historii, ale przestała rosnąć, a konkurentów przybywa. W której fazie cyklu życia jest produkt?',
    choices: ['dojrzałości', 'wprowadzenia', 'wzrostu', 'schyłku'],
    answer: 'A',
    hints: ['Czy sprzedaż jeszcze rośnie?', 'Nie — jest wysoka, ale stabilna.', 'Czy już spada?', 'Też nie — to faza pomiędzy wzrostem a schyłkiem.'],
    steps: ['Wysoka, stabilna sprzedaż i silna konkurencja to dojrzałość.', 'Wzrost to szybkie przyrosty, schyłek — spadek sprzedaży.'],
    errors: [
      ['B', 'We wprowadzeniu sprzedaż jest niska.', 'Wysoka, stabilna sprzedaż to dojrzałość.'],
      ['C', 'We wzroście sprzedaż szybko rośnie.', 'Wysoka, stabilna sprzedaż to dojrzałość.'],
      ['D', 'W schyłku sprzedaż spada.', 'Wysoka, stabilna sprzedaż to dojrzałość.'],
    ],
  }),
  numeric({
    id: 'bz-o-5',
    skill: 'biz-operations-marketing',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Sklep kupuje kurtkę za 200 zł netto i sprzedaje za 250 zł netto. Oblicz marżę jako procent ceny sprzedaży netto.',
    answer: 20,
    verify: () => ((250 - 200) / 250) * 100,
    hints: ['Ile sklep zarabia na jednej kurtce?', 'Różnicę ceny sprzedaży i zakupu.', 'Do której ceny odnosisz marżę?', 'Do ceny sprzedaży (narzut odnosi się do ceny zakupu).'],
    steps: ['Zarobek: 250 − 200 = 50 zł.', 'Marża: 50 : 250 · 100% = 20% (narzut wyniósłby 25%).'],
    errors: [['25', 'Policzony narzut (od ceny zakupu).', 'Marżę liczy się względem ceny sprzedaży.']],
  }),
  choice({
    id: 'bz-o-6',
    skill: 'biz-operations-marketing',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Które działanie jest przykładem podejścia just in time w produkcji?',
    choices: ['dostawy części przychodzą dokładnie wtedy, gdy są potrzebne na linii produkcyjnej', 'zakup zapasu części na cały rok z góry', 'wstrzymanie produkcji do czasu zebrania zamówień na cały rok', 'magazynowanie gotowych wyrobów przez wiele miesięcy'],
    answer: 'A',
    hints: ['Co znaczy „just in time”?', 'Dokładnie na czas.', 'Co firma chce ograniczyć tą metodą?', 'Zapasy i koszty magazynowania.'],
    steps: ['Just in time: materiały przychodzą w chwili, gdy są potrzebne.', 'Zmniejsza zapasy i koszty magazynowania.'],
    errors: [
      ['B', 'To budowanie dużych zapasów.', 'JIT ogranicza zapasy.'],
      ['C', 'To nie dotyczy dostaw materiałów.', 'JIT ogranicza zapasy.'],
      ['D', 'To duże zapasy wyrobów.', 'JIT ogranicza zapasy.'],
    ],
  }),
  choice({
    id: 'bz-o-7',
    skill: 'biz-operations-marketing',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'W zakładzie stolarskim kilku pracowników doznało urazów przy piłach. Który obowiązek pracodawcy w zakresie BHP jest tu najważniejszy?',
    choices: ['ocena ryzyka zawodowego, zapewnienie osłon i środków ochrony oraz przeszkolenie pracowników', 'obniżenie pensji pracownikom, którzy ulegli wypadkom', 'przeniesienie odpowiedzialności za bezpieczeństwo na pracowników', 'zwiększenie tempa produkcji, by nadrobić przestoje'],
    answer: 'A',
    hints: ['Kto odpowiada za bezpieczne warunki pracy?', 'Pracodawca.', 'Jakie działania zapobiegają wypadkom?', 'Ocena ryzyka, zabezpieczenia maszyn, szkolenia.'],
    steps: ['Pracodawca odpowiada za bezpieczeństwo i higienę pracy.', 'Musi ocenić ryzyko, zabezpieczyć maszyny, zapewnić środki ochrony i szkolenia.'],
    errors: [
      ['B', 'Kara finansowa nie usuwa zagrożenia.', 'Obowiązkiem jest zapobieganie wypadkom.'],
      ['C', 'Odpowiedzialności za BHP nie da się przenieść na pracowników.', 'Odpowiada pracodawca.'],
      ['D', 'Wyższe tempo zwiększa ryzyko.', 'Obowiązkiem jest zapobieganie wypadkom.'],
    ],
  }),

  // biz-csr -------------------------------------------------------------------
  choice({
    id: 'bz-c-1',
    skill: 'biz-csr',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które działanie firmy jest przejawem społecznej odpowiedzialności biznesu (CSR)?',
    choices: ['ograniczenie odpadów w produkcji i uczciwe warunki pracy u dostawców', 'ukrywanie informacji o szkodliwości produktu', 'wydłużanie terminów płatności małym dostawcom do granic prawa', 'reklama wprowadzająca klientów w błąd'],
    answer: 'A',
    hints: ['Czego dotyczy CSR?', 'Odpowiedzialności firmy wobec ludzi i środowiska.', 'Które działanie szanuje środowisko i pracowników?', 'Pozostałe szkodzą klientom lub partnerom.'],
    steps: ['CSR to dbałość o środowisko, pracowników, partnerów i społeczność.', 'Ograniczanie odpadów i uczciwe warunki pracy to jej przejawy.'],
    errors: [
      ['B', 'Ukrywanie szkodliwości jest nieetyczne.', 'CSR to odpowiedzialność wobec otoczenia.'],
      ['C', 'Wykorzystywanie słabszych partnerów jest nieetyczne.', 'CSR to odpowiedzialność wobec otoczenia.'],
      ['D', 'Wprowadzanie w błąd jest nieetyczne.', 'CSR to odpowiedzialność wobec otoczenia.'],
    ],
  }),
  text({
    id: 'bz-c-2',
    skill: 'biz-csr',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Uzupełnij: udawanie przez firmę, że jej produkty lub działania są ekologiczne, choć w rzeczywistości nie są, to ________.',
    answer: 'greenwashing',
    variants: ['zielone mydlenie oczu', 'ekościema'],
    hints: ['Jaki kolor kojarzy się z ekologią?', 'Zielony — po angielsku „green”.', 'Co oznacza „washing” w przenośni?', 'Wybielanie, maskowanie — tu: „zielone maskowanie”.'],
    steps: ['Pozorowanie działań proekologicznych to greenwashing.', 'To nieuczciwa praktyka marketingowa.'],
    errors: [['recykling', 'Recykling to realne przetwarzanie odpadów.', 'Udawanie ekologiczności to greenwashing.']],
  }),
  choice({
    id: 'bz-c-3',
    skill: 'biz-csr',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Przedstawiciel firmy proponuje urzędnikowi „prezent” w zamian za korzystne rozstrzygnięcie przetargu. Kto ponosi odpowiedzialność karną, jeśli do tego dojdzie?',
    choices: ['zarówno wręczający korzyść, jak i przyjmujący ją urzędnik', 'tylko urzędnik', 'tylko przedstawiciel firmy', 'nikt, jeśli prezent jest niewielki'],
    answer: 'A',
    hints: ['Jak nazywa się to przestępstwo?', 'Korupcja — łapownictwo.', 'Czy prawo karze tylko jedną stronę?', 'Nie — karane jest i przyjęcie, i wręczenie korzyści.'],
    steps: ['Przyjęcie korzyści (sprzedajność) i jej wręczenie (przekupstwo) są przestępstwami.', 'Obie strony odpowiadają karnie.'],
    errors: [
      ['B', 'Wręczający też odpowiada.', 'Karane jest przekupstwo i sprzedajność.'],
      ['C', 'Urzędnik też odpowiada.', 'Karane jest przekupstwo i sprzedajność.'],
      ['D', 'Wartość korzyści nie wyłącza odpowiedzialności.', 'Karane są obie strony.'],
    ],
  }),
  choice({
    id: 'bz-c-4',
    skill: 'biz-csr',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Kto NIE jest interesariuszem fabryki mebli działającej w małym mieście?',
    choices: ['mieszkaniec innego kontynentu bez żadnego związku z fabryką i jej produktami', 'pracownicy fabryki', 'mieszkańcy okolicznych domów', 'dostawcy drewna'],
    answer: 'A',
    hints: ['Kim są interesariusze?', 'Osobami i grupami, na które firma wpływa albo które wpływają na nią.', 'Na kogo fabryka ma wpływ?', 'Na pracowników, sąsiadów, dostawców, klientów.'],
    steps: ['Interesariusze to ci, na których firma wpływa lub którzy wpływają na nią.', 'Osoba bez żadnego związku z fabryką nie jest interesariuszem.'],
    errors: [
      ['B', 'Pracownicy to kluczowi interesariusze.', 'Szukamy osoby bez związku z firmą.'],
      ['C', 'Sąsiedzi odczuwają skutki działalności fabryki.', 'Szukamy osoby bez związku z firmą.'],
      ['D', 'Dostawcy współpracują z fabryką.', 'Szukamy osoby bez związku z firmą.'],
    ],
  }),
  choice({
    id: 'bz-c-5',
    skill: 'biz-csr',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Firma organizuje głośną akcję charytatywną, a jednocześnie od miesięcy opóźnia wypłaty pensji pracownikom. Jak ocenić jej postawę?',
    choices: ['to działanie wizerunkowe, a nie społeczna odpowiedzialność — CSR zaczyna się od uczciwego traktowania pracowników', 'to wzorcowy przykład CSR', 'to zgodne z prawem, więc etyczne', 'pracownicy powinni wspierać akcję zamiast domagać się pensji'],
    answer: 'A',
    hints: ['Czy CSR to tylko filantropia?', 'Nie — obejmuje całą działalność firmy.', 'Jak firma traktuje najbliższych interesariuszy?', 'Nieuczciwie — to przekreśla wiarygodność akcji.'],
    steps: ['CSR dotyczy codziennych praktyk, zwłaszcza wobec pracowników.', 'Opóźnianie pensji przy głośnej akcji charytatywnej to działanie wizerunkowe.'],
    errors: [
      ['B', 'Łamanie praw pracowników wyklucza CSR.', 'To działanie wizerunkowe.'],
      ['C', 'Opóźnianie wypłat narusza prawo pracy.', 'To nieetyczne i niezgodne z prawem.'],
      ['D', 'Pensja to prawo pracownika.', 'Firma musi płacić terminowo.'],
    ],
  }),
  choice({
    id: 'bz-c-6',
    skill: 'biz-csr',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Przed wyborem dostawcy firma sprawdza, czy nie zatrudnia on dzieci i czy przestrzega norm ochrony środowiska — nawet jeśli taki dostawca jest droższy. Jaką korzyść biznesową może to przynieść?',
    choices: ['ograniczenie ryzyka skandalu i utraty zaufania klientów oraz budowę długotrwałej reputacji', 'natychmiastowe obniżenie kosztów produkcji', 'zwolnienie z płacenia podatków', 'brak konieczności kontroli jakości'],
    answer: 'A',
    hints: ['Co może się stać, gdy wyjdzie na jaw, że dostawca zatrudnia dzieci?', 'Skandal, bojkot, utrata klientów.', 'Czy uczciwy dostawca jest tańszy?', 'Nie zawsze — korzyść dotyczy ryzyka i reputacji.'],
    steps: ['Weryfikacja dostawców ogranicza ryzyko reputacyjne.', 'Buduje zaufanie klientów i inwestorów w długim okresie.'],
    errors: [
      ['B', 'Droższy dostawca nie obniża kosztów.', 'Korzyścią jest mniejsze ryzyko i reputacja.'],
      ['C', 'Nie ma takiego zwolnienia.', 'Korzyścią jest mniejsze ryzyko i reputacja.'],
      ['D', 'Kontrola jakości nadal jest potrzebna.', 'Korzyścią jest mniejsze ryzyko i reputacja.'],
    ],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const MGMT_CARDS: Flashcard[] = [
  card('c-bz-f-1', 'biz-management-functions', 'definicja', 'Cztery funkcje zarządzania?', 'Planowanie, organizowanie, przewodzenie (motywowanie), kontrolowanie.'),
  card('c-bz-f-2', 'biz-management-functions', 'definicja', 'Rozpiętość kierowania?', 'Liczba osób bezpośrednio podległych jednemu kierownikowi.'),

  card('c-bz-h-1', 'biz-hr', 'definicja', 'Herzberg: higiena a motywatory?', 'Higiena (płaca, warunki) usuwa niezadowolenie; motywatory (uznanie, rozwój) budują zaangażowanie.'),
  card('c-bz-h-2', 'biz-hr', 'definicja', 'Ocena 360 stopni?', 'Opinie przełożonego, współpracowników, podwładnych i klientów.'),

  card('c-bz-o-1', 'biz-operations-marketing', 'pulapka', 'Narzut a marża?', 'Narzut od kosztu, marża od ceny: narzut 25% = marża 20%.'),
  card('c-bz-o-2', 'biz-operations-marketing', 'definicja', 'Fazy cyklu życia produktu?', 'Wprowadzenie, wzrost, dojrzałość, schyłek.'),

  card('c-bz-c-1', 'biz-csr', 'definicja', 'Greenwashing?', 'Udawanie przez firmę działań proekologicznych.'),
  card('c-bz-c-2', 'biz-csr', 'definicja', 'Interesariusze firmy?', 'Wszyscy, na których wpływa jej działalność: pracownicy, klienci, dostawcy, społeczność, właściciele.'),
];

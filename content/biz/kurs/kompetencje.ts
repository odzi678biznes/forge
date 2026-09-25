import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, numeric, p, text, tip, warn } from '../../authoring';

/**
 * Biznes i zarządzanie, dział 8: kompetencje przedsiębiorcze.
 *
 * Podstawa programowa 2024: ZP I.1–I.7, I.11, III.1, III.2, III.9.
 */

export const COMP_TOPIC: Topic = {
  id: 'biz-competences-topic',
  subjectId: 'biz',
  name: 'Kompetencje przedsiębiorcze',
  summary: 'Cechy osoby przedsiębiorczej, innowacje i ich źródła, patriotyzm gospodarczy; komunikacja, wywieranie wpływu i obrona przed manipulacją, zarządzanie czasem i podejmowanie decyzji.',
};

export const COMP_SKILLS: Skill[] = [
  {
    id: 'biz-entrepreneurship',
    topicId: 'biz-competences-topic',
    name: 'Przedsiębiorczość i innowacje',
    level: 'PR',
    ckeRequirement: 'Cechy i kompetencje osoby przedsiębiorczej, znaczenie przedsiębiorczości, rodzaje i źródła innowacji, wolność gospodarcza, patriotyzm gospodarczy (ZP I.1–I.3, I.11, III.1, III.2, III.9)',
    prerequisites: [],
    examValue: 0.65,
  },
  {
    id: 'biz-soft-skills',
    topicId: 'biz-competences-topic',
    name: 'Komunikacja, wpływ, czas i decyzje',
    level: 'PR',
    ckeRequirement: 'Komunikacja werbalna i niewerbalna, techniki wywierania wpływu i obrona przed manipulacją, zarządzanie czasem, etapy i metody podejmowania decyzji (ZP I.4–I.7)',
    prerequisites: ['biz-entrepreneurship'],
    examValue: 0.7,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const COMP_LESSONS: Lesson[] = [
  {
    skillId: 'biz-entrepreneurship',
    minutes: 12,
    intro:
      'Przedsiębiorczość to nie tylko prowadzenie firmy. To sposób działania: dostrzegasz szansę, bierzesz inicjatywę i odpowiedzialność, ryzykujesz rozsądnie i doprowadzasz sprawy do końca — w pracy, szkole i życiu prywatnym.',
    blocks: [
      p('Cechy osoby przedsiębiorczej: inicjatywa, kreatywność, gotowość do rozsądnego ryzyka, wytrwałość, umiejętność współpracy, odpowiedzialność, otwartość na zmiany. Kompetencje przedsiębiorcze składają się z wiedzy, umiejętności i postaw — i można je rozwijać planem (np. kursy, projekty, wolontariat).'),
      p('Innowacja to wprowadzenie czegoś nowego lub istotnie ulepszonego: produktu, procesu (sposobu wytwarzania), metody marketingowej albo organizacyjnej. Źródła innowacji: nowa wiedza i technologie, zmiany potrzeb klientów, problemy do rozwiązania, zmiany prawa i demografii. Innowacje budują przewagę konkurencyjną firm.'),
      p('Gospodarka rynkowa opiera się na wolności gospodarczej i własności prywatnej. Patriotyzm gospodarczy to odpowiedzialność za dobrobyt kraju: uczciwe prowadzenie firmy, płacenie podatków w Polsce, wspieranie rodzimych produktów i technologii — bez łamania zasad uczciwej konkurencji.'),
      tip('Innowacja procesowa zmienia SPOSÓB robienia rzeczy (np. robot na linii), a produktowa — to, CO firma oferuje (np. nowy model telefonu).'),
      warn('Przedsiębiorczość to rozsądne ryzyko, a nie hazard — przedsiębiorca ocenia szanse i zabezpiecza się przed stratą.'),
    ],
    examples: [
      example(
        'Piekarnia wprowadziła zamówienia przez aplikację z odbiorem w automacie. Jaki to rodzaj innowacji?',
        [['Zmienia się sposób sprzedaży i obsługi klienta.', 'produkt (chleb) jest ten sam'], 'To innowacja procesowa (lub marketingowa w zakresie dystrybucji).'],
        'procesowa',
      ),
      example(
        'Które zachowanie świadczy o patriotyzmie gospodarczym przedsiębiorcy?',
        ['Uczciwe płacenie podatków w Polsce i rozwijanie firmy w kraju.', 'To wkład w dobrobyt wspólnoty.'],
        'płacenie podatków w Polsce',
      ),
    ],
    pitfalls: ['Utożsamianie przedsiębiorczości wyłącznie z posiadaniem firmy.', 'Mylenie innowacji produktowej z procesową.', 'Rozumienie patriotyzmu gospodarczego jako zakazu importu.'],
  },
  {
    skillId: 'biz-soft-skills',
    minutes: 15,
    intro:
      'Najlepszy pomysł przepada, jeśli nie umiesz go przekazać, dogadać się z ludźmi, zaplanować czasu i podjąć decyzji. Te umiejętności są na egzaminie — i w każdej pracy.',
    blocks: [
      p('Komunikacja werbalna (słowa) i niewerbalna (mimika, gesty, postawa, ton głosu). Aktywne słuchanie: pełna uwaga, dopytywanie, parafraza („Czy dobrze rozumiem, że…”). Komunikat „ja” mówi o własnych odczuciach zamiast oskarżać („Martwię się, gdy raport jest spóźniony” zamiast „Ty zawsze się spóźniasz”).'),
      p('Wywieranie wpływu (reguły Cialdiniego): wzajemność (odwdzięczamy się za prezent), zaangażowanie i konsekwencja (małe „tak” prowadzi do większego), społeczny dowód słuszności („wszyscy to kupują”), lubienie, autorytet, niedostępność („ostatnie sztuki!”). Manipulacja wykorzystuje je nieuczciwie. Obrona: zatrzymaj się, oddziel emocje od faktów, daj sobie czas, sprawdź informacje.'),
      p('Zarządzanie czasem: macierz Eisenhowera (ważne i pilne — zrób od razu; ważne niepilne — zaplanuj; pilne nieważne — deleguj; ani ważne, ani pilne — wyeliminuj), zasada Pareto (ok. 20% działań daje ok. 80% efektów), planowanie dnia, ograniczanie „złodziei czasu”. Decyzje: rozpoznanie problemu, zebranie informacji, warianty, ocena (np. plusy i minusy, drzewo decyzyjne), wybór, wdrożenie, ocena skutków.'),
      tip('Najważniejsze długoterminowe cele (nauka do matury!) zwykle są „ważne, ale niepilne” — dlatego trzeba je wpisać w kalendarz, bo same się nie wydarzą.'),
      warn('Presja czasu („oferta tylko dziś!”) to sygnał ostrzegawczy — uczciwa oferta zwykle wytrzyma jeden dzień namysłu.'),
    ],
    examples: [
      example(
        'Sprzedawca mówi: „Zostały dwie sztuki, a promocja kończy się za godzinę”. Jakiej reguły wpływu używa?',
        [['Ograniczona dostępność i czas.', 'rzadkie wydaje się cenniejsze'], 'To reguła niedostępności.'],
        'niedostępności',
      ),
      example(
        'Nauka do matury za pół roku — do której ćwiartki macierzy Eisenhowera należy dziś?',
        ['Jest bardzo ważna, ale termin jeszcze odległy.', 'Ważne i niepilne — trzeba ją zaplanować.'],
        'ważne, niepilne',
      ),
    ],
    pitfalls: ['Komunikaty „ty” zamiast „ja” w konflikcie.', 'Uleganie presji czasu przy zakupach.', 'Zajmowanie się tylko sprawami pilnymi, a nie ważnymi.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const COMP_QUESTIONS: Question[] = [
  // biz-entrepreneurship ------------------------------------------------------
  choice({
    id: 'bk-e-1',
    skill: 'biz-entrepreneurship',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Która postawa najlepiej świadczy o przedsiębiorczości ucznia?',
    choices: ['sam organizuje w szkole kiermasz na rzecz schroniska: planuje, zbiera zespół i doprowadza akcję do końca', 'czeka, aż nauczyciel przydzieli mu zadanie', 'unika wszelkiego ryzyka i nowych wyzwań', 'krytykuje pomysły innych bez proponowania własnych'],
    answer: 'A',
    hints: ['Jakie cechy ma osoba przedsiębiorcza?', 'Inicjatywę, odpowiedzialność, wytrwałość.', 'Kto sam dostrzega okazję i działa?', 'Pozostałe postawy są bierne.'],
    steps: ['Inicjatywa, organizacja i doprowadzenie sprawy do końca to przejawy przedsiębiorczości.', 'Bierność i unikanie wyzwań są jej przeciwieństwem.'],
    errors: [
      ['B', 'To postawa bierna.', 'Przedsiębiorczość to inicjatywa.'],
      ['C', 'Przedsiębiorczość wymaga rozsądnego ryzyka.', 'Unikanie wyzwań to jej brak.'],
      ['D', 'Sama krytyka to nie działanie.', 'Przedsiębiorczość to inicjatywa.'],
    ],
  }),
  choice({
    id: 'bk-e-2',
    skill: 'biz-entrepreneurship',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Fabryka zastąpiła ręczne pakowanie linią z robotami, dzięki czemu produkcja jest szybsza i tańsza. Jaki to rodzaj innowacji?',
    choices: ['procesowa', 'produktowa', 'marketingowa', 'to nie jest innowacja'],
    answer: 'A',
    hints: ['Czy zmienił się produkt, który kupuje klient?', 'Nie — zmienił się sposób jego wytwarzania.', 'Jak nazywa się innowacja dotycząca sposobu produkcji?', 'Od słowa „proces”.'],
    steps: ['Zmiana sposobu wytwarzania to innowacja procesowa.', 'Produktowa zmieniłaby sam produkt.'],
    errors: [
      ['B', 'Produkt się nie zmienił.', 'Zmienił się proces wytwarzania.'],
      ['C', 'Marketing dotyczy sprzedaży i promocji.', 'Zmienił się proces wytwarzania.'],
      ['D', 'Nowy sposób produkcji to innowacja.', 'To innowacja procesowa.'],
    ],
  }),
  text({
    id: 'bk-e-3',
    skill: 'biz-entrepreneurship',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij: odpowiedzialność konsumentów i przedsiębiorców za dobrobyt kraju, przejawiająca się m.in. w uczciwym płaceniu podatków w Polsce i wspieraniu rodzimych produktów, to patriotyzm ________.',
    answer: 'gospodarczy',
    variants: ['ekonomiczny'],
    hints: ['Czego dotyczy ten rodzaj patriotyzmu — historii, sportu czy gospodarki?', 'Gospodarki.', 'Jak brzmi przymiotnik od słowa „gospodarka”?', 'Ten sam termin występuje w podstawie programowej.'],
    steps: ['Troska o dobrobyt kraju przez uczciwe działania ekonomiczne to patriotyzm gospodarczy.', 'Przejawia się m.in. w płaceniu podatków w Polsce i uczciwym biznesie.'],
    errors: [['lokalny', 'Zbyt wąskie pojęcie.', 'Termin z podstawy: patriotyzm gospodarczy.']],
  }),
  choice({
    id: 'bk-e-4',
    skill: 'biz-entrepreneurship',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Które zdanie poprawnie opisuje kompetencje przedsiębiorcze?',
    choices: ['obejmują wiedzę, umiejętności i postawy — i można je rozwijać', 'są wrodzone, więc nie da się ich rozwinąć', 'dotyczą wyłącznie właścicieli firm', 'to tylko umiejętność liczenia zysku'],
    answer: 'A',
    hints: ['Z jakich trzech elementów składa się każda kompetencja?', 'Wiedza, umiejętności, postawy.', 'Czy przedsiębiorczości można się nauczyć?', 'Tak — przez praktykę, projekty, naukę.'],
    steps: ['Kompetencje przedsiębiorcze to wiedza, umiejętności i postawy.', 'Można je planowo rozwijać; przydają się każdemu, nie tylko właścicielom firm.'],
    errors: [
      ['B', 'Kompetencje można rozwijać.', 'Składają się z wiedzy, umiejętności i postaw.'],
      ['C', 'Przedsiębiorczość przydaje się każdemu.', 'Nie tylko właścicielom firm.'],
      ['D', 'To zbyt wąskie ujęcie.', 'Liczą się też postawy i umiejętności społeczne.'],
    ],
  }),
  choice({
    id: 'bk-e-5',
    skill: 'biz-entrepreneurship',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Starzejące się społeczeństwo sprawia, że rośnie popyt na usługi opieki i proste urządzenia dla seniorów. Czym jest ta zmiana dla przedsiębiorcy?',
    choices: ['źródłem innowacji i szansą rynkową wynikającą ze zmian demograficznych', 'wyłącznie zagrożeniem, którego trzeba unikać', 'zjawiskiem bez znaczenia dla biznesu', 'dowodem na brak konkurencji w każdej branży'],
    answer: 'A',
    hints: ['Jak zmiana w społeczeństwie wpływa na potrzeby ludzi?', 'Pojawiają się nowe potrzeby.', 'Co przedsiębiorca robi z nowymi potrzebami?', 'Szuka sposobu, by je zaspokoić — to okazja do innowacji.'],
    steps: ['Zmiany demograficzne tworzą nowe potrzeby.', 'Dla przedsiębiorcy to szansa rynkowa i źródło innowacji.'],
    errors: [
      ['B', 'Nowe potrzeby to szansa.', 'Przedsiębiorca dostrzega okazje.'],
      ['C', 'Demografia silnie wpływa na popyt.', 'To źródło innowacji.'],
      ['D', 'Nie ma takiego związku.', 'To szansa rynkowa.'],
    ],
  }),
  choice({
    id: 'bk-e-6',
    skill: 'biz-entrepreneurship',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Które działanie NIE jest przejawem patriotyzmu gospodarczego, choć może być tak przedstawiane?',
    choices: ['zmowa krajowych producentów w celu podniesienia cen „polskich” produktów', 'płacenie podatków w Polsce przez firmę z polskim kapitałem', 'wybór krajowego dostawcy o porównywalnej jakości i cenie', 'inwestowanie w badania i rozwój w polskich zakładach'],
    answer: 'A',
    hints: ['Czy patriotyzm gospodarczy usprawiedliwia łamanie prawa?', 'Nie — zakłada uczciwe działanie.', 'Kto traci na zmowie cenowej?', 'Krajowi konsumenci — czyli obywatele.'],
    steps: ['Patriotyzm gospodarczy to uczciwe działanie na rzecz dobrobytu kraju.', 'Zmowa cenowa szkodzi konsumentom i jest niezgodna z prawem konkurencji.'],
    errors: [
      ['B', 'To przejaw patriotyzmu gospodarczego.', 'Szukamy działania, które nim nie jest.'],
      ['C', 'To przejaw patriotyzmu gospodarczego.', 'Szukamy działania, które nim nie jest.'],
      ['D', 'To przejaw patriotyzmu gospodarczego.', 'Szukamy działania, które nim nie jest.'],
    ],
  }),

  // biz-soft-skills -----------------------------------------------------------
  choice({
    id: 'bk-s-1',
    skill: 'biz-soft-skills',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Który komunikat jest „komunikatem ja”?',
    choices: ['„Denerwuję się, gdy raport przychodzi po terminie, bo nie mogę przygotować prezentacji.”', '„Zawsze się spóźniasz z raportem!”', '„Jesteś nieodpowiedzialny.”', '„Wszyscy wiedzą, że nie da się z tobą pracować.”'],
    answer: 'A',
    hints: ['O kim mówi komunikat „ja”?', 'O uczuciach i potrzebach mówiącego.', 'Czy zawiera oskarżenie i ocenę drugiej osoby?', 'Nie — opisuje sytuację i jej skutek.'],
    steps: ['Komunikat „ja” opisuje moje uczucia, sytuację i jej skutki.', 'Pozostałe to oskarżenia i oceny („ty”).'],
    errors: [
      ['B', 'To oskarżenie („ty zawsze…”).', 'Komunikat „ja” mówi o moich uczuciach.'],
      ['C', 'To ocena osoby.', 'Komunikat „ja” mówi o moich uczuciach.'],
      ['D', 'To uogólnienie i atak.', 'Komunikat „ja” mówi o moich uczuciach.'],
    ],
  }),
  choice({
    id: 'bk-s-2',
    skill: 'biz-soft-skills',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Sprzedawca mówi: „Zostały ostatnie dwie sztuki, a promocja kończy się za godzinę!”. Z której reguły wpływu korzysta?',
    choices: ['niedostępności', 'wzajemności', 'lubienia', 'autorytetu'],
    answer: 'A',
    hints: ['Co sugeruje sprzedawca — że produkt jest rzadki czy że jest ekspertem?', 'Że produktu i czasu jest mało.', 'Dlaczego rzadkie rzeczy kuszą bardziej?', 'Boimy się, że stracimy okazję.'],
    steps: ['Ograniczona ilość i czas to reguła niedostępności.', 'Wywołuje presję i przyspiesza decyzję.'],
    errors: [
      ['B', 'Wzajemność to odwdzięczanie się za przysługę.', 'Tu działa niedostępność.'],
      ['C', 'Lubienie to sympatia do sprzedawcy.', 'Tu działa niedostępność.'],
      ['D', 'Autorytet to powoływanie się na eksperta.', 'Tu działa niedostępność.'],
    ],
  }),
  choice({
    id: 'bk-s-3',
    skill: 'biz-soft-skills',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Maturzysta ma do zrobienia: (1) oddać jutro wniosek o stypendium, (2) regularnie powtarzać materiał do matury za pół roku, (3) odpisać na mało istotne wiadomości w grupie, (4) oglądać przypadkowe filmiki. Które zadanie według macierzy Eisenhowera należy ZAPLANOWAĆ w kalendarzu?',
    choices: ['regularne powtórki do matury', 'wniosek o stypendium', 'wiadomości w grupie', 'przypadkowe filmiki'],
    answer: 'A',
    hints: ['Które zadanie jest ważne, ale nie ma bliskiego terminu?', 'Powtórki do odległej matury.', 'Co macierz radzi robić z zadaniami ważnymi i niepilnymi?', 'Planować — inaczej przegrywają z pilnymi.'],
    steps: ['Wniosek jest ważny i pilny (zrób od razu); powtórki — ważne, niepilne (zaplanuj).', 'Wiadomości — pilne, nieważne (ogranicz/deleguj); filmiki — ani ważne, ani pilne (wyeliminuj).'],
    errors: [
      ['B', 'Wniosek jest pilny — robi się go od razu.', 'Planuje się zadania ważne i niepilne.'],
      ['C', 'To zadanie pilne, ale mało ważne.', 'Planuje się zadania ważne i niepilne.'],
      ['D', 'To zadanie do wyeliminowania.', 'Planuje się zadania ważne i niepilne.'],
    ],
  }),
  numeric({
    id: 'bk-s-4',
    skill: 'biz-soft-skills',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Firma ma roczne przychody 500 000 zł. Zakładając regułę Pareto w wersji 80/20, ile złotych przychodów przynosi 20% najważniejszych klientów?',
    answer: 400000,
    verify: () => 0.8 * 500000,
    hints: ['Co mówi reguła Pareto 80/20?', 'Ok. 20% przyczyn daje ok. 80% skutków.', 'Jaką część przychodów daje 20% klientów?', 'Oblicz 80% z 500 000 zł.'],
    steps: ['20% klientów daje 80% przychodów.', '0,8 · 500 000 = 400 000 zł.'],
    errors: [['100000', 'Policzone 20% przychodów.', '20% klientów daje 80% przychodów.']],
  }),
  choice({
    id: 'bk-s-5',
    skill: 'biz-soft-skills',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Jaka jest prawidłowa kolejność etapów podejmowania decyzji?',
    choices: ['rozpoznanie problemu, zebranie informacji, określenie wariantów, ocena i wybór, wdrożenie, ocena skutków', 'wybór, wdrożenie, rozpoznanie problemu, ocena skutków', 'wdrożenie, zebranie informacji, wybór, rozpoznanie problemu', 'ocena skutków, wybór, określenie wariantów, rozpoznanie problemu'],
    answer: 'A',
    hints: ['Od czego trzeba zacząć, żeby podjąć dobrą decyzję?', 'Od zrozumienia, jaki problem rozwiązujemy.', 'Czy można wybierać, nie znając wariantów?', 'Nie — warianty i ocena poprzedzają wybór, a ocena skutków jest na końcu.'],
    steps: ['Najpierw problem i informacje, potem warianty i ich ocena.', 'Wybór, wdrożenie i na końcu ocena skutków.'],
    errors: [
      ['B', 'Wybór nie może poprzedzać rozpoznania problemu.', 'Najpierw problem i informacje.'],
      ['C', 'Wdrożenie jest po wyborze.', 'Najpierw problem i informacje.'],
      ['D', 'Odwrócona kolejność.', 'Najpierw problem i informacje.'],
    ],
  }),
  numeric({
    id: 'bk-s-6',
    skill: 'biz-soft-skills',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Przedsiębiorca wybiera między dwoma wariantami. A: z prawdopodobieństwem 60% zysk 10 000 zł, a z prawdopodobieństwem 40% strata 5000 zł. B: pewny zysk 3000 zł. Oblicz wartość oczekiwaną wariantu A (w zł).',
    answer: 4000,
    verify: () => 0.6 * 10000 - 0.4 * 5000,
    hints: ['Jak liczy się wartość oczekiwaną?', 'Suma iloczynów: prawdopodobieństwo · wynik.', 'Jak uwzględnić stratę?', 'Jako wynik ujemny.'],
    steps: ['0,6 · 10 000 + 0,4 · (−5000) = 6000 − 2000.', '= 4000 zł (więcej niż pewne 3000 zł w B, ale z ryzykiem straty).'],
    errors: [['8000', 'Strata potraktowana jak zysk.', 'Strata ma znak ujemny.']],
  }),
  choice({
    id: 'bk-s-7',
    skill: 'biz-soft-skills',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Na pokazie handlowym uczestnicy dostali darmowy obiad, a potem usłyszeli, że „wszyscy sąsiedzi już kupili” garnki i że „oferta obowiązuje tylko dziś”. Jaka jest najlepsza obrona przed taką manipulacją?',
    choices: ['nie podpisywać niczego od razu, dać sobie czas na sprawdzenie ceny i opinii — przy umowie zawartej poza lokalem można też odstąpić w ciągu 14 dni', 'kupić od razu, żeby odwdzięczyć się za obiad', 'kupić, bo skoro sąsiedzi kupili, to musi być dobra oferta', 'podpisać umowę i nie czytać jej, żeby nie tracić czasu'],
    answer: 'A',
    hints: ['Jakie reguły wpływu zastosowano?', 'Wzajemność (obiad), społeczny dowód słuszności (sąsiedzi), niedostępność („tylko dziś”).', 'Co przełamuje presję?', 'Czas na namysł i sprawdzenie informacji.'],
    steps: ['Pokaz łączy wzajemność, społeczny dowód słuszności i niedostępność.', 'Obrona: odroczyć decyzję, sprawdzić fakty; przy umowie zawartej poza lokalem przysługuje 14 dni na odstąpienie.'],
    errors: [
      ['B', 'To właśnie działanie reguły wzajemności.', 'Nie musisz odwdzięczać się zakupem.'],
      ['C', 'To reguła społecznego dowodu słuszności.', 'Opinie sąsiadów nie zastępują sprawdzenia oferty.'],
      ['D', 'Podpisywanie bez czytania to ryzyko.', 'Najpierw czas i sprawdzenie warunków.'],
    ],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const COMP_CARDS: Flashcard[] = [
  card('c-bk-e-1', 'biz-entrepreneurship', 'definicja', 'Rodzaje innowacji?', 'Produktowe, procesowe, marketingowe, organizacyjne.'),
  card('c-bk-e-2', 'biz-entrepreneurship', 'definicja', 'Patriotyzm gospodarczy?', 'Odpowiedzialność za dobrobyt kraju: uczciwy biznes, podatki w Polsce, rodzime produkty i technologie.'),

  card('c-bk-s-1', 'biz-soft-skills', 'definicja', 'Reguły wpływu Cialdiniego?', 'Wzajemność, zaangażowanie i konsekwencja, społeczny dowód słuszności, lubienie, autorytet, niedostępność.'),
  card('c-bk-s-2', 'biz-soft-skills', 'metoda', 'Macierz Eisenhowera?', 'Ważne i pilne — zrób; ważne niepilne — zaplanuj; pilne nieważne — deleguj; reszta — wyeliminuj.'),
];

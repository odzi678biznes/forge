import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, text, tip, warn } from '../../authoring';

/**
 * Biznes i zarządzanie, dział 7: zarządzanie projektami.
 *
 * Podstawa programowa 2024: ZP I.8–I.10, II.1–II.6; ZR I.1–I.17.
 */

export const PROJ_TOPIC: Topic = {
  id: 'biz-projects-topic',
  subjectId: 'biz',
  name: 'Zarządzanie projektami',
  summary: 'Projekt a proces, cykl życia projektu, podejście kaskadowe i zwinne, cele SMART, interesariusze; struktura podziału prac, harmonogram i ścieżka krytyczna, budżet i ryzyko; zespół, kreatywność i design thinking.',
};

export const PROJ_SKILLS: Skill[] = [
  {
    id: 'biz-project-basics',
    topicId: 'biz-projects-topic',
    name: 'Projekt, jego cykl życia i interesariusze',
    level: 'PR',
    ckeRequirement: 'Istota i etapy projektu, projekt a proces, podejścia do zarządzania projektami, cele SMART, role i interesariusze, kamienie milowe (ZP II.1–II.3; ZR I.1–I.7)',
    prerequisites: ['biz-career'],
    examValue: 0.8,
  },
  {
    id: 'biz-project-planning',
    topicId: 'biz-projects-topic',
    name: 'Plan, harmonogram, budżet i ryzyko projektu',
    level: 'PR',
    ckeRequirement: 'Struktura podziału prac, harmonogram i budżet, zarządzanie czasem, ryzyka zakresu, czasu i budżetu, zmiany planu, sprawozdanie i czynniki sukcesu (ZP II.4–II.6; ZR I.8–I.11, I.13, I.14, I.17)',
    prerequisites: ['biz-project-basics'],
    examValue: 0.85,
  },
  {
    id: 'biz-teamwork-creativity',
    topicId: 'biz-projects-topic',
    name: 'Zespół, kreatywność i design thinking',
    level: 'PR',
    ckeRequirement: 'Praca zespołowa i jej bariery, motywowanie i komunikacja w projekcie, techniki kreatywnego myślenia, design thinking (ZP I.8–I.10; ZR I.12, I.15, I.16)',
    prerequisites: ['biz-project-basics'],
    examValue: 0.7,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const PROJ_LESSONS: Lesson[] = [
  {
    skillId: 'biz-project-basics',
    minutes: 14,
    intro:
      'Projekt to jednorazowe przedsięwzięcie z celem, terminem i budżetem — jak organizacja studniówki, wdrożenie aplikacji czy budowa mostu. Proces to działanie powtarzalne, jak codzienna obsługa klientów w sklepie.',
    blocks: [
      p('Cechy projektu: unikalność, określony początek i koniec, ograniczone zasoby, konkretny cel, niepewność (ryzyko). Cykl życia: inicjowanie (pomysł, cel, uzasadnienie), planowanie (zakres, harmonogram, budżet, zespół), realizacja z monitorowaniem, zamknięcie (odbiór, rozliczenie, wnioski).'),
      p('Podejście kaskadowe (tradycyjne, „waterfall”) planuje wszystko na początku i realizuje etapami po kolei — dobre, gdy wymagania są znane i stabilne (np. budowa). Podejście zwinne (agile, np. Scrum) dzieli pracę na krótkie iteracje (sprinty), po których klient ocenia efekt — dobre, gdy wymagania się zmieniają (np. oprogramowanie).'),
      p('Cele projektu formułuje się metodą SMART. Interesariusze to wszyscy, na których projekt wpływa lub którzy wpływają na niego: sponsor (finansuje), kierownik projektu (planuje i koordynuje), zespół, klient, użytkownicy, dostawcy. Kamienie milowe to ważne punkty kontrolne w harmonogramie (np. „prototyp gotowy”).'),
      tip('Pytanie rozstrzygające: czy działanie ma koniec i jednorazowy efekt? Tak — projekt. Powtarza się bez końca — proces.'),
      warn('Kamień milowy to zdarzenie (punkt w czasie), a nie zadanie trwające tygodniami.'),
    ],
    examples: [
      example(
        'Czy comiesięczne wystawianie faktur w firmie to projekt?',
        [['Działanie powtarza się bez końca.', 'brak jednorazowego celu'], 'To proces.'],
        'nie — proces',
      ),
      example(
        'Klient chce aplikację, ale sam jeszcze nie wie, jakie funkcje będą najważniejsze. Jakie podejście wybrać?',
        ['Wymagania będą się zmieniać.', 'Krótkie iteracje z oceną klienta — podejście zwinne.'],
        'zwinne (agile)',
      ),
    ],
    pitfalls: ['Mylenie projektu z procesem.', 'Wybór podejścia kaskadowego przy niejasnych wymaganiach.', 'Pomijanie interesariuszy spoza zespołu.'],
  },
  {
    skillId: 'biz-project-planning',
    minutes: 16,
    intro:
      'Plan projektu odpowiada na trzy pytania: co trzeba zrobić, w jakiej kolejności i za ile. Zakres, czas i koszt są ze sobą powiązane — zmiana jednego wpływa na pozostałe (trójkąt ograniczeń).',
    blocks: [
      p('Struktura podziału prac (WBS) rozbija projekt na coraz mniejsze pakiety prac, aż da się je zaplanować i przypisać osobom. Harmonogram (np. wykres Gantta) pokazuje zadania na osi czasu, ich zależności i kamienie milowe.'),
      p('Ścieżka krytyczna to najdłuższy ciąg zależnych zadań — wyznacza najkrótszy możliwy czas trwania projektu. Opóźnienie zadania na ścieżce krytycznej opóźnia cały projekt. Zadania spoza niej mają zapas czasu.'),
      f('\\text{przekroczenie budżetu} = \\frac{\\text{koszt rzeczywisty} - \\text{budżet}}{\\text{budżet}} \\cdot 100\\%'),
      p('Ryzyka projektu dotyczą zakresu (rozrastające się wymagania), czasu (opóźnienia) i budżetu (przekroczenia). Zmiany wprowadza się świadomie: ocena wpływu, zgoda sponsora, aktualizacja planu. Na koniec sporządza się sprawozdanie i zbiera wnioski (lessons learned) — co zadziałało, co poprawić w kolejnych projektach.'),
      tip('Na ścieżce krytycznej nie ma zapasu — tam kierownik projektu patrzy najczęściej.'),
      warn('Dodanie nowych funkcji bez zmiany terminu i budżetu to prosta droga do porażki projektu (trójkąt ograniczeń).'),
    ],
    examples: [
      example(
        'Zadania: A (3 dni), B (5 dni, po A), C (2 dni, po A), D (4 dni, po B i C). Ile trwa projekt?',
        [['Ścieżki: A–B–D = 12 dni, A–C–D = 9 dni.', 'najdłuższa ścieżka'], 'Projekt trwa 12 dni; C ma 3 dni zapasu.'],
        '12 dni',
      ),
      example(
        'Budżet 40 000 zł, koszt rzeczywisty 46 000 zł. O ile procent przekroczono budżet?',
        ['6000 : 40 000 = 0,15.', 'Przekroczenie o 15%.'],
        '15%',
      ),
    ],
    pitfalls: ['Wyznaczanie czasu projektu jako sumy wszystkich zadań.', 'Brak zależności między zadaniami w harmonogramie.', 'Zmiany zakresu bez aktualizacji czasu i budżetu.'],
  },
  {
    skillId: 'biz-teamwork-creativity',
    minutes: 14,
    intro:
      'Zespół to więcej niż grupa ludzi — to wspólny cel, podział ról i zaufanie. Dobry zespół potrafi też tworzyć nowe pomysły, jeśli stosuje techniki, które chronią kreatywność przed krytyką na starcie.',
    blocks: [
      p('Bariery pracy zespołowej: niejasne cele i role, słaba komunikacja, konflikty, dominacja jednej osoby, „próżniactwo społeczne” (część osób liczy na innych). Pomagają: jasny podział zadań, regularne krótkie spotkania, wspólne zasady, informacja zwrotna, docenianie wkładu.'),
      p('Techniki kreatywności: burza mózgów (najpierw ilość pomysłów, zakaz krytyki, ocena dopiero później), mapa myśli, 6 kapeluszy myślowych de Bono (patrzenie na problem z sześciu perspektyw: fakty, emocje, ryzyka, korzyści, kreatywność, organizacja procesu), metoda SCAMPER. Bariery kreatywności: strach przed oceną, rutyna, pośpiech.'),
      p('Design thinking stawia użytkownika w centrum: empatia (zrozumienie potrzeb), definiowanie problemu, generowanie pomysłów, prototypowanie, testowanie z użytkownikami — i powrót do wcześniejszych etapów, jeśli test coś pokaże.'),
      tip('W burzy mózgów krytykę odkłada się na później — zabicie słabego pomysłu na starcie często zabija też ten dobry, który by z niego wyrósł.'),
      warn('Design thinking nie zaczyna się od prototypu, tylko od zrozumienia ludzi, dla których projektujemy.'),
    ],
    examples: [
      example(
        'Uczniowie zapisują na tablicy każdy pomysł na zbiórkę pieniędzy, bez oceniania. Jaka to technika?',
        [['Najpierw ilość pomysłów, zakaz krytyki.', 'ocena odroczona'], 'To burza mózgów.'],
        'burza mózgów',
      ),
      example(
        'Zespół rozmawia z seniorami o tym, jak korzystają z bankowości w telefonie, zanim zacznie projektować aplikację. Który to etap design thinking?',
        ['Poznawanie potrzeb użytkowników.', 'To etap empatii.'],
        'empatia',
      ),
    ],
    pitfalls: ['Krytykowanie pomysłów w trakcie burzy mózgów.', 'Brak jasnego podziału ról w zespole.', 'Zaczynanie design thinking od gotowego rozwiązania.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const PROJ_QUESTIONS: Question[] = [
  // biz-project-basics --------------------------------------------------------
  choice({
    id: 'bj-b-1',
    skill: 'biz-project-basics',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które przedsięwzięcie jest PROJEKTEM, a nie procesem?',
    choices: ['zorganizowanie studniówki w lutym przyszłego roku', 'codzienna obsługa klientów w sklepie osiedlowym', 'comiesięczna wypłata wynagrodzeń pracownikom', 'cotygodniowe sprzątanie biura przez firmę zewnętrzną'],
    answer: 'A',
    hints: ['Czym projekt różni się od procesu?', 'Projekt jest jednorazowy i ma koniec.', 'Które działanie ma konkretny termin i jednorazowy efekt?', 'Pozostałe powtarzają się stale.'],
    steps: ['Studniówka to jednorazowe przedsięwzięcie z terminem i budżetem — projekt.', 'Obsługa klientów, wypłaty i sprzątanie powtarzają się — to procesy.'],
    errors: [
      ['B', 'To działanie powtarzalne.', 'Projekt jest jednorazowy.'],
      ['C', 'To działanie powtarzalne.', 'Projekt jest jednorazowy.'],
      ['D', 'To działanie powtarzalne.', 'Projekt jest jednorazowy.'],
    ],
  }),
  choice({
    id: 'bj-b-2',
    skill: 'biz-project-basics',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Jaka jest prawidłowa kolejność etapów cyklu życia projektu?',
    choices: ['inicjowanie, planowanie, realizacja, zamknięcie', 'realizacja, planowanie, inicjowanie, zamknięcie', 'planowanie, zamknięcie, inicjowanie, realizacja', 'zamknięcie, realizacja, planowanie, inicjowanie'],
    answer: 'A',
    hints: ['Co musi się wydarzyć, zanim zaczniesz planować?', 'Trzeba zdefiniować pomysł i cel — zainicjować projekt.', 'Czy można realizować bez planu?', 'Plan poprzedza realizację, a zamknięcie jest na końcu.'],
    steps: ['Inicjowanie (pomysł i cel), planowanie, realizacja z monitorowaniem, zamknięcie.', 'Kolejność wynika z logiki: najpierw „co i po co”, potem „jak”, potem działanie.'],
    errors: [
      ['B', 'Realizacja nie może poprzedzać planowania.', 'Kolejność: inicjowanie, planowanie, realizacja, zamknięcie.'],
      ['C', 'Zamknięcie jest ostatnim etapem.', 'Kolejność: inicjowanie, planowanie, realizacja, zamknięcie.'],
      ['D', 'Odwrócona kolejność.', 'Kolejność: inicjowanie, planowanie, realizacja, zamknięcie.'],
    ],
  }),
  choice({
    id: 'bj-b-3',
    skill: 'biz-project-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Firma tworzy aplikację mobilną, a klient chce co dwa tygodnie oglądać postępy i zmieniać priorytety funkcji. Które podejście do zarządzania projektem jest najlepsze?',
    choices: ['zwinne (np. Scrum) z krótkimi iteracjami', 'kaskadowe — pełny plan na starcie bez zmian', 'brak planowania', 'podejście, w którym klient widzi efekt dopiero po roku'],
    answer: 'A',
    hints: ['Czy wymagania są stałe?', 'Nie — klient chce je zmieniać.', 'Które podejście przewiduje regularne pokazy i zmiany priorytetów?', 'Praca w krótkich cyklach — sprintach.'],
    steps: ['Zmienne wymagania i częsty kontakt z klientem to warunki podejścia zwinnego.', 'Scrum dzieli pracę na sprinty zakończone przeglądem.'],
    errors: [
      ['B', 'Kaskada wymaga stałych wymagań.', 'Tu wymagania się zmieniają.'],
      ['C', 'Brak planu to chaos.', 'Zwinne podejście też planuje — w krótszych cyklach.'],
      ['D', 'Klient chce widzieć postępy co dwa tygodnie.', 'Pasuje podejście zwinne.'],
    ],
  }),
  choice({
    id: 'bj-b-4',
    skill: 'biz-project-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Który z celów projektu „szkolna zbiórka na schronisko” jest sformułowany zgodnie z SMART?',
    choices: ['zebrać 3000 zł na karmę do 15 grudnia', 'zebrać jak najwięcej karmy dla schroniska do 15 grudnia', 'zebrać 3000 zł na karmę dla schroniska', 'zebrać 300 000 zł do 15 grudnia z kiermaszu ciast w szkole'],
    answer: 'A',
    hints: ['Które cele mają konkretną liczbę?', 'Tylko cel z kwotą jest mierzalny.', 'Który cel ma termin?', 'Cel SMART jest też konkretny i realny.'],
    steps: ['Cel A jest konkretny, mierzalny (3000 zł), realny, istotny i ma termin.', 'B nie da się zmierzyć, C nie ma terminu, D jest nierealny.'],
    errors: [
      ['B', 'Brak mierzalnego celu („jak najwięcej”).', 'SMART: konkretny, mierzalny, z terminem.'],
      ['C', 'Brak terminu.', 'SMART: konkretny, mierzalny, z terminem.'],
      ['D', 'Cel nierealny dla szkolnej zbiórki.', 'SMART: cel musi być też osiągalny.'],
    ],
  }),
  text({
    id: 'bj-b-5',
    skill: 'biz-project-basics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij: ważny punkt kontrolny w harmonogramie projektu, oznaczający osiągnięcie istotnego etapu (np. „prototyp gotowy”), to kamień ________.',
    answer: 'milowy',
    hints: ['Jak nazywano kamienie ustawiane przy drogach co określony dystans?', 'Pokazywały przebytą drogę.', 'Jaka jednostka odległości kryje się w nazwie?', 'Mila.'],
    steps: ['Punkt kontrolny w harmonogramie to kamień milowy.', 'Oznacza zdarzenie, a nie zadanie trwające w czasie.'],
    errors: [['graniczny', 'Pomylone pojęcie.', 'Punkt kontrolny projektu to kamień milowy.']],
  }),
  choice({
    id: 'bj-b-6',
    skill: 'biz-project-basics',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Gmina buduje nowy park. Kto z wymienionych jest SPONSOREM projektu?',
    choices: ['wójt gminy, który zatwierdza i finansuje projekt', 'firma budowlana, która wygrała przetarg na park', 'mieszkańcy, którzy będą korzystać z parku', 'kierownik projektu z urzędu gminy'],
    answer: 'A',
    hints: ['Jaką rolę pełni sponsor projektu?', 'Zapewnia finansowanie i akceptuje najważniejsze decyzje.', 'Kto dysponuje pieniędzmi na park?', 'Gmina, reprezentowana przez wójta.'],
    steps: ['Sponsor finansuje projekt i zatwierdza kluczowe decyzje.', 'Wykonawca, użytkownicy i kierownik projektu to inne role.'],
    errors: [
      ['B', 'To wykonawca.', 'Sponsor finansuje projekt i zatwierdza kluczowe decyzje.'],
      ['C', 'To użytkownicy (interesariusze).', 'Sponsor finansuje projekt.'],
      ['D', 'Kierownik prowadzi projekt, ale go nie finansuje ani nie zatwierdza.', 'Sponsor finansuje projekt.'],
    ],
  }),
  choice({
    id: 'bj-b-7',
    skill: 'biz-project-basics',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Budowa szkolnej hali sportowej ma szczegółowy projekt architektoniczny, pozwolenia i stały zakres prac. Dlaczego dobrym wyborem jest tu podejście kaskadowe?',
    choices: ['wymagania są stabilne, a etapy muszą iść po kolei', 'bo klient chce co tydzień zmieniać projekt hali', 'bo pozwala swobodnie zmieniać zakres w trakcie budowy', 'bo podejście kaskadowe zawsze jest tańsze od zwinnego'],
    answer: 'A',
    hints: ['Czy zakres hali będzie się zmieniał?', 'Nie — jest zatwierdzony w projekcie i pozwoleniach.', 'Czy etapy budowy można dowolnie przestawiać?', 'Nie — fundamenty muszą powstać przed ścianami.'],
    steps: ['Stabilny zakres i sztywna kolejność etapów pasują do podejścia kaskadowego.', 'Podejście zwinne sprawdza się, gdy wymagania się zmieniają.'],
    errors: [
      ['B', 'Częste zmiany przemawiałyby za podejściem zwinnym.', 'Tu zakres jest stały.'],
      ['C', 'Kaskada zakłada stały zakres — zmiany są w niej trudne.', 'Decyduje stabilność wymagań.'],
      ['D', 'Koszt zależy od projektu, nie od metody.', 'Decyduje stabilność wymagań.'],
    ],
  }),

  // biz-project-planning ------------------------------------------------------
  choice({
    id: 'bj-p-1',
    skill: 'biz-project-planning',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Do czego służy struktura podziału prac (WBS) w projekcie?',
    choices: ['do rozbicia projektu na pakiety prac do zaplanowania', 'do ustalenia kolejności zadań i ścieżki krytycznej', 'do oceny ryzyka i jego prawdopodobieństwa', 'do rozliczenia kosztów po zakończeniu projektu'],
    answer: 'A',
    hints: ['Jak zaplanować duże przedsięwzięcie?', 'Podzielić je na mniejsze części.', 'Co oznacza słowo „podział” w nazwie?', 'Rozbicie całości na pakiety prac.'],
    steps: ['WBS dzieli projekt na coraz mniejsze pakiety prac.', 'Pakiety można oszacować, zaplanować i przypisać osobom.'],
    errors: [
      ['B', 'Kolejność i ścieżkę krytyczną wyznacza harmonogram.', 'WBS dzieli projekt na pakiety prac.'],
      ['C', 'Do tego służy analiza ryzyka.', 'WBS dzieli projekt na pakiety prac.'],
      ['D', 'WBS to narzędzie planowania na starcie.', 'WBS dzieli projekt na pakiety prac.'],
    ],
  }),
  numeric({
    id: 'bj-p-2',
    skill: 'biz-project-planning',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Budżet projektu wynosił 40 000 zł, a rzeczywiste koszty 46 000 zł. O ile procent przekroczono budżet?',
    answer: 15,
    verify: () => ((46000 - 40000) / 40000) * 100,
    hints: ['O ile złotych przekroczono budżet?', 'Koszt rzeczywisty minus budżet.', 'Do jakiej kwoty odnosisz przekroczenie?', 'Do zaplanowanego budżetu.'],
    steps: ['Przekroczenie: 46 000 − 40 000 = 6000 zł.', '6000 : 40 000 · 100% = 15%.'],
    errors: [['13', 'Przekroczenie odniesione do kosztu rzeczywistego.', 'Odnosi się je do budżetu.']],
  }),
  numeric({
    id: 'bj-p-3',
    skill: 'biz-project-planning',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Projekt ma zadania: A (3 dni), B (5 dni, może się zacząć po A), C (2 dni, po A), D (4 dni, po zakończeniu B i C). Zadania B i C mogą trwać równolegle. Ile dni trwa cały projekt?',
    answer: 12,
    verify: () => 3 + Math.max(5, 2) + 4,
    hints: ['Czy czas projektu to suma wszystkich zadań?', 'Nie — B i C trwają równolegle.', 'Które zadanie z pary B, C decyduje o starcie D?', 'Dłuższe — D czeka na oba.'],
    steps: ['A trwa 3 dni, potem równolegle B (5) i C (2) — D startuje po 5 dniach.', 'Czas projektu: 3 + 5 + 4 = 12 dni (ścieżka krytyczna A–B–D).'],
    errors: [['14', 'Zsumowane wszystkie zadania.', 'Zadania równoległe nie sumują się.']],
  }),
  numeric({
    id: 'bj-p-4',
    skill: 'biz-project-planning',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'W projekcie z poprzedniego zadania (A: 3 dni; B: 5 dni po A; C: 2 dni po A; D: 4 dni po B i C) ile dni zapasu ma zadanie C, czyli o ile może się opóźnić bez opóźnienia całego projektu?',
    answer: 3,
    verify: () => 5 - 2,
    hints: ['Na co czeka zadanie D?', 'Na zakończenie obu zadań: B i C.', 'Które z nich kończy się później?', 'B — różnica czasów B i C to zapas zadania C.'],
    steps: ['D startuje po zakończeniu B (5 dni po A).', 'C trwa 2 dni, więc może się opóźnić o 5 − 2 = 3 dni.'],
    errors: [['0', 'Uznano C za zadanie krytyczne.', 'Na ścieżce krytycznej leży B, nie C.']],
  }),
  choice({
    id: 'bj-p-5',
    skill: 'biz-project-planning',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Klient w trakcie projektu żąda dodatkowych funkcji, ale nie zgadza się na zmianę terminu ani budżetu. Na jakie ryzyko to wskazuje?',
    choices: ['ryzyko rozrastania się zakresu projektu', 'ryzyko rynkowe — spadek popytu na produkt', 'ryzyko kadrowe — odejście członków zespołu', 'żadne — dodatkowe funkcje podniosą jakość'],
    answer: 'A',
    hints: ['Jakie trzy wielkości są ze sobą powiązane w projekcie?', 'Zakres, czas i koszt.', 'Co się dzieje, gdy zakres rośnie, a czas i koszt stoją w miejscu?', 'Coś musi ucierpieć — zwykle jakość albo terminowość.'],
    steps: ['Dodatkowe funkcje zwiększają zakres.', 'Przy stałym czasie i budżecie zagrożona jest realizacja — trójkąt ograniczeń.'],
    errors: [
      ['B', 'Nie ma mowy o popycie.', 'Chodzi o rozrastanie się zakresu.'],
      ['C', 'Nie ma mowy o odejściach.', 'Chodzi o rozrastanie się zakresu.'],
      ['D', 'Przy stałym czasie i budżecie większy zakres zagraża jakości lub terminowi.', 'Trzeba ocenić wpływ zmiany (trójkąt ograniczeń).'],
    ],
  }),
  choice({
    id: 'bj-p-6',
    skill: 'biz-project-planning',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Zadanie leżące na ścieżce krytycznej opóźniło się o 4 dni. Które działanie kierownika pozwoli dotrzymać terminu końcowego?',
    choices: ['skrócenie kolejnych zadań na ścieżce krytycznej', 'skrócenie zadania, które ma 10 dni zapasu', 'czekanie — opóźnienie odrobi się na zadaniach z zapasem', 'przesunięcie terminu końcowego bez zgody sponsora'],
    answer: 'A',
    hints: ['Co wyznacza czas trwania całego projektu?', 'Ścieżka krytyczna.', 'Czy przyspieszenie zadania z zapasem skróci projekt?', 'Nie — trzeba skrócić zadania krytyczne.'],
    steps: ['Opóźnienie na ścieżce krytycznej przesuwa koniec projektu.', 'Nadrobić je można tylko, skracając kolejne zadania krytyczne (kosztem zasobów).'],
    errors: [
      ['B', 'Zadanie z zapasem nie wpływa na termin końcowy.', 'Skracać trzeba zadania krytyczne.'],
      ['C', 'Zapas zadań niekrytycznych nie skraca ścieżki krytycznej.', 'Trzeba skrócić zadania krytyczne.'],
      ['D', 'To zmiana terminu, a nie jego dotrzymanie.', 'Skracać trzeba zadania krytyczne.'],
    ],
  }),
  choice({
    id: 'bj-p-7',
    skill: 'biz-project-planning',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Po zakończeniu projektu zespół spisuje, co zadziałało, jakie problemy wystąpiły i co zmienić w przyszłości. Czemu to służy?',
    choices: ['wyciągnięciu wniosków na przyszłość (lessons learned)', 'rozliczeniu premii dla członków zespołu', 'przygotowaniu harmonogramu tego projektu', 'zatwierdzeniu budżetu kolejnego etapu'],
    answer: 'A',
    hints: ['Na którym etapie cyklu życia odbywa się to podsumowanie?', 'Na etapie zamknięcia.', 'Co zespół zyskuje, analizując przebieg projektu?', 'Wiedzę, która poprawi kolejne projekty.'],
    steps: ['Podsumowanie na zamknięciu to „lessons learned”.', 'Wnioski poprawiają planowanie i realizację kolejnych projektów.'],
    errors: [
      ['B', 'Premie to osobna sprawa.', 'To etap zamknięcia i wniosków.'],
      ['C', 'Harmonogram powstaje przy planowaniu.', 'To etap zamknięcia i wniosków.'],
      ['D', 'Projekt się zakończył — nie ma kolejnego etapu.', 'To etap zamknięcia i wniosków.'],
    ],
  }),

  // biz-teamwork-creativity ---------------------------------------------------
  choice({
    id: 'bj-t-1',
    skill: 'biz-teamwork-creativity',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Która zasada obowiązuje w pierwszej fazie burzy mózgów?',
    choices: ['zgłaszamy jak najwięcej pomysłów i nie krytykujemy ich', 'każdy pomysł od razu oceniamy i odrzucamy słabe', 'głos ma tylko lider zespołu', 'zapisujemy wyłącznie pomysły możliwe do realizacji'],
    answer: 'A',
    hints: ['Co w burzy mózgów jest ważniejsze na początku — ilość czy ocena?', 'Ilość.', 'Co blokuje ludzi przed zgłaszaniem pomysłów?', 'Strach przed krytyką — dlatego ocenę odkłada się na później.'],
    steps: ['W pierwszej fazie liczy się ilość pomysłów i zakaz krytyki.', 'Ocena i selekcja następują w drugiej fazie.'],
    errors: [
      ['B', 'Ocena na starcie hamuje kreatywność.', 'Krytykę odkłada się na później.'],
      ['C', 'Burza mózgów angażuje wszystkich.', 'Każdy zgłasza pomysły.'],
      ['D', 'Na starcie zapisuje się wszystko.', 'Selekcja jest później.'],
    ],
  }),
  choice({
    id: 'bj-t-2',
    skill: 'biz-teamwork-creativity',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Od którego etapu zaczyna się proces design thinking?',
    choices: ['od empatii — zrozumienia potrzeb użytkowników', 'od zbudowania prostego prototypu', 'od zdefiniowania problemu do rozwiązania', 'od burzy mózgów i generowania pomysłów'],
    answer: 'A',
    hints: ['Kto jest w centrum design thinking?', 'Użytkownik.', 'Co trzeba zrobić, zanim zaprojektujesz rozwiązanie dla ludzi?', 'Zrozumieć ich potrzeby i problemy.'],
    steps: ['Design thinking zaczyna się od empatii.', 'Dalej: definiowanie problemu, pomysły, prototyp, test.'],
    errors: [
      ['B', 'Prototyp to czwarty etap.', 'Start to empatia.'],
      ['C', 'Definiowanie to drugi etap — po empatii.', 'Start to empatia.'],
      ['D', 'Generowanie pomysłów to trzeci etap.', 'Start to empatia.'],
    ],
  }),
  choice({
    id: 'bj-t-3',
    skill: 'biz-teamwork-creativity',
    kind: 'typical',
    difficulty: 3,
    prompt: 'W zespole projektowym dwie osoby wykonują większość pracy, a reszta liczy na to, że „jakoś to będzie”. Jak nazywa się to zjawisko i co najlepiej mu przeciwdziała?',
    choices: ['próżniactwo społeczne; imienny podział zadań i terminów', 'efekt synergii; dołączenie nowych osób do zespołu', 'myślenie grupowe; zaproszenie krytycznego eksperta', 'konflikt w zespole; mediacja z udziałem kierownika'],
    answer: 'A',
    hints: ['Dlaczego część osób w grupie się nie angażuje?', 'Bo ich wkład „rozmywa się” w grupie.', 'Jak sprawić, żeby każdy czuł odpowiedzialność?', 'Przypisać konkretne zadania konkretnym osobom.'],
    steps: ['Zmniejszone zaangażowanie w grupie to próżniactwo społeczne.', 'Pomaga imienny podział zadań, terminy i widoczność wkładu każdego.'],
    errors: [
      ['B', 'Synergia to korzyść ze współpracy.', 'Opisane zjawisko to próżniactwo społeczne.'],
      ['C', 'Myślenie grupowe to dążenie do zgody kosztem krytyki.', 'Opisane zjawisko to próżniactwo społeczne.'],
      ['D', 'Nie opisano konfliktu, tylko mały wkład części osób.', 'Opisane zjawisko to próżniactwo społeczne.'],
    ],
  }),
  text({
    id: 'bj-t-4',
    skill: 'biz-teamwork-creativity',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij: metoda, w której uczestnicy kolejno patrzą na problem z sześciu perspektyw (m.in. faktów, emocji, ryzyk i korzyści), to sześć myślowych ________ de Bono.',
    answer: 'kapeluszy',
    variants: ['kapelusze'],
    hints: ['Co „zakładają” uczestnicy, zmieniając perspektywę?', 'Symboliczne nakrycie głowy w innym kolorze.', 'Jak nazywa się to nakrycie głowy?', 'Autor metody to Edward de Bono.'],
    steps: ['Metoda de Bono to sześć myślowych kapeluszy.', 'Każdy kolor oznacza inną perspektywę myślenia.'],
    errors: [['map', 'Pomylono z mapą myśli.', 'Sześć perspektyw to kapelusze de Bono.']],
  }),
  choice({
    id: 'bj-t-5',
    skill: 'biz-teamwork-creativity',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Zespół zbudował prosty papierowy model nowego kiosku samoobsługowego i obserwuje, jak klienci próbują z niego korzystać. Które dwa etapy design thinking tu zachodzą?',
    choices: ['prototypowanie i testowanie', 'empatia i definiowanie problemu', 'definiowanie problemu i generowanie pomysłów', 'wyłącznie generowanie pomysłów'],
    answer: 'A',
    hints: ['Czym jest papierowy model?', 'Szybkim, tanim prototypem.', 'Co robi zespół, obserwując klientów przy modelu?', 'Sprawdza rozwiązanie w praktyce — testuje.'],
    steps: ['Papierowy model to prototyp.', 'Obserwacja użytkowników przy prototypie to testowanie.'],
    errors: [
      ['B', 'Empatia poprzedza projektowanie.', 'Tu jest prototyp i test.'],
      ['C', 'Te etapy są wcześniej.', 'Tu jest prototyp i test.'],
      ['D', 'Pomysł już zmaterializowano w modelu.', 'Tu jest prototyp i test.'],
    ],
  }),
  choice({
    id: 'bj-t-6',
    skill: 'biz-teamwork-creativity',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Kierownik projektu chce utrzymać motywację zespołu w długim, trudnym projekcie. Które działanie jest najskuteczniejsze według zasad pracy zespołowej?',
    choices: ['cele pośrednie, świętowanie kamieni milowych i informacja zwrotna', 'unikanie rozmów o postępach, by nikogo nie stresować', 'publiczne krytykowanie osób, które się spóźniają', 'obietnica nagrody wyłącznie po zakończeniu całego projektu'],
    answer: 'A',
    hints: ['Co się dzieje z motywacją, gdy cel jest bardzo odległy?', 'Słabnie — nie widać postępów.', 'Jak sprawić, żeby postęp był widoczny?', 'Podzielić drogę na etapy i doceniać ich osiągnięcie.'],
    steps: ['Pośrednie cele i kamienie milowe pokazują postęp.', 'Docenianie i informacja zwrotna podtrzymują zaangażowanie.'],
    errors: [
      ['B', 'Brak informacji zwrotnej osłabia motywację.', 'Postępy warto omawiać.'],
      ['C', 'Publiczna krytyka niszczy zaufanie.', 'Informację zwrotną daje się rzeczowo.'],
      ['D', 'Odległa nagroda słabo motywuje w trakcie.', 'Potrzebne są cele pośrednie.'],
    ],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const PROJ_CARDS: Flashcard[] = [
  card('c-bj-b-1', 'biz-project-basics', 'definicja', 'Projekt a proces?', 'Projekt: jednorazowy, z celem, terminem, budżetem. Proces: działanie powtarzalne.'),
  card('c-bj-b-2', 'biz-project-basics', 'definicja', 'Kaskadowe czy zwinne?', 'Kaskadowe: stabilne wymagania. Zwinne (Scrum): zmienne wymagania, krótkie iteracje.'),

  card('c-bj-p-1', 'biz-project-planning', 'definicja', 'Ścieżka krytyczna?', 'Najdłuższy ciąg zależnych zadań — wyznacza czas projektu; brak zapasu.'),
  card('c-bj-p-2', 'biz-project-planning', 'definicja', 'Trójkąt ograniczeń?', 'Zakres, czas, koszt — zmiana jednego wpływa na pozostałe.'),

  card('c-bj-t-1', 'biz-teamwork-creativity', 'metoda', 'Zasady burzy mózgów?', 'Najpierw ilość pomysłów i zakaz krytyki, ocena później.'),
  card('c-bj-t-2', 'biz-teamwork-creativity', 'definicja', 'Etapy design thinking?', 'Empatia, definiowanie problemu, pomysły, prototyp, test.'),
];

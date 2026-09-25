import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, text, tip, warn } from '../../authoring';

/**
 * Biznes i zarządzanie, dział 1: rynek i mechanizm rynkowy.
 *
 * Podstawa programowa 2024 (Dz.U. 2024 poz. 1019), zakres podstawowy III.2–III.5
 * i rozszerzony II.1–II.8, II.22 (UOKiK).
 */

export const MARKET_TOPIC: Topic = {
  id: 'biz-market-topic',
  subjectId: 'biz',
  name: 'Rynek i mechanizm rynkowy',
  summary: 'Rzadkość i czynniki produkcji, popyt, podaż i równowaga, ceny minimalne i maksymalne, struktury rynkowe i ochrona konkurencji.',
};

export const MARKET_SKILLS: Skill[] = [
  {
    id: 'biz-scarcity',
    topicId: 'biz-market-topic',
    name: 'Rzadkość, koszt alternatywny i czynniki produkcji',
    level: 'PR',
    ckeRequirement: 'Rzadkość i jej rola, czynniki produkcji, podmioty gospodarki rynkowej (ZR II.1, II.2; ZP III.2, III.5)',
    prerequisites: [],
    examValue: 0.6,
  },
  {
    id: 'biz-supply-demand',
    topicId: 'biz-market-topic',
    name: 'Popyt, podaż i równowaga rynkowa',
    level: 'PR',
    ckeRequirement: 'Prawo popytu i podaży, analiza wykresów z przesunięciem równowagi, wpływ konsumentów na ceny (ZP III.4; ZR II.6, II.8)',
    prerequisites: ['biz-scarcity'],
    examValue: 0.95,
  },
  {
    id: 'biz-price-controls',
    topicId: 'biz-market-topic',
    name: 'Ceny maksymalne i minimalne',
    level: 'PR',
    ckeRequirement: 'Wpływ ceny minimalnej i maksymalnej na sytuację rynkową, nadwyżka i niedobór (ZR II.6, II.7)',
    prerequisites: ['biz-supply-demand'],
    examValue: 0.75,
  },
  {
    id: 'biz-market-structures',
    topicId: 'biz-market-topic',
    name: 'Struktury rynkowe i ochrona konkurencji',
    level: 'PR',
    ckeRequirement: 'Monopol, oligopol, konkurencja monopolistyczna i doskonała; praktyki ograniczające konkurencję; UOKiK (ZR II.3–II.5, II.22)',
    prerequisites: ['biz-supply-demand'],
    examValue: 0.75,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const MARKET_LESSONS: Lesson[] = [
  {
    skillId: 'biz-scarcity',
    minutes: 12,
    intro:
      'Ekonomia zaczyna się od prostego faktu: potrzeby ludzi są nieograniczone, a zasoby — czas, pieniądze, surowce — ograniczone. To jest rzadkość. Dlatego ciągle wybieramy, a każdy wybór ma swoją cenę: to, z czego rezygnujemy.',
    blocks: [
      p('Koszt alternatywny (koszt utraconych możliwości) to wartość NAJLEPSZEJ z odrzuconych opcji. Jeśli zamiast pracy za 180 zł idziesz na kurs za 80 zł, kurs kosztuje Cię 80 zł wydatku i 180 zł, których nie zarobisz — razem 260 zł.'),
      p('Czynniki produkcji to zasoby, z których powstają dobra: ziemia (zasoby naturalne), praca (wysiłek ludzi), kapitał (maszyny, budynki, narzędzia — rzeczy wytworzone po to, by produkować) i przedsiębiorczość — umiejętność połączenia pozostałych czynników i podjęcia ryzyka.'),
      p('Podmioty gospodarki: gospodarstwa domowe dostarczają pracę i kupują dobra, przedsiębiorstwa zatrudniają i sprzedają, a państwo pobiera podatki i dostarcza dobra publiczne. Pieniądz płynie w jedną stronę, dobra i praca — w drugą.'),
      tip('Na egzaminie „kapitał” to nie pieniądze na koncie, tylko środki produkcji: maszyny, komputery, budynki firmy.'),
      warn('Koszt alternatywny to wartość jednej, najlepszej odrzuconej opcji — nie suma wszystkich odrzuconych możliwości.'),
    ],
    examples: [
      example(
        'Stolarnia może zrobić w miesiącu 100 stołów albo 400 krzeseł. Ile krzeseł „kosztuje” jeden stół?',
        [['Rezygnując ze 100 stołów, zyskujesz 400 krzeseł.', 'koszt alternatywny w jednostkach dobra'], '400 : 100 = 4.'],
        '4 krzesła',
      ),
      example(
        'Do jakiego czynnika produkcji należy ciężarówka firmy transportowej?',
        ['To rzecz wytworzona przez ludzi, służąca do świadczenia usług.', 'Takie środki to kapitał.'],
        'kapitał',
      ),
    ],
    pitfalls: ['Liczenie kosztu alternatywnego jako sumy wszystkich odrzuconych opcji.', 'Mylenie kapitału z pieniędzmi.', 'Pomijanie przedsiębiorczości wśród czynników produkcji.'],
  },
  {
    skillId: 'biz-supply-demand',
    minutes: 15,
    intro:
      'Rynek to spotkanie kupujących (popyt) i sprzedających (podaż). Gdy cena rośnie, kupujący chcą kupić mniej, a sprzedający chcą sprzedać więcej. Cena, przy której te ilości są równe, to cena równowagi.',
    blocks: [
      p('Prawo popytu: im wyższa cena, tym mniejsza ilość kupowana (krzywa popytu opada). Prawo podaży: im wyższa cena, tym większa ilość oferowana (krzywa podaży rośnie). Zmiana CENY dobra to ruch po krzywej, a zmiana INNYCH czynników przesuwa całą krzywą.'),
      p('Popyt przesuwa się w prawo, gdy rosną dochody (dobra normalne), rośnie popularność (reklama, moda), drożeją substytuty albo tanieją dobra komplementarne. Podaż przesuwa się w prawo, gdy tanieją czynniki produkcji, poprawia się technologia albo państwo dopłaca do produkcji; w lewo — gdy rosną koszty albo podatki.'),
      f('Q_d = Q_s \\;\\Rightarrow\\; 100 - 2P = 20 + 2P \\;\\Rightarrow\\; P = 20,\\; Q = 60', 'Równowaga z funkcji popytu i podaży.'),
      tip('Przesunięcie popytu w prawo podnosi cenę i ilość równowagi. Przesunięcie podaży w prawo obniża cenę, a ilość zwiększa. Narysuj szkic — zajmuje 10 sekund i chroni przed pomyłką.'),
      warn('Gdy obie krzywe przesuwają się jednocześnie, jedna z wielkości (cena albo ilość) zmienia się w znany sposób, a drugiej nie da się określić bez liczb.'),
    ],
    examples: [
      example(
        'Kampania reklamowa zwiększyła popularność produktu. Co się stanie z ceną i ilością równowagi?',
        [['Popularność to czynnik pozacenowy popytu — krzywa popytu przesuwa się w prawo.', 'podaż się nie zmienia'], 'Nowa równowaga leży wyżej i dalej w prawo.'],
        'cena i ilość rosną',
      ),
      example(
        'Oblicz równowagę dla $Q_d = 120 - 3P$ i $Q_s = 2P - 10$.',
        ['$120 - 3P = 2P - 10$, więc $5P = 130$, $P = 26$.', '$Q = 2 \\cdot 26 - 10 = 42$.'],
        '$P = 26$, $Q = 42$',
      ),
    ],
    pitfalls: ['Uznanie zmiany ceny dobra za przesunięcie krzywej popytu.', 'Pomylenie kierunku przesunięcia podaży przy wzroście kosztów.', 'Wyciąganie wniosku o cenie, gdy obie krzywe przesunęły się w prawo.'],
  },
  {
    skillId: 'biz-price-controls',
    minutes: 12,
    intro:
      'Czasem państwo nie pozwala cenie ustalić się swobodnie. Cena maksymalna (najwyższa dopuszczalna) ma chronić kupujących, a cena minimalna (najniższa dopuszczalna) — sprzedających lub pracowników. Obie zmieniają ilość kupowaną i oferowaną.',
    blocks: [
      p('Cena maksymalna działa tylko wtedy, gdy jest NIŻSZA od ceny równowagi. Przy niskiej cenie kupujący chcą więcej, sprzedający oferują mniej — powstaje niedobór (kolejki, czarny rynek, spadek jakości).'),
      p('Cena minimalna działa tylko wtedy, gdy jest WYŻSZA od ceny równowagi. Sprzedający oferują więcej, kupujący chcą mniej — powstaje nadwyżka. Przykład z rynku pracy: płaca minimalna powyżej równowagi może zwiększać bezrobocie.'),
      f('\\text{niedobór} = Q_d - Q_s \\qquad \\text{nadwyżka} = Q_s - Q_d', 'Liczone przy cenie ustalonej przez państwo.'),
      tip('Najpierw policz cenę równowagi, potem sprawdź, czy cena urzędowa w ogóle „wiąże”. Cena maksymalna powyżej równowagi niczego nie zmienia.'),
      warn('Niedobór i nadwyżkę liczysz przy cenie urzędowej, a nie przy cenie równowagi.'),
    ],
    examples: [
      example(
        'Dla $Q_d = 100 - 2P$ i $Q_s = 20 + 2P$ ustalono cenę maksymalną 15. Jaki powstanie niedobór?',
        [['Równowaga to P = 20, więc cena 15 wiąże.', 'jest niższa od równowagi'], '$Q_d = 70$, $Q_s = 50$ — niedobór 20.'],
        '20 sztuk',
      ),
      example(
        'Co się stanie, gdy cena minimalna zostanie ustalona poniżej ceny równowagi?',
        ['Rynek i tak ustala cenę wyższą od minimalnej.', 'Przepis nie wpływa na transakcje.'],
        'nic — cena minimalna nie działa',
      ),
    ],
    pitfalls: ['Liczenie niedoboru przy cenie równowagi.', 'Pomylenie niedoboru z nadwyżką.', 'Uznanie ceny maksymalnej powyżej równowagi za skuteczną.'],
  },
  {
    skillId: 'biz-market-structures',
    minutes: 13,
    intro:
      'Rynki różnią się liczbą sprzedawców i tym, jak bardzo ich produkty się od siebie różnią. Od tej struktury zależy, jak duży wpływ na cenę ma pojedyncza firma — i czy konsument ma wybór.',
    blocks: [
      p('Konkurencja doskonała: bardzo wielu sprzedawców identycznego produktu, swobodne wejście na rynek, nikt nie wpływa na cenę (np. hurtowy rynek zboża). Konkurencja monopolistyczna: wielu sprzedawców produktów zróżnicowanych (kawiarnie, fryzjerzy). Oligopol: kilka dużych firm, które obserwują swoje ruchy (operatorzy komórkowi, stacje paliw). Monopol: jeden sprzedawca bez bliskich substytutów.'),
      p('Ograniczona konkurencja oznacza zwykle wyższe ceny, mniejszy wybór i słabszą motywację do innowacji. Dlatego prawo zakazuje porozumień ograniczających konkurencję (zmowy cenowe, podział rynku) i nadużywania pozycji dominującej (np. narzucania nieuczciwych cen).'),
      p('W Polsce konkurencji i konsumentów pilnuje Urząd Ochrony Konkurencji i Konsumentów (UOKiK), który może nałożyć na firmę karę do 10% obrotu. Pojedynczym konsumentom pomagają miejscy i powiatowi rzecznicy konsumentów.'),
      tip('Pytanie diagnostyczne: ilu jest sprzedawców i czy ich produkty są takie same? Te dwie odpowiedzi wskazują strukturę rynku.'),
      warn('Duża firma to jeszcze nie monopol — liczy się, czy klient ma realną alternatywę.'),
    ],
    examples: [
      example(
        'Do jakiej struktury należy rynek usług fryzjerskich w dużym mieście?',
        [['Wielu sprzedawców, każdy oferuje trochę inną usługę.', 'zróżnicowany produkt'], 'Łatwo otworzyć nowy salon.'],
        'konkurencja monopolistyczna',
      ),
      example(
        'Trzy firmy produkujące cement umawiają się, że żadna nie obniży ceny. Jak to ocenić?',
        ['To porozumienie cenowe (kartel) ograniczające konkurencję.', 'Jest zakazane — może je ukarać UOKiK.'],
        'niedozwolona zmowa cenowa',
      ),
    ],
    pitfalls: ['Mylenie oligopolu z monopolem.', 'Uznanie konkurencji monopolistycznej za rodzaj monopolu.', 'Przekonanie, że UOKiK rozpatruje każdą indywidualną reklamację.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

export const MARKET_QUESTIONS: Question[] = [
  // biz-scarcity --------------------------------------------------------------
  choice({
    id: 'bm-r-1',
    skill: 'biz-scarcity',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Na czym polega rzadkość w rozumieniu ekonomii?',
    choices: [
      'zasoby są ograniczone w porównaniu z nieograniczonymi potrzebami ludzi',
      'niektóre dobra występują tylko w jednym kraju',
      'towaru jest mniej, niż chcieliby kupić klienci przy cenie równowagi',
      'rzadko kupowane dobra są droższe',
    ],
    answer: 'A',
    hints: ['Czym różni się ilość potrzeb od ilości zasobów?', 'Potrzeby ludzi stale rosną i się odnawiają.', 'Czas, surowce i pieniądze mają swoje granice.', 'Z tej różnicy wynika konieczność wyboru.'],
    steps: ['Potrzeby są nieograniczone, zasoby ograniczone.', 'To zmusza do wyborów — i jest podstawą ekonomii.'],
    errors: [
      ['B', 'Pomylono rzadkość z lokalnym występowaniem.', 'Rzadkość dotyczy wszystkich zasobów.'],
      ['C', 'Przy cenie równowagi nie ma niedoboru.', 'Rzadkość to relacja zasobów do potrzeb.'],
      ['D', 'Częstość zakupu nie definiuje rzadkości.', 'Rzadkość to ograniczoność zasobów.'],
    ],
  }),
  choice({
    id: 'bm-r-2',
    skill: 'biz-scarcity',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Do którego czynnika produkcji należą maszyny szwalnicze w zakładzie odzieżowym?',
    choices: ['kapitał', 'praca', 'ziemia', 'przedsiębiorczość'],
    answer: 'A',
    hints: ['Czy maszyny są zasobem naturalnym, wysiłkiem ludzi, czy rzeczą wytworzoną do produkcji?', 'Maszyny zostały wytworzone przez ludzi.', 'Służą do wytwarzania innych dóbr.', 'Takie środki produkcji ekonomiści nazywają…'],
    steps: ['Maszyny to środki produkcji wytworzone przez ludzi.', 'Należą do kapitału.'],
    errors: [
      ['B', 'Praca to wysiłek ludzi.', 'Maszyny to kapitał.'],
      ['C', 'Ziemia to zasoby naturalne.', 'Maszyny to kapitał.'],
      ['D', 'Przedsiębiorczość to umiejętność łączenia czynników.', 'Maszyny to kapitał.'],
    ],
  }),
  text({
    id: 'bm-r-3',
    skill: 'biz-scarcity',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Uzupełnij jednym słowem: wartość najlepszej z możliwości, z których zrezygnowano, dokonując wyboru, to koszt ________.',
    answer: 'alternatywny',
    variants: ['utraconych możliwości', 'utraconych korzyści'],
    hints: ['Jak ekonomiści nazywają „cenę” rezygnacji z najlepszej innej opcji?', 'Chodzi o koszt, który nie jest wydatkiem pieniężnym.', 'To koszt wyboru jednej z alternatyw.', 'Nazwa pochodzi od słowa „alternatywa”.'],
    steps: ['Wartość najlepszej odrzuconej opcji to koszt alternatywny.', 'Inaczej: koszt utraconych możliwości.'],
    errors: [['całkowity', 'Pomylono z kosztem całkowitym produkcji.', 'Koszt alternatywny to wartość najlepszej odrzuconej opcji.']],
  }),
  numeric({
    id: 'bm-r-4',
    skill: 'biz-scarcity',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ola może w sobotę pracować 6 godzin za 30 zł za godzinę albo pójść na warsztaty fotograficzne, za które musi zapłacić 80 zł. Jaki jest koszt alternatywny wybrania warsztatów (w zł)?',
    answer: 260,
    verify: () => 80 + 6 * 30,
    hints: ['Z czego Ola rezygnuje, idąc na warsztaty?', 'Z zarobku za cały dzień pracy.', 'Do tego dochodzi opłata za warsztaty.', 'Zsumuj utracony zarobek i poniesiony wydatek.'],
    steps: ['Utracony zarobek: 6 · 30 zł = 180 zł.', 'Razem z opłatą: 180 + 80 = 260 zł.'],
    errors: [['180', 'Pominięta opłata za warsztaty.', 'Koszt obejmuje wydatek i utracony zarobek.']],
  }),
  choice({
    id: 'bm-r-5',
    skill: 'biz-scarcity',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Który przepływ łączy w gospodarce gospodarstwa domowe z przedsiębiorstwami na rynku czynników produkcji?',
    choices: [
      'gospodarstwa domowe oferują pracę, a przedsiębiorstwa płacą im wynagrodzenia',
      'przedsiębiorstwa oferują pracę, a gospodarstwa domowe płacą im podatki',
      'gospodarstwa domowe kupują dobra, a przedsiębiorstwa płacą im czynsz',
      'państwo zatrudnia przedsiębiorstwa, a gospodarstwa domowe płacą cła',
    ],
    answer: 'A',
    hints: ['Kto jest właścicielem pracy jako czynnika produkcji?', 'Ludzie, czyli gospodarstwa domowe.', 'Kto kupuje pracę na rynku czynników produkcji?', 'Przedsiębiorstwa, płacąc za nią wynagrodzenie.'],
    steps: ['Na rynku czynników produkcji gospodarstwa domowe sprzedają pracę.', 'W zamian otrzymują od firm wynagrodzenia.'],
    errors: [
      ['B', 'Odwrócono role — pracę oferują ludzie.', 'Podatki trafiają do państwa, nie do firm.'],
      ['C', 'Zakup dóbr to rynek dóbr, nie czynników.', 'Na rynku czynników ludzie sprzedają pracę.'],
      ['D', 'Opis nie dotyczy przepływu między tymi podmiotami.', 'Kluczowy przepływ: praca za wynagrodzenie.'],
    ],
  }),
  choice({
    id: 'bm-r-6',
    skill: 'biz-scarcity',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Dlaczego przedsiębiorczość wyróżnia się wśród czynników produkcji?',
    choices: ['łączy pozostałe czynniki w działające przedsięwzięcie i ponosi ryzyko', 'jest jedynym czynnikiem produkcji, którego nie trzeba opłacać', 'to inaczej kapitał finansowy, którym dysponuje firma', 'występuje tylko w dużych firmach, które mają zarząd'],
    answer: 'A',
    hints: ['Czy sama maszyna, pole albo pracownik wystarczą, żeby powstał produkt?', 'Ktoś musi je połączyć i zorganizować.', 'Kto ponosi skutki, jeśli pomysł się nie uda?', 'Nagrodą za ryzyko jest zysk.'],
    steps: ['Przedsiębiorca organizuje pozostałe czynniki produkcji.', 'Ponosi ryzyko, a jego wynagrodzeniem jest zysk (albo strata).'],
    errors: [
      ['B', 'Wynagrodzeniem przedsiębiorczości jest zysk.', 'Przedsiębiorca łączy czynniki i ponosi ryzyko.'],
      ['C', 'Kapitał to odrębny czynnik.', 'Przedsiębiorczość to umiejętność, nie środki.'],
      ['D', 'Przedsiębiorczość dotyczy firm każdej wielkości.', 'Kluczowe są organizacja i ryzyko.'],
    ],
  }),
  numeric({
    id: 'bm-r-7',
    skill: 'biz-scarcity',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Piekarnia może w ciągu dnia upiec 300 bochenków chleba albo 1200 bułek (zamiana jest proporcjonalna). Ile bułek wynosi koszt alternatywny upieczenia jednego bochenka?',
    answer: 4,
    verify: () => 1200 / 300,
    hints: ['Z ilu bułek piekarnia rezygnuje, piekąc wszystkie bochenki?', 'Z 1200.', 'Ile bochenków w zamian zyskuje?', 'Podziel utracone bułki przez zyskane bochenki.'],
    steps: ['300 bochenków „kosztuje” 1200 bułek.', 'Jeden bochenek: 1200 : 300 = 4 bułki.'],
    errors: [['0,25', 'Odwrócony iloraz — to koszt jednej bułki w bochenkach.', 'Pytanie dotyczy kosztu bochenka.']],
  }),

  // biz-supply-demand ---------------------------------------------------------
  choice({
    id: 'bm-p-1',
    skill: 'biz-supply-demand',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Co mówi prawo popytu (przy pozostałych czynnikach niezmienionych)?',
    choices: ['wraz ze wzrostem ceny maleje ilość kupowanego dobra', 'wraz ze wzrostem ceny rośnie ilość kupowanego dobra', 'wraz ze wzrostem ceny rośnie ilość oferowanego dobra', 'cena nie wpływa na ilość kupowanego dobra'],
    answer: 'A',
    hints: ['Jak zachowujesz się jako kupujący, gdy produkt drożeje?', 'Zwykle kupujesz mniej albo szukasz zamiennika.', 'Prawo popytu dotyczy kupujących, nie sprzedających.', 'Krzywa popytu opada w prawo.'],
    steps: ['Wyższa cena — mniejsza ilość kupowana.', 'Zależność dotyczy kupujących; rosnąca oferta przy wyższej cenie to prawo podaży.'],
    errors: [
      ['B', 'Odwrócona zależność.', 'Przy wyższej cenie kupuje się mniej.'],
      ['C', 'To prawo podaży.', 'Prawo popytu dotyczy kupujących.'],
      ['D', 'Cena jest głównym czynnikiem popytu.', 'Popyt maleje przy wzroście ceny.'],
    ],
  }),
  choice({
    id: 'bm-p-2',
    skill: 'biz-supply-demand',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Które zdarzenie przesunie krzywą popytu na dobro normalne w prawo?',
    choices: ['wzrost dochodów konsumentów', 'spadek ceny tego dobra', 'wzrost kosztów produkcji tego dobra', 'potanienie dobra, które jest jego substytutem'],
    answer: 'A',
    hints: ['Czym różni się ruch po krzywej od przesunięcia krzywej?', 'Zmiana ceny samego dobra to ruch po krzywej.', 'Przesunięcie powodują czynniki pozacenowe.', 'Co się dzieje z zakupami dóbr normalnych, gdy ludzie zarabiają więcej?'],
    steps: ['Wyższe dochody zwiększają popyt na dobra normalne przy każdej cenie.', 'Spadek ceny dobra to ruch po krzywej, koszty dotyczą podaży, tańszy substytut zmniejsza popyt.'],
    errors: [
      ['B', 'Zmiana ceny dobra to ruch po krzywej.', 'Przesunięcie powodują czynniki pozacenowe.'],
      ['C', 'Koszty produkcji wpływają na podaż.', 'Popyt zależy od kupujących.'],
      ['D', 'Tańszy substytut zmniejsza popyt na to dobro.', 'Popyt przesunie się w lewo.'],
    ],
  }),
  choice({
    id: 'bm-p-3',
    skill: 'biz-supply-demand',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Popularny influencer zareklamował pewną markę napojów i stała się ona modna. Podaż się nie zmieniła. Co stanie się z ceną i ilością równowagi na rynku tych napojów?',
    choices: ['cena i ilość wzrosną', 'cena wzrośnie, a ilość spadnie', 'cena spadnie, a ilość wzrośnie', 'cena i ilość spadną'],
    answer: 'A',
    hints: ['Która krzywa się przesuwa — popytu czy podaży?', 'Moda to czynnik pozacenowy popytu.', 'W którą stronę przesuwa się popyt, gdy produkt staje się modny?', 'Narysuj nową krzywą popytu i znajdź jej przecięcie z niezmienioną podażą.'],
    steps: ['Popyt przesuwa się w prawo przy niezmienionej podaży.', 'Nowa równowaga: wyższa cena i większa ilość.'],
    errors: [
      ['B', 'Tak wyglądałoby przesunięcie podaży w lewo.', 'Tu przesuwa się popyt w prawo.'],
      ['C', 'Tak wyglądałoby przesunięcie podaży w prawo.', 'Tu przesuwa się popyt.'],
      ['D', 'Tak wyglądałby spadek popytu.', 'Moda zwiększa popyt.'],
    ],
  }),
  numeric({
    id: 'bm-p-4',
    skill: 'biz-supply-demand',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Popyt na rynku opisuje funkcja $Q_d = 100 - 2P$, a podaż $Q_s = 20 + 2P$ (P — cena w zł). Oblicz cenę równowagi.',
    answer: 20,
    verify: () => (100 - 20) / (2 + 2),
    hints: ['Jaki warunek spełnia cena równowagi?', 'Ilość kupowana równa się oferowanej.', 'Przyrównaj oba wzory: $100 - 2P = 20 + 2P$.', 'Przenieś wyrazy z P na jedną stronę.'],
    steps: ['$100 - 2P = 20 + 2P$, więc $80 = 4P$.', 'P = 20 zł.'],
    errors: [['60', 'Podana ilość równowagi zamiast ceny.', 'Pytanie dotyczy ceny P.']],
  }),
  numeric({
    id: 'bm-p-5',
    skill: 'biz-supply-demand',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Popyt opisuje funkcja $Q_d = 120 - 3P$, a podaż $Q_s = 2P - 10$. Oblicz ilość równowagi.',
    answer: 42,
    verify: () => {
      const cena = (120 + 10) / (3 + 2);
      return 2 * cena - 10;
    },
    hints: ['Co trzeba policzyć najpierw, żeby znaleźć ilość?', 'Cenę równowagi z równania $120 - 3P = 2P - 10$.', 'Cenę wstaw do dowolnej z funkcji.', 'Sprawdź wynik w drugiej funkcji — musi wyjść to samo.'],
    steps: ['$5P = 130$, więc P = 26.', '$Q = 2 \\cdot 26 - 10 = 120 - 3 \\cdot 26 = 42$.'],
    errors: [['26', 'Podana cena zamiast ilości.', 'Ilość otrzymasz, wstawiając cenę do funkcji.']],
  }),
  choice({
    id: 'bm-p-6',
    skill: 'biz-supply-demand',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Cena kakao na rynkach światowych gwałtownie wzrosła. Jak wpłynie to na rynek czekolady (przy niezmienionym popycie)?',
    choices: ['podaż przesunie się w lewo — cena wzrośnie, a ilość spadnie', 'popyt przesunie się w prawo — cena i ilość wzrosną', 'podaż przesunie się w prawo — cena spadnie, a ilość wzrośnie', 'nic się nie zmieni, bo kakao to nie czekolada'],
    answer: 'A',
    hints: ['Czym kakao jest dla producenta czekolady?', 'Surowcem — kosztem produkcji.', 'Co robi producent, gdy rosną koszty?', 'Przy każdej cenie oferuje mniej — podaż przesuwa się w lewo.'],
    steps: ['Droższy surowiec podnosi koszty — podaż przesuwa się w lewo.', 'Przy niezmienionym popycie cena rośnie, a ilość spada.'],
    errors: [
      ['B', 'Koszty wpływają na podaż, nie na popyt.', 'Przesuwa się krzywa podaży.'],
      ['C', 'Wyższe koszty zmniejszają podaż.', 'Podaż przesuwa się w lewo.'],
      ['D', 'Surowiec jest kosztem produkcji czekolady.', 'Zmiana kosztów przesuwa podaż.'],
    ],
  }),
  choice({
    id: 'bm-p-7',
    skill: 'biz-supply-demand',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Na rynku jednocześnie wzrósł popyt (nowa moda) i wzrosła podaż (tańsza technologia produkcji). Co na pewno można powiedzieć o nowej równowadze?',
    choices: ['ilość wzrośnie, a zmiana ceny jest nieokreślona', 'cena i ilość wzrosną, bo przeważy popyt', 'cena spadnie, a ilość wzrośnie, bo przeważy podaż', 'cena wzrośnie, a zmiany ilości nie da się określić'],
    answer: 'A',
    hints: ['Jak każde przesunięcie osobno działa na ilość?', 'Oba przesunięcia w prawo zwiększają ilość.', 'A jak działają na cenę?', 'Wzrost popytu podnosi cenę, wzrost podaży ją obniża — efekty się znoszą.'],
    steps: ['Oba przesunięcia zwiększają ilość równowagi.', 'Na cenę działają przeciwnie, więc bez wielkości przesunięć jej zmiany nie da się ustalić.'],
    errors: [
      ['B', 'Nie wiadomo, która zmiana przeważy — wzrost podaży obniża cenę.', 'Efekty cenowe są przeciwne.'],
      ['C', 'Nie wiadomo, która zmiana przeważy — wzrost popytu podnosi cenę.', 'Efekty cenowe są przeciwne.'],
      ['D', 'Obie zmiany zwiększają ilość.', 'Niepewna jest cena, nie ilość.'],
    ],
  }),

  // biz-price-controls --------------------------------------------------------
  choice({
    id: 'bm-c-1',
    skill: 'biz-price-controls',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Państwo ustaliło cenę maksymalną niższą od ceny równowagi. Co powstanie na rynku?',
    choices: ['niedobór', 'nadwyżka', 'równowaga przy wyższej cenie', 'nic się nie zmieni'],
    answer: 'A',
    hints: ['Jak kupujący reagują na niższą cenę?', 'Chcą kupić więcej.', 'A sprzedający?', 'Oferują mniej — ilość kupowana przewyższa oferowaną.'],
    steps: ['Przy cenie poniżej równowagi kupujący chcą więcej, sprzedający oferują mniej.', 'Brakuje towaru — niedobór.'],
    errors: [
      ['B', 'Nadwyżka powstaje przy cenie minimalnej powyżej równowagi.', 'Niska cena daje niedobór.'],
      ['C', 'Cena maksymalna nie pozwala cenie wzrosnąć.', 'Powstaje niedobór.'],
      ['D', 'Cena poniżej równowagi wiąże.', 'Zmienia ilości kupowane i oferowane.'],
    ],
  }),
  choice({
    id: 'bm-c-2',
    skill: 'biz-price-controls',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Płaca minimalna ustalona powyżej płacy równowagi na danym rynku pracy może prowadzić do:',
    choices: ['nadwyżki podaży pracy, czyli bezrobocia', 'niedoboru pracowników', 'spadku płac wszystkich pracowników', 'braku jakichkolwiek zmian'],
    answer: 'A',
    hints: ['Kto na rynku pracy oferuje pracę, a kto jej szuka?', 'Pracownicy oferują pracę (podaż), firmy jej szukają (popyt).', 'Jak obie strony reagują na wyższą płacę?', 'Więcej chętnych do pracy, mniej miejsc pracy.'],
    steps: ['Płaca minimalna to cena minimalna na rynku pracy.', 'Powyżej równowagi podaż pracy przewyższa popyt — powstaje bezrobocie.'],
    errors: [
      ['B', 'Niedobór powstaje przy cenie maksymalnej.', 'Cena minimalna powyżej równowagi daje nadwyżkę.'],
      ['C', 'Płaca minimalna nie obniża płac.', 'Skutkiem może być nadwyżka podaży pracy.'],
      ['D', 'Cena minimalna powyżej równowagi wiąże.', 'Zmienia ilości na rynku.'],
    ],
  }),
  numeric({
    id: 'bm-c-3',
    skill: 'biz-price-controls',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Na rynku $Q_d = 100 - 2P$ i $Q_s = 20 + 2P$. Państwo wprowadziło cenę maksymalną 15 zł. Oblicz wielkość niedoboru (w sztukach).',
    answer: 20,
    verify: () => 100 - 2 * 15 - (20 + 2 * 15),
    hints: ['Przy jakiej cenie liczysz ilości?', 'Przy cenie urzędowej, czyli 15 zł.', 'Policz ilość kupowaną i ilość oferowaną przy tej cenie.', 'Niedobór to różnica: kupowana minus oferowana.'],
    steps: ['$Q_d = 100 - 30 = 70$, $Q_s = 20 + 30 = 50$.', 'Niedobór: 70 − 50 = 20 sztuk.'],
    errors: [['60', 'Podana ilość równowagi.', 'Ilości liczy się przy cenie maksymalnej.']],
  }),
  numeric({
    id: 'bm-c-4',
    skill: 'biz-price-controls',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Na rynku $Q_d = 100 - 2P$ i $Q_s = 20 + 2P$. Państwo wprowadziło cenę minimalną 25 zł. Oblicz wielkość nadwyżki (w sztukach).',
    answer: 20,
    verify: () => 20 + 2 * 25 - (100 - 2 * 25),
    hints: ['Czy cena 25 zł jest wyższa od ceny równowagi?', 'Tak — równowaga to 20 zł, więc cena minimalna wiąże.', 'Policz ilość oferowaną i kupowaną przy 25 zł.', 'Nadwyżka to oferowana minus kupowana.'],
    steps: ['$Q_s = 20 + 50 = 70$, $Q_d = 100 - 50 = 50$.', 'Nadwyżka: 70 − 50 = 20 sztuk.'],
    errors: [['-20', 'Odjęte w złej kolejności.', 'Nadwyżka = ilość oferowana − ilość kupowana.']],
  }),
  choice({
    id: 'bm-c-5',
    skill: 'biz-price-controls',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Cena równowagi na rynku masła wynosi 7 zł. Rząd ustala cenę maksymalną 9 zł. Jaki będzie skutek?',
    choices: ['żaden — cena zostanie na poziomie 7 zł, bo limit nie wiąże', 'niedobór masła, jak przy każdej cenie maksymalnej', 'nadwyżka masła, bo producenci zechcą sprzedawać drożej', 'cena wzrośnie do 9 zł, bo sprzedawcy dojdą do limitu'],
    answer: 'A',
    hints: ['Co oznacza cena maksymalna dla sprzedawców?', 'Nie wolno sprzedawać drożej niż 9 zł.', 'Po ile sprzedawano masło bez przepisu?', 'Czy przepis w ogóle ogranicza transakcje po 7 zł?'],
    steps: ['Rynek ustala cenę 7 zł, niższą od dopuszczalnego maksimum.', 'Przepis niczego nie zmienia — nie wiąże.'],
    errors: [
      ['B', 'Niedobór powstaje tylko, gdy cena maksymalna jest poniżej równowagi.', 'Tu jest powyżej — przepis nie wiąże.'],
      ['C', 'Nadwyżkę tworzy cena minimalna powyżej równowagi.', 'Cena maksymalna nikogo nie zmusza do podwyżki.'],
      ['D', 'Maksimum nie wymusza podwyżki.', 'Rynek zostaje przy cenie 7 zł.'],
    ],
  }),
  numeric({
    id: 'bm-c-6',
    skill: 'biz-price-controls',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Na rynku $Q_d = 120 - 3P$ i $Q_s = 2P - 10$. Ustalono cenę minimalną 32 zł. Oblicz wielkość nadwyżki (w sztukach).',
    answer: 30,
    verify: () => 2 * 32 - 10 - (120 - 3 * 32),
    hints: ['Czy cena minimalna jest wyższa od ceny równowagi?', 'Równowaga to 26 zł — cena 32 zł wiąże.', 'Policz $Q_s$ i $Q_d$ przy cenie 32 zł.', 'Nadwyżka = oferowana − kupowana.'],
    steps: ['$Q_s = 64 - 10 = 54$, $Q_d = 120 - 96 = 24$.', 'Nadwyżka: 54 − 24 = 30 sztuk.'],
    errors: [['12', 'Pomyłka w liczeniu jednej z ilości.', 'Wstaw 32 do obu funkcji.']],
  }),
  choice({
    id: 'bm-c-7',
    skill: 'biz-price-controls',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Miasto wprowadziło maksymalny czynsz za wynajem mieszkań, niższy od rynkowego. Który skutek jest NAJMNIEJ prawdopodobny?',
    choices: ['wzrost liczby mieszkań oferowanych do wynajęcia', 'dłuższe poszukiwanie mieszkania przez najemców', 'nieoficjalne dopłaty „pod stołem”', 'mniejsze nakłady właścicieli na remonty'],
    answer: 'A',
    hints: ['Jak cena maksymalna poniżej równowagi wpływa na ilość oferowaną?', 'Właścicielom mniej opłaca się wynajmować.', 'Które skutki wynikają z niedoboru?', 'Kolejki, czarny rynek i spadek jakości — a nie większa oferta.'],
    steps: ['Niski czynsz zmniejsza ilość oferowaną, powstaje niedobór.', 'Niedobór daje kolejki, czarny rynek i gorszą jakość; wzrost oferty jest mało prawdopodobny.'],
    errors: [
      ['B', 'To typowy skutek niedoboru.', 'Pytanie dotyczy skutku najmniej prawdopodobnego.'],
      ['C', 'Czarny rynek to typowy skutek ceny maksymalnej.', 'Szukany jest skutek nieprawdopodobny.'],
      ['D', 'Spadek jakości to typowy skutek.', 'Szukany jest skutek nieprawdopodobny.'],
    ],
  }),

  // biz-market-structures -----------------------------------------------------
  choice({
    id: 'bm-s-1',
    skill: 'biz-market-structures',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Jak nazywa się struktura rynku, na którym działa tylko jeden sprzedawca dobra bez bliskich substytutów?',
    choices: ['monopol', 'oligopol', 'konkurencja monopolistyczna', 'konkurencja doskonała'],
    answer: 'A',
    hints: ['Ilu sprzedawców jest na takim rynku?', 'Jeden.', 'Czy klient ma zamiennik?', 'Nie — to pełna władza nad ceną.'],
    steps: ['Jeden sprzedawca i brak substytutów to monopol.', 'Oligopol ma kilku sprzedawców, konkurencja — wielu.'],
    errors: [
      ['B', 'Oligopol to kilku dużych sprzedawców.', 'Jeden sprzedawca to monopol.'],
      ['C', 'Tu jest wielu sprzedawców.', 'Jeden sprzedawca to monopol.'],
      ['D', 'Tu jest bardzo wielu sprzedawców.', 'Jeden sprzedawca to monopol.'],
    ],
  }),
  text({
    id: 'bm-s-2',
    skill: 'biz-market-structures',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Uzupełnij nazwę urzędu: w Polsce konkurencji i interesów konsumentów pilnuje Urząd Ochrony Konkurencji i ________.',
    answer: 'Konsumentów',
    variants: ['konsumentow'],
    hints: ['Jaki jest skrót tego urzędu?', 'UOKiK.', 'Co oznacza ostatnia litera skrótu?', 'Urząd chroni też kupujących.'],
    steps: ['UOKiK — Urząd Ochrony Konkurencji i Konsumentów.', 'Chroni konkurencję między firmami i interesy konsumentów.'],
    errors: [['klientów', 'Użyto innego słowa niż w nazwie urzędu.', 'Pełna nazwa: Urząd Ochrony Konkurencji i Konsumentów.']],
  }),
  choice({
    id: 'bm-s-3',
    skill: 'biz-market-structures',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Rynek usług telefonii komórkowej w Polsce tworzy kilku dużych operatorów, którzy uważnie śledzą swoje oferty. To przykład:',
    choices: ['oligopolu', 'monopolu', 'konkurencji doskonałej', 'konkurencji monopolistycznej'],
    answer: 'A',
    hints: ['Ilu jest głównych sprzedawców?', 'Kilku, i to dużych.', 'Czy decyzja jednego wpływa na pozostałych?', 'Tak — to cecha charakterystyczna jednej ze struktur.'],
    steps: ['Kilka dużych firm, które reagują na swoje ruchy, to oligopol.', 'Monopol to jedna firma, konkurencja — wiele.'],
    errors: [
      ['B', 'Operatorów jest kilku.', 'Kilka dużych firm to oligopol.'],
      ['C', 'Operatorzy wpływają na ceny i różnią się ofertą.', 'To oligopol.'],
      ['D', 'Tu jest bardzo wielu drobnych sprzedawców.', 'Kilka dużych firm to oligopol.'],
    ],
  }),
  choice({
    id: 'bm-s-4',
    skill: 'biz-market-structures',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Która cecha NIE dotyczy konkurencji doskonałej?',
    choices: ['sprzedawcy wyróżniają swoje produkty marką i reklamą', 'na rynku jest bardzo wielu kupujących i sprzedających', 'produkty wszystkich sprzedawców są jednakowe', 'wejście na rynek i wyjście z niego są swobodne'],
    answer: 'A',
    hints: ['Czy w konkurencji doskonałej produkty się od siebie różnią?', 'Nie — są jednorodne.', 'Czy wtedy marka i reklama mają sens?', 'Wyróżnianie produktów to cecha innej struktury.'],
    steps: ['W konkurencji doskonałej produkty są jednorodne — nie ma marek.', 'Wyróżnianie produktów to cecha konkurencji monopolistycznej.'],
    errors: [
      ['B', 'To cecha konkurencji doskonałej.', 'Szukamy cechy, która do niej nie pasuje.'],
      ['C', 'To cecha konkurencji doskonałej.', 'Szukamy cechy, która do niej nie pasuje.'],
      ['D', 'To cecha konkurencji doskonałej.', 'Szukamy cechy, która do niej nie pasuje.'],
    ],
  }),
  choice({
    id: 'bm-s-5',
    skill: 'biz-market-structures',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Który rynek najlepiej pasuje do konkurencji monopolistycznej?',
    choices: ['kawiarnie w dużym mieście', 'krajowa sieć przesyłu energii elektrycznej', 'rynek samolotów pasażerskich', 'hurtowy rynek pszenicy'],
    answer: 'A',
    hints: ['Jakie dwie cechy ma konkurencja monopolistyczna?', 'Wielu sprzedawców i zróżnicowane produkty.', 'Gdzie łatwo otworzyć nową firmę, a każda oferuje coś trochę innego?', 'Sieć przesyłowa ma jednego operatora, samoloty — dwóch dużych producentów.'],
    steps: ['Wiele kawiarni, każda z innym klimatem i ofertą — produkty zróżnicowane.', 'Sieć przesyłowa to monopol, samoloty — oligopol, pszenica — konkurencja doskonała.'],
    errors: [
      ['B', 'To monopol naturalny.', 'Konkurencja monopolistyczna ma wielu sprzedawców.'],
      ['C', 'To oligopol (kilku producentów).', 'Konkurencja monopolistyczna ma wielu sprzedawców.'],
      ['D', 'Pszenica jest jednorodna — to konkurencja doskonała.', 'Tu produkty są zróżnicowane.'],
    ],
  }),
  choice({
    id: 'bm-s-6',
    skill: 'biz-market-structures',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Które działanie przedsiębiorców jest niedozwoloną praktyką ograniczającą konkurencję?',
    choices: ['uzgodnienie jednakowych cen przez konkurujące sieci', 'obniżenie cen, żeby przyciągnąć klientów konkurencji', 'program lojalnościowy dla stałych klientów', 'wspólna akcja charytatywna kilku firm z branży'],
    answer: 'A',
    hints: ['Na czym polega konkurencja cenowa?', 'Każda firma sama decyduje o cenach, żeby przyciągnąć klientów.', 'Co się dzieje, gdy konkurenci umówią się co do cen?', 'Klient traci możliwość wyboru tańszej oferty — to zmowa.'],
    steps: ['Porozumienie cenowe konkurentów (kartel) jest zakazane.', 'Obniżki, programy lojalnościowe i akcje charytatywne są legalne.'],
    errors: [
      ['B', 'Obniżka ceny to przejaw konkurencji.', 'Zakazana jest zmowa cenowa.'],
      ['C', 'Program lojalnościowy jest legalny.', 'Zakazana jest zmowa cenowa.'],
      ['D', 'Wspólna akcja charytatywna nie ogranicza konkurencji.', 'Zakazana jest zmowa cenowa.'],
    ],
  }),
  choice({
    id: 'bm-s-7',
    skill: 'biz-market-structures',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Jedyna firma dostarczająca internet światłowodowy w małej gminie podniosła ceny o 40% i obniżyła jakość obsługi. Które zdanie najlepiej opisuje tę sytuację?',
    choices: ['brak konkurencji pozwala narzucać ceny — sprawę może zbadać UOKiK', 'to normalne działanie rynku — klienci zawsze mogą zrezygnować z usługi', 'wzrost ceny oznacza, że rynek jest w równowadze konkurencji doskonałej', 'sytuacji nie da się zmienić, bo monopol jest w Polsce zakazany z urzędu'],
    answer: 'A',
    hints: ['Jaką strukturę rynku opisano?', 'Jeden dostawca bez realnej alternatywy.', 'Czy sama pozycja dominująca jest nielegalna?', 'Nie — zakazane jest jej nadużywanie, np. narzucanie nieuczciwych cen.'],
    steps: ['Monopol lokalny daje firmie władzę nad ceną.', 'Nadużywanie pozycji dominującej jest zakazane — może je zbadać UOKiK.'],
    errors: [
      ['B', 'Klient bez alternatywy nie ma realnego wyboru.', 'To skutek braku konkurencji.'],
      ['C', 'W konkurencji doskonałej firma nie wpływa na cenę.', 'Tu działa monopol.'],
      ['D', 'Monopol nie jest zakazany sam w sobie.', 'Zakazane jest nadużywanie pozycji dominującej.'],
    ],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const MARKET_CARDS: Flashcard[] = [
  card('c-bm-r-1', 'biz-scarcity', 'definicja', 'Koszt alternatywny?', 'Wartość najlepszej z odrzuconych możliwości wyboru.'),
  card('c-bm-r-2', 'biz-scarcity', 'definicja', 'Cztery czynniki produkcji?', 'Ziemia, praca, kapitał, przedsiębiorczość.'),

  card('c-bm-p-1', 'biz-supply-demand', 'pulapka', 'Zmiana ceny dobra — ruch po krzywej czy przesunięcie?', 'Ruch po krzywej. Przesunięcie powodują czynniki pozacenowe.'),
  card('c-bm-p-2', 'biz-supply-demand', 'metoda', 'Jak policzyć cenę równowagi?', 'Przyrównaj funkcje: $Q_d = Q_s$.'),

  card('c-bm-c-1', 'biz-price-controls', 'wzor', 'Cena maksymalna poniżej równowagi daje…', 'Niedobór = $Q_d - Q_s$ przy cenie urzędowej.'),
  card('c-bm-c-2', 'biz-price-controls', 'wzor', 'Cena minimalna powyżej równowagi daje…', 'Nadwyżkę = $Q_s - Q_d$ przy cenie urzędowej.'),

  card('c-bm-s-1', 'biz-market-structures', 'definicja', 'Oligopol a konkurencja monopolistyczna?', 'Oligopol: kilka dużych firm. Konkurencja monopolistyczna: wiele firm ze zróżnicowanym produktem.'),
  card('c-bm-s-2', 'biz-market-structures', 'definicja', 'Co robi UOKiK?', 'Chroni konkurencję (zmowy, nadużycie pozycji dominującej) i zbiorowe interesy konsumentów.'),
];

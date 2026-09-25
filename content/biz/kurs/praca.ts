import type { Flashcard, Lesson, Question, Skill, Topic } from '@/data/types';
import { card, choice, example, f, numeric, p, text, tip, warn } from '../../authoring';

/**
 * Biznes i zarządzanie, dział 4: rynek pracy i zatrudnienie.
 *
 * Podstawa programowa 2024: ZP IV.5–IV.7, V.1–V.11; ZR IV.1–IV.17, V.16.
 * Stawki składek i podatku są podane w treści zadań — zmieniają się
 * co roku, a egzamin sprawdza umiejętność liczenia według podanych zasad.
 */

export const WORK_TOPIC: Topic = {
  id: 'biz-work-topic',
  subjectId: 'biz',
  name: 'Rynek pracy i zatrudnienie',
  summary: 'Mierniki rynku pracy i bezrobocie, kariera i rekrutacja, formy zatrudnienia i prawa pracownika, wynagrodzenie brutto i netto, etyka w pracy i mobbing.',
};

export const WORK_SKILLS: Skill[] = [
  {
    id: 'biz-labor-measures',
    topicId: 'biz-work-topic',
    name: 'Mierniki rynku pracy i bezrobocie',
    level: 'PR',
    ckeRequirement: 'Współczynnik aktywności zawodowej, wskaźnik zatrudnienia, stopa bezrobocia; popyt i podaż pracy; rola państwa (ZR IV.1–IV.3; ZP V.5)',
    prerequisites: ['biz-macro-indicators'],
    examValue: 0.9,
  },
  {
    id: 'biz-career',
    topicId: 'biz-work-topic',
    name: 'Kariera, poszukiwanie pracy i rekrutacja',
    level: 'PR',
    ckeRequirement: 'Planowanie kariery, cele SMART, metody poszukiwania pracy, dokumenty aplikacyjne, rozmowa kwalifikacyjna, metody doboru pracowników (ZP V.1–V.8; ZR IV.4–IV.12)',
    prerequisites: ['biz-labor-measures'],
    examValue: 0.6,
  },
  {
    id: 'biz-employment-forms',
    topicId: 'biz-work-topic',
    name: 'Formy zatrudnienia, prawa i obowiązki',
    level: 'PR',
    ckeRequirement: 'Stosunek pracy i umowy cywilnoprawne, samozatrudnienie, prawa i obowiązki pracownika i pracodawcy, rozwiązanie stosunku pracy (ZP V.9, V.10; ZR IV.13, IV.14)',
    prerequisites: ['biz-career'],
    examValue: 0.85,
  },
  {
    id: 'biz-wages-taxes',
    topicId: 'biz-work-topic',
    name: 'Wynagrodzenie brutto, netto i podatki',
    level: 'PR',
    ckeRequirement: 'Systemy płac, składki na ubezpieczenia, koszty pracy, wynagrodzenie netto, podatki gospodarstwa domowego i ulgi w PIT (ZP IV.5–IV.7; ZR IV.15, V.16)',
    prerequisites: ['biz-employment-forms'],
    examValue: 0.9,
  },
  {
    id: 'biz-work-ethics',
    topicId: 'biz-work-topic',
    name: 'Etyka w pracy i mobbing',
    level: 'PR',
    ckeRequirement: 'Nieetyczne zachowania w relacjach pracownik–pracodawca, kodeks etyki, mobbing i zgłaszanie nadużyć (ZP V.11; ZR IV.16, IV.17)',
    prerequisites: ['biz-employment-forms'],
    examValue: 0.55,
  },
];

// ===========================================================================
// Lekcje
// ===========================================================================

export const WORK_LESSONS: Lesson[] = [
  {
    skillId: 'biz-labor-measures',
    minutes: 14,
    intro:
      'Rynek pracy opisują trzy wskaźniki liczone przez GUS. Kluczem jest podział ludności w wieku 15 lat i więcej na pracujących, bezrobotnych i biernych zawodowo — a potem pamiętanie, co przez co się dzieli.',
    blocks: [
      p('Pracujący i bezrobotni razem to aktywni zawodowo. Bezrobotny to osoba bez pracy, która jej aktywnie szuka i jest gotowa ją podjąć. Bierni zawodowo nie pracują i nie szukają pracy (np. studenci dzienni, emeryci).'),
      f('\\text{stopa bezrobocia} = \\frac{\\text{bezrobotni}}{\\text{aktywni zawodowo}} \\qquad \\text{wsk. zatrudnienia} = \\frac{\\text{pracujący}}{\\text{ludność 15+}} \\qquad \\text{wsp. aktywności} = \\frac{\\text{aktywni}}{\\text{ludność 15+}}'),
      p('Rodzaje bezrobocia: frykcyjne (przejściowe, przy zmianie pracy), strukturalne (kwalifikacje nie pasują do potrzeb gospodarki), koniunkturalne (spadek popytu na pracę w recesji), sezonowe. Państwo aktywizuje bezrobotnych przez urzędy pracy: szkolenia, staże, dotacje na założenie firmy, subsydiowane zatrudnienie.'),
      tip('Stopę bezrobocia dzielisz przez AKTYWNYCH, a nie przez całą ludność — to najczęstsza pułapka.'),
      warn('Student dzienny, który nie szuka pracy, nie jest bezrobotny — jest bierny zawodowo.'),
    ],
    examples: [
      example(
        'Ludność 15+: 30 mln, pracujący: 17 mln, bezrobotni: 0,5 mln. Oblicz stopę bezrobocia.',
        [['Aktywni: 17 + 0,5 = 17,5 mln.', 'pracujący + bezrobotni'], '0,5 : 17,5 ≈ 2,86%.'],
        'ok. 2,86%',
      ),
      example(
        'Programistka odeszła z firmy i od dwóch tygodni szuka nowej, lepszej pracy. Jaki to rodzaj bezrobocia?',
        ['Ma poszukiwane kwalifikacje — szuka tylko nowego miejsca.', 'To bezrobocie przejściowe.'],
        'frykcyjne',
      ),
    ],
    pitfalls: ['Dzielenie liczby bezrobotnych przez całą ludność.', 'Zaliczanie biernych zawodowo do bezrobotnych.', 'Mylenie bezrobocia strukturalnego z frykcyjnym.'],
  },
  {
    skillId: 'biz-career',
    minutes: 12,
    intro:
      'Karierę planuje się jak projekt: cel, droga, kamienie milowe. A rekrutacja to rozmowa dwóch stron — pracodawca sprawdza, czy pasujesz, a Ty sprawdzasz, czy ta praca pasuje do Ciebie.',
    blocks: [
      p('Cel zawodowy formułuj według SMART: konkretny (Specific), mierzalny (Measurable), osiągalny (Achievable), istotny (Relevant) i określony w czasie (Time-bound). „Chcę dużo zarabiać” to nie cel; „do czerwca 2029 r. zdobędę certyfikat i pierwszą pracę jako analityk danych” — tak.'),
      p('Dokumenty aplikacyjne: CV (dopasowane do oferty, bez zbędnych danych osobowych) i list motywacyjny (dlaczego ta firma i to stanowisko). Metody poszukiwania pracy: portale ogłoszeń, sieć kontaktów (networking), agencje, targi pracy, urząd pracy, aplikowanie z własnej inicjatywy. Metody doboru pracowników: analiza dokumentów, testy, rozmowa kwalifikacyjna, assessment center (zadania i symulacje oceniane przez kilku obserwatorów).'),
      p('Na rozmowie kwalifikacyjnej opowiadaj o doświadczeniach metodą STAR: sytuacja, zadanie, działanie, rezultat. Pracodawca nie może pytać o sprawy niezwiązane z pracą, np. plany rodzinne czy wyznanie. Doświadczenie zdobywa się też przez wolontariat, praktyki i staże.'),
      tip('Po rozmowie poproś o informację zwrotną — konstruktywna krytyka to najtańszy sposób na lepszą następną rozmowę.'),
      warn('Pytanie o plany macierzyńskie czy wyznanie narusza zakaz dyskryminacji — nie musisz na nie odpowiadać.'),
    ],
    examples: [
      example(
        'Czy cel „nauczę się lepiej programować” jest celem SMART?',
        [['Nie jest mierzalny ani określony w czasie.', 'brak M i T'], 'Lepiej: „do końca marca rozwiążę 100 zadań w Pythonie”.'],
        'nie',
      ),
      example(
        'Kandydaci przez cały dzień rozwiązują zadania zespołowe i odgrywają scenki, a obserwuje ich kilku oceniających. Jak nazywa się ta metoda?',
        ['Wiele zadań, wielu obserwatorów, symulacje.', 'To ośrodek oceny.'],
        'assessment center',
      ),
    ],
    pitfalls: ['Cele bez miary i terminu.', 'Jedno CV wysyłane na wszystkie oferty.', 'Odpowiadanie na pytania dyskryminujące.'],
  },
  {
    skillId: 'biz-employment-forms',
    minutes: 15,
    intro:
      'Forma umowy decyduje o tym, jakie masz prawa: urlop, płatne zwolnienie lekarskie, okres wypowiedzenia, składki emerytalne. Najwięcej ochrony daje umowa o pracę — ale nie każda praca musi być na nią wykonywana.',
    blocks: [
      p('Umowa o pracę (Kodeks pracy): praca pod kierownictwem pracodawcy, w wyznaczonym miejscu i czasie; prawo do co najmniej płacy minimalnej, urlopu (20 dni przy stażu poniżej 10 lat, 26 dni — od 10 lat), wynagrodzenia chorobowego, ochrony przed zwolnieniem. Rodzaje: na okres próbny (do 3 miesięcy), na czas określony (łącznie do 33 miesięcy i najwyżej 3 umowy), na czas nieokreślony.'),
      p('Umowy cywilnoprawne (Kodeks cywilny): zlecenie — staranne wykonywanie czynności (obowiązuje minimalna stawka godzinowa), o dzieło — konkretny rezultat (np. obraz, program). Nie dają urlopu ani ochrony z Kodeksu pracy. Samozatrudnienie (B2B) to prowadzenie własnej firmy i wystawianie faktur — więcej swobody i często wyższy dochód, ale samodzielne opłacanie składek, brak płatnego urlopu i większe ryzyko.'),
      p('Rozwiązanie umowy o pracę: za porozumieniem stron, za wypowiedzeniem (przy umowie na czas nieokreślony: 2 tygodnie przy stażu poniżej 6 miesięcy, 1 miesiąc od 6 miesięcy, 3 miesiące od 3 lat), bez wypowiedzenia (np. ciężkie naruszenie obowiązków) i z upływem czasu. Młodociany (15–18 lat) może pracować w celu przygotowania zawodowego; nie wolno go zatrudniać w nadgodzinach ani w porze nocnej.'),
      tip('Test na umowę o pracę: czy wykonujesz pracę pod kierownictwem, w miejscu i czasie wyznaczonym przez szefa? Jeśli tak, a masz zlecenie — umowa może być pozorna.'),
      warn('Umowa o dzieło rozlicza rezultat, a nie czas — za „godziny pracy w sklepie” nie da się zawrzeć umowy o dzieło.'),
    ],
    examples: [
      example(
        'Pracownik pracuje u tego samego pracodawcy od 4 lat na umowie na czas nieokreślony. Jaki ma okres wypowiedzenia?',
        [['Staż co najmniej 3 lata.', 'najdłuższy z trzech okresów'], 'Okres wypowiedzenia: 3 miesiące.'],
        '3 miesiące',
      ),
      example(
        'Grafik projektuje logo dla firmy za ustaloną kwotę. Jaka umowa najlepiej pasuje?',
        ['Liczy się konkretny rezultat — gotowe logo.', 'To umowa o dzieło.'],
        'umowa o dzieło',
      ),
    ],
    pitfalls: ['Mylenie zlecenia (staranne działanie) z dziełem (rezultat).', 'Przekonanie, że zlecenie daje prawo do urlopu.', 'Zły okres wypowiedzenia przy danym stażu.'],
  },
  {
    skillId: 'biz-wages-taxes',
    minutes: 17,
    intro:
      'Kwota w umowie (brutto) to nie to, co trafia na konto (netto). Po drodze pracodawca potrąca składki na ubezpieczenia społeczne i zdrowotne oraz zaliczkę na podatek. Sam też dopłaca swoje składki — dlatego koszt pracodawcy jest wyższy niż brutto.',
    blocks: [
      p('Systemy płac: czasowy (za godziny lub miesiąc), akordowy (za liczbę wykonanych sztuk), prowizyjny (procent od sprzedaży), a do tego premie i nagrody. Składniki wynagrodzenia: płaca zasadnicza, dodatki (np. za nadgodziny — 50% lub 100%), premie.'),
      f('\\text{netto} = \\text{brutto} - \\text{składki społeczne} - \\text{składka zdrowotna} - \\text{zaliczka na PIT}'),
      p(
        'Przykładowe zasady (podane w zadaniu): składki społeczne pracownika 13,71% brutto; składka zdrowotna 9% od (brutto − składki społeczne); podstawa podatku = brutto − składki społeczne − koszty uzyskania przychodu (250 zł), zaokrąglona do pełnych złotych; zaliczka = 12% podstawy − 300 zł, zaokrąglona do pełnych złotych. Dla brutto 6000 zł: składki 822,60 zł, zdrowotna 465,97 zł, zaliczka 291 zł, netto 4420,43 zł.',
      ),
      p('Podatki gospodarstwa domowego: bezpośrednie (PIT, podatek od nieruchomości) i pośrednie, ukryte w cenach (VAT, akcyza). W PIT możliwe są ulgi, np. na dzieci, na internet, termomodernizacyjna, a osoby do 26. roku życia mają zwolnienie przychodów z pracy do określonego limitu (tzw. ulga dla młodych). Małżonkowie mogą rozliczyć się wspólnie.'),
      tip('Licz krok po kroku i zaokrąglaj dokładnie tak, jak podano w zadaniu — to właśnie sprawdza egzamin.'),
      warn('Składkę zdrowotną liczy się od brutto pomniejszonego o składki społeczne, a nie od całego brutto.'),
    ],
    examples: [
      example(
        'Pracownik akordowy wykonał 1200 sztuk po 4 zł. Ile zarobił brutto?',
        [['Płaca akordowa = liczba sztuk · stawka.', 'system akordowy'], '1200 · 4 = 4800 zł.'],
        '4800 zł',
      ),
      example(
        'Sprzedawca ma 3500 zł podstawy i 2% prowizji od sprzedaży. Sprzedał za 150 000 zł. Ile zarobił brutto?',
        ['Prowizja: 2% · 150 000 = 3000 zł.', 'Razem: 3500 + 3000 = 6500 zł.'],
        '6500 zł',
      ),
    ],
    pitfalls: ['Składka zdrowotna liczona od pełnego brutto.', 'Pomylenie kosztu pracodawcy z wynagrodzeniem brutto.', 'Pominięcie zaokrągleń podanych w zadaniu.'],
  },
  {
    skillId: 'biz-work-ethics',
    minutes: 11,
    intro:
      'Etyka w pracy działa w obie strony: pracownik nie oszukuje pracodawcy, a pracodawca szanuje godność i prawa pracownika. Kodeks pracy wprost zakazuje dyskryminacji i mobbingu.',
    blocks: [
      p('Mobbing to uporczywe i długotrwałe nękanie lub zastraszanie pracownika, które wywołuje u niego zaniżoną ocenę przydatności zawodowej albo prowadzi do poniżenia, ośmieszenia czy izolowania od zespołu. Pracodawca ma obowiązek mu przeciwdziałać. Jednorazowa ostra wymiana zdań to jeszcze nie mobbing.'),
      p('Nieetyczne zachowania pracownika: kradzież czasu pracy, wynoszenie informacji firmy, fałszywe zwolnienia lekarskie. Pracodawcy: zatrudnianie „na czarno”, zaniżanie wynagrodzeń, pozorne umowy cywilnoprawne zamiast umów o pracę, dyskryminacja. Kodeks etyki firmy opisuje wartości i zasady zachowań; sygnaliści zgłaszają nieprawidłowości wewnętrznymi kanałami lub do instytucji (np. Państwowej Inspekcji Pracy), a prawo chroni ich przed odwetem.'),
      tip('Przy podejrzeniu mobbingu zbieraj dowody (maile, notatki z datami, świadków) i zgłoś sprawę wewnętrznie lub do Państwowej Inspekcji Pracy.'),
      warn('Stanowcze, rzeczowe polecenia i ocena wyników pracy nie są mobbingiem — mobbing to długotrwałe, uporczywe nękanie.'),
    ],
    examples: [
      example(
        'Kierownik przez pół roku publicznie wyśmiewa jednego pracownika i odcina go od informacji zespołu. Jak to ocenić?',
        [['Działania są uporczywe i długotrwałe.', 'ośmieszanie i izolowanie'], 'Spełniają cechy mobbingu.'],
        'mobbing',
      ),
      example(
        'Pracodawca zatrudnia osoby na zlecenie, choć pracują one pod kierownictwem w stałych godzinach. Co to za praktyka?',
        ['Faktycznie to stosunek pracy.', 'Pozorna umowa cywilnoprawna omija prawa pracownicze.'],
        'nieetyczna i niezgodna z prawem',
      ),
    ],
    pitfalls: ['Nazywanie mobbingiem każdego konfliktu.', 'Brak dowodów przy zgłaszaniu nadużyć.', 'Traktowanie pracy „na czarno” jako korzyści dla pracownika.'],
  },
];

// ===========================================================================
// Zadania
// ===========================================================================

const ZASADY =
  'Przyjmij: składki społeczne pracownika 13,71% brutto; składka zdrowotna 9% od (brutto − składki społeczne); podstawa podatku = brutto − składki społeczne − 250 zł, zaokrąglona do pełnych złotych; zaliczka na podatek = 12% podstawy − 300 zł, zaokrąglona do pełnych złotych.';

export const WORK_QUESTIONS: Question[] = [
  // biz-labor-measures --------------------------------------------------------
  choice({
    id: 'bw-m-1',
    skill: 'biz-labor-measures',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Kogo w statystyce rynku pracy zalicza się do biernych zawodowo?',
    choices: ['osobę, która nie pracuje i nie szuka pracy, np. studenta', 'osobę, która nie pracuje, ale aktywnie szuka pracy', 'osobę pracującą na część etatu lub dorywczo', 'osobę prowadzącą własną jednoosobową firmę'],
    answer: 'A',
    hints: ['Na jakie trzy grupy dzieli się ludność w wieku 15+?', 'Pracujący, bezrobotni i bierni zawodowo.', 'Czym bezrobotny różni się od biernego?', 'Bezrobotny szuka pracy, bierny — nie.'],
    steps: ['Bierny zawodowo nie pracuje i nie szuka pracy.', 'Szukający pracy to bezrobotny, pracujący (także na część etatu i we własnej firmie) — to pracujący.'],
    errors: [
      ['B', 'To osoba bezrobotna.', 'Bierny nie szuka pracy.'],
      ['C', 'Praca na część etatu to praca.', 'Bierny nie pracuje.'],
      ['D', 'Prowadzenie firmy to praca.', 'Bierny nie pracuje.'],
    ],
  }),
  numeric({
    id: 'bw-m-2',
    skill: 'biz-labor-measures',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'W regionie jest 400 tys. pracujących i 25 tys. bezrobotnych. Oblicz liczbę osób aktywnych zawodowo (w tys.).',
    answer: 425,
    verify: () => 400 + 25,
    hints: ['Kto należy do aktywnych zawodowo?', 'Wszyscy, którzy pracują albo szukają pracy.', 'Czy bezrobotni są aktywni zawodowo?', 'Tak — aktywnie szukają pracy.'],
    steps: ['Aktywni = pracujący + bezrobotni.', '400 + 25 = 425 tys.'],
    errors: [['400', 'Pominięci bezrobotni.', 'Bezrobotni należą do aktywnych zawodowo.']],
  }),
  numeric({
    id: 'bw-m-3',
    skill: 'biz-labor-measures',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ludność w wieku 15+ liczy 30 mln osób, pracujących jest 17 mln, a bezrobotnych 0,5 mln. Oblicz stopę bezrobocia (w %, z dokładnością do dwóch miejsc po przecinku).',
    answer: '2,86',
    variants: ['2.86'],
    tolerance: 0.005,
    verify: () => Math.round((0.5 / 17.5) * 10000) / 100,
    hints: ['Przez jaką grupę dzieli się liczbę bezrobotnych?', 'Przez aktywnych zawodowo — nie przez całą ludność.', 'Ilu jest aktywnych zawodowo?', 'Pracujący plus bezrobotni.'],
    steps: ['Aktywni: 17 + 0,5 = 17,5 mln.', 'Stopa bezrobocia: 0,5 : 17,5 · 100% ≈ 2,86%.'],
    errors: [['1,67', 'Bezrobotni podzieleni przez całą ludność 15+.', 'Dzielimy przez aktywnych zawodowo.']],
  }),
  numeric({
    id: 'bw-m-4',
    skill: 'biz-labor-measures',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ludność w wieku 15+ liczy 30 mln osób, pracujących jest 17 mln, a bezrobotnych 0,5 mln. Oblicz współczynnik aktywności zawodowej (w %, z dokładnością do dwóch miejsc po przecinku).',
    answer: '58,33',
    variants: ['58.33'],
    tolerance: 0.005,
    verify: () => Math.round((17.5 / 30) * 10000) / 100,
    hints: ['Co mierzy współczynnik aktywności zawodowej?', 'Jaka część ludności 15+ jest aktywna zawodowo.', 'Policz aktywnych: pracujący plus bezrobotni.', 'Podziel przez ludność 15+ i pomnóż przez 100%.'],
    steps: ['Aktywni: 17,5 mln.', '17,5 : 30 · 100% ≈ 58,33%.'],
    errors: [['56,67', 'Policzony wskaźnik zatrudnienia (sami pracujący).', 'Aktywni to pracujący i bezrobotni.']],
  }),
  choice({
    id: 'bw-m-5',
    skill: 'biz-labor-measures',
    kind: 'typical',
    difficulty: 3,
    prompt: 'W regionie zamknięto kopalnie. Wielu górników nie może znaleźć pracy, bo nowe miejsca pracy powstają w usługach IT, które wymagają innych kwalifikacji. Jaki to rodzaj bezrobocia?',
    choices: ['strukturalne', 'frykcyjne', 'sezonowe', 'koniunkturalne'],
    answer: 'A',
    hints: ['Czy praca w regionie w ogóle jest?', 'Jest — ale w innej branży.', 'Co przeszkadza górnikom w jej podjęciu?', 'Niedopasowanie kwalifikacji do potrzeb gospodarki.'],
    steps: ['Kwalifikacje bezrobotnych nie pasują do nowych miejsc pracy.', 'To bezrobocie strukturalne.'],
    errors: [
      ['B', 'Frykcyjne to przejściowe szukanie pracy przez osoby z poszukiwanymi kwalifikacjami.', 'Tu kwalifikacje nie pasują.'],
      ['C', 'Sezonowe zależy od pory roku.', 'Tu przyczyną jest zmiana struktury gospodarki.'],
      ['D', 'Koniunkturalne wynika z recesji.', 'Tu przyczyną są zmiany struktury gospodarki.'],
    ],
  }),
  choice({
    id: 'bw-m-6',
    skill: 'biz-labor-measures',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Które działanie urzędu pracy najlepiej odpowiada na bezrobocie strukturalne?',
    choices: ['finansowanie szkoleń i przekwalifikowania bezrobotnych', 'wypłata jednorazowej premii dla wszystkich pracujących', 'obniżenie stóp procentowych', 'skrócenie wakacji szkolnych'],
    answer: 'A',
    hints: ['Jaka jest przyczyna bezrobocia strukturalnego?', 'Niedopasowanie kwalifikacji.', 'Co można zrobić z kwalifikacjami bezrobotnych?', 'Zmienić je — przez szkolenia i przekwalifikowanie.'],
    steps: ['Bezrobocie strukturalne wynika z niedopasowania kwalifikacji.', 'Odpowiedzią jest przekwalifikowanie — szkolenia, kursy, staże.'],
    errors: [
      ['B', 'Premia dla pracujących nie zmienia kwalifikacji bezrobotnych.', 'Potrzebne jest przekwalifikowanie.'],
      ['C', 'To narzędzie na bezrobocie koniunkturalne.', 'Strukturalne wymaga przekwalifikowania.'],
      ['D', 'Nie ma związku z bezrobociem.', 'Potrzebne jest przekwalifikowanie.'],
    ],
  }),
  numeric({
    id: 'bw-m-7',
    skill: 'biz-labor-measures',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'W kraju jest 20 mln aktywnych zawodowo, a stopa bezrobocia wynosi 5%. Rok później liczba aktywnych nie zmieniła się, a stopa bezrobocia spadła do 4%. O ile tysięcy wzrosła liczba pracujących?',
    answer: 200,
    verify: () => (20_000 * 0.05 - 20_000 * 0.04),
    hints: ['Ilu było bezrobotnych na początku (w tys.)?', '5% z 20 mln.', 'Ilu jest bezrobotnych po roku?', 'Przy stałej liczbie aktywnych spadek bezrobotnych oznacza taki sam wzrost pracujących.'],
    steps: ['Bezrobotni: 5% · 20 mln = 1 mln → 4% · 20 mln = 0,8 mln.', 'Aktywnych jest tyle samo, więc pracujących przybyło 200 tys.'],
    errors: [['1', 'Podana różnica stóp w punktach procentowych.', 'Trzeba ją przeliczyć na liczbę osób.']],
  }),

  // biz-career ----------------------------------------------------------------
  choice({
    id: 'bw-c-1',
    skill: 'biz-career',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Który cel zawodowy spełnia kryteria SMART?',
    choices: ['do czerwca 2028 r. zdam egzamin na certyfikat księgowego', 'zdam egzamin na certyfikat księgowego, gdy tylko znajdę czas', 'do czerwca 2028 r. zostanę najlepszym księgowym w Polsce', 'w przyszłości chcę pracować w dobrym biurze rachunkowym'],
    answer: 'A',
    hints: ['Co oznaczają litery M i T w skrócie SMART?', 'Mierzalny i określony w czasie.', 'Który cel ma termin i sprawdzalny rezultat?', 'Pozostałe są ogólnikowe.'],
    steps: ['Cel A jest konkretny, mierzalny (zdany egzamin), realny, istotny i ma termin.', 'B nie ma terminu, C jest nierealny i niemierzalny, D jest ogólnikowy.'],
    errors: [
      ['B', 'Brak terminu.', 'Cel SMART musi być określony w czasie.'],
      ['C', 'Cel nierealny i niemierzalny.', 'Cel SMART musi być osiągalny i mierzalny.'],
      ['D', 'Cel ogólnikowy, bez miary i terminu.', 'Cel SMART musi być konkretny i mierzalny.'],
    ],
  }),
  choice({
    id: 'bw-c-2',
    skill: 'biz-career',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Który dokument aplikacyjny służy przede wszystkim do wyjaśnienia, dlaczego kandydat chce pracować w danej firmie i na danym stanowisku?',
    choices: ['list motywacyjny', 'CV', 'świadectwo pracy', 'umowa o pracę'],
    answer: 'A',
    hints: ['Który dokument opisuje przebieg Twojej edukacji i doświadczenia?', 'CV — ale bez uzasadnienia wyboru firmy.', 'Gdzie piszesz o motywacji?', 'Nazwa dokumentu to podpowiada.'],
    steps: ['List motywacyjny uzasadnia wybór firmy i stanowiska.', 'CV przedstawia fakty: edukację, doświadczenie, umiejętności.'],
    errors: [
      ['B', 'CV zawiera fakty, nie motywację.', 'Motywację opisuje list motywacyjny.'],
      ['C', 'Świadectwo pracy wystawia poprzedni pracodawca.', 'Motywację opisuje list motywacyjny.'],
      ['D', 'Umowę zawiera się po rekrutacji.', 'Motywację opisuje list motywacyjny.'],
    ],
  }),
  choice({
    id: 'bw-c-3',
    skill: 'biz-career',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Które pytanie pracodawca może zadać podczas rozmowy kwalifikacyjnej?',
    choices: ['Jak rozwiązałby Pan konflikt w zespole projektowym?', 'Czy planuje Pani w najbliższym czasie mieć dziecko?', 'Jakie jest Pana wyznanie?', 'Na jaką partię Pani głosuje?'],
    answer: 'A',
    hints: ['Czy pytanie dotyczy kompetencji potrzebnych w pracy?', 'Pracodawca może pytać o to, co ma związek z pracą.', 'Które pytania dotyczą życia prywatnego i poglądów?', 'Takie pytania mogą prowadzić do dyskryminacji.'],
    steps: ['Pytanie o rozwiązywanie konfliktów sprawdza kompetencje zawodowe.', 'Pytania o plany rodzinne, wyznanie i poglądy są niedopuszczalne.'],
    errors: [
      ['B', 'Plany rodzinne to sprawa prywatna.', 'Pytanie może prowadzić do dyskryminacji.'],
      ['C', 'Wyznanie to sprawa prywatna.', 'Pytanie może prowadzić do dyskryminacji.'],
      ['D', 'Poglądy polityczne to sprawa prywatna.', 'Pytanie może prowadzić do dyskryminacji.'],
    ],
  }),
  text({
    id: 'bw-c-4',
    skill: 'biz-career',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij nazwę metody doboru pracowników: kandydaci przez kilka godzin wykonują zadania i symulacje (np. prezentację, pracę zespołową), a ocenia ich kilku obserwatorów. To assessment ________ (ośrodek oceny).',
    answer: 'center',
    variants: ['centre'],
    hints: ['Jak po angielsku nazywa się „ośrodek oceny”?', 'Assessment …', 'Drugie słowo oznacza „ośrodek”.', 'Pisze się podobnie jak polskie „centrum”.'],
    steps: ['Metoda to assessment center.', 'Łączy wiele zadań i ocenę kilku obserwatorów.'],
    errors: [['test', 'Pomylono z pojedynczym testem.', 'Assessment center to zestaw zadań i obserwatorów.']],
  }),
  choice({
    id: 'bw-c-5',
    skill: 'biz-career',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Na rozmowie padło pytanie: „Proszę opowiedzieć o sytuacji, w której musiał Pan dotrzymać trudnego terminu”. Która odpowiedź najlepiej wykorzystuje metodę STAR?',
    choices: [
      'opis sytuacji, zadania, konkretnych własnych działań i ich mierzalnego rezultatu',
      'zapewnienie, że zawsze dotrzymuje terminów',
      'opowieść o tym, jak zespół nie zdążył z projektem, bez wskazania własnej roli',
      'odpowiedź, że nie pamięta takiej sytuacji',
    ],
    answer: 'A',
    hints: ['Co oznaczają litery S, T, A, R?', 'Sytuacja, zadanie, działanie, rezultat.', 'Czy ogólne zapewnienia są dowodem kompetencji?', 'Nie — liczą się konkrety i efekty.'],
    steps: ['STAR: sytuacja, zadanie, działanie, rezultat.', 'Odpowiedź A zawiera wszystkie elementy i pokazuje własną rolę kandydata.'],
    errors: [
      ['B', 'Ogólnik bez przykładu.', 'STAR wymaga konkretnej historii.'],
      ['C', 'Brak własnego działania i rezultatu.', 'STAR pokazuje rolę kandydata.'],
      ['D', 'Brak odpowiedzi.', 'Warto przygotować przykłady przed rozmową.'],
    ],
  }),
  choice({
    id: 'bw-c-6',
    skill: 'biz-career',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Maturzysta chce za pięć lat pracować jako analityk danych, ale nie ma doświadczenia. Który plan najlepiej łączy edukację i zdobywanie doświadczenia?',
    choices: ['kierunkowe studia, a w ich trakcie wolontariat i płatne praktyki', 'studia dowolnego kierunku i szukanie pracy dopiero po dyplomie', 'od razu po maturze praca na kasie, żeby mieć jakiekolwiek doświadczenie', 'same studia z analizy danych z najlepszymi ocenami, bez praktyk'],
    answer: 'A',
    hints: ['Czego brakuje temu kandydatowi?', 'Doświadczenia.', 'Jakie formy doświadczenia dostępne są w czasie studiów?', 'Wolontariat, praktyki, staże.'],
    steps: ['Kierunkowe wykształcenie buduje kompetencje.', 'Wolontariat i praktyki w trakcie studiów dają doświadczenie potrzebne na rynku pracy.'],
    errors: [
      ['B', 'Brak doświadczenia przy wejściu na rynek pracy.', 'Doświadczenie warto zdobywać w trakcie nauki.'],
      ['C', 'Doświadczenie niezwiązane z celem mało pomaga.', 'Warto łączyć kierunkową naukę z praktyką w zawodzie.'],
      ['D', 'Wysokie oceny nie zastąpią doświadczenia.', 'Doświadczenie warto zdobywać w trakcie nauki.'],
    ],
  }),

  // biz-employment-forms ------------------------------------------------------
  choice({
    id: 'bw-f-1',
    skill: 'biz-employment-forms',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Która umowa daje pracownikowi prawo do płatnego urlopu wypoczynkowego na podstawie Kodeksu pracy?',
    choices: ['umowa o pracę', 'umowa zlecenie', 'umowa o dzieło', 'umowa B2B z własną firmą'],
    answer: 'A',
    hints: ['Która umowa jest regulowana przez Kodeks pracy?', 'Umowa o pracę.', 'Jakie prawo daje Kodeks pracy?', 'Między innymi płatny urlop wypoczynkowy.'],
    steps: ['Płatny urlop z Kodeksu pracy przysługuje przy umowie o pracę.', 'Umowy cywilnoprawne i B2B go nie gwarantują.'],
    errors: [
      ['B', 'Zlecenie to umowa cywilnoprawna.', 'Urlop z Kodeksu pracy daje umowa o pracę.'],
      ['C', 'Dzieło to umowa cywilnoprawna.', 'Urlop z Kodeksu pracy daje umowa o pracę.'],
      ['D', 'Przedsiębiorca sam decyduje o przerwie, bez płatnego urlopu.', 'Urlop z Kodeksu pracy daje umowa o pracę.'],
    ],
  }),
  choice({
    id: 'bw-f-2',
    skill: 'biz-employment-forms',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Informatyk ma napisać dla firmy konkretną aplikację mobilną za ustaloną kwotę, w dowolnym miejscu i czasie. Która umowa najlepiej pasuje do tej sytuacji?',
    choices: ['umowa o dzieło', 'umowa o pracę na czas nieokreślony', 'umowa na okres próbny', 'umowa zlecenie na stałą obsługę recepcji'],
    answer: 'A',
    hints: ['Czy liczy się staranne działanie, czy konkretny efekt?', 'Konkretny efekt — gotowa aplikacja.', 'Czy informatyk pracuje pod kierownictwem w wyznaczonych godzinach?', 'Nie — to nie jest stosunek pracy.'],
    steps: ['Rezultat (gotowa aplikacja) i swoboda miejsca oraz czasu wskazują na umowę o dzieło.', 'Umowa o pracę wymaga pracy pod kierownictwem.'],
    errors: [
      ['B', 'Brak podporządkowania i stałych godzin.', 'Tu liczy się rezultat — dzieło.'],
      ['C', 'Okres próbny dotyczy stosunku pracy.', 'Tu liczy się rezultat — dzieło.'],
      ['D', 'Zlecenie dotyczy starannego działania.', 'Tu liczy się rezultat — dzieło.'],
    ],
  }),
  numeric({
    id: 'bw-f-3',
    skill: 'biz-employment-forms',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Pracownik ma umowę o pracę na czas nieokreślony i pracuje u tego pracodawcy od 4 lat. Ile miesięcy wynosi okres wypowiedzenia?',
    answer: 3,
    hints: ['Od czego zależy długość okresu wypowiedzenia umowy na czas nieokreślony?', 'Od stażu pracy u danego pracodawcy.', 'Jakie są progi stażu?', 'Poniżej 6 miesięcy, od 6 miesięcy i od 3 lat.'],
    steps: ['Staż 4 lata przekracza próg 3 lat.', 'Okres wypowiedzenia: 3 miesiące.'],
    errors: [['1', 'Użyty próg od 6 miesięcy do 3 lat.', 'Od 3 lat stażu okres wynosi 3 miesiące.']],
  }),
  numeric({
    id: 'bw-f-4',
    skill: 'biz-employment-forms',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Ile dni urlopu wypoczynkowego w roku przysługuje pracownikowi zatrudnionemu na pełen etat, jeśli jego staż pracy (łącznie z okresem nauki wliczanym do stażu) wynosi 12 lat?',
    answer: 26,
    hints: ['Od czego zależy wymiar urlopu?', 'Od stażu pracy.', 'Jaki jest próg stażu?', '10 lat — poniżej i od 10 lat obowiązują różne wymiary.'],
    steps: ['Staż co najmniej 10 lat.', 'Wymiar urlopu: 26 dni.'],
    errors: [['20', 'Użyty wymiar dla stażu poniżej 10 lat.', 'Od 10 lat stażu przysługuje 26 dni.']],
  }),
  choice({
    id: 'bw-f-5',
    skill: 'biz-employment-forms',
    kind: 'typical',
    difficulty: 4,
    prompt: 'Które zdanie o zatrudnianiu młodocianych (15–18 lat) jest zgodne z Kodeksem pracy?',
    choices: ['młodocianego nie wolno zatrudniać w nadgodzinach ani w nocy', 'młodociany może pracować w nocy, jeśli wyrazi zgodę na piśmie', 'młodociany może pracować po 12 godzin dziennie w wakacje', 'młodociany nie ma prawa do urlopu przez pierwszy rok pracy'],
    answer: 'A',
    hints: ['Dlaczego prawo szczególnie chroni młodocianych?', 'Ze względu na zdrowie i rozwój.', 'Czy zgoda młodocianego uchyla zakazy?', 'Nie — ochrona jest bezwzględna.'],
    steps: ['Młodocianego nie wolno zatrudniać w nadgodzinach ani w nocy.', 'Ma też skrócony czas pracy i prawo do urlopu.'],
    errors: [
      ['B', 'Zakaz pracy w nocy obowiązuje niezależnie od zgody.', 'Ochrona młodocianych jest bezwzględna.'],
      ['C', 'Czas pracy młodocianych jest skrócony.', 'Nie wolno przekraczać norm.'],
      ['D', 'Młodociany nabywa prawo do urlopu już po 6 miesiącach pracy.', 'Młodocianym przysługuje urlop wypoczynkowy.'],
    ],
  }),
  choice({
    id: 'bw-f-6',
    skill: 'biz-employment-forms',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Grafik dostał propozycję: umowa o pracę za 7000 zł brutto albo współpraca B2B (własna firma) za 9500 zł netto na fakturze. Który argument PRZEMAWIA ZA umową o pracę?',
    choices: ['płatny urlop, wynagrodzenie chorobowe i ochrona przed zwolnieniem', 'wyższa kwota do ręki w każdym miesiącu', 'możliwość równoległej pracy dla innych klientów na fakturę', 'samodzielne rozliczanie podatku i wybór formy opodatkowania'],
    answer: 'A',
    hints: ['Czego nie daje współpraca B2B?', 'Uprawnień z Kodeksu pracy.', 'Kto przy B2B płaci składki i finansuje przerwy w pracy?', 'Sam przedsiębiorca.'],
    steps: ['Umowa o pracę daje uprawnienia pracownicze: urlop, chorobowe, okres wypowiedzenia.', 'B2B daje wyższą kwotę, ale bez tych zabezpieczeń.'],
    errors: [
      ['B', 'To argument za B2B.', 'Szukamy zalety umowy o pracę.'],
      ['C', 'To zaleta B2B.', 'Szukamy zalety umowy o pracę.'],
      ['D', 'To cecha działalności gospodarczej.', 'Szukamy zalety umowy o pracę.'],
    ],
  }),
  choice({
    id: 'bw-f-7',
    skill: 'biz-employment-forms',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Kasjerka pracuje w sklepie codziennie 8 godzin według grafiku ustalanego przez kierownika, na umowie o dzieło „na obsługę kasy”. Jak ocenić tę umowę?',
    choices: ['jest nieprawidłowa — faktycznie to stosunek pracy', 'jest prawidłowa, bo strony mogą dowolnie nazwać umowę', 'jest prawidłowa, bo kasjerka się na nią zgodziła', 'powinna to być umowa zlecenia, bo praca jest powtarzalna'],
    answer: 'A',
    hints: ['Czy obsługa kasy daje konkretny rezultat, jak dzieło?', 'Nie — to powtarzalne czynności.', 'Kto wyznacza miejsce i czas pracy?', 'Kierownik — to cecha stosunku pracy.'],
    steps: ['Praca pod kierownictwem, w miejscu i czasie wyznaczonym przez pracodawcę to stosunek pracy.', 'Nazwa umowy nie ma znaczenia — decyduje faktyczny sposób wykonywania pracy.'],
    errors: [
      ['B', 'O rodzaju umowy decyduje jej treść, nie nazwa.', 'Tu faktycznie jest stosunek pracy.'],
      ['C', 'Zgoda nie zmienia charakteru pracy.', 'Decyduje faktyczny sposób wykonywania pracy.'],
      ['D', 'Praca pod kierownictwem, w wyznaczonym czasie i miejscu to stosunek pracy, nie zlecenie.', 'Właściwa jest umowa o pracę.'],
    ],
  }),

  // biz-wages-taxes -----------------------------------------------------------
  numeric({
    id: 'bw-w-1',
    skill: 'biz-wages-taxes',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Pracownik wynagradzany w systemie akordowym wykonał w miesiącu 1200 sztuk wyrobu, a stawka wynosi 4 zł za sztukę. Ile zarobił brutto (w zł)?',
    answer: 4800,
    verify: () => 1200 * 4,
    hints: ['Za co płaci się w systemie akordowym?', 'Za liczbę wykonanych sztuk.', 'Jak obliczyć płacę?', 'Liczba sztuk razy stawka za sztukę.'],
    steps: ['Płaca akordowa = liczba sztuk · stawka.', '1200 · 4 = 4800 zł.'],
    errors: [['300', 'Liczba sztuk podzielona przez stawkę.', 'Płacę akordową liczy się mnożeniem.']],
  }),
  numeric({
    id: 'bw-w-2',
    skill: 'biz-wages-taxes',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Handlowiec ma płacę zasadniczą 3500 zł brutto i 2% prowizji od wartości sprzedaży. W miesiącu sprzedał towary za 150 000 zł. Oblicz jego wynagrodzenie brutto (w zł).',
    answer: 6500,
    verify: () => 3500 + 0.02 * 150000,
    hints: ['Z jakich części składa się wynagrodzenie?', 'Z płacy zasadniczej i prowizji.', 'Ile wynosi prowizja?', '2% z 150 000 zł.'],
    steps: ['Prowizja: 0,02 · 150 000 = 3000 zł.', 'Wynagrodzenie: 3500 + 3000 = 6500 zł.'],
    errors: [['3000', 'Pominięta płaca zasadnicza.', 'Wynagrodzenie to podstawa plus prowizja.']],
  }),
  numeric({
    id: 'bw-w-3',
    skill: 'biz-wages-taxes',
    kind: 'typical',
    difficulty: 3,
    prompt: `Wynagrodzenie brutto wynosi 6000 zł. ${ZASADY} Oblicz składki na ubezpieczenia społeczne finansowane przez pracownika (w zł, z dokładnością do grosza).`,
    answer: '822,6',
    variants: ['822.6', '822,60', '822.60'],
    tolerance: 0.001,
    verify: () => Math.round(6000 * 0.1371 * 100) / 100,
    hints: ['Jaką stawkę mają składki społeczne pracownika?', '13,71% brutto.', 'Od jakiej kwoty je liczysz?', 'Od pełnego wynagrodzenia brutto.'],
    steps: ['Składki społeczne: 13,71% · 6000 zł.', '= 822,60 zł.'],
    errors: [['540', 'Użyta stawka składki zdrowotnej.', 'Składki społeczne to 13,71% brutto.']],
  }),
  numeric({
    id: 'bw-w-4',
    skill: 'biz-wages-taxes',
    kind: 'typical',
    difficulty: 3,
    prompt: `Wynagrodzenie brutto wynosi 6000 zł. ${ZASADY} Oblicz składkę zdrowotną (w zł, z dokładnością do grosza).`,
    answer: '465,97',
    variants: ['465.97'],
    tolerance: 0.001,
    verify: () => Math.round((6000 - Math.round(6000 * 0.1371 * 100) / 100) * 0.09 * 100) / 100,
    hints: ['Od jakiej kwoty liczy się składkę zdrowotną?', 'Od brutto pomniejszonego o składki społeczne.', 'Ile wynoszą składki społeczne?', '13,71% brutto — odejmij je, a od reszty weź 9%.'],
    steps: ['Podstawa: 6000 − 822,60 = 5177,40 zł.', 'Składka zdrowotna: 9% · 5177,40 ≈ 465,97 zł.'],
    errors: [['540', 'Składka policzona od pełnego brutto.', 'Podstawą jest brutto minus składki społeczne.']],
  }),
  numeric({
    id: 'bw-w-5',
    skill: 'biz-wages-taxes',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Wynagrodzenie brutto pracownika wynosi 6000 zł. Pracodawca dodatkowo finansuje własne składki (emerytalną, rentową, wypadkową, Fundusz Pracy i FGŚP) w łącznej wysokości 20,48% wynagrodzenia brutto. Oblicz całkowity koszt zatrudnienia tego pracownika dla pracodawcy (w zł, z dokładnością do grosza).',
    answer: '7228,8',
    variants: ['7228.8', '7228,80', '7228.80'],
    tolerance: 0.001,
    verify: () => Math.round(6000 * 1.2048 * 100) / 100,
    hints: ['Czy koszt pracodawcy to tylko wynagrodzenie brutto?', 'Nie — pracodawca płaci jeszcze własne składki.', 'Ile wynoszą składki pracodawcy?', '20,48% brutto — dodaj je do brutto.'],
    steps: ['Składki pracodawcy: 20,48% · 6000 = 1228,80 zł.', 'Koszt: 6000 + 1228,80 = 7228,80 zł.'],
    errors: [['6000', 'Pominięte składki pracodawcy.', 'Koszt pracodawcy jest wyższy niż brutto.']],
  }),
  numeric({
    id: 'bw-w-6',
    skill: 'biz-wages-taxes',
    kind: 'transfer',
    difficulty: 5,
    prompt: `Wynagrodzenie brutto wynosi 6000 zł. ${ZASADY} Oblicz wynagrodzenie netto (w zł, z dokładnością do grosza).`,
    answer: '4420,43',
    variants: ['4420.43'],
    tolerance: 0.001,
    verify: () => {
      const brutto = 6000;
      const spoleczne = Math.round(brutto * 0.1371 * 100) / 100;
      const zdrowotna = Math.round((brutto - spoleczne) * 0.09 * 100) / 100;
      const podstawa = Math.round(brutto - spoleczne - 250);
      const zaliczka = Math.round(0.12 * podstawa - 300);
      return Math.round((brutto - spoleczne - zdrowotna - zaliczka) * 100) / 100;
    },
    hints: ['Jakie trzy potrącenia odejmuje się od brutto?', 'Składki społeczne, składkę zdrowotną i zaliczkę na podatek.', 'Policz je po kolei według zasad z treści, pilnując zaokrągleń.', 'Zaliczka: 12% z zaokrąglonej podstawy minus 300 zł, zaokrąglona do złotych.'],
    steps: ['Składki społeczne 822,60 zł; zdrowotna 9% · 5177,40 = 465,97 zł.', 'Podstawa: 6000 − 822,60 − 250 ≈ 4927 zł; zaliczka: 12% · 4927 − 300 ≈ 291 zł; netto: 6000 − 822,60 − 465,97 − 291 = 4420,43 zł.'],
    errors: [['4711,43', 'Pominięta zaliczka na podatek.', 'Netto = brutto − składki społeczne − zdrowotna − zaliczka.']],
  }),
  choice({
    id: 'bw-w-7',
    skill: 'biz-wages-taxes',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Który podatek płaci gospodarstwo domowe pośrednio — w cenie kupowanych towarów?',
    choices: ['VAT', 'podatek dochodowy od osób fizycznych (PIT)', 'podatek od nieruchomości', 'podatek od spadków i darowizn'],
    answer: 'A',
    hints: ['Czym różni się podatek bezpośredni od pośredniego?', 'Pośredni jest ukryty w cenie towaru lub usługi.', 'Który podatek widać na paragonie?', 'Podatek od towarów i usług.'],
    steps: ['VAT jest doliczany do ceny — to podatek pośredni.', 'PIT, podatek od nieruchomości i od spadków to podatki bezpośrednie.'],
    errors: [
      ['B', 'PIT to podatek bezpośredni.', 'Pośredni jest VAT.'],
      ['C', 'Podatek od nieruchomości to podatek bezpośredni.', 'Pośredni jest VAT.'],
      ['D', 'Podatek od spadków to podatek bezpośredni.', 'Pośredni jest VAT.'],
    ],
  }),

  // biz-work-ethics -----------------------------------------------------------
  choice({
    id: 'bw-e-1',
    skill: 'biz-work-ethics',
    kind: 'foundation',
    difficulty: 1,
    prompt: 'Które zachowanie spełnia definicję mobbingu?',
    choices: ['długotrwałe, uporczywe ośmieszanie i izolowanie pracownika', 'jednorazowa ostra krytyka źle wykonanego zadania na zebraniu', 'stanowcze wymaganie terminowego wykonywania obowiązków', 'negatywna ocena wyników w corocznej rozmowie oceniającej'],
    answer: 'A',
    hints: ['Jakie dwie cechy odróżniają mobbing od zwykłego konfliktu?', 'Uporczywość i długotrwałość.', 'Czy rzeczowa ocena pracy to nękanie?', 'Nie — to normalny element zarządzania.'],
    steps: ['Mobbing to uporczywe i długotrwałe nękanie, np. ośmieszanie i izolowanie.', 'Jednorazowa krytyka, polecenia i oceny nie są mobbingiem.'],
    errors: [
      ['B', 'Jednorazowe zdarzenie to nie mobbing.', 'Mobbing jest długotrwały i uporczywy.'],
      ['C', 'Egzekwowanie obowiązków to prawo pracodawcy.', 'To nie mobbing.'],
      ['D', 'Ocena pracy jest normalna.', 'To nie mobbing.'],
    ],
  }),
  choice({
    id: 'bw-e-2',
    skill: 'biz-work-ethics',
    kind: 'foundation',
    difficulty: 2,
    prompt: 'Które zachowanie pracownika jest nieetyczne wobec pracodawcy?',
    choices: ['przekazywanie konkurencji poufnych danych klientów firmy', 'zgłoszenie przełożonemu błędu w procedurze', 'wykorzystanie przysługującego urlopu', 'udział w szkoleniu organizowanym przez firmę'],
    answer: 'A',
    hints: ['Czyje interesy narusza przekazanie danych konkurencji?', 'Pracodawcy i klientów.', 'Czy pozostałe zachowania są uprawnione?', 'Tak — to normalne prawa i obowiązki pracownika.'],
    steps: ['Ujawnianie tajemnicy firmy i danych klientów narusza lojalność wobec pracodawcy i prawo.', 'Zgłaszanie błędów, urlop i szkolenia są w porządku.'],
    errors: [
      ['B', 'Zgłaszanie błędów to postawa odpowiedzialna.', 'Nieetyczne jest ujawnianie tajemnicy firmy.'],
      ['C', 'Urlop to prawo pracownika.', 'Nieetyczne jest ujawnianie tajemnicy firmy.'],
      ['D', 'Szkolenie to rozwój pracownika.', 'Nieetyczne jest ujawnianie tajemnicy firmy.'],
    ],
  }),
  choice({
    id: 'bw-e-3',
    skill: 'biz-work-ethics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Pracownica podejrzewa, że jest ofiarą mobbingu. Które działanie jest najrozsądniejszym pierwszym krokiem?',
    choices: ['zbieranie dowodów i zgłoszenie sprawy w firmie lub do PIP', 'złożenie wypowiedzenia i szukanie nowej pracy', 'publiczne oskarżenie przełożonego w mediach społecznościowych', 'czekanie kilka miesięcy, aż sytuacja sama się poprawi'],
    answer: 'A',
    hints: ['Czego potrzeba, żeby udowodnić mobbing?', 'Dowodów, że nękanie było uporczywe i długotrwałe.', 'Gdzie można zgłosić problem?', 'Wewnętrznie w firmie albo do Państwowej Inspekcji Pracy.'],
    steps: ['Mobbing trzeba udowodnić — dowody zbiera się na bieżąco.', 'Zgłoszenie wewnętrzne lub do PIP uruchamia formalne działania.'],
    errors: [
      ['B', 'Odejście nie chroni praw i nie zatrzymuje mobbingu.', 'Najpierw dowody i zgłoszenie.'],
      ['C', 'Publiczne oskarżenia mogą naruszać prawo.', 'Zgłoś sprawę właściwą drogą.'],
      ['D', 'Mobbing zwykle się nasila.', 'Reaguj i dokumentuj.'],
    ],
  }),
  text({
    id: 'bw-e-4',
    skill: 'biz-work-ethics',
    kind: 'typical',
    difficulty: 3,
    prompt: 'Uzupełnij: osoba, która zgłasza nieprawidłowości w firmie (np. łamanie prawa), a ustawa chroni ją przed działaniami odwetowymi, to ________.',
    answer: 'sygnalista',
    variants: ['sygnalistka', 'demaskator'],
    hints: ['Jak nazywa się osoba, która „daje sygnał” o nieprawidłowościach?', 'Nazwa pochodzi od słowa „sygnał”.', 'Po angielsku to „whistleblower”.', 'Polska ustawa z 2024 r. nazywa ją tak samo.'],
    steps: ['Osoba zgłaszająca naruszenia prawa w organizacji to sygnalista.', 'Prawo chroni ją przed zwolnieniem i innymi działaniami odwetowymi.'],
    errors: [['donosiciel', 'Określenie wartościujące negatywnie.', 'Prawo używa słowa „sygnalista”.']],
  }),
  choice({
    id: 'bw-e-5',
    skill: 'biz-work-ethics',
    kind: 'transfer',
    difficulty: 4,
    prompt: 'Firma zatrudnia pracowników „na czarno”, bez umów i zgłoszenia do ZUS. Kto na tym traci?',
    choices: ['pracownicy, uczciwi konkurenci i budżet państwa', 'wyłącznie budżet państwa, bo nie dostaje podatków', 'nikt — pracownicy dostają więcej pieniędzy do ręki', 'wyłącznie pracownicy, bo nie mają ubezpieczenia'],
    answer: 'A',
    hints: ['Czy pracownik bez umowy ma ubezpieczenie zdrowotne i przyszłą emeryturę?', 'Nie.', 'Jak czuje się firma, która płaci wszystkie składki i podatki?', 'Konkuruje z nieuczciwą firmą o niższych kosztach.'],
    steps: ['Pracownik traci ochronę ubezpieczeniową i prawa pracownicze.', 'Uczciwi konkurenci są w gorszej pozycji, a państwo traci wpływy z podatków i składek.'],
    errors: [
      ['B', 'Traci nie tylko budżet.', 'Tracą też pracownicy i uczciwe firmy.'],
      ['C', 'Wyższa kwota do ręki nie rekompensuje braku ochrony.', 'Pracownik traci ubezpieczenie.'],
      ['D', 'Tracą też uczciwi konkurenci i państwo.', 'Szara strefa szkodzi wielu stronom.'],
    ],
  }),
  choice({
    id: 'bw-e-6',
    skill: 'biz-work-ethics',
    kind: 'transfer',
    difficulty: 5,
    prompt: 'Firma przyjęła kodeks etyki. Które rozwiązanie najlepiej sprawi, że nie pozostanie on tylko dokumentem na stronie internetowej?',
    choices: ['szkolenia, anonimowy kanał zgłoszeń i reagowanie na naruszenia', 'wywieszenie kodeksu w recepcji i w każdym biurze', 'podpisanie kodeksu przez prezesa i wszystkich pracowników', 'dopisanie do kodeksu większej liczby szczegółowych zasad'],
    answer: 'A',
    hints: ['Po czym poznać, że zasady naprawdę działają?', 'Po tym, jak firma reaguje na ich łamanie.', 'Co musi wiedzieć pracownik, żeby stosować kodeks?', 'Znać zasady i mieć bezpieczną drogę zgłoszenia naruszenia.'],
    steps: ['Kodeks działa, gdy pracownicy go znają, mogą bezpiecznie zgłaszać naruszenia, a firma reaguje.', 'Konsekwencja wobec kierowników buduje wiarygodność.'],
    errors: [
      ['B', 'Samo wywieszenie nie zmienia zachowań.', 'Potrzebne są szkolenia i reakcje na naruszenia.'],
      ['C', 'Podpisy to formalność.', 'Potrzebne są szkolenia i reakcje na naruszenia.'],
      ['D', 'Więcej zasad nie oznacza ich przestrzegania.', 'Potrzebne są szkolenia i reakcje na naruszenia.'],
    ],
  }),
];

// ===========================================================================
// Fiszki
// ===========================================================================

export const WORK_CARDS: Flashcard[] = [
  card('c-bw-m-1', 'biz-labor-measures', 'wzor', 'Stopa bezrobocia?', 'bezrobotni : aktywni zawodowo · 100% (aktywni = pracujący + bezrobotni).'),
  card('c-bw-m-2', 'biz-labor-measures', 'definicja', 'Bezrobocie strukturalne?', 'Kwalifikacje bezrobotnych nie pasują do potrzeb gospodarki.'),

  card('c-bw-c-1', 'biz-career', 'definicja', 'Cel SMART?', 'Konkretny, mierzalny, osiągalny, istotny, określony w czasie.'),
  card('c-bw-c-2', 'biz-career', 'metoda', 'Metoda STAR?', 'Sytuacja, zadanie, działanie, rezultat — odpowiedź na pytania o doświadczenie.'),

  card('c-bw-f-1', 'biz-employment-forms', 'definicja', 'Zlecenie a dzieło?', 'Zlecenie: staranne działanie. Dzieło: konkretny rezultat.'),
  card('c-bw-f-2', 'biz-employment-forms', 'wzor', 'Okresy wypowiedzenia (czas nieokreślony)?', '2 tygodnie (< 6 mies.), 1 miesiąc (≥ 6 mies.), 3 miesiące (≥ 3 lata).'),

  card('c-bw-w-1', 'biz-wages-taxes', 'pulapka', 'Od czego liczy się składkę zdrowotną?', 'Od brutto pomniejszonego o składki społeczne.'),
  card('c-bw-w-2', 'biz-wages-taxes', 'wzor', 'Netto?', 'brutto − składki społeczne − składka zdrowotna − zaliczka na PIT.'),

  card('c-bw-e-1', 'biz-work-ethics', 'definicja', 'Mobbing?', 'Uporczywe i długotrwałe nękanie lub zastraszanie pracownika.'),
  card('c-bw-e-2', 'biz-work-ethics', 'definicja', 'Sygnalista?', 'Osoba zgłaszająca naruszenia prawa w organizacji, chroniona przed odwetem.'),
];

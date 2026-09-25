import type { LessonExplanation } from '@/data/types';

/** Wykład: kompetencje przedsiębiorcze oraz rynek i mechanizm rynkowy. */
export const WYKLAD_RYNEK: Record<string, LessonExplanation> = {
  'biz-entrepreneurship': {
    idea: [
      'Przedsiębiorczość to postawa, a nie zawód: zauważasz problem albo okazję, bierzesz sprawę w swoje ręce i doprowadzasz ją do końca. Uczeń, który sam organizuje zbiórkę, jest przedsiębiorczy, choć nie ma firmy.',
      'Innowacja to nie tylko wynalazek, ale każde wprowadzenie czegoś nowego lub wyraźnie lepszego: produktu, sposobu wytwarzania, sposobu sprzedaży albo organizacji pracy. Rozróżnienie jest proste: czy zmienia się to, CO firma oferuje, czy to, JAK to robi?',
      'Źródłem innowacji są zmiany wokół nas: nowe technologie, starzenie się społeczeństwa, nowe przepisy, zmiana gustów. Przedsiębiorca patrzy na zmianę jak na szansę — tam, gdzie inni widzą kłopot, on widzi niezaspokojoną potrzebę.',
    ],
    method: [
      'W opisie sytuacji znajdź, kto działa i z czyjej inicjatywy — to wskazuje postawę przedsiębiorczą.',
      'Przy innowacji zapytaj: zmienia się produkt (co), proces (jak wytwarzamy), marketing (jak sprzedajemy) czy organizacja (jak pracujemy)?',
      'Oceń ryzyko: czy jest rozsądne i zabezpieczone, czy to hazard?',
      'Wskaż źródło szansy: technologia, demografia, prawo, styl życia.',
    ],
    check: {
      question: 'Fabryka mebli zastąpiła ręczne cięcie desek maszyną sterowaną komputerem. Jaki to rodzaj innowacji?',
      answer: 'Procesowa — zmienia się sposób wytwarzania, a nie oferowany produkt.',
    },
  },
  'biz-soft-skills': {
    idea: [
      'Komunikacja to nie tylko słowa: ton głosu, mimika i postawa często mówią więcej niż treść. Komunikat „ja” („denerwuję się, gdy…”) opisuje twoje uczucia i skutki sytuacji zamiast oskarżać — dlatego druga strona słucha, zamiast się bronić.',
      'Reguły wpływu działają, bo są skrótami myślowymi, które zwykle nam służą: odwdzięczamy się za przysługi, ufamy ekspertom, robimy to co inni. Manipulator wykorzystuje te odruchy — darmowy poczęstunek przed sprzedażą, „wszyscy już kupili”, „oferta tylko dziś”. Kto zna mechanizm, ten go rozpoznaje.',
      'Zarządzanie czasem to wybieranie, a nie robienie wszystkiego. Macierz Eisenhowera dzieli zadania na ważne i pilne; najwięcej zyskujesz na zadaniach ważnych, ale niepilnych (nauka, zdrowie, rozwój), bo nikt ich za ciebie nie wpisze w kalendarz.',
    ],
    method: [
      'W sytuacji komunikacyjnej rozpoznaj, czy komunikat opisuje uczucia i fakty („ja”), czy ocenia osobę („ty”).',
      'Przy próbie wpływu nazwij regułę: wzajemność, zaangażowanie, społeczny dowód słuszności, lubienie, autorytet, niedostępność.',
      'Zadania przypisz do ćwiartek Eisenhowera według tego, czy są ważne i czy są pilne.',
      'Decyzję podejmuj etapami: problem, informacje, warianty, ocena i wybór, wdrożenie, ocena skutków.',
    ],
    check: {
      question: 'Reklama mówi: „9 na 10 dentystów poleca tę pastę”. Z jakiej reguły wpływu korzysta?',
      answer: 'Z reguły autorytetu — powołuje się na opinię ekspertów.',
    },
  },
  'biz-scarcity': {
    idea: [
      'Nie da się mieć wszystkiego: czas, pieniądze i surowce są ograniczone, a potrzeby nie mają końca. To jest rzadkość — i powód, dla którego ekonomia jest nauką o wybieraniu.',
      'Każdy wybór coś kosztuje, nawet jeśli nic nie płacisz. Jeśli zamiast pracy za 180 zł idziesz na darmowy koncert, prawdziwy koszt koncertu to 180 zł, których nie zarobisz. Koszt alternatywny to wartość najlepszej rzeczy, z której zrezygnowałeś.',
      'Żeby coś wytworzyć, potrzebujesz czynników produkcji: ziemi (zasobów natury), pracy (ludzi), kapitału (maszyn i budynków) i przedsiębiorczości (kogoś, kto to połączy i zaryzykuje). „Kapitał” w ekonomii to więc maszyna, a nie pieniądze na koncie.',
    ],
    method: [
      'Wypisz dostępne opcje i wartość każdej z nich.',
      'Koszt alternatywny wybranej opcji to wartość NAJLEPSZEJ odrzuconej opcji (plus ewentualny wydatek).',
      'Przy czynnikach produkcji zapytaj: to dar natury, wysiłek człowieka, wytworzone narzędzie czy organizacja i ryzyko?',
      'W obiegu okrężnym ustal, kto komu co dostarcza, a kto płaci.',
    ],
    check: {
      question: 'W sobotę możesz pracować za 150 zł albo pomagać sąsiadowi za 100 zł. Wybierasz naukę. Jaki jest jej koszt alternatywny?',
      answer: '150 zł — wartość najlepszej odrzuconej opcji, a nie suma obu.',
    },
  },
  'biz-supply-demand': {
    idea: [
      'Popyt to ile ludzie chcą kupić przy różnych cenach, podaż — ile firmy chcą sprzedać. Gdy produkt drożeje, kupujący kupują mniej (szukają zamienników), a sprzedający chcą sprzedać więcej (bardziej się to opłaca). Dlatego krzywa popytu opada, a krzywa podaży rośnie.',
      'Cena równowagi to cena, przy której obie strony się „dogadały”: ile chcą kupić, dokładnie tyle chcą sprzedać. Przy wyższej cenie towar zalega (nadwyżka), przy niższej — brakuje go (niedobór), a cena sama wraca do równowagi.',
      'Trzeba odróżnić ruch po krzywej od jej przesunięcia. Zmiana ceny samego towaru to ruch po krzywej. Zmiana czegoś innego — dochodów, mody, ceny zamiennika, kosztów produkcji — przesuwa całą krzywą, bo przy każdej cenie kupujący (albo firmy) chcą innej ilości.',
    ],
    method: [
      'Ustal, czy zmiana dotyczy kupujących (popyt), czy sprzedających (podaż).',
      'Określ kierunek przesunięcia: w prawo (więcej przy każdej cenie) albo w lewo.',
      'Narysuj szkic i odczytaj, co dzieje się z ceną i ilością równowagi.',
      'W wersji liczbowej przyrównaj popyt do podaży i rozwiąż równanie.',
    ],
    check: {
      question: 'Susza zniszczyła uprawy truskawek. Co stanie się z ich ceną i sprzedaną ilością?',
      answer: 'Podaż przesuwa się w lewo: cena rośnie, a sprzedana ilość spada.',
    },
  },
  'biz-price-controls': {
    idea: [
      'Cena maksymalna to sufit: nie wolno sprzedawać drożej. Ma chronić kupujących, ale jeśli sufit jest niżej niż cena równowagi, sprzedawcom mniej się opłaca, a kupujący chcą kupić więcej — towaru zaczyna brakować. Pojawiają się kolejki i handel „spod lady”.',
      'Cena minimalna to podłoga: nie wolno sprzedawać taniej. Ma chronić sprzedających (np. rolników albo pracowników — płaca minimalna). Jeśli podłoga jest wyżej niż cena równowagi, chętnych do sprzedaży jest więcej niż kupujących — powstaje nadwyżka, a na rynku pracy może rosnąć bezrobocie.',
      'Sufit ponad ceną równowagi i podłoga pod nią nic nie zmieniają: taka cena urzędowa po prostu „nie wiąże”, bo rynek i tak ustala cenę gdzie indziej. Dlatego zawsze najpierw porównujesz cenę urzędową z ceną równowagi.',
    ],
    method: [
      'Policz cenę równowagi (popyt = podaż).',
      'Sprawdź, czy cena urzędowa wiąże: maksymalna poniżej równowagi, minimalna powyżej niej.',
      'Jeśli wiąże, policz popyt i podaż przy cenie urzędowej.',
      'Niedobór = popyt − podaż (przy cenie maksymalnej); nadwyżka = podaż − popyt (przy minimalnej).',
    ],
    check: {
      question: 'Rynkowy czynsz za mieszkanie to 3000 zł. Miasto ustala czynsz maksymalny 2500 zł. Co się stanie?',
      answer: 'Powstanie niedobór mieszkań: przy 2500 zł więcej osób chce wynająć, a mniej właścicieli chce wynajmować.',
    },
  },
  'biz-market-structures': {
    idea: [
      'Strukturę rynku wyznaczają dwa pytania: ilu jest sprzedawców i czy ich produkty się różnią. Tysiące rolników z tą samą pszenicą to konkurencja doskonała; kilka sieci komórkowych — oligopol; jeden dostawca wody w mieście — monopol; wiele kawiarni, każda trochę inna — konkurencja monopolistyczna.',
      'Im mniej konkurentów, tym większa władza nad ceną. W konkurencji doskonałej nikt nie może podnieść ceny, bo klienci od razu pójdą do innego. Monopolista może, bo klient nie ma dokąd pójść — stąd wyższe ceny i słabsza motywacja do ulepszeń.',
      'Dlatego państwo chroni konkurencję: zakazuje zmów cenowych i nadużywania pozycji dominującej, a pilnuje tego UOKiK. Sam monopol nie jest zakazany — zakazane jest wykorzystywanie go przeciw klientom.',
    ],
    method: [
      'Policz sprzedawców: jeden, kilku czy wielu.',
      'Sprawdź, czy produkty są jednakowe, czy zróżnicowane (marka, jakość, lokalizacja).',
      'Przypisz strukturę: monopol, oligopol, konkurencja monopolistyczna, konkurencja doskonała.',
      'Oceń zachowanie firm: uczciwa konkurencja czy zmowa albo nadużycie pozycji.',
    ],
    check: {
      question: 'Rynek pizzerii w dużym mieście: wiele lokali, każdy z innym menu i klimatem. Jaka to struktura?',
      answer: 'Konkurencja monopolistyczna — wielu sprzedawców, ale ich produkty się różnią.',
    },
  },
};

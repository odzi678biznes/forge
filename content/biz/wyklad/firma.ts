import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: przedsiębiorstwo i biznesplan. */
export const WYKLAD_FIRMA: Record<string, LessonExplanation> = {
  'biz-enterprise-types': {
    idea: [
      'Najważniejsze pytanie przy wyborze formy prawnej brzmi: co stracisz, jeśli firma nie spłaci długów? W jednoosobowej działalności i w spółce jawnej właściciele odpowiadają całym prywatnym majątkiem — także mieszkaniem. W spółce z o.o. i akcyjnej za długi odpowiada majątek spółki, a wspólnik ryzykuje głównie to, co do niej wniósł.',
      'Ochrona ma swoją cenę: spółki kapitałowe wymagają kapitału zakładowego (sp. z o.o. co najmniej 5000 zł, akcyjna 100 000 zł), prowadzenia pełnej księgowości i więcej formalności. Dlatego mała firma zwykle zaczyna jako jednoosobowa działalność, a spółkę zakłada, gdy rośnie ryzyko i skala.',
      'Właściciel jednoosobowej działalności wybiera formę podatku. Ryczałt liczy się od przychodu, więc koszty nie obniżają podatku — opłaca się, gdy kosztów jest mało. Podatek liniowy (19%) i skala liczą się od dochodu, czyli przychodu minus koszty.',
    ],
    method: [
      'Ustal, kto i jak odpowiada za długi: całym majątkiem, solidarnie ze wspólnikami czy tylko majątkiem spółki.',
      'Rozróżnij spółki osobowe (cywilna, jawna, partnerska, komandytowa) i kapitałowe (z o.o., akcyjna).',
      'Porównanie podatków: ryczałt = stawka · przychód; liniowy = 19% · (przychód − koszty).',
      'Wielkość firmy odczytaj z liczby pracowników: mikro poniżej 10, mała poniżej 50, średnia poniżej 250.',
    ],
    check: {
      question: 'Kto odpowiada za długi spółki z o.o.?',
      answer: 'Sama spółka swoim majątkiem. Wspólnicy nie odpowiadają osobiście (wyjątkiem jest zarząd, który w porę nie zgłosił upadłości).',
    },
  },
  'biz-business-model': {
    idea: [
      'Dobry biznes zaczyna się od problemu klienta, a nie od produktu, który ci się podoba. Zanim wydasz oszczędności, sprawdź, kto ma ten problem, jak go dziś rozwiązuje i ile zapłaciłby za lepsze rozwiązanie.',
      'Badania pierwotne robisz sam (ankiety, wywiady, obserwacja, tajemniczy klient), wtórne korzystają z gotowych danych (raporty, GUS). Zamiast budować od razu pełny produkt, wypuszcza się MVP — najprostszą wersję, która pozwala sprawdzić, czy ktoś naprawdę chce za nią zapłacić.',
      'Business Model Canvas mieści cały pomysł na jednej kartce w 9 blokach: kto jest klientem, co mu dajemy (propozycja wartości), jak do niego docieramy, jakie mamy z nim relacje, z czego mamy przychody, jakie zasoby, działania i partnerów potrzebujemy i ile to kosztuje.',
    ],
    method: [
      'Zdefiniuj problem i segment klientów.',
      'Sformułuj propozycję wartości: dlaczego klient wybierze nas, a nie konkurencję?',
      'Dobierz badanie: pierwotne (własne) czy wtórne (gotowe dane); sprawdź pomysł na MVP.',
      'Przypisz elementy opisu do bloków Canvas: klienci, wartość, kanały, relacje, przychody, zasoby, działania, partnerzy, koszty.',
    ],
    check: {
      question: 'Do którego bloku Business Model Canvas należy „najważniejszy dostawca surowców”?',
      answer: 'Do kluczowych partnerów.',
    },
  },
  'biz-environment-swot': {
    idea: [
      'Firma nie działa w próżni. Makrootoczenie to wielkie siły, na które nie ma wpływu: prawo i polityka, gospodarka, społeczeństwo, technologia (analiza PEST). Mikrootoczenie to bliscy gracze: klienci, dostawcy, konkurenci.',
      'SWOT to proste pytanie zadane dwa razy. Czy firma ma wpływ na ten czynnik? Tak — to mocna albo słaba strona (wnętrze firmy). Nie — to szansa albo zagrożenie (otoczenie). Rosnąca moda na zdrową żywność jest szansą, nawet dla firmy, która ją sprzedaje — bo to nie firma wywołała tę modę.',
      'Przewaga konkurencyjna to trwały powód, dla którego klienci wybierają właśnie tę firmę: niższy koszt, jakość, marka, technologia. Chroni ją własność intelektualna: patent chroni wynalazek, znak towarowy — nazwę i logo, prawo autorskie — utwory.',
    ],
    method: [
      'Dla każdego czynnika zapytaj: wewnętrzny (zależy od firmy) czy zewnętrzny?',
      'Wewnętrzny: pomaga — mocna strona, szkodzi — słaba strona.',
      'Zewnętrzny: pomaga — szansa, szkodzi — zagrożenie.',
      'Strategię buduj na mocnych stronach, wykorzystując szanse; ogranicz słabości i przygotuj się na zagrożenia.',
    ],
    check: {
      question: 'Nowa ustawa obniża podatki dla małych firm. Który to element SWOT?',
      answer: 'Szansa — czynnik zewnętrzny i korzystny dla firmy.',
    },
  },
  'biz-profitability': {
    idea: [
      'Koszty dzielą się na dwie grupy. Stałe płacisz, nawet jeśli nic nie sprzedasz (czynsz, pensje biura, leasing). Zmienne rosną z każdą sztuką (surowiec, opakowanie). Z każdej sprzedanej sztuki zostaje marża jednostkowa, czyli cena minus koszt zmienny — i ta marża po kawałku spłaca koszty stałe.',
      'Próg rentowności to liczba sztuk, przy której marże dokładnie pokryły koszty stałe — firma wychodzi na zero. Każda następna sztuka to już czysty zysk w wysokości marży.',
      'Jeśli cena nie przekracza kosztu zmiennego, marża jest zerowa albo ujemna i progu nie ma — każda kolejna sprzedaż tylko powiększa stratę.',
    ],
    method: [
      'Wypisz koszty stałe (KS), cenę (c) i koszt zmienny na sztukę (kz).',
      'Marża jednostkowa = c − kz.',
      r`Próg rentowności: $Q = \frac{KS}{c - kz}$; w złotych: $Q \cdot c$.`,
      r`Zysk przy sprzedaży $q$ sztuk: $q(c - kz) - KS$; sprzedaż potrzebna do zysku $Z$: $\frac{KS + Z}{c - kz}$.`,
    ],
    check: {
      question: 'Koszty stałe to 9000 zł miesięcznie, cena 40 zł, koszt zmienny 25 zł na sztukę. Ile wynosi próg rentowności?',
      answer: '9000 : (40 − 25) = 600 sztuk miesięcznie.',
    },
  },
  'biz-financing-risk': {
    idea: [
      'Pieniądze na firmę są własne (oszczędności, wkłady wspólników, zysk zostawiony w firmie) albo obce (kredyt, pożyczka, leasing, dotacja). Obce trzeba zwykle oddać z odsetkami, ale nie oddajesz kontroli nad firmą.',
      'Anioł biznesu i fundusz venture capital działają inaczej: dają pieniądze bez obowiązku spłaty, ale w zamian biorą udziały i wpływ na decyzje. Liczą na duży zwrot, gdy firma urośnie — to wspólnicy, a nie darczyńcy.',
      'Ryzyka nie da się wyeliminować, ale można je porównać i zaplanować reakcję. Ryzyko ocenia się dwiema miarami: jak bardzo jest prawdopodobne i jak dotkliwe byłoby jego wystąpienie. Iloczyn tych miar to oczekiwana strata.',
    ],
    method: [
      'Ustal źródło: własne czy obce; czy trzeba je spłacić i czy oddajesz udziały.',
      'Dla każdego ryzyka oszacuj prawdopodobieństwo i skutek finansowy.',
      'Oczekiwana strata = prawdopodobieństwo · skutek; porównaj ryzyka.',
      'Wybierz reakcję: unikanie, ograniczanie, przeniesienie (np. ubezpieczenie) albo akceptacja.',
    ],
    check: {
      question: 'Ryzyko ma 20% szans wystąpienia i grozi stratą 30 000 zł. Ile wynosi oczekiwana strata?',
      answer: '0,2 · 30 000 zł = 6000 zł.',
    },
  },
};

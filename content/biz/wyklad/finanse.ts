import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: finanse osobiste i rynek finansowy. */
export const WYKLAD_FINANSE: Record<string, LessonExplanation> = {
  'biz-money-institutions': {
    idea: [
      'Pieniądz ma wartość, bo wszyscy zgadzamy się go przyjmować. Wcześniej ludzie wymieniali się towarami — ale szewc, który chciał chleba, musiał znaleźć piekarza potrzebującego butów. Pieniądz rozwiązał ten problem: jest środkiem wymiany, a przy okazji miarą wartości, sposobem przechowywania oszczędności i spłacania długów.',
      'NBP to „bank banków”: jako jedyny emituje banknoty i monety, prowadzi politykę pieniężną, przechowuje rezerwy walutowe i obsługuje budżet państwa. Zwykły klient nie założy w NBP konta — do tego są banki komercyjne.',
      'Nad bezpieczeństwem rynku czuwa kilka instytucji: KNF nadzoruje banki, ubezpieczycieli i giełdę, a BFG gwarantuje depozyty do równowartości 100 000 euro na osobę w jednym banku. Na giełdzie (GPW) handluje się akcjami i obligacjami.',
    ],
    method: [
      'W opisie sytuacji znajdź, co robi pieniądz: płacisz (wymiana), porównujesz ceny (miernik), odkładasz (przechowywanie), spłacasz dług (płatniczy).',
      'Przypisz zadanie instytucji: emisja i stopy — NBP (RPP), nadzór — KNF, gwarancja depozytów — BFG, obrót akcjami — GPW.',
      'Odróżnij bank centralny (NBP) od banków komercyjnych (depozyty i kredyty dla klientów).',
    ],
    check: {
      question: 'Kto w Polsce emituje banknoty: Ministerstwo Finansów, NBP czy PKO BP?',
      answer: 'NBP — emisja pieniądza to jego wyłączne zadanie. PKO BP to bank komercyjny.',
    },
  },
  'biz-household': {
    idea: [
      'Budżet domowy to plan, a nie tylko zapis: ile wpływa, ile musi wypłynąć (czynsz, raty, rachunki), a ile zostaje na resztę. Rodzina, która wie, dokąd idą pieniądze, może zdecydować, na co je przeznaczyć, zamiast co miesiąc się dziwić.',
      'Najskuteczniejsza zasada brzmi: najpierw odłóż, potem wydawaj. Poduszka finansowa na 3–6 miesięcy wydatków chroni przed zaciąganiem pożyczki, gdy zepsuje się pralka albo przyjdzie choroba.',
      'Spirala zadłużenia zaczyna się, gdy ratę jednej pożyczki spłaca się drugą, często droższą. Z każdym miesiącem długów przybywa. Wyjście zaczyna się od pełnej listy zobowiązań, a potem rozmowy z wierzycielami i planu spłaty — a nie od kolejnej „szybkiej chwilówki”.',
    ],
    method: [
      'Zsumuj dochody i wydatki; podziel wydatki na stałe i zmienne.',
      r`Udział wydatku: $\frac{\text{wydatek}}{\text{dochód}} \cdot 100\%$.`,
      'Sprawdź bilans: nadwyżka — budżet zrównoważony z zapasem; niedobór — szukaj oszczędności w wydatkach zmiennych.',
      'Przy długach: spisz wszystkie, ustal priorytety (najdroższe najpierw), negocjuj, nie zaciągaj nowych na spłatę starych.',
    ],
    check: {
      question: 'Dochody rodziny to 5000 zł, a wydatki stałe 3500 zł. Jaki to procent dochodu?',
      answer: '3500 : 5000 · 100% = 70%.',
    },
  },
  'biz-banking': {
    idea: [
      'Bank zarabia na różnicy: płaci niewielkie odsetki od lokat, a pożycza drożej. Dla ciebie konto służy do codziennych rozliczeń, lokata — do bezpiecznego odkładania, a kredyt — do sfinansowania czegoś teraz kosztem spłaty później.',
      'Reklamy kuszą niską ratą, ale rata nic nie mówi o koszcie — można ją obniżyć, wydłużając spłatę. Uczciwą miarą jest RRSO, bo zawiera odsetki, prowizje i obowiązkowe ubezpieczenia, oraz całkowita kwota do zapłaty.',
      'Oprocentowanie lokaty podaje się w skali roku. Lokata na 3 miesiące na 4% daje odsetki za ćwierć roku, czyli 1% kapitału, a od odsetek pobiera się 19% podatku (podatek Belki).',
    ],
    method: [
      r`Odsetki brutto z lokaty: $K \cdot r \cdot \frac{m}{12}$ ($m$ — liczba miesięcy).`,
      r`Odsetki netto: brutto $\cdot\, 0{,}81$ (po podatku 19%).`,
      'Całkowity koszt kredytu = suma wszystkich wpłat − pożyczona kwota.',
      'Porównuj kredyty po RRSO i całkowitej kwocie do zapłaty, nie po racie.',
    ],
    check: {
      question: 'Lokata 10 000 zł na 6 miesięcy, oprocentowanie 6% w skali roku, podatek 19%. Ile wyniosą odsetki netto?',
      answer: r`Brutto: $10\,000 \cdot 0{,}06 \cdot \frac{6}{12} = 300$ zł; netto: $300 \cdot 0{,}81 = 243$ zł.`,
    },
  },
  'biz-compound-saving': {
    idea: [
      'W procencie składanym odsetki dopisuje się do kapitału, więc w kolejnym roku zarabiają także one. Na początku różnica jest mała, ale z czasem rośnie lawinowo — jak kula śnieżna toczona z góry. Dlatego liczy się przede wszystkim czas: kto zaczyna oszczędzać wcześniej, ten potrzebuje mniejszych wpłat.',
      'Liczba złotych na koncie to nie wszystko. Jeśli lokata daje 6%, a ceny rosną o 4%, za oszczędności kupisz realnie tylko o około 2% więcej. Gdy inflacja przewyższa oprocentowanie, oszczędności realnie tracą wartość, choć złotych przybywa.',
      'Każdą formę oszczędzania ocenia się trzema miarami: ile zarobisz (rentowność), czy możesz stracić (ryzyko) i jak szybko odzyskasz pieniądze bez straty (płynność). Nie ma formy najlepszej we wszystkim naraz.',
    ],
    method: [
      r`Kapitał po $n$ okresach: $K_n = K_0(1 + r)^n$.`,
      r`Przy kapitalizacji częstszej niż roczna podziel stopę i pomnóż liczbę okresów: $K_0\left(1 + \frac{r}{k}\right)^{nk}$.`,
      r`Stopa realna: $1 + r_{\text{real}} = \frac{1 + r_{\text{nom}}}{1 + i}$, w przybliżeniu $r_{\text{nom}} - i$.`,
      'Reguła 72: lata do podwojenia kapitału ≈ 72 : oprocentowanie w procentach.',
    ],
    check: {
      question: 'Ile będzie po 2 latach z 1000 zł na 10% rocznie przy kapitalizacji rocznej (bez podatku)?',
      answer: r`$1000 \cdot 1{,}1^2 = 1210$ zł — o 10 zł więcej niż przy procencie prostym.`,
    },
  },
  'biz-investing': {
    idea: [
      'Kupując akcję, stajesz się współwłaścicielem firmy: masz prawo do części zysku (dywidendy) i głosu na walnym zgromadzeniu, ale cena akcji może spaść. Kupując obligację, pożyczasz pieniądze państwu albo firmie — dostajesz ustalone odsetki, a ryzyko jest zwykle mniejsze.',
      'Wyższy możliwy zysk zawsze idzie w parze z wyższym ryzykiem. Kto obiecuje „pewne 30% miesięcznie”, ten albo kłamie, albo nie rozumie ryzyka. Ryzyko ograniczasz dywersyfikacją, czyli rozłożeniem pieniędzy na różne spółki, branże i instrumenty — „nie wkładaj wszystkich jajek do jednego koszyka”.',
      'Największym wrogiem inwestora bywa jego własna psychika: kupowanie, bo wszyscy kupują, sprzedawanie w panice i niechęć do przyznania się do straty. Gwarancja BFG dotyczy depozytów bankowych — nie akcji ani funduszy.',
    ],
    method: [
      r`Stopa zwrotu: $\frac{\text{cena sprzedaży} - \text{cena zakupu} + \text{dywidendy}}{\text{cena zakupu}} \cdot 100\%$.`,
      'Oceń instrument: rentowność, ryzyko, płynność.',
      'Dopasuj go do celu i horyzontu: pieniądze potrzebne za rok nie powinny leżeć w akcjach.',
      'Rozróżnij analizę fundamentalną (kondycja spółki) i techniczną (wykresy notowań).',
    ],
    check: {
      question: 'Kupiono akcję za 40 zł, otrzymano 2 zł dywidendy i sprzedano ją za 44 zł. Jaka była stopa zwrotu?',
      answer: '(44 − 40 + 2) : 40 · 100% = 15%.',
    },
  },
  'biz-insurance': {
    idea: [
      'Ubezpieczenie to wspólna kasa: wielu ludzi płaci niewielkie składki, a pieniądze trafiają do tych nielicznych, których spotka szkoda. Płacisz pewną małą kwotę, żeby nie ponieść niepewnej, ale ogromnej straty.',
      'Część ubezpieczeń jest obowiązkowa. Ubezpieczenia społeczne w ZUS (emerytalne, rentowe, chorobowe, wypadkowe) i zdrowotne w NFZ płacą pracujący. OC posiadacza pojazdu jest obowiązkowe, bo chroni innych przed szkodami, które wyrządzisz; AC chroni twój własny samochód i jest dobrowolne.',
      'Jeśli ubezpieczysz dom wart 400 000 zł tylko na 300 000 zł, ubezpieczyciel uzna, że chronisz 3/4 wartości — i przy szkodzie wypłaci 3/4 jej kwoty. To zasada proporcji: niedoubezpieczenie obniża każde odszkodowanie, a nie tylko te największe.',
    ],
    method: [
      'Ustal rodzaj: społeczne czy dobrowolne, osobowe (życie, zdrowie), majątkowe (rzeczy) czy OC (szkody wyrządzone innym).',
      r`Zasada proporcji: $\text{odszkodowanie} = \text{szkoda} \cdot \frac{\text{suma ubezpieczenia}}{\text{wartość mienia}}$.`,
      'Franszyzę redukcyjną (udział własny) odejmij od odszkodowania.',
      'Szczegóły i wyłączenia sprawdzaj w OWU przed podpisaniem umowy.',
    ],
    check: {
      question: 'Dom wart 500 000 zł ubezpieczono na 250 000 zł. Szkoda wyniosła 20 000 zł. Ile wypłaci ubezpieczyciel według zasady proporcji?',
      answer: '20 000 · 250 000 : 500 000 = 10 000 zł.',
    },
  },
  'biz-consumer-protection': {
    idea: [
      'Prawo chroni konsumenta mocniej niż firmę, bo zwykle wie on mniej niż sprzedawca. Gdy towar ma wadę, możesz go reklamować — sprzedawca odpowiada za wady ujawnione w ciągu 2 lat, a na reklamację musi odpowiedzieć w 14 dni. Milczenie oznacza, że ją uznał.',
      'Przy zakupie przez internet nie możesz obejrzeć towaru przed zakupem, dlatego masz 14 dni na odstąpienie od umowy bez podawania przyczyny. W sklepie stacjonarnym takiego prawa nie ma — zwrot sprawnego towaru to dobra wola sklepu.',
      'Po pomoc idzie się do właściwej instytucji: rzecznik konsumentów pomaga w sprawach indywidualnych, UOKiK chroni zbiorowe interesy konsumentów, a Rzecznik Finansowy — w sporach z bankami i ubezpieczycielami. Nieuczciwe jest m.in. sprzedawanie produktu niedopasowanego do klienta i ukrywanie kosztów.',
    ],
    method: [
      'Ustal, czy towar jest wadliwy (reklamacja), czy tylko ci się nie podoba (odstąpienie — tylko przy zakupie na odległość).',
      'Sprawdź terminy: 2 lata na ujawnienie wady, 14 dni na odpowiedź sprzedawcy, 14 dni na odstąpienie od umowy zawartej na odległość.',
      'Reklamację składaj na piśmie lub mailem i zachowaj dowód.',
      'Wybierz instytucję: rzecznik konsumentów, UOKiK albo Rzecznik Finansowy.',
    ],
    check: {
      question: 'Kupiłeś buty w sklepie stacjonarnym. Są w porządku, ale zmieniłeś zdanie co do koloru. Czy masz prawo je zwrócić bez podania przyczyny?',
      answer: 'Nie — to prawo dotyczy zakupów na odległość. Sklep może przyjąć zwrot, ale nie musi.',
    },
  },
};

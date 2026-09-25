import type { LessonExplanation } from '@/data/types';

const r = String.raw;

/** Wykład: rynek pracy i zatrudnienie. */
export const WYKLAD_PRACA: Record<string, LessonExplanation> = {
  'biz-labor-measures': {
    idea: [
      'GUS dzieli dorosłych (15 lat i więcej) na trzy grupy: pracujących, bezrobotnych i biernych zawodowo. Bezrobotny to nie każdy, kto nie pracuje — tylko ten, kto pracy aktywnie szuka i jest gotów ją podjąć. Student dzienny, który nie szuka pracy, albo emeryt są bierni zawodowo.',
      'Pracujący i bezrobotni razem to aktywni zawodowo — ludzie, którzy są na rynku pracy. Stopa bezrobocia mówi, jaka część z nich nie może znaleźć pracy, więc dzielisz przez aktywnych, a nie przez całą ludność.',
      'Bezrobocie ma różne przyczyny, a każda wymaga innego lekarstwa: frykcyjne (ktoś właśnie zmienia pracę), strukturalne (umiejętności nie pasują do potrzeb gospodarki — pomagają przekwalifikowania), koniunkturalne (recesja — pomaga ożywienie) i sezonowe (praca tylko w sezonie).',
    ],
    method: [
      'Przypisz osoby do grup: pracujący, bezrobotni (szukają i są gotowi), bierni.',
      'Aktywni zawodowo = pracujący + bezrobotni.',
      r`Stopa bezrobocia $= \frac{\text{bezrobotni}}{\text{aktywni}} \cdot 100\%$; wskaźnik zatrudnienia $= \frac{\text{pracujący}}{\text{ludność 15+}} \cdot 100\%$; współczynnik aktywności $= \frac{\text{aktywni}}{\text{ludność 15+}} \cdot 100\%$.`,
      'Rodzaj bezrobocia rozpoznaj po przyczynie: zmiana pracy, niedopasowanie kwalifikacji, recesja, sezon.',
    ],
    check: {
      question: 'Ludność 15+ to 20 mln, pracujący — 11 mln, bezrobotni — 1 mln. Ile wynosi stopa bezrobocia?',
      answer: '1 : (11 + 1) · 100% ≈ 8,33% — dzielisz przez aktywnych, a nie przez 20 mln.',
    },
  },
  'biz-career': {
    idea: [
      'Karierę planuje się jak podróż: najpierw cel, potem trasa i przystanki. Cel „chcę dużo zarabiać” niczego nie planuje — nie wiadomo, ile to „dużo” ani kiedy. Cel SMART jest konkretny, mierzalny, osiągalny, istotny i określony w czasie, więc po terminie wiesz, czy go osiągnąłeś.',
      'CV i list motywacyjny to reklama twojej osoby skrojona pod konkretną ofertę: pracodawca w kilkanaście sekund szuka tego, czego potrzebuje. Wiele ofert w ogóle nie trafia na portale, dlatego liczą się też kontakty (networking) i bezpośrednie zgłoszenia do firm.',
      'Rozmowa kwalifikacyjna to spotkanie dwóch stron: firma sprawdza ciebie, ty sprawdzasz firmę. O doświadczeniach opowiadaj metodą STAR — sytuacja, zadanie, działanie, rezultat. Na pytania o plany rodzinne czy wyznanie nie musisz odpowiadać, bo naruszają zakaz dyskryminacji.',
    ],
    method: [
      'Sprawdź cel literą po literze: konkretny, mierzalny, osiągalny, istotny, z terminem.',
      'Dopasuj CV do oferty: wymagania z ogłoszenia powinny znaleźć odbicie w doświadczeniach.',
      'Przygotuj 2–3 historie w schemacie STAR.',
      'Po rozmowie poproś o informację zwrotną i wyciągnij wnioski.',
    ],
    check: {
      question: 'Który warunek SMART nie jest spełniony w celu „Do końca roku nauczę się dużo słówek”?',
      answer: 'Mierzalność — nie wiadomo, ile to „dużo”. Lepiej: „do 31 grudnia nauczę się 500 słówek”.',
    },
  },
  'biz-employment-forms': {
    idea: [
      'Umowa o pracę daje najwięcej ochrony: płatny urlop, płatne zwolnienie lekarskie, okres wypowiedzenia i co najmniej płacę minimalną. W zamian pracownik wykonuje pracę pod kierownictwem szefa, w wyznaczonym miejscu i czasie.',
      'Umowy cywilnoprawne są luźniejsze. Zlecenie to staranne wykonywanie czynności (obowiązuje minimalna stawka godzinowa), a umowa o dzieło — dostarczenie konkretnego rezultatu, np. logo czy programu. Nie dają prawa do urlopu. Jeśli jednak ktoś na zleceniu pracuje jak etatowiec, umowa może być pozorna — liczy się rzeczywisty charakter pracy, a nie nazwa umowy.',
      'Długość wypowiedzenia umowy na czas nieokreślony rośnie ze stażem u danego pracodawcy: 2 tygodnie przy stażu poniżej 6 miesięcy, 1 miesiąc od 6 miesięcy, 3 miesiące od 3 lat. Urlop wynosi 20 dni przy stażu pracy poniżej 10 lat i 26 dni od 10 lat.',
    ],
    method: [
      'Zapytaj: czy praca jest pod kierownictwem, w miejscu i czasie wyznaczonym przez szefa? Tak — to umowa o pracę.',
      'Rozliczasz starania (zlecenie) czy konkretny wynik (dzieło)?',
      'Okres wypowiedzenia odczytaj ze stażu u tego pracodawcy.',
      'Wymiar urlopu odczytaj z łącznego stażu pracy: poniżej 10 lat — 20 dni, od 10 lat — 26 dni.',
    ],
    check: {
      question: 'Pracownik ma umowę na czas nieokreślony i pracuje u tego pracodawcy od 8 miesięcy. Jaki ma okres wypowiedzenia?',
      answer: '1 miesiąc — staż wynosi co najmniej 6 miesięcy, ale mniej niż 3 lata.',
    },
  },
  'biz-wages-taxes': {
    idea: [
      'Kwota w umowie to wynagrodzenie brutto. Zanim pieniądze trafią na konto, pracodawca potrąca składki na ubezpieczenia społeczne, składkę zdrowotną i zaliczkę na podatek dochodowy — zostaje netto. Pracodawca dodatkowo płaci własne składki, więc zatrudnienie kosztuje go więcej niż brutto.',
      'Kolejność obliczeń ma znaczenie, bo każda kwota zależy od poprzedniej: składkę zdrowotną liczy się od brutto pomniejszonego o składki społeczne, a podatek od podstawy po odjęciu składek i kosztów uzyskania przychodu. Egzamin podaje dokładne zasady i sprawdza, czy stosujesz je krok po kroku.',
      'Płaca może zależeć od czasu (stawka godzinowa lub miesięczna), od liczby wykonanych sztuk (akord) albo od sprzedaży (prowizja). Do tego dochodzą premie i dodatki. Podatki płacimy też pośrednio: VAT i akcyza są ukryte w cenach.',
    ],
    method: [
      'Ustal brutto zgodnie z systemem płac: stawka · czas, stawka · sztuki albo podstawa + prowizja.',
      'Składki społeczne pracownika = brutto · 13,71% (albo stawka z zadania).',
      'Składka zdrowotna = 9% · (brutto − składki społeczne).',
      'Podatek i netto licz dokładnie według zasad i zaokrągleń podanych w zadaniu; netto = brutto − składki − zdrowotna − podatek.',
    ],
    check: {
      question: 'Ile wynoszą składki społeczne pracownika przy wynagrodzeniu 5000 zł brutto (13,71%)?',
      answer: r`$5000 \cdot 0{,}1371 = 685{,}50$ zł.`,
    },
  },
  'biz-work-ethics': {
    idea: [
      'Etyka w pracy działa w obie strony. Pracownik nie kradnie czasu pracy, nie wynosi tajemnic firmy i nie bierze fałszywych zwolnień. Pracodawca płaci uczciwie i na czas, nie zatrudnia „na czarno” i szanuje godność ludzi.',
      'Mobbing to uporczywe i długotrwałe nękanie albo zastraszanie pracownika, które poniża go, izoluje od zespołu albo obniża jego ocenę własnej przydatności. Kluczowe słowa to „uporczywe” i „długotrwałe” — jednorazowa, nawet ostra, rzeczowa uwaga o spóźnieniu mobbingiem nie jest.',
      'Dyskryminacja to gorsze traktowanie z powodu cechy niezwiązanej z pracą: płci, wieku, niepełnosprawności, wyznania, pochodzenia. Kodeks pracy zakazuje i jednego, i drugiego, a pomocy można szukać u pracodawcy, w Państwowej Inspekcji Pracy i w sądzie pracy.',
    ],
    method: [
      'Ustal, kto zachowuje się nieetycznie: pracownik czy pracodawca.',
      'Przy podejrzeniu mobbingu sprawdź: uporczywość, długi czas, cel lub skutek (poniżenie, izolacja).',
      'Przy dyskryminacji znajdź cechę, z powodu której ktoś jest gorzej traktowany.',
      'Wskaż drogę: dowody (maile, notatki z datami, świadkowie), zgłoszenie wewnętrzne, PIP, sąd pracy.',
    ],
    check: {
      question: 'Szef raz stanowczo zwrócił pracownikowi uwagę na spóźnienie. Czy to mobbing?',
      answer: 'Nie — to jednorazowa, rzeczowa uwaga. Mobbing wymaga uporczywego i długotrwałego nękania.',
    },
  },
};

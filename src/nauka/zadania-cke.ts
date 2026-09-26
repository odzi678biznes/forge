import type { ZadanieCke } from './typy';

/**
 * Autentyczne zadania CKE użyte w prototypie.
 *
 * Każde sprawdzone ręcznie z oficjalnym dokumentem i kluczem (wrzesień 2026).
 * Wzory i liczby są dosłowne. Opisy słowne (biznes) są streszczone własnymi
 * słowami — pełny oryginał jest pod linkiem `url`. Rozwiązania krok po kroku
 * napisał FORGE; oficjalna odpowiedź pochodzi z `kluczUrl`.
 */

const MAT = 'https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023';

export const ZADANIA_CKE: ZadanieCke[] = [
  // ------------------------------------------------------------------ matematyka
  {
    id: 'mat-2209-pp-1',
    przedmiot: 'math',
    pochodzenie: 'arkusz',
    dokument: 'Arkusz diagnostyczny CKE, wrzesień 2022 (matura w formule 2023), matematyka',
    rok: 2022,
    poziom: 'PP',
    numer: '1',
    punkty: 1,
    url: `${MAT}/materialy_dodatkowe/diagnostyczne/matematyka/MMAP-P0-100-2209.pdf`,
    kluczUrl: `${MAT}/materialy_dodatkowe/diagnostyczne/matematyka/MMAP-P0-100-200-300-400-660-700-Q00-2209-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 1',
    tresc: 'Wartość wyrażenia $(1 + 3 \\cdot 2^{-1})^{-2}$ jest równa',
    odpowiedzi: ['$\\dfrac{25}{4}$', '$\\dfrac{4}{25}$', '$\\dfrac{36}{49}$', '$\\dfrac{40}{9}$'],
    oficjalnaOdpowiedz: 'B',
    zasadyOceniania: '1 pkt – odpowiedź poprawna. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      '$2^{-1} = \\frac{1}{2}$ — potęga ujemna to odwrotność.',
      '$3 \\cdot \\frac{1}{2} = \\frac{3}{2}$ — mnożenie przed dodawaniem.',
      '$1 + \\frac{3}{2} = \\frac{5}{2}$.',
      '$\\left(\\frac{5}{2}\\right)^{-2} = \\left(\\frac{2}{5}\\right)^{2} = \\frac{4}{25}$ — odpowiedź B.',
    ],
  },
  {
    id: 'mat-2605-pp-1',
    przedmiot: 'math',
    pochodzenie: 'arkusz',
    dokument: 'Egzamin maturalny, maj 2026, matematyka (arkusz MMAP-P0-100-A-2605)',
    rok: 2026,
    poziom: 'PP',
    numer: '1',
    punkty: 1,
    url: `${MAT}/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2605-arkusz.pdf`,
    kluczUrl: `${MAT}/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-2605-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 1, wersja A',
    tresc: 'Liczba $\\sqrt{\\frac{25}{8}} \\cdot \\sqrt{2} + 2^{-1}$ jest równa',
    odpowiedzi: ['$1$', '$2$', '$3$', '$4$'],
    oficjalnaOdpowiedz: 'C',
    zasadyOceniania: '1 pkt – odpowiedź poprawna. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      'Najpierw mnożenie: $\\sqrt{\\frac{25}{8}} \\cdot \\sqrt{2} = \\sqrt{\\frac{25}{8} \\cdot 2} = \\sqrt{\\frac{25}{4}} = \\frac{5}{2}$.',
      '$2^{-1} = \\frac{1}{2}$.',
      'Na końcu dodawanie: $\\frac{5}{2} + \\frac{1}{2} = 3$ — odpowiedź C.',
    ],
  },
  {
    id: 'mat-2405-pp-2',
    przedmiot: 'math',
    pochodzenie: 'arkusz',
    dokument: 'Egzamin maturalny, maj 2024, matematyka (arkusz MMAP-P0-100-A-2405)',
    rok: 2024,
    poziom: 'PP',
    numer: '2',
    punkty: 1,
    url: `${MAT}/Arkusze_egzaminacyjne/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2405-arkusz.pdf`,
    kluczUrl: `${MAT}/Arkusze_egzaminacyjne/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-2405-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 2, wersja A',
    tresc: 'Liczba $\\left(\\frac{1}{16}\\right)^{8} \\cdot 8^{16}$ jest równa',
    odpowiedzi: ['$2^{24}$', '$2^{16}$', '$2^{12}$', '$2^{8}$'],
    oficjalnaOdpowiedz: 'B',
    zasadyOceniania: '1 pkt – odpowiedź poprawna. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      'Wszystko jako potęgi dwójki: $\\frac{1}{16} = 2^{-4}$, $8 = 2^{3}$.',
      '$(2^{-4})^{8} = 2^{-32}$ i $(2^{3})^{16} = 2^{48}$ — potęga potęgi: mnożymy wykładniki.',
      '$2^{-32} \\cdot 2^{48} = 2^{16}$ — iloczyn potęg: dodajemy wykładniki. Odpowiedź B.',
    ],
  },
  {
    id: 'mat-2505-pp-2',
    przedmiot: 'math',
    pochodzenie: 'arkusz',
    dokument: 'Egzamin maturalny, maj 2025, matematyka (arkusz MMAP-P0-100-A-2505)',
    rok: 2025,
    poziom: 'PP',
    numer: '2',
    punkty: 1,
    url: `${MAT}/Arkusze_egzaminacyjne/2025/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2505-arkusz.pdf`,
    kluczUrl: `${MAT}/Arkusze_egzaminacyjne/2025/zasady_oceniania/MMAP-P0-100-2505-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 2, wersja A',
    tresc: 'Liczba $\\dfrac{5^{12} + 5^{13} + 5^{14}}{5^{12}}$ jest równa',
    odpowiedzi: ['$30$', '$31$', '$5^{12}$', '$5^{27}$'],
    oficjalnaOdpowiedz: 'B',
    zasadyOceniania: '1 pkt – odpowiedź poprawna. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      'Dzielimy każdy składnik przez $5^{12}$: $\\frac{5^{12}}{5^{12}} + \\frac{5^{13}}{5^{12}} + \\frac{5^{14}}{5^{12}}$.',
      'Iloraz potęg: odejmujemy wykładniki — $5^{0} + 5^{1} + 5^{2} = 1 + 5 + 25 = 31$. Odpowiedź B.',
    ],
  },
  {
    id: 'mat-2605-pp-5',
    przedmiot: 'math',
    pochodzenie: 'arkusz',
    dokument: 'Egzamin maturalny, maj 2026, matematyka (arkusz MMAP-P0-100-A-2605)',
    rok: 2026,
    poziom: 'PP',
    numer: '5',
    punkty: 1,
    url: `${MAT}/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2605-arkusz.pdf`,
    kluczUrl: `${MAT}/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-2605-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 5, wersja A',
    tresc:
      'Oceń prawdziwość stwierdzeń: (1) liczba naturalna $4^{12} \\cdot 5^{24}$ jest podzielna przez 20; (2) liczba naturalna $4^{12} \\cdot 5^{24}$ jest w zapisie dziesiętnym liczbą 25-cyfrową.',
    oficjalnaOdpowiedz: 'P, P',
    zasadyOceniania: '1 pkt – odpowiedź poprawna. 0 pkt – odpowiedź niepełna lub niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      '$4^{12} = (2^{2})^{12} = 2^{24}$.',
      '$2^{24} \\cdot 5^{24} = (2 \\cdot 5)^{24} = 10^{24}$.',
      '$10^{24}$ dzieli się przez 20 (P) i ma 25 cyfr: jedynkę i 24 zera (P).',
    ],
  },

  // ------------------------------------------------------------------ informatyka
  {
    id: 'inf-2405-2.1',
    przedmiot: 'cs',
    pochodzenie: 'arkusz',
    dokument: 'Egzamin maturalny, maj 2024, informatyka (arkusz MINP-R0-100-A-2405), zadanie 2 „Cyfry”',
    rok: 2024,
    poziom: 'PR',
    numer: '2.1',
    punkty: 2,
    url: `${MAT}/Arkusze_egzaminacyjne/2024/Informatyka/MINP-R0-100-A-2405-arkusz.pdf`,
    kluczUrl: `${MAT}/Arkusze_egzaminacyjne/2024/Informatyka/MINP-R0-100-2405-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 2.1',
    tresc:
      'Algorytm dla nieujemnej liczby całkowitej n oblicza liczbę c:\n' +
      '`b ← 1`, `c ← 0`; dopóki `n > 0`: `a ← n mod 10`, `n ← n div 10`; jeżeli `a mod 2 = 0`, to `c ← c + b * (a div 2)`, w przeciwnym razie `c ← c + b`; `b ← b * 10`.\n' +
      'Uzupełnij tabelę: dla każdej liczby n wpisz wartość c po wykonaniu algorytmu oraz liczbę wykonań instrukcji `c ← c + b`. ' +
      'Wiersz przykładowy z arkusza: n = 33658 → c = 11314, 3 wykonania. Do uzupełnienia: n = 542102 oraz n = 87654321012345678.',
    oficjalnaOdpowiedz: 'n = 542102: c = 121101, 2 wykonania; n = 87654321012345678: c = 41312111011121314, 8 wykonań',
    zasadyOceniania:
      '2 pkt – po dwie poprawne odpowiedzi w obu wierszach. 1 pkt – dwie poprawne odpowiedzi w jednym wierszu lub w jednej kolumnie. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      'W Pythonie `mod` to `%`, a `div` to `//`.',
      'Cyfry 542102 od końca: 2, 0, 1, 2, 4, 5. Mnożnik b: 1, 10, 100, 1000, 10000, 100000.',
      'Cyfra parzysta dodaje b·(a//2), nieparzysta dodaje b: 1 + 0 + 100 + 1000 + 20000 + 100000 = 121101.',
      'Instrukcja `c ← c + b` wykonuje się dla cyfr nieparzystych (1 i 5) — 2 razy.',
    ],
  },
  {
    id: 'inf-2505-1.1',
    przedmiot: 'cs',
    pochodzenie: 'arkusz',
    dokument: 'Egzamin maturalny, maj 2025, informatyka (arkusz MINP-R0-100-A-2505), zadanie 1 „Funkcja rekurencyjna”',
    rok: 2025,
    poziom: 'PR',
    numer: '1.1',
    punkty: 3,
    url: `${MAT}/Arkusze_egzaminacyjne/2025/Informatyka/MINP-R0-100-A-2505-arkusz.pdf`,
    kluczUrl: `${MAT}/Arkusze_egzaminacyjne/2025/zasady_oceniania/MINP-R0-100-2505-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 1.1',
    tresc:
      'Funkcja `przestaw(n)`: `r ← n mod 100`, `a ← r div 10`, `b ← r mod 10`, `n ← n div 100`; jeżeli `n > 0`: `w ← a + 10 * b + 100 * przestaw(n)`, ' +
      'w przeciwnym razie: jeżeli `a > 0`, to `w ← a + 10 * b`, w przeciwnym razie `w ← b`; wynikiem jest w. ' +
      'Uzupełnij tabelę: wynik `przestaw(n)` i liczbę wywołań dla n = 43657688, 154005710, 998877665544321 (przykład: 316498 → 134689, 3 wywołania).',
    oficjalnaOdpowiedz: '43657688 → 34566788 (4); 154005710 → 145007501 (5); 998877665544321 → 989786756453412 (8)',
    zasadyOceniania:
      '3 pkt – odpowiedź poprawna. 2 pkt – poprawnie pięć pól tabeli. 1 pkt – poprawnie cztery pola. 0 pkt – odpowiedź niepoprawna lub niepełna.',
    rozwiazanie: [
      'Pierwsze cztery instrukcje to czyste działania na zmiennych. Dla n = 43657688: r = 88, a = 8, b = 8, n = 436576.',
      'Funkcja zamienia miejscami cyfry w każdej parze od końca: …88 → 88, 76 → 67, 65 → 56, 43 → 34.',
      'Wynik: 34566788, 4 wywołania (tyle par cyfr).',
    ],
  },
  {
    id: 'inf-inf-3.1',
    przedmiot: 'cs',
    pochodzenie: 'informator',
    dokument: 'Informator o egzaminie maturalnym z informatyki od roku szkolnego 2022/2023 (CKE), zadanie 3 „Przedziały”',
    rok: 2022,
    poziom: 'PR',
    numer: '3.1',
    punkty: 2,
    url: `${MAT}/Informatory/2024/Informator_EM2024_informatyka.pdf`,
    kluczUrl: `${MAT}/Informatory/2024/Informator_EM2024_informatyka.pdf`,
    kluczOpis: 'Informator, s. 24: zasady oceniania i rozwiązanie zadania 3.1 (plik danych: Pliki.zip, DANE/dane3.txt)',
    tresc:
      'Przedział domknięty [a, b] (a ≤ b) zawiera liczby całkowite c, dla których a ≤ c ≤ b; jego długość to b − a + 1. ' +
      'Przedział P zawiera się w Q, gdy każda liczba z P należy do Q. ' +
      'Przykład z informatora: A = [−2, 4], B = [−4, 3], C = [−3, 6], D = [0, 3], E = [1, 1], F = [7, 9]; A ma długość 7, C zawiera A. ' +
      'W pliku dane3.txt jest 2023 par liczb (przedziały). Zadanie 3.1: podaj dwie najmniejsze (różne) liczby, które są długościami przedziałów z pliku.',
    oficjalnaOdpowiedz: '3 4',
    zasadyOceniania: '2 pkt – odpowiedź poprawna. 1 pkt – poprawna jedna liczba wyniku. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.',
    rozwiazanie: [
      'Dla każdej pary: długość = b − a + 1.',
      'Pamiętamy dwie najmniejsze różne długości: jeśli nowa jest mniejsza od najmniejszej — dotychczasowa najmniejsza staje się drugą; jeśli jest między nimi — zastępuje drugą.',
      'Dla pliku dane3.txt wynik to 3 i 4.',
    ],
  },

  // ------------------------------------------------------------------ biznes
  {
    id: 'biz-2604-1',
    przedmiot: 'biz',
    pochodzenie: 'arkusz',
    dokument: 'Arkusz pokazowy CKE, kwiecień 2026, biznes i zarządzanie (MBZP-R0-100-2604), zadanie 1',
    rok: 2026,
    poziom: 'PR',
    numer: '1.1',
    punkty: 1,
    url: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-arkusz.pdf`,
    kluczUrl: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadania 1.1 i 1.2',
    tresc:
      'Opis w skrócie: Agnieszka, aktywna sportsmenka, wybiera studia. Mogłaby zostać w domu (lokalna uczelnia o przeciętnym poziomie, swój klub, niższe koszty, bliskość rodziny) ' +
      'albo wyjechać 200 km do miasta z prestiżową uczelnią i dużymi klubami (lepsze perspektywy, ale wyższe wydatki, stres, rozłąka i konieczność dorywczej pracy). ' +
      'Po namyśle i rozmowach z bliskimi wyjeżdża. ' +
      'Zadanie 1.1: na podstawie tekstu wymień cechę Agnieszki jako osoby przedsiębiorczej, która pozwoliła jej podjąć decyzję o wyjeździe, i uzasadnij przykładem jej działania z opisu.',
    oficjalnaOdpowiedz:
      'Przykłady z klucza: odwaga (podejmuje ryzyko wyjazdu mimo trudności); zdolność podejmowania decyzji (po analizie dwóch opcji wybrała trudniejszą, z lepszymi perspektywami); ambicja (prestiżowa uczelnia, lepsze kluby); pracowitość (wymagające studia i praca w trakcie).',
    zasadyOceniania: '1 pkt – odpowiedź odnosząca się do jednej poprawnej cechy wraz z odpowiednim przykładem działania. 0 pkt – brak spełnienia tych warunków.',
    rozwiazanie: [
      'Szukamy CECHY (np. odwaga, ambicja) i DZIAŁANIA z tekstu, które ją pokazuje.',
      'Działanie Agnieszki to wyjazd mimo kosztów, stresu i rozłąki — samo „lubi sport” nie jest przykładem działania.',
      'Przykład na 1 pkt: „Odwaga — zdecydowała się wyjechać do innego miasta, choć wiązało się to z wyższymi kosztami, stresem i rozłąką z rodziną”.',
    ],
  },
  {
    id: 'biz-2604-1.2',
    przedmiot: 'biz',
    pochodzenie: 'arkusz',
    dokument: 'Arkusz pokazowy CKE, kwiecień 2026, biznes i zarządzanie (MBZP-R0-100-2604), zadanie 1',
    rok: 2026,
    poziom: 'PR',
    numer: '1.2',
    punkty: 1,
    url: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-arkusz.pdf`,
    kluczUrl: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 1.2',
    tresc:
      'Ten sam opis Agnieszki co w zadaniu 1.1 (wyjazd na studia, dorywcza praca na część kosztów utrzymania). ' +
      'Zadanie 1.2: podaj kompetencję przedsiębiorczą rozwijaną przez Agnieszkę oraz wyjaśnij, dlaczego ta kompetencja jest istotna we współczesnym świecie.',
    oficjalnaOdpowiedz:
      'Przykład z klucza: zarządzanie finansami — dorabiając na koszty utrzymania, uczy się planowania i podejmowania decyzji, podnosi odpowiedzialność, zapewnia sobie stabilizację i bezpieczeństwo finansowe.',
    zasadyOceniania: '1 pkt – poprawna odpowiedź odnosząca się do roli kompetencji przedsiębiorczej we współczesnym świecie.',
    rozwiazanie: [
      'Kompetencję wskazuje działanie: dorywcza praca na koszty → zarządzanie finansami.',
      'Wyjaśnienie „dlaczego ważna dziś”: planowanie, odpowiedzialność, bezpieczeństwo finansowe.',
    ],
  },
  {
    id: 'biz-2604-5',
    przedmiot: 'biz',
    pochodzenie: 'arkusz',
    dokument: 'Arkusz pokazowy CKE, kwiecień 2026, biznes i zarządzanie (MBZP-R0-100-2604), zadanie 5 „O komunikacji z podwładnymi”',
    rok: 2026,
    poziom: 'PR',
    numer: '5.1–5.2',
    punkty: 2,
    url: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-arkusz.pdf`,
    kluczUrl: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadania 5.1 i 5.2',
    tresc:
      'Tekst źródłowy (fragment książki K. Scott, w skrócie): dobra ogólna zasada to „chwalenie publiczne, a krytykowanie w cztery oczy”, ale są wyjątki. ' +
      'Drobne poprawki i dyskusje (np. literówka na slajdzie, „nie zgadzam się z tym, co powiedziałeś”) można przekazać na spotkaniu, a poważną krytykę (seria prezentacji pełnych błędów) — w rozmowie w cztery oczy. ' +
      'Niektórzy odbierają każdą publiczną wzmiankę o sobie jak karę, więc warto znać preferencje pracowników. ' +
      'Zadanie 5.1: wyjaśnij, dlaczego ta zasada jest dobra (oba człony). Zadanie 5.2: podaj dwa opisane w tekście wyjątki od zasady.',
    oficjalnaOdpowiedz:
      '5.1 — chwalenie publiczne: pochwała jest doceniana i zachęca innych do naśladowania; krytykowanie w cztery oczy: publiczna krytyka wywołuje reakcję obronną, utrudnia przyjęcie błędu, obniża motywację. ' +
      '5.2 — (1) drobne poprawki, niebędące osobistą krytyką, można przekazać publicznie; (2) nie wszyscy lubią publiczne pochwały — trzeba to uszanować.',
    zasadyOceniania: '5.1: 1 pkt – poprawne wyjaśnienie obu aspektów zasady. 5.2: 1 pkt – poprawne wskazanie dwóch wyjątków.',
    rozwiazanie: [
      'Zasada ma dwa człony — w 5.1 trzeba wyjaśnić OBA: dlaczego chwalić publicznie i dlaczego krytykować prywatnie.',
      'Chwalenie publiczne: docenienie + wzór dla innych. Krytyka w cztery oczy: bez reakcji obronnej i utraty motywacji.',
      '5.2: wyjątki z tekstu to drobne poprawki na forum oraz osoby, które nie lubią publicznych pochwał.',
    ],
  },
  {
    id: 'biz-2604-2',
    przedmiot: 'biz',
    pochodzenie: 'arkusz',
    dokument: 'Arkusz pokazowy CKE, kwiecień 2026, biznes i zarządzanie (MBZP-R0-100-2604), zadanie 2',
    rok: 2026,
    poziom: 'PR',
    numer: '2',
    punkty: 1,
    url: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-arkusz.pdf`,
    kluczUrl: `${MAT}/materialy_dodatkowe/pokazowe/2026/BIZ/MBZP-R0-100-2604-zasady.pdf`,
    kluczOpis: 'Zasady oceniania, zadanie 2',
    tresc:
      'Zespół to dwie lub więcej osób, które współdziałają w dążeniu do wspólnego celu; ważną zaletą pracy zespołowej jest „efekt synergii”. Wyjaśnij, na czym polega efekt synergii w pracy zespołowej.',
    oficjalnaOdpowiedz: 'Współpraca w zespole może dać większe efekty niż suma efektów indywidualnych działań członków zespołu.',
    zasadyOceniania: '1 pkt – poprawne wyjaśnienie, na czym polega „efekt synergii”. 0 pkt – brak spełnienia tego warunku.',
    rozwiazanie: ['Synergia: wynik zespołu jest większy niż suma tego, co każdy zrobiłby osobno.'],
  },
];

export const zadanieCke = (id: string): ZadanieCke | undefined => ZADANIA_CKE.find((z) => z.id === id);

/** Etykieta źródła — dokładnie w brzmieniu, o które prosi uczeń. */
export function etykietaZrodla(z: ZadanieCke): string {
  return z.pochodzenie === 'informator' ? 'zadanie z informatora CKE' : 'zadanie z arkusza CKE';
}

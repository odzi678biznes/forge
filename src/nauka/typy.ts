/**
 * Prototyp „Nauka przez prawdziwe zadania” — model danych.
 *
 * Każda seria kart prowadzi do rozwiązania jednego autentycznego zadania CKE.
 * Karty nie pochodzące z zadania CKE są oznaczone jako `pomocnicze` i pokazywane
 * z wyraźną etykietą — nie udajemy, że to zadania egzaminacyjne.
 */

export type Przedmiot = 'math' | 'cs' | 'biz';

/** Rodzaj źródła — dokładnie tak, jak prosi uczeń: arkusz albo informator. */
export type Pochodzenie = 'arkusz' | 'informator';

export interface ZadanieCke {
  id: string;
  przedmiot: Przedmiot;
  pochodzenie: Pochodzenie;
  /** Np. „Egzamin maturalny, maj 2024 (arkusz MMAP-P0-100-A-2405)”. */
  dokument: string;
  rok: number;
  poziom: 'PP' | 'PR';
  /** Numer zadania w dokumencie, np. „2” albo „2.1”. */
  numer: string;
  punkty: number;
  /** Link do oficjalnego dokumentu z treścią zadania. */
  url: string;
  /** Link do oficjalnego klucza / zasad oceniania. */
  kluczUrl: string;
  /** Gdzie w kluczu jest odpowiedź (np. „Zasady oceniania, zadanie 2, wersja A”). */
  kluczOpis: string;
  /**
   * Treść zadania z zachowanymi liczbami i danymi. Wzory — dosłownie; opisy
   * słowne — w skrócie własnymi słowami, bo pełny oryginał jest pod linkiem.
   */
  tresc: string;
  /** Odpowiedzi A–D, jeśli zadanie jest zamknięte. */
  odpowiedzi?: string[];
  /** Oficjalna odpowiedź z klucza CKE (dosłownie, np. „B” albo „121101 i 2”). */
  oficjalnaOdpowiedz: string;
  /** Zasady oceniania z klucza CKE (skrót). */
  zasadyOceniania: string;
  /** Pełne rozwiązanie krok po kroku — napisane przez FORGE, sprawdzone z kluczem. */
  rozwiazanie: string[];
}

/** Etap rozwiązywania — pokazujemy go na karcie, żeby było widać, po co jest krok. */
export type Etap =
  | 'polecenie'
  | 'dane'
  | 'zasada'
  | 'fragment'
  | 'sprawdzenie'
  | 'zadanie'
  | 'pomocnicze';

export const ETAP_NAZWA: Record<Etap, string> = {
  polecenie: 'Zrozum polecenie',
  dane: 'Wybierz dane',
  zasada: 'Wskaż zasadę',
  fragment: 'Wykonaj fragment',
  sprawdzenie: 'Sprawdź wynik',
  zadanie: 'Całe zadanie',
  pomocnicze: 'Ćwiczenie pomocnicze',
};

/** Jak sprawdzamy odpowiedź wpisaną — zawsze regułą, nigdy przez AI. */
export type Oczekiwane =
  /** Liczba lub ułamek; porównanie wartości (np. 4/25 = 0,16). */
  | { typ: 'liczba'; wartosc: number }
  /** Potęga o podanej podstawie, np. 2^16 (przyjmujemy też 65536). */
  | { typ: 'potega'; podstawa: number; wykladnik: number }
  /** Tekst — dopuszczalne warianty po normalizacji (małe litery, bez spacji). */
  | { typ: 'tekst'; warianty: string[] };

interface KartaBaza {
  id: string;
  /** Zadanie CKE, do którego prowadzi karta; null tylko dla kart pomocniczych. */
  zadanieId: string | null;
  etap: Etap;
  /** Treść pytania — krótko, jedno polecenie. */
  pytanie: string;
  /** Dodatkowy kontekst nad pytaniem (dane z zadania). */
  kontekst?: string;
  /** Krótkie wyjaśnienie po odpowiedzi — dlaczego tak. */
  wyjasnienie: string;
  /** Łatwiejszy krok w obrębie tego samego zadania — pokazywany po błędzie. */
  latwiejsza?: string;
  /** Krok pomocniczy, który można pominąć, gdy uczeń radzi sobie samodzielnie. */
  rusztowanie?: boolean;
  /** Karta wymaga przypomnienia z pamięci (bez podpowiedzi na karcie). */
  zPamieci?: boolean;
  /** Podpowiedź — jedna, krótka. */
  podpowiedz?: string;
}

export interface KartaWybor extends KartaBaza {
  rodzaj: 'wybor';
  /** 'decyzja' — ocena decyzji w sytuacji (styl karty inny, mechanika ta sama). */
  wariant?: 'decyzja';
  opcje: string[];
  poprawna: number;
  /** Wyjaśnienie konkretnego błędu dla wybranej złej opcji. */
  dlaczegoNie?: Record<number, string>;
}

export interface KartaKolejnosc extends KartaBaza {
  rodzaj: 'kolejnosc';
  /** Elementy w POPRAWNEJ kolejności — na karcie są przetasowane. */
  elementy: string[];
}

export interface KartaWpis extends KartaBaza {
  rodzaj: 'wpis';
  oczekiwane: Oczekiwane;
  /** Klawiatura: 'mat' — z przyciskami / ^ −; 'tekst' — zwykła. */
  klawiatura: 'mat' | 'tekst';
  jednostka?: string;
  /** Typowe błędne odpowiedzi i ich przyczyny (klucz po normalizacji). */
  typoweBledy?: Record<string, string>;
}

export interface KartaBlad extends KartaBaza {
  rodzaj: 'blad';
  /** Linijki cudzego rozwiązania — jedna jest błędna. */
  linie: string[];
  bledna: number;
}

export interface KartaKod extends KartaBaza {
  rodzaj: 'kod';
  kod: string;
  /** Oczekiwany wynik print() — warianty po normalizacji białych znaków. */
  wynik: string[];
}

/** Odpowiedź otwarta (BiZ) — sprawdzana regułami orientacyjnie + samoocena wg klucza. */
export interface KartaOtwarta extends KartaBaza {
  rodzaj: 'otwarta';
  /** Kryteria z oficjalnych zasad oceniania. */
  kryteria: string[];
  /** Grupy słów-kluczy: każde kryterium spełnione, gdy pasuje dowolne z grupy. */
  slowa: string[][];
  /** Przykładowe odpowiedzi z klucza CKE. */
  wzorcowe: string[];
}

/** Całe zadanie na końcu serii. */
export interface KartaZadanie extends KartaBaza {
  rodzaj: 'zadanie';
  /** Jak sprawdzić odpowiedź końcową. */
  koniec:
    | { typ: 'abcd'; poprawna: number }
    | { typ: 'wpis'; oczekiwane: Oczekiwane[]; etykiety: string[] }
    | { typ: 'pf'; poprawne: boolean[]; zdania: string[] }
    | { typ: 'otwarta'; kryteria: string[]; slowa: string[][]; wzorcowe: string[] };
  /** Na komputerze: edytor Pythona z plikiem danych CKE i oczekiwanym wynikiem. */
  python?: { plik: string; nazwaPliku: string; oczekiwanyWynik: string; szablon: string };
}

export type Karta =
  | KartaWybor
  | KartaKolejnosc
  | KartaWpis
  | KartaBlad
  | KartaKod
  | KartaOtwarta
  | KartaZadanie;

export interface Lekcja {
  /** Identyfikator umiejętności z kursu — ten sam co w dotychczasowych lekcjach. */
  skillId: string;
  przedmiot: Przedmiot;
  tytul: string;
  /** Zadanie CKE, do którego prowadzi seria. */
  zadanieId: string;
  /** Karty serii w kolejności (łatwiejsze warianty są osobno w `karty`). */
  seria: string[];
  /** Karty do powtórek w kolejnych dniach — z INNYCH zadań CKE tej umiejętności. */
  powtorka: string[];
  /** Wszystkie karty lekcji (seria, łatwiejsze kroki, powtórki). */
  karty: Karta[];
  /** Luki: części tematu, dla których nie ma autentycznego zadania CKE. */
  luki?: string[];
}

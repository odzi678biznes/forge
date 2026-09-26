/**
 * Kontrakt między aplikacją a serwerowym nauczycielem AI (`server/nauczyciel.ts`).
 * Aplikacja wysyła JAWNY kontekst — zadanie CKE, oficjalną odpowiedź, krok,
 * odpowiedź ucznia i wcześniejsze trudności. Klucz API zostaje na serwerze.
 */

export type Prosba = 'nastepny-krok' | 'nie-rozumiem' | 'skad' | 'inaczej' | 'pelne' | 'pytanie';

export const PROSBA_TEKST: Record<Exclude<Prosba, 'pytanie'>, string> = {
  'nastepny-krok': 'Pomóż mi zrobić następny krok.',
  'nie-rozumiem': 'Nie rozumiem.',
  skad: 'Skąd to się bierze?',
  inaczej: 'Wytłumacz inaczej.',
  pelne: 'Pokaż pełne rozwiązanie.',
};

export interface KontekstNauczyciela {
  przedmiot: string;
  lekcja: string;
  /** null — karta pomocnicza, niezwiązana z zadaniem CKE. */
  zadanie: {
    zrodlo: string;
    dokument: string;
    numer: string;
    poziom: string;
    url: string;
    tresc: string;
    odpowiedzi?: string[];
    oficjalnaOdpowiedz: string;
    zasadyOceniania: string;
    rozwiazanie: string[];
  } | null;
  krok: {
    etap: string;
    numer: number;
    z: number;
    pytanie: string;
    kontekst?: string;
    /** Wyjaśnienie z karty — nauczyciel może na nim oprzeć tłumaczenie. */
    wyjasnienie: string;
  };
  odpowiedzUcznia: string | null;
  /** Wynik sprawdzenia regułami (nie przez AI); null — jeszcze bez odpowiedzi. */
  czyPoprawna: boolean | null;
  /** Kroki tej lekcji, w których uczeń pomylił się za pierwszym razem. */
  trudnosci: string[];
}

export interface WiadomoscCzatu {
  rola: 'uczen' | 'nauczyciel';
  tekst: string;
}

export interface ZapytanieNauczyciela {
  kontekst: KontekstNauczyciela;
  prosba: Prosba;
  /** Własne pytanie ucznia (dla prośby 'pytanie'). */
  pytanie?: string;
  historia: WiadomoscCzatu[];
}

export interface OdpowiedzNauczyciela {
  tekst: string;
  model: string;
}

export interface StatusNauczyciela {
  wymagaKodu?: boolean;
  dostepny: boolean;
  model: string | null;
  /** Dlaczego niedostępny — pokazywane w trybie demonstracyjnym. */
  powod: string | null;
}

/**
 * Kontrakt między aplikacją a serwerowym nauczycielem AI (`server/nauczyciel.ts`).
 * Aplikacja wysyła JAWNY kontekst — zadanie CKE, oficjalną odpowiedź, krok,
 * odpowiedź ucznia i wcześniejsze trudności. Klucz API zostaje na serwerze.
 */

export type Prosba =
  | 'nastepny-krok'
  | 'nie-rozumiem'
  | 'skad'
  | 'inaczej'
  | 'pelne'
  | 'pytanie'
  /** Przepisanie wypowiedzi ucznia, bez rozwiązywania zadania. */
  | 'zapis'
  | 'sprawdz-rachunek'
  /** Sesja matematyki: kolejny szczebel podpowiedzi (bez wyniku). */
  | 'podpowiedz'
  | 'prosciej'
  | 'podobny'
  | 'co-zle'
  /** Korepetytor w tle: decyzja o tempie na podstawie raportu z odpowiedzi. */
  | 'korepetytor';

export const PROSBY: readonly Prosba[] = ['nastepny-krok', 'nie-rozumiem', 'skad', 'inaczej', 'pelne', 'pytanie', 'zapis', 'sprawdz-rachunek', 'podpowiedz', 'prosciej', 'podobny', 'co-zle', 'korepetytor'];

export const PROSBA_TEKST: Record<Exclude<Prosba, 'pytanie'>, string> = {
  'nastepny-krok': 'Pomóż mi zrobić następny krok.',
  'nie-rozumiem': 'Nie rozumiem.',
  skad: 'Skąd to się bierze?',
  inaczej: 'Wytłumacz inaczej.',
  pelne: 'Pokaż pełne rozwiązanie.',
  korepetytor: 'Oceń moje tempo i zdecyduj, jak mamy iść dalej.',
  podpowiedz: 'Daj mi małą podpowiedź. Nie podawaj wyniku.',
  prosciej: 'Wytłumacz mi to prościej.',
  podobny: 'Pokaż podobny przykład.',
  'co-zle': 'Co zrobiłem źle?',
  zapis: 'Zapisz moją wypowiedź matematycznie, bez liczenia i podawania wyniku.',
  'sprawdz-rachunek': 'Sprawdź, czy ostatni zatwierdzony rachunek pasuje do tego zadania. Sam wynik obliczył kalkulator. Krótko oceń metodę, bez kolejnego wyniku.',
};

/**
 * Raport dla korepetytora w tle: same liczby i treści kroków, bez danych
 * osobowych. Czas powyżej 3 minut (przerwa) jest już pominięty (null).
 */
export interface RaportKorepetytora {
  przedmiot: string;
  lekcja: string;
  samodzielnosc: number;
  odpowiedzi: { krok: string; etap: string; poprawnaZaPierwszym: boolean; proby: number; czasS: number | null }[];
  poprzednie?: 'latwiej' | 'tak-samo' | 'trudniej';
}

/**
 * Kontekst sesji matematyki (nowy tryb nauki): co uczeń już zrobił, jakie
 * podpowiedzi widział i jakie błędy popełnia. Pole opcjonalne — stary feed
 * kart CKE go nie wysyła.
 */
export interface KontekstSesji {
  /** Rodzaj aktywności: pełne zadanie, mikro-zadanie, klocki, speed… */
  aktywnosc: string;
  /** Opanowanie umiejętności 0–100 (nazwa → wartość). */
  opanowanie: Record<string, number>;
  /** Powtarzające się błędy ucznia (nazwy przyczyn). */
  bledy: string[];
  /** Podpowiedzi lokalne, które uczeń już zobaczył przy tym kroku. */
  podpowiedziPokazane: string[];
  /** Pełna drabina podpowiedzi kroku — tryb demonstracyjny bez AI z niej korzysta. */
  podpowiedzi: string[];
  przyklad?: string;
  /** Ile prób w tym kroku i jakie odpowiedzi (od najstarszej). */
  proby: string[];
  /** Kroki już zrobione (zapis rozwiązania ucznia). */
  rozwiazanieUcznia: string[];
  /** Identyfikatory błędów, które AI może wskazać (pamięć błędów). */
  znaneBledy: string[];
  /** Meaning of each category, so AI need not infer it from an identifier. */
  opisyBledow?: Record<string, string>;
  /** Diagnoza aplikacji dla ostatniej odpowiedzi, jeśli ją rozpoznała. */
  diagnoza?: string;
}

/**
 * Odpowiedź nauczyciela w strukturze (structured output). UI pokazuje
 * `tekst`, ale wie też, czy odpowiedź zdradza wynik i jaki błąd rozpoznano.
 */
export interface StrukturaOdpowiedzi {
  rodzaj: 'podpowiedz' | 'wyjasnienie' | 'przyklad' | 'diagnoza' | 'rozwiazanie' | 'inne';
  ujawniaWynik: boolean;
  /** Krótkie pytanie sprawdzające albo pusty tekst. */
  pytanieKontrolne: string;
  /** Rozpoznany błąd z listy `znaneBledy` albo pusty tekst. */
  misconception: string;
  /** Only a faithful transcription; empty when the spoken notation is ambiguous. */
  zapisKalkulatora?: string;
}

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
  sesja?: KontekstSesji;
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
  /** Dla prośby 'korepetytor'. */
  raport?: RaportKorepetytora;
}

export interface OdpowiedzNauczyciela {
  tekst: string;
  model: string;
  struktura?: StrukturaOdpowiedzi;
  /** Provider-reported tokens for explicit, budgeted validation; contains no credentials. */
  usage?: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };
}

export interface StatusNauczyciela {
  /** Set exclusively by the loopback-only Vite backend. */
  localSetupAvailable?: boolean;
  persisted?: boolean;
  providerVerified?: boolean;
  storageError?: string | null;
  wymagaKodu?: boolean;
  dostepny: boolean;
  model: string | null;
  /** Dlaczego niedostępny — pokazywane w trybie demonstracyjnym. */
  powod: string | null;
}

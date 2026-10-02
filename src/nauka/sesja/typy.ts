/**
 * Nowy sposób nauki matematyki (demo „sesji”) — model danych.
 *
 * Zasada: AI może dostarczać TREŚĆ (zadanie, kroki, podpowiedzi), ale zawsze
 * w tej strukturze. UI pokazuje wyłącznie pola z tych typów, a poprawność
 * odpowiedzi sprawdza aplikacja lokalnie (`ocena.ts`). Ten sam kształt mają
 * zadania napisane ręcznie i wygenerowane — oba przechodzą `walidacja.ts`.
 *
 * Identyfikatory umiejętności (`skill`) to te same id co w kursie
 * (np. `quad-discriminant`), więc model wiedzy łączy się z resztą FORGE.
 */

/** Typowy błąd w rozumowaniu — klucz pamięci błędów (`bledy.ts`). */
export type MisconceptionTag = string;

/** Co aplikacja mówi, gdy rozpozna konkretny błąd. */
export interface Diagnoza {
  /** Brak — zła odpowiedź bez rozpoznanej przyczyny (np. nietrafiona metoda). */
  misconception?: MisconceptionTag;
  /** Krótko i konkretnie: co poszło nie tak (nie samo „źle”). */
  komunikat: string;
}

/** Sposób odpowiedzi na krok — zawsze sprawdzalny lokalnie. */
export type Interakcja =
  /** Wybór jednej opcji; `bledne` — diagnoza dla konkretnych złych opcji. */
  | { typ: 'wybor'; opcje: string[]; poprawna: number; bledne?: Record<number, Diagnoza> }
  /**
   * Wyrażenie z jedną zmienną (np. Δ jako funkcja parametru m). Równoważne
   * zapisy są poprawne; `typowe` to wyrażenia zdradzające konkretny błąd.
   */
  | {
      typ: 'wyrazenie';
      zmienna: string;
      oczekiwane: string;
      typowe?: Array<{ wyrazenie: string } & Diagnoza>;
      /** Etykieta pola, np. „Δ =”. */
      etykieta?: string;
    }
  /** Liczba (także ułamek: 1/2, -3/4). */
  | { typ: 'liczba'; wartosc: number; typowe?: Array<{ wartosc: number } & Diagnoza>; etykieta?: string };

export type EtapRozwiazania =
  | 'zrozumienie'
  | 'dane'
  | 'cel'
  | 'metoda'
  | 'przeksztalcenie'
  | 'obliczenia'
  | 'interpretacja'
  | 'warunki'
  | 'sprawdzenie'
  | 'odpowiedz';

export const ETAP: Record<EtapRozwiazania, string> = {
  zrozumienie: 'Zrozumienie treści',
  dane: 'Rozpoznanie danych',
  cel: 'Czego szukamy',
  metoda: 'Wybór metody',
  przeksztalcenie: 'Przekształcenie',
  obliczenia: 'Obliczenia',
  interpretacja: 'Interpretacja wyniku',
  warunki: 'Sprawdzenie warunków',
  sprawdzenie: 'Sprawdzenie',
  odpowiedz: 'Odpowiedź końcowa',
};

/** Jeden krok pełnego zadania (Deep Solve). */
export interface MathStep {
  id: string;
  stage: EtapRozwiazania;
  /** Umiejętność z kursu, której dowodem jest ten krok. */
  skill: string;
  /** Po co jest ten krok — jedno zdanie, widoczne nad poleceniem. */
  objective: string;
  prompt: string;
  answer: Interakcja;
  /** Dlaczego tak — pokazywane po poprawnej odpowiedzi albo po rezygnacji. */
  explanation: string;
  /** Drabina podpowiedzi: mała wskazówka → właściwe pojęcie → następne działanie. */
  hintLevel1: string;
  hintLevel2: string;
  hintLevel3: string;
  /** Szczebel 4: podobny mini-przykład (z innymi liczbami). */
  example: string;
  /** Linijka, która po zaliczeniu kroku trafia do „Twojego rozwiązania”. */
  work: string;
  misconceptionTags: MisconceptionTag[];
  /**
   * Krok-rusztowanie: przy wysokim opanowaniu aplikacja go pomija i wpisuje
   * `work` jako oczywisty (mniej prowadzenia za rękę).
   */
  scaffold?: boolean;
}

export type ZrodloZadania =
  | { typ: 'forge'; opis: string }
  | { typ: 'cke'; opis: string; url: string }
  | { typ: 'ai'; opis: string; model: string };

/** Pełne zadanie rozwiązywane etapami. */
export interface MathTask {
  id: string;
  topic: string;
  subtopic: string;
  skill: string;
  /** 1 — rozpoznaj wzór … 5 — zadanie maturalne z pułapkami, metodę wybierasz sam. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  examLevel: 'PP' | 'PR';
  source: ZrodloZadania;
  /** Punkty, jakie podobne zadanie ma na maturze (orientacyjnie). */
  points: number;
  question: string;
  givens: string[];
  expectedConcepts: string[];
  steps: MathStep[];
  finalAnswer: string;
  hints: string[];
  commonMistakes: Array<{ misconception: MisconceptionTag; opis: string }>;
}

/** Klocki: „Ułóż rozwiązanie” — kroki trzeba ustawić po kolei. */
export interface ZadanieKlocki {
  id: string;
  skill: string;
  tytul: string;
  problem: string;
  /** Poprawne kroki w kolejności. */
  kroki: string[];
  /** Kuszące, ale błędne klocki — każdy z wyjaśnieniem; `etap` — z którym krokiem konkuruje. */
  dystraktory: Array<{ tekst: string; etap: number } & Diagnoza>;
  /** Ile klocków widać naraz w puli (reszta odsłania się z postępem). */
  widoczne: number;
}

/** Krótka interakcja 5–20 s. */
export interface MikroZadanie {
  id: string;
  skill: string;
  rodzaj:
    | 'nastepny-krok'
    | 'wzor'
    | 'wykres'
    | 'gdzie-blad'
    | 'uzupelnij'
    | 'legalne-przeksztalcenie'
    | 'metoda'
    | 'prawda-falsz';
  pytanie: string;
  kontekst?: string;
  /** Dla `wykres`: wzory funkcji kwadratowych do narysowania jako opcje. */
  wykresy?: Array<{ a: number; b: number; c: number }>;
  odpowiedz: Interakcja;
  wyjasnienie: string;
  podpowiedz: string;
  /** Mikro-zadanie przygotowuje do tego kroku Deep Solve (jeśli jest). */
  przedKrokiem?: string;
}

/** Pytanie Speed Round — może mieć formę swipe (prawda/fałsz). */
export interface PytanieSpeed {
  id: string;
  skill: string;
  forma: 'pf' | 'wybor' | 'liczba' | 'wykres' | 'nastepny-krok' | 'wzor';
  pytanie: string;
  /** Dla `pf`. */
  prawda?: boolean;
  wykresy?: Array<{ a: number; b: number; c: number }>;
  odpowiedz?: Interakcja;
  wyjasnienie: string;
  /** Jaki błąd zdradza zła odpowiedź (do pamięci błędów). */
  misconception?: MisconceptionTag;
}

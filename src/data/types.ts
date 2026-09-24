/**
 * Model domeny FORGE.
 *
 * Zasada naczelna (Blueprint sek. 1): jednostka prawdy to DOWOD OPANOWANIA,
 * a nie czas w aplikacji. Dlatego kazda proba zapisuje poziom uzytej pomocy
 * i deklarowana pewnosc - bez tego nie da sie odroznic rozwiazania
 * samodzielnego od wspomaganego.
 */

// ---------------------------------------------------------------------------
// Kompetencje
// ---------------------------------------------------------------------------

/** Blueprint sek. 4.1 - poziomy opanowania kompetencji. */
export const MasteryLevel = {
  Unknown: 0,
  /** Rozpoznaje - rozwiazanie po duzej podpowiedzi. */
  Recognised: 1,
  /** Wspomagane - rozwiazanie po malej wskazowce. */
  Assisted: 2,
  /** Samodzielne - typowe zadanie bez pomocy. */
  Independent: 3,
  /** Transfer - nowe lub mieszane zadanie bez pomocy. */
  Transfer: 4,
  /** Utrwalone - poprawna odpowiedz po odroczeniu. */
  Retained: 5,
} as const;

export type MasteryLevel = (typeof MasteryLevel)[keyof typeof MasteryLevel];

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: 'Nieznane',
  1: 'Rozpoznaję',
  2: 'Wspomagane',
  3: 'Samodzielne',
  4: 'Transfer',
  5: 'Utrwalone',
};

/**
 * Poziom egzaminu, na którym umiejętność jest wymagana. Rozszerzenie zawiera
 * podstawę, więc umiejętność PP jest potrzebna także do matury rozszerzonej.
 */
export type ExamLevel = 'PP' | 'PR';

export interface Skill {
  id: string;
  topicId: string;
  name: string;
  /** Brak pola = rozszerzenie (tak powstały pierwsze wycinki treści). */
  level?: ExamLevel;
  /** Wymaganie z podstawy / informatora CKE. */
  ckeRequirement: string;
  /** Kompetencje, ktore trzeba miec wczesniej. */
  prerequisites: string[];
  /** Waga maturalna 0..1 - jak czesto i za ile punktow pojawia sie na arkuszu. */
  examValue: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  /** Jedno zdanie o tym, czego dział uczy - pokazywane na mapie kursu. */
  summary?: string;
}

export interface Subject {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Pytania
// ---------------------------------------------------------------------------

/** Blueprint sek. 5 - drabina pomocy. Poziom 0 = brak pomocy. */
export const HINT_LADDER = [
  'Pytanie diagnostyczne',
  'Mała wskazówka',
  'Przypomnienie zasady',
  'Fragment podobnego przykładu',
  'Jeden krok wspólnie',
  'Pełne rozwiązanie',
] as const;

/** 0 = samodzielnie, 1..6 = kolejne szczeble drabiny pomocy. */
export type HintLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type QuestionKind =
  /** Typowe zadanie sprawdzajace kompetencje wprost. */
  | 'typical'
  /** Nowy lub mieszany kontekst - dowod transferu. */
  | 'transfer'
  /** Fundament - sprawdza warunek wstepny. */
  | 'foundation';

/**
 * 'choice' to zadanie zamknięte jak na maturze podstawowej: odpowiedzią jest
 * litera A-D, a treści odpowiedzi są w `choices`.
 */
export type AnswerFormat = 'numeric' | 'exact-text' | 'multi-step' | 'code' | 'choice';

/**
 * Pojedynczy test zadania programistycznego (sek. 15, Etap 4).
 *
 * Typ mieszka w warstwie danych, a nie w silniku, bo opisuje TRESC zadania.
 * Silnik oceniajacy go tylko czyta.
 */
export interface CodeTest {
  name: string;
  /** Argumenty przekazywane do funkcji rozwiazania. */
  input: unknown[];
  expected: unknown;
  /**
   * Test ukryty nie jest pokazywany przed uruchomieniem - inaczej zadanie
   * dawaloby sie zaliczyc przez dopasowanie odpowiedzi do widocznych
   * przypadkow, zamiast przez napisanie algorytmu.
   */
  hidden?: boolean;
}

/** Zadanie programistyczne oceniane na kontrolowanych testach. */
export interface CodeTask {
  /** Nazwa funkcji, ktora uczen ma napisac. */
  functionName: string;
  /** Sygnatura pokazywana uczniowi. */
  signature: string;
  /** Kod startowy w edytorze. */
  starterCode: string;
  tests: CodeTest[];
}

export interface Hint {
  level: Exclude<HintLevel, 0>;
  text: string;
}

export interface Question {
  id: string;
  skillId: string;
  kind: QuestionKind;
  /** Tresc w LaTeX-u (renderowana lokalnie przez KaTeX). */
  prompt: string;
  format: AnswerFormat;
  /** Kanoniczna poprawna odpowiedz. */
  answer: string;
  /** Akceptowane warianty zapisu tej samej odpowiedzi. */
  acceptedVariants: string[];
  /** Tolerancja dla odpowiedzi liczbowych. */
  tolerance?: number;
  solution: string;
  /**
   * Rozwiązanie rozpisane na kroki - pokazywane po kolei, jak przy tablicy.
   * Gdy brak, pokazywane jest samo `solution`.
   */
  steps?: string[];
  /** Odpowiedzi A-D dla `format === 'choice'` (w tej kolejności). */
  choices?: string[];
  hints: Hint[];
  /** Typowe bledy - klucz do Laboratorium bledow (sek. 7.4). */
  commonErrors: CommonError[];
  /** Zadanie programistyczne - obecne wylacznie przy format === 'code'. */
  code?: CodeTask;
  /** Trudnosc poczatkowa 1..5. */
  difficulty: number;
  source: string;
  verified: boolean;
}

export interface CommonError {
  id: string;
  /** Odpowiedz, ktora zdradza ten konkretny blad. */
  matches: string[];
  /** Nazwa przyczyny, nie objawu. */
  cause: string;
  /** Zasada, ktora zostala zlamana. */
  rule: string;
}

// ---------------------------------------------------------------------------
// Proby
// ---------------------------------------------------------------------------

export type Confidence = 'guess' | 'partial' | 'sure';

export type Correctness = 'correct' | 'partial' | 'incorrect';

/** Blueprint sek. 10 - pelny zapis proby. */
export interface Attempt {
  id: string;
  questionId: string;
  skillId: string;
  missionId: string;
  startedAt: number;
  answeredAt: number;
  userAnswer: string;
  correctness: Correctness;
  confidence: Confidence;
  /** Najwyzszy szczebel pomocy uzyty przed odpowiedzia. */
  hintLevel: HintLevel;
  /** Rozpoznany typ bledu, jesli sie udalo. */
  errorId: string | null;
  /** Wersja zasad oceniania - do odtworzenia decyzji w przyszlosci. */
  gradingVersion: string;
  gradedBy: 'auto' | 'user' | 'ai';
}

// ---------------------------------------------------------------------------
// Stan kompetencji i powtorki
// ---------------------------------------------------------------------------

export interface SkillState {
  skillId: string;
  level: MasteryLevel;
  /** Ile razy z rzedu odpowiedziano poprawnie i bez pomocy. */
  independentStreak: number;
  /** Kiedy osiagnieto obecny poziom - baza dla warunku odroczenia. */
  levelReachedAt: number | null;
  /** Kolejna zaplanowana powtorka (ms epoch) albo null. */
  reviewDueAt: number | null;
  /** Indeks w drabinie odstepow REVIEW_INTERVALS_DAYS. */
  reviewStep: number;
  /** Bledy w ostatnich probach - zasila priorytet i Laboratorium bledow. */
  recentErrors: string[];
  lastAttemptAt: number | null;
  totalAttempts: number;
}

export function emptySkillState(skillId: string): SkillState {
  return {
    skillId,
    level: MasteryLevel.Unknown,
    independentStreak: 0,
    levelReachedAt: null,
    reviewDueAt: null,
    reviewStep: 0,
    recentErrors: [],
    lastAttemptAt: null,
    totalAttempts: 0,
  };
}

// ---------------------------------------------------------------------------
// Misje
// ---------------------------------------------------------------------------

export type MissionKind =
  | 'warmup'
  | 'training'
  | 'mixed-patrol'
  | 'repair'
  | 'boss'
  | 'time-trial'
  | 'comeback'
  /** Przekrojowa diagnoza - jedna sonda na kompetencje (sek. 15, Etap 3). */
  | 'diagnostic';

export interface Mission {
  id: string;
  kind: MissionKind;
  title: string;
  /** Dlaczego wlasnie ta misja - tekst pokazywany uzytkownikowi (sek. 17). */
  rationale: string;
  questionIds: string[];
  startedAt: number;
  finishedAt: number | null;
}

// ---------------------------------------------------------------------------
// Plan nauki (Etap 3 i 5)
// ---------------------------------------------------------------------------

export type PlanVariantId = 'minimum' | 'realistic' | 'ambitious';

/** Tryb dnia - Blueprint sek. 7.1, przelacznik minimum / standard / mocny. */
export type DayMode = 'minimum' | 'standard' | 'strong';

/**
 * Zapisany plan nauki. Trzymamy CELE, a nie wyliczone liczby misji:
 * szacunki zmienia sie razem z wersja silnika, a cele sa decyzja uzytkownika
 * i musza przetrwac aktualizacje aplikacji.
 */
export interface SavedPlan {
  id: string;
  variant: PlanVariantId;
  createdAt: number;
  /** Termin egzaminu w ms epoch albo null. */
  deadline: number | null;
  /** Docelowy poziom dla kazdej kompetencji objetej planem. */
  targets: Array<{ skillId: string; targetLevel: MasteryLevel }>;
  /** Migawka diagnozy, z ktorej plan powstal - do porownania postepu. */
  diagnosisSnapshot: Array<{ skillId: string; level: MasteryLevel }>;
}

/** Preferencje uzytkownika - proste pary klucz/wartosc. */
export interface Preference {
  key: string;
  value: string;
}

// ---------------------------------------------------------------------------
// Kurs: lekcje i fiszki
// ---------------------------------------------------------------------------

/** Fragment lekcji. Tekst może zawierać wzory w $...$. */
export type LessonBlock =
  | { kind: 'text'; body: string }
  /** Wzór wyróżniony, wyśrodkowany - bez znaków $. */
  | { kind: 'formula'; tex: string; caption?: string }
  /** "Zapamiętaj" - reguła do wyniesienia z lekcji. */
  | { kind: 'tip'; body: string }
  /** "Uwaga" - miejsce, w którym najczęściej traci się punkty. */
  | { kind: 'warning'; body: string };

export interface WorkedStep {
  text: string;
  /** Dlaczego ten krok - krótkie uzasadnienie pod krokiem. */
  why?: string;
}

/** Przykład rozwiązany krok po kroku; uczeń odsłania kolejne kroki sam. */
export interface WorkedExample {
  prompt: string;
  steps: WorkedStep[];
  answer: string;
}

/**
 * Lekcja do jednej umiejętności - nauczyciel przed ćwiczeniami.
 *
 * Kolejność jest dydaktyczna: najpierw po co, potem jak, potem przykład
 * rozwiązany na oczach ucznia, na końcu pułapki. Ćwiczenia zaczynają się
 * dopiero po lekcji.
 */
export interface Lesson {
  skillId: string;
  /** Po co to jest i gdzie się przyda - jedno, dwa zdania. */
  intro: string;
  blocks: LessonBlock[];
  examples: WorkedExample[];
  pitfalls: string[];
  /** Szacowany czas samej lekcji w minutach. */
  minutes: number;
}

export type FlashcardKind = 'wzor' | 'definicja' | 'metoda' | 'pulapka';

export interface Flashcard {
  id: string;
  skillId: string;
  kind: FlashcardKind;
  /** Pytanie na awersie. */
  front: string;
  /** Odpowiedź na rewersie. */
  back: string;
}

/** Stan fiszki w systemie pudełek (Leitnera). */
export interface CardState {
  cardId: string;
  /** Umiejętność fiszki - usunięcie przedmiotu usuwa też jego fiszki. */
  skillId: string;
  /** Numer pudełka 0..n; wyższe pudełko = dłuższy odstęp. */
  box: number;
  dueAt: number;
  /** Kiedy karta weszła do nauki - do dziennego limitu nowych kart. */
  introducedAt: number;
  lastReviewedAt: number | null;
  reviews: number;
  lapses: number;
}

/** Ukończona lekcja - uczeń doszedł do końca i przeszedł do ćwiczeń. */
export interface LessonProgress {
  skillId: string;
  completedAt: number;
}

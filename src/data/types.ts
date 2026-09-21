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
  1: 'Rozpoznaje',
  2: 'Wspomagane',
  3: 'Samodzielne',
  4: 'Transfer',
  5: 'Utrwalone',
};

export interface Skill {
  id: string;
  topicId: string;
  name: string;
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
  'Mala wskazowka',
  'Przypomnienie zasady',
  'Fragment analogicznego przykladu',
  'Jeden krok wspolnie',
  'Pelne rozwiazanie',
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

export type AnswerFormat = 'numeric' | 'exact-text' | 'multi-step';

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
  hints: Hint[];
  /** Typowe bledy - klucz do Laboratorium bledow (sek. 7.4). */
  commonErrors: CommonError[];
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
  | 'comeback';

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

import type { Figure, SkillState } from '../../data/types';

export const TUTOR_MODES = ['learn', 'practice', 'quiz', 'exam', 'repair', 'review'] as const;
export type TutorMode = typeof TUTOR_MODES[number];
export const MODE_LABELS: Record<TutorMode, string> = {
  learn: 'Nauka', practice: 'Ćwiczenia', quiz: 'Kartkówka', exam: 'Egzamin / Matura',
  repair: 'Popraw moje błędy', review: 'Powtórka',
};
export const DIFFICULTY_LABELS = ['Bardzo łatwe', 'Łatwe', 'Łatwe+', 'Średnie', 'Maturalne podstawowe', 'Wymagające', 'Egzaminacyjne'];
export const ERROR_CATEGORIES = ['sign', 'order', 'fractions', 'powers', 'roots', 'formula', 'units', 'graph', 'reading', 'arithmetic', 'knowledge', 'missing-step', 'attention'] as const;
export type ErrorCategory = typeof ERROR_CATEGORIES[number];
export const ERROR_LABELS: Record<ErrorCategory, string> = {
  sign: 'Zmiana znaków', order: 'Kolejność działań', fractions: 'Działania na ułamkach',
  powers: 'Potęgi', roots: 'Pierwiastki', formula: 'Zastosowanie wzoru', units: 'Jednostki',
  graph: 'Odczyt wykresu', reading: 'Interpretacja polecenia', arithmetic: 'Rachunki',
  knowledge: 'Brak podstawy', 'missing-step': 'Pominięty krok', attention: 'Nieuwaga',
};

/** Safe mathematical families: the server renders the task from the same parameters it verifies. */
export type ProgramSpec =
  | { type: 'fraction'; a: number; b: number; c: number; d: number; operation: 'add' | 'multiply' }
  | { type: 'linear'; a: number; b: number; c: number }
  | { type: 'percent'; base: number; percent: number }
  | { type: 'quadratic'; root1: number; root2: number };

export interface TutorExercise {
  id: string;
  subjectId: string;
  sourceId: string | null;
  skillId: string;
  prompt: string;
  choices: string[];
  figure: Figure | null;
  listing: string | null;
  answer: string;
  solution: string;
  steps: string[];
  kind: 'foundation' | 'typical' | 'transfer';
  difficulty: number;
  maxPoints: number;
  rationale: string;
  validation: 'program' | 'catalogue' | 'independent-ai';
}
export interface SolutionAnalysis {
  readable: boolean;
  complete: boolean;
  confidence: number;
  clarification: string;
  transcription: string[];
  verdict: 'correct' | 'partial' | 'incorrect' | 'uncertain';
  points: number | null;
  reasoning: 'sound' | 'partial' | 'unsound' | 'unknown';
  goodSteps: string[];
  errors: { category: ErrorCategory; step: string; explanation: string; skillId: string }[];
  feedback: string;
  nextStep: string;
  learned: string;
  formulas: { name: string; usedCorrectly: boolean }[];
}
export interface TutorEvidence {
  state: SkillState;
  confidence: number;
  reasoningEvidence: number;
  assessedAttempts: number;
  hintAverage: number;
  timeAverageMs: number;
  difficulty: number;
  lastIndependentAt: number | null;
  formulas: Record<string, { correct: number; incorrect: number }>;
}
export interface ErrorMemory {
  category: ErrorCategory;
  occurrences: number;
  skillIds: string[];
  lastSeenAt: number;
  repairedAt: number | null;
  lastExplanation: string;
}
export interface StudentModel {
  version: 1;
  skills: Record<string, TutorEvidence>;
  errors: Partial<Record<ErrorCategory, ErrorMemory>>;
  explanationStyle: 'simple' | 'visual' | 'formal';
  appliedSubmissionIds: string[];
  plan: { now: string; skillId: string; reason: string; next: string[]; updatedAt: number } | null;
  recentExams: { sessionId: string; level: 'PP' | 'PR'; earned: number; possible: number; ungraded: number; repairSkillIds: string[]; takenAt: number }[];
}
export interface TutorImage { id: string; data: string; mime: 'image/jpeg' | 'image/png' | 'image/webp'; hash: string }
export interface Submission {
  id: string;
  requestId: string;
  exerciseId: string;
  imageIds: string[];
  imageHash: string;
  receivedAt: number;
  elapsedMs: number;
  hintsUsed: number;
  selfConfidence: 'guess' | 'partial' | 'sure';
  status: 'received' | 'analyzing' | 'graded' | 'clarify' | 'error' | 'superseded';
  analysis: SolutionAnalysis | null;
  error: string | null;
}
export interface TutorMessage { id: string; exerciseId: string; role: 'user' | 'assistant'; text: string; helpLevel: number; at: number }
export interface MiniLesson { skillId: string; title: string; steps: { title: string; text: string }[]; step: number; checked: boolean }
export interface TutorSession {
  id: string;
  subjectId: string;
  examLevel: 'PP' | 'PR' | null;
  mode: TutorMode;
  startedAt: number;
  endedAt: number | null;
  pausedAt: number | null;
  pausedMs: number;
  taskTimeMs: Record<string, number>;
  deadlineAt: number | null;
  currentIndex: number;
  exerciseStartedAt: number;
  exercises: TutorExercise[];
  submissions: Submission[];
  messages: TutorMessage[];
  hints: Record<string, string[]>;
  assistance: Record<string, number>;
  introduction: string;
  phases: string[];
  lesson: MiniLesson | null;
  summary: { learned: string[]; progress: string; improve: string; next: string } | null;
  report: ExamReport | null;
}
export interface ExamReport {
  earned: number; possible: number; ungraded: number;
  correct: number; partial: number; incorrect: number; unanswered: number;
  lost: { exerciseId: string; points: number | null; reasons: string[] }[];
  timeUsedMs: number;
  timedOut: boolean;
  repairSkillIds: string[];
  previousPercent: number | null;
}
export interface TutorWorkspace {
  version: 1;
  id: string;
  createdAt: number;
  revision: number;
  student: StudentModel;
  sessions: TutorSession[];
  activeSessionId: string | null;
  scanners: { hash: string; expiresAt: number }[];
  operation: { id: string; kind: string; expiresAt: number } | null;
}
export type PublicExercise = Omit<TutorExercise, 'answer' | 'solution' | 'steps'> & Partial<Pick<TutorExercise, 'answer' | 'solution' | 'steps'>>;
export type PublicSession = Omit<TutorSession, 'exercises'> & { exercises: PublicExercise[] };
export interface TutorSnapshot {
  revision: number;
  student: StudentModel | null;
  session: PublicSession | null;
  history: { id: string; mode: TutorMode; startedAt: number; endedAt: number | null; count: number; report: ExamReport | null }[];
  busy: boolean;
  role: 'learner' | 'scanner';
}
export interface TutorStatus { available: boolean; storage: 'sqlite' | 'redis' | null; model: string | null; reason: string | null }

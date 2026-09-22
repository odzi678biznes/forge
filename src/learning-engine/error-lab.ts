import type { Attempt, CommonError, Question, Skill } from '@/data/types';

/**
 * Laboratorium bledow - Blueprint sek. 7.4.
 *
 * Grupujemy wedlug PRZYCZYNY, nie wedlug objawu. Dwa rozne zadania, w ktorych
 * uczen zgubil ten sam znak, to jeden wpis do naprawy, a nie dwa niezalezne
 * bledy. Dlatego kluczem grupy jest `errorId` z tresci, a nie id pytania.
 */

/**
 * Blueprint sek. 4.5, osiagniecie "Blad naprawiony": trzy kolejne poprawne
 * warianty po wczesniejszym bledzie.
 */
export const REPAIR_STREAK_REQUIRED = 3;

export interface ErrorGroup {
  errorId: string;
  error: CommonError;
  skillId: string;
  skillName: string;
  /** Ile razy ten sam blad sie pojawil. */
  occurrences: number;
  lastSeenAt: number;
  /** Konkretny przyklad - tresc zadania i to, co uczen wtedy napisal. */
  exampleQuestion: Question;
  exampleAnswer: string;
  /** Poprawne proby z rzedu po ostatnim wystapieniu bledu. */
  repairStreak: number;
  repaired: boolean;
}

export interface ErrorLabInput {
  attempts: Attempt[];
  questions: Question[];
  skills: Skill[];
}

export function buildErrorLab({ attempts, questions, skills }: ErrorLabInput): ErrorGroup[] {
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const skillById = new Map(skills.map((s) => [s.id, s]));

  // Indeks wszystkich zdefiniowanych bledow - tresc jest zrodlem opisu
  // przyczyny i zlamanej zasady, proba dostarcza tylko dowodu wystapienia.
  const errorById = new Map<string, CommonError>();
  for (const q of questions) {
    for (const e of q.commonErrors) errorById.set(e.id, e);
  }

  const byError = new Map<string, Attempt[]>();
  for (const a of attempts) {
    if (a.errorId === null) continue;
    const bucket = byError.get(a.errorId);
    if (bucket) bucket.push(a);
    else byError.set(a.errorId, [a]);
  }

  const groups: ErrorGroup[] = [];

  for (const [errorId, hits] of byError) {
    const error = errorById.get(errorId);
    if (!error) continue; // Blad z usunietej tresci - pomijamy zamiast zgadywac.

    const sorted = [...hits].sort((a, b) => a.answeredAt - b.answeredAt);
    const last = sorted[sorted.length - 1];
    if (!last) continue;

    const exampleQuestion = questionById.get(last.questionId);
    if (!exampleQuestion) continue;

    const streak = repairStreakAfter(attempts, last.skillId, last.answeredAt);

    groups.push({
      errorId,
      error,
      skillId: last.skillId,
      skillName: skillById.get(last.skillId)?.name ?? last.skillId,
      occurrences: sorted.length,
      lastSeenAt: last.answeredAt,
      exampleQuestion,
      exampleAnswer: last.userAnswer,
      repairStreak: streak,
      repaired: streak >= REPAIR_STREAK_REQUIRED,
    });
  }

  // Najpierw to, co czeka na naprawe; potem to, co powtarza sie najczesciej.
  return groups.sort((a, b) => {
    if (a.repaired !== b.repaired) return a.repaired ? 1 : -1;
    if (a.occurrences !== b.occurrences) return b.occurrences - a.occurrences;
    return b.lastSeenAt - a.lastSeenAt;
  });
}

/**
 * Liczy poprawne proby z rzedu na danej kompetencji po ostatnim bledzie.
 * Pierwsza pomylka przerywa serie - naprawa ma byc powtarzalna, nie jednorazowa.
 */
function repairStreakAfter(
  attempts: Attempt[],
  skillId: string,
  after: number,
): number {
  const later = attempts
    .filter((a) => a.skillId === skillId && a.answeredAt > after)
    .sort((a, b) => a.answeredAt - b.answeredAt);

  let streak = 0;
  for (const a of later) {
    if (a.correctness === 'correct') streak += 1;
    else break;
  }
  return streak;
}

/** Ile bledow czeka na naprawe - liczba na odznace w nawigacji. */
export function openErrorCount(groups: ErrorGroup[]): number {
  return groups.filter((g) => !g.repaired).length;
}

import {
  MasteryLevel,
  type Attempt,
  type Question,
  type SkillState,
} from '@/data/types';

/**
 * Awans kompetencji (Blueprint sek. 4.1).
 *
 * Kluczowa decyzja projektowa: awans NIE jest funkcja liczby punktow ani liczby
 * prob. Kazdy poziom ma jeden jawny warunek, ktory musi zostac spelniony
 * DOWODEM okreslonego rodzaju. Dzieki temu poziom 3 zawsze znaczy to samo:
 * "typowe zadanie rozwiazane bez pomocy", a nie "duzo klikania w tym dziale".
 */

/** Ile dni musi uplynac od osiagniecia poziomu 4, zeby liczyc odroczenie. */
export const RETENTION_DELAY_DAYS = 7;

/** Ile kolejnych samodzielnych poprawnych odpowiedzi wymaga poziom 3. */
export const INDEPENDENT_STREAK_FOR_LEVEL_3 = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MasteryTransition {
  from: MasteryLevel;
  to: MasteryLevel;
  /** Jawne uzasadnienie - trafia na ekran podsumowania misji. */
  reason: string;
}

/**
 * Wylicza nowy stan kompetencji po jednej probie.
 * Funkcja czysta: ten sam stan + ta sama proba zawsze daja ten sam wynik.
 */
export function applyAttempt(
  state: SkillState,
  attempt: Attempt,
  question: Question,
): { state: SkillState; transition: MasteryTransition | null } {
  const independent = attempt.hintLevel === 0;
  const correct = attempt.correctness === 'correct';

  const next: SkillState = {
    ...state,
    totalAttempts: state.totalAttempts + 1,
    lastAttemptAt: attempt.answeredAt,
    independentStreak:
      correct && independent ? state.independentStreak + 1 : 0,
    recentErrors: nextRecentErrors(state.recentErrors, attempt.errorId),
  };

  const transition = correct
    ? promote(state, next, attempt, question)
    : demote(state, next, attempt, question);

  return { state: next, transition };
}

function promote(
  before: SkillState,
  next: SkillState,
  attempt: Attempt,
  question: Question,
): MasteryTransition | null {
  const independent = attempt.hintLevel === 0;
  const level = before.level;

  // 4 -> 5: poprawna odpowiedz po odroczeniu, bez pomocy.
  if (level === MasteryLevel.Transfer) {
    const reachedAt = before.levelReachedAt;
    const elapsed = reachedAt === null ? 0 : attempt.answeredAt - reachedAt;
    if (independent && elapsed >= RETENTION_DELAY_DAYS * DAY_MS) {
      return commit(next, level, MasteryLevel.Retained, attempt.answeredAt,
        `Poprawnie bez pomocy po ${Math.floor(elapsed / DAY_MS)} dniach przerwy.`);
    }
    return null;
  }

  // 3 -> 4: zadanie transferowe bez pomocy.
  if (level === MasteryLevel.Independent) {
    if (independent && question.kind === 'transfer') {
      return commit(next, level, MasteryLevel.Transfer, attempt.answeredAt,
        'Nowy kontekst rozwiazany samodzielnie.');
    }
    return null;
  }

  // 2 -> 3: dwie z rzedu samodzielne poprawne odpowiedzi na typowym zadaniu.
  if (level === MasteryLevel.Assisted) {
    if (
      independent &&
      question.kind !== 'transfer' &&
      next.independentStreak >= INDEPENDENT_STREAK_FOR_LEVEL_3
    ) {
      return commit(next, level, MasteryLevel.Independent, attempt.answeredAt,
        `${next.independentStreak} typowe zadania z rzedu bez pomocy.`);
    }
    return null;
  }

  // 1 -> 2: wystarczyla mala wskazowka (szczeble 1-3).
  if (level === MasteryLevel.Recognised) {
    if (attempt.hintLevel <= 3) {
      return commit(next, level, MasteryLevel.Assisted, attempt.answeredAt,
        independent
          ? 'Poprawnie bez pomocy.'
          : 'Wystarczyla mala wskazowka.');
    }
    return null;
  }

  // 0 -> 1: poprawnie, nawet po pelnym rozwiazaniu.
  return commit(next, level, MasteryLevel.Recognised, attempt.answeredAt,
    independent ? 'Pierwsza poprawna odpowiedz.' : 'Poprawnie po podpowiedzi.');
}

/**
 * Cofniecie (Blueprint sek. 6.5): "po bledzie fundamentalnym cofniecie o jeden
 * poziom, nie obnizenie calego dzialu".
 *
 * Cofamy tylko wtedy, gdy blad wystapil BEZ pomocy na zadaniu, ktore dany
 * poziom powinien juz obejmowac. Blad na zadaniu trudniejszym niz obecny
 * poziom to normalny element nauki, nie regres. Podloga to poziom 1 - raz
 * okazana znajomosc nie wraca do "nieznane".
 */
function demote(
  before: SkillState,
  next: SkillState,
  attempt: Attempt,
  question: Question,
): MasteryTransition | null {
  if (attempt.hintLevel !== 0) return null;
  if (attempt.correctness === 'partial') return null;
  if (before.level <= MasteryLevel.Recognised) return null;

  // Zadanie transferowe nie moze zbic poziomu ponizej 4 - transfer ma prawo
  // sie nie udac, dopoki fundament dziala.
  const withinScope =
    question.kind === 'transfer'
      ? before.level >= MasteryLevel.Transfer
      : true;
  if (!withinScope) return null;

  const to = (before.level - 1) as MasteryLevel;
  return commit(next, before.level, to, attempt.answeredAt,
    'Blad bez pomocy na zadaniu w zakresie tego poziomu.');
}

function commit(
  next: SkillState,
  from: MasteryLevel,
  to: MasteryLevel,
  at: number,
  reason: string,
): MasteryTransition {
  next.level = to;
  next.levelReachedAt = at;
  return { from, to, reason };
}

const RECENT_ERROR_WINDOW = 10;

function nextRecentErrors(current: string[], errorId: string | null): string[] {
  if (errorId === null) return current;
  return [...current, errorId].slice(-RECENT_ERROR_WINDOW);
}

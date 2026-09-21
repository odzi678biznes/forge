import { MasteryLevel, type SkillState } from '@/data/types';

/**
 * Kolejka powtorek (Blueprint sek. 8: "powtorki 1 / 7 / 21 dni").
 *
 * Swiadomie NIE implementujemy SM-2 ani FSRS. Blueprint sek. 6 nazywa silnik
 * "jawna heurystyka wersji 1"; drabina stalych odstepow jest w calosci
 * wytlumaczalna uzytkownikowi (wymog sek. 17), a jej wagi mozna zmienic
 * dopiero na podstawie zebranych danych.
 *
 * Podstawa dowodowa dla rozlozonej praktyki jest umiarkowana, nie pewna
 * (Murray, Horner i Gobel 2025) - traktujemy te odstepy jako hipoteze.
 */

export const REVIEW_INTERVALS_DAYS = [1, 7, 21, 45] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Planuje kolejna powtorke po probie.
 * - sukces: przesuwa o jeden szczebel drabiny w gore,
 * - porazka: wraca na szczebel pierwszy (1 dzien), bez zerowania kompetencji.
 */
export function scheduleReview(
  state: SkillState,
  wasCorrect: boolean,
  now: number,
): Pick<SkillState, 'reviewDueAt' | 'reviewStep'> {
  // Kompetencji nierozpoznanych nie kolejkujemy - najpierw trzeba je poznac.
  if (state.level === MasteryLevel.Unknown) {
    return { reviewDueAt: null, reviewStep: 0 };
  }

  const step = wasCorrect
    ? Math.min(state.reviewStep + 1, REVIEW_INTERVALS_DAYS.length - 1)
    : 0;

  const days = REVIEW_INTERVALS_DAYS[step] ?? REVIEW_INTERVALS_DAYS[0];
  return { reviewDueAt: now + days * DAY_MS, reviewStep: step };
}

/** Czy kompetencja czeka na powtorke w danym momencie. */
export function isDue(state: SkillState, now: number): boolean {
  return state.reviewDueAt !== null && state.reviewDueAt <= now;
}

/** O ile dni powtorka jest spozniona (0 gdy nie jest). */
export function daysOverdue(state: SkillState, now: number): number {
  if (state.reviewDueAt === null) return 0;
  const diff = now - state.reviewDueAt;
  return diff <= 0 ? 0 : diff / DAY_MS;
}

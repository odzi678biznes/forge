import { MasteryLevel, type Skill, type SkillState } from '@/data/types';
import { daysOverdue } from './review';

/**
 * Funkcja priorytetu - Blueprint sek. 6.
 *
 *   priorytet = 0,35 x termin_powtorki
 *             + 0,25 x luka_umiejetnosci
 *             + 0,20 x wartosc_maturalna
 *             + 0,10 x czestotliwosc_bledu
 *             + 0,10 x potrzeba_przeplatania
 *
 * Kazdy skladnik jest znormalizowany do 0..1, wiec wynik tez miesci sie
 * w 0..1 i da sie go rozlozyc na czynniki na ekranie ("dlaczego to pytanie?").
 * To jawna heurystyka v1, nie model uczony na danych.
 */

export const PRIORITY_WEIGHTS = {
  reviewDue: 0.35,
  skillGap: 0.25,
  examValue: 0.2,
  errorFrequency: 0.1,
  interleaveNeed: 0.1,
} as const;

/** Po ilu dniach spoznienia skladnik powtorki osiaga maksimum. */
const OVERDUE_SATURATION_DAYS = 7;

/** Ile bledow w oknie ostatnich prob daje maksymalny skladnik bledu. */
const ERROR_SATURATION_COUNT = 5;

/** Ile ostatnich kompetencji bierzemy pod uwage przy przeplataniu. */
export const INTERLEAVE_WINDOW = 3;

export interface PriorityBreakdown {
  reviewDue: number;
  skillGap: number;
  examValue: number;
  errorFrequency: number;
  interleaveNeed: number;
  total: number;
}

export interface PriorityContext {
  now: number;
  /** Id kompetencji z ostatnich prob, od najnowszej. */
  recentSkillIds: string[];
}

export function scoreSkill(
  skill: Skill,
  state: SkillState,
  ctx: PriorityContext,
): PriorityBreakdown {
  const parts = {
    reviewDue: reviewDueScore(state, ctx.now),
    skillGap: skillGapScore(state),
    examValue: clamp01(skill.examValue),
    errorFrequency: errorFrequencyScore(state),
    interleaveNeed: interleaveScore(skill.id, ctx.recentSkillIds),
  };

  const total =
    parts.reviewDue * PRIORITY_WEIGHTS.reviewDue +
    parts.skillGap * PRIORITY_WEIGHTS.skillGap +
    parts.examValue * PRIORITY_WEIGHTS.examValue +
    parts.errorFrequency * PRIORITY_WEIGHTS.errorFrequency +
    parts.interleaveNeed * PRIORITY_WEIGHTS.interleaveNeed;

  return { ...parts, total };
}

/**
 * Powtorka niezalegla daje 0 - nie wyciagamy materialu przed terminem.
 * Powtorka na dzis daje 0,6; tydzien spoznienia wysyca skladnik do 1.
 */
function reviewDueScore(state: SkillState, now: number): number {
  if (state.reviewDueAt === null || state.reviewDueAt > now) return 0;
  const overdue = daysOverdue(state, now);
  return clamp01(0.6 + 0.4 * (overdue / OVERDUE_SATURATION_DAYS));
}

function skillGapScore(state: SkillState): number {
  return (MasteryLevel.Retained - state.level) / MasteryLevel.Retained;
}

function errorFrequencyScore(state: SkillState): number {
  return clamp01(state.recentErrors.length / ERROR_SATURATION_COUNT);
}

/**
 * Im dawniej dana kompetencja byla cwiczona, tym wieksza potrzeba jej
 * przeplecenia. Kompetencja cwiczona przed chwila dostaje 0.
 */
function interleaveScore(skillId: string, recentSkillIds: string[]): number {
  const idx = recentSkillIds.indexOf(skillId);
  if (idx === -1) return 1;
  if (idx >= INTERLEAVE_WINDOW) return 1;
  return clamp01(idx / INTERLEAVE_WINDOW);
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** Rozklad priorytetu na jezyk naturalny - ekran "dlaczego to pytanie". */
export function explain(b: PriorityBreakdown): string[] {
  const lines: string[] = [];
  if (b.reviewDue > 0) lines.push('Zaplanowana powtorka jest wymagalna.');
  if (b.skillGap >= 0.6) lines.push('Ta kompetencja jest wyraznie ponizej celu.');
  if (b.examValue >= 0.7) lines.push('Wysoka wartosc maturalna.');
  if (b.errorFrequency >= 0.4) lines.push('Powtarzajacy sie blad w ostatnich probach.');
  if (b.interleaveNeed >= 0.9) lines.push('Dawno nie cwiczone - czas na przeplecenie.');
  if (lines.length === 0) lines.push('Kontynuacja biezacego celu.');
  return lines;
}

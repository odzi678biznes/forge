import type { Attempt, LessonProgress } from '@/data/types';
import { dayKey } from './schedule';

/**
 * Aktywność dzień po dniu - dla kalendarza i ekranu postępu.
 *
 * Liczymy to, co mówi o nauce: próby, próby poprawne bez pomocy i ukończone
 * lekcje. Nie liczymy czasu w aplikacji (sek. 13: tego nie optymalizujemy).
 */
export interface DayActivity {
  date: string;
  attempts: number;
  correct: number;
  /** Poprawnie i bez żadnej podpowiedzi. */
  independent: number;
  lessons: number;
}

export function activityByDay(
  attempts: Attempt[],
  lessons: LessonProgress[],
): Map<string, DayActivity> {
  const out = new Map<string, DayActivity>();
  const get = (date: string): DayActivity => {
    let d = out.get(date);
    if (!d) {
      d = { date, attempts: 0, correct: 0, independent: 0, lessons: 0 };
      out.set(date, d);
    }
    return d;
  };
  for (const a of attempts) {
    const d = get(dayKey(a.answeredAt));
    d.attempts += 1;
    if (a.correctness === 'correct') {
      d.correct += 1;
      if (a.hintLevel === 0) d.independent += 1;
    }
  }
  for (const l of lessons) get(dayKey(l.completedAt)).lessons += 1;
  return out;
}

/** Natężenie dnia 0..4 do mapy aktywności - progi w próbach. */
export function intensity(day: DayActivity | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!day) return 0;
  const work = day.attempts + day.lessons * 3;
  if (work === 0) return 0;
  if (work < 5) return 1;
  if (work < 12) return 2;
  if (work < 25) return 3;
  return 4;
}

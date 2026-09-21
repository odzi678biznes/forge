import { describe, expect, it } from 'vitest';
import { MasteryLevel } from '@/data/types';
import { REVIEW_INTERVALS_DAYS, daysOverdue, isDue, scheduleReview } from './review';
import { DAY, T0, makeState } from './testing';

describe('kolejka powtorek', () => {
  it('nie kolejkuje kompetencji nierozpoznanej', () => {
    const r = scheduleReview(makeState({ level: MasteryLevel.Unknown }), true, T0);
    expect(r.reviewDueAt).toBeNull();
  });

  it('pierwszy sukces planuje powtorke na 1 dzien', () => {
    const r = scheduleReview(makeState({ level: MasteryLevel.Recognised }), true, T0);
    expect(r.reviewStep).toBe(1);
    expect(r.reviewDueAt).toBe(T0 + REVIEW_INTERVALS_DAYS[1] * DAY);
  });

  it('kolejne sukcesy wspinaja sie po drabinie 1 / 7 / 21 / 45', () => {
    let state = makeState({ level: MasteryLevel.Independent });
    const got: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      const r = scheduleReview(state, true, T0);
      state = { ...state, ...r };
      got.push((r.reviewDueAt! - T0) / DAY);
    }
    expect(got).toEqual([7, 21, 45, 45, 45]);
  });

  it('blad cofa na pierwszy szczebel, ale nie rusza poziomu kompetencji', () => {
    const state = makeState({ level: MasteryLevel.Transfer, reviewStep: 3 });
    const r = scheduleReview(state, false, T0);
    expect(r.reviewStep).toBe(0);
    expect((r.reviewDueAt! - T0) / DAY).toBe(REVIEW_INTERVALS_DAYS[0]);
    expect(state.level).toBe(MasteryLevel.Transfer);
  });
});

describe('wymagalnosc powtorki', () => {
  it('powtorka w przyszlosci nie jest wymagalna', () => {
    expect(isDue(makeState({ reviewDueAt: T0 + DAY }), T0)).toBe(false);
  });

  it('powtorka na teraz jest wymagalna', () => {
    expect(isDue(makeState({ reviewDueAt: T0 }), T0)).toBe(true);
  });

  it('brak zaplanowanej powtorki to brak wymagalnosci', () => {
    expect(isDue(makeState({ reviewDueAt: null }), T0)).toBe(false);
  });

  it('liczy spoznienie w dniach i nie schodzi ponizej zera', () => {
    expect(daysOverdue(makeState({ reviewDueAt: T0 - 3 * DAY }), T0)).toBe(3);
    expect(daysOverdue(makeState({ reviewDueAt: T0 + 3 * DAY }), T0)).toBe(0);
  });
});

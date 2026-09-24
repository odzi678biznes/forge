import { describe, expect, it } from 'vitest';
import { MasteryLevel, emptySkillState } from '@/data/types';
import { WEAK_RATIO, analyzeExam, clampScore, scheduleExamReviews } from './exam-analysis';

const tasks = [
  { no: '1', points: 2, skills: ['a'] },
  { no: '2', points: 4, skills: ['a', 'b'] },
  { no: '3', points: 4, skills: ['c'] },
];

describe('analiza arkusza', () => {
  it('liczy wynik i procent', () => {
    const r = analyzeExam(tasks, { '1': 2, '2': 1, '3': 4 });
    expect(r.earned).toBe(7);
    expect(r.max).toBe(10);
    expect(r.ratio).toBeCloseTo(0.7);
    expect(r.unscored).toBe(0);
  });

  it('zadanie liczy sie w calosci dla kazdej swojej umiejetnosci', () => {
    const r = analyzeExam(tasks, { '1': 2, '2': 1, '3': 4 });
    const a = r.bySkill.find((s) => s.skillId === 'a')!;
    const b = r.bySkill.find((s) => s.skillId === 'b')!;
    expect([a.earned, a.max]).toEqual([3, 6]);
    expect([b.earned, b.max]).toEqual([1, 4]);
  });

  it('slabe umiejetnosci sa uporzadkowane od najwiekszej straty', () => {
    const r = analyzeExam(tasks, { '1': 0, '2': 0, '3': 1 });
    expect(r.weak).toEqual(['a', 'b', 'c']);
    const good = analyzeExam(tasks, { '1': 2, '2': 4, '3': 4 });
    expect(good.weak).toEqual([]);
  });

  it('prog slabej umiejetnosci jest jawny', () => {
    expect(WEAK_RATIO).toBe(0.6);
  });

  it('brak wpisu to zero punktow i jest liczony jako niewypelniony', () => {
    const r = analyzeExam(tasks, { '1': 2 });
    expect(r.earned).toBe(2);
    expect(r.unscored).toBe(2);
  });

  it('punkty sa przycinane do zakresu zadania', () => {
    expect(clampScore(7, 4)).toBe(4);
    expect(clampScore(-1, 4)).toBe(0);
    expect(clampScore(Number.NaN, 4)).toBe(0);
    expect(analyzeExam(tasks, { '1': 99, '2': 4, '3': 4 }).earned).toBe(10);
  });
});

describe('powtorki po arkuszu', () => {
  const now = 1_000_000;
  const at = (id: string, level: MasteryLevel, reviewDueAt: number | null) => ({
    ...emptySkillState(id),
    level,
    reviewDueAt,
  });

  it('slaba umiejetnosc z postepem dostaje powtorke na teraz, poziom zostaje', () => {
    const states = new Map([['a', at('a', MasteryLevel.Independent, now + 99_999)]]);
    const [u] = scheduleExamReviews(states, ['a'], now);
    expect(u?.reviewDueAt).toBe(now);
    expect(u?.level).toBe(MasteryLevel.Independent);
  });

  it('pomija umiejetnosci nieruszone i te, ktore juz czekaja na powtorke', () => {
    const states = new Map([
      ['a', at('a', MasteryLevel.Unknown, null)],
      ['b', at('b', MasteryLevel.Assisted, now - 5)],
    ]);
    expect(scheduleExamReviews(states, ['a', 'b', 'x'], now)).toEqual([]);
  });
});

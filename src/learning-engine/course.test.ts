import { describe, expect, it } from 'vitest';
import { MasteryLevel, emptySkillState, type Skill, type SkillState, type Topic } from '@/data/types';
import {
  courseOrder,
  courseSummary,
  nextLessonSkill,
  readiness,
  skillStatus,
  topicProgress,
} from './course';
import { activityByDay, intensity } from './activity';
import { makeAttempt, makeSkill } from './testing';

const topics: Topic[] = [
  { id: 't-2', subjectId: 'math', name: 'Drugi' },
  { id: 't-1', subjectId: 'math', name: 'Pierwszy' },
];

const skills: Skill[] = [
  makeSkill({ id: 'a', topicId: 't-1', level: 'PP', examValue: 1 }),
  makeSkill({ id: 'b', topicId: 't-2', level: 'PP', examValue: 1 }),
  makeSkill({ id: 'c', topicId: 't-2', level: 'PR', examValue: 1 }),
];

const withLevel = (id: string, level: MasteryLevel): SkillState => ({ ...emptySkillState(id), level });

describe('kolejnosc kursu', () => {
  it('idzie wedlug kolejnosci dzialow, nie kolejnosci listy umiejetnosci', () => {
    expect(courseOrder(topics, skills).map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });

  it('nastepna lekcja to pierwsza nieprzerobiona', () => {
    const order = courseOrder(topics, skills);
    const states = new Map([['b', withLevel('b', MasteryLevel.Independent)]]);
    expect(nextLessonSkill(order, states)?.id).toBe('c');
  });

  it('podpowiedz nie przesuwa kursu - poziom Wspomagane to jeszcze nie przerobione', () => {
    const order = courseOrder(topics, skills);
    const states = new Map([['b', withLevel('b', MasteryLevel.Assisted)]]);
    expect(nextLessonSkill(order, states)?.id).toBe('b');
  });
});

describe('status umiejetnosci', () => {
  it('przeczytana lekcja bez dowodu to "w trakcie", nie "przerobione"', () => {
    expect(skillStatus(undefined, true)).toBe('learning');
    expect(skillStatus(withLevel('a', MasteryLevel.Independent), false)).toBe('covered');
    expect(skillStatus(withLevel('a', MasteryLevel.Retained), false)).toBe('retained');
    expect(skillStatus(undefined, false)).toBe('new');
  });
});

describe('postep dzialu i kursu', () => {
  const states = new Map([
    ['b', withLevel('b', MasteryLevel.Independent)],
    ['c', withLevel('c', MasteryLevel.Assisted)],
  ]);

  it('dzial liczy przerobione osobno dla podstawy i rozszerzenia', () => {
    const p = topicProgress(topics[0]!, skills, states, new Set());
    expect(p.total).toBe(2);
    expect(p.covered).toBe(1);
    expect(p.levels.PP).toEqual({ total: 1, covered: 1 });
    expect(p.levels.PR).toEqual({ total: 1, covered: 0 });
  });

  it('podsumowanie kursu', () => {
    const s = courseSummary(courseOrder(topics, skills), states, new Set(['a']));
    expect(s.covered).toBe(1);
    expect(s.learning).toBe(2);
    expect(s.ratio).toBeCloseTo(1 / 3);
  });
});

describe('szacunek gotowosci', () => {
  it('podstawa liczy tylko umiejetnosci PP, rozszerzenie - wszystkie', () => {
    const states = new Map([
      ['a', withLevel('a', MasteryLevel.Retained)],
      ['b', withLevel('b', MasteryLevel.Retained)],
    ]);
    expect(readiness(skills, states, 'PP').ratio).toBeCloseTo(1);
    expect(readiness(skills, states, 'PR').ratio).toBeCloseTo(2 / 3);
  });

  it('bez danych gotowosc wynosi zero', () => {
    expect(readiness(skills, new Map(), 'PR').ratio).toBe(0);
  });
});

describe('material dodatkowy (poza wymaganiami egzaminu)', () => {
  const withExtra = [...skills, makeSkill({ id: 'x', topicId: 't-1', level: 'PR', examValue: 1, extra: true })];

  it('nie wchodzi do kolejnosci kursu ani planu', () => {
    expect(courseOrder(topics, withExtra).map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });

  it('nie zmienia postepu dzialu ani gotowosci', () => {
    expect(topicProgress(topics[1]!, withExtra, new Map(), new Set()).total).toBe(1);
    const states = new Map([['x', withLevel('x', MasteryLevel.Retained)]]);
    expect(readiness(withExtra, states, 'PR').ratio).toBe(0);
  });
});

describe('aktywnosc', () => {
  it('grupuje po lokalnym dniu i odroznia sukces samodzielny od wspomaganego', () => {
    const day = new Date(2026, 8, 1, 10).getTime();
    const map = activityByDay(
      [
        makeAttempt({ answeredAt: day, correctness: 'correct', hintLevel: 0 }),
        makeAttempt({ answeredAt: day + 1000, correctness: 'correct', hintLevel: 2 }),
        makeAttempt({ answeredAt: day + 2000, correctness: 'incorrect' }),
      ],
      [{ skillId: 'a', completedAt: day }],
    );
    const d = map.get('2026-09-01');
    expect(d).toEqual({ date: '2026-09-01', attempts: 3, correct: 2, independent: 1, lessons: 1 });
    expect(intensity(d)).toBe(2);
    expect(intensity(undefined)).toBe(0);
  });
});

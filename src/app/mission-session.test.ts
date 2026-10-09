import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { IndexedDbStorage } from '@/data/indexeddb-storage';
import { makeQuestion, makeSkill } from '@/learning-engine/testing';
import { emptySkillState } from '@/data/types';
import { MISSION_SESSION_KEY, readMissionSession, type MissionSession } from './mission-session';

const session = (): MissionSession => ({
  version: 1, subject: 'math',
  mission: { id: 'active', title: 'Ćwiczenia', kind: 'training', rationale: '', questionIds: [], startedAt: 1, finishedAt: null },
  plan: { kind: 'training', title: 'Ćwiczenia', rationale: '', questionCount: 6 },
  current: { question: makeQuestion(), skill: makeSkill(), rule: 'fallback', reasons: [],
    breakdown: { reviewDue: 0, skillGap: 0, examValue: 0, errorFrequency: 0, interleaveNeed: 0, total: 0 } },
  steps: [], feedback: null,
  draft: { questionId: 'q-1', answer: '-5 - 3', hintLevel: 6, confidence: 'partial', reasoning: 'Najpierw odejmuję' },
  diagnosticQueue: [], recentSkillIds: [], asked: ['q-1'], startedAt: 42, deadline: null,
});

describe('checkpoint aktywnej misji', () => {
  it('przywraca tylko jawnie otwarte podpowiedzi i zachowuje starszy szkic', () => {
    const s = session();
    s.draft!.visibleHintLevel = 2;
    s.draft!.guidanceHelpUsed = true;
    s.draft!.workingTex = 'x^3+3x^2+3x+1';
    expect(readMissionSession(JSON.stringify(s))?.draft?.visibleHintLevel).toBe(2);
    expect(readMissionSession(JSON.stringify(s))?.draft?.guidanceHelpUsed).toBe(true);
    expect(readMissionSession(JSON.stringify(s))?.draft?.workingTex).toBe('x^3+3x^2+3x+1');
    delete s.draft!.visibleHintLevel;
    expect(readMissionSession(JSON.stringify(s))?.draft).toEqual(s.draft);
    expect(readMissionSession(JSON.stringify(s))?.draft?.visibleHintLevel ?? 0).toBe(0);
    const invalid = { ...s, draft: { ...s.draft, visibleHintLevel: 99 } };
    expect(readMissionSession(JSON.stringify(invalid))?.draft).toEqual(s.draft);
  });
  it('zachowuje rachunki, cały poziom podpowiedzi i kolejkę po ponownym otwarciu bazy, bez zmiany kompetencji', async () => {
    const name = `resume-${crypto.randomUUID()}`;
    const before = new IndexedDbStorage(name);
    await before.init();
    const learned = { ...emptySkillState('skill-1'), independentStreak: 3 };
    await before.saveSkillState(learned);
    await before.saveLessonProgress({ skillId: 'skill-1', completedAt: 123 });
    await before.setPreference(MISSION_SESSION_KEY, JSON.stringify(session()));
    const after = new IndexedDbStorage(name);
    await after.init();
    const prefs = await after.loadPreferences();
    expect(readMissionSession(prefs.find(p => p.key === MISSION_SESSION_KEY)?.value)).toEqual(session());
    expect(await after.loadSkillStates()).toEqual([learned]);
    expect(await after.loadLessonProgress()).toEqual([{ skillId: 'skill-1', completedAt: 123 }]);
    expect(await after.loadAttempts()).toEqual([]);
    const backup = await after.exportAll();
    expect(backup.preferences?.find(p => p.key === MISSION_SESSION_KEY)).toBeDefined();
  });

  it('ignoruje uszkodzony checkpoint i sesję zakończoną', () => {
    for (const value of [undefined, 'null', '{}', '{', JSON.stringify({ ...session(), version: 2 }), JSON.stringify({ ...session(), steps: [null] }),
      JSON.stringify({ ...session(), mission: { ...session().mission, finishedAt: 12 } })]) {
      expect(readMissionSession(value)).toBeNull();
    }
  });

  it('nie przenosi odpowiedzi na inne pytanie', () => {
    const s = session();
    s.draft!.questionId = 'different-question';
    const restored = readMissionSession(JSON.stringify(s));
    expect(restored?.draft).toBeNull();
    expect(restored?.current.question.id).toBe('q-1');
  });
});

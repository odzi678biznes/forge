import { describe, expect, it } from 'vitest';
import { SNAPSHOT_VERSION, validateSnapshot, type SnapshotV1 } from '@/data/storage-port';
import { MasteryLevel, emptySkillState, type Attempt, type CardState, type Mission } from '@/data/types';
import { mergeSnapshots, pickCardState, pickSkillState } from './sync-merge';

const attempt = (id: string, answeredAt: number, skillId = 'math-1'): Attempt => ({
  id,
  questionId: 'q-1',
  skillId,
  missionId: 'm-1',
  startedAt: answeredAt - 1,
  answeredAt,
  userAnswer: '4',
  correctness: 'correct',
  confidence: 'sure',
  hintLevel: 0,
  errorId: null,
  gradingVersion: 'v1',
  gradedBy: 'auto',
});

const mission = (id: string, finishedAt: number | null): Mission => ({
  id,
  kind: 'training',
  title: 'Trening',
  rationale: 'r',
  questionIds: [],
  startedAt: 1,
  finishedAt,
});

const cardState = (cardId: string, reviews: number, lastReviewedAt: number | null): CardState => ({
  cardId,
  skillId: 'math-1',
  box: reviews,
  dueAt: 100,
  introducedAt: 1,
  lastReviewedAt,
  reviews,
  lapses: 0,
});

const snapshot = (over: Partial<SnapshotV1> = {}): SnapshotV1 => ({
  version: SNAPSHOT_VERSION,
  exportedAt: 1,
  skillStates: [],
  attempts: [],
  missions: [],
  plan: null,
  preferences: [],
  lessonProgress: [],
  cardStates: [],
  examResults: [],
  ...over,
});

describe('synchronizacja przez plik', () => {
  it('odpowiedzi z obu urządzeń sumują się, wspólne liczą się raz', () => {
    const pc = snapshot({ attempts: [attempt('a-1', 10), attempt('a-2', 20)] });
    const phone = snapshot({ attempts: [attempt('a-2', 20), attempt('a-3', 30)] });
    const { merged, report } = mergeSnapshots(pc, phone, 99);
    expect(merged.attempts.map((a) => a.id)).toEqual(['a-1', 'a-2', 'a-3']);
    expect(report.attemptsAdded).toBe(1);
  });

  it('łączenie jest idempotentne: drugi raz ten sam plik nic nie dodaje', () => {
    const pc = snapshot({ attempts: [attempt('a-1', 10)] });
    const phone = snapshot({ attempts: [attempt('a-2', 20)] });
    const once = mergeSnapshots(pc, phone, 99).merged;
    const twice = mergeSnapshots(once, phone, 100);
    expect(twice.report).toEqual({
      attemptsAdded: 0,
      missionsAdded: 0,
      examResultsAdded: 0,
      lessonsAdded: 0,
      skillsUpdated: 0,
      cardsUpdated: 0,
    });
    expect(twice.merged.attempts).toHaveLength(2);
  });

  it('stan umiejętności: wygrywa urządzenie z nowszą odpowiedzią', () => {
    const older = { ...emptySkillState('math-1'), level: MasteryLevel.Recognised, lastAttemptAt: 100 };
    const newer = { ...emptySkillState('math-1'), level: MasteryLevel.Independent, lastAttemptAt: 200 };
    expect(pickSkillState(older, newer)).toBe(newer);
    expect(pickSkillState(newer, older)).toBe(newer);
  });

  it('przy remisie zostaje wcześniejsza powtórka (np. zaplanowana po arkuszu na drugim urządzeniu)', () => {
    const local = { ...emptySkillState('math-1'), lastAttemptAt: 100, reviewDueAt: 5000 };
    const other = { ...emptySkillState('math-1'), lastAttemptAt: 100, reviewDueAt: 3000 };
    expect(pickSkillState(local, other).reviewDueAt).toBe(3000);
  });

  it('fiszka: wygrywa stan z większą liczbą powtórek', () => {
    const a = cardState('c-1', 2, 50);
    const b = cardState('c-1', 5, 40);
    expect(pickCardState(a, b)).toBe(b);
    expect(pickCardState(cardState('c-1', 3, 10), cardState('c-1', 3, 20)).lastReviewedAt).toBe(20);
  });

  it('niedokończona misja zostaje zastąpiona ukończoną z drugiego urządzenia', () => {
    const { merged } = mergeSnapshots(snapshot({ missions: [mission('m-1', null)] }), snapshot({ missions: [mission('m-1', 50)] }), 99);
    expect(merged.missions[0]?.finishedAt).toBe(50);
  });

  it('ustawienia i plan zostają lokalne, brakujące są dopisywane', () => {
    const pc = snapshot({ preferences: [{ key: 'subject', value: 'math' }] });
    const phone = snapshot({ preferences: [{ key: 'subject', value: 'cs' }, { key: 'dayMode', value: 'strong' }] });
    const { merged } = mergeSnapshots(pc, phone, 99);
    expect(merged.preferences).toEqual([
      { key: 'subject', value: 'math' },
      { key: 'dayMode', value: 'strong' },
    ]);
  });

  it('plan każdego przedmiotu: lokalny wygrywa, brakujący przychodzi z pliku', () => {
    const plan = (id: string, subjectId?: string) => ({
      id,
      variant: 'realistic' as const,
      createdAt: 1,
      deadline: null,
      targets: [],
      diagnosisSnapshot: [],
      ...(subjectId ? { subjectId } : {}),
    });
    // Komputer: plan matematyki w starym formacie. Telefon: inny plan
    // matematyki i plan informatyki, którego na komputerze nie ma.
    const pc = snapshot({ plan: plan('p-pc') });
    const phone = snapshot({ plans: [plan('p-phone', 'math'), plan('p-cs', 'cs')] });
    const { merged } = mergeSnapshots(pc, phone, 99);
    expect(merged.plans?.map((p) => p.id)).toEqual(['p-pc', 'p-cs']);
    expect(merged.plan?.id).toBe('p-pc');
  });

  it('wynik łączenia przechodzi walidację importu', () => {
    const pc = snapshot({
      attempts: [attempt('a-1', 10)],
      skillStates: [{ ...emptySkillState('math-1'), lastAttemptAt: 10 }],
      cardStates: [cardState('c-1', 1, 10)],
      lessonProgress: [{ skillId: 'math-1', completedAt: 5 }],
    });
    const phone = snapshot({
      attempts: [attempt('a-2', 20, 'cs-1')],
      skillStates: [{ ...emptySkillState('cs-1'), lastAttemptAt: 20 }],
      examResults: [{ id: 'e-1', examId: 'x', subjectId: 'math', takenAt: 30, scores: { '1': 1 }, minutes: null }],
    });
    const { merged, report } = mergeSnapshots(pc, phone, 99);
    expect(() => validateSnapshot(JSON.parse(JSON.stringify(merged)))).not.toThrow();
    expect(report).toMatchObject({ attemptsAdded: 1, skillsUpdated: 1, examResultsAdded: 1 });
  });
});

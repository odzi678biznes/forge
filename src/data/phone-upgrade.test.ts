import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { IndexedDbStorage } from './indexeddb-storage';
import { emptySkillState, MasteryLevel, type Attempt, type Mission, type SavedPlan } from './types';
import { migratePracticeCourse } from '@/nauka/practice-course';
import { nowaLekcja, type StanNauki } from '@/nauka/silnik';

// These names and version describe the previously published phone database.
// Keep this fixture independent of the adapter's current schema constants.
const stores = ['skillStates', 'attempts', 'missions', 'plan', 'preferences',
  'lessonProgress', 'cardStates', 'examResults', 'backups'] as const;
const oldCourse: StanNauki = {
  wersja: 1,
  lekcje: {
    'num-order': { ...nowaLekcja(), pozycja: 9, ukonczona: 1_723_456_789_000,
      seria: 5, samodzielnosc: 2,
      wyniki: {
        'm1-potega': { proby: 2, pierwsza: false, zaliczona: true, czas: 50_000 },
        'm1-zadanie': { proby: 1, pierwsza: true, zaliczona: true, czas: 35_000 },
      } },
    'num-powers': { ...nowaLekcja(), pozycja: 6,
      wyniki: { 'm2-f1': { proby: 3, pierwsza: false, zaliczona: true } } },
  },
  powtorki: { 'num-order': {
    fsrs: { due: '2026-10-10T09:00:00.000Z', stability: 14.5, difficulty: 3.2,
      elapsed_days: 7, scheduled_days: 14, learning_steps: 0, reps: 8, lapses: 1,
      state: 2, last_review: '2026-09-26T09:00:00.000Z' },
    udanePoPrzerwie: 3, ostatnio: 1_790_400_000_000,
    sesja: { pozycja: 1, bledy: 0, wstawione: ['m1-p2'] },
  } },
  trening: { 'm1-p3': 1_790_500_000_000 },
  korepetytor: { tempo: 'trudniej', komentarz: 'Kontynuuj.', zrodlo: 'reguly', kiedy: 1_790_500_000_000 },
};
const skill = { ...emptySkillState('num-order'), level: MasteryLevel.Retained,
  independentStreak: 6, totalAttempts: 18, levelReachedAt: 1_790_000_000_000,
  lastAttemptAt: 1_790_500_000_000, reviewDueAt: 1_791_000_000_000, reviewStep: 3,
  recentErrors: ['negative-exponent'] };
const attempt: Attempt = { id: 'historical-attempt', questionId: 'num-order-1', skillId: 'num-order',
  missionId: 'historical-mission', startedAt: 100, answeredAt: 130, userAnswer: '4/25',
  correctness: 'correct', confidence: 'sure', hintLevel: 0, errorId: null,
  gradingVersion: 'v1', gradedBy: 'auto' };
const mission: Mission = { id: attempt.missionId, kind: 'training', title: 'Matematyka',
  rationale: 'Nauka', questionIds: [attempt.questionId], startedAt: 100, finishedAt: 130 };
const plan: SavedPlan = { id: 'historical-plan', variant: 'realistic', createdAt: 50,
  deadline: null, targets: [{ skillId: 'num-order', targetLevel: 5 }],
  diagnosisSnapshot: [{ skillId: 'num-order', level: 3 }] };
const completed = { skillId: 'num-order', completedAt: 1_723_456_789_000 };
const flashcard = { cardId: 'num-order-f1', skillId: 'num-order', box: 4, dueAt: 2_000,
  introducedAt: 100, lastReviewedAt: 1_000, reviews: 12, lapses: 2 };
const exam = { id: 'historical-exam', examId: 'mat-2505-pr', subjectId: 'math',
  takenAt: 1_790_000_000_000, scores: { '1': 2, '12.2': 3 }, minutes: 175 };
const preferences = [
  { key: 'nauka.v1', value: JSON.stringify(oldCourse) },
  { key: 'subject', value: 'math' },
  { key: 'forge.workspace.v1:mission:old:q1', value: JSON.stringify({ version: 1,
    updatedAt: 123, notes: 'Mój zapis: 2^(-1) = 1/2', calculations: [{ expression: '2^(-1)', result: '0.5', at: 123 }],
    steps: {}, done: [], mode: 'calculator', expression: '2^(-1)' }) },
  { key: 'forge.lesson-draft.v1:feed:nauka:num-order', value: '{"history":"old presentation checkpoint"}' },
  { key: 'learning.activeMission.v1', value: '{"unfinished":"saved answer"}' },
];

async function historicalDatabase(version: 4 | 5): Promise<string> {
  const name = `forge-phone-upgrade-${crypto.randomUUID()}`;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of stores) {
        if (version === 4 && store === 'examResults') continue;
        const keyPath = ({ skillStates: 'skillId', attempts: 'id', missions: 'id',
          preferences: 'key', lessonProgress: 'skillId', cardStates: 'cardId',
          examResults: 'id', backups: 'id' } as Record<string, string>)[store];
        db.createObjectStore(store, keyPath ? { keyPath } : undefined);
      }
      const tx = request.transaction!;
      tx.objectStore('skillStates').put(skill);
      tx.objectStore('attempts').put(attempt);
      tx.objectStore('missions').put(mission);
      tx.objectStore('plan').put(plan, 'active');
      for (const pref of preferences) tx.objectStore('preferences').put(pref);
      tx.objectStore('lessonProgress').put(completed);
      tx.objectStore('cardStates').put(flashcard);
      if (version === 5) tx.objectStore('examResults').put(exam);
      tx.objectStore('backups').put({ id: 'historical-backup', createdAt: 77,
        reason: 'przed aktualizacją', attempts: 1, missions: 1,
        snapshot: { version: 1, exportedAt: 77, skillStates: [skill], attempts: [attempt], missions: [mission] } });
    };
    request.onsuccess = () => { request.result.close(); resolve(); };
    request.onerror = () => reject(request.error);
  });
  return name;
}

describe('phone app update preserves previous learning evidence', () => {
  for (const version of [4, 5] as const) it(`opens the published v${version} profile without recreating learned records`, async () => {
    const name = await historicalDatabase(version);
    const app = new IndexedDbStorage(name);
    await app.init();
    const before = await app.exportAll();
    expect(before).toMatchObject({ skillStates: [skill], attempts: [attempt], missions: [mission],
      plans: [plan], lessonProgress: [completed], cardStates: [flashcard],
      examResults: version === 5 ? [exam] : [] });
    expect(before.preferences).toEqual(expect.arrayContaining(preferences));
    expect(await app.loadBackup('historical-backup')).toMatchObject({ attempts: [attempt], skillStates: [skill] });

    // The only automatic content migration changes the presentation position.
    const migrated = migratePracticeCourse(JSON.parse(preferences[0]!.value) as StanNauki);
    expect(migrated.lekcje['num-order']!.wyniki).toEqual(oldCourse.lekcje['num-order']!.wyniki);
    expect(migrated.lekcje['num-order']!.ukonczona).toBe(oldCourse.lekcje['num-order']!.ukonczona);
    expect(migrated.lekcje['num-powers']!.wyniki).toEqual(oldCourse.lekcje['num-powers']!.wyniki);
    expect(migrated.powtorki).toEqual(oldCourse.powtorki);
    expect(migrated.trening).toEqual(oldCourse.trening);
    expect(migrated.korepetytor).toEqual(oldCourse.korepetytor);
    await app.setPreference('nauka.v1', JSON.stringify(migrated));
    app.close();

    const reopened = new IndexedDbStorage(name);
    await reopened.init();
    const after = await reopened.exportAll();
    expect({ ...after, exportedAt: 0, preferences: undefined }).toEqual({ ...before, exportedAt: 0, preferences: undefined });
    expect(after.preferences).toEqual(expect.arrayContaining(preferences.slice(1)));
    expect(JSON.parse(after.preferences!.find(p => p.key === 'nauka.v1')!.value)).toEqual(migrated);
    expect(migratePracticeCourse(migrated)).toBe(migrated);
    expect(await reopened.listBackups()).toEqual([{ id: 'historical-backup', createdAt: 77,
      reason: 'przed aktualizacją', attempts: 1, missions: 1 }]);
    reopened.close();
  });
});

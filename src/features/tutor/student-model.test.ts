import { describe, expect, it } from 'vitest';
import { applySolution, emptyEvidence, emptyStudent } from './student-model';
import { adaptDifficulty } from './difficulty';
import { testAnalysis, testExercise } from './test-support';
import { validSpec, verifySpec } from './exercise-validator';
import { validateAnalysis } from '../../../server/tutor/provider';
import { examReport } from './exam-engine';
import type { Submission, TutorSession } from './types';

const submission = (id = 'attempt-1'): Submission => ({ id, requestId: id, exerciseId: 'exercise-0', imageIds: ['photo'], imageHash: 'hash',
  receivedAt: Date.now(), elapsedMs: 60_000, hintsUsed: 0, selfConfidence: 'sure', status: 'graded', analysis: testAnalysis(), error: null });
describe('student reasoning and error memory', () => {
  it('never invents mastery from unreadable or incomplete photographs', () => {
    for (const change of [{ readable: false }, { complete: false }, { confidence: 0.6 }, { verdict: 'uncertain' as const }]) {
      const model = emptyStudent(), attempt = submission(); attempt.analysis = testAnalysis(change);
      expect(applySolution(model, attempt, testExercise())).toBe(model);
    }
  });
  it('applies evidence idempotently and requires several independent successes before raising difficulty', () => {
    let model = emptyStudent();
    for (let i = 1; i <= 4; i++) model = applySolution(model, submission(`attempt-${i}`), testExercise());
    expect(model.skills['num-order']?.state.level).toBe(3);
    expect(model.skills['num-order']?.difficulty).toBe(2);
    expect(model.skills['num-order']?.formulas['Dodawanie ułamków']?.correct).toBe(4);
    const same = applySolution(model, submission('attempt-4'), testExercise());
    expect(same).toBe(model);
  });
  it('tracks the same error across topics and schedules the blocking foundation', () => {
    let model = emptyStudent();
    for (const skillId of ['num-order', 'eq-linear']) {
      const attempt = submission(skillId);
      attempt.analysis = testAnalysis({ verdict: 'incorrect', points: 0, reasoning: 'unsound', errors: [{ category: 'sign', step: '2x=-6', explanation: 'Zmiana znaku bez działania po obu stronach.', skillId: 'eq-linear' }] });
      model = applySolution(model, attempt, { ...testExercise(), skillId });
    }
    expect(model.errors.sign?.occurrences).toBe(2);
    expect(model.skills['eq-linear']?.state.reviewDueAt).not.toBeNull();
  });
  it('a correct answer with faulty reasoning is not independent mastery', () => {
    const attempt = submission(); attempt.analysis = testAnalysis({ reasoning: 'unsound' });
    const model = applySolution(emptyStudent(), attempt, testExercise());
    expect(model.skills['num-order']?.state.level).toBe(0);
    expect(model.skills['num-order']?.state.independentStreak).toBe(0);
  });
  it('decreases difficulty by half a step after a reasoning error', () => {
    const e = { ...emptyEvidence('num-order'), difficulty: 3 };
    expect(adaptDifficulty(e, testAnalysis({ verdict: 'incorrect', points: 0, reasoning: 'unsound' }), 0)).toBe(2.5);
  });
  it('counts chat and full-solution hints as assistance', () => {
    const a = submission(); a.hintsUsed = 6;
    const model = applySolution(emptyStudent(), a, testExercise());
    expect(model.skills['num-order']?.hintAverage).toBe(6);
    expect(model.skills['num-order']?.state.independentStreak).toBe(0);
  });
  it('separates practice in one sitting from a spaced review', () => {
    const day = 86_400_000;
    let model = emptyStudent();
    for (let i = 1; i <= 4; i++) {
      const a = submission(`practice-${i}`); a.receivedAt = 1000 * i;
      model = applySolution(model, a, testExercise());
    }
    expect(model.skills['num-order']?.state.reviewDueAt).toBe(1000 + day);
    expect(model.skills['num-order']?.state.reviewStep).toBe(0);
    const delayed = submission('spaced-review'); delayed.receivedAt = 1001 + day;
    model = applySolution(model, delayed, testExercise());
    expect(model.skills['num-order']?.state.reviewDueAt).toBe(delayed.receivedAt + 7 * day);
    expect(model.skills['num-order']?.state.reviewStep).toBe(1);
  });
  it('averages only tutor observations when legacy course attempts were imported', () => {
    const model = emptyStudent(), old = emptyEvidence('num-order'); old.state.totalAttempts = 100;
    model.skills['num-order'] = old;
    const a = submission(); a.hintsUsed = 2;
    const updated = applySolution(model, a, testExercise()).skills['num-order']!;
    expect(updated.timeAverageMs).toBe(60_000); expect(updated.hintAverage).toBe(2);
    expect(updated.assessedAttempts).toBe(1); expect(updated.state.totalAttempts).toBe(101);
  });
});
describe('exercise and image analysis validation', () => {
  it('renders and verifies fractional, linear, percentage and quadratic variants from the same data', () => {
    expect(verifySpec({ type: 'fraction', a: 1, b: 2, c: 1, d: 3, operation: 'add' }).answer).toBe('5/6');
    expect(verifySpec({ type: 'linear', a: -2, b: 1, c: 4 }).answer).toBe('-3/2');
    expect(verifySpec({ type: 'percent', base: 250, percent: 20 }).answer).toBe('50');
    expect(verifySpec({ type: 'quadratic', root1: 3, root2: 3 }).answer).toBe('3');
    expect(validSpec({ type: 'fraction', a: 1, b: 0, c: 2, d: 3, operation: 'add' })).toBe(false);
    expect(validSpec({ type: 'linear', a: 0, b: 3, c: 6 })).toBe(false);
  });
  it('rejects contradictions, unknown errors and points outside the rubric', () => {
    expect(() => validateAnalysis(testAnalysis({ points: 3 }), 2)).toThrow();
    expect(() => validateAnalysis(testAnalysis({ verdict: 'partial', reasoning: 'partial', points: 0.5 }), 2)).toThrow();
    expect(() => validateAnalysis(testAnalysis({ reasoning: 'unsound' }), 2)).toThrow();
    expect(() => validateAnalysis(testAnalysis({ errors: [{ category: 'formula', step: 'x', explanation: 'x', skillId: 'unknown' }] }), 2)).toThrow();
    expect(validateAnalysis(testAnalysis({ complete: false }), 2)).toMatchObject({ verdict: 'uncertain', points: null, errors: [] });
  });
  it('reports uncertain photographs separately from lost points', () => {
    const a = submission(); a.analysis = testAnalysis({ verdict: 'uncertain', points: null }); a.status = 'clarify';
    const session = { exercises: [testExercise(), testExercise(1)], submissions: [a], startedAt: 0, endedAt: 60_000, deadlineAt: 30_000 } as TutorSession;
    const report = examReport(session, null);
    expect(report).toMatchObject({ earned: 0, possible: 4, ungraded: 1, unanswered: 1, timedOut: true });
    expect(report.lost[0]?.points).toBeNull();
  });
});

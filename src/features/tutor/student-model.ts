import { emptySkillState, type Attempt, type Question } from '../../data/types';
import { applyAttempt } from '../../learning-engine/mastery';
import { scheduleReview } from '../../learning-engine/review';
import { adaptDifficulty } from './difficulty';
import type { StudentModel, Submission, TutorEvidence, TutorExercise } from './types';

export function emptyStudent(): StudentModel {
  return { version: 1, skills: {}, errors: {}, explanationStyle: 'simple', appliedSubmissionIds: [], plan: null, recentExams: [] };
}
export function emptyEvidence(skillId: string): TutorEvidence {
  return { state: emptySkillState(skillId), confidence: 0, reasoningEvidence: 0, assessedAttempts: 0, hintAverage: 0, timeAverageMs: 0,
    difficulty: 1, lastIndependentAt: null, formulas: {} };
}

/** Only reliable process evidence changes mastery. An uncertain photograph has no learning side effects. */
export function applySolution(model: StudentModel, submission: Submission, exercise: TutorExercise): StudentModel {
  const a = submission.analysis;
  if (!a || !a.readable || !a.complete || a.confidence < 0.8 || a.verdict === 'uncertain' || a.reasoning === 'unknown'
    || model.appliedSubmissionIds.includes(submission.id)) return model;
  const next = structuredClone(model);
  const before = next.skills[exercise.skillId] ?? emptyEvidence(exercise.skillId);
  // A correct final answer with invalid reasoning is never independent mastery evidence.
  const correctness = a.verdict === 'correct' && a.reasoning !== 'sound' ? 'partial' : a.verdict;
  const attempt: Attempt = {
    id: submission.id, questionId: exercise.id, skillId: exercise.skillId, missionId: 'tutor',
    startedAt: submission.receivedAt - submission.elapsedMs, answeredAt: submission.receivedAt,
    userAnswer: a.transcription.join('\n'), correctness, confidence: submission.selfConfidence,
    hintLevel: submission.hintsUsed as Attempt['hintLevel'], errorId: a.errors[0]?.category ?? null,
    gradingVersion: 'tutor-process-v1', gradedBy: 'ai',
  };
  const q = { kind: exercise.kind } as Question;
  const changed = applyAttempt(before.state, attempt, q).state;
  const independentSuccess = correctness === 'correct' && submission.hintsUsed === 0;
  if (!independentSuccess || before.state.reviewDueAt === null || before.state.reviewDueAt <= submission.receivedAt) {
    // Several exercises in one sitting are not spaced reviews. Start at one day;
    // advance the existing schedule only when the previous review has become due.
    const reviewState = { ...changed, reviewStep: before.state.reviewDueAt === null ? -1 : before.state.reviewStep };
    Object.assign(changed, scheduleReview(reviewState, independentSuccess, submission.receivedAt));
  }
  const count = before.assessedAttempts ?? 0;
  const assessed = (before.assessedAttempts ?? 0) + 1;
  const formulas = { ...before.formulas };
  for (const formula of a.formulas) {
    const previous = formulas[formula.name] ?? { correct: 0, incorrect: 0 };
    formulas[formula.name] = { correct: previous.correct + Number(formula.usedCorrectly), incorrect: previous.incorrect + Number(!formula.usedCorrectly) };
  }
  next.skills[exercise.skillId] = {
    state: changed, confidence: Math.min(0.98, a.confidence * assessed / (assessed + 3)), assessedAttempts: assessed,
    reasoningEvidence: before.reasoningEvidence + Number(a.reasoning === 'sound'),
    hintAverage: (before.hintAverage * count + submission.hintsUsed) / (count + 1),
    timeAverageMs: (before.timeAverageMs * count + submission.elapsedMs) / (count + 1),
    difficulty: adaptDifficulty(before, a, submission.hintsUsed),
    lastIndependentAt: correctness === 'correct' && submission.hintsUsed === 0 ? submission.receivedAt : before.lastIndependentAt,
    formulas,
  };
  for (const error of a.errors) {
    const previous = next.errors[error.category];
    next.errors[error.category] = {
      category: error.category, occurrences: (previous?.occurrences ?? 0) + 1,
      skillIds: [...new Set([...(previous?.skillIds ?? []), exercise.skillId, error.skillId])],
      lastSeenAt: submission.receivedAt, repairedAt: null, lastExplanation: error.explanation,
    };
    // Cross-topic prerequisite errors affect review need, without inventing mastery evidence for that skill.
    const foundation = next.skills[error.skillId] ?? emptyEvidence(error.skillId);
    next.skills[error.skillId] = { ...foundation, state: { ...foundation.state, reviewDueAt: submission.receivedAt } };
  }
  if (correctness === 'correct' && submission.hintsUsed === 0) {
    for (const memory of Object.values(next.errors)) {
      if (memory && memory.skillIds.includes(exercise.skillId) && changed.independentStreak >= 3) memory.repairedAt = submission.receivedAt;
    }
  }
  next.appliedSubmissionIds.push(submission.id);
  return next;
}

/** Small, bounded context; histories and photographs are retrieved only when needed. */
export function condensedStudent(model: StudentModel, skillId?: string) {
  const ordered = Object.entries(model.skills).sort((a, b) => Number(b[0] === skillId) - Number(a[0] === skillId)
    || (b[1].state.lastAttemptAt ?? 0) - (a[1].state.lastAttemptAt ?? 0));
  return {
    style: model.explanationStyle, plan: model.plan, exams: model.recentExams?.slice(-3) ?? [],
    skills: ordered.slice(0, 16).map(([id, s]) => ({ id, mastery: s.state.level, confidence: s.confidence,
      difficulty: s.difficulty, hints: s.hintAverage, timeMs: s.timeAverageMs, dueAt: s.state.reviewDueAt, formulas: Object.fromEntries(Object.entries(s.formulas).slice(-8)) })),
    errors: Object.values(model.errors).filter(e => e && e.repairedAt === null).slice(0, 10),
  };
}

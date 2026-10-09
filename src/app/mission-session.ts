import type { AnsweredStep, SubjectId } from './useForge';
import type { Confidence, HintLevel, Mission, Question } from '@/data/types';
import type { MissionPlan } from '@/learning-engine/mission';
import type { Selection } from '@/learning-engine/selector';

export const MISSION_SESSION_KEY = 'learning.activeMission.v1';
export interface ArenaDraft {
  questionId: string;
  answer: string;
  confidence: Confidence;
  hintLevel: HintLevel;
  /** Explicitly opened hint cards, independent of assistance from microsteps/AI. */
  visibleHintLevel?: HintLevel;
  guidanceHelpUsed?: boolean;
  workingTex?: string;
  reasoning: string;
}
export interface MissionSession {
  version: 1;
  subject: SubjectId;
  mission: Mission;
  plan: MissionPlan;
  current: Selection;
  steps: AnsweredStep[];
  feedback: AnsweredStep | null;
  draft: ArenaDraft | null;
  diagnosticQueue: Question[];
  recentSkillIds: string[];
  asked: string[];
  startedAt: number;
  deadline: number | null;
}

/** Invalid or obsolete session data must never replace the learned profile. */
export function readMissionSession(raw: string | undefined): MissionSession | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as MissionSession;
    if (s?.version !== 1 || !['math', 'cs', 'biz'].includes(s.subject)
      || typeof s.mission?.id !== 'string' || s.mission.finishedAt !== null
      || typeof s.plan?.questionCount !== 'number' || !s.current?.question?.id
      || !s.current.skill?.id || !Array.isArray(s.steps) || !Array.isArray(s.asked)
      || !Array.isArray(s.diagnosticQueue) || !Array.isArray(s.recentSkillIds)
      || typeof s.startedAt !== 'number') return null;
    const validQuestion = (q: Question | undefined) => Boolean(q && typeof q.id === 'string'
      && typeof q.prompt === 'string' && typeof q.answer === 'string' && Array.isArray(q.hints)
      && Array.isArray(q.commonErrors) && Array.isArray(q.acceptedVariants));
    const validStep = (step: AnsweredStep | null | undefined) => Boolean(step && validQuestion(step.selection?.question)
      && step.selection?.skill?.id && typeof step.userAnswer === 'string' && step.grade
      && ['correct', 'partial', 'incorrect'].includes(step.grade.correctness));
    if (!validQuestion(s.current.question) || !Array.isArray(s.current.reasons)
      || !s.diagnosticQueue.every(validQuestion) || !s.steps.every(validStep)
      || !(s.feedback === null || validStep(s.feedback))
      || (s.feedback && s.feedback.selection.question.id !== s.current.question.id)
      || !s.asked.every(id => typeof id === 'string') || !s.recentSkillIds.every(id => typeof id === 'string')
      || !(s.deadline === null || Number.isFinite(s.deadline))) return null;
    if (s.draft && (s.draft.questionId !== s.current.question.id
      || typeof s.draft.answer !== 'string' || typeof s.draft.reasoning !== 'string'
      || !['guess', 'partial', 'sure'].includes(s.draft.confidence)
      || !Number.isInteger(s.draft.hintLevel) || s.draft.hintLevel < 0 || s.draft.hintLevel > 6)) s.draft = null;
    if (s.draft?.visibleHintLevel !== undefined && (!Number.isInteger(s.draft.visibleHintLevel)
      || s.draft.visibleHintLevel < 0 || s.draft.visibleHintLevel > 6)) delete s.draft.visibleHintLevel;
    if (s.draft?.guidanceHelpUsed !== undefined && typeof s.draft.guidanceHelpUsed !== 'boolean') delete s.draft.guidanceHelpUsed;
    if (s.draft?.workingTex !== undefined && (typeof s.draft.workingTex !== 'string' || s.draft.workingTex.length > 500)) delete s.draft.workingTex;
    return s;
  } catch { return null; }
}

import { MasteryLevel, type Attempt, type SkillState } from '@/data/types';

export interface ScaffoldingStep {
  id: string;
  tags?: readonly string[];
  load?: number;
  complexity?: 'simple' | 'multi';
  stageKind?: string;
}
export interface ScaffoldingEvidence {
  skillId: string;
  state?: SkillState;
  attempts: readonly Attempt[];
  stageAnswers: Readonly<Record<string, string>>;
  completed: readonly string[];
  stepEvidence?: readonly StepEvidence[];
}
export interface StepEvidence { questionId: string; tags: string[]; correct: boolean; assisted: boolean; at: number }
export function readStepEvidence(records: Readonly<Record<string, string>>): StepEvidence[] {
  return Object.values(records).flatMap(raw => {
    try {
      const row = JSON.parse(raw) as StepEvidence;
      return typeof row.questionId === 'string' && Array.isArray(row.tags) && row.tags.every(tag => typeof tag === 'string')
        && typeof row.correct === 'boolean' && typeof row.assisted === 'boolean' && Number.isFinite(row.at) ? [row] : [];
    } catch { return []; }
  });
}

/** Only independently demonstrated competence can shorten routine arithmetic.
 * Guided stage successes alone never establish independent mastery. */
export function scaffoldingOmissions(steps: readonly ScaffoldingStep[], evidence: ScaffoldingEvidence): string[] {
  if (evidence.stageAnswers.__error === 'true' || evidence.completed.length > 0
    || Object.keys(evidence.stageAnswers).some(key => !key.startsWith('__'))) return [];
  const state = evidence.state;
  const recent = evidence.attempts.filter(a => a.skillId === evidence.skillId)
    .sort((a, b) => b.answeredAt - a.answeredAt).slice(0, 3);
  const independent = state?.skillId === evidence.skillId && state.level >= MasteryLevel.Independent
    && state.independentStreak >= 3 && recent.length >= 3
    && new Set(recent.map(a => a.questionId)).size >= 2
    && recent.every(a => a.correctness === 'correct' && a.hintLevel === 0);
  if (recent[0]?.correctness === 'incorrect') return [];
  const trustedTag = (tag: string) => {
    const rows = (evidence.stepEvidence ?? []).filter(row => row.tags.includes(tag)).sort((a,b) => b.at-a.at).slice(0,3);
    return rows.length === 3 && rows.every(row => row.correct && !row.assisted)
      && new Set(rows.map(row => row.questionId)).size >= 2;
  };
  return steps.filter(step => {
    const tags = step.tags ?? [];
    const elementary = tags.filter(tag => tag.startsWith('simple-') || ['arithmetic','power','routine'].includes(tag));
    const specific = elementary.filter(tag => tag.startsWith('simple-'));
    const tested = specific.length ? specific : elementary.filter(tag => tag !== 'routine');
    return step.complexity === 'simple' && step.stageKind === 'arithmetic' && step.load !== undefined && step.load <= 1
      && elementary.length > 0 && !tags.some(tag => /equation|discriminant|delta|zero|root|strategy/.test(tag))
      && (independent || (tested.length > 0 && tested.every(trustedTag)));
  }).map(step => step.id);
}

import type { SolutionAnalysis, TutorEvidence } from './types';

export function adaptDifficulty(before: TutorEvidence, analysis: SolutionAnalysis, hints: number): number {
  if (analysis.verdict === 'uncertain' || !analysis.readable || !analysis.complete || analysis.confidence < 0.8) return before.difficulty;
  if (analysis.reasoning === 'unsound' || analysis.verdict === 'incorrect') return Math.max(1, before.difficulty - 0.5);
  if (hints === 0 && analysis.verdict === 'correct' && analysis.reasoning === 'sound' && before.state.independentStreak >= 2) {
    return Math.min(7, before.difficulty + 0.5);
  }
  return before.difficulty;
}

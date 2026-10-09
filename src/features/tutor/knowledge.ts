import type { Skill, Topic } from '../../data/types';
import type { StudentModel, TutorEvidence } from './types';

export function knowledgeStatus(e: TutorEvidence | undefined, now: number): string {
  if (!e || e.state.totalAttempts === 0) return 'Nie rozpoczęto';
  if (e.state.reviewDueAt !== null && e.state.reviewDueAt <= now) return 'Wymaga powtórki';
  if (e.state.level >= 5 && e.confidence >= 0.8) return 'Opanowane';
  if (e.state.level >= 3) return 'Rozumiem';
  return 'Uczę się';
}
export function knowledgeTree(topics: Topic[], skills: Skill[], student: StudentModel, now: number) {
  return topics.map(topic => ({ ...topic, skills: skills.filter(s => s.topicId === topic.id).map(s => ({ ...s,
    status: knowledgeStatus(student.skills[s.id], now), evidence: student.skills[s.id] })) }));
}
/** Retention is an explicit heuristic, separate from mastery and assessment confidence. */
export function retention(e: TutorEvidence, now: number): number {
  if (e.state.lastAttemptAt === null) return 0;
  const interval = (e.state.reviewDueAt ?? now + 86_400_000) - e.state.lastAttemptAt;
  return Math.exp(-Math.max(0, now - e.state.lastAttemptAt) / Math.max(86_400_000, interval));
}

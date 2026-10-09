import { describe, expect, it } from 'vitest';
import { allowedSkills, candidates, curriculum } from '../../../server/tutor/catalogue';
import { emptyEvidence, emptyStudent } from './student-model';

describe('adaptive exercise selection', () => {
  it('starts with one easy foundation and never bypasses an unmet prerequisite', () => {
    const model = emptyStudent();
    expect(allowedSkills(model, 'learn').map(s => s.id)).toEqual(['num-order']);
    expect(candidates(model, 'learn', []).every(q => q.skillId === 'num-order' && q.difficulty <= 1)).toBe(true);
    const foundation = allowedSkills(model, 'learn', 'eq-linear');
    expect(foundation).toHaveLength(1);
    expect(foundation[0]?.prerequisites.every(id => (model.skills[id]?.state.level ?? 0) >= 2)).toBe(true);
  });
  it('keeps the same permitted skills when all bank variants have already been used', () => {
    const model = emptyStudent(), used = curriculum.questions.map(q => q.id);
    expect(candidates(model, 'learn', used)).toEqual([]);
    expect(allowedSkills(model, 'learn').map(s => s.id)).toEqual(['num-order']);
  });
  it('prioritizes an eligible exam repair in the next learning plan', () => {
    const model = emptyStudent();
    for (const s of curriculum.skills) {
      const e = emptyEvidence(s.id); e.state.level = 2; model.skills[s.id] = e;
    }
    const target = curriculum.skills.find(s => !s.extra && s.topicId === curriculum.topics.at(-1)?.id)!;
    model.plan = { now: 'Naprawiamy lukę.', skillId: target.id, reason: 'Punkty utracone w arkuszu.', next: [], updatedAt: Date.now() };
    model.recentExams = [{ sessionId: 'exam-1', level: 'PP', earned: 20, possible: 40, ungraded: 0, repairSkillIds: [target.id], takenAt: Date.now() }];
    expect(allowedSkills(model, 'repair')[0]?.id).toBe(target.id);
  });
  it('reviews previously observed skills rather than adding unrelated new material', () => {
    const model = emptyStudent(), e = emptyEvidence('num-order'); e.state.level = 3; model.skills[e.state.skillId] = e;
    expect(allowedSkills(model, 'review').map(s => s.id)).toEqual(['num-order']);
  });
});

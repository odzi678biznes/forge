import { MATH_CORPUS } from '../../content/math/index';
import { VERIFIERS } from '../../content/authoring';
import type { Question, Skill } from '../../src/data/types';
import type { StudentModel, TutorExercise, TutorMode } from '../../src/features/tutor/types';

export const curriculum = MATH_CORPUS;
export function fromCatalogue(q: Question, rationale: string): TutorExercise {
  const verify = VERIFIERS.get(q.id);
  if (verify && q.format === 'numeric' && Math.abs(Number(verify()) - Number(q.answer)) > (q.tolerance ?? 1e-8)) {
    throw new Error('Zadanie nie przeszło niezależnej weryfikacji wyniku.');
  }
  return { id: crypto.randomUUID(), subjectId: 'math', sourceId: q.id, skillId: q.skillId, prompt: q.prompt, choices: q.choices ?? [],
    figure: q.figure ?? null, listing: q.listing ?? null, answer: q.answer, solution: q.solution, steps: q.steps ?? [q.solution],
    kind: q.kind, difficulty: q.difficulty, maxPoints: q.kind === 'transfer' ? 3 : 2, rationale,
    validation: verify && q.format === 'numeric' ? 'program' : 'catalogue' };
}
export function allowedSkills(student: StudentModel, mode: TutorMode, focus?: string): Skill[] {
  const now = Date.now();
  const errors = new Set(Object.values(student.errors).flatMap(e => e?.repairedAt === null ? e.skillIds : []));
  let skills = curriculum.skills.filter(s => !s.extra);
  if (!focus && (student.skills['num-order']?.state.level ?? 0) < 2) skills = skills.filter(s => s.id === 'num-order');
  if (focus) {
    const visited = new Set<string>();
    while (!visited.has(focus)) {
      visited.add(focus);
      const skill = curriculum.skills.find(s => s.id === focus);
      const prerequisite = skill?.prerequisites.find(id => (student.skills[id]?.state.level ?? 0) < 2);
      if (!prerequisite) break;
      focus = prerequisite;
    }
    skills = skills.filter(s => s.id === focus);
  } else skills = skills.filter(s => s.prerequisites.every(id => (student.skills[id]?.state.level ?? 0) >= 2));
  if (mode === 'review' && !focus) {
    const known = skills.filter(s => student.skills[s.id]);
    if (known.length) skills = known;
  }
  const examRepairs = new Set(student.recentExams?.at(-1)?.repairSkillIds ?? []);
  const score = (s: Skill) => {
    const e = student.skills[s.id];
    const prerequisitesReady = s.prerequisites.every(id => (student.skills[id]?.state.level ?? 0) >= 2);
    return (prerequisitesReady ? 20 : -20) + s.examValue - curriculum.topics.findIndex(t => t.id === s.topicId) * 2
      + (mode === 'repair' && errors.has(s.id) ? 40 : 0)
      + (student.plan?.skillId === s.id ? 30 : 0)
      + (examRepairs.has(s.id) ? 20 : 0)
      + (e?.state.reviewDueAt && e.state.reviewDueAt <= now ? 35 : 0)
      - (e?.state.level ?? 0) * 2;
  };
  skills.sort((a, b) => score(b) - score(a));
  return skills.slice(0, 8);
}
export function candidates(student: StudentModel, mode: TutorMode, used: string[], focus?: string): Question[] {
  return allowedSkills(student, mode, focus).flatMap(s => {
    const target = student.skills[s.id]?.difficulty ?? 1;
    return curriculum.questions.filter(q => q.skillId === s.id && q.format !== 'code' && !used.includes(q.id)
      && q.difficulty <= Math.ceil(target) && (mode !== 'quiz' || q.kind !== 'transfer'))
      .sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target)).slice(0, 3);
  });
}

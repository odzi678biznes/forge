import Anthropic from '@anthropic-ai/sdk';
import { MODEL } from '../nauczyciel';
import { condensedStudent } from '../../src/features/tutor/student-model';
import { ERROR_CATEGORIES, type MiniLesson, type SolutionAnalysis, type StudentModel, type TutorExercise, type TutorImage, type TutorMode, type TutorSession } from '../../src/features/tutor/types';
import { validSpec, verifySpec } from '../../src/features/tutor/exercise-validator';
import { allowedSkills, candidates, curriculum, fromCatalogue } from './catalogue';
import * as prompts from './prompts';

type Schema = Record<string, unknown>;
const string: Schema = { type: 'string' };
const number: Schema = { type: 'number' };
const boolean: Schema = { type: 'boolean' };
const array = (items: Schema): Schema => ({ type: 'array', items });
const object = (properties: Record<string, Schema>): Schema => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const nullable = (schema: Schema): Schema => ({ anyOf: [schema, { type: 'null' }] });
const enumeration = (values: string[]): Schema => ({ type: 'string', enum: values });
const programSchema: Schema = { anyOf: [
  object({ type: { const: 'fraction', type: 'string' }, a: number, b: number, c: number, d: number, operation: enumeration(['add', 'multiply']) }),
  object({ type: { const: 'linear', type: 'string' }, a: number, b: number, c: number }),
  object({ type: { const: 'percent', type: 'string' }, base: number, percent: number }),
  object({ type: { const: 'quadratic', type: 'string' }, root1: number, root2: number }),
] };
const generationSchema = object({ candidateId: nullable(string), program: nullable(programSchema), skillId: string, rationale: string, introduction: string, phases: array(string),
  custom: nullable(object({ prompt: string, answer: string, solution: string, steps: array(string), difficulty: number })) });
const analysisSchema = object({ readable: boolean, complete: boolean, confidence: number, clarification: string, transcription: array(string),
  verdict: enumeration(['correct', 'partial', 'incorrect', 'uncertain']), points: nullable(number), reasoning: enumeration(['sound', 'partial', 'unsound', 'unknown']),
  goodSteps: array(string), errors: array(object({ category: enumeration([...ERROR_CATEGORIES]), step: string, explanation: string, skillId: string })),
  feedback: string, nextStep: string, learned: string, formulas: array(object({ name: string, usedCorrectly: boolean })) });
const helpSchema = object({ text: string, revealsAnswer: boolean, helpLevel: number });
const text = (v: unknown): v is string => typeof v === 'string' && v.length <= 12_000;
const texts = (v: unknown): v is string[] => Array.isArray(v) && v.length <= 40 && v.every(text);
const skillExists = (id: string) => curriculum.skills.some(s => s.id === id && !s.extra);

/** Strict JSON outputs plus domain validation. No demo response ever enters this engine. */
async function ask(system: string, input: unknown, schema: Schema, images: TutorImage[] = []): Promise<unknown> {
  const client = new Anthropic({ timeout: 42_000, maxRetries: 0 });
  const content: Anthropic.MessageParam['content'] = [
    ...images.map(i => ({ type: 'image' as const, source: { type: 'base64' as const, media_type: i.mime, data: i.data } })),
    { type: 'text', text: JSON.stringify(input) },
  ];
  const response = await client.messages.create({ model: process.env.FORGE_TUTOR_MODEL || MODEL, max_tokens: 6000,
    system, messages: [{ role: 'user', content }], output_config: { format: { type: 'json_schema', schema } } });
  if (response.stop_reason !== 'end_turn') throw new Error('Claude nie zakończył pełnej odpowiedzi. Spróbuj ponownie.');
  const result = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
  try { return JSON.parse(result) as unknown; } catch { throw new Error('Claude zwrócił nieprawidłowy format odpowiedzi.'); }
}
function invalid(): never { throw new Error('Odpowiedź Claude nie przeszła walidacji. Spróbuj ponownie.'); }

export interface TutorProvider {
  sheet(student: StudentModel, mode: 'exam' | 'quiz', level: 'PP' | 'PR'): Promise<{ exercises: TutorExercise[]; introduction: string }>;
  generate(student: StudentModel, mode: TutorMode, used: string[], focus?: string, recent?: Pick<TutorExercise, 'skillId' | 'prompt'>[]): Promise<{ exercise: TutorExercise; introduction: string; phases: string[] }>;
  analyze(exercise: TutorExercise, images: TutorImage[], student: StudentModel): Promise<SolutionAnalysis>;
  help(exercise: TutorExercise, session: TutorSession, student: StudentModel, level: number, message?: string): Promise<{ text: string; helpLevel: number }>;
  lesson(exercise: TutorExercise, analysis: SolutionAnalysis, student: StudentModel): Promise<MiniLesson>;
  plan(student: StudentModel, session: TutorSession): Promise<{ plan: NonNullable<StudentModel['plan']>; summary: NonNullable<TutorSession['summary']> }>;
}

export const claudeProvider: TutorProvider = {
  async sheet(student, mode, level) {
    const pool = mode === 'quiz' ? candidates(student, mode, []) : curriculum.skills.filter(s => !s.extra && (level === 'PR' || s.level === 'PP'))
      .flatMap(s => curriculum.questions.filter(q => q.skillId === s.id && q.format !== 'code' && q.difficulty >= (level === 'PR' ? 3 : 2)).slice(0, 2));
    const count = mode === 'quiz' ? Math.min(5, pool.length) : 30;
    if (pool.length < count) throw new Error('Za mało zadań do przygotowania arkusza.');
    const raw = await ask(`${prompts.TEACHER}\nUłóż ${mode === 'exam' ? 'pełny arkusz treningowy FORGE, obejmujący różne działy matematyki' : 'krótką kartkówkę z aktualnie ćwiczonego materiału'}. Wybierz dokładnie ${count} różnych candidateIds. Korzystaj z profilu ucznia, ale w egzaminie zapewnij przekrój materiału. To arkusz autorski, nie oficjalny arkusz CKE.`,
      { student: condensedStudent(student), mode, level, candidates: pool.map(q => ({ id: q.id, skillId: q.skillId, difficulty: q.difficulty, prompt: q.prompt })) },
      object({ candidateIds: array(string), introduction: string })) as { candidateIds?: unknown; introduction?: unknown };
    if (!texts(raw?.candidateIds) || raw.candidateIds.length !== count || new Set(raw.candidateIds).size !== count || !text(raw.introduction)) invalid();
    const exercises = raw.candidateIds.map(id => { const q = pool.find(q => q.id === id); if (!q) invalid(); return fromCatalogue(q, 'Zadanie w indywidualnym arkuszu treningowym.'); });
    if (mode === 'exam' && new Set(exercises.map(e => curriculum.skills.find(s => s.id === e.skillId)?.topicId)).size < 5) invalid();
    return { exercises, introduction: raw.introduction };
  },
  async generate(student, mode, used, focus, recent = []) {
    const pool = candidates(student, mode, used, focus);
    const allowed = allowedSkills(student, mode, focus);
    const targetDifficulty = Math.max(1, ...allowed.map(s => student.skills[s.id]?.difficulty ?? 1));
    const raw = await ask(prompts.GENERATE, { student: condensedStudent(student, focus), mode, targetDifficulty, focus,
      candidates: pool.map(q => ({ id: q.id, skillId: q.skillId, prompt: q.prompt, difficulty: q.difficulty })),
      recent: recent.slice(-12).map(e => ({ skillId: e.skillId, prompt: e.prompt.slice(0, 700) })),
      skills: allowed.map(s => ({ id: s.id, name: s.name, prerequisites: s.prerequisites })),
    }, generationSchema) as Record<string, unknown>;
    if (!raw || !text(raw.skillId) || !skillExists(raw.skillId) || !text(raw.rationale) || !text(raw.introduction) || !texts(raw.phases)
      || [raw.candidateId, raw.program, raw.custom].filter(x => x !== null && x !== undefined).length !== 1) invalid();
    if (!allowed.some(s => s.id === raw.skillId)) invalid();
    const target = student.skills[raw.skillId]?.difficulty ?? 1;
    let exercise: TutorExercise;
    if (raw.candidateId !== null) {
      const q = pool.find(q => q.id === raw.candidateId && q.skillId === raw.skillId);
      if (!q) invalid();
      exercise = fromCatalogue(q, raw.rationale);
    } else if (raw.program !== null) {
      if (!validSpec(raw.program)) invalid();
      const mapping: Record<string, string[]> = { fraction: ['num-order'], linear: ['eq-linear'], percent: ['num-percent'], quadratic: ['quad-discriminant'] };
      if (!mapping[raw.program.type]?.includes(raw.skillId)) invalid();
      if (target <= 1 && Object.values(raw.program).some(v => typeof v === 'number' && Math.abs(v) > 12)) invalid();
      const verified = verifySpec(raw.program);
      if (verified.difficulty > Math.ceil(target)) invalid();
      exercise = { id: crypto.randomUUID(), subjectId: 'math', sourceId: null, skillId: raw.skillId, ...verified, choices: [], figure: null,
        listing: null, steps: [verified.solution], kind: verified.difficulty === 1 ? 'foundation' : 'typical', maxPoints: 2,
        rationale: raw.rationale, validation: 'program' };
    } else {
      const c = raw.custom as Record<string, unknown> | null;
      if (!c || !text(c.prompt) || !c.prompt.trim() || !text(c.answer) || !c.answer.trim() || !text(c.solution) || !texts(c.steps)
        || !c.steps.length || typeof c.difficulty !== 'number' || !Number.isInteger(c.difficulty) || c.difficulty < 1 || c.difficulty > Math.ceil(target)) invalid();
      const checked = await ask(prompts.VALIDATE, c, object({ approved: boolean, reason: string })) as { approved?: unknown };
      if (checked?.approved !== true) throw new Error('Nowe zadanie nie przeszło niezależnej walidacji. Spróbuj ponownie.');
      exercise = { id: crypto.randomUUID(), subjectId: 'math', sourceId: null, skillId: raw.skillId, prompt: c.prompt, answer: c.answer,
        solution: c.solution, steps: c.steps, difficulty: c.difficulty, choices: [], figure: null, listing: null,
        kind: c.difficulty <= 2 ? 'foundation' : 'typical', maxPoints: 2, rationale: raw.rationale, validation: 'independent-ai' };
    }
    return { exercise, introduction: raw.introduction, phases: raw.phases.slice(0, 8) };
  },
  async analyze(exercise, images, student) {
    const raw = await ask(prompts.ANALYZE, { exercise, student: condensedStudent(student, exercise.skillId),
      skills: curriculum.skills.map(s => ({ id: s.id, name: s.name })) }, analysisSchema, images);
    return validateAnalysis(raw, exercise.maxPoints);
  },
  async help(exercise, session, student, level, message) {
    const raw = await ask(message ? prompts.CHAT : prompts.HINT, { exercise, level, student: condensedStudent(student, exercise.skillId), message,
      hints: session.hints[exercise.id] ?? [], analysis: session.submissions.filter(s => s.exerciseId === exercise.id).at(-1)?.analysis ?? null,
      history: session.messages.filter(m => m.exerciseId === exercise.id).slice(-12).map(m => ({ role: m.role, text: m.text.slice(0, 2000) })),
    }, helpSchema) as Record<string, unknown>;
    if (!raw || !text(raw.text) || !raw.text.trim() || typeof raw.revealsAnswer !== 'boolean' || typeof raw.helpLevel !== 'number'
      || !Number.isInteger(raw.helpLevel) || raw.helpLevel < 1 || raw.helpLevel > 6) invalid();
    if (raw.revealsAnswer && level < 5 || raw.helpLevel === 6 && level < 5) throw new Error('Odpowiedź ujawniała rozwiązanie zbyt wcześnie. Poproś o mniejszą wskazówkę.');
    return { text: raw.text, helpLevel: raw.helpLevel };
  },
  async lesson(exercise, analysis, student) {
    const raw = await ask(prompts.LESSON, { exercise, analysis, student: condensedStudent(student, exercise.skillId),
      skills: curriculum.skills.map(s => ({ id: s.id, name: s.name })) }, object({ skillId: string, title: string, steps: array(object({ title: string, text: string })) })) as MiniLesson;
    if (!raw || !skillExists(raw.skillId) || !text(raw.title) || !Array.isArray(raw.steps) || raw.steps.length !== 6
      || !raw.steps.every(s => s && text(s.title) && text(s.text))) invalid();
    return { ...raw, step: 0, checked: false };
  },
  async plan(student, session) {
    const summarySchema = object({ learned: array(string), progress: string, improve: string, next: string });
    const raw = await ask(prompts.PLAN, { student: condensedStudent(student), report: session.report,
      session: { mode: session.mode, submissions: session.submissions.slice(-30).map(s => ({ analysis: s.analysis, hints: s.hintsUsed, timeMs: s.elapsedMs })) },
      skills: curriculum.skills.map(s => ({ id: s.id, name: s.name })) }, object({ now: string, skillId: string, reason: string, next: array(string), summary: summarySchema })) as Record<string, unknown>;
    const s = raw?.summary as Record<string, unknown> | null;
    if (!raw || !text(raw.now) || !text(raw.skillId) || !skillExists(raw.skillId) || !text(raw.reason) || !texts(raw.next)
      || !s || !texts(s.learned) || !text(s.progress) || !text(s.improve) || !text(s.next)) invalid();
    return { plan: { now: raw.now, skillId: raw.skillId, reason: raw.reason, next: raw.next.slice(0, 3), updatedAt: Date.now() },
      summary: { learned: s.learned.slice(0, 3), progress: s.progress, improve: s.improve, next: s.next } };
  },
};

export function validateAnalysis(raw: unknown, maxPoints: number): SolutionAnalysis {
  const a = raw as SolutionAnalysis | null;
  if (!a || typeof a.readable !== 'boolean' || typeof a.complete !== 'boolean' || typeof a.confidence !== 'number' || !Number.isFinite(a.confidence)
    || a.confidence < 0 || a.confidence > 1 || !text(a.clarification) || !texts(a.transcription) || !texts(a.goodSteps)
    || !['correct', 'partial', 'incorrect', 'uncertain'].includes(a.verdict) || !['sound', 'partial', 'unsound', 'unknown'].includes(a.reasoning)
    || !text(a.feedback) || !text(a.nextStep) || !text(a.learned) || !Array.isArray(a.errors) || a.errors.length > 20
    || !a.errors.every(e => e && ERROR_CATEGORIES.includes(e.category) && text(e.step) && text(e.explanation) && skillExists(e.skillId))
    || !Array.isArray(a.formulas) || a.formulas.length > 20 || !a.formulas.every(f => f && text(f.name) && typeof f.usedCorrectly === 'boolean')) invalid();
  if (!a.readable || !a.complete || a.confidence < 0.8 || a.verdict === 'uncertain' || a.reasoning === 'unknown') {
    return { ...a, verdict: 'uncertain', points: null, reasoning: 'unknown', errors: [], learned: '', formulas: [],
      clarification: a.clarification || 'Prześlij wyraźne zdjęcie całej kartki. Nie mogę pewnie odczytać wszystkich kroków.' };
  }
  if (typeof a.points !== 'number' || !Number.isInteger(a.points) || a.points < 0 || a.points > maxPoints
    || a.verdict === 'correct' && (a.reasoning !== 'sound' || a.points !== maxPoints || a.errors.length > 0)
    || a.verdict === 'partial' && (a.points <= 0 || a.points >= maxPoints)
    || a.verdict === 'incorrect' && a.points !== 0) invalid();
  return a;
}

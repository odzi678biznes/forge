import type { ExamResult, Skill, Topic } from '@/data/types';
import type { ExamSheet } from '@content/exams/types';
import { REQUIREMENTS_2024, skillsForCode } from '@content/math/requirements';
import { analyzeExam, type ExamAnalysis, type TaskInput } from '@/learning-engine/exam-analysis';

/**
 * Zadania arkusza z umiejętnościami kursu, które do nich przygotowują.
 * Informatyka ma umiejętności wpisane wprost (z generatora katalogu),
 * matematyka — wyznaczane z kodów wymagań podstawy programowej.
 */
export function tasksWithSkills(exam: ExamSheet): TaskInput[] {
  return exam.tasks.map((t) => ({
    no: t.no,
    points: t.points,
    skills: t.skills ?? [...new Set(t.codes.flatMap((c) => skillsForCode(c, exam.era)))],
  }));
}

export function analyze(exam: ExamSheet, scores: Record<string, number>): ExamAnalysis {
  return analyzeExam(tasksWithSkills(exam), scores);
}

const REQ_TEXT = new Map(REQUIREMENTS_2024.map((r) => [r.code, r.text]));

/**
 * Opis wymagania do podpowiedzi przy zadaniu. Dla arkuszy według starszej
 * podstawy (do maja 2024) numeracja bywała inna, więc tam opisu nie podajemy -
 * lepiej brak opisu niż opis nie tego wymagania.
 */
export function requirementText(code: string, exam: ExamSheet): string | null {
  // Opisy wymagań mamy tylko dla matematyki.
  if ((exam.subjectId ?? 'math') !== 'math') return null;
  return exam.era === 2024 ? (REQ_TEXT.get(code) ?? null) : null;
}

export interface TopicScore {
  topic: Topic;
  earned: number;
  max: number;
}

/**
 * Wynik w podziale na działy kursu. Zadanie liczy się raz na dział, nawet
 * gdy prowadzi do kilku umiejętności tego samego działu.
 */
export function scoresByTopic(
  exam: ExamSheet,
  scores: Record<string, number>,
  skills: Skill[],
  topics: Topic[],
): TopicScore[] {
  const topicOf = new Map(skills.map((s) => [s.id, s.topicId]));
  const acc = new Map<string, { earned: number; max: number }>();
  for (const task of tasksWithSkills(exam)) {
    const got = Math.min(task.points, Math.max(0, scores[task.no] ?? 0));
    for (const topicId of new Set(task.skills.map((s) => topicOf.get(s)).filter((x): x is string => !!x))) {
      const a = acc.get(topicId) ?? { earned: 0, max: 0 };
      a.earned += got;
      a.max += task.points;
      acc.set(topicId, a);
    }
  }
  return topics
    .filter((t) => acc.has(t.id))
    .map((t) => ({ topic: t, ...acc.get(t.id)! }));
}

/** Najnowszy wynik danego arkusza albo null. */
export function lastResult(results: ExamResult[], examId: string): ExamResult | null {
  const own = results.filter((r) => r.examId === examId);
  return own.length === 0 ? null : own.reduce((a, b) => (b.takenAt > a.takenAt ? b : a));
}

export function totalOf(exam: ExamSheet, result: ExamResult): number {
  return exam.tasks.reduce((sum, t) => sum + Math.min(t.points, Math.max(0, result.scores[t.no] ?? 0)), 0);
}

export function percent(value: number, max: number): number {
  return max === 0 ? 0 : Math.round((value / max) * 100);
}

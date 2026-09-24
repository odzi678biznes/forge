import { MasteryLevel, type SkillState } from '@/data/types';

/**
 * Analiza wyniku oficjalnego arkusza CKE.
 *
 * Uczeń wpisuje punkty za zadania (sprawdzone z zasadami oceniania CKE).
 * Każde zadanie sprawdza wymagania, a te prowadzą do umiejętności kursu -
 * stąd widać, na których umiejętnościach uciekły punkty.
 *
 * Zadanie liczy się w całości dla każdej swojej umiejętności: zadanie za 5
 * punktów z wektorów i prostej prostopadłej, rozwiązane na 2, obciąża obie.
 * Dzielenie punktów między umiejętności udawałoby precyzję, której nie ma.
 */

export interface TaskInput {
  no: string;
  points: number;
  /** Umiejętności kursu, które przygotowują do tego zadania. */
  skills: string[];
}

export interface SkillResult {
  skillId: string;
  earned: number;
  max: number;
  /** 0..1 */
  ratio: number;
  /** Punkty stracone na zadaniach tej umiejętności. */
  lost: number;
  tasks: string[];
}

export interface ExamAnalysis {
  earned: number;
  max: number;
  /** 0..1 */
  ratio: number;
  /** Ile zadań nie ma jeszcze wpisanego wyniku. */
  unscored: number;
  bySkill: SkillResult[];
  /** Umiejętności do powtórki - od największej straty punktów. */
  weak: string[];
}

/** Poniżej tego udziału punktów umiejętność trafia do powtórki. */
export const WEAK_RATIO = 0.6;

/** Punkty za zadanie w granicach 0..max - literówka nie może zawyżyć wyniku. */
export function clampScore(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value)));
}

export function analyzeExam(tasks: TaskInput[], scores: Record<string, number>): ExamAnalysis {
  let earned = 0;
  let max = 0;
  let unscored = 0;
  const bySkill = new Map<string, SkillResult>();

  for (const task of tasks) {
    const raw = scores[task.no];
    if (raw === undefined) unscored += 1;
    const got = raw === undefined ? 0 : clampScore(raw, task.points);
    earned += got;
    max += task.points;
    for (const skillId of new Set(task.skills)) {
      const r = bySkill.get(skillId) ?? { skillId, earned: 0, max: 0, ratio: 0, lost: 0, tasks: [] };
      r.earned += got;
      r.max += task.points;
      r.tasks.push(task.no);
      bySkill.set(skillId, r);
    }
  }

  const skills = [...bySkill.values()].map((r) => ({
    ...r,
    ratio: r.max === 0 ? 0 : r.earned / r.max,
    lost: r.max - r.earned,
  }));

  const weak = skills
    .filter((r) => r.ratio < WEAK_RATIO)
    .sort((a, b) => b.lost - a.lost || a.ratio - b.ratio)
    .map((r) => r.skillId);

  return { earned, max, ratio: max === 0 ? 0 : earned / max, unscored, bySkill: skills, weak };
}

/**
 * Słaby wynik na arkuszu ustawia powtórkę umiejętności na teraz.
 *
 * Poziomu nie obniżamy: zadanie z arkusza łączy kilka umiejętności i nie
 * wiadomo, która zawiodła. Powtórka od razu to uczciwa reakcja - jeśli
 * umiejętność siedzi, powtórka przejdzie szybko; jeśli nie, silnik to wykryje.
 * Umiejętności bez stanu (jeszcze nieruszone) prowadzi kurs, nie powtórki.
 */
export function scheduleExamReviews(
  states: Map<string, SkillState>,
  weakSkillIds: string[],
  now: number,
): SkillState[] {
  const updated: SkillState[] = [];
  for (const id of weakSkillIds) {
    const s = states.get(id);
    if (!s || s.level === MasteryLevel.Unknown) continue;
    if (s.reviewDueAt !== null && s.reviewDueAt <= now) continue;
    updated.push({ ...s, reviewDueAt: now });
  }
  return updated;
}

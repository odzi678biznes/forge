import {
  MasteryLevel,
  type ExamLevel,
  type Skill,
  type SkillState,
  type Topic,
} from '@/data/types';

/**
 * Postęp w kursie.
 *
 * "Przerobione" znaczy tu jedno: umiejętność doszła do poziomu Samodzielne,
 * czyli typowe zadanie zostało rozwiązane bez pomocy dwa razy z rzędu. Samo
 * przeczytanie lekcji albo zadanie zrobione z podpowiedzią nie przesuwa kursu
 * do przodu - kurs liczy dowody, nie kliknięcia (sek. 1).
 */

export const COVERED_LEVEL = MasteryLevel.Independent;

export type SkillStatus =
  /** Jeszcze nie ruszona. */
  | 'new'
  /** Lekcja za tobą, ćwiczenia jeszcze nie doprowadziły do samodzielności. */
  | 'learning'
  /** Samodzielnie albo transfer - przerobiona. */
  | 'covered'
  /** Utrwalona po odroczeniu - najwyższy poziom. */
  | 'retained';

export const STATUS_LABELS: Record<SkillStatus, string> = {
  new: 'Do zrobienia',
  learning: 'W trakcie',
  covered: 'Przerobione',
  retained: 'Utrwalone',
};

export function examLevelOf(skill: Skill): ExamLevel {
  return skill.level ?? 'PR';
}

export function skillStatus(
  state: SkillState | undefined,
  lessonDone: boolean,
): SkillStatus {
  const level = state?.level ?? MasteryLevel.Unknown;
  if (level >= MasteryLevel.Retained) return 'retained';
  if (level >= COVERED_LEVEL) return 'covered';
  if (lessonDone || level > MasteryLevel.Unknown || (state?.totalAttempts ?? 0) > 0) {
    return 'learning';
  }
  return 'new';
}

export const isCovered = (state: SkillState | undefined): boolean =>
  (state?.level ?? MasteryLevel.Unknown) >= COVERED_LEVEL;

/** Umiejętności sprawdzane na egzaminie - bez materiału dodatkowego. */
export const examScope = (skills: Skill[]): Skill[] => skills.filter((s) => !s.extra);

/**
 * Umiejętności w kolejności kursu: działy po kolei, w dziale - po kolei.
 * Materiał dodatkowy nie wchodzi do planu.
 */
export function courseOrder(topics: Topic[], skills: Skill[]): Skill[] {
  const scope = examScope(skills);
  return topics.flatMap((t) => scope.filter((s) => s.topicId === t.id));
}

/**
 * Następna lekcja: pierwsza w kolejności kursu, która nie jest przerobiona.
 *
 * Kolejność kursu, a nie priorytet: kurs "od zera" ma iść po kolei, bo każdy
 * dział korzysta z poprzednich. Priorytet decyduje o powtórkach, nie o tym,
 * co nowego wchodzi.
 */
export function nextLessonSkill(
  ordered: Skill[],
  states: Map<string, SkillState>,
): Skill | null {
  return ordered.find((s) => !isCovered(states.get(s.id))) ?? null;
}

export interface TopicProgress {
  topic: Topic;
  total: number;
  covered: number;
  learning: number;
  /** 0..1 - udział przerobionych. */
  ratio: number;
  levels: Record<ExamLevel, { total: number; covered: number }>;
}

export function topicProgress(
  topic: Topic,
  skills: Skill[],
  states: Map<string, SkillState>,
  lessonsDone: Set<string>,
): TopicProgress {
  const own = examScope(skills).filter((s) => s.topicId === topic.id);
  const levels: TopicProgress['levels'] = {
    PP: { total: 0, covered: 0 },
    PR: { total: 0, covered: 0 },
  };
  let covered = 0;
  let learning = 0;
  for (const s of own) {
    const status = skillStatus(states.get(s.id), lessonsDone.has(s.id));
    const bucket = levels[examLevelOf(s)];
    bucket.total += 1;
    if (status === 'covered' || status === 'retained') {
      covered += 1;
      bucket.covered += 1;
    } else if (status === 'learning') {
      learning += 1;
    }
  }
  return {
    topic,
    total: own.length,
    covered,
    learning,
    ratio: own.length === 0 ? 0 : covered / own.length,
    levels,
  };
}

/**
 * Szacowany udział punktów, które umiejętność daje na egzaminie, w zależności
 * od poziomu. To jawna heurystyka: "rozpoznaję" to nie punkty na maturze,
 * "samodzielnie" to prawie pełne punkty za typowe zadanie.
 */
const LEVEL_YIELD: Record<MasteryLevel, number> = {
  0: 0,
  1: 0.15,
  2: 0.4,
  3: 0.75,
  4: 0.9,
  5: 1,
};

export interface Readiness {
  /** 0..1 */
  ratio: number;
  /** Ile umiejętności objętych szacunkiem. */
  skills: number;
}

/**
 * Szacunek gotowości do egzaminu - średnia ważona wartością maturalną.
 *
 * Podstawa liczy tylko umiejętności PP. Rozszerzenie liczy wszystko, bo
 * arkusz rozszerzony zakłada znajomość podstawy.
 */
export function readiness(
  skills: Skill[],
  states: Map<string, SkillState>,
  level: ExamLevel,
): Readiness {
  const exam = examScope(skills);
  const scope = level === 'PP' ? exam.filter((s) => examLevelOf(s) === 'PP') : exam;
  let weight = 0;
  let score = 0;
  for (const s of scope) {
    const w = Math.max(s.examValue, 0.05);
    weight += w;
    score += w * LEVEL_YIELD[states.get(s.id)?.level ?? MasteryLevel.Unknown];
  }
  return { ratio: weight === 0 ? 0 : score / weight, skills: scope.length };
}

export interface CourseSummary {
  total: number;
  covered: number;
  learning: number;
  ratio: number;
  byLevel: Record<ExamLevel, { total: number; covered: number }>;
}

export function courseSummary(
  ordered: Skill[],
  states: Map<string, SkillState>,
  lessonsDone: Set<string>,
): CourseSummary {
  const byLevel: CourseSummary['byLevel'] = {
    PP: { total: 0, covered: 0 },
    PR: { total: 0, covered: 0 },
  };
  let covered = 0;
  let learning = 0;
  for (const s of ordered) {
    const status = skillStatus(states.get(s.id), lessonsDone.has(s.id));
    const b = byLevel[examLevelOf(s)];
    b.total += 1;
    if (status === 'covered' || status === 'retained') {
      covered += 1;
      b.covered += 1;
    } else if (status === 'learning') {
      learning += 1;
    }
  }
  return {
    total: ordered.length,
    covered,
    learning,
    ratio: ordered.length === 0 ? 0 : covered / ordered.length,
    byLevel,
  };
}

import { useMemo } from 'react';
import type {
  Attempt,
  CardState,
  DayMode,
  Flashcard,
  Lesson,
  LessonProgress,
  Skill,
  SkillState,
} from '@/data/types';
import type { Corpus } from '@content/corpus';
import {
  courseOrder,
  courseSummary,
  isCovered,
  nextLessonSkill,
  readiness,
  topicProgress,
  type CourseSummary,
  type Readiness,
  type TopicProgress,
} from '@/learning-engine/course';
import {
  PRACTICE_MINUTES,
  buildSchedule,
  dayKey,
  startOfDay,
  type Schedule,
} from '@/learning-engine/schedule';
import { buildCardSession, introducedSince, type CardSession } from '@/learning-engine/flashcards';
import { activityByDay, type DayActivity } from '@/learning-engine/activity';
import { isDue } from '@/learning-engine/review';

/**
 * Wyliczenia kursu dla widoków - bez stanu i bez zapisu.
 *
 * Wszystko tu jest funkcją danych: te same próby, lekcje i fiszki dają ten
 * sam plan. Dzięki temu kalendarz po opuszczonym dniu po prostu liczy się
 * od nowa, zamiast pamiętać "dług".
 */

export interface CourseInput {
  corpus: Corpus;
  states: Map<string, SkillState>;
  attempts: Attempt[];
  lessonProgress: LessonProgress[];
  cardStates: Map<string, CardState>;
  dayMode: DayMode;
  deadline: string;
  /** Materiał pozostałych przedmiotów w minutach - dzień ma jeden budżet. */
  otherMinutes?: number;
}

export interface CourseView {
  today: string;
  ordered: Skill[];
  lessonOf: Map<string, Lesson>;
  lessonsDone: Set<string>;
  next: Skill | null;
  /** Nowe lekcje zaplanowane na dziś (pusto = dzień ćwiczeń i powtórek). */
  todayLessons: Skill[];
  /** Które z dzisiejszych lekcji są już za tobą. */
  todayDone: Set<string>;
  schedule: Schedule;
  summary: CourseSummary;
  topics: TopicProgress[];
  readinessPP: Readiness;
  readinessPR: Readiness;
  reviewsDue: Skill[];
  cardSession: CardSession;
  /** Fiszki przedmiotu w kolejności kursu. */
  cards: Flashcard[];
  /** Umiejętności, których fiszki są już dostępne (po lekcji albo próbach). */
  unlocked: Set<string>;
  activity: Map<string, DayActivity>;
}

export function useCourse(input: CourseInput): CourseView {
  const { corpus, states, attempts, lessonProgress, cardStates, dayMode, deadline, otherMinutes = 0 } = input;
  // Jedna chwila na całe wyliczenie - inaczej "dziś" mogłoby się rozjechać
  // między planem a fiszkami o północy.
  const now = Date.now();
  const today = dayKey(now);

  const ordered = useMemo(() => courseOrder(corpus.topics, corpus.skills), [corpus]);
  const lessonOf = useMemo(() => new Map(corpus.lessons.map((l) => [l.skillId, l])), [corpus]);
  const lessonsDone = useMemo(
    () => new Set(lessonProgress.map((l) => l.skillId)),
    [lessonProgress],
  );

  // Plan liczy się raz na dzień i przy każdej zmianie danych - `now` w środku
  // dnia go nie zmienia, więc nie jest zależnością.
  const plan = useMemo(
    () => planToday({ ordered, states, lessonOf, lessonsDone, now, deadline, dayMode, otherMinutes }),
    [ordered, states, lessonOf, lessonsDone, today, deadline, dayMode, otherMinutes],
  );
  const { schedule, todayLessons, todayDone } = plan;
  const dayStart = startOfDay(now);

  const cards = useMemo(() => {
    const rank = new Map(ordered.map((s, i) => [s.id, i]));
    return [...corpus.flashcards].sort(
      (a, b) => (rank.get(a.skillId) ?? 0) - (rank.get(b.skillId) ?? 0),
    );
  }, [corpus, ordered]);

  const unlocked = useMemo(() => unlockedSkills(ordered, lessonsDone, states), [ordered, lessonsDone, states]);

  const cardSession = buildCardSession({
    cards,
    states: cardStates,
    unlockedSkillIds: unlocked,
    introducedToday: introducedSince(cardStates.values(), dayStart),
    now,
  });

  return {
    today,
    ordered,
    lessonOf,
    lessonsDone,
    next: nextLessonSkill(ordered, states),
    todayLessons,
    todayDone,
    schedule,
    summary: courseSummary(ordered, states, lessonsDone),
    topics: corpus.topics.map((t) => topicProgress(t, corpus.skills, states, lessonsDone)),
    readinessPP: readiness(corpus.skills, states, 'PP'),
    readinessPR: readiness(corpus.skills, states, 'PR'),
    reviewsDue: dueSkills(corpus.skills, states, now),
    cardSession,
    cards,
    unlocked,
    activity: activityByDay(attempts, lessonProgress),
  };
}

interface PlanInput {
  ordered: Skill[];
  states: Map<string, SkillState>;
  lessonOf: Map<string, Lesson>;
  lessonsDone: Set<string>;
  now: number;
  deadline: string;
  dayMode: DayMode;
  otherMinutes: number;
}

/**
 * Czy umiejętność jest jeszcze w planie: nieprzerobiona albo przerobiona
 * DZIŚ. Te drugie zostają w dzisiejszym planie jako odhaczone - bez tego plan
 * liczony od nowa dorzucałby kolejną lekcję zaraz po skończeniu poprzedniej,
 * a dzień bez końca to dokładnie to, czego sek. 14 zabrania.
 */
function inPlan(st: SkillState | undefined, dayStart: number): boolean {
  return !isCovered(st) || (st?.levelReachedAt ?? 0) >= dayStart;
}

const workMinutes = (skillId: string, lessonOf: Map<string, Lesson>) =>
  (lessonOf.get(skillId)?.minutes ?? 10) + PRACTICE_MINUTES;

/** Ile minut nowego materiału zostało w przedmiocie (do wspólnego budżetu dnia). */
export function remainingMinutes(corpus: Corpus, states: Map<string, SkillState>, now: number): number {
  const lessonOf = new Map(corpus.lessons.map((l) => [l.skillId, l]));
  const dayStart = startOfDay(now);
  return corpus.skills
    .filter((s) => inPlan(states.get(s.id), dayStart))
    .reduce((sum, s) => sum + workMinutes(s.id, lessonOf), 0);
}

/** Kalendarz do końca materiału i to, co z niego przypada na dziś. */
export function planToday(input: PlanInput): { schedule: Schedule; todayLessons: Skill[]; todayDone: Set<string> } {
  const { ordered, states, lessonOf, lessonsDone, now, deadline, dayMode, otherMinutes } = input;
  const today = dayKey(now);
  const dayStart = startOfDay(now);

  const remaining = ordered
    .filter((s) => inPlan(states.get(s.id), dayStart))
    .map((s) => ({ skillId: s.id, minutes: workMinutes(s.id, lessonOf) }));
  const schedule = buildSchedule({ remaining, today, deadline, mode: dayMode, otherMinutes });

  const byId = new Map(ordered.map((s) => [s.id, s]));
  const first = schedule.days[0];
  const todayLessons =
    first && first.date === today
      ? first.skillIds.map((id) => byId.get(id)).filter((s): s is Skill => s !== undefined)
      : [];

  const todayDone = new Set(
    todayLessons.filter((s) => isCovered(states.get(s.id)) || lessonsDone.has(s.id)).map((s) => s.id),
  );

  return { schedule, todayLessons, todayDone };
}

/** Umiejętności, których fiszki są już dostępne (po lekcji albo próbach). */
function unlockedSkills(ordered: Skill[], lessonsDone: Set<string>, states: Map<string, SkillState>): Set<string> {
  return new Set(
    ordered
      .filter((s) => lessonsDone.has(s.id) || (states.get(s.id)?.totalAttempts ?? 0) > 0)
      .map((s) => s.id),
  );
}

function dueSkills(skills: Skill[], states: Map<string, SkillState>, now: number): Skill[] {
  return skills.filter((s) => {
    const st = states.get(s.id);
    return st ? isDue(st, now) : false;
  });
}

/** Skrót dnia dla przedmiotu, który nie jest teraz wybrany. */
export interface SubjectGlance {
  lessonsLeft: number;
  reviewsDue: number;
  cardsWaiting: number;
}

/**
 * To samo wyliczenie co w `useCourse`, ale tylko liczby - dla przypomnienia
 * na ekranie "Dziś", że inne przedmioty też mają swój plan.
 */
export function subjectGlance(input: CourseInput, now: number): SubjectGlance {
  const { corpus, states, lessonProgress, cardStates, dayMode, deadline, otherMinutes = 0 } = input;
  const ordered = courseOrder(corpus.topics, corpus.skills);
  const lessonOf = new Map(corpus.lessons.map((l) => [l.skillId, l]));
  const lessonsDone = new Set(lessonProgress.map((l) => l.skillId));
  const { todayLessons, todayDone } = planToday({
    ordered,
    states,
    lessonOf,
    lessonsDone,
    now,
    deadline,
    dayMode,
    otherMinutes,
  });
  const cards = buildCardSession({
    cards: corpus.flashcards,
    states: cardStates,
    unlockedSkillIds: unlockedSkills(ordered, lessonsDone, states),
    introducedToday: introducedSince(cardStates.values(), startOfDay(now)),
    now,
  });
  return {
    lessonsLeft: todayLessons.filter((s) => !todayDone.has(s.id)).length,
    reviewsDue: dueSkills(corpus.skills, states, now).length,
    cardsWaiting: cards.queue.length,
  };
}

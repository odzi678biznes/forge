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
  const { corpus, states, attempts, lessonProgress, cardStates, dayMode, deadline } = input;
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

  const dayStart = startOfDay(now);

  /**
   * Umiejętności przerobione DZIŚ zostają w dzisiejszym planie jako odhaczone.
   * Bez tego plan liczony od nowa dorzucałby kolejną lekcję zaraz po
   * skończeniu poprzedniej - dzień bez końca to dokładnie to, czego sek. 14
   * zabrania.
   */
  const coveredToday = useMemo(
    () =>
      new Set(
        ordered
          .filter((s) => {
            const st = states.get(s.id);
            return isCovered(st) && (st?.levelReachedAt ?? 0) >= dayStart;
          })
          .map((s) => s.id),
      ),
    [ordered, states, dayStart],
  );

  const schedule = useMemo(() => {
    const remaining = ordered
      .filter((s) => !isCovered(states.get(s.id)) || coveredToday.has(s.id))
      .map((s) => ({
        skillId: s.id,
        minutes: (lessonOf.get(s.id)?.minutes ?? 10) + PRACTICE_MINUTES,
      }));
    return buildSchedule({ remaining, today, deadline, mode: dayMode });
  }, [ordered, states, coveredToday, lessonOf, today, deadline, dayMode]);

  const byId = useMemo(() => new Map(corpus.skills.map((s) => [s.id, s])), [corpus]);
  const first = schedule.days[0];
  const todayLessons =
    first && first.date === today
      ? first.skillIds.map((id) => byId.get(id)).filter((s): s is Skill => s !== undefined)
      : [];

  const cards = useMemo(() => {
    const rank = new Map(ordered.map((s, i) => [s.id, i]));
    return [...corpus.flashcards].sort(
      (a, b) => (rank.get(a.skillId) ?? 0) - (rank.get(b.skillId) ?? 0),
    );
  }, [corpus, ordered]);

  const unlocked = useMemo(
    () =>
      new Set(
        ordered
          .filter((s) => lessonsDone.has(s.id) || (states.get(s.id)?.totalAttempts ?? 0) > 0)
          .map((s) => s.id),
      ),
    [ordered, lessonsDone, states],
  );

  const todayDone = new Set(
    todayLessons
      .filter((s) => coveredToday.has(s.id) || isCovered(states.get(s.id)) || lessonsDone.has(s.id))
      .map((s) => s.id),
  );

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
    reviewsDue: corpus.skills.filter((s) => {
      const st = states.get(s.id);
      return st ? isDue(st, now) : false;
    }),
    cardSession,
    cards,
    unlocked,
    activity: activityByDay(attempts, lessonProgress),
  };
}

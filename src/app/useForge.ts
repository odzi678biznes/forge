import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MasteryLevel,
  emptySkillState,
  type Attempt,
  type HintLevel,
  type Confidence,
  type Mission,
  type SkillState,
} from '@/data/types';
import { IndexedDbStorage } from '@/data/indexeddb-storage';
import type { StoragePort } from '@/data/storage-port';
import {
  QUADRATIC_QUESTIONS,
  QUADRATIC_SKILLS,
} from '@content/math/funkcja-kwadratowa';
import { selectNextQuestion, type Selection } from '@/learning-engine/selector';
import { applyAttempt, type MasteryTransition } from '@/learning-engine/mastery';
import { scheduleReview } from '@/learning-engine/review';
import { GRADING_VERSION, grade, type Grade } from '@/learning-engine/grading';
import {
  alternatives,
  recommendMission,
  startMission,
  type MissionPlan,
} from '@/learning-engine/mission';

/**
 * Kompozycja pionowego wycinka (Blueprint sek. 18).
 *
 * Cala logika decyzyjna zostaje w `learning-engine` - ten modul tylko laczy
 * silnik z trwaloscia i widokiem. Dzieki temu podmiana IndexedDB na SQLite
 * (po zbudowaniu powloki Tauri) nie dotyka regul nauki.
 */

export type Screen = 'loading' | 'command-center' | 'arena' | 'summary';

export interface AnsweredStep {
  selection: Selection;
  grade: Grade;
  hintLevel: HintLevel;
  confidence: Confidence;
  transition: MasteryTransition | null;
  userAnswer: string;
}

export interface ForgeState {
  screen: Screen;
  skillStates: Map<string, SkillState>;
  recommended: MissionPlan;
  options: MissionPlan[];
  mission: Mission | null;
  plan: MissionPlan | null;
  current: Selection | null;
  /** Numer biezacego pytania, liczony od 1. */
  step: number;
  steps: AnsweredStep[];
  /** Ostatnio oceniona odpowiedz - widoczna, dopoki uzytkownik nie przejdzie dalej. */
  feedback: AnsweredStep | null;
  missionsToday: number;
}

const SKILLS = QUADRATIC_SKILLS;
const QUESTIONS = QUADRATIC_QUESTIONS;

export function useForge(storage: StoragePort = new IndexedDbStorage()) {
  const store = useRef(storage);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('loading');
  const [skillStates, setSkillStates] = useState<Map<string, SkillState>>(new Map());
  const [mission, setMission] = useState<Mission | null>(null);
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [current, setCurrent] = useState<Selection | null>(null);
  const [steps, setSteps] = useState<AnsweredStep[]>([]);
  const [feedback, setFeedback] = useState<AnsweredStep | null>(null);
  const [missionsToday, setMissionsToday] = useState(0);
  const [recentSkillIds, setRecentSkillIds] = useState<string[]>([]);
  const askedRef = useRef<Set<string>>(new Set());
  const startedAtRef = useRef<number>(Date.now());

  // Wczytanie profilu. Brak danych to poprawny stan, nie blad (sek. 16).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = store.current;
      await s.init();
      const saved = await s.loadSkillStates();
      if (cancelled) return;

      const map = new Map<string, SkillState>();
      for (const skill of SKILLS) {
        map.set(skill.id, saved.find((x) => x.skillId === skill.id) ?? emptySkillState(skill.id));
      }
      setSkillStates(map);

      const missions = await s.loadMissions();
      setMissionsToday(missions.filter((m) => isToday(m.startedAt)).length);
      setReady(true);
      setScreen('command-center');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const daysSinceLastSession = useMemo(() => {
    const times = [...skillStates.values()]
      .map((s) => s.lastAttemptAt)
      .filter((t): t is number => t !== null);
    if (times.length === 0) return null;
    return Math.floor((Date.now() - Math.max(...times)) / 86_400_000);
  }, [skillStates]);

  const recommended = useMemo(
    () =>
      recommendMission({
        skills: SKILLS,
        states: skillStates,
        now: Date.now(),
        daysSinceLastSession,
      }),
    [skillStates, daysSinceLastSession],
  );

  const options = useMemo(() => alternatives(recommended), [recommended]);

  const pickNext = useCallback(
    (states: Map<string, SkillState>, recent: string[]): Selection | null =>
      selectNextQuestion({
        skills: SKILLS,
        states,
        questions: QUESTIONS,
        askedQuestionIds: askedRef.current,
        recentSkillIds: recent,
        now: Date.now(),
      }),
    [],
  );

  const beginMission = useCallback(
    (chosen: MissionPlan) => {
      askedRef.current = new Set();
      const m = startMission(chosen, `m-${Date.now()}`, Date.now());
      const first = pickNext(skillStates, recentSkillIds);
      if (!first) return;

      askedRef.current.add(first.question.id);
      startedAtRef.current = Date.now();
      setMission(m);
      setPlan(chosen);
      setSteps([]);
      setFeedback(null);
      setCurrent(first);
      setScreen('arena');
    },
    [pickNext, skillStates, recentSkillIds],
  );

  /** Ocena odpowiedzi + aktualizacja kompetencji + zapis. */
  const submitAnswer = useCallback(
    async (userAnswer: string, hintLevel: HintLevel, confidence: Confidence) => {
      if (!current || !mission) return;

      const now = Date.now();
      const result = grade(current.question, userAnswer);

      const attempt: Attempt = {
        id: `a-${now}-${current.question.id}`,
        questionId: current.question.id,
        skillId: current.skill.id,
        missionId: mission.id,
        startedAt: startedAtRef.current,
        answeredAt: now,
        userAnswer,
        correctness: result.correctness,
        confidence,
        hintLevel,
        errorId: result.error?.id ?? null,
        gradingVersion: GRADING_VERSION,
        gradedBy: 'auto',
      };

      const before = skillStates.get(current.skill.id) ?? emptySkillState(current.skill.id);
      const { state: after, transition } = applyAttempt(before, attempt, current.question);
      const scheduled = scheduleReview(after, result.correctness === 'correct', now);
      const saved: SkillState = { ...after, ...scheduled };

      const nextStates = new Map(skillStates).set(saved.skillId, saved);
      const step: AnsweredStep = {
        selection: current,
        grade: result,
        hintLevel,
        confidence,
        transition,
        userAnswer,
      };

      setSkillStates(nextStates);
      setSteps((prev) => [...prev, step]);
      setFeedback(step);
      setRecentSkillIds((prev) => [current.skill.id, ...prev].slice(0, 10));

      await store.current.appendAttempt(attempt);
      await store.current.saveSkillState(saved);
    },
    [current, mission, skillStates],
  );

  /** Przejscie do kolejnego pytania albo domkniecie misji. */
  const advance = useCallback(async () => {
    if (!mission || !plan) return;
    setFeedback(null);

    const done = steps.length >= plan.questionCount;
    const recent = [current?.skill.id ?? '', ...recentSkillIds].filter(Boolean);
    const next = done ? null : pickNext(skillStates, recent);

    if (!next) {
      const finished: Mission = {
        ...mission,
        questionIds: [...askedRef.current],
        finishedAt: Date.now(),
      };
      await store.current.saveMission(finished);
      setMission(finished);
      setMissionsToday((n) => n + 1);
      setCurrent(null);
      setScreen('summary');
      return;
    }

    askedRef.current.add(next.question.id);
    startedAtRef.current = Date.now();
    setCurrent(next);
  }, [mission, plan, steps.length, current, recentSkillIds, pickNext, skillStates]);

  const toCommandCenter = useCallback(() => {
    setMission(null);
    setPlan(null);
    setSteps([]);
    setFeedback(null);
    setScreen('command-center');
  }, []);

  const state: ForgeState = {
    screen: ready ? screen : 'loading',
    skillStates,
    recommended,
    options,
    mission,
    plan,
    current,
    step: steps.length + (feedback ? 0 : 1),
    steps,
    feedback,
    missionsToday,
  };

  return { state, skills: SKILLS, beginMission, submitAnswer, advance, toCommandCenter };
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export { MasteryLevel };

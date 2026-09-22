import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MasteryLevel,
  emptySkillState,
  type Attempt,
  type HintLevel,
  type Confidence,
  type DayMode,
  type Mission,
  type Question,
  type SavedPlan,
  type SkillState,
} from '@/data/types';
import { createStorage } from '@/data/create-storage';
import type { StoragePort } from '@/data/storage-port';
import { MATH_QUESTIONS, MATH_SKILLS, MATH_TOPICS } from '@content/math/index';
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
import { buildErrorLab, type ErrorGroup } from '@/learning-engine/error-lab';
import {
  analyseDiagnostic,
  buildDiagnosticSet,
  buildPlan,
  type DiagnosticReport,
  type PlanVariant,
} from '@/learning-engine/diagnostics';
import { planDay, weekRhythm, type DailyPlan, type WeekRhythm } from '@/learning-engine/planner';
import { buildWeeklyReport, type WeeklyReport } from '@/learning-engine/weekly-report';

/**
 * Kompozycja pionowego wycinka (Blueprint sek. 18).
 *
 * Cala logika decyzyjna zostaje w `learning-engine` - ten modul tylko laczy
 * silnik z trwaloscia i widokiem. Dzieki temu podmiana IndexedDB na SQLite
 * (po zbudowaniu powloki Tauri) nie dotyka regul nauki.
 */

export type Screen =
  | 'loading'
  | 'command-center'
  | 'arena'
  | 'summary'
  | 'mastery-map'
  | 'error-lab'
  | 'diagnostic-intro'
  | 'diagnostic-report'
  | 'weekly-report';

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
  /** Dziennik bledow pogrupowany po przyczynie (sek. 7.4). */
  errorGroups: ErrorGroup[];
  /** Raport z ostatniej diagnozy albo null (sek. 15, Etap 3). */
  report: DiagnosticReport | null;
  /** Aktywny plan nauki albo null, gdy diagnoza jeszcze nie przeszla. */
  savedPlan: SavedPlan | null;
  /** Ile sond zostalo w biezacej diagnozie. */
  diagnosticRemaining: number;
  /** Dzisiejszy zestaw wynikajacy z planu i trybu dnia (sek. 15, Etap 5). */
  daily: DailyPlan;
  /** Rytm tygodnia - dni aktywne wobec zaplanowanych (sek. 4.4). */
  rhythm: WeekRhythm;
  /** Raport tygodniowy (sek. 7.6). */
  weekly: WeeklyReport;
  dayMode: DayMode;
  /** Termin zakonczenia proby czasowej albo null (sek. 4.3). */
  missionDeadline: number | null;
}

/** Klucz preferencji trybu dnia. */
const DAY_MODE_KEY = 'dayMode';

const SKILLS = MATH_SKILLS;
const QUESTIONS = MATH_QUESTIONS;
const TOPICS = MATH_TOPICS;

export function useForge(storage?: StoragePort) {
  // Bez podanego portu wybieramy go przy starcie: SQLite w powloce Tauri,
  // IndexedDB w przegladarce. Testy wstrzykuja wlasna implementacje.
  const store = useRef<StoragePort | null>(storage ?? null);

  /** Port po inicjalizacji. Wywolania uzytkownika zachodza dopiero po niej. */
  const port = (): StoragePort => {
    const s = store.current;
    if (!s) throw new Error('Trwalosc nie zostala jeszcze zainicjowana.');
    return s;
  };
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('loading');
  const [skillStates, setSkillStates] = useState<Map<string, SkillState>>(new Map());
  const [mission, setMission] = useState<Mission | null>(null);
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [current, setCurrent] = useState<Selection | null>(null);
  const [steps, setSteps] = useState<AnsweredStep[]>([]);
  const [feedback, setFeedback] = useState<AnsweredStep | null>(null);
  const [missionsToday, setMissionsToday] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [dayMode, setDayModeState] = useState<DayMode>('standard');
  const [missionDeadline, setMissionDeadline] = useState<number | null>(null);
  // Kolejka sond diagnostycznych. Gdy niepusta, 'advance' bierze pytanie
  // stad zamiast pytac selektor - diagnoza ma staly przekroj, nie adaptacje.
  const [diagnosticQueue, setDiagnosticQueue] = useState<Question[]>([]);
  const diagnosticMissionRef = useRef<string | null>(null);
  const [recentSkillIds, setRecentSkillIds] = useState<string[]>([]);
  const askedRef = useRef<Set<string>>(new Set());
  const startedAtRef = useRef<number>(Date.now());

  // Wczytanie profilu. Brak danych to poprawny stan, nie blad (sek. 16).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = store.current ?? (await createStorage());
      store.current = s;
      await s.init();
      const saved = await s.loadSkillStates();
      if (cancelled) return;

      const map = new Map<string, SkillState>();
      for (const skill of SKILLS) {
        map.set(skill.id, saved.find((x) => x.skillId === skill.id) ?? emptySkillState(skill.id));
      }
      setSkillStates(map);

      setAttempts(await s.loadAttempts());
      setSavedPlan(await s.loadPlan());

      const loaded = await s.loadMissions();
      setMissions(loaded);
      setMissionsToday(loaded.filter((m) => isToday(m.startedAt)).length);

      const prefs = await s.loadPreferences();
      const savedMode = prefs.find((x) => x.key === DAY_MODE_KEY)?.value;
      if (savedMode === 'minimum' || savedMode === 'standard' || savedMode === 'strong') {
        setDayModeState(savedMode);
      }

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
    (
      states: Map<string, SkillState>,
      recent: string[],
      focusSkillId?: string,
    ): Selection | null =>
      selectNextQuestion({
        skills: SKILLS,
        states,
        questions: QUESTIONS,
        askedQuestionIds: askedRef.current,
        recentSkillIds: recent,
        now: Date.now(),
        ...(focusSkillId === undefined ? {} : { focusSkillId }),
      }),
    [],
  );

  const beginMission = useCallback(
    (chosen: MissionPlan) => {
      askedRef.current = new Set();
      const m = startMission(chosen, `m-${Date.now()}`, Date.now());
      const first = pickNext(skillStates, recentSkillIds, chosen.focusSkillId);
      if (!first) return;

      askedRef.current.add(first.question.id);
      startedAtRef.current = Date.now();
      // Licznik dostaja WYLACZNIE proby czasowe (sek. 4.3). Zwykla misja
      // nie ma terminu, bo sek. 14 zakazuje sztucznej presji czasu.
      setMissionDeadline(
        chosen.timeLimitMs === undefined ? null : Date.now() + chosen.timeLimitMs,
      );
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
      setAttempts((prev) => [...prev, attempt]);
      setSteps((prev) => [...prev, step]);
      setFeedback(step);
      setRecentSkillIds((prev) => [current.skill.id, ...prev].slice(0, 10));

      await port().appendAttempt(attempt);
      await port().saveSkillState(saved);
    },
    [current, mission, skillStates],
  );

  /**
   * Buduje pozorny wybor dla sondy diagnostycznej.
   *
   * Diagnoza nie przechodzi przez selektor: jej sens polega na stalym
   * przekroju wszystkich kompetencji, a nie na adaptacji do biezacych
   * wynikow. Arena przyjmuje ten sam ksztalt danych co przy zwyklej misji.
   */
  const asProbe = useCallback((question: Question): Selection | null => {
    const skill = SKILLS.find((s) => s.id === question.skillId);
    if (!skill) return null;
    return {
      question,
      skill,
      rule: 'fallback',
      breakdown: {
        reviewDue: 0,
        skillGap: 0,
        examValue: skill.examValue,
        errorFrequency: 0,
        interleaveNeed: 0,
        total: 0,
      },
      reasons: [
        'Sonda diagnostyczna.',
        'Diagnoza sprawdza kazda kompetencje raz, niezaleznie od wynikow.',
      ],
    };
  }, []);

  /** Przejscie do kolejnego pytania albo domkniecie misji. */
  const advance = useCallback(async () => {
    if (!mission || !plan) return;
    setFeedback(null);

    // Tryb diagnozy: kolejne pytanie bierzemy z ustalonej kolejki.
    if (diagnosticQueue.length > 0) {
      const [head, ...rest] = diagnosticQueue;
      const probe = head ? asProbe(head) : null;
      if (probe) {
        setDiagnosticQueue(rest);
        askedRef.current.add(probe.question.id);
        startedAtRef.current = Date.now();
        setCurrent(probe);
        return;
      }
    }

    const done = steps.length >= plan.questionCount;
    const recent = [current?.skill.id ?? '', ...recentSkillIds].filter(Boolean);
    const next =
      plan.kind === 'diagnostic'
        ? null
        : done
          ? null
          : pickNext(skillStates, recent, plan.focusSkillId);

    if (!next) {
      const finished: Mission = {
        ...mission,
        questionIds: [...askedRef.current],
        finishedAt: Date.now(),
      };
      await port().saveMission(finished);
      setMission(finished);
      setMissionsToday((n) => n + 1);
      setCurrent(null);
      // Diagnoza konczy sie raportem, a nie zwyklym podsumowaniem misji.
      setScreen(plan.kind === 'diagnostic' ? 'diagnostic-report' : 'summary');
      return;
    }

    askedRef.current.add(next.question.id);
    startedAtRef.current = Date.now();
    setCurrent(next);
  }, [
    mission,
    plan,
    steps.length,
    current,
    recentSkillIds,
    pickNext,
    skillStates,
    diagnosticQueue,
    asProbe,
  ]);

  /**
   * Konczy misje przed czasem — uzywane przez licznik proby czasowej.
   *
   * Uplyw czasu zamyka misje, ale NIE kasuje juz zapisanych prob i nie
   * odbiera awansow. Blueprint sek. 14 zakazuje kar za przerwanie.
   */
  const finishMissionNow = useCallback(async () => {
    if (!mission || mission.finishedAt !== null) return;

    const finished: Mission = {
      ...mission,
      questionIds: [...askedRef.current],
      finishedAt: Date.now(),
    };
    await port().saveMission(finished);
    setMission(finished);
    setMissions((prev) => [...prev.filter((m) => m.id !== finished.id), finished]);
    setMissionsToday((n) => n + 1);
    setMissionDeadline(null);
    setCurrent(null);
    setFeedback(null);
    setScreen('summary');
  }, [mission]);

  // -------------------------------------------------------------------------
  // Diagnoza (sek. 15, Etap 3)
  // -------------------------------------------------------------------------

  const diagnosticSet = useMemo(() => buildDiagnosticSet(SKILLS, QUESTIONS), []);

  const startDiagnostic = useCallback(() => {
    const [first, ...rest] = diagnosticSet;
    const probe = first ? asProbe(first) : null;
    if (!probe) return;

    const id = `m-diag-${Date.now()}`;
    diagnosticMissionRef.current = id;
    askedRef.current = new Set([probe.question.id]);
    startedAtRef.current = Date.now();

    setMission({
      id,
      kind: 'diagnostic',
      title: 'Diagnoza',
      rationale: 'Przekrojowy pomiar wszystkich kompetencji.',
      questionIds: [],
      startedAt: Date.now(),
      finishedAt: null,
    });
    setPlan({
      kind: 'diagnostic',
      title: 'Diagnoza',
      rationale: 'Jedna sonda na kompetencje.',
      questionCount: diagnosticSet.length,
    });
    setDiagnosticQueue(rest);
    setSteps([]);
    setFeedback(null);
    setCurrent(probe);
    setScreen('arena');
  }, [diagnosticSet, asProbe]);

  /**
   * Raport liczony wylacznie z prob nalezacych do misji diagnostycznej.
   * Zwykle misje nie zanieczyszczaja pomiaru.
   */
  const report = useMemo((): DiagnosticReport | null => {
    const id = diagnosticMissionRef.current;
    const probes = attempts.filter((a) =>
      id === null ? a.missionId.startsWith('m-diag-') : a.missionId === id,
    );
    if (probes.length === 0) return null;
    return analyseDiagnostic(probes, SKILLS, TOPICS, Date.now());
  }, [attempts]);

  /** Podglad planu dla wariantu - liczony na zywo, bez zapisu. */
  const previewPlan = useCallback(
    (variant: PlanVariant, deadline: number | null) =>
      report ? buildPlan(report, SKILLS, TOPICS, variant, deadline) : null,
    [report],
  );

  const choosePlan = useCallback(
    async (variant: PlanVariant, deadline: number | null) => {
      if (!report) return;
      const built = buildPlan(report, SKILLS, TOPICS, variant, deadline);

      const toSave: SavedPlan = {
        id: `p-${Date.now()}`,
        variant,
        createdAt: Date.now(),
        deadline,
        targets: built.steps.map((s) => ({
          skillId: s.skillId,
          targetLevel: s.targetLevel,
        })),
        diagnosisSnapshot: report.skills.map((d) => ({
          skillId: d.skillId,
          level: d.estimatedLevel,
        })),
      };

      await port().savePlan(toSave);
      setSavedPlan(toSave);
      setScreen('command-center');
    },
    [report],
  );

  const toCommandCenter = useCallback(() => {
    setMission(null);
    setPlan(null);
    setSteps([]);
    setFeedback(null);
    setScreen('command-center');
  }, []);

  const goTo = useCallback((next: Screen) => setScreen(next), []);

  const errorGroups = useMemo(
    () => buildErrorLab({ attempts, questions: QUESTIONS, skills: SKILLS }),
    [attempts],
  );

  // -------------------------------------------------------------------------
  // Plan dnia, rytm i raport (sek. 15, Etap 5)
  // -------------------------------------------------------------------------

  const setDayMode = useCallback(async (next: DayMode) => {
    setDayModeState(next);
    await port().setPreference(DAY_MODE_KEY, next);
  }, []);

  const daily = useMemo(
    () =>
      planDay({
        plan: savedPlan,
        skills: SKILLS,
        states: skillStates,
        mode: dayMode,
        daysSinceLastSession,
        now: Date.now(),
      }),
    [savedPlan, skillStates, dayMode, daysSinceLastSession],
  );

  const rhythm = useMemo(() => weekRhythm(missions, Date.now()), [missions]);

  const weekly = useMemo(
    () =>
      buildWeeklyReport({
        attempts,
        skills: SKILLS,
        states: skillStates,
        now: Date.now(),
        missionsFinished: missions.filter(
          (m) => m.finishedAt !== null && m.startedAt >= Date.now() - 7 * 86_400_000,
        ).length,
      }),
    [attempts, skillStates, missions],
  );

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
    errorGroups,
    report,
    savedPlan,
    diagnosticRemaining: diagnosticQueue.length,
    missionDeadline,
    daily,
    rhythm,
    weekly,
    dayMode,
  };

  return {
    state,
    skills: SKILLS,
    topics: TOPICS,
    setDayMode,
    beginMission,
    submitAnswer,
    advance,
    finishMissionNow,
    toCommandCenter,
    goTo,
    startDiagnostic,
    previewPlan,
    choosePlan,
    diagnosticSize: diagnosticSet.length,
  };
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

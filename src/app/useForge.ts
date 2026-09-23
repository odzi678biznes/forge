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
import { MATH_CORPUS, type Corpus } from '@content/math/index';
import { CS_CORPUS } from '@content/cs/index';
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
import {
  DEFAULT_RUN_TIMEOUT_MS,
  judge,
  verdictToGrade,
  type CodeRunner,
  type CodeVerdict,
  type TestOutcome,
} from '@/learning-engine/code-grading';

/**
 * Kompozycja aplikacji.
 *
 * Cala logika decyzyjna zostaje w `learning-engine` - ten modul tylko laczy
 * silnik z trwaloscia, piaskownica kodu i widokiem. Porty (trwalosc,
 * uruchamianie kodu) sa wstrzykiwalne, zeby testy mogly je podmienic.
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

export type SubjectId = 'math' | 'cs';

export const SUBJECT_LABELS: Record<SubjectId, string> = {
  math: 'Matematyka',
  cs: 'Informatyka',
};

const CORPORA: Record<SubjectId, Corpus> = { math: MATH_CORPUS, cs: CS_CORPUS };

/**
 * Stany kompetencji trzymamy dla WSZYSTKICH przedmiotow naraz. Identyfikatory
 * nie koliduja (pilnuje tego test korpusu informatyki), wiec jedna mapa
 * obsluguje oba przedmioty, a przelaczenie przedmiotu nie gubi postepu.
 */
const ALL_SKILLS = [...MATH_CORPUS.skills, ...CS_CORPUS.skills];

/** Wynik uruchomienia kodu - pokazywany w feedbacku zadania programistycznego. */
export interface CodeFeedback {
  verdict: CodeVerdict;
  outcomes: TestOutcome[];
}

export interface AnsweredStep {
  selection: Selection;
  grade: Grade;
  hintLevel: HintLevel;
  confidence: Confidence;
  transition: MasteryTransition | null;
  userAnswer: string;
  /** Obecne wylacznie dla zadan programistycznych. */
  code?: CodeFeedback;
}

export interface ForgeState {
  screen: Screen;
  subject: SubjectId;
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
  /** Czy trwa uruchamianie testow kodu. */
  running: boolean;
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

const DAY_MODE_KEY = 'dayMode';
const SUBJECT_KEY = 'subject';

export interface ForgeDeps {
  storage?: StoragePort;
  /** Piaskownica kodu. Domyslnie Web Worker, ladowany leniwie. */
  runner?: CodeRunner;
}

export function useForge(deps: ForgeDeps = {}) {
  // Bez podanego portu wybieramy go przy starcie: SQLite w powloce Tauri,
  // IndexedDB w przegladarce. Testy wstrzykuja wlasna implementacje.
  const store = useRef<StoragePort | null>(deps.storage ?? null);
  const runnerRef = useRef<CodeRunner | null>(deps.runner ?? null);

  const port = (): StoragePort => {
    const s = store.current;
    if (!s) throw new Error('Trwalosc nie zostala jeszcze zainicjowana.');
    return s;
  };

  /**
   * Piaskownica jest ladowana leniwie: uczen, ktory robi tylko matematyke,
   * nigdy nie uruchamia workera kodu.
   */
  const runner = async (): Promise<CodeRunner> => {
    if (runnerRef.current) return runnerRef.current;
    const { WorkerCodeRunner } = await import('@/features/code/worker-runner');
    runnerRef.current = new WorkerCodeRunner();
    return runnerRef.current;
  };

  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('loading');
  const [subject, setSubjectState] = useState<SubjectId>('math');
  const [skillStates, setSkillStates] = useState<Map<string, SkillState>>(new Map());
  const [mission, setMission] = useState<Mission | null>(null);
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [current, setCurrent] = useState<Selection | null>(null);
  const [steps, setSteps] = useState<AnsweredStep[]>([]);
  const [feedback, setFeedback] = useState<AnsweredStep | null>(null);
  const [running, setRunning] = useState(false);
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

  const corpus = CORPORA[subject];
  const { skills, questions, topics } = corpus;

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
      for (const skill of ALL_SKILLS) {
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
      const savedSubject = prefs.find((x) => x.key === SUBJECT_KEY)?.value;
      if (savedSubject === 'math' || savedSubject === 'cs') setSubjectState(savedSubject);

      setReady(true);
      setScreen('command-center');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Przerwa liczona dla osoby, nie dla przedmiotu - obejmuje wszystkie kompetencje. */
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
        skills,
        states: skillStates,
        now: Date.now(),
        daysSinceLastSession,
      }),
    [skills, skillStates, daysSinceLastSession],
  );

  const options = useMemo(() => alternatives(recommended), [recommended]);

  const pickNext = useCallback(
    (
      states: Map<string, SkillState>,
      recent: string[],
      focusSkillId?: string,
    ): Selection | null =>
      selectNextQuestion({
        skills,
        states,
        questions,
        askedQuestionIds: askedRef.current,
        recentSkillIds: recent,
        now: Date.now(),
        ...(focusSkillId === undefined ? {} : { focusSkillId }),
      }),
    [skills, questions],
  );

  const setSubject = useCallback(async (next: SubjectId) => {
    setSubjectState(next);
    await port().setPreference(SUBJECT_KEY, next);
  }, []);

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

  /**
   * Ocena odpowiedzi + aktualizacja kompetencji + zapis.
   *
   * Zadania tekstowe ocenia `grade()`. Zadania programistyczne przechodza
   * przez piaskownice i dopiero jej werdykt jest zamieniany na ocene -
   * od tego miejsca silnik opanowania traktuje oba rodzaje tak samo.
   */
  const submitAnswer = useCallback(
    async (userAnswer: string, hintLevel: HintLevel, confidence: Confidence) => {
      if (!current || !mission || running) return;

      let result: Grade;
      let code: CodeFeedback | undefined;

      if (current.question.format === 'code' && current.question.code) {
        const task = current.question.code;
        setRunning(true);
        try {
          const run = await (await runner()).run(
            userAnswer,
            task.functionName,
            task.tests,
            DEFAULT_RUN_TIMEOUT_MS,
          );
          const verdict = judge(run);
          result = verdictToGrade(verdict, run.status);
          code = { verdict, outcomes: run.outcomes };
        } finally {
          setRunning(false);
        }
      } else {
        result = grade(current.question, userAnswer);
      }

      const now = Date.now();
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
        ...(code ? { code } : {}),
      };

      setSkillStates(nextStates);
      setAttempts((prev) => [...prev, attempt]);
      setSteps((prev) => [...prev, step]);
      setFeedback(step);
      setRecentSkillIds((prev) => [current.skill.id, ...prev].slice(0, 10));

      await port().appendAttempt(attempt);
      await port().saveSkillState(saved);
    },
    [current, mission, skillStates, running],
  );

  /**
   * Buduje pozorny wybor dla sondy diagnostycznej.
   *
   * Diagnoza nie przechodzi przez selektor: jej sens polega na stalym
   * przekroju wszystkich kompetencji, a nie na adaptacji do biezacych
   * wynikow. Arena przyjmuje ten sam ksztalt danych co przy zwyklej misji.
   */
  const asProbe = useCallback((question: Question): Selection | null => {
    const skill = ALL_SKILLS.find((s) => s.id === question.skillId);
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

  /** Wspolne domkniecie misji - zwykle zakonczenie i uplyw czasu ida ta sama droga. */
  const closeMission = useCallback(
    async (m: Mission, target: Screen) => {
      const finished: Mission = {
        ...m,
        questionIds: [...askedRef.current],
        finishedAt: Date.now(),
      };
      await port().saveMission(finished);
      setMission(finished);
      // Bez tego rytm tygodnia aktualizowal sie dopiero po przeladowaniu.
      setMissions((prev) => [...prev.filter((x) => x.id !== finished.id), finished]);
      setMissionsToday((n) => n + 1);
      setMissionDeadline(null);
      setCurrent(null);
      setFeedback(null);
      setScreen(target);
    },
    [],
  );

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
      plan.kind === 'diagnostic' || done
        ? null
        : pickNext(skillStates, recent, plan.focusSkillId);

    if (!next) {
      // Diagnoza konczy sie raportem, a nie zwyklym podsumowaniem misji.
      await closeMission(mission, plan.kind === 'diagnostic' ? 'diagnostic-report' : 'summary');
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
    closeMission,
  ]);

  /**
   * Konczy misje przed czasem - uzywane przez licznik proby czasowej.
   *
   * Uplyw czasu zamyka misje, ale NIE kasuje juz zapisanych prob i nie
   * odbiera awansow. Blueprint sek. 14 zakazuje kar za przerwanie.
   */
  const finishMissionNow = useCallback(async () => {
    if (!mission || mission.finishedAt !== null) return;
    await closeMission(mission, 'summary');
  }, [mission, closeMission]);

  // -------------------------------------------------------------------------
  // Diagnoza (sek. 15, Etap 3) - zgodnie z blueprintem matematyczna
  // -------------------------------------------------------------------------

  const diagnosticSet = useMemo(
    () => buildDiagnosticSet(MATH_CORPUS.skills, MATH_CORPUS.questions),
    [],
  );

  const startDiagnostic = useCallback(() => {
    const [first, ...rest] = diagnosticSet;
    const probe = first ? asProbe(first) : null;
    if (!probe) return;

    const id = `m-diag-${Date.now()}`;
    diagnosticMissionRef.current = id;
    askedRef.current = new Set([probe.question.id]);
    startedAtRef.current = Date.now();

    setMissionDeadline(null);
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
    return analyseDiagnostic(probes, MATH_CORPUS.skills, MATH_CORPUS.topics, Date.now());
  }, [attempts]);

  /** Podglad planu dla wariantu - liczony na zywo, bez zapisu. */
  const previewPlan = useCallback(
    (variant: PlanVariant, deadline: number | null) =>
      report
        ? buildPlan(report, MATH_CORPUS.skills, MATH_CORPUS.topics, variant, deadline)
        : null,
    [report],
  );

  const choosePlan = useCallback(
    async (variant: PlanVariant, deadline: number | null) => {
      if (!report) return;
      const built = buildPlan(report, MATH_CORPUS.skills, MATH_CORPUS.topics, variant, deadline);

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
    setMissionDeadline(null);
    setScreen('command-center');
  }, []);

  const goTo = useCallback((next: Screen) => setScreen(next), []);

  const errorGroups = useMemo(
    () => buildErrorLab({ attempts, questions, skills }),
    [attempts, questions, skills],
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
        // Plan pochodzi z diagnozy matematycznej, wiec obowiazuje tylko tam.
        plan: subject === 'math' ? savedPlan : null,
        skills,
        states: skillStates,
        mode: dayMode,
        daysSinceLastSession,
        now: Date.now(),
      }),
    [subject, savedPlan, skills, skillStates, dayMode, daysSinceLastSession],
  );

  /** Rytm dotyczy osoby, nie przedmiotu - liczy wszystkie misje. */
  const rhythm = useMemo(() => weekRhythm(missions, Date.now()), [missions]);

  const weekly = useMemo(() => {
    const ids = new Set(skills.map((s) => s.id));
    return buildWeeklyReport({
      attempts: attempts.filter((a) => ids.has(a.skillId)),
      skills,
      states: skillStates,
      now: Date.now(),
      missionsFinished: missions.filter(
        (m) => m.finishedAt !== null && m.startedAt >= Date.now() - 7 * 86_400_000,
      ).length,
    });
  }, [attempts, skills, skillStates, missions]);

  const state: ForgeState = {
    screen: ready ? screen : 'loading',
    subject,
    skillStates,
    recommended,
    options,
    mission,
    plan,
    current,
    step: steps.length + (feedback ? 0 : 1),
    steps,
    feedback,
    running,
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
    skills,
    topics,
    setSubject,
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

import {
  MasteryLevel,
  type Attempt,
  type Question,
  type Skill,
  type Topic,
} from '@/data/types';

/**
 * Diagnoza matematyczna — Blueprint sek. 15, Etap 3.
 *
 * Kryterium ukończenia etapu brzmi: „diagnoza generuje plan na podstawie
 * WYNIKÓW, nie samooceny". Dlatego jedynym wejściem tego modułu są próby
 * (`Attempt[]`) — nie ma tu żadnego parametru w rodzaju „jak oceniasz swój
 * poziom". Deklarowana pewność jest zapisywana przy próbie, ale służy do
 * wykrywania rozjazdu między pewnością a wynikiem, a nie do ustalania poziomu.
 */

// ---------------------------------------------------------------------------
// Zestaw diagnostyczny
// ---------------------------------------------------------------------------

/** Trudność sondy diagnostycznej — środek skali, żeby nie zaniżać ani nie zawyżać. */
const PROBE_DIFFICULTY = 3;

/**
 * Buduje przekrój diagnostyczny: jedna sonda na kompetencję, w kolejności
 * działów. Sondą jest zadanie typowe — fundament byłby za łatwy na pomiar,
 * a transfer za trudny na start.
 */
export function buildDiagnosticSet(skills: Skill[], questions: Question[]): Question[] {
  const set: Question[] = [];

  for (const skill of skills) {
    const pool = questions.filter((q) => q.skillId === skill.id && q.kind === 'typical');
    const fallback = questions.filter((q) => q.skillId === skill.id);
    const candidates = pool.length > 0 ? pool : fallback;
    if (candidates.length === 0) continue;

    const probe = candidates.reduce((best, q) =>
      globalThis.Math.abs(q.difficulty - PROBE_DIFFICULTY) <
      globalThis.Math.abs(best.difficulty - PROBE_DIFFICULTY)
        ? q
        : best,
    );
    set.push(probe);
  }

  return set;
}

// ---------------------------------------------------------------------------
// Odczyt wyniku
// ---------------------------------------------------------------------------

export interface SkillDiagnosis {
  skillId: string;
  skillName: string;
  topicId: string;
  /** Poziom oszacowany na podstawie jednej sondy — wstępny, nie dowód. */
  estimatedLevel: MasteryLevel;
  /** Czy uczeń w ogóle podszedł do sondy tej kompetencji. */
  probed: boolean;
  /** Rozpoznany typ błędu, jeśli sonda go ujawniła. */
  errorId: string | null;
  /**
   * Rozjazd między deklarowaną pewnością a wynikiem. Dodatni oznacza
   * „byłem pewny, a się nie udało" — to najcenniejszy sygnał diagnostyczny.
   */
  confidenceGap: number;
}

/**
 * Sonda daje oszacowanie, nie dowód opanowania.
 *
 * Poziom 3 jest sufitem diagnozy: jedno poprawne zadanie typowe bez pomocy
 * pokazuje samodzielność, ale transferu ani utrwalenia nie da się stwierdzić
 * bez zadania transferowego i odroczenia. Diagnoza nigdy nie przyznaje
 * poziomów 4 i 5 — te trzeba zapracować w misjach (sek. 4.1).
 */
export const DIAGNOSTIC_CEILING = MasteryLevel.Independent;

function levelFromAttempt(a: Attempt): MasteryLevel {
  if (a.correctness === 'correct') {
    if (a.hintLevel === 0) return MasteryLevel.Independent;
    if (a.hintLevel <= 3) return MasteryLevel.Assisted;
    return MasteryLevel.Recognised;
  }
  // Błąd rozpoznany jako typowy znaczy, że uczeń zna schemat, ale go myli.
  if (a.errorId !== null) return MasteryLevel.Recognised;
  return MasteryLevel.Unknown;
}

const CONFIDENCE_SCORE: Record<Attempt['confidence'], number> = {
  guess: 0,
  partial: 0.5,
  sure: 1,
};

/**
 * Prog nadmiernej pewnosci.
 *
 * Musi byc wyzszy niz 0,5, bo „czesciowo wiem" jest wartoscia DOMYSLNA
 * w arenie. Przy nizszym progu kazda bledna odpowiedz ucznia, ktory nie
 * dotknal suwaka pewnosci, trafialaby na te liste i uczynilaby ja bezuzyteczna.
 * Flagujemy wylacznie deklaracje „jestem pewny" przy niepoprawnym wyniku.
 */
export const OVERCONFIDENCE_THRESHOLD = 0.75;

// ---------------------------------------------------------------------------
// Raport
// ---------------------------------------------------------------------------

export interface TopicGap {
  topicId: string;
  topicName: string;
  /** Średni oszacowany poziom w dziale, 0..5. */
  averageLevel: number;
  /** Ile kompetencji w dziale wymaga pracy do poziomu samodzielności. */
  skillsBelowTarget: number;
  skillsTotal: number;
  /** Waga maturalna działu — średnia z jego kompetencji. */
  examValue: number;
  /** Priorytet działu: luka pomnożona przez wartość maturalną, 0..1. */
  priority: number;
}

export interface DiagnosticReport {
  completedAt: number;
  skills: SkillDiagnosis[];
  topics: TopicGap[];
  /** Ile sond zostało wykonanych z ilu zaplanowanych. */
  probesAnswered: number;
  probesTotal: number;
  /** Ile kompetencji uczeń rozwiązał samodzielnie. */
  independentCount: number;
  /**
   * Kompetencje, w których uczeń był pewny i pomylił się. To one najczęściej
   * psują wynik arkusza, bo uczeń ich nie sprawdza.
   */
  overconfident: SkillDiagnosis[];
}

export function analyseDiagnostic(
  attempts: Attempt[],
  skills: Skill[],
  topics: Topic[],
  now: number,
): DiagnosticReport {
  // Dla każdej kompetencji bierzemy ostatnią próbę — powtórzona diagnoza
  // ma zastępować poprzednią, a nie uśredniać się z nią.
  const lastBySkill = new Map<string, Attempt>();
  for (const a of [...attempts].sort((x, y) => x.answeredAt - y.answeredAt)) {
    lastBySkill.set(a.skillId, a);
  }

  const diagnoses: SkillDiagnosis[] = skills.map((skill) => {
    const a = lastBySkill.get(skill.id);
    if (!a) {
      return {
        skillId: skill.id,
        skillName: skill.name,
        topicId: skill.topicId,
        estimatedLevel: MasteryLevel.Unknown,
        probed: false,
        errorId: null,
        confidenceGap: 0,
      };
    }

    const level = levelFromAttempt(a);
    const correctScore = a.correctness === 'correct' ? 1 : 0;
    return {
      skillId: skill.id,
      skillName: skill.name,
      topicId: skill.topicId,
      estimatedLevel: level,
      probed: true,
      errorId: a.errorId,
      confidenceGap: CONFIDENCE_SCORE[a.confidence] - correctScore,
    };
  });

  const byTopic = new Map<string, SkillDiagnosis[]>();
  for (const d of diagnoses) {
    const bucket = byTopic.get(d.topicId);
    if (bucket) bucket.push(d);
    else byTopic.set(d.topicId, [d]);
  }

  const examValueOf = new Map(skills.map((s) => [s.id, s.examValue]));

  const gaps: TopicGap[] = topics
    .filter((t) => byTopic.has(t.id))
    .map((t) => {
      const members = byTopic.get(t.id) ?? [];
      const avg = members.reduce((s, m) => s + m.estimatedLevel, 0) / members.length;
      const below = members.filter((m) => m.estimatedLevel < DIAGNOSTIC_CEILING).length;
      const value =
        members.reduce((s, m) => s + (examValueOf.get(m.skillId) ?? 0), 0) / members.length;
      const luka = (DIAGNOSTIC_CEILING - avg) / DIAGNOSTIC_CEILING;

      return {
        topicId: t.id,
        topicName: t.name,
        averageLevel: avg,
        skillsBelowTarget: below,
        skillsTotal: members.length,
        examValue: value,
        priority: clamp01(luka) * value,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  return {
    completedAt: now,
    skills: diagnoses,
    topics: gaps,
    probesAnswered: diagnoses.filter((d) => d.probed).length,
    probesTotal: diagnoses.length,
    independentCount: diagnoses.filter((d) => d.estimatedLevel >= DIAGNOSTIC_CEILING).length,
    overconfident: diagnoses
      .filter((d) => d.probed && d.confidenceGap >= OVERCONFIDENCE_THRESHOLD)
      .sort((a, b) => b.confidenceGap - a.confidenceGap),
  };
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export type PlanVariant = 'minimum' | 'realistic' | 'ambitious';

export interface VariantProfile {
  id: PlanVariant;
  name: string;
  /** Docelowy poziom dla kompetencji o wysokiej wadze maturalnej. */
  targetHigh: MasteryLevel;
  /** Docelowy poziom dla pozostałych kompetencji. */
  targetRest: MasteryLevel;
  /** Ile sesji w tygodniu zakłada ten wariant. */
  sessionsPerWeek: number;
  /** Czego ten wariant świadomie NIE obiecuje. */
  tradeoff: string;
}

/** Od jakiej wartości maturalnej kompetencja jest traktowana jako kluczowa. */
export const HIGH_VALUE_THRESHOLD = 0.75;

export const VARIANTS: Record<PlanVariant, VariantProfile> = {
  minimum: {
    id: 'minimum',
    name: 'Minimum',
    targetHigh: MasteryLevel.Independent,
    targetRest: MasteryLevel.Assisted,
    sessionsPerWeek: 3,
    tradeoff:
      'Domykasz kluczowe kompetencje do samodzielności. Transferu i zadań nietypowych ten wariant nie obejmuje.',
  },
  realistic: {
    id: 'realistic',
    name: 'Realistyczny',
    targetHigh: MasteryLevel.Transfer,
    targetRest: MasteryLevel.Independent,
    sessionsPerWeek: 5,
    tradeoff:
      'Kluczowe kompetencje do transferu, reszta do samodzielności. Utrwalenie po odroczeniu tylko tam, gdzie starczy czasu.',
  },
  ambitious: {
    id: 'ambitious',
    name: 'Ambitny',
    targetHigh: MasteryLevel.Retained,
    targetRest: MasteryLevel.Transfer,
    sessionsPerWeek: 6,
    tradeoff:
      'Pełne utrwalenie kluczowych kompetencji. Wymaga regularności — przy mniejszej liczbie sesji plan się rozjedzie.',
  },
};

export interface PlanStep {
  skillId: string;
  skillName: string;
  topicName: string;
  fromLevel: MasteryLevel;
  targetLevel: MasteryLevel;
  /** Szacowana liczba misji potrzebnych na domknięcie luki. */
  estimatedMissions: number;
  /** Dlaczego ta kompetencja stoi w tym miejscu kolejki. */
  reason: string;
}

export interface StudyPlan {
  variant: VariantProfile;
  steps: PlanStep[];
  totalMissions: number;
  /** Szacowana liczba tygodni przy deklarowanym tempie wariantu. */
  estimatedWeeks: number;
  /** Czy plan mieści się do wskazanego terminu. */
  fitsDeadline: boolean | null;
  /** Zdanie opisujące realizm planu — bez obietnic bez pokrycia. */
  verdict: string;
}

/** Ile misji średnio zajmuje podniesienie kompetencji o jeden poziom. */
export const MISSIONS_PER_LEVEL = 2;

/**
 * Buduje plan wyłącznie z raportu diagnostycznego.
 *
 * Sygnatura jest tu częścią kontraktu: nie ma parametru z samooceną ucznia.
 * Jedyne wejścia to zmierzone wyniki, wybrany wariant i ewentualny termin.
 */
export function buildPlan(
  report: DiagnosticReport,
  skills: Skill[],
  topics: Topic[],
  variant: PlanVariant,
  deadline: number | null = null,
): StudyPlan {
  const profile = VARIANTS[variant];
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const topicName = new Map(topics.map((t) => [t.id, t.name]));
  const topicPriority = new Map(report.topics.map((t) => [t.topicId, t.priority]));

  const steps: PlanStep[] = report.skills
    .map((d) => {
      const skill = skillById.get(d.skillId);
      if (!skill) return null;

      const target =
        skill.examValue >= HIGH_VALUE_THRESHOLD ? profile.targetHigh : profile.targetRest;
      if (d.estimatedLevel >= target) return null;

      const missions = (target - d.estimatedLevel) * MISSIONS_PER_LEVEL;

      return {
        skillId: d.skillId,
        skillName: d.skillName,
        topicName: topicName.get(d.topicId) ?? d.topicId,
        fromLevel: d.estimatedLevel,
        targetLevel: target,
        estimatedMissions: missions,
        reason: reasonFor(d, skill, target),
        // Klucz sortowania trzymamy poza interfejsem publicznym.
        _sort:
          (topicPriority.get(d.topicId) ?? 0) * 0.6 +
          skill.examValue * 0.3 +
          ((target - d.estimatedLevel) / MasteryLevel.Retained) * 0.1,
      };
    })
    .filter((s): s is PlanStep & { _sort: number } => s !== null)
    .sort((a, b) => b._sort - a._sort)
    .map(({ _sort: _drop, ...step }) => step);

  const totalMissions = steps.reduce((s, x) => s + x.estimatedMissions, 0);
  const estimatedWeeks =
    profile.sessionsPerWeek > 0
      ? globalThis.Math.ceil(totalMissions / profile.sessionsPerWeek)
      : 0;

  const weeksAvailable =
    deadline === null
      ? null
      : globalThis.Math.max(0, (deadline - report.completedAt) / (7 * 86_400_000));

  const fitsDeadline = weeksAvailable === null ? null : estimatedWeeks <= weeksAvailable;

  return {
    variant: profile,
    steps,
    totalMissions,
    estimatedWeeks,
    fitsDeadline,
    verdict: verdictFor(steps.length, estimatedWeeks, weeksAvailable, fitsDeadline),
  };
}

function reasonFor(d: SkillDiagnosis, skill: Skill, target: MasteryLevel): string {
  if (!d.probed) return 'Nie sprawdzona w diagnozie — zaczynamy od rozpoznania.';
  if (d.confidenceGap >= OVERCONFIDENCE_THRESHOLD) {
    return 'Pewność nie pokryła się z wynikiem — ta kompetencja najłatwiej zaskoczy na arkuszu.';
  }
  if (d.errorId !== null) return 'Diagnoza ujawniła powtarzalny błąd do naprawy.';
  if (d.estimatedLevel === MasteryLevel.Unknown) return 'Brak podstaw — zaczynamy od fundamentu.';
  if (skill.examValue >= HIGH_VALUE_THRESHOLD) {
    return `Wysoka waga maturalna, cel: poziom ${target}.`;
  }
  return `Do domknięcia brakuje ${target - d.estimatedLevel} poziomu.`;
}

/**
 * Werdykt mówi wprost, czy plan się mieści. Blueprint sek. 14 zabrania
 * obietnic bez pokrycia, więc przy zbyt krótkim czasie mówimy to otwarcie
 * i wskazujemy lżejszy wariant zamiast udawać, że da się zdążyć.
 */
function verdictFor(
  stepCount: number,
  weeks: number,
  available: number | null,
  fits: boolean | null,
): string {
  if (stepCount === 0) return 'Wszystkie cele tego wariantu są już osiągnięte.';
  if (available === null) {
    return `${stepCount} kompetencji do domknięcia, około ${weeks} tygodni przy zakładanym tempie.`;
  }
  if (fits) {
    return `Plan mieści się w terminie: około ${weeks} z ${globalThis.Math.floor(available)} dostępnych tygodni.`;
  }
  return `Ten wariant nie mieści się w terminie: potrzeba około ${weeks} tygodni, a zostało ${globalThis.Math.floor(available)}. Wybierz lżejszy wariant albo zwiększ liczbę sesji.`;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return globalThis.Math.min(1, globalThis.Math.max(0, n));
}

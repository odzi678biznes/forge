import { MasteryLevel, type Attempt, type Skill, type SkillState } from '@/data/types';
import { REVIEW_INTERVALS_DAYS } from './review';

/**
 * Raport tygodniowy — Blueprint sek. 7.6.
 *
 * Blueprint wymienia dokładnie pięć pytań, na które raport ma odpowiedzieć,
 * i ten moduł odpowiada na każde z nich osobnym polem:
 *
 * 1. czego nauczyłem się samodzielnie,
 * 2. co pamiętam po czasie,
 * 3. gdzie nadal potrzebuję pomocy,
 * 4. co zabierało czas bez efektu,
 * 5. jedna rekomendowana zmiana na kolejny tydzień.
 *
 * Punkt czwarty jest tu najważniejszy i najtrudniejszy: system ma przyznać,
 * że część pracy nie przyniosła efektu, zamiast raportować sam wysiłek.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Ile prób na kompetencji bez awansu uznajemy za czas bez efektu. */
export const STALLED_ATTEMPTS = 4;

/** Od jakiego udziału podpowiedzi mówimy, że kompetencja wymaga pomocy. */
export const HINT_RELIANCE_THRESHOLD = 0.5;

/** Odstęp, po którym poprawna odpowiedź liczy się jako pamięć po czasie. */
export const RETENTION_GAP_DAYS = REVIEW_INTERVALS_DAYS[1];

export interface SkillLine {
  skillId: string;
  skillName: string;
  /** Liczba istotna dla danej sekcji — prób, podpowiedzi albo dni. */
  value: number;
  detail: string;
}

export interface WeeklyReport {
  from: number;
  to: number;
  missionsFinished: number;
  attemptsTotal: number;
  /** 1. Kompetencje rozwiązane samodzielnie po raz pierwszy w tym tygodniu. */
  learnedIndependently: SkillLine[];
  /** 2. Poprawne odpowiedzi po realnym odroczeniu. */
  retained: SkillLine[];
  /** 3. Kompetencje, w których wciąż dominuje drabina pomocy. */
  stillNeedHelp: SkillLine[];
  /** 4. Praca bez efektu: dużo prób, zero awansu. */
  timeWithoutEffect: SkillLine[];
  /** 5. Jedna rekomendowana zmiana — dokładnie jedna, nigdy lista. */
  recommendation: string;
}

export interface WeeklyInput {
  attempts: Attempt[];
  skills: Skill[];
  states: Map<string, SkillState>;
  now: number;
  /** Długość okna raportu w dniach. */
  windowDays?: number;
  /** Misje ukończone w oknie — liczone poza tym modułem. */
  missionsFinished?: number;
}

export function buildWeeklyReport(input: WeeklyInput): WeeklyReport {
  const { attempts, skills, states, now } = input;
  const windowDays = input.windowDays ?? 7;
  const from = now - windowDays * DAY_MS;

  const nameOf = new Map(skills.map((s) => [s.id, s.name]));
  const inWindow = attempts.filter((a) => a.answeredAt >= from);
  const bySkill = groupBy(inWindow, (a) => a.skillId);

  const learnedIndependently: SkillLine[] = [];
  const retained: SkillLine[] = [];
  const stillNeedHelp: SkillLine[] = [];
  const timeWithoutEffect: SkillLine[] = [];

  for (const [skillId, probes] of bySkill) {
    const name = nameOf.get(skillId) ?? skillId;
    const correct = probes.filter((a) => a.correctness === 'correct');
    const independent = correct.filter((a) => a.hintLevel === 0);
    const withHints = probes.filter((a) => a.hintLevel > 0);
    const state = states.get(skillId);

    // 1. Samodzielność: kompetencja jest dziś na poziomie 3+ i w oknie
    //    pojawiła się poprawna odpowiedź bez pomocy.
    if (independent.length > 0 && (state?.level ?? 0) >= MasteryLevel.Independent) {
      learnedIndependently.push({
        skillId,
        skillName: name,
        value: independent.length,
        detail:
          independent.length === 1
            ? 'Jedno zadanie bez pomocy.'
            : `${independent.length} zadania bez pomocy.`,
      });
    }

    // 2. Pamięć po czasie: poprawnie, bez pomocy, po realnej przerwie
    //    od poprzedniej próby tej samej kompetencji.
    const gap = longestRetentionGap(attempts, skillId, from);
    if (gap !== null && gap >= RETENTION_GAP_DAYS) {
      retained.push({
        skillId,
        skillName: name,
        value: globalThis.Math.round(gap),
        detail: `Poprawnie po ${globalThis.Math.round(gap)} dniach przerwy.`,
      });
    }

    // 3. Wciąż potrzebna pomoc: podpowiedzi dominują w tym tygodniu.
    const reliance = probes.length === 0 ? 0 : withHints.length / probes.length;
    if (probes.length >= 2 && reliance >= HINT_RELIANCE_THRESHOLD) {
      stillNeedHelp.push({
        skillId,
        skillName: name,
        value: globalThis.Math.round(reliance * 100),
        detail: `Podpowiedzi w ${globalThis.Math.round(reliance * 100)}% prób.`,
      });
    }

    // 4. Czas bez efektu: dużo prób, a poziom stoi w miejscu.
    //    Poziom sprzed okna odtwarzamy z tego, że awans zapisuje levelReachedAt.
    const advancedInWindow = (state?.levelReachedAt ?? 0) >= from;
    if (probes.length >= STALLED_ATTEMPTS && !advancedInWindow) {
      timeWithoutEffect.push({
        skillId,
        skillName: name,
        value: probes.length,
        detail: `${probes.length} prób, poziom bez zmiany.`,
      });
    }
  }

  const sortByValue = (a: SkillLine, b: SkillLine) => b.value - a.value;

  return {
    from,
    to: now,
    missionsFinished: input.missionsFinished ?? 0,
    attemptsTotal: inWindow.length,
    learnedIndependently: learnedIndependently.sort(sortByValue),
    retained: retained.sort(sortByValue),
    stillNeedHelp: stillNeedHelp.sort(sortByValue),
    timeWithoutEffect: timeWithoutEffect.sort(sortByValue),
    recommendation: recommend({
      attempts: inWindow,
      learned: learnedIndependently,
      stalled: timeWithoutEffect,
      needHelp: stillNeedHelp,
      retained,
    }),
  };
}

/**
 * Dokładnie jedna rekomendacja.
 *
 * Blueprint sek. 7.6 mówi o „jednej rekomendowanej zmianie". Lista zaleceń
 * jest łatwiejsza do wygenerowania i bezużyteczna do wykonania — dlatego
 * ta funkcja zwraca string, a nie tablicę, i kolejność warunków jest
 * priorytetem, a nie przypadkiem.
 */
function recommend(x: {
  attempts: Attempt[];
  learned: SkillLine[];
  stalled: SkillLine[];
  needHelp: SkillLine[];
  retained: SkillLine[];
}): string {
  if (x.attempts.length === 0) {
    return 'W tym tygodniu nie było prób. Zacznij od jednej krótkiej misji — próg wejścia jest ważniejszy niż długość sesji.';
  }

  const stalled = x.stalled[0];
  if (stalled) {
    return `Najwięcej czasu bez efektu poszło na „${stalled.skillName}" (${stalled.value} prób bez awansu). W kolejnym tygodniu zacznij tę kompetencję od zadania fundamentalnego, zamiast powtarzać ten sam poziom.`;
  }

  const help = x.needHelp[0];
  if (help) {
    return `„${help.skillName}" działa głównie z podpowiedziami (${help.value}% prób). Spróbuj raz rozwiązać ją bez drabiny pomocy — nawet nieudana próba jest lepszym pomiarem niż kolejne zadanie z podpowiedzią.`;
  }

  if (x.retained.length === 0 && x.learned.length > 0) {
    return 'Materiał wchodzi, ale w tym tygodniu nie było odroczonych powtórek. Zostaw kolejce powtórek czas na zadziałanie — nie przerabiaj tego samego dnia tego, co już umiesz.';
  }

  if (x.learned.length === 0) {
    return 'W tym tygodniu żadna kompetencja nie doszła do samodzielności. Zamiast poszerzać zakres, domknij jedną kompetencję do końca.';
  }

  return `Tydzień domknięty: ${x.learned.length} kompetencji samodzielnie. Utrzymaj tempo — nie zwiększaj obciążenia, dopóki powtórki nie zaczną wracać poprawnie.`;
}

/** Najdłuższa przerwa przed poprawną, samodzielną odpowiedzią w oknie. */
function longestRetentionGap(
  attempts: Attempt[],
  skillId: string,
  from: number,
): number | null {
  const ofSkill = attempts
    .filter((a) => a.skillId === skillId)
    .sort((a, b) => a.answeredAt - b.answeredAt);

  let best: number | null = null;
  for (let i = 1; i < ofSkill.length; i += 1) {
    const current = ofSkill[i];
    const previous = ofSkill[i - 1];
    if (!current || !previous) continue;
    if (current.answeredAt < from) continue;
    if (current.correctness !== 'correct' || current.hintLevel !== 0) continue;

    const gap = (current.answeredAt - previous.answeredAt) / DAY_MS;
    if (best === null || gap > best) best = gap;
  }
  return best;
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = out.get(k);
    if (bucket) bucket.push(item);
    else out.set(k, [item]);
  }
  return out;
}

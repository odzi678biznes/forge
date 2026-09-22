import { MasteryLevel, type DayMode, type Mission, type SavedPlan, type Skill, type SkillState } from '@/data/types';
import { isDue } from './review';
import { COMEBACK_THRESHOLD_DAYS } from './mission';

/**
 * Plan dnia i rytm tygodnia — Blueprint sek. 15, Etap 5.
 *
 * Kryterium ukończenia etapu: „opuszczenie trzech dni uruchamia protokół
 * powrotu BEZ PRZECIĄŻANIA kolejnego dnia". To jest tu regułą nadrzędną —
 * sprawdzaną przed trybem dnia, przed powtórkami i przed planem. Nadrabianie
 * zaległości jest jawnie zakazane (sek. 14).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Ile misji dziennie zakłada każdy tryb (sek. 7.1). */
export const MODE_LOAD: Record<DayMode, number> = {
  minimum: 1,
  standard: 2,
  strong: 3,
};

export const MODE_LABELS: Record<DayMode, string> = {
  minimum: 'Minimum',
  standard: 'Standard',
  strong: 'Mocny',
};

export interface DailyPlan {
  mode: DayMode;
  /** Ile misji przewiduje dzisiaj ten plan. */
  missionCount: number;
  /** Kompetencje na dziś, w kolejności. */
  skillIds: string[];
  /** Czy uruchomiono protokół powrotu. */
  comeback: boolean;
  rationale: string;
}

export interface DayInput {
  plan: SavedPlan | null;
  skills: Skill[];
  states: Map<string, SkillState>;
  mode: DayMode;
  /** Ile dni minęło od ostatniej próby; null przy pierwszym uruchomieniu. */
  daysSinceLastSession: number | null;
  now: number;
}

/**
 * Układa dzisiejszy zestaw.
 *
 * Kolejność decyzji jest celowa i nie wolno jej odwrócić:
 * 1. powrót po przerwie (obciążenie ZMNIEJSZONE, nigdy zwiększone),
 * 2. wymagalne powtórki,
 * 3. cele z planu,
 * 4. najsłabsze kompetencje, gdy planu nie ma.
 */
export function planDay(input: DayInput): DailyPlan {
  const { plan, skills, states, mode, daysSinceLastSession, now } = input;

  const due = skills.filter((s) => {
    const st = states.get(s.id);
    return st ? isDue(st, now) : false;
  });

  // 1. Protokół powrotu. Obciążenie jest obcięte do jednej misji niezależnie
  //    od trybu — to jest cała treść kryterium „bez przeciążania".
  if (daysSinceLastSession !== null && daysSinceLastSession >= COMEBACK_THRESHOLD_DAYS) {
    const wejscie = due[0] ?? weakest(skills, states);
    return {
      mode,
      missionCount: 1,
      skillIds: wejscie ? [wejscie.id] : [],
      comeback: true,
      rationale: `Przerwa ${daysSinceLastSession} dni. Jedna misja na wejście — zaległości nie są doliczane.`,
    };
  }

  const load = MODE_LOAD[mode];

  // 2. Powtórki mają pierwszeństwo przed nowym materiałem.
  const fromReviews = due.slice(0, load).map((s) => s.id);

  // 3. Cele z planu, pominąwszy te już zaplanowane jako powtórki.
  const planned = (plan?.targets ?? [])
    .filter((t) => (states.get(t.skillId)?.level ?? MasteryLevel.Unknown) < t.targetLevel)
    .map((t) => t.skillId)
    .filter((id) => !fromReviews.includes(id));

  const fallback = skills
    .map((s) => s.id)
    .filter((id) => !fromReviews.includes(id) && !planned.includes(id));

  const skillIds = [...fromReviews, ...planned, ...fallback].slice(0, load);

  return {
    mode,
    missionCount: load,
    skillIds,
    comeback: false,
    rationale: rationaleFor(fromReviews.length, planned.length, plan !== null, load),
  };
}

function rationaleFor(
  reviews: number,
  planned: number,
  hasPlan: boolean,
  load: number,
): string {
  const parts: string[] = [];
  if (reviews > 0) {
    parts.push(
      reviews === 1 ? 'Jedna powtórka wymagalna.' : `${reviews} powtórki wymagalne.`,
    );
  }
  if (planned > 0 && hasPlan) parts.push('Reszta z celów planu.');
  if (!hasPlan) parts.push('Bez planu — kolejność wyznacza bieżąca luka.');
  parts.push(load === 1 ? 'Jedna misja na dziś.' : `${load} misje na dziś.`);
  return parts.join(' ');
}

function weakest(skills: Skill[], states: Map<string, SkillState>): Skill | undefined {
  return [...skills].sort((a, b) => {
    const la = states.get(a.id)?.level ?? MasteryLevel.Unknown;
    const lb = states.get(b.id)?.level ?? MasteryLevel.Unknown;
    if (la !== lb) return la - lb;
    return b.examValue - a.examValue;
  })[0];
}

// ---------------------------------------------------------------------------
// Rytm tygodnia
// ---------------------------------------------------------------------------

/**
 * Blueprint sek. 4.4: nie stosujemy kruchego licznika „dzień po dniu".
 * Pokazujemy rytm tygodnia, a dwa dni buforowe są NORMALNYM elementem
 * systemu, nie porażką.
 */
export const PLANNED_DAYS_PER_WEEK = 5;
export const BUFFER_DAYS_PER_WEEK = 7 - PLANNED_DAYS_PER_WEEK;

export interface WeekRhythm {
  /** Dni z co najmniej jedną ukończoną misją w ostatnich 7 dniach. */
  activeDays: number;
  plannedDays: number;
  /** Ile dni buforowych pozostało — zawsze nieujemne. */
  bufferLeft: number;
  /** Czy tydzień jest domknięty zgodnie z rytmem. */
  onTrack: boolean;
  /** Zdanie bez presji i bez zawstydzania. */
  note: string;
}

export function weekRhythm(missions: Mission[], now: number): WeekRhythm {
  const from = now - 7 * DAY_MS;

  const days = new Set(
    missions
      .filter((m) => m.finishedAt !== null && m.startedAt >= from)
      .map((m) => new Date(m.startedAt).toDateString()),
  );

  const activeDays = days.size;
  const onTrack = activeDays >= PLANNED_DAYS_PER_WEEK;
  const bufferLeft = globalThis.Math.max(
    0,
    BUFFER_DAYS_PER_WEEK - globalThis.Math.max(0, PLANNED_DAYS_PER_WEEK - activeDays),
  );

  return {
    activeDays,
    plannedDays: PLANNED_DAYS_PER_WEEK,
    bufferLeft,
    onTrack,
    note: rhythmNote(activeDays, onTrack, bufferLeft),
  };
}

/**
 * Komunikat rytmu nigdy nie straszy i nie mówi o „stracie serii".
 * Blueprint sek. 14 zakazuje kar za przerwanie i gry na lęku przed stratą.
 */
function rhythmNote(activeDays: number, onTrack: boolean, bufferLeft: number): string {
  if (activeDays === 0) return 'W tym tygodniu jeszcze nie zaczynałeś.';
  if (onTrack) return `Rytm tygodnia domknięty: ${activeDays} z ${PLANNED_DAYS_PER_WEEK} dni.`;
  if (bufferLeft > 0) {
    return `${activeDays} z ${PLANNED_DAYS_PER_WEEK} dni. Dni buforowe w zapasie: ${bufferLeft}.`;
  }
  return `${activeDays} z ${PLANNED_DAYS_PER_WEEK} dni. Bufor wykorzystany — to nadal jest tydzień pracy, nie zerowy wynik.`;
}

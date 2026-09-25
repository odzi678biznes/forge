import type { DayMode } from '@/data/types';

/**
 * Kalendarz kursu: cały materiał rozłożony do terminu.
 *
 * Dwie zasady, których ten moduł pilnuje:
 *
 * 1. Plan liczy się od DZIŚ, za każdym razem od nowa. Opuszczony dzień nie
 *    zostawia "długu" dopisanego do jutra - pozostały materiał rozkłada się
 *    równo na pozostałe dni (sek. 14: żadnego nadrabiania zaległości).
 * 2. Dzień nigdy nie dostaje więcej, niż mieści tryb dnia. Jeśli materiału
 *    jest za dużo, plan mówi uczciwie, kiedy skończysz przy tym tempie
 *    i który tryb zmieściłby się w terminie - zamiast upychać.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Minuty dziennie na przedmiot w danym trybie dnia. */
export const MODE_MINUTES: Record<DayMode, number> = {
  minimum: 30,
  standard: 60,
  strong: 90,
};

/**
 * Część dnia zarezerwowana na powtórki i fiszki. Nowy materiał bez powtórek
 * znika w tydzień - "ciągle powtarzamy" jest wpisane w plan, a nie dodane.
 */
export const REVIEW_SHARE = 0.3;

/** Ćwiczenia po lekcji do poziomu samodzielności - szacunek w minutach. */
export const PRACTICE_MINUTES = 25;

/** Domyślnie niedziela bez nowego materiału - dzień buforowy (sek. 4.4). */
export const DEFAULT_REST_WEEKDAYS = [0];

// ---------------------------------------------------------------------------
// Daty lokalne jako 'RRRR-MM-DD'
// ---------------------------------------------------------------------------

export function dayKey(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, n: number): string {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return dayKey(d.getTime());
}

export function weekday(key: string): number {
  return keyToDate(key).getDay();
}

/** Początek dnia (lokalnie) dla danej chwili. */
export function startOfDay(ms: number): number {
  return keyToDate(dayKey(ms)).getTime();
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------

export interface ScheduleItem {
  skillId: string;
  /** Szacowany czas: lekcja + ćwiczenia. */
  minutes: number;
}

export interface ScheduleInput {
  /** Nieprzerobione umiejętności w kolejności kursu. */
  remaining: ScheduleItem[];
  today: string;
  /** Ostatni dzień na przerobienie materiału (włącznie). */
  deadline: string;
  mode: DayMode;
  restWeekdays?: number[];
  /**
   * Minuty materiału, który zostaje w POZOSTAŁYCH przedmiotach. Dzień ma jeden
   * budżet: bez tego każdy przedmiot z osobna "mieściłby się w trybie", a
   * razem wychodziłoby dużo więcej, niż uczeń wybrał.
   */
  otherMinutes?: number;
}

export interface PlannedDay {
  date: string;
  /** Nowe lekcje zaplanowane na ten dzień (może być pusto - wtedy ćwiczenia i powtórki). */
  skillIds: string[];
}

export type ScheduleStatus = 'done' | 'on-track' | 'behind';

export interface Schedule {
  days: PlannedDay[];
  /** Dzień ostatniej zaplanowanej lekcji albo null, gdy nic nie zostało. */
  finishDate: string | null;
  deadline: string;
  /** Dni nauki od dziś do terminu (bez dni buforowych). */
  studyDaysLeft: number;
  /** Minuty nowego materiału dziennie potrzebne, żeby zdążyć. */
  requiredMinutesPerDay: number;
  /** Minuty nowego materiału dziennie, które mieści obecny tryb (część tego przedmiotu). */
  capacityMinutesPerDay: number;
  /** Jak `requiredMinutesPerDay`, ale dla wszystkich przedmiotów razem. */
  combinedMinutesPerDay: number;
  status: ScheduleStatus;
  /** Najlżejszy tryb, który mieści się w terminie; null gdy żaden. */
  modeNeeded: DayMode | null;
  message: string;
}

const capacity = (mode: DayMode) => MODE_MINUTES[mode] * (1 - REVIEW_SHARE);

export function studyDaysBetween(from: string, to: string, rest: number[]): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (!rest.includes(weekday(d))) out.push(d);
  }
  return out;
}

export function buildSchedule(input: ScheduleInput): Schedule {
  const { remaining, today, deadline, mode } = input;
  const rest = input.restWeekdays ?? DEFAULT_REST_WEEKDAYS;
  const studyDays = studyDaysBetween(today, deadline, rest);
  const total = remaining.reduce((sum, r) => sum + r.minutes, 0);
  const other = input.otherMinutes ?? 0;
  const perDay = (minutes: number) => (studyDays.length === 0 ? Infinity : minutes / studyDays.length);
  const combined = perDay(total + other);
  // Budżet dnia dzielony proporcjonalnie do tego, ile materiału zostało.
  const share = total + other > 0 ? total / (total + other) : 1;
  const cap = capacity(mode) * share;

  if (remaining.length === 0) {
    return {
      days: [],
      finishDate: null,
      deadline,
      studyDaysLeft: studyDays.length,
      requiredMinutesPerDay: 0,
      capacityMinutesPerDay: cap,
      combinedMinutesPerDay: combined,
      status: 'done',
      modeNeeded: 'minimum',
      message: 'Cały materiał przerobiony. Teraz szlifowanie: arkusze i powtórki.',
    };
  }

  const required = perDay(total);
  // Tempo równe potrzebnemu - równe dni do samego terminu. Tylko gdy potrzeba
  // więcej, niż mieści tryb, tempo jest obcięte do trybu i termin się przesuwa
  // (wszystkim przedmiotom w tej samej proporcji).
  const pace = Math.min(required, cap);
  const onTrack = combined <= capacity(mode) + 1e-9;

  // Dni nauki od dziś, przedłużone za termin, gdy tempo nie wystarcza.
  const days: PlannedDay[] = [];
  let dayCursor = today;
  const nextStudyDay = (): string => {
    while (rest.includes(weekday(dayCursor))) dayCursor = addDays(dayCursor, 1);
    const d = dayCursor;
    dayCursor = addDays(dayCursor, 1);
    return d;
  };

  // Umiejętność trafia na dzień, w którym zaczyna się jej czas: kolejne lekcje
  // są rozłożone równo, a dzień bez nowej lekcji to dzień ćwiczeń i powtórek.
  let elapsed = 0;
  for (const item of remaining) {
    const index = Math.floor(elapsed / pace + 1e-9);
    while (days.length <= index) days.push({ date: nextStudyDay(), skillIds: [] });
    days[index]?.skillIds.push(item.skillId);
    elapsed += item.minutes;
  }

  const finishDate = days[days.length - 1]?.date ?? null;
  const modeNeeded =
    (['minimum', 'standard', 'strong'] as DayMode[]).find((m) => capacity(m) >= combined - 1e-9) ?? null;

  const all = other > 0;
  const message = onTrack
    ? `Zdążysz do ${formatDay(deadline)}: ok. ${Math.round(required)} min nowego materiału dziennie` +
      (all ? ` z tego przedmiotu (${Math.round(combined)} min ze wszystkich)` : '') +
      ' plus powtórki.'
    : `Przy tym trybie skończysz ${finishDate ? formatDay(finishDate) : 'później'}.` +
      (modeNeeded
        ? ` Tryb „${MODE_NAMES[modeNeeded]}” zmieściłby ${all ? 'wszystkie przedmioty' : 'całość'} w terminie.`
        : ` Żaden tryb nie mieści ${all ? 'wszystkich przedmiotów' : 'całości'} w terminie - warto przesunąć termin albo zacząć od najważniejszych działów.`);

  return {
    days,
    finishDate,
    deadline,
    studyDaysLeft: studyDays.length,
    requiredMinutesPerDay: required,
    capacityMinutesPerDay: cap,
    combinedMinutesPerDay: combined,
    status: onTrack ? 'on-track' : 'behind',
    modeNeeded,
    message,
  };
}

const MODE_NAMES: Record<DayMode, string> = {
  minimum: 'Minimum',
  standard: 'Standard',
  strong: 'Mocny',
};

const MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

export function formatDay(key: string): string {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Ile dni kalendarzowych do terminu (0 = dziś). */
export function daysUntil(today: string, target: string): number {
  return Math.round((keyToDate(target).getTime() - keyToDate(today).getTime()) / DAY);
}

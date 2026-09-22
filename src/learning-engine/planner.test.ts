import { describe, expect, it } from 'vitest';
import {
  MasteryLevel,
  emptySkillState,
  type DayMode,
  type Mission,
  type SavedPlan,
  type SkillState,
} from '@/data/types';
import {
  BUFFER_DAYS_PER_WEEK,
  MODE_LOAD,
  PLANNED_DAYS_PER_WEEK,
  planDay,
  weekRhythm,
} from './planner';
import { COMEBACK_THRESHOLD_DAYS } from './mission';
import { DAY, T0, makeSkill } from './testing';

const skills = [
  makeSkill({ id: 's-1', name: 'Pierwsza', examValue: 0.9 }),
  makeSkill({ id: 's-2', name: 'Druga', examValue: 0.5 }),
  makeSkill({ id: 's-3', name: 'Trzecia', examValue: 0.3 }),
];

function statesOf(over: Record<string, Partial<SkillState>> = {}) {
  return new Map(
    skills.map((s) => [s.id, { ...emptySkillState(s.id), ...(over[s.id] ?? {}) }]),
  );
}

const plan: SavedPlan = {
  id: 'p-1',
  variant: 'realistic',
  createdAt: T0,
  deadline: null,
  targets: [
    { skillId: 's-2', targetLevel: MasteryLevel.Transfer },
    { skillId: 's-3', targetLevel: MasteryLevel.Independent },
  ],
  diagnosisSnapshot: [],
};

const day = (over: Partial<Parameters<typeof planDay>[0]> = {}) =>
  planDay({
    plan,
    skills,
    states: statesOf(),
    mode: 'standard' as DayMode,
    daysSinceLastSession: 0,
    now: T0,
    ...over,
  });

describe('tryby dnia', () => {
  it('kazdy tryb ma wlasne obciazenie', () => {
    expect(day({ mode: 'minimum' }).missionCount).toBe(MODE_LOAD.minimum);
    expect(day({ mode: 'standard' }).missionCount).toBe(MODE_LOAD.standard);
    expect(day({ mode: 'strong' }).missionCount).toBe(MODE_LOAD.strong);
  });

  it('obciazenie rosnie monotonicznie z trybem', () => {
    expect(MODE_LOAD.minimum).toBeLessThan(MODE_LOAD.standard);
    expect(MODE_LOAD.standard).toBeLessThan(MODE_LOAD.strong);
  });

  it('liczba kompetencji na dzis nie przekracza obciazenia', () => {
    for (const mode of ['minimum', 'standard', 'strong'] as DayMode[]) {
      const d = day({ mode });
      expect(d.skillIds.length, mode).toBeLessThanOrEqual(d.missionCount);
    }
  });
});

describe('kryterium etapu: trzy opuszczone dni nie przeciazaja kolejnego', () => {
  it('po progu przerwy obciazenie spada do jednej misji', () => {
    const d = day({ daysSinceLastSession: COMEBACK_THRESHOLD_DAYS, mode: 'strong' });
    expect(d.comeback).toBe(true);
    expect(d.missionCount).toBe(1);
  });

  it('powrot obcina obciazenie nawet w najmocniejszym trybie', () => {
    const normalny = day({ daysSinceLastSession: 0, mode: 'strong' });
    const poPrzerwie = day({ daysSinceLastSession: 10, mode: 'strong' });
    expect(poPrzerwie.missionCount).toBeLessThan(normalny.missionCount);
  });

  it('dluzsza przerwa NIGDY nie zwieksza obciazenia', () => {
    for (const dni of [3, 5, 10, 30, 100]) {
      expect(day({ daysSinceLastSession: dni }).missionCount, `${dni} dni`).toBe(1);
    }
  });

  it('dwa dni przerwy to jeszcze nie powrot', () => {
    const d = day({ daysSinceLastSession: COMEBACK_THRESHOLD_DAYS - 1 });
    expect(d.comeback).toBe(false);
    expect(d.missionCount).toBe(MODE_LOAD.standard);
  });

  it('uzasadnienie powrotu mowi wprost o braku nadrabiania', () => {
    const d = day({ daysSinceLastSession: 5 });
    expect(d.rationale).toMatch(/nie s[aą] doliczane|bez nadrabiania/i);
    expect(d.rationale).not.toMatch(/stracil|kara|nadrob teraz|musisz/i);
  });

  it('powrot nadal wskazuje konkretna kompetencje, a nie pusty ekran', () => {
    expect(day({ daysSinceLastSession: 5 }).skillIds).toHaveLength(1);
  });
});

describe('kolejnosc doboru', () => {
  it('powtorka wymagalna idzie przed celami planu', () => {
    const d = day({
      mode: 'minimum',
      states: statesOf({ 's-1': { level: MasteryLevel.Independent, reviewDueAt: T0 - DAY } }),
    });
    expect(d.skillIds).toEqual(['s-1']);
    expect(d.rationale).toMatch(/powt[oó]rk/i);
  });

  it('bez powtorek bierzemy cele z planu', () => {
    const d = day({ mode: 'minimum' });
    expect(plan.targets.map((t) => t.skillId)).toContain(d.skillIds[0]);
  });

  it('cel juz osiagniety nie trafia na dzisiejsza liste', () => {
    const d = day({
      mode: 'minimum',
      states: statesOf({ 's-2': { level: MasteryLevel.Transfer } }),
    });
    expect(d.skillIds[0]).not.toBe('s-2');
  });

  it('bez planu dzien nadal ma co zaproponowac', () => {
    const d = day({ plan: null, mode: 'standard' });
    expect(d.skillIds.length).toBe(MODE_LOAD.standard);
    expect(d.rationale).toMatch(/bez planu/i);
  });

  it('ta sama kompetencja nie pojawia sie dwa razy tego samego dnia', () => {
    const d = day({
      mode: 'strong',
      states: statesOf({ 's-2': { level: MasteryLevel.Recognised, reviewDueAt: T0 - DAY } }),
    });
    expect(new Set(d.skillIds).size).toBe(d.skillIds.length);
  });
});

describe('rytm tygodnia', () => {
  const mission = (dayOffset: number, finished = true): Mission => ({
    id: `m-${dayOffset}`,
    kind: 'training',
    title: 'Trening',
    rationale: '-',
    questionIds: [],
    startedAt: T0 - dayOffset * DAY,
    finishedAt: finished ? T0 - dayOffset * DAY + 1000 : null,
  });

  it('pusty tydzien nie jest bledem ani nagana', () => {
    const r = weekRhythm([], T0);
    expect(r.activeDays).toBe(0);
    expect(r.note).not.toMatch(/stracil|kara|zmarnowa/i);
  });

  it('liczy DNI, nie misje - dwie misje jednego dnia to jeden dzien', () => {
    const r = weekRhythm([mission(1), { ...mission(1), id: 'm-inna' }], T0);
    expect(r.activeDays).toBe(1);
  });

  it('nieukonczona misja nie liczy sie do rytmu', () => {
    expect(weekRhythm([mission(1, false)], T0).activeDays).toBe(0);
  });

  it('misja sprzed tygodnia nie liczy sie do biezacego okna', () => {
    expect(weekRhythm([mission(10)], T0).activeDays).toBe(0);
  });

  it('domkniety rytm jest rozpoznany', () => {
    const r = weekRhythm([0, 1, 2, 3, 4].map((d) => mission(d)), T0);
    expect(r.onTrack).toBe(true);
    expect(r.activeDays).toBe(PLANNED_DAYS_PER_WEEK);
  });

  it('jeden gorszy dzien zjada bufor, a nie caly wynik', () => {
    const r = weekRhythm([0, 1, 2, 3].map((d) => mission(d)), T0);
    expect(r.onTrack).toBe(false);
    expect(r.bufferLeft).toBe(BUFFER_DAYS_PER_WEEK - 1);
    expect(r.note).toMatch(/bufor/i);
  });

  it('bufor nigdy nie schodzi ponizej zera', () => {
    expect(weekRhythm([], T0).bufferLeft).toBeGreaterThanOrEqual(0);
  });

  it('komunikat rytmu nigdy nie zawstydza', () => {
    for (const dni of [[], [0], [0, 1], [0, 1, 2], [0, 1, 2, 3], [0, 1, 2, 3, 4]]) {
      const r = weekRhythm(dni.map((d) => mission(d)), T0);
      expect(r.note, `${dni.length} dni`).not.toMatch(
        /stracil|kara|zmarnowa|powinienes|zawiodl/i,
      );
    }
  });
});

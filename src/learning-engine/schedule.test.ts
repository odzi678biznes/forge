import { describe, expect, it } from 'vitest';
import {
  MODE_MINUTES,
  REVIEW_SHARE,
  addDays,
  buildSchedule,
  dayKey,
  studyDaysBetween,
  weekday,
  type ScheduleItem,
} from './schedule';

const items = (n: number, minutes = 40): ScheduleItem[] =>
  Array.from({ length: n }, (_, i) => ({ skillId: `s-${i}`, minutes }));

// 2026-09-01 to wtorek.
const START = '2026-09-01';
const DEADLINE = '2027-01-31';

describe('daty lokalne', () => {
  it('dodawanie dni przechodzi przez koniec miesiaca i roku', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('dayKey zwraca lokalna date, nie UTC', () => {
    expect(dayKey(new Date(2026, 8, 1, 23, 30).getTime())).toBe('2026-09-01');
  });

  it('niedziela jest dniem buforowym domyslnie', () => {
    const days = studyDaysBetween('2026-09-06', '2026-09-12', [0]);
    expect(days).not.toContain('2026-09-06');
    expect(days).toHaveLength(6);
    expect(weekday('2026-09-06')).toBe(0);
  });
});

describe('plan kursu do stycznia', () => {
  it('130 umiejetnosci od 1 wrzesnia miesci sie w trybie standard', () => {
    const s = buildSchedule({ remaining: items(130), today: START, deadline: DEADLINE, mode: 'standard' });
    expect(s.status).toBe('on-track');
    expect(s.finishDate! <= DEADLINE).toBe(true);
    expect(s.days.flatMap((d) => d.skillIds)).toHaveLength(130);
  });

  it('kazda umiejetnosc jest zaplanowana dokladnie raz i w kolejnosci kursu', () => {
    const s = buildSchedule({ remaining: items(50), today: START, deadline: DEADLINE, mode: 'standard' });
    expect(s.days.flatMap((d) => d.skillIds)).toEqual(items(50).map((i) => i.skillId));
  });

  it('zaden dzien nie dostaje wiecej, niz miesci tryb', () => {
    const s = buildSchedule({ remaining: items(300), today: START, deadline: DEADLINE, mode: 'standard' });
    const cap = MODE_MINUTES.standard * (1 - REVIEW_SHARE);
    for (const d of s.days) {
      // Lekcja moze zaczac sie na koncu dnia i przejsc na nastepny, ale
      // nowe lekcje jednego dnia nie przekraczaja trybu o wiecej niz jedna.
      expect(d.skillIds.length * 40, d.date).toBeLessThanOrEqual(cap + 40);
    }
  });

  it('za duzo materialu - plan mowi uczciwie, kiedy skonczysz, zamiast upychac', () => {
    const s = buildSchedule({ remaining: items(300), today: START, deadline: DEADLINE, mode: 'standard' });
    expect(s.status).toBe('behind');
    expect(s.finishDate! > DEADLINE).toBe(true);
    expect(s.message).toMatch(/skończysz/);
  });

  it('wskazuje najlzejszy tryb, ktory miesci sie w terminie', () => {
    const s = buildSchedule({ remaining: items(120), today: START, deadline: DEADLINE, mode: 'minimum' });
    expect(s.status).toBe('behind');
    expect(s.modeNeeded).toBe('standard');
  });

  it('opuszczone dni nie sa doliczane do jutra - reszta rozklada sie rowno', () => {
    const early = buildSchedule({ remaining: items(100), today: START, deadline: DEADLINE, mode: 'strong' });
    // Dwa tygodnie przerwy, nic nie przerobione: plan liczy sie od nowa.
    const later = buildSchedule({ remaining: items(100), today: '2026-09-15', deadline: DEADLINE, mode: 'strong' });
    const firstDayLoad = (s: typeof early) => s.days[0]?.skillIds.length ?? 0;
    expect(firstDayLoad(later)).toBeLessThanOrEqual(firstDayLoad(early) + 1);
    expect(later.requiredMinutesPerDay).toBeGreaterThan(early.requiredMinutesPerDay);
  });

  it('dzien buforowy nie dostaje nowych lekcji', () => {
    const s = buildSchedule({ remaining: items(100), today: START, deadline: DEADLINE, mode: 'standard' });
    for (const d of s.days) expect(weekday(d.date), d.date).not.toBe(0);
  });

  it('nic nie zostalo - faza szlifowania', () => {
    const s = buildSchedule({ remaining: [], today: START, deadline: DEADLINE, mode: 'standard' });
    expect(s.status).toBe('done');
    expect(s.days).toEqual([]);
  });

  it('przy wolnym tempie sa dni bez nowej lekcji - na cwiczenia i powtorki', () => {
    const s = buildSchedule({ remaining: items(20), today: START, deadline: DEADLINE, mode: 'standard' });
    expect(s.days.some((d) => d.skillIds.length === 0)).toBe(true);
  });
});

describe('jeden budzet dnia dla wszystkich przedmiotow', () => {
  const base = { today: START, deadline: DEADLINE, mode: 'standard' as const };

  it('przedmiot miesci sie sam, ale nie razem z innymi - plan mowi to wprost', () => {
    const alone = buildSchedule({ ...base, remaining: items(100) });
    expect(alone.status).toBe('on-track');
    const together = buildSchedule({ ...base, remaining: items(100), otherMinutes: 3000 });
    expect(together.status).toBe('behind');
    expect(together.modeNeeded).toBe('strong');
    expect(together.message).toMatch(/wszystkie przedmioty/);
    expect(together.finishDate! > DEADLINE).toBe(true);
  });

  it('za malo czasu - wszystkie przedmioty zwalniaja w tej samej proporcji', () => {
    // 4000 + 4000 min i 2000 + 6000 min: ta sama suma, wiec ten sam koniec.
    const a = buildSchedule({ ...base, remaining: items(100), otherMinutes: 4000 });
    const b = buildSchedule({ ...base, remaining: items(50), otherMinutes: 6000 });
    const gap = Math.abs(studyDaysBetween(START, a.finishDate!, []).length - studyDaysBetween(START, b.finishDate!, []).length);
    expect(gap).toBeLessThanOrEqual(3);
  });

  it('gdy razem sie miesci - tempo bez zmian, a komunikat podaje sume', () => {
    const alone = buildSchedule({ ...base, remaining: items(50) });
    const together = buildSchedule({ ...base, remaining: items(50), otherMinutes: 1000 });
    expect(together.status).toBe('on-track');
    expect(together.days).toEqual(alone.days);
    expect(together.combinedMinutesPerDay).toBeGreaterThan(together.requiredMinutesPerDay);
    expect(together.message).toMatch(/ze wszystkich/);
  });
});

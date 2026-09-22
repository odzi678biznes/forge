import { describe, expect, it } from 'vitest';
import { MasteryLevel, emptySkillState, type Attempt, type SkillState } from '@/data/types';
import {
  HINT_RELIANCE_THRESHOLD,
  RETENTION_GAP_DAYS,
  STALLED_ATTEMPTS,
  buildWeeklyReport,
} from './weekly-report';
import { DAY, T0, makeAttempt, makeSkill } from './testing';

const skills = [
  makeSkill({ id: 's-1', name: 'Pierwsza' }),
  makeSkill({ id: 's-2', name: 'Druga' }),
];

function statesOf(over: Record<string, Partial<SkillState>> = {}) {
  return new Map(
    skills.map((s) => [s.id, { ...emptySkillState(s.id), ...(over[s.id] ?? {}) }]),
  );
}

/** `dni` liczone wstecz od T0. */
const proba = (skillId: string, dni: number, over: Partial<Attempt> = {}) =>
  makeAttempt({
    id: `a-${skillId}-${dni}-${globalThis.Math.random()}`,
    skillId,
    answeredAt: T0 - dni * DAY,
    ...over,
  });

const raport = (attempts: Attempt[], states = statesOf()) =>
  buildWeeklyReport({ attempts, skills, states, now: T0 });

describe('okno raportu', () => {
  it('pusty tydzien daje pusty raport, a nie blad', () => {
    const r = raport([]);
    expect(r.attemptsTotal).toBe(0);
    expect(r.learnedIndependently).toEqual([]);
    expect(r.recommendation).toMatch(/nie by[lł]o pr[oó]b/i);
  });

  it('proby sprzed okna nie wchodza do raportu', () => {
    expect(raport([proba('s-1', 30)]).attemptsTotal).toBe(0);
  });

  it('proby z okna sa liczone', () => {
    expect(raport([proba('s-1', 1), proba('s-1', 2)]).attemptsTotal).toBe(2);
  });
});

describe('1. czego nauczylem sie samodzielnie', () => {
  it('kompetencja na poziomie 3+ z samodzielna poprawna odpowiedzia', () => {
    const r = raport(
      [proba('s-1', 1, { hintLevel: 0, correctness: 'correct' })],
      statesOf({ 's-1': { level: MasteryLevel.Independent } }),
    );
    expect(r.learnedIndependently.map((l) => l.skillId)).toEqual(['s-1']);
  });

  it('poprawna odpowiedz PO PODPOWIEDZI nie liczy sie jako samodzielna', () => {
    const r = raport(
      [proba('s-1', 1, { hintLevel: 2, correctness: 'correct' })],
      statesOf({ 's-1': { level: MasteryLevel.Independent } }),
    );
    expect(r.learnedIndependently).toEqual([]);
  });

  it('niski poziom kompetencji nie trafia na te liste mimo trafienia', () => {
    const r = raport(
      [proba('s-1', 1, { hintLevel: 0, correctness: 'correct' })],
      statesOf({ 's-1': { level: MasteryLevel.Recognised } }),
    );
    expect(r.learnedIndependently).toEqual([]);
  });
});

describe('2. co pamietam po czasie', () => {
  it('poprawna odpowiedz po realnym odroczeniu', () => {
    const r = raport([
      proba('s-1', RETENTION_GAP_DAYS + 2, { correctness: 'correct' }),
      proba('s-1', 1, { correctness: 'correct', hintLevel: 0 }),
    ]);
    expect(r.retained.map((x) => x.skillId)).toEqual(['s-1']);
  });

  it('powtorka tego samego dnia to nie jest pamiec po czasie', () => {
    const r = raport([
      proba('s-1', 1, { correctness: 'correct' }),
      proba('s-1', 1, { correctness: 'correct', hintLevel: 0 }),
    ]);
    expect(r.retained).toEqual([]);
  });

  it('poprawna odpowiedz po odroczeniu, ale z podpowiedzia, nie liczy sie', () => {
    const r = raport([
      proba('s-1', RETENTION_GAP_DAYS + 2, { correctness: 'correct' }),
      proba('s-1', 1, { correctness: 'correct', hintLevel: 3 }),
    ]);
    expect(r.retained).toEqual([]);
  });
});

describe('3. gdzie nadal potrzebuje pomocy', () => {
  it('dominacja podpowiedzi trafia na liste z udzialem procentowym', () => {
    const r = raport([
      proba('s-1', 1, { hintLevel: 2 }),
      proba('s-1', 2, { hintLevel: 1 }),
      proba('s-1', 3, { hintLevel: 0 }),
    ]);
    const linia = r.stillNeedHelp.find((x) => x.skillId === 's-1');
    expect(linia?.value).toBeGreaterThanOrEqual(HINT_RELIANCE_THRESHOLD * 100);
  });

  it('praca bez podpowiedzi nie trafia na te liste', () => {
    const r = raport([
      proba('s-1', 1, { hintLevel: 0 }),
      proba('s-1', 2, { hintLevel: 0 }),
    ]);
    expect(r.stillNeedHelp).toEqual([]);
  });

  it('pojedyncza proba to za malo, zeby orzekac o zaleznosci od pomocy', () => {
    expect(raport([proba('s-1', 1, { hintLevel: 6 })]).stillNeedHelp).toEqual([]);
  });
});

describe('4. co zabieralo czas bez efektu', () => {
  it('duzo prob bez awansu trafia na liste', () => {
    const attempts = Array.from({ length: STALLED_ATTEMPTS }, (_, i) =>
      proba('s-1', i + 1, { correctness: 'incorrect' }),
    );
    const r = raport(attempts, statesOf({ 's-1': { levelReachedAt: T0 - 60 * DAY } }));
    expect(r.timeWithoutEffect.map((x) => x.skillId)).toEqual(['s-1']);
  });

  it('awans w oknie zdejmuje kompetencje z tej listy', () => {
    const attempts = Array.from({ length: STALLED_ATTEMPTS + 2 }, (_, i) =>
      proba('s-1', i + 1, { correctness: 'correct' }),
    );
    const r = raport(attempts, statesOf({ 's-1': { levelReachedAt: T0 - DAY } }));
    expect(r.timeWithoutEffect).toEqual([]);
  });

  it('kilka prob to jeszcze nie jest czas bez efektu', () => {
    const r = raport([proba('s-1', 1), proba('s-1', 2)]);
    expect(r.timeWithoutEffect).toEqual([]);
  });

  it('raport nie ukrywa pracy bez efektu, nawet gdy wysilek byl duzy', () => {
    const attempts = Array.from({ length: 12 }, () =>
      proba('s-1', 1, { correctness: 'incorrect' }),
    );
    const r = raport(attempts, statesOf({ 's-1': { levelReachedAt: null } }));
    expect(r.timeWithoutEffect[0]?.value).toBe(12);
  });
});

describe('5. jedna rekomendowana zmiana', () => {
  const rek = (attempts: Attempt[], states = statesOf()) =>
    raport(attempts, states).recommendation;

  it('jest dokladnie jednym zdaniem tekstu, nie lista', () => {
    const r = raport([proba('s-1', 1)]);
    expect(typeof r.recommendation).toBe('string');
    expect(r.recommendation.length).toBeGreaterThan(20);
  });

  it('czas bez efektu ma pierwszenstwo przed innymi zaleceniami', () => {
    const attempts = Array.from({ length: STALLED_ATTEMPTS }, (_, i) =>
      proba('s-1', i + 1, { correctness: 'incorrect', hintLevel: 6 }),
    );
    expect(rek(attempts, statesOf({ 's-1': { levelReachedAt: null } }))).toMatch(
      /czasu bez efektu/i,
    );
  });

  it('gdy nic nie doszlo do samodzielnosci, zaleca domkniecie jednej kompetencji', () => {
    expect(rek([proba('s-1', 1, { correctness: 'incorrect', hintLevel: 0 })])).toMatch(
      /domknij jedn[aą]/i,
    );
  });

  it('nigdy nie zaleca zwiekszenia obciazenia przy dobrym tygodniu', () => {
    const attempts = [
      proba('s-1', RETENTION_GAP_DAYS + 2, { correctness: 'correct' }),
      proba('s-1', 1, { correctness: 'correct', hintLevel: 0 }),
    ];
    const r = rek(attempts, statesOf({ 's-1': { level: MasteryLevel.Independent } }));
    expect(r).toMatch(/nie zwi[eę]kszaj/i);
  });

  it('zadna rekomendacja nie zawstydza', () => {
    const warianty: Attempt[][] = [
      [],
      [proba('s-1', 1, { correctness: 'incorrect' })],
      Array.from({ length: 8 }, () => proba('s-1', 1, { correctness: 'incorrect' })),
      [proba('s-1', 1, { hintLevel: 5 }), proba('s-1', 2, { hintLevel: 4 })],
    ];
    for (const w of warianty) {
      expect(rek(w)).not.toMatch(/stracil|kara|zmarnowa|powinienes|zawiodl/i);
    }
  });
});

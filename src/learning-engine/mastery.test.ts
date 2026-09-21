import { describe, expect, it } from 'vitest';
import { MasteryLevel } from '@/data/types';
import { applyAttempt, RETENTION_DELAY_DAYS } from './mastery';
import { DAY, T0, makeAttempt, makeQuestion, makeState } from './testing';

describe('awans kompetencji', () => {
  it('0 -> 1 nawet po pelnym rozwiazaniu', () => {
    const { state, transition } = applyAttempt(
      makeState(),
      makeAttempt({ hintLevel: 6 }),
      makeQuestion(),
    );
    expect(state.level).toBe(MasteryLevel.Recognised);
    expect(transition?.to).toBe(MasteryLevel.Recognised);
  });

  it('1 -> 2 po malej wskazowce, ale nie po pelnym rozwiazaniu', () => {
    const base = makeState({ level: MasteryLevel.Recognised });

    const small = applyAttempt(base, makeAttempt({ hintLevel: 2 }), makeQuestion());
    expect(small.state.level).toBe(MasteryLevel.Assisted);

    const full = applyAttempt(base, makeAttempt({ hintLevel: 5 }), makeQuestion());
    expect(full.state.level).toBe(MasteryLevel.Recognised);
    expect(full.transition).toBeNull();
  });

  it('2 -> 3 dopiero po dwoch samodzielnych poprawnych z rzedu', () => {
    const first = applyAttempt(
      makeState({ level: MasteryLevel.Assisted }),
      makeAttempt({ hintLevel: 0 }),
      makeQuestion(),
    );
    expect(first.state.level).toBe(MasteryLevel.Assisted);
    expect(first.state.independentStreak).toBe(1);

    const second = applyAttempt(first.state, makeAttempt({ hintLevel: 0 }), makeQuestion());
    expect(second.state.level).toBe(MasteryLevel.Independent);
  });

  it('podpowiedz zeruje serie samodzielnych odpowiedzi', () => {
    const first = applyAttempt(
      makeState({ level: MasteryLevel.Assisted }),
      makeAttempt({ hintLevel: 0 }),
      makeQuestion(),
    );
    const assisted = applyAttempt(first.state, makeAttempt({ hintLevel: 1 }), makeQuestion());
    expect(assisted.state.independentStreak).toBe(0);
    expect(assisted.state.level).toBe(MasteryLevel.Assisted);
  });

  it('3 -> 4 wylacznie na zadaniu transferowym bez pomocy', () => {
    const base = makeState({ level: MasteryLevel.Independent });

    const typical = applyAttempt(base, makeAttempt(), makeQuestion({ kind: 'typical' }));
    expect(typical.state.level).toBe(MasteryLevel.Independent);

    const transfer = applyAttempt(base, makeAttempt(), makeQuestion({ kind: 'transfer' }));
    expect(transfer.state.level).toBe(MasteryLevel.Transfer);
  });

  it('4 -> 5 tylko po realnym odroczeniu', () => {
    const base = makeState({ level: MasteryLevel.Transfer, levelReachedAt: T0 });

    const tooSoon = applyAttempt(
      base,
      makeAttempt({ answeredAt: T0 + 2 * DAY }),
      makeQuestion(),
    );
    expect(tooSoon.state.level).toBe(MasteryLevel.Transfer);

    const afterDelay = applyAttempt(
      base,
      makeAttempt({ answeredAt: T0 + (RETENTION_DELAY_DAYS + 1) * DAY }),
      makeQuestion(),
    );
    expect(afterDelay.state.level).toBe(MasteryLevel.Retained);
  });

  it('kazdy awans niesie jawne uzasadnienie', () => {
    const { transition } = applyAttempt(makeState(), makeAttempt(), makeQuestion());
    expect(transition?.reason).toMatch(/\S/);
  });
});

describe('cofniecie poziomu', () => {
  it('blad bez pomocy cofa dokladnie o jeden poziom', () => {
    const { state, transition } = applyAttempt(
      makeState({ level: MasteryLevel.Independent }),
      makeAttempt({ correctness: 'incorrect' }),
      makeQuestion(),
    );
    expect(state.level).toBe(MasteryLevel.Assisted);
    expect(transition?.from).toBe(MasteryLevel.Independent);
  });

  it('blad po podpowiedzi nie cofa', () => {
    const { state } = applyAttempt(
      makeState({ level: MasteryLevel.Independent }),
      makeAttempt({ correctness: 'incorrect', hintLevel: 3 }),
      makeQuestion(),
    );
    expect(state.level).toBe(MasteryLevel.Independent);
  });

  it('odpowiedz czesciowa nie cofa', () => {
    const { state } = applyAttempt(
      makeState({ level: MasteryLevel.Independent }),
      makeAttempt({ correctness: 'partial' }),
      makeQuestion(),
    );
    expect(state.level).toBe(MasteryLevel.Independent);
  });

  it('nieudany transfer nie zbija poziomu 3 - fundament dziala', () => {
    const { state } = applyAttempt(
      makeState({ level: MasteryLevel.Independent }),
      makeAttempt({ correctness: 'incorrect' }),
      makeQuestion({ kind: 'transfer' }),
    );
    expect(state.level).toBe(MasteryLevel.Independent);
  });

  it('poziom 1 jest podloga - nie wracamy do stanu nieznanego', () => {
    const { state } = applyAttempt(
      makeState({ level: MasteryLevel.Recognised }),
      makeAttempt({ correctness: 'incorrect' }),
      makeQuestion(),
    );
    expect(state.level).toBe(MasteryLevel.Recognised);
  });
});

describe('czystosc funkcji', () => {
  it('nie mutuje stanu wejsciowego', () => {
    const before = makeState({ level: MasteryLevel.Assisted, independentStreak: 1 });
    const snapshot = structuredClone(before);
    applyAttempt(before, makeAttempt(), makeQuestion());
    expect(before).toEqual(snapshot);
  });

  it('zapisuje blad do okna ostatnich bledow', () => {
    const { state } = applyAttempt(
      makeState(),
      makeAttempt({ correctness: 'incorrect', errorId: 'err-znak' }),
      makeQuestion(),
    );
    expect(state.recentErrors).toEqual(['err-znak']);
  });
});

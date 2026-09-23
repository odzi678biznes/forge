import { describe, expect, it } from 'vitest';
import { validateCorpus } from '../validate';
import { CS_CORPUS, CS_QUESTIONS } from './index';
import { MATH_QUESTIONS, MATH_SKILLS } from '../math/index';

/**
 * Korpus informatyki przechodzi ten sam zestaw reguł co matematyka,
 * plus reguły zadań programistycznych (ukryte testy, kod startowy, który
 * NIE rozwiązuje zadania, brak sprzecznych oczekiwań).
 */
validateCorpus('Informatyka', CS_CORPUS);

describe('Informatyka: rozlacznosc z matematyka', () => {
  it('identyfikatory kompetencji nie koliduja miedzy przedmiotami', () => {
    const math = new Set(MATH_SKILLS.map((s) => s.id));
    for (const s of CS_CORPUS.skills) expect(math.has(s.id), s.id).toBe(false);
  });

  it('identyfikatory pytan i bledow nie koliduja miedzy przedmiotami', () => {
    const mathQ = new Set(MATH_QUESTIONS.map((q) => q.id));
    const mathE = new Set(MATH_QUESTIONS.flatMap((q) => q.commonErrors.map((e) => e.id)));
    for (const q of CS_QUESTIONS) {
      expect(mathQ.has(q.id), q.id).toBe(false);
      for (const e of q.commonErrors) expect(mathE.has(e.id), e.id).toBe(false);
    }
  });

  it('wiekszosc zadan informatyki to zadania programistyczne', () => {
    // Blueprint sek. 8: informatyka ma duzy nacisk na algorytmike
    // i programowanie, a nie tylko na pytania teoretyczne.
    const code = CS_QUESTIONS.filter((q) => q.format === 'code').length;
    expect(code / CS_QUESTIONS.length).toBeGreaterThanOrEqual(0.5);
  });
});

import { describe, expect, it } from 'vitest';
import { validateCorpus } from '../validate';
import { BIZ_CORPUS, BIZ_QUESTIONS } from './index';
import { MATH_QUESTIONS, MATH_SKILLS } from '../math/index';
import { CS_QUESTIONS, CS_SKILLS } from '../cs/index';

/** Biznes i zarządzanie przechodzi ten sam zestaw reguł co pozostałe przedmioty. */
validateCorpus('Biznes i zarządzanie', BIZ_CORPUS);

describe('Biznes i zarzadzanie: rozlacznosc z innymi przedmiotami', () => {
  it('identyfikatory kompetencji nie koliduja', () => {
    const other = new Set([...MATH_SKILLS, ...CS_SKILLS].map((s) => s.id));
    for (const s of BIZ_CORPUS.skills) expect(other.has(s.id), s.id).toBe(false);
  });

  it('identyfikatory pytan i bledow nie koliduja', () => {
    const others = [...MATH_QUESTIONS, ...CS_QUESTIONS];
    const q = new Set(others.map((x) => x.id));
    const e = new Set(others.flatMap((x) => x.commonErrors.map((err) => err.id)));
    for (const x of BIZ_QUESTIONS) {
      expect(q.has(x.id), x.id).toBe(false);
      for (const err of x.commonErrors) expect(e.has(err.id), err.id).toBe(false);
    }
  });

  it('kazda umiejetnosc jest na poziomie rozszerzonym (egzamin tylko PR)', () => {
    for (const s of BIZ_CORPUS.skills) expect(s.level, s.id).toBe('PR');
  });
});

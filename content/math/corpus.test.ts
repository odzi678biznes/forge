import { describe, expect, it } from 'vitest';
import { validateCorpus } from '../validate';
import { MATH_CORPUS, MATH_SKILLS, MATH_TOPICS } from './index';

/**
 * Korpus matematyki przechodzi pełny wspólny zestaw reguł (`content/validate.ts`)
 * i dodatkowo jeden warunek specyficzny dla przedmiotu: pokrycie przekroju,
 * bez którego diagnoza z Etapu 3 nie miałaby czego diagnozować.
 */
validateCorpus('Matematyka', MATH_CORPUS);

describe('Matematyka: gotowosc do diagnozy', () => {
  it('korpus pokrywa przekroj dzialow wymagany przez diagnoze', () => {
    expect(MATH_TOPICS.length).toBeGreaterThanOrEqual(5);
    expect(MATH_SKILLS.length).toBeGreaterThanOrEqual(15);
  });
});

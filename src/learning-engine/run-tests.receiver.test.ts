import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Test regresji: przechwycone funkcje zakresu globalnego muszą być wołane
 * z właściwym odbiorcą.
 *
 * W przeglądarce `structuredClone` wywołane z `this` innym niż zakres
 * globalny rzuca „Illegal invocation". Node tej kontroli nie robi, więc
 * piaskownica, która w przeglądarce odrzucała KAŻDE rozwiązanie (także
 * poprawne), przechodziła wszystkie testy jednostkowe. Tu odtwarzamy
 * przeglądarkowe zachowanie przed załadowaniem modułu.
 */

const original = globalThis.structuredClone;

afterEach(() => {
  globalThis.structuredClone = original;
  vi.resetModules();
});

describe('odbiorca przechwyconych funkcji globalnych', () => {
  it('piaskownica dziala, gdy structuredClone wymaga odbiorcy jak w przegladarce', async () => {
    globalThis.structuredClone = function strict<T>(this: unknown, value: T): T {
      if (this !== undefined && this !== globalThis) {
        throw new TypeError('Illegal invocation');
      }
      return original(value);
    } as typeof structuredClone;

    vi.resetModules();
    const { buildSolution, collectValues } = await import('./run-tests');

    const { solve } = buildSolution('function suma(t){ return t.length; }', 'suma');
    const raw = collectValues(solve!, [[[1, 2, 3]]]);

    expect(raw.values[0]).toEqual({ ok: true, value: 3 });
  });
});

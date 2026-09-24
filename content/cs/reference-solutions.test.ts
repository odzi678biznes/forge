import { describe, expect, it } from 'vitest';
import { executeTests, judge } from '@/learning-engine/code-grading';
import { buildSolution } from '@/learning-engine/run-tests';
import { CS_QUESTIONS } from './index';

/**
 * Rozwiązania referencyjne zadań programistycznych.
 *
 * Walidator korpusu sprawdza, że testy nie są wewnętrznie sprzeczne, ale nie
 * że zadanie DA SIĘ zaliczyć. Pomyłka w oczekiwanym wyniku (np. zły wynik
 * testu ukrytego) oznaczałaby zadanie niemożliwe do zaliczenia — uczeń
 * dostawałby „źle" za poprawny kod i nie miałby jak się tego dowiedzieć.
 *
 * Każde rozwiązanie przechodzi przez DOKŁADNIE ten sam grader, który ocenia
 * ucznia w aplikacji (`run-tests.ts` + `judge`).
 */
const REFERENCE: Record<string, string> = {
  sumaDodatnich: `
    function sumaDodatnich(t) {
      let s = 0;
      for (const x of t) if (x > 0) s += x;
      return s;
    }`,
  maksimum: `
    function maksimum(t) {
      if (t.length === 0) return null;
      let m = t[0];
      for (let i = 1; i < t.length; i++) if (t[i] > m) m = t[i];
      return m;
    }`,
  drugieNajwieksze: `
    function drugieNajwieksze(t) {
      let pierwsze = null, drugie = null;
      for (const x of t) {
        if (pierwsze === null || x > pierwsze) {
          if (pierwsze !== null) drugie = pierwsze;
          pierwsze = x;
        } else if (x !== pierwsze && (drugie === null || x > drugie)) {
          drugie = x;
        }
      }
      return drugie;
    }`,
  wyszukajBinarnie: `
    function wyszukajBinarnie(t, x) {
      let l = 0, p = t.length - 1;
      while (l <= p) {
        const s = Math.floor((l + p) / 2);
        if (t[s] === x) return s;
        if (t[s] < x) l = s + 1; else p = s - 1;
      }
      return -1;
    }`,
  czyPosortowana: `
    function czyPosortowana(t) {
      for (let i = 0; i + 1 < t.length; i++) if (t[i + 1] < t[i]) return false;
      return true;
    }`,
  scalPosortowane: `
    function scalPosortowane(a, b) {
      const w = [];
      let i = 0, j = 0;
      while (i < a.length && j < b.length) w.push(a[i] <= b[j] ? a[i++] : b[j++]);
      while (i < a.length) w.push(a[i++]);
      while (j < b.length) w.push(b[j++]);
      return w;
    }`,
  nwd: `
    function nwd(a, b) {
      while (b !== 0) { const r = a % b; a = b; b = r; }
      return a;
    }`,
  czyPierwsza: `
    function czyPierwsza(n) {
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
      return true;
    }`,
  naDwojkowy: `
    function naDwojkowy(n) {
      if (n === 0) return '0';
      let s = '';
      while (n > 0) { s = (n % 2) + s; n = Math.floor(n / 2); }
      return s;
    }`,
};

// Zadania w Pythonie sprawdza python.test.ts - tu tylko JavaScript.
const codeQuestions = CS_QUESTIONS.filter((q) => q.format === 'code' && q.code?.language !== 'python');

describe('rozwiazania referencyjne', () => {
  it('kazde zadanie programistyczne ma rozwiazanie referencyjne', () => {
    for (const q of codeQuestions) {
      const name = q.code?.functionName ?? '';
      expect(REFERENCE[name], `${q.id}: brak rozwiazania dla ${name}`).toBeDefined();
    }
  });

  for (const q of codeQuestions) {
    const code = q.code;
    if (!code) continue;

    it(`${q.id} (${code.functionName}) da sie zaliczyc - wszystkie testy, w tym ukryte`, () => {
      const source = REFERENCE[code.functionName] ?? '';
      const { solve, error } = buildSolution(source, code.functionName);
      expect(error).toBeNull();
      if (!solve) return;

      const verdict = judge(executeTests(solve, code.tests));
      expect(verdict.allPassed, `${q.id}: ${verdict.summary}`).toBe(true);
    });
  }

  it('kazde rozwiazanie referencyjne dotyczy istniejacego zadania', () => {
    // Osierocone rozwiazanie znaczy, ze zadanie zmienilo nazwe funkcji.
    const names = new Set(codeQuestions.map((q) => q.code?.functionName));
    for (const name of Object.keys(REFERENCE)) {
      expect(names.has(name), `osierocone rozwiazanie: ${name}`).toBe(true);
    }
  });
});

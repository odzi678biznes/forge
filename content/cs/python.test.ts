import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { describePython, gradeRun, judge } from '@/learning-engine/code-grading';
import { runPythonTests } from '@/features/code/python-harness';
import { CS_QUESTIONS } from './index';

/**
 * Zadania w Pythonie sprawdzane tym samym interpreterem i tym samym
 * graderem, który ocenia ucznia w aplikacji.
 *
 * Pomyłka w oczekiwanym wyniku testu ukrytego oznaczałaby zadanie niemożliwe
 * do zaliczenia - uczeń dostawałby „źle” za poprawny kod. Dlatego każde
 * zadanie ma wzorcowe rozwiązanie i MUSI ono przechodzić wszystkie testy.
 */

const PYTHON = CS_QUESTIONS.filter((q) => q.code?.language === 'python');

let py: PyodideAPI;
beforeAll(async () => {
  py = await loadPyodide({ indexURL: import.meta.env.PYODIDE_INDEX_URL });
}, 60_000);

function run(source: string, q: (typeof PYTHON)[number]) {
  const task = q.code!;
  const raw = runPythonTests(py, source, task.functionName, task.tests.map((t) => t.input));
  return { run: gradeRun(task.tests, raw, describePython), raw };
}

describe('Informatyka: zadania w Pythonie', () => {
  it('kazde zadanie w Pythonie ma wzorcowe rozwiazanie', () => {
    for (const q of PYTHON) expect(q.code?.modelSolution?.trim(), q.id).toBeTruthy();
  });

  it('wzorcowe rozwiazanie przechodzi wszystkie testy (jawne i ukryte)', () => {
    for (const q of PYTHON) {
      const { run: result, raw } = run(q.code!.modelSolution!, q);
      const verdict = judge(result);
      expect(verdict.allPassed, `${q.id}: ${verdict.summary} ${raw.message ?? ''} ${JSON.stringify(result.outcomes.filter((o) => !o.passed))}`).toBe(true);
    }
  });

  it('kod startowy nie przechodzi testow - trzeba napisac rozwiazanie', () => {
    for (const q of PYTHON) {
      const verdict = judge(run(q.code!.starterCode, q).run);
      expect(verdict.allPassed, `${q.id}: kod startowy przechodzi testy`).toBe(false);
    }
  });

  it('argumenty i wyniki testow daja sie przeslac do workera (czyste dane JSON)', () => {
    for (const q of PYTHON) {
      for (const t of q.code!.tests) {
        expect(JSON.parse(JSON.stringify(t.input)), `${q.id}/${t.name}`).toEqual(t.input);
        expect(JSON.parse(JSON.stringify(t.expected ?? null)), `${q.id}/${t.name}`).toEqual(t.expected ?? null);
      }
    }
  });
});

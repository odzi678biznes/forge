import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { judge } from '@/learning-engine/code-grading';
import { gradeSqlRun } from '@/learning-engine/sql-grading';
import { runSqlTests } from '@/features/code/sql-harness';
import { CS_QUESTIONS } from './index';

/**
 * Zadania SQL sprawdzane tym samym SQLite (Pyodide) i tym samym graderem,
 * który ocenia ucznia. Oczekiwane wyniki pochodzą z pliku generowanego
 * (scripts/sql-expected.ts) — ten test pilnuje, żeby był aktualny.
 */

const SQL = CS_QUESTIONS.filter((q) => q.code?.language === 'sql');

let py: PyodideAPI;
beforeAll(async () => {
  py = await loadPyodide({ indexURL: import.meta.env.PYODIDE_INDEX_URL });
}, 60_000);

function run(source: string, q: (typeof SQL)[number]) {
  const tests = q.code!.tests;
  const raw = runSqlTests(py, source, tests.map((t) => t.input));
  return { result: gradeSqlRun(tests, raw), raw };
}

describe('Informatyka: zadania SQL', () => {
  it('sa zadania SQL', () => {
    expect(SQL.length).toBeGreaterThan(0);
  });

  it('kazdy test ma oczekiwany wynik (jesli nie: npx vite-node scripts/sql-expected.ts)', () => {
    for (const q of SQL) {
      for (const t of q.code!.tests) expect(Array.isArray(t.expected), `${q.id} / ${t.name}`).toBe(true);
    }
  });

  it('wzorcowe zapytanie przechodzi wszystkie bazy (wyniki w pliku sa aktualne)', () => {
    for (const q of SQL) {
      const { result, raw } = run(q.code!.modelSolution!, q);
      const verdict = judge(result);
      expect(verdict.allPassed, `${q.id}: ${verdict.summary} ${raw.message ?? ''}`).toBe(true);
    }
  });

  it('kod startowy nie przechodzi testow', () => {
    for (const q of SQL) {
      expect(judge(run(q.code!.starterCode, q).result).allPassed, q.id).toBe(false);
    }
  });

  it('pierwsza baza jest przykladem widocznym, pozostale sa ukryte', () => {
    for (const q of SQL) {
      const [first, ...rest] = q.code!.tests;
      expect(first?.hidden, q.id).not.toBe(true);
      expect(rest.length, q.id).toBeGreaterThan(0);
      for (const t of rest) expect(t.hidden, `${q.id} / ${t.name}`).toBe(true);
    }
  });

  it('przykladowe tabele maja kolumny zgodne z wierszami', () => {
    for (const q of SQL) {
      for (const table of q.code!.sql!.tables) {
        expect(table.columns.length, `${q.id} / ${table.name}`).toBeGreaterThan(0);
        for (const row of table.rows) expect(row.length, `${q.id} / ${table.name}`).toBe(table.columns.length);
      }
    }
  });

  it('ukryte bazy roznia sie wynikiem od przykladowej - dopasowanie do przykladu nie wystarczy', () => {
    for (const q of SQL) {
      const [first, ...rest] = q.code!.tests;
      const differs = rest.some((t) => JSON.stringify(t.expected) !== JSON.stringify(first?.expected));
      expect(differs, q.id).toBe(true);
    }
  });

  it('bledy SQLite sa tlumaczone na polski', () => {
    const q = SQL[0]!;
    const { raw } = run('SELECT nie_ma_takiej FROM uczniowie;', q);
    expect(raw.message ?? JSON.stringify(raw.values)).toMatch(/nie ma (kolumny|tabeli)/);
  });
});

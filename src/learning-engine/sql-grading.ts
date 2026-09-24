import type { CodeTest } from '@/data/types';
import { describePython, gradeRun, type RunResult } from './code-grading';

/**
 * Ocena zapytań SQL.
 *
 * Wynik zapytania to lista wierszy. Bez ORDER BY baza może oddać wiersze
 * w dowolnej kolejności, więc jeśli zadanie nie wymaga sortowania, przed
 * porównaniem ustawiamy wiersze ucznia i oczekiwane w tej samej, ustalonej
 * kolejności. Nazwy kolumn nie mają znaczenia — liczą się wartości i ich
 * kolejność w wierszu.
 */

type Cell = unknown;

function rank(v: Cell): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return 1;
  if (typeof v === 'string') return 2;
  return 3;
}

function compareCells(a: Cell, b: Cell): number {
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const sa = String(a);
  const sb = String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

function compareRows(a: unknown, b: unknown): number {
  const ra = Array.isArray(a) ? a : [a];
  const rb = Array.isArray(b) ? b : [b];
  for (let i = 0; i < Math.min(ra.length, rb.length); i += 1) {
    const c = compareCells(ra[i], rb[i]);
    if (c !== 0) return c;
  }
  return ra.length - rb.length;
}

/** Wiersze w ustalonej kolejności (kopia). Wartość, która nie jest listą, wraca bez zmian. */
export function canonicalRows(rows: unknown): unknown {
  if (!Array.isArray(rows)) return rows;
  return [...rows].sort(compareRows);
}

function ordered(test: CodeTest): boolean {
  return test.input[2] === true;
}

/** Wynik zapytania pokazany jak w Pythonie: `[[1, 'Ala'], [2, 'Ola']]`. */
export const describeRows = describePython;

/**
 * Surowy wynik z piaskownicy → wynik testów, z porządkowaniem wierszy tam,
 * gdzie kolejność nie jest częścią zadania. Wspólne dla aplikacji i testów
 * treści.
 */
export function gradeSqlRun(tests: CodeTest[], raw: unknown): RunResult {
  const prepared = tests.map((t) => (ordered(t) ? t : { ...t, expected: canonicalRows(t.expected) }));
  let normalised = raw;
  if (typeof raw === 'object' && raw !== null && Array.isArray((raw as { values?: unknown }).values)) {
    const r = raw as { values: unknown[] };
    normalised = {
      ...r,
      values: r.values.map((v, i) => {
        const test = tests[i];
        if (!test || ordered(test) || typeof v !== 'object' || v === null) return v;
        const entry = v as { ok?: unknown; value?: unknown };
        return entry.ok === true ? { ...entry, value: canonicalRows(entry.value) } : v;
      }),
    };
  }
  const result = gradeRun(prepared, normalised, describeRows);
  return { ...result, outcomes: result.outcomes.map((o, i) => explainMiss(o, prepared[i], rawValue(normalised, i))) };
}

function rawValue(raw: unknown, i: number): unknown {
  const values = (raw as { values?: unknown[] } | null)?.values;
  const entry = Array.isArray(values) ? (values[i] as { ok?: unknown; value?: unknown } | undefined) : undefined;
  return entry?.ok === true ? entry.value : undefined;
}

function width(rows: unknown): number | null {
  if (!Array.isArray(rows) || rows.length === 0 || !Array.isArray(rows[0])) return null;
  return (rows[0] as unknown[]).length;
}

/**
 * Nauczycielskie wyjaśnienie typowych pomyłek zamiast samego zestawienia
 * list: dobre wiersze w złej kolejności albo inna liczba kolumn.
 */
function explainMiss(outcome: RunResult['outcomes'][number], test: CodeTest | undefined, actual: unknown) {
  if (outcome.passed || outcome.error || !test || actual === undefined) return outcome;
  const expected = test.expected;
  if (ordered(test) && JSON.stringify(canonicalRows(actual)) === JSON.stringify(canonicalRows(expected))) {
    return { ...outcome, error: 'wiersze się zgadzają, ale kolejność nie — sprawdź ORDER BY' };
  }
  const got = width(actual);
  const want = width(expected);
  if (got !== null && want !== null && got !== want) {
    return { ...outcome, error: `wynik ma ${got} kolumn(y), a powinien mieć ${want} — sprawdź listę po SELECT` };
  }
  return outcome;
}

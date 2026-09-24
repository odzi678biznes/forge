import type { PyodideAPI } from 'pyodide';
import type { RawValue } from '@/learning-engine/run-tests';
import { undefinedToNull, type PythonRun } from './python-harness';

/**
 * Uruchamianie zapytań SQL ucznia — SQLite wbudowany w Pyodide (moduł
 * `sqlite3` z biblioteki standardowej), więc bez sieci i bez dodatkowych
 * zależności.
 *
 * Każdy test to osobna, świeża baza w pamięci: skrypt tworzący tabele
 * i dane, potem instrukcje ucznia. Wynikiem jest lista wierszy ostatniego
 * zapytania, które zwraca wiersze — albo zapytania sprawdzającego, gdy
 * zadanie polega na zmianie danych (INSERT, UPDATE, DELETE).
 *
 * Jak w piaskownicy Pythona: moduł nie zna oczekiwanych wyników.
 */

/** Wejście testu SQL: skrypt bazy, zapytanie sprawdzające, czy kolejność ma znaczenie. */
export type SqlInput = [setup: string, check: string | null, ordered: boolean];

const HELPER = `
import sqlite3

def _forge_sql(setup, zapytanie, check):
    con = sqlite3.connect(":memory:")
    try:
        con.executescript(setup)
        wynik = None
        bufor = ""
        for znak in zapytanie:
            bufor += znak
            if znak == ";" and sqlite3.complete_statement(bufor):
                kursor = con.execute(bufor)
                if kursor.description is not None:
                    wynik = [list(w) for w in kursor.fetchall()]
                bufor = ""
        if bufor.strip():
            kursor = con.execute(bufor)
            if kursor.description is not None:
                wynik = [list(w) for w in kursor.fetchall()]
        if check is not None:
            wynik = [list(w) for w in con.execute(check).fetchall()]
        return wynik
    finally:
        con.close()
`;

const MAX_ERROR = 300;

/** Najczęstsze komunikaty SQLite po polsku — uczeń nie musi znać angielskiego żargonu. */
const EXPLAIN: Array<[RegExp, string]> = [
  [/no such column: (.+)/, 'nie ma kolumny „$1” — sprawdź nazwę i tabelę'],
  [/no such table: (.+)/, 'nie ma tabeli „$1” — sprawdź nazwę'],
  [/ambiguous column name: (.+)/, 'kolumna „$1” jest w kilku tabelach — dopisz nazwę tabeli, np. tabela.$1'],
  [/near "(.+)": syntax error/, 'błąd składni w pobliżu „$1”'],
  [/incomplete input/, 'niedokończone zapytanie — brakuje części instrukcji'],
  [/misuse of aggregate/, 'funkcja agregująca (COUNT, SUM…) w złym miejscu — w warunku na grupy użyj HAVING'],
  [/a GROUP BY clause is required before HAVING/, 'HAVING wymaga GROUP BY'],
  [/UNIQUE constraint failed: (.+)/, 'powtórzona wartość w kolumnie unikalnej $1'],
  [/NOT NULL constraint failed: (.+)/, 'brak wartości w kolumnie $1, która nie może być pusta'],
  [/table (.+) has (\d+) columns but (\d+) values were supplied/, 'tabela $1 ma $2 kolumn, a podano $3 wartości'],
  [/You can only execute one statement at a time/, 'zakończ każdą instrukcję średnikiem'],
];

export function explainSqlError(trace: string): string {
  const lines = trace.split('\n').map((l) => l.trim()).filter((l) => l !== '');
  const last = lines[lines.length - 1] ?? trace;
  const message = last.replace(/^[\w.]*(?:Error|Warning):\s*/, '');
  for (const [pattern, polish] of EXPLAIN) {
    const m = pattern.exec(message);
    if (m) {
      const text = polish.replace(/\$(\d)/g, (_s, i: string) => m[Number(i)] ?? '');
      return text.length > MAX_ERROR ? `${text.slice(0, MAX_ERROR)}…` : text;
    }
  }
  return message.length > MAX_ERROR ? `${message.slice(0, MAX_ERROR)}…` : message;
}

function isSqlInput(v: unknown): v is SqlInput {
  return Array.isArray(v) && typeof v[0] === 'string' && (v[1] === null || typeof v[1] === 'string') && typeof v[2] === 'boolean';
}

export function runSqlTests(py: PyodideAPI, source: string, inputs: unknown[][]): PythonRun {
  const makeDict = py.globals.get('dict') as () => { get: (k: string) => unknown; destroy: () => void };
  const ns = makeDict();
  try {
    py.runPython(HELPER, { globals: ns as never });
    const run = ns.get('_forge_sql') as ((...a: unknown[]) => unknown) & { destroy?: () => void };
    const values: RawValue[] = [];
    for (const input of inputs) {
      if (!isSqlInput(input)) {
        values.push({ ok: false, error: 'uszkodzone dane testu' });
        continue;
      }
      const [setup, check] = input;
      try {
        // JS null to w Pyodide JsNull, a undefined — None.
        const out = run(setup, source, check ?? undefined) as { toJs?: (o: object) => unknown; destroy?: () => void } | null | undefined;
        if (out === null || out === undefined) {
          values.push({ ok: false, error: 'zapytanie nie zwróciło żadnych wierszy (brakuje SELECT?)' });
          continue;
        }
        const rows = out.toJs ? out.toJs({ create_pyproxies: false }) : out;
        out.destroy?.();
        values.push({ ok: true, value: undefinedToNull(structuredClone(rows)) });
      } catch (err) {
        values.push({ ok: false, error: explainSqlError(err instanceof Error ? err.message : String(err)) });
      }
    }
    run.destroy?.();
    // Błąd w każdym teście z tego samego powodu to w praktyce błąd składni — pokazujemy go od razu.
    const first = values[0];
    if (first && !first.ok && values.every((v) => !v.ok && v.error === first.error)) {
      return { status: 'compile-error', values: [], message: first.error, output: '' };
    }
    return { status: 'ok', values, message: null, output: '' };
  } finally {
    ns.destroy();
  }
}

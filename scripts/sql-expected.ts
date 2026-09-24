/**
 * Generuje oczekiwane wyniki zadań SQL (content/cs/kurs/sql-wyniki.ts)
 * ze wzorcowych zapytań — tym samym SQLite (Pyodide), który ocenia ucznia.
 *
 *   npx vite-node scripts/sql-expected.ts
 *
 * Test content/cs/sql.test.ts pilnuje, żeby plik był aktualny: po zmianie
 * zapytania albo danych trzeba uruchomić skrypt ponownie i przejrzeć wynik.
 */
import { writeFileSync } from 'node:fs';
import { loadPyodide } from 'pyodide';
import { CS_QUESTIONS } from '../content/cs';
import { runSqlTests } from '../src/features/code/sql-harness';

const py = await loadPyodide();
const out: Record<string, Record<string, unknown>> = {};

for (const q of CS_QUESTIONS) {
  const code = q.code;
  if (code?.language !== 'sql') continue;
  const raw = runSqlTests(py, code.modelSolution ?? '', code.tests.map((t) => t.input));
  if (raw.status !== 'ok') throw new Error(`${q.id}: wzorcowe zapytanie nie działa — ${raw.message}`);
  out[q.id] = Object.fromEntries(
    code.tests.map((t, i) => {
      const v = raw.values[i];
      if (!v?.ok) throw new Error(`${q.id} / ${t.name}: ${v ? v.error : 'brak wyniku'}`);
      return [t.name, v.value];
    }),
  );
}

const body = Object.entries(out)
  .map(([id, byFixture]) => {
    const fixtures = Object.entries(byFixture)
      .map(([name, rows]) => `    ${JSON.stringify(name)}: ${JSON.stringify(rows)},`)
      .join('\n');
    return `  ${JSON.stringify(id)}: {\n${fixtures}\n  },`;
  })
  .join('\n');

writeFileSync(
  'content/cs/kurs/sql-wyniki.ts',
  `// PLIK GENEROWANY — nie edytuj ręcznie.
// Źródło: wzorcowe zapytania zadań SQL; odśwież: npx vite-node scripts/sql-expected.ts
import type { SqlValue } from '@/data/types';

export const SQL_WYNIKI: Record<string, Record<string, SqlValue[][]>> = {
${body}
};
`,
);
console.log(`Zapisano wyniki ${Object.keys(out).length} zadań SQL.`);

import type { SqlTable } from '@/data/types';

/**
 * Tabele w zadaniach SQL: przykładowe dane i oczekiwany wynik.
 *
 * Na telefonie szeroka tabela przewija się w poziomie wewnątrz ramki,
 * a nie rozpycha całej strony.
 */

function cell(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}

export function SqlTableView({ table }: { table: SqlTable }) {
  return (
    <div className="sqltable">
      <table>
        <caption>{table.name}</caption>
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            // Wiersze danych nie mają własnego identyfikatora — kolejność jest stała.
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} className={v === null ? 'sqltable__null' : undefined}>
                  {cell(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Wynik zapytania: same wiersze, bez nazw kolumn (nazwy nie są oceniane). */
export function SqlRowsView({ rows, caption }: { rows: unknown; caption: string }) {
  if (!Array.isArray(rows)) return null;
  const width = Math.max(1, ...rows.map((r) => (Array.isArray(r) ? r.length : 1)));
  return (
    <div className="sqltable">
      <table>
        <caption>{caption}</caption>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={width} className="sqltable__null">
                (brak wierszy)
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i}>
              {(Array.isArray(row) ? row : [row]).map((v, j) => (
                <td key={j} className={v === null ? 'sqltable__null' : undefined}>
                  {cell(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { forwardRef } from 'react';
import type { CodeTask } from '@/data/types';
import { describePython, describeValue, hiddenTestCount, visibleTests } from '@/learning-engine/code-grading';
import { count } from '@/learning-engine/polish';
import { SqlRowsView, SqlTableView } from './SqlTables';
import './code.css';

/**
 * Edytor kodu — Blueprint sek. 7.2 i 15, Etap 4.
 *
 * Świadomie prosty: pole tekstowe o stałej szerokości znaku, Tab wstawia
 * wcięcie, Enter zachowuje wcięcie (w Pythonie po dwukropku dodaje poziom),
 * Ctrl+Enter uruchamia testy. Pełny edytor to kilkaset kilobajtów
 * zależności, a blueprint wymaga przede wszystkim pracy offline i oceny na
 * testach — nie środowiska IDE.
 */

interface Props {
  task: CodeTask;
  value: string;
  onChange: (next: string) => void;
  onRun: () => void;
  disabled: boolean;
  running: boolean;
}

export const CodeEditor = forwardRef<HTMLTextAreaElement, Props>(function CodeEditor(
  { task, value, onChange, onRun, disabled, running },
  ref,
) {
  const python = task.language === 'python';
  const sql = task.language === 'sql';
  const indent = python ? '    ' : '  ';
  const show = python || sql ? describePython : describeValue;
  const languageName = sql ? 'SQL' : python ? 'Python' : 'JavaScript';
  const shown = visibleTests(task.tests);
  const hidden = hiddenTestCount(task.tests);

  /** Wstawia tekst w miejscu kursora i ustawia kursor za nim. */
  const insert = (el: HTMLTextAreaElement, text: string) => {
    const { selectionStart, selectionEnd } = el;
    onChange(value.slice(0, selectionStart) + text + value.slice(selectionEnd));
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + text.length;
    });
  };

  return (
    <section className="code">
      {sql && task.sql ? (
        <div className="code__db">
          <p className="code__label">Struktura bazy</p>
          <pre className="code__schema">{task.sql.schema}</pre>
          <p className="code__label">Przykładowe dane</p>
          {task.sql.tables.map((t) => (
            <SqlTableView key={t.name} table={t} />
          ))}
        </div>
      ) : (
        <p className="code__signature">
          <span className="code__label">Sygnatura</span>
          <code>{task.signature}</code>
        </p>
      )}

      <label className="code__label" htmlFor="code-editor">
        {sql ? 'Twoje zapytanie' : 'Twój kod'} ({languageName})
      </label>
      <textarea
        id="code-editor"
        ref={ref}
        className="code__editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        rows={Math.max(8, value.split('\n').length + 1)}
        onKeyDown={(e) => {
          const el = e.currentTarget;
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onRun();
            return;
          }
          // Tab wstawia wcięcie zamiast przenosić fokus poza edytor.
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            insert(el, indent);
            return;
          }
          // Nowa linia z wcięciem poprzedniej; w Pythonie po „:” jeden poziom głębiej.
          if (e.key === 'Enter' && !e.shiftKey && el.selectionStart === el.selectionEnd) {
            const before = value.slice(0, el.selectionStart);
            const line = before.slice(before.lastIndexOf('\n') + 1);
            const current = /^[ \t]*/.exec(line)?.[0] ?? '';
            const deeper = python && line.trimEnd().endsWith(':') ? indent : '';
            if (current !== '' || deeper !== '') {
              e.preventDefault();
              insert(el, `\n${current}${deeper}`);
            }
          }
        }}
      />

      <div className="code__tests">
        {sql ? (
          shown.map((t) => <SqlRowsView key={t.name} rows={t.expected} caption="Oczekiwany wynik dla przykładowych danych" />)
        ) : (
        <>
        <p className="code__label">Testy widoczne</p>
        <ul>
          {shown.map((t) => (
            <li key={t.name}>
              <span className="code__test-name">{t.name}</span>
              <code>
                {task.functionName}({t.input.map(show).join(', ')}) &rarr; {show(t.expected)}
              </code>
            </li>
          ))}
        </ul>
        </>
        )}
        {hidden > 0 && sql && (
          <p className="code__hidden">
            + {count(hidden, ['ukryta baza', 'ukryte bazy', 'ukrytych baz'])} z innymi danymi — zapytanie ma działać
            dla każdych danych, nie tylko dla przykładu.
          </p>
        )}
        {hidden > 0 && !sql && (
          <p className="code__hidden">
            + {count(hidden, ['test ukryty', 'testy ukryte', 'testów ukrytych'])} — sprawdzają przypadki brzegowe,
            więc samo dopasowanie do przykładów nie wystarczy.
          </p>
        )}
      </div>

      {!disabled && (
        <button
          type="button"
          className="code__run"
          onClick={onRun}
          disabled={running || value.trim() === ''}
        >
          {running ? (sql ? 'Wykonuję zapytanie…' : python ? 'Uruchamiam Pythona…' : 'Uruchamiam testy…') : sql ? 'Wykonaj zapytanie' : 'Uruchom testy'}
          <kbd>Ctrl+Enter</kbd>
        </button>
      )}
    </section>
  );
});

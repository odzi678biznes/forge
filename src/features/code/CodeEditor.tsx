import { forwardRef } from 'react';
import type { CodeTask } from '@/data/types';
import { describeValue, hiddenTestCount, visibleTests } from '@/learning-engine/code-grading';
import { count } from '@/learning-engine/polish';
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

/** Wartość testu zapisana tak, jak wyglądałaby w Pythonie. */
export function pythonRepr(v: unknown): string {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  if (Array.isArray(v)) return `[${v.map(pythonRepr).join(', ')}]`;
  if (typeof v === 'object') {
    return `{${Object.entries(v as Record<string, unknown>)
      .map(([k, x]) => `${pythonRepr(k)}: ${pythonRepr(x)}`)
      .join(', ')}}`;
  }
  return String(v);
}

export const CodeEditor = forwardRef<HTMLTextAreaElement, Props>(function CodeEditor(
  { task, value, onChange, onRun, disabled, running },
  ref,
) {
  const python = task.language === 'python';
  const indent = python ? '    ' : '  ';
  const show = python ? pythonRepr : describeValue;
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
      <p className="code__signature">
        <span className="code__label">Sygnatura</span>
        <code>{task.signature}</code>
      </p>

      <label className="code__label" htmlFor="code-editor">
        Twój kod ({python ? 'Python' : 'JavaScript'})
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
        {hidden > 0 && (
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
          {running ? (python ? 'Uruchamiam Pythona…' : 'Uruchamiam testy…') : 'Uruchom testy'}
          <kbd>Ctrl+Enter</kbd>
        </button>
      )}
    </section>
  );
});

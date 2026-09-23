import { forwardRef } from 'react';
import type { CodeTask } from '@/data/types';
import { describeValue, hiddenTestCount, visibleTests } from '@/learning-engine/code-grading';
import './code.css';

/**
 * Edytor kodu — Blueprint sek. 7.2 i 15, Etap 4.
 *
 * Świadomie prosty: pole tekstowe o stałej szerokości znaku, Tab wstawia
 * wcięcie, Ctrl+Enter uruchamia testy. Pełny edytor (podświetlanie składni,
 * podpowiedzi) to kilkaset kilobajtów zależności, a blueprint wymaga przede
 * wszystkim pracy offline i oceny na testach — nie środowiska IDE.
 */

interface Props {
  task: CodeTask;
  value: string;
  onChange: (next: string) => void;
  onRun: () => void;
  disabled: boolean;
  running: boolean;
}

const INDENT = '  ';

export const CodeEditor = forwardRef<HTMLTextAreaElement, Props>(function CodeEditor(
  { task, value, onChange, onRun, disabled, running },
  ref,
) {
  const shown = visibleTests(task.tests);
  const hidden = hiddenTestCount(task.tests);

  return (
    <section className="code">
      <p className="code__signature">
        <span className="code__label">Sygnatura</span>
        <code>{task.signature}</code>
      </p>

      <label className="code__label" htmlFor="code-editor">
        Twój kod (JavaScript)
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
          // Tab wstawia wcięcie zamiast przenosić fokus poza edytor.
          if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            const el = e.currentTarget;
            const { selectionStart, selectionEnd } = el;
            const next = value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd);
            onChange(next);
            requestAnimationFrame(() => {
              el.selectionStart = el.selectionEnd = selectionStart + INDENT.length;
            });
          }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onRun();
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
                {task.functionName}({t.input.map(describeValue).join(', ')}) &rarr;{' '}
                {describeValue(t.expected)}
              </code>
            </li>
          ))}
        </ul>
        {hidden > 0 && (
          <p className="code__hidden">
            + {hidden} {hidden === 1 ? 'test ukryty' : 'testy ukryte'} — sprawdzają
            przypadki brzegowe, więc samo dopasowanie do przykładów nie wystarczy.
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
          {running ? 'Uruchamiam testy…' : 'Uruchom testy'}
          <kbd>Ctrl+Enter</kbd>
        </button>
      )}
    </section>
  );
});

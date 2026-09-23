import type { TestOutcome } from '@/learning-engine/code-grading';
import './code.css';

/**
 * Wyniki testów po uruchomieniu kodu.
 *
 * Testy ukryte pokazujemy z nazwy i z wyniku zaliczenia, ale NIE z wartości:
 * odsłonięcie oczekiwanego wyniku zamieniłoby test ukryty w kolejny przykład
 * do dopasowania.
 */
export function CodeResults({ outcomes }: { outcomes: TestOutcome[] }) {
  if (outcomes.length === 0) return null;

  return (
    <ul className="results">
      {outcomes.map((o) => (
        <li key={o.name} className={o.passed ? 'result result--ok' : 'result result--miss'}>
          <span className="result__mark" aria-hidden>
            {o.passed ? '✓' : '·'}
          </span>
          <span className="result__name">
            {o.name}
            {o.hidden && <span className="result__hidden">ukryty</span>}
          </span>
          {!o.passed && !o.hidden && o.error && (
            <span className="result__detail">błąd: {o.error}</span>
          )}
          {!o.passed && !o.hidden && !o.error && (
            <span className="result__detail">
              oczekiwano {o.expected}, otrzymano {o.actual}
            </span>
          )}
          <span className="sr-only">{o.passed ? 'zaliczony' : 'niezaliczony'}</span>
        </li>
      ))}
    </ul>
  );
}

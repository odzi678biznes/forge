import { useMemo, useState } from 'react';
import { MASTERY_LABELS, MasteryLevel } from '@/data/types';
import {
  VARIANTS,
  type DiagnosticReport,
  type PlanVariant,
  type StudyPlan,
} from '@/learning-engine/diagnostics';
import './diagnostics.css';

/**
 * Raport diagnozy i wybór wariantu planu — Blueprint sek. 15, Etap 3.
 *
 * Kryterium etapu: plan powstaje z wyników. Dlatego ten ekran najpierw
 * pokazuje POMIAR, a dopiero pod nim warianty — nie odwrotnie. Wariant
 * zmienia ambicję celu, nigdy odczyt poziomu.
 */

interface Props {
  report: DiagnosticReport;
  /** Podgląd planu liczony na żywo dla wskazanego wariantu. */
  preview: (variant: PlanVariant, deadline: number | null) => StudyPlan | null;
  onChoose: (variant: PlanVariant, deadline: number | null) => void;
  onBack: () => void;
}

export function DiagnosticReportView({ report, preview, onChoose, onBack }: Props) {
  const [variant, setVariant] = useState<PlanVariant>('realistic');
  const [deadlineText, setDeadlineText] = useState('');

  const deadline = useMemo(() => {
    if (deadlineText === '') return null;
    const t = Date.parse(deadlineText);
    return Number.isNaN(t) ? null : t;
  }, [deadlineText]);

  const plan = preview(variant, deadline);
  const incomplete = report.probesAnswered < report.probesTotal;

  return (
    <main className="diag">
      <header className="diag__head">
        <button type="button" className="diag__back" onClick={onBack}>
          &larr; Plan dnia
        </button>
        <p className="diag__eyebrow">Wynik diagnozy</p>
        <h1 className="diag__title">
          {report.independentCount} z {report.probesTotal} samodzielnie
        </h1>
        <p className="diag__sub">
          Sondy wykonane: {report.probesAnswered} z {report.probesTotal}.
          {incomplete && ' Kompetencje bez sondy są oznaczone jako niesprawdzone, nie jako zerowe.'}
        </p>
      </header>

      <section className="diag__section" aria-labelledby="diag-topics">
        <h2 id="diag-topics">Luki według działów</h2>
        <p className="diag__hint">Kolejność od najpilniejszego.</p>
        <ul className="gaps">
          {report.topics.map((t) => (
            <li key={t.topicId} className="gap">
              <div className="gap__head">
                <span className="gap__name">{t.topicName}</span>
                <span className="gap__count">
                  {t.skillsBelowTarget} z {t.skillsTotal} do pracy
                </span>
              </div>
              <div className="gap__bar" aria-hidden>
                <span
                  className="gap__fill"
                  style={{ width: `${(t.averageLevel / MasteryLevel.Retained) * 100}%` }}
                />
              </div>
              <span className="gap__meta">
                Średni poziom {t.averageLevel.toFixed(1)} z 5 · waga maturalna{' '}
                {globalThis.Math.round(t.examValue * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      {report.overconfident.length > 0 && (
        <section className="diag__section diag__section--warn" aria-labelledby="diag-over">
          <h2 id="diag-over">Pewność rozminęła się z wynikiem</h2>
          <p className="diag__hint">
            Te kompetencje najłatwiej zaskoczą na arkuszu — byłeś ich pewny i
            nie wyszły, więc nie sprawdzisz ich pod presją czasu.
          </p>
          <ul className="diag__list">
            {report.overconfident.map((d) => (
              <li key={d.skillId}>{d.skillName}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="diag__section" aria-labelledby="diag-variants">
        <h2 id="diag-variants">Wybierz wariant planu</h2>
        <p className="diag__hint">
          Wariant zmienia wysokość celu, a nie odczyt twojego poziomu.
        </p>

        <div className="variants" role="radiogroup" aria-labelledby="diag-variants">
          {(Object.keys(VARIANTS) as PlanVariant[]).map((id) => {
            const v = VARIANTS[id];
            const p = preview(id, deadline);
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={variant === id}
                className={`variant ${variant === id ? 'variant--on' : ''}`}
                onClick={() => setVariant(id)}
              >
                <span className="variant__name">{v.name}</span>
                <span className="variant__targets">
                  Cel: {MASTERY_LABELS[v.targetHigh].toLowerCase()} w kluczowych,{' '}
                  {MASTERY_LABELS[v.targetRest].toLowerCase()} w pozostałych
                </span>
                <span className="variant__load">
                  {v.sessionsPerWeek} sesji tygodniowo
                  {p ? ` · ok. ${p.estimatedWeeks} tyg.` : ''}
                </span>
                <span className="variant__tradeoff">{v.tradeoff}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="diag__section" aria-labelledby="diag-deadline">
        <h2 id="diag-deadline">Termin egzaminu</h2>
        <label className="diag__field">
          <span>Data (opcjonalnie)</span>
          <input
            type="date"
            value={deadlineText}
            onChange={(e) => setDeadlineText(e.target.value)}
          />
        </label>
        {plan && <p className={`verdict ${plan.fitsDeadline === false ? 'verdict--tight' : ''}`}>{plan.verdict}</p>}
      </section>

      {plan && plan.steps.length > 0 && (
        <section className="diag__section" aria-labelledby="diag-steps">
          <h2 id="diag-steps">Kolejność pracy</h2>
          <ol className="steps">
            {plan.steps.slice(0, 8).map((s) => (
              <li key={s.skillId} className="step">
                <div className="step__head">
                  <span className="step__name">{s.skillName}</span>
                  <span className="step__levels">
                    {s.fromLevel} &rarr; {s.targetLevel}
                  </span>
                </div>
                <span className="step__topic">{s.topicName}</span>
                <span className="step__reason">{s.reason}</span>
              </li>
            ))}
          </ol>
          {plan.steps.length > 8 && (
            <p className="diag__hint">
              …i jeszcze {plan.steps.length - 8} kompetencji dalej w kolejce.
            </p>
          )}
        </section>
      )}

      <div className="diag__actions">
        <button
          type="button"
          className="diag__primary"
          onClick={() => onChoose(variant, deadline)}
        >
          Przyjmij ten plan
        </button>
        <button type="button" className="diag__secondary" onClick={onBack}>
          Jeszcze się zastanowię
        </button>
      </div>
    </main>
  );
}

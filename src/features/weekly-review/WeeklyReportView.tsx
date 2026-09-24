import type { SkillLine, WeeklyReport } from '@/learning-engine/weekly-report';
import type { WeekRhythm } from '@/learning-engine/planner';
import './weekly-review.css';

/**
 * Raport tygodniowy — Blueprint sek. 7.6.
 *
 * Kolejność sekcji jest kolejnością z blueprintu i nie jest przypadkowa:
 * najpierw to, co się udało, potem to, co pamiętasz, potem gdzie wciąż
 * potrzeba pomocy, a dopiero na końcu — i bez łagodzenia — co zabierało
 * czas bez efektu. Raport, który pomija ostatnią sekcję, mierzy wysiłek
 * zamiast wyniku.
 */

interface Props {
  report: WeeklyReport;
  rhythm: WeekRhythm;
  onBack: () => void;
}

export function WeeklyReportView({ report, rhythm, onBack }: Props) {
  return (
    <main className="week">
      <header className="week__head">
        <button type="button" className="week__back" onClick={onBack}>
          &larr; Plan dnia
        </button>
        <p className="week__eyebrow">Ostatnie 7 dni</p>
        <h1 className="week__title">Raport tygodniowy</h1>
        <p className="week__sub">
          {report.missionsFinished} ukończonych misji · {report.attemptsTotal} prób ·{' '}
          {rhythm.note}
        </p>
      </header>

      <Section
        title="Czego nauczyłem się samodzielnie"
        lines={report.learnedIndependently}
        empty="W tym tygodniu żadna kompetencja nie doszła do samodzielności."
        tone="good"
      />

      <Section
        title="Co pamiętam po czasie"
        lines={report.retained}
        empty="Brak poprawnych odpowiedzi po odroczeniu — kolejka powtórek jeszcze nie zadziałała."
        tone="good"
      />

      <Section
        title="Gdzie nadal potrzebuję pomocy"
        lines={report.stillNeedHelp}
        empty="Żadna kompetencja nie opiera się głównie na podpowiedziach."
        tone="neutral"
      />

      <Section
        title="Co zabierało czas bez efektu"
        lines={report.timeWithoutEffect}
        empty="Cała praca z tego tygodnia przełożyła się na zmianę poziomu."
        tone="warn"
      />

      <section className="week__rec">
        <h2>Jedna zmiana na kolejny tydzień</h2>
        <p>{report.recommendation}</p>
      </section>
    </main>
  );
}

function Section({
  title,
  lines,
  empty,
  tone,
}: {
  title: string;
  lines: SkillLine[];
  empty: string;
  tone: 'good' | 'neutral' | 'warn';
}) {
  return (
    <section className={`week__section week__section--${tone}`}>
      <h2>{title}</h2>
      {lines.length === 0 ? (
        <p className="week__empty">{empty}</p>
      ) : (
        <ul className="week__list">
          {lines.map((l) => (
            <li key={l.skillId}>
              <span className="week__skill">{l.skillName}</span>
              <span className="week__detail">{l.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

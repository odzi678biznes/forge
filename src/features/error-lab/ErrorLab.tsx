import type { Skill } from '@/data/types';
import { Math as Tex } from '@/components/Math';
import {
  REPAIR_STREAK_REQUIRED,
  type ErrorGroup,
} from '@/learning-engine/error-lab';
import './error-lab.css';

/**
 * Laboratorium bledow - Blueprint sek. 7.4.
 *
 * "Grupuje bledy wedlug przyczyny, pokazuje przyklad, poprawna zasade
 * i przycisk Napraw teraz." Kazdy wpis konczy sie dzialaniem, nie statystyka -
 * dziennik bledow, ktorego nie da sie od razu przecwiczyc, byl by tylko
 * lista zarzutow.
 */

interface Props {
  groups: ErrorGroup[];
  skills: Skill[];
  onRepair: (skill: Skill, cause: string) => void;
  onBack: () => void;
}

export function ErrorLab({ groups, skills, onRepair, onBack }: Props) {
  const open = groups.filter((g) => !g.repaired);
  const repaired = groups.filter((g) => g.repaired);

  return (
    <main className="lab">
      <header className="lab__head">
        <button type="button" className="lab__back" onClick={onBack}>
          &larr; Plan dnia
        </button>
        <h1 className="lab__title">Laboratorium błędów</h1>
        <p className="lab__lead">
          {groups.length === 0
            ? 'Dziennik jest pusty. Błędy trafiają tu automatycznie, gdy system rozpozna ich przyczynę.'
            : 'Błędy zgrupowane według przyczyny, nie według zadania. Każdy wpis znika po trzech poprawnych próbach z rzędu.'}
        </p>
      </header>

      {open.length > 0 && (
        <section aria-labelledby="lab-open">
          <h2 id="lab-open" className="lab__section">
            Do naprawy ({open.length})
          </h2>
          <div className="lab__list">
            {open.map((g) => (
              <ErrorCard key={g.errorId} group={g} skills={skills} onRepair={onRepair} />
            ))}
          </div>
        </section>
      )}

      {repaired.length > 0 && (
        <section aria-labelledby="lab-done">
          <h2 id="lab-done" className="lab__section">
            Naprawione ({repaired.length})
          </h2>
          <div className="lab__list">
            {repaired.map((g) => (
              <ErrorCard key={g.errorId} group={g} skills={skills} onRepair={onRepair} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ErrorCard({
  group,
  skills,
  onRepair,
}: {
  group: ErrorGroup;
  skills: Skill[];
  onRepair: (skill: Skill, cause: string) => void;
}) {
  const skill = skills.find((s) => s.id === group.skillId);

  return (
    <article className={`err-card ${group.repaired ? 'err-card--done' : ''}`}>
      <header className="err-card__head">
        <p className="err-card__skill">{group.skillName}</p>
        <p className="err-card__count">
          {group.occurrences === 1 ? '1 raz' : `${group.occurrences} razy`}
        </p>
      </header>

      <h3 className="err-card__cause">
        <Tex>{group.error.cause}</Tex>
      </h3>

      <div className="err-card__example">
        <p className="err-card__label">Przykład</p>
        <p className="err-card__prompt">
          <Tex>{group.exampleQuestion.prompt}</Tex>
        </p>
        <p className="err-card__answers">
          <span className="err-card__given">Twoja odpowiedź: {group.exampleAnswer}</span>
          <span className="err-card__correct">
            Poprawna: <Tex>{group.exampleQuestion.answer}</Tex>
          </span>
        </p>
      </div>

      <div className="err-card__rule">
        <p className="err-card__label">Złamana zasada</p>
        <p>
          <Tex>{group.error.rule}</Tex>
        </p>
      </div>

      <footer className="err-card__foot">
        {group.repaired ? (
          <p className="err-card__done">
            Naprawione — {REPAIR_STREAK_REQUIRED} poprawne próby z rzędu po tym błędzie.
          </p>
        ) : (
          <>
            <RepairProgress streak={group.repairStreak} />
            {skill && (
              <button
                type="button"
                className="err-card__fix"
                onClick={() => onRepair(skill, group.error.cause)}
              >
                Napraw teraz
              </button>
            )}
          </>
        )}
      </footer>
    </article>
  );
}

/** Postep naprawy jest jawny: widac, ile jeszcze trzeba, zeby zamknac wpis. */
function RepairProgress({ streak }: { streak: number }) {
  return (
    <p className="err-card__progress">
      {Array.from({ length: REPAIR_STREAK_REQUIRED }, (_, i) => (
        <span
          key={i}
          className={`err-card__pip ${i < streak ? 'err-card__pip--on' : ''}`}
          aria-hidden
        />
      ))}
      <span className="err-card__progress-text">
        {streak} z {REPAIR_STREAK_REQUIRED} poprawnych z rzędu
      </span>
    </p>
  );
}

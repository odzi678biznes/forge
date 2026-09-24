import { MASTERY_LABELS, type Skill, type SkillState } from '@/data/types';
import type { AnsweredStep } from '@/app/useForge';
import { MasteryNode } from '@/features/mastery-map/MasteryNode';
import './mission-summary.css';

/**
 * Podsumowanie misji - Blueprint sek. 3 i 7.6.
 *
 * Trzy twarde zasady z blueprintu sa tu zakodowane wprost:
 * 1. Kolejna misja NIGDY nie startuje sama - jest tylko przycisk.
 * 2. Po dwoch misjach pojawia sie neutralny punkt zatrzymania.
 * 3. Po czterech misjach rekomendujemy przerwe - bez kary i zawstydzania.
 */

interface Props {
  steps: AnsweredStep[];
  skills: Skill[];
  states: Map<string, SkillState>;
  missionsToday: number;
  onAgain: () => void;
  onFinish: () => void;
}

const PAUSE_POINT = 2;
const BREAK_POINT = 4;

export function MissionSummary({
  steps,
  skills,
  states,
  missionsToday,
  onAgain,
  onFinish,
}: Props) {
  const independent = steps.filter(
    (s) => s.grade.correctness === 'correct' && s.hintLevel === 0,
  ).length;
  const assisted = steps.filter(
    (s) => s.grade.correctness === 'correct' && s.hintLevel > 0,
  ).length;
  // Podpowiedz uzyta bez trafionej odpowiedzi to nadal uzycie drabiny -
  // inaczej podsumowanie twierdziloby nieprawde o przebiegu misji.
  const usedHints = steps.some((s) => s.hintLevel > 0);
  const transitions = steps.filter((s) => s.transition !== null);
  const changedSkillIds = new Set(transitions.map((s) => s.selection.skill.id));
  const touchedSkillIds = new Set(steps.map((s) => s.selection.skill.id));

  const recommendBreak = missionsToday >= BREAK_POINT;
  const offerPause = missionsToday >= PAUSE_POINT && !recommendBreak;

  return (
    <main className="sum">
      <header className="sum__head">
        <p className="sum__eyebrow">Misja ukończona</p>
        <h1 className="sum__title">
          {independent} z {steps.length} samodzielnie
        </h1>
        <p className="sum__sub">
          {assisted > 0
            ? `Dodatkowo ${assisted} po podpowiedzi — to nadal postęp, tylko innego rodzaju.`
            : usedHints
              ? 'Drabina pomocy była używana, ale nie doprowadziła jeszcze do poprawnej odpowiedzi.'
              : 'Bez korzystania z drabiny pomocy.'}
        </p>
      </header>

      {transitions.length > 0 ? (
        <section className="sum__changes" aria-labelledby="sum-changes">
          <h2 id="sum-changes">Co się zmieniło</h2>
          <ul className="sum__list">
            {transitions.map((s, i) => (
              <li key={i}>
                <strong>{s.selection.skill.name}</strong>: {MASTERY_LABELS[s.transition!.from]}{' '}
                &rarr; {MASTERY_LABELS[s.transition!.to]}.{' '}
                <span className="sum__reason">{s.transition!.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="sum__changes">
          <h2>Co się zmieniło</h2>
          <p className="sum__none">
            Żaden poziom nie zmienił się w tej misji. Próby zostały zapisane i wpłyną
            na dobór kolejnych zadań.
          </p>
        </section>
      )}

      <section className="sum__nodes" aria-label="Kompetencje po misji">
        {/* Tylko kompetencje z tej misji - sek. 5: zmiana konkretnej kompetencji, nie deszcz punktow. */}
        {skills.filter((s) => touchedSkillIds.has(s.id)).map((skill) => {
          const state = states.get(skill.id);
          return state ? (
            <MasteryNode
              key={skill.id}
              skill={skill}
              state={state}
              justChanged={changedSkillIds.has(skill.id)}
            />
          ) : null;
        })}
      </section>

      {recommendBreak && (
        <p className="sum__break">
          To czwarta misja dzisiaj. Dalsza nauka teraz przyniesie mniej niż przerwa.
          Postęp jest zapisany — nic nie przepadnie.
        </p>
      )}

      {offerPause && (
        <p className="sum__pause">
          Kontynuuj albo zrób przerwę — postęp jest zapisany.
        </p>
      )}

      <div className="sum__actions">
        <button
          type="button"
          className={recommendBreak ? 'sum__secondary' : 'sum__primary'}
          onClick={onAgain}
        >
          Wróć do planu dnia
        </button>
        <button
          type="button"
          className={recommendBreak ? 'sum__primary' : 'sum__secondary'}
          onClick={onFinish}
          autoFocus={recommendBreak}
        >
          Koniec na dziś
        </button>
      </div>
    </main>
  );
}

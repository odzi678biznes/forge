import { MasteryLevel, type Skill, type SkillState } from '@/data/types';
import type { MissionPlan } from '@/learning-engine/mission';
import { MasteryNode } from '@/features/mastery-map/MasteryNode';
import './command-center.css';

/**
 * Centrum dowodzenia - Blueprint sek. 7.1.
 *
 * Obietnica z sek. 2: w 10 sekund wiadomo, co robic, dlaczego wlasnie to, ile
 * potrwa seria i jaki bedzie efekt. Dlatego na gorze jest JEDNA rekomendacja
 * z przyciskiem startu, a nie lista zaleglosci.
 */

interface Props {
  recommended: MissionPlan;
  options: MissionPlan[];
  skills: Skill[];
  states: Map<string, SkillState>;
  missionsToday: number;
  onStart: (plan: MissionPlan) => void;
}

export function CommandCenter({
  recommended,
  options,
  skills,
  states,
  missionsToday,
  onStart,
}: Props) {
  const solvedIndependently = [...states.values()].filter(
    (s) => s.level >= MasteryLevel.Independent,
  ).length;

  return (
    <main className="cc">
      <header className="cc__head">
        <p className="cc__brand">FORGE</p>
        <p className="cc__today">
          {missionsToday === 0
            ? 'Dzis jeszcze nie zaczynales.'
            : `Dzis ukonczone misje: ${missionsToday}.`}
        </p>
      </header>

      <section className="cc__mission" aria-labelledby="cc-mission-title">
        <p className="cc__eyebrow">Rekomendowana misja</p>
        <h1 className="cc__title" id="cc-mission-title">
          {recommended.title}
        </h1>
        <p className="cc__rationale">{recommended.rationale}</p>

        <dl className="cc__facts">
          <div>
            <dt>Pytania</dt>
            <dd>{recommended.questionCount}</dd>
          </div>
          <div>
            <dt>Szacowany czas</dt>
            <dd>{estimateMinutes(recommended.questionCount)} min</dd>
          </div>
          <div>
            <dt>Pierwszy krok</dt>
            <dd>Pytanie 1 z {recommended.questionCount}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="cc__start"
          onClick={() => onStart(recommended)}
          autoFocus
        >
          Rozpocznij
          <kbd>Enter</kbd>
        </button>
      </section>

      <section className="cc__alts" aria-label="Alternatywy">
        {options.map((option) => (
          <button
            key={option.title}
            type="button"
            className="cc__alt"
            onClick={() => onStart(option)}
          >
            <span className="cc__alt-title">{option.title}</span>
            <span className="cc__alt-meta">{option.questionCount} pytan</span>
            <span className="cc__alt-why">{option.rationale}</span>
          </button>
        ))}
      </section>

      <section className="cc__map" aria-labelledby="cc-map-title">
        <div className="cc__map-head">
          <h2 id="cc-map-title">Mapa kompetencji</h2>
          <p className="cc__map-note">
            Samodzielnie lub wyzej: {solvedIndependently} z {skills.length}
          </p>
        </div>
        <div className="cc__nodes">
          {skills.map((skill) => {
            const state = states.get(skill.id);
            return state ? (
              <MasteryNode key={skill.id} skill={skill} state={state} />
            ) : null;
          })}
        </div>
      </section>
    </main>
  );
}

/** Ok. 90 sekund na pytanie otwarte - szacunek, nie obietnica. */
function estimateMinutes(count: number): number {
  return globalThis.Math.max(2, globalThis.Math.round((count * 90) / 60));
}

import { useMemo } from 'react';
import { MASTERY_LABELS, MasteryLevel, type Skill, type SkillState, type Topic } from '@/data/types';
import { COVERED_LEVEL } from '@/learning-engine/course';
import { count } from '@/learning-engine/polish';
import './mastery-map.css';

/**
 * Mapa umiejętności - Blueprint sek. 7.3.
 *
 * "Kliknięcie uruchamia trening, nie otwiera pustej strony statystyk" - każdy
 * węzeł jest przyciskiem startującym misję celowaną.
 *
 * Przy prawie stu umiejętnościach graf warstwowy ze strzałkami miał kilkanaście
 * tysięcy pikseli wysokości, więc mapa jest pogrupowana działami (jak kurs),
 * a zależność pokazujemy tam, gdzie ma znaczenie: przy umiejętności, której
 * warunek wstępny nie jest jeszcze opanowany ("najpierw: ...").
 */

interface Props {
  skills: Skill[];
  topics: Topic[];
  states: Map<string, SkillState>;
  onSelect: (skill: Skill) => void;
  onBack: () => void;
}

interface Group {
  topic: Topic;
  skills: Skill[];
  covered: number;
  open: boolean;
}

export function MasteryMap({ skills, topics, states, onSelect, onBack }: Props) {
  const now = Date.now();
  const byId = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills]);
  const level = (id: string) => states.get(id)?.level ?? MasteryLevel.Unknown;

  const groups = useMemo(() => {
    const out: Group[] = topics
      .map((topic) => {
        const members = skills.filter((s) => s.topicId === topic.id);
        const covered = members.filter((s) => (states.get(s.id)?.level ?? 0) >= COVERED_LEVEL).length;
        const started = members.some((s) => (states.get(s.id)?.level ?? 0) > MasteryLevel.Unknown);
        const due = members.some((s) => {
          const st = states.get(s.id);
          return st?.reviewDueAt != null && st.reviewDueAt <= now;
        });
        // Otwarte działy: rozpoczęte i niedokończone albo z powtórką na dziś.
        return { topic, skills: members, covered, open: (started && covered < members.length) || due };
      })
      .filter((g) => g.skills.length > 0);
    // Gdy nic nie jest w toku, otwieramy pierwszy nieopanowany dział - od niego się zaczyna.
    if (!out.some((g) => g.open)) {
      const frontier = out.find((g) => g.covered < g.skills.length);
      if (frontier) frontier.open = true;
    }
    return out;
    // `now` celowo poza zależnościami - wystarczy przeliczenie przy zmianie stanu.
  }, [topics, skills, states]);

  const totalCovered = groups.reduce((sum, g) => sum + g.covered, 0);

  /** Pierwszy warunek wstępny, który nie jest jeszcze opanowany. */
  const missingPrereq = (skill: Skill): Skill | null => {
    if (level(skill.id) >= COVERED_LEVEL) return null;
    for (const id of skill.prerequisites) {
      const pre = byId.get(id);
      if (pre && level(id) < COVERED_LEVEL) return pre;
    }
    return null;
  };

  return (
    <main className="map">
      <header className="map__head">
        <button type="button" className="map__back" onClick={onBack}>
          &larr; Plan dnia
        </button>
        <h1 className="map__title">Mapa umiejętności</h1>
        <p className="map__hint">
          {totalCovered} z {skills.length} umiejętności opanowanych samodzielnie. Kliknij umiejętność, żeby ją
          trenować. „Najpierw” wskazuje, czego warto nauczyć się wcześniej.
        </p>
      </header>

      <div className="map__topics">
        {groups.map((g) => (
          <details key={g.topic.id} className="map__topic" open={g.open}>
            <summary className="map__summary">
              <span className="map__topic-name">{g.topic.name}</span>
              <span className="map__topic-count">
                {g.covered}/{g.skills.length}
              </span>
              <span className="map__bar" aria-hidden>
                <span style={{ width: `${(100 * g.covered) / g.skills.length}%` }} />
              </span>
            </summary>
            <div className="map__grid">
              {g.skills.map((skill) => {
                const state = states.get(skill.id);
                if (!state) return null;
                const pre = missingPrereq(skill);
                const due = state.reviewDueAt !== null && state.reviewDueAt <= now;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    className="map__node"
                    onClick={() => onSelect(skill)}
                    aria-label={`Trenuj: ${skill.name}, poziom ${state.level} z 5, ${MASTERY_LABELS[state.level]}${
                      due ? ', powtórka dziś' : ''
                    }${pre ? `, najpierw: ${pre.name}` : ''}`}
                  >
                    <MiniRing level={state.level} due={due} error={state.recentErrors.length > 0} />
                    <span className="map__node-text">
                      <span className="map__node-name">{skill.name}</span>
                      <span className="map__node-label">
                        {MASTERY_LABELS[state.level]}
                        {due && <span className="map__due"> · powtórka dziś</span>}
                      </span>
                      {pre && <span className="map__prereq">najpierw: {pre.name}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      <Legend total={skills.length} />
    </main>
  );
}

const R = 17;
const CIRC = 2 * globalThis.Math.PI * R;

/** Mały pierścień poziomu: wypełnienie = poziom, bursztyn = powtórka, kropka = powracający błąd. */
function MiniRing({ level, due, error }: { level: MasteryLevel; due: boolean; error: boolean }) {
  const fill = level / MasteryLevel.Retained;
  return (
    <svg className="map__ring" width="44" height="44" viewBox="0 0 44 44" aria-hidden>
      <circle cx="22" cy="22" r={R} className="map__ring-track" />
      {fill > 0 && (
        <circle
          cx="22"
          cy="22"
          r={R}
          className={due ? 'map__ring-fill map__ring-fill--due' : 'map__ring-fill'}
          strokeDasharray={`${CIRC * fill} ${CIRC}`}
          transform="rotate(-90 22 22)"
        />
      )}
      <text x="22" y="23" className="map__ring-level">
        {level}
      </text>
      {error && <circle cx="37" cy="7" r="4" className="map__ring-error" />}
    </svg>
  );
}

function Legend({ total }: { total: number }) {
  return (
    <section className="map__legend" aria-label="Legenda">
      <p>
        <span className="map__swatch map__swatch--progress" />
        Wypełnienie pierścienia — poziom opanowania (0–5); od {COVERED_LEVEL} umiejętność jest opanowana
      </p>
      <p>
        <span className="map__swatch map__swatch--challenge" />
        Bursztynowy pierścień — powtórka wymagalna dziś
      </p>
      <p>
        <span className="map__swatch map__swatch--dot" />
        Kropka — powtarzający się błąd w tej umiejętności
      </p>
      <p className="map__legend-note">
        Poziom {MasteryLevel.Independent} to typowe zadanie rozwiązane bez pomocy, poziom{' '}
        {MasteryLevel.Retained} — poprawna odpowiedź po kilku dniach przerwy. Na mapie jest{' '}
        {count(total, ['umiejętność', 'umiejętności', 'umiejętności'])}.
      </p>
    </section>
  );
}

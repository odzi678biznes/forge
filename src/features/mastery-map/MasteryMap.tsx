import { useMemo } from 'react';
import { MASTERY_LABELS, MasteryLevel, type Skill, type SkillState } from '@/data/types';
import { layoutSkills, type Placed } from './layout';
import { MasteryNode } from './MasteryNode';
import './mastery-map.css';

/**
 * Mapa kompetencji - Blueprint sek. 7.3.
 *
 * "Klikniecie uruchamia trening, nie otwiera pustej strony statystyk" - dlatego
 * kazdy wezel jest przyciskiem startujacym misje celowana, a nie linkiem do
 * podstrony z wykresami.
 *
 * Warstwy biegna z gory na dol: fundamenty na gorze, kompetencje zalezne nizej.
 */

interface Props {
  skills: Skill[];
  states: Map<string, SkillState>;
  onSelect: (skill: Skill) => void;
  onBack: () => void;
}

export function MasteryMap({ skills, states, onSelect, onBack }: Props) {
  const { placed, edges } = useMemo(() => layoutSkills(skills), [skills]);

  const layers = useMemo(() => {
    const grouped = new Map<number, Placed[]>();
    for (const p of placed) {
      const bucket = grouped.get(p.layer);
      if (bucket) bucket.push(p);
      else grouped.set(p.layer, [p]);
    }
    return [...grouped].sort((a, b) => a[0] - b[0]);
  }, [placed]);

  const layerOf = useMemo(
    () => new Map(placed.map((p) => [p.skill.id, p])),
    [placed],
  );

  return (
    <main className="map">
      <header className="map__head">
        <button type="button" className="map__back" onClick={onBack}>
          &larr; Centrum dowodzenia
        </button>
        <h1 className="map__title">Mapa kompetencji</h1>
        <p className="map__hint">
          Kliknij wezel, zeby zaczac trening tej kompetencji.
        </p>
      </header>

      <div className="map__graph">
        {layers.map(([layer, members], i) => (
          <div key={layer}>
            {i > 0 && (
              <EdgeBand
                edges={edges}
                layerOf={layerOf}
                upperLayer={layers[i - 1]?.[0] ?? 0}
                lowerLayer={layer}
              />
            )}

            <div className="map__layer">
              <p className="map__layer-label">
                {layer === 0 ? 'Fundament' : `Wymaga poziomu ${layer}`}
              </p>
              <div className="map__row">
                {members.map((p) => {
                  const state = states.get(p.skill.id);
                  if (!state) return null;
                  return (
                    <button
                      key={p.skill.id}
                      type="button"
                      className="map__node"
                      onClick={() => onSelect(p.skill)}
                      aria-label={`Trenuj: ${p.skill.name}, poziom ${state.level} z 5, ${MASTERY_LABELS[state.level]}`}
                    >
                      <MasteryNode skill={p.skill} state={state} />
                      {p.skill.prerequisites.length > 0 && (
                        <span className="map__prereq">
                          wymaga: {p.skill.prerequisites.map(nameOf(skills)).join(', ')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Legend />
    </main>
  );
}

/**
 * Pas krawedzi miedzy dwiema sasiednimi warstwami. Wspolrzedne liczymy
 * z pozycji w warstwie, wiec nie potrzeba mierzenia DOM-u.
 */
function EdgeBand({
  edges,
  layerOf,
  upperLayer,
  lowerLayer,
}: {
  edges: Array<{ from: string; to: string }>;
  layerOf: Map<string, Placed>;
  upperLayer: number;
  lowerLayer: number;
}) {
  const lines = edges
    .map((e) => {
      const from = layerOf.get(e.from);
      const to = layerOf.get(e.to);
      if (!from || !to) return null;
      if (from.layer !== upperLayer || to.layer !== lowerLayer) return null;
      return { x1: centre(from), x2: centre(to), key: `${e.from}-${e.to}` };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  if (lines.length === 0) return <div className="map__band map__band--empty" />;

  return (
    <svg className="map__band" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {lines.map((l) => (
        <line key={l.key} x1={l.x1} y1="0" x2={l.x2} y2="100" className="map__edge" />
      ))}
    </svg>
  );
}

function centre(p: Placed): number {
  return ((p.column + 0.5) / p.layerSize) * 100;
}

function nameOf(skills: Skill[]) {
  return (id: string) => skills.find((s) => s.id === id)?.name ?? id;
}

function Legend() {
  return (
    <section className="map__legend" aria-label="Legenda">
      <p>
        <span className="map__swatch map__swatch--progress" />
        Wypelnienie obwodu - poziom opanowania (0-5)
      </p>
      <p>
        <span className="map__swatch map__swatch--challenge" />
        Bursztynowy obwod - powtorka wymagalna dzis
      </p>
      <p>
        <span className="map__swatch map__swatch--dot" />
        Kropka - powtarzajacy sie blad w tej kompetencji
      </p>
      <p className="map__legend-note">
        Poziom {MasteryLevel.Independent} oznacza typowe zadanie rozwiazane bez pomocy,
        poziom {MasteryLevel.Retained} - poprawna odpowiedz po odroczeniu.
      </p>
    </section>
  );
}

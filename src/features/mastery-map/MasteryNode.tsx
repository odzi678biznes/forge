import { MASTERY_LABELS, MasteryLevel, type Skill, type SkillState } from '@/data/types';
import './mastery-node.css';

/**
 * Wezel mapy kompetencji - Blueprint sek. 7.3.
 *
 * Kolor niesie poziom opanowania, obwod niesie termin powtorki, a znacznik
 * niesie powtarzajacy sie blad. Kazdy piksel cos znaczy; nie ma tu ozdob.
 *
 * Wezel animuje sie WYLACZNIE przy realnej zmianie poziomu (`justChanged`) -
 * to jest ruch jako informacja, a nie efekt (sek. 2).
 */

interface Props {
  skill: Skill;
  state: SkillState;
  justChanged?: boolean;
  now?: number;
}

const SIZE = 132;
const R = 52;
const CIRC = 2 * globalThis.Math.PI * R;

export function MasteryNode({ skill, state, justChanged = false, now = Date.now() }: Props) {
  const level = state.level;
  const fill = level / MasteryLevel.Retained;
  const hasError = state.recentErrors.length > 0;
  const due = state.reviewDueAt !== null && state.reviewDueAt <= now;

  return (
    <figure className={`node ${justChanged ? 'node--changed' : ''}`}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`${skill.name}: poziom ${level} z 5, ${MASTERY_LABELS[level]}`}
      >
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} className="node__track" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          className={`node__fill ${due ? 'node__fill--due' : ''}`}
          strokeDasharray={`${CIRC * fill} ${CIRC}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text x="50%" y="48%" className="node__level">
          {level}
        </text>
        <text x="50%" y="66%" className="node__max">
          / 5
        </text>
        {hasError && <circle cx={SIZE - 22} cy={22} r={6} className="node__error" />}
      </svg>

      <figcaption className="node__caption">
        <span className="node__name">{skill.name}</span>
        <span className="node__label">{MASTERY_LABELS[level]}</span>
        {due && <span className="node__due">powtorka dzis</span>}
      </figcaption>
    </figure>
  );
}

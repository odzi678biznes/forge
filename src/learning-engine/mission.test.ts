import { describe, expect, it } from 'vitest';
import { MasteryLevel, type Skill, type SkillState } from '@/data/types';
import {
  COMEBACK_THRESHOLD_DAYS,
  MISSION_LENGTHS,
  alternatives,
  recommendMission,
  startMission,
} from './mission';
import { DAY, T0, makeSkill, makeState } from './testing';

function world(
  entries: Array<[Skill, Partial<SkillState>]>,
  daysSinceLastSession: number | null = 0,
) {
  return {
    skills: entries.map(([s]) => s),
    states: new Map(
      entries.map(([s, st]) => [s.id, makeState({ skillId: s.id, ...st })]),
    ),
    now: T0,
    daysSinceLastSession,
  };
}

const s1 = makeSkill({ id: 's-1', name: 'Wyroznik' });
const s2 = makeSkill({ id: 's-2', name: 'Wierzcholek' });

describe('rekomendacja misji', () => {
  it('pierwsze uruchomienie daje rozgrzewke, nie pelny trening', () => {
    const plan = recommendMission(world([[s1, {}], [s2, {}]]));
    expect(plan.kind).toBe('warmup');
    expect(plan.questionCount).toBe(MISSION_LENGTHS.warmup);
  });

  it('wymagalna powtorka wygrywa z nowym materialem', () => {
    const plan = recommendMission(
      world([
        [s1, { totalAttempts: 3, reviewDueAt: T0 - DAY }],
        [s2, { totalAttempts: 1 }],
      ]),
    );
    expect(plan.kind).toBe('training');
    expect(plan.title).toBe('Powtorka');
  });

  it('bez powtorek, ale ze swiezym bledem proponuje naprawe i nazywa kompetencje', () => {
    const plan = recommendMission(
      world([[s1, { totalAttempts: 4, recentErrors: ['err-1'] }]]),
    );
    expect(plan.kind).toBe('repair');
    expect(plan.rationale).toContain('Wyroznik');
  });

  it('przerwa uruchamia protokol powrotu ponad wszystkim innym', () => {
    const plan = recommendMission(
      world(
        [[s1, { totalAttempts: 9, reviewDueAt: T0 - 5 * DAY, recentErrors: ['e'] }]],
        COMEBACK_THRESHOLD_DAYS,
      ),
    );
    expect(plan.kind).toBe('comeback');
  });

  it('protokol powrotu nie strofuje i nie kaze nadrabiac', () => {
    const plan = recommendMission(world([[s1, { totalAttempts: 9 }]], 6));
    expect(plan.rationale).toMatch(/bez nadrabiania/i);
    // Sek. 14: zero kar za przerwe i zero zawstydzania.
    expect(plan.rationale).not.toMatch(/stracil|kara|zmarnowa|powinienes|musisz/i);
  });

  it('dwa dni przerwy to jeszcze nie powrot', () => {
    const plan = recommendMission(world([[s1, { totalAttempts: 9 }]], 2));
    expect(plan.kind).not.toBe('comeback');
  });

  it('spokojny stan kieruje do najnizej ocenionej kompetencji', () => {
    const plan = recommendMission(
      world([
        [s1, { totalAttempts: 5, level: MasteryLevel.Transfer }],
        [s2, { totalAttempts: 5, level: MasteryLevel.Recognised }],
      ]),
    );
    expect(plan.kind).toBe('training');
    expect(plan.rationale).toContain('Wierzcholek');
  });

  it('kazda rekomendacja niesie uzasadnienie', () => {
    const plan = recommendMission(world([[s1, {}]]));
    expect(plan.rationale.trim().length).toBeGreaterThan(10);
  });

  it('liczba pytan jest znana z gory i dodatnia', () => {
    for (const kind of Object.keys(MISSION_LENGTHS) as Array<
      keyof typeof MISSION_LENGTHS
    >) {
      expect(MISSION_LENGTHS[kind]).toBeGreaterThan(0);
    }
  });
});

describe('alternatywy', () => {
  it('zawsze sa dokladnie dwie', () => {
    expect(alternatives(recommendMission(world([[s1, {}]])))).toHaveLength(2);
  });

  it('pierwsza jest krotsza od standardowego treningu', () => {
    const [shorter] = alternatives(recommendMission(world([[s1, {}]])));
    expect(shorter!.questionCount).toBeLessThan(MISSION_LENGTHS.training);
  });

  it('przy naprawie druga alternatywa pozwala isc do przodu', () => {
    const repair = recommendMission(
      world([[s1, { totalAttempts: 4, recentErrors: ['e'] }]]),
    );
    const [, other] = alternatives(repair);
    expect(other!.kind).toBe('training');
  });
});

describe('rozpoczecie misji', () => {
  it('misja startuje pusta i niezakonczona', () => {
    const plan = recommendMission(world([[s1, {}]]));
    const mission = startMission(plan, 'm-1', T0);
    expect(mission.questionIds).toEqual([]);
    expect(mission.finishedAt).toBeNull();
    expect(mission.startedAt).toBe(T0);
    expect(mission.rationale).toBe(plan.rationale);
  });
});

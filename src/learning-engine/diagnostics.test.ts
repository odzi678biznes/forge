import { describe, expect, it } from 'vitest';
import { MasteryLevel, type Attempt, type Skill, type Topic } from '@/data/types';
import {
  DIAGNOSTIC_CEILING,
  MISSIONS_PER_LEVEL,
  VARIANTS,
  analyseDiagnostic,
  buildDiagnosticSet,
  buildPlan,
} from './diagnostics';
import { DAY, T0, makeAttempt, makeQuestion, makeSkill } from './testing';

const topics: Topic[] = [
  { id: 't-1', subjectId: 'math', name: 'Dzial pierwszy' },
  { id: 't-2', subjectId: 'math', name: 'Dzial drugi' },
];

const skills: Skill[] = [
  makeSkill({ id: 's-1', topicId: 't-1', name: 'Kluczowa', examValue: 0.9 }),
  makeSkill({ id: 's-2', topicId: 't-1', name: 'Poboczna', examValue: 0.3 }),
  makeSkill({ id: 's-3', topicId: 't-2', name: 'Druga kluczowa', examValue: 0.8 }),
];

const probe = (skillId: string, over: Partial<Attempt> = {}) =>
  makeAttempt({ id: `a-${skillId}`, skillId, questionId: `q-${skillId}`, ...over });

describe('zestaw diagnostyczny', () => {
  it('obejmuje kazda kompetencje dokladnie raz', () => {
    const questions = skills.flatMap((s) => [
      makeQuestion({ id: `${s.id}-t`, skillId: s.id, kind: 'typical', difficulty: 3 }),
      makeQuestion({ id: `${s.id}-f`, skillId: s.id, kind: 'foundation', difficulty: 1 }),
    ]);
    const set = buildDiagnosticSet(skills, questions);
    expect(set).toHaveLength(skills.length);
    expect(new Set(set.map((q) => q.skillId)).size).toBe(skills.length);
  });

  it('wybiera zadanie typowe, nie fundament ani transfer', () => {
    const questions = [
      makeQuestion({ id: 'f', skillId: 's-1', kind: 'foundation', difficulty: 3 }),
      makeQuestion({ id: 't', skillId: 's-1', kind: 'typical', difficulty: 3 }),
      makeQuestion({ id: 'x', skillId: 's-1', kind: 'transfer', difficulty: 3 }),
    ];
    const set = buildDiagnosticSet([skills[0]!], questions);
    expect(set[0]?.id).toBe('t');
  });

  it('celuje w srodek skali trudnosci', () => {
    const questions = [
      makeQuestion({ id: 'latwe', skillId: 's-1', kind: 'typical', difficulty: 1 }),
      makeQuestion({ id: 'srednie', skillId: 's-1', kind: 'typical', difficulty: 3 }),
      makeQuestion({ id: 'trudne', skillId: 's-1', kind: 'typical', difficulty: 5 }),
    ];
    expect(buildDiagnosticSet([skills[0]!], questions)[0]?.id).toBe('srednie');
  });

  it('kompetencja bez pytan nie blokuje diagnozy', () => {
    const set = buildDiagnosticSet(skills, [
      makeQuestion({ id: 'q', skillId: 's-1', kind: 'typical' }),
    ]);
    expect(set).toHaveLength(1);
  });

  it('gdy brak zadan typowych, siega po cokolwiek zamiast pomijac kompetencje', () => {
    const set = buildDiagnosticSet([skills[0]!], [
      makeQuestion({ id: 'tylko-transfer', skillId: 's-1', kind: 'transfer' }),
    ]);
    expect(set[0]?.id).toBe('tylko-transfer');
  });
});

describe('odczyt wyniku sondy', () => {
  it('poprawnie bez pomocy daje poziom samodzielnosci', () => {
    const r = analyseDiagnostic([probe('s-1', { hintLevel: 0 })], skills, topics, T0);
    expect(r.skills.find((s) => s.skillId === 's-1')?.estimatedLevel).toBe(
      MasteryLevel.Independent,
    );
  });

  it('poprawnie po malej wskazowce daje poziom wspomagany', () => {
    const r = analyseDiagnostic([probe('s-1', { hintLevel: 2 })], skills, topics, T0);
    expect(r.skills.find((s) => s.skillId === 's-1')?.estimatedLevel).toBe(
      MasteryLevel.Assisted,
    );
  });

  it('blad rozpoznany jako typowy daje poziom rozpoznania, nie zero', () => {
    const r = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', errorId: 'err-znak' })],
      skills,
      topics,
      T0,
    );
    expect(r.skills.find((s) => s.skillId === 's-1')?.estimatedLevel).toBe(
      MasteryLevel.Recognised,
    );
  });

  it('blad nierozpoznany daje poziom zerowy', () => {
    const r = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', errorId: null })],
      skills,
      topics,
      T0,
    );
    expect(r.skills.find((s) => s.skillId === 's-1')?.estimatedLevel).toBe(
      MasteryLevel.Unknown,
    );
  });

  it('diagnoza NIGDY nie przyznaje poziomow 4 i 5', () => {
    const r = analyseDiagnostic(
      skills.map((s) => probe(s.id, { hintLevel: 0, confidence: 'sure' })),
      skills,
      topics,
      T0,
    );
    for (const d of r.skills) {
      expect(d.estimatedLevel, d.skillId).toBeLessThanOrEqual(DIAGNOSTIC_CEILING);
    }
  });

  it('kompetencja bez sondy jest oznaczona jako niesprawdzona', () => {
    const r = analyseDiagnostic([probe('s-1')], skills, topics, T0);
    const nieprobowana = r.skills.find((s) => s.skillId === 's-2');
    expect(nieprobowana?.probed).toBe(false);
    expect(r.probesAnswered).toBe(1);
    expect(r.probesTotal).toBe(3);
  });

  it('powtorzona diagnoza zastepuje poprzednia, nie usrednia', () => {
    const r = analyseDiagnostic(
      [
        probe('s-1', { answeredAt: T0, correctness: 'incorrect', errorId: null }),
        probe('s-1', { id: 'a-2', answeredAt: T0 + DAY, hintLevel: 0 }),
      ],
      skills,
      topics,
      T0,
    );
    expect(r.skills.find((s) => s.skillId === 's-1')?.estimatedLevel).toBe(
      MasteryLevel.Independent,
    );
  });
});

describe('rozjazd pewnosci z wynikiem', () => {
  it('pewna zla odpowiedz trafia na liste nadmiernej pewnosci', () => {
    const r = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', confidence: 'sure', errorId: null })],
      skills,
      topics,
      T0,
    );
    expect(r.overconfident.map((o) => o.skillId)).toContain('s-1');
  });

  it('zgadywana zla odpowiedz nie jest nadmierna pewnoscia', () => {
    const r = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', confidence: 'guess', errorId: null })],
      skills,
      topics,
      T0,
    );
    expect(r.overconfident).toEqual([]);
  });

  it('pewna poprawna odpowiedz nie jest problemem', () => {
    const r = analyseDiagnostic(
      [probe('s-1', { correctness: 'correct', confidence: 'sure' })],
      skills,
      topics,
      T0,
    );
    expect(r.overconfident).toEqual([]);
  });
});

describe('raport dzialow', () => {
  it('dzialy sa uszeregowane wedlug priorytetu', () => {
    const r = analyseDiagnostic(
      [
        probe('s-1', { hintLevel: 0 }),
        probe('s-2', { hintLevel: 0 }),
        probe('s-3', { correctness: 'incorrect', errorId: null }),
      ],
      skills,
      topics,
      T0,
    );
    expect(r.topics[0]?.topicId).toBe('t-2');
  });

  it('liczy kompetencje ponizej celu w kazdym dziale', () => {
    const r = analyseDiagnostic(
      [probe('s-1', { hintLevel: 0 }), probe('s-2', { correctness: 'incorrect', errorId: null })],
      skills,
      topics,
      T0,
    );
    const t1 = r.topics.find((t) => t.topicId === 't-1');
    expect(t1?.skillsTotal).toBe(2);
    expect(t1?.skillsBelowTarget).toBe(1);
  });

  it('priorytet miesci sie w 0..1', () => {
    const r = analyseDiagnostic([], skills, topics, T0);
    for (const t of r.topics) {
      expect(t.priority).toBeGreaterThanOrEqual(0);
      expect(t.priority).toBeLessThanOrEqual(1);
    }
  });

  it('dzial bez kompetencji nie trafia do raportu', () => {
    const r = analyseDiagnostic([], skills, [
      ...topics,
      { id: 't-pusty', subjectId: 'math', name: 'Pusty' },
    ], T0);
    expect(r.topics.map((t) => t.topicId)).not.toContain('t-pusty');
  });
});

describe('plan z wynikow', () => {
  const fullReport = () =>
    analyseDiagnostic(
      [
        probe('s-1', { correctness: 'incorrect', errorId: null }),
        probe('s-2', { hintLevel: 0 }),
        probe('s-3', { hintLevel: 2 }),
      ],
      skills,
      topics,
      T0,
    );

  it('pomija kompetencje, ktore juz osiagnely cel wariantu', () => {
    const plan = buildPlan(fullReport(), skills, topics, 'minimum');
    // s-2 ma niska wage maturalna, cel to poziom 2, a sonda dala 3.
    expect(plan.steps.map((s) => s.skillId)).not.toContain('s-2');
  });

  it('kluczowe kompetencje dostaja wyzszy cel niz poboczne', () => {
    const plan = buildPlan(fullReport(), skills, topics, 'realistic');
    const kluczowa = plan.steps.find((s) => s.skillId === 's-1');
    const poboczna = plan.steps.find((s) => s.skillId === 's-2');
    expect(kluczowa?.targetLevel).toBe(VARIANTS.realistic.targetHigh);
    if (poboczna) expect(poboczna.targetLevel).toBe(VARIANTS.realistic.targetRest);
  });

  it('ambitny wariant wymaga wiecej pracy niz minimum', () => {
    const r = fullReport();
    const min = buildPlan(r, skills, topics, 'minimum');
    const amb = buildPlan(r, skills, topics, 'ambitious');
    expect(amb.totalMissions).toBeGreaterThan(min.totalMissions);
  });

  it('szacunek misji wynika z wielkosci luki', () => {
    const plan = buildPlan(fullReport(), skills, topics, 'minimum');
    for (const s of plan.steps) {
      expect(s.estimatedMissions).toBe((s.targetLevel - s.fromLevel) * MISSIONS_PER_LEVEL);
    }
  });

  it('kazdy krok niesie uzasadnienie', () => {
    const plan = buildPlan(fullReport(), skills, topics, 'realistic');
    expect(plan.steps.length).toBeGreaterThan(0);
    for (const s of plan.steps) expect(s.reason.trim().length).toBeGreaterThan(10);
  });

  it('kroki sa uszeregowane, najpilniejszy pierwszy', () => {
    const plan = buildPlan(fullReport(), skills, topics, 'realistic');
    expect(plan.steps[0]?.skillId).toBe('s-1');
  });
});

describe('plan wobec terminu', () => {
  const report = () =>
    analyseDiagnostic(
      skills.map((s) => probe(s.id, { correctness: 'incorrect', errorId: null })),
      skills,
      topics,
      T0,
    );

  it('bez terminu nie orzeka o zmieszczeniu sie', () => {
    const plan = buildPlan(report(), skills, topics, 'realistic', null);
    expect(plan.fitsDeadline).toBeNull();
  });

  it('odlegly termin pozwala zmiescic nawet ambitny wariant', () => {
    const plan = buildPlan(report(), skills, topics, 'ambitious', T0 + 365 * DAY);
    expect(plan.fitsDeadline).toBe(true);
    expect(plan.verdict).toMatch(/mie[sś]ci si[eę] w terminie/i);
  });

  it('zbyt krotki termin jest nazwany wprost, bez obietnic bez pokrycia', () => {
    const plan = buildPlan(report(), skills, topics, 'ambitious', T0 + 3 * DAY);
    expect(plan.fitsDeadline).toBe(false);
    expect(plan.verdict).toMatch(/nie mie[sś]ci si[eę]/i);
    expect(plan.verdict).toMatch(/l[zż]ejszy wariant/i);
  });

  it('domkniety plan mowi to wprost zamiast wymyslac prace', () => {
    const r = analyseDiagnostic(
      skills.map((s) => probe(s.id, { hintLevel: 0 })),
      skills,
      topics,
      T0,
    );
    const plan = buildPlan(r, skills, topics, 'minimum');
    expect(plan.steps).toEqual([]);
    expect(plan.totalMissions).toBe(0);
    expect(plan.verdict).toMatch(/osi[aą]gni[eę]te/i);
  });
});

describe('kryterium etapu: plan z wynikow, nie z samooceny', () => {
  it('ten sam wariant i te same wyniki daja ten sam plan', () => {
    const r = analyseDiagnostic([probe('s-1', { hintLevel: 0 })], skills, topics, T0);
    const a = buildPlan(r, skills, topics, 'realistic');
    const b = buildPlan(r, skills, topics, 'realistic');
    expect(a.steps).toEqual(b.steps);
  });

  it('zmiana wyniku sondy zmienia plan', () => {
    const slaby = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', errorId: null })],
      skills,
      topics,
      T0,
    );
    const mocny = analyseDiagnostic([probe('s-1', { hintLevel: 0 })], skills, topics, T0);

    const planSlaby = buildPlan(slaby, skills, topics, 'minimum');
    const planMocny = buildPlan(mocny, skills, topics, 'minimum');
    expect(planSlaby.totalMissions).toBeGreaterThan(planMocny.totalMissions);
  });

  it('deklarowana pewnosc nie podnosi ani nie obniza poziomu', () => {
    const pewny = analyseDiagnostic(
      [probe('s-1', { hintLevel: 0, confidence: 'sure' })],
      skills,
      topics,
      T0,
    );
    const zgadujacy = analyseDiagnostic(
      [probe('s-1', { hintLevel: 0, confidence: 'guess' })],
      skills,
      topics,
      T0,
    );
    expect(pewny.skills.find((s) => s.skillId === 's-1')?.estimatedLevel).toBe(
      zgadujacy.skills.find((s) => s.skillId === 's-1')?.estimatedLevel,
    );
  });
});

describe('prog nadmiernej pewnosci', () => {
  const wynik = (confidence: Attempt['confidence']) =>
    analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', confidence, errorId: null })],
      skills,
      topics,
      T0,
    ).overconfident.map((o) => o.skillId);

  it('domyslna pewnosc "czesciowo wiem" nie jest nadmierna pewnoscia', () => {
    // Arena ustawia 'partial' domyslnie. Gdyby liczylo sie jako nadmierna
    // pewnosc, lista objelaby kazda bledna odpowiedz i stracilaby sens.
    expect(wynik('partial')).toEqual([]);
  });

  it('tylko deklaracja "jestem pewny" przy bledzie trafia na liste', () => {
    expect(wynik('sure')).toEqual(['s-1']);
    expect(wynik('guess')).toEqual([]);
  });

  it('uzasadnienie kroku planu uzywa tego samego progu', () => {
    const pewny = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', confidence: 'sure', errorId: null })],
      skills,
      topics,
      T0,
    );
    const domyslny = analyseDiagnostic(
      [probe('s-1', { correctness: 'incorrect', confidence: 'partial', errorId: null })],
      skills,
      topics,
      T0,
    );

    const krok = (r: typeof pewny) =>
      buildPlan(r, skills, topics, 'minimum').steps.find((s) => s.skillId === 's-1')?.reason ?? '';

    expect(krok(pewny)).toMatch(/pewno[sś][cć]/i);
    expect(krok(domyslny)).not.toMatch(/pewno[sś][cć]/i);
  });
});

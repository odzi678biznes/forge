import { describe, expect, it } from 'vitest';
import { MasteryLevel, type Question, type Skill, type SkillState } from '@/data/types';
import { selectNextQuestion, type SelectionInput } from './selector';
import { scoreSkill } from './priority';
import { DAY, T0, makeQuestion, makeSkill, makeState } from './testing';

/** Buduje wejscie selektora z kilku kompetencji naraz. */
function input(
  entries: Array<{ skill: Skill; state: SkillState; questions: Question[] }>,
  over: Partial<SelectionInput> = {},
): SelectionInput {
  return {
    skills: entries.map((e) => e.skill),
    states: new Map(entries.map((e) => [e.skill.id, e.state])),
    questions: entries.flatMap((e) => e.questions),
    askedQuestionIds: new Set<string>(),
    recentSkillIds: [],
    now: T0,
    ...over,
  };
}

function skillWith(id: string, kinds: Question['kind'][]): Question[] {
  return kinds.map((kind, i) =>
    makeQuestion({ id: `${id}-${kind}-${i}`, skillId: id, kind, difficulty: 3 }),
  );
}

describe('dobor kolejnego pytania', () => {
  it('powtorka wymagalna bije wszystko inne', () => {
    const due = {
      skill: makeSkill({ id: 'due', examValue: 0.1 }),
      state: makeState({
        skillId: 'due',
        level: MasteryLevel.Independent,
        reviewDueAt: T0 - DAY,
      }),
      questions: skillWith('due', ['typical']),
    };
    const shiny = {
      skill: makeSkill({ id: 'shiny', examValue: 1 }),
      state: makeState({ skillId: 'shiny', level: MasteryLevel.Unknown }),
      questions: skillWith('shiny', ['typical']),
    };

    const sel = selectNextQuestion(input([shiny, due]));
    expect(sel?.rule).toBe('review-due');
    expect(sel?.skill.id).toBe('due');
  });

  it('po dwoch samodzielnych sukcesach siega po transfer', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({
        skillId: 's',
        level: MasteryLevel.Independent,
        independentStreak: 2,
      }),
      questions: skillWith('s', ['typical', 'transfer']),
    };
    const sel = selectNextQuestion(input([e]));
    expect(sel?.rule).toBe('transfer-check');
    expect(sel?.question.kind).toBe('transfer');
  });

  it('po swiezym bledzie schodzi do fundamentu tej samej kompetencji', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({
        skillId: 's',
        level: MasteryLevel.Assisted,
        recentErrors: ['err-1'],
        independentStreak: 0,
      }),
      questions: skillWith('s', ['typical', 'foundation']),
    };
    const sel = selectNextQuestion(input([e]));
    expect(sel?.rule).toBe('foundation-repair');
    expect(sel?.question.kind).toBe('foundation');
    expect(sel?.skill.id).toBe('s');
  });

  it('trzy zadania tej samej kompetencji z rzedu wymuszaja przeplecenie', () => {
    const hot = {
      skill: makeSkill({ id: 'hot', examValue: 1 }),
      state: makeState({ skillId: 'hot', level: MasteryLevel.Unknown }),
      questions: skillWith('hot', ['typical']),
    };
    const cold = {
      skill: makeSkill({ id: 'cold', examValue: 0.1 }),
      state: makeState({ skillId: 'cold', level: MasteryLevel.Transfer }),
      questions: skillWith('cold', ['typical']),
    };

    const sel = selectNextQuestion(
      input([hot, cold], { recentSkillIds: ['hot', 'hot', 'hot'] }),
    );
    expect(sel?.skill.id).toBe('cold');
  });

  it('dwa zadania z rzedu jeszcze nie wymuszaja zmiany', () => {
    const hot = {
      skill: makeSkill({ id: 'hot', examValue: 1 }),
      state: makeState({ skillId: 'hot', level: MasteryLevel.Unknown }),
      questions: skillWith('hot', ['typical']),
    };
    const cold = {
      skill: makeSkill({ id: 'cold', examValue: 0.1 }),
      state: makeState({ skillId: 'cold', level: MasteryLevel.Transfer }),
      questions: skillWith('cold', ['typical']),
    };

    const sel = selectNextQuestion(
      input([hot, cold], { recentSkillIds: ['hot', 'hot'] }),
    );
    expect(sel?.skill.id).toBe('hot');
  });

  it('nie powtarza pytania zadanego juz w tej misji', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({ skillId: 's' }),
      questions: [
        makeQuestion({ id: 'q-a', skillId: 's' }),
        makeQuestion({ id: 'q-b', skillId: 's' }),
      ],
    };
    const sel = selectNextQuestion(
      input([e], { askedQuestionIds: new Set(['q-a']) }),
    );
    expect(sel?.question.id).toBe('q-b');
  });

  it('zwraca null, gdy pula pytan sie wyczerpala', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({ skillId: 's' }),
      questions: [makeQuestion({ id: 'q-a', skillId: 's' })],
    };
    const sel = selectNextQuestion(
      input([e], { askedQuestionIds: new Set(['q-a']) }),
    );
    expect(sel).toBeNull();
  });

  it('celuje w trudnosc tuz przy poziomie, nie w najtrudniejsze dostepne', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({ skillId: 's', level: MasteryLevel.Recognised }),
      questions: [
        makeQuestion({ id: 'easy', skillId: 's', difficulty: 1 }),
        makeQuestion({ id: 'fit', skillId: 's', difficulty: 2 }),
        makeQuestion({ id: 'hard', skillId: 's', difficulty: 5 }),
      ],
    };
    const sel = selectNextQuestion(input([e]));
    expect(sel?.question.id).toBe('fit');
  });

  it('wskazana kompetencja wygrywa z wyzej punktowana', () => {
    const hot = {
      skill: makeSkill({ id: 'hot', examValue: 1 }),
      state: makeState({ skillId: 'hot', level: MasteryLevel.Unknown }),
      questions: skillWith('hot', ['typical']),
    };
    const wybrana = {
      skill: makeSkill({ id: 'wybrana', examValue: 0.1 }),
      state: makeState({ skillId: 'wybrana', level: MasteryLevel.Transfer }),
      questions: skillWith('wybrana', ['typical']),
    };

    const sel = selectNextQuestion(input([hot, wybrana], { focusSkillId: 'wybrana' }));
    expect(sel?.skill.id).toBe('wybrana');
  });

  it('wyczerpana pula wskazanej kompetencji nie zostawia pustego ekranu', () => {
    const wybrana = {
      skill: makeSkill({ id: 'wybrana' }),
      state: makeState({ skillId: 'wybrana' }),
      questions: [makeQuestion({ id: 'q-wybrana', skillId: 'wybrana' })],
    };
    const inna = {
      skill: makeSkill({ id: 'inna' }),
      state: makeState({ skillId: 'inna' }),
      questions: [makeQuestion({ id: 'q-inna', skillId: 'inna' })],
    };

    const sel = selectNextQuestion(
      input([wybrana, inna], {
        focusSkillId: 'wybrana',
        askedQuestionIds: new Set(['q-wybrana']),
      }),
    );
    expect(sel?.question.id).toBe('q-inna');
  });

  it('wskazanie kompetencji ze swiezym bledem zaczyna od fundamentu', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({ skillId: 's', recentErrors: ['err-1'], independentStreak: 0 }),
      questions: skillWith('s', ['typical', 'foundation']),
    };
    const sel = selectNextQuestion(input([e], { focusSkillId: 's' }));
    expect(sel?.rule).toBe('foundation-repair');
  });

  it('kazdy wybor niesie uzasadnienie dla uzytkownika', () => {
    const e = {
      skill: makeSkill({ id: 's' }),
      state: makeState({ skillId: 's' }),
      questions: skillWith('s', ['typical']),
    };
    const sel = selectNextQuestion(input([e]));
    expect(sel?.reasons.length).toBeGreaterThan(0);
    expect(sel?.reasons[0]).toMatch(/\S/);
  });
});

describe('funkcja priorytetu', () => {
  it('miesci sie w przedziale 0..1', () => {
    const maxed = scoreSkill(
      makeSkill({ examValue: 1 }),
      makeState({
        level: MasteryLevel.Unknown,
        reviewDueAt: T0 - 30 * DAY,
        recentErrors: ['a', 'b', 'c', 'd', 'e', 'f'],
      }),
      { now: T0, recentSkillIds: [] },
    );
    expect(maxed.total).toBeLessThanOrEqual(1);
    expect(maxed.total).toBeGreaterThan(0.9);

    const idle = scoreSkill(
      makeSkill({ examValue: 0 }),
      makeState({ level: MasteryLevel.Retained }),
      { now: T0, recentSkillIds: ['skill-1'] },
    );
    expect(idle.total).toBe(0);
  });

  it('powtorka przed terminem nie podbija priorytetu', () => {
    const b = scoreSkill(makeSkill(), makeState({ reviewDueAt: T0 + DAY }), {
      now: T0,
      recentSkillIds: [],
    });
    expect(b.reviewDue).toBe(0);
  });

  it('spoznienie podbija skladnik powtorki od 0,6 do 1', () => {
    const today = scoreSkill(makeSkill(), makeState({ reviewDueAt: T0 }), {
      now: T0,
      recentSkillIds: [],
    });
    const late = scoreSkill(makeSkill(), makeState({ reviewDueAt: T0 - 7 * DAY }), {
      now: T0,
      recentSkillIds: [],
    });
    expect(today.reviewDue).toBeCloseTo(0.6);
    expect(late.reviewDue).toBeCloseTo(1);
  });

  it('wagi sumuja sie do 1', () => {
    const b = scoreSkill(
      makeSkill({ examValue: 1 }),
      makeState({
        level: MasteryLevel.Unknown,
        reviewDueAt: T0 - 7 * DAY,
        recentErrors: ['a', 'b', 'c', 'd', 'e'],
      }),
      { now: T0, recentSkillIds: [] },
    );
    expect(b.total).toBeCloseTo(1);
  });
});

import {
  MasteryLevel,
  emptySkillState,
  type Attempt,
  type Question,
  type Skill,
  type SkillState,
} from '@/data/types';

/** Fabryki danych testowych - wspolne dla kilku plikow testow. */

export const DAY = 24 * 60 * 60 * 1000;
export const T0 = Date.UTC(2026, 0, 1);

export function makeSkill(over: Partial<Skill> = {}): Skill {
  return {
    id: 'skill-1',
    topicId: 'topic-1',
    name: 'Testowa kompetencja',
    ckeRequirement: 'X.1',
    prerequisites: [],
    examValue: 0.5,
    ...over,
  };
}

export function makeQuestion(over: Partial<Question> = {}): Question {
  return {
    id: 'q-1',
    skillId: 'skill-1',
    kind: 'typical',
    prompt: 'Tresc',
    format: 'numeric',
    answer: '1',
    acceptedVariants: [],
    solution: 'Rozwiazanie',
    hints: [],
    commonErrors: [],
    difficulty: 3,
    source: 'test',
    verified: true,
    ...over,
  };
}

export function makeState(over: Partial<SkillState> = {}): SkillState {
  return { ...emptySkillState('skill-1'), ...over };
}

export function makeAttempt(over: Partial<Attempt> = {}): Attempt {
  return {
    id: 'a-1',
    questionId: 'q-1',
    skillId: 'skill-1',
    missionId: 'm-1',
    startedAt: T0,
    answeredAt: T0 + 60_000,
    userAnswer: '1',
    correctness: 'correct',
    confidence: 'sure',
    hintLevel: 0,
    errorId: null,
    gradingVersion: 'v1',
    gradedBy: 'auto',
    ...over,
  };
}

export const LEVELS = MasteryLevel;

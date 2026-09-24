import type { Question, Skill, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { MATH } from './funkcja-kwadratowa';
import { QUAD_CARDS, QUAD_LESSONS, QUAD_QUESTIONS, QUAD_SKILLS, QUAD_TOPIC } from './kurs/kwadratowa';
import {
  POLY_CARDS,
  POLY_LESSONS,
  POLY_QUESTIONS,
  POLY_SKILLS,
  POLY_TOPIC,
} from './kurs/wielomiany';
import { SEQUENCE_QUESTIONS, SEQUENCE_SKILLS, SEQUENCE_TOPIC } from './ciagi';
import {
  EXP_CARDS,
  EXP_LESSONS,
  EXP_QUESTIONS,
  EXP_SKILLS,
  EXP_TOPIC,
} from './kurs/wykladnicza';
import { TRIG_QUESTIONS, TRIG_SKILLS, TRIG_TOPIC } from './trygonometria';
import { GEO_QUESTIONS, GEO_SKILLS, GEO_TOPIC } from './geometria-analityczna';
import { DERIV_QUESTIONS, DERIV_SKILLS, DERIV_TOPIC } from './pochodne';
import { PROB_QUESTIONS, PROB_SKILLS, PROB_TOPIC } from './prawdopodobienstwo';
import {
  NUMBERS_CARDS,
  NUMBERS_LESSONS,
  NUMBERS_QUESTIONS,
  NUMBERS_SKILLS,
  NUMBERS_TOPIC,
} from './kurs/liczby';
import {
  ALGEBRA_CARDS,
  ALGEBRA_LESSONS,
  ALGEBRA_QUESTIONS,
  ALGEBRA_SKILLS,
  ALGEBRA_TOPIC,
} from './kurs/wyrazenia';
import {
  EQUATIONS_CARDS,
  EQUATIONS_LESSONS,
  EQUATIONS_QUESTIONS,
  EQUATIONS_SKILLS,
  EQUATIONS_TOPIC,
} from './kurs/rownania';
import {
  FUNCTIONS_CARDS,
  FUNCTIONS_LESSONS,
  FUNCTIONS_QUESTIONS,
  FUNCTIONS_SKILLS,
  FUNCTIONS_TOPIC,
} from './kurs/funkcje';
import {
  LINEAR_CARDS,
  LINEAR_LESSONS,
  LINEAR_QUESTIONS,
  LINEAR_SKILLS,
  LINEAR_TOPIC,
} from './kurs/liniowa';

/**
 * Korpus tresci matematycznej.
 *
 * Tresc zyje w repozytorium jako kod, nie w bazie (Blueprint sek. 10): dzieki
 * temu wersjonuje sie razem z aplikacja, a testy spojnosci uruchamiaja sie
 * w CI zanim material trafi do ucznia.
 *
 * WAZNE: kazde pytanie ma `verified: false`, dopoki nie przejdzie weryfikacji
 * merytorycznej wzgledem informatora CKE. Ten zbior jest przekrojem dzialow
 * wystarczajacym do dzialania diagnozy (sek. 15, Etap 3), a nie pelnym
 * odwzorowaniem podstawy programowej.
 */

export { MATH };

/** Kolejność działów = kolejność kursu (kalendarz i mapa kursu idą po niej). */
export const MATH_TOPICS: Topic[] = [
  NUMBERS_TOPIC,
  ALGEBRA_TOPIC,
  EQUATIONS_TOPIC,
  FUNCTIONS_TOPIC,
  LINEAR_TOPIC,
  QUAD_TOPIC,
  POLY_TOPIC,
  EXP_TOPIC,
  SEQUENCE_TOPIC,
  TRIG_TOPIC,
  GEO_TOPIC,
  DERIV_TOPIC,
  PROB_TOPIC,
];

export const MATH_SKILLS: Skill[] = [
  ...NUMBERS_SKILLS,
  ...ALGEBRA_SKILLS,
  ...EQUATIONS_SKILLS,
  ...FUNCTIONS_SKILLS,
  ...LINEAR_SKILLS,
  ...QUAD_SKILLS,
  ...POLY_SKILLS,
  ...EXP_SKILLS,
  ...SEQUENCE_SKILLS,
  ...TRIG_SKILLS,
  ...GEO_SKILLS,
  ...DERIV_SKILLS,
  ...PROB_SKILLS,
];

export const MATH_QUESTIONS: Question[] = [
  ...NUMBERS_QUESTIONS,
  ...ALGEBRA_QUESTIONS,
  ...EQUATIONS_QUESTIONS,
  ...FUNCTIONS_QUESTIONS,
  ...LINEAR_QUESTIONS,
  ...QUAD_QUESTIONS,
  ...POLY_QUESTIONS,
  ...EXP_QUESTIONS,
  ...SEQUENCE_QUESTIONS,
  ...TRIG_QUESTIONS,
  ...GEO_QUESTIONS,
  ...DERIV_QUESTIONS,
  ...PROB_QUESTIONS,
];

export type { Corpus };

export const MATH_CORPUS: Corpus = {
  subject: MATH,
  topics: MATH_TOPICS,
  skills: MATH_SKILLS,
  questions: MATH_QUESTIONS,
  lessons: [
    ...NUMBERS_LESSONS,
    ...ALGEBRA_LESSONS,
    ...EQUATIONS_LESSONS,
    ...FUNCTIONS_LESSONS,
    ...LINEAR_LESSONS,
    ...QUAD_LESSONS,
    ...POLY_LESSONS,
    ...EXP_LESSONS,
  ],
  flashcards: [
    ...NUMBERS_CARDS,
    ...ALGEBRA_CARDS,
    ...EQUATIONS_CARDS,
    ...FUNCTIONS_CARDS,
    ...LINEAR_CARDS,
    ...QUAD_CARDS,
    ...POLY_CARDS,
    ...EXP_CARDS,
  ],
};

/** Kompetencje nalezace do danego dzialu. */
export function skillsOfTopic(topicId: string): Skill[] {
  return MATH_SKILLS.filter((s) => s.topicId === topicId);
}

/** Pytania sprawdzajace dana kompetencje. */
export function questionsOfSkill(skillId: string): Question[] {
  return MATH_QUESTIONS.filter((q) => q.skillId === skillId);
}

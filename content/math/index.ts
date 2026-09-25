import type { Question, Skill, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { MATH } from './funkcja-kwadratowa';
import './weryfikacja-starych';
import { QUAD_CARDS, QUAD_LESSONS, QUAD_QUESTIONS, QUAD_SKILLS, QUAD_TOPIC } from './kurs/kwadratowa';
import {
  POLY_CARDS,
  POLY_LESSONS,
  POLY_QUESTIONS,
  POLY_SKILLS,
  POLY_TOPIC,
} from './kurs/wielomiany';
import { RAT_CARDS, RAT_LESSONS, RAT_QUESTIONS, RAT_SKILLS, RAT_TOPIC } from './kurs/wymierne';
import { SEQ_CARDS, SEQ_LESSONS, SEQ_QUESTIONS, SEQ_SKILLS, SEQ_TOPIC } from './kurs/ciagi';
import {
  EXP_CARDS,
  EXP_LESSONS,
  EXP_QUESTIONS,
  EXP_SKILLS,
  EXP_TOPIC,
} from './kurs/wykladnicza';
import {
  TRIG_CARDS,
  TRIG_COURSE_QUESTIONS,
  TRIG_COURSE_SKILLS,
  TRIG_COURSE_TOPIC,
  TRIG_LESSONS,
} from './kurs/trygonometria';
import { PLAN_CARDS, PLAN_LESSONS, PLAN_QUESTIONS, PLAN_SKILLS, PLAN_TOPIC } from './kurs/planimetria';
import {
  GEO_CARDS,
  GEO_COURSE_QUESTIONS,
  GEO_COURSE_SKILLS,
  GEO_COURSE_TOPIC,
  GEO_LESSONS,
} from './kurs/analityczna';
import {
  STEREO_CARDS,
  STEREO_LESSONS,
  STEREO_QUESTIONS,
  STEREO_SKILLS,
  STEREO_TOPIC,
} from './kurs/stereometria';
import {
  DERIV_CARDS,
  DERIV_COURSE_QUESTIONS,
  DERIV_COURSE_SKILLS,
  DERIV_COURSE_TOPIC,
  DERIV_LESSONS,
} from './kurs/pochodne';
import { EXTRA_CARDS, EXTRA_LESSONS, EXTRA_QUESTIONS, EXTRA_SKILLS } from './kurs/uzupelnienia';
import {
  PROB_CARDS,
  PROB_COURSE_QUESTIONS,
  PROB_COURSE_SKILLS,
  PROB_COURSE_TOPIC,
  PROB_LESSONS,
} from './kurs/prawdopodobienstwo';
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
  RAT_TOPIC,
  EXP_TOPIC,
  SEQ_TOPIC,
  TRIG_COURSE_TOPIC,
  PLAN_TOPIC,
  GEO_COURSE_TOPIC,
  STEREO_TOPIC,
  PROB_COURSE_TOPIC,
  DERIV_COURSE_TOPIC,
];

export const MATH_SKILLS: Skill[] = [
  ...NUMBERS_SKILLS,
  ...ALGEBRA_SKILLS,
  ...EQUATIONS_SKILLS,
  ...FUNCTIONS_SKILLS,
  ...LINEAR_SKILLS,
  ...QUAD_SKILLS,
  ...POLY_SKILLS,
  ...RAT_SKILLS,
  ...EXP_SKILLS,
  ...SEQ_SKILLS,
  ...TRIG_COURSE_SKILLS,
  ...PLAN_SKILLS,
  ...GEO_COURSE_SKILLS,
  ...STEREO_SKILLS,
  ...PROB_COURSE_SKILLS,
  ...DERIV_COURSE_SKILLS,
  // Uzupełnienia do podstawy z 2024 r. - każda na końcu swojego działu.
  ...EXTRA_SKILLS,
];

export const MATH_QUESTIONS: Question[] = [
  ...NUMBERS_QUESTIONS,
  ...ALGEBRA_QUESTIONS,
  ...EQUATIONS_QUESTIONS,
  ...FUNCTIONS_QUESTIONS,
  ...LINEAR_QUESTIONS,
  ...QUAD_QUESTIONS,
  ...POLY_QUESTIONS,
  ...RAT_QUESTIONS,
  ...EXP_QUESTIONS,
  ...SEQ_QUESTIONS,
  ...TRIG_COURSE_QUESTIONS,
  ...PLAN_QUESTIONS,
  ...GEO_COURSE_QUESTIONS,
  ...STEREO_QUESTIONS,
  ...PROB_COURSE_QUESTIONS,
  ...DERIV_COURSE_QUESTIONS,
  ...EXTRA_QUESTIONS,
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
    ...RAT_LESSONS,
    ...EXP_LESSONS,
    ...SEQ_LESSONS,
    ...TRIG_LESSONS,
    ...PLAN_LESSONS,
    ...GEO_LESSONS,
    ...STEREO_LESSONS,
    ...PROB_LESSONS,
    ...DERIV_LESSONS,
    ...EXTRA_LESSONS,
  ],
  flashcards: [
    ...NUMBERS_CARDS,
    ...ALGEBRA_CARDS,
    ...EQUATIONS_CARDS,
    ...FUNCTIONS_CARDS,
    ...LINEAR_CARDS,
    ...QUAD_CARDS,
    ...POLY_CARDS,
    ...RAT_CARDS,
    ...EXP_CARDS,
    ...SEQ_CARDS,
    ...TRIG_CARDS,
    ...PLAN_CARDS,
    ...GEO_CARDS,
    ...STEREO_CARDS,
    ...PROB_CARDS,
    ...DERIV_CARDS,
    ...EXTRA_CARDS,
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

import type { Question, Skill, Subject, Topic } from '@/data/types';
import {
  MATH,
  QUADRATIC_QUESTIONS,
  QUADRATIC_SKILLS,
  QUADRATIC_TOPIC,
} from './funkcja-kwadratowa';
import { SEQUENCE_QUESTIONS, SEQUENCE_SKILLS, SEQUENCE_TOPIC } from './ciagi';
import { LOG_QUESTIONS, LOG_SKILLS, LOG_TOPIC } from './logarytmy';
import { TRIG_QUESTIONS, TRIG_SKILLS, TRIG_TOPIC } from './trygonometria';
import { GEO_QUESTIONS, GEO_SKILLS, GEO_TOPIC } from './geometria-analityczna';
import { DERIV_QUESTIONS, DERIV_SKILLS, DERIV_TOPIC } from './pochodne';
import { PROB_QUESTIONS, PROB_SKILLS, PROB_TOPIC } from './prawdopodobienstwo';

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

export const MATH_TOPICS: Topic[] = [
  QUADRATIC_TOPIC,
  SEQUENCE_TOPIC,
  LOG_TOPIC,
  TRIG_TOPIC,
  GEO_TOPIC,
  DERIV_TOPIC,
  PROB_TOPIC,
];

export const MATH_SKILLS: Skill[] = [
  ...QUADRATIC_SKILLS,
  ...SEQUENCE_SKILLS,
  ...LOG_SKILLS,
  ...TRIG_SKILLS,
  ...GEO_SKILLS,
  ...DERIV_SKILLS,
  ...PROB_SKILLS,
];

export const MATH_QUESTIONS: Question[] = [
  ...QUADRATIC_QUESTIONS,
  ...SEQUENCE_QUESTIONS,
  ...LOG_QUESTIONS,
  ...TRIG_QUESTIONS,
  ...GEO_QUESTIONS,
  ...DERIV_QUESTIONS,
  ...PROB_QUESTIONS,
];

export interface Corpus {
  subject: Subject;
  topics: Topic[];
  skills: Skill[];
  questions: Question[];
}

export const MATH_CORPUS: Corpus = {
  subject: MATH,
  topics: MATH_TOPICS,
  skills: MATH_SKILLS,
  questions: MATH_QUESTIONS,
};

/** Kompetencje nalezace do danego dzialu. */
export function skillsOfTopic(topicId: string): Skill[] {
  return MATH_SKILLS.filter((s) => s.topicId === topicId);
}

/** Pytania sprawdzajace dana kompetencje. */
export function questionsOfSkill(skillId: string): Question[] {
  return MATH_QUESTIONS.filter((q) => q.skillId === skillId);
}

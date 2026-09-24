import type { Question, Skill, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { ALGO_QUESTIONS, ALGO_SKILLS, ALGO_TOPIC, CS } from './algorytmika';
import { PY_CARDS, PY_LESSONS, PY_QUESTIONS, PY_SKILLS, PY_TOPIC } from './kurs/python-podstawy';

/**
 * Korpus informatyki (matura rozszerzona, podstawa programowa 2024).
 *
 * Kurs idzie w Pythonie. Dział „Algorytmika i programowanie” z pierwszego
 * wycinka (zadania w JavaScripcie) zostaje do czasu przepisania jego
 * zadań na Pythona w kolejnych działach.
 */

export { CS };

/** Kolejność działów = kolejność kursu. */
export const CS_TOPICS: Topic[] = [PY_TOPIC, ALGO_TOPIC];
export const CS_SKILLS: Skill[] = [...PY_SKILLS, ...ALGO_SKILLS];
export const CS_QUESTIONS: Question[] = [...PY_QUESTIONS, ...ALGO_QUESTIONS];

export const CS_CORPUS: Corpus = {
  subject: CS,
  topics: CS_TOPICS,
  skills: CS_SKILLS,
  questions: CS_QUESTIONS,
  lessons: [...PY_LESSONS],
  flashcards: [...PY_CARDS],
};

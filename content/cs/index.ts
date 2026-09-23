import type { Question, Skill, Topic } from '@/data/types';
import type { Corpus } from '../math/index';
import { ALGO_QUESTIONS, ALGO_SKILLS, ALGO_TOPIC, CS } from './algorytmika';

/**
 * Korpus informatyki — Blueprint sek. 15, Etap 4.
 *
 * Na razie jeden dział (algorytmika i programowanie). Arkusz, bazy danych
 * i pliki wejściowe wymienione w blueprincie czekają na osobne działy —
 * ten indeks jest przygotowany na ich dołożenie.
 */

export { CS };

export const CS_TOPICS: Topic[] = [ALGO_TOPIC];
export const CS_SKILLS: Skill[] = [...ALGO_SKILLS];
export const CS_QUESTIONS: Question[] = [...ALGO_QUESTIONS];

export const CS_CORPUS: Corpus = {
  subject: CS,
  topics: CS_TOPICS,
  skills: CS_SKILLS,
  questions: CS_QUESTIONS,
};

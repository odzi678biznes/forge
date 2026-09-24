import type { Question, Skill, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { ALGO_QUESTIONS, ALGO_SKILLS, ALGO_TOPIC, CS } from './algorytmika';
import { PY_CARDS, PY_LESSONS, PY_QUESTIONS, PY_SKILLS, PY_TOPIC } from './kurs/python-podstawy';
import { DATA_CARDS, DATA_LESSONS, DATA_QUESTIONS, DATA_SKILLS, DATA_TOPIC } from './kurs/dane';
import { NUM_CARDS, NUM_LESSONS, NUM_QUESTIONS, NUM_SKILLS, NUM_TOPIC } from './kurs/liczby';

/**
 * Korpus informatyki (matura rozszerzona, podstawa programowa 2024).
 *
 * Kurs idzie w Pythonie. Z pierwszego wycinka (zadania w JavaScripcie)
 * zostają umiejętności, których działy nie są jeszcze przepisane na Pythona;
 * `cs-arrays` i `cs-numbers` przejęły już działy 2 i 3 (ten sam identyfikator — postęp zostaje).
 */

export { CS };

const PORTED = new Set([...DATA_SKILLS, ...NUM_SKILLS].map((s) => s.id));
const LEGACY_SKILLS = ALGO_SKILLS.filter((s) => !PORTED.has(s.id));
const LEGACY_QUESTIONS = ALGO_QUESTIONS.filter((q) => !PORTED.has(q.skillId));

/** Kolejność działów = kolejność kursu. */
export const CS_TOPICS: Topic[] = [PY_TOPIC, DATA_TOPIC, NUM_TOPIC, ALGO_TOPIC];
export const CS_SKILLS: Skill[] = [...PY_SKILLS, ...DATA_SKILLS, ...NUM_SKILLS, ...LEGACY_SKILLS];
export const CS_QUESTIONS: Question[] = [...PY_QUESTIONS, ...DATA_QUESTIONS, ...NUM_QUESTIONS, ...LEGACY_QUESTIONS];

export const CS_CORPUS: Corpus = {
  subject: CS,
  topics: CS_TOPICS,
  skills: CS_SKILLS,
  questions: CS_QUESTIONS,
  lessons: [...PY_LESSONS, ...DATA_LESSONS, ...NUM_LESSONS],
  flashcards: [...PY_CARDS, ...DATA_CARDS, ...NUM_CARDS],
};

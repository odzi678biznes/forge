import type { Question, Skill, Subject, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { PY_CARDS, PY_LESSONS, PY_QUESTIONS, PY_SKILLS, PY_TOPIC } from './kurs/python-podstawy';
import { DATA_CARDS, DATA_LESSONS, DATA_QUESTIONS, DATA_SKILLS, DATA_TOPIC } from './kurs/dane';
import { NUM_CARDS, NUM_LESSONS, NUM_QUESTIONS, NUM_SKILLS, NUM_TOPIC } from './kurs/liczby';
import { SORT_CARDS, SORT_LESSONS, SORT_QUESTIONS, SORT_SKILLS, SORT_TOPIC } from './kurs/sortowanie';
import { TECH_CARDS, TECH_LESSONS, TECH_QUESTIONS, TECH_SKILLS, TECH_TOPIC } from './kurs/techniki';
import { STRUCT_CARDS, STRUCT_LESSONS, STRUCT_QUESTIONS, STRUCT_SKILLS, STRUCT_TOPIC } from './kurs/struktury';
import { REPR_CARDS, REPR_LESSONS, REPR_QUESTIONS, REPR_SKILLS, REPR_TOPIC } from './kurs/reprezentacja';
import { DB_CARDS, DB_LESSONS, DB_QUESTIONS, DB_SKILLS, DB_TOPIC } from './kurs/bazy-danych';
import { SHEET_CARDS, SHEET_LESSONS, SHEET_QUESTIONS, SHEET_SKILLS, SHEET_TOPIC } from './kurs/arkusz';

/**
 * Korpus informatyki (matura rozszerzona, podstawa programowa 2024 —
 * Dz.U. 2024 poz. 1019).
 *
 * Zadania programistyczne są w Pythonie, a zapytania do baz danych w SQL —
 * jedne i drugie uruchamiają się offline (Pyodide z SQLite w workerze). Każde ma wzorcowe rozwiązanie sprawdzane w testach
 * treści tym samym graderem, który ocenia ucznia.
 *
 * Materiał autorski, niezweryfikowany wobec informatora CKE.
 */

export const CS: Subject = { id: 'cs', name: 'Informatyka (rozszerzona)' };

/** Kolejność działów = kolejność kursu. */
const CHAPTERS = [
  { topic: PY_TOPIC, skills: PY_SKILLS, questions: PY_QUESTIONS, lessons: PY_LESSONS, cards: PY_CARDS },
  { topic: DATA_TOPIC, skills: DATA_SKILLS, questions: DATA_QUESTIONS, lessons: DATA_LESSONS, cards: DATA_CARDS },
  { topic: NUM_TOPIC, skills: NUM_SKILLS, questions: NUM_QUESTIONS, lessons: NUM_LESSONS, cards: NUM_CARDS },
  { topic: SORT_TOPIC, skills: SORT_SKILLS, questions: SORT_QUESTIONS, lessons: SORT_LESSONS, cards: SORT_CARDS },
  { topic: TECH_TOPIC, skills: TECH_SKILLS, questions: TECH_QUESTIONS, lessons: TECH_LESSONS, cards: TECH_CARDS },
  { topic: STRUCT_TOPIC, skills: STRUCT_SKILLS, questions: STRUCT_QUESTIONS, lessons: STRUCT_LESSONS, cards: STRUCT_CARDS },
  { topic: REPR_TOPIC, skills: REPR_SKILLS, questions: REPR_QUESTIONS, lessons: REPR_LESSONS, cards: REPR_CARDS },
  { topic: DB_TOPIC, skills: DB_SKILLS, questions: DB_QUESTIONS, lessons: DB_LESSONS, cards: DB_CARDS },
  { topic: SHEET_TOPIC, skills: SHEET_SKILLS, questions: SHEET_QUESTIONS, lessons: SHEET_LESSONS, cards: SHEET_CARDS },
];

export const CS_TOPICS: Topic[] = CHAPTERS.map((c) => c.topic);
export const CS_SKILLS: Skill[] = CHAPTERS.flatMap((c) => c.skills);
export const CS_QUESTIONS: Question[] = CHAPTERS.flatMap((c) => c.questions);

export const CS_CORPUS: Corpus = {
  subject: CS,
  topics: CS_TOPICS,
  skills: CS_SKILLS,
  questions: CS_QUESTIONS,
  lessons: CHAPTERS.flatMap((c) => c.lessons),
  flashcards: CHAPTERS.flatMap((c) => c.cards),
};

import type { Question, Skill, Subject, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { MARKET_CARDS, MARKET_LESSONS, MARKET_QUESTIONS, MARKET_SKILLS, MARKET_TOPIC } from './kurs/rynek';
import { MACRO_CARDS, MACRO_LESSONS, MACRO_QUESTIONS, MACRO_SKILLS, MACRO_TOPIC } from './kurs/makro';

/**
 * Korpus biznesu i zarządzania (matura rozszerzona, pierwsza sesja: maj 2027).
 *
 * Źródła: podstawa programowa 2024 (Dz.U. 2024 poz. 1019) i informator CKE
 * „od roku szkolnego 2026/2027” (180 minut, 50 punktów; zadania zamknięte
 * i otwarte, obliczenia z kalkulatorem prostym). Arkuszy z poprzednich lat
 * nie ma — to nowy przedmiot.
 *
 * Materiał autorski, niezweryfikowany wobec zasad oceniania CKE.
 */

export const BIZ: Subject = { id: 'biz', name: 'Biznes i zarządzanie (rozszerzony)' };

/** Kolejność działów = kolejność kursu. */
const CHAPTERS = [
  { topic: MARKET_TOPIC, skills: MARKET_SKILLS, questions: MARKET_QUESTIONS, lessons: MARKET_LESSONS, cards: MARKET_CARDS },
  { topic: MACRO_TOPIC, skills: MACRO_SKILLS, questions: MACRO_QUESTIONS, lessons: MACRO_LESSONS, cards: MACRO_CARDS },
];

export const BIZ_TOPICS: Topic[] = CHAPTERS.map((c) => c.topic);
export const BIZ_SKILLS: Skill[] = CHAPTERS.flatMap((c) => c.skills);
export const BIZ_QUESTIONS: Question[] = CHAPTERS.flatMap((c) => c.questions);

export const BIZ_CORPUS: Corpus = {
  subject: BIZ,
  topics: BIZ_TOPICS,
  skills: BIZ_SKILLS,
  questions: BIZ_QUESTIONS,
  lessons: CHAPTERS.flatMap((c) => c.lessons),
  flashcards: CHAPTERS.flatMap((c) => c.cards),
};

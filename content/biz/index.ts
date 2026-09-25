import type { Question, Skill, Subject, Topic } from '@/data/types';
import type { Corpus } from '../corpus';
import { withExplanations } from '../wyklad';
import { BIZ_WYKLAD } from './wyklad/index';
import { MARKET_CARDS, MARKET_LESSONS, MARKET_QUESTIONS, MARKET_SKILLS, MARKET_TOPIC } from './kurs/rynek';
import { MACRO_CARDS, MACRO_LESSONS, MACRO_QUESTIONS, MACRO_SKILLS, MACRO_TOPIC } from './kurs/makro';
import { FIN_CARDS, FIN_LESSONS, FIN_QUESTIONS, FIN_SKILLS, FIN_TOPIC } from './kurs/finanse';
import { WORK_CARDS, WORK_LESSONS, WORK_QUESTIONS, WORK_SKILLS, WORK_TOPIC } from './kurs/praca';
import { FIRM_CARDS, FIRM_LESSONS, FIRM_QUESTIONS, FIRM_SKILLS, FIRM_TOPIC } from './kurs/przedsiebiorstwo';
import { MGMT_CARDS, MGMT_LESSONS, MGMT_QUESTIONS, MGMT_SKILLS, MGMT_TOPIC } from './kurs/zarzadzanie';
import { PROJ_CARDS, PROJ_LESSONS, PROJ_QUESTIONS, PROJ_SKILLS, PROJ_TOPIC } from './kurs/projekty';
import { COMP_CARDS, COMP_LESSONS, COMP_QUESTIONS, COMP_SKILLS, COMP_TOPIC } from './kurs/kompetencje';

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
  { topic: COMP_TOPIC, skills: COMP_SKILLS, questions: COMP_QUESTIONS, lessons: COMP_LESSONS, cards: COMP_CARDS },
  { topic: MARKET_TOPIC, skills: MARKET_SKILLS, questions: MARKET_QUESTIONS, lessons: MARKET_LESSONS, cards: MARKET_CARDS },
  { topic: MACRO_TOPIC, skills: MACRO_SKILLS, questions: MACRO_QUESTIONS, lessons: MACRO_LESSONS, cards: MACRO_CARDS },
  { topic: FIN_TOPIC, skills: FIN_SKILLS, questions: FIN_QUESTIONS, lessons: FIN_LESSONS, cards: FIN_CARDS },
  { topic: WORK_TOPIC, skills: WORK_SKILLS, questions: WORK_QUESTIONS, lessons: WORK_LESSONS, cards: WORK_CARDS },
  { topic: FIRM_TOPIC, skills: FIRM_SKILLS, questions: FIRM_QUESTIONS, lessons: FIRM_LESSONS, cards: FIRM_CARDS },
  { topic: MGMT_TOPIC, skills: MGMT_SKILLS, questions: MGMT_QUESTIONS, lessons: MGMT_LESSONS, cards: MGMT_CARDS },
  { topic: PROJ_TOPIC, skills: PROJ_SKILLS, questions: PROJ_QUESTIONS, lessons: PROJ_LESSONS, cards: PROJ_CARDS },
];

export const BIZ_TOPICS: Topic[] = CHAPTERS.map((c) => c.topic);
export const BIZ_SKILLS: Skill[] = CHAPTERS.flatMap((c) => c.skills);
export const BIZ_QUESTIONS: Question[] = CHAPTERS.flatMap((c) => c.questions);

export const BIZ_CORPUS: Corpus = {
  subject: BIZ,
  topics: BIZ_TOPICS,
  skills: BIZ_SKILLS,
  questions: BIZ_QUESTIONS,
  lessons: withExplanations(CHAPTERS.flatMap((c) => c.lessons), BIZ_WYKLAD),
  flashcards: CHAPTERS.flatMap((c) => c.cards),
};

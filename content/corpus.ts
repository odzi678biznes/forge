import type { Flashcard, Lesson, Question, Skill, Subject, Topic } from '@/data/types';

/**
 * Korpus jednego przedmiotu.
 *
 * Kolejność `topics` jest kolejnością kursu: w tej kolejności działy trafiają
 * do kalendarza i na mapę kursu. Kolejność `skills` w obrębie działu jest
 * kolejnością lekcji.
 */
export interface Corpus {
  subject: Subject;
  topics: Topic[];
  skills: Skill[];
  questions: Question[];
  lessons: Lesson[];
  flashcards: Flashcard[];
}

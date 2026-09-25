import type { Lesson, LessonExplanation } from '@/data/types';

/**
 * Wykład do lekcji: „skąd to się bierze”, przepis w krokach i pytanie
 * sprawdzające. Pisany w osobnych plikach (content/<przedmiot>/wyklad/) i
 * dołączany do lekcji przy budowie korpusu - lekcja zostaje ściągą ze wzorami
 * i przykładami, a wykład dodaje to, co mówi nauczyciel przy tablicy.
 *
 * Wykład wydłuża lekcję o ok. 2 minuty czytania - plan dnia to uwzględnia.
 */
export const EXPLANATION_MINUTES = 2;

export function withExplanations(lessons: Lesson[], explanations: Record<string, LessonExplanation>): Lesson[] {
  const known = new Set(lessons.map((l) => l.skillId));
  const orphan = Object.keys(explanations).find((id) => !known.has(id));
  if (orphan) throw new Error(`Wykład do nieistniejącej lekcji: ${orphan}`);
  return lessons.map((l) => {
    const e = explanations[l.skillId];
    return e ? { ...l, ...e, minutes: l.minutes + EXPLANATION_MINUTES } : l;
  });
}

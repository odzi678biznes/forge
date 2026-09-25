import type { LessonExplanation } from '@/data/types';
import { WYKLAD_LICZBY_ALGORYTMY, WYKLAD_PROGRAMOWANIE } from './programowanie';
import { WYKLAD_ALGORYTMY } from './algorytmy';
import { WYKLAD_DANE } from './dane';

/** Wykład do wszystkich lekcji informatyki - skąd to się bierze, przepis, pytanie. */
export const CS_WYKLAD: Record<string, LessonExplanation> = {
  ...WYKLAD_PROGRAMOWANIE,
  ...WYKLAD_LICZBY_ALGORYTMY,
  ...WYKLAD_ALGORYTMY,
  ...WYKLAD_DANE,
};

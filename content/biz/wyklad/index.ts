import type { LessonExplanation } from '@/data/types';
import { WYKLAD_RYNEK } from './rynek';
import { WYKLAD_GOSPODARKA } from './gospodarka';
import { WYKLAD_FINANSE } from './finanse';
import { WYKLAD_PRACA } from './praca';
import { WYKLAD_FIRMA } from './firma';
import { WYKLAD_ZARZADZANIE } from './zarzadzanie';

/** Wykład do wszystkich lekcji biznesu - skąd to się bierze, przepis, pytanie. */
export const BIZ_WYKLAD: Record<string, LessonExplanation> = {
  ...WYKLAD_RYNEK,
  ...WYKLAD_GOSPODARKA,
  ...WYKLAD_FINANSE,
  ...WYKLAD_PRACA,
  ...WYKLAD_FIRMA,
  ...WYKLAD_ZARZADZANIE,
};

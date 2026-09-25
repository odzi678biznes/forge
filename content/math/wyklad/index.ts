import type { LessonExplanation } from '@/data/types';
import { WYKLAD_LICZBY } from './liczby';
import { WYKLAD_WYRAZENIA } from './wyrazenia';
import { WYKLAD_ROWNANIA } from './rownania';
import { WYKLAD_FUNKCJE } from './funkcje';
import { WYKLAD_KWADRATOWA } from './kwadratowa';
import { WYKLAD_WIELOMIANY } from './wielomiany';
import { WYKLAD_WYMIERNE } from './wymierne';
import { WYKLAD_WYKLADNICZA } from './wykladnicza';
import { WYKLAD_CIAGI } from './ciagi';
import { WYKLAD_TRYGONOMETRIA } from './trygonometria';
import { WYKLAD_PLANIMETRIA } from './planimetria';
import { WYKLAD_ANALITYCZNA } from './analityczna';
import { WYKLAD_STEREOMETRIA } from './stereometria';
import { WYKLAD_PRAWDOPODOBIENSTWO } from './prawdopodobienstwo';
import { WYKLAD_POCHODNE } from './pochodne';

/** Wykład do wszystkich lekcji matematyki - skąd to się bierze, przepis, pytanie. */
export const MATH_WYKLAD: Record<string, LessonExplanation> = {
  ...WYKLAD_LICZBY,
  ...WYKLAD_WYRAZENIA,
  ...WYKLAD_ROWNANIA,
  ...WYKLAD_FUNKCJE,
  ...WYKLAD_KWADRATOWA,
  ...WYKLAD_WIELOMIANY,
  ...WYKLAD_WYMIERNE,
  ...WYKLAD_WYKLADNICZA,
  ...WYKLAD_CIAGI,
  ...WYKLAD_TRYGONOMETRIA,
  ...WYKLAD_PLANIMETRIA,
  ...WYKLAD_ANALITYCZNA,
  ...WYKLAD_STEREOMETRIA,
  ...WYKLAD_PRAWDOPODOBIENSTWO,
  ...WYKLAD_POCHODNE,
};

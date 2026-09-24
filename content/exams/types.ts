import type { ExamLevel } from '@/data/types';
import type { CurriculumEra } from '../math/requirements';

/**
 * Oficjalny arkusz egzaminacyjny CKE - opis bez treści zadań.
 *
 * Aplikacja nie przechowuje ani nie wyświetla treści zadań z arkuszy (prawa
 * CKE). Linkuje do oficjalnego PDF-u, a sama zna tylko strukturę: numery
 * zadań, punkty i wymagania, które każde zadanie sprawdza.
 */

export type ExamKind =
  /** Egzamin w sesji głównej (maj). */
  | 'main'
  /** Arkusz diagnostyczny CKE. */
  | 'diagnostic'
  /** Próbny egzamin maturalny CKE. */
  | 'mock';

export interface ExamTask {
  /** Numer z arkusza, np. "12" albo "12.2". */
  no: string;
  points: number;
  /** Kody wymagań szczegółowych z zasad oceniania, np. "V.14", "IX.R3". */
  codes: string[];
}

export interface ExamSheet {
  id: string;
  level: ExamLevel;
  kind: ExamKind;
  /** Rok i miesiąc: "2025-05". */
  date: string;
  /** Wersja podstawy programowej, według której ułożono arkusz. */
  era: CurriculumEra;
  sheetUrl: string;
  keyUrl: string;
  /** Czas pracy w minutach (formuła 2023: PP i PR po 180 min). */
  minutes: number;
  maxPoints: number;
  tasks: ExamTask[];
}

export const t = (no: string, points: number, codes: string[]): ExamTask => ({ no, points, codes });

export function exam(spec: Omit<ExamSheet, 'minutes' | 'maxPoints'>): ExamSheet {
  return {
    ...spec,
    minutes: 180,
    maxPoints: spec.tasks.reduce((a, task) => a + task.points, 0),
  };
}

const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

const KIND_LABEL: Record<ExamKind, string> = {
  main: 'Matura',
  diagnostic: 'Arkusz diagnostyczny',
  mock: 'Próbna matura CKE',
};

/** „Matura, maj 2025 — rozszerzenie”. */
export function examTitle(e: ExamSheet): string {
  const [year, month] = e.date.split('-');
  const monthName = MONTHS[Number(month) - 1] ?? '';
  return `${KIND_LABEL[e.kind]}, ${monthName} ${year} — ${e.level === 'PP' ? 'podstawa' : 'rozszerzenie'}`;
}

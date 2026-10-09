import type { Karta, Lekcja } from './typy';

/** IDs stay stable: archived series and results are never rewritten here. */
export const PRACTICE_SERIES: Readonly<Record<string, readonly string[]>> = {
  'num-order': ['m1-zadanie'],
  'num-powers': ['m2-zadanie'],
  'cs-py-basics': ['c1-kod1', 'c1-slad', 'c1-zadanie'],
  'cs-py-conditions': ['c2-dane', 'c2-kod3', 'c2-zadanie'],
  'biz-entrepreneurship': ['b1-zadanie'],
  'biz-soft-skills': ['b2-zadanie'],
};

const OPTIONAL_SERIES: Readonly<Record<string, readonly string[]>> = {
  'num-order': ['m1-polecenie', 'm1-kolejnosc', 'm1-potega', 'm1-blad', 'm1-nawias', 'm1-odwrotnosc', 'm1-kwadrat', 'm1-sprawdz'],
  'num-powers': ['m2-polecenie', 'm2-dane', 'm2-dane2', 'm2-ujemna', 'm2-blad', 'm2-f1', 'm2-f2', 'm2-f3', 'm2-sprawdz'],
  'cs-py-basics': ['c1-polecenie', 'c1-zasada', 'c1-blad', 'c1-kolejnosc', 'c1-kod2', 'c1-sprawdz'],
  'cs-py-conditions': ['c2-polecenie', 'c2-kod1', 'c2-warunek', 'c2-kod2', 'c2-blad', 'c2-sprawdz'],
  'biz-entrepreneurship': ['b1-polecenie', 'b1-dane', 'b1-zasada', 'b1-decyzja', 'b1-blad', 'b1-pomoc'],
  'biz-soft-skills': ['b2-polecenie', 'b2-dane', 'b2-zasada', 'b2-zasada2', 'b2-decyzja', 'b2-blad', 'b2-pomoc'],
};

export function getPracticeLesson(lesson: Lekcja): Lekcja {
  const series = PRACTICE_SERIES[lesson.skillId];
  if (!series) return { ...lesson, seria: [...lesson.seria] };
  const ids = new Set(lesson.karty.map((card) => card.id));
  if (series.some((id) => !ids.has(id))) throw new Error(`Incomplete practice profile: ${lesson.skillId}`);
  return { ...lesson, seria: [...series] };
}

/** Optional conceptual preparation; never a compulsory quiz before practice. */
export function getTheoryCards(lesson: Lekcja): Karta[] {
  const practice = new Set(getPracticeLesson(lesson).seria);
  const optional = OPTIONAL_SERIES[lesson.skillId] ?? lesson.seria;
  return lesson.karty.filter((card) => optional.includes(card.id) && !practice.has(card.id)
    && ['polecenie', 'dane', 'zasada', 'pomocnicze'].includes(card.etap));
}

/** Extra tracing/checking tasks remain available without lengthening the main path. */
export function getExtraPracticeCards(lesson: Lekcja): Karta[] {
  const excluded = new Set([...getPracticeLesson(lesson).seria, ...getTheoryCards(lesson).map((card) => card.id)]);
  const optional = OPTIONAL_SERIES[lesson.skillId] ?? lesson.seria;
  return lesson.karty.filter((card) => optional.includes(card.id) && !excluded.has(card.id));
}

export interface QualityItem {
  id: string;
  family: string;
  prompt: string;
  context?: string;
  options?: string[];
  correctIndex?: number;
  steps?: string[];
}

/** Heuristics are review leads, not automatic judgements of educational validity. */
export function auditQuestionQuality(item: QualityItem, visibleText: (value: string) => string = (value) => value) {
  const normalized = (value: string) => visibleText(value).replace(/\s+/g, ' ').trim().toLocaleLowerCase('pl');
  const options = item.options?.map(normalized) ?? [];
  const lengths = options.map((option) => [...option].length);
  const validChoice = item.correctIndex !== undefined && item.correctIndex >= 0 && item.correctIndex < options.length;
  const max = Math.max(0, ...lengths);
  const longest = lengths.flatMap((length, index) => length === max ? [index] : []);
  const correctIsLongest = validChoice && longest.includes(item.correctIndex!);
  const flags: string[] = [];
  if (correctIsLongest && longest.length === 1) flags.push('longest');
  if (correctIsLongest && longest.length > 1) flags.push('longest-tie');
  // Text-only MathML loses geometric layout (e.g. roots); compare source for duplicates.
  const identities = item.options?.map((value) => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('pl')) ?? [];
  if (new Set(identities).size < identities.length) flags.push('duplicate-options');
  const correct = validChoice ? options[item.correctIndex!]! : '';
  if (correct.length >= 12 && normalized(`${item.context ?? ''} ${item.prompt}`).includes(correct)) flags.push('answer-in-stem');
  const absolute = /\b(zawsze|nigdy|wyłącznie|zakazane|zabronione)\b/u;
  if (validChoice && !absolute.test(correct) && options.some((option, index) => index !== item.correctIndex && absolute.test(option))) flags.push('absolute-distractor');
  const steps = item.steps?.map(normalized) ?? [];
  if (new Set(steps).size < steps.length) flags.push('duplicate-steps');
  return { id: item.id, family: item.family, validChoice, lengths, flags,
    longestGuessCredit: correctIsLongest ? 1 / longest.length : 0 };
}

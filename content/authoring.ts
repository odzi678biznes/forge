import type {
  CommonError,
  Flashcard,
  FlashcardKind,
  Hint,
  HintLevel,
  LessonBlock,
  Question,
  QuestionKind,
  WorkedExample,
} from '@/data/types';

/**
 * Pomocnicze funkcje do pisania treści kursu.
 *
 * Pełny obiekt `Question` ma kilkanaście pól, z których większość w treści
 * autorskiej jest taka sama. Tu piszemy tylko to, co jest treścią zadania,
 * a resztę uzupełniają funkcje - mniej miejsca na pomyłkę przy przepisywaniu.
 *
 * Najważniejsze jest pole `verify`: funkcja, która LICZY wynik niezależnie od
 * wpisanej odpowiedzi. Test treści porównuje jedno z drugim - błąd rachunkowy
 * autora wychodzi w testach, zanim zobaczy go uczeń.
 */

export const AUTHORED = 'FORGE / autorskie';

/** Wyniki liczone niezależnie od odpowiedzi autora - sprawdzane w testach treści. */
export const VERIFIERS = new Map<string, () => number | string>();

type ErrorSpec = [matches: string | string[], cause: string, rule: string];

interface BaseSpec {
  id: string;
  skill: string;
  kind: QuestionKind;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  /**
   * Podpowiedzi od pierwszego szczebla. Cztery teksty dostają szczeble
   * 1, 2, 3 i 5 (bez fragmentu przykładu), pięć - 1..5, sześć - 1..6.
   */
  hints: string[];
  /** Rozwiązanie krok po kroku, jak przy tablicy. */
  steps: string[];
  /** Typowe błędy: odpowiedzi, które je zdradzają, przyczyna i złamana zasada. */
  errors: ErrorSpec[];
  source?: string;
}

export interface NumericSpec extends BaseSpec {
  answer: string | number;
  variants?: string[];
  tolerance?: number;
  /** Niezależne wyliczenie wyniku. */
  verify?: () => number;
}

export interface TextSpec extends BaseSpec {
  answer: string;
  variants?: string[];
  verify?: () => string;
}

type Letter = 'A' | 'B' | 'C' | 'D';

export interface ChoiceSpec extends BaseSpec {
  choices: [string, string, string, string];
  answer: Letter;
  /** Liczba, którą powinna dawać poprawna odpowiedź - sprawdzana w testach. */
  verify?: () => number;
}

function hintLevels(count: number): HintLevel[] {
  if (count === 4) return [1, 2, 3, 5];
  if (count === 5) return [1, 2, 3, 4, 5];
  if (count === 6) return [1, 2, 3, 4, 5, 6];
  throw new Error(`Podpowiedzi muszą być 4, 5 albo 6, jest ${count}.`);
}

function toHints(texts: string[]): Hint[] {
  const levels = hintLevels(texts.length);
  return texts.map((text, i) => ({ level: levels[i] as Exclude<HintLevel, 0>, text }));
}

function toErrors(id: string, specs: ErrorSpec[]): CommonError[] {
  return specs.map(([matches, cause, rule], i) => ({
    id: `${id}-e${i + 1}`,
    matches: Array.isArray(matches) ? matches : [matches],
    cause,
    rule,
  }));
}

function base(spec: BaseSpec): Omit<Question, 'format' | 'answer' | 'acceptedVariants'> {
  return {
    id: spec.id,
    skillId: spec.skill,
    kind: spec.kind,
    prompt: spec.prompt,
    solution: spec.steps.join(' '),
    steps: spec.steps,
    hints: toHints(spec.hints),
    commonErrors: toErrors(spec.id, spec.errors),
    difficulty: spec.difficulty,
    source: spec.source ?? AUTHORED,
    verified: false,
  };
}

/** Zadanie z odpowiedzią liczbową. */
export function numeric(spec: NumericSpec): Question {
  if (spec.verify) VERIFIERS.set(spec.id, spec.verify);
  return {
    ...base(spec),
    format: 'numeric',
    answer: String(spec.answer),
    acceptedVariants: spec.variants ?? [],
    ...(spec.tolerance === undefined ? {} : { tolerance: spec.tolerance }),
  };
}

/** Zadanie z odpowiedzią tekstową (np. przedział, postać wyrażenia). */
export function text(spec: TextSpec): Question {
  if (spec.verify) VERIFIERS.set(spec.id, spec.verify);
  return {
    ...base(spec),
    format: 'exact-text',
    answer: spec.answer,
    acceptedVariants: spec.variants ?? [],
  };
}

/**
 * Zadanie zamknięte A-D jak na maturze podstawowej.
 *
 * Błędne odpowiedzi nie są przypadkowe: każdy dystraktor powinien odpowiadać
 * konkretnemu błędowi, a `errors` przypisuje mu przyczynę. Wtedy wybór złej
 * litery mówi, CO poszło źle, a nie tylko że poszło.
 */
export function choice(spec: ChoiceSpec): Question {
  if (spec.verify) VERIFIERS.set(spec.id, spec.verify);
  return {
    ...base(spec),
    format: 'choice',
    answer: spec.answer,
    acceptedVariants: [],
    choices: spec.choices,
  };
}

// ---------------------------------------------------------------------------
// Lekcje i fiszki
// ---------------------------------------------------------------------------

export const p = (body: string): LessonBlock => ({ kind: 'text', body });
export const f = (tex: string, caption?: string): LessonBlock =>
  caption === undefined ? { kind: 'formula', tex } : { kind: 'formula', tex, caption };
export const tip = (body: string): LessonBlock => ({ kind: 'tip', body });
export const warn = (body: string): LessonBlock => ({ kind: 'warning', body });

/**
 * Przykład rozwiązany. Krok to albo sam tekst, albo [tekst, dlaczego].
 */
export function example(
  prompt: string,
  steps: Array<string | [string, string]>,
  answer: string,
): WorkedExample {
  return {
    prompt,
    steps: steps.map((s) => (Array.isArray(s) ? { text: s[0], why: s[1] } : { text: s })),
    answer,
  };
}

export function card(
  id: string,
  skillId: string,
  kind: FlashcardKind,
  front: string,
  back: string,
): Flashcard {
  return { id, skillId, kind, front, back };
}

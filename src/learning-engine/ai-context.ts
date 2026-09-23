import type { CommonError, HintLevel, Question } from '@/data/types';
import { HINT_LADDER } from '@/data/types';
import { normalise, parseNumber } from './grading';

/**
 * Kontekst wysyłany do AI — Blueprint sek. 11.
 *
 * Blueprint wymienia DOKŁADNIE pięć rzeczy, które AI może otrzymać:
 * 1. aktualne pytanie,
 * 2. odpowiedź użytkownika,
 * 3. właściwą rubrykę oceniania,
 * 4. użyte podpowiedzi,
 * 5. kilka jawnie dobranych wcześniejszych błędów.
 *
 * Ten moduł jest jedynym miejscem, które składa kontekst, a jego typ nie ma
 * pola na nic więcej — poziomów kompetencji, planu, historii prób, dat ani
 * czegokolwiek, co opisuje osobę. Po stronie Rusta ten sam kształt jest
 * zdefiniowany strukturą, więc nadmiarowe pola i tak nie przejdą dalej.
 *
 * Sek. 12 wymaga „jawnego ekranu pokazującego, jakie dane otrzyma AI" —
 * `describeContext` zwraca dokładnie to, co zostanie wysłane, w formie do
 * pokazania uczniowi PRZED wysłaniem.
 */

/** Ile wcześniejszych błędów wolno dołączyć. „Kilka", nie historia. */
export const MAX_PRIOR_ERRORS = 3;

/** Najdłuższy tok rozumowania, jaki wysyłamy — ochrona przed wklejeniem wszystkiego. */
export const MAX_REASONING_LENGTH = 2000;

export type AiTask = 'hint' | 'assess';

export interface AiContext {
  task: AiTask;
  /** 1. Treść pytania. */
  question: string;
  /** 2. Odpowiedź ucznia (dla oceny rozumowania — także tok rozumowania). */
  answer: string;
  reasoning: string;
  /** 3. Rubryka: poprawna odpowiedź i rozwiązanie wzorcowe. */
  rubric: { correctAnswer: string; solution: string };
  /** 4. Podpowiedzi, które uczeń już zobaczył. */
  hintsUsed: string[];
  /** 5. Przyczyny wcześniejszych błędów w tej kompetencji. */
  priorErrors: string[];
}

export interface ContextInput {
  task: AiTask;
  question: Question;
  answer: string;
  reasoning?: string;
  hintLevel: HintLevel;
  /** Identyfikatory ostatnich błędów w tej kompetencji (ze stanu kompetencji). */
  recentErrorIds: string[];
  /** Słownik wszystkich znanych błędów — do zamiany id na przyczynę. */
  errorCatalogue: CommonError[];
}

export function buildAiContext(input: ContextInput): AiContext {
  const { task, question, answer, hintLevel } = input;

  const hintsUsed = question.hints
    .filter((h) => h.level <= hintLevel)
    .map((h) => `${HINT_LADDER[h.level - 1] ?? 'Podpowiedź'}: ${h.text}`);

  // Najświeższe najpierw, bez powtórzeń, najwyżej kilka.
  const byId = new Map(input.errorCatalogue.map((e) => [e.id, e.cause]));
  const priorErrors: string[] = [];
  for (const id of [...input.recentErrorIds].reverse()) {
    const cause = byId.get(id);
    if (cause && !priorErrors.includes(cause)) priorErrors.push(cause);
    if (priorErrors.length >= MAX_PRIOR_ERRORS) break;
  }

  const reasoning = (input.reasoning ?? '').slice(0, MAX_REASONING_LENGTH);

  return {
    task,
    question: question.prompt,
    answer,
    reasoning,
    rubric: { correctAnswer: question.answer, solution: question.solution },
    hintsUsed,
    priorErrors,
  };
}

/** Pozycja pokazywana na ekranie przejrzystości. */
export interface ContextLine {
  label: string;
  value: string;
}

/** Czytelny opis dokładnie tego, co trafi do AI — pole po polu. */
export function describeContext(ctx: AiContext): ContextLine[] {
  return [
    { label: 'Zadanie dla AI', value: ctx.task === 'hint' ? 'Podpowiedź' : 'Ocena toku rozumowania' },
    { label: 'Treść pytania', value: ctx.question },
    { label: 'Twoja odpowiedź', value: ctx.answer || '(brak)' },
    ...(ctx.task === 'assess'
      ? [{ label: 'Twój tok rozumowania', value: ctx.reasoning || '(brak)' }]
      : []),
    { label: 'Poprawna odpowiedź (rubryka)', value: ctx.rubric.correctAnswer },
    { label: 'Rozwiązanie wzorcowe (rubryka)', value: ctx.rubric.solution },
    {
      label: 'Podpowiedzi, które już widziałeś',
      value: ctx.hintsUsed.length > 0 ? ctx.hintsUsed.join('\n') : '(żadnych)',
    },
    {
      label: 'Twoje wcześniejsze błędy w tej kompetencji',
      value: ctx.priorErrors.length > 0 ? ctx.priorErrors.join('\n') : '(żadnych)',
    },
  ];
}

// ---------------------------------------------------------------------------
// Odpowiedź AI
// ---------------------------------------------------------------------------

export interface AiHint {
  hint: string;
  /** Na który krok rozwiązania uczeń powinien spojrzeć. */
  focus: string;
}

export type AiVerdict = 'correct' | 'partial' | 'incorrect';

export interface AiAssessment {
  verdict: AiVerdict;
  /** Pierwsze miejsce, w którym tok rozumowania się rozjeżdża. */
  firstGap: string;
  feedback: string;
}

/**
 * Czy podpowiedź AI zdradza gotowy wynik.
 *
 * Model dostaje poprawną odpowiedź w rubryce, bo bez niej nie da dobrej
 * wskazówki — ale podpowiedź, która ją podaje, niszczy sens zadania.
 * Instrukcja w prompcie to jedna warstwa; ta funkcja jest drugą: podpowiedź,
 * która zawiera wynik, nie trafia do ucznia.
 */
export function hintLeaksAnswer(hint: string, question: Question): boolean {
  const answer = normalise(question.answer);
  if (answer === '') return false;

  // Wynik liczbowy: szukamy tej samej liczby jako samodzielnego tokenu,
  // pomijając liczby, które występują już w treści zadania.
  const expected = parseNumber(answer);
  if (expected !== null) {
    const numbersIn = (text: string) =>
      (text.replace(/(\d),(\d)/g, '$1.$2').match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const fromPrompt = new Set(numbersIn(question.prompt));
    return numbersIn(hint).some((n) => n === expected && !fromPrompt.has(n));
  }

  // Wynik tekstowy: dosłowne wystąpienie po normalizacji.
  return normalise(hint).includes(answer);
}

/** Walidacja kształtu podpowiedzi zwróconej przez warstwę AI. */
export function parseAiHint(raw: unknown): AiHint | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.hint !== 'string' || o.hint.trim() === '') return null;
  return { hint: o.hint.trim(), focus: typeof o.focus === 'string' ? o.focus.trim() : '' };
}

export function parseAiAssessment(raw: unknown): AiAssessment | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (o.verdict !== 'correct' && o.verdict !== 'partial' && o.verdict !== 'incorrect') {
    return null;
  }
  if (typeof o.feedback !== 'string' || o.feedback.trim() === '') return null;
  return {
    verdict: o.verdict,
    firstGap: typeof o.firstGap === 'string' ? o.firstGap.trim() : '',
    feedback: o.feedback.trim(),
  };
}

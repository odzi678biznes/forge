import type { CommonError, Correctness, Question } from '@/data/types';

/**
 * Ocenianie odpowiedzi - Blueprint sek. 5.
 *
 * Wersjonujemy zasady, bo proba zapisuje `gradingVersion` (sek. 10). Zmiana
 * regul w przyszlosci nie moze cicho przepisac historii - stare proby maja
 * zostac czytelne w swietle regul, ktore wtedy obowiazywaly.
 */
export const GRADING_VERSION = 'v1';

export interface Grade {
  correctness: Correctness;
  /** Rozpoznany typowy blad, jesli odpowiedz pasuje do znanego wzorca. */
  error: CommonError | null;
  /** Pierwsze miejsce rozbieznosci - do feedbacku, ktory nie zdradza calosci. */
  note: string;
}

export function grade(question: Question, rawAnswer: string): Grade {
  // Zadania programistyczne ocenia CodeRunner na testach. Porownanie tekstu
  // odpowiedzi z polem `answer` daloby tu zawsze "zle" - glosny blad jest
  // lepszy niz ciche, falszywe ocenienie ucznia.
  if (question.format === 'code') {
    throw new Error(
      `Zadanie ${question.id} jest programistyczne - ocenia je CodeRunner, nie grade().`,
    );
  }

  const answer = normalise(rawAnswer);

  if (answer === '') {
    return { correctness: 'incorrect', error: null, note: 'Brak odpowiedzi.' };
  }

  if (matches(question, answer)) {
    return { correctness: 'correct', error: null, note: 'Zgadza sie.' };
  }

  // Zanim powiemy "zle", sprawdzamy, czy to rozpoznany typowy blad.
  // Nazwanie przyczyny jest warte wiecej niz sama informacja o pomylce.
  const error = question.commonErrors.find((e) =>
    e.matches.some((m) => normalise(m) === answer),
  );

  if (error) {
    return {
      correctness: 'incorrect',
      error,
      note: error.cause,
    };
  }

  return {
    correctness: 'incorrect',
    error: null,
    note: 'To nie jest poprawny wynik.',
  };
}

function matches(question: Question, answer: string): boolean {
  const candidates = [question.answer, ...question.acceptedVariants].map(normalise);

  if (question.format === 'numeric') {
    const given = parseNumber(stripAssignment(answer));
    if (given === null) return false;
    const tolerance = question.tolerance ?? 0;
    return candidates.some((c) => {
      const expected = parseNumber(stripAssignment(c));
      return expected !== null && Math.abs(expected - given) <= tolerance;
    });
  }

  return candidates.includes(answer);
}

/**
 * Normalizacja zapisu: rozni ludzie zapisuja te sama odpowiedz roznie
 * i nie jest to blad merytoryczny.
 */
export function normalise(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    // przecinek dziesietny obok kropki
    .replace(/(\d),(\d)/g, '$1.$2')
    // spacje nierozdzielajace i roznice w minusie
    .replace(/[−–—]/g, '-')
    .replace(/ /g, '');
}

/**
 * Usuwa przedrostek przypisania: "m=4" i "4" to ta sama odpowiedz.
 * Uczen, ktory nazwie szukana wielkosc, nie popelnil bledu merytorycznego.
 */
export function stripAssignment(input: string): string {
  return input.replace(/^[a-z](?:_?\d+)?=/, '');
}

/** Parsuje liczbe, akceptujac takze prosty ulamek postaci a/b. */
export function parseNumber(input: string): number | null {
  const fraction = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(input);
  if (fraction) {
    const num = Number(fraction[1]);
    const den = Number(fraction[2]);
    if (den === 0) return null;
    return num / den;
  }
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

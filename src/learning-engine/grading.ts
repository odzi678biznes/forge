import type { CommonError, Correctness, Question } from '@/data/types';

/**
 * Ocenianie odpowiedzi - Blueprint sek. 5.
 *
 * Wersjonujemy zasady, bo proba zapisuje `gradingVersion` (sek. 10). Zmiana
 * regul w przyszlosci nie moze cicho przepisac historii - stare proby maja
 * zostac czytelne w swietle regul, ktore wtedy obowiazywaly.
 */
// v2: prawdopodobieństwo w procentach, pełny wynik w zadaniach „postać kπ / k√n”,
// jednostki słowne (minut, dni, sztuk...).
export const GRADING_VERSION = 'v2';

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

  // W zadaniu zamknietym "B", "b", "(B)" i "B)" to ta sama odpowiedz.
  const answer =
    question.format === 'choice'
      ? normalise(rawAnswer).replace(/[().]/g, '')
      : normalise(rawAnswer);

  if (answer === '') {
    return { correctness: 'incorrect', error: null, note: 'Brak odpowiedzi.' };
  }

  if (matches(question, answer)) {
    return { correctness: 'correct', error: null, note: 'Zgadza się.' };
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
    const bare = stripFormFactor(question.prompt, stripAssignment(answer));
    const given = parseNumber(stripUnit(bare));
    if (given === null) return false;
    // Prawdopodobieństwo zapisane w procentach („37,5%”) to ta sama liczba.
    const alsoGiven = bare.endsWith('%') && question.skillId.startsWith('prob-') ? given / 100 : null;
    const tolerance = question.tolerance ?? 0;
    return candidates.some((c) => {
      const expected = parseNumber(stripUnit(stripAssignment(c)));
      if (expected === null) return false;
      if (Math.abs(expected - given) <= tolerance) return true;
      return alsoGiven !== null && Math.abs(expected - alsoGiven) <= tolerance + 1e-12;
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

/**
 * Usuwa jednostke na koncu odpowiedzi liczbowej: "25%", "1020zl" i "37,3°c"
 * to te same liczby co "25", "1020" i "37,3". Jednostka nie jest bledem - bledem
 * bylaby zla liczba.
 */
export function stripUnit(input: string): string {
  return input.replace(
    /(%|zł|zl|pln|cm²|cm2|cm³|cm3|cm|mm|km|kg|°c|°|minut[ay]?|min|godzin[ay]?|h|s|p\.?p\.?|m²|m2|m|dni|dzień|lat[a]?|sztuk[ia]?|osób|osoby|razy)$/,
    '',
  );
}

/**
 * W zadaniach „wynik ma postać $k\sqrt3$ — podaj $k$” uczeń, który wpisze cały
 * wynik („4√3”, „12π”), policzył dobrze — tylko nie doczytał polecenia.
 */
export function stripFormFactor(prompt: string, input: string): string {
  const form = /postać \$k\s*(\\pi|\\sqrt\{?(\d+)\}?)\$/.exec(prompt);
  if (!form) return input;
  if (form[1] === '\\pi') return input.replace(/[*·]?(π|pi)$/, '');
  return input.replace(new RegExp(`[*·]?(√|sqrt)\\(?${form[2]}\\)?$`), '');
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

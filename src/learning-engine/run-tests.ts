/**
 * Część NIEZAUFANA oceniania kodu — wykonuje się w workerze, w tym samym
 * realm co kod ucznia.
 *
 * Zasada bezpieczeństwa: ten moduł NIE dostaje oczekiwanych wyników.
 * Zbiera wyłącznie wartości zwrócone przez funkcję ucznia i odsyła je do
 * głównego wątku, gdzie `gradeRun` porównuje je z oczekiwaniami.
 *
 * Dlaczego tak: kod ucznia może nadpisać dowolny wbudowany mechanizm swojego
 * realm (`Array.prototype.push`, iteratory, `Object.is`…). Gdy porównanie
 * odbywało się tutaj, nadpisanie `push` wystarczało, żeby każdy test
 * „przeszedł" — to była realna luka, zamknięta testem regresji w
 * `code-grading.test.ts`. Teraz uczeń może co najwyżej zafałszować własne
 * wyniki, a żeby trafić w oczekiwania testów ukrytych, musiałby je znać —
 * a te nigdy tu nie przychodzą.
 */

/**
 * Prymitywy przechwycone przy ładowaniu modułu, ZANIM wykona się kod ucznia.
 * Pętla poniżej nie woła metod prototypów, które uczeń mógłby podmienić.
 */
const SAFE = {
  // `bind` jest konieczny: przeglądarka wymaga, żeby funkcje zakresu
  // globalnego wołać na tym zakresie. Wywołanie `SAFE.clone(x)` bez bind
  // ma `this === SAFE` i kończy się „Illegal invocation" — Node tego nie
  // sprawdza, więc bez testu odtwarzającego tę kontrolę błąd przechodził.
  clone: globalThis.structuredClone.bind(globalThis),
  now: Date.now,
  apply: Reflect.apply,
  defineProperty: Object.defineProperty,
  isArray: Array.isArray,
} as const;

/** Wartość zwrócona przez rozwiązanie albo opis błędu jej wyznaczania. */
export type RawValue = { ok: true; value: unknown } | { ok: false; error: string };

export type RawStatus = 'ok' | 'timeout' | 'compile-error';

/** Surowy wynik z piaskownicy — bez nazw testów, bez oczekiwań, bez werdyktu. */
export interface RawRun {
  status: RawStatus;
  values: RawValue[];
  message: string | null;
}

/** Ile milisekund może trwać pojedynczy test, zanim uznamy go za zawieszony. */
export const PER_TEST_BUDGET_MS = 1500;

/** Najdłuższy opis błędu, jaki odsyłamy — chroni główny wątek przed zalaniem. */
const MAX_ERROR_LENGTH = 300;

/** Zapisuje element tablicy z pominięciem ewentualnych setterów na prototypie. */
function put<T>(arr: T[], index: number, value: T): void {
  SAFE.defineProperty(arr, index, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

function describeError(err: unknown): string {
  try {
    const text = err instanceof Error ? err.message : String(err);
    return text.length > MAX_ERROR_LENGTH ? `${text.slice(0, MAX_ERROR_LENGTH)}…` : text;
  } catch {
    return 'nieopisywalny błąd';
  }
}

/**
 * Zamienia wynik ucznia na czyste dane, które da się przesłać do głównego
 * wątku. Kopia usuwa gettery, proxy i odwołania do obiektów w workerze;
 * funkcji i symboli nie da się przesłać, więc zamieniamy je na błąd.
 */
function snapshot(out: unknown): RawValue {
  if (typeof out === 'function' || typeof out === 'symbol') {
    return {
      ok: false,
      error: `Funkcja zwróciła wartość typu ${typeof out}, której nie da się porównać z wynikiem.`,
    };
  }
  try {
    return { ok: true, value: SAFE.clone(out) };
  } catch {
    return {
      ok: false,
      error: 'Funkcja zwróciła wartość, której nie da się skopiować do porównania.',
    };
  }
}

/**
 * Wywołuje rozwiązanie dla każdego zestawu argumentów i zbiera wartości.
 *
 * Każde wywołanie dostaje własną kopię argumentów: kod, który modyfikuje
 * wejście, nie może zepsuć kolejnych testów.
 */
export function collectValues(
  solve: (...args: unknown[]) => unknown,
  inputs: unknown[][],
): RawRun {
  const values: RawValue[] = [];
  const count = inputs.length;

  for (let i = 0; i < count; i += 1) {
    const started = SAFE.now();
    let entry: RawValue;

    try {
      const args = SAFE.clone(inputs[i]);
      const argList = SAFE.isArray(args) ? args : [];
      entry = snapshot(SAFE.apply(solve, undefined, argList));
    } catch (err) {
      // Wyjątek w jednym teście nie przerywa pozostałych.
      entry = { ok: false, error: describeError(err) };
    }

    put(values, i, entry);

    if (SAFE.now() - started > PER_TEST_BUDGET_MS) {
      return {
        status: 'timeout',
        values,
        message: `Test nr ${i + 1} nie zmieścił się w budżecie czasu.`,
      };
    }
  }

  return { status: 'ok', values, message: null };
}

/**
 * Buduje funkcję rozwiązania ze źródła ucznia.
 *
 * Zwraca błąd zamiast rzucać, bo „kod się nie kompiluje" to normalny wynik
 * pracy ucznia, a nie awaria aplikacji.
 */
export function buildSolution(
  source: string,
  functionName: string,
): { solve: ((...args: unknown[]) => unknown) | null; error: string | null } {
  // Nazwa funkcji pochodzi z treści zadania, ale i tak nie pozwalamy jej
  // wstrzyknąć czegokolwiek do generowanego kodu.
  if (!/^[A-Za-z_$][\w$]*$/.test(functionName)) {
    return { solve: null, error: `Nieprawidłowa nazwa funkcji „${functionName}".` };
  }

  try {
    const factory = new Function(
      `${source}\n;return typeof ${functionName} === 'function' ? ${functionName} : undefined;`,
    );
    const fn: unknown = factory();

    if (typeof fn !== 'function') {
      return {
        solve: null,
        error: `Nie znaleziono funkcji „${functionName}". Sprawdź jej nazwę.`,
      };
    }
    return { solve: fn as (...args: unknown[]) => unknown, error: null };
  } catch (err) {
    return { solve: null, error: describeError(err) };
  }
}

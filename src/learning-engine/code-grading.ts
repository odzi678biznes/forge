import type { CodeTest, Correctness } from '@/data/types';
import type { Grade } from './grading';
import { collectValues, type RawRun, type RawValue } from './run-tests';

/**
 * Ocenianie zadań programistycznych — Blueprint sek. 15, Etap 4.
 *
 * Kryterium etapu: „zadanie programistyczne działa offline i jest oceniane
 * na KONTROLOWANYCH TESTACH". Ten moduł jest częścią ZAUFANĄ: działa
 * w głównym wątku i tylko on zna oczekiwane wyniki.
 *
 * Podział odpowiedzialności:
 * - `run-tests.ts` (worker, niezaufany) — wywołuje funkcję ucznia i odsyła
 *   surowe wartości; nie zna oczekiwań, nazw testów ani flag „ukryty",
 * - ten moduł (główny wątek, zaufany) — waliduje to, co przyszło,
 *   porównuje z oczekiwaniami i buduje werdykt.
 *
 * Kod ucznia nie ma dostępu do realm głównego wątku, więc nie może
 * podmienić ani porównania, ani liczenia zaliczonych testów.
 */

// Typ testu mieszka w warstwie danych (opisuje treść zadania). Tu tylko
// go re-eksportujemy, żeby moduły oceniające miały jedno źródło prawdy.
export type { CodeTest } from '@/data/types';

export interface TestOutcome {
  name: string;
  hidden: boolean;
  passed: boolean;
  /** Co zwrócił kod — pokazywane tylko dla testów jawnych. */
  actual?: string;
  expected?: string;
  /** Błąd wykonania, jeśli kod rzucił wyjątek. */
  error?: string;
}

export type RunStatus = 'ok' | 'timeout' | 'compile-error' | 'runtime-error';

export interface RunResult {
  status: RunStatus;
  outcomes: TestOutcome[];
  /** Komunikat błędu kompilacji/składni, jeśli kod w ogóle się nie wykonał. */
  message: string | null;
  /** Tekst wypisany przez kod ucznia (print) - tylko do podglądu, nie do oceny. */
  output?: string;
}

export interface CodeVerdict {
  passed: number;
  total: number;
  /** Zadanie zaliczone dopiero, gdy przechodzą WSZYSTKIE testy. */
  allPassed: boolean;
  /** Pierwszy nieprzechodzący test — punkt, od którego zaczyna się naprawa. */
  firstFailure: TestOutcome | null;
  /** Zdanie dla ucznia: co dokładnie nie działa. */
  summary: string;
}

/**
 * Port uruchamiania kodu.
 *
 * Implementacja przeglądarkowa odpala Web Workera i ubija go po przekroczeniu
 * limitu czasu. Interfejs pozwala podmienić piaskownicę (np. na komendę Rust
 * uruchamiającą Pythona) bez dotykania oceniania.
 */
export interface CodeRunner {
  run(
    source: string,
    functionName: string,
    tests: CodeTest[],
    timeoutMs: number,
  ): Promise<RunResult>;
}

/** Domyślny limit czasu na całe uruchomienie zestawu testów. */
export const DEFAULT_RUN_TIMEOUT_MS = 3000;

/** Najdłuższy opis wartości pokazywany uczniowi. */
const MAX_DESCRIBE_LENGTH = 200;

/**
 * Prymitywy przechwycone przy ładowaniu modułu. W aplikacji ten moduł działa
 * w głównym wątku, do którego kod ucznia nie ma dostępu — ale ta sama logika
 * jest uruchamiana w testach jednostkowych w jednym realm z kodem ucznia,
 * więc trzymamy własne referencje i nie wołamy metod tablic na danych.
 */
const SAFE = {
  is: Object.is,
  isArray: Array.isArray,
  keys: Object.keys,
  getPrototypeOf: Object.getPrototypeOf,
  hasOwn: Object.prototype.hasOwnProperty,
  call: Function.prototype.call,
  stringify: JSON.stringify,
  defineProperty: Object.defineProperty,
} as const;

function hasOwn(obj: object, key: string): boolean {
  return SAFE.call.call(SAFE.hasOwn, obj, key) as boolean;
}

function put<T>(arr: T[], index: number, value: T): void {
  SAFE.defineProperty(arr, index, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

/**
 * Porównanie wyniku z oczekiwaniem.
 *
 * Strukturalne, a nie referencyjne: `[1,2]` ma być równe `[1,2]`. Ścisłe co do
 * typu — `"5"` nie jest równe `5`, bo w zadaniu algorytmicznym typ wyniku bywa
 * częścią zadania. Obiekty muszą mieć ten sam prototyp: pusta `Map` nie jest
 * równa pustemu obiektowi tylko dlatego, że żadne z nich nie ma kluczy.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (SAFE.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;

  const aArr = SAFE.isArray(a);
  const bArr = SAFE.isArray(b);
  if (aArr || bArr) {
    if (!aArr || !bArr) return false;
    const xs = a as unknown[];
    const ys = b as unknown[];
    if (xs.length !== ys.length) return false;
    for (let i = 0; i < xs.length; i += 1) {
      if (!deepEqual(xs[i], ys[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    if (SAFE.getPrototypeOf(a) !== SAFE.getPrototypeOf(b)) return false;
    const ka = SAFE.keys(a as object);
    const kb = SAFE.keys(b as object);
    if (ka.length !== kb.length) return false;

    for (let i = 0; i < ka.length; i += 1) {
      const key = ka[i];
      if (key === undefined || !hasOwn(b as object, key)) return false;
      if (
        !deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        )
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/** Krótki, czytelny zapis wartości do pokazania uczniowi. */
export function describeValue(v: unknown): string {
  if (v === undefined) return 'undefined';
  let out: string;
  try {
    const json = SAFE.stringify(v);
    out = json === undefined ? String(v) : json;
  } catch {
    try {
      out = String(v);
    } catch {
      out = '[nieopisywalna wartość]';
    }
  }
  return out.length > MAX_DESCRIBE_LENGTH ? `${out.slice(0, MAX_DESCRIBE_LENGTH)}…` : out;
}

/**
 * Wartość zapisana tak, jak wypisałby ją Python: `[1, 2]`, `True`, `None`,
 * `'tekst'`. Uczeń piszący w Pythonie nie powinien tłumaczyć w głowie
 * zapisu JavaScriptu, żeby zrozumieć, czym różni się jego wynik.
 */
export function describePython(v: unknown): string {
  let out: string;
  try {
    out = pythonRepr(v, 0);
  } catch {
    return describeValue(v);
  }
  return out.length > MAX_DESCRIBE_LENGTH ? `${out.slice(0, MAX_DESCRIBE_LENGTH)}…` : out;
}

function pythonRepr(v: unknown, depth: number): string {
  if (depth > 20) return '…';
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') {
    // Jak repr() w Pythonie: apostrofy, chyba że napis sam zawiera apostrof.
    const body = v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    if (v.includes("'") && !v.includes('"')) return `"${body}"`;
    return `'${body.replace(/'/g, "\\'")}'`;
  }
  if (SAFE.isArray(v)) return `[${(v as unknown[]).map((x) => pythonRepr(x, depth + 1)).join(', ')}]`;
  if (typeof v === 'object') {
    return `{${Object.entries(v as Record<string, unknown>)
      .map(([k, x]) => `${pythonRepr(k, depth + 1)}: ${pythonRepr(x, depth + 1)}`)
      .join(', ')}}`;
  }
  return String(v);
}

// ---------------------------------------------------------------------------
// Walidacja tego, co przyszło z piaskownicy
// ---------------------------------------------------------------------------

const RAW_STATUSES = new Set(['ok', 'timeout', 'compile-error']);

function isRawValue(v: unknown): v is RawValue {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.ok === true) return hasOwn(o, 'value');
  if (o.ok === false) return typeof o.error === 'string';
  return false;
}

/**
 * Zamienia surowy wynik z piaskownicy na wynik testów.
 *
 * `raw` jest traktowany jako niezaufany: może być czymkolwiek. Brakujący albo
 * zniekształcony wpis to test niezaliczony, a nie wyjątek — zniekształcony
 * wynik nie może ani wywrócić aplikacji, ani zaliczyć zadania.
 */
export function gradeRun(
  tests: CodeTest[],
  raw: unknown,
  describe: (v: unknown) => string = describeValue,
): RunResult {
  const outcomes: TestOutcome[] = [];

  if (typeof raw !== 'object' || raw === null) {
    return malformed(tests, 'Piaskownica nie zwróciła wyniku.');
  }
  const r = raw as Partial<RawRun>;
  if (typeof r.status !== 'string' || !RAW_STATUSES.has(r.status)) {
    return malformed(tests, 'Piaskownica zwróciła nieznany status.');
  }

  const output = printedOutput(raw);

  if (r.status === 'compile-error') {
    return {
      status: 'compile-error',
      outcomes,
      message: typeof r.message === 'string' ? r.message : 'błąd składni',
      ...output,
    };
  }

  const values = SAFE.isArray(r.values) ? (r.values as unknown[]) : [];

  for (let i = 0; i < tests.length; i += 1) {
    const test = tests[i];
    if (!test) continue;
    const hidden = test.hidden === true;
    const entry = values[i];

    let outcome: TestOutcome;
    if (!isRawValue(entry)) {
      outcome = {
        name: test.name,
        hidden,
        passed: false,
        error:
          r.status === 'timeout'
            ? 'nie wykonano — przerwano po przekroczeniu czasu'
            : 'brak wyniku z piaskownicy',
      };
    } else if (!entry.ok) {
      outcome = { name: test.name, hidden, passed: false, error: entry.error };
    } else {
      let passed = false;
      try {
        passed = deepEqual(entry.value, test.expected);
      } catch {
        // Np. przepełnienie stosu przy absurdalnie zagnieżdżonej wartości.
        passed = false;
      }
      outcome = passed
        ? { name: test.name, hidden, passed: true }
        : {
            name: test.name,
            hidden,
            passed: false,
            actual: describe(entry.value),
            expected: describe(test.expected),
          };
    }
    put(outcomes, outcomes.length, outcome);
  }

  return {
    status: r.status === 'timeout' ? 'timeout' : 'ok',
    outcomes,
    message: typeof r.message === 'string' ? r.message : null,
    ...output,
  };
}

/** Wypisany tekst z piaskownicy - przycięty, tylko gdy niepusty. */
function printedOutput(raw: object): { output?: string } {
  const out = (raw as { output?: unknown }).output;
  if (typeof out !== 'string' || out.trim() === '') return {};
  return { output: out.length > 4000 ? `${out.slice(0, 4000)}…` : out };
}

function malformed(tests: CodeTest[], message: string): RunResult {
  const outcomes: TestOutcome[] = [];
  for (let i = 0; i < tests.length; i += 1) {
    const test = tests[i];
    if (!test) continue;
    put(outcomes, outcomes.length, {
      name: test.name,
      hidden: test.hidden === true,
      passed: false,
      error: 'brak wyniku z piaskownicy',
    });
  }
  return { status: 'runtime-error', outcomes, message };
}

/**
 * Pełny przebieg bez workera: zebranie wartości i ocena.
 *
 * Używane przez testy jednostkowe i walidację treści (rozwiązania
 * referencyjne). W aplikacji te dwa kroki dzieli granica wątków.
 */
export function executeTests(
  solve: (...args: unknown[]) => unknown,
  tests: CodeTest[],
): RunResult {
  const inputs: unknown[][] = [];
  for (let i = 0; i < tests.length; i += 1) {
    const t = tests[i];
    if (t) put(inputs, i, t.input);
  }
  return gradeRun(tests, collectValues(solve, inputs));
}

// ---------------------------------------------------------------------------
// Werdykt
// ---------------------------------------------------------------------------

export function judge(result: RunResult): CodeVerdict {
  let passed = 0;
  let firstFailure: TestOutcome | null = null;
  const total = result.outcomes.length;

  for (let i = 0; i < total; i += 1) {
    const o = result.outcomes[i];
    if (!o) continue;
    if (o.passed === true) passed += 1;
    else if (firstFailure === null) firstFailure = o;
  }

  return {
    passed,
    total,
    // Brak testów NIE jest zaliczeniem — to znaczy, że zadanie jest wadliwe.
    allPassed: total > 0 && passed === total && result.status === 'ok',
    firstFailure,
    summary: summarise(result, passed, total, firstFailure),
  };
}

function summarise(
  result: RunResult,
  passed: number,
  total: number,
  firstFailure: TestOutcome | null,
): string {
  if (result.status === 'compile-error') {
    return `Kod się nie uruchomił: ${result.message ?? 'błąd składni'}.`;
  }
  if (result.status === 'runtime-error') {
    return `Uruchomienie nie powiodło się: ${result.message ?? 'nieznany błąd piaskownicy'}.`;
  }
  if (result.status === 'timeout') {
    return 'Kod przekroczył limit czasu. Najczęstsza przyczyna to pętla, która się nie kończy, albo złożoność za wysoka dla tych danych.';
  }
  if (total === 0) {
    return 'To zadanie nie ma testów — nie da się go ocenić.';
  }
  if (passed === total) {
    return `Wszystkie testy przechodzą (${passed} z ${total}).`;
  }
  if (!firstFailure) {
    return `${passed} z ${total} testów przechodzi.`;
  }

  if (firstFailure.hidden) {
    // Test ukryty: ani wartość oczekiwana, ani treść błędu nie trafiają do
    // ucznia — błąd mógłby zawierać dane, które zdradzają oczekiwanie.
    return `${passed} z ${total} testów przechodzi. Pierwszy nieprzechodzący to test ukryty „${firstFailure.name}" — sprawdź przypadki brzegowe.`;
  }
  if (firstFailure.error) {
    return `Test „${firstFailure.name}" zakończył się błędem: ${firstFailure.error}.`;
  }
  return `${passed} z ${total} testów przechodzi. Test „${firstFailure.name}" oczekiwał ${firstFailure.expected}, a otrzymał ${firstFailure.actual}.`;
}

/**
 * Zamienia werdykt testów na ocenę w tym samym kształcie, co przy
 * zadaniach tekstowych — dzięki temu silnik opanowania (`applyAttempt`)
 * nie musi wiedzieć, że zadanie było programistyczne.
 *
 * Część testów przechodzi → „częściowo". To ważne: mechanika opanowania
 * nie cofa poziomu za odpowiedź częściową (sek. 6.5), więc kod, który
 * działa dla typowych danych i pada na przypadku brzegowym, nie jest
 * karany jak kod, który w ogóle nie działa.
 */
export function verdictToGrade(verdict: CodeVerdict, status: RunStatus): Grade {
  const correctness: Correctness = verdict.allPassed
    ? 'correct'
    : status === 'ok' && verdict.passed > 0
      ? 'partial'
      : 'incorrect';

  return { correctness, error: null, note: verdict.summary };
}

/**
 * Wycina z testów to, co uczeń może zobaczyć PRZED uruchomieniem.
 * Testy ukryte pokazujemy tylko z nazwy.
 */
export function visibleTests(tests: CodeTest[]): CodeTest[] {
  return tests.filter((t) => t.hidden !== true);
}

export function hiddenTestCount(tests: CodeTest[]): number {
  return tests.filter((t) => t.hidden === true).length;
}

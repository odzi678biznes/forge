import type { PyodideAPI } from 'pyodide';
import type { RawRun, RawValue } from '@/learning-engine/run-tests';

/**
 * Uruchamianie rozwiązania w Pythonie (Pyodide) na argumentach testów.
 *
 * Wspólne dla workera aplikacji i testów treści w Node: zadanie jest
 * sprawdzane w testach DOKŁADNIE tym kodem, który ocenia ucznia.
 *
 * Tak jak w piaskownicy JavaScriptu, ten moduł NIE zna oczekiwanych
 * wyników - zbiera wartości zwrócone przez funkcję ucznia, a porównanie
 * odbywa się w głównym wątku (`gradeRun`).
 */

/** Nazwa pliku w komunikatach błędów - uczeń widzi „linia 3”, a nie ścieżki Pyodide. */
export const STUDENT_FILE = '<twoj_kod>';

/** Najwięcej znaków z print(), które odsyłamy do pokazania. */
export const MAX_OUTPUT = 4000;

const MAX_ERROR = 400;

/** Krótkie wyjaśnienia najczęstszych błędów - dla ucznia, który dopiero zaczyna. */
const EXPLAIN: Record<string, string> = {
  SyntaxError: 'błąd składni — sprawdź dwukropki, nawiasy i cudzysłowy',
  IndentationError: 'złe wcięcie — w Pythonie wcięcia wyznaczają bloki kodu',
  TabError: 'wymieszane tabulatory i spacje we wcięciach',
  NameError: 'użyta nazwa nie została wcześniej zdefiniowana (literówka?)',
  TypeError: 'działanie na wartości złego typu (np. liczba + napis)',
  IndexError: 'indeks poza zakresem listy albo napisu',
  KeyError: 'brak takiego klucza w słowniku',
  ValueError: 'poprawny typ, ale niepoprawna wartość (np. int("abc"))',
  ZeroDivisionError: 'dzielenie przez zero',
  RecursionError: 'rekurencja bez końca albo za głęboka — sprawdź warunek stopu',
  AttributeError: 'ten obiekt nie ma takiej metody ani pola',
  UnboundLocalError: 'zmienna użyta w funkcji, zanim dostała wartość',
};

/**
 * Z pełnego śladu stosu Pythona robi jedną linijkę dla ucznia:
 * „ZeroDivisionError: division by zero (linia 3) — dzielenie przez zero”.
 * Linia jest brana z ostatniej ramki w pliku ucznia, a nie z kodu Pyodide.
 */
export function explainPythonError(trace: string): string {
  const lines = trace.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim() !== '');
  const last = lines[lines.length - 1] ?? trace;
  const lineNos = [...trace.matchAll(new RegExp(`File "${STUDENT_FILE}", line (\\d+)`, 'g'))];
  const lineNo = lineNos.length > 0 ? lineNos[lineNos.length - 1]?.[1] : undefined;
  const name = /^(\w+)(?::|$)/.exec(last.trim())?.[1] ?? '';
  const hint = EXPLAIN[name];
  const text = `${last.trim()}${lineNo ? ` (linia ${lineNo})` : ''}${hint ? ` — ${hint}` : ''}`;
  return text.length > MAX_ERROR ? `${text.slice(0, MAX_ERROR)}…` : text;
}

function errorText(err: unknown): string {
  if (err instanceof Error) return explainPythonError(err.message);
  return explainPythonError(String(err));
}

/**
 * `None` zagnieżdżone w liście albo słowniku Pyodide zamienia na `undefined`,
 * a oczekiwane wyniki testów zapisują brak wartości jako `null`.
 */
export function undefinedToNull(v: unknown): unknown {
  if (v === undefined) return null;
  if (Array.isArray(v)) return v.map(undefinedToNull);
  if (typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, undefinedToNull(x)]));
  }
  return v;
}

/**
 * Wartość z Pythona na czyste dane JS (bez proxy), gotowe do przesłania.
 * Krotki i listy stają się tablicami, słowniki - obiektami, None - null.
 */
function toPlain(value: unknown): RawValue {
  try {
    if (value === undefined || value === null) return { ok: true, value: null };
    if (typeof value === 'object' && value !== null && 'toJs' in value) {
      const proxy = value as { toJs: (o: object) => unknown; destroy?: () => void; type?: string };
      const js = proxy.toJs({ dict_converter: Object.fromEntries, create_pyproxies: false });
      proxy.destroy?.();
      if (js instanceof Set) return { ok: true, value: undefinedToNull([...js]) };
      return { ok: true, value: undefinedToNull(structuredClone(js)) };
    }
    if (typeof value === 'bigint') {
      // Duża liczba całkowita z Pythona: porównujemy ją jako liczbę, jeśli się mieści.
      return Number.isSafeInteger(Number(value))
        ? { ok: true, value: Number(value) }
        : { ok: true, value: value.toString() };
    }
    if (typeof value === 'function') {
      return { ok: false, error: 'Funkcja zwróciła funkcję zamiast wyniku (brakuje nawiasów przy wywołaniu?).' };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: 'Funkcja zwróciła wartość, której nie da się porównać z wynikiem.' };
  }
}

export interface PythonRun extends RawRun {
  /** Tekst wypisany przez print() - pomaga w szukaniu błędu. */
  output: string;
}

/**
 * Wczytuje kod ucznia w świeżej przestrzeni nazw i wywołuje funkcję dla
 * każdego zestawu argumentów. Wyjątek w jednym teście nie przerywa pozostałych,
 * a każdy test dostaje własną kopię argumentów.
 */
export function runPythonTests(
  py: PyodideAPI,
  source: string,
  functionName: string,
  inputs: unknown[][],
): PythonRun {
  let output = '';
  const write = (s: string) => {
    if (output.length < MAX_OUTPUT) output += `${s}\n`;
  };
  py.setStdout({ batched: write });
  py.setStderr({ batched: write });

  try {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(functionName)) {
      return { status: 'compile-error', values: [], message: `Nieprawidłowa nazwa funkcji „${functionName}".`, output };
    }

    const makeDict = py.globals.get('dict') as () => { get: (k: string) => unknown; destroy: () => void };
    const ns = makeDict();
    try {
      try {
        py.runPython(source, { globals: ns as never, filename: STUDENT_FILE });
      } catch (err) {
        return { status: 'compile-error', values: [], message: errorText(err), output };
      }

      const fn = ns.get(functionName) as ((...args: unknown[]) => unknown) & { destroy?: () => void } | undefined;
      if (typeof fn !== 'function') {
        return {
          status: 'compile-error',
          values: [],
          message: `Nie znaleziono funkcji „${functionName}". Sprawdź jej nazwę w linii z „def".`,
          output,
        };
      }

      const values: RawValue[] = [];
      for (const args of inputs) {
        const pyArgs = structuredClone(args).map((a) => py.toPy(a));
        try {
          values.push(toPlain(fn(...pyArgs)));
        } catch (err) {
          values.push({ ok: false, error: errorText(err) });
        } finally {
          for (const a of pyArgs) (a as { destroy?: () => void })?.destroy?.();
        }
      }
      fn.destroy?.();
      return { status: 'ok', values, message: null, output };
    } finally {
      ns.destroy();
    }
  } finally {
    py.setStdout({});
    py.setStderr({});
  }
}

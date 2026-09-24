import { describePython, gradeRun, type CodeRunner, type CodeTest, type RunResult } from '@/learning-engine/code-grading';

/**
 * Piaskownica Pythona dla zadań programistycznych (matura z informatyki).
 *
 * Pyodide ładuje się kilka sekund, więc worker jest „ciepły”: jeden na całą
 * sesję, a kolejne zadania idą do tego samego interpretera (każde w świeżej
 * przestrzeni nazw). Pętli nieskończonej w Pythonie nie da się przerwać
 * z zewnątrz, więc po przekroczeniu limitu worker jest ubijany, a następne
 * uruchomienie ładuje nowy - to jedyny pewny sposób.
 *
 * Limit czasu liczy się od wysłania kodu, nie od startu workera: ładowanie
 * interpretera nie może zjadać uczniowi czasu na testy.
 */

import { PYTHON_RUN_TIMEOUT_MS } from './python-limits';

export { PYTHON_RUN_TIMEOUT_MS };
/** Ile czekamy na załadowanie interpretera, zanim zgłosimy błąd. */
const LOAD_TIMEOUT_MS = 60_000;

type WorkerMessage =
  | { type: 'ready' }
  | { type: 'load-error'; message: string }
  | { type: 'result'; nonce: string; raw: unknown };

export class PythonCodeRunner implements CodeRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<string, (raw: unknown) => void>();

  /** Start interpretera z wyprzedzeniem - np. gdy uczeń otwiera zadanie. */
  warmUp(): Promise<void> {
    return this.ensure();
  }

  private ensure(): Promise<void> {
    if (this.ready) return this.ready;
    const worker = new Worker(new URL('./py-worker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Python nie załadował się w wyznaczonym czasie.')), LOAD_TIMEOUT_MS);
      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const m = e.data;
        if (m.type === 'ready') {
          window.clearTimeout(timer);
          resolve();
        } else if (m.type === 'load-error') {
          window.clearTimeout(timer);
          reject(new Error(m.message));
        } else if (m.type === 'result') {
          this.pending.get(m.nonce)?.(m.raw);
        }
      };
      worker.onerror = (e) => {
        window.clearTimeout(timer);
        reject(new Error(e.message || 'Nie udało się uruchomić Pythona.'));
      };
    });
    // Nieudany start nie może zablokować kolejnych prób.
    this.ready.catch(() => this.reset());
    return this.ready;
  }

  private reset(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
    this.pending.clear();
  }

  async run(source: string, functionName: string, tests: CodeTest[], timeoutMs = PYTHON_RUN_TIMEOUT_MS): Promise<RunResult> {
    if (tests.length === 0) return { status: 'ok', outcomes: [], message: null };

    try {
      await this.ensure();
    } catch (err) {
      return {
        status: 'runtime-error',
        outcomes: [],
        message: `Python nie wystartował: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    const worker = this.worker;
    if (!worker) return { status: 'runtime-error', outcomes: [], message: 'Python nie wystartował.' };
    const nonce = crypto.randomUUID();

    return new Promise<RunResult>((resolve) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(nonce);
        // Pętla bez końca: jedyny sposób przerwania to ubicie interpretera.
        this.reset();
        resolve(
          gradeRun(
            tests,
            { status: 'timeout', values: [], message: `Przekroczono limit ${timeoutMs / 1000} s — sprawdź, czy pętla się kończy.` },
            describePython,
          ),
        );
      }, timeoutMs);

      this.pending.set(nonce, (raw) => {
        window.clearTimeout(timer);
        this.pending.delete(nonce);
        resolve(gradeRun(tests, raw, describePython));
      });

      worker.postMessage({ nonce, source, functionName, inputs: tests.map((t) => t.input) });
    });
  }
}

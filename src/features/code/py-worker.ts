import { loadPyodide } from 'pyodide';
import { lockDown } from './lockdown';
import { runPythonTests, type PythonRun } from './python-harness';
import { runSqlTests } from './sql-harness';

/**
 * Worker uruchamiający Pythona (Pyodide) - offline, z plików aplikacji.
 *
 * Kolejność jest częścią bezpieczeństwa:
 * 1. przechwytujemy prawdziwe `postMessage` do zmiennej modułu,
 * 2. ładujemy Pyodide - to jedyny moment, w którym worker potrzebuje sieci
 *    (pliki z /pyodide/ tej samej aplikacji, bez internetu),
 * 3. odbieramy sobie sieć, magazyny i kanały komunikacji (lockdown),
 * 4. dopiero wtedy przyjmujemy kod ucznia.
 *
 * Python w Pyodide ma dostęp do obiektów JS przez moduł `js` - po kroku 3
 * nie ma tam już niczego, czym dałoby się wysłać dane albo podrobić wynik.
 */

type Message =
  | { type: 'ready' }
  | { type: 'load-error'; message: string }
  | { type: 'result'; nonce: string; raw: PythonRun };

interface RunMessage {
  nonce: string;
  /** 'sql' = zapytanie do bazy SQLite zamiast funkcji w Pythonie. */
  language?: 'python' | 'sql';
  source: string;
  functionName: string;
  /** Wyłącznie argumenty. Oczekiwane wyniki nigdy tu nie trafiają. */
  inputs: unknown[][];
}

const scope = self as unknown as { postMessage: (m: Message) => void };
const post = scope.postMessage.bind(scope);

const ready = (async () => {
  const base = new URL('/pyodide/', self.location.origin).href;
  const py = await loadPyodide({ indexURL: base });
  const survivors = lockDown(self);
  if (survivors.includes('postMessage')) {
    throw new Error('Piaskownica nie mogła się zabezpieczyć i odmówiła uruchomienia kodu.');
  }
  return py;
})();

ready.then(
  () => post({ type: 'ready' }),
  (err: unknown) => post({ type: 'load-error', message: err instanceof Error ? err.message : String(err) }),
);

self.onmessage = async (e: MessageEvent<RunMessage>) => {
  const { nonce, source, functionName, inputs, language } = e.data;
  let py;
  try {
    py = await ready;
  } catch (err) {
    post({
      type: 'result',
      nonce,
      raw: { status: 'compile-error', values: [], message: err instanceof Error ? err.message : String(err), output: '' },
    });
    return;
  }
  const raw = language === 'sql' ? runSqlTests(py, source, inputs) : runPythonTests(py, source, functionName, inputs);
  post({ type: 'result', nonce, raw });
};

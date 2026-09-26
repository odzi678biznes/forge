import type { PyodideAPI } from 'pyodide';
import { MAX_OUTPUT, STUDENT_FILE, explainPythonError } from './python-harness';

/**
 * Uruchomienie całego programu ucznia (nie funkcji) z plikami danych —
 * tak jak na maturze: program czyta dane3.txt i wypisuje odpowiedź.
 * Pliki trafiają do wirtualnego systemu plików Pyodide, poza nim nic.
 */

export interface ScriptRun {
  status: 'ok' | 'error';
  output: string;
  message: string | null;
}

export function runPythonScript(py: PyodideAPI, source: string, files: Record<string, string>): ScriptRun {
  let output = '';
  const write = (s: string) => {
    if (output.length < MAX_OUTPUT) output += `${s}\n`;
  };
  py.setStdout({ batched: write });
  py.setStderr({ batched: write });
  try {
    for (const [name, content] of Object.entries(files)) {
      if (!/^[\w.-]+$/.test(name)) return { status: 'error', output, message: `Nieprawidłowa nazwa pliku „${name}”.` };
      py.FS.writeFile(name, content);
    }
    const makeDict = py.globals.get('dict') as () => { destroy: () => void };
    const ns = makeDict();
    try {
      py.runPython(source, { globals: ns as never, filename: STUDENT_FILE });
      return { status: 'ok', output, message: null };
    } catch (err) {
      return { status: 'error', output, message: explainPythonError(err instanceof Error ? err.message : String(err)) };
    } finally {
      ns.destroy();
    }
  } finally {
    py.setStdout({});
    py.setStderr({});
  }
}

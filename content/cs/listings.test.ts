import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { CS_QUESTIONS } from './index';

/**
 * „Co wypisze ten program?” — odpowiedź sprawdzana prawdziwym Pythonem.
 *
 * `verify` w treści to przepisanie programu na JavaScript, a JavaScript
 * i Python różnią się dokładnie tam, gdzie łatwo o pomyłkę: dzielenie
 * całkowite i reszta z liczb ujemnych, round() (w Pythonie do parzystej),
 * wypisywanie list. Tu uruchamiamy sam listing i porównujemy ostatnią
 * wypisaną linię z odpowiedzią.
 */

const PRINTING = CS_QUESTIONS.filter((q) => q.listing !== undefined && /print\(/.test(q.listing));

let py: PyodideAPI;
beforeAll(async () => {
  py = await loadPyodide({ indexURL: import.meta.env.PYODIDE_INDEX_URL });
}, 60_000);

function lastPrintedLine(source: string): string {
  const out: string[] = [];
  py.setStdout({ batched: (s: string) => out.push(s) });
  const makeDict = py.globals.get('dict') as () => { destroy: () => void };
  const ns = makeDict();
  try {
    py.runPython(source, { globals: ns as never });
  } finally {
    ns.destroy();
    py.setStdout();
  }
  const lines = out.join('\n').split('\n').map((l) => l.trim()).filter((l) => l !== '');
  return lines[lines.length - 1] ?? '';
}

const asNumber = (s: string): number | null => {
  const n = Number(s.replace(',', '.'));
  return s.trim() !== '' && Number.isFinite(n) ? n : null;
};

describe('Informatyka: listingi uruchomione w Pythonie', () => {
  it('jest co sprawdzać', () => {
    expect(PRINTING.length).toBeGreaterThanOrEqual(20);
  });

  for (const q of PRINTING) {
    it(`${q.id}: wydruk zgadza się z odpowiedzią`, () => {
      const printed = lastPrintedLine(q.listing!);
      const expected =
        q.format === 'choice' ? q.choices![['A', 'B', 'C', 'D'].indexOf(q.answer)]! : q.answer;
      const accepted = [expected, ...(q.format === 'choice' ? [] : q.acceptedVariants)];
      const p = asNumber(printed);
      const ok = accepted.some((a) => {
        const e = asNumber(a);
        if (p !== null && e !== null) return Math.abs(p - e) <= (q.tolerance ?? 1e-9);
        return a.trim() === printed;
      });
      expect(ok, `wypisano „${printed}”, odpowiedź „${expected}”`).toBe(true);
    });
  }
});

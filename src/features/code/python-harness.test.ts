import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import { explainPythonError, runPythonTests } from './python-harness';

let py: PyodideAPI;

beforeAll(async () => {
  py = await loadPyodide();
}, 60_000);

describe('uruchamianie Pythona', () => {
  it('zbiera wartosci zwrocone dla kazdego testu', () => {
    const r = runPythonTests(py, 'def suma(t):\n    return sum(x for x in t if x > 0)\n', 'suma', [[[1, -2, 3]], [[]]]);
    expect(r.status).toBe('ok');
    expect(r.values).toEqual([{ ok: true, value: 4 }, { ok: true, value: 0 }]);
  });

  it('listy, krotki i slowniki wracaja jako czyste dane', () => {
    const src = 'def f():\n    return [1, (2, 3), {"a": [4]}]\n';
    expect(runPythonTests(py, src, 'f', [[]]).values).toEqual([{ ok: true, value: [1, [2, 3], { a: [4] }] }]);
  });

  it('None to null, napisy i wartosci logiczne bez zmian', () => {
    const src = 'def f(x):\n    return None if x == 0 else ("tak" if x > 0 else False)\n';
    expect(runPythonTests(py, src, 'f', [[0], [1], [-1]]).values.map((v) => (v.ok ? v.value : v.error))).toEqual([
      null,
      'tak',
      false,
    ]);
  });

  it('blad skladni to compile-error z numerem linii i wyjasnieniem', () => {
    const r = runPythonTests(py, 'def f(x)\n    return x\n', 'f', [[1]]);
    expect(r.status).toBe('compile-error');
    expect(r.message).toMatch(/SyntaxError/);
    expect(r.message).toMatch(/linia 1/);
  });

  it('wyjatek w jednym tescie nie przerywa pozostalych', () => {
    const r = runPythonTests(py, 'def f(x):\n    return 10 // x\n', 'f', [[0], [5]]);
    expect(r.values[0]).toMatchObject({ ok: false });
    expect((r.values[0] as { error: string }).error).toMatch(/ZeroDivisionError.*linia 2.*dzielenie przez zero/);
    expect(r.values[1]).toEqual({ ok: true, value: 2 });
  });

  it('brak funkcji o podanej nazwie', () => {
    const r = runPythonTests(py, 'def g(x):\n    return x\n', 'f', [[1]]);
    expect(r.status).toBe('compile-error');
    expect(r.message).toMatch(/Nie znaleziono funkcji „f"/);
  });

  it('modyfikacja argumentu nie psuje kolejnych testow', () => {
    const src = 'def f(t):\n    t.append(9)\n    return len(t)\n';
    const shared = [1, 2];
    expect(runPythonTests(py, src, 'f', [[shared], [shared]]).values).toEqual([
      { ok: true, value: 3 },
      { ok: true, value: 3 },
    ]);
  });

  it('print() jest zbierany do podgladu, a kolejne uruchomienia maja czysta przestrzen nazw', () => {
    const first = runPythonTests(py, 'licznik = 5\ndef f():\n    print("debug", licznik)\n    return 1\n', 'f', [[]]);
    expect(first.output).toContain('debug 5');
    const second = runPythonTests(py, 'def f():\n    return licznik\n', 'f', [[]]);
    expect((second.values[0] as { error: string }).error).toMatch(/NameError/);
  });

  it('nazwa funkcji nie moze wstrzyknac kodu', () => {
    expect(runPythonTests(py, 'x = 1', 'f(); import os', [[]]).status).toBe('compile-error');
  });
});

describe('wyjasnianie bledow Pythona', () => {
  it('bierze ostatnia linie sladu i linie z kodu ucznia', () => {
    const trace = [
      'Traceback (most recent call last):',
      '  File "/lib/python3.14/site-packages/_pyodide/_base.py", line 500, in eval_code',
      '  File "<twoj_kod>", line 4, in f',
      "IndexError: list index out of range",
    ].join('\n');
    expect(explainPythonError(trace)).toBe('IndexError: list index out of range (linia 4) — indeks poza zakresem listy albo napisu');
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideAPI } from 'pyodide';
import dane3 from '../../public/nauka/dane3.txt?raw';
import { runPythonScript } from '@/features/code/script-harness';
import { LEKCJE } from './lekcje';
import type { KartaKod, KartaZadanie } from './typy';

/**
 * Zadania z kodem w prototypie sprawdzone prawdziwym Pythonem:
 * - wzorcowe programy dają OFICJALNE odpowiedzi CKE (na oryginalnym pliku),
 * - szablony dla ucznia się uruchamiają, ale jeszcze nie dają wyniku,
 * - „co wypisze program?” — oczekiwany wynik to naprawdę to, co wypisuje Python.
 */

let py: PyodideAPI;
beforeAll(async () => {
  py = await loadPyodide({ indexURL: import.meta.env.PYODIDE_INDEX_URL });
}, 60_000);

const WZORCOWE: Record<string, string> = {
  'c1-zadanie': `n = 542102
b = 1
c = 0
ile = 0
while n > 0:
    a = n % 10
    n = n // 10
    if a % 2 == 0:
        c = c + b * (a // 2)
    else:
        c = c + b
        ile = ile + 1
    b = b * 10
print(c, ile)
`,
  'c2-zadanie': `min1, min2 = 10**9, 10**9
with open("dane3.txt") as f:
    for linia in f:
        a, b = map(int, linia.split())
        dlug = b - a + 1
        if dlug < min1:
            min2 = min1
            min1 = dlug
        elif min1 < dlug < min2:
            min2 = dlug
print(min1, min2)
`,
};

const zadaniaZKodem = LEKCJE.flatMap((l) => l.karty).filter(
  (k): k is KartaZadanie => k.rodzaj === 'zadanie' && k.python !== undefined,
);

function pliki(k: KartaZadanie): Record<string, string> {
  return k.python?.nazwaPliku ? { [k.python.nazwaPliku]: dane3 } : {};
}

describe('zadania CKE z kodem', () => {
  it('plik dane3.txt z informatora ma 2023 wiersze', () => {
    expect(dane3.trim().split(/\r?\n/)).toHaveLength(2023);
  });

  for (const k of zadaniaZKodem) {
    it(`${k.id}: wzorcowy program daje oficjalną odpowiedź CKE`, () => {
      const r = runPythonScript(py, WZORCOWE[k.id] ?? '', pliki(k));
      expect(r.message).toBeNull();
      expect(r.output.trim()).toBe(k.python!.oczekiwanyWynik);
    });

    it(`${k.id}: szablon ucznia uruchamia się, ale nie jest gotowym rozwiązaniem`, () => {
      const r = runPythonScript(py, k.python!.szablon, pliki(k));
      expect(r.status, r.message ?? '').toBe('ok');
      expect(r.output.trim()).not.toBe(k.python!.oczekiwanyWynik);
    });
  }

  it('„co wypisze program?” — oczekiwane wyniki zgadzają się z Pythonem', () => {
    const karty = LEKCJE.flatMap((l) => l.karty).filter((k): k is KartaKod => k.rodzaj === 'kod');
    expect(karty.length).toBeGreaterThan(5);
    for (const k of karty) {
      const r = runPythonScript(py, k.kod, {});
      expect(r.message, k.id).toBeNull();
      expect(r.output.trim(), k.id).toBe(k.wynik[0]);
    }
  });
});

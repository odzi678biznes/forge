import { describe, expect, it } from 'vitest';
import {
  deepEqual,
  describeValue,
  hiddenTestCount,
  judge,
  verdictToGrade,
  visibleTests,
  type CodeTest,
} from './code-grading';
import { buildSolution, collectValues } from './run-tests';
import { describePython, executeTests, gradeRun } from './code-grading';

/**
 * Blueprint sek. 16 wymaga testów oceniania kodu „na poprawnych, błędnych
 * i złośliwych danych". Wszystkie trzy kategorie są tu pokryte.
 */

const tests: CodeTest[] = [
  { name: 'pusta tablica', input: [[]], expected: 0 },
  { name: 'liczby dodatnie', input: [[1, 2, 3]], expected: 6 },
  { name: 'ujemne', input: [[-5, 5]], expected: 0, hidden: true },
];

function run(source: string, fn = 'suma') {
  const { solve, error } = buildSolution(source, fn);
  if (!solve) return { status: 'compile-error' as const, outcomes: [], message: error };
  return executeTests(solve, tests);
}

describe('porownanie wynikow', () => {
  it('porownuje tablice strukturalnie, nie referencyjnie', () => {
    expect(deepEqual([1, 2], [1, 2])).toBe(true);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
    expect(deepEqual([[1], [2]], [[1], [2]])).toBe(true);
  });

  it('porownuje obiekty niezaleznie od kolejnosci kluczy', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('nie zrownuje liczby z jej zapisem tekstowym', () => {
    // Typ wyniku bywa czescia zadania algorytmicznego.
    expect(deepEqual(5, '5')).toBe(false);
  });

  it('radzi sobie z null i undefined', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('NaN jest rowne samemu sobie', () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it('opis wartosci jest czytelny i nie wywraca sie na cyklu', () => {
    expect(describeValue([1, 2])).toBe('[1,2]');
    expect(describeValue('tekst')).toBe('"tekst"');
    const cykl: Record<string, unknown> = {};
    cykl.self = cykl;
    expect(() => describeValue(cykl)).not.toThrow();
  });
});

describe('dane poprawne', () => {
  it('rozwiazanie przechodzace wszystkie testy jest zaliczone', () => {
    const v = judge(run('function suma(a){ return a.reduce((x,y)=>x+y,0); }'));
    expect(v.allPassed).toBe(true);
    expect(v.passed).toBe(v.total);
    expect(v.summary).toMatch(/wszystkie testy przechodz/i);
  });

  it('testy ukryte tez musza przejsc', () => {
    // Kod dopasowany tylko do widocznych przypadkow.
    const v = judge(
      run('function suma(a){ if(a.length===0) return 0; if(a[0]===1) return 6; return 999; }'),
    );
    expect(v.allPassed).toBe(false);
    expect(v.firstFailure?.hidden).toBe(true);
  });
});

describe('dane bledne', () => {
  it('bledne rozwiazanie nie jest zaliczone i wskazuje pierwszy blad', () => {
    const v = judge(run('function suma(a){ return a.length; }'));
    expect(v.allPassed).toBe(false);
    expect(v.firstFailure?.name).toBe('liczby dodatnie');
    expect(v.summary).toMatch(/oczekiwa/i);
  });

  it('blad skladni jest nazwany, a nie zgloszony jako awaria', () => {
    const v = judge(run('function suma(a) { return ; ; ;'));
    expect(v.allPassed).toBe(false);
    expect(v.summary).toMatch(/nie uruchomi/i);
  });

  it('zla nazwa funkcji jest nazwana wprost', () => {
    const v = judge(run('function inna(a){ return 0; }'));
    expect(v.summary).toMatch(/nie znaleziono funkcji/i);
  });

  it('wyjatek w jednym tescie nie przerywa pozostalych', () => {
    const r = run('function suma(a){ if(a.length===0) throw new Error("pusto"); return a.reduce((x,y)=>x+y,0); }');
    expect(r.outcomes).toHaveLength(tests.length);
    expect(r.outcomes[0]?.error).toContain('pusto');
    expect(r.outcomes[1]?.passed).toBe(true);
  });

  it('brak testow to wadliwe zadanie, a nie zaliczenie', () => {
    const v = judge({ status: 'ok', outcomes: [], message: null });
    expect(v.allPassed).toBe(false);
    expect(v.summary).toMatch(/nie ma test/i);
  });
});

describe('dane zlosliwe', () => {
  it('modyfikacja wejscia nie przenosi sie na kolejne testy', () => {
    const r = run('function suma(a){ a.length = 0; return a.length === 0 ? 0 : 1; }');
    // Gdyby wejscie bylo wspoldzielone, drugi test tez zwrocilby 0.
    expect(r.outcomes[0]?.passed).toBe(true);
    expect(r.outcomes[1]?.passed).toBe(false);
  });

  it('proba siegniecia po stan aplikacji konczy sie bledem testu, nie wyciekiem', () => {
    const r = run('function suma(a){ return typeof indexedDB; }');
    // W srodowisku testowym i w workerze kod nie dostaje bazy aplikacji.
    expect(r.outcomes.every((o) => !o.passed)).toBe(true);
  });

  it('rzucenie wartoscia inna niz Error nadal daje czytelny komunikat', () => {
    const r = run('function suma(a){ throw "cos poszlo nie tak"; }');
    expect(r.outcomes[0]?.error).toContain('cos poszlo nie tak');
  });

  it('zwrocenie funkcji zamiast wyniku nie zalicza testu', () => {
    const v = judge(run('function suma(a){ return function(){ return 6; }; }'));
    expect(v.allPassed).toBe(false);
  });

  it('nadpisanie globalnego porownania nie zalicza zadania', () => {
    // Kod probuje podmienic to, czym sam bedzie oceniany. Grader trzyma
    // wlasne referencje przechwycone przed uruchomieniem kodu ucznia.
    const oryginalne = { is: Object.is, every: Array.prototype.every };
    try {
      const v = judge(
        run(
          'function suma(a){ Object.is = () => true; Array.prototype.every = () => true; return "oszustwo"; }',
        ),
      );
      expect(v.allPassed).toBe(false);
      expect(v.passed).toBe(0);
    } finally {
      Object.is = oryginalne.is;
      Array.prototype.every = oryginalne.every;
    }
  });

  it('nadpisanie JSON.stringify nie psuje opisu wyniku', () => {
    const oryginalny = JSON.stringify;
    try {
      const r = run(
        'function suma(a){ JSON.stringify = () => "wszystko ok"; return -1; }',
      );
      expect(r.outcomes[0]?.passed).toBe(false);
      expect(r.outcomes[0]?.actual).not.toContain('wszystko ok');
    } finally {
      JSON.stringify = oryginalny;
    }
  });
});

describe('werdykt i widocznosc testow', () => {
  it('liczy przechodzace i wszystkie', () => {
    const v = judge(run('function suma(a){ return a.length === 0 ? 0 : 6; }'));
    expect(v.total).toBe(3);
    expect(v.passed).toBe(2);
  });

  it('timeout jest nazwany po przyczynie, nie jako blad ogolny', () => {
    const v = judge({ status: 'timeout', outcomes: [], message: 'limit' });
    expect(v.summary).toMatch(/limit czasu/i);
    expect(v.summary).toMatch(/p[eę]tla|z[lł]o[zż]ono/i);
  });

  it('nieprzechodzacy test ukryty nie zdradza oczekiwanej wartosci', () => {
    const v = judge(
      run('function suma(a){ if(a.length===0) return 0; if(a[0]===1) return 6; return 42; }'),
    );
    expect(v.summary).toMatch(/ukryty/i);
    expect(v.summary).not.toContain('0'.repeat(1) + ' a otrzyma');
  });

  it('widoczne testy da sie pokazac przed uruchomieniem', () => {
    expect(visibleTests(tests)).toHaveLength(2);
    expect(hiddenTestCount(tests)).toBe(1);
  });
});

describe('werdykt jako ocena dla silnika opanowania', () => {
  const verdict = (passed: number, total: number) =>
    judge({
      status: 'ok',
      outcomes: Array.from({ length: total }, (_, i) => ({
        name: `t${i}`,
        hidden: false,
        passed: i < passed,
      })),
      message: null,
    });

  it('wszystkie testy -> poprawnie', () => {
    expect(verdictToGrade(verdict(3, 3), 'ok').correctness).toBe('correct');
  });

  it('czesc testow -> czesciowo, zeby nie cofac poziomu jak za brak rozwiazania', () => {
    expect(verdictToGrade(verdict(2, 3), 'ok').correctness).toBe('partial');
  });

  it('zero testow -> niepoprawnie', () => {
    expect(verdictToGrade(verdict(0, 3), 'ok').correctness).toBe('incorrect');
  });

  it('przekroczenie czasu nigdy nie jest odpowiedzia czesciowa', () => {
    const v = judge({ status: 'timeout', outcomes: [], message: 'limit' });
    expect(verdictToGrade(v, 'timeout').correctness).toBe('incorrect');
  });

  it('notatka dla ucznia to podsumowanie werdyktu', () => {
    const v = verdict(1, 3);
    expect(verdictToGrade(v, 'ok').note).toBe(v.summary);
  });
});

/**
 * Testy regresji luki w graderze.
 *
 * Wcześniej porównanie odbywało się w tym samym realm co kod ucznia.
 * Nadpisanie `Array.prototype.push` sprawiało, że funkcja zwracająca -999
 * dostawała werdykt „wszystkie testy przechodzą" — łącznie z ukrytymi.
 * Każdy z poniższych przypadków był lub mógłby być sposobem na zaliczenie
 * zadania bez rozwiązania go.
 */
describe('integralnosc oceny: kod ucznia nie moze sie sam zaliczyc', () => {
  const proto = {
    push: Array.prototype.push,
    filter: Array.prototype.filter,
    find: Array.prototype.find,
    map: Array.prototype.map,
    iterNext: Object.getPrototypeOf([][Symbol.iterator]()).next,
  };
  const restore = () => {
    Array.prototype.push = proto.push;
    Array.prototype.filter = proto.filter;
    Array.prototype.find = proto.find;
    Array.prototype.map = proto.map;
    Object.getPrototypeOf([][Symbol.iterator]()).next = proto.iterNext;
  };

  const exploit = (body: string) => {
    try {
      return judge(run(`function suma(t){ ${body} return -999; }`));
    } finally {
      restore();
    }
  };

  it('nadpisanie Array.prototype.push nie przestawia wynikow na zaliczone', () => {
    const v = exploit(`
      const P = Array.prototype.push;
      Array.prototype.push = function(o){
        if (o && typeof o === 'object' && 'passed' in o) { o.passed = true; delete o.actual; delete o.expected; }
        return P.apply(this, arguments);
      };`);
    expect(v.allPassed).toBe(false);
    expect(v.passed).toBe(0);
  });

  it('skrocenie petli przez podmiane iteratora nie zostawia samych zaliczen', () => {
    const v = exploit(`Object.getPrototypeOf([][Symbol.iterator]()).next = () => ({ done: true });`);
    expect(v.allPassed).toBe(false);
    expect(v.total).toBe(tests.length);
  });

  it('podmiana filter i find nie falszuje liczenia zaliczonych', () => {
    const v = exploit(`
      Array.prototype.filter = function(){ return this; };
      Array.prototype.find = function(){ return undefined; };`);
    expect(v.allPassed).toBe(false);
    expect(v.passed).toBe(0);
  });
});

describe('granica piaskownicy: oczekiwania nie opuszczaja zaufanej strony', () => {
  it('piaskownica dostaje tylko argumenty i odsyla tylko wartosci', () => {
    const { solve } = buildSolution('function suma(t){ return t.length; }', 'suma');
    const raw = collectValues(solve!, tests.map((t) => t.input));
    // Surowy wynik nie zawiera nazw testow, flag ukrycia ani oczekiwan.
    expect(Object.keys(raw).sort()).toEqual(['message', 'status', 'values']);
    for (const v of raw.values) expect(Object.keys(v).sort()).toEqual(['ok', 'value']);
  });

  it('wartosc nie do przeslania (funkcja) jest bledem testu, nie awaria przesylu', () => {
    const { solve } = buildSolution('function suma(t){ return () => 1; }', 'suma');
    const raw = collectValues(solve!, [[[1]]]);
    expect(raw.values[0]?.ok).toBe(false);
  });

  it('nieprawidlowa nazwa funkcji nie trafia do generowanego kodu', () => {
    const { solve, error } = buildSolution('function a(){}', 'a; throw 1; //');
    expect(solve).toBeNull();
    expect(error).toMatch(/nieprawid/i);
  });
});

describe('walidacja podrobionego wyniku z piaskownicy', () => {
  it('wynik niebedacy obiektem nie wywraca aplikacji i niczego nie zalicza', () => {
    for (const forged of [null, undefined, 42, 'ok', [true, true, true]]) {
      const v = judge(gradeRun(tests, forged));
      expect(v.allPassed, String(forged)).toBe(false);
      expect(v.total).toBe(tests.length);
    }
  });

  it('nieznany status jest odrzucany', () => {
    const v = judge(gradeRun(tests, { status: 'passed', values: [], message: null }));
    expect(v.allPassed).toBe(false);
  });

  it('za krotka lista wartosci liczy brakujace testy jako niezaliczone', () => {
    const r = gradeRun(tests, { status: 'ok', values: [{ ok: true, value: 0 }], message: null });
    expect(r.outcomes).toHaveLength(tests.length);
    expect(judge(r).allPassed).toBe(false);
  });

  it('podrobione pole passed w wartosci nic nie znaczy - liczy sie porownanie', () => {
    const r = gradeRun(tests, {
      status: 'ok',
      values: tests.map(() => ({ ok: true, value: -999, passed: true })),
      message: null,
    });
    expect(judge(r).passed).toBe(0);
  });

  it('absurdalnie zagniezdzona wartosc nie wywraca porownania', () => {
    let deep: unknown = 0;
    for (let i = 0; i < 20000; i += 1) deep = [deep];
    const r = gradeRun(tests, {
      status: 'ok',
      values: tests.map(() => ({ ok: true, value: deep })),
      message: null,
    });
    expect(judge(r).allPassed).toBe(false);
  });

  it('pusta Map nie jest rowna pustemu obiektowi', () => {
    expect(deepEqual(new Map(), {})).toBe(false);
  });
});

describe('wartosci w zapisie Pythona', () => {
  it('listy, logika, None i napisy wygladaja jak w Pythonie', () => {
    expect(describePython([1, 0, 0])).toBe('[1, 0, 0]');
    expect(describePython(true)).toBe('True');
    expect(describePython(null)).toBe('None');
    expect(describePython('Ala')).toBe("'Ala'");
    expect(describePython("it's")).toBe(`"it's"`);
    expect(describePython(`a'b"c`)).toBe(`'a\\'b"c'`);
    expect(describePython({ a: [1, 2] })).toBe("{'a': [1, 2]}");
  });

  it('wynik przegranego testu w Pythonie jest opisany po pythonowemu', () => {
    const r = gradeRun(
      [{ name: 't', input: [], expected: [1, 0, 0] }],
      { status: 'ok', values: [{ ok: true, value: [1, 60, 0] }], message: null },
      describePython,
    );
    expect(r.outcomes[0]).toMatchObject({ expected: '[1, 0, 0]', actual: '[1, 60, 0]' });
  });

  it('absurdalnie zagniezdzona wartosc nie wywraca opisu', () => {
    let v: unknown = 1;
    for (let i = 0; i < 5000; i += 1) v = [v];
    expect(() => describePython(v)).not.toThrow();
  });
});

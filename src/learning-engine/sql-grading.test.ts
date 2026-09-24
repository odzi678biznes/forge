import { describe, expect, it } from 'vitest';
import type { CodeTest } from '@/data/types';
import { judge } from './code-grading';
import { canonicalRows, gradeSqlRun } from './sql-grading';
import { undefinedToNull } from '@/features/code/python-harness';

const test = (ordered: boolean, expected: unknown[][]): CodeTest => ({
  name: 'baza',
  input: ['CREATE TABLE t(a);', null, ordered],
  expected,
});

const ok = (value: unknown) => ({ status: 'ok', values: [{ ok: true, value }], message: null });

describe('ocena zapytan SQL', () => {
  it('bez ORDER BY kolejnosc wierszy nie ma znaczenia', () => {
    const r = gradeSqlRun([test(false, [[1, 'a'], [2, 'b']])], ok([[2, 'b'], [1, 'a']]));
    expect(judge(r).allPassed).toBe(true);
  });

  it('gdy zadanie wymaga kolejnosci, zla kolejnosc nie przechodzi', () => {
    const r = gradeSqlRun([test(true, [[1, 'a'], [2, 'b']])], ok([[2, 'b'], [1, 'a']]));
    expect(judge(r).allPassed).toBe(false);
  });

  it('dobre wiersze w zlej kolejnosci dostaja wskazowke o ORDER BY', () => {
    const r = gradeSqlRun([test(true, [[1], [2]])], ok([[2], [1]]));
    expect(r.outcomes[0]?.error).toMatch(/ORDER BY/);
  });

  it('inna liczba kolumn dostaje wskazowke o liscie po SELECT', () => {
    const r = gradeSqlRun([test(false, [[1, 'a']])], ok([[1, 'a', 2007]]));
    expect(r.outcomes[0]?.error).toMatch(/3 kolumn.*powinien mieć 2/);
  });

  it('brakujacy albo nadmiarowy wiersz nie przechodzi', () => {
    expect(judge(gradeSqlRun([test(false, [[1], [2]])], ok([[1]]))).allPassed).toBe(false);
    expect(judge(gradeSqlRun([test(false, [[1]])], ok([[1], [1]]))).allPassed).toBe(false);
  });

  it('porzadek kanoniczny: NULL przed liczbami, liczby przed tekstem', () => {
    expect(canonicalRows([['b'], [2], [null], ['a'], [10]])).toEqual([[null], [2], [10], ['a'], ['b']]);
  });

  it('wynik pokazywany uczniowi wyglada jak w Pythonie', () => {
    const r = gradeSqlRun([test(true, [[1, 'Ala']])], ok([[1, 'Ola']]));
    expect(r.outcomes[0]).toMatchObject({ expected: "[[1, 'Ala']]", actual: "[[1, 'Ola']]" });
  });

  it('None zagniezdzone w wynikach staje sie null', () => {
    expect(undefinedToNull([[1, undefined], { a: undefined }])).toEqual([[1, null], { a: null }]);
  });
});

import { describe, expect, it } from 'vitest';
import { ATTEMPTS, count } from './polish';

describe('odmiana po liczebniku', () => {
  it.each([
    [0, '0 prób'],
    [1, '1 próba'],
    [2, '2 próby'],
    [4, '4 próby'],
    [5, '5 prób'],
    [12, '12 prób'],
    [14, '14 prób'],
    [22, '22 próby'],
    [101, '101 prób'],
    [112, '112 prób'],
    [123, '123 próby'],
  ])('%i', (n, expected) => {
    expect(count(n, ATTEMPTS)).toBe(expected);
  });
});

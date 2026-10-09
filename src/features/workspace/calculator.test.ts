import { describe, expect, it } from 'vitest';
import { calculate, normalizeCalculation, isSupportedCalculation } from './calculator';

describe('student calculator', () => {
  it.each([['(-6)^2-4*1*5',16], ['(43-8)/3,5',10], ['(-5-3)/2',-4], ['-3/-4',.75], ['2(3+4)',14], ['20%*150',30], ['sqrt(16)',4], ['-2^2',-4], ['(-2)^2',4], ['2^-3',.125], ['2^3^2',512]])('calculates %s', (text, expected) => {
    expect(calculate(text).value).toBeCloseTo(expected);
  });
  it('handles spoken operators and explicit variable memory', () => {
    expect(calculate('43 minus 8').value).toBe(35);
    expect(calculate('a = -4').variable).toBe('a');
    expect(calculate('-3/a', { a:-4 }).value).toBe(.75);
    expect(normalizeCalculation('x do kwadratu plus 2 razy x')).toBe('x ^2 + 2 * x');
  });
  it.each(['1/0', 'sqrt(-1)', '2x+3=7', 'a.b', '[1,2]', 'import(1)', 'evaluate(1)', '2;3', 'factorial(999999)', '2^999999', 'x+1', 'a=2=3', '('.repeat(60)+'1'+')'.repeat(60)])('rejects unsafe or undefined %s', text => {
    expect(() => calculate(text)).toThrow();
  });
  it('accepts notation without evaluating it, but keeps equations in the notebook', () => {
    expect(isSupportedCalculation('(-6)^2-4*1*5')).toBe(true);
    expect(isSupportedCalculation('a=-4')).toBe(true);
    expect(isSupportedCalculation('x^2+3')).toBe(true);
    expect(isSupportedCalculation('1/0')).toBe(true); // The calculator explains the domain only when asked to compute.
    expect(isSupportedCalculation('-5=2*a+3')).toBe(false);
    expect(isSupportedCalculation('2*x+3=7')).toBe(false);
    expect(isSupportedCalculation('2+*3')).toBe(false);
    expect(isSupportedCalculation('import(1)')).toBe(false);
  });
  it('uses school logarithms, distinguishes ln and asks about ambiguous base separators', () => {
    expect(calculate('log(100)').value).toBe(2);
    expect(calculate('ln(e)').value).toBe(1);
    expect(calculate('log(8)/log(2)').value).toBeCloseTo(3);
    expect(calculate('log(8.2)').value).toBeCloseTo(Math.log10(8.2));
    expect(() => calculate('log(8,2)')).toThrow('kropki dziesiętnej');
    expect(isSupportedCalculation('log(8,2)')).toBe(false);
  });
});

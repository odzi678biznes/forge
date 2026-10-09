import { describe, expect, it } from 'vitest';
import { calculate } from './calculator';
import { calculationValue, resultIsRounded, resultTex } from './calculator-display';

describe('wynik i dalsze rachunki', () => {
  it('zachowuje pełny wynik przy kontynuowaniu małej potęgi', () => {
    const result = calculate('16^(-8)');
    expect(result.result).not.toBe(String(result.value));
    expect(calculate(`${calculationValue(result)}*16^8`).value).toBe(1);
    expect(calculationValue(result)).toBe('2.3283064365386963e-10');
  });
  it('nie zaokrągla ułamka przed następnym mnożeniem', () => {
    const result = calculate('1/3');
    expect(calculate(`${calculationValue(result)}*3`).value).toBe(1);
    expect(calculate(`${result.result}*3`).value).not.toBe(1);
  });
  it('pokazuje potęgę dziesięciu i rozpoznaje przybliżenie', () => {
    expect(resultTex('2.3283064365387e-10')).toBe('2{,}32831\\cdot 10^{-10}');
    expect(resultIsRounded('2.3283064365387e-10')).toBe(true);
    expect(resultIsRounded('1e-10')).toBe(false);
    expect(resultTex('0.75')).toBe('0{,}75');
  });
});

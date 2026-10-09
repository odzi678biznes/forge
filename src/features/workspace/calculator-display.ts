import type { Calculation } from './calculator';

/** Further arithmetic uses the stored value, never its shortened display. */
export function calculationValue(c: Calculation): string { return String(c.value); }

/** Readable decimal/scientific notation without changing the stored numeric value. */
export function resultTex(result: string): string {
  const match = result.match(/^(-?\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
  return match ? `${Number(Number(match[1]).toPrecision(6)).toString().replace('.', '{,}')}\\cdot 10^{${Number(match[2])}}` : result.replace('.', '{,}');
}

export function resultIsRounded(result: string): boolean {
  const match = result.match(/^(-?\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
  return !!match && Number(Number(match[1]).toPrecision(6)) !== Number(match[1]);
}

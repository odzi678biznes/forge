import { describe, expect, it } from 'vitest';
import { formulaParts } from './formula-parts';

describe('dzielenie wzoru na czesci', () => {
  it('dzieli w miejscach \\qquad', () => {
    expect(formulaParts(String.raw`a^2 + b^2 = c^2 \qquad P = \pi r^2`)).toEqual([
      String.raw`a^2 + b^2 = c^2`,
      String.raw`P = \pi r^2`,
    ]);
  });

  it('nie dzieli wewnatrz nawiasow klamrowych', () => {
    const tex = String.raw`\text{a \qquad b} = 1`;
    expect(formulaParts(tex)).toEqual([tex]);
  });

  it('nie myli \\quad z \\qquad i ignoruje dosłowne klamry', () => {
    const tex = String.raw`\{1, 2\} \quad x \qquad y`;
    expect(formulaParts(tex)).toEqual([String.raw`\{1, 2\} \quad x`, 'y']);
  });

  it('wzor bez odstepu zostaje w calosci', () => {
    expect(formulaParts('x = 1')).toEqual(['x = 1']);
  });
});

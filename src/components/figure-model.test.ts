import { describe, expect, it } from 'vitest';
import { angleArc, bounds, plotPath, project, rightAngleMark, ticks, type Viewport } from './figure-model';

const v: Viewport = { width: 200, height: 200, pad: 0, x: [-5, 5], y: [-5, 5] };

describe('rzutowanie na SVG', () => {
  it('srodek ukladu jest na srodku rysunku, a os y rosnie w gore', () => {
    expect(project(v, 0, 0)).toEqual([100, 100]);
    expect(project(v, 5, 5)).toEqual([200, 0]);
    expect(project(v, -5, -5)).toEqual([0, 200]);
  });
});

describe('podzialka', () => {
  it('dla krotkiego zakresu co 1, dla dlugiego rzadziej', () => {
    expect(ticks(-5, 5)).toContain(1);
    expect(ticks(-5, 5)).toHaveLength(11);
    expect(ticks(0, 100).length).toBeLessThanOrEqual(13);
  });
});

describe('wykres funkcji', () => {
  it('prosta daje jedna ciagla sciezke', () => {
    const d = plotPath(v, (x) => x, -5, 5);
    expect((d.match(/M/g) ?? []).length).toBe(1);
  });

  it('hiperbola jest przerwana na asymptocie - bez pionowej kreski przez caly wykres', () => {
    const d = plotPath(v, (x) => 1 / x, -5, 5);
    expect((d.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('funkcja poza dziedzina (pierwiastek z liczby ujemnej) nie jest rysowana', () => {
    const d = plotPath(v, (x) => Math.sqrt(x), -5, 5);
    const xs = [...d.matchAll(/[ML]([\d.]+) /g)].map((m) => Number(m[1]));
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(100 - 1);
  });
});

describe('figury', () => {
  it('prostokat otaczajacy obejmuje wszystkie punkty z marginesem', () => {
    const [bx, by] = bounds([
      [0, 0],
      [4, 3],
    ]);
    expect(bx?.[0]).toBeLessThan(0);
    expect(bx?.[1]).toBeGreaterThan(4);
    expect(by?.[1]).toBeGreaterThan(3);
  });

  it('luk kata i znacznik kata prostego daja poprawne sciezki SVG', () => {
    expect(angleArc([0, 0], [10, 0], [0, 10], 5)).toMatch(/^M5\.00 0\.00 A5 5 0 0 1 /);
    expect(rightAngleMark([0, 0], [10, 0], [0, 10], 2)).toBe('M2.00 0.00 L2.00 2.00 L0.00 2.00');
  });
});

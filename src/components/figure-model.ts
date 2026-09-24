/**
 * Geometria rysunków - czyste funkcje, bez Reacta.
 *
 * Wydzielone, żeby dało się je przetestować: błąd w rysowaniu wykresu jest
 * błędem merytorycznym (uczeń odczyta z rysunku złą wartość), a nie
 * kosmetycznym.
 */

export interface Viewport {
  width: number;
  height: number;
  pad: number;
  x: [number, number];
  y: [number, number];
}

/** Przeliczenie współrzędnych matematycznych na piksele SVG (oś y w górę). */
export function project(v: Viewport, x: number, y: number): [number, number] {
  const [x0, x1] = v.x;
  const [y0, y1] = v.y;
  const w = v.width - 2 * v.pad;
  const h = v.height - 2 * v.pad;
  return [v.pad + ((x - x0) / (x1 - x0)) * w, v.pad + ((y1 - y) / (y1 - y0)) * h];
}

/** Krok podziałki tak, żeby na osi było najwyżej ok. 12 kresek. */
export function tickStep(span: number): number {
  const raw = span / 12;
  const steps = [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100];
  return steps.find((s) => s >= raw) ?? Math.ceil(raw);
}

export function ticks(min: number, max: number): number[] {
  const step = tickStep(max - min);
  const out: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) {
    out.push(Math.round(t * 1000) / 1000);
  }
  return out;
}

/**
 * Ścieżka SVG wykresu funkcji.
 *
 * Funkcja jest próbkowana gęsto. Ścieżka przerywa się tam, gdzie funkcja nie
 * istnieje (NaN, nieskończoność) albo "skacze" przez cały wykres - bez tego
 * hiperbola 1/x zostałaby narysowana z pionową kreską w miejscu asymptoty.
 */
export function plotPath(
  v: Viewport,
  fn: (x: number) => number,
  from: number = v.x[0],
  to: number = v.x[1],
  samples = 400,
): string {
  const [y0, y1] = v.y;
  const span = y1 - y0;
  const margin = span * 0.5;
  let d = '';
  let pen = false;
  let prevY: number | null = null;

  for (let i = 0; i <= samples; i += 1) {
    const x = from + ((to - from) * i) / samples;
    const y = fn(x);
    const valid = Number.isFinite(y) && y > y0 - margin && y < y1 + margin;
    const jump = prevY !== null && Math.abs(y - prevY) > span * 0.9;

    if (!valid || jump) {
      pen = false;
      prevY = valid ? y : null;
      if (!valid) continue;
    }

    const [px, py] = project(v, x, y);
    d += `${pen ? 'L' : 'M'}${px.toFixed(2)} ${py.toFixed(2)} `;
    pen = true;
    prevY = y;
  }
  return d.trim();
}

/** Prostokąt otaczający zbiór punktów, powiększony o margines. */
export function bounds(points: Array<[number, number]>, marginRatio = 0.12): Viewport['x'][] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const m = span * marginRatio;
  return [
    [minX - m, maxX + m],
    [minY - m, maxY + m],
  ];
}

/**
 * Łuk kąta przy wierzchołku `at` między ramionami do `a` i `b`, w pikselach.
 * Zawsze mniejszy z dwóch łuków (kąt wypukły).
 */
export function angleArc(
  at: [number, number],
  a: [number, number],
  b: [number, number],
  radius: number,
): string {
  const angA = Math.atan2(a[1] - at[1], a[0] - at[0]);
  const angB = Math.atan2(b[1] - at[1], b[0] - at[0]);
  let delta = angB - angA;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  const start: [number, number] = [at[0] + radius * Math.cos(angA), at[1] + radius * Math.sin(angA)];
  const end: [number, number] = [at[0] + radius * Math.cos(angA + delta), at[1] + radius * Math.sin(angA + delta)];
  const sweep = delta > 0 ? 1 : 0;
  return `M${start[0].toFixed(2)} ${start[1].toFixed(2)} A${radius} ${radius} 0 0 ${sweep} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`;
}

/** Znacznik kąta prostego: mały kwadrat w narożniku. */
export function rightAngleMark(
  at: [number, number],
  a: [number, number],
  b: [number, number],
  size: number,
): string {
  const unit = (p: [number, number]): [number, number] => {
    const dx = p[0] - at[0];
    const dy = p[1] - at[1];
    const len = Math.hypot(dx, dy) || 1;
    return [dx / len, dy / len];
  };
  const ua = unit(a);
  const ub = unit(b);
  const p1: [number, number] = [at[0] + ua[0] * size, at[1] + ua[1] * size];
  const p2: [number, number] = [p1[0] + ub[0] * size, p1[1] + ub[1] * size];
  const p3: [number, number] = [at[0] + ub[0] * size, at[1] + ub[1] * size];
  return `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} L${p2[0].toFixed(2)} ${p2[1].toFixed(2)} L${p3[0].toFixed(2)} ${p3[1].toFixed(2)}`;
}

import type { Figure as FigureSpec, GeometryFigure, PlotFigure } from '@/data/types';
import {
  angleArc,
  bounds,
  plotPath,
  project,
  rightAngleMark,
  ticks,
  type Viewport,
} from './figure-model';
import './figure.css';

/**
 * Rysunek do zadania albo lekcji - rysowany lokalnie jako SVG.
 *
 * Kolory idą z tokenów motywu, podpisy są zwykłym tekstem SVG. Każdy rysunek
 * ma opis (`alt`) dla czytnika ekranu - informacja z wykresu nie może być
 * dostępna tylko dla kogoś, kto widzi.
 */

interface Props {
  figure: FigureSpec;
  caption?: string;
}

export function Figure({ figure, caption }: Props) {
  return (
    <figure className="fig">
      {figure.kind === 'plot' ? <Plot spec={figure} /> : <Geometry spec={figure} />}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

const W = 360;
const H = 300;

function Plot({ spec }: { spec: PlotFigure }) {
  const v: Viewport = { width: W, height: H, pad: 22, x: spec.x, y: spec.y };
  const [ox, oy] = project(v, 0, 0);
  const xTicks = ticks(spec.x[0], spec.x[1]);
  const yTicks = ticks(spec.y[0], spec.y[1]);
  const [left, top] = project(v, spec.x[0], spec.y[1]);
  const [right, bottom] = project(v, spec.x[1], spec.y[0]);
  const axisX = Math.min(Math.max(oy, top), bottom);
  const axisY = Math.min(Math.max(ox, left), right);

  return (
    <svg className="fig__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.alt}>
      <defs>
        <marker id="fig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fig__axis-head" />
        </marker>
      </defs>

      {xTicks.map((t) => {
        const [px] = project(v, t, 0);
        return <line key={`gx${t}`} className="fig__grid" x1={px} y1={top} x2={px} y2={bottom} />;
      })}
      {yTicks.map((t) => {
        const [, py] = project(v, 0, t);
        return <line key={`gy${t}`} className="fig__grid" x1={left} y1={py} x2={right} y2={py} />;
      })}

      <line className="fig__axis" x1={left} y1={axisX} x2={right + 8} y2={axisX} markerEnd="url(#fig-arrow)" />
      <line className="fig__axis" x1={axisY} y1={bottom} x2={axisY} y2={top - 8} markerEnd="url(#fig-arrow)" />
      <text className="fig__axis-label" x={right + 4} y={axisX - 8}>
        x
      </text>
      <text className="fig__axis-label" x={axisY + 8} y={top - 2}>
        y
      </text>

      {xTicks
        .filter((t) => t !== 0)
        .map((t) => {
          const [px] = project(v, t, 0);
          return (
            <text key={`tx${t}`} className="fig__tick" x={px} y={axisX + 14} textAnchor="middle">
              {formatTick(t)}
            </text>
          );
        })}
      {yTicks
        .filter((t) => t !== 0)
        .map((t) => {
          const [, py] = project(v, 0, t);
          return (
            <text key={`ty${t}`} className="fig__tick" x={axisY - 6} y={py + 4} textAnchor="end">
              {formatTick(t)}
            </text>
          );
        })}
      <text className="fig__tick" x={axisY - 6} y={axisX + 14} textAnchor="end">
        0
      </text>

      {(spec.guides ?? []).map((g, i) =>
        g.x !== undefined ? (
          <line key={`g${i}`} className="fig__guide" x1={project(v, g.x, 0)[0]} y1={top} x2={project(v, g.x, 0)[0]} y2={bottom} />
        ) : g.y !== undefined ? (
          <line key={`g${i}`} className="fig__guide" x1={left} y1={project(v, 0, g.y)[1]} x2={right} y2={project(v, 0, g.y)[1]} />
        ) : null,
      )}

      {(spec.curves ?? []).map((c, i) => (
        <path
          key={`c${i}`}
          className={c.dashed ? 'fig__curve fig__curve--dashed' : 'fig__curve'}
          d={plotPath(v, c.fn, c.from ?? spec.x[0], c.to ?? spec.x[1])}
        />
      ))}
      {(spec.curves ?? []).map((c, i) => {
        if (!c.label) return null;
        const x = (c.to ?? spec.x[1]) - (spec.x[1] - spec.x[0]) * 0.06;
        const y = c.fn(x);
        if (!Number.isFinite(y) || y < spec.y[0] || y > spec.y[1]) return null;
        const [px, py] = project(v, x, y);
        return (
          <text key={`cl${i}`} className="fig__curve-label" x={px} y={py - 8} textAnchor="middle">
            {c.label}
          </text>
        );
      })}

      {(spec.polylines ?? []).map((pl, i) => (
        <polyline
          key={`p${i}`}
          className="fig__curve"
          points={pl.points.map(([x, y]) => project(v, x, y).join(',')).join(' ')}
        />
      ))}

      {(spec.points ?? []).map((pt, i) => {
        const [px, py] = project(v, pt.at[0], pt.at[1]);
        return (
          <g key={`pt${i}`}>
            <circle className={pt.open ? 'fig__point fig__point--open' : 'fig__point'} cx={px} cy={py} r={4} />
            {pt.label && (
              <text className="fig__point-label" x={px + 7} y={py - 7}>
                {pt.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function formatTick(t: number): string {
  return String(t).replace('.', ',');
}

function Geometry({ spec }: { spec: GeometryFigure }) {
  const coords = Object.values(spec.points);
  const circleExtents = (spec.circles ?? []).flatMap((c) => {
    const p = spec.points[c.center];
    return p
      ? ([
          [p[0] - c.radius, p[1] - c.radius],
          [p[0] + c.radius, p[1] + c.radius],
        ] as Array<[number, number]>)
      : [];
  });
  const [bx, by] = bounds([...coords, ...circleExtents], 0.14);
  // Zachowujemy proporcje: jednakowa skala na obu osiach, inaczej kąt prosty
  // przestałby wyglądać na prosty.
  const spanX = (bx?.[1] ?? 1) - (bx?.[0] ?? 0);
  const spanY = (by?.[1] ?? 1) - (by?.[0] ?? 0);
  const height = Math.max(160, Math.min(320, (W * spanY) / spanX));
  const scale = Math.min((W - 32) / spanX, (height - 32) / spanY);
  const cx = W / 2;
  const cy = height / 2;
  const midX = ((bx?.[0] ?? 0) + (bx?.[1] ?? 1)) / 2;
  const midY = ((by?.[0] ?? 0) + (by?.[1] ?? 1)) / 2;
  const px = (p: [number, number]): [number, number] => [cx + (p[0] - midX) * scale, cy - (p[1] - midY) * scale];
  const P = (name: string): [number, number] => px(spec.points[name] ?? [0, 0]);

  return (
    <svg className="fig__svg" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={spec.alt}>
      {(spec.polygons ?? []).map((pg, i) => (
        <polygon key={`pg${i}`} className="fig__polygon" points={pg.vertices.map((n) => P(n).join(',')).join(' ')} />
      ))}
      {(spec.circles ?? []).map((c, i) => {
        const [x, y] = P(c.center);
        return <circle key={`ci${i}`} className="fig__circle" cx={x} cy={y} r={c.radius * scale} />;
      })}
      {(spec.segments ?? []).map((s, i) => {
        const [x1, y1] = P(s.from);
        const [x2, y2] = P(s.to);
        return (
          <g key={`s${i}`}>
            <line className={s.dashed ? 'fig__segment fig__segment--dashed' : 'fig__segment'} x1={x1} y1={y1} x2={x2} y2={y2} />
            {s.label && (
              <text className="fig__segment-label" x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 6}>
                {s.label}
              </text>
            )}
          </g>
        );
      })}
      {(spec.angles ?? []).map((a, i) => {
        const at = P(a.at);
        const from = P(a.from);
        const to = P(a.to);
        return (
          <g key={`a${i}`}>
            <path className="fig__angle" d={a.right ? rightAngleMark(at, from, to, 12) : angleArc(at, from, to, 22)} />
            {a.label && (
              <text className="fig__angle-label" x={labelPos(at, from, to, 36)[0]} y={labelPos(at, from, to, 36)[1]} textAnchor="middle">
                {a.label}
              </text>
            )}
          </g>
        );
      })}
      {Object.entries(spec.points).map(([name]) => {
        const [x, y] = P(name);
        const [lx, ly] = outward([x, y], [cx, cy], 14);
        return (
          <g key={`p${name}`}>
            <circle className="fig__vertex" cx={x} cy={y} r={2.5} />
            {!spec.hidePointLabels && (
              <text className="fig__point-label" x={lx} y={ly + 4} textAnchor="middle">
                {name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Podpis kąta: na dwusiecznej, w odległości `r` od wierzchołka. */
function labelPos(at: [number, number], a: [number, number], b: [number, number], r: number): [number, number] {
  const ua = norm([a[0] - at[0], a[1] - at[1]]);
  const ub = norm([b[0] - at[0], b[1] - at[1]]);
  const bis = norm([ua[0] + ub[0], ua[1] + ub[1]]);
  return [at[0] + bis[0] * r, at[1] + bis[1] * r + 4];
}

/** Podpis punktu odsunięty od środka rysunku, żeby nie wchodził w figurę. */
function outward(p: [number, number], center: [number, number], d: number): [number, number] {
  const u = norm([p[0] - center[0], p[1] - center[1]]);
  return [p[0] + u[0] * d, p[1] + u[1] * d];
}

function norm(v: [number, number]): [number, number] {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}

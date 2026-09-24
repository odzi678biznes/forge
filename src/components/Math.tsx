import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderer matematyki (Blueprint sek. 9: "lokalny renderer matematyki").
 *
 * KaTeX jest zbundlowany razem z aplikacja - zadnych czcionek ani skryptow
 * z sieci, bo sek. 12 wymaga pelnej pracy offline.
 *
 * Tekst dzielimy na segmenty $...$; wszystko poza nimi trafia do DOM jako
 * zwykly tekst Reacta, wiec tresc zadania nie moze wstrzyknac HTML-a.
 */

interface Props {
  children: string;
  className?: string;
  /** Wzór wyświetlany (wyśrodkowany, pełnowymiarowe ułamki) - dla bloków wzorów w lekcji. */
  display?: boolean;
}

export function Math({ children, className, display = false }: Props) {
  const segments = useMemo(() => splitMath(children), [children]);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.code ? (
          <code key={i} className="inline-code">
            {seg.text}
          </code>
        ) : seg.math ? (
          <span
            key={i}
            // KaTeX zwraca wlasny, zaufany HTML; wejsciem jest tylko tresc zadania.
            dangerouslySetInnerHTML={{ __html: render(seg.text, display) }}
          />
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}

interface Segment {
  text: string;
  math: boolean;
  /** Kod w tekście: `nazwa_funkcji(t)` - pokazywany dosłownie. */
  code?: boolean;
}

export function splitMath(input: string): Segment[] {
  const out: Segment[] = [];
  let rest = input;

  while (rest.length > 0) {
    // Kod w odwrotnych apostrofach ma pierwszeństwo, jeśli zaczyna się przed wzorem.
    const tick = rest.indexOf('`');
    const dollar = rest.indexOf('$');
    if (tick !== -1 && (dollar === -1 || tick < dollar)) {
      const end = rest.indexOf('`', tick + 1);
      if (end !== -1) {
        if (tick > 0) out.push({ text: rest.slice(0, tick), math: false });
        out.push({ text: rest.slice(tick + 1, end), math: false, code: true });
        rest = rest.slice(end + 1);
        continue;
      }
    }
    const open = rest.indexOf('$');
    if (open === -1) {
      out.push({ text: rest, math: false });
      break;
    }
    const close = rest.indexOf('$', open + 1);
    if (close === -1) {
      // Niesparowany znak dolara - traktujemy reszte jako zwykly tekst.
      out.push({ text: rest, math: false });
      break;
    }
    if (open > 0) out.push({ text: rest.slice(0, open), math: false });
    out.push({ text: rest.slice(open + 1, close), math: true });
    rest = rest.slice(close + 1);
  }

  return out;
}

function render(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: display });
  } catch {
    // Blad skladni nie moze wywrocic areny - pokazujemy zrodlo.
    return escapeHtml(tex);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

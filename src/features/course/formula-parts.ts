/**
 * Dzieli wzór wyświetlany na części w miejscach szerokiego odstępu `\qquad`.
 *
 * Blok wzoru często zestawia dwa-trzy wzory obok siebie. Na szerokim ekranie
 * stoją w jednym rzędzie, a na telefonie każda część przechodzi do nowej linii
 * - zamiast przewijać wzór w poziomie. Dzielimy tylko na najwyższym poziomie
 * nawiasów klamrowych, żeby nie rozciąć `\text{...}` ani argumentu `\frac`.
 */
export function formulaParts(tex: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  const marker = '\\qquad';

  for (let i = 0; i < tex.length; i += 1) {
    const ch = tex[i];
    if (ch === '\\' && tex.startsWith(marker, i) && depth === 0) {
      // \qquad, a nie początek dłuższej komendy (np. \qquadx nie istnieje, ale bądźmy ostrożni).
      const next = tex[i + marker.length];
      if (next === undefined || !/[a-zA-Z]/.test(next)) {
        parts.push(tex.slice(start, i));
        i += marker.length - 1;
        start = i + 1;
        continue;
      }
    }
    if (ch === '\\') {
      // Znak po ukośniku jest dosłowny (np. \{ albo \}) - nie zmienia zagnieżdżenia.
      i += 1;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') depth = Math.max(0, depth - 1);
  }
  parts.push(tex.slice(start));

  return parts.map((s) => s.trim()).filter((s) => s !== '');
}

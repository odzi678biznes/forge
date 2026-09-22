import type { Skill } from '@/data/types';

/**
 * Uklad mapy kompetencji - Blueprint sek. 7.3.
 *
 * Kompetencje tworza graf zaleznosci wstepnych. Uklamy go warstwami: warstwa 0
 * to fundamenty bez warunkow wstepnych, kazda kolejna lezy pod swoimi
 * warunkami. Dzieki temu strzalka na mapie zawsze biegnie w dol - "to musisz
 * umiec wczesniej" jest czytelne bez legendy.
 *
 * Funkcja jest czysta i niezalezna od DOM, wiec da sie ja sprawdzic testem.
 */

export interface Placed {
  skill: Skill;
  /** Numer warstwy, 0 = fundament. */
  layer: number;
  /** Pozycja w obrebie warstwy. */
  column: number;
  /** Ile kompetencji liczy ta warstwa - potrzebne do wysrodkowania. */
  layerSize: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface MapLayout {
  placed: Placed[];
  edges: Edge[];
  layerCount: number;
}

export function layoutSkills(skills: Skill[]): MapLayout {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const depth = new Map<string, number>();

  /**
   * Glebokosc = 1 + najglebszy warunek wstepny.
   * `seen` chroni przed cyklem w danych: gdyby tresc zawierala zaleznosc
   * cykliczna, wolimy plaski uklad niz zawieszona aplikacje.
   */
  const depthOf = (id: string, seen: Set<string>): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    if (seen.has(id)) return 0;

    const skill = byId.get(id);
    if (!skill || skill.prerequisites.length === 0) {
      depth.set(id, 0);
      return 0;
    }

    seen.add(id);
    const d =
      1 +
      globalThis.Math.max(
        ...skill.prerequisites
          .filter((p) => byId.has(p))
          .map((p) => depthOf(p, seen)),
        -1,
      );
    seen.delete(id);

    depth.set(id, d);
    return d;
  };

  for (const s of skills) depthOf(s.id, new Set());

  const layers = new Map<number, Skill[]>();
  for (const s of skills) {
    const d = depth.get(s.id) ?? 0;
    const bucket = layers.get(d);
    if (bucket) bucket.push(s);
    else layers.set(d, [s]);
  }

  const placed: Placed[] = [];
  for (const [layer, members] of [...layers].sort((a, b) => a[0] - b[0])) {
    members.forEach((skill, column) => {
      placed.push({ skill, layer, column, layerSize: members.length });
    });
  }

  const edges: Edge[] = [];
  for (const s of skills) {
    for (const p of s.prerequisites) {
      // Krawedz do nieistniejacej kompetencji nie jest rysowana.
      if (byId.has(p)) edges.push({ from: p, to: s.id });
    }
  }

  return { placed, edges, layerCount: layers.size };
}

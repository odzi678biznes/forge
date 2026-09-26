/** „dziś”, „jutro”, „za 3 dni” — termin powtórki po ludzku. */
export function kiedy(termin: number, teraz = Date.now()): string {
  const dzien = (t: number) => {
    const d = new Date(t);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  const dni = Math.round((dzien(termin) - dzien(teraz)) / 86_400_000);
  if (dni <= 0) return 'dziś';
  if (dni === 1) return 'jutro';
  return `za ${dni} dni`;
}

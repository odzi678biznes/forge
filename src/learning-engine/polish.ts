/**
 * Odmiana rzeczownika po liczebniku: 1 próba, 2 próby, 5 prób, 22 próby,
 * 12 prób. Komunikaty z liczbami pojawiają się przed każdym usunięciem
 * danych, więc mają brzmieć jak zdanie, a nie jak wydruk z bazy.
 */
export type Forms = readonly [one: string, few: string, many: string];

export function plural(n: number, [one, few, many]: Forms): string {
  if (n === 1) return one;
  const tens = n % 100;
  const units = n % 10;
  return units >= 2 && units <= 4 && (tens < 12 || tens > 14) ? few : many;
}

export function count(n: number, forms: Forms): string {
  return `${n} ${plural(n, forms)}`;
}

export const MISSIONS: Forms = ['misja', 'misje', 'misji'];
export const ATTEMPTS: Forms = ['próba', 'próby', 'prób'];
export const SKILLS: Forms = ['kompetencja', 'kompetencje', 'kompetencji'];

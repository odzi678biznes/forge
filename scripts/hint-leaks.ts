/**
 * Wypisuje WSZYSTKIE podpowiedzi, które zdradzają wynik - ta sama reguła co
 * w content/validate.ts, ale bez zatrzymywania się na pierwszym błędzie.
 * Uruchomienie: npx vite-node scripts/hint-leaks.ts
 */
import { MATH_CORPUS } from '../content/math';
import { CS_CORPUS } from '../content/cs';
import { BIZ_CORPUS } from '../content/biz';
import { normalise, parseNumber } from '../src/learning-engine/grading';

const numbersIn = (text: string): number[] =>
  (
    text
      .replace(/\\[dt]?frac(\d)(\d)/g, ' $1 $2 ')
      .replace(/\^\{[^}]*\}|\^\d/g, ' ')
      .match(/-?\d+(?:\.\d+)?/g) ?? []
  ).map(Number);

let found = 0;
for (const q of [...MATH_CORPUS.questions, ...CS_CORPUS.questions, ...BIZ_CORPUS.questions]) {
  if (q.format !== 'numeric') continue;
  const expected = parseNumber(normalise(q.answer));
  const fromPrompt = new Set((q.prompt.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number));
  for (const h of q.hints.filter((x) => x.level <= 4)) {
    if (numbersIn(h.text).some((n) => n === expected && !fromPrompt.has(n))) {
      found += 1;
      console.log(`${q.id} / ${h.level}: ${h.text}`);
    }
  }
}
console.log(found === 0 ? 'Brak przecieków.' : `Przecieki: ${found}`);

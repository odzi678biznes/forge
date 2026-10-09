import type { ProgramSpec } from './types';

const number = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && Number.isInteger(x) && Math.abs(x) <= 1000;
export function validSpec(x: unknown): x is ProgramSpec {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  switch (p.type) {
    case 'fraction': return [p.a, p.b, p.c, p.d].every(number) && p.b !== 0 && p.d !== 0 && ['add', 'multiply'].includes(String(p.operation));
    case 'linear': return [p.a, p.b, p.c].every(number) && p.a !== 0;
    case 'percent': return [p.base, p.percent].every(number) && Number(p.base) > 0 && Number(p.percent) > 0 && Number(p.percent) <= 100;
    case 'quadratic': return [p.root1, p.root2].every(number);
    default: return false;
  }
}
function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function fraction(a: number, b: number): string {
  const d = gcd(a, b) || 1;
  const sign = b < 0 ? -1 : 1;
  return Math.abs(b / d) === 1 ? String(a / d * sign) : `${a / d * sign}/${Math.abs(b / d)}`;
}
export function verifySpec(p: ProgramSpec): { prompt: string; answer: string; solution: string; difficulty: number } {
  switch (p.type) {
    case 'fraction': {
      const answer = p.operation === 'add' ? fraction(p.a * p.d + p.c * p.b, p.b * p.d) : fraction(p.a * p.c, p.b * p.d);
      return { prompt: `Oblicz $\\frac{${p.a}}{${p.b}} ${p.operation === 'add' ? '+' : '\\cdot'} \\frac{${p.c}}{${p.d}}$. Zapisz kolejne kroki.`,
        answer, solution: p.operation === 'add' ? `Sprowadź do wspólnego mianownika: $\\frac{${p.a * p.d}+${p.c * p.b}}{${p.b * p.d}}$. Skróć ułamek. Wynik: ${answer}.`
          : `Pomnóż liczniki i mianowniki: $\\frac{${p.a * p.c}}{${p.b * p.d}}$. Skróć ułamek. Wynik: ${answer}.`, difficulty: 1 };
    }
    case 'linear': return { prompt: `Rozwiąż równanie $${p.a}x ${p.b < 0 ? '-' : '+'} ${Math.abs(p.b)} = ${p.c}$. Zapisz przekształcenia.`,
      answer: fraction(p.c - p.b, p.a), solution: `Odejmij ${p.b} od obu stron: $${p.a}x=${p.c - p.b}$. Podziel obie strony przez ${p.a}: $x=${fraction(p.c - p.b, p.a)}$.`, difficulty: 1 };
    case 'percent': return { prompt: `Oblicz ${p.percent}% liczby ${p.base}. Zapisz sposób obliczenia.`, answer: String(p.base * p.percent / 100),
      solution: `$${p.percent}\\%=\\frac{${p.percent}}{100}$. Mnożymy przez ${p.base}: $${p.base}\\cdot\\frac{${p.percent}}{100}=${p.base * p.percent / 100}$.`, difficulty: 1 };
    case 'quadratic': {
      const b = -(p.root1 + p.root2), c = p.root1 * p.root2;
      return { prompt: `Rozwiąż równanie $x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}=0$.`,
        answer: [...new Set([p.root1, p.root2])].sort((x, y) => x - y).join(', '),
        solution: `Rozłóż na czynniki: $(x-(${p.root1}))(x-(${p.root2}))=0$. Stąd $x=${p.root1}$ lub $x=${p.root2}$.`, difficulty: 3 };
    }
  }
}

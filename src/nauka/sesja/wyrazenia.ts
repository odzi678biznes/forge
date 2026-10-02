/**
 * Lokalne sprawdzanie wyrażeń algebraicznych — bez AI.
 *
 * Uczeń może zapisać tę samą odpowiedź na wiele sposobów: „m^2-16”,
 * „m²−16”, „(m−4)(m+4)”, „Δ = m^2 − 16”. Zamiast porównywać napisy,
 * liczymy wartość obu wyrażeń w kilku punktach — równe wielomiany (i ogólnie
 * równe funkcje wymierne) dają te same wartości.
 *
 * Parser jest celowo mały: liczby, jedna zmienna, + − · / ^, nawiasy,
 * mnożenie domyślne (2m, m(m+1), (m+1)(m−1)). Żadnego eval().
 */

type Wezel =
  | { t: 'liczba'; v: number }
  | { t: 'zmienna' }
  | { t: 'minus'; a: Wezel }
  | { t: 'op'; op: '+' | '-' | '*' | '/' | '^'; a: Wezel; b: Wezel };

/** Ujednolica zapis z telefonu: minusy, kropki mnożenia, potęgi, przecinek. */
export function normalizujWyrazenie(wpis: string): string {
  let s = wpis.trim();
  // „Δ = m^2 − 16”, „x1 + x2 = m + 2” — liczy się prawa strona.
  const rowna = s.lastIndexOf('=');
  if (rowna >= 0) s = s.slice(rowna + 1);
  return s
    .replace(/[−–—]/g, '-')
    .replace(/[·⋅×∙]/g, '*')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/:/g, '/')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function tokeny(s: string, zmienna: string): string[] | null {
  const wynik: string[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i] as string;
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j] as string)) j++;
      const liczba = s.slice(i, j);
      if (!/^\d+(\.\d+)?$|^\.\d+$/.test(liczba)) return null;
      wynik.push(liczba);
      i = j;
    } else if (c === zmienna) {
      wynik.push('#');
      i++;
    } else if ('+-*/^()'.includes(c)) {
      wynik.push(c);
      i++;
    } else {
      return null;
    }
  }
  // Mnożenie domyślne: 2m, 2(…), m(…), )(, )m, )2, m2 (rzadkie, ale jednoznaczne).
  const pelne: string[] = [];
  const konczy = (t: string) => t === ')' || t === '#' || /^[\d.]/.test(t);
  const zaczyna = (t: string) => t === '(' || t === '#' || /^[\d.]/.test(t);
  for (const t of wynik) {
    const poprzedni = pelne[pelne.length - 1];
    if (poprzedni !== undefined && konczy(poprzedni) && zaczyna(t) && !(/^[\d.]/.test(poprzedni) && /^[\d.]/.test(t))) {
      pelne.push('*');
    }
    pelne.push(t);
  }
  return pelne;
}

/** Parser rekurencyjny: suma → iloczyn → unarny minus → potęga → atom. */
function parsuj(t: string[]): Wezel | null {
  let p = 0;
  const zobacz = () => t[p];
  function suma(): Wezel | null {
    let a = iloczyn();
    while (a && (zobacz() === '+' || zobacz() === '-')) {
      const op = t[p++] as '+' | '-';
      const b = iloczyn();
      if (!b) return null;
      a = { t: 'op', op, a, b };
    }
    return a;
  }
  function iloczyn(): Wezel | null {
    let a = unarny();
    while (a && (zobacz() === '*' || zobacz() === '/')) {
      const op = t[p++] as '*' | '/';
      const b = unarny();
      if (!b) return null;
      a = { t: 'op', op, a, b };
    }
    return a;
  }
  function unarny(): Wezel | null {
    if (zobacz() === '-') {
      p++;
      const a = unarny();
      return a ? { t: 'minus', a } : null;
    }
    if (zobacz() === '+') {
      p++;
      return unarny();
    }
    return potega();
  }
  function potega(): Wezel | null {
    const a = atom();
    if (a && zobacz() === '^') {
      p++;
      // Prawostronnie łączna; wykładnik może mieć znak: 2^-1.
      const b = unarny();
      return b ? { t: 'op', op: '^', a, b } : null;
    }
    return a;
  }
  function atom(): Wezel | null {
    const x = zobacz();
    if (x === undefined) return null;
    if (x === '(') {
      p++;
      const a = suma();
      if (zobacz() !== ')') return null;
      p++;
      return a;
    }
    if (x === '#') {
      p++;
      return { t: 'zmienna' };
    }
    if (/^[\d.]/.test(x)) {
      p++;
      return { t: 'liczba', v: Number(x) };
    }
    return null;
  }
  const w = suma();
  return w && p === t.length ? w : null;
}

function licz(w: Wezel, x: number): number {
  switch (w.t) {
    case 'liczba':
      return w.v;
    case 'zmienna':
      return x;
    case 'minus':
      return -licz(w.a, x);
    case 'op': {
      const a = licz(w.a, x);
      const b = licz(w.b, x);
      if (w.op === '+') return a + b;
      if (w.op === '-') return a - b;
      if (w.op === '*') return a * b;
      if (w.op === '/') return a / b;
      return a ** b;
    }
  }
}

/** Funkcja jednej zmiennej albo null, gdy zapis jest niepoprawny. */
export function wyrazenie(wpis: string, zmienna = 'm'): ((x: number) => number) | null {
  const s = normalizujWyrazenie(wpis);
  if (s === '') return null;
  const t = tokeny(s, zmienna.toLowerCase());
  if (!t) return null;
  const w = parsuj(t);
  return w ? (x: number) => licz(w, x) : null;
}

/** Punkty „nieładne”, żeby przypadkowe zgodności (np. w 0 albo 1) nic nie znaczyły. */
const PUNKTY = [-3.7, -1.3, -0.45, 0.6, 1.9, 2.75, 5.2];

/** Czy dwa wyrażenia są równe jako funkcje (z tolerancją na błąd zaokrągleń). */
export function rownowazne(a: string, b: string, zmienna = 'm'): boolean {
  const f = wyrazenie(a, zmienna);
  const g = wyrazenie(b, zmienna);
  if (!f || !g) return false;
  let porownane = 0;
  for (const x of PUNKTY) {
    const u = f(x);
    const v = g(x);
    if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
    if (Math.abs(u - v) > 1e-7 * Math.max(1, Math.abs(u), Math.abs(v))) return false;
    porownane++;
  }
  return porownane >= 4;
}

/** Czy wpis da się w ogóle odczytać — do komunikatu „sprawdź zapis”. */
export function czytelne(wpis: string, zmienna = 'm'): boolean {
  return wyrazenie(wpis, zmienna) !== null;
}

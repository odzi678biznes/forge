import type { Oczekiwane } from './typy';

/**
 * Sprawdzanie odpowiedzi jednoznacznymi regułami — bez AI.
 *
 * AI może tłumaczyć, ale o tym, czy odpowiedź jest poprawna, decyduje ten
 * moduł i oficjalny klucz CKE. Dla odpowiedzi otwartych (biznes) reguła daje
 * tylko wskazówkę — ostatnie słowo ma samoocena według kryteriów z klucza.
 */

/** Porządki zapisu: przecinek dziesiętny, minusy typograficzne, spacje, znak mnożenia. */
export function normalizuj(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[·⋅×*]/g, '*')
    .replace(/\s+/g, '')
    .replace(/,/g, '.');
}

/**
 * Wartość liczbowa wpisu: liczba („0.16”), ułamek („4/25”, „-3/2”),
 * potęga („2^16”, „2^-4”, „2^(-4)”). Zwraca null, gdy wpis nie jest liczbą.
 */
export function wartosc(wpis: string): number | null {
  const s = normalizuj(wpis);
  if (s === '') return null;
  const potega = /^(-?\d+(?:\.\d+)?)\^\(?(-?\d+)\)?$/.exec(s);
  if (potega) return Number(potega[1]) ** Number(potega[2]);
  const ulamek = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(s);
  if (ulamek) {
    const m = Number(ulamek[2]);
    return m === 0 ? null : Number(ulamek[1]) / m;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s);
  return null;
}

const bliskie = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

export function sprawdzWpis(wpis: string, oczekiwane: Oczekiwane): boolean {
  switch (oczekiwane.typ) {
    case 'liczba': {
      const v = wartosc(wpis);
      return v !== null && bliskie(v, oczekiwane.wartosc);
    }
    case 'potega': {
      const s = normalizuj(wpis);
      const m = /^(-?\d+)\^\(?(-?\d+)\)?$/.exec(s);
      if (m) return Number(m[1]) === oczekiwane.podstawa && Number(m[2]) === oczekiwane.wykladnik;
      // Sama liczba też jest poprawna, jeśli ma tę samą wartość (np. 65536).
      const v = wartosc(s);
      return v !== null && bliskie(v, oczekiwane.podstawa ** oczekiwane.wykladnik);
    }
    case 'tekst': {
      const s = normalizuj(wpis);
      return oczekiwane.warianty.some((w) => normalizuj(w) === s);
    }
  }
}

/** Wynik kodu: porównanie po ujednoliceniu białych znaków na końcach linii. */
export function sprawdzWynikKodu(wpis: string, warianty: string[]): boolean {
  const norm = (t: string) =>
    t
      .replace(/\r/g, '')
      .split('\n')
      .map((l) => l.trim().replace(/\s+/g, ' '))
      .filter((l) => l !== '')
      .join('\n')
      .toLowerCase();
  return warianty.some((w) => norm(w) === norm(wpis));
}

/** Kolejność: dokładnie ta sama sekwencja indeksów elementów. */
export function sprawdzKolejnosc(ulozone: number[]): boolean {
  return ulozone.every((v, i) => v === i);
}

/** Usuwa polskie znaki — słowa kluczowe mają pasować także do „odwaga”/„odwage”. */
function bezOgonkow(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l');
}

export interface OcenaOtwarta {
  /** Dla każdego kryterium: czy w tekście jest coś, co do niego pasuje. */
  spelnione: boolean[];
}

/**
 * Orientacyjna ocena odpowiedzi otwartej: każde kryterium z klucza ma listę
 * rdzeni słów. To NIE jest ocena egzaminacyjna — uczeń porównuje swoją
 * odpowiedź z wzorcowymi i sam decyduje (samoocena), a AI może pomóc.
 */
export function ocenOtwarta(tekst: string, slowa: string[][]): OcenaOtwarta {
  const t = bezOgonkow(tekst);
  return { spelnione: slowa.map((grupa) => grupa.some((rdzen) => t.includes(bezOgonkow(rdzen)))) };
}

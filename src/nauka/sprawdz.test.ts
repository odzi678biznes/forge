import { describe, expect, it } from 'vitest';
import { ocenOtwarta, sprawdzKolejnosc, sprawdzWpis, sprawdzWynikKodu, wartosc } from './sprawdz';

describe('sprawdzanie odpowiedzi regułami', () => {
  it('ułamek, liczba dziesiętna z przecinkiem i kropką mają tę samą wartość', () => {
    for (const w of ['4/25', '0,16', '0.16', ' 4 / 25 ']) {
      expect(sprawdzWpis(w, { typ: 'liczba', wartosc: 4 / 25 }), w).toBe(true);
    }
    expect(sprawdzWpis('25/4', { typ: 'liczba', wartosc: 4 / 25 })).toBe(false);
  });

  it('minus typograficzny i potęga w nawiasie', () => {
    expect(wartosc('−3/2')).toBe(-1.5);
    expect(wartosc('2^(-1)')).toBe(0.5);
    expect(wartosc('abc')).toBeNull();
    expect(wartosc('1/0')).toBeNull();
  });

  it('potęgę można wpisać jako potęgę albo jako liczbę', () => {
    const oczek = { typ: 'potega', podstawa: 2, wykladnik: 16 } as const;
    expect(sprawdzWpis('2^16', oczek)).toBe(true);
    expect(sprawdzWpis('65536', oczek)).toBe(true);
    expect(sprawdzWpis('4^8', oczek)).toBe(false);
    expect(sprawdzWpis('2^12', oczek)).toBe(false);
  });

  it('tekst: bez względu na wielkość liter i spacje', () => {
    expect(sprawdzWpis(' 3 4 ', { typ: 'tekst', warianty: ['3 4'] })).toBe(true);
    expect(sprawdzWpis('4 3', { typ: 'tekst', warianty: ['3 4'] })).toBe(false);
    expect(sprawdzWpis('TRUE', { typ: 'tekst', warianty: ['true'] })).toBe(true);
  });

  it('wynik kodu: końcowe spacje i puste linie nie mają znaczenia', () => {
    expect(sprawdzWynikKodu('2\n54210  \n', ['2\n54210'])).toBe(true);
    expect(sprawdzWynikKodu('54210.2', ['54210'])).toBe(false);
  });

  it('kolejność', () => {
    expect(sprawdzKolejnosc([0, 1, 2, 3])).toBe(true);
    expect(sprawdzKolejnosc([1, 0, 2, 3])).toBe(false);
  });

  it('odpowiedź otwarta: kryteria z rdzeni słów, bez polskich znaków', () => {
    const slowa = [['odwag', 'ryzyk', 'ambic'], ['wyjech', 'wyjazd', 'wyjeżdż']];
    expect(ocenOtwarta('Odwaga – zdecydowała się wyjechać mimo kosztów', slowa).spelnione).toEqual([true, true]);
    expect(ocenOtwarta('Lubi sport', slowa).spelnione).toEqual([false, false]);
  });
});

import { describe, expect, it } from 'vitest';
import { LEKCJE } from './lekcje';
import { WARIANTY, pokazWartosc } from './warianty';
import { sprawdzWpis, sprawdzWynikKodu } from './sprawdz';

describe('wybór zamiast liczenia w głowie', () => {
  const karty = LEKCJE.flatMap((l) => l.karty).filter((k) => k.rodzaj === 'wpis' || k.rodzaj === 'kod');

  it('każda karta z wpisywaniem ma warianty do wyboru', () => {
    for (const k of karty) expect(WARIANTY[k.id], k.id).toBeDefined();
    const znane = new Set(karty.map((k) => k.id));
    for (const id of Object.keys(WARIANTY)) expect(znane.has(id), `nieużywane warianty: ${id}`).toBe(true);
  });

  it('dokładnie jeden wariant jest poprawny według tych samych reguł co dawniej', () => {
    for (const k of karty) {
      const warianty = WARIANTY[k.id] ?? [];
      const dobre = warianty.filter((v) =>
        k.rodzaj === 'wpis' ? sprawdzWpis(v.wartosc, k.oczekiwane) : k.rodzaj === 'kod' ? sprawdzWynikKodu(v.wartosc, k.wynik) : false,
      );
      expect(dobre.length, k.id).toBe(1);
      expect(new Set(warianty.map((v) => v.wartosc)).size, `${k.id}: powtórzone warianty`).toBe(warianty.length);
      for (const v of warianty) {
        if (v !== dobre[0]) expect(v.dlaczego, `${k.id}: zły wariant ${v.wartosc} bez przyczyny`).toBeTruthy();
      }
    }
  });

  it('wartości wyświetlają się jako wzory', () => {
    expect(pokazWartosc('1/2')).toBe('$\\dfrac{1}{2}$');
    expect(pokazWartosc('-25/4')).toBe('$-\\dfrac{25}{4}$');
    expect(pokazWartosc('5^25')).toBe('$5^{25}$');
    expect(pokazWartosc('-32')).toBe('$-32$');
    expect(pokazWartosc('True\nFalse')).toBe('True\nFalse');
  });
});

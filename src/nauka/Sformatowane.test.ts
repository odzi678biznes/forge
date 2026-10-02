import { describe, expect, it } from 'vitest';
import { naBloki } from './Sformatowane';

describe('formatowanie odpowiedzi nauczyciela', () => {
  it('rozpoznaje akapity, listy i wzory w osobnych liniach', () => {
    const b = naBloki('Najpierw **delta**.\n\n1. Licz $b^2$\n2. Odejmij $4ac$\n\n$$\Delta = b^2 - 4ac$$\n- jeden\n- dwa\nKoniec.');
    expect(b.map((x) => x.rodzaj)).toEqual(['akapit', 'lista', 'wzor', 'lista', 'akapit']);
    expect(b[1]).toEqual({ rodzaj: 'lista', numerowana: true, punkty: ['Licz $b^2$', 'Odejmij $4ac$'] });
    expect(b[2]).toEqual({ rodzaj: 'wzor', tekst: '\Delta = b^2 - 4ac' });
  });

  it('składa wzór rozpisany na kilka linii i dzieli zlepione zdania', () => {
    expect(naBloki('$$\na+b\n=c$$')).toEqual([{ rodzaj: 'wzor', tekst: 'a+b =c' }]);
    expect(naBloki('Raz.\nDwa.').length).toBe(2);
  });
});

import { describe, expect, it } from 'vitest';
import { lekcja } from './lekcje';
import { biezaca, nowyStan, odlozonaTeraz, odpowiedz, PRZERWA_MS, stanLekcji, zastosujTempo, type StanNauki } from './silnik';
import { czytajDecyzje, decyzjaRegul, raportKorepetytora } from './korepetytor';
import type { RaportKorepetytora } from './nauczyciel-kontekst';

const L = lekcja('num-order')!;
const T0 = Date.UTC(2026, 9, 2, 10);

function odpowiadaj(stan: StanNauki, wyniki: boolean[], czasMs?: number): { stan: StanNauki; odlozona: boolean } {
  let odlozona = false;
  for (const w of wyniki) {
    const k = biezaca(stan, L)!;
    const r = odpowiedz(stan, L, k.id, w, T0, czasMs);
    stan = r.stan;
    odlozona ||= r.zdarzenie.odlozona === true;
  }
  return { stan, odlozona };
}

describe('nie męczymy po serii błędów', () => {
  it('trzy błędy z rzędu odkładają lekcję do jutra', () => {
    const { stan, odlozona } = odpowiadaj(nowyStan(), [false, false, false]);
    expect(odlozona).toBe(true);
    expect(odlozonaTeraz(stan, L.skillId, T0 + 60_000)).toBe(true);
    expect(odlozonaTeraz(stan, L.skillId, T0 + PRZERWA_MS)).toBe(false);
    expect(stanLekcji(stan, L.skillId).samodzielnosc).toBe(0);
  });

  it('dobra odpowiedź przerywa serię błędów', () => {
    const { odlozona } = odpowiadaj(nowyStan(), [false, true, false, false]);
    expect(odlozona).toBe(false);
  });
});

describe('czas odpowiedzi', () => {
  it('szybkie poprawne odpowiedzi przyspieszają wcześniej niż wolne', () => {
    const szybko = odpowiadaj(nowyStan(), [true, true], 8_000).stan;
    const wolno = odpowiadaj(nowyStan(), [true, true], 60_000).stan;
    expect(stanLekcji(szybko, L.skillId).samodzielnosc).toBe(1);
    expect(stanLekcji(wolno, L.skillId).samodzielnosc).toBe(0);
  });

  it('przerwa dłuższa niż 3 minuty nie jest zapisywana jako czas', () => {
    const s = odpowiadaj(nowyStan(), [true], 10 * 60_000).stan;
    expect(Object.values(stanLekcji(s, L.skillId).wyniki)[0]?.czas).toBeUndefined();
    const r = raportKorepetytora(s, L, 'Matematyka');
    expect(r.odpowiedzi[0]?.czasS).toBeNull();
  });
});

describe('korepetytor', () => {
  const raport = (trafienia: boolean[], czasS: number | null = 15): RaportKorepetytora => ({
    przedmiot: 'Matematyka',
    lekcja: 'x',
    samodzielnosc: 0,
    odpowiedzi: trafienia.map((t) => ({ krok: 'k', etap: 'fragment', poprawnaZaPierwszym: t, proby: t ? 1 : 2, czasS })),
  });

  it('reguły: pewnie i szybko → trudniej, dużo błędów → łatwiej', () => {
    expect(decyzjaRegul(raport([true, true, true, true]), T0).tempo).toBe('trudniej');
    expect(decyzjaRegul(raport([true, true, true, true], 90), T0).tempo).toBe('tak-samo');
    expect(decyzjaRegul(raport([false, true, false, false]), T0).tempo).toBe('latwiej');
    expect(decyzjaRegul(raport([true]), T0).tempo).toBe('tak-samo');
  });

  it('przyjmuje tylko jedną z trzech decyzji od AI', () => {
    expect(czytajDecyzje('Oto: {"tempo":"trudniej","komentarz":"Brawo."}', T0)).toMatchObject({ tempo: 'trudniej', komentarz: 'Brawo.', zrodlo: 'ai' });
    expect(czytajDecyzje('{"tempo":"skok o 3 poziomy"}', T0)).toBeNull();
    expect(czytajDecyzje('bez JSON-a', T0)).toBeNull();
  });

  it('decyzja zmienia samodzielność bieżącej lekcji i start następnych', () => {
    const s = odpowiadaj(nowyStan(), [true]).stan;
    const trudniej = zastosujTempo(s, L, { tempo: 'trudniej', komentarz: '', zrodlo: 'reguly', kiedy: T0 });
    expect(stanLekcji(trudniej, L.skillId).samodzielnosc).toBe(1);
    expect(stanLekcji(trudniej, 'inna-lekcja').samodzielnosc).toBe(1);
    const latwiej = zastosujTempo(trudniej, L, { tempo: 'latwiej', komentarz: '', zrodlo: 'reguly', kiedy: T0 });
    expect(stanLekcji(latwiej, L.skillId).samodzielnosc).toBe(0);
    expect(stanLekcji(latwiej, 'inna-lekcja').samodzielnosc).toBe(0);
  });
});

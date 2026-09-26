import { describe, expect, it } from 'vitest';
import { LEKCJE, karta, lekcja } from './lekcje';
import { zadanieCke } from './zadania-cke';
import {
  biezaca,
  biezacaPowtorka,
  nowyStan,
  odpowiedz,
  odpowiedzPowtorka,
  pomin,
  postep,
  powtorkaNaTeraz,
  PRZERWA_MS,
  terminPowtorki,
  type StanNauki,
} from './silnik';

const L = lekcja('num-order')!;
const T0 = Date.UTC(2026, 8, 26, 10);

/** Odpowiada na kolejne karty serii tak, jak każe `dobrze`. */
function przejdz(stan: StanNauki, dobrze: (id: string) => boolean, teraz = T0): StanNauki {
  for (let i = 0; i < 40; i++) {
    const k = biezaca(stan, L);
    if (!k) return stan;
    stan = odpowiedz(stan, L, k.id, dobrze(k.id), teraz).stan;
  }
  throw new Error('seria się nie kończy');
}

describe('treść prototypu', () => {
  it('każda seria prowadzi do zadania CKE, a karty wskazują istniejące zadania', () => {
    for (const l of LEKCJE) {
      expect(zadanieCke(l.zadanieId), l.skillId).toBeDefined();
      const ostatnie = l.seria.map((id) => karta(l, id)).filter((k) => k.etap === 'zadanie');
      expect(ostatnie.length, l.skillId).toBe(1);
      for (const k of l.karty) {
        if (k.zadanieId === null) expect(k.etap, k.id).toBe('pomocnicze');
        else expect(zadanieCke(k.zadanieId), k.id).toBeDefined();
        if (k.latwiejsza) expect(() => karta(l, k.latwiejsza!), k.id).not.toThrow();
      }
      for (const id of [...l.seria, ...l.powtorka]) expect(() => karta(l, id)).not.toThrow();
    }
  });

  it('powtórki wracają przez INNE zadanie CKE niż seria', () => {
    for (const l of LEKCJE) {
      const inne = l.powtorka.map((id) => karta(l, id).zadanieId);
      expect(inne.some((z) => z !== l.zadanieId), l.skillId).toBe(true);
    }
  });

  it('odpowiedzi ABCD w kartach zgadzają się z kluczem CKE', () => {
    for (const l of LEKCJE) {
      for (const k of l.karty) {
        if (k.rodzaj !== 'zadanie' || k.koniec.typ !== 'abcd' || !k.zadanieId) continue;
        const z = zadanieCke(k.zadanieId)!;
        expect('ABCD'[k.koniec.poprawna], k.id).toBe(z.oficjalnaOdpowiedz);
      }
    }
  });
});

describe('silnik feedu', () => {
  it('po błędzie daje łatwiejszy krok tego samego zadania, potem wraca do kroku', () => {
    let stan = nowyStan();
    stan = odpowiedz(stan, L, 'm1-polecenie', true, T0).stan;
    const r = odpowiedz(stan, L, 'm1-kolejnosc', false, T0);
    expect(r.zdarzenie.komunikat).toMatch(/Wracamy o krok/);
    expect(biezaca(r.stan, L)?.id).toBe('m1-kolejnosc-l');
    const po = odpowiedz(r.stan, L, 'm1-kolejnosc-l', true, T0).stan;
    expect(biezaca(po, L)?.id).toBe('m1-kolejnosc');
    // Po udanym powtórzeniu seria idzie dalej — krok nie wraca trzeci raz.
    const dalej = odpowiedz(po, L, 'm1-kolejnosc', true, T0).stan;
    expect(biezaca(dalej, L)?.id).toBe('m1-potega');
    // To samo po drugiej nieudanej próbie powtórzonego kroku.
    const zle = odpowiedz(po, L, 'm1-kolejnosc', false, T0).stan;
    expect(biezaca(zle, L)?.id).toBe('m1-potega');
    expect(karta(L, 'm1-kolejnosc-l').zadanieId).toBe(L.zadanieId);
  });

  it('pominięcie nie zwiększa postępu', () => {
    let stan = nowyStan();
    stan = pomin(stan, L, 'm1-polecenie');
    expect(biezaca(stan, L)?.id).toBe('m1-kolejnosc');
    expect(postep(stan, L).zrobione).toBe(0);
  });

  it('po serii poprawnych odpowiedzi przyspiesza (pomija rusztowanie)', () => {
    let stan = nowyStan();
    const r3 = ['m1-polecenie', 'm1-kolejnosc', 'm1-potega'].reduce(
      (s, id) => odpowiedz(s, L, id, true, T0).stan,
      stan,
    );
    stan = r3;
    // Po trzech dobrych: rusztowanie (m1-odwrotnosc) będzie pominięte.
    stan = odpowiedz(stan, L, 'm1-blad', true, T0).stan;
    stan = odpowiedz(stan, L, 'm1-nawias', true, T0).stan;
    expect(biezaca(stan, L)?.id).not.toBe('m1-odwrotnosc');
  });

  it('koniec serii planuje powtórkę; utrwalenie liczy dopiero udana powtórka po przerwie', () => {
    let stan = przejdz(nowyStan(), () => true);
    expect(postep(stan, L).status).toBe('przerobiona');
    const termin = terminPowtorki(stan, L.skillId)!;
    expect(termin).toBeGreaterThan(T0);
    expect(powtorkaNaTeraz(stan, L.skillId, T0)).toBe(false);

    const pozniej = Math.max(termin, T0 + PRZERWA_MS);
    expect(powtorkaNaTeraz(stan, L.skillId, pozniej)).toBe(true);
    for (let i = 0; i < 10; i++) {
      const k = biezacaPowtorka(stan, L);
      if (!k) break;
      const r = odpowiedzPowtorka(stan, L, k.id, true, pozniej);
      stan = r.stan;
      if (r.zdarzenie.koniecSerii) break;
    }
    expect(postep(stan, L).utrwalenie).toBe(1);
    expect(terminPowtorki(stan, L.skillId)!).toBeGreaterThan(pozniej);
  });

  it('dwie nieudane próby bez łatwiejszego kroku: idziemy dalej bez punktu', () => {
    let stan = nowyStan();
    stan = odpowiedz(stan, L, 'm1-polecenie', false, T0).stan;
    expect(biezaca(stan, L)?.id).toBe('m1-polecenie');
    stan = odpowiedz(stan, L, 'm1-polecenie', false, T0).stan;
    expect(biezaca(stan, L)?.id).toBe('m1-kolejnosc');
    expect(stan.lekcje[L.skillId]?.wyniki['m1-polecenie']?.pierwsza).toBe(false);
  });
});

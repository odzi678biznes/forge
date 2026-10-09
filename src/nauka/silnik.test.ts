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
  kartyTreningu,
  zapiszTrening,
  wybierzTrening,
  type StanNauki,
} from './silnik';
import { spojnyPostep } from './spojny-postep';
import { emptySkillState, MasteryLevel } from '@/data/types';

const L = lekcja('num-order')!;
const T0 = Date.UTC(2026, 8, 26, 10);

it('feed zasila postęp kursu i wybór następnej lekcji bez zmiany zapisu starego silnika', () => {
  const stan = przejdz(nowyStan(), () => true);
  const wspolny = spojnyPostep(stan, new Map(), []);
  expect(wspolny.lessons).toContainEqual({ skillId: L.skillId, completedAt: T0 });
  expect(wspolny.states.get(L.skillId)?.level).toBe(MasteryLevel.Independent);
});

it('trening rotuje karty i nie zmienia harmonogramu FSRS', () => {
  const stan = przejdz(nowyStan(), () => true);
  const termin = terminPowtorki(stan, L.skillId);
  const pierwsza = kartyTreningu(stan, L, T0)[0]!;
  const poKarcie = zapiszTrening(stan, pierwsza, T0);
  expect(kartyTreningu(poKarcie, L, T0)[0]).not.toBe(pierwsza);
  expect(kartyTreningu(poKarcie, L, T0)).not.toContain(pierwsza);
  expect(terminPowtorki(poKarcie, L.skillId)).toBe(termin);
  expect(wybierzTrening(poKarcie, [L], T0)?.skillId).toBe(L.skillId);
});

/** Odpowiada na kolejne karty serii tak, jak każe `dobrze`. */
function przejdz(stan: StanNauki, dobrze: (id: string) => boolean, teraz = T0, assisted: (id: string) => boolean = () => false): StanNauki {
  for (let i = 0; i < 40; i++) {
    const k = biezaca(stan, L);
    if (!k) return stan;
    stan = odpowiedz(stan, L, k.id, dobrze(k.id), teraz, undefined, assisted(k.id)).stan;
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

describe('rzetelna nauka z pomocą nauczyciela', () => {
  function powtorz(stan: StanNauki, teraz: number, assisted: (id: string, index: number) => boolean = () => false) {
    for (let i = 0; i < 40; i++) {
      const k = biezacaPowtorka(stan, L);
      if (!k) throw new Error('brak oczekiwanej karty powtórki');
      const result = odpowiedzPowtorka(stan, L, k.id, true, teraz, assisted(k.id, i));
      // Simulate closing/reopening between cards: metadata must survive storage.
      stan = JSON.parse(JSON.stringify(result.stan)) as StanNauki;
      if (result.zdarzenie.koniecSerii) return stan;
    }
    throw new Error('powtórka się nie kończy');
  }

  it('pomoc zalicza poprawny krok i pozwala iść dalej, ale przerywa szybką serię', () => {
    const first = odpowiedz(nowyStan(), L, 'm1-polecenie', true, T0, 1000).stan;
    expect(first.lekcje[L.skillId]?.seria).toBe(2);
    const before = JSON.stringify(first);
    const result = odpowiedz(first, L, 'm1-kolejnosc', true, T0, 1000, true);
    const lesson = result.stan.lekcje[L.skillId]!;
    expect(lesson.wyniki['m1-kolejnosc']).toMatchObject({ pierwsza: true, zaliczona: true, wspomagana: true });
    expect(lesson.seria).toBe(0);
    expect(lesson.samodzielnosc).toBe(0);
    expect(biezaca(result.stan, L)?.id).toBe('m1-potega');
    expect(postep(result.stan, L).zrobione).toBe(2);
    expect(result.zdarzenie.komunikat ?? '').not.toMatch(/pomijam|od razu/);
    expect(JSON.stringify(first)).toBe(before);
  });

  it('pomoc pozostaje przy kroku po błędzie, ponowieniu i serializacji', () => {
    let state = odpowiedz(nowyStan(), L, 'm1-polecenie', false, T0, 1000, true).stan;
    state = JSON.parse(JSON.stringify(state)) as StanNauki;
    state = odpowiedz(state, L, 'm1-polecenie', true, T0, 1000).stan;
    expect(state.lekcje[L.skillId]?.wyniki['m1-polecenie']).toMatchObject({ pierwsza: false, zaliczona: true, wspomagana: true, proby: 2 });
    expect(state.lekcje[L.skillId]?.seria).toBe(0);
  });

  it('pełna seria z pomocą daje Assisted i krótsze FSRS, bez kasowania ukończenia', () => {
    const aided = przejdz(nowyStan(), () => true, T0, () => true);
    const independent = przejdz(nowyStan(), () => true);
    expect(aided.lekcje[L.skillId]?.ukonczona).toBe(T0);
    expect(aided.lekcje[L.skillId]?.samodzielnosc).toBe(0);
    expect(postep(aided, L).zrobione).toBe(L.seria.length);
    expect(spojnyPostep(aided, new Map(), []).states.get(L.skillId)?.level).toBe(MasteryLevel.Assisted);
    expect(spojnyPostep(aided, new Map(), []).lessons).toContainEqual({ skillId: L.skillId, completedAt: T0 });
    expect(Number(aided.powtorki[L.skillId]?.fsrs.stability)).toBeLessThan(Number(independent.powtorki[L.skillId]?.fsrs.stability));
    expect(aided.powtorki[L.skillId]?.udanePoPrzerwie).toBe(0);
  });

  it('pomoc choćby w jednym wcześniejszym kroku nie znika przy końcowej odpowiedzi', () => {
    const aided = przejdz(nowyStan(), () => true, T0, id => id === 'm1-polecenie');
    expect(spojnyPostep(aided, new Map(), []).states.get(L.skillId)?.level).toBe(MasteryLevel.Assisted);
  });

  it('pomoc w pierwszej karcie powtórki obniża ocenę całej sesji i nie nabija utrwalenia', () => {
    const original = przejdz(nowyStan(), () => true);
    const later = Math.max(terminPowtorki(original, L.skillId)!, T0 + PRZERWA_MS);
    const assisted = powtorz(original, later, (_id, i) => i === 0);
    const independent = powtorz(original, later);
    expect(assisted.powtorki[L.skillId]?.udanePoPrzerwie).toBe(0);
    expect(independent.powtorki[L.skillId]?.udanePoPrzerwie).toBe(1);
    expect(Number(assisted.powtorki[L.skillId]?.fsrs.stability)).toBeLessThan(Number(independent.powtorki[L.skillId]?.fsrs.stability));
    expect(assisted.powtorki[L.skillId]?.sesja).toBeNull();
  });

  it('późniejsza samodzielna powtórka pozwala awansować po nauce z pomocą', () => {
    const aided = przejdz(nowyStan(), () => true, T0, () => true);
    const later = Math.max(terminPowtorki(aided, L.skillId)!, T0 + PRZERWA_MS);
    const afterReview = powtorz(aided, later);
    expect(spojnyPostep(afterReview, new Map(), []).states.get(L.skillId)?.level).toBe(MasteryLevel.Independent);
    const laterAgain = Math.max(terminPowtorki(afterReview, L.skillId)!, later + PRZERWA_MS);
    const retained = powtorz(afterReview, laterAgain);
    expect(spojnyPostep(retained, new Map(), []).states.get(L.skillId)?.level).toBe(MasteryLevel.Retained);
  });

  it('zachowuje wcześniejsze opanowanie i nie przepisuje historycznych wyników', () => {
    const historical = przejdz(nowyStan(), () => true);
    const historyBefore = JSON.stringify(historical);
    expect(spojnyPostep(historical, new Map(), []).states.get(L.skillId)?.level).toBe(MasteryLevel.Independent);
    expect(JSON.stringify(historical)).toBe(historyBefore);
    const aided = przejdz(nowyStan(), () => true, T0, () => true);
    const previous = { ...emptySkillState(L.skillId), level: MasteryLevel.Retained, independentStreak: 5 };
    const originalMap = new Map([[L.skillId, previous]]);
    expect(spojnyPostep(aided, originalMap, []).states.get(L.skillId)).toBe(previous);
    expect(originalMap.get(L.skillId)).toBe(previous);
    // Asking for help after a previously completed independent card doesn't erase it.
    const repeated = odpowiedz(historical, L, 'm1-polecenie', true, T0, 1000, true).stan;
    expect(repeated.lekcje[L.skillId]?.wyniki['m1-polecenie']?.wspomagana).toBeUndefined();
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

import { describe, expect, it } from 'vitest';
import { MasteryLevel, emptySkillState } from '@/data/types';
import { MATH_CORPUS } from '@content/math/index';
import { BLEDY } from './bledy';
import { ocenWpis, ocenWybor } from './ocena';
import {
  aktywneBledy,
  jakosc,
  nowyPostep,
  opanowanie,
  wczytajPostep,
  zarejestruj,
  type Dowod,
  type PostepV2,
  type WynikKroku,
} from './model';
import { kolejnyPoziom, nastepna, rozpocznij, wybierzSpeed, zakonczKrok, zakonczWstawke, type Otoczenie } from './silnik-sesji';
import { FISZKI_DEMO, KLOCKI, MIKRO, SPEED, ZADANIE_PARAMETR } from './tresc';
import { walidujZadanie } from './walidacja';
import { rownowazne, wyrazenie } from './wyrazenia';

const T = 1_800_000_000_000;
const otoczenie = (): Otoczenie => ({
  fiszki: MATH_CORPUS.flashcards.filter((f) => FISZKI_DEMO.includes(f.id)),
  stanyFiszek: new Map(),
});

describe('wyrażenia — równoważne zapisy', () => {
  it('przyjmuje różne zapisy tej samej odpowiedzi', () => {
    for (const w of ['m^2-16', 'm²−16', '(m-4)(m+4)', 'Δ = m^2 - 16', '-16+m*m', '(m+4)(m−4)']) {
      expect(rownowazne(w, 'm^2-16'), w).toBe(true);
    }
  });
  it('odrzuca inne wyrażenia i śmieci', () => {
    expect(rownowazne('m^2+16', 'm^2-16')).toBe(false);
    expect(rownowazne('m^2-4m-16', 'm^2-16')).toBe(false);
    expect(wyrazenie('m^^2')).toBeNull();
    expect(wyrazenie('alert(1)')).toBeNull();
    expect(wyrazenie('')).toBeNull();
  });
  it('mnożenie domyślne i potęgi z minusem', () => {
    expect(wyrazenie('2m(m+1)')!(3)).toBe(24);
    expect(wyrazenie('-m^2')!(3)).toBe(-9);
    expect(wyrazenie('2^-1')!(0)).toBe(0.5);
  });
});

describe('treść demo — matematyka liczona niezależnie', () => {
  const pierwiastki = (m: number) => {
    const b = -(m + 2);
    const c = m + 5;
    const d = b * b - 4 * c;
    return d < 0 ? null : [(-b - Math.sqrt(d)) / 2, (-b + Math.sqrt(d)) / 2];
  };
  const spelnia = (m: number) => {
    const x = pierwiastki(m);
    return x !== null && x[0] !== x[1] && x[0]! ** 2 + x[1]! ** 2 <= 18 + 1e-9;
  };
  it('odpowiedź ⟨−6, −4) zgadza się z bezpośrednim sprawdzeniem', () => {
    for (let m = -10; m <= 10; m += 0.25) {
      expect(spelnia(m), `m = ${m}`).toBe(m >= -6 && m < -4);
    }
  });
  it('Δ, suma i suma kwadratów w krokach są poprawne', () => {
    const krok = (id: string) => ZADANIE_PARAMETR.steps.find((s) => s.id === id)!;
    const ocz = (id: string) => (krok(id).answer as { oczekiwane: string }).oczekiwane;
    for (const m of [-5.5, -1, 2.3, 7]) {
      expect(wyrazenie(ocz('dp4'))!(m)).toBeCloseTo((m + 2) ** 2 - 4 * (m + 5));
      const x = pierwiastki(m);
      if (x) {
        expect(wyrazenie(ocz('dp6'))!(m)).toBeCloseTo(x[0]! + x[1]!);
        expect(wyrazenie(ocz('dp7'))!(m)).toBeCloseTo(x[0]! ** 2 + x[1]! ** 2);
      }
    }
    const x = pierwiastki(-5)!;
    expect(x[0]! ** 2 + x[1]! ** 2).toBe((krok('dp10').answer as { wartosc: number }).wartosc);
  });
  it('zadanie przechodzi walidację struktury', () => {
    expect(walidujZadanie(ZADANIE_PARAMETR)).toEqual({ ok: true, bledy: [] });
    expect(ZADANIE_PARAMETR.steps.length).toBeGreaterThanOrEqual(8);
  });
  it('walidacja odrzuca zepsute zadanie z AI', () => {
    const zle = structuredClone(ZADANIE_PARAMETR);
    zle.steps[3]!.answer = { typ: 'wyrazenie', zmienna: 'm', oczekiwane: 'm^2-16', typowe: [{ wyrazenie: '(m-4)(m+4)', komunikat: 'x' }] };
    zle.steps[0]!.prompt = 'niedomknięty $\\Delta';
    const w = walidujZadanie(zle);
    expect(w.ok).toBe(false);
    expect(w.bledy.join(' ')).toMatch(/równy poprawnej/);
    expect(w.bledy.join(' ')).toMatch(/niedomknięty/);
  });
  it('typowe błędy rozpoznają konkretną przyczynę', () => {
    const dp4 = ZADANIE_PARAMETR.steps.find((s) => s.id === 'dp4')!.answer;
    expect(ocenWpis(dp4, 'm^2+8m+24').diagnoza?.misconception).toBe('discriminant-sign-error');
    expect(ocenWpis(dp4, 'm^2-4m-16').diagnoza?.misconception).toBe('square-of-sum-error');
    expect(ocenWpis(dp4, '(m-4)(m+4)').poprawna).toBe(true);
    expect(ocenWpis(dp4, 'm^^').nieczytelne).toBe(true);
  });
  it('każdy tag błędu jest w katalogu, a jego umiejętność w korpusie', () => {
    const skills = new Set(MATH_CORPUS.skills.map((s) => s.id));
    const tagi = [
      ...ZADANIE_PARAMETR.steps.flatMap((s) => s.misconceptionTags),
      ...MIKRO.flatMap((m) => (m.odpowiedz.typ === 'wybor' ? Object.values(m.odpowiedz.bledne ?? {}).map((d) => d.misconception) : [])),
      ...SPEED.map((q) => q.misconception),
      ...KLOCKI.flatMap((k) => k.dystraktory.map((d) => d.misconception)),
    ].filter((t): t is string => Boolean(t));
    for (const t of tagi) {
      expect(BLEDY[t], t).toBeDefined();
      expect(skills.has(BLEDY[t]!.skill), BLEDY[t]!.skill).toBe(true);
    }
    for (const s of [...ZADANIE_PARAMETR.steps.map((x) => x.skill), ...MIKRO.map((x) => x.skill), ...SPEED.map((x) => x.skill)]) {
      expect(skills.has(s), s).toBe(true);
    }
  });
  it('fiszki demo to istniejące karty kursu', () => {
    const ids = new Set(MATH_CORPUS.flashcards.map((f) => f.id));
    for (const id of FISZKI_DEMO) expect(ids.has(id), id).toBe(true);
    expect(FISZKI_DEMO.length).toBeGreaterThanOrEqual(8);
  });
  it('wybór: poprawna opcja nie ma diagnozy błędu', () => {
    for (const m of MIKRO) {
      if (m.odpowiedz.typ === 'wybor') expect(ocenWybor(m.odpowiedz, m.odpowiedz.poprawna).diagnoza).toBeNull();
    }
  });
});

describe('model wiedzy v2', () => {
  const dowod = (o: Partial<Dowod>): Dowod => ({
    skill: 'quad-discriminant', zrodlo: 'deep', poprawna: true, proby: 1, podpowiedzi: 0, ai: false, trudnosc: 3, teraz: T, ...o,
  });
  it('nie jest zerojedynkowy: pomoc i próby obniżają jakość', () => {
    expect(jakosc(dowod({}))).toBe(1);
    expect(jakosc(dowod({ podpowiedzi: 2 }))).toBeLessThan(1);
    expect(jakosc(dowod({ proby: 3 }))).toBeLessThan(jakosc(dowod({ proby: 2 })));
    expect(jakosc(dowod({ ai: true }))).toBeLessThan(1);
    expect(jakosc(dowod({ poprawna: false }))).toBe(0);
    expect(jakosc(dowod({ zrodlo: 'speed', czasMs: 30_000 }))).toBeLessThan(jakosc(dowod({ zrodlo: 'speed', czasMs: 4_000 })));
  });
  it('trudne zadanie rozwiązane samodzielnie podnosi bardziej niż łatwe', () => {
    const p = nowyPostep(T);
    const latwe = zarejestruj(p, dowod({ trudnosc: 1 }));
    const trudne = zarejestruj(p, dowod({ trudnosc: 5 }));
    expect(opanowanie(trudne, 'quad-discriminant')).toBeGreaterThan(opanowanie(latwe, 'quad-discriminant'));
  });
  it('startuje z dotychczasowego poziomu i go nie zmienia', () => {
    const dawne = new Map([['quad-vieta', { ...emptySkillState('quad-vieta'), level: MasteryLevel.Independent }]]);
    const p = nowyPostep(T);
    expect(opanowanie(p, 'quad-vieta', dawne)).toBe(55);
    const po = zarejestruj(p, dowod({ skill: 'quad-vieta', poprawna: false, misconceptions: ['sum-of-squares-identity'] }), dawne);
    expect(opanowanie(po, 'quad-vieta', dawne)).toBeLessThan(55);
    expect(dawne.get('quad-vieta')!.level).toBe(MasteryLevel.Independent);
  });
  it('pamięć błędów: wystąpienie i naprawa', () => {
    let p = zarejestruj(nowyPostep(T), dowod({ poprawna: false, misconceptions: ['discriminant-nonstrict'] }));
    expect(aktywneBledy(p).map((b) => b.tag)).toEqual(['discriminant-nonstrict']);
    p = zarejestruj(p, dowod({ ominiete: ['discriminant-nonstrict'] }));
    p = zarejestruj(p, dowod({ ominiete: ['discriminant-nonstrict'] }));
    expect(aktywneBledy(p)).toEqual([]);
    expect(p.bledy['discriminant-nonstrict']!.licznik).toBe(1);
  });
  it('uszkodzony zapis nie rzuca i nie udaje danych', () => {
    expect(wczytajPostep('{zepsute', T).umiejetnosci).toEqual({});
    expect(wczytajPostep(JSON.stringify({ wersja: 1 }), T).wersja).toBe(2);
    const zapis = zarejestruj(nowyPostep(T), dowod({}));
    expect(wczytajPostep(JSON.stringify(zapis), T)).toEqual(zapis);
  });
});

describe('silnik sesji — kolejność adaptacyjna', () => {
  const krokOk = (): WynikKroku => ({ proby: 1, podpowiedzi: 0, ai: false, poprawna: true, czasMs: 5000, misconceptions: [] });
  const przejdz = (p: PostepV2, wynik: (i: number) => WynikKroku) => {
    const o = otoczenie();
    const trasa: string[] = [];
    for (let n = 0; n < 40; n++) {
      const a = nastepna(p, ZADANIE_PARAMETR, o);
      trasa.push(a.typ === 'deep' ? `deep:${ZADANIE_PARAMETR.steps[a.krok]!.id}` : a.typ === 'mikro' ? `mikro:${a.id}` : a.typ);
      if (a.typ === 'koniec') break;
      if (a.typ === 'deep') p = zakonczKrok(p, ZADANIE_PARAMETR, wynik(a.krok), o, T).postep;
      else if (a.typ === 'mikro') p = zakonczWstawke(p, `mikro:${a.id}`, [], o);
      else if (a.typ === 'klocki') p = zakonczWstawke(p, `klocki:${a.id}`, [], o);
      else p = zakonczWstawke(p, a.typ, [], o);
    }
    return trasa;
  };

  it('nowy uczeń: pełne zadanie z przygotowaniem, fiszki w połowie, potem klocki, podsumowanie, speed', () => {
    const p = rozpocznij(nowyPostep(T), ZADANIE_PARAMETR, otoczenie(), T);
    const trasa = przejdz(p, krokOk);
    expect(trasa.filter((x) => x.startsWith('deep:')).length).toBeLessThanOrEqual(10);
    expect(trasa).toContain('mikro:mk-wzor-delta');
    expect(trasa.indexOf('mikro:mk-wzor-delta')).toBe(trasa.indexOf('deep:dp4') - 1);
    expect(trasa).toContain('fiszki');
    expect(trasa.slice(-4)).toEqual(['klocki', 'podsumowanie', 'speed', 'koniec']);
    // Nigdy dwie wstawki pod rząd między krokami zadania.
    for (let i = 1; i < trasa.indexOf('klocki'); i++) {
      expect(!trasa[i]!.startsWith('deep:') && !trasa[i - 1]!.startsWith('deep:')).toBe(false);
    }
  });

  it('dobry uczeń: rusztowania pomijane, mniej wstawek', () => {
    let p = nowyPostep(T);
    for (const s of ['quad-discriminant', 'quad-forms', 'quad-vieta', 'quad-ineq', 'quad-param']) {
      p = { ...p, umiejetnosci: { ...p.umiejetnosci, [s]: { mastery: 92, dowody: 20, ostatnio: T } } };
    }
    p = rozpocznij(p, ZADANIE_PARAMETR, otoczenie(), T);
    expect(p.sesja!.prowadzenie).toBe(2);
    const trasa = przejdz(p, krokOk);
    expect(trasa).not.toContain('deep:dp1');
    expect(trasa).not.toContain('deep:dp2');
    expect(trasa).not.toContain('mikro:mk-wzor-delta');
    expect(trasa).not.toContain('klocki');
  });

  it('po błędzie pojawia się krótkie zadanie z tej samej umiejętności', () => {
    const p = rozpocznij(nowyPostep(T), ZADANIE_PARAMETR, otoczenie(), T);
    const trasa = przejdz(p, (i) => (ZADANIE_PARAMETR.steps[i]!.id === 'dp7'
      ? { ...krokOk(), proby: 3, misconceptions: ['sum-of-squares-identity'] }
      : krokOk()));
    const po = trasa[trasa.indexOf('deep:dp7') + 1];
    expect(['mikro:mk-uzupelnij-kwadraty', 'mikro:mk-blad-viete']).toContain(po);
  });

  it('speed round celuje w błędy z sesji i miesza formy', () => {
    let p = rozpocznij(nowyPostep(T), ZADANIE_PARAMETR, otoczenie(), T);
    p = zarejestruj(p, { skill: 'quad-ineq', zrodlo: 'deep', poprawna: false, proby: 2, podpowiedzi: 0, ai: false, trudnosc: 4, misconceptions: ['quadratic-ineq-direction'], teraz: T });
    const ids = wybierzSpeed(p, otoczenie(), 5, 'x');
    expect(ids).toHaveLength(5);
    const pytania = ids.map((id) => SPEED.find((q) => q.id === id)!);
    expect(pytania.some((q) => q.misconception === 'quadratic-ineq-direction')).toBe(true);
    expect(pytania.some((q) => q.forma === 'pf')).toBe(true);
    expect(pytania.some((q) => q.forma === 'liczba')).toBe(true);
  });

  it('drabina trudności: samodzielność podnosi szczebel, pomoc go trzyma', () => {
    expect(kolejnyPoziom(0.9, 5).szczebel).toBe(6);
    expect(kolejnyPoziom(0.6, 5).szczebel).toBe(5);
    expect(kolejnyPoziom(0.2, 5).szczebel).toBe(4);
  });
});

describe('kolejność opcji', () => {
  it('poprawna odpowiedź nie stoi zawsze na pierwszym miejscu', async () => {
    const { tasujIndeksy } = await import('./wspolne');
    const pozycje = ZADANIE_PARAMETR.steps
      .filter((s) => s.answer.typ === 'wybor')
      .map((s) => tasujIndeksy((s.answer as { opcje: string[] }).opcje.length, s.id).indexOf((s.answer as { poprawna: number }).poprawna));
    expect(new Set(pozycje).size).toBeGreaterThan(1);
  });
});

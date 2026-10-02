import type { CardState, Flashcard, SkillState } from '@/data/types';
import { BLEDY } from './bledy';
import {
  DRABINA,
  aktywneBledy,
  opanowanie,
  prowadzenieStartowe,
  zarejestruj,
  type Dowod,
  type PostepV2,
  type StanSesji,
  type WynikKroku,
} from './model';
import { KLOCKI, KROTKIE_NAZWY, MIKRO, SPEED, UMIEJETNOSCI_TEMATU } from './tresc';
import type { MathTask } from './typy';

/**
 * Silnik sesji: stan ucznia → co teraz.
 *
 *   stan ucznia → umiejętność → typ interakcji → zadanie → ocena
 *   → aktualizacja opanowania → następna aktywność
 *
 * Kolejność NIE jest zapisana na sztywno. Rdzeniem jest pełne zadanie
 * (Deep Solve); pomiędzy jego krokami silnik wstawia najwyżej jedną krótką
 * aktywność, wybraną z powodu, który da się nazwać: przygotowanie do kroku,
 * powrót do pomysłu po błędzie, przerwa na fiszki. Po zadaniu — klocki
 * (jeśli wyliczanie pierwiastków nie jest jeszcze pewne), podsumowanie
 * i szybka powtórka z tego, co najsłabsze.
 *
 * Funkcje są czyste — stan przechowuje `PostepV2.sesja`.
 */

export type Aktywnosc =
  | { typ: 'deep'; krok: number }
  | { typ: 'mikro'; id: string; powod: string }
  | { typ: 'fiszki'; ids: string[]; powod: string }
  | { typ: 'klocki'; id: string; powod: string }
  | { typ: 'podsumowanie' }
  | { typ: 'speed'; ids: string[]; powod: string }
  | { typ: 'koniec' };

export interface Otoczenie {
  /** Dotychczasowe poziomy 0–5 (tylko do odczytu, punkt startowy). */
  dawne?: Map<string, SkillState>;
  /** Fiszki kursu i ich stan w systemie pudełek. */
  fiszki: Flashcard[];
  stanyFiszek: Map<string, CardState>;
}

/** Ile krótkich wstawek najwyżej w jednym zadaniu — rdzeniem jest zadanie. */
export const MAX_MIKRO = 4;
/** Opanowanie, poniżej którego warto przygotować się do kroku mikro-zadaniem. */
export const PROG_PRZYGOTOWANIA = 70;
/** Klocki pomijamy, gdy wyliczanie pierwiastków jest już pewne. */
export const PROG_KLOCKOW = 90;
/** Po tylu poprawnych odpowiedziach z rzędu — mniej prowadzenia. */
export const PRZYSPIESZ_PO = 3;

export function rozpocznij(p: PostepV2, task: MathTask, o: Otoczenie, teraz: number): PostepV2 {
  const skills = [...new Set([task.skill, ...task.steps.map((s) => s.skill)])];
  const startOpanowanie = Object.fromEntries(skills.map((s) => [s, opanowanie(p, s, o.dawne)]));
  const sr = skills.reduce((a, s) => a + (startOpanowanie[s] ?? 0), 0) / skills.length;
  const sesja: StanSesji = {
    id: `s-${teraz.toString(36)}`,
    zadanieId: task.id,
    start: teraz,
    krok: 0,
    wynikiKrokow: {},
    zrobione: [],
    odKroku: 0,
    prowadzenie: prowadzenieStartowe(sr),
    seria: 0,
    startOpanowanie,
    koniec: null,
  };
  return { ...p, sesja: przewin(sesja, task, teraz) };
}

/** Przy samodzielności 2 kroki-rusztowania zalicza aplikacja (jako oczywiste). */
function przewin(s: StanSesji, task: MathTask, _teraz: number): StanSesji {
  let krok = s.krok;
  const wyniki = { ...s.wynikiKrokow };
  while (s.prowadzenie >= 2 && krok < task.steps.length && task.steps[krok]!.scaffold && !wyniki[task.steps[krok]!.id]) {
    wyniki[task.steps[krok]!.id] = { proby: 0, podpowiedzi: 0, ai: false, poprawna: true, automatycznie: true, czasMs: 0, misconceptions: [] };
    krok++;
  }
  return { ...s, krok, wynikiKrokow: wyniki };
}

const zrobione = (s: StanSesji, klucz: string) => s.zrobione.includes(klucz);

/** Następna aktywność. */
export function nastepna(p: PostepV2, task: MathTask, o: Otoczenie): Aktywnosc {
  const s = p.sesja;
  if (!s || s.koniec !== null) return { typ: 'koniec' };
  const m = (skill: string) => opanowanie(p, skill, o.dawne);

  if (s.krok < task.steps.length) {
    const krok = task.steps[s.krok]!;
    const mikroWSesji = s.zrobione.filter((k) => k.startsWith('mikro:')).length;
    if (s.krok > 0 && s.odKroku === 0) {
      // 1. Przygotowanie do kroku, gdy umiejętność jest jeszcze słaba.
      const przed = MIKRO.find((x) => x.przedKrokiem === krok.id && !zrobione(s, `mikro:${x.id}`));
      if (przed && mikroWSesji < MAX_MIKRO && (m(przed.skill) < PROG_PRZYGOTOWANIA || s.prowadzenie === 0)) {
        return { typ: 'mikro', id: przed.id, powod: 'Przygotowanie do następnego kroku.' };
      }
      // 2. Po błędzie: ten sam pomysł jeszcze raz, krócej.
      const poprzedni = ostatniKrok(s, task);
      if (poprzedni && mikroWSesji < MAX_MIKRO) {
        const w = s.wynikiKrokow[poprzedni.id];
        if (w && !w.automatycznie && (w.proby > 1 || !w.poprawna || w.podpowiedzi >= 2)) {
          const naprawa = MIKRO.find(
            (x) => !zrobione(s, `mikro:${x.id}`) && x.skill === poprzedni.skill && !x.przedKrokiem,
          );
          if (naprawa) return { typ: 'mikro', id: naprawa.id, powod: `Po trudności w poprzednim kroku — ${KROTKIE_NAZWY[naprawa.skill] ?? 'ten sam pomysł'} jeszcze raz, krócej.` };
        }
      }
      // 3. W połowie zadania: dwie fiszki z tego, co najsłabsze.
      const zaliczone = task.steps.filter((x) => s.wynikiKrokow[x.id]).length;
      if (!zrobione(s, 'fiszki') && zaliczone >= Math.ceil(task.steps.length / 2)) {
        const zTematu = o.fiszki.filter((f) => UMIEJETNOSCI_TEMATU.includes(f.skillId)).map((f) => f.id);
        const ids = wybierzFiszki(p, o, 2, zTematu);
        if (ids.length > 0) return { typ: 'fiszki', ids, powod: 'Krótka przerwa od rachunków: dwie fiszki z tego, co teraz najsłabsze.' };
      }
    }
    return { typ: 'deep', krok: s.krok };
  }

  for (const k of KLOCKI) {
    if (zrobione(s, `klocki:${k.id}`)) continue;
    const pulapki = k.dystraktory.map((d) => d.misconception).filter(Boolean);
    const aktywne = aktywneBledy(p).some((b) => pulapki.includes(b.tag));
    if (m(k.skill) < PROG_KLOCKOW || aktywne) {
      return { typ: 'klocki', id: k.id, powod: aktywne ? 'Ćwiczy pułapkę, która ostatnio się pojawiła.' : 'Utrwalenie: całe rozwiązanie z delty, krok po kroku.' };
    }
  }
  if (!zrobione(s, 'podsumowanie')) return { typ: 'podsumowanie' };
  if (!zrobione(s, 'speed')) {
    return { typ: 'speed', ids: wybierzSpeed(p, o, 5, s.id), powod: 'Pięć szybkich pytań — najwięcej z tego, co sprawiło trudność.' };
  }
  return { typ: 'koniec' };
}

function ostatniKrok(s: StanSesji, task: MathTask) {
  for (let i = s.krok - 1; i >= 0; i--) {
    const k = task.steps[i]!;
    if (!s.wynikiKrokow[k.id]?.automatycznie) return k;
  }
  return null;
}

/** Fiszki: najsłabsza umiejętność, potem zaległe, potem nigdy nie oglądane. */
export function wybierzFiszki(p: PostepV2, o: Otoczenie, ile: number, z: string[] = o.fiszki.map((f) => f.id)): string[] {
  const teraz = p.sesja?.start ?? 0;
  const bledne = new Set(aktywneBledy(p).map((b) => BLEDY[b.tag]?.skill));
  return o.fiszki
    .filter((f) => z.includes(f.id))
    .map((f) => {
      const st = o.stanyFiszek.get(f.id);
      const wynik =
        (100 - opanowanie(p, f.skillId, o.dawne)) +
        (bledne.has(f.skillId) ? 40 : 0) +
        (st && st.dueAt <= teraz ? 25 : 0) +
        (st ? -5 * Math.min(st.box, 6) : 10);
      return { id: f.id, wynik };
    })
    .sort((a, b) => b.wynik - a.wynik || a.id.localeCompare(b.id))
    .slice(0, ile)
    .map((x) => x.id);
}

/** Speed Round: słabe umiejętności i aktywne błędy, ale różne formy i tematy. */
export function wybierzSpeed(p: PostepV2, o: Otoczenie, ile: number, ziarno: string): string[] {
  const aktywne = new Set(aktywneBledy(p).map((b) => b.tag));
  const sesyjne = new Set(Object.values(p.sesja?.wynikiKrokow ?? {}).flatMap((w) => w.misconceptions));
  // Nieznana umiejętność (bez żadnego dowodu) to niepewność, nie „zero wiedzy”.
  const slabosc = (skill: string) =>
    p.umiejetnosci[skill] || o.dawne?.get(skill)?.level ? 100 - opanowanie(p, skill, o.dawne) : 40;
  const punkty = SPEED.map((q) => ({
    q,
    w:
      slabosc(q.skill) +
      (UMIEJETNOSCI_TEMATU.includes(q.skill) ? 25 : 0) +
      (q.misconception && aktywne.has(q.misconception) ? 40 : 0) +
      (q.misconception && sesyjne.has(q.misconception) ? 30 : 0) +
      (hash(`${ziarno}:${q.id}`) % 15),
  })).sort((a, b) => b.w - a.w);
  const wynik: typeof SPEED = [];
  const naUmiejetnosc = new Map<string, number>();
  let pozaTematem = 0;
  for (const { q } of punkty) {
    if (wynik.length >= ile) break;
    if ((naUmiejetnosc.get(q.skill) ?? 0) >= 2) continue;
    // Jedno pytanie spoza tematu — przeplatanie, ale lekcja zostaje o swoim temacie.
    if (!UMIEJETNOSCI_TEMATU.includes(q.skill) && pozaTematem++ >= 1) continue;
    wynik.push(q);
    naUmiejetnosc.set(q.skill, (naUmiejetnosc.get(q.skill) ?? 0) + 1);
  }
  // Co najmniej jedno pytanie „swipe” (prawda/fałsz) i jedno liczbowe — tempo i różnorodność.
  const chronione = new Set<string>();
  for (const forma of ['pf', 'liczba'] as const) {
    const jest = wynik.find((q) => q.forma === forma);
    if (jest) {
      chronione.add(jest.id);
      continue;
    }
    const zapas = punkty.find(({ q }) => q.forma === forma && !wynik.includes(q));
    let i = wynik.length - 1;
    while (i >= 0 && chronione.has(wynik[i]!.id)) i--;
    if (zapas && i >= 0) {
      wynik[i] = zapas.q;
      chronione.add(zapas.q.id);
    }
  }
  return wynik.map((q) => q.id);
}

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Math.abs(h);
}

// ------------------------------------------------------------------ zapis wyników

export interface Zdarzenie {
  postep: PostepV2;
  /** Krótki komunikat silnika dla ucznia (np. zmiana prowadzenia). */
  komunikat: string | null;
}

/** Krok pełnego zadania zakończony (poprawnie albo po pokazaniu rozwiązania). */
export function zakonczKrok(p: PostepV2, task: MathTask, wynik: WynikKroku, o: Otoczenie, teraz: number): Zdarzenie {
  const s = p.sesja;
  if (!s) return { postep: p, komunikat: null };
  const krok = task.steps[s.krok];
  if (!krok) return { postep: p, komunikat: null };
  const dowod: Dowod = {
    skill: krok.skill,
    zrodlo: 'deep',
    poprawna: wynik.poprawna,
    proby: wynik.proby,
    podpowiedzi: wynik.podpowiedzi,
    ai: wynik.ai,
    czasMs: wynik.czasMs,
    trudnosc: task.difficulty,
    misconceptions: wynik.misconceptions,
    ominiete: krok.misconceptionTags,
    teraz,
  };
  let postep = zarejestruj(p, dowod, o.dawne);
  const czysto = wynik.poprawna && wynik.proby === 1 && wynik.podpowiedzi === 0 && !wynik.ai;
  let { prowadzenie, seria } = s;
  let komunikat: string | null = null;
  if (czysto) {
    seria += 1;
    if (seria >= PRZYSPIESZ_PO && prowadzenie < 2) {
      prowadzenie = (prowadzenie + 1) as 1 | 2;
      seria = 0;
      komunikat = prowadzenie === 2 ? 'Świetnie — oczywiste kroki zrobię za Ciebie, Ty bierzesz trudne.' : 'Idzie Ci dobrze — mniej prowadzenia przy kolejnych krokach.';
    }
  } else {
    seria = 0;
    if (!wynik.poprawna && prowadzenie > 0) {
      prowadzenie = (prowadzenie - 1) as 0 | 1;
      komunikat = 'Przy następnych krokach dam Ci więcej wskazówek.';
    }
  }
  const nowa = przewin(
    { ...s, krok: s.krok + 1, odKroku: 0, prowadzenie, seria, wynikiKrokow: { ...s.wynikiKrokow, [krok.id]: wynik } },
    task,
    teraz,
  );
  postep = { ...postep, sesja: nowa };
  return { postep, komunikat };
}

/** Wstawka zakończona (mikro, fiszki, klocki, podsumowanie, speed). */
export function zakonczWstawke(p: PostepV2, klucz: string, dowody: Dowod[], o: Otoczenie): PostepV2 {
  let postep = p;
  for (const d of dowody) postep = zarejestruj(postep, d, o.dawne);
  const s = postep.sesja;
  if (!s) return postep;
  return { ...postep, sesja: { ...s, zrobione: [...s.zrobione, klucz], odKroku: s.odKroku + 1 } };
}

export function zapiszSpeed(p: PostepV2, wynik: NonNullable<StanSesji['speed']>): PostepV2 {
  return p.sesja ? { ...p, sesja: { ...p.sesja, speed: wynik } } : p;
}

/** Koniec sesji: zapis ukończonego zadania i nowy szczebel drabiny. */
export function zakonczSesje(p: PostepV2, task: MathTask, _o: Otoczenie, teraz: number): PostepV2 {
  const s = p.sesja;
  if (!s || s.koniec !== null) return p;
  const ocena = ocenaZadania(s, task);
  const temat = task.topic;
  const obecny = p.szczebel[temat] ?? szczebelZadania(task);
  const zmiana = kolejnyPoziom(ocena.samodzielnie, obecny);
  return {
    ...p,
    sesja: { ...s, koniec: teraz },
    ukonczone: { ...p.ukonczone, [task.id]: { kiedy: teraz, samodzielnie: ocena.samodzielnie } },
    szczebel: { ...p.szczebel, [temat]: zmiana.szczebel },
  };
}

// ------------------------------------------------------------------ podsumowanie i trudność

export interface OcenaZadania {
  /** Odsetek kroków (bez automatycznych) zrobionych za pierwszym razem, bez pomocy. */
  samodzielnie: number;
  mocne: string[];
  slabe: string[];
  bledy: string[];
}

export function ocenaZadania(s: StanSesji, task: MathTask): OcenaZadania {
  const kroki = task.steps.filter((k) => s.wynikiKrokow[k.id] && !s.wynikiKrokow[k.id]!.automatycznie);
  const czyste = (id: string) => {
    const w = s.wynikiKrokow[id]!;
    return w.poprawna && w.proby === 1 && w.podpowiedzi === 0 && !w.ai;
  };
  const poUmiejetnosci = new Map<string, { czyste: number; razem: number }>();
  for (const k of kroki) {
    const x = poUmiejetnosci.get(k.skill) ?? { czyste: 0, razem: 0 };
    x.razem += 1;
    if (czyste(k.id)) x.czyste += 1;
    poUmiejetnosci.set(k.skill, x);
  }
  const mocne = [...poUmiejetnosci].filter(([, x]) => x.czyste === x.razem).map(([id]) => id);
  const slabe = [...poUmiejetnosci].filter(([, x]) => x.czyste < x.razem).map(([id]) => id);
  const bledy = [...new Set(kroki.flatMap((k) => s.wynikiKrokow[k.id]!.misconceptions))];
  return { samodzielnie: kroki.length ? kroki.filter((k) => czyste(k.id)).length / kroki.length : 0, mocne, slabe, bledy };
}

/** Szczebel drabiny, na którym leży zadanie: trudność 4 (pełne zadanie PR) → „Zadanie maturalne”. */
export function szczebelZadania(task: MathTask): number {
  return Math.min(DRABINA.length - 1, task.difficulty + 1);
}

export function kolejnyPoziom(samodzielnie: number, szczebel: number): { szczebel: number; opis: string } {
  if (samodzielnie >= 0.8 && szczebel < DRABINA.length - 1) {
    return { szczebel: szczebel + 1, opis: `Następne zadanie będzie nieco trudniejsze: „${DRABINA[szczebel + 1]}” — mniej prowadzenia za rękę.` };
  }
  if (samodzielnie >= 0.8) {
    return { szczebel, opis: 'Następne zadanie: inny typ zadania maturalnego — metodę wybierasz sam.' };
  }
  if (samodzielnie >= 0.5) {
    return { szczebel, opis: `Następne zadanie: ten sam poziom („${DRABINA[szczebel]}”), inne liczby i pułapki.` };
  }
  return { szczebel: Math.max(0, szczebel - 1), opis: 'Następne zadanie: podobne, z większą liczbą kroków prowadzonych — najpierw pewność, potem tempo.' };
}

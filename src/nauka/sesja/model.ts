import { MasteryLevel, type SkillState } from '@/data/types';
import { BLEDY } from './bledy';
import type { MisconceptionTag } from './typy';

/**
 * Model wiedzy ucznia v2 — `learning_progress_v2`.
 *
 * Osobny klucz w preferencjach (ta sama baza, kopia JSON i synchronizacja),
 * więc NIC z dotychczasowego postępu nie jest nadpisywane: poziomy 0–5,
 * próby, fiszki i stan `nauka.v1` zostają, jak były. Startowe opanowanie
 * umiejętności odczytujemy z dotychczasowego poziomu (tylko do odczytu).
 *
 * Opanowanie 0–100 to średnia ważona dowodów, a nie licznik poprawnych:
 * liczy się poprawność, liczba prób, podpowiedzi, użycie AI, czas, trudność
 * zadania i rodzaj aktywności (pełne zadanie waży więcej niż fiszka).
 */

export const KLUCZ_V2 = 'learning_progress_v2';

export type ZrodloDowodu = 'deep' | 'klocki' | 'mikro' | 'fiszka' | 'speed';

export interface Dowod {
  skill: string;
  zrodlo: ZrodloDowodu;
  poprawna: boolean;
  /** Która próba dała wynik (1 = za pierwszym razem). */
  proby: number;
  /** Najwyższy użyty szczebel podpowiedzi 0–5 (5 = pokazane rozwiązanie kroku). */
  podpowiedzi: number;
  /** Czy uczeń pytał nauczyciela AI przy tym zadaniu. */
  ai: boolean;
  czasMs?: number;
  /** Trudność 1–5. */
  trudnosc: number;
  /** Rozpoznane błędy przy tym dowodzie (mogą być dwa przy dwóch próbach). */
  misconceptions?: MisconceptionTag[];
  /** Fiszka: uczeń sam ocenił („wiedziałem”) — słabszy dowód niż rozwiązanie. */
  samoocena?: boolean;
  /** Dowód poprawnego ominięcia pułapki (krok miał te tagi, uczeń się nie złapał). */
  ominiete?: MisconceptionTag[];
  teraz: number;
}

export interface StanUmiejetnosci {
  mastery: number;
  dowody: number;
  ostatnio: number;
}

export interface StanBledu {
  licznik: number;
  ostatnio: number;
  /** Poprawne ominięcia tej pułapki od ostatniego wystąpienia. */
  naprawa: number;
}

export interface WpisHistorii {
  t: number;
  skill: string;
  zrodlo: ZrodloDowodu;
  /** Jakość dowodu 0–1. */
  q: number;
}

/** Stan bieżącej sesji — żeby po wyjściu dało się wrócić dokładnie tam. */
export interface StanSesji {
  id: string;
  zadanieId: string;
  start: number;
  /** Indeks bieżącego kroku pełnego zadania. */
  krok: number;
  wynikiKrokow: Record<string, WynikKroku>;
  /** Wykonane wstawki: `mikro:<id>`, `fiszki`, `klocki:<id>`, `podsumowanie`, `speed`. */
  zrobione: string[];
  /** Ile wstawek od ostatniego kroku pełnego zadania. */
  odKroku: number;
  /** 0 — pełne prowadzenie, 1 — częściowe, 2 — samodzielnie. */
  prowadzenie: 0 | 1 | 2;
  /** Poprawne za pierwszym razem z rzędu (do zmniejszania prowadzenia). */
  seria: number;
  /** Opanowanie umiejętności na starcie sesji — do pokazania zmiany. */
  startOpanowanie: Record<string, number>;
  /** Wyniki speed round, gdy już był. */
  speed?: { dobrze: number; razem: number; sredniCzasMs: number; doPowtorki: string | null };
  koniec: number | null;
}

export interface WynikKroku {
  proby: number;
  podpowiedzi: number;
  ai: boolean;
  poprawna: boolean;
  /** Krok pominięty przez aplikację (rusztowanie przy wysokim opanowaniu). */
  automatycznie?: boolean;
  czasMs: number;
  odpowiedz?: string;
  misconceptions: MisconceptionTag[];
}

export interface PostepV2 {
  wersja: 2;
  utworzono: number;
  umiejetnosci: Record<string, StanUmiejetnosci>;
  bledy: Record<MisconceptionTag, StanBledu>;
  historia: WpisHistorii[];
  sesja: StanSesji | null;
  /** Ukończone pełne zadania: kiedy i jaki odsetek kroków samodzielnie. */
  ukonczone: Record<string, { kiedy: number; samodzielnie: number }>;
  /** Szczebel drabiny trudności dla tematu (0–7). */
  szczebel: Record<string, number>;
}

export const nowyPostep = (teraz: number): PostepV2 => ({
  wersja: 2,
  utworzono: teraz,
  umiejetnosci: {},
  bledy: {},
  historia: [],
  sesja: null,
  ukonczone: {},
  szczebel: {},
});

/** Odczyt odporny na uszkodzony zapis — nigdy nie rzuca, nigdy nie kasuje v1. */
export function wczytajPostep(json: string | undefined, teraz: number): PostepV2 {
  if (!json) return nowyPostep(teraz);
  try {
    const p = JSON.parse(json) as Partial<PostepV2>;
    if (!p || p.wersja !== 2 || typeof p.umiejetnosci !== 'object') return nowyPostep(teraz);
    return { ...nowyPostep(teraz), ...p } as PostepV2;
  } catch {
    return nowyPostep(teraz);
  }
}

// ------------------------------------------------------------------ opanowanie

/** Start z dotychczasowego poziomu 0–5 (dowody zebrane wcześniej w FORGE). */
const Z_POZIOMU: Record<number, number> = {
  [MasteryLevel.Unknown]: 0,
  [MasteryLevel.Recognised]: 20,
  [MasteryLevel.Assisted]: 35,
  [MasteryLevel.Independent]: 55,
  [MasteryLevel.Transfer]: 70,
  [MasteryLevel.Retained]: 85,
};

export function opanowanie(p: PostepV2, skill: string, dawne?: Map<string, SkillState>): number {
  const s = p.umiejetnosci[skill];
  if (s) return s.mastery;
  return Z_POZIOMU[dawne?.get(skill)?.level ?? 0] ?? 0;
}

export function opanowanieTematu(p: PostepV2, skills: string[], dawne?: Map<string, SkillState>): number {
  if (skills.length === 0) return 0;
  return skills.reduce((s, id) => s + opanowanie(p, id, dawne), 0) / skills.length;
}

/** Waga rodzaju aktywności: pełne zadanie mówi o wiedzy najwięcej. */
const WAGA: Record<ZrodloDowodu, number> = { deep: 1, klocki: 0.85, speed: 0.7, mikro: 0.6, fiszka: 0.45 };
const KARA_PODPOWIEDZI = [0, 0.1, 0.2, 0.3, 0.45, 0.7];
/** Czas, powyżej którego szybka odpowiedź traci trochę na wartości. */
const CZAS_OCZEKIWANY: Partial<Record<ZrodloDowodu, number>> = { speed: 12_000, mikro: 20_000, fiszka: 10_000 };

/** Jakość dowodu 0–1. Błąd to 0 — ale kara zależy od trudności (niżej). */
export function jakosc(d: Dowod): number {
  if (!d.poprawna) return 0;
  let q = d.samoocena ? 0.85 : 1;
  q -= Math.min(0.5, 0.25 * Math.max(0, d.proby - 1));
  q -= KARA_PODPOWIEDZI[Math.min(5, Math.max(0, d.podpowiedzi))] ?? 0.7;
  if (d.ai) q -= 0.1;
  const limit = CZAS_OCZEKIWANY[d.zrodlo];
  if (limit && d.czasMs !== undefined && d.czasMs > limit) q -= Math.min(0.15, ((d.czasMs - limit) / limit) * 0.15);
  return Math.max(0.1, Math.min(1, q));
}

/** Nowe opanowanie po jednym dowodzie (funkcja czysta). */
export function zaktualizuj(prev: StanUmiejetnosci | undefined, start: number, d: Dowod): StanUmiejetnosci {
  const mastery = prev?.mastery ?? start;
  const dowody = prev?.dowody ?? 0;
  const q = jakosc(d);
  const cel = q * 100;
  // Pierwsze dowody przesuwają mocniej; potem model się stabilizuje.
  let k = Math.min(0.4, Math.max(0.12, 0.4 / Math.sqrt(1 + dowody / 3))) * WAGA[d.zrodlo];
  const t = Math.min(5, Math.max(1, d.trudnosc));
  // Sukces w trudnym zadaniu znaczy więcej; porażka w łatwym — też więcej.
  k *= cel >= mastery ? 0.6 + 0.15 * t : 1.35 - 0.15 * t;
  const nowe = Math.max(0, Math.min(100, mastery + k * (cel - mastery)));
  return { mastery: Math.round(nowe * 10) / 10, dowody: dowody + 1, ostatnio: d.teraz };
}

const MAX_HISTORII = 300;

/** Zapis dowodu: opanowanie, pamięć błędów, historia. */
export function zarejestruj(p: PostepV2, d: Dowod, dawne?: Map<string, SkillState>): PostepV2 {
  const start = opanowanie(p, d.skill, dawne);
  const umiejetnosci = { ...p.umiejetnosci, [d.skill]: zaktualizuj(p.umiejetnosci[d.skill], start, d) };
  const bledy = { ...p.bledy };
  for (const tag of d.misconceptions ?? []) {
    const b = bledy[tag];
    bledy[tag] = { licznik: (b?.licznik ?? 0) + 1, ostatnio: d.teraz, naprawa: 0 };
  }
  if (d.poprawna && d.proby === 1) {
    for (const tag of d.ominiete ?? []) {
      const b = bledy[tag];
      if (b) bledy[tag] = { ...b, naprawa: b.naprawa + 1 };
    }
  }
  const historia = [...p.historia, { t: d.teraz, skill: d.skill, zrodlo: d.zrodlo, q: Math.round(jakosc(d) * 100) / 100 }].slice(-MAX_HISTORII);
  return { ...p, umiejetnosci, bledy, historia };
}

/** Błąd uznajemy za naprawiony po dwóch poprawnych ominięciach pułapki. */
export const NAPRAWA_PO = 2;

/** Aktywne błędy — od najczęstszych i najświeższych. */
export function aktywneBledy(p: PostepV2): Array<{ tag: MisconceptionTag } & StanBledu> {
  return Object.entries(p.bledy)
    .filter(([, b]) => b.naprawa < NAPRAWA_PO)
    .map(([tag, b]) => ({ tag, ...b }))
    .sort((a, b) => b.licznik - a.licznik || b.ostatnio - a.ostatnio);
}

/** Umiejętności, na które wskazują aktywne błędy (do doboru powtórek). */
export function umiejetnosciZBledow(p: PostepV2): string[] {
  return [...new Set(aktywneBledy(p).map((b) => BLEDY[b.tag]?.skill).filter((s): s is string => Boolean(s)))];
}

// ------------------------------------------------------------------ drabina trudności

/**
 * Trudność rośnie przez SAMODZIELNOŚĆ, nie przez większe liczby.
 * Im wyższy szczebel, tym mniej prowadzenia za rękę.
 */
export const DRABINA = [
  'Rozpoznaj wzór',
  'Wykonaj jeden krok',
  'Wykonaj dwa kroki',
  'Połącz dwa zagadnienia',
  'Rozwiąż pełne zadanie',
  'Zadanie maturalne',
  'Zadanie z dystraktorami',
  'Sam wybierz metodę',
] as const;

/** Prowadzenie w pełnym zadaniu: przy wysokim opanowaniu mniej rusztowań. */
export function prowadzenieStartowe(m: number): 0 | 1 | 2 {
  return m >= 75 ? 2 : m >= 50 ? 1 : 0;
}

/** Błąd rozpoznany przez nauczyciela AI w nietypowej odpowiedzi — tylko pamięć błędów, bez zmiany opanowania. */
export function zapiszBlad(p: PostepV2, tag: MisconceptionTag, teraz: number): PostepV2 {
  if (!BLEDY[tag]) return p;
  const b = p.bledy[tag];
  return { ...p, bledy: { ...p.bledy, [tag]: { licznik: (b?.licznik ?? 0) + 1, ostatnio: teraz, naprawa: 0 } } };
}

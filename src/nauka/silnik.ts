import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { Karta, Lekcja } from './typy';
import { karta } from './lekcje';

/**
 * Silnik feedu: która karta teraz, co po błędzie, kiedy przyspieszyć,
 * kiedy wrócić z powtórką.
 *
 * Zasady (wprost z założeń prototypu):
 * - po błędzie: łatwiejszy krok w obrębie TEGO SAMEGO zadania, potem powrót
 *   do kroku, który się nie udał;
 * - po kilku poprawnych odpowiedziach z rzędu: więcej samodzielności —
 *   pomijamy kroki-rusztowania, a przy dłuższej serii przechodzimy od razu
 *   do całego zadania;
 * - pominięcie karty nie zwiększa postępu;
 * - postęp w pamięci mierzymy późniejszymi poprawnymi odpowiedziami
 *   (powtórki po przerwie), a nie liczbą przewiniętych kart.
 */

export interface WynikKarty {
  proby: number;
  /** Czy PIERWSZA odpowiedź była poprawna; null — jeszcze bez odpowiedzi. */
  pierwsza: boolean | null;
  pominieta?: boolean;
  /** Krok zaliczony (poprawna odpowiedź w dowolnej próbie) — tylko to liczy się do paska. */
  zaliczona?: boolean;
}

export interface StanLekcji {
  pozycja: number;
  /** Karty wstawione przed dalszą częścią serii: łatwiejszy krok i powtórzenie. */
  wstawione: string[];
  wyniki: Record<string, WynikKarty>;
  /** Poprawne za pierwszym razem z rzędu. */
  seria: number;
  /** 0 — pełne prowadzenie, 1 — bez rusztowań, 2 — od razu całe zadanie. */
  samodzielnosc: 0 | 1 | 2;
  /** Odpowiedzi od ostatniego punktu zakończenia. */
  odStopu: number;
  ukonczona: number | null;
}

export interface StanPowtorki {
  /** Karta FSRS (daty jako ISO). */
  fsrs: Record<string, unknown>;
  /** Udane powtórki po przerwie co najmniej 20 godzin — miara utrwalenia. */
  udanePoPrzerwie: number;
  /** Ostatni kontakt z umiejętnością (koniec serii albo powtórki). */
  ostatnio: number;
  /** Trwająca sesja powtórki: pozycja i liczba błędów. */
  sesja: { pozycja: number; bledy: number; wstawione: string[] } | null;
}

export interface StanNauki {
  wersja: 1;
  lekcje: Record<string, StanLekcji>;
  powtorki: Record<string, StanPowtorki>;
  /** Ostatnie pokazanie karty treningowej; nie wpływa na FSRS. */
  trening?: Record<string, number>;
}

export const PRZERWA_MS = 20 * 3600_000;
/** Co ile odpowiedzi proponujemy dyskretny punkt zakończenia. */
export const STOP_CO = 6;
const PRZYSPIESZ_PO = 3;

const planista = fsrs(generatorParameters({ enable_fuzz: false, enable_short_term: false }));

export const nowyStan = (): StanNauki => ({ wersja: 1, lekcje: {}, powtorki: {} });

export const DZIEN_MS = 24 * 3600_000;

/** Karty niewidziane w ostatniej dobie, najdawniej użyte jako pierwsze. */
export function kartyTreningu(stan: StanNauki, l: Lekcja, teraz: number): string[] {
  return l.powtorka
    .filter((id) => teraz - (stan.trening?.[id] ?? 0) >= DZIEN_MS)
    .sort((a, b) => (stan.trening?.[a] ?? 0) - (stan.trening?.[b] ?? 0));
}

export function zapiszTrening(stan: StanNauki, kartaId: string, teraz: number): StanNauki {
  return { ...stan, trening: { ...stan.trening, [kartaId]: teraz } };
}

/** Najpierw najsłabszy wynik serii, potem najbliższa powtórka. */
export function wybierzTrening(stan: StanNauki, lekcje: Lekcja[], teraz: number): Lekcja | null {
  return lekcje
    .filter((l) => ['przerobiona', 'utrwalona'].includes(postep(stan, l).status) && kartyTreningu(stan, l, teraz).length > 0)
    .sort((a, b) => {
      const pa = postep(stan, a);
      const pb = postep(stan, b);
      return pa.zrobione / pa.razem - pb.zrobione / pb.razem
        || (terminPowtorki(stan, a.skillId) ?? Infinity) - (terminPowtorki(stan, b.skillId) ?? Infinity);
    })[0] ?? null;
}

export function nowaLekcja(): StanLekcji {
  return { pozycja: 0, wstawione: [], wyniki: {}, seria: 0, samodzielnosc: 0, odStopu: 0, ukonczona: null };
}

export function stanLekcji(stan: StanNauki, skillId: string): StanLekcji {
  return stan.lekcje[skillId] ?? nowaLekcja();
}

// ------------------------------------------------------------------ nauka

/** Czy kartę serii można pominąć przy obecnej samodzielności. */
function pomijalna(k: Karta, s: StanLekcji): boolean {
  if (s.wyniki[k.id]?.pierwsza !== undefined && s.wyniki[k.id]?.pierwsza !== null) return false;
  if (s.samodzielnosc >= 2) return k.etap !== 'zadanie' && k.etap !== 'pomocnicze';
  if (s.samodzielnosc >= 1) return k.rusztowanie === true;
  return false;
}

/** Bieżąca karta serii albo null, gdy seria jest skończona. */
export function biezaca(stan: StanNauki, l: Lekcja): Karta | null {
  const s = stanLekcji(stan, l.skillId);
  if (s.wstawione.length > 0) return karta(l, s.wstawione[0] as string);
  for (let i = s.pozycja; i < l.seria.length; i++) {
    const k = karta(l, l.seria[i] as string);
    if (!pomijalna(k, s)) return k;
  }
  return null;
}

/** Numer kroku do pokazania „krok 3 z 9” — pozycja w serii, nie liczba kart. */
export function numerKroku(stan: StanNauki, l: Lekcja, kartaId: string): { krok: number; z: number } {
  const i = l.seria.indexOf(kartaId);
  const s = stanLekcji(stan, l.skillId);
  return { krok: (i >= 0 ? i : s.pozycja) + 1, z: l.seria.length };
}

export interface Zdarzenie {
  /** Krótki komunikat silnika dla ucznia (np. „Wracamy o krok”). */
  komunikat: string | null;
  /** Punkt zakończenia: uczeń może skończyć albo iść dalej. */
  stop: boolean;
  /** Seria właśnie się skończyła. */
  koniecSerii: boolean;
}

function przesun(s: StanLekcji, l: Lekcja, kartaId: string): void {
  if (s.wstawione[0] === kartaId) {
    s.wstawione = s.wstawione.slice(1);
    // Powtórzony krok serii (po łatwiejszym) zamyka też swoje miejsce w serii.
    if (l.seria[s.pozycja] !== kartaId) return;
  }
  const i = l.seria.indexOf(kartaId);
  s.pozycja = Math.max(s.pozycja, i >= 0 ? i + 1 : s.pozycja + 1);
}

/** Odpowiedź na kartę serii. Zwraca nowy stan (niezmienny) i zdarzenie. */
export function odpowiedz(
  stan: StanNauki,
  l: Lekcja,
  kartaId: string,
  poprawna: boolean,
  teraz: number,
): { stan: StanNauki; zdarzenie: Zdarzenie } {
  const s: StanLekcji = structuredClone(stanLekcji(stan, l.skillId));
  const k = karta(l, kartaId);
  const w = s.wyniki[kartaId] ?? { proby: 0, pierwsza: null };
  const pierwszaProba = w.pierwsza === null;
  w.proby += 1;
  if (pierwszaProba) w.pierwsza = poprawna;
  if (poprawna) w.zaliczona = true;
  s.wyniki[kartaId] = w;
  s.odStopu += 1;

  let komunikat: string | null = null;

  if (poprawna) {
    if (pierwszaProba) s.seria += 1;
    przesun(s, l, kartaId);
    if (s.seria >= PRZYSPIESZ_PO && s.samodzielnosc < 2 && k.etap !== 'zadanie') {
      s.samodzielnosc = (s.samodzielnosc + 1) as 1 | 2;
      s.seria = 0;
      komunikat =
        s.samodzielnosc === 1
          ? 'Idzie Ci dobrze — pomijam kroki pomocnicze.'
          : 'Świetnie — przejdźmy od razu do całego zadania.';
    }
  } else {
    s.seria = 0;
    if (s.samodzielnosc > 0) s.samodzielnosc = (s.samodzielnosc - 1) as 0 | 1;
    const latwiejsza = k.latwiejsza;
    if (latwiejsza && !s.wstawione.includes(latwiejsza) && w.proby === 1) {
      // Łatwiejszy krok, a potem jeszcze raz ten sam krok.
      const reszta = s.wstawione[0] === kartaId ? s.wstawione.slice(1) : s.wstawione;
      s.wstawione = [latwiejsza, kartaId, ...reszta];
      komunikat = 'Wracamy o krok — najpierw łatwiejsza część tego samego zadania.';
    } else if (w.proby >= 2) {
      // Druga nieudana próba: pokazujemy wyjaśnienie i idziemy dalej, bez punktu.
      przesun(s, l, kartaId);
      komunikat = 'Zostawiamy ten krok — wróci w powtórce.';
    } else {
      komunikat = 'Spróbuj jeszcze raz — przeczytaj wyjaśnienie.';
    }
  }

  const nowy: StanNauki = { ...stan, lekcje: { ...stan.lekcje, [l.skillId]: s } };
  const zostala = biezaca(nowy, l);
  let koniecSerii = false;
  if (!zostala && s.ukonczona === null) {
    s.ukonczona = teraz;
    koniecSerii = true;
    nowy.powtorki = { ...nowy.powtorki, [l.skillId]: zaplanuj(nowy.powtorki[l.skillId], ocenaSerii(s, l), teraz, false) };
  }
  const stop = !koniecSerii && (k.etap === 'zadanie' || s.odStopu >= STOP_CO) && zostala !== null;
  if (stop) s.odStopu = 0;
  return { stan: nowy, zdarzenie: { komunikat, stop, koniecSerii } };
}

/** Pominięcie: karta przechodzi dalej, ale bez żadnego postępu. */
export function pomin(stan: StanNauki, l: Lekcja, kartaId: string): StanNauki {
  const s: StanLekcji = structuredClone(stanLekcji(stan, l.skillId));
  if (!s.wyniki[kartaId]) s.wyniki[kartaId] = { proby: 0, pierwsza: null, pominieta: true };
  przesun(s, l, kartaId);
  return { ...stan, lekcje: { ...stan.lekcje, [l.skillId]: s } };
}

/** Ocena całej serii dla planisty powtórek — o wyniku decyduje całe zadanie. */
function ocenaSerii(s: StanLekcji, l: Lekcja): Grade {
  const zadanie = l.seria.map((id) => karta(l, id)).find((k) => k.etap === 'zadanie');
  const wynik = zadanie ? s.wyniki[zadanie.id] : undefined;
  if (!wynik || wynik.pierwsza === null) return Rating.Again;
  if (!wynik.pierwsza) return wynik.proby > 1 ? Rating.Hard : Rating.Again;
  return s.samodzielnosc >= 1 ? Rating.Good : Rating.Good;
}

// ------------------------------------------------------------------ powtórki (FSRS)

function doKarty(zapis: Record<string, unknown> | undefined, teraz: number): Card {
  if (!zapis) return createEmptyCard(new Date(teraz));
  const c = zapis as unknown as Card & { due: string | Date; last_review?: string | Date };
  return {
    ...c,
    due: new Date(c.due),
    ...(c.last_review ? { last_review: new Date(c.last_review) } : {}),
  } as Card;
}

function zaplanuj(prev: StanPowtorki | undefined, ocena: Grade, teraz: number, zPowtorki: boolean): StanPowtorki {
  const karta = doKarty(prev?.fsrs, teraz);
  const { card } = planista.next(karta, new Date(teraz), ocena);
  const poPrzerwie = prev !== undefined && teraz - prev.ostatnio >= PRZERWA_MS;
  const udane = (prev?.udanePoPrzerwie ?? 0) + (zPowtorki && poPrzerwie && ocena >= Rating.Good ? 1 : 0);
  return {
    fsrs: JSON.parse(JSON.stringify(card)) as Record<string, unknown>,
    udanePoPrzerwie: udane,
    ostatnio: teraz,
    sesja: null,
  };
}

/** Termin najbliższej powtórki (ms) albo null. */
export function terminPowtorki(stan: StanNauki, skillId: string): number | null {
  const p = stan.powtorki[skillId];
  if (!p) return null;
  const due = (p.fsrs as { due?: string }).due;
  return due ? new Date(due).getTime() : null;
}

export function powtorkaNaTeraz(stan: StanNauki, skillId: string, teraz: number): boolean {
  const t = terminPowtorki(stan, skillId);
  return t !== null && t <= teraz;
}

/** Bieżąca karta sesji powtórki. */
export function biezacaPowtorka(stan: StanNauki, l: Lekcja): Karta | null {
  const p = stan.powtorki[l.skillId];
  const sesja = p?.sesja ?? { pozycja: 0, bledy: 0, wstawione: [] };
  if (sesja.wstawione.length > 0) return karta(l, sesja.wstawione[0] as string);
  const id = l.powtorka[sesja.pozycja];
  return id ? karta(l, id) : null;
}

export function odpowiedzPowtorka(
  stan: StanNauki,
  l: Lekcja,
  kartaId: string,
  poprawna: boolean,
  teraz: number,
): { stan: StanNauki; zdarzenie: Zdarzenie } {
  const prev = stan.powtorki[l.skillId];
  if (!prev) return { stan, zdarzenie: { komunikat: null, stop: false, koniecSerii: false } };
  const sesja = structuredClone(prev.sesja ?? { pozycja: 0, bledy: 0, wstawione: [] });
  const k = karta(l, kartaId);
  let komunikat: string | null = null;
  if (sesja.wstawione[0] === kartaId) {
    sesja.wstawione = sesja.wstawione.slice(1);
  } else {
    if (!poprawna) {
      sesja.bledy += 1;
      if (k.latwiejsza) sesja.wstawione = [k.latwiejsza];
      komunikat = 'Wracamy do tego kroku w łatwiejszej wersji.';
    }
    sesja.pozycja += 1;
  }
  const koniec = sesja.wstawione.length === 0 && sesja.pozycja >= l.powtorka.length;
  let nowa: StanPowtorki;
  if (koniec) {
    const ocena: Grade = sesja.bledy === 0 ? Rating.Good : sesja.bledy === 1 ? Rating.Hard : Rating.Again;
    nowa = zaplanuj(prev, ocena, teraz, true);
    komunikat = ocena >= Rating.Good ? 'Powtórka udana — kolejna za kilka dni.' : 'Powtórka wróci szybciej.';
  } else {
    nowa = { ...prev, sesja };
  }
  return {
    stan: { ...stan, powtorki: { ...stan.powtorki, [l.skillId]: nowa } },
    zdarzenie: { komunikat, stop: false, koniecSerii: koniec },
  };
}

// ------------------------------------------------------------------ postęp

export type Status = 'nowa' | 'w trakcie' | 'przerobiona' | 'utrwalona';

export interface Postep {
  status: Status;
  /** Kroki serii zaliczone poprawną odpowiedzią (pominięte i błędne się nie liczą). */
  zrobione: number;
  razem: number;
  /** Udane powtórki po przerwie (miara pamięci); 2 = utrwalona. */
  utrwalenie: number;
}

export function postep(stan: StanNauki, l: Lekcja): Postep {
  const s = stan.lekcje[l.skillId];
  const zrobione = s ? l.seria.filter((id) => s.wyniki[id]?.zaliczona === true).length : 0;
  const utrwalenie = stan.powtorki[l.skillId]?.udanePoPrzerwie ?? 0;
  const status: Status = !s
    ? 'nowa'
    : utrwalenie >= 2
      ? 'utrwalona'
      : s.ukonczona !== null
        ? 'przerobiona'
        : 'w trakcie';
  return { status, zrobione, razem: l.seria.length, utrwalenie };
}

/** Trudności ucznia w tej lekcji — dla nauczyciela AI. */
export function trudnosci(stan: StanNauki, l: Lekcja): string[] {
  const s = stan.lekcje[l.skillId];
  if (!s) return [];
  return Object.entries(s.wyniki)
    .filter(([, w]) => w.pierwsza === false)
    .map(([id]) => karta(l, id).pytanie);
}

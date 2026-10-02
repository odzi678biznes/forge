import type { Lekcja } from './typy';
import { karta } from './lekcje';
import type { DecyzjaKorepetytora, StanNauki, Tempo } from './silnik';
import type { KontekstNauczyciela, RaportKorepetytora } from './nauczyciel-kontekst';
import { statusNauczyciela, zapytajNauczyciela } from './nauczyciel-klient';

/**
 * Korepetytor w tle: co kilka kroków patrzy na trafność i czas odpowiedzi
 * i decyduje o tempie — łatwiej, tak samo albo trudniej.
 *
 * Decyzję podejmuje AI (gdy jest dostępne), ale zawsze w granicach trzech
 * dozwolonych wartości; bez AI działa ta sama logika na regułach. Czas
 * dłuższy niż 3 minuty na kartę to przerwa — nie wchodzi do raportu.
 */

const OSTATNIE = 8;

export function raportKorepetytora(stan: StanNauki, l: Lekcja, przedmiot: string): RaportKorepetytora {
  const s = stan.lekcje[l.skillId];
  const wpisy = s
    ? Object.entries(s.wyniki)
        .filter(([, w]) => w.pierwsza !== null && !w.pominieta)
        .slice(-OSTATNIE)
        .map(([id, w]) => {
          const k = karta(l, id);
          return {
            krok: k.pytanie.slice(0, 160),
            etap: k.etap,
            poprawnaZaPierwszym: w.pierwsza === true,
            proby: w.proby,
            czasS: w.czas !== undefined ? Math.round(w.czas / 1000) : null,
          };
        })
    : [];
  return {
    przedmiot,
    lekcja: l.tytul,
    samodzielnosc: s?.samodzielnosc ?? 0,
    odpowiedzi: wpisy,
    ...(stan.korepetytor ? { poprzednie: stan.korepetytor.tempo } : {}),
  };
}

const KOMENTARZ: Record<Tempo, string> = {
  trudniej: 'Idzie Ci pewnie i szybko — zdejmuję kolejne podpórki.',
  'tak-samo': 'Dobre tempo — zostajemy na tym poziomie.',
  latwiej: 'Zwolnijmy — wracam do mniejszych kroków. Trudniejsze wróci w powtórce.',
};

/** Ta sama decyzja na regułach — gdy AI jest niedostępne albo odpowie nie na temat. */
export function decyzjaRegul(r: RaportKorepetytora, teraz: number): DecyzjaKorepetytora {
  const o = r.odpowiedzi.slice(-6);
  const tempo = ((): Tempo => {
    if (o.length < 3) return 'tak-samo';
    const trafnosc = o.filter((x) => x.poprawnaZaPierwszym).length / o.length;
    const czasy = o.filter((x) => x.poprawnaZaPierwszym && x.czasS !== null).map((x) => x.czasS as number).sort((a, b) => a - b);
    const mediana = czasy.length ? czasy[Math.floor(czasy.length / 2)]! : null;
    if (trafnosc < 0.5) return 'latwiej';
    if (trafnosc >= 0.85 && (mediana === null || mediana <= 30)) return 'trudniej';
    return 'tak-samo';
  })();
  return { tempo, komentarz: KOMENTARZ[tempo], zrodlo: 'reguly', kiedy: teraz };
}

/** Odpowiedź modelu: JSON {"tempo": …, "komentarz": …}; wszystko inne odrzucamy. */
export function czytajDecyzje(tekst: string, teraz: number): DecyzjaKorepetytora | null {
  const m = /\{[\s\S]*\}/.exec(tekst);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]) as { tempo?: unknown; komentarz?: unknown };
    if (o.tempo !== 'latwiej' && o.tempo !== 'tak-samo' && o.tempo !== 'trudniej') return null;
    const komentarz = typeof o.komentarz === 'string' ? o.komentarz.trim().slice(0, 240) : '';
    return { tempo: o.tempo, komentarz: komentarz || KOMENTARZ[o.tempo], zrodlo: 'ai', kiedy: teraz };
  } catch {
    return null;
  }
}

export async function zapytajKorepetytora(r: RaportKorepetytora): Promise<DecyzjaKorepetytora> {
  const teraz = Date.now();
  const zapas = decyzjaRegul(r, teraz);
  if (r.odpowiedzi.length < 3) return zapas;
  const s = await statusNauczyciela();
  if (!s.dostepny) return zapas;
  // Serwer wymaga kontekstu kroku — tu jest nim cała lekcja.
  const kontekst: KontekstNauczyciela = {
    przedmiot: r.przedmiot,
    lekcja: r.lekcja,
    zadanie: null,
    krok: { etap: 'podsumowanie', numer: 1, z: 1, pytanie: 'Ocena tempa nauki', wyjasnienie: '-' },
    odpowiedzUcznia: null,
    czyPoprawna: null,
    trudnosci: r.odpowiedzi.filter((x) => !x.poprawnaZaPierwszym).map((x) => x.krok),
  };
  const o = await zapytajNauczyciela(kontekst, 'korepetytor', [], undefined, r);
  return (o.tryb === 'ai' && czytajDecyzje(o.tekst, teraz)) || zapas;
}

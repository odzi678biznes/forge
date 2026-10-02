import { wartosc } from '../sprawdz';
import type { Diagnoza, Interakcja } from './typy';
import { czytelne, rownowazne } from './wyrazenia';

/**
 * Ocena odpowiedzi w sesji — zawsze lokalnie i natychmiast (zero tokenów).
 * AI tłumaczy, ale nie decyduje o poprawności.
 */

export interface Ocena {
  poprawna: boolean;
  /** Rozpoznany błąd (typowa zła odpowiedź) albo null. */
  diagnoza: Diagnoza | null;
  /** Wpis nieczytelny — prosimy o poprawienie zapisu, próba się nie liczy. */
  nieczytelne?: boolean;
  /** Odpowiedź ucznia jako tekst — do historii i dla nauczyciela AI. */
  tekst: string;
}

export function ocenWybor(i: Interakcja & { typ: 'wybor' }, wybrana: number): Ocena {
  return {
    poprawna: wybrana === i.poprawna,
    diagnoza: wybrana === i.poprawna ? null : (i.bledne?.[wybrana] ?? null),
    tekst: i.opcje[wybrana] ?? '',
  };
}

export function ocenWpis(i: Interakcja, wpis: string): Ocena {
  const tekst = wpis.trim();
  if (i.typ === 'wyrazenie') {
    if (!czytelne(tekst, i.zmienna)) return { poprawna: false, diagnoza: null, nieczytelne: true, tekst };
    if (rownowazne(tekst, i.oczekiwane, i.zmienna)) return { poprawna: true, diagnoza: null, tekst };
    const typowy = i.typowe?.find((t) => rownowazne(tekst, t.wyrazenie, i.zmienna));
    return { poprawna: false, diagnoza: typowy ? diagnozaZ(typowy) : null, tekst };
  }
  if (i.typ === 'liczba') {
    const v = wartosc(tekst);
    if (v === null) return { poprawna: false, diagnoza: null, nieczytelne: true, tekst };
    const blisko = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
    if (blisko(v, i.wartosc)) return { poprawna: true, diagnoza: null, tekst };
    const typowy = i.typowe?.find((t) => blisko(v, t.wartosc));
    return { poprawna: false, diagnoza: typowy ? diagnozaZ(typowy) : null, tekst };
  }
  return { poprawna: false, diagnoza: null, nieczytelne: true, tekst };
}

function diagnozaZ(d: Diagnoza): Diagnoza {
  return { komunikat: d.komunikat, ...(d.misconception ? { misconception: d.misconception } : {}) };
}

/** Poprawna odpowiedź w czytelnej formie — po rezygnacji albo dla AI. */
export function poprawnaOdpowiedz(i: Interakcja): string {
  if (i.typ === 'wybor') return i.opcje[i.poprawna] ?? '';
  if (i.typ === 'wyrazenie') return `$${i.oczekiwane.replace(/\*/g, '\\cdot ')}$`;
  return String(i.wartosc).replace('.', ',');
}

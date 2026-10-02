import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Figure } from '@/components/Figure';
import { Math as Tex } from '@/components/Math';
import type { KontekstNauczyciela } from '../nauczyciel-kontekst';

/** Główna akcja aktywności trafia do stałego miejsca pod kciukiem. */
export function Akcja({ children, onClick, disabled = false, wtorna = false }: { children: ReactNode; onClick: () => void; disabled?: boolean; wtorna?: boolean }) {
  const [cel, setCel] = useState<HTMLElement | null>(null);
  useEffect(() => setCel(document.getElementById('sesja-akcja')), []);
  const b = (
    <button type="button" className={`btn ${wtorna ? '' : 'btn--primary'} sesja__akcja`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
  return cel ? createPortal(b, cel) : b;
}

/** Opis bieżącej sytuacji dla nauczyciela AI — aktywność zgłasza go kontenerowi. */
export interface OpisPomocy {
  aktywnosc: string;
  skill: string;
  krok: KontekstNauczyciela['krok'];
  odpowiedzUcznia: string | null;
  czyPoprawna: boolean | null;
  podpowiedzi: string[];
  pokazane: number;
  przyklad?: string;
  proby: string[];
  diagnoza?: string;
  /** Gotowe pytania do tego miejsca, np. „Dlaczego używamy tutaj delty?”. */
  sugestie: string[];
}

export type ZglosPomoc = (o: OpisPomocy) => void;

/** Mała parabola y = ax² + bx + c — rysunek z istniejącego komponentu Figure. */
export function Parabola({ a, b, c, podpis }: { a: number; b: number; c: number; podpis: string }) {
  return (
    <Figure
      figure={{
        kind: 'plot',
        alt: `Wykres ${podpis}: parabola y = ${a}x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`,
        x: [-4, 4],
        y: [-5, 5],
        curves: [{ fn: (x) => a * x * x + b * x + c }],
      }}
    />
  );
}

/** Opcje wyboru: duże pola, tap = odpowiedź (mikro i speed) albo wybór (deep). */
export function Opcje({
  opcje,
  wybrana,
  bledne,
  poprawna,
  zablokowane,
  onWybierz,
  wykresy,
  ziarno,
}: {
  /** Kolejność wyświetlania mieszana po tym ziarnie (stała dla zadania); wykresów nie mieszamy (litery A–D). */
  ziarno?: string;
  opcje: string[];
  wybrana: number | null;
  bledne: number[];
  poprawna: number | null;
  zablokowane: boolean;
  onWybierz: (i: number) => void;
  wykresy?: Array<{ a: number; b: number; c: number }>;
}) {
  const kolejnosc = ziarno && !wykresy ? tasujIndeksy(opcje.length, ziarno) : opcje.map((_, i) => i);
  return (
    <div className={`sesja-opcje${wykresy ? ' sesja-opcje--wykresy' : ''}`} role="group" aria-label="Odpowiedzi">
      {kolejnosc.map((i) => {
        const o = opcje[i]!;
        const stan = poprawna === i ? ' sesja-opcja--ok' : bledne.includes(i) ? ' sesja-opcja--zle' : wybrana === i ? ' sesja-opcja--wybrana' : '';
        return (
          <button
            key={i}
            type="button"
            className={`sesja-opcja${stan}`}
            aria-pressed={wybrana === i}
            disabled={zablokowane || bledne.includes(i)}
            onClick={() => onWybierz(i)}
          >
            {wykresy?.[i] ? (
              <>
                <span className="sesja-opcja__litera">{o}</span>
                <Parabola {...wykresy[i]!} podpis={o} />
              </>
            ) : (
              <Tex>{o}</Tex>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Deterministyczne tasowanie — poprawna odpowiedź nie stoi zawsze na tym samym miejscu. */
export function tasujIndeksy(n: number, ziarno: string): number[] {
  let h = 2166136261;
  for (const c of ziarno) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345;
    const j = Math.abs(h) % (i + 1);
    [idx[i], idx[j]] = [idx[j] as number, idx[i] as number];
  }
  return idx;
}

/** Formatowanie czasu: „7,2 s”. */
export const sekundy = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Karta przesuwana palcem: prawo / lewo. Ruch palca ustawia transformację
 * bezpośrednio na elemencie (bez stanu Reacta), więc karta podąża za palcem
 * bez opóźnienia. Odlot animuje osobna „kopia”, a następna karta jest od
 * razu aktywna — nie czekamy na koniec animacji.
 *
 * Dostępność: te same decyzje dają przyciski pod kartą i klawisze ← →.
 */

export type Kierunek = 'lewo' | 'prawo';

export interface KartaSwipeDane {
  id: string;
  przod: ReactNode;
  /** Brak tyłu — kartę można przesunąć od razu (np. prawda/fałsz). */
  tyl?: ReactNode;
}

interface KartaProps {
  karta: KartaSwipeDane;
  odwrocona: boolean;
  onTap: () => void;
  onSwipe: (k: Kierunek, x: number) => void;
  /** Przesuwać można dopiero po odwróceniu karty z tyłem. */
  mozna: boolean;
  etykiety: Record<Kierunek, string>;
}

export interface UchwytKarty {
  rzuc: (k: Kierunek) => void;
}

const PROG_ODLEGLOSCI = 0.28;
const PROG_PREDKOSCI = 0.55; // px/ms

const KartaSwipe = forwardRef<UchwytKarty, KartaProps>(function KartaSwipe({ karta, odwrocona, onTap, onSwipe, mozna, etykiety }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const gest = useRef<{ x: number; y: number; t: number; id: number; ciagnie: boolean; anulowany: boolean } | null>(null);
  const ostatnieX = useRef(0);

  const ustaw = (dx: number, przejscie: boolean) => {
    const e = el.current;
    if (!e) return;
    e.style.transition = przejscie ? 'transform 200ms cubic-bezier(.2,.7,.3,1)' : 'none';
    e.style.transform = dx === 0 ? '' : `translate3d(${dx}px,0,0) rotate(${dx / 18}deg)`;
    e.style.setProperty('--p', String(Math.max(-1, Math.min(1, dx / 110))));
  };

  useImperativeHandle(ref, () => ({ rzuc: (k) => onSwipe(k, k === 'prawo' ? 40 : -40) }), [onSwipe]);

  return (
    <div
      ref={el}
      className={`swipe__karta${odwrocona ? ' swipe__karta--odwrocona' : ''}`}
      style={{ '--p': 0 } as CSSProperties}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest('a, button, details')) return;
        gest.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, ciagnie: false, anulowany: false };
        if (e.pointerType === 'mouse') el.current?.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const g = gest.current;
        if (!g || g.id !== e.pointerId || g.anulowany) return;
        const dx = e.clientX - g.x;
        const dy = e.clientY - g.y;
        if (!g.ciagnie) {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            g.anulowany = true; // przewijanie w pionie — nie przejmujemy gestu
            return;
          }
          if (Math.abs(dx) < 8) return;
          g.ciagnie = true;
          el.current?.setPointerCapture(e.pointerId);
        }
        ostatnieX.current = dx;
        // Przed odwróceniem: opór — karta drgnie, ale nie odleci.
        ustaw(mozna ? dx : dx * 0.25, false);
      }}
      onPointerUp={(e) => {
        const g = gest.current;
        gest.current = null;
        if (!g || g.id !== e.pointerId) return;
        if (!g.ciagnie) {
          if (!g.anulowany) onTap();
          return;
        }
        const dx = ostatnieX.current;
        const v = Math.abs(dx) / Math.max(1, performance.now() - g.t);
        const szer = el.current?.offsetWidth ?? 320;
        if (mozna && (Math.abs(dx) > szer * PROG_ODLEGLOSCI || (v > PROG_PREDKOSCI && Math.abs(dx) > 40))) {
          ustaw(0, false);
          onSwipe(dx > 0 ? 'prawo' : 'lewo', dx);
        } else {
          ustaw(0, true);
        }
      }}
      onPointerCancel={() => {
        gest.current = null;
        ustaw(0, true);
      }}
    >
      <TrescKarty karta={karta} etykiety={etykiety} />
    </div>
  );
});

function TrescKarty({ karta, etykiety }: { karta: KartaSwipeDane; etykiety: Record<Kierunek, string> }) {
  return (
    <>
      <div className="swipe__obrot">
        <div className="swipe__strona swipe__strona--przod">{karta.przod}</div>
        {karta.tyl && <div className="swipe__strona swipe__strona--tyl">{karta.tyl}</div>}
      </div>
      <span className="swipe__nakladka swipe__nakladka--tak" aria-hidden>✓ {etykiety.prawo}</span>
      <span className="swipe__nakladka swipe__nakladka--nie" aria-hidden>✕ {etykiety.lewo}</span>
    </>
  );
}

interface TaliaProps {
  karty: KartaSwipeDane[];
  etykiety: Record<Kierunek, string>;
  onDecyzja: (karta: KartaSwipeDane, k: Kierunek, czasMs: number) => void;
  /** Podpowiedź pod kartą przed odwróceniem. */
  instrukcja?: string;
}

/** Talia: bieżąca karta, następna pod nią, odlatująca kopia na wierzchu. */
export function TaliaSwipe({ karty, etykiety, onDecyzja, instrukcja = 'Dotknij karty, żeby zobaczyć odpowiedź.' }: TaliaProps) {
  const [i, setI] = useState(0);
  const [odwrocona, setOdwrocona] = useState(false);
  const [odloty, setOdloty] = useState<Array<{ klucz: string; karta: KartaSwipeDane; k: Kierunek; x: number; odwrocona: boolean }>>([]);
  const uchwyt = useRef<UchwytKarty>(null);
  const start = useRef(performance.now());
  const karta = karty[i];
  const nastepna = karty[i + 1];
  const mozna = !karta?.tyl || odwrocona;

  useEffect(() => {
    start.current = performance.now();
  }, [i]);

  const decyzja = useCallback(
    (k: Kierunek, x: number) => {
      if (!karta) return;
      try {
        navigator.vibrate?.(8);
      } catch {
        /* wibracja jest opcjonalna */
      }
      setOdloty((o) => [...o, { klucz: `${karta.id}-${Date.now()}`, karta, k, x, odwrocona }]);
      setI((n) => n + 1);
      setOdwrocona(false);
      onDecyzja(karta, k, performance.now() - start.current);
    },
    [karta, odwrocona, onDecyzja],
  );

  useEffect(() => {
    const klawisz = (e: KeyboardEvent) => {
      if (!karta || (e.target as HTMLElement)?.closest('input, textarea, dialog')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (karta.tyl) {
          e.preventDefault();
          setOdwrocona((o) => !o);
        }
      } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && mozna) {
        e.preventDefault();
        decyzja(e.key === 'ArrowRight' ? 'prawo' : 'lewo', 0);
      }
    };
    window.addEventListener('keydown', klawisz);
    return () => window.removeEventListener('keydown', klawisz);
  }, [karta, mozna, decyzja]);

  return (
    <div className="swipe">
      <div className="swipe__stos" aria-live="polite">
        {nastepna && (
          <div className="swipe__karta swipe__karta--pod" aria-hidden>
            <TrescKarty karta={nastepna} etykiety={etykiety} />
          </div>
        )}
        {karta && (
          <KartaSwipe
            key={`${karta.id}-${i}`}
            ref={uchwyt}
            karta={karta}
            odwrocona={odwrocona}
            mozna={mozna}
            etykiety={etykiety}
            onTap={() => karta.tyl && setOdwrocona((o) => !o)}
            onSwipe={decyzja}
          />
        )}
        {odloty.map((o) => (
          <div
            key={o.klucz}
            className={`swipe__karta swipe__odlot swipe__odlot--${o.k}${o.odwrocona ? ' swipe__karta--odwrocona' : ''}`}
            style={{ '--x0': `${o.x}px`, '--r0': `${o.x / 18}deg`, '--p': o.k === 'prawo' ? 1 : -1 } as CSSProperties}
            aria-hidden
            onAnimationEnd={() => setOdloty((l) => l.filter((x) => x.klucz !== o.klucz))}
          >
            <TrescKarty karta={o.karta} etykiety={etykiety} />
          </div>
        ))}
      </div>
      {karta && (
        <>
          <p className="swipe__instrukcja" role="status">
            {mozna ? `Przesuń w prawo — ${etykiety.prawo.toLowerCase()}, w lewo — ${etykiety.lewo.toLowerCase()}.` : instrukcja}
          </p>
          <div className="swipe__przyciski">
            <button type="button" className="swipe__przycisk swipe__przycisk--nie" disabled={!mozna} onClick={() => uchwyt.current?.rzuc('lewo')}>
              <span aria-hidden>✕</span> {etykiety.lewo}
            </button>
            {karta.tyl && !odwrocona && (
              <button type="button" className="swipe__przycisk swipe__przycisk--obroc" onClick={() => setOdwrocona(true)}>
                Odwróć
              </button>
            )}
            <button type="button" className="swipe__przycisk swipe__przycisk--tak" disabled={!mozna} onClick={() => uchwyt.current?.rzuc('prawo')}>
              <span aria-hidden>✓</span> {etykiety.prawo}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

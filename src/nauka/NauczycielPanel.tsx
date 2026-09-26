import { useEffect, useRef, useState } from 'react';
import { Math as Tex } from '@/components/Math';
import type { KontekstNauczyciela, Prosba, StatusNauczyciela, WiadomoscCzatu } from './nauczyciel-kontekst';
import { PROSBA_TEKST } from './nauczyciel-kontekst';
import { statusNauczyciela, zapytajNauczyciela } from './nauczyciel-klient';

/**
 * „Zapytaj nauczyciela” — przy każdej karcie. Najpierw pomoc w następnym
 * kroku; pełne rozwiązanie tylko na wyraźną prośbę. Tryb demonstracyjny jest
 * zawsze wyraźnie oznaczony i mówi, czego brakuje do prawdziwego nauczyciela.
 */

interface Props {
  kontekst: KontekstNauczyciela;
  onZamknij: () => void;
}

interface Wpis extends WiadomoscCzatu {
  tryb?: 'ai' | 'demo';
}

const SZYBKIE: Exclude<Prosba, 'pytanie'>[] = ['nastepny-krok', 'nie-rozumiem', 'skad', 'inaczej'];

export function NauczycielPanel({ kontekst, onZamknij }: Props) {
  const [status, setStatus] = useState<StatusNauczyciela | null>(null);
  const [czat, setCzat] = useState<Wpis[]>([]);
  const [pytanie, setPytanie] = useState('');
  const [czeka, setCzeka] = useState(false);
  const [powod, setPowod] = useState<string | null>(null);
  const koniec = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void statusNauczyciela().then(setStatus);
  }, []);
  useEffect(() => {
    koniec.current?.scrollIntoView({ block: 'end' });
  }, [czat, czeka]);

  const zapytaj = async (prosba: Prosba, wlasne?: string) => {
    const tekstUcznia = prosba === 'pytanie' ? (wlasne ?? '') : PROSBA_TEKST[prosba];
    const historia = czat.map(({ rola, tekst }) => ({ rola, tekst }));
    setCzat((c) => [...c, { rola: 'uczen', tekst: tekstUcznia }]);
    setCzeka(true);
    const o = await zapytajNauczyciela(kontekst, prosba, historia, wlasne);
    setCzeka(false);
    if (o.powod) setPowod(o.powod);
    setCzat((c) => [...c, { rola: 'nauczyciel', tekst: o.tekst, tryb: o.tryb }]);
  };

  const ai = status?.dostepny === true;

  return (
    <div className="nauczyciel" role="dialog" aria-modal="true" aria-label="Nauczyciel" data-bez-gestu>
      <header className="nauczyciel__glowa">
        <div>
          <p className="nauczyciel__tytul">Nauczyciel</p>
          <p className={`nauczyciel__tryb${ai ? '' : ' nauczyciel__tryb--demo'}`}>
            {status === null ? 'Sprawdzam…' : ai ? `Nauczyciel AI · ${status.model ?? ''}` : 'Tryb demonstracyjny — to nie jest AI'}
          </p>
        </div>
        <button type="button" className="btn btn--small" onClick={onZamknij} aria-label="Zamknij nauczyciela">
          Zamknij
        </button>
      </header>

      {status && !ai && (
        <p className="nauczyciel__demo">
          Odpowiedzi składam z podpowiedzi i oficjalnego rozwiązania zapisanych przy tej karcie. {powod ?? status.powod}{' '}
          Prawdziwy nauczyciel działa po uruchomieniu serwera z kluczem API (<code>ANTHROPIC_API_KEY</code>, <code>npm run dev</code>).
        </p>
      )}

      <div className="nauczyciel__czat" aria-live="polite">
        {czat.length === 0 && (
          <p className="karta__uwaga">
            Znam zadanie{kontekst.zadanie ? ` (${kontekst.zadanie.zrodlo}, zad. ${kontekst.zadanie.numer})` : ''}, ten krok i Twoją
            odpowiedź. Zacznę od następnego kroku — pełne rozwiązanie pokażę, gdy o nie poprosisz.
          </p>
        )}
        {czat.map((w, i) => (
          <div key={i} className={`dymek dymek--${w.rola}`}>
            {w.tryb === 'demo' && <span className="dymek__demo">demo</span>}
            {w.tekst.split('\n').map((l, j) => (
              <p key={j}>
                <Tex>{l}</Tex>
              </p>
            ))}
          </div>
        ))}
        {czeka && <div className="dymek dymek--nauczyciel dymek--czeka">…</div>}
        <div ref={koniec} />
      </div>

      <div className="nauczyciel__szybkie">
        {SZYBKIE.map((p) => (
          <button key={p} type="button" className="btn btn--small" disabled={czeka} onClick={() => void zapytaj(p)}>
            {PROSBA_TEKST[p]}
          </button>
        ))}
        <button type="button" className="btn btn--small nauczyciel__pelne" disabled={czeka} onClick={() => void zapytaj('pelne')}>
          {PROSBA_TEKST.pelne}
        </button>
      </div>

      <form
        className="nauczyciel__pytanie"
        onSubmit={(e) => {
          e.preventDefault();
          const p = pytanie.trim();
          if (!p || czeka) return;
          setPytanie('');
          void zapytaj('pytanie', p);
        }}
      >
        <input
          value={pytanie}
          onChange={(e) => setPytanie(e.target.value)}
          placeholder="Własne pytanie…"
          aria-label="Własne pytanie do nauczyciela"
          enterKeyHint="send"
        />
        <button type="submit" className="btn btn--primary btn--small" disabled={!pytanie.trim() || czeka}>
          Wyślij
        </button>
      </form>
    </div>
  );
}

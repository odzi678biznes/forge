import { useEffect, useRef, useState } from 'react';
import { Math as Tex } from '@/components/Math';
import type { KontekstNauczyciela, Prosba, StatusNauczyciela, WiadomoscCzatu } from './nauczyciel-kontekst';
import { PROSBA_TEKST } from './nauczyciel-kontekst';
import { odswiezStatusNauczyciela, statusNauczyciela, ustawKodNauczyciela, zapytajNauczyciela } from './nauczyciel-klient';
import { ModalPanel } from '@/components/ModalPanel';
import { Sformatowane } from './Sformatowane';

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


export function NauczycielPanel({ kontekst, onZamknij }: Props) {
  const [status, setStatus] = useState<StatusNauczyciela | null>(null);
  const [czat, setCzat] = useState<Wpis[]>([]);
  const [pytanie, setPytanie] = useState('');
  const [czeka, setCzeka] = useState(false);
  const [powod, setPowod] = useState<string | null>(null);
  const [kod, setKod] = useState('');
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
    setPowod(o.powod ?? null);
    if (o.tryb === 'ai') setStatus({dostepny:true,model:o.model,powod:null});
    else if (o.powod) setStatus({dostepny:false,model:null,powod:o.powod});
    setCzat((c) => [...c, { rola: 'nauczyciel', tekst: o.tekst, tryb: o.tryb }]);
  };

  const ai = status?.dostepny === true;

  return (
    <ModalPanel className="nauczyciel" label="Nauczyciel" onClose={onZamknij}>
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
        <div className="nauczyciel__demo">
          <p>AI jest niedostępne. Możesz korzystać z podpowiedzi i rozwiązania zapisanych przy tej karcie.</p>
          {status.wymagaKodu && <form onSubmit={async e => {
            e.preventDefault(); ustawKodNauczyciela(kod); setKod('');
            setStatus(null); setStatus(await odswiezStatusNauczyciela());
          }}>
            <label htmlFor="teacher-code">Twój kod dostępu do nauczyciela</label>
            <input id="teacher-code" type="password" autoComplete="current-password" value={kod} onChange={e => setKod(e.target.value)} />
            <button type="submit" className="btn btn--primary" disabled={!kod.trim()}>Połącz z nauczycielem</button>
            <p>Kod dostępu otrzymasz przy uruchomieniu nauczyciela. Nie wpisuj tutaj klucza API Anthropic.</p>
          </form>}
          <button type="button" className="btn btn--small" disabled={czeka} onClick={async()=>{
            setStatus(null); setPowod(null); setStatus(await odswiezStatusNauczyciela());
          }}>Sprawdź połączenie ponownie</button>
          <details><summary>Konfiguracja i szczegóły techniczne</summary>
            <p>{powod ?? status.powod}</p>
            <p>Nauczyciel AI wymaga serwera z kluczem <code>ANTHROPIC_API_KEY</code> (<code>npm run dev</code>).</p>
          </details>
        </div>
      )}

      <div className="nauczyciel__czat" aria-live="polite">
        {czat.length === 0 && (
          <div className="nauczyciel__start">
            <p className="karta__uwaga">Widzę to zadanie i Twoją odpowiedź. Napisz, czego nie rozumiesz.</p>
            <button type="button" className="btn btn--small" disabled={czeka} onClick={() => void zapytaj('nastepny-krok')}>
              💡 {PROSBA_TEKST['nastepny-krok']}
            </button>
          </div>
        )}
        {czat.map((w, i) => (
          <div key={i} className={`dymek dymek--${w.rola}`}>
            {w.tryb === 'demo' && <span className="dymek__demo">demo</span>}
            {w.rola === 'nauczyciel' ? <Sformatowane tekst={w.tekst} /> : <p><Tex>{w.tekst}</Tex></p>}
          </div>
        ))}
        {czeka && <div className="dymek dymek--nauczyciel dymek--czeka" role="status">Przygotowuję odpowiedź…</div>}
        <div ref={koniec} />
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
          placeholder="Zapytaj o to zadanie…"
          aria-label="Własne pytanie do nauczyciela"
          enterKeyHint="send"
        />
        <button type="submit" className="btn btn--primary btn--small" disabled={!pytanie.trim() || czeka}>
          Wyślij
        </button>
      </form>
    </ModalPanel>
  );
}

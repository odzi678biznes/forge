import { useEffect, useRef, useState } from 'react';
import { Math as Tex } from '@/components/Math';
import type { KontekstNauczyciela, Prosba, StatusNauczyciela } from './nauczyciel-kontekst';
import { PROSBA_TEKST } from './nauczyciel-kontekst';
import { odswiezStatusNauczyciela, statusNauczyciela, zapytajNauczyciela, type Odpowiedz } from './nauczyciel-klient';
import { ModalPanel } from '@/components/ModalPanel';
import { Sformatowane } from './Sformatowane';
import { TeacherConnection } from '@/features/ai/TeacherConnection';
import { beginTeacherRequest, finishTeacherRequest, isTeacherRequestCurrent, changeTeacherConversation, readTeacherConversation, useTeacherConversation } from './teacher-conversation';

/**
 * „Zapytaj nauczyciela” — przy każdej karcie. Najpierw pomoc w następnym
 * kroku; pełne rozwiązanie tylko na wyraźną prośbę. Tryb demonstracyjny jest
 * zawsze wyraźnie oznaczony i mówi, czego brakuje do prawdziwego nauczyciela.
 */

interface Props {
  kontekst: KontekstNauczyciela;
  onZamknij: () => void;
  /** Szybkie prośby (domyślnie zestaw feedu CKE). */
  szybkie?: Exclude<Prosba, 'pytanie' | 'pelne'>[];
  /** Gotowe pytania do tego kroku, np. „Dlaczego używamy tutaj delty?”. */
  sugestie?: string[];
  /** Wywoływane po każdej odpowiedzi — sesja zapisuje użycie AI i rozpoznany błąd. */
  onOdpowiedz?: (o: Odpowiedz, prosba: Prosba) => void;
  /** Wstęp nad czatem zamiast domyślnego opisu. */
  wstep?: string;
  /** Mission-specific identity prevents importing an old worked solution into a fresh attempt. */
  conversationId?: string;
  onUseNotation?: (text: string, expression?: string) => void;
}

// Bez rzędu gotowych próśb: jedna podpowiedź na start (pierwsza z listy), potem własne pytania.
const SZYBKIE: Exclude<Prosba, 'pytanie' | 'pelne'>[] = ['nastepny-krok'];

export function NauczycielPanel({ kontekst, onZamknij, szybkie = SZYBKIE, sugestie = [], onOdpowiedz, wstep, conversationId, onUseNotation }: Props) {
  const storageKey = `forge.teacher.chat:${conversationId ?? `${kontekst.lekcja}:${kontekst.zadanie?.numer ?? kontekst.krok.pytanie}`}`;
  const [status, setStatus] = useState<StatusNauczyciela | null>(null);
  const { messages: czat, busy: czeka, warning, change: setCzat } = useTeacherConversation(storageKey);
  const [pytanie, setPytanie] = useState('');
  const [powod, setPowod] = useState<string | null>(null);
  const koniec = useRef<HTMLDivElement>(null);
  const onHelp = useRef(onOdpowiedz); onHelp.current = onOdpowiedz;
  useEffect(() => {
    const shown = readTeacherConversation(storageKey).filter(w => w.rola === 'nauczyciel' && !w.ukryta && w.helpPending);
    if (!shown.length) return;
    const ids = new Set(shown.map(w => w.id));
    setCzat(items => items.map(w => ids.has(w.id) ? {...w,helpPending:false} : w));
    for (const w of shown) onHelp.current?.({ tekst:w.tekst,tryb:w.tryb ?? 'demo',model:w.model ?? null,...(w.struktura ? {struktura:w.struktura} : {}) },w.prosba ?? 'pytanie');
  },[czat,setCzat,storageKey]);

  useEffect(() => {
    void statusNauczyciela().then(setStatus);
  }, []);
  useEffect(() => {
    koniec.current?.scrollIntoView({ block: 'end' });
  }, [czat, czeka]);

  const zapytaj = async (prosba: Prosba, wlasne?: string) => {
    const requestId = crypto.randomUUID();
    if (!beginTeacherRequest(storageKey, requestId)) return;
    const tekstUcznia = prosba === 'pytanie' ? (wlasne ?? '') : prosba === 'zapis' ? `Zapisz matematycznie: ${wlasne ?? ''}` : PROSBA_TEKST[prosba];
    const historia = czat.filter(w => !w.ukryta).slice(-6).map(({ rola, tekst, pytanieKontrolne }) => ({ rola, tekst: [tekst, pytanieKontrolne].filter(Boolean).join('\n').slice(0, 1000) }));
    setCzat((c) => [...c, { id:requestId, rola: 'uczen', tekst: tekstUcznia }]);
    let o: Odpowiedz;
    try { o = await zapytajNauczyciela(kontekst, prosba, historia, wlasne); }
    catch { o = {tekst:'Nie udało się odebrać odpowiedzi. Twoje rachunki są zachowane.',tryb:'demo',model:null}; }
    if (!isTeacherRequestCurrent(storageKey, requestId)) return;
    setPowod(o.powod ?? null);
    if (o.tryb === 'ai') setStatus({dostepny:true,model:o.model,powod:null});
    else if (o.powod) setStatus({dostepny:false,model:null,powod:o.powod});
    const confirmedFinal = kontekst.krok.etap === 'Ćwiczenie' && kontekst.czyPoprawna === true;
    const ukryta = o.struktura?.ujawniaWynik === true && prosba !== 'pelne' && !confirmedFinal;
    changeTeacherConversation(storageKey,(c) => !c.some(w => w.id === requestId) ? c : [...c, {
      id:crypto.randomUUID(), rola: 'nauczyciel', tekst: o.tekst, tryb: o.tryb, model:o.model,
      prosba, helpPending:!ukryta && (o.tryb === 'ai' || !!o.struktura),
      ...(o.struktura ? {struktura:o.struktura} : {}),
      ...(o.powod ? {powod:o.powod} : {}),
      ...(o.struktura?.pytanieKontrolne ? { pytanieKontrolne: o.struktura.pytanieKontrolne } : {}),
      ...(ukryta ? { ukryta } : {}),
      ...(o.zPamieci ? { zPamieci: true } : {}),
      ...(prosba === 'zapis' && o.tryb === 'ai' ? { zapis: true, ...(o.struktura?.zapisKalkulatora ? { expression: o.struktura.zapisKalkulatora } : {}) } : {}),
    }]);
    finishTeacherRequest(storageKey, requestId);
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

      <details className="nauczyciel__demo"><summary>Połączenie i ustawienia nauczyciela</summary>
        <TeacherConnection onStatus={setStatus} />
      </details>

      {status && !ai && (
        <div className="nauczyciel__demo">
          <p>AI jest niedostępne. Możesz korzystać z podpowiedzi i rozwiązania zapisanych przy tej karcie.</p>
          {status.wymagaKodu && <p>Otwórz „Połączenie i ustawienia nauczyciela” i wpisz kod dostępu.</p>}
          <button type="button" className="btn btn--small" disabled={czeka} onClick={async()=>{
            setStatus(null); setPowod(null); setStatus(await odswiezStatusNauczyciela());
          }}>Sprawdź połączenie ponownie</button>
          <p>{powod ?? status.powod}</p>
        </div>
      )}

      <div className="nauczyciel__czat" aria-live="polite">
        {warning && <p role="status">{warning}</p>}
        {czat.length === 0 && (
          <div className="nauczyciel__start">
            <p className="karta__uwaga">{wstep ?? 'Widzę to zadanie i Twoją odpowiedź. Napisz, czego nie rozumiesz.'}</p>
            {szybkie[0] && (
              <button type="button" className="btn btn--small" disabled={czeka} onClick={() => void zapytaj(szybkie[0]!)}>
                💡 {PROSBA_TEKST[szybkie[0]]}
              </button>
            )}
          </div>
        )}
        {czat.map((w, i) => (
          <div key={i} className={`dymek dymek--${w.rola}`}>
            {w.tryb === 'demo' && <span className="dymek__demo">demo</span>}
            {w.zPamieci && <span className="dymek__demo">z pamięci</span>}
            {w.rola === 'uczen' ? <p><Tex>{w.tekst}</Tex></p> : w.ukryta ? (
              <details className="dymek__ukryta" onToggle={event => {
                if (event.currentTarget.open) {
                  setCzat(items => items.map((item, index) => index === i ? { ...item, id:item.id ?? crypto.randomUUID(), ukryta:false,prosba:'pelne',helpPending:true } : item));
                }
              }}>
                <summary>Ta odpowiedź zawiera wynik — pokaż mimo to</summary>
                <Sformatowane tekst={w.tekst} />
              </details>
            ) : <Sformatowane tekst={w.tekst} />}
            {w.pytanieKontrolne && !w.ukryta && <p className="dymek__kontrolne"><Tex>{w.pytanieKontrolne}</Tex></p>}
            {w.powod && <p className="dymek__demo">{w.powod}</p>}
            {w.zapis && !w.ukryta && onUseNotation && <div className="nauczyciel__notation">
              {w.expression && <p><code>{w.expression}</code></p>}
              <button type="button" className="btn btn--small" onClick={() => { onUseNotation(w.tekst, w.expression); onZamknij(); }}>{w.expression ? 'Wstaw do kalkulatora' : 'Zapisz w brudnopisie'}</button>
              {w.expression && <p className="karta__uwaga">Sprawdź zapis przed obliczeniem.</p>}
            </div>}
          </div>
        ))}
        {czeka && <div className="dymek dymek--nauczyciel dymek--czeka" role="status">Przygotowuję odpowiedź…</div>}
        <div ref={koniec} />
      </div>
      <details className="nauczyciel__extra"><summary>Więcej pomocy</summary>
        <div className="nauczyciel__actions">
          <button type="button" className="btn btn--small" disabled={czeka} onClick={() => void zapytaj('prosciej')}>Wyjaśnij ten krok prościej</button>
          <button type="button" className="btn btn--small" disabled={czeka} onClick={() => void zapytaj('pelne')}>Pokaż pełne rozwiązanie</button>
        </div>
        <p className="karta__uwaga">Pełne rozwiązanie zapisuje się jako pomoc. Możesz po nim przećwiczyć podobne zadanie samodzielnie.</p>
      </details>

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
        <textarea
          value={pytanie}
          onChange={(e) => setPytanie(e.target.value)}
          placeholder={sugestie[0] ? `Np. „${sugestie[0]}”` : 'Zapytaj o to zadanie…'}
          aria-label="Własne pytanie do nauczyciela"
          enterKeyHint="send"
          maxLength={1000}
        />
        <button type="submit" className="btn btn--primary btn--small" disabled={!pytanie.trim() || czeka}>
          Wyślij
        </button>
        <button type="button" className="btn btn--small" disabled={!pytanie.trim() || czeka} onClick={() => {
          const text = pytanie.trim(); setPytanie(''); void zapytaj('zapis', text);
        }}>Zapisz matematycznie</button>
      </form>
    </ModalPanel>
  );
}

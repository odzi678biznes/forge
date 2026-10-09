import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode }  from 'react';
import type { StoragePort } from '@/data/storage-port';
import { isCardDraft, resumeCardDraft, useLessonDraft, type CardDraft } from './lesson-draft';
import { MathInput } from '@/components/MathInput';
import { AnswerAction } from './AnswerAction';
import { Math as Tex } from '@/components/Math';
import type { Karta, KartaZadanie, Oczekiwane, ZadanieCke } from './typy';
import { normalizuj, ocenOtwarta, sprawdzKolejnosc, sprawdzWpis, sprawdzWynikKodu } from './sprawdz';
import { WARIANTY, pokazWartosc, type Wariant } from './warianty';

/**
 * Jedna karta feedu: jedno pytanie, jedna interakcja. Sprawdzanie — regułami
 * (sprawdz.ts), nigdy przez AI. Po odpowiedzi karta pokazuje krótką
 * informację zwrotną; przejście dalej należy do ucznia (bez automatu).
 */

export interface Wynik {
  poprawna: boolean;
  /** Odpowiedź ucznia w formie tekstu — dla nauczyciela AI i historii. */
  tekst: string;
  /** Konkretna przyczyna błędu, jeśli ją rozpoznaliśmy. */
  przyczyna?: string;
}

interface Props {
  answerFromCalculator?: { cardId: string; value: string; id: number };
  onHelp?: () => void;
  draftKey?: string;
  skillId?: string;
  storage?: () => StoragePort;
  karta: Karta;
  zadanie: ZadanieCke | undefined;
  /** Wynik już udzielonej odpowiedzi (informacja zwrotna / podgląd wstecz). */
  wynik: Wynik | null;
  komputer: boolean;
  onWynik: (w: Wynik) => void;
}

const LITERY = 'ABCD';

/** Deterministyczne tasowanie po id karty — kolejność stała, ale nie „poprawna na górze”. */
function tasuj<T>(xs: T[], ziarno: string): number[] {
  let h = 2166136261;
  for (const c of ziarno) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const idx = xs.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345;
    const j = Math.abs(h) % (i + 1);
    [idx[i], idx[j]] = [idx[j] as number, idx[i] as number];
  }
  if (idx.every((v, i) => v === i) && idx.length > 1) idx.push(idx.shift() as number);
  return idx;
}

const DraftContext = createContext<{ fields: Record<string, unknown>; set: (key: string, value: unknown) => void; help: () => void } | null>(null);
function useDraftField<T>(key: string, initial: T, validate?: (value: unknown) => boolean): [T, (value: T | ((old: T) => T)) => void] {
  const context = useContext(DraftContext);
  if (!context) throw new Error('Brak miejsca zapisu odpowiedzi.');
  const saved = context.fields[key];
  const matches = validate ? validate(saved) : typeof saved === typeof initial && (Array.isArray(initial)
    ? Array.isArray(saved) && saved.length <= Math.max(initial.length, 100) : !Array.isArray(saved));
  const value = saved !== undefined && matches ? saved as T : initial;
  return [value, next => context.set(key, typeof next === 'function' ? (next as (old: T) => T)(value) : next)];
}
export function KartaWidok(props: Props) {
  return <SavedCard key={props.draftKey ?? props.karta.id} {...props} />;
}
function SavedCard(props: Props) {
  const saved = useLessonDraft(`card:${props.draftKey ?? props.karta.id}`, props.skillId ?? '', isCardDraft, props.storage);
  if (!saved.ready) return <p role="status">Wczytuję Twoją odpowiedź…</p>;
  return <CardDraftProvider initial={resumeCardDraft(saved.value, props.wynik !== null)} save={saved.save} onWynik={props.onWynik} {...(props.onHelp ? { onHelp: props.onHelp } : {})}>
    {onWynik => <>{saved.warning && <p role="alert">{saved.warning}</p>}<CardContent {...props} onWynik={onWynik} /></>}
  </CardDraftProvider>;
}
function CardDraftProvider({ initial, save, onWynik, children, onHelp }: {
  onHelp?: () => void;
  initial: CardDraft; save: (value: CardDraft) => void; onWynik: (value: Wynik) => void;
  children: (onWynik: (value: Wynik) => void) => ReactNode;
}) {
  const [draft, setDraft] = useState(initial);
  const latest = useRef(draft);
  const update = (next: CardDraft) => { latest.current = next; setDraft(next); save(next); };
  return <DraftContext.Provider value={{ fields: draft.fields, help: () => onHelp?.(), set: (key, value) => { if (latest.current.fields[key] !== value) update({ ...latest.current, fields: { ...latest.current.fields, [key]: value } }); } }}>
    {children(result => {
      if (latest.current.submitted) return;
      update({ ...latest.current, submitted: true });
      onWynik(result);
    })}
  </DraftContext.Provider>;
}
function CardContent({ karta, zadanie, wynik, komputer, onWynik, onHelp, answerFromCalculator }: Props) {
  const zablokowana = wynik !== null;
  const mathFinal = karta.rodzaj === 'zadanie' && zadanie?.przedmiot === 'math';
  const draftContext = useContext(DraftContext);
  const setField = useRef(draftContext?.set); setField.current = draftContext?.set;
  useEffect(() => {
    if (!zablokowana && karta.rodzaj === 'wpis' && answerFromCalculator?.cardId === karta.id)
      setField.current?.('text', answerFromCalculator.value);
  }, [answerFromCalculator, karta.id, karta.rodzaj, zablokowana]);
  const [hintOpen, setHintOpen] = useDraftField('hint-open', false);
  return (
    <div className={`karta karta--${karta.rodzaj}${karta.etap === 'pomocnicze' ? ' karta--pomocnicza' : ''}`}>
      {karta.kontekst && !mathFinal && (
        <p className="karta__kontekst">
          <Tex>{karta.kontekst}</Tex>
        </p>
      )}
      {karta.rodzaj === 'zadanie' && zadanie && !mathFinal && <PelneZadanie zadanie={zadanie} />}
      <h2 className="karta__pytanie" tabIndex={-1}>
        <Tex>{mathFinal && zadanie ? zadanie.tresc : karta.pytanie}</Tex>
      </h2>
      {karta.podpowiedz && !wynik && (
        <details className="karta__pomoc karta__pomoc--mala" open={hintOpen} onToggle={e => { setHintOpen(e.currentTarget.open); if (e.currentTarget.open && !zablokowana) onHelp?.(); }}>
          <summary>💡 Podpowiedź</summary>
          <p><Tex>{karta.podpowiedz}</Tex></p>
        </details>
      )}
      <Interakcja karta={karta} zadanie={zadanie} zablokowana={zablokowana} komputer={komputer} onWynik={onWynik} />
      {wynik && <Informacja karta={karta} wynik={wynik} />}
    </div>
  );
}

function PelneZadanie({ zadanie }: { zadanie: ZadanieCke }) {
  return (
    <div className="karta__zadanie">
      <p className="karta__tresc">
        <Tex>{zadanie.tresc}</Tex>
      </p>
    </div>
  );
}

function Informacja({ karta, wynik }: { karta: Karta; wynik: Wynik }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus({preventScroll:true});
    panel.current?.scrollIntoView({block:'nearest'});
  }, []);
  return (
    <div ref={panel} tabIndex={-1} className={`info ${wynik.poprawna ? 'info--ok' : 'info--zle'}`} role="status">
      <p className="info__werdykt">{wynik.poprawna ? '✓ Dobrze' : '↺ Jeszcze nie'}</p>
      {/* Jedno zdanie na pierwszym planie; reszta pod „Dlaczego?”, żeby ekran nie był przeładowany. */}
      {!wynik.poprawna && wynik.przyczyna ? (
        <>
          <p className="info__przyczyna"><Tex>{wynik.przyczyna}</Tex></p>
          <details className="info__wiecej">
            <summary>Dlaczego tak?</summary>
            <p className="info__wyjasnienie"><Tex>{karta.wyjasnienie}</Tex></p>
          </details>
        </>
      ) : (
        <p className="info__wyjasnienie"><Tex>{karta.wyjasnienie}</Tex></p>
      )}
    </div>
  );
}

interface InterakcjaProps {
  karta: Karta;
  zadanie: ZadanieCke | undefined;
  zablokowana: boolean;
  komputer: boolean;
  onWynik: (w: Wynik) => void;
}

function Interakcja({ karta, zadanie, zablokowana, komputer, onWynik }: InterakcjaProps) {
  switch (karta.rodzaj) {
    case 'wybor':
      return (
        <Wybor
          id={karta.id}
          opcje={karta.opcje}
          poprawna={karta.poprawna}
          decyzja={karta.wariant === 'decyzja'}
          zablokowana={zablokowana}
          onWynik={(i) =>
            onWynik({
              poprawna: i === karta.poprawna,
              tekst: karta.opcje[i] ?? '',
              ...(karta.dlaczegoNie?.[i] ? { przyczyna: karta.dlaczegoNie[i] } : {}),
            })
          }
        />
      );
    case 'kolejnosc':
      return <Kolejnosc id={karta.id} elementy={karta.elementy} zablokowana={zablokowana} onWynik={onWynik} />;
    case 'wpis':
      if (WARIANTY[karta.id]) {
        const warianty = WARIANTY[karta.id] as Wariant[];
        return <WyborWariantow id={karta.id} warianty={warianty} kodowe={false} zablokowana={zablokowana}
          poprawny={(v) => sprawdzWpis(v, karta.oczekiwane)} onWynik={onWynik} />;
      }
      return (
        <Wpis
          klawiatura={karta.klawiatura}
          zablokowana={zablokowana}
          onWpis={(t) => {
            const bledy = karta.typoweBledy ?? {};
            const przyczyna = bledy[normalizuj(t)];
            onWynik({ poprawna: sprawdzWpis(t, karta.oczekiwane), tekst: t, ...(przyczyna ? { przyczyna } : {}) });
          }}
          {...(karta.podpowiedz ? { podpowiedz: karta.podpowiedz } : {})}
        />
      );
    case 'blad':
      return (
        <>
        <ol className="linie linie--zapis" aria-label="Zapis do sprawdzenia">
          {karta.linie.map((l, i) => (
            <li key={i} className="linie__linia">
              <span className="linie__nr">{i + 1}</span>
              <Tex>{l}</Tex>
            </li>
          ))}
        </ol>
        {karta.givenFirstLine && <p className="karta__uwaga">Wiersz 1 to zapis początkowy. Oceń przekształcenia w kolejnych wierszach.</p>}
        <Wybor id={karta.id} opcje={karta.linie.slice(karta.givenFirstLine ? 1 : 0).map((_, i) => `Wiersz ${i + (karta.givenFirstLine ? 2 : 1)}`)}
          wiersze
          poprawna={karta.bledna - (karta.givenFirstLine ? 1 : 0)} decyzja={false} zablokowana={zablokowana}
          onWynik={(i) => onWynik({ poprawna: i + (karta.givenFirstLine ? 1 : 0) === karta.bledna, tekst: `wiersz ${i + (karta.givenFirstLine ? 2 : 1)}`,
            przyczyna: `Sprawdź wiersz ${karta.bledna + 1}.` })} />
        </>
      );
    case 'kod':
      return (
        <>
          <pre className="kod">
            <code>{karta.kod}</code>
          </pre>
          {WARIANTY[karta.id]
            ? <WyborWariantow id={karta.id} warianty={WARIANTY[karta.id] as Wariant[]} kodowe zablokowana={zablokowana}
                poprawny={(v) => sprawdzWynikKodu(v, karta.wynik)} onWynik={onWynik} />
            : <WpisKodu zablokowana={zablokowana} onWpis={(t) => onWynik({ poprawna: sprawdzWynikKodu(t, karta.wynik), tekst: t })} />}
        </>
      );
    case 'otwarta':
      return (
        <Otwarta
          kryteria={karta.kryteria}
          slowa={karta.slowa}
          wzorcowe={karta.wzorcowe}
          zablokowana={zablokowana}
          onWynik={onWynik}
        />
      );
    case 'zadanie':
      return <KoniecZadania karta={karta} zadanie={zadanie} zablokowana={zablokowana} komputer={komputer} onWynik={onWynik} />;
  }
}

/**
 * Wybór zamiast liczenia w głowie: warianty to poprawny wynik i typowe błędy.
 * Na telefonie uczeń wybiera właściwą ścieżkę, a zły wybór od razu mówi, skąd błąd.
 */
function WyborWariantow({ id, warianty, kodowe, zablokowana, poprawny, onWynik }: {
  id: string;
  warianty: Wariant[];
  kodowe: boolean;
  zablokowana: boolean;
  poprawny: (wartosc: string) => boolean;
  onWynik: (w: Wynik) => void;
}) {
  const indeks = warianty.findIndex((v) => poprawny(v.wartosc));
  return (
    <Wybor
      id={id}
      opcje={warianty.map((v) => (kodowe ? v.wartosc : pokazWartosc(v.wartosc)))}
      poprawna={indeks}
      decyzja={false}
      kodowe={kodowe}
      zablokowana={zablokowana}
      onWynik={(i) => {
        const v = warianty[i];
        onWynik({ poprawna: i === indeks, tekst: v?.wartosc ?? '', ...(v?.dlaczego ? { przyczyna: v.dlaczego } : {}) });
      }}
    />
  );
}

function Wybor({
  id,
  opcje,
  decyzja,
  poprawna,
  zablokowana,
  onWynik,
  wiersze = false,
  stalaKolejnosc = false,
  kodowe = false,
}: {
  id: string;
  opcje: string[];
  poprawna: number;
  decyzja: boolean;
  zablokowana: boolean;
  onWynik: (i: number) => void;
  wiersze?: boolean;
  stalaKolejnosc?: boolean;
  kodowe?: boolean;
}) {
  const kolejnosc = useMemo(() => (wiersze || stalaKolejnosc) ? opcje.map((_, i) => i) : tasuj(opcje, id), [opcje, id, wiersze, stalaKolejnosc]);
  const [wybrana, setWybrana] = useDraftField<number | null>('choice', null, value => value === null || (Number.isInteger(value) && Number(value) >= 0 && Number(value) < opcje.length));
  return (
    <div className={`opcje${decyzja ? ' opcje--decyzja' : ''}${wiersze ? ' opcje--wiersze' : ''}`} role="group" aria-label={stalaKolejnosc ? "Odpowiedzi A–D" : "Odpowiedzi"}>
      {kolejnosc.map((i, n) => (
        <button
          key={i}
          type="button"
          className={`opcja${wybrana === i ? ' opcja--wybrana' : ''}${zablokowana && i === poprawna ? ' opcja--poprawna' : ''}${zablokowana && wybrana === i && i !== poprawna ? ' opcja--bledna' : ''}`}
          aria-pressed={wybrana === i}
          disabled={zablokowana}
          onClick={() => {
            setWybrana(i);
            if (!stalaKolejnosc) onWynik(i);
          }}
        >
          <span className="opcja__litera">{LITERY[n]}.</span> {kodowe ? <pre className="opcja__kod">{opcje[i] ?? ''}</pre> : <Tex>{opcje[i] ?? ''}</Tex>}
          {zablokowana && i === poprawna && <span className="opcja__status">✓ Poprawna odpowiedź</span>}
          {zablokowana && wybrana === i && i !== poprawna && <span className="opcja__status">↺ Twój wybór — sprawdź wyjaśnienie</span>}
        </button>
      ))}
      {!zablokowana && stalaKolejnosc && <AnswerAction disabled={wybrana === null} onClick={() => { if (wybrana !== null) onWynik(wybrana); }} />}
    </div>
  );
}

function Kolejnosc({
  id,
  elementy,
  zablokowana,
  onWynik,
}: {
  id: string;
  elementy: string[];
  zablokowana: boolean;
  onWynik: (w: Wynik) => void;
}) {
  const start = useMemo(() => tasuj(elementy, id), [elementy, id]);
  const [ulozone, setUlozone] = useDraftField<number[]>('order', [], value => Array.isArray(value) && new Set(value).size === value.length && value.every(i => Number.isInteger(i) && i >= 0 && i < elementy.length));
  const [feedback, setFeedback] = useDraftField('order-feedback', '');
  const draft = useContext(DraftContext);
  const zostaly = start.filter((i) => !ulozone.includes(i));
  return (
    <div className="kolejnosc" data-bez-gestu>
      <ol className="kolejnosc__ulozone" aria-label="Twoja kolejność">
        {ulozone.map((i, n) => (
          <li key={i}>
            <button type="button" disabled={zablokowana} onClick={() => { setUlozone(ulozone.slice(0,n)); setFeedback('Wróciłeś do wcześniejszego miejsca w kolejności.'); }}>
              <span className="linie__nr">{n + 1}</span>
              <Tex>{elementy[i] ?? ''}</Tex>
            </button>
          </li>
        ))}
      </ol>
      {zostaly.length > 0 && <p className="karta__uwaga">Wybierz następną czynność. Od razu sprawdzę jej miejsce w rozwiązaniu.</p>}
      {feedback && <p role="status">{feedback}</p>}
      <div className="kolejnosc__pula">
        {zostaly.map((i) => (
          <button key={i} type="button" className="opcja" disabled={zablokowana} onClick={() => {
            if (i !== ulozone.length) { setFeedback('Jeszcze nie — ta czynność wymaga wcześniejszego kroku. Spróbuj ponownie.'); draft?.help(); return; }
            const next = [...ulozone, i]; setUlozone(next); setFeedback('Dobrze — czynność jest na właściwym miejscu.');
            if (next.length === elementy.length) onWynik({poprawna:true,tekst:next.map(index => elementy[index]).join(' → ')});
          }}>
            <Tex>{elementy[i] ?? ''}</Tex>
          </button>
        ))}
      </div>
      {!zablokowana && zostaly.length === 0 && (
        <AnswerAction
          disabled={zostaly.length > 0}
          onClick={() =>
            onWynik({
              poprawna: sprawdzKolejnosc(ulozone),
              tekst: ulozone.map((i) => elementy[i]).join(' → '),
            })
          }
        >
          Sprawdź odpowiedź</AnswerAction>
      )}
    </div>
  );
}

function Wpis({
  klawiatura,
  zablokowana,
  onWpis,
  podpowiedz,
}: {
  klawiatura: 'mat' | 'tekst';
  zablokowana: boolean;
  onWpis: (t: string) => void;
  podpowiedz?: string;
}) {
  const [t, setT] = useDraftField('text', '');
  const [hint, setHint] = useDraftField('hint', false);
  const draft = useContext(DraftContext);
  return (
    <form
      className="wpis"
      data-bez-gestu
      onSubmit={(e) => {
        e.preventDefault();
        if (t.trim() !== '' && !zablokowana) onWpis(t);
      }}
    >
      {klawiatura === 'mat' ? <MathInput value={t} onChange={setT} disabled={zablokowana} /> : <input
        className="wpis__pole"
        value={t}
        onChange={(e) => setT(e.target.value)}
        disabled={zablokowana}
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Twoja odpowiedź"
        placeholder="Twoja odpowiedź"
      />}
      {!zablokowana && (
        <div className="wpis__akcje">
          <AnswerAction disabled={t.trim() === ''} />
          {podpowiedz && !hint && (
            <button type="button" className="btn" onClick={() => { setHint(true); draft?.help(); }}>
              Podpowiedź
            </button>
          )}
        </div>
      )}
      {hint && podpowiedz && (
        <p className="wpis__podpowiedz">
          <Tex>{podpowiedz}</Tex>
        </p>
      )}
    </form>
  );
}

function WpisKodu({ zablokowana, onWpis }: { zablokowana: boolean; onWpis: (t: string) => void }) {
  const [t, setT] = useDraftField('text', '');
  return (
    <form
      className="wpis"
      data-bez-gestu
      onSubmit={(e) => {
        e.preventDefault();
        if (t.trim() !== '' && !zablokowana) onWpis(t);
      }}
    >
      <textarea
        className="wpis__pole wpis__pole--kod"
        rows={2}
        value={t}
        onChange={(e) => setT(e.target.value)}
        disabled={zablokowana}
        spellCheck={false}
        autoCapitalize="off"
        aria-label="Co wypisze program"
        placeholder="Wpisz, co pojawi się na ekranie (każdy print w nowej linii)"
      />
      {!zablokowana && (
        <div className="wpis__akcje">
          <AnswerAction disabled={t.trim() === ''} />
        </div>
      )}
    </form>
  );
}

function Otwarta({
  kryteria,
  slowa,
  wzorcowe,
  zablokowana,
  onWynik,
}: {
  kryteria: string[];
  slowa: string[][];
  wzorcowe: string[];
  zablokowana: boolean;
  onWynik: (w: Wynik) => void;
}) {
  const [t, setT] = useDraftField('text', '');
  const [etap, setEtap] = useDraftField<'pisz' | 'ocen'>('open-stage', zablokowana ? 'ocen' : 'pisz', value => value === 'pisz' || value === 'ocen');
  const ocena = useMemo(() => ocenOtwarta(t, slowa), [t, slowa]);
  if (etap === 'pisz') {
    return (
      <form
        className="wpis"
        data-bez-gestu
        onSubmit={(e) => {
          e.preventDefault();
          if (t.trim().length >= 5) setEtap('ocen');
        }}
      >
        <textarea
          className="wpis__pole wpis__pole--dlugie"
          rows={4}
          value={t}
          onChange={(e) => setT(e.target.value)}
          aria-label="Twoja odpowiedź"
          placeholder="Napisz odpowiedź własnymi słowami"
        />
        <div className="wpis__akcje">
          <AnswerAction disabled={t.trim().length < 5}>Porównaj z kluczem CKE</AnswerAction>
        </div>
      </form>
    );
  }
  return (
    <div className="otwarta">
      <p className="karta__uwaga">Twoja odpowiedź: „{t}”</p>
      <p className="otwarta__tytul">Kryteria z zasad oceniania CKE</p>
      <ul className="otwarta__kryteria">
        {kryteria.map((k, i) => (
          <li key={i} className={ocena.spelnione[i] ? 'ok' : ''}>
            {k}
            <span className="otwarta__auto">{ocena.spelnione[i] ? ' — widzę to w odpowiedzi' : ' — nie widzę tego'}</span>
          </li>
        ))}
      </ul>
      <p className="otwarta__tytul">Przykładowe odpowiedzi z klucza CKE</p>
      <ul className="otwarta__wzorcowe">
        {wzorcowe.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
      <p className="karta__uwaga">
        Sprawdzenie słów jest tylko wskazówką. Oceń sam, czy spełniasz WSZYSTKIE kryteria — możesz też zapytać nauczyciela.
      </p>
      {!zablokowana && (
        <div className="wpis__akcje">
          <AnswerAction onClick={() => onWynik({ poprawna: true, tekst: t })}>Spełniam kryteria</AnswerAction>
          <button type="button" className="btn" onClick={() => onWynik({ poprawna: false, tekst: t })}>
            Jeszcze nie
          </button>
        </div>
      )}
    </div>
  );
}

function KoniecZadania({
  karta,
  zadanie,
  zablokowana,
  komputer,
  onWynik,
}: {
  karta: KartaZadanie;
  zadanie: ZadanieCke | undefined;
  zablokowana: boolean;
  komputer: boolean;
  onWynik: (w: Wynik) => void;
}) {
  const k = karta.koniec;
  const [notes, setNotes] = useDraftField('work', '');
  return (
    <>
      {komputer && zadanie?.przedmiot !== 'math' && k.typ !== 'otwarta' && !karta.python && (
        <label className="brudnopis">
          <span>Brudnopis — pełne obliczenia (nie jest oceniany automatycznie)</span>
          <textarea rows={5} spellCheck={false} data-bez-gestu value={notes} onChange={e => setNotes(e.target.value)} placeholder="Zapisz obliczenia jak na egzaminie" />
        </label>
      )}
      {karta.python && <EdytorPython python={karta.python} komputer={komputer} />}
      {k.typ === 'abcd' && zadanie?.odpowiedzi && (
        <Wybor id={karta.id} opcje={zadanie.odpowiedzi} poprawna={k.poprawna} decyzja={false} wiersze={false} stalaKolejnosc
          zablokowana={zablokowana} onWynik={i => onWynik({ poprawna: i === k.poprawna, tekst: LITERY[i] ?? '' })} />
      )}
      {k.typ === 'pf' && <PrawdaFalsz zdania={k.zdania} poprawne={k.poprawne} zablokowana={zablokowana} onWynik={onWynik} />}
      {k.typ === 'wpis' && <WieleWpisow mathematical={zadanie?.przedmiot === 'math'} oczekiwane={k.oczekiwane} etykiety={k.etykiety} zablokowana={zablokowana} onWynik={onWynik} />}
      {k.typ === 'otwarta' && (
        <Otwarta kryteria={k.kryteria} slowa={k.slowa} wzorcowe={k.wzorcowe} zablokowana={zablokowana} onWynik={onWynik} />
      )}
    </>
  );
}

function PrawdaFalsz({
  zdania,
  poprawne,
  zablokowana,
  onWynik,
}: {
  zdania: string[];
  poprawne: boolean[];
  zablokowana: boolean;
  onWynik: (w: Wynik) => void;
}) {
  const [odp, setOdp] = useDraftField<(boolean | null)[]>('true-false', zdania.map(() => null), value => Array.isArray(value) && value.length === zdania.length && value.every(x => x === null || typeof x === 'boolean'));
  return (
    <div className="pf">
      {zdania.map((z, i) => (
        <div key={i} className="pf__wiersz">
          <p>
            <Tex>{z}</Tex>
          </p>
          <div className="pf__przyciski">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                className={`pf__btn${odp[i] === v ? ' pf__btn--on' : ''}`}
                disabled={zablokowana}
                aria-pressed={odp[i] === v}
                onClick={() => setOdp(odp.map((x, j) => (j === i ? v : x)))}
              >
                {v ? 'P' : 'F'}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!zablokowana && (
        <AnswerAction
          disabled={odp.some((x) => x === null)}
          onClick={() =>
            onWynik({
              poprawna: odp.every((x, i) => x === poprawne[i]),
              tekst: odp.map((x) => (x ? 'P' : 'F')).join(', '),
            })
          }
        >
          Sprawdź odpowiedź</AnswerAction>
      )}
    </div>
  );
}

function WieleWpisow({
  mathematical = false,
  oczekiwane,
  etykiety,
  zablokowana,
  onWynik,
}: {
  mathematical?: boolean;
  oczekiwane: Oczekiwane[];
  etykiety: string[];
  zablokowana: boolean;
  onWynik: (w: Wynik) => void;
}) {
  const [t, setT] = useDraftField<string[]>('answers', oczekiwane.map(() => ''), value => Array.isArray(value) && value.length === oczekiwane.length && value.every(x => typeof x === 'string'));
  return (
    <form
      className="wpis"
      data-bez-gestu
      onSubmit={(e) => {
        e.preventDefault();
        if (zablokowana || t.some((x) => x.trim() === '')) return;
        onWynik({ poprawna: oczekiwane.every((o, i) => sprawdzWpis(t[i] ?? '', o)), tekst: t.join(' | ') });
      }}
    >
      {oczekiwane.map((_, i) => (
        mathematical ? <div key={i} className="wpis__etykieta">
          <span><Tex>{etykiety[i] ?? ''}</Tex></span>
          <MathInput focusOnly value={t[i] ?? ''} disabled={zablokowana} label={etykiety[i] ?? `Odpowiedź ${i+1}`}
            onChange={value=>setT(t.map((x,j)=>j===i?value:x))} />
        </div> : <label key={i} className="wpis__etykieta">
          <span>
            <Tex>{etykiety[i] ?? ''}</Tex>
          </span>
          <input
            className="wpis__pole"
            value={t[i]}
            disabled={zablokowana}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setT(t.map((x, j) => (j === i ? e.target.value : x)))}
          />
        </label>
      ))}
      {!zablokowana && (
        <div className="wpis__akcje">
          <AnswerAction disabled={t.some((x) => x.trim() === '')} />
        </div>
      )}
    </form>
  );
}

function EdytorPython({ python, komputer }: { python: NonNullable<KartaZadanie['python']>; komputer: boolean }) {
  const [otwarty, setOtwarty] = useDraftField('python-open', komputer);
  const [kod, setKod] = useDraftField('python-code', python.szablon);
  const [wynik, setWynik] = useState<{ tekst: string; ok: boolean | null } | null>(null);
  const [pracuje, setPracuje] = useState(false);

  if (!otwarty) {
    return (
      <button type="button" className="btn karta__python-otworz" onClick={() => setOtwarty(true)}>
        Napisz i uruchom program (Python)
      </button>
    );
  }

  const uruchom = async () => {
    setPracuje(true);
    setWynik(null);
    try {
      const pliki: Record<string, string> = {};
      if (python.plik) {
        const r = await fetch(`${import.meta.env.BASE_URL}${python.plik}`);
        pliki[python.nazwaPliku] = await r.text();
      }
      const { PythonCodeRunner } = await import('@/features/code/python-runner');
      const runner = (window as unknown as { __forgePy?: InstanceType<typeof PythonCodeRunner> }).__forgePy ?? new PythonCodeRunner();
      (window as unknown as { __forgePy?: InstanceType<typeof PythonCodeRunner> }).__forgePy = runner;
      const r = await runner.runScript(kod, pliki);
      const out = r.output.trim();
      if (r.status !== 'ok') setWynik({ tekst: `${out ? `${out}\n` : ''}${r.message ?? 'Błąd'}`, ok: null });
      else setWynik({ tekst: out || '(program nic nie wypisał)', ok: sprawdzWynikKodu(out, [python.oczekiwanyWynik]) });
    } finally {
      setPracuje(false);
    }
  };

  return (
    <div className="python" data-bez-gestu>
      <label className="python__etykieta" htmlFor="python-kod">
        Twój program (Python){python.nazwaPliku ? ` — plik ${python.nazwaPliku} z informatora CKE jest dostępny` : ''}
      </label>
      <textarea
        id="python-kod"
        className="python__kod"
        rows={Math.max(8, kod.split('\n').length + 1)}
        value={kod}
        spellCheck={false}
        autoCapitalize="off"
        onChange={(e) => setKod(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const el = e.currentTarget;
            const a = el.selectionStart;
            setKod(kod.slice(0, a) + '    ' + kod.slice(el.selectionEnd));
            requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4));
          }
        }}
      />
      <button type="button" className="btn" disabled={pracuje} onClick={() => void uruchom()}>
        {pracuje ? 'Uruchamiam Pythona…' : 'Uruchom program'}
      </button>
      {wynik && (
        <div className={`python__wynik${wynik.ok === true ? ' ok' : wynik.ok === false ? ' zle' : ''}`}>
          <pre>{wynik.tekst}</pre>
          {wynik.ok === true && <p>Program wypisał oficjalną odpowiedź CKE. Wpisz ją poniżej.</p>}
          {wynik.ok === false && <p>To jeszcze nie jest odpowiedź z klucza — sprawdź warunki.</p>}
        </div>
      )}
    </div>
  );
}

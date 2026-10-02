import { useEffect, useMemo, useRef, useState } from 'react';
import { MathInput } from '@/components/MathInput';
import { Math as Tex } from '@/components/Math';
import { ocenWpis, ocenWybor, type Ocena } from './ocena';
import { TaliaSwipe } from './Swipe';
import type { PytanieSpeed } from './typy';
import { KROTKIE_NAZWY } from './tresc';
import { Akcja, Opcje, sekundy, type ZglosPomoc } from './wspolne';

/**
 * ⚡ Szybka powtórka: 5 pytań w różnych formach, ok. minuty. Czas jest
 * mierzony, ale nie karze — wolna odpowiedź tylko trochę mniej przesuwa
 * opanowanie. Błąd nie zatrzymuje rundy: krótkie wyjaśnienie i dalej.
 */

export interface OdpowiedzSpeed {
  pytanie: PytanieSpeed;
  poprawna: boolean;
  czasMs: number;
  misconception?: string;
}

export interface WynikSpeed {
  odpowiedzi: OdpowiedzSpeed[];
  dobrze: number;
  sredniCzasMs: number;
  doPowtorki: string | null;
}

export function podsumujSpeed(odpowiedzi: OdpowiedzSpeed[], nazwy: (skill: string) => string): WynikSpeed {
  const dobrze = odpowiedzi.filter((o) => o.poprawna).length;
  const sredni = odpowiedzi.length ? odpowiedzi.reduce((s, o) => s + o.czasMs, 0) / odpowiedzi.length : 0;
  const zle = odpowiedzi.filter((o) => !o.poprawna).map((o) => o.pytanie.skill);
  // Do powtórki: umiejętność z największą liczbą błędów, a przy remisie — najwolniejsza.
  const licz = new Map<string, number>();
  for (const s of zle) licz.set(s, (licz.get(s) ?? 0) + 1);
  const najgorsza = [...licz].sort((a, b) => b[1] - a[1])[0]?.[0];
  return { odpowiedzi, dobrze, sredniCzasMs: sredni, doPowtorki: najgorsza ? nazwy(najgorsza) : null };
}

const nazwa = (s: string) => KROTKIE_NAZWY[s] ?? s;

export function SpeedRound({ pytania, onKoniec, zglosPomoc }: { pytania: PytanieSpeed[]; onKoniec: (w: WynikSpeed) => void; zglosPomoc: ZglosPomoc }) {
  const [start, setStart] = useState(false);
  const [i, setI] = useState(0);
  const [odpowiedzi, setOdpowiedzi] = useState<OdpowiedzSpeed[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; tekst: string } | null>(null);
  const t0 = useRef(0);
  const q = pytania[i];
  const koniec = start && i >= pytania.length;
  const wynik = useMemo(() => (koniec ? podsumujSpeed(odpowiedzi, nazwa) : null), [koniec, odpowiedzi]);

  useEffect(() => {
    t0.current = performance.now();
  }, [i, start]);

  useEffect(() => {
    if (!q) return;
    zglosPomoc({
      aktywnosc: 'szybka powtórka (speed round)',
      skill: q.skill,
      krok: { etap: 'Szybka powtórka', numer: i + 1, z: pytania.length, pytanie: q.pytanie, wyjasnienie: q.wyjasnienie },
      odpowiedzUcznia: null,
      czyPoprawna: feedback ? feedback.ok : null,
      podpowiedzi: [],
      pokazane: 0,
      proby: [],
      sugestie: [],
    });
  }, [q, i, feedback, pytania.length, zglosPomoc]);

  const odpowiedz = (o: { poprawna: boolean; misconception?: string; czasMs?: number }) => {
    if (!q || feedback) return;
    const czasMs = Math.round(o.czasMs ?? performance.now() - t0.current);
    setOdpowiedzi((a) => [...a, { pytanie: q, poprawna: o.poprawna, czasMs, ...(o.misconception ? { misconception: o.misconception } : {}) }]);
    setFeedback({ ok: o.poprawna, tekst: q.wyjasnienie });
    if (o.poprawna) window.setTimeout(() => nastepne(), 650);
  };
  const nastepne = () => {
    setFeedback(null);
    setI((n) => n + 1);
  };

  if (!start) {
    return (
      <section className="speed speed--start">
        <p className="speed__ikona" aria-hidden>⚡</p>
        <h2 className="mikro__pytanie">Szybka powtórka</h2>
        <p className="karta__uwaga">{pytania.length} pytań · ok. minuty · przesuwanie, wybór, liczby. Błąd nie odbiera punktów — mówi, co powtórzyć.</p>
        <Akcja onClick={() => setStart(true)}>Start ⚡</Akcja>
      </section>
    );
  }

  if (koniec && wynik) {
    return (
      <section className="speed speed--wynik" aria-label="Wynik szybkiej powtórki">
        <p className="speed__ikona" aria-hidden>⚡</p>
        <p className="speed__wynik">{wynik.dobrze}/{pytania.length} poprawnych</p>
        <p className="speed__linia">Średni czas: {sekundy(wynik.sredniCzasMs)}</p>
        <p className="speed__linia">{wynik.doPowtorki ? `Do powtórki: ${wynik.doPowtorki}` : 'Do powtórki: nic pilnego'}</p>
        <ol className="speed__lista">
          {wynik.odpowiedzi.map((o, n) => (
            <li key={n} className={o.poprawna ? 'ok' : 'zle'}>
              <span aria-hidden>{o.poprawna ? '✓' : '↺'}</span> <Tex>{o.pytanie.pytanie}</Tex> <span className="speed__czas">{sekundy(o.czasMs)}</span>
            </li>
          ))}
        </ol>
        <Akcja onClick={() => onKoniec(wynik)}>Dalej →</Akcja>
      </section>
    );
  }

  if (!q) return null;
  return (
    <section className="speed" aria-label={`Pytanie ${i + 1} z ${pytania.length}`}>
      <div className="speed__gora">
        <span className="speed__nr">⚡ {i + 1}/{pytania.length}</span>
        <Stoper od={t0} zatrzymany={feedback !== null} key={i} />
      </div>
      <div className="speed__pasek" aria-hidden>
        {pytania.map((_, n) => (
          <span key={n} className={n < odpowiedzi.length ? (odpowiedzi[n]!.poprawna ? 'ok' : 'zle') : n === i ? 'teraz' : ''} />
        ))}
      </div>

      {q.forma === 'pf' ? (
        <>
          <p className="karta__uwaga">Prawda czy fałsz? Przesuń kartę.</p>
          <TaliaSwipe
            key={q.id}
            karty={[{ id: q.id, przod: <p className="swipe__tekst"><Tex>{q.pytanie}</Tex></p> }]}
            etykiety={{ prawo: 'Prawda', lewo: 'Fałsz' }}
            onDecyzja={(_k, kier, czas) => {
              const ok = (kier === 'prawo') === q.prawda;
              odpowiedz({ poprawna: ok, czasMs: czas, ...(!ok && q.misconception ? { misconception: q.misconception } : {}) });
            }}
          />
          {feedback && <p className="speed__zdanie"><Tex>{q.pytanie}</Tex> — {q.prawda ? 'prawda' : 'fałsz'}</p>}
        </>
      ) : (
        <>
          <h2 className="mikro__pytanie" tabIndex={-1}><Tex>{q.pytanie}</Tex></h2>
          {q.odpowiedz?.typ === 'wybor' && (
            <Opcje
              opcje={q.odpowiedz.opcje}
              wybrana={null}
              bledne={[]}
              poprawna={feedback ? q.odpowiedz.poprawna : null}
              zablokowane={feedback !== null}
              onWybierz={(n) => {
                const o = ocenWybor(q.odpowiedz as Extract<typeof q.odpowiedz, { typ: 'wybor' }>, n);
                odpowiedz(zOceny(o));
              }}
              {...(q.wykresy ? { wykresy: q.wykresy } : {})}
              ziarno={q.id}
            />
          )}
          {q.odpowiedz && q.odpowiedz.typ !== 'wybor' && <WpisSpeed key={q.id} zablokowany={feedback !== null} onWpis={(t) => odpowiedz(zOceny(ocenWpis(q.odpowiedz!, t)))} />}
        </>
      )}

      {feedback && (
        <div className={`sesja-info ${feedback.ok ? 'sesja-info--ok' : 'sesja-info--zle'}`} role="status">
          <p className="sesja-info__werdykt">{feedback.ok ? '✓' : 'Nie tym razem'}</p>
          {!feedback.ok && <p><Tex>{feedback.tekst}</Tex></p>}
        </div>
      )}
      {feedback && !feedback.ok && <Akcja onClick={nastepne}>Dalej →</Akcja>}
    </section>
  );
}

function zOceny(o: Ocena): { poprawna: boolean; misconception?: string } {
  return { poprawna: o.poprawna, ...(o.diagnoza?.misconception ? { misconception: o.diagnoza.misconception } : {}) };
}

function WpisSpeed({ zablokowany, onWpis }: { zablokowany: boolean; onWpis: (t: string) => void }) {
  const [t, setT] = useState('');
  return (
    <form
      className="deep__wpis"
      onSubmit={(e) => {
        e.preventDefault();
        if (t.trim() && !zablokowany) onWpis(t);
      }}
    >
      <MathInput value={t} onChange={setT} disabled={zablokowany} placeholder="liczba" />
      {!zablokowany && <Akcja onClick={() => t.trim() && onWpis(t)} disabled={!t.trim()}>Sprawdź</Akcja>}
    </form>
  );
}

/** Stoper aktualizuje tylko swój napis — reszta ekranu się nie przerysowuje. */
function Stoper({ od, zatrzymany }: { od: { current: number }; zatrzymany: boolean }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (zatrzymany) return;
    const id = window.setInterval(() => {
      if (el.current) el.current.textContent = sekundy(performance.now() - od.current);
    }, 100);
    return () => window.clearInterval(id);
  }, [od, zatrzymany]);
  return <span ref={el} className="speed__stoper" aria-hidden>0,0 s</span>;
}

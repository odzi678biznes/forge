import { useMemo, useRef, useState } from 'react';
import { Math as Tex } from '@/components/Math';
import type { Karta, KartaZadanie, Oczekiwane, ZadanieCke } from './typy';
import { normalizuj, ocenOtwarta, sprawdzKolejnosc, sprawdzWpis, sprawdzWynikKodu } from './sprawdz';

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

export function KartaWidok({ karta, zadanie, wynik, komputer, onWynik }: Props) {
  const zablokowana = wynik !== null;
  return (
    <div className={`karta karta--${karta.rodzaj}${karta.etap === 'pomocnicze' ? ' karta--pomocnicza' : ''}`}>
      {karta.kontekst && (
        <p className="karta__kontekst">
          <Tex>{karta.kontekst}</Tex>
        </p>
      )}
      {karta.rodzaj === 'zadanie' && zadanie && <PelneZadanie zadanie={zadanie} />}
      <h2 className="karta__pytanie">
        <Tex>{karta.pytanie}</Tex>
      </h2>
      {karta.podpowiedz && karta.rodzaj !== 'wpis' && (
        <details className="karta__pomoc">
          <summary>Przypomnij zasadę</summary>
          <p><Tex>{karta.podpowiedz}</Tex></p>
        </details>
      )}
      <Interakcja karta={karta} zadanie={zadanie} zablokowana={zablokowana} komputer={komputer} onWynik={onWynik} />
      {wynik && <Informacja karta={karta} wynik={wynik} />}
      {zadanie && karta.rodzaj !== 'zadanie' && (
        <details className="karta__pomoc">
          <summary>Treść całego zadania</summary>
          <PelneZadanie zadanie={zadanie} />
        </details>
      )}
      {zadanie && karta.rodzaj === 'zadanie' && !wynik && (
        <details className="karta__pomoc">
          <summary>Nie mam jak liczyć — pokaż rozwiązanie</summary>
          <p>Prześledź kroki. Samo odsłonięcie rozwiązania nie zalicza zadania. Możesz wrócić do niego później.</p>
          <ol>{zadanie.rozwiazanie.map((krok, i) => <li key={i}><Tex>{krok}</Tex></li>)}</ol>
        </details>
      )}
    </div>
  );
}

function PelneZadanie({ zadanie }: { zadanie: ZadanieCke }) {
  return (
    <div className="karta__zadanie">
      <p className="karta__tresc">
        <Tex>{zadanie.tresc}</Tex>
      </p>
      <p className="karta__uwaga">Treść w skrócie, dane z oryginału. Pełny tekst — w dokumencie CKE (link w „Źródło”).</p>
    </div>
  );
}

function Informacja({ karta, wynik }: { karta: Karta; wynik: Wynik }) {
  return (
    <div className={`info ${wynik.poprawna ? 'info--ok' : 'info--zle'}`} role="status">
      <p className="info__werdykt">{wynik.poprawna ? 'Dobrze' : 'Jeszcze nie'}</p>
      {!wynik.poprawna && wynik.przyczyna && (
        <p className="info__przyczyna">
          <Tex>{wynik.przyczyna}</Tex>
        </p>
      )}
      <p className="info__wyjasnienie">
        <Tex>{karta.wyjasnienie}</Tex>
      </p>
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
        <Wybor id={karta.id} opcje={karta.linie.map((_, i) => `Wiersz ${i + 1}`)}
          wiersze
          poprawna={karta.bledna} decyzja={false} zablokowana={zablokowana}
          onWynik={(i) => onWynik({ poprawna: i === karta.bledna, tekst: `wiersz ${i + 1}`,
            przyczyna: `Sprawdź wiersz ${karta.bledna + 1}.` })} />
        </>
      );
    case 'kod':
      return (
        <>
          <pre className="kod">
            <code>{karta.kod}</code>
          </pre>
          <WpisKodu zablokowana={zablokowana} onWpis={(t) => onWynik({ poprawna: sprawdzWynikKodu(t, karta.wynik), tekst: t })} />
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

function Wybor({
  id,
  opcje,
  decyzja,
  zablokowana,
  onWynik,
  wiersze = false,
}: {
  id: string;
  opcje: string[];
  poprawna: number;
  decyzja: boolean;
  zablokowana: boolean;
  onWynik: (i: number) => void;
  wiersze?: boolean;
}) {
  const kolejnosc = useMemo(() => wiersze ? opcje.map((_, i) => i) : tasuj(opcje, id), [opcje, id, wiersze]);
  const [wybrana, setWybrana] = useState<number | null>(null);
  return (
    <div className={`opcje${decyzja ? ' opcje--decyzja' : ''}${wiersze ? ' opcje--wiersze' : ''}`} role="group" aria-label="Odpowiedzi">
      {kolejnosc.map((i, n) => (
        <button
          key={i}
          type="button"
          className={`opcja${wybrana === i ? ' opcja--wybrana' : ''}`}
          disabled={zablokowana}
          onClick={() => {
            setWybrana(i);
            onWynik(i);
          }}
        >
          <span className="opcja__litera">{LITERY[n]}.</span> <Tex>{opcje[i] ?? ''}</Tex>
        </button>
      ))}
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
  const [ulozone, setUlozone] = useState<number[]>([]);
  const zostaly = start.filter((i) => !ulozone.includes(i));
  return (
    <div className="kolejnosc" data-bez-gestu>
      <ol className="kolejnosc__ulozone" aria-label="Twoja kolejność">
        {ulozone.map((i, n) => (
          <li key={i}>
            <button type="button" disabled={zablokowana} onClick={() => setUlozone(ulozone.filter((x) => x !== i))}>
              <span className="linie__nr">{n + 1}</span>
              <Tex>{elementy[i] ?? ''}</Tex>
            </button>
          </li>
        ))}
      </ol>
      {zostaly.length > 0 && <p className="karta__uwaga">Dotknij w kolejności wykonywania. Dotknięcie ułożonego — cofa.</p>}
      <div className="kolejnosc__pula">
        {zostaly.map((i) => (
          <button key={i} type="button" className="opcja" disabled={zablokowana} onClick={() => setUlozone([...ulozone, i])}>
            <Tex>{elementy[i] ?? ''}</Tex>
          </button>
        ))}
      </div>
      {zostaly.length === 0 && !zablokowana && (
        <button
          type="button"
          className="btn btn--primary karta__sprawdz"
          onClick={() =>
            onWynik({
              poprawna: sprawdzKolejnosc(ulozone),
              tekst: ulozone.map((i) => elementy[i]).join(' → '),
            })
          }
        >
          Sprawdź
        </button>
      )}
    </div>
  );
}

const ZNAKI_MAT = ['/', '^', '−', ','];

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
  const [t, setT] = useState('');
  const [hint, setHint] = useState(false);
  const pole = useRef<HTMLInputElement>(null);
  const wstaw = (z: string) => {
    const el = pole.current;
    const znak = z === '−' ? '-' : z;
    if (!el) return setT(t + znak);
    const a = el.selectionStart ?? t.length;
    const b = el.selectionEnd ?? t.length;
    setT(t.slice(0, a) + znak + t.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + 1, a + 1);
    });
  };
  return (
    <form
      className="wpis"
      data-bez-gestu
      onSubmit={(e) => {
        e.preventDefault();
        if (t.trim() !== '' && !zablokowana) onWpis(t);
      }}
    >
      <input
        ref={pole}
        className="wpis__pole"
        value={t}
        onChange={(e) => setT(e.target.value)}
        disabled={zablokowana}
        inputMode={klawiatura === 'mat' ? 'text' : 'text'}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="Twoja odpowiedź"
        placeholder={klawiatura === 'mat' ? 'np. 3/4' : 'Twoja odpowiedź'}
      />
      {klawiatura === 'mat' && !zablokowana && (
        <div className="wpis__znaki">
          {ZNAKI_MAT.map((z) => (
            <button key={z} type="button" className="wpis__znak" onClick={() => wstaw(z)} aria-label={`Wstaw ${z}`}>
              {z}
            </button>
          ))}
        </div>
      )}
      {!zablokowana && (
        <div className="wpis__akcje">
          <button type="submit" className="btn btn--primary" disabled={t.trim() === ''}>
            Sprawdź
          </button>
          {podpowiedz && !hint && (
            <button type="button" className="btn" onClick={() => setHint(true)}>
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
  const [t, setT] = useState('');
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
          <button type="submit" className="btn btn--primary" disabled={t.trim() === ''}>
            Sprawdź
          </button>
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
  const [t, setT] = useState('');
  const [etap, setEtap] = useState<'pisz' | 'ocen'>('pisz');
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
          <button type="submit" className="btn btn--primary" disabled={t.trim().length < 5}>
            Porównaj z kluczem CKE
          </button>
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
          <button type="button" className="btn btn--primary" onClick={() => onWynik({ poprawna: true, tekst: t })}>
            Spełniam kryteria
          </button>
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
  return (
    <>
      {komputer && k.typ !== 'otwarta' && !karta.python && (
        <label className="brudnopis">
          <span>Brudnopis — pełne obliczenia (nie jest oceniany automatycznie)</span>
          <textarea rows={5} spellCheck={false} data-bez-gestu placeholder="Zapisz obliczenia jak na egzaminie" />
        </label>
      )}
      {karta.python && <EdytorPython python={karta.python} komputer={komputer} />}
      {k.typ === 'abcd' && zadanie?.odpowiedzi && (
        <div className="opcje opcje--abcd" role="group" aria-label="Odpowiedzi A–D">
          {zadanie.odpowiedzi.map((o, i) => (
            <button
              key={i}
              type="button"
              className="opcja"
              disabled={zablokowana}
              onClick={() => onWynik({ poprawna: i === k.poprawna, tekst: LITERY[i] ?? '' })}
            >
              <span className="opcja__litera">{LITERY[i]}.</span> <Tex>{o}</Tex>
            </button>
          ))}
        </div>
      )}
      {k.typ === 'pf' && <PrawdaFalsz zdania={k.zdania} poprawne={k.poprawne} zablokowana={zablokowana} onWynik={onWynik} />}
      {k.typ === 'wpis' && <WieleWpisow oczekiwane={k.oczekiwane} etykiety={k.etykiety} zablokowana={zablokowana} onWynik={onWynik} />}
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
  const [odp, setOdp] = useState<(boolean | null)[]>(zdania.map(() => null));
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
        <button
          type="button"
          className="btn btn--primary karta__sprawdz"
          disabled={odp.some((x) => x === null)}
          onClick={() =>
            onWynik({
              poprawna: odp.every((x, i) => x === poprawne[i]),
              tekst: odp.map((x) => (x ? 'P' : 'F')).join(', '),
            })
          }
        >
          Sprawdź
        </button>
      )}
    </div>
  );
}

function WieleWpisow({
  oczekiwane,
  etykiety,
  zablokowana,
  onWynik,
}: {
  oczekiwane: Oczekiwane[];
  etykiety: string[];
  zablokowana: boolean;
  onWynik: (w: Wynik) => void;
}) {
  const [t, setT] = useState<string[]>(oczekiwane.map(() => ''));
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
        <label key={i} className="wpis__etykieta">
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
          <button type="submit" className="btn btn--primary" disabled={t.some((x) => x.trim() === '')}>
            Sprawdź
          </button>
        </div>
      )}
    </form>
  );
}

function EdytorPython({ python, komputer }: { python: NonNullable<KartaZadanie['python']>; komputer: boolean }) {
  const [otwarty, setOtwarty] = useState(komputer);
  const [kod, setKod] = useState(python.szablon);
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

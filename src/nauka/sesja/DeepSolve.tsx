import { useEffect, useMemo, useRef, useState } from 'react';
import { MathInput } from '@/components/MathInput';
import { Math as Tex } from '@/components/Math';
import { ocenWpis, ocenWybor, poprawnaOdpowiedz, type Ocena } from './ocena';
import type { StanSesji, WynikKroku } from './model';
import { ETAP, type MathTask } from './typy';
import { Akcja, Opcje, type ZglosPomoc } from './wspolne';

/**
 * Deep Solve — jedno pełne zadanie, krok po kroku. Uczeń ROZWIĄZUJE: każdy
 * krok to jego decyzja albo jego rachunek, a gotowa linijka trafia do
 * „Twojego rozwiązania” dopiero po jego odpowiedzi. Pomoc jest stopniowana:
 * wskazówka → pojęcie → następne działanie → podobny przykład → krok.
 */

const SZCZEBLE = ['Wskazówka', 'Pojęcie', 'Następne działanie', 'Podobny przykład'];

/** Klawisze do wyrażeń z parametrem — bez pisania na klawiaturze telefonu. */
const KLAWISZE_WYRAZEN = [
  ['m', 'Parametr m', 'm'],
  ['+', 'Plus', '+'],
  ['·', 'Razy', '*'],
  ['x²', 'Do kwadratu', '^2'],
  ['=', 'Znak równości', '='],
] as const;

interface Props {
  zadanie: MathTask;
  sesja: StanSesji;
  onKrok: (w: WynikKroku) => void;
  zglosPomoc: ZglosPomoc;
  /** Licznik zapytań do AI w tym kroku — kontener go podnosi. */
  aiWKroku: boolean;
}

export function DeepSolve({ zadanie, sesja, onKrok, zglosPomoc, aiWKroku }: Props) {
  const krok = zadanie.steps[sesja.krok]!;
  const nr = sesja.krok + 1;
  const start = useRef(performance.now());
  const [proby, setProby] = useState<Ocena[]>([]);
  const [wybrana, setWybrana] = useState<number | null>(null);
  const [wpis, setWpis] = useState('');
  const [podpowiedzi, setPodpowiedzi] = useState(0);
  const [pokazanyKrok, setPokazanyKrok] = useState(false);
  const [trescOtwarta, setTrescOtwarta] = useState(sesja.krok === 0);
  const [uwaga, setUwaga] = useState<string | null>(null);
  const ostatnia = proby[proby.length - 1];
  const zaliczony = ostatnia?.poprawna === true || pokazanyKrok;
  const info = useRef<HTMLDivElement>(null);

  const drabina = [krok.hintLevel1, krok.hintLevel2, krok.hintLevel3, krok.example];
  const rozwiazanie = useMemo(
    () => zadanie.steps.slice(0, sesja.krok).map((s) => ({ s, w: sesja.wynikiKrokow[s.id] })),
    [zadanie, sesja],
  );

  useEffect(() => {
    zglosPomoc({
      aktywnosc: `pełne zadanie, krok ${nr} z ${zadanie.steps.length}`,
      skill: krok.skill,
      krok: { etap: ETAP[krok.stage], numer: nr, z: zadanie.steps.length, pytanie: krok.prompt, kontekst: krok.objective, wyjasnienie: krok.explanation },
      odpowiedzUcznia: ostatnia?.tekst ?? null,
      czyPoprawna: ostatnia ? ostatnia.poprawna : null,
      podpowiedzi: drabina,
      pokazane: podpowiedzi,
      przyklad: krok.example,
      proby: proby.map((p) => `${p.tekst} (${p.poprawna ? 'dobrze' : 'źle'})`),
      ...(ostatnia?.diagnoza ? { diagnoza: ostatnia.diagnoza.komunikat } : {}),
      sugestie: sugestieKroku(krok.stage, krok.skill),
    });
  }, [proby, podpowiedzi, krok, nr]);

  useEffect(() => {
    if (ostatnia) info.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [ostatnia, pokazanyKrok]);

  const sprawdz = () => {
    if (zaliczony) return;
    let o: Ocena;
    if (krok.answer.typ === 'wybor') {
      if (wybrana === null) return;
      o = ocenWybor(krok.answer, wybrana);
    } else {
      if (!wpis.trim()) return;
      o = ocenWpis(krok.answer, wpis);
      if (o.nieczytelne) {
        setUwaga(krok.answer.typ === 'wyrazenie' ? 'Nie umiem odczytać tego zapisu. Użyj m, +, −, ·, ^ i nawiasów, np. m^2 − 4m.' : 'Wpisz liczbę, np. 9 albo −3/4.');
        return;
      }
    }
    setUwaga(null);
    setProby((p) => [...p, o]);
    if (!o.poprawna && krok.answer.typ === 'wybor') setWybrana(null);
  };

  const dalej = () => {
    const misconceptions = [...new Set(proby.map((p) => p.diagnoza?.misconception).filter((x): x is string => Boolean(x)))];
    onKrok({
      proby: Math.max(1, proby.length),
      podpowiedzi: pokazanyKrok ? 5 : podpowiedzi,
      ai: aiWKroku,
      poprawna: !pokazanyKrok && ostatnia?.poprawna === true,
      czasMs: Math.round(performance.now() - start.current),
      ...(ostatnia ? { odpowiedz: ostatnia.tekst } : {}),
      misconceptions,
    });
  };

  const bledneOpcje = krok.answer.typ === 'wybor'
    ? proby.filter((p) => !p.poprawna).map((p) => (krok.answer.typ === 'wybor' ? krok.answer.opcje.indexOf(p.tekst) : -1))
    : [];
  const prowadzenie = sesja.prowadzenie;

  return (
    <section className="deep" aria-label={`Krok ${nr} z ${zadanie.steps.length}`}>
      <div className="deep__kroki" aria-hidden>
        {zadanie.steps.map((s, i) => {
          const w = sesja.wynikiKrokow[s.id];
          const klasa = i === sesja.krok ? 'teraz' : w?.automatycznie ? 'auto' : w ? (w.poprawna && w.proby === 1 && w.podpowiedzi === 0 ? 'ok' : 'pomoc') : '';
          return <span key={s.id} className={`deep__kropka deep__kropka--${klasa}`} />;
        })}
      </div>

      <button type="button" className={`deep__tresc${trescOtwarta ? ' deep__tresc--otwarta' : ''}`} aria-expanded={trescOtwarta} onClick={() => setTrescOtwarta((o) => !o)}>
        <span className="deep__tresc-etykieta">
          Zadanie · {zadanie.examLevel === 'PR' ? 'poziom rozszerzony' : 'poziom podstawowy'} · {zadanie.points} pkt
          <span aria-hidden>{trescOtwarta ? ' ▴' : ' ▾'}</span>
        </span>
        <span className="deep__tresc-tekst"><Tex>{zadanie.question}</Tex></span>
        {trescOtwarta && <span className="deep__zrodlo">{zadanie.source.opis}</span>}
      </button>

      {rozwiazanie.length > 0 && (
        <details className="deep__rozwiazanie" open={rozwiazanie.length <= 3}>
          <summary>Twoje rozwiązanie · {rozwiazanie.length} {rozwiazanie.length === 1 ? 'krok' : rozwiazanie.length < 5 ? 'kroki' : 'kroków'}</summary>
          <ol>
            {rozwiazanie.map(({ s, w }) => (
              <li key={s.id} className={w?.automatycznie ? 'deep__linia deep__linia--auto' : 'deep__linia'}>
                <Tex>{s.work}</Tex>
                {w?.automatycznie && <span className="deep__auto">oczywiste — zapisane za Ciebie</span>}
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="deep__krok" key={krok.id}>
        <p className="deep__etap">
          Krok {nr} z {zadanie.steps.length} · {ETAP[krok.stage]}
        </p>
        {prowadzenie < 2 && <p className="deep__cel">{krok.objective}</p>}
        <h2 className="deep__polecenie" tabIndex={-1}><Tex>{krok.prompt}</Tex></h2>

        {krok.answer.typ === 'wybor' ? (
          <Opcje
            opcje={krok.answer.opcje}
            wybrana={wybrana}
            bledne={bledneOpcje}
            poprawna={zaliczony ? krok.answer.poprawna : null}
            zablokowane={zaliczony}
            onWybierz={setWybrana}
            ziarno={krok.id}
          />
        ) : (
          <form
            className="deep__wpis"
            onSubmit={(e) => {
              e.preventDefault();
              sprawdz();
            }}
          >
            {krok.answer.etykieta && <label className="deep__etykieta" htmlFor="deep-wpis"><Tex>{krok.answer.etykieta}</Tex></label>}
            <MathInput
              id="deep-wpis"
              value={wpis}
              onChange={(v) => {
                setWpis(v);
                setUwaga(null);
              }}
              disabled={zaliczony}
              placeholder={krok.answer.typ === 'wyrazenie' ? 'np. m^2 − 4m + 1' : 'np. 12'}
              extraKeys={krok.answer.typ === 'wyrazenie' ? KLAWISZE_WYRAZEN : []}
              focusOnly
            />
          </form>
        )}

        {uwaga && <p className="deep__uwaga" role="status">{uwaga}</p>}

        <div ref={info} className="deep__info">
          {ostatnia && !ostatnia.poprawna && !pokazanyKrok && (
            <div className="sesja-info sesja-info--zle" role="status">
              <p className="sesja-info__werdykt">To jeszcze nie to{proby.length > 1 ? ` · próba ${proby.length}` : ''}</p>
              <p><Tex>{ostatnia.diagnoza?.komunikat ?? 'Ta odpowiedź nie wynika z poprzednich kroków. Sprawdź rachunek albo weź podpowiedź.'}</Tex></p>
            </div>
          )}
          {podpowiedzi > 0 && (
            <ol className="deep__podpowiedzi" aria-label="Podpowiedzi">
              {drabina.slice(0, podpowiedzi).map((h, i) => (
                <li key={i}>
                  <span className="deep__szczebel">{SZCZEBLE[i]}</span>
                  <Tex>{h}</Tex>
                </li>
              ))}
            </ol>
          )}
          {zaliczony && (
            <div className={`sesja-info ${pokazanyKrok ? 'sesja-info--pokazane' : 'sesja-info--ok'}`} role="status">
              <p className="sesja-info__werdykt">{pokazanyKrok ? <>Ten krok: <Tex>{poprawnaOdpowiedz(krok.answer)}</Tex></> : '✓ Dobrze'}</p>
              <p><Tex>{krok.explanation}</Tex></p>
              {pokazanyKrok && <p className="karta__uwaga">Krok wróci w powtórce — nie liczy się jako samodzielny.</p>}
            </div>
          )}
        </div>

        {!zaliczony && (
          <div className="deep__pomoc">
            {podpowiedzi < drabina.length ? (
              <button type="button" className="btn btn--small deep__podpowiedz" onClick={() => setPodpowiedzi((n) => n + 1)}>
                {podpowiedzi === 0 ? 'Podpowiedź' : `Kolejna podpowiedź`} <span className="deep__licznik">{podpowiedzi + 1}/{drabina.length}</span>
              </button>
            ) : (
              <button type="button" className="btn btn--small" onClick={() => setPokazanyKrok(true)}>Pokaż ten krok</button>
            )}
            {proby.length >= 3 && podpowiedzi < drabina.length && (
              <button type="button" className="btn btn--small btn--quiet" onClick={() => setPokazanyKrok(true)}>Pokaż ten krok</button>
            )}
          </div>
        )}
      </div>

      {zaliczony ? (
        <Akcja onClick={dalej}>{nr === zadanie.steps.length ? 'Zakończ zadanie' : 'Dalej'} →</Akcja>
      ) : (
        <Akcja onClick={sprawdz} disabled={krok.answer.typ === 'wybor' ? wybrana === null : !wpis.trim()}>Sprawdź</Akcja>
      )}
    </section>
  );
}

function sugestieKroku(etap: string, skill: string): string[] {
  const s: string[] = [];
  if (skill === 'quad-discriminant') s.push('Dlaczego używamy tutaj delty?');
  if (skill === 'quad-vieta') s.push('Skąd biorą się wzory Viète’a?');
  if (etap === 'warunki') s.push('Dlaczego bierzemy część wspólną?');
  if (etap === 'metoda') s.push('Kiedy wybrać inną metodę?');
  return s;
}

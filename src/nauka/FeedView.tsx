import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Math as Tex } from '@/components/Math';
import { ETAP_NAZWA, type Karta, type Lekcja } from './typy';
import { karta as kartaLekcji, LEKCJE } from './lekcje';
import { etykietaZrodla, zadanieCke } from './zadania-cke';
import {
  biezaca,
  biezacaPowtorka,
  numerKroku,
  odpowiedz,
  odpowiedzPowtorka,
  pomin,
  postep,
  kartyTreningu,
  zapiszTrening,
  terminPowtorki,
  trudnosci,
  type StanNauki,
  type Zdarzenie,
} from './silnik';
import { KartaWidok, type Wynik } from './KartaWidok';
import { NauczycielPanel } from './NauczycielPanel';
import type { KontekstNauczyciela } from './nauczyciel-kontekst';
import { kiedy } from './czas';
import './nauka.css';
import { ModalPanel } from '@/components/ModalPanel';

export type Tryb = 'nauka' | 'powtorka' | 'trening';

interface Props {
  lekcja: Lekcja;
  tryb: Tryb;
  stan: StanNauki;
  zmien: (s: StanNauki) => void;
  przedmiot: string;
  onWyjdz: () => void;
  wyklad: (onBack: () => void) => ReactNode;
  onInna: (skillId: string, tryb: Tryb) => void;
  onNastepna: () => void;
  treningDostepny: boolean;
}

interface Pozycja {
  id: string;
  wynik: Wynik | null;
}

function useKomputer(): boolean {
  const zapytanie = '(min-width: 861px)';
  const [k, setK] = useState(() => typeof window !== 'undefined' && window.matchMedia(zapytanie).matches);
  useEffect(() => {
    const m = window.matchMedia(zapytanie);
    const f = () => setK(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return k;
}

export function FeedView({ lekcja: l, tryb, stan, zmien, przedmiot, onWyjdz, wyklad, onInna, onNastepna, treningDostepny }: Props) {
  const komputer = useKomputer();
  const [trening, setTrening] = useState(0);
  const [kolejkaTreningu] = useState(() => kartyTreningu(stan, l, Date.now()));
  const [dobrzeTrening, setDobrzeTrening] = useState(0);
  const obecna = useCallback(
    (s: StanNauki, t = trening): Karta | null => {
      if (tryb === 'nauka') return biezaca(s, l);
      if (tryb === 'powtorka') return biezacaPowtorka(s, l);
      const id = kolejkaTreningu[t];
      return id ? kartaLekcji(l, id) : null;
    },
    [tryb, l, trening, kolejkaTreningu],
  );

  const [biez, setBiez] = useState<Pozycja | null>(() => {
    const k = obecna(stan);
    return k ? { id: k.id, wynik: null } : null;
  });
  const [ekran, setEkran] = useState<'karta' | 'stop' | 'koniec'>(() => (obecna(stan) ? 'karta' : 'koniec'));
  const [historia, setHistoria] = useState<Pozycja[]>([]);
  const [podglad, setPodglad] = useState<number | null>(null);
  const [licznik, setLicznik] = useState(0);
  const [kierunek, setKierunek] = useState<'gora' | 'dol'>('gora');
  const [komunikat, setKomunikat] = useState<string | null>(null);
  const [nauczyciel, setNauczyciel] = useState(false);
  const [wykladOtwarty, setWykladOtwarty] = useState(false);
  const zdarzenie = useRef<Zdarzenie | null>(null);
  const [wynikSerii, setWynikSerii] = useState<string | null>(null);

  const widoczna: Pozycja | null = podglad !== null ? (historia[podglad] ?? null) : biez;
  const k = widoczna ? kartaLekcji(l, widoczna.id) : null;
  const z = k?.zadanieId ? zadanieCke(k.zadanieId) : undefined;
  const p = postep(stan, l);
  const pasekRazem = tryb === 'trening' ? kolejkaTreningu.length : tryb === 'powtorka' ? l.powtorka.length : p.razem;
  const pasekZrobione = tryb === 'trening' ? trening + (biez?.wynik ? 1 : 0)
    : tryb === 'powtorka' ? stan.powtorki[l.skillId]?.sesja?.pozycja ?? 0 : p.zrobione;

  const pokazKomunikat = (t: string | null) => {
    setKomunikat(t);
    if (t) window.setTimeout(() => setKomunikat((x) => (x === t ? null : x)), 3500);
  };

  const onWynik = (w: Wynik) => {
    if (!biez || podglad !== null || biez.wynik) return;
    const teraz = Date.now();
    const nowa = { ...biez, wynik: w };
    setBiez(nowa);
    setHistoria((h) => [...h, nowa]);
    if (tryb === 'nauka') {
      const r = odpowiedz(stan, l, biez.id, w.poprawna, teraz);
      zmien(r.stan);
      zdarzenie.current = r.zdarzenie;
      pokazKomunikat(r.zdarzenie.komunikat);
      if (r.zdarzenie.koniecSerii) {
        // Wynik CAŁEGO zadania CKE — nie ostatniej karty (po nim może być karta pomocnicza).
        const idZadania = l.seria.find((id) => kartaLekcji(l, id).etap === 'zadanie');
        const wz = idZadania ? r.stan.lekcje[l.skillId]?.wyniki[idZadania] : undefined;
        setWynikSerii(wz?.pierwsza === null || !wz ? null : wz.zaliczona ? 'rozwiązane' : 'jeszcze nie');
      }
    } else if (tryb === 'powtorka') {
      const r = odpowiedzPowtorka(stan, l, biez.id, w.poprawna, teraz);
      zmien(r.stan);
      zdarzenie.current = r.zdarzenie;
      pokazKomunikat(r.zdarzenie.komunikat);
    } else {
      zmien(zapiszTrening(stan, biez.id, teraz));
      if (w.poprawna) setDobrzeTrening((n) => n + 1);
      zdarzenie.current = { komunikat: null, stop: false, koniecSerii: trening + 1 >= kolejkaTreningu.length };
    }
  };

  // Następna karta liczona z NAJNOWSZEGO stanu (props), po decyzji ucznia.
  const doNastepnej = (s: StanNauki, t = trening) => {
    const nast = obecna(s, t);
    setKierunek('gora');
    setLicznik((n) => n + 1);
    if (!nast) {
      setBiez(null);
      setEkran('koniec');
      return;
    }
    setBiez({ id: nast.id, wynik: null });
    setEkran('karta');
  };

  const dalej = () => {
    if (nauczyciel) return;
    if (podglad !== null) {
      setPodglad(null);
      setKierunek('gora');
      setLicznik((n) => n + 1);
      return;
    }
    if (ekran === 'stop') {
      doNastepnej(stan);
      return;
    }
    if (!biez || ekran !== 'karta') return;
    if (!biez.wynik) {
      // Pominięcie: dalej, ale bez postępu.
      if (tryb === 'nauka') {
        const s = pomin(stan, l, biez.id);
        zmien(s);
        pokazKomunikat('Pominięto — to nie liczy się do postępu.');
        doNastepnej(s);
      } else if (tryb === 'powtorka') {
        const r = odpowiedzPowtorka(stan, l, biez.id, false, Date.now());
        zmien(r.stan);
        pokazKomunikat('Pominięto — powtórka wróci szybciej.');
        if (r.zdarzenie.koniecSerii) setEkran('koniec');
        else doNastepnej(r.stan);
      } else {
        zmien(zapiszTrening(stan, biez.id, Date.now()));
        const t = trening + 1;
        setTrening(t);
        doNastepnej(stan, t);
      }
      return;
    }
    const zd = zdarzenie.current;
    zdarzenie.current = null;
    if (tryb === 'trening') {
      const t = trening + 1;
      setTrening(t);
      doNastepnej(stan, t);
      return;
    }
    if (zd?.koniecSerii) {
      setBiez(null);
      setEkran('koniec');
      return;
    }
    if (zd?.stop) {
      setEkran('stop');
      return;
    }
    doNastepnej(stan);
  };

  const wstecz = () => {
    if (nauczyciel || historia.length === 0) return;
    const start = biez?.wynik ? historia.length - 2 : historia.length - 1;
    const cel = podglad === null ? start : podglad - 1;
    if (cel < 0) return;
    setPodglad(cel);
    setKierunek('dol');
    setLicznik((n) => n + 1);
  };

  const kontekstAI = useMemo((): KontekstNauczyciela | null => {
    if (!k) return null;
    const nr = numerKroku(stan, l, k.id);
    return {
      przedmiot,
      lekcja: l.tytul,
      zadanie: z
        ? {
            zrodlo: etykietaZrodla(z),
            dokument: z.dokument,
            numer: z.numer,
            poziom: z.poziom,
            url: z.url,
            tresc: z.tresc,
            ...(z.odpowiedzi ? { odpowiedzi: z.odpowiedzi } : {}),
            oficjalnaOdpowiedz: z.oficjalnaOdpowiedz,
            zasadyOceniania: z.zasadyOceniania,
            rozwiazanie: z.rozwiazanie,
          }
        : null,
      krok: {
        etap: ETAP_NAZWA[k.etap],
        numer: nr.krok,
        z: nr.z,
        pytanie: k.pytanie,
        ...(k.kontekst ? { kontekst: k.kontekst } : {}),
        wyjasnienie: k.wyjasnienie,
      },
      odpowiedzUcznia: widoczna?.wynik?.tekst ?? null,
      czyPoprawna: widoczna?.wynik?.poprawna ?? null,
      trudnosci: trudnosci(stan, l),
    };
  }, [k, z, stan, l, przedmiot, widoczna]);

  const relacja = (() => {
    if (!k) return '';
    if (!z) return 'Ćwiczenie pomocnicze FORGE — to nie jest zadanie CKE';
    const zrodlo = `zadania ${z.numer} (${etykietaZrodla(z)}, ${z.rok})`;
    if (tryb === 'nauka' && l.seria.includes(k.id)) {
      const nr = numerKroku(stan, l, k.id);
      return `${ETAP_NAZWA[k.etap]} · krok ${nr.krok} z ${nr.z} ${zrodlo}`;
    }
    if (tryb === 'nauka') return `${ETAP_NAZWA[k.etap]} · łatwiejszy krok ${zrodlo}`;
    return `${tryb === 'trening' ? 'Trening dodatkowy' : 'Powtórka'} · ${ETAP_NAZWA[k.etap]} ${zrodlo}`;
  })();

  const odpowiedziano = Boolean(widoczna?.wynik);
  const previousIndex = podglad !== null ? podglad - 1 : historia.length - (biez?.wynik ? 2 : 1);
  const scene = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    el.scrollTop = 0;
    el.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
  }, [widoczna?.id, licznik, ekran]);
  const inna = LEKCJE.find((x) => x.przedmiot === l.przedmiot && x.skillId !== l.skillId);

  return (
    <div className={`feed${komputer ? ' feed--komputer' : ''}`}>
      <header className="feed__gora">
        <button type="button" className="feed__wyjdz" onClick={onWyjdz} aria-label="Wyjdź z lekcji">
          ✕ <span>Wyjdź</span>
        </button>
        <div className="feed__tytul">
          <p>{tryb === 'nauka' ? l.tytul : tryb === 'powtorka' ? `Powtórka: ${l.tytul}` : `Trening dodatkowy: ${l.tytul}`}</p>
          <div
            className="feed__pasek"
            role="progressbar"
            aria-label={tryb === 'nauka' ? 'Postęp serii (pominięte się nie liczą)' : 'Postęp sesji'}
            aria-valuemin={0}
            aria-valuemax={pasekRazem}
            aria-valuenow={pasekZrobione}
          >
            <span style={{ width: `${pasekRazem ? (100 * pasekZrobione) / pasekRazem : 0}%` }} />
          </div>
        </div>
        <button type="button" className="btn btn--small feed__wyklad" onClick={() => setWykladOtwarty(true)}>
          Wykład
        </button>
      </header>

      <div className="feed__uklad">
        <main ref={scene} className="feed__scena">
          {komunikat && (
            <p className="feed__komunikat" role="status">
              {komunikat}
            </p>
          )}
          {tryb === 'trening' && ekran === 'karta' && <p className="karta__uwaga">Trening dodatkowy — nie zmienia terminu powtórki.</p>}

          {ekran === 'karta' && k && widoczna && (
            <section key={`${widoczna.id}-${licznik}`} className={`feed__karta feed__karta--${kierunek}`} aria-label={relacja}>
              {podglad !== null && <p className="feed__podglad">Poprzednia karta — podgląd. „Dalej” wraca do bieżącej.</p>}
              <div className={`feed__relacja${z ? '' : ' feed__relacja--pomoc'}`}>
                <strong>{tryb === 'nauka' && l.seria.includes(k.id) ? `Krok ${numerKroku(stan,l,k.id).krok} z ${numerKroku(stan,l,k.id).z}` : tryb === 'nauka' ? 'Łatwiejszy krok' : tryb === 'trening' ? 'Trening dodatkowy' : 'Powtórka'} · {ETAP_NAZWA[k.etap]}</strong>
                <span className="feed__meta">{z ? `${etykietaZrodla(z)} · ${z.rok} · zadanie ${z.numer}` : 'Ćwiczenie pomocnicze FORGE — to nie jest zadanie CKE'}</span>
              </div>
              <KartaWidok karta={k} zadanie={z} wynik={widoczna.wynik} komputer={komputer} onWynik={onWynik} />
              {z && <Zrodlo zadanie={z} />}
            </section>
          )}

          {ekran === 'stop' && (
            <section key={`stop-${licznik}`} className="feed__karta feed__stop">
              <h2>
                {historia.length > 0 && kartaLekcji(l, historia[historia.length - 1]!.id).etap === 'zadanie'
                  ? 'Przećwiczyłeś jeden typ zadania. Kończymy czy robimy następne?'
                  : 'Dobra seria kroków. Kończymy na dziś czy idziemy dalej?'}
              </h2>
              <p className="karta__uwaga">Możesz zakończyć sesję i wrócić do nauki później.</p>
              <div className="feed__stop-akcje">
                <button type="button" className="btn btn--primary" onClick={() => doNastepnej(stan)}>
                  Robimy następne
                </button>
                <button type="button" className="btn" onClick={onWyjdz}>
                  Kończę na dziś
                </button>
              </div>
            </section>
          )}

          {ekran === 'koniec' && (
            <Koniec
              lekcja={l}
              tryb={tryb}
              stan={stan}
              wynikSerii={wynikSerii}
              {...(inna ? { inna } : {})}
              onWyjdz={onWyjdz}
              onInna={onInna}
              onNastepna={onNastepna}
              treningDostepny={treningDostepny}
              dobrzeTrening={dobrzeTrening}
              razemTrening={kolejkaTreningu.length}
            />
          )}
        </main>

        {komputer && <PanelZadania lekcja={l} stan={stan} tryb={tryb} aktualna={k?.id ?? null} />}
      </div>

      {ekran === 'karta' && (
        <footer className="feed__dol">
          <div id="feed-primary-action" className="feed__primary">
            {(odpowiedziano || podglad !== null) && <button type="button" className="btn btn--primary" onClick={dalej}>Dalej →</button>}
          </div>
          <div className="feed__tools">
            <button type="button" className="btn btn--quiet" onClick={wstecz} disabled={previousIndex < 0}>← Wstecz</button>
            <button type="button" className="btn btn--quiet" onClick={() => setNauczyciel(true)} disabled={!kontekstAI} aria-label="Zapytaj nauczyciela">Pomoc nauczyciela</button>
            {!odpowiedziano && podglad === null && <button type="button" className="btn btn--quiet" onClick={dalej} title="Pominięcie nie zwiększa postępu">Pomiń</button>}
          </div>
        </footer>
      )}

      {wykladOtwarty && <ModalPanel label="Wykład" className="modal-lesson" onClose={() => setWykladOtwarty(false)}>{wyklad(() => setWykladOtwarty(false))}</ModalPanel>}
      {nauczyciel && kontekstAI && <NauczycielPanel kontekst={kontekstAI} onZamknij={() => setNauczyciel(false)} />}
    </div>
  );
}

function Zrodlo({ zadanie: z }: { zadanie: NonNullable<ReturnType<typeof zadanieCke>> }) {
  return (
    <details className="zrodlo" data-bez-gestu>
      <summary>Źródło i pełne rozwiązanie</summary>
      <p>
        <strong>{etykietaZrodla(z)}</strong> — {z.dokument}, zadanie {z.numer}, poziom {z.poziom === 'PP' ? 'podstawowy' : 'rozszerzony'},{' '}
        {z.punkty} pkt.
      </p>
      <p>
        <a href={z.url} target="_blank" rel="noopener noreferrer">
          Oryginalny dokument (PDF)
        </a>
        {' · '}
        <a href={z.kluczUrl} target="_blank" rel="noopener noreferrer">
          {z.kluczOpis}
        </a>
      </p>
      <p><strong>Oficjalna odpowiedź:</strong> {z.oficjalnaOdpowiedz}</p>
      <p className="karta__uwaga">{z.zasadyOceniania}</p>
      <ol>
        {z.rozwiazanie.map((r, i) => (
          <li key={i}><Tex>{r}</Tex></li>
        ))}
      </ol>
    </details>
  );
}

function Koniec({
  lekcja: l,
  tryb,
  stan,
  wynikSerii,
  inna,
  onWyjdz,
  onInna,
  onNastepna,
  treningDostepny,
  dobrzeTrening,
  razemTrening,
}: {
  lekcja: Lekcja;
  tryb: Tryb;
  stan: StanNauki;
  wynikSerii: string | null;
  inna?: Lekcja;
  onWyjdz: () => void;
  onInna: (skillId: string, tryb: Tryb) => void;
  onNastepna: () => void;
  treningDostepny: boolean;
  dobrzeTrening: number;
  razemTrening: number;
}) {
  const termin = terminPowtorki(stan, l.skillId);
  const p = postep(stan, l);
  return (
    <section className="feed__karta feed__koniec">
      {tryb === 'nauka' && (
        <>
          <h2>Seria skończona</h2>
          {wynikSerii && <p>Całe zadanie CKE: {wynikSerii === 'rozwiązane' ? 'rozwiązane ✔' : 'jeszcze nie — wróci w powtórce'}.</p>}
          <p>
            {termin ? `Powtórka ${kiedy(termin)}` : 'Powtórka zostanie zaplanowana'} — na innym zadaniu CKE. Dopiero poprawna
            odpowiedź po przerwie liczy się jako „pamiętam”.
          </p>
        </>
      )}
      {tryb === 'powtorka' && (
        <>
          <h2>Powtórka skończona</h2>
          <p>Udane powtórki po przerwie: {p.utrwalenie} z 2. {termin ? `Następna ${kiedy(termin)}.` : ''}</p>
        </>
      )}
      {tryb === 'trening' && <>
        <h2>Koniec treningu</h2>
        <p>Poprawnie: {dobrzeTrening} z {razemTrening} kart.</p>
        <p>To wszystkie zadania CKE do tego tematu na dziś.</p>
      </>}
      {tryb !== 'trening' && l.luki && l.luki.length > 0 && (
        <div className="feed__luki">
          <p className="otwarta__tytul">Luki: brak autentycznych zadań CKE</p>
          <ul>
            {l.luki.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="feed__stop-akcje">
        <button type="button" className="btn btn--primary" onClick={tryb === 'trening' ? onNastepna : onWyjdz}>
          {tryb === 'trening' ? 'Kontynuuj' : 'Wróć do „Dziś”'}
        </button>
        {tryb !== 'trening' && treningDostepny && (
          <button type="button" className="btn" onClick={() => onInna(l.skillId, 'trening')}>
            Trening dodatkowy
          </button>
        )}
        {tryb !== 'trening' && inna && postep(stan, inna).status !== 'utrwalona' && (
          <button type="button" className="btn" onClick={() => onInna(inna.skillId, 'nauka')}>
            Następna lekcja: {inna.tytul}
          </button>
        )}
      </div>
    </section>
  );
}

function PanelZadania({ lekcja: l, stan, tryb, aktualna }: { lekcja: Lekcja; stan: StanNauki; tryb: Tryb; aktualna: string | null }) {
  const aktualnaKarta = aktualna ? kartaLekcji(l, aktualna) : null;
  const z = aktualnaKarta?.zadanieId ? zadanieCke(aktualnaKarta.zadanieId) : undefined;
  const s = stan.lekcje[l.skillId];
  return (
    <aside className="panel-zadania" aria-label="Zadanie CKE, do którego prowadzi seria">
      {z && (
        <>
          <p className="panel-zadania__etykieta">
            {etykietaZrodla(z)} · {z.rok} · zad. {z.numer}
          </p>
          {aktualnaKarta?.etap !== 'zadanie' && <p className="panel-zadania__tresc">
            <Tex>{z.tresc}</Tex>
          </p>}
          {aktualnaKarta?.etap !== 'zadanie' && z.odpowiedzi && (
            <p className="panel-zadania__abcd">
              {z.odpowiedzi.map((o, i) => (
                <span key={i}>
                  {'ABCD'[i]}. <Tex>{o}</Tex>
                </span>
              ))}
            </p>
          )}
        </>
      )}
      {tryb === 'nauka' && (
        <ol className="panel-zadania__kroki">
          {l.seria.map((id) => {
            const k = kartaLekcji(l, id);
            const w = s?.wyniki[id];
            const znak = w?.pominieta ? '–' : w?.pierwsza === true ? '✓' : w?.pierwsza === false ? '↺' : '·';
            return (
              <li key={id} className={id === aktualna ? 'on' : ''}>
                <span className="panel-zadania__znak">{znak}</span> {ETAP_NAZWA[k.etap]}
              </li>
            );
          })}
        </ol>
      )}
      <p className="karta__uwaga">Wybierz odpowiedź, a potem ją sprawdź. Do kolejnego kroku przejdziesz przyciskiem „Dalej”.</p>
    </aside>
  );
}

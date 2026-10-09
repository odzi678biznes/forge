import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLessonDraft } from './lesson-draft';
import { feedEngineStamp, isFeedSession, resumeFeedSession, type FeedSession } from './feed-session';
import { useNativeBack } from '@/platform/back-navigation';
import { Math as Tex } from '@/components/Math';
import { ETAP_NAZWA, type Karta, type Lekcja } from './typy';
import { karta as kartaLekcji } from './lekcje';
import { PRACTICE_LEKCJE as LEKCJE, knownWorkedSteps } from './practice-course';
import { getWorkedPlan } from './worked-plans';
import { WorkedCalculation } from './WorkedCalculation';
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
  zastosujTempo,
  type StanNauki,
  type Zdarzenie,
} from './silnik';
import { KartaWidok, type Wynik } from './KartaWidok';
import { NauczycielPanel } from './NauczycielPanel';
import type { Odpowiedz } from './nauczyciel-klient';
import type { KontekstNauczyciela, Prosba } from './nauczyciel-kontekst';
import { kiedy } from './czas';
import { raportKorepetytora, zapytajKorepetytora } from './korepetytor';
import './nauka.css';
import { ModalPanel } from '@/components/ModalPanel';
import { CourseWorkspace } from '@/features/workspace/CourseWorkspace';
import { readWorkspaceNotes } from '@/features/workspace/workspace-draft';
import type { StoragePort } from '@/data/storage-port';

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
  storage?: () => StoragePort;
}

interface Pozycja {
  pomoc?: boolean;
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

export function FeedView(props: Props) {
  return <SavedFeed key={`${props.lekcja.skillId}:${props.tryb}`} {...props} />;
}
function SavedFeed(props: Props) {
  const saved = useLessonDraft(`feed:${props.tryb}:${props.lekcja.skillId}`, props.lekcja.skillId, isFeedSession, props.storage);
  if (!saved.ready) return <p role="status">Wznawiam Twoją lekcję…</p>;
  return <FeedSessionView {...props} initial={resumeFeedSession(saved.value, props.stan, props.lekcja)}
    onCheckpoint={saved.save} saveWarning={saved.warning} />;
}
function FeedSessionView({ lekcja: l, tryb, stan, zmien, przedmiot, onWyjdz, wyklad, onInna, onNastepna, treningDostepny, storage, initial, onCheckpoint, saveWarning }: Props & {
  initial: FeedSession | null; onCheckpoint: (session: FeedSession) => void; saveWarning: string;
}) {
  const komputer = useKomputer();
  const [directTasks, setDirectTasks] = useState<string[]>(initial?.directTasks ?? []);
  const [reviewWorked, setReviewWorked] = useState(false);
  const [helpedTasks, setHelpedTasks] = useState<string[]>(initial?.helpedTasks ?? []);
  const [trening, setTrening] = useState(initial?.trening ?? 0);
  const [kolejkaTreningu] = useState(() => initial?.kolejkaTreningu ?? kartyTreningu(stan, l, Date.now()));
  const [dobrzeTrening, setDobrzeTrening] = useState(initial?.dobrzeTrening ?? 0);
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
    if (initial) return initial.biez;
    const k = obecna(stan);
    return k ? { id: k.id, wynik: null } : null;
  });
  const [ekran, setEkran] = useState<'karta' | 'stop' | 'koniec' | 'odlozona'>(() => initial?.ekran ?? (obecna(stan) ? 'karta' : 'koniec'));
  const [historia, setHistoria] = useState<Pozycja[]>(initial?.historia ?? []);
  const [podglad, setPodglad] = useState<number | null>(initial?.podglad ?? null);
  const [licznik, setLicznik] = useState(0);
  const [kierunek, setKierunek] = useState<'gora' | 'dol'>('gora');
  const [komunikat, setKomunikat] = useState<string | null>(null);
  const [nauczyciel, setNauczyciel] = useState(false);
  const [wykladOtwarty, setWykladOtwarty] = useState(false);
  const [arkusz, setArkusz] = useState(false);
  const [rachunki, setRachunki] = useState(false);
  const [calcAnswer, setCalcAnswer] = useState<{cardId:string;value:string;id:number} | undefined>();
  const [workedProgress, setWorkedProgress] = useState<{tex:string;completed:number;total:number;phase:string;prompt:string;options:string[]} | null>(null);
  const zdarzenie = useRef<Zdarzenie | null>(initial?.zdarzenie ?? null);
  const [wynikSerii, setWynikSerii] = useState<string | null>(initial?.wynikSerii ?? null);
  // Korepetytor w tle: notatka o tempie (null — jeszcze nic nie powiedział).
  const [nota, setNota] = useState<string | null>(initial?.nota ?? null);
  const [notaCzeka, setNotaCzeka] = useState(false);
  const stanRef = useRef(stan);
  stanRef.current = stan;
  // Od kiedy uczeń widzi bieżącą kartę — do pomiaru czasu odpowiedzi.
  const pokazanoOd = useRef(Date.now());
  useEffect(() => { pokazanoOd.current = Date.now(); }, [biez?.id, licznik]);

  useEffect(() => {
    onCheckpoint({ directTasks, helpedTasks, engineStamp: feedEngineStamp(stan, l), trening, kolejkaTreningu, dobrzeTrening,
      biez, ekran, historia, podglad, zdarzenie: zdarzenie.current, wynikSerii, nota });
  }, [directTasks, helpedTasks, stan, l, trening, kolejkaTreningu, dobrzeTrening, biez, ekran, historia, podglad, wynikSerii, nota, onCheckpoint]);

  const korepetytor = (s: StanNauki) => {
    setNotaCzeka(true);
    void zapytajKorepetytora(raportKorepetytora(s, l, przedmiot)).then((d) => {
      zmien(zastosujTempo(stanRef.current, l, d));
      setNota(d.komentarz);
      setNotaCzeka(false);
    });
  };

  const widoczna: Pozycja | null = podglad !== null ? (historia[podglad] ?? null) : biez;
  const k = widoczna ? kartaLekcji(l, widoczna.id) : null;
  const z = k?.zadanieId ? zadanieCke(k.zadanieId) : undefined;
  const availableWorkedPlan = tryb === 'nauka' && k?.etap === 'zadanie' && z ? getWorkedPlan(z.id) : null;
  const workedPlan = availableWorkedPlan && !directTasks.includes(availableWorkedPlan.id) ? availableWorkedPlan : null;
  const notebookId = `feed:${l.skillId}:${tryb}:${z?.id ?? 'practice'}:${tryb === 'nauka' ? 'course' : stan.powtorki[l.skillId]?.ostatnio ?? 'first'}`;
  const p = postep(stan, l);
  const pasekRazem = workedPlan ? workedPlan.steps.length : tryb === 'trening' ? kolejkaTreningu.length : tryb === 'powtorka' ? l.powtorka.length : p.razem;
  const pasekZrobione = workedPlan ? (workedProgress?.completed ?? knownWorkedSteps(stan,l.skillId)) : tryb === 'trening' ? trening + (biez?.wynik ? 1 : 0)
    : tryb === 'powtorka' ? stan.powtorki[l.skillId]?.sesja?.pozycja ?? 0 : p.zrobione;

  const markHelp = (wholeTask = false) => {
    if (wholeTask && k) setHelpedTasks(previous => [...new Set([...previous, k.zadanieId ?? k.id])]);
    if (podglad !== null || !biez || biez.wynik) return;
    setBiez(previous => previous && !previous.pomoc ? { ...previous, pomoc: true } : previous);
  };
  const onTeacherHelp = (response: Odpowiedz, request: Prosba) => {
    if (request !== 'zapis' && response.tekst.trim()) markHelp(request === 'pelne' || response.struktura?.ujawniaWynik === true);
  };

  const pokazKomunikat = (t: string | null) => {
    setKomunikat(t);
    if (t) window.setTimeout(() => setKomunikat((x) => (x === t ? null : x)), 3500);
  };

  const onWynik = (w: Wynik, guided = false) => {
    if (!biez || podglad !== null || biez.wynik) return;
    const teraz = Date.now();
    const nowa = { ...biez, wynik: w, pomoc: guided || Boolean(biez.pomoc) };
    setBiez(nowa);
    setHistoria((h) => [...h, nowa]);
    if (tryb === 'nauka') {
      const r = odpowiedz(stan, l, biez.id, w.poprawna, teraz, teraz - pokazanoOd.current, Boolean(nowa.pomoc));
      zmien(r.stan);
      zdarzenie.current = r.zdarzenie;
      pokazKomunikat(r.zdarzenie.komunikat);
      if (r.zdarzenie.stop || r.zdarzenie.koniecSerii) korepetytor(r.stan);
      if (r.zdarzenie.koniecSerii) {
        // Wynik CAŁEGO zadania CKE — nie ostatniej karty (po nim może być karta pomocnicza).
        const idZadania = l.seria.find((id) => kartaLekcji(l, id).etap === 'zadanie');
        const wz = idZadania ? r.stan.lekcje[l.skillId]?.wyniki[idZadania] : undefined;
        setWynikSerii(wz?.pierwsza === null || !wz ? null : wz.zaliczona ? 'rozwiązane' : 'jeszcze nie');
      }
    } else if (tryb === 'powtorka') {
      const r = odpowiedzPowtorka(stan, l, biez.id, w.poprawna, teraz, Boolean(biez.pomoc));
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
    setBiez({ id: nast.id, wynik: null, pomoc: helpedTasks.includes(nast.zadanieId ?? nast.id) });
    setEkran('karta');
  };

  const dalej = () => {
    if (nauczyciel) return;
    if (podglad !== null) {
      const lastPast = historia.length - (biez?.wynik ? 2 : 1);
      setPodglad(podglad < lastPast ? podglad + 1 : null);
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
      setHistoria(h => [...h, biez]);
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
    if (zd?.odlozona) {
      setBiez(null);
      setEkran('odlozona');
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

  useNativeBack(() => {
    const previous = podglad !== null ? podglad - 1 : biez?.wynik ? historia.length - 2 : historia.length - 1;
    if (previous >= 0) wstecz();
    else onWyjdz();
  }, 10);

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
        pytanie: workedPlan && workedProgress ? workedProgress.prompt : k.pytanie,
        kontekst: [k.kontekst, workedPlan && workedProgress ? `Aktualny zapis po ${workedProgress.completed} z ${workedProgress.total} operacji: $${workedProgress.tex}$. Uczeń wybiera metodę; rachunki wykonuje kalkulator. Opcje tego kroku: ${(workedProgress.options ?? []).map((option,index)=>`${'ABCD'[index]}: ${option}`).join(' | ')}.` : ''].filter(Boolean).join('\n'),
        wyjasnienie: k.wyjasnienie,
      },
      odpowiedzUcznia: widoczna?.wynik?.tekst ?? null,
      czyPoprawna: widoczna?.wynik?.poprawna ?? null,
      trudnosci: trudnosci(stan, l),
    };
  }, [k, z, stan, l, przedmiot, widoczna, notebookId, nauczyciel, rachunki, workedPlan, workedProgress]);

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
  const calculationTarget = k?.rodzaj === 'wpis' && !odpowiedziano && podglad === null
    ? { onUseAnswer: (value:string) => { setCalcAnswer({cardId:k.id,value,id:Date.now()}); setRachunki(false); } } : {};
  const previousIndex = podglad !== null ? podglad - 1 : historia.length - (biez?.wynik ? 2 : 1);
  const scene = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    el.scrollTop = 0;
    el.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
  }, [widoczna?.id, licznik, ekran]);
  const inna = LEKCJE.find((x) => x.przedmiot === l.przedmiot && x.skillId !== l.skillId);

  const widocznyEkran = podglad !== null ? 'karta' : ekran;
  return (
    <div className={`feed feed--simple${komputer ? ' feed--komputer' : ''}`}>
      <header className="feed__gora">
        <button type="button" className="feed__wyjdz" onClick={onWyjdz} aria-label="Wyjdź z lekcji">
          ✕ <span>Wyjdź</span>
        </button>
        <div className="feed__tytul">
          <p>{tryb === 'nauka' ? l.tytul : tryb === 'powtorka' ? `Powtórka: ${l.tytul}` : `Trening dodatkowy: ${l.tytul}`}</p>
          <div className="feed__progress-line">
          <div
            className="feed__pasek"
            role="progressbar"
            aria-label={workedPlan ? 'Postęp obliczeń zadania' : tryb === 'nauka' ? 'Postęp serii (pominięte się nie liczą)' : 'Postęp sesji'}
            aria-valuemin={0}
            aria-valuemax={pasekRazem}
            aria-valuenow={pasekZrobione}
          >
            <span style={{ width: `${pasekRazem ? (100 * pasekZrobione) / pasekRazem : 0}%` }} />
          </div>
          <span className="feed__percent">{Math.round(pasekRazem ? 100*pasekZrobione/pasekRazem : 0)}%</span>
          </div>
          {workedPlan && <span className="feed__phase">{pasekZrobione >= pasekRazem ? 'Gotowe' : workedProgress?.phase ?? workedPlan.phases[0]}</span>}
        </div>
        <button type="button" className="feed__ikona" onClick={() => setArkusz(true)} aria-label="Zadanie i wykład" title={z ? `CKE ${z.rok} · zadanie ${z.numer} · źródło i wykład` : 'Zadanie, źródło i wykład'}>
          📄
        </button>
      </header>

      {saveWarning && <p role="alert">{saveWarning}</p>}
      <div className="feed__uklad">
        <main ref={scene} className="feed__scena">
          {komunikat && (
            <p className="feed__komunikat" role="status">
              {komunikat}
            </p>
          )}
          {tryb === 'trening' && widocznyEkran === 'karta' && <p className="karta__uwaga">Trening dodatkowy — nie zmienia terminu powtórki.</p>}

          {widocznyEkran === 'karta' && k && widoczna && (
            <section key={`${widoczna.id}-${licznik}`} className={`feed__karta feed__karta--${kierunek}`} aria-label={relacja}>
              {podglad !== null && <p className="feed__podglad">Historia</p>}
              {!workedPlan && <p className={`feed__krok${z ? '' : ' feed__krok--pomoc'}`}>
                {tryb === 'nauka' && l.seria.includes(k.id) ? `Krok ${numerKroku(stan,l,k.id).krok}/${numerKroku(stan,l,k.id).z}` : tryb === 'nauka' ? 'Przypomnienie do tego kroku' : tryb === 'trening' ? 'Trening' : 'Powtórka'}
                {z ? ` · CKE ${z.rok}` : ' · ćwiczenie FORGE (nie CKE)'}
              </p>}

              {workedPlan ? <WorkedCalculation plan={workedPlan} storageKey={`worked:${notebookId}`}
                {...(storage ? {storage} : {})} initialCompletedSteps={knownWorkedSteps(stan,l.skillId)}
                completed={Boolean(widoczna.wynik)} onProgress={setWorkedProgress} onHelp={() => markHelp()}
                onComplete={result => onWynik({poprawna:result.poprawna,tekst:result.tekst}, true)} />
                : <KartaWidok {...(calcAnswer ? {answerFromCalculator:calcAnswer} : {})} onHelp={() => markHelp()} draftKey={`feed:${tryb}:${l.skillId}:${k.id}:${podglad ?? Math.max(0, historia.length - (biez?.wynik ? 1 : 0))}`} skillId={l.skillId} {...(storage ? { storage } : {})} karta={k} zadanie={z} wynik={widoczna.wynik} komputer={komputer} onWynik={onWynik} />}
              {workedPlan && !widoczna.wynik && <button type="button" className="link feed__know" onClick={() => {
                if ((workedProgress?.completed ?? 0)>0) markHelp();
                setDirectTasks(ids=>[...new Set([...ids,workedPlan.id])]);
              }}>Znam odpowiedź</button>}
              {availableWorkedPlan && !workedPlan && widoczna.wynik?.poprawna === false && <button type="button" className="link" onClick={() => setReviewWorked(true)}>Rozwiąż krokami</button>}
            </section>
          )}

          {widocznyEkran === 'stop' && (
            <section key={`stop-${licznik}`} className="feed__karta feed__stop">
              <h2>
                {historia.length > 0 && kartaLekcji(l, historia[historia.length - 1]!.id).etap === 'zadanie'
                  ? 'Przećwiczyłeś jeden typ zadania. Kończymy czy robimy następne?'
                  : 'Dobra seria kroków. Kończymy na dziś czy idziemy dalej?'}
              </h2>
              <NotaKorepetytora nota={nota} czeka={notaCzeka} />
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

          {widocznyEkran === 'odlozona' && (
            <section key="odlozona" className="feed__karta feed__stop">
              <h2>Ten temat na dziś odpuszczamy</h2>
              <p>Trzy potknięcia z rzędu to sygnał, że lepiej wrócić tu na świeżo. Jutro zaczniemy od łatwiejszego kroku.</p>
              <div className="feed__stop-akcje">
                <button type="button" className="btn btn--primary" onClick={onNastepna}>Inny temat →</button>
                <button type="button" className="btn" onClick={onWyjdz}>Kończę na dziś</button>
              </div>
            </section>
          )}

          {widocznyEkran === 'koniec' && <NotaKorepetytora nota={nota} czeka={notaCzeka} />}
          {widocznyEkran === 'koniec' && (
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


      </div>

      {widocznyEkran === 'karta' && (
        <footer className="feed__dol">
          <div id="feed-primary-action" className="feed__primary" hidden={Boolean(workedPlan && !odpowiedziano && podglad === null)}>
            {(odpowiedziano || podglad !== null) && <button type="button" className="btn btn--primary" onClick={dalej}>Dalej →</button>}
          </div>
          <div className="feed__tools">
            <button type="button" className="btn btn--quiet" onClick={wstecz} disabled={previousIndex < 0} aria-label="Wstecz" title="Poprzednia karta">←</button>
            {podglad !== null && <button type="button" className="btn btn--quiet" onClick={dalej} aria-label="Następny zapisany krok">Dalej →</button>}
            <button type="button" className="btn btn--quiet" onClick={() => setNauczyciel(true)} disabled={!kontekstAI} aria-label="Zapytaj nauczyciela" title="Zapytaj nauczyciela">Nauczyciel</button>

            {l.przedmiot === 'math' && <button type="button" className="btn btn--quiet" onClick={() => setRachunki(true)} aria-label="Rachunki i kalkulator">Kalkulator</button>}
            {!odpowiedziano && podglad === null && <button type="button" className="btn btn--quiet" onClick={dalej} title="Pominięcie nie zwiększa postępu">Pomiń</button>}
          </div>
        </footer>
      )}

      {reviewWorked && availableWorkedPlan && <ModalPanel label="Rozwiąż krokami" onClose={() => setReviewWorked(false)}>
        <button type="button" className="btn btn--small" onClick={() => setReviewWorked(false)}>Wróć do oceny</button>
        <WorkedCalculation plan={availableWorkedPlan} storageKey={`review:${notebookId}`} {...(storage ? {storage} : {})} onComplete={() => setReviewWorked(false)} />
      </ModalPanel>}
      {arkusz && (
        <ModalPanel label="Zadanie" className="arkusz-zadania" onClose={() => setArkusz(false)}>
          <ArkuszZadania zadanie={z} onWyklad={() => { setArkusz(false); setWykladOtwarty(true); }} onZamknij={() => setArkusz(false)} />
        </ModalPanel>
      )}
      {wykladOtwarty && <ModalPanel label="Wykład" className="modal-lesson" onClose={() => setWykladOtwarty(false)}>{wyklad(() => setWykladOtwarty(false))}</ModalPanel>}
      {nauczyciel && kontekstAI && <NauczycielPanel onOdpowiedz={onTeacherHelp} conversationId={notebookId} kontekst={{ ...kontekstAI, krok: { ...kontekstAI.krok, kontekst: [kontekstAI.krok.kontekst, readWorkspaceNotes(notebookId) ? `Brudnopis ucznia (niesprawdzony):\n${readWorkspaceNotes(notebookId).slice(-6000)}` : ''].filter(Boolean).join('\n') } }} onZamknij={() => setNauczyciel(false)} />}
      {rachunki && kontekstAI && <ModalPanel label="Rachunki w lekcji" className="course-notebook" onClose={() => setRachunki(false)}>
        <button type="button" className="btn btn--small" onClick={() => setRachunki(false)}>Wróć do kroku</button>

        <CourseWorkspace {...calculationTarget} onHelp={onTeacherHelp} context={kontekstAI} skillId={l.skillId} storageKey={notebookId} {...(storage ? { storage } : {})} />
      </ModalPanel>}
    </div>
  );
}

function NotaKorepetytora({ nota, czeka }: { nota: string | null; czeka: boolean }) {
  if (!nota && !czeka) return null;
  return (
    <p className="feed__nota" role="status">
      <span aria-hidden>🧭</span> {nota ?? 'Korepetytor patrzy na Twoje tempo…'}
    </p>
  );
}

/** Wszystko poza bieżącym krokiem — w jednym miejscu, pod ikoną 📄. */
function ArkuszZadania({ zadanie: z, onWyklad, onZamknij }: {
  zadanie: ReturnType<typeof zadanieCke>; onWyklad: () => void; onZamknij: () => void;
}) {
  return (
    <div className="arkusz">
      <header className="arkusz__glowa">
        <p className="arkusz__tytul">{z ? `Zadanie ${z.numer} · ${etykietaZrodla(z)} ${z.rok}` : 'Ćwiczenie pomocnicze'}</p>
        <button type="button" className="btn btn--small" onClick={onZamknij}>Zamknij</button>
      </header>
      {z && (
        <>
          <p className="arkusz__tresc"><Tex>{z.tresc}</Tex></p>
          {z.odpowiedzi && (
            <p className="arkusz__abcd">{z.odpowiedzi.map((o, i) => <span key={i}>{'ABCD'[i]}. <Tex>{o}</Tex></span>)}</p>
          )}
          <Zrodlo zadanie={z} />
        </>
      )}
      {!z && <p className="karta__uwaga">Do tego tematu nie ma autentycznego zadania CKE — to ćwiczenie przygotowane przez FORGE.</p>}
      <button type="button" className="btn arkusz__wyklad" onClick={onWyklad}>📖 Wykład do lekcji</button>
    </div>
  );
}

function Zrodlo({ zadanie: z }: { zadanie: NonNullable<ReturnType<typeof zadanieCke>> }) {
  return (
    <details className="zrodlo" data-bez-gestu>
      <summary>Źródło i pełne rozwiązanie</summary>
      <p className="karta__uwaga">Samo odsłonięcie rozwiązania nie zalicza zadania.</p>
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

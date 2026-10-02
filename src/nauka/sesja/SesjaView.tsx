import { useCallback, useMemo, useRef, useState } from 'react';
import { useNativeBack } from '@/platform/back-navigation';
import { Math as Tex } from '@/components/Math';
import { Ring } from '@/components/Ring';
import type { CardState, Flashcard, SkillState } from '@/data/types';
import type { CardRating } from '@/learning-engine/flashcards';
import { NauczycielPanel } from '../NauczycielPanel';
import type { KontekstNauczyciela, Prosba } from '../nauczyciel-kontekst';
import type { Odpowiedz } from '../nauczyciel-klient';
import { BLEDY, opisBledu } from './bledy';
import { DeepSolve } from './DeepSolve';
import { Klocki } from './Klocki';
import { Mikro } from './Mikro';
import {
  DRABINA,
  aktywneBledy,
  opanowanie,
  opanowanieTematu,
  zapiszBlad,
  type Dowod,
  type PostepV2,
} from './model';
import {
  kolejnyPoziom,
  szczebelZadania,
  nastepna,
  ocenaZadania,
  rozpocznij,
  wybierzFiszki,
  zakonczKrok,
  zakonczSesje,
  zakonczWstawke,
  zapiszSpeed,
  type Aktywnosc,
  type Otoczenie,
} from './silnik-sesji';
import { SpeedRound } from './SpeedRound';
import { TaliaSwipe, type Kierunek } from './Swipe';
import { FISZKI_DEMO, KROTKIE_NAZWY, UMIEJETNOSCI_TEMATU, ZADANIE_PARAMETR, klocki, mikro, speed } from './tresc';
import type { MathTask } from './typy';
import { sekundy, type OpisPomocy } from './wspolne';
import './sesja.css';

/**
 * Nowy sposób nauki matematyki — jedna inteligentna lekcja zamiast zestawu
 * quizów. Kontener łączy silnik sesji (co teraz), model wiedzy v2 (co uczeń
 * umie) i nauczyciela AI, który jest dostępny na KAŻDYM ekranie lekcji
 * i zna jej kontekst.
 */

export type TrybSesji = 'lekcja' | 'fiszki';

interface Props {
  tryb: TrybSesji;
  postep: PostepV2;
  zmien: (p: PostepV2) => void;
  /** Dotychczasowe poziomy 0–5 (spójny widok starego silnika i feedu). */
  dawne: Map<string, SkillState>;
  fiszki: Flashcard[];
  stanyFiszek: Map<string, CardState>;
  /** Ocena fiszki w ISTNIEJĄCYM systemie pudełek. */
  onOcenFiszke: (f: Flashcard, r: CardRating) => void;
  nazwyUmiejetnosci: Record<string, string>;
  onWyjdz: () => void;
  onTryb: (t: TrybSesji) => void;
}

const nazwaKrotka = (s: string, pelne: Record<string, string>) => KROTKIE_NAZWY[s] ?? pelne[s] ?? s;

export function SesjaView(props: Props) {
  const { tryb, postep, zmien, dawne, fiszki, stanyFiszek, onOcenFiszke, nazwyUmiejetnosci, onWyjdz, onTryb } = props;
  const task: MathTask = ZADANIE_PARAMETR;
  const otoczenie: Otoczenie = useMemo(
    () => ({ dawne, fiszki: fiszki.filter((f) => FISZKI_DEMO.includes(f.id)), stanyFiszek }),
    [dawne, fiszki, stanyFiszek],
  );
  // Bieżąca aktywność jest „zamrożona” na czas jej trwania — ocena fiszki
  // czy zapis AI nie może podmienić zadania pod palcem.
  const [akt, setAkt] = useState<Aktywnosc | null>(() => (postep.sesja && postep.sesja.koniec === null ? nastepna(postep, task, otoczenie) : null));
  const [komunikat, setKomunikat] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);
  const [aiWKroku, setAiWKroku] = useState(false);
  const opis = useRef<OpisPomocy | null>(null);
  const [, odswiez] = useState(0);
  const zglosPomoc = useCallback((o: OpisPomocy) => {
    opis.current = o;
  }, []);

  const przejdz = (p: PostepV2) => {
    zmien(p);
    setAkt(nastepna(p, task, otoczenie));
    setAiWKroku(false);
    odswiez((n) => n + 1);
    window.scrollTo({ top: 0 });
    document.querySelector('.sesja__scena')?.scrollTo({ top: 0 });
  };
  const pokaz = (t: string | null) => {
    setKomunikat(t);
    if (t) window.setTimeout(() => setKomunikat((x) => (x === t ? null : x)), 3800);
  };

  useNativeBack(() => (panel ? setPanel(false) : onWyjdz()), 10);

  const mTematu = Math.round(opanowanieTematu(postep, UMIEJETNOSCI_TEMATU, dawne));
  const s = postep.sesja;
  const krokiZrobione = s ? task.steps.filter((x) => s.wynikiKrokow[x.id]).length : 0;

  // ---------------------------------------------------------------- AI
  const kontekst = (): KontekstNauczyciela | null => {
    const o = opis.current;
    if (!o) return null;
    const zadanie = akt?.typ === 'deep' || akt?.typ === 'mikro';
    const skills = [...new Set([o.skill, ...UMIEJETNOSCI_TEMATU])];
    return {
      przedmiot: 'Matematyka',
      lekcja: `${task.topic} — ${task.subtopic}`,
      zadanie: zadanie
        ? {
            zrodlo: 'Zadanie w stylu maturalnym FORGE (nie CKE)',
            dokument: task.source.opis,
            numer: '—',
            poziom: task.examLevel,
            url: '',
            tresc: task.question,
            oficjalnaOdpowiedz: task.finalAnswer,
            zasadyOceniania: 'Zadanie FORGE — bez oficjalnych zasad oceniania CKE. Liczy się poprawny tok: warunek Δ > 0, wzory Viète’a, nierówność i część wspólna.',
            rozwiazanie: task.steps.map((x) => x.work),
          }
        : null,
      krok: o.krok,
      odpowiedzUcznia: o.odpowiedzUcznia,
      czyPoprawna: o.czyPoprawna,
      trudnosci: s ? task.steps.filter((x) => (s.wynikiKrokow[x.id]?.proby ?? 0) > 1).map((x) => x.prompt) : [],
      sesja: {
        aktywnosc: o.aktywnosc,
        opanowanie: Object.fromEntries(skills.map((id) => [nazwaKrotka(id, nazwyUmiejetnosci), Math.round(opanowanie(postep, id, dawne))])),
        bledy: aktywneBledy(postep).slice(0, 5).map((b) => `${BLEDY[b.tag]?.nazwa ?? b.tag} (${b.licznik}×)`),
        podpowiedziPokazane: o.podpowiedzi.slice(0, o.pokazane),
        podpowiedzi: o.podpowiedzi,
        ...(o.przyklad ? { przyklad: o.przyklad } : {}),
        proby: o.proby,
        rozwiazanieUcznia: s ? task.steps.slice(0, s.krok).map((x) => x.work) : [],
        znaneBledy: Object.keys(BLEDY),
        ...(o.diagnoza ? { diagnoza: o.diagnoza } : {}),
      },
    };
  };
  const poOdpowiedziAI = (o: Odpowiedz, _p: Prosba) => {
    setAiWKroku(true);
    const tag = o.struktura?.misconception;
    if (tag) zmien(zapiszBlad(postep, tag, Date.now()));
  };

  // ---------------------------------------------------------------- ekrany
  let scena: JSX.Element;
  if (tryb === 'fiszki') {
    scena = <TaliaFiszek {...props} otoczenie={otoczenie} onKoniec={() => onTryb('lekcja')} />;
  } else if (!s || s.koniec !== null || !akt) {
    scena = (
      <Start
        postep={postep}
        dawne={dawne}
        task={task}
        mTematu={mTematu}
        nazwy={nazwyUmiejetnosci}
        onStart={() => {
          const p = s && s.koniec === null ? postep : rozpocznij(postep, task, otoczenie, Date.now());
          przejdz(p);
        }}
        onFiszki={() => onTryb('fiszki')}
      />
    );
  } else if (akt.typ === 'deep') {
    const krok = task.steps[akt.krok]!;
    scena = (
      <DeepSolve
        key={krok.id}
        zadanie={task}
        sesja={s}
        aiWKroku={aiWKroku}
        zglosPomoc={zglosPomoc}
        onKrok={(w) => {
          const r = zakonczKrok(postep, task, w, otoczenie, Date.now());
          pokaz(r.komunikat);
          przejdz(r.postep);
        }}
      />
    );
  } else if (akt.typ === 'mikro') {
    const z = mikro(akt.id)!;
    scena = (
      <Mikro
        key={z.id}
        zadanie={z}
        powod={akt.powod}
        zglosPomoc={zglosPomoc}
        onKoniec={(w) => {
          const d: Dowod = { skill: z.skill, zrodlo: 'mikro', poprawna: w.poprawna, proby: w.proby, podpowiedzi: w.podpowiedz ? 1 : 0, ai: aiWKroku, czasMs: w.czasMs, trudnosc: 2, misconceptions: w.misconceptions, teraz: Date.now() };
          przejdz(zakonczWstawke(postep, `mikro:${z.id}`, [d], otoczenie));
        }}
      />
    );
  } else if (akt.typ === 'fiszki') {
    scena = (
      <FiszkiWLekcji
        ids={akt.ids}
        powod={akt.powod}
        fiszki={otoczenie.fiszki}
        nazwy={nazwyUmiejetnosci}
        onOcen={onOcenFiszke}
        onKoniec={(dowody) => przejdz(zakonczWstawke(postep, 'fiszki', dowody, otoczenie))}
      />
    );
  } else if (akt.typ === 'klocki') {
    const k = klocki(akt.id)!;
    scena = (
      <Klocki
        key={k.id}
        zadanie={k}
        powod={akt.powod}
        zglosPomoc={zglosPomoc}
        onKoniec={(w) => {
          const d: Dowod = { skill: k.skill, zrodlo: 'klocki', poprawna: true, proby: 1 + w.bledy, podpowiedzi: 0, ai: aiWKroku, czasMs: w.czasMs, trudnosc: 2, misconceptions: w.misconceptions, ominiete: w.bledy === 0 ? k.dystraktory.map((x) => x.misconception).filter((x): x is string => Boolean(x)) : [], teraz: Date.now() };
          przejdz(zakonczWstawke(postep, `klocki:${k.id}`, [d], otoczenie));
        }}
      />
    );
  } else if (akt.typ === 'podsumowanie') {
    scena = <Podsumowanie postep={postep} task={task} dawne={dawne} nazwy={nazwyUmiejetnosci} onDalej={() => przejdz(zakonczWstawke(postep, 'podsumowanie', [], otoczenie))} />;
  } else if (akt.typ === 'speed') {
    scena = (
      <SpeedRound
        key={akt.ids.join()}
        pytania={akt.ids.map((id) => speed(id)!).filter(Boolean)}
        zglosPomoc={zglosPomoc}
        onKoniec={(w) => {
          const teraz = Date.now();
          const dowody: Dowod[] = w.odpowiedzi.map((o) => ({
            skill: o.pytanie.skill, zrodlo: 'speed', poprawna: o.poprawna, proby: 1, podpowiedzi: 0, ai: false, czasMs: o.czasMs, trudnosc: 2,
            ...(o.misconception ? { misconceptions: [o.misconception] } : {}),
            ...(o.poprawna && o.pytanie.misconception ? { ominiete: [o.pytanie.misconception] } : {}),
            teraz,
          }));
          let p = zakonczWstawke(postep, 'speed', dowody, otoczenie);
          p = zapiszSpeed(p, { dobrze: w.dobrze, razem: w.odpowiedzi.length, sredniCzasMs: w.sredniCzasMs, doPowtorki: w.doPowtorki });
          przejdz(p);
        }}
      />
    );
  } else {
    scena = (
      <Koniec
        postep={postep}
        task={task}
        onWyjdz={() => {
          zmien(zakonczSesje(postep, task, otoczenie, Date.now()));
          onWyjdz();
        }}
        onJeszcze={() => {
          const p = zakonczSesje(postep, task, otoczenie, Date.now());
          przejdz(rozpocznij(p, task, otoczenie, Date.now()));
        }}
      />
    );
  }

  const wLekcji = tryb === 'lekcja' && s && s.koniec === null && akt;
  const k = panel ? kontekst() : null;
  return (
    <div className="sesja">
      <header className="sesja__gora">
        <button type="button" className="sesja__wyjdz" onClick={onWyjdz} aria-label="Wyjdź z lekcji">✕</button>
        <div className="sesja__tytul">
          <p>{tryb === 'fiszki' ? 'Fiszki · matematyka' : `${task.topic}`}</p>
          {wLekcji && (
            <div className="sesja__pasek" role="progressbar" aria-label="Postęp zadania" aria-valuemin={0} aria-valuemax={task.steps.length} aria-valuenow={krokiZrobione}>
              <span style={{ width: `${(100 * krokiZrobione) / task.steps.length}%` }} />
            </div>
          )}
        </div>
        <span className="sesja__opanowanie" title="Opanowanie tematu">{mTematu}%</span>
      </header>

      <main className="sesja__scena">
        {komunikat && <p className="sesja__komunikat" role="status">{komunikat}</p>}
        {scena}
      </main>

      <footer className="sesja__dol">
        {wLekcji && (
          <button
            type="button"
            className="btn sesja__ai"
            onClick={() => setPanel(true)}
            aria-label="Zapytaj AI — nauczyciel zna to zadanie i Twoje kroki"
          >
            <span aria-hidden>✦</span> Zapytaj AI
          </button>
        )}
        <div id="sesja-akcja" className="sesja__akcja-miejsce" />
      </footer>

      {panel && k && (
        <NauczycielPanel
          kontekst={k}
          onZamknij={() => setPanel(false)}
          szybkie={['podpowiedz', 'nie-rozumiem', 'prosciej', 'podobny', 'co-zle']}
          sugestie={opis.current?.sugestie ?? []}
          onOdpowiedz={poOdpowiedziAI}
          wstep="Znam to zadanie, miejsce, w którym jesteś, i to, co już zrobiłeś. Zacznę od najmniejszej podpowiedzi — wyniku nie podam, dopóki o niego nie poprosisz."

        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ ekran 1: start

function Start({ postep, dawne, task, mTematu, nazwy, onStart, onFiszki }: {
  postep: PostepV2; dawne: Map<string, SkillState>; task: MathTask; mTematu: number; nazwy: Record<string, string>; onStart: () => void; onFiszki: () => void;
}) {
  const s = postep.sesja;
  const wToku = s && s.koniec === null;
  const bledy = aktywneBledy(postep).slice(0, 2);
  const szczebel = postep.szczebel[task.topic] ?? szczebelZadania(task);
  return (
    <section className="start">
      <p className="start__nad">Kontynuuj matematykę</p>
      <div className="start__karta">
        <div className="start__glowa">
          <div>
            <h1 className="start__temat">{task.topic}</h1>
            <p className="start__pod">{task.subtopic} · {task.examLevel === 'PR' ? 'rozszerzenie' : 'podstawa'}</p>
          </div>
          <Ring value={mTematu / 100} size={76} stroke={7} label="Poziom opanowania" />
        </div>
        <p className="start__poziom">Poziom opanowania: <strong>{mTematu}%</strong></p>
        <ul className="start__umiejetnosci">
          {UMIEJETNOSCI_TEMATU.map((id) => {
            const m = Math.round(opanowanie(postep, id, dawne));
            return (
              <li key={id}>
                <span className="start__nazwa">{nazwaKrotka(id, nazwy)}</span>
                <span className="start__bar" aria-hidden><span style={{ width: `${m}%` }} /></span>
                <span className="start__liczba">{m}</span>
              </li>
            );
          })}
        </ul>
        {bledy.length > 0 && (
          <p className="start__uwaga">
            Na co uważać: {bledy.map((b) => opisBledu(b.tag).nazwa).join(' · ')}
          </p>
        )}
        <p className="start__plan">
          {wToku
            ? `Wracasz do kroku ${Math.min(s.krok + 1, task.steps.length)} z ${task.steps.length}.`
            : `Pełne zadanie maturalne (${task.steps.length} kroków) z krótkimi przerwami na mikro-zadania i fiszki, na koniec ⚡ szybka powtórka. Ok. 15 min.`}
        </p>
        <p className="start__szczebel">Poziom zadań: {DRABINA[szczebel]}</p>
        <button type="button" className="btn btn--primary start__przycisk" onClick={onStart}>
          {wToku ? 'Kontynuuj' : 'Zacznij lekcję'} <span aria-hidden>→</span>
        </button>
      </div>
      <button type="button" className="start__link" onClick={onFiszki}>
        Fiszki swipe · {FISZKI_DEMO.length} kart z funkcji kwadratowej i powtórek →
      </button>
      <p className="karta__uwaga start__info">
        Nowy tryb nauki (demo). Twój dotychczasowy postęp zostaje bez zmian — ten tryb zapisuje się osobno, a przed pierwszym zapisem robi kopię bezpieczeństwa.
      </p>
    </section>
  );
}

// ------------------------------------------------------------------ fiszki

function kartaSwipe(f: Flashcard, nazwy: Record<string, string>) {
  return {
    id: f.id,
    przod: (
      <div className="fiszka">
        <span className="fiszka__rodzaj">{nazwaKrotka(f.skillId, nazwy)}</span>
        <p className="fiszka__pytanie"><Tex>{f.front}</Tex></p>
        <span className="fiszka__dotknij">Dotknij, aby odwrócić</span>
      </div>
    ),
    tyl: (
      <div className="fiszka fiszka--tyl">
        <span className="fiszka__rodzaj">Odpowiedź</span>
        <p className="fiszka__odpowiedz"><Tex>{f.back}</Tex></p>
      </div>
    ),
  };
}

const ETYKIETY_FISZEK: Record<Kierunek, string> = { prawo: 'Wiedziałem', lewo: 'Nie wiedziałem' };

function dowodFiszki(f: Flashcard, k: Kierunek, czasMs: number): Dowod {
  return { skill: f.skillId, zrodlo: 'fiszka', poprawna: k === 'prawo', proby: 1, podpowiedzi: 0, ai: false, czasMs, trudnosc: 2, samoocena: true, teraz: Date.now() };
}

function FiszkiWLekcji({ ids, powod, fiszki, nazwy, onOcen, onKoniec }: {
  ids: string[]; powod: string; fiszki: Flashcard[]; nazwy: Record<string, string>; onOcen: (f: Flashcard, r: CardRating) => void; onKoniec: (d: Dowod[]) => void;
}) {
  const karty = useMemo(() => ids.map((id) => fiszki.find((f) => f.id === id)).filter((f): f is Flashcard => Boolean(f)), [ids, fiszki]);
  const [dowody, setDowody] = useState<Dowod[]>([]);
  const talia = useMemo(() => karty.map((f) => kartaSwipe(f, nazwy)), [karty, nazwy]);
  const koniec = dowody.length >= karty.length;
  return (
    <section className="fiszki-lekcja">
      <p className="mikro__etykieta">
        <span className="mikro__znacznik">🃏 {karty.length} szybkie fiszki</span>
        <span className="mikro__powod">{powod}</span>
      </p>
      <TaliaSwipe
        karty={talia}
        etykiety={ETYKIETY_FISZEK}
        onDecyzja={(k, kier, czas) => {
          const f = karty.find((x) => x.id === k.id)!;
          onOcen(f, kier === 'prawo' ? 'good' : 'again');
          setDowody((d) => [...d, dowodFiszki(f, kier, czas)]);
        }}
      />
      {koniec && (
        <div className="sesja-info sesja-info--ok" role="status">
          <p>{dowody.filter((d) => d.poprawna).length}/{karty.length} „wiedziałem”. {dowody.some((d) => !d.poprawna) ? 'Karty „nie wiedziałem” wrócą już jutro.' : 'Te karty wrócą po dłuższej przerwie.'}</p>
          <button type="button" className="btn btn--primary sesja-info__dalej" onClick={() => onKoniec(dowody)}>Wracamy do zadania →</button>
        </div>
      )}
    </section>
  );
}

function TaliaFiszek({ postep, zmien, otoczenie, nazwyUmiejetnosci, onOcenFiszke, onKoniec }: Props & { otoczenie: Otoczenie; onKoniec: () => void }) {
  // Kolejność: najpierw to, co najsłabsze i zaległe. „Nie wiedziałem” wraca raz na końcu talii.
  const [kolejka, setKolejka] = useState(() => wybierzFiszki({ ...postep, sesja: null }, otoczenie, otoczenie.fiszki.length));
  const [powtorzone, setPowtorzone] = useState<string[]>([]);
  const ocenione = useRef(new Set<string>());
  const [wynik, setWynik] = useState({ tak: 0, nie: 0 });
  const p = useRef(postep);
  p.current = postep;
  const karty = useMemo(
    () => kolejka.map((id, n) => ({ ...kartaSwipe(otoczenie.fiszki.find((f) => f.id === id)!, nazwyUmiejetnosci), id: `${id}#${n}` })),
    [kolejka, otoczenie.fiszki, nazwyUmiejetnosci],
  );
  const koniec = wynik.tak + wynik.nie >= kolejka.length;
  return (
    <section className="fiszki-lekcja">
      <p className="mikro__etykieta">
        <span className="mikro__znacznik">🃏 Fiszki swipe</span>
        <span className="mikro__powod">„Nie wiedziałem” — karta wraca szybciej (jutro). „Wiedziałem” — coraz rzadziej.</span>
      </p>
      {!koniec && <p className="fiszki-lekcja__licznik">{wynik.tak + wynik.nie + 1} / {kolejka.length}</p>}
      <TaliaSwipe
        karty={karty}
        etykiety={ETYKIETY_FISZEK}
        onDecyzja={(k, kier, czas) => {
          const id = k.id.split('#')[0]!;
          const f = otoczenie.fiszki.find((x) => x.id === id)!;
          // W systemie pudełek liczy się pierwsza odpowiedź; powtórka na końcu talii to tylko utrwalenie.
          if (!ocenione.current.has(id)) {
            ocenione.current.add(id);
            onOcenFiszke(f, kier === 'prawo' ? 'good' : 'again');
            p.current = zakonczWstawkeFiszki(p.current, dowodFiszki(f, kier, czas), otoczenie);
            zmien(p.current);
          }
          setWynik((w) => (kier === 'prawo' ? { ...w, tak: w.tak + 1 } : { ...w, nie: w.nie + 1 }));
          if (kier === 'lewo' && !powtorzone.includes(id)) {
            setPowtorzone((x) => [...x, id]);
            setKolejka((q) => [...q, id]);
          }
        }}
      />
      {koniec && (
        <div className="sesja-info sesja-info--ok" role="status">
          <p className="sesja-info__werdykt">Talia skończona</p>
          <p>Wiedziałem: {wynik.tak} · Nie wiedziałem: {wynik.nie}. Karty „nie wiedziałem” wrócą jutro, pozostałe — po dłuższej przerwie (1, 3, 7, 14… dni).</p>
          <button type="button" className="btn btn--primary sesja-info__dalej" onClick={onKoniec}>Wróć do lekcji →</button>
        </div>
      )}
    </section>
  );
}

/** Fiszka poza lekcją: tylko model wiedzy (bez zmiany stanu sesji). */
function zakonczWstawkeFiszki(p: PostepV2, d: Dowod, o: Otoczenie): PostepV2 {
  const bezSesji = zakonczWstawke({ ...p, sesja: null }, 'fiszka', [d], o);
  return { ...bezSesji, sesja: p.sesja };
}

// ------------------------------------------------------------------ ekran 7: podsumowanie

function Podsumowanie({ postep, task, dawne, nazwy, onDalej }: { postep: PostepV2; task: MathTask; dawne: Map<string, SkillState>; nazwy: Record<string, string>; onDalej: () => void }) {
  const s = postep.sesja!;
  const o = ocenaZadania(s, task);
  const zmiany = Object.entries(s.startOpanowanie)
    .map(([id, przed]) => ({ id, przed: Math.round(przed), po: Math.round(opanowanie(postep, id, dawne)) }))
    .filter((z) => z.przed !== z.po);
  return (
    <section className="podsumowanie" aria-label="Podsumowanie zadania">
      <p className="mikro__etykieta"><span className="mikro__znacznik">Zadanie rozwiązane</span></p>
      <h2 className="mikro__pytanie">Odpowiedź: <Tex>{task.finalAnswer}</Tex></h2>
      <p className="podsumowanie__samodzielnie">Samodzielnie, za pierwszym razem: <strong>{Math.round(o.samodzielnie * 100)}%</strong> kroków</p>
      {o.mocne.length > 0 && <p className="podsumowanie__mocne">✓ Dobrze radzisz sobie z: {o.mocne.map((x) => nazwaKrotka(x, nazwy)).join(', ')}.</p>}
      {o.slabe.length > 0 && <p className="podsumowanie__slabe">↺ Problem sprawia: {o.slabe.map((x) => nazwaKrotka(x, nazwy)).join(', ')}.</p>}
      {o.bledy.length > 0 && (
        <ul className="podsumowanie__bledy">
          {o.bledy.map((b) => (
            <li key={b}><strong>{opisBledu(b).nazwa}</strong> — <Tex>{opisBledu(b).naprawa}</Tex></li>
          ))}
        </ul>
      )}
      {zmiany.length > 0 && (
        <ul className="podsumowanie__zmiany" aria-label="Zmiana opanowania">
          {zmiany.map((z) => (
            <li key={z.id}>
              <span>{nazwaKrotka(z.id, nazwy)}</span>
              <span className={z.po > z.przed ? 'w-gore' : 'w-dol'}>{z.przed} → {z.po}</span>
            </li>
          ))}
        </ul>
      )}
      <details className="deep__rozwiazanie">
        <summary>Całe Twoje rozwiązanie</summary>
        <ol>{task.steps.map((x) => <li key={x.id} className="deep__linia"><Tex>{x.work}</Tex></li>)}</ol>
      </details>
      <button type="button" className="btn btn--primary sesja-info__dalej" onClick={onDalej}>Dalej: ⚡ szybka powtórka →</button>
    </section>
  );
}

// ------------------------------------------------------------------ ekran 9: koniec

function Koniec({ postep, task, onWyjdz, onJeszcze }: { postep: PostepV2; task: MathTask; onWyjdz: () => void; onJeszcze: () => void }) {
  const s = postep.sesja!;
  const o = ocenaZadania(s, task);
  const obecny = postep.szczebel[task.topic] ?? szczebelZadania(task);
  const nast = kolejnyPoziom(o.samodzielnie, obecny);
  return (
    <section className="koniec" aria-label="Koniec lekcji">
      <h2 className="mikro__pytanie">Lekcja skończona</h2>
      {s.speed && (
        <p className="koniec__speed">⚡ {s.speed.dobrze}/{s.speed.razem} · średnio {sekundy(s.speed.sredniCzasMs)}{s.speed.doPowtorki ? ` · do powtórki: ${s.speed.doPowtorki}` : ''}</p>
      )}
      <p className="koniec__nastepne">{nast.opis}</p>
      <ol className="drabina" aria-label="Drabina trudności">
        {DRABINA.map((d, i) => (
          <li key={d} className={i === nast.szczebel ? 'drabina__teraz' : i < nast.szczebel ? 'drabina__za' : ''}>
            {d}
          </li>
        ))}
      </ol>
      <div className="koniec__akcje">
        <button type="button" className="btn btn--primary" onClick={onWyjdz}>Zakończ na dziś</button>
        <button type="button" className="btn" onClick={onJeszcze}>Jeszcze raz — z mniejszym prowadzeniem</button>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Math as Tex } from '@/components/Math';
import type { ZadanieKlocki } from './typy';
import { Akcja, type ZglosPomoc } from './wspolne';

/**
 * „Ułóż rozwiązanie”: uczeń przeciąga klocki (albo dotyka — jednym kciukiem)
 * na miejsce następnego kroku. Pula odsłania się z postępem: widać następny
 * krok, jeden krok „z przyszłości” (pułapka kolejności) i kuszące błędy
 * dotyczące właśnie tego miejsca.
 */

interface Klocek {
  klucz: string;
  tekst: string;
  /** Indeks poprawnego kroku albo -1 dla dystraktora. */
  krok: number;
}

export interface WynikKlockow {
  bledy: number;
  misconceptions: string[];
  czasMs: number;
}

function tasuj<T>(xs: T[], ziarno: number): T[] {
  const a = [...xs];
  let h = 2166136261 ^ ziarno;
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345;
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export function Klocki({ zadanie, powod, onKoniec, zglosPomoc }: { zadanie: ZadanieKlocki; powod: string; onKoniec: (w: WynikKlockow) => void; zglosPomoc: ZglosPomoc }) {
  const [ulozone, setUlozone] = useState(0);
  const [odrzucone, setOdrzucone] = useState<string[]>([]);
  const [komunikat, setKomunikat] = useState<{ tekst: string; klocek: string; ok: boolean } | null>(null);
  const [bledy, setBledy] = useState<string[]>([]);
  const [potrzasnij, setPotrzasnij] = useState<string | null>(null);
  const [nowy, setNowy] = useState<number | null>(null);
  const start = useRef(performance.now());
  const strefa = useRef<HTMLLIElement>(null);
  const [nadStrefa, setNadStrefa] = useState(false);
  const koniec = ulozone >= zadanie.kroki.length;

  const pula = useMemo((): Klocek[] => {
    if (koniec) return [];
    const k: Klocek[] = [{ klucz: `k${ulozone}`, tekst: zadanie.kroki[ulozone]!, krok: ulozone }];
    if (ulozone + 1 < zadanie.kroki.length) k.push({ klucz: `k${ulozone + 1}`, tekst: zadanie.kroki[ulozone + 1]!, krok: ulozone + 1 });
    const dys = zadanie.dystraktory
      .filter((d) => !odrzucone.includes(d.tekst) && (d.etap === ulozone || d.etap === ulozone + 1))
      .sort((a, b) => Math.abs(a.etap - ulozone) - Math.abs(b.etap - ulozone));
    for (const d of dys) if (k.length < zadanie.widoczne) k.push({ klucz: `d-${d.tekst}`, tekst: d.tekst, krok: -1 });
    return tasuj(k, ulozone * 7 + odrzucone.length);
  }, [ulozone, odrzucone, zadanie, koniec]);

  useEffect(() => {
    zglosPomoc({
      aktywnosc: 'układanie rozwiązania z klocków',
      skill: zadanie.skill,
      krok: {
        etap: 'Ułóż rozwiązanie',
        numer: ulozone + 1,
        z: zadanie.kroki.length,
        pytanie: `${zadanie.problem} Ułożone kroki: ${zadanie.kroki.slice(0, ulozone).join(' → ') || 'jeszcze żaden'}. Jaki klocek następny?`,
        wyjasnienie: 'Każdy krok musi wynikać z poprzedniego.',
      },
      odpowiedzUcznia: komunikat && !komunikat.ok ? komunikat.klocek : null,
      czyPoprawna: komunikat ? komunikat.ok : null,
      podpowiedzi: [],
      pokazane: 0,
      proby: bledy,
      ...(komunikat && !komunikat.ok ? { diagnoza: komunikat.tekst } : {}),
      sugestie: komunikat && !komunikat.ok ? ['Dlaczego ten krok tu nie pasuje?'] : [],
    });
  }, [ulozone, komunikat, bledy, zadanie, zglosPomoc]);

  const poloz = (k: Klocek) => {
    if (koniec) return;
    if (k.krok === ulozone) {
      setUlozone((n) => n + 1);
      setNowy(ulozone);
      setKomunikat(null);
      return;
    }
    setPotrzasnij(k.klucz);
    window.setTimeout(() => setPotrzasnij((x) => (x === k.klucz ? null : x)), 400);
    if (k.krok > ulozone) {
      setKomunikat({ tekst: 'Ten krok jest poprawny, ale matematycznie nie wynika jeszcze z poprzedniego. Co musi być przed nim?', klocek: k.tekst, ok: false });
      setBledy((b) => [...b, 'step-order']);
    } else {
      const d = zadanie.dystraktory.find((x) => x.tekst === k.tekst);
      setKomunikat({ tekst: d?.komunikat ?? 'Ten krok tu nie pasuje.', klocek: k.tekst, ok: false });
      setOdrzucone((o) => [...o, k.tekst]);
      setBledy((b) => [...b, d?.misconception ?? 'step-order']);
    }
  };

  return (
    <section className="klocki" aria-label="Ułóż rozwiązanie z klocków">
      <p className="mikro__etykieta">
        <span className="mikro__znacznik">🧩 {zadanie.tytul}</span>
        <span className="mikro__powod">{powod}</span>
      </p>
      <h2 className="mikro__pytanie" tabIndex={-1}><Tex>{zadanie.problem}</Tex></h2>

      <ol className="klocki__tor" aria-label="Twoje rozwiązanie">
        {zadanie.kroki.slice(0, ulozone).map((t, i) => (
          <li key={i} className={`klocki__miejsce klocki__miejsce--pelne${nowy === i ? ' klocki__miejsce--nowe' : ''}`}>
            <span className="klocki__nr">{i + 1}</span>
            <Tex>{t}</Tex>
          </li>
        ))}
        {!koniec && (
          <li ref={strefa} className={`klocki__miejsce klocki__miejsce--puste${nadStrefa ? ' klocki__miejsce--nad' : ''}`}>
            <span className="klocki__nr">{ulozone + 1}</span>
            <span className="klocki__zacheta">Przeciągnij tu następny krok</span>
          </li>
        )}
      </ol>

      {komunikat && !komunikat.ok && (
        <div className="sesja-info sesja-info--zle" role="status">
          <p className="sesja-info__werdykt"><Tex>{komunikat.klocek}</Tex> — nie tutaj</p>
          <p><Tex>{komunikat.tekst}</Tex></p>
        </div>
      )}

      {!koniec && (
        <div className="klocki__pula" aria-label="Klocki do wyboru">
          {pula.map((k) => (
            <KlocekWidok
              key={k.klucz}
              klocek={k}
              trzesie={potrzasnij === k.klucz}
              strefa={strefa}
              onNad={setNadStrefa}
              onUpusc={() => poloz(k)}
            />
          ))}
        </div>
      )}
      {!koniec && <p className="karta__uwaga">Przeciągnij klocek na pole „{ulozone + 1}” albo go dotknij.</p>}

      {koniec && (
        <>
          <div className="sesja-info sesja-info--ok" role="status">
            <p className="sesja-info__werdykt">✓ Rozwiązanie ułożone{bledy.length === 0 ? ' bez pomyłki' : ` · ${bledy.length} ${bledy.length === 1 ? 'pomyłka' : 'pomyłki'}`}</p>
            <p>Każdy krok wynika z poprzedniego: dane → wzór → podstawienie → wynik.</p>
          </div>
          <Akcja onClick={() => onKoniec({ bledy: bledy.length, misconceptions: bledy.filter((b) => b !== 'step-order'), czasMs: Math.round(performance.now() - start.current) })}>
            Dalej →
          </Akcja>
        </>
      )}
    </section>
  );
}

/** Klocek: dotknięcie albo przeciągnięcie (pływająca kopia pod palcem). */
function KlocekWidok({ klocek, trzesie, strefa, onNad, onUpusc }: {
  klocek: Klocek;
  trzesie: boolean;
  strefa: RefObject<HTMLLIElement>;
  onNad: (nad: boolean) => void;
  onUpusc: () => void;
}) {
  const el = useRef<HTMLButtonElement>(null);
  const gest = useRef<{ x: number; y: number; id: number; ciagnie: boolean; kopia: HTMLElement | null; ox: number; oy: number } | null>(null);
  const nadStrefa = (x: number, y: number) => {
    const r = strefa.current?.getBoundingClientRect();
    return Boolean(r && x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 24 && y <= r.bottom + 24);
  };
  const sprzatnij = () => {
    gest.current?.kopia?.remove();
    el.current?.classList.remove('klocek--ciagniety');
    gest.current = null;
    onNad(false);
  };
  // Kopia pod palcem nie może zostać na ekranie, gdy klocek zniknie w trakcie gestu.
  useEffect(() => () => gest.current?.kopia?.remove(), []);
  return (
    <button
      ref={el}
      type="button"
      className={`klocek${trzesie ? ' klocek--zle' : ''}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const r = el.current!.getBoundingClientRect();
        // Przechwycenie od razu: szybki ruch myszy nie „zgubi” klocka (dotyk robi to sam).
        el.current!.setPointerCapture(e.pointerId);
        gest.current = { x: e.clientX, y: e.clientY, id: e.pointerId, ciagnie: false, kopia: null, ox: e.clientX - r.left, oy: e.clientY - r.top };
      }}
      onPointerMove={(e) => {
        const g = gest.current;
        if (!g || g.id !== e.pointerId) return;
        if (!g.ciagnie) {
          if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < 6) return;
          g.ciagnie = true;
          const r = el.current!.getBoundingClientRect();
          const kopia = el.current!.cloneNode(true) as HTMLElement;
          kopia.classList.add('klocek--kopia');
          kopia.style.width = `${r.width}px`;
          document.body.appendChild(kopia);
          g.kopia = kopia;
          el.current!.classList.add('klocek--ciagniety');
        }
        g.kopia!.style.transform = `translate3d(${e.clientX - g.ox}px, ${e.clientY - g.oy}px, 0) rotate(-2deg) scale(1.04)`;
        onNad(nadStrefa(e.clientX, e.clientY));
      }}
      onPointerUp={(e) => {
        const g = gest.current;
        if (!g || g.id !== e.pointerId) return;
        const upusc = !g.ciagnie || nadStrefa(e.clientX, e.clientY);
        sprzatnij();
        if (upusc) onUpusc();
      }}
      onPointerCancel={sprzatnij}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onUpusc();
        }
      }}
      onClick={(e) => e.preventDefault()}
    >
      <Tex>{klocek.tekst}</Tex>
    </button>
  );
}

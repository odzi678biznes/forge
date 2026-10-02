import { useEffect, useRef, useState } from 'react';
import { Math as Tex } from '@/components/Math';
import { ocenWybor, type Ocena } from './ocena';
import type { MikroZadanie } from './typy';
import { Akcja, Opcje, type ZglosPomoc } from './wspolne';

/**
 * Mikro-zadanie: 5–20 sekund, jedno dotknięcie. Dotknięcie opcji = odpowiedź
 * (szybkie tempo). Po błędzie — konkretna przyczyna i druga szansa.
 */

const RODZAJ: Record<MikroZadanie['rodzaj'], string> = {
  'nastepny-krok': 'Następny krok',
  wzor: 'Właściwy wzór',
  wykres: 'Wykres',
  'gdzie-blad': 'Znajdź błąd',
  uzupelnij: 'Uzupełnij',
  'legalne-przeksztalcenie': 'Legalne przekształcenie',
  metoda: 'Metoda',
  'prawda-falsz': 'Prawda czy fałsz',
};

export interface WynikMikro {
  poprawna: boolean;
  proby: number;
  czasMs: number;
  misconceptions: string[];
  podpowiedz: boolean;
}

export function Mikro({ zadanie, powod, onKoniec, zglosPomoc }: { zadanie: MikroZadanie; powod: string; onKoniec: (w: WynikMikro) => void; zglosPomoc: ZglosPomoc }) {
  const start = useRef(performance.now());
  const [proby, setProby] = useState<Array<Ocena & { i: number }>>([]);
  const [podpowiedz, setPodpowiedz] = useState(false);
  const [czas, setCzas] = useState<number | null>(null);
  const odp = zadanie.odpowiedz;
  const opcje = odp.typ === 'wybor' ? odp.opcje : [];
  const ostatnia = proby[proby.length - 1];
  const koniec = ostatnia?.poprawna === true || proby.length >= 2;

  useEffect(() => {
    zglosPomoc({
      aktywnosc: `mikro-zadanie (${RODZAJ[zadanie.rodzaj]})`,
      skill: zadanie.skill,
      krok: { etap: RODZAJ[zadanie.rodzaj], numer: 1, z: 1, pytanie: zadanie.pytanie, ...(zadanie.kontekst ? { kontekst: zadanie.kontekst } : {}), wyjasnienie: zadanie.wyjasnienie },
      odpowiedzUcznia: ostatnia?.tekst ?? null,
      czyPoprawna: ostatnia ? ostatnia.poprawna : null,
      podpowiedzi: [zadanie.podpowiedz],
      pokazane: podpowiedz ? 1 : 0,
      proby: proby.map((p) => p.tekst),
      ...(ostatnia?.diagnoza ? { diagnoza: ostatnia.diagnoza.komunikat } : {}),
      sugestie: [],
    });
  }, [proby, podpowiedz, zadanie, zglosPomoc, ostatnia]);

  const wybierz = (i: number) => {
    if (koniec || odp.typ !== 'wybor') return;
    const o = ocenWybor(odp, i);
    const nowe = [...proby, { ...o, i }];
    setProby(nowe);
    if (o.poprawna || nowe.length >= 2) setCzas(performance.now() - start.current);
  };

  return (
    <section className="mikro" aria-label="Krótkie zadanie">
      <p className="mikro__etykieta">
        <span className="mikro__znacznik">⏱ {RODZAJ[zadanie.rodzaj]}</span>
        <span className="mikro__powod">{powod}</span>
      </p>
      {zadanie.kontekst && <p className="mikro__kontekst"><Tex>{zadanie.kontekst}</Tex></p>}
      <h2 className="mikro__pytanie" tabIndex={-1}><Tex>{zadanie.pytanie}</Tex></h2>
      <Opcje
        opcje={opcje}
        wybrana={null}
        bledne={proby.filter((p) => !p.poprawna).map((p) => p.i)}
        poprawna={koniec && odp.typ === 'wybor' ? odp.poprawna : null}
        zablokowane={koniec}
        onWybierz={wybierz}
        ziarno={zadanie.id}
        {...(zadanie.wykresy ? { wykresy: zadanie.wykresy } : {})}
      />
      {ostatnia && !ostatnia.poprawna && (
        <div className="sesja-info sesja-info--zle" role="status">
          <p><Tex>{ostatnia.diagnoza?.komunikat ?? 'Nie ta odpowiedź.'}</Tex></p>
          {!koniec && <p className="karta__uwaga">Spróbuj jeszcze raz.</p>}
        </div>
      )}
      {koniec && (
        <div className={`sesja-info ${ostatnia?.poprawna ? 'sesja-info--ok' : 'sesja-info--pokazane'}`} role="status">
          <p className="sesja-info__werdykt">{ostatnia?.poprawna ? '✓ Dobrze' : 'Poprawna odpowiedź zaznaczona'}{czas !== null && ostatnia?.poprawna ? ` · ${(czas / 1000).toFixed(1).replace('.', ',')} s` : ''}</p>
          <p><Tex>{zadanie.wyjasnienie}</Tex></p>
        </div>
      )}
      {!koniec && !podpowiedz && (
        <button type="button" className="btn btn--small btn--quiet" onClick={() => setPodpowiedz(true)}>Podpowiedź</button>
      )}
      {podpowiedz && !koniec && <p className="mikro__podpowiedz"><Tex>{zadanie.podpowiedz}</Tex></p>}
      {koniec && (
        <Akcja
          onClick={() =>
            onKoniec({
              poprawna: ostatnia?.poprawna === true,
              proby: proby.length,
              czasMs: Math.round(czas ?? performance.now() - start.current),
              misconceptions: proby.map((p) => p.diagnoza?.misconception).filter((x): x is string => Boolean(x)),
              podpowiedz,
            })
          }
        >
          Wracamy do zadania →
        </Akcja>
      )}
    </section>
  );
}

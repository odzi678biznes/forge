import type { ReactNode } from 'react';
import { Math as Tex } from '@/components/Math';

/**
 * Odpowiedź nauczyciela w czytelnej formie: akapity, listy, pogrubienia
 * i wzory w osobnych liniach. Mały, przewidywalny podzbiór Markdownu —
 * bez HTML-a, więc treść z serwera nie może niczego wstrzyknąć.
 */

export type Blok =
  | { rodzaj: 'akapit'; tekst: string }
  | { rodzaj: 'naglowek'; tekst: string }
  | { rodzaj: 'wzor'; tekst: string }
  | { rodzaj: 'lista'; numerowana: boolean; punkty: string[] };

const PUNKT = /^\s*[-*•]\s+(.*)$/;
const NUMER = /^\s*\d+[.)]\s+(.*)$/;
const NAGLOWEK = /^\s*#{1,6}\s+(.*)$/;

export function naBloki(tekst: string): Blok[] {
  const bloki: Blok[] = [];
  const linie = tekst.replace(/\r\n/g, '\n').split('\n');
  let akapit: string[] = [];
  const zamknijAkapit = () => {
    if (akapit.length) bloki.push({ rodzaj: 'akapit', tekst: akapit.join(' ') });
    akapit = [];
  };

  for (let i = 0; i < linie.length; i++) {
    const linia = linie[i]!.trim();
    if (!linia) { zamknijAkapit(); continue; }

    // $$ … $$ — wzór w osobnej linii (także rozpisany na kilka linii).
    if (linia.startsWith('$$')) {
      zamknijAkapit();
      let wzor = linia.slice(2);
      if (wzor.endsWith('$$') && wzor.length >= 2) wzor = wzor.slice(0, -2);
      else {
        while (i + 1 < linie.length) {
          const nast = linie[++i]!.trim();
          if (nast.endsWith('$$')) { wzor += ' ' + nast.slice(0, -2); break; }
          wzor += ' ' + nast;
        }
      }
      if (wzor.trim()) bloki.push({ rodzaj: 'wzor', tekst: wzor.trim() });
      continue;
    }

    const n = NAGLOWEK.exec(linia);
    if (n) { zamknijAkapit(); bloki.push({ rodzaj: 'naglowek', tekst: n[1]! }); continue; }

    const p = PUNKT.exec(linia) ?? NUMER.exec(linia);
    if (p) {
      zamknijAkapit();
      const numerowana = !PUNKT.test(linia);
      const ostatni = bloki[bloki.length - 1];
      if (ostatni?.rodzaj === 'lista' && ostatni.numerowana === numerowana) ostatni.punkty.push(p[1]!);
      else bloki.push({ rodzaj: 'lista', numerowana, punkty: [p[1]!] });
      continue;
    }

    // Linia bez pustej linii przed nią: nauczyciel zwykle pisze „zdanie\nzdanie” —
    // traktujemy to jako osobne akapity, żeby nic się nie zlewało.
    zamknijAkapit();
    akapit.push(linia);
  }
  zamknijAkapit();
  return bloki;
}

/** Tekst z **pogrubieniami**; reszta (wzory $…$, kod `…`) przez KaTeX. */
function Linia({ children }: { children: string }) {
  const czesci = children.split(/\*\*(.+?)\*\*/g);
  const out: ReactNode[] = czesci.map((c, i) =>
    c ? (i % 2 ? <strong key={i}><Tex>{c}</Tex></strong> : <Tex key={i}>{c}</Tex>) : null,
  );
  return <>{out}</>;
}

export function Sformatowane({ tekst }: { tekst: string }) {
  return (
    <div className="sformatowane">
      {naBloki(tekst).map((b, i) => {
        switch (b.rodzaj) {
          case 'akapit':
            return <p key={i}><Linia>{b.tekst}</Linia></p>;
          case 'naglowek':
            return <p key={i} className="sformatowane__naglowek"><Linia>{b.tekst}</Linia></p>;
          case 'wzor':
            return <div key={i} className="sformatowane__wzor"><Tex display>{`$${b.tekst}$`}</Tex></div>;
          case 'lista': {
            const Lista = b.numerowana ? 'ol' : 'ul';
            return <Lista key={i}>{b.punkty.map((t, j) => <li key={j}><Linia>{t}</Linia></li>)}</Lista>;
          }
        }
      })}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoragePort } from '@/data/storage-port';
import { nowyStan, type StanNauki } from './silnik';

/**
 * Stan prototypu nauki zapisywany AUTOMATYCZNIE po każdej odpowiedzi.
 * Trzymamy go w preferencjach tego samego portu co reszta aplikacji, więc
 * trafia też do kopii JSON i łączenia urządzeń — bez nowej tabeli w bazie.
 */

export const KLUCZ = 'nauka.v1';

function wczytaj(json: string | undefined): StanNauki {
  if (!json) return nowyStan();
  try {
    const s = JSON.parse(json) as StanNauki;
    return s && s.wersja === 1 && s.lekcje && s.powtorki ? s : nowyStan();
  } catch {
    return nowyStan();
  }
}

/** `gotowy` — port jest zainicjowany; wcześniej nie czytamy, żeby nie zacząć od pustego stanu. */
export function useNauka(port: () => StoragePort, gotowy: boolean) {
  const [stan, setStan] = useState<StanNauki | null>(null);
  const zapis = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (!gotowy) return;
    let anulowane = false;
    void port()
      .loadPreferences()
      .then((prefs) => {
        if (!anulowane) setStan(wczytaj(prefs.find((p) => p.key === KLUCZ)?.value));
      })
      .catch(() => {
        if (!anulowane) setStan(nowyStan());
      });
    return () => {
      anulowane = true;
    };
  }, [port, gotowy]);

  const zmien = useCallback(
    (nowy: StanNauki) => {
      setStan(nowy);
      // Zapisy po kolei — szybkie odpowiedzi nie nadpiszą nowszego stanu starszym.
      zapis.current = zapis.current.then(() => port().setPreference(KLUCZ, JSON.stringify(nowy))).catch(() => undefined);
    },
    [port],
  );

  return { stan, zmien };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoragePort } from '@/data/storage-port';
import { KLUCZ_V2, nowyPostep, wczytajPostep, type PostepV2 } from './model';

/**
 * Trwałość modelu wiedzy v2 — zapis automatyczny po każdej zmianie.
 *
 * Bezpieczeństwo dotychczasowego postępu:
 * - zapisujemy WYŁĄCZNIE do własnego klucza `learning_progress_v2`;
 * - przed pierwszym zapisem v2 robimy kopię bezpieczeństwa całego profilu
 *   (ta sama funkcja co przed importem) — da się do niej wrócić z ekranu
 *   „Twoje dane”;
 * - zapisy idą po kolei, więc szybkie gesty nie nadpiszą nowszego stanu.
 */
export function useSesja(port: () => StoragePort, gotowy: boolean) {
  const [postep, setPostep] = useState<PostepV2 | null>(null);
  const zapis = useRef<Promise<void>>(Promise.resolve());
  const pierwszyZapis = useRef(false);

  useEffect(() => {
    if (!gotowy) return;
    let anulowane = false;
    void port()
      .loadPreferences()
      .then((prefs) => {
        const json = prefs.find((p) => p.key === KLUCZ_V2)?.value;
        pierwszyZapis.current = json === undefined;
        if (!anulowane) setPostep(wczytajPostep(json, Date.now()));
      })
      .catch(() => {
        if (!anulowane) setPostep(nowyPostep(Date.now()));
      });
    return () => {
      anulowane = true;
    };
  }, [port, gotowy]);

  const zmien = useCallback(
    (nowy: PostepV2) => {
      setPostep(nowy);
      zapis.current = zapis.current
        .then(async () => {
          if (pierwszyZapis.current) {
            pierwszyZapis.current = false;
            await port().saveBackup('Przed pierwszym użyciem nowego trybu nauki matematyki').catch(() => undefined);
          }
          await port().setPreference(KLUCZ_V2, JSON.stringify(nowy));
        })
        .catch(() => undefined);
    },
    [port],
  );

  return { postep, zmien };
}

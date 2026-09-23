import { buildSolution, collectValues, type RawRun } from '@/learning-engine/run-tests';
import { lockDown } from './lockdown';

/**
 * Worker wykonujący kod ucznia — Blueprint sek. 9 i 15, Etap 4.
 *
 * Kolejność ma znaczenie i jest częścią bezpieczeństwa:
 * 1. przechwytujemy prawdziwe `postMessage` do zmiennej modułu — zmienne
 *    modułu nie są globalne, więc kod ucznia jej nie dosięgnie,
 * 2. odbieramy zakresowi sieć, magazyny i `postMessage` (lockdown),
 * 3. dopiero wtedy przyjmujemy wiadomość i wykonujemy kod ucznia.
 *
 * Bez kroku 1-2 kod ucznia mógłby sam wysłać do głównego wątku podrobiony
 * wynik „wszystko zaliczone". Główny wątek i tak porównuje wartości z
 * oczekiwaniami, których worker nie zna, więc podróbka by nie przeszła —
 * ale nie zostawiamy tej drogi otwartej.
 */

interface RunMessage {
  nonce: string;
  source: string;
  functionName: string;
  /** Wyłącznie argumenty. Oczekiwane wyniki nigdy tu nie trafiają. */
  inputs: unknown[][];
}

type Post = (message: { nonce: string; raw: RawRun }) => void;

const scope = self as unknown as { postMessage: Post; onmessage: unknown };
const post: Post = scope.postMessage.bind(scope);
const survivors = lockDown(self);

self.onmessage = (e: MessageEvent<RunMessage>) => {
  const { nonce, source, functionName, inputs } = e.data;

  // Jesli nie udalo sie odebrac kanalu komunikacji, kod ucznia moglby
  // podszyc sie pod piaskownice - wtedy odmawiamy uruchomienia.
  if (survivors.includes('postMessage')) {
    post({
      nonce,
      raw: {
        status: 'compile-error',
        values: [],
        message: 'Piaskownica nie mogła się zabezpieczyć i odmówiła uruchomienia kodu.',
      },
    });
    return;
  }

  const { solve, error } = buildSolution(source, functionName);
  const raw: RawRun = solve
    ? collectValues(solve, inputs)
    : { status: 'compile-error', values: [], message: error };

  post({ nonce, raw });
};

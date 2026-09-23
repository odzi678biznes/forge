import {
  DEFAULT_RUN_TIMEOUT_MS,
  gradeRun,
  type CodeRunner,
  type CodeTest,
  type RunResult,
} from '@/learning-engine/code-grading';

/**
 * Piaskownica uruchamiania kodu — Blueprint sek. 9 i 15, Etap 4.
 *
 * Kod ucznia wykonuje się w Web Workerze, który:
 * - nie ma dostępu do DOM ani do stanu aplikacji,
 * - dostaje WYŁĄCZNIE argumenty testów — oczekiwane wyniki zostają tutaj,
 *   w głównym wątku, i tu odbywa się porównanie,
 * - sam odbiera sobie sieć, magazyny tego samego origin i `postMessage`,
 *   zanim wykona kod ucznia (szczegóły i ograniczenia: `lockdown.ts`),
 * - jest ubijany po przekroczeniu limitu czasu, co przerywa również
 *   nieskończoną pętlę — a tego nie da się zrobić bez osobnego wątku.
 *
 * Każde uruchomienie ma jednorazowy nonce. Wiadomość bez niego jest
 * ignorowana, więc nawet gdyby kod ucznia odzyskał kanał komunikacji,
 * nie podmieni wyniku.
 *
 * ŚWIADOME OGRANICZENIE: językiem jest JavaScript, a matura z informatyki
 * dopuszcza C++, Pythona i Javę. Uruchamianie tamtych wymaga toolchainu na
 * maszynie ucznia, więc będzie osobnym adapterem tego samego portu.
 */
export class WorkerCodeRunner implements CodeRunner {
  async run(
    source: string,
    functionName: string,
    tests: CodeTest[],
    timeoutMs: number = DEFAULT_RUN_TIMEOUT_MS,
  ): Promise<RunResult> {
    if (tests.length === 0) {
      return { status: 'ok', outcomes: [], message: null };
    }

    const nonce = crypto.randomUUID();
    const worker = new Worker(new URL('./code-worker.ts', import.meta.url), {
      type: 'module',
    });

    return new Promise<RunResult>((resolve) => {
      let settled = false;

      const finish = (result: RunResult) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        worker.terminate();
        resolve(result);
      };

      // Ubicie workera to jedyny sposób na przerwanie nieskończonej pętli.
      const timer = window.setTimeout(() => {
        finish(
          gradeRun(tests, {
            status: 'timeout',
            values: [],
            message: `Przekroczono limit ${timeoutMs} ms.`,
          }),
        );
      }, timeoutMs);

      worker.onmessage = (e: MessageEvent<unknown>) => {
        const data = e.data as { nonce?: unknown; raw?: unknown } | null;
        // Wiadomość bez właściwego nonce nie jest wynikiem tej piaskownicy.
        if (!data || data.nonce !== nonce) return;
        finish(gradeRun(tests, data.raw));
      };

      worker.onerror = (e) => {
        finish({
          status: 'runtime-error',
          outcomes: [],
          message: e.message || 'Piaskownica nie dała się uruchomić.',
        });
      };

      worker.postMessage({
        nonce,
        source,
        functionName,
        inputs: tests.map((t) => t.input),
      });
    });
  }
}

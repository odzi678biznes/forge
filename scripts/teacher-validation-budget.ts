import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { OdpowiedzNauczyciela } from '../src/nauka/nauczyciel-kontekst';

// One allocation shared by command-line and browser tests; never reset on reruns.
export const budgetDir = resolve('.forge/teacher-validation-2026-10-08');
const ledgerFile = resolve(budgetDir, 'budget.json');
const LIMIT = 3, RESERVE = 1;
export type TeacherRun = { id:string; state:'reserved'|'settled'; usd:number; result?:OdpowiedzNauczyciela; durationMs?:number; error?:string };
type Ledger = { allocation:'user-2026-10-08-claude-teacher-3usd'; limitUsd:3; runs:TeacherRun[] };

export async function readTeacherBudget(): Promise<Ledger> {
  let ledger: Ledger;
  try { ledger = JSON.parse(await readFile(ledgerFile, 'utf8')) as Ledger; }
  catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    ledger = { allocation:'user-2026-10-08-claude-teacher-3usd', limitUsd:3, runs:[] };
  }
  if (ledger.allocation !== 'user-2026-10-08-claude-teacher-3usd' || ledger.limitUsd !== LIMIT || !Array.isArray(ledger.runs)
    || ledger.runs.some(r => !Number.isFinite(r.usd) || r.usd < 0)) throw new Error('Invalid ledger; stop without resetting.');
  return ledger;
}

/** For direct SDK calls with retries disabled: UTF-8 bytes bound input tokens. */
export function boundedTeacherReservation(bounds: { inputBytes:number; outputTokens:number }): number {
  if (!Number.isInteger(bounds.inputBytes) || bounds.inputBytes < 1 || bounds.inputBytes > 200000
    || !Number.isInteger(bounds.outputTokens) || bounds.outputTokens < 1 || bounds.outputTokens > 8000) throw new Error('Invalid bounded provider request.');
  return ((bounds.inputBytes + 2048)*2 + bounds.outputTokens*10)/1e6;
}
export async function budgetedTeacherCall(id: string, send: () => Promise<OdpowiedzNauczyciela>, bounds?: { inputBytes:number; outputTokens:number }): Promise<TeacherRun> {
  const reservation = bounds ? boundedTeacherReservation(bounds) : RESERVE;
  await mkdir(budgetDir, { recursive: true });
  const lockPath = resolve(budgetDir, 'budget.lock');
  const lock = await open(lockPath, 'wx').catch(() => { throw new Error('Another validation owns the budget. Do not remove its lock.'); });
  try {
    const ledger = await readTeacherBudget();
    const prior = ledger.runs.find(r => r.id === id);
    if (prior) {
      if (prior.state !== 'settled') throw new Error('Previous outcome unknown; reservation remains.');
      if (prior.error) throw new Error(prior.error);
      return prior;
    }
    if (ledger.runs.reduce((sum,r) => sum + r.usd,0) + reservation > LIMIT) throw new Error('Budget cannot cover the conservative reservation.');
    const save = async () => {
      await writeFile(ledgerFile + '.tmp', JSON.stringify(ledger,null,2));
      // Windows virus scanners/watchers can briefly hold the destination open.
      for (let attempt=0; ; attempt++) {
        try { await rename(ledgerFile + '.tmp', ledgerFile); break; }
        catch (e) {
          if (attempt >= 6 || !['EPERM','EACCES','EBUSY'].includes((e as NodeJS.ErrnoException).code ?? '')) throw e;
          await new Promise(resolve => setTimeout(resolve, 50 * 2 ** attempt));
        }
      }
    };
    const run:TeacherRun = { id, state:'reserved', usd:reservation }; ledger.runs.push(run); await save();
    const started = Date.now();
    try {
      const result = await send();
      const usage = result.usage;
      if (!usage || ![usage.inputTokens,usage.outputTokens,usage.cacheReadTokens,usage.cacheWriteTokens].every(n => Number.isInteger(n) && n >= 0)) throw new Error('Missing provider usage; reservation retained.');
      if (!/^claude-sonnet-5(?:-|$)/.test(result.model)) throw new Error('Unpriced model; reservation retained.');
      // Sonnet 5: $2 input / $10 output / $0.2 cache read per 1M. Cache writes use the conservative 1h rate.
      run.usd = (usage.inputTokens*2 + usage.outputTokens*10 + usage.cacheReadTokens*.2 + usage.cacheWriteTokens*4)/1e6;
      run.state = 'settled'; run.result = result;
      if (run.usd > reservation) run.error = 'Provider usage exceeded the declared bound; stop further audit calls.';
    } catch (e) { run.error = e instanceof Error ? e.message : 'Unknown provider outcome'; }
    run.durationMs = Date.now() - started; await save();
    if (run.state !== 'settled' || run.error) throw new Error(run.error);
    return run;
  } finally { await lock.close(); await unlink(lockPath); }
}

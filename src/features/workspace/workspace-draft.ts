import { useEffect, useRef, useState } from 'react';
import type { StoragePort } from '@/data/storage-port';
import type { Calculation } from './calculator';

export interface WorkspaceDraft {
  version: 1; skillId?: string; updatedAt: number; notes: string; input: string;
  calculations: Calculation[]; steps: Record<string, string>; done: string[];
  activeStep: number; guided: boolean;
  teacherWatch?: boolean;
  usedNotationId?: string;
}
const fresh = (): WorkspaceDraft => ({ version: 1, updatedAt: 0, notes: '', input: '', calculations: [], steps: {}, done: [], activeStep: 0, guided: false });
export function decodeWorkspaceDraft(text: string | null): WorkspaceDraft | null {
  try {
    const value = JSON.parse(text ?? 'null') as WorkspaceDraft | null;
    if (!value || value.version !== 1 || !Number.isFinite(value.updatedAt) || typeof value.notes !== 'string' || typeof value.input !== 'string' || !Array.isArray(value.calculations) || !Array.isArray(value.done) || !value.steps || typeof value.steps !== 'object' || Array.isArray(value.steps) || !Number.isInteger(value.activeStep) || value.activeStep < 0 || typeof value.guided !== 'boolean') return null;
    // A broken imported history row must not discard the learner's notes or steps.
    const calculations = value.calculations.filter(c => c && typeof c.expression === 'string' && typeof c.result === 'string' && Number.isFinite(c.value) && (c.variable === undefined || typeof c.variable === 'string') && (c.id === undefined || typeof c.id === 'string'))
      .map(c => {
        const entry = { ...c };
        if (entry.expressionTex !== undefined && typeof entry.expressionTex !== 'string') delete entry.expressionTex;
        return entry;
      });
    if (!Object.values(value.steps).every(s => typeof s === 'string') || !value.done.every(s => typeof s === 'string')) return null;
    const draft = { ...value, calculations };
    if (draft.teacherWatch !== undefined && typeof draft.teacherWatch !== 'boolean') delete draft.teacherWatch;
    if (draft.usedNotationId !== undefined && typeof draft.usedNotationId !== 'string') delete draft.usedNotationId;
    return draft;
  } catch { return null; }
}
const writes = new Map<string, Promise<void>>();
export function readWorkspaceNotes(id: string): string {
  try {
    const draft = decodeWorkspaceDraft(localStorage.getItem(`forge.workspace.v1:${id}`));
    return draft ? [draft.notes, ...draft.calculations.map(c => `${c.expression} = ${c.result}`)].filter(Boolean).join('\n') : '';
  } catch { return ''; }
}
export async function flushWorkspaceWrites() {
  await Promise.all([...writes.values()].map(p => p.catch(() => {})));
}
export function useWorkspaceDraft(id: string, storage?: () => StoragePort, skillId?: string) {
  const key = `forge.workspace.v1:${id}`;
  const [draft, setDraft] = useState(() => {
    try { return decodeWorkspaceDraft(localStorage.getItem(key)) ?? fresh(); } catch { return fresh(); }
  });
  const current = useRef(draft);
  const [warning, setWarning] = useState('');
  const [ready, setReady] = useState(!storage);
  useEffect(() => {
    let live = true;
    if (!storage) return;
    void storage().loadPreferences().then(prefs => {
      if (!live) return;
      const saved = decodeWorkspaceDraft(prefs.find(p => p.key === key)?.value ?? null);
      if (saved && saved.updatedAt > current.current.updatedAt) {
        current.current = saved; setDraft(saved);
        // Keep the immediate teacher context consistent after import/restore.
        try { localStorage.setItem(key, JSON.stringify(saved)); }
        catch { setWarning('Odczytano notatki z bazy, ale zapis na tym urządzeniu jest niedostępny. Pobierz notatki.'); }
      }
      setReady(true);
    }).catch(() => { if (live) { setWarning('Nie udało się odczytać kopii notatek. Dostępny jest zapis na tym urządzeniu.'); setReady(true); } });
    return () => { live = false; };
  }, [key, storage]);
  const update = (patch: Partial<WorkspaceDraft>) => {
    if (!ready) return;
    const next = { ...current.current, ...patch, ...(skillId ? { skillId } : {}), updatedAt: Math.max(Date.now(), current.current.updatedAt + 1) };
    current.current = next; setDraft(next);
    try { localStorage.setItem(key, JSON.stringify(next)); setWarning(''); }
    catch { setWarning('Brak miejsca na zapis. Pobierz notatki, zanim zamkniesz zadanie.'); }
    if (storage) {
      const queued = (writes.get(key) ?? Promise.resolve()).catch(() => {}).then(() => storage().setPreference(key, JSON.stringify(next)));
      writes.set(key, queued);
      void queued.finally(() => { if (writes.get(key) === queued) writes.delete(key); }).catch(() => {});
      void queued.catch(() => setWarning('Kopia w bazie nie została zapisana. Pobierz notatki przed zmianą urządzenia.'));
    }
  };
  return { draft, update, warning, ready };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoragePort } from '@/data/storage-port';

export const LESSON_DRAFT_PREFIX = 'forge.lesson-draft.v1:';
interface Envelope<T> { version: 1; skillId: string; updatedAt: number; value: T }
const pending = new Map<string, Promise<void>>();
export async function flushLessonDraftWrites() {
  await Promise.all([...pending.values()].map(write => write.catch(() => {})));
}
export function decodeLessonDraft<T>(raw: string | null | undefined, validate: (value: unknown) => value is T): Envelope<T> | null {
  try {
    const parsed: unknown = JSON.parse(raw ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const v = parsed as Envelope<unknown>;
    return v.version === 1 && typeof v.skillId === 'string' && Number.isFinite(v.updatedAt)
      && validate(v.value) ? v as Envelope<T> : null;
  } catch { return null; }
}

/** Synchronous device checkpoint plus the exportable profile; never touches mastery. */
export function useLessonDraft<T>(id: string, skillId: string, validate: (value: unknown) => value is T, storage?: () => StoragePort) {
  const key = LESSON_DRAFT_PREFIX + id;
  const validateRef = useRef(validate); validateRef.current = validate;
  const [record, setRecord] = useState<Envelope<T> | null>(() => {
    try { return decodeLessonDraft(localStorage.getItem(key), validate); } catch { return null; }
  });
  const current = useRef(record);
  const [ready, setReady] = useState(!storage);
  const [warning, setWarning] = useState('');
  useEffect(() => {
    if (!storage) return;
    let active = true;
    void storage().loadPreferences().then(prefs => {
      if (!active) return;
      const saved = decodeLessonDraft(prefs.find(p => p.key === key)?.value, validateRef.current);
      if (saved && saved.updatedAt > (current.current?.updatedAt ?? -1)) {
        current.current = saved; setRecord(saved);
      }
      setReady(true);
    }).catch(() => {
      if (active) { setWarning('Nie udało się odczytać kopii w profilu. Dostępny jest zapis na tym urządzeniu.'); setReady(true); }
    });
    return () => { active = false; };
  }, [key, storage]);
  const save = useCallback((value: T) => {
    const next: Envelope<T> = { version: 1, skillId, updatedAt: Math.max(Date.now(), (current.current?.updatedAt ?? 0) + 1), value };
    current.current = next; setRecord(next);
    const text = JSON.stringify(next);
    try { localStorage.setItem(key, text); setWarning(''); }
    catch { setWarning('Nie udało się zapisać odpowiedzi na urządzeniu. Nie zamykaj karty przed zapisem w profilu.'); }
    if (storage) {
      const write = (pending.get(key) ?? Promise.resolve()).catch(() => {}).then(() => storage().setPreference(key, text));
      pending.set(key, write);
      void write.then(() => { if (pending.get(key) === write) pending.delete(key); }, () => {
        setWarning('Zapis w profilu nie powiódł się. Nie zamykaj tej karty, jeśli zapis urządzenia też jest niedostępny.');
      });
    }
  }, [key, skillId, storage]);
  return { value: record?.value ?? null, ready, warning, save };
}

export interface CardDraft { submitted: boolean; fields: Record<string, unknown> }
export function isCardDraft(value: unknown): value is CardDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as CardDraft;
  return typeof draft.submitted === 'boolean' && !!draft.fields && typeof draft.fields === 'object' && !Array.isArray(draft.fields);
}
/** A checked answer stays visible in history; a fresh retry starts clean. */
export function resumeCardDraft(saved: CardDraft | null, answered: boolean): CardDraft {
  return saved && (!saved.submitted || answered) ? saved : { submitted: answered, fields: {} };
}

import { useCallback, useEffect, useState } from 'react';
import type { Prosba, StrukturaOdpowiedzi, WiadomoscCzatu } from './nauczyciel-kontekst';

export interface TeacherMessage extends WiadomoscCzatu {
  id?: string; tryb?: 'ai'|'demo'; model?: string|null; pytanieKontrolne?: string;
  ukryta?: boolean; zPamieci?: boolean; zapis?: boolean; expression?: string;
  prosba?: Prosba; helpPending?: boolean; struktura?: StrukturaOdpowiedzi; powod?: string;
}
const pending = new Map<string, string | undefined>();
const memory = new Map<string, TeacherMessage[]>();
const listeners = new Map<string, Set<() => void>>();
const failed = new Set<string>();
const emit = (key: string) => listeners.get(key)?.forEach(fn => fn());

export function readTeacherConversation(key: string): TeacherMessage[] {
  // Quota failures usually leave reads working: the older disk snapshot must not
  // overwrite a newer response already received in this running application.
  if (failed.has(key) && memory.has(key)) return memory.get(key)!;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(saved) ? saved.filter((w): w is TeacherMessage => !!w && (w.rola === 'uczen' || w.rola === 'nauczyciel') && typeof w.tekst === 'string').slice(-24) : [];
  } catch { return memory.get(key) ?? []; }
}
export function changeTeacherConversation(key: string, change: (messages: TeacherMessage[]) => TeacherMessage[]) {
  const next = change(readTeacherConversation(key)).slice(-24);
  memory.set(key,next);
  try { localStorage.setItem(key,JSON.stringify(next)); failed.delete(key); }
  catch { failed.add(key); }
  emit(key);
}
export function beginTeacherRequest(key: string, requestId?: string): boolean {
  if (pending.has(key)) return false;
  pending.set(key, requestId); emit(key); return true;
}
export function isTeacherRequestCurrent(key: string, requestId: string): boolean { return pending.has(key) && pending.get(key) === requestId; }
export function finishTeacherRequest(key: string, requestId?: string) {
  if (requestId !== undefined && !isTeacherRequestCurrent(key, requestId)) return;
  pending.delete(key); emit(key);
}

/** Called after persistent shadows are cleared by import/deletion. Late replies become obsolete. */
export function clearTeacherConversations(matches: (key: string, value?: string | null) => boolean = () => true) {
  const keys = new Set([...memory.keys(), ...pending.keys(), ...failed.keys(), ...listeners.keys()]);
  for (const key of keys) {
    if (!matches(key, JSON.stringify(memory.get(key) ?? []))) continue;
    memory.delete(key); failed.delete(key); pending.delete(key); emit(key);
  }
}

/** A late response survives closing the modal and updates a panel reopened while waiting. */
export function useTeacherConversation(key: string) {
  const [messages,setMessages] = useState(() => readTeacherConversation(key));
  const [busy,setBusy] = useState(() => pending.has(key));
  const [warning,setWarning] = useState('');
  useEffect(() => {
    const update = () => { setMessages(readTeacherConversation(key)); setBusy(pending.has(key)); setWarning(failed.has(key) ? 'Rozmowa jest dostępna teraz, ale nie udało się jej zapisać na urządzeniu.' : ''); };
    const subscribers = listeners.get(key) ?? new Set<() => void>();
    subscribers.add(update); listeners.set(key,subscribers); update();
    return () => { subscribers.delete(update); if (!subscribers.size) listeners.delete(key); };
  },[key]);
  const change = useCallback((fn: (items: TeacherMessage[]) => TeacherMessage[]) => changeTeacherConversation(key,fn),[key]);
  return { messages,busy,warning,change };
}

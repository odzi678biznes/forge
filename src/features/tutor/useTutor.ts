import { useCallback, useEffect, useRef, useState } from 'react';
import { command, getSnapshot, type TutorConnection } from './client';
import type { TutorSnapshot } from './types';

export function useTutor(connection: TutorConnection | null) {
  const [snapshot, setSnapshot] = useState<TutorSnapshot | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null), [online, setOnline] = useState(true);
  const pending = useRef(false), mounted = useRef(true), attempted = useRef(new Set<string>());
  const currentConnection = useRef(connection); currentConnection.current = connection;
  const accept = useCallback((next: TutorSnapshot) => {
    if (!mounted.current) return;
    setSnapshot(previous => !previous || next.revision >= previous.revision ? next : previous);
  }, []);
  const run = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    const c = currentConnection.current;
    if (!c || pending.current) return false;
    pending.current = true; setBusy(true); setError(null);
    try { const result = await command(c, action, data); if (c !== currentConnection.current) return false; accept(result); setOnline(true); return true; }
    catch (e) { if (mounted.current && c === currentConnection.current) setError(e instanceof Error ? e.message : 'Nie udało się zakończyć operacji.'); return false; }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }, [accept]);
  const refresh = useCallback(async () => {
    const c = currentConnection.current; if (!c) return;
    try { const next = await getSnapshot(c); if (c !== currentConnection.current) return; accept(next); setOnline(true); }
    catch (e) { if (mounted.current) { setOnline(false); setError(e instanceof Error ? e.message : 'Brak połączenia.'); } }
  }, [accept]);
  useEffect(() => {
    mounted.current = true; setSnapshot(null); attempted.current.clear();
    if (!connection) return;
    let stopped = false, timer: ReturnType<typeof setTimeout>;
    const poll = async () => { if (!pending.current) await refresh(); if (!stopped) timer = setTimeout(poll, document.hidden ? 8000 : 2000); };
    void poll();
    const wake = () => { if (!pending.current) void refresh(); };
    window.addEventListener('online', wake); document.addEventListener('visibilitychange', wake);
    return () => { stopped = true; mounted.current = false; clearTimeout(timer); window.removeEventListener('online', wake); document.removeEventListener('visibilitychange', wake); };
  }, [connection, refresh]);
  useEffect(() => {
    const s = snapshot?.session;
    if (!s || busy || snapshot.busy || !online || connection?.role !== 'learner') return;
    if ((s.mode === 'exam' || s.mode === 'quiz') && s.endedAt === null) return;
    const waiting = s.submissions.find(a => (a.status === 'received' || a.status === 'analyzing') && !attempted.current.has(`analyze:${a.id}`));
    if (waiting) { attempted.current.add(`analyze:${waiting.id}`); void run('analyze', { submissionId: waiting.id }); return; }
    if (s.endedAt !== null && !s.summary && !s.submissions.some(a => ['received', 'analyzing', 'error'].includes(a.status)) && !attempted.current.has(`plan:${s.id}`)) {
      attempted.current.add(`plan:${s.id}`); void run('plan'); return;
    }
    const e = s.exercises[s.currentIndex];
    const a = s.submissions.filter(a => a.exerciseId === e?.id && a.status === 'graded').at(-1);
    if (s.endedAt === null && s.mode === 'learn' && a?.analysis && a.analysis.errors.some(e => ['knowledge', 'formula', 'fractions', 'sign'].includes(e.category))
      && !s.lesson && !attempted.current.has(`lesson:${e?.id}`)) {
      attempted.current.add(`lesson:${e?.id}`); void run('lesson', { sessionId: s.id, exerciseId: e?.id });
    }
  }, [snapshot, busy, online, connection, run]);
  return { snapshot, busy, error, online, run, refresh, setError };
}

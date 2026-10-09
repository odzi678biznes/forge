import { useEffect, useRef, useState } from 'react';
import type { TutorConnection } from './client';
import { preparePhoto } from './image-upload';
import { deletePending, loadPending, savePending, type PendingPhoto } from './outbox';
import type { PublicSession } from './types';

interface Props {
  connection: TutorConnection;
  session: PublicSession;
  busy: boolean;
  allowClosed?: boolean;
  send: (data: Record<string, unknown>) => Promise<boolean>;
}
export function PhotoUpload({ connection, session, busy, allowClosed = false, send }: Props) {
  const [pending, setPending] = useState<PendingPhoto | null>(null), [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null), [confidence, setConfidence] = useState('partial');
  const original = useRef<Blob | null>(null), rotation = useRef(0), generation = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const exercise = session.exercises[session.currentIndex];
  const tag = connection.token.slice(-12);
  useEffect(() => {
    let alive = true;
    void loadPending().then(photos => {
      if (alive) setPending(photos.find(p => p.base === connection.base && p.connectionTag === tag) ?? null);
    }).catch(() => { if (alive) setMessage('Nie udało się wczytać zdjęć czekających na wysłanie.'); });
    return () => { alive = false; generation.current++; };
  }, [connection.base, tag]);
  const capture = async (file: Blob, rotate = false) => {
    if (!exercise) return;
    const counter = ++generation.current;
    setWorking(true); setMessage(null);
    try {
      const photo = await preparePhoto(file, rotation.current);
      if (counter !== generation.current) return;
      const item: PendingPhoto = { id: crypto.randomUUID(), base: connection.base,
        connectionTag: tag, sessionId: rotate && pending ? pending.sessionId : session.id,
        exerciseId: rotate && pending ? pending.exerciseId : exercise.id, confidence, photo };
      await savePending(item);
      if (pending && pending.id !== item.id) await deletePending(pending.id);
      setPending(item);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Nie udało się przygotować zdjęcia.'); }
    finally { if (counter === generation.current) setWorking(false); }
  };
  const upload = async () => {
    if (!pending) return;
    setWorking(true); setMessage(null);
    try {
      const item = { ...pending, confidence }; await savePending(item);
      const success = await send({ sessionId: item.sessionId, exerciseId: item.exerciseId, requestId: item.id,
        confidence: item.confidence, image: { data: item.photo.data, mime: item.photo.mime } });
      if (success) {
        await deletePending(item.id); setPending(null); original.current = null;
        setMessage('Zdjęcie zapisane na serwerze. Komputer otrzyma je automatycznie.');
      } else setMessage('Zdjęcie czeka na urządzeniu. Możesz ponowić wysłanie tym samym przyciskiem.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Nie udało się wysłać zdjęcia.'); }
    finally { setWorking(false); }
  };
  const stale = pending && (pending.exerciseId !== exercise?.id || pending.sessionId !== session.id);
  const disabled = busy || working || session.endedAt !== null && !allowClosed || session.pausedAt !== null;
  return <section className="tutor-photo" aria-label="Zdjęcie rozwiązania">
    <h3>Pracujesz na kartce</h3>
    <p>Zapisz obliczenia i tok rozumowania. Sfotografuj całą kartkę w dobrym świetle.</p>
    <input ref={fileInput} className="tutor-file" aria-label="Zdjęcie kartki" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={disabled}
      onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) { original.current = file; rotation.current = 0; void capture(file); } }} />
    {pending ? <>
      <img className="tutor-photo__preview" src={pending.photo.preview} alt="Podgląd Twojej kartki przed wysłaniem" />
      {stale && <p role="alert">To zdjęcie dotyczy poprzedniego zadania. Sprawdź, czy serwer już je zapisał. Jeśli nie, wróć do tego zadania na komputerze. Zdjęcie zachowuje przypisanie do swojej kartki.</p>}
      <label>Jak pewny jesteś rozwiązania?<select value={confidence} onChange={e => setConfidence(e.target.value)} disabled={disabled}>
        <option value="guess">Nie jestem pewny</option><option value="partial">Częściowo pewny</option><option value="sure">Pewny</option>
      </select></label>
      <div className="tutor-actions">
        <button className="btn btn--primary" disabled={disabled} onClick={() => void upload()}>{working ? 'Wysyłam…' : stale ? 'Sprawdź zapis poprzedniego zdjęcia' : 'Wyślij rozwiązanie'}</button>
        <button className="btn" disabled={disabled} onClick={() => { rotation.current = original.current ? (rotation.current + 90) % 360 : 90; void capture(original.current ?? new Blob([Uint8Array.from(atob(pending.photo.data), c => c.charCodeAt(0))], { type: 'image/jpeg' }), true); }}>Obróć zdjęcie</button>
        <button className="btn" disabled={disabled} onClick={() => { void deletePending(pending.id).then(() => { setPending(null); original.current = null; }); }}>Usuń zdjęcie</button>
      </div>
    </> : <button className="btn btn--primary tutor-camera" disabled={disabled} onClick={() => fileInput.current?.click()}>{working ? 'Przygotowuję zdjęcie…' : connection.role === 'scanner' ? 'Zrób zdjęcie rozwiązania' : 'Dodaj zdjęcie z komputera'}</button>}
    {message && <p role="status">{message}</p>}
  </section>;
}

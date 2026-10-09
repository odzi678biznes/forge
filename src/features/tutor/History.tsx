import { useEffect, useState } from 'react';
import { Math as Tex } from '../../components/Math';
import { getImage, getSnapshot, type TutorConnection } from './client';
import { Feedback } from './Feedback';
import { MODE_LABELS, type PublicSession, type TutorSnapshot } from './types';
import { Sformatowane } from '../../nauka/Sformatowane';

export function History({ connection, history, canRepeat, repeat }: { connection: TutorConnection; history: TutorSnapshot['history']; canRepeat: boolean; repeat: (sessionId: string, exerciseId: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null), [session, setSession] = useState<PublicSession | null>(null), [error, setError] = useState('');
  useEffect(() => {
    let alive = true; setSession(null); setError('');
    if (selected) void getSnapshot(connection, selected).then(s => { if (alive) setSession(s.session); }).catch(e => { if (alive) setError(String(e.message)); });
    return () => { alive = false; };
  }, [connection, selected]);
  return <section className="tutor-history" aria-label="Historia rozwiązań"><h2>Historia nauki</h2>
    <label>Sesja<select aria-label="Sesja" value={selected ?? ''} onChange={e => setSelected(e.target.value || null)}><option value="">Wybierz sesję</option>
      {history.map(s => <option key={s.id} value={s.id}>{new Date(s.startedAt).toLocaleDateString('pl-PL')} · {MODE_LABELS[s.mode]} · {s.count} rozwiązań</option>)}
    </select></label>
    {error && <p role="alert">{error}</p>}
    {session?.exercises.map((e, index) => <article key={e.id}><h3>Zadanie {index + 1}</h3><p><Tex>{e.prompt}</Tex></p>
      {session.submissions.filter(a => a.exerciseId === e.id).map(a => <div key={a.id}>
        {a.imageIds.map(id => <HistoryPhoto key={id} id={id} connection={connection} />)}
        {(session.mode !== 'exam' && session.mode !== 'quiz' || session.endedAt !== null) && <Feedback submission={a} busy={false} retry={() => setError('Otwórz aktywną sesję, aby ponowić analizę.')} />}
        <p>Użyta pomoc: {a.hintsUsed}/6 · czas: {Math.round(a.elapsedMs / 60_000)} min</p>
        {a.analysis?.learned && <p>Dzięki temu zadaniu: {a.analysis.learned}</p>}
      </div>)}
      {e.solution && <details><summary>Poprawne rozwiązanie</summary><Sformatowane tekst={e.solution} /></details>}
      {session.hints[e.id]?.map((hint, i) => <details key={i}><summary>Podpowiedź {i + 1}</summary><Sformatowane tekst={hint} /></details>)}
      <button className="btn" disabled={!canRepeat} onClick={() => repeat(session.id, e.id)}>Rozwiąż ponownie</button>
    </article>)}
  </section>;
}
function HistoryPhoto({ connection, id }: { connection: TutorConnection; id: string }) {
  const [src, setSrc] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    void getImage(connection, id).then(({ image }) => { if (alive) setSrc(`data:${image.mime};base64,${image.data}`); }).catch(() => { if (alive) setError('Nie udało się pobrać zdjęcia.'); });
    return () => { alive = false; };
  }, [connection, id]);
  return src ? <a href={src} target="_blank" rel="noreferrer"><img className="tutor-history__photo" src={src} alt="Zapisane zdjęcie rozwiązania" /></a> : <p>{error || 'Wczytuję zdjęcie…'}</p>;
}

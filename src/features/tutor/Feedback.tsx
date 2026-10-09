import { Sformatowane } from '../../nauka/Sformatowane';
import { ERROR_LABELS, type Submission } from './types';

export function Feedback({ submission, retry, busy }: { submission: Submission; retry: () => void; busy: boolean }) {
  const a = submission.analysis;
  return <section className="tutor-feedback" aria-label="Analiza rozwiązania" aria-live="polite">
    {submission.status === 'received' || submission.status === 'analyzing' ? <><p>Rozwiązanie zapisane. Oczekuję na analizę…</p><button className="btn" disabled={busy} onClick={retry}>Ponów analizę</button></>
      : submission.status === 'error' ? <><p>{submission.error}</p><button className="btn" disabled={busy} onClick={retry}>Ponów analizę</button></>
      : a ? <>
        <div className="tutor-feedback__head"><h2>{a.verdict === 'uncertain' ? 'Potrzebuję czytelniejszego zdjęcia' : a.verdict === 'correct' ? 'Poprawne rozumowanie' : 'Przyjrzyjmy się temu krokowi'}</h2>
          {a.points !== null && <span>{a.points} pkt</span>}</div>
        {a.verdict === 'uncertain' ? <Sformatowane tekst={a.clarification} /> : <>
          {a.goodSteps.length > 0 && <div><h3>To zrobiłeś poprawnie</h3>{a.goodSteps.map((s, i) => <Sformatowane key={i} tekst={s} />)}</div>}
          <Sformatowane tekst={a.feedback} />
          {a.errors.map((e, i) => <div key={i} className="tutor-error-step"><strong>{ERROR_LABELS[e.category]} · {e.step}</strong><Sformatowane tekst={e.explanation} /></div>)}
          <h3>Następny mały krok</h3><Sformatowane tekst={a.nextStep} />
        </>}
        <details><summary>Odczyt pracy i pewność analizy: {Math.round(a.confidence * 100)}%</summary>
          {a.transcription.map((s, i) => <Sformatowane key={i} tekst={`${i + 1}. ${s}`} />)}
        </details>
      </> : null}
  </section>;
}

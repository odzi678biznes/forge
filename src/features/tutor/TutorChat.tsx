import { useEffect, useRef, useState } from 'react';
import { Sformatowane } from '../../nauka/Sformatowane';
import type { PublicSession } from './types';

type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function TutorChat({ session, disabled, run }: { session: PublicSession; disabled: boolean; run: (action: string, data?: Record<string, unknown>) => Promise<boolean> }) {
  const [text, setText] = useState(''), [listening, setListening] = useState(false), [voiceError, setVoiceError] = useState('');
  const recognition = useRef<Recognition | null>(null), end = useRef<HTMLDivElement>(null);
  const exercise = session.exercises[session.currentIndex];
  const Constructor = (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition;
  const messages = session.messages.filter(m => m.exerciseId === exercise?.id);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);
  useEffect(() => () => recognition.current?.stop(), []);
  const dictate = () => {
    if (listening) { recognition.current?.stop(); return; }
    if (!Constructor) return;
    const r = new Constructor(); recognition.current = r;
    r.lang = 'pl-PL'; r.continuous = false; r.interimResults = false;
    r.onresult = e => setText(previous => `${previous} ${e.results[0]?.[0]?.transcript ?? ''}`.trim());
    r.onerror = () => { setVoiceError('Nie udało się rozpoznać mowy. Możesz wpisać pytanie.'); setListening(false); };
    r.onend = () => setListening(false);
    setVoiceError(''); try { r.start(); setListening(true); } catch { setVoiceError('Mikrofon jest niedostępny.'); }
  };
  const context = { sessionId: session.id, exerciseId: exercise?.id };
  return <section className="tutor-chat" aria-label="Rozmowa z AI Tutorem">
    <div className="tutor-chat__heading"><h2>Twój AI Tutor</h2><span>Claude · kontekst zadania</span></div>
    <p className="tutor-muted">Widzę bieżące zadanie i Twoje rozwiązanie. Pomogę Ci wykonać następny krok.</p>
    <div className="tutor-chat__messages" aria-live="polite">
      {messages.map(m => <div className={`tutor-bubble tutor-bubble--${m.role}`} key={m.id}><span>{m.role === 'user' ? 'Ty' : 'Nauczyciel'}</span><Sformatowane tekst={m.text} /></div>)}
      <div ref={end} />
    </div>
    <button className="btn" disabled={disabled || (session.hints[exercise?.id ?? '']?.length ?? 0) >= 5} onClick={() => void run('hint', context)}>
      Podpowiedź {(session.hints[exercise?.id ?? '']?.length ?? 0) + 1} / 5
    </button>
    <div className="tutor-chat__quick">
      {['Nie rozumiem tego.', 'Wytłumacz mi to prościej.', 'Dlaczego moje rozwiązanie jest błędne?'].map(question => <button key={question} disabled={disabled} onClick={() => void run('chat', { ...context, message: question })}>{question}</button>)}
    </div>
    <form onSubmit={async e => { e.preventDefault(); if (await run('chat', { ...context, message: text })) setText(''); }}>
      <label htmlFor="tutor-question">Zapytaj nauczyciela</label>
      <textarea id="tutor-question" rows={3} maxLength={2000} value={text} onChange={e => setText(e.target.value)} disabled={disabled} placeholder="Nie wiem, od czego zacząć…" />
      <div className="tutor-actions"><button className="btn btn--primary" disabled={disabled || !text.trim()}>Wyślij pytanie</button>
        {Constructor && <button className="btn" type="button" disabled={disabled} aria-pressed={listening} onClick={dictate}>{listening ? 'Zakończ dyktowanie' : 'Podyktuj pytanie'}</button>}
      </div>
      {Constructor && <small>Dyktowanie korzysta z rozpoznawania mowy w przeglądarce.</small>}
      {voiceError && <p role="status">{voiceError}</p>}
    </form>
  </section>;
}

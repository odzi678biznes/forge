import { useEffect, useState } from 'react';
import type { SkillState } from '../../data/types';
import { Math as Tex } from '../../components/Math';
import { Figure } from '../../components/Figure';
import { Sformatowane } from '../../nauka/Sformatowane';
import { MATH_CORPUS } from '../../../content/math/index';
import { connectTutor, defaultTutorApi, forgetConnection, loadConnection, pairPhone, takeScannerLink, tutorStatus, type TutorConnection } from './client';
import { useTutor } from './useTutor';
import { PhotoUpload } from './PhotoUpload';
import { TutorChat } from './TutorChat';
import { Feedback } from './Feedback';
import { KnowledgeMap } from './KnowledgeMap';
import { History } from './History';
import { DIFFICULTY_LABELS, ERROR_LABELS, MODE_LABELS, TUTOR_MODES, type PublicSession, type StudentModel, type TutorMode, type TutorStatus } from './types';
import './tutor.css';

interface Props { initialStates: Map<string, SkillState>; onBack: () => void; onStudent?: (student: StudentModel) => void; autoStart?: boolean; onConsumeStart?: () => void }
export default function TutorView({ initialStates, onBack, onStudent, autoStart = false, onConsumeStart }: Props) {
  const [connection, setConnection] = useState<TutorConnection | null>(() => { try { return takeScannerLink() ?? loadConnection(); } catch { return null; } });
  const controller = useTutor(connection);
  const { snapshot, busy, error, online, run, refresh, setError } = controller;
  const [mode, setMode] = useState<TutorMode>('learn'), [examLevel, setExamLevel] = useState('PP');
  const [view, setView] = useState<'session' | 'map' | 'history' | 'errors'>('session');
  const [focus, setFocus] = useState<string | null>(null), [pairLink, setPairLink] = useState(''), [pairing, setPairing] = useState(false);
  const [webApp, setWebApp] = useState(`${location.origin}${import.meta.env.BASE_URL}`), [phoneApi, setPhoneApi] = useState(connection?.base ?? defaultTutorApi());
  const s = snapshot?.session, exercise = s?.exercises[s.currentIndex];
  const assessment = s?.mode === 'exam' || s?.mode === 'quiz';
  const ongoing = Boolean(s && s.endedAt === null), blocked = busy || snapshot?.busy === true || !online;
  const student = snapshot?.student;
  useEffect(() => { if (student) onStudent?.(student); }, [student, onStudent]);
  useEffect(() => { if (connection) setPhoneApi(connection.base); }, [connection]);
  const context = { sessionId: s?.id, exerciseId: exercise?.id };
  const latestSubmission = s?.submissions.filter(a => a.exerciseId === exercise?.id).at(-1);
  const graded = latestSubmission?.status === 'graded';
  const start = () => { setView('session'); void run('start', { mode, level: examLevel, ...(focus ? { focus } : {}) }); };
  useEffect(() => {
    if (autoStart && snapshot && connection?.role === 'learner' && !blocked) {
      onConsumeStart?.();
      if (!snapshot.session || snapshot.session.endedAt !== null) void run('start', { mode: 'learn' });
    }
  }, [autoStart, snapshot, connection, blocked, onConsumeStart, run]);
  const pair = async () => {
    if (!connection) return; setPairing(true); setError(null);
    try { setPairLink(await pairPhone(connection, webApp, phoneApi)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się sparować telefonu.'); }
    finally { setPairing(false); }
  };
  if (!connection) return <Onboarding initialStates={initialStates} onConnect={setConnection} onBack={onBack} />;
  const toolbar = <header className="tutor-top">
    <button className="btn" onClick={onBack}>← Forge</button>
    <div><span className="tutor-eyebrow">FORGE AI TUTOR</span><h1>{connection.role === 'scanner' ? 'Twój skaner rozwiązania' : 'Indywidualne korepetycje'}</h1></div>
    <span className={`tutor-connection ${online ? '' : 'tutor-connection--offline'}`} role="status">{!snapshot ? 'Łączę z profilem…' : online ? 'Sesja zsynchronizowana' : 'Brak połączenia · ostatni zapis'}</span>
    <button className="btn" disabled={busy} onClick={() => { forgetConnection(); setConnection(null); }}>Odłącz urządzenie</button>
  </header>;
  const errorBox = error && <div className="tutor-alert" role="alert"><p>{error}</p><button className="btn" disabled={busy} onClick={() => void refresh()}>Sprawdź połączenie</button></div>;
  if (connection.role === 'scanner') return <main className="tutor tutor--scanner">{toolbar}{errorBox}
    <div className="tutor-scanner-content">
      {!s ? <><h2>Czekam na komputer</h2><p>Rozpocznij korepetycje na komputerze. Telefon automatycznie pokaże aktualne zadanie.</p></>
        : s.endedAt !== null && latestSubmission?.status !== 'clarify' ? <><h2>Sesja zakończona</h2><p>Analiza rozwiązań pojawi się na komputerze. Kolejna sesja trafi tutaj automatycznie.</p></>
          : <><p className="tutor-eyebrow">{MODE_LABELS[s.mode]} · Zadanie {s.currentIndex + 1}</p>
            <h2>{MATH_CORPUS.skills.find(sk => sk.id === exercise?.skillId)?.name}</h2><p><Tex>{exercise?.prompt ?? ''}</Tex></p>
            {s.pausedAt !== null && <p>Sesja jest wstrzymana na komputerze.</p>}
            {s.endedAt !== null && <p>Zrób wyraźniejsze zdjęcie tego samego rozwiązania. Wynik egzaminu czeka na pewny odczyt.</p>}
            <PhotoUpload connection={connection} session={s} busy={busy || snapshot?.busy === true} allowClosed={latestSubmission?.status === 'clarify'} send={data => run('upload', data)} />
            {latestSubmission && <p role="status">Zdjęcie zostało odebrane przez komputer.</p>}
          </>}
    </div>
  </main>;
  return <main className="tutor">{toolbar}{errorBox}
    <div className="tutor-layout">
      <aside className="tutor-sidebar" aria-label="Plan i materiał">
        <nav className="tutor-nav" aria-label="Tutor">
          {([['session', 'Sesja'], ['map', 'Mapa wiedzy'], ['history', 'Historia'], ['errors', 'Pamięć błędów']] as const).map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}>{label}</button>)}
        </nav>
        <section><p className="tutor-eyebrow">Co robimy teraz</p><h2>{student?.plan?.now ?? 'Zaczynamy spokojnie'}</h2>
          <p>{student?.plan?.reason ?? 'Pierwsze proste zadania pomogą nauczycielowi poznać Twój sposób myślenia.'}</p>
          {student?.plan?.next.length ? <details><summary>Dalszy kierunek</summary><ol>{student.plan.next.map((step, i) => <li key={i}>{step}</li>)}</ol></details> : null}
        </section>
        <label>Sposób tłumaczenia<select value={student?.explanationStyle ?? 'simple'} disabled={blocked} onChange={e => void run('style', { style: e.target.value })}>
          <option value="simple">Prosto i krok po kroku</option><option value="visual">Przykłady i analogie</option><option value="formal">Wzory i precyzyjny zapis</option>
        </select></label>
        {exercise && student?.skills[exercise.skillId] && <details><summary>Twoje postępy w tym temacie</summary><p>Samodzielne rozwiązania z rzędu: {student.skills[exercise.skillId]!.state.independentStreak}</p><p>Średnia pomoc: {student.skills[exercise.skillId]!.hintAverage.toFixed(1)}/6</p><p>Średni czas: {Math.round(student.skills[exercise.skillId]!.timeAverageMs / 60_000)} min</p></details>}
        <details className="tutor-pair"><summary>Telefon jako aparat</summary><p>Sparuj raz. Telefon będzie śledził aktywne zadanie. Nowe parowanie odłącza poprzedni telefon.</p>
          <label>Adres Forge na telefonie<input value={webApp} onChange={e => setWebApp(e.target.value)} /></label>
          <label>Adres serwera dostępny z telefonu<input value={phoneApi} onChange={e => setPhoneApi(e.target.value)} /></label>
          <small>W sieci domowej użyj adresu IP komputera zamiast localhost. Na hostingu użyj adresu HTTPS.</small>
          <button className="btn" disabled={pairing || blocked} onClick={() => void pair()}>{pairing ? 'Paruję…' : 'Utwórz link do telefonu'}</button>
          {pairLink && <><label>Prywatny link parowania<input readOnly value={pairLink} aria-label="Link parowania" /></label><button className="btn" onClick={() => void navigator.clipboard.writeText(pairLink).catch(() => setError('Skopiuj link z pola powyżej.'))}>Kopiuj link</button><small>Otwórz ten link na telefonie. Zachowaj go dla siebie.</small></>}
          <button className="btn" disabled={blocked} onClick={async () => { if (await run('revoke')) setPairLink(''); }}>Odłącz telefon</button>
        </details>
        {focus && <p>Wybrany temat: {MATH_CORPUS.skills.find(s => s.id === focus)?.name}<button onClick={() => setFocus(null)}>Wróć do wyboru AI</button></p>}
      </aside>
      <section className="tutor-workspace" aria-label="Obszar nauki">
        {!snapshot ? <p role="status">Wczytuję profil i ostatnią sesję…</p>
          : view === 'map' && student ? <KnowledgeMap student={student} focus={focus ?? exercise?.skillId ?? null} onFocus={id => { setFocus(id); if (!ongoing) setView('session'); }} />
            : view === 'history' ? <History connection={connection} history={snapshot.history} canRepeat={!ongoing && !blocked} repeat={(sessionId, exerciseId) => { setView('session'); void run('repeat', { sessionId, exerciseId }); }} />
              : view === 'errors' && student ? <section><h2>Pamięć błędów</h2><p>Przyczyny wspólne dla różnych działów pomagają wybrać właściwy fundament.</p>
                {Object.values(student.errors).length === 0 && <p>Pierwsze obserwacje pojawią się po analizie Twoich rozwiązań.</p>}
                {Object.values(student.errors).map(memory => memory ? <article className="tutor-error-step" key={memory.category}><h3>{ERROR_LABELS[memory.category]}</h3><p>{memory.lastExplanation}</p><small>{memory.occurrences} obserwacji · {memory.skillIds.map(id => MATH_CORPUS.skills.find(s => s.id === id)?.name ?? id).join(', ')}</small><p>{memory.repairedAt ? 'Podstawa przećwiczona samodzielnie.' : 'Wrócimy do prostego przykładu.'}</p></article> : null)}
                <button className="btn" disabled={ongoing || blocked} onClick={() => { setMode('repair'); setView('session'); }}>Przygotuj sesję naprawczą</button>
              </section> : <>
                {!ongoing && <section className="tutor-start"><p className="tutor-eyebrow">Kartka, długopis, własne tempo</p><h2>Ty rozwiązujesz. Nauczyciel poznaje Twój sposób myślenia.</h2>
                  <p>AI dobierze zadania i pomoże Ci pracować nad tym, co teraz najbardziej przyda się w nauce.</p>
                  <label>Tryb pracy<select value={mode} onChange={e => setMode(e.target.value as TutorMode)} disabled={blocked}>{TUTOR_MODES.map(m => <option value={m} key={m}>{MODE_LABELS[m]}</option>)}</select></label>
                  {mode === 'exam' && <><label>Poziom arkusza<select value={examLevel} onChange={e => setExamLevel(e.target.value)}><option value="PP">Podstawowy</option><option value="PR">Rozszerzony</option></select></label><p>Arkusz autorski FORGE · 30 zadań · 180 minut · bez pomocy podczas pracy. Ocenianie AI po zakończeniu.</p></>}
                  {mode === 'quiz' && <p>Krótki sprawdzian · do 5 zadań · 15 minut · bez podpowiedzi.</p>}
                  <button className="btn btn--primary tutor-start__button" disabled={blocked} onClick={start}>{busy ? 'Przygotowuję sesję…' : 'Rozpocznij korepetycje'}</button>
                </section>}
                {s && <>
                  <div className="tutor-sessionbar"><span>{MODE_LABELS[s.mode]} · {assessment ? 'Arkusz treningowy FORGE' : DIFFICULTY_LABELS[Math.max(0, Math.ceil(exercise?.difficulty ?? 1) - 1)]}</span>
                    <SessionTimer session={s} blocked={blocked} onExpired={() => { void run('finish'); }} />
                    {ongoing && <div className="tutor-actions">{!assessment && <button className="btn" disabled={blocked} onClick={() => void run(s.pausedAt ? 'resume' : 'pause')}>{s.pausedAt ? 'Wznów sesję' : 'Zapisz i wstrzymaj'}</button>}<button className="btn" disabled={blocked} onClick={() => void run('finish')}>Zakończ sesję</button></div>}
                  </div>
                  <Sformatowane tekst={s.introduction} />
                  <details className="tutor-phases"><summary>Plan tej sesji</summary><ol>{s.phases.map((phase, i) => <li key={i}>{phase}</li>)}</ol></details>
                  {assessment && <nav className="tutor-sheetnav" aria-label="Zadania arkusza">{s.exercises.map((e, index) => <button key={e.id} className={index === s.currentIndex ? 'active' : ''} aria-current={index === s.currentIndex ? 'step' : undefined} disabled={blocked} onClick={() => void run('select', { index })}>{index + 1}{s.submissions.some(a => a.exerciseId === e.id) ? ' ✓' : ''}</button>)}</nav>}
                  {s.pausedAt !== null ? <section className="tutor-task"><h2>Sesja zapisana</h2><p>Wrócisz do tego samego zadania. Wznów, gdy będziesz gotowy.</p></section> : exercise && <article className="tutor-task">
                    <div className="tutor-task__label"><span>ZADANIE {s.currentIndex + 1}</span><span>{exercise.maxPoints} pkt</span></div>
                    <h2>{MATH_CORPUS.skills.find(sk => sk.id === exercise.skillId)?.name}</h2><div className="tutor-task__prompt"><Tex>{exercise.prompt}</Tex></div>
                    {exercise.choices.length > 0 && <ol type="A">{exercise.choices.map((c, i) => <li key={i}><Tex>{c}</Tex></li>)}</ol>}
                    {exercise.figure && <Figure figure={exercise.figure} />}{exercise.listing && <pre>{exercise.listing}</pre>}
                    {!assessment && <details><summary>Dlaczego to zadanie?</summary><p>{exercise.rationale}</p></details>}
                    {(ongoing || latestSubmission?.status === 'clarify') && <PhotoUpload connection={connection} session={s} busy={busy || snapshot?.busy === true} allowClosed={latestSubmission?.status === 'clarify'} send={data => run('upload', data)} />}
                  </article>}
                  {latestSubmission && (!assessment || !ongoing) && <Feedback submission={latestSubmission} busy={blocked} retry={() => void run('analyze', { submissionId: latestSubmission.id })} />}
                  {ongoing && assessment && latestSubmission && <p className="tutor-alert">Rozwiązanie zapisane. Ocena pojawi się po zakończeniu arkusza.</p>}
                  {!assessment && graded && exercise?.solution && <details className="tutor-solution"><summary>Porównaj z pełnym rozwiązaniem</summary><Sformatowane tekst={exercise.solution} /></details>}
                  {ongoing && !assessment && s.lesson && <section className="tutor-lesson"><p className="tutor-eyebrow">Miniwykład · krok {s.lesson.step + 1} / 6</p><h2>{s.lesson.title}</h2><h3>{s.lesson.steps[s.lesson.step]?.title}</h3><Sformatowane tekst={s.lesson.steps[s.lesson.step]?.text ?? ''} />
                    {s.lesson.step < 3 || s.lesson.checked ? <button className="btn" disabled={blocked || s.lesson.step >= 5} onClick={() => void run('lesson-step')}>Dalej w wyjaśnieniu</button> : <p>Rozwiąż teraz podobne zadanie samodzielnie. Nauczyciel sprawdzi fotografię.</p>}
                    {s.lesson.checked && s.lesson.step === 5 && <button className="btn" disabled={blocked} onClick={() => void run('lesson-dismiss')}>Wróć do toku nauki</button>}
                  </section>}
                  {ongoing && !assessment && graded && <div className="tutor-actions"><button className="btn btn--primary" disabled={blocked || s.pausedAt !== null} onClick={() => void run('next', context)}>{s.lesson && !s.lesson.checked ? 'Zadanie sprawdzające' : 'Następne dopasowane zadanie'}</button>
                    {latestSubmission?.analysis?.verdict !== 'correct' && <button className="btn" disabled={blocked} onClick={() => void run('lesson', context)}>Wyjaśnij tę podstawę</button>}</div>}
                  {s.endedAt !== null && <SessionSummary session={s} busy={blocked} run={run} />}
                </>}
              </>}
      </section>
      <aside className="tutor-teacher" aria-label="Nauczyciel">
        {s && ongoing && !assessment ? <TutorChat session={s} disabled={blocked || s.pausedAt !== null} run={run} /> : <section><h2>Twój AI Tutor</h2><p>{assessment && ongoing ? 'Pracujesz samodzielnie. Czat, podpowiedzi i analiza są wyłączone do zakończenia arkusza.' : 'Po rozpoczęciu sesji nauczyciel będzie znał bieżące zadanie i historię Twojej nauki.'}</p></section>}
        {busy && <p className="tutor-working" role="status">{snapshot?.session?.submissions.some(a => a.status === 'received' || a.status === 'analyzing') ? 'Analizuję Twoje rozwiązanie…' : 'Nauczyciel przygotowuje odpowiedź…'}</p>}
      </aside>
    </div>
  </main>;
}

function Onboarding({ initialStates, onConnect, onBack }: { initialStates: Map<string, SkillState>; onConnect: (c: TutorConnection) => void; onBack: () => void }) {
  const [base, setBase] = useState(defaultTutorApi), [code, setCode] = useState(''), [state, setState] = useState<TutorStatus | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => { let alive = true; void tutorStatus(base).then(s => { if (alive) setState(s); }).catch(e => { if (alive) setError(String(e.message)); }); return () => { alive = false; }; }, []);
  return <main className="tutor tutor-onboarding"><button className="btn" onClick={onBack}>← Forge</button><section>
    <p className="tutor-eyebrow">FORGE AI TUTOR · CLAUDE</p><h1>Nauczyciel, który poznaje Twój sposób myślenia.</h1>
    <p>Rozwiązujesz zadania na kartce. Telefon przesyła zdjęcia, a nauczyciel analizuje kolejne kroki i dobiera następne ćwiczenie.</p>
    <ol><li>Połącz się ze swoim serwerem Claude.</li><li>Rozpocznij spokojną lekcję od prostego zadania.</li><li>Sparuj telefon i fotografuj rozwiązania.</li></ol>
    <p role="status">{state ? state.available ? `Claude gotowy · ${state.model}` : state.reason : 'Sprawdzam połączenie…'}</p>
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try { onConnect(await connectTutor(base, code, [...initialStates.values()])); } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się połączyć.'); } finally { setBusy(false); setCode(''); } }}>
      <label htmlFor="tutor-server">Adres serwera korepetytora<input id="tutor-server" type="url" value={base} onChange={e => setBase(e.target.value)} required /></label>
      <label htmlFor="tutor-access">Prywatny kod dostępu<input id="tutor-access" type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} placeholder="Kod dostępu do nauczyciela" /></label>
      <small>Klucz Anthropic pozostaje na serwerze. W tym polu podaj kod dostępu Forge.</small>
      <button className="btn btn--primary" disabled={busy}>{busy ? 'Łączę…' : 'Połącz Claude i utwórz profil'}</button>
      <button className="btn" type="button" disabled={busy} onClick={async () => { try { setState(await tutorStatus(base)); setError(''); } catch (e) { setError(String((e as Error).message)); } }}>Sprawdź serwer</button>
    </form>
    {error && <p role="alert">{error}</p>}
    <details><summary>Konfiguracja serwera</summary><p>W ustawieniach środowiska serwera ustaw <code>ANTHROPIC_API_KEY</code> i prywatny <code>FORGE_TEACHER_ACCESS_CODE</code> (minimum 24 znaki), a następnie uruchom serwer ponownie.</p>
      <p>Lokalnie uruchom <code>npm run dev -- --host</code> z Node 22.13 lub nowszym. Profil i zdjęcia zapisują się w SQLite. Na Vercel ustaw <code>UPSTASH_REDIS_REST_URL</code> i <code>UPSTASH_REDIS_REST_TOKEN</code> dla trwałej synchronizacji.</p>
      <p>Gdy Forge i API mają różne adresy, dodaj adres Forge do <code>FORGE_ALLOWED_ORIGINS</code>. Klucz API nigdy nie może mieć prefiksu <code>VITE_</code>.</p>
    </details>
    <p className="tutor-muted">Fotografia, treść zadania i skondensowany profil nauki trafiają do Claude tylko przy korzystaniu z tutora. Twój profil i historia pozostają zapisane na wybranym serwerze.</p>
  </section></main>;
}
function SessionTimer({ session, blocked, onExpired }: { session: PublicSession; blocked: boolean; onExpired: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (session.endedAt === null && session.deadlineAt !== null && now >= session.deadlineAt && !blocked) onExpired(); }, [now, session.endedAt, session.deadlineAt, blocked, onExpired]);
  const seconds = Math.max(0, Math.floor((session.deadlineAt ? session.deadlineAt - (session.endedAt ?? now) : (session.endedAt ?? session.pausedAt ?? now) - session.startedAt - session.pausedMs) / 1000));
  return <time className="tutor-timer" aria-label={session.deadlineAt ? 'Pozostały czas' : 'Czas sesji'}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}{session.deadlineAt ? ' pozostało' : ''}</time>;
}
function SessionSummary({ session: s, busy, run }: { session: PublicSession; busy: boolean; run: (action: string, data?: Record<string, unknown>) => Promise<boolean> }) {
  const r = s.report;
  return <section className="tutor-summary"><h2>{r ? 'Analiza arkusza' : 'Dzisiejsza sesja'}</h2>
    {r && <><div className="tutor-report-score">{r.earned} / {r.possible} pkt{r.ungraded > 0 ? <small>Wynik tymczasowy · {r.ungraded} zadań wymaga czytelnego zdjęcia lub analizy</small> : <small>{Math.round(r.earned / r.possible * 100)}%</small>}</div>
      <p>Poprawne: {r.correct} · częściowe: {r.partial} · błędne: {r.incorrect} · bez rozwiązania: {r.unanswered}</p>
      <p>Czas pracy: {Math.round(r.timeUsedMs / 60_000)} min. {r.timedOut ? 'Limit czasu upłynął.' : ''}</p>
      {r.previousPercent !== null && r.ungraded === 0 && <p>Zmiana od poprzedniego arkusza: {(r.earned / r.possible * 100 - r.previousPercent).toFixed(1)} p.p.</p>}
      <details><summary>Gdzie tracisz punkty</summary>{r.lost.map(item => <article key={item.exerciseId}><h3>Zadanie {s.exercises.findIndex(e => e.id === item.exerciseId) + 1} · {item.points === null ? 'ocena niepewna' : `${item.points} utraconych pkt`}</h3>{item.reasons.map((reason, i) => <Sformatowane tekst={reason} key={i} />)}</article>)}</details>
    </>}
    {s.submissions.filter(a => ['error', 'received', 'analyzing'].includes(a.status)).map(a => <button key={a.id} className="btn" disabled={busy} onClick={() => void run('analyze', { submissionId: a.id })}>Ponów analizę zadania {s.exercises.findIndex(e => e.id === a.exerciseId) + 1}</button>)}
    {s.summary ? <dl><dt>Dzisiaj nauczyłeś się</dt><dd>{s.summary.learned.join(' · ') || 'Zebraliśmy pierwsze obserwacje.'}</dd><dt>Największy postęp</dt><dd>{s.summary.progress}</dd><dt>Do poprawy</dt><dd>{s.summary.improve}</dd><dt>Na następnej sesji</dt><dd>{s.summary.next}</dd></dl>
      : <><p role="status">{busy ? 'Przygotowuję analizę i kolejny plan…' : 'Nauczyciel przygotuje krótki plan dalszej nauki po analizie zdjęć.'}</p><button className="btn" disabled={busy} onClick={() => void run('plan')}>Przygotuj podsumowanie i plan</button></>}
  </section>;
}

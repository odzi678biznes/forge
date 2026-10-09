import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { HintLevel, Question } from '@/data/types';
import type { StoragePort } from '@/data/storage-port';
import { Math as Tex } from '@/components/Math';
import { MathInput } from '@/components/MathInput';
import { TeacherCompanion } from '@/features/ai/TeacherCompanion';
import { teacherQuestionContext } from '@/features/ai/teacher-context';
import { getTaskPlan } from './task-plan';
import { useWorkspaceDraft } from './workspace-draft';
import type { Calculation } from './calculator';
import type { KontekstNauczyciela } from '@/nauka/nauczyciel-kontekst';
import type { Prosba } from '@/nauka/nauczyciel-kontekst';
import type { Odpowiedz } from '@/nauka/nauczyciel-klient';
import { Sformatowane } from '@/nauka/Sformatowane';
import { useTeacherConversation } from '@/nauka/teacher-conversation';
import { askCalculationCoach, calculationReviewContext, coachConversationKey } from './calculation-coach';
import { calculationValue, resultTex, resultIsRounded } from './calculator-display';
import './workspace.css';

interface Props {
  simple?: boolean;
  question: Question; skillName?: string; storageKey: string;
  storage?: () => StoragePort;
  onUseAnswer?: (value: string) => void;
  onHintShown?: (level: HintLevel) => void;
  answer?: string;
  hintLevel?: HintLevel;
  /** The course already presents one step at a time. Reuse its exact context. */
  courseContext?: KontekstNauczyciela;
  onTeacherHelp?: (response: Odpowiedz, request: Prosba) => void;
}
export function TaskWorkspace(props: Props) {
  return <Workspace key={props.storageKey} {...props} />;
}
function Workspace({ question, skillName = '', storageKey, storage, onUseAnswer, onHintShown, answer = '', hintLevel = 0, courseContext, onTeacherHelp, simple = false }: Props) {
  const { draft, update, warning, ready } = useWorkspaceDraft(storageKey, storage, question.skillId);
  const plan = useMemo(() => getTaskPlan(question, skillName), [question, skillName]);
  const [tool, setTool] = useState<'notes'|'calculator'>(courseContext || simple ? 'calculator' : 'notes');
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notationTex, setNotationTex] = useState('');
  const [legacyTex, setLegacyTex] = useState<{expression:string;tex:string} | null>(null);
  const id = useId();
  const active = plan.steps[Math.min(Math.max(draft.activeStep, 0), plan.steps.length - 1)];
  const stepNotes = active ? draft.steps[active.id] ?? '' : '';
  const allNotes = [draft.notes, ...plan.steps.map(s => draft.steps[s.id] ? `${s.title}: ${draft.steps[s.id]}` : ''), ...draft.calculations.map(c => `${c.expression} = ${c.result}`), draft.input ? `Bieżący zapis w kalkulatorze: ${draft.input}` : ''].filter(Boolean).join('\n');
  const variables = Object.fromEntries(draft.calculations.filter(c => c.variable).map(c => [c.variable!, c.value]));
  const teacherContext = courseContext ? { ...courseContext, krok: { ...courseContext.krok, kontekst: [courseContext.krok.kontekst, `Brudnopis ucznia (niesprawdzony):\n${allNotes.slice(-6000)}`].filter(Boolean).join('\n') } }
    : teacherQuestionContext(question, { skillName, notes: allNotes, answer: draft.guided ? stepNotes : answer, ...(active && draft.guided ? { step: active.title } : {}), hintLevel });
  const coach = useTeacherConversation(coachConversationKey(storageKey));
  const latestCoach = coach.messages.filter(item => item.rola === 'nauczyciel').at(-1);
  const notation = preview || (latestCoach?.prosba === 'zapis' && !latestCoach.ukryta && draft.usedNotationId !== latestCoach.id
    && latestCoach.expression?.replace(/\s/g, '') !== draft.calculations.at(-1)?.expression.replace(/\s/g, '') ? latestCoach.expression ?? '' : '');
  useEffect(() => {
    let active = true; setNotationTex('');
    if (notation) void import('./calculator').then(({ calculationTex }) => {
      if (active) setNotationTex(calculationTex(notation));
    }).catch(() => {});
    return () => { active = false; };
  }, [notation]);
  const legacyExpression = draft.calculations.at(-1)?.expression;
  useEffect(() => {
    let active = true;
    if (courseContext && legacyExpression && !draft.calculations.at(-1)?.expressionTex) void import('./calculator').then(({calculationTex}) => {
      if (active) setLegacyTex({expression:legacyExpression,tex:calculationTex(legacyExpression)});
    }).catch(() => {});
    return () => {active=false;};
  }, [courseContext, legacyExpression]);
  const reviewedInput = latestCoach && coach.messages.find(item => `${item.id}:reply` === latestCoach.id)?.tekst;
  const helpCallback = useRef({ onTeacherHelp, onHintShown }); helpCallback.current = { onTeacherHelp, onHintShown };
  useEffect(() => {
    if (coach.busy || !latestCoach?.helpPending || latestCoach.ukryta) return;
    coach.change(items => items.map(item => item.id === latestCoach.id ? { ...item, helpPending: false } : item));
    const request = latestCoach.prosba ?? 'sprawdz-rachunek';
    helpCallback.current.onHintShown?.(request === 'pelne' ? 6 : 3);
    helpCallback.current.onTeacherHelp?.({ tekst: latestCoach.tekst, tryb: latestCoach.tryb ?? 'demo', model: latestCoach.model ?? null,
      ...(latestCoach.struktura ? { struktura: latestCoach.struktura } : {}) }, request);
  }, [latestCoach, coach.change, coach.busy]);
  const reviewCalculation = async (calculation: Calculation) => {
    const state = await askCalculationCoach({ storageKey, requestId: `calculation:${calculation.id ?? `${calculation.expression}:${calculation.result}`}`,
      request: 'sprawdz-rachunek', context: calculationReviewContext(teacherContext, calculation), text: `${calculation.expression} = ${calculation.result}` });
    if (state === 'busy') setMessage('Rachunek zapisany. Nauczyciel sprawdza wcześniejszy krok; kolejny możesz wysłać po zakończeniu.');
    if (state === 'duplicate') setMessage('Ten rachunek został już wysłany do nauczyciela — odpowiedź jest poniżej.');
  };
  const calculateNow = async (input = draft.input) => {
    if (working.current || !ready || !input.trim()) return;
    working.current = true;
    setBusy(true); setMessage('');
    try {
      const { calculate, isSupportedCalculation } = await import('./calculator');
      if ((courseContext || simple) && !isSupportedCalculation(input) && /[a-ząćęłńóśźż]{3,}/i.test(input.replace(/\b(sqrt|abs|sin|cos|tan|log|log10|ln)\b/g, ''))) {
        await askCalculationCoach({ storageKey, requestId: `notation:${crypto.randomUUID()}`, request: 'zapis', context: teacherContext, text: input });
        return;
      }
      const result = { ...calculate(input, variables), id: crypto.randomUUID() };
      update({ calculations: [...draft.calculations, result].slice(-60) });
      setPreview('');
      if (!courseContext && !simple) setMessage(`${result.expression} = ${result.result}. Rachunek zapisany.`);
      if (draft.teacherWatch) void reviewCalculation(result);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Nie udało się wykonać obliczenia.'); }
    finally { working.current = false; setBusy(false); }
  };
  const translate = async () => {
    if (!ready || working.current || !draft.input.trim()) return;
    working.current = true; setBusy(true); setMessage('');
    try {
      const { normalizeCalculation, isSupportedCalculation } = await import('./calculator');
      const normalized = normalizeCalculation(draft.input);
      if (isSupportedCalculation(normalized)) { setPreview(normalized); return; }
      const result = await askCalculationCoach({ storageKey, requestId: `notation:${crypto.randomUUID()}`,
        request: 'zapis', context: teacherContext, text: draft.input });
      if (result === 'busy') setMessage('Nauczyciel kończy poprzednią odpowiedź. Twój zapis jest zachowany.');
    } catch { setMessage('Nie udało się rozpoznać zapisu. Twoje słowa pozostają w polu; możesz spróbować ponownie.'); }
    finally { working.current = false; setBusy(false); }
  };
  const completeStep = async () => {
    if (working.current || !active || !stepNotes.trim()) return;
    working.current = true; setBusy(true);
    try {
    if (active.expected !== undefined) {
      try {
        const { calculate } = await import('./calculator');
        const value = calculate(stepNotes, variables).value;
        if (Math.abs(value - active.expected) > 1e-7 * Math.max(1, Math.abs(active.expected))) {
          setMessage('Ten krok jeszcze się nie zgadza. Sprawdź znaki, dane i kolejność działań. Możesz zapytać nauczyciela o swoje obliczenia.'); return;
        }
        setMessage(draft.activeStep === plan.steps.length - 1 ? 'Ostatni etap jest poprawny. Wstaw swój wynik do odpowiedzi poniżej.' : 'Ten wynik kroku jest poprawny. Przejdź do kolejnego etapu.');
      } catch { setMessage('W tym kroku wpisz liczbę lub działanie liczbowe. Dłuższe wyjaśnienie zachowaj w brudnopisie.'); return; }
    } else setMessage(draft.activeStep === plan.steps.length - 1 ? 'Plan ukończony. Zapisz odpowiedź poniżej i sprawdź całe zadanie. Oznaczenie etapów nie zastępuje sprawdzenia rozumowania.' : 'Krok zapisany. To Twoje oznaczenie ukończenia — poprawność rozumowania możesz omówić z nauczycielem.');
    update({ done: [...new Set([...draft.done, active.id])], activeStep: Math.min(draft.activeStep + 1, plan.steps.length - 1) });
    } finally { working.current = false; setBusy(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([`${question.prompt}\n\n${allNotes}`], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `rachunki-${question.id}.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const useResult = (c: Calculation) => {
    if (draft.guided && active) update({ steps: { ...draft.steps, [active.id]: calculationValue(c) } });
    else update({ notes: [draft.notes, `${c.expression} = ${c.result}`].filter(Boolean).join('\n') });
    setTool('notes');
  };
  const continueWithResult = (c: Calculation) => {
    update({ input: calculationValue(c) }); setTool('calculator'); setPreview('');
    if (!courseContext && !simple) setMessage('Wynik wstawiony do następnego działania. Dopisz np. /3,5 i zatwierdź.');
  };
  const useStepAnswer = async () => {
    if (working.current || !onUseAnswer) return;
    working.current = true; setBusy(true);
    try {
      const { calculate } = await import('./calculator');
      onUseAnswer(calculationValue(calculate(stepNotes, variables)));
    } catch { setMessage('Nie udało się odczytać wyniku. Sprawdź zapis tego etapu.'); }
    finally { working.current = false; setBusy(false); }
  };
  if (courseContext || simple) {
    const last = draft.calculations.at(-1);
    const resultRow = (c: Calculation, actions = true) => <div className="workspace__result">
      <div className="workspace__result-source">{c.expressionTex || legacyTex?.expression === c.expression ? <Tex>{`$${c.expressionTex ?? legacyTex?.tex}$`}</Tex> : <code>{c.expression}</code>}</div>
      <div className="workspace__result-value"><Tex>{`$${String(c.value) === c.result && !resultIsRounded(c.result) ? '=' : '\\approx'} ${resultTex(c.result)}$`}</Tex></div>
      {actions && <div className="workspace__actions">
        <button type="button" onClick={() => continueWithResult(c)}>Licz dalej</button>
        {onUseAnswer && <button type="button" onClick={() => onUseAnswer(calculationValue(c))}>Wstaw odpowiedź</button>}
        <button type="button" className="workspace__icon" aria-label="Zapisz w brudnopisie" title="Zapisz w brudnopisie" onClick={() => useResult(c)}>✎</button>
      </div>}
    </div>;
    return <section className="workspace workspace--simple" aria-label="Miejsce na rachunki" onKeyDown={e => { if (e.key !== 'Tab' && e.key !== 'Escape') e.stopPropagation(); }}>
      <header className="workspace__simple-head">
        <h2>Rachunki</h2>
        <div className="workspace__actions">
          <button type="button" className="workspace__icon" aria-label={tool === 'notes' ? 'Kalkulator' : 'Brudnopis'} title={tool === 'notes' ? 'Kalkulator' : 'Brudnopis'} aria-pressed={tool === 'notes'} onClick={() => setTool(tool === 'notes' ? 'calculator' : 'notes')}>{tool === 'notes' ? '⌗' : '✎'}</button>
          <button type="button" className="workspace__icon" aria-label="Historia obliczeń" title="Historia obliczeń" aria-expanded={historyOpen} onClick={() => setHistoryOpen(!historyOpen)}>↶</button>
          <details className="workspace__options"><summary aria-label="Więcej narzędzi" title="Więcej narzędzi">⋯</summary>
            <div>
              <label><input type="checkbox" checked={draft.teacherWatch === true} disabled={!ready} onChange={e => update({ teacherWatch:e.target.checked })} /> Nauczyciel sprawdza moje kroki</label>
              <button type="button" onClick={() => void translate()} disabled={busy || coach.busy || !draft.input.trim()}>Zamień słowa na znaki</button>
              <button type="button" onClick={download}>Pobierz notatki</button>
              <details><summary>Jak zapisać działanie?</summary><p>Ułamek: 3/4 · potęga: 2^3 · pierwiastek: sqrt(16). Możesz też opisać działanie słowami.</p></details>
            </div>
          </details>
        </div>
      </header>
      {warning && <p role="alert">{warning}</p>}
      {tool === 'notes' ? <textarea aria-label="Twoje rachunki i pomysły" value={draft.notes} rows={4} maxLength={12000} disabled={!ready} onChange={e => update({notes:e.target.value})} placeholder="Twój pomysł lub notatka…" /> : <div className="workspace__simple-input" onKeyDown={e => {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.target instanceof HTMLInputElement) { e.preventDefault(); void calculateNow(); }
      }}>
        <MathInput id={`${id}-calc`} label="Działanie do obliczenia" value={draft.input} onChange={input => { update({input}); setPreview(''); }} disabled={!ready || busy} focusOnly compact placeholder="Wpisz działanie lub opisz je słowami…" extraKeys={[[ '+','Plus','+' ],['×','Razy','*'],['√','Pierwiastek','sqrt('],['x','Zmienna x','x'],['=','Przypisz wartość','=']]} />
        <button type="button" className="workspace__calculate" onPointerDown={e => e.preventDefault()} onClick={() => void calculateNow()} disabled={busy || !draft.input.trim()}>{busy ? 'Chwila…' : 'Oblicz'}</button>
      </div>}
      {message && <p className="workspace__message" role="status">{message}</p>}
      {!notation && last && resultRow(last)}
      {notation && <div className="workspace__notation" aria-label="Rozpoznany zapis">
        {notationTex ? <Tex>{`$${notationTex}$`}</Tex> : <code>{notation}</code>}
        <button type="button" disabled={busy} onClick={() => { update({input:notation, ...(latestCoach ? {usedNotationId:latestCoach.id} : {})}); setPreview(''); void calculateNow(notation); }}>Oblicz ten zapis</button>
      </div>}
      {coach.busy && <p className="workspace__simple-coach" role="status">Nauczyciel sprawdza…</p>}
      {latestCoach && !coach.busy && latestCoach.prosba !== 'zapis' && <div className="workspace__simple-coach workspace__coach" aria-live="polite">
        {latestCoach.ukryta ? <button type="button" onClick={() => coach.change(items => items.map(item => item.id === latestCoach.id ? {...item,ukryta:false,prosba:'pelne',helpPending:true} : item))}>Pokaż podpowiedź</button> : <>
          <Sformatowane tekst={latestCoach.tekst} />
          {latestCoach.pytanieKontrolne && <Tex>{latestCoach.pytanieKontrolne}</Tex>}
        </>}
      </div>}
      {latestCoach?.tryb === 'demo' && latestCoach.prosba === 'zapis' && <p role="status">{latestCoach.tekst}</p>}
      {historyOpen && <div className="workspace__history" aria-label="Zapisane obliczenia">
        {draft.calculations.length ? draft.calculations.slice(0, -1).map((c,i) => <div key={c.id ?? i}>{resultRow(c)}</div>) : <p>Jeszcze nie ma obliczeń.</p>}
        {last && <p className="sr-only">Ostatni rachunek jest pokazany powyżej.</p>}
        {last && <button type="button" disabled={coach.busy} onClick={() => void reviewCalculation(last)}>Sprawdź ostatni rachunek z AI</button>}
      </div>}
      <TeacherCompanion compact conversationId={storageKey} context={teacherContext} onHelp={(response,request) => onTeacherHelp?.(response,request)} onUseNotation={(text,expression) => {
        update({notes:[draft.notes,expression ?? text].filter(Boolean).join('\n'), ...(expression ? {input:expression} : {})}); setTool(expression ? 'calculator' : 'notes');
      }} />
    </section>;
  }
  return <section className={`workspace${courseContext ? ' workspace--compact' : ''}`} aria-label="Miejsce na rachunki" data-workspace onKeyDown={e => { if (e.key !== 'Tab' && e.key !== 'Escape') e.stopPropagation(); }}>
    <header className="workspace__header"><div><h2>{courseContext ? 'Rachunki przy zadaniu' : 'Rozpisz, zamiast liczyć w głowie'}</h2>{!courseContext && <p>Brudnopis i kalkulator nie obniżają wyniku samodzielności.</p>}</div>
      {!courseContext && <button type="button" onClick={download}>Pobierz notatki</button>}</header>
    {(warning || !courseContext) && <p className="workspace__save" role="status">{warning || (ready ? 'Notatki zapisują się na tym urządzeniu.' : 'Odczytuję Twoje notatki…')}</p>}
    {!courseContext && <TeacherCompanion conversationId={storageKey} context={teacherContext}
      onUseNotation={(text, expression) => {
        update({ notes: [draft.notes, expression ?? text].filter(Boolean).join('\n'), ...(expression ? { input: expression } : {}) });
        setTool(expression ? 'calculator' : 'notes'); setPreview('');
        setMessage(expression ? 'Zapis od nauczyciela jest gotowy. Sprawdź nawiasy i wybierz „Oblicz”.' : 'Zapis nauczyciela zachowany w brudnopisie.');
      }}
      onHelp={(response, request) => { if (request !== 'zapis') onHintShown?.(request === 'pelne' ? 6 : 3); onTeacherHelp?.(response, request); }} />}
    {!courseContext && <div className="workspace__modes" role="group" aria-label="Sposób pracy">
      <button type="button" disabled={busy || !ready} aria-pressed={!draft.guided} onClick={() => update({ guided: false })}>Samodzielnie</button>
      <button type="button" disabled={busy || !ready} aria-pressed={draft.guided} onClick={() => { update({ guided: true }); onHintShown?.(1); }}>Prowadź etapami</button>
    </div>}
    {!courseContext && !draft.guided && <p className="workspace__small">Etapy podpowiadają metodę, zachowując trudność zadania.</p>}
    {!courseContext && draft.guided && active && <div className="workspace__plan">
      <p className="workspace__eyebrow">{plan.title} · etap {draft.activeStep + 1} z {plan.steps.length}</p>
      <nav aria-label="Etapy rozwiązania">{plan.steps.map((s, i) => <button type="button" disabled={busy || !ready} key={s.id} aria-current={i === draft.activeStep ? 'step' : undefined}
        onClick={() => { update({ activeStep: i }); setMessage(''); }} aria-label={`Etap ${i + 1}: ${s.title}`}>{draft.done.includes(s.id) ? '✓ ' : ''}{i + 1}</button>)}</nav>
      {plan.steps.some((s,i) => i < draft.activeStep && draft.steps[s.id]) && <details open className="workspace__previous"><summary>Poprzednie rachunki</summary>
        <ol>{plan.steps.slice(0, draft.activeStep).filter(s => draft.steps[s.id]).map(s => <li key={s.id}><strong>{s.title}:</strong> <span>{draft.steps[s.id]}</span></li>)}</ol>
      </details>}
      <h3>{active.title}</h3><p><Tex>{active.prompt}</Tex></p>
      <label htmlFor={`${id}-step`}>Twój zapis tego etapu</label>
      <textarea id={`${id}-step`} value={stepNotes} maxLength={3000} disabled={!ready || busy} rows={3}
        onChange={e => update({ steps: { ...draft.steps, [active.id]: e.target.value }, done: draft.done.filter(s => s !== active.id) })}
        placeholder={active.expected === undefined ? 'Wyjaśnij swój pomysł słowami lub zapisz równanie.' : 'Wpisz sam wynik lub działanie, np. (-6)^2. Wyjaśnienie możesz zapisać w brudnopisie.'} />
      <button type="button" disabled={busy || !stepNotes.trim()} onClick={() => void completeStep()}>{active.expected === undefined ? 'Zapisz etap i przejdź dalej' : 'Sprawdź ten etap'}</button>
      {onUseAnswer && active.expected !== undefined && draft.done.includes(active.id) && <button type="button" disabled={busy} onClick={() => void useStepAnswer()}>Wstaw zapisany wynik jako odpowiedź</button>}
    </div>}
    <div className="workspace__modes" role="group" aria-label="Narzędzia do rachunków">
      <button type="button" aria-pressed={tool === 'notes'} onClick={() => setTool('notes')}>Brudnopis</button>
      <button type="button" aria-pressed={tool === 'calculator'} onClick={() => setTool('calculator')}>Kalkulator</button>
    </div>
    {tool === 'notes' ? <div>
      <label htmlFor={`${id}-notes`}>Twoje rachunki i pomysły</label>
      <textarea id={`${id}-notes`} value={draft.notes} maxLength={12000} disabled={!ready} rows={3}
        onChange={e => update({ notes: e.target.value })} placeholder="Np. najpierw odejmuję opłatę początkową. Możesz pisać zwykłymi słowami albo wzorami." />
    </div> : <div className="workspace__calculator" onKeyDown={event => {
      if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.target instanceof HTMLInputElement) {
        event.preventDefault(); event.stopPropagation(); void calculateNow();
      }
    }}>
      <label htmlFor={`${id}-calc`} className={courseContext ? 'sr-only' : undefined}>Działanie lub opis słowami</label>
      <MathInput id={`${id}-calc`} label="Działanie do obliczenia" value={draft.input} onChange={value => { update({ input: value }); setPreview(''); }} disabled={!ready || busy}
        focusOnly compact={!!courseContext} placeholder="np. 43 minus 8" extraKeys={[[ '+','Plus','+' ],['×','Razy','*'],['√','Pierwiastek','sqrt('],['x','Zmienna x','x'],['=','Przypisz wartość','=']]} />
      {!courseContext && <p className="workspace__small">Enter oblicza działanie. Dłuższy opis słowny zamień najpierw na znaki.</p>}
      {/* Keep the keypad from collapsing on blur between pointer-down and click. */}
      <div className="workspace__actions"><button type="button" onPointerDown={event => event.preventDefault()} onClick={() => void calculateNow()} disabled={busy || !draft.input.trim()}>{busy ? 'Obliczam…' : 'Oblicz'}</button>
        <button type="button" onPointerDown={event => event.preventDefault()} onClick={() => void translate()} disabled={busy || coach.busy || !draft.input.trim()}>Zamień słowa na znaki</button></div>
      {preview && <div className="workspace__preview"><p>Rozpoznany zapis: <code>{preview}</code></p><p>Sprawdź, czy odpowiada Twojej intencji.</p><button type="button" onClick={() => { update({ input: preview }); setPreview(''); }}>Użyj tego zapisu</button></div>}
      <details className={`workspace__small${courseContext ? ' workspace__syntax-help' : ''}`}><summary aria-label="Jak zapisać działanie?" title="Jak zapisać działanie?">{courseContext ? <span aria-hidden="true">?</span> : 'Jak zapisać działanie?'}</summary>
        <p>Ułamki: 3/4 · potęgi: (-2)^2 · pierwiastki: sqrt(16). Zapamiętaj a=-4, potem użyj -3/a.</p>
        <p>log(100) = 2 (podstawa 10), ln(e) = 1. Inna podstawa: log(8)/log(2). W log używaj kropki dziesiętnej.</p>
        <p>Sinus i cosinus liczymy w radianach; stopnie: sin(30*pi/180). Wyniki do 14 cyfr znaczących.</p>
      </details>
      {Object.keys(variables).length > 0 && <p>Pamięć: {Object.entries(variables).map(([k,v]) => `${k}=${v}`).join(', ')}</p>}
      <div className="workspace__coach-switch">
        <label><input type="checkbox" checked={draft.teacherWatch === true} disabled={!ready} onChange={event => update({ teacherWatch: event.target.checked })} /> Nauczyciel sprawdza moje kroki</label>
        <p className="workspace__small" title="Pisanie nie wysyła zapytań. Wskazówka dotycząca metody liczy się jako pomoc; sam kalkulator nie obniża samodzielności.">Sprawdza zatwierdzone rachunki.</p>
      </div>
    </div>}
    {message && <p className="workspace__message" role="status">{message}</p>}
    {draft.calculations.length > 0 && <details className="workspace__history" open><summary>Historia obliczeń ({draft.calculations.length})</summary>
      <ol>{draft.calculations.map((c, i) => <li key={c.id ?? i}><code>{c.expression} {String(c.value) === c.result ? '=' : '≈'} {c.result}</code><div className="workspace__actions">
        <button type="button" onClick={() => continueWithResult(c)}>Użyj wyniku dalej</button>
        <button type="button" onClick={() => useResult(c)}>{draft.guided ? 'Wstaw do etapu' : 'Zapisz w brudnopisie'}</button>
        {onUseAnswer && <button type="button" onClick={() => onUseAnswer(calculationValue(c))}>Wstaw jako odpowiedź</button>}
      </div></li>)}</ol></details>}
    {(draft.teacherWatch || coach.busy || latestCoach) && <section className="workspace__coach" aria-label="Nauczyciel przy rachunkach" aria-live="polite">
      <strong>Nauczyciel przy rachunkach</strong>
      {coach.warning && <p role="status">{coach.warning}</p>}
      {coach.busy && <p role="status">Sprawdzam zatwierdzony krok… Możesz liczyć dalej.</p>}
      {!coach.busy && reviewedInput && <p className="workspace__small">Sprawdzany zapis: <code>{reviewedInput}</code></p>}
      {latestCoach && !coach.busy && (latestCoach.ukryta ? <button type="button" onClick={() => coach.change(items => items.map(item => item.id === latestCoach.id ? { ...item, ukryta: false, prosba: 'pelne', helpPending: true } : item))}>Odpowiedź zawiera kolejny wynik — pokaż jako pomoc</button> : <>
        {latestCoach.tryb === 'demo' && <p className="workspace__small">AI niepołączone</p>}
        <Sformatowane tekst={latestCoach.tekst} />
        {latestCoach.pytanieKontrolne && <p><Tex>{latestCoach.pytanieKontrolne}</Tex></p>}
        {latestCoach.powod && <p className="workspace__small">{latestCoach.powod}</p>}
        {latestCoach.prosba === 'zapis' && latestCoach.expression && <div className="workspace__preview"><p>Rozpoznany zapis: <code>{latestCoach.expression}</code></p><button type="button" onClick={() => { update({ input: latestCoach.expression! }); setTool('calculator'); setPreview(''); }}>Użyj tego zapisu</button><p>Sprawdź nawiasy, a potem wybierz „Oblicz”.</p></div>}
      </>)}
      {!!draft.calculations.length && <button type="button" disabled={coach.busy} onClick={() => void reviewCalculation(draft.calculations.at(-1)!)}>Sprawdź ostatni rachunek z AI</button>}
    </section>}
    {courseContext && <footer className="workspace__footer"><TeacherCompanion compact conversationId={storageKey} context={teacherContext} onHelp={(response, request) => onTeacherHelp?.(response, request)}
      onUseNotation={(text, expression) => { update({ notes: [draft.notes, expression ?? text].filter(Boolean).join('\n'), ...(expression ? { input: expression } : {}) }); setTool(expression ? 'calculator' : 'notes'); }} />
      <button type="button" className="workspace__icon" onClick={download} aria-label="Pobierz notatki" title="Pobierz notatki"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg></button>
    </footer>}
  </section>;
}

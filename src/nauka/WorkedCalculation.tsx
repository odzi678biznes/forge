import { useEffect, useRef, useState } from 'react';
import type { StoragePort } from '@/data/storage-port';
import { Math as Tex } from '@/components/Math';
import { TeacherCompanion } from '@/features/ai/TeacherCompanion';
import type { KontekstNauczyciela } from './nauczyciel-kontekst';
import { useLessonDraft } from './lesson-draft';
import {
  chooseWorkedOperation, finishWorkedCalculation, freshWorkedDraft, isWorkedDraft,
  resumeWorkedDraft, revealWorkedTheory, viewWorkedHistory,
  type WorkedDraft, type WorkedPlan, type WorkedResult,
} from './worked-plans';
import './worked-calculation.css';

export interface WorkedProgress { tex: string; completed: number; total: number; phase: string; prompt: string; options: string[] }
export interface WorkedCalculationProps {
  plan: WorkedPlan;
  storageKey: string;
  storage?: () => StoragePort;
  onComplete: (result: WorkedResult) => void;
  onHelp?: () => void;
  teacherContext?: KontekstNauczyciela;
  /** A prefix of operations already credited in the previous lesson flow. */
  initialCompletedSteps?: number;
  /** The parent has already recorded the final answer; render history only. */
  completed?: boolean;
  onProgress?: (progress: WorkedProgress) => void;
}

export function WorkedCalculation(props: WorkedCalculationProps) {
  return <SavedWorkedCalculation key={`${props.storageKey}:${props.plan.id}`} {...props} />;
}
function SavedWorkedCalculation(props: WorkedCalculationProps) {
  const saved = useLessonDraft(`worked:${props.storageKey}`, props.plan.skillId, isWorkedDraft, props.storage);
  if (!saved.ready) return <p role="status">Wczytuję Twoje obliczenia…</p>;
  const initial = props.completed
    ? { ...resumeWorkedDraft(saved.value, props.plan), ...freshWorkedDraft(props.plan, props.plan.steps.length, true) }
    : saved.value ? resumeWorkedDraft(saved.value, props.plan) : freshWorkedDraft(props.plan, props.initialCompletedSteps);
  return <>
    {saved.warning && <p role="alert">{saved.warning}</p>}
    <Calculation {...props} initial={initial} save={saved.save} />
  </>;
}

function Calculation({ plan, storageKey, onComplete, onHelp, teacherContext, onProgress, initial, save, completed }: WorkedCalculationProps & {
  initial: WorkedDraft; save: (draft: WorkedDraft) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [moreOpen, setMoreOpen] = useState(initial.theoryOpen || initial.viewIndex < initial.history.length);
  const latest = useRef(draft);
  const feedbackElement = useRef<HTMLParagraphElement>(null);
  const previousFeedback = useRef(draft.feedback);
  useEffect(() => {
    if (draft.feedback !== previousFeedback.current) feedbackElement.current?.focus({ preventScroll: true });
    previousFeedback.current = draft.feedback;
  }, [draft.feedback]);
  const progressCallback = useRef(onProgress); progressCallback.current = onProgress;
  const count = draft.history.length;
  const displayed = draft.viewIndex === 0 ? null : draft.history[draft.viewIndex - 1] ?? null;
  const tex = displayed?.tex ?? plan.initialTex;
  const browsing = draft.viewIndex < count;
  const step = plan.steps[count];
  const complete = draft.submitted || completed === true;
  const phase = step?.phase ?? plan.phases.length - 1;
  const phaseName = plan.phases[phase] ?? '';

  // Report the real current expression (not a historical preview) to the outer teacher.
  const currentTex = draft.history.at(-1)?.tex ?? plan.initialTex;
  const currentPrompt = step?.prompt ?? 'Obliczenia zakończone — omów rozumowanie.';
  useEffect(() => {
    progressCallback.current?.({ tex: currentTex, completed: count, total: plan.steps.length, phase: phaseName, prompt: currentPrompt, options: (step ?? plan.steps.at(-1))?.options.map(option=>option.label) ?? [] });
  }, [currentTex, count, plan.steps.length, phaseName, currentPrompt]);

  const update = (next: WorkedDraft) => {
    if (next === latest.current) return;
    latest.current = next;
    // Synchronous local checkpoint comes before the parent can navigate away.
    save(next); setDraft(next);
  };
  const applyResult = (next: { draft: WorkedDraft; result: WorkedResult | null }) => {
    const newlyAssisted = !latest.current.assisted && next.draft.assisted;
    update(next.draft);
    if (newlyAssisted) onHelp?.();
    if (next.result) onComplete(next.result);
  };
  const help = () => {
    if (complete) return;
    const wasAssisted = latest.current.assisted;
    update({ ...latest.current, assisted: true });
    if (!wasAssisted) onHelp?.();
  };
  const toggleTheory = () => {
    if (latest.current.theoryOpen) update({ ...latest.current, theoryOpen: false });
    else {
      const wasAssisted = latest.current.assisted;
      update(revealWorkedTheory(latest.current));
      if (!wasAssisted) onHelp?.();
    }
  };
  const context = teacherContext ? {
    ...teacherContext,
    krok: {
      ...teacherContext.krok,
      pytanie: step?.prompt ?? 'Obliczenia zakończone — omów rozumowanie.',
      kontekst: [teacherContext.krok.kontekst, `Aktualny wzór ucznia: $${currentTex}$.`,
        'Wykonane operacje:', ...draft.history.map(h => `${h.operation}: $${h.calculation}$`)].filter(Boolean).join('\n'),
    },
  } : undefined;

  return <section className="worked-calculation karta" aria-label="Obliczenia krok po kroku" data-step={step?.id ?? 'done'}>
    <header className="worked-calculation__header">
      <h2 className="karta__pytanie" tabIndex={-1}><Tex>{browsing ? 'Wcześniejszy zapis' : complete ? 'Obliczenia zakończone' : step?.prompt ?? 'Obliczenia zachowane'}</Tex></h2>
    </header>
    <div className="worked-calculation__expression" aria-label="Aktualny zapis wyrażenia" aria-live="polite" aria-atomic="true">
      <Tex display>{`$${tex}$`}</Tex>
    </div>
    {browsing ? <div className="worked-calculation__review">
      <button type="button" onClick={() => update(viewWorkedHistory(latest.current, latest.current.history.length))}>{complete ? 'Wróć do wyniku' : 'Wróć do obliczeń'}</button>
    </div> : <>
      {draft.feedback && <p ref={feedbackElement} tabIndex={-1} className={`worked-calculation__feedback worked-calculation__feedback--${draft.feedback.kind}`} role="status">
        {draft.feedback.kind === 'correct' ? '✓ Dobrze' : 'Spróbuj jeszcze raz'}
      </p>}
      {!complete && step ? <div className="worked-calculation__decision">
        <div className="worked-calculation__options" role="group" aria-label="Wybierz odpowiedź">
          {step.options.map((operation, index) => <button type="button" className="worked-calculation__option" key={`${step.id}:${operation.id}`}
            onClick={() => applyResult(chooseWorkedOperation(plan, latest.current, step.id, operation.id))}>
            <span className="worked-calculation__letter">{'ABCD'[index]}</span><Tex>{operation.label}</Tex>
          </button>)}
        </div>
      </div> : <div className="worked-calculation__finished">
        {!complete && <button type="button" onClick={() => applyResult(finishWorkedCalculation(plan, latest.current))}>Zakończ zadanie</button>}
      </div>}
    </>}
    <details className="worked-calculation__history" open={moreOpen} onToggle={event => setMoreOpen(event.currentTarget.open)}>
      <summary>Więcej</summary>
      <nav className="worked-calculation__navigation" aria-label="Historia przekształceń">
        <button type="button" aria-label="← Poprzedni zapis" disabled={draft.viewIndex === 0} onClick={() => update(viewWorkedHistory(latest.current, latest.current.viewIndex - 1))}>←</button>
        <button type="button" aria-label="Następny zapis →" disabled={draft.viewIndex >= count} onClick={() => update(viewWorkedHistory(latest.current, latest.current.viewIndex + 1))}>→</button>
      </nav>
      {!complete && step && !browsing && <div className="worked-calculation__theory">
        <button type="button" aria-expanded={draft.theoryOpen} onClick={toggleTheory}>{draft.theoryOpen ? 'Schowaj teorię' : 'Teoria — przypomnij regułę'}</button>
        {draft.theoryOpen && <p><Tex>{step.theory}</Tex></p>}
      </div>}
      {count > 0 && <ol aria-label="Zapisane obliczenia">
        <li><Tex>{`$${plan.initialTex}$`}</Tex></li>
        {draft.history.map((entry, i) => <li key={entry.stepId}>
          <button type="button" onClick={() => update(viewWorkedHistory(latest.current, i + 1))}>Pokaż zapis po operacji {i + 1}</button>
          <p><Tex>{entry.operation}</Tex></p>
          <p><Tex>{`$${entry.calculation}$`}</Tex></p>
          <p><Tex>{`$${entry.tex}$`}</Tex></p>
        </li>)}
      </ol>}
      {complete && <p className="worked-calculation__note">Samodzielność sprawdzisz na innym zadaniu w powtórce.</p>}
    </details>
    {context && <TeacherCompanion context={context} conversationId={`${storageKey}:operations`}
      onHelp={(_response, request) => { if (request !== 'zapis') help(); }} />}
  </section>;
}

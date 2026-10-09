import { useEffect, useRef } from 'react';
import { Math as Tex } from '@/components/Math';
import type { StoragePort } from '@/data/storage-port';
import { useWorkspaceDraft } from '@/features/workspace/workspace-draft';
import type { MicroStep } from './math-learning-types';
import type { Attempt, SkillState } from '@/data/types';
import { readStepEvidence, scaffoldingOmissions } from './math-scaffolding-policy';

export function MicroStepQuiz({ steps, storageKey, skillId, questionId, storage, evidence, skillState, attempts = [], review = false, hintExposed = false, onFinished, onHelp, onContext }: {
  steps: MicroStep[]; storageKey: string; skillId: string; questionId: string; storage?: () => StoragePort;
  skillState?: SkillState; attempts?: Attempt[]; review?: boolean; hintExposed?: boolean;
  evidence: ReturnType<typeof useWorkspaceDraft>;
  onFinished: (solved: boolean, assisted?: boolean, workingTex?: string) => void; onHelp: () => void; onContext: (text: string) => void;
}) {
  const { draft, update, ready, warning } = useWorkspaceDraft(`micro:${storageKey}`, storage, skillId);
  const callbacks = useRef({ onFinished, onHelp, onContext }); callbacks.current = { onFinished, onHelp, onContext };
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<number | null>(null);
  const policyReady = draft.steps.__policy === 'v2' || draft.updatedAt > 0;
  let omitted: string[] = [];
  try { const parsed: unknown = JSON.parse(draft.steps.__omitted ?? '[]'); if (Array.isArray(parsed)) omitted = parsed.filter((id): id is string => typeof id === 'string'); } catch { /* Older checkpoints retain their active step. */ }
  const nextStep = (from: number, skip = omitted) => {
    let index = from;
    while (index < steps.length && (skip.includes(steps[index]!.id) || draft.done.includes(steps[index]!.id))) index++;
    return index;
  };
  const step = steps[Math.min(draft.activeStep, steps.length - 1)]!;
  const chosen = draft.steps[step.id];
  const correct = draft.done.includes(step.id);
  const normalizedTex = (tex: string) => tex.replace(/\\(?:left|right|quad|qquad)\b/g, '').replace(/\s/g, '');
  const expressionInPrompt = [...(step.prompt ?? '').matchAll(/\$([^$]+)\$/g)]
    .some(match => { const tex = normalizedTex(match[1]!); return tex === normalizedTex(step.lhs) || tex.endsWith(`=${normalizedTex(step.lhs)}`); });
  const targetOnly = /^([a-zA-Z](?:_\{?\w+\}?)?|\\[A-Za-z]+|[fghPV]'?\([a-z]\))$/.test(normalizedTex(step.lhs));
  const showExpression = step.prompt && step.lhs.trim() && (!step.prompt.includes('$') || (!targetOnly && !expressionInPrompt));
  useEffect(() => {
    if (!ready || !evidence.ready || policyReady) return;
    const skip = review ? [] : scaffoldingOmissions(steps, { skillId, ...(skillState ? {state: skillState} : {}), attempts,
      stageAnswers: draft.steps, completed: draft.done, stepEvidence: readStepEvidence(evidence.draft.steps) });
    update({ activeStep: nextStep(0, skip), steps: { ...draft.steps, __policy: 'v2', __omitted: JSON.stringify(skip) } });
  }, [ready, evidence.ready, policyReady, review, steps, skillId, skillState, attempts, draft.steps, draft.done, evidence.draft.steps, update]);
  useEffect(() => {
    if (!ready) return;
    const changed = previousStep.current !== null && previousStep.current !== draft.activeStep;
    previousStep.current = draft.activeStep;
    // Follow the next step inside its own review dialog, without taking focus
    // from a separate calculator or teacher that the learner has opened.
    const otherDialog = Array.from(document.querySelectorAll('[role="dialog"],dialog[open]'))
      .some(dialog => !dialog.contains(heading.current));
    if (changed && !otherDialog) heading.current?.focus({ preventScroll: true });
  }, [ready, draft.activeStep]);
  useEffect(() => {
    if (!ready || !policyReady) return;
    const assisted = draft.steps.__finalError === 'true' || steps.some(step => step.stageKind !== 'final' && draft.steps[step.id] !== undefined);
    const lastDone = [...draft.done].reverse().map(id => steps.find(step => step.id === id)).find(step => step !== undefined);
    const workingTex = lastDone?.options.find(option => option.answer === lastDone.rhs)?.tex;
    if (assisted) callbacks.current.onHelp();
    if (!review && draft.steps.__mode === 'answer') { callbacks.current.onFinished(false, assisted, workingTex); return; }
    if (draft.activeStep >= steps.length) {
      if (!review) callbacks.current.onFinished(draft.done.length > 0 && steps.every(step => draft.done.includes(step.id) || omitted.includes(step.id)), assisted, workingTex);
    } else callbacks.current.onContext(`Bieżący mały krok: ${step.prompt ?? 'Oblicz lub przekształć.'} Aktualny wzór/warunek: $${step.lhs}$. Odpowiedzi tego etapu: ${step.options.map((option,index)=>`${'ABCD'[index]}: ${option.tex}`).join(' | ')}. ${chosen ? `Wybór ucznia: ${'ABCD'[step.options.findIndex(option=>option.answer===chosen)] ?? ''} (${step.options.find(option=>option.answer===chosen)?.tex ?? chosen}). ${correct ? 'Poprawny' : 'Niepoprawny'}.` : 'Uczeń jeszcze nie wybrał odpowiedzi.'}`);
  }, [ready, policyReady, review, draft.activeStep, draft.done, draft.steps, steps, step.lhs, step.prompt, chosen, correct]);
  if (ready && policyReady && review && draft.activeStep >= steps.length) return <section aria-label="Małe kroki zadania">
    {warning && <p role="alert">{warning}</p>}
    <p role="status">Powtórka zakończona. Pierwsza ocena pozostaje zapisana.</p>
    <button type="button" className="btn" onClick={() => callbacks.current.onFinished(false)}>Wróć do oceny</button>
  </section>;
  const shown = steps.filter(step => !omitted.includes(step.id));
  return <section className="arena__micro" aria-label="Małe kroki zadania" data-workspace>
    {(warning || evidence.warning) && <p role="alert">{warning || evidence.warning}</p>}
    <p className="arena__micro-count">Krok {Math.max(1, shown.findIndex(item => item.id === step.id) + 1)} z {shown.length || 1}</p>
    <h2 ref={heading} tabIndex={-1}><Tex>{step.prompt ?? `$${step.label ? `${step.label}:\\quad ` : ''}${step.lhs} = ?$`}</Tex></h2>
    {showExpression && <p className="arena__micro-expression"><Tex>{`$${step.lhs}$`}</Tex></p>}
    <fieldset className="choices" disabled={!ready || !evidence.ready || !policyReady || correct}>
      <legend className="sr-only">Wybierz odpowiedź</legend>
      {step.options.map((option, index) => <button type="button" className={`choice${chosen === option.answer ? ' choice--picked' : ''}`} key={option.answer}
        aria-pressed={chosen === option.answer} onClick={() => {
          const valid = option.answer === step.rhs;
          if (step.stageKind !== 'final' || !valid) callbacks.current.onHelp();
          const recordKey = `${storageKey}:${step.id}`;
          if (!review && chosen === undefined && !evidence.draft.steps[recordKey]) {
            evidence.update({steps: {...evidence.draft.steps, [recordKey]: JSON.stringify({ questionId, tags: step.tags ?? [], correct: valid, assisted: hintExposed, at: Date.now() })} });
          }
          update({ steps: { ...draft.steps, [step.id]: option.answer, ...(!valid ? {__error: 'true', __omitted: '[]', ...(step.stageKind === 'final' ? {__finalError:'true'} : {})} : {}) },
            ...(valid ? { done: [...new Set([...draft.done, step.id])], activeStep: nextStep(draft.activeStep + 1) }
              : omitted.length > 0 ? {activeStep: nextStep(0, [])} : {}) });
        }}>
        <span className="choice__letter">{'ABCD'[index]}</span><span className="choice__text"><Tex>{option.tex.includes('$') || /^[a-zA-Ząćęłńóśźż\s.,]+$/.test(option.tex.trim()) && /[a-zA-Ząćęłńóśźż]{3,}/.test(option.tex) ? option.tex : `$${option.tex}$`}</Tex></span>
      </button>)}
    </fieldset>
    {chosen && !correct && <p role="status">Spróbuj jeszcze raz.</p>}
    <button type="button" className="link" disabled={!ready || !policyReady} onClick={() => {
      if (review) callbacks.current.onFinished(false);
      else update({ activeStep: steps.length, steps: {...draft.steps, __mode: 'answer'} });
    }}>{review ? 'Wróć do oceny' : 'Znam odpowiedź'}</button>
  </section>;
}

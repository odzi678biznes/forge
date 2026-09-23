import { useState } from 'react';
import {
  buildAiContext,
  describeContext,
  hintLeaksAnswer,
  parseAiAssessment,
  parseAiHint,
  type AiAssessment,
  type AiHint,
  type AiTask,
  type ContextInput,
} from '@/learning-engine/ai-context';
import type { AiTutor } from './tutor';
import './ai.css';

/**
 * Zapytanie do AI z ekranem przejrzystości — Blueprint sek. 11 i 12.
 *
 * Kryterium Etapu 6: „aplikacja jasno pokazuje kontekst wysyłany do AI".
 * Dlatego nic nie idzie do AI jednym kliknięciem: pierwsze kliknięcie
 * pokazuje DOKŁADNIE to, co zostanie wysłane, pole po polu, a dopiero
 * drugie wysyła. Każde zapytanie osobno — zgoda nie przechodzi na kolejne.
 */

type Phase =
  | { kind: 'idle' }
  | { kind: 'preview' }
  | { kind: 'sending' }
  | { kind: 'hint'; hint: AiHint }
  | { kind: 'assessment'; assessment: AiAssessment }
  | { kind: 'error'; message: string };

interface Props {
  task: AiTask;
  tutor: AiTutor;
  input: Omit<ContextInput, 'task'>;
  /** Wywoływane, gdy uczeń zobaczył podpowiedź AI - odpowiedź przestaje być samodzielna. */
  onHintShown?: () => void;
}

const VERDICT_LABEL: Record<AiAssessment['verdict'], string> = {
  correct: 'Rozumowanie poprawne',
  partial: 'Rozumowanie częściowo poprawne',
  incorrect: 'Rozumowanie z błędem',
};

export function AiPanel({ task, tutor, input, onHintShown }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });

  if (tutor.unavailableReason) return null;

  const context = buildAiContext({ ...input, task });
  const lines = describeContext(context);

  const send = async () => {
    setPhase({ kind: 'sending' });
    try {
      const raw = await tutor.request(context);

      if (task === 'hint') {
        const hint = parseAiHint(raw);
        if (!hint) throw new Error('AI zwróciło odpowiedź w nieoczekiwanym kształcie.');
        // Druga warstwa ochrony: prompt zabrania podawania wyniku, ale
        // podpowiedź z wynikiem i tak nie trafia do ucznia.
        if (hintLeaksAnswer(`${hint.hint} ${hint.focus}`, input.question)) {
          throw new Error(
            'AI podało wynik zamiast wskazówki, więc odpowiedź została odrzucona. Skorzystaj z drabiny podpowiedzi.',
          );
        }
        onHintShown?.();
        setPhase({ kind: 'hint', hint });
      } else {
        const assessment = parseAiAssessment(raw);
        if (!assessment) throw new Error('AI zwróciło ocenę w nieoczekiwanym kształcie.');
        setPhase({ kind: 'assessment', assessment });
      }
    } catch (err) {
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Zapytanie do AI nie powiodło się.',
      });
    }
  };

  const label = task === 'hint' ? 'Zapytaj AI o podpowiedź' : 'Oceń tok rozumowania z AI';

  return (
    <section className="ai" aria-live="polite">
      {phase.kind === 'idle' && (
        <button type="button" className="ai__open" onClick={() => setPhase({ kind: 'preview' })}>
          {label}
          <span className="ai__cost">
            {task === 'hint'
              ? 'Najpierw zobaczysz, co zostanie wysłane. Odpowiedź przestanie liczyć się jako samodzielna.'
              : 'Najpierw zobaczysz, co zostanie wysłane. Ocena AI nie zmienia poziomu kompetencji.'}
          </span>
        </button>
      )}

      {phase.kind === 'preview' && (
        <div className="ai__preview">
          <p className="ai__title">Do AI trafi dokładnie to — i nic więcej:</p>
          <dl className="ai__fields">
            {lines.map((l) => (
              <div key={l.label}>
                <dt>{l.label}</dt>
                <dd>{l.value}</dd>
              </div>
            ))}
          </dl>
          <p className="ai__note">
            Nie są wysyłane: twoje poziomy, historia prób, plan, terminy ani żadne dane o tobie.
          </p>
          <div className="ai__actions">
            <button type="button" className="ai__send" onClick={() => void send()}>
              Wyślij do AI
            </button>
            <button type="button" className="ai__cancel" onClick={() => setPhase({ kind: 'idle' })}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {phase.kind === 'sending' && <p className="ai__status">AI analizuje… możesz w tym czasie myśleć dalej.</p>}

      {phase.kind === 'hint' && (
        <article className="ai__result">
          <p className="ai__title">Podpowiedź AI</p>
          <p>{phase.hint.hint}</p>
          {phase.hint.focus && <p className="ai__focus">Spójrz na: {phase.hint.focus}</p>}
        </article>
      )}

      {phase.kind === 'assessment' && (
        <article className="ai__result">
          <p className="ai__title">{VERDICT_LABEL[phase.assessment.verdict]}</p>
          {phase.assessment.firstGap && (
            <p className="ai__focus">Pierwsze miejsce rozjazdu: {phase.assessment.firstGap}</p>
          )}
          <p>{phase.assessment.feedback}</p>
          <p className="ai__note">
            To informacja zwrotna, a nie dowód opanowania — o poziomie decyduje sprawdzona odpowiedź.
          </p>
        </article>
      )}

      {phase.kind === 'error' && (
        <div className="ai__error">
          <p>{phase.message}</p>
          <button type="button" className="ai__cancel" onClick={() => setPhase({ kind: 'idle' })}>
            Zamknij
          </button>
        </div>
      )}
    </section>
  );
}

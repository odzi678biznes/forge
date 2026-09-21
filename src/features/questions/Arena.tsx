import { useEffect, useMemo, useRef, useState } from 'react';
import { HINT_LADDER, type Confidence, type HintLevel } from '@/data/types';
import { Math as Tex } from '@/components/Math';
import type { AnsweredStep } from '@/app/useForge';
import type { Selection } from '@/learning-engine/selector';
import './arena.css';

/**
 * Arena zadania - Blueprint sek. 7.2.
 *
 * Pelny ekran, bez nawigacji bocznej, bez planu tygodnia i bez statystyk.
 * Widoczne jest wylacznie to, co wymienia sek. 5: tresc, pole odpowiedzi,
 * "Sprawdz", skala pewnosci, drabina podpowiedzi i licznik pytan.
 */

interface Props {
  selection: Selection;
  step: number;
  total: number;
  feedback: AnsweredStep | null;
  onSubmit: (answer: string, hintLevel: HintLevel, confidence: Confidence) => void;
  onAdvance: () => void;
}

const CONFIDENCE_OPTIONS: Array<{ value: Confidence; label: string }> = [
  { value: 'guess', label: 'Zgaduje' },
  { value: 'partial', label: 'Czesciowo wiem' },
  { value: 'sure', label: 'Jestem pewny' },
];

export function Arena({ selection, step, total, feedback, onSubmit, onAdvance }: Props) {
  const { question } = selection;
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('partial');
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [whyOpen, setWhyOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  // Nowe pytanie zaczyna sie czysto i z kursorem w polu odpowiedzi.
  useEffect(() => {
    setAnswer('');
    setConfidence('partial');
    setHintLevel(0);
    setWhyOpen(false);
    inputRef.current?.focus();
  }, [question.id]);

  // Po ocenie fokus idzie na "Dalej", zeby klawiatura wystarczyla (sek. 18).
  useEffect(() => {
    if (feedback) continueRef.current?.focus();
  }, [feedback]);

  const shownHints = useMemo(
    () => question.hints.filter((h) => h.level <= hintLevel),
    [question.hints, hintLevel],
  );

  const nextHint = question.hints.find((h) => h.level > hintLevel);
  const locked = feedback !== null;

  const submit = () => {
    if (locked || answer.trim() === '') return;
    onSubmit(answer, hintLevel, confidence);
  };

  return (
    <main
      className="arena"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (locked) onAdvance();
          else submit();
        }
      }}
    >
      <header className="arena__bar">
        <span className="arena__count">
          Pytanie {step} z {total}
        </span>
        <button
          type="button"
          className="arena__why"
          onClick={() => setWhyOpen((v) => !v)}
          aria-expanded={whyOpen}
        >
          Dlaczego to pytanie?
        </button>
      </header>

      {whyOpen && (
        <aside className="arena__reasons">
          <ul>
            {selection.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className="arena__prompt">
        <p className="arena__skill">{selection.skill.name}</p>
        <h1 className="arena__question">
          <Tex>{question.prompt}</Tex>
        </h1>
      </section>

      <section className="arena__answer">
        <label className="arena__label" htmlFor="answer">
          Twoja odpowiedz
        </label>
        <input
          id="answer"
          ref={inputRef}
          className="arena__input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={locked}
          autoComplete="off"
          inputMode="text"
        />

        <fieldset className="arena__confidence" disabled={locked}>
          <legend>Na ile jestes pewny?</legend>
          {CONFIDENCE_OPTIONS.map((opt) => (
            <label key={opt.value} className="arena__chip">
              <input
                type="radio"
                name="confidence"
                value={opt.value}
                checked={confidence === opt.value}
                onChange={() => setConfidence(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </fieldset>

        {!locked && (
          <button
            type="button"
            className="arena__submit"
            onClick={submit}
            disabled={answer.trim() === ''}
          >
            Sprawdz
            <kbd>Enter</kbd>
          </button>
        )}
      </section>

      <section className="arena__hints">
        {shownHints.map((h) => (
          <article key={h.level} className="arena__hint">
            <p className="arena__hint-level">
              {h.level}. {HINT_LADDER[h.level - 1]}
            </p>
            <p>
              <Tex>{h.text}</Tex>
            </p>
          </article>
        ))}

        {!locked && nextHint && (
          <button
            type="button"
            className="arena__hint-more"
            onClick={() => setHintLevel(nextHint.level)}
          >
            {hintLevel === 0 ? 'Potrzebuje podpowiedzi' : 'Kolejna podpowiedz'}
            <span className="arena__hint-cost">
              {hintLevel === 0
                ? 'Odpowiedz przestanie liczyc sie jako samodzielna'
                : `Szczebel ${nextHint.level} z ${HINT_LADDER.length}`}
            </span>
          </button>
        )}
      </section>

      {feedback && <Feedback step={feedback} onAdvance={onAdvance} buttonRef={continueRef} />}
    </main>
  );
}

/**
 * Feedback wedlug sek. 5: przy bledzie nazywamy pierwsze miejsce rozbieznosci
 * i zlamana zasade, a nie wykladamy od razu calego rozwiazania.
 */
function Feedback({
  step,
  onAdvance,
  buttonRef,
}: {
  step: AnsweredStep;
  onAdvance: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const correct = step.grade.correctness === 'correct';

  return (
    <section
      className={`fb ${correct ? 'fb--ok' : 'fb--miss'}`}
      role="status"
      aria-live="polite"
    >
      <p className="fb__verdict">{correct ? 'Dobrze' : 'Jeszcze nie'}</p>

      <p className="fb__note">
        <Tex>{step.grade.note}</Tex>
      </p>

      {step.grade.error && (
        <p className="fb__rule">
          <Tex>{step.grade.error.rule}</Tex>
        </p>
      )}

      {correct && step.hintLevel > 0 && (
        <p className="fb__meta">
          Rozwiazane po podpowiedzi ({step.hintLevel}) - to nie liczy sie jeszcze jako
          samodzielne.
        </p>
      )}

      {step.transition && (
        <p className="fb__transition">
          {step.selection.skill.name}: poziom {step.transition.from} &rarr;{' '}
          {step.transition.to}. {step.transition.reason}
        </p>
      )}

      <button type="button" className="fb__next" onClick={onAdvance} ref={buttonRef}>
        Dalej
        <kbd>Enter</kbd>
      </button>
    </section>
  );
}

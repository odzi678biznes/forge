import { useEffect, useMemo, useRef, useState } from 'react';
import { HINT_LADDER, type CommonError, type Confidence, type HintLevel } from '@/data/types';
import { Math as Tex } from '@/components/Math';
import type { AnsweredStep } from '@/app/useForge';
import type { Selection } from '@/learning-engine/selector';
import { CodeEditor } from '@/features/code/CodeEditor';
import { CodeResults } from '@/features/code/CodeResults';
import { AiPanel } from '@/features/ai/AiPanel';
import { useSpeech } from '@/features/ai/useSpeech';
import type { AiTutor } from '@/features/ai/tutor';
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
  /** Termin zakonczenia proby czasowej w ms epoch; brak = misja bez limitu. */
  deadlineAt?: number | null;
  /** Wywolywane raz, gdy czas proby czasowej sie skonczy. */
  onTimeUp?: () => void;
  /** Czy trwa uruchamianie testow kodu. */
  running?: boolean;
  /** Opcjonalna warstwa AI - brak albo wylaczona oznacza zwykla arene. */
  ai?: ArenaAi;
}

export interface ArenaAi {
  tutor: AiTutor;
  /** Czy AI jest wlaczone (aplikacja desktopowa i klucz w tej sesji). */
  enabled: boolean;
  /** Ostatnie bledy w tej kompetencji - do kontekstu AI (sek. 11, pkt 5). */
  recentErrorIds: string[];
  catalogue: CommonError[];
}

/**
 * Szczebel pomocy przypisywany podpowiedzi AI. Odpowiada "przypomnieniu
 * zasady": po nim odpowiedz przestaje byc samodzielna, ale nadal moze
 * pchnac kompetencje z poziomu 1 na 2 (warunek: szczebel najwyzej 3).
 */
const AI_HINT_LEVEL: HintLevel = 3;

/**
 * Licznik proby czasowej - Blueprint sek. 4.3.
 *
 * Widoczny WYLACZNIE w misji, ktora uzytkownik wybral swiadomie. Blueprint
 * sek. 14 zakazuje sztucznej presji czasu, wiec zwykle misje nie dostaja
 * licznika nawet w tle.
 */
function useCountdown(deadlineAt: number | null | undefined, onTimeUp?: () => void) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (deadlineAt === null || deadlineAt === undefined) {
      setRemaining(null);
      return;
    }
    firedRef.current = false;

    const tick = () => {
      const left = deadlineAt - Date.now();
      setRemaining(globalThis.Math.max(0, left));
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeUp?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [deadlineAt, onTimeUp]);

  return remaining;
}

function formatClock(ms: number): string {
  const total = globalThis.Math.floor(ms / 1000);
  const m = globalThis.Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const CONFIDENCE_OPTIONS: Array<{ value: Confidence; label: string }> = [
  { value: 'guess', label: 'Zgaduje' },
  { value: 'partial', label: 'Czesciowo wiem' },
  { value: 'sure', label: 'Jestem pewny' },
];

export function Arena({
  selection,
  step,
  total,
  feedback,
  onSubmit,
  onAdvance,
  deadlineAt,
  onTimeUp,
  running = false,
  ai,
}: Props) {
  const speech = useSpeech();
  const [reasoning, setReasoning] = useState('');
  const remaining = useCountdown(deadlineAt, onTimeUp);
  const { question } = selection;
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('partial');
  const [hintLevel, setHintLevel] = useState<HintLevel>(0);
  const [whyOpen, setWhyOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isCode = question.format === 'code' && question.code !== undefined;
  const continueRef = useRef<HTMLButtonElement>(null);

  // Nowe pytanie zaczyna sie czysto i z kursorem w polu odpowiedzi.
  useEffect(() => {
    // Zadanie programistyczne startuje z kodem startowym, a nie z pustym polem.
    setAnswer(question.format === 'code' ? question.code?.starterCode ?? '' : '');
    setConfidence('partial');
    setHintLevel(0);
    setWhyOpen(false);
    setReasoning('');
    speech.stop();
    if (question.format === 'code') editorRef.current?.focus();
    else inputRef.current?.focus();
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
    if (locked || running || answer.trim() === '') return;
    onSubmit(answer, hintLevel, confidence);
  };

  return (
    <main
      className="arena"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          // W edytorze kodu Enter to nowa linia. Uruchomienie testow ma
          // wlasny skrot (Ctrl+Enter) obslugiwany przez sam edytor.
          const inEditor = (e.target as HTMLElement).tagName === 'TEXTAREA';
          if (inEditor && !locked) return;
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
        {remaining !== null && (
          <span
            className={
              remaining <= 60_000 ? 'arena__clock arena__clock--low' : 'arena__clock'
            }
            role="timer"
            aria-live="off"
          >
            {formatClock(remaining)}
          </span>
        )}
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
        {/* Odczyt tylko na żądanie i tylko lokalnym głosem (sek. 2 i 11). */}
        <button
          type="button"
          className="speak"
          disabled={speech.unavailableReason !== null}
          title={speech.unavailableReason ?? undefined}
          onClick={() => (speech.speaking ? speech.stop() : speech.speak(question.prompt))}
        >
          {speech.unavailableReason
            ? 'Odczyt na głos niedostępny'
            : speech.speaking
              ? 'Zatrzymaj odczyt'
              : 'Przeczytaj na głos'}
        </button>
      </section>

      <section className="arena__answer">
        {isCode && question.code ? (
          <CodeEditor
            ref={editorRef}
            task={question.code}
            value={answer}
            onChange={setAnswer}
            onRun={submit}
            disabled={locked}
            running={running}
          />
        ) : (
          <>
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
          </>
        )}

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

        {!locked && !isCode && (
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

      {ai?.enabled && !locked && (
        <AiPanel
          task="hint"
          tutor={ai.tutor}
          input={{
            question,
            answer,
            hintLevel,
            recentErrorIds: ai.recentErrorIds,
            errorCatalogue: ai.catalogue,
          }}
          // Podpowiedź AI to pomoc jak każda inna - odpowiedź przestaje być samodzielna.
          onHintShown={() =>
            setHintLevel((h) => (h >= AI_HINT_LEVEL ? h : AI_HINT_LEVEL))
          }
        />
      )}

      {feedback && <Feedback step={feedback} onAdvance={onAdvance} buttonRef={continueRef} />}

      {ai?.enabled && feedback && !isCode && (
        <section className="ai">
          <label className="arena__label" htmlFor="reasoning">
            Twój tok rozumowania (opcjonalnie)
          </label>
          <textarea
            id="reasoning"
            className="ai__reasoning"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Opisz kroki, którymi doszedłeś do odpowiedzi."
          />
          {reasoning.trim() !== '' && (
            <AiPanel
              task="assess"
              tutor={ai.tutor}
              input={{
                question,
                answer: feedback.userAnswer,
                reasoning,
                hintLevel: feedback.hintLevel,
                recentErrorIds: ai.recentErrorIds,
                errorCatalogue: ai.catalogue,
              }}
            />
          )}
        </section>
      )}
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
      <p className="fb__verdict">
        {correct ? 'Dobrze' : step.grade.correctness === 'partial' ? 'Częściowo' : 'Jeszcze nie'}
      </p>

      {/*
        Notatka z uruchomienia kodu zawiera wartosci zwrocone przez kod ucznia.
        Pokazujemy ja jako zwykly tekst - bez renderera LaTeX, zeby znak $
        w wyniku ucznia nie byl interpretowany jako wzor.
      */}
      <p className="fb__note">
        {step.code ? step.grade.note : <Tex>{step.grade.note}</Tex>}
      </p>

      {step.code && <CodeResults outcomes={step.code.outcomes} />}

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

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HINT_LADDER,
  MASTERY_LABELS,
  type CommonError,
  type Confidence,
  type HintLevel,
  type Question,
} from '@/data/types';
import { Math as Tex } from '@/components/Math';
import { Figure } from '@/components/Figure';
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
  { value: 'guess', label: 'Zgaduję' },
  { value: 'partial', label: 'Częściowo wiem' },
  { value: 'sure', label: 'Jestem pewny' },
];

const LETTERS = ['A', 'B', 'C', 'D'] as const;

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
  const isChoice = question.format === 'choice' && question.choices !== undefined;
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

  // Zadanie zamknięte: litera albo cyfra wybiera odpowiedź bez myszy.
  useEffect(() => {
    if (!isChoice || feedback) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      const k = e.key.toUpperCase();
      const byDigit = ['1', '2', '3', '4'].indexOf(k);
      const letter = byDigit >= 0 ? LETTERS[byDigit] : LETTERS.find((l) => l === k);
      if (letter) setAnswer(letter);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isChoice, feedback]);

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
        {question.figure && <Figure figure={question.figure} />}
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
        ) : isChoice && question.choices ? (
          <fieldset className="choices" disabled={locked}>
            <legend className="arena__label">Wybierz odpowiedź (A–D albo 1–4)</legend>
            {question.choices.map((c, i) => {
              const letter = LETTERS[i] ?? 'A';
              const classes = ['choice'];
              if (answer === letter) classes.push('choice--picked');
              if (locked && letter === question.answer) classes.push('choice--correct');
              if (locked && answer === letter && letter !== question.answer) classes.push('choice--wrong');
              return (
                <button
                  key={letter}
                  type="button"
                  className={classes.join(' ')}
                  aria-pressed={answer === letter}
                  onClick={() => setAnswer(letter)}
                >
                  <span className="choice__letter">{letter}</span>
                  <span className="choice__text">
                    <Tex>{c}</Tex>
                  </span>
                </button>
              );
            })}
          </fieldset>
        ) : (
          <>
            <label className="arena__label" htmlFor="answer">
              Twoja odpowiedź
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
          <legend>Na ile jesteś pewny?</legend>
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
            Sprawdź
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
            {hintLevel === 0 ? 'Potrzebuję podpowiedzi' : 'Kolejna podpowiedź'}
            <span className="arena__hint-cost">
              {hintLevel === 0
                ? 'Odpowiedź przestanie liczyć się jako samodzielna'
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

      {feedback && (
        <Feedback step={feedback} question={question} onAdvance={onAdvance} buttonRef={continueRef} />
      )}

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
  question,
  onAdvance,
  buttonRef,
}: {
  step: AnsweredStep;
  question: Question;
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

      {step.code && <CodeResults outcomes={step.code.outcomes} output={step.code.output} />}

      {step.grade.error && (
        <p className="fb__rule">
          <Tex>{step.grade.error.rule}</Tex>
        </p>
      )}

      {correct && step.hintLevel > 0 && (
        <p className="fb__meta">
          Rozwiązane po podpowiedzi (szczebel {step.hintLevel}) — to jeszcze nie liczy się jako
          samodzielne. Następnym razem spróbuj bez niej.
        </p>
      )}

      {step.transition && (
        <p className="fb__transition">
          {step.selection.skill.name}: {MASTERY_LABELS[step.transition.from]} &rarr;{' '}
          {MASTERY_LABELS[step.transition.to]}. {step.transition.reason}
        </p>
      )}

      {step.code ? (
        question.code?.modelSolution && <CodeSolution question={question} correct={correct} />
      ) : (
        <Solution question={question} correct={correct} />
      )}

      <button type="button" className="fb__next" onClick={onAdvance} ref={buttonRef}>
        Dalej
        <kbd>Enter</kbd>
      </button>
    </section>
  );
}

/**
 * Wzorcowy kod po próbie zadania programistycznego: najpierw wyjaśnienie
 * krok po kroku, potem sam kod - uczeń ma zrozumieć pomysł, a nie przepisać.
 */
function CodeSolution({ question, correct }: { question: Question; correct: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [question.id]);
  if (!open) {
    return (
      <button type="button" className="fb__solution-open" onClick={() => setOpen(true)}>
        {correct ? 'Porównaj z wzorcowym kodem' : 'Pokaż wzorcowe rozwiązanie'}
      </button>
    );
  }
  return (
    <div className="fb__solution">
      <ol>
        {(question.steps ?? [question.solution]).map((t, i) => (
          <li key={i}>
            <Tex>{t}</Tex>
          </li>
        ))}
      </ol>
      <pre className="fb__code">{question.code?.modelSolution}</pre>
    </div>
  );
}

/**
 * Rozwiązanie krok po kroku - na żądanie, nie od razu (sek. 5: najpierw
 * pierwsze miejsce rozbieżności, całość dopiero, gdy uczeń jej chce).
 * Kroki odsłaniają się po kolei, jak przy tablicy.
 */
function Solution({ question, correct }: { question: Question; correct: boolean }) {
  const steps = question.steps ?? [question.solution];
  const [shown, setShown] = useState(0);

  useEffect(() => setShown(0), [question.id]);

  if (shown === 0) {
    return (
      <button type="button" className="fb__solution-open" onClick={() => setShown(1)}>
        {correct ? 'Zobacz wzorcowe rozwiązanie' : 'Pokaż rozwiązanie krok po kroku'}
      </button>
    );
  }

  return (
    <div className="fb__solution">
      <ol>
        {steps.slice(0, shown).map((t, i) => (
          <li key={i}>
            <Tex>{t}</Tex>
          </li>
        ))}
      </ol>
      {shown < steps.length && (
        <div className="fb__solution-controls">
          <button type="button" className="fb__solution-open" onClick={() => setShown((n) => n + 1)}>
            Następny krok
          </button>
          <button type="button" className="fb__solution-all" onClick={() => setShown(steps.length)}>
            Pokaż wszystko
          </button>
        </div>
      )}
    </div>
  );
}

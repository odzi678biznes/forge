import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HINT_LADDER,
  MASTERY_LABELS,
  type CommonError,
  type Confidence,
  type HintLevel,
  type Question,
  type SkillState,
  type Attempt,
} from '@/data/types';
import { Math as Tex } from '@/components/Math';
import { MathInput } from '@/components/MathInput';
import { Figure } from '@/components/Figure';
import type { ArenaDraft } from '@/app/mission-session';
import type { StoragePort } from '@/data/storage-port';
import { TaskWorkspace } from '@/features/workspace/TaskWorkspace';
import { ModalPanel } from '@/components/ModalPanel';
import { NauczycielPanel } from '@/nauka/NauczycielPanel';
import { teacherQuestionContext } from '@/features/ai/teacher-context';
import { readWorkspaceNotes, useWorkspaceDraft } from '@/features/workspace/workspace-draft';
import { MicroStepQuiz } from './MicroStepQuiz';
import type { MicroOption, MicroStep } from './math-learning-types';
import type { AnsweredStep } from '@/app/useForge';
import type { Selection } from '@/learning-engine/selector';
import { grade } from '@/learning-engine/grading';
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
  sessionId?: string;
  storage?: () => StoragePort;
  skillState?: SkillState;
  attempts?: Attempt[];
  draft?: ArenaDraft | null;
  onDraft?: (draft: ArenaDraft) => void;
  onPause?: () => void;
  saveError?: string | null;
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
  mathematical?: boolean;
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
  // Wartość od pierwszej klatki — licznik nie miga przy każdym nowym pytaniu.
  const [remaining, setRemaining] = useState<number | null>(() =>
    deadlineAt === null || deadlineAt === undefined ? null : globalThis.Math.max(0, deadlineAt - Date.now()),
  );
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

/**
 * Każde pytanie dostaje własną instancję ekranu, więc odpowiedź, pewność
 * i podpowiedzi są świeże od pierwszej klatki. Wcześniej czyścił je efekt po
 * renderze: przez chwilę nowe pytanie pokazywało poprzednią odpowiedź przy
 * aktywnym „Sprawdź”, a szybkie dotknięcie lub Enter wysłałyby ją jako
 * odpowiedź na nowe pytanie (i gubiły wpis zrobiony w tym momencie).
 */
export function Arena(props: Props) {
  return <ArenaPytania key={`${props.sessionId ?? ''}:${props.selection.question.id}`} {...props} />;
}

function ArenaPytania({
  sessionId, storage, draft, onDraft, onPause, saveError, skillState, attempts = [],
  selection,
  step,
  total,
  feedback,
  onSubmit,
  onAdvance,
  deadlineAt,
  onTimeUp,
  running = false,
  mathematical = false,
  ai,
}: Props) {
  const speech = useSpeech();
  const [reasoning, setReasoning] = useState(draft?.reasoning ?? '');
  const remaining = useCountdown(deadlineAt, onTimeUp);
  const { question } = selection;
  // Zadanie programistyczne startuje z kodem startowym, a nie z pustym polem.
  const [answer, setAnswer] = useState(() => draft?.answer ?? feedback?.userAnswer ?? (question.format === 'code' ? question.code?.starterCode ?? '' : ''));
  const [confidence, setConfidence] = useState<Confidence>(draft?.confidence ?? feedback?.confidence ?? 'partial');
  const [hintLevel, setHintLevel] = useState<HintLevel>(draft?.hintLevel ?? feedback?.hintLevel ?? 0);
  // Assistance accounting also includes micro-training; it must never open the
  // answer-bearing hint cards by itself.
  const [visibleHintLevel, setVisibleHintLevel] = useState<HintLevel>(draft?.visibleHintLevel ?? 0);
  const [guidanceHelpUsed, setGuidanceHelpUsed] = useState(draft?.guidanceHelpUsed ?? false);
  const [workingTex, setWorkingTex] = useState(draft?.workingTex ?? '');
  const [whyOpen, setWhyOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [microSteps, setMicroSteps] = useState<MicroStep[]>([]);
  const [microFinished, setMicroFinished] = useState(false);
  const [guidedReview, setGuidedReview] = useState(false);
  const [microContext, setMicroContext] = useState('');
  const [microReachesAnswer, setMicroReachesAnswer] = useState(false);
  const microSubmission = useRef(false);
  const [numericOptions, setNumericOptions] = useState<MicroOption[]>([]);
  const [directTags, setDirectTags] = useState<string[]>([]);
  const stageEvidence = useWorkspaceDraft('micro-evidence', storage);
  const [mathReady, setMathReady] = useState(!mathematical || question.format === 'code');
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isCode = question.format === 'code' && question.code !== undefined;
  const isChoice = question.format === 'choice' && question.choices !== undefined;
  const continueRef = useRef<HTMLButtonElement>(null);
  const workspaceKey = `${sessionId ?? 'practice'}:${question.id}`;
  const microActive = !feedback && !microFinished && microSteps.length > 0;
  const needsTaskContext = microActive && /^([a-zA-Z](?:_\{?\w+\}?)?|\\[A-Za-z]+|[fghPV]'?\([a-z]\))$/.test(microSteps[0]?.lhs.replace(/\s/g,'') ?? '')
    && !(microSteps[0]?.prompt?.includes('$'));
  const answerOptions = isChoice ? question.choices!.slice(0, 4).map((tex, index) => ({ tex, answer: LETTERS[index]! })) : numericOptions;
  useEffect(() => {
    let live = true;
    if (mathematical && !isCode) void import('./microsteps').then(module => {
      if (live) {
        const steps = module.microstepsForQuestion(question);
        const terminal = steps.at(-1) as MicroStep | undefined;
        setMicroSteps(steps); setMicroReachesAnswer(terminal?.finalAnswer !== undefined
          ? grade(question, terminal.finalAnswer).correctness === 'correct'
          : module.microstepsReachAnswer(question, steps));
        setNumericOptions(module.numericChoices(question));
        if ('directRoutineTags' in module && typeof module.directRoutineTags === 'function') setDirectTags(module.directRoutineTags(question) as string[]);
      }
    }).catch(() => { /* Unsupported/offline module: original task remains usable. */ }).finally(() => { if (live) setMathReady(true); });
    return () => { live = false; };
  }, [question, mathematical, isCode]);
  const teacherContext = teacherQuestionContext(question, { skillName: selection.skill.name, answer,
    notes: [readWorkspaceNotes(workspaceKey), microContext].filter(Boolean).join('\n'), hintLevel,
    ...(microActive ? { step: 'Pomóż mi w bieżącym małym kroku, bez dalszego wyniku.' } : {}) });
  const finishMicro = (solved: boolean, assisted = false, computedTex?: string) => {
    if (computedTex) setWorkingTex(computedTex);
    setMicroFinished(true);
    if (solved && microReachesAnswer && !feedback && !microSubmission.current) {
      microSubmission.current = true;
      setAnswer(question.answer);
      onSubmit(question.answer, Math.max(hintLevel, assisted ? 5 : 0) as HintLevel, confidence);
    }
  };

  useEffect(() => {
    onDraft?.({ questionId: question.id, answer, confidence, hintLevel, visibleHintLevel, guidanceHelpUsed, workingTex, reasoning });
  }, [question.id, answer, confidence, hintLevel, visibleHintLevel, guidanceHelpUsed, workingTex, reasoning, onDraft]);

  // Nowe pytanie zaczyna z kursorem w polu odpowiedzi. Stan jest świeży, bo
  // ekran powstaje od nowa dla każdego pytania; czytanie na głos zatrzymuje
  // sprzątanie useSpeech przy odmontowaniu poprzedniego pytania.
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (question.format === 'code') editorRef.current?.focus();
    else inputRef.current?.focus();
  }, []);

  // Zadanie zamknięte: litera albo cyfra wybiera odpowiedź bez myszy.
  useEffect(() => {
    if (answerOptions.length === 0 || feedback || microActive || toolsOpen || teacherOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('[data-workspace],dialog') || ['TEXTAREA', 'INPUT'].includes((e.target as HTMLElement).tagName)) return;
      const k = e.key.toUpperCase();
      const byDigit = ['1', '2', '3', '4'].indexOf(k);
      const letter = byDigit >= 0 ? LETTERS[byDigit] : LETTERS.find((l) => l === k);
      if (letter) { const option = answerOptions[LETTERS.indexOf(letter)]; if (option) setAnswer(option.answer); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answerOptions, feedback, microActive, toolsOpen, teacherOpen]);

  // Po ocenie fokus idzie na "Dalej", zeby klawiatura wystarczyla (sek. 18).
  useEffect(() => {
    if (feedback) continueRef.current?.focus();
  }, [feedback]);

  const shownHints = useMemo(
    () => question.hints.filter((h) => h.level <= visibleHintLevel),
    [question.hints, visibleHintLevel],
  );

  const nextHint = question.hints.find((h) => h.level > visibleHintLevel);
  const locked = feedback !== null;

  const submit = () => {
    if (locked || running || microActive || answer.trim() === '' || (directTags.length > 0 && !stageEvidence.ready)) return;
    const recordKey = `direct:${workspaceKey}`;
    if (directTags.length > 0 && !stageEvidence.draft.steps[recordKey]) stageEvidence.update({ steps: {
      ...stageEvidence.draft.steps, [recordKey]: JSON.stringify({ questionId: question.id, tags: directTags,
        correct: grade(question, answer).correctness === 'correct', assisted: hintLevel > 0 || guidanceHelpUsed, at: Date.now() }),
    } });
    onSubmit(answer, hintLevel, confidence);
  };

  return (
    <main
      className="arena"
      data-math-ready={mathReady}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest('[data-workspace],dialog') || (e.target as HTMLElement).tagName === 'BUTTON' || toolsOpen || teacherOpen || microActive) return;
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
        {onPause && <button type="button" className="link" onClick={onPause}>Zapisz i wyjdź</button>}
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
          aria-label="Informacje o zadaniu"
          title="Informacje o zadaniu"
          onClick={() => setWhyOpen((v) => !v)}
          aria-expanded={whyOpen}
        >
          ⋯
        </button>
      </header>

      {saveError && <p role="alert">{saveError}</p>}
      {whyOpen && (
        <aside className="arena__reasons">
          <strong>Dlaczego to pytanie?</strong>
          <ul>
            {selection.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </aside>
      )}

      <section className="arena__prompt">
        {!microActive && <p className="arena__skill">{selection.skill.name}</p>}
        <h1 className={`arena__question${microActive && !needsTaskContext ? ' sr-only' : ''}`}>
          <Tex>{question.prompt}</Tex>
        </h1>
        {microActive && !needsTaskContext && <details><summary>Dane zadania</summary><p><Tex>{question.prompt}</Tex></p></details>}
        {question.figure && <Figure figure={question.figure} />}
        {question.listing && <pre className="arena__listing">{question.listing}</pre>}
        {/* Odczyt tylko na żądanie i tylko lokalnym głosem (sek. 2 i 11). */}
        {!microActive && <button
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
        </button>}
      </section>

      {microActive && <MicroStepQuiz steps={microSteps} storageKey={workspaceKey} skillId={question.skillId} questionId={question.id} {...(storage ? {storage} : {})}
        evidence={stageEvidence}
        hintExposed={guidanceHelpUsed || visibleHintLevel > 0 || (hintLevel > 0 && hintLevel !== 5)}
        {...(skillState ? {skillState} : {})} attempts={attempts}
        onFinished={finishMicro} onHelp={() => setHintLevel(level => Math.max(level, 5) as HintLevel)}
        onContext={setMicroContext} />}
      {microActive && !isCode && mathematical && <div className="arena__tools">
        <button type="button" className="btn btn--small" onClick={() => setToolsOpen(true)}>Kalkulator</button>
        <button type="button" className="btn btn--small" onClick={() => setTeacherOpen(true)}>Nauczyciel</button>
      </div>}
      {toolsOpen && <ModalPanel label="Kalkulator" className="course-notebook" onClose={() => setToolsOpen(false)}>
        <button type="button" className="btn btn--small" onClick={() => setToolsOpen(false)}>Wróć do zadania</button>
        <TaskWorkspace simple question={question} skillName={selection.skill.name} answer={answer} hintLevel={hintLevel}
          storageKey={workspaceKey} {...(storage ? { storage } : {})}
          {...(!locked && !isChoice ? { onUseAnswer: (value:string) => { setAnswer(grade(question, value).correctness === 'correct' ? question.answer : value); setToolsOpen(false); } } : {})}
          onHintShown={level => { if (level > 0) setGuidanceHelpUsed(true); setHintLevel(h => Math.max(h, level) as HintLevel); }}
          onTeacherHelp={(_response, request) => { if (request !== 'zapis') { setGuidanceHelpUsed(true); setHintLevel(level => Math.max(level, request === 'pelne' ? 6 : 3) as HintLevel); } }} />
      </ModalPanel>}
      {teacherOpen && <NauczycielPanel kontekst={teacherContext} conversationId={workspaceKey} onZamknij={() => setTeacherOpen(false)}
        onOdpowiedz={(_response, request) => { if (request !== 'zapis') { setGuidanceHelpUsed(true); setHintLevel(level => Math.max(level, request === 'pelne' ? 6 : 3) as HintLevel); } }} />}

      {!microActive && mathReady && (!mathematical || !feedback) && <section className="arena__answer">
        {stageEvidence.warning && <p role="alert">{stageEvidence.warning}</p>}
        {workingTex && <p className="arena__working-result"><Tex>{`$${workingTex}$`}</Tex></p>}
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
        ) : answerOptions.length > 0 ? (
          <fieldset className="choices" disabled={locked}>
            <legend className="sr-only">Wybierz odpowiedź (A–D albo 1–4)</legend>
            {answerOptions.map((option, i) => {
              const letter = LETTERS[i] ?? 'A';
              const classes = ['choice'];
              if (answer === option.answer) classes.push('choice--picked');
              if (locked && option.answer === question.answer) classes.push('choice--correct');
              if (locked && answer === option.answer && option.answer !== question.answer) classes.push('choice--wrong');
              return (
                <button
                  key={letter}
                  type="button"
                  className={classes.join(' ')}
                  aria-pressed={answer === option.answer}
                  onClick={() => setAnswer(option.answer)}
                >
                  <span className="choice__letter">{letter}</span>
                  <span className="choice__text">
                    <Tex>{isChoice ? option.tex : `$${option.tex}$`}</Tex>
                    {locked && option.answer === question.answer && <span className="opcja__status">✓ Poprawna odpowiedź</span>}
                    {locked && answer === option.answer && option.answer !== question.answer && <span className="opcja__status">↺ Twój wybór — sprawdź wyjaśnienie</span>}
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
            {mathematical ? <MathInput id="answer" ref={inputRef} className="arena__input"
              value={answer} onChange={setAnswer} disabled={locked} /> : <input
              id="answer"
              ref={inputRef}
              className="arena__input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={locked}
              autoComplete="off"
              inputMode="text"
            />}
          </>
        )}

        <details><summary>Pewność odpowiedzi</summary><fieldset className="arena__confidence" disabled={locked}>
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
        </fieldset></details>

        {!locked && !isCode && (
          <button
            type="button"
            className="arena__submit"
            onClick={submit}
            disabled={answer.trim() === '' || (directTags.length > 0 && !stageEvidence.ready)}
          >
            Sprawdź odpowiedź
            <kbd>Enter</kbd>
          </button>
        )}
      </section>}
      {!microActive && !isCode && mathematical && <div className="arena__tools">
        <button type="button" className="btn btn--small" onClick={() => setToolsOpen(true)}>Kalkulator</button>
        <button type="button" className="btn btn--small" onClick={() => setTeacherOpen(true)}>Nauczyciel</button>
      </div>}

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
            onClick={() => { setGuidanceHelpUsed(true); setVisibleHintLevel(nextHint.level); setHintLevel(level => Math.max(level, nextHint.level) as HintLevel); }}
          >
            {visibleHintLevel === 0 ? 'Potrzebuję podpowiedzi' : 'Kolejna podpowiedź'}
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
          onHintShown={() => { setGuidanceHelpUsed(true); setHintLevel((h) => (h >= AI_HINT_LEVEL ? h : AI_HINT_LEVEL)); }}
        />
      )}

      {feedback && (
        <Feedback step={feedback} question={question} onAdvance={onAdvance} buttonRef={continueRef} simple={mathematical} />
      )}
      {feedback && feedback.grade.correctness !== 'correct' && microSteps.length > 0 &&
        <button type="button" className="btn btn--small" onClick={() => setGuidedReview(true)}>Rozwiąż krokami</button>}
      {guidedReview && feedback && <ModalPanel label="Rozwiąż krokami" onClose={() => setGuidedReview(false)}>
        <MicroStepQuiz review steps={microSteps} storageKey={`review:${workspaceKey}`} skillId={question.skillId} questionId={question.id}
          evidence={stageEvidence}
          {...(storage ? {storage} : {})} onFinished={() => setGuidedReview(false)} onHelp={() => {}}
          onContext={setMicroContext} />
      </ModalPanel>}

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
  simple = false,
}: {
  step: AnsweredStep;
  question: Question;
  onAdvance: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  simple?: boolean;
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

      {simple && correct && <p className="fb__answer-value"><Tex>{question.format === 'choice'
        ? question.choices?.['ABCD'.indexOf(question.answer)] ?? question.answer
        : `$${question.answer}$`}</Tex></p>}

      <details open={!simple} className="fb__details"><summary className={simple ? undefined : 'sr-only'}>Wyjaśnienie</summary>
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
      </details>

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

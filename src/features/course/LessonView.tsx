import { useEffect, useMemo, useState } from 'react';
import type { Lesson, LessonBlock, Skill, Topic, WorkedExample } from '@/data/types';
import { Math as Tex } from '@/components/Math';
import { Icon } from '@/components/Icon';
import { Figure } from '@/components/Figure';
import { LessonSpeechPlayer } from './LessonSpeechPlayer';
import { lessonAudio, lessonDigest } from './lesson-audio';
import { formulaParts } from './formula-parts';
import { TeacherCompanion } from '@/features/ai/TeacherCompanion';
import { teacherLessonContext } from '@/features/ai/teacher-context';
import '@/features/ai/ai.css';
import './course.css';

/**
 * Lekcja - nauczyciel przed ćwiczeniami.
 *
 * Przykład nie jest pokazany od razu w całości: kolejne kroki odsłaniasz sam,
 * jak przy tablicy. Zanim klikniesz "dalej", masz chwilę, żeby pomyśleć, jaki
 * byłby następny krok - to jest różnica między czytaniem rozwiązania a
 * uczeniem się z niego.
 */

interface Props {
  lesson: Lesson;
  skill: Skill;
  topic: Topic | undefined;
  onPractice: () => void;
  onBack: () => void;
  backLabel?: string;
}

function useReadingState<T>(key: string, initial: T): [T, (value: T | ((old: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try { const saved = localStorage.getItem(key); return saved === null ? initial : JSON.parse(saved) as T; }
    catch { return initial; }
  });
  return [value, next => setValue(old => {
    const updated = typeof next === 'function' ? (next as (old: T) => T)(old) : next;
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch { /* Reading position is optional. */ }
    return updated;
  })];
}

export function LessonView(props: Props) {
  return <LessonReading key={props.lesson.skillId} {...props} />;
}
function LessonReading({ lesson, skill, topic, onPractice, onBack, backLabel = 'Kurs' }: Props) {
  const readingKey = `forge.lesson-reading.v1:${lesson.skillId}`;
  const [compact, setCompact] = useReadingState(`${readingKey}:compact`, false);
  const digest = useMemo(() => lessonDigest(lesson), [lesson]);
  const audio = useMemo(() => lessonAudio(lesson, compact ? digest : undefined), [lesson, compact, digest]);

  useEffect(() => {
    let position = 0;
    try { position = Number(localStorage.getItem(`${readingKey}:scroll`)) || 0; } catch { /* optional */ }
    const frame = requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, position) }));
    const save = () => { try { localStorage.setItem(`${readingKey}:scroll`, String(window.scrollY)); } catch { /* optional */ } };
    window.addEventListener('scroll', save, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', save); };
  }, [readingKey]);

  return (
    <main className="page lesson">
      <header>
        <button type="button" className="link" onClick={onBack}>
          &larr; {backLabel}
        </button>
        <p className="page__eyebrow">
          {topic?.name ?? 'Lekcja'} · {skill.level === 'PR' ? 'rozszerzenie' : 'podstawa'} · {compact ? 'krótkie przypomnienie' : `${lesson.minutes} min`}
        </p>
        <h1 className="page__title">{skill.name}</h1>
        {!compact && <p className="lesson__intro">
          <Tex>{lesson.intro}</Tex>
        </p>}
        <div className="lesson__mode" role="group" aria-label="Długość lekcji">
          <button type="button" aria-pressed={!compact} onClick={() => setCompact(false)}>Cała lekcja</button>
          <button type="button" aria-pressed={compact} onClick={() => setCompact(true)}>W pigułce</button>
        </div>
      </header>

      <TeacherCompanion context={teacherLessonContext(lesson, skill)} />

      {compact && <section className="lesson__digest card" aria-labelledby="lesson-digest">
        <h2 className="lesson__h2" id="lesson-digest">W pigułce</h2>
        <p className="lesson__digest-note">Szybkie przypomnienie przed ćwiczeniami.</p>
        {digest.map((sentence, i) => <p className="lesson__p" key={i}><Tex>{sentence}</Tex></p>)}
        <button type="button" className="btn btn--primary" onClick={onPractice}>
          <Icon name="play" size={18} /> To już wiem — przejdź do ćwiczeń
        </button>
      </section>}

      <LessonSpeechPlayer key={`${lesson.skillId}-${compact}`} audio={audio} compact={compact} />

      {!compact && <>
      {lesson.idea && (
        <section className="lesson__body lesson__idea" aria-labelledby="lesson-idea">
          <h2 className="lesson__h2" id="lesson-idea">
            Skąd to się bierze
          </h2>
          {lesson.idea.map((p, i) => (
            <p key={i} className="lesson__p">
              <Tex>{p}</Tex>
            </p>
          ))}
        </section>
      )}

      <section className="lesson__body" aria-label="Wzory i zasady">
        {lesson.idea && <h2 className="lesson__h2">Najważniejsze wzory i zasady</h2>}
        {lesson.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </section>

      {lesson.method && (
        <section className="lesson__body" aria-labelledby="lesson-method">
          <h2 className="lesson__h2" id="lesson-method">
            Jak to zrobić
          </h2>
          <ol className="lesson__method">
            {lesson.method.map((m, i) => (
              <li key={i}>
                <Tex>{m}</Tex>
              </li>
            ))}
          </ol>
        </section>
      )}

      {lesson.check && <Check key={lesson.skillId} check={lesson.check} storageKey={`${readingKey}:check`} />}

      <section aria-label="Przykłady rozwiązane krok po kroku" className="lesson__examples">
        <h2 className="lesson__h2">Rozwiązujemy razem</h2>
        {lesson.examples.map((e, i) => (
          <Example key={i} example={e} index={i + 1} storageKey={`${readingKey}:example:${i}`} />
        ))}
      </section>

      <section className="lesson__pitfalls card" aria-label="Pułapki">
        <h2 className="lesson__h2">Na tym najczęściej traci się punkty</h2>
        <ul>
          {lesson.pitfalls.map((t, i) => (
            <li key={i}>
              <Tex>{t}</Tex>
            </li>
          ))}
        </ul>
      </section>

      <section className="lesson__next card card--raised">
        <div>
          <h2 className="lesson__h2">Teraz Ty</h2>
          <p className="lesson__next-text">
            Kilka zadań od łatwych do maturalnych. Jeśli pójdzie dobrze — trudność rośnie. Jeśli coś nie wyjdzie —
            dostaniesz podpowiedź i zadanie o krok łatwiejsze. Możesz w każdej chwili wrócić do tej lekcji.
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onPractice}>
          <Icon name="play" size={18} /> Przejdź do ćwiczeń
        </button>
      </section>
      </>}
    </main>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <p className="lesson__p">
          <Tex>{block.body}</Tex>
        </p>
      );
    case 'formula':
      return (
        <figure className="lesson__formula">
          <div className="lesson__formula-parts">
            {formulaParts(block.tex).map((part, i) => (
              <Tex key={i} display>
                {'$' + part + '$'}
              </Tex>
            ))}
          </div>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case 'tip':
      return (
        <aside className="lesson__callout lesson__callout--tip">
          <strong>Zapamiętaj</strong>
          <Tex>{block.body}</Tex>
        </aside>
      );
    case 'warning':
      return (
        <aside className="lesson__callout lesson__callout--warn">
          <strong>Uwaga</strong>
          <Tex>{block.body}</Tex>
        </aside>
      );
    case 'figure':
      return <Figure figure={block.figure} {...(block.caption ? { caption: block.caption } : {})} />;
    case 'code':
      return (
        <figure className="lesson__code">
          <pre>
            <code>{block.code}</code>
          </pre>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
  }
}

/**
 * Pytanie sprawdzające: najpierw myślisz sam, potem odsłaniasz odpowiedź.
 * Nie jest oceniane - to przypomnienie z pamięci, a nie sprawdzian.
 */
function Check({ check, storageKey }: { check: { question: string; answer: string }; storageKey: string }) {
  const [open, setOpen] = useReadingState(storageKey, false);
  return (
    <section className="lesson__check card" aria-labelledby="lesson-check">
      <h2 className="lesson__h2" id="lesson-check">
        Sprawdź, czy rozumiesz
      </h2>
      <p className="lesson__p">
        <Tex>{check.question}</Tex>
      </p>
      {open ? (
        <p className="lesson__check-answer">
          <Tex>{check.answer}</Tex>
        </p>
      ) : (
        <button type="button" className="btn btn--small" onClick={() => setOpen(true)}>
          Pokaż odpowiedź
        </button>
      )}
    </section>
  );
}

function Example({ example, index, storageKey }: { example: WorkedExample; index: number; storageKey: string }) {
  const [shown, setShown] = useReadingState(storageKey, 0);
  const all = shown >= example.steps.length;

  return (
    <article className="example card">
      <p className="example__label">Przykład {index}</p>
      <p className="example__prompt">
        <Tex>{example.prompt}</Tex>
      </p>
      <ol className="example__steps">
        {example.steps.slice(0, shown).map((s, i) => (
          <li key={i} className="example__step">
            <Tex>{s.text}</Tex>
            {s.why && (
              <span className="example__why">
                <Tex>{s.why}</Tex>
              </span>
            )}
          </li>
        ))}
      </ol>
      {all ? (
        <p className="example__answer">
          Odpowiedź: <Tex>{example.answer}</Tex>
        </p>
      ) : (
        <div className="example__controls">
          <button type="button" className="btn btn--small" onClick={() => setShown((n) => n + 1)}>
            {shown === 0 ? 'Pokaż pierwszy krok' : 'Następny krok'}
          </button>
          {shown === 0 && <span className="example__hint">Najpierw pomyśl, od czego byś zaczął.</span>}
          {shown > 0 && (
            <button type="button" className="link" onClick={() => setShown(example.steps.length)}>
              Pokaż wszystko
            </button>
          )}
        </div>
      )}
    </article>
  );
}

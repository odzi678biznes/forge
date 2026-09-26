import { useEffect, useState } from 'react';
import type { Lesson, LessonBlock, Skill, Topic, WorkedExample } from '@/data/types';
import { Math as Tex } from '@/components/Math';
import { Icon } from '@/components/Icon';
import { Figure } from '@/components/Figure';
import { useSpeech } from '@/features/ai/useSpeech';
import { formulaParts } from './formula-parts';
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

export function LessonView({ lesson, skill, topic, onPractice, onBack, backLabel = 'Kurs' }: Props) {
  const speech = useSpeech();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [lesson.skillId]);

  const readAloud = () => {
    const text = [
      lesson.intro,
      ...(lesson.idea ?? []),
      ...lesson.blocks.map((b) =>
        b.kind === 'formula'
          ? `$${b.tex}$`
          : b.kind === 'figure'
            ? b.figure.alt
            : b.kind === 'code'
              ? `Przykład kodu${b.caption ? `: ${b.caption}` : ''}.`
              : b.body,
      ),
      ...(lesson.method ? ['Jak to zrobić.', ...lesson.method.map((m, i) => `Krok ${i + 1}. ${m}`)] : []),
    ].join(' ');
    return speech.speaking ? speech.stop() : speech.speak(text);
  };

  return (
    <main className="page lesson">
      <header>
        <button type="button" className="link" onClick={onBack}>
          &larr; {backLabel}
        </button>
        <p className="page__eyebrow">
          {topic?.name ?? 'Lekcja'} · {skill.level === 'PR' ? 'rozszerzenie' : 'podstawa'} · {lesson.minutes} min
        </p>
        <h1 className="page__title">{skill.name}</h1>
        <p className="lesson__intro">
          <Tex>{lesson.intro}</Tex>
        </p>
        <button
          type="button"
          className="speak"
          disabled={speech.unavailableReason !== null}
          title={speech.unavailableReason ?? undefined}
          onClick={readAloud}
        >
          {speech.unavailableReason
            ? 'Odczyt na głos niedostępny'
            : speech.speaking
              ? 'Zatrzymaj odczyt'
              : 'Przeczytaj lekcję na głos'}
        </button>
      </header>

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

      {lesson.check && <Check key={lesson.skillId} check={lesson.check} />}

      <section aria-label="Przykłady rozwiązane krok po kroku" className="lesson__examples">
        <h2 className="lesson__h2">Rozwiązujemy razem</h2>
        {lesson.examples.map((e, i) => (
          <Example key={i} example={e} index={i + 1} />
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
function Check({ check }: { check: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);
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

function Example({ example, index }: { example: WorkedExample; index: number }) {
  const [shown, setShown] = useState(0);
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

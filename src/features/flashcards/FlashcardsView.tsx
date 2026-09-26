import { useCallback, useEffect, useState } from 'react';
import type { CardState, Flashcard, FlashcardKind, Skill } from '@/data/types';
import { RATING_LABELS, type CardRating } from '@/learning-engine/flashcards';
import { count } from '@/learning-engine/polish';
import { Math as Tex } from '@/components/Math';
import { Icon } from '@/components/Icon';
import './flashcards.css';

/**
 * Fiszki: sesja na dziś i przegląd wszystkich kart.
 *
 * Najpierw próbujesz sobie przypomnieć, potem odsłaniasz i uczciwie oceniasz.
 * Karta, której nie pamiętałeś, wraca jeszcze raz na końcu tej sesji - żeby
 * zakończyć ją poprawnym przypomnieniem, a nie porażką.
 */

interface Props {
  queue: Flashcard[];
  dueCount: number;
  newCount: number;
  cards: Flashcard[];
  states: Map<string, CardState>;
  skills: Skill[];
  unlockedSkillIds: Set<string>;
  onRate: (card: Flashcard, rating: CardRating) => void;
  onDone: () => void;
  nextLessonName: string | null;
}

const KIND_LABELS: Record<FlashcardKind, string> = {
  wzor: 'Wzór',
  definicja: 'Definicja',
  metoda: 'Metoda',
  pulapka: 'Pułapka',
};

export function FlashcardsView(props: Props) {
  const [tab, setTab] = useState<'session' | 'all'>('session');
  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Fiszki</p>
        <h1 className="page__title">Wzory, definicje, pułapki</h1>
        <p className="page__lead">
          Karta, którą pamiętasz, wraca po coraz dłuższej przerwie: 1, 3, 7, 14, 30, 60 dni. Karta, której nie
          pamiętasz — jutro. Nowe karty pojawiają się po lekcjach, najwyżej 10 dziennie.
        </p>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'session'} className={tab === 'session' ? 'tabs__item tabs__item--on' : 'tabs__item'} onClick={() => setTab('session')}>
            Na dziś {props.queue.length > 0 && <span className="nav__badge">{props.queue.length}</span>}
          </button>
          <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'tabs__item tabs__item--on' : 'tabs__item'} onClick={() => setTab('all')}>
            Wszystkie karty
          </button>
        </div>
      </header>
      {tab === 'session' ? <Session {...props} /> : <AllCards {...props} />}
    </main>
  );
}

function Session({ queue, dueCount, newCount, skills, onRate, onDone, nextLessonName }: Props) {
  // Kolejka zamrożona na start sesji - ocena nie może przetasować kart pod ręką.
  const [cards, setCards] = useState<Flashcard[]>(queue);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [remembered, setRemembered] = useState(0);
  const [retried, setRetried] = useState<Set<string>>(new Set());

  const current = cards[index];
  const finished = index >= cards.length;

  const rate = useCallback(
    (rating: CardRating) => {
      if (!current) return;
      onRate(current, rating);
      if (rating === 'good') setRemembered((n) => n + 1);
      if (rating === 'again' && !retried.has(current.id)) {
        setCards((prev) => [...prev, current]);
        setRetried((prev) => new Set(prev).add(current.id));
      }
      setRevealed(false);
      setIndex((i) => i + 1);
    },
    [current, onRate, retried],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element && e.target.closest('button, a, summary')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (!revealed) {
          e.preventDefault();
          setRevealed(true);
        }
      } else if (revealed && (e.key === '1' || e.key === '2' || e.key === '3')) {
        rate(e.key === '1' ? 'again' : e.key === '2' ? 'hard' : 'good');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished, revealed, rate]);

  if (queue.length === 0) {
    return (
      <section className="card flash__empty">
        <Icon name="check" size={28} />
        <h2>Na dziś nic nie czeka</h2>
        <p>{nextLessonName ? `Nowe fiszki po lekcji „${nextLessonName}”.` : 'Wszystkie dostępne fiszki są przejrzane.'}</p>
        <button type="button" className="btn btn--primary" onClick={onDone}>{nextLessonName ? 'Kontynuuj' : 'Wróć do „Dziś”'}</button>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="card flash__empty">
        <Icon name="check" size={28} />
        <h2>Sesja skończona</h2>
        <p>
          {count(queue.length, ['karta', 'karty', 'kart'])}, z czego od razu pamiętane: {remembered}. Karty wrócą
          wtedy, kiedy zaczną się zacierać.
        </p>
        <button type="button" className="btn btn--primary" onClick={onDone}>
          Wróć do „Dziś”
        </button>
      </section>
    );
  }

  const skill = skills.find((s) => s.id === current?.skillId);

  return (
    <section className="flash" aria-live="polite">
      <p className="flash__progress">
        Karta {index + 1} z {cards.length} · zaległe {dueCount}, nowe {newCount}
      </p>
      <div className="bar" aria-hidden>
        <div className="bar__fill" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      <article className={revealed ? 'flash__card flash__card--revealed' : 'flash__card'}>
        <p className="flash__meta">
          <span className="chip">{current ? KIND_LABELS[current.kind] : ''}</span>
          {skill && <span>{skill.name}</span>}
        </p>
        <p className="flash__front">
          <Tex>{current?.front ?? ''}</Tex>
        </p>
        {revealed ? (
          <p className="flash__back">
            <Tex>{current?.back ?? ''}</Tex>
          </p>
        ) : (
          <button type="button" className="btn btn--primary flash__reveal" onClick={() => setRevealed(true)} autoFocus>
            Pokaż odpowiedź <kbd>Spacja</kbd>
          </button>
        )}
      </article>

      {revealed && (
        <div className="flash__rate" role="group" aria-label="Jak poszło?">
          {(['again', 'hard', 'good'] as CardRating[]).map((r, i) => (
            <button key={r} type="button" className={`btn flash__btn flash__btn--${r}`} onClick={() => rate(r)}>
              {RATING_LABELS[r]} <kbd>{i + 1}</kbd>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function AllCards({ cards, states, skills, unlockedSkillIds, onDone }: Props) {
  const bySkill = skills
    .map((s) => ({ skill: s, cards: cards.filter((c) => c.skillId === s.id) }))
    .filter((g) => g.cards.length > 0);

  if (bySkill.length === 0) {
    return <div className="calendar__empty"><p>Ten przedmiot nie ma jeszcze fiszek. Kontynuuj naukę w „Dziś”.</p><button type="button" className="btn btn--primary" onClick={onDone}>Kontynuuj</button></div>;
  }

  return (
    <section className="all-cards">
      {bySkill.map(({ skill, cards: own }) => (
        <details key={skill.id} className="card all-cards__group" open={unlockedSkillIds.has(skill.id) || undefined}>
          <summary>
            <strong>{skill.name}</strong>
            <span className="chip">{count(own.length, ['karta', 'karty', 'kart'])}</span>
            {!unlockedSkillIds.has(skill.id) && <span className="chip">po lekcji</span>}
          </summary>
          <ul>
            {own.map((c) => (
              <li key={c.id}>
                <span className="all-cards__front">
                  <Tex>{c.front}</Tex>
                </span>
                <span className="all-cards__back">
                  <Tex>{c.back}</Tex>
                </span>
                {states.get(c.id) && <span className="chip">pudełko {states.get(c.id)?.box}</span>}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}

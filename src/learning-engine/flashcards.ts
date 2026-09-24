import type { CardState, Flashcard } from '@/data/types';

/**
 * Fiszki w systemie pudełek (Leitnera).
 *
 * Świadomie nie SM-2: pudełka da się wytłumaczyć jednym zdaniem ("pamiętasz -
 * karta idzie do pudełka z dłuższą przerwą, zapominasz - wraca na początek"),
 * a to jest warunek z sek. 17, że każda decyzja systemu ma być jawna.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Przerwa po awansie do pudełka o danym numerze, w dniach. */
export const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30, 60] as const;
export const MAX_BOX = BOX_INTERVALS_DAYS.length - 1;

/** Ile nowych fiszek dziennie - więcej naraz zapycha kolejne dni powtórkami. */
export const NEW_CARDS_PER_DAY = 10;
/** Górna granica jednej sesji; reszta poczeka, zamiast robić ścianę kart. */
export const SESSION_LIMIT = 30;

export type CardRating = 'again' | 'hard' | 'good';

export const RATING_LABELS: Record<CardRating, string> = {
  again: 'Nie pamiętałem',
  hard: 'Z trudem',
  good: 'Pamiętałem',
};

export function newCardState(card: Flashcard, now: number): CardState {
  return {
    cardId: card.id,
    skillId: card.skillId,
    box: 0,
    dueAt: now,
    introducedAt: now,
    lastReviewedAt: null,
    reviews: 0,
    lapses: 0,
  };
}

/**
 * Ocena karty.
 * - Pamiętałem: pudełko wyżej, dłuższa przerwa.
 * - Z trudem: pudełko bez zmian, ta sama przerwa.
 * - Nie pamiętałem: powrót do pierwszego pudełka i jutro znowu.
 */
export function reviewCard(state: CardState, rating: CardRating, now: number): CardState {
  const box =
    rating === 'good'
      ? Math.min(MAX_BOX, state.box + 1)
      : rating === 'hard'
        ? Math.max(1, state.box)
        : 1;
  return {
    ...state,
    box,
    dueAt: now + (BOX_INTERVALS_DAYS[box] ?? 0) * DAY,
    lastReviewedAt: now,
    reviews: state.reviews + 1,
    lapses: state.lapses + (rating === 'again' ? 1 : 0),
  };
}

export interface CardSessionInput {
  /** Fiszki w kolejności kursu. */
  cards: Flashcard[];
  states: Map<string, CardState>;
  /**
   * Umiejętności, których fiszki wolno już pokazywać - po lekcji albo po
   * pierwszych próbach. Fiszka z nieznanego tematu to zgadywanie, nie powtórka.
   */
  unlockedSkillIds: Set<string>;
  /** Ile nowych kart wprowadzono dzisiaj - limit dzienny, nie na sesję. */
  introducedToday: number;
  now: number;
}

export interface CardSession {
  /** Karty do przejrzenia, w kolejności: najpierw zaległe, potem nowe. */
  queue: Flashcard[];
  dueCount: number;
  newCount: number;
}

export function buildCardSession(input: CardSessionInput): CardSession {
  const { cards, states, unlockedSkillIds, introducedToday, now } = input;

  const due = cards
    .filter((c) => {
      const s = states.get(c.id);
      return s !== undefined && s.dueAt <= now;
    })
    .sort((a, b) => (states.get(a.id)?.dueAt ?? 0) - (states.get(b.id)?.dueAt ?? 0));

  const room = Math.max(0, Math.min(NEW_CARDS_PER_DAY - introducedToday, SESSION_LIMIT - due.length));
  const fresh = cards
    .filter((c) => !states.has(c.id) && unlockedSkillIds.has(c.skillId))
    .slice(0, room);

  const queue = [...due.slice(0, SESSION_LIMIT), ...fresh];
  return { queue, dueCount: Math.min(due.length, SESSION_LIMIT), newCount: fresh.length };
}

/** Ile kart czeka dziś: zaległe plus nowe w limicie dnia. */
export function cardsWaiting(input: CardSessionInput): number {
  return buildCardSession(input).queue.length;
}

/** Nowe karty wprowadzone od początku dnia - do dziennego limitu. */
export function introducedSince(states: Iterable<CardState>, dayStart: number): number {
  let n = 0;
  for (const s of states) if (s.introducedAt >= dayStart) n += 1;
  return n;
}

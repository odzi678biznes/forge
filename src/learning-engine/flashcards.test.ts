import { describe, expect, it } from 'vitest';
import type { CardState, Flashcard } from '@/data/types';
import {
  MAX_BOX,
  NEW_CARDS_PER_DAY,
  SESSION_LIMIT,
  buildCardSession,
  introducedSince,
  newCardState,
  reviewCard,
} from './flashcards';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_000 * DAY;

const card = (id: string, skillId = 's-1'): Flashcard => ({
  id,
  skillId,
  kind: 'wzor',
  front: 'Przód',
  back: 'Tył',
});

describe('ocena karty', () => {
  it('pamietalem - wyzsze pudelko i dluzsza przerwa', () => {
    const s1 = reviewCard(newCardState(card('c'), NOW), 'good', NOW);
    expect(s1.box).toBe(1);
    expect(s1.dueAt).toBe(NOW + DAY);
    const s2 = reviewCard(s1, 'good', s1.dueAt);
    expect(s2.box).toBe(2);
    expect(s2.dueAt).toBe(s1.dueAt + 3 * DAY);
  });

  it('nie pamietalem - powrot do pierwszego pudelka, jutro znowu, liczona pomylka', () => {
    const high: CardState = { ...newCardState(card('c'), NOW), box: 5 };
    const s = reviewCard(high, 'again', NOW);
    expect(s.box).toBe(1);
    expect(s.dueAt).toBe(NOW + DAY);
    expect(s.lapses).toBe(1);
  });

  it('z trudem - pudelko bez zmian', () => {
    const mid: CardState = { ...newCardState(card('c'), NOW), box: 3 };
    expect(reviewCard(mid, 'hard', NOW).box).toBe(3);
  });

  it('pudelko nie przekracza ostatniego', () => {
    let s: CardState = { ...newCardState(card('c'), NOW), box: MAX_BOX };
    s = reviewCard(s, 'good', NOW);
    expect(s.box).toBe(MAX_BOX);
  });
});

describe('sesja fiszek', () => {
  const cards = Array.from({ length: 50 }, (_, i) => card(`c-${i}`, i < 25 ? 's-1' : 's-2'));

  it('nowe karty tylko z odblokowanych umiejetnosci - nie zgadujemy nieznanego tematu', () => {
    const s = buildCardSession({
      cards,
      states: new Map(),
      unlockedSkillIds: new Set(['s-2']),
      introducedToday: 0,
      now: NOW,
    });
    expect(s.queue.every((c) => c.skillId === 's-2')).toBe(true);
  });

  it('dzienny limit nowych kart liczy tez karty wprowadzone wczesniej tego dnia', () => {
    const s = buildCardSession({
      cards,
      states: new Map(),
      unlockedSkillIds: new Set(['s-1', 's-2']),
      introducedToday: NEW_CARDS_PER_DAY - 3,
      now: NOW,
    });
    expect(s.newCount).toBe(3);
  });

  it('najpierw zalegle, od najstarszej', () => {
    const states = new Map<string, CardState>([
      ['c-1', { ...newCardState(card('c-1'), NOW), dueAt: NOW - 2 * DAY }],
      ['c-2', { ...newCardState(card('c-2'), NOW), dueAt: NOW - 5 * DAY }],
      ['c-3', { ...newCardState(card('c-3'), NOW), dueAt: NOW + DAY }],
    ]);
    const s = buildCardSession({
      cards,
      states,
      unlockedSkillIds: new Set(['s-1']),
      introducedToday: 0,
      now: NOW,
    });
    expect(s.queue.slice(0, 2).map((c) => c.id)).toEqual(['c-2', 'c-1']);
    expect(s.dueCount).toBe(2);
    expect(s.queue.map((c) => c.id)).not.toContain('c-3');
  });

  it('sesja ma gorna granice - reszta czeka, zamiast robic sciane kart', () => {
    const states = new Map<string, CardState>(
      cards.map((c) => [c.id, { ...newCardState(c, NOW), dueAt: NOW - DAY }]),
    );
    const s = buildCardSession({
      cards,
      states,
      unlockedSkillIds: new Set(['s-1', 's-2']),
      introducedToday: 0,
      now: NOW,
    });
    expect(s.queue.length).toBe(SESSION_LIMIT);
    expect(s.newCount).toBe(0);
  });

  it('karty wprowadzone dzisiaj sa liczone do limitu', () => {
    const states = [
      { ...newCardState(card('a'), NOW - DAY), introducedAt: NOW - DAY },
      { ...newCardState(card('b'), NOW), introducedAt: NOW + 10 },
    ];
    expect(introducedSince(states, NOW)).toBe(1);
  });
});

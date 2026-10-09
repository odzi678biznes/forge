import { describe, expect, it } from 'vitest';
import { LEKCJE } from './lekcje';
import { knownWorkedSteps, migratePracticeCourse, PRACTICE_LEKCJE } from './practice-course';
import { nowaLekcja, nowyStan, type StanNauki } from './silnik';

describe('upgrade to meaningful practice without resetting evidence', () => {
  it('preserves every old result and review while positioning a paused lesson by card ID', () => {
    const old: StanNauki = {wersja:1,lekcje:{'num-order':{...nowaLekcja(),pozycja:8,
      wyniki:{'m1-potega':{proby:2,pierwsza:false,zaliczona:true},'m1-kwadrat':{proby:1,pierwsza:true,zaliczona:true}}}},powtorki:{}};
    const copy = structuredClone(old);
    const migrated = migratePracticeCourse(old);
    expect(old).toEqual(copy);
    expect(migrated.lekcje['num-order']?.pozycja).toBe(0);
    expect(migrated.lekcje['num-order']?.wyniki).toEqual(old.lekcje['num-order']?.wyniki);
    expect(knownWorkedSteps(migrated,'num-order')).toBe(4);
    expect(migrated.powtorki).toBe(old.powtorki);
    expect(migratePracticeCourse(migrated)).toBe(migrated);
  });
  it('does not reopen a completed lesson or invent a new completion', () => {
    const old: StanNauki = {wersja:1,lekcje:{'num-powers':{...nowaLekcja(),ukonczona:1234,pozycja:10,
      wyniki:{'m2-zadanie':{proby:1,pierwsza:true,zaliczona:true}}}},powtorki:{}};
    const migrated=migratePracticeCourse(old);
    expect(migrated.lekcje['num-powers']?.ukonczona).toBe(1234);
    expect(migrated.lekcje['num-powers']?.wyniki).toEqual(old.lekcje['num-powers']?.wyniki);
    expect(migrated.lekcje['num-powers']?.pozycja).toBe(1);
    expect(migratePracticeCourse(nowyStan())).toEqual(nowyStan());
  });
  it('never treats a skipped or incorrect old calculation as a known result', () => {
    const state = nowyStan(); state.lekcje['num-order']={...nowaLekcja(),wyniki:{'m1-kwadrat':{proby:0,pierwsza:null,pominieta:true}}};
    expect(knownWorkedSteps(state,'num-order')).toBe(0);
  });
  it('retains the original cards and question IDs in every practice profile', () => {
    for (const lesson of PRACTICE_LEKCJE) {
      const original=LEKCJE.find(l=>l.skillId===lesson.skillId)!;
      expect(lesson.karty).toBe(original.karty);
      expect(lesson.powtorka).toBe(original.powtorka);
      expect(lesson.seria.every(id=>original.karty.some(card=>card.id===id))).toBe(true);
    }
  });
});

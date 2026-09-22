import { describe, expect, it } from 'vitest';
import type { Attempt, CommonError } from '@/data/types';
import { REPAIR_STREAK_REQUIRED, buildErrorLab, openErrorCount } from './error-lab';
import { DAY, T0, makeAttempt, makeQuestion, makeSkill } from './testing';

const znak: CommonError = {
  id: 'err-znak',
  matches: ['-4'],
  cause: 'Zgubiony znak przy przenoszeniu wyrazu.',
  rule: 'Przenoszac wyraz przez rownosc, zmieniamy jego znak.',
};

const kolejnosc: CommonError = {
  id: 'err-kolejnosc',
  matches: ['7'],
  cause: 'Pomylona kolejnosc dzialan.',
  rule: 'Mnozenie wykonujemy przed dodawaniem.',
};

const skill = makeSkill({ id: 's-1', name: 'Wyroznik' });
const qA = makeQuestion({ id: 'q-a', skillId: 's-1', commonErrors: [znak] });
const qB = makeQuestion({ id: 'q-b', skillId: 's-1', commonErrors: [znak, kolejnosc] });

function lab(attempts: Attempt[]) {
  return buildErrorLab({ attempts, questions: [qA, qB], skills: [skill] });
}

const miss = (over: Partial<Attempt>) =>
  makeAttempt({ correctness: 'incorrect', skillId: 's-1', ...over });

const hit = (over: Partial<Attempt>) =>
  makeAttempt({ correctness: 'correct', skillId: 's-1', errorId: null, ...over });

describe('grupowanie bledow', () => {
  it('pusty dziennik przy braku bledow', () => {
    expect(lab([hit({ id: 'a-1' })])).toEqual([]);
  });

  it('pomija proby bez rozpoznanego bledu', () => {
    const groups = lab([miss({ id: 'a-1', errorId: null, userAnswer: '999' })]);
    expect(groups).toEqual([]);
  });

  it('ten sam blad w dwoch roznych zadaniach to JEDNA grupa', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      miss({ id: 'a-2', questionId: 'q-b', errorId: 'err-znak', answeredAt: T0 + DAY }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.occurrences).toBe(2);
  });

  it('rozne przyczyny zostaja osobnymi grupami', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-b', errorId: 'err-znak' }),
      miss({ id: 'a-2', questionId: 'q-b', errorId: 'err-kolejnosc' }),
    ]);
    expect(groups).toHaveLength(2);
  });

  it('niesie przyczyne i zlamana zasade z tresci', () => {
    const groups = lab([miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak' })]);
    expect(groups[0]?.error.cause).toBe(znak.cause);
    expect(groups[0]?.error.rule).toBe(znak.rule);
    expect(groups[0]?.skillName).toBe('Wyroznik');
  });

  it('przykladem jest OSTATNIE wystapienie wraz z odpowiedzia ucznia', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', userAnswer: '-4', answeredAt: T0 }),
      miss({ id: 'a-2', questionId: 'q-b', errorId: 'err-znak', userAnswer: '-9', answeredAt: T0 + DAY }),
    ]);
    expect(groups[0]?.exampleQuestion.id).toBe('q-b');
    expect(groups[0]?.exampleAnswer).toBe('-9');
    expect(groups[0]?.lastSeenAt).toBe(T0 + DAY);
  });

  it('blad wskazujacy na usunieta tresc nie wywraca dziennika', () => {
    const groups = lab([miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-nieistniejacy' })]);
    expect(groups).toEqual([]);
  });
});

describe('naprawa bledu', () => {
  it('trzy poprawne z rzedu po bledzie oznaczaja naprawe', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', answeredAt: T0 + 2 }),
      hit({ id: 'a-4', answeredAt: T0 + 3 }),
    ]);
    expect(groups[0]?.repairStreak).toBe(REPAIR_STREAK_REQUIRED);
    expect(groups[0]?.repaired).toBe(true);
  });

  it('dwie poprawne to za malo', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', answeredAt: T0 + 2 }),
    ]);
    expect(groups[0]?.repaired).toBe(false);
  });

  it('pomylka w srodku przerywa serie naprawy', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      miss({ id: 'a-3', questionId: 'q-a', errorId: null, answeredAt: T0 + 2 }),
      hit({ id: 'a-4', answeredAt: T0 + 3 }),
      hit({ id: 'a-5', answeredAt: T0 + 4 }),
    ]);
    expect(groups[0]?.repairStreak).toBe(1);
    expect(groups[0]?.repaired).toBe(false);
  });

  it('poprawne proby SPRZED bledu nie licza sie do naprawy', () => {
    const groups = lab([
      hit({ id: 'a-1', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', answeredAt: T0 + 2 }),
      miss({ id: 'a-4', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 + 3 }),
    ]);
    expect(groups[0]?.repairStreak).toBe(0);
  });

  it('poprawne proby z INNEJ kompetencji nie naprawiaja tego bledu', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', skillId: 's-inna', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', skillId: 's-inna', answeredAt: T0 + 2 }),
      hit({ id: 'a-4', skillId: 's-inna', answeredAt: T0 + 3 }),
    ]);
    expect(groups[0]?.repaired).toBe(false);
  });

  it('ponowne wystapienie bledu resetuje naprawe', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', answeredAt: T0 + 2 }),
      hit({ id: 'a-4', answeredAt: T0 + 3 }),
      miss({ id: 'a-5', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 + 4 }),
    ]);
    expect(groups[0]?.repaired).toBe(false);
    expect(groups[0]?.occurrences).toBe(2);
  });
});

describe('kolejnosc i licznik', () => {
  it('niezalatane bledy ida przed naprawionymi', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', answeredAt: T0 + 2 }),
      hit({ id: 'a-4', answeredAt: T0 + 3 }),
      miss({ id: 'a-5', questionId: 'q-b', errorId: 'err-kolejnosc', answeredAt: T0 + 4 }),
    ]);
    expect(groups[0]?.errorId).toBe('err-kolejnosc');
    expect(groups[0]?.repaired).toBe(false);
    expect(groups[1]?.repaired).toBe(true);
  });

  it('czestszy blad idzie wyzej', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-b', errorId: 'err-kolejnosc', answeredAt: T0 }),
      miss({ id: 'a-2', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 + 1 }),
      miss({ id: 'a-3', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 + 2 }),
    ]);
    expect(groups[0]?.errorId).toBe('err-znak');
  });

  it('licznik obejmuje wylacznie bledy czekajace na naprawe', () => {
    const groups = lab([
      miss({ id: 'a-1', questionId: 'q-a', errorId: 'err-znak', answeredAt: T0 }),
      hit({ id: 'a-2', answeredAt: T0 + 1 }),
      hit({ id: 'a-3', answeredAt: T0 + 2 }),
      hit({ id: 'a-4', answeredAt: T0 + 3 }),
      miss({ id: 'a-5', questionId: 'q-b', errorId: 'err-kolejnosc', answeredAt: T0 + 4 }),
    ]);
    expect(openErrorCount(groups)).toBe(1);
  });
});

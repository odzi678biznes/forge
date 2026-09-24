import { describe, expect, it } from 'vitest';
import type { Mission } from '@/data/types';
import {
  CSV_BOM,
  CSV_SEPARATOR,
  attemptsToCsv,
  exportFileName,
  listSessions,
  planDeletion,
  type DataSnapshot,
} from './data-control';
import { T0, makeAttempt, makeQuestion, makeSkill } from './testing';

const mission = (id: string): Mission => ({
  id,
  kind: 'training',
  title: 't',
  rationale: 'r',
  questionIds: [],
  startedAt: T0,
  finishedAt: T0 + 1,
});

// m-math: same proby matematyczne; m-cs: informatyczne; m-mix: mieszana.
const data: DataSnapshot = {
  attempts: [
    makeAttempt({ id: 'a1', missionId: 'm-math', skillId: 'math-1' }),
    makeAttempt({ id: 'a2', missionId: 'm-math', skillId: 'math-2' }),
    makeAttempt({ id: 'a3', missionId: 'm-cs', skillId: 'cs-1' }),
    makeAttempt({ id: 'a4', missionId: 'm-mix', skillId: 'math-1' }),
    makeAttempt({ id: 'a5', missionId: 'm-mix', skillId: 'cs-1' }),
  ],
  missions: [mission('m-math'), mission('m-cs'), mission('m-mix')],
  skillIdsWithState: ['math-1', 'math-2', 'cs-1'],
  planSkillIds: ['math-2'],
};

describe('plan usuwania - pojedyncza sesja', () => {
  it('usuwa misje i tylko jej proby', () => {
    const p = planDeletion({ kind: 'mission', missionId: 'm-math' }, data);
    expect(p.missionIds).toEqual(['m-math']);
    expect(p.attemptIds.sort()).toEqual(['a1', 'a2']);
  });

  it('nie rusza stanu kompetencji - jest wynikiem wielu sesji', () => {
    expect(planDeletion({ kind: 'mission', missionId: 'm-math' }, data).skillIds).toEqual([]);
  });

  it('nie usuwa planu - to decyzja uzytkownika, nie wynik jednej sesji', () => {
    expect(planDeletion({ kind: 'mission', missionId: 'm-math' }, data).dropPlan).toBe(false);
  });

  it('nieistniejaca sesja niczego nie usuwa', () => {
    const p = planDeletion({ kind: 'mission', missionId: 'nie-ma' }, data);
    expect(p.missionIds).toEqual([]);
    expect(p.attemptIds).toEqual([]);
  });
});

describe('sesje przerwane', () => {
  const withOrphan: DataSnapshot = {
    ...data,
    attempts: [
      ...data.attempts,
      makeAttempt({ id: 'a6', missionId: 'm-przerwana', skillId: 'math-1', startedAt: T0 + 50 }),
    ],
  };

  it('sa na liscie sesji, chociaz nie maja rekordu misji', () => {
    const entry = listSessions(withOrphan).find((s) => s.id === 'm-przerwana');
    expect(entry).toMatchObject({ kind: null, attempts: 1, startedAt: T0 + 50 });
  });

  it('da sie je usunac pojedynczo', () => {
    const p = planDeletion({ kind: 'mission', missionId: 'm-przerwana' }, withOrphan);
    expect(p.attemptIds).toEqual(['a6']);
    expect(p.missionIds).toEqual([]);
    expect(p.summary).not.toMatch(/nie istnieje/);
  });

  it('zapisane misje maja liczbe swoich prob', () => {
    expect(listSessions(withOrphan).find((s) => s.id === 'm-math')?.attempts).toBe(2);
  });
});

describe('plan usuwania - caly przedmiot', () => {
  const math = { kind: 'subject' as const, skillIds: ['math-1', 'math-2'], label: 'Matematyka' };

  it('usuwa wszystkie proby i stan kompetencji przedmiotu', () => {
    const p = planDeletion(math, data);
    expect(p.attemptIds.sort()).toEqual(['a1', 'a2', 'a4']);
    expect(p.skillIds.sort()).toEqual(['math-1', 'math-2']);
  });

  it('usuwa misje nalezaca wylacznie do przedmiotu', () => {
    expect(planDeletion(math, data).missionIds).toContain('m-math');
  });

  it('zostawia misje mieszana - inaczej skasowalby cudzy przedmiot', () => {
    const p = planDeletion(math, data);
    expect(p.missionIds).not.toContain('m-mix');
    expect(p.attemptIds).not.toContain('a5');
  });

  it('nie dotyka innego przedmiotu', () => {
    const p = planDeletion(math, data);
    expect(p.missionIds).not.toContain('m-cs');
    expect(p.skillIds).not.toContain('cs-1');
  });

  it('plan zbudowany z wynikow przedmiotu znika razem z nimi', () => {
    expect(planDeletion(math, data).dropPlan).toBe(true);
  });

  it('plan innego przedmiotu zostaje', () => {
    const cs = { kind: 'subject' as const, skillIds: ['cs-1'], label: 'Informatyka' };
    expect(planDeletion(cs, data).dropPlan).toBe(false);
  });

  it('opis skutku podaje liczby przed potwierdzeniem', () => {
    expect(planDeletion(math, data).summary).toMatch(/3 próby/);
  });
});

describe('plan usuwania - wszystko', () => {
  it('obejmuje kazda misje, probe i stan', () => {
    const p = planDeletion({ kind: 'all' }, data);
    expect(p.attemptIds).toHaveLength(5);
    expect(p.missionIds).toHaveLength(3);
    expect(p.skillIds).toHaveLength(3);
  });
});

describe('eksport CSV', () => {
  const skills = [makeSkill({ id: 'math-1', name: 'Wyróżnik' })];
  const questions = [makeQuestion({ id: 'q-1', skillId: 'math-1' })];

  it('zaczyna sie od BOM i naglowka z srednikiem', () => {
    const csv = attemptsToCsv([], skills, questions);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.slice(1).split('\r\n')[0]).toContain(`data${CSV_SEPARATOR}`);
  });

  it('jeden wiersz na probe, z nazwa kompetencji zamiast id', () => {
    const csv = attemptsToCsv(
      [makeAttempt({ skillId: 'math-1', questionId: 'q-1', userAnswer: '16' })],
      skills,
      questions,
    );
    const lines = csv.slice(1).split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Wyróżnik');
  });

  it('srednik i cudzyslow w odpowiedzi nie rozbijaja kolumn', () => {
    const csv = attemptsToCsv(
      [makeAttempt({ skillId: 'math-1', questionId: 'q-1', userAnswer: 'a;b "c"' })],
      skills,
      questions,
    );
    expect(csv).toContain('"a;b ""c"""');
  });

  it('formula w odpowiedzi jest zneutralizowana - arkusz jej nie wykona', () => {
    const csv = attemptsToCsv(
      [makeAttempt({ skillId: 'math-1', questionId: 'q-1', userAnswer: '=HYPERLINK("x")' })],
      skills,
      questions,
    );
    expect(csv).toContain(`'=HYPERLINK`);
  });

  it('liczba ujemna zostaje liczba, a nie jest traktowana jak formula', () => {
    const csv = attemptsToCsv(
      [makeAttempt({ skillId: 'math-1', questionId: 'q-1', userAnswer: '-4' })],
      skills,
      questions,
    );
    expect(csv).toContain(`${CSV_SEPARATOR}-4${CSV_SEPARATOR}`);
  });

  it('proba pytania usunietego z tresci jest oznaczona, a nie gubiona', () => {
    const csv = attemptsToCsv(
      [makeAttempt({ skillId: 'math-1', questionId: 'q-stare' })],
      skills,
      questions,
    );
    expect(csv).toContain('q-stare (usuniete z tresci)');
  });
});

describe('nazwa pliku eksportu', () => {
  it('nie zawiera znakow, ktore odrzuca Windows', () => {
    const name = exportFileName('json', T0);
    expect(name).not.toMatch(/[:<>"/\\|?*]/);
    expect(name.endsWith('.json')).toBe(true);
  });
});

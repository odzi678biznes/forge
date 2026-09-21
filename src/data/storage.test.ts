import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { MasteryLevel, emptySkillState, type Attempt, type Mission } from './types';
import { IndexedDbStorage } from './indexeddb-storage';
import { SnapshotValidationError, validateSnapshot } from './storage-port';

/**
 * Scenariusze obowiazkowe z Blueprint sek. 16:
 * - pierwsze uruchomienie bez danych,
 * - restart i odzyskanie danych,
 * - uszkodzona kopia.
 */

let dbCounter = 0;
/** Kazdy test dostaje wlasna baze - inaczej testy widzialyby swoje dane. */
function freshName(): string {
  dbCounter += 1;
  return `forge-test-${dbCounter}`;
}

const attempt: Attempt = {
  id: 'a-1',
  questionId: 'q-1',
  skillId: 's-1',
  missionId: 'm-1',
  startedAt: 1,
  answeredAt: 2,
  userAnswer: '4',
  correctness: 'correct',
  confidence: 'sure',
  hintLevel: 0,
  errorId: null,
  gradingVersion: 'v1',
  gradedBy: 'auto',
};

const mission: Mission = {
  id: 'm-1',
  kind: 'training',
  title: 'Trening',
  rationale: 'Test',
  questionIds: ['q-1'],
  startedAt: 1,
  finishedAt: 2,
};

describe('pierwsze uruchomienie', () => {
  it('czysta baza zwraca puste listy zamiast bledu', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    expect(await store.loadSkillStates()).toEqual([]);
    expect(await store.loadAttempts()).toEqual([]);
    expect(await store.loadMissions()).toEqual([]);
  });

  it('init jest idempotentny', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.init();
    expect(await store.loadAttempts()).toEqual([]);
  });

  it('odczyt bez init konczy sie jawnym bledem, nie cicha pustka', async () => {
    const store = new IndexedDbStorage(freshName());
    await expect(store.loadAttempts()).rejects.toThrow(/init/);
  });
});

describe('restart aplikacji', () => {
  it('dane przezywaja zamkniecie i ponowne otwarcie bazy', async () => {
    const name = freshName();

    const first = new IndexedDbStorage(name);
    await first.init();
    await first.saveSkillState({
      ...emptySkillState('s-1'),
      level: MasteryLevel.Independent,
      independentStreak: 2,
      reviewDueAt: 12345,
    });
    await first.appendAttempt(attempt);
    await first.saveMission(mission);
    first.close();

    // Restart: nowa instancja, ta sama baza na dysku.
    const second = new IndexedDbStorage(name);
    await second.init();

    const states = await second.loadSkillStates();
    expect(states).toHaveLength(1);
    expect(states[0]?.level).toBe(MasteryLevel.Independent);
    expect(states[0]?.independentStreak).toBe(2);
    expect(states[0]?.reviewDueAt).toBe(12345);
    expect(await second.loadAttempts()).toEqual([attempt]);
    expect(await second.loadMissions()).toEqual([mission]);
  });

  it('zapis tej samej kompetencji nadpisuje, nie duplikuje', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveSkillState({ ...emptySkillState('s-1'), level: MasteryLevel.Recognised });
    await store.saveSkillState({ ...emptySkillState('s-1'), level: MasteryLevel.Transfer });

    const states = await store.loadSkillStates();
    expect(states).toHaveLength(1);
    expect(states[0]?.level).toBe(MasteryLevel.Transfer);
  });
});

describe('eksport i import', () => {
  it('pelny obieg eksport -> czyszczenie -> import odtwarza stan', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveSkillState({ ...emptySkillState('s-1'), level: MasteryLevel.Transfer });
    await store.appendAttempt(attempt);
    await store.saveMission(mission);

    const snapshot = await store.exportAll();
    // Kopia musi przezyc serializacje do pliku JSON.
    const roundTripped: unknown = JSON.parse(JSON.stringify(snapshot));

    await store.clear();
    expect(await store.loadSkillStates()).toEqual([]);

    await store.importAll(roundTripped);
    const states = await store.loadSkillStates();
    expect(states[0]?.level).toBe(MasteryLevel.Transfer);
    expect(await store.loadAttempts()).toEqual([attempt]);
    expect(await store.loadMissions()).toEqual([mission]);
  });

  it('uszkodzona kopia nie kasuje dzialajacego profilu', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveSkillState({ ...emptySkillState('s-1'), level: MasteryLevel.Transfer });

    await expect(store.importAll({ version: 99 })).rejects.toThrow(
      SnapshotValidationError,
    );

    const states = await store.loadSkillStates();
    expect(states).toHaveLength(1);
    expect(states[0]?.level).toBe(MasteryLevel.Transfer);
  });
});

describe('walidacja kopii', () => {
  const valid = {
    version: 1,
    exportedAt: 0,
    skillStates: [],
    attempts: [],
    missions: [],
  };

  it('przyjmuje poprawna kopie', () => {
    expect(() => validateSnapshot(valid)).not.toThrow();
  });

  it('odrzuca inna wersje schematu', () => {
    expect(() => validateSnapshot({ ...valid, version: 2 })).toThrow(/wersja/i);
  });

  it('odrzuca brakujaca liste', () => {
    expect(() => validateSnapshot({ ...valid, attempts: undefined })).toThrow(/lista/i);
  });

  it('odrzuca poziom poza zakresem 0-5', () => {
    expect(() =>
      validateSnapshot({
        ...valid,
        skillStates: [{ ...emptySkillState('s-1'), level: 9 }],
      }),
    ).toThrow(/poza zakresem/i);
  });

  it('odrzuca stan bez identyfikatora kompetencji', () => {
    expect(() =>
      validateSnapshot({ ...valid, skillStates: [{ ...emptySkillState(''), level: 1 }] }),
    ).toThrow(/identyfikatora/i);
  });

  it('odrzuca dane, ktore nie sa obiektem', () => {
    expect(() => validateSnapshot('nie-json')).toThrow(SnapshotValidationError);
    expect(() => validateSnapshot(null)).toThrow(SnapshotValidationError);
  });
});

import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { MasteryLevel, emptySkillState, type Attempt, type Mission } from './types';
import { IndexedDbStorage } from './indexeddb-storage';
import { MAX_BACKUPS, SnapshotValidationError, validateSnapshot } from './storage-port';

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

describe('plan nauki i preferencje', () => {
  const plan = {
    id: 'p-1',
    variant: 'realistic' as const,
    createdAt: 100,
    deadline: 200,
    targets: [{ skillId: 's-1', targetLevel: MasteryLevel.Transfer }],
    diagnosisSnapshot: [{ skillId: 's-1', level: MasteryLevel.Recognised }],
  };

  it('brak planu przy pierwszym uruchomieniu to null, nie blad', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    expect(await store.loadPlan()).toBeNull();
    expect(await store.loadPreferences()).toEqual([]);
  });

  it('plan przezywa restart aplikacji', async () => {
    const name = freshName();
    const first = new IndexedDbStorage(name);
    await first.init();
    await first.savePlan(plan);
    await first.setPreference('dayMode', 'standard');
    first.close();

    const second = new IndexedDbStorage(name);
    await second.init();
    expect(await second.loadPlan()).toEqual(plan);
    expect(await second.loadPreferences()).toEqual([{ key: 'dayMode', value: 'standard' }]);
  });

  it('nowy plan zastepuje poprzedni, nie dokleja sie obok', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.savePlan(plan);
    await store.savePlan({ ...plan, id: 'p-2', variant: 'minimum' });
    expect((await store.loadPlan())?.variant).toBe('minimum');
  });

  it('ta sama preferencja jest nadpisywana, nie duplikowana', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.setPreference('dayMode', 'minimum');
    await store.setPreference('dayMode', 'strong');
    const prefs = await store.loadPreferences();
    expect(prefs).toHaveLength(1);
    expect(prefs[0]?.value).toBe('strong');
  });

  it('eksport obejmuje plan i preferencje, import je odtwarza', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.savePlan(plan);
    await store.setPreference('dayMode', 'strong');

    const snapshot: unknown = JSON.parse(JSON.stringify(await store.exportAll()));
    await store.clear();
    expect(await store.loadPlan()).toBeNull();

    await store.importAll(snapshot);
    expect(await store.loadPlan()).toEqual(plan);
    expect(await store.loadPreferences()).toEqual([{ key: 'dayMode', value: 'strong' }]);
  });

  it('starsza kopia bez planu i preferencji nadal sie importuje', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    // Kopia sprzed dodania tych pol - odrzucenie jej byloby utrata danych.
    await store.importAll({
      version: 1,
      exportedAt: 0,
      skillStates: [],
      attempts: [],
      missions: [],
    });
    expect(await store.loadPlan()).toBeNull();
    expect(await store.loadPreferences()).toEqual([]);
  });
});

describe('usuwanie wybranych danych (sek. 12)', () => {
  const second: Attempt = { ...attempt, id: 'a-2', missionId: 'm-2', skillId: 's-2' };
  const otherMission: Mission = { ...mission, id: 'm-2' };

  async function seeded() {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveSkillState({ ...emptySkillState('s-1'), level: MasteryLevel.Transfer });
    await store.saveSkillState({ ...emptySkillState('s-2'), level: MasteryLevel.Independent });
    await store.appendAttempt(attempt);
    await store.appendAttempt(second);
    await store.saveMission(mission);
    await store.saveMission(otherMission);
    return store;
  }

  it('usuwa dokladnie wskazane rekordy i nic wiecej', async () => {
    const store = await seeded();
    await store.deleteRecords({
      attemptIds: ['a-1'],
      missionIds: ['m-1'],
      skillIds: ['s-1'],
      dropPlan: false,
    });

    expect(await store.loadAttempts()).toEqual([second]);
    expect(await store.loadMissions()).toEqual([otherMission]);
    expect((await store.loadSkillStates()).map((s) => s.skillId)).toEqual(['s-2']);
  });

  it('plan znika tylko na wyrazne zadanie', async () => {
    const store = await seeded();
    const plan = {
      id: 'p-1',
      variant: 'realistic' as const,
      createdAt: 1,
      deadline: null,
      targets: [],
      diagnosisSnapshot: [],
    };
    await store.savePlan(plan);

    await store.deleteRecords({ attemptIds: [], missionIds: [], skillIds: [], dropPlan: false });
    expect(await store.loadPlan()).toEqual(plan);

    await store.deleteRecords({ attemptIds: [], missionIds: [], skillIds: [], dropPlan: true });
    expect(await store.loadPlan()).toBeNull();
  });
});

describe('kopie bezpieczenstwa (sek. 12)', () => {
  it('kopia odtwarza stan sprzed zmiany', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.appendAttempt(attempt);
    await store.saveMission(mission);

    const info = await store.saveBackup('przed importem');
    expect(info).toMatchObject({ reason: 'przed importem', attempts: 1, missions: 1 });

    await store.clear();
    expect(await store.loadAttempts()).toEqual([]);

    const snapshot = await store.loadBackup(info.id);
    await store.importAll(snapshot);
    expect(await store.loadAttempts()).toEqual([attempt]);
  });

  it('czyszczenie danych nie kasuje kopii - import czysci, a kopia ma przetrwac', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveBackup('przed importem');
    await store.clear();
    expect(await store.listBackups()).toHaveLength(1);
  });

  it('trzyma tylko ostatnie kopie, od najnowszej', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    for (let i = 0; i < MAX_BACKUPS + 2; i += 1) {
      await store.saveBackup(`kopia ${i}`);
      await new Promise((r) => setTimeout(r, 2));
    }
    const list = await store.listBackups();
    expect(list).toHaveLength(MAX_BACKUPS);
    expect(list[0]?.reason).toBe(`kopia ${MAX_BACKUPS + 1}`);
  });

  it('usuniecie kopii jest osobna, jawna operacja', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveBackup('x');
    await store.deleteBackups();
    expect(await store.listBackups()).toEqual([]);
  });

  it('nieistniejaca kopia to null', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    expect(await store.loadBackup('b-nie-ma')).toBeNull();
  });

  it('baza z wersji 2 dostaje magazyn kopii bez utraty danych', async () => {
    const name = freshName();
    // Stara baza: wersja 2, bez magazynu kopii.
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(name, 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('skillStates', { keyPath: 'skillId' });
        db.createObjectStore('attempts', { keyPath: 'id' }).put(attempt);
        db.createObjectStore('missions', { keyPath: 'id' });
        db.createObjectStore('plan');
        db.createObjectStore('preferences', { keyPath: 'key' });
      };
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });

    const store = new IndexedDbStorage(name);
    await store.init();
    expect(await store.loadAttempts()).toEqual([attempt]);
    await store.saveBackup('po migracji');
    expect(await store.listBackups()).toHaveLength(1);
  });
});

describe('walidacja kopii - rekordy niepelne', () => {
  const base = { version: 1, exportedAt: 0, skillStates: [], attempts: [], missions: [] };

  it('proba bez kompetencji jest odrzucona przed czyszczeniem bazy', () => {
    const { skillId: _drop, ...partial } = attempt;
    expect(() => validateSnapshot({ ...base, attempts: [partial] })).toThrow(/Niepelna proba/);
  });

  it('misja bez daty jest odrzucona', () => {
    expect(() => validateSnapshot({ ...base, missions: [{ id: 'm-1' }] })).toThrow(
      SnapshotValidationError,
    );
  });
});

describe('kurs: lekcje i fiszki', () => {
  const card = (cardId: string, skillId: string) => ({
    cardId,
    skillId,
    box: 1,
    dueAt: 500,
    introducedAt: 50,
    lastReviewedAt: 100,
    reviews: 2,
    lapses: 0,
  });

  it('ukonczenie lekcji i stan fiszek przezywaja restart', async () => {
    const name = freshName();
    const first = new IndexedDbStorage(name);
    await first.init();
    await first.saveLessonProgress({ skillId: 's-1', completedAt: 10 });
    await first.saveCardState(card('c-1', 's-1'));
    first.close();

    const second = new IndexedDbStorage(name);
    await second.init();
    expect(await second.loadLessonProgress()).toEqual([{ skillId: 's-1', completedAt: 10 }]);
    expect(await second.loadCardStates()).toEqual([card('c-1', 's-1')]);
  });

  it('pierwsze ukonczenie lekcji zostaje - powrot do lekcji go nie przesuwa', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveLessonProgress({ skillId: 's-1', completedAt: 10 });
    await store.saveLessonProgress({ skillId: 's-1', completedAt: 99 });
    expect(await store.loadLessonProgress()).toEqual([{ skillId: 's-1', completedAt: 10 }]);
  });

  it('usuniecie umiejetnosci zabiera jej lekcje i fiszki, a cudze zostawia', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveLessonProgress({ skillId: 's-1', completedAt: 10 });
    await store.saveLessonProgress({ skillId: 's-2', completedAt: 11 });
    await store.saveCardState(card('c-1', 's-1'));
    await store.saveCardState(card('c-2', 's-2'));

    await store.deleteRecords({ attemptIds: [], missionIds: [], skillIds: ['s-1'], dropPlan: false });

    expect((await store.loadLessonProgress()).map((l) => l.skillId)).toEqual(['s-2']);
    expect((await store.loadCardStates()).map((c) => c.cardId)).toEqual(['c-2']);
  });

  it('eksport i import obejmuja postep kursu', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveLessonProgress({ skillId: 's-1', completedAt: 10 });
    await store.saveCardState(card('c-1', 's-1'));

    const copy: unknown = JSON.parse(JSON.stringify(await store.exportAll()));
    await store.clear();
    expect(await store.loadCardStates()).toEqual([]);

    await store.importAll(copy);
    expect(await store.loadLessonProgress()).toHaveLength(1);
    expect(await store.loadCardStates()).toEqual([card('c-1', 's-1')]);
  });

  it('kopia sprzed kursu (bez tych pol) nadal sie wczytuje', () => {
    const old = { version: 1, exportedAt: 0, skillStates: [], attempts: [], missions: [] };
    const v = validateSnapshot(old);
    expect(v.lessonProgress).toEqual([]);
    expect(v.cardStates).toEqual([]);
  });

  it('niepelny stan fiszki w kopii jest odrzucony', () => {
    const bad = {
      version: 1,
      exportedAt: 0,
      skillStates: [],
      attempts: [],
      missions: [],
      cardStates: [{ cardId: 'c-1' }],
    };
    expect(() => validateSnapshot(bad)).toThrow(SnapshotValidationError);
  });
});

describe('wyniki arkuszy CKE', () => {
  const result = (id: string, subjectId = 'math') => ({
    id,
    examId: 'mat-2505-pr',
    subjectId,
    takenAt: 1_700_000_000_000,
    scores: { '1': 2, '12.2': 3 },
    minutes: 175,
  });

  it('wynik przezywa restart, a poprawka nadpisuje ten sam zapis', async () => {
    const name = freshName();
    const first = new IndexedDbStorage(name);
    await first.init();
    await first.saveExamResult(result('e-1'));
    await first.saveExamResult({ ...result('e-1'), scores: { '1': 1 } });
    first.close();

    const second = new IndexedDbStorage(name);
    await second.init();
    expect(await second.loadExamResults()).toEqual([{ ...result('e-1'), scores: { '1': 1 } }]);
  });

  it('eksport i import obejmuja wyniki arkuszy', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveExamResult(result('e-1'));
    const copy: unknown = JSON.parse(JSON.stringify(await store.exportAll()));
    await store.clear();
    expect(await store.loadExamResults()).toEqual([]);
    await store.importAll(copy);
    expect(await store.loadExamResults()).toEqual([result('e-1')]);
  });

  it('usuniecie wskazanego wyniku zostawia pozostale', async () => {
    const store = new IndexedDbStorage(freshName());
    await store.init();
    await store.saveExamResult(result('e-1'));
    await store.saveExamResult(result('e-2'));
    await store.deleteRecords({ attemptIds: [], missionIds: [], skillIds: [], dropPlan: false, examResultIds: ['e-1'] });
    expect((await store.loadExamResults()).map((e) => e.id)).toEqual(['e-2']);
  });

  it('kopia z uszkodzonym wynikiem arkusza jest odrzucana', () => {
    const base = { version: 1, exportedAt: 1, skillStates: [], attempts: [], missions: [] };
    expect(() => validateSnapshot({ ...base, examResults: [{ ...result('e-1'), scores: { '1': -2 } }] })).toThrow(
      SnapshotValidationError,
    );
    expect(() => validateSnapshot({ ...base, examResults: [{ id: 'e-1' }] })).toThrow(SnapshotValidationError);
    expect(validateSnapshot({ ...base, examResults: [result('e-1')] }).examResults).toHaveLength(1);
  });
});

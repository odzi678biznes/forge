import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { IndexedDbStorage } from '@/data/indexeddb-storage';
import { SnapshotValidationError } from '@/data/storage-port';
import { MasteryLevel, emptySkillState, type Attempt, type Mission } from '@/data/types';
import { beginTeacherRequest, changeTeacherConversation, finishTeacherRequest, isTeacherRequestCurrent, readTeacherConversation } from '@/nauka/teacher-conversation';
import { planDeletion } from '@/learning-engine/data-control';
import {
  deleteEverything,
  deleteSelection,
  importSnapshot,
  parseImportFile,
  previewSync,
  restoreBackup,
  syncFromSnapshot,
  toDataSnapshot,
} from './operations';

let counter = 0;

const attempt = (id: string, missionId: string, skillId: string): Attempt => ({
  id,
  questionId: 'q-1',
  skillId,
  missionId,
  startedAt: 1,
  answeredAt: 2,
  userAnswer: '4',
  correctness: 'correct',
  confidence: 'sure',
  hintLevel: 0,
  errorId: null,
  gradingVersion: 'v1',
  gradedBy: 'auto',
});

const mission = (id: string): Mission => ({
  id,
  kind: 'training',
  title: 'Trening',
  rationale: 'r',
  questionIds: [],
  startedAt: 1,
  finishedAt: 2,
});

async function seeded() {
  counter += 1;
  const port = new IndexedDbStorage(`forge-ops-${counter}`);
  await port.init();
  await port.saveSkillState({ ...emptySkillState('math-1'), level: MasteryLevel.Transfer });
  await port.appendAttempt(attempt('a-1', 'm-1', 'math-1'));
  await port.appendAttempt(attempt('a-2', 'm-2', 'cs-1'));
  await port.saveMission(mission('m-1'));
  await port.saveMission(mission('m-2'));
  return port;
}

describe('import', () => {
  it('uszkodzony plik jest odrzucony, zanim powstanie kopia albo zmiana', async () => {
    const port = await seeded();
    expect(() => parseImportFile('{nie json')).toThrow(SnapshotValidationError);
    expect(() => parseImportFile('{"version": 7}')).toThrow(SnapshotValidationError);
    expect(await port.listBackups()).toEqual([]);
    expect(await port.loadAttempts()).toHaveLength(2);
  });

  it('przed zastapieniem danych zapisuje kopie, z ktorej da sie wrocic', async () => {
    const port = await seeded();
    const empty = parseImportFile(
      JSON.stringify({ version: 1, exportedAt: 0, skillStates: [], attempts: [], missions: [] }),
    );

    const backup = await importSnapshot(port, empty);
    expect(await port.loadAttempts()).toEqual([]);
    expect(backup.attempts).toBe(2);

    await restoreBackup(port, backup.id);
    expect(await port.loadAttempts()).toHaveLength(2);
  });

  it('przywrocenie kopii tez zostawia kopie stanu sprzed przywrocenia', async () => {
    const port = await seeded();
    const first = await port.saveBackup('reczna');
    await port.appendAttempt(attempt('a-3', 'm-2', 'cs-1'));

    await restoreBackup(port, first.id);
    const [latest] = await port.listBackups();
    expect(latest?.reason).toBe('przed przywróceniem kopii');
    expect(latest?.attempts).toBe(3);
  });
});

describe('usuwanie', () => {
  it('usuniecie przedmiotu zostawia drugi przedmiot', async () => {
    const port = await seeded();
    const plan = planDeletion(
      { kind: 'subject', skillIds: ['math-1'], label: 'Matematyka' },
      toDataSnapshot(await port.exportAll()),
    );

    await deleteSelection(port, plan, false, 'przed usunięciem przedmiotu');
    expect((await port.loadAttempts()).map((a) => a.id)).toEqual(['a-2']);
    expect((await port.loadMissions()).map((m) => m.id)).toEqual(['m-2']);
    expect(await port.loadSkillStates()).toEqual([]);
    expect(await port.listBackups()).toEqual([]);
  });

  it('z kopia usuniecie sesji da sie cofnac', async () => {
    const port = await seeded();
    const plan = planDeletion(
      { kind: 'mission', missionId: 'm-1' },
      toDataSnapshot(await port.exportAll()),
    );

    await deleteSelection(port, plan, true, 'przed usunięciem sesji');
    expect(await port.loadAttempts()).toHaveLength(1);

    const [backup] = await port.listBackups();
    await restoreBackup(port, backup!.id);
    expect(await port.loadAttempts()).toHaveLength(2);
  });

  it('usuniecie wszystkiego obejmuje tez kopie bezpieczenstwa', async () => {
    const port = await seeded();
    await port.saveBackup('stara kopia');

    await deleteEverything(port);
    const after = await port.exportAll();
    expect(after.attempts).toEqual([]);
    expect(after.missions).toEqual([]);
    expect(after.skillStates).toEqual([]);
    expect(await port.listBackups()).toEqual([]);
  });
});

describe('synchronizacja dwoch urzadzen', () => {
  it('laczy dane z pliku zamiast je zastepowac i najpierw robi kopie', async () => {
    const komputer = await seeded();
    counter += 1;
    const telefon = new IndexedDbStorage(`forge-ops-${counter}`);
    await telefon.init();
    await telefon.appendAttempt(attempt('a-tel', 'm-tel', 'math-1'));
    await telefon.saveMission(mission('m-tel'));

    const plik = parseImportFile(JSON.stringify(await telefon.exportAll()));
    const podglad = await previewSync(komputer, plik);
    expect(podglad).toMatchObject({ attemptsAdded: 1, missionsAdded: 1 });
    // Podglad niczego nie zapisuje.
    expect(await komputer.loadAttempts()).toHaveLength(2);

    await syncFromSnapshot(komputer, plik);
    expect((await komputer.loadAttempts()).map((a) => a.id).sort()).toEqual(['a-1', 'a-2', 'a-tel']);
    expect((await komputer.listBackups())[0]?.reason).toBe('przed synchronizacją');

    // W druga strone: telefon dostaje wszystko z komputera.
    await syncFromSnapshot(telefon, parseImportFile(JSON.stringify(await komputer.exportAll())));
    expect(await telefon.loadAttempts()).toHaveLength(3);
  });
});


describe('notatki i lokalne kopie stanu', () => {
  it('import usuwa nowszy cień brudnopisu, żeby nie nadpisał importowanej kopii', async () => {
    const values = new Map([['forge.workspace.v1:m-1:q-1', 'stale'], ['forge.lesson-draft.v1:card:feed:math', 'stale'], ['forge.lesson-reading.v1:math-1:scroll', '100'], ['unrelated', 'keep']]);
    vi.stubGlobal('localStorage', {
      get length() { return values.size; }, key: (i: number) => [...values.keys()][i] ?? null,
      getItem: (key: string) => values.get(key) ?? null, removeItem: (key: string) => values.delete(key),
    });
    try {
      const conversation = 'forge.teacher.chat:m-import:q-1';
      changeTeacherConversation(conversation, () => [{ rola: 'uczen', tekst: 'Stare pytanie tylko w pamięci' }]);
      beginTeacherRequest(conversation, 'before-import');
      const port = await seeded();
      const snapshot = await port.exportAll();
      await importSnapshot(port, snapshot);
      expect([...values]).toEqual([['unrelated', 'keep']]);
      expect(await port.loadAttempts()).toHaveLength(2);
      expect(readTeacherConversation(conversation)).toEqual([]);
      expect(isTeacherRequestCurrent(conversation, 'before-import')).toBe(false);
    } finally { vi.unstubAllGlobals(); }
  });

  it('usunięcie jednej sesji czyści tylko jej brudnopis', async () => {
    const port = await seeded();
    const removedChat = 'forge.teacher.chat:m-1:q-1';
    const keptChat = 'forge.teacher.chat:m-2:q-1';
    changeTeacherConversation(removedChat, () => [{ rola: 'uczen', tekst: 'Usuń pytanie' }]);
    changeTeacherConversation(keptChat, () => [{ rola: 'uczen', tekst: 'Zachowaj pytanie' }]);
    beginTeacherRequest(removedChat, 'removed'); beginTeacherRequest(keptChat, 'kept');
    await port.setPreference('forge.workspace.v1:m-1:q-1', JSON.stringify({ skillId: 'math-1' }));
    await port.setPreference('forge.workspace.v1:m-2:q-1', JSON.stringify({ skillId: 'cs-1' }));
    const plan = planDeletion({ kind: 'mission', missionId: 'm-1' }, toDataSnapshot(await port.exportAll()));
    await deleteSelection(port, plan, false, 'test');
    const preferences = await port.loadPreferences();
    expect(preferences.find(p => p.key === 'forge.workspace.v1:m-1:q-1')?.value).toBe('null');
    expect(preferences.find(p => p.key === 'forge.workspace.v1:m-2:q-1')?.value).toContain('cs-1');
    expect(await port.loadAttempts()).toHaveLength(1);
    expect(readTeacherConversation(removedChat)).toEqual([]);
    expect(isTeacherRequestCurrent(removedChat, 'removed')).toBe(false);
    expect(readTeacherConversation(keptChat)[0]?.tekst).toBe('Zachowaj pytanie');
    expect(isTeacherRequestCurrent(keptChat, 'kept')).toBe(true);
    finishTeacherRequest(keptChat, 'kept');
  });
});

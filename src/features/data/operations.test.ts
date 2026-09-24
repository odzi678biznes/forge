import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { IndexedDbStorage } from '@/data/indexeddb-storage';
import { SnapshotValidationError } from '@/data/storage-port';
import { MasteryLevel, emptySkillState, type Attempt, type Mission } from '@/data/types';
import { planDeletion } from '@/learning-engine/data-control';
import {
  deleteEverything,
  deleteSelection,
  importSnapshot,
  parseImportFile,
  restoreBackup,
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

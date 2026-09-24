import {
  SnapshotValidationError,
  validateSnapshot,
  type BackupInfo,
  type SnapshotV1,
  type StoragePort,
} from '@/data/storage-port';
import type { DataSnapshot, DeletionPlan } from '@/learning-engine/data-control';

/**
 * Operacje zmieniajace dane uzytkownika - Blueprint sek. 12.
 *
 * Kazda z nich trzyma sie jednej kolejnosci: najpierw walidacja, potem kopia
 * bezpieczenstwa, dopiero potem zmiana. Uszkodzony plik konczy sie bledem,
 * zanim cokolwiek zostanie zapisane - takze kopia.
 */

/** Wiekszy plik to prawie na pewno nie kopia FORGE; nie wczytujemy go do pamieci. */
export const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

export function parseImportFile(text: string): SnapshotV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SnapshotValidationError('Plik nie jest poprawnym JSON-em.');
  }
  return validateSnapshot(parsed);
}

export async function importSnapshot(port: StoragePort, snapshot: SnapshotV1): Promise<BackupInfo> {
  const backup = await port.saveBackup('przed importem');
  await port.importAll(snapshot);
  return backup;
}

/** Przywrocenie tez jest zmiana - bez kopii nie daloby sie go cofnac. */
export async function restoreBackup(port: StoragePort, id: string): Promise<BackupInfo> {
  const snapshot = await port.loadBackup(id);
  if (!snapshot) throw new SnapshotValidationError('Ta kopia juz nie istnieje.');
  const backup = await port.saveBackup('przed przywróceniem kopii');
  await port.importAll(snapshot);
  return backup;
}

/**
 * Usuniecie sesji albo przedmiotu.
 *
 * Kopia pozwala cofnac pomylke, ale zawiera usuwane dane - dlatego jest
 * wyborem uzytkownika, a nie przymusem. Ekran mowi to wprost.
 */
export async function deleteSelection(
  port: StoragePort,
  plan: DeletionPlan,
  keepBackup: boolean,
  reason: string,
): Promise<void> {
  if (keepBackup) await port.saveBackup(reason);
  await port.deleteRecords(plan);
  await port.compact();
}

/** "Wszystkie dane" obejmuja tez kopie - inaczej usuniecie byloby pozorne. */
export async function deleteEverything(port: StoragePort): Promise<void> {
  await port.clear();
  await port.deleteBackups();
  await port.compact();
}

export async function deleteBackups(port: StoragePort): Promise<void> {
  await port.deleteBackups();
  await port.compact();
}

/** Wejscie dla `planDeletion` z pelnego eksportu. */
export function toDataSnapshot(snapshot: SnapshotV1): DataSnapshot {
  return {
    attempts: snapshot.attempts,
    missions: snapshot.missions,
    skillIdsWithState: snapshot.skillStates.map((s) => s.skillId),
    planSkillIds: snapshot.plan?.targets.map((t) => t.skillId) ?? [],
  };
}

/** Zapis tekstu do pliku w folderze Pobrane - dziala tez w powloce Tauri. */
export function downloadText(fileName: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Zwolnienie od razu po kliknieciu potrafi przerwac pobieranie.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

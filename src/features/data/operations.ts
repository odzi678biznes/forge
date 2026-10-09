import { flushLessonDraftWrites, LESSON_DRAFT_PREFIX } from '@/nauka/lesson-draft';
import { flushWorkspaceWrites } from '@/features/workspace/workspace-draft';
import { clearTeacherConversations } from '@/nauka/teacher-conversation';
import { MISSION_SESSION_KEY, readMissionSession } from '@/app/mission-session';
import {
  SnapshotValidationError,
  validateSnapshot,
  type BackupInfo,
  type SnapshotV1,
  type StoragePort,
} from '@/data/storage-port';
import { planSubject } from '@/data/types';
import type { DataSnapshot, DeletionPlan } from '@/learning-engine/data-control';
import { mergeSnapshots, type MergeReport } from '@/learning-engine/sync-merge';

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
  await Promise.all([flushWorkspaceWrites(), flushLessonDraftWrites()]);
  const backup = await port.saveBackup('przed importem');
  await port.importAll(snapshot);
  clearLearningShadows();
  return backup;
}

/** Co da połączenie z plikiem z drugiego urządzenia — bez zapisywania czegokolwiek. */
export async function previewSync(port: StoragePort, incoming: SnapshotV1): Promise<MergeReport> {
  return mergeSnapshots(await port.exportAll(), incoming, Date.now()).report;
}

/**
 * Synchronizacja z plikiem z drugiego urządzenia: łączy dane zamiast je
 * zastępować. Jak każda zmiana — najpierw kopia bezpieczeństwa.
 */
export async function syncFromSnapshot(port: StoragePort, incoming: SnapshotV1): Promise<MergeReport> {
  await Promise.all([flushWorkspaceWrites(), flushLessonDraftWrites()]);
  await port.saveBackup('przed synchronizacją');
  const { merged, report } = mergeSnapshots(await port.exportAll(), incoming, Date.now());
  await port.importAll(merged);
  clearLearningShadows();
  return report;
}

/** Przywrocenie tez jest zmiana - bez kopii nie daloby sie go cofnac. */
export async function restoreBackup(port: StoragePort, id: string): Promise<BackupInfo> {
  const snapshot = await port.loadBackup(id);
  if (!snapshot) throw new SnapshotValidationError('Ta kopia już nie istnieje.');
  await Promise.all([flushWorkspaceWrites(), flushLessonDraftWrites()]);
  const backup = await port.saveBackup('przed przywróceniem kopii');
  await port.importAll(snapshot);
  clearLearningShadows();
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
  await Promise.all([flushWorkspaceWrites(), flushLessonDraftWrites()]);
  if (keepBackup) await port.saveBackup(reason);
  const attempts = await port.loadAttempts();
  const missionIds = new Set([...plan.missionIds, ...attempts.filter(a => plan.attemptIds.includes(a.id)).map(a => a.missionId)]);
  const skills = new Set(plan.skillIds);
  const preferences = await port.loadPreferences();
  const session = readMissionSession(preferences.find(p => p.key === MISSION_SESSION_KEY)?.value);
  if (session && (missionIds.has(session.mission.id) || skills.has(session.current.skill.id)
    || session.steps.some(step => skills.has(step.selection.skill.id)))) {
    missionIds.add(session.mission.id);
    await port.setPreference(MISSION_SESSION_KEY, 'null');
  }
  const remove = (key: string, value?: string | null) => {
    if (key.startsWith('forge.lesson-reading.v1:')) return [...skills].some(id => key.startsWith(`forge.lesson-reading.v1:${id}:`));
    if (key.startsWith('forge.teacher.chat:')) {
      if ([...missionIds].some(id => key.startsWith(`forge.teacher.chat:${id}:`))) return true;
      if ([...skills].some(id => key.startsWith(`forge.teacher.chat:feed:${id}:`))) return true;
      const workspace = preferences.find(pref => pref.key === key.replace('forge.teacher.chat:', 'forge.workspace.v1:'));
      try { return skills.has((JSON.parse(workspace?.value ?? 'null') as { skillId?: string } | null)?.skillId ?? ''); } catch { return false; }
    }
    if (!key.startsWith('forge.workspace.v1:') && !key.startsWith(LESSON_DRAFT_PREFIX)) return false;
    if ([...missionIds].some(id => key.startsWith(`forge.workspace.v1:${id}:`))) return true;
    try { return skills.has((JSON.parse(value ?? 'null') as { skillId?: string } | null)?.skillId ?? ''); } catch { return false; }
  };
  for (const pref of preferences) if (remove(pref.key, pref.value)) await port.setPreference(pref.key, 'null');
  clearLearningShadows(remove);
  await port.deleteRecords(plan);
  await port.compact();
}

/** "Wszystkie dane" obejmuja tez kopie - inaczej usuniecie byloby pozorne. */
export async function deleteEverything(port: StoragePort): Promise<void> {
  await Promise.all([flushWorkspaceWrites(), flushLessonDraftWrites()]);
  await port.clear();
  clearLearningShadows();
  await port.deleteBackups();
  await port.compact();
}

export async function deleteBackups(port: StoragePort): Promise<void> {
  await port.deleteBackups();
  await port.compact();
}

/** Device shadows must never resurrect data after an explicit replacement or deletion. */
function clearLearningShadows(matches: (key: string, value?: string | null) => boolean = key =>
  key.startsWith(LESSON_DRAFT_PREFIX) || key.startsWith('forge.workspace.v1:') || key.startsWith('forge.lesson-reading.v1:') || key.startsWith('forge.teacher.chat:')) {
  if (typeof localStorage !== 'undefined') {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string => key !== null);
    for (const key of keys) if (matches(key, localStorage.getItem(key))) localStorage.removeItem(key);
  }
  clearTeacherConversations(matches);
}

/** Wejscie dla `planDeletion` z pelnego eksportu. */
export function toDataSnapshot(snapshot: SnapshotV1): DataSnapshot {
  return {
    attempts: snapshot.attempts,
    missions: snapshot.missions,
    skillIdsWithState: snapshot.skillStates.map((s) => s.skillId),
    plans: (snapshot.plans ?? []).map((p) => ({
      subjectId: planSubject(p),
      skillIds: p.targets.map((t) => t.skillId),
    })),
    examResults: (snapshot.examResults ?? []).map((e) => ({ id: e.id, subjectId: e.subjectId })),
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

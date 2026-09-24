import type { Attempt, Mission, Preference, SavedPlan, SkillState } from './types';

/**
 * Port trwalosci.
 *
 * Blueprint sek. 9 wskazuje SQLite przez wtyczke Tauri. Dopoki powloka Tauri
 * nie jest zbudowana, ten sam interfejs obsluguje adapter przegladarkowy.
 * Reszta aplikacji nie wie, ktora implementacja dziala - to warunek tego, by
 * podmiana na SQLite byla wymiana jednego pliku, a nie przepisywaniem funkcji.
 */
export interface StoragePort {
  /** Migracje / utworzenie schematu. Idempotentne. */
  init(): Promise<void>;

  loadSkillStates(): Promise<SkillState[]>;
  saveSkillState(state: SkillState): Promise<void>;

  loadAttempts(): Promise<Attempt[]>;
  appendAttempt(attempt: Attempt): Promise<void>;

  loadMissions(): Promise<Mission[]>;
  saveMission(mission: Mission): Promise<void>;

  /** Aktywny plan nauki albo null, gdy diagnoza jeszcze nie przeszla. */
  loadPlan(): Promise<SavedPlan | null>;
  savePlan(plan: SavedPlan): Promise<void>;

  loadPreferences(): Promise<Preference[]>;
  setPreference(key: string, value: string): Promise<void>;

  /** Eksport do jawnego JSON (sek. 12). */
  exportAll(): Promise<SnapshotV1>;
  /** Import z walidacja schematu (sek. 12). */
  importAll(snapshot: unknown): Promise<void>;

  /** Usuniecie wszystkich danych uzytkownika. Kopii bezpieczenstwa nie rusza. */
  clear(): Promise<void>;

  /** Usuniecie wskazanych rekordow - jednej sesji albo przedmiotu (sek. 12). */
  deleteRecords(selection: RecordSelection): Promise<void>;

  /**
   * Kopia bezpieczenstwa przed zmiana (sek. 12). Przechowujemy ostatnie
   * `MAX_BACKUPS`. `clear()` jej nie kasuje - import czysci dane, a kopia
   * sprzed importu musi to przetrwac.
   */
  saveBackup(reason: string): Promise<BackupInfo>;
  /** Od najnowszej. */
  listBackups(): Promise<BackupInfo[]>;
  /** Kopia przechodzi te sama walidacje co import z pliku. */
  loadBackup(id: string): Promise<SnapshotV1 | null>;
  deleteBackups(): Promise<void>;

  /**
   * Fizyczne usuniecie skasowanych danych z pliku. SQLite po DELETE trzyma
   * stare wiersze w wolnych stronach i w dzienniku WAL, dopoki ich nie
   * nadpisze - "usun" ma znaczyc usun, a nie ukryj.
   */
  compact(): Promise<void>;
}

/** Co dokladnie usunac - wyliczone wczesniej przez `planDeletion`. */
export interface RecordSelection {
  attemptIds: string[];
  missionIds: string[];
  skillIds: string[];
  /** Plan zbudowany na usuwanych wynikach traci podstawe i znika razem z nimi. */
  dropPlan: boolean;
}

export interface BackupInfo {
  id: string;
  createdAt: number;
  reason: string;
  attempts: number;
  missions: number;
}

export const MAX_BACKUPS = 5;

let backupSequence = 0;

/**
 * Identyfikator sortuje sie jak czas utworzenia, takze dla dwoch kopii z tej
 * samej milisekundy - "od najnowszej" nie moze zalezec od losowej czesci.
 */
export function newBackupId(createdAt: number): string {
  backupSequence = (backupSequence + 1) % 1_000_000;
  const time = String(createdAt).padStart(15, '0');
  const seq = String(backupSequence).padStart(6, '0');
  return `b-${time}-${seq}-${crypto.randomUUID().slice(0, 8)}`;
}

export const SNAPSHOT_VERSION = 1;

export interface SnapshotV1 {
  version: typeof SNAPSHOT_VERSION;
  exportedAt: number;
  skillStates: SkillState[];
  attempts: Attempt[];
  missions: Mission[];
  /** Pola dopisane w wersji 1 po pierwszym wydaniu - kopie bez nich sa wazne. */
  plan?: SavedPlan | null;
  preferences?: Preference[];
}

export class SnapshotValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotValidationError';
  }
}

/**
 * Walidacja importu. Swiadomie odrzucamy dane niepewne zamiast je naprawiac -
 * po cichu poprawiony import to gorszy scenariusz niz jawny blad, bo psuje
 * dowody opanowania, na ktorych stoi caly system.
 */
export function validateSnapshot(input: unknown): SnapshotV1 {
  if (typeof input !== 'object' || input === null) {
    throw new SnapshotValidationError('Kopia nie jest obiektem JSON.');
  }

  const snap = input as Partial<SnapshotV1>;

  if (snap.version !== SNAPSHOT_VERSION) {
    throw new SnapshotValidationError(
      `Nieobslugiwana wersja kopii: ${String(snap.version)}. Oczekiwano ${SNAPSHOT_VERSION}.`,
    );
  }

  const arrays: Array<[keyof SnapshotV1, unknown]> = [
    ['skillStates', snap.skillStates],
    ['attempts', snap.attempts],
    ['missions', snap.missions],
  ];

  for (const [name, value] of arrays) {
    if (!Array.isArray(value)) {
      throw new SnapshotValidationError(`Pole "${String(name)}" nie jest lista.`);
    }
  }

  for (const s of snap.skillStates as SkillState[]) {
    if (typeof s?.skillId !== 'string' || s.skillId === '') {
      throw new SnapshotValidationError('Stan kompetencji bez identyfikatora.');
    }
    if (typeof s.level !== 'number' || s.level < 0 || s.level > 5) {
      throw new SnapshotValidationError(
        `Poziom poza zakresem 0-5 dla "${s.skillId}".`,
      );
    }
  }

  for (const a of snap.attempts as Attempt[]) {
    if (typeof a?.id !== 'string' || typeof a.questionId !== 'string') {
      throw new SnapshotValidationError('Proba bez identyfikatora pytania.');
    }
    // Import najpierw czysci baze. Rekord, ktory odrzucilaby dopiero baza
    // (NOT NULL), zostawilby profil w polowie - lapiemy go tutaj.
    if (
      typeof a.skillId !== 'string' ||
      typeof a.missionId !== 'string' ||
      typeof a.userAnswer !== 'string' ||
      typeof a.startedAt !== 'number' ||
      typeof a.answeredAt !== 'number'
    ) {
      throw new SnapshotValidationError(`Niepelna proba "${a.id}".`);
    }
  }

  for (const m of snap.missions as Mission[]) {
    if (typeof m?.id !== 'string' || typeof m.startedAt !== 'number') {
      throw new SnapshotValidationError('Misja bez identyfikatora albo daty rozpoczecia.');
    }
  }

  return {
    version: SNAPSHOT_VERSION,
    exportedAt: typeof snap.exportedAt === 'number' ? snap.exportedAt : Date.now(),
    skillStates: snap.skillStates as SkillState[],
    attempts: snap.attempts as Attempt[],
    missions: snap.missions as Mission[],
    // Starsze kopie nie maja tych pol - to nie jest powod do odrzucenia.
    plan: snap.plan ?? null,
    preferences: Array.isArray(snap.preferences) ? snap.preferences : [],
  };
}

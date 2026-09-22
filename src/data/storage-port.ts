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

  /** Usuniecie wszystkich danych uzytkownika. */
  clear(): Promise<void>;
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

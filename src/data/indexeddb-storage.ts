import type {
  Attempt,
  CardState,
  ExamResult,
  LessonProgress,
  Mission,
  Preference,
  SavedPlan,
  SkillState,
} from './types';
import {
  MAX_BACKUPS,
  SNAPSHOT_VERSION,
  newBackupId,
  validateSnapshot,
  type BackupInfo,
  type RecordSelection,
  type SnapshotV1,
  type StoragePort,
} from './storage-port';

/**
 * Adapter przegladarkowy (IndexedDB).
 *
 * Rola tymczasowa: pozwala domknac pionowy wycinek z sek. 18 zanim powstanie
 * powloka Tauri. Po jej zbudowaniu dopisujemy SqliteStorage implementujacy ten
 * sam port i podmieniamy jedna linijke w kompozycji aplikacji.
 */

const DB_NAME = 'forge';
const DB_VERSION = 5;

const STORES = {
  skillStates: 'skillStates',
  attempts: 'attempts',
  missions: 'missions',
  plan: 'plan',
  preferences: 'preferences',
  lessonProgress: 'lessonProgress',
  cardStates: 'cardStates',
  examResults: 'examResults',
} as const;

/**
 * Kopie bezpieczenstwa sa poza STORES celowo: `clear()` czysci STORES, a kopia
 * sprzed importu musi przetrwac czyszczenie, ktore import wykonuje.
 */
const BACKUPS = 'backups';

interface BackupRecord extends BackupInfo {
  snapshot: SnapshotV1;
}

/** Aktywny plan jest jeden, wiec trzymamy go pod stalym kluczem. */
const ACTIVE_PLAN_KEY = 'active';

export class IndexedDbStorage implements StoragePort {
  private db: IDBDatabase | null = null;

  constructor(private readonly dbName: string = DB_NAME) {}

  async init(): Promise<void> {
    if (this.db) return;
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.dbName, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        // Migracja v1. Kolejne wersje dopisuja sie tutaj wedlug oldVersion.
        if (!db.objectStoreNames.contains(STORES.skillStates)) {
          db.createObjectStore(STORES.skillStates, { keyPath: 'skillId' });
        }
        if (!db.objectStoreNames.contains(STORES.attempts)) {
          db.createObjectStore(STORES.attempts, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.missions)) {
          db.createObjectStore(STORES.missions, { keyPath: 'id' });
        }
        // Migracja v2: plan nauki i preferencje.
        if (!db.objectStoreNames.contains(STORES.plan)) {
          db.createObjectStore(STORES.plan);
        }
        if (!db.objectStoreNames.contains(STORES.preferences)) {
          db.createObjectStore(STORES.preferences, { keyPath: 'key' });
        }
        // Migracja v4: kurs - ukonczone lekcje i fiszki.
        if (!db.objectStoreNames.contains(STORES.lessonProgress)) {
          db.createObjectStore(STORES.lessonProgress, { keyPath: 'skillId' });
        }
        if (!db.objectStoreNames.contains(STORES.cardStates)) {
          db.createObjectStore(STORES.cardStates, { keyPath: 'cardId' });
        }
        // Migracja v5: wyniki arkuszy CKE.
        if (!db.objectStoreNames.contains(STORES.examResults)) {
          db.createObjectStore(STORES.examResults, { keyPath: 'id' });
        }
        // Migracja v3: kopie bezpieczenstwa (sek. 12).
        if (!db.objectStoreNames.contains(BACKUPS)) {
          db.createObjectStore(BACKUPS, { keyPath: 'id' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('Nie udalo sie otworzyc bazy.'));
    });
  }

  async loadSkillStates(): Promise<SkillState[]> {
    return this.readAll<SkillState>(STORES.skillStates);
  }

  async saveSkillState(state: SkillState): Promise<void> {
    return this.write(STORES.skillStates, state);
  }

  async loadAttempts(): Promise<Attempt[]> {
    return this.readAll<Attempt>(STORES.attempts);
  }

  async appendAttempt(attempt: Attempt): Promise<void> {
    return this.write(STORES.attempts, attempt);
  }

  async loadMissions(): Promise<Mission[]> {
    return this.readAll<Mission>(STORES.missions);
  }

  async saveMission(mission: Mission): Promise<void> {
    return this.write(STORES.missions, mission);
  }

  async loadPlan(): Promise<SavedPlan | null> {
    const db = this.require();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORES.plan, 'readonly').objectStore(STORES.plan).get(ACTIVE_PLAN_KEY);
      req.onsuccess = () => resolve((req.result as SavedPlan | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async savePlan(plan: SavedPlan): Promise<void> {
    const db = this.require();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.plan, 'readwrite');
      tx.objectStore(STORES.plan).put(plan, ACTIVE_PLAN_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadPreferences(): Promise<Preference[]> {
    return this.readAll<Preference>(STORES.preferences);
  }

  async setPreference(key: string, value: string): Promise<void> {
    return this.write(STORES.preferences, { key, value });
  }

  async loadLessonProgress(): Promise<LessonProgress[]> {
    return this.readAll<LessonProgress>(STORES.lessonProgress);
  }

  /** Pierwsze ukonczenie zostaje - ponowne przeczytanie lekcji go nie przesuwa. */
  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    const existing = (await this.loadLessonProgress()).some((l) => l.skillId === progress.skillId);
    if (existing) return;
    return this.write(STORES.lessonProgress, progress);
  }

  async loadCardStates(): Promise<CardState[]> {
    return this.readAll<CardState>(STORES.cardStates);
  }

  async saveCardState(state: CardState): Promise<void> {
    return this.write(STORES.cardStates, state);
  }

  async loadExamResults(): Promise<ExamResult[]> {
    const all = await this.readAll<ExamResult>(STORES.examResults);
    return all.sort((a, b) => a.takenAt - b.takenAt);
  }

  async saveExamResult(result: ExamResult): Promise<void> {
    return this.write(STORES.examResults, result);
  }

  async exportAll(): Promise<SnapshotV1> {
    const [skillStates, attempts, missions, plan, preferences, lessonProgress, cardStates, examResults] =
      await Promise.all([
        this.loadSkillStates(),
        this.loadAttempts(),
        this.loadMissions(),
        this.loadPlan(),
        this.loadPreferences(),
        this.loadLessonProgress(),
        this.loadCardStates(),
        this.loadExamResults(),
      ]);
    return {
      version: SNAPSHOT_VERSION,
      exportedAt: Date.now(),
      skillStates,
      attempts,
      missions,
      plan,
      preferences,
      lessonProgress,
      cardStates,
      examResults,
    };
  }

  /**
   * Import zastepuje dane w calosci, ale dopiero po walidacji - uszkodzona
   * kopia nie ma prawa wyczyscic dzialajacego profilu.
   */
  async importAll(input: unknown): Promise<void> {
    const snapshot = validateSnapshot(input);
    await this.clear();
    await Promise.all([
      ...snapshot.skillStates.map((s) => this.saveSkillState(s)),
      ...snapshot.attempts.map((a) => this.appendAttempt(a)),
      ...snapshot.missions.map((m) => this.saveMission(m)),
      ...(snapshot.preferences ?? []).map((p) => this.setPreference(p.key, p.value)),
      ...(snapshot.plan ? [this.savePlan(snapshot.plan)] : []),
      ...(snapshot.lessonProgress ?? []).map((l) => this.write(STORES.lessonProgress, l)),
      ...(snapshot.cardStates ?? []).map((c) => this.saveCardState(c)),
      ...(snapshot.examResults ?? []).map((e) => this.saveExamResult(e)),
    ]);
  }

  async clear(): Promise<void> {
    const db = this.require();
    await Promise.all(
      Object.values(STORES).map(
        (name) =>
          new Promise<void>((resolve, reject) => {
            const req = db.transaction(name, 'readwrite').objectStore(name).clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          }),
      ),
    );
  }

  /** Jedna transakcja: sesja albo przedmiot znika w calosci albo wcale. */
  async deleteRecords(selection: RecordSelection): Promise<void> {
    const db = this.require();
    const names = [
      STORES.attempts,
      STORES.missions,
      STORES.skillStates,
      STORES.plan,
      STORES.lessonProgress,
      STORES.cardStates,
      STORES.examResults,
    ];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(names, 'readwrite');
      for (const id of selection.attemptIds) tx.objectStore(STORES.attempts).delete(id);
      for (const id of selection.missionIds) tx.objectStore(STORES.missions).delete(id);
      for (const id of selection.skillIds) {
        tx.objectStore(STORES.skillStates).delete(id);
        tx.objectStore(STORES.lessonProgress).delete(id);
      }
      // Fiszki sa kluczowane po karcie, wiec szukamy ich po umiejetnosci.
      if (selection.skillIds.length > 0) {
        const skills = new Set(selection.skillIds);
        const cards = tx.objectStore(STORES.cardStates);
        const all = cards.getAll();
        all.onsuccess = () => {
          for (const c of all.result as CardState[]) {
            if (skills.has(c.skillId)) cards.delete(c.cardId);
          }
        };
      }
      for (const id of selection.examResultIds ?? []) tx.objectStore(STORES.examResults).delete(id);
      if (selection.dropPlan) tx.objectStore(STORES.plan).delete(ACTIVE_PLAN_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async saveBackup(reason: string): Promise<BackupInfo> {
    const snapshot = await this.exportAll();
    const record: BackupRecord = {
      id: newBackupId(snapshot.exportedAt),
      createdAt: snapshot.exportedAt,
      reason,
      attempts: snapshot.attempts.length,
      missions: snapshot.missions.length,
      snapshot,
    };
    await this.write(BACKUPS, record);

    const stale = (await this.backupRecords()).slice(MAX_BACKUPS);
    await Promise.all(stale.map((b) => this.remove(BACKUPS, b.id)));

    const { snapshot: _omit, ...info } = record;
    return info;
  }

  async listBackups(): Promise<BackupInfo[]> {
    return (await this.backupRecords()).map(({ snapshot: _omit, ...info }) => info);
  }

  async loadBackup(id: string): Promise<SnapshotV1 | null> {
    const record = (await this.backupRecords()).find((b) => b.id === id);
    return record ? validateSnapshot(record.snapshot) : null;
  }

  async deleteBackups(): Promise<void> {
    const db = this.require();
    return new Promise((resolve, reject) => {
      const req = db.transaction(BACKUPS, 'readwrite').objectStore(BACKUPS).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /** Przegladarka sama zarzadza plikami IndexedDB - nie mamy tu nic do zrobienia. */
  async compact(): Promise<void> {}

  /** Od najnowszej; przy tym samym czasie decyduje id, zeby kolejnosc byla stala. */
  private async backupRecords(): Promise<BackupRecord[]> {
    const all = await this.readAll<BackupRecord>(BACKUPS);
    return all.sort((a, b) => b.createdAt - a.createdAt || (a.id < b.id ? 1 : -1));
  }

  private remove(store: string, key: IDBValidKey): Promise<void> {
    const db = this.require();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Zamyka polaczenie - test restartu otwiera baze od nowa. */
  close(): void {
    this.db?.close();
    this.db = null;
  }

  private require(): IDBDatabase {
    if (!this.db) throw new Error('Baza nie zostala zainicjowana - wywolaj init().');
    return this.db;
  }

  private readAll<T>(store: string): Promise<T[]> {
    const db = this.require();
    return new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  private write(store: string, value: unknown): Promise<void> {
    const db = this.require();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}

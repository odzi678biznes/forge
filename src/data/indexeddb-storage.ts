import type { Attempt, Mission, Preference, SavedPlan, SkillState } from './types';
import {
  SNAPSHOT_VERSION,
  validateSnapshot,
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
const DB_VERSION = 2;

const STORES = {
  skillStates: 'skillStates',
  attempts: 'attempts',
  missions: 'missions',
  plan: 'plan',
  preferences: 'preferences',
} as const;

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

  async exportAll(): Promise<SnapshotV1> {
    const [skillStates, attempts, missions, plan, preferences] = await Promise.all([
      this.loadSkillStates(),
      this.loadAttempts(),
      this.loadMissions(),
      this.loadPlan(),
      this.loadPreferences(),
    ]);
    return {
      version: SNAPSHOT_VERSION,
      exportedAt: Date.now(),
      skillStates,
      attempts,
      missions,
      plan,
      preferences,
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

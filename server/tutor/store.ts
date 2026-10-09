import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export interface Stored<T> { version: number; value: T }
export interface TutorStore {
  read<T>(key: string): Promise<Stored<T> | null>;
  compareAndSet<T>(key: string, version: number | null, value: T): Promise<boolean>;
}
export class StoreConflict extends Error { constructor() { super('Stan sesji zmienił się na innym urządzeniu. Spróbuj ponownie.'); } }

/** SQLite commits survive process restarts. Each update is one optimistic, atomic write. */
export class SqliteTutorStore implements TutorStore {
  private db: import('node:sqlite').DatabaseSync;
  constructor(path: string) {
    // Vite 5 predates node:sqlite; getBuiltinModule keeps this server-only builtin out of its resolver.
    if (typeof process.getBuiltinModule !== 'function') throw new Error('Lokalny Tutor wymaga Node 22.13 lub nowszego.');
    const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
    if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS tutor_records (key TEXT PRIMARY KEY, version INTEGER NOT NULL, data TEXT NOT NULL)');
  }
  async read<T>(key: string): Promise<Stored<T> | null> {
    const row = this.db.prepare('SELECT version, data FROM tutor_records WHERE key=?').get(key);
    return row ? { version: Number(row.version), value: JSON.parse(String(row.data)) as T } : null;
  }
  async compareAndSet<T>(key: string, version: number | null, value: T): Promise<boolean> {
    const data = JSON.stringify(value);
    const r = version === null
      ? this.db.prepare('INSERT OR IGNORE INTO tutor_records (key,version,data) VALUES (?,1,?)').run(key, data)
      : this.db.prepare('UPDATE tutor_records SET version=version+1,data=? WHERE key=? AND version=?').run(data, key, version);
    return Number(r.changes) === 1;
  }
  close() { this.db.close(); }
}

/** Serverless instances share durable records; Lua CAS prevents two devices overwriting one another. */
export class RedisTutorStore implements TutorStore {
  constructor(private url: string, private token: string) {
    if (!url.startsWith('https://')) throw new Error('Magazyn sesji wymaga HTTPS.');
  }
  private async command(command: unknown[]): Promise<unknown> {
    const r = await fetch(this.url, { method: 'POST', headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command), signal: AbortSignal.timeout(10_000) });
    const data = await r.json() as { result?: unknown; error?: string };
    if (!r.ok || data.error) throw new Error('Magazyn sesji jest chwilowo niedostępny.');
    return data.result;
  }
  async read<T>(key: string): Promise<Stored<T> | null> {
    const raw = await this.command(['GET', `forge:tutor:${key}`]);
    return typeof raw === 'string' ? JSON.parse(raw) as Stored<T> : null;
  }
  async compareAndSet<T>(key: string, version: number | null, value: T): Promise<boolean> {
    const script = "local s=redis.call('GET',KEYS[1]); if ARGV[1]=='null' then if s then return 0 end else if not s or cjson.decode(s).version~=tonumber(ARGV[1]) then return 0 end end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
    return Number(await this.command(['EVAL', script, 1, `forge:tutor:${key}`, String(version), JSON.stringify({ version: (version ?? 0) + 1, value })])) === 1;
  }
}
export async function mutate<T>(store: TutorStore, key: string, change: (value: T) => T): Promise<T> {
  for (let i = 0; i < 8; i++) {
    const saved = await store.read<T>(key);
    if (!saved) throw new Error('Nie znaleziono profilu ucznia.');
    const next = change(structuredClone(saved.value));
    if (await store.compareAndSet(key, saved.version, next)) return next;
  }
  throw new StoreConflict();
}
let singleton: TutorStore | null = null;
export function storeKind(): 'sqlite' | 'redis' | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return 'redis';
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' && !process.env.FORGE_TUTOR_DB) return null;
  return 'sqlite';
}
export function tutorStore(): TutorStore {
  if (singleton) return singleton;
  const kind = storeKind();
  if (kind === null) throw new Error('Skonfiguruj trwały magazyn sesji (UPSTASH_REDIS_REST_URL i UPSTASH_REDIS_REST_TOKEN).');
  singleton = kind === 'redis'
    ? new RedisTutorStore(process.env.UPSTASH_REDIS_REST_URL!, process.env.UPSTASH_REDIS_REST_TOKEN!)
    : new SqliteTutorStore(process.env.FORGE_TUTOR_DB || resolve('.forge/tutor.sqlite'));
  return singleton;
}

import Database from '@tauri-apps/plugin-sql';
import {
  MasteryLevel,
  type Attempt,
  type Confidence,
  type Correctness,
  type HintLevel,
  type Mission,
  type MissionKind,
  type Preference,
  type PlanVariantId,
  type SavedPlan,
  type SkillState,
} from './types';
import {
  SNAPSHOT_VERSION,
  validateSnapshot,
  type SnapshotV1,
  type StoragePort,
} from './storage-port';

/**
 * Adapter SQLite dla powloki Tauri - Blueprint sek. 9.
 *
 * Implementuje ten sam `StoragePort` co adapter przegladarkowy, wiec silnik
 * nauki nie wie, ktory z nich dziala. Migracje sa zarejestrowane po stronie
 * Rusta (`src-tauri/src/lib.rs`) i wykonuja sie przy `Database.load`.
 *
 * Wszystkie zapytania sa parametryzowane. Odpowiedz uzytkownika trafia do
 * bazy jako wartosc wiazana, nigdy jako sklejony tekst SQL.
 */

/** Musi zgadzac sie z `DB_URL` w src-tauri/src/lib.rs. */
export const DB_URL = 'sqlite:forge.db';

interface SkillStateRow {
  skill_id: string;
  level: number;
  independent_streak: number;
  level_reached_at: number | null;
  review_due_at: number | null;
  review_step: number;
  recent_errors: string;
  last_attempt_at: number | null;
  total_attempts: number;
}

interface AttemptRow {
  id: string;
  question_id: string;
  skill_id: string;
  mission_id: string;
  started_at: number;
  answered_at: number;
  user_answer: string;
  correctness: string;
  confidence: string;
  hint_level: number;
  error_id: string | null;
  grading_version: string;
  graded_by: string;
}

interface PlanRow {
  id: string;
  variant: string;
  created_at: number;
  deadline: number | null;
  targets: string;
  diagnosis_snapshot: string;
  active: number;
}

interface PreferenceRow {
  key: string;
  value: string;
}

interface MissionRow {
  id: string;
  kind: string;
  title: string;
  rationale: string;
  question_ids: string;
  started_at: number;
  finished_at: number | null;
}

export class SqliteStorage implements StoragePort {
  private db: Database | null = null;

  constructor(private readonly url: string = DB_URL) {}

  async init(): Promise<void> {
    if (this.db) return;
    // Migracje zarejestrowane w Rust wykonuja sie wlasnie tutaj.
    this.db = await Database.load(this.url);
  }

  async loadSkillStates(): Promise<SkillState[]> {
    const rows = await this.require().select<SkillStateRow[]>(
      'SELECT * FROM skill_states',
    );
    return rows.map(toSkillState);
  }

  async saveSkillState(state: SkillState): Promise<void> {
    await this.require().execute(
      `INSERT INTO skill_states
         (skill_id, level, independent_streak, level_reached_at, review_due_at,
          review_step, recent_errors, last_attempt_at, total_attempts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (skill_id) DO UPDATE SET
         level = excluded.level,
         independent_streak = excluded.independent_streak,
         level_reached_at = excluded.level_reached_at,
         review_due_at = excluded.review_due_at,
         review_step = excluded.review_step,
         recent_errors = excluded.recent_errors,
         last_attempt_at = excluded.last_attempt_at,
         total_attempts = excluded.total_attempts`,
      [
        state.skillId,
        state.level,
        state.independentStreak,
        state.levelReachedAt,
        state.reviewDueAt,
        state.reviewStep,
        JSON.stringify(state.recentErrors),
        state.lastAttemptAt,
        state.totalAttempts,
      ],
    );
  }

  async loadAttempts(): Promise<Attempt[]> {
    const rows = await this.require().select<AttemptRow[]>(
      'SELECT * FROM attempts ORDER BY answered_at ASC',
    );
    return rows.map(toAttempt);
  }

  async appendAttempt(a: Attempt): Promise<void> {
    await this.require().execute(
      `INSERT INTO attempts
         (id, question_id, skill_id, mission_id, started_at, answered_at,
          user_answer, correctness, confidence, hint_level, error_id,
          grading_version, graded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        a.questionId,
        a.skillId,
        a.missionId,
        a.startedAt,
        a.answeredAt,
        a.userAnswer,
        a.correctness,
        a.confidence,
        a.hintLevel,
        a.errorId,
        a.gradingVersion,
        a.gradedBy,
      ],
    );
  }

  async loadMissions(): Promise<Mission[]> {
    const rows = await this.require().select<MissionRow[]>(
      'SELECT * FROM missions ORDER BY started_at ASC',
    );
    return rows.map(toMission);
  }

  async saveMission(m: Mission): Promise<void> {
    await this.require().execute(
      `INSERT INTO missions
         (id, kind, title, rationale, question_ids, started_at, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         question_ids = excluded.question_ids,
         finished_at = excluded.finished_at`,
      [
        m.id,
        m.kind,
        m.title,
        m.rationale,
        JSON.stringify(m.questionIds),
        m.startedAt,
        m.finishedAt,
      ],
    );
  }

  async loadPlan(): Promise<SavedPlan | null> {
    const rows = await this.require().select<PlanRow[]>(
      'SELECT * FROM plans WHERE active = 1 ORDER BY created_at DESC LIMIT 1',
    );
    const row = rows[0];
    return row ? toPlan(row) : null;
  }

  /** Nowy plan zastepuje poprzedni, ale go nie kasuje - historia zostaje. */
  async savePlan(plan: SavedPlan): Promise<void> {
    const db = this.require();
    await db.execute('UPDATE plans SET active = 0 WHERE active = 1');
    await db.execute(
      `INSERT INTO plans
         (id, variant, created_at, deadline, targets, diagnosis_snapshot, active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       ON CONFLICT (id) DO UPDATE SET
         variant = excluded.variant,
         deadline = excluded.deadline,
         targets = excluded.targets,
         diagnosis_snapshot = excluded.diagnosis_snapshot,
         active = 1`,
      [
        plan.id,
        plan.variant,
        plan.createdAt,
        plan.deadline,
        JSON.stringify(plan.targets),
        JSON.stringify(plan.diagnosisSnapshot),
      ],
    );
  }

  async loadPreferences(): Promise<Preference[]> {
    const rows = await this.require().select<PreferenceRow[]>('SELECT * FROM preferences');
    return rows.map((r) => ({ key: r.key, value: r.value }));
  }

  async setPreference(key: string, value: string): Promise<void> {
    await this.require().execute(
      `INSERT INTO preferences (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
      [key, value],
    );
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

  /** Walidacja przed czyszczeniem - uszkodzona kopia nie kasuje profilu. */
  async importAll(input: unknown): Promise<void> {
    const snapshot = validateSnapshot(input);
    await this.clear();
    for (const s of snapshot.skillStates) await this.saveSkillState(s);
    for (const a of snapshot.attempts) await this.appendAttempt(a);
    for (const m of snapshot.missions) await this.saveMission(m);
    for (const pref of snapshot.preferences ?? []) await this.setPreference(pref.key, pref.value);
    if (snapshot.plan) await this.savePlan(snapshot.plan);
  }

  async clear(): Promise<void> {
    const db = this.require();
    await db.execute('DELETE FROM attempts');
    await db.execute('DELETE FROM missions');
    await db.execute('DELETE FROM skill_states');
    await db.execute('DELETE FROM plans');
    await db.execute('DELETE FROM preferences');
  }

  async close(): Promise<void> {
    await this.db?.close();
    this.db = null;
  }

  private require(): Database {
    if (!this.db) throw new Error('Baza nie zostala zainicjowana - wywolaj init().');
    return this.db;
  }
}

// ---------------------------------------------------------------------------
// Mapowanie wierszy na typy domeny
// ---------------------------------------------------------------------------

function toSkillState(r: SkillStateRow): SkillState {
  return {
    skillId: r.skill_id,
    level: clampLevel(r.level),
    independentStreak: r.independent_streak,
    levelReachedAt: r.level_reached_at,
    reviewDueAt: r.review_due_at,
    reviewStep: r.review_step,
    recentErrors: parseStringArray(r.recent_errors),
    lastAttemptAt: r.last_attempt_at,
    totalAttempts: r.total_attempts,
  };
}

function toAttempt(r: AttemptRow): Attempt {
  return {
    id: r.id,
    questionId: r.question_id,
    skillId: r.skill_id,
    missionId: r.mission_id,
    startedAt: r.started_at,
    answeredAt: r.answered_at,
    userAnswer: r.user_answer,
    correctness: r.correctness as Correctness,
    confidence: r.confidence as Confidence,
    hintLevel: r.hint_level as HintLevel,
    errorId: r.error_id,
    gradingVersion: r.grading_version,
    gradedBy: r.graded_by as Attempt['gradedBy'],
  };
}

function toPlan(r: PlanRow): SavedPlan {
  return {
    id: r.id,
    variant: r.variant as PlanVariantId,
    createdAt: r.created_at,
    deadline: r.deadline,
    targets: parseJsonArray(r.targets),
    diagnosisSnapshot: parseJsonArray(r.diagnosis_snapshot),
  };
}

/** Uszkodzony JSON w kolumnie nie moze wywrocic wczytywania planu. */
function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function toMission(r: MissionRow): Mission {
  return {
    id: r.id,
    kind: r.kind as MissionKind,
    title: r.title,
    rationale: r.rationale,
    questionIds: parseStringArray(r.question_ids),
    startedAt: r.started_at,
    finishedAt: r.finished_at,
  };
}

/**
 * Baza ma CHECK na zakres, ale kopia zapasowa moze pochodzic z innej wersji.
 * Wolimy zacisnac do zakresu niz wpuscic poziom spoza skali 0-5.
 */
function clampLevel(n: number): MasteryLevel {
  const clamped = globalThis.Math.min(
    MasteryLevel.Retained,
    globalThis.Math.max(MasteryLevel.Unknown, globalThis.Math.round(n)),
  );
  return clamped as MasteryLevel;
}

/** Uszkodzony JSON w kolumnie nie moze wywrocic wczytywania profilu. */
export function parseStringArray(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

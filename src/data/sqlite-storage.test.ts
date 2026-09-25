import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MasteryLevel, type Attempt, type Mission, type SkillState } from './types';

/**
 * Testy adaptera SQLite bez uruchamiania Tauri.
 *
 * Mockujemy warstwe bazy i sprawdzamy to, co faktycznie grozi cicha strata
 * danych: mapowanie kolumn snake_case na pola domeny i kolejnosc parametrow
 * w zapytaniach. Blad w tym miejscu nie rzuca wyjatkiem - po prostu zapisuje
 * zla liczbe w zlej kolumnie.
 */

const execute = vi.fn();
const select = vi.fn();
const close = vi.fn();

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn(async () => ({ execute, select, close })),
  },
}));

const { SqliteStorage, parseStringArray } = await import('./sqlite-storage');

async function ready() {
  const s = new SqliteStorage();
  await s.init();
  return s;
}

beforeEach(() => {
  execute.mockReset();
  select.mockReset();
  close.mockReset();
  execute.mockResolvedValue({ rowsAffected: 1 });
  select.mockResolvedValue([]);
});

describe('odczyt stanu kompetencji', () => {
  it('mapuje kolumny snake_case na pola domeny', async () => {
    select.mockResolvedValueOnce([
      {
        skill_id: 's-1',
        level: 3,
        independent_streak: 2,
        level_reached_at: 1000,
        review_due_at: 2000,
        review_step: 1,
        recent_errors: '["err-a","err-b"]',
        last_attempt_at: 1500,
        total_attempts: 7,
      },
    ]);

    const [state] = await (await ready()).loadSkillStates();

    expect(state).toEqual<SkillState>({
      skillId: 's-1',
      level: MasteryLevel.Independent,
      independentStreak: 2,
      levelReachedAt: 1000,
      reviewDueAt: 2000,
      reviewStep: 1,
      recentErrors: ['err-a', 'err-b'],
      lastAttemptAt: 1500,
      totalAttempts: 7,
    });
  });

  it('wartosci NULL zostaja nullami, nie zerami', async () => {
    select.mockResolvedValueOnce([
      {
        skill_id: 's-1',
        level: 0,
        independent_streak: 0,
        level_reached_at: null,
        review_due_at: null,
        review_step: 0,
        recent_errors: '[]',
        last_attempt_at: null,
        total_attempts: 0,
      },
    ]);

    const [state] = await (await ready()).loadSkillStates();
    expect(state?.reviewDueAt).toBeNull();
    expect(state?.levelReachedAt).toBeNull();
    expect(state?.lastAttemptAt).toBeNull();
  });

  it('poziom spoza skali 0-5 zostaje zacisniety do zakresu', async () => {
    select.mockResolvedValueOnce([
      { skill_id: 'a', level: 9, independent_streak: 0, level_reached_at: null, review_due_at: null, review_step: 0, recent_errors: '[]', last_attempt_at: null, total_attempts: 0 },
      { skill_id: 'b', level: -3, independent_streak: 0, level_reached_at: null, review_due_at: null, review_step: 0, recent_errors: '[]', last_attempt_at: null, total_attempts: 0 },
    ]);

    const states = await (await ready()).loadSkillStates();
    expect(states[0]?.level).toBe(MasteryLevel.Retained);
    expect(states[1]?.level).toBe(MasteryLevel.Unknown);
  });
});

describe('zapis stanu kompetencji', () => {
  it('przekazuje parametry w kolejnosci zgodnej z zapytaniem', async () => {
    const state: SkillState = {
      skillId: 's-1',
      level: MasteryLevel.Transfer,
      independentStreak: 3,
      levelReachedAt: 111,
      reviewDueAt: 222,
      reviewStep: 2,
      recentErrors: ['err-x'],
      lastAttemptAt: 333,
      totalAttempts: 12,
    };

    await (await ready()).saveSkillState(state);

    const [sql, params] = execute.mock.calls[0] ?? [];
    expect(sql).toContain('INSERT INTO skill_states');
    expect(sql).toContain('ON CONFLICT (skill_id) DO UPDATE');
    expect(params).toEqual(['s-1', 4, 3, 111, 222, 2, '["err-x"]', 333, 12]);
  });

  it('nie sklejala tekstu SQL z danych uzytkownika', async () => {
    const attempt: Attempt = {
      id: 'a-1',
      questionId: 'q-1',
      skillId: 's-1',
      missionId: 'm-1',
      startedAt: 1,
      answeredAt: 2,
      // Odpowiedz probujaca wstrzyknac SQL musi trafic do bazy jako tekst.
      userAnswer: "'); DROP TABLE attempts; --",
      correctness: 'incorrect',
      confidence: 'guess',
      hintLevel: 0,
      errorId: null,
      gradingVersion: 'v1',
      gradedBy: 'auto',
    };

    await (await ready()).appendAttempt(attempt);

    const [sql, params] = execute.mock.calls[0] ?? [];
    expect(sql).not.toContain('DROP TABLE');
    expect(params).toContain("'); DROP TABLE attempts; --");
  });
});

describe('proby i misje', () => {
  it('odtwarza probe z wiersza bazy', async () => {
    select.mockResolvedValueOnce([
      {
        id: 'a-1',
        question_id: 'q-1',
        skill_id: 's-1',
        mission_id: 'm-1',
        started_at: 10,
        answered_at: 20,
        user_answer: '-4',
        correctness: 'incorrect',
        confidence: 'partial',
        hint_level: 2,
        error_id: 'err-znak',
        grading_version: 'v1',
        graded_by: 'auto',
      },
    ]);

    const [a] = await (await ready()).loadAttempts();
    expect(a).toEqual<Attempt>({
      id: 'a-1',
      questionId: 'q-1',
      skillId: 's-1',
      missionId: 'm-1',
      startedAt: 10,
      answeredAt: 20,
      userAnswer: '-4',
      correctness: 'incorrect',
      confidence: 'partial',
      hintLevel: 2,
      errorId: 'err-znak',
      gradingVersion: 'v1',
      gradedBy: 'auto',
    });
  });

  it('lista pytan misji wraca jako tablica, nie jako tekst JSON', async () => {
    select.mockResolvedValueOnce([
      {
        id: 'm-1',
        kind: 'training',
        title: 'Trening',
        rationale: 'Powod',
        question_ids: '["q-1","q-2"]',
        started_at: 1,
        finished_at: 2,
      },
    ]);

    const [m] = await (await ready()).loadMissions();
    expect(m?.questionIds).toEqual(['q-1', 'q-2']);
    expect(m).toMatchObject<Partial<Mission>>({ kind: 'training', finishedAt: 2 });
  });
});

describe('odpornosc na uszkodzone dane', () => {
  it('uszkodzony JSON w kolumnie nie wywraca wczytywania profilu', () => {
    expect(parseStringArray('to nie jest json')).toEqual([]);
    expect(parseStringArray('{"a":1}')).toEqual([]);
    expect(parseStringArray('[1,2,"ok"]')).toEqual(['ok']);
    expect(parseStringArray('[]')).toEqual([]);
  });
});

describe('cykl zycia', () => {
  it('odczyt bez init konczy sie jawnym bledem', async () => {
    const s = new SqliteStorage();
    await expect(s.loadAttempts()).rejects.toThrow(/init/);
  });

  it('init jest idempotentny', async () => {
    const s = new SqliteStorage();
    await s.init();
    await s.init();
    await s.loadAttempts();
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('czyszczenie usuwa proby przed kompetencjami i obejmuje wszystkie tabele', async () => {
    await (await ready()).clear();
    const order = execute.mock.calls.map(([sql]) => String(sql));

    // Proby odwoluja sie do kompetencji, wiec ida pierwsze.
    expect(order[0]).toContain('DELETE FROM attempts');
    for (const tabela of [
      'attempts',
      'missions',
      'skill_states',
      'plans',
      'preferences',
      'lesson_progress',
      'card_states',
    ]) {
      expect(order.some((s) => s.includes(`DELETE FROM ${tabela}`)), tabela).toBe(true);
    }
  });
});

describe('usuwanie i kopie (sek. 12)', () => {
  it('czyszczenie danych nie dotyka kopii bezpieczenstwa', async () => {
    await (await ready()).clear();
    const sqls = execute.mock.calls.map(([sql]) => String(sql));
    expect(sqls.some((q) => q.includes('backups'))).toBe(false);
  });

  it('identyfikatory ida jednym parametrem JSON, nie sklejone w SQL', async () => {
    const hostile = "a'); DROP TABLE attempts; --";
    await (await ready()).deleteRecords({
      attemptIds: [hostile, 'a-2'],
      missionIds: [],
      skillIds: ['s-1'],
      dropPlanSubjects: [],
    });

    const calls = execute.mock.calls.map(([sql, params]) => ({ sql: String(sql), params }));
    const attempts = calls.find((c) => c.sql.includes('DELETE FROM attempts'));
    expect(attempts?.sql).toContain('json_each($1)');
    expect(attempts?.sql).not.toContain(hostile);
    expect(attempts?.params).toEqual([JSON.stringify([hostile, 'a-2'])]);
    // Umiejetnosc zabiera ze soba lekcje i fiszki.
    for (const tabela of ['skill_states', 'lesson_progress', 'card_states']) {
      const call = calls.find((c) => c.sql.includes(`DELETE FROM ${tabela}`));
      expect(call?.params, tabela).toEqual([JSON.stringify(['s-1'])]);
    }
    // Pusta lista nie generuje zapytania; plan zostaje.
    expect(calls.some((c) => c.sql.includes('DELETE FROM missions'))).toBe(false);
    expect(calls.some((c) => c.sql.includes('DELETE FROM plans'))).toBe(false);
  });

  it('plan znika tylko dla wskazanych przedmiotow', async () => {
    await (await ready()).deleteRecords({ attemptIds: [], missionIds: [], skillIds: [], dropPlanSubjects: ['cs'] });
    const calls = execute.mock.calls.map(([sql, params]) => ({ sql: String(sql), params }));
    const plans = calls.find((c) => c.sql.includes('DELETE FROM plans'));
    expect(plans?.sql).toContain('subject_id IN (SELECT value FROM json_each($1))');
    expect(plans?.params).toEqual([JSON.stringify(['cs'])]);
  });

  it('kopia zapisuje pelny eksport i przycina stare kopie', async () => {
    const info = await (await ready()).saveBackup('przed importem');
    const calls = execute.mock.calls.map(([sql, params]) => ({ sql: String(sql), params: params as unknown[] }));

    const insert = calls.find((c) => c.sql.includes('INSERT INTO backups'));
    expect(insert?.params[0]).toBe(info.id);
    expect(insert?.params[2]).toBe('przed importem');
    expect(JSON.parse(String(insert?.params[5]))).toMatchObject({ version: 1 });

    const prune = calls.find((c) => c.sql.includes('DELETE FROM backups'));
    expect(prune?.params).toEqual([5]);
  });

  it('uszkodzona kopia w bazie konczy sie jawnym bledem walidacji', async () => {
    const { SnapshotValidationError } = await import('./storage-port');
    select.mockResolvedValueOnce([{ snapshot: '{nie json' }]);
    await expect((await ready()).loadBackup('b-1')).rejects.toThrow(SnapshotValidationError);
  });

  it('kompaktowanie fizycznie usuwa skasowane dane z pliku i dziennika', async () => {
    await (await ready()).compact();
    const sqls = execute.mock.calls.map(([sql]) => String(sql));
    expect(sqls).toEqual(['VACUUM', 'PRAGMA wal_checkpoint(TRUNCATE)']);
  });
});

describe('plan i preferencje', () => {
  it('wczytuje wylacznie aktywne plany, najnowszy na przedmiot', async () => {
    const row = {
      id: 'p-1',
      variant: 'realistic',
      created_at: 100,
      deadline: 200,
      targets: '[{"skillId":"s-1","targetLevel":3}]',
      diagnosis_snapshot: '[{"skillId":"s-1","level":1}]',
      active: 1,
      subject_id: 'math',
    };
    // Zapytanie sortuje od najnowszego - pierwszy wiersz przedmiotu wygrywa.
    select.mockResolvedValueOnce([
      { ...row, id: 'p-cs', created_at: 300, subject_id: 'cs' },
      row,
      { ...row, id: 'p-stary', created_at: 50 },
    ]);

    const plans = await (await ready()).loadPlans();
    const [sql] = select.mock.calls[0] ?? [];
    expect(String(sql)).toContain('active = 1');
    expect(String(sql)).toContain('ORDER BY created_at DESC');
    expect(plans.map((p) => [p.id, p.subjectId])).toEqual([
      ['p-cs', 'cs'],
      ['p-1', 'math'],
    ]);
    const math = plans[1];
    expect(math?.variant).toBe('realistic');
    expect(math?.targets).toEqual([{ skillId: 's-1', targetLevel: 3 }]);
    expect(math?.diagnosisSnapshot).toEqual([{ skillId: 's-1', level: 1 }]);
  });

  it('brak planu to pusta lista, nie blad', async () => {
    select.mockResolvedValueOnce([]);
    expect(await (await ready()).loadPlans()).toEqual([]);
  });

  it('zapis nowego planu dezaktywuje poprzedni tego przedmiotu zamiast go kasowac', async () => {
    await (await ready()).savePlan({
      id: 'p-2',
      variant: 'minimum',
      createdAt: 1,
      deadline: null,
      targets: [],
      diagnosisSnapshot: [],
      subjectId: 'biz',
    });
    const calls = execute.mock.calls.map(([sql, params]) => ({ sql: String(sql), params: params as unknown[] }));
    expect(calls[0]?.sql).toContain('UPDATE plans SET active = 0 WHERE active = 1 AND subject_id = $1');
    expect(calls[0]?.params).toEqual(['biz']);
    expect(calls[1]?.sql).toContain('INSERT INTO plans');
    expect(calls[1]?.params.at(-1)).toBe('biz');
    expect(calls.some((c) => c.sql.includes('DELETE FROM plans'))).toBe(false);
  });

  it('plan bez przedmiotu (sprzed migracji 006) trafia do matematyki', async () => {
    await (await ready()).savePlan({
      id: 'p-3',
      variant: 'minimum',
      createdAt: 1,
      deadline: null,
      targets: [],
      diagnosisSnapshot: [],
    });
    const [, params] = execute.mock.calls[0] ?? [];
    expect(params).toEqual(['math']);
  });

  it('uszkodzony JSON w planie nie wywraca wczytywania profilu', async () => {
    select.mockResolvedValueOnce([
      {
        id: 'p-1',
        variant: 'minimum',
        created_at: 1,
        deadline: null,
        targets: 'to nie jest json',
        diagnosis_snapshot: '{}',
        active: 1,
        subject_id: 'math',
      },
    ]);
    const [plan] = await (await ready()).loadPlans();
    expect(plan?.targets).toEqual([]);
    expect(plan?.diagnosisSnapshot).toEqual([]);
  });

  it('preferencja jest zapisywana przez upsert, nie duplikowana', async () => {
    await (await ready()).setPreference('dayMode', 'standard');
    const [sql, params] = execute.mock.calls[0] ?? [];
    expect(String(sql)).toContain('ON CONFLICT (key) DO UPDATE');
    expect(params).toEqual(['dayMode', 'standard']);
  });
});

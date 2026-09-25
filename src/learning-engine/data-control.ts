import type { Attempt, Mission, MissionKind, Question, Skill } from '@/data/types';
import type { RecordSelection } from '@/data/storage-port';
import { ATTEMPTS, EXAM_RESULTS, MISSIONS, count } from './polish';

/**
 * Kontrola nad danymi — Blueprint sek. 12.
 *
 * „Eksport do jawnego JSON/CSV" oraz „możliwość usunięcia pojedynczej sesji,
 * całego przedmiotu lub wszystkich danych". Ten moduł wylicza, CO dokładnie
 * zostanie usunięte, zanim cokolwiek zostanie usunięte — ekran usuwania
 * pokazuje te liczby przed potwierdzeniem.
 */

export type DeletionTarget =
  | { kind: 'mission'; missionId: string }
  | { kind: 'subject'; skillIds: string[]; label: string; subjectId?: string }
  | { kind: 'all' };

export interface DeletionPlan extends RecordSelection {
  /** Zdanie opisujące skutek — pokazywane przed potwierdzeniem. */
  summary: string;
}

export interface DataSnapshot {
  attempts: Attempt[];
  missions: Mission[];
  /** Id kompetencji, które mają zapisany stan. */
  skillIdsWithState: string[];
  /** Aktywne plany: przedmiot i kompetencje, na które celuje; pusta lista, gdy planów nie ma. */
  plans: Array<{ subjectId: string; skillIds: string[] }>;
  /** Wyniki arkuszy CKE; brak pola = brak wyników. */
  examResults?: Array<{ id: string; subjectId: string }>;
}

export function planDeletion(target: DeletionTarget, data: DataSnapshot): DeletionPlan {
  const exams = data.examResults ?? [];
  if (target.kind === 'all') {
    return {
      attemptIds: data.attempts.map((a) => a.id),
      missionIds: data.missions.map((m) => m.id),
      skillIds: [...data.skillIdsWithState],
      dropPlanSubjects: data.plans.map((p) => p.subjectId),
      examResultIds: exams.map((e) => e.id),
      summary: `Wszystkie dane: ${count(data.missions.length, MISSIONS)}, ${count(data.attempts.length, ATTEMPTS)} i stan ${data.skillIdsWithState.length} kompetencji${exams.length > 0 ? `, a także ${count(exams.length, EXAM_RESULTS)}` : ''}.`,
    };
  }

  if (target.kind === 'mission') {
    const attempts = data.attempts.filter((a) => a.missionId === target.missionId);
    const saved = data.missions.some((m) => m.id === target.missionId);
    // Sesja przerwana ma próby, ale nie ma rekordu misji - też jest sesją.
    const exists = saved || attempts.length > 0;
    return {
      attemptIds: attempts.map((a) => a.id),
      missionIds: saved ? [target.missionId] : [],
      // Stan kompetencji zostaje: jest wynikiem wielu sesji, a nie jednej.
      skillIds: [],
      // Plan to decyzja użytkownika podjęta na podstawie diagnozy - usunięcie
      // jednej sesji jej nie cofa.
      dropPlanSubjects: [],
      examResultIds: [],
      summary: exists
        ? `Jedna sesja i jej ${count(attempts.length, ATTEMPTS)}. Poziomy kompetencji zostają bez zmian.`
        : 'Taka sesja nie istnieje.',
    };
  }

  const skills = new Set(target.skillIds);
  const attempts = data.attempts.filter((a) => skills.has(a.skillId));
  const touchedMissions = new Set(attempts.map((a) => a.missionId));

  // Misja znika tylko wtedy, gdy WSZYSTKIE jej próby należą do przedmiotu.
  // Misja mieszana zostaje - usunięcie jej skasowałoby cudzy przedmiot.
  const missionIds = data.missions
    .filter((m) => touchedMissions.has(m.id))
    .filter((m) =>
      data.attempts.filter((a) => a.missionId === m.id).every((a) => skills.has(a.skillId)),
    )
    .map((m) => m.id);

  const skillIds = data.skillIdsWithState.filter((id) => skills.has(id));
  // Plan zbudowany z wyników tego przedmiotu traci podstawę razem z nimi.
  // Plany innych przedmiotów zostają.
  const dropPlanSubjects = data.plans
    .filter((p) => p.skillIds.some((id) => skills.has(id)))
    .map((p) => p.subjectId);
  const examResultIds = target.subjectId
    ? exams.filter((e) => e.subjectId === target.subjectId).map((e) => e.id)
    : [];

  return {
    attemptIds: attempts.map((a) => a.id),
    missionIds,
    skillIds,
    dropPlanSubjects,
    examResultIds,
    summary: `Przedmiot „${target.label}": ${count(attempts.length, ATTEMPTS)}, ${count(missionIds.length, MISSIONS)} i stan ${skillIds.length} kompetencji${examResultIds.length > 0 ? `, ${count(examResultIds.length, EXAM_RESULTS)}` : ''}${dropPlanSubjects.length > 0 ? ', a także plan nauki' : ''}.`,
  };
}

export interface SessionEntry {
  id: string;
  title: string;
  /** null dla sesji przerwanej, która nie zapisała rekordu misji. */
  kind: MissionKind | null;
  startedAt: number;
  attempts: number;
}

/**
 * Lista sesji do usuwania: zapisane misje oraz sesje przerwane w połowie.
 * Misja trafia do bazy dopiero przy zamknięciu, a próby - od razu, więc
 * przerwana sesja zostawia same próby. Bez tej listy nie dałoby się jej
 * usunąć inaczej niż razem z całym przedmiotem.
 */
export function listSessions(data: DataSnapshot): SessionEntry[] {
  const counts = new Map<string, { n: number; first: number }>();
  for (const a of data.attempts) {
    const c = counts.get(a.missionId);
    if (c) {
      c.n += 1;
      c.first = Math.min(c.first, a.startedAt);
    } else {
      counts.set(a.missionId, { n: 1, first: a.startedAt });
    }
  }

  const saved = data.missions.map((m) => ({
    id: m.id,
    title: m.title,
    kind: m.kind,
    startedAt: m.startedAt,
    attempts: counts.get(m.id)?.n ?? 0,
  }));
  const savedIds = new Set(saved.map((s) => s.id));
  const interrupted = [...counts.entries()]
    .filter(([id]) => !savedIds.has(id))
    .map(([id, c]) => ({
      id,
      title: 'Sesja przerwana',
      kind: null,
      startedAt: c.first,
      attempts: c.n,
    }));

  return [...saved, ...interrupted].sort((a, b) => b.startedAt - a.startedAt);
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/**
 * Separator średnik: polska wersja Excela i LibreOffice używa przecinka jako
 * separatora dziesiętnego, więc przecinek rozbijałby liczby na kolumny.
 */
export const CSV_SEPARATOR = ';';

/** BOM, żeby Excel rozpoznał UTF-8 i nie zepsuł polskich znaków. */
export const CSV_BOM = String.fromCharCode(0xfeff);

const CSV_COLUMNS = [
  'data',
  'przedmiot_kompetencja',
  'pytanie_id',
  'odpowiedz',
  'wynik',
  'pewnosc',
  'podpowiedz_szczebel',
  'blad',
  'czas_s',
  'misja_id',
] as const;

/**
 * Ochrona przed wstrzyknięciem formuł: komórka zaczynająca się od =, +, -, @
 * albo tabulatora jest w arkuszu wykonywana jako formuła. Odpowiedź ucznia
 * „-4" to liczba, ale „=HYPERLINK(...)" to już polecenie dla arkusza.
 */
function neutralise(value: string): string {
  if (/^-?\d+(?:[.,]\d+)?$/.test(value)) return value; // zwykła liczba, także ujemna
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function cell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const text = neutralise(raw);
  return /["\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function attemptsToCsv(attempts: Attempt[], skills: Skill[], questions: Question[]): string {
  const skillName = new Map(skills.map((s) => [s.id, s.name]));
  const known = new Set(questions.map((q) => q.id));

  const rows = [...attempts]
    .sort((a, b) => a.answeredAt - b.answeredAt)
    .map((a) =>
      [
        new Date(a.answeredAt).toISOString(),
        skillName.get(a.skillId) ?? a.skillId,
        known.has(a.questionId) ? a.questionId : `${a.questionId} (usuniete z tresci)`,
        a.userAnswer,
        a.correctness,
        a.confidence,
        a.hintLevel,
        a.errorId ?? '',
        Math.max(0, Math.round((a.answeredAt - a.startedAt) / 1000)),
        a.missionId,
      ]
        .map(cell)
        .join(CSV_SEPARATOR),
    );

  return CSV_BOM + [CSV_COLUMNS.join(CSV_SEPARATOR), ...rows].join('\r\n');
}

/** Nazwa pliku eksportu z datą — bez dwukropków, które Windows odrzuca. */
export function exportFileName(kind: 'json' | 'csv', now: number): string {
  const stamp = new Date(now).toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `forge-${kind === 'json' ? 'kopia' : 'proby'}-${stamp}.${kind}`;
}

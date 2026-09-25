import { mathPlan, type SnapshotV1 } from '@/data/storage-port';
import { planSubject, type CardState, type SavedPlan, type SkillState } from '@/data/types';

/**
 * Synchronizacja dwóch urządzeń przez plik (np. komputer i telefon).
 *
 * FORGE nie ma konta w chmurze ani serwera — dane zostają na urządzeniach.
 * Żeby pracować na dwóch, eksportujesz kopię na jednym i ŁĄCZYSZ ją z danymi
 * na drugim (a potem odwrotnie). Łączenie nie gubi niczego, co powstało na
 * którymkolwiek urządzeniu:
 *
 * - odpowiedzi, misje, wyniki arkuszy i ukończone lekcje — suma po
 *   identyfikatorach (ten sam rekord z dwóch urządzeń liczy się raz),
 * - stan umiejętności — ten z nowszą ostatnią odpowiedzią (przy remisie
 *   lokalny, ale z wcześniejszym terminem powtórki, żeby powtórka
 *   zaplanowana na drugim urządzeniu nie przepadła),
 * - stan fiszki — ten z większą liczbą powtórek (przy remisie nowszy),
 * - ustawienia i plany — lokalne (to ustawienia tego urządzenia);
 *   z pliku bierzemy tylko to, czego tu brakuje (np. plan przedmiotu,
 *   którego diagnozę zrobiono tylko na drugim urządzeniu).
 *
 * Funkcja jest czysta: nie zapisuje niczego, zwraca nowy snapshot i raport.
 */

export interface MergeReport {
  attemptsAdded: number;
  missionsAdded: number;
  examResultsAdded: number;
  lessonsAdded: number;
  skillsUpdated: number;
  cardsUpdated: number;
}

function unionById<T>(local: T[], incoming: T[], key: (x: T) => string, prefer?: (a: T, b: T) => T): { items: T[]; added: number } {
  const byKey = new Map(local.map((x) => [key(x), x]));
  let added = 0;
  for (const x of incoming) {
    const k = key(x);
    const mine = byKey.get(k);
    if (mine === undefined) {
      byKey.set(k, x);
      added += 1;
    } else if (prefer) {
      byKey.set(k, prefer(mine, x));
    }
  }
  return { items: [...byKey.values()], added };
}

/** Kopie sprzed planów na przedmiot mają tylko `plan` (matematyki). */
function plansOf(s: SnapshotV1): SavedPlan[] {
  return s.plans ?? (s.plan ? [s.plan] : []);
}

function earlierDue(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

/** Który stan umiejętności zostaje. Zwraca `local`, jeśli nic się nie zmienia. */
export function pickSkillState(local: SkillState, incoming: SkillState): SkillState {
  const l = local.lastAttemptAt ?? -1;
  const r = incoming.lastAttemptAt ?? -1;
  if (r > l) return incoming;
  if (r < l) return local;
  const due = earlierDue(local.reviewDueAt, incoming.reviewDueAt);
  return due === local.reviewDueAt ? local : { ...local, reviewDueAt: due };
}

/** Który stan fiszki zostaje: więcej powtórek, przy remisie nowsza powtórka. */
export function pickCardState(local: CardState, incoming: CardState): CardState {
  if (incoming.reviews !== local.reviews) return incoming.reviews > local.reviews ? incoming : local;
  return (incoming.lastReviewedAt ?? -1) > (local.lastReviewedAt ?? -1) ? incoming : local;
}

export function mergeSnapshots(local: SnapshotV1, incoming: SnapshotV1, now: number): { merged: SnapshotV1; report: MergeReport } {
  const attempts = unionById(local.attempts, incoming.attempts, (a) => a.id);
  const missions = unionById(local.missions, incoming.missions, (m) => m.id, (mine, theirs) =>
    mine.finishedAt === null && theirs.finishedAt !== null ? theirs : mine,
  );
  const exams = unionById(local.examResults ?? [], incoming.examResults ?? [], (e) => e.id);
  const lessons = unionById(local.lessonProgress ?? [], incoming.lessonProgress ?? [], (l) => l.skillId, (mine, theirs) =>
    theirs.completedAt < mine.completedAt ? theirs : mine,
  );

  let skillsUpdated = 0;
  const skills = unionById(local.skillStates, incoming.skillStates, (s) => s.skillId, (mine, theirs) => {
    const chosen = pickSkillState(mine, theirs);
    if (chosen !== mine) skillsUpdated += 1;
    return chosen;
  });

  let cardsUpdated = 0;
  const cards = unionById(local.cardStates ?? [], incoming.cardStates ?? [], (c) => c.cardId, (mine, theirs) => {
    const chosen = pickCardState(mine, theirs);
    if (chosen !== mine) cardsUpdated += 1;
    return chosen;
  });

  const preferences = unionById(local.preferences ?? [], incoming.preferences ?? [], (p) => p.key).items;
  const plans = unionById(plansOf(local), plansOf(incoming), planSubject).items;

  const merged: SnapshotV1 = {
    version: local.version,
    exportedAt: now,
    skillStates: skills.items,
    attempts: attempts.items.sort((a, b) => a.answeredAt - b.answeredAt),
    missions: missions.items.sort((a, b) => a.startedAt - b.startedAt),
    plans,
    plan: mathPlan(plans),
    preferences,
    lessonProgress: lessons.items,
    cardStates: cards.items,
    examResults: exams.items.sort((a, b) => a.takenAt - b.takenAt),
  };

  return {
    merged,
    report: {
      attemptsAdded: attempts.added,
      missionsAdded: missions.added,
      examResultsAdded: exams.added,
      lessonsAdded: lessons.added,
      // Nowa umiejętność z drugiego urządzenia to też aktualizacja stanu.
      skillsUpdated: skillsUpdated + skills.added,
      cardsUpdated: cardsUpdated + cards.added,
    },
  };
}

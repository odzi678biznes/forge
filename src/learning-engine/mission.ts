import type { Mission, MissionKind, Skill, SkillState } from '@/data/types';
import { MasteryLevel } from '@/data/types';
import { isDue } from './review';

/**
 * Rekomendacja misji - Blueprint sek. 7.1.
 *
 * Ekran startowy pokazuje JEDNA rekomendacje plus dwie alternatywy, nigdy
 * listy zaleglosci. Kazda rekomendacja niesie uzasadnienie, bo sek. 17 stawia
 * warunek: uzytkownik ma umiec wyjasnic, dlaczego dostal wlasnie to.
 */

/**
 * Blueprint sek. 3: misja to 8-15 minut, o z gory znanej liczbie pytan.
 *
 * Diagnoza jest tu swiadomie pominieta: jej dlugosc rowna sie liczbie
 * kompetencji w korpusie, wiec wynika z tresci, a nie ze stalej. Wpisanie
 * tu zera byloby wartoscia klamiaca o tym, ze misja nie ma pytan.
 */
export type FixedLengthMission = Exclude<MissionKind, 'diagnostic'>;

export const MISSION_LENGTHS: Record<FixedLengthMission, number> = {
  warmup: 3,
  training: 5,
  'mixed-patrol': 8,
  repair: 5,
  boss: 1,
  'time-trial': 6,
  comeback: 5,
};

export interface MissionPlan {
  kind: MissionKind;
  title: string;
  rationale: string;
  questionCount: number;
  /** Kompetencja wskazana przez uzytkownika z mapy albo z dziennika bledow. */
  focusSkillId?: string;
  /**
   * Budzet czasu na cala misje w ms. Ustawiany WYLACZNIE dla prob czasowych,
   * ktore uzytkownik wybiera sam (sek. 4.3). Blueprint sek. 14 zakazuje
   * sztucznej presji czasu, wiec zwykle misje nie maja limitu.
   */
  timeLimitMs?: number;
}

/** Ile sekund na zadanie otwarte w warunkach egzaminacyjnych. */
export const SECONDS_PER_EXAM_QUESTION = 90;

/**
 * Proba czasowa - Blueprint sek. 4.3 i 7.5.
 *
 * To jedyna misja z licznikiem czasu i jedyna, ktora uzytkownik uruchamia
 * swiadomie po to, zeby poczuc presje arkusza. Uplyw czasu KONCZY misje,
 * ale nie zeruje wynikow i nie odbiera niczego, co zostalo juz zrobione.
 */
export function timeTrial(): MissionPlan {
  const count = MISSION_LENGTHS['time-trial'];
  return {
    kind: 'time-trial',
    title: 'Próba czasowa',
    rationale: `${count} zadań w warunkach arkusza. Licznik kończy misję, ale nie kasuje tego, co już rozwiązałeś.`,
    questionCount: count,
    timeLimitMs: count * SECONDS_PER_EXAM_QUESTION * 1000,
  };
}

/** Ile zadań po lekcji - od fundamentu do zadania maturalnego. */
export const PRACTICE_LENGTH = 6;

/**
 * Ćwiczenia po lekcji. Selektor zaczyna od łatwych zadań i podnosi trudność
 * po sukcesach, a po błędzie wraca do fundamentu - to jest "nie na głęboką
 * wodę, ale też nie same banały".
 */
export function practiceFor(skill: Skill): MissionPlan {
  return {
    kind: 'training',
    title: `Ćwiczenia: ${skill.name}`,
    rationale:
      'Po lekcji: zadania od łatwych do maturalnych. Trudność rośnie, gdy idzie Ci dobrze, i spada po błędzie.',
    questionCount: PRACTICE_LENGTH,
    focusSkillId: skill.id,
  };
}

/** Misja z klikniecia w wezel mapy kompetencji (sek. 7.3). */
export function trainingFor(skill: Skill, level: number): MissionPlan {
  return {
    kind: 'training',
    title: skill.name,
    rationale: `Wybrana z mapy. Obecny poziom: ${level} z 5.`,
    questionCount: MISSION_LENGTHS.training,
    focusSkillId: skill.id,
  };
}

/** Misja z przycisku "Napraw teraz" w laboratorium bledow (sek. 7.4). */
export function repairFor(skill: Skill, cause: string): MissionPlan {
  return {
    kind: 'repair',
    title: 'Naprawa',
    rationale: `${cause} Zaczynamy od fundamentu tej kompetencji.`,
    questionCount: MISSION_LENGTHS.repair,
    focusSkillId: skill.id,
  };
}

export interface PlanningInput {
  skills: Skill[];
  states: Map<string, SkillState>;
  now: number;
  /** Ile dni minelo od ostatniej sesji; null przy pierwszym uruchomieniu. */
  daysSinceLastSession: number | null;
}

/** Po ilu opuszczonych dniach uruchamiamy protokol powrotu (sek. 15, Etap 5). */
export const COMEBACK_THRESHOLD_DAYS = 3;

export function recommendMission(input: PlanningInput): MissionPlan {
  const { skills, states, now, daysSinceLastSession } = input;

  const touched = skills.filter((s) => (states.get(s.id)?.totalAttempts ?? 0) > 0);
  const due = skills.filter((s) => {
    const st = states.get(s.id);
    return st ? isDue(st, now) : false;
  });
  const withErrors = skills.filter(
    (s) => (states.get(s.id)?.recentErrors.length ?? 0) > 0,
  );

  // Powrot po przerwie ma pierwszenstwo: krotka misja bez nadrabiania zaleglosci.
  // Blueprint sek. 14 zakazuje karania za przerwe - to jest wejscie, nie kara.
  if (daysSinceLastSession !== null && daysSinceLastSession >= COMEBACK_THRESHOLD_DAYS) {
    return plan('comeback', 'Powrót', [
      `Przerwa ${daysSinceLastSession} dni.`,
      'Krótka sesja na rozruch — bez nadrabiania zaległości.',
    ]);
  }

  // Pierwsze uruchomienie: nie zaczynamy od pelnego treningu.
  if (touched.length === 0) {
    return plan('warmup', 'Rozgrzewka', [
      'Pierwsze uruchomienie.',
      'Trzy krótkie pytania, żeby ustalić punkt wyjścia.',
    ]);
  }

  if (due.length > 0) {
    return plan('training', 'Powtórka', [
      due.length === 1
        ? 'Jedna umiejętność czeka na zaplanowaną powtórkę.'
        : `Umiejętności czekające na zaplanowaną powtórkę: ${due.length}.`,
      'Pamięć po odstępie czasu jest ważniejsza niż nowy materiał.',
    ]);
  }

  if (withErrors.length > 0) {
    const first = withErrors[0];
    return plan('repair', 'Naprawa', [
      `Powtarzający się błąd: ${first?.name ?? 'umiejętność z dziennika błędów'}.`,
      'Seria z dziennika błędów, od fundamentu w górę.',
    ]);
  }

  const weakest = pickWeakest(skills, states);
  return plan('training', 'Trening', [
    weakest ? `Najniżej oceniona umiejętność: ${weakest.name}.` : 'Bieżący cel.',
    'Pięć pytań, rosnąca trudność.',
  ]);
}

/** Dwie alternatywy z sek. 7.1: krotsza wersja i zmiana charakteru pracy. */
export function alternatives(recommended: MissionPlan): MissionPlan[] {
  const shorter: MissionPlan = {
    kind: 'warmup',
    title: 'Wersja minimum',
    rationale: 'Masz mało czasu — trzy pytania i wyraźny koniec.',
    questionCount: MISSION_LENGTHS.warmup,
  };

  const other: MissionPlan =
    recommended.kind === 'repair'
      ? {
          kind: 'training',
          title: 'Zwykły trening',
          rationale: 'Wolisz iść do przodu niż naprawiać — to też jest wybór.',
          questionCount: MISSION_LENGTHS.training,
        }
      : {
          kind: 'mixed-patrol',
          title: 'Mieszany patrol',
          rationale: 'Przeplatane typy zadań z całego działu.',
          questionCount: MISSION_LENGTHS['mixed-patrol'],
        };

  return [shorter, other];
}

export function startMission(plan: MissionPlan, id: string, now: number): Mission {
  return {
    id,
    kind: plan.kind,
    title: plan.title,
    rationale: plan.rationale,
    questionIds: [],
    startedAt: now,
    finishedAt: null,
  };
}

function plan(kind: FixedLengthMission, title: string, rationale: string[]): MissionPlan {
  return {
    kind,
    title,
    rationale: rationale.join(' '),
    questionCount: MISSION_LENGTHS[kind],
  };
}

function pickWeakest(
  skills: Skill[],
  states: Map<string, SkillState>,
): Skill | undefined {
  return [...skills].sort((a, b) => {
    const la = states.get(a.id)?.level ?? MasteryLevel.Unknown;
    const lb = states.get(b.id)?.level ?? MasteryLevel.Unknown;
    if (la !== lb) return la - lb;
    // Przy remisie decyduje wartosc maturalna.
    return b.examValue - a.examValue;
  })[0];
}

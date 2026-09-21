import {
  MasteryLevel,
  type Question,
  type Skill,
  type SkillState,
} from '@/data/types';
import { isDue } from './review';
import {
  INTERLEAVE_WINDOW,
  explain,
  scoreSkill,
  type PriorityBreakdown,
  type PriorityContext,
} from './priority';
import { INDEPENDENT_STREAK_FOR_LEVEL_3 } from './mastery';

/**
 * Dobor kolejnego pytania - Blueprint sek. 6.
 *
 * Kolejnosc regul jest twarda i sprawdzana od gory. Priorytet liczbowy
 * rozstrzyga dopiero wewnatrz reguly, nigdy ponad nia - dzieki temu
 * odpowiedz na pytanie "dlaczego akurat to?" jest zawsze jednozdaniowa.
 */

export interface SelectionInput {
  skills: Skill[];
  states: Map<string, SkillState>;
  questions: Question[];
  /** Id pytan juz zadanych w tej misji - nie powtarzamy ich. */
  askedQuestionIds: Set<string>;
  /** Kompetencje z ostatnich prob, od najnowszej. */
  recentSkillIds: string[];
  now: number;
}

export type SelectionRule =
  | 'review-due'
  | 'main-gap'
  | 'transfer-check'
  | 'foundation-repair'
  | 'interleave'
  | 'fallback';

export interface Selection {
  question: Question;
  skill: Skill;
  rule: SelectionRule;
  breakdown: PriorityBreakdown;
  /** Zdania pokazywane uzytkownikowi na zadanie "dlaczego to pytanie". */
  reasons: string[];
}

const RULE_LABELS: Record<SelectionRule, string> = {
  'review-due': 'Zaplanowana powtorka.',
  'main-gap': 'Glowna luka w biezacym temacie.',
  'transfer-check': 'Dwa sukcesy z rzedu - sprawdzam transfer.',
  'foundation-repair': 'Cofam sie o poziom do fundamentu.',
  interleave: 'Przeplatanie - trzy zadania tego samego typu z rzedu.',
  fallback: 'Kolejne zadanie z biezacego celu.',
};

export function selectNextQuestion(input: SelectionInput): Selection | null {
  const { skills, states, questions, askedQuestionIds, recentSkillIds, now } = input;
  const ctx: PriorityContext = { now, recentSkillIds };

  const available = questions.filter((q) => !askedQuestionIds.has(q.id));
  if (available.length === 0) return null;

  const stateOf = (skillId: string): SkillState | undefined => states.get(skillId);
  const ranked = [...skills]
    .map((skill) => {
      const state = stateOf(skill.id);
      return state ? { skill, state, breakdown: scoreSkill(skill, state, ctx) } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.breakdown.total - a.breakdown.total);

  const pick = (
    rule: SelectionRule,
    entry: (typeof ranked)[number],
    question: Question | undefined,
  ): Selection | null =>
    question
      ? {
          question,
          skill: entry.skill,
          rule,
          breakdown: entry.breakdown,
          reasons: [RULE_LABELS[rule], ...explain(entry.breakdown)],
        }
      : null;

  // Regula 6 ma pierwszenstwo nad wyborem tematu: jesli ostatnie trzy proby
  // dotyczyly tej samej kompetencji, wymuszamy zmiane niezaleznie od punktacji.
  const overused = consecutiveSkillId(recentSkillIds, INTERLEAVE_WINDOW);

  // 1. Powtorki wymagalne.
  for (const entry of ranked) {
    if (entry.skill.id === overused) continue;
    if (!isDue(entry.state, now)) continue;
    const q = bestFor(available, entry.skill.id, entry.state, 'typical');
    const sel = pick('review-due', entry, q);
    if (sel) return sel;
  }

  // 2-4. Najwyzej punktowana kompetencja, ale rodzaj zadania zalezy od stanu.
  for (const entry of ranked) {
    if (entry.skill.id === overused) continue;

    // 4. Po dwoch samodzielnych sukcesach sprawdzamy transfer.
    if (
      entry.state.independentStreak >= INDEPENDENT_STREAK_FOR_LEVEL_3 &&
      entry.state.level >= MasteryLevel.Independent
    ) {
      const q = bestFor(available, entry.skill.id, entry.state, 'transfer');
      const sel = pick('transfer-check', entry, q);
      if (sel) return sel;
    }

    // 5. Swiezy blad bez pomocy - wracamy do fundamentu tej kompetencji,
    //    nie obnizamy calego dzialu.
    if (entry.state.recentErrors.length > 0 && entry.state.independentStreak === 0) {
      const q = bestFor(available, entry.skill.id, entry.state, 'foundation');
      const sel = pick('foundation-repair', entry, q);
      if (sel) return sel;
    }

    // 2/3. Glowna luka - typowe zadanie na miare obecnego poziomu.
    const q = bestFor(available, entry.skill.id, entry.state, 'typical');
    const sel = pick('main-gap', entry, q);
    if (sel) return sel;
  }

  // 6. Wszystko powyzej odpadlo przez przeplatanie - bierzemy cokolwiek innego.
  const other = ranked.find((e) => e.skill.id !== overused) ?? ranked[0];
  if (other) {
    const q = available.find((x) => x.skillId === other.skill.id) ?? available[0];
    const sel = pick(overused ? 'interleave' : 'fallback', other, q);
    if (sel) return sel;
  }

  return null;
}

/**
 * Wybiera pytanie danego rodzaju dla kompetencji, celujac w trudnosc tuz przy
 * obecnym poziomie - wyzwanie dopasowane do umiejetnosci (sek. 1), nie
 * najtrudniejsze dostepne.
 */
function bestFor(
  available: Question[],
  skillId: string,
  state: SkillState,
  kind: Question['kind'],
): Question | undefined {
  const pool = available.filter((q) => q.skillId === skillId && q.kind === kind);
  if (pool.length === 0) return undefined;

  const target = targetDifficulty(state.level);
  return pool.reduce((best, q) =>
    Math.abs(q.difficulty - target) < Math.abs(best.difficulty - target) ? q : best,
  );
}

function targetDifficulty(level: MasteryLevel): number {
  // Poziom 0-1 -> latwe fundamenty, 5 -> pelne zadanie maturalne.
  return Math.min(5, Math.max(1, level + 1));
}

/** Zwraca id kompetencji, jesli zajmuje ona `n` ostatnich pozycji z rzedu. */
function consecutiveSkillId(recent: string[], n: number): string | null {
  if (recent.length < n) return null;
  const head = recent[0];
  if (head === undefined) return null;
  for (let i = 1; i < n; i += 1) {
    if (recent[i] !== head) return null;
  }
  return head;
}
